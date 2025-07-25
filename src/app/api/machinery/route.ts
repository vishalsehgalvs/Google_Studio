import { NextResponse } from 'next/server';
import { machineryList } from '@/lib/machinery';
import path from 'path';

export async function GET() {
  return NextResponse.json(machineryList);
}

export async function POST(req: Request) {
  const contentType = req.headers.get('content-type') || '';
  if (contentType.startsWith('multipart/form-data')) {
    // Parse form-data (requires a library like formidable or busboy in production)
    // For demo, reject as not implemented
    return NextResponse.json({ success: false, error: 'Image upload not implemented in demo. Use JSON for now.' }, { status: 501 });
  }
  // Handle JSON requests
  const body = await req.json();
  if (body.action === 'add') {
    const { name, type, rentPrice, description, imageUrl } = body;
    if (!name || !type || !rentPrice || typeof rentPrice !== 'number') {
      return NextResponse.json({ success: false, error: 'Invalid input' }, { status: 400 });
    }
    // Validate image URL extension
    if (imageUrl && !['.jpg', '.jpeg', '.png', '.webp'].includes(path.extname(imageUrl).toLowerCase())) {
      return NextResponse.json({ success: false, error: 'Invalid image type' }, { status: 400 });
    }
    // Here you would save to DB and move file to /public/uploads
    return NextResponse.json({ success: true, name, type, rentPrice, description, imageUrl });
  }
  if (body.action === 'rent') {
    const { id } = body;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing machinery id' }, { status: 400 });
    }
    // Here you would update DB, for demo just return success
    return NextResponse.json({ success: true, id });
  }
  return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
}
