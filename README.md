# This is Michael Mirisciotta's Create-next-app with Tailwind optimized with Prisma PostgreSQL Backend. 

1. Create Repository with template, Create Vercel project. Link to vercel project. Deploy
2. ?? Should be already installed ??? Install vercel CLI in Terminal: npm i -g vercel@latest
3. ?? Should be already installed ??? npx prisma generate
4. Create PostgreSQL Database
5. USE VERCEL CLI Terminal Write: vercel link 
6. Link your project name that you named in the vercel console.
7. USE VERCEL CLI Terminal Write: vercel env pull .env.local
8. Rename .envlocal to .env and change on .gitignore
9. See your prisma models Terminal Write: npx prisma studio

### Notes

To wipe Prisma Database use Terminal Command: npx prisma migrate reset


This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
