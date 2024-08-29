import fg from "fast-glob";
import { INFO, Result, Ok, ERROR } from "@common/logging.mts";
import { BUILD_DIR_WEBSITE, WEBSITE_ROUTES_DIR } from "@common/paths.mts";
import { basename, dirname, resolve, relative } from "node:path";
import { initializeHandlebars } from "@common/handlebars.mts";
import { readFileSync } from "node:fs";
import {
    writeCompilationUnit,
    compileMarkdownTemplate,
    injectMarkdownCss,
    injectMarkdownJs,
    scriptsForMarkownTemplate,
    stylesForMarkdownTemplate,
    prettyHtml,
    type MarkdownCompilationUnit,
} from "@common/compilation.mts";

// -----------------------------------------------------------------------------
//
// -- @SECTION Compilation Units --
//
// -----------------------------------------------------------------------------

const MARKUP_ROUTES_FILE_PATHS = fg
    .sync([ resolve(WEBSITE_ROUTES_DIR, "**/*.html"), ]);

const compilationUnits: Array<MarkdownCompilationUnit> = MARKUP_ROUTES_FILE_PATHS
    .map((sourceFile: string) => {
        const sourceCode = readFileSync(sourceFile, "utf-8").toString();
        const outputDirectory = resolve(BUILD_DIR_WEBSITE, "routes", relative(WEBSITE_ROUTES_DIR, dirname(sourceFile)));

        return {
            file: sourceFile,
            originalSource: sourceCode,
            compiledSource: sourceCode,
            extension: "html",

            output: [
                {
                    name: basename(sourceFile, ".html"),
                    extension: "html",
                    directory: outputDirectory,
                },
            ],

            compile: [
                [compileMarkdownTemplate, `compiling markdown template: "${sourceFile}"`],
            ],

            preCompile: [
                [scriptsForMarkownTemplate, `searching for markdown template script: "${sourceFile}"`],
                [stylesForMarkdownTemplate, `searching for markdown style sheet: "${sourceFile}"`],
            ],

            postCompile: [
                [injectMarkdownCss, `injecting CSS styling: "${sourceFile}"`],
                [injectMarkdownJs, `injecting javascript: "${sourceFile}"`],
                [prettyHtml, `formatting pretty html: "${sourceFile}"`],
            ],
        };
    });

// -----------------------------------------------------------------------------


// -----------------------------------------------------------------------------
//
// -- @SECTION Build Markdown --
//
// -----------------------------------------------------------------------------

export default async function (): Promise<Result> {
    // Build Initialization
    {
        const result = initializeHandlebars();
        if (result.error()) {
            return result;
        }
    }

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

    // Markdown Style Sheet Compilation Step
    for (const unit of compilationUnits) {
        if (unit.markdownStyles!) {
            for (const markdownStyle of unit.markdownStyles) {
                if (markdownStyle.preCompile) {
                    for (const [preCompile, context] of markdownStyle.preCompile) {
                        console.log(INFO, context);
                        const result = await preCompile(markdownStyle);
                        if (result.error()) {
                            return result;
                        }
                    }
                }

                for (const [compile, context] of markdownStyle.compile) {
                    console.log(INFO, context);
                    const result = await compile(markdownStyle);
                    if (result.error()) {
                        return result;
                    }
                }

                if (markdownStyle.postCompile) {
                    for (const [postCompile, context] of markdownStyle.postCompile) {
                        console.log(INFO, context);
                        const result = await postCompile(markdownStyle);
                        if (result.error()) {
                            return result;
                        }
                    }
                }
            }
        }
    }

    // Markdown Script Compilation Step
    for (const unit of compilationUnits) {
        if (unit.markdownScript!.preCompile) {
            for (const [preCompile, context] of unit.markdownScript!.preCompile) {
                console.log(INFO, context);
                const result = await preCompile(unit.markdownScript!);
                if (result.error()) {
                    return result;
                }
            }
        }

        for (const [compile, context] of unit.markdownScript!.compile) {
            console.log(INFO, context);
            const result = await compile(unit.markdownScript!);
            if (result.error()) {
                return result;
            }
        }

        if (unit.markdownScript!.postCompile) {
            for (const [postCompile, context] of unit.markdownScript!.postCompile) {
                console.log(INFO, context);
                const result = await postCompile(unit.markdownScript!);
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
