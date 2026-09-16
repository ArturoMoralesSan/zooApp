import {
	DiscoverCircleIcon,
	MapIcon,
	UserGroupIcon,
	WalletIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { Tabs } from 'expo-router'
import { Pressable, Text, View } from 'react-native'

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
							borderRadius: 22,
							backgroundColor: '#ffffff',
							flexDirection: 'row',
							alignItems: 'center',
							paddingHorizontal: 6,
							paddingVertical: 6,
							shadowColor: '#000',
							shadowOffset: {
								width: 0,
								height: 4,
							},
							shadowOpacity: 0.12,
							shadowRadius: 10,
							elevation: 8,
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
											borderRadius: 16,
										}}
									>
										<HugeiconsIcon
											icon={icon}
											size={23}
											color={isFocused ? '#047857' : '#9ca3af'}
										/>

										<Text
											style={{
												marginTop: 3,
												fontSize: 11,
												fontWeight: isFocused ? '700' : '500',
												color: isFocused ? '#047857' : '#6b7280',
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
					title: 'ZooDeek',
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
