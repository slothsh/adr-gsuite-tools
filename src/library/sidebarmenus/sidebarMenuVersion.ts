import { HtmlFiles } from "@html";

export function sidebarMenuVersion() {
    const html = HtmlService
        .createHtmlOutputFromFile(HtmlFiles.VERSION)
        .setTitle("Version");

    SpreadsheetApp
        .getUi()
        .showSidebar(html);
}
