// Packages published untranspiled (JSX or ESM) that Babel must transform.
// Keep every entry from jest-expo's default list: expo-router needs
// standard-navigation.
const transformPackages = [
	'.pnpm',
	'react-native',
	'@react-native',
	'@react-native-community',
	'expo',
	'@expo',
	'@expo-google-fonts',
	'react-navigation',
	'@react-navigation',
	'@sentry/react-native',
	'native-base',
	'standard-navigation',
	'nativewind',
	'react-native-css-interop',
	// MSW 2 and its ESM-only dependencies.
	'msw',
	'@mswjs',
	'rettime',
	'until-async',
	'@open-draft',
	'outvariant',
	'strict-event-emitter',
	'headers-polyfill',
	'is-node-process',
	'tough-cookie',
	'type-fest',
	'path-to-regexp',
	'cookie',
	'graphql',
	'statuses',
	'tldts',
	'tldts-core',
	'@inquirer',
	'picocolors',
]

/** @type {import('jest').Config} */
module.exports = {
	preset: 'jest-expo',
	globalSetup: '<rootDir>/jest/globalSetup.js',
	setupFiles: ['<rootDir>/jest/env.js'],
	setupFilesAfterEnv: ['<rootDir>/jest/setup.ts'],
	testMatch: ['<rootDir>/__tests__/**/*.test.{ts,tsx}'],
	// Spy calls never leak into the next test; implementations stay.
	clearMocks: true,
	// A screen's first render transforms its whole component tree, which
	// takes longer than Jest's default 5 s on a cold cache (always in CI).
	testTimeout: 30_000,
	moduleNameMapper: {
		// 3D assets registered in metro.config.js; Metro turns them into numbers.
		'\\.(glb|gltf|obj|mtl|bin|vrx|hdr|arobject)$': '<rootDir>/jest/fileStub.js',
		// Under the react-native condition this resolves to an ESM index of
		// thousands of icon modules that Babel would transform one by one;
		// the package's single CommonJS build loads in seconds.
		'^@hugeicons/core-free-icons$':
			'<rootDir>/node_modules/@hugeicons/core-free-icons/dist/cjs/index.js',
		// msw/node resolves to null under the react-native/browser conditions.
		'^msw/node$': '<rootDir>/node_modules/msw/lib/node/index.js',
		// Before @/: jest-expo maps only the first tsconfig path.
		'^@/assets/(.*)$': '<rootDir>/assets/$1',
		'^@/(.*)$': '<rootDir>/src/$1',
	},
	// rettime ships .mjs only; the preset transforms .[jt]sx? files.
	transform: { '\\.mjs$': 'babel-jest' },
	transformIgnorePatterns: [
		`/node_modules/(?!(${transformPackages.join('|')}))`,
		'/node_modules/react-native-reanimated/plugin/',
		'/node_modules/@react-native/babel-preset/',
	],
	// ZooDeck only: the module these tests cover so far.
	collectCoverageFrom: [
		'src/services/{cards,duels,location,pack,packCrypto,packStore,packSync}.ts',
		'src/contexts/DuelContext.tsx',
		'src/hooks/{useCards,useCardAsset,usePackStatus,usePackSync,useOfflinePackPrompts,useZooDeckMap,useArAvailability,useViroHandoff,useSurfaceOffer}.ts',
		'src/utils/{cards,zoodeck,zoodeckDebug,offlinePack}.ts',
		'src/app/(tabs)/zoodeek.tsx',
		'src/app/{deck,duel}/**/*.tsx',
		'src/components/{deck,duel,zoodeck,ar}/*.tsx',
	],
	// Checked by `npm run test:ci`. Files whose logic is fully reachable keep
	// their full coverage; packSync's remaining branches are file-system
	// failures. Jest leaves the files listed here out of `global`, which
	// covers the rest (mostly screens and components; the AR, 3D and map
	// ones aren't unit-tested). It's the value measured when the thresholds
	// were set: raise it as coverage grows, never lower it.
	coverageThreshold: {
		global: { lines: 25, statements: 25, functions: 25, branches: 24 },
		'./src/services/packCrypto.ts': { lines: 100, branches: 100 },
		// visitReason's ApiError guard (duels.ts:32) can't be reached from
		// startDuel, which rethrows anything else first.
		'./src/services/duels.ts': { lines: 100, branches: 90 },
		'./src/services/cards.ts': { lines: 100, branches: 100 },
		'./src/services/pack.ts': { lines: 100, branches: 100 },
		'./src/services/packStore.ts': { lines: 90 },
		'./src/services/packSync.ts': { lines: 85 },
		'./src/contexts/DuelContext.tsx': { lines: 90 },
		'./src/utils/offlinePack.ts': { lines: 100, branches: 100 },
		'./src/utils/zoodeck.ts': { lines: 100, branches: 100 },
		'./src/hooks/useArAvailability.ts': { lines: 100 },
		'./src/hooks/usePackSync.ts': { lines: 100 },
	},
}
