# Supernavigate

A router which miraculously works on the client and server.

#### Install

`npm install supernavigate`

## supernavigate.server(req, res);

#### Usage

```
app.get('*', function(req, res) {
  var router = new supernavigate.server(req, res);
  ...
});
```

## supernavigate.browser(window);

#### Usage

```
var router = new supernavigate.browser(window);
...
```

### Special methods

Because the route can change on the browser, we have event listeners for that:

#### router.onRoute(handler)

#### router.offRoute(handler)


## supernavigate methods

### router.route(path, params, title);
### router.getPath()
### router.setPath(path)
### router.getParams()
### router.setParams(paramsObj)
### router.hasParam(param)
### router.getParam(param)
### router.setParam(param, val)
### router.removeParam(param)
### router.toggleParam(param)

