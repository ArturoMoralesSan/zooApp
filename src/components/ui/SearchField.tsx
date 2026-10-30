import { Icon } from '@/components/ui/Icon'
import { TextField, type TextFieldProps } from '@/components/ui/TextField'
import colors from '@/theme/colors'
import { Cancel01Icon, Search01Icon } from '@hugeicons/core-free-icons'
import { Pressable } from 'react-native'

type SearchFieldProps = Omit<
	TextFieldProps,
	'icon' | 'renderTrailing' | 'onPress' | 'value' | 'onChangeText'
> & {
	value: string
	onChangeText: (value: string) => void
	clearLabel?: string
}

// TextField with a search icon and a clear button once there is text.
export function SearchField({
	value,
	onChangeText,
	clearLabel = 'Limpiar búsqueda',
	...fieldProps
}: SearchFieldProps) {
	return (
		<TextField
			autoCapitalize='none'
			autoCorrect={false}
			returnKeyType='search'
			{...fieldProps}
			icon={Search01Icon}
			value={value}
			onChangeText={onChangeText}
			renderTrailing={() =>
				value !== '' && (
					<Pressable
						onPress={() => onChangeText('')}
						className='mr-1.5 h-10 w-10 items-center justify-center rounded-xl active:bg-hoja'
						accessibilityRole='button'
						accessibilityLabel={clearLabel}
					>
						<Icon icon={Cancel01Icon} size={20} color={colors.tinta2} />
					</Pressable>
				)
			}
		/>
	)
}
