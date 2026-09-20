import {
	DiscoverCircleIcon,
	MapIcon,
	UserGroupIcon,
	WalletIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { Tabs } from 'expo-router'
import { Pressable, Text, View } from 'react-native'

const colors = {
	menuBackground: '#E2F1EA',
	primary: '#075C3B',
	textSecondary: '#557067',
	border: '#B8E6D3',
}

export default function TabLayout() {
	return (
		<Tabs
			screenOptions={{
				headerShown: false,
			}}
			tabBar={({ state, descriptors, navigation }) => (
				<View
					style={{
						position: 'absolute',
						bottom: 12,
						left: 0,
						right: 0,
						alignItems: 'center',
					}}
				>
					<View
						style={{
							width: '90%',
							height: 68,
							borderRadius: 30,
							backgroundColor: colors.menuBackground,
							borderWidth: 1,
							borderColor: colors.border,
							flexDirection: 'row',
							alignItems: 'center',
							paddingHorizontal: 6,
							paddingVertical: 6,

							shadowColor: colors.primary,
							shadowOffset: {
								width: 0,
								height: 5,
							},
							shadowOpacity: 0.12,
							shadowRadius: 10,
							elevation: 4,
						}}
					>
						{state.routes
							.filter((route) => route.name !== 'ar')
							.map((route) => {
								const { options } = descriptors[route.key]

								const isFocused = state.routes[state.index]?.key === route.key

								const icons = {
									index: DiscoverCircleIcon,
									mizoo: UserGroupIcon,
									zoodeek: MapIcon,
									panel: WalletIcon,
								} as const

								const icon = icons[route.name as keyof typeof icons]

								if (!icon) {
									return null
								}

								const onPress = () => {
									const event = navigation.emit({
										type: 'tabPress',
										target: route.key,
										canPreventDefault: true,
									})

									if (!isFocused && !event.defaultPrevented) {
										navigation.navigate(route.name)
									}
								}

								return (
									<Pressable
										key={route.key}
										onPress={onPress}
										style={{
											flex: 1,
											height: '100%',
											alignItems: 'center',
											justifyContent: 'center',
											borderRadius: 20,
										}}
									>
										<HugeiconsIcon
											icon={icon}
											size={22}
											color={isFocused ? colors.primary : colors.textSecondary}
										/>

										<Text
											style={{
												marginTop: 3,
												fontSize: 11,
												fontWeight: isFocused ? '700' : '500',
												color: isFocused
													? colors.primary
													: colors.textSecondary,
											}}
										>
											{options.title}
										</Text>
									</Pressable>
								)
							})}
					</View>
				</View>
			)}
		>
			<Tabs.Screen
				name='index'
				options={{
					title: 'Explorar',
				}}
			/>

			<Tabs.Screen
				name='mizoo'
				options={{
					title: 'MiZoo',
				}}
			/>

			<Tabs.Screen
				name='zoodeek'
				options={{
					title: 'ZooDeck',
				}}
			/>

			<Tabs.Screen
				name='panel'
				options={{
					title: 'Panel',
				}}
			/>

			<Tabs.Screen
				name='ar'
				options={{
					href: null,
				}}
			/>
		</Tabs>
	)
}
