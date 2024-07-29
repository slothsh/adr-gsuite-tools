import { Config } from "@environment";

function onOpen(): void {
  const ui = SpreadsheetApp.getUi();

  ui.createMenu(Config.PROJECT_NAME)
    .addItem("Version", "sidebarMenuVersion")
    .addToUi();
}

function onInstall(): void {
  onOpen();
}
