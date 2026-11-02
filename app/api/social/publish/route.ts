import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { platform, accountId, accessToken, message, imageUrl } = body;

    if (!platform || !accountId || !accessToken) {
      return NextResponse.json({ success: false, error: 'Missing platform, accountId, or accessToken' }, { status: 400 });
    }

    // 1. PUBLISH TO FACEBOOK PAGE
    if (platform === 'facebook') {
      let fbUrl = `https://graph.facebook.com/v20.0/${accountId}/feed`;
      let payload: any = { message: message || '', access_token: accessToken };

      if (imageUrl) {
        fbUrl = `https://graph.facebook.com/v20.0/${accountId}/photos`;
        payload = { url: imageUrl, caption: message || '', access_token: accessToken };
      }

      const res = await fetch(fbUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error?.message || 'Facebook publish failed');
      }

      return NextResponse.json({
        success: true,
        postId: data.id || data.post_id,
        platform: 'facebook',
        publishedAt: new Date().toISOString()
      });
    }

    // 2. PUBLISH TO INSTAGRAM BUSINESS ACCOUNT
    if (platform === 'instagram') {
      if (!imageUrl) {
        return NextResponse.json({ success: false, error: 'Instagram requires an image or media URL to publish.' }, { status: 400 });
      }

      // Step A: Create Media Container
      const containerUrl = `https://graph.facebook.com/v20.0/${accountId}/media`;
      const containerRes = await fetch(containerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: imageUrl,
          caption: message || '',
          access_token: accessToken
        })
      });
      const containerData = await containerRes.json();
      if (!containerRes.ok || !containerData.id) {
        throw new Error(containerData.error?.message || 'Instagram media container creation failed');
      }

      const creationId = containerData.id;

      // Step B: Publish Media Container
      const publishUrl = `https://graph.facebook.com/v20.0/${accountId}/media_publish`;
      const publishRes = await fetch(publishUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creation_id: creationId,
          access_token: accessToken
        })
      });
      const publishData = await publishRes.json();
      if (!publishRes.ok || !publishData.id) {
        throw new Error(publishData.error?.message || 'Instagram publish failed');
      }

      return NextResponse.json({
        success: true,
        postId: publishData.id,
        platform: 'instagram',
        publishedAt: new Date().toISOString()
      });
    }

    // 3. PUBLISH TO LINKEDIN
    if (platform === 'linkedin') {
      // If live token is present, dispatch to LinkedIn UGC API
      if (accessToken && !accessToken.startsWith('mock_')) {
        const liPayload: any = {
          author: `urn:li:person:${accountId}`,
          lifecycleState: 'PUBLISHED',
          specificContent: {
            'com.linkedin.ugc.ShareContent': {
              shareCommentary: { text: message || '' },
              shareMediaCategory: imageUrl ? 'ARTICLE' : 'NONE'
            }
          },
          visibility: {
            'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
          }
        };

        if (imageUrl) {
          liPayload.specificContent['com.linkedin.ugc.ShareContent'].media = [
            {
              status: 'READY',
              description: { text: message || '' },
              originalUrl: imageUrl,
              title: { text: 'Published via Rank Monk' }
            }
          ];
        }

        const liRes = await fetch('https://api.linkedin.com/v2/ugcPosts', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0'
          },
          body: JSON.stringify(liPayload)
        });

        const liData = await liRes.json();
        if (!liRes.ok) {
          throw new Error(liData.message || 'LinkedIn publishing failed');
        }

        return NextResponse.json({
          success: true,
          postId: liData.id,
          platform: 'linkedin',
          publishedAt: new Date().toISOString()
        });
      }

      // Sandbox / Verified Simulation Response
      return NextResponse.json({
        success: true,
        postId: `urn:li:share:${Date.now()}`,
        platform: 'linkedin',
        publishedAt: new Date().toISOString(),
        simulated: true
      });
    }

    // 4. PUBLISH TO X (TWITTER)
    if (platform === 'twitter') {
      if (accessToken && !accessToken.startsWith('mock_')) {
        const twRes = await fetch('https://api.twitter.com/2/tweets', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ text: (message || '').substring(0, 280) })
        });

        const twData = await twRes.json();
        if (!twRes.ok || twData.errors) {
          throw new Error(twData.errors?.[0]?.message || 'X publishing failed');
        }

        return NextResponse.json({
          success: true,
          postId: twData.data?.id,
          platform: 'twitter',
          publishedAt: new Date().toISOString()
        });
      }

      // Sandbox / Verified Simulation Response
      return NextResponse.json({
        success: true,
        postId: `tweet_${Date.now()}`,
        platform: 'twitter',
        publishedAt: new Date().toISOString(),
        simulated: true
      });
    }

    return NextResponse.json({ success: false, error: `Platform ${platform} not supported yet.` }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 });
  }
}

