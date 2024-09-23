## Tools for Adrenaline Studios

A toolkit that provides you with a handy suite of functions and utilities
for performing localisation tasks inside of Sheets.

## Install Dependencies

```bash
npm i
```

___

## Build Add-On

Build distribution package for Sheets Add-On.

```bash
npm run build

```
The package will be found in `build/dist`.

### Push Add-On to Google Scripts Projects

A configuration file is required for `clasp` to push to the correct Google Apps
Script project.

Create a `.clasp.json` in the root of the project with the following contents,
replacing the value of the `scriptId` field with the Google Apps Script Project
ID.

Note: use the script ID of the project linked to the GCP project - it must be
the project that will be used to deploy to the Google Add-On Marketplace.


```json
{
    "scriptId": "YOUR SCRIPT ID HERE",
    "rootDir": "./build/dist"
}
```

Then we are ready to push:


```bash
# If you haven't already:
clasp login

clasp push

```

___

## Build Website

The promotional website can be built with the following:

```bash
npm run website

```

The distributable website will be found in `build/website`.

**NOTE**

A Github Workflow, `publish-package.yml`, is configured to run on every push
that has a new git tag. This is a convenience for packaging the website for
easy download by the backend server.

___

## Development

### Side Bar Viewer

When developing new side-bar applications for the Sheets add-on, use the
following command to host a local viewer.

The viewer will accessible at `http://localhost:8888`

```bash
npm run serve-viewer

```

### Local Website Server

A static site of the promotional website can be served locally for development
purposes.

The site will accessible at `http://localhost:8888`

```bash
npm run serve-website
```

### Clean Build

```bash
npm run clean
```

___
