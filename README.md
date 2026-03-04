# Piano Song Jar

Simple mobile-first app to store piano songs you know and draw one at random.

## Stack

- Next.js (App Router, TypeScript)
- Tailwind CSS
- Prisma + PostgreSQL

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy env file and set your Postgres connection string:

   ```bash
   cp .env.example .env
   ```

3. Create database tables:

   ```bash
   npm run prisma:migrate -- --name init
   ```

4. Start development server:

   ```bash
   npm run dev
   ```

## Available scripts

- `npm run dev` - run app locally
- `npm run build` - production build
- `npm run start` - run production server
- `npm run lint` - lint code
- `npm run prisma:generate` - generate Prisma client
- `npm run prisma:migrate` - run Prisma migrations
- `npm run prisma:studio` - open Prisma Studio

## API endpoints

- `GET /api/songs` - list songs
- `POST /api/songs` - add a song
- `PATCH /api/songs/:id` - rename a song
