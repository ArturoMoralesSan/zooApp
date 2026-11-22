import {
	DashboardSpeed01Icon,
	HardDriveIcon,
	LanguageSquareIcon,
	PaintBoardIcon,
	VrGlassesIcon,
} from '@hugeicons/core-free-icons'
import { router } from 'expo-router'
import { useState } from 'react'
import { ScrollView, View } from 'react-native'

import { SettingChoiceSheet } from '@/components/settings/SettingChoiceSheet'
import { Badge } from '@/components/ui/Badge'
import { ListCard } from '@/components/ui/ListCard'
import { Notice } from '@/components/ui/Notice'
import { ScreenBackground } from '@/components/ui/ScreenBackground'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { ScreenHeader } from '@/components/ui/TabHeader'
import { TopBar } from '@/components/ui/TopBar'
import { useArAvailability } from '@/hooks/useArAvailability'
import { useScrolled } from '@/hooks/useScrolled'
import { useScrollBottomSpace } from '@/theme/layout'
import type {
	AppLanguage,
	ArPlacement,
	GraphicsQuality,
	ThemeMode,
} from '@/types/settings'
import { formatBytes } from '@/utils/format'
import {
	AR_PLACEMENT_OPTIONS,
	DRAFT_STORAGE,
	GRAPHICS_OPTIONS,
	LANGUAGE_OPTIONS,
	optionLabel,
	THEME_OPTIONS,
} from '@/utils/settings'

type Sheet = 'language' | 'theme' | 'placement' | 'graphics' | null

// App preferences. Draft: the choices live only while the screen is open
// and don't change the app yet.
export default function SettingsScreen() {
	const { scrolled, pastTitle, onScroll, onTitleLayout } = useScrolled()
	const bottomSpace = useScrollBottomSpace(32)
	// The camera isn't needed just to know whether AR exists.
	const availability = useArAvailability({ camera: false })
	const noAr = availability === 'unsupported'

	const [sheet, setSheet] = useState<Sheet>(null)
	const [language, setLanguage] = useState<AppLanguage>('es')
	const [theme, setTheme] = useState<ThemeMode>('light')
	const [placement, setPlacement] = useState<ArPlacement>('auto')
	const [graphics, setGraphics] = useState<GraphicsQuality>('auto')

	const used = DRAFT_STORAGE.reduce((sum, item) => sum + item.bytes, 0)
	const closeSheet = () => setSheet(null)
	// Badge is self-start; the wrapper centres it with the chevron.
	const soon = (
		<View>
			<Badge tone='neutral' label='Próximamente' />
		</View>
	)

	return (
		<ScreenBackground>
			<TopBar
				onBack={() => router.back()}
				title='Configuración'
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
					title='Configuración'
					subtitle='Preferencias de la aplicación en este teléfono.'
					className='mb-6'
					onLayout={onTitleLayout}
				/>

				{/* GENERAL */}
				<SectionTitle title='General' />
				<View className='gap-3'>
					<ListCard
						icon={LanguageSquareIcon}
						title='Idioma'
						description={optionLabel(LANGUAGE_OPTIONS, language)}
						trailing={soon}
						onPress={() => setSheet('language')}
					/>
					<ListCard
						icon={PaintBoardIcon}
						title='Apariencia'
						description={optionLabel(THEME_OPTIONS, theme)}
						trailing={soon}
						onPress={() => setSheet('theme')}
					/>
				</View>

				{/* AR Y 3D */}
				<SectionTitle title='Realidad aumentada y 3D' className='mb-3 mt-6' />
				{noAr && (
					<Notice
						tone='warning'
						title='Tu teléfono no es compatible con AR'
						message='Verás a los animales en la vista 360°. La calidad gráfica también se aplica ahí.'
						className='mb-3'
					/>
				)}
				<View className='gap-3'>
					<ListCard
						icon={VrGlassesIcon}
						title='Colocación del animal'
						description={
							noAr
								? 'No disponible en este teléfono'
								: optionLabel(AR_PLACEMENT_OPTIONS, placement)
						}
						onPress={noAr ? undefined : () => setSheet('placement')}
					/>
					<ListCard
						icon={DashboardSpeed01Icon}
						title='Calidad gráfica'
						description={optionLabel(GRAPHICS_OPTIONS, graphics)}
						onPress={() => setSheet('graphics')}
					/>
				</View>

				{/* ALMACENAMIENTO */}
				<SectionTitle title='Almacenamiento' className='mb-3 mt-6' />
				<ListCard
					icon={HardDriveIcon}
					title='Espacio y descargas'
					description={`${formatBytes(used)} en uso`}
					onPress={() => router.push('/settings/storage')}
				/>
			</ScrollView>

			<SettingChoiceSheet
				visible={sheet === 'language'}
				title='Idioma'
				description='Pronto podrás usar la app en inglés.'
				options={LANGUAGE_OPTIONS}
				value={language}
				onChange={setLanguage}
				onClose={closeSheet}
			/>
			<SettingChoiceSheet
				visible={sheet === 'theme'}
				title='Apariencia'
				description='El tema oscuro llegará pronto.'
				options={THEME_OPTIONS}
				value={theme}
				onChange={setTheme}
				onClose={closeSheet}
			/>
			<SettingChoiceSheet
				visible={sheet === 'placement'}
				title='Colocación del animal'
				description='Cómo aparece el animal al abrir la cámara en AR.'
				options={AR_PLACEMENT_OPTIONS}
				value={placement}
				onChange={setPlacement}
				onClose={closeSheet}
			/>
			<SettingChoiceSheet
				visible={sheet === 'graphics'}
				title='Calidad gráfica'
				description='Para AR, la vista 360° y el modelo 3D.'
				options={GRAPHICS_OPTIONS}
				value={graphics}
				onChange={setGraphics}
				onClose={closeSheet}
			/>
		</ScreenBackground>
	)
}
