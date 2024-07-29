import { type Locale, type LocalePair, makeLocalePair, verifyLocalePair } from "@src/library/locale/locale.ts";
import { PrefixTree } from "@src/library/containers/prefixTree.ts";
import { LOCALE_PAIRS_MAPPING } from "@dictionaries";
import { getDocumentValue } from "../interop/interop.ts";

function GET_SHEET_GID(sheetName: string): number | null {
    const sheet = SpreadsheetApp
        .getActive()
        .getSheetByName(sheetName);

    if (sheet !== null)
        return sheet.getSheetId();

    return null;
}

function GET_STORE_VALUE(key: string): string | null {
    return getDocumentValue(key);
}

/**
 * @param word
 * @param [sourceLocale="en-US"]
 * @param [targetLocal="en-GB"]
 * @customfunction
 * */
function TRANSPOSE_WORD(word: string,
                        sourceLocale: Locale = "en-US",
                        targetLocale: Locale = "en-GB"): string {
    const localePair = makeLocalePair(sourceLocale, targetLocale);
    verifyLocalePair(localePair);

    const nodeRoot = LOCALE_PAIRS_MAPPING[localePair];
    const prefixTree = new PrefixTree(nodeRoot);

    const match = prefixTree.searchWord(word);
    if (match === null) return word;
    return match;
}

/**
 * @param text
 * @param [sourceLocale="en-US"]
 * @param [targetLocal="en-GB"]
 * @customfunction
 * */
function TRANSPOSE_TEXT(text: string,
                        sourceLocale: Locale = "en-US",
                        targetLocale: Locale = "en-GB"): string {
    const localePair = makeLocalePair(sourceLocale, targetLocale);
    verifyLocalePair(localePair);

    const nodeRoot = LOCALE_PAIRS_MAPPING[localePair];
    const prefixTree = new PrefixTree(nodeRoot);

    const transposed = prefixTree.transposeText(text);
    return transposed;
}

/**
 * @param text
 * @param [sourceLocale="en-US"]
 * @param [targetLocal="en-GB"]
 * @customfunction
 * */
function LIST_LOCALE_WORDS(text: string,
                           showSource: boolean = false,
                           sourceLocale: Locale = "en-US",
                           targetLocale: Locale = "en-GB"): string {
    const localePair = makeLocalePair(sourceLocale, targetLocale);
    verifyLocalePair(localePair);

    const nodeRoot = LOCALE_PAIRS_MAPPING[localePair];
    const prefixTree = new PrefixTree(nodeRoot);

    const allWords = prefixTree.searchAllWords(text, showSource);
    return allWords.join(", ");
}

/**
 * @param text
 * @param [sourceLocale="en-US"]
 * @param [targetLocal="en-GB"]
 * @customfunction
 * */
function REVEAL_LOCALE_WORDS(text: string,
                           showSource: boolean = false,
                           sourceLocale: Locale = "en-US",
                           targetLocale: Locale = "en-GB"): string {
    const localePair = makeLocalePair(sourceLocale, targetLocale);
    verifyLocalePair(localePair);

    const nodeRoot = LOCALE_PAIRS_MAPPING[localePair];
    const prefixTree = new PrefixTree(nodeRoot);

    const revealedText = prefixTree.revealAllWords(text, "_", showSource);
    return revealedText;
}
