import { resolve } from "node:path";
import { BUILD_DIR_CACHE } from "./paths.mts";

// -----------------------------------------------------------------------------
//
// -- @SECTION Path Aliases --
//
// -----------------------------------------------------------------------------

export const BUILD_TIME_ALIASES = {
    name: 'build-time-aliases',
    setup(build: any) {
        build.onResolve({ filter: /^@environment$/ }, (args: any) => {
            return { path: resolve(BUILD_DIR_CACHE, "clientConfig.js") }
        });

        build.onResolve({ filter: /^@html$/ }, (args: any) => {
            return { path: resolve(BUILD_DIR_CACHE, "clientHtmlFiles.js") }
        });

        build.onResolve({ filter: /^@dictionaries$/ }, (args: any) => {
            return { path: resolve(BUILD_DIR_CACHE, "clientStaticData.js") }
        });
    },
}

// -----------------------------------------------------------------------------
