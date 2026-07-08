const BASE = 'http://localhost:3000';

let passed = 0;
let failed = 0;

async function request(method, path, body) {
    const opts = {
        method,
        headers: { 'Content-Type': 'application/json' },
    };
    if (body !== undefined) {
        opts.body = JSON.stringify(body);
    }
    const res = await fetch(`${BASE}${path}`, opts);
    const text = await res.text();
    let data;
    try {
        data = JSON.parse(text);
    } catch {
        data = text;
    }
    return { status: res.status, data };
}

function assert(label, condition) {
    if (condition) {
        console.log(`  \x1b[32mPASS\x1b[0m  ${label}`);
        passed++;
    } else {
        console.log(`  \x1b[31mFAIL\x1b[0m  ${label}`);
        failed++;
    }
}

function assertStatus(label, actual, expected) {
    if (actual === expected) {
        console.log(`  \x1b[32mPASS\x1b[0m  ${label} (${actual})`);
        passed++;
    } else {
        console.log(`  \x1b[31mFAIL\x1b[0m  ${label} — expected ${expected}, got ${actual}`);
        failed++;
    }
}

async function run() {
    console.log('\n\x1b[36m── API Tests ──────────────────────────────────────\x1b[0m\n');

    // 1. Create a user
    console.log('\x1b[33m▶ CREATE user\x1b[0m');
    const create = await request('POST', '/users', { name: 'Alice', email: 'alice@test.com' });
    assertStatus('POST /users status', create.status, 201);
    assert('returns id', typeof create.data?.id === 'number');
    assert('returns name', create.data?.name === 'Alice');
    assert('returns email', create.data?.email === 'alice@test.com');
    const userId = create.data?.id;

    // 2. Duplicate email rejection
    console.log('\n\x1b[33m▶ DUPLICATE email\x1b[0m');
    const dup = await request('POST', '/users', { name: 'Bob', email: 'alice@test.com' });
    assertStatus('POST /users duplicate status', dup.status, 409);
    assert('returns error message', typeof dup.data?.error === 'string');

    // 3. Get user by ID
    console.log('\n\x1b[33m▶ GET user by ID\x1b[0m');
    const byId = await request('GET', `/users/${userId}`);
    assertStatus('GET /users/:id status', byId.status, 200);
    assert('returns correct user', byId.data?.id === userId && byId.data?.name === 'Alice');

    // 4. Get user by email
    console.log('\n\x1b[33m▶ GET user by email\x1b[0m');
    const byEmail = await request('GET', '/users/email?email=alice@test.com');
    assertStatus('GET /users/email status', byEmail.status, 200);
    assert('returns correct user', byEmail.data?.id === userId);

    // 5. Email not found
    console.log('\n\x1b[33m▶ GET user by email (not found)\x1b[0m');
    const notFound = await request('GET', '/users/email?email=nobody@test.com');
    assertStatus('GET /users/email (missing) status', notFound.status, 404);

    // 6. List all users
    console.log('\n\x1b[33m▶ LIST users\x1b[0m');
    const list = await request('GET', '/users');
    assertStatus('GET /users status', list.status, 200);
    assert('returns array', Array.isArray(list.data));
    assert('contains created user', list.data.some(u => u.id === userId));

    // 7. Update user
    console.log('\n\x1b[33m▶ UPDATE user\x1b[0m');
    const update = await request('PUT', `/users/${userId}`, { name: 'Alice Updated' });
    assertStatus('PUT /users/:id status', update.status, 200);
    assert('name updated', update.data?.name === 'Alice Updated');

    // 8. Update non-existent user
    console.log('\n\x1b[33m▶ UPDATE non-existent user\x1b[0m');
    const updateBad = await request('PUT', '/users/99999', { name: 'Ghost' });
    assertStatus('PUT /users/:id (missing) status', updateBad.status, 404);

    // 9. Batch create
    console.log('\n\x1b[33m▶ BATCH create users\x1b[0m');
    const batch = await request('POST', '/users/batch', {
        users: [
            { name: 'Bob', email: 'bob@test.com' },
            { name: 'Carol', email: 'carol@test.com' },
        ],
    });
    assertStatus('POST /users/batch status', batch.status, 201);
    assert('returns array', Array.isArray(batch.data));
    assert('created 2 users', batch.data.length === 2);
    const bobId = batch.data.find(u => u.name === 'Bob')?.id;

    // 10. Delete user
    console.log('\n\x1b[33m▶ DELETE user\x1b[0m');
    const del = await request('DELETE', `/users/${userId}`);
    assertStatus('DELETE /users/:id status', del.status, 204);

    // 11. Verify deletion
    console.log('\n\x1b[33m▶ VERIFY deletion\x1b[0m');
    const afterDelete = await request('GET', `/users/${userId}`);
    assertStatus('GET /users/:id after delete status', afterDelete.status, 404);

    // 12. Delete non-existent user
    console.log('\n\x1b[33m▶ DELETE non-existent user\x1b[0m');
    const delBad = await request('DELETE', '/users/99999');
    assertStatus('DELETE /users/:id (missing) status', delBad.status, 404);

    // Cleanup: delete batch users
    if (bobId) {
        await request('DELETE', `/users/${bobId}`);
    }
    const carol = batch.data?.find(u => u.name === 'Carol');
    if (carol?.id) {
        await request('DELETE', `/users/${carol.id}`);
    }

    // Summary
    console.log(`\n\x1b[36m──────────────────────────────────────────────────\x1b[0m`);
    console.log(`  \x1b[1mResult:\x1b[0m ${passed} passed, ${failed} failed\n`);

    process.exit(failed > 0 ? 1 : 0);
}

run().catch((err) => {
    console.error('\n  \x1b[31mERROR\x1b[0m', err.message);
    process.exit(1);
});
