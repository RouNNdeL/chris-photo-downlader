'use strict';

const processor = require("./processor");
const argv = require("yargs").argv;

let url = argv["url"] || argv["u"] || argv["_"][0];
let batch = argv["a"] || argv["all"] || argv["batch"] || false;

processor.process(url, batch);