import * as prettier from "prettier";
import { BUILD_DIR_CACHE, DATA_DIR } from "@common/paths.mts";
import { INFO, Result, Ok, Err } from "@common/logging.mts";
import { PrefixTree, type WordMapping } from "@src/library/containers/prefixTree.ts";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { valueToString } from "@common/utilities.mts";

// -----------------------------------------------------------------------------
//
// -- @SECTION Run-Time Static Data --
//
// -----------------------------------------------------------------------------

const CLIENT_STATIC_DATA_JS_FILE = resolve(BUILD_DIR_CACHE, "clientStaticData.js");

export default async function(): Promise<Result> {
    try {
        console.log(INFO, `building client static word lists dictionary file "${CLIENT_STATIC_DATA_JS_FILE}"`);
        const usToUkWordListPath = resolve(DATA_DIR, "us-uk.json");
        const usToUkWordList: WordMapping = JSON.parse(readFileSync(usToUkWordListPath).toString());
        const uktoUsWordList = Object.fromEntries(
            Object.entries(usToUkWordList)
                .map(([key, value]) => {
                    return [value, key];
                })
        );

        const nodeRootUsToUk = PrefixTree.fromWords(usToUkWordList).root;
        const nodeRootUkToUs = PrefixTree.fromWords(uktoUsWordList).root;

        // TODO: Better solution than manual string building
        let jsSourceCode = `export const US_TO_UK = ${valueToString(nodeRootUsToUk)};\n`;
        jsSourceCode += `export const UK_TO_US = ${valueToString(nodeRootUkToUs)};\n`;
        jsSourceCode += `export const LOCALE_PAIRS_MAPPING = { "en-us_en-gb": US_TO_UK, "en-gb_en-us": UK_TO_US };\n`;

        writeFileSync(CLIENT_STATIC_DATA_JS_FILE, await prettier.format(jsSourceCode, { parser: "babel" }));
    }

    catch (error: any) {
        return Err(`failed to build client static word lists dictionary file @ "${CLIENT_STATIC_DATA_JS_FILE}" during client config build: ${error}`);
    }

    return Ok();
}

// -----------------------------------------------------------------------------
