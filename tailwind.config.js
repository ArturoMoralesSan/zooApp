/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
	presets: [require('nativewind/preset')],
	theme: {
		extend: {
			colors: require('./src/theme/colors'),
			borderWidth: {
				1.5: '1.5px',
			},
		},
	},
	plugins: [],
}
