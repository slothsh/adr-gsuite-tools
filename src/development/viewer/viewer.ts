// Copyright (c) 2024 Stefan Olivier
// <https://stefanolivier.com>

import { Config } from "@environment";

// Globals
// --------------------------------------------------------------------------------

const localHostUrl = new URL(`${Config.DEVELOPMENT_HOST_URL}:${Config.DEVELOPMENT_HOST_PORT}`);

const defaultSelectedValue = "default";
const viewerDefaultTarget = "Select a target";

const idViewerSelection = "viewerSelection";
const idViewerTarget = "viewerTarget";
const idConsole = "console";
const idViewer = "viewer";
const idViewerNavigator = "viewerNavigator";
const idViewerNavigatorForm = "viewerNavigatorForm";

const viewerTargetItems: Array<ViewerItem> = [
    {
        id: 0,
        name: `${Config.DEVELOPMENT_MARKDOWN_PATH}/version.html`,
        path: new URL(`${Config.DEVELOPMENT_MARKDOWN_PATH}/version.html`, localHostUrl)
    },
];

// --------------------------------------------------------------------------------


// Markdown Viewer
// --------------------------------------------------------------------------------

const elementViewerSelection: HTMLSelectElement = document.getElementById(idViewerSelection) as HTMLSelectElement;
let elementViewerSelectionDefaultHtml: string = "";
if (elementViewerSelection !== null) {
    elementViewerSelectionDefaultHtml = elementViewerSelection.innerHTML;
    elementViewerSelection.addEventListener("click", handleViewerSelectionClick);
}

// --------------------------------------------------------------------------------


// Methods
// --------------------------------------------------------------------------------

function handleViewerSelectionClick(event: MouseEvent): void {
    event.stopPropagation();

    const list: HTMLSelectElement = document.getElementById(idViewerSelection) as HTMLSelectElement;
    const target: HTMLDivElement = document.getElementById(idViewerTarget) as HTMLDivElement;

    if (list !== null) {
        let selectedValue: string | null = null;

        for (const child of list.children as HTMLOptionsCollection) {
            if (child.selected) {
                selectedValue = child.value;
            }
        }

        if (selectedValue === null || selectedValue === defaultSelectedValue) {
            list.innerHTML = elementViewerSelectionDefaultHtml;
            if (target !== null) {
                target.textContent = viewerDefaultTarget;
            }

            const foreignTags = document.querySelectorAll("[foreign]");
            for (const foreign of foreignTags) {
                if (foreign.parentNode !== null) {
                    foreign.parentNode.removeChild(foreign);
                } else {
                    document.removeChild(foreign);
                }
            }

            return;
        }

        const index = parseInt(selectedValue);
        fetch(viewerTargetItems[index].path)
            .then((response: Response) => {
                if (!response.ok) {
                    throw new Error("could not load markdown file");
                }

                return response.text();
            })
            .then((targetSource: string) => {
                const viewerTargetElement: HTMLDivElement | null = document.getElementById(idViewerTarget) as HTMLDivElement;
                if (viewerTargetElement === null) {
                    console.error(`could not find mount point with ID "${idViewerTarget}" for viewer target`);
                    return;
                }

                const parser = new DOMParser();

                const targetDom = parser.parseFromString(targetSource, "text/html");
                const targetBodyElement = targetDom.body;
                const targetStyleElements = targetDom.head.querySelectorAll("style");

                for (const styleElement of targetStyleElements) {
                    styleElement.setAttribute("foreign", "");
                    document.head.appendChild(styleElement);
                }

                const targetScriptElements = targetDom.body.querySelectorAll("script");

                for (const scriptElement of targetScriptElements) {
                    targetDom.body.removeChild(scriptElement as Node);
                    const injectedScriptElement = document.createElement("script");
                    injectedScriptElement.type = scriptElement.type;
                    injectedScriptElement.textContent = scriptElement.innerText;
                    injectedScriptElement.setAttribute("foreign", "");
                    document.body.appendChild(injectedScriptElement);
                }

                viewerTargetElement.innerHTML = targetBodyElement.innerHTML;
            })
            .catch((error: any) => {
                console.error(error);
            });
    }
}

// --------------------------------------------------------------------------------

// Interfaces
// --------------------------------------------------------------------------------

interface ViewerItem {
    id: number,
    name: string,
    path: URL,
}

// --------------------------------------------------------------------------------


// Module
// --------------------------------------------------------------------------------

export default {
    // IDs
    idViewerSelection: idViewerSelection,
    idViewerTarget: idViewerTarget,
    idConsole: idConsole,
    idViewer: idViewer,
    idViewerNavigator: idViewerNavigator,
    idViewerNavigatorForm: idViewerNavigatorForm,

    defaultSelectedValue: defaultSelectedValue,
    viewerDefaultTarget: viewerDefaultTarget,
    viewerTargetItems: viewerTargetItems,

    // Other
    title: "Hello, SideBar!",
}

// --------------------------------------------------------------------------------
