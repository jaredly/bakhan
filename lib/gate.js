var Stopwatch = require('./stopwatch');

module.exports = Gate;

/**
 * Opti-thingy gate.
 * Detects when bodies enter and exit a specified area.
 *
 * polygon - should be a list of vectorish, which must be convex.
 * body - should be a body, or null to track all bodies
 * opts - {debug: false, show: false}
 *
 * Usage Example:
 * var gate = new Gate(awesome_world, container_div, [{x: 0, y: 300}, ...], {debug: true})
 * gate.on('exit', function(data) {
 *   console.log("You escaped me again! I will find you, oh ", data.body);
 * })
 */
function Gate(world, container, polygon, body, opts) {
    opts = opts || {};
    this.world = world
    this.body = body;
    // bodies currently inside this gate.
    this.contains = []
    this._subscribe()
    this.stopwatch = new Stopwatch(container, 1);
    this.runStopwatch();
    this.polygon = polygon
    if (opts.debug) this.speakLoudly();
    if (opts.show) this.drawSelf(container);
}

Gate.prototype._subscribe = function() {
    Physics.util.ticker.on(function(time) {
        if (this.body) {
            this.handleBody(this.body);
        } else {
            this.world.getBodies().forEach(this.handleBody.bind(this))
        }
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
        this.polygon);
}

Gate.prototype.drawSelf = function (container) {
    var r = this.world.renderer();
    var p = this.polygon;
    this.world.on('render', function () {
        r.drawPolygon(p, { strokeStyle: '#aaa', lineWidth: 2, fillStyle: 'rgba(0,0,0,0)' });
    });
}

Gate.prototype.runStopwatch = function(container) {
    s = this.stopwatch
    this.on('enter', function(data) {
        console.log('foo');
        s.reset();
        s.start();
    });
    this.on('exit', function(data) {
        s.stop();
    });
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
