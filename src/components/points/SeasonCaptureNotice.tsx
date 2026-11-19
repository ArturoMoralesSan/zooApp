import { Text, View } from 'react-native'

import { Icon } from '@/components/ui/Icon'
import type { DuelPointsSeason } from '@/types/cards'
import {
	seasonCaptureText,
	seasonIcon,
	seasonTones,
	withAlpha,
} from '@/utils/pointSeason'

type SeasonCaptureNoticeProps = {
	season: DuelPointsSeason
	awarded: number
}

// Victory notice: why this capture gave more, fewer or no points. Compact
// Notice layout (it shares the dialog with the card), in the season's tones.
export function SeasonCaptureNotice({
	season,
	awarded,
}: SeasonCaptureNoticeProps) {
	const tones = seasonTones(season.color)
	const change = seasonCaptureText(awarded, season.base_points)

	return (
		<View
			accessible
			accessibilityLabel={[
				`Temporada de puntos: ${season.title}.`,
				change,
				season.message,
			]
				.filter(Boolean)
				.join(' ')}
			className='w-full flex-row items-start gap-3 rounded-xl border-1.5 px-4 py-3'
			style={{
				backgroundColor: tones.soft,
				borderColor: withAlpha(tones.accent, 0.35),
			}}
		>
			<View
				className='h-8 w-8 items-center justify-center rounded-lg'
				style={{ backgroundColor: tones.accent }}
			>
				<Icon
					icon={seasonIcon(season.icon)}
					size={20}
					color={tones.onAccent}
					strong
				/>
			</View>

			<View style={{ flex: 1, minWidth: 0 }}>
				{/* Overline + title, as in the banner: the zoo's title may
				    already start with "Temporada". */}
				<Text className='text-overline' style={{ color: tones.text }}>
					Temporada de puntos
				</Text>
				<Text
					className='font-sans-bold text-[14px]'
					style={{ color: tones.text }}
				>
					{season.title}
				</Text>
				{change && (
					<Text className='text-meta mt-0.5' style={{ color: tones.text }}>
						{change}
					</Text>
				)}
				{season.message && (
					<Text className='text-meta mt-0.5' style={{ color: tones.text }}>
						{season.message}
					</Text>
				)}
			</View>
		</View>
	)
}
