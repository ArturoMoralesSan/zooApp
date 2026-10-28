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
			borderWidth: {
				1.5: '1.5px',
			},
		},
	},
	plugins: [],
}
