export function parseBoolean(value: string) {
    switch (value) {
        case "true":
        case "false":
        case "yes":
        case "no":
        case "0":
        case "1": {
            return value === "true" || value === "yes" || value === "1";
        }

        default: {
            throw new Error("attempted to parse invalid boolean value");
        }
    }
}
