// Copyright (c) 2024 Stefan Olivier
// <https://stefanolivier.com>

import { readFileSync } from "node:fs";
import { basename, resolve } from "node:path";
import fg from "fast-glob";
import {
    INFO,
    ERROR,
    SRC_LIBRARY_DIR,
    BUILD_DIR_LIBRARY,
    compileGasBundle,
    compileGas,
    injectLicense,
    writeCompilationUnit,
    type TsCompilationUnit,
} from "./common.ts";

// Compilation Units
// --------------------------------------------------------------------------------

const compilationUnits: Array<TsCompilationUnit> = fg.sync(resolve(SRC_LIBRARY_DIR, "**/*.ts"))
    .map((sourceFile: string) => {
        const sourceCode = readFileSync(sourceFile, "utf-8").toString();
        return {
            file: sourceFile,
            originalSource: sourceCode,
            compiledSource: sourceCode,
            extension: "ts",

            output: [
                {
                    name: basename(sourceFile, ".ts"),
                    extension: "gs",
                    directory: BUILD_DIR_LIBRARY,
                },
            ],

            compile: [
                [compileGasBundle, `compiling GAS bundle: "${sourceFile}"`],
            ],

            postCompile: [
                [compileGas, `compiling to GAS: "${sourceFile}"`],
                [injectLicense, `injecting license into: "${sourceFile}"`],
            ],
        };
    });

// --------------------------------------------------------------------------------


// Pre-Compilation Step
// --------------------------------------------------------------------------------

for (const unit of compilationUnits) {
    if (unit.preCompile) {
        for (const [preCompile, context] of unit.preCompile) {
            console.log(INFO, context);
            const result = await preCompile(unit);
            if (result.error()) {
                console.error(ERROR, result.context());
                process.exit(1);
            }
        }
    }
}

// --------------------------------------------------------------------------------


// Compilation Step
// --------------------------------------------------------------------------------

for (const unit of compilationUnits) {
    for (const [compile, context] of unit.compile) {
        console.log(INFO, context);
        const result = await compile(unit);
        if (result.error()) {
            console.error(ERROR, result.context());
            process.exit(1);
        }
    }
}

// --------------------------------------------------------------------------------


// Post-Compilation Step
// --------------------------------------------------------------------------------

for (const unit of compilationUnits) {
    if (unit.postCompile) {
        for (const [postCompile, context] of unit.postCompile) {
            console.log(INFO, context);
            const result = await postCompile(unit);
            if (result.error()) {
                console.error(ERROR, result.context());
                process.exit(1);
            }
        }
    }
}

// --------------------------------------------------------------------------------


// Write Output Step
// --------------------------------------------------------------------------------

for (const unit of compilationUnits) {
    for (const outputItem of unit.output) {
        const outputFile = `${resolve(outputItem.directory.toString(), outputItem.name)}.${outputItem.extension}`;
        console.log(INFO, "writing output:", outputFile);
        const result = writeCompilationUnit(unit, outputFile);
        if (result.error()) {
            console.error(ERROR, result.context());
            process.exit(1);
        }
    }
}

// --------------------------------------------------------------------------------
