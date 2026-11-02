'use client';

import React, { useState, useMemo } from 'react';
import {
  Globe,
  RefreshCw,
  Download,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  FileText,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Copy,
  ExternalLink,
  Search,
  Check,
  FileSpreadsheet,
  Layers,
  ArrowUpRight,
  TrendingUp,
  Loader2
} from 'lucide-react';

interface SeoAuditWorkspaceProps {
  project: any;
  onNavigateTab: (tab: string) => void;
}

export function SeoAuditWorkspace({ project, onNavigateTab }: SeoAuditWorkspaceProps) {
  const [crawlLimit, setCrawlLimit] = useState('50');
  const [isReRunningAudit, setIsReRunningAudit] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'issues' | 'pages'>('issues');
  const [issueFilter, setIssueFilter] = useState<'all' | 'critical' | 'important' | 'minor' | 'passed'>('all');
  const [pageFilter, setPageFilter] = useState('all');
  const [issuesSearchQuery, setIssuesSearchQuery] = useState('');
  const [pagesSearchQuery, setPagesSearchQuery] = useState('');
  const [expandedIssueId, setExpandedIssueId] = useState<string | null>('dup-titles');
  const [aiFixedUrls, setAiFixedUrls] = useState<Record<string, boolean>>({});
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const domain = project?.domain || 'company.com';
  const cleanDomain = domain.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '');
  const brandName = project?.name || 'Your Brand';

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Re-run Audit action
  const handleReRunAudit = () => {
    setIsReRunningAudit(true);
    showToast(`Crawling ${cleanDomain} across ${crawlLimit} pages...`);
    setTimeout(() => {
      setIsReRunningAudit(false);
      showToast(`✓ Crawl completed! All 50 pages analyzed with 100% crawl health.`);
    }, 1500);
  };

  // 1-Click AI Fix for a URL issue
  const handleAiFixUrl = (urlId: string, issueType: string) => {
    setAiFixedUrls(prev => ({ ...prev, [urlId]: true }));
    showToast(`✓ AI Remedy generated and validated for: ${urlId}!`);
  };

  // Copy to clipboard
  const handleCopy = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedUrl(text);
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  // Export Issues CSV
  const handleExportIssuesCsv = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Issue,Impact,How To Fix,Failed URLs\n" +
      "2 pages have duplicate title tags,Important,Differentiate page titles,https://" + cleanDomain + "/product-1\n" +
      "1 page has a title tag that is too long,Important,Keep under 69 characters,https://" + cleanDomain + "/solutions-overview\n" +
      "10 pages are missing meta descriptions,Important,Add 120-160 char descriptions,10 sub-pages\n" +
      "21 pages are missing alt text,Minor,Add descriptive alt tags,21 images\n" +
      "5 pages lack structured schema,Minor,Inject JSON-LD structured schema,5 pages\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `seo_issues_${cleanDomain}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("✓ Exported SEO issues CSV successfully!");
  };

  // Export Audited Pages CSV
  const handleExportPagesCsv = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Page URL,Status,Title,Meta Description,H1,Word Count\n" +
      pagesList.map(p => `"${p.url}",${p.status},"${p.title}","${p.metaDesc}","${p.h1}",${p.wordCount}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `audited_pages_${cleanDomain}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("✓ Exported audited pages CSV successfully!");
  };

  // Download Full PDF Report (sitefire.ai / SoloSpider high fidelity)
  const handleDownloadPdf = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.print();
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Rank Monk — SEO Audit Executive Report (${cleanDomain})</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;600;700;800&family=Fraunces:wght@700;800&display=swap');
          body { font-family: 'Instrument Sans', sans-serif; color: #2b1b12; background: #fff; padding: 40px; margin: 0; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e4d6c6; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: 800; color: #2b1b12; }
          .logo span { color: #c5a059; }
          .date { font-size: 12px; color: #6f5a4c; }
          .score-card { display: flex; gap: 20px; margin-bottom: 30px; }
          .score-box { flex: 1; border: 1px solid #e4d6c6; border-radius: 16px; padding: 20px; background: #faf7f2; }
          .score-title { font-size: 11px; text-transform: uppercase; font-weight: 800; color: #6f5a4c; }
          .score-val { font-size: 36px; font-weight: 900; color: #2b1b12; margin: 10px 0; }
          .table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
          .table th { background: #f8f3ec; padding: 10px; border: 1px solid #e4d6c6; text-align: left; }
          .table td { padding: 10px; border: 1px solid #e4d6c6; }
          .badge { padding: 3px 8px; border-radius: 6px; font-size: 10px; font-weight: bold; }
          .badge-important { background: #fef3c7; color: #92400e; }
          .badge-minor { background: #f3f4f6; color: #374151; }
          .badge-success { background: #def7ec; color: #03543f; }
          .footer { margin-top: 40px; border-top: 1px solid #e4d6c6; padding-top: 20px; font-size: 11px; color: #6f5a4c; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">RANK <span>MONK</span></div>
            <p style="margin: 4px 0 0; font-size: 13px; color: #6f5a4c;">Autonomous Technical SEO Crawl & AEO Discovery Audit</p>
          </div>
          <div style="text-align: right;">
            <div style="font-weight: bold; font-size: 14px;">${cleanDomain}</div>
            <div class="date">Report Generated: ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
          </div>
        </div>

        <div class="score-card">
          <div class="score-box">
            <div class="score-title">On-Page SEO Score</div>
            <div class="score-val" style="color: #10b981;">83 / 100</div>
            <span class="badge badge-success">● Excellent Health</span>
          </div>
          <div class="score-box">
            <div class="score-title">Total Pages Audited</div>
            <div class="score-val">50</div>
            <span class="badge badge-success">● 100% Crawl Success</span>
          </div>
          <div class="score-box">
            <div class="score-title">Verified Backlinks</div>
            <div class="score-val">170</div>
            <span style="font-size: 11px; color: #10b981; font-weight: bold;">+15.7% Growth</span>
          </div>
          <div class="score-box">
            <div class="score-title">Target Geographic Market</div>
            <div class="score-val" style="font-size: 24px; margin: 18px 0;">India / Global</div>
            <span class="badge badge-important">Target Calibrated</span>
          </div>
        </div>

        <h3 style="margin-top: 30px; font-size: 16px;">Technical SEO Issues Breakdown (5 Detected)</h3>
        <table class="table">
          <thead>
            <tr>
              <th>Issue Summary</th>
              <th>Impact</th>
              <th>Root Cause & Diagnosis</th>
              <th>Automated AI Recommendation</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>2 pages have duplicate title tags</strong></td>
              <td><span class="badge badge-important">Important</span></td>
              <td>Causes keyword cannibalization between identical topic pages.</td>
              <td>Differentiate page titles by integrating specific sub-service qualifiers.</td>
            </tr>
            <tr>
              <td><strong>1 page has title tag too long</strong></td>
              <td><span class="badge badge-important">Important</span></td>
              <td>Exceeds 69 characters; truncated on mobile search results.</td>
              <td>Shorten to under 65 characters keeping focus keyword at the front.</td>
            </tr>
            <tr>
              <td><strong>10 pages missing meta descriptions</strong></td>
              <td><span class="badge badge-important">Important</span></td>
              <td>Search engines extract arbitrary text, reducing CTR by ~22%.</td>
              <td>Inject descriptive meta summaries between 120-160 characters.</td>
            </tr>
            <tr>
              <td><strong>21 pages missing image alt text</strong></td>
              <td><span class="badge badge-minor">Minor</span></td>
              <td>Image search and accessibility crawlers miss graphic context.</td>
              <td>Apply automated semantic alt text attributes to technical diagrams.</td>
            </tr>
            <tr>
              <td><strong>5 pages lack structured schema</strong></td>
              <td><span class="badge badge-minor">Minor</span></td>
              <td>Pages miss rich snippet badges and LLM entity attribution.</td>
              <td>Deploy JSON-LD TechArticle & BreadcrumbList structured data.</td>
            </tr>
          </tbody>
        </table>

        <h3 style="margin-top: 30px; font-size: 16px;">Top Audited Pages Sample</h3>
        <table class="table">
          <thead>
            <tr>
              <th>Page URL</th>
              <th>Status</th>
              <th>Page Title</th>
              <th>Meta Description Length</th>
              <th>Word Count</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>https://${cleanDomain}/rotary-kiln-manufacturing</td>
              <td><span class="badge badge-success">200 OK</span></td>
              <td>Industrial Rotary Kiln Manufacturing (46 chars)</td>
              <td>153 characters (Optimal)</td>
              <td>3,982 words</td>
            </tr>
            <tr>
              <td>https://${cleanDomain}/ball-mill-transmissions</td>
              <td><span class="badge badge-success">200 OK</span></td>
              <td>How Ball Mills Turn Materials (47 chars)</td>
              <td>155 characters (Optimal)</td>
              <td>4,834 words</td>
            </tr>
            <tr>
              <td>https://${cleanDomain}/sulphur-90-wdg</td>
              <td><span class="badge badge-success">200 OK</span></td>
              <td>Sulphur 90 WDG Boosts Industry (51 chars)</td>
              <td>133 characters (Optimal)</td>
              <td>3,251 words</td>
            </tr>
          </tbody>
        </table>

        <div class="footer">
          Autonomous Report generated by <strong>Rank Monk</strong> • The Autonomous Search & AEO OS • Confirmed for ${cleanDomain}
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 400);
  };

  // Realistic Crawled Pages matching SoloSpider Screenshot 5
  const pagesList = useMemo(() => [
    {
      id: 'p1',
      url: `https://${cleanDomain}/rotary-kiln-manufacturing`,
      status: 200,
      title: 'Industrial Rotary Kiln Manufacturing',
      titleChars: 46,
      metaDesc: 'High-quality rotary kilns designed for heavy-duty calcination and industrial minerals processing with maximum energy efficiency.',
      metaChars: 153,
      h1: null,
      wordCount: 3982,
    },
    {
      id: 'p2',
      url: `https://${cleanDomain}/ball-mill-transmissions`,
      status: 200,
      title: 'How Ball Mills Turn Materials into Fine Powder',
      titleChars: 47,
      metaDesc: 'Understand how ball mills grind and process coarse materials into superfine granules with modern engineering precision.',
      metaChars: 155,
      h1: 'FAQ & Technical Benchmarks',
      wordCount: 4834,
    },
    {
      id: 'p3',
      url: `https://${cleanDomain}/sulphur-90-wdg`,
      status: 200,
      title: 'Sulphur 90 WDG Boosts Agricultural Velocity',
      titleChars: 51,
      metaDesc: 'Discover how Sulphur 90 WDG formulations improve crop yields and mineral absorption through uniform dispersion.',
      metaChars: 133,
      h1: null,
      wordCount: 3251,
    },
    {
      id: 'p4',
      url: `https://${cleanDomain}/rotary-dryers-industrial`,
      status: 200,
      title: 'Industrial Rotary Dryers & Drum Systems',
      titleChars: 55,
      metaDesc: 'Understand rotary dryers role in handling bulk mineral solids, reducing moisture content with continuous thermodynamic flow.',
      metaChars: 143,
      h1: 'The Role of Rotary Dryers',
      wordCount: 3398,
    },
    {
      id: 'p5',
      url: `https://${cleanDomain}/sulphur-wdg-80`,
      status: 200,
      title: 'Sulphur WDG 80 Machines & Extruder Solutions',
      titleChars: 53,
      metaDesc: 'Explore how Sulphur WDG 80 machinery operates with high throughput and low dust emissions for enterprise producers.',
      metaChars: 136,
      h1: null,
      wordCount: 3239,
    },
    {
      id: 'p6',
      url: `https://${cleanDomain}/iron-ore-pelletizing`,
      status: 200,
      title: 'Iron Ore Pelletizing Plants: Full Technical Guide',
      titleChars: 50,
      metaDesc: 'Discover how iron ore pelletizing facilities process low-grade iron fines into high-density furnace-ready spheres.',
      metaChars: 154,
      h1: 'Iron Ore Pelletizing Overview',
      wordCount: 3089,
    },
    {
      id: 'p7',
      url: `https://${cleanDomain}/about-us`,
      status: 200,
      title: `${brandName} — Engineering Legacy & Manufacturing Excellence`,
      titleChars: 58,
      metaDesc: `Founded to engineer the finest industrial machinery, ${brandName} is dedicated to client satisfaction and global delivery standards.`,
      metaChars: 148,
      h1: `About ${brandName}`,
      wordCount: 2150,
    },
    {
      id: 'p8',
      url: `https://${cleanDomain}/contact`,
      status: 200,
      title: `Contact Us — Request Quote & Plant Specifications`,
      titleChars: 49,
      metaDesc: `Get in touch with our engineering team for customized plant machinery layouts, pricing quotes, and technical consultations.`,
      metaChars: 142,
      h1: 'Get in Touch with our Engineers',
      wordCount: 1420,
    }
  ], [cleanDomain, brandName]);

  // SEO Issues Detailed Breakdown List matching SoloSpider Screenshot 3 & 4
  const issuesList = useMemo(() => [
    {
      id: 'dup-titles',
      title: '2 pages have duplicate title tags',
      desc: 'Duplicate titles force your own pages to compete against each other in index rankings.',
      impact: 'Important' as const,
      impactBadge: 'bg-amber-50 text-amber-700 border-amber-200',
      howToFix: 'Differentiate page titles to indicate target audience or context distinctness.',
      difficulty: 'EASY',
      impactLevel: 'MEDIUM',
      whatIsThis: "Duplicate title tags occur when multiple pages share the exact same title tag. This causes 'keyword cannibalization', where your own pages compete against one another for search rankings, confusing search crawlers.",
      howDoIFix: 'Ensure every page has a distinct title that describes its unique content. Integrate local qualifiers or category specifiers to differentiate pages with similar content structures.',
      failedPages: [
        { id: 'f1', url: `https://${cleanDomain}/how-to-choose-sulphur-grinding-plant` },
        { id: 'f2', url: `https://${cleanDomain}/sulphur-grinding-plant-specifications` }
      ]
    },
    {
      id: 'title-long',
      title: '1 page has a title tag that is too long',
      desc: 'Title tags should be under 69 characters to prevent truncation in search engine result pages.',
      impact: 'Important' as const,
      impactBadge: 'bg-amber-50 text-amber-700 border-amber-200',
      howToFix: 'Shorten page title tags to be under 69 characters.',
      difficulty: 'EASY',
      impactLevel: 'HIGH',
      whatIsThis: 'Title tags that exceed 69 characters get cut off by Google on desktop and mobile viewports with an ellipsis (...), which depresses organic CTR and hides important brand signals.',
      howDoIFix: 'Trim filler words and place the core primary keyword within the first 45 characters. Keep brand affix concise.',
      failedPages: [
        { id: 'f3', url: `https://${cleanDomain}/complete-industrial-rotary-calciner-and-grinding-solutions-india` }
      ]
    },
    {
      id: 'missing-meta',
      title: '10 pages are missing meta descriptions',
      desc: 'Descriptions determine search result snippets. Short/missing text drops click-through utility.',
      impact: 'Important' as const,
      impactBadge: 'bg-amber-50 text-amber-700 border-amber-200',
      howToFix: 'Add descriptive snippets between 120-160 characters describing content utility.',
      difficulty: 'EASY',
      impactLevel: 'MEDIUM',
      whatIsThis: 'When a page lacks a meta description, Google attempts to scrape whatever random text it finds on the page, often resulting in messy, unclickable SERP snippets.',
      howDoIFix: 'Add a concise, compelling 140-155 character meta description summarizing the key benefit and a subtle action trigger.',
      failedPages: [
        { id: 'f4', url: `https://${cleanDomain}/products/calcination-machinery` },
        { id: 'f5', url: `https://${cleanDomain}/products/fluid-bed-dryers` },
        { id: 'f6', url: `https://${cleanDomain}/case-studies/cement-plant-optimization` }
      ]
    },
    {
      id: 'missing-alt',
      title: '21 pages are missing alt text',
      desc: 'Image alt attributes allow search crawlers to parse visual topics and improve image search traffic.',
      impact: 'Minor' as const,
      impactBadge: 'bg-slate-100 text-slate-700 border-slate-200',
      howToFix: 'Provide concise descriptive alt text for key product diagrams and logos.',
      difficulty: 'EASY',
      impactLevel: 'LOW',
      whatIsThis: 'Search engine crawlers cannot "see" images without alt text. Missing alt text misses out on Google Images traffic and impairs accessibility compliance.',
      howDoIFix: 'Add an informative alt="Description of machinery" tag to all img elements.',
      failedPages: [
        { id: 'f7', url: `https://${cleanDomain}/gallery/rotary-dryer-diagram` }
      ]
    },
    {
      id: 'missing-schema',
      title: '5 pages lack structured JSON-LD schema',
      desc: 'Structured data provides rich snippet eligibility in Google SERPs and feeds LLM entity indices.',
      impact: 'Minor' as const,
      impactBadge: 'bg-slate-100 text-slate-700 border-slate-200',
      howToFix: 'Inject Organization, WebPage, and Product schema JSON-LD scripts.',
      difficulty: 'MEDIUM',
      impactLevel: 'MEDIUM',
      whatIsThis: 'Structured schema in JSON-LD format informs Google Gemini, ChatGPT, and Google Search precisely what type of business entity and product is present.',
      howDoIFix: 'Insert schema.org compliant JSON-LD blocks in the page head.',
      failedPages: [
        { id: 'f8', url: `https://${cleanDomain}/solutions/mineral-grinding` }
      ]
    }
  ], [cleanDomain]);

  // Filtered Issues
  const filteredIssues = useMemo(() => {
    return issuesList.filter(issue => {
      if (issueFilter === 'critical') return (issue.impact as string) === 'Critical';
      if (issueFilter === 'important') return issue.impact === 'Important';
      if (issueFilter === 'minor') return issue.impact === 'Minor';
      if (issuesSearchQuery) {
        return issue.title.toLowerCase().includes(issuesSearchQuery.toLowerCase()) ||
               issue.desc.toLowerCase().includes(issuesSearchQuery.toLowerCase());
      }
      return true;
    });
  }, [issuesList, issueFilter, issuesSearchQuery]);

  // Filtered Pages
  const filteredPages = useMemo(() => {
    return pagesList.filter(p => {
      if (pagesSearchQuery) {
        return p.url.toLowerCase().includes(pagesSearchQuery.toLowerCase()) ||
               p.title.toLowerCase().includes(pagesSearchQuery.toLowerCase());
      }
      return true;
    });
  }, [pagesList, pagesSearchQuery]);

  const topCompetitors = (project?.competitors && project.competitors.length > 0)
    ? project.competitors.map((c: any) => typeof c === 'string' ? c : (c.domain || c.name))
    : ['cairnindia.com', 'essar.com', 'relianceind.com'];

  return (
    <div className="space-y-6 animate-fade-in max-w-[1600px] mx-auto pb-10">
      {/* 1. Header with Crawl Limit, Re-Run Audit & Download Full PDF */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#2b1b12] tracking-tight">
            SEO Audit
          </h1>
          <p className="text-xs sm:text-sm text-[#6f5a4c] font-medium mt-1">
            We scanned your website and found issues that can improve your ranking.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Crawl Limit Dropdown */}
          <div className="flex items-center gap-1.5 bg-white border border-[#e4d6c6] rounded-xl px-3 py-1.5 text-xs font-bold shadow-sm">
            <span className="text-[#6f5a4c] uppercase text-[10px] tracking-wider">Crawl Limit:</span>
            <select
              value={crawlLimit}
              onChange={(e) => setCrawlLimit(e.target.value)}
              className="bg-transparent text-[#2b1b12] focus:outline-none cursor-pointer"
            >
              <option value="50">50 pages</option>
              <option value="100">100 pages</option>
              <option value="250">250 pages</option>
            </select>
          </div>

          {/* Re-run Audit Button */}
          <button
            type="button"
            disabled={isReRunningAudit}
            onClick={handleReRunAudit}
            className="flex items-center gap-1.5 bg-white hover:bg-[#f8f3ec] border border-[#e4d6c6] text-[#2b1b12] text-xs font-bold py-2 px-3.5 rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-60"
          >
            {isReRunningAudit ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#c5a059]" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" />
            )}
            <span>Re-run Audit</span>
          </button>

          {/* Download Full PDF Report (sitefire.ai / SoloSpider Style) */}
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="flex items-center gap-1.5 bg-[#2b1b12] hover:bg-[#3b2519] text-[#fffcf7] text-xs font-bold py-2 px-4 rounded-xl shadow-sm transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#c5a059]" />
            <span>Download Full PDF</span>
          </button>

          {/* Last Scanned Timestamp */}
          <div className="text-right text-[11px] hidden sm:block border-l border-[#e4d6c6] pl-3">
            <span className="text-[#6f5a4c] block font-semibold">Last scanned:</span>
            <span className="font-bold text-[#2b1b12]">Jun 29, 2026, 5:47 PM</span>
          </div>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3.5 bg-[#eef7ec] border border-[#84e1bc] rounded-xl text-xs text-[#03543f] font-semibold flex items-center justify-between shadow-sm animate-fade-in">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-[#03543f] font-bold">✕</button>
        </div>
      )}

      {/* 2. Top 4 Metric Cards (Matching Screenshot 2) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: On-Page SEO Score */}
        <div className="bg-white rounded-2xl border border-[#e4d6c6] p-5 shadow-sm flex flex-col justify-between hover:border-[#c5a059] transition-all">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-[#6f5a4c] font-black text-[11px] uppercase tracking-wider">On-Page SEO Score</h3>
            <span className="text-slate-400 text-xs">ⓘ</span>
          </div>
          <div className="flex items-center gap-4 mt-2">
            <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="32" stroke="#f1e8dc" strokeWidth="6" fill="transparent" />
                <circle
                  cx="40"
                  cy="40"
                  r="32"
                  stroke="#10b981"
                  strokeWidth="6"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 32}
                  strokeDashoffset={2 * Math.PI * 32 * (1 - 83 / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-lg font-black text-[#2b1b12]">83</span>
              </div>
            </div>
            <div>
              <div className="text-sm font-bold text-emerald-600">Excellent</div>
              <div className="text-[11px] text-[#6f5a4c] font-medium mt-0.5 cursor-pointer hover:underline" onClick={() => setActiveSubTab('issues')}>
                Click to view issues
              </div>
            </div>
          </div>
        </div>

        {/* Metric 2: Organic Monthly Traffic */}
        <div className="bg-white rounded-2xl p-5 border border-[#e4d6c6] shadow-sm relative overflow-hidden flex flex-col justify-between hover:border-[#c5a059] transition-all">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-[#6f5a4c] font-black text-[11px] uppercase tracking-wider">Organic Monthly Traffic</h3>
          </div>
          <div className="filter blur-[6px] select-none opacity-40 mt-2 space-y-1">
            <div className="text-2xl font-black text-slate-800">8,210</div>
            <div className="h-6 w-full bg-emerald-100 rounded" />
          </div>
          <div className="absolute inset-0 bg-[#fffcf7]/75 backdrop-blur-[2px] flex flex-col items-center justify-center p-3 text-center">
            <span className="px-2.5 py-0.5 bg-[#f1e8dc] text-[#7a5242] border border-[#d8c09e] rounded-md text-[10px] font-black tracking-wider uppercase mb-1">
              GSC Required
            </span>
            <span className="text-[11px] font-bold text-[#2b1b12]">Connect to unlock metric</span>
          </div>
        </div>

        {/* Metric 3: Organic Keywords */}
        <div className="bg-white rounded-2xl p-5 border border-[#e4d6c6] shadow-sm relative overflow-hidden flex flex-col justify-between hover:border-[#c5a059] transition-all">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-[#6f5a4c] font-black text-[11px] uppercase tracking-wider">Organic Keywords</h3>
          </div>
          <div className="filter blur-[6px] select-none opacity-40 mt-2 space-y-1">
            <div className="text-2xl font-black text-slate-800">677</div>
            <div className="h-6 w-full bg-purple-100 rounded" />
          </div>
          <div className="absolute inset-0 bg-[#fffcf7]/75 backdrop-blur-[2px] flex flex-col items-center justify-center p-3 text-center">
            <span className="px-2.5 py-0.5 bg-[#f1e8dc] text-[#7a5242] border border-[#d8c09e] rounded-md text-[10px] font-black tracking-wider uppercase mb-1">
              GSC Required
            </span>
            <span className="text-[11px] font-bold text-[#2b1b12]">Connect to unlock metric</span>
          </div>
        </div>

        {/* Metric 4: Backlinks */}
        <div className="bg-white rounded-2xl border border-[#e4d6c6] p-5 shadow-sm flex flex-col justify-between hover:border-[#c5a059] transition-all">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-[#6f5a4c] font-black text-[11px] uppercase tracking-wider">Backlinks</h3>
            <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-[#2b1b12]">170</span>
              <span className="text-xs font-bold text-emerald-600">+15.7% ↗</span>
            </div>
            <div className="text-[11px] text-[#6f5a4c] font-medium mt-1 cursor-pointer hover:underline" onClick={() => onNavigateTab('backlinks')}>
              Click to view backlink profile
            </div>
          </div>
        </div>
      </div>

      {/* 3. Target Market & Competitors (Matching Screenshot 2) */}
      <div className="bg-white rounded-2xl border border-[#e4d6c6] p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-bold text-xs uppercase tracking-wider text-[#2b1b12] flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-purple-600" />
            Target Market & Competitors
          </h3>
          <span className="text-[11px] font-bold text-[#7a5242] uppercase tracking-wider">
            Domain Profile
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6f5a4c] block mb-1">
              Primary Target Market
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#2b1b12] flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-emerald-600" /> India
              </span>
            </div>
            <p className="text-[11px] text-[#6f5a4c] mt-1 leading-relaxed">
              Based on website content, targeting indicators, and crawler domain analysis.
            </p>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6f5a4c] block mb-1.5">
              Top Competitor Domains
            </span>
            <div className="flex flex-wrap gap-2">
              {topCompetitors.map((comp: string, i: number) => (
                <a
                  key={i}
                  href={`https://${comp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  <span>{comp}</span>
                  <ExternalLink className="w-3 h-3 text-purple-600" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Crawl Health Section (Matching Screenshot 2 & 3) */}
      <div className="bg-white rounded-2xl border border-[#e4d6c6] p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-bold text-xs uppercase tracking-wider text-[#2b1b12]">
            Crawl Health
          </h3>
          <span className="text-[11px] font-bold text-[#6f5a4c] uppercase tracking-wider">
            Pages Crawled
          </span>
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Gauge & Total */}
          <div className="flex items-center gap-5 shrink-0">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="32" stroke="#f1e8dc" strokeWidth="6" fill="transparent" />
                <circle
                  cx="40"
                  cy="40"
                  r="32"
                  stroke="#10b981"
                  strokeWidth="6"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 32}
                  strokeDashoffset={0}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-xs font-black text-[#2b1b12]">100%</span>
                <span className="text-[8px] text-emerald-600 font-bold uppercase">Success</span>
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-[#2b1b12]">50</div>
              <div className="text-[10px] uppercase font-bold text-[#6f5a4c] tracking-wider">
                Total Pages Crawled
              </div>
            </div>
          </div>

          {/* 4 Status Boxes */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1 w-full">
            <div className="p-3 bg-[#f8f3ec] border border-[#e4d6c6] rounded-xl text-xs">
              <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Successful
              </span>
              <div className="text-lg font-black text-[#2b1b12] mt-1">50</div>
            </div>

            <div className="p-3 bg-[#f8f3ec] border border-[#e4d6c6] rounded-xl text-xs">
              <span className="text-[10px] font-bold text-blue-600 flex items-center gap-1 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Redirected
              </span>
              <div className="text-lg font-black text-[#2b1b12] mt-1">0</div>
            </div>

            <div className="p-3 bg-[#f8f3ec] border border-[#e4d6c6] rounded-xl text-xs">
              <span className="text-[10px] font-bold text-red-600 flex items-center gap-1 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Broken
              </span>
              <div className="text-lg font-black text-[#2b1b12] mt-1">0</div>
            </div>

            <div className="p-3 bg-[#f8f3ec] border border-[#e4d6c6] rounded-xl text-xs">
              <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" /> Blocked
              </span>
              <div className="text-lg font-black text-[#2b1b12] mt-1">0</div>
            </div>
          </div>

          {/* See All Pages Button */}
          <button
            type="button"
            onClick={() => setActiveSubTab('pages')}
            className="px-5 py-2.5 bg-white border border-[#e4d6c6] hover:bg-[#f8f3ec] text-[#2b1b12] text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer shrink-0"
          >
            See All Pages
          </button>
        </div>
      </div>

      {/* 5. Sub-Tabs Bar: SEO Issues (5) vs Audited Pages (50) */}
      <div className="bg-white rounded-2xl border border-[#e4d6c6] shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-100 px-6 pt-4 bg-[#f8f3ec]/30 gap-3">
          <div className="flex gap-6">
            <button
              type="button"
              onClick={() => setActiveSubTab('issues')}
              className={`pb-4 text-sm font-black transition-all border-b-2 cursor-pointer ${
                activeSubTab === 'issues'
                  ? 'border-purple-600 text-purple-700'
                  : 'border-transparent text-[#6f5a4c] hover:text-[#2b1b12]'
              }`}
            >
              SEO Issues (5)
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('pages')}
              className={`pb-4 text-sm font-black transition-all border-b-2 cursor-pointer ${
                activeSubTab === 'pages'
                  ? 'border-purple-600 text-purple-700'
                  : 'border-transparent text-[#6f5a4c] hover:text-[#2b1b12]'
              }`}
            >
              Audited Pages (50)
            </button>
          </div>

          <span className="text-xs font-semibold text-[#6f5a4c] pb-3 sm:pb-0">
            All audits up to date
          </span>
        </div>

        {/* SUB-TAB 1: SEO ISSUES */}
        {activeSubTab === 'issues' && (
          <div className="p-5 sm:p-6 space-y-5">
            {/* Filter Pills & Search / Export Row */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'all', label: 'All Issues' },
                  { id: 'critical', label: 'Critical' },
                  { id: 'important', label: 'Important' },
                  { id: 'minor', label: 'Minor' },
                  { id: 'passed', label: 'Passed' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setIssueFilter(f.id as any)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      issueFilter === f.id
                        ? 'bg-purple-100 text-purple-800 border border-purple-300'
                        : 'bg-[#f8f3ec] text-[#6f5a4c] border border-[#e4d6c6] hover:bg-[#ebdcc8]'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={issuesSearchQuery}
                    onChange={(e) => setIssuesSearchQuery(e.target.value)}
                    placeholder="Search issues..."
                    className="w-full pl-8 pr-3 py-1.5 bg-[#f8f3ec] border border-[#e4d6c6] rounded-xl text-xs text-[#2b1b12] focus:outline-none focus:border-[#2b1b12]"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleExportIssuesCsv}
                  className="px-3.5 py-1.5 bg-white border border-[#e4d6c6] hover:bg-[#f8f3ec] text-[#2b1b12] rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Issues List with Expandable Breakdown (Screenshot 3 & 4) */}
            <div className="border border-[#e4d6c6] rounded-2xl overflow-hidden divide-y divide-[#e4d6c6]">
              {/* Header */}
              <div className="grid grid-cols-12 p-3.5 bg-[#f8f3ec]/60 text-[10px] font-black uppercase tracking-wider text-[#6f5a4c]">
                <div className="col-span-5">Issue</div>
                <div className="col-span-2">Impact</div>
                <div className="col-span-4">How To Fix</div>
                <div className="col-span-1 text-right">Action</div>
              </div>

              {filteredIssues.map((issue) => {
                const isExpanded = expandedIssueId === issue.id;
                return (
                  <div key={issue.id} className="transition-colors hover:bg-[#f8f3ec]/30">
                    {/* Row Summary */}
                    <div className="grid grid-cols-12 p-4 items-center gap-2 text-xs">
                      <div className="col-span-5 flex items-start gap-2.5">
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold text-[#2b1b12] flex items-center gap-1">
                            <span>{issue.title}</span>
                            <span className="text-slate-400 text-[11px] cursor-help">ⓘ</span>
                          </div>
                          <p className="text-[11px] text-[#6f5a4c] mt-0.5 leading-relaxed">
                            {issue.desc}
                          </p>
                        </div>
                      </div>

                      <div className="col-span-2">
                        <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold border ${issue.impactBadge}`}>
                          {issue.impact}
                        </span>
                      </div>

                      <div className="col-span-4 text-[#6f5a4c] text-[11px] font-medium leading-relaxed">
                        {issue.howToFix}
                      </div>

                      <div className="col-span-1 text-right">
                        <button
                          type="button"
                          onClick={() => setExpandedIssueId(isExpanded ? null : issue.id)}
                          className="px-2.5 py-1 text-xs font-bold border border-[#e4d6c6] rounded-lg bg-white hover:bg-[#f8f3ec] text-[#2b1b12] transition-colors cursor-pointer inline-flex items-center gap-1"
                        >
                          <span>{isExpanded ? 'Hide' : 'Details'}</span>
                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>

                    {/* Expandable Diagnostic Breakdown (Screenshot 4) */}
                    {isExpanded && (
                      <div className="p-5 bg-white border-t border-[#e4d6c6] space-y-4 animate-fade-in">
                        {/* What is this & How do I fix */}
                        <div className="p-4 bg-[#f8f3ec] border border-[#e4d6c6] rounded-xl space-y-3 text-xs">
                          <div>
                            <span className="font-black text-[10px] text-[#2b1b12] uppercase tracking-wider block mb-1">
                              WHAT IS THIS ISSUE?
                            </span>
                            <p className="text-[#6f5a4c] leading-relaxed">
                              {issue.whatIsThis}
                            </p>
                          </div>

                          <div>
                            <span className="font-black text-[10px] text-[#2b1b12] uppercase tracking-wider block mb-1">
                              HOW DO I FIX IT?
                            </span>
                            <p className="text-[#6f5a4c] leading-relaxed">
                              {issue.howDoIFix}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-[#e4d6c6] flex gap-4 text-[10px] font-bold text-[#6f5a4c] uppercase tracking-wider">
                            <span>DIFFICULTY: <strong className="text-[#2b1b12]">{issue.difficulty}</strong></span>
                            <span>•</span>
                            <span>SEO IMPACT: <strong className="text-amber-600">{issue.impactLevel}</strong></span>
                          </div>
                        </div>

                        {/* Failed URL Breakdown */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-[#6f5a4c]">
                            <span>Failed URL Breakdown ({issue.failedPages.length})</span>
                            <span>Copy or test direct link</span>
                          </div>

                          <div className="space-y-1.5">
                            {issue.failedPages.map((page, idx) => (
                              <div
                                key={page.id}
                                className="flex items-center justify-between p-2.5 bg-white border border-[#e4d6c6] rounded-xl text-xs"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="font-mono text-[11px] text-[#6f5a4c]">{idx + 1}</span>
                                  <span className="font-mono text-[#2b1b12] truncate">{page.url}</span>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  {aiFixedUrls[page.url] ? (
                                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-[10px] font-bold flex items-center gap-1">
                                      <Check className="w-3 h-3" /> Fixed with AI
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleAiFixUrl(page.url, issue.id)}
                                      className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                                    >
                                      <Sparkles className="w-3 h-3 text-purple-200" />
                                      <span>AI Fix</span>
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => handleCopy(page.url)}
                                    className="p-1 rounded-md text-slate-400 hover:text-black border border-slate-200 hover:bg-slate-50 transition-colors"
                                    title="Copy URL"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </button>

                                  <a
                                    href={page.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1 rounded-md text-slate-400 hover:text-black border border-slate-200 hover:bg-slate-50 transition-colors"
                                    title="Open page in new tab"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SUB-TAB 2: AUDITED PAGES (Screenshot 5) */}
        {activeSubTab === 'pages' && (
          <div className="p-5 sm:p-6 space-y-5">
            {/* Filter Dropdown & Search / Export Row */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-center gap-2 bg-[#f8f3ec] border border-[#e4d6c6] rounded-xl px-3 py-1.5 text-xs font-bold">
                <span className="text-[#6f5a4c] uppercase text-[10px] tracking-wider">FILTER BY:</span>
                <select
                  value={pageFilter}
                  onChange={(e) => setPageFilter(e.target.value)}
                  className="bg-transparent text-[#2b1b12] focus:outline-none cursor-pointer"
                >
                  <option value="all">All Pages (50)</option>
                  <option value="issues">Pages with Issues (34)</option>
                  <option value="healthy">Healthy Pages (16)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-72">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={pagesSearchQuery}
                    onChange={(e) => setPagesSearchQuery(e.target.value)}
                    placeholder="Search pages by URL or Title..."
                    className="w-full pl-8 pr-3 py-1.5 bg-[#f8f3ec] border border-[#e4d6c6] rounded-xl text-xs text-[#2b1b12] focus:outline-none focus:border-[#2b1b12]"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleExportPagesCsv}
                  className="px-3.5 py-1.5 bg-white border border-[#e4d6c6] hover:bg-[#f8f3ec] text-[#2b1b12] rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Audited Pages Table (Screenshot 5 exact table) */}
            <div className="overflow-x-auto border border-[#e4d6c6] rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#f8f3ec]/60 border-b border-[#e4d6c6] text-[10px] font-black uppercase tracking-wider text-[#6f5a4c]">
                    <th className="p-3.5">Page URL</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Title</th>
                    <th className="p-3.5">Meta Description</th>
                    <th className="p-3.5">H1</th>
                    <th className="p-3.5">Word Count</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e4d6c6]">
                  {filteredPages.map((page) => (
                    <tr key={page.id} className="hover:bg-[#f8f3ec]/40 transition-colors">
                      <td className="p-3.5 font-medium text-slate-800 max-w-[200px]">
                        <div className="flex items-center gap-2">
                          <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{page.url}</span>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                          {page.status}
                        </span>
                      </td>

                      <td className="p-3.5 max-w-[180px]">
                        <div className="font-semibold text-[#2b1b12] truncate">{page.title}</div>
                        <span className="text-[10px] text-[#6f5a4c]">{page.titleChars} chars</span>
                      </td>

                      <td className="p-3.5 max-w-[220px]">
                        <div className="text-[11px] text-[#6f5a4c] truncate">{page.metaDesc}</div>
                        <span className="text-[10px] text-[#6f5a4c]">{page.metaChars} chars</span>
                      </td>

                      <td className="p-3.5">
                        {page.h1 ? (
                          <span className="text-[11px] text-[#2b1b12] font-medium truncate max-w-[120px] block">
                            {page.h1}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-bold text-[10px] border border-amber-200">
                            Missing H1
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 font-bold text-[#2b1b12]">
                        {page.wordCount}
                      </td>

                      <td className="p-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => showToast(`Audited details for ${page.url} are calibrated.`)}
                          className="p-1 rounded-lg border border-[#e4d6c6] bg-white hover:bg-[#f8f3ec] text-slate-600 cursor-pointer"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
