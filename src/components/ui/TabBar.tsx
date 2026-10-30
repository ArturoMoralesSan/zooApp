import {
	DiscoverCircleIcon,
	MapIcon,
	UserGroupIcon,
	WalletIcon,
} from '@hugeicons/core-free-icons'
import type { IconSvgElement } from '@hugeicons/react-native'
import type { Tabs } from 'expo-router'
import type { ComponentProps } from 'react'
import { Pressable, Text, View } from 'react-native'

import { FocusRing, useFocusRing } from '@/components/ui/FocusRing'
import { Icon } from '@/components/ui/Icon'
import colors from '@/theme/colors'
import { getTabBarBottomPadding } from '@/theme/layout'

type TabBarProps = Parameters<
	NonNullable<ComponentProps<typeof Tabs>['tabBar']>
>[0]

const icons: Record<string, IconSvgElement> = {
	index: DiscoverCircleIcon,
	mizoo: UserGroupIcon,
	zoodeek: MapIcon,
	panel: WalletIcon,
}

type TabBarItemProps = {
	label: string
	icon: IconSvgElement
	focused: boolean
	accessibilityLabel?: string
	onPress: () => void
	onLongPress: () => void
}

function TabBarItem({
	label,
	icon,
	focused,
	accessibilityLabel,
	onPress,
	onLongPress,
}: TabBarItemProps) {
	const ring = useFocusRing()

	return (
		<View className='h-full min-w-0 flex-1'>
			<Pressable
				accessibilityRole='tab'
				accessibilityState={{ selected: focused }}
				accessibilityLabel={accessibilityLabel ?? label}
				onPress={onPress}
				onLongPress={onLongPress}
				{...ring.focusProps}
				className={`h-full items-center justify-center rounded-2xl ${focused ? 'bg-esmeralda' : 'active:bg-niebla'} ${ring.focused ? 'border-2 border-bosque' : ''}`}
			>
				<Icon icon={icon} color={focused ? colors.blanco : colors.tinta2} />

				<Text
					className={`mt-1 text-[12px] ${focused ? 'font-sans-bold text-blanco' : 'font-sans-semibold text-tinta-2'}`}
				>
					{label}
				</Text>
			</Pressable>

			<FocusRing visible={ring.focused} radiusClassName='rounded-[19px]' />
		</View>
	)
}

// Floating bar: 72px tall, 16px from the screen edges (and from the system
// navigation bar), radius 24, active tab on Esmeralda.
export function TabBar({
	state,
	descriptors,
	navigation,
	insets,
}: TabBarProps) {
	return (
		<View
			className='absolute bottom-0 left-0 right-0 px-4'
			style={{ paddingBottom: getTabBarBottomPadding(insets.bottom) }}
		>
			<View className='h-[72px] w-full flex-row items-center gap-1 rounded-3xl border-1.5 border-card-border bg-blanco p-1.5'>
				{state.routes.map((route) => {
					const icon = icons[route.name]

					if (!icon) {
						return null
					}

					const { options } = descriptors[route.key]
					const focused = state.routes[state.index]?.key === route.key

					return (
						<TabBarItem
							key={route.key}
							label={options.title ?? route.name}
							icon={icon}
							focused={focused}
							accessibilityLabel={options.tabBarAccessibilityLabel}
							onPress={() => {
								const event = navigation.emit({
									type: 'tabPress',
									target: route.key,
									canPreventDefault: true,
								})

								if (!focused && !event.defaultPrevented) {
									navigation.navigate(route.name)
								}
							}}
							onLongPress={() =>
								navigation.emit({ type: 'tabLongPress', target: route.key })
							}
						/>
					)
				})}
			</View>
		</View>
	)
}
