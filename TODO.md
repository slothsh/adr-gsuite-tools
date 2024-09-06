# Categories

- [B]      BUG: Issues in code-base that must be resolved.
- [F]  FEATURE: New features that must be implemented.
- [P]    PROBE: Ideas or technologies that must be explored.
- [R] REVISION: Existing code that must be revised and restructured.

___

## 2024-09-05

- [ ] [F] Use the IntersectionObserver API to transition elements on main page

___

## 2024-09-04

- [ ] [F] nginx configuration file build for website
- [ ] [F] Custom error pages for website
- [ ] [F] Add FAQ section
- [ ] [F] Add installation guide 
- [ ] [F] Create site content (images, icons, copy, etc)
- [ ] [F] Video demonstration content
- [ ] [F] Reactive layout for mobile + other screens

- [ ] [R] Add social links to contact page
- [ ] [R] Review and verify website privacy policy
- [ ] [R] Review and verify website terms and conditions
- [ ] [R] Verify that contact email addresses are reachable
- [ ] [R] Work on website intro transitions
- [ ] [R] Animations for website interactive components
- [ ] [R] Spruce up website styling (colors, shadows, etc)
- [ ] [R] Cleanup website common markup components (factor out into source files + integrate into build)
- [ ] [R] De-duplicate website markup + style code into common

___

## 2024-09-02

- [ ] [R] Fix iife markdown scripts running during build
- [ ] [R] Remove dead-code from shared style assets when compiling

___

## 2024-08-29

- [X] [F] Parse style links in website markup templates and replace with emitted paths

___

## 2024-08-28

- [ ] [R] Extract library code into lib/ common directory
- [ ] [R] Only application code inside of src/
- [X] [R] Segment builds into script modules
- [ ] [R] Namespace build scripts/helpers
- [ ] [R] Remove globals from common build helpers
- [ ] [R] Factor out inlined dictionary data file paths to common paths for run-time static data build
- [ ] [R] Better build diagnostic messages
- [ ] [R] Incorporate stat command to check if rebuilds are required for certain files 

___

## 2024-07-04

- [X] [B] Parse AST to inject TS code during development markdown template compilation

- [X] [R] Extend root project tsconfig.json for build/client code

___

## 2024-06-14

- [ ] [R] Prune unused packages & dependencies

___

## 2024-06-13

- [X] House-keeping: extract categories of common functions in build scripts
- [X] De-duplicate build script functions/copied code
- [X] Configure tsconfig.json

___
