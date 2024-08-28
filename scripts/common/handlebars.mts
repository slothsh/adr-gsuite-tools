import Handlebars from "handlebars";
import { BASE_DIR } from "./paths.mts";
import { Html, replaceSubstring } from "./utilities.mts";
import { Result, Ok, Err } from "./logging.mts";
import { existsSync, readFileSync, type PathLike, } from "node:fs";
import { parse as parseHtml } from "node-html-parser";
import { resolve } from "node:path";

// -----------------------------------------------------------------------------
//
// -- @SECTION Handlebars Types --
//
// -----------------------------------------------------------------------------

type HandlebarsOptionsHash = { hash: { [key: string]: string }};
type HandlebarsOptions = HandlebarsOptionsHash & { [key: PropertyKey]: any };

// -----------------------------------------------------------------------------


// -----------------------------------------------------------------------------
//
// -- @SECTION Handlebars Helpers --
//
// -----------------------------------------------------------------------------

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

// -----------------------------------------------------------------------------


// -----------------------------------------------------------------------------
//
// -- @SECTION Handelbars Functions --
//
// -----------------------------------------------------------------------------

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

// -----------------------------------------------------------------------------
