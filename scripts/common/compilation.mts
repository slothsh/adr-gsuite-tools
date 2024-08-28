import * as acorn from "acorn";
import * as esbuild from "esbuild";
import * as esc from "escodegen";
import * as est from "estraverse";
import Handlebars from "handlebars";
import prettier from "prettier";
import ts2gas from "ts2gas";
import tsc, { type CompilerOptions } from "typescript";
import { BUILD_DIR_CACHE, SRC_CSS_LOAD_PATHS } from "./paths.mts";
import { BUILD_TIME_ALIASES } from "./aliases.mts";
import { Config } from "./config.mts";
import { Html } from "./utilities.mts";
import { JSDOM } from "jsdom";
import { INFO, ERROR, Ok, Err } from "./logging.mts";
import { PurgeCSS } from "purgecss";
import { Result } from "./logging.mts";
import { basename, dirname, resolve } from "node:path";
import { compile as compileSass } from "sass";
import { parse as parseHtml, HTMLElement as HtmlParserElement } from "node-html-parser";
import { type PathLike, existsSync, readFileSync, writeFileSync, } from "node:fs";


// -----------------------------------------------------------------------------
//
// -- @SECTION Compilation Default Options --
//
// -----------------------------------------------------------------------------

export const GAS_BUNDLE_BUILD_OPTIONS: esbuild.BuildOptions = {
    format: "esm",
    bundle: true,
    treeShaking: false,
    logLevel: "silent",
};

export const MARKDOWN_BUNDLE_BUILD_OPTIONS: esbuild.BuildOptions = {
    format: "esm",
    bundle: true,
    treeShaking: false,
    logLevel: "silent",
    plugins: [
        BUILD_TIME_ALIASES,
    ],
};

// -----------------------------------------------------------------------------


// -----------------------------------------------------------------------------
//
// -- @SECTION Compilation Types --
//
// -----------------------------------------------------------------------------

export interface OutputFile {
    name: string,
    extension: string,
    directory: PathLike,
}

export enum CssPreprocessorKind {
    CSS = "css",
    SCSS = "scss",
}

export interface CompilationUnit {
    file: PathLike,
    output: Array<OutputFile>,
    extension: string,
    originalSource: string,
    compiledSource: string,
    compile: Array<[CompilationTransformer, string]>,
    preCompile?: Array<[CompilationTransformer, string]>,
    postCompile?: Array<[CompilationTransformer, string]>,
}

export interface TsCompilationUnit extends CompilationUnit {
    buildOptions?: esbuild.BuildOptions,
    transpileOptions?: CompilerOptions,
    cachedFile?: PathLike,
}

export interface CssCompilationUnit extends CompilationUnit {}

export interface MarkdownCompilationUnit extends CompilationUnit {
    markdownScript?: TsCompilationUnit,
    markdownStyles?: Array<CssCompilationUnit>,
    markdownState?: {
        [key: string]: any
    },
}

export type CompilationTransformer =
    ((unit: CompilationUnit) => Promise<Result>) &
    ((unit: CssCompilationUnit) => Promise<Result>) &
    ((unit: MarkdownCompilationUnit) => Promise<Result>)

// -----------------------------------------------------------------------------


// -----------------------------------------------------------------------------
//
// -- @SECTION Compilation Routines --
//
// -----------------------------------------------------------------------------

export async function scriptsForMarkownTemplate(unit: MarkdownCompilationUnit): Promise<Result> {
    try {
        const sourceFile = resolve(dirname(unit.file.toString()), `${basename(unit.file.toString(), ".html")}.ts`);
        if (!existsSync(sourceFile)) {
            return Err(`markdown script file "${sourceFile}" does not exist`);
        }

        const sourceCode = readFileSync(sourceFile, "utf-8");

        unit.markdownScript = {
            file: sourceFile,
            originalSource: sourceCode,
            compiledSource: sourceCode,
            extension: "ts",
            output: [],
            buildOptions: MARKDOWN_BUNDLE_BUILD_OPTIONS,

            compile: [
                [compileTsBundle, `compiling typescript bundle: "${sourceFile}"`],
            ],
        };
    }

    catch (error: any){
        return Err(`markdown scripts discovery for "${unit.file}" failed with message: ${error}`);
    }

    return Ok();
}

export async function stylesForMarkdownTemplate(unit: MarkdownCompilationUnit): Promise<Result> {
    try {
        const stylesheetKinds = Object.values(CssPreprocessorKind)
            .filter(variant => typeof variant === "string");

        const styleSheetSourceFiles: Array<CssCompilationUnit> = [];
        let styleSheetSourceFile = resolve(dirname(unit.file.toString()), `${basename(unit.file.toString(), ".html")}`);

        for (const styleKind of stylesheetKinds) {
            const searchStyleSheet = styleSheetSourceFile + `.${styleKind.toString().toLowerCase()}`;
            if (existsSync(searchStyleSheet)) {
                const styleSheetSourceCode = readFileSync(searchStyleSheet, "utf-8").toString();
                styleSheetSourceFiles.push(
                    {
                        file: searchStyleSheet,
                        extension: styleKind.toString().toLowerCase(),
                        originalSource: styleSheetSourceCode,
                        compiledSource: styleSheetSourceCode,

                        output: [
                            {
                                name: basename(searchStyleSheet),
                                extension: styleKind.toString().toLowerCase(),
                                directory: BUILD_DIR_CACHE,
                            }
                        ],

                        compile: [
                            [compileCssBundle, `compiling ${styleKind.toString()} bundle: ${searchStyleSheet}`],
                        ],
                    }
                );
            }
        }

        unit.markdownStyles = styleSheetSourceFiles;
    }

    catch (error: any){
        return Err(`markdown style sheets discovery for "${unit.file}" failed with message: ${error}`);
    }

    return Ok();
}

export async function compileTsBundle(unit: TsCompilationUnit): Promise<Result> {
    try {
        const interimFile = `${BUILD_DIR_CACHE}/${basename(unit.file.toString(), "." + unit.extension)}.js`
        const buildOptions: esbuild.BuildOptions = {
            entryPoints: [unit.file.toString()],
            outfile: interimFile,
            logLevel: "silent",
            ...unit.buildOptions ?? {
                format: "esm",
                bundle: true,
                treeShaking: false,
            }
        };

        await esbuild.build(buildOptions);

        if (existsSync(interimFile)) {
            unit.compiledSource = readFileSync(interimFile, "utf-8").toString(); 
            unit.cachedFile = interimFile; // unlinkSync(interimFile);
        } else {
            return Err(`an error occurred during the compilation of typescript bundle for "${unit.file}"`)
        }
    }

    catch (error: any){
        return Err(`typescript bundle compilation failed with message: ${error}`);
    }

    return Ok();
}

export async function compileCssBundle(unit: CssCompilationUnit): Promise<Result> {
    try {
        switch (unit.extension) {
            case CssPreprocessorKind.CSS:  {
                unit.compiledSource = readFileSync(unit.file).toString();
            } break;

            case CssPreprocessorKind.SCSS: {
                unit.compiledSource = compileSass(
                    unit.file.toString(),
                    {
                        loadPaths: SRC_CSS_LOAD_PATHS,
                    },
                ).css;
            } break;

            default: break;
        }
    }

    catch (error: any){
        return Err(`CSS bundle compilation failed with message: ${error}`);
    }

    return Ok();
}

export async function compileGasBundle(unit: TsCompilationUnit): Promise<Result> {
    try {
        const interimFile = `${BUILD_DIR_CACHE}/${basename(unit.file.toString(), "." + unit.extension)}.js`
        const buildOptions: esbuild.BuildOptions = {
            entryPoints: [unit.file.toString()],
            outfile: interimFile,
            logLevel: "silent",
            plugins: [
                BUILD_TIME_ALIASES,
            ],
            ...unit.buildOptions ?? {
                format: "esm",
                bundle: true,
                treeShaking: false,
            },
        };

        await esbuild.build(buildOptions);

        if (existsSync(interimFile)) {
            unit.compiledSource = readFileSync(interimFile, "utf-8").toString(); 
            unit.cachedFile = interimFile;
            // unlinkSync(interimFile);
        } else {
            return Err(`an error occurred during the compilation of GAS bundle for "${unit.file}"`)
        }
    }

    catch (error: any){
        return Err(`GAS bundle compilation failed with message: ${error}`);
    }

    return Ok();
}

export async function compileGas(unit: TsCompilationUnit): Promise<Result> {
    const transpilationCompilerOptions: CompilerOptions = unit.transpileOptions ?? {
        allowJS: true,
        strict: true,
        target: tsc.ScriptTarget.Latest,
        module: tsc.ModuleKind.None
    };

    try {
        // @ts-ignore
        const transpiled = ts2gas(unit.compiledSource, {transpilationCompilerOptions});
        unit.compiledSource = transpiled;
    }

    catch (error: any){
        return Err(`typescript to GAS compilation failed with message: ${error}`);
    }

    return Ok();
}

export async function compileMarkdownTemplate(unit: MarkdownCompilationUnit): Promise<Result> {
    try {
        const markdownSourceCode = readFileSync(unit.file).toString();
        const markdownTemplate = Handlebars.compile(markdownSourceCode, { strict: true });

        if (unit.markdownScript && unit.markdownScript.cachedFile) {
            const markdownSourceFile = unit.markdownScript.file.toString();
            const interimFile = resolve(BUILD_DIR_CACHE, `${basename(markdownSourceFile, "." + unit.markdownScript.extension)}Dom.js`);
            const buildOptions: esbuild.BuildOptions = {
                entryPoints: [markdownSourceFile],
                outfile: interimFile,
                format: "iife",
                bundle: true,
                logLevel: "silent",
                treeShaking: false,
                plugins: [
                    BUILD_TIME_ALIASES,
                ]
            };

            await esbuild.build(buildOptions);

            if (existsSync(interimFile)) {
                let compileDomSource = readFileSync(interimFile, "utf-8").toString(); 

                const compiledDomAst = acorn.parse(compileDomSource, { ecmaVersion: "latest" });
                let firstIIFEFound = false;
                est.traverse(compiledDomAst, {
                    enter: function (node: any) {
                        if (!firstIIFEFound && node.type === "ArrowFunctionExpression") {
                            firstIIFEFound = true;

                            const expressionNode = {
                                type: "ExpressionStatement",
                                expression: {
                                    type: "AssignmentExpression",
                                    operator: "=",
                                    left: {
                                        type: "MemberExpression",
                                        computed: false,
                                        object: {
                                            type: "Identifier",
                                            name: "window"
                                        },
                                        property: {
                                            type: "Identifier",
                                            name: "domExports"
                                        }
                                    },
                                    right: {
                                        type: "ObjectExpression",
                                        properties: [
                                            {
                                                type: "SpreadElement",
                                                argument: {
                                                    type: "Identifier",
                                                    name: `${basename(markdownSourceFile, "." + unit.markdownScript.extension)}_default`,
                                                }
                                            }
                                        ]
                                    }
                                }
                            };

                            node.body.body.push(expressionNode);
                        }
                    }
                });

                const exportInjectedCode = esc.generate(compiledDomAst);

                const dom = new JSDOM("<!DOCTYPE html><body></body>", { runScripts: "dangerously", resources: "usable" });
                const scriptElement = dom.window._document.createElement("script");
                scriptElement.textContent = exportInjectedCode;
                dom.window._document.body.appendChild(scriptElement);
                const state = dom.window["domExports"];
                unit.compiledSource = markdownTemplate(state);
            } else {
                return Err(`an error occurred during the compilation of DOM bundle for "${unit.file}"`)
            }
        } else {
            unit.compiledSource = markdownTemplate({});
        }
    }

    catch (error: any){
        return Err(`markdown template compilation failed with message: ${error}`);
    }

    return Ok();
}

export async function purgeMarkdownCss(unit: MarkdownCompilationUnit): Promise<Result> {
    try {
        const html = parseHtml(unit.compiledSource);
        const bodyTag = Html.findNodeTag("body", html);
        if (bodyTag !== null){
            if (unit.markdownStyles) {
                const css = unit.markdownStyles
                    .map((styleUnit) => {
                        return { raw: styleUnit.compiledSource };
                    });

                const purgedCss = await new PurgeCSS().purge({
                    content: [{ raw: bodyTag.toString(), extension: "html" }],
                    css: css,
                });

                for (const key in purgedCss) {
                    const index = parseInt(key);
                    unit.markdownStyles[index].compiledSource = purgedCss[index].css;
                }
            }
        }
    }
    
    catch (error: any) {
        return Err(`purging CSS failed for compilation unit "${unit.file}" with message: ${error}`);
    }
    
    return Ok();
}

export async function injectMarkdownCss(unit: MarkdownCompilationUnit): Promise<Result> {
    try {
        if (unit.markdownStyles) {
            const html = parseHtml(unit.compiledSource);
            for (const styleSheetUnit of unit.markdownStyles) {
                const headNode = Html.findNodeTag("head", html);
                if (headNode !== null && styleSheetUnit.compiledSource.trim() !== "") {
                    const styleNode = new HtmlParserElement("style", { id: "", class: "" });
                    styleNode.set_content(styleSheetUnit.compiledSource);
                    headNode.appendChild(styleNode);
                    unit.compiledSource = html.toString();
                }
            }
        }
    }
    
    catch (error: any) {
        return Err(`CSS style injection failed for compilation unit "${unit.file}" with message: ${error}`);
    }
    
    return Ok();
}

export async function injectMarkdownJs(unit: MarkdownCompilationUnit): Promise<Result> {
    try {
        // TODO:
        if (unit.markdownScript) {
            const html = parseHtml(unit.compiledSource);
            const bodyNode = Html.findNodeTag("body", html);
            if (bodyNode !== null) {
                const scriptNode = new HtmlParserElement("script", { id: "", class: "" }, `type="module"`);
                scriptNode.set_content(unit.markdownScript.compiledSource);
                bodyNode.appendChild(scriptNode);
                unit.compiledSource = html.toString();
            }
        }
    }
    
    catch (error: any) {
        return Err(`JS script injection failed for compilation unit "${unit.file}" with message: ${error}`);
    }
    
    return Ok();
}

export async function injectLicense(unit: CompilationUnit): Promise<Result> {
    try {
        let initiator = "", terminator = "";

        switch (unit.extension) {
            case "svelte":
            case "html": { initiator = "<!--"; terminator = "-->"; } break;
            default:     { initiator = "//";   terminator = "";    } break;
        }

        const license = Config.LICENSE
            .replace(/^/gm, `${initiator} `)
            .replace(/$/gm, ` ${terminator}`);

        unit.compiledSource = `${license}\n\n${unit.compiledSource}`;
    }
    
    catch (error: any) {
        return Err(`license injection failed for compilation unit "${unit.file}" with message: ${error}`);
    }
    
    return Ok();
}

export async function writeCompilationUnit(unit: CompilationUnit, outputFile: PathLike): Promise<Result> {
    try {
        writeFileSync(outputFile, unit.compiledSource);
    }

    catch (error: any) {
        return Err(`an error occurred while writing compiled source code for "${outputFile}" with message: ${error}`);
    }

    return Ok();
}

export async function prettyHtml(unit: MarkdownCompilationUnit): Promise<Result> {
    try {
        unit.compiledSource = await prettier.format(
            unit.compiledSource,
            {
                parser: "html",
            }
        );
    }

    catch (error: any) {
        return Err(`an error occurred while formatting source code for "${unit.file}" with message: ${error}`);
    }

    return Ok();
}

// -----------------------------------------------------------------------------
