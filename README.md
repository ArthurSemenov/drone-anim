#### Installation
- Install [node](http://nodejs.org) -- if not yet installed
- go to the project root folder
- run `npm install` or `yarn`

#### Project builds and running:
- production build:
    - `gulp prod`
- build all static:
    - `gulp build`
- watcher and local server:
    - `gulp dev`
- for compile styles only:
    - `gulp style:build`

Each task must be run with argument `--p ProjectFolderName` to build specific project.

For example: `gulp build --p ProjectFolderName`
