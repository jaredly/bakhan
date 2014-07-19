(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Gate = require('./gate');
var Base = require('./base');
var Stopwatch = require('./stopwatch');
var PlayPause = require('./playpause');

module.exports = Base.extend(function Asteroids(container, options) {
    Base.call(this, container, options, 'images/space_background.jpg')
}, {
    setup: function (container) {
        var world = this.world;
        world.add(Physics.body('circle', {
            x: 400
            ,y: 350
            ,vx: -1.3/50
            ,radius: 10
            ,mass: 1000
            ,restitution: 0
            ,styles: {
                fillStyle: '#ffcc00'
                ,angleIndicator: '#155479'
            }
        }));
        world.add(Physics.body('circle', {
            x: 400
            ,y: 50
            ,vx: 1.3
            ,radius: 5
            ,mass: 20
            ,restitution: 0
            ,styles: {
                fillStyle: '#26eb62' //green
                ,angleIndicator: '#155479'
            }
        }));
        world.add(Physics.behavior('newtonian', { strength: .5 }));
        for (var i = 0; i < 100; i++) {
            var r = Math.random() * 10 + 295;
            var th = (-1/6 - 0.005 + Math.random() * 0.01) * Math.PI;
            world.add(Physics.body('circle', {
                x: Math.cos(th) * r + 400
                ,y: Math.sin(th) * r + 350
                ,vx: -1.3 * Math.sin(th)
                ,vy: 1.3 * Math.cos(th)
                ,radius: 2
                ,mass: Math.pow(10, Math.random() * 2) * 0.00001
                ,restitution: 0
                ,styles: {
                    fillStyle: '#dd2222' //red
                    ,angleIndicator: '#155479'
                }
            }));
        }

        var buttonContainer = document.createElement("div");
        container.appendChild(buttonContainer);
        var playPause = new PlayPause(world, buttonContainer);
    }
});

        

},{"./base":2,"./gate":9,"./playpause":20,"./stopwatch":22}],2:[function(require,module,exports){

module.exports = Base;

function Base(container, options, background, disableBounds) {
    this.container = container
    this.options = options
    $('.background').attr('src', background);
    this._setupWorld(disableBounds)
    this.setup(container)
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

    _setupWorld: function (disableBounds) {
        var world = this.world = Physics()
        // create a renderer
        this.renderer = Physics.renderer('canvas', {
            el: this.container,
            width: this.options.width,
            height: this.options.height
        });
        this.world.add(this.renderer);

        // add things to the world
        this.world.add([
            Physics.behavior('interactive-force', { el: this.renderer.el }),
            Physics.behavior('body-impulse-response'),
            Physics.behavior('body-collision-detection'),
            Physics.behavior('sweep-prune'),
        ]);

        if (!disableBounds) {
            this.world.add(Physics.behavior('edge-collision-detection', {
                aabb: Physics.aabb(0, 0, this.options.width, this.options.height),
                restitution: 0.2,
                cof: 0.8
            }));
        }


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

},{}],3:[function(require,module,exports){

module.exports = CanGraph

function CanGraph(options) {
    this.o = _.extend({
        max: 500,
        margin: 10,
        minscale: 1,
        tickscale: 50
    }, options)
    this.points = []
    this.prevscale = this.o.minscale
    this.off = 0
}

CanGraph.prototype = {
    draw: function () {
        if (!this.points.length) return
        var ctx = this.o.node.getContext('2d')
        var width = this.o.width - this.o.margin*2
        var height = this.o.height - this.o.margin*2
        var top = this.o.top + this.o.margin
        var left = this.o.left + this.o.margin

        var dx = width / this.points.length
        var min = Math.min.apply(Math, this.points)
        var max = Math.max.apply(Math, this.points)
        var scale = max - min
        if (scale < this.o.minscale) {
            scale = this.o.minscale
        }
        if (scale < this.prevscale*.99) {
            scale = this.prevscale*.99
        }
        var dy = height / scale
        if (max - min < scale) {
            var d = scale - (max-min)
            min -= d/2
            max += d/2
        }

        this.prevscale = scale

        // draw x axis
        if (min <= 0 && max >= 0) {
            ctx.beginPath()
            ctx.moveTo(left, top + height - (-min)*dy)
            ctx.lineTo(left + width, top + height - (-min)*dy)
            ctx.strokeStyle = '#ccc'
            ctx.stroke()
        }

        // draw ticks
        var ticktop = top + height - (-min)*dy - 5
        if (ticktop < top) {
            ticktop = top
        }
        if (ticktop + 10 > top + height) {
            ticktop = top + height - 10
        }
        for (var i=this.off; i<this.points.length; i+=this.o.tickscale) {
            ctx.beginPath()
            ctx.moveTo(left + i*dx, ticktop)
            ctx.lineTo(left + i*dx, ticktop + 10)
            ctx.strokeStyle = '#ccc'
            ctx.stroke()
        }


        // draw line
        ctx.beginPath()
        this.points.map(function (p, x) {
            ctx.lineTo(left + x * dx, top + height - (p - min) * dy)
        })
        ctx.strokeStyle = 'blue'
        ctx.lineWidth = 1
        ctx.stroke()

        // draw title
        var th = 10
        ctx.font = th + 'pt Arial'
        var tw = ctx.measureText(this.o.title).width
        ctx.fillStyle = 'black'
        ctx.globalAlpha = 1
        ctx.clearRect(left, top, tw, th + 5)
        ctx.fillText(this.o.title, left, top + th)


        // draw rect
        ctx.strokeStyle = '#666'
        ctx.rect(this.o.left + this.o.margin/2,this.o.top + this.o.margin/2,this.o.width - this.o.margin,this.o.height - this.o.margin)
        ctx.stroke()
    },
    addPoint: function (point) {
        this.points.push(point)
        if (this.points.length > this.o.max) {
            this.off -= this.points.length - this.o.max
            this.off %= this.o.tickscale
            this.points = this.points.slice(-this.o.max)
        }
    }
}


},{}],4:[function(require,module,exports){
module.exports = cavedraw;

function cavedraw(canvas, fn) {
    definePath(canvas, fn)
    drawPath(canvas)
}

function definePath(canvas, fn) {
    var context = canvas.getContext('2d');
    var xmax = canvas.width
    var ymax = canvas.height

    context.beginPath();
    context.moveTo(0, fn(0));
    for (var x = 0; x < xmax ; x++) {
        context.lineTo(x, fn(x))
    }

    context.lineTo(xmax, ymax)
    context.lineTo(0, ymax)
    context.closePath();
}

function drawPath(canvas) {
    var context = canvas.getContext('2d');
    context.lineWidth = 5;
    // context.fillStyle = '#8ED6FF';
    var grd = context.createLinearGradient(canvas.width / 2, 0, canvas.width / 2, canvas.height)
    grd.addColorStop(0, '#000')
    grd.addColorStop(1, '#777')
    context.fillStyle = grd;
    // context.fillStyle = '#333';
    context.fill();
    // context.strokeStyle = 'blue';
    // context.stroke();
}

},{}],5:[function(require,module,exports){
module.exports = checkCollision;

function checkCollision(bodyA, bodyB) {
    var supportFnStack = [];

    /*
     * getSupportFn( bodyA, bodyB ) -> Function
     * - bodyA (Object): First body
     * - bodyB (Object): Second body
     * + (Function): The support function
     *
     * Get a general support function for use with GJK algorithm
     */
    var getSupportFn = function getSupportFn( bodyA, bodyB ){

        var hash = Physics.util.pairHash( bodyA.uid, bodyB.uid )
        var fn = supportFnStack[ hash ]

        if ( !fn ){
            fn = supportFnStack[ hash ] = function( searchDir ){

                var scratch = Physics.scratchpad()
                var tA = fn.tA
                var tB = fn.tB
                var vA = scratch.vector()
                var vB = scratch.vector()
                var marginA = fn.marginA
                var marginB = fn.marginB
                ;

                if ( fn.useCore ){
                    vA = bodyA.geometry.getFarthestCorePoint( searchDir.rotateInv( tA ), vA, marginA ).transform( tA );
                    vB = bodyB.geometry.getFarthestCorePoint( searchDir.rotate( tA ).rotateInv( tB ).negate(), vB, marginB ).transform( tB );
                } else {
                    vA = bodyA.geometry.getFarthestHullPoint( searchDir.rotateInv( tA ), vA ).transform( tA );
                    vB = bodyB.geometry.getFarthestHullPoint( searchDir.rotate( tA ).rotateInv( tB ).negate(), vB ).transform( tB );
                }

                searchDir.negate().rotate( tB );

                return scratch.done({
                    a: vA.values(),
                    b: vB.values(),
                    pt: vA.vsub( vB ).values()
                });
            };

            fn.tA = Physics.transform();
            fn.tB = Physics.transform();
        }

        fn.useCore = false;
        fn.margin = 0;
        fn.tA.setTranslation( bodyA.state.pos ).setRotation( bodyA.state.angular.pos );
        fn.tB.setTranslation( bodyB.state.pos ).setRotation( bodyB.state.angular.pos );
        fn.bodyA = bodyA;
        fn.bodyB = bodyB;

        return fn;
    };

    /*
     * checkGJK( bodyA, bodyB ) -> Object
     * - bodyA (Object): First body
     * - bodyB (Object): Second body
     * + (Object): Collision result
     *
     * Use GJK algorithm to check arbitrary bodies for collisions
     */
    var checkGJK = function checkGJK( bodyA, bodyB ){

        var scratch = Physics.scratchpad()
        var d = scratch.vector()
        var tmp = scratch.vector()
            ,overlap
        var result
        var support
        var collision = false
        var aabbA = bodyA.aabb()
            ,dimA = Math.min( aabbA.hw, aabbA.hh )
        var aabbB = bodyB.aabb()
        var dimB = Math.min( aabbB.hw, aabbB.hh )
        ;

        // just check the overlap first
        support = getSupportFn( bodyA, bodyB );
        d.clone( bodyA.state.pos ).vsub( bodyB.state.pos );
        result = Physics.gjk(support, d, true);

        if ( result.overlap ){

            // there is a collision. let's do more work.
            collision = {
                bodyA: bodyA,
                bodyB: bodyB
            };

            // first get the min distance of between core objects
            support.useCore = true;
            support.marginA = 0;
            support.marginB = 0;

            while ( result.overlap && (support.marginA < dimA || support.marginB < dimB) ){
                if ( support.marginA < dimA ){
                    support.marginA += 1;
                }
                if ( support.marginB < dimB ){
                    support.marginB += 1;
                }

                result = Physics.gjk(support, d);
            }

            if ( result.overlap || result.maxIterationsReached ){
                // This implementation can't deal with a core overlap yet
                return scratch.done(false);
            }

            // calc overlap
            overlap = Math.max(0, (support.marginA + support.marginB) - result.distance);
            collision.overlap = overlap;
            // @TODO: for now, just let the normal be the mtv
            collision.norm = d.clone( result.closest.b ).vsub( tmp.clone( result.closest.a ) ).normalize().values();
            collision.mtv = d.mult( overlap ).values();
            // get a corresponding hull point for one of the core points.. relative to body A
            collision.pos = d.clone( collision.norm ).mult( support.margin ).vadd( tmp.clone( result.closest.a ) ).vsub( bodyA.state.pos ).values();
        }

        return scratch.done( collision );
    };

    /*
     * checkCircles( bodyA, bodyB ) -> Object
     * - bodyA (Object): First body
     * - bodyB (Object): Second body
     * + (Object): Collision result
     *
     * Check two circles for collisions.
     */
    var checkCircles = function checkCircles( bodyA, bodyB ){

        var scratch = Physics.scratchpad()
        var d = scratch.vector()
        var tmp = scratch.vector()
        var overlap
        var collision = false

        d.clone( bodyB.state.pos ).vsub( bodyA.state.pos );
        overlap = d.norm() - (bodyA.geometry.radius + bodyB.geometry.radius);

        // hmm... they overlap exactly... choose a direction
        if ( d.equals( Physics.vector.zero ) ){

            d.set( 1, 0 );
        }

        // if ( overlap > 0 ){
        //     // check the future
        //     d.vadd( tmp.clone(bodyB.state.vel).mult( dt ) ).vsub( tmp.clone(bodyA.state.vel).mult( dt ) );
        //     overlap = d.norm() - (bodyA.geometry.radius + bodyB.geometry.radius);
        // }

        if ( overlap <= 0 ){

            collision = {
                bodyA: bodyA,
                bodyB: bodyB,
                norm: d.normalize().values(),
                mtv: d.mult( -overlap ).values(),
                pos: d.normalize().mult( bodyA.geometry.radius ).values(),
                overlap: -overlap
            };
        }

        return scratch.done( collision );
    };

    /*
     * checkPair( bodyA, bodyB ) -> Object
     * - bodyA (Object): First body
     * - bodyB (Object): Second body
     * + (Object): Collision result
     *
     * Check a pair for collisions
     */
    var checkPair = function checkPair( bodyA, bodyB ){

        // filter out bodies that don't collide with each other
        if (
            ( bodyA.treatment === 'static' || bodyA.treatment === 'kinematic' ) &&
                ( bodyB.treatment === 'static' || bodyB.treatment === 'kinematic' )
        ){
            return false;
        }

        if ( bodyA.geometry.name === 'circle' && bodyB.geometry.name === 'circle' ){

            return checkCircles( bodyA, bodyB );

        } else {

            return checkGJK( bodyA, bodyB );
        }
    };

    return checkPair(bodyA, bodyB)
}


},{}],6:[function(require,module,exports){
var Graph = require('./graph')
var Gate = require('./gate');
var Base = require('./base');
var Stopwatch = require('./stopwatch');
var PlayPause = require('./playpause');

module.exports = Base.extend(function Demo(container, options) {
    Base.call(this, container, options, 'images/lab_background.jpg')
}, {
    dropInBody: function (radius, y, color) {
        function random(min, max){
            return (Math.random() * (max-min) + min)|0
        }
        var body = Physics.body('circle', {
            x: 100,
            y: y,
            vx: random(-5, 5)/100,
            radius: radius,
            restitution: 0.9,
            styles: {
                image: "images/tennis_ball.png"
            }
        })

        this.world.add(body);
        return body;
    },
    setup: function (container) {
        var world = this.world
        world.add(Physics.behavior('constant-acceleration'));

        for (var i = 0; i < 5; i++) {
            var radius = 20 + 10 * i;
            this.dropInBody(radius, 300 - i * 50);
        }
        var circle = this.dropInBody(40, 300 + 20, 'red')
        var graph = new Graph(this.container, {
            'Circle': {body: circle, attr: 'pos.y', title:'Vertical Position', minscale: 5},
            'VelY': {body: circle, attr: 'vel.y', title:'Vertical Velocity', minscale: .1},
            'AngP': {body: circle, attr: 'angular.pos', title:'Rotation', minscale: .001},
            'AngV': {body: circle, attr: 'angular.vel', title:'Rotational Velocity', minscale: .001},
        }, {
            top: 10,
            left: this.options.width - 400,
            width: 400,
            worldHeight: this.options.height
        })
        this.graph = graph

        this.world.on('step', function () {
            graph.update(world.timestep())
        });

        this.world.add(Physics.body('rectangle', {
            x: 250,
            y: 600,
            width: 50,
            height: 400,
            treatment: 'static',
            styles: {
                fillStyle: '#d33682',
                angleIndicator: '#751b4b'
            }
        }))

        var buttonContainer = document.createElement("div");
        container.appendChild(buttonContainer);
        var playPause = new PlayPause(world, buttonContainer);
        gatePolygon = [{x: 0, y: 300}, {x: 700, y: 300}, {x: 700, y: 400}, {x: 0, y: 400}];
        var gate = new Gate(world, buttonContainer, gatePolygon, [350, 700], null, {debug: true, show: true});
        gate.on('enter', function(data) {
            gate.stopwatches = gate.stopwatches || {}
            var stopwatch = new Stopwatch(world, buttonContainer, 1);
            stopwatch.reset();
            stopwatch.start();
            gate.stopwatches[data.body.uid] = stopwatch;
        });
        gate.on('exit', function(data) {
            gate.stopwatches[data.body.uid].stop()
        });
    }
});


},{"./base":2,"./gate":9,"./graph":10,"./playpause":20,"./stopwatch":22}],7:[function(require,module,exports){
var Base = require('./base');
var Gate = require('./gate');
var Stopwatch = require('./stopwatch');
var LogBook = require('./logbook');
var PlayPause = require('./playpause');
var WalkThrough = require('./intro');
var DropDataChecker = require('./dropdatachecker.jsx');
var util = require('./util');

function random(min, max){
    return (Math.random() * (max-min) + min)|0
}

module.exports = Base.extend(function Drop(container, options) {
    Base.call(this, container, options, "images/lab_background.jpg")
}, {
    dropBowlingBall: function() {
        var radius = 30;
        this.world.add(Physics.body('circle', {
            x: 700,
            y: 200,
            vx: random(-30, 30)/100,
            radius: radius,
            mass: 900,
            restitution: 0.01,
            cof: 0.4,
            styles: {
                image: "images/bowling_ball.png"
            },
            displayName: 'Bowling Ball',
        }));
    },

    dropTennisBall: function() {
        var radius = 15;
        var ball = Physics.body('circle', {
            x: 700,
            y: 200,
            vx: random(-30, 30)/100,
            radius: radius,
            mass: 7.5,
            restitution: 1,
            displayName: 'Tennis Ball',
            styles: {
                image: "images/tennis_ball.png"
            }
        })

        if (!this.firstTennisBall) {
            this.firstTennisBall = ball;
        }

        this.world.add(ball);
    },

    deployBalls: function(onDone) {
        var spacing_ms = 800;
        var queue = [
            this.dropTennisBall.bind(this),
            this.dropTennisBall.bind(this),
            this.dropBowlingBall.bind(this),
            this.dropTennisBall.bind(this),
            this.dropTennisBall.bind(this),
            this.dropBowlingBall.bind(this),
            onDone
        ];
        _.reduce(queue, function(t, action) {
            setTimeout(action, t)
            return t + spacing_ms
        }, 0)

        // setTimeout(this.dropTennisBall.bind(this), 0)
        // setTimeout(this.dropTennisBall.bind(this), 100)
        // setTimeout(this.dropTennisBall.bind(this), 200)
    },

    startWalkthrough: function () {
        WalkThrough(this, function (hypothesis) {
            console.log('Got the hypothesis!!', hypothesis);
            this.setupDataChecker(hypothesis);
        }.bind(this))
    },

    setupDataChecker: function (hypothesis) {
        var dataChecker = document.createElement("div");
        dataChecker.className = "drop-data-checker";
        this.sideBar.appendChild(dataChecker);
        React.renderComponent(DropDataChecker({
            initialHypothesis: hypothesis,
            logBook: this.logBook,
            world: this.world
        }), dataChecker);
    },

    setup: function (container) {
        var world = this.world
        var gravity = Physics.behavior('constant-acceleration')
        gravity.setAcceleration({x: 0, y:.0003});
        world.add(gravity);

        // Shunt triangle
        this.world.add(Physics.body('rectangle', {
            x: 60,
            y: 690,
            width: 500,
            height: 100,
            angle: Math.PI / 4,
            treatment: 'static',
            cof: 1,
            styles: {
                fillStyle: '#d33682',
            }
        }));

        var sideBar = this.sideBar = document.createElement("div");
        sideBar.className = "side-bar";
        container.appendChild(sideBar);
        var topGate = new Gate(world, buttonContainer,
                               util.makeRect(0, 0, 200, 10),
                               [120, 200], null, {debug: true, show: true, color: 'green'});
        var bottomGate = new Gate(world, buttonContainer,
                               util.makeRect(0, 0, 200, 10),
                               [120, 550], null, {debug: true, show: true, color: 'red'});
        var logColumns = [
            {name: "Bowling Ball", extraText: " (7 kg)"},
            {name: "Tennis Ball", extraText: " (58 g)", color: 'rgb(154, 241, 0)'}
        ];
        var logBook = this.logBook = new LogBook(world, topGate, bottomGate, sideBar, 5, logColumns);
        var buttonContainer = document.createElement("div");
        var playPause = new PlayPause(world, buttonContainer);
        container.appendChild(buttonContainer);

        if (this.options.walk) {
            this.startWalkthrough()
        } else {
            // Add the balls.
            setTimeout(this.deployBalls.bind(this), 500)
            this.setupDataChecker('same');
        }
    },

    /**
     * Pick up one of the tennis balls and drop it.
     *
     * @param callback Gets called when the demonstration is over.
     */
    demonstrateDrop: function(callback) {
        var ball = this.firstTennisBall;
        var targetX = 125;
        var targetY = 170;

        ball.treatment = 'kinematic';
        ball.state.vel.x = (targetX - ball.state.pos.x) / 1500;
        ball.state.vel.y = (targetY - ball.state.pos.y) / 1500;
        ball.recalc();

        setTimeout(function() {
            ball.treatment = 'static';
            ball.state.pos.x = targetX;
            ball.state.pos.y = targetY;
            ball.state.vel.x = 0;
            ball.state.vel.y = 0;
            ball.recalc();

            setTimeout(function() {
                ball.treatment = 'dynamic';
                ball.recalc();
                setTimeout(function() {
                    callback();
                }, 3000)
            }, 1500)
        }, 1500)
    }
});

},{"./base":2,"./dropdatachecker.jsx":8,"./gate":9,"./intro":12,"./logbook":16,"./playpause":20,"./stopwatch":22,"./util":24}],8:[function(require,module,exports){
/** @jsx React.DOM */

var DropDataChecker = React.createClass({displayName: 'DropDataChecker',
    // props: logBook, world
    getInitialState: function () {
        return {
            thisResult: "Do an experiment to see if you can figure out which ball falls faster, and let me know when you're done!",
            prevResult: '',
            hypothesis: this.props.initialHypothesis, // will eventually be set when they finish the walkthrough.  it can be "bowling", "tennis", or "same"
            disproven: false,
        };
    },

    render: function () {
        var prettyHypothesis = React.DOM.p({className: "checker_your-hypo"}, React.DOM.em(null, "Your hypothesis was ", this.prettyHypothesis(), "."));
        if (this.state.disproven) {
            var bowlingButton = React.DOM.button({className: "btn btn-default", onClick: this.bowling}, "The bowling ball falls faster.")
            var tennisButton = React.DOM.button({className: "btn btn-default", onClick: this.tennis}, "The tennis ball falls faster.")
            var sameButton = React.DOM.button({className: "btn btn-default", onClick: this.same}, "Both balls fall at the same rate.")
            if (this.state.hypothesis === 'bowling') {
                bowlingButton = React.DOM.div(null)
            } else if (this.state.hypothesis === 'tennis') {
                tennisButton = React.DOM.div(null)
            } else if (this.state.hypothesis === 'same') {
                sameButton = React.DOM.div(null)
            }
            return React.DOM.div({className: "checker"}, 
                prettyHypothesis, 
                React.DOM.img({src: "/images/sir-francis.jpeg", className: "checker_francis"}), 
                React.DOM.div({className: "checker_main"}, 
                    React.DOM.p(null, "Okay, which result do they support?"), 
                    bowlingButton, tennisButton, sameButton
                )
            );
        } else if (this.state.thisResult) {
            return React.DOM.div({className: "checker"}, 
                prettyHypothesis, 
                React.DOM.img({src: "/images/sir-francis.jpeg", className: "checker_francis"}), 
                React.DOM.div({className: "checker_main"}, 
                    React.DOM.p(null, this.state.thisResult), 
                    React.DOM.button({className: "btn btn-default", onClick: this.support}, "The data support my hypothesis."), 
                    React.DOM.button({className: "btn btn-default", onClick: this.disprove}, "The data disprove my hypothesis.")
                )
            );
        } else {
            return React.DOM.div({className: "checker"}, 
                prettyHypothesis, 
                React.DOM.img({src: "/images/sir-francis.jpeg", className: "checker_francis"}), 
                React.DOM.div({className: "checker_main"}, 
                    React.DOM.p(null, "Your experiment looks great, and I'm convinced.  Here, have some bacon.")
                )
            );
        }
    },

    prettyHypothesis: function () {
        if (this.state.hypothesis === "same") {
            return "that both balls will fall at the same rate";
        } else {
            return "that the "+this.state.hypothesis+" ball will fall faster";
        }
    },

    result: function () {
        // we return the error, or null if they're correct
        var enoughData = _.all(this.props.logBook.data, function (d) {return d.length >= 5;});
        if (enoughData) {
            var avgs = {}
            var maxDeltas = {}
            for (var name in this.props.logBook.data) {
                avgs[name] = _.reduce(this.props.logBook.data[name],
                    function (a, b) {return a + b;}) / this.props.logBook.data[name].length;
                maxDeltas[name] = _.max(_.map(this.props.logBook.data[name],
                    function (datum) {return Math.abs(datum - avgs[name]);}));
            }
        }
        console.log(this.props.logBook.data, enoughData, avgs, maxDeltas);
        if (!enoughData) {
            return "You haven't filled up your lab notebook!  Make sure you get enough data so you know your results are accurate.";
        } else if (maxDeltas["Bowling Ball"] > 300) {
            return "One of your results for the bowling ball looks pretty far off!  Try getting some more data to make sure it was a fluke.";
        } else if (maxDeltas["Tennis Ball"] > 300) {
            return "One of your results for the tennis ball looks pretty far off!  Try getting some more data to make sure it was a fluke.";
        } else if (
                (this.state.hypothesis === "same"
                    && Math.abs(avgs["Bowling Ball"] - avgs["Tennis Ball"]) > 100)
                || (this.state.hypothesis === "bowling"
                    && avgs["Bowling Ball"] < avgs["Tennis Ball"] + 100)
                || (this.state.hypothesis === "tennis"
                    && avgs["Tennis Ball"] < avgs["Bowling Ball"] + 100)
                ) {
            return "Those results don't look very consistent with your hypothesis.  It's fine if your hypothesis was disproven, that's how science works!";
        } else if (
                this.state.hypothesis !== "same"
                || avgs["Bowling Ball"] < 800
                || avgs["Bowling Ball"] > 1500
                || avgs["Tennis Ball"] < 800
                || avgs["Tennis Ball"] > 1500) {
            return "Those results are consistent, but they don't look quite right to me.  Make sure you're dropping the balls gently from the same height above the top sensor.";
        } else {
            return null;
        }
    },

    support: function () {
        this.askFrancis();
    },

    disprove: function () {
        this.setState({
            disproven: true,
        });
    },

    bowling: function () {
        this.setState({
            disproven: false,
            hypothesis: "bowling",
        }, this.askFrancis);
    },

    tennis: function () {
        this.setState({
            disproven: false,
            hypothesis: "tennis",
        }, this.askFrancis);
    },

    same: function () {
        this.setState({
            disproven: false,
            hypothesis: "same",
        }, this.askFrancis);
    },

    askFrancis: function () {
        this.setState({
            thisResult: this.result(),
            prevResult: this.state.thisResult
        });
    }
})

module.exports = DropDataChecker;

},{}],9:[function(require,module,exports){
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
function Gate(world, container, polygon, pos, body, opts) {
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

},{"./check-collision":5,"./stopwatch":22}],10:[function(require,module,exports){

var CanGraph = require('./cangraph')

module.exports = Graph

function getDatum(item) {
    return item.attr.split('.').reduce(function (node, attr) {
        return node[attr]
    }, item.body.state)
}

function Graph(parent, tracking, options) {
    this.o = _.extend({
        top: 10,
        left: 10,
        width: 600,
        height: 400,
        worldHeight: 200
    }, options)
    this.tracking = tracking
    this.data = []
    this.node = document.createElement('canvas')
    this.node.className = 'graph'
    this.node.width = this.o.width
    this.node.height = this.o.height
    this.node.style.top = this.o.top + 'px'
    this.node.style.left = this.o.left + 'px'
    var numgraphs = Object.keys(tracking).length
    var graphheight = this.o.height / numgraphs
    parent.appendChild(this.node)

    this.graphs = {}
    var i = 0
    for (var name in tracking) {
        this.graphs[name] = new CanGraph({
            node: this.node,
            minscale: tracking[name].minscale,
            title: tracking[name].title,
            top: graphheight * i++,
            left: 0,
            width: this.o.width,
            height: graphheight,
        })
    }

    /*
    this.graph = new Rickshaw.Graph({
        element: this.node,
        width: 600,
        height: 600,
        renderer: 'line',
        series: new Rickshaw.Series(
            tracking.map(function (item) {
                return {name: item.name}
            }),
            undefined, {
                timeInterval: 250,
                maxDataPoints: 100,
                timeBase: new Date().getTime() / 1000
            }
        )
    })
    */
}

Graph.prototype = {
    updateData: function () {
        var data = {}
        var height = this.o.worldHeight
        this.node.getContext('2d').clearRect(0, 0, this.node.width, this.node.height)
        for (var name in this.tracking) {
            this.graphs[name].addPoint(this.getDatum(name))
            this.graphs[name].draw()
        }
    },
    getDatum: function (name) {
        var item = this.tracking[name]
        if (item.fn) {
            return item.fn();
        } else if (item.attr === 'pos.y') {
            return this.o.worldHeight - item.body.state.pos.y
        } else {
            return getDatum(item)
        }
    },
    update: function (timestep) {
        this.updateData()
    }
}


},{"./cangraph":3}],11:[function(require,module,exports){

module.exports = {
    Base: require('./base'),
    Demo: require('./demo'),
    Newton1: require('./newton1'),
    Orbit: require('./orbit'),
    Moon: require('./moon'),
    Asteroids: require('./asteroids'),
    Slope: require('./slope'),
    Drop: require('./drop'),
    TryGraph: require('./try-graph'),
    CaveDraw: require('./cavedraw'),
}

},{"./asteroids":1,"./base":2,"./cavedraw":4,"./demo":6,"./drop":7,"./moon":17,"./newton1":18,"./orbit":19,"./slope":21,"./try-graph":23}],12:[function(require,module,exports){

var Walkthrough = require('./walk-through.jsx')

module.exports = function (Exercise, gotHypothesis) {
    var node = document.createElement('div')
    document.body.appendChild(node)
    React.renderComponent(Walkthrough({
        steps: require('./intro.jsx'),
        onHypothesis: gotHypothesis,
        onDone: function (hypothesis) {
            React.unmountComponentAtNode(node);
            node.parentNode.removeChild(node);
        },
        Exercise: Exercise
    }), node)
}


},{"./intro.jsx":13,"./walk-through.jsx":15}],13:[function(require,module,exports){
/** @jsx React.DOM */

var PT = React.PropTypes
var Step = require('./step.jsx')

var DEBUG = false

var ButtonGroup = React.createClass({displayName: 'ButtonGroup',
    render: function () {
        return React.DOM.span({className: this.props.className}, 
            this.props.options.map(function (item) {
                var cls = "btn btn-default"
                if (this.props.selected === item[0]) {
                    cls += ' active'
                }
                return React.DOM.button({key: item[0], className: cls, onClick: this.props.onSelect.bind(null, item[0])}, item[1]);
            }.bind(this))
        );
    }
});

module.exports = [
    function (props) {
        return Step(_.extend(props, {
            id: 'hello',
            title: "Hi! I'm Sir Francis Bacon",
            showBacon: true,
            body: "I was made a Knight of England for doing awesome Science. We're going to use science to figure out cool things about the world.",
            next: "Let's do science!"
        }))
    },

    function (props) {
        var hypothesis = props.data.hypothesis
        return Step(_.extend(props, {
            id: 'description',
            title: "Experiment #1",
            onUpdate: function (prevProps) {
                if (this.props.data.hypothesis && !prevProps.data.hypothesis) {
                    props.onHypothesis(props.data.hypothesis);
                    DEBUG ? props.onNext() : setTimeout(function () {
                        props.onNext()
                    }, 500)
                }
            },
            body: React.DOM.div(null, 
                React.DOM.p(null, "What falls faster: a tennis ball or a bowling ball?"), 
                React.DOM.p(null, "A ", React.DOM.span({className: "uline"}, "Hypothesis"), " is what you think will happen."), 
                React.DOM.hr(null), 
                React.DOM.div({className: "large"}, "I think:", 
                    ButtonGroup({
                        className: "walkthrough_hypotheses", 
                        selected: hypothesis, 
                        onSelect: props.setData.bind(null, 'hypothesis'), 
                        options: [["tennis", "The tennis ball falls faster"],
                            ["bowling", "The bowling ball falls faster"],
                            ["same", "They fall the same"]]})
                )
                /**hypothesis && <p className="walkthrough_great">Great! Now we do science</p>**/
            )
        }))
    },

    function (props) {
        var firstBall = 'tennis'
        var secondBall = 'bowling'
        var prover = props.data.prover
        var hypothesis = props.data.hypothesis

        if (props.hypothesis === 'bowling') {
            firstBall = 'bowling'
            secondBall = 'tennis'
        }

        var responses = {
            'tennis': 'Nope. That would show that the tennis ball falls faster',
            'bowling': 'Nope. That would show that the bowling ball falls faster',
            'same': 'Nope. That would show that they fall the same'
        }
        var correct = {
            'tennis': 'less',
            'bowling': 'less',
            'same': 'same'
        }
        var proverResponse
        var isCorrect = prover === correct[hypothesis]

        if (prover) {
            if (isCorrect) {
                proverResponse = "Exactly! Now let's do the experiment."
            } else {
                proverResponse = responses[{
                    tennis: {
                        more: 'bowling',
                        same: 'same'
                    },
                    bowling: {
                        more: 'tennis',
                        same: 'same'
                    },
                    same: {
                        more: 'bowling',
                        less: 'tennis'
                    }
                }[hypothesis][prover]];
            }
        }

        var futureHypothesis = {
            tennis: 'the tennis ball will fall faster than the bowling ball',
            bowling: 'the bowling ball will fall faster than the tennis ball',
            same: 'the tennis ball and the bowling ball will fall the same'
        }[hypothesis];

        var currentHypothesis = {
            tennis: 'a tennis ball falls faster than a bowling ball',
            bowling: 'a bowling ball falls faster than a tennis ball',
            same: 'a tennis ball falls the same as a bowling ball'
        }[hypothesis];

        return Step(_.extend(props, {
            id: 'design-experiment',
            title: 'Designing the Experiment',
            onUpdate: function (prevProps) {
                if (prover && isCorrect && prover !== prevProps.data.prover) {
                    setTimeout(function () {
                        props.onNext()
                    }, 2000);
                }
            },
            body: React.DOM.div(null, 
                React.DOM.p(null, "Now we need to design an experiment to test your" + ' ' +
                "hypothesis! It's important to be careful when designing an" + ' ' +
                "experiment, because otherwise you could end up \"proving\"" + ' ' +
                "something that's actually false."), 
                React.DOM.p(null, "To prove that ", React.DOM.span({className: "uline"}, currentHypothesis), ", we can measure the time that it" + ' ' +
                "takes for each ball to fall when dropped from a specific" + ' ' +
                "height."), 
                React.DOM.p(null, "Your hypothesis will be proven if the ", React.DOM.span({className: "uline"}, "time for the ", firstBall, " ball"), " is", 
                    ButtonGroup({
                        className: "btn-group", 
                        selected: prover, 
                        onSelect: props.setData.bind(null, 'prover'), 
                        options: [['less', 'less than'], ['more', 'more than'], ['same', 'the same as']]}), 
                    "the ", React.DOM.span({className: "uline"}, "time for the ", secondBall, " ball"), "."
                ), 
                prover && React.DOM.p({className: "design_response"}, proverResponse)
            )
        }))
    },

    function (props) {
        return Step(_.extend(props, {
            id: 'experiment',
            style: 'black',
            title: 'The experiment',
            pos: {
                left: 375,
                top: 200
            },
            body: React.DOM.p(null, "Here we have tools to conduct our experiment. You can see" + ' ' +
            "some bowling balls and tennis balls, and those red and green" + ' ' +
            "sensors will record the time it takes for a ball to fall."),
            onRender: function () {
                props.Exercise.deployBalls(function () {
                    DEBUG ? props.onNext() : setTimeout(function () {
                        props.onNext()
                    }, 2000);
                })
            }
        }))
    },

    function (props) {
        return Step(_.extend(props, {
            id: 'drop',
            style: 'black',
            pos: {
                top: 200,
                left: 200
            },
            body: React.DOM.p(null, "If we drop a ball here above the green sensor, we can" + ' ' +
                "time how long it takes for it to fall to the red sensor."),
            onRender: function () {
                props.Exercise.demonstrateDrop(function () {
                    props.onNext()
                })
            }
        }))
    },

    function (props) {
        return Step(_.extend(props, {
            id: 'logbook',
            style: 'black',
            pos: {
                top: 100,
                left: 500
            },
            arrow: React.DOM.div({className: "arrow-to-logbook"}),
            body: React.DOM.p(null, "The time is then recorded over here in your log book. Fill up this log book with times for both balls and compare them."),
            onRender: function () {
                setTimeout(function () {
                    props.onNext();
                }, DEBUG ? 100 : 5000);
            }
        }));
    },

    function (props) {
        return Step(_.extend(props, {
            id: 'answer',
            style: 'black',
            pos: {
                top: 150,
                left: 250
            },
            arrow: React.DOM.div({className: "arrow-to-answer"}),
            showBacon: true,
            title: "Now conduct the experiment to test your hypothesis!",
            body: React.DOM.p(null, "Once you've collected enough data in your log book," + ' ' +
            "decide whether the data ", React.DOM.span({className: "uline"}, "support"), " or", 
            ' ', React.DOM.span({className: "uline"}, "disprove"), " your hypothesis. Then" + ' ' +
            "I will evaluate your experiment and give you feedback."),
            next: "Ok, I'm ready",
        }))
    },
]


},{"./step.jsx":14}],14:[function(require,module,exports){
/** @jsx React.DOM */

var PT = React.PropTypes
var cx = React.addons.classSet

var Step = React.createClass({displayName: 'Step',
    propTypes: {
        title: PT.string,
        next: PT.string,
        onRender: PT.func,
        onFadedOut: PT.func,
        showBacon: PT.bool,
        fadeOut: PT.bool,
    },

    getDefaultProps: function () {
        return {
            style: 'white'
        }
    },

    componentDidMount: function () {
        if (this.props.onRender) {
            this.props.onRender()
        }
        this.getDOMNode().addEventListener('transitionend', function () {
            if (this.props.fadeOut) {
                this.props.onFadedOut()
            }
        }.bind(this))
    },

    componentDidUpdate: function (prevProps) {
        if (prevProps.id !== this.props.id &&
            this.props.onRender) {
                this.props.onRender()
        }
        if (this.props.onUpdate) {
            this.props.onUpdate.call(this, prevProps)
        }
    },

    render: function () {
        var style
        if (this.props.pos) {
            style = {
                marginTop: 0,
                marginLeft: 0,
                top: this.props.pos.top + 'px',
                left: this.props.pos.left + 'px'
            }
        }
        return React.DOM.div({className: cx({
            "walkthrough": true,
            "walkthrough--white": this.props.style === 'white',
            "walkthrough--black": this.props.style === 'black'
        })}, 
            React.DOM.div({className: cx({
                "walkthrough_step": true,
                "walkthrough_step--fade-out": this.props.fadeOut
            }) + " walkthrough_step--" + this.props.id, style: style}, 
                this.props.showBacon && React.DOM.img({className: "walkthrough_sir-francis", src: "images/sir-francis-transparent2.gif"}), 
                this.props.title &&
                    React.DOM.div({className: "walkthrough_title"}, this.props.title), 
                React.DOM.div({className: "walkthrough_body"}, 
                    this.props.body
                ), 
                this.props.arrow || false, 
                React.DOM.div({className: "walkthrough_buttons"}, 
                    this.props.next &&
                        React.DOM.button({onClick: this.props.onNext, 
                            className: "walkthrough_next btn btn-default"}, 
                            this.props.next
                        )
                )
            )
        )
    }
})

module.exports = Step

},{}],15:[function(require,module,exports){
/** @jsx React.DOM */

var WalkThrough = React.createClass({displayName: 'WalkThrough',
    propTypes: {
        steps: React.PropTypes.array.isRequired,
        onDone: React.PropTypes.func,
    },
    getInitialState: function () {
        return {
            step: 0,
            data: {},
            fading: false
        }
    },
    onFadedOut: function () {
        if (this.state.fading === false) {
            return
        }
        this.goTo(this.state.fading)
    },
    goTo: function (num) {
        if (num >= this.props.steps.length) {
            if (this.props.onDone) {
                this.props.onDone()
            }
            return
        }
        this.setState({step: num, fading: false})
    },
    startGoing: function (num) {
        this.setState({fading: num})
    },
    setData: function (attr, val) {
        var data = _.extend({}, this.state.data)
        data[attr] = val
        this.setState({data: data})
    },
    render: function () {
        var Step = this.props.steps[this.state.step]
        var props = {
            onNext: this.startGoing.bind(null, this.state.step + 1),
            setData: this.setData,
            data: this.state.data,
            fadeOut: this.state.fading !== false,
            onFadedOut: this.onFadedOut
        }
        for (var name in this.props) {
            props[name] = this.props[name]
        }
        return Step(props)
    }
})

module.exports = WalkThrough


},{}],16:[function(require,module,exports){

var util = require('./util');

module.exports = LogBook;

function LogBook(world, startGate, endGate, elem, keep, seededColumns) {
    this._attach(world, startGate, endGate, elem, keep, seededColumns);
}

LogBook.prototype._attach = function (world, startGate, endGate, elem, keep, seededColumns) {
    container = document.createElement("div");
    container.className = "log-book";
    elem.appendChild(container);
    header = document.createElement("span");
    header.className = "log-book-header";
    header.innerHTML = "Log Book";
    container.appendChild(header);
    bodyContainer = document.createElement("div");
    bodyContainer.className = "log-book-body";
    container.appendChild(bodyContainer);
    this.bodyContainer = bodyContainer;

    this.columnsByBodyName = {};
    this.lastUids = {};
    this.startTimeByBodyName = {};
    this.data = {};
    this.keep = keep;
    this.world = world;
    startGate.on('enter', this.handleStart.bind(this));
    endGate.on('enter', this.handleEnd.bind(this));
    world.on('step', this.handleTick.bind(this));

    if (seededColumns) {
        _.each(seededColumns, function (col) {
            this.addColumn(col.name, col.extraText, col.color);
            for (var i = 0; i < this.keep; i++) {
                this.newTimer(col.name);
            }
        }.bind(this));
    }
}

LogBook.prototype.handleStart = function (data) {
    if (!this.startTimeByBodyName[getName(data.body)]) this.newTimer(getName(data.body));
    this.lastUids[getName(data.body)] = data.body.uid;
    this.startTimeByBodyName[getName(data.body)] = this.world._time;
    this.renderTimer(getName(data.body), 0);
}

LogBook.prototype.handleEnd = function (data) {
    if (getName(data.body) in this.data && this.lastUids[getName(data.body)] == data.body.uid) {
        this.data[getName(data.body)].push(
            this.world._time - this.startTimeByBodyName[getName(data.body)]);
        delete this.startTimeByBodyName[getName(data.body)];
        delete this.lastUids[getName(data.body)];
        var name = getName(data.body)
        var avg = clean(util.avg(this.data[name]));
        $(this.columnsByBodyName[name]).find('.log-book-avg').text('Avg: ' + avg);
    }
}

LogBook.prototype.handleTick = function () {
    newTime = this.world._time;
    $.each(this.startTimeByBodyName, function (name, startTime) {
        this.renderTimer(name, newTime - startTime);
    }.bind(this));
}

LogBook.prototype.addColumn = function (name, extraText, color) {
    var column = document.createElement("div");
    column.className = "log-book-column";
    var heading = document.createElement("span");
    heading.className = "log-book-heading";
    heading.innerHTML = name + extraText;
    /** Disabling until we find something that looks great
    if (color) {
        heading.style.backgroundColor = color;
    }
    */
    column.appendChild(heading);
    var average = document.createElement("div");
    average.className = 'log-book-avg';
    average.innerHTML = '--';
    column.appendChild(average);
    this.bodyContainer.appendChild(column);
    this.columnsByBodyName[name] = column;
    this.data[name] = [];
}

LogBook.prototype.newTimer = function (name) {
    // just does the DOM setup, doesn't actually start the timer
    if (!this.columnsByBodyName[name]) this.addColumn(name);
    var col = this.columnsByBodyName[name];
    var toRemove = $(col).find(".log-book-datum").slice(0,-this.keep+1);
    toRemove.slideUp(500, function () {toRemove.remove();});
    this.data[name] = this.data[name].slice(-this.keep+1);
    datum = document.createElement("span");
    datum.className = "log-book-datum";

    var avg = clean(util.avg(this.data[name]));
    $(col).find('.log-book-avg').text('Avg: ' + avg);

    col.appendChild(datum);
    this.renderTimer(name);
}

function clean(time) {
    return parseFloat(time / 1000).toFixed(2) + 's';
}

LogBook.prototype.renderTimer = function (name, time) {
    var datum = this.columnsByBodyName[name].lastChild;
    if (time) {
        datum.innerHTML = clean(time);
    } else {
        datum.innerHTML = "--";
        datum.style.textAlign = "center";
    }
}

function getName(body) {
    return body.displayName || body.name || "body";
}


},{"./util":24}],17:[function(require,module,exports){
var Gate = require('./gate');
var Graph = require('./graph');
var Base = require('./base');
var Stopwatch = require('./stopwatch');
var PlayPause = require('./playpause');

module.exports = Base.extend(function Orbit(container, options) {
    Base.call(this, container, options, "images/space_background.jpg")
}, {
    setup: function (container) {
        var world = this.world;
        var d = 4.0;
        var v = 0.36;
        var circle1 = Physics.body('circle', {
            x: this.options.width / 2 - d/2
            ,y: 200
            ,vx: v
            ,radius: 2
            ,mass: 1
            ,restitution: 0
            ,styles: {
                fillStyle: '#eedd22'
                ,angleIndicator: '#155479'
            }
        });
        var circle2 = Physics.body('circle', {
            x: this.options.width / 2 + d/2
            ,y: 200
            ,vx: v
            ,radius: 2
            ,mass: 1
            ,restitution: 0
            ,styles: {
                fillStyle: '#eedd22'
                ,angleIndicator: '#155479'
            }
        });
        big = Physics.body('circle', {
            x: this.options.width / 2
            ,y: 300
            ,vx: -2 * v/25
            ,radius: 10
            ,mass: 25
            ,restitution: 0
            ,styles: {
                fillStyle: '#eedd22'
                ,angleIndicator: '#155479'
            }
        });
        var constraints = Physics.behavior('verlet-constraints');
        constraints.distanceConstraint(circle1, circle2, 1);
        world.add([circle1, circle2, big, constraints]);
        world.add(Physics.behavior('newtonian', { strength: .5 }));

        var moonRotation = function () {
            var dx = circle1.state.pos.x - circle2.state.pos.x;
            var dy = circle2.state.pos.y - circle1.state.pos.y;
            return Math.atan2(dy,dx);
        };

        var moonRevolution = function () {
            var dx = (circle1.state.pos.x + circle2.state.pos.x)/2 - big.state.pos.x;
            var dy = big.state.pos.y - (circle2.state.pos.y + circle1.state.pos.y)/2;
            return Math.atan2(dy,dx);
        };

        var graph = new Graph(this.container, {
            'Rot': {fn: moonRotation, title: 'Rotation', minscale: 2 * Math.PI},
            'Rev': {fn: moonRevolution, title: 'Revolution', minscale: 2 * Math.PI},
        }, {
            max: 2000,
            top: 10,
            left: this.options.width,
            width: 300,
            worldHeight: this.options.height,
        });
        this.graph = graph;

        this.world.on('step', function () {
            graph.update(world.timestep());
        });

        var buttonContainer = document.createElement("div");
        container.appendChild(buttonContainer);
        var playPause = new PlayPause(world, buttonContainer);
    }
});

        

},{"./base":2,"./gate":9,"./graph":10,"./playpause":20,"./stopwatch":22}],18:[function(require,module,exports){
var Gate = require('./gate');
var Base = require('./base');
var Stopwatch = require('./stopwatch');
var PlayPause = require('./playpause');

function random(min, max){
    return (Math.random() * (max-min) + min)|0
}

module.exports = Base.extend(function Asteroids(container, options) {
    Base.call(this, container, options, 'images/space_background.jpg',
        true /* disableBounds */)
}, {
    setup: function (container) {
        var world = this.world;
        this.handleNewAsteroid();
        var playPauseContainer = document.createElement("div");
        container.appendChild(playPauseContainer);
        var playPause = new PlayPause(world, playPauseContainer);
        container.appendChild(this.createNewAsteroidLink())
    },

    createNewAsteroidLink: function() {
        var newAsteroidLink = document.createElement("a");
        newAsteroidLink.href = "#";
        newAsteroidLink.innerHTML = "New asteroid";
        newAsteroidLink.addEventListener("click", function (event) {
            this.handleNewAsteroid();
            event.preventDefault();
        }.bind(this));
        return newAsteroidLink;
    },

    handleNewAsteroid: function() {
        var world = this.world;

        var minX = 100;
        var maxX = 400;
        var minY = 100;
        var maxY = 400;
        var minAngle = 0;
        var maxAngle = 2*Math.PI;

        world.add(Physics.body('circle', {
            x: random(minX, maxX),
            y: random(minY, maxY),
            radius: 50,
            angle: random(minAngle, maxAngle),
            mass: 1000,
            restitution: 0,
            styles: {
                image: 'images/asteroid.png',
                fillStyle: '#ffcc00'
            }
        }));
    }
});

        

},{"./base":2,"./gate":9,"./playpause":20,"./stopwatch":22}],19:[function(require,module,exports){
var Gate = require('./gate');
var Base = require('./base');
var Stopwatch = require('./stopwatch');
var PlayPause = require('./playpause');

module.exports = Base.extend(function Orbit(container, options) {
    Base.call(this, container, options, "images/space_background.jpg")
}, {
    setup: function (container) {
        var world = this.world;
        var redBall = Physics.body('circle', {
            x: this.options.width / 2
            ,y: 40
            ,vx: 0
            ,vy: -1/8
            ,radius: 4
            ,mass: 4
            ,restitution: 0
            ,styles: {
                fillStyle: '#d68b62' //red
                ,angleIndicator: '#155479'
            }
        });
        var greenBall = Physics.body('circle', {
            x: this.options.width / 2
            ,y: 60
            ,vx: 3/8
            ,vy: 1/8
            ,radius: 4
            ,mass: 4
            ,restitution: 0
            ,styles: {
                fillStyle: '#26eb62' //green
                ,angleIndicator: '#155479'
            }
        });
        var bigBall = Physics.body('circle', {
            x: this.options.width / 2
            ,y: 300
            ,vx: -3/50
            ,radius: 10
            ,mass: 25
            ,restitution: 0
            ,styles: {
                fillStyle: '#268bd2'
                ,angleIndicator: '#155479'
            }
        });
        world.add([redBall, greenBall, bigBall]);
        world.add(Physics.behavior('newtonian', { strength: .5 }));

        var buttonContainer = document.createElement("div");
        container.appendChild(buttonContainer);
        var playPause = new PlayPause(world, buttonContainer);
        var gatePolygon = [{x: -700, y: -100}, {x: 700, y: -100}, {x: 700, y: 139}, {x: -700, y: 139}];
        var gatePolygon2 = [{x: -700, y: -261}, {x: 700, y: -261}, {x: 700, y: 200}, {x: -700, y: 200}];
        var gates = []
        gates.push(new Gate(world, buttonContainer, gatePolygon, [700, 100], redBall, {debug: true, show: true}));
        gates.push(new Gate(world, buttonContainer, gatePolygon, [700, 100], greenBall, {debug: true, show: true}));
        gates.push(new Gate(world, buttonContainer, gatePolygon, [700, 100], bigBall, {debug: true, show: true}));
        gates.push(new Gate(world, buttonContainer, gatePolygon2, [700, 500], redBall, {debug: true, show: true}));
        gates.push(new Gate(world, buttonContainer, gatePolygon2, [700, 500], greenBall, {debug: true, show: true}));
        gates.push(new Gate(world, buttonContainer, gatePolygon2, [700, 500], bigBall, {debug: true, show: true}));
        gates.forEach(function(gate) {
            var stopwatch = new Stopwatch(world, buttonContainer, 1);
            gate.on('enter', function(data) {
                stopwatch.reset();
                stopwatch.start();
            });
            gate.on('exit', function(data) {
                stopwatch.stop()
            });
        });
    }
});

        

},{"./base":2,"./gate":9,"./playpause":20,"./stopwatch":22}],20:[function(require,module,exports){
module.exports = PlayPause;

function PlayPause(world, container) {
    this._attach(world, container);
}

PlayPause.prototype.createButton = function(action, handler) {
    var a = document.createElement("a");
    a.href = "#" + action;
    a.innerHTML = action;
    a.addEventListener("click", function (event) {
        handler();
        event.preventDefault();
    }.bind(this));
    return a;
}

PlayPause.prototype._attach = function(world, container) {
    this.pauseSymbol = "▐▐";
    this.playSymbol = "►";
    this.button = this.createButton(this.pauseSymbol, this.toggle.bind(this));
    this.world = world;
    var widget = document.createElement("div");
    widget.className = "playpause";
    widget.appendChild(this.button);
    container.appendChild(widget);
}

PlayPause.prototype.toggle = function() {
    if (this.world.isPaused()) {
        this.button.innerHTML = this.pauseSymbol;
        this.button.href = '#' + this.pauseSymbol;
        this.world.unpause()
    } else {
        this.button.innerHTML = this.playSymbol;
        this.button.href = '#' + this.playSymbol;
        this.world.pause()
    }
}



},{}],21:[function(require,module,exports){
var Base = require('./base');
var Gate = require('./gate');
var Stopwatch = require('./stopwatch');
var PlayPause = require('./playpause');
var util = require('./util');

module.exports = Base.extend(function Slope(container, options) {
    Base.call(this, container, options, 'images/lab_background.jpg')
}, {
    dropInBody: function (radius, y) {
        function random(min, max){
            return (Math.random() * (max-min) + min)|0
        }

        this.world.add(Physics.body('circle', {
            x: 100,
            y: y,
            vx: random(-5, 5)/100,
            radius: radius,
            restitution: 0.9,
            styles: {
                fillStyle: '#268bd2',
                angleIndicator: '#155479'
            }
        }));
    },
    setup: function (container) {
        var world = this.world
        world.add(Physics.behavior('constant-acceleration'));

        for (var i = 0; i < 5; i++) {
            var radius = 20 + 10 * i;
            this.dropInBody(radius, 300 - i * 50);
        }

        this.world.add(Physics.body('convex-polygon', {
            x: 450,
            y: 600,
            vertices: [
                {x: 0, y: 0},
                {x: 0, y: 300},
                {x: 800, y: 300},
            ],
            treatment: 'static',
            cof: 1,
            styles: {
                fillStyle: '#d33682',
                angleIndicator: '#751b4b'
            }
        }))

        var buttonContainer = document.createElement("div");
        container.appendChild(buttonContainer);
        var stopwatch = new Stopwatch(world, buttonContainer, 1);
        var playPause = new PlayPause(world, buttonContainer);
        var topGate = new Gate(world, buttonContainer,
                               util.makeRect(0, 0, 60, 100),
                               [350, 400],
                               null, {debug: true, show: true});
        var bottomGate = new Gate(world, buttonContainer,
                               util.makeRect(0, 0, 60, 100),
                               [800, 570],
                               null, {debug: true, show: true});

        topGate.on('enter', function(data) {
            stopwatch.reset().start();
        })
        bottomGate.on('enter', function(data) {
            stopwatch.stop()
        })
    }
});


},{"./base":2,"./gate":9,"./playpause":20,"./stopwatch":22,"./util":24}],22:[function(require,module,exports){

module.exports = Stopwatch;

function Stopwatch(world, elem) {
    this._attach(world, elem);
}

Stopwatch.prototype._attach = function(world, elem) {
    this.world = world;
    this.timer = this.createTimer(),
    this.startButton = this.createButton("start", this.start.bind(this)),
    this.stopButton = this.createButton("stop", this.stop.bind(this)),
    this.resetButton = this.createButton("reset", this.reset.bind(this)),
    this.clock = 0;

    // Update on every timer tick
    this.world.on('step', function() {
        this.update();
    }.bind(this));

    var widget = document.createElement("div");
    widget.className = "stopwatch";

    // append elements
    widget.appendChild(this.timer);
    widget.appendChild(this.startButton);
    widget.appendChild(this.stopButton);
    widget.appendChild(this.resetButton);

    elem.appendChild(widget);
}

Stopwatch.prototype.createTimer = function() {
    return document.createElement("span");
}

Stopwatch.prototype.createButton = function(action, handler) {
    var a = document.createElement("a");
    a.href = "#" + action;
    a.innerHTML = action;
    a.addEventListener("click", function (event) {
        handler();
        event.preventDefault();
    }.bind(this));
    return a;
}

Stopwatch.prototype.start = function() {
    this.running = true
    return this;
}

Stopwatch.prototype.stop = function() {
    this.running = false
    return this;
}

Stopwatch.prototype.reset = function() {
    this.clock = 0;
    this.render();
    return this;
}

Stopwatch.prototype.update = function() {
    var newTime = this.world._time;
    if (this.running && this.lastTime) {
        this.clock += newTime - this.lastTime;
    }
    this.lastTime = newTime;
    this.render();
}

Stopwatch.prototype.render = function() {
    this.timer.innerHTML = parseFloat(this.clock / 1000).toFixed(2);
}

},{}],23:[function(require,module,exports){

var Base = require('./base');
var Graph = require('./graph');

function random( min, max ){
    return (Math.random() * (max-min) + min)|0
}

module.exports = Base.extend(function Demo(container, options) {
    Base.call(this, container, options, 'images/lab_background.jpg')
}, {
    makeCircle: function () {
        return Physics.body('circle', {
            x: this.options.width / 2,
            y: 50,
            vx: random(-5, 5)/100,
            radius: 40,
            restitution: 0.9,
            styles: {
                fillStyle: '#268bd2',
                angleIndicator: '#155479'
            }
        });
    },
    dropInBody: function () {

        var body;


        var pent = [
            { x: 50, y: 0 }
            ,{ x: 25, y: -25 }
            ,{ x: -25, y: -25 }
            ,{ x: -50, y: 0 }
            ,{ x: 0, y: 50 }
        ];

            switch ( random( 0, 3 ) ){

                    // add a circle
                case 0:
                    body = Physics.body('circle', {
                        x: this.options.width / 2
                        ,y: 50
                        ,vx: random(-5, 5)/100
                        ,radius: 40
                        ,restitution: 0.9
                        ,styles: {
                            fillStyle: '#268bd2'
                            ,angleIndicator: '#155479'
                        }
                    });
                    break;

                    // add a square
                case 1:
                    body = Physics.body('rectangle', {
                        width: 50
                        ,height: 50
                        ,x: this.options.width / 2
                        ,y: 50
                        ,vx: random(-5, 5)/100
                        ,restitution: 0.9
                        ,styles: {
                            fillStyle: '#d33682'
                            ,angleIndicator: '#751b4b'
                        }
                    });
                    break;

                    // add a polygon
                case 2:
                    body = Physics.body('convex-polygon', {
                        vertices: pent
                        ,x: this.options.width / 2
                        ,y: 50
                        ,vx: random(-5, 5)/100
                        ,angle: random( 0, 2 * Math.PI )
                        ,restitution: 0.9
                        ,styles: {
                            fillStyle: '#859900'
                            ,angleIndicator: '#414700'
                        }
                    });
                    break;
            }

            this.world.add( body );
    },
    setup: function () {
        var world = this.world
        // world.add(Physics.behavior('constant-acceleration'));

        /*
        var int = setInterval(function(){
            if ( world._bodies.length > 4 ){
                clearInterval( int );
            }
            this.dropInBody();
        }.bind(this), 700);
       */

        var circle = this.makeCircle()
        this.world.add(circle)

        var graph = new Graph(this.container, {
            'Circle': {body: circle, attr: 'pos.y', name:'Circle', minscale: 5},
            'VelY': {body: circle, attr: 'vel.y', name:'VelY', minscale: .1},
            'AngP': {body: circle, attr: 'angular.pos', name:'AccX', minscale: .001},
            'AngV': {body: circle, attr: 'angular.vel', name:'AccX', minscale: .001},
        }, this.options.height)
        this.graph = graph

        this.world.on('step', function () {
            graph.update(world.timestep())
        });

    }
});


},{"./base":2,"./graph":10}],24:[function(require,module,exports){
module.exports = {
    makeRect: makeRect,
    makeRock: makeRock,
    sum: sum,
    avg: avg
}

function sum(numbers) {
    if (!numbers.length) return 0;
    return numbers.reduce(function (a, b) {return a + b})
}

function avg(numbers) {
    if (!numbers.length) return 0;
    return sum(numbers) / numbers.length
}

function makeRect(x, y, width, height) {
    return [
        {x: x - width/2, y: y - height/2},
        {x: x + width/2, y: y - height/2},
        {x: x + width/2, y: y + height/2},
        {x: x - width/2, y: y + height/2},
    ]
}

// Not a convex hull :(
function makeRock(radius, deviation, resolution) {
    var resolution = resolution || 32
    var deviation = deviation || 10
    var points = []
    for (var i = 0; i < resolution; i++) {
        var ang = i / resolution * 2 * Math.PI;
        var point = { x: radius * Math.cos(ang), y: radius * Math.sin(ang) }
        point.x += (Math.random()) * 2 * deviation
        point.y += (Math.random()) * 2 * deviation
        points.push(point)
    }
    return points
}

},{}],25:[function(require,module,exports){

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

},{"./lib":11}]},{},[25])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvdXNyL2xvY2FsL2xpYi9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2toYW5pbnRlcm4xL2Nsb25lL2Jha2hhbi9saWIvYXN0ZXJvaWRzLmpzIiwiL1VzZXJzL2toYW5pbnRlcm4xL2Nsb25lL2Jha2hhbi9saWIvYmFzZS5qcyIsIi9Vc2Vycy9raGFuaW50ZXJuMS9jbG9uZS9iYWtoYW4vbGliL2NhbmdyYXBoLmpzIiwiL1VzZXJzL2toYW5pbnRlcm4xL2Nsb25lL2Jha2hhbi9saWIvY2F2ZWRyYXcuanMiLCIvVXNlcnMva2hhbmludGVybjEvY2xvbmUvYmFraGFuL2xpYi9jaGVjay1jb2xsaXNpb24uanMiLCIvVXNlcnMva2hhbmludGVybjEvY2xvbmUvYmFraGFuL2xpYi9kZW1vLmpzIiwiL1VzZXJzL2toYW5pbnRlcm4xL2Nsb25lL2Jha2hhbi9saWIvZHJvcC5qcyIsIi9Vc2Vycy9raGFuaW50ZXJuMS9jbG9uZS9iYWtoYW4vbGliL2Ryb3BkYXRhY2hlY2tlci5qc3giLCIvVXNlcnMva2hhbmludGVybjEvY2xvbmUvYmFraGFuL2xpYi9nYXRlLmpzIiwiL1VzZXJzL2toYW5pbnRlcm4xL2Nsb25lL2Jha2hhbi9saWIvZ3JhcGguanMiLCIvVXNlcnMva2hhbmludGVybjEvY2xvbmUvYmFraGFuL2xpYi9pbmRleC5qcyIsIi9Vc2Vycy9raGFuaW50ZXJuMS9jbG9uZS9iYWtoYW4vbGliL2ludHJvL2luZGV4LmpzIiwiL1VzZXJzL2toYW5pbnRlcm4xL2Nsb25lL2Jha2hhbi9saWIvaW50cm8vaW50cm8uanN4IiwiL1VzZXJzL2toYW5pbnRlcm4xL2Nsb25lL2Jha2hhbi9saWIvaW50cm8vc3RlcC5qc3giLCIvVXNlcnMva2hhbmludGVybjEvY2xvbmUvYmFraGFuL2xpYi9pbnRyby93YWxrLXRocm91Z2guanN4IiwiL1VzZXJzL2toYW5pbnRlcm4xL2Nsb25lL2Jha2hhbi9saWIvbG9nYm9vay5qcyIsIi9Vc2Vycy9raGFuaW50ZXJuMS9jbG9uZS9iYWtoYW4vbGliL21vb24uanMiLCIvVXNlcnMva2hhbmludGVybjEvY2xvbmUvYmFraGFuL2xpYi9uZXd0b24xLmpzIiwiL1VzZXJzL2toYW5pbnRlcm4xL2Nsb25lL2Jha2hhbi9saWIvb3JiaXQuanMiLCIvVXNlcnMva2hhbmludGVybjEvY2xvbmUvYmFraGFuL2xpYi9wbGF5cGF1c2UuanMiLCIvVXNlcnMva2hhbmludGVybjEvY2xvbmUvYmFraGFuL2xpYi9zbG9wZS5qcyIsIi9Vc2Vycy9raGFuaW50ZXJuMS9jbG9uZS9iYWtoYW4vbGliL3N0b3B3YXRjaC5qcyIsIi9Vc2Vycy9raGFuaW50ZXJuMS9jbG9uZS9iYWtoYW4vbGliL3RyeS1ncmFwaC5qcyIsIi9Vc2Vycy9raGFuaW50ZXJuMS9jbG9uZS9iYWtoYW4vbGliL3V0aWwuanMiLCIvVXNlcnMva2hhbmludGVybjEvY2xvbmUvYmFraGFuL3J1bi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBHYXRlID0gcmVxdWlyZSgnLi9nYXRlJyk7XG52YXIgQmFzZSA9IHJlcXVpcmUoJy4vYmFzZScpO1xudmFyIFN0b3B3YXRjaCA9IHJlcXVpcmUoJy4vc3RvcHdhdGNoJyk7XG52YXIgUGxheVBhdXNlID0gcmVxdWlyZSgnLi9wbGF5cGF1c2UnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBCYXNlLmV4dGVuZChmdW5jdGlvbiBBc3Rlcm9pZHMoY29udGFpbmVyLCBvcHRpb25zKSB7XG4gICAgQmFzZS5jYWxsKHRoaXMsIGNvbnRhaW5lciwgb3B0aW9ucywgJ2ltYWdlcy9zcGFjZV9iYWNrZ3JvdW5kLmpwZycpXG59LCB7XG4gICAgc2V0dXA6IGZ1bmN0aW9uIChjb250YWluZXIpIHtcbiAgICAgICAgdmFyIHdvcmxkID0gdGhpcy53b3JsZDtcbiAgICAgICAgd29ybGQuYWRkKFBoeXNpY3MuYm9keSgnY2lyY2xlJywge1xuICAgICAgICAgICAgeDogNDAwXG4gICAgICAgICAgICAseTogMzUwXG4gICAgICAgICAgICAsdng6IC0xLjMvNTBcbiAgICAgICAgICAgICxyYWRpdXM6IDEwXG4gICAgICAgICAgICAsbWFzczogMTAwMFxuICAgICAgICAgICAgLHJlc3RpdHV0aW9uOiAwXG4gICAgICAgICAgICAsc3R5bGVzOiB7XG4gICAgICAgICAgICAgICAgZmlsbFN0eWxlOiAnI2ZmY2MwMCdcbiAgICAgICAgICAgICAgICAsYW5nbGVJbmRpY2F0b3I6ICcjMTU1NDc5J1xuICAgICAgICAgICAgfVxuICAgICAgICB9KSk7XG4gICAgICAgIHdvcmxkLmFkZChQaHlzaWNzLmJvZHkoJ2NpcmNsZScsIHtcbiAgICAgICAgICAgIHg6IDQwMFxuICAgICAgICAgICAgLHk6IDUwXG4gICAgICAgICAgICAsdng6IDEuM1xuICAgICAgICAgICAgLHJhZGl1czogNVxuICAgICAgICAgICAgLG1hc3M6IDIwXG4gICAgICAgICAgICAscmVzdGl0dXRpb246IDBcbiAgICAgICAgICAgICxzdHlsZXM6IHtcbiAgICAgICAgICAgICAgICBmaWxsU3R5bGU6ICcjMjZlYjYyJyAvL2dyZWVuXG4gICAgICAgICAgICAgICAgLGFuZ2xlSW5kaWNhdG9yOiAnIzE1NTQ3OSdcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkpO1xuICAgICAgICB3b3JsZC5hZGQoUGh5c2ljcy5iZWhhdmlvcignbmV3dG9uaWFuJywgeyBzdHJlbmd0aDogLjUgfSkpO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDEwMDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgciA9IE1hdGgucmFuZG9tKCkgKiAxMCArIDI5NTtcbiAgICAgICAgICAgIHZhciB0aCA9ICgtMS82IC0gMC4wMDUgKyBNYXRoLnJhbmRvbSgpICogMC4wMSkgKiBNYXRoLlBJO1xuICAgICAgICAgICAgd29ybGQuYWRkKFBoeXNpY3MuYm9keSgnY2lyY2xlJywge1xuICAgICAgICAgICAgICAgIHg6IE1hdGguY29zKHRoKSAqIHIgKyA0MDBcbiAgICAgICAgICAgICAgICAseTogTWF0aC5zaW4odGgpICogciArIDM1MFxuICAgICAgICAgICAgICAgICx2eDogLTEuMyAqIE1hdGguc2luKHRoKVxuICAgICAgICAgICAgICAgICx2eTogMS4zICogTWF0aC5jb3ModGgpXG4gICAgICAgICAgICAgICAgLHJhZGl1czogMlxuICAgICAgICAgICAgICAgICxtYXNzOiBNYXRoLnBvdygxMCwgTWF0aC5yYW5kb20oKSAqIDIpICogMC4wMDAwMVxuICAgICAgICAgICAgICAgICxyZXN0aXR1dGlvbjogMFxuICAgICAgICAgICAgICAgICxzdHlsZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgZmlsbFN0eWxlOiAnI2RkMjIyMicgLy9yZWRcbiAgICAgICAgICAgICAgICAgICAgLGFuZ2xlSW5kaWNhdG9yOiAnIzE1NTQ3OSdcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgYnV0dG9uQ29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGJ1dHRvbkNvbnRhaW5lcik7XG4gICAgICAgIHZhciBwbGF5UGF1c2UgPSBuZXcgUGxheVBhdXNlKHdvcmxkLCBidXR0b25Db250YWluZXIpO1xuICAgIH1cbn0pO1xuXG4gICAgICAgIFxuIiwiXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2U7XG5cbmZ1bmN0aW9uIEJhc2UoY29udGFpbmVyLCBvcHRpb25zLCBiYWNrZ3JvdW5kLCBkaXNhYmxlQm91bmRzKSB7XG4gICAgdGhpcy5jb250YWluZXIgPSBjb250YWluZXJcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zXG4gICAgJCgnLmJhY2tncm91bmQnKS5hdHRyKCdzcmMnLCBiYWNrZ3JvdW5kKTtcbiAgICB0aGlzLl9zZXR1cFdvcmxkKGRpc2FibGVCb3VuZHMpXG4gICAgdGhpcy5zZXR1cChjb250YWluZXIpXG4gICAgLy8gaW5pdCBzdHVmZlxufVxuXG5CYXNlLmV4dGVuZCA9IGZ1bmN0aW9uIChzdWIsIHByb3RvKSB7XG4gICAgc3ViLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoQmFzZS5wcm90b3R5cGUpXG4gICAgc3ViLmNvbnN0cnVjdG9yID0gc3ViXG4gICAgZm9yICh2YXIgbmFtZSBpbiBwcm90bykge1xuICAgICAgICBpZiAocHJvdG8uaGFzT3duUHJvcGVydHkobmFtZSkpIHtcbiAgICAgICAgICAgIHN1Yi5wcm90b3R5cGVbbmFtZV0gPSBwcm90b1tuYW1lXVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBzdWJcbn1cblxuQmFzZS5wcm90b3R5cGUgPSB7XG5cbiAgICBfc2V0dXBXb3JsZDogZnVuY3Rpb24gKGRpc2FibGVCb3VuZHMpIHtcbiAgICAgICAgdmFyIHdvcmxkID0gdGhpcy53b3JsZCA9IFBoeXNpY3MoKVxuICAgICAgICAvLyBjcmVhdGUgYSByZW5kZXJlclxuICAgICAgICB0aGlzLnJlbmRlcmVyID0gUGh5c2ljcy5yZW5kZXJlcignY2FudmFzJywge1xuICAgICAgICAgICAgZWw6IHRoaXMuY29udGFpbmVyLFxuICAgICAgICAgICAgd2lkdGg6IHRoaXMub3B0aW9ucy53aWR0aCxcbiAgICAgICAgICAgIGhlaWdodDogdGhpcy5vcHRpb25zLmhlaWdodFxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy53b3JsZC5hZGQodGhpcy5yZW5kZXJlcik7XG5cbiAgICAgICAgLy8gYWRkIHRoaW5ncyB0byB0aGUgd29ybGRcbiAgICAgICAgdGhpcy53b3JsZC5hZGQoW1xuICAgICAgICAgICAgUGh5c2ljcy5iZWhhdmlvcignaW50ZXJhY3RpdmUtZm9yY2UnLCB7IGVsOiB0aGlzLnJlbmRlcmVyLmVsIH0pLFxuICAgICAgICAgICAgUGh5c2ljcy5iZWhhdmlvcignYm9keS1pbXB1bHNlLXJlc3BvbnNlJyksXG4gICAgICAgICAgICBQaHlzaWNzLmJlaGF2aW9yKCdib2R5LWNvbGxpc2lvbi1kZXRlY3Rpb24nKSxcbiAgICAgICAgICAgIFBoeXNpY3MuYmVoYXZpb3IoJ3N3ZWVwLXBydW5lJyksXG4gICAgICAgIF0pO1xuXG4gICAgICAgIGlmICghZGlzYWJsZUJvdW5kcykge1xuICAgICAgICAgICAgdGhpcy53b3JsZC5hZGQoUGh5c2ljcy5iZWhhdmlvcignZWRnZS1jb2xsaXNpb24tZGV0ZWN0aW9uJywge1xuICAgICAgICAgICAgICAgIGFhYmI6IFBoeXNpY3MuYWFiYigwLCAwLCB0aGlzLm9wdGlvbnMud2lkdGgsIHRoaXMub3B0aW9ucy5oZWlnaHQpLFxuICAgICAgICAgICAgICAgIHJlc3RpdHV0aW9uOiAwLjIsXG4gICAgICAgICAgICAgICAgY29mOiAwLjhcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfVxuXG5cbiAgICAgICAgLy8gcmVuZGVyIG9uIGVhY2ggc3RlcFxuICAgICAgICB3b3JsZC5vbignc3RlcCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHdvcmxkLnJlbmRlcigpO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBzdWJzY3JpYmUgdG8gdGlja2VyIHRvIGFkdmFuY2UgdGhlIHNpbXVsYXRpb25cbiAgICAgICAgUGh5c2ljcy51dGlsLnRpY2tlci5vbihmdW5jdGlvbiggdGltZSApIHtcbiAgICAgICAgICAgIHdvcmxkLnN0ZXAoIHRpbWUgKTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIHJ1bjogZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyBzdGFydCB0aGUgdGlja2VyXG4gICAgICAgIFBoeXNpY3MudXRpbC50aWNrZXIuc3RhcnQoKTtcbiAgICB9XG59XG4iLCJcbm1vZHVsZS5leHBvcnRzID0gQ2FuR3JhcGhcblxuZnVuY3Rpb24gQ2FuR3JhcGgob3B0aW9ucykge1xuICAgIHRoaXMubyA9IF8uZXh0ZW5kKHtcbiAgICAgICAgbWF4OiA1MDAsXG4gICAgICAgIG1hcmdpbjogMTAsXG4gICAgICAgIG1pbnNjYWxlOiAxLFxuICAgICAgICB0aWNrc2NhbGU6IDUwXG4gICAgfSwgb3B0aW9ucylcbiAgICB0aGlzLnBvaW50cyA9IFtdXG4gICAgdGhpcy5wcmV2c2NhbGUgPSB0aGlzLm8ubWluc2NhbGVcbiAgICB0aGlzLm9mZiA9IDBcbn1cblxuQ2FuR3JhcGgucHJvdG90eXBlID0ge1xuICAgIGRyYXc6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKCF0aGlzLnBvaW50cy5sZW5ndGgpIHJldHVyblxuICAgICAgICB2YXIgY3R4ID0gdGhpcy5vLm5vZGUuZ2V0Q29udGV4dCgnMmQnKVxuICAgICAgICB2YXIgd2lkdGggPSB0aGlzLm8ud2lkdGggLSB0aGlzLm8ubWFyZ2luKjJcbiAgICAgICAgdmFyIGhlaWdodCA9IHRoaXMuby5oZWlnaHQgLSB0aGlzLm8ubWFyZ2luKjJcbiAgICAgICAgdmFyIHRvcCA9IHRoaXMuby50b3AgKyB0aGlzLm8ubWFyZ2luXG4gICAgICAgIHZhciBsZWZ0ID0gdGhpcy5vLmxlZnQgKyB0aGlzLm8ubWFyZ2luXG5cbiAgICAgICAgdmFyIGR4ID0gd2lkdGggLyB0aGlzLnBvaW50cy5sZW5ndGhcbiAgICAgICAgdmFyIG1pbiA9IE1hdGgubWluLmFwcGx5KE1hdGgsIHRoaXMucG9pbnRzKVxuICAgICAgICB2YXIgbWF4ID0gTWF0aC5tYXguYXBwbHkoTWF0aCwgdGhpcy5wb2ludHMpXG4gICAgICAgIHZhciBzY2FsZSA9IG1heCAtIG1pblxuICAgICAgICBpZiAoc2NhbGUgPCB0aGlzLm8ubWluc2NhbGUpIHtcbiAgICAgICAgICAgIHNjYWxlID0gdGhpcy5vLm1pbnNjYWxlXG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNjYWxlIDwgdGhpcy5wcmV2c2NhbGUqLjk5KSB7XG4gICAgICAgICAgICBzY2FsZSA9IHRoaXMucHJldnNjYWxlKi45OVxuICAgICAgICB9XG4gICAgICAgIHZhciBkeSA9IGhlaWdodCAvIHNjYWxlXG4gICAgICAgIGlmIChtYXggLSBtaW4gPCBzY2FsZSkge1xuICAgICAgICAgICAgdmFyIGQgPSBzY2FsZSAtIChtYXgtbWluKVxuICAgICAgICAgICAgbWluIC09IGQvMlxuICAgICAgICAgICAgbWF4ICs9IGQvMlxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5wcmV2c2NhbGUgPSBzY2FsZVxuXG4gICAgICAgIC8vIGRyYXcgeCBheGlzXG4gICAgICAgIGlmIChtaW4gPD0gMCAmJiBtYXggPj0gMCkge1xuICAgICAgICAgICAgY3R4LmJlZ2luUGF0aCgpXG4gICAgICAgICAgICBjdHgubW92ZVRvKGxlZnQsIHRvcCArIGhlaWdodCAtICgtbWluKSpkeSlcbiAgICAgICAgICAgIGN0eC5saW5lVG8obGVmdCArIHdpZHRoLCB0b3AgKyBoZWlnaHQgLSAoLW1pbikqZHkpXG4gICAgICAgICAgICBjdHguc3Ryb2tlU3R5bGUgPSAnI2NjYydcbiAgICAgICAgICAgIGN0eC5zdHJva2UoKVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gZHJhdyB0aWNrc1xuICAgICAgICB2YXIgdGlja3RvcCA9IHRvcCArIGhlaWdodCAtICgtbWluKSpkeSAtIDVcbiAgICAgICAgaWYgKHRpY2t0b3AgPCB0b3ApIHtcbiAgICAgICAgICAgIHRpY2t0b3AgPSB0b3BcbiAgICAgICAgfVxuICAgICAgICBpZiAodGlja3RvcCArIDEwID4gdG9wICsgaGVpZ2h0KSB7XG4gICAgICAgICAgICB0aWNrdG9wID0gdG9wICsgaGVpZ2h0IC0gMTBcbiAgICAgICAgfVxuICAgICAgICBmb3IgKHZhciBpPXRoaXMub2ZmOyBpPHRoaXMucG9pbnRzLmxlbmd0aDsgaSs9dGhpcy5vLnRpY2tzY2FsZSkge1xuICAgICAgICAgICAgY3R4LmJlZ2luUGF0aCgpXG4gICAgICAgICAgICBjdHgubW92ZVRvKGxlZnQgKyBpKmR4LCB0aWNrdG9wKVxuICAgICAgICAgICAgY3R4LmxpbmVUbyhsZWZ0ICsgaSpkeCwgdGlja3RvcCArIDEwKVxuICAgICAgICAgICAgY3R4LnN0cm9rZVN0eWxlID0gJyNjY2MnXG4gICAgICAgICAgICBjdHguc3Ryb2tlKClcbiAgICAgICAgfVxuXG5cbiAgICAgICAgLy8gZHJhdyBsaW5lXG4gICAgICAgIGN0eC5iZWdpblBhdGgoKVxuICAgICAgICB0aGlzLnBvaW50cy5tYXAoZnVuY3Rpb24gKHAsIHgpIHtcbiAgICAgICAgICAgIGN0eC5saW5lVG8obGVmdCArIHggKiBkeCwgdG9wICsgaGVpZ2h0IC0gKHAgLSBtaW4pICogZHkpXG4gICAgICAgIH0pXG4gICAgICAgIGN0eC5zdHJva2VTdHlsZSA9ICdibHVlJ1xuICAgICAgICBjdHgubGluZVdpZHRoID0gMVxuICAgICAgICBjdHguc3Ryb2tlKClcblxuICAgICAgICAvLyBkcmF3IHRpdGxlXG4gICAgICAgIHZhciB0aCA9IDEwXG4gICAgICAgIGN0eC5mb250ID0gdGggKyAncHQgQXJpYWwnXG4gICAgICAgIHZhciB0dyA9IGN0eC5tZWFzdXJlVGV4dCh0aGlzLm8udGl0bGUpLndpZHRoXG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSAnYmxhY2snXG4gICAgICAgIGN0eC5nbG9iYWxBbHBoYSA9IDFcbiAgICAgICAgY3R4LmNsZWFyUmVjdChsZWZ0LCB0b3AsIHR3LCB0aCArIDUpXG4gICAgICAgIGN0eC5maWxsVGV4dCh0aGlzLm8udGl0bGUsIGxlZnQsIHRvcCArIHRoKVxuXG5cbiAgICAgICAgLy8gZHJhdyByZWN0XG4gICAgICAgIGN0eC5zdHJva2VTdHlsZSA9ICcjNjY2J1xuICAgICAgICBjdHgucmVjdCh0aGlzLm8ubGVmdCArIHRoaXMuby5tYXJnaW4vMix0aGlzLm8udG9wICsgdGhpcy5vLm1hcmdpbi8yLHRoaXMuby53aWR0aCAtIHRoaXMuby5tYXJnaW4sdGhpcy5vLmhlaWdodCAtIHRoaXMuby5tYXJnaW4pXG4gICAgICAgIGN0eC5zdHJva2UoKVxuICAgIH0sXG4gICAgYWRkUG9pbnQ6IGZ1bmN0aW9uIChwb2ludCkge1xuICAgICAgICB0aGlzLnBvaW50cy5wdXNoKHBvaW50KVxuICAgICAgICBpZiAodGhpcy5wb2ludHMubGVuZ3RoID4gdGhpcy5vLm1heCkge1xuICAgICAgICAgICAgdGhpcy5vZmYgLT0gdGhpcy5wb2ludHMubGVuZ3RoIC0gdGhpcy5vLm1heFxuICAgICAgICAgICAgdGhpcy5vZmYgJT0gdGhpcy5vLnRpY2tzY2FsZVxuICAgICAgICAgICAgdGhpcy5wb2ludHMgPSB0aGlzLnBvaW50cy5zbGljZSgtdGhpcy5vLm1heClcbiAgICAgICAgfVxuICAgIH1cbn1cblxuIiwibW9kdWxlLmV4cG9ydHMgPSBjYXZlZHJhdztcblxuZnVuY3Rpb24gY2F2ZWRyYXcoY2FudmFzLCBmbikge1xuICAgIGRlZmluZVBhdGgoY2FudmFzLCBmbilcbiAgICBkcmF3UGF0aChjYW52YXMpXG59XG5cbmZ1bmN0aW9uIGRlZmluZVBhdGgoY2FudmFzLCBmbikge1xuICAgIHZhciBjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gICAgdmFyIHhtYXggPSBjYW52YXMud2lkdGhcbiAgICB2YXIgeW1heCA9IGNhbnZhcy5oZWlnaHRcblxuICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XG4gICAgY29udGV4dC5tb3ZlVG8oMCwgZm4oMCkpO1xuICAgIGZvciAodmFyIHggPSAwOyB4IDwgeG1heCA7IHgrKykge1xuICAgICAgICBjb250ZXh0LmxpbmVUbyh4LCBmbih4KSlcbiAgICB9XG5cbiAgICBjb250ZXh0LmxpbmVUbyh4bWF4LCB5bWF4KVxuICAgIGNvbnRleHQubGluZVRvKDAsIHltYXgpXG4gICAgY29udGV4dC5jbG9zZVBhdGgoKTtcbn1cblxuZnVuY3Rpb24gZHJhd1BhdGgoY2FudmFzKSB7XG4gICAgdmFyIGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICBjb250ZXh0LmxpbmVXaWR0aCA9IDU7XG4gICAgLy8gY29udGV4dC5maWxsU3R5bGUgPSAnIzhFRDZGRic7XG4gICAgdmFyIGdyZCA9IGNvbnRleHQuY3JlYXRlTGluZWFyR3JhZGllbnQoY2FudmFzLndpZHRoIC8gMiwgMCwgY2FudmFzLndpZHRoIC8gMiwgY2FudmFzLmhlaWdodClcbiAgICBncmQuYWRkQ29sb3JTdG9wKDAsICcjMDAwJylcbiAgICBncmQuYWRkQ29sb3JTdG9wKDEsICcjNzc3JylcbiAgICBjb250ZXh0LmZpbGxTdHlsZSA9IGdyZDtcbiAgICAvLyBjb250ZXh0LmZpbGxTdHlsZSA9ICcjMzMzJztcbiAgICBjb250ZXh0LmZpbGwoKTtcbiAgICAvLyBjb250ZXh0LnN0cm9rZVN0eWxlID0gJ2JsdWUnO1xuICAgIC8vIGNvbnRleHQuc3Ryb2tlKCk7XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGNoZWNrQ29sbGlzaW9uO1xuXG5mdW5jdGlvbiBjaGVja0NvbGxpc2lvbihib2R5QSwgYm9keUIpIHtcbiAgICB2YXIgc3VwcG9ydEZuU3RhY2sgPSBbXTtcblxuICAgIC8qXG4gICAgICogZ2V0U3VwcG9ydEZuKCBib2R5QSwgYm9keUIgKSAtPiBGdW5jdGlvblxuICAgICAqIC0gYm9keUEgKE9iamVjdCk6IEZpcnN0IGJvZHlcbiAgICAgKiAtIGJvZHlCIChPYmplY3QpOiBTZWNvbmQgYm9keVxuICAgICAqICsgKEZ1bmN0aW9uKTogVGhlIHN1cHBvcnQgZnVuY3Rpb25cbiAgICAgKlxuICAgICAqIEdldCBhIGdlbmVyYWwgc3VwcG9ydCBmdW5jdGlvbiBmb3IgdXNlIHdpdGggR0pLIGFsZ29yaXRobVxuICAgICAqL1xuICAgIHZhciBnZXRTdXBwb3J0Rm4gPSBmdW5jdGlvbiBnZXRTdXBwb3J0Rm4oIGJvZHlBLCBib2R5QiApe1xuXG4gICAgICAgIHZhciBoYXNoID0gUGh5c2ljcy51dGlsLnBhaXJIYXNoKCBib2R5QS51aWQsIGJvZHlCLnVpZCApXG4gICAgICAgIHZhciBmbiA9IHN1cHBvcnRGblN0YWNrWyBoYXNoIF1cblxuICAgICAgICBpZiAoICFmbiApe1xuICAgICAgICAgICAgZm4gPSBzdXBwb3J0Rm5TdGFja1sgaGFzaCBdID0gZnVuY3Rpb24oIHNlYXJjaERpciApe1xuXG4gICAgICAgICAgICAgICAgdmFyIHNjcmF0Y2ggPSBQaHlzaWNzLnNjcmF0Y2hwYWQoKVxuICAgICAgICAgICAgICAgIHZhciB0QSA9IGZuLnRBXG4gICAgICAgICAgICAgICAgdmFyIHRCID0gZm4udEJcbiAgICAgICAgICAgICAgICB2YXIgdkEgPSBzY3JhdGNoLnZlY3RvcigpXG4gICAgICAgICAgICAgICAgdmFyIHZCID0gc2NyYXRjaC52ZWN0b3IoKVxuICAgICAgICAgICAgICAgIHZhciBtYXJnaW5BID0gZm4ubWFyZ2luQVxuICAgICAgICAgICAgICAgIHZhciBtYXJnaW5CID0gZm4ubWFyZ2luQlxuICAgICAgICAgICAgICAgIDtcblxuICAgICAgICAgICAgICAgIGlmICggZm4udXNlQ29yZSApe1xuICAgICAgICAgICAgICAgICAgICB2QSA9IGJvZHlBLmdlb21ldHJ5LmdldEZhcnRoZXN0Q29yZVBvaW50KCBzZWFyY2hEaXIucm90YXRlSW52KCB0QSApLCB2QSwgbWFyZ2luQSApLnRyYW5zZm9ybSggdEEgKTtcbiAgICAgICAgICAgICAgICAgICAgdkIgPSBib2R5Qi5nZW9tZXRyeS5nZXRGYXJ0aGVzdENvcmVQb2ludCggc2VhcmNoRGlyLnJvdGF0ZSggdEEgKS5yb3RhdGVJbnYoIHRCICkubmVnYXRlKCksIHZCLCBtYXJnaW5CICkudHJhbnNmb3JtKCB0QiApO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHZBID0gYm9keUEuZ2VvbWV0cnkuZ2V0RmFydGhlc3RIdWxsUG9pbnQoIHNlYXJjaERpci5yb3RhdGVJbnYoIHRBICksIHZBICkudHJhbnNmb3JtKCB0QSApO1xuICAgICAgICAgICAgICAgICAgICB2QiA9IGJvZHlCLmdlb21ldHJ5LmdldEZhcnRoZXN0SHVsbFBvaW50KCBzZWFyY2hEaXIucm90YXRlKCB0QSApLnJvdGF0ZUludiggdEIgKS5uZWdhdGUoKSwgdkIgKS50cmFuc2Zvcm0oIHRCICk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgc2VhcmNoRGlyLm5lZ2F0ZSgpLnJvdGF0ZSggdEIgKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiBzY3JhdGNoLmRvbmUoe1xuICAgICAgICAgICAgICAgICAgICBhOiB2QS52YWx1ZXMoKSxcbiAgICAgICAgICAgICAgICAgICAgYjogdkIudmFsdWVzKCksXG4gICAgICAgICAgICAgICAgICAgIHB0OiB2QS52c3ViKCB2QiApLnZhbHVlcygpXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBmbi50QSA9IFBoeXNpY3MudHJhbnNmb3JtKCk7XG4gICAgICAgICAgICBmbi50QiA9IFBoeXNpY3MudHJhbnNmb3JtKCk7XG4gICAgICAgIH1cblxuICAgICAgICBmbi51c2VDb3JlID0gZmFsc2U7XG4gICAgICAgIGZuLm1hcmdpbiA9IDA7XG4gICAgICAgIGZuLnRBLnNldFRyYW5zbGF0aW9uKCBib2R5QS5zdGF0ZS5wb3MgKS5zZXRSb3RhdGlvbiggYm9keUEuc3RhdGUuYW5ndWxhci5wb3MgKTtcbiAgICAgICAgZm4udEIuc2V0VHJhbnNsYXRpb24oIGJvZHlCLnN0YXRlLnBvcyApLnNldFJvdGF0aW9uKCBib2R5Qi5zdGF0ZS5hbmd1bGFyLnBvcyApO1xuICAgICAgICBmbi5ib2R5QSA9IGJvZHlBO1xuICAgICAgICBmbi5ib2R5QiA9IGJvZHlCO1xuXG4gICAgICAgIHJldHVybiBmbjtcbiAgICB9O1xuXG4gICAgLypcbiAgICAgKiBjaGVja0dKSyggYm9keUEsIGJvZHlCICkgLT4gT2JqZWN0XG4gICAgICogLSBib2R5QSAoT2JqZWN0KTogRmlyc3QgYm9keVxuICAgICAqIC0gYm9keUIgKE9iamVjdCk6IFNlY29uZCBib2R5XG4gICAgICogKyAoT2JqZWN0KTogQ29sbGlzaW9uIHJlc3VsdFxuICAgICAqXG4gICAgICogVXNlIEdKSyBhbGdvcml0aG0gdG8gY2hlY2sgYXJiaXRyYXJ5IGJvZGllcyBmb3IgY29sbGlzaW9uc1xuICAgICAqL1xuICAgIHZhciBjaGVja0dKSyA9IGZ1bmN0aW9uIGNoZWNrR0pLKCBib2R5QSwgYm9keUIgKXtcblxuICAgICAgICB2YXIgc2NyYXRjaCA9IFBoeXNpY3Muc2NyYXRjaHBhZCgpXG4gICAgICAgIHZhciBkID0gc2NyYXRjaC52ZWN0b3IoKVxuICAgICAgICB2YXIgdG1wID0gc2NyYXRjaC52ZWN0b3IoKVxuICAgICAgICAgICAgLG92ZXJsYXBcbiAgICAgICAgdmFyIHJlc3VsdFxuICAgICAgICB2YXIgc3VwcG9ydFxuICAgICAgICB2YXIgY29sbGlzaW9uID0gZmFsc2VcbiAgICAgICAgdmFyIGFhYmJBID0gYm9keUEuYWFiYigpXG4gICAgICAgICAgICAsZGltQSA9IE1hdGgubWluKCBhYWJiQS5odywgYWFiYkEuaGggKVxuICAgICAgICB2YXIgYWFiYkIgPSBib2R5Qi5hYWJiKClcbiAgICAgICAgdmFyIGRpbUIgPSBNYXRoLm1pbiggYWFiYkIuaHcsIGFhYmJCLmhoIClcbiAgICAgICAgO1xuXG4gICAgICAgIC8vIGp1c3QgY2hlY2sgdGhlIG92ZXJsYXAgZmlyc3RcbiAgICAgICAgc3VwcG9ydCA9IGdldFN1cHBvcnRGbiggYm9keUEsIGJvZHlCICk7XG4gICAgICAgIGQuY2xvbmUoIGJvZHlBLnN0YXRlLnBvcyApLnZzdWIoIGJvZHlCLnN0YXRlLnBvcyApO1xuICAgICAgICByZXN1bHQgPSBQaHlzaWNzLmdqayhzdXBwb3J0LCBkLCB0cnVlKTtcblxuICAgICAgICBpZiAoIHJlc3VsdC5vdmVybGFwICl7XG5cbiAgICAgICAgICAgIC8vIHRoZXJlIGlzIGEgY29sbGlzaW9uLiBsZXQncyBkbyBtb3JlIHdvcmsuXG4gICAgICAgICAgICBjb2xsaXNpb24gPSB7XG4gICAgICAgICAgICAgICAgYm9keUE6IGJvZHlBLFxuICAgICAgICAgICAgICAgIGJvZHlCOiBib2R5QlxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgLy8gZmlyc3QgZ2V0IHRoZSBtaW4gZGlzdGFuY2Ugb2YgYmV0d2VlbiBjb3JlIG9iamVjdHNcbiAgICAgICAgICAgIHN1cHBvcnQudXNlQ29yZSA9IHRydWU7XG4gICAgICAgICAgICBzdXBwb3J0Lm1hcmdpbkEgPSAwO1xuICAgICAgICAgICAgc3VwcG9ydC5tYXJnaW5CID0gMDtcblxuICAgICAgICAgICAgd2hpbGUgKCByZXN1bHQub3ZlcmxhcCAmJiAoc3VwcG9ydC5tYXJnaW5BIDwgZGltQSB8fCBzdXBwb3J0Lm1hcmdpbkIgPCBkaW1CKSApe1xuICAgICAgICAgICAgICAgIGlmICggc3VwcG9ydC5tYXJnaW5BIDwgZGltQSApe1xuICAgICAgICAgICAgICAgICAgICBzdXBwb3J0Lm1hcmdpbkEgKz0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKCBzdXBwb3J0Lm1hcmdpbkIgPCBkaW1CICl7XG4gICAgICAgICAgICAgICAgICAgIHN1cHBvcnQubWFyZ2luQiArPSAxO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IFBoeXNpY3MuZ2prKHN1cHBvcnQsIGQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIHJlc3VsdC5vdmVybGFwIHx8IHJlc3VsdC5tYXhJdGVyYXRpb25zUmVhY2hlZCApe1xuICAgICAgICAgICAgICAgIC8vIFRoaXMgaW1wbGVtZW50YXRpb24gY2FuJ3QgZGVhbCB3aXRoIGEgY29yZSBvdmVybGFwIHlldFxuICAgICAgICAgICAgICAgIHJldHVybiBzY3JhdGNoLmRvbmUoZmFsc2UpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBjYWxjIG92ZXJsYXBcbiAgICAgICAgICAgIG92ZXJsYXAgPSBNYXRoLm1heCgwLCAoc3VwcG9ydC5tYXJnaW5BICsgc3VwcG9ydC5tYXJnaW5CKSAtIHJlc3VsdC5kaXN0YW5jZSk7XG4gICAgICAgICAgICBjb2xsaXNpb24ub3ZlcmxhcCA9IG92ZXJsYXA7XG4gICAgICAgICAgICAvLyBAVE9ETzogZm9yIG5vdywganVzdCBsZXQgdGhlIG5vcm1hbCBiZSB0aGUgbXR2XG4gICAgICAgICAgICBjb2xsaXNpb24ubm9ybSA9IGQuY2xvbmUoIHJlc3VsdC5jbG9zZXN0LmIgKS52c3ViKCB0bXAuY2xvbmUoIHJlc3VsdC5jbG9zZXN0LmEgKSApLm5vcm1hbGl6ZSgpLnZhbHVlcygpO1xuICAgICAgICAgICAgY29sbGlzaW9uLm10diA9IGQubXVsdCggb3ZlcmxhcCApLnZhbHVlcygpO1xuICAgICAgICAgICAgLy8gZ2V0IGEgY29ycmVzcG9uZGluZyBodWxsIHBvaW50IGZvciBvbmUgb2YgdGhlIGNvcmUgcG9pbnRzLi4gcmVsYXRpdmUgdG8gYm9keSBBXG4gICAgICAgICAgICBjb2xsaXNpb24ucG9zID0gZC5jbG9uZSggY29sbGlzaW9uLm5vcm0gKS5tdWx0KCBzdXBwb3J0Lm1hcmdpbiApLnZhZGQoIHRtcC5jbG9uZSggcmVzdWx0LmNsb3Nlc3QuYSApICkudnN1YiggYm9keUEuc3RhdGUucG9zICkudmFsdWVzKCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gc2NyYXRjaC5kb25lKCBjb2xsaXNpb24gKTtcbiAgICB9O1xuXG4gICAgLypcbiAgICAgKiBjaGVja0NpcmNsZXMoIGJvZHlBLCBib2R5QiApIC0+IE9iamVjdFxuICAgICAqIC0gYm9keUEgKE9iamVjdCk6IEZpcnN0IGJvZHlcbiAgICAgKiAtIGJvZHlCIChPYmplY3QpOiBTZWNvbmQgYm9keVxuICAgICAqICsgKE9iamVjdCk6IENvbGxpc2lvbiByZXN1bHRcbiAgICAgKlxuICAgICAqIENoZWNrIHR3byBjaXJjbGVzIGZvciBjb2xsaXNpb25zLlxuICAgICAqL1xuICAgIHZhciBjaGVja0NpcmNsZXMgPSBmdW5jdGlvbiBjaGVja0NpcmNsZXMoIGJvZHlBLCBib2R5QiApe1xuXG4gICAgICAgIHZhciBzY3JhdGNoID0gUGh5c2ljcy5zY3JhdGNocGFkKClcbiAgICAgICAgdmFyIGQgPSBzY3JhdGNoLnZlY3RvcigpXG4gICAgICAgIHZhciB0bXAgPSBzY3JhdGNoLnZlY3RvcigpXG4gICAgICAgIHZhciBvdmVybGFwXG4gICAgICAgIHZhciBjb2xsaXNpb24gPSBmYWxzZVxuXG4gICAgICAgIGQuY2xvbmUoIGJvZHlCLnN0YXRlLnBvcyApLnZzdWIoIGJvZHlBLnN0YXRlLnBvcyApO1xuICAgICAgICBvdmVybGFwID0gZC5ub3JtKCkgLSAoYm9keUEuZ2VvbWV0cnkucmFkaXVzICsgYm9keUIuZ2VvbWV0cnkucmFkaXVzKTtcblxuICAgICAgICAvLyBobW0uLi4gdGhleSBvdmVybGFwIGV4YWN0bHkuLi4gY2hvb3NlIGEgZGlyZWN0aW9uXG4gICAgICAgIGlmICggZC5lcXVhbHMoIFBoeXNpY3MudmVjdG9yLnplcm8gKSApe1xuXG4gICAgICAgICAgICBkLnNldCggMSwgMCApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gaWYgKCBvdmVybGFwID4gMCApe1xuICAgICAgICAvLyAgICAgLy8gY2hlY2sgdGhlIGZ1dHVyZVxuICAgICAgICAvLyAgICAgZC52YWRkKCB0bXAuY2xvbmUoYm9keUIuc3RhdGUudmVsKS5tdWx0KCBkdCApICkudnN1YiggdG1wLmNsb25lKGJvZHlBLnN0YXRlLnZlbCkubXVsdCggZHQgKSApO1xuICAgICAgICAvLyAgICAgb3ZlcmxhcCA9IGQubm9ybSgpIC0gKGJvZHlBLmdlb21ldHJ5LnJhZGl1cyArIGJvZHlCLmdlb21ldHJ5LnJhZGl1cyk7XG4gICAgICAgIC8vIH1cblxuICAgICAgICBpZiAoIG92ZXJsYXAgPD0gMCApe1xuXG4gICAgICAgICAgICBjb2xsaXNpb24gPSB7XG4gICAgICAgICAgICAgICAgYm9keUE6IGJvZHlBLFxuICAgICAgICAgICAgICAgIGJvZHlCOiBib2R5QixcbiAgICAgICAgICAgICAgICBub3JtOiBkLm5vcm1hbGl6ZSgpLnZhbHVlcygpLFxuICAgICAgICAgICAgICAgIG10djogZC5tdWx0KCAtb3ZlcmxhcCApLnZhbHVlcygpLFxuICAgICAgICAgICAgICAgIHBvczogZC5ub3JtYWxpemUoKS5tdWx0KCBib2R5QS5nZW9tZXRyeS5yYWRpdXMgKS52YWx1ZXMoKSxcbiAgICAgICAgICAgICAgICBvdmVybGFwOiAtb3ZlcmxhcFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBzY3JhdGNoLmRvbmUoIGNvbGxpc2lvbiApO1xuICAgIH07XG5cbiAgICAvKlxuICAgICAqIGNoZWNrUGFpciggYm9keUEsIGJvZHlCICkgLT4gT2JqZWN0XG4gICAgICogLSBib2R5QSAoT2JqZWN0KTogRmlyc3QgYm9keVxuICAgICAqIC0gYm9keUIgKE9iamVjdCk6IFNlY29uZCBib2R5XG4gICAgICogKyAoT2JqZWN0KTogQ29sbGlzaW9uIHJlc3VsdFxuICAgICAqXG4gICAgICogQ2hlY2sgYSBwYWlyIGZvciBjb2xsaXNpb25zXG4gICAgICovXG4gICAgdmFyIGNoZWNrUGFpciA9IGZ1bmN0aW9uIGNoZWNrUGFpciggYm9keUEsIGJvZHlCICl7XG5cbiAgICAgICAgLy8gZmlsdGVyIG91dCBib2RpZXMgdGhhdCBkb24ndCBjb2xsaWRlIHdpdGggZWFjaCBvdGhlclxuICAgICAgICBpZiAoXG4gICAgICAgICAgICAoIGJvZHlBLnRyZWF0bWVudCA9PT0gJ3N0YXRpYycgfHwgYm9keUEudHJlYXRtZW50ID09PSAna2luZW1hdGljJyApICYmXG4gICAgICAgICAgICAgICAgKCBib2R5Qi50cmVhdG1lbnQgPT09ICdzdGF0aWMnIHx8IGJvZHlCLnRyZWF0bWVudCA9PT0gJ2tpbmVtYXRpYycgKVxuICAgICAgICApe1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCBib2R5QS5nZW9tZXRyeS5uYW1lID09PSAnY2lyY2xlJyAmJiBib2R5Qi5nZW9tZXRyeS5uYW1lID09PSAnY2lyY2xlJyApe1xuXG4gICAgICAgICAgICByZXR1cm4gY2hlY2tDaXJjbGVzKCBib2R5QSwgYm9keUIgKTtcblxuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICByZXR1cm4gY2hlY2tHSksoIGJvZHlBLCBib2R5QiApO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBjaGVja1BhaXIoYm9keUEsIGJvZHlCKVxufVxuXG4iLCJ2YXIgR3JhcGggPSByZXF1aXJlKCcuL2dyYXBoJylcbnZhciBHYXRlID0gcmVxdWlyZSgnLi9nYXRlJyk7XG52YXIgQmFzZSA9IHJlcXVpcmUoJy4vYmFzZScpO1xudmFyIFN0b3B3YXRjaCA9IHJlcXVpcmUoJy4vc3RvcHdhdGNoJyk7XG52YXIgUGxheVBhdXNlID0gcmVxdWlyZSgnLi9wbGF5cGF1c2UnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBCYXNlLmV4dGVuZChmdW5jdGlvbiBEZW1vKGNvbnRhaW5lciwgb3B0aW9ucykge1xuICAgIEJhc2UuY2FsbCh0aGlzLCBjb250YWluZXIsIG9wdGlvbnMsICdpbWFnZXMvbGFiX2JhY2tncm91bmQuanBnJylcbn0sIHtcbiAgICBkcm9wSW5Cb2R5OiBmdW5jdGlvbiAocmFkaXVzLCB5LCBjb2xvcikge1xuICAgICAgICBmdW5jdGlvbiByYW5kb20obWluLCBtYXgpe1xuICAgICAgICAgICAgcmV0dXJuIChNYXRoLnJhbmRvbSgpICogKG1heC1taW4pICsgbWluKXwwXG4gICAgICAgIH1cbiAgICAgICAgdmFyIGJvZHkgPSBQaHlzaWNzLmJvZHkoJ2NpcmNsZScsIHtcbiAgICAgICAgICAgIHg6IDEwMCxcbiAgICAgICAgICAgIHk6IHksXG4gICAgICAgICAgICB2eDogcmFuZG9tKC01LCA1KS8xMDAsXG4gICAgICAgICAgICByYWRpdXM6IHJhZGl1cyxcbiAgICAgICAgICAgIHJlc3RpdHV0aW9uOiAwLjksXG4gICAgICAgICAgICBzdHlsZXM6IHtcbiAgICAgICAgICAgICAgICBpbWFnZTogXCJpbWFnZXMvdGVubmlzX2JhbGwucG5nXCJcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcblxuICAgICAgICB0aGlzLndvcmxkLmFkZChib2R5KTtcbiAgICAgICAgcmV0dXJuIGJvZHk7XG4gICAgfSxcbiAgICBzZXR1cDogZnVuY3Rpb24gKGNvbnRhaW5lcikge1xuICAgICAgICB2YXIgd29ybGQgPSB0aGlzLndvcmxkXG4gICAgICAgIHdvcmxkLmFkZChQaHlzaWNzLmJlaGF2aW9yKCdjb25zdGFudC1hY2NlbGVyYXRpb24nKSk7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCA1OyBpKyspIHtcbiAgICAgICAgICAgIHZhciByYWRpdXMgPSAyMCArIDEwICogaTtcbiAgICAgICAgICAgIHRoaXMuZHJvcEluQm9keShyYWRpdXMsIDMwMCAtIGkgKiA1MCk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGNpcmNsZSA9IHRoaXMuZHJvcEluQm9keSg0MCwgMzAwICsgMjAsICdyZWQnKVxuICAgICAgICB2YXIgZ3JhcGggPSBuZXcgR3JhcGgodGhpcy5jb250YWluZXIsIHtcbiAgICAgICAgICAgICdDaXJjbGUnOiB7Ym9keTogY2lyY2xlLCBhdHRyOiAncG9zLnknLCB0aXRsZTonVmVydGljYWwgUG9zaXRpb24nLCBtaW5zY2FsZTogNX0sXG4gICAgICAgICAgICAnVmVsWSc6IHtib2R5OiBjaXJjbGUsIGF0dHI6ICd2ZWwueScsIHRpdGxlOidWZXJ0aWNhbCBWZWxvY2l0eScsIG1pbnNjYWxlOiAuMX0sXG4gICAgICAgICAgICAnQW5nUCc6IHtib2R5OiBjaXJjbGUsIGF0dHI6ICdhbmd1bGFyLnBvcycsIHRpdGxlOidSb3RhdGlvbicsIG1pbnNjYWxlOiAuMDAxfSxcbiAgICAgICAgICAgICdBbmdWJzoge2JvZHk6IGNpcmNsZSwgYXR0cjogJ2FuZ3VsYXIudmVsJywgdGl0bGU6J1JvdGF0aW9uYWwgVmVsb2NpdHknLCBtaW5zY2FsZTogLjAwMX0sXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIHRvcDogMTAsXG4gICAgICAgICAgICBsZWZ0OiB0aGlzLm9wdGlvbnMud2lkdGggLSA0MDAsXG4gICAgICAgICAgICB3aWR0aDogNDAwLFxuICAgICAgICAgICAgd29ybGRIZWlnaHQ6IHRoaXMub3B0aW9ucy5oZWlnaHRcbiAgICAgICAgfSlcbiAgICAgICAgdGhpcy5ncmFwaCA9IGdyYXBoXG5cbiAgICAgICAgdGhpcy53b3JsZC5vbignc3RlcCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGdyYXBoLnVwZGF0ZSh3b3JsZC50aW1lc3RlcCgpKVxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLndvcmxkLmFkZChQaHlzaWNzLmJvZHkoJ3JlY3RhbmdsZScsIHtcbiAgICAgICAgICAgIHg6IDI1MCxcbiAgICAgICAgICAgIHk6IDYwMCxcbiAgICAgICAgICAgIHdpZHRoOiA1MCxcbiAgICAgICAgICAgIGhlaWdodDogNDAwLFxuICAgICAgICAgICAgdHJlYXRtZW50OiAnc3RhdGljJyxcbiAgICAgICAgICAgIHN0eWxlczoge1xuICAgICAgICAgICAgICAgIGZpbGxTdHlsZTogJyNkMzM2ODInLFxuICAgICAgICAgICAgICAgIGFuZ2xlSW5kaWNhdG9yOiAnIzc1MWI0YidcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkpXG5cbiAgICAgICAgdmFyIGJ1dHRvbkNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChidXR0b25Db250YWluZXIpO1xuICAgICAgICB2YXIgcGxheVBhdXNlID0gbmV3IFBsYXlQYXVzZSh3b3JsZCwgYnV0dG9uQ29udGFpbmVyKTtcbiAgICAgICAgZ2F0ZVBvbHlnb24gPSBbe3g6IDAsIHk6IDMwMH0sIHt4OiA3MDAsIHk6IDMwMH0sIHt4OiA3MDAsIHk6IDQwMH0sIHt4OiAwLCB5OiA0MDB9XTtcbiAgICAgICAgdmFyIGdhdGUgPSBuZXcgR2F0ZSh3b3JsZCwgYnV0dG9uQ29udGFpbmVyLCBnYXRlUG9seWdvbiwgWzM1MCwgNzAwXSwgbnVsbCwge2RlYnVnOiB0cnVlLCBzaG93OiB0cnVlfSk7XG4gICAgICAgIGdhdGUub24oJ2VudGVyJywgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgZ2F0ZS5zdG9wd2F0Y2hlcyA9IGdhdGUuc3RvcHdhdGNoZXMgfHwge31cbiAgICAgICAgICAgIHZhciBzdG9wd2F0Y2ggPSBuZXcgU3RvcHdhdGNoKHdvcmxkLCBidXR0b25Db250YWluZXIsIDEpO1xuICAgICAgICAgICAgc3RvcHdhdGNoLnJlc2V0KCk7XG4gICAgICAgICAgICBzdG9wd2F0Y2guc3RhcnQoKTtcbiAgICAgICAgICAgIGdhdGUuc3RvcHdhdGNoZXNbZGF0YS5ib2R5LnVpZF0gPSBzdG9wd2F0Y2g7XG4gICAgICAgIH0pO1xuICAgICAgICBnYXRlLm9uKCdleGl0JywgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgZ2F0ZS5zdG9wd2F0Y2hlc1tkYXRhLmJvZHkudWlkXS5zdG9wKClcbiAgICAgICAgfSk7XG4gICAgfVxufSk7XG5cbiIsInZhciBCYXNlID0gcmVxdWlyZSgnLi9iYXNlJyk7XG52YXIgR2F0ZSA9IHJlcXVpcmUoJy4vZ2F0ZScpO1xudmFyIFN0b3B3YXRjaCA9IHJlcXVpcmUoJy4vc3RvcHdhdGNoJyk7XG52YXIgTG9nQm9vayA9IHJlcXVpcmUoJy4vbG9nYm9vaycpO1xudmFyIFBsYXlQYXVzZSA9IHJlcXVpcmUoJy4vcGxheXBhdXNlJyk7XG52YXIgV2Fsa1Rocm91Z2ggPSByZXF1aXJlKCcuL2ludHJvJyk7XG52YXIgRHJvcERhdGFDaGVja2VyID0gcmVxdWlyZSgnLi9kcm9wZGF0YWNoZWNrZXIuanN4Jyk7XG52YXIgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xuXG5mdW5jdGlvbiByYW5kb20obWluLCBtYXgpe1xuICAgIHJldHVybiAoTWF0aC5yYW5kb20oKSAqIChtYXgtbWluKSArIG1pbil8MFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2UuZXh0ZW5kKGZ1bmN0aW9uIERyb3AoY29udGFpbmVyLCBvcHRpb25zKSB7XG4gICAgQmFzZS5jYWxsKHRoaXMsIGNvbnRhaW5lciwgb3B0aW9ucywgXCJpbWFnZXMvbGFiX2JhY2tncm91bmQuanBnXCIpXG59LCB7XG4gICAgZHJvcEJvd2xpbmdCYWxsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHJhZGl1cyA9IDMwO1xuICAgICAgICB0aGlzLndvcmxkLmFkZChQaHlzaWNzLmJvZHkoJ2NpcmNsZScsIHtcbiAgICAgICAgICAgIHg6IDcwMCxcbiAgICAgICAgICAgIHk6IDIwMCxcbiAgICAgICAgICAgIHZ4OiByYW5kb20oLTMwLCAzMCkvMTAwLFxuICAgICAgICAgICAgcmFkaXVzOiByYWRpdXMsXG4gICAgICAgICAgICBtYXNzOiA5MDAsXG4gICAgICAgICAgICByZXN0aXR1dGlvbjogMC4wMSxcbiAgICAgICAgICAgIGNvZjogMC40LFxuICAgICAgICAgICAgc3R5bGVzOiB7XG4gICAgICAgICAgICAgICAgaW1hZ2U6IFwiaW1hZ2VzL2Jvd2xpbmdfYmFsbC5wbmdcIlxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGRpc3BsYXlOYW1lOiAnQm93bGluZyBCYWxsJyxcbiAgICAgICAgfSkpO1xuICAgIH0sXG5cbiAgICBkcm9wVGVubmlzQmFsbDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciByYWRpdXMgPSAxNTtcbiAgICAgICAgdmFyIGJhbGwgPSBQaHlzaWNzLmJvZHkoJ2NpcmNsZScsIHtcbiAgICAgICAgICAgIHg6IDcwMCxcbiAgICAgICAgICAgIHk6IDIwMCxcbiAgICAgICAgICAgIHZ4OiByYW5kb20oLTMwLCAzMCkvMTAwLFxuICAgICAgICAgICAgcmFkaXVzOiByYWRpdXMsXG4gICAgICAgICAgICBtYXNzOiA3LjUsXG4gICAgICAgICAgICByZXN0aXR1dGlvbjogMSxcbiAgICAgICAgICAgIGRpc3BsYXlOYW1lOiAnVGVubmlzIEJhbGwnLFxuICAgICAgICAgICAgc3R5bGVzOiB7XG4gICAgICAgICAgICAgICAgaW1hZ2U6IFwiaW1hZ2VzL3Rlbm5pc19iYWxsLnBuZ1wiXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG5cbiAgICAgICAgaWYgKCF0aGlzLmZpcnN0VGVubmlzQmFsbCkge1xuICAgICAgICAgICAgdGhpcy5maXJzdFRlbm5pc0JhbGwgPSBiYWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy53b3JsZC5hZGQoYmFsbCk7XG4gICAgfSxcblxuICAgIGRlcGxveUJhbGxzOiBmdW5jdGlvbihvbkRvbmUpIHtcbiAgICAgICAgdmFyIHNwYWNpbmdfbXMgPSA4MDA7XG4gICAgICAgIHZhciBxdWV1ZSA9IFtcbiAgICAgICAgICAgIHRoaXMuZHJvcFRlbm5pc0JhbGwuYmluZCh0aGlzKSxcbiAgICAgICAgICAgIHRoaXMuZHJvcFRlbm5pc0JhbGwuYmluZCh0aGlzKSxcbiAgICAgICAgICAgIHRoaXMuZHJvcEJvd2xpbmdCYWxsLmJpbmQodGhpcyksXG4gICAgICAgICAgICB0aGlzLmRyb3BUZW5uaXNCYWxsLmJpbmQodGhpcyksXG4gICAgICAgICAgICB0aGlzLmRyb3BUZW5uaXNCYWxsLmJpbmQodGhpcyksXG4gICAgICAgICAgICB0aGlzLmRyb3BCb3dsaW5nQmFsbC5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgb25Eb25lXG4gICAgICAgIF07XG4gICAgICAgIF8ucmVkdWNlKHF1ZXVlLCBmdW5jdGlvbih0LCBhY3Rpb24pIHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoYWN0aW9uLCB0KVxuICAgICAgICAgICAgcmV0dXJuIHQgKyBzcGFjaW5nX21zXG4gICAgICAgIH0sIDApXG5cbiAgICAgICAgLy8gc2V0VGltZW91dCh0aGlzLmRyb3BUZW5uaXNCYWxsLmJpbmQodGhpcyksIDApXG4gICAgICAgIC8vIHNldFRpbWVvdXQodGhpcy5kcm9wVGVubmlzQmFsbC5iaW5kKHRoaXMpLCAxMDApXG4gICAgICAgIC8vIHNldFRpbWVvdXQodGhpcy5kcm9wVGVubmlzQmFsbC5iaW5kKHRoaXMpLCAyMDApXG4gICAgfSxcblxuICAgIHN0YXJ0V2Fsa3Rocm91Z2g6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgV2Fsa1Rocm91Z2godGhpcywgZnVuY3Rpb24gKGh5cG90aGVzaXMpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdHb3QgdGhlIGh5cG90aGVzaXMhIScsIGh5cG90aGVzaXMpO1xuICAgICAgICAgICAgdGhpcy5zZXR1cERhdGFDaGVja2VyKGh5cG90aGVzaXMpO1xuICAgICAgICB9LmJpbmQodGhpcykpXG4gICAgfSxcblxuICAgIHNldHVwRGF0YUNoZWNrZXI6IGZ1bmN0aW9uIChoeXBvdGhlc2lzKSB7XG4gICAgICAgIHZhciBkYXRhQ2hlY2tlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgIGRhdGFDaGVja2VyLmNsYXNzTmFtZSA9IFwiZHJvcC1kYXRhLWNoZWNrZXJcIjtcbiAgICAgICAgdGhpcy5zaWRlQmFyLmFwcGVuZENoaWxkKGRhdGFDaGVja2VyKTtcbiAgICAgICAgUmVhY3QucmVuZGVyQ29tcG9uZW50KERyb3BEYXRhQ2hlY2tlcih7XG4gICAgICAgICAgICBpbml0aWFsSHlwb3RoZXNpczogaHlwb3RoZXNpcyxcbiAgICAgICAgICAgIGxvZ0Jvb2s6IHRoaXMubG9nQm9vayxcbiAgICAgICAgICAgIHdvcmxkOiB0aGlzLndvcmxkXG4gICAgICAgIH0pLCBkYXRhQ2hlY2tlcik7XG4gICAgfSxcblxuICAgIHNldHVwOiBmdW5jdGlvbiAoY29udGFpbmVyKSB7XG4gICAgICAgIHZhciB3b3JsZCA9IHRoaXMud29ybGRcbiAgICAgICAgdmFyIGdyYXZpdHkgPSBQaHlzaWNzLmJlaGF2aW9yKCdjb25zdGFudC1hY2NlbGVyYXRpb24nKVxuICAgICAgICBncmF2aXR5LnNldEFjY2VsZXJhdGlvbih7eDogMCwgeTouMDAwM30pO1xuICAgICAgICB3b3JsZC5hZGQoZ3Jhdml0eSk7XG5cbiAgICAgICAgLy8gU2h1bnQgdHJpYW5nbGVcbiAgICAgICAgdGhpcy53b3JsZC5hZGQoUGh5c2ljcy5ib2R5KCdyZWN0YW5nbGUnLCB7XG4gICAgICAgICAgICB4OiA2MCxcbiAgICAgICAgICAgIHk6IDY5MCxcbiAgICAgICAgICAgIHdpZHRoOiA1MDAsXG4gICAgICAgICAgICBoZWlnaHQ6IDEwMCxcbiAgICAgICAgICAgIGFuZ2xlOiBNYXRoLlBJIC8gNCxcbiAgICAgICAgICAgIHRyZWF0bWVudDogJ3N0YXRpYycsXG4gICAgICAgICAgICBjb2Y6IDEsXG4gICAgICAgICAgICBzdHlsZXM6IHtcbiAgICAgICAgICAgICAgICBmaWxsU3R5bGU6ICcjZDMzNjgyJyxcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkpO1xuXG4gICAgICAgIHZhciBzaWRlQmFyID0gdGhpcy5zaWRlQmFyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgc2lkZUJhci5jbGFzc05hbWUgPSBcInNpZGUtYmFyXCI7XG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChzaWRlQmFyKTtcbiAgICAgICAgdmFyIHRvcEdhdGUgPSBuZXcgR2F0ZSh3b3JsZCwgYnV0dG9uQ29udGFpbmVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHV0aWwubWFrZVJlY3QoMCwgMCwgMjAwLCAxMCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgWzEyMCwgMjAwXSwgbnVsbCwge2RlYnVnOiB0cnVlLCBzaG93OiB0cnVlLCBjb2xvcjogJ2dyZWVuJ30pO1xuICAgICAgICB2YXIgYm90dG9tR2F0ZSA9IG5ldyBHYXRlKHdvcmxkLCBidXR0b25Db250YWluZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXRpbC5tYWtlUmVjdCgwLCAwLCAyMDAsIDEwKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbMTIwLCA1NTBdLCBudWxsLCB7ZGVidWc6IHRydWUsIHNob3c6IHRydWUsIGNvbG9yOiAncmVkJ30pO1xuICAgICAgICB2YXIgbG9nQ29sdW1ucyA9IFtcbiAgICAgICAgICAgIHtuYW1lOiBcIkJvd2xpbmcgQmFsbFwiLCBleHRyYVRleHQ6IFwiICg3IGtnKVwifSxcbiAgICAgICAgICAgIHtuYW1lOiBcIlRlbm5pcyBCYWxsXCIsIGV4dHJhVGV4dDogXCIgKDU4IGcpXCIsIGNvbG9yOiAncmdiKDE1NCwgMjQxLCAwKSd9XG4gICAgICAgIF07XG4gICAgICAgIHZhciBsb2dCb29rID0gdGhpcy5sb2dCb29rID0gbmV3IExvZ0Jvb2sod29ybGQsIHRvcEdhdGUsIGJvdHRvbUdhdGUsIHNpZGVCYXIsIDUsIGxvZ0NvbHVtbnMpO1xuICAgICAgICB2YXIgYnV0dG9uQ29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgdmFyIHBsYXlQYXVzZSA9IG5ldyBQbGF5UGF1c2Uod29ybGQsIGJ1dHRvbkNvbnRhaW5lcik7XG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChidXR0b25Db250YWluZXIpO1xuXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMud2Fsaykge1xuICAgICAgICAgICAgdGhpcy5zdGFydFdhbGt0aHJvdWdoKClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIEFkZCB0aGUgYmFsbHMuXG4gICAgICAgICAgICBzZXRUaW1lb3V0KHRoaXMuZGVwbG95QmFsbHMuYmluZCh0aGlzKSwgNTAwKVxuICAgICAgICAgICAgdGhpcy5zZXR1cERhdGFDaGVja2VyKCdzYW1lJyk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUGljayB1cCBvbmUgb2YgdGhlIHRlbm5pcyBiYWxscyBhbmQgZHJvcCBpdC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBjYWxsYmFjayBHZXRzIGNhbGxlZCB3aGVuIHRoZSBkZW1vbnN0cmF0aW9uIGlzIG92ZXIuXG4gICAgICovXG4gICAgZGVtb25zdHJhdGVEcm9wOiBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgICAgICB2YXIgYmFsbCA9IHRoaXMuZmlyc3RUZW5uaXNCYWxsO1xuICAgICAgICB2YXIgdGFyZ2V0WCA9IDEyNTtcbiAgICAgICAgdmFyIHRhcmdldFkgPSAxNzA7XG5cbiAgICAgICAgYmFsbC50cmVhdG1lbnQgPSAna2luZW1hdGljJztcbiAgICAgICAgYmFsbC5zdGF0ZS52ZWwueCA9ICh0YXJnZXRYIC0gYmFsbC5zdGF0ZS5wb3MueCkgLyAxNTAwO1xuICAgICAgICBiYWxsLnN0YXRlLnZlbC55ID0gKHRhcmdldFkgLSBiYWxsLnN0YXRlLnBvcy55KSAvIDE1MDA7XG4gICAgICAgIGJhbGwucmVjYWxjKCk7XG5cbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGJhbGwudHJlYXRtZW50ID0gJ3N0YXRpYyc7XG4gICAgICAgICAgICBiYWxsLnN0YXRlLnBvcy54ID0gdGFyZ2V0WDtcbiAgICAgICAgICAgIGJhbGwuc3RhdGUucG9zLnkgPSB0YXJnZXRZO1xuICAgICAgICAgICAgYmFsbC5zdGF0ZS52ZWwueCA9IDA7XG4gICAgICAgICAgICBiYWxsLnN0YXRlLnZlbC55ID0gMDtcbiAgICAgICAgICAgIGJhbGwucmVjYWxjKCk7XG5cbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgYmFsbC50cmVhdG1lbnQgPSAnZHluYW1pYyc7XG4gICAgICAgICAgICAgICAgYmFsbC5yZWNhbGMoKTtcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgICAgIH0sIDMwMDApXG4gICAgICAgICAgICB9LCAxNTAwKVxuICAgICAgICB9LCAxNTAwKVxuICAgIH1cbn0pO1xuIiwiLyoqIEBqc3ggUmVhY3QuRE9NICovXG5cbnZhciBEcm9wRGF0YUNoZWNrZXIgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdEcm9wRGF0YUNoZWNrZXInLFxuICAgIC8vIHByb3BzOiBsb2dCb29rLCB3b3JsZFxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdGhpc1Jlc3VsdDogXCJEbyBhbiBleHBlcmltZW50IHRvIHNlZSBpZiB5b3UgY2FuIGZpZ3VyZSBvdXQgd2hpY2ggYmFsbCBmYWxscyBmYXN0ZXIsIGFuZCBsZXQgbWUga25vdyB3aGVuIHlvdSdyZSBkb25lIVwiLFxuICAgICAgICAgICAgcHJldlJlc3VsdDogJycsXG4gICAgICAgICAgICBoeXBvdGhlc2lzOiB0aGlzLnByb3BzLmluaXRpYWxIeXBvdGhlc2lzLCAvLyB3aWxsIGV2ZW50dWFsbHkgYmUgc2V0IHdoZW4gdGhleSBmaW5pc2ggdGhlIHdhbGt0aHJvdWdoLiAgaXQgY2FuIGJlIFwiYm93bGluZ1wiLCBcInRlbm5pc1wiLCBvciBcInNhbWVcIlxuICAgICAgICAgICAgZGlzcHJvdmVuOiBmYWxzZSxcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBwcmV0dHlIeXBvdGhlc2lzID0gUmVhY3QuRE9NLnAoe2NsYXNzTmFtZTogXCJjaGVja2VyX3lvdXItaHlwb1wifSwgUmVhY3QuRE9NLmVtKG51bGwsIFwiWW91ciBoeXBvdGhlc2lzIHdhcyBcIiwgdGhpcy5wcmV0dHlIeXBvdGhlc2lzKCksIFwiLlwiKSk7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmRpc3Byb3Zlbikge1xuICAgICAgICAgICAgdmFyIGJvd2xpbmdCdXR0b24gPSBSZWFjdC5ET00uYnV0dG9uKHtjbGFzc05hbWU6IFwiYnRuIGJ0bi1kZWZhdWx0XCIsIG9uQ2xpY2s6IHRoaXMuYm93bGluZ30sIFwiVGhlIGJvd2xpbmcgYmFsbCBmYWxscyBmYXN0ZXIuXCIpXG4gICAgICAgICAgICB2YXIgdGVubmlzQnV0dG9uID0gUmVhY3QuRE9NLmJ1dHRvbih7Y2xhc3NOYW1lOiBcImJ0biBidG4tZGVmYXVsdFwiLCBvbkNsaWNrOiB0aGlzLnRlbm5pc30sIFwiVGhlIHRlbm5pcyBiYWxsIGZhbGxzIGZhc3Rlci5cIilcbiAgICAgICAgICAgIHZhciBzYW1lQnV0dG9uID0gUmVhY3QuRE9NLmJ1dHRvbih7Y2xhc3NOYW1lOiBcImJ0biBidG4tZGVmYXVsdFwiLCBvbkNsaWNrOiB0aGlzLnNhbWV9LCBcIkJvdGggYmFsbHMgZmFsbCBhdCB0aGUgc2FtZSByYXRlLlwiKVxuICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUuaHlwb3RoZXNpcyA9PT0gJ2Jvd2xpbmcnKSB7XG4gICAgICAgICAgICAgICAgYm93bGluZ0J1dHRvbiA9IFJlYWN0LkRPTS5kaXYobnVsbClcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS5oeXBvdGhlc2lzID09PSAndGVubmlzJykge1xuICAgICAgICAgICAgICAgIHRlbm5pc0J1dHRvbiA9IFJlYWN0LkRPTS5kaXYobnVsbClcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS5oeXBvdGhlc2lzID09PSAnc2FtZScpIHtcbiAgICAgICAgICAgICAgICBzYW1lQnV0dG9uID0gUmVhY3QuRE9NLmRpdihudWxsKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJjaGVja2VyXCJ9LCBcbiAgICAgICAgICAgICAgICBwcmV0dHlIeXBvdGhlc2lzLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uaW1nKHtzcmM6IFwiL2ltYWdlcy9zaXItZnJhbmNpcy5qcGVnXCIsIGNsYXNzTmFtZTogXCJjaGVja2VyX2ZyYW5jaXNcIn0pLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwiY2hlY2tlcl9tYWluXCJ9LCBcbiAgICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLnAobnVsbCwgXCJPa2F5LCB3aGljaCByZXN1bHQgZG8gdGhleSBzdXBwb3J0P1wiKSwgXG4gICAgICAgICAgICAgICAgICAgIGJvd2xpbmdCdXR0b24sIHRlbm5pc0J1dHRvbiwgc2FtZUJ1dHRvblxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS50aGlzUmVzdWx0KSB7XG4gICAgICAgICAgICByZXR1cm4gUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImNoZWNrZXJcIn0sIFxuICAgICAgICAgICAgICAgIHByZXR0eUh5cG90aGVzaXMsIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5pbWcoe3NyYzogXCIvaW1hZ2VzL3Npci1mcmFuY2lzLmpwZWdcIiwgY2xhc3NOYW1lOiBcImNoZWNrZXJfZnJhbmNpc1wifSksIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJjaGVja2VyX21haW5cIn0sIFxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5ET00ucChudWxsLCB0aGlzLnN0YXRlLnRoaXNSZXN1bHQpLCBcbiAgICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLmJ1dHRvbih7Y2xhc3NOYW1lOiBcImJ0biBidG4tZGVmYXVsdFwiLCBvbkNsaWNrOiB0aGlzLnN1cHBvcnR9LCBcIlRoZSBkYXRhIHN1cHBvcnQgbXkgaHlwb3RoZXNpcy5cIiksIFxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5ET00uYnV0dG9uKHtjbGFzc05hbWU6IFwiYnRuIGJ0bi1kZWZhdWx0XCIsIG9uQ2xpY2s6IHRoaXMuZGlzcHJvdmV9LCBcIlRoZSBkYXRhIGRpc3Byb3ZlIG15IGh5cG90aGVzaXMuXCIpXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwiY2hlY2tlclwifSwgXG4gICAgICAgICAgICAgICAgcHJldHR5SHlwb3RoZXNpcywgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmltZyh7c3JjOiBcIi9pbWFnZXMvc2lyLWZyYW5jaXMuanBlZ1wiLCBjbGFzc05hbWU6IFwiY2hlY2tlcl9mcmFuY2lzXCJ9KSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImNoZWNrZXJfbWFpblwifSwgXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5wKG51bGwsIFwiWW91ciBleHBlcmltZW50IGxvb2tzIGdyZWF0LCBhbmQgSSdtIGNvbnZpbmNlZC4gIEhlcmUsIGhhdmUgc29tZSBiYWNvbi5cIilcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIHByZXR0eUh5cG90aGVzaXM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuaHlwb3RoZXNpcyA9PT0gXCJzYW1lXCIpIHtcbiAgICAgICAgICAgIHJldHVybiBcInRoYXQgYm90aCBiYWxscyB3aWxsIGZhbGwgYXQgdGhlIHNhbWUgcmF0ZVwiO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIFwidGhhdCB0aGUgXCIrdGhpcy5zdGF0ZS5oeXBvdGhlc2lzK1wiIGJhbGwgd2lsbCBmYWxsIGZhc3RlclwiO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIHJlc3VsdDogZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyB3ZSByZXR1cm4gdGhlIGVycm9yLCBvciBudWxsIGlmIHRoZXkncmUgY29ycmVjdFxuICAgICAgICB2YXIgZW5vdWdoRGF0YSA9IF8uYWxsKHRoaXMucHJvcHMubG9nQm9vay5kYXRhLCBmdW5jdGlvbiAoZCkge3JldHVybiBkLmxlbmd0aCA+PSA1O30pO1xuICAgICAgICBpZiAoZW5vdWdoRGF0YSkge1xuICAgICAgICAgICAgdmFyIGF2Z3MgPSB7fVxuICAgICAgICAgICAgdmFyIG1heERlbHRhcyA9IHt9XG4gICAgICAgICAgICBmb3IgKHZhciBuYW1lIGluIHRoaXMucHJvcHMubG9nQm9vay5kYXRhKSB7XG4gICAgICAgICAgICAgICAgYXZnc1tuYW1lXSA9IF8ucmVkdWNlKHRoaXMucHJvcHMubG9nQm9vay5kYXRhW25hbWVdLFxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiAoYSwgYikge3JldHVybiBhICsgYjt9KSAvIHRoaXMucHJvcHMubG9nQm9vay5kYXRhW25hbWVdLmxlbmd0aDtcbiAgICAgICAgICAgICAgICBtYXhEZWx0YXNbbmFtZV0gPSBfLm1heChfLm1hcCh0aGlzLnByb3BzLmxvZ0Jvb2suZGF0YVtuYW1lXSxcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKGRhdHVtKSB7cmV0dXJuIE1hdGguYWJzKGRhdHVtIC0gYXZnc1tuYW1lXSk7fSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUubG9nKHRoaXMucHJvcHMubG9nQm9vay5kYXRhLCBlbm91Z2hEYXRhLCBhdmdzLCBtYXhEZWx0YXMpO1xuICAgICAgICBpZiAoIWVub3VnaERhdGEpIHtcbiAgICAgICAgICAgIHJldHVybiBcIllvdSBoYXZlbid0IGZpbGxlZCB1cCB5b3VyIGxhYiBub3RlYm9vayEgIE1ha2Ugc3VyZSB5b3UgZ2V0IGVub3VnaCBkYXRhIHNvIHlvdSBrbm93IHlvdXIgcmVzdWx0cyBhcmUgYWNjdXJhdGUuXCI7XG4gICAgICAgIH0gZWxzZSBpZiAobWF4RGVsdGFzW1wiQm93bGluZyBCYWxsXCJdID4gMzAwKSB7XG4gICAgICAgICAgICByZXR1cm4gXCJPbmUgb2YgeW91ciByZXN1bHRzIGZvciB0aGUgYm93bGluZyBiYWxsIGxvb2tzIHByZXR0eSBmYXIgb2ZmISAgVHJ5IGdldHRpbmcgc29tZSBtb3JlIGRhdGEgdG8gbWFrZSBzdXJlIGl0IHdhcyBhIGZsdWtlLlwiO1xuICAgICAgICB9IGVsc2UgaWYgKG1heERlbHRhc1tcIlRlbm5pcyBCYWxsXCJdID4gMzAwKSB7XG4gICAgICAgICAgICByZXR1cm4gXCJPbmUgb2YgeW91ciByZXN1bHRzIGZvciB0aGUgdGVubmlzIGJhbGwgbG9va3MgcHJldHR5IGZhciBvZmYhICBUcnkgZ2V0dGluZyBzb21lIG1vcmUgZGF0YSB0byBtYWtlIHN1cmUgaXQgd2FzIGEgZmx1a2UuXCI7XG4gICAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgICAgICAgICAgKHRoaXMuc3RhdGUuaHlwb3RoZXNpcyA9PT0gXCJzYW1lXCJcbiAgICAgICAgICAgICAgICAgICAgJiYgTWF0aC5hYnMoYXZnc1tcIkJvd2xpbmcgQmFsbFwiXSAtIGF2Z3NbXCJUZW5uaXMgQmFsbFwiXSkgPiAxMDApXG4gICAgICAgICAgICAgICAgfHwgKHRoaXMuc3RhdGUuaHlwb3RoZXNpcyA9PT0gXCJib3dsaW5nXCJcbiAgICAgICAgICAgICAgICAgICAgJiYgYXZnc1tcIkJvd2xpbmcgQmFsbFwiXSA8IGF2Z3NbXCJUZW5uaXMgQmFsbFwiXSArIDEwMClcbiAgICAgICAgICAgICAgICB8fCAodGhpcy5zdGF0ZS5oeXBvdGhlc2lzID09PSBcInRlbm5pc1wiXG4gICAgICAgICAgICAgICAgICAgICYmIGF2Z3NbXCJUZW5uaXMgQmFsbFwiXSA8IGF2Z3NbXCJCb3dsaW5nIEJhbGxcIl0gKyAxMDApXG4gICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICByZXR1cm4gXCJUaG9zZSByZXN1bHRzIGRvbid0IGxvb2sgdmVyeSBjb25zaXN0ZW50IHdpdGggeW91ciBoeXBvdGhlc2lzLiAgSXQncyBmaW5lIGlmIHlvdXIgaHlwb3RoZXNpcyB3YXMgZGlzcHJvdmVuLCB0aGF0J3MgaG93IHNjaWVuY2Ugd29ya3MhXCI7XG4gICAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgICAgICAgICAgdGhpcy5zdGF0ZS5oeXBvdGhlc2lzICE9PSBcInNhbWVcIlxuICAgICAgICAgICAgICAgIHx8IGF2Z3NbXCJCb3dsaW5nIEJhbGxcIl0gPCA4MDBcbiAgICAgICAgICAgICAgICB8fCBhdmdzW1wiQm93bGluZyBCYWxsXCJdID4gMTUwMFxuICAgICAgICAgICAgICAgIHx8IGF2Z3NbXCJUZW5uaXMgQmFsbFwiXSA8IDgwMFxuICAgICAgICAgICAgICAgIHx8IGF2Z3NbXCJUZW5uaXMgQmFsbFwiXSA+IDE1MDApIHtcbiAgICAgICAgICAgIHJldHVybiBcIlRob3NlIHJlc3VsdHMgYXJlIGNvbnNpc3RlbnQsIGJ1dCB0aGV5IGRvbid0IGxvb2sgcXVpdGUgcmlnaHQgdG8gbWUuICBNYWtlIHN1cmUgeW91J3JlIGRyb3BwaW5nIHRoZSBiYWxscyBnZW50bHkgZnJvbSB0aGUgc2FtZSBoZWlnaHQgYWJvdmUgdGhlIHRvcCBzZW5zb3IuXCI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBzdXBwb3J0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuYXNrRnJhbmNpcygpO1xuICAgIH0sXG5cbiAgICBkaXNwcm92ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGRpc3Byb3ZlbjogdHJ1ZSxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGJvd2xpbmc6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBkaXNwcm92ZW46IGZhbHNlLFxuICAgICAgICAgICAgaHlwb3RoZXNpczogXCJib3dsaW5nXCIsXG4gICAgICAgIH0sIHRoaXMuYXNrRnJhbmNpcyk7XG4gICAgfSxcblxuICAgIHRlbm5pczogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGRpc3Byb3ZlbjogZmFsc2UsXG4gICAgICAgICAgICBoeXBvdGhlc2lzOiBcInRlbm5pc1wiLFxuICAgICAgICB9LCB0aGlzLmFza0ZyYW5jaXMpO1xuICAgIH0sXG5cbiAgICBzYW1lOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgZGlzcHJvdmVuOiBmYWxzZSxcbiAgICAgICAgICAgIGh5cG90aGVzaXM6IFwic2FtZVwiLFxuICAgICAgICB9LCB0aGlzLmFza0ZyYW5jaXMpO1xuICAgIH0sXG5cbiAgICBhc2tGcmFuY2lzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgdGhpc1Jlc3VsdDogdGhpcy5yZXN1bHQoKSxcbiAgICAgICAgICAgIHByZXZSZXN1bHQ6IHRoaXMuc3RhdGUudGhpc1Jlc3VsdFxuICAgICAgICB9KTtcbiAgICB9XG59KVxuXG5tb2R1bGUuZXhwb3J0cyA9IERyb3BEYXRhQ2hlY2tlcjtcbiIsInZhciBTdG9wd2F0Y2ggPSByZXF1aXJlKCcuL3N0b3B3YXRjaCcpO1xudmFyIGNoZWNrQ29sbGlzaW9uID0gcmVxdWlyZSgnLi9jaGVjay1jb2xsaXNpb24nKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEdhdGU7XG5cbnZhciBFTlRFUl9GQURFT1VUX0RVUkFUSU9OID0gMjBcbnZhciBFWElUX0ZBREVPVVRfRFVSQVRJT04gPSAyMFxuXG4vKipcbiAqIE9wdGktdGhpbmd5IGdhdGUuXG4gKiBEZXRlY3RzIHdoZW4gYm9kaWVzIGVudGVyIGFuZCBleGl0IGEgc3BlY2lmaWVkIGFyZWEuXG4gKlxuICogcG9seWdvbiAtIHNob3VsZCBiZSBhIGxpc3Qgb2YgdmVjdG9yaXNoLCB3aGljaCBtdXN0IGJlIGNvbnZleC5cbiAqIGJvZHkgLSBzaG91bGQgYmUgYSBib2R5LCBvciBudWxsIHRvIHRyYWNrIGFsbCBib2RpZXNcbiAqIG9wdHMgLSB7ZGVidWc6IGZhbHNlfVxuICpcbiAqIFVzYWdlIEV4YW1wbGU6XG4gKiB2YXIgZ2F0ZSA9IG5ldyBHYXRlKGF3ZXNvbWVfd29ybGQsIGNvbnRhaW5lcl9kaXYsIFt7eDogMCwgeTogMzAwfSwgLi4uXSwge2RlYnVnOiB0cnVlfSlcbiAqIGdhdGUub24oJ2V4aXQnLCBmdW5jdGlvbihkYXRhKSB7XG4gKiAgIGNvbnNvbGUubG9nKFwiWW91IGVzY2FwZWQgbWUgYWdhaW4hIEkgd2lsbCBmaW5kIHlvdSwgb2ggXCIsIGRhdGEuYm9keSk7XG4gKiB9KVxuICovXG5mdW5jdGlvbiBHYXRlKHdvcmxkLCBjb250YWluZXIsIHBvbHlnb24sIHBvcywgYm9keSwgb3B0cykge1xuICAgIG9wdHMgPSBvcHRzIHx8IHt9O1xuICAgIHRoaXMud29ybGQgPSB3b3JsZFxuICAgIHRoaXMuYm9keSA9IGJvZHk7XG4gICAgLy8gYm9kaWVzIGN1cnJlbnRseSBpbnNpZGUgdGhpcyBnYXRlLlxuICAgIHRoaXMuY29udGFpbnMgPSBbXVxuICAgIHRoaXMuX3N1YnNjcmliZSgpXG4gICAgdGhpcy5wb2x5Z29uID0gcG9seWdvblxuICAgIHRoaXMuY29sbGlzaW9uX2JvZHkgPSBQaHlzaWNzLmJvZHkoJ2NvbnZleC1wb2x5Z29uJywge1xuICAgICAgICB2ZXJ0aWNlczogcG9seWdvbixcbiAgICAgICAgdHJlYXRtZW50OiAnbWFnaWMnLFxuICAgICAgICB4OiBwb3NbMF0sXG4gICAgICAgIHk6IHBvc1sxXSxcbiAgICAgICAgdng6IDAsXG4gICAgICAgIGFuZ2xlOiAwLFxuICAgICAgICByZXN0aXR1dGlvbjogMC45LFxuICAgICAgICBzdHlsZXM6IHtcbiAgICAgICAgICAgIGZpbGxTdHlsZTogJyM4NTk5MDAnLFxuICAgICAgICAgICAgYW5nbGVJbmRpY2F0b3I6ICcjNDE0NzAwJ1xuICAgICAgICB9XG4gICAgfSlcbiAgICB0aGlzLm1vdmVkX3BvaW50cyA9IHBvbHlnb24ubWFwKGZ1bmN0aW9uIChwKSB7XG4gICAgICAgIHJldHVybiB7eDogcC54ICsgcG9zWzBdLCB5OiBwLnkgKyBwb3NbMV19XG4gICAgfSk7XG4gICAgdGhpcy52aWV3ID0gdGhpcy53b3JsZC5yZW5kZXJlcigpLmNyZWF0ZVZpZXcodGhpcy5jb2xsaXNpb25fYm9keS5nZW9tZXRyeSwgeyBzdHJva2VTdHlsZTogJyNhYWEnLCBsaW5lV2lkdGg6IDIsIGZpbGxTdHlsZTogJ3JnYmEoMCwwLDAsMCknIH0pXG4gICAgLy8gdGhpcy53b3JsZC5hZGQodGhpcy5jb2xsaXNpb25fYm9keSlcbiAgICBpZiAob3B0cy5kZWJ1ZykgdGhpcy5zcGVha0xvdWRseSgpO1xuICAgIHRoaXMuX2NvbG9yID0gb3B0cy5jb2xvclxuXG4gICAgdGhpcy5fZW50ZXJfZmFkZW91dCA9IDA7XG4gICAgdGhpcy5fZXhpdF9mYWRlb3V0ID0gMDtcbn1cblxuR2F0ZS5wcm90b3R5cGUuX3N1YnNjcmliZSA9IGZ1bmN0aW9uKCkge1xuICAgIFBoeXNpY3MudXRpbC50aWNrZXIub24oZnVuY3Rpb24odGltZSkge1xuICAgICAgICBpZiAodGhpcy5ib2R5KSB7XG4gICAgICAgICAgICB0aGlzLmhhbmRsZUJvZHkodGhpcy5ib2R5KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMud29ybGQuZ2V0Qm9kaWVzKCkuZm9yRWFjaCh0aGlzLmhhbmRsZUJvZHkuYmluZCh0aGlzKSlcbiAgICAgICAgfVxuICAgIH0uYmluZCh0aGlzKSlcblxuICAgIC8vIFN1YnNjcmliZSB0byByZW5kZXIgZXZlbnRzXG4gICAgdGhpcy53b3JsZC5vbigncmVuZGVyJywgdGhpcy5fcmVuZGVyLmJpbmQodGhpcykpO1xuXG4gICAgLy8gU3Vic2NyaWJlIHRvIHNlbGYuICh3SGFUPylcbiAgICB0aGlzLm9uKCdlbnRlcicsIGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLl9lbnRlcl9mYWRlb3V0ID0gRU5URVJfRkFERU9VVF9EVVJBVElPTlxuICAgIH0uYmluZCh0aGlzKSlcbiAgICB0aGlzLm9uKCdleGl0JywgZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuX2V4aXRfZmFkZW91dCA9IEVYSVRfRkFERU9VVF9EVVJBVElPTlxuICAgIH0uYmluZCh0aGlzKSlcbn1cblxuR2F0ZS5wcm90b3R5cGUuX3JlbmRlciA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciByID0gdGhpcy53b3JsZC5yZW5kZXJlcigpO1xuICAgIHZhciBhbHBoYSA9IHRoaXMuX2VudGVyX2ZhZGVvdXQgLyBFTlRFUl9GQURFT1VUX0RVUkFUSU9OXG4gICAgdmFyIHN0cm9rZVN0eWxlcyA9IHtcbiAgICAgICAgZ3JlZW46ICcjMGEwJyxcbiAgICAgICAgcmVkOiAnI2EwMCcsXG4gICAgICAgIHVuZGVmaW5lZDogJyNhYWEnLFxuICAgIH1cbiAgICB2YXIgZmlsbFN0eWxlID0ge1xuICAgICAgICBncmVlbjogJ3JnYmEoNTAsMTAwLDUwLCcrYWxwaGErJyknLFxuICAgICAgICByZWQ6ICdyZ2JhKDEwMCw1MCw1MCwnK2FscGhhKycpJyxcbiAgICAgICAgdW5kZWZpbmVkOiAncmdiYSgwLDAsMCwnK2FscGhhKycpJyxcbiAgICB9XG4gICAgci5kcmF3UG9seWdvbih0aGlzLm1vdmVkX3BvaW50cywge1xuICAgICAgICBzdHJva2VTdHlsZTogc3Ryb2tlU3R5bGVzW3RoaXMuX2NvbG9yXSxcbiAgICAgICAgbGluZVdpZHRoOiAyLFxuICAgICAgICBmaWxsU3R5bGU6IGZpbGxTdHlsZVt0aGlzLl9jb2xvcl0sXG4gICAgfSk7XG5cbiAgICB0aGlzLl9lbnRlcl9mYWRlb3V0ID0gTWF0aC5tYXgoMCwgdGhpcy5fZW50ZXJfZmFkZW91dCAtIDEpXG4gICAgdGhpcy5fZXhpdF9mYWRlb3V0ID0gTWF0aC5tYXgoMCwgdGhpcy5fZXhpdF9mYWRlb3V0IC0gMSlcbn1cblxuR2F0ZS5wcm90b3R5cGUuaGFuZGxlQm9keSA9IGZ1bmN0aW9uKGJvZHkpIHtcbiAgICAvLyBJZ25vcmUgYm9kaWVzIGJlaW5nIGRyYWdnZWQuXG4gICAgaWYgKGJvZHkuZHJhZ2dpbmcpIHJldHVybjtcblxuICAgIHZhciB3YXNJbiA9IHRoaXMuY29udGFpbnMuaW5kZXhPZihib2R5KSAhPSAtMVxuICAgIHZhciBpc0luID0gdGhpcy50ZXN0Qm9keShib2R5KVxuICAgIGlmICghd2FzSW4gJiYgaXNJbikge1xuICAgICAgICB0aGlzLmNvbnRhaW5zLnB1c2goYm9keSlcbiAgICAgICAgdGhpcy5lbWl0KCdlbnRlcicsIHtib2R5OiBib2R5fSlcbiAgICB9XG4gICAgaWYgKHdhc0luICYmICFpc0luKSB7XG4gICAgICAgIHRoaXMuY29udGFpbnMgPSBfLndpdGhvdXQodGhpcy5jb250YWlucywgYm9keSk7XG4gICAgICAgIHRoaXMuZW1pdCgnZXhpdCcsIHtib2R5OiBib2R5fSlcbiAgICB9XG59XG5cbkdhdGUucHJvdG90eXBlLnRlc3RCb2R5ID0gZnVuY3Rpb24oYm9keSkge1xuICAgIGlmICghd2luZG93LmRlYnVnICYmIGJvZHkudHJlYXRtZW50ICE9PSAnZHluYW1pYycpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gY2hlY2tDb2xsaXNpb24odGhpcy5jb2xsaXNpb25fYm9keSwgYm9keSlcbiAgICAvLy8gdmFyIHBvcyA9IGJvZHkuc3RhdGUucG9zXG4gICAgLy8vIHJldHVybiB0aGlzLnRlc3RQb2ludCh7eDogcG9zLngsIHk6IHBvcy55fSlcbn1cblxuR2F0ZS5wcm90b3R5cGUudGVzdFBvaW50ID0gZnVuY3Rpb24odmVjdG9yaXNoKSB7XG4gICAgcmV0dXJuIFBoeXNpY3MuZ2VvbWV0cnkuaXNQb2ludEluUG9seWdvbihcbiAgICAgICAgdmVjdG9yaXNoLFxuICAgICAgICB0aGlzLnBvbHlnb24pO1xufVxuXG4vLyBHYXRlLnByb3RvdHlwZS5ydW5TdG9wd2F0Y2ggPSBmdW5jdGlvbihzdG9wd2F0Y2gpIHtcbiAgICAvLyB0aGlzLm9uKCdlbnRlcicsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgLy8gc3RvcHdhdGNoLnJlc2V0KCk7XG4gICAgICAgIC8vIHN0b3B3YXRjaC5zdGFydCgpO1xuICAgIC8vIH0pO1xuICAgIC8vIHRoaXMub24oJ2V4aXQnLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIC8vIHN0b3B3YXRjaC5zdG9wKCk7XG4gICAgLy8gfSk7XG4vLyB9XG5cbi8qKlxuICogRGVidWdnaW5nIGZ1bmN0aW9uIHRvIGxpc3RlbiB0byBteSBvd24gZXZlbnRzIGFuZCBjb25zb2xlLmxvZyB0aGVtLlxuICovXG5HYXRlLnByb3RvdHlwZS5zcGVha0xvdWRseSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMub24oJ2VudGVyJywgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICBjb25zb2xlLmxvZygnZW50ZXInLCBkYXRhLmJvZHkpXG4gICAgfSlcbiAgICB0aGlzLm9uKCdleGl0JywgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICBjb25zb2xlLmxvZygnZXhpdCcsIGRhdGEuYm9keSlcbiAgICB9KVxuICAgIHJldHVybiB7YnV0Q2FycnlBQmlnU3RpY2s6ICcnfVxufVxuXG5fLmV4dGVuZChHYXRlLnByb3RvdHlwZSwgUGh5c2ljcy51dGlsLnB1YnN1Yi5wcm90b3R5cGUpXG4iLCJcbnZhciBDYW5HcmFwaCA9IHJlcXVpcmUoJy4vY2FuZ3JhcGgnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEdyYXBoXG5cbmZ1bmN0aW9uIGdldERhdHVtKGl0ZW0pIHtcbiAgICByZXR1cm4gaXRlbS5hdHRyLnNwbGl0KCcuJykucmVkdWNlKGZ1bmN0aW9uIChub2RlLCBhdHRyKSB7XG4gICAgICAgIHJldHVybiBub2RlW2F0dHJdXG4gICAgfSwgaXRlbS5ib2R5LnN0YXRlKVxufVxuXG5mdW5jdGlvbiBHcmFwaChwYXJlbnQsIHRyYWNraW5nLCBvcHRpb25zKSB7XG4gICAgdGhpcy5vID0gXy5leHRlbmQoe1xuICAgICAgICB0b3A6IDEwLFxuICAgICAgICBsZWZ0OiAxMCxcbiAgICAgICAgd2lkdGg6IDYwMCxcbiAgICAgICAgaGVpZ2h0OiA0MDAsXG4gICAgICAgIHdvcmxkSGVpZ2h0OiAyMDBcbiAgICB9LCBvcHRpb25zKVxuICAgIHRoaXMudHJhY2tpbmcgPSB0cmFja2luZ1xuICAgIHRoaXMuZGF0YSA9IFtdXG4gICAgdGhpcy5ub2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJylcbiAgICB0aGlzLm5vZGUuY2xhc3NOYW1lID0gJ2dyYXBoJ1xuICAgIHRoaXMubm9kZS53aWR0aCA9IHRoaXMuby53aWR0aFxuICAgIHRoaXMubm9kZS5oZWlnaHQgPSB0aGlzLm8uaGVpZ2h0XG4gICAgdGhpcy5ub2RlLnN0eWxlLnRvcCA9IHRoaXMuby50b3AgKyAncHgnXG4gICAgdGhpcy5ub2RlLnN0eWxlLmxlZnQgPSB0aGlzLm8ubGVmdCArICdweCdcbiAgICB2YXIgbnVtZ3JhcGhzID0gT2JqZWN0LmtleXModHJhY2tpbmcpLmxlbmd0aFxuICAgIHZhciBncmFwaGhlaWdodCA9IHRoaXMuby5oZWlnaHQgLyBudW1ncmFwaHNcbiAgICBwYXJlbnQuYXBwZW5kQ2hpbGQodGhpcy5ub2RlKVxuXG4gICAgdGhpcy5ncmFwaHMgPSB7fVxuICAgIHZhciBpID0gMFxuICAgIGZvciAodmFyIG5hbWUgaW4gdHJhY2tpbmcpIHtcbiAgICAgICAgdGhpcy5ncmFwaHNbbmFtZV0gPSBuZXcgQ2FuR3JhcGgoe1xuICAgICAgICAgICAgbm9kZTogdGhpcy5ub2RlLFxuICAgICAgICAgICAgbWluc2NhbGU6IHRyYWNraW5nW25hbWVdLm1pbnNjYWxlLFxuICAgICAgICAgICAgdGl0bGU6IHRyYWNraW5nW25hbWVdLnRpdGxlLFxuICAgICAgICAgICAgdG9wOiBncmFwaGhlaWdodCAqIGkrKyxcbiAgICAgICAgICAgIGxlZnQ6IDAsXG4gICAgICAgICAgICB3aWR0aDogdGhpcy5vLndpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0OiBncmFwaGhlaWdodCxcbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICAvKlxuICAgIHRoaXMuZ3JhcGggPSBuZXcgUmlja3NoYXcuR3JhcGgoe1xuICAgICAgICBlbGVtZW50OiB0aGlzLm5vZGUsXG4gICAgICAgIHdpZHRoOiA2MDAsXG4gICAgICAgIGhlaWdodDogNjAwLFxuICAgICAgICByZW5kZXJlcjogJ2xpbmUnLFxuICAgICAgICBzZXJpZXM6IG5ldyBSaWNrc2hhdy5TZXJpZXMoXG4gICAgICAgICAgICB0cmFja2luZy5tYXAoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge25hbWU6IGl0ZW0ubmFtZX1cbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgdW5kZWZpbmVkLCB7XG4gICAgICAgICAgICAgICAgdGltZUludGVydmFsOiAyNTAsXG4gICAgICAgICAgICAgICAgbWF4RGF0YVBvaW50czogMTAwLFxuICAgICAgICAgICAgICAgIHRpbWVCYXNlOiBuZXcgRGF0ZSgpLmdldFRpbWUoKSAvIDEwMDBcbiAgICAgICAgICAgIH1cbiAgICAgICAgKVxuICAgIH0pXG4gICAgKi9cbn1cblxuR3JhcGgucHJvdG90eXBlID0ge1xuICAgIHVwZGF0ZURhdGE6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGRhdGEgPSB7fVxuICAgICAgICB2YXIgaGVpZ2h0ID0gdGhpcy5vLndvcmxkSGVpZ2h0XG4gICAgICAgIHRoaXMubm9kZS5nZXRDb250ZXh0KCcyZCcpLmNsZWFyUmVjdCgwLCAwLCB0aGlzLm5vZGUud2lkdGgsIHRoaXMubm9kZS5oZWlnaHQpXG4gICAgICAgIGZvciAodmFyIG5hbWUgaW4gdGhpcy50cmFja2luZykge1xuICAgICAgICAgICAgdGhpcy5ncmFwaHNbbmFtZV0uYWRkUG9pbnQodGhpcy5nZXREYXR1bShuYW1lKSlcbiAgICAgICAgICAgIHRoaXMuZ3JhcGhzW25hbWVdLmRyYXcoKVxuICAgICAgICB9XG4gICAgfSxcbiAgICBnZXREYXR1bTogZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgICAgdmFyIGl0ZW0gPSB0aGlzLnRyYWNraW5nW25hbWVdXG4gICAgICAgIGlmIChpdGVtLmZuKSB7XG4gICAgICAgICAgICByZXR1cm4gaXRlbS5mbigpO1xuICAgICAgICB9IGVsc2UgaWYgKGl0ZW0uYXR0ciA9PT0gJ3Bvcy55Jykge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuby53b3JsZEhlaWdodCAtIGl0ZW0uYm9keS5zdGF0ZS5wb3MueVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGdldERhdHVtKGl0ZW0pXG4gICAgICAgIH1cbiAgICB9LFxuICAgIHVwZGF0ZTogZnVuY3Rpb24gKHRpbWVzdGVwKSB7XG4gICAgICAgIHRoaXMudXBkYXRlRGF0YSgpXG4gICAgfVxufVxuXG4iLCJcbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIEJhc2U6IHJlcXVpcmUoJy4vYmFzZScpLFxuICAgIERlbW86IHJlcXVpcmUoJy4vZGVtbycpLFxuICAgIE5ld3RvbjE6IHJlcXVpcmUoJy4vbmV3dG9uMScpLFxuICAgIE9yYml0OiByZXF1aXJlKCcuL29yYml0JyksXG4gICAgTW9vbjogcmVxdWlyZSgnLi9tb29uJyksXG4gICAgQXN0ZXJvaWRzOiByZXF1aXJlKCcuL2FzdGVyb2lkcycpLFxuICAgIFNsb3BlOiByZXF1aXJlKCcuL3Nsb3BlJyksXG4gICAgRHJvcDogcmVxdWlyZSgnLi9kcm9wJyksXG4gICAgVHJ5R3JhcGg6IHJlcXVpcmUoJy4vdHJ5LWdyYXBoJyksXG4gICAgQ2F2ZURyYXc6IHJlcXVpcmUoJy4vY2F2ZWRyYXcnKSxcbn1cbiIsIlxudmFyIFdhbGt0aHJvdWdoID0gcmVxdWlyZSgnLi93YWxrLXRocm91Z2guanN4JylcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoRXhlcmNpc2UsIGdvdEh5cG90aGVzaXMpIHtcbiAgICB2YXIgbm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChub2RlKVxuICAgIFJlYWN0LnJlbmRlckNvbXBvbmVudChXYWxrdGhyb3VnaCh7XG4gICAgICAgIHN0ZXBzOiByZXF1aXJlKCcuL2ludHJvLmpzeCcpLFxuICAgICAgICBvbkh5cG90aGVzaXM6IGdvdEh5cG90aGVzaXMsXG4gICAgICAgIG9uRG9uZTogZnVuY3Rpb24gKGh5cG90aGVzaXMpIHtcbiAgICAgICAgICAgIFJlYWN0LnVubW91bnRDb21wb25lbnRBdE5vZGUobm9kZSk7XG4gICAgICAgICAgICBub2RlLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQobm9kZSk7XG4gICAgICAgIH0sXG4gICAgICAgIEV4ZXJjaXNlOiBFeGVyY2lzZVxuICAgIH0pLCBub2RlKVxufVxuXG4iLCIvKiogQGpzeCBSZWFjdC5ET00gKi9cblxudmFyIFBUID0gUmVhY3QuUHJvcFR5cGVzXG52YXIgU3RlcCA9IHJlcXVpcmUoJy4vc3RlcC5qc3gnKVxuXG52YXIgREVCVUcgPSBmYWxzZVxuXG52YXIgQnV0dG9uR3JvdXAgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdCdXR0b25Hcm91cCcsXG4gICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiB0aGlzLnByb3BzLmNsYXNzTmFtZX0sIFxuICAgICAgICAgICAgdGhpcy5wcm9wcy5vcHRpb25zLm1hcChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgICAgICAgIHZhciBjbHMgPSBcImJ0biBidG4tZGVmYXVsdFwiXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMuc2VsZWN0ZWQgPT09IGl0ZW1bMF0pIHtcbiAgICAgICAgICAgICAgICAgICAgY2xzICs9ICcgYWN0aXZlJ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gUmVhY3QuRE9NLmJ1dHRvbih7a2V5OiBpdGVtWzBdLCBjbGFzc05hbWU6IGNscywgb25DbGljazogdGhpcy5wcm9wcy5vblNlbGVjdC5iaW5kKG51bGwsIGl0ZW1bMF0pfSwgaXRlbVsxXSk7XG4gICAgICAgICAgICB9LmJpbmQodGhpcykpXG4gICAgICAgICk7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gW1xuICAgIGZ1bmN0aW9uIChwcm9wcykge1xuICAgICAgICByZXR1cm4gU3RlcChfLmV4dGVuZChwcm9wcywge1xuICAgICAgICAgICAgaWQ6ICdoZWxsbycsXG4gICAgICAgICAgICB0aXRsZTogXCJIaSEgSSdtIFNpciBGcmFuY2lzIEJhY29uXCIsXG4gICAgICAgICAgICBzaG93QmFjb246IHRydWUsXG4gICAgICAgICAgICBib2R5OiBcIkkgd2FzIG1hZGUgYSBLbmlnaHQgb2YgRW5nbGFuZCBmb3IgZG9pbmcgYXdlc29tZSBTY2llbmNlLiBXZSdyZSBnb2luZyB0byB1c2Ugc2NpZW5jZSB0byBmaWd1cmUgb3V0IGNvb2wgdGhpbmdzIGFib3V0IHRoZSB3b3JsZC5cIixcbiAgICAgICAgICAgIG5leHQ6IFwiTGV0J3MgZG8gc2NpZW5jZSFcIlxuICAgICAgICB9KSlcbiAgICB9LFxuXG4gICAgZnVuY3Rpb24gKHByb3BzKSB7XG4gICAgICAgIHZhciBoeXBvdGhlc2lzID0gcHJvcHMuZGF0YS5oeXBvdGhlc2lzXG4gICAgICAgIHJldHVybiBTdGVwKF8uZXh0ZW5kKHByb3BzLCB7XG4gICAgICAgICAgICBpZDogJ2Rlc2NyaXB0aW9uJyxcbiAgICAgICAgICAgIHRpdGxlOiBcIkV4cGVyaW1lbnQgIzFcIixcbiAgICAgICAgICAgIG9uVXBkYXRlOiBmdW5jdGlvbiAocHJldlByb3BzKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMuZGF0YS5oeXBvdGhlc2lzICYmICFwcmV2UHJvcHMuZGF0YS5oeXBvdGhlc2lzKSB7XG4gICAgICAgICAgICAgICAgICAgIHByb3BzLm9uSHlwb3RoZXNpcyhwcm9wcy5kYXRhLmh5cG90aGVzaXMpO1xuICAgICAgICAgICAgICAgICAgICBERUJVRyA/IHByb3BzLm9uTmV4dCgpIDogc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9wcy5vbk5leHQoKVxuICAgICAgICAgICAgICAgICAgICB9LCA1MDApXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGJvZHk6IFJlYWN0LkRPTS5kaXYobnVsbCwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLnAobnVsbCwgXCJXaGF0IGZhbGxzIGZhc3RlcjogYSB0ZW5uaXMgYmFsbCBvciBhIGJvd2xpbmcgYmFsbD9cIiksIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5wKG51bGwsIFwiQSBcIiwgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJ1bGluZVwifSwgXCJIeXBvdGhlc2lzXCIpLCBcIiBpcyB3aGF0IHlvdSB0aGluayB3aWxsIGhhcHBlbi5cIiksIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5ocihudWxsKSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImxhcmdlXCJ9LCBcIkkgdGhpbms6XCIsIFxuICAgICAgICAgICAgICAgICAgICBCdXR0b25Hcm91cCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU6IFwid2Fsa3Rocm91Z2hfaHlwb3RoZXNlc1wiLCBcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkOiBoeXBvdGhlc2lzLCBcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uU2VsZWN0OiBwcm9wcy5zZXREYXRhLmJpbmQobnVsbCwgJ2h5cG90aGVzaXMnKSwgXG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zOiBbW1widGVubmlzXCIsIFwiVGhlIHRlbm5pcyBiYWxsIGZhbGxzIGZhc3RlclwiXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBbXCJib3dsaW5nXCIsIFwiVGhlIGJvd2xpbmcgYmFsbCBmYWxscyBmYXN0ZXJcIl0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgW1wic2FtZVwiLCBcIlRoZXkgZmFsbCB0aGUgc2FtZVwiXV19KVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAvKipoeXBvdGhlc2lzICYmIDxwIGNsYXNzTmFtZT1cIndhbGt0aHJvdWdoX2dyZWF0XCI+R3JlYXQhIE5vdyB3ZSBkbyBzY2llbmNlPC9wPioqL1xuICAgICAgICAgICAgKVxuICAgICAgICB9KSlcbiAgICB9LFxuXG4gICAgZnVuY3Rpb24gKHByb3BzKSB7XG4gICAgICAgIHZhciBmaXJzdEJhbGwgPSAndGVubmlzJ1xuICAgICAgICB2YXIgc2Vjb25kQmFsbCA9ICdib3dsaW5nJ1xuICAgICAgICB2YXIgcHJvdmVyID0gcHJvcHMuZGF0YS5wcm92ZXJcbiAgICAgICAgdmFyIGh5cG90aGVzaXMgPSBwcm9wcy5kYXRhLmh5cG90aGVzaXNcblxuICAgICAgICBpZiAocHJvcHMuaHlwb3RoZXNpcyA9PT0gJ2Jvd2xpbmcnKSB7XG4gICAgICAgICAgICBmaXJzdEJhbGwgPSAnYm93bGluZydcbiAgICAgICAgICAgIHNlY29uZEJhbGwgPSAndGVubmlzJ1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHJlc3BvbnNlcyA9IHtcbiAgICAgICAgICAgICd0ZW5uaXMnOiAnTm9wZS4gVGhhdCB3b3VsZCBzaG93IHRoYXQgdGhlIHRlbm5pcyBiYWxsIGZhbGxzIGZhc3RlcicsXG4gICAgICAgICAgICAnYm93bGluZyc6ICdOb3BlLiBUaGF0IHdvdWxkIHNob3cgdGhhdCB0aGUgYm93bGluZyBiYWxsIGZhbGxzIGZhc3RlcicsXG4gICAgICAgICAgICAnc2FtZSc6ICdOb3BlLiBUaGF0IHdvdWxkIHNob3cgdGhhdCB0aGV5IGZhbGwgdGhlIHNhbWUnXG4gICAgICAgIH1cbiAgICAgICAgdmFyIGNvcnJlY3QgPSB7XG4gICAgICAgICAgICAndGVubmlzJzogJ2xlc3MnLFxuICAgICAgICAgICAgJ2Jvd2xpbmcnOiAnbGVzcycsXG4gICAgICAgICAgICAnc2FtZSc6ICdzYW1lJ1xuICAgICAgICB9XG4gICAgICAgIHZhciBwcm92ZXJSZXNwb25zZVxuICAgICAgICB2YXIgaXNDb3JyZWN0ID0gcHJvdmVyID09PSBjb3JyZWN0W2h5cG90aGVzaXNdXG5cbiAgICAgICAgaWYgKHByb3Zlcikge1xuICAgICAgICAgICAgaWYgKGlzQ29ycmVjdCkge1xuICAgICAgICAgICAgICAgIHByb3ZlclJlc3BvbnNlID0gXCJFeGFjdGx5ISBOb3cgbGV0J3MgZG8gdGhlIGV4cGVyaW1lbnQuXCJcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcHJvdmVyUmVzcG9uc2UgPSByZXNwb25zZXNbe1xuICAgICAgICAgICAgICAgICAgICB0ZW5uaXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vcmU6ICdib3dsaW5nJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNhbWU6ICdzYW1lJ1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBib3dsaW5nOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtb3JlOiAndGVubmlzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNhbWU6ICdzYW1lJ1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBzYW1lOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtb3JlOiAnYm93bGluZycsXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXNzOiAndGVubmlzJ1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVtoeXBvdGhlc2lzXVtwcm92ZXJdXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBmdXR1cmVIeXBvdGhlc2lzID0ge1xuICAgICAgICAgICAgdGVubmlzOiAndGhlIHRlbm5pcyBiYWxsIHdpbGwgZmFsbCBmYXN0ZXIgdGhhbiB0aGUgYm93bGluZyBiYWxsJyxcbiAgICAgICAgICAgIGJvd2xpbmc6ICd0aGUgYm93bGluZyBiYWxsIHdpbGwgZmFsbCBmYXN0ZXIgdGhhbiB0aGUgdGVubmlzIGJhbGwnLFxuICAgICAgICAgICAgc2FtZTogJ3RoZSB0ZW5uaXMgYmFsbCBhbmQgdGhlIGJvd2xpbmcgYmFsbCB3aWxsIGZhbGwgdGhlIHNhbWUnXG4gICAgICAgIH1baHlwb3RoZXNpc107XG5cbiAgICAgICAgdmFyIGN1cnJlbnRIeXBvdGhlc2lzID0ge1xuICAgICAgICAgICAgdGVubmlzOiAnYSB0ZW5uaXMgYmFsbCBmYWxscyBmYXN0ZXIgdGhhbiBhIGJvd2xpbmcgYmFsbCcsXG4gICAgICAgICAgICBib3dsaW5nOiAnYSBib3dsaW5nIGJhbGwgZmFsbHMgZmFzdGVyIHRoYW4gYSB0ZW5uaXMgYmFsbCcsXG4gICAgICAgICAgICBzYW1lOiAnYSB0ZW5uaXMgYmFsbCBmYWxscyB0aGUgc2FtZSBhcyBhIGJvd2xpbmcgYmFsbCdcbiAgICAgICAgfVtoeXBvdGhlc2lzXTtcblxuICAgICAgICByZXR1cm4gU3RlcChfLmV4dGVuZChwcm9wcywge1xuICAgICAgICAgICAgaWQ6ICdkZXNpZ24tZXhwZXJpbWVudCcsXG4gICAgICAgICAgICB0aXRsZTogJ0Rlc2lnbmluZyB0aGUgRXhwZXJpbWVudCcsXG4gICAgICAgICAgICBvblVwZGF0ZTogZnVuY3Rpb24gKHByZXZQcm9wcykge1xuICAgICAgICAgICAgICAgIGlmIChwcm92ZXIgJiYgaXNDb3JyZWN0ICYmIHByb3ZlciAhPT0gcHJldlByb3BzLmRhdGEucHJvdmVyKSB7XG4gICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvcHMub25OZXh0KClcbiAgICAgICAgICAgICAgICAgICAgfSwgMjAwMCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGJvZHk6IFJlYWN0LkRPTS5kaXYobnVsbCwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLnAobnVsbCwgXCJOb3cgd2UgbmVlZCB0byBkZXNpZ24gYW4gZXhwZXJpbWVudCB0byB0ZXN0IHlvdXJcIiArICcgJyArXG4gICAgICAgICAgICAgICAgXCJoeXBvdGhlc2lzISBJdCdzIGltcG9ydGFudCB0byBiZSBjYXJlZnVsIHdoZW4gZGVzaWduaW5nIGFuXCIgKyAnICcgK1xuICAgICAgICAgICAgICAgIFwiZXhwZXJpbWVudCwgYmVjYXVzZSBvdGhlcndpc2UgeW91IGNvdWxkIGVuZCB1cCBcXFwicHJvdmluZ1xcXCJcIiArICcgJyArXG4gICAgICAgICAgICAgICAgXCJzb21ldGhpbmcgdGhhdCdzIGFjdHVhbGx5IGZhbHNlLlwiKSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLnAobnVsbCwgXCJUbyBwcm92ZSB0aGF0IFwiLCBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcInVsaW5lXCJ9LCBjdXJyZW50SHlwb3RoZXNpcyksIFwiLCB3ZSBjYW4gbWVhc3VyZSB0aGUgdGltZSB0aGF0IGl0XCIgKyAnICcgK1xuICAgICAgICAgICAgICAgIFwidGFrZXMgZm9yIGVhY2ggYmFsbCB0byBmYWxsIHdoZW4gZHJvcHBlZCBmcm9tIGEgc3BlY2lmaWNcIiArICcgJyArXG4gICAgICAgICAgICAgICAgXCJoZWlnaHQuXCIpLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00ucChudWxsLCBcIllvdXIgaHlwb3RoZXNpcyB3aWxsIGJlIHByb3ZlbiBpZiB0aGUgXCIsIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwidWxpbmVcIn0sIFwidGltZSBmb3IgdGhlIFwiLCBmaXJzdEJhbGwsIFwiIGJhbGxcIiksIFwiIGlzXCIsIFxuICAgICAgICAgICAgICAgICAgICBCdXR0b25Hcm91cCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU6IFwiYnRuLWdyb3VwXCIsIFxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWQ6IHByb3ZlciwgXG4gICAgICAgICAgICAgICAgICAgICAgICBvblNlbGVjdDogcHJvcHMuc2V0RGF0YS5iaW5kKG51bGwsICdwcm92ZXInKSwgXG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zOiBbWydsZXNzJywgJ2xlc3MgdGhhbiddLCBbJ21vcmUnLCAnbW9yZSB0aGFuJ10sIFsnc2FtZScsICd0aGUgc2FtZSBhcyddXX0pLCBcbiAgICAgICAgICAgICAgICAgICAgXCJ0aGUgXCIsIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwidWxpbmVcIn0sIFwidGltZSBmb3IgdGhlIFwiLCBzZWNvbmRCYWxsLCBcIiBiYWxsXCIpLCBcIi5cIlxuICAgICAgICAgICAgICAgICksIFxuICAgICAgICAgICAgICAgIHByb3ZlciAmJiBSZWFjdC5ET00ucCh7Y2xhc3NOYW1lOiBcImRlc2lnbl9yZXNwb25zZVwifSwgcHJvdmVyUmVzcG9uc2UpXG4gICAgICAgICAgICApXG4gICAgICAgIH0pKVxuICAgIH0sXG5cbiAgICBmdW5jdGlvbiAocHJvcHMpIHtcbiAgICAgICAgcmV0dXJuIFN0ZXAoXy5leHRlbmQocHJvcHMsIHtcbiAgICAgICAgICAgIGlkOiAnZXhwZXJpbWVudCcsXG4gICAgICAgICAgICBzdHlsZTogJ2JsYWNrJyxcbiAgICAgICAgICAgIHRpdGxlOiAnVGhlIGV4cGVyaW1lbnQnLFxuICAgICAgICAgICAgcG9zOiB7XG4gICAgICAgICAgICAgICAgbGVmdDogMzc1LFxuICAgICAgICAgICAgICAgIHRvcDogMjAwXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYm9keTogUmVhY3QuRE9NLnAobnVsbCwgXCJIZXJlIHdlIGhhdmUgdG9vbHMgdG8gY29uZHVjdCBvdXIgZXhwZXJpbWVudC4gWW91IGNhbiBzZWVcIiArICcgJyArXG4gICAgICAgICAgICBcInNvbWUgYm93bGluZyBiYWxscyBhbmQgdGVubmlzIGJhbGxzLCBhbmQgdGhvc2UgcmVkIGFuZCBncmVlblwiICsgJyAnICtcbiAgICAgICAgICAgIFwic2Vuc29ycyB3aWxsIHJlY29yZCB0aGUgdGltZSBpdCB0YWtlcyBmb3IgYSBiYWxsIHRvIGZhbGwuXCIpLFxuICAgICAgICAgICAgb25SZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBwcm9wcy5FeGVyY2lzZS5kZXBsb3lCYWxscyhmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIERFQlVHID8gcHJvcHMub25OZXh0KCkgOiBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3BzLm9uTmV4dCgpXG4gICAgICAgICAgICAgICAgICAgIH0sIDIwMDApO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pKVxuICAgIH0sXG5cbiAgICBmdW5jdGlvbiAocHJvcHMpIHtcbiAgICAgICAgcmV0dXJuIFN0ZXAoXy5leHRlbmQocHJvcHMsIHtcbiAgICAgICAgICAgIGlkOiAnZHJvcCcsXG4gICAgICAgICAgICBzdHlsZTogJ2JsYWNrJyxcbiAgICAgICAgICAgIHBvczoge1xuICAgICAgICAgICAgICAgIHRvcDogMjAwLFxuICAgICAgICAgICAgICAgIGxlZnQ6IDIwMFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGJvZHk6IFJlYWN0LkRPTS5wKG51bGwsIFwiSWYgd2UgZHJvcCBhIGJhbGwgaGVyZSBhYm92ZSB0aGUgZ3JlZW4gc2Vuc29yLCB3ZSBjYW5cIiArICcgJyArXG4gICAgICAgICAgICAgICAgXCJ0aW1lIGhvdyBsb25nIGl0IHRha2VzIGZvciBpdCB0byBmYWxsIHRvIHRoZSByZWQgc2Vuc29yLlwiKSxcbiAgICAgICAgICAgIG9uUmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcHJvcHMuRXhlcmNpc2UuZGVtb25zdHJhdGVEcm9wKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvcHMub25OZXh0KClcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICB9KSlcbiAgICB9LFxuXG4gICAgZnVuY3Rpb24gKHByb3BzKSB7XG4gICAgICAgIHJldHVybiBTdGVwKF8uZXh0ZW5kKHByb3BzLCB7XG4gICAgICAgICAgICBpZDogJ2xvZ2Jvb2snLFxuICAgICAgICAgICAgc3R5bGU6ICdibGFjaycsXG4gICAgICAgICAgICBwb3M6IHtcbiAgICAgICAgICAgICAgICB0b3A6IDEwMCxcbiAgICAgICAgICAgICAgICBsZWZ0OiA1MDBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBhcnJvdzogUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImFycm93LXRvLWxvZ2Jvb2tcIn0pLFxuICAgICAgICAgICAgYm9keTogUmVhY3QuRE9NLnAobnVsbCwgXCJUaGUgdGltZSBpcyB0aGVuIHJlY29yZGVkIG92ZXIgaGVyZSBpbiB5b3VyIGxvZyBib29rLiBGaWxsIHVwIHRoaXMgbG9nIGJvb2sgd2l0aCB0aW1lcyBmb3IgYm90aCBiYWxscyBhbmQgY29tcGFyZSB0aGVtLlwiKSxcbiAgICAgICAgICAgIG9uUmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHByb3BzLm9uTmV4dCgpO1xuICAgICAgICAgICAgICAgIH0sIERFQlVHID8gMTAwIDogNTAwMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pKTtcbiAgICB9LFxuXG4gICAgZnVuY3Rpb24gKHByb3BzKSB7XG4gICAgICAgIHJldHVybiBTdGVwKF8uZXh0ZW5kKHByb3BzLCB7XG4gICAgICAgICAgICBpZDogJ2Fuc3dlcicsXG4gICAgICAgICAgICBzdHlsZTogJ2JsYWNrJyxcbiAgICAgICAgICAgIHBvczoge1xuICAgICAgICAgICAgICAgIHRvcDogMTUwLFxuICAgICAgICAgICAgICAgIGxlZnQ6IDI1MFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGFycm93OiBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwiYXJyb3ctdG8tYW5zd2VyXCJ9KSxcbiAgICAgICAgICAgIHNob3dCYWNvbjogdHJ1ZSxcbiAgICAgICAgICAgIHRpdGxlOiBcIk5vdyBjb25kdWN0IHRoZSBleHBlcmltZW50IHRvIHRlc3QgeW91ciBoeXBvdGhlc2lzIVwiLFxuICAgICAgICAgICAgYm9keTogUmVhY3QuRE9NLnAobnVsbCwgXCJPbmNlIHlvdSd2ZSBjb2xsZWN0ZWQgZW5vdWdoIGRhdGEgaW4geW91ciBsb2cgYm9vayxcIiArICcgJyArXG4gICAgICAgICAgICBcImRlY2lkZSB3aGV0aGVyIHRoZSBkYXRhIFwiLCBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcInVsaW5lXCJ9LCBcInN1cHBvcnRcIiksIFwiIG9yXCIsIFxuICAgICAgICAgICAgJyAnLCBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcInVsaW5lXCJ9LCBcImRpc3Byb3ZlXCIpLCBcIiB5b3VyIGh5cG90aGVzaXMuIFRoZW5cIiArICcgJyArXG4gICAgICAgICAgICBcIkkgd2lsbCBldmFsdWF0ZSB5b3VyIGV4cGVyaW1lbnQgYW5kIGdpdmUgeW91IGZlZWRiYWNrLlwiKSxcbiAgICAgICAgICAgIG5leHQ6IFwiT2ssIEknbSByZWFkeVwiLFxuICAgICAgICB9KSlcbiAgICB9LFxuXVxuXG4iLCIvKiogQGpzeCBSZWFjdC5ET00gKi9cblxudmFyIFBUID0gUmVhY3QuUHJvcFR5cGVzXG52YXIgY3ggPSBSZWFjdC5hZGRvbnMuY2xhc3NTZXRcblxudmFyIFN0ZXAgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdTdGVwJyxcbiAgICBwcm9wVHlwZXM6IHtcbiAgICAgICAgdGl0bGU6IFBULnN0cmluZyxcbiAgICAgICAgbmV4dDogUFQuc3RyaW5nLFxuICAgICAgICBvblJlbmRlcjogUFQuZnVuYyxcbiAgICAgICAgb25GYWRlZE91dDogUFQuZnVuYyxcbiAgICAgICAgc2hvd0JhY29uOiBQVC5ib29sLFxuICAgICAgICBmYWRlT3V0OiBQVC5ib29sLFxuICAgIH0sXG5cbiAgICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHN0eWxlOiAnd2hpdGUnXG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMub25SZW5kZXIpIHtcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25SZW5kZXIoKVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuZ2V0RE9NTm9kZSgpLmFkZEV2ZW50TGlzdGVuZXIoJ3RyYW5zaXRpb25lbmQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5mYWRlT3V0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkZhZGVkT3V0KClcbiAgICAgICAgICAgIH1cbiAgICAgICAgfS5iaW5kKHRoaXMpKVxuICAgIH0sXG5cbiAgICBjb21wb25lbnREaWRVcGRhdGU6IGZ1bmN0aW9uIChwcmV2UHJvcHMpIHtcbiAgICAgICAgaWYgKHByZXZQcm9wcy5pZCAhPT0gdGhpcy5wcm9wcy5pZCAmJlxuICAgICAgICAgICAgdGhpcy5wcm9wcy5vblJlbmRlcikge1xuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMub25SZW5kZXIoKVxuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnByb3BzLm9uVXBkYXRlKSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uVXBkYXRlLmNhbGwodGhpcywgcHJldlByb3BzKVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgc3R5bGVcbiAgICAgICAgaWYgKHRoaXMucHJvcHMucG9zKSB7XG4gICAgICAgICAgICBzdHlsZSA9IHtcbiAgICAgICAgICAgICAgICBtYXJnaW5Ub3A6IDAsXG4gICAgICAgICAgICAgICAgbWFyZ2luTGVmdDogMCxcbiAgICAgICAgICAgICAgICB0b3A6IHRoaXMucHJvcHMucG9zLnRvcCArICdweCcsXG4gICAgICAgICAgICAgICAgbGVmdDogdGhpcy5wcm9wcy5wb3MubGVmdCArICdweCdcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBjeCh7XG4gICAgICAgICAgICBcIndhbGt0aHJvdWdoXCI6IHRydWUsXG4gICAgICAgICAgICBcIndhbGt0aHJvdWdoLS13aGl0ZVwiOiB0aGlzLnByb3BzLnN0eWxlID09PSAnd2hpdGUnLFxuICAgICAgICAgICAgXCJ3YWxrdGhyb3VnaC0tYmxhY2tcIjogdGhpcy5wcm9wcy5zdHlsZSA9PT0gJ2JsYWNrJ1xuICAgICAgICB9KX0sIFxuICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBjeCh7XG4gICAgICAgICAgICAgICAgXCJ3YWxrdGhyb3VnaF9zdGVwXCI6IHRydWUsXG4gICAgICAgICAgICAgICAgXCJ3YWxrdGhyb3VnaF9zdGVwLS1mYWRlLW91dFwiOiB0aGlzLnByb3BzLmZhZGVPdXRcbiAgICAgICAgICAgIH0pICsgXCIgd2Fsa3Rocm91Z2hfc3RlcC0tXCIgKyB0aGlzLnByb3BzLmlkLCBzdHlsZTogc3R5bGV9LCBcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLnNob3dCYWNvbiAmJiBSZWFjdC5ET00uaW1nKHtjbGFzc05hbWU6IFwid2Fsa3Rocm91Z2hfc2lyLWZyYW5jaXNcIiwgc3JjOiBcImltYWdlcy9zaXItZnJhbmNpcy10cmFuc3BhcmVudDIuZ2lmXCJ9KSwgXG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy50aXRsZSAmJlxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwid2Fsa3Rocm91Z2hfdGl0bGVcIn0sIHRoaXMucHJvcHMudGl0bGUpLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwid2Fsa3Rocm91Z2hfYm9keVwifSwgXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMuYm9keVxuICAgICAgICAgICAgICAgICksIFxuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMuYXJyb3cgfHwgZmFsc2UsIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJ3YWxrdGhyb3VnaF9idXR0b25zXCJ9LCBcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5uZXh0ICYmXG4gICAgICAgICAgICAgICAgICAgICAgICBSZWFjdC5ET00uYnV0dG9uKHtvbkNsaWNrOiB0aGlzLnByb3BzLm9uTmV4dCwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiBcIndhbGt0aHJvdWdoX25leHQgYnRuIGJ0bi1kZWZhdWx0XCJ9LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm5leHRcbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApXG4gICAgICAgIClcbiAgICB9XG59KVxuXG5tb2R1bGUuZXhwb3J0cyA9IFN0ZXBcbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xuXG52YXIgV2Fsa1Rocm91Z2ggPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdXYWxrVGhyb3VnaCcsXG4gICAgcHJvcFR5cGVzOiB7XG4gICAgICAgIHN0ZXBzOiBSZWFjdC5Qcm9wVHlwZXMuYXJyYXkuaXNSZXF1aXJlZCxcbiAgICAgICAgb25Eb25lOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYyxcbiAgICB9LFxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc3RlcDogMCxcbiAgICAgICAgICAgIGRhdGE6IHt9LFxuICAgICAgICAgICAgZmFkaW5nOiBmYWxzZVxuICAgICAgICB9XG4gICAgfSxcbiAgICBvbkZhZGVkT3V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmZhZGluZyA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIHRoaXMuZ29Ubyh0aGlzLnN0YXRlLmZhZGluZylcbiAgICB9LFxuICAgIGdvVG86IGZ1bmN0aW9uIChudW0pIHtcbiAgICAgICAgaWYgKG51bSA+PSB0aGlzLnByb3BzLnN0ZXBzLmxlbmd0aCkge1xuICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMub25Eb25lKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkRvbmUoKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7c3RlcDogbnVtLCBmYWRpbmc6IGZhbHNlfSlcbiAgICB9LFxuICAgIHN0YXJ0R29pbmc6IGZ1bmN0aW9uIChudW0pIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7ZmFkaW5nOiBudW19KVxuICAgIH0sXG4gICAgc2V0RGF0YTogZnVuY3Rpb24gKGF0dHIsIHZhbCkge1xuICAgICAgICB2YXIgZGF0YSA9IF8uZXh0ZW5kKHt9LCB0aGlzLnN0YXRlLmRhdGEpXG4gICAgICAgIGRhdGFbYXR0cl0gPSB2YWxcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7ZGF0YTogZGF0YX0pXG4gICAgfSxcbiAgICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIFN0ZXAgPSB0aGlzLnByb3BzLnN0ZXBzW3RoaXMuc3RhdGUuc3RlcF1cbiAgICAgICAgdmFyIHByb3BzID0ge1xuICAgICAgICAgICAgb25OZXh0OiB0aGlzLnN0YXJ0R29pbmcuYmluZChudWxsLCB0aGlzLnN0YXRlLnN0ZXAgKyAxKSxcbiAgICAgICAgICAgIHNldERhdGE6IHRoaXMuc2V0RGF0YSxcbiAgICAgICAgICAgIGRhdGE6IHRoaXMuc3RhdGUuZGF0YSxcbiAgICAgICAgICAgIGZhZGVPdXQ6IHRoaXMuc3RhdGUuZmFkaW5nICE9PSBmYWxzZSxcbiAgICAgICAgICAgIG9uRmFkZWRPdXQ6IHRoaXMub25GYWRlZE91dFxuICAgICAgICB9XG4gICAgICAgIGZvciAodmFyIG5hbWUgaW4gdGhpcy5wcm9wcykge1xuICAgICAgICAgICAgcHJvcHNbbmFtZV0gPSB0aGlzLnByb3BzW25hbWVdXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFN0ZXAocHJvcHMpXG4gICAgfVxufSlcblxubW9kdWxlLmV4cG9ydHMgPSBXYWxrVGhyb3VnaFxuXG4iLCJcbnZhciB1dGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gTG9nQm9vaztcblxuZnVuY3Rpb24gTG9nQm9vayh3b3JsZCwgc3RhcnRHYXRlLCBlbmRHYXRlLCBlbGVtLCBrZWVwLCBzZWVkZWRDb2x1bW5zKSB7XG4gICAgdGhpcy5fYXR0YWNoKHdvcmxkLCBzdGFydEdhdGUsIGVuZEdhdGUsIGVsZW0sIGtlZXAsIHNlZWRlZENvbHVtbnMpO1xufVxuXG5Mb2dCb29rLnByb3RvdHlwZS5fYXR0YWNoID0gZnVuY3Rpb24gKHdvcmxkLCBzdGFydEdhdGUsIGVuZEdhdGUsIGVsZW0sIGtlZXAsIHNlZWRlZENvbHVtbnMpIHtcbiAgICBjb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIGNvbnRhaW5lci5jbGFzc05hbWUgPSBcImxvZy1ib29rXCI7XG4gICAgZWxlbS5hcHBlbmRDaGlsZChjb250YWluZXIpO1xuICAgIGhlYWRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpO1xuICAgIGhlYWRlci5jbGFzc05hbWUgPSBcImxvZy1ib29rLWhlYWRlclwiO1xuICAgIGhlYWRlci5pbm5lckhUTUwgPSBcIkxvZyBCb29rXCI7XG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGhlYWRlcik7XG4gICAgYm9keUNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgYm9keUNvbnRhaW5lci5jbGFzc05hbWUgPSBcImxvZy1ib29rLWJvZHlcIjtcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoYm9keUNvbnRhaW5lcik7XG4gICAgdGhpcy5ib2R5Q29udGFpbmVyID0gYm9keUNvbnRhaW5lcjtcblxuICAgIHRoaXMuY29sdW1uc0J5Qm9keU5hbWUgPSB7fTtcbiAgICB0aGlzLmxhc3RVaWRzID0ge307XG4gICAgdGhpcy5zdGFydFRpbWVCeUJvZHlOYW1lID0ge307XG4gICAgdGhpcy5kYXRhID0ge307XG4gICAgdGhpcy5rZWVwID0ga2VlcDtcbiAgICB0aGlzLndvcmxkID0gd29ybGQ7XG4gICAgc3RhcnRHYXRlLm9uKCdlbnRlcicsIHRoaXMuaGFuZGxlU3RhcnQuYmluZCh0aGlzKSk7XG4gICAgZW5kR2F0ZS5vbignZW50ZXInLCB0aGlzLmhhbmRsZUVuZC5iaW5kKHRoaXMpKTtcbiAgICB3b3JsZC5vbignc3RlcCcsIHRoaXMuaGFuZGxlVGljay5iaW5kKHRoaXMpKTtcblxuICAgIGlmIChzZWVkZWRDb2x1bW5zKSB7XG4gICAgICAgIF8uZWFjaChzZWVkZWRDb2x1bW5zLCBmdW5jdGlvbiAoY29sKSB7XG4gICAgICAgICAgICB0aGlzLmFkZENvbHVtbihjb2wubmFtZSwgY29sLmV4dHJhVGV4dCwgY29sLmNvbG9yKTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5rZWVwOyBpKyspIHtcbiAgICAgICAgICAgICAgICB0aGlzLm5ld1RpbWVyKGNvbC5uYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9XG59XG5cbkxvZ0Jvb2sucHJvdG90eXBlLmhhbmRsZVN0YXJ0ID0gZnVuY3Rpb24gKGRhdGEpIHtcbiAgICBpZiAoIXRoaXMuc3RhcnRUaW1lQnlCb2R5TmFtZVtnZXROYW1lKGRhdGEuYm9keSldKSB0aGlzLm5ld1RpbWVyKGdldE5hbWUoZGF0YS5ib2R5KSk7XG4gICAgdGhpcy5sYXN0VWlkc1tnZXROYW1lKGRhdGEuYm9keSldID0gZGF0YS5ib2R5LnVpZDtcbiAgICB0aGlzLnN0YXJ0VGltZUJ5Qm9keU5hbWVbZ2V0TmFtZShkYXRhLmJvZHkpXSA9IHRoaXMud29ybGQuX3RpbWU7XG4gICAgdGhpcy5yZW5kZXJUaW1lcihnZXROYW1lKGRhdGEuYm9keSksIDApO1xufVxuXG5Mb2dCb29rLnByb3RvdHlwZS5oYW5kbGVFbmQgPSBmdW5jdGlvbiAoZGF0YSkge1xuICAgIGlmIChnZXROYW1lKGRhdGEuYm9keSkgaW4gdGhpcy5kYXRhICYmIHRoaXMubGFzdFVpZHNbZ2V0TmFtZShkYXRhLmJvZHkpXSA9PSBkYXRhLmJvZHkudWlkKSB7XG4gICAgICAgIHRoaXMuZGF0YVtnZXROYW1lKGRhdGEuYm9keSldLnB1c2goXG4gICAgICAgICAgICB0aGlzLndvcmxkLl90aW1lIC0gdGhpcy5zdGFydFRpbWVCeUJvZHlOYW1lW2dldE5hbWUoZGF0YS5ib2R5KV0pO1xuICAgICAgICBkZWxldGUgdGhpcy5zdGFydFRpbWVCeUJvZHlOYW1lW2dldE5hbWUoZGF0YS5ib2R5KV07XG4gICAgICAgIGRlbGV0ZSB0aGlzLmxhc3RVaWRzW2dldE5hbWUoZGF0YS5ib2R5KV07XG4gICAgICAgIHZhciBuYW1lID0gZ2V0TmFtZShkYXRhLmJvZHkpXG4gICAgICAgIHZhciBhdmcgPSBjbGVhbih1dGlsLmF2Zyh0aGlzLmRhdGFbbmFtZV0pKTtcbiAgICAgICAgJCh0aGlzLmNvbHVtbnNCeUJvZHlOYW1lW25hbWVdKS5maW5kKCcubG9nLWJvb2stYXZnJykudGV4dCgnQXZnOiAnICsgYXZnKTtcbiAgICB9XG59XG5cbkxvZ0Jvb2sucHJvdG90eXBlLmhhbmRsZVRpY2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgbmV3VGltZSA9IHRoaXMud29ybGQuX3RpbWU7XG4gICAgJC5lYWNoKHRoaXMuc3RhcnRUaW1lQnlCb2R5TmFtZSwgZnVuY3Rpb24gKG5hbWUsIHN0YXJ0VGltZSkge1xuICAgICAgICB0aGlzLnJlbmRlclRpbWVyKG5hbWUsIG5ld1RpbWUgLSBzdGFydFRpbWUpO1xuICAgIH0uYmluZCh0aGlzKSk7XG59XG5cbkxvZ0Jvb2sucHJvdG90eXBlLmFkZENvbHVtbiA9IGZ1bmN0aW9uIChuYW1lLCBleHRyYVRleHQsIGNvbG9yKSB7XG4gICAgdmFyIGNvbHVtbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgY29sdW1uLmNsYXNzTmFtZSA9IFwibG9nLWJvb2stY29sdW1uXCI7XG4gICAgdmFyIGhlYWRpbmcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKTtcbiAgICBoZWFkaW5nLmNsYXNzTmFtZSA9IFwibG9nLWJvb2staGVhZGluZ1wiO1xuICAgIGhlYWRpbmcuaW5uZXJIVE1MID0gbmFtZSArIGV4dHJhVGV4dDtcbiAgICAvKiogRGlzYWJsaW5nIHVudGlsIHdlIGZpbmQgc29tZXRoaW5nIHRoYXQgbG9va3MgZ3JlYXRcbiAgICBpZiAoY29sb3IpIHtcbiAgICAgICAgaGVhZGluZy5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBjb2xvcjtcbiAgICB9XG4gICAgKi9cbiAgICBjb2x1bW4uYXBwZW5kQ2hpbGQoaGVhZGluZyk7XG4gICAgdmFyIGF2ZXJhZ2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIGF2ZXJhZ2UuY2xhc3NOYW1lID0gJ2xvZy1ib29rLWF2Zyc7XG4gICAgYXZlcmFnZS5pbm5lckhUTUwgPSAnLS0nO1xuICAgIGNvbHVtbi5hcHBlbmRDaGlsZChhdmVyYWdlKTtcbiAgICB0aGlzLmJvZHlDb250YWluZXIuYXBwZW5kQ2hpbGQoY29sdW1uKTtcbiAgICB0aGlzLmNvbHVtbnNCeUJvZHlOYW1lW25hbWVdID0gY29sdW1uO1xuICAgIHRoaXMuZGF0YVtuYW1lXSA9IFtdO1xufVxuXG5Mb2dCb29rLnByb3RvdHlwZS5uZXdUaW1lciA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgLy8ganVzdCBkb2VzIHRoZSBET00gc2V0dXAsIGRvZXNuJ3QgYWN0dWFsbHkgc3RhcnQgdGhlIHRpbWVyXG4gICAgaWYgKCF0aGlzLmNvbHVtbnNCeUJvZHlOYW1lW25hbWVdKSB0aGlzLmFkZENvbHVtbihuYW1lKTtcbiAgICB2YXIgY29sID0gdGhpcy5jb2x1bW5zQnlCb2R5TmFtZVtuYW1lXTtcbiAgICB2YXIgdG9SZW1vdmUgPSAkKGNvbCkuZmluZChcIi5sb2ctYm9vay1kYXR1bVwiKS5zbGljZSgwLC10aGlzLmtlZXArMSk7XG4gICAgdG9SZW1vdmUuc2xpZGVVcCg1MDAsIGZ1bmN0aW9uICgpIHt0b1JlbW92ZS5yZW1vdmUoKTt9KTtcbiAgICB0aGlzLmRhdGFbbmFtZV0gPSB0aGlzLmRhdGFbbmFtZV0uc2xpY2UoLXRoaXMua2VlcCsxKTtcbiAgICBkYXR1bSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpO1xuICAgIGRhdHVtLmNsYXNzTmFtZSA9IFwibG9nLWJvb2stZGF0dW1cIjtcblxuICAgIHZhciBhdmcgPSBjbGVhbih1dGlsLmF2Zyh0aGlzLmRhdGFbbmFtZV0pKTtcbiAgICAkKGNvbCkuZmluZCgnLmxvZy1ib29rLWF2ZycpLnRleHQoJ0F2ZzogJyArIGF2Zyk7XG5cbiAgICBjb2wuYXBwZW5kQ2hpbGQoZGF0dW0pO1xuICAgIHRoaXMucmVuZGVyVGltZXIobmFtZSk7XG59XG5cbmZ1bmN0aW9uIGNsZWFuKHRpbWUpIHtcbiAgICByZXR1cm4gcGFyc2VGbG9hdCh0aW1lIC8gMTAwMCkudG9GaXhlZCgyKSArICdzJztcbn1cblxuTG9nQm9vay5wcm90b3R5cGUucmVuZGVyVGltZXIgPSBmdW5jdGlvbiAobmFtZSwgdGltZSkge1xuICAgIHZhciBkYXR1bSA9IHRoaXMuY29sdW1uc0J5Qm9keU5hbWVbbmFtZV0ubGFzdENoaWxkO1xuICAgIGlmICh0aW1lKSB7XG4gICAgICAgIGRhdHVtLmlubmVySFRNTCA9IGNsZWFuKHRpbWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGRhdHVtLmlubmVySFRNTCA9IFwiLS1cIjtcbiAgICAgICAgZGF0dW0uc3R5bGUudGV4dEFsaWduID0gXCJjZW50ZXJcIjtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGdldE5hbWUoYm9keSkge1xuICAgIHJldHVybiBib2R5LmRpc3BsYXlOYW1lIHx8IGJvZHkubmFtZSB8fCBcImJvZHlcIjtcbn1cblxuIiwidmFyIEdhdGUgPSByZXF1aXJlKCcuL2dhdGUnKTtcbnZhciBHcmFwaCA9IHJlcXVpcmUoJy4vZ3JhcGgnKTtcbnZhciBCYXNlID0gcmVxdWlyZSgnLi9iYXNlJyk7XG52YXIgU3RvcHdhdGNoID0gcmVxdWlyZSgnLi9zdG9wd2F0Y2gnKTtcbnZhciBQbGF5UGF1c2UgPSByZXF1aXJlKCcuL3BsYXlwYXVzZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2UuZXh0ZW5kKGZ1bmN0aW9uIE9yYml0KGNvbnRhaW5lciwgb3B0aW9ucykge1xuICAgIEJhc2UuY2FsbCh0aGlzLCBjb250YWluZXIsIG9wdGlvbnMsIFwiaW1hZ2VzL3NwYWNlX2JhY2tncm91bmQuanBnXCIpXG59LCB7XG4gICAgc2V0dXA6IGZ1bmN0aW9uIChjb250YWluZXIpIHtcbiAgICAgICAgdmFyIHdvcmxkID0gdGhpcy53b3JsZDtcbiAgICAgICAgdmFyIGQgPSA0LjA7XG4gICAgICAgIHZhciB2ID0gMC4zNjtcbiAgICAgICAgdmFyIGNpcmNsZTEgPSBQaHlzaWNzLmJvZHkoJ2NpcmNsZScsIHtcbiAgICAgICAgICAgIHg6IHRoaXMub3B0aW9ucy53aWR0aCAvIDIgLSBkLzJcbiAgICAgICAgICAgICx5OiAyMDBcbiAgICAgICAgICAgICx2eDogdlxuICAgICAgICAgICAgLHJhZGl1czogMlxuICAgICAgICAgICAgLG1hc3M6IDFcbiAgICAgICAgICAgICxyZXN0aXR1dGlvbjogMFxuICAgICAgICAgICAgLHN0eWxlczoge1xuICAgICAgICAgICAgICAgIGZpbGxTdHlsZTogJyNlZWRkMjInXG4gICAgICAgICAgICAgICAgLGFuZ2xlSW5kaWNhdG9yOiAnIzE1NTQ3OSdcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHZhciBjaXJjbGUyID0gUGh5c2ljcy5ib2R5KCdjaXJjbGUnLCB7XG4gICAgICAgICAgICB4OiB0aGlzLm9wdGlvbnMud2lkdGggLyAyICsgZC8yXG4gICAgICAgICAgICAseTogMjAwXG4gICAgICAgICAgICAsdng6IHZcbiAgICAgICAgICAgICxyYWRpdXM6IDJcbiAgICAgICAgICAgICxtYXNzOiAxXG4gICAgICAgICAgICAscmVzdGl0dXRpb246IDBcbiAgICAgICAgICAgICxzdHlsZXM6IHtcbiAgICAgICAgICAgICAgICBmaWxsU3R5bGU6ICcjZWVkZDIyJ1xuICAgICAgICAgICAgICAgICxhbmdsZUluZGljYXRvcjogJyMxNTU0NzknXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBiaWcgPSBQaHlzaWNzLmJvZHkoJ2NpcmNsZScsIHtcbiAgICAgICAgICAgIHg6IHRoaXMub3B0aW9ucy53aWR0aCAvIDJcbiAgICAgICAgICAgICx5OiAzMDBcbiAgICAgICAgICAgICx2eDogLTIgKiB2LzI1XG4gICAgICAgICAgICAscmFkaXVzOiAxMFxuICAgICAgICAgICAgLG1hc3M6IDI1XG4gICAgICAgICAgICAscmVzdGl0dXRpb246IDBcbiAgICAgICAgICAgICxzdHlsZXM6IHtcbiAgICAgICAgICAgICAgICBmaWxsU3R5bGU6ICcjZWVkZDIyJ1xuICAgICAgICAgICAgICAgICxhbmdsZUluZGljYXRvcjogJyMxNTU0NzknXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICB2YXIgY29uc3RyYWludHMgPSBQaHlzaWNzLmJlaGF2aW9yKCd2ZXJsZXQtY29uc3RyYWludHMnKTtcbiAgICAgICAgY29uc3RyYWludHMuZGlzdGFuY2VDb25zdHJhaW50KGNpcmNsZTEsIGNpcmNsZTIsIDEpO1xuICAgICAgICB3b3JsZC5hZGQoW2NpcmNsZTEsIGNpcmNsZTIsIGJpZywgY29uc3RyYWludHNdKTtcbiAgICAgICAgd29ybGQuYWRkKFBoeXNpY3MuYmVoYXZpb3IoJ25ld3RvbmlhbicsIHsgc3RyZW5ndGg6IC41IH0pKTtcblxuICAgICAgICB2YXIgbW9vblJvdGF0aW9uID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGR4ID0gY2lyY2xlMS5zdGF0ZS5wb3MueCAtIGNpcmNsZTIuc3RhdGUucG9zLng7XG4gICAgICAgICAgICB2YXIgZHkgPSBjaXJjbGUyLnN0YXRlLnBvcy55IC0gY2lyY2xlMS5zdGF0ZS5wb3MueTtcbiAgICAgICAgICAgIHJldHVybiBNYXRoLmF0YW4yKGR5LGR4KTtcbiAgICAgICAgfTtcblxuICAgICAgICB2YXIgbW9vblJldm9sdXRpb24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgZHggPSAoY2lyY2xlMS5zdGF0ZS5wb3MueCArIGNpcmNsZTIuc3RhdGUucG9zLngpLzIgLSBiaWcuc3RhdGUucG9zLng7XG4gICAgICAgICAgICB2YXIgZHkgPSBiaWcuc3RhdGUucG9zLnkgLSAoY2lyY2xlMi5zdGF0ZS5wb3MueSArIGNpcmNsZTEuc3RhdGUucG9zLnkpLzI7XG4gICAgICAgICAgICByZXR1cm4gTWF0aC5hdGFuMihkeSxkeCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdmFyIGdyYXBoID0gbmV3IEdyYXBoKHRoaXMuY29udGFpbmVyLCB7XG4gICAgICAgICAgICAnUm90Jzoge2ZuOiBtb29uUm90YXRpb24sIHRpdGxlOiAnUm90YXRpb24nLCBtaW5zY2FsZTogMiAqIE1hdGguUEl9LFxuICAgICAgICAgICAgJ1Jldic6IHtmbjogbW9vblJldm9sdXRpb24sIHRpdGxlOiAnUmV2b2x1dGlvbicsIG1pbnNjYWxlOiAyICogTWF0aC5QSX0sXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIG1heDogMjAwMCxcbiAgICAgICAgICAgIHRvcDogMTAsXG4gICAgICAgICAgICBsZWZ0OiB0aGlzLm9wdGlvbnMud2lkdGgsXG4gICAgICAgICAgICB3aWR0aDogMzAwLFxuICAgICAgICAgICAgd29ybGRIZWlnaHQ6IHRoaXMub3B0aW9ucy5oZWlnaHQsXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmdyYXBoID0gZ3JhcGg7XG5cbiAgICAgICAgdGhpcy53b3JsZC5vbignc3RlcCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGdyYXBoLnVwZGF0ZSh3b3JsZC50aW1lc3RlcCgpKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdmFyIGJ1dHRvbkNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChidXR0b25Db250YWluZXIpO1xuICAgICAgICB2YXIgcGxheVBhdXNlID0gbmV3IFBsYXlQYXVzZSh3b3JsZCwgYnV0dG9uQ29udGFpbmVyKTtcbiAgICB9XG59KTtcblxuICAgICAgICBcbiIsInZhciBHYXRlID0gcmVxdWlyZSgnLi9nYXRlJyk7XG52YXIgQmFzZSA9IHJlcXVpcmUoJy4vYmFzZScpO1xudmFyIFN0b3B3YXRjaCA9IHJlcXVpcmUoJy4vc3RvcHdhdGNoJyk7XG52YXIgUGxheVBhdXNlID0gcmVxdWlyZSgnLi9wbGF5cGF1c2UnKTtcblxuZnVuY3Rpb24gcmFuZG9tKG1pbiwgbWF4KXtcbiAgICByZXR1cm4gKE1hdGgucmFuZG9tKCkgKiAobWF4LW1pbikgKyBtaW4pfDBcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBCYXNlLmV4dGVuZChmdW5jdGlvbiBBc3Rlcm9pZHMoY29udGFpbmVyLCBvcHRpb25zKSB7XG4gICAgQmFzZS5jYWxsKHRoaXMsIGNvbnRhaW5lciwgb3B0aW9ucywgJ2ltYWdlcy9zcGFjZV9iYWNrZ3JvdW5kLmpwZycsXG4gICAgICAgIHRydWUgLyogZGlzYWJsZUJvdW5kcyAqLylcbn0sIHtcbiAgICBzZXR1cDogZnVuY3Rpb24gKGNvbnRhaW5lcikge1xuICAgICAgICB2YXIgd29ybGQgPSB0aGlzLndvcmxkO1xuICAgICAgICB0aGlzLmhhbmRsZU5ld0FzdGVyb2lkKCk7XG4gICAgICAgIHZhciBwbGF5UGF1c2VDb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQocGxheVBhdXNlQ29udGFpbmVyKTtcbiAgICAgICAgdmFyIHBsYXlQYXVzZSA9IG5ldyBQbGF5UGF1c2Uod29ybGQsIHBsYXlQYXVzZUNvbnRhaW5lcik7XG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzLmNyZWF0ZU5ld0FzdGVyb2lkTGluaygpKVxuICAgIH0sXG5cbiAgICBjcmVhdGVOZXdBc3Rlcm9pZExpbms6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgbmV3QXN0ZXJvaWRMaW5rID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImFcIik7XG4gICAgICAgIG5ld0FzdGVyb2lkTGluay5ocmVmID0gXCIjXCI7XG4gICAgICAgIG5ld0FzdGVyb2lkTGluay5pbm5lckhUTUwgPSBcIk5ldyBhc3Rlcm9pZFwiO1xuICAgICAgICBuZXdBc3Rlcm9pZExpbmsuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgdGhpcy5oYW5kbGVOZXdBc3Rlcm9pZCgpO1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgcmV0dXJuIG5ld0FzdGVyb2lkTGluaztcbiAgICB9LFxuXG4gICAgaGFuZGxlTmV3QXN0ZXJvaWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgd29ybGQgPSB0aGlzLndvcmxkO1xuXG4gICAgICAgIHZhciBtaW5YID0gMTAwO1xuICAgICAgICB2YXIgbWF4WCA9IDQwMDtcbiAgICAgICAgdmFyIG1pblkgPSAxMDA7XG4gICAgICAgIHZhciBtYXhZID0gNDAwO1xuICAgICAgICB2YXIgbWluQW5nbGUgPSAwO1xuICAgICAgICB2YXIgbWF4QW5nbGUgPSAyKk1hdGguUEk7XG5cbiAgICAgICAgd29ybGQuYWRkKFBoeXNpY3MuYm9keSgnY2lyY2xlJywge1xuICAgICAgICAgICAgeDogcmFuZG9tKG1pblgsIG1heFgpLFxuICAgICAgICAgICAgeTogcmFuZG9tKG1pblksIG1heFkpLFxuICAgICAgICAgICAgcmFkaXVzOiA1MCxcbiAgICAgICAgICAgIGFuZ2xlOiByYW5kb20obWluQW5nbGUsIG1heEFuZ2xlKSxcbiAgICAgICAgICAgIG1hc3M6IDEwMDAsXG4gICAgICAgICAgICByZXN0aXR1dGlvbjogMCxcbiAgICAgICAgICAgIHN0eWxlczoge1xuICAgICAgICAgICAgICAgIGltYWdlOiAnaW1hZ2VzL2FzdGVyb2lkLnBuZycsXG4gICAgICAgICAgICAgICAgZmlsbFN0eWxlOiAnI2ZmY2MwMCdcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkpO1xuICAgIH1cbn0pO1xuXG4gICAgICAgIFxuIiwidmFyIEdhdGUgPSByZXF1aXJlKCcuL2dhdGUnKTtcbnZhciBCYXNlID0gcmVxdWlyZSgnLi9iYXNlJyk7XG52YXIgU3RvcHdhdGNoID0gcmVxdWlyZSgnLi9zdG9wd2F0Y2gnKTtcbnZhciBQbGF5UGF1c2UgPSByZXF1aXJlKCcuL3BsYXlwYXVzZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2UuZXh0ZW5kKGZ1bmN0aW9uIE9yYml0KGNvbnRhaW5lciwgb3B0aW9ucykge1xuICAgIEJhc2UuY2FsbCh0aGlzLCBjb250YWluZXIsIG9wdGlvbnMsIFwiaW1hZ2VzL3NwYWNlX2JhY2tncm91bmQuanBnXCIpXG59LCB7XG4gICAgc2V0dXA6IGZ1bmN0aW9uIChjb250YWluZXIpIHtcbiAgICAgICAgdmFyIHdvcmxkID0gdGhpcy53b3JsZDtcbiAgICAgICAgdmFyIHJlZEJhbGwgPSBQaHlzaWNzLmJvZHkoJ2NpcmNsZScsIHtcbiAgICAgICAgICAgIHg6IHRoaXMub3B0aW9ucy53aWR0aCAvIDJcbiAgICAgICAgICAgICx5OiA0MFxuICAgICAgICAgICAgLHZ4OiAwXG4gICAgICAgICAgICAsdnk6IC0xLzhcbiAgICAgICAgICAgICxyYWRpdXM6IDRcbiAgICAgICAgICAgICxtYXNzOiA0XG4gICAgICAgICAgICAscmVzdGl0dXRpb246IDBcbiAgICAgICAgICAgICxzdHlsZXM6IHtcbiAgICAgICAgICAgICAgICBmaWxsU3R5bGU6ICcjZDY4YjYyJyAvL3JlZFxuICAgICAgICAgICAgICAgICxhbmdsZUluZGljYXRvcjogJyMxNTU0NzknXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICB2YXIgZ3JlZW5CYWxsID0gUGh5c2ljcy5ib2R5KCdjaXJjbGUnLCB7XG4gICAgICAgICAgICB4OiB0aGlzLm9wdGlvbnMud2lkdGggLyAyXG4gICAgICAgICAgICAseTogNjBcbiAgICAgICAgICAgICx2eDogMy84XG4gICAgICAgICAgICAsdnk6IDEvOFxuICAgICAgICAgICAgLHJhZGl1czogNFxuICAgICAgICAgICAgLG1hc3M6IDRcbiAgICAgICAgICAgICxyZXN0aXR1dGlvbjogMFxuICAgICAgICAgICAgLHN0eWxlczoge1xuICAgICAgICAgICAgICAgIGZpbGxTdHlsZTogJyMyNmViNjInIC8vZ3JlZW5cbiAgICAgICAgICAgICAgICAsYW5nbGVJbmRpY2F0b3I6ICcjMTU1NDc5J1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdmFyIGJpZ0JhbGwgPSBQaHlzaWNzLmJvZHkoJ2NpcmNsZScsIHtcbiAgICAgICAgICAgIHg6IHRoaXMub3B0aW9ucy53aWR0aCAvIDJcbiAgICAgICAgICAgICx5OiAzMDBcbiAgICAgICAgICAgICx2eDogLTMvNTBcbiAgICAgICAgICAgICxyYWRpdXM6IDEwXG4gICAgICAgICAgICAsbWFzczogMjVcbiAgICAgICAgICAgICxyZXN0aXR1dGlvbjogMFxuICAgICAgICAgICAgLHN0eWxlczoge1xuICAgICAgICAgICAgICAgIGZpbGxTdHlsZTogJyMyNjhiZDInXG4gICAgICAgICAgICAgICAgLGFuZ2xlSW5kaWNhdG9yOiAnIzE1NTQ3OSdcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHdvcmxkLmFkZChbcmVkQmFsbCwgZ3JlZW5CYWxsLCBiaWdCYWxsXSk7XG4gICAgICAgIHdvcmxkLmFkZChQaHlzaWNzLmJlaGF2aW9yKCduZXd0b25pYW4nLCB7IHN0cmVuZ3RoOiAuNSB9KSk7XG5cbiAgICAgICAgdmFyIGJ1dHRvbkNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChidXR0b25Db250YWluZXIpO1xuICAgICAgICB2YXIgcGxheVBhdXNlID0gbmV3IFBsYXlQYXVzZSh3b3JsZCwgYnV0dG9uQ29udGFpbmVyKTtcbiAgICAgICAgdmFyIGdhdGVQb2x5Z29uID0gW3t4OiAtNzAwLCB5OiAtMTAwfSwge3g6IDcwMCwgeTogLTEwMH0sIHt4OiA3MDAsIHk6IDEzOX0sIHt4OiAtNzAwLCB5OiAxMzl9XTtcbiAgICAgICAgdmFyIGdhdGVQb2x5Z29uMiA9IFt7eDogLTcwMCwgeTogLTI2MX0sIHt4OiA3MDAsIHk6IC0yNjF9LCB7eDogNzAwLCB5OiAyMDB9LCB7eDogLTcwMCwgeTogMjAwfV07XG4gICAgICAgIHZhciBnYXRlcyA9IFtdXG4gICAgICAgIGdhdGVzLnB1c2gobmV3IEdhdGUod29ybGQsIGJ1dHRvbkNvbnRhaW5lciwgZ2F0ZVBvbHlnb24sIFs3MDAsIDEwMF0sIHJlZEJhbGwsIHtkZWJ1ZzogdHJ1ZSwgc2hvdzogdHJ1ZX0pKTtcbiAgICAgICAgZ2F0ZXMucHVzaChuZXcgR2F0ZSh3b3JsZCwgYnV0dG9uQ29udGFpbmVyLCBnYXRlUG9seWdvbiwgWzcwMCwgMTAwXSwgZ3JlZW5CYWxsLCB7ZGVidWc6IHRydWUsIHNob3c6IHRydWV9KSk7XG4gICAgICAgIGdhdGVzLnB1c2gobmV3IEdhdGUod29ybGQsIGJ1dHRvbkNvbnRhaW5lciwgZ2F0ZVBvbHlnb24sIFs3MDAsIDEwMF0sIGJpZ0JhbGwsIHtkZWJ1ZzogdHJ1ZSwgc2hvdzogdHJ1ZX0pKTtcbiAgICAgICAgZ2F0ZXMucHVzaChuZXcgR2F0ZSh3b3JsZCwgYnV0dG9uQ29udGFpbmVyLCBnYXRlUG9seWdvbjIsIFs3MDAsIDUwMF0sIHJlZEJhbGwsIHtkZWJ1ZzogdHJ1ZSwgc2hvdzogdHJ1ZX0pKTtcbiAgICAgICAgZ2F0ZXMucHVzaChuZXcgR2F0ZSh3b3JsZCwgYnV0dG9uQ29udGFpbmVyLCBnYXRlUG9seWdvbjIsIFs3MDAsIDUwMF0sIGdyZWVuQmFsbCwge2RlYnVnOiB0cnVlLCBzaG93OiB0cnVlfSkpO1xuICAgICAgICBnYXRlcy5wdXNoKG5ldyBHYXRlKHdvcmxkLCBidXR0b25Db250YWluZXIsIGdhdGVQb2x5Z29uMiwgWzcwMCwgNTAwXSwgYmlnQmFsbCwge2RlYnVnOiB0cnVlLCBzaG93OiB0cnVlfSkpO1xuICAgICAgICBnYXRlcy5mb3JFYWNoKGZ1bmN0aW9uKGdhdGUpIHtcbiAgICAgICAgICAgIHZhciBzdG9wd2F0Y2ggPSBuZXcgU3RvcHdhdGNoKHdvcmxkLCBidXR0b25Db250YWluZXIsIDEpO1xuICAgICAgICAgICAgZ2F0ZS5vbignZW50ZXInLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICAgICAgc3RvcHdhdGNoLnJlc2V0KCk7XG4gICAgICAgICAgICAgICAgc3RvcHdhdGNoLnN0YXJ0KCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGdhdGUub24oJ2V4aXQnLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICAgICAgc3RvcHdhdGNoLnN0b3AoKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cbn0pO1xuXG4gICAgICAgIFxuIiwibW9kdWxlLmV4cG9ydHMgPSBQbGF5UGF1c2U7XG5cbmZ1bmN0aW9uIFBsYXlQYXVzZSh3b3JsZCwgY29udGFpbmVyKSB7XG4gICAgdGhpcy5fYXR0YWNoKHdvcmxkLCBjb250YWluZXIpO1xufVxuXG5QbGF5UGF1c2UucHJvdG90eXBlLmNyZWF0ZUJ1dHRvbiA9IGZ1bmN0aW9uKGFjdGlvbiwgaGFuZGxlcikge1xuICAgIHZhciBhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImFcIik7XG4gICAgYS5ocmVmID0gXCIjXCIgKyBhY3Rpb247XG4gICAgYS5pbm5lckhUTUwgPSBhY3Rpb247XG4gICAgYS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIGhhbmRsZXIoKTtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICB9LmJpbmQodGhpcykpO1xuICAgIHJldHVybiBhO1xufVxuXG5QbGF5UGF1c2UucHJvdG90eXBlLl9hdHRhY2ggPSBmdW5jdGlvbih3b3JsZCwgY29udGFpbmVyKSB7XG4gICAgdGhpcy5wYXVzZVN5bWJvbCA9IFwi4paQ4paQXCI7XG4gICAgdGhpcy5wbGF5U3ltYm9sID0gXCLilrpcIjtcbiAgICB0aGlzLmJ1dHRvbiA9IHRoaXMuY3JlYXRlQnV0dG9uKHRoaXMucGF1c2VTeW1ib2wsIHRoaXMudG9nZ2xlLmJpbmQodGhpcykpO1xuICAgIHRoaXMud29ybGQgPSB3b3JsZDtcbiAgICB2YXIgd2lkZ2V0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICB3aWRnZXQuY2xhc3NOYW1lID0gXCJwbGF5cGF1c2VcIjtcbiAgICB3aWRnZXQuYXBwZW5kQ2hpbGQodGhpcy5idXR0b24pO1xuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZCh3aWRnZXQpO1xufVxuXG5QbGF5UGF1c2UucHJvdG90eXBlLnRvZ2dsZSA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLndvcmxkLmlzUGF1c2VkKCkpIHtcbiAgICAgICAgdGhpcy5idXR0b24uaW5uZXJIVE1MID0gdGhpcy5wYXVzZVN5bWJvbDtcbiAgICAgICAgdGhpcy5idXR0b24uaHJlZiA9ICcjJyArIHRoaXMucGF1c2VTeW1ib2w7XG4gICAgICAgIHRoaXMud29ybGQudW5wYXVzZSgpXG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5idXR0b24uaW5uZXJIVE1MID0gdGhpcy5wbGF5U3ltYm9sO1xuICAgICAgICB0aGlzLmJ1dHRvbi5ocmVmID0gJyMnICsgdGhpcy5wbGF5U3ltYm9sO1xuICAgICAgICB0aGlzLndvcmxkLnBhdXNlKClcbiAgICB9XG59XG5cblxuIiwidmFyIEJhc2UgPSByZXF1aXJlKCcuL2Jhc2UnKTtcbnZhciBHYXRlID0gcmVxdWlyZSgnLi9nYXRlJyk7XG52YXIgU3RvcHdhdGNoID0gcmVxdWlyZSgnLi9zdG9wd2F0Y2gnKTtcbnZhciBQbGF5UGF1c2UgPSByZXF1aXJlKCcuL3BsYXlwYXVzZScpO1xudmFyIHV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBCYXNlLmV4dGVuZChmdW5jdGlvbiBTbG9wZShjb250YWluZXIsIG9wdGlvbnMpIHtcbiAgICBCYXNlLmNhbGwodGhpcywgY29udGFpbmVyLCBvcHRpb25zLCAnaW1hZ2VzL2xhYl9iYWNrZ3JvdW5kLmpwZycpXG59LCB7XG4gICAgZHJvcEluQm9keTogZnVuY3Rpb24gKHJhZGl1cywgeSkge1xuICAgICAgICBmdW5jdGlvbiByYW5kb20obWluLCBtYXgpe1xuICAgICAgICAgICAgcmV0dXJuIChNYXRoLnJhbmRvbSgpICogKG1heC1taW4pICsgbWluKXwwXG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLndvcmxkLmFkZChQaHlzaWNzLmJvZHkoJ2NpcmNsZScsIHtcbiAgICAgICAgICAgIHg6IDEwMCxcbiAgICAgICAgICAgIHk6IHksXG4gICAgICAgICAgICB2eDogcmFuZG9tKC01LCA1KS8xMDAsXG4gICAgICAgICAgICByYWRpdXM6IHJhZGl1cyxcbiAgICAgICAgICAgIHJlc3RpdHV0aW9uOiAwLjksXG4gICAgICAgICAgICBzdHlsZXM6IHtcbiAgICAgICAgICAgICAgICBmaWxsU3R5bGU6ICcjMjY4YmQyJyxcbiAgICAgICAgICAgICAgICBhbmdsZUluZGljYXRvcjogJyMxNTU0NzknXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pKTtcbiAgICB9LFxuICAgIHNldHVwOiBmdW5jdGlvbiAoY29udGFpbmVyKSB7XG4gICAgICAgIHZhciB3b3JsZCA9IHRoaXMud29ybGRcbiAgICAgICAgd29ybGQuYWRkKFBoeXNpY3MuYmVoYXZpb3IoJ2NvbnN0YW50LWFjY2VsZXJhdGlvbicpKTtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDU7IGkrKykge1xuICAgICAgICAgICAgdmFyIHJhZGl1cyA9IDIwICsgMTAgKiBpO1xuICAgICAgICAgICAgdGhpcy5kcm9wSW5Cb2R5KHJhZGl1cywgMzAwIC0gaSAqIDUwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMud29ybGQuYWRkKFBoeXNpY3MuYm9keSgnY29udmV4LXBvbHlnb24nLCB7XG4gICAgICAgICAgICB4OiA0NTAsXG4gICAgICAgICAgICB5OiA2MDAsXG4gICAgICAgICAgICB2ZXJ0aWNlczogW1xuICAgICAgICAgICAgICAgIHt4OiAwLCB5OiAwfSxcbiAgICAgICAgICAgICAgICB7eDogMCwgeTogMzAwfSxcbiAgICAgICAgICAgICAgICB7eDogODAwLCB5OiAzMDB9LFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIHRyZWF0bWVudDogJ3N0YXRpYycsXG4gICAgICAgICAgICBjb2Y6IDEsXG4gICAgICAgICAgICBzdHlsZXM6IHtcbiAgICAgICAgICAgICAgICBmaWxsU3R5bGU6ICcjZDMzNjgyJyxcbiAgICAgICAgICAgICAgICBhbmdsZUluZGljYXRvcjogJyM3NTFiNGInXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pKVxuXG4gICAgICAgIHZhciBidXR0b25Db250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoYnV0dG9uQ29udGFpbmVyKTtcbiAgICAgICAgdmFyIHN0b3B3YXRjaCA9IG5ldyBTdG9wd2F0Y2god29ybGQsIGJ1dHRvbkNvbnRhaW5lciwgMSk7XG4gICAgICAgIHZhciBwbGF5UGF1c2UgPSBuZXcgUGxheVBhdXNlKHdvcmxkLCBidXR0b25Db250YWluZXIpO1xuICAgICAgICB2YXIgdG9wR2F0ZSA9IG5ldyBHYXRlKHdvcmxkLCBidXR0b25Db250YWluZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXRpbC5tYWtlUmVjdCgwLCAwLCA2MCwgMTAwKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbMzUwLCA0MDBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG51bGwsIHtkZWJ1ZzogdHJ1ZSwgc2hvdzogdHJ1ZX0pO1xuICAgICAgICB2YXIgYm90dG9tR2F0ZSA9IG5ldyBHYXRlKHdvcmxkLCBidXR0b25Db250YWluZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXRpbC5tYWtlUmVjdCgwLCAwLCA2MCwgMTAwKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbODAwLCA1NzBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG51bGwsIHtkZWJ1ZzogdHJ1ZSwgc2hvdzogdHJ1ZX0pO1xuXG4gICAgICAgIHRvcEdhdGUub24oJ2VudGVyJywgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgc3RvcHdhdGNoLnJlc2V0KCkuc3RhcnQoKTtcbiAgICAgICAgfSlcbiAgICAgICAgYm90dG9tR2F0ZS5vbignZW50ZXInLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICBzdG9wd2F0Y2guc3RvcCgpXG4gICAgICAgIH0pXG4gICAgfVxufSk7XG5cbiIsIlxubW9kdWxlLmV4cG9ydHMgPSBTdG9wd2F0Y2g7XG5cbmZ1bmN0aW9uIFN0b3B3YXRjaCh3b3JsZCwgZWxlbSkge1xuICAgIHRoaXMuX2F0dGFjaCh3b3JsZCwgZWxlbSk7XG59XG5cblN0b3B3YXRjaC5wcm90b3R5cGUuX2F0dGFjaCA9IGZ1bmN0aW9uKHdvcmxkLCBlbGVtKSB7XG4gICAgdGhpcy53b3JsZCA9IHdvcmxkO1xuICAgIHRoaXMudGltZXIgPSB0aGlzLmNyZWF0ZVRpbWVyKCksXG4gICAgdGhpcy5zdGFydEJ1dHRvbiA9IHRoaXMuY3JlYXRlQnV0dG9uKFwic3RhcnRcIiwgdGhpcy5zdGFydC5iaW5kKHRoaXMpKSxcbiAgICB0aGlzLnN0b3BCdXR0b24gPSB0aGlzLmNyZWF0ZUJ1dHRvbihcInN0b3BcIiwgdGhpcy5zdG9wLmJpbmQodGhpcykpLFxuICAgIHRoaXMucmVzZXRCdXR0b24gPSB0aGlzLmNyZWF0ZUJ1dHRvbihcInJlc2V0XCIsIHRoaXMucmVzZXQuYmluZCh0aGlzKSksXG4gICAgdGhpcy5jbG9jayA9IDA7XG5cbiAgICAvLyBVcGRhdGUgb24gZXZlcnkgdGltZXIgdGlja1xuICAgIHRoaXMud29ybGQub24oJ3N0ZXAnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy51cGRhdGUoKTtcbiAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgdmFyIHdpZGdldCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgd2lkZ2V0LmNsYXNzTmFtZSA9IFwic3RvcHdhdGNoXCI7XG5cbiAgICAvLyBhcHBlbmQgZWxlbWVudHNcbiAgICB3aWRnZXQuYXBwZW5kQ2hpbGQodGhpcy50aW1lcik7XG4gICAgd2lkZ2V0LmFwcGVuZENoaWxkKHRoaXMuc3RhcnRCdXR0b24pO1xuICAgIHdpZGdldC5hcHBlbmRDaGlsZCh0aGlzLnN0b3BCdXR0b24pO1xuICAgIHdpZGdldC5hcHBlbmRDaGlsZCh0aGlzLnJlc2V0QnV0dG9uKTtcblxuICAgIGVsZW0uYXBwZW5kQ2hpbGQod2lkZ2V0KTtcbn1cblxuU3RvcHdhdGNoLnByb3RvdHlwZS5jcmVhdGVUaW1lciA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKTtcbn1cblxuU3RvcHdhdGNoLnByb3RvdHlwZS5jcmVhdGVCdXR0b24gPSBmdW5jdGlvbihhY3Rpb24sIGhhbmRsZXIpIHtcbiAgICB2YXIgYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJhXCIpO1xuICAgIGEuaHJlZiA9IFwiI1wiICsgYWN0aW9uO1xuICAgIGEuaW5uZXJIVE1MID0gYWN0aW9uO1xuICAgIGEuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICBoYW5kbGVyKCk7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgfS5iaW5kKHRoaXMpKTtcbiAgICByZXR1cm4gYTtcbn1cblxuU3RvcHdhdGNoLnByb3RvdHlwZS5zdGFydCA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucnVubmluZyA9IHRydWVcbiAgICByZXR1cm4gdGhpcztcbn1cblxuU3RvcHdhdGNoLnByb3RvdHlwZS5zdG9wID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5ydW5uaW5nID0gZmFsc2VcbiAgICByZXR1cm4gdGhpcztcbn1cblxuU3RvcHdhdGNoLnByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuY2xvY2sgPSAwO1xuICAgIHRoaXMucmVuZGVyKCk7XG4gICAgcmV0dXJuIHRoaXM7XG59XG5cblN0b3B3YXRjaC5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIG5ld1RpbWUgPSB0aGlzLndvcmxkLl90aW1lO1xuICAgIGlmICh0aGlzLnJ1bm5pbmcgJiYgdGhpcy5sYXN0VGltZSkge1xuICAgICAgICB0aGlzLmNsb2NrICs9IG5ld1RpbWUgLSB0aGlzLmxhc3RUaW1lO1xuICAgIH1cbiAgICB0aGlzLmxhc3RUaW1lID0gbmV3VGltZTtcbiAgICB0aGlzLnJlbmRlcigpO1xufVxuXG5TdG9wd2F0Y2gucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMudGltZXIuaW5uZXJIVE1MID0gcGFyc2VGbG9hdCh0aGlzLmNsb2NrIC8gMTAwMCkudG9GaXhlZCgyKTtcbn1cbiIsIlxudmFyIEJhc2UgPSByZXF1aXJlKCcuL2Jhc2UnKTtcbnZhciBHcmFwaCA9IHJlcXVpcmUoJy4vZ3JhcGgnKTtcblxuZnVuY3Rpb24gcmFuZG9tKCBtaW4sIG1heCApe1xuICAgIHJldHVybiAoTWF0aC5yYW5kb20oKSAqIChtYXgtbWluKSArIG1pbil8MFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2UuZXh0ZW5kKGZ1bmN0aW9uIERlbW8oY29udGFpbmVyLCBvcHRpb25zKSB7XG4gICAgQmFzZS5jYWxsKHRoaXMsIGNvbnRhaW5lciwgb3B0aW9ucywgJ2ltYWdlcy9sYWJfYmFja2dyb3VuZC5qcGcnKVxufSwge1xuICAgIG1ha2VDaXJjbGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIFBoeXNpY3MuYm9keSgnY2lyY2xlJywge1xuICAgICAgICAgICAgeDogdGhpcy5vcHRpb25zLndpZHRoIC8gMixcbiAgICAgICAgICAgIHk6IDUwLFxuICAgICAgICAgICAgdng6IHJhbmRvbSgtNSwgNSkvMTAwLFxuICAgICAgICAgICAgcmFkaXVzOiA0MCxcbiAgICAgICAgICAgIHJlc3RpdHV0aW9uOiAwLjksXG4gICAgICAgICAgICBzdHlsZXM6IHtcbiAgICAgICAgICAgICAgICBmaWxsU3R5bGU6ICcjMjY4YmQyJyxcbiAgICAgICAgICAgICAgICBhbmdsZUluZGljYXRvcjogJyMxNTU0NzknXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgZHJvcEluQm9keTogZnVuY3Rpb24gKCkge1xuXG4gICAgICAgIHZhciBib2R5O1xuXG5cbiAgICAgICAgdmFyIHBlbnQgPSBbXG4gICAgICAgICAgICB7IHg6IDUwLCB5OiAwIH1cbiAgICAgICAgICAgICx7IHg6IDI1LCB5OiAtMjUgfVxuICAgICAgICAgICAgLHsgeDogLTI1LCB5OiAtMjUgfVxuICAgICAgICAgICAgLHsgeDogLTUwLCB5OiAwIH1cbiAgICAgICAgICAgICx7IHg6IDAsIHk6IDUwIH1cbiAgICAgICAgXTtcblxuICAgICAgICAgICAgc3dpdGNoICggcmFuZG9tKCAwLCAzICkgKXtcblxuICAgICAgICAgICAgICAgICAgICAvLyBhZGQgYSBjaXJjbGVcbiAgICAgICAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICAgICAgICAgIGJvZHkgPSBQaHlzaWNzLmJvZHkoJ2NpcmNsZScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHg6IHRoaXMub3B0aW9ucy53aWR0aCAvIDJcbiAgICAgICAgICAgICAgICAgICAgICAgICx5OiA1MFxuICAgICAgICAgICAgICAgICAgICAgICAgLHZ4OiByYW5kb20oLTUsIDUpLzEwMFxuICAgICAgICAgICAgICAgICAgICAgICAgLHJhZGl1czogNDBcbiAgICAgICAgICAgICAgICAgICAgICAgICxyZXN0aXR1dGlvbjogMC45XG4gICAgICAgICAgICAgICAgICAgICAgICAsc3R5bGVzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsbFN0eWxlOiAnIzI2OGJkMidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAsYW5nbGVJbmRpY2F0b3I6ICcjMTU1NDc5J1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gYWRkIGEgc3F1YXJlXG4gICAgICAgICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgICAgICAgICBib2R5ID0gUGh5c2ljcy5ib2R5KCdyZWN0YW5nbGUnLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogNTBcbiAgICAgICAgICAgICAgICAgICAgICAgICxoZWlnaHQ6IDUwXG4gICAgICAgICAgICAgICAgICAgICAgICAseDogdGhpcy5vcHRpb25zLndpZHRoIC8gMlxuICAgICAgICAgICAgICAgICAgICAgICAgLHk6IDUwXG4gICAgICAgICAgICAgICAgICAgICAgICAsdng6IHJhbmRvbSgtNSwgNSkvMTAwXG4gICAgICAgICAgICAgICAgICAgICAgICAscmVzdGl0dXRpb246IDAuOVxuICAgICAgICAgICAgICAgICAgICAgICAgLHN0eWxlczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGxTdHlsZTogJyNkMzM2ODInXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLGFuZ2xlSW5kaWNhdG9yOiAnIzc1MWI0YidcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGFkZCBhIHBvbHlnb25cbiAgICAgICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgICAgIGJvZHkgPSBQaHlzaWNzLmJvZHkoJ2NvbnZleC1wb2x5Z29uJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmVydGljZXM6IHBlbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICx4OiB0aGlzLm9wdGlvbnMud2lkdGggLyAyXG4gICAgICAgICAgICAgICAgICAgICAgICAseTogNTBcbiAgICAgICAgICAgICAgICAgICAgICAgICx2eDogcmFuZG9tKC01LCA1KS8xMDBcbiAgICAgICAgICAgICAgICAgICAgICAgICxhbmdsZTogcmFuZG9tKCAwLCAyICogTWF0aC5QSSApXG4gICAgICAgICAgICAgICAgICAgICAgICAscmVzdGl0dXRpb246IDAuOVxuICAgICAgICAgICAgICAgICAgICAgICAgLHN0eWxlczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGxTdHlsZTogJyM4NTk5MDAnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLGFuZ2xlSW5kaWNhdG9yOiAnIzQxNDcwMCdcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLndvcmxkLmFkZCggYm9keSApO1xuICAgIH0sXG4gICAgc2V0dXA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHdvcmxkID0gdGhpcy53b3JsZFxuICAgICAgICAvLyB3b3JsZC5hZGQoUGh5c2ljcy5iZWhhdmlvcignY29uc3RhbnQtYWNjZWxlcmF0aW9uJykpO1xuXG4gICAgICAgIC8qXG4gICAgICAgIHZhciBpbnQgPSBzZXRJbnRlcnZhbChmdW5jdGlvbigpe1xuICAgICAgICAgICAgaWYgKCB3b3JsZC5fYm9kaWVzLmxlbmd0aCA+IDQgKXtcbiAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKCBpbnQgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuZHJvcEluQm9keSgpO1xuICAgICAgICB9LmJpbmQodGhpcyksIDcwMCk7XG4gICAgICAgKi9cblxuICAgICAgICB2YXIgY2lyY2xlID0gdGhpcy5tYWtlQ2lyY2xlKClcbiAgICAgICAgdGhpcy53b3JsZC5hZGQoY2lyY2xlKVxuXG4gICAgICAgIHZhciBncmFwaCA9IG5ldyBHcmFwaCh0aGlzLmNvbnRhaW5lciwge1xuICAgICAgICAgICAgJ0NpcmNsZSc6IHtib2R5OiBjaXJjbGUsIGF0dHI6ICdwb3MueScsIG5hbWU6J0NpcmNsZScsIG1pbnNjYWxlOiA1fSxcbiAgICAgICAgICAgICdWZWxZJzoge2JvZHk6IGNpcmNsZSwgYXR0cjogJ3ZlbC55JywgbmFtZTonVmVsWScsIG1pbnNjYWxlOiAuMX0sXG4gICAgICAgICAgICAnQW5nUCc6IHtib2R5OiBjaXJjbGUsIGF0dHI6ICdhbmd1bGFyLnBvcycsIG5hbWU6J0FjY1gnLCBtaW5zY2FsZTogLjAwMX0sXG4gICAgICAgICAgICAnQW5nVic6IHtib2R5OiBjaXJjbGUsIGF0dHI6ICdhbmd1bGFyLnZlbCcsIG5hbWU6J0FjY1gnLCBtaW5zY2FsZTogLjAwMX0sXG4gICAgICAgIH0sIHRoaXMub3B0aW9ucy5oZWlnaHQpXG4gICAgICAgIHRoaXMuZ3JhcGggPSBncmFwaFxuXG4gICAgICAgIHRoaXMud29ybGQub24oJ3N0ZXAnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBncmFwaC51cGRhdGUod29ybGQudGltZXN0ZXAoKSlcbiAgICAgICAgfSk7XG5cbiAgICB9XG59KTtcblxuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgbWFrZVJlY3Q6IG1ha2VSZWN0LFxuICAgIG1ha2VSb2NrOiBtYWtlUm9jayxcbiAgICBzdW06IHN1bSxcbiAgICBhdmc6IGF2Z1xufVxuXG5mdW5jdGlvbiBzdW0obnVtYmVycykge1xuICAgIGlmICghbnVtYmVycy5sZW5ndGgpIHJldHVybiAwO1xuICAgIHJldHVybiBudW1iZXJzLnJlZHVjZShmdW5jdGlvbiAoYSwgYikge3JldHVybiBhICsgYn0pXG59XG5cbmZ1bmN0aW9uIGF2ZyhudW1iZXJzKSB7XG4gICAgaWYgKCFudW1iZXJzLmxlbmd0aCkgcmV0dXJuIDA7XG4gICAgcmV0dXJuIHN1bShudW1iZXJzKSAvIG51bWJlcnMubGVuZ3RoXG59XG5cbmZ1bmN0aW9uIG1ha2VSZWN0KHgsIHksIHdpZHRoLCBoZWlnaHQpIHtcbiAgICByZXR1cm4gW1xuICAgICAgICB7eDogeCAtIHdpZHRoLzIsIHk6IHkgLSBoZWlnaHQvMn0sXG4gICAgICAgIHt4OiB4ICsgd2lkdGgvMiwgeTogeSAtIGhlaWdodC8yfSxcbiAgICAgICAge3g6IHggKyB3aWR0aC8yLCB5OiB5ICsgaGVpZ2h0LzJ9LFxuICAgICAgICB7eDogeCAtIHdpZHRoLzIsIHk6IHkgKyBoZWlnaHQvMn0sXG4gICAgXVxufVxuXG4vLyBOb3QgYSBjb252ZXggaHVsbCA6KFxuZnVuY3Rpb24gbWFrZVJvY2socmFkaXVzLCBkZXZpYXRpb24sIHJlc29sdXRpb24pIHtcbiAgICB2YXIgcmVzb2x1dGlvbiA9IHJlc29sdXRpb24gfHwgMzJcbiAgICB2YXIgZGV2aWF0aW9uID0gZGV2aWF0aW9uIHx8IDEwXG4gICAgdmFyIHBvaW50cyA9IFtdXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZXNvbHV0aW9uOyBpKyspIHtcbiAgICAgICAgdmFyIGFuZyA9IGkgLyByZXNvbHV0aW9uICogMiAqIE1hdGguUEk7XG4gICAgICAgIHZhciBwb2ludCA9IHsgeDogcmFkaXVzICogTWF0aC5jb3MoYW5nKSwgeTogcmFkaXVzICogTWF0aC5zaW4oYW5nKSB9XG4gICAgICAgIHBvaW50LnggKz0gKE1hdGgucmFuZG9tKCkpICogMiAqIGRldmlhdGlvblxuICAgICAgICBwb2ludC55ICs9IChNYXRoLnJhbmRvbSgpKSAqIDIgKiBkZXZpYXRpb25cbiAgICAgICAgcG9pbnRzLnB1c2gocG9pbnQpXG4gICAgfVxuICAgIHJldHVybiBwb2ludHNcbn1cbiIsIlxudmFyIGJha2hhbiA9IHJlcXVpcmUoJy4vbGliJylcbiAgLCBub2RlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21haW4tY2FudmFzJylcblxudmFyIG9wdGlvbnMgPSB7XG4gICAgd2lkdGg6IDkwMCxcbiAgICBoZWlnaHQ6IDcwMCxcbn1cblxudmFyIG5hbWUgPSB3aW5kb3cubG9jYXRpb24uc2VhcmNoLnJlcGxhY2UoLyYoXFx3Kyk9KFteJl0rKS9nLCBmdW5jdGlvbiAocmVzLCBrZXksIHZhbCkge1xuICAgIG9wdGlvbnNba2V5XSA9IHZhbC5yZXBsYWNlKC9cXC8vLCAnJylcbiAgICByZXR1cm4gJydcbn0pLnJlcGxhY2UoL1teXFx3XS9nLCAnJykgfHwgJ0RlbW8nXG5jb25zb2xlLmxvZyhuYW1lKVxuXG53aW5kb3cuQktBID0gbmV3IGJha2hhbltuYW1lXShub2RlLCBvcHRpb25zKTtcbndpbmRvdy5CS0EucnVuKCk7XG5cbnNldEludGVydmFsKGZ1bmN0aW9uKCkge1xuICAgIHZhciBjYW52YXMgPSAkKCdjYW52YXMnKVswXVxuICAgIHZhciBmbiA9IGZ1bmN0aW9uKHgpIHtcbiAgICAgICAgcmV0dXJuIDIwICogTWF0aC5zaW4oeCAvIDIwKSArIDYwICogTWF0aC5zaW4oeCAvIDUzKSArIDQwMFxuICAgIH1cbiAgICBiYWtoYW4uQ2F2ZURyYXcoY2FudmFzLCBmbilcbn0sIDUwMClcbiJdfQ==
