import { ERROR, Result } from "@common/logging.mts";
import configure from "./configure.mts";
import buildRoutes from "./buildRoutes.mts";

// -----------------------------------------------------------------------------
//
// -- @SECTION G-Sheets Addon Build Entry Point --
//
// -----------------------------------------------------------------------------

try {
    fail_on_error(await configure());
    fail_on_error(await buildRoutes());
} catch (error: any) {
    console.error(ERROR, error);
}

// -----------------------------------------------------------------------------


// -----------------------------------------------------------------------------
//
// -- @SECTION Helpers --
//
// -----------------------------------------------------------------------------

function fail_on_error(result: Result) {
    if (result.error()) {
        console.error(ERROR, result.context());
        process.exit(1);
    }
}

// -----------------------------------------------------------------------------
