import { Text, View } from 'react-native'

import { Icon } from '@/components/ui/Icon'
import { ProgressBar } from '@/components/ui/ProgressBar'
import type { PackFileStatus } from '@/services/packSync'
import colors from '@/theme/colors'
import { formatBytes } from '@/utils/format'
import { fileKinds, fileStateInfo } from '@/utils/offlinePack'

type OfflineFileRowProps = {
	file: PackFileStatus
	// A download is running, so queued files say "En cola".
	active: boolean
}

// One file of the pack: what it is, its size and its own state.
export function OfflineFileRow({ file, active }: OfflineFileRowProps) {
	const kind = fileKinds[file.kind]
	const state = fileStateInfo(file, active)

	return (
		<View
			accessible
			accessibilityLabel={`${kind.label}, ${formatBytes(file.bytes)}, ${state.label}`}
			className='py-3'
		>
			<View className='flex-row items-center gap-3'>
				<Icon icon={kind.icon} size={20} color={colors.tinta2} />

				<View style={{ flex: 1, minWidth: 0 }}>
					<Text className='font-sans-semibold text-[14px] text-tinta'>
						{kind.label}
					</Text>
					<Text className='text-meta'>{formatBytes(file.bytes)}</Text>
				</View>

				<View className='shrink-0 flex-row items-center gap-1.5'>
					<Icon icon={state.icon} size={18} color={state.color} />
					<Text className={`font-sans-semibold text-[12px] ${state.text}`}>
						{state.label}
					</Text>
				</View>
			</View>

			{file.state === 'downloading' && (
				<ProgressBar progress={file.progress} size='sm' className='ml-8 mt-2' />
			)}
		</View>
	)
}
