import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const normEmail = email.toLowerCase().trim();

    // Real Registered Users from Database (users.json)
    const usersFile = path.join(process.cwd(), 'server', 'data', 'users.json');
    if (fs.existsSync(usersFile)) {
      try {
        const users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
        const matched = users.find((u: any) => u.email.toLowerCase() === normEmail);
        if (matched) {
          if (matched.password === password) {
            return NextResponse.json({
              success: true,
              user: {
                id: matched.id,
                email: matched.email,
                name: matched.name,
                phone: matched.phone,
                role: matched.role || 'member',
                plan: matched.plan || 'grow',
                paid: matched.paid === true,
                domain: matched.domain || '',
                createdAt: matched.created_at || new Date().toISOString()
              }
            });
          } else {
            return NextResponse.json(
              { success: false, error: 'Incorrect password. Please verify and try again.' },
              { status: 401 }
            );
          }
        }
      } catch (e) {}
    }

    return NextResponse.json(
      { success: false, error: 'No account found with this email. Please create an account first.' },
      { status: 404 }
    );
  } catch (err) {
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}
