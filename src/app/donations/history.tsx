import { useDonations } from '@/hooks/useDonations'
import { useScrollBottomSpace } from '@/theme/layout'
import { useSessionRedirect } from '@/hooks/useSessionRedirect'

import { HeartAddIcon, HeartIcon } from '@hugeicons/core-free-icons'
import { useRouter } from 'expo-router'
import { useMemo } from 'react'
import { ScrollView, View } from 'react-native'

import { ScreenHeader } from '@/components/ui/TabHeader'
import type { Donation } from '@/types/donations'
import { ScreenBackground } from '@/components/ui/ScreenBackground'
import { DonationCard } from '@/components/donations/DonationCard'
import { DonationStatsRow } from '@/components/donations/DonationStatsRow'
import { QueryView } from '@/components/ui/QueryView'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { isCompleted } from '@/utils/donations'
import { useScrolled } from '@/hooks/useScrolled'
import { TopBar } from '@/components/ui/TopBar'

const NO_DONATIONS: Donation[] = []

export default function DonationHistoryScreen() {
	const { scrolled, pastTitle, onScroll, onTitleLayout } = useScrolled()
	const bottomSpace = useScrollBottomSpace(40)
	const router = useRouter()

	const donationsQuery = useDonations()
	const donations = donationsQuery.data ?? NO_DONATIONS

	useSessionRedirect()

	const sortedDonations = useMemo(() => {
		return [...donations].sort((a, b) => {
			const dateA = a.created_at ? new Date(a.created_at).getTime() : 0

			const dateB = b.created_at ? new Date(b.created_at).getTime() : 0

			return dateB - dateA
		})
	}, [donations])

	const completedDonations = useMemo(
		() => donations.filter(isCompleted).length,
		[donations],
	)

	const totalDonated = useMemo(
		() =>
			donations.reduce((total, donation) => {
				const amount = Number(donation.amount ?? 0)

				return total + (Number.isFinite(amount) ? amount : 0)
			}, 0),
		[donations],
	)

	return (
		<ScreenBackground>
			{/* BARRA SUPERIOR FIJA */}
			<TopBar
				onBack={() => router.back()}
				title='Mis donaciones'
				showTitle={pastTitle}
				scrolled={scrolled}
			/>

			<ScrollView
				onScroll={onScroll}
				scrollEventThrottle={16}
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ paddingBottom: bottomSpace }}
				contentContainerClassName='px-5 pt-2'
			>
				<ScreenHeader
					title='Mis donaciones'
					subtitle='Consulta el historial de tus donaciones.'
					onLayout={onTitleLayout}
				/>

				{/* Estadísticas: zeros only for a real empty history (A-42) */}
				{donationsQuery.data && (
					<DonationStatsRow
						donations={donations}
						completedDonations={completedDonations}
						totalDonated={totalDonated}
					/>
				)}

				<QueryView
					query={donationsQuery}
					loadingMessage='Cargando tus donaciones…'
					errorTitle='No pudimos cargar tus donaciones'
					isEmpty={(list) => list.length === 0}
					empty={{
						icon: HeartIcon,
						title: 'No tienes donaciones',
						message: 'Cuando realices una donación aparecerá aquí.',
						action: {
							title: 'Hacer una donación',
							icon: HeartAddIcon,
							onPress: () => router.push('/donations'),
						},
					}}
				>
					{/* Historial */}
					{() => (
						<View className='w-full'>
							<SectionTitle title='Historial' />

							{sortedDonations.map((donation) => (
								<DonationCard key={donation.id} donation={donation} />
							))}
						</View>
					)}
				</QueryView>

				<View className='h-[30px]' />
			</ScrollView>
		</ScreenBackground>
	)
}
