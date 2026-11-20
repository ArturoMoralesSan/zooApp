import { describe, expect, test } from '@jest/globals'

import type {
	PackFileState,
	PackFileStatus,
	PackStatus,
	SyncResult,
} from '@/services/packSync'
import type { SyncFeedback } from '@/utils/offlinePack'
import {
	cardPackRank,
	cardPackState,
	fileStateInfo,
	getPackSummary,
	syncFeedback,
} from '@/utils/offlinePack'

const MB = 1024 * 1024

function status(overrides: Partial<PackStatus> = {}): PackStatus {
	return {
		loaded: true,
		activity: 'idle',
		enabled: true,
		hasManifest: true,
		files: [],
		totalCount: 2,
		totalBytes: 4 * MB,
		doneCount: 1,
		doneBytes: 2 * MB,
		pendingCount: 1,
		pendingBytes: 2 * MB,
		updateCount: 0,
		failedCount: 0,
		progress: 0.5,
		lastChecked: null,
		version: 0,
		...overrides,
	}
}

function file(
	state: PackFileStatus['state'],
	overrides: Partial<PackFileStatus> = {},
): PackFileStatus {
	return {
		id: `f-${state}`,
		card_id: 1,
		kind: 'model',
		bytes: MB,
		state,
		progress: 0,
		...overrides,
	}
}

describe('getPackSummary', () => {
	test.each([
		[
			'downloading',
			status({ activity: 'downloading', progress: 0.424 }),
			'Descargando… 42 %',
			false,
		],
		[
			'noSpace',
			status({ activity: 'noSpace' }),
			'No hay espacio suficiente',
			true,
		],
		[
			'unknown',
			status({ hasManifest: false }),
			'Conéctate para ver el paquete',
			false,
		],
		[
			'unknown',
			status({ hasManifest: false, activity: 'checking' }),
			'Revisando el paquete…',
			false,
		],
		[
			'empty',
			status({ doneCount: 0, totalBytes: 4 * MB }),
			'Descarga tus tarjetas en Wi-Fi · 4.0 MB',
			true,
		],
		[
			'ready',
			status({ doneCount: 2, pendingCount: 0 }),
			'Listo para tu visita',
			false,
		],
		[
			'pending',
			status({ failedCount: 1 }),
			'1 archivo con error · se reintentará',
			true,
		],
		['pending', status({ updateCount: 1 }), '1 actualización · 2.0 MB', true],
		[
			'pending',
			status({ pendingCount: 3, pendingBytes: 6 * MB }),
			'Faltan 3 archivos · 6.0 MB',
			true,
		],
	])('%s: "%s"', (kind, current, text, highlighted) => {
		expect(getPackSummary(current)).toMatchObject({
			kind,
			text,
			highlighted,
		})
	})
})

describe('fileStateInfo', () => {
	test.each<[PackFileState, string, string]>([
		['done', 'Descargado', 'text-esmeralda'],
		['update', 'Actualización disponible', 'text-aviso-text'],
		['error', 'Error · se reintentará', 'text-error'],
		['noSpace', 'Sin espacio', 'text-error'],
	])('%s → "%s"', (state, label, text) => {
		expect(fileStateInfo(file(state), false)).toMatchObject({ label, text })
	})

	test('a file in progress shows its percentage', () => {
		expect(
			fileStateInfo(file('downloading', { progress: 0.5 }), true).label,
		).toBe('Descargando 50 %')
	})

	test('a queued file is "En cola" only while downloads run', () => {
		expect(fileStateInfo(file('queued'), true).label).toBe('En cola')
		expect(fileStateInfo(file('queued'), false).label).toBe('Pendiente')
	})
})

describe('cardPackState', () => {
	test('a download in progress counts the files done', () => {
		const files = [file('done'), file('downloading'), file('queued')]

		expect(cardPackState(files, true).label).toBe('Descargando 2 de 3')
	})

	test('problems come before updates and queued files', () => {
		expect(cardPackState([file('update'), file('error')], true).label).toBe(
			'Error · se reintentará',
		)
		expect(cardPackState([file('queued'), file('noSpace')], true).label).toBe(
			'Sin espacio',
		)
	})

	test('updates are counted', () => {
		expect(cardPackState([file('update'), file('update')], true).label).toBe(
			'2 actualizaciones',
		)
	})

	test('queued, then ready', () => {
		expect(cardPackState([file('done'), file('queued')], false).label).toBe(
			'Pendiente',
		)
		expect(cardPackState([file('done'), file('done')], false).label).toBe(
			'Listo',
		)
	})
})

describe('cardPackRank', () => {
	test('problems first, then pending, then ready', () => {
		expect(cardPackRank([file('done'), file('error')])).toBe(0)
		expect(cardPackRank([file('downloading')])).toBe(0)
		expect(cardPackRank([file('noSpace')])).toBe(0)
		expect(cardPackRank([file('done'), file('queued')])).toBe(1)
		expect(cardPackRank([file('update')])).toBe(1)
		expect(cardPackRank([file('done'), file('done')])).toBe(2)
	})
})

describe('syncFeedback', () => {
	test.each<[SyncResult, SyncFeedback['type'], string]>([
		[{ kind: 'checkFailed' }, 'warning', 'No pudimos revisar el paquete'],
		[{ kind: 'upToDate' }, 'success', 'Todo está al día'],
		[{ kind: 'waiting' }, 'warning', 'Esperando al Wi-Fi'],
		[{ kind: 'noSpace' }, 'error', 'No hay espacio suficiente'],
		[
			{ kind: 'downloaded', count: 2, failed: 1 },
			'warning',
			'Faltaron algunos archivos',
		],
		[{ kind: 'downloaded', count: 2, failed: 0 }, 'success', 'Paquete listo'],
	])('%j → %s "%s"', (result, type, title) => {
		expect(syncFeedback(result)).toMatchObject({ type, title })
	})

	test('says how many files were downloaded', () => {
		expect(
			syncFeedback({ kind: 'downloaded', count: 1, failed: 0 })?.message,
		).toBe('Se descargó 1 archivo.')
		expect(
			syncFeedback({ kind: 'downloaded', count: 3, failed: 0 })?.message,
		).toBe('Se descargaron 3 archivos.')
		expect(
			syncFeedback({ kind: 'downloaded', count: 0, failed: 0 })?.message,
		).toBe('No hay actualizaciones nuevas.')
	})

	// Offline is told by the offline banner; a paused sync says nothing.
	test.each<SyncResult>([{ kind: 'offline' }, { kind: 'stopped' }])(
		'%j → nothing',
		(result) => {
			expect(syncFeedback(result)).toBeNull()
		},
	)
})
