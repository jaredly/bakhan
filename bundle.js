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

        

},{"./base":2,"./gate":9,"./playpause":21,"./stopwatch":23}],2:[function(require,module,exports){

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
module.exports = CaveDraw;

function CaveDraw(container, width, height) {
    this.container = $(container)
    this.canvas = document.createElement('canvas')
    this.canvas.width = width
    this.canvas.height = height
    container.append(this.canvas)
}

CaveDraw.prototype.draw = function(fn) {
    definePath(this.canvas, fn)
    drawPath(this.canvas)
}

CaveDraw.prototype.clear = function() {
    var context = this.canvas.getContext('2d');
    context.clearRect(0, 0, this.canvas.width, this.canvas.height)
}

function definePath(canvas, fn) {
    var context = canvas.getContext('2d');
    var xmax = canvas.width
    var ymax = canvas.height

    context.beginPath();
    context.moveTo(0, fn(0));
    for (var x = 0; x < xmax ; x++) {
        context.lineTo(x, ymax - fn(x))
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
        var gate = new Gate(world, gatePolygon, [350, 700], null, {debug: true, show: true});
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


},{"./base":2,"./gate":9,"./graph":10,"./playpause":21,"./stopwatch":23}],7:[function(require,module,exports){
var Base = require('./base');
var Gate = require('./gate');
var Stopwatch = require('./stopwatch');
var LogBook = require('./logbook');
var PlayPause = require('./playpause');
var DropIntro = require('./intro/drop_intro.jsx');
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
        DropIntro(this, function (hypothesis) {
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
        var topGate = new Gate(world,
                               util.makeRect(0, 0, 200, 10),
                               [120, 200], null, {debug: true, show: true, color: 'green'});
        var bottomGate = new Gate(world,
                               util.makeRect(0, 0, 200, 10),
                               [120, 550], null, {debug: true, show: true, color: 'red'});
        var logColumns = [
            {name: "Bowling Ball", extraText: " (7 kg)"},
            {name: "Tennis Ball", extraText: " (58 g)", color: 'rgb(154, 241, 0)'}
        ];
        var logBook = this.logBook = new LogBook(world, sideBar, 5, logColumns);
        topGate.on('enter', function(elem) {
            var colName = elem.body.displayName || elem.body.name || "body";
            logBook.handleStart(colName, elem.body.uid);
        }.bind(this));
        bottomGate.on('enter', function(elem) {
            var colName = elem.body.displayName || elem.body.name || "body";
            logBook.handleEnd(colName, elem.body.uid);
        });

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

},{"./base":2,"./dropdatachecker.jsx":8,"./gate":9,"./intro/drop_intro.jsx":13,"./logbook":17,"./playpause":21,"./stopwatch":23,"./util":26}],8:[function(require,module,exports){
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

},{"./check-collision":5,"./stopwatch":23}],10:[function(require,module,exports){

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
var Base = require('./base');
var Gate = require('./gate');
var Stopwatch = require('./stopwatch');
var LogBook = require('./logbook');
var PlayPause = require('./playpause');
//var WalkThrough = require('./intro/hills_walkthrough.jsx');
var DropDataChecker = require('./dropdatachecker.jsx');
var CaveDraw = require('./cavedraw');
var util = require('./util');
var terrain = require('./terrain');

function random(min, max){
    return (Math.random() * (max-min) + min)|0
}

module.exports = Base.extend(function Hills(container, options) {
    Base.call(this, container, options, "images/lab_background.jpg",
        true /* disableBounds */)
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

    // TODO: hook up walkthrough
//    startWalkthrough: function () {
//        WalkThrough(this, function (hypothesis) {
//            console.log('Got the hypothesis!!', hypothesis);
//            this.setupDataChecker(hypothesis);
//        }.bind(this))
//    },

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
        // constrain objects to these bounds
        Physics.behavior('terrain-collision-detection', terrain);
        var terrainHeight = function (x) {return 200 - x/6 + 50 * Math.cos(x/60);};
        var bgdraw = new CaveDraw($('#under-canvas'), 900, 700)
        bgdraw.draw(terrainHeight)
        world.add(Physics.behavior('terrain-collision-detection', {
            aabb: Physics.aabb(0, 0, this.options.width, this.options.height),
            terrainHeight: terrainHeight,
            restitution: 0.2,
            cof: 0.8
        }));

        var sideBar = this.sideBar = document.createElement("div");
        sideBar.className = "side-bar";
        container.appendChild(sideBar);
        var topGate = new Gate(world,
                               util.makeRect(0, 0, 200, 10),
                               [120, 200], null, {debug: true, show: true, color: 'green'});
        var bottomGate = new Gate(world,
                               util.makeRect(0, 0, 200, 10),
                               [120, 550], null, {debug: true, show: true, color: 'red'});
        var logColumns = [
            {name: "Bowling Ball", extraText: " (7 kg)"},
            {name: "Tennis Ball", extraText: " (58 g)", color: 'aaee00'}
        ];
        var logBook = this.logBook = new LogBook(world, sideBar, 5, logColumns);
        topGate.on('enter', function(elem) {
            var colName = elem.body.displayName || elem.body.name || "body";
            logBook.handleStart(colName, elem.body.uid);
        }.bind(this));
        bottomGate.on('enter', function(elem) {
            var colName = elem.body.displayName || elem.body.name || "body";
            logBook.handleEnd(colName, elem.body.uid);
        });
        var buttonContainer = document.createElement("div");
        var playPause = new PlayPause(world, buttonContainer);
        container.appendChild(buttonContainer);

        if (this.options.walk) {
            // TODO: hook up walkthrough
//            this.startWalkthrough()
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

},{"./base":2,"./cavedraw":4,"./dropdatachecker.jsx":8,"./gate":9,"./logbook":17,"./playpause":21,"./stopwatch":23,"./terrain":24,"./util":26}],12:[function(require,module,exports){

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
    Hills: require('./hills'),
}

},{"./asteroids":1,"./base":2,"./cavedraw":4,"./demo":6,"./drop":7,"./hills":11,"./moon":18,"./newton1":19,"./orbit":20,"./slope":22,"./try-graph":25}],13:[function(require,module,exports){
/** @jsx React.DOM */

var Walkthrough = require('./walk-through.jsx')
var PT = React.PropTypes
var Step = require('./step.jsx')

var DEBUG = false

module.exports = DropIntro;

function DropIntro(Exercise, gotHypothesis) {
    var node = document.createElement('div')
    document.body.appendChild(node)
    React.renderComponent(Walkthrough({
        steps: steps,
        onHypothesis: gotHypothesis,
        onDone: function (hypothesis) {
            React.unmountComponentAtNode(node);
            node.parentNode.removeChild(node);
        },
        Exercise: Exercise
    }), node)
}


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

var steps = [
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

        if (hypothesis === 'bowling') {
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

},{"./step.jsx":15,"./walk-through.jsx":16}],14:[function(require,module,exports){
/** @jsx React.DOM */

var Walkthrough = require('./walk-through.jsx')
var PT = React.PropTypes
var Step = require('./step.jsx')

var DEBUG = false

module.exports = Newton1Intro;

function Newton1Intro(Exercise, gotHypothesis) {
    var node = document.createElement('div')
    document.body.appendChild(node)
    React.renderComponent(Walkthrough({
        steps: steps,
        onHypothesis: gotHypothesis,
        onDone: function (hypothesis) {
            React.unmountComponentAtNode(node);
            node.parentNode.removeChild(node);
        },
        Exercise: Exercise
    }), node)
}


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

var steps = [
    function (props) {
        return Step(_.extend(props, {
            id: 'hello',
            title: "Space!!!",
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

        if (hypothesis === 'bowling') {
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

},{"./step.jsx":15,"./walk-through.jsx":16}],15:[function(require,module,exports){
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

},{}],16:[function(require,module,exports){
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


},{}],17:[function(require,module,exports){

var util = require('./util');

module.exports = LogBook;

function LogBook(world, elem, keep, seededColumns) {
    this._attach(world, elem, keep, seededColumns);
}

LogBook.prototype._attach = function (world, elem, keep, seededColumns) {
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

LogBook.prototype.handleStart = function(colName, uid) {
    if (!this.startTimeByBodyName[colName]) {
        this.newTimer(colName);
    }
    this.lastUids[colName] = uid;
    this.startTimeByBodyName[colName] = this.world._time;
    this.renderTimer(colName, 0);
}

LogBook.prototype.handleEnd = function(colName, uid) {
    if (colName in this.data &&
            this.lastUids[colName] == uid) {
        this.data[colName].push(
            this.world._time - this.startTimeByBodyName[colName]);
        delete this.startTimeByBodyName[colName];
        delete this.lastUids[colName];
        var avg = clean(util.avg(this.data[colName]));
        $(this.columnsByBodyName[colName]).find('.log-book-avg').text('Avg: ' + avg);
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

LogBook.prototype.newTimer = function(name) {
    // just does the DOM setup, doesn't actually start the timer
    if (!this.columnsByBodyName[name]) {
        this.addColumn(name);
    }
    var col = this.columnsByBodyName[name];
    var toRemove = $(col).find(".log-book-datum").slice(0,-this.keep+1);
    toRemove.slideUp(500, function () {toRemove.remove();});
    this.data[name] = this.data[name].slice(-this.keep+1);
    var datum = document.createElement("span");
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

},{"./util":26}],18:[function(require,module,exports){
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

        

},{"./base":2,"./gate":9,"./graph":10,"./playpause":21,"./stopwatch":23}],19:[function(require,module,exports){
var Gate = require('./gate');
var Base = require('./base');
var Stopwatch = require('./stopwatch');
var PlayPause = require('./playpause');
var util = require('./util');
var LogBook = require('./logbook')
var Newton1Walkthrough = require('./intro/newton1_intro.jsx')

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
        var sideBar = this.sideBar = document.createElement("div");
        sideBar.className = "side-bar";
        container.appendChild(sideBar);

        var gate1 = new Gate(world,
            util.makeRect(0, 0, 10, 500),
            [400, 350], null, {debug: true, show: true, color: 'green'});
        var gate2 = new Gate(world,
            util.makeRect(0, 0, 10, 500),
            [600, 350], null, {debug: true, show: true, color: 'green'});
        var gate3 = new Gate(world,
            util.makeRect(0, 0, 10, 500),
            [800, 350], null, {debug: true, show: true, color: 'green'});

        var logColumns = [
            {name: "Distance 1", extraText: ""},
            {name: "Distance 2", extraText: ""},
        ];
        var logBook = this.logBook = new LogBook(world, sideBar, 5, logColumns);
        gate1.on('enter', function(elem) {
            logBook.handleStart("Distance 1", elem.body.uid);
        }.bind(this))
        gate2.on('enter', function(elem) {
            logBook.handleEnd("Distance 1", elem.body.uid);
            logBook.handleStart("Distance 2", elem.body.uid);
        }.bind(this))
        gate3.on('enter', function(elem) {
            logBook.handleEnd("Distance 2", elem.body.uid);
        }.bind(this))

        var playPauseContainer = document.createElement("div");
        container.appendChild(playPauseContainer);
        var playPause = new PlayPause(world, playPauseContainer);
        container.appendChild(this.createNewAsteroidLink())

        console.log('options: ' + this.options)
        if (this.options.walk) {
            Newton1Walkthrough(this, function (hypothesis) {
//                this.setupDataChecker(hypothesis);
            }.bind(this))
        }
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

        var minX = 50;
        var maxX = 300;
        var minY = 50;
        var maxY = 650;
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

        

},{"./base":2,"./gate":9,"./intro/newton1_intro.jsx":14,"./logbook":17,"./playpause":21,"./stopwatch":23,"./util":26}],20:[function(require,module,exports){
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
        // var gatePolygon = [{x: -700, y: -100}, {x: 700, y: -100}, {x: 700, y: 139}, {x: -700, y: 139}];
        // var gatePolygon2 = [{x: -700, y: -261}, {x: 700, y: -261}, {x: 700, y: 200}, {x: -700, y: 200}];
        // var gates = []
        // gates.push(new Gate(world, buttonContainer, gatePolygon, [700, 100], redBall, {debug: true, show: true}));
        // gates.push(new Gate(world, buttonContainer, gatePolygon, [700, 100], greenBall, {debug: true, show: true}));
        // gates.push(new Gate(world, buttonContainer, gatePolygon, [700, 100], bigBall, {debug: true, show: true}));
        // gates.push(new Gate(world, buttonContainer, gatePolygon2, [700, 500], redBall, {debug: true, show: true}));
        // gates.push(new Gate(world, buttonContainer, gatePolygon2, [700, 500], greenBall, {debug: true, show: true}));
        // gates.push(new Gate(world, buttonContainer, gatePolygon2, [700, 500], bigBall, {debug: true, show: true}));
        // gates.forEach(function(gate) {
            // var stopwatch = new Stopwatch(world, buttonContainer, 1);
            // gate.on('enter', function(data) {
                // stopwatch.reset();
                // stopwatch.start();
            // });
            // gate.on('exit', function(data) {
                // stopwatch.stop()
            // });
        // });
    }
});

        

},{"./base":2,"./gate":9,"./playpause":21,"./stopwatch":23}],21:[function(require,module,exports){
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



},{}],22:[function(require,module,exports){
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
        var topGate = new Gate(world,
            util.makeRect(0, 0, 60, 100),
            [350, 400],
            null, {debug: true, show: true, color: 'green'});
        var bottomGate = new Gate(world,
            util.makeRect(0, 0, 60, 100),
            [800, 570],
            null, {debug: true, show: true, color: 'red'});

        topGate.on('enter', function(data) {
            stopwatch.reset().start();
        })
        bottomGate.on('enter', function(data) {
            stopwatch.stop()
        })

    }
});


},{"./base":2,"./gate":9,"./playpause":21,"./stopwatch":23,"./util":26}],23:[function(require,module,exports){

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

},{}],24:[function(require,module,exports){
module.exports = terrain;

function terrain( parent ){
    // mostly copied from the edge-collision-detection behavior.

    /*
     * checkGeneral( body, bounds, dummy ) -> Array
     * - body (Body): The body to check
     * - bounds: bounds.aabb should be the outer bounds.  For terrain on the
     *   ground, pass a function bounds.terrainHeight(x).
     * - dummy: (Body): The dummy body to publish as the static other body it collides with
     * + (Array): The collision data
     *
     * Check if a body collides with the boundary
     */
    var checkGeneral = function checkGeneral( body, bounds, terrainHeight, dummy ){

        var overlap
            ,aabb = body.aabb()
            ,scratch = Physics.scratchpad()
            ,trans = scratch.transform()
            ,dir = scratch.vector()
            ,result = scratch.vector()
            ,collision = false
            ,collisions = []
            ,x
            ,y
            ,collisionX
            ;

        // right
        overlap = (aabb.x + aabb.hw) - bounds.max.x;

        if ( overlap >= 0 ){

            dir.set( 1, 0 ).rotateInv( trans.setRotation( body.state.angular.pos ) );

            collision = {
                bodyA: body,
                bodyB: dummy,
                overlap: overlap,
                norm: {
                    x: 1,
                    y: 0
                },
                mtv: {
                    x: overlap,
                    y: 0
                },
                pos: body.geometry.getFarthestHullPoint( dir, result ).rotate( trans ).values()
            };

            collisions.push(collision);
        }

        // bottom
        overlap = -1;
        if (aabb.y + aabb.hh > bounds.max.y - terrainHeight(aabb.x)) {
            // if somehow it gets below the terrain, always push straight up.
            overlap = Math.max(1, (aabb.y + aabb.hh) - bounds.max.y + terrainHeight(aabb.x));
            dir.set( 0, 1 ).rotateInv( trans.setRotation( body.state.angular.pos ) );

            collision = {
                bodyA: body,
                bodyB: dummy,
                overlap: overlap,
                norm: {
                    x: 0,
                    y: 1
                },
                mtv: {
                    x: 0,
                    y: overlap
                },
                pos: body.geometry.getFarthestHullPoint( dir, result ).rotate( trans ).values()
            };

            collisions.push(collision);
        } else {
            // otherwise, find the point of biggest overlap, and push along the
            // normal there.
            for (x = aabb.x - aabb.hw; x <= aabb.x + aabb.hw; x++) {
                y = bounds.max.y - terrainHeight(x);
                dir.set( x - body.state.pos.x, y - body.state.pos.y).negate();
                dir.rotateInv( trans.setRotation( body.state.angular.pos ) );
                body.geometry.getFarthestHullPoint(dir, result).rotate(trans);
                if (result.norm() > dir.norm() && overlap < result.norm() - dir.norm()) {
                    // there is an actual collision, and this is the deepest
                    // overlap we've seen so far
                    collisionX = x;
                    overlap = result.norm() - dir.norm();
                }
            }

            if ( overlap >= 0 ) {
                // whoo copypasta
                x = collisionX;
                y = bounds.max.y - terrainHeight(x);
                dir.set( x - body.state.pos.x, y - body.state.pos.y);
                dir.rotateInv( trans.setRotation( body.state.angular.pos ) );
                body.geometry.getFarthestHullPoint(dir, result).rotate(trans);

                collision = {
                    bodyA: body,
                    bodyB: dummy,
                    overlap: overlap,
                    pos: result.values(),
                    norm: dir.rotate(trans).normalize().values(),
                    mtv: dir.mult(overlap).values(),
                };

                collisions.push(collision);
            }
        }

        // left
        overlap = bounds.min.x - (aabb.x - aabb.hw);

        if ( overlap >= 0 ){

            dir.set( -1, 0 ).rotateInv( trans.setRotation( body.state.angular.pos ) );

            collision = {
                bodyA: body,
                bodyB: dummy,
                overlap: overlap,
                norm: {
                    x: -1,
                    y: 0
                },
                mtv: {
                    x: -overlap,
                    y: 0
                },
                pos: body.geometry.getFarthestHullPoint( dir, result ).rotate( trans ).values()
            };

            collisions.push(collision);
        }

        // top
        overlap = bounds.min.y - (aabb.y - aabb.hh);

        if ( overlap >= 0 ){

            dir.set( 0, -1 ).rotateInv( trans.setRotation( body.state.angular.pos ) );

            collision = {
                bodyA: body,
                bodyB: dummy,
                overlap: overlap,
                norm: {
                    x: 0,
                    y: -1
                },
                mtv: {
                    x: 0,
                    y: -overlap
                },
                pos: body.geometry.getFarthestHullPoint( dir, result ).rotate( trans ).values()
            };

            collisions.push(collision);
        }

        scratch.done();
        return collisions;
    };

    /*
     * checkEdgeCollide( body, bounds, dummy ) -> Array
     * - body (Body): The body to check
     * - bounds (Physics.aabb): The boundary
     * - dummy: (Body): The dummy body to publish as the static other body it collides with
     * + (Array): The collision data
     *
     * Check if a body collides with the boundary
     */
    var checkEdgeCollide = function checkEdgeCollide( body, bounds, terrainHeight, dummy ){

        return checkGeneral( body, bounds, terrainHeight, dummy );
    };

    var defaults = {

        edges: {
            aabb: null,
            terrainHeight: function (x) {return 0;},
        },
        restitution: 0.99,
        cof: 1.0,
        channel: 'collisions:detected'
    };

    return {

        // extended
        init: function( options ){

            parent.init.call( this );
            this.options.defaults( defaults );
            this.options( options );

            this.setAABB( this.options.aabb );
            this.restitution = this.options.restitution;

            this.body = Physics.body('point', {
                treatment: 'static',
                restitution: this.options.restitution,
                cof: this.options.cof
            });
        },

        /**
         * EdgeCollisionDetectionBehavior#setAABB( aabb ) -> this
         * - aabb (Physics.aabb): The aabb to use as the boundary
         *
         * Set the boundaries of the edge.
         **/
        setAABB: function( aabb ){

            if (!aabb) {
                throw 'Error: aabb not set';
            }

            this._edges = {
                min: {
                    x: (aabb.x - aabb.hw),
                    y: (aabb.y - aabb.hh)
                },
                max: {
                    x: (aabb.x + aabb.hw),
                    y: (aabb.y + aabb.hh)
                }
            };

            return this;
        },

        // extended
        connect: function( world ){

            world.on( 'integrate:velocities', this.checkAll, this );
        },

        // extended
        disconnect: function( world ){

            world.off( 'integrate:velocities', this.checkAll );
        },

        /** internal
         * EdgeCollisionDetectionBehavior#checkAll( data )
         * - data (Object): Event data
         *
         * Event callback to check all bodies for collisions with the edge
         **/
        checkAll: function( data ){

            var bodies = this.getTargets()
                ,dt = data.dt
                ,body
                ,collisions = []
                ,ret
                ,bounds = this._edges
                ,terrainHeight = _.memoize(this.options.terrainHeight)
                ,dummy = this.body
                ;

            for ( var i = 0, l = bodies.length; i < l; i++ ){

                body = bodies[ i ];

                // only detect dynamic bodies
                if ( body.treatment === 'dynamic' ){

                    ret = checkEdgeCollide( body, bounds, terrainHeight, dummy );

                    if ( ret ){
                        collisions.push.apply( collisions, ret );
                    }
                }
            }

            if ( collisions.length ){

                this._world.emit( this.options.channel, {
                    collisions: collisions
                });
            }
        }
    };

};

},{}],25:[function(require,module,exports){

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


},{"./base":2,"./graph":10}],26:[function(require,module,exports){
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

},{}],27:[function(require,module,exports){

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

},{"./lib":12}]},{},[27])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi91c3IvbG9jYWwvbGliL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMva2hhbmFjYWRlbXkvaGFja2F0aG9uL2Jha2hhbi9saWIvYXN0ZXJvaWRzLmpzIiwiL1VzZXJzL2toYW5hY2FkZW15L2hhY2thdGhvbi9iYWtoYW4vbGliL2Jhc2UuanMiLCIvVXNlcnMva2hhbmFjYWRlbXkvaGFja2F0aG9uL2Jha2hhbi9saWIvY2FuZ3JhcGguanMiLCIvVXNlcnMva2hhbmFjYWRlbXkvaGFja2F0aG9uL2Jha2hhbi9saWIvY2F2ZWRyYXcuanMiLCIvVXNlcnMva2hhbmFjYWRlbXkvaGFja2F0aG9uL2Jha2hhbi9saWIvY2hlY2stY29sbGlzaW9uLmpzIiwiL1VzZXJzL2toYW5hY2FkZW15L2hhY2thdGhvbi9iYWtoYW4vbGliL2RlbW8uanMiLCIvVXNlcnMva2hhbmFjYWRlbXkvaGFja2F0aG9uL2Jha2hhbi9saWIvZHJvcC5qcyIsIi9Vc2Vycy9raGFuYWNhZGVteS9oYWNrYXRob24vYmFraGFuL2xpYi9kcm9wZGF0YWNoZWNrZXIuanN4IiwiL1VzZXJzL2toYW5hY2FkZW15L2hhY2thdGhvbi9iYWtoYW4vbGliL2dhdGUuanMiLCIvVXNlcnMva2hhbmFjYWRlbXkvaGFja2F0aG9uL2Jha2hhbi9saWIvZ3JhcGguanMiLCIvVXNlcnMva2hhbmFjYWRlbXkvaGFja2F0aG9uL2Jha2hhbi9saWIvaGlsbHMuanMiLCIvVXNlcnMva2hhbmFjYWRlbXkvaGFja2F0aG9uL2Jha2hhbi9saWIvaW5kZXguanMiLCIvVXNlcnMva2hhbmFjYWRlbXkvaGFja2F0aG9uL2Jha2hhbi9saWIvaW50cm8vZHJvcF9pbnRyby5qc3giLCIvVXNlcnMva2hhbmFjYWRlbXkvaGFja2F0aG9uL2Jha2hhbi9saWIvaW50cm8vbmV3dG9uMV9pbnRyby5qc3giLCIvVXNlcnMva2hhbmFjYWRlbXkvaGFja2F0aG9uL2Jha2hhbi9saWIvaW50cm8vc3RlcC5qc3giLCIvVXNlcnMva2hhbmFjYWRlbXkvaGFja2F0aG9uL2Jha2hhbi9saWIvaW50cm8vd2Fsay10aHJvdWdoLmpzeCIsIi9Vc2Vycy9raGFuYWNhZGVteS9oYWNrYXRob24vYmFraGFuL2xpYi9sb2dib29rLmpzIiwiL1VzZXJzL2toYW5hY2FkZW15L2hhY2thdGhvbi9iYWtoYW4vbGliL21vb24uanMiLCIvVXNlcnMva2hhbmFjYWRlbXkvaGFja2F0aG9uL2Jha2hhbi9saWIvbmV3dG9uMS5qcyIsIi9Vc2Vycy9raGFuYWNhZGVteS9oYWNrYXRob24vYmFraGFuL2xpYi9vcmJpdC5qcyIsIi9Vc2Vycy9raGFuYWNhZGVteS9oYWNrYXRob24vYmFraGFuL2xpYi9wbGF5cGF1c2UuanMiLCIvVXNlcnMva2hhbmFjYWRlbXkvaGFja2F0aG9uL2Jha2hhbi9saWIvc2xvcGUuanMiLCIvVXNlcnMva2hhbmFjYWRlbXkvaGFja2F0aG9uL2Jha2hhbi9saWIvc3RvcHdhdGNoLmpzIiwiL1VzZXJzL2toYW5hY2FkZW15L2hhY2thdGhvbi9iYWtoYW4vbGliL3RlcnJhaW4uanMiLCIvVXNlcnMva2hhbmFjYWRlbXkvaGFja2F0aG9uL2Jha2hhbi9saWIvdHJ5LWdyYXBoLmpzIiwiL1VzZXJzL2toYW5hY2FkZW15L2hhY2thdGhvbi9iYWtoYW4vbGliL3V0aWwuanMiLCIvVXNlcnMva2hhbmFjYWRlbXkvaGFja2F0aG9uL2Jha2hhbi9ydW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0UEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0U0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgR2F0ZSA9IHJlcXVpcmUoJy4vZ2F0ZScpO1xudmFyIEJhc2UgPSByZXF1aXJlKCcuL2Jhc2UnKTtcbnZhciBTdG9wd2F0Y2ggPSByZXF1aXJlKCcuL3N0b3B3YXRjaCcpO1xudmFyIFBsYXlQYXVzZSA9IHJlcXVpcmUoJy4vcGxheXBhdXNlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gQmFzZS5leHRlbmQoZnVuY3Rpb24gQXN0ZXJvaWRzKGNvbnRhaW5lciwgb3B0aW9ucykge1xuICAgIEJhc2UuY2FsbCh0aGlzLCBjb250YWluZXIsIG9wdGlvbnMsICdpbWFnZXMvc3BhY2VfYmFja2dyb3VuZC5qcGcnKVxufSwge1xuICAgIHNldHVwOiBmdW5jdGlvbiAoY29udGFpbmVyKSB7XG4gICAgICAgIHZhciB3b3JsZCA9IHRoaXMud29ybGQ7XG4gICAgICAgIHdvcmxkLmFkZChQaHlzaWNzLmJvZHkoJ2NpcmNsZScsIHtcbiAgICAgICAgICAgIHg6IDQwMFxuICAgICAgICAgICAgLHk6IDM1MFxuICAgICAgICAgICAgLHZ4OiAtMS4zLzUwXG4gICAgICAgICAgICAscmFkaXVzOiAxMFxuICAgICAgICAgICAgLG1hc3M6IDEwMDBcbiAgICAgICAgICAgICxyZXN0aXR1dGlvbjogMFxuICAgICAgICAgICAgLHN0eWxlczoge1xuICAgICAgICAgICAgICAgIGZpbGxTdHlsZTogJyNmZmNjMDAnXG4gICAgICAgICAgICAgICAgLGFuZ2xlSW5kaWNhdG9yOiAnIzE1NTQ3OSdcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkpO1xuICAgICAgICB3b3JsZC5hZGQoUGh5c2ljcy5ib2R5KCdjaXJjbGUnLCB7XG4gICAgICAgICAgICB4OiA0MDBcbiAgICAgICAgICAgICx5OiA1MFxuICAgICAgICAgICAgLHZ4OiAxLjNcbiAgICAgICAgICAgICxyYWRpdXM6IDVcbiAgICAgICAgICAgICxtYXNzOiAyMFxuICAgICAgICAgICAgLHJlc3RpdHV0aW9uOiAwXG4gICAgICAgICAgICAsc3R5bGVzOiB7XG4gICAgICAgICAgICAgICAgZmlsbFN0eWxlOiAnIzI2ZWI2MicgLy9ncmVlblxuICAgICAgICAgICAgICAgICxhbmdsZUluZGljYXRvcjogJyMxNTU0NzknXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pKTtcbiAgICAgICAgd29ybGQuYWRkKFBoeXNpY3MuYmVoYXZpb3IoJ25ld3RvbmlhbicsIHsgc3RyZW5ndGg6IC41IH0pKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCAxMDA7IGkrKykge1xuICAgICAgICAgICAgdmFyIHIgPSBNYXRoLnJhbmRvbSgpICogMTAgKyAyOTU7XG4gICAgICAgICAgICB2YXIgdGggPSAoLTEvNiAtIDAuMDA1ICsgTWF0aC5yYW5kb20oKSAqIDAuMDEpICogTWF0aC5QSTtcbiAgICAgICAgICAgIHdvcmxkLmFkZChQaHlzaWNzLmJvZHkoJ2NpcmNsZScsIHtcbiAgICAgICAgICAgICAgICB4OiBNYXRoLmNvcyh0aCkgKiByICsgNDAwXG4gICAgICAgICAgICAgICAgLHk6IE1hdGguc2luKHRoKSAqIHIgKyAzNTBcbiAgICAgICAgICAgICAgICAsdng6IC0xLjMgKiBNYXRoLnNpbih0aClcbiAgICAgICAgICAgICAgICAsdnk6IDEuMyAqIE1hdGguY29zKHRoKVxuICAgICAgICAgICAgICAgICxyYWRpdXM6IDJcbiAgICAgICAgICAgICAgICAsbWFzczogTWF0aC5wb3coMTAsIE1hdGgucmFuZG9tKCkgKiAyKSAqIDAuMDAwMDFcbiAgICAgICAgICAgICAgICAscmVzdGl0dXRpb246IDBcbiAgICAgICAgICAgICAgICAsc3R5bGVzOiB7XG4gICAgICAgICAgICAgICAgICAgIGZpbGxTdHlsZTogJyNkZDIyMjInIC8vcmVkXG4gICAgICAgICAgICAgICAgICAgICxhbmdsZUluZGljYXRvcjogJyMxNTU0NzknXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGJ1dHRvbkNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChidXR0b25Db250YWluZXIpO1xuICAgICAgICB2YXIgcGxheVBhdXNlID0gbmV3IFBsYXlQYXVzZSh3b3JsZCwgYnV0dG9uQ29udGFpbmVyKTtcbiAgICB9XG59KTtcblxuICAgICAgICBcbiIsIlxubW9kdWxlLmV4cG9ydHMgPSBCYXNlO1xuXG5mdW5jdGlvbiBCYXNlKGNvbnRhaW5lciwgb3B0aW9ucywgYmFja2dyb3VuZCwgZGlzYWJsZUJvdW5kcykge1xuICAgIHRoaXMuY29udGFpbmVyID0gY29udGFpbmVyXG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9uc1xuICAgICQoJy5iYWNrZ3JvdW5kJykuYXR0cignc3JjJywgYmFja2dyb3VuZCk7XG4gICAgdGhpcy5fc2V0dXBXb3JsZChkaXNhYmxlQm91bmRzKVxuICAgIHRoaXMuc2V0dXAoY29udGFpbmVyKVxuICAgIC8vIGluaXQgc3R1ZmZcbn1cblxuQmFzZS5leHRlbmQgPSBmdW5jdGlvbiAoc3ViLCBwcm90bykge1xuICAgIHN1Yi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEJhc2UucHJvdG90eXBlKVxuICAgIHN1Yi5jb25zdHJ1Y3RvciA9IHN1YlxuICAgIGZvciAodmFyIG5hbWUgaW4gcHJvdG8pIHtcbiAgICAgICAgaWYgKHByb3RvLmhhc093blByb3BlcnR5KG5hbWUpKSB7XG4gICAgICAgICAgICBzdWIucHJvdG90eXBlW25hbWVdID0gcHJvdG9bbmFtZV1cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gc3ViXG59XG5cbkJhc2UucHJvdG90eXBlID0ge1xuXG4gICAgX3NldHVwV29ybGQ6IGZ1bmN0aW9uIChkaXNhYmxlQm91bmRzKSB7XG4gICAgICAgIHZhciB3b3JsZCA9IHRoaXMud29ybGQgPSBQaHlzaWNzKClcbiAgICAgICAgLy8gY3JlYXRlIGEgcmVuZGVyZXJcbiAgICAgICAgdGhpcy5yZW5kZXJlciA9IFBoeXNpY3MucmVuZGVyZXIoJ2NhbnZhcycsIHtcbiAgICAgICAgICAgIGVsOiB0aGlzLmNvbnRhaW5lcixcbiAgICAgICAgICAgIHdpZHRoOiB0aGlzLm9wdGlvbnMud2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQ6IHRoaXMub3B0aW9ucy5oZWlnaHRcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMud29ybGQuYWRkKHRoaXMucmVuZGVyZXIpO1xuXG4gICAgICAgIC8vIGFkZCB0aGluZ3MgdG8gdGhlIHdvcmxkXG4gICAgICAgIHRoaXMud29ybGQuYWRkKFtcbiAgICAgICAgICAgIFBoeXNpY3MuYmVoYXZpb3IoJ2ludGVyYWN0aXZlLWZvcmNlJywgeyBlbDogdGhpcy5yZW5kZXJlci5lbCB9KSxcbiAgICAgICAgICAgIFBoeXNpY3MuYmVoYXZpb3IoJ2JvZHktaW1wdWxzZS1yZXNwb25zZScpLFxuICAgICAgICAgICAgUGh5c2ljcy5iZWhhdmlvcignYm9keS1jb2xsaXNpb24tZGV0ZWN0aW9uJyksXG4gICAgICAgICAgICBQaHlzaWNzLmJlaGF2aW9yKCdzd2VlcC1wcnVuZScpLFxuICAgICAgICBdKTtcblxuICAgICAgICBpZiAoIWRpc2FibGVCb3VuZHMpIHtcbiAgICAgICAgICAgIHRoaXMud29ybGQuYWRkKFBoeXNpY3MuYmVoYXZpb3IoJ2VkZ2UtY29sbGlzaW9uLWRldGVjdGlvbicsIHtcbiAgICAgICAgICAgICAgICBhYWJiOiBQaHlzaWNzLmFhYmIoMCwgMCwgdGhpcy5vcHRpb25zLndpZHRoLCB0aGlzLm9wdGlvbnMuaGVpZ2h0KSxcbiAgICAgICAgICAgICAgICByZXN0aXR1dGlvbjogMC4yLFxuICAgICAgICAgICAgICAgIGNvZjogMC44XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH1cblxuXG4gICAgICAgIC8vIHJlbmRlciBvbiBlYWNoIHN0ZXBcbiAgICAgICAgd29ybGQub24oJ3N0ZXAnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB3b3JsZC5yZW5kZXIoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gc3Vic2NyaWJlIHRvIHRpY2tlciB0byBhZHZhbmNlIHRoZSBzaW11bGF0aW9uXG4gICAgICAgIFBoeXNpY3MudXRpbC50aWNrZXIub24oZnVuY3Rpb24oIHRpbWUgKSB7XG4gICAgICAgICAgICB3b3JsZC5zdGVwKCB0aW1lICk7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBydW46IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8gc3RhcnQgdGhlIHRpY2tlclxuICAgICAgICBQaHlzaWNzLnV0aWwudGlja2VyLnN0YXJ0KCk7XG4gICAgfVxufVxuIiwiXG5tb2R1bGUuZXhwb3J0cyA9IENhbkdyYXBoXG5cbmZ1bmN0aW9uIENhbkdyYXBoKG9wdGlvbnMpIHtcbiAgICB0aGlzLm8gPSBfLmV4dGVuZCh7XG4gICAgICAgIG1heDogNTAwLFxuICAgICAgICBtYXJnaW46IDEwLFxuICAgICAgICBtaW5zY2FsZTogMSxcbiAgICAgICAgdGlja3NjYWxlOiA1MFxuICAgIH0sIG9wdGlvbnMpXG4gICAgdGhpcy5wb2ludHMgPSBbXVxuICAgIHRoaXMucHJldnNjYWxlID0gdGhpcy5vLm1pbnNjYWxlXG4gICAgdGhpcy5vZmYgPSAwXG59XG5cbkNhbkdyYXBoLnByb3RvdHlwZSA9IHtcbiAgICBkcmF3OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICghdGhpcy5wb2ludHMubGVuZ3RoKSByZXR1cm5cbiAgICAgICAgdmFyIGN0eCA9IHRoaXMuby5ub2RlLmdldENvbnRleHQoJzJkJylcbiAgICAgICAgdmFyIHdpZHRoID0gdGhpcy5vLndpZHRoIC0gdGhpcy5vLm1hcmdpbioyXG4gICAgICAgIHZhciBoZWlnaHQgPSB0aGlzLm8uaGVpZ2h0IC0gdGhpcy5vLm1hcmdpbioyXG4gICAgICAgIHZhciB0b3AgPSB0aGlzLm8udG9wICsgdGhpcy5vLm1hcmdpblxuICAgICAgICB2YXIgbGVmdCA9IHRoaXMuby5sZWZ0ICsgdGhpcy5vLm1hcmdpblxuXG4gICAgICAgIHZhciBkeCA9IHdpZHRoIC8gdGhpcy5wb2ludHMubGVuZ3RoXG4gICAgICAgIHZhciBtaW4gPSBNYXRoLm1pbi5hcHBseShNYXRoLCB0aGlzLnBvaW50cylcbiAgICAgICAgdmFyIG1heCA9IE1hdGgubWF4LmFwcGx5KE1hdGgsIHRoaXMucG9pbnRzKVxuICAgICAgICB2YXIgc2NhbGUgPSBtYXggLSBtaW5cbiAgICAgICAgaWYgKHNjYWxlIDwgdGhpcy5vLm1pbnNjYWxlKSB7XG4gICAgICAgICAgICBzY2FsZSA9IHRoaXMuby5taW5zY2FsZVxuICAgICAgICB9XG4gICAgICAgIGlmIChzY2FsZSA8IHRoaXMucHJldnNjYWxlKi45OSkge1xuICAgICAgICAgICAgc2NhbGUgPSB0aGlzLnByZXZzY2FsZSouOTlcbiAgICAgICAgfVxuICAgICAgICB2YXIgZHkgPSBoZWlnaHQgLyBzY2FsZVxuICAgICAgICBpZiAobWF4IC0gbWluIDwgc2NhbGUpIHtcbiAgICAgICAgICAgIHZhciBkID0gc2NhbGUgLSAobWF4LW1pbilcbiAgICAgICAgICAgIG1pbiAtPSBkLzJcbiAgICAgICAgICAgIG1heCArPSBkLzJcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMucHJldnNjYWxlID0gc2NhbGVcblxuICAgICAgICAvLyBkcmF3IHggYXhpc1xuICAgICAgICBpZiAobWluIDw9IDAgJiYgbWF4ID49IDApIHtcbiAgICAgICAgICAgIGN0eC5iZWdpblBhdGgoKVxuICAgICAgICAgICAgY3R4Lm1vdmVUbyhsZWZ0LCB0b3AgKyBoZWlnaHQgLSAoLW1pbikqZHkpXG4gICAgICAgICAgICBjdHgubGluZVRvKGxlZnQgKyB3aWR0aCwgdG9wICsgaGVpZ2h0IC0gKC1taW4pKmR5KVxuICAgICAgICAgICAgY3R4LnN0cm9rZVN0eWxlID0gJyNjY2MnXG4gICAgICAgICAgICBjdHguc3Ryb2tlKClcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGRyYXcgdGlja3NcbiAgICAgICAgdmFyIHRpY2t0b3AgPSB0b3AgKyBoZWlnaHQgLSAoLW1pbikqZHkgLSA1XG4gICAgICAgIGlmICh0aWNrdG9wIDwgdG9wKSB7XG4gICAgICAgICAgICB0aWNrdG9wID0gdG9wXG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRpY2t0b3AgKyAxMCA+IHRvcCArIGhlaWdodCkge1xuICAgICAgICAgICAgdGlja3RvcCA9IHRvcCArIGhlaWdodCAtIDEwXG4gICAgICAgIH1cbiAgICAgICAgZm9yICh2YXIgaT10aGlzLm9mZjsgaTx0aGlzLnBvaW50cy5sZW5ndGg7IGkrPXRoaXMuby50aWNrc2NhbGUpIHtcbiAgICAgICAgICAgIGN0eC5iZWdpblBhdGgoKVxuICAgICAgICAgICAgY3R4Lm1vdmVUbyhsZWZ0ICsgaSpkeCwgdGlja3RvcClcbiAgICAgICAgICAgIGN0eC5saW5lVG8obGVmdCArIGkqZHgsIHRpY2t0b3AgKyAxMClcbiAgICAgICAgICAgIGN0eC5zdHJva2VTdHlsZSA9ICcjY2NjJ1xuICAgICAgICAgICAgY3R4LnN0cm9rZSgpXG4gICAgICAgIH1cblxuXG4gICAgICAgIC8vIGRyYXcgbGluZVxuICAgICAgICBjdHguYmVnaW5QYXRoKClcbiAgICAgICAgdGhpcy5wb2ludHMubWFwKGZ1bmN0aW9uIChwLCB4KSB7XG4gICAgICAgICAgICBjdHgubGluZVRvKGxlZnQgKyB4ICogZHgsIHRvcCArIGhlaWdodCAtIChwIC0gbWluKSAqIGR5KVxuICAgICAgICB9KVxuICAgICAgICBjdHguc3Ryb2tlU3R5bGUgPSAnYmx1ZSdcbiAgICAgICAgY3R4LmxpbmVXaWR0aCA9IDFcbiAgICAgICAgY3R4LnN0cm9rZSgpXG5cbiAgICAgICAgLy8gZHJhdyB0aXRsZVxuICAgICAgICB2YXIgdGggPSAxMFxuICAgICAgICBjdHguZm9udCA9IHRoICsgJ3B0IEFyaWFsJ1xuICAgICAgICB2YXIgdHcgPSBjdHgubWVhc3VyZVRleHQodGhpcy5vLnRpdGxlKS53aWR0aFxuICAgICAgICBjdHguZmlsbFN0eWxlID0gJ2JsYWNrJ1xuICAgICAgICBjdHguZ2xvYmFsQWxwaGEgPSAxXG4gICAgICAgIGN0eC5jbGVhclJlY3QobGVmdCwgdG9wLCB0dywgdGggKyA1KVxuICAgICAgICBjdHguZmlsbFRleHQodGhpcy5vLnRpdGxlLCBsZWZ0LCB0b3AgKyB0aClcblxuXG4gICAgICAgIC8vIGRyYXcgcmVjdFxuICAgICAgICBjdHguc3Ryb2tlU3R5bGUgPSAnIzY2NidcbiAgICAgICAgY3R4LnJlY3QodGhpcy5vLmxlZnQgKyB0aGlzLm8ubWFyZ2luLzIsdGhpcy5vLnRvcCArIHRoaXMuby5tYXJnaW4vMix0aGlzLm8ud2lkdGggLSB0aGlzLm8ubWFyZ2luLHRoaXMuby5oZWlnaHQgLSB0aGlzLm8ubWFyZ2luKVxuICAgICAgICBjdHguc3Ryb2tlKClcbiAgICB9LFxuICAgIGFkZFBvaW50OiBmdW5jdGlvbiAocG9pbnQpIHtcbiAgICAgICAgdGhpcy5wb2ludHMucHVzaChwb2ludClcbiAgICAgICAgaWYgKHRoaXMucG9pbnRzLmxlbmd0aCA+IHRoaXMuby5tYXgpIHtcbiAgICAgICAgICAgIHRoaXMub2ZmIC09IHRoaXMucG9pbnRzLmxlbmd0aCAtIHRoaXMuby5tYXhcbiAgICAgICAgICAgIHRoaXMub2ZmICU9IHRoaXMuby50aWNrc2NhbGVcbiAgICAgICAgICAgIHRoaXMucG9pbnRzID0gdGhpcy5wb2ludHMuc2xpY2UoLXRoaXMuby5tYXgpXG4gICAgICAgIH1cbiAgICB9XG59XG5cbiIsIm1vZHVsZS5leHBvcnRzID0gQ2F2ZURyYXc7XG5cbmZ1bmN0aW9uIENhdmVEcmF3KGNvbnRhaW5lciwgd2lkdGgsIGhlaWdodCkge1xuICAgIHRoaXMuY29udGFpbmVyID0gJChjb250YWluZXIpXG4gICAgdGhpcy5jYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKVxuICAgIHRoaXMuY2FudmFzLndpZHRoID0gd2lkdGhcbiAgICB0aGlzLmNhbnZhcy5oZWlnaHQgPSBoZWlnaHRcbiAgICBjb250YWluZXIuYXBwZW5kKHRoaXMuY2FudmFzKVxufVxuXG5DYXZlRHJhdy5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKGZuKSB7XG4gICAgZGVmaW5lUGF0aCh0aGlzLmNhbnZhcywgZm4pXG4gICAgZHJhd1BhdGgodGhpcy5jYW52YXMpXG59XG5cbkNhdmVEcmF3LnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBjb250ZXh0ID0gdGhpcy5jYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICBjb250ZXh0LmNsZWFyUmVjdCgwLCAwLCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KVxufVxuXG5mdW5jdGlvbiBkZWZpbmVQYXRoKGNhbnZhcywgZm4pIHtcbiAgICB2YXIgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgIHZhciB4bWF4ID0gY2FudmFzLndpZHRoXG4gICAgdmFyIHltYXggPSBjYW52YXMuaGVpZ2h0XG5cbiAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgIGNvbnRleHQubW92ZVRvKDAsIGZuKDApKTtcbiAgICBmb3IgKHZhciB4ID0gMDsgeCA8IHhtYXggOyB4KyspIHtcbiAgICAgICAgY29udGV4dC5saW5lVG8oeCwgeW1heCAtIGZuKHgpKVxuICAgIH1cblxuICAgIGNvbnRleHQubGluZVRvKHhtYXgsIHltYXgpXG4gICAgY29udGV4dC5saW5lVG8oMCwgeW1heClcbiAgICBjb250ZXh0LmNsb3NlUGF0aCgpO1xufVxuXG5mdW5jdGlvbiBkcmF3UGF0aChjYW52YXMpIHtcbiAgICB2YXIgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgIGNvbnRleHQubGluZVdpZHRoID0gNTtcbiAgICAvLyBjb250ZXh0LmZpbGxTdHlsZSA9ICcjOEVENkZGJztcbiAgICB2YXIgZ3JkID0gY29udGV4dC5jcmVhdGVMaW5lYXJHcmFkaWVudChjYW52YXMud2lkdGggLyAyLCAwLCBjYW52YXMud2lkdGggLyAyLCBjYW52YXMuaGVpZ2h0KVxuICAgIGdyZC5hZGRDb2xvclN0b3AoMCwgJyMwMDAnKVxuICAgIGdyZC5hZGRDb2xvclN0b3AoMSwgJyM3NzcnKVxuICAgIGNvbnRleHQuZmlsbFN0eWxlID0gZ3JkO1xuICAgIC8vIGNvbnRleHQuZmlsbFN0eWxlID0gJyMzMzMnO1xuICAgIGNvbnRleHQuZmlsbCgpO1xuICAgIC8vIGNvbnRleHQuc3Ryb2tlU3R5bGUgPSAnYmx1ZSc7XG4gICAgLy8gY29udGV4dC5zdHJva2UoKTtcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gY2hlY2tDb2xsaXNpb247XG5cbmZ1bmN0aW9uIGNoZWNrQ29sbGlzaW9uKGJvZHlBLCBib2R5Qikge1xuICAgIHZhciBzdXBwb3J0Rm5TdGFjayA9IFtdO1xuXG4gICAgLypcbiAgICAgKiBnZXRTdXBwb3J0Rm4oIGJvZHlBLCBib2R5QiApIC0+IEZ1bmN0aW9uXG4gICAgICogLSBib2R5QSAoT2JqZWN0KTogRmlyc3QgYm9keVxuICAgICAqIC0gYm9keUIgKE9iamVjdCk6IFNlY29uZCBib2R5XG4gICAgICogKyAoRnVuY3Rpb24pOiBUaGUgc3VwcG9ydCBmdW5jdGlvblxuICAgICAqXG4gICAgICogR2V0IGEgZ2VuZXJhbCBzdXBwb3J0IGZ1bmN0aW9uIGZvciB1c2Ugd2l0aCBHSksgYWxnb3JpdGhtXG4gICAgICovXG4gICAgdmFyIGdldFN1cHBvcnRGbiA9IGZ1bmN0aW9uIGdldFN1cHBvcnRGbiggYm9keUEsIGJvZHlCICl7XG5cbiAgICAgICAgdmFyIGhhc2ggPSBQaHlzaWNzLnV0aWwucGFpckhhc2goIGJvZHlBLnVpZCwgYm9keUIudWlkIClcbiAgICAgICAgdmFyIGZuID0gc3VwcG9ydEZuU3RhY2tbIGhhc2ggXVxuXG4gICAgICAgIGlmICggIWZuICl7XG4gICAgICAgICAgICBmbiA9IHN1cHBvcnRGblN0YWNrWyBoYXNoIF0gPSBmdW5jdGlvbiggc2VhcmNoRGlyICl7XG5cbiAgICAgICAgICAgICAgICB2YXIgc2NyYXRjaCA9IFBoeXNpY3Muc2NyYXRjaHBhZCgpXG4gICAgICAgICAgICAgICAgdmFyIHRBID0gZm4udEFcbiAgICAgICAgICAgICAgICB2YXIgdEIgPSBmbi50QlxuICAgICAgICAgICAgICAgIHZhciB2QSA9IHNjcmF0Y2gudmVjdG9yKClcbiAgICAgICAgICAgICAgICB2YXIgdkIgPSBzY3JhdGNoLnZlY3RvcigpXG4gICAgICAgICAgICAgICAgdmFyIG1hcmdpbkEgPSBmbi5tYXJnaW5BXG4gICAgICAgICAgICAgICAgdmFyIG1hcmdpbkIgPSBmbi5tYXJnaW5CXG4gICAgICAgICAgICAgICAgO1xuXG4gICAgICAgICAgICAgICAgaWYgKCBmbi51c2VDb3JlICl7XG4gICAgICAgICAgICAgICAgICAgIHZBID0gYm9keUEuZ2VvbWV0cnkuZ2V0RmFydGhlc3RDb3JlUG9pbnQoIHNlYXJjaERpci5yb3RhdGVJbnYoIHRBICksIHZBLCBtYXJnaW5BICkudHJhbnNmb3JtKCB0QSApO1xuICAgICAgICAgICAgICAgICAgICB2QiA9IGJvZHlCLmdlb21ldHJ5LmdldEZhcnRoZXN0Q29yZVBvaW50KCBzZWFyY2hEaXIucm90YXRlKCB0QSApLnJvdGF0ZUludiggdEIgKS5uZWdhdGUoKSwgdkIsIG1hcmdpbkIgKS50cmFuc2Zvcm0oIHRCICk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdkEgPSBib2R5QS5nZW9tZXRyeS5nZXRGYXJ0aGVzdEh1bGxQb2ludCggc2VhcmNoRGlyLnJvdGF0ZUludiggdEEgKSwgdkEgKS50cmFuc2Zvcm0oIHRBICk7XG4gICAgICAgICAgICAgICAgICAgIHZCID0gYm9keUIuZ2VvbWV0cnkuZ2V0RmFydGhlc3RIdWxsUG9pbnQoIHNlYXJjaERpci5yb3RhdGUoIHRBICkucm90YXRlSW52KCB0QiApLm5lZ2F0ZSgpLCB2QiApLnRyYW5zZm9ybSggdEIgKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBzZWFyY2hEaXIubmVnYXRlKCkucm90YXRlKCB0QiApO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHNjcmF0Y2guZG9uZSh7XG4gICAgICAgICAgICAgICAgICAgIGE6IHZBLnZhbHVlcygpLFxuICAgICAgICAgICAgICAgICAgICBiOiB2Qi52YWx1ZXMoKSxcbiAgICAgICAgICAgICAgICAgICAgcHQ6IHZBLnZzdWIoIHZCICkudmFsdWVzKClcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGZuLnRBID0gUGh5c2ljcy50cmFuc2Zvcm0oKTtcbiAgICAgICAgICAgIGZuLnRCID0gUGh5c2ljcy50cmFuc2Zvcm0oKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZuLnVzZUNvcmUgPSBmYWxzZTtcbiAgICAgICAgZm4ubWFyZ2luID0gMDtcbiAgICAgICAgZm4udEEuc2V0VHJhbnNsYXRpb24oIGJvZHlBLnN0YXRlLnBvcyApLnNldFJvdGF0aW9uKCBib2R5QS5zdGF0ZS5hbmd1bGFyLnBvcyApO1xuICAgICAgICBmbi50Qi5zZXRUcmFuc2xhdGlvbiggYm9keUIuc3RhdGUucG9zICkuc2V0Um90YXRpb24oIGJvZHlCLnN0YXRlLmFuZ3VsYXIucG9zICk7XG4gICAgICAgIGZuLmJvZHlBID0gYm9keUE7XG4gICAgICAgIGZuLmJvZHlCID0gYm9keUI7XG5cbiAgICAgICAgcmV0dXJuIGZuO1xuICAgIH07XG5cbiAgICAvKlxuICAgICAqIGNoZWNrR0pLKCBib2R5QSwgYm9keUIgKSAtPiBPYmplY3RcbiAgICAgKiAtIGJvZHlBIChPYmplY3QpOiBGaXJzdCBib2R5XG4gICAgICogLSBib2R5QiAoT2JqZWN0KTogU2Vjb25kIGJvZHlcbiAgICAgKiArIChPYmplY3QpOiBDb2xsaXNpb24gcmVzdWx0XG4gICAgICpcbiAgICAgKiBVc2UgR0pLIGFsZ29yaXRobSB0byBjaGVjayBhcmJpdHJhcnkgYm9kaWVzIGZvciBjb2xsaXNpb25zXG4gICAgICovXG4gICAgdmFyIGNoZWNrR0pLID0gZnVuY3Rpb24gY2hlY2tHSksoIGJvZHlBLCBib2R5QiApe1xuXG4gICAgICAgIHZhciBzY3JhdGNoID0gUGh5c2ljcy5zY3JhdGNocGFkKClcbiAgICAgICAgdmFyIGQgPSBzY3JhdGNoLnZlY3RvcigpXG4gICAgICAgIHZhciB0bXAgPSBzY3JhdGNoLnZlY3RvcigpXG4gICAgICAgICAgICAsb3ZlcmxhcFxuICAgICAgICB2YXIgcmVzdWx0XG4gICAgICAgIHZhciBzdXBwb3J0XG4gICAgICAgIHZhciBjb2xsaXNpb24gPSBmYWxzZVxuICAgICAgICB2YXIgYWFiYkEgPSBib2R5QS5hYWJiKClcbiAgICAgICAgICAgICxkaW1BID0gTWF0aC5taW4oIGFhYmJBLmh3LCBhYWJiQS5oaCApXG4gICAgICAgIHZhciBhYWJiQiA9IGJvZHlCLmFhYmIoKVxuICAgICAgICB2YXIgZGltQiA9IE1hdGgubWluKCBhYWJiQi5odywgYWFiYkIuaGggKVxuICAgICAgICA7XG5cbiAgICAgICAgLy8ganVzdCBjaGVjayB0aGUgb3ZlcmxhcCBmaXJzdFxuICAgICAgICBzdXBwb3J0ID0gZ2V0U3VwcG9ydEZuKCBib2R5QSwgYm9keUIgKTtcbiAgICAgICAgZC5jbG9uZSggYm9keUEuc3RhdGUucG9zICkudnN1YiggYm9keUIuc3RhdGUucG9zICk7XG4gICAgICAgIHJlc3VsdCA9IFBoeXNpY3MuZ2prKHN1cHBvcnQsIGQsIHRydWUpO1xuXG4gICAgICAgIGlmICggcmVzdWx0Lm92ZXJsYXAgKXtcblxuICAgICAgICAgICAgLy8gdGhlcmUgaXMgYSBjb2xsaXNpb24uIGxldCdzIGRvIG1vcmUgd29yay5cbiAgICAgICAgICAgIGNvbGxpc2lvbiA9IHtcbiAgICAgICAgICAgICAgICBib2R5QTogYm9keUEsXG4gICAgICAgICAgICAgICAgYm9keUI6IGJvZHlCXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAvLyBmaXJzdCBnZXQgdGhlIG1pbiBkaXN0YW5jZSBvZiBiZXR3ZWVuIGNvcmUgb2JqZWN0c1xuICAgICAgICAgICAgc3VwcG9ydC51c2VDb3JlID0gdHJ1ZTtcbiAgICAgICAgICAgIHN1cHBvcnQubWFyZ2luQSA9IDA7XG4gICAgICAgICAgICBzdXBwb3J0Lm1hcmdpbkIgPSAwO1xuXG4gICAgICAgICAgICB3aGlsZSAoIHJlc3VsdC5vdmVybGFwICYmIChzdXBwb3J0Lm1hcmdpbkEgPCBkaW1BIHx8IHN1cHBvcnQubWFyZ2luQiA8IGRpbUIpICl7XG4gICAgICAgICAgICAgICAgaWYgKCBzdXBwb3J0Lm1hcmdpbkEgPCBkaW1BICl7XG4gICAgICAgICAgICAgICAgICAgIHN1cHBvcnQubWFyZ2luQSArPSAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoIHN1cHBvcnQubWFyZ2luQiA8IGRpbUIgKXtcbiAgICAgICAgICAgICAgICAgICAgc3VwcG9ydC5tYXJnaW5CICs9IDE7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gUGh5c2ljcy5namsoc3VwcG9ydCwgZCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICggcmVzdWx0Lm92ZXJsYXAgfHwgcmVzdWx0Lm1heEl0ZXJhdGlvbnNSZWFjaGVkICl7XG4gICAgICAgICAgICAgICAgLy8gVGhpcyBpbXBsZW1lbnRhdGlvbiBjYW4ndCBkZWFsIHdpdGggYSBjb3JlIG92ZXJsYXAgeWV0XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNjcmF0Y2guZG9uZShmYWxzZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGNhbGMgb3ZlcmxhcFxuICAgICAgICAgICAgb3ZlcmxhcCA9IE1hdGgubWF4KDAsIChzdXBwb3J0Lm1hcmdpbkEgKyBzdXBwb3J0Lm1hcmdpbkIpIC0gcmVzdWx0LmRpc3RhbmNlKTtcbiAgICAgICAgICAgIGNvbGxpc2lvbi5vdmVybGFwID0gb3ZlcmxhcDtcbiAgICAgICAgICAgIC8vIEBUT0RPOiBmb3Igbm93LCBqdXN0IGxldCB0aGUgbm9ybWFsIGJlIHRoZSBtdHZcbiAgICAgICAgICAgIGNvbGxpc2lvbi5ub3JtID0gZC5jbG9uZSggcmVzdWx0LmNsb3Nlc3QuYiApLnZzdWIoIHRtcC5jbG9uZSggcmVzdWx0LmNsb3Nlc3QuYSApICkubm9ybWFsaXplKCkudmFsdWVzKCk7XG4gICAgICAgICAgICBjb2xsaXNpb24ubXR2ID0gZC5tdWx0KCBvdmVybGFwICkudmFsdWVzKCk7XG4gICAgICAgICAgICAvLyBnZXQgYSBjb3JyZXNwb25kaW5nIGh1bGwgcG9pbnQgZm9yIG9uZSBvZiB0aGUgY29yZSBwb2ludHMuLiByZWxhdGl2ZSB0byBib2R5IEFcbiAgICAgICAgICAgIGNvbGxpc2lvbi5wb3MgPSBkLmNsb25lKCBjb2xsaXNpb24ubm9ybSApLm11bHQoIHN1cHBvcnQubWFyZ2luICkudmFkZCggdG1wLmNsb25lKCByZXN1bHQuY2xvc2VzdC5hICkgKS52c3ViKCBib2R5QS5zdGF0ZS5wb3MgKS52YWx1ZXMoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBzY3JhdGNoLmRvbmUoIGNvbGxpc2lvbiApO1xuICAgIH07XG5cbiAgICAvKlxuICAgICAqIGNoZWNrQ2lyY2xlcyggYm9keUEsIGJvZHlCICkgLT4gT2JqZWN0XG4gICAgICogLSBib2R5QSAoT2JqZWN0KTogRmlyc3QgYm9keVxuICAgICAqIC0gYm9keUIgKE9iamVjdCk6IFNlY29uZCBib2R5XG4gICAgICogKyAoT2JqZWN0KTogQ29sbGlzaW9uIHJlc3VsdFxuICAgICAqXG4gICAgICogQ2hlY2sgdHdvIGNpcmNsZXMgZm9yIGNvbGxpc2lvbnMuXG4gICAgICovXG4gICAgdmFyIGNoZWNrQ2lyY2xlcyA9IGZ1bmN0aW9uIGNoZWNrQ2lyY2xlcyggYm9keUEsIGJvZHlCICl7XG5cbiAgICAgICAgdmFyIHNjcmF0Y2ggPSBQaHlzaWNzLnNjcmF0Y2hwYWQoKVxuICAgICAgICB2YXIgZCA9IHNjcmF0Y2gudmVjdG9yKClcbiAgICAgICAgdmFyIHRtcCA9IHNjcmF0Y2gudmVjdG9yKClcbiAgICAgICAgdmFyIG92ZXJsYXBcbiAgICAgICAgdmFyIGNvbGxpc2lvbiA9IGZhbHNlXG5cbiAgICAgICAgZC5jbG9uZSggYm9keUIuc3RhdGUucG9zICkudnN1YiggYm9keUEuc3RhdGUucG9zICk7XG4gICAgICAgIG92ZXJsYXAgPSBkLm5vcm0oKSAtIChib2R5QS5nZW9tZXRyeS5yYWRpdXMgKyBib2R5Qi5nZW9tZXRyeS5yYWRpdXMpO1xuXG4gICAgICAgIC8vIGhtbS4uLiB0aGV5IG92ZXJsYXAgZXhhY3RseS4uLiBjaG9vc2UgYSBkaXJlY3Rpb25cbiAgICAgICAgaWYgKCBkLmVxdWFscyggUGh5c2ljcy52ZWN0b3IuemVybyApICl7XG5cbiAgICAgICAgICAgIGQuc2V0KCAxLCAwICk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBpZiAoIG92ZXJsYXAgPiAwICl7XG4gICAgICAgIC8vICAgICAvLyBjaGVjayB0aGUgZnV0dXJlXG4gICAgICAgIC8vICAgICBkLnZhZGQoIHRtcC5jbG9uZShib2R5Qi5zdGF0ZS52ZWwpLm11bHQoIGR0ICkgKS52c3ViKCB0bXAuY2xvbmUoYm9keUEuc3RhdGUudmVsKS5tdWx0KCBkdCApICk7XG4gICAgICAgIC8vICAgICBvdmVybGFwID0gZC5ub3JtKCkgLSAoYm9keUEuZ2VvbWV0cnkucmFkaXVzICsgYm9keUIuZ2VvbWV0cnkucmFkaXVzKTtcbiAgICAgICAgLy8gfVxuXG4gICAgICAgIGlmICggb3ZlcmxhcCA8PSAwICl7XG5cbiAgICAgICAgICAgIGNvbGxpc2lvbiA9IHtcbiAgICAgICAgICAgICAgICBib2R5QTogYm9keUEsXG4gICAgICAgICAgICAgICAgYm9keUI6IGJvZHlCLFxuICAgICAgICAgICAgICAgIG5vcm06IGQubm9ybWFsaXplKCkudmFsdWVzKCksXG4gICAgICAgICAgICAgICAgbXR2OiBkLm11bHQoIC1vdmVybGFwICkudmFsdWVzKCksXG4gICAgICAgICAgICAgICAgcG9zOiBkLm5vcm1hbGl6ZSgpLm11bHQoIGJvZHlBLmdlb21ldHJ5LnJhZGl1cyApLnZhbHVlcygpLFxuICAgICAgICAgICAgICAgIG92ZXJsYXA6IC1vdmVybGFwXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHNjcmF0Y2guZG9uZSggY29sbGlzaW9uICk7XG4gICAgfTtcblxuICAgIC8qXG4gICAgICogY2hlY2tQYWlyKCBib2R5QSwgYm9keUIgKSAtPiBPYmplY3RcbiAgICAgKiAtIGJvZHlBIChPYmplY3QpOiBGaXJzdCBib2R5XG4gICAgICogLSBib2R5QiAoT2JqZWN0KTogU2Vjb25kIGJvZHlcbiAgICAgKiArIChPYmplY3QpOiBDb2xsaXNpb24gcmVzdWx0XG4gICAgICpcbiAgICAgKiBDaGVjayBhIHBhaXIgZm9yIGNvbGxpc2lvbnNcbiAgICAgKi9cbiAgICB2YXIgY2hlY2tQYWlyID0gZnVuY3Rpb24gY2hlY2tQYWlyKCBib2R5QSwgYm9keUIgKXtcblxuICAgICAgICAvLyBmaWx0ZXIgb3V0IGJvZGllcyB0aGF0IGRvbid0IGNvbGxpZGUgd2l0aCBlYWNoIG90aGVyXG4gICAgICAgIGlmIChcbiAgICAgICAgICAgICggYm9keUEudHJlYXRtZW50ID09PSAnc3RhdGljJyB8fCBib2R5QS50cmVhdG1lbnQgPT09ICdraW5lbWF0aWMnICkgJiZcbiAgICAgICAgICAgICAgICAoIGJvZHlCLnRyZWF0bWVudCA9PT0gJ3N0YXRpYycgfHwgYm9keUIudHJlYXRtZW50ID09PSAna2luZW1hdGljJyApXG4gICAgICAgICl7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIGJvZHlBLmdlb21ldHJ5Lm5hbWUgPT09ICdjaXJjbGUnICYmIGJvZHlCLmdlb21ldHJ5Lm5hbWUgPT09ICdjaXJjbGUnICl7XG5cbiAgICAgICAgICAgIHJldHVybiBjaGVja0NpcmNsZXMoIGJvZHlBLCBib2R5QiApO1xuXG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgIHJldHVybiBjaGVja0dKSyggYm9keUEsIGJvZHlCICk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIGNoZWNrUGFpcihib2R5QSwgYm9keUIpXG59XG5cbiIsInZhciBHcmFwaCA9IHJlcXVpcmUoJy4vZ3JhcGgnKVxudmFyIEdhdGUgPSByZXF1aXJlKCcuL2dhdGUnKTtcbnZhciBCYXNlID0gcmVxdWlyZSgnLi9iYXNlJyk7XG52YXIgU3RvcHdhdGNoID0gcmVxdWlyZSgnLi9zdG9wd2F0Y2gnKTtcbnZhciBQbGF5UGF1c2UgPSByZXF1aXJlKCcuL3BsYXlwYXVzZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2UuZXh0ZW5kKGZ1bmN0aW9uIERlbW8oY29udGFpbmVyLCBvcHRpb25zKSB7XG4gICAgQmFzZS5jYWxsKHRoaXMsIGNvbnRhaW5lciwgb3B0aW9ucywgJ2ltYWdlcy9sYWJfYmFja2dyb3VuZC5qcGcnKVxufSwge1xuICAgIGRyb3BJbkJvZHk6IGZ1bmN0aW9uIChyYWRpdXMsIHksIGNvbG9yKSB7XG4gICAgICAgIGZ1bmN0aW9uIHJhbmRvbShtaW4sIG1heCl7XG4gICAgICAgICAgICByZXR1cm4gKE1hdGgucmFuZG9tKCkgKiAobWF4LW1pbikgKyBtaW4pfDBcbiAgICAgICAgfVxuICAgICAgICB2YXIgYm9keSA9IFBoeXNpY3MuYm9keSgnY2lyY2xlJywge1xuICAgICAgICAgICAgeDogMTAwLFxuICAgICAgICAgICAgeTogeSxcbiAgICAgICAgICAgIHZ4OiByYW5kb20oLTUsIDUpLzEwMCxcbiAgICAgICAgICAgIHJhZGl1czogcmFkaXVzLFxuICAgICAgICAgICAgcmVzdGl0dXRpb246IDAuOSxcbiAgICAgICAgICAgIHN0eWxlczoge1xuICAgICAgICAgICAgICAgIGltYWdlOiBcImltYWdlcy90ZW5uaXNfYmFsbC5wbmdcIlxuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuXG4gICAgICAgIHRoaXMud29ybGQuYWRkKGJvZHkpO1xuICAgICAgICByZXR1cm4gYm9keTtcbiAgICB9LFxuICAgIHNldHVwOiBmdW5jdGlvbiAoY29udGFpbmVyKSB7XG4gICAgICAgIHZhciB3b3JsZCA9IHRoaXMud29ybGRcbiAgICAgICAgd29ybGQuYWRkKFBoeXNpY3MuYmVoYXZpb3IoJ2NvbnN0YW50LWFjY2VsZXJhdGlvbicpKTtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDU7IGkrKykge1xuICAgICAgICAgICAgdmFyIHJhZGl1cyA9IDIwICsgMTAgKiBpO1xuICAgICAgICAgICAgdGhpcy5kcm9wSW5Cb2R5KHJhZGl1cywgMzAwIC0gaSAqIDUwKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgY2lyY2xlID0gdGhpcy5kcm9wSW5Cb2R5KDQwLCAzMDAgKyAyMCwgJ3JlZCcpXG4gICAgICAgIHZhciBncmFwaCA9IG5ldyBHcmFwaCh0aGlzLmNvbnRhaW5lciwge1xuICAgICAgICAgICAgJ0NpcmNsZSc6IHtib2R5OiBjaXJjbGUsIGF0dHI6ICdwb3MueScsIHRpdGxlOidWZXJ0aWNhbCBQb3NpdGlvbicsIG1pbnNjYWxlOiA1fSxcbiAgICAgICAgICAgICdWZWxZJzoge2JvZHk6IGNpcmNsZSwgYXR0cjogJ3ZlbC55JywgdGl0bGU6J1ZlcnRpY2FsIFZlbG9jaXR5JywgbWluc2NhbGU6IC4xfSxcbiAgICAgICAgICAgICdBbmdQJzoge2JvZHk6IGNpcmNsZSwgYXR0cjogJ2FuZ3VsYXIucG9zJywgdGl0bGU6J1JvdGF0aW9uJywgbWluc2NhbGU6IC4wMDF9LFxuICAgICAgICAgICAgJ0FuZ1YnOiB7Ym9keTogY2lyY2xlLCBhdHRyOiAnYW5ndWxhci52ZWwnLCB0aXRsZTonUm90YXRpb25hbCBWZWxvY2l0eScsIG1pbnNjYWxlOiAuMDAxfSxcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgdG9wOiAxMCxcbiAgICAgICAgICAgIGxlZnQ6IHRoaXMub3B0aW9ucy53aWR0aCAtIDQwMCxcbiAgICAgICAgICAgIHdpZHRoOiA0MDAsXG4gICAgICAgICAgICB3b3JsZEhlaWdodDogdGhpcy5vcHRpb25zLmhlaWdodFxuICAgICAgICB9KVxuICAgICAgICB0aGlzLmdyYXBoID0gZ3JhcGhcblxuICAgICAgICB0aGlzLndvcmxkLm9uKCdzdGVwJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZ3JhcGgudXBkYXRlKHdvcmxkLnRpbWVzdGVwKCkpXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMud29ybGQuYWRkKFBoeXNpY3MuYm9keSgncmVjdGFuZ2xlJywge1xuICAgICAgICAgICAgeDogMjUwLFxuICAgICAgICAgICAgeTogNjAwLFxuICAgICAgICAgICAgd2lkdGg6IDUwLFxuICAgICAgICAgICAgaGVpZ2h0OiA0MDAsXG4gICAgICAgICAgICB0cmVhdG1lbnQ6ICdzdGF0aWMnLFxuICAgICAgICAgICAgc3R5bGVzOiB7XG4gICAgICAgICAgICAgICAgZmlsbFN0eWxlOiAnI2QzMzY4MicsXG4gICAgICAgICAgICAgICAgYW5nbGVJbmRpY2F0b3I6ICcjNzUxYjRiJ1xuICAgICAgICAgICAgfVxuICAgICAgICB9KSlcblxuICAgICAgICB2YXIgYnV0dG9uQ29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGJ1dHRvbkNvbnRhaW5lcik7XG4gICAgICAgIHZhciBwbGF5UGF1c2UgPSBuZXcgUGxheVBhdXNlKHdvcmxkLCBidXR0b25Db250YWluZXIpO1xuICAgICAgICBnYXRlUG9seWdvbiA9IFt7eDogMCwgeTogMzAwfSwge3g6IDcwMCwgeTogMzAwfSwge3g6IDcwMCwgeTogNDAwfSwge3g6IDAsIHk6IDQwMH1dO1xuICAgICAgICB2YXIgZ2F0ZSA9IG5ldyBHYXRlKHdvcmxkLCBnYXRlUG9seWdvbiwgWzM1MCwgNzAwXSwgbnVsbCwge2RlYnVnOiB0cnVlLCBzaG93OiB0cnVlfSk7XG4gICAgICAgIGdhdGUub24oJ2VudGVyJywgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgZ2F0ZS5zdG9wd2F0Y2hlcyA9IGdhdGUuc3RvcHdhdGNoZXMgfHwge31cbiAgICAgICAgICAgIHZhciBzdG9wd2F0Y2ggPSBuZXcgU3RvcHdhdGNoKHdvcmxkLCBidXR0b25Db250YWluZXIsIDEpO1xuICAgICAgICAgICAgc3RvcHdhdGNoLnJlc2V0KCk7XG4gICAgICAgICAgICBzdG9wd2F0Y2guc3RhcnQoKTtcbiAgICAgICAgICAgIGdhdGUuc3RvcHdhdGNoZXNbZGF0YS5ib2R5LnVpZF0gPSBzdG9wd2F0Y2g7XG4gICAgICAgIH0pO1xuICAgICAgICBnYXRlLm9uKCdleGl0JywgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgZ2F0ZS5zdG9wd2F0Y2hlc1tkYXRhLmJvZHkudWlkXS5zdG9wKClcbiAgICAgICAgfSk7XG4gICAgfVxufSk7XG5cbiIsInZhciBCYXNlID0gcmVxdWlyZSgnLi9iYXNlJyk7XG52YXIgR2F0ZSA9IHJlcXVpcmUoJy4vZ2F0ZScpO1xudmFyIFN0b3B3YXRjaCA9IHJlcXVpcmUoJy4vc3RvcHdhdGNoJyk7XG52YXIgTG9nQm9vayA9IHJlcXVpcmUoJy4vbG9nYm9vaycpO1xudmFyIFBsYXlQYXVzZSA9IHJlcXVpcmUoJy4vcGxheXBhdXNlJyk7XG52YXIgRHJvcEludHJvID0gcmVxdWlyZSgnLi9pbnRyby9kcm9wX2ludHJvLmpzeCcpO1xudmFyIERyb3BEYXRhQ2hlY2tlciA9IHJlcXVpcmUoJy4vZHJvcGRhdGFjaGVja2VyLmpzeCcpO1xudmFyIHV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcblxuZnVuY3Rpb24gcmFuZG9tKG1pbiwgbWF4KXtcbiAgICByZXR1cm4gKE1hdGgucmFuZG9tKCkgKiAobWF4LW1pbikgKyBtaW4pfDBcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBCYXNlLmV4dGVuZChmdW5jdGlvbiBEcm9wKGNvbnRhaW5lciwgb3B0aW9ucykge1xuICAgIEJhc2UuY2FsbCh0aGlzLCBjb250YWluZXIsIG9wdGlvbnMsIFwiaW1hZ2VzL2xhYl9iYWNrZ3JvdW5kLmpwZ1wiKVxufSwge1xuICAgIGRyb3BCb3dsaW5nQmFsbDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciByYWRpdXMgPSAzMDtcbiAgICAgICAgdGhpcy53b3JsZC5hZGQoUGh5c2ljcy5ib2R5KCdjaXJjbGUnLCB7XG4gICAgICAgICAgICB4OiA3MDAsXG4gICAgICAgICAgICB5OiAyMDAsXG4gICAgICAgICAgICB2eDogcmFuZG9tKC0zMCwgMzApLzEwMCxcbiAgICAgICAgICAgIHJhZGl1czogcmFkaXVzLFxuICAgICAgICAgICAgbWFzczogOTAwLFxuICAgICAgICAgICAgcmVzdGl0dXRpb246IDAuMDEsXG4gICAgICAgICAgICBjb2Y6IDAuNCxcbiAgICAgICAgICAgIHN0eWxlczoge1xuICAgICAgICAgICAgICAgIGltYWdlOiBcImltYWdlcy9ib3dsaW5nX2JhbGwucG5nXCJcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBkaXNwbGF5TmFtZTogJ0Jvd2xpbmcgQmFsbCcsXG4gICAgICAgIH0pKTtcbiAgICB9LFxuXG4gICAgZHJvcFRlbm5pc0JhbGw6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcmFkaXVzID0gMTU7XG4gICAgICAgIHZhciBiYWxsID0gUGh5c2ljcy5ib2R5KCdjaXJjbGUnLCB7XG4gICAgICAgICAgICB4OiA3MDAsXG4gICAgICAgICAgICB5OiAyMDAsXG4gICAgICAgICAgICB2eDogcmFuZG9tKC0zMCwgMzApLzEwMCxcbiAgICAgICAgICAgIHJhZGl1czogcmFkaXVzLFxuICAgICAgICAgICAgbWFzczogNy41LFxuICAgICAgICAgICAgcmVzdGl0dXRpb246IDEsXG4gICAgICAgICAgICBkaXNwbGF5TmFtZTogJ1Rlbm5pcyBCYWxsJyxcbiAgICAgICAgICAgIHN0eWxlczoge1xuICAgICAgICAgICAgICAgIGltYWdlOiBcImltYWdlcy90ZW5uaXNfYmFsbC5wbmdcIlxuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuXG4gICAgICAgIGlmICghdGhpcy5maXJzdFRlbm5pc0JhbGwpIHtcbiAgICAgICAgICAgIHRoaXMuZmlyc3RUZW5uaXNCYWxsID0gYmFsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMud29ybGQuYWRkKGJhbGwpO1xuICAgIH0sXG5cbiAgICBkZXBsb3lCYWxsczogZnVuY3Rpb24ob25Eb25lKSB7XG4gICAgICAgIHZhciBzcGFjaW5nX21zID0gODAwO1xuICAgICAgICB2YXIgcXVldWUgPSBbXG4gICAgICAgICAgICB0aGlzLmRyb3BUZW5uaXNCYWxsLmJpbmQodGhpcyksXG4gICAgICAgICAgICB0aGlzLmRyb3BUZW5uaXNCYWxsLmJpbmQodGhpcyksXG4gICAgICAgICAgICB0aGlzLmRyb3BCb3dsaW5nQmFsbC5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgdGhpcy5kcm9wVGVubmlzQmFsbC5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgdGhpcy5kcm9wVGVubmlzQmFsbC5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgdGhpcy5kcm9wQm93bGluZ0JhbGwuYmluZCh0aGlzKSxcbiAgICAgICAgICAgIG9uRG9uZVxuICAgICAgICBdO1xuICAgICAgICBfLnJlZHVjZShxdWV1ZSwgZnVuY3Rpb24odCwgYWN0aW9uKSB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KGFjdGlvbiwgdClcbiAgICAgICAgICAgIHJldHVybiB0ICsgc3BhY2luZ19tc1xuICAgICAgICB9LCAwKVxuXG4gICAgICAgIC8vIHNldFRpbWVvdXQodGhpcy5kcm9wVGVubmlzQmFsbC5iaW5kKHRoaXMpLCAwKVxuICAgICAgICAvLyBzZXRUaW1lb3V0KHRoaXMuZHJvcFRlbm5pc0JhbGwuYmluZCh0aGlzKSwgMTAwKVxuICAgICAgICAvLyBzZXRUaW1lb3V0KHRoaXMuZHJvcFRlbm5pc0JhbGwuYmluZCh0aGlzKSwgMjAwKVxuICAgIH0sXG5cbiAgICBzdGFydFdhbGt0aHJvdWdoOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIERyb3BJbnRybyh0aGlzLCBmdW5jdGlvbiAoaHlwb3RoZXNpcykge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ0dvdCB0aGUgaHlwb3RoZXNpcyEhJywgaHlwb3RoZXNpcyk7XG4gICAgICAgICAgICB0aGlzLnNldHVwRGF0YUNoZWNrZXIoaHlwb3RoZXNpcyk7XG4gICAgICAgIH0uYmluZCh0aGlzKSlcbiAgICB9LFxuXG4gICAgc2V0dXBEYXRhQ2hlY2tlcjogZnVuY3Rpb24gKGh5cG90aGVzaXMpIHtcbiAgICAgICAgdmFyIGRhdGFDaGVja2VyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgZGF0YUNoZWNrZXIuY2xhc3NOYW1lID0gXCJkcm9wLWRhdGEtY2hlY2tlclwiO1xuICAgICAgICB0aGlzLnNpZGVCYXIuYXBwZW5kQ2hpbGQoZGF0YUNoZWNrZXIpO1xuICAgICAgICBSZWFjdC5yZW5kZXJDb21wb25lbnQoRHJvcERhdGFDaGVja2VyKHtcbiAgICAgICAgICAgIGluaXRpYWxIeXBvdGhlc2lzOiBoeXBvdGhlc2lzLFxuICAgICAgICAgICAgbG9nQm9vazogdGhpcy5sb2dCb29rLFxuICAgICAgICAgICAgd29ybGQ6IHRoaXMud29ybGRcbiAgICAgICAgfSksIGRhdGFDaGVja2VyKTtcbiAgICB9LFxuXG4gICAgc2V0dXA6IGZ1bmN0aW9uIChjb250YWluZXIpIHtcbiAgICAgICAgdmFyIHdvcmxkID0gdGhpcy53b3JsZFxuICAgICAgICB2YXIgZ3Jhdml0eSA9IFBoeXNpY3MuYmVoYXZpb3IoJ2NvbnN0YW50LWFjY2VsZXJhdGlvbicpXG4gICAgICAgIGdyYXZpdHkuc2V0QWNjZWxlcmF0aW9uKHt4OiAwLCB5Oi4wMDAzfSk7XG4gICAgICAgIHdvcmxkLmFkZChncmF2aXR5KTtcblxuICAgICAgICAvLyBTaHVudCB0cmlhbmdsZVxuICAgICAgICB0aGlzLndvcmxkLmFkZChQaHlzaWNzLmJvZHkoJ3JlY3RhbmdsZScsIHtcbiAgICAgICAgICAgIHg6IDYwLFxuICAgICAgICAgICAgeTogNjkwLFxuICAgICAgICAgICAgd2lkdGg6IDUwMCxcbiAgICAgICAgICAgIGhlaWdodDogMTAwLFxuICAgICAgICAgICAgYW5nbGU6IE1hdGguUEkgLyA0LFxuICAgICAgICAgICAgdHJlYXRtZW50OiAnc3RhdGljJyxcbiAgICAgICAgICAgIGNvZjogMSxcbiAgICAgICAgICAgIHN0eWxlczoge1xuICAgICAgICAgICAgICAgIGZpbGxTdHlsZTogJyNkMzM2ODInLFxuICAgICAgICAgICAgfVxuICAgICAgICB9KSk7XG5cbiAgICAgICAgdmFyIHNpZGVCYXIgPSB0aGlzLnNpZGVCYXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICBzaWRlQmFyLmNsYXNzTmFtZSA9IFwic2lkZS1iYXJcIjtcbiAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKHNpZGVCYXIpO1xuICAgICAgICB2YXIgdG9wR2F0ZSA9IG5ldyBHYXRlKHdvcmxkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHV0aWwubWFrZVJlY3QoMCwgMCwgMjAwLCAxMCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgWzEyMCwgMjAwXSwgbnVsbCwge2RlYnVnOiB0cnVlLCBzaG93OiB0cnVlLCBjb2xvcjogJ2dyZWVuJ30pO1xuICAgICAgICB2YXIgYm90dG9tR2F0ZSA9IG5ldyBHYXRlKHdvcmxkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHV0aWwubWFrZVJlY3QoMCwgMCwgMjAwLCAxMCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgWzEyMCwgNTUwXSwgbnVsbCwge2RlYnVnOiB0cnVlLCBzaG93OiB0cnVlLCBjb2xvcjogJ3JlZCd9KTtcbiAgICAgICAgdmFyIGxvZ0NvbHVtbnMgPSBbXG4gICAgICAgICAgICB7bmFtZTogXCJCb3dsaW5nIEJhbGxcIiwgZXh0cmFUZXh0OiBcIiAoNyBrZylcIn0sXG4gICAgICAgICAgICB7bmFtZTogXCJUZW5uaXMgQmFsbFwiLCBleHRyYVRleHQ6IFwiICg1OCBnKVwiLCBjb2xvcjogJ3JnYigxNTQsIDI0MSwgMCknfVxuICAgICAgICBdO1xuICAgICAgICB2YXIgbG9nQm9vayA9IHRoaXMubG9nQm9vayA9IG5ldyBMb2dCb29rKHdvcmxkLCBzaWRlQmFyLCA1LCBsb2dDb2x1bW5zKTtcbiAgICAgICAgdG9wR2F0ZS5vbignZW50ZXInLCBmdW5jdGlvbihlbGVtKSB7XG4gICAgICAgICAgICB2YXIgY29sTmFtZSA9IGVsZW0uYm9keS5kaXNwbGF5TmFtZSB8fCBlbGVtLmJvZHkubmFtZSB8fCBcImJvZHlcIjtcbiAgICAgICAgICAgIGxvZ0Jvb2suaGFuZGxlU3RhcnQoY29sTmFtZSwgZWxlbS5ib2R5LnVpZCk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICAgIGJvdHRvbUdhdGUub24oJ2VudGVyJywgZnVuY3Rpb24oZWxlbSkge1xuICAgICAgICAgICAgdmFyIGNvbE5hbWUgPSBlbGVtLmJvZHkuZGlzcGxheU5hbWUgfHwgZWxlbS5ib2R5Lm5hbWUgfHwgXCJib2R5XCI7XG4gICAgICAgICAgICBsb2dCb29rLmhhbmRsZUVuZChjb2xOYW1lLCBlbGVtLmJvZHkudWlkKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdmFyIGJ1dHRvbkNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgIHZhciBwbGF5UGF1c2UgPSBuZXcgUGxheVBhdXNlKHdvcmxkLCBidXR0b25Db250YWluZXIpO1xuICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoYnV0dG9uQ29udGFpbmVyKTtcblxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLndhbGspIHtcbiAgICAgICAgICAgIHRoaXMuc3RhcnRXYWxrdGhyb3VnaCgpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBBZGQgdGhlIGJhbGxzLlxuICAgICAgICAgICAgc2V0VGltZW91dCh0aGlzLmRlcGxveUJhbGxzLmJpbmQodGhpcyksIDUwMClcbiAgICAgICAgICAgIHRoaXMuc2V0dXBEYXRhQ2hlY2tlcignc2FtZScpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFBpY2sgdXAgb25lIG9mIHRoZSB0ZW5uaXMgYmFsbHMgYW5kIGRyb3AgaXQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gY2FsbGJhY2sgR2V0cyBjYWxsZWQgd2hlbiB0aGUgZGVtb25zdHJhdGlvbiBpcyBvdmVyLlxuICAgICAqL1xuICAgIGRlbW9uc3RyYXRlRHJvcDogZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIGJhbGwgPSB0aGlzLmZpcnN0VGVubmlzQmFsbDtcbiAgICAgICAgdmFyIHRhcmdldFggPSAxMjU7XG4gICAgICAgIHZhciB0YXJnZXRZID0gMTcwO1xuXG4gICAgICAgIGJhbGwudHJlYXRtZW50ID0gJ2tpbmVtYXRpYyc7XG4gICAgICAgIGJhbGwuc3RhdGUudmVsLnggPSAodGFyZ2V0WCAtIGJhbGwuc3RhdGUucG9zLngpIC8gMTUwMDtcbiAgICAgICAgYmFsbC5zdGF0ZS52ZWwueSA9ICh0YXJnZXRZIC0gYmFsbC5zdGF0ZS5wb3MueSkgLyAxNTAwO1xuICAgICAgICBiYWxsLnJlY2FsYygpO1xuXG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBiYWxsLnRyZWF0bWVudCA9ICdzdGF0aWMnO1xuICAgICAgICAgICAgYmFsbC5zdGF0ZS5wb3MueCA9IHRhcmdldFg7XG4gICAgICAgICAgICBiYWxsLnN0YXRlLnBvcy55ID0gdGFyZ2V0WTtcbiAgICAgICAgICAgIGJhbGwuc3RhdGUudmVsLnggPSAwO1xuICAgICAgICAgICAgYmFsbC5zdGF0ZS52ZWwueSA9IDA7XG4gICAgICAgICAgICBiYWxsLnJlY2FsYygpO1xuXG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGJhbGwudHJlYXRtZW50ID0gJ2R5bmFtaWMnO1xuICAgICAgICAgICAgICAgIGJhbGwucmVjYWxjKCk7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICAgICAgICB9LCAzMDAwKVxuICAgICAgICAgICAgfSwgMTUwMClcbiAgICAgICAgfSwgMTUwMClcbiAgICB9XG59KTtcbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xuXG52YXIgRHJvcERhdGFDaGVja2VyID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnRHJvcERhdGFDaGVja2VyJyxcbiAgICAvLyBwcm9wczogbG9nQm9vaywgd29ybGRcbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHRoaXNSZXN1bHQ6IFwiRG8gYW4gZXhwZXJpbWVudCB0byBzZWUgaWYgeW91IGNhbiBmaWd1cmUgb3V0IHdoaWNoIGJhbGwgZmFsbHMgZmFzdGVyLCBhbmQgbGV0IG1lIGtub3cgd2hlbiB5b3UncmUgZG9uZSFcIixcbiAgICAgICAgICAgIHByZXZSZXN1bHQ6ICcnLFxuICAgICAgICAgICAgaHlwb3RoZXNpczogdGhpcy5wcm9wcy5pbml0aWFsSHlwb3RoZXNpcywgLy8gd2lsbCBldmVudHVhbGx5IGJlIHNldCB3aGVuIHRoZXkgZmluaXNoIHRoZSB3YWxrdGhyb3VnaC4gIGl0IGNhbiBiZSBcImJvd2xpbmdcIiwgXCJ0ZW5uaXNcIiwgb3IgXCJzYW1lXCJcbiAgICAgICAgICAgIGRpc3Byb3ZlbjogZmFsc2UsXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgcHJldHR5SHlwb3RoZXNpcyA9IFJlYWN0LkRPTS5wKHtjbGFzc05hbWU6IFwiY2hlY2tlcl95b3VyLWh5cG9cIn0sIFJlYWN0LkRPTS5lbShudWxsLCBcIllvdXIgaHlwb3RoZXNpcyB3YXMgXCIsIHRoaXMucHJldHR5SHlwb3RoZXNpcygpLCBcIi5cIikpO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5kaXNwcm92ZW4pIHtcbiAgICAgICAgICAgIHZhciBib3dsaW5nQnV0dG9uID0gUmVhY3QuRE9NLmJ1dHRvbih7Y2xhc3NOYW1lOiBcImJ0biBidG4tZGVmYXVsdFwiLCBvbkNsaWNrOiB0aGlzLmJvd2xpbmd9LCBcIlRoZSBib3dsaW5nIGJhbGwgZmFsbHMgZmFzdGVyLlwiKVxuICAgICAgICAgICAgdmFyIHRlbm5pc0J1dHRvbiA9IFJlYWN0LkRPTS5idXR0b24oe2NsYXNzTmFtZTogXCJidG4gYnRuLWRlZmF1bHRcIiwgb25DbGljazogdGhpcy50ZW5uaXN9LCBcIlRoZSB0ZW5uaXMgYmFsbCBmYWxscyBmYXN0ZXIuXCIpXG4gICAgICAgICAgICB2YXIgc2FtZUJ1dHRvbiA9IFJlYWN0LkRPTS5idXR0b24oe2NsYXNzTmFtZTogXCJidG4gYnRuLWRlZmF1bHRcIiwgb25DbGljazogdGhpcy5zYW1lfSwgXCJCb3RoIGJhbGxzIGZhbGwgYXQgdGhlIHNhbWUgcmF0ZS5cIilcbiAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlLmh5cG90aGVzaXMgPT09ICdib3dsaW5nJykge1xuICAgICAgICAgICAgICAgIGJvd2xpbmdCdXR0b24gPSBSZWFjdC5ET00uZGl2KG51bGwpXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc3RhdGUuaHlwb3RoZXNpcyA9PT0gJ3Rlbm5pcycpIHtcbiAgICAgICAgICAgICAgICB0ZW5uaXNCdXR0b24gPSBSZWFjdC5ET00uZGl2KG51bGwpXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc3RhdGUuaHlwb3RoZXNpcyA9PT0gJ3NhbWUnKSB7XG4gICAgICAgICAgICAgICAgc2FtZUJ1dHRvbiA9IFJlYWN0LkRPTS5kaXYobnVsbClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwiY2hlY2tlclwifSwgXG4gICAgICAgICAgICAgICAgcHJldHR5SHlwb3RoZXNpcywgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmltZyh7c3JjOiBcIi9pbWFnZXMvc2lyLWZyYW5jaXMuanBlZ1wiLCBjbGFzc05hbWU6IFwiY2hlY2tlcl9mcmFuY2lzXCJ9KSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImNoZWNrZXJfbWFpblwifSwgXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5wKG51bGwsIFwiT2theSwgd2hpY2ggcmVzdWx0IGRvIHRoZXkgc3VwcG9ydD9cIiksIFxuICAgICAgICAgICAgICAgICAgICBib3dsaW5nQnV0dG9uLCB0ZW5uaXNCdXR0b24sIHNhbWVCdXR0b25cbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc3RhdGUudGhpc1Jlc3VsdCkge1xuICAgICAgICAgICAgcmV0dXJuIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJjaGVja2VyXCJ9LCBcbiAgICAgICAgICAgICAgICBwcmV0dHlIeXBvdGhlc2lzLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uaW1nKHtzcmM6IFwiL2ltYWdlcy9zaXItZnJhbmNpcy5qcGVnXCIsIGNsYXNzTmFtZTogXCJjaGVja2VyX2ZyYW5jaXNcIn0pLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwiY2hlY2tlcl9tYWluXCJ9LCBcbiAgICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLnAobnVsbCwgdGhpcy5zdGF0ZS50aGlzUmVzdWx0KSwgXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5idXR0b24oe2NsYXNzTmFtZTogXCJidG4gYnRuLWRlZmF1bHRcIiwgb25DbGljazogdGhpcy5zdXBwb3J0fSwgXCJUaGUgZGF0YSBzdXBwb3J0IG15IGh5cG90aGVzaXMuXCIpLCBcbiAgICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLmJ1dHRvbih7Y2xhc3NOYW1lOiBcImJ0biBidG4tZGVmYXVsdFwiLCBvbkNsaWNrOiB0aGlzLmRpc3Byb3ZlfSwgXCJUaGUgZGF0YSBkaXNwcm92ZSBteSBoeXBvdGhlc2lzLlwiKVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImNoZWNrZXJcIn0sIFxuICAgICAgICAgICAgICAgIHByZXR0eUh5cG90aGVzaXMsIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5pbWcoe3NyYzogXCIvaW1hZ2VzL3Npci1mcmFuY2lzLmpwZWdcIiwgY2xhc3NOYW1lOiBcImNoZWNrZXJfZnJhbmNpc1wifSksIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJjaGVja2VyX21haW5cIn0sIFxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5ET00ucChudWxsLCBcIllvdXIgZXhwZXJpbWVudCBsb29rcyBncmVhdCwgYW5kIEknbSBjb252aW5jZWQuICBIZXJlLCBoYXZlIHNvbWUgYmFjb24uXCIpXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBwcmV0dHlIeXBvdGhlc2lzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmh5cG90aGVzaXMgPT09IFwic2FtZVwiKSB7XG4gICAgICAgICAgICByZXR1cm4gXCJ0aGF0IGJvdGggYmFsbHMgd2lsbCBmYWxsIGF0IHRoZSBzYW1lIHJhdGVcIjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBcInRoYXQgdGhlIFwiK3RoaXMuc3RhdGUuaHlwb3RoZXNpcytcIiBiYWxsIHdpbGwgZmFsbCBmYXN0ZXJcIjtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICByZXN1bHQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8gd2UgcmV0dXJuIHRoZSBlcnJvciwgb3IgbnVsbCBpZiB0aGV5J3JlIGNvcnJlY3RcbiAgICAgICAgdmFyIGVub3VnaERhdGEgPSBfLmFsbCh0aGlzLnByb3BzLmxvZ0Jvb2suZGF0YSwgZnVuY3Rpb24gKGQpIHtyZXR1cm4gZC5sZW5ndGggPj0gNTt9KTtcbiAgICAgICAgaWYgKGVub3VnaERhdGEpIHtcbiAgICAgICAgICAgIHZhciBhdmdzID0ge31cbiAgICAgICAgICAgIHZhciBtYXhEZWx0YXMgPSB7fVxuICAgICAgICAgICAgZm9yICh2YXIgbmFtZSBpbiB0aGlzLnByb3BzLmxvZ0Jvb2suZGF0YSkge1xuICAgICAgICAgICAgICAgIGF2Z3NbbmFtZV0gPSBfLnJlZHVjZSh0aGlzLnByb3BzLmxvZ0Jvb2suZGF0YVtuYW1lXSxcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKGEsIGIpIHtyZXR1cm4gYSArIGI7fSkgLyB0aGlzLnByb3BzLmxvZ0Jvb2suZGF0YVtuYW1lXS5sZW5ndGg7XG4gICAgICAgICAgICAgICAgbWF4RGVsdGFzW25hbWVdID0gXy5tYXgoXy5tYXAodGhpcy5wcm9wcy5sb2dCb29rLmRhdGFbbmFtZV0sXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIChkYXR1bSkge3JldHVybiBNYXRoLmFicyhkYXR1bSAtIGF2Z3NbbmFtZV0pO30pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLmxvZyh0aGlzLnByb3BzLmxvZ0Jvb2suZGF0YSwgZW5vdWdoRGF0YSwgYXZncywgbWF4RGVsdGFzKTtcbiAgICAgICAgaWYgKCFlbm91Z2hEYXRhKSB7XG4gICAgICAgICAgICByZXR1cm4gXCJZb3UgaGF2ZW4ndCBmaWxsZWQgdXAgeW91ciBsYWIgbm90ZWJvb2shICBNYWtlIHN1cmUgeW91IGdldCBlbm91Z2ggZGF0YSBzbyB5b3Uga25vdyB5b3VyIHJlc3VsdHMgYXJlIGFjY3VyYXRlLlwiO1xuICAgICAgICB9IGVsc2UgaWYgKG1heERlbHRhc1tcIkJvd2xpbmcgQmFsbFwiXSA+IDMwMCkge1xuICAgICAgICAgICAgcmV0dXJuIFwiT25lIG9mIHlvdXIgcmVzdWx0cyBmb3IgdGhlIGJvd2xpbmcgYmFsbCBsb29rcyBwcmV0dHkgZmFyIG9mZiEgIFRyeSBnZXR0aW5nIHNvbWUgbW9yZSBkYXRhIHRvIG1ha2Ugc3VyZSBpdCB3YXMgYSBmbHVrZS5cIjtcbiAgICAgICAgfSBlbHNlIGlmIChtYXhEZWx0YXNbXCJUZW5uaXMgQmFsbFwiXSA+IDMwMCkge1xuICAgICAgICAgICAgcmV0dXJuIFwiT25lIG9mIHlvdXIgcmVzdWx0cyBmb3IgdGhlIHRlbm5pcyBiYWxsIGxvb2tzIHByZXR0eSBmYXIgb2ZmISAgVHJ5IGdldHRpbmcgc29tZSBtb3JlIGRhdGEgdG8gbWFrZSBzdXJlIGl0IHdhcyBhIGZsdWtlLlwiO1xuICAgICAgICB9IGVsc2UgaWYgKFxuICAgICAgICAgICAgICAgICh0aGlzLnN0YXRlLmh5cG90aGVzaXMgPT09IFwic2FtZVwiXG4gICAgICAgICAgICAgICAgICAgICYmIE1hdGguYWJzKGF2Z3NbXCJCb3dsaW5nIEJhbGxcIl0gLSBhdmdzW1wiVGVubmlzIEJhbGxcIl0pID4gMTAwKVxuICAgICAgICAgICAgICAgIHx8ICh0aGlzLnN0YXRlLmh5cG90aGVzaXMgPT09IFwiYm93bGluZ1wiXG4gICAgICAgICAgICAgICAgICAgICYmIGF2Z3NbXCJCb3dsaW5nIEJhbGxcIl0gPCBhdmdzW1wiVGVubmlzIEJhbGxcIl0gKyAxMDApXG4gICAgICAgICAgICAgICAgfHwgKHRoaXMuc3RhdGUuaHlwb3RoZXNpcyA9PT0gXCJ0ZW5uaXNcIlxuICAgICAgICAgICAgICAgICAgICAmJiBhdmdzW1wiVGVubmlzIEJhbGxcIl0gPCBhdmdzW1wiQm93bGluZyBCYWxsXCJdICsgMTAwKVxuICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgcmV0dXJuIFwiVGhvc2UgcmVzdWx0cyBkb24ndCBsb29rIHZlcnkgY29uc2lzdGVudCB3aXRoIHlvdXIgaHlwb3RoZXNpcy4gIEl0J3MgZmluZSBpZiB5b3VyIGh5cG90aGVzaXMgd2FzIGRpc3Byb3ZlbiwgdGhhdCdzIGhvdyBzY2llbmNlIHdvcmtzIVwiO1xuICAgICAgICB9IGVsc2UgaWYgKFxuICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUuaHlwb3RoZXNpcyAhPT0gXCJzYW1lXCJcbiAgICAgICAgICAgICAgICB8fCBhdmdzW1wiQm93bGluZyBCYWxsXCJdIDwgODAwXG4gICAgICAgICAgICAgICAgfHwgYXZnc1tcIkJvd2xpbmcgQmFsbFwiXSA+IDE1MDBcbiAgICAgICAgICAgICAgICB8fCBhdmdzW1wiVGVubmlzIEJhbGxcIl0gPCA4MDBcbiAgICAgICAgICAgICAgICB8fCBhdmdzW1wiVGVubmlzIEJhbGxcIl0gPiAxNTAwKSB7XG4gICAgICAgICAgICByZXR1cm4gXCJUaG9zZSByZXN1bHRzIGFyZSBjb25zaXN0ZW50LCBidXQgdGhleSBkb24ndCBsb29rIHF1aXRlIHJpZ2h0IHRvIG1lLiAgTWFrZSBzdXJlIHlvdSdyZSBkcm9wcGluZyB0aGUgYmFsbHMgZ2VudGx5IGZyb20gdGhlIHNhbWUgaGVpZ2h0IGFib3ZlIHRoZSB0b3Agc2Vuc29yLlwiO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgc3VwcG9ydDogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmFza0ZyYW5jaXMoKTtcbiAgICB9LFxuXG4gICAgZGlzcHJvdmU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBkaXNwcm92ZW46IHRydWUsXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBib3dsaW5nOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgZGlzcHJvdmVuOiBmYWxzZSxcbiAgICAgICAgICAgIGh5cG90aGVzaXM6IFwiYm93bGluZ1wiLFxuICAgICAgICB9LCB0aGlzLmFza0ZyYW5jaXMpO1xuICAgIH0sXG5cbiAgICB0ZW5uaXM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBkaXNwcm92ZW46IGZhbHNlLFxuICAgICAgICAgICAgaHlwb3RoZXNpczogXCJ0ZW5uaXNcIixcbiAgICAgICAgfSwgdGhpcy5hc2tGcmFuY2lzKTtcbiAgICB9LFxuXG4gICAgc2FtZTogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGRpc3Byb3ZlbjogZmFsc2UsXG4gICAgICAgICAgICBoeXBvdGhlc2lzOiBcInNhbWVcIixcbiAgICAgICAgfSwgdGhpcy5hc2tGcmFuY2lzKTtcbiAgICB9LFxuXG4gICAgYXNrRnJhbmNpczogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHRoaXNSZXN1bHQ6IHRoaXMucmVzdWx0KCksXG4gICAgICAgICAgICBwcmV2UmVzdWx0OiB0aGlzLnN0YXRlLnRoaXNSZXN1bHRcbiAgICAgICAgfSk7XG4gICAgfVxufSlcblxubW9kdWxlLmV4cG9ydHMgPSBEcm9wRGF0YUNoZWNrZXI7XG4iLCJ2YXIgU3RvcHdhdGNoID0gcmVxdWlyZSgnLi9zdG9wd2F0Y2gnKTtcbnZhciBjaGVja0NvbGxpc2lvbiA9IHJlcXVpcmUoJy4vY2hlY2stY29sbGlzaW9uJylcblxubW9kdWxlLmV4cG9ydHMgPSBHYXRlO1xuXG52YXIgRU5URVJfRkFERU9VVF9EVVJBVElPTiA9IDIwXG52YXIgRVhJVF9GQURFT1VUX0RVUkFUSU9OID0gMjBcblxuLyoqXG4gKiBPcHRpLXRoaW5neSBnYXRlLlxuICogRGV0ZWN0cyB3aGVuIGJvZGllcyBlbnRlciBhbmQgZXhpdCBhIHNwZWNpZmllZCBhcmVhLlxuICpcbiAqIHBvbHlnb24gLSBzaG91bGQgYmUgYSBsaXN0IG9mIHZlY3RvcmlzaCwgd2hpY2ggbXVzdCBiZSBjb252ZXguXG4gKiBib2R5IC0gc2hvdWxkIGJlIGEgYm9keSwgb3IgbnVsbCB0byB0cmFjayBhbGwgYm9kaWVzXG4gKiBvcHRzIC0ge2RlYnVnOiBmYWxzZX1cbiAqXG4gKiBVc2FnZSBFeGFtcGxlOlxuICogdmFyIGdhdGUgPSBuZXcgR2F0ZShhd2Vzb21lX3dvcmxkLCBjb250YWluZXJfZGl2LCBbe3g6IDAsIHk6IDMwMH0sIC4uLl0sIHtkZWJ1ZzogdHJ1ZX0pXG4gKiBnYXRlLm9uKCdleGl0JywgZnVuY3Rpb24oZGF0YSkge1xuICogICBjb25zb2xlLmxvZyhcIllvdSBlc2NhcGVkIG1lIGFnYWluISBJIHdpbGwgZmluZCB5b3UsIG9oIFwiLCBkYXRhLmJvZHkpO1xuICogfSlcbiAqL1xuZnVuY3Rpb24gR2F0ZSh3b3JsZCwgcG9seWdvbiwgcG9zLCBib2R5LCBvcHRzKSB7XG4gICAgb3B0cyA9IG9wdHMgfHwge307XG4gICAgdGhpcy53b3JsZCA9IHdvcmxkXG4gICAgdGhpcy5ib2R5ID0gYm9keTtcbiAgICAvLyBib2RpZXMgY3VycmVudGx5IGluc2lkZSB0aGlzIGdhdGUuXG4gICAgdGhpcy5jb250YWlucyA9IFtdXG4gICAgdGhpcy5fc3Vic2NyaWJlKClcbiAgICB0aGlzLnBvbHlnb24gPSBwb2x5Z29uXG4gICAgdGhpcy5jb2xsaXNpb25fYm9keSA9IFBoeXNpY3MuYm9keSgnY29udmV4LXBvbHlnb24nLCB7XG4gICAgICAgIHZlcnRpY2VzOiBwb2x5Z29uLFxuICAgICAgICB0cmVhdG1lbnQ6ICdtYWdpYycsXG4gICAgICAgIHg6IHBvc1swXSxcbiAgICAgICAgeTogcG9zWzFdLFxuICAgICAgICB2eDogMCxcbiAgICAgICAgYW5nbGU6IDAsXG4gICAgICAgIHJlc3RpdHV0aW9uOiAwLjksXG4gICAgICAgIHN0eWxlczoge1xuICAgICAgICAgICAgZmlsbFN0eWxlOiAnIzg1OTkwMCcsXG4gICAgICAgICAgICBhbmdsZUluZGljYXRvcjogJyM0MTQ3MDAnXG4gICAgICAgIH1cbiAgICB9KVxuICAgIHRoaXMubW92ZWRfcG9pbnRzID0gcG9seWdvbi5tYXAoZnVuY3Rpb24gKHApIHtcbiAgICAgICAgcmV0dXJuIHt4OiBwLnggKyBwb3NbMF0sIHk6IHAueSArIHBvc1sxXX1cbiAgICB9KTtcbiAgICB0aGlzLnZpZXcgPSB0aGlzLndvcmxkLnJlbmRlcmVyKCkuY3JlYXRlVmlldyh0aGlzLmNvbGxpc2lvbl9ib2R5Lmdlb21ldHJ5LCB7IHN0cm9rZVN0eWxlOiAnI2FhYScsIGxpbmVXaWR0aDogMiwgZmlsbFN0eWxlOiAncmdiYSgwLDAsMCwwKScgfSlcbiAgICAvLyB0aGlzLndvcmxkLmFkZCh0aGlzLmNvbGxpc2lvbl9ib2R5KVxuICAgIGlmIChvcHRzLmRlYnVnKSB0aGlzLnNwZWFrTG91ZGx5KCk7XG4gICAgdGhpcy5fY29sb3IgPSBvcHRzLmNvbG9yXG5cbiAgICB0aGlzLl9lbnRlcl9mYWRlb3V0ID0gMDtcbiAgICB0aGlzLl9leGl0X2ZhZGVvdXQgPSAwO1xufVxuXG5HYXRlLnByb3RvdHlwZS5fc3Vic2NyaWJlID0gZnVuY3Rpb24oKSB7XG4gICAgUGh5c2ljcy51dGlsLnRpY2tlci5vbihmdW5jdGlvbih0aW1lKSB7XG4gICAgICAgIGlmICh0aGlzLmJvZHkpIHtcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlQm9keSh0aGlzLmJvZHkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy53b3JsZC5nZXRCb2RpZXMoKS5mb3JFYWNoKHRoaXMuaGFuZGxlQm9keS5iaW5kKHRoaXMpKVxuICAgICAgICB9XG4gICAgfS5iaW5kKHRoaXMpKVxuXG4gICAgLy8gU3Vic2NyaWJlIHRvIHJlbmRlciBldmVudHNcbiAgICB0aGlzLndvcmxkLm9uKCdyZW5kZXInLCB0aGlzLl9yZW5kZXIuYmluZCh0aGlzKSk7XG5cbiAgICAvLyBTdWJzY3JpYmUgdG8gc2VsZi4gKHdIYVQ/KVxuICAgIHRoaXMub24oJ2VudGVyJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuX2VudGVyX2ZhZGVvdXQgPSBFTlRFUl9GQURFT1VUX0RVUkFUSU9OXG4gICAgfS5iaW5kKHRoaXMpKVxuICAgIHRoaXMub24oJ2V4aXQnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5fZXhpdF9mYWRlb3V0ID0gRVhJVF9GQURFT1VUX0RVUkFUSU9OXG4gICAgfS5iaW5kKHRoaXMpKVxufVxuXG5HYXRlLnByb3RvdHlwZS5fcmVuZGVyID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHIgPSB0aGlzLndvcmxkLnJlbmRlcmVyKCk7XG4gICAgdmFyIGFscGhhID0gdGhpcy5fZW50ZXJfZmFkZW91dCAvIEVOVEVSX0ZBREVPVVRfRFVSQVRJT05cbiAgICB2YXIgc3Ryb2tlU3R5bGVzID0ge1xuICAgICAgICBncmVlbjogJyMwYTAnLFxuICAgICAgICByZWQ6ICcjYTAwJyxcbiAgICAgICAgdW5kZWZpbmVkOiAnI2FhYScsXG4gICAgfVxuICAgIHZhciBmaWxsU3R5bGUgPSB7XG4gICAgICAgIGdyZWVuOiAncmdiYSg1MCwxMDAsNTAsJythbHBoYSsnKScsXG4gICAgICAgIHJlZDogJ3JnYmEoMTAwLDUwLDUwLCcrYWxwaGErJyknLFxuICAgICAgICB1bmRlZmluZWQ6ICdyZ2JhKDAsMCwwLCcrYWxwaGErJyknLFxuICAgIH1cbiAgICByLmRyYXdQb2x5Z29uKHRoaXMubW92ZWRfcG9pbnRzLCB7XG4gICAgICAgIHN0cm9rZVN0eWxlOiBzdHJva2VTdHlsZXNbdGhpcy5fY29sb3JdLFxuICAgICAgICBsaW5lV2lkdGg6IDIsXG4gICAgICAgIGZpbGxTdHlsZTogZmlsbFN0eWxlW3RoaXMuX2NvbG9yXSxcbiAgICB9KTtcblxuICAgIHRoaXMuX2VudGVyX2ZhZGVvdXQgPSBNYXRoLm1heCgwLCB0aGlzLl9lbnRlcl9mYWRlb3V0IC0gMSlcbiAgICB0aGlzLl9leGl0X2ZhZGVvdXQgPSBNYXRoLm1heCgwLCB0aGlzLl9leGl0X2ZhZGVvdXQgLSAxKVxufVxuXG5HYXRlLnByb3RvdHlwZS5oYW5kbGVCb2R5ID0gZnVuY3Rpb24oYm9keSkge1xuICAgIC8vIElnbm9yZSBib2RpZXMgYmVpbmcgZHJhZ2dlZC5cbiAgICBpZiAoYm9keS5kcmFnZ2luZykgcmV0dXJuO1xuXG4gICAgdmFyIHdhc0luID0gdGhpcy5jb250YWlucy5pbmRleE9mKGJvZHkpICE9IC0xXG4gICAgdmFyIGlzSW4gPSB0aGlzLnRlc3RCb2R5KGJvZHkpXG4gICAgaWYgKCF3YXNJbiAmJiBpc0luKSB7XG4gICAgICAgIHRoaXMuY29udGFpbnMucHVzaChib2R5KVxuICAgICAgICB0aGlzLmVtaXQoJ2VudGVyJywge2JvZHk6IGJvZHl9KVxuICAgIH1cbiAgICBpZiAod2FzSW4gJiYgIWlzSW4pIHtcbiAgICAgICAgdGhpcy5jb250YWlucyA9IF8ud2l0aG91dCh0aGlzLmNvbnRhaW5zLCBib2R5KTtcbiAgICAgICAgdGhpcy5lbWl0KCdleGl0Jywge2JvZHk6IGJvZHl9KVxuICAgIH1cbn1cblxuR2F0ZS5wcm90b3R5cGUudGVzdEJvZHkgPSBmdW5jdGlvbihib2R5KSB7XG4gICAgaWYgKCF3aW5kb3cuZGVidWcgJiYgYm9keS50cmVhdG1lbnQgIT09ICdkeW5hbWljJykge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiBjaGVja0NvbGxpc2lvbih0aGlzLmNvbGxpc2lvbl9ib2R5LCBib2R5KVxuICAgIC8vLyB2YXIgcG9zID0gYm9keS5zdGF0ZS5wb3NcbiAgICAvLy8gcmV0dXJuIHRoaXMudGVzdFBvaW50KHt4OiBwb3MueCwgeTogcG9zLnl9KVxufVxuXG5HYXRlLnByb3RvdHlwZS50ZXN0UG9pbnQgPSBmdW5jdGlvbih2ZWN0b3Jpc2gpIHtcbiAgICByZXR1cm4gUGh5c2ljcy5nZW9tZXRyeS5pc1BvaW50SW5Qb2x5Z29uKFxuICAgICAgICB2ZWN0b3Jpc2gsXG4gICAgICAgIHRoaXMucG9seWdvbik7XG59XG5cbi8vIEdhdGUucHJvdG90eXBlLnJ1blN0b3B3YXRjaCA9IGZ1bmN0aW9uKHN0b3B3YXRjaCkge1xuICAgIC8vIHRoaXMub24oJ2VudGVyJywgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAvLyBzdG9wd2F0Y2gucmVzZXQoKTtcbiAgICAgICAgLy8gc3RvcHdhdGNoLnN0YXJ0KCk7XG4gICAgLy8gfSk7XG4gICAgLy8gdGhpcy5vbignZXhpdCcsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgLy8gc3RvcHdhdGNoLnN0b3AoKTtcbiAgICAvLyB9KTtcbi8vIH1cblxuLyoqXG4gKiBEZWJ1Z2dpbmcgZnVuY3Rpb24gdG8gbGlzdGVuIHRvIG15IG93biBldmVudHMgYW5kIGNvbnNvbGUubG9nIHRoZW0uXG4gKi9cbkdhdGUucHJvdG90eXBlLnNwZWFrTG91ZGx5ID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5vbignZW50ZXInLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdlbnRlcicsIGRhdGEuYm9keSlcbiAgICB9KVxuICAgIHRoaXMub24oJ2V4aXQnLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdleGl0JywgZGF0YS5ib2R5KVxuICAgIH0pXG4gICAgcmV0dXJuIHtidXRDYXJyeUFCaWdTdGljazogJyd9XG59XG5cbl8uZXh0ZW5kKEdhdGUucHJvdG90eXBlLCBQaHlzaWNzLnV0aWwucHVic3ViLnByb3RvdHlwZSlcbiIsIlxudmFyIENhbkdyYXBoID0gcmVxdWlyZSgnLi9jYW5ncmFwaCcpXG5cbm1vZHVsZS5leHBvcnRzID0gR3JhcGhcblxuZnVuY3Rpb24gZ2V0RGF0dW0oaXRlbSkge1xuICAgIHJldHVybiBpdGVtLmF0dHIuc3BsaXQoJy4nKS5yZWR1Y2UoZnVuY3Rpb24gKG5vZGUsIGF0dHIpIHtcbiAgICAgICAgcmV0dXJuIG5vZGVbYXR0cl1cbiAgICB9LCBpdGVtLmJvZHkuc3RhdGUpXG59XG5cbmZ1bmN0aW9uIEdyYXBoKHBhcmVudCwgdHJhY2tpbmcsIG9wdGlvbnMpIHtcbiAgICB0aGlzLm8gPSBfLmV4dGVuZCh7XG4gICAgICAgIHRvcDogMTAsXG4gICAgICAgIGxlZnQ6IDEwLFxuICAgICAgICB3aWR0aDogNjAwLFxuICAgICAgICBoZWlnaHQ6IDQwMCxcbiAgICAgICAgd29ybGRIZWlnaHQ6IDIwMFxuICAgIH0sIG9wdGlvbnMpXG4gICAgdGhpcy50cmFja2luZyA9IHRyYWNraW5nXG4gICAgdGhpcy5kYXRhID0gW11cbiAgICB0aGlzLm5vZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKVxuICAgIHRoaXMubm9kZS5jbGFzc05hbWUgPSAnZ3JhcGgnXG4gICAgdGhpcy5ub2RlLndpZHRoID0gdGhpcy5vLndpZHRoXG4gICAgdGhpcy5ub2RlLmhlaWdodCA9IHRoaXMuby5oZWlnaHRcbiAgICB0aGlzLm5vZGUuc3R5bGUudG9wID0gdGhpcy5vLnRvcCArICdweCdcbiAgICB0aGlzLm5vZGUuc3R5bGUubGVmdCA9IHRoaXMuby5sZWZ0ICsgJ3B4J1xuICAgIHZhciBudW1ncmFwaHMgPSBPYmplY3Qua2V5cyh0cmFja2luZykubGVuZ3RoXG4gICAgdmFyIGdyYXBoaGVpZ2h0ID0gdGhpcy5vLmhlaWdodCAvIG51bWdyYXBoc1xuICAgIHBhcmVudC5hcHBlbmRDaGlsZCh0aGlzLm5vZGUpXG5cbiAgICB0aGlzLmdyYXBocyA9IHt9XG4gICAgdmFyIGkgPSAwXG4gICAgZm9yICh2YXIgbmFtZSBpbiB0cmFja2luZykge1xuICAgICAgICB0aGlzLmdyYXBoc1tuYW1lXSA9IG5ldyBDYW5HcmFwaCh7XG4gICAgICAgICAgICBub2RlOiB0aGlzLm5vZGUsXG4gICAgICAgICAgICBtaW5zY2FsZTogdHJhY2tpbmdbbmFtZV0ubWluc2NhbGUsXG4gICAgICAgICAgICB0aXRsZTogdHJhY2tpbmdbbmFtZV0udGl0bGUsXG4gICAgICAgICAgICB0b3A6IGdyYXBoaGVpZ2h0ICogaSsrLFxuICAgICAgICAgICAgbGVmdDogMCxcbiAgICAgICAgICAgIHdpZHRoOiB0aGlzLm8ud2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQ6IGdyYXBoaGVpZ2h0LFxuICAgICAgICB9KVxuICAgIH1cblxuICAgIC8qXG4gICAgdGhpcy5ncmFwaCA9IG5ldyBSaWNrc2hhdy5HcmFwaCh7XG4gICAgICAgIGVsZW1lbnQ6IHRoaXMubm9kZSxcbiAgICAgICAgd2lkdGg6IDYwMCxcbiAgICAgICAgaGVpZ2h0OiA2MDAsXG4gICAgICAgIHJlbmRlcmVyOiAnbGluZScsXG4gICAgICAgIHNlcmllczogbmV3IFJpY2tzaGF3LlNlcmllcyhcbiAgICAgICAgICAgIHRyYWNraW5nLm1hcChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB7bmFtZTogaXRlbS5uYW1lfVxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICB1bmRlZmluZWQsIHtcbiAgICAgICAgICAgICAgICB0aW1lSW50ZXJ2YWw6IDI1MCxcbiAgICAgICAgICAgICAgICBtYXhEYXRhUG9pbnRzOiAxMDAsXG4gICAgICAgICAgICAgICAgdGltZUJhc2U6IG5ldyBEYXRlKCkuZ2V0VGltZSgpIC8gMTAwMFxuICAgICAgICAgICAgfVxuICAgICAgICApXG4gICAgfSlcbiAgICAqL1xufVxuXG5HcmFwaC5wcm90b3R5cGUgPSB7XG4gICAgdXBkYXRlRGF0YTogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgZGF0YSA9IHt9XG4gICAgICAgIHZhciBoZWlnaHQgPSB0aGlzLm8ud29ybGRIZWlnaHRcbiAgICAgICAgdGhpcy5ub2RlLmdldENvbnRleHQoJzJkJykuY2xlYXJSZWN0KDAsIDAsIHRoaXMubm9kZS53aWR0aCwgdGhpcy5ub2RlLmhlaWdodClcbiAgICAgICAgZm9yICh2YXIgbmFtZSBpbiB0aGlzLnRyYWNraW5nKSB7XG4gICAgICAgICAgICB0aGlzLmdyYXBoc1tuYW1lXS5hZGRQb2ludCh0aGlzLmdldERhdHVtKG5hbWUpKVxuICAgICAgICAgICAgdGhpcy5ncmFwaHNbbmFtZV0uZHJhdygpXG4gICAgICAgIH1cbiAgICB9LFxuICAgIGdldERhdHVtOiBmdW5jdGlvbiAobmFtZSkge1xuICAgICAgICB2YXIgaXRlbSA9IHRoaXMudHJhY2tpbmdbbmFtZV1cbiAgICAgICAgaWYgKGl0ZW0uZm4pIHtcbiAgICAgICAgICAgIHJldHVybiBpdGVtLmZuKCk7XG4gICAgICAgIH0gZWxzZSBpZiAoaXRlbS5hdHRyID09PSAncG9zLnknKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vLndvcmxkSGVpZ2h0IC0gaXRlbS5ib2R5LnN0YXRlLnBvcy55XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gZ2V0RGF0dW0oaXRlbSlcbiAgICAgICAgfVxuICAgIH0sXG4gICAgdXBkYXRlOiBmdW5jdGlvbiAodGltZXN0ZXApIHtcbiAgICAgICAgdGhpcy51cGRhdGVEYXRhKClcbiAgICB9XG59XG5cbiIsInZhciBCYXNlID0gcmVxdWlyZSgnLi9iYXNlJyk7XG52YXIgR2F0ZSA9IHJlcXVpcmUoJy4vZ2F0ZScpO1xudmFyIFN0b3B3YXRjaCA9IHJlcXVpcmUoJy4vc3RvcHdhdGNoJyk7XG52YXIgTG9nQm9vayA9IHJlcXVpcmUoJy4vbG9nYm9vaycpO1xudmFyIFBsYXlQYXVzZSA9IHJlcXVpcmUoJy4vcGxheXBhdXNlJyk7XG4vL3ZhciBXYWxrVGhyb3VnaCA9IHJlcXVpcmUoJy4vaW50cm8vaGlsbHNfd2Fsa3Rocm91Z2guanN4Jyk7XG52YXIgRHJvcERhdGFDaGVja2VyID0gcmVxdWlyZSgnLi9kcm9wZGF0YWNoZWNrZXIuanN4Jyk7XG52YXIgQ2F2ZURyYXcgPSByZXF1aXJlKCcuL2NhdmVkcmF3Jyk7XG52YXIgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xudmFyIHRlcnJhaW4gPSByZXF1aXJlKCcuL3RlcnJhaW4nKTtcblxuZnVuY3Rpb24gcmFuZG9tKG1pbiwgbWF4KXtcbiAgICByZXR1cm4gKE1hdGgucmFuZG9tKCkgKiAobWF4LW1pbikgKyBtaW4pfDBcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBCYXNlLmV4dGVuZChmdW5jdGlvbiBIaWxscyhjb250YWluZXIsIG9wdGlvbnMpIHtcbiAgICBCYXNlLmNhbGwodGhpcywgY29udGFpbmVyLCBvcHRpb25zLCBcImltYWdlcy9sYWJfYmFja2dyb3VuZC5qcGdcIixcbiAgICAgICAgdHJ1ZSAvKiBkaXNhYmxlQm91bmRzICovKVxufSwge1xuICAgIGRyb3BCb3dsaW5nQmFsbDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciByYWRpdXMgPSAzMDtcbiAgICAgICAgdGhpcy53b3JsZC5hZGQoUGh5c2ljcy5ib2R5KCdjaXJjbGUnLCB7XG4gICAgICAgICAgICB4OiA3MDAsXG4gICAgICAgICAgICB5OiAyMDAsXG4gICAgICAgICAgICB2eDogcmFuZG9tKC0zMCwgMzApLzEwMCxcbiAgICAgICAgICAgIHJhZGl1czogcmFkaXVzLFxuICAgICAgICAgICAgbWFzczogOTAwLFxuICAgICAgICAgICAgcmVzdGl0dXRpb246IDAuMDEsXG4gICAgICAgICAgICBjb2Y6IDAuNCxcbiAgICAgICAgICAgIHN0eWxlczoge1xuICAgICAgICAgICAgICAgIGltYWdlOiBcImltYWdlcy9ib3dsaW5nX2JhbGwucG5nXCJcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBkaXNwbGF5TmFtZTogJ0Jvd2xpbmcgQmFsbCcsXG4gICAgICAgIH0pKTtcbiAgICB9LFxuXG4gICAgZHJvcFRlbm5pc0JhbGw6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcmFkaXVzID0gMTU7XG4gICAgICAgIHZhciBiYWxsID0gUGh5c2ljcy5ib2R5KCdjaXJjbGUnLCB7XG4gICAgICAgICAgICB4OiA3MDAsXG4gICAgICAgICAgICB5OiAyMDAsXG4gICAgICAgICAgICB2eDogcmFuZG9tKC0zMCwgMzApLzEwMCxcbiAgICAgICAgICAgIHJhZGl1czogcmFkaXVzLFxuICAgICAgICAgICAgbWFzczogNy41LFxuICAgICAgICAgICAgcmVzdGl0dXRpb246IDEsXG4gICAgICAgICAgICBkaXNwbGF5TmFtZTogJ1Rlbm5pcyBCYWxsJyxcbiAgICAgICAgICAgIHN0eWxlczoge1xuICAgICAgICAgICAgICAgIGltYWdlOiBcImltYWdlcy90ZW5uaXNfYmFsbC5wbmdcIlxuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuXG4gICAgICAgIGlmICghdGhpcy5maXJzdFRlbm5pc0JhbGwpIHtcbiAgICAgICAgICAgIHRoaXMuZmlyc3RUZW5uaXNCYWxsID0gYmFsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMud29ybGQuYWRkKGJhbGwpO1xuICAgIH0sXG5cbiAgICBkZXBsb3lCYWxsczogZnVuY3Rpb24ob25Eb25lKSB7XG4gICAgICAgIHZhciBzcGFjaW5nX21zID0gODAwO1xuICAgICAgICB2YXIgcXVldWUgPSBbXG4gICAgICAgICAgICB0aGlzLmRyb3BUZW5uaXNCYWxsLmJpbmQodGhpcyksXG4gICAgICAgICAgICBvbkRvbmVcbiAgICAgICAgXTtcbiAgICAgICAgXy5yZWR1Y2UocXVldWUsIGZ1bmN0aW9uKHQsIGFjdGlvbikge1xuICAgICAgICAgICAgc2V0VGltZW91dChhY3Rpb24sIHQpXG4gICAgICAgICAgICByZXR1cm4gdCArIHNwYWNpbmdfbXNcbiAgICAgICAgfSwgMClcblxuICAgICAgICAvLyBzZXRUaW1lb3V0KHRoaXMuZHJvcFRlbm5pc0JhbGwuYmluZCh0aGlzKSwgMClcbiAgICAgICAgLy8gc2V0VGltZW91dCh0aGlzLmRyb3BUZW5uaXNCYWxsLmJpbmQodGhpcyksIDEwMClcbiAgICAgICAgLy8gc2V0VGltZW91dCh0aGlzLmRyb3BUZW5uaXNCYWxsLmJpbmQodGhpcyksIDIwMClcbiAgICB9LFxuXG4gICAgLy8gVE9ETzogaG9vayB1cCB3YWxrdGhyb3VnaFxuLy8gICAgc3RhcnRXYWxrdGhyb3VnaDogZnVuY3Rpb24gKCkge1xuLy8gICAgICAgIFdhbGtUaHJvdWdoKHRoaXMsIGZ1bmN0aW9uIChoeXBvdGhlc2lzKSB7XG4vLyAgICAgICAgICAgIGNvbnNvbGUubG9nKCdHb3QgdGhlIGh5cG90aGVzaXMhIScsIGh5cG90aGVzaXMpO1xuLy8gICAgICAgICAgICB0aGlzLnNldHVwRGF0YUNoZWNrZXIoaHlwb3RoZXNpcyk7XG4vLyAgICAgICAgfS5iaW5kKHRoaXMpKVxuLy8gICAgfSxcblxuICAgIHNldHVwRGF0YUNoZWNrZXI6IGZ1bmN0aW9uIChoeXBvdGhlc2lzKSB7XG4gICAgICAgIHZhciBkYXRhQ2hlY2tlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgIGRhdGFDaGVja2VyLmNsYXNzTmFtZSA9IFwiZHJvcC1kYXRhLWNoZWNrZXJcIjtcbiAgICAgICAgdGhpcy5zaWRlQmFyLmFwcGVuZENoaWxkKGRhdGFDaGVja2VyKTtcbiAgICAgICAgUmVhY3QucmVuZGVyQ29tcG9uZW50KERyb3BEYXRhQ2hlY2tlcih7XG4gICAgICAgICAgICBpbml0aWFsSHlwb3RoZXNpczogaHlwb3RoZXNpcyxcbiAgICAgICAgICAgIGxvZ0Jvb2s6IHRoaXMubG9nQm9vayxcbiAgICAgICAgICAgIHdvcmxkOiB0aGlzLndvcmxkXG4gICAgICAgIH0pLCBkYXRhQ2hlY2tlcik7XG4gICAgfSxcblxuICAgIHNldHVwOiBmdW5jdGlvbiAoY29udGFpbmVyKSB7XG4gICAgICAgIHZhciB3b3JsZCA9IHRoaXMud29ybGRcbiAgICAgICAgdmFyIGdyYXZpdHkgPSBQaHlzaWNzLmJlaGF2aW9yKCdjb25zdGFudC1hY2NlbGVyYXRpb24nKVxuICAgICAgICBncmF2aXR5LnNldEFjY2VsZXJhdGlvbih7eDogMCwgeTouMDAwM30pO1xuICAgICAgICB3b3JsZC5hZGQoZ3Jhdml0eSk7XG4gICAgICAgIC8vIGNvbnN0cmFpbiBvYmplY3RzIHRvIHRoZXNlIGJvdW5kc1xuICAgICAgICBQaHlzaWNzLmJlaGF2aW9yKCd0ZXJyYWluLWNvbGxpc2lvbi1kZXRlY3Rpb24nLCB0ZXJyYWluKTtcbiAgICAgICAgdmFyIHRlcnJhaW5IZWlnaHQgPSBmdW5jdGlvbiAoeCkge3JldHVybiAyMDAgLSB4LzYgKyA1MCAqIE1hdGguY29zKHgvNjApO307XG4gICAgICAgIHZhciBiZ2RyYXcgPSBuZXcgQ2F2ZURyYXcoJCgnI3VuZGVyLWNhbnZhcycpLCA5MDAsIDcwMClcbiAgICAgICAgYmdkcmF3LmRyYXcodGVycmFpbkhlaWdodClcbiAgICAgICAgd29ybGQuYWRkKFBoeXNpY3MuYmVoYXZpb3IoJ3RlcnJhaW4tY29sbGlzaW9uLWRldGVjdGlvbicsIHtcbiAgICAgICAgICAgIGFhYmI6IFBoeXNpY3MuYWFiYigwLCAwLCB0aGlzLm9wdGlvbnMud2lkdGgsIHRoaXMub3B0aW9ucy5oZWlnaHQpLFxuICAgICAgICAgICAgdGVycmFpbkhlaWdodDogdGVycmFpbkhlaWdodCxcbiAgICAgICAgICAgIHJlc3RpdHV0aW9uOiAwLjIsXG4gICAgICAgICAgICBjb2Y6IDAuOFxuICAgICAgICB9KSk7XG5cbiAgICAgICAgdmFyIHNpZGVCYXIgPSB0aGlzLnNpZGVCYXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICBzaWRlQmFyLmNsYXNzTmFtZSA9IFwic2lkZS1iYXJcIjtcbiAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKHNpZGVCYXIpO1xuICAgICAgICB2YXIgdG9wR2F0ZSA9IG5ldyBHYXRlKHdvcmxkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHV0aWwubWFrZVJlY3QoMCwgMCwgMjAwLCAxMCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgWzEyMCwgMjAwXSwgbnVsbCwge2RlYnVnOiB0cnVlLCBzaG93OiB0cnVlLCBjb2xvcjogJ2dyZWVuJ30pO1xuICAgICAgICB2YXIgYm90dG9tR2F0ZSA9IG5ldyBHYXRlKHdvcmxkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHV0aWwubWFrZVJlY3QoMCwgMCwgMjAwLCAxMCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgWzEyMCwgNTUwXSwgbnVsbCwge2RlYnVnOiB0cnVlLCBzaG93OiB0cnVlLCBjb2xvcjogJ3JlZCd9KTtcbiAgICAgICAgdmFyIGxvZ0NvbHVtbnMgPSBbXG4gICAgICAgICAgICB7bmFtZTogXCJCb3dsaW5nIEJhbGxcIiwgZXh0cmFUZXh0OiBcIiAoNyBrZylcIn0sXG4gICAgICAgICAgICB7bmFtZTogXCJUZW5uaXMgQmFsbFwiLCBleHRyYVRleHQ6IFwiICg1OCBnKVwiLCBjb2xvcjogJ2FhZWUwMCd9XG4gICAgICAgIF07XG4gICAgICAgIHZhciBsb2dCb29rID0gdGhpcy5sb2dCb29rID0gbmV3IExvZ0Jvb2sod29ybGQsIHNpZGVCYXIsIDUsIGxvZ0NvbHVtbnMpO1xuICAgICAgICB0b3BHYXRlLm9uKCdlbnRlcicsIGZ1bmN0aW9uKGVsZW0pIHtcbiAgICAgICAgICAgIHZhciBjb2xOYW1lID0gZWxlbS5ib2R5LmRpc3BsYXlOYW1lIHx8IGVsZW0uYm9keS5uYW1lIHx8IFwiYm9keVwiO1xuICAgICAgICAgICAgbG9nQm9vay5oYW5kbGVTdGFydChjb2xOYW1lLCBlbGVtLmJvZHkudWlkKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgYm90dG9tR2F0ZS5vbignZW50ZXInLCBmdW5jdGlvbihlbGVtKSB7XG4gICAgICAgICAgICB2YXIgY29sTmFtZSA9IGVsZW0uYm9keS5kaXNwbGF5TmFtZSB8fCBlbGVtLmJvZHkubmFtZSB8fCBcImJvZHlcIjtcbiAgICAgICAgICAgIGxvZ0Jvb2suaGFuZGxlRW5kKGNvbE5hbWUsIGVsZW0uYm9keS51aWQpO1xuICAgICAgICB9KTtcbiAgICAgICAgdmFyIGJ1dHRvbkNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgIHZhciBwbGF5UGF1c2UgPSBuZXcgUGxheVBhdXNlKHdvcmxkLCBidXR0b25Db250YWluZXIpO1xuICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoYnV0dG9uQ29udGFpbmVyKTtcblxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLndhbGspIHtcbiAgICAgICAgICAgIC8vIFRPRE86IGhvb2sgdXAgd2Fsa3Rocm91Z2hcbi8vICAgICAgICAgICAgdGhpcy5zdGFydFdhbGt0aHJvdWdoKClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIEFkZCB0aGUgYmFsbHMuXG4gICAgICAgICAgICBzZXRUaW1lb3V0KHRoaXMuZGVwbG95QmFsbHMuYmluZCh0aGlzKSwgNTAwKVxuICAgICAgICAgICAgdGhpcy5zZXR1cERhdGFDaGVja2VyKCdzYW1lJyk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUGljayB1cCBvbmUgb2YgdGhlIHRlbm5pcyBiYWxscyBhbmQgZHJvcCBpdC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBjYWxsYmFjayBHZXRzIGNhbGxlZCB3aGVuIHRoZSBkZW1vbnN0cmF0aW9uIGlzIG92ZXIuXG4gICAgICovXG4gICAgZGVtb25zdHJhdGVEcm9wOiBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgICAgICB2YXIgYmFsbCA9IHRoaXMuZmlyc3RUZW5uaXNCYWxsO1xuICAgICAgICB2YXIgdGFyZ2V0WCA9IDEyNTtcbiAgICAgICAgdmFyIHRhcmdldFkgPSAxNzA7XG5cbiAgICAgICAgYmFsbC50cmVhdG1lbnQgPSAna2luZW1hdGljJztcbiAgICAgICAgYmFsbC5zdGF0ZS52ZWwueCA9ICh0YXJnZXRYIC0gYmFsbC5zdGF0ZS5wb3MueCkgLyAxNTAwO1xuICAgICAgICBiYWxsLnN0YXRlLnZlbC55ID0gKHRhcmdldFkgLSBiYWxsLnN0YXRlLnBvcy55KSAvIDE1MDA7XG4gICAgICAgIGJhbGwucmVjYWxjKCk7XG5cbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGJhbGwudHJlYXRtZW50ID0gJ3N0YXRpYyc7XG4gICAgICAgICAgICBiYWxsLnN0YXRlLnBvcy54ID0gdGFyZ2V0WDtcbiAgICAgICAgICAgIGJhbGwuc3RhdGUucG9zLnkgPSB0YXJnZXRZO1xuICAgICAgICAgICAgYmFsbC5zdGF0ZS52ZWwueCA9IDA7XG4gICAgICAgICAgICBiYWxsLnN0YXRlLnZlbC55ID0gMDtcbiAgICAgICAgICAgIGJhbGwucmVjYWxjKCk7XG5cbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgYmFsbC50cmVhdG1lbnQgPSAnZHluYW1pYyc7XG4gICAgICAgICAgICAgICAgYmFsbC5yZWNhbGMoKTtcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgICAgIH0sIDMwMDApXG4gICAgICAgICAgICB9LCAxNTAwKVxuICAgICAgICB9LCAxNTAwKVxuICAgIH1cbn0pO1xuIiwiXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBCYXNlOiByZXF1aXJlKCcuL2Jhc2UnKSxcbiAgICBEZW1vOiByZXF1aXJlKCcuL2RlbW8nKSxcbiAgICBOZXd0b24xOiByZXF1aXJlKCcuL25ld3RvbjEnKSxcbiAgICBPcmJpdDogcmVxdWlyZSgnLi9vcmJpdCcpLFxuICAgIE1vb246IHJlcXVpcmUoJy4vbW9vbicpLFxuICAgIEFzdGVyb2lkczogcmVxdWlyZSgnLi9hc3Rlcm9pZHMnKSxcbiAgICBTbG9wZTogcmVxdWlyZSgnLi9zbG9wZScpLFxuICAgIERyb3A6IHJlcXVpcmUoJy4vZHJvcCcpLFxuICAgIFRyeUdyYXBoOiByZXF1aXJlKCcuL3RyeS1ncmFwaCcpLFxuICAgIENhdmVEcmF3OiByZXF1aXJlKCcuL2NhdmVkcmF3JyksXG4gICAgSGlsbHM6IHJlcXVpcmUoJy4vaGlsbHMnKSxcbn1cbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xuXG52YXIgV2Fsa3Rocm91Z2ggPSByZXF1aXJlKCcuL3dhbGstdGhyb3VnaC5qc3gnKVxudmFyIFBUID0gUmVhY3QuUHJvcFR5cGVzXG52YXIgU3RlcCA9IHJlcXVpcmUoJy4vc3RlcC5qc3gnKVxuXG52YXIgREVCVUcgPSBmYWxzZVxuXG5tb2R1bGUuZXhwb3J0cyA9IERyb3BJbnRybztcblxuZnVuY3Rpb24gRHJvcEludHJvKEV4ZXJjaXNlLCBnb3RIeXBvdGhlc2lzKSB7XG4gICAgdmFyIG5vZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQobm9kZSlcbiAgICBSZWFjdC5yZW5kZXJDb21wb25lbnQoV2Fsa3Rocm91Z2goe1xuICAgICAgICBzdGVwczogc3RlcHMsXG4gICAgICAgIG9uSHlwb3RoZXNpczogZ290SHlwb3RoZXNpcyxcbiAgICAgICAgb25Eb25lOiBmdW5jdGlvbiAoaHlwb3RoZXNpcykge1xuICAgICAgICAgICAgUmVhY3QudW5tb3VudENvbXBvbmVudEF0Tm9kZShub2RlKTtcbiAgICAgICAgICAgIG5vZGUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChub2RlKTtcbiAgICAgICAgfSxcbiAgICAgICAgRXhlcmNpc2U6IEV4ZXJjaXNlXG4gICAgfSksIG5vZGUpXG59XG5cblxudmFyIEJ1dHRvbkdyb3VwID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnQnV0dG9uR3JvdXAnLFxuICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogdGhpcy5wcm9wcy5jbGFzc05hbWV9LCBcbiAgICAgICAgICAgIHRoaXMucHJvcHMub3B0aW9ucy5tYXAoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICB2YXIgY2xzID0gXCJidG4gYnRuLWRlZmF1bHRcIlxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLnNlbGVjdGVkID09PSBpdGVtWzBdKSB7XG4gICAgICAgICAgICAgICAgICAgIGNscyArPSAnIGFjdGl2ZSdcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIFJlYWN0LkRPTS5idXR0b24oe2tleTogaXRlbVswXSwgY2xhc3NOYW1lOiBjbHMsIG9uQ2xpY2s6IHRoaXMucHJvcHMub25TZWxlY3QuYmluZChudWxsLCBpdGVtWzBdKX0sIGl0ZW1bMV0pO1xuICAgICAgICAgICAgfS5iaW5kKHRoaXMpKVxuICAgICAgICApO1xuICAgIH1cbn0pO1xuXG52YXIgc3RlcHMgPSBbXG4gICAgZnVuY3Rpb24gKHByb3BzKSB7XG4gICAgICAgIHJldHVybiBTdGVwKF8uZXh0ZW5kKHByb3BzLCB7XG4gICAgICAgICAgICBpZDogJ2hlbGxvJyxcbiAgICAgICAgICAgIHRpdGxlOiBcIkhpISBJJ20gU2lyIEZyYW5jaXMgQmFjb25cIixcbiAgICAgICAgICAgIHNob3dCYWNvbjogdHJ1ZSxcbiAgICAgICAgICAgIGJvZHk6IFwiSSB3YXMgbWFkZSBhIEtuaWdodCBvZiBFbmdsYW5kIGZvciBkb2luZyBhd2Vzb21lIFNjaWVuY2UuIFdlJ3JlIGdvaW5nIHRvIHVzZSBzY2llbmNlIHRvIGZpZ3VyZSBvdXQgY29vbCB0aGluZ3MgYWJvdXQgdGhlIHdvcmxkLlwiLFxuICAgICAgICAgICAgbmV4dDogXCJMZXQncyBkbyBzY2llbmNlIVwiXG4gICAgICAgIH0pKVxuICAgIH0sXG5cbiAgICBmdW5jdGlvbiAocHJvcHMpIHtcbiAgICAgICAgdmFyIGh5cG90aGVzaXMgPSBwcm9wcy5kYXRhLmh5cG90aGVzaXNcbiAgICAgICAgcmV0dXJuIFN0ZXAoXy5leHRlbmQocHJvcHMsIHtcbiAgICAgICAgICAgIGlkOiAnZGVzY3JpcHRpb24nLFxuICAgICAgICAgICAgdGl0bGU6IFwiRXhwZXJpbWVudCAjMVwiLFxuICAgICAgICAgICAgb25VcGRhdGU6IGZ1bmN0aW9uIChwcmV2UHJvcHMpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5kYXRhLmh5cG90aGVzaXMgJiYgIXByZXZQcm9wcy5kYXRhLmh5cG90aGVzaXMpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvcHMub25IeXBvdGhlc2lzKHByb3BzLmRhdGEuaHlwb3RoZXNpcyk7XG4gICAgICAgICAgICAgICAgICAgIERFQlVHID8gcHJvcHMub25OZXh0KCkgOiBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3BzLm9uTmV4dCgpXG4gICAgICAgICAgICAgICAgICAgIH0sIDUwMClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYm9keTogUmVhY3QuRE9NLmRpdihudWxsLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00ucChudWxsLCBcIldoYXQgZmFsbHMgZmFzdGVyOiBhIHRlbm5pcyBiYWxsIG9yIGEgYm93bGluZyBiYWxsP1wiKSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLnAobnVsbCwgXCJBIFwiLCBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcInVsaW5lXCJ9LCBcIkh5cG90aGVzaXNcIiksIFwiIGlzIHdoYXQgeW91IHRoaW5rIHdpbGwgaGFwcGVuLlwiKSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmhyKG51bGwpLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwibGFyZ2VcIn0sIFwiSSB0aGluazpcIiwgXG4gICAgICAgICAgICAgICAgICAgIEJ1dHRvbkdyb3VwKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogXCJ3YWxrdGhyb3VnaF9oeXBvdGhlc2VzXCIsIFxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWQ6IGh5cG90aGVzaXMsIFxuICAgICAgICAgICAgICAgICAgICAgICAgb25TZWxlY3Q6IHByb3BzLnNldERhdGEuYmluZChudWxsLCAnaHlwb3RoZXNpcycpLCBcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnM6IFtbXCJ0ZW5uaXNcIiwgXCJUaGUgdGVubmlzIGJhbGwgZmFsbHMgZmFzdGVyXCJdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtcImJvd2xpbmdcIiwgXCJUaGUgYm93bGluZyBiYWxsIGZhbGxzIGZhc3RlclwiXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBbXCJzYW1lXCIsIFwiVGhleSBmYWxsIHRoZSBzYW1lXCJdXX0pXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIC8qKmh5cG90aGVzaXMgJiYgPHAgY2xhc3NOYW1lPVwid2Fsa3Rocm91Z2hfZ3JlYXRcIj5HcmVhdCEgTm93IHdlIGRvIHNjaWVuY2U8L3A+KiovXG4gICAgICAgICAgICApXG4gICAgICAgIH0pKVxuICAgIH0sXG5cbiAgICBmdW5jdGlvbiAocHJvcHMpIHtcbiAgICAgICAgdmFyIGZpcnN0QmFsbCA9ICd0ZW5uaXMnXG4gICAgICAgIHZhciBzZWNvbmRCYWxsID0gJ2Jvd2xpbmcnXG4gICAgICAgIHZhciBwcm92ZXIgPSBwcm9wcy5kYXRhLnByb3ZlclxuICAgICAgICB2YXIgaHlwb3RoZXNpcyA9IHByb3BzLmRhdGEuaHlwb3RoZXNpc1xuXG4gICAgICAgIGlmIChoeXBvdGhlc2lzID09PSAnYm93bGluZycpIHtcbiAgICAgICAgICAgIGZpcnN0QmFsbCA9ICdib3dsaW5nJ1xuICAgICAgICAgICAgc2Vjb25kQmFsbCA9ICd0ZW5uaXMnXG4gICAgICAgIH1cblxuICAgICAgICB2YXIgcmVzcG9uc2VzID0ge1xuICAgICAgICAgICAgJ3Rlbm5pcyc6ICdOb3BlLiBUaGF0IHdvdWxkIHNob3cgdGhhdCB0aGUgdGVubmlzIGJhbGwgZmFsbHMgZmFzdGVyJyxcbiAgICAgICAgICAgICdib3dsaW5nJzogJ05vcGUuIFRoYXQgd291bGQgc2hvdyB0aGF0IHRoZSBib3dsaW5nIGJhbGwgZmFsbHMgZmFzdGVyJyxcbiAgICAgICAgICAgICdzYW1lJzogJ05vcGUuIFRoYXQgd291bGQgc2hvdyB0aGF0IHRoZXkgZmFsbCB0aGUgc2FtZSdcbiAgICAgICAgfVxuICAgICAgICB2YXIgY29ycmVjdCA9IHtcbiAgICAgICAgICAgICd0ZW5uaXMnOiAnbGVzcycsXG4gICAgICAgICAgICAnYm93bGluZyc6ICdsZXNzJyxcbiAgICAgICAgICAgICdzYW1lJzogJ3NhbWUnXG4gICAgICAgIH1cbiAgICAgICAgdmFyIHByb3ZlclJlc3BvbnNlXG4gICAgICAgIHZhciBpc0NvcnJlY3QgPSBwcm92ZXIgPT09IGNvcnJlY3RbaHlwb3RoZXNpc11cblxuICAgICAgICBpZiAocHJvdmVyKSB7XG4gICAgICAgICAgICBpZiAoaXNDb3JyZWN0KSB7XG4gICAgICAgICAgICAgICAgcHJvdmVyUmVzcG9uc2UgPSBcIkV4YWN0bHkhIE5vdyBsZXQncyBkbyB0aGUgZXhwZXJpbWVudC5cIlxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBwcm92ZXJSZXNwb25zZSA9IHJlc3BvbnNlc1t7XG4gICAgICAgICAgICAgICAgICAgIHRlbm5pczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgbW9yZTogJ2Jvd2xpbmcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2FtZTogJ3NhbWUnXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGJvd2xpbmc6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vcmU6ICd0ZW5uaXMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2FtZTogJ3NhbWUnXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHNhbWU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vcmU6ICdib3dsaW5nJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxlc3M6ICd0ZW5uaXMnXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9W2h5cG90aGVzaXNdW3Byb3Zlcl1dO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGZ1dHVyZUh5cG90aGVzaXMgPSB7XG4gICAgICAgICAgICB0ZW5uaXM6ICd0aGUgdGVubmlzIGJhbGwgd2lsbCBmYWxsIGZhc3RlciB0aGFuIHRoZSBib3dsaW5nIGJhbGwnLFxuICAgICAgICAgICAgYm93bGluZzogJ3RoZSBib3dsaW5nIGJhbGwgd2lsbCBmYWxsIGZhc3RlciB0aGFuIHRoZSB0ZW5uaXMgYmFsbCcsXG4gICAgICAgICAgICBzYW1lOiAndGhlIHRlbm5pcyBiYWxsIGFuZCB0aGUgYm93bGluZyBiYWxsIHdpbGwgZmFsbCB0aGUgc2FtZSdcbiAgICAgICAgfVtoeXBvdGhlc2lzXTtcblxuICAgICAgICB2YXIgY3VycmVudEh5cG90aGVzaXMgPSB7XG4gICAgICAgICAgICB0ZW5uaXM6ICdhIHRlbm5pcyBiYWxsIGZhbGxzIGZhc3RlciB0aGFuIGEgYm93bGluZyBiYWxsJyxcbiAgICAgICAgICAgIGJvd2xpbmc6ICdhIGJvd2xpbmcgYmFsbCBmYWxscyBmYXN0ZXIgdGhhbiBhIHRlbm5pcyBiYWxsJyxcbiAgICAgICAgICAgIHNhbWU6ICdhIHRlbm5pcyBiYWxsIGZhbGxzIHRoZSBzYW1lIGFzIGEgYm93bGluZyBiYWxsJ1xuICAgICAgICB9W2h5cG90aGVzaXNdO1xuXG4gICAgICAgIHJldHVybiBTdGVwKF8uZXh0ZW5kKHByb3BzLCB7XG4gICAgICAgICAgICBpZDogJ2Rlc2lnbi1leHBlcmltZW50JyxcbiAgICAgICAgICAgIHRpdGxlOiAnRGVzaWduaW5nIHRoZSBFeHBlcmltZW50JyxcbiAgICAgICAgICAgIG9uVXBkYXRlOiBmdW5jdGlvbiAocHJldlByb3BzKSB7XG4gICAgICAgICAgICAgICAgaWYgKHByb3ZlciAmJiBpc0NvcnJlY3QgJiYgcHJvdmVyICE9PSBwcmV2UHJvcHMuZGF0YS5wcm92ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9wcy5vbk5leHQoKVxuICAgICAgICAgICAgICAgICAgICB9LCAyMDAwKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYm9keTogUmVhY3QuRE9NLmRpdihudWxsLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00ucChudWxsLCBcIk5vdyB3ZSBuZWVkIHRvIGRlc2lnbiBhbiBleHBlcmltZW50IHRvIHRlc3QgeW91clwiICsgJyAnICtcbiAgICAgICAgICAgICAgICBcImh5cG90aGVzaXMhIEl0J3MgaW1wb3J0YW50IHRvIGJlIGNhcmVmdWwgd2hlbiBkZXNpZ25pbmcgYW5cIiArICcgJyArXG4gICAgICAgICAgICAgICAgXCJleHBlcmltZW50LCBiZWNhdXNlIG90aGVyd2lzZSB5b3UgY291bGQgZW5kIHVwIFxcXCJwcm92aW5nXFxcIlwiICsgJyAnICtcbiAgICAgICAgICAgICAgICBcInNvbWV0aGluZyB0aGF0J3MgYWN0dWFsbHkgZmFsc2UuXCIpLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00ucChudWxsLCBcIlRvIHByb3ZlIHRoYXQgXCIsIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwidWxpbmVcIn0sIGN1cnJlbnRIeXBvdGhlc2lzKSwgXCIsIHdlIGNhbiBtZWFzdXJlIHRoZSB0aW1lIHRoYXQgaXRcIiArICcgJyArXG4gICAgICAgICAgICAgICAgXCJ0YWtlcyBmb3IgZWFjaCBiYWxsIHRvIGZhbGwgd2hlbiBkcm9wcGVkIGZyb20gYSBzcGVjaWZpY1wiICsgJyAnICtcbiAgICAgICAgICAgICAgICBcImhlaWdodC5cIiksIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5wKG51bGwsIFwiWW91ciBoeXBvdGhlc2lzIHdpbGwgYmUgcHJvdmVuIGlmIHRoZSBcIiwgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJ1bGluZVwifSwgXCJ0aW1lIGZvciB0aGUgXCIsIGZpcnN0QmFsbCwgXCIgYmFsbFwiKSwgXCIgaXNcIiwgXG4gICAgICAgICAgICAgICAgICAgIEJ1dHRvbkdyb3VwKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogXCJidG4tZ3JvdXBcIiwgXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZDogcHJvdmVyLCBcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uU2VsZWN0OiBwcm9wcy5zZXREYXRhLmJpbmQobnVsbCwgJ3Byb3ZlcicpLCBcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnM6IFtbJ2xlc3MnLCAnbGVzcyB0aGFuJ10sIFsnbW9yZScsICdtb3JlIHRoYW4nXSwgWydzYW1lJywgJ3RoZSBzYW1lIGFzJ11dfSksIFxuICAgICAgICAgICAgICAgICAgICBcInRoZSBcIiwgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJ1bGluZVwifSwgXCJ0aW1lIGZvciB0aGUgXCIsIHNlY29uZEJhbGwsIFwiIGJhbGxcIiksIFwiLlwiXG4gICAgICAgICAgICAgICAgKSwgXG4gICAgICAgICAgICAgICAgcHJvdmVyICYmIFJlYWN0LkRPTS5wKHtjbGFzc05hbWU6IFwiZGVzaWduX3Jlc3BvbnNlXCJ9LCBwcm92ZXJSZXNwb25zZSlcbiAgICAgICAgICAgIClcbiAgICAgICAgfSkpXG4gICAgfSxcblxuICAgIGZ1bmN0aW9uIChwcm9wcykge1xuICAgICAgICByZXR1cm4gU3RlcChfLmV4dGVuZChwcm9wcywge1xuICAgICAgICAgICAgaWQ6ICdleHBlcmltZW50JyxcbiAgICAgICAgICAgIHN0eWxlOiAnYmxhY2snLFxuICAgICAgICAgICAgdGl0bGU6ICdUaGUgZXhwZXJpbWVudCcsXG4gICAgICAgICAgICBwb3M6IHtcbiAgICAgICAgICAgICAgICBsZWZ0OiAzNzUsXG4gICAgICAgICAgICAgICAgdG9wOiAyMDBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBib2R5OiBSZWFjdC5ET00ucChudWxsLCBcIkhlcmUgd2UgaGF2ZSB0b29scyB0byBjb25kdWN0IG91ciBleHBlcmltZW50LiBZb3UgY2FuIHNlZVwiICsgJyAnICtcbiAgICAgICAgICAgIFwic29tZSBib3dsaW5nIGJhbGxzIGFuZCB0ZW5uaXMgYmFsbHMsIGFuZCB0aG9zZSByZWQgYW5kIGdyZWVuXCIgKyAnICcgK1xuICAgICAgICAgICAgXCJzZW5zb3JzIHdpbGwgcmVjb3JkIHRoZSB0aW1lIGl0IHRha2VzIGZvciBhIGJhbGwgdG8gZmFsbC5cIiksXG4gICAgICAgICAgICBvblJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHByb3BzLkV4ZXJjaXNlLmRlcGxveUJhbGxzKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgREVCVUcgPyBwcm9wcy5vbk5leHQoKSA6IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvcHMub25OZXh0KClcbiAgICAgICAgICAgICAgICAgICAgfSwgMjAwMCk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkpXG4gICAgfSxcblxuICAgIGZ1bmN0aW9uIChwcm9wcykge1xuICAgICAgICByZXR1cm4gU3RlcChfLmV4dGVuZChwcm9wcywge1xuICAgICAgICAgICAgaWQ6ICdkcm9wJyxcbiAgICAgICAgICAgIHN0eWxlOiAnYmxhY2snLFxuICAgICAgICAgICAgcG9zOiB7XG4gICAgICAgICAgICAgICAgdG9wOiAyMDAsXG4gICAgICAgICAgICAgICAgbGVmdDogMjAwXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYm9keTogUmVhY3QuRE9NLnAobnVsbCwgXCJJZiB3ZSBkcm9wIGEgYmFsbCBoZXJlIGFib3ZlIHRoZSBncmVlbiBzZW5zb3IsIHdlIGNhblwiICsgJyAnICtcbiAgICAgICAgICAgICAgICBcInRpbWUgaG93IGxvbmcgaXQgdGFrZXMgZm9yIGl0IHRvIGZhbGwgdG8gdGhlIHJlZCBzZW5zb3IuXCIpLFxuICAgICAgICAgICAgb25SZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBwcm9wcy5FeGVyY2lzZS5kZW1vbnN0cmF0ZURyb3AoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBwcm9wcy5vbk5leHQoKVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pKVxuICAgIH0sXG5cbiAgICBmdW5jdGlvbiAocHJvcHMpIHtcbiAgICAgICAgcmV0dXJuIFN0ZXAoXy5leHRlbmQocHJvcHMsIHtcbiAgICAgICAgICAgIGlkOiAnbG9nYm9vaycsXG4gICAgICAgICAgICBzdHlsZTogJ2JsYWNrJyxcbiAgICAgICAgICAgIHBvczoge1xuICAgICAgICAgICAgICAgIHRvcDogMTAwLFxuICAgICAgICAgICAgICAgIGxlZnQ6IDUwMFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGFycm93OiBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwiYXJyb3ctdG8tbG9nYm9va1wifSksXG4gICAgICAgICAgICBib2R5OiBSZWFjdC5ET00ucChudWxsLCBcIlRoZSB0aW1lIGlzIHRoZW4gcmVjb3JkZWQgb3ZlciBoZXJlIGluIHlvdXIgbG9nIGJvb2suIEZpbGwgdXAgdGhpcyBsb2cgYm9vayB3aXRoIHRpbWVzIGZvciBib3RoIGJhbGxzIGFuZCBjb21wYXJlIHRoZW0uXCIpLFxuICAgICAgICAgICAgb25SZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvcHMub25OZXh0KCk7XG4gICAgICAgICAgICAgICAgfSwgREVCVUcgPyAxMDAgOiA1MDAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkpO1xuICAgIH0sXG5cbiAgICBmdW5jdGlvbiAocHJvcHMpIHtcbiAgICAgICAgcmV0dXJuIFN0ZXAoXy5leHRlbmQocHJvcHMsIHtcbiAgICAgICAgICAgIGlkOiAnYW5zd2VyJyxcbiAgICAgICAgICAgIHN0eWxlOiAnYmxhY2snLFxuICAgICAgICAgICAgcG9zOiB7XG4gICAgICAgICAgICAgICAgdG9wOiAxNTAsXG4gICAgICAgICAgICAgICAgbGVmdDogMjUwXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYXJyb3c6IFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJhcnJvdy10by1hbnN3ZXJcIn0pLFxuICAgICAgICAgICAgc2hvd0JhY29uOiB0cnVlLFxuICAgICAgICAgICAgdGl0bGU6IFwiTm93IGNvbmR1Y3QgdGhlIGV4cGVyaW1lbnQgdG8gdGVzdCB5b3VyIGh5cG90aGVzaXMhXCIsXG4gICAgICAgICAgICBib2R5OiBSZWFjdC5ET00ucChudWxsLCBcIk9uY2UgeW91J3ZlIGNvbGxlY3RlZCBlbm91Z2ggZGF0YSBpbiB5b3VyIGxvZyBib29rLFwiICsgJyAnICtcbiAgICAgICAgICAgIFwiZGVjaWRlIHdoZXRoZXIgdGhlIGRhdGEgXCIsIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwidWxpbmVcIn0sIFwic3VwcG9ydFwiKSwgXCIgb3JcIiwgXG4gICAgICAgICAgICAnICcsIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwidWxpbmVcIn0sIFwiZGlzcHJvdmVcIiksIFwiIHlvdXIgaHlwb3RoZXNpcy4gVGhlblwiICsgJyAnICtcbiAgICAgICAgICAgIFwiSSB3aWxsIGV2YWx1YXRlIHlvdXIgZXhwZXJpbWVudCBhbmQgZ2l2ZSB5b3UgZmVlZGJhY2suXCIpLFxuICAgICAgICAgICAgbmV4dDogXCJPaywgSSdtIHJlYWR5XCIsXG4gICAgICAgIH0pKVxuICAgIH0sXG5dXG4iLCIvKiogQGpzeCBSZWFjdC5ET00gKi9cblxudmFyIFdhbGt0aHJvdWdoID0gcmVxdWlyZSgnLi93YWxrLXRocm91Z2guanN4JylcbnZhciBQVCA9IFJlYWN0LlByb3BUeXBlc1xudmFyIFN0ZXAgPSByZXF1aXJlKCcuL3N0ZXAuanN4JylcblxudmFyIERFQlVHID0gZmFsc2VcblxubW9kdWxlLmV4cG9ydHMgPSBOZXd0b24xSW50cm87XG5cbmZ1bmN0aW9uIE5ld3RvbjFJbnRybyhFeGVyY2lzZSwgZ290SHlwb3RoZXNpcykge1xuICAgIHZhciBub2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKG5vZGUpXG4gICAgUmVhY3QucmVuZGVyQ29tcG9uZW50KFdhbGt0aHJvdWdoKHtcbiAgICAgICAgc3RlcHM6IHN0ZXBzLFxuICAgICAgICBvbkh5cG90aGVzaXM6IGdvdEh5cG90aGVzaXMsXG4gICAgICAgIG9uRG9uZTogZnVuY3Rpb24gKGh5cG90aGVzaXMpIHtcbiAgICAgICAgICAgIFJlYWN0LnVubW91bnRDb21wb25lbnRBdE5vZGUobm9kZSk7XG4gICAgICAgICAgICBub2RlLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQobm9kZSk7XG4gICAgICAgIH0sXG4gICAgICAgIEV4ZXJjaXNlOiBFeGVyY2lzZVxuICAgIH0pLCBub2RlKVxufVxuXG5cbnZhciBCdXR0b25Hcm91cCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ0J1dHRvbkdyb3VwJyxcbiAgICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IHRoaXMucHJvcHMuY2xhc3NOYW1lfSwgXG4gICAgICAgICAgICB0aGlzLnByb3BzLm9wdGlvbnMubWFwKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgICAgICAgICAgdmFyIGNscyA9IFwiYnRuIGJ0bi1kZWZhdWx0XCJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5zZWxlY3RlZCA9PT0gaXRlbVswXSkge1xuICAgICAgICAgICAgICAgICAgICBjbHMgKz0gJyBhY3RpdmUnXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBSZWFjdC5ET00uYnV0dG9uKHtrZXk6IGl0ZW1bMF0sIGNsYXNzTmFtZTogY2xzLCBvbkNsaWNrOiB0aGlzLnByb3BzLm9uU2VsZWN0LmJpbmQobnVsbCwgaXRlbVswXSl9LCBpdGVtWzFdKTtcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSlcbiAgICAgICAgKTtcbiAgICB9XG59KTtcblxudmFyIHN0ZXBzID0gW1xuICAgIGZ1bmN0aW9uIChwcm9wcykge1xuICAgICAgICByZXR1cm4gU3RlcChfLmV4dGVuZChwcm9wcywge1xuICAgICAgICAgICAgaWQ6ICdoZWxsbycsXG4gICAgICAgICAgICB0aXRsZTogXCJTcGFjZSEhIVwiLFxuICAgICAgICAgICAgc2hvd0JhY29uOiB0cnVlLFxuICAgICAgICAgICAgYm9keTogXCJJIHdhcyBtYWRlIGEgS25pZ2h0IG9mIEVuZ2xhbmQgZm9yIGRvaW5nIGF3ZXNvbWUgU2NpZW5jZS4gV2UncmUgZ29pbmcgdG8gdXNlIHNjaWVuY2UgdG8gZmlndXJlIG91dCBjb29sIHRoaW5ncyBhYm91dCB0aGUgd29ybGQuXCIsXG4gICAgICAgICAgICBuZXh0OiBcIkxldCdzIGRvIHNjaWVuY2UhXCJcbiAgICAgICAgfSkpXG4gICAgfSxcblxuICAgIGZ1bmN0aW9uIChwcm9wcykge1xuICAgICAgICB2YXIgaHlwb3RoZXNpcyA9IHByb3BzLmRhdGEuaHlwb3RoZXNpc1xuICAgICAgICByZXR1cm4gU3RlcChfLmV4dGVuZChwcm9wcywge1xuICAgICAgICAgICAgaWQ6ICdkZXNjcmlwdGlvbicsXG4gICAgICAgICAgICB0aXRsZTogXCJFeHBlcmltZW50ICMxXCIsXG4gICAgICAgICAgICBvblVwZGF0ZTogZnVuY3Rpb24gKHByZXZQcm9wcykge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLmRhdGEuaHlwb3RoZXNpcyAmJiAhcHJldlByb3BzLmRhdGEuaHlwb3RoZXNpcykge1xuICAgICAgICAgICAgICAgICAgICBwcm9wcy5vbkh5cG90aGVzaXMocHJvcHMuZGF0YS5oeXBvdGhlc2lzKTtcbiAgICAgICAgICAgICAgICAgICAgREVCVUcgPyBwcm9wcy5vbk5leHQoKSA6IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvcHMub25OZXh0KClcbiAgICAgICAgICAgICAgICAgICAgfSwgNTAwKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBib2R5OiBSZWFjdC5ET00uZGl2KG51bGwsIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5wKG51bGwsIFwiV2hhdCBmYWxscyBmYXN0ZXI6IGEgdGVubmlzIGJhbGwgb3IgYSBib3dsaW5nIGJhbGw/XCIpLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00ucChudWxsLCBcIkEgXCIsIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwidWxpbmVcIn0sIFwiSHlwb3RoZXNpc1wiKSwgXCIgaXMgd2hhdCB5b3UgdGhpbmsgd2lsbCBoYXBwZW4uXCIpLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uaHIobnVsbCksIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJsYXJnZVwifSwgXCJJIHRoaW5rOlwiLCBcbiAgICAgICAgICAgICAgICAgICAgQnV0dG9uR3JvdXAoe1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiBcIndhbGt0aHJvdWdoX2h5cG90aGVzZXNcIiwgXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZDogaHlwb3RoZXNpcywgXG4gICAgICAgICAgICAgICAgICAgICAgICBvblNlbGVjdDogcHJvcHMuc2V0RGF0YS5iaW5kKG51bGwsICdoeXBvdGhlc2lzJyksIFxuICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uczogW1tcInRlbm5pc1wiLCBcIlRoZSB0ZW5uaXMgYmFsbCBmYWxscyBmYXN0ZXJcIl0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgW1wiYm93bGluZ1wiLCBcIlRoZSBib3dsaW5nIGJhbGwgZmFsbHMgZmFzdGVyXCJdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtcInNhbWVcIiwgXCJUaGV5IGZhbGwgdGhlIHNhbWVcIl1dfSlcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgLyoqaHlwb3RoZXNpcyAmJiA8cCBjbGFzc05hbWU9XCJ3YWxrdGhyb3VnaF9ncmVhdFwiPkdyZWF0ISBOb3cgd2UgZG8gc2NpZW5jZTwvcD4qKi9cbiAgICAgICAgICAgIClcbiAgICAgICAgfSkpXG4gICAgfSxcblxuICAgIGZ1bmN0aW9uIChwcm9wcykge1xuICAgICAgICB2YXIgZmlyc3RCYWxsID0gJ3Rlbm5pcydcbiAgICAgICAgdmFyIHNlY29uZEJhbGwgPSAnYm93bGluZydcbiAgICAgICAgdmFyIHByb3ZlciA9IHByb3BzLmRhdGEucHJvdmVyXG4gICAgICAgIHZhciBoeXBvdGhlc2lzID0gcHJvcHMuZGF0YS5oeXBvdGhlc2lzXG5cbiAgICAgICAgaWYgKGh5cG90aGVzaXMgPT09ICdib3dsaW5nJykge1xuICAgICAgICAgICAgZmlyc3RCYWxsID0gJ2Jvd2xpbmcnXG4gICAgICAgICAgICBzZWNvbmRCYWxsID0gJ3Rlbm5pcydcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciByZXNwb25zZXMgPSB7XG4gICAgICAgICAgICAndGVubmlzJzogJ05vcGUuIFRoYXQgd291bGQgc2hvdyB0aGF0IHRoZSB0ZW5uaXMgYmFsbCBmYWxscyBmYXN0ZXInLFxuICAgICAgICAgICAgJ2Jvd2xpbmcnOiAnTm9wZS4gVGhhdCB3b3VsZCBzaG93IHRoYXQgdGhlIGJvd2xpbmcgYmFsbCBmYWxscyBmYXN0ZXInLFxuICAgICAgICAgICAgJ3NhbWUnOiAnTm9wZS4gVGhhdCB3b3VsZCBzaG93IHRoYXQgdGhleSBmYWxsIHRoZSBzYW1lJ1xuICAgICAgICB9XG4gICAgICAgIHZhciBjb3JyZWN0ID0ge1xuICAgICAgICAgICAgJ3Rlbm5pcyc6ICdsZXNzJyxcbiAgICAgICAgICAgICdib3dsaW5nJzogJ2xlc3MnLFxuICAgICAgICAgICAgJ3NhbWUnOiAnc2FtZSdcbiAgICAgICAgfVxuICAgICAgICB2YXIgcHJvdmVyUmVzcG9uc2VcbiAgICAgICAgdmFyIGlzQ29ycmVjdCA9IHByb3ZlciA9PT0gY29ycmVjdFtoeXBvdGhlc2lzXVxuXG4gICAgICAgIGlmIChwcm92ZXIpIHtcbiAgICAgICAgICAgIGlmIChpc0NvcnJlY3QpIHtcbiAgICAgICAgICAgICAgICBwcm92ZXJSZXNwb25zZSA9IFwiRXhhY3RseSEgTm93IGxldCdzIGRvIHRoZSBleHBlcmltZW50LlwiXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHByb3ZlclJlc3BvbnNlID0gcmVzcG9uc2VzW3tcbiAgICAgICAgICAgICAgICAgICAgdGVubmlzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtb3JlOiAnYm93bGluZycsXG4gICAgICAgICAgICAgICAgICAgICAgICBzYW1lOiAnc2FtZSdcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgYm93bGluZzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgbW9yZTogJ3Rlbm5pcycsXG4gICAgICAgICAgICAgICAgICAgICAgICBzYW1lOiAnc2FtZSdcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgc2FtZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgbW9yZTogJ2Jvd2xpbmcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGVzczogJ3Rlbm5pcydcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1baHlwb3RoZXNpc11bcHJvdmVyXV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgZnV0dXJlSHlwb3RoZXNpcyA9IHtcbiAgICAgICAgICAgIHRlbm5pczogJ3RoZSB0ZW5uaXMgYmFsbCB3aWxsIGZhbGwgZmFzdGVyIHRoYW4gdGhlIGJvd2xpbmcgYmFsbCcsXG4gICAgICAgICAgICBib3dsaW5nOiAndGhlIGJvd2xpbmcgYmFsbCB3aWxsIGZhbGwgZmFzdGVyIHRoYW4gdGhlIHRlbm5pcyBiYWxsJyxcbiAgICAgICAgICAgIHNhbWU6ICd0aGUgdGVubmlzIGJhbGwgYW5kIHRoZSBib3dsaW5nIGJhbGwgd2lsbCBmYWxsIHRoZSBzYW1lJ1xuICAgICAgICB9W2h5cG90aGVzaXNdO1xuXG4gICAgICAgIHZhciBjdXJyZW50SHlwb3RoZXNpcyA9IHtcbiAgICAgICAgICAgIHRlbm5pczogJ2EgdGVubmlzIGJhbGwgZmFsbHMgZmFzdGVyIHRoYW4gYSBib3dsaW5nIGJhbGwnLFxuICAgICAgICAgICAgYm93bGluZzogJ2EgYm93bGluZyBiYWxsIGZhbGxzIGZhc3RlciB0aGFuIGEgdGVubmlzIGJhbGwnLFxuICAgICAgICAgICAgc2FtZTogJ2EgdGVubmlzIGJhbGwgZmFsbHMgdGhlIHNhbWUgYXMgYSBib3dsaW5nIGJhbGwnXG4gICAgICAgIH1baHlwb3RoZXNpc107XG5cbiAgICAgICAgcmV0dXJuIFN0ZXAoXy5leHRlbmQocHJvcHMsIHtcbiAgICAgICAgICAgIGlkOiAnZGVzaWduLWV4cGVyaW1lbnQnLFxuICAgICAgICAgICAgdGl0bGU6ICdEZXNpZ25pbmcgdGhlIEV4cGVyaW1lbnQnLFxuICAgICAgICAgICAgb25VcGRhdGU6IGZ1bmN0aW9uIChwcmV2UHJvcHMpIHtcbiAgICAgICAgICAgICAgICBpZiAocHJvdmVyICYmIGlzQ29ycmVjdCAmJiBwcm92ZXIgIT09IHByZXZQcm9wcy5kYXRhLnByb3Zlcikge1xuICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3BzLm9uTmV4dCgpXG4gICAgICAgICAgICAgICAgICAgIH0sIDIwMDApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBib2R5OiBSZWFjdC5ET00uZGl2KG51bGwsIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5wKG51bGwsIFwiTm93IHdlIG5lZWQgdG8gZGVzaWduIGFuIGV4cGVyaW1lbnQgdG8gdGVzdCB5b3VyXCIgKyAnICcgK1xuICAgICAgICAgICAgICAgIFwiaHlwb3RoZXNpcyEgSXQncyBpbXBvcnRhbnQgdG8gYmUgY2FyZWZ1bCB3aGVuIGRlc2lnbmluZyBhblwiICsgJyAnICtcbiAgICAgICAgICAgICAgICBcImV4cGVyaW1lbnQsIGJlY2F1c2Ugb3RoZXJ3aXNlIHlvdSBjb3VsZCBlbmQgdXAgXFxcInByb3ZpbmdcXFwiXCIgKyAnICcgK1xuICAgICAgICAgICAgICAgIFwic29tZXRoaW5nIHRoYXQncyBhY3R1YWxseSBmYWxzZS5cIiksIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5wKG51bGwsIFwiVG8gcHJvdmUgdGhhdCBcIiwgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJ1bGluZVwifSwgY3VycmVudEh5cG90aGVzaXMpLCBcIiwgd2UgY2FuIG1lYXN1cmUgdGhlIHRpbWUgdGhhdCBpdFwiICsgJyAnICtcbiAgICAgICAgICAgICAgICBcInRha2VzIGZvciBlYWNoIGJhbGwgdG8gZmFsbCB3aGVuIGRyb3BwZWQgZnJvbSBhIHNwZWNpZmljXCIgKyAnICcgK1xuICAgICAgICAgICAgICAgIFwiaGVpZ2h0LlwiKSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLnAobnVsbCwgXCJZb3VyIGh5cG90aGVzaXMgd2lsbCBiZSBwcm92ZW4gaWYgdGhlIFwiLCBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcInVsaW5lXCJ9LCBcInRpbWUgZm9yIHRoZSBcIiwgZmlyc3RCYWxsLCBcIiBiYWxsXCIpLCBcIiBpc1wiLCBcbiAgICAgICAgICAgICAgICAgICAgQnV0dG9uR3JvdXAoe1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiBcImJ0bi1ncm91cFwiLCBcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkOiBwcm92ZXIsIFxuICAgICAgICAgICAgICAgICAgICAgICAgb25TZWxlY3Q6IHByb3BzLnNldERhdGEuYmluZChudWxsLCAncHJvdmVyJyksIFxuICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uczogW1snbGVzcycsICdsZXNzIHRoYW4nXSwgWydtb3JlJywgJ21vcmUgdGhhbiddLCBbJ3NhbWUnLCAndGhlIHNhbWUgYXMnXV19KSwgXG4gICAgICAgICAgICAgICAgICAgIFwidGhlIFwiLCBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcInVsaW5lXCJ9LCBcInRpbWUgZm9yIHRoZSBcIiwgc2Vjb25kQmFsbCwgXCIgYmFsbFwiKSwgXCIuXCJcbiAgICAgICAgICAgICAgICApLCBcbiAgICAgICAgICAgICAgICBwcm92ZXIgJiYgUmVhY3QuRE9NLnAoe2NsYXNzTmFtZTogXCJkZXNpZ25fcmVzcG9uc2VcIn0sIHByb3ZlclJlc3BvbnNlKVxuICAgICAgICAgICAgKVxuICAgICAgICB9KSlcbiAgICB9LFxuXG4gICAgZnVuY3Rpb24gKHByb3BzKSB7XG4gICAgICAgIHJldHVybiBTdGVwKF8uZXh0ZW5kKHByb3BzLCB7XG4gICAgICAgICAgICBpZDogJ2V4cGVyaW1lbnQnLFxuICAgICAgICAgICAgc3R5bGU6ICdibGFjaycsXG4gICAgICAgICAgICB0aXRsZTogJ1RoZSBleHBlcmltZW50JyxcbiAgICAgICAgICAgIHBvczoge1xuICAgICAgICAgICAgICAgIGxlZnQ6IDM3NSxcbiAgICAgICAgICAgICAgICB0b3A6IDIwMFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGJvZHk6IFJlYWN0LkRPTS5wKG51bGwsIFwiSGVyZSB3ZSBoYXZlIHRvb2xzIHRvIGNvbmR1Y3Qgb3VyIGV4cGVyaW1lbnQuIFlvdSBjYW4gc2VlXCIgKyAnICcgK1xuICAgICAgICAgICAgXCJzb21lIGJvd2xpbmcgYmFsbHMgYW5kIHRlbm5pcyBiYWxscywgYW5kIHRob3NlIHJlZCBhbmQgZ3JlZW5cIiArICcgJyArXG4gICAgICAgICAgICBcInNlbnNvcnMgd2lsbCByZWNvcmQgdGhlIHRpbWUgaXQgdGFrZXMgZm9yIGEgYmFsbCB0byBmYWxsLlwiKSxcbiAgICAgICAgICAgIG9uUmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcHJvcHMuRXhlcmNpc2UuZGVwbG95QmFsbHMoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBERUJVRyA/IHByb3BzLm9uTmV4dCgpIDogc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9wcy5vbk5leHQoKVxuICAgICAgICAgICAgICAgICAgICB9LCAyMDAwKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICB9KSlcbiAgICB9LFxuXG4gICAgZnVuY3Rpb24gKHByb3BzKSB7XG4gICAgICAgIHJldHVybiBTdGVwKF8uZXh0ZW5kKHByb3BzLCB7XG4gICAgICAgICAgICBpZDogJ2Ryb3AnLFxuICAgICAgICAgICAgc3R5bGU6ICdibGFjaycsXG4gICAgICAgICAgICBwb3M6IHtcbiAgICAgICAgICAgICAgICB0b3A6IDIwMCxcbiAgICAgICAgICAgICAgICBsZWZ0OiAyMDBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBib2R5OiBSZWFjdC5ET00ucChudWxsLCBcIklmIHdlIGRyb3AgYSBiYWxsIGhlcmUgYWJvdmUgdGhlIGdyZWVuIHNlbnNvciwgd2UgY2FuXCIgKyAnICcgK1xuICAgICAgICAgICAgICAgIFwidGltZSBob3cgbG9uZyBpdCB0YWtlcyBmb3IgaXQgdG8gZmFsbCB0byB0aGUgcmVkIHNlbnNvci5cIiksXG4gICAgICAgICAgICBvblJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHByb3BzLkV4ZXJjaXNlLmRlbW9uc3RyYXRlRHJvcChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHByb3BzLm9uTmV4dCgpXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkpXG4gICAgfSxcblxuICAgIGZ1bmN0aW9uIChwcm9wcykge1xuICAgICAgICByZXR1cm4gU3RlcChfLmV4dGVuZChwcm9wcywge1xuICAgICAgICAgICAgaWQ6ICdsb2dib29rJyxcbiAgICAgICAgICAgIHN0eWxlOiAnYmxhY2snLFxuICAgICAgICAgICAgcG9zOiB7XG4gICAgICAgICAgICAgICAgdG9wOiAxMDAsXG4gICAgICAgICAgICAgICAgbGVmdDogNTAwXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYXJyb3c6IFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJhcnJvdy10by1sb2dib29rXCJ9KSxcbiAgICAgICAgICAgIGJvZHk6IFJlYWN0LkRPTS5wKG51bGwsIFwiVGhlIHRpbWUgaXMgdGhlbiByZWNvcmRlZCBvdmVyIGhlcmUgaW4geW91ciBsb2cgYm9vay4gRmlsbCB1cCB0aGlzIGxvZyBib29rIHdpdGggdGltZXMgZm9yIGJvdGggYmFsbHMgYW5kIGNvbXBhcmUgdGhlbS5cIiksXG4gICAgICAgICAgICBvblJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBwcm9wcy5vbk5leHQoKTtcbiAgICAgICAgICAgICAgICB9LCBERUJVRyA/IDEwMCA6IDUwMDApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KSk7XG4gICAgfSxcblxuICAgIGZ1bmN0aW9uIChwcm9wcykge1xuICAgICAgICByZXR1cm4gU3RlcChfLmV4dGVuZChwcm9wcywge1xuICAgICAgICAgICAgaWQ6ICdhbnN3ZXInLFxuICAgICAgICAgICAgc3R5bGU6ICdibGFjaycsXG4gICAgICAgICAgICBwb3M6IHtcbiAgICAgICAgICAgICAgICB0b3A6IDE1MCxcbiAgICAgICAgICAgICAgICBsZWZ0OiAyNTBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBhcnJvdzogUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImFycm93LXRvLWFuc3dlclwifSksXG4gICAgICAgICAgICBzaG93QmFjb246IHRydWUsXG4gICAgICAgICAgICB0aXRsZTogXCJOb3cgY29uZHVjdCB0aGUgZXhwZXJpbWVudCB0byB0ZXN0IHlvdXIgaHlwb3RoZXNpcyFcIixcbiAgICAgICAgICAgIGJvZHk6IFJlYWN0LkRPTS5wKG51bGwsIFwiT25jZSB5b3UndmUgY29sbGVjdGVkIGVub3VnaCBkYXRhIGluIHlvdXIgbG9nIGJvb2ssXCIgKyAnICcgK1xuICAgICAgICAgICAgXCJkZWNpZGUgd2hldGhlciB0aGUgZGF0YSBcIiwgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJ1bGluZVwifSwgXCJzdXBwb3J0XCIpLCBcIiBvclwiLCBcbiAgICAgICAgICAgICcgJywgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJ1bGluZVwifSwgXCJkaXNwcm92ZVwiKSwgXCIgeW91ciBoeXBvdGhlc2lzLiBUaGVuXCIgKyAnICcgK1xuICAgICAgICAgICAgXCJJIHdpbGwgZXZhbHVhdGUgeW91ciBleHBlcmltZW50IGFuZCBnaXZlIHlvdSBmZWVkYmFjay5cIiksXG4gICAgICAgICAgICBuZXh0OiBcIk9rLCBJJ20gcmVhZHlcIixcbiAgICAgICAgfSkpXG4gICAgfSxcbl1cbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xuXG52YXIgUFQgPSBSZWFjdC5Qcm9wVHlwZXNcbnZhciBjeCA9IFJlYWN0LmFkZG9ucy5jbGFzc1NldFxuXG52YXIgU3RlcCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ1N0ZXAnLFxuICAgIHByb3BUeXBlczoge1xuICAgICAgICB0aXRsZTogUFQuc3RyaW5nLFxuICAgICAgICBuZXh0OiBQVC5zdHJpbmcsXG4gICAgICAgIG9uUmVuZGVyOiBQVC5mdW5jLFxuICAgICAgICBvbkZhZGVkT3V0OiBQVC5mdW5jLFxuICAgICAgICBzaG93QmFjb246IFBULmJvb2wsXG4gICAgICAgIGZhZGVPdXQ6IFBULmJvb2wsXG4gICAgfSxcblxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc3R5bGU6ICd3aGl0ZSdcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5vblJlbmRlcikge1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5vblJlbmRlcigpXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5nZXRET01Ob2RlKCkuYWRkRXZlbnRMaXN0ZW5lcigndHJhbnNpdGlvbmVuZCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLmZhZGVPdXQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm9uRmFkZWRPdXQoKVxuICAgICAgICAgICAgfVxuICAgICAgICB9LmJpbmQodGhpcykpXG4gICAgfSxcblxuICAgIGNvbXBvbmVudERpZFVwZGF0ZTogZnVuY3Rpb24gKHByZXZQcm9wcykge1xuICAgICAgICBpZiAocHJldlByb3BzLmlkICE9PSB0aGlzLnByb3BzLmlkICYmXG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uUmVuZGVyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5vblJlbmRlcigpXG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMucHJvcHMub25VcGRhdGUpIHtcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25VcGRhdGUuY2FsbCh0aGlzLCBwcmV2UHJvcHMpXG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBzdHlsZVxuICAgICAgICBpZiAodGhpcy5wcm9wcy5wb3MpIHtcbiAgICAgICAgICAgIHN0eWxlID0ge1xuICAgICAgICAgICAgICAgIG1hcmdpblRvcDogMCxcbiAgICAgICAgICAgICAgICBtYXJnaW5MZWZ0OiAwLFxuICAgICAgICAgICAgICAgIHRvcDogdGhpcy5wcm9wcy5wb3MudG9wICsgJ3B4JyxcbiAgICAgICAgICAgICAgICBsZWZ0OiB0aGlzLnByb3BzLnBvcy5sZWZ0ICsgJ3B4J1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IGN4KHtcbiAgICAgICAgICAgIFwid2Fsa3Rocm91Z2hcIjogdHJ1ZSxcbiAgICAgICAgICAgIFwid2Fsa3Rocm91Z2gtLXdoaXRlXCI6IHRoaXMucHJvcHMuc3R5bGUgPT09ICd3aGl0ZScsXG4gICAgICAgICAgICBcIndhbGt0aHJvdWdoLS1ibGFja1wiOiB0aGlzLnByb3BzLnN0eWxlID09PSAnYmxhY2snXG4gICAgICAgIH0pfSwgXG4gICAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IGN4KHtcbiAgICAgICAgICAgICAgICBcIndhbGt0aHJvdWdoX3N0ZXBcIjogdHJ1ZSxcbiAgICAgICAgICAgICAgICBcIndhbGt0aHJvdWdoX3N0ZXAtLWZhZGUtb3V0XCI6IHRoaXMucHJvcHMuZmFkZU91dFxuICAgICAgICAgICAgfSkgKyBcIiB3YWxrdGhyb3VnaF9zdGVwLS1cIiArIHRoaXMucHJvcHMuaWQsIHN0eWxlOiBzdHlsZX0sIFxuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMuc2hvd0JhY29uICYmIFJlYWN0LkRPTS5pbWcoe2NsYXNzTmFtZTogXCJ3YWxrdGhyb3VnaF9zaXItZnJhbmNpc1wiLCBzcmM6IFwiaW1hZ2VzL3Npci1mcmFuY2lzLXRyYW5zcGFyZW50Mi5naWZcIn0pLCBcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLnRpdGxlICYmXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJ3YWxrdGhyb3VnaF90aXRsZVwifSwgdGhpcy5wcm9wcy50aXRsZSksIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJ3YWxrdGhyb3VnaF9ib2R5XCJ9LCBcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5ib2R5XG4gICAgICAgICAgICAgICAgKSwgXG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5hcnJvdyB8fCBmYWxzZSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcIndhbGt0aHJvdWdoX2J1dHRvbnNcIn0sIFxuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm5leHQgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5idXR0b24oe29uQ2xpY2s6IHRoaXMucHJvcHMub25OZXh0LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU6IFwid2Fsa3Rocm91Z2hfbmV4dCBidG4gYnRuLWRlZmF1bHRcIn0sIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMubmV4dFxuICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgIClcbiAgICAgICAgKVxuICAgIH1cbn0pXG5cbm1vZHVsZS5leHBvcnRzID0gU3RlcFxuIiwiLyoqIEBqc3ggUmVhY3QuRE9NICovXG5cbnZhciBXYWxrVGhyb3VnaCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ1dhbGtUaHJvdWdoJyxcbiAgICBwcm9wVHlwZXM6IHtcbiAgICAgICAgc3RlcHM6IFJlYWN0LlByb3BUeXBlcy5hcnJheS5pc1JlcXVpcmVkLFxuICAgICAgICBvbkRvbmU6IFJlYWN0LlByb3BUeXBlcy5mdW5jLFxuICAgIH0sXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzdGVwOiAwLFxuICAgICAgICAgICAgZGF0YToge30sXG4gICAgICAgICAgICBmYWRpbmc6IGZhbHNlXG4gICAgICAgIH1cbiAgICB9LFxuICAgIG9uRmFkZWRPdXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuZmFkaW5nID09PSBmYWxzZSkge1xuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5nb1RvKHRoaXMuc3RhdGUuZmFkaW5nKVxuICAgIH0sXG4gICAgZ29UbzogZnVuY3Rpb24gKG51bSkge1xuICAgICAgICBpZiAobnVtID49IHRoaXMucHJvcHMuc3RlcHMubGVuZ3RoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5vbkRvbmUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm9uRG9uZSgpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldFN0YXRlKHtzdGVwOiBudW0sIGZhZGluZzogZmFsc2V9KVxuICAgIH0sXG4gICAgc3RhcnRHb2luZzogZnVuY3Rpb24gKG51bSkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtmYWRpbmc6IG51bX0pXG4gICAgfSxcbiAgICBzZXREYXRhOiBmdW5jdGlvbiAoYXR0ciwgdmFsKSB7XG4gICAgICAgIHZhciBkYXRhID0gXy5leHRlbmQoe30sIHRoaXMuc3RhdGUuZGF0YSlcbiAgICAgICAgZGF0YVthdHRyXSA9IHZhbFxuICAgICAgICB0aGlzLnNldFN0YXRlKHtkYXRhOiBkYXRhfSlcbiAgICB9LFxuICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgU3RlcCA9IHRoaXMucHJvcHMuc3RlcHNbdGhpcy5zdGF0ZS5zdGVwXVxuICAgICAgICB2YXIgcHJvcHMgPSB7XG4gICAgICAgICAgICBvbk5leHQ6IHRoaXMuc3RhcnRHb2luZy5iaW5kKG51bGwsIHRoaXMuc3RhdGUuc3RlcCArIDEpLFxuICAgICAgICAgICAgc2V0RGF0YTogdGhpcy5zZXREYXRhLFxuICAgICAgICAgICAgZGF0YTogdGhpcy5zdGF0ZS5kYXRhLFxuICAgICAgICAgICAgZmFkZU91dDogdGhpcy5zdGF0ZS5mYWRpbmcgIT09IGZhbHNlLFxuICAgICAgICAgICAgb25GYWRlZE91dDogdGhpcy5vbkZhZGVkT3V0XG4gICAgICAgIH1cbiAgICAgICAgZm9yICh2YXIgbmFtZSBpbiB0aGlzLnByb3BzKSB7XG4gICAgICAgICAgICBwcm9wc1tuYW1lXSA9IHRoaXMucHJvcHNbbmFtZV1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gU3RlcChwcm9wcylcbiAgICB9XG59KVxuXG5tb2R1bGUuZXhwb3J0cyA9IFdhbGtUaHJvdWdoXG5cbiIsIlxudmFyIHV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBMb2dCb29rO1xuXG5mdW5jdGlvbiBMb2dCb29rKHdvcmxkLCBlbGVtLCBrZWVwLCBzZWVkZWRDb2x1bW5zKSB7XG4gICAgdGhpcy5fYXR0YWNoKHdvcmxkLCBlbGVtLCBrZWVwLCBzZWVkZWRDb2x1bW5zKTtcbn1cblxuTG9nQm9vay5wcm90b3R5cGUuX2F0dGFjaCA9IGZ1bmN0aW9uICh3b3JsZCwgZWxlbSwga2VlcCwgc2VlZGVkQ29sdW1ucykge1xuICAgIGNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgY29udGFpbmVyLmNsYXNzTmFtZSA9IFwibG9nLWJvb2tcIjtcbiAgICBlbGVtLmFwcGVuZENoaWxkKGNvbnRhaW5lcik7XG4gICAgaGVhZGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIik7XG4gICAgaGVhZGVyLmNsYXNzTmFtZSA9IFwibG9nLWJvb2staGVhZGVyXCI7XG4gICAgaGVhZGVyLmlubmVySFRNTCA9IFwiTG9nIEJvb2tcIjtcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoaGVhZGVyKTtcbiAgICBib2R5Q29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBib2R5Q29udGFpbmVyLmNsYXNzTmFtZSA9IFwibG9nLWJvb2stYm9keVwiO1xuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChib2R5Q29udGFpbmVyKTtcbiAgICB0aGlzLmJvZHlDb250YWluZXIgPSBib2R5Q29udGFpbmVyO1xuXG4gICAgdGhpcy5jb2x1bW5zQnlCb2R5TmFtZSA9IHt9O1xuICAgIHRoaXMubGFzdFVpZHMgPSB7fTtcbiAgICB0aGlzLnN0YXJ0VGltZUJ5Qm9keU5hbWUgPSB7fTtcbiAgICB0aGlzLmRhdGEgPSB7fTtcbiAgICB0aGlzLmtlZXAgPSBrZWVwO1xuICAgIHRoaXMud29ybGQgPSB3b3JsZDtcbiAgICB3b3JsZC5vbignc3RlcCcsIHRoaXMuaGFuZGxlVGljay5iaW5kKHRoaXMpKTtcblxuICAgIGlmIChzZWVkZWRDb2x1bW5zKSB7XG4gICAgICAgIF8uZWFjaChzZWVkZWRDb2x1bW5zLCBmdW5jdGlvbiAoY29sKSB7XG4gICAgICAgICAgICB0aGlzLmFkZENvbHVtbihjb2wubmFtZSwgY29sLmV4dHJhVGV4dCwgY29sLmNvbG9yKTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5rZWVwOyBpKyspIHtcbiAgICAgICAgICAgICAgICB0aGlzLm5ld1RpbWVyKGNvbC5uYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9XG59XG5cbkxvZ0Jvb2sucHJvdG90eXBlLmhhbmRsZVN0YXJ0ID0gZnVuY3Rpb24oY29sTmFtZSwgdWlkKSB7XG4gICAgaWYgKCF0aGlzLnN0YXJ0VGltZUJ5Qm9keU5hbWVbY29sTmFtZV0pIHtcbiAgICAgICAgdGhpcy5uZXdUaW1lcihjb2xOYW1lKTtcbiAgICB9XG4gICAgdGhpcy5sYXN0VWlkc1tjb2xOYW1lXSA9IHVpZDtcbiAgICB0aGlzLnN0YXJ0VGltZUJ5Qm9keU5hbWVbY29sTmFtZV0gPSB0aGlzLndvcmxkLl90aW1lO1xuICAgIHRoaXMucmVuZGVyVGltZXIoY29sTmFtZSwgMCk7XG59XG5cbkxvZ0Jvb2sucHJvdG90eXBlLmhhbmRsZUVuZCA9IGZ1bmN0aW9uKGNvbE5hbWUsIHVpZCkge1xuICAgIGlmIChjb2xOYW1lIGluIHRoaXMuZGF0YSAmJlxuICAgICAgICAgICAgdGhpcy5sYXN0VWlkc1tjb2xOYW1lXSA9PSB1aWQpIHtcbiAgICAgICAgdGhpcy5kYXRhW2NvbE5hbWVdLnB1c2goXG4gICAgICAgICAgICB0aGlzLndvcmxkLl90aW1lIC0gdGhpcy5zdGFydFRpbWVCeUJvZHlOYW1lW2NvbE5hbWVdKTtcbiAgICAgICAgZGVsZXRlIHRoaXMuc3RhcnRUaW1lQnlCb2R5TmFtZVtjb2xOYW1lXTtcbiAgICAgICAgZGVsZXRlIHRoaXMubGFzdFVpZHNbY29sTmFtZV07XG4gICAgICAgIHZhciBhdmcgPSBjbGVhbih1dGlsLmF2Zyh0aGlzLmRhdGFbY29sTmFtZV0pKTtcbiAgICAgICAgJCh0aGlzLmNvbHVtbnNCeUJvZHlOYW1lW2NvbE5hbWVdKS5maW5kKCcubG9nLWJvb2stYXZnJykudGV4dCgnQXZnOiAnICsgYXZnKTtcbiAgICB9XG59XG5cbkxvZ0Jvb2sucHJvdG90eXBlLmhhbmRsZVRpY2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgbmV3VGltZSA9IHRoaXMud29ybGQuX3RpbWU7XG4gICAgJC5lYWNoKHRoaXMuc3RhcnRUaW1lQnlCb2R5TmFtZSwgZnVuY3Rpb24gKG5hbWUsIHN0YXJ0VGltZSkge1xuICAgICAgICB0aGlzLnJlbmRlclRpbWVyKG5hbWUsIG5ld1RpbWUgLSBzdGFydFRpbWUpO1xuICAgIH0uYmluZCh0aGlzKSk7XG59XG5cbkxvZ0Jvb2sucHJvdG90eXBlLmFkZENvbHVtbiA9IGZ1bmN0aW9uIChuYW1lLCBleHRyYVRleHQsIGNvbG9yKSB7XG4gICAgdmFyIGNvbHVtbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgY29sdW1uLmNsYXNzTmFtZSA9IFwibG9nLWJvb2stY29sdW1uXCI7XG4gICAgdmFyIGhlYWRpbmcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKTtcbiAgICBoZWFkaW5nLmNsYXNzTmFtZSA9IFwibG9nLWJvb2staGVhZGluZ1wiO1xuICAgIGhlYWRpbmcuaW5uZXJIVE1MID0gbmFtZSArIGV4dHJhVGV4dDtcbiAgICAvKiogRGlzYWJsaW5nIHVudGlsIHdlIGZpbmQgc29tZXRoaW5nIHRoYXQgbG9va3MgZ3JlYXRcbiAgICBpZiAoY29sb3IpIHtcbiAgICAgICAgaGVhZGluZy5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBjb2xvcjtcbiAgICB9XG4gICAgKi9cbiAgICBjb2x1bW4uYXBwZW5kQ2hpbGQoaGVhZGluZyk7XG4gICAgdmFyIGF2ZXJhZ2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIGF2ZXJhZ2UuY2xhc3NOYW1lID0gJ2xvZy1ib29rLWF2Zyc7XG4gICAgYXZlcmFnZS5pbm5lckhUTUwgPSAnLS0nO1xuICAgIGNvbHVtbi5hcHBlbmRDaGlsZChhdmVyYWdlKTtcbiAgICB0aGlzLmJvZHlDb250YWluZXIuYXBwZW5kQ2hpbGQoY29sdW1uKTtcbiAgICB0aGlzLmNvbHVtbnNCeUJvZHlOYW1lW25hbWVdID0gY29sdW1uO1xuICAgIHRoaXMuZGF0YVtuYW1lXSA9IFtdO1xufVxuXG5Mb2dCb29rLnByb3RvdHlwZS5uZXdUaW1lciA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAvLyBqdXN0IGRvZXMgdGhlIERPTSBzZXR1cCwgZG9lc24ndCBhY3R1YWxseSBzdGFydCB0aGUgdGltZXJcbiAgICBpZiAoIXRoaXMuY29sdW1uc0J5Qm9keU5hbWVbbmFtZV0pIHtcbiAgICAgICAgdGhpcy5hZGRDb2x1bW4obmFtZSk7XG4gICAgfVxuICAgIHZhciBjb2wgPSB0aGlzLmNvbHVtbnNCeUJvZHlOYW1lW25hbWVdO1xuICAgIHZhciB0b1JlbW92ZSA9ICQoY29sKS5maW5kKFwiLmxvZy1ib29rLWRhdHVtXCIpLnNsaWNlKDAsLXRoaXMua2VlcCsxKTtcbiAgICB0b1JlbW92ZS5zbGlkZVVwKDUwMCwgZnVuY3Rpb24gKCkge3RvUmVtb3ZlLnJlbW92ZSgpO30pO1xuICAgIHRoaXMuZGF0YVtuYW1lXSA9IHRoaXMuZGF0YVtuYW1lXS5zbGljZSgtdGhpcy5rZWVwKzEpO1xuICAgIHZhciBkYXR1bSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpO1xuICAgIGRhdHVtLmNsYXNzTmFtZSA9IFwibG9nLWJvb2stZGF0dW1cIjtcblxuICAgIHZhciBhdmcgPSBjbGVhbih1dGlsLmF2Zyh0aGlzLmRhdGFbbmFtZV0pKTtcbiAgICAkKGNvbCkuZmluZCgnLmxvZy1ib29rLWF2ZycpLnRleHQoJ0F2ZzogJyArIGF2Zyk7XG5cbiAgICBjb2wuYXBwZW5kQ2hpbGQoZGF0dW0pO1xuICAgIHRoaXMucmVuZGVyVGltZXIobmFtZSk7XG59XG5cbmZ1bmN0aW9uIGNsZWFuKHRpbWUpIHtcbiAgICByZXR1cm4gcGFyc2VGbG9hdCh0aW1lIC8gMTAwMCkudG9GaXhlZCgyKSArICdzJztcbn1cblxuTG9nQm9vay5wcm90b3R5cGUucmVuZGVyVGltZXIgPSBmdW5jdGlvbiAobmFtZSwgdGltZSkge1xuICAgIHZhciBkYXR1bSA9IHRoaXMuY29sdW1uc0J5Qm9keU5hbWVbbmFtZV0ubGFzdENoaWxkO1xuICAgIGlmICh0aW1lKSB7XG4gICAgICAgIGRhdHVtLmlubmVySFRNTCA9IGNsZWFuKHRpbWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGRhdHVtLmlubmVySFRNTCA9IFwiLS1cIjtcbiAgICAgICAgZGF0dW0uc3R5bGUudGV4dEFsaWduID0gXCJjZW50ZXJcIjtcbiAgICB9XG59XG4iLCJ2YXIgR2F0ZSA9IHJlcXVpcmUoJy4vZ2F0ZScpO1xudmFyIEdyYXBoID0gcmVxdWlyZSgnLi9ncmFwaCcpO1xudmFyIEJhc2UgPSByZXF1aXJlKCcuL2Jhc2UnKTtcbnZhciBTdG9wd2F0Y2ggPSByZXF1aXJlKCcuL3N0b3B3YXRjaCcpO1xudmFyIFBsYXlQYXVzZSA9IHJlcXVpcmUoJy4vcGxheXBhdXNlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gQmFzZS5leHRlbmQoZnVuY3Rpb24gT3JiaXQoY29udGFpbmVyLCBvcHRpb25zKSB7XG4gICAgQmFzZS5jYWxsKHRoaXMsIGNvbnRhaW5lciwgb3B0aW9ucywgXCJpbWFnZXMvc3BhY2VfYmFja2dyb3VuZC5qcGdcIilcbn0sIHtcbiAgICBzZXR1cDogZnVuY3Rpb24gKGNvbnRhaW5lcikge1xuICAgICAgICB2YXIgd29ybGQgPSB0aGlzLndvcmxkO1xuICAgICAgICB2YXIgZCA9IDQuMDtcbiAgICAgICAgdmFyIHYgPSAwLjM2O1xuICAgICAgICB2YXIgY2lyY2xlMSA9IFBoeXNpY3MuYm9keSgnY2lyY2xlJywge1xuICAgICAgICAgICAgeDogdGhpcy5vcHRpb25zLndpZHRoIC8gMiAtIGQvMlxuICAgICAgICAgICAgLHk6IDIwMFxuICAgICAgICAgICAgLHZ4OiB2XG4gICAgICAgICAgICAscmFkaXVzOiAyXG4gICAgICAgICAgICAsbWFzczogMVxuICAgICAgICAgICAgLHJlc3RpdHV0aW9uOiAwXG4gICAgICAgICAgICAsc3R5bGVzOiB7XG4gICAgICAgICAgICAgICAgZmlsbFN0eWxlOiAnI2VlZGQyMidcbiAgICAgICAgICAgICAgICAsYW5nbGVJbmRpY2F0b3I6ICcjMTU1NDc5J1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdmFyIGNpcmNsZTIgPSBQaHlzaWNzLmJvZHkoJ2NpcmNsZScsIHtcbiAgICAgICAgICAgIHg6IHRoaXMub3B0aW9ucy53aWR0aCAvIDIgKyBkLzJcbiAgICAgICAgICAgICx5OiAyMDBcbiAgICAgICAgICAgICx2eDogdlxuICAgICAgICAgICAgLHJhZGl1czogMlxuICAgICAgICAgICAgLG1hc3M6IDFcbiAgICAgICAgICAgICxyZXN0aXR1dGlvbjogMFxuICAgICAgICAgICAgLHN0eWxlczoge1xuICAgICAgICAgICAgICAgIGZpbGxTdHlsZTogJyNlZWRkMjInXG4gICAgICAgICAgICAgICAgLGFuZ2xlSW5kaWNhdG9yOiAnIzE1NTQ3OSdcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGJpZyA9IFBoeXNpY3MuYm9keSgnY2lyY2xlJywge1xuICAgICAgICAgICAgeDogdGhpcy5vcHRpb25zLndpZHRoIC8gMlxuICAgICAgICAgICAgLHk6IDMwMFxuICAgICAgICAgICAgLHZ4OiAtMiAqIHYvMjVcbiAgICAgICAgICAgICxyYWRpdXM6IDEwXG4gICAgICAgICAgICAsbWFzczogMjVcbiAgICAgICAgICAgICxyZXN0aXR1dGlvbjogMFxuICAgICAgICAgICAgLHN0eWxlczoge1xuICAgICAgICAgICAgICAgIGZpbGxTdHlsZTogJyNlZWRkMjInXG4gICAgICAgICAgICAgICAgLGFuZ2xlSW5kaWNhdG9yOiAnIzE1NTQ3OSdcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHZhciBjb25zdHJhaW50cyA9IFBoeXNpY3MuYmVoYXZpb3IoJ3ZlcmxldC1jb25zdHJhaW50cycpO1xuICAgICAgICBjb25zdHJhaW50cy5kaXN0YW5jZUNvbnN0cmFpbnQoY2lyY2xlMSwgY2lyY2xlMiwgMSk7XG4gICAgICAgIHdvcmxkLmFkZChbY2lyY2xlMSwgY2lyY2xlMiwgYmlnLCBjb25zdHJhaW50c10pO1xuICAgICAgICB3b3JsZC5hZGQoUGh5c2ljcy5iZWhhdmlvcignbmV3dG9uaWFuJywgeyBzdHJlbmd0aDogLjUgfSkpO1xuXG4gICAgICAgIHZhciBtb29uUm90YXRpb24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgZHggPSBjaXJjbGUxLnN0YXRlLnBvcy54IC0gY2lyY2xlMi5zdGF0ZS5wb3MueDtcbiAgICAgICAgICAgIHZhciBkeSA9IGNpcmNsZTIuc3RhdGUucG9zLnkgLSBjaXJjbGUxLnN0YXRlLnBvcy55O1xuICAgICAgICAgICAgcmV0dXJuIE1hdGguYXRhbjIoZHksZHgpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHZhciBtb29uUmV2b2x1dGlvbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBkeCA9IChjaXJjbGUxLnN0YXRlLnBvcy54ICsgY2lyY2xlMi5zdGF0ZS5wb3MueCkvMiAtIGJpZy5zdGF0ZS5wb3MueDtcbiAgICAgICAgICAgIHZhciBkeSA9IGJpZy5zdGF0ZS5wb3MueSAtIChjaXJjbGUyLnN0YXRlLnBvcy55ICsgY2lyY2xlMS5zdGF0ZS5wb3MueSkvMjtcbiAgICAgICAgICAgIHJldHVybiBNYXRoLmF0YW4yKGR5LGR4KTtcbiAgICAgICAgfTtcblxuICAgICAgICB2YXIgZ3JhcGggPSBuZXcgR3JhcGgodGhpcy5jb250YWluZXIsIHtcbiAgICAgICAgICAgICdSb3QnOiB7Zm46IG1vb25Sb3RhdGlvbiwgdGl0bGU6ICdSb3RhdGlvbicsIG1pbnNjYWxlOiAyICogTWF0aC5QSX0sXG4gICAgICAgICAgICAnUmV2Jzoge2ZuOiBtb29uUmV2b2x1dGlvbiwgdGl0bGU6ICdSZXZvbHV0aW9uJywgbWluc2NhbGU6IDIgKiBNYXRoLlBJfSxcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgbWF4OiAyMDAwLFxuICAgICAgICAgICAgdG9wOiAxMCxcbiAgICAgICAgICAgIGxlZnQ6IHRoaXMub3B0aW9ucy53aWR0aCxcbiAgICAgICAgICAgIHdpZHRoOiAzMDAsXG4gICAgICAgICAgICB3b3JsZEhlaWdodDogdGhpcy5vcHRpb25zLmhlaWdodCxcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuZ3JhcGggPSBncmFwaDtcblxuICAgICAgICB0aGlzLndvcmxkLm9uKCdzdGVwJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZ3JhcGgudXBkYXRlKHdvcmxkLnRpbWVzdGVwKCkpO1xuICAgICAgICB9KTtcblxuICAgICAgICB2YXIgYnV0dG9uQ29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGJ1dHRvbkNvbnRhaW5lcik7XG4gICAgICAgIHZhciBwbGF5UGF1c2UgPSBuZXcgUGxheVBhdXNlKHdvcmxkLCBidXR0b25Db250YWluZXIpO1xuICAgIH1cbn0pO1xuXG4gICAgICAgIFxuIiwidmFyIEdhdGUgPSByZXF1aXJlKCcuL2dhdGUnKTtcbnZhciBCYXNlID0gcmVxdWlyZSgnLi9iYXNlJyk7XG52YXIgU3RvcHdhdGNoID0gcmVxdWlyZSgnLi9zdG9wd2F0Y2gnKTtcbnZhciBQbGF5UGF1c2UgPSByZXF1aXJlKCcuL3BsYXlwYXVzZScpO1xudmFyIHV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcbnZhciBMb2dCb29rID0gcmVxdWlyZSgnLi9sb2dib29rJylcbnZhciBOZXd0b24xV2Fsa3Rocm91Z2ggPSByZXF1aXJlKCcuL2ludHJvL25ld3RvbjFfaW50cm8uanN4JylcblxuZnVuY3Rpb24gcmFuZG9tKG1pbiwgbWF4KXtcbiAgICByZXR1cm4gKE1hdGgucmFuZG9tKCkgKiAobWF4LW1pbikgKyBtaW4pfDBcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBCYXNlLmV4dGVuZChmdW5jdGlvbiBBc3Rlcm9pZHMoY29udGFpbmVyLCBvcHRpb25zKSB7XG4gICAgQmFzZS5jYWxsKHRoaXMsIGNvbnRhaW5lciwgb3B0aW9ucywgJ2ltYWdlcy9zcGFjZV9iYWNrZ3JvdW5kLmpwZycsXG4gICAgICAgIHRydWUgLyogZGlzYWJsZUJvdW5kcyAqLylcbn0sIHtcbiAgICBzZXR1cDogZnVuY3Rpb24gKGNvbnRhaW5lcikge1xuICAgICAgICB2YXIgd29ybGQgPSB0aGlzLndvcmxkO1xuICAgICAgICB0aGlzLmhhbmRsZU5ld0FzdGVyb2lkKCk7XG4gICAgICAgIHZhciBzaWRlQmFyID0gdGhpcy5zaWRlQmFyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgc2lkZUJhci5jbGFzc05hbWUgPSBcInNpZGUtYmFyXCI7XG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChzaWRlQmFyKTtcblxuICAgICAgICB2YXIgZ2F0ZTEgPSBuZXcgR2F0ZSh3b3JsZCxcbiAgICAgICAgICAgIHV0aWwubWFrZVJlY3QoMCwgMCwgMTAsIDUwMCksXG4gICAgICAgICAgICBbNDAwLCAzNTBdLCBudWxsLCB7ZGVidWc6IHRydWUsIHNob3c6IHRydWUsIGNvbG9yOiAnZ3JlZW4nfSk7XG4gICAgICAgIHZhciBnYXRlMiA9IG5ldyBHYXRlKHdvcmxkLFxuICAgICAgICAgICAgdXRpbC5tYWtlUmVjdCgwLCAwLCAxMCwgNTAwKSxcbiAgICAgICAgICAgIFs2MDAsIDM1MF0sIG51bGwsIHtkZWJ1ZzogdHJ1ZSwgc2hvdzogdHJ1ZSwgY29sb3I6ICdncmVlbid9KTtcbiAgICAgICAgdmFyIGdhdGUzID0gbmV3IEdhdGUod29ybGQsXG4gICAgICAgICAgICB1dGlsLm1ha2VSZWN0KDAsIDAsIDEwLCA1MDApLFxuICAgICAgICAgICAgWzgwMCwgMzUwXSwgbnVsbCwge2RlYnVnOiB0cnVlLCBzaG93OiB0cnVlLCBjb2xvcjogJ2dyZWVuJ30pO1xuXG4gICAgICAgIHZhciBsb2dDb2x1bW5zID0gW1xuICAgICAgICAgICAge25hbWU6IFwiRGlzdGFuY2UgMVwiLCBleHRyYVRleHQ6IFwiXCJ9LFxuICAgICAgICAgICAge25hbWU6IFwiRGlzdGFuY2UgMlwiLCBleHRyYVRleHQ6IFwiXCJ9LFxuICAgICAgICBdO1xuICAgICAgICB2YXIgbG9nQm9vayA9IHRoaXMubG9nQm9vayA9IG5ldyBMb2dCb29rKHdvcmxkLCBzaWRlQmFyLCA1LCBsb2dDb2x1bW5zKTtcbiAgICAgICAgZ2F0ZTEub24oJ2VudGVyJywgZnVuY3Rpb24oZWxlbSkge1xuICAgICAgICAgICAgbG9nQm9vay5oYW5kbGVTdGFydChcIkRpc3RhbmNlIDFcIiwgZWxlbS5ib2R5LnVpZCk7XG4gICAgICAgIH0uYmluZCh0aGlzKSlcbiAgICAgICAgZ2F0ZTIub24oJ2VudGVyJywgZnVuY3Rpb24oZWxlbSkge1xuICAgICAgICAgICAgbG9nQm9vay5oYW5kbGVFbmQoXCJEaXN0YW5jZSAxXCIsIGVsZW0uYm9keS51aWQpO1xuICAgICAgICAgICAgbG9nQm9vay5oYW5kbGVTdGFydChcIkRpc3RhbmNlIDJcIiwgZWxlbS5ib2R5LnVpZCk7XG4gICAgICAgIH0uYmluZCh0aGlzKSlcbiAgICAgICAgZ2F0ZTMub24oJ2VudGVyJywgZnVuY3Rpb24oZWxlbSkge1xuICAgICAgICAgICAgbG9nQm9vay5oYW5kbGVFbmQoXCJEaXN0YW5jZSAyXCIsIGVsZW0uYm9keS51aWQpO1xuICAgICAgICB9LmJpbmQodGhpcykpXG5cbiAgICAgICAgdmFyIHBsYXlQYXVzZUNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChwbGF5UGF1c2VDb250YWluZXIpO1xuICAgICAgICB2YXIgcGxheVBhdXNlID0gbmV3IFBsYXlQYXVzZSh3b3JsZCwgcGxheVBhdXNlQ29udGFpbmVyKTtcbiAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKHRoaXMuY3JlYXRlTmV3QXN0ZXJvaWRMaW5rKCkpXG5cbiAgICAgICAgY29uc29sZS5sb2coJ29wdGlvbnM6ICcgKyB0aGlzLm9wdGlvbnMpXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMud2Fsaykge1xuICAgICAgICAgICAgTmV3dG9uMVdhbGt0aHJvdWdoKHRoaXMsIGZ1bmN0aW9uIChoeXBvdGhlc2lzKSB7XG4vLyAgICAgICAgICAgICAgICB0aGlzLnNldHVwRGF0YUNoZWNrZXIoaHlwb3RoZXNpcyk7XG4gICAgICAgICAgICB9LmJpbmQodGhpcykpXG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgY3JlYXRlTmV3QXN0ZXJvaWRMaW5rOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG5ld0FzdGVyb2lkTGluayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJhXCIpO1xuICAgICAgICBuZXdBc3Rlcm9pZExpbmsuaHJlZiA9IFwiI1wiO1xuICAgICAgICBuZXdBc3Rlcm9pZExpbmsuaW5uZXJIVE1MID0gXCJOZXcgYXN0ZXJvaWRcIjtcbiAgICAgICAgbmV3QXN0ZXJvaWRMaW5rLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlTmV3QXN0ZXJvaWQoKTtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICAgIHJldHVybiBuZXdBc3Rlcm9pZExpbms7XG4gICAgfSxcblxuICAgIGhhbmRsZU5ld0FzdGVyb2lkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHdvcmxkID0gdGhpcy53b3JsZDtcblxuICAgICAgICB2YXIgbWluWCA9IDUwO1xuICAgICAgICB2YXIgbWF4WCA9IDMwMDtcbiAgICAgICAgdmFyIG1pblkgPSA1MDtcbiAgICAgICAgdmFyIG1heFkgPSA2NTA7XG4gICAgICAgIHZhciBtaW5BbmdsZSA9IDA7XG4gICAgICAgIHZhciBtYXhBbmdsZSA9IDIqTWF0aC5QSTtcblxuICAgICAgICB3b3JsZC5hZGQoUGh5c2ljcy5ib2R5KCdjaXJjbGUnLCB7XG4gICAgICAgICAgICB4OiByYW5kb20obWluWCwgbWF4WCksXG4gICAgICAgICAgICB5OiByYW5kb20obWluWSwgbWF4WSksXG4gICAgICAgICAgICByYWRpdXM6IDUwLFxuICAgICAgICAgICAgYW5nbGU6IHJhbmRvbShtaW5BbmdsZSwgbWF4QW5nbGUpLFxuICAgICAgICAgICAgbWFzczogMTAwMCxcbiAgICAgICAgICAgIHJlc3RpdHV0aW9uOiAwLFxuICAgICAgICAgICAgc3R5bGVzOiB7XG4gICAgICAgICAgICAgICAgaW1hZ2U6ICdpbWFnZXMvYXN0ZXJvaWQucG5nJyxcbiAgICAgICAgICAgICAgICBmaWxsU3R5bGU6ICcjZmZjYzAwJ1xuICAgICAgICAgICAgfVxuICAgICAgICB9KSk7XG4gICAgfVxufSk7XG5cbiAgICAgICAgXG4iLCJ2YXIgR2F0ZSA9IHJlcXVpcmUoJy4vZ2F0ZScpO1xudmFyIEJhc2UgPSByZXF1aXJlKCcuL2Jhc2UnKTtcbnZhciBTdG9wd2F0Y2ggPSByZXF1aXJlKCcuL3N0b3B3YXRjaCcpO1xudmFyIFBsYXlQYXVzZSA9IHJlcXVpcmUoJy4vcGxheXBhdXNlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gQmFzZS5leHRlbmQoZnVuY3Rpb24gT3JiaXQoY29udGFpbmVyLCBvcHRpb25zKSB7XG4gICAgQmFzZS5jYWxsKHRoaXMsIGNvbnRhaW5lciwgb3B0aW9ucywgXCJpbWFnZXMvc3BhY2VfYmFja2dyb3VuZC5qcGdcIilcbn0sIHtcbiAgICBzZXR1cDogZnVuY3Rpb24gKGNvbnRhaW5lcikge1xuICAgICAgICB2YXIgd29ybGQgPSB0aGlzLndvcmxkO1xuICAgICAgICB2YXIgcmVkQmFsbCA9IFBoeXNpY3MuYm9keSgnY2lyY2xlJywge1xuICAgICAgICAgICAgeDogdGhpcy5vcHRpb25zLndpZHRoIC8gMlxuICAgICAgICAgICAgLHk6IDQwXG4gICAgICAgICAgICAsdng6IDBcbiAgICAgICAgICAgICx2eTogLTEvOFxuICAgICAgICAgICAgLHJhZGl1czogNFxuICAgICAgICAgICAgLG1hc3M6IDRcbiAgICAgICAgICAgICxyZXN0aXR1dGlvbjogMFxuICAgICAgICAgICAgLHN0eWxlczoge1xuICAgICAgICAgICAgICAgIGZpbGxTdHlsZTogJyNkNjhiNjInIC8vcmVkXG4gICAgICAgICAgICAgICAgLGFuZ2xlSW5kaWNhdG9yOiAnIzE1NTQ3OSdcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHZhciBncmVlbkJhbGwgPSBQaHlzaWNzLmJvZHkoJ2NpcmNsZScsIHtcbiAgICAgICAgICAgIHg6IHRoaXMub3B0aW9ucy53aWR0aCAvIDJcbiAgICAgICAgICAgICx5OiA2MFxuICAgICAgICAgICAgLHZ4OiAzLzhcbiAgICAgICAgICAgICx2eTogMS84XG4gICAgICAgICAgICAscmFkaXVzOiA0XG4gICAgICAgICAgICAsbWFzczogNFxuICAgICAgICAgICAgLHJlc3RpdHV0aW9uOiAwXG4gICAgICAgICAgICAsc3R5bGVzOiB7XG4gICAgICAgICAgICAgICAgZmlsbFN0eWxlOiAnIzI2ZWI2MicgLy9ncmVlblxuICAgICAgICAgICAgICAgICxhbmdsZUluZGljYXRvcjogJyMxNTU0NzknXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICB2YXIgYmlnQmFsbCA9IFBoeXNpY3MuYm9keSgnY2lyY2xlJywge1xuICAgICAgICAgICAgeDogdGhpcy5vcHRpb25zLndpZHRoIC8gMlxuICAgICAgICAgICAgLHk6IDMwMFxuICAgICAgICAgICAgLHZ4OiAtMy81MFxuICAgICAgICAgICAgLHJhZGl1czogMTBcbiAgICAgICAgICAgICxtYXNzOiAyNVxuICAgICAgICAgICAgLHJlc3RpdHV0aW9uOiAwXG4gICAgICAgICAgICAsc3R5bGVzOiB7XG4gICAgICAgICAgICAgICAgZmlsbFN0eWxlOiAnIzI2OGJkMidcbiAgICAgICAgICAgICAgICAsYW5nbGVJbmRpY2F0b3I6ICcjMTU1NDc5J1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgd29ybGQuYWRkKFtyZWRCYWxsLCBncmVlbkJhbGwsIGJpZ0JhbGxdKTtcbiAgICAgICAgd29ybGQuYWRkKFBoeXNpY3MuYmVoYXZpb3IoJ25ld3RvbmlhbicsIHsgc3RyZW5ndGg6IC41IH0pKTtcblxuICAgICAgICB2YXIgYnV0dG9uQ29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGJ1dHRvbkNvbnRhaW5lcik7XG4gICAgICAgIHZhciBwbGF5UGF1c2UgPSBuZXcgUGxheVBhdXNlKHdvcmxkLCBidXR0b25Db250YWluZXIpO1xuICAgICAgICAvLyB2YXIgZ2F0ZVBvbHlnb24gPSBbe3g6IC03MDAsIHk6IC0xMDB9LCB7eDogNzAwLCB5OiAtMTAwfSwge3g6IDcwMCwgeTogMTM5fSwge3g6IC03MDAsIHk6IDEzOX1dO1xuICAgICAgICAvLyB2YXIgZ2F0ZVBvbHlnb24yID0gW3t4OiAtNzAwLCB5OiAtMjYxfSwge3g6IDcwMCwgeTogLTI2MX0sIHt4OiA3MDAsIHk6IDIwMH0sIHt4OiAtNzAwLCB5OiAyMDB9XTtcbiAgICAgICAgLy8gdmFyIGdhdGVzID0gW11cbiAgICAgICAgLy8gZ2F0ZXMucHVzaChuZXcgR2F0ZSh3b3JsZCwgYnV0dG9uQ29udGFpbmVyLCBnYXRlUG9seWdvbiwgWzcwMCwgMTAwXSwgcmVkQmFsbCwge2RlYnVnOiB0cnVlLCBzaG93OiB0cnVlfSkpO1xuICAgICAgICAvLyBnYXRlcy5wdXNoKG5ldyBHYXRlKHdvcmxkLCBidXR0b25Db250YWluZXIsIGdhdGVQb2x5Z29uLCBbNzAwLCAxMDBdLCBncmVlbkJhbGwsIHtkZWJ1ZzogdHJ1ZSwgc2hvdzogdHJ1ZX0pKTtcbiAgICAgICAgLy8gZ2F0ZXMucHVzaChuZXcgR2F0ZSh3b3JsZCwgYnV0dG9uQ29udGFpbmVyLCBnYXRlUG9seWdvbiwgWzcwMCwgMTAwXSwgYmlnQmFsbCwge2RlYnVnOiB0cnVlLCBzaG93OiB0cnVlfSkpO1xuICAgICAgICAvLyBnYXRlcy5wdXNoKG5ldyBHYXRlKHdvcmxkLCBidXR0b25Db250YWluZXIsIGdhdGVQb2x5Z29uMiwgWzcwMCwgNTAwXSwgcmVkQmFsbCwge2RlYnVnOiB0cnVlLCBzaG93OiB0cnVlfSkpO1xuICAgICAgICAvLyBnYXRlcy5wdXNoKG5ldyBHYXRlKHdvcmxkLCBidXR0b25Db250YWluZXIsIGdhdGVQb2x5Z29uMiwgWzcwMCwgNTAwXSwgZ3JlZW5CYWxsLCB7ZGVidWc6IHRydWUsIHNob3c6IHRydWV9KSk7XG4gICAgICAgIC8vIGdhdGVzLnB1c2gobmV3IEdhdGUod29ybGQsIGJ1dHRvbkNvbnRhaW5lciwgZ2F0ZVBvbHlnb24yLCBbNzAwLCA1MDBdLCBiaWdCYWxsLCB7ZGVidWc6IHRydWUsIHNob3c6IHRydWV9KSk7XG4gICAgICAgIC8vIGdhdGVzLmZvckVhY2goZnVuY3Rpb24oZ2F0ZSkge1xuICAgICAgICAgICAgLy8gdmFyIHN0b3B3YXRjaCA9IG5ldyBTdG9wd2F0Y2god29ybGQsIGJ1dHRvbkNvbnRhaW5lciwgMSk7XG4gICAgICAgICAgICAvLyBnYXRlLm9uKCdlbnRlcicsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAvLyBzdG9wd2F0Y2gucmVzZXQoKTtcbiAgICAgICAgICAgICAgICAvLyBzdG9wd2F0Y2guc3RhcnQoKTtcbiAgICAgICAgICAgIC8vIH0pO1xuICAgICAgICAgICAgLy8gZ2F0ZS5vbignZXhpdCcsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAvLyBzdG9wd2F0Y2guc3RvcCgpXG4gICAgICAgICAgICAvLyB9KTtcbiAgICAgICAgLy8gfSk7XG4gICAgfVxufSk7XG5cbiAgICAgICAgXG4iLCJtb2R1bGUuZXhwb3J0cyA9IFBsYXlQYXVzZTtcblxuZnVuY3Rpb24gUGxheVBhdXNlKHdvcmxkLCBjb250YWluZXIpIHtcbiAgICB0aGlzLl9hdHRhY2god29ybGQsIGNvbnRhaW5lcik7XG59XG5cblBsYXlQYXVzZS5wcm90b3R5cGUuY3JlYXRlQnV0dG9uID0gZnVuY3Rpb24oYWN0aW9uLCBoYW5kbGVyKSB7XG4gICAgdmFyIGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYVwiKTtcbiAgICBhLmhyZWYgPSBcIiNcIiArIGFjdGlvbjtcbiAgICBhLmlubmVySFRNTCA9IGFjdGlvbjtcbiAgICBhLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgaGFuZGxlcigpO1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH0uYmluZCh0aGlzKSk7XG4gICAgcmV0dXJuIGE7XG59XG5cblBsYXlQYXVzZS5wcm90b3R5cGUuX2F0dGFjaCA9IGZ1bmN0aW9uKHdvcmxkLCBjb250YWluZXIpIHtcbiAgICB0aGlzLnBhdXNlU3ltYm9sID0gXCLilpDilpBcIjtcbiAgICB0aGlzLnBsYXlTeW1ib2wgPSBcIuKWulwiO1xuICAgIHRoaXMuYnV0dG9uID0gdGhpcy5jcmVhdGVCdXR0b24odGhpcy5wYXVzZVN5bWJvbCwgdGhpcy50b2dnbGUuYmluZCh0aGlzKSk7XG4gICAgdGhpcy53b3JsZCA9IHdvcmxkO1xuICAgIHZhciB3aWRnZXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIHdpZGdldC5jbGFzc05hbWUgPSBcInBsYXlwYXVzZVwiO1xuICAgIHdpZGdldC5hcHBlbmRDaGlsZCh0aGlzLmJ1dHRvbik7XG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKHdpZGdldCk7XG59XG5cblBsYXlQYXVzZS5wcm90b3R5cGUudG9nZ2xlID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMud29ybGQuaXNQYXVzZWQoKSkge1xuICAgICAgICB0aGlzLmJ1dHRvbi5pbm5lckhUTUwgPSB0aGlzLnBhdXNlU3ltYm9sO1xuICAgICAgICB0aGlzLmJ1dHRvbi5ocmVmID0gJyMnICsgdGhpcy5wYXVzZVN5bWJvbDtcbiAgICAgICAgdGhpcy53b3JsZC51bnBhdXNlKClcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmJ1dHRvbi5pbm5lckhUTUwgPSB0aGlzLnBsYXlTeW1ib2w7XG4gICAgICAgIHRoaXMuYnV0dG9uLmhyZWYgPSAnIycgKyB0aGlzLnBsYXlTeW1ib2w7XG4gICAgICAgIHRoaXMud29ybGQucGF1c2UoKVxuICAgIH1cbn1cblxuXG4iLCJ2YXIgQmFzZSA9IHJlcXVpcmUoJy4vYmFzZScpO1xudmFyIEdhdGUgPSByZXF1aXJlKCcuL2dhdGUnKTtcbnZhciBTdG9wd2F0Y2ggPSByZXF1aXJlKCcuL3N0b3B3YXRjaCcpO1xudmFyIFBsYXlQYXVzZSA9IHJlcXVpcmUoJy4vcGxheXBhdXNlJyk7XG52YXIgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2UuZXh0ZW5kKGZ1bmN0aW9uIFNsb3BlKGNvbnRhaW5lciwgb3B0aW9ucykge1xuICAgIEJhc2UuY2FsbCh0aGlzLCBjb250YWluZXIsIG9wdGlvbnMsICdpbWFnZXMvbGFiX2JhY2tncm91bmQuanBnJylcbn0sIHtcbiAgICBkcm9wSW5Cb2R5OiBmdW5jdGlvbiAocmFkaXVzLCB5KSB7XG4gICAgICAgIGZ1bmN0aW9uIHJhbmRvbShtaW4sIG1heCl7XG4gICAgICAgICAgICByZXR1cm4gKE1hdGgucmFuZG9tKCkgKiAobWF4LW1pbikgKyBtaW4pfDBcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMud29ybGQuYWRkKFBoeXNpY3MuYm9keSgnY2lyY2xlJywge1xuICAgICAgICAgICAgeDogMTAwLFxuICAgICAgICAgICAgeTogeSxcbiAgICAgICAgICAgIHZ4OiByYW5kb20oLTUsIDUpLzEwMCxcbiAgICAgICAgICAgIHJhZGl1czogcmFkaXVzLFxuICAgICAgICAgICAgcmVzdGl0dXRpb246IDAuOSxcbiAgICAgICAgICAgIHN0eWxlczoge1xuICAgICAgICAgICAgICAgIGZpbGxTdHlsZTogJyMyNjhiZDInLFxuICAgICAgICAgICAgICAgIGFuZ2xlSW5kaWNhdG9yOiAnIzE1NTQ3OSdcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkpO1xuICAgIH0sXG4gICAgc2V0dXA6IGZ1bmN0aW9uIChjb250YWluZXIpIHtcbiAgICAgICAgdmFyIHdvcmxkID0gdGhpcy53b3JsZFxuICAgICAgICB3b3JsZC5hZGQoUGh5c2ljcy5iZWhhdmlvcignY29uc3RhbnQtYWNjZWxlcmF0aW9uJykpO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNTsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgcmFkaXVzID0gMjAgKyAxMCAqIGk7XG4gICAgICAgICAgICB0aGlzLmRyb3BJbkJvZHkocmFkaXVzLCAzMDAgLSBpICogNTApO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy53b3JsZC5hZGQoUGh5c2ljcy5ib2R5KCdjb252ZXgtcG9seWdvbicsIHtcbiAgICAgICAgICAgIHg6IDQ1MCxcbiAgICAgICAgICAgIHk6IDYwMCxcbiAgICAgICAgICAgIHZlcnRpY2VzOiBbXG4gICAgICAgICAgICAgICAge3g6IDAsIHk6IDB9LFxuICAgICAgICAgICAgICAgIHt4OiAwLCB5OiAzMDB9LFxuICAgICAgICAgICAgICAgIHt4OiA4MDAsIHk6IDMwMH0sXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgdHJlYXRtZW50OiAnc3RhdGljJyxcbiAgICAgICAgICAgIGNvZjogMSxcbiAgICAgICAgICAgIHN0eWxlczoge1xuICAgICAgICAgICAgICAgIGZpbGxTdHlsZTogJyNkMzM2ODInLFxuICAgICAgICAgICAgICAgIGFuZ2xlSW5kaWNhdG9yOiAnIzc1MWI0YidcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkpXG5cbiAgICAgICAgdmFyIGJ1dHRvbkNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChidXR0b25Db250YWluZXIpO1xuICAgICAgICB2YXIgc3RvcHdhdGNoID0gbmV3IFN0b3B3YXRjaCh3b3JsZCwgYnV0dG9uQ29udGFpbmVyLCAxKTtcbiAgICAgICAgdmFyIHBsYXlQYXVzZSA9IG5ldyBQbGF5UGF1c2Uod29ybGQsIGJ1dHRvbkNvbnRhaW5lcik7XG4gICAgICAgIHZhciB0b3BHYXRlID0gbmV3IEdhdGUod29ybGQsXG4gICAgICAgICAgICB1dGlsLm1ha2VSZWN0KDAsIDAsIDYwLCAxMDApLFxuICAgICAgICAgICAgWzM1MCwgNDAwXSxcbiAgICAgICAgICAgIG51bGwsIHtkZWJ1ZzogdHJ1ZSwgc2hvdzogdHJ1ZSwgY29sb3I6ICdncmVlbid9KTtcbiAgICAgICAgdmFyIGJvdHRvbUdhdGUgPSBuZXcgR2F0ZSh3b3JsZCxcbiAgICAgICAgICAgIHV0aWwubWFrZVJlY3QoMCwgMCwgNjAsIDEwMCksXG4gICAgICAgICAgICBbODAwLCA1NzBdLFxuICAgICAgICAgICAgbnVsbCwge2RlYnVnOiB0cnVlLCBzaG93OiB0cnVlLCBjb2xvcjogJ3JlZCd9KTtcblxuICAgICAgICB0b3BHYXRlLm9uKCdlbnRlcicsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgIHN0b3B3YXRjaC5yZXNldCgpLnN0YXJ0KCk7XG4gICAgICAgIH0pXG4gICAgICAgIGJvdHRvbUdhdGUub24oJ2VudGVyJywgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgc3RvcHdhdGNoLnN0b3AoKVxuICAgICAgICB9KVxuXG4gICAgfVxufSk7XG5cbiIsIlxubW9kdWxlLmV4cG9ydHMgPSBTdG9wd2F0Y2g7XG5cbmZ1bmN0aW9uIFN0b3B3YXRjaCh3b3JsZCwgZWxlbSkge1xuICAgIHRoaXMuX2F0dGFjaCh3b3JsZCwgZWxlbSk7XG59XG5cblN0b3B3YXRjaC5wcm90b3R5cGUuX2F0dGFjaCA9IGZ1bmN0aW9uKHdvcmxkLCBlbGVtKSB7XG4gICAgdGhpcy53b3JsZCA9IHdvcmxkO1xuICAgIHRoaXMudGltZXIgPSB0aGlzLmNyZWF0ZVRpbWVyKCksXG4gICAgdGhpcy5zdGFydEJ1dHRvbiA9IHRoaXMuY3JlYXRlQnV0dG9uKFwic3RhcnRcIiwgdGhpcy5zdGFydC5iaW5kKHRoaXMpKSxcbiAgICB0aGlzLnN0b3BCdXR0b24gPSB0aGlzLmNyZWF0ZUJ1dHRvbihcInN0b3BcIiwgdGhpcy5zdG9wLmJpbmQodGhpcykpLFxuICAgIHRoaXMucmVzZXRCdXR0b24gPSB0aGlzLmNyZWF0ZUJ1dHRvbihcInJlc2V0XCIsIHRoaXMucmVzZXQuYmluZCh0aGlzKSksXG4gICAgdGhpcy5jbG9jayA9IDA7XG5cbiAgICAvLyBVcGRhdGUgb24gZXZlcnkgdGltZXIgdGlja1xuICAgIHRoaXMud29ybGQub24oJ3N0ZXAnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy51cGRhdGUoKTtcbiAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgdmFyIHdpZGdldCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgd2lkZ2V0LmNsYXNzTmFtZSA9IFwic3RvcHdhdGNoXCI7XG5cbiAgICAvLyBhcHBlbmQgZWxlbWVudHNcbiAgICB3aWRnZXQuYXBwZW5kQ2hpbGQodGhpcy50aW1lcik7XG4gICAgd2lkZ2V0LmFwcGVuZENoaWxkKHRoaXMuc3RhcnRCdXR0b24pO1xuICAgIHdpZGdldC5hcHBlbmRDaGlsZCh0aGlzLnN0b3BCdXR0b24pO1xuICAgIHdpZGdldC5hcHBlbmRDaGlsZCh0aGlzLnJlc2V0QnV0dG9uKTtcblxuICAgIGVsZW0uYXBwZW5kQ2hpbGQod2lkZ2V0KTtcbn1cblxuU3RvcHdhdGNoLnByb3RvdHlwZS5jcmVhdGVUaW1lciA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKTtcbn1cblxuU3RvcHdhdGNoLnByb3RvdHlwZS5jcmVhdGVCdXR0b24gPSBmdW5jdGlvbihhY3Rpb24sIGhhbmRsZXIpIHtcbiAgICB2YXIgYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJhXCIpO1xuICAgIGEuaHJlZiA9IFwiI1wiICsgYWN0aW9uO1xuICAgIGEuaW5uZXJIVE1MID0gYWN0aW9uO1xuICAgIGEuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICBoYW5kbGVyKCk7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgfS5iaW5kKHRoaXMpKTtcbiAgICByZXR1cm4gYTtcbn1cblxuU3RvcHdhdGNoLnByb3RvdHlwZS5zdGFydCA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucnVubmluZyA9IHRydWVcbiAgICByZXR1cm4gdGhpcztcbn1cblxuU3RvcHdhdGNoLnByb3RvdHlwZS5zdG9wID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5ydW5uaW5nID0gZmFsc2VcbiAgICByZXR1cm4gdGhpcztcbn1cblxuU3RvcHdhdGNoLnByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuY2xvY2sgPSAwO1xuICAgIHRoaXMucmVuZGVyKCk7XG4gICAgcmV0dXJuIHRoaXM7XG59XG5cblN0b3B3YXRjaC5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIG5ld1RpbWUgPSB0aGlzLndvcmxkLl90aW1lO1xuICAgIGlmICh0aGlzLnJ1bm5pbmcgJiYgdGhpcy5sYXN0VGltZSkge1xuICAgICAgICB0aGlzLmNsb2NrICs9IG5ld1RpbWUgLSB0aGlzLmxhc3RUaW1lO1xuICAgIH1cbiAgICB0aGlzLmxhc3RUaW1lID0gbmV3VGltZTtcbiAgICB0aGlzLnJlbmRlcigpO1xufVxuXG5TdG9wd2F0Y2gucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMudGltZXIuaW5uZXJIVE1MID0gcGFyc2VGbG9hdCh0aGlzLmNsb2NrIC8gMTAwMCkudG9GaXhlZCgyKTtcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gdGVycmFpbjtcblxuZnVuY3Rpb24gdGVycmFpbiggcGFyZW50ICl7XG4gICAgLy8gbW9zdGx5IGNvcGllZCBmcm9tIHRoZSBlZGdlLWNvbGxpc2lvbi1kZXRlY3Rpb24gYmVoYXZpb3IuXG5cbiAgICAvKlxuICAgICAqIGNoZWNrR2VuZXJhbCggYm9keSwgYm91bmRzLCBkdW1teSApIC0+IEFycmF5XG4gICAgICogLSBib2R5IChCb2R5KTogVGhlIGJvZHkgdG8gY2hlY2tcbiAgICAgKiAtIGJvdW5kczogYm91bmRzLmFhYmIgc2hvdWxkIGJlIHRoZSBvdXRlciBib3VuZHMuICBGb3IgdGVycmFpbiBvbiB0aGVcbiAgICAgKiAgIGdyb3VuZCwgcGFzcyBhIGZ1bmN0aW9uIGJvdW5kcy50ZXJyYWluSGVpZ2h0KHgpLlxuICAgICAqIC0gZHVtbXk6IChCb2R5KTogVGhlIGR1bW15IGJvZHkgdG8gcHVibGlzaCBhcyB0aGUgc3RhdGljIG90aGVyIGJvZHkgaXQgY29sbGlkZXMgd2l0aFxuICAgICAqICsgKEFycmF5KTogVGhlIGNvbGxpc2lvbiBkYXRhXG4gICAgICpcbiAgICAgKiBDaGVjayBpZiBhIGJvZHkgY29sbGlkZXMgd2l0aCB0aGUgYm91bmRhcnlcbiAgICAgKi9cbiAgICB2YXIgY2hlY2tHZW5lcmFsID0gZnVuY3Rpb24gY2hlY2tHZW5lcmFsKCBib2R5LCBib3VuZHMsIHRlcnJhaW5IZWlnaHQsIGR1bW15ICl7XG5cbiAgICAgICAgdmFyIG92ZXJsYXBcbiAgICAgICAgICAgICxhYWJiID0gYm9keS5hYWJiKClcbiAgICAgICAgICAgICxzY3JhdGNoID0gUGh5c2ljcy5zY3JhdGNocGFkKClcbiAgICAgICAgICAgICx0cmFucyA9IHNjcmF0Y2gudHJhbnNmb3JtKClcbiAgICAgICAgICAgICxkaXIgPSBzY3JhdGNoLnZlY3RvcigpXG4gICAgICAgICAgICAscmVzdWx0ID0gc2NyYXRjaC52ZWN0b3IoKVxuICAgICAgICAgICAgLGNvbGxpc2lvbiA9IGZhbHNlXG4gICAgICAgICAgICAsY29sbGlzaW9ucyA9IFtdXG4gICAgICAgICAgICAseFxuICAgICAgICAgICAgLHlcbiAgICAgICAgICAgICxjb2xsaXNpb25YXG4gICAgICAgICAgICA7XG5cbiAgICAgICAgLy8gcmlnaHRcbiAgICAgICAgb3ZlcmxhcCA9IChhYWJiLnggKyBhYWJiLmh3KSAtIGJvdW5kcy5tYXgueDtcblxuICAgICAgICBpZiAoIG92ZXJsYXAgPj0gMCApe1xuXG4gICAgICAgICAgICBkaXIuc2V0KCAxLCAwICkucm90YXRlSW52KCB0cmFucy5zZXRSb3RhdGlvbiggYm9keS5zdGF0ZS5hbmd1bGFyLnBvcyApICk7XG5cbiAgICAgICAgICAgIGNvbGxpc2lvbiA9IHtcbiAgICAgICAgICAgICAgICBib2R5QTogYm9keSxcbiAgICAgICAgICAgICAgICBib2R5QjogZHVtbXksXG4gICAgICAgICAgICAgICAgb3ZlcmxhcDogb3ZlcmxhcCxcbiAgICAgICAgICAgICAgICBub3JtOiB7XG4gICAgICAgICAgICAgICAgICAgIHg6IDEsXG4gICAgICAgICAgICAgICAgICAgIHk6IDBcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG10djoge1xuICAgICAgICAgICAgICAgICAgICB4OiBvdmVybGFwLFxuICAgICAgICAgICAgICAgICAgICB5OiAwXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBwb3M6IGJvZHkuZ2VvbWV0cnkuZ2V0RmFydGhlc3RIdWxsUG9pbnQoIGRpciwgcmVzdWx0ICkucm90YXRlKCB0cmFucyApLnZhbHVlcygpXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBjb2xsaXNpb25zLnB1c2goY29sbGlzaW9uKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGJvdHRvbVxuICAgICAgICBvdmVybGFwID0gLTE7XG4gICAgICAgIGlmIChhYWJiLnkgKyBhYWJiLmhoID4gYm91bmRzLm1heC55IC0gdGVycmFpbkhlaWdodChhYWJiLngpKSB7XG4gICAgICAgICAgICAvLyBpZiBzb21laG93IGl0IGdldHMgYmVsb3cgdGhlIHRlcnJhaW4sIGFsd2F5cyBwdXNoIHN0cmFpZ2h0IHVwLlxuICAgICAgICAgICAgb3ZlcmxhcCA9IE1hdGgubWF4KDEsIChhYWJiLnkgKyBhYWJiLmhoKSAtIGJvdW5kcy5tYXgueSArIHRlcnJhaW5IZWlnaHQoYWFiYi54KSk7XG4gICAgICAgICAgICBkaXIuc2V0KCAwLCAxICkucm90YXRlSW52KCB0cmFucy5zZXRSb3RhdGlvbiggYm9keS5zdGF0ZS5hbmd1bGFyLnBvcyApICk7XG5cbiAgICAgICAgICAgIGNvbGxpc2lvbiA9IHtcbiAgICAgICAgICAgICAgICBib2R5QTogYm9keSxcbiAgICAgICAgICAgICAgICBib2R5QjogZHVtbXksXG4gICAgICAgICAgICAgICAgb3ZlcmxhcDogb3ZlcmxhcCxcbiAgICAgICAgICAgICAgICBub3JtOiB7XG4gICAgICAgICAgICAgICAgICAgIHg6IDAsXG4gICAgICAgICAgICAgICAgICAgIHk6IDFcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG10djoge1xuICAgICAgICAgICAgICAgICAgICB4OiAwLFxuICAgICAgICAgICAgICAgICAgICB5OiBvdmVybGFwXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBwb3M6IGJvZHkuZ2VvbWV0cnkuZ2V0RmFydGhlc3RIdWxsUG9pbnQoIGRpciwgcmVzdWx0ICkucm90YXRlKCB0cmFucyApLnZhbHVlcygpXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBjb2xsaXNpb25zLnB1c2goY29sbGlzaW9uKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIG90aGVyd2lzZSwgZmluZCB0aGUgcG9pbnQgb2YgYmlnZ2VzdCBvdmVybGFwLCBhbmQgcHVzaCBhbG9uZyB0aGVcbiAgICAgICAgICAgIC8vIG5vcm1hbCB0aGVyZS5cbiAgICAgICAgICAgIGZvciAoeCA9IGFhYmIueCAtIGFhYmIuaHc7IHggPD0gYWFiYi54ICsgYWFiYi5odzsgeCsrKSB7XG4gICAgICAgICAgICAgICAgeSA9IGJvdW5kcy5tYXgueSAtIHRlcnJhaW5IZWlnaHQoeCk7XG4gICAgICAgICAgICAgICAgZGlyLnNldCggeCAtIGJvZHkuc3RhdGUucG9zLngsIHkgLSBib2R5LnN0YXRlLnBvcy55KS5uZWdhdGUoKTtcbiAgICAgICAgICAgICAgICBkaXIucm90YXRlSW52KCB0cmFucy5zZXRSb3RhdGlvbiggYm9keS5zdGF0ZS5hbmd1bGFyLnBvcyApICk7XG4gICAgICAgICAgICAgICAgYm9keS5nZW9tZXRyeS5nZXRGYXJ0aGVzdEh1bGxQb2ludChkaXIsIHJlc3VsdCkucm90YXRlKHRyYW5zKTtcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0Lm5vcm0oKSA+IGRpci5ub3JtKCkgJiYgb3ZlcmxhcCA8IHJlc3VsdC5ub3JtKCkgLSBkaXIubm9ybSgpKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHRoZXJlIGlzIGFuIGFjdHVhbCBjb2xsaXNpb24sIGFuZCB0aGlzIGlzIHRoZSBkZWVwZXN0XG4gICAgICAgICAgICAgICAgICAgIC8vIG92ZXJsYXAgd2UndmUgc2VlbiBzbyBmYXJcbiAgICAgICAgICAgICAgICAgICAgY29sbGlzaW9uWCA9IHg7XG4gICAgICAgICAgICAgICAgICAgIG92ZXJsYXAgPSByZXN1bHQubm9ybSgpIC0gZGlyLm5vcm0oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICggb3ZlcmxhcCA+PSAwICkge1xuICAgICAgICAgICAgICAgIC8vIHdob28gY29weXBhc3RhXG4gICAgICAgICAgICAgICAgeCA9IGNvbGxpc2lvblg7XG4gICAgICAgICAgICAgICAgeSA9IGJvdW5kcy5tYXgueSAtIHRlcnJhaW5IZWlnaHQoeCk7XG4gICAgICAgICAgICAgICAgZGlyLnNldCggeCAtIGJvZHkuc3RhdGUucG9zLngsIHkgLSBib2R5LnN0YXRlLnBvcy55KTtcbiAgICAgICAgICAgICAgICBkaXIucm90YXRlSW52KCB0cmFucy5zZXRSb3RhdGlvbiggYm9keS5zdGF0ZS5hbmd1bGFyLnBvcyApICk7XG4gICAgICAgICAgICAgICAgYm9keS5nZW9tZXRyeS5nZXRGYXJ0aGVzdEh1bGxQb2ludChkaXIsIHJlc3VsdCkucm90YXRlKHRyYW5zKTtcblxuICAgICAgICAgICAgICAgIGNvbGxpc2lvbiA9IHtcbiAgICAgICAgICAgICAgICAgICAgYm9keUE6IGJvZHksXG4gICAgICAgICAgICAgICAgICAgIGJvZHlCOiBkdW1teSxcbiAgICAgICAgICAgICAgICAgICAgb3ZlcmxhcDogb3ZlcmxhcCxcbiAgICAgICAgICAgICAgICAgICAgcG9zOiByZXN1bHQudmFsdWVzKCksXG4gICAgICAgICAgICAgICAgICAgIG5vcm06IGRpci5yb3RhdGUodHJhbnMpLm5vcm1hbGl6ZSgpLnZhbHVlcygpLFxuICAgICAgICAgICAgICAgICAgICBtdHY6IGRpci5tdWx0KG92ZXJsYXApLnZhbHVlcygpLFxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICBjb2xsaXNpb25zLnB1c2goY29sbGlzaW9uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGxlZnRcbiAgICAgICAgb3ZlcmxhcCA9IGJvdW5kcy5taW4ueCAtIChhYWJiLnggLSBhYWJiLmh3KTtcblxuICAgICAgICBpZiAoIG92ZXJsYXAgPj0gMCApe1xuXG4gICAgICAgICAgICBkaXIuc2V0KCAtMSwgMCApLnJvdGF0ZUludiggdHJhbnMuc2V0Um90YXRpb24oIGJvZHkuc3RhdGUuYW5ndWxhci5wb3MgKSApO1xuXG4gICAgICAgICAgICBjb2xsaXNpb24gPSB7XG4gICAgICAgICAgICAgICAgYm9keUE6IGJvZHksXG4gICAgICAgICAgICAgICAgYm9keUI6IGR1bW15LFxuICAgICAgICAgICAgICAgIG92ZXJsYXA6IG92ZXJsYXAsXG4gICAgICAgICAgICAgICAgbm9ybToge1xuICAgICAgICAgICAgICAgICAgICB4OiAtMSxcbiAgICAgICAgICAgICAgICAgICAgeTogMFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgbXR2OiB7XG4gICAgICAgICAgICAgICAgICAgIHg6IC1vdmVybGFwLFxuICAgICAgICAgICAgICAgICAgICB5OiAwXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBwb3M6IGJvZHkuZ2VvbWV0cnkuZ2V0RmFydGhlc3RIdWxsUG9pbnQoIGRpciwgcmVzdWx0ICkucm90YXRlKCB0cmFucyApLnZhbHVlcygpXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBjb2xsaXNpb25zLnB1c2goY29sbGlzaW9uKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHRvcFxuICAgICAgICBvdmVybGFwID0gYm91bmRzLm1pbi55IC0gKGFhYmIueSAtIGFhYmIuaGgpO1xuXG4gICAgICAgIGlmICggb3ZlcmxhcCA+PSAwICl7XG5cbiAgICAgICAgICAgIGRpci5zZXQoIDAsIC0xICkucm90YXRlSW52KCB0cmFucy5zZXRSb3RhdGlvbiggYm9keS5zdGF0ZS5hbmd1bGFyLnBvcyApICk7XG5cbiAgICAgICAgICAgIGNvbGxpc2lvbiA9IHtcbiAgICAgICAgICAgICAgICBib2R5QTogYm9keSxcbiAgICAgICAgICAgICAgICBib2R5QjogZHVtbXksXG4gICAgICAgICAgICAgICAgb3ZlcmxhcDogb3ZlcmxhcCxcbiAgICAgICAgICAgICAgICBub3JtOiB7XG4gICAgICAgICAgICAgICAgICAgIHg6IDAsXG4gICAgICAgICAgICAgICAgICAgIHk6IC0xXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBtdHY6IHtcbiAgICAgICAgICAgICAgICAgICAgeDogMCxcbiAgICAgICAgICAgICAgICAgICAgeTogLW92ZXJsYXBcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHBvczogYm9keS5nZW9tZXRyeS5nZXRGYXJ0aGVzdEh1bGxQb2ludCggZGlyLCByZXN1bHQgKS5yb3RhdGUoIHRyYW5zICkudmFsdWVzKClcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGNvbGxpc2lvbnMucHVzaChjb2xsaXNpb24pO1xuICAgICAgICB9XG5cbiAgICAgICAgc2NyYXRjaC5kb25lKCk7XG4gICAgICAgIHJldHVybiBjb2xsaXNpb25zO1xuICAgIH07XG5cbiAgICAvKlxuICAgICAqIGNoZWNrRWRnZUNvbGxpZGUoIGJvZHksIGJvdW5kcywgZHVtbXkgKSAtPiBBcnJheVxuICAgICAqIC0gYm9keSAoQm9keSk6IFRoZSBib2R5IHRvIGNoZWNrXG4gICAgICogLSBib3VuZHMgKFBoeXNpY3MuYWFiYik6IFRoZSBib3VuZGFyeVxuICAgICAqIC0gZHVtbXk6IChCb2R5KTogVGhlIGR1bW15IGJvZHkgdG8gcHVibGlzaCBhcyB0aGUgc3RhdGljIG90aGVyIGJvZHkgaXQgY29sbGlkZXMgd2l0aFxuICAgICAqICsgKEFycmF5KTogVGhlIGNvbGxpc2lvbiBkYXRhXG4gICAgICpcbiAgICAgKiBDaGVjayBpZiBhIGJvZHkgY29sbGlkZXMgd2l0aCB0aGUgYm91bmRhcnlcbiAgICAgKi9cbiAgICB2YXIgY2hlY2tFZGdlQ29sbGlkZSA9IGZ1bmN0aW9uIGNoZWNrRWRnZUNvbGxpZGUoIGJvZHksIGJvdW5kcywgdGVycmFpbkhlaWdodCwgZHVtbXkgKXtcblxuICAgICAgICByZXR1cm4gY2hlY2tHZW5lcmFsKCBib2R5LCBib3VuZHMsIHRlcnJhaW5IZWlnaHQsIGR1bW15ICk7XG4gICAgfTtcblxuICAgIHZhciBkZWZhdWx0cyA9IHtcblxuICAgICAgICBlZGdlczoge1xuICAgICAgICAgICAgYWFiYjogbnVsbCxcbiAgICAgICAgICAgIHRlcnJhaW5IZWlnaHQ6IGZ1bmN0aW9uICh4KSB7cmV0dXJuIDA7fSxcbiAgICAgICAgfSxcbiAgICAgICAgcmVzdGl0dXRpb246IDAuOTksXG4gICAgICAgIGNvZjogMS4wLFxuICAgICAgICBjaGFubmVsOiAnY29sbGlzaW9uczpkZXRlY3RlZCdcbiAgICB9O1xuXG4gICAgcmV0dXJuIHtcblxuICAgICAgICAvLyBleHRlbmRlZFxuICAgICAgICBpbml0OiBmdW5jdGlvbiggb3B0aW9ucyApe1xuXG4gICAgICAgICAgICBwYXJlbnQuaW5pdC5jYWxsKCB0aGlzICk7XG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMuZGVmYXVsdHMoIGRlZmF1bHRzICk7XG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMoIG9wdGlvbnMgKTtcblxuICAgICAgICAgICAgdGhpcy5zZXRBQUJCKCB0aGlzLm9wdGlvbnMuYWFiYiApO1xuICAgICAgICAgICAgdGhpcy5yZXN0aXR1dGlvbiA9IHRoaXMub3B0aW9ucy5yZXN0aXR1dGlvbjtcblxuICAgICAgICAgICAgdGhpcy5ib2R5ID0gUGh5c2ljcy5ib2R5KCdwb2ludCcsIHtcbiAgICAgICAgICAgICAgICB0cmVhdG1lbnQ6ICdzdGF0aWMnLFxuICAgICAgICAgICAgICAgIHJlc3RpdHV0aW9uOiB0aGlzLm9wdGlvbnMucmVzdGl0dXRpb24sXG4gICAgICAgICAgICAgICAgY29mOiB0aGlzLm9wdGlvbnMuY29mXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogRWRnZUNvbGxpc2lvbkRldGVjdGlvbkJlaGF2aW9yI3NldEFBQkIoIGFhYmIgKSAtPiB0aGlzXG4gICAgICAgICAqIC0gYWFiYiAoUGh5c2ljcy5hYWJiKTogVGhlIGFhYmIgdG8gdXNlIGFzIHRoZSBib3VuZGFyeVxuICAgICAgICAgKlxuICAgICAgICAgKiBTZXQgdGhlIGJvdW5kYXJpZXMgb2YgdGhlIGVkZ2UuXG4gICAgICAgICAqKi9cbiAgICAgICAgc2V0QUFCQjogZnVuY3Rpb24oIGFhYmIgKXtcblxuICAgICAgICAgICAgaWYgKCFhYWJiKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgJ0Vycm9yOiBhYWJiIG5vdCBzZXQnO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLl9lZGdlcyA9IHtcbiAgICAgICAgICAgICAgICBtaW46IHtcbiAgICAgICAgICAgICAgICAgICAgeDogKGFhYmIueCAtIGFhYmIuaHcpLFxuICAgICAgICAgICAgICAgICAgICB5OiAoYWFiYi55IC0gYWFiYi5oaClcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG1heDoge1xuICAgICAgICAgICAgICAgICAgICB4OiAoYWFiYi54ICsgYWFiYi5odyksXG4gICAgICAgICAgICAgICAgICAgIHk6IChhYWJiLnkgKyBhYWJiLmhoKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8vIGV4dGVuZGVkXG4gICAgICAgIGNvbm5lY3Q6IGZ1bmN0aW9uKCB3b3JsZCApe1xuXG4gICAgICAgICAgICB3b3JsZC5vbiggJ2ludGVncmF0ZTp2ZWxvY2l0aWVzJywgdGhpcy5jaGVja0FsbCwgdGhpcyApO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8vIGV4dGVuZGVkXG4gICAgICAgIGRpc2Nvbm5lY3Q6IGZ1bmN0aW9uKCB3b3JsZCApe1xuXG4gICAgICAgICAgICB3b3JsZC5vZmYoICdpbnRlZ3JhdGU6dmVsb2NpdGllcycsIHRoaXMuY2hlY2tBbGwgKTtcbiAgICAgICAgfSxcblxuICAgICAgICAvKiogaW50ZXJuYWxcbiAgICAgICAgICogRWRnZUNvbGxpc2lvbkRldGVjdGlvbkJlaGF2aW9yI2NoZWNrQWxsKCBkYXRhIClcbiAgICAgICAgICogLSBkYXRhIChPYmplY3QpOiBFdmVudCBkYXRhXG4gICAgICAgICAqXG4gICAgICAgICAqIEV2ZW50IGNhbGxiYWNrIHRvIGNoZWNrIGFsbCBib2RpZXMgZm9yIGNvbGxpc2lvbnMgd2l0aCB0aGUgZWRnZVxuICAgICAgICAgKiovXG4gICAgICAgIGNoZWNrQWxsOiBmdW5jdGlvbiggZGF0YSApe1xuXG4gICAgICAgICAgICB2YXIgYm9kaWVzID0gdGhpcy5nZXRUYXJnZXRzKClcbiAgICAgICAgICAgICAgICAsZHQgPSBkYXRhLmR0XG4gICAgICAgICAgICAgICAgLGJvZHlcbiAgICAgICAgICAgICAgICAsY29sbGlzaW9ucyA9IFtdXG4gICAgICAgICAgICAgICAgLHJldFxuICAgICAgICAgICAgICAgICxib3VuZHMgPSB0aGlzLl9lZGdlc1xuICAgICAgICAgICAgICAgICx0ZXJyYWluSGVpZ2h0ID0gXy5tZW1vaXplKHRoaXMub3B0aW9ucy50ZXJyYWluSGVpZ2h0KVxuICAgICAgICAgICAgICAgICxkdW1teSA9IHRoaXMuYm9keVxuICAgICAgICAgICAgICAgIDtcblxuICAgICAgICAgICAgZm9yICggdmFyIGkgPSAwLCBsID0gYm9kaWVzLmxlbmd0aDsgaSA8IGw7IGkrKyApe1xuXG4gICAgICAgICAgICAgICAgYm9keSA9IGJvZGllc1sgaSBdO1xuXG4gICAgICAgICAgICAgICAgLy8gb25seSBkZXRlY3QgZHluYW1pYyBib2RpZXNcbiAgICAgICAgICAgICAgICBpZiAoIGJvZHkudHJlYXRtZW50ID09PSAnZHluYW1pYycgKXtcblxuICAgICAgICAgICAgICAgICAgICByZXQgPSBjaGVja0VkZ2VDb2xsaWRlKCBib2R5LCBib3VuZHMsIHRlcnJhaW5IZWlnaHQsIGR1bW15ICk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCByZXQgKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbGxpc2lvbnMucHVzaC5hcHBseSggY29sbGlzaW9ucywgcmV0ICk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICggY29sbGlzaW9ucy5sZW5ndGggKXtcblxuICAgICAgICAgICAgICAgIHRoaXMuX3dvcmxkLmVtaXQoIHRoaXMub3B0aW9ucy5jaGFubmVsLCB7XG4gICAgICAgICAgICAgICAgICAgIGNvbGxpc2lvbnM6IGNvbGxpc2lvbnNcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbn07XG4iLCJcbnZhciBCYXNlID0gcmVxdWlyZSgnLi9iYXNlJyk7XG52YXIgR3JhcGggPSByZXF1aXJlKCcuL2dyYXBoJyk7XG5cbmZ1bmN0aW9uIHJhbmRvbSggbWluLCBtYXggKXtcbiAgICByZXR1cm4gKE1hdGgucmFuZG9tKCkgKiAobWF4LW1pbikgKyBtaW4pfDBcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBCYXNlLmV4dGVuZChmdW5jdGlvbiBEZW1vKGNvbnRhaW5lciwgb3B0aW9ucykge1xuICAgIEJhc2UuY2FsbCh0aGlzLCBjb250YWluZXIsIG9wdGlvbnMsICdpbWFnZXMvbGFiX2JhY2tncm91bmQuanBnJylcbn0sIHtcbiAgICBtYWtlQ2lyY2xlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBQaHlzaWNzLmJvZHkoJ2NpcmNsZScsIHtcbiAgICAgICAgICAgIHg6IHRoaXMub3B0aW9ucy53aWR0aCAvIDIsXG4gICAgICAgICAgICB5OiA1MCxcbiAgICAgICAgICAgIHZ4OiByYW5kb20oLTUsIDUpLzEwMCxcbiAgICAgICAgICAgIHJhZGl1czogNDAsXG4gICAgICAgICAgICByZXN0aXR1dGlvbjogMC45LFxuICAgICAgICAgICAgc3R5bGVzOiB7XG4gICAgICAgICAgICAgICAgZmlsbFN0eWxlOiAnIzI2OGJkMicsXG4gICAgICAgICAgICAgICAgYW5nbGVJbmRpY2F0b3I6ICcjMTU1NDc5J1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9LFxuICAgIGRyb3BJbkJvZHk6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICB2YXIgYm9keTtcblxuXG4gICAgICAgIHZhciBwZW50ID0gW1xuICAgICAgICAgICAgeyB4OiA1MCwgeTogMCB9XG4gICAgICAgICAgICAseyB4OiAyNSwgeTogLTI1IH1cbiAgICAgICAgICAgICx7IHg6IC0yNSwgeTogLTI1IH1cbiAgICAgICAgICAgICx7IHg6IC01MCwgeTogMCB9XG4gICAgICAgICAgICAseyB4OiAwLCB5OiA1MCB9XG4gICAgICAgIF07XG5cbiAgICAgICAgICAgIHN3aXRjaCAoIHJhbmRvbSggMCwgMyApICl7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gYWRkIGEgY2lyY2xlXG4gICAgICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgICAgICAgICBib2R5ID0gUGh5c2ljcy5ib2R5KCdjaXJjbGUnLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB4OiB0aGlzLm9wdGlvbnMud2lkdGggLyAyXG4gICAgICAgICAgICAgICAgICAgICAgICAseTogNTBcbiAgICAgICAgICAgICAgICAgICAgICAgICx2eDogcmFuZG9tKC01LCA1KS8xMDBcbiAgICAgICAgICAgICAgICAgICAgICAgICxyYWRpdXM6IDQwXG4gICAgICAgICAgICAgICAgICAgICAgICAscmVzdGl0dXRpb246IDAuOVxuICAgICAgICAgICAgICAgICAgICAgICAgLHN0eWxlczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGxTdHlsZTogJyMyNjhiZDInXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLGFuZ2xlSW5kaWNhdG9yOiAnIzE1NTQ3OSdcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGFkZCBhIHNxdWFyZVxuICAgICAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgICAgICAgICAgYm9keSA9IFBoeXNpY3MuYm9keSgncmVjdGFuZ2xlJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6IDUwXG4gICAgICAgICAgICAgICAgICAgICAgICAsaGVpZ2h0OiA1MFxuICAgICAgICAgICAgICAgICAgICAgICAgLHg6IHRoaXMub3B0aW9ucy53aWR0aCAvIDJcbiAgICAgICAgICAgICAgICAgICAgICAgICx5OiA1MFxuICAgICAgICAgICAgICAgICAgICAgICAgLHZ4OiByYW5kb20oLTUsIDUpLzEwMFxuICAgICAgICAgICAgICAgICAgICAgICAgLHJlc3RpdHV0aW9uOiAwLjlcbiAgICAgICAgICAgICAgICAgICAgICAgICxzdHlsZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxsU3R5bGU6ICcjZDMzNjgyJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICxhbmdsZUluZGljYXRvcjogJyM3NTFiNGInXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgICAgICAvLyBhZGQgYSBwb2x5Z29uXG4gICAgICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgICAgICBib2R5ID0gUGh5c2ljcy5ib2R5KCdjb252ZXgtcG9seWdvbicsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZlcnRpY2VzOiBwZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAseDogdGhpcy5vcHRpb25zLndpZHRoIC8gMlxuICAgICAgICAgICAgICAgICAgICAgICAgLHk6IDUwXG4gICAgICAgICAgICAgICAgICAgICAgICAsdng6IHJhbmRvbSgtNSwgNSkvMTAwXG4gICAgICAgICAgICAgICAgICAgICAgICAsYW5nbGU6IHJhbmRvbSggMCwgMiAqIE1hdGguUEkgKVxuICAgICAgICAgICAgICAgICAgICAgICAgLHJlc3RpdHV0aW9uOiAwLjlcbiAgICAgICAgICAgICAgICAgICAgICAgICxzdHlsZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxsU3R5bGU6ICcjODU5OTAwJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICxhbmdsZUluZGljYXRvcjogJyM0MTQ3MDAnXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy53b3JsZC5hZGQoIGJvZHkgKTtcbiAgICB9LFxuICAgIHNldHVwOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciB3b3JsZCA9IHRoaXMud29ybGRcbiAgICAgICAgLy8gd29ybGQuYWRkKFBoeXNpY3MuYmVoYXZpb3IoJ2NvbnN0YW50LWFjY2VsZXJhdGlvbicpKTtcblxuICAgICAgICAvKlxuICAgICAgICB2YXIgaW50ID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIGlmICggd29ybGQuX2JvZGllcy5sZW5ndGggPiA0ICl7XG4gICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbCggaW50ICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmRyb3BJbkJvZHkoKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpLCA3MDApO1xuICAgICAgICovXG5cbiAgICAgICAgdmFyIGNpcmNsZSA9IHRoaXMubWFrZUNpcmNsZSgpXG4gICAgICAgIHRoaXMud29ybGQuYWRkKGNpcmNsZSlcblxuICAgICAgICB2YXIgZ3JhcGggPSBuZXcgR3JhcGgodGhpcy5jb250YWluZXIsIHtcbiAgICAgICAgICAgICdDaXJjbGUnOiB7Ym9keTogY2lyY2xlLCBhdHRyOiAncG9zLnknLCBuYW1lOidDaXJjbGUnLCBtaW5zY2FsZTogNX0sXG4gICAgICAgICAgICAnVmVsWSc6IHtib2R5OiBjaXJjbGUsIGF0dHI6ICd2ZWwueScsIG5hbWU6J1ZlbFknLCBtaW5zY2FsZTogLjF9LFxuICAgICAgICAgICAgJ0FuZ1AnOiB7Ym9keTogY2lyY2xlLCBhdHRyOiAnYW5ndWxhci5wb3MnLCBuYW1lOidBY2NYJywgbWluc2NhbGU6IC4wMDF9LFxuICAgICAgICAgICAgJ0FuZ1YnOiB7Ym9keTogY2lyY2xlLCBhdHRyOiAnYW5ndWxhci52ZWwnLCBuYW1lOidBY2NYJywgbWluc2NhbGU6IC4wMDF9LFxuICAgICAgICB9LCB0aGlzLm9wdGlvbnMuaGVpZ2h0KVxuICAgICAgICB0aGlzLmdyYXBoID0gZ3JhcGhcblxuICAgICAgICB0aGlzLndvcmxkLm9uKCdzdGVwJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZ3JhcGgudXBkYXRlKHdvcmxkLnRpbWVzdGVwKCkpXG4gICAgICAgIH0pO1xuXG4gICAgfVxufSk7XG5cbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICAgIG1ha2VSZWN0OiBtYWtlUmVjdCxcbiAgICBtYWtlUm9jazogbWFrZVJvY2ssXG4gICAgc3VtOiBzdW0sXG4gICAgYXZnOiBhdmdcbn1cblxuZnVuY3Rpb24gc3VtKG51bWJlcnMpIHtcbiAgICBpZiAoIW51bWJlcnMubGVuZ3RoKSByZXR1cm4gMDtcbiAgICByZXR1cm4gbnVtYmVycy5yZWR1Y2UoZnVuY3Rpb24gKGEsIGIpIHtyZXR1cm4gYSArIGJ9KVxufVxuXG5mdW5jdGlvbiBhdmcobnVtYmVycykge1xuICAgIGlmICghbnVtYmVycy5sZW5ndGgpIHJldHVybiAwO1xuICAgIHJldHVybiBzdW0obnVtYmVycykgLyBudW1iZXJzLmxlbmd0aFxufVxuXG5mdW5jdGlvbiBtYWtlUmVjdCh4LCB5LCB3aWR0aCwgaGVpZ2h0KSB7XG4gICAgcmV0dXJuIFtcbiAgICAgICAge3g6IHggLSB3aWR0aC8yLCB5OiB5IC0gaGVpZ2h0LzJ9LFxuICAgICAgICB7eDogeCArIHdpZHRoLzIsIHk6IHkgLSBoZWlnaHQvMn0sXG4gICAgICAgIHt4OiB4ICsgd2lkdGgvMiwgeTogeSArIGhlaWdodC8yfSxcbiAgICAgICAge3g6IHggLSB3aWR0aC8yLCB5OiB5ICsgaGVpZ2h0LzJ9LFxuICAgIF1cbn1cblxuLy8gTm90IGEgY29udmV4IGh1bGwgOihcbmZ1bmN0aW9uIG1ha2VSb2NrKHJhZGl1cywgZGV2aWF0aW9uLCByZXNvbHV0aW9uKSB7XG4gICAgdmFyIHJlc29sdXRpb24gPSByZXNvbHV0aW9uIHx8IDMyXG4gICAgdmFyIGRldmlhdGlvbiA9IGRldmlhdGlvbiB8fCAxMFxuICAgIHZhciBwb2ludHMgPSBbXVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVzb2x1dGlvbjsgaSsrKSB7XG4gICAgICAgIHZhciBhbmcgPSBpIC8gcmVzb2x1dGlvbiAqIDIgKiBNYXRoLlBJO1xuICAgICAgICB2YXIgcG9pbnQgPSB7IHg6IHJhZGl1cyAqIE1hdGguY29zKGFuZyksIHk6IHJhZGl1cyAqIE1hdGguc2luKGFuZykgfVxuICAgICAgICBwb2ludC54ICs9IChNYXRoLnJhbmRvbSgpKSAqIDIgKiBkZXZpYXRpb25cbiAgICAgICAgcG9pbnQueSArPSAoTWF0aC5yYW5kb20oKSkgKiAyICogZGV2aWF0aW9uXG4gICAgICAgIHBvaW50cy5wdXNoKHBvaW50KVxuICAgIH1cbiAgICByZXR1cm4gcG9pbnRzXG59XG4iLCJcbnZhciBiYWtoYW4gPSByZXF1aXJlKCcuL2xpYicpXG4gICwgbm9kZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYWluLWNhbnZhcycpXG5cbnZhciBvcHRpb25zID0ge1xuICAgIHdpZHRoOiA5MDAsXG4gICAgaGVpZ2h0OiA3MDAsXG59XG5cbnZhciBuYW1lID0gd2luZG93LmxvY2F0aW9uLnNlYXJjaC5yZXBsYWNlKC8mKFxcdyspPShbXiZdKykvZywgZnVuY3Rpb24gKHJlcywga2V5LCB2YWwpIHtcbiAgICBvcHRpb25zW2tleV0gPSB2YWwucmVwbGFjZSgvXFwvLywgJycpXG4gICAgcmV0dXJuICcnXG59KS5yZXBsYWNlKC9bXlxcd10vZywgJycpIHx8ICdEZW1vJ1xuY29uc29sZS5sb2cobmFtZSlcblxud2luZG93LkJLQSA9IG5ldyBiYWtoYW5bbmFtZV0obm9kZSwgb3B0aW9ucyk7XG53aW5kb3cuQktBLnJ1bigpO1xuIl19
