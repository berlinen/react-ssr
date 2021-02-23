import express from 'express';
import proxy from 'express-http-proxy';
import { matchRoutes } from 'react-router-config';
import { render } from './utils';
import { getServerStore } from '../store';
import routes from '../Routes';
const path = require('path');
const process = require('process');

const app = express();
app.use(express.static('public'));

app.use('/api', proxy('http://127.0.0.1', {
  proxyReqPathResolver: function(req) {
    console.log('proxyReqPathResolver>>>>', req.path, req.url);
    return '/api/' + req.url
  }
}))

app.get('*', (req, res) => {
  const store = getServerStore(req);
  // 根据路由的路径，来往store里面加数据
  const matchedRoutes = matchRoutes(routes, req.path);
  // 让matchRoutes里面所有的组件，对应的loadData方法执行一次
  const promises = [];

  matchedRoutes.forEach(item => {
    if(item.route.loadData) {
      const promise = new Promise((resolve, reject) => {
        item.route.loadData(store)
          .then(resolve)
          .catch(e => {
            console.log(`${item.route.path}error`, e);
          })
      })
      promises.push(promise);
    }
  })
})