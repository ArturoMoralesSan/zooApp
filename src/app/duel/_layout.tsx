import { Stack } from 'expo-router'

import { DuelProvider } from '@/contexts/DuelContext'

// Scan, play and review share one duel session.
export default function DuelLayout() {
	return (
		<DuelProvider>
			<Stack screenOptions={{ headerShown: false }} />
		</DuelProvider>
	)
}
