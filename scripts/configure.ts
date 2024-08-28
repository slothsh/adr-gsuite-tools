// Copyright (c) 2024 Stefan Olivier
// <https://stefanolivier.com>

import { BUILD_DIR, DIST_DIR, BUILD_DIR_LIBRARY, BUILD_DIR_MARKDOWN, BUILD_DIR_STATIC, BUILD_DIR_DEVELOPMENT, BUILD_DIR_CACHE, } from "@common/paths.mts";
import { INFO, ERROR } from "@common/logging.mts";
import { existsSync, mkdirSync } from "node:fs";

// -----------------------------------------------------------------------------
//
// -- @SECTION Configure Build --
//
// -----------------------------------------------------------------------------

const directories = [
    BUILD_DIR,
    DIST_DIR,
    BUILD_DIR_LIBRARY,
    BUILD_DIR_MARKDOWN,
    BUILD_DIR_STATIC,
    BUILD_DIR_DEVELOPMENT,
    BUILD_DIR_CACHE,
];

try {
    for (const path of directories) {
        console.log(INFO, `creating build directory @ "${path}"`);
        if (!existsSync(path)) {
            mkdirSync(path);
        }
    }
}

catch (error: any) {
    console.error(ERROR, `failed to configure build directories with message: ${error}`);
}

// -----------------------------------------------------------------------------
