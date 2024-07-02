export const enum ErrorKind {
    INFO,
    WARNING,
    FATAL,
}

export const enum ErrorAction {
    TERMINATE,
    LOG_USER,
    LOG_SYSTEM,
}

export interface Error {
    kind: ErrorKind,
    actions?: Array<ErrorAction>,
}
