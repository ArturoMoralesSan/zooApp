const { getDefaultConfig } = require('expo/metro-config')
const { withNativeWind } = require('nativewind/metro')

const config = getDefaultConfig(__dirname)

config.resolver.assetExts.push(
	'glb',
	'gltf',
	'obj',
	'mtl',
	'bin',
	'vrx',
	'hdr',
	'arobject',
)
// inlineRem 16 keeps the Tailwind scale identical to web (p-4 = 16px).
module.exports = withNativeWind(config, {
	input: './src/global.css',
	inlineRem: 16,
})
