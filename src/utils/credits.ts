import type {
	Credit,
	CreditAsset,
	CreditLicense,
	CreditsSection,
} from '@/types/credits'

export type AssetGroup = {
	asset: CreditAsset
	label: string
	credits: Credit[]
}

// A card's credits by asset, in the server's order (artwork, thumbnail,
// model; origin first inside each).
export function groupByAsset(credits: Credit[]): AssetGroup[] {
	const groups: AssetGroup[] = []

	for (const credit of credits) {
		const last = groups.at(-1)

		if (last?.asset === credit.asset) {
			last.credits.push(credit)
		} else {
			groups.push({
				asset: credit.asset,
				label: credit.asset_label,
				credits: [credit],
			})
		}
	}

	return groups
}

export type LicenseUse = { credit: Credit; cardName: string }

export type LicenseGroup = {
	key: string
	license: CreditLicense
	uses: LicenseUse[]
}

// Every licence in use and the works under it, most used first. `cardName`
// lets the caller hide the names of cards not won yet.
export function groupByLicense(
	sections: CreditsSection[],
	cardName: (section: CreditsSection) => string,
): LicenseGroup[] {
	const groups = new Map<string, LicenseGroup>()

	for (const section of sections) {
		for (const credit of section.credits) {
			// The same licence can come with different names (Meshy's free plan
			// is CC BY 4.0): its official text is what identifies it.
			const key =
				credit.license.url ??
				`${credit.license.short_name}|${credit.license.name}`
			const group = groups.get(key) ?? {
				key,
				license: credit.license,
				uses: [],
			}

			// The plainest name stands for the group.
			if (credit.license.name.length < group.license.name.length) {
				group.license = credit.license
			}

			group.uses.push({ credit, cardName: cardName(section) })
			groups.set(key, group)
		}
	}

	return [...groups.values()].sort(
		(a, b) =>
			b.uses.length - a.uses.length ||
			a.license.short_name.localeCompare(b.license.short_name),
	)
}

// What a licence allows, in plain words. Only a summary: the official text
// is the licence's URL.
export function licenseSummary(license: CreditLicense): string {
	const name = license.short_name

	if (name.startsWith('CC0') || /dominio público/i.test(license.name)) {
		return 'Dominio público: cualquiera puede usar la obra sin pedir permiso ni citar a su autor.'
	}
	if (name.startsWith('CC BY-SA')) {
		return 'Se puede usar y modificar citando al autor. Lo que se haga a partir de ella se comparte con la misma licencia.'
	}
	if (name.startsWith('CC BY')) {
		return 'Se puede usar y modificar, también con fines comerciales, citando al autor.'
	}
	if (name.startsWith('IA')) {
		return 'Imagen generada con inteligencia artificial, usada según los términos de la herramienta.'
	}
	if (/propia|encargo/i.test(license.name)) {
		return 'Obra hecha para ZooApp por su equipo o por encargo.'
	}

	return 'Licencia de la plataforma de origen: permite usar la obra en la app sin obligación de citar al autor.'
}
