// proxy.js
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  // Protect UI pages
  "/Main/:path*",
  "/Dashboard/:path*",

  // Protect API routes
  "/api/chat/:path*",
  "/api/messages/:path*",
  "/api/conversations/:path*",
  "/api/system/:path*",
  "/api/transcribe/:path*",
  "/api/users/:path*",  // ✨ ADD THIS - Very important!
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Protect UI pages
    "/Main/:path*",
    "/Dashboard/:path*",

    // Protect API routes
    "/api/chat/:path*",
    "/api/messages/:path*",
    "/api/conversations/:path*",
    "/api/system/:path*",
    "/api/transcribe/:path*",
    "/api/users/:path*",  // ✨ ADD THIS TOO
  ],
};