import colors from '@/theme/colors'
import { UserIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { Pressable, Text, TextInput, View } from 'react-native'

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

export function ProfileField({
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
				className='flex-1 px-3 py-3.5 font-sans text-[14px] text-tinta'
			/>
		</View>
	)

	return (
		<View className='mt-5'>
			<Text className='mb-2 font-sans-semibold text-[14px] text-tinta'>
				{label}
			</Text>

			{onPress ? <Pressable onPress={onPress}>{content}</Pressable> : content}

			{error && <Text className='text-meta mt-1 text-esmeralda'>{error}</Text>}
		</View>
	)
}
