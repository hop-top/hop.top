import type { APIRoute } from 'astro';
import { projects } from '../data/projects';
import { renderLlmsTxt } from '../lib/discovery';

export const GET = (({ request, site }) => {
  const canonicalSite = site ?? new URL(request.url);

  return new Response(renderLlmsTxt(canonicalSite, projects), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}) satisfies APIRoute;
