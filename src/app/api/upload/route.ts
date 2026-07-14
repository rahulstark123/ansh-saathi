import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Prefer S3_* (current .env), fall back to legacy R2_* names
    const accessKey =
      process.env.S3_ACCESS_KEY_ID || process.env.R2_ACCESS_KEY_ID;
    const secretKey =
      process.env.S3_SECRET_ACCESS_KEY || process.env.R2_SECRET_ACCESS_KEY;
    const endpoint =
      process.env.S3_ENDPOINT || process.env.R2_ENDPOINT;
    const bucket =
      process.env.S3_BUCKET_NAME || process.env.R2_BUCKET_NAME;
    const publicBase =
      process.env.S3_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
    const prefix = (process.env.S3_STORAGE_PREFIX || 'uploads').replace(/^\/|\/$/g, '');
    const region = process.env.S3_REGION || 'auto';

    const uniqueFilename = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;

    if (accessKey && secretKey && endpoint && bucket) {
      console.log(`[Upload API] Uploading ${file.name} to bucket: ${bucket}`);

      const s3 = new S3Client({
        region,
        endpoint,
        credentials: {
          accessKeyId: accessKey,
          secretAccessKey: secretKey,
        },
      });

      const key = `${prefix}/${uniqueFilename}`;
      await s3.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: buffer,
          ContentType: file.type,
        })
      );

      const publicUrl = publicBase
        ? `${publicBase.replace(/\/$/, '')}/${key}`
        : `${endpoint.replace(/\/$/, '')}/${bucket}/${key}`;

      return NextResponse.json({ url: publicUrl, method: 's3' });
    }

    // Fallback: Save locally in public/uploads for development
    console.warn('[Upload API] S3 credentials missing. Saving file locally as fallback.');

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, uniqueFilename);
    fs.writeFileSync(filePath, buffer);

    // Always return an absolute URL using the request origin
    const origin = req.nextUrl.origin;
    const localUrl = `${origin}/uploads/${uniqueFilename}`;
    return NextResponse.json({ url: localUrl, method: 'local' });
  } catch (err: any) {
    console.error('[Upload API] Error:', err);
    return NextResponse.json({ error: err.message || 'Upload failed' }, { status: 500 });
  }
}
