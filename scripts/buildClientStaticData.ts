// Copyright (c) 2024 Stefan Olivier
// <https://stefanolivier.com>

import * as prettier from "prettier";
import { BUILD_DIR_CACHE, DATA_DIR } from "@common/paths.mts";
import { INFO, ERROR } from "@common/logging.mts";
import { PrefixTree, type WordMapping } from "@src/library/containers/prefixTree.ts";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { valueToString } from "@common/utilities.mts";

// -----------------------------------------------------------------------------
//
// -- @SECTION Client Config Step --
//
// -----------------------------------------------------------------------------

const clientStaticDataJsFile = resolve(BUILD_DIR_CACHE, "clientStaticData.js");

try {
    console.log(INFO, `building client static word lists dictionary file "${clientStaticDataJsFile}"`);
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

    let jsSourceCode = `export const US_TO_UK = ${valueToString(nodeRootUsToUk)};\n`;
    jsSourceCode += `export const UK_TO_US = ${valueToString(nodeRootUkToUs)};\n`;
    jsSourceCode += `export const LOCALE_PAIRS_MAPPING = { "en-us_en-gb": US_TO_UK, "en-gb_en-us": UK_TO_US };\n`;

    writeFileSync(clientStaticDataJsFile, await prettier.format(jsSourceCode, { parser: "babel" }));
}

catch (error: any) {
    console.error(ERROR, `failed to build client static word lists dictionary file @ "${clientStaticDataJsFile}" during client config build: ${error}`);
    process.exit(1);
}

// -----------------------------------------------------------------------------
