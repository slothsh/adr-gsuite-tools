import fg from "fast-glob";
import { INFO, ERROR, Result, Ok } from "@common/logging.mts";
import { WEBSITE_PUBLIC_DIR, WEBSITE_ASSETS_DIR, BUILD_DIR_WEBSITE } from "@common/paths.mts";
import { relative, extname, resolve, dirname, basename } from "node:path";
import { copyFileSync } from "node:fs";

// -----------------------------------------------------------------------------
//
// -- @SECTION Static Files --
//
// -----------------------------------------------------------------------------

const STATIC_FILES = fg.sync(resolve(WEBSITE_ASSETS_DIR, "**/*"))
    .filter((file) => {
        return extname(file) !== ".scss" && extname(file) !== "css";
    });

const PUBLIC_FILES = fg.sync(resolve(WEBSITE_PUBLIC_DIR, "**/*"));

// -----------------------------------------------------------------------------


// -----------------------------------------------------------------------------
//
// -- @SECTION Build Static Files --
//
// -----------------------------------------------------------------------------

export default async function(): Promise<Result> {
    for (const file of STATIC_FILES) {
        try {
            console.log(INFO, `copying static file "${file}" to build`);
            const outputFile = resolve(BUILD_DIR_WEBSITE, "routes", "assets", relative(WEBSITE_ASSETS_DIR, dirname(file)), basename(file));
            copyFileSync(file, outputFile);
        }

        catch (error: any) {
            console.error(ERROR, `failed to copy static file @ "${file}" during static file build: ${error}`);
        }
    }

    for (const file of PUBLIC_FILES) {
        try {
            console.log(INFO, `copying static file "${file}" to build`);
            const outputFile = resolve(BUILD_DIR_WEBSITE, "routes", basename(file));
            copyFileSync(file, outputFile);
        }

        catch (error: any) {
            console.error(ERROR, `failed to copy static file @ "${file}" during static file build: ${error}`);
        }
    }

    return Ok();
}

// --------------------------------------------------------------------------------
