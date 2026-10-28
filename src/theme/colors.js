// ZooApp official palette (Sistema de diseño · Color).
// Single source of truth: consumed by tailwind.config.js for classes
// (keys become kebab-case: tinta2 -> text-tinta-2) and imported from TS
// (`@/theme/colors`) for props like icon colors.
// CommonJS on purpose so tailwind.config.js can require it.

const colors = {
	/* PALETA BASE */

	esmeralda: '#06733A', // Botón primario, activo, enlaces
	bosque: '#053D1E', // Títulos, paneles oscuros, borde de botón
	lima: '#B8F25C', // Badges, progreso, anillo de foco
	error: '#B42318', // Eliminar, errores
	errorBg: '#FDECEA', // Zona de peligro
	errorBorder: '#F1B5AE',
	tinta: '#0B2416', // Texto principal
	tinta2: '#234A33', // Texto secundario y subtítulos
	apagado: '#4F6B5A', // Placeholder, inactivo
	aviso: '#FFF1CC', // Pendiente
	avisoText: '#6B4300',
	niebla: '#EEF4F0', // Fondo de cards, filas
	hoja: '#D3EBDB', // Fondo de íconos, chips, activo
	blanco: '#FFFFFF', // Superficie

	/* EXCLUSIVOS DE LA APP */

	screen: '#FFFFFF', // Fondo de pantalla
	cardBorder: '#A9C7B3', // 1.5 px sobre Niebla
	inputBorder: '#3C7A52', // 1.5 px
}

module.exports = colors
