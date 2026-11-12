import {
	Alert02Icon,
	Cards01Icon,
	Clock01Icon,
	CubeIcon,
	Image01Icon,
	CheckmarkCircle02Icon,
	CloudDownloadIcon,
	Download04Icon,
	HardDriveIcon,
	Refresh01Icon,
	WifiOff01Icon,
} from '@hugeicons/core-free-icons'
import type { IconSvgElement } from '@hugeicons/react-native'

import type { PackFileStatus, PackStatus } from '@/services/packSync'
import colors from '@/theme/colors'
import type { PackKind } from '@/types/pack'

import { formatBytes } from './format'

export type PackSummaryKind =
	'unknown' | 'empty' | 'downloading' | 'ready' | 'pending' | 'noSpace'

export type PackSummary = {
	kind: PackSummaryKind
	text: string
	icon: IconSvgElement
	// Needs the user: nothing downloaded, updates or a problem.
	highlighted: boolean
}

const plural = (count: number, one: string, many: string) =>
	`${count} ${count === 1 ? one : many}`

// One line for the offline pack's state, shared by the ZooDeck card and the
// detail screen. The icon and the text carry the state, never color alone.
export function getPackSummary(status: PackStatus): PackSummary {
	if (status.activity === 'downloading') {
		return {
			kind: 'downloading',
			text: `Descargando… ${Math.round(status.progress * 100)} %`,
			icon: CloudDownloadIcon,
			highlighted: false,
		}
	}

	if (status.activity === 'noSpace') {
		return {
			kind: 'noSpace',
			text: 'No hay espacio suficiente',
			icon: HardDriveIcon,
			highlighted: true,
		}
	}

	if (!status.hasManifest) {
		return {
			kind: 'unknown',
			text:
				status.activity === 'checking'
					? 'Revisando el paquete…'
					: 'Conéctate para ver el paquete',
			icon: WifiOff01Icon,
			highlighted: false,
		}
	}

	if (status.totalCount > 0 && status.doneCount === 0) {
		return {
			kind: 'empty',
			text: `Descarga tus tarjetas en Wi-Fi · ${formatBytes(status.totalBytes)}`,
			icon: Download04Icon,
			highlighted: true,
		}
	}

	if (status.pendingCount === 0) {
		return {
			kind: 'ready',
			text: 'Listo para tu visita',
			icon: CheckmarkCircle02Icon,
			highlighted: false,
		}
	}

	const size = formatBytes(status.pendingBytes)

	if (status.failedCount === status.pendingCount) {
		return {
			kind: 'pending',
			text: `${plural(status.failedCount, 'archivo', 'archivos')} con error · se reintentará`,
			icon: Alert02Icon,
			highlighted: true,
		}
	}

	return {
		kind: 'pending',
		text:
			status.updateCount > 0
				? `${plural(status.updateCount, 'actualización', 'actualizaciones')} · ${size}`
				: `Faltan ${plural(status.pendingCount, 'archivo', 'archivos')} · ${size}`,
		icon: status.updateCount > 0 ? Refresh01Icon : Download04Icon,
		highlighted: true,
	}
}

export const fileKinds: Record<
	PackKind,
	{ label: string; icon: IconSvgElement }
> = {
	model: { label: 'Modelo 3D', icon: CubeIcon },
	card_image: { label: 'Tarjeta', icon: Cards01Icon },
	thumbnail: { label: 'Miniatura', icon: Image01Icon },
}

export type PackStateInfo = {
	icon: IconSvgElement
	label: string
	color: string
	// Same color as a text class.
	text: string
}

// A file's state as icon, label and color (text says it, not color alone).
export function fileStateInfo(
	file: PackFileStatus,
	active: boolean,
): PackStateInfo {
	switch (file.state) {
		case 'done':
			return {
				icon: CheckmarkCircle02Icon,
				label: 'Descargado',
				color: colors.esmeralda,
				text: 'text-esmeralda',
			}
		case 'downloading':
			return {
				icon: CloudDownloadIcon,
				label: `Descargando ${Math.round(file.progress * 100)} %`,
				color: colors.esmeralda,
				text: 'text-esmeralda',
			}
		case 'update':
			return {
				icon: Refresh01Icon,
				label: 'Actualización disponible',
				color: colors.avisoText,
				text: 'text-aviso-text',
			}
		case 'error':
			return {
				icon: Alert02Icon,
				label: 'Error · se reintentará',
				color: colors.error,
				text: 'text-error',
			}
		case 'noSpace':
			return {
				icon: HardDriveIcon,
				label: 'Sin espacio',
				color: colors.error,
				text: 'text-error',
			}
		default:
			return {
				icon: Clock01Icon,
				label: active ? 'En cola' : 'Pendiente',
				color: colors.apagado,
				text: 'text-apagado',
			}
	}
}

// A card's overall state from its files: what needs attention first.
export function cardPackState(
	files: PackFileStatus[],
	active: boolean,
): PackStateInfo {
	const find = (state: PackFileStatus['state']) =>
		files.filter((file) => file.state === state)

	const downloading = find('downloading')[0]

	if (downloading) {
		const done = find('done').length

		return {
			...fileStateInfo(downloading, active),
			label: `Descargando ${done + 1} de ${files.length}`,
		}
	}

	for (const state of ['error', 'noSpace'] as const) {
		const file = find(state)[0]

		if (file) return fileStateInfo(file, active)
	}

	const updates = find('update').length

	if (updates > 0) {
		return {
			...fileStateInfo(find('update')[0], active),
			label: plural(updates, 'actualización', 'actualizaciones'),
		}
	}

	const queued = find('queued')[0]

	if (queued) return fileStateInfo(queued, active)

	return { ...fileStateInfo(files[0], active), label: 'Listo' }
}

// Problems first, then pending, then ready, so nothing needs hunting.
export function cardPackRank(files: PackFileStatus[]) {
	if (
		files.some((file) =>
			['downloading', 'error', 'noSpace'].includes(file.state),
		)
	)
		return 0

	return files.some((file) => file.state !== 'done') ? 1 : 2
}
