const Influx = require('influx');
const config = require('./config');

const schema = [
  {
    measurement: 'channels',
    fields: {
      unerrored: Influx.FieldType.INTEGER,
      corrected: Influx.FieldType.INTEGER,
      uncorrectable: Influx.FieldType.INTEGER,
      snr: Influx.FieldType.FLOAT,
      strength: Influx.FieldType.FLOAT,
      newType: Influx.FieldType.BOOLEAN
    },
    tags: [
      'channel'
    ]
  },
  {
    measurement: 'sum',
    fields: {
      minFreq: Influx.FieldType.INTEGER,
      maxFreq: Influx.FieldType.INTEGER,
      sumBw: Influx.FieldType.INTEGER
    },
    tags: [
      'direction', 'type'
    ]
  }
];

function connect() {
  const connection = {
    ...config.influxdb,
    schema
  };
  const influx = new Influx.InfluxDB(connection);
  return influx;
}
exports.connect = connect;
