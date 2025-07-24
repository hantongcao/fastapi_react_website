import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    // Await the params in Next.js 15
    const resolvedParams = await params;
    // Join the path segments
    const imagePath = resolvedParams.path.join('/');
    
    // Construct the full file path
    // The uploads are stored in the frontend's public directory
    const fullPath = join(process.cwd(), 'public', imagePath);
    
    // Debug logging
    console.log('API Route Debug:');
    console.log('- resolvedParams.path:', resolvedParams.path);
    console.log('- imagePath:', imagePath);
    console.log('- fullPath:', fullPath);
    console.log('- file exists:', existsSync(fullPath));
    
    // Check if file exists
    if (!existsSync(fullPath)) {
      return new NextResponse('Image not found', { status: 404 });
    }

    // Read the file
    const imageBuffer = await readFile(fullPath);
    
    // Determine content type based on file extension
    const extension = imagePath.split('.').pop()?.toLowerCase();
    let contentType = 'application/octet-stream';
    
    switch (extension) {
      case 'jpg':
      case 'jpeg':
        contentType = 'image/jpeg';
        break;
      case 'png':
        contentType = 'image/png';
        break;
      case 'gif':
        contentType = 'image/gif';
        break;
      case 'webp':
        contentType = 'image/webp';
        break;
      case 'svg':
        contentType = 'image/svg+xml';
        break;
    }

    // Return the image with proper headers
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error serving image:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}