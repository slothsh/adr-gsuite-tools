import fg from "fast-glob";
import { INFO, ERROR } from "@common/logging.mts";
import { STATIC_FILES_DIR, BUILD_DIR_STATIC, } from "@common/paths.mts";
import { basename, resolve } from "node:path";
import { copyFileSync } from "node:fs";

// -----------------------------------------------------------------------------
//
// -- @SECTION Static Files Step --
//
// -----------------------------------------------------------------------------

const staticFiles = fg.sync(resolve(STATIC_FILES_DIR, "**/*"));

for (const file of staticFiles) {
    try {
        console.log(INFO, `copying static file "${file}" to build`);
        const outputFile = resolve(BUILD_DIR_STATIC, basename(file));
        copyFileSync(file, outputFile);
    }

    catch (error: any) {
        console.error(ERROR, `failed to copy static file @ "${file}" during static file build`);
    }
}

// --------------------------------------------------------------------------------
