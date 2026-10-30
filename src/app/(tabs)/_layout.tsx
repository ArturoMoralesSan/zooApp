import { Tabs } from 'expo-router'

import { TabBar } from '@/components/ui/TabBar'

export default function TabLayout() {
	return (
		<Tabs
			screenOptions={{
				headerShown: false,
			}}
			tabBar={(props) => <TabBar {...props} />}
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
