import { Coins01Icon, Crown02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { Text, View } from 'react-native'

import { useAuth } from '@/contexts/AuthContext'
import { colors } from '@/styles/explore'

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
			<View
				style={{
					flexDirection: 'row',
					alignItems: 'flex-start',
					justifyContent: 'space-between',
				}}
			>
				<View style={{ marginRight: 8, flex: 1 }}>
					<Text
						style={{
							color: colors.primaryDark,
							fontSize: 25,
							fontWeight: '900',
							lineHeight: 32,
							letterSpacing: -0.8,
						}}
						numberOfLines={1}
					>
						{title}
					</Text>

					{subtitle ? (
						<Text
							style={{
								marginTop: 1,
								color: colors.textSecondary,
								fontSize: 12,
								fontWeight: '600',
								lineHeight: 17,
							}}
						>
							{subtitle}
						</Text>
					) : null}
				</View>

				{showRewards ? (
					<View
						style={{
							flexDirection: 'row',
							alignItems: 'center',
							gap: 8,
						}}
					>
						{/* NIVEL */}
						<View
							style={{
								flexDirection: 'row',
								alignItems: 'center',
								borderRadius: 999,
								paddingHorizontal: 10,
								paddingVertical: 8,
								backgroundColor: colors.cardLight,
								borderWidth: 1,
								borderColor: colors.border,
							}}
						>
							<HugeiconsIcon
								icon={Crown02Icon}
								size={15}
								strokeWidth={1.8}
								color={colors.primary}
							/>

							<Text
								style={{
									marginLeft: 4,
									color: colors.primaryDark,
									fontSize: 11,
									fontWeight: '800',
								}}
								numberOfLines={1}
							>
								{userLevel}
							</Text>
						</View>

						{/* PUNTOS */}
						<View
							style={{
								flexDirection: 'row',
								alignItems: 'center',
								borderRadius: 999,
								paddingHorizontal: 10,
								paddingVertical: 8,
								backgroundColor: colors.cardLight,
								borderWidth: 1,
								borderColor: colors.border,
							}}
						>
							<HugeiconsIcon
								icon={Coins01Icon}
								size={15}
								strokeWidth={1.8}
								color={colors.primary}
							/>

							<Text
								style={{
									marginLeft: 4,
									color: colors.primaryDark,
									fontSize: 11,
									fontWeight: '800',
								}}
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
