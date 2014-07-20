var Stopwatch = require('./stopwatch');
var checkCollision = require('./check-collision')

module.exports = Gate;

var ENTER_FADEOUT_DURATION = 20
var EXIT_FADEOUT_DURATION = 20

/**
 * Opti-thingy gate.
 * Detects when bodies enter and exit a specified area.
 *
 * polygon - should be a list of vectorish, which must be convex.
 * body - should be a body, or null to track all bodies
 * opts - {debug: false}
 *
 * Usage Example:
 * var gate = new Gate(awesome_world, container_div, [{x: 0, y: 300}, ...], {debug: true})
 * gate.on('exit', function(data) {
 *   console.log("You escaped me again! I will find you, oh ", data.body);
 * })
 */
function Gate(world, polygon, pos, body, opts) {
    opts = opts || {};
    this.world = world
    this.body = body;
    // bodies currently inside this gate.
    this.contains = []
    this._subscribe()
    this.polygon = polygon
    this.collision_body = Physics.body('convex-polygon', {
        vertices: polygon,
        treatment: 'magic',
        x: pos[0],
        y: pos[1],
        vx: 0,
        angle: 0,
        restitution: 0.9,
        styles: {
            fillStyle: '#859900',
            angleIndicator: '#414700'
        }
    })
    this.moved_points = polygon.map(function (p) {
        return {x: p.x + pos[0], y: p.y + pos[1]}
    });
    this.view = this.world.renderer().createView(this.collision_body.geometry, { strokeStyle: '#aaa', lineWidth: 2, fillStyle: 'rgba(0,0,0,0)' })
    // this.world.add(this.collision_body)
    if (opts.debug) this.speakLoudly();
    this._color = opts.color

    this._enter_fadeout = 0;
    this._exit_fadeout = 0;
}

Gate.prototype._subscribe = function() {
    Physics.util.ticker.on(function(time) {
        if (this.body) {
            this.handleBody(this.body);
        } else {
            this.world.getBodies().forEach(this.handleBody.bind(this))
        }
    }.bind(this))

    // Subscribe to render events
    this.world.on('render', this._render.bind(this));

    // Subscribe to self. (wHaT?)
    this.on('enter', function() {
        this._enter_fadeout = ENTER_FADEOUT_DURATION
    }.bind(this))
    this.on('exit', function() {
        this._exit_fadeout = EXIT_FADEOUT_DURATION
    }.bind(this))
}

Gate.prototype._render = function() {
    var r = this.world.renderer();
    var alpha = this._enter_fadeout / ENTER_FADEOUT_DURATION
    var strokeStyles = {
        green: '#0a0',
        red: '#a00',
        undefined: '#aaa',
    }
    var fillStyle = {
        green: 'rgba(50,100,50,'+alpha+')',
        red: 'rgba(100,50,50,'+alpha+')',
        undefined: 'rgba(0,0,0,'+alpha+')',
    }
    r.drawPolygon(this.moved_points, {
        strokeStyle: strokeStyles[this._color],
        lineWidth: 2,
        fillStyle: fillStyle[this._color],
    });

    this._enter_fadeout = Math.max(0, this._enter_fadeout - 1)
    this._exit_fadeout = Math.max(0, this._exit_fadeout - 1)
}

Gate.prototype.handleBody = function(body) {
    // Ignore bodies being dragged.
    if (body.dragging) return;

    var wasIn = this.contains.indexOf(body) != -1
    var isIn = this.testBody(body)
    if (!wasIn && isIn) {
        this.contains.push(body)
        this.emit('enter', {body: body})
    }
    if (wasIn && !isIn) {
        this.contains = _.without(this.contains, body);
        this.emit('exit', {body: body})
    }
}

Gate.prototype.testBody = function(body) {
    if (!window.debug && body.treatment !== 'dynamic') {
        return false;
    }
    return checkCollision(this.collision_body, body)
    /// var pos = body.state.pos
    /// return this.testPoint({x: pos.x, y: pos.y})
}

Gate.prototype.testPoint = function(vectorish) {
    return Physics.geometry.isPointInPolygon(
        vectorish,
        this.polygon);
}

// Gate.prototype.runStopwatch = function(stopwatch) {
    // this.on('enter', function(data) {
        // stopwatch.reset();
        // stopwatch.start();
    // });
    // this.on('exit', function(data) {
        // stopwatch.stop();
    // });
// }

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
