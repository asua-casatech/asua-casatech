export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=3600');

  const page = parseInt(req.query.page || '1');
  const PER_PAGE = 50;

  try {
    // Busca URLs do sitemap
    const sitemapRes = await fetch('https://loja.asuacasatech.com.br/sitemap.xml');
    const sitemapXml = await sitemapRes.text();

    // Extrai URLs de produtos
    const urlMatches = sitemapXml.match(/https:\/\/loja\.asuacasatech\.com\.br\/produtos\/[^<]+/g) || [];
    const allUrls = [...new Set(urlMatches)];
    const total = allUrls.length;

    // Paginação
    const start = (page - 1) * PER_PAGE;
    const pageUrls = allUrls.slice(start, start + PER_PAGE);

    // Busca dados de cada produto em paralelo
    const products = await Promise.all(pageUrls.map(async (url) => {
      try {
        const r = await fetch(url, {
          headers: { 'User-Agent': 'ASuaCasaTech/1.0' }
        });
        const html = await r.text();

        // Nome
        const nomeMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/);
        const name = nomeMatch ? nomeMatch[1].trim() : '';

        // Preço
        const precoMatch = html.match(/R\$\s*([0-9]+,[0-9]+)/);
        const price = precoMatch ? precoMatch[1].replace(',', '.') : '0';

        // Imagem
        const imgMatch = html.match(/og:image[^>]*content="([^"]+)"/);
        const image = imgMatch ? imgMatch[1] : '';

        // Slug
        const slug = url.replace('https://loja.asuacasatech.com.br/produtos/', '').replace(/\/$/, '');

        return {
          name,
          price,
          compare: '',
          image,
          url: `https://loja.asuacasatech.com.br/produtos/${slug}`,
          categories: []
        };
      } catch (e) {
        return null;
      }
    }));

    const validProducts = products.filter(p => p && p.name);

    res.json({ products: validProducts, total });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}