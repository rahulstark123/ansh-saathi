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

    // Check if R2 credentials are set up in the environment
    const r2AccessKey = process.env.R2_ACCESS_KEY_ID;
    const r2Secret = process.env.R2_SECRET_ACCESS_KEY;
    const r2Endpoint = process.env.R2_ENDPOINT;
    const r2Bucket = process.env.R2_BUCKET_NAME;

    const uniqueFilename = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;

    if (r2AccessKey && r2Secret && r2Endpoint && r2Bucket) {
      console.log(`[Upload API] Uploading ${file.name} to Cloudflare R2 bucket: ${r2Bucket}`);
      
      const s3 = new S3Client({
        region: 'auto',
        endpoint: r2Endpoint,
        credentials: {
          accessKeyId: r2AccessKey,
          secretAccessKey: r2Secret,
        },
      });

      const key = `uploads/${uniqueFilename}`;
      const uploadParams = {
        Bucket: r2Bucket,
        Key: key,
        Body: buffer,
        ContentType: file.type,
      };

      await s3.send(new PutObjectCommand(uploadParams));

      const publicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL 
        ? `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${key}`
        : `${r2Endpoint}/${r2Bucket}/${key}`;

      return NextResponse.json({ url: publicUrl, method: 'R2' });
    } else {
      // Fallback: Save locally in public/uploads for development/showcase
      console.warn('[Upload API] R2 credentials missing. Saving file locally as fallback.');
      
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filePath = path.join(uploadDir, uniqueFilename);
      fs.writeFileSync(filePath, buffer);

      const localUrl = `/uploads/${uniqueFilename}`;
      return NextResponse.json({ url: localUrl, method: 'local' });
    }
  } catch (err: any) {
    console.error('[Upload API] Error:', err);
    return NextResponse.json({ error: err.message || 'Upload failed' }, { status: 500 });
  }
}
