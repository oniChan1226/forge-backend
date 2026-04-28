// Jest setup: load env vars before any test modules are imported
import 'dotenv/config';

// Ensure required env vars have defaults for testing
if (!process.env['JWT_SECRET']) {
  process.env['JWT_SECRET'] = 'test-secret-key-for-jest';
}
if (!process.env['JWT_EXPIRES_IN']) {
  process.env['JWT_EXPIRES_IN'] = '1h';
}
if (!process.env['DATABASE_URL']) {
  process.env['DATABASE_URL'] = 'file:./dev.db';
}
