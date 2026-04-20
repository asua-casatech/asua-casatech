export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=300');
  const STORE_ID = '7555109';
  const TOKEN = '9f5da7e66cb1694f93cb398d88eb03a935126ad0';
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
      const handle = typeof p.handle === 'string' ? p.handle : String(p.id);
      return {
        id: p.id,
        name: p.name?.pt || p.name?.['pt-BR'] || Object.values(p.name || {})[0] || '',
        price: p.variants?.[0]?.promotional_price || p.variants?.[0]?.price || p.price || '0',
        compare: p.variants?.[0]?.price || p.compare_at_price || '',
        image: p.images?.[0]?.src || '',
        url: `https://asuacasatech.com.br/produtos/${handle}`
      };
    });
    res.json({ products, total: products.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
