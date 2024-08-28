import fg from "fast-glob";
import { INFO, ERROR, Result, Ok } from "@common/logging.mts";
import { SRC_DEVELOPMENT_DIR, BUILD_DIR_DEVELOPMENT, BUILD_DIR_MARKDOWN } from "@common/paths.mts";
import { basename, resolve } from "node:path";
import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { initializeHandlebars } from "@common/handlebars.mts";
import { type PathLike } from "node:fs"
import {
    compileMarkdownTemplate,
    injectLicense,
    injectMarkdownCss,
    injectMarkdownJs,
    prettyHtml,
    scriptsForMarkownTemplate,
    stylesForMarkdownTemplate,
    writeCompilationUnit,
    type MarkdownCompilationUnit,
} from "@common/compilation.mts";

// -----------------------------------------------------------------------------
//
// -- @SECTION Compilation Units --
//
// -----------------------------------------------------------------------------

const DEVELOPMENT_MARKDOWN_ASSETS_PATH = resolve(BUILD_DIR_DEVELOPMENT, "markdown");

const MARKDOWN_BUILD_DIRECTORIES = [
    BUILD_DIR_MARKDOWN,
];

const COMPILATION_UNITS: Array<MarkdownCompilationUnit> = fg.sync([
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

// -----------------------------------------------------------------------------


// -----------------------------------------------------------------------------
//
// -- @SECTION Build Development Markdown --
//
// -----------------------------------------------------------------------------

export default async function(): Promise<Result> {
    // Build Initialization
    {
        const result = initializeHandlebars();
        if (result.error()) {
            return result;
        }
    }

    // Pre-Compilation Step
    for (const unit of COMPILATION_UNITS) {
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
    for (const unit of COMPILATION_UNITS) {
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
    for (const unit of COMPILATION_UNITS) {
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
    for (const unit of COMPILATION_UNITS) {
        for (const [compile, context] of unit.compile) {
            console.log(INFO, context);
            const result = await compile(unit);
            if (result.error()) {
                return result;
            }
        }
    }

    // Post-Compilation Step
    for (const unit of COMPILATION_UNITS) {
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
    for (const unit of COMPILATION_UNITS) {
        for (const outputItem of unit.output) {
            const outputFile = `${resolve(outputItem.directory.toString(), outputItem.name)}.${outputItem.extension}`;
            console.log(INFO, "writing output:", outputFile);
            const result = await writeCompilationUnit(unit, outputFile);
            if (result.error()) {
                return result;
            }
        }
    }

    // Assemble Development Files Step
    if (!existsSync(DEVELOPMENT_MARKDOWN_ASSETS_PATH)) {
        mkdirSync(DEVELOPMENT_MARKDOWN_ASSETS_PATH, { recursive: true });
    }

    const developmentFiles: Array<PathLike> = fg.sync(
        MARKDOWN_BUILD_DIRECTORIES.map((path) => {
            return resolve(path, "**/*");
        })
    );

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

    return Ok();
}

// -----------------------------------------------------------------------------
