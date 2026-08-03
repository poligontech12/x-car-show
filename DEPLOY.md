# Deploying X Car Show

One Postgres and one Next.js server, published on a local port for the
reverse proxy already running on the server to forward to. TLS and DNS are
that proxy's job, not this stack's. Local development skips Docker
entirely and talks to a Postgres installed with Homebrew.

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

`npm run db:seed` refuses to run against a database that already has cars
in it, and refuses production outright. The demo roster is placeholder
data and must never be shown to real attendees as real entries.

Poke at the data directly — that is the point of Postgres here:

```bash
psql -d xcarshow -c 'select id, model, no, stand from cars order by no'
```

## The server

Needs Docker, and `xcarshow.poligontech.ro` already terminating TLS at your
proxy and forwarding to this machine.

```bash
git clone <repo> xcarshow && cd xcarshow
mkdir -p backups
```

Now create the `.env` file the stack reads. It is a plain text file in the
project directory, three lines long. This writes it with fresh random
secrets — paste the whole block:

```bash
cat > .env <<EOF
POSTGRES_PASSWORD=$(openssl rand -base64 24)
BETTER_AUTH_SECRET=$(openssl rand -base64 32)
NEXT_PUBLIC_SITE_URL=https://xcarshow.poligontech.ro
EOF
```

That is the whole configuration.

| Variable | What it is |
| --- | --- |
| `POSTGRES_PASSWORD` | The database password. Nothing outside the stack sees it. |
| `BETTER_AUTH_SECRET` | Signs session cookies. Changing it signs everybody out. |
| `NEXT_PUBLIC_SITE_URL` | The public origin, baked into every printed QR code. |

`.env` is gitignored and must stay that way — it never gets committed.

Then bring it up:

```bash
docker compose --profile tools run --rm migrate
docker compose up -d
```

The app is now listening on `127.0.0.1:3000`. Point your proxy at that.
Set `APP_PORT` in `.env` if 3000 is taken. If the proxy is itself a Docker
container it cannot reach `127.0.0.1` — set `APP_BIND=0.0.0.0`, or better,
put both on the same Docker network.

`NEXT_PUBLIC_SITE_URL` is baked in at build time and is the URL encoded
into every printed QR code. **Settle it before any card goes to print** —
changing it afterwards silently invalidates every card already printed.
It is also what tells Next which origin server actions may come from, so
if it is wrong every save and vote fails in production while working fine
on localhost.

## Deploys

Pushing to `main` runs the `Deploy` workflow: it builds and migrates
against a throwaway Postgres first, and only then SSHes to the server,
dumps the database, migrates, and restarts. It needs four repository
secrets — `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_SSH_KEY`, `DEPLOY_PATH` —
and a `production` environment if you want the deploy to wait for a click.

## Backups

The deploy takes one automatically. For show weekend, take them on a timer
too, and copy them off the machine:

```bash
docker compose exec -T db pg_dump -U xcs xcarshow > backups/$(date -u +%Y%m%dT%H%M%SZ).sql
```

Restoring is `psql -U xcs xcarshow < backups/<file>.sql`.
