import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join, resolve, normalize } from 'path';
import { existsSync } from 'fs';
import { uploadRateLimiter, getClientIdentifier } from '@/lib/security/rateLimiter';
import { sanitizeFileName, isValidFileType } from '@/lib/security/validator';

async function handler(req: any) {
  try {
    // Rate limiting
    const clientId = getClientIdentifier(req);
    const rateLimitResult = uploadRateLimiter.check(clientId, '/api/upload');
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: 'Too many upload requests',
          message: 'Please try again later',
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000),
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    let collection = formData.get('collection') as string;
    let itemId = formData.get('itemId') as string;

    if (!file || !collection || !itemId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Sanitize collection and itemId to prevent path traversal
    collection = sanitizeFileName(collection);
    itemId = sanitizeFileName(itemId);

    // Validate allowed collections
    const allowedCollections = ['catalogItems', 'deadStockListings', 'shops', 'suppliers'];
    if (!allowedCollections.includes(collection)) {
      return NextResponse.json(
        { error: 'Invalid collection name' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedImageTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Validate file extension
    if (!isValidFileType(file.name, allowedImageTypes)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: jpg, jpeg, png, gif, webp' },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Prevent path traversal - resolve and check it's within uploads directory
    const uploadsBaseDir = resolve(process.cwd(), 'public', 'uploads');
    const uploadDir = resolve(uploadsBaseDir, collection, itemId);
    
    // Ensure the resolved path is within the uploads directory
    if (!uploadDir.startsWith(uploadsBaseDir)) {
      return NextResponse.json(
        { error: 'Invalid path' },
        { status: 400 }
      );
    }

    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Sanitize filename and generate unique filename
    const sanitizedFileName = sanitizeFileName(file.name);
    const timestamp = Date.now();
    const filename = `${timestamp}-${sanitizedFileName}`;
    const filepath = normalize(join(uploadDir, filename));

    // Double-check the final path is still within uploads directory
    if (!filepath.startsWith(uploadsBaseDir)) {
      return NextResponse.json(
        { error: 'Invalid file path' },
        { status: 400 }
      );
    }

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Return public URL
    const url = `/uploads/${collection}/${itemId}/${filename}`;

    return NextResponse.json({ url });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Upload failed' },
      { status: 500 }
    );
  }
}

export const POST = withAuth(handler);








