import { useSafeAreaInsets } from 'react-native-safe-area-context'

// The floating tab bar sits 16px from the bottom edge, or 16px above the
// system navigation bar when there is one (edge-to-edge on Android).
const TAB_BAR_BOTTOM_GAP = 16

export function getTabBarBottomPadding(bottomInset: number) {
	return TAB_BAR_BOTTOM_GAP + bottomInset
}

// Extra space tab screens need below their content so it can scroll past
// the taller tab bar when a system navigation bar is present.
export function getTabBarExtraSpace(bottomInset: number) {
	return getTabBarBottomPadding(bottomInset) - TAB_BAR_BOTTOM_GAP
}

// Fixed footers (FixedFooter, FooterLoadingBar) keep this design padding
// above the system navigation bar.
export const FOOTER_BOTTOM_PADDING = 16

export function getFooterBottomPadding(bottomInset: number) {
	return FOOTER_BOTTOM_PADDING + bottomInset
}

// Height of FixedFooter without the inset, plus a 24px gap, so the last item
// of a scroll view can scroll above it.
const FIXED_FOOTER_SPACE = 168

export function getFixedFooterSpace(bottomInset: number) {
	return FIXED_FOOTER_SPACE + bottomInset
}

// Bottom padding for a scroll view on a screen with a fixed footer.
export function useFixedFooterSpace() {
	const insets = useSafeAreaInsets()

	return getFixedFooterSpace(insets.bottom)
}

// Bottom padding for a scroll view that reaches the bottom edge, so its last
// item can scroll above the system navigation bar.
export function useScrollBottomSpace(base: number) {
	const insets = useSafeAreaInsets()

	return base + insets.bottom
}

// Gap between floating map cards and the bottom edge (or the navigation bar).
const FLOATING_CARD_GAP = 16

export function getFloatingBottom(bottomInset: number) {
	return FLOATING_CARD_GAP + bottomInset
}
