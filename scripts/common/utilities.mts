import * as acorn from "acorn";
import { HTMLElement as HtmlParserElement } from "node-html-parser";
import type { Document, Element, ChildNode } from "node_modules/parse5/dist/tree-adapters/default.d.ts";

// -----------------------------------------------------------------------------
//
// -- @SECTION Html Helpers --
//
// -----------------------------------------------------------------------------

export namespace Html {
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

    function isParse5Element(element: ChildNode): element is Element {
        return "nodeName" in element
            && "tagName" in element
            && "attrs" in element
            && "namespaceURI" in element
            && "sourceCodeLocation" in element
            && "parentNode" in element
            && "childNodes" in element;
    }

    export function findNodeTagParse5(tag: string, root: Document): Element | null {
        let nodeTag: Element | null = null;

        for (const child of root.childNodes) {
            nodeTag = findNodeTagParse5Impl(tag, child as Element);
            if (nodeTag !== null)
                break;
        }

        return nodeTag;
    }

    function findNodeTagParse5Impl(tag: string, root: Element): Element | null {

        if (root.nodeName === tag) {
            return root;
        }

        if (!("childNodes" in root)) {
            return null;
        }

        let nodeTag: Element | null = null;
        for (const child of root.childNodes) {
            nodeTag = findNodeTagParse5Impl(tag, child as Element);
            if (nodeTag !== null)
                break;
        }

        return nodeTag;
    }
}

// -----------------------------------------------------------------------------


// -----------------------------------------------------------------------------
//
// -- @SECTION AST Helpers --
//
// -----------------------------------------------------------------------------

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

// -----------------------------------------------------------------------------


// -----------------------------------------------------------------------------
//
// -- @SECTION Reflection --
//
// -----------------------------------------------------------------------------

export function isIterable(obj: any) {
  return obj != null && typeof obj[Symbol.iterator] === "function";
}

export function getClassName(obj: any) {
  if (obj != null && typeof obj.constructor === "function") {
    return obj.constructor.name;
  }

  return null;
}

export function valueToString(value: any): string {
    const typeOfValue = typeof value;

    if (typeOfValue === "undefined") { return "undefined"; }

    else if (typeOfValue === "boolean") { return value.toString(); }

    else if (typeOfValue === "number") { return value.toString(); }

    else if (typeOfValue === "bigint") { return value.toString() + "n"; }

    else if (typeOfValue === "function") { return value.toString(); }

    else if (typeOfValue === "string") {
        return quoteString(value);
    }

    else if (typeOfValue === "object" && value === null) { return "null"; }

    else if (typeOfValue === "object" && Array.isArray(value)) {
        let arrayString = "";
        for (const element of value as Array<any>) {
            arrayString += valueToString(element) + ", ";
        }

        return `[${arrayString}]`;
    }

    else if (typeOfValue === "object") {
        let arrayString = "";
        const keys = Object.keys(value);

        for (const k of keys) {
            arrayString += `${stringToKeyString(k)}: ${valueToString(value[k])}, `
        }

        return `{${arrayString}}`;
    }

    return "undefined";
}

// -----------------------------------------------------------------------------


// -----------------------------------------------------------------------------
//
// -- @SECTION String Helpers --
//
// -----------------------------------------------------------------------------

export function replaceSubstring(str: string, start: number, end: number, replacement: string): string {
    let before = str.substring(0, Math.max(0, start));
    let after = str.substring(Math.min(str.length, end + 1));
    return before + replacement + after;
}

export function quoteString(value: string): string {
    const stringValue = value as string;
    const punctuator = (stringValue.includes(`"`))
        ? (stringValue.includes("\n"))
            ? "`"
            : `'`
        : `"`;

    const escapedString = stringValue
        .replace(/\\/gm, `\\\\`)
        .replace(/"/gm, `\\"`)
        .replace(/\n/gm, `\\n`);

    return `${punctuator}${escapedString}${punctuator}`;
}

export function stringToKeyString(value: string) {
    const validKeyString = /^[_A-z]+[_A-z0-9]*$/.test(value);
    if (validKeyString)
        return quoteString(value);
    else
        return `[${quoteString(value)}]`;
}

export function toJsIdent(value: string): string {
    // TODO: handle spaces
    // TODO: handle starts with digits
    // TODO: handle illegal characters
    return value.replaceAll("-", "_");
}

// -----------------------------------------------------------------------------
