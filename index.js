const fetch = require('node-fetch');
const {parse} = require('node-html-parser');
const config = require('./config');

function toTdText(tr) {
  const tds = tr.querySelectorAll("td");
  return tds.map((td) => td.text);
}

function statusTable(table) {
  const tr = table.querySelectorAll("tr");
  const channel = toTdText(tr[2]);
  const connectivity = toTdText(tr[3]);
  const boot = toTdText(tr[4]);
  const security = toTdText(tr[6]);
  return {
    channel, connectivity, boot, security
  };
}

function channelTable(table) {
  const tr = table.querySelectorAll("tr");
  const channels = [];
  for(let i = 2; i < tr.length; i++) {
    const ds = toTdText(tr[i]);
    channels.push(ds);
  }
  return channels;
}

function printStatus(s) {
  console.log(`${s.channel[1]}[${s.channel[2]}] ${s.connectivity[1]}[${s.connectivity[2]}] ${s.boot[1]}[${s.boot[2]}] ${s.security[1]}[${s.security[2]}]`);
}

function printChannels(ch) {
  ch.forEach((c) => console.log(c.join(" ")));
}

async function getStatus() {
  const authHeader = Buffer.from(`${config.username}:${config.password}`).toString("base64");
  const headers = {
    "Authorization": `Basic ${authHeader}`
  };
  const url = "http://192.168.100.1/cmconnectionstatus.html";
  try {
    const html = await fetch(url, {headers, timeout: 30000}).then(res => res.text());
    const dom = parse(html);
    const tables = dom.querySelectorAll("table");
    printStatus(statusTable(tables[0]));
    console.log("downstream");
    printChannels(channelTable(tables[1]));
    console.log("upstream");
    printChannels(channelTable(tables[2]));
    console.log("---");
  } catch(e) {
    console.error(e);
  }
  setTimeout(getStatus, 1500);
}

getStatus();
