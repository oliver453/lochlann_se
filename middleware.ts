// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { i18n } from './i18n.config';

function getLocale(request: NextRequest): string {
  const localeCookie = request.cookies.get('NEXT_LOCALE')?.value;
  if (localeCookie && i18n.locales.includes(localeCookie as any)) {
    return localeCookie;
  }

  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage) {
    if (acceptLanguage.toLowerCase().includes('en')) {
      return 'en';
    }
    if (acceptLanguage.toLowerCase().includes('sv')) {
      return 'sv';
    }
  }

  return i18n.defaultLocale;
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  console.log('Middleware hit:', { pathname, url: request.url });

  // Handle /studio routes (admin panel) 
  if (pathname.startsWith('/studio')) {
    console.log('Studio route detected:', pathname);
    
    // Check authentication for all studio routes except login
    if (pathname !== '/studio/login') {
      const session = request.cookies.get('admin_session');
      console.log('Auth check:', { pathname, hasSession: !!session, sessionValue: session?.value });
      
      if (!session || session.value !== 'authenticated') {
        console.log('Redirecting to login from:', pathname);
        return NextResponse.redirect(new URL('/studio/login', request.url));
      }
    } else {
      console.log('Login page - allowing through');
    }
    
    return NextResponse.next();
  }

  // Check if pathname already has a locale
  const pathnameHasLocale = i18n.locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    const response = NextResponse.next();
    const locale = pathname.split('/')[1];
    response.cookies.set('NEXT_LOCALE', locale, { 
      maxAge: 31536000,
      path: '/'
    });
    return response;
  }

  // Redirect to locale-prefixed path
  const locale = getLocale(request);
  const newUrl = new URL(`/${locale}${pathname}`, request.url);
  
  console.log('Locale redirect:', { from: pathname, to: newUrl.pathname });
  
  const response = NextResponse.redirect(newUrl);
  response.cookies.set('NEXT_LOCALE', locale, { 
    maxAge: 31536000,
    path: '/'
  });
  
  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};