
module.exports = Base;

function Base(container, options) {
    this.container = container
    this.options = options
    this._setupWorld()
    this.setup()
    // init stuff
}

Base.extend = function (sub, proto) {
    sub.prototype = Object.create(Base.prototype)
    sub.constructor = sub
    for (var name in proto) {
        if (proto.hasOwnProperty(name)) {
            sub.prototype[name] = proto[name]
        }
    }
    return sub
}

Base.prototype = {

    _setupWorld: function () {
        var world = this.world = Physics()
        // create a renderer
        this.renderer = Physics.renderer('canvas', {
            el: this.container,
            width: this.options.width,
            height: this.options.height
        });
        this.world.add(this.renderer);

        // constrain objects to these bounds
        edgeBounce = Physics.behavior('edge-collision-detection', {
            aabb: Physics.aabb(0, 0, this.options.width, this.options.height),
            restitution: 0.2,
            cof: 0.8
        });
        //
        // add things to the world
        this.world.add([
            Physics.behavior('interactive', { el: this.renderer.el }),
            Physics.behavior('body-impulse-response'),
            Physics.behavior('body-collision-detection'),
            Physics.behavior('sweep-prune'),
            edgeBounce
        ]);

        // render on each step
        world.on('step', function () {
            world.render();
        });

        // subscribe to ticker to advance the simulation
        Physics.util.ticker.on(function( time ) {
            world.step( time );
        });
    },

    run: function () {
        // start the ticker
        Physics.util.ticker.start();
    }
}
