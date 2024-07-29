// Copyright (c) 2024 Stefan Olivier
// <https://stefanolivier.com>

import { existsSync, writeFileSync } from "node:fs";
import { resolve, basename } from "node:path";
import esbuild from "esbuild";
import fg from "fast-glob";
import {
    Config,
    INFO,
    ERROR,
    BUILD_DIR_CACHE,
    SRC_MARKDOWN_DIR,
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

const clientTsConfigFile = resolve(BUILD_DIR_CACHE, "clientConfig.ts");
const clientJsConfigFile = resolve(BUILD_DIR_CACHE, "clientConfig.js");

try {
    console.log(INFO, `building client config file "${clientJsConfigFile}"`);

    // Production Environment
    const config = [
        { symbolName: "VERSION",                   value: Config.VERSION },
        { symbolName: "VERSION_MAJOR",             value: Config.VERSION_MAJOR },
        { symbolName: "VERSION_MINOR",             value: Config.VERSION_MINOR },
        { symbolName: "VERSION_SUB",               value: Config.VERSION_SUB },
        { symbolName: "COMMIT_HASH",               value: Config.COMMIT_HASH },
        { symbolName: "AUTHOR",                    value: Config.AUTHOR },
        { symbolName: "AUTHOR_EMAIL",              value: Config.AUTHOR_EMAIL },
        { symbolName: "AUTHOR_WEBSITE",            value: Config.AUTHOR_WEBSITE },
        { symbolName: "PROJECT_NAME",              value: Config.PROJECT_NAME },
        { symbolName: "PROJECT_DESCRIPTION",       value: Config.PROJECT_DESCRIPTION },
        { symbolName: "LICENSE",                   value: Config.LICENSE },
        { symbolName: "LICENSE_TYPE",              value: Config.LICENSE_TYPE },
    ];

    // Development Environment
    if (Config.ENVIRONMENT === "DEVELOPMENT") {
        config.push(
            { symbolName: "LICENSE_FILE_PATH",         value: Config.LICENSE_FILE_PATH },
            { symbolName: "ENVIRONMENT",               value: Config.ENVIRONMENT },
            { symbolName: "PACKAGE_CONFIG_PATH",       value: Config.PACKAGE_CONFIG_PATH },
            { symbolName: "PACKAGE_CONFIG",            value: Config.PACKAGE_CONFIG },
            { symbolName: "DEVELOPMENT_HOST_URL",      value: Config.DEVELOPMENT_HOST_URL },
            { symbolName: "DEVELOPMENT_HOST_PORT",     value: Config.DEVELOPMENT_HOST_PORT },
            { symbolName: "DEVELOPMENT_MARKDOWN_PATH", value: Config.DEVELOPMENT_MARKDOWN_PATH },
        );
    }

    let tsSourceCode = "";
    for (const { symbolName, value } of config) {
        tsSourceCode += `    export const ${symbolName} = ${valueToString(value)};\n`;
    }

    tsSourceCode = `export namespace Config {\n${tsSourceCode}\n}`;

    writeFileSync(clientTsConfigFile, tsSourceCode);

    if (existsSync(clientTsConfigFile)) {
        const buildOptions: esbuild.BuildOptions = {
            entryPoints: [clientTsConfigFile],
            outfile: clientJsConfigFile,
            format: "esm",
            bundle: true,
            treeShaking: false,
        };

        console.log(INFO, `writing client config file "${clientJsConfigFile}"`);
        // @ts-ignore
        esbuild.buildSync(buildOptions);
    } else {
        throw new Error("an error occurred during writing of client TypeScript config file");
    }
}

catch (error: any) {
    console.error(ERROR, `failed to build client config file @ "${clientJsConfigFile}" during client config build`);
    process.exit(1);
}

// --------------------------------------------------------------------------------


// Client HtmlFiles Step
// --------------------------------------------------------------------------------

const clientTsHtmlFileNamesFile = resolve(BUILD_DIR_CACHE, "clientHtmlFiles.ts");
const clientJsHtmlFileNamesFile = resolve(BUILD_DIR_CACHE, "clientHtmlFiles.js");

try {
    console.log(INFO, `building client HTML file names file "${clientJsConfigFile}"`);

    const markupFiles = fg.sync([
            resolve(SRC_MARKDOWN_DIR, "**/*.html"),
        ])
        .map((path: string) => {
            return { symbolName: basename(path, ".html").toString().toUpperCase(), value: basename(path) };
        });

    let tsSourceCode = "";
    for (const { symbolName, value } of markupFiles) {
        tsSourceCode += `    export const ${symbolName} = ${valueToString(value)};\n`;
    }

    tsSourceCode = `export namespace HtmlFiles {\n${tsSourceCode}\n}`;

    writeFileSync(clientTsHtmlFileNamesFile, tsSourceCode);

    if (existsSync(clientTsHtmlFileNamesFile)) {
        const buildOptions: esbuild.BuildOptions = {
            entryPoints: [clientTsHtmlFileNamesFile],
            outfile: clientJsHtmlFileNamesFile,
            format: "esm",
            bundle: true,
            treeShaking: false,
        };

        console.log(INFO, `writing client HTML file names file "${clientJsHtmlFileNamesFile}"`);
        // @ts-ignore
        esbuild.buildSync(buildOptions);
    } else {
        throw new Error("an error occurred during writing of client TypeScript HTML file names file");
    }
}

catch (error: any) {
    console.error(ERROR, `failed to build client environment file @ "${clientJsConfigFile}" during client environment build`);
    process.exit(1);
}

// --------------------------------------------------------------------------------
