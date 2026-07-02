import { NextResponse } from 'next/server';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  GetObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from '@aws-sdk/client-s3';

const AWS_REGION = process.env.AWS_REGION ?? 'us-east-1';
const S3_BUCKET = process.env.AWS_S3_BUCKET_NAME;

const s3Client = new S3Client({
  region: AWS_REGION,
});

export async function GET() {
  if (!S3_BUCKET) {
    return NextResponse.json(
      { error: 'S3 bucket is not configured. Set AWS_S3_BUCKET_NAME.' },
      { status: 500 },
    );
  }

  const listCommand = new ListObjectsV2Command({
    Bucket: S3_BUCKET,
    Prefix: 'uploads/',
    MaxKeys: 60,
  });

  try {
    const listResponse = await s3Client.send(listCommand);
    const contents = listResponse.Contents ?? [];
    const withKeys = contents.filter(
      (object): object is { Key: string } => typeof object.Key === 'string',
    );

    const items = await Promise.all(
      withKeys.map(async (object) => {
        const key = object.Key;
        const signedUrl = await getSignedUrl(
          s3Client,
          new GetObjectCommand({
            Bucket: S3_BUCKET,
            Key: key,
          }),
          {
            expiresIn: 300,
          },
        );

        return {
          key,
          url: signedUrl,
          lastModified: object.LastModified?.toISOString(),
          size: object.Size,
        };
      }),
    );

    return NextResponse.json({ items });
  } catch (error) {
    console.error('Unable to list uploads', error);
    return NextResponse.json(
      { error: 'Не удалось получить список загруженных файлов.' },
      { status: 500 },
    );
  }
}
