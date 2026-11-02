import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const host = req.headers.get('host') || 'rankmonk.in';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const redirectUri = `${protocol}://${host}/api/social/callback/meta`;

    const appId = process.env.META_APP_ID || '895513230315628';
    
    // Official Meta Scopes for Instagram & Facebook Publishing
    const scopes = [
      'public_profile',
      'email',
      'pages_show_list',
      'pages_read_engagement',
      'pages_manage_posts',
      'instagram_basic',
      'instagram_content_publish'
    ].join(',');

    const state = Math.random().toString(36).substring(7);

    const metaAuthUrl = `https://www.facebook.com/v20.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&response_type=code&state=${state}`;

    return NextResponse.redirect(metaAuthUrl);
  } catch (err) {
    return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 });
  }
}

