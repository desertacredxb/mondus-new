import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Comprehensive list of SEO, Social, and AI Web Crawlers
const BOT_USER_AGENTS: readonly string[] = [
  'googlebot',
  'bingbot',
  'yandex',
  'baiduspider',
  'facebookexternalhit',
  'twitterbot',
  'rogerbot',
  'linkedinbot',
  'embedly',
  'quora link preview',
  'showyoubot',
  'outbrain',
  'pinterest/0.',
  'developers.google.com/+/web/snippet',
  'slackbot',
  'vkShare',
  'w3c_validator',
  'redditbot',
  'applebot',
  'whatsapp',
  'flipboard',
  'tumblr',
  'bitlybot',
  'skypeurliprecaching',
  'nuzzel',
  'discordbot',
  'google page speed',
  'qwantify',
  'pinterestbot',
  'bitrix link preview',
  'xenforo null query',
  'bingpreview',
  'newsme',
  'linespider',
  'telegrambot',
  'sogou-inst-spider',
  // AI Crawlers & LLM Bots
  'chatgpt-user',
  'gptbot',
  'oai-searchbot',
  'perplexbot',
  'anthropic-ai',
  'claude-web',
  'claudebot',
  'cohere-ai',
  'bytespider',
  'ccbot'
] as const;

// Extensions to bypass (static assets that do NOT need HTML rendering)
const IGNORED_EXTENSIONS: readonly string[] = [
  '.js',
  '.css',
  '.xml',
  '.less',
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.pdf',
  '.doc',
  '.txt',
  '.ico',
  '.rss',
  '.zip',
  '.mp3',
  '.rar',
  '.exe',
  '.wmv',
  '.doc',
  '.avi',
  '.ppt',
  '.mpg',
  '.mpeg',
  '.tif',
  '.wav',
  '.mov',
  '.psd',
  '.ai',
  '.xls',
  '.mp4',
  '.m4a',
  '.swf',
  '.dat',
  '.dmg',
  '.iso',
  '.woff',
  '.woff2',
  '.ttf',
  '.eot',
  '.svg',
  '.webp'
] as const;

export function middleware(request: NextRequest): NextResponse {
  const url: URL = new URL(request.url);
  const userAgent: string = request.headers.get('user-agent')?.toLowerCase() || '';
  const prerenderToken: string | undefined = process.env.PRERENDER_TOKEN;

  // 1. Check if user-agent matches any bot pattern
  const isBot: boolean = BOT_USER_AGENTS.some((bot: string) => userAgent.includes(bot));

  // 2. Check if the requested file is a static asset
  const isIgnoredExtension: boolean = IGNORED_EXTENSIONS.some((ext: string) =>
    url.pathname.toLowerCase().endsWith(ext)
  );

  // 3. Skip prerendering if buffer header is present (prevents infinite proxy loops)
  const isPrerenderBuffer: string | null = request.headers.get('x-prerender');

  // If request is from a bot, not an asset, and token exists -> Proxy to Prerender.io
  if (isBot && !isIgnoredExtension && !isPrerenderBuffer && prerenderToken) {
    const prerenderUrl: string = `https://service.prerender.io/${request.url}`;

    // Forward original request headers while injecting the Prerender Token
    const headers: Headers = new Headers(request.headers);
    headers.set('X-Prerender-Token', prerenderToken);

    return NextResponse.rewrite(new URL(prerenderUrl), {
      request: { headers }
    });
  }

  // Real human users continue to the regular Vite React app
  return NextResponse.next();
}

// Config to specify which routes run through Middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except static files & internal Vercel routes
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};