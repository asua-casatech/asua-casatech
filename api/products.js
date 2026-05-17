export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=3600');

  const page = parseInt(req.query.page || '1');
  const PER_PAGE = 50;

  try {
    const sitemapRes = await fetch('https://loja.asuacasatech.com.br/sitemap.xml');
    const sitemapXml = await sitemapRes.text();

    const urlMatches = sitemapXml.match(/https:\/\/loja\.asuacasatech\.com\.br\/produtos\/[^<]+/g) || [];
    const allUrls = [...new Set(urlMatches)];

    const start = (page - 1) * PER_PAGE;
    const pageUrls = allUrls.slice(start, start + PER_PAGE);

    const products = await Promise.all(pageUrls.map(async (url) => {
      try {
        const r = await fetch(url, {
          headers: { 'User-Agent': 'ASuaCasaTech/1.0' }
        });
        
        if (!r.ok) return null;
        
        const html = await r.text();
        if (html.includes('Erro - 404') || html.includes('página não encontrada')) return null;

        // Nome
        const nomeMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/);
        const name = nomeMatch ? nomeMatch[1].trim() : '';
        if (!name || name.includes('404') || name.includes('Erro')) return null;

        // Preço
        const precoMatch = html.match(/["']price["']\s*:\s*["']?([0-9]+\.?[0-9]*)["']?/) ||
                          html.match(/R\$\s*([0-9]+[.,][0-9]+)/) ||
                          html.match(/([0-9]+\.[0-9]{2})/);
        const price = precoMatch ? precoMatch[1].replace(',', '.') : '0';

        // Imagem — múltiplos padrões
        const imgPatterns = [
          /property="og:image"\s+content="([^"]+)"/,
          /content="([^"]+)"\s+property="og:image"/,
          /name="twitter:image"\s+content="([^"]+)"/,
          /(https:\/\/dcdn-us\.mitiendanube\.com\/[^"'\s]+(?:jpg|png|webp))/,
          /(https:\/\/[^"'\s]+mitiendanube[^"'\s]+(?:jpg|png|webp))/
        ];
        
        let image = '';
        for (const pat of imgPatterns) {
          const m = html.match(pat);
          if (m) { image = m[1]; break; }
        }

        const slug = url.replace('https://loja.asuacasatech.com.br/produtos/', '').replace(/\/$/, '');

        return {
          name,
          price,
          compare: '',
          image: image || '',
          url: `https://loja.asuacasatech.com.br/produtos/${slug}`,
          categories: []
        };
      } catch (e) {
        return null;
      }
    }));

    // Aceita produtos com nome mesmo sem imagem
    const validProducts = products.filter(p => p && p.name && p.name.length > 2);

    res.json({ products: validProducts, total: allUrls.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}