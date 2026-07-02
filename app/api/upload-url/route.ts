import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

const AWS_REGION = process.env.AWS_REGION ?? 'us-east-1';
const S3_BUCKET = process.env.AWS_S3_BUCKET_NAME;

const s3Client = new S3Client({
  region: AWS_REGION,
});

const sanitizeFileName = (fileName: string) =>
  fileName
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

export async function POST(request: NextRequest) {
  if (!S3_BUCKET) {
    return NextResponse.json(
      { error: 'S3 bucket is not configured. Set AWS_S3_BUCKET_NAME.' },
      { status: 500 },
    );
  }

  let payload;

  try {
    payload = await request.json();
  } catch (error) {
    console.error('Invalid JSON payload', error);
    return NextResponse.json(
      { error: 'Invalid JSON payload.' },
      { status: 400 },
    );
  }

  const { fileName, fileType } = payload ?? {};

  if (!fileName || !fileType) {
    return NextResponse.json(
      { error: 'fileName and fileType are required.' },
      { status: 400 },
    );
  }

  const safeFileName = sanitizeFileName(fileName) || 'upload';
  const objectKey = `uploads/${randomUUID()}-${safeFileName}`;

  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: objectKey,
    ContentType: fileType,
  });

  try {
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

    const regionSuffix = AWS_REGION === 'us-east-1' ? '' : `.${AWS_REGION}`;

    const publicUrl = `https://${S3_BUCKET}.s3${regionSuffix}.amazonaws.com/${objectKey}`;

    return NextResponse.json({
      url: signedUrl,
      publicUrl,
      objectKey,
    });
  } catch (error) {
    console.error('Unable to create S3 upload URL', error);
    return NextResponse.json(
      { error: 'Не удалось создать подписанную ссылку для загрузки.' },
      { status: 500 },
    );
  }
}
