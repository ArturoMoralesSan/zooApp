import type { IconSvgElement } from '@hugeicons/react-native'
import type { ReactNode } from 'react'
import { Image, Text, View } from 'react-native'

import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'

type DialogAction = {
	title: string
	onPress: () => void
	icon?: IconSvgElement
	loading?: boolean
	disabled?: boolean
}

type DuelDialogProps = {
	visible: boolean
	// Animal illustration on a Hoja box (A-19, A-23) or the full card (A-22).
	image?: string | null
	imageLook?: 'illustration' | 'card'
	overline?: string
	title?: string
	message?: string
	// Stat pills, attempt badges…
	children?: ReactNode
	primary: DialogAction
	secondary?: DialogAction
	// Challenge (A-19) is left-aligned; results (A-22/A-23) are centered.
	align?: 'start' | 'center'
	// Android back; dialogs never close on a backdrop tap.
	onRequestClose?: () => void
}

// Dialog of the duel flow: challenge, results and scan refusals.
export function DuelDialog({
	visible,
	image,
	imageLook = 'illustration',
	overline,
	title,
	message,
	children,
	primary,
	secondary,
	align = 'start',
	onRequestClose,
}: DuelDialogProps) {
	const centered = align === 'center'

	return (
		<Modal
			visible={visible}
			onClose={onRequestClose ?? (() => {})}
			dismissible={false}
		>
			{image !== undefined &&
				(imageLook === 'card' ? (
					<View className='mb-5 items-center'>
						{image ? (
							<Image
								source={{ uri: image }}
								resizeMode='contain'
								accessibilityIgnoresInvertColors
								className='aspect-[0.7] w-[160px] rounded-xl'
							/>
						) : (
							<View className='aspect-[0.7] w-[160px] rounded-xl bg-hoja' />
						)}
					</View>
				) : (
					<View className='mb-5 h-[140px] overflow-hidden rounded-2xl bg-hoja'>
						{image && (
							<Image
								source={{ uri: image }}
								resizeMode='contain'
								accessibilityIgnoresInvertColors
								className='h-full w-full'
							/>
						)}
					</View>
				))}

			<View className={centered ? 'items-center' : ''}>
				{overline && (
					<Text className='text-overline mb-1 text-esmeralda'>{overline}</Text>
				)}

				{title && (
					<Text
						className={`text-h2 text-tinta ${centered ? 'text-center' : ''}`}
						accessibilityRole='header'
					>
						{title}
					</Text>
				)}

				{message && (
					<Text
						className={`text-body mt-2 text-tinta-2 ${centered ? 'text-center' : ''}`}
					>
						{message}
					</Text>
				)}

				{children && <View className='mt-4'>{children}</View>}
			</View>

			<View className='mt-6 gap-3'>
				<Button
					title={primary.title}
					icon={primary.icon}
					iconPosition='leading'
					loading={primary.loading}
					disabled={primary.disabled}
					onPress={primary.onPress}
				/>

				{secondary && (
					<Button
						title={secondary.title}
						icon={secondary.icon}
						iconPosition='leading'
						variant='secondary'
						loading={secondary.loading}
						disabled={secondary.disabled}
						onPress={secondary.onPress}
					/>
				)}
			</View>
		</Modal>
	)
}
