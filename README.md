# Tiny File Manager
A tiny web file manager made in pure [NodeJs](https://nodejs.org/). It was inspired by
a [PHP](https://php.net) version of a [tiny file manager](https://github.com/prasathmani/tinyfilemanager).

Used a way to asses the difference between PHP and NodeJS on server side.

## Requirements

* NodeJs 18

## Install nodemon module
```bash
npm install nodemon
```

## Run it
```bash
nodemon tinyfm.js
```


## Dev (run & debug) with Visual Studio Code 
Add following configuration to launch.json
```json
{
    "name": "nodemon",
    "console": "integratedTerminal",
    "internalConsoleOptions": "neverOpen",
    "program": "${workspaceFolder}/tinyfm.js",
    "request": "launch",
    "restart": true,
    // "runtimeExecutable": "nodemon", /* ORIGINAL VALUE */
    "runtimeExecutable": "${workspaceFolder}/node_modules/nodemon/bin/nodemon.js",
    "type": "node"
}
```

