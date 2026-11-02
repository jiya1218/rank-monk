/**
 * Strip .html extensions from ALL internal links across all HTML files.
 * Production-level clean URLs for Rank Monk.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const HTML_FILES = fs.readdirSync(ROOT).filter(f => f.endsWith('.html'));

// Mapping: filename.html -> clean path
const CLEAN_MAP = {
  'index.html': '/',
  'features.html': '/features',
  'pricing.html': '/pricing',
  'engines.html': '/engines',
  'comparison.html': '/comparison',
  'faq.html': '/faq',
  'about.html': '/about',
  'contact.html': '/contact',
  'terms.html': '/terms',
  'privacy.html': '/privacy',
  'eeat-analysis.html': '/eeat-analysis',
  'use-cases.html': '/use-cases',
  'roadmap.html': '/roadmap',
  'changelog.html': '/changelog',
  'affiliate.html': '/affiliate',
  'careers.html': '/careers',
  'blog.html': '/blog',
  'help-center.html': '/help-center',
  'api-docs.html': '/api-docs',
  'case-studies.html': '/case-studies',
  'glossary.html': '/glossary',
  'login.html': '/login',
  'signup.html': '/signup',
  'dashboard.html': '/dashboard',
  'onboarding.html': '/onboarding',
};

let totalReplacements = 0;

for (const file of HTML_FILES) {
  const filePath = path.join(ROOT, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let fileReplacements = 0;

  for (const [htmlName, cleanPath] of Object.entries(CLEAN_MAP)) {
    // Pattern 1: href="about.html" or href="./about.html" or href="/about.html"
    // But NOT href="https://...about.html" (external links)
    const patterns = [
      // href="about.html"  →  href="/about"
      { find: `href="${htmlName}"`, replace: `href="${cleanPath}"` },
      // href="./${htmlName}"  →  href="${cleanPath}"
      { find: `href="./${htmlName}"`, replace: `href="${cleanPath}"` },
      // href="/${htmlName}"  →  href="${cleanPath}"
      { find: `href="/${htmlName}"`, replace: `href="${cleanPath}"` },
      // Single quotes: href='about.html'
      { find: `href='${htmlName}'`, replace: `href='${cleanPath}'` },
      { find: `href='./${htmlName}'`, replace: `href='${cleanPath}'` },
      { find: `href='/${htmlName}'`, replace: `href='${cleanPath}'` },
      // JS: window.location = 'about.html' or window.location.href = 'about.html'
      { find: `= '${htmlName}'`, replace: `= '${cleanPath}'` },
      { find: `= "${htmlName}"`, replace: `= "${cleanPath}"` },
      // JS: location.replace('about.html')
      { find: `('${htmlName}')`, replace: `('${cleanPath}')` },
      { find: `("${htmlName}")`, replace: `("${cleanPath}")` },
    ];

    for (const p of patterns) {
      const count = content.split(p.find).length - 1;
      if (count > 0) {
        content = content.split(p.find).join(p.replace);
        fileReplacements += count;
      }
    }
  }

  if (fileReplacements > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ ${file}: ${fileReplacements} replacements`);
    totalReplacements += fileReplacements;
  } else {
    console.log(`⏭️  ${file}: no changes needed`);
  }
}

console.log(`\n🏁 TOTAL: ${totalReplacements} replacements across ${HTML_FILES.length} files`);

