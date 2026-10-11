# Rank Monk — Frontend

Static frontend for Rank Monk. Open `index.html` in a browser, or use an
editor's live server (recommended for Antigravity).

## Structure
```
index.html        Home
features.html     Features (all modules)
pricing.html      Pricing: Seed $50, Grow $200, Scale $700
about.html        Story and team
blog.html         Journal listing (search + category filter)
blog-post.html    Single article layout
contact.html      Contact form
login.html        Log in
signup.html       Sign up (plan picker)
dashboard.html    Dashboard preview (static)
privacy.html      Privacy policy (placeholder text)
terms.html        Terms of service (placeholder text)
404.html          Not found
css/styles.css    All styles (light + dark themes)
js/main.js        Header, footer, theme toggle, forms, blog filter
img/logo.png      Rank Monk logo
```

## Light / dark mode
A toggle sits in the header on every page. The choice is saved in
`localStorage` under `rankmonk-theme`. On first visit it follows the
visitor's system setting.

## Changing things
- **Prices:** edit the `.plan` blocks in `pricing.html` (and the matching
  ones in `index.html` and `signup.html`, which has the plan dropdown).
- **Colours:** edit the variables at the top of `css/styles.css`
  (`:root` = light, `[data-theme="dark"]` = dark).
- **Header / footer links:** edit `NAV` and `footerHTML` in `js/main.js`.
- **Copy and sample testimonials/team:** edit the page files directly.
  Names such as "Maya Chen" and the team are placeholders.

## Connecting the backend
Hook points are marked `BACKEND:` in `js/main.js`.
- All forms have `data-form` and `data-endpoint` attributes
  (`/api/contact`, `/api/auth/login`, `/api/auth/signup`). Replace the
  placeholder block in `js/main.js` with a `fetch()` call to these.
- The blog list is static HTML. Make it dynamic by rendering `.post-card`
  elements from your API.
- The dashboard is a static preview. Replace the numbers with API data.

## Notes
- Fonts load from Google Fonts (Fraunces, Instrument Sans). The page
  still works offline with fallback fonts.
- Replace the placeholder legal text and the `hello@rankmonk.example`
  address before launch.
