import { LOCALE_PAIRS_MAPPING } from "@dictionaries";

export type Locale =
    | "en-US"
    | "en-GB";

export type LocalePair =
    `${Locale}_${Locale}` |
    `${Lowercase<Locale>}_${Lowercase<Locale>}`;

export const LOCALES: Array<Locale | Lowercase<Locale>> = [
    "en-us",
    "en-gb",
];

export function makeLocalePair(left: Locale, right: Locale): LocalePair | null {
    if (!LOCALES.includes(left) && !LOCALES.includes(left.toLowerCase() as Locale | Lowercase<Locale>)) {
        console.error(`first argument of makeLocalePair expected to be one of Locale, but got ${left}`);
        return null;
    }

    if (!LOCALES.includes(right) && !LOCALES.includes(right.toLowerCase() as Locale | Lowercase<Locale>)) {
        console.error(`second argument of makeLocalePair expected to be one of Locale, but got ${right}`);
        return null;
    }

    return `${left.toLowerCase()}_${right.toLowerCase()}` as LocalePair;
}

export function verifyLocalePair(pair: LocalePair): void {
    if (pair === null) {
        throw new Error(`unrecognised source and/or target locale`);
    }

    const [sourceLocale, targetLocale] = pair.split("_");
    if (!(pair in LOCALE_PAIRS_MAPPING)) {
        throw new Error(`there is no dictionary currently available for the locale pair "${sourceLocale}_${targetLocale}"`);
    }
}
