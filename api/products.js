export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=300');
  const STORE_ID = '6757760';
  const TOKEN = 'b792f43d74a80f28d8691f1db52a5ff428e01213';
  const page = req.query.page || 1;
  try {
    const r = await fetch(`https://api.tiendanube.com/v1/${STORE_ID}/products?per_page=50&page=${page}`, {
      headers: {
        'Authentication': `bearer ${TOKEN}`,
        'User-Agent': 'ASuaCasaTech (adm@asuacasatech.com.br)'
      }
    });
    if (!r.ok) throw new Error(`Status ${r.status}`);
    const data = await r.json();
    const products = (Array.isArray(data) ? data : []).map(p => {
      const h = p.handle;
      const handle = typeof h === 'string' ? h : (h?.pt || h?.['pt-BR'] || Object.values(h || {})[0] || String(p.id));
      const promoPrice = p.variants?.[0]?.promotional_price;
      const regularPrice = p.variants?.[0]?.price || p.price || '0';
      const price = promoPrice && parseFloat(promoPrice) < parseFloat(regularPrice) ? promoPrice : regularPrice;
      const compare = promoPrice && parseFloat(promoPrice) < parseFloat(regularPrice) ? regularPrice : (p.compare_at_price || '');
      return {
        id: p.id,
        name: p.name?.pt || p.name?.['pt-BR'] || Object.values(p.name || {})[0] || '',
        price,
        compare,
        image: p.images?.[0]?.src || '',
        url: `https://asuacasatech.com.br/produtos/${handle}`
      };
    });
    res.json({ products, total: products.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
