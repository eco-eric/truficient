import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml; charset=utf-8',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all published equipment pages
    const { data: equipmentPages, error } = await supabase
      .from('equipment_pages')
      .select('slug, updated_at')
      .eq('published', true)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching equipment pages:', error);
      throw error;
    }

    const baseUrl = 'https://www.truficient.com';
    const today = new Date().toISOString().split('T')[0];

    // Static pages from the existing sitemap
    const staticPages = [
      { loc: '/', changefreq: 'weekly', priority: '1.0' },
      { loc: '/about', changefreq: 'monthly', priority: '0.8' },
      { loc: '/contact', changefreq: 'monthly', priority: '0.9' },
      { loc: '/gallery', changefreq: 'weekly', priority: '0.7' },
      { loc: '/services/residential', changefreq: 'monthly', priority: '0.9' },
      { loc: '/services/commercial', changefreq: 'monthly', priority: '0.9' },
      { loc: '/services/ductless', changefreq: 'monthly', priority: '0.9' },
      { loc: '/hvac-estimate', changefreq: 'monthly', priority: '0.9' },
      { loc: '/estimate/ducted', changefreq: 'monthly', priority: '0.9' },
      { loc: '/estimate/ductless', changefreq: 'monthly', priority: '0.9' },
      { loc: '/estimators/sizing', changefreq: 'monthly', priority: '0.8' },
      { loc: '/estimators/cost', changefreq: 'monthly', priority: '0.8' },
      { loc: '/estimators/savings', changefreq: 'monthly', priority: '0.8' },
      { loc: '/scanner', changefreq: 'weekly', priority: '0.8' },
      { loc: '/equipment', changefreq: 'weekly', priority: '0.7' },
      { loc: '/service-areas/dallas-area', changefreq: 'monthly', priority: '0.7' },
      { loc: '/service-areas/north-dallas-area', changefreq: 'monthly', priority: '0.7' },
      { loc: '/service-areas/frisco-mckinney-area', changefreq: 'monthly', priority: '0.7' },
      { loc: '/service-areas/mid-cities-area', changefreq: 'monthly', priority: '0.7' },
      { loc: '/service-areas/south-dallas-area', changefreq: 'monthly', priority: '0.7' },
      { loc: '/blog', changefreq: 'weekly', priority: '0.8' },
      { loc: '/careers', changefreq: 'weekly', priority: '0.6' },
      { loc: '/privacy-policy', changefreq: 'yearly', priority: '0.3' },
      { loc: '/terms-of-service', changefreq: 'yearly', priority: '0.3' },
    ];

    // Generate XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Static Pages -->`;

    // Add static pages
    for (const page of staticPages) {
      xml += `
  <url>
    <loc>${baseUrl}${page.loc}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
    }

    // Add equipment pages section
    if (equipmentPages && equipmentPages.length > 0) {
      xml += `
  
  <!-- Equipment Pages (${equipmentPages.length} total) -->`;
      
      for (const page of equipmentPages) {
        const lastmod = page.updated_at 
          ? new Date(page.updated_at).toISOString().split('T')[0]
          : today;
        
        xml += `
  <url>
    <loc>${baseUrl}/equipment/${page.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
      }
    }

    xml += `
</urlset>`;

    return new Response(xml, {
      status: 200,
      headers: corsHeaders,
    });

  } catch (error) {
    console.error('Sitemap generation error:', error);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.truficient.com/</loc>
    <priority>1.0</priority>
  </url>
</urlset>`,
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  }
});
