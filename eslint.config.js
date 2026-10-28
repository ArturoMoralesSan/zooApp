// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config')
const expoConfig = require('eslint-config-expo/flat')
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended')

const PALETTE_MESSAGE =
	'Use a palette token from src/theme/colors.js (a class like text-tinta, or colors.tinta) instead of a hardcoded color.'

module.exports = defineConfig([
	expoConfig,
	eslintPluginPrettierRecommended,
	{
		ignores: ['dist/*'],
	},
	{
		// Keep screens and components on NativeWind classes + the palette.
		files: ['src/app/**/*.{ts,tsx}', 'src/components/**/*.{ts,tsx}'],
		rules: {
			'no-restricted-syntax': [
				'error',
				{
					selector: 'Literal[value=/#[0-9a-fA-F]{3,8}\\b/]',
					message: PALETTE_MESSAGE,
				},
				{
					selector: 'TemplateElement[value.raw=/#[0-9a-fA-F]{3,8}\\b/]',
					message: PALETTE_MESSAGE,
				},
				{
					selector: 'Literal[value=/rgba?\\(/]',
					message: PALETTE_MESSAGE,
				},
				{
					selector:
						"CallExpression[callee.object.name='StyleSheet'][callee.property.name='create']",
					message:
						'Use NativeWind className instead of StyleSheet.create (keep inline style only for animated or prop-driven values).',
				},
			],
		},
	},
])
