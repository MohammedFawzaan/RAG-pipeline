import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ROUTES = ['/'];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get('token')?.value;

    // Cross-domain limitation: External backend cookies aren't visible to Vercel middleware
    // We will handle protection inside the ChatPage component instead.
    return NextResponse.next();
}

export const config = {
    matcher: [
        // Match all routes except Next.js internals and static files
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    ],
};
