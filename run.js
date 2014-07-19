
var bakhan = require('./lib')
  , node = document.getElementById('main-canvas')

var name = window.location.search.slice(1).replace(/[^\w]/, '') || 'Demo'
window.BKA = new bakhan[name](node, {width: 900, height: 700});
window.BKA.run();
