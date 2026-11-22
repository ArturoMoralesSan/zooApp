import { Album02Icon, LegalDocument01Icon } from '@hugeicons/core-free-icons'
import Constants from 'expo-constants'
import { router } from 'expo-router'
import { Fragment } from 'react'
import { Image, ScrollView, Text, View } from 'react-native'

import { Card } from '@/components/ui/Card'
import { Divider } from '@/components/ui/Divider'
import { ListCard } from '@/components/ui/ListCard'
import { ScreenBackground } from '@/components/ui/ScreenBackground'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { TopBar } from '@/components/ui/TopBar'
import { useScrolled } from '@/hooks/useScrolled'
import { useScrollBottomSpace } from '@/theme/layout'
import { TEAM } from '@/utils/about'

// About the app: who made it, and the way to the content credits and the
// licences.
export default function AboutScreen() {
	const { scrolled, pastTitle, onScroll, onTitleLayout } = useScrolled()
	const bottomSpace = useScrollBottomSpace(32)
	const version = Constants.expoConfig?.version

	return (
		<ScreenBackground>
			<TopBar
				onBack={() => router.back()}
				title='Acerca de ZooApp'
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
				<View className='mb-6 items-center' onLayout={onTitleLayout}>
					{/* The logo is white (made for the login's photo): on a tile here. */}
					<View className='h-24 w-24 items-center justify-center rounded-3xl bg-esmeralda'>
						<Image
							source={require('../../../assets/images/zooapp-logo.png')}
							resizeMode='contain'
							accessibilityLabel='Logo de ZooApp'
							className='h-14 w-16'
						/>
					</View>
					<Text className='text-h1 mt-3 text-center' accessibilityRole='header'>
						ZooApp
					</Text>
					<Text className='text-meta mt-1 text-center'>
						{version ? `Versión ${version} · ` : ''}Zoológico Sahuatoba
					</Text>
					<Text className='text-body mt-3 text-center text-tinta-2'>
						Recorre el zoológico, conoce a sus especies y colecciona sus
						tarjetas en ZooDeck.
					</Text>
				</View>

				{/* EQUIPO */}
				<SectionTitle title='Equipo' subtitle='Quienes hicieron ZooApp.' />
				<Card>
					{TEAM.map((member, index) => (
						<Fragment key={`${member.role}-${index}`}>
							{index > 0 && <Divider />}
							<Text className='text-h3 text-tinta'>{member.name}</Text>
							<Text className='text-meta mt-1'>{member.role}</Text>
						</Fragment>
					))}
				</Card>

				{/* CRÉDITOS */}
				<SectionTitle title='Créditos y licencias' className='mb-3 mt-6' />
				<View className='gap-3'>
					<ListCard
						icon={Album02Icon}
						title='Créditos del contenido'
						description='Quién hizo las imágenes y modelos 3D de las tarjetas'
						onPress={() => router.push('/about/credits')}
					/>
					<ListCard
						icon={LegalDocument01Icon}
						title='Licencias'
						description='Bajo qué licencias se usa cada obra'
						onPress={() => router.push('/about/licenses')}
					/>
				</View>

				<Text className='text-meta mt-6 text-center'>
					© {new Date().getFullYear()} Zoológico Sahuatoba
				</Text>
			</ScrollView>
		</ScreenBackground>
	)
}
