import { Coins01Icon, Crown02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { Text, View } from 'react-native'

import { useAuth } from '@/contexts/AuthContext'
import colors from '@/theme/colors'

type UserHeaderProps = {
	title?: string
	subtitle?: string
	showRewards?: boolean
}

export default function UserHeader({
	title = 'Explorar',
	subtitle,
	showRewards = true,
}: UserHeaderProps) {
	const { user } = useAuth()

	const userPoints = user?.points ?? 0
	const userLevel = user?.level?.name ?? 'Bronce'

	return (
		<View>
			<View className='flex-row items-start justify-between'>
				<View className='mr-2 flex-1'>
					<Text className='text-h1' numberOfLines={1}>
						{title}
					</Text>

					{subtitle ? (
						<Text className='text-subtitle mt-px'>{subtitle}</Text>
					) : null}
				</View>

				{showRewards ? (
					<View className='flex-row items-center gap-2'>
						{/* NIVEL */}
						<View className='flex-row items-center rounded-full border border-card-border bg-niebla px-2.5 py-2'>
							<HugeiconsIcon
								icon={Crown02Icon}
								size={15}
								strokeWidth={1.8}
								color={colors.esmeralda}
							/>

							<Text
								className='ml-1 font-sans-bold text-[12px] text-bosque'
								numberOfLines={1}
							>
								{userLevel}
							</Text>
						</View>

						{/* PUNTOS */}
						<View className='flex-row items-center rounded-full border border-card-border bg-niebla px-2.5 py-2'>
							<HugeiconsIcon
								icon={Coins01Icon}
								size={15}
								strokeWidth={1.8}
								color={colors.esmeralda}
							/>

							<Text
								className='ml-1 font-display-x text-[12px] text-bosque'
								numberOfLines={1}
							>
								{userPoints.toLocaleString('es-MX')}
							</Text>
						</View>
					</View>
				) : null}
			</View>
		</View>
	)
}
