# Show day

Written for the field, not for the desk. Everything here is meant to be
done on a phone or a laptop with one bar of signal, in order, while people
are waiting. [DEPLOY.md](DEPLOY.md) explains how the machine is put
together; this is what to do when it stops behaving.

---

## 1. Is it actually broken? — 10 seconds, no laptop

Open this on your phone:

**<https://xcarshow.poligontech.ro/api/health>**

```json
{ "ok": true, "database": "up", "cars": 142, "commit": "e300453", "uptime": "6h 20m", "databaseReplyMs": 3 }
```

| What you see | What it means | Go to |
| --- | --- | --- |
| `"ok": true` | App and database are both fine. The problem is the phone in front of you, or the signal. | §5 |
| `"ok": false`, `"database": "down"` | The app is up; Postgres is not. | §3 |
| Page will not load at all | The app is down, or the whole box is. | §4 |
| `"cars"` far lower than it should be | The database answered — with the wrong data. **Stop and read §6 before touching anything.** | §6 |

`uptime` is worth a glance: a container that restarted four minutes ago
restarted for a reason. `commit` is what is actually serving, which is not
always what you last pushed.

> `commit` reads the `COMMIT_SHA` environment variable **on the container**.
> Until the deploy script sets it this says `unknown` — see §7. It is read
> at request time, so it needs no rebuild.

---

## 2. Somebody shows you a broken screen

If they see **"Ceva nu merge acum."** there is a line of small grey text
under it: `Cod: 3914836991`. That number is in the server log. Take it,
then:

```bash
docker logs x-car-show-live 2>&1 | grep 3914836991
```

That goes straight to the failing query and its cause. No guessing which
of the last two hundred requests was theirs.

A blank white page with English text is **not** ours — that is the browser
failing to reach the server at all. Treat it as §4.

---

## 3. The database is down

```bash
cd /opt/x-car-show
docker compose ps                 # is the db container even running?
docker compose up -d              # start it if not
docker compose logs --tail 50 db  # why it stopped, if it did
```

Then re-check `/api/health`. Postgres is deliberately **not** part of the
deploy, so restarting it does not touch the app and the app does not need
restarting after it — the next request just works.

If the disk is full — which is what usually kills it — the logs say so.
`docker system prune -f` buys room; old release images are the usual
culprit.

---

## 4. The app is down

```bash
docker ps | grep x-car-show-live          # running at all?
docker logs --tail 100 x-car-show-live    # why not
systemctl status x-car-show-deploy.timer  # is the deployer alive?
```

The pipeline health-checks every new container on `127.0.0.1:3100` and
keeps the previous one when the check fails, so **a bad deploy should not
be able to take the site down**. If the site is down anyway, the container
died after being promoted — read the log, then §5.

---

## 5. Put it back the way it was

The fastest honest fix under pressure is the last commit that worked.

```bash
git --git-dir=/opt/x-car-show/source.git log --oneline -5   # find it
```

From your laptop, in a checkout:

```bash
git revert --no-edit <bad-sha>
git push origin main
```

Then watch it land (§6). Reverting rather than force-pushing keeps the
history honest and keeps the deployer's fast-forward assumption intact.

**A revert restores the code, not the schema.** If the bad commit added a
migration, the rolled-back code meets the new schema. Additive migrations
survive that; a dropped or renamed column does not. Keep migrations
additive until after the show — this is why.

---

## 6. Ship a fix from the field

The whole loop, from your laptop:

```bash
# 1. change the code, then:
npm run typecheck && npm run lint
npm run build                     # catches what dev does not — see the note

# 2. ship it
git add -A && git commit -m "..."
git push origin main

# 3. watch it land (about 2 minutes)
ssh <server>
journalctl -u x-car-show-deploy.service -f
```

Then confirm what is actually serving:

```bash
curl -s https://xcarshow.poligontech.ro/api/health
```

`commit` in that response is the truth. If it still shows the old sha
after five minutes, the new container failed its health check and the
deployer kept the old one — which is the system working. Read
`journalctl` for the reason.

> **Run `npm run build`, not just `npm run dev`.** Stylesheet order is
> inverted between the two, so a CSS override that ties on specificity
> wins in dev and loses in the build. Buttons hung off the side of the
> phone that way and looked perfect on every machine they were checked on.

---

## 7. Before the gate opens

- [ ] `curl -s https://xcarshow.poligontech.ro/api/health` returns `ok: true`
      and a `cars` count you recognise
- [ ] Take a backup, and copy it **off the machine**:
      ```bash
      docker compose exec -T db pg_dump -U xcs xcarshow > backups/$(date -u +%Y%m%dT%H%M%SZ).sql
      ```
      The entry list is the one thing that cannot be recreated afterwards.
- [ ] Scan a printed card with a phone that has never opened the app, on
      mobile data rather than the wifi. That tests the QR code, the public
      origin and the cold-load weight in one go.
- [ ] Know your `ssh` line without looking it up. Save it somewhere that
      works with no signal.
- [ ] Worth ten minutes: make `/api/health` report the live commit. It is a
      plain environment variable on the container, read at request time, so
      there is no rebuild and no build arg. Find the deploy script:

      ```bash
      systemctl cat x-car-show-deploy.service      # ExecStart names the script
      ```

      In its `docker run`, add `-e COMMIT_SHA="$SHA"` — reusing whatever
      variable already feeds `--label org.opencontainers.image.revision=`,
      because the script is passing the sha there already. Then:

      ```bash
      curl -s https://xcarshow.poligontech.ro/api/health
      ```

      Until then, the sha is still readable the long way, with SSH:

      ```bash
      docker inspect x-car-show-live \
        --format '{{ index .Config.Labels "org.opencontainers.image.revision" }}'
      ```

---

## What cannot break the site

Worth knowing, so you do not fix things that are not broken:

- **A failed build** never reaches the server; the old container keeps serving.
- **A failed migration** exits non-zero before the server listens, the health
  check fails, and the previous container stays live.
- **A refused vote or follow** now says why on screen rather than silently
  undoing itself.
- **A dead or mistyped link** gets a Romanian page with a way back, not a
  blank screen.
- **A revoked session** stops working immediately, everywhere.
