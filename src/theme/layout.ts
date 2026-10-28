// Gap between the floating tab bar and the bottom edge when there is no
// system navigation bar.
const TAB_BAR_BOTTOM_GAP = 22

// With edge-to-edge on Android the app draws behind the system navigation
// bar, so the tab bar sits 8px above it (bottomInset) instead.
export function getTabBarBottomPadding(bottomInset: number) {
	return Math.max(TAB_BAR_BOTTOM_GAP, bottomInset + 8)
}

// Extra space tab screens need below their content so it can scroll past
// the taller tab bar when a system navigation bar is present.
export function getTabBarExtraSpace(bottomInset: number) {
	return getTabBarBottomPadding(bottomInset) - TAB_BAR_BOTTOM_GAP
}
