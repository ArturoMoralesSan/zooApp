import { afterAll, afterEach, beforeAll, jest } from '@jest/globals'

import { server } from '../test-utils/server'

import { __reset as resetFileSystem } from './mocks/file-system'
import { __reset as resetNetInfo } from './mocks/netinfo'
import { __reset as resetSecureStore } from './mocks/secure-store'

// Only native modules are replaced, with in-memory versions that behave like
// the real ones: jest-expo's defaults read every key as undefined, report
// every file as missing and fail on NetInfo.fetch().
jest.mock('expo-secure-store', () => jest.requireActual('./mocks/secure-store'))
jest.mock('@react-native-community/netinfo', () =>
	jest.requireActual('./mocks/netinfo'),
)
jest.mock('expo-file-system', () => jest.requireActual('./mocks/file-system'))

// expo-crypto's own JS on its web backend (WebCrypto): real AES-GCM and
// SHA-256 instead of the native module, which Jest can't load.
jest.mock('expo-crypto/build/aes/ExpoCryptoAES', () =>
	jest.requireActual('expo-crypto/build/aes/ExpoCryptoAES.web'),
)
jest.mock('expo-crypto/build/ExpoCrypto', () =>
	jest.requireActual('expo-crypto/build/ExpoCrypto.web'),
)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

afterEach(() => {
	server.resetHandlers()
	resetSecureStore()
	resetNetInfo()
	resetFileSystem()
})

afterAll(() => server.close())
