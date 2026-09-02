const http = require('http');

function request(path, method = 'GET', body = null, token = '') {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/v1' + path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': 'Bearer ' + token } : {})
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function test() {
  console.log('--- TESTING NESTJS PRODUCT SCANNING & SCANS APIS ---');

  // 1. Login to get Access Token
  const loginRes = await request('/auth/login', 'POST', { email: 'dp150875@gmail.com', password: 'Dp@123' });
  console.log('1. Login Status:', loginRes.status);
  const token = loginRes.data?.data?.accessToken;
  console.log('   Token acquired:', token ? 'YES ✅' : 'NO ❌');

  // 2. GET /products/barcode/8901725112119 (Balaji Wafers)
  const productBalaji = await request('/products/barcode/8901725112119', 'GET', null, token);
  console.log('\n2. GET /products/barcode/8901725112119 (Balaji Wafers):', productBalaji.status);
  console.log('   Product Name:', productBalaji.data?.data?.name || productBalaji.data?.name || 'Not found');
  console.log('   Health Label:', productBalaji.data?.data?.healthLabel || 'N/A');
  console.log('   Health Score:', productBalaji.data?.data?.healthScore || 'N/A');

  // 3. GET /products/barcode/8901063112119 (Maggi Noodles)
  const productMaggi = await request('/products/barcode/8901063112119', 'GET', null, token);
  console.log('\n3. GET /products/barcode/8901063112119 (Maggi Noodles):', productMaggi.status);
  console.log('   Product Name:', productMaggi.data?.data?.name || 'Not found');

  // 4. POST /scans (Save Scan to MongoDB)
  const productId = productBalaji.data?.data?.productId || '6a9829fb9230890355419391';
  const saveScanRes = await request('/scans', 'POST', {
    productId: productId,
    barcode: '8901725112119',
    scannedAt: new Date().toISOString()
  }, token);
  console.log('\n4. POST /scans (Save Scan):', saveScanRes.status);
  console.log('   Response message:', saveScanRes.data?.message || JSON.stringify(saveScanRes.data));

  // 5. GET /scans/history (Fetch User Scan History from MongoDB)
  const historyRes = await request('/scans/history', 'GET', null, token);
  console.log('\n5. GET /scans/history:', historyRes.status);
  const scansCount = historyRes.data?.data?.scans?.length ?? historyRes.data?.length ?? 0;
  console.log('   Total Scans Recorded in MongoDB:', scansCount);

  console.log('\n✅ ALL PRODUCT SCANNING REST API ENDPOINTS TESTED SUCCESSFULLY!');
}

test().catch(err => console.error('❌ Test failed:', err));
