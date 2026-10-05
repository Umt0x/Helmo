# Helmo

The web panel for Helmo: a Discord bot management dashboard (statistics, commands, guard, roles, punishments, staff, tasks and more), available in Turkish and English.

This repository holds **only the website and panel design**. The bot infrastructure and hosting are not part of it.

## Stack

Next.js 16 (App Router), TypeScript, Tailwind CSS 4, PostgreSQL with Drizzle ORM, Discord OAuth2.

## Run it locally

```bash
cd apps/web
npm install
cp .env.example .env.local   # then fill in the values
npx drizzle-kit migrate
npm run dev
```

You need a PostgreSQL database and a Discord application (OAuth2 redirect: `http://localhost:3000/api/auth/callback`). In development you can also use the "test user" button on the login page, which needs no Discord app.

## License

Licensed under the [PolyForm Noncommercial License 1.0.0](LICENSE).

- You may read, run, change and share this code for **noncommercial** purposes (learning, personal projects, research).
- If you share it or build on it, you must keep the license and the `Required Notice` line in `LICENSE`, so credit stays with the author.
- **Commercial use is not allowed** without written permission from the author. That includes selling it, hosting it as a paid service, or using the design in a commercial product.

Want to use it commercially? Ask first: [github.com/Umt0x](https://github.com/Umt0x).

Copyright (c) 2026 Umt0x
