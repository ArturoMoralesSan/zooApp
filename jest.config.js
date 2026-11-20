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
	// ZooDeck only, the module these tests cover (docs/TESTING_PLAN.md §0).
	collectCoverageFrom: [
		'src/services/{cards,duels,location,pack,packCrypto,packStore,packSync}.ts',
		'src/contexts/DuelContext.tsx',
		'src/hooks/{useCards,useCardAsset,usePackStatus,usePackSync,useOfflinePackPrompts,useZooDeckMap,useArAvailability,useViroHandoff,useSurfaceOffer}.ts',
		'src/utils/{cards,zoodeck,zoodeckDebug,offlinePack}.ts',
		'src/app/(tabs)/zoodeek.tsx',
		'src/app/{deck,duel}/**/*.tsx',
		'src/components/{deck,duel,zoodeck,ar}/*.tsx',
	],
}
