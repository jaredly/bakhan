
var bakhan = require('./lib')
  , node = document.getElementById('main-canvas')

var options = {
    width: 900,
    height: 700,
}

var name = window.location.search.replace(/&(\w+)=([^&]+)/g, function (res, key, val) {
    options[key] = val.replace(/\//, '')
    return ''
}).replace(/[^\w]/g, '') || 'Demo'
console.log(name)

window.BKA = new bakhan[name](node, options);
window.BKA.run();

setInterval(function() {
    var canvas = $('canvas')[0]
    var fn = function(x) {
        return 20 * Math.sin(x / 20) + 60 * Math.sin(x / 53) + 400
    }
    bakhan.CaveDraw(canvas, fn)
}, 500)
