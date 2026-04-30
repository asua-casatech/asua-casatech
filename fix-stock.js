const STORE_ID = '6757760';
const TOKEN = '922aa3ba216ab5a10d49bb8433ac3f639f15b217';

async function fixStock() {
  let page = 1;
  let total = 0;
  while(true) {
    const r = await fetch(`https://api.tiendanube.com/v1/${STORE_ID}/products?per_page=50&page=${page}`, {
      headers: { 'Authentication': `bearer ${TOKEN}`, 'User-Agent': 'ASuaCasaTech (adm@asuacasatech.com.br)' }
    });
    const products = await r.json();
    if (!products.length) break;
    for (const p of products) {
      for (const v of p.variants || []) {
        if (v.stock_management) {
          await fetch(`https://api.tiendanube.com/v1/${STORE_ID}/products/${p.id}/variants/${v.id}`, {
            method: 'PUT',
            headers: { 'Authentication': `bearer ${TOKEN}`, 'User-Agent': 'ASuaCasaTech (adm@asuacasatech.com.br)', 'Content-Type': 'application/json' },
            body: JSON.stringify({ stock_management: false })
          });
          console.log(`✅ ${p.id} - ${p.name?.pt} - estoque infinito`);
          total++;
        }
      }
    }
    if (products.length < 50) break;
    page++;
  }
  console.log(`\nTotal corrigido: ${total} variantes`);
}

fixStock().catch(console.error);
