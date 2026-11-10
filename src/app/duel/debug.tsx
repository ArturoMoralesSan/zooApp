import { Redirect, router } from 'expo-router'
import { useEffect } from 'react'
import { ActivityIndicator, View } from 'react-native'

import { useDuel } from '@/contexts/DuelContext'
import colors from '@/theme/colors'
import {
	createDebugDuel,
	DEBUG_DUEL_CODE,
	ZOODECK_QUIZ_DEBUG,
} from '@/utils/zoodeckDebug'

// Debug duel entry (EXPO_PUBLIC_ZOODECK_QUIZ_DEBUG=1): starts the fake duel
// in place of a scan and opens the real play screen.
export default function DebugDuelScreen() {
	const { begin } = useDuel()

	useEffect(() => {
		if (!ZOODECK_QUIZ_DEBUG) return

		begin(DEBUG_DUEL_CODE, createDebugDuel())
		router.replace('/duel/play')
	}, [begin])

	if (!ZOODECK_QUIZ_DEBUG) return <Redirect href='/' />

	return (
		<View className='flex-1 items-center justify-center bg-tinta'>
			<ActivityIndicator size='large' color={colors.lima} />
		</View>
	)
}
