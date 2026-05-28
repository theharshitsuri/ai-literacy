// Clerk middleware — runs before every request.
// Public routes (landing, quiz, sign-in pages) are accessible to anyone.
// Protected page routes (feed, profile, saved, admin) require a signed-in user.
//
// API routes are NOT protected at the middleware layer — each route handler
// calls requireUserId() from lib/auth.ts itself. This keeps the matcher
// pattern simple (path-to-regexp v6 doesn't accept negative lookaheads).
// Public API endpoints live under /api/public/* by convention.
//
// auth().protect() redirects unauthenticated users to /sign-in automatically.

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
  '/feed(.*)',
  '/profile(.*)',
  '/saved(.*)',
  '/admin(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
