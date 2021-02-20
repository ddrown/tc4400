const olderTypes = new Set(["QAM256", "ATDMA/ 2"]);
function isDocsis30(type) {
  return olderTypes.has(type);
}

function chanWidth(str) {
  const width = parseInt(str, 10);
  if(str.match(/ kHz$/)) {
    return width * 1000;
  }
  return width;
}

function stateToInfluxDownstream(downstream, channels, sums) {
  downstream.forEach((chan) => {
    if(chan["Lock Status"] !== "Locked") {
      return;
    }

    const newType = !isDocsis30(chan["Modulation/Profile ID"]);
    const typeStr = newType ? "3.1" : "3.0";
    const freq = parseInt(chan["Center Frequency"], 10);
    const width = chanWidth(chan["Channel Width"]);
    const snr = parseFloat(chan["SNR/MER Threshold Value"]);
    const strength = parseFloat(chan["Received Level"]);
    const unerrored = parseInt(chan["Unerrored Codewords"], 10);
    const corrected = parseInt(chan["Corrected Codewords"], 10);
    const uncorrectable = parseInt(chan["Uncorrectable Codewords"], 10);

    channels.push({
      measurement: 'channels',
      tags: { channel: `ds-${chan["Channel Index"]}` },
      fields: {
        snr, strength, unerrored, corrected, uncorrectable, newType
      }
    });

    const directionType = `ds-${typeStr}`;
    const sumData = sums[directionType] || {sumBw: 0};

    if(sumData.minFreq === undefined || sumData.minFreq > freq) {
      sumData.minFreq = freq;
    }
    if(sumData.maxFreq === undefined || sumData.maxFreq < freq) {
      sumData.maxFreq = freq;
    }
    sumData.sumBw += width;

    sums[directionType] = sumData;
  });
}

function stateToInfluxUpstream(upstream, channels, sums) {
  upstream.forEach((chan) => {
    if(chan["Lock Status"] !== "Locked") {
      return;
    }

    const newType = !isDocsis30(chan["Modulation/Profile ID"]);
    const typeStr = newType ? "3.1" : "3.0";
    const freq = parseInt(chan["Center Frequency"], 10);
    const width = chanWidth(chan["Channel Width"]);
    const strength = parseFloat(chan["Transmit Level"]);

    channels.push({
      measurement: 'channels',
      tags: { channel: `us-${chan["Channel Index"]}` },
      fields: {
        strength, newType
      }
    });

    const directionType = `us-${typeStr}`;
    const sumData = sums[directionType] || {sumBw: 0};

    if(sumData.minFreq === undefined || sumData.minFreq > freq) {
      sumData.minFreq = freq;
    }
    if(sumData.maxFreq === undefined || sumData.maxFreq < freq) {
      sumData.maxFreq = freq;
    }
    sumData.sumBw += width;

    sums[directionType] = sumData;
  });
}

function stateToInflux(state) {
  const channels = [];
  const sums = {};

  stateToInfluxDownstream(state.downstream, channels, sums);
  stateToInfluxUpstream(state.upstream, channels, sums);

  for(const property in sums) {
    const m = property.match(/^(..)-(.*)/);
    const direction = m[1];
    const type = m[2];

    channels.push({
      measurement: 'sum',
      tags: {
        direction,
        type
      },
      fields: sums[property]
    });
  }

  return channels;
}
exports.stateToInflux = stateToInflux;
