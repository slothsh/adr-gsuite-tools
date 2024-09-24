export function prepareCustomDictionary(customDictionary: Array<Array<string>> | null): Map<string, string> | null {
    let pairedUserDictionary: Map<string, string> | null = null;
    if (customDictionary) {
        if (!(customDictionary instanceof Array))                                   { throw new Error("custom dictionary must be a range of 2 columns containing custom words and their mappings"); }
        if (customDictionary.length > 0 && !(customDictionary[0] instanceof Array)) { throw new Error("custom dictionary must be a range of 2 columns containing custom words and their mappings"); }
        if (customDictionary.length > 0 && customDictionary[0].length !== 2)        { throw new Error("custom dictionary must be a range of 2 columns containing custom words and their mappings"); }
        for (const row of customDictionary) {
            const trimmedSource = row[0].trim().toLowerCase();
            const trimmedDestination = row[1].trim().toLowerCase();
            if (trimmedSource !== "" && trimmedDestination !== "") {
                if (!pairedUserDictionary) { pairedUserDictionary = new Map(); }
                pairedUserDictionary.set(trimmedSource, trimmedDestination);
            }
        }
    }

    return pairedUserDictionary;
}
