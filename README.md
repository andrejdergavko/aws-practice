This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

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

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Uploading to Amazon S3

`app/page.tsx` renders an upload button that requests a signed upload URL from `POST /api/upload-url` before sending the file directly to Amazon S3. Configure the app with the following environment variables so the API route can generate the signed link:

- `AWS_REGION` &mdash; AWS region where the bucket lives (e.g., `eu-central-1`).
- `AWS_S3_BUCKET_NAME` &mdash; name of the S3 bucket that will receive the uploads.
- `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` &mdash; credentials with permissions to call `s3:PutObject` on the bucket.
  You can also provide `AWS_SESSION_TOKEN` if you rely on temporary credentials.

Set these variables locally (for example, in a `.env.local` file) and via your deployment target before running the app.

The app also fetches `GET /api/uploads`, which lists the `uploads/` prefix, signs `GET` URLs for each object, and renders a small gallery on the home page. Ensure your IAM credentials include `s3:GetObject`, and verify the bucket’s CORS policy allows your front-end origin to `GET` objects if you want the gallery to display thumbnails directly from S3.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


sudo ssh -i ES2Tutorial.pem ec2-user@3.121.116.226