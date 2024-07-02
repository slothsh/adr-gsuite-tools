import { HtmlFiles } from "@html";

export function sidebarMenuVersion() {
    const html = HtmlService
        .createTemplateFromFile(HtmlFiles.VERSION)
        .evaluate();

    SpreadsheetApp
        .getUi()
        .showSidebar(html);
}
