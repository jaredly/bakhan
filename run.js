
var bakhan = require('./lib')
  , node = document.getElementById('main-canvas')

new bakhan.Orbit(node, {width: 900, height: 500}).run();

