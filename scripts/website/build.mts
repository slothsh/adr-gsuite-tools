import { ERROR, Result } from "@common/logging.mts";
import configure from "./configure.mts";
import buildRoutes from "./buildRoutes.mts";
import buildStylesheetAssets from "./buildStylesheetAssets.mts";
import buildStatic from "./buildStatic.mts";

// -----------------------------------------------------------------------------
//
// -- @SECTION G-Sheets Addon Build Entry Point --
//
// -----------------------------------------------------------------------------

try {
    Result.exit_error(await configure());
    Result.exit_error(await buildRoutes());
    Result.exit_error(await buildStylesheetAssets());
    Result.exit_error(await buildStatic());
} catch (error: any) {
    console.error(ERROR, error);
}

// -----------------------------------------------------------------------------
