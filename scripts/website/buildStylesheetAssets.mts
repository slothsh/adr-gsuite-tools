import fg from "fast-glob";
import { INFO, Result, Ok } from "@common/logging.mts";
import { BUILD_DIR_WEBSITE, WEBSITE_ASSETS_DIR, WEBSITE_ROUTES_DIR } from "@common/paths.mts";
import { basename, dirname, resolve, relative } from "node:path";
import { readFileSync } from "node:fs";
import {
    compileCssBundle,
    writeCompilationUnit,
    prettyCss,
    type CssCompilationUnit,
} from "@common/compilation.mts";

// -----------------------------------------------------------------------------
//
// -- @SECTION Compilation Units --
//
// -----------------------------------------------------------------------------

const STYLESHEETS_FILE_PATHS = fg
    .sync([ resolve(WEBSITE_ASSETS_DIR, "**/*.scss"), ]);
    
const compilationUnits: Array<CssCompilationUnit> = STYLESHEETS_FILE_PATHS
    .map((sourceFile: string) => {
        const sourceCode = readFileSync(sourceFile, "utf-8").toString();
        const outputDirectory = resolve(BUILD_DIR_WEBSITE, "routes", "assets", relative(WEBSITE_ASSETS_DIR, dirname(sourceFile)));

        return {
            file: sourceFile,
            originalSource: sourceCode,
            compiledSource: sourceCode,
            extension: "scss",

            output: [
                {
                    name: basename(sourceFile, ".scss"),
                    extension: "css",
                    directory: outputDirectory,
                },
            ],

            compile: [
                [compileCssBundle, `compiling CSS bundle: "${sourceFile}"`],
            ],

            preCompile: [],

            postCompile: [
                [prettyCss, `formatting pretty css: "${sourceFile}"`],
            ],
        };
    });

// -----------------------------------------------------------------------------


// -----------------------------------------------------------------------------
//
// -- @SECTION Build Website CSS Assets --
//
// -----------------------------------------------------------------------------

export default async function (): Promise<Result> {
    // Pre-Compilation Step
    for (const unit of compilationUnits) {
        if (unit.preCompile) {
            for (const [preCompile, context] of unit.preCompile) {
                console.log(INFO, context);
                const result = await preCompile(unit);
                if (result.error()) {
                    return result;
                }
            }
        }
    }

    // Compilation Step
    for (const unit of compilationUnits) {
        for (const [compile, context] of unit.compile) {
            console.log(INFO, context);
            const result = await compile(unit);
            if (result.error()) {
                return result;
            }
        }
    }

    // Post-Compilation Step
    for (const unit of compilationUnits) {
        if (unit.postCompile) {
            for (const [postCompile, context] of unit.postCompile) {
                console.log(INFO, context);
                const result = await postCompile(unit);
                if (result.error()) {
                    return result;
                }
            }
        }
    }

    // Write Output Step
    for (const unit of compilationUnits) {
        for (const outputItem of unit.output) {
            const outputFile = `${resolve(outputItem.directory.toString(), outputItem.name)}.${outputItem.extension}`;
            console.log(INFO, "writing output:", outputFile);
            const result = await writeCompilationUnit(unit, outputFile);
            if (result.error()) {
                return result;
            }
        }
    }

    return Ok();
}

// -----------------------------------------------------------------------------
