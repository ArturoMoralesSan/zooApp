import { describe, expect, test } from '@jest/globals'

import { CREDITS_DRAFT } from '@/services/creditsDraft'
import { groupByAsset, groupByLicense, licenseSummary } from '@/utils/credits'

const [jaguar] = CREDITS_DRAFT.data

describe('groupByAsset', () => {
	test('keeps the server order and puts "Incluye" with its asset', () => {
		const groups = groupByAsset(jaguar.credits)

		expect(groups.map((group) => group.asset)).toEqual([
			'artwork',
			'thumbnail',
			'model',
		])
		expect(groups[1].credits.map((credit) => credit.role)).toEqual([
			'origin',
			'component',
		])
	})
})

describe('groupByLicense', () => {
	test('joins one licence sent under two names, most used first', () => {
		const groups = groupByLicense(CREDITS_DRAFT.data, (s) => s.card.name)

		expect(groups[0].license).toMatchObject({
			short_name: 'CC BY 4.0',
			name: 'Creative Commons Atribución 4.0',
		})
		expect(groups[0].uses.map((use) => use.cardName)).toEqual([
			'Jaguar',
			'Hipopótamo',
		])
		// 7 credits, 6 licences once CC BY 4.0 is merged.
		expect(groups).toHaveLength(6)
	})
})

test('licenseSummary tells CC BY-SA from CC BY', () => {
	const [byShare, by] = ['CC BY-SA 4.0', 'CC BY 4.0'].map((short_name) =>
		licenseSummary({ short_name, name: short_name, url: null }),
	)

	expect(byShare).toMatch(/misma licencia/)
	expect(by).not.toMatch(/misma licencia/)
})
