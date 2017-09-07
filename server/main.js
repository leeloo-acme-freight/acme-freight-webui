import Koa from 'koa';
import convert from 'koa-convert';
const _ = require('koa-route');
import webpack from 'webpack';
import historyApiFallback from 'koa-connect-history-api-fallback';
import serve from 'koa-static';
import proxy from 'koa-proxy';
import _debug from 'debug';
import webpackConfig from '../config/webpack.config';
import config from '../config';
import webpackDevMiddleware from './middleware/webpack-dev';
import webpackHMRMiddleware from './middleware/webpack-hmr';
import ConversationV1 from 'watson-developer-cloud/conversation/v1'

const debug = _debug('app:server');
const paths = config.utils_paths;
const app = new Koa();

//Send a web socket notification to Dashboard.jsx to update state.
app.use(_.get('/refresh', (ctx) => {
    io.emit('refresh', { time: new Date().toJSON() });
    ctx.body = 'OK';
}));

// Enable koa-proxy if it has been enabled in the config.
if (config.proxy && config.proxy.enabled) {
  app.use(convert(proxy(config.proxy.options)));
}

// This rewrites all routes requests to the root /index.html file
// (ignoring file requests). If you want to implement isomorphic
// rendering, you'll want to remove this middleware.
app.use(convert(historyApiFallback({
  verbose: false,
})));

// ------------------------------------
// Apply Webpack HMR Middleware
// ------------------------------------
if (config.env === 'development') {
  const compiler = webpack(webpackConfig);

  // Enable webpack-dev and webpack-hot middleware
  const { publicPath } = webpackConfig.output;

  app.use(webpackDevMiddleware(compiler, publicPath));
  app.use(webpackHMRMiddleware(compiler));

  // Serve static assets from ~/src/static since Webpack is unaware of
  // these files. This middleware doesn't need to be enabled outside
  // of development since this directory will be copied into ~/dist
  // when the application is compiled.
  app.use(serve(paths.client('static')));
}
else {
  debug(
    'Server is being run outside of live development mode, meaning it will ' +
    'only serve the compiled application bundle in ~/dist. Generally you ' +
    'do not need an application server for this and can instead use a web ' +
    'server such as nginx to serve your static files. See the "deployment" ' +
    'section in the README for more information on deployment strategies.'
  );

  // Serving ~/dist by default. Ideally these files should be served by
  // the web server and not the app server, but this helps to demo the
  // server in production.
  app.use(serve(paths.dist()));
}

var server = require('http').Server(app.callback()),
    io = require('socket.io')(server, { origins: '*:*'});

io.origins('*:*');

// Watson Services

// If needed to run locally, create a `.env` file with these credentials
const conversation = new ConversationV1({
  username: process.env.WAT_CONV_USERNAME,
  password: process.env.WAT_CONV_PASSWORD,
  path: { workspace_id: process.env.WAT_CONV_WORKSPACE },
  version_date: '2016-07-11'
});

var context = null;
const askWatson = (question, socket) => {
  // Start conversation with empty message.
  console.log("Question: " + question);
  conversation.message({
    input: {
      text: question
    },
    context: context
  }, processResponse);

  // Process the conversation response.
  function processResponse(err, response) {
    if (err) {
      console.error(err); // something went wrong
      return;
    }

    // Display the output from dialog, if any.
    if (response.output.text.length != 0) {
      console.log("Answer: " + response.output.text[0]);
      context = response.context;
      socket.emit('resWatson', response.output.text[0])
    }
  }
}

// Socket.io
io.on('connection', (socket) => {
  socket.emit('news', { hello: 'world' });
  socket.on('time', (data) => {
    socket.emit('time', { message: 'world' });
    console.log(data);
  });
  socket.on('reqWatson', (data) => {
    askWatson(data, socket);
  });
});

export default server;
