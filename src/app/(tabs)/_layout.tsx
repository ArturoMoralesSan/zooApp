import {
	DiscoverCircleIcon,
	MapIcon,
	UserGroupIcon,
	WalletIcon,
} from '@hugeicons/core-free-icons'

import { HugeiconsIcon } from '@hugeicons/react-native'
import { Tabs } from 'expo-router'
import { Pressable, Text, View } from 'react-native'

import colors from '@/theme/colors'
import { getTabBarBottomPadding } from '@/theme/layout'

const INACTIVE_COLOR = colors.apagado

export default function TabLayout() {
	return (
		<Tabs
			screenOptions={{
				headerShown: false,
			}}
			tabBar={({ state, descriptors, navigation, insets }) => (
				<View
					className='absolute bottom-0 left-0 right-0 bg-transparent px-3'
					style={{ paddingBottom: getTabBarBottomPadding(insets.bottom) }}
				>
					<View className='min-h-[72px] w-full flex-row items-center rounded-[22px] border-[0.8px] border-card-border bg-blanco p-1.5'>
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
										className={`h-[58px] min-w-0 flex-1 items-center justify-center rounded-2xl ${isFocused ? 'bg-esmeralda' : ''}`}
									>
										<HugeiconsIcon
											icon={icon}
											size={22}
											color={isFocused ? colors.blanco : INACTIVE_COLOR}
										/>

										<Text
											className={`mt-1 text-[12px] ${isFocused ? 'font-sans-bold text-blanco' : 'font-sans-semibold text-apagado'}`}
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
