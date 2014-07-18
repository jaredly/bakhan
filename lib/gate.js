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
function Gate(world, container, opts) {
    opts = opts || {};
    this.world = world
    // bodies currently inside this gate.
    this.contains = []
    this._subscribe()
    // gate area, currently hard-coded.
    this.polygon = [{x: 0, y: 300}, {x: 700, y: 300}, {x: 700, y: 400}, {x: 0, y: 400}];
    if (opts.debug) this.speakLoudly();
    if (opts.show) this.drawSelf(container);
    this.displayClock(container);
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
        this.polygon);
}

Gate.prototype.drawSelf = function (container) {
    var r = this.world.renderer();
    var p = this.polygon;
    this.world.on('render', function () {
        r.drawPolygon(p, { strokeStyle: '#aaa', lineWidth: 2, fillStyle: 'rgba(0,0,0,0)' });
    });
}

Gate.prototype.displayClock = function(container) {
    //draw the thing
    var widget = document.createElement("div");
    widget.className = "gateclock";
    display = document.createElement("span");
    display.innerHTML = "0.00";
    widget.appendChild(display);
    container.appendChild(widget);

    //set up the event watchers
    var clocks = {}
    this.on('enter', function(data) {
        clocks[data.body.uid] = Date.now();
    });
    this.on('exit', function(data) {
        diff = Date.now() - clocks[data.body.uid];
        display.innerHTML = parseFloat(diff / 1000).toFixed(2);
        delete clocks[data.body.uid];
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
