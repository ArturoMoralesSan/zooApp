import type { CreditsResponse } from '@/types/credits'

// The API doc's example response, shown until the credits screen is
// connected to GET /api/v1/credits.
export const CREDITS_DRAFT: CreditsResponse = {
	success: true,
	data: [
		{
			card: { id: 1, name: 'Jaguar', species_name: 'Jaguar' },
			credits: [
				{
					id: 2,
					asset: 'artwork',
					asset_label: 'Ilustración',
					role: 'origin',
					role_label: 'Origen',
					title: null,
					author: null,
					source: { name: 'ai', label: 'Generada con IA', url: null },
					license: {
						short_name: 'IA · Adobe Firefly',
						name: 'Términos de Adobe Firefly (imagen generada con IA)',
						url: null,
					},
					modified: true,
					modification_note: 'Retocada a mano',
					attribution: 'Imagen generada con IA (Adobe Firefly)',
					based_on_asset: null,
				},
				{
					id: 3,
					asset: 'thumbnail',
					asset_label: 'Miniatura',
					role: 'origin',
					role_label: 'Origen',
					title: 'Jaguar en la selva',
					author: null,
					source: { name: 'own', label: 'Propio', url: null },
					license: { short_name: 'Propia', name: 'Obra propia', url: null },
					modified: false,
					modification_note: null,
					attribution:
						'“Jaguar en la selva”, a partir del modelo 3D de la tarjeta – obra propia',
					based_on_asset: 'model',
				},
				{
					id: 4,
					asset: 'thumbnail',
					asset_label: 'Miniatura',
					role: 'component',
					role_label: 'Incluye',
					title: 'Forest Slope',
					author: { name: 'Greg Zaal', url: null },
					source: {
						name: 'poly_haven',
						label: 'Poly Haven',
						url: 'https://polyhaven.com/a/forest_slope',
					},
					license: {
						short_name: 'CC0 1.0',
						name: 'Creative Commons Cero 1.0 (dominio público)',
						url: 'https://creativecommons.org/publicdomain/zero/1.0/',
					},
					modified: false,
					modification_note: null,
					attribution:
						'Incluye: “Forest Slope” de Greg Zaal, vía Poly Haven, CC0 1.0',
					based_on_asset: null,
				},
				{
					id: 5,
					asset: 'model',
					asset_label: 'Modelo 3D',
					role: 'origin',
					role_label: 'Origen',
					title: null,
					author: null,
					source: { name: 'meshy', label: 'Meshy', url: null },
					license: {
						short_name: 'CC BY 4.0',
						name: 'Meshy (plan gratuito) – Creative Commons Atribución 4.0',
						url: 'https://creativecommons.org/licenses/by/4.0/',
					},
					modified: true,
					modification_note: 'Escalado para RA',
					attribution:
						'Modelo 3D creado con Meshy a partir de la ilustración de la tarjeta – CC BY 4.0',
					based_on_asset: 'artwork',
				},
			],
		},
		{
			card: { id: 2, name: 'Hipopótamo', species_name: 'Hipopótamo' },
			credits: [
				{
					id: 6,
					asset: 'artwork',
					asset_label: 'Ilustración',
					role: 'origin',
					role_label: 'Origen',
					title: 'Hippo at sunset',
					author: {
						name: 'Jane Doe',
						url: 'https://commons.wikimedia.org/wiki/User:Jane_Doe',
					},
					source: {
						name: 'wikimedia_commons',
						label: 'Wikimedia Commons',
						url: 'https://commons.wikimedia.org/wiki/File:Hippo_at_sunset.jpg',
					},
					license: {
						short_name: 'CC BY-SA 4.0',
						name: 'Creative Commons Atribución-CompartirIgual 4.0',
						url: 'https://creativecommons.org/licenses/by-sa/4.0/',
					},
					modified: true,
					modification_note: 'Recortada/adaptada para la tarjeta',
					attribution:
						'“Hippo at sunset” de Jane Doe, vía Wikimedia Commons, CC BY-SA 4.0, con cambios: Recortada/adaptada para la tarjeta',
					based_on_asset: null,
				},
				{
					id: 7,
					asset: 'thumbnail',
					asset_label: 'Miniatura',
					role: 'origin',
					role_label: 'Origen',
					title: null,
					author: {
						name: 'Ana López',
						url: 'https://www.pexels.com/@ana-lopez',
					},
					source: {
						name: 'pexels',
						label: 'Pexels',
						url: 'https://www.pexels.com/photo/hippo-123/',
					},
					license: {
						short_name: 'Licencia de Pexels',
						name: 'Licencia de Pexels',
						url: 'https://www.pexels.com/license/',
					},
					modified: true,
					modification_note: 'Recortada/adaptada para la tarjeta',
					attribution:
						'Ana López, vía Pexels, Licencia de Pexels, con cambios: Recortada/adaptada para la tarjeta',
					based_on_asset: null,
				},
				{
					id: 8,
					asset: 'model',
					asset_label: 'Modelo 3D',
					role: 'origin',
					role_label: 'Origen',
					title: 'Hippo low poly',
					author: { name: 'ana3d', url: 'https://sketchfab.com/ana3d' },
					source: {
						name: 'sketchfab',
						label: 'Sketchfab',
						url: 'https://sketchfab.com/3d-models/hippo-123',
					},
					license: {
						short_name: 'CC BY 4.0',
						name: 'Creative Commons Atribución 4.0',
						url: 'https://creativecommons.org/licenses/by/4.0/',
					},
					modified: true,
					modification_note: 'Escalado para RA',
					attribution:
						'“Hippo low poly” de ana3d, vía Sketchfab, CC BY 4.0, con cambios: Escalado para RA',
					based_on_asset: null,
				},
			],
		},
	],
	meta: { generated_at: '2026-10-31T18:00:00-06:00', cards: 2, credits: 7 },
}
