import { BASE_DIR } from "@common/paths.mts";
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// -----------------------------------------------------------------------------
//
// -- @SECTION Compile Time Config for Runtime --
//
// -----------------------------------------------------------------------------

export module Config {
    export const ENVIRONMENT = process.env.ENVIRONMENT || "DEVELOPMENT";
    export const PACKAGE_CONFIG_PATH = "package.json";
    export const PACKAGE_CONFIG: { [key: string]: any } = JSON.parse(readFileSync(resolve(BASE_DIR, PACKAGE_CONFIG_PATH), "utf-8"));
    export const VERSION: string = PACKAGE_CONFIG["version"];
    export const [VERSION_MAJOR, VERSION_MINOR, VERSION_SUB] = VERSION.split(".");
    export const COMMIT_HASH: string = execSync("git rev-parse HEAD").toString().trim();
    export const AUTHOR = PACKAGE_CONFIG["author"];
    export const AUTHOR_EMAIL = PACKAGE_CONFIG["authorEmail"];
    export const AUTHOR_WEBSITE = PACKAGE_CONFIG["authorWebsite"];
    export const PROJECT_NAME = PACKAGE_CONFIG["name"];
    export const PROJECT_DESCRIPTION = PACKAGE_CONFIG["description"];

    export const LICENSE_FILE_PATH = "LICENSE";
    export const LICENSE = readFileSync(LICENSE_FILE_PATH, "utf-8")
        .toString()
        .trim();

    export const LICENSE_TYPE = PACKAGE_CONFIG["license"];

    export const DEVELOPMENT_HOST_URL: string = "http://localhost";
    export const DEVELOPMENT_HOST_PORT: number = 8888;
    export const DEVELOPMENT_MARKDOWN_PATH: string = "markdown";
}

// -----------------------------------------------------------------------------
