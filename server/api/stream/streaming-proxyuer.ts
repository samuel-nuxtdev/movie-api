import { defineEventHandler, getQuery, getHeader, createError, setResponseHeaders, setResponseStatus, sendStream } from 'h3';
import { Readable } from 'node:stream';

export default defineEventHandler(async (event) => {
  // 1. Extract full target URL (preserves unencoded signature parameters)
  const rawUrl = event.node.req.url || '';
  const match = rawUrl.match(/[?&]url=([^&]+.*)$/);
  
  let videoUrl = getQuery(event).url as string;
  if (match) {
    videoUrl = decodeURIComponent(match[1]);
  }

  if (!videoUrl) throw createError({ statusCode: 400, message: 'URL required' });

  const allowedHostPattern = /^https:\/\/([a-z0-9-]+\.)?hakunaymatata\.com\//i;
  if (!allowedHostPattern.test(videoUrl)) throw createError({ statusCode: 403, message: 'Invalid video source' });

  const rangeHeader = getHeader(event, 'range');

  const controller = new AbortController();
  event.node.req.on('close', () => {
    controller.abort();
  });

  const fetchHeaders: Record<string, string> = {
    'User-Agent': 'okhttp/4.12.0',
    'Referer': 'https://netfilm.world/',
    'Origin': 'https://netfilm.world',
    'Accept': '*/*',
  };
  if (rangeHeader) fetchHeaders['Range'] = rangeHeader;

  try {
    const response = await fetch(videoUrl, {
      method: 'GET',
      headers: fetchHeaders,
      signal: controller.signal
    });

    if (!response.ok && response.status !== 206) {
      throw createError({ statusCode: response.status, message: `Upstream error: ${response.status}` });
    }

    const headers: Record<string, string> = {
      'Content-Type': response.headers.get('content-type') || 'video/mp4',
      'Accept-Ranges': 'bytes',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Expose-Headers': 'Content-Range, Accept-Ranges, Content-Length',
      'Cache-Control': 'no-cache',
    };

    const contentRange = response.headers.get('content-range');
    const contentLength = response.headers.get('content-length');
    if (contentRange) headers['Content-Range'] = contentRange;
    if (contentLength) headers['Content-Length'] = contentLength;

    setResponseHeaders(event, headers);
    setResponseStatus(event, response.status);

    const nodeStream = Readable.fromWeb(response.body as any);
    nodeStream.on('error', (err) => {
      console.error('❌ Stream error:', err);
    });

    return sendStream(event, nodeStream);

  } catch (e: any) {
    if (e.name === 'AbortError') return;
    throw createError({ statusCode: e.statusCode || 500, message: `Streaming failed: ${e.message}` });
  }
});