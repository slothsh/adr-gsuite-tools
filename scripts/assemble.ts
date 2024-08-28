import fg from "fast-glob";
import { BUILD_DIR_LIBRARY, BUILD_DIR_MARKDOWN, BUILD_DIR_STATIC, DIST_DIR, } from "@common/paths.mts";
import { INFO, ERROR, } from "@common/logging.mts";
import { basename, resolve } from "node:path";
import { copyFileSync, type PathLike } from "node:fs";

// -----------------------------------------------------------------------------
//
// -- @SECTION Assemble Build Files Build Step --
//
// -----------------------------------------------------------------------------

const buildDirectories = [
    BUILD_DIR_LIBRARY,
    BUILD_DIR_MARKDOWN,
    BUILD_DIR_STATIC,
];

const distributionFiles: Array<PathLike> = fg.sync(
    buildDirectories.map((path) => {
        return resolve(path, "**/*");
    })
);

for (const file of distributionFiles) {
    try {
        const outputFile = resolve(DIST_DIR, basename(file.toString()));
        console.log(INFO, `assembling file "${file}" into distribution`);
        copyFileSync(file, outputFile);
    }

    catch (error: any) {
        console.error(ERROR, `failed to copy distribution file @ "${file}" during build assembly`);
    }
}

// --------------------------------------------------------------------------------
