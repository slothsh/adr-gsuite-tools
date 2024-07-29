// Copyright (c) 2024 Stefan Olivier
// <https://stefanolivier.com>

import { copyFileSync, readFileSync } from "node:fs";
import { basename, resolve } from "node:path";
import fg from "fast-glob";
import {
    INFO,
    ERROR,
    STATIC_FILES_DIR,
    BUILD_DIR_STATIC,
} from "./common.ts";

// Static Files Step
// --------------------------------------------------------------------------------

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
