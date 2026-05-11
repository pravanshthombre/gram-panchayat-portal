const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');

const authModulePath = require.resolve('../middleware/auth');

function loadAuthModule(secret) {
  process.env.JWT_SECRET = secret;
  delete require.cache[authModulePath];
  return require('../middleware/auth');
}

test('generateToken signs token with configured JWT secret', () => {
  const secret = 'unit-test-secret';
  const { generateToken } = loadAuthModule(secret);

  const token = generateToken({
    id: 10,
    name: 'Demo User',
    email: 'demo@example.com',
    role: 'villager',
    village_id: 2,
  });

  const decoded = jwt.verify(token, secret);
  assert.equal(decoded.id, 10);
  assert.equal(decoded.role, 'villager');
});

test('requireAdmin denies non-admin users', () => {
  const { requireAdmin } = loadAuthModule('another-secret');
  const req = { user: { role: 'villager' } };
  let statusCode = 200;
  let payload = null;
  let nextCalled = false;

  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(data) {
      payload = data;
      return this;
    },
  };

  requireAdmin(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(statusCode, 403);
  assert.deepEqual(payload, { error: 'Admin access required.' });
});
