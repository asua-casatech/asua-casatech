export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const TOKEN = process.env.NUVEMSHOP_TOKEN;
  const STORE = '7010877';
  
  if (!TOKEN) return res.status(500).json({ error: 'Token nao configurado' });
  
  try {
    const r = await fetch(`https://api.tiendanube.com/v1/${STORE}/products?per_page=20&fields=id,name,price,compare_at_price,images,handle,variants`, {
      headers: { 
        'Authentication': `bearer ${TOKEN}`,
        'User-Agent': 'AsuaCasaTech (victortiziano@hotmail.com)'
      }
    });
    
    const text = await r.text();
    console.log('Status:', r.status, 'Body:', text.substring(0, 200));
    
    if (!r.ok) return res.status(500).json({ error: `API retornou ${r.status}`, body: text.substring(0, 200) });
    
    const data = JSON.parse(text);
    if (!Array.isArray(data)) return res.status(500).json({ error: 'Resposta nao e array', data });
    
    const products = data.map(p => ({
      id: p.id,
      name: p.name?.pt || p.name?.es || Object.values(p.name||{})[0] || '',
      price: p.variants?.[0]?.price || '',
      compare: p.variants?.[0]?.compare_at_price || '',
      image: p.images?.[0]?.src || null,
      url: `https://asuacasatech.com.br/produtos/${p.handle}/`
    }));
    
    res.setHeader('Cache-Control', 's-maxage=300');
    res.json({ products });
  } catch(e) { 
    res.status(500).json({ error: e.message }); 
  }
}