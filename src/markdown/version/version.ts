
import { Config, type google } from "@environment";
import { Tooltip } from "bootstrap";

// Globals
// --------------------------------------------------------------------------------

const now = new Date();
const COPYRIGHT_TEXT = `Copyright (c) ${now.getFullYear()} ${Config.AUTHOR}`;
const TOOLTIP_DEFAULT_TITLE = "Copy to clipboard";

const VERSION_ITEMS = [
    {
        id: 0,
        title: "Contact",
        value: Config.AUTHOR_EMAIL,
        fontSize: (Config.AUTHOR_EMAIL.length > 32) ? "0.6rem" : "inherit",
    },
    {
        id: 1,
        title: "Version",
        value: Config.VERSION,
        fontSize: (Config.VERSION.length > 32) ? "0.6rem" : "inherit",
    },
    {
        id: 2,
        title: "Commit Hash",
        value: Config.COMMIT_HASH,
        fontSize: (Config.COMMIT_HASH.length > 32) ? "0.6rem" : "inherit",
    },
];

const idVersionTableBody = "versionTableBody";
const idButtonClose = "buttonClose";

// --------------------------------------------------------------------------------


// Event Listeners
// --------------------------------------------------------------------------------

const versionTableBodyElement: HTMLTableSectionElement | null = document.getElementById(idVersionTableBody) as HTMLTableSectionElement;
if (versionTableBodyElement !== null) {
    for (const child of versionTableBodyElement.children as HTMLCollectionOf<HTMLTableRowElement>) {
        child.addEventListener("click", (event: MouseEvent) => { handleRowClick(event, child); });
    }
} else {
    console.error(`could not add click handlers for element ID "${idVersionTableBody}"`);
}

const buttonCloseElement: HTMLButtonElement | null = document.getElementById(idButtonClose) as HTMLButtonElement;
if (buttonCloseElement !== null) {
    buttonCloseElement.addEventListener("click", handleButtonClose);
} else {
    console.error(`could not add click handlers for element ID "${buttonCloseElement}"`);
}

// --------------------------------------------------------------------------------


// Bootstrap Tooltips Initialization
// --------------------------------------------------------------------------------

const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');

// @ts-ignore
const tooltipList = [...tooltipTriggerList]
    .map((tooltipTriggerElement, index) => {
        const tooltip = new Tooltip(tooltipTriggerElement, {
            animation: false,
        });

        return {
            id: index,
            tooltip: tooltip,
        };
    });

// --------------------------------------------------------------------------------


// Event Handlers
// --------------------------------------------------------------------------------

function handleRowClick(event: MouseEvent, element: HTMLTableRowElement): void {
    const dataValue = element.getAttribute("value");
    if (dataValue !== null) {
        navigator.clipboard.writeText(dataValue);
        element.setAttribute("data-bs-title", "Copied!");
            tooltipList.filter((t) => t.id === parseInt(element.getAttribute("index")))
            .forEach((v) => v.tooltip.setContent({ ".tooltip-inner": "Copied!" }));
        setTimeout(() => {
            element.setAttribute("data-bs-title", "Copied!");
                tooltipList.filter((t) => t.id === parseInt(element.getAttribute("index")))
                .forEach((v) => v.tooltip.setContent({ ".tooltip-inner": TOOLTIP_DEFAULT_TITLE }));
        }, 3000);
    }
}

function handleButtonClose(event: MouseEvent): void {
    // @ts-ignore
    google.script.host.close(); // TODO: handle host environment code
}

// --------------------------------------------------------------------------------


// Module
// --------------------------------------------------------------------------------

export default {
    // Meta Info
    authorName: Config.AUTHOR,
    authorWebsite: Config.AUTHOR_WEBSITE,
    authorEmail: Config.AUTHOR_EMAIL,
    version: Config.VERSION,
    versionItems: VERSION_ITEMS,
    commitHash: Config.COMMIT_HASH,
    copyrightInfo: COPYRIGHT_TEXT,
    projectName: Config.PROJECT_NAME,

    logoWidth: 210,
    logoHeight: 210,
    tooltipDefaultTitle: TOOLTIP_DEFAULT_TITLE,

    // Event Handlers
    handleButtonClose: handleButtonClose,

    // IDs
    idVersionTableBody: idVersionTableBody,
    idButtonClose: idButtonClose,
}

// --------------------------------------------------------------------------------
