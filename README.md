# ys-micro

[YS](https://github.com/yskit/ys-mutify) 架构之微服务启动架构。

# Install

```bash
npm install ys-micro --save
```

# Usage

```javascript
const Micro = require('ys-micro');
```

## Server Side

```javascript
const Service = require('ys-micro').Server;
const server = new Service();
server.use(async (ctx, next) => {
  console.log('url', ctx.url);
  console.log('data', ctx.data);
  ctx.body = 'receive';
});
server.listen(6000, err => {
  if (err) return console.error(err.message);
  console.log('net server start on 127.0.0.1:6000');
});
```

## Client Side

```javascript
const Client = require('ys-micro').Client;
Client('127.0.0.1:6000/path/to/1222/reply', {
  a: 1,
  b: 2
}).then(console.log).catch(console.error);
```

# License

It is [MIT licensed](https://opensource.org/licenses/MIT).