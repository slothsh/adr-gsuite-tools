// Copyright (c) 2024 Stefan Olivier
// <https://stefanolivier.com>

import { existsSync, readFileSync, unlinkSync, writeFileSync, type PathLike, } from "node:fs";
import { basename, dirname, resolve, join } from "node:path";
import { execSync } from "node:child_process";
import * as esbuild from "esbuild";
import ts2gas from "ts2gas";
import * as acorn from "acorn";
import * as esc from "escodegen";
import * as est from "estraverse";
import tsc, { type CompilerOptions } from "typescript";
import Handlebars from "handlebars";
import { parse as parseHtml, Node as HtmlParserNode, HTMLElement as HtmlParserElement } from "node-html-parser";
import { compile as compileSass } from "sass";
import prettier from "prettier";
import { JSDOM } from "jsdom";
import { PurgeCSS } from "purgecss";

const baseDir = process.env.BASE_DIR || __dirname;

// Environment & Configuration
// --------------------------------------------------------------------------------

export module Config {
    export const ENVIRONMENT = process.env.ENVIRONMENT || "DEVELOPMENT";
    export const PACKAGE_CONFIG_PATH = "package.json";
    export const PACKAGE_CONFIG: { [key: string]: any } = JSON.parse(readFileSync(resolve(baseDir, PACKAGE_CONFIG_PATH), "utf-8"));
    export const VERSION: string = PACKAGE_CONFIG["version"];
    export const [VERSION_MAJOR, VERSION_MINOR, VERSION_SUB] = VERSION.split(".");
    export const COMMIT_HASH: string = execSync("git rev-parse HEAD").toString().trim();
    export const AUTHOR = PACKAGE_CONFIG["author"];
    export const AUTHOR_EMAIL = PACKAGE_CONFIG["authorEmail"];
    export const AUTHOR_WEBSITE = PACKAGE_CONFIG["authorWebsite"];
    export const PROJECT_NAME = PACKAGE_CONFIG["name"];
    export const PROJECT_DESCRIPTION = PACKAGE_CONFIG["description"];

    export const LICENSE_FILE_PATH = "LICENSE";
    export const LICENSE = readFileSync(LICENSE_FILE_PATH, "utf-8")
        .toString()
        .trim();

    export const LICENSE_TYPE = PACKAGE_CONFIG["license"];

    export const DEVELOPMENT_HOST_URL: string = "http://localhost";
    export const DEVELOPMENT_HOST_PORT: number = 8888;
    export const DEVELOPMENT_MARKDOWN_PATH: string = "markdown";
}

// --------------------------------------------------------------------------------


// Project Paths
// --------------------------------------------------------------------------------

export const BASE_DIR = resolve(baseDir);
export const SRC_DIR = resolve(baseDir, "src");
export const BUILD_DIR = resolve(baseDir, "build");
export const SCRIPTS_DIR = resolve(baseDir, "scripts");
export const STATIC_FILES_DIR = resolve(baseDir, "static");
export const TSCONFIG_PATH = resolve(baseDir, "tsconfig.json");

export const SRC_LIBRARY_DIR = resolve(SRC_DIR, "library");
export const SRC_MARKDOWN_DIR = resolve(SRC_DIR, "markdown");
export const SRC_DEVELOPMENT_DIR = resolve(SRC_DIR, "development");
export const SRC_CSS_LOAD_PATHS = [SRC_MARKDOWN_DIR, resolve(baseDir, "node_modules/bootstrap/scss")];
export const SCRIPTS_CONFIG_DIR = resolve(SCRIPTS_DIR, "configs");
export const BUILD_DIR_LIBRARY = resolve(BUILD_DIR, "library");
export const BUILD_DIR_MARKDOWN = resolve(BUILD_DIR, "markdown");
export const BUILD_DIR_STATIC = resolve(BUILD_DIR, "static");
export const BUILD_DIR_CACHE = resolve(BUILD_DIR, "cache");
export const BUILD_DIR_DEVELOPMENT = resolve(BUILD_DIR, "development");
export const BUILD_DIR_ENVIRONEMNT = resolve(BUILD_DIR, "environment");
export const DIST_DIR = resolve(BUILD_DIR, "dist");

const buildTimeAliases = {
    name: 'build-time-aliases',
    setup(build: any) {
        build.onResolve({ filter: /^@environment$/ }, (args: any) => {
            return { path: resolve(BUILD_DIR_CACHE, "clientConfig.js") }
        });

        // build.onResolve({ filter: /^@src\// }, (args: any) => {
        //     return { path: args.path.replace(/^@src\//, "src/") }
        // });

        build.onResolve({ filter: /^@html$/ }, (args: any) => {
            return { path: resolve(BUILD_DIR_CACHE, "clientHtmlFiles.js") }
        });
    },
}

// --------------------------------------------------------------------------------


// Utilities
// --------------------------------------------------------------------------------

export const ERROR = "[ERROR]";
export const WARN = "[WARN]";
export const INFO = "[INFO]";

export const enum ResultKind {
    OK,
    ERROR,
}

export class Result {
    constructor(kind: ResultKind, message?: string) {
        this.kind = kind;
        if (message)
            this.message = message;
    }

    kind: ResultKind;
    message: string = "";

    success(): boolean {
        return this.kind === ResultKind.OK;
    }
    
    error(): boolean {
        return this.kind === ResultKind.ERROR;
    }

    context(): string {
        return this.message;
    }
}

export function Ok(message?: string) {
    return new Result(ResultKind.OK, message ?? "");
}

export function Err(message: string) {
    return new Result(ResultKind.ERROR, message);
}

export const GAS_BUNDLE_BUILD_OPTIONS: esbuild.BuildOptions = {
    format: "esm",
    bundle: true,
    treeShaking: false,
};

export const MARKDOWN_BUNDLE_BUILD_OPTIONS: esbuild.BuildOptions = {
    format: "esm",
    bundle: true,
    treeShaking: false,
    plugins: [
        buildTimeAliases,
    ],
};

export enum CssPreprocessorKind {
    CSS = "css",
    SCSS = "scss",
}

export interface OutputFile {
    name: string,
    extension: string,
    directory: PathLike,
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

export interface CssCompilationUnit extends CompilationUnit {
}

export interface MarkdownCompilationUnit extends CompilationUnit {
    markdownScript?: TsCompilationUnit,
    markdownStyles?: Array<CssCompilationUnit>,
    markdownState?: {
        [key: string]: any
    },
}

export type CompilationTransformer =
    ((unit: CompilationUnit) => Result) &
    ((unit: CssCompilationUnit) => Result) &
    ((unit: MarkdownCompilationUnit) => Result)


namespace Html {
    export function findNodeTag(tag: string, root: HtmlParserElement): HtmlParserElement | null {
        if (root.rawTagName === tag)
            return root;

        let bodyTag: HtmlParserElement | null = null;
        for (const child of root.childNodes) {
            bodyTag = findNodeTag(tag, child as HtmlParserElement);
            if (bodyTag !== null)
                break;
        }

        return bodyTag;
    }
}

export function getNodes(root: acorn.Statement | acorn.ModuleDeclaration, collect: Array<acorn.Node> = []): Array<acorn.Node> {
    if (getClassName(root) === "Node") {
        collect.push(root);
    }

    const keys = Object.keys(root);
    for (const k of keys) {
        if (getClassName(root[k]) === "Node") {
            collect = [...collect, ...getNodes(root[k])];
        }

        if (isIterable(root[k]) && typeof root[k] !== "string") {
            for (const i of root[k]) {
                collect = [...collect, ...getNodes(i)];
            }
        }
    }

    return [...collect];
}

export function isIterable(obj: any) {
  return obj != null && typeof obj[Symbol.iterator] === "function";
}

export function getClassName(obj: any) {
  if (obj != null && typeof obj.constructor === "function") {
    return obj.constructor.name;
  }

  return null;
}

export function replaceSubstring(str: string, start: number, end: number, replacement: string): string {
    let before = str.substring(0, Math.max(0, start));
    let after = str.substring(Math.min(str.length, end + 1));
    return before + replacement + after;
}

// --------------------------------------------------------------------------------


// Handlerbars Configuration
// --------------------------------------------------------------------------------

type HandlebarsOptionsHash = { hash: { [key: string]: string }};
type HandlebarsOptions = HandlebarsOptionsHash & { [key: PropertyKey]: any };

class HandlebarsHelper {
    constructor(name: string, procedure: Handlebars.HelperDelegate) {
        this.name = name;
        this.procedure = procedure;
    }
    readonly name: string;
    readonly procedure: Handlebars.HelperDelegate;
}

function createHelper(name: string, procedure: Handlebars.HelperDelegate): HandlebarsHelper {
    return new HandlebarsHelper(name, procedure);
}

function inlineScript(path: PathLike): string {
    const sourceCodeFile = resolve(BASE_DIR, path.toString());
    if (existsSync(sourceCodeFile)) {
        const sourceCode = readFileSync(sourceCodeFile, "utf-8").toString();
        return `<script type="text/javascript">${sourceCode}</script>`;
    }

    return "";
}

function inlineSvgIcon(path: PathLike, width: number, height: number, options: HandlebarsOptions): string {
    const svgSourcePath = resolve(BASE_DIR, path.toString());

    if (existsSync(svgSourcePath)) {
        const svgSourceCode = readFileSync(svgSourcePath, "utf-8").toString();

        const svgMarkup = parseHtml(svgSourceCode);
        const svgNode = Html.findNodeTag("svg", svgMarkup);
        if (svgNode === null) {
            throw new Error(`could not find svg node for file @ "${svgSourcePath}" during inline svg icon helper`);
        }

        const svgWidthAttribute = svgNode.getAttribute("width");
        const svgHeightAttribute = svgNode.getAttribute("height");
        if (!svgWidthAttribute || !svgHeightAttribute) {
            throw new Error(`could not find width and/or height attribute on svg node in file @ "${svgSourcePath}"`);
        }

        const svgWidth = parseFloat(svgWidthAttribute);
        const svgHeight = parseFloat(svgHeightAttribute);
        const scaleX = width/svgWidth;
        const scaleY = height/svgHeight;
        const geometricScale = Math.sqrt(scaleX * scaleY);

        const sizingAttributesList: Array<string> = [
            "width",
            "height",
            "viewBox",
            "x",
            "y",
            "rx",
            "ry",
            "r",
            "cx",
            "cy",
            "dx",
            "dy",
            "d",
            "points",
            "x1",
            "y1",
            "x2",
            "y2",
            "markerWidth",
            "markerHeight",
            "stroke-width",
            "stroke-height",
        ];

        const scaleAttributeNumber = (nodeAttribute: string, scaleFactor: number) => {
            // @ts-ignore
            const numbersPart = [...nodeAttribute.matchAll(/-?\d+(\.\d+)?/g)];

            let newNodeAttribute = nodeAttribute;
            let offset = 0;

            for (const part of numbersPart as Array<RegExpExecArray>) {
                const start = part.index;
                const end = start + part[0].length;

                const scaledNodeWidth = (parseFloat(part[0]) * scaleFactor).toString();
                newNodeAttribute = replaceSubstring(newNodeAttribute, start + offset, end + offset - 1, scaledNodeWidth);
                offset += newNodeAttribute.length - nodeAttribute.length;
            }

            return newNodeAttribute;
        }

        for (const attribute of sizingAttributesList) {
            const sizedNodes = svgMarkup.querySelectorAll(`[${attribute}]`);
            for (const node of sizedNodes) {
                switch (attribute) {
                    // Horizontal
                    case "x":
                    case "rx":
                    case "cx":
                    case "dx":
                    case "x1":
                    case "x2":
                    case "markerWidth":
                    case "stroke-width":
                    case "width":
                    case "y":
                    case "ry":
                    case "r":
                    case "cy":
                    case "dy":
                    case "y1":
                    case "y2":
                    case "markerHeight":
                    case "stroke-height":
                    case "height": {
                        const nodeAttribute = node.getAttribute(attribute);
                        node.setAttribute(attribute, scaleAttributeNumber(nodeAttribute, geometricScale));
                    } break;

                    case "points":
                    case "viewBox":
                    case "d": {
                        const nodeAttribute = node.getAttribute(attribute);
                        const commands: Array<string> = nodeAttribute.split(" ");
                        commands.forEach((value: string) => {
                            value.trim();
                        });

                        const scaledCommands: Array<string> = [];
                        for (const c of commands) {
                            const scaledCommand = scaleAttributeNumber(c, geometricScale);
                            scaledCommands.push(scaledCommand);
                        }

                        const scaledNodeAttribute = scaledCommands.join(" ");
                        node.setAttribute(attribute, scaledNodeAttribute);
                    } break;
                    default: throw new Error("unreachable");
                }
            }
        }

        svgNode.removeAttribute("viewBox");

        for (const [ key, value ] of Object.entries(options.hash)) {
            svgNode.setAttribute(new Handlebars.SafeString(key).toString(), new Handlebars.SafeString(value).toString());
        }

        return svgNode.toString();
    }

    return "";
}

export function initializeHandlebars(): Result {
    try {
        const handlebarsHelpers: Array<HandlebarsHelper> = [
            createHelper("inline-script", inlineScript),
            createHelper("inline-svg-icon", inlineSvgIcon),
        ];

        for (const helper of handlebarsHelpers) {
            Handlebars.registerHelper(helper.name, helper.procedure);
        }
    } 

    catch (error: any) {
        return Err(`handlebars initialization failed with error: ${error}`);
    }

    return Ok();
}

// --------------------------------------------------------------------------------


// Procedures
// --------------------------------------------------------------------------------

export function scriptsForMarkownTemplate(unit: MarkdownCompilationUnit): Result {
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
                // @ts-ignore
                [compileTsBundle, `compiling typescript bundle: "${sourceFile}"`],
            ],
        };
    }

    catch (error: any){
        return Err(`markdown scripts discovery for "${unit.file}" failed with message: ${error}`);
    }

    return Ok();
}

export function stylesForMarkdownTemplate(unit: MarkdownCompilationUnit): Result {
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

export function compileCssBundle(unit: CssCompilationUnit): Result {
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
            plugins: [
                buildTimeAliases,
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

export function compileGas(unit: TsCompilationUnit): Result {
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
                treeShaking: false,
                plugins: [
                    buildTimeAliases,
                ]
            };

            // @ts-ignore
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

export function injectMarkdownCss(unit: MarkdownCompilationUnit): Result {
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

export function injectMarkdownJs(unit: MarkdownCompilationUnit): Result {
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

export function injectLicense(unit: CompilationUnit): Result {
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

export function writeCompilationUnit(unit: CompilationUnit, outputFile: PathLike): Result {
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

// --------------------------------------------------------------------------------
