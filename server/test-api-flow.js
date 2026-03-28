// test-api-flow.js
// Run this with: node test-api-flow.js
// Ensure the server is running on http://localhost:5004

const BASE_URL = 'http://localhost:5004/api';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.token ? { Authorization: `Bearer ${options.token}` } : {})
  };

  const config = {
    method: options.method || 'GET',
    headers,
  };

  if (options.body) {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, config);
  const data = await response.json().catch(() => null);
  
  if (!response.ok) {
    console.log(`\n❌ API Error [${config.method} ${endpoint}]:\n${JSON.stringify(data || response.statusText, null, 2)}`);
    throw new Error(`Request failed: ${response.status}`);
  }
  
  return data.data || data;
}

async function runTest() {
  console.log('🚀 Starting Tradafy End-to-End API Test...\n');
  
  try {
    const timestamp = Date.now();
    const buyerEmail = `buyer_${timestamp}@test.com`;
    const supplierEmail = `supplier_${timestamp}@test.com`;
    const adminEmail = `admin_${timestamp}@test.com`;

    // 1. Register Users
    console.log('1. Registering Users...');
    await request('/auth/register', {
      method: 'POST',
      body: { firstName: 'Admin', lastName: 'User', email: adminEmail, password: 'password123', role: 'admin' }
    });
    console.log('✅ Admin registered');

    await request('/auth/register', {
      method: 'POST',
      body: { firstName: 'Buyer', lastName: 'User', email: buyerEmail, password: 'password123', role: 'buyer' }
    });
    console.log('✅ Buyer registered');

    await request('/auth/register', {
      method: 'POST',
      body: { firstName: 'Supplier', lastName: 'User', email: supplierEmail, password: 'password123', role: 'supplier' }
    });
    console.log('✅ Supplier registered\n');

    // 2. Login Users to get Tokens
    console.log('2. Logging In...');
    const adminLogin = await request('/auth/login', {
      method: 'POST',
      body: { email: adminEmail, password: 'password123' }
    });
    const adminToken = adminLogin.token;

    const buyerLogin = await request('/auth/login', {
      method: 'POST',
      body: { email: buyerEmail, password: 'password123' }
    });
    const buyerToken = buyerLogin.token;

    const supplierLogin = await request('/auth/login', {
      method: 'POST',
      body: { email: supplierEmail, password: 'password123' }
    });
    const supplierToken = supplierLogin.token;
    console.log('✅ Users logged in\n');

    // 3. Create Companies
    console.log('3. Creating Companies...');
    const buyerCompanyId = (await request('/companies', {
      method: 'POST',
      token: buyerToken,
      body: {
        name: `Buyer Corp ${timestamp}`,
        country: 'US',
        companyType: 'buyer',
        industry: 'Retail'
      }
    }))._id;
    console.log('✅ Buyer Company created:', buyerCompanyId);

    const supplierCompanyId = (await request('/companies', {
      method: 'POST',
      token: supplierToken,
      body: {
        name: `Supplier Ltd ${timestamp}`,
        country: 'CN',
        companyType: 'supplier',
        industry: 'Manufacturing'
      }
    }))._id;
    console.log('✅ Supplier Company created:', supplierCompanyId);

    // 3.5 Admin Verifies Companies
    console.log('\n3.5 Admin Verifying Companies...');
    await request(`/admin/companies/${buyerCompanyId}/verify`, {
      method: 'PATCH',
      token: adminToken,
      body: { verificationStatus: 'verified' }
    });
    await request(`/admin/companies/${supplierCompanyId}/verify`, {
      method: 'PATCH',
      token: adminToken,
      body: { verificationStatus: 'verified' }
    });
    console.log('✅ Companies verified by Admin');

    console.log('\n4. Creating Product...');
    const product = await request('/products', {
      method: 'POST',
      token: supplierToken,
      body: {
        title: 'Premium Widget',
        category: 'Electronics',
        price: 500,
        quantity: 1000,
        unit: 'box'
      }
    });
    console.log('✅ Product created:', product._id);

    // 5. Create RFQ (Buyer)
    console.log('\n5. Creating RFQ...');
    const rfq = await request('/rfq', {
      method: 'POST',
      token: buyerToken,
      body: {
        supplierCompanyId: supplierCompanyId,
        productId: product._id,
        quantity: 50,
        targetPrice: 450,
        incoterm: 'FOB'
      }
    });
    console.log('✅ RFQ created:', rfq._id);
    console.log('   Status:', rfq.status);

    // 6. Convert RFQ to Deal (Buyer)
    console.log('\n6. Converting RFQ to Deal...');
    const conversion = await request(`/rfq/${rfq._id}/convert`, {
      method: 'POST',
      token: buyerToken
    });
    const dealId = conversion.deal._id;
    console.log('✅ Deal created:', dealId);

    // 7. Send Message in Deal (Supplier)
    console.log('\n7. Sending initial message...');
    const message = await request('/messages', {
      method: 'POST',
      token: supplierToken,
      body: {
        dealId: dealId,
        text: 'Hello! I received your deal inquiry. We accept the $450 target price.'
      }
    });
    console.log('✅ Message sent:', message._id);

    // 8. Fetch Messages (Buyer)
    console.log('\n8. Fetching messages...');
    const messages = await request(`/messages?dealId=${dealId}`, {
      token: buyerToken
    });
    console.log(`✅ Messages loaded (${messages.length} found)`);
    console.log(`   Latest: "${messages[0].text}"`);

    console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY! The core API flow works perfectly.');

  } catch (error) {
    console.error('\n❌ Test execution failed:', error.message || error);
  }
}

runTest();
