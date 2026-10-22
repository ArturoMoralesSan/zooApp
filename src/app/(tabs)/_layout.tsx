import {
	DiscoverCircleIcon,
	MapIcon,
	UserGroupIcon,
	WalletIcon,
} from '@hugeicons/core-free-icons'

import { HugeiconsIcon } from '@hugeicons/react-native'
import { Tabs } from 'expo-router'
import { Pressable, Text, View } from 'react-native'

import {
	activeTabButtonStyle,
	colors,
	tabBarContainerStyle,
	tabBarStyle,
	tabButtonStyle,
	tabLabelStyle,
} from '@/styles/tab-bar'

export default function TabLayout() {
	return (
		<Tabs
			screenOptions={{
				headerShown: false,
			}}
			tabBar={({ state, descriptors, navigation }) => (
				<View style={tabBarContainerStyle}>
					<View style={tabBarStyle}>
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

								const onLongPress = () => {
									navigation.emit({
										type: 'tabLongPress',
										target: route.key,
									})
								}

								return (
									<Pressable
										key={route.key}
										accessibilityRole='tab'
										accessibilityState={{
											selected: isFocused,
										}}
										accessibilityLabel={options.tabBarAccessibilityLabel}
										onPress={onPress}
										onLongPress={onLongPress}
										style={[tabButtonStyle, isFocused && activeTabButtonStyle]}
									>
										<HugeiconsIcon
											icon={icon}
											size={22}
											color={isFocused ? '#FFFFFF' : colors.textSecondary}
										/>

										<Text style={tabLabelStyle(isFocused)}>
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
