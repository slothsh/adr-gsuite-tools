export enum StaticSheetName {
    NAMED_RANGE_SHEET_NAME = "__NAMED_RANGES",
    LOG_SHEET_NAME         = "__LOG",
    STORE_SHEET_NAME       = "__VARIABLES",
}

export enum StaticFileName {
    PROPERTY_STORE_JSON = "defaultProperties.json"
}

export function getDocumentValue(key: string): string | null {
    try {
        const valueStoreSheet = SpreadsheetApp
            .getActiveSpreadsheet()
            .getSheetByName(StaticSheetName.STORE_SHEET_NAME);

        if (valueStoreSheet === null) {
            return null;
            // throw new Error(`could find value store with sheet name "${StaticSheetName.STORE_SHEET_NAME}" in current spreadsheet document`);
        }

        const range = valueStoreSheet.getRange("$A$2:$B");
        if (range === null) {
            return null;
            // throw new Error(`document value store with sheet name "${StaticSheetName.STORE_SHEET_NAME}" must have exactly two columns with keys in left column and values in right column`);
        }

        const values = range.getValues();

        let value = null;
        for (const row of values) {
            const rowKey = row[0];
            if (key === rowKey) {
                value = row[1];
            }
        }

        return value;
    }

    catch (error) {
        // TODO: implement error result
        return null;
    }
}
