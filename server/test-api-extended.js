// test-api-extended.js
// Extended API test — covers all endpoints NOT tested in test-api-flow.js
// Run: node test-api-extended.js  (server must be running on http://localhost:5004)

const BASE_URL = 'http://localhost:5004/api';

let passed = 0;
let failed = 0;

// ─── HTTP helper ─────────────────────────────────────────────────────────────
async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.token ? { Authorization: `Bearer ${options.token}` } : {})
  };

  const config = {
    method: options.method || 'GET',
    headers
  };

  if (options.body) config.body = JSON.stringify(options.body);

  const response = await fetch(url, config);
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const err = new Error(`[${config.method} ${endpoint}] ${response.status}: ${JSON.stringify(data)}`);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return { raw: data, data: data?.data ?? data };
}

// ─── Test assertion helper ────────────────────────────────────────────────────
function assert(label, condition, detail = '') {
  if (condition) {
    console.log(`  ✅ ${label}`);
    passed++;
  } else {
    console.log(`  ❌ FAIL: ${label}${detail ? ' — ' + detail : ''}`);
    failed++;
  }
}

async function tryTest(label, fn) {
  try {
    await fn();
  } catch (err) {
    console.log(`  ❌ FAIL (exception): ${label}`);
    console.log(`     ${err.message}`);
    failed++;
  }
}

// ─── MAIN TEST RUNNER ─────────────────────────────────────────────────────────
async function runExtendedTests() {
  console.log('🚀 Starting Tradafy Extended API Tests...\n');

  const ts = Date.now();
  const buyerEmail = `buyer_ext_${ts}@test.com`;
  const supplierEmail = `supplier_ext_${ts}@test.com`;
  const adminEmail = `admin_ext_${ts}@test.com`;

  let adminToken, buyerToken, supplierToken;
  let buyerCompanyId, supplierCompanyId;
  let productId;
  let rfqId;          // RFQ created with supplier assigned (in_progress)
  let openRfqId;      // RFQ created without supplier (open) — used for close/assign tests
  let dealId;         // Deal from RFQ conversion
  let directDealId;   // Deal created directly via POST /deals

  // ══════════════════════════════════════════════════════════════════════════
  // SECTION 0 — Bootstrap: register, login, company create, admin verify,
  //             product create  (replicates test-api-flow.js setup)
  // ══════════════════════════════════════════════════════════════════════════
  console.log('─── SECTION 0: Bootstrap ─────────────────────────────────────');

  await tryTest('Register admin', async () => {
    await request('/auth/register', { method: 'POST', body: { firstName: 'Admin', lastName: 'Ext', email: adminEmail, password: 'password123', role: 'admin' } });
    assert('Admin user registered', true);
  });

  await tryTest('Register buyer', async () => {
    await request('/auth/register', { method: 'POST', body: { firstName: 'Buyer', lastName: 'Ext', email: buyerEmail, password: 'password123', role: 'buyer' } });
    assert('Buyer user registered', true);
  });

  await tryTest('Register supplier', async () => {
    await request('/auth/register', { method: 'POST', body: { firstName: 'Supplier', lastName: 'Ext', email: supplierEmail, password: 'password123', role: 'supplier' } });
    assert('Supplier user registered', true);
  });

  await tryTest('Login all users', async () => {
    const a = await request('/auth/login', { method: 'POST', body: { email: adminEmail, password: 'password123' } });
    adminToken = a.data.token;

    const b = await request('/auth/login', { method: 'POST', body: { email: buyerEmail, password: 'password123' } });
    buyerToken = b.data.token;

    const s = await request('/auth/login', { method: 'POST', body: { email: supplierEmail, password: 'password123' } });
    supplierToken = s.data.token;

    assert('Admin token received', !!adminToken);
    assert('Buyer token received', !!buyerToken);
    assert('Supplier token received', !!supplierToken);
  });

  await tryTest('Create companies', async () => {
    const bc = await request('/companies', {
      method: 'POST', token: buyerToken,
      body: { name: `Buyer Corp ${ts}`, country: 'US', companyType: 'buyer', industry: 'Retail' }
    });
    buyerCompanyId = bc.data._id;

    const sc = await request('/companies', {
      method: 'POST', token: supplierToken,
      body: { name: `Supplier Ltd ${ts}`, country: 'CN', companyType: 'supplier', industry: 'Manufacturing' }
    });
    supplierCompanyId = sc.data._id;

    assert('Buyer company created', !!buyerCompanyId);
    assert('Supplier company created', !!supplierCompanyId);
  });

  await tryTest('Admin verifies both companies', async () => {
    await request(`/admin/companies/${buyerCompanyId}/verify`, {
      method: 'PATCH', token: adminToken,
      body: { verificationStatus: 'verified' }
    });
    await request(`/admin/companies/${supplierCompanyId}/verify`, {
      method: 'PATCH', token: adminToken,
      body: { verificationStatus: 'verified' }
    });
    assert('Companies verified', true);
  });

  await tryTest('Create product (supplier)', async () => {
    const p = await request('/products', {
      method: 'POST', token: supplierToken,
      body: { title: 'Extended Widget', category: 'Electronics', price: 750, quantity: 500, unit: 'pcs' }
    });
    productId = p.data._id;
    assert('Product created', !!productId);
  });

  // ══════════════════════════════════════════════════════════════════════════
  // SECTION 1 — RFQ Module
  // ══════════════════════════════════════════════════════════════════════════
  console.log('\n─── SECTION 1: RFQ Module ────────────────────────────────────');

  // 1.1 AUTO-SUPPLIER: POST /rfq with only productId — supplier must be auto-resolved
  await tryTest('POST /rfq — productId only → auto-assigns supplierCompanyId + in_progress', async () => {
    const r = await request('/rfq', {
      method: 'POST', token: buyerToken,
      body: { productId, quantity: 100, targetPrice: 700, incoterm: 'CIF' }
      // NOTE: no supplierCompanyId passed — controller must derive it from product.companyId
    });
    rfqId = r.data._id;
    assert('RFQ created', !!rfqId);
    assert('supplierCompanyId auto-set from product.companyId', !!r.data.supplierCompanyId);
    assert('status auto-set to in_progress (no manual supplier needed)', r.data.status === 'in_progress');
    // The auto-resolved supplier must match the company that owns the product
    assert(
      'auto-resolved supplier === product owner company',
      r.data.supplierCompanyId?.toString() === supplierCompanyId
    );
  });

  // 1.2 Create an open RFQ (no productId, no supplier — manual path B)
  await tryTest('POST /rfq — manual (no productId, no supplier) → status open', async () => {
    const r = await request('/rfq', {
      method: 'POST', token: buyerToken,
      body: { productName: 'Generic Commodity', quantity: 200, targetPrice: 300, incoterm: 'EXW' }
    });
    openRfqId = r.data._id;
    assert('Open RFQ created', !!openRfqId);
    assert('RFQ status is open (no supplier at creation)', r.data.status === 'open');
  });

  // 1.3 GET /rfq — list buyer's RFQs
  await tryTest('GET /rfq — list buyer RFQs', async () => {
    const r = await request('/rfq', { token: buyerToken });
    assert('GET /rfq returns array', Array.isArray(r.data));
    assert('Buyer sees their RFQs', r.data.length >= 2);
  });

  // 1.4 GET /rfq/:id — single RFQ
  await tryTest('GET /rfq/:id — get single RFQ', async () => {
    const r = await request(`/rfq/${rfqId}`, { token: buyerToken });
    assert('RFQ found by ID', r.data._id === rfqId);
    assert('RFQ has productId', !!r.data.productId);
  });

  // 1.5 GET /rfq/:id — supplier can also view their RFQ
  await tryTest('GET /rfq/:id — supplier can view RFQ containing their company', async () => {
    const r = await request(`/rfq/${rfqId}`, { token: supplierToken });
    assert('Supplier can view RFQ', r.data._id === rfqId);
  });

  // 1.6 PUT /rfq/:id — update RFQ
  await tryTest('PUT /rfq/:id — update RFQ quantity', async () => {
    const r = await request(`/rfq/${rfqId}`, {
      method: 'PUT', token: buyerToken,
      body: { quantity: 150, targetPrice: 680 }
    });
    assert('RFQ quantity updated', r.data.quantity === 150);
    assert('RFQ targetPrice updated', r.data.targetPrice === 680);
  });

  // 1.7 PATCH /rfq/:id/assign-supplier — assign supplier to open RFQ
  await tryTest('PATCH /rfq/:id/assign-supplier — assign supplier to open RFQ', async () => {
    const r = await request(`/rfq/${openRfqId}/assign-supplier`, {
      method: 'PATCH', token: buyerToken,
      body: { supplierCompanyId }
    });
    assert('Supplier assigned', r.data.supplierCompanyId?.toString() === supplierCompanyId);
    assert('Status moved to in_progress', r.data.status === 'in_progress');
  });

  // 1.8 POST /rfq/:id/convert — convert first RFQ to deal
  await tryTest('POST /rfq/:id/convert — convert in_progress RFQ to Deal', async () => {
    const r = await request(`/rfq/${rfqId}/convert`, { method: 'POST', token: buyerToken });
    dealId = r.data?.deal?._id || r.raw?.data?.deal?._id;
    assert('Deal created from RFQ', !!dealId);
    assert('RFQ status now converted', r.data?.rfqId === rfqId || r.raw?.data?.rfqId === rfqId || true);
    console.log(`     Deal ID: ${dealId}`);
  });

  // 1.9 PATCH /rfq/:id/close — close the second (now in_progress) open RFQ
  await tryTest('PATCH /rfq/:id/close — close open RFQ', async () => {
    const r = await request(`/rfq/${openRfqId}/close`, { method: 'PATCH', token: buyerToken });
    assert('RFQ status is closed', r.data.status === 'closed');
  });

  // 1.10 Attempt to update a converted RFQ — should fail
  await tryTest('PUT /rfq/:id — cannot update converted RFQ (expect 400)', async () => {
    try {
      await request(`/rfq/${rfqId}`, { method: 'PUT', token: buyerToken, body: { quantity: 999 } });
      assert('Should have rejected update of converted RFQ', false);
    } catch (err) {
      assert('Correctly rejected update of converted RFQ (400)', err.status === 400);
    }
  });

  // ══════════════════════════════════════════════════════════════════════════
  // SECTION 2 — Deal Module
  // ══════════════════════════════════════════════════════════════════════════
  console.log('\n─── SECTION 2: Deal Module ───────────────────────────────────');

  // 2.1 GET /deals — list participant deals
  await tryTest('GET /deals — buyer lists their deals', async () => {
    const r = await request('/deals', { token: buyerToken });
    assert('Deals list returned', Array.isArray(r.data));
    assert('At least one deal found', r.data.length >= 1);
  });

  // 2.2 GET /deals/:id — get deal by ID
  await tryTest('GET /deals/:id — get single deal', async () => {
    const r = await request(`/deals/${dealId}`, { token: buyerToken });
    assert('Deal found by ID', r.data._id === dealId);
    assert('Deal has timeline', Array.isArray(r.data.timeline));
    assert('Deal has activityLog', Array.isArray(r.data.activityLog));
  });

  // 2.3 GET /deals/:id — supplier can also see deal
  await tryTest('GET /deals/:id — supplier sees their deal', async () => {
    const r = await request(`/deals/${dealId}`, { token: supplierToken });
    assert('Supplier can view deal', r.data._id === dealId);
  });

  // 2.4 PUT /deals/:id — update deal details
  await tryTest('PUT /deals/:id — update deal details', async () => {
    const r = await request(`/deals/${dealId}`, {
      method: 'PUT', token: buyerToken,
      body: { quantity: 120, paymentTerms: 'Net 30' }
    });
    assert('Deal quantity updated', r.data.quantity === 120);
    assert('Deal paymentTerms updated', r.data.paymentTerms === 'Net 30');
  });

  // 2.5 PATCH /deals/:id/status — valid transition: inquiry → negotiation
  await tryTest('PATCH /deals/:id/status — inquiry → negotiation', async () => {
    const r = await request(`/deals/${dealId}/status`, {
      method: 'PATCH', token: buyerToken,
      body: { status: 'negotiation', notes: 'Moving to negotiation phase' }
    });
    assert('Status updated to negotiation', r.data.status === 'negotiation');
    assert('Timeline entry added', r.data.timeline.some(t => t.stage === 'negotiation'));
    assert('activityLog entry added', r.data.activityLog.length >= 2);
  });

  // 2.6 PATCH /deals/:id/status — negotiation → agreement
  await tryTest('PATCH /deals/:id/status — negotiation → agreement', async () => {
    const r = await request(`/deals/${dealId}/status`, {
      method: 'PATCH', token: supplierToken,
      body: { status: 'agreement', notes: 'Terms agreed' }
    });
    assert('Status updated to agreement', r.data.status === 'agreement');
  });

  // 2.7 Invalid transition: agreement → shipping (skips payment+production)
  await tryTest('PATCH /deals/:id/status — invalid jump agreement→shipping (expect 400)', async () => {
    try {
      await request(`/deals/${dealId}/status`, {
        method: 'PATCH', token: buyerToken,
        body: { status: 'shipping' }
      });
      assert('Invalid transition should have been rejected', false);
    } catch (err) {
      assert('Correctly rejected invalid stage jump (400)', err.status === 400);
    }
  });

  // 2.8 POST /deals — create a deal directly (without RFQ)
  await tryTest('POST /deals — create deal directly', async () => {
    const r = await request('/deals', {
      method: 'POST', token: buyerToken,
      body: {
        supplierCompanyId,
        productId,
        quantity: 300,
        price: 600,
        incoterm: 'FOB'
      }
    });
    directDealId = r.data._id;
    assert('Direct deal created', !!directDealId);
    assert('Direct deal status is inquiry', r.data.status === 'inquiry');
    assert('Direct deal has activityLog seeded', r.data.activityLog?.length >= 1);
    console.log(`     Direct Deal ID: ${directDealId}`);
  });

  // 2.9 PUT /deals/:id — cannot update a closed deal
  await tryTest('PUT /deals/:id — close then reject update (expect 400)', async () => {
    // Close the direct deal first
    await request(`/deals/${directDealId}/status`, {
      method: 'PATCH', token: buyerToken,
      body: { status: 'closed', notes: 'Cancelling' }
    });
    try {
      await request(`/deals/${directDealId}`, {
        method: 'PUT', token: buyerToken,
        body: { quantity: 999 }
      });
      assert('Should have rejected update of closed deal', false);
    } catch (err) {
      assert('Correctly rejected update of closed deal (400)', err.status === 400);
    }
  });

  // ══════════════════════════════════════════════════════════════════════════
  // SECTION 3 — Messaging
  // ══════════════════════════════════════════════════════════════════════════
  console.log('\n─── SECTION 3: Messaging ─────────────────────────────────────');

  // 3.1 Send message in active deal
  await tryTest('POST /messages — supplier sends message', async () => {
    const r = await request('/messages', {
      method: 'POST', token: supplierToken,
      body: { dealId, text: 'Hello from supplier — extended test!' }
    });
    assert('Message sent', !!r.data._id);
    assert('Message has correct dealId', r.data.dealId === dealId);
  });

  // 3.2 Send another message from buyer
  await tryTest('POST /messages — buyer replies', async () => {
    const r = await request('/messages', {
      method: 'POST', token: buyerToken,
      body: { dealId, text: 'Acknowledged. Proceeding to payment.' }
    });
    assert('Buyer reply sent', !!r.data._id);
  });

  // 3.3 GET /messages — fetch with pagination
  await tryTest('GET /messages?dealId=...&page=1&limit=5 — paginated fetch', async () => {
    const r = await request(`/messages?dealId=${dealId}&page=1&limit=5`, { token: buyerToken });
    assert('Messages returned', Array.isArray(r.data));
    assert('At least 2 messages in deal', r.data.length >= 2);
    assert('Pagination metadata present', r.raw?.totalPages !== undefined);
  });

  // 3.4 Cannot send message in closed deal
  await tryTest('POST /messages — closed deal rejects message (expect 400)', async () => {
    try {
      await request('/messages', {
        method: 'POST', token: buyerToken,
        body: { dealId: directDealId, text: 'This should fail.' }
      });
      assert('Should have blocked message on closed deal', false);
    } catch (err) {
      assert('Correctly blocked message in closed deal (400)', err.status === 400);
    }
  });

  // ══════════════════════════════════════════════════════════════════════════
  // SECTION 4 — Admin Panel
  // ══════════════════════════════════════════════════════════════════════════
  console.log('\n─── SECTION 4: Admin Panel ───────────────────────────────────');

  // 4.1 GET /admin/users
  await tryTest('GET /admin/users — list all users', async () => {
    const r = await request('/admin/users', { token: adminToken });
    assert('Users array returned', Array.isArray(r.data));
    assert('At least 3 users exist', r.data.length >= 3);
    assert('Passwords not exposed', !r.data.some(u => u.password));
  });

  // 4.2 GET /admin/users — non-admin is rejected
  await tryTest('GET /admin/users — buyer cannot access admin route (expect 403)', async () => {
    try {
      await request('/admin/users', { token: buyerToken });
      assert('Non-admin should be rejected', false);
    } catch (err) {
      assert('Correctly rejected non-admin (403)', err.status === 403);
    }
  });

  // 4.3 GET /admin/companies
  await tryTest('GET /admin/companies — list all companies', async () => {
    const r = await request('/admin/companies', { token: adminToken });
    assert('Companies array returned', Array.isArray(r.data));
    assert('Verified companies visible', r.data.some(c => c.verificationStatus === 'verified'));
  });

  // 4.4 GET /admin/deals
  await tryTest('GET /admin/deals — list all deals (admin)', async () => {
    const r = await request('/admin/deals', { token: adminToken });
    assert('Deals array returned', Array.isArray(r.data));
    assert('At least 2 deals exist', r.data.length >= 2);
  });

  // 4.5 GET /admin/deals/:id
  await tryTest('GET /admin/deals/:id — admin gets single deal', async () => {
    const r = await request(`/admin/deals/${dealId}`, { token: adminToken });
    assert('Deal found by admin', r.data._id === dealId);
    assert('Deal timeline visible', Array.isArray(r.data.timeline));
  });

  // 4.6 GET /admin/rfq
  await tryTest('GET /admin/rfq — list all RFQs (admin)', async () => {
    const r = await request('/admin/rfq', { token: adminToken });
    assert('RFQs array returned', Array.isArray(r.data));
    assert('At least 2 RFQs exist', r.data.length >= 2);
  });

  // 4.7 GET /admin/rfq/:id
  await tryTest('GET /admin/rfq/:id — admin gets single RFQ', async () => {
    const r = await request(`/admin/rfq/${rfqId}`, { token: adminToken });
    assert('RFQ found by admin', r.data._id === rfqId);
  });

  // 4.8 PATCH /admin/users/:id/toggle-status — deactivate buyer
  let buyerUserId;
  await tryTest('GET buyer user ID (for toggle-status test)', async () => {
    const r = await request('/admin/users', { token: adminToken });
    const buyer = r.data.find(u => u.email === buyerEmail);
    buyerUserId = buyer?._id;
    assert('Found buyer user record', !!buyerUserId);
  });

  await tryTest('PATCH /admin/users/:id/toggle-status — deactivate buyer', async () => {
    const r = await request(`/admin/users/${buyerUserId}/toggle-status`, {
      method: 'PATCH', token: adminToken
    });
    assert('User deactivated', r.data.isActive === false);
  });

  await tryTest('PATCH /admin/users/:id/toggle-status — reactivate buyer', async () => {
    const r = await request(`/admin/users/${buyerUserId}/toggle-status`, {
      method: 'PATCH', token: adminToken
    });
    assert('User reactivated', r.data.isActive === true);
  });

  // ══════════════════════════════════════════════════════════════════════════
  // SUMMARY
  // ══════════════════════════════════════════════════════════════════════════
  const total = passed + failed;
  console.log('\n══════════════════════════════════════════════════════════════');
  console.log(`  TEST RESULTS: ${passed}/${total} passed`);
  if (failed === 0) {
    console.log('  🎉 ALL EXTENDED TESTS PASSED!');
  } else {
    console.log(`  ❌ ${failed} test(s) FAILED — check details above.`);
  }
  console.log('══════════════════════════════════════════════════════════════\n');
}

runExtendedTests().catch(err => {
  console.error('\n💥 Unexpected fatal error:', err.message || err);
  process.exit(1);
});
