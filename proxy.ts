import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
    '/',                   // landing page
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/waitlist(.*)',
    '/api/dashboard/(.*)', // public market data – no user info exposed
    '/api/holders/(.*)',   // public holder data
    '/api/liquidity/(.*)', // public liquidity data
    '/token/(.*)',         // token detail pages
    '/api/token/(.*)',     // token metadata API
    '/api/trade/(.*)',     // trade quote API
    '/wallet(.*)',         // public wallet viewer
    '/api/wallet/(.*)',    // public wallet data
    '/api/telemetry(.*)',  // public telemetry endpoint
    '/api/waitlist(.*)',             // public waitlist API
    '/api/notifications/webhook(.*)', // public notification delivery
])

export default clerkMiddleware(async (auth, req) => {
    if (!isPublicRoute(req)) {
        await auth.protect()
    }
})

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
}
