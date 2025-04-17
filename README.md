# Nuxt 3 with Tailwind, Vue.shadcn, tRPC, Prisma,S upabase

This project uses Tailwind, Vue.shadcn, tRPC, Prisma, and S upabase PostgreSQL database.

## Setup

1. Clone the repository
2. Install dependencies:

```GIT bash
npm install
```

3. Configure Supabase:

- Create a Supabase account at [https://supabase.com](https://supabase.com)
- Create a new project
- Get your database connection string from Project Settings -> Database -> Connection String -> URI
- Update the `.env` file with your Supabase connection string:

```
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
```

4. Push the Prisma schema to your Supabase database:

```GIT bash
npx prisma db push
```

5. Generate the Prisma client:

```GIT bash
npx prisma generate
```

## Development

Start the development server:

```GIT bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your application.

## Prisma Commands

- Generate Prisma client:
  ```GIT bash
  npx prisma generate
  ```

- Push schema changes to database:
  ```GIT bash
  npx prisma db push
  ```

- Format Prisma schema:
  ```GIT bash
  npx prisma format
  ```

- View your data with Prisma Studio:
  ```GIT bash
  npx prisma studio
  ```

## Deployment

Build the application for production:

```GIT bash
npm run build
```

Preview the production build:

```GIT bash
npm run preview
```

## Database Migration Workflow

When you need to make changes to your database schema:

1. Update your `prisma/schema.prisma` file
2. Run `npx prisma db push` to apply changes to your development database
3. For production, consider using migrations:
   ```GIT bash
   npx prisma migrate dev --name what_you_changed
   ```


