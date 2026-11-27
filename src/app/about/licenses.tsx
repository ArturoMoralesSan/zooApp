import { LicenseIcon, SourceCodeIcon } from '@hugeicons/core-free-icons'
import { router } from 'expo-router'
import { useState } from 'react'
import { ScrollView, Text, View } from 'react-native'

import { LicenseSheet } from '@/components/about/LicenseSheet'
import { EmptyState } from '@/components/ui/EmptyState'
import { ListCard } from '@/components/ui/ListCard'
import { QueryView } from '@/components/ui/QueryView'
import { ScreenBackground } from '@/components/ui/ScreenBackground'
import { SegmentedTabs } from '@/components/ui/SegmentedTabs'
import { ScreenHeader } from '@/components/ui/TabHeader'
import { TopBar } from '@/components/ui/TopBar'
import { useCreditCardName, useCredits } from '@/hooks/useCredits'
import { useScrolled } from '@/hooks/useScrolled'
import { useScrollBottomSpace } from '@/theme/layout'
import { groupByLicense, type LicenseGroup } from '@/utils/credits'

type Tab = 'content' | 'software'

// The licences behind the app: the content's (from the same credits
// response, grouped by licence) and, later, the open-source software's.
export default function LicensesScreen() {
	const { scrolled, pastTitle, onScroll, onTitleLayout } = useScrolled()
	const bottomSpace = useScrollBottomSpace(32)
	const credits = useCredits()
	const cardName = useCreditCardName()
	const [tab, setTab] = useState<Tab>('content')
	const [open, setOpen] = useState<LicenseGroup | null>(null)

	return (
		<ScreenBackground>
			<TopBar
				onBack={() => router.back()}
				title='Licencias'
				showTitle={pastTitle}
				scrolled={scrolled}
			/>

			<ScrollView
				onScroll={onScroll}
				scrollEventThrottle={16}
				className='flex-1'
				contentContainerClassName='grow px-5 pt-2'
				contentContainerStyle={{ paddingBottom: bottomSpace }}
			>
				<ScreenHeader
					title='Licencias'
					subtitle='Las condiciones con las que ZooApp usa el trabajo de otras personas.'
					className='mb-4'
					onLayout={onTitleLayout}
				/>

				<SegmentedTabs
					tabs={[
						{ key: 'content', label: 'Contenido' },
						{ key: 'software', label: 'Software' },
					]}
					value={tab}
					onChange={setTab}
					className='mb-4'
				/>

				{tab === 'content' ? (
					<QueryView
						query={credits}
						loadingMessage='Cargando licencias…'
						errorTitle='No pudimos cargar las licencias'
						isEmpty={(data) => data.length === 0}
						empty={{
							icon: LicenseIcon,
							title: 'Aún no hay licencias que mostrar',
						}}
					>
						{(data) => (
							<View className='gap-3'>
								<Text className='text-meta'>
									Toca una licencia para ver qué permite y qué obras la usan.
								</Text>

								{groupByLicense(data, cardName).map((group) => (
									<ListCard
										key={group.key}
										icon={LicenseIcon}
										title={group.license.short_name}
										description={`${group.license.name} · ${
											group.uses.length === 1
												? '1 obra'
												: `${group.uses.length} obras`
										}`}
										onPress={() => setOpen(group)}
									/>
								))}
							</View>
						)}
					</QueryView>
				) : (
					<EmptyState
						icon={SourceCodeIcon}
						title='Próximamente'
						message='Aquí verás las licencias de las librerías de código abierto que usa la app.'
					/>
				)}
			</ScrollView>

			<LicenseSheet group={open} onClose={() => setOpen(null)} />
		</ScreenBackground>
	)
}
