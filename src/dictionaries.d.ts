// Author 2024 Stefan Olivier
// <https://stefanolivier.com>

import { type Locale, type LocalePair } from "@src/library/locale/locale.ts";
import { Node } from "@src/library/containers/prefixTree.ts";

// Client Static Dictionaries
// --------------------------------------------------------------------------------

export declare const US_TO_UK: Node;
export declare const UK_TO_US: Node;
export declare const LOCALE_PAIRS_MAPPING: {
    [L in LocalePair]?: Node
}

// --------------------------------------------------------------------------------
