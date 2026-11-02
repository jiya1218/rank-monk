import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error_description') || searchParams.get('error');

  if (error || !code) {
    const errorHtml = `
      <!DOCTYPE html>
      <html>
        <head><title>Connection Notice</title></head>
        <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #f8f3ec; margin: 0;">
          <div style="background: white; padding: 24px; border-radius: 16px; border: 1px solid #e4d6c6; text-align: center; max-width: 400px;">
            <h3 style="color: #9b1c1c; margin-top: 0;">Connection Incomplete</h3>
            <p style="font-size: 13px; color: #6f5a4c;">${error || 'Authorization code was not returned.'}</p>
            <button onclick="window.close()" style="background: #2b1b12; color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer;">Close Window</button>
          </div>
        </body>
      </html>
    `;
    return new Response(errorHtml, { headers: { 'Content-Type': 'text/html' } });
  }

  const host = req.headers.get('host') || 'rankmonk.in';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const redirectUri = `${protocol}://${host}/api/social/callback/meta`;

  const appId = process.env.META_APP_ID || '895513230315628';
  const appSecret = process.env.META_APP_SECRET || '35f5ae365aae4b3d1f70a91e3414bb57';

  try {
    // 1. Exchange Code for Short-Lived User Access Token
    const tokenUrl = `https://graph.facebook.com/v20.0/oauth/access_token?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${appSecret}&code=${code}`;
    const tokenRes = await fetch(tokenUrl);
    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.access_token) {
      throw new Error(tokenData.error?.message || 'Failed to exchange token with Meta');
    }

    const shortToken = tokenData.access_token;

    // 2. Exchange for 60-Day Long-Lived Token
    let longLivedToken = shortToken;
    try {
      const longUrl = `https://graph.facebook.com/v20.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${shortToken}`;
      const longRes = await fetch(longUrl);
      const longData = await longRes.json();
      if (longData.access_token) {
        longLivedToken = longData.access_token;
      }
    } catch (e) {}

    // 3. Fetch User's Facebook Pages
    const pagesUrl = `https://graph.facebook.com/v20.0/me/accounts?access_token=${longLivedToken}`;
    const pagesRes = await fetch(pagesUrl);
    const pagesData = await pagesRes.json();

    const accountsList: any[] = [];

    if (pagesData.data && Array.isArray(pagesData.data)) {
      for (const page of pagesData.data) {
        // Facebook Page details
        accountsList.push({
          platform: 'facebook',
          id: page.id,
          name: page.name,
          category: page.category,
          pageAccessToken: page.access_token
        });

        // 4. Fetch Connected Instagram Business Account for this Page
        try {
          const igUrl = `https://graph.facebook.com/v20.0/${page.id}?fields=instagram_business_account{id,username,name,profile_picture_url,followers_count}&access_token=${page.access_token}`;
          const igRes = await fetch(igUrl);
          const igData = await igRes.json();
          if (igData.instagram_business_account) {
            const ig = igData.instagram_business_account;
            accountsList.push({
              platform: 'instagram',
              id: ig.id,
              username: ig.username,
              name: ig.name,
              profilePictureUrl: ig.profile_picture_url,
              followersCount: ig.followers_count,
              pageAccessToken: page.access_token
            });
          }
        } catch (igErr) {}
      }
    }

    // Success response: Sends data to opener window and automatically closes popup
    const successHtml = `
      <!DOCTYPE html>
      <html>
        <head><title>Connected to Rank Monk</title></head>
        <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #f8f3ec; margin: 0;">
          <div style="background: white; padding: 28px; border-radius: 20px; border: 1px solid #e4d6c6; text-align: center; max-width: 420px; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
            <div style="font-size: 36px; margin-bottom: 8px;">✓</div>
            <h3 style="color: #2b1b12; margin: 0 0 8px 0; font-size: 18px;">Meta Connection Successful!</h3>
            <p style="font-size: 13px; color: #6f5a4c; margin-bottom: 16px;">
              Your accounts have been linked to Rank Monk. This window will close automatically...
            </p>
            <script>
              const payload = {
                type: 'RANKMONK_META_CONNECTED',
                accounts: ${JSON.stringify(accountsList)},
                token: ${JSON.stringify(longLivedToken)}
              };
              try {
                localStorage.setItem('rankmonk_meta_temp_connection', JSON.stringify(payload));
              } catch(e) {}
              if (window.opener) {
                try {
                  window.opener.postMessage(payload, '*');
                } catch (e) {}
              }
              setTimeout(() => { window.close(); }, 1200);
            </script>
          </div>
        </body>
      </html>
    `;

    return new Response(successHtml, { headers: { 'Content-Type': 'text/html' } });
  } catch (err) {
    const errorHtml = `
      <!DOCTYPE html>
      <html>
        <head><title>Connection Error</title></head>
        <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #f8f3ec; margin: 0;">
          <div style="background: white; padding: 24px; border-radius: 16px; border: 1px solid #e4d6c6; text-align: center; max-width: 400px;">
            <h3 style="color: #9b1c1c; margin-top: 0;">Connection Failed</h3>
            <p style="font-size: 13px; color: #6f5a4c;">${(err as Error).message}</p>
            <button onclick="window.close()" style="background: #2b1b12; color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer;">Close Window</button>
          </div>
        </body>
      </html>
    `;
    return new Response(errorHtml, { headers: { 'Content-Type': 'text/html' } });
  }
}

