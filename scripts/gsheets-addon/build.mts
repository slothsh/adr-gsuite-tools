import { Config } from "@common/config.mts";
import { ERROR, Result } from "@common/logging.mts";
import configure from "./configure.mts";
import buildLibrary from "./buildLibrary.mts";
import buildMarkdown from "./buildMarkdown.mts";
import buildMarkdownDevelopment from "./buildMarkdownDevelopment.mts";
import buildRuntimeEnvironment from "./buildRuntimeEnvironment.mts";
import buildRuntimeStaticData from "./buildRuntimeStaticData.mts";
import buildStatic from "./buildStatic.mts";
import assemble from "./assemble.mts";

// -----------------------------------------------------------------------------
//
// -- @SECTION G-Sheets Addon Build Entry Point --
//
// -----------------------------------------------------------------------------

try {
    fail_on_error(await configure());
    fail_on_error(await buildRuntimeEnvironment());
    fail_on_error(await buildRuntimeStaticData());
    fail_on_error(await buildMarkdown());

    if (Config.ENVIRONMENT == "DEVELOPMENT") {
        fail_on_error(await buildMarkdownDevelopment()); // TODO: dispatch on dev or prod build
    } else {
        fail_on_error(await buildLibrary());
    }

    fail_on_error(await buildStatic());
    fail_on_error(await assemble());
} catch (error) {
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
