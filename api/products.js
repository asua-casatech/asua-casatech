export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=300');

  const STORE_ID = '7555109';
  const TOKEN = 'b5d0d580cd6889905fc1606a2101dec2aa72dbfd';
  const page = req.query.page || 1;

  try {
    const r = await fetch(`https://api.tiendanube.com/v1/${STORE_ID}/products?per_page=50&page=${page}`, {
      headers: {
        'Authentication': `bearer ${TOKEN}`,
        'User-Agent': 'ASuaCasaTech (adm@asuacasatech.com.br)',
        'Content-Type': 'application/json'
      }
    });

    if (!r.ok) throw new Error(`Status ${r.status}`);
    const data = await r.json();

    const products = (Array.isArray(data) ? data : []).map(p => ({
      id: p.id,
      name: p.name?.pt || p.name?.['pt-BR'] || Object.values(p.name || {})[0] || '',
      price: p.variants?.[0]?.promotional_price || p.variants?.[0]?.price || p.price || '0',
      compare: p.variants?.[0]?.price || p.compare_at_price || '',
      image: p.images?.[0]?.src || '',
      url: `https://asuacasatech.com.br/produtos/${p.handle || p.id}`
    }));

    res.json({ products, total: products.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
git add . && git commit -m "fix: corrigir handle produtos" && git pushgit add . && git commit -m "fix: corrigir handle produtos" && git push

