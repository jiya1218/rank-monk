import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    const { email, domain } = await req.json();
    if (!email || !domain) {
      return NextResponse.json({ success: false, error: 'Email and domain required' }, { status: 400 });
    }

    const usersFile = path.join(process.cwd(), 'server', 'data', 'users.json');
    if (fs.existsSync(usersFile)) {
      const users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
      const idx = users.findIndex((u: any) => u.email.toLowerCase() === email.toLowerCase().trim());
      if (idx !== -1) {
        users[idx].domain = domain;
        fs.writeFileSync(usersFile, JSON.stringify(users, null, 2), 'utf8');
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 });
  }
}

