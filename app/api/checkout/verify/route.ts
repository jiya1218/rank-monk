import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    const { email, plan = 'grow', paymentId, couponCode = '' } = await req.json();

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
    }

    const normEmail = email.toLowerCase().trim();
    const usersFile = path.join(process.cwd(), 'server', 'data', 'users.json');

    if (fs.existsSync(usersFile)) {
      try {
        const users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
        const user = users.find((u: any) => u.email.toLowerCase() === normEmail);
        if (user) {
          user.paid = true;
          user.plan = plan;
          user.paymentId = paymentId;
          user.couponUsed = couponCode;
          fs.writeFileSync(usersFile, JSON.stringify(users, null, 2), 'utf8');
        }
      } catch (e) {}
    }

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
