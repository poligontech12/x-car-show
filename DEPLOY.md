# Deploying X Car Show

The server already deploys itself. `x-car-show-deploy.timer` polls GitHub
`main` every two minutes, builds an immutable release, health-checks it on
`127.0.0.1:3100`, and promotes it to port `3000` — rolling back to the
previous container if anything fails.

Nothing in this repository replaces that. What changed is that the app now
needs a database, which means two things the pipeline does not do on its
own: **Postgres has to be running beside it**, and **three environment
variables have to reach the build and the container**.

## Local

```bash
brew install postgresql@17 && brew services start postgresql@17
createdb xcarshow
cp .env.example .env.local        # then fill BETTER_AUTH_SECRET
npm ci
npm run db:deploy                 # apply migrations
npm run db:seed                   # the twelve demo builds — development only
npm run dev
```

`npm run db:seed` refuses a database that already has cars in it, and
refuses production outright. The demo roster is placeholder data and must
never be shown to real attendees as real entries.

Poke at the data directly — that is the point of Postgres here:

```bash
psql -d xcarshow -c 'select id, model, no, stand from cars order by no'
```

## Postgres on the server

This runs once and then stays out of the way. It is deliberately **not**
part of the deploy: the app container is replaced every time a commit
lands, and the database must survive all of that.

```bash
cd /opt/x-car-show          # anywhere outside the releases directory
mkdir -p backups

cat > .env <<EOF
POSTGRES_PASSWORD=$(openssl rand -base64 24)
EOF

docker compose up -d
```

That publishes Postgres on `172.17.0.1:5432` — the Docker bridge gateway,
reachable by any container on the default bridge network, not reachable
from the office LAN. Check it:

```bash
docker compose ps
docker compose exec db psql -U xcs -d xcarshow -c '\dt'
```

If the app container runs on a user-defined network rather than the default
bridge, add the `db` service to that network instead and use the host name
`x-car-show-db` in `DATABASE_URL`.

## The three variables

| Variable | Where it is needed | What it is |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | **build** and container | The public origin, baked into every printed QR code |
| `DATABASE_URL` | container only | `postgres://xcs:<POSTGRES_PASSWORD>@172.17.0.1:5432/xcarshow` |
| `BETTER_AUTH_SECRET` | container only | `openssl rand -base64 32`. Changing it signs everybody out |

`NEXT_PUBLIC_SITE_URL` is the awkward one, because it is needed **three
times**: by `npm run build`, by `docker build` as `--build-arg`, and by the
running container. Next inlines it at build time, so setting it only on the
container is too late.

A production build without it now **fails loudly** rather than defaulting
to localhost:

```
Error: NEXT_PUBLIC_SITE_URL is not set.
It is baked into this build and encoded into every printed QR code,
so a production build will not guess at it.
```

That is deliberate. A wrong value is invisible — the app works, the cards
look right, and every QR code points somewhere dead. It also tells Next
which origin server actions may come from, so a wrong value means every
save and vote fails in production while working perfectly on localhost.

### Reached at more than one address

The app answers on its public domain and on `http://192.168.1.25:3000`
inside the office. Better Auth checks the Origin header and Next checks
it again for server actions, so an address neither of them knows about
fails with **"Invalid origin"** — sign-up, sign-in, voting, all of it.

List the extras in `TRUSTED_ORIGINS`, comma-separated, no trailing slash:

```
TRUSTED_ORIGINS=http://192.168.1.25:3000
```

It is needed at build time as well as on the container, because Next
inlines the server-action origin list into the build — so the deploy
script has to pass it through as a build arg:

```bash
docker build --build-arg TRUSTED_ORIGINS="$TRUSTED_ORIGINS" ...
```

Setting it only on the container gets people signed in and then refuses
them at registering a car, with the same "Invalid origin".

## Migrations

The image applies them on start, before the server listens:

```
CMD ["sh", "-c", "node scripts/migrate.mjs && node server.js"]
```

So a migration that cannot apply exits non-zero, the new container never
passes its health check on `127.0.0.1:3100`, and the pipeline keeps the
previous container live. Nothing extra to run on deploy.

One caveat worth knowing: a rollback restores the previous *container*, not
the previous *schema*. Migrations that only add things are safe under that;
one that drops or renames a column would leave the rolled-back code facing
a schema it does not know. Keep them additive until after the show.

## Checking a deploy

These three must agree:

```bash
git --git-dir=/opt/x-car-show/source.git rev-parse main
cat /opt/x-car-show/state/deployed-sha
docker inspect x-car-show-live \
  --format '{{ index .Config.Labels "org.opencontainers.image.revision" }}'
```

Force a check now, and watch it:

```bash
systemctl start x-car-show-deploy.service
journalctl -u x-car-show-deploy.service -f
```

If the app is up but every page 500s, it is almost always the database:

```bash
docker logs --tail 100 x-car-show-live
```

## Backups

Take them on a timer over show weekend, and copy them off the machine:

```bash
docker compose exec -T db pg_dump -U xcs xcarshow > backups/$(date -u +%Y%m%dT%H%M%SZ).sql
```

Restoring is `docker compose exec -T db psql -U xcs xcarshow < backups/<file>.sql`.

The entry list is the one thing that cannot be recreated after the fact.
