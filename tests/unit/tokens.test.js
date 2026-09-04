require('dotenv').config();
const { test, describe } = require('node:test');
const assert = require('node:assert');
const jwt = require('jsonwebtoken');
const { generateAccessToken, generateRefreshToken } = require('../../utils/tokens');

describe('Unit Test: JWT Token Utility (utils/tokens.js)', () => {
    const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        name: 'Miro Dev',
        email: 'miro@pricely.ai'
    };

    test('generateAccessToken should generate valid JWT with user payload and 15m expiration', () => {
        const token = generateAccessToken(mockUser);
        assert.ok(typeof token === 'string', 'Token must be a string');
        assert.ok(token.split('.').length === 3, 'JWT must have 3 segments separated by dots');

        // Verify token with the secret
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        assert.strictEqual(decoded.id, mockUser._id, 'Decoded ID should match mock user ID');
        assert.strictEqual(decoded.email, mockUser.email, 'Decoded email should match mock user email');
        assert.strictEqual(decoded.name, mockUser.name, 'Decoded name should match mock user name');

        // Check expiration (~15 mins = 900 seconds)
        const duration = decoded.exp - decoded.iat;
        assert.strictEqual(duration, 15 * 60, 'Expiration duration should be exactly 900 seconds (15 mins)');
    });

    test('generateRefreshToken should generate valid JWT with user ID and 7d expiration', () => {
        const refreshToken = generateRefreshToken(mockUser);
        assert.ok(typeof refreshToken === 'string', 'Refresh token must be a string');

        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        assert.strictEqual(decoded.id, mockUser._id, 'Decoded ID should match');

        // 7 days = 7 * 24 * 60 * 60 = 604800 seconds
        const duration = decoded.exp - decoded.iat;
        assert.strictEqual(duration, 7 * 24 * 60 * 60, 'Expiration should be 7 days');
    });

    test('Token verification should fail with invalid or altered secret', () => {
        const token = generateAccessToken(mockUser);
        assert.throws(
            () => {
                jwt.verify(token, 'wrong_secret_key_12345');
            },
            { name: 'JsonWebTokenError', message: 'invalid signature' },
            'Verification with wrong secret must throw JsonWebTokenError'
        );
    });
});
