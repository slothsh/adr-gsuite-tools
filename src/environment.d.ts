// Copyright (c) 2024 Stefan Olivier
// <https://stefanolivier.com>


// Client Environement
// --------------------------------------------------------------------------------

export declare namespace Config {
    export const ENVIRONMENT: string;
    export const PACKAGE_CONFIG_PATH: string;
    export const PACKAGE_CONFIG: { [key: string]: any };
    export const VERSION: string;
    export const VERSION_MAJOR: string;
    export const VERSION_MINOR: string;
    export const VERSION_SUB: string;
    export const COMMIT_HASH: string;
    export const AUTHOR: string;
    export const AUTHOR_EMAIL: string;
    export const AUTHOR_WEBSITE: string;
    export const PROJECT_NAME: string;
    export const PROJECT_DESCRIPTION: string;
    export const LICENSE_FILE_PATH: string;
    export const LICENSE: string;
    export const LICENSE_TYPE: string;
    export const DEVELOPMENT_HOST_URL: string
    export const DEVELOPMENT_HOST_PORT: number
    export const DEVELOPMENT_MARKDOWN_PATH: string
}

// --------------------------------------------------------------------------------


// Google Client Side Interfaces
// --------------------------------------------------------------------------------

export declare const google: {
    script: {
        host: {
            close(): void,
        }
    }
};

// --------------------------------------------------------------------------------
