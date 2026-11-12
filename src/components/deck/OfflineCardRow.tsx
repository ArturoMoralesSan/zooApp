import { ArrowDown01Icon, SquareLock02Icon } from '@hugeicons/core-free-icons'
import { Fragment } from 'react'
import { Pressable, Text, View } from 'react-native'

import { CardThumbnail } from '@/components/deck/CardThumbnail'
import { OfflineFileRow } from '@/components/deck/OfflineFileRow'
import { Divider } from '@/components/ui/Divider'
import { FocusRing, useFocusRing } from '@/components/ui/FocusRing'
import { Icon } from '@/components/ui/Icon'
import { IconBox } from '@/components/ui/IconBox'
import type { PackFileStatus } from '@/services/packSync'
import colors from '@/theme/colors'
import type { OwnedCard } from '@/types/cards'
import { formatBytes } from '@/utils/format'
import { cardPackState } from '@/utils/offlinePack'

type OfflineCardRowProps = {
	// Owned cards show their name and photo; the rest stay hidden.
	card: OwnedCard | null
	files: PackFileStatus[]
	active: boolean
	expanded: boolean
	onToggle: () => void
}

// One card of the pack: its overall state, expandable to its files.
export function OfflineCardRow({
	card,
	files,
	active,
	expanded,
	onToggle,
}: OfflineCardRowProps) {
	const { focused, focusProps } = useFocusRing()
	const state = cardPackState(files, active)
	const title = card?.name ?? 'Tarjeta por descubrir'
	const size = formatBytes(files.reduce((total, file) => total + file.bytes, 0))

	return (
		<View
			className={`rounded-2xl border-1.5 bg-niebla ${focused ? 'border-bosque' : 'border-card-border'}`}
		>
			<Pressable
				{...focusProps}
				onPress={onToggle}
				accessibilityRole='button'
				accessibilityLabel={`${title}, ${state.label}`}
				accessibilityHint={
					expanded ? 'Oculta sus archivos' : 'Muestra sus archivos'
				}
				accessibilityState={{ expanded }}
				className='min-h-14 flex-row items-center gap-3 rounded-2xl p-3 active:bg-hoja'
			>
				{card ? (
					<CardThumbnail
						card={card}
						className='h-12 w-10 rounded-lg border-1.5 border-card-border'
					/>
				) : (
					<IconBox icon={SquareLock02Icon} tone='surface' />
				)}

				<View style={{ flex: 1, minWidth: 0 }}>
					<Text className='text-h3 text-tinta' numberOfLines={1}>
						{title}
					</Text>

					<View className='mt-1 flex-row items-center gap-1.5'>
						<Icon icon={state.icon} size={16} color={state.color} />
						<Text
							className={`font-sans-semibold text-[12px] ${state.text}`}
							numberOfLines={1}
						>
							{state.label} · {size}
						</Text>
					</View>
				</View>

				<View
					className='h-8 w-8 shrink-0 items-center justify-center rounded-full bg-hoja'
					style={{ transform: [{ rotate: expanded ? '180deg' : '0deg' }] }}
				>
					<Icon
						icon={ArrowDown01Icon}
						size={20}
						color={colors.esmeralda}
						strong
					/>
				</View>
			</Pressable>

			{expanded && (
				<View className='px-4 pb-1'>
					{files.map((file) => (
						<Fragment key={file.id}>
							<Divider className='' />
							<OfflineFileRow file={file} active={active} />
						</Fragment>
					))}
				</View>
			)}

			<FocusRing visible={focused} radiusClassName='rounded-[19px]' />
		</View>
	)
}
