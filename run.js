
var bakhan = require('./lib')
  , node = document.getElementById('main-canvas')

var options = {
    width: 900,
    height: 700,
}

var name = window.location.search.replace(/&(\w+)=([^&]+)/g, function (res, key, val) {
    options[key] = val.replace(/\//, '')
    return ''
}).replace(/[^\w]/g, '')
if (!name) {
    name = 'Drop';
    options = {walk: 'true'};
}
console.log(name, options)

window.BKA = new bakhan[name](node, options);
window.BKA.run();
