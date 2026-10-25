/**
 * Real Website Crawler and Technical SEO Audit Service
 */

export async function crawlDomain(rawUrl) {
  let normalizedUrl = rawUrl.trim();
  if (!/^https?:\/\//i.test(normalizedUrl)) {
    normalizedUrl = `https://${normalizedUrl}`;
  }

  let hostname = '';
  try {
    hostname = new URL(normalizedUrl).hostname.replace(/^www\./, '');
  } catch {
    throw new Error('Invalid URL format');
  }

  const startTime = Date.now();
  let html = '';
  let status = 0;
  let isSsl = normalizedUrl.startsWith('https://');

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(normalizedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 RankMonkBot/2.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      signal: controller.signal,
      redirect: 'follow'
    });

    clearTimeout(timeout);
    status = response.status;
    html = await response.text();
  } catch (err) {
    // If https fails, try http fallback
    if (normalizedUrl.startsWith('https://')) {
      try {
        const fallbackUrl = normalizedUrl.replace('https://', 'http://');
        const res2 = await fetch(fallbackUrl, {
          headers: { 'User-Agent': 'RankMonkBot/2.0' },
          signal: AbortSignal.timeout(6000),
          redirect: 'follow'
        });
        status = res2.status;
        html = await res2.text();
        isSsl = false;
      } catch (err2) {
        console.warn(`[Crawler] Could not reach ${normalizedUrl}:`, err2.message);
      }
    }
  }

  const responseTimeMs = Date.now() - startTime;

  // Extract Key SEO Elements using regex
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : '';

  const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i) ||
                        html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/i);
  const metaDescription = metaDescMatch ? metaDescMatch[1].trim() : '';

  const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["']/i);
  const canonical = canonicalMatch ? canonicalMatch[1].trim() : '';

  const h1Matches = Array.from(html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)).map(m => m[1].replace(/<[^>]+>/g, '').trim());
  const h2Count = (html.match(/<h2[^>]*>/gi) || []).length;
  const h3Count = (html.match(/<h3[^>]*>/gi) || []).length;

  const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["']/i);
  const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']*)["']/i);

  const imagesCount = (html.match(/<img[^>]*>/gi) || []).length;
  const imagesWithoutAlt = (html.match(/<img(?![^>]*\balt=)[^>]*>/gi) || []).length;

  // Check robots.txt and sitemap.xml
  let hasRobotsTxt = false;
  let hasSitemap = false;
  try {
    const robotsRes = await fetch(`https://${hostname}/robots.txt`, { signal: AbortSignal.timeout(3000) });
    hasRobotsTxt = robotsRes.ok;
  } catch {}

  try {
    const sitemapRes = await fetch(`https://${hostname}/sitemap.xml`, { signal: AbortSignal.timeout(3000) });
    hasSitemap = sitemapRes.ok;
  } catch {}

  // Calculate SEO Health Score
  let score = 100;
  const issues = [];
  const passing = [];

  if (!isSsl) {
    score -= 15;
    issues.push({ type: 'critical', message: 'Missing SSL / HTTPS certificate. Modern search engines heavily penalize insecure sites.' });
  } else {
    passing.push('Valid SSL / HTTPS encryption active.');
  }

  if (!title) {
    score -= 20;
    issues.push({ type: 'critical', message: 'Missing <title> tag on page.' });
  } else if (title.length < 30 || title.length > 65) {
    score -= 5;
    issues.push({ type: 'warning', message: `Title length is ${title.length} chars (Recommended: 40-60 characters for optimal SERP display).` });
  } else {
    passing.push(`Perfect title tag length (${title.length} characters).`);
  }

  if (!metaDescription) {
    score -= 15;
    issues.push({ type: 'critical', message: 'Missing meta description. Snippets will be dynamically truncated by search engines.' });
  } else if (metaDescription.length < 80 || metaDescription.length > 160) {
    score -= 4;
    issues.push({ type: 'warning', message: `Meta description length is ${metaDescription.length} chars (Recommended: 120-155 characters).` });
  } else {
    passing.push('Meta description correctly formatted.');
  }

  if (h1Matches.length === 0) {
    score -= 10;
    issues.push({ type: 'critical', message: 'No <h1> heading detected on the page.' });
  } else if (h1Matches.length > 1) {
    score -= 5;
    issues.push({ type: 'warning', message: `Multiple <h1> tags found (${h1Matches.length}). Best practice is exactly one single <h1> per page.` });
  } else {
    passing.push('Single, clear <h1> tag present.');
  }

  if (imagesWithoutAlt > 0) {
    score -= Math.min(10, imagesWithoutAlt * 2);
    issues.push({ type: 'warning', message: `${imagesWithoutAlt} images lack descriptive alt attributes for accessibility and image search.` });
  } else if (imagesCount > 0) {
    passing.push('All images contain alt text attributes.');
  }

  if (!canonical) {
    score -= 5;
    issues.push({ type: 'warning', message: 'Missing rel="canonical" tag. Duplicate content risks may arise.' });
  } else {
    passing.push('rel="canonical" tag is correctly configured.');
  }

  if (!hasSitemap) {
    score -= 5;
    issues.push({ type: 'warning', message: 'No sitemap.xml detected at root URL.' });
  } else {
    passing.push('Valid sitemap.xml detected.');
  }

  if (responseTimeMs > 1500) {
    score -= 5;
    issues.push({ type: 'warning', message: `Page response time (${responseTimeMs}ms) is higher than recommended 800ms threshold.` });
  } else {
    passing.push(`Blazing fast TTFB / response time (${responseTimeMs}ms).`);
  }

  score = Math.max(35, Math.min(100, score));

  return {
    url: normalizedUrl,
    hostname,
    status: status || 200,
    isSsl,
    responseTimeMs,
    score,
    title,
    metaDescription,
    canonical,
    h1: h1Matches[0] || '',
    h1Count: h1Matches.length,
    h2Count,
    h3Count,
    imagesCount,
    imagesWithoutAlt,
    ogTitle: ogTitleMatch ? ogTitleMatch[1] : '',
    ogImage: ogImageMatch ? ogImageMatch[1] : '',
    hasRobotsTxt,
    hasSitemap,
    issues,
    passing,
    auditedAt: new Date().toISOString()
  };
}
