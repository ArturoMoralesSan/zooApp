import { setupServer } from 'msw/node'

// EXPO_PUBLIC_API_URL from jest/env.js + the '/api' that api.ts appends.
export const API = 'http://api.test/api'

// Every test registers its own handlers with server.use(); an unhandled
// request fails the test (jest/setup.ts).
export const server = setupServer()
