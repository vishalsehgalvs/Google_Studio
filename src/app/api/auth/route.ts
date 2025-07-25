import { NextResponse } from 'next/server';

// Web Crypto API helpers for password hashing and comparison
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function comparePassword(password: string, hash: string): Promise<boolean> {
  const hashed = await hashPassword(password);
  return hashed === hash;
}

// Demo: In-memory user store
const users: { username: string; password: string }[] = [];
function validateInput(username: string, password: string) {
  return typeof username === 'string' && username.length >= 3 && typeof password === 'string' && password.length >= 6;
}

export async function POST(request: Request) {
  let username = "", password = "", type = "";
  try {
    const body = await request.json();
    username = body.username || "";
    password = body.password || "";
    type = body.type || "";
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 });
  }
  if (!validateInput(username, password)) {
    return NextResponse.json({ success: false, error: 'Invalid input' }, { status: 400 });
  }
  if (type === 'register') {
    const hashed = await hashPassword(password);
    users.push({ username, password: hashed });
    return NextResponse.json({ success: true });
  } else if (type === 'login') {
    const user = users.find(u => u.username === username);
    if (!user) return NextResponse.json({ success: false });
    const match = await comparePassword(password, user.password);
    return NextResponse.json({ success: match });
  }
  return NextResponse.json({ success: false });
}
