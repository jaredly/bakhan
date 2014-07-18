
var bakhan = require('./lib')
  , node = document.getElementById('main-canvas')

window.BKA = new bakhan[window.location.search.slice(1) || 'Demo'](node, {width: 900, height: 700});
window.BKA.run();
