import fg from "fast-glob";
import { BUILD_DIR_LIBRARY, BUILD_DIR_MARKDOWN, BUILD_DIR_STATIC, DIST_DIR, } from "@common/paths.mts";
import { INFO, ERROR, Result, Ok, Err } from "@common/logging.mts";
import { basename, resolve } from "node:path";
import { copyFileSync, type PathLike } from "node:fs";

// -----------------------------------------------------------------------------
//
// -- @SECTION Assemble Build Files Build Step --
//
// -----------------------------------------------------------------------------

const BUILD_DIRECTORIES = [
    BUILD_DIR_LIBRARY,
    BUILD_DIR_MARKDOWN,
    BUILD_DIR_STATIC,
];

export default async function(): Promise<Result> {
    const distributionFiles: Array<PathLike> = fg.sync(
        BUILD_DIRECTORIES.map((path) => {
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
            return Err(`failed to copy distribution file @ "${file}" during build assembly`);
        }
    }

    return Ok();
}

// -----------------------------------------------------------------------------
