import {
	DiscoverCircleIcon,
	VirtualRealityVr01Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { Tabs } from 'expo-router'

export default function TabLayout() {
	return (
		<Tabs>
			<Tabs.Screen
				name='index'
				options={{
					title: 'Explorar',
					tabBarIcon: ({ color, size }) => (
						<HugeiconsIcon
							icon={DiscoverCircleIcon}
							size={size}
							color={color}
						/>
					),
				}}
			/>
			<Tabs.Screen
				name='ar'
				options={{
					title: 'AR',
					tabBarIcon: ({ color, size }) => (
						<HugeiconsIcon
							icon={VirtualRealityVr01Icon}
							size={size}
							color={color}
						/>
					),
				}}
			/>
		</Tabs>
	)
}
