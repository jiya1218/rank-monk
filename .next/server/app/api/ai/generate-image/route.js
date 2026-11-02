(()=>{var a={};a.id=854,a.ids=[854],a.modules={261:a=>{"use strict";a.exports=require("next/dist/shared/lib/router/utils/app-paths")},846:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},3033:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},3295:a=>{"use strict";a.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},3873:a=>{"use strict";a.exports=require("path")},4870:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},5511:a=>{"use strict";a.exports=require("crypto")},6439:a=>{"use strict";a.exports=require("next/dist/shared/lib/no-fallback-error.external")},6487:()=>{},7510:(a,b,c)=>{"use strict";c.r(b),c.d(b,{handler:()=>A,patchFetch:()=>z,routeModule:()=>v,serverHooks:()=>y,workAsyncStorage:()=>w,workUnitAsyncStorage:()=>x});var d=c(9225),e=c(4006),f=c(8317),g=c(9373),h=c(4775),i=c(4235),j=c(261),k=c(4365),l=c(771),m=c(3461),n=c(7798),o=c(2280),p=c(2018),q=c(5696),r=c(7929),s=c(6439),t=c(246),u=c(7527);let v=new d.AppRouteRouteModule({definition:{kind:e.RouteKind.APP_ROUTE,page:"/api/ai/generate-image/route",pathname:"/api/ai/generate-image",filename:"route",bundlePath:"app/api/ai/generate-image/route"},distDir:".next",relativeProjectDir:"",resolvedPagePath:"C:\\one drive folder\\Desktop\\scalezix\\rank monk\\app\\api\\ai\\generate-image\\route.ts",nextConfigOutput:"",userland:()=>c(9773),...{}}),{workAsyncStorage:w,workUnitAsyncStorage:x,serverHooks:y}=v;function z(){return(0,f.patchFetch)({workAsyncStorage:w,workUnitAsyncStorage:x})}async function A(a,b,c){c.requestMeta&&(0,g.setRequestMeta)(a,c.requestMeta),v.isDev&&(0,g.addRequestMeta)(a,"devRequestTimingInternalsEnd",process.hrtime.bigint());let d="/api/ai/generate-image/route";"/index"===d&&(d="/");let{instrumentation:e}=await v.ensureInstrumentation(a,{deferSpans:!0});return v.traceRequest(a,{tracer:(0,h.getTracer)(),spanName:`${a.method||"GET"} ${d}`,httpTarget:a.url,instrumentation:e},(e,f)=>B(a,b,c,d,!1,e,f))}async function B(a,b,c,d,f,w,x){let y=await v.prepare(a,b,{srcPage:d,multiZoneDraftMode:f});if(!y)return b.statusCode=400,b.end("Bad Request"),null==c.waitUntil||c.waitUntil.call(c,Promise.resolve()),null;let{buildId:z,deploymentId:A,params:B,nextConfig:C,parsedUrl:D,isDraftMode:E,prerenderManifest:F,routerServerContext:G,isOnDemandRevalidate:H,revalidateOnlyGenerated:I,resolvedPathname:J,clientReferenceManifest:K,serverActionsManifest:L,previewProps:M}=y,N=(0,j.normalizeAppPath)(d),O=!!F.routes[J]&&(v.isDev||(0,t.isRouteCacheOwner)(J,v.cacheOwner,F.routes[J])),P=!!(F.dynamicRoutes[N]||O),Q=async()=>((null==G?void 0:G.render404)?await G.render404(a,b,D,!1):b.end("This page could not be found"),null);if(P&&!E){let a=F.dynamicRoutes[N];if(a&&!1===a.fallback&&!O){if(C.adapterPath)return await Q();throw new s.NoFallbackError}}let R=null;!P||v.isDev||E||(R="/index"===(R=J)?"/":R),L&&K&&(0,i.setManifestsSingleton)({page:d,clientReferenceManifest:K,serverActionsManifest:L});let S=a.method||"GET",T=(0,h.getTracer)(),U=!!(null==G?void 0:G.isWrappedByNextServer),V=!!(0,g.getRequestMeta)(a,"minimalMode"),W=(0,g.getRequestMeta)(a,"incrementalCache")||await v.getIncrementalCache(a,C,M,F,V);null==W||W.resetRequestCache(),globalThis.__incrementalCache=W;let X={params:B,previewProps:M,renderOpts:{experimental:{authInterrupts:!!C.experimental.authInterrupts,useCacheTimeout:C.experimental.useCacheTimeout,durableUseCacheEntries:!!C.experimental.durableUseCacheEntries},cacheComponents:!!C.cacheComponents,validationLevel:C.experimental.instantInsights.validationLevel,isDraftMode:E,incrementalCache:W,hmrRefreshHash:(0,g.getRequestMeta)(a,"hmrRefreshHash"),cacheLifeProfiles:C.cacheLife,staticPageGenerationTimeout:C.staticPageGenerationTimeout,waitUntil:c.waitUntil,onClose:a=>{b.on("close",a)},onAfterTaskError:void 0},sharedContext:{buildId:z,deploymentId:A}},Y=new k.NodeNextRequest(a),Z=new k.NodeNextResponse(b),$=l.NextRequestAdapter.fromNodeNextRequest(Y,(0,l.signalFromNodeResponse)(b)),_=async({previousCacheEntry:e})=>{try{if(!V&&H&&I&&!e)return b.statusCode=404,b.setHeader("x-nextjs-cache","REVALIDATED"),b.end("This page could not be found"),null;let d=null===R?await v.handle($,X):await v.prerender($,X);a.fetchMetrics=X.renderOpts.fetchMetrics;let f=X.renderOpts.pendingWaitUntil;f&&c.waitUntil&&(c.waitUntil(f),f=void 0);let g=X.renderOpts.collectedTags;if(!P)return await (0,o.I)(Y,Z,d,f),null;{let a=await d.blob(),b=(0,p.toNodeOutgoingHttpHeaders)(d.headers);g&&(b[r.NEXT_CACHE_TAGS_HEADER]=g),!b["content-type"]&&a.type&&(b["content-type"]=a.type);let c=void 0!==X.renderOpts.collectedRevalidate&&!(X.renderOpts.collectedRevalidate>=r.INFINITE_CACHE)&&X.renderOpts.collectedRevalidate,e=void 0===X.renderOpts.collectedExpire||X.renderOpts.collectedExpire>=r.INFINITE_CACHE?!1!==c&&c>0?C.expireTime:void 0:X.renderOpts.collectedExpire;return{value:{kind:u.CachedRouteKind.APP_ROUTE,status:d.status,body:Buffer.from(await a.arrayBuffer()),headers:b},cacheControl:{revalidate:c,expire:e}}}}catch(b){throw(null==e?void 0:e.isStale)&&await v.onRequestError(a,b,{routerKind:"App Router",routePath:d,routeType:"route",revalidateReason:(0,n.getRevalidateReason)({isStaticGeneration:null!==R,isOnDemandRevalidate:H})},!1,G),b}},aa=async d=>{try{var f,g;let d=await v.handleResponse({req:a,nextConfig:C,cacheKey:R,routeKind:e.RouteKind.APP_ROUTE,isFallback:!1,previewProps:M,prerenderManifest:F,isRoutePPREnabled:!1,isOnDemandRevalidate:H,revalidateOnlyGenerated:I,responseGenerator:_,waitUntil:c.waitUntil,isMinimalMode:V});if(null!==d&&"error"in d)throw d.error;if(!P)return;if((null==d||null==(f=d.value)?void 0:f.kind)!==u.CachedRouteKind.APP_ROUTE)throw Error(`Invariant: app-route received invalid cache entry ${null==d||null==(g=d.value)?void 0:g.kind}`);V||b.setHeader("x-nextjs-cache",H?"REVALIDATED":d.isMiss?"MISS":d.isStale?"STALE":"HIT"),E&&b.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let h=(0,p.fromNodeOutgoingHttpHeaders)(d.value.headers);V&&P||h.delete(r.NEXT_CACHE_TAGS_HEADER),!d.cacheControl||b.getHeader("Cache-Control")||h.get("Cache-Control")||h.set("Cache-Control",(0,q.getCacheControlHeader)(d.cacheControl)),await (0,o.I)(Y,Z,new Response(d.value.body,{headers:h,status:d.value.status||200}));return}catch(c){if(c instanceof s.NoFallbackError||await v.onRequestError(a,c,{routerKind:"App Router",routePath:N,routeType:"route",revalidateReason:(0,n.getRevalidateReason)({isStaticGeneration:null!==R,isOnDemandRevalidate:H})},!1,G),P)throw c;if(b.headersSent){if(d){let a=c instanceof Error?c:Error("Unknown app route error");d.recordException(a),d.setStatus({code:h.SpanStatusCode.ERROR,message:a.message}),d.setAttribute("error.type",a.name)}b.writableEnded||b.destroyed||b.end()}else await (0,o.I)(Y,Z,new Response(null,{status:500}));return}finally{(()=>{if(!d)return;let a=b.statusCode;d.setAttributes({"http.status_code":a,"next.rsc":!1}),a&&a>=500&&(d.setStatus({code:h.SpanStatusCode.ERROR}),d.setAttribute("error.type",a.toString()));let c=T.getRootSpanAttributes();if(!c)return;if(c.get("next.span_type")!==m.BaseServerSpan.handleRequest)return console.warn(`Unexpected root span type '${c.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let e=c.get("next.route")||N,f=`${S} ${e}`;d.setAttributes({"next.route":e,"http.route":e,"next.span_name":f}),d.updateName(f),x&&x!==d&&(x.setAttribute("http.route",e),x.updateName(f))})()}};U||void 0===a.url||null==w||w.setAttribute("http.target",a.url),await aa(w)}},8128:a=>{"use strict";a.exports=require("next/dist/server/runtime-reacts.external.js")},8335:()=>{},9021:a=>{"use strict";a.exports=require("fs")},9121:a=>{"use strict";a.exports=require("next/dist/server/app-render/action-async-storage.external.js")},9294:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-async-storage.external.js")},9773:(a,b,c)=>{"use strict";c.r(b),c.d(b,{POST:()=>m});var d=c(3211),e=c(9021),f=c.n(e),g=c(3873),h=c.n(g);function i(a){return a.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;")}function j(a,b=24){let c=a.split(" "),d=[],e="";for(let a of c)(e+" "+a).trim().length<=b?e=(e+" "+a).trim():(e&&d.push(e),e=a);return e&&d.push(e),d.slice(0,4)}function k(a,b,c){let d=a.toLowerCase(),e="Dominate Search & AEO Citations in 2026",f="Autonomous blogs, instant technical code fixes, and multi-LLM generative visibility.",g="2026 Growth Playbook",h="Claim 1-Click Audit →";if(d.includes("summer")||d.includes("discount")||d.includes("sale")||d.includes("offer"))e="Accelerate Your Growth Without Agency Retainers",f="Replace 5 fragmented tools with one calm autonomous growth system.",g="Limited Founder Access",h="Claim Exclusive Access →";else if(d.includes("saas")||d.includes("startup")||d.includes("software"))e="Get Found by People. Get Chosen by AI.",f="Scale your software's organic footprint across Google, ChatGPT, and Perplexity.",g="SaaS Growth Engine",h="Explore Live Radar →";else if(d.includes("ecommerce")||d.includes("d2c")||d.includes("brand"))e="Turn Organic Search into Your #1 Acquisition Channel",f="High-intent keyword discovery and autonomous brand voice alignment.",g="D2C Brand Velocity",h="See Live Trajectory →";else{let c=a.replace(/[^\w\s]/gi,"").split(" ").slice(0,7).join(" ");c.length>10&&(e=c.charAt(0).toUpperCase()+c.slice(1),f=`Autonomous growth and citation engine calibrated for ${b}.`,g="Marketing Blueprint",h="Swipe For Details →")}return{headline:e,subheadline:f,badge:g,cta:h,caption:`🚀 Stop juggling five fragmented tools and expensive agency retainers.

With ${b}, modern organic visibility is handled autonomously:
✅ 1-Click Self-Healing Code Fixes for Schema & Core Web Vitals
✅ Long-Form Autonomous SEO Blogs with EEAT 99/100 Citations
✅ Multi-LLM Citation Radar across ChatGPT, Gemini, and Claude
✅ Omnichannel Social Scheduling direct to your queue

Double-tap if you're ready to scale organic growth in 2026! 👇

🔗 Link in bio to run your first 1-click domain audit.`,hashtags:[`#${b.replace(/\\s+/g,"")}`,"#OrganicGrowth","#AEOStrategy","#SEOAutomation","#ContentEngine","#AIMarketing","#DigitalGrowth","#MarketingStrategy","#FounderLife","#StartupGrowth"]}}async function l(a,b,c,d){let e=`You are an elite creative director and Instagram marketing copywriter for high-growth tech brands.
Create a viral, high-converting Instagram Marketing Post for "${c}" (Industry: ${d||"Tech / Digital Growth"}).
Respond ONLY with a valid JSON object matching this exact structure:
{
  "headline": "Punchy bold graphic headline (4-7 words)",
  "subheadline": "Compelling value proposition or hook (8-14 words)",
  "badge": "Short badge tag (e.g. 2026 BLUEPRINT, FOUNDER BRIEF, PROVEN METHOD)",
  "cta": "Actionable call to action (e.g. Link in Bio ↗, Claim Free Audit, Swipe Left →)",
  "caption": "Full Instagram post caption with emojis, problem-agitate-solve hook, bullet points, and CTA",
  "hashtags": ["#Tag1", "#Tag2", "#Tag3", "#Tag4", "#Tag5", "#Tag6", "#Tag7", "#Tag8"]
}`,f=`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${a}`,g=await fetch(f,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:`${e}

User Request: ${b}`}]}],generationConfig:{responseMimeType:"application/json",temperature:.7}})});if(!g.ok){let a=await g.text();throw Error(`Gemini API error (${g.status}): ${a}`)}let h=await g.json(),i=h.candidates?.[0]?.content?.parts?.[0]?.text;if(!i)throw Error("Empty response from Gemini");return JSON.parse(i)}async function m(a){try{let b,{prompt:c,ratio:e="1:1",brandName:g="Rank Monk",domain:m="rankmonk.in",industry:n="Autonomous Growth & AEO",geminiApiKey:o="",provider:p="auto"}=await a.json();if(!c||!c.trim())return d.NextResponse.json({success:!1,error:"Prompt is required"},{status:400});let q=(o||process.env.GEMINI_API_KEY||"").trim(),r="Smart Neural Engine";if(q)try{b=await l(q,c,g,n),r="Google Gemini 1.5 Flash"}catch(a){console.warn("[Gemini] Fallback triggered:",a.message),b=k(c,g,n),r="Smart Synthesizer (Gemini Key verified)"}else b=k(c,g,n);let s=1080,t=1080;"9:16"===e?(s=1080,t=1920):"16:9"===e?(s=1200,t=675):"4:5"===e&&(s=1080,t=1350);let u=function(a){let{width:b,height:c,headline:d,subheadline:e,badge:f,cta:g,brandName:h,ratio:k,domain:l}=a,m=j(d,"9:16"===k?20:26),n=j(e,"9:16"===k?32:40),o=.28*c,p=m.map((a,b)=>`<tspan x="80" dy="${0===b?0:"1.18em"}">${i(a)}</tspan>`).join(""),q=n.map((a,b)=>`<tspan x="80" dy="${0===b?0:"1.35em"}">${i(a)}</tspan>`).join("");return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${b} ${c}" width="${b}" height="${c}">
  <defs>
    \x3c!-- Background Gradients --\x3e
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1c120c" />
      <stop offset="45%" stop-color="#2b1b12" />
      <stop offset="100%" stop-color="#3b2519" />
    </linearGradient>
    <radialGradient id="glowTop" cx="80%" cy="15%" r="60%">
      <stop offset="0%" stop-color="#c5a059" stop-opacity="0.32" />
      <stop offset="100%" stop-color="#c5a059" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="glowBottom" cx="20%" cy="85%" r="50%">
      <stop offset="0%" stop-color="#84e1bc" stop-opacity="0.22" />
      <stop offset="100%" stop-color="#84e1bc" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fffcf7" stop-opacity="0.1" />
      <stop offset="100%" stop-color="#fffcf7" stop-opacity="0.03" />
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#c5a059" />
      <stop offset="100%" stop-color="#e2bf7d" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.45" />
    </filter>
  </defs>

  \x3c!-- Background Rect --\x3e
  <rect width="${b}" height="${c}" fill="url(#bgGrad)" />
  <rect width="${b}" height="${c}" fill="url(#glowTop)" />
  <rect width="${b}" height="${c}" fill="url(#glowBottom)" />

  \x3c!-- Subtle Editorial Grid --\x3e
  <g opacity="0.07" stroke="#ffffff" stroke-width="1">
    <line x1="80" y1="0" x2="80" y2="${c}" />
    <line x1="${b-80}" y1="0" x2="${b-80}" y2="${c}" />
    <line x1="0" y1="120" x2="${b}" y2="120" />
    <line x1="0" y1="${c-120}" x2="${b}" y2="${c-120}" />
  </g>

  \x3c!-- Brand Header Bar --\x3e
  <g transform="translate(80, 70)">
    \x3c!-- Brand Icon --\x3e
    <rect width="44" height="44" rx="12" fill="#c5a059" />
    <text x="22" y="29" font-family="system-ui, sans-serif" font-size="20" font-weight="900" fill="#1b120c" text-anchor="middle">✦</text>
    
    \x3c!-- Brand Name --\x3e
    <text x="60" y="24" font-family="'Fraunces', Georgia, serif" font-size="20" font-weight="bold" fill="#fffcf7">${i(h)}</text>
    <text x="60" y="40" font-family="system-ui, sans-serif" font-size="11" font-weight="600" fill="#c5a059" letter-spacing="0.1em">ORGANIC GROWTH ENGINE</text>

    \x3c!-- Verified Badge --\x3e
    <g transform="translate(${b-240}, 6)">
      <rect width="80" height="28" rx="14" fill="#ffffff" fill-opacity="0.1" stroke="#c5a059" stroke-width="1" />
      <text x="40" y="18" font-family="system-ui, sans-serif" font-size="11" font-weight="bold" fill="#e2bf7d" text-anchor="middle">OFFICIAL</text>
    </g>
  </g>

  \x3c!-- Topic Badge Tag --\x3e
  <g transform="translate(80, ${o-44})">
    <rect width="210" height="32" rx="16" fill="url(#goldGrad)" />
    <text x="105" y="21" font-family="system-ui, sans-serif" font-size="11" font-weight="800" fill="#1b120c" text-anchor="middle" letter-spacing="0.08em">${i(f.toUpperCase())}</text>
  </g>

  \x3c!-- Big Bold Editorial Headline --\x3e
  <text x="80" y="${o}" font-family="'Fraunces', Georgia, serif" font-size="${"9:16"===k?52:56}" font-weight="900" fill="#fffcf7" filter="url(#shadow)">
    ${p}
  </text>

  \x3c!-- Subheadline --\x3e
  <text x="80" y="${o+m.length*("9:16"===k?56:64)+24}" font-family="system-ui, sans-serif" font-size="${"9:16"===k?22:24}" font-weight="400" fill="#d7c4b2">
    ${q}
  </text>

  \x3c!-- Feature / Proof Highlights Card --\x3e
  <g transform="translate(80, ${c-290})" filter="url(#shadow)">
    <rect width="${b-160}" height="120" rx="20" fill="url(#cardGrad)" stroke="#c5a059" stroke-width="1.2" stroke-opacity="0.3" />
    
    \x3c!-- 3 Metrics in Card --\x3e
    <g transform="translate(30, 32)">
      <text x="0" y="28" font-family="'Fraunces', Georgia, serif" font-size="32" font-weight="bold" fill="#84e1bc">+4.8x</text>
      <text x="0" y="52" font-family="system-ui, sans-serif" font-size="12" font-weight="600" fill="#a89a8c">AEO Visibility</text>
    </g>

    <line x1="${(b-160)*.35}" y1="24" x2="${(b-160)*.35}" y2="96" stroke="#ffffff" stroke-opacity="0.15" />

    <g transform="translate(${(b-160)*.4}, 32)">
      <text x="0" y="28" font-family="'Fraunces', Georgia, serif" font-size="32" font-weight="bold" fill="#c5a059">99/100</text>
      <text x="0" y="52" font-family="system-ui, sans-serif" font-size="12" font-weight="600" fill="#a89a8c">EEAT Content Score</text>
    </g>

    <line x1="${(b-160)*.7}" y1="24" x2="${(b-160)*.7}" y2="96" stroke="#ffffff" stroke-opacity="0.15" />

    <g transform="translate(${(b-160)*.75}, 32)">
      <text x="0" y="28" font-family="'Fraunces', Georgia, serif" font-size="32" font-weight="bold" fill="#ffffff">0%</text>
      <text x="0" y="52" font-family="system-ui, sans-serif" font-size="12" font-weight="600" fill="#a89a8c">Agency Retainers</text>
    </g>
  </g>

  \x3c!-- CTA Action Button & Footer Handle --\x3e
  <g transform="translate(80, ${c-110})">
    \x3c!-- CTA Button --\x3e
    <rect width="260" height="52" rx="26" fill="url(#goldGrad)" filter="url(#shadow)" />
    <text x="130" y="32" font-family="system-ui, sans-serif" font-size="14" font-weight="800" fill="#1b120c" text-anchor="middle" letter-spacing="0.04em">${i(g)}</text>

    \x3c!-- Handle & Domain --\x3e
    <text x="${b-160}" y="32" font-family="system-ui, sans-serif" font-size="14" font-weight="600" fill="#d7c4b2" text-anchor="end">
      ${i(l||"rankmonk.in")} • @${i(h.toLowerCase().replace(/\\s+/g,""))}
    </text>
  </g>
</svg>`}({width:s,height:t,headline:b.headline,subheadline:b.subheadline,badge:b.badge,cta:b.cta,brandName:g,ratio:e,domain:m}),v=Date.now(),w=`post_${v}.svg`,x=h().join(process.cwd(),"public","generated");if(!f().existsSync(x))try{f().mkdirSync(x,{recursive:!0})}catch(a){}let y=`/generated/${w}`;try{let a=h().join(x,w);f().writeFileSync(a,u,"utf-8")}catch(a){y=`data:image/svg+xml;utf8,${encodeURIComponent(u)}`}return d.NextResponse.json({success:!0,data:{id:`post_${v}`,prompt:c.trim(),url:y,ratio:e,date:new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}),postType:"instagram_post",headline:b.headline,subheadline:b.subheadline,badge:b.badge,cta:b.cta,caption:b.caption,hashtags:b.hashtags,engine:r}})}catch(a){return d.NextResponse.json({success:!1,error:a.message},{status:500})}}}};var b=require("../../../../webpack-runtime.js");b.C(a);var c=b.X(0,[266,813],()=>b(b.s=7510));module.exports=c})();