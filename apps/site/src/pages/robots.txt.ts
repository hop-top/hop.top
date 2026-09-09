import type { APIRoute } from 'astro';
import { renderRobotsTxt } from '../lib/discovery';

export const GET = (({ request, site }) => {
  const canonicalSite = site ?? new URL(request.url);

  return new Response(renderRobotsTxt(canonicalSite), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}) satisfies APIRoute;
