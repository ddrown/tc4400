const {parse} = require('node-html-parser');

function cableParse(html) {
  const dom = parse(html);
  const tables = dom.querySelectorAll("table");
  return {
    connection: statusTable(tables[0]),
    downstream: channelTable(tables[1]),
    upstream: channelTable(tables[2])
  };
}
exports.cableParse = cableParse;

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
  const headers = toTdText(tr[1]);
  const channels = [];
  for(let i = 2; i < tr.length; i++) {
    const ds = toTdText(tr[i]).reduce(
      (obj, td, index) => {
        key = headers[index];
        return { ...obj, [key]: td };
      },
      {}
    );
    channels.push(ds);
  }
  return channels;
}
