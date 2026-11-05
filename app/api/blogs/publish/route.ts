import { NextRequest, NextResponse } from 'next/server';
import { publishToGitHub, publishToWordPress, publishToWebhook } from '@/lib/blogEngine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { destination, config, article } = body;

    if (!article || !article.title || !article.contentMarkdown) {
      return NextResponse.json(
        { success: false, error: 'Valid article object is required to publish' },
        { status: 400 }
      );
    }

    if (!destination) {
      return NextResponse.json(
        { success: false, error: 'Publish destination (github, wordpress, webhook) is required' },
        { status: 400 }
      );
    }

    // 1. GitHub GitOps Publishing
    if (destination === 'github') {
      const { token, repo, branch, folderPath } = config || {};
      if (!token || !repo) {
        return NextResponse.json(
          { success: false, error: 'GitHub Personal Access Token and Repository (owner/repo) are required' },
          { status: 400 }
        );
      }

      const res = await publishToGitHub({
        token,
        repo,
        branch: branch || 'main',
        folderPath: folderPath || 'content/blogs',
        article
      });

      return NextResponse.json(res);
    }

    // 2. WordPress REST API Publishing
    if (destination === 'wordpress') {
      const { wpUrl, wpUsername, wpAppPassword, status } = config || {};
      if (!wpUrl || !wpUsername || !wpAppPassword) {
        return NextResponse.json(
          { success: false, error: 'WordPress URL, Username, and Application Password are required' },
          { status: 400 }
        );
      }

      const res = await publishToWordPress({
        wpUrl,
        wpUsername,
        wpAppPassword,
        status: status || 'publish',
        article
      });

      return NextResponse.json(res);
    }

    // 3. Custom Webhook Publishing
    if (destination === 'webhook') {
      const { webhookUrl, secretKey } = config || {};
      if (!webhookUrl) {
        return NextResponse.json(
          { success: false, error: 'Webhook URL is required' },
          { status: 400 }
        );
      }

      const res = await publishToWebhook({
        webhookUrl,
        secretKey,
        article
      });

      return NextResponse.json(res);
    }

    return NextResponse.json(
      { success: false, error: `Unsupported publish destination: ${destination}` },
      { status: 400 }
    );
  } catch (err: any) {
    console.error('[API blogs/publish error]:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to publish article' },
      { status: 500 }
    );
  }
}

