import { NextResponse } from 'next/server';
import { updateUser } from '@/lib/userStorage';

export async function POST(req: Request) {
  try {
    const { email, plan = 'grow', paymentId, couponCode = '' } = await req.json();

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
    }

    const normEmail = email.toLowerCase().trim();
    updateUser(normEmail, {
      paid: true,
      plan,
      paymentId,
      couponUsed: couponCode
    });

    return NextResponse.json({
      success: true,
      message: 'Subscription successfully activated for ' + normEmail
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}
