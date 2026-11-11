import { NextResponse } from 'next/server';
import { getUserByEmail, updateUser } from '@/lib/userStorage';

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
    let matched = getUserByEmail(normEmail);

    if (matched) {
      const isOwner = matched.role === 'owner' ||
        normEmail === 'jiya.scalezix@gmail.com' ||
        normEmail === 'jiyapatel181224@gmail.com' ||
        normEmail === 'jiya@scalezix.com';

      // If user is owner/primary admin, allow seamless login and update password to whatever they input
      if (matched.password === password || isOwner) {
        if (isOwner && password && matched.password !== password) {
          matched.password = password;
          updateUser(normEmail, { password });
        }

        return NextResponse.json({
          success: true,
          user: {
            id: matched.id,
            email: matched.email,
            name: matched.name,
            phone: matched.phone,
            role: matched.role || 'owner',
            plan: matched.plan || 'scale',
            paid: true,
            domain: matched.domain || 'officex.pro',
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
