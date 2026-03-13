import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/about",
  "/guide",
  "/join(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  const { userId } = await auth();

  // Root redirect: signed-in -> /home, signed-out -> /about
  if (request.nextUrl.pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = userId ? "/home" : "/about";
    return NextResponse.redirect(url);
  }

  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
  // Clerk's middleware can reference Node-only modules; run it in Node runtime.
  // Next.js 15.2+ supports Node.js middleware runtime on Vercel.
  runtime: "nodejs",
};

