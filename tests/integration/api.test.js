const { test, describe } = require('node:test');
const assert = require('node:assert');

const BASE_URL = 'http://localhost:3000';

describe('Integration Test: Express API & Auth Security Endpoints', () => {

    test('GET /api/auth/me should reject unauthenticated request with 401 UNAUTHORIZED', async () => {
        const response = await fetch(`${BASE_URL}/api/auth/me`);
        assert.strictEqual(response.status, 401, 'Should respond with 401 status code');

        const data = await response.json();
        assert.strictEqual(data.success, false);
        assert.strictEqual(data.code, 'UNAUTHORIZED');
    });

    test('POST /api/auth/signin with empty body should return 400 FIELDS_REQUIRED', async () => {
        const response = await fetch(`${BASE_URL}/api/auth/signin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
        });
        assert.strictEqual(response.status, 400);

        const data = await response.json();
        assert.strictEqual(data.success, false);
        assert.strictEqual(data.code, 'FIELDS_REQUIRED');
    });

    test('POST /api/auth/signin with incorrect password should return 401 INVALID_CREDENTIALS', async () => {
        const response = await fetch(`${BASE_URL}/api/auth/signin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'nonexistent_test_user_xyz99@domain.com',
                password: 'WrongPassword123!'
            })
        });
        assert.strictEqual(response.status, 401);

        const data = await response.json();
        assert.strictEqual(data.success, false);
        assert.strictEqual(data.code, 'INVALID_CREDENTIALS');
    });

    test('POST /api/auth/signup with short password should return 400 PASSWORD_TOO_SHORT', async () => {
        const response = await fetch(`${BASE_URL}/api/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test Short',
                email: 'test_short@domain.com',
                password: '123' // less than 6 chars
            })
        });
        assert.strictEqual(response.status, 400);

        const data = await response.json();
        assert.strictEqual(data.success, false);
        assert.strictEqual(data.code, 'PASSWORD_TOO_SHORT');
    });

    test('POST /api/compare without auth cookie should be blocked by protect middleware (401)', async () => {
        const response = await fetch(`${BASE_URL}/api/compare`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: 'MacBook M4' })
        });
        assert.strictEqual(response.status, 401);

        const data = await response.json();
        assert.strictEqual(data.success, false);
        assert.strictEqual(data.code, 'UNAUTHORIZED');
    });

    test('GET /api/compare/history without auth cookie should return 401 UNAUTHORIZED', async () => {
        const response = await fetch(`${BASE_URL}/api/compare/history`);
        assert.strictEqual(response.status, 401);

        const data = await response.json();
        assert.strictEqual(data.success, false);
        assert.strictEqual(data.code, 'UNAUTHORIZED');
    });

    test('POST /api/auth/signout should return 200 and clear authentication cookies', async () => {
        const response = await fetch(`${BASE_URL}/api/auth/signout`, {
            method: 'POST'
        });
        assert.strictEqual(response.status, 200);

        const data = await response.json();
        assert.strictEqual(data.success, true);

        // Check Set-Cookie headers for cleared cookies
        const setCookie = response.headers.get('set-cookie');
        assert.ok(setCookie, 'Response should contain Set-Cookie headers to clear session');
        assert.ok(setCookie.includes('accessToken'), 'Must invalidate accessToken');
    });
});
