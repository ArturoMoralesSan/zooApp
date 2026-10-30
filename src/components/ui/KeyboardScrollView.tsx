import { cssInterop } from 'nativewind'
import type { ComponentProps } from 'react'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'

// NativeWind only maps className on components it knows about.
cssInterop(KeyboardAwareScrollView, {
	className: 'style',
	contentContainerClassName: 'contentContainerStyle',
})

type KeyboardScrollViewProps = ComponentProps<typeof KeyboardAwareScrollView>

// Scroll view for any screen with inputs: when a field gets focus it scrolls
// it into view above the keyboard (react-native-keyboard-controller, as
// recommended by Expo's keyboard handling guide). bottomOffset leaves room
// for the field's error text below the caret.
export function KeyboardScrollView({
	bottomOffset = 48,
	keyboardShouldPersistTaps = 'handled',
	keyboardDismissMode = 'interactive',
	showsVerticalScrollIndicator = false,
	...props
}: KeyboardScrollViewProps) {
	return (
		<KeyboardAwareScrollView
			bottomOffset={bottomOffset}
			keyboardShouldPersistTaps={keyboardShouldPersistTaps}
			keyboardDismissMode={keyboardDismissMode}
			showsVerticalScrollIndicator={showsVerticalScrollIndicator}
			{...props}
		/>
	)
}
