import { useAuth } from '@/contexts/AuthContext'

import { Coins01Icon, Crown02Icon } from '@hugeicons/core-free-icons'

import { HugeiconsIcon } from '@hugeicons/react-native'

import { Text, View } from 'react-native'

import {
	badgeStyle,
	badgeTextStyle,
	colors,
	headerTitleStyle,
} from '@/styles/explore'

type UserHeaderProps = {
	title: string
}

export default function UserHeader({ title }: UserHeaderProps) {
	const { user } = useAuth()

	const userPoints = user?.points ?? 0
	const userLevel = user?.level?.name ?? 'Bronce'

	return (
		<View className='flex-row items-center justify-between'>
			<Text style={headerTitleStyle}>{title}</Text>

			<View className='flex-row items-center'>
				{/* NIVEL */}
				<View
					className='mr-2 flex-row items-center rounded-full px-3 py-2'
					style={badgeStyle}
				>
					<HugeiconsIcon
						icon={Crown02Icon}
						size={16}
						strokeWidth={1.8}
						color={colors.primary}
					/>

					<Text className='ml-1.5' style={badgeTextStyle}>
						{userLevel}
					</Text>
				</View>

				{/* PUNTOS */}
				<View
					className='flex-row items-center rounded-full px-3 py-2'
					style={badgeStyle}
				>
					<HugeiconsIcon
						icon={Coins01Icon}
						size={16}
						strokeWidth={1.8}
						color={colors.primary}
					/>

					<Text className='ml-1.5' style={badgeTextStyle}>
						{userPoints}
					</Text>
				</View>
			</View>
		</View>
	)
}
