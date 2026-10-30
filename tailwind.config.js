const colors = require('./src/theme/colors')

// camelCase palette keys -> kebab-case class names (tinta2 -> tinta-2).
const toKebab = (key) =>
	key.replace(/([a-z])([A-Z0-9])/g, '$1-$2').toLowerCase()

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
	presets: [require('nativewind/preset')],
	theme: {
		extend: {
			colors: Object.fromEntries(
				Object.entries(colors).map(([key, value]) => [toKebab(key), value]),
			),
			// One family per weight: on Android a custom font's weight comes from
			// its family name, and adding fontWeight (font-bold...) on top can make
			// it fall back to the system font. Never combine these with font-*
			// weight classes.
			fontFamily: {
				display: ['Barlow_700Bold'],
				'display-x': ['Barlow_800ExtraBold'],
				sans: ['NotoSans_500Medium'],
				'sans-semibold': ['NotoSans_600SemiBold'],
				'sans-bold': ['NotoSans_700Bold'],
				'sans-x': ['NotoSans_800ExtraBold'],
			},
			borderWidth: {
				1.5: '1.5px',
			},
		},
	},
	plugins: [],
}
