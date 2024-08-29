import { BUILD_DIR, BUILD_DIR_WEBSITE } from "@common/paths.mts";
import { INFO, ERROR, Result, Ok, Err } from "@common/logging.mts";
import { existsSync, mkdirSync } from "node:fs";

// -----------------------------------------------------------------------------
//
// -- @SECTION Configure Build --
//
// -----------------------------------------------------------------------------

const DIRECTORIES = [
    BUILD_DIR,
    BUILD_DIR_WEBSITE,
];

export default async function(): Promise<Result> {
    try {
        for (const path of DIRECTORIES) {
            console.log(INFO, `creating build directory @ "${path}"`);
            if (!existsSync(path)) {
                mkdirSync(path);
            }
        }
    }

    catch (error: any) {
        return Err(`failed to configure build directories with message: ${error}`);
    }

    return Ok();
}

// -----------------------------------------------------------------------------
