// Copyright (c) 2024 Stefan Olivier
// <https://stefanolivier.com>

import { type PathLike, existsSync, mkdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import Handlebars from "handlebars";
import {
    BASE_DIR,
    INFO,
    ERROR,
    BUILD_DIR,
    DIST_DIR,
    BUILD_DIR_LIBRARY,
    BUILD_DIR_MARKDOWN,
    BUILD_DIR_STATIC,
    BUILD_DIR_DEVELOPMENT,
    BUILD_DIR_CACHE,
} from "./common";

// Configure Directories
// --------------------------------------------------------------------------------

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

// --------------------------------------------------------------------------------
