import { FocusRing, useFocusRing } from '@/components/ui/FocusRing'
import { Icon } from '@/components/ui/Icon'
import colors from '@/theme/colors'
import type { IconSvgElement } from '@hugeicons/react-native'
import { ActivityIndicator, Pressable, Text, View } from 'react-native'

type ButtonVariant = 'primary' | 'secondary'

type ButtonProps = {
	title: string
	onPress: () => void
	variant?: ButtonVariant
	// md is the 52px App control; sm (40px) is for inline actions inside cards.
	size?: 'md' | 'sm'
	disabled?: boolean
	loading?: boolean
	// Trailing icon, e.g. an arrow on "Cómo llegar".
	icon?: IconSvgElement
	fullWidth?: boolean
	// Spacing around the button (margins), never its look.
	className?: string
	accessibilityLabel?: string
}

const variants = {
	primary: {
		base: 'border-b-[3px] border-b-bosque bg-esmeralda active:bg-bosque',
		focused: 'border-2 border-b-[3px] border-bosque bg-esmeralda',
		disabled: 'border-b-[3px] border-b-tinta-2 bg-apagado',
		text: 'text-blanco',
		disabledText: 'text-blanco',
		icon: colors.blanco,
		disabledIcon: colors.blanco,
	},
	secondary: {
		base: 'border-2 border-esmeralda bg-blanco active:bg-hoja',
		focused: 'border-2 border-bosque bg-blanco',
		disabled: 'border-2 border-apagado bg-niebla',
		text: 'text-bosque',
		disabledText: 'text-apagado',
		icon: colors.bosque,
		disabledIcon: colors.apagado,
	},
}

export function Button({
	title,
	onPress,
	variant = 'primary',
	size = 'md',
	disabled = false,
	loading = false,
	icon,
	fullWidth = true,
	className = '',
	accessibilityLabel,
}: ButtonProps) {
	const { focused, focusProps } = useFocusRing()
	const style = variants[variant]
	const inactive = disabled || loading

	const stateClassName = disabled
		? style.disabled
		: focused
			? style.focused
			: style.base

	return (
		<View className={`${fullWidth ? 'w-full' : 'self-start'} ${className}`}>
			<Pressable
				onPress={onPress}
				disabled={inactive}
				accessibilityRole='button'
				accessibilityLabel={accessibilityLabel ?? title}
				accessibilityState={{ disabled: inactive, busy: loading }}
				{...focusProps}
				className={`flex-row items-center justify-center gap-2 rounded-xl px-5 ${size === 'md' ? 'h-[52px]' : 'h-10'} ${stateClassName}`}
			>
				{loading ? (
					<ActivityIndicator size='small' color={style.icon} />
				) : (
					<>
						<Text
							className={`${size === 'md' ? 'text-button' : 'font-display text-[15px]'} ${disabled ? style.disabledText : style.text}`}
							numberOfLines={1}
						>
							{title}
						</Text>

						{icon && (
							<Icon
								icon={icon}
								size={20}
								color={disabled ? style.disabledIcon : style.icon}
								strong
							/>
						)}
					</>
				)}
			</Pressable>

			<FocusRing visible={focused} />
		</View>
	)
}
