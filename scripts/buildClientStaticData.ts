// Copyright (c) 2024 Stefan Olivier
// <https://stefanolivier.com>

import { readFileSync, writeFileSync } from "node:fs";
import { resolve, basename } from "node:path";
import { PrefixTree, type WordMapping } from "@src/library/containers/prefixTree.ts";
import * as prettier from "prettier";
import {
    INFO,
    ERROR,
    BUILD_DIR_CACHE,
    DATA_DIR,
} from "./common.ts";

// Reflection Helpers
// --------------------------------------------------------------------------------

function quoteString(value: string): string {
    const stringValue = value as string;
    const punctuator = (stringValue.includes(`"`))
        ? (stringValue.includes("\n"))
            ? "`"
            : `'`
        : `"`;

    const escapedString = stringValue
        .replace(/\\/gm, `\\\\`)
        .replace(/"/gm, `\\"`)
        .replace(/\n/gm, `\\n`);

    return `${punctuator}${escapedString}${punctuator}`;
}

function stringToKeyString(value: string) {
    const validKeyString = /^[_A-z]+[_A-z0-9]*$/.test(value);
    if (validKeyString)
        return quoteString(value);
    else
        return `[${quoteString(value)}]`;
}

function valueToString(value: any): string {
    const typeOfValue = typeof value;

    if (typeOfValue === "undefined") { return "undefined"; }

    else if (typeOfValue === "boolean") { return value.toString(); }

    else if (typeOfValue === "number") { return value.toString(); }

    else if (typeOfValue === "bigint") { return value.toString() + "n"; }

    else if (typeOfValue === "function") { return value.toString(); }

    else if (typeOfValue === "string") {
        return quoteString(value);
    }

    else if (typeOfValue === "object" && value === null) { return "null"; }

    else if (typeOfValue === "object" && Array.isArray(value)) {
        let arrayString = "";
        for (const element of value as Array<any>) {
            arrayString += valueToString(element) + ", ";
        }

        return `[${arrayString}]`;
    }

    else if (typeOfValue === "object") {
        let arrayString = "";
        const keys = Object.keys(value);

        for (const k of keys) {
            arrayString += `${stringToKeyString(k)}: ${valueToString(value[k])}, `
        }

        return `{${arrayString}}`;
    }

    return "undefined";
}

// --------------------------------------------------------------------------------


// Client Config Step
// --------------------------------------------------------------------------------

const clientStaticDataJsFile = resolve(BUILD_DIR_CACHE, "clientStaticData.js");

try {
    console.log(INFO, `building client static word lists dictionary file "${clientStaticDataJsFile}"`);
    const usToUkWordListPath = resolve(DATA_DIR, "us-uk.json");
    const usToUkWordList: WordMapping = JSON.parse(readFileSync(usToUkWordListPath).toString());
    const nodeRoot = PrefixTree.fromWords(usToUkWordList).root;
    const jsSourceCode = `export const US_TO_UK = ${valueToString(nodeRoot)};\n`;
    writeFileSync(clientStaticDataJsFile, await prettier.format(jsSourceCode, { parser: "babel" }));
}

catch (error: any) {
    console.error(ERROR, `failed to build client static word lists dictionary file @ "${clientStaticDataJsFile}" during client config build: ${error}`);
    process.exit(1);
}

// --------------------------------------------------------------------------------
