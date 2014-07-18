
var bakhan = require('./lib')
  , node = document.getElementById('main-canvas')

window.BKA = new bakhan.Demo(node, {width: 900, height: 500});
window.BKA.run();
