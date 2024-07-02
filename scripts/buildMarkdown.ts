// Copyright (c) 2024 Stefan Olivier
// <https://stefanolivier.com>

import { readFileSync } from "node:fs";
import { basename, resolve } from "node:path";
import fg from "fast-glob";
import {
    INFO,
    ERROR,
    SRC_MARKDOWN_DIR,
    BUILD_DIR_MARKDOWN,
    writeCompilationUnit,
    compileMarkdownTemplate,
    injectMarkdownCss,
    injectMarkdownJs,
    injectLicense,
    scriptsForMarkownTemplate,
    stylesForMarkdownTemplate,
    prettyHtml,
    initializeHandlebars,
    type MarkdownCompilationUnit,
} from "./common";

// Markdown Templates Step
// --------------------------------------------------------------------------------

// @ts-ignore
export const markupSourceFilePaths = fg.sync([
    resolve(SRC_MARKDOWN_DIR, "**/*.html"),
]);

const compilationUnits: Array<MarkdownCompilationUnit> = markupSourceFilePaths
    .map((sourceFile: string) => {
        const sourceCode = readFileSync(sourceFile, "utf-8").toString();
        return {
            file: sourceFile,
            originalSource: sourceCode,
            compiledSource: sourceCode,
            extension: "html",

            output: [
                {
                    name: basename(sourceFile, ".html"),
                    extension: "html",
                    directory: BUILD_DIR_MARKDOWN,
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
                [injectLicense, `injecting license into: "${sourceFile}"`],
                [prettyHtml, `formatting pretty html: "${sourceFile}"`],
            ],
        };
    });

// --------------------------------------------------------------------------------


// Build Initialization
// --------------------------------------------------------------------------------

{
    const result = initializeHandlebars();
    if (result.error()) {
        console.error(ERROR, result.context());
        process.exit(1);
    }
}

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


// Markdown Style Sheet Compilation Step
// --------------------------------------------------------------------------------

for (const unit of compilationUnits) {
    if (unit.markdownStyles!) {
        for (const markdownStyle of unit.markdownStyles) {
            if (markdownStyle.preCompile) {
                for (const [preCompile, context] of markdownStyle.preCompile) {
                    console.log(INFO, context);
                    const result = await preCompile(markdownStyle);
                    if (result.error()) {
                        console.error(ERROR, result.context());
                        process.exit(1);
                    }
                }
            }

            for (const [compile, context] of markdownStyle.compile) {
                console.log(INFO, context);
                const result = await compile(markdownStyle);
                if (result.error()) {
                    console.error(ERROR, result.context());
                    process.exit(1);
                }
            }

            if (markdownStyle.postCompile) {
                for (const [postCompile, context] of markdownStyle.postCompile) {
                    console.log(INFO, context);
                    const result = await postCompile(markdownStyle);
                    if (result.error()) {
                        console.error(ERROR, result.context());
                        process.exit(1);
                    }
                }
            }
        }
    }
}

// --------------------------------------------------------------------------------


// Markdown Script Compilation Step
// --------------------------------------------------------------------------------

for (const unit of compilationUnits) {
    if (unit.markdownScript!.preCompile) {
        for (const [preCompile, context] of unit.markdownScript!.preCompile) {
            console.log(INFO, context);
            const result = await preCompile(unit.markdownScript!);
            if (result.error()) {
                console.error(ERROR, result.context());
                process.exit(1);
            }
        }
    }

    for (const [compile, context] of unit.markdownScript!.compile) {
        console.log(INFO, context);
        const result = await compile(unit.markdownScript!);
        if (result.error()) {
            console.error(ERROR, result.context());
            process.exit(1);
        }
    }

    if (unit.markdownScript!.postCompile) {
        for (const [postCompile, context] of unit.markdownScript!.postCompile) {
            console.log(INFO, context);
            const result = await postCompile(unit.markdownScript!);
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