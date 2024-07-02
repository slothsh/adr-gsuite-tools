import { Config } from "@environment";
import { sidebarMenuVersion } from "sidebarmenus/sidebarMenuVersion";

function onOpen(): void {
  const ui = SpreadsheetApp.getUi();

  ui.createMenu(Config.PROJECT_NAME)
    .addItem("Version", "sidebarMenuVersion")
    .addToUi();
}
