import { resolve } from "node:path";

// -----------------------------------------------------------------------------
//
// -- @SECTION Project Paths --
//
// -----------------------------------------------------------------------------

export const BASE_DIR = resolve(process.env.BASE_DIR || __dirname);
export const SRC_DIR = resolve(BASE_DIR, "src");
export const WEBSITE_DIR = resolve(BASE_DIR, "website");
export const BUILD_DIR = resolve(BASE_DIR, "build");
export const SCRIPTS_DIR = resolve(BASE_DIR, "scripts");
export const STATIC_FILES_DIR = resolve(BASE_DIR, "static");
export const DATA_DIR = resolve(BASE_DIR, "data");
export const TSCONFIG_PATH = resolve(BASE_DIR, "tsconfig.json");

export const SRC_LIBRARY_DIR = resolve(SRC_DIR, "library");
export const SRC_MARKDOWN_DIR = resolve(SRC_DIR, "markdown");
export const SRC_DEVELOPMENT_DIR = resolve(SRC_DIR, "development");
export const SRC_CSS_LOAD_PATHS = [SRC_MARKDOWN_DIR, resolve(BASE_DIR, "node_modules/bootstrap/scss")];
export const SCRIPTS_CONFIG_DIR = resolve(SCRIPTS_DIR, "configs");
export const WEBSITE_ROUTES_DIR = resolve(WEBSITE_DIR, "routes");
export const WEBSITE_PUBLIC_DIR = resolve(WEBSITE_DIR, "public");
export const WEBSITE_ASSETS_DIR = resolve(WEBSITE_DIR, "assets");
export const BUILD_DIR_LIBRARY = resolve(BUILD_DIR, "library");
export const BUILD_DIR_MARKDOWN = resolve(BUILD_DIR, "markdown");
export const BUILD_DIR_STATIC = resolve(BUILD_DIR, "static");
export const BUILD_DIR_CACHE = resolve(BUILD_DIR, "cache");
export const BUILD_DIR_DEVELOPMENT = resolve(BUILD_DIR, "development");
export const BUILD_DIR_ENVIRONEMNT = resolve(BUILD_DIR, "environment");
export const BUILD_DIR_WEBSITE = resolve(BUILD_DIR, "website");
export const DIST_DIR = resolve(BUILD_DIR, "dist");

// -----------------------------------------------------------------------------

