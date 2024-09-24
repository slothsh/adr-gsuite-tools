import { prepareCustomDictionary } from "@src/library/utility/helpers.ts";
import { makeLocalePair, verifyLocalePair } from "@src/library/locale/locale.ts";
import { PrefixTree } from "@src/library/containers/prefixTree.ts";
import { LOCALE_PAIRS_MAPPING } from "@dictionaries";

/**
 * Convert text from US dialect to UK dialect.
 *
 * @param {string} text The target text to be converted.
 * @return The same input text with all US dialect words replaced with their UK equivalent.
 * @customfunction
 * */
function ADR_US_TO_UK(text: string, userDictionary?: Array<Array<string>>): string {
    const localePair = makeLocalePair("en-US", "en-GB");
    verifyLocalePair(localePair);

    const nodeRoot = LOCALE_PAIRS_MAPPING[localePair];
    const prefixTree = new PrefixTree(nodeRoot);

    const pairedUserDictionary = prepareCustomDictionary((userDictionary) ? userDictionary : null);
    const transposed = prefixTree.transposeText(text, pairedUserDictionary);
    return transposed;
}

/**
 * Convert text from UK dialect to US dialect.
 *
 * @param {string} text The target text to be converted.
 * @return The same input text with all UK dialect words replaced with their US equivalent.
 * @customfunction
 * */
function ADR_UK_TO_US(text: string, userDictionary?: Array<Array<string>>): string {
    const localePair = makeLocalePair("en-GB", "en-US");
    verifyLocalePair(localePair);

    const nodeRoot = LOCALE_PAIRS_MAPPING[localePair];
    const prefixTree = new PrefixTree(nodeRoot);

    const pairedUserDictionary = prepareCustomDictionary((userDictionary) ? userDictionary : null);
    const transposed = prefixTree.transposeText(text, pairedUserDictionary);
    return transposed;
}

/**
 * List only US dialect words and filter out all other words.
 *
 * @param {string} text The target text to be listed.
 * @return A comma-separated list of US dialect words.
 * @customfunction
 * */
function ADR_LIST_US(text: string, userDictionary?: Array<Array<string>>): string {
    const localePair = makeLocalePair("en-US", "en-GB");
    verifyLocalePair(localePair);

    const nodeRoot = LOCALE_PAIRS_MAPPING[localePair];
    const prefixTree = new PrefixTree(nodeRoot);

    const pairedUserDictionary = prepareCustomDictionary((userDictionary) ? userDictionary : null);
    const allWords = prefixTree.searchAllWords(text, true, pairedUserDictionary);
    return allWords.join(", ");
}

/**
 * List only UK dialect words and filter out all other words.
 *
 * @param {string} text The target text to be listed.
 * @return A comma-separated list of UK dialect words.
 * @customfunction
 * */
function ADR_LIST_UK(text: string, userDictionary?: Array<Array<string>>): string {
    const localePair = makeLocalePair("en-GB", "en-US");
    verifyLocalePair(localePair);

    const nodeRoot = LOCALE_PAIRS_MAPPING[localePair];
    const prefixTree = new PrefixTree(nodeRoot);

    const pairedUserDictionary = prepareCustomDictionary((userDictionary) ? userDictionary : null);
    const allWords = prefixTree.searchAllWords(text, true, pairedUserDictionary);
    return allWords.join(", ");
}

/**
 * List only US dialect words and convert to UK dialect, then filter out all other words.
 *
 * @param {string} text The target text to be listed and converted.
 * @return A comma-separated list of US dialect words converted UK dialect.
 * @customfunction
 * */
function ADR_LIST_US_TO_UK(text: string, userDictionary?: Array<Array<string>>): string {
    const localePair = makeLocalePair("en-US", "en-GB");
    verifyLocalePair(localePair);

    const nodeRoot = LOCALE_PAIRS_MAPPING[localePair];
    const prefixTree = new PrefixTree(nodeRoot);

    const pairedUserDictionary = prepareCustomDictionary((userDictionary) ? userDictionary : null);
    const allWords = prefixTree.searchAllWords(text, false, pairedUserDictionary);
    return allWords.join(", ");
}

/**
 * List only UK dialect words and convert to US dialect, then filter out all other words.
 *
 * @param {string} text The target text to be listed and converted.
 * @return A comma-separated list of UK dialect words converted US dialect.
 * @customfunction
 * */
function ADR_LIST_UK_TO_US(text: string, userDictionary?: Array<Array<string>>): string {
    const localePair = makeLocalePair("en-GB", "en-US");
    verifyLocalePair(localePair);

    const nodeRoot = LOCALE_PAIRS_MAPPING[localePair];
    const prefixTree = new PrefixTree(nodeRoot);

    const pairedUserDictionary = prepareCustomDictionary((userDictionary) ? userDictionary : null);
    const allWords = prefixTree.searchAllWords(text, false, pairedUserDictionary);
    return allWords.join(", ");
}

/**
 * Reveal only US dialect words and replace all other words with a specified character.
 *
 * @param {string} text The target text to be revealed.
 * @param {string} replaceOther The character to use for replacing non-US dialect words.
 * @return The input text with all US dialect words revealed and all other words redacted.
 * @customfunction
 * */
function ADR_REVEAL_US(text: string, replaceOther: string = "", userDictionary?: Array<Array<string>>): string {
    const localePair = makeLocalePair("en-US", "en-GB");
    verifyLocalePair(localePair);

    const nodeRoot = LOCALE_PAIRS_MAPPING[localePair];
    const prefixTree = new PrefixTree(nodeRoot);

    const replaceOtherChecked = (replaceOther && replaceOther !== "")
        ? replaceOther.slice(0, 1)
        : "_";

    const pairedUserDictionary = prepareCustomDictionary((userDictionary) ? userDictionary : null);
    const revealedText = prefixTree.revealAllWords(text, replaceOtherChecked, true, pairedUserDictionary);
    return revealedText;
}

/**
 * Reveal only UK dialect words and replace all other words with a specified character.
 *
 * @param {string} text The target text to be revealed.
 * @param {string} replaceOther The character to use for replacing non-UK dialect words.
 * @return The input text with all UK dialect words revealed and all other words redacted.
 * @customfunction
 * */
function ADR_REVEAL_UK(text: string, replaceOther: string = "", userDictionary?: Array<Array<string>>): string {
    const localePair = makeLocalePair("en-GB", "en-US");
    verifyLocalePair(localePair);

    const nodeRoot = LOCALE_PAIRS_MAPPING[localePair];
    const prefixTree = new PrefixTree(nodeRoot);

    const replaceOtherChecked = (replaceOther && replaceOther !== "")
        ? replaceOther.slice(0, 1)
        : "_";

    const pairedUserDictionary = prepareCustomDictionary((userDictionary) ? userDictionary : null);
    const revealedText = prefixTree.revealAllWords(text, replaceOtherChecked, true, pairedUserDictionary);
    return revealedText;
}

/**
 * Reveal and convert US dialect words to UK dialect, then replace all other words with a specified character.
 *
 * @param {string} text The target text to be revealed and converted.
 * @param {string} replaceOther The character to use for replacing non-US dialect words.
 * @return The input text with all US dialect words revealed and converted to UK dialect, and all other words redacted.
 * @customfunction
 * */
function ADR_REVEAL_US_TO_UK(text: string, replaceOther: string = "", userDictionary?: Array<Array<string>>): string {
    const localePair = makeLocalePair("en-US", "en-GB");
    verifyLocalePair(localePair);

    const nodeRoot = LOCALE_PAIRS_MAPPING[localePair];
    const prefixTree = new PrefixTree(nodeRoot);

    const replaceOtherChecked = (replaceOther && replaceOther !== "")
        ? replaceOther.slice(0, 1)
        : "_";

    const pairedUserDictionary = prepareCustomDictionary((userDictionary) ? userDictionary : null);
    const revealedText = prefixTree.revealAllWords(text, replaceOtherChecked, false, pairedUserDictionary);
    return revealedText;
}

/**
 * Reveal and convert UK dialect words to US dialect, then replace all other words with a specified character.
 *
 * @param {string} text The target text to be revealed and converted.
 * @param {string} replaceOther The character to use for replacing non-UK dialect words.
 * @return The input text with all UK dialect words revealed and converted to US dialect, and all other words redacted.
 * @customfunction
 * */
function ADR_REVEAL_UK_TO_US(text: string, replaceOther: string = "", userDictionary?: Array<Array<string>>): string {
    const localePair = makeLocalePair("en-GB", "en-US");
    verifyLocalePair(localePair);

    const nodeRoot = LOCALE_PAIRS_MAPPING[localePair];
    const prefixTree = new PrefixTree(nodeRoot);

    const replaceOtherChecked = (replaceOther && replaceOther !== "")
        ? replaceOther.slice(0, 1)
        : "_";

    const pairedUserDictionary = prepareCustomDictionary((userDictionary) ? userDictionary : null);
    const revealedText = prefixTree.revealAllWords(text, replaceOtherChecked, false, pairedUserDictionary);
    return revealedText;
}
