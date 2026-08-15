# SEO and Authentication Fix Plan

Run an SEO verification crawl and fix remaining issues. Fix authentication flow specifically for relogin, session loading, and password reset functionality.

## Proposed Changes

### SEO Enhancements
1. **Canonical Tags & Metadata**: Add dynamic canonical tags and missing meta properties (like `author`, `robots` in leaf routes) to ensure unique indexing.
2. **Sitemap and Robots.txt**: Update `public/robots.txt` and `public/sitemap.xml` to match the current published URL and include all public routes.
3. **Alt Text Audit**: Ensure all critical images have descriptive alt text for search engines.

### Authentication Fixes
1. **Password Reset Flow**: Implement a functional "Forgot Password" UI that triggers `supabase.auth.resetPasswordForEmail`.
2. **Session Resilience**: Fix potential race conditions in `AuthContext.tsx` that might cause session loading failures on page refresh or relogin.
3. **Google Auth Handlers**: Ensure OAuth redirects correctly handle state and session hydration.

## Technical Details

### SEO
- Update `src/routes/__root.tsx` to include base canonical logic.
- Update `src/routes/index.tsx`, `auth.tsx`, etc., with route-specific canonical URLs.
- Verify sitemap at `public/sitemap.xml` includes `/simulator` and `/prices`.

### Auth
- Modify `src/routes/auth.tsx` to add a "Forgot Password" tab or dialog that calls `supabase.auth.resetPasswordForEmail`.
- Update `src/contexts/AuthContext.tsx` to better handle session initialization, ensuring `loading` state accurately reflects both session and profile status.
- Ensure `emailRedirectTo` in auth calls points to a stable origin.

### Verification
- Re-run Playwright SEO script to verify tags.
- Manually test sign-in -> refresh -> dashboard flow.
- Test "Forgot Password" to ensure the Supabase call is initiated.
