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

        

},{"./base":2,"./gate":8,"./playpause":19,"./stopwatch":21}],2:[function(require,module,exports){

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


},{}],5:[function(require,module,exports){
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


},{"./base":2,"./gate":8,"./graph":9,"./playpause":19,"./stopwatch":21}],6:[function(require,module,exports){
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

},{"./base":2,"./dropdatachecker.jsx":7,"./gate":8,"./intro":11,"./logbook":15,"./playpause":19,"./stopwatch":21,"./util":23}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
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

},{"./check-collision":4,"./stopwatch":21}],9:[function(require,module,exports){

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


},{"./cangraph":3}],10:[function(require,module,exports){

module.exports = {
    Base: require('./base'),
    Demo: require('./demo'),
    Newton1: require('./newton1'),
    Orbit: require('./orbit'),
    Moon: require('./moon'),
    Asteroids: require('./asteroids'),
    Slope: require('./slope'),
    Drop: require('./drop'),
    TryGraph: require('./try-graph')
}

},{"./asteroids":1,"./base":2,"./demo":5,"./drop":6,"./moon":16,"./newton1":17,"./orbit":18,"./slope":20,"./try-graph":22}],11:[function(require,module,exports){

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


},{"./intro.jsx":12,"./walk-through.jsx":14}],12:[function(require,module,exports){
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


},{"./step.jsx":13}],13:[function(require,module,exports){
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
                this.props.showBacon && React.DOM.img({className: "walkthrough_sir-francis", src: "/images/sir-francis-transparent2.gif"}), 
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

},{}],14:[function(require,module,exports){
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


},{}],15:[function(require,module,exports){

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


},{"./util":23}],16:[function(require,module,exports){
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

        

},{"./base":2,"./gate":8,"./graph":9,"./playpause":19,"./stopwatch":21}],17:[function(require,module,exports){
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

        

},{"./base":2,"./gate":8,"./playpause":19,"./stopwatch":21}],18:[function(require,module,exports){
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

        

},{"./base":2,"./gate":8,"./playpause":19,"./stopwatch":21}],19:[function(require,module,exports){
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



},{}],20:[function(require,module,exports){
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


},{"./base":2,"./gate":8,"./playpause":19,"./stopwatch":21,"./util":23}],21:[function(require,module,exports){

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

},{}],22:[function(require,module,exports){

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


},{"./base":2,"./graph":9}],23:[function(require,module,exports){
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

},{}],24:[function(require,module,exports){

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

},{"./lib":10}]},{},[24])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvdXNyL2xvY2FsL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi9Vc2Vycy9raGFuaW50ZXJuMS9jbG9uZS9iYWtoYW4vbGliL2FzdGVyb2lkcy5qcyIsIi9Vc2Vycy9raGFuaW50ZXJuMS9jbG9uZS9iYWtoYW4vbGliL2Jhc2UuanMiLCIvVXNlcnMva2hhbmludGVybjEvY2xvbmUvYmFraGFuL2xpYi9jYW5ncmFwaC5qcyIsIi9Vc2Vycy9raGFuaW50ZXJuMS9jbG9uZS9iYWtoYW4vbGliL2NoZWNrLWNvbGxpc2lvbi5qcyIsIi9Vc2Vycy9raGFuaW50ZXJuMS9jbG9uZS9iYWtoYW4vbGliL2RlbW8uanMiLCIvVXNlcnMva2hhbmludGVybjEvY2xvbmUvYmFraGFuL2xpYi9kcm9wLmpzIiwiL1VzZXJzL2toYW5pbnRlcm4xL2Nsb25lL2Jha2hhbi9saWIvZHJvcGRhdGFjaGVja2VyLmpzeCIsIi9Vc2Vycy9raGFuaW50ZXJuMS9jbG9uZS9iYWtoYW4vbGliL2dhdGUuanMiLCIvVXNlcnMva2hhbmludGVybjEvY2xvbmUvYmFraGFuL2xpYi9ncmFwaC5qcyIsIi9Vc2Vycy9raGFuaW50ZXJuMS9jbG9uZS9iYWtoYW4vbGliL2luZGV4LmpzIiwiL1VzZXJzL2toYW5pbnRlcm4xL2Nsb25lL2Jha2hhbi9saWIvaW50cm8vaW5kZXguanMiLCIvVXNlcnMva2hhbmludGVybjEvY2xvbmUvYmFraGFuL2xpYi9pbnRyby9pbnRyby5qc3giLCIvVXNlcnMva2hhbmludGVybjEvY2xvbmUvYmFraGFuL2xpYi9pbnRyby9zdGVwLmpzeCIsIi9Vc2Vycy9raGFuaW50ZXJuMS9jbG9uZS9iYWtoYW4vbGliL2ludHJvL3dhbGstdGhyb3VnaC5qc3giLCIvVXNlcnMva2hhbmludGVybjEvY2xvbmUvYmFraGFuL2xpYi9sb2dib29rLmpzIiwiL1VzZXJzL2toYW5pbnRlcm4xL2Nsb25lL2Jha2hhbi9saWIvbW9vbi5qcyIsIi9Vc2Vycy9raGFuaW50ZXJuMS9jbG9uZS9iYWtoYW4vbGliL25ld3RvbjEuanMiLCIvVXNlcnMva2hhbmludGVybjEvY2xvbmUvYmFraGFuL2xpYi9vcmJpdC5qcyIsIi9Vc2Vycy9raGFuaW50ZXJuMS9jbG9uZS9iYWtoYW4vbGliL3BsYXlwYXVzZS5qcyIsIi9Vc2Vycy9raGFuaW50ZXJuMS9jbG9uZS9iYWtoYW4vbGliL3Nsb3BlLmpzIiwiL1VzZXJzL2toYW5pbnRlcm4xL2Nsb25lL2Jha2hhbi9saWIvc3RvcHdhdGNoLmpzIiwiL1VzZXJzL2toYW5pbnRlcm4xL2Nsb25lL2Jha2hhbi9saWIvdHJ5LWdyYXBoLmpzIiwiL1VzZXJzL2toYW5pbnRlcm4xL2Nsb25lL2Jha2hhbi9saWIvdXRpbC5qcyIsIi9Vc2Vycy9raGFuaW50ZXJuMS9jbG9uZS9iYWtoYW4vcnVuLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDck9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgR2F0ZSA9IHJlcXVpcmUoJy4vZ2F0ZScpO1xudmFyIEJhc2UgPSByZXF1aXJlKCcuL2Jhc2UnKTtcbnZhciBTdG9wd2F0Y2ggPSByZXF1aXJlKCcuL3N0b3B3YXRjaCcpO1xudmFyIFBsYXlQYXVzZSA9IHJlcXVpcmUoJy4vcGxheXBhdXNlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gQmFzZS5leHRlbmQoZnVuY3Rpb24gQXN0ZXJvaWRzKGNvbnRhaW5lciwgb3B0aW9ucykge1xuICAgIEJhc2UuY2FsbCh0aGlzLCBjb250YWluZXIsIG9wdGlvbnMsICdpbWFnZXMvc3BhY2VfYmFja2dyb3VuZC5qcGcnKVxufSwge1xuICAgIHNldHVwOiBmdW5jdGlvbiAoY29udGFpbmVyKSB7XG4gICAgICAgIHZhciB3b3JsZCA9IHRoaXMud29ybGQ7XG4gICAgICAgIHdvcmxkLmFkZChQaHlzaWNzLmJvZHkoJ2NpcmNsZScsIHtcbiAgICAgICAgICAgIHg6IDQwMFxuICAgICAgICAgICAgLHk6IDM1MFxuICAgICAgICAgICAgLHZ4OiAtMS4zLzUwXG4gICAgICAgICAgICAscmFkaXVzOiAxMFxuICAgICAgICAgICAgLG1hc3M6IDEwMDBcbiAgICAgICAgICAgICxyZXN0aXR1dGlvbjogMFxuICAgICAgICAgICAgLHN0eWxlczoge1xuICAgICAgICAgICAgICAgIGZpbGxTdHlsZTogJyNmZmNjMDAnXG4gICAgICAgICAgICAgICAgLGFuZ2xlSW5kaWNhdG9yOiAnIzE1NTQ3OSdcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkpO1xuICAgICAgICB3b3JsZC5hZGQoUGh5c2ljcy5ib2R5KCdjaXJjbGUnLCB7XG4gICAgICAgICAgICB4OiA0MDBcbiAgICAgICAgICAgICx5OiA1MFxuICAgICAgICAgICAgLHZ4OiAxLjNcbiAgICAgICAgICAgICxyYWRpdXM6IDVcbiAgICAgICAgICAgICxtYXNzOiAyMFxuICAgICAgICAgICAgLHJlc3RpdHV0aW9uOiAwXG4gICAgICAgICAgICAsc3R5bGVzOiB7XG4gICAgICAgICAgICAgICAgZmlsbFN0eWxlOiAnIzI2ZWI2MicgLy9ncmVlblxuICAgICAgICAgICAgICAgICxhbmdsZUluZGljYXRvcjogJyMxNTU0NzknXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pKTtcbiAgICAgICAgd29ybGQuYWRkKFBoeXNpY3MuYmVoYXZpb3IoJ25ld3RvbmlhbicsIHsgc3RyZW5ndGg6IC41IH0pKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCAxMDA7IGkrKykge1xuICAgICAgICAgICAgdmFyIHIgPSBNYXRoLnJhbmRvbSgpICogMTAgKyAyOTU7XG4gICAgICAgICAgICB2YXIgdGggPSAoLTEvNiAtIDAuMDA1ICsgTWF0aC5yYW5kb20oKSAqIDAuMDEpICogTWF0aC5QSTtcbiAgICAgICAgICAgIHdvcmxkLmFkZChQaHlzaWNzLmJvZHkoJ2NpcmNsZScsIHtcbiAgICAgICAgICAgICAgICB4OiBNYXRoLmNvcyh0aCkgKiByICsgNDAwXG4gICAgICAgICAgICAgICAgLHk6IE1hdGguc2luKHRoKSAqIHIgKyAzNTBcbiAgICAgICAgICAgICAgICAsdng6IC0xLjMgKiBNYXRoLnNpbih0aClcbiAgICAgICAgICAgICAgICAsdnk6IDEuMyAqIE1hdGguY29zKHRoKVxuICAgICAgICAgICAgICAgICxyYWRpdXM6IDJcbiAgICAgICAgICAgICAgICAsbWFzczogTWF0aC5wb3coMTAsIE1hdGgucmFuZG9tKCkgKiAyKSAqIDAuMDAwMDFcbiAgICAgICAgICAgICAgICAscmVzdGl0dXRpb246IDBcbiAgICAgICAgICAgICAgICAsc3R5bGVzOiB7XG4gICAgICAgICAgICAgICAgICAgIGZpbGxTdHlsZTogJyNkZDIyMjInIC8vcmVkXG4gICAgICAgICAgICAgICAgICAgICxhbmdsZUluZGljYXRvcjogJyMxNTU0NzknXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGJ1dHRvbkNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChidXR0b25Db250YWluZXIpO1xuICAgICAgICB2YXIgcGxheVBhdXNlID0gbmV3IFBsYXlQYXVzZSh3b3JsZCwgYnV0dG9uQ29udGFpbmVyKTtcbiAgICB9XG59KTtcblxuICAgICAgICBcbiIsIlxubW9kdWxlLmV4cG9ydHMgPSBCYXNlO1xuXG5mdW5jdGlvbiBCYXNlKGNvbnRhaW5lciwgb3B0aW9ucywgYmFja2dyb3VuZCwgZGlzYWJsZUJvdW5kcykge1xuICAgIHRoaXMuY29udGFpbmVyID0gY29udGFpbmVyXG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9uc1xuICAgICQoJy5iYWNrZ3JvdW5kJykuYXR0cignc3JjJywgYmFja2dyb3VuZCk7XG4gICAgdGhpcy5fc2V0dXBXb3JsZChkaXNhYmxlQm91bmRzKVxuICAgIHRoaXMuc2V0dXAoY29udGFpbmVyKVxuICAgIC8vIGluaXQgc3R1ZmZcbn1cblxuQmFzZS5leHRlbmQgPSBmdW5jdGlvbiAoc3ViLCBwcm90bykge1xuICAgIHN1Yi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEJhc2UucHJvdG90eXBlKVxuICAgIHN1Yi5jb25zdHJ1Y3RvciA9IHN1YlxuICAgIGZvciAodmFyIG5hbWUgaW4gcHJvdG8pIHtcbiAgICAgICAgaWYgKHByb3RvLmhhc093blByb3BlcnR5KG5hbWUpKSB7XG4gICAgICAgICAgICBzdWIucHJvdG90eXBlW25hbWVdID0gcHJvdG9bbmFtZV1cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gc3ViXG59XG5cbkJhc2UucHJvdG90eXBlID0ge1xuXG4gICAgX3NldHVwV29ybGQ6IGZ1bmN0aW9uIChkaXNhYmxlQm91bmRzKSB7XG4gICAgICAgIHZhciB3b3JsZCA9IHRoaXMud29ybGQgPSBQaHlzaWNzKClcbiAgICAgICAgLy8gY3JlYXRlIGEgcmVuZGVyZXJcbiAgICAgICAgdGhpcy5yZW5kZXJlciA9IFBoeXNpY3MucmVuZGVyZXIoJ2NhbnZhcycsIHtcbiAgICAgICAgICAgIGVsOiB0aGlzLmNvbnRhaW5lcixcbiAgICAgICAgICAgIHdpZHRoOiB0aGlzLm9wdGlvbnMud2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQ6IHRoaXMub3B0aW9ucy5oZWlnaHRcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMud29ybGQuYWRkKHRoaXMucmVuZGVyZXIpO1xuXG4gICAgICAgIC8vIGFkZCB0aGluZ3MgdG8gdGhlIHdvcmxkXG4gICAgICAgIHRoaXMud29ybGQuYWRkKFtcbiAgICAgICAgICAgIFBoeXNpY3MuYmVoYXZpb3IoJ2ludGVyYWN0aXZlLWZvcmNlJywgeyBlbDogdGhpcy5yZW5kZXJlci5lbCB9KSxcbiAgICAgICAgICAgIFBoeXNpY3MuYmVoYXZpb3IoJ2JvZHktaW1wdWxzZS1yZXNwb25zZScpLFxuICAgICAgICAgICAgUGh5c2ljcy5iZWhhdmlvcignYm9keS1jb2xsaXNpb24tZGV0ZWN0aW9uJyksXG4gICAgICAgICAgICBQaHlzaWNzLmJlaGF2aW9yKCdzd2VlcC1wcnVuZScpLFxuICAgICAgICBdKTtcblxuICAgICAgICBpZiAoIWRpc2FibGVCb3VuZHMpIHtcbiAgICAgICAgICAgIHRoaXMud29ybGQuYWRkKFBoeXNpY3MuYmVoYXZpb3IoJ2VkZ2UtY29sbGlzaW9uLWRldGVjdGlvbicsIHtcbiAgICAgICAgICAgICAgICBhYWJiOiBQaHlzaWNzLmFhYmIoMCwgMCwgdGhpcy5vcHRpb25zLndpZHRoLCB0aGlzLm9wdGlvbnMuaGVpZ2h0KSxcbiAgICAgICAgICAgICAgICByZXN0aXR1dGlvbjogMC4yLFxuICAgICAgICAgICAgICAgIGNvZjogMC44XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH1cblxuXG4gICAgICAgIC8vIHJlbmRlciBvbiBlYWNoIHN0ZXBcbiAgICAgICAgd29ybGQub24oJ3N0ZXAnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB3b3JsZC5yZW5kZXIoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gc3Vic2NyaWJlIHRvIHRpY2tlciB0byBhZHZhbmNlIHRoZSBzaW11bGF0aW9uXG4gICAgICAgIFBoeXNpY3MudXRpbC50aWNrZXIub24oZnVuY3Rpb24oIHRpbWUgKSB7XG4gICAgICAgICAgICB3b3JsZC5zdGVwKCB0aW1lICk7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBydW46IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8gc3RhcnQgdGhlIHRpY2tlclxuICAgICAgICBQaHlzaWNzLnV0aWwudGlja2VyLnN0YXJ0KCk7XG4gICAgfVxufVxuIiwiXG5tb2R1bGUuZXhwb3J0cyA9IENhbkdyYXBoXG5cbmZ1bmN0aW9uIENhbkdyYXBoKG9wdGlvbnMpIHtcbiAgICB0aGlzLm8gPSBfLmV4dGVuZCh7XG4gICAgICAgIG1heDogNTAwLFxuICAgICAgICBtYXJnaW46IDEwLFxuICAgICAgICBtaW5zY2FsZTogMSxcbiAgICAgICAgdGlja3NjYWxlOiA1MFxuICAgIH0sIG9wdGlvbnMpXG4gICAgdGhpcy5wb2ludHMgPSBbXVxuICAgIHRoaXMucHJldnNjYWxlID0gdGhpcy5vLm1pbnNjYWxlXG4gICAgdGhpcy5vZmYgPSAwXG59XG5cbkNhbkdyYXBoLnByb3RvdHlwZSA9IHtcbiAgICBkcmF3OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICghdGhpcy5wb2ludHMubGVuZ3RoKSByZXR1cm5cbiAgICAgICAgdmFyIGN0eCA9IHRoaXMuby5ub2RlLmdldENvbnRleHQoJzJkJylcbiAgICAgICAgdmFyIHdpZHRoID0gdGhpcy5vLndpZHRoIC0gdGhpcy5vLm1hcmdpbioyXG4gICAgICAgIHZhciBoZWlnaHQgPSB0aGlzLm8uaGVpZ2h0IC0gdGhpcy5vLm1hcmdpbioyXG4gICAgICAgIHZhciB0b3AgPSB0aGlzLm8udG9wICsgdGhpcy5vLm1hcmdpblxuICAgICAgICB2YXIgbGVmdCA9IHRoaXMuby5sZWZ0ICsgdGhpcy5vLm1hcmdpblxuXG4gICAgICAgIHZhciBkeCA9IHdpZHRoIC8gdGhpcy5wb2ludHMubGVuZ3RoXG4gICAgICAgIHZhciBtaW4gPSBNYXRoLm1pbi5hcHBseShNYXRoLCB0aGlzLnBvaW50cylcbiAgICAgICAgdmFyIG1heCA9IE1hdGgubWF4LmFwcGx5KE1hdGgsIHRoaXMucG9pbnRzKVxuICAgICAgICB2YXIgc2NhbGUgPSBtYXggLSBtaW5cbiAgICAgICAgaWYgKHNjYWxlIDwgdGhpcy5vLm1pbnNjYWxlKSB7XG4gICAgICAgICAgICBzY2FsZSA9IHRoaXMuby5taW5zY2FsZVxuICAgICAgICB9XG4gICAgICAgIGlmIChzY2FsZSA8IHRoaXMucHJldnNjYWxlKi45OSkge1xuICAgICAgICAgICAgc2NhbGUgPSB0aGlzLnByZXZzY2FsZSouOTlcbiAgICAgICAgfVxuICAgICAgICB2YXIgZHkgPSBoZWlnaHQgLyBzY2FsZVxuICAgICAgICBpZiAobWF4IC0gbWluIDwgc2NhbGUpIHtcbiAgICAgICAgICAgIHZhciBkID0gc2NhbGUgLSAobWF4LW1pbilcbiAgICAgICAgICAgIG1pbiAtPSBkLzJcbiAgICAgICAgICAgIG1heCArPSBkLzJcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMucHJldnNjYWxlID0gc2NhbGVcblxuICAgICAgICAvLyBkcmF3IHggYXhpc1xuICAgICAgICBpZiAobWluIDw9IDAgJiYgbWF4ID49IDApIHtcbiAgICAgICAgICAgIGN0eC5iZWdpblBhdGgoKVxuICAgICAgICAgICAgY3R4Lm1vdmVUbyhsZWZ0LCB0b3AgKyBoZWlnaHQgLSAoLW1pbikqZHkpXG4gICAgICAgICAgICBjdHgubGluZVRvKGxlZnQgKyB3aWR0aCwgdG9wICsgaGVpZ2h0IC0gKC1taW4pKmR5KVxuICAgICAgICAgICAgY3R4LnN0cm9rZVN0eWxlID0gJyNjY2MnXG4gICAgICAgICAgICBjdHguc3Ryb2tlKClcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGRyYXcgdGlja3NcbiAgICAgICAgdmFyIHRpY2t0b3AgPSB0b3AgKyBoZWlnaHQgLSAoLW1pbikqZHkgLSA1XG4gICAgICAgIGlmICh0aWNrdG9wIDwgdG9wKSB7XG4gICAgICAgICAgICB0aWNrdG9wID0gdG9wXG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRpY2t0b3AgKyAxMCA+IHRvcCArIGhlaWdodCkge1xuICAgICAgICAgICAgdGlja3RvcCA9IHRvcCArIGhlaWdodCAtIDEwXG4gICAgICAgIH1cbiAgICAgICAgZm9yICh2YXIgaT10aGlzLm9mZjsgaTx0aGlzLnBvaW50cy5sZW5ndGg7IGkrPXRoaXMuby50aWNrc2NhbGUpIHtcbiAgICAgICAgICAgIGN0eC5iZWdpblBhdGgoKVxuICAgICAgICAgICAgY3R4Lm1vdmVUbyhsZWZ0ICsgaSpkeCwgdGlja3RvcClcbiAgICAgICAgICAgIGN0eC5saW5lVG8obGVmdCArIGkqZHgsIHRpY2t0b3AgKyAxMClcbiAgICAgICAgICAgIGN0eC5zdHJva2VTdHlsZSA9ICcjY2NjJ1xuICAgICAgICAgICAgY3R4LnN0cm9rZSgpXG4gICAgICAgIH1cblxuXG4gICAgICAgIC8vIGRyYXcgbGluZVxuICAgICAgICBjdHguYmVnaW5QYXRoKClcbiAgICAgICAgdGhpcy5wb2ludHMubWFwKGZ1bmN0aW9uIChwLCB4KSB7XG4gICAgICAgICAgICBjdHgubGluZVRvKGxlZnQgKyB4ICogZHgsIHRvcCArIGhlaWdodCAtIChwIC0gbWluKSAqIGR5KVxuICAgICAgICB9KVxuICAgICAgICBjdHguc3Ryb2tlU3R5bGUgPSAnYmx1ZSdcbiAgICAgICAgY3R4LmxpbmVXaWR0aCA9IDFcbiAgICAgICAgY3R4LnN0cm9rZSgpXG5cbiAgICAgICAgLy8gZHJhdyB0aXRsZVxuICAgICAgICB2YXIgdGggPSAxMFxuICAgICAgICBjdHguZm9udCA9IHRoICsgJ3B0IEFyaWFsJ1xuICAgICAgICB2YXIgdHcgPSBjdHgubWVhc3VyZVRleHQodGhpcy5vLnRpdGxlKS53aWR0aFxuICAgICAgICBjdHguZmlsbFN0eWxlID0gJ2JsYWNrJ1xuICAgICAgICBjdHguZ2xvYmFsQWxwaGEgPSAxXG4gICAgICAgIGN0eC5jbGVhclJlY3QobGVmdCwgdG9wLCB0dywgdGggKyA1KVxuICAgICAgICBjdHguZmlsbFRleHQodGhpcy5vLnRpdGxlLCBsZWZ0LCB0b3AgKyB0aClcblxuXG4gICAgICAgIC8vIGRyYXcgcmVjdFxuICAgICAgICBjdHguc3Ryb2tlU3R5bGUgPSAnIzY2NidcbiAgICAgICAgY3R4LnJlY3QodGhpcy5vLmxlZnQgKyB0aGlzLm8ubWFyZ2luLzIsdGhpcy5vLnRvcCArIHRoaXMuby5tYXJnaW4vMix0aGlzLm8ud2lkdGggLSB0aGlzLm8ubWFyZ2luLHRoaXMuby5oZWlnaHQgLSB0aGlzLm8ubWFyZ2luKVxuICAgICAgICBjdHguc3Ryb2tlKClcbiAgICB9LFxuICAgIGFkZFBvaW50OiBmdW5jdGlvbiAocG9pbnQpIHtcbiAgICAgICAgdGhpcy5wb2ludHMucHVzaChwb2ludClcbiAgICAgICAgaWYgKHRoaXMucG9pbnRzLmxlbmd0aCA+IHRoaXMuby5tYXgpIHtcbiAgICAgICAgICAgIHRoaXMub2ZmIC09IHRoaXMucG9pbnRzLmxlbmd0aCAtIHRoaXMuby5tYXhcbiAgICAgICAgICAgIHRoaXMub2ZmICU9IHRoaXMuby50aWNrc2NhbGVcbiAgICAgICAgICAgIHRoaXMucG9pbnRzID0gdGhpcy5wb2ludHMuc2xpY2UoLXRoaXMuby5tYXgpXG4gICAgICAgIH1cbiAgICB9XG59XG5cbiIsIm1vZHVsZS5leHBvcnRzID0gY2hlY2tDb2xsaXNpb247XG5cbmZ1bmN0aW9uIGNoZWNrQ29sbGlzaW9uKGJvZHlBLCBib2R5Qikge1xuICAgIHZhciBzdXBwb3J0Rm5TdGFjayA9IFtdO1xuXG4gICAgLypcbiAgICAgKiBnZXRTdXBwb3J0Rm4oIGJvZHlBLCBib2R5QiApIC0+IEZ1bmN0aW9uXG4gICAgICogLSBib2R5QSAoT2JqZWN0KTogRmlyc3QgYm9keVxuICAgICAqIC0gYm9keUIgKE9iamVjdCk6IFNlY29uZCBib2R5XG4gICAgICogKyAoRnVuY3Rpb24pOiBUaGUgc3VwcG9ydCBmdW5jdGlvblxuICAgICAqXG4gICAgICogR2V0IGEgZ2VuZXJhbCBzdXBwb3J0IGZ1bmN0aW9uIGZvciB1c2Ugd2l0aCBHSksgYWxnb3JpdGhtXG4gICAgICovXG4gICAgdmFyIGdldFN1cHBvcnRGbiA9IGZ1bmN0aW9uIGdldFN1cHBvcnRGbiggYm9keUEsIGJvZHlCICl7XG5cbiAgICAgICAgdmFyIGhhc2ggPSBQaHlzaWNzLnV0aWwucGFpckhhc2goIGJvZHlBLnVpZCwgYm9keUIudWlkIClcbiAgICAgICAgdmFyIGZuID0gc3VwcG9ydEZuU3RhY2tbIGhhc2ggXVxuXG4gICAgICAgIGlmICggIWZuICl7XG4gICAgICAgICAgICBmbiA9IHN1cHBvcnRGblN0YWNrWyBoYXNoIF0gPSBmdW5jdGlvbiggc2VhcmNoRGlyICl7XG5cbiAgICAgICAgICAgICAgICB2YXIgc2NyYXRjaCA9IFBoeXNpY3Muc2NyYXRjaHBhZCgpXG4gICAgICAgICAgICAgICAgdmFyIHRBID0gZm4udEFcbiAgICAgICAgICAgICAgICB2YXIgdEIgPSBmbi50QlxuICAgICAgICAgICAgICAgIHZhciB2QSA9IHNjcmF0Y2gudmVjdG9yKClcbiAgICAgICAgICAgICAgICB2YXIgdkIgPSBzY3JhdGNoLnZlY3RvcigpXG4gICAgICAgICAgICAgICAgdmFyIG1hcmdpbkEgPSBmbi5tYXJnaW5BXG4gICAgICAgICAgICAgICAgdmFyIG1hcmdpbkIgPSBmbi5tYXJnaW5CXG4gICAgICAgICAgICAgICAgO1xuXG4gICAgICAgICAgICAgICAgaWYgKCBmbi51c2VDb3JlICl7XG4gICAgICAgICAgICAgICAgICAgIHZBID0gYm9keUEuZ2VvbWV0cnkuZ2V0RmFydGhlc3RDb3JlUG9pbnQoIHNlYXJjaERpci5yb3RhdGVJbnYoIHRBICksIHZBLCBtYXJnaW5BICkudHJhbnNmb3JtKCB0QSApO1xuICAgICAgICAgICAgICAgICAgICB2QiA9IGJvZHlCLmdlb21ldHJ5LmdldEZhcnRoZXN0Q29yZVBvaW50KCBzZWFyY2hEaXIucm90YXRlKCB0QSApLnJvdGF0ZUludiggdEIgKS5uZWdhdGUoKSwgdkIsIG1hcmdpbkIgKS50cmFuc2Zvcm0oIHRCICk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdkEgPSBib2R5QS5nZW9tZXRyeS5nZXRGYXJ0aGVzdEh1bGxQb2ludCggc2VhcmNoRGlyLnJvdGF0ZUludiggdEEgKSwgdkEgKS50cmFuc2Zvcm0oIHRBICk7XG4gICAgICAgICAgICAgICAgICAgIHZCID0gYm9keUIuZ2VvbWV0cnkuZ2V0RmFydGhlc3RIdWxsUG9pbnQoIHNlYXJjaERpci5yb3RhdGUoIHRBICkucm90YXRlSW52KCB0QiApLm5lZ2F0ZSgpLCB2QiApLnRyYW5zZm9ybSggdEIgKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBzZWFyY2hEaXIubmVnYXRlKCkucm90YXRlKCB0QiApO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHNjcmF0Y2guZG9uZSh7XG4gICAgICAgICAgICAgICAgICAgIGE6IHZBLnZhbHVlcygpLFxuICAgICAgICAgICAgICAgICAgICBiOiB2Qi52YWx1ZXMoKSxcbiAgICAgICAgICAgICAgICAgICAgcHQ6IHZBLnZzdWIoIHZCICkudmFsdWVzKClcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGZuLnRBID0gUGh5c2ljcy50cmFuc2Zvcm0oKTtcbiAgICAgICAgICAgIGZuLnRCID0gUGh5c2ljcy50cmFuc2Zvcm0oKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZuLnVzZUNvcmUgPSBmYWxzZTtcbiAgICAgICAgZm4ubWFyZ2luID0gMDtcbiAgICAgICAgZm4udEEuc2V0VHJhbnNsYXRpb24oIGJvZHlBLnN0YXRlLnBvcyApLnNldFJvdGF0aW9uKCBib2R5QS5zdGF0ZS5hbmd1bGFyLnBvcyApO1xuICAgICAgICBmbi50Qi5zZXRUcmFuc2xhdGlvbiggYm9keUIuc3RhdGUucG9zICkuc2V0Um90YXRpb24oIGJvZHlCLnN0YXRlLmFuZ3VsYXIucG9zICk7XG4gICAgICAgIGZuLmJvZHlBID0gYm9keUE7XG4gICAgICAgIGZuLmJvZHlCID0gYm9keUI7XG5cbiAgICAgICAgcmV0dXJuIGZuO1xuICAgIH07XG5cbiAgICAvKlxuICAgICAqIGNoZWNrR0pLKCBib2R5QSwgYm9keUIgKSAtPiBPYmplY3RcbiAgICAgKiAtIGJvZHlBIChPYmplY3QpOiBGaXJzdCBib2R5XG4gICAgICogLSBib2R5QiAoT2JqZWN0KTogU2Vjb25kIGJvZHlcbiAgICAgKiArIChPYmplY3QpOiBDb2xsaXNpb24gcmVzdWx0XG4gICAgICpcbiAgICAgKiBVc2UgR0pLIGFsZ29yaXRobSB0byBjaGVjayBhcmJpdHJhcnkgYm9kaWVzIGZvciBjb2xsaXNpb25zXG4gICAgICovXG4gICAgdmFyIGNoZWNrR0pLID0gZnVuY3Rpb24gY2hlY2tHSksoIGJvZHlBLCBib2R5QiApe1xuXG4gICAgICAgIHZhciBzY3JhdGNoID0gUGh5c2ljcy5zY3JhdGNocGFkKClcbiAgICAgICAgdmFyIGQgPSBzY3JhdGNoLnZlY3RvcigpXG4gICAgICAgIHZhciB0bXAgPSBzY3JhdGNoLnZlY3RvcigpXG4gICAgICAgICAgICAsb3ZlcmxhcFxuICAgICAgICB2YXIgcmVzdWx0XG4gICAgICAgIHZhciBzdXBwb3J0XG4gICAgICAgIHZhciBjb2xsaXNpb24gPSBmYWxzZVxuICAgICAgICB2YXIgYWFiYkEgPSBib2R5QS5hYWJiKClcbiAgICAgICAgICAgICxkaW1BID0gTWF0aC5taW4oIGFhYmJBLmh3LCBhYWJiQS5oaCApXG4gICAgICAgIHZhciBhYWJiQiA9IGJvZHlCLmFhYmIoKVxuICAgICAgICB2YXIgZGltQiA9IE1hdGgubWluKCBhYWJiQi5odywgYWFiYkIuaGggKVxuICAgICAgICA7XG5cbiAgICAgICAgLy8ganVzdCBjaGVjayB0aGUgb3ZlcmxhcCBmaXJzdFxuICAgICAgICBzdXBwb3J0ID0gZ2V0U3VwcG9ydEZuKCBib2R5QSwgYm9keUIgKTtcbiAgICAgICAgZC5jbG9uZSggYm9keUEuc3RhdGUucG9zICkudnN1YiggYm9keUIuc3RhdGUucG9zICk7XG4gICAgICAgIHJlc3VsdCA9IFBoeXNpY3MuZ2prKHN1cHBvcnQsIGQsIHRydWUpO1xuXG4gICAgICAgIGlmICggcmVzdWx0Lm92ZXJsYXAgKXtcblxuICAgICAgICAgICAgLy8gdGhlcmUgaXMgYSBjb2xsaXNpb24uIGxldCdzIGRvIG1vcmUgd29yay5cbiAgICAgICAgICAgIGNvbGxpc2lvbiA9IHtcbiAgICAgICAgICAgICAgICBib2R5QTogYm9keUEsXG4gICAgICAgICAgICAgICAgYm9keUI6IGJvZHlCXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAvLyBmaXJzdCBnZXQgdGhlIG1pbiBkaXN0YW5jZSBvZiBiZXR3ZWVuIGNvcmUgb2JqZWN0c1xuICAgICAgICAgICAgc3VwcG9ydC51c2VDb3JlID0gdHJ1ZTtcbiAgICAgICAgICAgIHN1cHBvcnQubWFyZ2luQSA9IDA7XG4gICAgICAgICAgICBzdXBwb3J0Lm1hcmdpbkIgPSAwO1xuXG4gICAgICAgICAgICB3aGlsZSAoIHJlc3VsdC5vdmVybGFwICYmIChzdXBwb3J0Lm1hcmdpbkEgPCBkaW1BIHx8IHN1cHBvcnQubWFyZ2luQiA8IGRpbUIpICl7XG4gICAgICAgICAgICAgICAgaWYgKCBzdXBwb3J0Lm1hcmdpbkEgPCBkaW1BICl7XG4gICAgICAgICAgICAgICAgICAgIHN1cHBvcnQubWFyZ2luQSArPSAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoIHN1cHBvcnQubWFyZ2luQiA8IGRpbUIgKXtcbiAgICAgICAgICAgICAgICAgICAgc3VwcG9ydC5tYXJnaW5CICs9IDE7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gUGh5c2ljcy5namsoc3VwcG9ydCwgZCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICggcmVzdWx0Lm92ZXJsYXAgfHwgcmVzdWx0Lm1heEl0ZXJhdGlvbnNSZWFjaGVkICl7XG4gICAgICAgICAgICAgICAgLy8gVGhpcyBpbXBsZW1lbnRhdGlvbiBjYW4ndCBkZWFsIHdpdGggYSBjb3JlIG92ZXJsYXAgeWV0XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNjcmF0Y2guZG9uZShmYWxzZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGNhbGMgb3ZlcmxhcFxuICAgICAgICAgICAgb3ZlcmxhcCA9IE1hdGgubWF4KDAsIChzdXBwb3J0Lm1hcmdpbkEgKyBzdXBwb3J0Lm1hcmdpbkIpIC0gcmVzdWx0LmRpc3RhbmNlKTtcbiAgICAgICAgICAgIGNvbGxpc2lvbi5vdmVybGFwID0gb3ZlcmxhcDtcbiAgICAgICAgICAgIC8vIEBUT0RPOiBmb3Igbm93LCBqdXN0IGxldCB0aGUgbm9ybWFsIGJlIHRoZSBtdHZcbiAgICAgICAgICAgIGNvbGxpc2lvbi5ub3JtID0gZC5jbG9uZSggcmVzdWx0LmNsb3Nlc3QuYiApLnZzdWIoIHRtcC5jbG9uZSggcmVzdWx0LmNsb3Nlc3QuYSApICkubm9ybWFsaXplKCkudmFsdWVzKCk7XG4gICAgICAgICAgICBjb2xsaXNpb24ubXR2ID0gZC5tdWx0KCBvdmVybGFwICkudmFsdWVzKCk7XG4gICAgICAgICAgICAvLyBnZXQgYSBjb3JyZXNwb25kaW5nIGh1bGwgcG9pbnQgZm9yIG9uZSBvZiB0aGUgY29yZSBwb2ludHMuLiByZWxhdGl2ZSB0byBib2R5IEFcbiAgICAgICAgICAgIGNvbGxpc2lvbi5wb3MgPSBkLmNsb25lKCBjb2xsaXNpb24ubm9ybSApLm11bHQoIHN1cHBvcnQubWFyZ2luICkudmFkZCggdG1wLmNsb25lKCByZXN1bHQuY2xvc2VzdC5hICkgKS52c3ViKCBib2R5QS5zdGF0ZS5wb3MgKS52YWx1ZXMoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBzY3JhdGNoLmRvbmUoIGNvbGxpc2lvbiApO1xuICAgIH07XG5cbiAgICAvKlxuICAgICAqIGNoZWNrQ2lyY2xlcyggYm9keUEsIGJvZHlCICkgLT4gT2JqZWN0XG4gICAgICogLSBib2R5QSAoT2JqZWN0KTogRmlyc3QgYm9keVxuICAgICAqIC0gYm9keUIgKE9iamVjdCk6IFNlY29uZCBib2R5XG4gICAgICogKyAoT2JqZWN0KTogQ29sbGlzaW9uIHJlc3VsdFxuICAgICAqXG4gICAgICogQ2hlY2sgdHdvIGNpcmNsZXMgZm9yIGNvbGxpc2lvbnMuXG4gICAgICovXG4gICAgdmFyIGNoZWNrQ2lyY2xlcyA9IGZ1bmN0aW9uIGNoZWNrQ2lyY2xlcyggYm9keUEsIGJvZHlCICl7XG5cbiAgICAgICAgdmFyIHNjcmF0Y2ggPSBQaHlzaWNzLnNjcmF0Y2hwYWQoKVxuICAgICAgICB2YXIgZCA9IHNjcmF0Y2gudmVjdG9yKClcbiAgICAgICAgdmFyIHRtcCA9IHNjcmF0Y2gudmVjdG9yKClcbiAgICAgICAgdmFyIG92ZXJsYXBcbiAgICAgICAgdmFyIGNvbGxpc2lvbiA9IGZhbHNlXG5cbiAgICAgICAgZC5jbG9uZSggYm9keUIuc3RhdGUucG9zICkudnN1YiggYm9keUEuc3RhdGUucG9zICk7XG4gICAgICAgIG92ZXJsYXAgPSBkLm5vcm0oKSAtIChib2R5QS5nZW9tZXRyeS5yYWRpdXMgKyBib2R5Qi5nZW9tZXRyeS5yYWRpdXMpO1xuXG4gICAgICAgIC8vIGhtbS4uLiB0aGV5IG92ZXJsYXAgZXhhY3RseS4uLiBjaG9vc2UgYSBkaXJlY3Rpb25cbiAgICAgICAgaWYgKCBkLmVxdWFscyggUGh5c2ljcy52ZWN0b3IuemVybyApICl7XG5cbiAgICAgICAgICAgIGQuc2V0KCAxLCAwICk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBpZiAoIG92ZXJsYXAgPiAwICl7XG4gICAgICAgIC8vICAgICAvLyBjaGVjayB0aGUgZnV0dXJlXG4gICAgICAgIC8vICAgICBkLnZhZGQoIHRtcC5jbG9uZShib2R5Qi5zdGF0ZS52ZWwpLm11bHQoIGR0ICkgKS52c3ViKCB0bXAuY2xvbmUoYm9keUEuc3RhdGUudmVsKS5tdWx0KCBkdCApICk7XG4gICAgICAgIC8vICAgICBvdmVybGFwID0gZC5ub3JtKCkgLSAoYm9keUEuZ2VvbWV0cnkucmFkaXVzICsgYm9keUIuZ2VvbWV0cnkucmFkaXVzKTtcbiAgICAgICAgLy8gfVxuXG4gICAgICAgIGlmICggb3ZlcmxhcCA8PSAwICl7XG5cbiAgICAgICAgICAgIGNvbGxpc2lvbiA9IHtcbiAgICAgICAgICAgICAgICBib2R5QTogYm9keUEsXG4gICAgICAgICAgICAgICAgYm9keUI6IGJvZHlCLFxuICAgICAgICAgICAgICAgIG5vcm06IGQubm9ybWFsaXplKCkudmFsdWVzKCksXG4gICAgICAgICAgICAgICAgbXR2OiBkLm11bHQoIC1vdmVybGFwICkudmFsdWVzKCksXG4gICAgICAgICAgICAgICAgcG9zOiBkLm5vcm1hbGl6ZSgpLm11bHQoIGJvZHlBLmdlb21ldHJ5LnJhZGl1cyApLnZhbHVlcygpLFxuICAgICAgICAgICAgICAgIG92ZXJsYXA6IC1vdmVybGFwXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHNjcmF0Y2guZG9uZSggY29sbGlzaW9uICk7XG4gICAgfTtcblxuICAgIC8qXG4gICAgICogY2hlY2tQYWlyKCBib2R5QSwgYm9keUIgKSAtPiBPYmplY3RcbiAgICAgKiAtIGJvZHlBIChPYmplY3QpOiBGaXJzdCBib2R5XG4gICAgICogLSBib2R5QiAoT2JqZWN0KTogU2Vjb25kIGJvZHlcbiAgICAgKiArIChPYmplY3QpOiBDb2xsaXNpb24gcmVzdWx0XG4gICAgICpcbiAgICAgKiBDaGVjayBhIHBhaXIgZm9yIGNvbGxpc2lvbnNcbiAgICAgKi9cbiAgICB2YXIgY2hlY2tQYWlyID0gZnVuY3Rpb24gY2hlY2tQYWlyKCBib2R5QSwgYm9keUIgKXtcblxuICAgICAgICAvLyBmaWx0ZXIgb3V0IGJvZGllcyB0aGF0IGRvbid0IGNvbGxpZGUgd2l0aCBlYWNoIG90aGVyXG4gICAgICAgIGlmIChcbiAgICAgICAgICAgICggYm9keUEudHJlYXRtZW50ID09PSAnc3RhdGljJyB8fCBib2R5QS50cmVhdG1lbnQgPT09ICdraW5lbWF0aWMnICkgJiZcbiAgICAgICAgICAgICAgICAoIGJvZHlCLnRyZWF0bWVudCA9PT0gJ3N0YXRpYycgfHwgYm9keUIudHJlYXRtZW50ID09PSAna2luZW1hdGljJyApXG4gICAgICAgICl7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIGJvZHlBLmdlb21ldHJ5Lm5hbWUgPT09ICdjaXJjbGUnICYmIGJvZHlCLmdlb21ldHJ5Lm5hbWUgPT09ICdjaXJjbGUnICl7XG5cbiAgICAgICAgICAgIHJldHVybiBjaGVja0NpcmNsZXMoIGJvZHlBLCBib2R5QiApO1xuXG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgIHJldHVybiBjaGVja0dKSyggYm9keUEsIGJvZHlCICk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIGNoZWNrUGFpcihib2R5QSwgYm9keUIpXG59XG5cbiIsInZhciBHcmFwaCA9IHJlcXVpcmUoJy4vZ3JhcGgnKVxudmFyIEdhdGUgPSByZXF1aXJlKCcuL2dhdGUnKTtcbnZhciBCYXNlID0gcmVxdWlyZSgnLi9iYXNlJyk7XG52YXIgU3RvcHdhdGNoID0gcmVxdWlyZSgnLi9zdG9wd2F0Y2gnKTtcbnZhciBQbGF5UGF1c2UgPSByZXF1aXJlKCcuL3BsYXlwYXVzZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2UuZXh0ZW5kKGZ1bmN0aW9uIERlbW8oY29udGFpbmVyLCBvcHRpb25zKSB7XG4gICAgQmFzZS5jYWxsKHRoaXMsIGNvbnRhaW5lciwgb3B0aW9ucywgJ2ltYWdlcy9sYWJfYmFja2dyb3VuZC5qcGcnKVxufSwge1xuICAgIGRyb3BJbkJvZHk6IGZ1bmN0aW9uIChyYWRpdXMsIHksIGNvbG9yKSB7XG4gICAgICAgIGZ1bmN0aW9uIHJhbmRvbShtaW4sIG1heCl7XG4gICAgICAgICAgICByZXR1cm4gKE1hdGgucmFuZG9tKCkgKiAobWF4LW1pbikgKyBtaW4pfDBcbiAgICAgICAgfVxuICAgICAgICB2YXIgYm9keSA9IFBoeXNpY3MuYm9keSgnY2lyY2xlJywge1xuICAgICAgICAgICAgeDogMTAwLFxuICAgICAgICAgICAgeTogeSxcbiAgICAgICAgICAgIHZ4OiByYW5kb20oLTUsIDUpLzEwMCxcbiAgICAgICAgICAgIHJhZGl1czogcmFkaXVzLFxuICAgICAgICAgICAgcmVzdGl0dXRpb246IDAuOSxcbiAgICAgICAgICAgIHN0eWxlczoge1xuICAgICAgICAgICAgICAgIGltYWdlOiBcImltYWdlcy90ZW5uaXNfYmFsbC5wbmdcIlxuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuXG4gICAgICAgIHRoaXMud29ybGQuYWRkKGJvZHkpO1xuICAgICAgICByZXR1cm4gYm9keTtcbiAgICB9LFxuICAgIHNldHVwOiBmdW5jdGlvbiAoY29udGFpbmVyKSB7XG4gICAgICAgIHZhciB3b3JsZCA9IHRoaXMud29ybGRcbiAgICAgICAgd29ybGQuYWRkKFBoeXNpY3MuYmVoYXZpb3IoJ2NvbnN0YW50LWFjY2VsZXJhdGlvbicpKTtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDU7IGkrKykge1xuICAgICAgICAgICAgdmFyIHJhZGl1cyA9IDIwICsgMTAgKiBpO1xuICAgICAgICAgICAgdGhpcy5kcm9wSW5Cb2R5KHJhZGl1cywgMzAwIC0gaSAqIDUwKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgY2lyY2xlID0gdGhpcy5kcm9wSW5Cb2R5KDQwLCAzMDAgKyAyMCwgJ3JlZCcpXG4gICAgICAgIHZhciBncmFwaCA9IG5ldyBHcmFwaCh0aGlzLmNvbnRhaW5lciwge1xuICAgICAgICAgICAgJ0NpcmNsZSc6IHtib2R5OiBjaXJjbGUsIGF0dHI6ICdwb3MueScsIHRpdGxlOidWZXJ0aWNhbCBQb3NpdGlvbicsIG1pbnNjYWxlOiA1fSxcbiAgICAgICAgICAgICdWZWxZJzoge2JvZHk6IGNpcmNsZSwgYXR0cjogJ3ZlbC55JywgdGl0bGU6J1ZlcnRpY2FsIFZlbG9jaXR5JywgbWluc2NhbGU6IC4xfSxcbiAgICAgICAgICAgICdBbmdQJzoge2JvZHk6IGNpcmNsZSwgYXR0cjogJ2FuZ3VsYXIucG9zJywgdGl0bGU6J1JvdGF0aW9uJywgbWluc2NhbGU6IC4wMDF9LFxuICAgICAgICAgICAgJ0FuZ1YnOiB7Ym9keTogY2lyY2xlLCBhdHRyOiAnYW5ndWxhci52ZWwnLCB0aXRsZTonUm90YXRpb25hbCBWZWxvY2l0eScsIG1pbnNjYWxlOiAuMDAxfSxcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgdG9wOiAxMCxcbiAgICAgICAgICAgIGxlZnQ6IHRoaXMub3B0aW9ucy53aWR0aCAtIDQwMCxcbiAgICAgICAgICAgIHdpZHRoOiA0MDAsXG4gICAgICAgICAgICB3b3JsZEhlaWdodDogdGhpcy5vcHRpb25zLmhlaWdodFxuICAgICAgICB9KVxuICAgICAgICB0aGlzLmdyYXBoID0gZ3JhcGhcblxuICAgICAgICB0aGlzLndvcmxkLm9uKCdzdGVwJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZ3JhcGgudXBkYXRlKHdvcmxkLnRpbWVzdGVwKCkpXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMud29ybGQuYWRkKFBoeXNpY3MuYm9keSgncmVjdGFuZ2xlJywge1xuICAgICAgICAgICAgeDogMjUwLFxuICAgICAgICAgICAgeTogNjAwLFxuICAgICAgICAgICAgd2lkdGg6IDUwLFxuICAgICAgICAgICAgaGVpZ2h0OiA0MDAsXG4gICAgICAgICAgICB0cmVhdG1lbnQ6ICdzdGF0aWMnLFxuICAgICAgICAgICAgc3R5bGVzOiB7XG4gICAgICAgICAgICAgICAgZmlsbFN0eWxlOiAnI2QzMzY4MicsXG4gICAgICAgICAgICAgICAgYW5nbGVJbmRpY2F0b3I6ICcjNzUxYjRiJ1xuICAgICAgICAgICAgfVxuICAgICAgICB9KSlcblxuICAgICAgICB2YXIgYnV0dG9uQ29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGJ1dHRvbkNvbnRhaW5lcik7XG4gICAgICAgIHZhciBwbGF5UGF1c2UgPSBuZXcgUGxheVBhdXNlKHdvcmxkLCBidXR0b25Db250YWluZXIpO1xuICAgICAgICBnYXRlUG9seWdvbiA9IFt7eDogMCwgeTogMzAwfSwge3g6IDcwMCwgeTogMzAwfSwge3g6IDcwMCwgeTogNDAwfSwge3g6IDAsIHk6IDQwMH1dO1xuICAgICAgICB2YXIgZ2F0ZSA9IG5ldyBHYXRlKHdvcmxkLCBidXR0b25Db250YWluZXIsIGdhdGVQb2x5Z29uLCBbMzUwLCA3MDBdLCBudWxsLCB7ZGVidWc6IHRydWUsIHNob3c6IHRydWV9KTtcbiAgICAgICAgZ2F0ZS5vbignZW50ZXInLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICBnYXRlLnN0b3B3YXRjaGVzID0gZ2F0ZS5zdG9wd2F0Y2hlcyB8fCB7fVxuICAgICAgICAgICAgdmFyIHN0b3B3YXRjaCA9IG5ldyBTdG9wd2F0Y2god29ybGQsIGJ1dHRvbkNvbnRhaW5lciwgMSk7XG4gICAgICAgICAgICBzdG9wd2F0Y2gucmVzZXQoKTtcbiAgICAgICAgICAgIHN0b3B3YXRjaC5zdGFydCgpO1xuICAgICAgICAgICAgZ2F0ZS5zdG9wd2F0Y2hlc1tkYXRhLmJvZHkudWlkXSA9IHN0b3B3YXRjaDtcbiAgICAgICAgfSk7XG4gICAgICAgIGdhdGUub24oJ2V4aXQnLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICBnYXRlLnN0b3B3YXRjaGVzW2RhdGEuYm9keS51aWRdLnN0b3AoKVxuICAgICAgICB9KTtcbiAgICB9XG59KTtcblxuIiwidmFyIEJhc2UgPSByZXF1aXJlKCcuL2Jhc2UnKTtcbnZhciBHYXRlID0gcmVxdWlyZSgnLi9nYXRlJyk7XG52YXIgU3RvcHdhdGNoID0gcmVxdWlyZSgnLi9zdG9wd2F0Y2gnKTtcbnZhciBMb2dCb29rID0gcmVxdWlyZSgnLi9sb2dib29rJyk7XG52YXIgUGxheVBhdXNlID0gcmVxdWlyZSgnLi9wbGF5cGF1c2UnKTtcbnZhciBXYWxrVGhyb3VnaCA9IHJlcXVpcmUoJy4vaW50cm8nKTtcbnZhciBEcm9wRGF0YUNoZWNrZXIgPSByZXF1aXJlKCcuL2Ryb3BkYXRhY2hlY2tlci5qc3gnKTtcbnZhciB1dGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XG5cbmZ1bmN0aW9uIHJhbmRvbShtaW4sIG1heCl7XG4gICAgcmV0dXJuIChNYXRoLnJhbmRvbSgpICogKG1heC1taW4pICsgbWluKXwwXG59XG5cbm1vZHVsZS5leHBvcnRzID0gQmFzZS5leHRlbmQoZnVuY3Rpb24gRHJvcChjb250YWluZXIsIG9wdGlvbnMpIHtcbiAgICBCYXNlLmNhbGwodGhpcywgY29udGFpbmVyLCBvcHRpb25zLCBcImltYWdlcy9sYWJfYmFja2dyb3VuZC5qcGdcIilcbn0sIHtcbiAgICBkcm9wQm93bGluZ0JhbGw6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcmFkaXVzID0gMzA7XG4gICAgICAgIHRoaXMud29ybGQuYWRkKFBoeXNpY3MuYm9keSgnY2lyY2xlJywge1xuICAgICAgICAgICAgeDogNzAwLFxuICAgICAgICAgICAgeTogMjAwLFxuICAgICAgICAgICAgdng6IHJhbmRvbSgtMzAsIDMwKS8xMDAsXG4gICAgICAgICAgICByYWRpdXM6IHJhZGl1cyxcbiAgICAgICAgICAgIG1hc3M6IDkwMCxcbiAgICAgICAgICAgIHJlc3RpdHV0aW9uOiAwLjAxLFxuICAgICAgICAgICAgY29mOiAwLjQsXG4gICAgICAgICAgICBzdHlsZXM6IHtcbiAgICAgICAgICAgICAgICBpbWFnZTogXCJpbWFnZXMvYm93bGluZ19iYWxsLnBuZ1wiXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZGlzcGxheU5hbWU6ICdCb3dsaW5nIEJhbGwnLFxuICAgICAgICB9KSk7XG4gICAgfSxcblxuICAgIGRyb3BUZW5uaXNCYWxsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHJhZGl1cyA9IDE1O1xuICAgICAgICB2YXIgYmFsbCA9IFBoeXNpY3MuYm9keSgnY2lyY2xlJywge1xuICAgICAgICAgICAgeDogNzAwLFxuICAgICAgICAgICAgeTogMjAwLFxuICAgICAgICAgICAgdng6IHJhbmRvbSgtMzAsIDMwKS8xMDAsXG4gICAgICAgICAgICByYWRpdXM6IHJhZGl1cyxcbiAgICAgICAgICAgIG1hc3M6IDcuNSxcbiAgICAgICAgICAgIHJlc3RpdHV0aW9uOiAxLFxuICAgICAgICAgICAgZGlzcGxheU5hbWU6ICdUZW5uaXMgQmFsbCcsXG4gICAgICAgICAgICBzdHlsZXM6IHtcbiAgICAgICAgICAgICAgICBpbWFnZTogXCJpbWFnZXMvdGVubmlzX2JhbGwucG5nXCJcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcblxuICAgICAgICBpZiAoIXRoaXMuZmlyc3RUZW5uaXNCYWxsKSB7XG4gICAgICAgICAgICB0aGlzLmZpcnN0VGVubmlzQmFsbCA9IGJhbGw7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLndvcmxkLmFkZChiYWxsKTtcbiAgICB9LFxuXG4gICAgZGVwbG95QmFsbHM6IGZ1bmN0aW9uKG9uRG9uZSkge1xuICAgICAgICB2YXIgc3BhY2luZ19tcyA9IDgwMDtcbiAgICAgICAgdmFyIHF1ZXVlID0gW1xuICAgICAgICAgICAgdGhpcy5kcm9wVGVubmlzQmFsbC5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgdGhpcy5kcm9wVGVubmlzQmFsbC5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgdGhpcy5kcm9wQm93bGluZ0JhbGwuYmluZCh0aGlzKSxcbiAgICAgICAgICAgIHRoaXMuZHJvcFRlbm5pc0JhbGwuYmluZCh0aGlzKSxcbiAgICAgICAgICAgIHRoaXMuZHJvcFRlbm5pc0JhbGwuYmluZCh0aGlzKSxcbiAgICAgICAgICAgIHRoaXMuZHJvcEJvd2xpbmdCYWxsLmJpbmQodGhpcyksXG4gICAgICAgICAgICBvbkRvbmVcbiAgICAgICAgXTtcbiAgICAgICAgXy5yZWR1Y2UocXVldWUsIGZ1bmN0aW9uKHQsIGFjdGlvbikge1xuICAgICAgICAgICAgc2V0VGltZW91dChhY3Rpb24sIHQpXG4gICAgICAgICAgICByZXR1cm4gdCArIHNwYWNpbmdfbXNcbiAgICAgICAgfSwgMClcblxuICAgICAgICAvLyBzZXRUaW1lb3V0KHRoaXMuZHJvcFRlbm5pc0JhbGwuYmluZCh0aGlzKSwgMClcbiAgICAgICAgLy8gc2V0VGltZW91dCh0aGlzLmRyb3BUZW5uaXNCYWxsLmJpbmQodGhpcyksIDEwMClcbiAgICAgICAgLy8gc2V0VGltZW91dCh0aGlzLmRyb3BUZW5uaXNCYWxsLmJpbmQodGhpcyksIDIwMClcbiAgICB9LFxuXG4gICAgc3RhcnRXYWxrdGhyb3VnaDogZnVuY3Rpb24gKCkge1xuICAgICAgICBXYWxrVGhyb3VnaCh0aGlzLCBmdW5jdGlvbiAoaHlwb3RoZXNpcykge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ0dvdCB0aGUgaHlwb3RoZXNpcyEhJywgaHlwb3RoZXNpcyk7XG4gICAgICAgICAgICB0aGlzLnNldHVwRGF0YUNoZWNrZXIoaHlwb3RoZXNpcyk7XG4gICAgICAgIH0uYmluZCh0aGlzKSlcbiAgICB9LFxuXG4gICAgc2V0dXBEYXRhQ2hlY2tlcjogZnVuY3Rpb24gKGh5cG90aGVzaXMpIHtcbiAgICAgICAgdmFyIGRhdGFDaGVja2VyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgZGF0YUNoZWNrZXIuY2xhc3NOYW1lID0gXCJkcm9wLWRhdGEtY2hlY2tlclwiO1xuICAgICAgICB0aGlzLnNpZGVCYXIuYXBwZW5kQ2hpbGQoZGF0YUNoZWNrZXIpO1xuICAgICAgICBSZWFjdC5yZW5kZXJDb21wb25lbnQoRHJvcERhdGFDaGVja2VyKHtcbiAgICAgICAgICAgIGluaXRpYWxIeXBvdGhlc2lzOiBoeXBvdGhlc2lzLFxuICAgICAgICAgICAgbG9nQm9vazogdGhpcy5sb2dCb29rLFxuICAgICAgICAgICAgd29ybGQ6IHRoaXMud29ybGRcbiAgICAgICAgfSksIGRhdGFDaGVja2VyKTtcbiAgICB9LFxuXG4gICAgc2V0dXA6IGZ1bmN0aW9uIChjb250YWluZXIpIHtcbiAgICAgICAgdmFyIHdvcmxkID0gdGhpcy53b3JsZFxuICAgICAgICB2YXIgZ3Jhdml0eSA9IFBoeXNpY3MuYmVoYXZpb3IoJ2NvbnN0YW50LWFjY2VsZXJhdGlvbicpXG4gICAgICAgIGdyYXZpdHkuc2V0QWNjZWxlcmF0aW9uKHt4OiAwLCB5Oi4wMDAzfSk7XG4gICAgICAgIHdvcmxkLmFkZChncmF2aXR5KTtcblxuICAgICAgICAvLyBTaHVudCB0cmlhbmdsZVxuICAgICAgICB0aGlzLndvcmxkLmFkZChQaHlzaWNzLmJvZHkoJ3JlY3RhbmdsZScsIHtcbiAgICAgICAgICAgIHg6IDYwLFxuICAgICAgICAgICAgeTogNjkwLFxuICAgICAgICAgICAgd2lkdGg6IDUwMCxcbiAgICAgICAgICAgIGhlaWdodDogMTAwLFxuICAgICAgICAgICAgYW5nbGU6IE1hdGguUEkgLyA0LFxuICAgICAgICAgICAgdHJlYXRtZW50OiAnc3RhdGljJyxcbiAgICAgICAgICAgIGNvZjogMSxcbiAgICAgICAgICAgIHN0eWxlczoge1xuICAgICAgICAgICAgICAgIGZpbGxTdHlsZTogJyNkMzM2ODInLFxuICAgICAgICAgICAgfVxuICAgICAgICB9KSk7XG5cbiAgICAgICAgdmFyIHNpZGVCYXIgPSB0aGlzLnNpZGVCYXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICBzaWRlQmFyLmNsYXNzTmFtZSA9IFwic2lkZS1iYXJcIjtcbiAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKHNpZGVCYXIpO1xuICAgICAgICB2YXIgdG9wR2F0ZSA9IG5ldyBHYXRlKHdvcmxkLCBidXR0b25Db250YWluZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXRpbC5tYWtlUmVjdCgwLCAwLCAyMDAsIDEwKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbMTIwLCAyMDBdLCBudWxsLCB7ZGVidWc6IHRydWUsIHNob3c6IHRydWUsIGNvbG9yOiAnZ3JlZW4nfSk7XG4gICAgICAgIHZhciBib3R0b21HYXRlID0gbmV3IEdhdGUod29ybGQsIGJ1dHRvbkNvbnRhaW5lcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1dGlsLm1ha2VSZWN0KDAsIDAsIDIwMCwgMTApLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFsxMjAsIDU1MF0sIG51bGwsIHtkZWJ1ZzogdHJ1ZSwgc2hvdzogdHJ1ZSwgY29sb3I6ICdyZWQnfSk7XG4gICAgICAgIHZhciBsb2dDb2x1bW5zID0gW1xuICAgICAgICAgICAge25hbWU6IFwiQm93bGluZyBCYWxsXCIsIGV4dHJhVGV4dDogXCIgKDcga2cpXCJ9LFxuICAgICAgICAgICAge25hbWU6IFwiVGVubmlzIEJhbGxcIiwgZXh0cmFUZXh0OiBcIiAoNTggZylcIiwgY29sb3I6ICdyZ2IoMTU0LCAyNDEsIDApJ31cbiAgICAgICAgXTtcbiAgICAgICAgdmFyIGxvZ0Jvb2sgPSB0aGlzLmxvZ0Jvb2sgPSBuZXcgTG9nQm9vayh3b3JsZCwgdG9wR2F0ZSwgYm90dG9tR2F0ZSwgc2lkZUJhciwgNSwgbG9nQ29sdW1ucyk7XG4gICAgICAgIHZhciBidXR0b25Db250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICB2YXIgcGxheVBhdXNlID0gbmV3IFBsYXlQYXVzZSh3b3JsZCwgYnV0dG9uQ29udGFpbmVyKTtcbiAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGJ1dHRvbkNvbnRhaW5lcik7XG5cbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy53YWxrKSB7XG4gICAgICAgICAgICB0aGlzLnN0YXJ0V2Fsa3Rocm91Z2goKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gQWRkIHRoZSBiYWxscy5cbiAgICAgICAgICAgIHNldFRpbWVvdXQodGhpcy5kZXBsb3lCYWxscy5iaW5kKHRoaXMpLCA1MDApXG4gICAgICAgICAgICB0aGlzLnNldHVwRGF0YUNoZWNrZXIoJ3NhbWUnKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBQaWNrIHVwIG9uZSBvZiB0aGUgdGVubmlzIGJhbGxzIGFuZCBkcm9wIGl0LlxuICAgICAqXG4gICAgICogQHBhcmFtIGNhbGxiYWNrIEdldHMgY2FsbGVkIHdoZW4gdGhlIGRlbW9uc3RyYXRpb24gaXMgb3Zlci5cbiAgICAgKi9cbiAgICBkZW1vbnN0cmF0ZURyb3A6IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBiYWxsID0gdGhpcy5maXJzdFRlbm5pc0JhbGw7XG4gICAgICAgIHZhciB0YXJnZXRYID0gMTI1O1xuICAgICAgICB2YXIgdGFyZ2V0WSA9IDE3MDtcblxuICAgICAgICBiYWxsLnRyZWF0bWVudCA9ICdraW5lbWF0aWMnO1xuICAgICAgICBiYWxsLnN0YXRlLnZlbC54ID0gKHRhcmdldFggLSBiYWxsLnN0YXRlLnBvcy54KSAvIDE1MDA7XG4gICAgICAgIGJhbGwuc3RhdGUudmVsLnkgPSAodGFyZ2V0WSAtIGJhbGwuc3RhdGUucG9zLnkpIC8gMTUwMDtcbiAgICAgICAgYmFsbC5yZWNhbGMoKTtcblxuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgYmFsbC50cmVhdG1lbnQgPSAnc3RhdGljJztcbiAgICAgICAgICAgIGJhbGwuc3RhdGUucG9zLnggPSB0YXJnZXRYO1xuICAgICAgICAgICAgYmFsbC5zdGF0ZS5wb3MueSA9IHRhcmdldFk7XG4gICAgICAgICAgICBiYWxsLnN0YXRlLnZlbC54ID0gMDtcbiAgICAgICAgICAgIGJhbGwuc3RhdGUudmVsLnkgPSAwO1xuICAgICAgICAgICAgYmFsbC5yZWNhbGMoKTtcblxuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBiYWxsLnRyZWF0bWVudCA9ICdkeW5hbWljJztcbiAgICAgICAgICAgICAgICBiYWxsLnJlY2FsYygpO1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICAgICAgfSwgMzAwMClcbiAgICAgICAgICAgIH0sIDE1MDApXG4gICAgICAgIH0sIDE1MDApXG4gICAgfVxufSk7XG4iLCIvKiogQGpzeCBSZWFjdC5ET00gKi9cblxudmFyIERyb3BEYXRhQ2hlY2tlciA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ0Ryb3BEYXRhQ2hlY2tlcicsXG4gICAgLy8gcHJvcHM6IGxvZ0Jvb2ssIHdvcmxkXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB0aGlzUmVzdWx0OiBcIkRvIGFuIGV4cGVyaW1lbnQgdG8gc2VlIGlmIHlvdSBjYW4gZmlndXJlIG91dCB3aGljaCBiYWxsIGZhbGxzIGZhc3RlciwgYW5kIGxldCBtZSBrbm93IHdoZW4geW91J3JlIGRvbmUhXCIsXG4gICAgICAgICAgICBwcmV2UmVzdWx0OiAnJyxcbiAgICAgICAgICAgIGh5cG90aGVzaXM6IHRoaXMucHJvcHMuaW5pdGlhbEh5cG90aGVzaXMsIC8vIHdpbGwgZXZlbnR1YWxseSBiZSBzZXQgd2hlbiB0aGV5IGZpbmlzaCB0aGUgd2Fsa3Rocm91Z2guICBpdCBjYW4gYmUgXCJib3dsaW5nXCIsIFwidGVubmlzXCIsIG9yIFwic2FtZVwiXG4gICAgICAgICAgICBkaXNwcm92ZW46IGZhbHNlLFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHByZXR0eUh5cG90aGVzaXMgPSBSZWFjdC5ET00ucCh7Y2xhc3NOYW1lOiBcImNoZWNrZXJfeW91ci1oeXBvXCJ9LCBSZWFjdC5ET00uZW0obnVsbCwgXCJZb3VyIGh5cG90aGVzaXMgd2FzIFwiLCB0aGlzLnByZXR0eUh5cG90aGVzaXMoKSwgXCIuXCIpKTtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuZGlzcHJvdmVuKSB7XG4gICAgICAgICAgICB2YXIgYm93bGluZ0J1dHRvbiA9IFJlYWN0LkRPTS5idXR0b24oe2NsYXNzTmFtZTogXCJidG4gYnRuLWRlZmF1bHRcIiwgb25DbGljazogdGhpcy5ib3dsaW5nfSwgXCJUaGUgYm93bGluZyBiYWxsIGZhbGxzIGZhc3Rlci5cIilcbiAgICAgICAgICAgIHZhciB0ZW5uaXNCdXR0b24gPSBSZWFjdC5ET00uYnV0dG9uKHtjbGFzc05hbWU6IFwiYnRuIGJ0bi1kZWZhdWx0XCIsIG9uQ2xpY2s6IHRoaXMudGVubmlzfSwgXCJUaGUgdGVubmlzIGJhbGwgZmFsbHMgZmFzdGVyLlwiKVxuICAgICAgICAgICAgdmFyIHNhbWVCdXR0b24gPSBSZWFjdC5ET00uYnV0dG9uKHtjbGFzc05hbWU6IFwiYnRuIGJ0bi1kZWZhdWx0XCIsIG9uQ2xpY2s6IHRoaXMuc2FtZX0sIFwiQm90aCBiYWxscyBmYWxsIGF0IHRoZSBzYW1lIHJhdGUuXCIpXG4gICAgICAgICAgICBpZiAodGhpcy5zdGF0ZS5oeXBvdGhlc2lzID09PSAnYm93bGluZycpIHtcbiAgICAgICAgICAgICAgICBib3dsaW5nQnV0dG9uID0gUmVhY3QuRE9NLmRpdihudWxsKVxuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnN0YXRlLmh5cG90aGVzaXMgPT09ICd0ZW5uaXMnKSB7XG4gICAgICAgICAgICAgICAgdGVubmlzQnV0dG9uID0gUmVhY3QuRE9NLmRpdihudWxsKVxuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnN0YXRlLmh5cG90aGVzaXMgPT09ICdzYW1lJykge1xuICAgICAgICAgICAgICAgIHNhbWVCdXR0b24gPSBSZWFjdC5ET00uZGl2KG51bGwpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImNoZWNrZXJcIn0sIFxuICAgICAgICAgICAgICAgIHByZXR0eUh5cG90aGVzaXMsIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5pbWcoe3NyYzogXCIvaW1hZ2VzL3Npci1mcmFuY2lzLmpwZWdcIiwgY2xhc3NOYW1lOiBcImNoZWNrZXJfZnJhbmNpc1wifSksIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJjaGVja2VyX21haW5cIn0sIFxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5ET00ucChudWxsLCBcIk9rYXksIHdoaWNoIHJlc3VsdCBkbyB0aGV5IHN1cHBvcnQ/XCIpLCBcbiAgICAgICAgICAgICAgICAgICAgYm93bGluZ0J1dHRvbiwgdGVubmlzQnV0dG9uLCBzYW1lQnV0dG9uXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnN0YXRlLnRoaXNSZXN1bHQpIHtcbiAgICAgICAgICAgIHJldHVybiBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwiY2hlY2tlclwifSwgXG4gICAgICAgICAgICAgICAgcHJldHR5SHlwb3RoZXNpcywgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmltZyh7c3JjOiBcIi9pbWFnZXMvc2lyLWZyYW5jaXMuanBlZ1wiLCBjbGFzc05hbWU6IFwiY2hlY2tlcl9mcmFuY2lzXCJ9KSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImNoZWNrZXJfbWFpblwifSwgXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5wKG51bGwsIHRoaXMuc3RhdGUudGhpc1Jlc3VsdCksIFxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5ET00uYnV0dG9uKHtjbGFzc05hbWU6IFwiYnRuIGJ0bi1kZWZhdWx0XCIsIG9uQ2xpY2s6IHRoaXMuc3VwcG9ydH0sIFwiVGhlIGRhdGEgc3VwcG9ydCBteSBoeXBvdGhlc2lzLlwiKSwgXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5idXR0b24oe2NsYXNzTmFtZTogXCJidG4gYnRuLWRlZmF1bHRcIiwgb25DbGljazogdGhpcy5kaXNwcm92ZX0sIFwiVGhlIGRhdGEgZGlzcHJvdmUgbXkgaHlwb3RoZXNpcy5cIilcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJjaGVja2VyXCJ9LCBcbiAgICAgICAgICAgICAgICBwcmV0dHlIeXBvdGhlc2lzLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uaW1nKHtzcmM6IFwiL2ltYWdlcy9zaXItZnJhbmNpcy5qcGVnXCIsIGNsYXNzTmFtZTogXCJjaGVja2VyX2ZyYW5jaXNcIn0pLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwiY2hlY2tlcl9tYWluXCJ9LCBcbiAgICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLnAobnVsbCwgXCJZb3VyIGV4cGVyaW1lbnQgbG9va3MgZ3JlYXQsIGFuZCBJJ20gY29udmluY2VkLiAgSGVyZSwgaGF2ZSBzb21lIGJhY29uLlwiKVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgcHJldHR5SHlwb3RoZXNpczogZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5oeXBvdGhlc2lzID09PSBcInNhbWVcIikge1xuICAgICAgICAgICAgcmV0dXJuIFwidGhhdCBib3RoIGJhbGxzIHdpbGwgZmFsbCBhdCB0aGUgc2FtZSByYXRlXCI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gXCJ0aGF0IHRoZSBcIit0aGlzLnN0YXRlLmh5cG90aGVzaXMrXCIgYmFsbCB3aWxsIGZhbGwgZmFzdGVyXCI7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgcmVzdWx0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIHdlIHJldHVybiB0aGUgZXJyb3IsIG9yIG51bGwgaWYgdGhleSdyZSBjb3JyZWN0XG4gICAgICAgIHZhciBlbm91Z2hEYXRhID0gXy5hbGwodGhpcy5wcm9wcy5sb2dCb29rLmRhdGEsIGZ1bmN0aW9uIChkKSB7cmV0dXJuIGQubGVuZ3RoID49IDU7fSk7XG4gICAgICAgIGlmIChlbm91Z2hEYXRhKSB7XG4gICAgICAgICAgICB2YXIgYXZncyA9IHt9XG4gICAgICAgICAgICB2YXIgbWF4RGVsdGFzID0ge31cbiAgICAgICAgICAgIGZvciAodmFyIG5hbWUgaW4gdGhpcy5wcm9wcy5sb2dCb29rLmRhdGEpIHtcbiAgICAgICAgICAgICAgICBhdmdzW25hbWVdID0gXy5yZWR1Y2UodGhpcy5wcm9wcy5sb2dCb29rLmRhdGFbbmFtZV0sXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIChhLCBiKSB7cmV0dXJuIGEgKyBiO30pIC8gdGhpcy5wcm9wcy5sb2dCb29rLmRhdGFbbmFtZV0ubGVuZ3RoO1xuICAgICAgICAgICAgICAgIG1heERlbHRhc1tuYW1lXSA9IF8ubWF4KF8ubWFwKHRoaXMucHJvcHMubG9nQm9vay5kYXRhW25hbWVdLFxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiAoZGF0dW0pIHtyZXR1cm4gTWF0aC5hYnMoZGF0dW0gLSBhdmdzW25hbWVdKTt9KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS5sb2codGhpcy5wcm9wcy5sb2dCb29rLmRhdGEsIGVub3VnaERhdGEsIGF2Z3MsIG1heERlbHRhcyk7XG4gICAgICAgIGlmICghZW5vdWdoRGF0YSkge1xuICAgICAgICAgICAgcmV0dXJuIFwiWW91IGhhdmVuJ3QgZmlsbGVkIHVwIHlvdXIgbGFiIG5vdGVib29rISAgTWFrZSBzdXJlIHlvdSBnZXQgZW5vdWdoIGRhdGEgc28geW91IGtub3cgeW91ciByZXN1bHRzIGFyZSBhY2N1cmF0ZS5cIjtcbiAgICAgICAgfSBlbHNlIGlmIChtYXhEZWx0YXNbXCJCb3dsaW5nIEJhbGxcIl0gPiAzMDApIHtcbiAgICAgICAgICAgIHJldHVybiBcIk9uZSBvZiB5b3VyIHJlc3VsdHMgZm9yIHRoZSBib3dsaW5nIGJhbGwgbG9va3MgcHJldHR5IGZhciBvZmYhICBUcnkgZ2V0dGluZyBzb21lIG1vcmUgZGF0YSB0byBtYWtlIHN1cmUgaXQgd2FzIGEgZmx1a2UuXCI7XG4gICAgICAgIH0gZWxzZSBpZiAobWF4RGVsdGFzW1wiVGVubmlzIEJhbGxcIl0gPiAzMDApIHtcbiAgICAgICAgICAgIHJldHVybiBcIk9uZSBvZiB5b3VyIHJlc3VsdHMgZm9yIHRoZSB0ZW5uaXMgYmFsbCBsb29rcyBwcmV0dHkgZmFyIG9mZiEgIFRyeSBnZXR0aW5nIHNvbWUgbW9yZSBkYXRhIHRvIG1ha2Ugc3VyZSBpdCB3YXMgYSBmbHVrZS5cIjtcbiAgICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgICAgICAgICAodGhpcy5zdGF0ZS5oeXBvdGhlc2lzID09PSBcInNhbWVcIlxuICAgICAgICAgICAgICAgICAgICAmJiBNYXRoLmFicyhhdmdzW1wiQm93bGluZyBCYWxsXCJdIC0gYXZnc1tcIlRlbm5pcyBCYWxsXCJdKSA+IDEwMClcbiAgICAgICAgICAgICAgICB8fCAodGhpcy5zdGF0ZS5oeXBvdGhlc2lzID09PSBcImJvd2xpbmdcIlxuICAgICAgICAgICAgICAgICAgICAmJiBhdmdzW1wiQm93bGluZyBCYWxsXCJdIDwgYXZnc1tcIlRlbm5pcyBCYWxsXCJdICsgMTAwKVxuICAgICAgICAgICAgICAgIHx8ICh0aGlzLnN0YXRlLmh5cG90aGVzaXMgPT09IFwidGVubmlzXCJcbiAgICAgICAgICAgICAgICAgICAgJiYgYXZnc1tcIlRlbm5pcyBCYWxsXCJdIDwgYXZnc1tcIkJvd2xpbmcgQmFsbFwiXSArIDEwMClcbiAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgIHJldHVybiBcIlRob3NlIHJlc3VsdHMgZG9uJ3QgbG9vayB2ZXJ5IGNvbnNpc3RlbnQgd2l0aCB5b3VyIGh5cG90aGVzaXMuICBJdCdzIGZpbmUgaWYgeW91ciBoeXBvdGhlc2lzIHdhcyBkaXNwcm92ZW4sIHRoYXQncyBob3cgc2NpZW5jZSB3b3JrcyFcIjtcbiAgICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgICAgICAgICB0aGlzLnN0YXRlLmh5cG90aGVzaXMgIT09IFwic2FtZVwiXG4gICAgICAgICAgICAgICAgfHwgYXZnc1tcIkJvd2xpbmcgQmFsbFwiXSA8IDgwMFxuICAgICAgICAgICAgICAgIHx8IGF2Z3NbXCJCb3dsaW5nIEJhbGxcIl0gPiAxNTAwXG4gICAgICAgICAgICAgICAgfHwgYXZnc1tcIlRlbm5pcyBCYWxsXCJdIDwgODAwXG4gICAgICAgICAgICAgICAgfHwgYXZnc1tcIlRlbm5pcyBCYWxsXCJdID4gMTUwMCkge1xuICAgICAgICAgICAgcmV0dXJuIFwiVGhvc2UgcmVzdWx0cyBhcmUgY29uc2lzdGVudCwgYnV0IHRoZXkgZG9uJ3QgbG9vayBxdWl0ZSByaWdodCB0byBtZS4gIE1ha2Ugc3VyZSB5b3UncmUgZHJvcHBpbmcgdGhlIGJhbGxzIGdlbnRseSBmcm9tIHRoZSBzYW1lIGhlaWdodCBhYm92ZSB0aGUgdG9wIHNlbnNvci5cIjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIHN1cHBvcnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5hc2tGcmFuY2lzKCk7XG4gICAgfSxcblxuICAgIGRpc3Byb3ZlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgZGlzcHJvdmVuOiB0cnVlLFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgYm93bGluZzogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGRpc3Byb3ZlbjogZmFsc2UsXG4gICAgICAgICAgICBoeXBvdGhlc2lzOiBcImJvd2xpbmdcIixcbiAgICAgICAgfSwgdGhpcy5hc2tGcmFuY2lzKTtcbiAgICB9LFxuXG4gICAgdGVubmlzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgZGlzcHJvdmVuOiBmYWxzZSxcbiAgICAgICAgICAgIGh5cG90aGVzaXM6IFwidGVubmlzXCIsXG4gICAgICAgIH0sIHRoaXMuYXNrRnJhbmNpcyk7XG4gICAgfSxcblxuICAgIHNhbWU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBkaXNwcm92ZW46IGZhbHNlLFxuICAgICAgICAgICAgaHlwb3RoZXNpczogXCJzYW1lXCIsXG4gICAgICAgIH0sIHRoaXMuYXNrRnJhbmNpcyk7XG4gICAgfSxcblxuICAgIGFza0ZyYW5jaXM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICB0aGlzUmVzdWx0OiB0aGlzLnJlc3VsdCgpLFxuICAgICAgICAgICAgcHJldlJlc3VsdDogdGhpcy5zdGF0ZS50aGlzUmVzdWx0XG4gICAgICAgIH0pO1xuICAgIH1cbn0pXG5cbm1vZHVsZS5leHBvcnRzID0gRHJvcERhdGFDaGVja2VyO1xuIiwidmFyIFN0b3B3YXRjaCA9IHJlcXVpcmUoJy4vc3RvcHdhdGNoJyk7XG52YXIgY2hlY2tDb2xsaXNpb24gPSByZXF1aXJlKCcuL2NoZWNrLWNvbGxpc2lvbicpXG5cbm1vZHVsZS5leHBvcnRzID0gR2F0ZTtcblxudmFyIEVOVEVSX0ZBREVPVVRfRFVSQVRJT04gPSAyMFxudmFyIEVYSVRfRkFERU9VVF9EVVJBVElPTiA9IDIwXG5cbi8qKlxuICogT3B0aS10aGluZ3kgZ2F0ZS5cbiAqIERldGVjdHMgd2hlbiBib2RpZXMgZW50ZXIgYW5kIGV4aXQgYSBzcGVjaWZpZWQgYXJlYS5cbiAqXG4gKiBwb2x5Z29uIC0gc2hvdWxkIGJlIGEgbGlzdCBvZiB2ZWN0b3Jpc2gsIHdoaWNoIG11c3QgYmUgY29udmV4LlxuICogYm9keSAtIHNob3VsZCBiZSBhIGJvZHksIG9yIG51bGwgdG8gdHJhY2sgYWxsIGJvZGllc1xuICogb3B0cyAtIHtkZWJ1ZzogZmFsc2V9XG4gKlxuICogVXNhZ2UgRXhhbXBsZTpcbiAqIHZhciBnYXRlID0gbmV3IEdhdGUoYXdlc29tZV93b3JsZCwgY29udGFpbmVyX2RpdiwgW3t4OiAwLCB5OiAzMDB9LCAuLi5dLCB7ZGVidWc6IHRydWV9KVxuICogZ2F0ZS5vbignZXhpdCcsIGZ1bmN0aW9uKGRhdGEpIHtcbiAqICAgY29uc29sZS5sb2coXCJZb3UgZXNjYXBlZCBtZSBhZ2FpbiEgSSB3aWxsIGZpbmQgeW91LCBvaCBcIiwgZGF0YS5ib2R5KTtcbiAqIH0pXG4gKi9cbmZ1bmN0aW9uIEdhdGUod29ybGQsIGNvbnRhaW5lciwgcG9seWdvbiwgcG9zLCBib2R5LCBvcHRzKSB7XG4gICAgb3B0cyA9IG9wdHMgfHwge307XG4gICAgdGhpcy53b3JsZCA9IHdvcmxkXG4gICAgdGhpcy5ib2R5ID0gYm9keTtcbiAgICAvLyBib2RpZXMgY3VycmVudGx5IGluc2lkZSB0aGlzIGdhdGUuXG4gICAgdGhpcy5jb250YWlucyA9IFtdXG4gICAgdGhpcy5fc3Vic2NyaWJlKClcbiAgICB0aGlzLnBvbHlnb24gPSBwb2x5Z29uXG4gICAgdGhpcy5jb2xsaXNpb25fYm9keSA9IFBoeXNpY3MuYm9keSgnY29udmV4LXBvbHlnb24nLCB7XG4gICAgICAgIHZlcnRpY2VzOiBwb2x5Z29uLFxuICAgICAgICB0cmVhdG1lbnQ6ICdtYWdpYycsXG4gICAgICAgIHg6IHBvc1swXSxcbiAgICAgICAgeTogcG9zWzFdLFxuICAgICAgICB2eDogMCxcbiAgICAgICAgYW5nbGU6IDAsXG4gICAgICAgIHJlc3RpdHV0aW9uOiAwLjksXG4gICAgICAgIHN0eWxlczoge1xuICAgICAgICAgICAgZmlsbFN0eWxlOiAnIzg1OTkwMCcsXG4gICAgICAgICAgICBhbmdsZUluZGljYXRvcjogJyM0MTQ3MDAnXG4gICAgICAgIH1cbiAgICB9KVxuICAgIHRoaXMubW92ZWRfcG9pbnRzID0gcG9seWdvbi5tYXAoZnVuY3Rpb24gKHApIHtcbiAgICAgICAgcmV0dXJuIHt4OiBwLnggKyBwb3NbMF0sIHk6IHAueSArIHBvc1sxXX1cbiAgICB9KTtcbiAgICB0aGlzLnZpZXcgPSB0aGlzLndvcmxkLnJlbmRlcmVyKCkuY3JlYXRlVmlldyh0aGlzLmNvbGxpc2lvbl9ib2R5Lmdlb21ldHJ5LCB7IHN0cm9rZVN0eWxlOiAnI2FhYScsIGxpbmVXaWR0aDogMiwgZmlsbFN0eWxlOiAncmdiYSgwLDAsMCwwKScgfSlcbiAgICAvLyB0aGlzLndvcmxkLmFkZCh0aGlzLmNvbGxpc2lvbl9ib2R5KVxuICAgIGlmIChvcHRzLmRlYnVnKSB0aGlzLnNwZWFrTG91ZGx5KCk7XG4gICAgdGhpcy5fY29sb3IgPSBvcHRzLmNvbG9yXG5cbiAgICB0aGlzLl9lbnRlcl9mYWRlb3V0ID0gMDtcbiAgICB0aGlzLl9leGl0X2ZhZGVvdXQgPSAwO1xufVxuXG5HYXRlLnByb3RvdHlwZS5fc3Vic2NyaWJlID0gZnVuY3Rpb24oKSB7XG4gICAgUGh5c2ljcy51dGlsLnRpY2tlci5vbihmdW5jdGlvbih0aW1lKSB7XG4gICAgICAgIGlmICh0aGlzLmJvZHkpIHtcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlQm9keSh0aGlzLmJvZHkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy53b3JsZC5nZXRCb2RpZXMoKS5mb3JFYWNoKHRoaXMuaGFuZGxlQm9keS5iaW5kKHRoaXMpKVxuICAgICAgICB9XG4gICAgfS5iaW5kKHRoaXMpKVxuXG4gICAgLy8gU3Vic2NyaWJlIHRvIHJlbmRlciBldmVudHNcbiAgICB0aGlzLndvcmxkLm9uKCdyZW5kZXInLCB0aGlzLl9yZW5kZXIuYmluZCh0aGlzKSk7XG5cbiAgICAvLyBTdWJzY3JpYmUgdG8gc2VsZi4gKHdIYVQ/KVxuICAgIHRoaXMub24oJ2VudGVyJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuX2VudGVyX2ZhZGVvdXQgPSBFTlRFUl9GQURFT1VUX0RVUkFUSU9OXG4gICAgfS5iaW5kKHRoaXMpKVxuICAgIHRoaXMub24oJ2V4aXQnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5fZXhpdF9mYWRlb3V0ID0gRVhJVF9GQURFT1VUX0RVUkFUSU9OXG4gICAgfS5iaW5kKHRoaXMpKVxufVxuXG5HYXRlLnByb3RvdHlwZS5fcmVuZGVyID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHIgPSB0aGlzLndvcmxkLnJlbmRlcmVyKCk7XG4gICAgdmFyIGFscGhhID0gdGhpcy5fZW50ZXJfZmFkZW91dCAvIEVOVEVSX0ZBREVPVVRfRFVSQVRJT05cbiAgICB2YXIgc3Ryb2tlU3R5bGVzID0ge1xuICAgICAgICBncmVlbjogJyMwYTAnLFxuICAgICAgICByZWQ6ICcjYTAwJyxcbiAgICAgICAgdW5kZWZpbmVkOiAnI2FhYScsXG4gICAgfVxuICAgIHZhciBmaWxsU3R5bGUgPSB7XG4gICAgICAgIGdyZWVuOiAncmdiYSg1MCwxMDAsNTAsJythbHBoYSsnKScsXG4gICAgICAgIHJlZDogJ3JnYmEoMTAwLDUwLDUwLCcrYWxwaGErJyknLFxuICAgICAgICB1bmRlZmluZWQ6ICdyZ2JhKDAsMCwwLCcrYWxwaGErJyknLFxuICAgIH1cbiAgICByLmRyYXdQb2x5Z29uKHRoaXMubW92ZWRfcG9pbnRzLCB7XG4gICAgICAgIHN0cm9rZVN0eWxlOiBzdHJva2VTdHlsZXNbdGhpcy5fY29sb3JdLFxuICAgICAgICBsaW5lV2lkdGg6IDIsXG4gICAgICAgIGZpbGxTdHlsZTogZmlsbFN0eWxlW3RoaXMuX2NvbG9yXSxcbiAgICB9KTtcblxuICAgIHRoaXMuX2VudGVyX2ZhZGVvdXQgPSBNYXRoLm1heCgwLCB0aGlzLl9lbnRlcl9mYWRlb3V0IC0gMSlcbiAgICB0aGlzLl9leGl0X2ZhZGVvdXQgPSBNYXRoLm1heCgwLCB0aGlzLl9leGl0X2ZhZGVvdXQgLSAxKVxufVxuXG5HYXRlLnByb3RvdHlwZS5oYW5kbGVCb2R5ID0gZnVuY3Rpb24oYm9keSkge1xuICAgIC8vIElnbm9yZSBib2RpZXMgYmVpbmcgZHJhZ2dlZC5cbiAgICBpZiAoYm9keS5kcmFnZ2luZykgcmV0dXJuO1xuXG4gICAgdmFyIHdhc0luID0gdGhpcy5jb250YWlucy5pbmRleE9mKGJvZHkpICE9IC0xXG4gICAgdmFyIGlzSW4gPSB0aGlzLnRlc3RCb2R5KGJvZHkpXG4gICAgaWYgKCF3YXNJbiAmJiBpc0luKSB7XG4gICAgICAgIHRoaXMuY29udGFpbnMucHVzaChib2R5KVxuICAgICAgICB0aGlzLmVtaXQoJ2VudGVyJywge2JvZHk6IGJvZHl9KVxuICAgIH1cbiAgICBpZiAod2FzSW4gJiYgIWlzSW4pIHtcbiAgICAgICAgdGhpcy5jb250YWlucyA9IF8ud2l0aG91dCh0aGlzLmNvbnRhaW5zLCBib2R5KTtcbiAgICAgICAgdGhpcy5lbWl0KCdleGl0Jywge2JvZHk6IGJvZHl9KVxuICAgIH1cbn1cblxuR2F0ZS5wcm90b3R5cGUudGVzdEJvZHkgPSBmdW5jdGlvbihib2R5KSB7XG4gICAgaWYgKCF3aW5kb3cuZGVidWcgJiYgYm9keS50cmVhdG1lbnQgIT09ICdkeW5hbWljJykge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiBjaGVja0NvbGxpc2lvbih0aGlzLmNvbGxpc2lvbl9ib2R5LCBib2R5KVxuICAgIC8vLyB2YXIgcG9zID0gYm9keS5zdGF0ZS5wb3NcbiAgICAvLy8gcmV0dXJuIHRoaXMudGVzdFBvaW50KHt4OiBwb3MueCwgeTogcG9zLnl9KVxufVxuXG5HYXRlLnByb3RvdHlwZS50ZXN0UG9pbnQgPSBmdW5jdGlvbih2ZWN0b3Jpc2gpIHtcbiAgICByZXR1cm4gUGh5c2ljcy5nZW9tZXRyeS5pc1BvaW50SW5Qb2x5Z29uKFxuICAgICAgICB2ZWN0b3Jpc2gsXG4gICAgICAgIHRoaXMucG9seWdvbik7XG59XG5cbi8vIEdhdGUucHJvdG90eXBlLnJ1blN0b3B3YXRjaCA9IGZ1bmN0aW9uKHN0b3B3YXRjaCkge1xuICAgIC8vIHRoaXMub24oJ2VudGVyJywgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAvLyBzdG9wd2F0Y2gucmVzZXQoKTtcbiAgICAgICAgLy8gc3RvcHdhdGNoLnN0YXJ0KCk7XG4gICAgLy8gfSk7XG4gICAgLy8gdGhpcy5vbignZXhpdCcsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgLy8gc3RvcHdhdGNoLnN0b3AoKTtcbiAgICAvLyB9KTtcbi8vIH1cblxuLyoqXG4gKiBEZWJ1Z2dpbmcgZnVuY3Rpb24gdG8gbGlzdGVuIHRvIG15IG93biBldmVudHMgYW5kIGNvbnNvbGUubG9nIHRoZW0uXG4gKi9cbkdhdGUucHJvdG90eXBlLnNwZWFrTG91ZGx5ID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5vbignZW50ZXInLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdlbnRlcicsIGRhdGEuYm9keSlcbiAgICB9KVxuICAgIHRoaXMub24oJ2V4aXQnLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdleGl0JywgZGF0YS5ib2R5KVxuICAgIH0pXG4gICAgcmV0dXJuIHtidXRDYXJyeUFCaWdTdGljazogJyd9XG59XG5cbl8uZXh0ZW5kKEdhdGUucHJvdG90eXBlLCBQaHlzaWNzLnV0aWwucHVic3ViLnByb3RvdHlwZSlcbiIsIlxudmFyIENhbkdyYXBoID0gcmVxdWlyZSgnLi9jYW5ncmFwaCcpXG5cbm1vZHVsZS5leHBvcnRzID0gR3JhcGhcblxuZnVuY3Rpb24gZ2V0RGF0dW0oaXRlbSkge1xuICAgIHJldHVybiBpdGVtLmF0dHIuc3BsaXQoJy4nKS5yZWR1Y2UoZnVuY3Rpb24gKG5vZGUsIGF0dHIpIHtcbiAgICAgICAgcmV0dXJuIG5vZGVbYXR0cl1cbiAgICB9LCBpdGVtLmJvZHkuc3RhdGUpXG59XG5cbmZ1bmN0aW9uIEdyYXBoKHBhcmVudCwgdHJhY2tpbmcsIG9wdGlvbnMpIHtcbiAgICB0aGlzLm8gPSBfLmV4dGVuZCh7XG4gICAgICAgIHRvcDogMTAsXG4gICAgICAgIGxlZnQ6IDEwLFxuICAgICAgICB3aWR0aDogNjAwLFxuICAgICAgICBoZWlnaHQ6IDQwMCxcbiAgICAgICAgd29ybGRIZWlnaHQ6IDIwMFxuICAgIH0sIG9wdGlvbnMpXG4gICAgdGhpcy50cmFja2luZyA9IHRyYWNraW5nXG4gICAgdGhpcy5kYXRhID0gW11cbiAgICB0aGlzLm5vZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKVxuICAgIHRoaXMubm9kZS5jbGFzc05hbWUgPSAnZ3JhcGgnXG4gICAgdGhpcy5ub2RlLndpZHRoID0gdGhpcy5vLndpZHRoXG4gICAgdGhpcy5ub2RlLmhlaWdodCA9IHRoaXMuby5oZWlnaHRcbiAgICB0aGlzLm5vZGUuc3R5bGUudG9wID0gdGhpcy5vLnRvcCArICdweCdcbiAgICB0aGlzLm5vZGUuc3R5bGUubGVmdCA9IHRoaXMuby5sZWZ0ICsgJ3B4J1xuICAgIHZhciBudW1ncmFwaHMgPSBPYmplY3Qua2V5cyh0cmFja2luZykubGVuZ3RoXG4gICAgdmFyIGdyYXBoaGVpZ2h0ID0gdGhpcy5vLmhlaWdodCAvIG51bWdyYXBoc1xuICAgIHBhcmVudC5hcHBlbmRDaGlsZCh0aGlzLm5vZGUpXG5cbiAgICB0aGlzLmdyYXBocyA9IHt9XG4gICAgdmFyIGkgPSAwXG4gICAgZm9yICh2YXIgbmFtZSBpbiB0cmFja2luZykge1xuICAgICAgICB0aGlzLmdyYXBoc1tuYW1lXSA9IG5ldyBDYW5HcmFwaCh7XG4gICAgICAgICAgICBub2RlOiB0aGlzLm5vZGUsXG4gICAgICAgICAgICBtaW5zY2FsZTogdHJhY2tpbmdbbmFtZV0ubWluc2NhbGUsXG4gICAgICAgICAgICB0aXRsZTogdHJhY2tpbmdbbmFtZV0udGl0bGUsXG4gICAgICAgICAgICB0b3A6IGdyYXBoaGVpZ2h0ICogaSsrLFxuICAgICAgICAgICAgbGVmdDogMCxcbiAgICAgICAgICAgIHdpZHRoOiB0aGlzLm8ud2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQ6IGdyYXBoaGVpZ2h0LFxuICAgICAgICB9KVxuICAgIH1cblxuICAgIC8qXG4gICAgdGhpcy5ncmFwaCA9IG5ldyBSaWNrc2hhdy5HcmFwaCh7XG4gICAgICAgIGVsZW1lbnQ6IHRoaXMubm9kZSxcbiAgICAgICAgd2lkdGg6IDYwMCxcbiAgICAgICAgaGVpZ2h0OiA2MDAsXG4gICAgICAgIHJlbmRlcmVyOiAnbGluZScsXG4gICAgICAgIHNlcmllczogbmV3IFJpY2tzaGF3LlNlcmllcyhcbiAgICAgICAgICAgIHRyYWNraW5nLm1hcChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB7bmFtZTogaXRlbS5uYW1lfVxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICB1bmRlZmluZWQsIHtcbiAgICAgICAgICAgICAgICB0aW1lSW50ZXJ2YWw6IDI1MCxcbiAgICAgICAgICAgICAgICBtYXhEYXRhUG9pbnRzOiAxMDAsXG4gICAgICAgICAgICAgICAgdGltZUJhc2U6IG5ldyBEYXRlKCkuZ2V0VGltZSgpIC8gMTAwMFxuICAgICAgICAgICAgfVxuICAgICAgICApXG4gICAgfSlcbiAgICAqL1xufVxuXG5HcmFwaC5wcm90b3R5cGUgPSB7XG4gICAgdXBkYXRlRGF0YTogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgZGF0YSA9IHt9XG4gICAgICAgIHZhciBoZWlnaHQgPSB0aGlzLm8ud29ybGRIZWlnaHRcbiAgICAgICAgdGhpcy5ub2RlLmdldENvbnRleHQoJzJkJykuY2xlYXJSZWN0KDAsIDAsIHRoaXMubm9kZS53aWR0aCwgdGhpcy5ub2RlLmhlaWdodClcbiAgICAgICAgZm9yICh2YXIgbmFtZSBpbiB0aGlzLnRyYWNraW5nKSB7XG4gICAgICAgICAgICB0aGlzLmdyYXBoc1tuYW1lXS5hZGRQb2ludCh0aGlzLmdldERhdHVtKG5hbWUpKVxuICAgICAgICAgICAgdGhpcy5ncmFwaHNbbmFtZV0uZHJhdygpXG4gICAgICAgIH1cbiAgICB9LFxuICAgIGdldERhdHVtOiBmdW5jdGlvbiAobmFtZSkge1xuICAgICAgICB2YXIgaXRlbSA9IHRoaXMudHJhY2tpbmdbbmFtZV1cbiAgICAgICAgaWYgKGl0ZW0uZm4pIHtcbiAgICAgICAgICAgIHJldHVybiBpdGVtLmZuKCk7XG4gICAgICAgIH0gZWxzZSBpZiAoaXRlbS5hdHRyID09PSAncG9zLnknKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vLndvcmxkSGVpZ2h0IC0gaXRlbS5ib2R5LnN0YXRlLnBvcy55XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gZ2V0RGF0dW0oaXRlbSlcbiAgICAgICAgfVxuICAgIH0sXG4gICAgdXBkYXRlOiBmdW5jdGlvbiAodGltZXN0ZXApIHtcbiAgICAgICAgdGhpcy51cGRhdGVEYXRhKClcbiAgICB9XG59XG5cbiIsIlxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgQmFzZTogcmVxdWlyZSgnLi9iYXNlJyksXG4gICAgRGVtbzogcmVxdWlyZSgnLi9kZW1vJyksXG4gICAgTmV3dG9uMTogcmVxdWlyZSgnLi9uZXd0b24xJyksXG4gICAgT3JiaXQ6IHJlcXVpcmUoJy4vb3JiaXQnKSxcbiAgICBNb29uOiByZXF1aXJlKCcuL21vb24nKSxcbiAgICBBc3Rlcm9pZHM6IHJlcXVpcmUoJy4vYXN0ZXJvaWRzJyksXG4gICAgU2xvcGU6IHJlcXVpcmUoJy4vc2xvcGUnKSxcbiAgICBEcm9wOiByZXF1aXJlKCcuL2Ryb3AnKSxcbiAgICBUcnlHcmFwaDogcmVxdWlyZSgnLi90cnktZ3JhcGgnKVxufVxuIiwiXG52YXIgV2Fsa3Rocm91Z2ggPSByZXF1aXJlKCcuL3dhbGstdGhyb3VnaC5qc3gnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChFeGVyY2lzZSwgZ290SHlwb3RoZXNpcykge1xuICAgIHZhciBub2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKG5vZGUpXG4gICAgUmVhY3QucmVuZGVyQ29tcG9uZW50KFdhbGt0aHJvdWdoKHtcbiAgICAgICAgc3RlcHM6IHJlcXVpcmUoJy4vaW50cm8uanN4JyksXG4gICAgICAgIG9uSHlwb3RoZXNpczogZ290SHlwb3RoZXNpcyxcbiAgICAgICAgb25Eb25lOiBmdW5jdGlvbiAoaHlwb3RoZXNpcykge1xuICAgICAgICAgICAgUmVhY3QudW5tb3VudENvbXBvbmVudEF0Tm9kZShub2RlKTtcbiAgICAgICAgICAgIG5vZGUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChub2RlKTtcbiAgICAgICAgfSxcbiAgICAgICAgRXhlcmNpc2U6IEV4ZXJjaXNlXG4gICAgfSksIG5vZGUpXG59XG5cbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xuXG52YXIgUFQgPSBSZWFjdC5Qcm9wVHlwZXNcbnZhciBTdGVwID0gcmVxdWlyZSgnLi9zdGVwLmpzeCcpXG5cbnZhciBERUJVRyA9IGZhbHNlXG5cbnZhciBCdXR0b25Hcm91cCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ0J1dHRvbkdyb3VwJyxcbiAgICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IHRoaXMucHJvcHMuY2xhc3NOYW1lfSwgXG4gICAgICAgICAgICB0aGlzLnByb3BzLm9wdGlvbnMubWFwKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgICAgICAgICAgdmFyIGNscyA9IFwiYnRuIGJ0bi1kZWZhdWx0XCJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5zZWxlY3RlZCA9PT0gaXRlbVswXSkge1xuICAgICAgICAgICAgICAgICAgICBjbHMgKz0gJyBhY3RpdmUnXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBSZWFjdC5ET00uYnV0dG9uKHtrZXk6IGl0ZW1bMF0sIGNsYXNzTmFtZTogY2xzLCBvbkNsaWNrOiB0aGlzLnByb3BzLm9uU2VsZWN0LmJpbmQobnVsbCwgaXRlbVswXSl9LCBpdGVtWzFdKTtcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSlcbiAgICAgICAgKTtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBbXG4gICAgZnVuY3Rpb24gKHByb3BzKSB7XG4gICAgICAgIHJldHVybiBTdGVwKF8uZXh0ZW5kKHByb3BzLCB7XG4gICAgICAgICAgICBpZDogJ2hlbGxvJyxcbiAgICAgICAgICAgIHRpdGxlOiBcIkhpISBJJ20gU2lyIEZyYW5jaXMgQmFjb25cIixcbiAgICAgICAgICAgIHNob3dCYWNvbjogdHJ1ZSxcbiAgICAgICAgICAgIGJvZHk6IFwiSSB3YXMgbWFkZSBhIEtuaWdodCBvZiBFbmdsYW5kIGZvciBkb2luZyBhd2Vzb21lIFNjaWVuY2UuIFdlJ3JlIGdvaW5nIHRvIHVzZSBzY2llbmNlIHRvIGZpZ3VyZSBvdXQgY29vbCB0aGluZ3MgYWJvdXQgdGhlIHdvcmxkLlwiLFxuICAgICAgICAgICAgbmV4dDogXCJMZXQncyBkbyBzY2llbmNlIVwiXG4gICAgICAgIH0pKVxuICAgIH0sXG5cbiAgICBmdW5jdGlvbiAocHJvcHMpIHtcbiAgICAgICAgdmFyIGh5cG90aGVzaXMgPSBwcm9wcy5kYXRhLmh5cG90aGVzaXNcbiAgICAgICAgcmV0dXJuIFN0ZXAoXy5leHRlbmQocHJvcHMsIHtcbiAgICAgICAgICAgIGlkOiAnZGVzY3JpcHRpb24nLFxuICAgICAgICAgICAgdGl0bGU6IFwiRXhwZXJpbWVudCAjMVwiLFxuICAgICAgICAgICAgb25VcGRhdGU6IGZ1bmN0aW9uIChwcmV2UHJvcHMpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5kYXRhLmh5cG90aGVzaXMgJiYgIXByZXZQcm9wcy5kYXRhLmh5cG90aGVzaXMpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvcHMub25IeXBvdGhlc2lzKHByb3BzLmRhdGEuaHlwb3RoZXNpcyk7XG4gICAgICAgICAgICAgICAgICAgIERFQlVHID8gcHJvcHMub25OZXh0KCkgOiBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3BzLm9uTmV4dCgpXG4gICAgICAgICAgICAgICAgICAgIH0sIDUwMClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYm9keTogUmVhY3QuRE9NLmRpdihudWxsLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00ucChudWxsLCBcIldoYXQgZmFsbHMgZmFzdGVyOiBhIHRlbm5pcyBiYWxsIG9yIGEgYm93bGluZyBiYWxsP1wiKSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLnAobnVsbCwgXCJBIFwiLCBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcInVsaW5lXCJ9LCBcIkh5cG90aGVzaXNcIiksIFwiIGlzIHdoYXQgeW91IHRoaW5rIHdpbGwgaGFwcGVuLlwiKSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmhyKG51bGwpLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwibGFyZ2VcIn0sIFwiSSB0aGluazpcIiwgXG4gICAgICAgICAgICAgICAgICAgIEJ1dHRvbkdyb3VwKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogXCJ3YWxrdGhyb3VnaF9oeXBvdGhlc2VzXCIsIFxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWQ6IGh5cG90aGVzaXMsIFxuICAgICAgICAgICAgICAgICAgICAgICAgb25TZWxlY3Q6IHByb3BzLnNldERhdGEuYmluZChudWxsLCAnaHlwb3RoZXNpcycpLCBcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnM6IFtbXCJ0ZW5uaXNcIiwgXCJUaGUgdGVubmlzIGJhbGwgZmFsbHMgZmFzdGVyXCJdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtcImJvd2xpbmdcIiwgXCJUaGUgYm93bGluZyBiYWxsIGZhbGxzIGZhc3RlclwiXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBbXCJzYW1lXCIsIFwiVGhleSBmYWxsIHRoZSBzYW1lXCJdXX0pXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIC8qKmh5cG90aGVzaXMgJiYgPHAgY2xhc3NOYW1lPVwid2Fsa3Rocm91Z2hfZ3JlYXRcIj5HcmVhdCEgTm93IHdlIGRvIHNjaWVuY2U8L3A+KiovXG4gICAgICAgICAgICApXG4gICAgICAgIH0pKVxuICAgIH0sXG5cbiAgICBmdW5jdGlvbiAocHJvcHMpIHtcbiAgICAgICAgdmFyIGZpcnN0QmFsbCA9ICd0ZW5uaXMnXG4gICAgICAgIHZhciBzZWNvbmRCYWxsID0gJ2Jvd2xpbmcnXG4gICAgICAgIHZhciBwcm92ZXIgPSBwcm9wcy5kYXRhLnByb3ZlclxuICAgICAgICB2YXIgaHlwb3RoZXNpcyA9IHByb3BzLmRhdGEuaHlwb3RoZXNpc1xuXG4gICAgICAgIGlmIChwcm9wcy5oeXBvdGhlc2lzID09PSAnYm93bGluZycpIHtcbiAgICAgICAgICAgIGZpcnN0QmFsbCA9ICdib3dsaW5nJ1xuICAgICAgICAgICAgc2Vjb25kQmFsbCA9ICd0ZW5uaXMnXG4gICAgICAgIH1cblxuICAgICAgICB2YXIgcmVzcG9uc2VzID0ge1xuICAgICAgICAgICAgJ3Rlbm5pcyc6ICdOb3BlLiBUaGF0IHdvdWxkIHNob3cgdGhhdCB0aGUgdGVubmlzIGJhbGwgZmFsbHMgZmFzdGVyJyxcbiAgICAgICAgICAgICdib3dsaW5nJzogJ05vcGUuIFRoYXQgd291bGQgc2hvdyB0aGF0IHRoZSBib3dsaW5nIGJhbGwgZmFsbHMgZmFzdGVyJyxcbiAgICAgICAgICAgICdzYW1lJzogJ05vcGUuIFRoYXQgd291bGQgc2hvdyB0aGF0IHRoZXkgZmFsbCB0aGUgc2FtZSdcbiAgICAgICAgfVxuICAgICAgICB2YXIgY29ycmVjdCA9IHtcbiAgICAgICAgICAgICd0ZW5uaXMnOiAnbGVzcycsXG4gICAgICAgICAgICAnYm93bGluZyc6ICdsZXNzJyxcbiAgICAgICAgICAgICdzYW1lJzogJ3NhbWUnXG4gICAgICAgIH1cbiAgICAgICAgdmFyIHByb3ZlclJlc3BvbnNlXG4gICAgICAgIHZhciBpc0NvcnJlY3QgPSBwcm92ZXIgPT09IGNvcnJlY3RbaHlwb3RoZXNpc11cblxuICAgICAgICBpZiAocHJvdmVyKSB7XG4gICAgICAgICAgICBpZiAoaXNDb3JyZWN0KSB7XG4gICAgICAgICAgICAgICAgcHJvdmVyUmVzcG9uc2UgPSBcIkV4YWN0bHkhIE5vdyBsZXQncyBkbyB0aGUgZXhwZXJpbWVudC5cIlxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBwcm92ZXJSZXNwb25zZSA9IHJlc3BvbnNlc1t7XG4gICAgICAgICAgICAgICAgICAgIHRlbm5pczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgbW9yZTogJ2Jvd2xpbmcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2FtZTogJ3NhbWUnXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGJvd2xpbmc6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vcmU6ICd0ZW5uaXMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2FtZTogJ3NhbWUnXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHNhbWU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vcmU6ICdib3dsaW5nJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxlc3M6ICd0ZW5uaXMnXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9W2h5cG90aGVzaXNdW3Byb3Zlcl1dO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGZ1dHVyZUh5cG90aGVzaXMgPSB7XG4gICAgICAgICAgICB0ZW5uaXM6ICd0aGUgdGVubmlzIGJhbGwgd2lsbCBmYWxsIGZhc3RlciB0aGFuIHRoZSBib3dsaW5nIGJhbGwnLFxuICAgICAgICAgICAgYm93bGluZzogJ3RoZSBib3dsaW5nIGJhbGwgd2lsbCBmYWxsIGZhc3RlciB0aGFuIHRoZSB0ZW5uaXMgYmFsbCcsXG4gICAgICAgICAgICBzYW1lOiAndGhlIHRlbm5pcyBiYWxsIGFuZCB0aGUgYm93bGluZyBiYWxsIHdpbGwgZmFsbCB0aGUgc2FtZSdcbiAgICAgICAgfVtoeXBvdGhlc2lzXTtcblxuICAgICAgICB2YXIgY3VycmVudEh5cG90aGVzaXMgPSB7XG4gICAgICAgICAgICB0ZW5uaXM6ICdhIHRlbm5pcyBiYWxsIGZhbGxzIGZhc3RlciB0aGFuIGEgYm93bGluZyBiYWxsJyxcbiAgICAgICAgICAgIGJvd2xpbmc6ICdhIGJvd2xpbmcgYmFsbCBmYWxscyBmYXN0ZXIgdGhhbiBhIHRlbm5pcyBiYWxsJyxcbiAgICAgICAgICAgIHNhbWU6ICdhIHRlbm5pcyBiYWxsIGZhbGxzIHRoZSBzYW1lIGFzIGEgYm93bGluZyBiYWxsJ1xuICAgICAgICB9W2h5cG90aGVzaXNdO1xuXG4gICAgICAgIHJldHVybiBTdGVwKF8uZXh0ZW5kKHByb3BzLCB7XG4gICAgICAgICAgICBpZDogJ2Rlc2lnbi1leHBlcmltZW50JyxcbiAgICAgICAgICAgIHRpdGxlOiAnRGVzaWduaW5nIHRoZSBFeHBlcmltZW50JyxcbiAgICAgICAgICAgIG9uVXBkYXRlOiBmdW5jdGlvbiAocHJldlByb3BzKSB7XG4gICAgICAgICAgICAgICAgaWYgKHByb3ZlciAmJiBpc0NvcnJlY3QgJiYgcHJvdmVyICE9PSBwcmV2UHJvcHMuZGF0YS5wcm92ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9wcy5vbk5leHQoKVxuICAgICAgICAgICAgICAgICAgICB9LCAyMDAwKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYm9keTogUmVhY3QuRE9NLmRpdihudWxsLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00ucChudWxsLCBcIk5vdyB3ZSBuZWVkIHRvIGRlc2lnbiBhbiBleHBlcmltZW50IHRvIHRlc3QgeW91clwiICsgJyAnICtcbiAgICAgICAgICAgICAgICBcImh5cG90aGVzaXMhIEl0J3MgaW1wb3J0YW50IHRvIGJlIGNhcmVmdWwgd2hlbiBkZXNpZ25pbmcgYW5cIiArICcgJyArXG4gICAgICAgICAgICAgICAgXCJleHBlcmltZW50LCBiZWNhdXNlIG90aGVyd2lzZSB5b3UgY291bGQgZW5kIHVwIFxcXCJwcm92aW5nXFxcIlwiICsgJyAnICtcbiAgICAgICAgICAgICAgICBcInNvbWV0aGluZyB0aGF0J3MgYWN0dWFsbHkgZmFsc2UuXCIpLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00ucChudWxsLCBcIlRvIHByb3ZlIHRoYXQgXCIsIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwidWxpbmVcIn0sIGN1cnJlbnRIeXBvdGhlc2lzKSwgXCIsIHdlIGNhbiBtZWFzdXJlIHRoZSB0aW1lIHRoYXQgaXRcIiArICcgJyArXG4gICAgICAgICAgICAgICAgXCJ0YWtlcyBmb3IgZWFjaCBiYWxsIHRvIGZhbGwgd2hlbiBkcm9wcGVkIGZyb20gYSBzcGVjaWZpY1wiICsgJyAnICtcbiAgICAgICAgICAgICAgICBcImhlaWdodC5cIiksIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5wKG51bGwsIFwiWW91ciBoeXBvdGhlc2lzIHdpbGwgYmUgcHJvdmVuIGlmIHRoZSBcIiwgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJ1bGluZVwifSwgXCJ0aW1lIGZvciB0aGUgXCIsIGZpcnN0QmFsbCwgXCIgYmFsbFwiKSwgXCIgaXNcIiwgXG4gICAgICAgICAgICAgICAgICAgIEJ1dHRvbkdyb3VwKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogXCJidG4tZ3JvdXBcIiwgXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZDogcHJvdmVyLCBcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uU2VsZWN0OiBwcm9wcy5zZXREYXRhLmJpbmQobnVsbCwgJ3Byb3ZlcicpLCBcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnM6IFtbJ2xlc3MnLCAnbGVzcyB0aGFuJ10sIFsnbW9yZScsICdtb3JlIHRoYW4nXSwgWydzYW1lJywgJ3RoZSBzYW1lIGFzJ11dfSksIFxuICAgICAgICAgICAgICAgICAgICBcInRoZSBcIiwgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJ1bGluZVwifSwgXCJ0aW1lIGZvciB0aGUgXCIsIHNlY29uZEJhbGwsIFwiIGJhbGxcIiksIFwiLlwiXG4gICAgICAgICAgICAgICAgKSwgXG4gICAgICAgICAgICAgICAgcHJvdmVyICYmIFJlYWN0LkRPTS5wKHtjbGFzc05hbWU6IFwiZGVzaWduX3Jlc3BvbnNlXCJ9LCBwcm92ZXJSZXNwb25zZSlcbiAgICAgICAgICAgIClcbiAgICAgICAgfSkpXG4gICAgfSxcblxuICAgIGZ1bmN0aW9uIChwcm9wcykge1xuICAgICAgICByZXR1cm4gU3RlcChfLmV4dGVuZChwcm9wcywge1xuICAgICAgICAgICAgaWQ6ICdleHBlcmltZW50JyxcbiAgICAgICAgICAgIHN0eWxlOiAnYmxhY2snLFxuICAgICAgICAgICAgdGl0bGU6ICdUaGUgZXhwZXJpbWVudCcsXG4gICAgICAgICAgICBwb3M6IHtcbiAgICAgICAgICAgICAgICBsZWZ0OiAzNzUsXG4gICAgICAgICAgICAgICAgdG9wOiAyMDBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBib2R5OiBSZWFjdC5ET00ucChudWxsLCBcIkhlcmUgd2UgaGF2ZSB0b29scyB0byBjb25kdWN0IG91ciBleHBlcmltZW50LiBZb3UgY2FuIHNlZVwiICsgJyAnICtcbiAgICAgICAgICAgIFwic29tZSBib3dsaW5nIGJhbGxzIGFuZCB0ZW5uaXMgYmFsbHMsIGFuZCB0aG9zZSByZWQgYW5kIGdyZWVuXCIgKyAnICcgK1xuICAgICAgICAgICAgXCJzZW5zb3JzIHdpbGwgcmVjb3JkIHRoZSB0aW1lIGl0IHRha2VzIGZvciBhIGJhbGwgdG8gZmFsbC5cIiksXG4gICAgICAgICAgICBvblJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHByb3BzLkV4ZXJjaXNlLmRlcGxveUJhbGxzKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgREVCVUcgPyBwcm9wcy5vbk5leHQoKSA6IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvcHMub25OZXh0KClcbiAgICAgICAgICAgICAgICAgICAgfSwgMjAwMCk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkpXG4gICAgfSxcblxuICAgIGZ1bmN0aW9uIChwcm9wcykge1xuICAgICAgICByZXR1cm4gU3RlcChfLmV4dGVuZChwcm9wcywge1xuICAgICAgICAgICAgaWQ6ICdkcm9wJyxcbiAgICAgICAgICAgIHN0eWxlOiAnYmxhY2snLFxuICAgICAgICAgICAgcG9zOiB7XG4gICAgICAgICAgICAgICAgdG9wOiAyMDAsXG4gICAgICAgICAgICAgICAgbGVmdDogMjAwXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYm9keTogUmVhY3QuRE9NLnAobnVsbCwgXCJJZiB3ZSBkcm9wIGEgYmFsbCBoZXJlIGFib3ZlIHRoZSBncmVlbiBzZW5zb3IsIHdlIGNhblwiICsgJyAnICtcbiAgICAgICAgICAgICAgICBcInRpbWUgaG93IGxvbmcgaXQgdGFrZXMgZm9yIGl0IHRvIGZhbGwgdG8gdGhlIHJlZCBzZW5zb3IuXCIpLFxuICAgICAgICAgICAgb25SZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBwcm9wcy5FeGVyY2lzZS5kZW1vbnN0cmF0ZURyb3AoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBwcm9wcy5vbk5leHQoKVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pKVxuICAgIH0sXG5cbiAgICBmdW5jdGlvbiAocHJvcHMpIHtcbiAgICAgICAgcmV0dXJuIFN0ZXAoXy5leHRlbmQocHJvcHMsIHtcbiAgICAgICAgICAgIGlkOiAnbG9nYm9vaycsXG4gICAgICAgICAgICBzdHlsZTogJ2JsYWNrJyxcbiAgICAgICAgICAgIHBvczoge1xuICAgICAgICAgICAgICAgIHRvcDogMTAwLFxuICAgICAgICAgICAgICAgIGxlZnQ6IDUwMFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGFycm93OiBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwiYXJyb3ctdG8tbG9nYm9va1wifSksXG4gICAgICAgICAgICBib2R5OiBSZWFjdC5ET00ucChudWxsLCBcIlRoZSB0aW1lIGlzIHRoZW4gcmVjb3JkZWQgb3ZlciBoZXJlIGluIHlvdXIgbG9nIGJvb2suIEZpbGwgdXAgdGhpcyBsb2cgYm9vayB3aXRoIHRpbWVzIGZvciBib3RoIGJhbGxzIGFuZCBjb21wYXJlIHRoZW0uXCIpLFxuICAgICAgICAgICAgb25SZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvcHMub25OZXh0KCk7XG4gICAgICAgICAgICAgICAgfSwgREVCVUcgPyAxMDAgOiA1MDAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkpO1xuICAgIH0sXG5cbiAgICBmdW5jdGlvbiAocHJvcHMpIHtcbiAgICAgICAgcmV0dXJuIFN0ZXAoXy5leHRlbmQocHJvcHMsIHtcbiAgICAgICAgICAgIGlkOiAnYW5zd2VyJyxcbiAgICAgICAgICAgIHN0eWxlOiAnYmxhY2snLFxuICAgICAgICAgICAgcG9zOiB7XG4gICAgICAgICAgICAgICAgdG9wOiAxNTAsXG4gICAgICAgICAgICAgICAgbGVmdDogMjUwXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYXJyb3c6IFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJhcnJvdy10by1hbnN3ZXJcIn0pLFxuICAgICAgICAgICAgc2hvd0JhY29uOiB0cnVlLFxuICAgICAgICAgICAgdGl0bGU6IFwiTm93IGNvbmR1Y3QgdGhlIGV4cGVyaW1lbnQgdG8gdGVzdCB5b3VyIGh5cG90aGVzaXMhXCIsXG4gICAgICAgICAgICBib2R5OiBSZWFjdC5ET00ucChudWxsLCBcIk9uY2UgeW91J3ZlIGNvbGxlY3RlZCBlbm91Z2ggZGF0YSBpbiB5b3VyIGxvZyBib29rLFwiICsgJyAnICtcbiAgICAgICAgICAgIFwiZGVjaWRlIHdoZXRoZXIgdGhlIGRhdGEgXCIsIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwidWxpbmVcIn0sIFwic3VwcG9ydFwiKSwgXCIgb3JcIiwgXG4gICAgICAgICAgICAnICcsIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwidWxpbmVcIn0sIFwiZGlzcHJvdmVcIiksIFwiIHlvdXIgaHlwb3RoZXNpcy4gVGhlblwiICsgJyAnICtcbiAgICAgICAgICAgIFwiSSB3aWxsIGV2YWx1YXRlIHlvdXIgZXhwZXJpbWVudCBhbmQgZ2l2ZSB5b3UgZmVlZGJhY2suXCIpLFxuICAgICAgICAgICAgbmV4dDogXCJPaywgSSdtIHJlYWR5XCIsXG4gICAgICAgIH0pKVxuICAgIH0sXG5dXG5cbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xuXG52YXIgUFQgPSBSZWFjdC5Qcm9wVHlwZXNcbnZhciBjeCA9IFJlYWN0LmFkZG9ucy5jbGFzc1NldFxuXG52YXIgU3RlcCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ1N0ZXAnLFxuICAgIHByb3BUeXBlczoge1xuICAgICAgICB0aXRsZTogUFQuc3RyaW5nLFxuICAgICAgICBuZXh0OiBQVC5zdHJpbmcsXG4gICAgICAgIG9uUmVuZGVyOiBQVC5mdW5jLFxuICAgICAgICBvbkZhZGVkT3V0OiBQVC5mdW5jLFxuICAgICAgICBzaG93QmFjb246IFBULmJvb2wsXG4gICAgICAgIGZhZGVPdXQ6IFBULmJvb2wsXG4gICAgfSxcblxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc3R5bGU6ICd3aGl0ZSdcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5vblJlbmRlcikge1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5vblJlbmRlcigpXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5nZXRET01Ob2RlKCkuYWRkRXZlbnRMaXN0ZW5lcigndHJhbnNpdGlvbmVuZCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLmZhZGVPdXQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm9uRmFkZWRPdXQoKVxuICAgICAgICAgICAgfVxuICAgICAgICB9LmJpbmQodGhpcykpXG4gICAgfSxcblxuICAgIGNvbXBvbmVudERpZFVwZGF0ZTogZnVuY3Rpb24gKHByZXZQcm9wcykge1xuICAgICAgICBpZiAocHJldlByb3BzLmlkICE9PSB0aGlzLnByb3BzLmlkICYmXG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uUmVuZGVyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5vblJlbmRlcigpXG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMucHJvcHMub25VcGRhdGUpIHtcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25VcGRhdGUuY2FsbCh0aGlzLCBwcmV2UHJvcHMpXG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBzdHlsZVxuICAgICAgICBpZiAodGhpcy5wcm9wcy5wb3MpIHtcbiAgICAgICAgICAgIHN0eWxlID0ge1xuICAgICAgICAgICAgICAgIG1hcmdpblRvcDogMCxcbiAgICAgICAgICAgICAgICBtYXJnaW5MZWZ0OiAwLFxuICAgICAgICAgICAgICAgIHRvcDogdGhpcy5wcm9wcy5wb3MudG9wICsgJ3B4JyxcbiAgICAgICAgICAgICAgICBsZWZ0OiB0aGlzLnByb3BzLnBvcy5sZWZ0ICsgJ3B4J1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IGN4KHtcbiAgICAgICAgICAgIFwid2Fsa3Rocm91Z2hcIjogdHJ1ZSxcbiAgICAgICAgICAgIFwid2Fsa3Rocm91Z2gtLXdoaXRlXCI6IHRoaXMucHJvcHMuc3R5bGUgPT09ICd3aGl0ZScsXG4gICAgICAgICAgICBcIndhbGt0aHJvdWdoLS1ibGFja1wiOiB0aGlzLnByb3BzLnN0eWxlID09PSAnYmxhY2snXG4gICAgICAgIH0pfSwgXG4gICAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IGN4KHtcbiAgICAgICAgICAgICAgICBcIndhbGt0aHJvdWdoX3N0ZXBcIjogdHJ1ZSxcbiAgICAgICAgICAgICAgICBcIndhbGt0aHJvdWdoX3N0ZXAtLWZhZGUtb3V0XCI6IHRoaXMucHJvcHMuZmFkZU91dFxuICAgICAgICAgICAgfSkgKyBcIiB3YWxrdGhyb3VnaF9zdGVwLS1cIiArIHRoaXMucHJvcHMuaWQsIHN0eWxlOiBzdHlsZX0sIFxuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMuc2hvd0JhY29uICYmIFJlYWN0LkRPTS5pbWcoe2NsYXNzTmFtZTogXCJ3YWxrdGhyb3VnaF9zaXItZnJhbmNpc1wiLCBzcmM6IFwiL2ltYWdlcy9zaXItZnJhbmNpcy10cmFuc3BhcmVudDIuZ2lmXCJ9KSwgXG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy50aXRsZSAmJlxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwid2Fsa3Rocm91Z2hfdGl0bGVcIn0sIHRoaXMucHJvcHMudGl0bGUpLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwid2Fsa3Rocm91Z2hfYm9keVwifSwgXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMuYm9keVxuICAgICAgICAgICAgICAgICksIFxuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMuYXJyb3cgfHwgZmFsc2UsIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJ3YWxrdGhyb3VnaF9idXR0b25zXCJ9LCBcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5uZXh0ICYmXG4gICAgICAgICAgICAgICAgICAgICAgICBSZWFjdC5ET00uYnV0dG9uKHtvbkNsaWNrOiB0aGlzLnByb3BzLm9uTmV4dCwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiBcIndhbGt0aHJvdWdoX25leHQgYnRuIGJ0bi1kZWZhdWx0XCJ9LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm5leHRcbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApXG4gICAgICAgIClcbiAgICB9XG59KVxuXG5tb2R1bGUuZXhwb3J0cyA9IFN0ZXBcbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xuXG52YXIgV2Fsa1Rocm91Z2ggPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdXYWxrVGhyb3VnaCcsXG4gICAgcHJvcFR5cGVzOiB7XG4gICAgICAgIHN0ZXBzOiBSZWFjdC5Qcm9wVHlwZXMuYXJyYXkuaXNSZXF1aXJlZCxcbiAgICAgICAgb25Eb25lOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYyxcbiAgICB9LFxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc3RlcDogMCxcbiAgICAgICAgICAgIGRhdGE6IHt9LFxuICAgICAgICAgICAgZmFkaW5nOiBmYWxzZVxuICAgICAgICB9XG4gICAgfSxcbiAgICBvbkZhZGVkT3V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmZhZGluZyA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIHRoaXMuZ29Ubyh0aGlzLnN0YXRlLmZhZGluZylcbiAgICB9LFxuICAgIGdvVG86IGZ1bmN0aW9uIChudW0pIHtcbiAgICAgICAgaWYgKG51bSA+PSB0aGlzLnByb3BzLnN0ZXBzLmxlbmd0aCkge1xuICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMub25Eb25lKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkRvbmUoKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7c3RlcDogbnVtLCBmYWRpbmc6IGZhbHNlfSlcbiAgICB9LFxuICAgIHN0YXJ0R29pbmc6IGZ1bmN0aW9uIChudW0pIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7ZmFkaW5nOiBudW19KVxuICAgIH0sXG4gICAgc2V0RGF0YTogZnVuY3Rpb24gKGF0dHIsIHZhbCkge1xuICAgICAgICB2YXIgZGF0YSA9IF8uZXh0ZW5kKHt9LCB0aGlzLnN0YXRlLmRhdGEpXG4gICAgICAgIGRhdGFbYXR0cl0gPSB2YWxcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7ZGF0YTogZGF0YX0pXG4gICAgfSxcbiAgICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIFN0ZXAgPSB0aGlzLnByb3BzLnN0ZXBzW3RoaXMuc3RhdGUuc3RlcF1cbiAgICAgICAgdmFyIHByb3BzID0ge1xuICAgICAgICAgICAgb25OZXh0OiB0aGlzLnN0YXJ0R29pbmcuYmluZChudWxsLCB0aGlzLnN0YXRlLnN0ZXAgKyAxKSxcbiAgICAgICAgICAgIHNldERhdGE6IHRoaXMuc2V0RGF0YSxcbiAgICAgICAgICAgIGRhdGE6IHRoaXMuc3RhdGUuZGF0YSxcbiAgICAgICAgICAgIGZhZGVPdXQ6IHRoaXMuc3RhdGUuZmFkaW5nICE9PSBmYWxzZSxcbiAgICAgICAgICAgIG9uRmFkZWRPdXQ6IHRoaXMub25GYWRlZE91dFxuICAgICAgICB9XG4gICAgICAgIGZvciAodmFyIG5hbWUgaW4gdGhpcy5wcm9wcykge1xuICAgICAgICAgICAgcHJvcHNbbmFtZV0gPSB0aGlzLnByb3BzW25hbWVdXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFN0ZXAocHJvcHMpXG4gICAgfVxufSlcblxubW9kdWxlLmV4cG9ydHMgPSBXYWxrVGhyb3VnaFxuXG4iLCJcbnZhciB1dGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gTG9nQm9vaztcblxuZnVuY3Rpb24gTG9nQm9vayh3b3JsZCwgc3RhcnRHYXRlLCBlbmRHYXRlLCBlbGVtLCBrZWVwLCBzZWVkZWRDb2x1bW5zKSB7XG4gICAgdGhpcy5fYXR0YWNoKHdvcmxkLCBzdGFydEdhdGUsIGVuZEdhdGUsIGVsZW0sIGtlZXAsIHNlZWRlZENvbHVtbnMpO1xufVxuXG5Mb2dCb29rLnByb3RvdHlwZS5fYXR0YWNoID0gZnVuY3Rpb24gKHdvcmxkLCBzdGFydEdhdGUsIGVuZEdhdGUsIGVsZW0sIGtlZXAsIHNlZWRlZENvbHVtbnMpIHtcbiAgICBjb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIGNvbnRhaW5lci5jbGFzc05hbWUgPSBcImxvZy1ib29rXCI7XG4gICAgZWxlbS5hcHBlbmRDaGlsZChjb250YWluZXIpO1xuICAgIGhlYWRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpO1xuICAgIGhlYWRlci5jbGFzc05hbWUgPSBcImxvZy1ib29rLWhlYWRlclwiO1xuICAgIGhlYWRlci5pbm5lckhUTUwgPSBcIkxvZyBCb29rXCI7XG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGhlYWRlcik7XG4gICAgYm9keUNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgYm9keUNvbnRhaW5lci5jbGFzc05hbWUgPSBcImxvZy1ib29rLWJvZHlcIjtcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoYm9keUNvbnRhaW5lcik7XG4gICAgdGhpcy5ib2R5Q29udGFpbmVyID0gYm9keUNvbnRhaW5lcjtcblxuICAgIHRoaXMuY29sdW1uc0J5Qm9keU5hbWUgPSB7fTtcbiAgICB0aGlzLmxhc3RVaWRzID0ge307XG4gICAgdGhpcy5zdGFydFRpbWVCeUJvZHlOYW1lID0ge307XG4gICAgdGhpcy5kYXRhID0ge307XG4gICAgdGhpcy5rZWVwID0ga2VlcDtcbiAgICB0aGlzLndvcmxkID0gd29ybGQ7XG4gICAgc3RhcnRHYXRlLm9uKCdlbnRlcicsIHRoaXMuaGFuZGxlU3RhcnQuYmluZCh0aGlzKSk7XG4gICAgZW5kR2F0ZS5vbignZW50ZXInLCB0aGlzLmhhbmRsZUVuZC5iaW5kKHRoaXMpKTtcbiAgICB3b3JsZC5vbignc3RlcCcsIHRoaXMuaGFuZGxlVGljay5iaW5kKHRoaXMpKTtcblxuICAgIGlmIChzZWVkZWRDb2x1bW5zKSB7XG4gICAgICAgIF8uZWFjaChzZWVkZWRDb2x1bW5zLCBmdW5jdGlvbiAoY29sKSB7XG4gICAgICAgICAgICB0aGlzLmFkZENvbHVtbihjb2wubmFtZSwgY29sLmV4dHJhVGV4dCwgY29sLmNvbG9yKTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5rZWVwOyBpKyspIHtcbiAgICAgICAgICAgICAgICB0aGlzLm5ld1RpbWVyKGNvbC5uYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9XG59XG5cbkxvZ0Jvb2sucHJvdG90eXBlLmhhbmRsZVN0YXJ0ID0gZnVuY3Rpb24gKGRhdGEpIHtcbiAgICBpZiAoIXRoaXMuc3RhcnRUaW1lQnlCb2R5TmFtZVtnZXROYW1lKGRhdGEuYm9keSldKSB0aGlzLm5ld1RpbWVyKGdldE5hbWUoZGF0YS5ib2R5KSk7XG4gICAgdGhpcy5sYXN0VWlkc1tnZXROYW1lKGRhdGEuYm9keSldID0gZGF0YS5ib2R5LnVpZDtcbiAgICB0aGlzLnN0YXJ0VGltZUJ5Qm9keU5hbWVbZ2V0TmFtZShkYXRhLmJvZHkpXSA9IHRoaXMud29ybGQuX3RpbWU7XG4gICAgdGhpcy5yZW5kZXJUaW1lcihnZXROYW1lKGRhdGEuYm9keSksIDApO1xufVxuXG5Mb2dCb29rLnByb3RvdHlwZS5oYW5kbGVFbmQgPSBmdW5jdGlvbiAoZGF0YSkge1xuICAgIGlmIChnZXROYW1lKGRhdGEuYm9keSkgaW4gdGhpcy5kYXRhICYmIHRoaXMubGFzdFVpZHNbZ2V0TmFtZShkYXRhLmJvZHkpXSA9PSBkYXRhLmJvZHkudWlkKSB7XG4gICAgICAgIHRoaXMuZGF0YVtnZXROYW1lKGRhdGEuYm9keSldLnB1c2goXG4gICAgICAgICAgICB0aGlzLndvcmxkLl90aW1lIC0gdGhpcy5zdGFydFRpbWVCeUJvZHlOYW1lW2dldE5hbWUoZGF0YS5ib2R5KV0pO1xuICAgICAgICBkZWxldGUgdGhpcy5zdGFydFRpbWVCeUJvZHlOYW1lW2dldE5hbWUoZGF0YS5ib2R5KV07XG4gICAgICAgIGRlbGV0ZSB0aGlzLmxhc3RVaWRzW2dldE5hbWUoZGF0YS5ib2R5KV07XG4gICAgICAgIHZhciBuYW1lID0gZ2V0TmFtZShkYXRhLmJvZHkpXG4gICAgICAgIHZhciBhdmcgPSBjbGVhbih1dGlsLmF2Zyh0aGlzLmRhdGFbbmFtZV0pKTtcbiAgICAgICAgJCh0aGlzLmNvbHVtbnNCeUJvZHlOYW1lW25hbWVdKS5maW5kKCcubG9nLWJvb2stYXZnJykudGV4dCgnQXZnOiAnICsgYXZnKTtcbiAgICB9XG59XG5cbkxvZ0Jvb2sucHJvdG90eXBlLmhhbmRsZVRpY2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgbmV3VGltZSA9IHRoaXMud29ybGQuX3RpbWU7XG4gICAgJC5lYWNoKHRoaXMuc3RhcnRUaW1lQnlCb2R5TmFtZSwgZnVuY3Rpb24gKG5hbWUsIHN0YXJ0VGltZSkge1xuICAgICAgICB0aGlzLnJlbmRlclRpbWVyKG5hbWUsIG5ld1RpbWUgLSBzdGFydFRpbWUpO1xuICAgIH0uYmluZCh0aGlzKSk7XG59XG5cbkxvZ0Jvb2sucHJvdG90eXBlLmFkZENvbHVtbiA9IGZ1bmN0aW9uIChuYW1lLCBleHRyYVRleHQsIGNvbG9yKSB7XG4gICAgdmFyIGNvbHVtbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgY29sdW1uLmNsYXNzTmFtZSA9IFwibG9nLWJvb2stY29sdW1uXCI7XG4gICAgdmFyIGhlYWRpbmcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKTtcbiAgICBoZWFkaW5nLmNsYXNzTmFtZSA9IFwibG9nLWJvb2staGVhZGluZ1wiO1xuICAgIGhlYWRpbmcuaW5uZXJIVE1MID0gbmFtZSArIGV4dHJhVGV4dDtcbiAgICAvKiogRGlzYWJsaW5nIHVudGlsIHdlIGZpbmQgc29tZXRoaW5nIHRoYXQgbG9va3MgZ3JlYXRcbiAgICBpZiAoY29sb3IpIHtcbiAgICAgICAgaGVhZGluZy5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBjb2xvcjtcbiAgICB9XG4gICAgKi9cbiAgICBjb2x1bW4uYXBwZW5kQ2hpbGQoaGVhZGluZyk7XG4gICAgdmFyIGF2ZXJhZ2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIGF2ZXJhZ2UuY2xhc3NOYW1lID0gJ2xvZy1ib29rLWF2Zyc7XG4gICAgYXZlcmFnZS5pbm5lckhUTUwgPSAnLS0nO1xuICAgIGNvbHVtbi5hcHBlbmRDaGlsZChhdmVyYWdlKTtcbiAgICB0aGlzLmJvZHlDb250YWluZXIuYXBwZW5kQ2hpbGQoY29sdW1uKTtcbiAgICB0aGlzLmNvbHVtbnNCeUJvZHlOYW1lW25hbWVdID0gY29sdW1uO1xuICAgIHRoaXMuZGF0YVtuYW1lXSA9IFtdO1xufVxuXG5Mb2dCb29rLnByb3RvdHlwZS5uZXdUaW1lciA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgLy8ganVzdCBkb2VzIHRoZSBET00gc2V0dXAsIGRvZXNuJ3QgYWN0dWFsbHkgc3RhcnQgdGhlIHRpbWVyXG4gICAgaWYgKCF0aGlzLmNvbHVtbnNCeUJvZHlOYW1lW25hbWVdKSB0aGlzLmFkZENvbHVtbihuYW1lKTtcbiAgICB2YXIgY29sID0gdGhpcy5jb2x1bW5zQnlCb2R5TmFtZVtuYW1lXTtcbiAgICB2YXIgdG9SZW1vdmUgPSAkKGNvbCkuZmluZChcIi5sb2ctYm9vay1kYXR1bVwiKS5zbGljZSgwLC10aGlzLmtlZXArMSk7XG4gICAgdG9SZW1vdmUuc2xpZGVVcCg1MDAsIGZ1bmN0aW9uICgpIHt0b1JlbW92ZS5yZW1vdmUoKTt9KTtcbiAgICB0aGlzLmRhdGFbbmFtZV0gPSB0aGlzLmRhdGFbbmFtZV0uc2xpY2UoLXRoaXMua2VlcCsxKTtcbiAgICBkYXR1bSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpO1xuICAgIGRhdHVtLmNsYXNzTmFtZSA9IFwibG9nLWJvb2stZGF0dW1cIjtcblxuICAgIHZhciBhdmcgPSBjbGVhbih1dGlsLmF2Zyh0aGlzLmRhdGFbbmFtZV0pKTtcbiAgICAkKGNvbCkuZmluZCgnLmxvZy1ib29rLWF2ZycpLnRleHQoJ0F2ZzogJyArIGF2Zyk7XG5cbiAgICBjb2wuYXBwZW5kQ2hpbGQoZGF0dW0pO1xuICAgIHRoaXMucmVuZGVyVGltZXIobmFtZSk7XG59XG5cbmZ1bmN0aW9uIGNsZWFuKHRpbWUpIHtcbiAgICByZXR1cm4gcGFyc2VGbG9hdCh0aW1lIC8gMTAwMCkudG9GaXhlZCgyKSArICdzJztcbn1cblxuTG9nQm9vay5wcm90b3R5cGUucmVuZGVyVGltZXIgPSBmdW5jdGlvbiAobmFtZSwgdGltZSkge1xuICAgIHZhciBkYXR1bSA9IHRoaXMuY29sdW1uc0J5Qm9keU5hbWVbbmFtZV0ubGFzdENoaWxkO1xuICAgIGlmICh0aW1lKSB7XG4gICAgICAgIGRhdHVtLmlubmVySFRNTCA9IGNsZWFuKHRpbWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGRhdHVtLmlubmVySFRNTCA9IFwiLS1cIjtcbiAgICAgICAgZGF0dW0uc3R5bGUudGV4dEFsaWduID0gXCJjZW50ZXJcIjtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGdldE5hbWUoYm9keSkge1xuICAgIHJldHVybiBib2R5LmRpc3BsYXlOYW1lIHx8IGJvZHkubmFtZSB8fCBcImJvZHlcIjtcbn1cblxuIiwidmFyIEdhdGUgPSByZXF1aXJlKCcuL2dhdGUnKTtcbnZhciBHcmFwaCA9IHJlcXVpcmUoJy4vZ3JhcGgnKTtcbnZhciBCYXNlID0gcmVxdWlyZSgnLi9iYXNlJyk7XG52YXIgU3RvcHdhdGNoID0gcmVxdWlyZSgnLi9zdG9wd2F0Y2gnKTtcbnZhciBQbGF5UGF1c2UgPSByZXF1aXJlKCcuL3BsYXlwYXVzZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2UuZXh0ZW5kKGZ1bmN0aW9uIE9yYml0KGNvbnRhaW5lciwgb3B0aW9ucykge1xuICAgIEJhc2UuY2FsbCh0aGlzLCBjb250YWluZXIsIG9wdGlvbnMsIFwiaW1hZ2VzL3NwYWNlX2JhY2tncm91bmQuanBnXCIpXG59LCB7XG4gICAgc2V0dXA6IGZ1bmN0aW9uIChjb250YWluZXIpIHtcbiAgICAgICAgdmFyIHdvcmxkID0gdGhpcy53b3JsZDtcbiAgICAgICAgdmFyIGQgPSA0LjA7XG4gICAgICAgIHZhciB2ID0gMC4zNjtcbiAgICAgICAgdmFyIGNpcmNsZTEgPSBQaHlzaWNzLmJvZHkoJ2NpcmNsZScsIHtcbiAgICAgICAgICAgIHg6IHRoaXMub3B0aW9ucy53aWR0aCAvIDIgLSBkLzJcbiAgICAgICAgICAgICx5OiAyMDBcbiAgICAgICAgICAgICx2eDogdlxuICAgICAgICAgICAgLHJhZGl1czogMlxuICAgICAgICAgICAgLG1hc3M6IDFcbiAgICAgICAgICAgICxyZXN0aXR1dGlvbjogMFxuICAgICAgICAgICAgLHN0eWxlczoge1xuICAgICAgICAgICAgICAgIGZpbGxTdHlsZTogJyNlZWRkMjInXG4gICAgICAgICAgICAgICAgLGFuZ2xlSW5kaWNhdG9yOiAnIzE1NTQ3OSdcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHZhciBjaXJjbGUyID0gUGh5c2ljcy5ib2R5KCdjaXJjbGUnLCB7XG4gICAgICAgICAgICB4OiB0aGlzLm9wdGlvbnMud2lkdGggLyAyICsgZC8yXG4gICAgICAgICAgICAseTogMjAwXG4gICAgICAgICAgICAsdng6IHZcbiAgICAgICAgICAgICxyYWRpdXM6IDJcbiAgICAgICAgICAgICxtYXNzOiAxXG4gICAgICAgICAgICAscmVzdGl0dXRpb246IDBcbiAgICAgICAgICAgICxzdHlsZXM6IHtcbiAgICAgICAgICAgICAgICBmaWxsU3R5bGU6ICcjZWVkZDIyJ1xuICAgICAgICAgICAgICAgICxhbmdsZUluZGljYXRvcjogJyMxNTU0NzknXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBiaWcgPSBQaHlzaWNzLmJvZHkoJ2NpcmNsZScsIHtcbiAgICAgICAgICAgIHg6IHRoaXMub3B0aW9ucy53aWR0aCAvIDJcbiAgICAgICAgICAgICx5OiAzMDBcbiAgICAgICAgICAgICx2eDogLTIgKiB2LzI1XG4gICAgICAgICAgICAscmFkaXVzOiAxMFxuICAgICAgICAgICAgLG1hc3M6IDI1XG4gICAgICAgICAgICAscmVzdGl0dXRpb246IDBcbiAgICAgICAgICAgICxzdHlsZXM6IHtcbiAgICAgICAgICAgICAgICBmaWxsU3R5bGU6ICcjZWVkZDIyJ1xuICAgICAgICAgICAgICAgICxhbmdsZUluZGljYXRvcjogJyMxNTU0NzknXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICB2YXIgY29uc3RyYWludHMgPSBQaHlzaWNzLmJlaGF2aW9yKCd2ZXJsZXQtY29uc3RyYWludHMnKTtcbiAgICAgICAgY29uc3RyYWludHMuZGlzdGFuY2VDb25zdHJhaW50KGNpcmNsZTEsIGNpcmNsZTIsIDEpO1xuICAgICAgICB3b3JsZC5hZGQoW2NpcmNsZTEsIGNpcmNsZTIsIGJpZywgY29uc3RyYWludHNdKTtcbiAgICAgICAgd29ybGQuYWRkKFBoeXNpY3MuYmVoYXZpb3IoJ25ld3RvbmlhbicsIHsgc3RyZW5ndGg6IC41IH0pKTtcblxuICAgICAgICB2YXIgbW9vblJvdGF0aW9uID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGR4ID0gY2lyY2xlMS5zdGF0ZS5wb3MueCAtIGNpcmNsZTIuc3RhdGUucG9zLng7XG4gICAgICAgICAgICB2YXIgZHkgPSBjaXJjbGUyLnN0YXRlLnBvcy55IC0gY2lyY2xlMS5zdGF0ZS5wb3MueTtcbiAgICAgICAgICAgIHJldHVybiBNYXRoLmF0YW4yKGR5LGR4KTtcbiAgICAgICAgfTtcblxuICAgICAgICB2YXIgbW9vblJldm9sdXRpb24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgZHggPSAoY2lyY2xlMS5zdGF0ZS5wb3MueCArIGNpcmNsZTIuc3RhdGUucG9zLngpLzIgLSBiaWcuc3RhdGUucG9zLng7XG4gICAgICAgICAgICB2YXIgZHkgPSBiaWcuc3RhdGUucG9zLnkgLSAoY2lyY2xlMi5zdGF0ZS5wb3MueSArIGNpcmNsZTEuc3RhdGUucG9zLnkpLzI7XG4gICAgICAgICAgICByZXR1cm4gTWF0aC5hdGFuMihkeSxkeCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdmFyIGdyYXBoID0gbmV3IEdyYXBoKHRoaXMuY29udGFpbmVyLCB7XG4gICAgICAgICAgICAnUm90Jzoge2ZuOiBtb29uUm90YXRpb24sIHRpdGxlOiAnUm90YXRpb24nLCBtaW5zY2FsZTogMiAqIE1hdGguUEl9LFxuICAgICAgICAgICAgJ1Jldic6IHtmbjogbW9vblJldm9sdXRpb24sIHRpdGxlOiAnUmV2b2x1dGlvbicsIG1pbnNjYWxlOiAyICogTWF0aC5QSX0sXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIG1heDogMjAwMCxcbiAgICAgICAgICAgIHRvcDogMTAsXG4gICAgICAgICAgICBsZWZ0OiB0aGlzLm9wdGlvbnMud2lkdGgsXG4gICAgICAgICAgICB3aWR0aDogMzAwLFxuICAgICAgICAgICAgd29ybGRIZWlnaHQ6IHRoaXMub3B0aW9ucy5oZWlnaHQsXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmdyYXBoID0gZ3JhcGg7XG5cbiAgICAgICAgdGhpcy53b3JsZC5vbignc3RlcCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGdyYXBoLnVwZGF0ZSh3b3JsZC50aW1lc3RlcCgpKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdmFyIGJ1dHRvbkNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChidXR0b25Db250YWluZXIpO1xuICAgICAgICB2YXIgcGxheVBhdXNlID0gbmV3IFBsYXlQYXVzZSh3b3JsZCwgYnV0dG9uQ29udGFpbmVyKTtcbiAgICB9XG59KTtcblxuICAgICAgICBcbiIsInZhciBHYXRlID0gcmVxdWlyZSgnLi9nYXRlJyk7XG52YXIgQmFzZSA9IHJlcXVpcmUoJy4vYmFzZScpO1xudmFyIFN0b3B3YXRjaCA9IHJlcXVpcmUoJy4vc3RvcHdhdGNoJyk7XG52YXIgUGxheVBhdXNlID0gcmVxdWlyZSgnLi9wbGF5cGF1c2UnKTtcblxuZnVuY3Rpb24gcmFuZG9tKG1pbiwgbWF4KXtcbiAgICByZXR1cm4gKE1hdGgucmFuZG9tKCkgKiAobWF4LW1pbikgKyBtaW4pfDBcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBCYXNlLmV4dGVuZChmdW5jdGlvbiBBc3Rlcm9pZHMoY29udGFpbmVyLCBvcHRpb25zKSB7XG4gICAgQmFzZS5jYWxsKHRoaXMsIGNvbnRhaW5lciwgb3B0aW9ucywgJ2ltYWdlcy9zcGFjZV9iYWNrZ3JvdW5kLmpwZycsXG4gICAgICAgIHRydWUgLyogZGlzYWJsZUJvdW5kcyAqLylcbn0sIHtcbiAgICBzZXR1cDogZnVuY3Rpb24gKGNvbnRhaW5lcikge1xuICAgICAgICB2YXIgd29ybGQgPSB0aGlzLndvcmxkO1xuICAgICAgICB0aGlzLmhhbmRsZU5ld0FzdGVyb2lkKCk7XG4gICAgICAgIHZhciBwbGF5UGF1c2VDb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQocGxheVBhdXNlQ29udGFpbmVyKTtcbiAgICAgICAgdmFyIHBsYXlQYXVzZSA9IG5ldyBQbGF5UGF1c2Uod29ybGQsIHBsYXlQYXVzZUNvbnRhaW5lcik7XG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzLmNyZWF0ZU5ld0FzdGVyb2lkTGluaygpKVxuICAgIH0sXG5cbiAgICBjcmVhdGVOZXdBc3Rlcm9pZExpbms6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgbmV3QXN0ZXJvaWRMaW5rID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImFcIik7XG4gICAgICAgIG5ld0FzdGVyb2lkTGluay5ocmVmID0gXCIjXCI7XG4gICAgICAgIG5ld0FzdGVyb2lkTGluay5pbm5lckhUTUwgPSBcIk5ldyBhc3Rlcm9pZFwiO1xuICAgICAgICBuZXdBc3Rlcm9pZExpbmsuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgdGhpcy5oYW5kbGVOZXdBc3Rlcm9pZCgpO1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgcmV0dXJuIG5ld0FzdGVyb2lkTGluaztcbiAgICB9LFxuXG4gICAgaGFuZGxlTmV3QXN0ZXJvaWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgd29ybGQgPSB0aGlzLndvcmxkO1xuXG4gICAgICAgIHZhciBtaW5YID0gMTAwO1xuICAgICAgICB2YXIgbWF4WCA9IDQwMDtcbiAgICAgICAgdmFyIG1pblkgPSAxMDA7XG4gICAgICAgIHZhciBtYXhZID0gNDAwO1xuICAgICAgICB2YXIgbWluQW5nbGUgPSAwO1xuICAgICAgICB2YXIgbWF4QW5nbGUgPSAyKk1hdGguUEk7XG5cbiAgICAgICAgd29ybGQuYWRkKFBoeXNpY3MuYm9keSgnY2lyY2xlJywge1xuICAgICAgICAgICAgeDogcmFuZG9tKG1pblgsIG1heFgpLFxuICAgICAgICAgICAgeTogcmFuZG9tKG1pblksIG1heFkpLFxuICAgICAgICAgICAgcmFkaXVzOiA1MCxcbiAgICAgICAgICAgIGFuZ2xlOiByYW5kb20obWluQW5nbGUsIG1heEFuZ2xlKSxcbiAgICAgICAgICAgIG1hc3M6IDEwMDAsXG4gICAgICAgICAgICByZXN0aXR1dGlvbjogMCxcbiAgICAgICAgICAgIHN0eWxlczoge1xuICAgICAgICAgICAgICAgIGltYWdlOiAnaW1hZ2VzL2FzdGVyb2lkLnBuZycsXG4gICAgICAgICAgICAgICAgZmlsbFN0eWxlOiAnI2ZmY2MwMCdcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkpO1xuICAgIH1cbn0pO1xuXG4gICAgICAgIFxuIiwidmFyIEdhdGUgPSByZXF1aXJlKCcuL2dhdGUnKTtcbnZhciBCYXNlID0gcmVxdWlyZSgnLi9iYXNlJyk7XG52YXIgU3RvcHdhdGNoID0gcmVxdWlyZSgnLi9zdG9wd2F0Y2gnKTtcbnZhciBQbGF5UGF1c2UgPSByZXF1aXJlKCcuL3BsYXlwYXVzZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2UuZXh0ZW5kKGZ1bmN0aW9uIE9yYml0KGNvbnRhaW5lciwgb3B0aW9ucykge1xuICAgIEJhc2UuY2FsbCh0aGlzLCBjb250YWluZXIsIG9wdGlvbnMsIFwiaW1hZ2VzL3NwYWNlX2JhY2tncm91bmQuanBnXCIpXG59LCB7XG4gICAgc2V0dXA6IGZ1bmN0aW9uIChjb250YWluZXIpIHtcbiAgICAgICAgdmFyIHdvcmxkID0gdGhpcy53b3JsZDtcbiAgICAgICAgdmFyIHJlZEJhbGwgPSBQaHlzaWNzLmJvZHkoJ2NpcmNsZScsIHtcbiAgICAgICAgICAgIHg6IHRoaXMub3B0aW9ucy53aWR0aCAvIDJcbiAgICAgICAgICAgICx5OiA0MFxuICAgICAgICAgICAgLHZ4OiAwXG4gICAgICAgICAgICAsdnk6IC0xLzhcbiAgICAgICAgICAgICxyYWRpdXM6IDRcbiAgICAgICAgICAgICxtYXNzOiA0XG4gICAgICAgICAgICAscmVzdGl0dXRpb246IDBcbiAgICAgICAgICAgICxzdHlsZXM6IHtcbiAgICAgICAgICAgICAgICBmaWxsU3R5bGU6ICcjZDY4YjYyJyAvL3JlZFxuICAgICAgICAgICAgICAgICxhbmdsZUluZGljYXRvcjogJyMxNTU0NzknXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICB2YXIgZ3JlZW5CYWxsID0gUGh5c2ljcy5ib2R5KCdjaXJjbGUnLCB7XG4gICAgICAgICAgICB4OiB0aGlzLm9wdGlvbnMud2lkdGggLyAyXG4gICAgICAgICAgICAseTogNjBcbiAgICAgICAgICAgICx2eDogMy84XG4gICAgICAgICAgICAsdnk6IDEvOFxuICAgICAgICAgICAgLHJhZGl1czogNFxuICAgICAgICAgICAgLG1hc3M6IDRcbiAgICAgICAgICAgICxyZXN0aXR1dGlvbjogMFxuICAgICAgICAgICAgLHN0eWxlczoge1xuICAgICAgICAgICAgICAgIGZpbGxTdHlsZTogJyMyNmViNjInIC8vZ3JlZW5cbiAgICAgICAgICAgICAgICAsYW5nbGVJbmRpY2F0b3I6ICcjMTU1NDc5J1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdmFyIGJpZ0JhbGwgPSBQaHlzaWNzLmJvZHkoJ2NpcmNsZScsIHtcbiAgICAgICAgICAgIHg6IHRoaXMub3B0aW9ucy53aWR0aCAvIDJcbiAgICAgICAgICAgICx5OiAzMDBcbiAgICAgICAgICAgICx2eDogLTMvNTBcbiAgICAgICAgICAgICxyYWRpdXM6IDEwXG4gICAgICAgICAgICAsbWFzczogMjVcbiAgICAgICAgICAgICxyZXN0aXR1dGlvbjogMFxuICAgICAgICAgICAgLHN0eWxlczoge1xuICAgICAgICAgICAgICAgIGZpbGxTdHlsZTogJyMyNjhiZDInXG4gICAgICAgICAgICAgICAgLGFuZ2xlSW5kaWNhdG9yOiAnIzE1NTQ3OSdcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHdvcmxkLmFkZChbcmVkQmFsbCwgZ3JlZW5CYWxsLCBiaWdCYWxsXSk7XG4gICAgICAgIHdvcmxkLmFkZChQaHlzaWNzLmJlaGF2aW9yKCduZXd0b25pYW4nLCB7IHN0cmVuZ3RoOiAuNSB9KSk7XG5cbiAgICAgICAgdmFyIGJ1dHRvbkNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChidXR0b25Db250YWluZXIpO1xuICAgICAgICB2YXIgcGxheVBhdXNlID0gbmV3IFBsYXlQYXVzZSh3b3JsZCwgYnV0dG9uQ29udGFpbmVyKTtcbiAgICAgICAgdmFyIGdhdGVQb2x5Z29uID0gW3t4OiAtNzAwLCB5OiAtMTAwfSwge3g6IDcwMCwgeTogLTEwMH0sIHt4OiA3MDAsIHk6IDEzOX0sIHt4OiAtNzAwLCB5OiAxMzl9XTtcbiAgICAgICAgdmFyIGdhdGVQb2x5Z29uMiA9IFt7eDogLTcwMCwgeTogLTI2MX0sIHt4OiA3MDAsIHk6IC0yNjF9LCB7eDogNzAwLCB5OiAyMDB9LCB7eDogLTcwMCwgeTogMjAwfV07XG4gICAgICAgIHZhciBnYXRlcyA9IFtdXG4gICAgICAgIGdhdGVzLnB1c2gobmV3IEdhdGUod29ybGQsIGJ1dHRvbkNvbnRhaW5lciwgZ2F0ZVBvbHlnb24sIFs3MDAsIDEwMF0sIHJlZEJhbGwsIHtkZWJ1ZzogdHJ1ZSwgc2hvdzogdHJ1ZX0pKTtcbiAgICAgICAgZ2F0ZXMucHVzaChuZXcgR2F0ZSh3b3JsZCwgYnV0dG9uQ29udGFpbmVyLCBnYXRlUG9seWdvbiwgWzcwMCwgMTAwXSwgZ3JlZW5CYWxsLCB7ZGVidWc6IHRydWUsIHNob3c6IHRydWV9KSk7XG4gICAgICAgIGdhdGVzLnB1c2gobmV3IEdhdGUod29ybGQsIGJ1dHRvbkNvbnRhaW5lciwgZ2F0ZVBvbHlnb24sIFs3MDAsIDEwMF0sIGJpZ0JhbGwsIHtkZWJ1ZzogdHJ1ZSwgc2hvdzogdHJ1ZX0pKTtcbiAgICAgICAgZ2F0ZXMucHVzaChuZXcgR2F0ZSh3b3JsZCwgYnV0dG9uQ29udGFpbmVyLCBnYXRlUG9seWdvbjIsIFs3MDAsIDUwMF0sIHJlZEJhbGwsIHtkZWJ1ZzogdHJ1ZSwgc2hvdzogdHJ1ZX0pKTtcbiAgICAgICAgZ2F0ZXMucHVzaChuZXcgR2F0ZSh3b3JsZCwgYnV0dG9uQ29udGFpbmVyLCBnYXRlUG9seWdvbjIsIFs3MDAsIDUwMF0sIGdyZWVuQmFsbCwge2RlYnVnOiB0cnVlLCBzaG93OiB0cnVlfSkpO1xuICAgICAgICBnYXRlcy5wdXNoKG5ldyBHYXRlKHdvcmxkLCBidXR0b25Db250YWluZXIsIGdhdGVQb2x5Z29uMiwgWzcwMCwgNTAwXSwgYmlnQmFsbCwge2RlYnVnOiB0cnVlLCBzaG93OiB0cnVlfSkpO1xuICAgICAgICBnYXRlcy5mb3JFYWNoKGZ1bmN0aW9uKGdhdGUpIHtcbiAgICAgICAgICAgIHZhciBzdG9wd2F0Y2ggPSBuZXcgU3RvcHdhdGNoKHdvcmxkLCBidXR0b25Db250YWluZXIsIDEpO1xuICAgICAgICAgICAgZ2F0ZS5vbignZW50ZXInLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICAgICAgc3RvcHdhdGNoLnJlc2V0KCk7XG4gICAgICAgICAgICAgICAgc3RvcHdhdGNoLnN0YXJ0KCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGdhdGUub24oJ2V4aXQnLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICAgICAgc3RvcHdhdGNoLnN0b3AoKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cbn0pO1xuXG4gICAgICAgIFxuIiwibW9kdWxlLmV4cG9ydHMgPSBQbGF5UGF1c2U7XG5cbmZ1bmN0aW9uIFBsYXlQYXVzZSh3b3JsZCwgY29udGFpbmVyKSB7XG4gICAgdGhpcy5fYXR0YWNoKHdvcmxkLCBjb250YWluZXIpO1xufVxuXG5QbGF5UGF1c2UucHJvdG90eXBlLmNyZWF0ZUJ1dHRvbiA9IGZ1bmN0aW9uKGFjdGlvbiwgaGFuZGxlcikge1xuICAgIHZhciBhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImFcIik7XG4gICAgYS5ocmVmID0gXCIjXCIgKyBhY3Rpb247XG4gICAgYS5pbm5lckhUTUwgPSBhY3Rpb247XG4gICAgYS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIGhhbmRsZXIoKTtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICB9LmJpbmQodGhpcykpO1xuICAgIHJldHVybiBhO1xufVxuXG5QbGF5UGF1c2UucHJvdG90eXBlLl9hdHRhY2ggPSBmdW5jdGlvbih3b3JsZCwgY29udGFpbmVyKSB7XG4gICAgdGhpcy5wYXVzZVN5bWJvbCA9IFwi4paQ4paQXCI7XG4gICAgdGhpcy5wbGF5U3ltYm9sID0gXCLilrpcIjtcbiAgICB0aGlzLmJ1dHRvbiA9IHRoaXMuY3JlYXRlQnV0dG9uKHRoaXMucGF1c2VTeW1ib2wsIHRoaXMudG9nZ2xlLmJpbmQodGhpcykpO1xuICAgIHRoaXMud29ybGQgPSB3b3JsZDtcbiAgICB2YXIgd2lkZ2V0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICB3aWRnZXQuY2xhc3NOYW1lID0gXCJwbGF5cGF1c2VcIjtcbiAgICB3aWRnZXQuYXBwZW5kQ2hpbGQodGhpcy5idXR0b24pO1xuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZCh3aWRnZXQpO1xufVxuXG5QbGF5UGF1c2UucHJvdG90eXBlLnRvZ2dsZSA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLndvcmxkLmlzUGF1c2VkKCkpIHtcbiAgICAgICAgdGhpcy5idXR0b24uaW5uZXJIVE1MID0gdGhpcy5wYXVzZVN5bWJvbDtcbiAgICAgICAgdGhpcy5idXR0b24uaHJlZiA9ICcjJyArIHRoaXMucGF1c2VTeW1ib2w7XG4gICAgICAgIHRoaXMud29ybGQudW5wYXVzZSgpXG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5idXR0b24uaW5uZXJIVE1MID0gdGhpcy5wbGF5U3ltYm9sO1xuICAgICAgICB0aGlzLmJ1dHRvbi5ocmVmID0gJyMnICsgdGhpcy5wbGF5U3ltYm9sO1xuICAgICAgICB0aGlzLndvcmxkLnBhdXNlKClcbiAgICB9XG59XG5cblxuIiwidmFyIEJhc2UgPSByZXF1aXJlKCcuL2Jhc2UnKTtcbnZhciBHYXRlID0gcmVxdWlyZSgnLi9nYXRlJyk7XG52YXIgU3RvcHdhdGNoID0gcmVxdWlyZSgnLi9zdG9wd2F0Y2gnKTtcbnZhciBQbGF5UGF1c2UgPSByZXF1aXJlKCcuL3BsYXlwYXVzZScpO1xudmFyIHV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBCYXNlLmV4dGVuZChmdW5jdGlvbiBTbG9wZShjb250YWluZXIsIG9wdGlvbnMpIHtcbiAgICBCYXNlLmNhbGwodGhpcywgY29udGFpbmVyLCBvcHRpb25zLCAnaW1hZ2VzL2xhYl9iYWNrZ3JvdW5kLmpwZycpXG59LCB7XG4gICAgZHJvcEluQm9keTogZnVuY3Rpb24gKHJhZGl1cywgeSkge1xuICAgICAgICBmdW5jdGlvbiByYW5kb20obWluLCBtYXgpe1xuICAgICAgICAgICAgcmV0dXJuIChNYXRoLnJhbmRvbSgpICogKG1heC1taW4pICsgbWluKXwwXG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLndvcmxkLmFkZChQaHlzaWNzLmJvZHkoJ2NpcmNsZScsIHtcbiAgICAgICAgICAgIHg6IDEwMCxcbiAgICAgICAgICAgIHk6IHksXG4gICAgICAgICAgICB2eDogcmFuZG9tKC01LCA1KS8xMDAsXG4gICAgICAgICAgICByYWRpdXM6IHJhZGl1cyxcbiAgICAgICAgICAgIHJlc3RpdHV0aW9uOiAwLjksXG4gICAgICAgICAgICBzdHlsZXM6IHtcbiAgICAgICAgICAgICAgICBmaWxsU3R5bGU6ICcjMjY4YmQyJyxcbiAgICAgICAgICAgICAgICBhbmdsZUluZGljYXRvcjogJyMxNTU0NzknXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pKTtcbiAgICB9LFxuICAgIHNldHVwOiBmdW5jdGlvbiAoY29udGFpbmVyKSB7XG4gICAgICAgIHZhciB3b3JsZCA9IHRoaXMud29ybGRcbiAgICAgICAgd29ybGQuYWRkKFBoeXNpY3MuYmVoYXZpb3IoJ2NvbnN0YW50LWFjY2VsZXJhdGlvbicpKTtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDU7IGkrKykge1xuICAgICAgICAgICAgdmFyIHJhZGl1cyA9IDIwICsgMTAgKiBpO1xuICAgICAgICAgICAgdGhpcy5kcm9wSW5Cb2R5KHJhZGl1cywgMzAwIC0gaSAqIDUwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMud29ybGQuYWRkKFBoeXNpY3MuYm9keSgnY29udmV4LXBvbHlnb24nLCB7XG4gICAgICAgICAgICB4OiA0NTAsXG4gICAgICAgICAgICB5OiA2MDAsXG4gICAgICAgICAgICB2ZXJ0aWNlczogW1xuICAgICAgICAgICAgICAgIHt4OiAwLCB5OiAwfSxcbiAgICAgICAgICAgICAgICB7eDogMCwgeTogMzAwfSxcbiAgICAgICAgICAgICAgICB7eDogODAwLCB5OiAzMDB9LFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIHRyZWF0bWVudDogJ3N0YXRpYycsXG4gICAgICAgICAgICBjb2Y6IDEsXG4gICAgICAgICAgICBzdHlsZXM6IHtcbiAgICAgICAgICAgICAgICBmaWxsU3R5bGU6ICcjZDMzNjgyJyxcbiAgICAgICAgICAgICAgICBhbmdsZUluZGljYXRvcjogJyM3NTFiNGInXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pKVxuXG4gICAgICAgIHZhciBidXR0b25Db250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoYnV0dG9uQ29udGFpbmVyKTtcbiAgICAgICAgdmFyIHN0b3B3YXRjaCA9IG5ldyBTdG9wd2F0Y2god29ybGQsIGJ1dHRvbkNvbnRhaW5lciwgMSk7XG4gICAgICAgIHZhciBwbGF5UGF1c2UgPSBuZXcgUGxheVBhdXNlKHdvcmxkLCBidXR0b25Db250YWluZXIpO1xuICAgICAgICB2YXIgdG9wR2F0ZSA9IG5ldyBHYXRlKHdvcmxkLCBidXR0b25Db250YWluZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXRpbC5tYWtlUmVjdCgwLCAwLCA2MCwgMTAwKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbMzUwLCA0MDBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG51bGwsIHtkZWJ1ZzogdHJ1ZSwgc2hvdzogdHJ1ZX0pO1xuICAgICAgICB2YXIgYm90dG9tR2F0ZSA9IG5ldyBHYXRlKHdvcmxkLCBidXR0b25Db250YWluZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXRpbC5tYWtlUmVjdCgwLCAwLCA2MCwgMTAwKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbODAwLCA1NzBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG51bGwsIHtkZWJ1ZzogdHJ1ZSwgc2hvdzogdHJ1ZX0pO1xuXG4gICAgICAgIHRvcEdhdGUub24oJ2VudGVyJywgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgc3RvcHdhdGNoLnJlc2V0KCkuc3RhcnQoKTtcbiAgICAgICAgfSlcbiAgICAgICAgYm90dG9tR2F0ZS5vbignZW50ZXInLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICBzdG9wd2F0Y2guc3RvcCgpXG4gICAgICAgIH0pXG4gICAgfVxufSk7XG5cbiIsIlxubW9kdWxlLmV4cG9ydHMgPSBTdG9wd2F0Y2g7XG5cbmZ1bmN0aW9uIFN0b3B3YXRjaCh3b3JsZCwgZWxlbSkge1xuICAgIHRoaXMuX2F0dGFjaCh3b3JsZCwgZWxlbSk7XG59XG5cblN0b3B3YXRjaC5wcm90b3R5cGUuX2F0dGFjaCA9IGZ1bmN0aW9uKHdvcmxkLCBlbGVtKSB7XG4gICAgdGhpcy53b3JsZCA9IHdvcmxkO1xuICAgIHRoaXMudGltZXIgPSB0aGlzLmNyZWF0ZVRpbWVyKCksXG4gICAgdGhpcy5zdGFydEJ1dHRvbiA9IHRoaXMuY3JlYXRlQnV0dG9uKFwic3RhcnRcIiwgdGhpcy5zdGFydC5iaW5kKHRoaXMpKSxcbiAgICB0aGlzLnN0b3BCdXR0b24gPSB0aGlzLmNyZWF0ZUJ1dHRvbihcInN0b3BcIiwgdGhpcy5zdG9wLmJpbmQodGhpcykpLFxuICAgIHRoaXMucmVzZXRCdXR0b24gPSB0aGlzLmNyZWF0ZUJ1dHRvbihcInJlc2V0XCIsIHRoaXMucmVzZXQuYmluZCh0aGlzKSksXG4gICAgdGhpcy5jbG9jayA9IDA7XG5cbiAgICAvLyBVcGRhdGUgb24gZXZlcnkgdGltZXIgdGlja1xuICAgIHRoaXMud29ybGQub24oJ3N0ZXAnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy51cGRhdGUoKTtcbiAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgdmFyIHdpZGdldCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgd2lkZ2V0LmNsYXNzTmFtZSA9IFwic3RvcHdhdGNoXCI7XG5cbiAgICAvLyBhcHBlbmQgZWxlbWVudHNcbiAgICB3aWRnZXQuYXBwZW5kQ2hpbGQodGhpcy50aW1lcik7XG4gICAgd2lkZ2V0LmFwcGVuZENoaWxkKHRoaXMuc3RhcnRCdXR0b24pO1xuICAgIHdpZGdldC5hcHBlbmRDaGlsZCh0aGlzLnN0b3BCdXR0b24pO1xuICAgIHdpZGdldC5hcHBlbmRDaGlsZCh0aGlzLnJlc2V0QnV0dG9uKTtcblxuICAgIGVsZW0uYXBwZW5kQ2hpbGQod2lkZ2V0KTtcbn1cblxuU3RvcHdhdGNoLnByb3RvdHlwZS5jcmVhdGVUaW1lciA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKTtcbn1cblxuU3RvcHdhdGNoLnByb3RvdHlwZS5jcmVhdGVCdXR0b24gPSBmdW5jdGlvbihhY3Rpb24sIGhhbmRsZXIpIHtcbiAgICB2YXIgYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJhXCIpO1xuICAgIGEuaHJlZiA9IFwiI1wiICsgYWN0aW9uO1xuICAgIGEuaW5uZXJIVE1MID0gYWN0aW9uO1xuICAgIGEuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICBoYW5kbGVyKCk7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgfS5iaW5kKHRoaXMpKTtcbiAgICByZXR1cm4gYTtcbn1cblxuU3RvcHdhdGNoLnByb3RvdHlwZS5zdGFydCA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucnVubmluZyA9IHRydWVcbiAgICByZXR1cm4gdGhpcztcbn1cblxuU3RvcHdhdGNoLnByb3RvdHlwZS5zdG9wID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5ydW5uaW5nID0gZmFsc2VcbiAgICByZXR1cm4gdGhpcztcbn1cblxuU3RvcHdhdGNoLnByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuY2xvY2sgPSAwO1xuICAgIHRoaXMucmVuZGVyKCk7XG4gICAgcmV0dXJuIHRoaXM7XG59XG5cblN0b3B3YXRjaC5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIG5ld1RpbWUgPSB0aGlzLndvcmxkLl90aW1lO1xuICAgIGlmICh0aGlzLnJ1bm5pbmcgJiYgdGhpcy5sYXN0VGltZSkge1xuICAgICAgICB0aGlzLmNsb2NrICs9IG5ld1RpbWUgLSB0aGlzLmxhc3RUaW1lO1xuICAgIH1cbiAgICB0aGlzLmxhc3RUaW1lID0gbmV3VGltZTtcbiAgICB0aGlzLnJlbmRlcigpO1xufVxuXG5TdG9wd2F0Y2gucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMudGltZXIuaW5uZXJIVE1MID0gcGFyc2VGbG9hdCh0aGlzLmNsb2NrIC8gMTAwMCkudG9GaXhlZCgyKTtcbn1cbiIsIlxudmFyIEJhc2UgPSByZXF1aXJlKCcuL2Jhc2UnKTtcbnZhciBHcmFwaCA9IHJlcXVpcmUoJy4vZ3JhcGgnKTtcblxuZnVuY3Rpb24gcmFuZG9tKCBtaW4sIG1heCApe1xuICAgIHJldHVybiAoTWF0aC5yYW5kb20oKSAqIChtYXgtbWluKSArIG1pbil8MFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2UuZXh0ZW5kKGZ1bmN0aW9uIERlbW8oY29udGFpbmVyLCBvcHRpb25zKSB7XG4gICAgQmFzZS5jYWxsKHRoaXMsIGNvbnRhaW5lciwgb3B0aW9ucywgJ2ltYWdlcy9sYWJfYmFja2dyb3VuZC5qcGcnKVxufSwge1xuICAgIG1ha2VDaXJjbGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIFBoeXNpY3MuYm9keSgnY2lyY2xlJywge1xuICAgICAgICAgICAgeDogdGhpcy5vcHRpb25zLndpZHRoIC8gMixcbiAgICAgICAgICAgIHk6IDUwLFxuICAgICAgICAgICAgdng6IHJhbmRvbSgtNSwgNSkvMTAwLFxuICAgICAgICAgICAgcmFkaXVzOiA0MCxcbiAgICAgICAgICAgIHJlc3RpdHV0aW9uOiAwLjksXG4gICAgICAgICAgICBzdHlsZXM6IHtcbiAgICAgICAgICAgICAgICBmaWxsU3R5bGU6ICcjMjY4YmQyJyxcbiAgICAgICAgICAgICAgICBhbmdsZUluZGljYXRvcjogJyMxNTU0NzknXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgZHJvcEluQm9keTogZnVuY3Rpb24gKCkge1xuXG4gICAgICAgIHZhciBib2R5O1xuXG5cbiAgICAgICAgdmFyIHBlbnQgPSBbXG4gICAgICAgICAgICB7IHg6IDUwLCB5OiAwIH1cbiAgICAgICAgICAgICx7IHg6IDI1LCB5OiAtMjUgfVxuICAgICAgICAgICAgLHsgeDogLTI1LCB5OiAtMjUgfVxuICAgICAgICAgICAgLHsgeDogLTUwLCB5OiAwIH1cbiAgICAgICAgICAgICx7IHg6IDAsIHk6IDUwIH1cbiAgICAgICAgXTtcblxuICAgICAgICAgICAgc3dpdGNoICggcmFuZG9tKCAwLCAzICkgKXtcblxuICAgICAgICAgICAgICAgICAgICAvLyBhZGQgYSBjaXJjbGVcbiAgICAgICAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICAgICAgICAgIGJvZHkgPSBQaHlzaWNzLmJvZHkoJ2NpcmNsZScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHg6IHRoaXMub3B0aW9ucy53aWR0aCAvIDJcbiAgICAgICAgICAgICAgICAgICAgICAgICx5OiA1MFxuICAgICAgICAgICAgICAgICAgICAgICAgLHZ4OiByYW5kb20oLTUsIDUpLzEwMFxuICAgICAgICAgICAgICAgICAgICAgICAgLHJhZGl1czogNDBcbiAgICAgICAgICAgICAgICAgICAgICAgICxyZXN0aXR1dGlvbjogMC45XG4gICAgICAgICAgICAgICAgICAgICAgICAsc3R5bGVzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsbFN0eWxlOiAnIzI2OGJkMidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAsYW5nbGVJbmRpY2F0b3I6ICcjMTU1NDc5J1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gYWRkIGEgc3F1YXJlXG4gICAgICAgICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgICAgICAgICBib2R5ID0gUGh5c2ljcy5ib2R5KCdyZWN0YW5nbGUnLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogNTBcbiAgICAgICAgICAgICAgICAgICAgICAgICxoZWlnaHQ6IDUwXG4gICAgICAgICAgICAgICAgICAgICAgICAseDogdGhpcy5vcHRpb25zLndpZHRoIC8gMlxuICAgICAgICAgICAgICAgICAgICAgICAgLHk6IDUwXG4gICAgICAgICAgICAgICAgICAgICAgICAsdng6IHJhbmRvbSgtNSwgNSkvMTAwXG4gICAgICAgICAgICAgICAgICAgICAgICAscmVzdGl0dXRpb246IDAuOVxuICAgICAgICAgICAgICAgICAgICAgICAgLHN0eWxlczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGxTdHlsZTogJyNkMzM2ODInXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLGFuZ2xlSW5kaWNhdG9yOiAnIzc1MWI0YidcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGFkZCBhIHBvbHlnb25cbiAgICAgICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgICAgIGJvZHkgPSBQaHlzaWNzLmJvZHkoJ2NvbnZleC1wb2x5Z29uJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmVydGljZXM6IHBlbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICx4OiB0aGlzLm9wdGlvbnMud2lkdGggLyAyXG4gICAgICAgICAgICAgICAgICAgICAgICAseTogNTBcbiAgICAgICAgICAgICAgICAgICAgICAgICx2eDogcmFuZG9tKC01LCA1KS8xMDBcbiAgICAgICAgICAgICAgICAgICAgICAgICxhbmdsZTogcmFuZG9tKCAwLCAyICogTWF0aC5QSSApXG4gICAgICAgICAgICAgICAgICAgICAgICAscmVzdGl0dXRpb246IDAuOVxuICAgICAgICAgICAgICAgICAgICAgICAgLHN0eWxlczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGxTdHlsZTogJyM4NTk5MDAnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLGFuZ2xlSW5kaWNhdG9yOiAnIzQxNDcwMCdcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLndvcmxkLmFkZCggYm9keSApO1xuICAgIH0sXG4gICAgc2V0dXA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHdvcmxkID0gdGhpcy53b3JsZFxuICAgICAgICAvLyB3b3JsZC5hZGQoUGh5c2ljcy5iZWhhdmlvcignY29uc3RhbnQtYWNjZWxlcmF0aW9uJykpO1xuXG4gICAgICAgIC8qXG4gICAgICAgIHZhciBpbnQgPSBzZXRJbnRlcnZhbChmdW5jdGlvbigpe1xuICAgICAgICAgICAgaWYgKCB3b3JsZC5fYm9kaWVzLmxlbmd0aCA+IDQgKXtcbiAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKCBpbnQgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuZHJvcEluQm9keSgpO1xuICAgICAgICB9LmJpbmQodGhpcyksIDcwMCk7XG4gICAgICAgKi9cblxuICAgICAgICB2YXIgY2lyY2xlID0gdGhpcy5tYWtlQ2lyY2xlKClcbiAgICAgICAgdGhpcy53b3JsZC5hZGQoY2lyY2xlKVxuXG4gICAgICAgIHZhciBncmFwaCA9IG5ldyBHcmFwaCh0aGlzLmNvbnRhaW5lciwge1xuICAgICAgICAgICAgJ0NpcmNsZSc6IHtib2R5OiBjaXJjbGUsIGF0dHI6ICdwb3MueScsIG5hbWU6J0NpcmNsZScsIG1pbnNjYWxlOiA1fSxcbiAgICAgICAgICAgICdWZWxZJzoge2JvZHk6IGNpcmNsZSwgYXR0cjogJ3ZlbC55JywgbmFtZTonVmVsWScsIG1pbnNjYWxlOiAuMX0sXG4gICAgICAgICAgICAnQW5nUCc6IHtib2R5OiBjaXJjbGUsIGF0dHI6ICdhbmd1bGFyLnBvcycsIG5hbWU6J0FjY1gnLCBtaW5zY2FsZTogLjAwMX0sXG4gICAgICAgICAgICAnQW5nVic6IHtib2R5OiBjaXJjbGUsIGF0dHI6ICdhbmd1bGFyLnZlbCcsIG5hbWU6J0FjY1gnLCBtaW5zY2FsZTogLjAwMX0sXG4gICAgICAgIH0sIHRoaXMub3B0aW9ucy5oZWlnaHQpXG4gICAgICAgIHRoaXMuZ3JhcGggPSBncmFwaFxuXG4gICAgICAgIHRoaXMud29ybGQub24oJ3N0ZXAnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBncmFwaC51cGRhdGUod29ybGQudGltZXN0ZXAoKSlcbiAgICAgICAgfSk7XG5cbiAgICB9XG59KTtcblxuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgbWFrZVJlY3Q6IG1ha2VSZWN0LFxuICAgIG1ha2VSb2NrOiBtYWtlUm9jayxcbiAgICBzdW06IHN1bSxcbiAgICBhdmc6IGF2Z1xufVxuXG5mdW5jdGlvbiBzdW0obnVtYmVycykge1xuICAgIGlmICghbnVtYmVycy5sZW5ndGgpIHJldHVybiAwO1xuICAgIHJldHVybiBudW1iZXJzLnJlZHVjZShmdW5jdGlvbiAoYSwgYikge3JldHVybiBhICsgYn0pXG59XG5cbmZ1bmN0aW9uIGF2ZyhudW1iZXJzKSB7XG4gICAgaWYgKCFudW1iZXJzLmxlbmd0aCkgcmV0dXJuIDA7XG4gICAgcmV0dXJuIHN1bShudW1iZXJzKSAvIG51bWJlcnMubGVuZ3RoXG59XG5cbmZ1bmN0aW9uIG1ha2VSZWN0KHgsIHksIHdpZHRoLCBoZWlnaHQpIHtcbiAgICByZXR1cm4gW1xuICAgICAgICB7eDogeCAtIHdpZHRoLzIsIHk6IHkgLSBoZWlnaHQvMn0sXG4gICAgICAgIHt4OiB4ICsgd2lkdGgvMiwgeTogeSAtIGhlaWdodC8yfSxcbiAgICAgICAge3g6IHggKyB3aWR0aC8yLCB5OiB5ICsgaGVpZ2h0LzJ9LFxuICAgICAgICB7eDogeCAtIHdpZHRoLzIsIHk6IHkgKyBoZWlnaHQvMn0sXG4gICAgXVxufVxuXG4vLyBOb3QgYSBjb252ZXggaHVsbCA6KFxuZnVuY3Rpb24gbWFrZVJvY2socmFkaXVzLCBkZXZpYXRpb24sIHJlc29sdXRpb24pIHtcbiAgICB2YXIgcmVzb2x1dGlvbiA9IHJlc29sdXRpb24gfHwgMzJcbiAgICB2YXIgZGV2aWF0aW9uID0gZGV2aWF0aW9uIHx8IDEwXG4gICAgdmFyIHBvaW50cyA9IFtdXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZXNvbHV0aW9uOyBpKyspIHtcbiAgICAgICAgdmFyIGFuZyA9IGkgLyByZXNvbHV0aW9uICogMiAqIE1hdGguUEk7XG4gICAgICAgIHZhciBwb2ludCA9IHsgeDogcmFkaXVzICogTWF0aC5jb3MoYW5nKSwgeTogcmFkaXVzICogTWF0aC5zaW4oYW5nKSB9XG4gICAgICAgIHBvaW50LnggKz0gKE1hdGgucmFuZG9tKCkpICogMiAqIGRldmlhdGlvblxuICAgICAgICBwb2ludC55ICs9IChNYXRoLnJhbmRvbSgpKSAqIDIgKiBkZXZpYXRpb25cbiAgICAgICAgcG9pbnRzLnB1c2gocG9pbnQpXG4gICAgfVxuICAgIHJldHVybiBwb2ludHNcbn1cbiIsIlxudmFyIGJha2hhbiA9IHJlcXVpcmUoJy4vbGliJylcbiAgLCBub2RlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21haW4tY2FudmFzJylcblxudmFyIG9wdGlvbnMgPSB7XG4gICAgd2lkdGg6IDkwMCxcbiAgICBoZWlnaHQ6IDcwMCxcbn1cblxudmFyIG5hbWUgPSB3aW5kb3cubG9jYXRpb24uc2VhcmNoLnJlcGxhY2UoLyYoXFx3Kyk9KFteJl0rKS9nLCBmdW5jdGlvbiAocmVzLCBrZXksIHZhbCkge1xuICAgIG9wdGlvbnNba2V5XSA9IHZhbC5yZXBsYWNlKC9cXC8vLCAnJylcbiAgICByZXR1cm4gJydcbn0pLnJlcGxhY2UoL1teXFx3XS9nLCAnJykgfHwgJ0RlbW8nXG5jb25zb2xlLmxvZyhuYW1lKVxuXG53aW5kb3cuQktBID0gbmV3IGJha2hhbltuYW1lXShub2RlLCBvcHRpb25zKTtcbndpbmRvdy5CS0EucnVuKCk7XG4iXX0=
