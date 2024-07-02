// Copyright (c) 2024 Stefan Olivier
// <https://stefanolivier.com>

import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { basename, resolve } from "node:path";
import fg from "fast-glob";
import { type PathLike } from "node:fs"
import {
    Config,
    INFO,
    ERROR,
    SRC_DEVELOPMENT_DIR,
    BUILD_DIR_DEVELOPMENT,
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
const compilationUnits: Array<MarkdownCompilationUnit> = fg.sync([
        resolve(SRC_DEVELOPMENT_DIR, "**/*.html"),
    ])
    .map((sourceFile: string) => {
        const sourceCode = readFileSync(sourceFile, "utf-8").toString();
        return {
            file: sourceFile,
            originalSource: sourceCode,
            compiledSource: sourceCode,
            extension: "html",

            output: [
                {
                    name: basename("index", ".html"),
                    extension: "html",
                    directory: BUILD_DIR_DEVELOPMENT,
                },
            ],

            compile: [
                [compileMarkdownTemplate, `compiling development markdown template: "${sourceFile}"`],
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


// Assemble Development Files Step
// --------------------------------------------------------------------------------

const markdownBuildDirectories = [
    BUILD_DIR_MARKDOWN,
];

const developmentFiles: Array<PathLike> = fg.sync(
    markdownBuildDirectories.map((path) => {
        return resolve(path, "**/*");
    })
);

const developmentMarkdownAssetsPath = resolve(BUILD_DIR_DEVELOPMENT, "markdown");
if (!existsSync(developmentMarkdownAssetsPath)) {
    mkdirSync(developmentMarkdownAssetsPath, { recursive: true });
}

for (const file of developmentFiles) {
    try {
        const outputFile = resolve(BUILD_DIR_DEVELOPMENT, "markdown", basename(file.toString()));
        console.log(INFO, `assembling file "${file}" into development directory`);
        copyFileSync(file, outputFile);
    }

    catch (error: any) {
        console.error(ERROR, `failed to copy development file @ "${file}" during development build assembly`);
    }
}

// --------------------------------------------------------------------------------
