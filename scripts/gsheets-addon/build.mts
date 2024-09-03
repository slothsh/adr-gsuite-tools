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
    Result.exit_error(await configure());
    Result.exit_error(await buildRuntimeEnvironment());
    Result.exit_error(await buildRuntimeStaticData());
    Result.exit_error(await buildMarkdown());

    if (Config.ENVIRONMENT == "DEVELOPMENT") {
        Result.exit_error(await buildMarkdownDevelopment()); // TODO: dispatch on dev or prod build
    } else {
        Result.exit_error(await buildLibrary());
    }

    Result.exit_error(await buildStatic());
    Result.exit_error(await assemble());
} catch (error: any) {
    console.error(ERROR, error);
}

// -----------------------------------------------------------------------------
