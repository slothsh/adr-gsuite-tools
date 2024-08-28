// Copyright (c) 2024 Stefan Olivier
// <https://stefanolivier.com>

import esbuild from "esbuild";
import fg from "fast-glob";
import { BUILD_DIR_CACHE, SRC_MARKDOWN_DIR, } from "@common/paths.mts";
import { Config } from "@common/config.mts";
import { INFO, ERROR } from "@common/logging.mts";
import { existsSync, writeFileSync } from "node:fs";
import { resolve, basename } from "node:path";
import { valueToString } from "@common/utilities.mts";

// -----------------------------------------------------------------------------
//
// -- @SECTION Client Config Step --
//
// -----------------------------------------------------------------------------

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
            logLevel: "silent",
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

// -----------------------------------------------------------------------------


// -----------------------------------------------------------------------------
//
// -- @SECTION Client HtmlFiles Step --
//
// -----------------------------------------------------------------------------

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
            logLevel: "silent",
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

// -----------------------------------------------------------------------------
