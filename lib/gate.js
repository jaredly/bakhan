module.exports = Gate;

/**
 * Opti-thingy gate.
 * Detects when bodies enter and exit a specified area.
 *
 * opts - {debug: false}
 *
 * Usage Example:
 * var gate = new Gate(awesome_world, {debug: true})
 * gate.on('exit', function(data) {
 *   console.log("You escaped me again! I will find you, oh ", data.body);
 * })
 */
function Gate(world, opts) {
    this.world = world
    // bodies currently inside this gate.
    this.contains = []
    this._subscribe()
    if (opts && opts.debug) this.speakLoudly();
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
        this.emit('enter', {body: body})
    }
    if (wasIn && !isIn) {
        this.contains = _.without(body);
        this.emit('exit', {body: body})
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

/**
 * Debugging function to listen to my own events and console.log them.
 */
Gate.prototype.speakLoudly = function() {
    this.on('enter', function(data) {
        console.log('enter', data.body)
    })
    this.on('exit', function(data) {
        console.log('exit', data.body)
    })
    return {butCarryABigStick: ''}
}

_.extend(Gate.prototype, Physics.util.pubsub.prototype)
