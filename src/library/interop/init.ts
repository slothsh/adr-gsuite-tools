import { type KeyStringValue, type KeyDefault } from "../utility/types";
import { StaticFileName, StaticSheetName } from "./interop";

interface DefaultProperties {
    document: Array<KeyDefault>
}

export function configureDocumentEnvironment(): void {
    const documentProperties = PropertiesService.getDocumentProperties();
    documentProperties.deleteAllProperties();

    const defaultEnvironmentConfig = loadDefaultEnvironementConfig();
    const currentDocumentConfig = fetchEnvironmentConfigFromDocument();

    const mergedConfig = defaultEnvironmentConfig
        .document
        .reduce((acc: KeyStringValue, value: KeyDefault) => {
            if (!(value.key in acc) || acc[value.key] === "__default__") {
                acc[value.key] = value.default;
            }

            return acc;
        }, currentDocumentConfig)

    documentProperties.setProperties(mergedConfig);
}

export function loadDefaultEnvironementConfig(): DefaultProperties {
    // TODO: error handling
    return JSON.parse(
        HtmlService.createHtmlOutputFromFile(StaticFileName.PROPERTY_STORE_JSON)
            .getContent()
    );
}

export function fetchEnvironmentConfigFromDocument(): KeyStringValue {
    const devSheet = SpreadsheetApp
        .getActive()
        .getSheetByName(StaticSheetName.STORE_SHEET_NAME);

    if (devSheet === null) {
        throw new Error(`failed to fetch sheet store sheet with name "${StaticSheetName.STORE_SHEET_NAME}", please verify that`);
    }

    const totalRows = devSheet.getMaxRows();

    const devSheetValues: string[][] = devSheet
        .getSheetValues(2, 1, totalRows - 1, 2);

    const allowedKeys = loadDefaultEnvironementConfig()
        .document
        .map((v: KeyDefault) => {
            return v.key;
        });

    const currentConfig = {};
    for (const r of devSheetValues) {
        let keyFound = false;

        for (const a of allowedKeys) {
            if (r[0] === a) {
                currentConfig[r[0]] = r[1];
                keyFound = true;
                break;
            }
        }

        if (!keyFound)
            console.log(`warning: unrecognized config key "${r[0]}" with value "${r[1]}"`);
    }

    return currentConfig;
}
