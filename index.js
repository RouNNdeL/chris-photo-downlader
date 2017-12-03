'use strict';

const processor = require("./processor");

let url = process.argv[2];
let dir = process.argv[3];

processor.process(url, dir);