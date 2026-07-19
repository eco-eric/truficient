// Verifies live pages by fetching the raw prerendered HTML at truficient.com/<slug>/
// and checking title, meta description, and canonical.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const BASE = 'https://truficient.com';

interface PageCheck {
  slug: string;
  meta_title: string;
  meta_description: string;
}

interface PageResult {
  slug: string;
  status: 'verified' | 'not_prerendered' | 'failed';
  http_status: number;
  found?: {
    title?: string;
    description?: string;
    canonical?: string;
  };
  errors?: string[];
}

function extract(html: string): { title?: string; description?: string; canonical?: string } {
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["'][^>]*>/i)
    || html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["'][^>]*>/i);
  const canonMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)["'][^>]*>/i)
    || html.match(/<link[^>]+href=["']([^"']*)["'][^>]+rel=["']canonical["'][^>]*>/i);
  return {
    title: titleMatch ? titleMatch[1].trim() : undefined,
    description: descMatch ? descMatch[1] : undefined,
    canonical: canonMatch ? canonMatch[1] : undefined,
  };
}

// Detect the Vite shell (no per-page prerender yet).
function looksLikeShell(html: string): boolean {
  return /Lovable App|Lovable Generated Project/i.test(html) || /<div id="root"><\/div>\s*<script/i.test(html);
}

async function checkOne(page: PageCheck): Promise<PageResult> {
  const slug = page.slug.startsWith('/') ? page.slug : `/${page.slug}`;
  const url = `${BASE}${slug.endsWith('/') ? slug : slug + '/'}`;

  try {
    const res = await fetch(url, {
      redirect: 'manual',
      headers: { 'User-Agent': 'TruficientVerifier/1.0 (raw-html-check)' },
    });
    const html = await res.text();

    if (res.status !== 200) {
      return {
        slug,
        status: 'failed',
        http_status: res.status,
        errors: [`HTTP ${res.status}`],
      };
    }

    const found = extract(html);
    const expectedCanonical = `${BASE}${slug.endsWith('/') ? slug : slug + '/'}`;
    const errors: string[] = [];

    const shell = looksLikeShell(html);
    if (shell) {
      return { slug, status: 'not_prerendered', http_status: res.status, found };
    }

    if (!found.title || found.title.trim() !== page.meta_title.trim()) {
      errors.push(`title mismatch — found: "${found.title || '(none)'}", expected: "${page.meta_title}"`);
    }
    if (!found.description || found.description.trim() !== page.meta_description.trim()) {
      errors.push(`description mismatch — found: "${(found.description || '').slice(0, 100)}…"`);
    }
    if (!found.canonical || found.canonical.replace(/\/$/, '/') !== expectedCanonical) {
      errors.push(`canonical mismatch — found: "${found.canonical || '(none)'}", expected: "${expectedCanonical}"`);
    }

    if (errors.length === 0) {
      return { slug, status: 'verified', http_status: res.status, found };
    }
    return { slug, status: 'failed', http_status: res.status, found, errors };
  } catch (err) {
    return {
      slug,
      status: 'failed',
      http_status: 0,
      errors: [err instanceof Error ? err.message : String(err)],
    };
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'POST only' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json();
    const pages: PageCheck[] = Array.isArray(body?.pages) ? body.pages : [];
    if (!pages.length) {
      return new Response(JSON.stringify({ error: 'no pages provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const results = await Promise.all(pages.map(checkOne));

    return new Response(
      JSON.stringify({ checked_at: new Date().toISOString(), results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
