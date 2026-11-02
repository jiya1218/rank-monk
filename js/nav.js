/**
 * RANK MONK - UNIFIED NAVIGATION & AUTH STATE ENGINE (js/nav.js)
 * Single source of truth for Navbar, Sessions, and Instant Logout.
 */
(function(window, document) {
  'use strict';

  var SESSION_KEY = 'rankmonk_user';

  // 1. Unified Session Getter (with legacy auto-migration and 2-way sync)
  function getActiveUser() {
    try {
      var raw = localStorage.getItem(SESSION_KEY);
      if (raw) {
        var u = JSON.parse(raw);
        if (u && u.email) {
          // Keep legacy keys in sync so any remaining legacy checks also pass
          if (!localStorage.getItem('rankmonk_active_user_v3')) {
            localStorage.setItem('rankmonk_active_user_v3', raw);
          }
          if (!localStorage.getItem('rankmonk_active_user_v6')) {
            localStorage.setItem('rankmonk_active_user_v6', raw);
          }
          return u;
        }
      }

      // Legacy fallback and auto-migration
      var legacy = localStorage.getItem('rankmonk_active_user_v3') || localStorage.getItem('rankmonk_active_user_v6');
      if (legacy) {
        var legUser = JSON.parse(legacy);
        if (legUser && legUser.email) {
          localStorage.setItem(SESSION_KEY, JSON.stringify(legUser));
          return legUser;
        }
      }
    } catch (e) {
      console.warn('[RankMonk Nav] Session parse error:', e);
    }
    return null;
  }

  // 2. Strict Payment Status Resolver
  function isUserPaid(user) {
    if (!user || !user.email) return false;
    var normEmail = user.email.toLowerCase().trim();
    if (normEmail === 'founder@rankmonk.in' || normEmail === 'jiya@gmail.com' || user.role === 'owner' || user.plan === 'scale') return true;
    if (user.paid === true) return true;

    try {
      var list = JSON.parse(localStorage.getItem('rankmonk_paid_users_list') || '[]');
      if (Array.isArray(list) && list.includes(normEmail)) return true;
    } catch (e) {}

    return false;
  }

  // 3. Instant Non-Blocking Logout (Zero prompt, purges all storage, redirects)
  function executeLogout(e) {
    if (e) {
      if (e.preventDefault) e.preventDefault();
      if (e.stopPropagation) e.stopPropagation();
    }

    try {
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem('rankmonk_active_user_v3');
      localStorage.removeItem('rankmonk_active_user_v6');
      localStorage.removeItem('rankmonk_user_session');
      localStorage.removeItem('rankmonk_just_completed_payment');
      localStorage.removeItem('rankmonk_pending_checkout_plan');
      try { sessionStorage.clear(); } catch(err) {}
      
      // Notify backend asynchronously
      if (typeof fetch === 'function') {
        fetch('/api/auth/logout', { method: 'POST' }).catch(function(){});
      }
    } catch(err) {
      console.warn('[RankMonk Nav] Logout cleanup note:', err);
    }

    // Immediate non-blocking redirect to login
    window.location.href = '/login';
    return false;
  }

  // 4. Dashboard Click Interceptor (routes unpaid users to pricing)
  function handleDashboardClick(e) {
    var user = getActiveUser();
    if (!user) {
      if (e && e.preventDefault) e.preventDefault();
      window.location.href = '/login';
      return false;
    }

    if (!isUserPaid(user)) {
      if (e && e.preventDefault) e.preventDefault();
      var plan = user.plan || 'seed';
      window.location.href = '/pricing?plan=' + encodeURIComponent(plan) + '&requirePayment=1';
      return false;
    }

    // Paid users proceed naturally to /dashboard
    if (e && e.preventDefault) {
      window.location.href = '/dashboard';
      return false;
    }
    return true;
  }

  // 5. Global Navigation Synchronization
  function syncNavigation() {
    try {
      var user = getActiveUser();
      var isLoggedIn = !!(user && user.email);

      if (isLoggedIn) {
        document.documentElement.classList.add('has-active-user');
        if (document.body) document.body.classList.add('has-active-user');

        var displayName = user.name || (user.email ? user.email.split('@')[0] : 'Dashboard');

        // Update pre-rendered display elements
        var nameSpan = document.getElementById('navUserDisplayName');
        if (nameSpan) nameSpan.textContent = displayName;

        var pill = document.getElementById('navProfilePill');
        if (pill) {
          pill.title = 'Logged in as ' + user.email + ' (Click to Log Out)';
          pill.onclick = executeLogout;
        }

        // Ensure all .user-nav-authenticated containers are visible
        document.querySelectorAll('.user-nav-authenticated').forEach(function(el) {
          el.style.removeProperty('display');
          el.style.display = 'inline-flex';
        });

        // Ensure all guest elements are hidden
        document.querySelectorAll('.nav-guest-only, .nav-book-demo-btn, .nav-login-link').forEach(function(el) {
          el.style.display = 'none';
        });
        document.querySelectorAll('.nav-actions a[href="/signup"], .nav-actions a[href="signup"]').forEach(function(el) {
          el.style.display = 'none';
        });

        // Dynamically create authenticated group if container exists without one
        document.querySelectorAll('.nav-actions').forEach(function(container) {
          var authGroup = container.querySelector('.user-nav-authenticated');
          if (!authGroup) {
            authGroup = document.createElement('div');
            authGroup.className = 'user-nav-authenticated nav-auth-only';
            authGroup.id = 'userNavAuth';
            authGroup.style.display = 'inline-flex';
            authGroup.style.alignItems = 'center';
            authGroup.style.gap = '10px';
            authGroup.innerHTML = 
              '<a href="/dashboard" class="btn btn-primary btn-sm nav-dash-btn">Dashboard →</a>' +
              '<a href="#" class="nav-profile-pill" id="navProfilePill" title="Logged in as ' + user.email + ' (Click to Log Out)">' +
                '<span class="user-status-dot"></span>' +
                '<span class="user-pill-name" id="navUserDisplayName">' + displayName + '</span>' +
                '<span class="user-pill-logout">(Log out)</span>' +
              '</a>';

            var themeToggle = container.querySelector('#theme-toggle, .theme-toggle');
            if (themeToggle) container.insertBefore(authGroup, themeToggle);
            else container.appendChild(authGroup);
          }
        });

        // Re-attach click handlers to all dashboard buttons
        document.querySelectorAll('.nav-dash-btn, a[href="/dashboard"]').forEach(function(el) {
          el.onclick = handleDashboardClick;
        });

        // Re-attach logout handler to profile pills
        document.querySelectorAll('.nav-profile-pill, a[onclick*="handleGlobalLogout"]').forEach(function(el) {
          el.onclick = executeLogout;
        });

        // Mobile drawer synchronization
        document.querySelectorAll('.mobile-sheet-links').forEach(function(drawer) {
          var dock = drawer.querySelector('.mobile-auth-dock');
          if (!dock) {
            dock = document.createElement('div');
            dock.className = 'mobile-auth-dock';
            dock.style.cssText = 'margin-top: 14px; padding-top: 14px; border-top: 1px solid var(--line); display: flex; flex-direction: column; gap: 8px;';
            dock.innerHTML = 
              '<a href="/dashboard" class="btn btn-primary btn-block mobile-dash-btn" style="font-weight: 700;">Dashboard →</a>' +
              '<a href="#" class="btn btn-secondary btn-block mobile-logout-btn" style="font-size: 0.84rem; display: flex; align-items: center; justify-content: center; gap: 6px;">' +
                '<span style="width: 7px; height: 7px; border-radius: 50%; background: #10b981;"></span>' +
                '<span>Log Out (' + displayName + ')</span>' +
              '</a>';
            drawer.appendChild(dock);
          }
          var mDash = dock.querySelector('.mobile-dash-btn');
          if (mDash) mDash.onclick = handleDashboardClick;
          var mLog = dock.querySelector('.mobile-logout-btn');
          if (mLog) mLog.onclick = executeLogout;
        });

        // Update marketing buttons pointing to /signup
        document.querySelectorAll('main a[href="/signup"], main a[href="signup"]').forEach(function(cta) {
          cta.href = '/dashboard';
          cta.onclick = handleDashboardClick;
          var txt = cta.innerText.toLowerCase();
          if (txt.includes('climbing') || txt.includes('trial') || txt.includes('started') || txt.includes('sign up')) {
            cta.innerText = 'Go to Dashboard →';
          }
        });

      } else {
        // Logged out / Guest
        document.documentElement.classList.remove('has-active-user');
        if (document.body) document.body.classList.remove('has-active-user');

        // Hide auth elements cleanly without deleting them
        document.querySelectorAll('.user-nav-authenticated').forEach(function(el) {
          el.style.display = 'none';
        });
        document.querySelectorAll('.mobile-auth-dock').forEach(function(el) {
          el.style.display = 'none';
        });

        // Show guest controls
        document.querySelectorAll('.nav-guest-only, .nav-book-demo-btn, .nav-login-link').forEach(function(el) {
          el.style.removeProperty('display');
        });
        document.querySelectorAll('.nav-actions a[href="/signup"], .nav-actions a[href="signup"]').forEach(function(el) {
          el.style.removeProperty('display');
        });
      }
    } catch(err) {
      console.warn('[RankMonk Nav] Sync error:', err);
    }
  }

  // Immediate synchronous execution
  syncNavigation();

  // Listeners for lifecycle stages
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', syncNavigation);
  }
  window.addEventListener('load', syncNavigation);
  window.addEventListener('pageshow', syncNavigation);

  // Global namespace & backward compatibility hooks
  window.RankMonkNav = {
    getUser: getActiveUser,
    isPaid: isUserPaid,
    logout: executeLogout,
    handleDashboardClick: handleDashboardClick,
    sync: syncNavigation,
    SESSION_KEY: SESSION_KEY
  };

  window.handleGlobalLogout = executeLogout;
  window.executeLogout = executeLogout;
  window.handleDashboardNavClick = handleDashboardClick;
  window.updateNavAuthState = syncNavigation;

})(window, document);
