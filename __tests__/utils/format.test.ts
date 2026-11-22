import { expect, test } from '@jest/globals'

import { formatBytes } from '@/utils/format'

test('formatBytes picks KB, MB or GB', () => {
	expect(formatBytes(0)).toBe('0 KB')
	expect(formatBytes(820 * 1024)).toBe('820 KB')
	expect(formatBytes(4.3 * 1024 * 1024)).toBe('4.3 MB')
	expect(formatBytes(11.5 * 1024 * 1024 * 1024)).toBe('11.5 GB')
})
