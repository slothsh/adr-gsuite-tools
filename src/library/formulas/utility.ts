import { PrefixTree } from "@src/library/containers/prefixTree.ts";
import { US_TO_UK } from "@dictionaries";
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


function TRANSPOSE_WORD(word: string): string {
    const prefixTree = new PrefixTree(US_TO_UK);
    const match = prefixTree.searchWord(word);
    if (match === null) return word;
    return match;
}
