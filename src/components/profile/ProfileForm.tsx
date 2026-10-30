import Toast, { type ToastType } from '@/components/ui/Toast'
import type { FormErrors } from '@/types/profile'
import { PersonalDataSection } from '@/components/profile/PersonalDataSection'
import { ProfileProgress } from '@/components/profile/ProfileProgress'
import { ProfileHeader } from '@/components/profile/ProfileHeader'
import { ApiValidationError } from '@/services/api'
import { useDataRefresh } from '@/hooks/useDataRefresh'
import { redirectIfSignedOut } from '@/hooks/useSessionRedirect'
import { type User } from '@/services/auth'
import * as FileSystem from 'expo-file-system'
import * as ImagePicker from 'expo-image-picker'
import { useCallback, useState } from 'react'
import { Alert, Animated, ImageBackground } from 'react-native'
import { updateAvatar, updateProfile } from '@/services/profile'
import {
	formatDateForApi,
	formatDateForApp,
	formatDateForDisplay,
} from '@/utils/date'
import { getAvatarUrl } from '@/utils/profile'
import { useScrollBottomSpace } from '@/theme/layout'
import { KeyboardScrollView } from '@/components/ui/KeyboardScrollView'

type ToastState = {
	visible: boolean
	title?: string
	message: string
	type: ToastType
}

type ProfileFormProps = {
	initialUser: User | null
	loadError: Error | undefined
}

// Keyed by user id in ProfileScreen, so the form state starts from the
// loaded profile without copying it in an effect.
export function ProfileForm({ initialUser, loadError }: ProfileFormProps) {
	const bottomSpace = useScrollBottomSpace(0)
	const { refreshProfile } = useDataRefresh()

	const [saving, setSaving] = useState(false)
	const [uploadingAvatar, setUploadingAvatar] = useState(false)

	const [user, setUser] = useState<User | null>(initialUser)

	const [name, setName] = useState(initialUser?.name || '')
	const [email, setEmail] = useState(initialUser?.email || '')
	const [phone, setPhone] = useState(initialUser?.profile?.phone || '')
	const [birthDate, setBirthDate] = useState(
		formatDateForApp(initialUser?.profile?.birth_date),
	)
	const [city, setCity] = useState(initialUser?.profile?.city || '')
	const [country, setCountry] = useState(initialUser?.profile?.country || '')

	const [showDatePicker, setShowDatePicker] = useState(false)
	const [errors, setErrors] = useState<FormErrors>({})

	// A failed load still opens the form, with the error in the toast.
	const [toast, setToast] = useState<ToastState>(() =>
		loadError
			? {
					visible: true,
					title: 'No se pudo cargar el perfil',
					message: loadError.message || 'Intenta de nuevo más tarde.',
					type: 'error',
				}
			: {
					visible: false,
					message: '',
					type: 'success',
				},
	)

	const [scrollY] = useState(() => new Animated.Value(0))

	const showToast = useCallback(
		(message: string, type: ToastType = 'success', title?: string) => {
			setToast({
				visible: true,
				title,
				message,
				type,
			})
		},
		[],
	)

	const clearFieldError = (field: keyof FormErrors) => {
		setErrors((current) => ({
			...current,
			[field]: undefined,
		}))
	}

	const handleDateChange = (_event: unknown, selectedDate?: Date) => {
		setShowDatePicker(false)

		if (!selectedDate) return

		setBirthDate(formatDateForDisplay(selectedDate))
		clearFieldError('birth_date')
	}

	const handleSave = async () => {
		const newErrors: FormErrors = {}

		if (!name.trim()) {
			newErrors.name = 'El nombre es obligatorio.'
		}

		if (!email.trim()) {
			newErrors.email = 'El correo es obligatorio.'
		}

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors)
			showToast('Revisa los campos marcados.', 'warning')
			return
		}

		try {
			setSaving(true)
			setErrors({})

			if (await redirectIfSignedOut()) return

			const response = await updateProfile({
				name: name.trim(),
				email: email.trim(),
				phone: phone.trim() || null,
				birth_date: formatDateForApi(birthDate),
				city: city.trim() || null,
				country: country.trim() || null,
			})

			setUser(response.user)
			setName(response.user.name || '')
			setEmail(response.user.email || '')
			setPhone(response.user.profile?.phone || '')
			setBirthDate(formatDateForApp(response.user.profile?.birth_date))
			setCity(response.user.profile?.city || '')
			setCountry(response.user.profile?.country || '')

			void refreshProfile(response.user)

			showToast(
				response.message || 'Perfil actualizado correctamente.',
				'success',
				'Cambios guardados',
			)
		} catch (error) {
			if (error instanceof ApiValidationError) {
				const validationErrors: FormErrors = {}

				Object.entries(error.errors).forEach(([field, messages]) => {
					if (
						[
							'name',
							'email',
							'phone',
							'birth_date',
							'city',
							'country',
						].includes(field)
					) {
						validationErrors[field as keyof FormErrors] = messages[0]
					}
				})

				setErrors(validationErrors)
				showToast(error.message || 'Revisa los datos ingresados.', 'warning')
				return
			}

			showToast(
				error instanceof Error
					? error.message
					: 'No fue posible actualizar el perfil.',
				'error',
			)
		} finally {
			setSaving(false)
		}
	}

	const uploadAvatar = async (asset: ImagePicker.ImagePickerAsset) => {
		try {
			setUploadingAvatar(true)

			if (await redirectIfSignedOut()) return

			const file = new FileSystem.File(asset.uri)

			if (!file.exists) {
				throw new Error('No fue posible acceder a la imagen seleccionada.')
			}

			const avatarResponse = await updateAvatar(file as unknown as Blob)
			setUser(avatarResponse.user)
			void refreshProfile(avatarResponse.user)

			showToast(
				avatarResponse.message || 'Foto de perfil actualizada correctamente.',
				'success',
				'Foto actualizada',
			)
		} catch (error) {
			console.error('UPLOAD AVATAR ERROR:', error)

			showToast(
				error instanceof Error
					? error.message
					: 'No fue posible actualizar la foto.',
				'error',
			)
		} finally {
			setUploadingAvatar(false)
		}
	}

	const handlePickAvatar = async () => {
		try {
			const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()

			if (!permission.granted) {
				showToast('Necesitamos permiso para seleccionar una foto.', 'warning')
				return
			}

			const result = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ['images'],
				allowsEditing: true,
				aspect: [1, 1],
				quality: 0.85,
				allowsMultipleSelection: false,
			})

			if (result.canceled || !result.assets?.length) return

			const asset = result.assets[0]

			Alert.alert(
				'Actualizar foto',
				'¿Quieres usar esta imagen como foto de perfil?',
				[
					{ text: 'Cancelar', style: 'cancel' },
					{
						text: 'Aceptar',
						onPress: () => {
							void uploadAvatar(asset)
						},
					},
				],
			)
		} catch (error) {
			showToast(
				error instanceof Error
					? error.message
					: 'No fue posible seleccionar la imagen.',
				'error',
			)
		}
	}

	const avatarUrl = getAvatarUrl(user?.profile?.avatar)
	const points = user?.gamification?.points ?? user?.points ?? 0

	const currentLevel =
		user?.gamification?.current_level?.name || user?.level?.name || 'Sin nivel'

	const progress = Math.min(100, Math.max(0, user?.gamification?.progress ?? 0))
	const pointsToNextLevel = user?.gamification?.points_to_next_level ?? 0
	const nextLevel = user?.gamification?.next_level?.name || ''

	const coverHeight = scrollY.interpolate({
		inputRange: [0, 180],
		outputRange: [300, 145],
		extrapolate: 'clamp',
	})

	const avatarScale = scrollY.interpolate({
		inputRange: [0, 180],
		outputRange: [1, 0.72],
		extrapolate: 'clamp',
	})

	const avatarTranslateY = scrollY.interpolate({
		inputRange: [0, 180],
		outputRange: [0, -72],
		extrapolate: 'clamp',
	})

	const nameTranslateY = scrollY.interpolate({
		inputRange: [0, 180],
		outputRange: [0, -58],
		extrapolate: 'clamp',
	})

	const emailOpacity = scrollY.interpolate({
		inputRange: [0, 90, 150],
		outputRange: [1, 0.4, 0],
		extrapolate: 'clamp',
	})

	const backButtonOpacity = scrollY.interpolate({
		inputRange: [0, 70, 130],
		outputRange: [1, 0.65, 0],
		extrapolate: 'clamp',
	})

	const progressMarginTop = scrollY.interpolate({
		inputRange: [0, 180],
		outputRange: [-30, -100],
		extrapolate: 'clamp',
	})

	return (
		<ImageBackground
			source={require('@/assets/images/zoo-pattern.png')}
			resizeMode='repeat'
			className='flex-1 bg-blanco'
		>
			<Toast
				visible={toast.visible}
				title={toast.title}
				message={toast.message}
				type={toast.type}
				onHide={() =>
					setToast((current) => ({
						...current,
						visible: false,
					}))
				}
			/>

			<KeyboardScrollView
				className='flex-1'
				contentContainerStyle={{ paddingBottom: bottomSpace }}
				onScroll={Animated.event(
					[
						{
							nativeEvent: {
								contentOffset: { y: scrollY },
							},
						},
					],
					{ useNativeDriver: false },
				)}
			>
				{/* HEADER */}
				<ProfileHeader
					coverHeight={coverHeight}
					backButtonOpacity={backButtonOpacity}
					avatarScale={avatarScale}
					avatarTranslateY={avatarTranslateY}
					nameTranslateY={nameTranslateY}
					emailOpacity={emailOpacity}
					avatarUrl={avatarUrl}
					user={user}
					uploadingAvatar={uploadingAvatar}
					onPickAvatar={handlePickAvatar}
				/>

				{/* PROGRESO */}
				<ProfileProgress
					progressMarginTop={progressMarginTop}
					user={user}
					points={points}
					currentLevel={currentLevel}
					progress={progress}
					pointsToNextLevel={pointsToNextLevel}
					nextLevel={nextLevel}
				/>

				{/* DATOS PERSONALES */}
				<PersonalDataSection
					name={name}
					email={email}
					phone={phone}
					birthDate={birthDate}
					city={city}
					country={country}
					setName={setName}
					setEmail={setEmail}
					setPhone={setPhone}
					setCity={setCity}
					setCountry={setCountry}
					errors={errors}
					clearFieldError={clearFieldError}
					showDatePicker={showDatePicker}
					setShowDatePicker={setShowDatePicker}
					onDateChange={handleDateChange}
					saving={saving}
					onSave={handleSave}
				/>
			</KeyboardScrollView>
		</ImageBackground>
	)
}
