#!/usr/bin/env node

var tsToIo = require("./build/index.js");

console.log(tsToIo.getValidatorsFromFileNames());
