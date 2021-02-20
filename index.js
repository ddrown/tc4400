const fetch = require('node-fetch');
const config = require('./config');
const Influx = require('influx');
const {cableParse} = require('./cableParse');
const {stateToInflux} = require('./stateToInflux');
const influxdb = require('./influxdb');

function printStatus(s) {
  console.log(`${s.channel[1]}[${s.channel[2]}] ${s.connectivity[1]}[${s.connectivity[2]}] ${s.boot[1]}[${s.boot[2]}] ${s.security[1]}[${s.security[2]}]`);
}

function printChannels(ch) {
  ch.forEach((c) => console.log(Object.values(c).join(" ")));
}

async function getStatus() {
  const authHeader = Buffer.from(`${config.username}:${config.password}`).toString("base64");
  const headers = {
    "Authorization": `Basic ${authHeader}`
  };
  const url = "http://192.168.100.1/cmconnectionstatus.html";
  try {
    const html = await fetch(url, {headers, timeout: 30000}).then(res => res.text());
    const state = cableParse(html);
    printStatus(state.connection);
    console.log("downstream");
    printChannels(state.downstream);
    console.log("upstream");
    printChannels(state.upstream);
    console.log("---");

    const measurements = stateToInflux(state);
    await influx.writePoints(measurements);
  } catch(e) {
    console.error(e);
  }
  setTimeout(getStatus, 60000);
}

const influx = influxdb.connect();
getStatus();
