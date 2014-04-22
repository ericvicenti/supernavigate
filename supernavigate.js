var _ = require('lodash');

var queryString = require('query-string');

function _calculateUrl(path, params) {
  var search = '';
  if (!_.isEmpty(params)) {
    search = '?' + queryString.stringify(params);
  }
  var target = path+search;
  return target;
};

function _getUrlUtils(router) {
  return {
    setPath: function(path) {
      return _calculateUrl(path, router.getParams());
    },
    setParams: function(params) {
      return _calculateUrl(router.getPath(), params);
    },
    setParam: function(param, val) {
      var params = router.getParams();
      params[param] = val;
      return _calculateUrl(router.getPath(), params);
    },
    removeParam: function(param) {
      var params = router.getParams();
      delete params[param];
      return _calculateUrl(state.path, params);
    },
    toggleParam: function(param) {
      var params = router.getParams();
      if (_.isUndefined(params[param])) {
        delete params[param];
      } else {
        params = null;
      }
      return _calculateUrl(state.path, params);
    },
    route: function(path, params, title) {
      return _calculateUrl(path, params);
    }
  };
};
exports.server = function serverNavigator(req, res) {
  var router = {};
  
  var state = {
    path: req.path,
    params: req.query,
    title: ''
  };

  router.url = _getUrlUtils(router);

  router.route = function route(path, params, title) {
    // no title mgmt on server.. just raw redirect
    state.path = path || state.path || router.getPath();
    state.params = params || state.params || {};

    var target = _calculateUrl(state.path, state.params);

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

  var History = require('html5-history');

  var router = {};

  var state = {};

  router.route = function route(path, params, title) {
    state.path = path || state.path || router.getPath();
    state.params = params || state.params || {};
    state.title = title || state.title || '';

    var target = _calculateUrl(state.path, state.params);
    History.pushState(state.params, state.title, target);
  }

  router.url = _getUrlUtils(router);

  var currentHandlers = [];

  History.Adapter.bind(window, 'statechange', function() {
    state.path = router.getPath();
    state.params = router.getParams();
    state.title = router.getTitle();
    _.each(currentHandlers, function(handler) {
      handler(state.path, state.params, state.title);
    });
  });

  router.onRoute = function(handler) {
    currentHandlers = _.union(currentHandlers, [ handler ]);
  }

  router.offRoute = function(handler) {
    currentHandlers = _.without(currentHandlers, handler);
  }

  router.getPath = function getPath() {
    var path = window.location.pathname;
    return path;
  }

  router.setPath = function setPath(path) {
    router.route(path, state.params, state.title);
  }

  router.getTitle = function getTitle() {
    var title = window.document.title;
    return title;
  }

  router.setTitle = function setTitle(title) {
    window.document.title = state.title = title;
  }

  router.getParams = function getParams() {
    var params = queryString.parse(window.location.search);
    return params;
  }

  router.getParam = function getParam(paramName) {
    var params = router.getParams();
    var param = params[paramName];
    return param;
  }

  router.setParams = function setParams(params) {
    router.route(state.path, params, state.title);
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