import Toast from '@/components/toast'
import { API_URL, ApiValidationError, api } from '@/services/api'
import { getToken, type User } from '@/services/auth'
import { colors, styles } from '@/styles/profile'
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
import { useCallback, useEffect, useRef, useState } from 'react'
import {
	ActivityIndicator,
	Alert,
	Animated,
	Image,
	ImageBackground,
	KeyboardAvoidingView,
	Platform,
	Pressable,
	Text,
	TextInput,
	View,
} from 'react-native'

type FormErrors = {
	name?: string
	email?: string
	phone?: string
	birth_date?: string
	city?: string
	country?: string
}

type ProfileResponse = {
	success: boolean
	user: User
}

type UpdateProfileResponse = {
	success: boolean
	message: string
	user: User
}

type AvatarResponse = {
	success: boolean
	message: string
	avatar: string
	user: User
}

type ToastState = {
	visible: boolean
	message: string
	type: 'success' | 'error' | 'warning'
}

function formatDateForApp(date: string | null | undefined): string {
	if (!date) {
		return ''
	}

	const parts = date.split('-')

	if (parts.length !== 3) {
		return ''
	}

	const [year, month, day] = parts

	return `${day}-${month}-${year}`
}

function formatDateForApi(date: string): string | null {
	if (!date.trim()) {
		return null
	}

	const parts = date.split('-')

	if (parts.length !== 3) {
		return null
	}

	const [day, month, year] = parts

	if (day.length !== 2 || month.length !== 2 || year.length !== 4) {
		return null
	}

	return `${year}-${month}-${day}`
}

function parseApiDate(date: string | null | undefined): Date {
	if (!date) {
		return new Date(2000, 0, 1)
	}

	const parts = date.split('-')

	if (parts.length !== 3) {
		return new Date(2000, 0, 1)
	}

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
	if (!avatar) {
		return null
	}

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
		<View style={[styles.fieldContainer, error && styles.fieldContainerError]}>
			<HugeiconsIcon
				icon={icon}
				size={20}
				strokeWidth={1.8}
				color={colors.primary}
			/>

			<TextInput
				value={value}
				onChangeText={onChangeText}
				placeholder={placeholder}
				placeholderTextColor={colors.placeholder}
				keyboardType={keyboardType}
				autoCapitalize={autoCapitalize}
				autoCorrect={autoCorrect}
				editable={editable}
				style={styles.fieldInput}
			/>
		</View>
	)

	return (
		<View style={styles.fieldWrapper}>
			<Text style={styles.fieldLabel}>{label}</Text>

			{onPress ? <Pressable onPress={onPress}>{content}</Pressable> : content}

			{error && <Text style={styles.fieldError}>{error}</Text>}
		</View>
	)
}

export default function ProfileScreen() {
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)
	const [uploadingAvatar, setUploadingAvatar] = useState(false)

	const [user, setUser] = useState<User | null>(null)

	const [name, setName] = useState('')
	const [email, setEmail] = useState('')
	const [phone, setPhone] = useState('')
	const [birthDate, setBirthDate] = useState('')
	const [city, setCity] = useState('')
	const [country, setCountry] = useState('')

	const [showDatePicker, setShowDatePicker] = useState(false)
	const [errors, setErrors] = useState<FormErrors>({})

	const [toast, setToast] = useState<ToastState>({
		visible: false,
		message: '',
		type: 'success',
	})

	const scrollY = useRef(new Animated.Value(0)).current

	const showToast = useCallback(
		(message: string, type: 'success' | 'error' | 'warning' = 'success') => {
			setToast({
				visible: true,
				message,
				type,
			})
		},
		[],
	)

	const loadProfile = useCallback(async () => {
		try {
			setLoading(true)

			const token = await getToken()

			if (!token) {
				router.replace('/login')
				return
			}

			const response = await api<ProfileResponse>('/profile', {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})

			const currentUser = response.user

			setUser(currentUser)
			setName(currentUser.name || '')
			setEmail(currentUser.email || '')
			setPhone(currentUser.profile?.phone || '')
			setBirthDate(formatDateForApp(currentUser.profile?.birth_date))
			setCity(currentUser.profile?.city || '')
			setCountry(currentUser.profile?.country || '')
		} catch (error) {
			showToast(
				error instanceof Error
					? error.message
					: 'No fue posible cargar el perfil.',
				'error',
			)
		} finally {
			setLoading(false)
		}
	}, [showToast])

	useEffect(() => {
		void loadProfile()
	}, [loadProfile])

	const clearFieldError = (field: keyof FormErrors) => {
		setErrors((current) => ({
			...current,
			[field]: undefined,
		}))
	}

	const handleDateChange = (_event: unknown, selectedDate?: Date) => {
		setShowDatePicker(false)

		if (!selectedDate) {
			return
		}

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

			const token = await getToken()

			if (!token) {
				router.replace('/login')
				return
			}

			const response = await api<UpdateProfileResponse>('/profile', {
				method: 'PUT',
				headers: {
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					name: name.trim(),
					email: email.trim(),
					phone: phone.trim() || null,
					birth_date: formatDateForApi(birthDate),
					city: city.trim() || null,
					country: country.trim() || null,
				}),
			})

			setUser(response.user)
			setName(response.user.name || '')
			setEmail(response.user.email || '')
			setPhone(response.user.profile?.phone || '')
			setBirthDate(formatDateForApp(response.user.profile?.birth_date))
			setCity(response.user.profile?.city || '')
			setCountry(response.user.profile?.country || '')

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

			const token = await getToken()

			if (!token) {
				router.replace('/login')
				return
			}

			const file = new FileSystem.File(asset.uri)

			if (!file.exists) {
				throw new Error('No fue posible acceder a la imagen seleccionada.')
			}

			const formData = new FormData()

			formData.append('avatar', file as unknown as Blob)

			const response = await fetch(`${API_URL}/profile/avatar`, {
				method: 'POST',
				headers: {
					Accept: 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: formData,
			})

			const responseText = await response.text()

			let data:
				| AvatarResponse
				| {
						message?: string
						errors?: Record<string, string[]>
				  }

			try {
				data = JSON.parse(responseText)
			} catch {
				throw new Error(
					`Respuesta inválida del servidor. Código HTTP: ${response.status}`,
				)
			}

			if (!response.ok) {
				const errorData = data as {
					message?: string
					errors?: Record<string, string[]>
				}

				if (response.status === 401) {
					throw new Error(
						'La sesión ya no es válida. Inicia sesión nuevamente.',
					)
				}

				if (errorData.errors) {
					const firstError = Object.values(errorData.errors)[0]?.[0]

					if (firstError) {
						throw new Error(firstError)
					}
				}

				throw new Error(
					errorData.message ||
						`No fue posible actualizar la foto. Código HTTP: ${response.status}`,
				)
			}

			const avatarResponse = data as AvatarResponse

			setUser(avatarResponse.user)

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

			if (result.canceled || !result.assets || result.assets.length === 0) {
				return
			}

			const asset = result.assets[0]

			Alert.alert(
				'Actualizar foto',
				'¿Quieres usar esta imagen como foto de perfil?',
				[
					{
						text: 'Cancelar',
						style: 'cancel',
					},
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

	if (loading) {
		return (
			<ImageBackground
				source={require('@/assets/images/zoo-pattern.png')}
				resizeMode='repeat'
				imageStyle={styles.loadingPattern}
				style={styles.loadingContainer}
			>
				<ActivityIndicator size='large' color={colors.primary} />

				<Text style={styles.loadingText}>Cargando perfil...</Text>
			</ImageBackground>
		)
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
			imageStyle={styles.backgroundPattern}
			style={styles.container}
		>
			<KeyboardAvoidingView
				style={styles.keyboardContainer}
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
					style={styles.scrollView}
					keyboardShouldPersistTaps='handled'
					showsVerticalScrollIndicator={false}
					scrollEventThrottle={16}
					onScroll={Animated.event(
						[
							{
								nativeEvent: {
									contentOffset: {
										y: scrollY,
									},
								},
							},
						],
						{
							useNativeDriver: false,
						},
					)}
				>
					{/* HEADER */}
					<View style={styles.header}>
						<Animated.Image
							source={require('../../assets/images/profile-background.png')}
							resizeMode='cover'
							style={[
								styles.coverImage,
								{
									height: coverHeight,
								},
							]}
						/>

						<Animated.View
							style={[
								styles.backButtonWrapper,
								{
									opacity: backButtonOpacity,
								},
							]}
						>
							<Pressable
								onPress={() => router.back()}
								style={styles.backButton}
							>
								<Text style={styles.backArrow}>‹</Text>

								<Text style={styles.backText}>Regresar</Text>
							</Pressable>
						</Animated.View>

						<View style={styles.profileHeader}>
							<Pressable onPress={handlePickAvatar} disabled={uploadingAvatar}>
								<Animated.View
									style={[
										styles.avatar,
										{
											transform: [
												{
													scale: avatarScale,
												},
												{
													translateY: avatarTranslateY,
												},
											],
										},
									]}
								>
									{avatarUrl ? (
										<Image
											source={{
												uri: avatarUrl,
											}}
											style={styles.avatarImage}
											resizeMode='cover'
										/>
									) : (
										<Text style={styles.avatarInitial}>
											{user?.name?.charAt(0).toUpperCase() || '?'}
										</Text>
									)}

									{uploadingAvatar && (
										<View style={styles.avatarLoading}>
											<ActivityIndicator size='large' color={colors.white} />
										</View>
									)}
								</Animated.View>

								<View style={styles.changeAvatarButton}>
									<Text style={styles.changeAvatarText}>+</Text>
								</View>
							</Pressable>

							<Animated.Text
								style={[
									styles.profileName,
									{
										transform: [
											{
												translateY: nameTranslateY,
											},
										],
									},
								]}
							>
								{user?.name || 'Visitante'}
							</Animated.Text>

							<Animated.Text
								style={[
									styles.profileEmail,
									{
										opacity: emailOpacity,
									},
								]}
								numberOfLines={1}
							>
								{user?.email || ''}
							</Animated.Text>
						</View>
					</View>

					{/* PROGRESO */}
					<Animated.View
						style={[
							styles.progressContainer,
							{
								marginTop: progressMarginTop,
							},
						]}
					>
						<ImageBackground
							source={require('@/assets/images/zoo-pattern.png')}
							resizeMode='repeat'
							imageStyle={styles.progressPattern}
							style={styles.progressBackground}
						>
							<View style={styles.progressContent}>
								<Text style={styles.sectionTitle}>Tu progreso</Text>

								<Text style={styles.sectionSubtitle}>
									Sigue acumulando puntos en ZooApp.
								</Text>

								<View style={styles.statsRow}>
									<View style={styles.pointsCard}>
										<Text style={styles.pointsLabel}>Puntos</Text>

										<Text style={styles.pointsValue}>{points}</Text>
									</View>

									<View style={styles.levelCard}>
										<Text style={styles.levelLabel}>Nivel</Text>

										<Text style={styles.levelValue} numberOfLines={1}>
											{currentLevel}
										</Text>
									</View>
								</View>

								{user?.gamification?.next_level && (
									<View style={styles.nextLevelCard}>
										<View style={styles.nextLevelHeader}>
											<Text style={styles.nextLevelTitle}>
												Progreso al siguiente nivel
											</Text>

											<View style={styles.progressBadge}>
												<Text style={styles.progressBadgeText}>
													{progress}%
												</Text>
											</View>
										</View>

										<View style={styles.progressTrack}>
											<View
												style={[
													styles.progressFill,
													{
														width: `${progress}%`,
													},
												]}
											/>
										</View>

										<Text style={styles.progressDescription}>
											Te faltan{' '}
											<Text style={styles.progressStrongText}>
												{pointsToNextLevel}
											</Text>{' '}
											puntos para{' '}
											<Text style={styles.progressLevelText}>{nextLevel}</Text>.
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
						imageStyle={styles.personalPattern}
						style={styles.personalBackground}
					>
						<View style={styles.personalContent}>
							<View style={styles.personalCard}>
								<Text style={styles.sectionTitle}>Datos personales</Text>

								<Text style={styles.sectionSubtitle}>
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

								<View style={styles.dateFieldWrapper}>
									<Text style={styles.fieldLabel}>Fecha de nacimiento</Text>

									<Pressable
										onPress={() => setShowDatePicker(true)}
										style={[
											styles.fieldContainer,
											errors.birth_date && styles.fieldContainerError,
										]}
									>
										<HugeiconsIcon
											icon={Calendar03Icon}
											size={20}
											strokeWidth={1.8}
											color={colors.primary}
										/>

										<Text
											style={[
												styles.dateValue,
												{
													color: birthDate ? colors.text : colors.placeholder,
												},
											]}
										>
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
										<Text style={styles.fieldError}>{errors.birth_date}</Text>
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

								<Pressable
									onPress={handleSave}
									disabled={saving}
									style={[
										styles.saveButton,
										saving && styles.saveButtonDisabled,
									]}
								>
									{({ pressed }) => (
										<View
											style={[
												styles.saveButtonContent,
												pressed && styles.saveButtonPressed,
											]}
										>
											{saving ? (
												<ActivityIndicator color={colors.white} />
											) : (
												<Text style={styles.saveButtonText}>
													Guardar cambios
												</Text>
											)}
										</View>
									)}
								</Pressable>
							</View>
						</View>
					</ImageBackground>
				</Animated.ScrollView>
			</KeyboardAvoidingView>
		</ImageBackground>
	)
}
