module.exports = Gate;

function Gate(world) {
    this.world = world
    // bodies currently inside this gate.
    this.contains = []
    this._subscribe()
}

Gate.prototype._subscribe = function() {
    Physics.util.ticker.on(function(time) {
        this.world.getBodies().forEach(this.handleBody.bind(this))
    }.bind(this));
}

Gate.prototype.handleBody = function(body) {
    var wasIn = this.contains.indexOf(body) != -1
    var isIn = this.testBody(body)
    if (!wasIn && isIn) {
        this.contains.push(body)
        console.log('enter')
    }
    if (wasIn && !isIn) {
        console.log('exit')
        this.contains = _.without(body);
    }
}

Gate.prototype.testBody = function(body) {
    var pos = body.state.pos
    return this.testPoint({x: pos.x, y: pos.y})
}

Gate.prototype.testPoint = function(vectorish) {
    return Physics.geometry.isPointInPolygon(
        vectorish,
        [{x: 0, y: 0}, {x: 100, y: 0}, {x: 100, y: 100}, {x: 0, y: 100}])
}
