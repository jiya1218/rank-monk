import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    const { email, password, name, phone, domain, plan = 'grow' } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'A valid email address is required.' },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters.' },
        { status: 400 }
      );
    }

    const normEmail = email.toLowerCase().trim();
    const dataDir = path.join(process.cwd(), 'server', 'data');
    const usersFile = path.join(dataDir, 'users.json');

    if (!fs.existsSync(dataDir)) {
      try { fs.mkdirSync(dataDir, { recursive: true }); } catch (e) {}
    }

    let users: any[] = [];
    if (fs.existsSync(usersFile)) {
      try { users = JSON.parse(fs.readFileSync(usersFile, 'utf8')); } catch (e) {}
    }

    if (users.some((u: any) => u.email.toLowerCase() === normEmail)) {
      return NextResponse.json(
        { success: false, error: 'An account with this email already exists. Please log in.' },
        { status: 409 }
      );
    }

    const newUser = {
      id: `usr_${Date.now()}`,
      email: normEmail,
      name: name || normEmail.split('@')[0],
      phone: phone || '',
      password,
      role: 'member',
      plan,
      paid: false,
      domain: domain || '',
      created_at: new Date().toISOString()
    };

    users.push(newUser);
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2), 'utf8');

    const safeUser = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      phone: newUser.phone,
      role: newUser.role,
      plan: newUser.plan,
      paid: newUser.paid,
      domain: newUser.domain,
      createdAt: newUser.created_at
    };

    return NextResponse.json({ success: true, user: safeUser });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}

