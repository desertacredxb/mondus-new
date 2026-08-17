declare const process: { env: { [key: string]: string | undefined } };

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

export default async function middleware(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const userAgent = request.headers.get('user-agent')?.toLowerCase() || '';
  
  // Use process.env for Vercel Edge Environment variables
  const prerenderToken = process.env.PRERENDER_TOKEN;

  // 1. Check if user-agent matches any bot pattern
  const isBot = BOT_USER_AGENTS.some((bot) => userAgent.includes(bot));

  // 2. Check if the requested file is a static asset
  const isIgnoredExtension = IGNORED_EXTENSIONS.some((ext) =>
    url.pathname.toLowerCase().endsWith(ext)
  );

  // 3. Skip prerendering if buffer header is present (prevents infinite proxy loops)
  const isPrerenderBuffer = request.headers.get('x-prerender');

  // If request is from a bot, not an asset, and token exists -> Proxy request to Prerender.io
  if (isBot && !isIgnoredExtension && !isPrerenderBuffer && prerenderToken) {
    const prerenderUrl = `https://service.prerender.io/${request.url}`;

    const headers = new Headers(request.headers);
    headers.set('X-Prerender-Token', prerenderToken);

    try {
      const prerenderResponse = await fetch(prerenderUrl, {
        headers,
        method: request.method,
      });

      return prerenderResponse;
    } catch (error) {
      console.error('Prerender error, falling back to standard response:', error);
    }
  }

  // Continue standard request execution for real users
  return fetch(request);
}

// Routes to run through Edge Middleware
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};