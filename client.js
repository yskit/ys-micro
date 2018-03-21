const net = require('net');

module.exports = function MicroSmartClient(url, data) {
  const exec = /^(\d+\.\d+\.\d+\.\d+)\:(\d+)(.+)$/.exec(url);
  if (!exec) {
    throw new Error('url is invalid');
  }
  return new Promise((resolve, reject) => {
    let result;
    const client = net.createConnection({
      port: Number(exec[2]),
      host: Number(exec[1])
    }, () => {
      client.write(JSON.stringify({
        url: exec[3] || '/',
        data
      }));
    });
    client.on('data', data => {
      client.end();
      const res = JSON.parse(data.toString());
      if (res.status === 200) {
        return resolve(res.response);
      }
      const err = new Error(res.message);
      err.status = res.status || 500;
      return reject(err);
    })
  });
}