import {
	Cards01Icon,
	CloudDownloadIcon,
	Database01Icon,
	Delete02Icon,
	Image01Icon,
} from '@hugeicons/core-free-icons'
import { router } from 'expo-router'
import { useState } from 'react'
import { ScrollView, Text, View } from 'react-native'

import { StorageUsage } from '@/components/settings/StorageUsage'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ListCard } from '@/components/ui/ListCard'
import { ScreenBackground } from '@/components/ui/ScreenBackground'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { ScreenHeader } from '@/components/ui/TabHeader'
import Toast from '@/components/ui/Toast'
import { Toggle } from '@/components/ui/Toggle'
import { TopBar } from '@/components/ui/TopBar'
import { useScrolled } from '@/hooks/useScrolled'
import { useScrollBottomSpace } from '@/theme/layout'
import type { StorageCategory } from '@/types/settings'
import { formatBytes } from '@/utils/format'
import { DRAFT_FREE_BYTES, DRAFT_STORAGE } from '@/utils/settings'

const size = (categories: StorageCategory[], key: StorageCategory['key']) =>
	formatBytes(categories.find((item) => item.key === key)?.bytes ?? 0)

// Everything the app keeps on the phone. Each download keeps its own
// screen (the ZooDeck pack: deck/offline); this one sums them up. Draft:
// placeholder sizes, nothing is saved or deleted.
export default function StorageSettingsScreen() {
	const { scrolled, pastTitle, onScroll, onTitleLayout } = useScrolled()
	const bottomSpace = useScrollBottomSpace(32)

	const [categories, setCategories] = useState(DRAFT_STORAGE)
	const [cellular, setCellular] = useState(false)
	const [cleared, setCleared] = useState(false)

	const cacheBytes = categories.find((item) => item.key === 'cache')?.bytes ?? 0

	const clearCache = () => {
		setCategories((current) =>
			current.map((item) =>
				item.key === 'cache' ? { ...item, bytes: 0 } : item,
			),
		)
		setCleared(true)
	}

	return (
		<ScreenBackground>
			<TopBar
				onBack={() => router.back()}
				title='Almacenamiento'
				showTitle={pastTitle}
				scrolled={scrolled}
			/>

			<ScrollView
				onScroll={onScroll}
				scrollEventThrottle={16}
				className='flex-1'
				contentContainerClassName='px-5 pt-2'
				contentContainerStyle={{ paddingBottom: bottomSpace }}
			>
				<ScreenHeader
					title='Almacenamiento'
					subtitle='Lo que ZooApp guarda en tu teléfono para usarse sin conexión.'
					className='mb-6'
					onLayout={onTitleLayout}
				/>

				<StorageUsage categories={categories} freeBytes={DRAFT_FREE_BYTES} />

				{/* DESCARGAS */}
				<SectionTitle
					title='Sin conexión'
					subtitle='Descárgalo en casa y úsalo en el zoológico sin gastar datos.'
					className='mb-3 mt-6'
				/>
				<View className='gap-3'>
					<ListCard
						icon={Cards01Icon}
						title='Paquete ZooDeck'
						description={`${size(categories, 'cards')} · tus tarjetas ganadas`}
						onPress={() => router.push('/deck/offline')}
					/>
					<ListCard
						icon={CloudDownloadIcon}
						title='Especies y mapa'
						description='Consúltalos en el zoológico sin internet'
						trailing={
							<View>
								<Badge tone='neutral' label='Próximamente' />
							</View>
						}
					/>
					<Toggle
						label='Usar datos móviles para descargar'
						description='Si está apagado, las descargas esperan al Wi-Fi.'
						value={cellular}
						onValueChange={setCellular}
					/>
				</View>

				{/* EN ESTE TELÉFONO */}
				<SectionTitle title='En este teléfono' className='mb-3 mt-6' />
				<View className='gap-3'>
					<ListCard
						icon={Image01Icon}
						title='Fotos y selfies'
						description={`${size(categories, 'photos')} · se guardan solo aquí`}
					/>
					<ListCard
						icon={Database01Icon}
						title='Archivos temporales'
						description={`${formatBytes(cacheBytes)} · se vuelven a crear al usar la app`}
					/>
				</View>

				<Button
					title='Liberar archivos temporales'
					icon={Delete02Icon}
					iconPosition='leading'
					variant='secondary'
					disabled={cacheBytes === 0}
					onPress={clearCache}
					className='mt-4'
				/>

				<Text className='text-meta mt-3 text-center'>
					Tus tarjetas, fotos y descargas no se borran.
				</Text>
			</ScrollView>

			<Toast
				visible={cleared}
				icon={Delete02Icon}
				title='Espacio liberado'
				message='Se borraron los archivos temporales.'
				onHide={() => setCleared(false)}
			/>
		</ScreenBackground>
	)
}
