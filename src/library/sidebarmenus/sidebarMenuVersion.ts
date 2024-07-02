import { HtmlFiles } from "@html";

export function sidebarMenuVersion() {
    const html = HtmlService
        .createTemplateFromFile(HtmlFiles.VERSION)
        .setTitle("Version");

    SpreadsheetApp
        .getUi()
        .showSidebar(html);
}
