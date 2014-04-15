var _ = require('lodash');

exports.server = function serverNavigator(req, res) {
  var queryString = require('query-string');
  var router = {};
  
  var state = {
    path: req.path,
    params: req.query,
    title: ''
  };

  router.route = function route(path, params, title) {
    state.path = path || state.path || router.getPath();
    state.params = params || state.params || {};

    var search = '';
    if (!_.isEmpty(state.params)) {
      search = '?' + queryString.stringify(state.params);
    }
    var target = path+search;
    console.log('Redirecting '+target);
    res.redirect(target);
  }

  router.setPath = function setPath(path) {
    router.route(path, state.params, state.title);
  }

  router.setTitle = function setTitle(title) {
    state.title = title;
  }

  router.setParams = function setParams(params) {
    router.route(state.path, params, state.title);
  }

  router.getPath = function getPath() {
    return state.path;
  }

  router.getTitle = function getTitle() {
    return state.title;
  }

  router.getParams = function getParams() {
    return state.params;
  }

  router.getParam = function getParam(paramName) {
    var params = router.getParams();
    var param = params[paramName];
    return param;
  }

  router.hasParam = function hasParam(paramName) {
    var param = router.getParam(paramName);
    if (_.isUndefined(param)) return false;
    else return true;
  }

  router.setParam = function setParam(paramName, value) {
    if (_.isUndefined(value)) value = null;
    var params = router.getParams();
    params[paramName] = value;
    router.setParams(params);
  }

  router.removeParam = function removeParam(paramName) {
    var params = router.getParams();
    delete params[paramName];
    router.setParams(params);
  }

  router.toggleParam = function toggleParam(paramName, value) {
    if (router.hasParam(paramName)) {
      router.removeParam(paramName);
    } else {
      router.setParam(paramName, value);
    }
  }

  return router;
}

exports.browser = function browserNavigator(window) {
  // well, uh. no need to pass window because browser-router can already see it. globals are awkward
  var router = require('browser-router');
  return router;
}