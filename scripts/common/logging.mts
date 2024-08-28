// -----------------------------------------------------------------------------
//
// -- @SECTION Logging Prefixes --
//
// -----------------------------------------------------------------------------

export const ERROR = "[ERROR]";
export const WARN = "[WARN]";
export const INFO = "[INFO]";

// -----------------------------------------------------------------------------


// -----------------------------------------------------------------------------
//
// -- @SECTION Result --
//
// -----------------------------------------------------------------------------

export const enum ResultKind {
    OK,
    ERROR,
}

export class Result {
    constructor(kind: ResultKind, message?: string) {
        this.kind = kind;
        if (message)
            this.message = message;
    }

    kind: ResultKind;
    message: string = "";

    success(): boolean {
        return this.kind === ResultKind.OK;
    }
    
    error(): boolean {
        return this.kind === ResultKind.ERROR;
    }

    context(): string {
        return this.message;
    }
}

export function Ok(message?: string) {
    return new Result(ResultKind.OK, message ?? "");
}

export function Err(message: string) {
    return new Result(ResultKind.ERROR, message);
}

// -----------------------------------------------------------------------------
