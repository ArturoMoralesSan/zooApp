import { router } from 'expo-router'
import * as Device from 'expo-device'
import { useState } from 'react'
import { ScrollView, Text, View } from 'react-native'

import { GraphicsLoadFooter } from '@/components/settings/GraphicsLoadFooter'
import { SettingOptionCard } from '@/components/settings/SettingOptionCard'
import { ScreenBackground } from '@/components/ui/ScreenBackground'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { ScreenHeader } from '@/components/ui/TabHeader'
import { Toggle } from '@/components/ui/Toggle'
import { TopBar } from '@/components/ui/TopBar'
import { useGraphicsQuality } from '@/hooks/useGraphicsQuality'
import { useScrolled } from '@/hooks/useScrolled'
import type { GraphicsEffects } from '@/types/settings'
import {
	GRAPHICS_OPTIONS,
	graphicsLoad,
	resolveGraphics,
} from '@/utils/settings'

const DEVICE = {
	totalMemory: Device.totalMemory,
	yearClass: Device.deviceYearClass,
}

// "Calidad gráfica": the level on top, and below it every effect it turns
// on (Automática shows what this phone gets). A level fills the switches;
// touching a switch makes it Personalizada, which keeps the user's mix.
// Saved per device; AR and the 360° view read it when they open.
export default function GraphicsSettingsScreen() {
	const { scrolled, pastTitle, onScroll, onTitleLayout } = useScrolled()
	// Until the pinned footer is measured, room for its usual height.
	const [footerHeight, setFooterHeight] = useState(160)
	// Null while read: the levels and switches show once known.
	const { quality, custom, setQuality, setCustom } = useGraphicsQuality()
	const effects =
		quality && custom ? resolveGraphics(quality, custom, DEVICE) : null

	const set = (key: keyof GraphicsEffects) => (value: boolean) => {
		if (effects) setCustom({ ...effects, [key]: value })
	}

	return (
		<ScreenBackground>
			<TopBar
				onBack={() => router.back()}
				title='Calidad gráfica'
				showTitle={pastTitle}
				scrolled={scrolled}
			/>

			<ScrollView
				onScroll={onScroll}
				scrollEventThrottle={16}
				className='flex-1'
				contentContainerClassName='px-5 pt-2'
				contentContainerStyle={{ paddingBottom: footerHeight + 24 }}
			>
				<ScreenHeader
					title='Calidad gráfica'
					subtitle='Cómo se ven los animales en AR y en la vista 360°. Baja la calidad si tu teléfono va lento o se calienta.'
					className='mb-6'
					onLayout={onTitleLayout}
				/>

				{effects && (
					<>
						<View accessibilityRole='radiogroup' className='gap-3'>
							{GRAPHICS_OPTIONS.map((option) => (
								<SettingOptionCard
									key={option.value}
									option={option}
									selected={option.value === quality}
									onPress={() => setQuality(option.value)}
								/>
							))}
						</View>

						{/* AR */}
						<SectionTitle title='Realidad aumentada' className='mb-3 mt-6' />
						<View className='gap-3'>
							<Toggle
								label='Luz natural'
								description='Luz de sol que da volumen al animal. Apagada se ve plano.'
								value={effects.arDaylight}
								onValueChange={set('arDaylight')}
							/>
							<Toggle
								label='Sombra en el suelo'
								description='El animal proyecta su sombra sobre el piso real.'
								value={effects.arLiveShadow}
								onValueChange={set('arLiveShadow')}
							/>
							<Toggle
								label='Sombra bajo las patas'
								description='Una sombra suave que lo apoya en el suelo. Casi no gasta.'
								value={effects.arBlob}
								onValueChange={set('arBlob')}
							/>
						</View>

						{/* 360° */}
						<SectionTitle title='Vista 360°' className='mb-3 mt-6' />
						<View className='gap-3'>
							<Toggle
								label='Escenario de la sabana'
								description='Plantas, rocas y cielo. Apagado, el animal aparece sobre un suelo simple y carga más rápido.'
								value={effects.view360Scenario}
								onValueChange={set('view360Scenario')}
							/>
							<Toggle
								label='Sombra en el suelo'
								description='La sombra del animal en tiempo real.'
								value={effects.view360LiveShadow}
								onValueChange={set('view360LiveShadow')}
							/>
						</View>

						<Text className='text-meta mt-5'>
							Los cambios se aplican la próxima vez que abras la cámara AR o la
							vista 360°. El selfie no cambia.
						</Text>
					</>
				)}
			</ScrollView>

			{effects && (
				<GraphicsLoadFooter
					load={graphicsLoad(effects)}
					onLayout={(event) => setFooterHeight(event.nativeEvent.layout.height)}
				/>
			)}
		</ScreenBackground>
	)
}
