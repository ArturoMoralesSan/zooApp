import ActionButton from '@/components/ActionButton'
import BackButton from '@/components/BackButton'
import Toast from '@/components/toast'
import { API_URL, ApiValidationError } from '@/services/api'
import { useDataRefresh } from '@/hooks/useDataRefresh'
import { useProfile } from '@/hooks/useProfile'
import {
	redirectIfSignedOut,
	useSessionRedirect,
} from '@/hooks/useSessionRedirect'
import { type User } from '@/services/auth'
import colors from '@/theme/colors'
import { cardShadow } from '@/theme/shadows'
import {
	Calendar03Icon,
	Call02Icon,
	Globe02Icon,
	Location01Icon,
	Mail01Icon,
	UserIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import * as FileSystem from 'expo-file-system'
import * as ImagePicker from 'expo-image-picker'
import { router } from 'expo-router'
import { useCallback, useState } from 'react'
import {
	ActivityIndicator,
	Alert,
	Animated,
	Dimensions,
	Image,
	ImageBackground,
	KeyboardAvoidingView,
	Platform,
	Pressable,
	Text,
	TextInput,
	View,
} from 'react-native'
import { updateAvatar, updateProfile } from '@/services/profile'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

type FormErrors = {
	name?: string
	email?: string
	phone?: string
	birth_date?: string
	city?: string
	country?: string
}

type ToastState = {
	visible: boolean
	message: string
	type: 'success' | 'error' | 'warning'
}

function formatDateForApp(date: string | null | undefined): string {
	if (!date) return ''

	const parts = date.split('-')

	if (parts.length !== 3) return ''

	const [year, month, day] = parts

	return `${day}-${month}-${year}`
}

function formatDateForApi(date: string): string | null {
	if (!date.trim()) return null

	const parts = date.split('-')

	if (parts.length !== 3) return null

	const [day, month, year] = parts

	if (day.length !== 2 || month.length !== 2 || year.length !== 4) {
		return null
	}

	return `${year}-${month}-${day}`
}

function parseApiDate(date: string | null | undefined): Date {
	if (!date) return new Date(2000, 0, 1)

	const parts = date.split('-')

	if (parts.length !== 3) return new Date(2000, 0, 1)

	const year = Number(parts[0])
	const month = Number(parts[1])
	const day = Number(parts[2])

	if (
		!Number.isInteger(year) ||
		!Number.isInteger(month) ||
		!Number.isInteger(day)
	) {
		return new Date(2000, 0, 1)
	}

	return new Date(year, month - 1, day)
}

function formatDateForDisplay(date: Date): string {
	const day = String(date.getDate()).padStart(2, '0')
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const year = date.getFullYear()

	return `${day}-${month}-${year}`
}

function getAvatarUrl(avatar: string | null | undefined): string | null {
	if (!avatar) return null

	if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
		return avatar
	}

	const baseUrl = API_URL.replace(/\/api\/?$/, '')

	return `${baseUrl}/storage/${avatar}`
}

type FieldProps = {
	label: string
	icon: typeof UserIcon
	value: string
	placeholder: string
	error?: string
	onChangeText?: (value: string) => void
	onPress?: () => void
	editable?: boolean
	keyboardType?: 'default' | 'email-address' | 'phone-pad'
	autoCapitalize?: 'none' | 'words'
	autoCorrect?: boolean
}

function ProfileField({
	label,
	icon,
	value,
	placeholder,
	error,
	onChangeText,
	onPress,
	editable = true,
	keyboardType = 'default',
	autoCapitalize = 'none',
	autoCorrect = true,
}: FieldProps) {
	const content = (
		<View
			className={`min-h-14 flex-row items-center rounded-[14px] border border-input-border px-4 ${error ? 'bg-niebla' : 'bg-blanco'}`}
		>
			<HugeiconsIcon
				icon={icon}
				size={20}
				strokeWidth={1.8}
				color={colors.esmeralda}
			/>

			<TextInput
				value={value}
				onChangeText={onChangeText}
				placeholder={placeholder}
				placeholderTextColor={colors.tinta}
				keyboardType={keyboardType}
				autoCapitalize={autoCapitalize}
				autoCorrect={autoCorrect}
				editable={editable}
				className='flex-1 px-3 py-3.5 text-[16px] text-tinta'
			/>
		</View>
	)

	return (
		<View className='mt-5'>
			<Text className='mb-2 text-[12px] font-extrabold uppercase tracking-[0.8px] text-tinta'>
				{label}
			</Text>

			{onPress ? <Pressable onPress={onPress}>{content}</Pressable> : content}

			{error && (
				<Text className='mt-1 text-[12px] text-esmeralda'>{error}</Text>
			)}
		</View>
	)
}

type ProfileFormProps = {
	initialUser: User | null
	loadError: Error | undefined
}

// Keyed by user id in ProfileScreen, so the form state starts from the
// loaded profile without copying it in an effect.
function ProfileForm({ initialUser, loadError }: ProfileFormProps) {
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
					message: loadError.message || 'No fue posible cargar el perfil.',
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
		(message: string, type: ToastState['type'] = 'success') => {
			setToast({
				visible: true,
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
			<KeyboardAvoidingView
				className='flex-1'
				behavior={Platform.OS === 'ios' ? 'padding' : undefined}
			>
				<Toast
					visible={toast.visible}
					message={toast.message}
					type={toast.type}
					onHide={() =>
						setToast((current) => ({
							...current,
							visible: false,
						}))
					}
				/>

				<Animated.ScrollView
					className='flex-1'
					keyboardShouldPersistTaps='handled'
					showsVerticalScrollIndicator={false}
					scrollEventThrottle={16}
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
					<View className='relative'>
						<Animated.Image
							source={require('../../assets/images/profile-background.png')}
							resizeMode='cover'
							style={{ width: SCREEN_WIDTH, height: coverHeight }}
						/>

						<BackButton
							onPress={() => router.back()}
							opacity={backButtonOpacity}
						/>

						<View className='absolute left-0 right-0 top-0 items-center pt-20'>
							<Pressable onPress={handlePickAvatar} disabled={uploadingAvatar}>
								<Animated.View
									className='h-28 w-28 items-center justify-center overflow-hidden rounded-[56px] border-[5px] border-blanco bg-niebla'
									style={[
										cardShadow,
										{
											transform: [
												{ scale: avatarScale },
												{ translateY: avatarTranslateY },
											],
										},
									]}
								>
									{avatarUrl ? (
										<Image
											source={{ uri: avatarUrl }}
											className='h-full w-full'
											resizeMode='cover'
										/>
									) : (
										<Text className='text-[48px] font-bold text-esmeralda'>
											{user?.name?.charAt(0).toUpperCase() || '?'}
										</Text>
									)}

									{uploadingAvatar && (
										<View className='absolute inset-0 items-center justify-center bg-esmeralda/55'>
											<ActivityIndicator size='large' color={colors.blanco} />
										</View>
									)}
								</Animated.View>

								<View
									className='absolute -bottom-px -right-px h-[34px] w-[34px] items-center justify-center rounded-[17px] border-[3px] border-blanco bg-lima'
									style={cardShadow}
								>
									<Text className='text-[20px] font-bold text-tinta'>+</Text>
								</View>
							</Pressable>

							<Animated.Text
								className='mt-5 text-[23px] font-bold text-blanco'
								style={{
									// eslint-disable-next-line no-restricted-syntax -- neutral text shadow over the cover photo
									textShadowColor: 'rgba(0,0,0,0.2)',
									textShadowOffset: { width: 0, height: 1 },
									textShadowRadius: 4,
									transform: [{ translateY: nameTranslateY }],
								}}
							>
								{user?.name || 'Visitante'}
							</Animated.Text>

							<Animated.Text
								className='mt-1 px-8 text-center text-[14px] text-blanco'
								style={{ opacity: emailOpacity }}
								numberOfLines={1}
							>
								{user?.email || ''}
							</Animated.Text>
						</View>
					</View>

					{/* PROGRESO */}
					<Animated.View
						className='relative z-10 overflow-hidden rounded-t-[30px] bg-blanco'
						style={{ marginTop: progressMarginTop }}
					>
						<ImageBackground
							source={require('@/assets/images/zoo-pattern.png')}
							resizeMode='repeat'
							imageClassName='opacity-[0.12]'
							className='bg-blanco'
						>
							<View className='px-5 pb-7 pt-6'>
								<Text className='text-[21px] font-bold text-tinta'>
									Tu progreso
								</Text>

								<Text className='mt-1 text-[14px] text-tinta'>
									Sigue acumulando puntos en ZooApp.
								</Text>

								<View className='mt-5 flex-row'>
									<View className='flex-1 rounded-[18px] border border-bosque bg-esmeralda p-4'>
										<Text className='text-[11px] font-bold uppercase tracking-[1.2px] text-hoja'>
											Puntos
										</Text>
										<Text className='mt-1 text-[29px] font-extrabold text-blanco'>
											{points}
										</Text>
									</View>

									<View
										className='ml-3 flex-1 rounded-[18px] border border-card-border bg-niebla p-4'
										style={cardShadow}
									>
										<Text className='text-[11px] font-bold uppercase tracking-[1.2px] text-tinta'>
											Nivel
										</Text>
										<Text
											className='mt-1 text-[18px] font-bold text-tinta'
											numberOfLines={1}
										>
											{currentLevel}
										</Text>
									</View>
								</View>

								{user?.gamification?.next_level && (
									<View
										className='mt-5 rounded-[18px] border border-card-border bg-niebla p-4'
										style={cardShadow}
									>
										<View className='flex-row items-center justify-between'>
											<Text className='flex-1 text-[14px] font-semibold text-tinta'>
												Progreso al siguiente nivel
											</Text>

											<View className='self-start rounded-full bg-lima px-2.5 py-1'>
												<Text className='text-[12px] font-extrabold text-tinta'>
													{progress}%
												</Text>
											</View>
										</View>

										<View className='mt-3 h-2.5 overflow-hidden rounded-full bg-card-border'>
											<View
												className='h-full rounded-full bg-esmeralda'
												style={{ width: `${progress}%` }}
											/>
										</View>

										<Text className='mt-3 text-[14px] leading-5 text-tinta'>
											Te faltan{' '}
											<Text className='font-bold text-tinta'>
												{pointsToNextLevel}
											</Text>{' '}
											puntos para{' '}
											<Text className='font-semibold text-tinta'>
												{nextLevel}
											</Text>
											.
										</Text>
									</View>
								)}
							</View>
						</ImageBackground>
					</Animated.View>

					{/* DATOS PERSONALES */}
					<ImageBackground
						source={require('@/assets/images/zoo-pattern.png')}
						resizeMode='repeat'
						imageClassName='opacity-[0.12]'
						className='bg-blanco'
					>
						<View className='px-5 pb-12 pt-1'>
							<View
								className='rounded-[22px] border border-card-border bg-niebla px-[18px] pb-6 pt-5'
								style={cardShadow}
							>
								<Text className='text-[21px] font-bold text-tinta'>
									Datos personales
								</Text>

								<Text className='mt-1 text-[14px] text-tinta'>
									Mantén actualizada tu información.
								</Text>

								<ProfileField
									label='Nombre'
									icon={UserIcon}
									value={name}
									placeholder='Nombre completo'
									error={errors.name}
									onChangeText={(value) => {
										setName(value)
										clearFieldError('name')
									}}
									autoCapitalize='words'
								/>

								<ProfileField
									label='Correo electrónico'
									icon={Mail01Icon}
									value={email}
									placeholder='correo@ejemplo.com'
									error={errors.email}
									onChangeText={(value) => {
										setEmail(value)
										clearFieldError('email')
									}}
									keyboardType='email-address'
									autoCapitalize='none'
									autoCorrect={false}
								/>

								<ProfileField
									label='Teléfono'
									icon={Call02Icon}
									value={phone}
									placeholder='Número de teléfono'
									error={errors.phone}
									onChangeText={(value) => {
										setPhone(value)
										clearFieldError('phone')
									}}
									keyboardType='phone-pad'
								/>

								<View className='mt-5'>
									<Text className='mb-2 text-[12px] font-extrabold uppercase tracking-[0.8px] text-tinta'>
										Fecha de nacimiento
									</Text>

									<Pressable
										onPress={() => setShowDatePicker(true)}
										className={`min-h-14 flex-row items-center rounded-[14px] border border-input-border px-4 ${errors.birth_date ? 'bg-niebla' : 'bg-blanco'}`}
									>
										<HugeiconsIcon
											icon={Calendar03Icon}
											size={20}
											strokeWidth={1.8}
											color={colors.esmeralda}
										/>

										<Text className='ml-3 flex-1 text-[16px] text-tinta'>
											{birthDate || 'Seleccionar fecha'}
										</Text>
									</Pressable>

									{showDatePicker && (
										<DateTimePicker
											value={parseApiDate(formatDateForApi(birthDate))}
											mode='date'
											display={Platform.OS === 'ios' ? 'spinner' : 'default'}
											maximumDate={new Date()}
											onChange={handleDateChange}
										/>
									)}

									{errors.birth_date && (
										<Text className='mt-1 text-[12px] text-esmeralda'>
											{errors.birth_date}
										</Text>
									)}
								</View>

								<ProfileField
									label='Ciudad'
									icon={Location01Icon}
									value={city}
									placeholder='Ciudad'
									error={errors.city}
									onChangeText={(value) => {
										setCity(value)
										clearFieldError('city')
									}}
								/>

								<ProfileField
									label='País'
									icon={Globe02Icon}
									value={country}
									placeholder='País'
									error={errors.country}
									onChangeText={(value) => {
										setCountry(value)
										clearFieldError('country')
									}}
								/>

								<ActionButton
									title={saving ? 'Guardando...' : 'Guardar cambios'}
									onPress={handleSave}
									disabled={saving}
								/>
							</View>
						</View>
					</ImageBackground>
				</Animated.ScrollView>
			</KeyboardAvoidingView>
		</ImageBackground>
	)
}

export default function ProfileScreen() {
	const { data: user, error, isLoading } = useProfile()

	useSessionRedirect()

	if (isLoading) {
		return (
			<ImageBackground
				source={require('@/assets/images/zoo-pattern.png')}
				resizeMode='repeat'
				imageClassName='opacity-20'
				className='flex-1 items-center justify-center bg-blanco'
			>
				<ActivityIndicator size='large' color={colors.esmeralda} />
				<Text className='mt-4 text-[14px] font-medium text-tinta'>
					Cargando perfil...
				</Text>
			</ImageBackground>
		)
	}

	return (
		<ProfileForm
			key={user?.id ?? 'empty'}
			initialUser={user ?? null}
			loadError={error}
		/>
	)
}
