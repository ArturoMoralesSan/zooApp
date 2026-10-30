import { useDonations } from '@/hooks/useDonations'
import { useScrollBottomSpace } from '@/theme/layout'
import { useSessionRedirect } from '@/hooks/useSessionRedirect'

import { HeartAddIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { useRouter } from 'expo-router'
import { useEffect, useMemo } from 'react'
import {
	ActivityIndicator,
	Alert,
	Pressable,
	ScrollView,
	Text,
	View,
} from 'react-native'

import BackButton from '@/components/ui/BackButton'
import { ScreenHeader } from '@/components/ui/TabHeader'
import type { Donation } from '@/types/donations'
import { ScreenBackground } from '@/components/ui/ScreenBackground'
import { DonationCard } from '@/components/donations/DonationCard'
import { DonationStatsRow } from '@/components/donations/DonationStatsRow'
import { cardShadow, ICON_COLOR } from '@/components/donations/historyStyles'
import { isCompleted } from '@/utils/donations'

const NO_DONATIONS: Donation[] = []

export default function DonationHistoryScreen() {
	const bottomSpace = useScrollBottomSpace(40)
	const router = useRouter()

	const { data, error, isLoading: loading } = useDonations()
	// A failed load shows the empty list, as before.
	const donations = error ? NO_DONATIONS : (data ?? NO_DONATIONS)

	useSessionRedirect()

	useEffect(() => {
		if (!error) return

		console.error('Error cargando donaciones:', error)

		Alert.alert(
			'Mis donaciones',
			error.message || 'No fue posible cargar tus donaciones.',
		)
	}, [error])

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
		<ScreenBackground patternClassName='opacity-[0.15]' withBackground={false}>
			{/* Encabezado */}
			<View className='px-5 pt-2'>
				<View className='mb-3'>
					<BackButton onPress={() => router.back()} position='relative' />
				</View>

				<View className='mb-5'>
					<ScreenHeader
						title='Mis donaciones'
						subtitle='Consulta el historial de tus donaciones.'
					/>
				</View>
			</View>

			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ paddingBottom: bottomSpace }}
				contentContainerClassName='px-5 pt-0'
			>
				{/* Estadísticas */}
				<DonationStatsRow
					donations={donations}
					completedDonations={completedDonations}
					totalDonated={totalDonated}
				/>

				{/* Cargando */}
				{loading ? (
					<View className='items-center justify-center py-[60px]'>
						<ActivityIndicator size='large' color={ICON_COLOR} />
						<Text className='text-body mt-3 text-tinta'>
							Cargando tus donaciones...
						</Text>
					</View>
				) : sortedDonations.length === 0 ? (
					/* Estado vacío */
					<View
						className='w-full items-center rounded-[22px] border border-card-border bg-niebla px-[25px] py-8'
						style={cardShadow}
					>
						<View className='mb-4 h-[62px] w-[62px] items-center justify-center rounded-[18px] border border-card-border bg-hoja'>
							<HugeiconsIcon
								icon={HeartAddIcon}
								size={32}
								strokeWidth={1.8}
								color={ICON_COLOR}
							/>
						</View>

						<Text className='text-h3 text-center text-tinta'>
							No tienes donaciones
						</Text>

						<Text className='text-body mt-[7px] text-center text-tinta'>
							Cuando realices una donación aparecerá aquí.
						</Text>

						<Pressable
							onPress={() => router.push('/donations')}
							className='mt-[18px] min-h-12 w-full items-center justify-center rounded-[14px] bg-esmeralda active:bg-bosque'
						>
							<Text className='text-button text-blanco'>
								Hacer una donación
							</Text>
						</Pressable>
					</View>
				) : (
					/* Historial */
					<View className='w-full'>
						<Text className='text-h2 mb-3 text-tinta'>Historial</Text>

						{sortedDonations.map((donation) => (
							<DonationCard key={donation.id} donation={donation} />
						))}
					</View>
				)}

				<View className='h-[30px]' />
			</ScrollView>
		</ScreenBackground>
	)
}
