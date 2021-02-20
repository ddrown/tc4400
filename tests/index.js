const {cableParse} = require('../cableParse');
const {stateToInflux} = require('../stateToInflux');
const fs = require('fs');

const html = fs.readFileSync("connectionstatus.html");
const state = cableParse(html);
const measurements = stateToInflux(state);
console.log(measurements);
