import { View } from 'react-native'

const CORNER = 'absolute h-12 w-12 border-lima'

// Lima corner brackets that frame the QR target (A-18).
export function ScanFrame() {
	return (
		<View
			pointerEvents='none'
			accessibilityElementsHidden
			importantForAccessibility='no-hide-descendants'
			className='h-[240px] w-[240px]'
		>
			<View
				className={`${CORNER} left-0 top-0 rounded-tl-2xl border-l-4 border-t-4`}
			/>
			<View
				className={`${CORNER} right-0 top-0 rounded-tr-2xl border-r-4 border-t-4`}
			/>
			<View
				className={`${CORNER} bottom-0 left-0 rounded-bl-2xl border-b-4 border-l-4`}
			/>
			<View
				className={`${CORNER} bottom-0 right-0 rounded-br-2xl border-b-4 border-r-4`}
			/>
		</View>
	)
}
