import { Download04Icon, Share08Icon } from '@hugeicons/core-free-icons'
import { Image } from 'expo-image'
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import { BackHandler, ScrollView, Text, View } from 'react-native'

import { Button } from '@/components/ui/Button'
import { ScreenBackground } from '@/components/ui/ScreenBackground'
import Toast, { type ToastType } from '@/components/ui/Toast'
import { TopBar } from '@/components/ui/TopBar'
import { useScrolled } from '@/hooks/useScrolled'
import { useSessionRedirect } from '@/hooks/useSessionRedirect'
import {
	clearPhotos,
	PhotoPermissionError,
	savePhoto,
	sharePhoto,
} from '@/services/photo'
import { useScrollBottomSpace } from '@/theme/layout'

type Feedback = { type: ToastType; title: string; message: string }

// "Comparte tu foto" (A-32): the framed photo, to share through the phone's
// share menu or save to the gallery. Back returns to the camera it came
// from (`camera`: the selfie or AR). Leaving deletes the photo files.
export default function PhotoScreen() {
	const { uri, id, mode, camera, from } = useLocalSearchParams<{
		uri: string
		id: string
		mode?: string
		camera?: string
		from?: string
	}>()
	const { scrolled, onScroll } = useScrolled(0)
	const bottomSpace = useScrollBottomSpace(24)
	const [saving, setSaving] = useState(false)
	const [saved, setSaved] = useState(false)
	const [feedback, setFeedback] = useState<Feedback | null>(null)
	// The framed photo's shape, read from the image (it depends on the
	// screen it was captured on).
	const [aspect, setAspect] = useState(0.7)

	useSessionRedirect()

	// The photos live in the cache only while this flow lasts.
	useEffect(() => () => clearPhotos(), [])

	const modeParam = mode === 'card' ? 'card' : 'model'
	const goBack = useCallback(() => {
		router.replace(
			camera === 'ar'
				? `/deck/ar/${id}?mode=${modeParam}`
				: `/deck/selfie/${id}?mode=${modeParam}&from=${from === 'ar' ? 'ar' : 'card'}`,
		)
	}, [camera, id, modeParam, from])

	useFocusEffect(
		useCallback(() => {
			const subscription = BackHandler.addEventListener(
				'hardwareBackPress',
				() => {
					goBack()
					return true
				},
			)

			return () => subscription.remove()
		}, [goBack]),
	)

	const save = async () => {
		setSaving(true)

		try {
			await savePhoto(uri)
			setSaved(true)
			setFeedback({
				type: 'success',
				title: 'Foto guardada',
				message: 'La encuentras en la galería de tu teléfono.',
			})
		} catch (error) {
			setFeedback({
				type: 'error',
				title: 'No se pudo guardar',
				message:
					error instanceof PhotoPermissionError
						? 'Permite que ZooApp guarde fotos en los ajustes del teléfono e inténtalo de nuevo.'
						: 'Inténtalo de nuevo en un momento.',
			})
		} finally {
			setSaving(false)
		}
	}

	const share = async () => {
		try {
			await sharePhoto(uri)
		} catch {
			setFeedback({
				type: 'error',
				title: 'No se pudo compartir',
				message:
					'Inténtalo de nuevo, o guárdala en la galería y compártela desde ahí.',
			})
		}
	}

	return (
		<ScreenBackground>
			<TopBar
				onBack={goBack}
				title='Comparte tu foto'
				showTitle
				scrolled={scrolled}
			/>

			<ScrollView
				onScroll={onScroll}
				scrollEventThrottle={16}
				showsVerticalScrollIndicator={false}
				contentContainerClassName='px-5 pt-2'
				contentContainerStyle={{ paddingBottom: bottomSpace }}
			>
				{/* The captured frame (PhotoFrame), shown as the image itself. */}
				<View className='overflow-hidden rounded-2xl border-1.5 border-card-border'>
					<Image
						source={{ uri }}
						contentFit='contain'
						accessibilityLabel='Tu foto con el marco del zoológico'
						onLoad={({ source }) => {
							if (source.height > 0) setAspect(source.width / source.height)
						}}
						style={{ width: '100%', aspectRatio: aspect }}
					/>
				</View>

				<Button
					title='Compartir'
					variant='secondary'
					icon={Share08Icon}
					iconPosition='leading'
					onPress={() => void share()}
					className='mt-6'
				/>
				<Text className='text-meta mt-2 text-center'>
					Instagram, WhatsApp o cualquier app de tu teléfono.
				</Text>

				<Button
					title={saved ? 'Guardada en tu galería' : 'Guardar en galería'}
					icon={Download04Icon}
					iconPosition='leading'
					onPress={() => void save()}
					loading={saving}
					disabled={saved}
					className='mt-6'
				/>
			</ScrollView>

			<Toast
				visible={feedback !== null}
				type={feedback?.type}
				title={feedback?.title}
				message={feedback?.message ?? ''}
				onHide={() => setFeedback(null)}
			/>
		</ScreenBackground>
	)
}
