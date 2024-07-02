import { getDocumentValue } from "../interop/interop";

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
