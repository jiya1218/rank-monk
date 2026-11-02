import { NextResponse } from 'next/server';
import { updateUser } from '@/lib/userStorage';

export async function POST(req: Request) {
  try {
    const { email, domain } = await req.json();
    if (!email || !domain) {
      return NextResponse.json({ success: false, error: 'Email and domain required' }, { status: 400 });
    }

    updateUser(email, { domain });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 });
  }
}

