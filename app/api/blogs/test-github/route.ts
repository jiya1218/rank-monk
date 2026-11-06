import { NextRequest, NextResponse } from 'next/server';
import { testGitHubRepo } from '@/lib/blogEngine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, repo, branch, folderPath, brandDomain } = body;

    if (!token || !repo) {
      return NextResponse.json(
        { success: false, error: 'GitHub Personal Access Token and Repository (owner/repo) are required' },
        { status: 400 }
      );
    }

    const report = await testGitHubRepo({
      token,
      repo,
      branch: branch || 'main',
      folderPath: folderPath || 'content/blogs',
      brandDomain: brandDomain || ''
    });

    return NextResponse.json(report);
  } catch (err: any) {
    console.error('[API test-github error]:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'GitHub diagnostic test failed' },
      { status: 500 }
    );
  }
}

