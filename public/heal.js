/**
 * Rank Monk Autonomous SEO Self-Healing Edge Script
 * Embed on any website: <script src="https://rankmonk.in/heal.js" data-site="yourdomain.com" async></script>
 *
 * Dynamically resolves missing meta descriptions, duplicate title tags,
 * missing image alt attributes, and JSON-LD structured schemas.
 */
(function() {
  'use strict';

  var currentScript = document.currentScript || (function() {
    var scripts = document.getElementsByTagName('script');
    for (var i = 0; i < scripts.length; i++) {
      if (scripts[i].src && scripts[i].src.indexOf('heal.js') !== -1) return scripts[i];
    }
    return null;
  })();

  var domain = (currentScript && currentScript.getAttribute('data-site')) ||
               window.location.hostname.replace(/^www\./, '');

  var endpoint = (currentScript && currentScript.getAttribute('data-api')) ||
                 ((currentScript && currentScript.src) ? new URL(currentScript.src).origin : '') ||
                 window.location.origin;

  function log(msg) {
    if (window.__RANKMONK_DEBUG__) {
      console.log('[Rank Monk Self-Healing SEO] ' + msg);
    }
  }

  function applyHealing(rules) {
    if (!rules || !rules.pages) return;
    var pathname = window.location.pathname.replace(/\/$/, '') || '/';
    var pageRule = rules.pages[pathname] || rules.pages[window.location.href] || rules.pages['*'];

    var healedCount = 0;

    // 1. Meta Description Healing
    if (pageRule && pageRule.metaDesc) {
      var metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.name = 'description';
        metaDesc.content = pageRule.metaDesc;
        document.head.appendChild(metaDesc);
        healedCount++;
        log('Injected missing meta description: "' + pageRule.metaDesc.slice(0, 50) + '..."');
      } else if (!metaDesc.content || metaDesc.content.trim() === '') {
        metaDesc.content = pageRule.metaDesc;
        healedCount++;
        log('Updated empty meta description');
      }
    }

    // 2. Title Tag Healing
    if (pageRule && pageRule.title) {
      if (!document.title || document.title.trim().length > 65 || pageRule.forceTitle) {
        var oldTitle = document.title;
        document.title = pageRule.title;
        healedCount++;
        log('Healed title tag: from "' + oldTitle + '" to "' + pageRule.title + '"');
      }
    }

    // 3. Image Alt Tag Healing
    var images = document.querySelectorAll('img');
    for (var i = 0; i < images.length; i++) {
      var img = images[i];
      if (!img.getAttribute('alt') || img.getAttribute('alt').trim() === '') {
        var generatedAlt = (pageRule && pageRule.defaultAlt) ||
                           (img.src ? img.src.split('/').pop().replace(/[-_]/g, ' ').replace(/\.[^.]+$/, '') : '') ||
                           (rules.brandName ? rules.brandName + ' visual showcase' : 'Brand visual');
        img.setAttribute('alt', generatedAlt);
        healedCount++;
        log('Injected missing image alt attribute: "' + generatedAlt + '"');
      }
    }

    // 4. Schema.org JSON-LD Structured Data Injection
    if (pageRule && pageRule.schema && !document.querySelector('script[data-rankmonk-schema="true"]')) {
      var script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-rankmonk-schema', 'true');
      script.text = JSON.stringify(pageRule.schema);
      document.head.appendChild(script);
      healedCount++;
      log('Injected Schema.org JSON-LD structured data');
    }

    if (healedCount > 0) {
      console.log('⚡ [Rank Monk] Successfully healed ' + healedCount + ' SEO issues on ' + pathname + ' in ' + Math.round(performance.now()) + 'ms ✓');
    }
  }

  // Fetch active edge rules for domain
  try {
    var rulesUrl = endpoint + '/api/seo/heal-rules?domain=' + encodeURIComponent(domain);
    fetch(rulesUrl)
      .then(function(res) { return res.json(); })
      .then(function(data) {
        if (data && data.success && data.rules) {
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
              applyHealing(data.rules);
            });
          } else {
            applyHealing(data.rules);
          }
        }
      })
      .catch(function(err) {
        log('Rule fetch notice: ' + err.message);
      });
  } catch (e) {}
})();

