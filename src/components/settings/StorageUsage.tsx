import { HardDriveIcon } from '@hugeicons/core-free-icons'
import { Text, View } from 'react-native'

import { Card } from '@/components/ui/Card'
import { IconBox } from '@/components/ui/IconBox'
import type { StorageCategory } from '@/types/settings'
import { formatBytes } from '@/utils/format'

type StorageUsageProps = {
	categories: StorageCategory[]
	freeBytes: number
	className?: string
}

const SEGMENT: Record<StorageCategory['key'], string> = {
	cards: 'bg-esmeralda',
	photos: 'bg-lima',
	offline: 'bg-aviso',
	cache: 'bg-apagado',
}

// What the app takes on the phone, split by kind. Each colour has its label
// and size in the legend, so it isn't read from colour alone.
export function StorageUsage({
	categories,
	freeBytes,
	className = '',
}: StorageUsageProps) {
	const used = categories.reduce((sum, category) => sum + category.bytes, 0)
	const shown = categories.filter((category) => category.bytes > 0)

	return (
		<Card className={className}>
			<View className='flex-row items-center gap-3'>
				<IconBox icon={HardDriveIcon} />

				<View style={{ flex: 1, minWidth: 0 }}>
					<Text className='text-h3 text-tinta'>
						ZooApp usa {formatBytes(used)}
					</Text>
					<Text className='text-meta mt-1'>
						{formatBytes(freeBytes)} libres en tu teléfono
					</Text>
				</View>
			</View>

			<View
				accessibilityLabel={`Espacio usado: ${formatBytes(used)}`}
				className='mt-4 h-3 flex-row gap-0.5 overflow-hidden rounded-full bg-card-border'
			>
				{shown.map((category) => (
					<View
						key={category.key}
						className={SEGMENT[category.key]}
						style={{ flex: used > 0 ? category.bytes / used : 0 }}
					/>
				))}
			</View>

			<View className='mt-3 gap-2'>
				{shown.map((category) => (
					<View key={category.key} className='flex-row items-center gap-2'>
						<View
							className={`h-2.5 w-2.5 rounded-full ${SEGMENT[category.key]}`}
						/>
						<Text className='text-meta' style={{ flex: 1 }}>
							{category.label}
						</Text>
						<Text className='text-meta text-tinta'>
							{formatBytes(category.bytes)}
						</Text>
					</View>
				))}
			</View>
		</Card>
	)
}
