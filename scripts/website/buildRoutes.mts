import fg from "fast-glob";
import Handlebars from "handlebars";
import { INFO, Result, Ok } from "@common/logging.mts";
import { BUILD_DIR_WEBSITE, WEBSITE_ROUTES_DIR } from "@common/paths.mts";
import { basename, dirname, resolve, relative } from "node:path";
import { initializeHandlebars, createHelper } from "@common/handlebars.mts";
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

    {
        // Website-specific helpers
        Handlebars.registerHelper(
            "website-footer",
            (footerCopyright: string, copyrightLogo: { src: string, alt: string }, footerContent: Array<{ [key: string]: string }>) => {
                const footerTemplate =
                    `
                        <ul>
                            {{#each leftContent}}
                            <li><a href="{{this.href}}">{{this.text}}</a></li>
                            {{/each}}
                        </ul>
                        <ul>
                            {{#each rightContent}}
                            <li><a href="{{this.href}}">{{this.text}}</a></li>
                            {{/each}}
                            <li>
                                <img src="{{copyrightLogo.src}}" alt="{{copyrightLogo.alt}}">
                                {{copyright}}
                            </li>
                        </ul>
                    `;

                const templateContent = {
                    leftContent: footerContent.slice(0, Math.ceil(footerContent.length / 2)),
                    rightContent: footerContent.slice(Math.ceil(footerContent.length / 2)),
                    copyright: footerCopyright,
                    copyrightLogo: copyrightLogo,
                };

                const template = Handlebars.compile(footerTemplate, { strict: true });
                const html = template(templateContent);

                return html;
            }
        );

        Handlebars.registerHelper(
            "website-navigation",
            (
                title: string,
                logo: { src: string, alt: string },
                menuId:string,
                menu: { image: { src: string, alt: string } },
            ) => {
                const navTemplate =
                    `
                        <div>
                            <img class="logo" src="{{logo.src}}" alt="{{logo.alt}}">
                            <h1>{{title}}</h1>
                        </div>
                        <div id="{{menuId}}" class="menu-button">
                            {{{inline-svg-icon "assets/menu.svg" "32" "32"}}}
                        </div>
                    `;

                const template = Handlebars.compile(navTemplate, { strict: true });
                const html = template({ title, logo, menuId, menu });

                return html;
            }
        );

        Handlebars.registerHelper(
            "website-menu",
            (
                menuElementId: string,
                anchors: Array<{ href: string, text: string }>,
                title: string,
                logo: { src: string, alt: string },
                postItems: Array<{ href: string, text: string }>,
                copyright: string,
                copyrightLogo: { src: string, alt: string },
            ) => {
                const menuTemplate =
                    `
                        <div>
                            <div>
                                <img src="{{logo.src}}" alt="{{logo.alt}}">
                                <h3>{{title}}</h3>
                            </div>
                            <div>
                                <ul>
                                    {{#each anchors}}
                                    <li>
                                        <img src="{{this.logo.src}}" alt="{{this.logo.alt}}">
                                        <a href="{{this.href}}">{{this.text}}</a>
                                    </li>
                                    {{/each}}
                                </ul>
                            </div>
                            <div>
                                <ul>
                                    {{#each postItems}}
                                    <li>
                                        <a href="{{this.href}}">{{this.text}}</a>
                                    </li>
                                    {{/each}}
                                </ul>
                                <ul>
                                    <li>
                                        <img src="{{copyrightLogo.src}}" alt="{{copyrightLogo.alt}}">
                                        {{copyright}}
                                    </li>
                                </ul>
                            </div>
                        </div>
                    `;

                const template = Handlebars.compile(menuTemplate, { strict: true });
                const html = template({ id: menuElementId, anchors, title, logo, postItems, copyright, copyrightLogo });

                return html;
            }
        );
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
