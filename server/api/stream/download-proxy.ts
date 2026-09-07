// server/api/download.get.ts
import { defineEventHandler, getQuery, getHeader, createError } from 'h3';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const videoUrl = query.url as string;

  if (!videoUrl) throw createError({ statusCode: 400, statusMessage: 'Missing video URL' });

  const filename = ((query.filename as string) || 'video.mp4').replace(/[^a-zA-Z0-9._\-]/g, ' ');

  const rangeHeader = getHeader(event, 'range');

  // Kill upstream if user cancels download
  const controller = new AbortController();
  event.node.req.on('close', () => controller.abort());

  // ✅ UPDATED HEADERS - using officialmoviebox.com
  const upstreamHeaders: Record<string, string> = {
    'User-Agent': 'okhttp/4.12.0',
    'Referer': 'https://officialmoviebox.com/',
    'Origin': 'https://officialmoviebox.com',
    'Accept': '*/*',
  };
  if (rangeHeader) upstreamHeaders['Range'] = rangeHeader;

  try {
    const response = await fetch(videoUrl, {
      method: 'GET',
      headers: upstreamHeaders,
      signal: controller.signal
    });

    if (!response.ok && response.status !== 206) {
      throw createError({ statusCode: response.status, statusMessage: `Mirror returned error: ${response.statusText}` });
    }
    if (!response.body) throw createError({ statusCode: 502, statusMessage: 'Mirror returned empty body' });

    const contentLength = response.headers.get('content-length');
    const contentRange = response.headers.get('content-range');
    const contentType = response.headers.get('content-type') || 'video/mp4';

    // ✅ Build response headers
    const headers = new Headers({
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Accept-Ranges': 'bytes',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=86400',
      'X-Content-Type-Options': 'nosniff',
      ...(contentLength && { 'Content-Length': contentLength }),
      ...(contentRange && { 'Content-Range': contentRange }),
    });

    // ✅ Return new Response (not sendStream)
    return new Response(response.body, {
      status: response.status,
      headers: headers
    });

  } catch (error: any) {
    if (error.name === 'AbortError') return; // user cancelled
    console.error('[Download Proxy Error]', error.message);
    throw createError({ statusCode: 500, statusMessage: `Streaming failed: ${error.message}` });
  }
});