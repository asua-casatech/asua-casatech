export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=3600');
  
  try {
    const r = await fetch('https://asuacasatech.lojavirtualnuvem.com.br/produtos/?format=json', {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' }
    });
    
    if (!r.ok) throw new Error(`Status ${r.status}`);
    const data = await r.json();
    
    const products = (data.items || data.products || data || []).slice(0,20).map(p => ({
      id: p.id,
      name: p.name || p.title || '',
      price: p.price || p.min_price || '',
      compare: p.compare_at_price || p.original_price || '',
      image: p.featured_image || p.image || (p.images && p.images[0]) || null,
      url: `https://asuacasatech.com.br/produtos/${p.handle || p.slug}/`
    }));
    
    res.json({ products, total: products.length });
  } catch(e) { 
    res.status(500).json({ error: e.message }); 
  }
}