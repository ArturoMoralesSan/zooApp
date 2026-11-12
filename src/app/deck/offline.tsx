import {
	Clock01Icon,
	CloudDownloadIcon,
	Delete02Icon,
	Download04Icon,
	Refresh01Icon,
} from '@hugeicons/core-free-icons'
import { router } from 'expo-router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { RefreshControl, ScrollView, Text, View } from 'react-native'

import FixedFooter from '@/components/FixedFooter'
import { OfflineCardRow } from '@/components/deck/OfflineCardRow'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { FooterLoadingBar } from '@/components/ui/FooterLoadingBar'
import { Icon } from '@/components/ui/Icon'
import { IconBox } from '@/components/ui/IconBox'
import { Modal } from '@/components/ui/Modal'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { ScreenBackground } from '@/components/ui/ScreenBackground'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { ScreenHeader } from '@/components/ui/TabHeader'
import { TextLink } from '@/components/ui/TextLink'
import Toast from '@/components/ui/Toast'
import { Toggle } from '@/components/ui/Toggle'
import { TopBar } from '@/components/ui/TopBar'
import { useCards } from '@/hooks/useCards'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'
import { usePackStatus } from '@/hooks/usePackStatus'
import { useScrolled } from '@/hooks/useScrolled'
import { useSessionRedirect } from '@/hooks/useSessionRedirect'
import { notifyOffline } from '@/services/offline-notice'
import { getCellularUpdates, setCellularUpdates } from '@/services/pack'
import {
	freePackSpace,
	type PackFileStatus,
	type SyncResult,
	syncPack,
} from '@/services/packSync'
import colors from '@/theme/colors'
import { useFixedFooterSpace } from '@/theme/layout'
import type { OwnedCard } from '@/types/cards'
import { formatTimeAgo } from '@/utils/date'
import { formatBytes } from '@/utils/format'
import {
	cardPackRank,
	getPackSummary,
	type SyncFeedback,
	syncFeedback,
} from '@/utils/offlinePack'

const PRIMARY = colors.esmeralda

type Confirm = 'cellular' | 'free' | null

const OFFLINE_MESSAGE = 'Conéctate a internet para revisar el paquete.'

// Offline pack detail (no A-xx design yet): overall progress, each card
// expandable to its files, and the download, mobile data and free space
// controls. Opened from ZooDeck's "Paquete sin conexión" card.
export default function OfflinePackScreen() {
	const { scrolled, pastTitle, onScroll, onTitleLayout } = useScrolled()
	const footerSpace = useFixedFooterSpace()
	const status = usePackStatus()
	const summary = getPackSummary(status)
	const { data: cards } = useCards()
	const { isOffline, isCellular } = useNetworkStatus()

	const [cellularUpdates, setCellular] = useState(false)
	const [confirm, setConfirm] = useState<Confirm>(null)
	const [freeing, setFreeing] = useState(false)
	const [refreshing, setRefreshing] = useState(false)
	const [feedback, setFeedback] = useState<SyncFeedback | null>(null)
	const hideFeedback = useCallback(() => setFeedback(null), [])
	// Per-card open state the user chose; the rest follow `expandAll` or
	// open by themselves while downloading or failing.
	const [expandAll, setExpandAll] = useState(false)
	const [overrides, setOverrides] = useState<Record<number, boolean>>({})

	useSessionRedirect()

	useEffect(() => {
		void getCellularUpdates().then(setCellular)
	}, [])

	const busy =
		status.activity === 'downloading' || status.activity === 'checking'

	const groups = useMemo(() => {
		const owned = new Map(
			(cards ?? [])
				.filter((card): card is OwnedCard => card.encountered)
				.map((card) => [card.id, card]),
		)
		const byCard = new Map<number, PackFileStatus[]>()

		for (const file of status.files) {
			byCard.set(file.card_id, [...(byCard.get(file.card_id) ?? []), file])
		}

		return [...byCard.entries()]
			.map(([id, files]) => ({ id, files, card: owned.get(id) ?? null }))
			.sort(
				(a, b) =>
					cardPackRank(a.files) - cardPackRank(b.files) ||
					Number(Boolean(b.card)) - Number(Boolean(a.card)) ||
					a.id - b.id,
			)
	}, [cards, status.files])

	const isOpen = (id: number, rank: number) =>
		overrides[id] ?? (expandAll || rank === 0)

	const toggleAll = () => {
		setExpandAll((value) => !value)
		setOverrides({})
	}

	// Offline goes through the app's offline banner (with this screen's
	// message), so two notices never stack in the same spot.
	const showResult = (result: SyncResult) => {
		if (result.kind === 'offline') {
			notifyOffline(OFFLINE_MESSAGE)
		} else {
			setFeedback(syncFeedback(result))
		}
	}

	const startDownload = () => {
		setConfirm(null)
		void syncPack({ userTriggered: true }).then(showResult)
	}

	const handleDownload = () => {
		if (isOffline) {
			showResult({ kind: 'offline' })

			return
		}

		if (isCellular && !cellularUpdates && status.pendingCount > 0) {
			setConfirm('cellular')

			return
		}

		startDownload()
	}

	const handleFree = async () => {
		setFreeing(true)

		try {
			await freePackSpace()
		} finally {
			setFreeing(false)
			setConfirm(null)
		}
	}

	const handleRefresh = async () => {
		setRefreshing(true)

		try {
			await syncPack()
		} finally {
			setRefreshing(false)
		}
	}

	const toggleCellular = (value: boolean) => {
		setCellular(value)
		void setCellularUpdates(value).then(() => {
			if (value) void syncPack()
		})
	}

	const footerTitle =
		status.pendingCount === 0
			? 'Buscar actualizaciones'
			: status.doneCount === 0
				? 'Descargar todo'
				: status.updateCount > 0
					? 'Actualizar ahora'
					: 'Descargar lo que falta'

	return (
		<ScreenBackground>
			<TopBar
				onBack={() => router.back()}
				title='Paquete sin conexión'
				showTitle={pastTitle}
				scrolled={scrolled}
			/>

			<ScrollView
				onScroll={onScroll}
				scrollEventThrottle={16}
				className='flex-1'
				contentContainerClassName='grow px-5 pt-2'
				contentContainerStyle={{ paddingBottom: footerSpace }}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={handleRefresh}
						tintColor={PRIMARY}
						colors={[PRIMARY]}
					/>
				}
			>
				<ScreenHeader
					title='Paquete sin conexión'
					subtitle='Descarga las tarjetas en casa y usa ZooDeck en el zoológico sin gastar datos. Las que no has ganado siguen ocultas.'
					className='mb-6'
					onLayout={onTitleLayout}
				/>

				{/* PROGRESO GENERAL */}
				<Card>
					<View className='flex-row items-center gap-3'>
						<IconBox
							icon={summary.icon}
							tone={
								summary.kind === 'noSpace'
									? 'danger'
									: summary.kind === 'ready'
										? 'accent'
										: 'soft'
							}
						/>

						<View style={{ flex: 1, minWidth: 0 }}>
							<Text className='text-h3 text-tinta'>
								{/* The footer already shows the size to download. */}
								{summary.kind === 'empty'
									? 'Aún no hay nada descargado'
									: summary.text}
							</Text>
							<Text className='text-meta mt-1'>
								{status.doneCount} de {status.totalCount} archivos ·{' '}
								{formatBytes(status.doneBytes)} de{' '}
								{formatBytes(status.totalBytes)}
							</Text>
						</View>
					</View>

					<ProgressBar
						progress={
							status.activity === 'downloading'
								? status.progress
								: status.totalBytes > 0
									? status.doneBytes / status.totalBytes
									: 0
						}
						accessibilityLabel='Paquete descargado'
						className='mt-4'
					/>

					<View className='mt-3 flex-row items-center gap-1.5'>
						<Icon icon={Clock01Icon} size={16} color={colors.apagado} />
						<Text className='text-meta'>
							{status.lastChecked
								? `Última revisión: ${formatTimeAgo(status.lastChecked)}`
								: 'Aún no se ha revisado'}
						</Text>
					</View>
				</Card>

				<Toggle
					label='Usar datos móviles para actualizar'
					description='Si está apagado, las descargas esperan al Wi-Fi.'
					value={cellularUpdates}
					onValueChange={toggleCellular}
					className='mt-4'
				/>

				{/* TARJETAS */}
				{groups.length > 0 && (
					<View className='mt-6'>
						<SectionTitle
							title='Tarjetas'
							subtitle={`${groups.length} tarjetas · ${status.totalCount} archivos`}
							trailing={
								<TextLink
									label={expandAll ? 'Ocultar archivos' : 'Ver archivos'}
									onPress={toggleAll}
								/>
							}
						/>

						<View className='gap-3'>
							{groups.map(({ id, files, card }) => {
								const open = isOpen(id, cardPackRank(files))

								return (
									<OfflineCardRow
										key={id}
										card={card}
										files={files}
										active={status.activity === 'downloading'}
										expanded={open}
										onToggle={() =>
											setOverrides((current) => ({ ...current, [id]: !open }))
										}
									/>
								)
							})}
						</View>
					</View>
				)}

				{status.doneCount > 0 && (
					<Button
						title='Liberar espacio'
						icon={Delete02Icon}
						iconPosition='leading'
						variant='secondary'
						disabled={busy}
						onPress={() => setConfirm('free')}
						className='mt-6'
					/>
				)}
			</ScrollView>

			{status.activity === 'downloading' ? (
				<FooterLoadingBar message={summary.text} />
			) : status.activity === 'checking' ? (
				<FooterLoadingBar message='Revisando el paquete…' />
			) : (
				<FixedFooter
					label={
						status.pendingCount === 0 ? 'Todo descargado' : 'Por descargar'
					}
					description={
						status.pendingCount === 0
							? 'Tus tarjetas están listas para la visita'
							: isCellular && !cellularUpdates
								? 'Estás usando datos móviles'
								: 'Mejor con Wi-Fi'
					}
					amount={formatBytes(
						status.pendingCount === 0 ? status.doneBytes : status.pendingBytes,
					)}
					buttonTitle={footerTitle}
					buttonIcon={
						status.pendingCount === 0
							? Refresh01Icon
							: status.doneCount === 0
								? Download04Icon
								: CloudDownloadIcon
					}
					onButtonPress={handleDownload}
					disabled={busy || (!status.hasManifest && isOffline)}
				/>
			)}

			<Toast
				visible={feedback !== null}
				type={feedback?.type}
				title={feedback?.title}
				message={feedback?.message ?? ''}
				onHide={hideFeedback}
			/>

			{/* Confirm: download on mobile data */}
			<Modal visible={confirm === 'cellular'} onClose={() => setConfirm(null)}>
				<Text className='text-h2 text-center text-tinta'>
					¿Usar datos móviles?
				</Text>
				<Text className='text-body mt-2 text-center text-tinta-2'>
					La descarga usará {formatBytes(status.pendingBytes)} de tus datos. En
					Wi-Fi no gastas datos.
				</Text>
				<Button
					title='Descargar con datos'
					onPress={startDownload}
					className='mt-6'
				/>
				<Button
					title='Esperar al Wi-Fi'
					variant='secondary'
					onPress={() => setConfirm(null)}
					className='mt-3'
				/>
			</Modal>

			{/* Confirm: free space */}
			<Modal
				visible={confirm === 'free'}
				onClose={() => setConfirm(null)}
				dismissible={!freeing}
			>
				<Text className='text-h2 text-center text-tinta'>
					¿Liberar espacio?
				</Text>
				<Text className='text-body mt-2 text-center text-tinta-2'>
					Se borran {formatBytes(status.doneBytes)} del teléfono. Tus tarjetas
					no se pierden, pero sin conexión no podrás verlas hasta descargarlas
					otra vez.
				</Text>
				<Button
					title='Liberar espacio'
					icon={Delete02Icon}
					iconPosition='leading'
					loading={freeing}
					onPress={() => void handleFree()}
					className='mt-6'
				/>
				<Button
					title='Cancelar'
					variant='secondary'
					disabled={freeing}
					onPress={() => setConfirm(null)}
					className='mt-3'
				/>
			</Modal>
		</ScreenBackground>
	)
}
