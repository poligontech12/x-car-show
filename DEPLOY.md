# Deploying X Car Show

One Postgres, one Next.js server, one Caddy in front. The same
`docker-compose.yml` runs on the office server and on any machine with
Docker; local development skips Docker entirely and talks to a Postgres
installed with Homebrew.

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

Needs Docker, a directory to hold the checkout, and `xcarshow.poligontech.ro`
resolving to the machine on ports 80 and 443. Caddy gets the certificate on
its own once the DNS record is live — it will fail to issue one until then.

```bash
git clone <repo> xcarshow && cd xcarshow
mkdir -p backups
cp .env.example .env              # compose reads .env, not .env.local
```

`.env` on the server needs four values:

| Variable | What it is |
| --- | --- |
| `POSTGRES_PASSWORD` | Anything long. Only the app and psql ever see it. |
| `BETTER_AUTH_SECRET` | `openssl rand -base64 32`. Changing it signs everyone out. |
| `SITE_HOST` | The hostname Caddy answers on, for this deploy, `xcarshow.poligontech.ro`. |
| `NEXT_PUBLIC_SITE_URL` | The full public origin, here, `https://xcarshow.poligontech.ro`. |

Then:

```bash
docker compose --profile tools run --rm migrate
docker compose up -d
```

`NEXT_PUBLIC_SITE_URL` is baked in at build time and is the URL encoded
into every printed QR code. **Settle it before any card goes to print** —
changing it afterwards silently invalidates every card already printed.

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
