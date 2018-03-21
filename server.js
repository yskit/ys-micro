const net = require('net');
const compose = require('koa-compose');
const { EventEmitter } = require('events');
const hasOwnProperty = Object.prototype.hasOwnProperty;

module.exports = class MicroService extends EventEmitter {
  constructor(options = {}) {
    super();
    this.middleware = [];
    this.env = process.env.NODE_ENV || 'development';
    this.context = {};
    this.encode = options.encode || (data => JSON.stringify(data));
    this.decode = options.decode || (buffer => JSON.parse(buffer));
  }

  use(fn) {
    if (typeof fn !== 'function') throw new TypeError('middleware must be a function!');
    this.middleware.push(fn);
    return this;
  }

  listen(...args) {
    const server = net.createServer(this.callback());
    server.listen(...args);
    return server;
  }

  callback() {
    const fn = compose(this.middleware);

    if (!this.listeners('error').length) this.on('error', this.onerror);

    const handleRequest = socket => {
      socket.on('data', buffer => {
        const result = this.decode(buffer);
        if (!result.url) {
          return socket.write(this.encode({
            status: 400,
            message: 'Bad Request'
          }));
        }
        const ctx = this.createContext(socket, result);
        return this.handleRequest(ctx, fn, socket);
      });
    };

    return handleRequest;
  }

  handleRequest(ctx, fnMiddleware, socket) {
    const onerror = err => ctx.onerror(err, socket);
    const handleResponse = () => {
      ctx.socket.write(this.encode({
        status: ctx.status || 200,
        response: ctx.body
      }))
    };
    return fnMiddleware(ctx).then(handleResponse).catch(onerror);
  }

  createContext(socket, params) {
    const context = Object.create(this.context);
    for (const i in params) {
      if (hasOwnProperty.call(params, i)) {
        context[i] = params[i];
      }
    }
    context.app = this;
    context.socket = socket;
    return context;
  }

  onerror(err, socket) {
    const msg = err.stack || err.toString();
    if (this.env !== 'production' || this.env !== 'product') {
      console.error();
      console.error(msg.replace(/^/gm, '  '));
      console.error();
    }
    socket.write(this.encode({
      status: 500,
      message: msg
    }));
  }
}