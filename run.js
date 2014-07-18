
var bakhan = require('./lib')
  , node = document.getElementById('main-canvas')

if (window.location.search.indexOf('orbit') > -1) {
    window.BKA = new bakhan.Orbit(node, {width: 1400, height: 700});
} else {
    window.BKA = new bakhan.Demo(node, {width: 900, height: 500});
}
window.BKA.run();
