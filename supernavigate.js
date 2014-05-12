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
      return _calculateUrl(router._path, params);
    },
    toggleParam: function(param) {
      var params = router.getParams();
      if (_.isUndefined(params[param])) {
        delete params[param];
      } else {
        params = null;
      }
      return _calculateUrl(router._path, params);
    },
    route: function(path, params, title) {
      return _calculateUrl(path, params);
    }
  };
};
exports.server = function serverNavigator(req, res) {
  var router = {};
  
  router._path = req.path;
  router._params = req.query;
  router._title = '';

  router.url = _getUrlUtils(router);

  router.route = function route(path, params, title) {
    // no title mgmt on server.. just raw redirect
    router._path = path || router._path || router.getPath();
    router._params = params || router._params || {};

    var target = _calculateUrl(router._path, router._params);

    res.redirect(target);
  }

  router.setPath = function setPath(path) {
    router.route(path, router._params, router._title);
  }

  router.setTitle = function setTitle(title) {
    router._title = title;
  }

  router.setParams = function setParams(params) {
    router.route(router._path, params, router._title);
  }

  router.getPath = function getPath() {
    return router._path;
  }

  router.getTitle = function getTitle() {
    return router._title;
  }

  router.getParams = function getParams() {
    return router._params;
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

  router.route = function route(path, params, title) {
    router._path = path || router._path || router.getPath();
    router._params = params || router._params || {};
    router._title = title || router._title || '';

    var target = _calculateUrl(router._path, router._params);
    History.pushState(router._params, router._title, target);
  }

  router.url = _getUrlUtils(router);

  var currentHandlers = [];

  History.Adapter.bind(window, 'statechange', function() {
    router._path = router.getPath();
    router._params = router.getParams();
    router._title = router.getTitle();
    _.each(currentHandlers, function(handler) {
      handler(router._path, router._params, router._title);
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
    router.route(path, router._params, router._title);
  }

  router.getTitle = function getTitle() {
    var title = window.document.title;
    return title;
  }

  router.setTitle = function setTitle(title) {
    window.document.title = router._title = title;
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
    router.route(router._path, params, router._title);
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