(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Gate = require('./gate');
var Base = require('./base');
var Stopwatch = require('./stopwatch');
var PlayPause = require('./playpause');

module.exports = Base.extend(function Asteroids(container, options) {
    Base.call(this, container, options, 'images/space_background.jpg',
        true)
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

        

},{"./base":3,"./gate":11,"./playpause":27,"./stopwatch":29}],2:[function(require,module,exports){
/** @jsx React.DOM */

var Walkthrough = require('./intro/walk-through.jsx')
var Step = require('./intro/step.jsx')

module.exports = Bacon;

function Bacon(container, options) {
    var node = document.createElement('div');
    document.body.appendChild(node);
    React.renderComponent(Walkthrough({
        steps: steps,
    }), node);
}

Bacon.prototype = {
    run: function () {},
};

var steps = [
    function (props) {
        return Step(_.extend(props, {
            id: 'congrats',
            title: "Congratulations!",
            showBacon: true,
            body: React.DOM.div(null, 
                React.DOM.p(null, "That was some awesome Science you did there!  You've finished all of my experiments. You earned the ", React.DOM.strong(null, "Bacon Badge"), " for your work."), 
                React.DOM.p({className: "bacon-badge-container"}, React.DOM.img({className: "bacon-badge", src: "/images/bacon.png"}))
            ),
            next: "What's next?"
        }));
    },

    function (props) {
        return Step(_.extend(props, {
            id: 'next',
            title: "Do more science!",
            showBacon: true,
            body: React.DOM.div(null, 
                React.DOM.p(null, "If you want to learn more science, check out the ", React.DOM.a({href: "//khanacademy.org/science/physics"}, "physics"), " section on Khan Academy.  Have fun!")
            ),
        }));
    },
];

},{"./intro/step.jsx":19,"./intro/walk-through.jsx":20}],3:[function(require,module,exports){

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

},{}],4:[function(require,module,exports){

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


},{}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
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


},{}],7:[function(require,module,exports){
/** @jsx React.DOM */

var DataChecker = React.createClass({displayName: 'DataChecker',
    propTypes: {
        initialText: React.PropTypes.string.isRequired,
        initialHypothesis: React.PropTypes.string.isRequired,
        possibleHypotheses: React.PropTypes.arrayOf(React.PropTypes.shape({
            name: React.PropTypes.string.isRequired,
            buttonText: React.PropTypes.string.isRequired, // the text on the button to change your hypothesis
            text: React.PropTypes.string.isRequired, // "Your hypothesis was <text>."
        })).isRequired,
        result: React.PropTypes.func.isRequired, // takes in the current state and returns an error string for francis to say, or null if there are no problems with the experiment.
        nextURL: React.PropTypes.string, // the url of the next thing.
    },

    getInitialState: function () {
        return {
            thisResult: this.props.initialText,
            prevResult: '',
            hypothesis: this.props.initialHypothesis, // a hypothesis.name
            disproven: false,
        };
    },

    renderHypothesis: function () {
        var hypText = _.findWhere(
            this.props.possibleHypotheses,
            {name: this.state.hypothesis}).text
        return React.DOM.p({className: "checker_your-hypo"}, 
            React.DOM.em(null, "Your hypothesis is ", hypText, ".")
        )
    },

    render: function () {
        if (this.state.disproven) {
            var buttons = _.map(
                _.filter(
                    this.props.possibleHypotheses,
                    function (hyp) {
                        return (this.state.hypothesis !== hyp.name);
                    }.bind(this)),
                function (hyp) {
                    return React.DOM.button({
                            key: hyp.name, 
                            className: "btn btn-default", 
                            onClick: function () {
                                this.changeHypothesis(hyp.name)
                            }.bind(this)}, 
                        hyp.buttonText
                    );
                }.bind(this));

            return React.DOM.div({className: "checker"}, 
                this.renderHypothesis(), 
                React.DOM.img({src: "images/sir-francis.jpeg", className: "checker_francis"}), 
                React.DOM.div({className: "checker_main"}, 
                    React.DOM.p(null, "Okay, which result do they support?"), 
                    buttons
                )
            );
        } else if (this.state.thisResult) {
            return React.DOM.div({className: "checker"}, 
                this.renderHypothesis(), 
                React.DOM.img({src: "images/sir-francis.jpeg", className: "checker_francis"}), 
                React.DOM.div({className: "checker_main"}, 
                    React.DOM.p(null, this.state.thisResult), 
                    React.DOM.button({className: "btn btn-default", onClick: this.support}, "The data support my hypothesis."), 
                    React.DOM.button({className: "btn btn-default", onClick: this.disprove}, "The data disprove my hypothesis.")
                )
            );
        } else {
            if (this.props.nextURL) {
                var continuer = React.DOM.a({className: "btn btn-default", href: this.props.nextURL}, "Thanks!  What's next?");
            } else {
                var continuer = React.DOM.span(null);
            }
            return React.DOM.div({className: "checker"}, 
                this.renderHypothesis(), 
                React.DOM.img({src: "images/sir-francis.jpeg", className: "checker_francis"}), 
                React.DOM.div({className: "checker_main"}, 
                    React.DOM.p(null, "Your experiment looks great, and I'm convinced.  Here, have some bacon."), 
                    continuer, ";"
                )
            );
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

    changeHypothesis: function (hyp) {
        this.setState({
            disproven: false,
            hypothesis: hyp,
        }, this.askFrancis);
    },

    askFrancis: function () {
        this.setState({
            thisResult: this.props.result(this.state),
            prevResult: this.state.thisResult
        });
    }
})

module.exports = DataChecker;

},{}],8:[function(require,module,exports){
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
            mass: 900,
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


},{"./base":3,"./gate":11,"./graph":12,"./playpause":27,"./stopwatch":29}],9:[function(require,module,exports){
var Base = require('./base');
var Gate = require('./gate');
var Stopwatch = require('./stopwatch');
var LogBook = require('./logbook');
var PlayPause = require('./playpause');
var DropIntro = require('./intro/drop_intro.jsx');
var dropDataChecker = require('./dropdatachecker');
var util = require('./util');

function random(min, max){
    return (Math.random() * (max-min) + min)|0
}

module.exports = Base.extend(function Drop(container, options) {
    Base.call(this, container, options, "images/blue_lab.jpg")
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
        var debug = this.options.debug === 'true';
        var spacing_ms = debug ? 400 : 800;
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
        }.bind(this), this.options.debug === 'true')
    },

    setupDataChecker: function (hypothesis) {
        var dataChecker = document.createElement("div");
        dataChecker.className = "drop-data-checker";
        this.sideBar.appendChild(dataChecker);
        dropDataChecker(dataChecker, this.logBook, hypothesis);
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

},{"./base":3,"./dropdatachecker":10,"./gate":11,"./intro/drop_intro.jsx":16,"./logbook":21,"./playpause":27,"./stopwatch":29,"./util":32}],10:[function(require,module,exports){
var DataChecker = require('./datachecker.jsx');

module.exports = dropDataChecker;

var _initialText = "Do an experiment to see if you can figure out which ball falls faster, and let me know when you're done!";

var _nextURL = "?Newton1&walk=true";

var _hypotheses = [
    {
        name: "bowling",
        buttonText: "The bowling ball falls faster.",
        text: "that the bowling ball will fall faster",
    },
    {
        name: "tennis",
        buttonText: "The tennis ball falls faster.",
        text: "that the tennis ball will fall faster",
    },
    {
        name: "same",
        buttonText: "Both balls fall at the same rate.",
        text: "that both balls will fall at the same rate",
    },
];
    

function dropDataChecker(container, logBook, hypothesis) {
    return React.renderComponent(DataChecker({
        initialText: _initialText,
        initialHypothesis: hypothesis,
        possibleHypotheses: _hypotheses,
        result: function (state) {return _result(logBook, state);},
        nextURL: _nextURL,
    }), container);
}

function _result(logBook, state) {
    // we return the error, or null if they're correct
    var enoughData = _.all(logBook.data, function (d) {return d.length >= 5;});
    if (enoughData) {
        var avgs = {}
        var maxDeltas = {}
        for (var name in logBook.data) {
            avgs[name] = _.reduce(logBook.data[name],
                function (a, b) {return a + b;}) / logBook.data[name].length;
            maxDeltas[name] = _.max(_.map(logBook.data[name],
                function (datum) {return Math.abs(datum - avgs[name]);}));
        }
    }
    console.log(logBook.data, enoughData, avgs, maxDeltas);
    if (!enoughData) {
        return "You haven't filled up your lab notebook!  Make sure you get enough data so you know your results are accurate.";
    } else if (maxDeltas["Bowling Ball"] > 300) {
        return "One of your results for the bowling ball looks pretty far off!  Try getting some more data to make sure it was a fluke.";
    } else if (maxDeltas["Tennis Ball"] > 300) {
        return "One of your results for the tennis ball looks pretty far off!  Try getting some more data to make sure it was a fluke.";
    } else if (
            (state.hypothesis === "same"
                && Math.abs(avgs["Bowling Ball"] - avgs["Tennis Ball"]) > 100)
            || (state.hypothesis === "bowling"
                && avgs["Bowling Ball"] < avgs["Tennis Ball"] + 100)
            || (state.hypothesis === "tennis"
                && avgs["Tennis Ball"] < avgs["Bowling Ball"] + 100)
            ) {
        return "Those results don't look very consistent with your hypothesis.  It's fine if your hypothesis was disproven, that's how science works!";
    } else if (
            state.hypothesis !== "same"
            || avgs["Bowling Ball"] < 800
            || avgs["Bowling Ball"] > 1500
            || avgs["Tennis Ball"] < 800
            || avgs["Tennis Ball"] > 1500) {
        return "Those results are consistent, but they don't look quite right to me.  Make sure you're dropping the balls gently from the same height above the top sensor.";
    } else {
        return null;
    }
}

},{"./datachecker.jsx":7}],11:[function(require,module,exports){
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

},{"./check-collision":6,"./stopwatch":29}],12:[function(require,module,exports){

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


},{"./cangraph":4}],13:[function(require,module,exports){
var Base = require('./base');
var Gate = require('./gate');
var Stopwatch = require('./stopwatch');
var LogBook = require('./logbook');
var PlayPause = require('./playpause');
var HillsIntro = require('./intro/hills_intro.jsx');
var hillsDataChecker = require('./hillsdatachecker');
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
    dropObjects: function(callback) {
        this.ball = Physics.body('circle', {
            x: 250,
            y: 400,
            vx: -Math.random() * 0.1,
            radius: 20,
            mass: 900,
            cof: 0.1,
            restitution: 0.01,
            displayName: "Bowling Ball",
            styles: {
                image: "images/bowling_ball.png"
            }
        });
        this.world.add(this.ball);
        if (callback) {
            setTimeout(callback, 500);
        }
    },

   startWalkthrough: function () {
       HillsIntro(this, function (hypothesis) {
           console.log('Got the hypothesis!!', hypothesis);
           this.setupDataChecker(hypothesis);
       }.bind(this), this.options.debug === 'true')
   },

    setupDataChecker: function (hypothesis) {
        var dataChecker = document.createElement("div");
        dataChecker.className = "hills-data-checker";
        this.sideBar.appendChild(dataChecker);
        hillsDataChecker(dataChecker, this.logBook, hypothesis);
    },

    setupSlider: function (container) {
        this.slider = $('<input type="range" min="0" max="140" step="10" value="100"/>');
        this.sliderDisplay = $('<span>100 cm</span>');
        var handleSlide = function() {
            this.setupTerrain(200, this.slider.val());
            this.sliderDisplay.html(this.slider.val() + " cm");
        }.bind(this);
        this.slider.change(handleSlide).on('input', handleSlide);
        var div = $('<div class="hill-slider"/>');
        $(container).append(div);
        div.append(this.slider);
        div.append(this.sliderDisplay);
    },

    setupTerrain: function (rampHeight, hillHeight) {
        if (this.terrainCanvas) {
            this.terrainCanvas.clear();
        }
        if (this.terrainBehavior) {
            this.world.remove(this.terrainBehavior);
        }
        var terrainHeight = this.mkTerrainHeightFunction(rampHeight, hillHeight);
        this.terrainCanvas.draw(terrainHeight)
        this.terrainBehavior = Physics.behavior('terrain-collision-detection', {
            aabb: Physics.aabb(0, 0, this.options.width, this.options.height),
            terrainHeight: terrainHeight,
            restitution: 0.2,
            cof: 0.1
        });
        this.world.add(this.terrainBehavior);
    },

    mkTerrainHeightFunction: function (rampHeight, hillHeight) {
        var rampWidth = this.options.width / 4;
        var rampScale = rampHeight / Math.pow(rampWidth, 2);
        return function (x) {
            if (x < rampWidth) {
                return Math.pow(rampWidth - x, 2) * rampScale;
            } else if (x < 3 * rampWidth) {
                return hillHeight / 2 + Math.cos(Math.PI * x / rampWidth) * hillHeight / 2;
            } else {
                return 0;
            }
        };

    },

    setup: function (container) {
        var world = this.world
        var gravity = Physics.behavior('constant-acceleration')
        gravity.setAcceleration({x: 0, y:.0003});
        world.add(gravity);
        // register, but don't set up the behavior; that is done in setupTerrain()
        Physics.behavior('terrain-collision-detection', terrain);
        this.terrainCanvas = new CaveDraw($('#under-canvas'), 900, 700)
        this.setupTerrain(200, 100);

        var sideBar = this.sideBar = document.createElement("div");
        sideBar.className = "side-bar";
        container.appendChild(sideBar);
        var topGate = new Gate(world,
                               util.makeRect(0, 0, 10, 200),
                               [750, 600], null, {debug: true, show: true, color: 'green'});
        var bottomGate = new Gate(world,
                               util.makeRect(0, 0, 10, 200),
                               [800, 600], null, {debug: true, show: true, color: 'red'});
        var logColumns = [{name: "100 cm"}];
        var logBook = this.logBook = new LogBook(world, sideBar, 3, logColumns);
        topGate.on('enter', function(elem) {
            var colName = this.slider.val().toString() + " cm";
            logBook.handleStart(colName, elem.body.uid);
        }.bind(this));
        bottomGate.on('enter', function(elem) {
            var colName = this.slider.val().toString() + " cm";
            logBook.handleEnd(colName, elem.body.uid);
        }.bind(this));
        var buttonContainer = document.createElement("div");
        var playPause = new PlayPause(world, buttonContainer);
        container.appendChild(buttonContainer);
        this.setupSlider(buttonContainer);

        if (this.options.walk) {
           this.startWalkthrough()
        } else {
            this.dropObjects();
            this.setupDataChecker('same');
        }
    },

    /**
     * Pick up one the ball and drop it.
     *
     * @param callback Gets called when the demonstration is over.
     */
    demonstrateDrop: function(callback) {
        var ball = this.ball;
        var targetX = 20;
        var targetY = 495;

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

},{"./base":3,"./cavedraw":5,"./gate":11,"./hillsdatachecker":14,"./intro/hills_intro.jsx":17,"./logbook":21,"./playpause":27,"./stopwatch":29,"./terrain":30,"./util":32}],14:[function(require,module,exports){
var DataChecker = require('./datachecker.jsx');
var util = require('./util');

module.exports = hillsDataChecker;

var _initialText = "Do an experiment to see if you can figure out whether a ball which rolls over a hill comes out at a different speed, and let me know when you're done!";

var _nextURL = "?Bacon";

var _hypotheses = [
    {
        name: "same",
        buttonText: "The speed does not depend on the size of the hill.",
        text: "that the speed will not depend on the size of the hill",
    },
    {
        name: "faster",
        buttonText: "The ball comes out faster if the hill is larger.",
        text: "that the ball will come out faster if the hill is larger",
    },
    {
        name: "slower",
        buttonText: "The ball comes out slower if the hill is larger.",
        text: "that the ball will come out slower if the hill is larger",
    },
]

function hillsDataChecker(container, logBook, hypothesis) {
    return React.renderComponent(DataChecker({
        initialText: _initialText,
        initialHypothesis: hypothesis,
        possibleHypotheses: _hypotheses,
        result: function (state) {return _result(logBook, state);},
        nextURL: _nextURL,
    }), container);
}

function _result(logBook, state) {
    var cleanedData = {}
    for (var name in logBook.data) {
        if (logBook.data[name]) {
            var height = name.slice(0, -3); // remove " cm"
            cleanedData[height] = logBook.data[name];
        }
    }
    // check that they have enough data: at least 3 points each in at least 4
    // hill sizes, including one less than 50cm and one greater than 100cm.
    if (_.size(cleanedData) < 4) {
        return "You only have data for a few possible hills!  Make sure you have data on a number of possible hills so you know your results apply to any hill size.";
    } else if (_.filter(cleanedData, function (data, height) {return data.length >= 3;}).length < 4) {
        return "You only have a little bit of data for some of those possible hills.  Make sure you have several data points on a number of possible hills so you know your results apply to any hill size.";
    } else if (_.max(_.map(_.keys(cleanedData), parseInt)) <= 100) {
        return "You don't have any data for large hills!  Try collecting some data on large hills to make sure your results apply to them.";
    } else if (_.min(_.map(_.keys(cleanedData), parseInt)) >= 50) {
        return "You don't have any data for small hills!  Try collecting some data on small hills to make sure your results apply to them.";
    }

    // check that they don't have big outliers in any of their columns.
    var avgs = {}
    for (var height in cleanedData) {
        avgs[height] = util.avg(cleanedData[height]);
        if (_.any(cleanedData[height], function (datum) {return Math.abs(avgs[height] - parseInt(datum)) > 300;})) {
            return "One of your results for "+height+" cm looks a bit off!  Try collecting some more data to make sure it's a fluke."
        }
    }

    // check that their results are consistent with their hypothesis, and that
    // their hypothesis is correct.
    var transposed = _.zip.apply(_.pairs(avgs));
    var correlation = util.correlation(_.map(transposed[0], parseInt), transposed[1]);
    if (
            (state.hypothesis === "same"
                && Math.abs(_.max(_.values(avgs)) - _.min(_.values(avgs))) > 100)
            || (state.hypothesis === "faster"
                && correlation > -0.5) // negative correlation would be taller => shorter time => faster
            || (state.hypothesis === "slower"
                && correlation < 0.5)) {
        return "Those results don't look very consistent with your hypothesis.  It's fine if your hypothesis was disproven, that's how science works!";
    } else if (
            state.hypothesis !== "same"
            || _.max(_.values(avgs)) > 200
            || _.min(_.values(avgs)) < 140) {
        return "Those results are consistent, but they don't look quite right to me.  Make sure you're dropping the balls gently from the top of the ramp each time.";
    } else {
        return null;
    }
}

},{"./datachecker.jsx":7,"./util":32}],15:[function(require,module,exports){

module.exports = {
    Base: require('./base'),
    Bacon: require('./bacon.jsx'),
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

},{"./asteroids":1,"./bacon.jsx":2,"./base":3,"./cavedraw":5,"./demo":8,"./drop":9,"./hills":13,"./moon":22,"./newton1":24,"./orbit":26,"./slope":28,"./try-graph":31}],16:[function(require,module,exports){
/** @jsx React.DOM */

var Walkthrough = require('./walk-through.jsx')
var PT = React.PropTypes
var Step = require('./step.jsx')

module.exports = DropIntro;

function DropIntro(Exercise, gotHypothesis, debug) {
    var node = document.createElement('div')
    document.body.appendChild(node)
    React.renderComponent(Walkthrough({
        steps: steps,
        onHypothesis: gotHypothesis,
        onDone: function (hypothesis) {
            React.unmountComponentAtNode(node);
            node.parentNode.removeChild(node);
        },
        debug: debug,
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
                    props.debug ? props.onNext() : setTimeout(function () {
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
                    }, props.debug ? 500 : 2000);
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
                    props.debug ? props.onNext() : setTimeout(function () {
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
                }, props.debug ? 1000 : 5000);
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

},{"./step.jsx":19,"./walk-through.jsx":20}],17:[function(require,module,exports){
/** @jsx React.DOM */

var Walkthrough = require('./walk-through.jsx')
var PT = React.PropTypes
var Step = require('./step.jsx')

module.exports = HillsIntro;

function HillsIntro(Exercise, gotHypothesis, debug) {
    var node = document.createElement('div')
    document.body.appendChild(node)
    React.renderComponent(Walkthrough({
        steps: steps,
        onHypothesis: gotHypothesis,
        onDone: function (hypothesis) {
            React.unmountComponentAtNode(node);
            node.parentNode.removeChild(node);
        },
        debug: debug,
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
            title: "Ready for even more Science?",
            showBacon: true,
            body: "I have one more experiment for you.",
            next: "Let's do it!"
        }))
    },

    function (props) {
        var hypothesis = props.data.hypothesis
        return Step(_.extend(props, {
            id: 'description',
            title: "Experiment #3",
            onUpdate: function (prevProps) {
                if (this.props.data.hypothesis && !prevProps.data.hypothesis) {
                    props.onHypothesis(props.data.hypothesis);
                    props.debug ? props.onNext() : setTimeout(function () {
                        props.onNext()
                    }, 500)
                }
            },
            body: React.DOM.div(null, 
                React.DOM.p(null, "If a ball rolls over a hill, does the speed of the ball change?"
                ), 
                    React.DOM.img({src: "images/ballroll-diagram.png", width: "300px"}), 
                React.DOM.hr(null), 
                React.DOM.div({className: "large"}, "I think:", 
                    ButtonGroup({
                        className: "walkthrough_hypotheses", 
                        selected: hypothesis, 
                        onSelect: props.setData.bind(null, 'hypothesis'), 
                        options: [["faster", "It will come out going faster"],
                            ["slower", "It will come out going slower"],
                            ["same", "It will go the same speed"]]})
                )
                /**hypothesis && <p className="walkthrough_great">Great! Now we do science</p>**/
            )
        }))
    },

    function (props) {
        var prover = props.data.prover
        var hypothesis = props.data.hypothesis

        var responses = {
            'more': 'Nope. That would show that the ball comes out faster',
            'less': 'Nope. That would show that the ball comes out slower',
            'same': 'Nope. That would show that the ball comes out at the same speed',
        }
        var correct = {
            'faster': 'less',
            'slower': 'more',
            'same': 'same'
        }
        var proverResponse
        var isCorrect = prover === correct[hypothesis]

        if (prover) {
            if (isCorrect) {
                proverResponse = "Exactly! Now let's do the experiment."
            } else {
                proverResponse = responses[prover];
            }
        }

        var wordyHypothesis = {
            faster: 'faster',
            slower: 'slower',
            same: 'the same speed',
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
                React.DOM.p(null, "To prove that the ball comes out ", React.DOM.span({className: "uline"}, wordyHypothesis), ", we can measure the speed after it goes down a ramp and then over a hill of a given height."), 
                React.DOM.p(null, "Since we can't measure speed directly, we'll measure the time it takes for the ball to travel a short fixed distance."), 
                React.DOM.p(null, "Your hypothesis will be proven if when we roll a ball down a ramp, then over a larger hill, the ", React.DOM.span({className: "uline"}, "time it takes"), " for the ball to go a fixed distance is", 
                    ButtonGroup({
                        className: "btn-group", 
                        selected: prover, 
                        onSelect: props.setData.bind(null, 'prover'), 
                        options: [['less', 'less than'], ['more', 'more than'], ['same', 'the same as']]}), 
                    "the time it takes for the ball to go the same distance if it went over a smaller hill."
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
            body: React.DOM.p(null, "Here we have tools to conduct our experiment." + ' ' +
                     "The red and green sensors will record the time it takes for the ball to go a short fixed distance after going over the hill."),
            onRender: function () {
                props.Exercise.dropObjects(function () {
                    props.debug ? props.onNext() : setTimeout(function () {
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
            body: React.DOM.p(null, "We can test out this hypothesis by rolling a ball starting at the top of the ramp."),
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
            arrow: React.DOM.div({className: "arrow-to-hill-slider"}),
            body: React.DOM.p(null, "We can change the height of the hill here."),
            onRender: function () {
                setTimeout(function () {
                    props.onNext();
                }, props.debug ? 100 : 5000);
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

},{"./step.jsx":19,"./walk-through.jsx":20}],18:[function(require,module,exports){
/** @jsx React.DOM */

var Walkthrough = require('./walk-through.jsx')
var PT = React.PropTypes
var Step = require('./step.jsx')

module.exports = Newton1Intro;

function Newton1Intro(Exercise, gotHypothesis, debug) {
    var node = document.createElement('div')
    document.body.appendChild(node)
    React.renderComponent(Walkthrough({
        steps: steps,
        onHypothesis: gotHypothesis,
        onDone: function (hypothesis) {
            React.unmountComponentAtNode(node);
            node.parentNode.removeChild(node);
        },
        debug: debug,
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
            title: "Ready for more Science?",
            showBacon: true,
            body: "Let's get out of the lab. For this next experiment, I know just the place!",
            next: "Let's go!"
        }))
    },

    function (props) {
        return Step(_.extend(props, {
            id: 'space',
            style: 'black',
            title: "Space!",
            body: "The rules of science work everywhere, so discoveries we make " +
                "in space will also apply here on Earth. An important skill when " +
                "designing an experiment is avoiding things that could " +
                "interfere with the results. In space, we don't need " +
                "to worry about gravity or wind.",
            next: "Cool!"
        }))
    },

    function (props) {
        var hypothesis = props.data.hypothesis
        return Step(_.extend(props, {
            id: 'description',
            style: 'black',
            title: "Experiment #2",
            onUpdate: function (prevProps) {
                if (this.props.data.hypothesis && !prevProps.data.hypothesis) {
                    props.onHypothesis(props.data.hypothesis);
                    props.debug ? props.onNext() : setTimeout(function () {
                        props.onNext()
                    }, 500)
                }
            },
            body: React.DOM.div(null, 
                React.DOM.p(null, "What happens to a moving object if you leave it alone?"), 
                React.DOM.hr(null), 
                React.DOM.div({className: "large"}, "I think:", 
                    ButtonGroup({
                        className: "walkthrough_hypotheses", 
                        selected: hypothesis, 
                        onSelect: props.setData.bind(null, 'hypothesis'), 
                        options: [["faster", "It speeds up"],
                            ["slower", "It slows down"],
                            ["same", "It stays at the same speed forever"]]})
                )
                /**hypothesis && <p className="walkthrough_great">Great! Now we do science</p>**/
            )
        }))
    },

    function (props) {
        var prover = props.data.prover
        var hypothesis = props.data.hypothesis

        var responses = {
            'more': 'Nope. That would show that the object gets faster.',
            'less': 'Nope. That would show that the object gets slower.',
            'same': 'Nope. That would show that the object stays the same speed.'
        }
        var correct = {
            'faster': 'more',
            'slower': 'less',
            'same': 'same'
        }
        var proverResponse
        var isCorrect = prover === correct[hypothesis]

        if (prover) {
            if (isCorrect) {
                proverResponse = "Exactly! Now let's do the experiment."
            } else {
                proverResponse = responses[prover];
            }
        }

        var currentHypothesis = {
            faster: 'moving objects get faster over time',
            slower: 'moving objects get slower over time',
            same: "moving objects don't change in speed over time"
        }[hypothesis];

        return Step(_.extend(props, {
            id: 'design-experiment',
            style: 'black',
            title: 'Designing the Experiment',
            onUpdate: function (prevProps) {
                if (prover && isCorrect && prover !== prevProps.data.prover) {
                    setTimeout(function () {
                        props.onNext()
                    }, 2000);
                }
            },
            body: React.DOM.div(null, 
                React.DOM.p(null, "To prove that ", React.DOM.span({className: "uline"}, currentHypothesis), "," + ' ' +
                "we can measure the time that it takes for an asteroid to move 100 meters," + ' ' +
                "then measure the time to move another 100 meters."), 
                React.DOM.p(null, "Your hypothesis will be proven if the ", React.DOM.span({className: "uline"}, "time to travel the first 100m"), " is", 
                    ButtonGroup({
                        className: "btn-group", 
                        selected: prover, 
                        onSelect: props.setData.bind(null, 'prover'), 
                        options: [['less', 'less than'], ['more', 'more than'], ['same', 'the same as']]}), 
                    "the ", React.DOM.span({className: "uline"}, "time to travel the next 100m"), "."
                ), 
                prover && React.DOM.p({className: "design_response_white"}, proverResponse)
            )
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
            body: React.DOM.p(null, "We can test out this hypothesis by throwing an asteroid" + ' ' +
                     "through the green sensors, which are evenly-spaced. Try" + ' ' +
                     "throwing at different speeds!"),
            onRender: function () {
                props.Exercise.demonstrateSample(function () {
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
            arrow: React.DOM.div({className: "arrow-to-logbook-newton1"}),
            body: React.DOM.p(null, "Notice that both times show up in the log book."),
            onRender: function () {
                setTimeout(function () {
                    props.onNext();
                }, props.debug ? 100 : 5000);
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

},{"./step.jsx":19,"./walk-through.jsx":20}],19:[function(require,module,exports){
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

},{}],20:[function(require,module,exports){
/** @jsx React.DOM */

var WalkThrough = React.createClass({displayName: 'WalkThrough',
    propTypes: {
        steps: React.PropTypes.array.isRequired,
        onDone: React.PropTypes.func,
        debug: React.PropTypes.bool
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
            onFadedOut: this.onFadedOut,
            debug: this.props.debug
        }
        for (var name in this.props) {
            props[name] = this.props[name]
        }
        return Step(props)
    }
})

module.exports = WalkThrough


},{}],21:[function(require,module,exports){

var util = require('./util');

module.exports = LogBook;

function LogBook(world, elem, keep, seededColumns, hideAvg) {
    this._attach(world, elem, keep, seededColumns, hideAvg);
}

LogBook.prototype._attach = function (world, elem, keep, seededColumns, hideAvg) {
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
    this.hideAvg = hideAvg;

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
        if (!this.hideAvg) {
            var avg = clean(util.avg(this.data[colName]));
            $(this.columnsByBodyName[colName])
                .find('.log-book-avg').text('Avg: ' + avg);
        }
    }
}

LogBook.prototype.handleTick = function () {
    newTime = this.world._time;
    $.each(this.startTimeByBodyName, function (name, startTime) {
        this.renderTimer(name, newTime - startTime);
    }.bind(this));
}

LogBook.prototype.addColumn = function (name, extraText, color) {
    extraText = extraText || "";
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
    if (!this.hideAvg) {
        var average = document.createElement("div");
        average.className = 'log-book-avg';
        average.innerHTML = '--';
        column.appendChild(average);
    }
    this.insertColumn(name, column); // will insert it at the right point.
    this.columnsByBodyName[name] = column;
    this.data[name] = [];
    // seed the column with blanks
    for (var i = 0; i < this.keep; i++) {
        this.newTimer(name);
    }
}

LogBook.prototype.insertColumn = function (name, column) {
    // insert the column in order.  this is a bit arbitrary since we don't know
    // what the sort order should really be, so we just put strings without
    // numbers, then strings that start with a number.
    var keyfn = function (name) {
        // if the name starts with a number, sort by that, then the full name.
        // otherwise, put it after numbers, and sort by the full name.
        var num = parseInt(name);
        if (isNaN(num)) {
            num = Infinity;
        }
        return [num, name];
    }
    var inserted = false;
    $(this.bodyContainer).find(".log-book-heading").each(function (i, span) {
        var k1 = keyfn(name);
        var k2 = keyfn($(span).html());
        if (k1[0] < k2[0] || (k1[0] == k2[0] && k1[1] < k2[1])) {
            $(span).parent().before(column);
            console.log(span);
            inserted = true;
            return false; //break
        }
    });
    if (!inserted) {
        // if it's the biggest, put it at the end.
        this.bodyContainer.appendChild(column);
        console.log(this.bodyContainer);
    }
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

    if (!this.hideAvg) {
        var avg = clean(util.avg(this.data[name]));
        $(col).find('.log-book-avg').text('Avg: ' + avg);
    }

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

},{"./util":32}],22:[function(require,module,exports){
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

        

},{"./base":3,"./gate":11,"./graph":12,"./playpause":27,"./stopwatch":29}],23:[function(require,module,exports){
/** @jsx React.DOM */

var PT = React.PropTypes
var cx = React.addons.classSet

var NewAsteroidButton = React.createClass({displayName: 'NewAsteroidButton',
    propTypes: {
        onClick: PT.func,
    },

    render: function () {
        var className = cx({
            'asteroid-button': true,
        })

        return React.DOM.button({
            type: "button", 
            className: "new-asteroid-button", 
            onClick: this.props.onClick}, "New Asteroid")
    }
})

module.exports = NewAsteroidButton

},{}],24:[function(require,module,exports){
var Gate = require('./gate');
var Base = require('./base');
var Stopwatch = require('./stopwatch');
var PlayPause = require('./playpause');
var util = require('./util');
var LogBook = require('./logbook')
var Newton1Walkthrough = require('./intro/newton1_intro.jsx')
var NewAsteroidButton = require('./new-asteroid-button.jsx')
var newton1DataChecker = require('./newton1datachecker')

function random(min, max){
    return (Math.random() * (max-min) + min)|0
}

module.exports = Base.extend(function Asteroids(container, options) {
    Base.call(this, container, options, 'images/space_background.jpg',
        true /* disableBounds */)
}, {
    setup: function (container) {
        var world = this.world;
        this.activeAsteroid = null;
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
            {name: "Time 1", extraText: ""},
            {name: "Time 2", extraText: ""},
        ];
        var logBook = this.logBook = new LogBook(world, sideBar, 5, logColumns,
            true /* hideAvg */);
        gate1.on('enter', function(elem) {
            this.considerActiveAsteroidGC();
            var body = elem.body;
            if (!this.activeAsteroid) {
                this.activeAsteroid = body;
                logBook.handleStart("Time 1", body.uid);
                return true;
            } else {
                return false;
            }
        }.bind(this))
        gate2.on('enter', function(elem) {
            var body = elem.body;
            if (this.activeAsteroid == body) {
                logBook.handleEnd("Time 1", body.uid);
                logBook.handleStart("Time 2", body.uid);
            }
        }.bind(this))
        gate3.on('enter', function(elem) {
            var body = elem.body;
            if (this.activeAsteroid == body) {
                logBook.handleEnd("Time 2", elem.body.uid);
                this.activeAsteroid = null;
            }
        }.bind(this))

        var playPauseContainer = document.createElement("div");
        container.appendChild(playPauseContainer);
        var playPause = new PlayPause(world, playPauseContainer);
        this.createNewAsteroidButton(container)

        console.log('options: ' + this.options)
        if (this.options.walk) {
            Newton1Walkthrough(this, function (hypothesis) {
                this.setupDataChecker(hypothesis);
            }.bind(this), this.options.debug === 'true')
        } else {
            this.setupDataChecker('same');
        }
    },

    setupDataChecker: function(hypothesis) {
        var dataChecker = document.createElement("div");
        dataChecker.className = "newton1-data-checker";
        this.sideBar.appendChild(dataChecker);
        newton1DataChecker(dataChecker, this.logBook, hypothesis);
    },

    createNewAsteroidButton: function(container) {
        var element = $('<div/>')
        $(container).append(element)
        React.renderComponent(NewAsteroidButton({
            onClick: function() {
                this.handleNewAsteroid();
                event.preventDefault();
            }.bind(this)
        }), element[0])

        // var newAsteroidLink = document.createElement("a");
        // newAsteroidLink.href = "#";
        // newAsteroidLink.innerHTML = "New asteroid";
        // newAsteroidLink.addEventListener("click", function (event) {
            // this.handleNewAsteroid();
            // event.preventDefault();
        // }.bind(this));
        // return newAsteroidLink;
    },

    considerActiveAsteroidGC: function() {
        if (this.activeAsteroid) {
            var x = this.activeAsteroid.state.pos.x;
            var y = this.activeAsteroid.state.pos.y;
            if (x < 100 || x > 1000 || y < 100 || y > 800) {
                this.activeAsteroid = null;
            }
        }
    },

    handleNewAsteroid: function() {
        var world = this.world;

        var minX = 50;
        var maxX = 300;
        var minY = 50;
        var maxY = 650;
        var minAngle = 0;
        var maxAngle = 2*Math.PI;

        var body = Physics.body('circle', {
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
        });
        if (!this.firstAsteroid) {
            this.firstAsteroid = body;
        }
        world.add(body);
    },

    demonstrateSample: function(onDone) {
        var asteroid = this.firstAsteroid;
        var targetX = 200;
        var targetY = 350;

        asteroid.treatment = 'kinematic';
        asteroid.state.vel.x = (targetX - asteroid.state.pos.x) / 1500;
        asteroid.state.vel.y = (targetY - asteroid.state.pos.y) / 1500;
        asteroid.recalc();

        setTimeout(function() {
            asteroid.treatment = 'dynamic';
            asteroid.state.pos.x = targetX;
            asteroid.state.pos.y = targetY;
            asteroid.state.vel.x = 0.2;
            asteroid.state.vel.y = 0;
            asteroid.recalc();

            setTimeout(function() {
                asteroid.treatment = 'dynamic';
                asteroid.recalc();
                setTimeout(function() {
                    onDone();
                }, 3000)
            }, 1500)
        }, 1500)
    }
});

},{"./base":3,"./gate":11,"./intro/newton1_intro.jsx":18,"./logbook":21,"./new-asteroid-button.jsx":23,"./newton1datachecker":25,"./playpause":27,"./stopwatch":29,"./util":32}],25:[function(require,module,exports){
var DataChecker = require('./datachecker.jsx');

module.exports = dropDataChecker;

var _initialText = "Do an experiment to determine how asteroids behave, and let me know when you're done.";

var _nextURL = "?Hills&walk=true"

var _hypotheses = [
    {
        name: "faster",
        buttonText: "The asteroids get faster.",
        text: "that the asteroids will get faster",
    },
    {
        name: "slower",
        buttonText: "The asteroids get slower.",
        text: "that the asteroids will get slower",
    },
    {
        name: "same",
        buttonText: "The asteroids stay the same speed.",
        text: "that the asteroids will stay the same speed",
    },
];

function dropDataChecker(container, logBook, hypothesis) {
    return React.renderComponent(DataChecker({
        initialText: _initialText,
        initialHypothesis: hypothesis,
        possibleHypotheses: _hypotheses,
        result: function (state) {return _result(logBook, state);},
        nextURL: _nextURL,
    }), container);
}

function _result(logBook, state) {
    // we return the error, or null if they're correct
    var enoughData = _.all(logBook.data, function (d) {return d.length >= 5;});
    var dataIsGood = true;
    for (var i = 0; i < 5; i++) {
        var val1 = logBook.data["Time 1"][i];
        var val2 = logBook.data["Time 2"][i];
        var minVal = Math.min(val1, val2);
        var maxVal = Math.max(val1, val2);
        if (maxVal / minVal > 1.2) {
            dataIsGood = false;
            break;
        }
    }

    if (enoughData) {
        var avgs = {}
        var maxDeltas = {}
        for (var name in logBook.data) {
            avgs[name] = _.reduce(logBook.data[name],
                function (a, b) {return a + b;}) / logBook.data[name].length;
            maxDeltas[name] = _.max(_.map(logBook.data[name],
                function (datum) {return Math.abs(datum - avgs[name]);}));
        }
    }
    console.log(logBook.data, enoughData, avgs, maxDeltas);
    if (!enoughData) {
        return "You haven't filled up your lab notebook!  Make sure you get enough data so you know your results are accurate.";
    } else if (state.hypothesis != "same" || !dataIsGood) {
        return "Those results don't look right to me. Make sure you're letting " +
            "the asteroids glide through all three gates without interfering with them."
    } else {
        return null;
    }
}

},{"./datachecker.jsx":7}],26:[function(require,module,exports){
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

        

},{"./base":3,"./gate":11,"./playpause":27,"./stopwatch":29}],27:[function(require,module,exports){
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



},{}],28:[function(require,module,exports){
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


},{"./base":3,"./gate":11,"./playpause":27,"./stopwatch":29,"./util":32}],29:[function(require,module,exports){

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

},{}],30:[function(require,module,exports){
module.exports = terrain;

function terrain( parent ){
    // mostly copied from the edge-collision-detection behavior.
    // WARNING: this currently only works correctly for circles.
    // getFarthestHullPoint doesn't actually do what I want it to, so I will
    // need to extend geometry to support what I want.

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
        if (aabb.y > bounds.max.y - terrainHeight(aabb.x)) {
            // if the center somehow gets below the terrain, always push straight up.
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

},{}],31:[function(require,module,exports){

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


},{"./base":3,"./graph":12}],32:[function(require,module,exports){
module.exports = {
    makeRect: makeRect,
    makeRock: makeRock,
    sum: sum,
    avg: avg,
    stdev: stdev,
    correlation: correlation,
}

function sum(numbers) {
    if (!numbers.length) return 0;
    return numbers.reduce(function (a, b) {return a + b})
}

function avg(numbers) {
    if (!numbers.length) return 0;
    return sum(numbers) / numbers.length
}

function stdev(numbers) {
    if (!numbers.length) return 0;
    var a = avg(numbers);
    return Math.sqrt(avg(_.map(numbers, function (num) {return Math.pow(num - a, 2);})))
}

function correlation(data1, data2) {
    if (!data1.length || data1.length != data2.length) return 0;
    var avg1 = avg(data1);
    var avg2 = avg(data2);
    var covariance = avg(_.map(
        _.zip(data1, data2), 
        function (dataPair) {return (dataPair[0] - avg1) * (dataPair[1] - avg2);}));
    return covariance / (stdev(data1) * stdev(data2));
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

},{}],33:[function(require,module,exports){

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
    options.walk = 'true';
}
console.log(name, options)

window.BKA = new bakhan[name](node, options);
window.BKA.run();

},{"./lib":15}]},{},[33])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi91c3IvbG9jYWwvbGliL25vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2FsYW4vaGFja2F0aG9uL2Jha2hhbi9saWIvYXN0ZXJvaWRzLmpzIiwiL1VzZXJzL2FsYW4vaGFja2F0aG9uL2Jha2hhbi9saWIvYmFjb24uanN4IiwiL1VzZXJzL2FsYW4vaGFja2F0aG9uL2Jha2hhbi9saWIvYmFzZS5qcyIsIi9Vc2Vycy9hbGFuL2hhY2thdGhvbi9iYWtoYW4vbGliL2NhbmdyYXBoLmpzIiwiL1VzZXJzL2FsYW4vaGFja2F0aG9uL2Jha2hhbi9saWIvY2F2ZWRyYXcuanMiLCIvVXNlcnMvYWxhbi9oYWNrYXRob24vYmFraGFuL2xpYi9jaGVjay1jb2xsaXNpb24uanMiLCIvVXNlcnMvYWxhbi9oYWNrYXRob24vYmFraGFuL2xpYi9kYXRhY2hlY2tlci5qc3giLCIvVXNlcnMvYWxhbi9oYWNrYXRob24vYmFraGFuL2xpYi9kZW1vLmpzIiwiL1VzZXJzL2FsYW4vaGFja2F0aG9uL2Jha2hhbi9saWIvZHJvcC5qcyIsIi9Vc2Vycy9hbGFuL2hhY2thdGhvbi9iYWtoYW4vbGliL2Ryb3BkYXRhY2hlY2tlci5qcyIsIi9Vc2Vycy9hbGFuL2hhY2thdGhvbi9iYWtoYW4vbGliL2dhdGUuanMiLCIvVXNlcnMvYWxhbi9oYWNrYXRob24vYmFraGFuL2xpYi9ncmFwaC5qcyIsIi9Vc2Vycy9hbGFuL2hhY2thdGhvbi9iYWtoYW4vbGliL2hpbGxzLmpzIiwiL1VzZXJzL2FsYW4vaGFja2F0aG9uL2Jha2hhbi9saWIvaGlsbHNkYXRhY2hlY2tlci5qcyIsIi9Vc2Vycy9hbGFuL2hhY2thdGhvbi9iYWtoYW4vbGliL2luZGV4LmpzIiwiL1VzZXJzL2FsYW4vaGFja2F0aG9uL2Jha2hhbi9saWIvaW50cm8vZHJvcF9pbnRyby5qc3giLCIvVXNlcnMvYWxhbi9oYWNrYXRob24vYmFraGFuL2xpYi9pbnRyby9oaWxsc19pbnRyby5qc3giLCIvVXNlcnMvYWxhbi9oYWNrYXRob24vYmFraGFuL2xpYi9pbnRyby9uZXd0b24xX2ludHJvLmpzeCIsIi9Vc2Vycy9hbGFuL2hhY2thdGhvbi9iYWtoYW4vbGliL2ludHJvL3N0ZXAuanN4IiwiL1VzZXJzL2FsYW4vaGFja2F0aG9uL2Jha2hhbi9saWIvaW50cm8vd2Fsay10aHJvdWdoLmpzeCIsIi9Vc2Vycy9hbGFuL2hhY2thdGhvbi9iYWtoYW4vbGliL2xvZ2Jvb2suanMiLCIvVXNlcnMvYWxhbi9oYWNrYXRob24vYmFraGFuL2xpYi9tb29uLmpzIiwiL1VzZXJzL2FsYW4vaGFja2F0aG9uL2Jha2hhbi9saWIvbmV3LWFzdGVyb2lkLWJ1dHRvbi5qc3giLCIvVXNlcnMvYWxhbi9oYWNrYXRob24vYmFraGFuL2xpYi9uZXd0b24xLmpzIiwiL1VzZXJzL2FsYW4vaGFja2F0aG9uL2Jha2hhbi9saWIvbmV3dG9uMWRhdGFjaGVja2VyLmpzIiwiL1VzZXJzL2FsYW4vaGFja2F0aG9uL2Jha2hhbi9saWIvb3JiaXQuanMiLCIvVXNlcnMvYWxhbi9oYWNrYXRob24vYmFraGFuL2xpYi9wbGF5cGF1c2UuanMiLCIvVXNlcnMvYWxhbi9oYWNrYXRob24vYmFraGFuL2xpYi9zbG9wZS5qcyIsIi9Vc2Vycy9hbGFuL2hhY2thdGhvbi9iYWtoYW4vbGliL3N0b3B3YXRjaC5qcyIsIi9Vc2Vycy9hbGFuL2hhY2thdGhvbi9iYWtoYW4vbGliL3RlcnJhaW4uanMiLCIvVXNlcnMvYWxhbi9oYWNrYXRob24vYmFraGFuL2xpYi90cnktZ3JhcGguanMiLCIvVXNlcnMvYWxhbi9oYWNrYXRob24vYmFraGFuL2xpYi91dGlsLmpzIiwiL1VzZXJzL2FsYW4vaGFja2F0aG9uL2Jha2hhbi9ydW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0tBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDclBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDak5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIEdhdGUgPSByZXF1aXJlKCcuL2dhdGUnKTtcbnZhciBCYXNlID0gcmVxdWlyZSgnLi9iYXNlJyk7XG52YXIgU3RvcHdhdGNoID0gcmVxdWlyZSgnLi9zdG9wd2F0Y2gnKTtcbnZhciBQbGF5UGF1c2UgPSByZXF1aXJlKCcuL3BsYXlwYXVzZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2UuZXh0ZW5kKGZ1bmN0aW9uIEFzdGVyb2lkcyhjb250YWluZXIsIG9wdGlvbnMpIHtcbiAgICBCYXNlLmNhbGwodGhpcywgY29udGFpbmVyLCBvcHRpb25zLCAnaW1hZ2VzL3NwYWNlX2JhY2tncm91bmQuanBnJyxcbiAgICAgICAgdHJ1ZSlcbn0sIHtcbiAgICBzZXR1cDogZnVuY3Rpb24gKGNvbnRhaW5lcikge1xuICAgICAgICB2YXIgd29ybGQgPSB0aGlzLndvcmxkO1xuICAgICAgICB3b3JsZC5hZGQoUGh5c2ljcy5ib2R5KCdjaXJjbGUnLCB7XG4gICAgICAgICAgICB4OiA0MDBcbiAgICAgICAgICAgICx5OiAzNTBcbiAgICAgICAgICAgICx2eDogLTEuMy81MFxuICAgICAgICAgICAgLHJhZGl1czogMTBcbiAgICAgICAgICAgICxtYXNzOiAxMDAwXG4gICAgICAgICAgICAscmVzdGl0dXRpb246IDBcbiAgICAgICAgICAgICxzdHlsZXM6IHtcbiAgICAgICAgICAgICAgICBmaWxsU3R5bGU6ICcjZmZjYzAwJ1xuICAgICAgICAgICAgICAgICxhbmdsZUluZGljYXRvcjogJyMxNTU0NzknXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pKTtcbiAgICAgICAgd29ybGQuYWRkKFBoeXNpY3MuYm9keSgnY2lyY2xlJywge1xuICAgICAgICAgICAgeDogNDAwXG4gICAgICAgICAgICAseTogNTBcbiAgICAgICAgICAgICx2eDogMS4zXG4gICAgICAgICAgICAscmFkaXVzOiA1XG4gICAgICAgICAgICAsbWFzczogMjBcbiAgICAgICAgICAgICxyZXN0aXR1dGlvbjogMFxuICAgICAgICAgICAgLHN0eWxlczoge1xuICAgICAgICAgICAgICAgIGZpbGxTdHlsZTogJyMyNmViNjInIC8vZ3JlZW5cbiAgICAgICAgICAgICAgICAsYW5nbGVJbmRpY2F0b3I6ICcjMTU1NDc5J1xuICAgICAgICAgICAgfVxuICAgICAgICB9KSk7XG4gICAgICAgIHdvcmxkLmFkZChQaHlzaWNzLmJlaGF2aW9yKCduZXd0b25pYW4nLCB7IHN0cmVuZ3RoOiAuNSB9KSk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMTAwOyBpKyspIHtcbiAgICAgICAgICAgIHZhciByID0gTWF0aC5yYW5kb20oKSAqIDEwICsgMjk1O1xuICAgICAgICAgICAgdmFyIHRoID0gKC0xLzYgLSAwLjAwNSArIE1hdGgucmFuZG9tKCkgKiAwLjAxKSAqIE1hdGguUEk7XG4gICAgICAgICAgICB3b3JsZC5hZGQoUGh5c2ljcy5ib2R5KCdjaXJjbGUnLCB7XG4gICAgICAgICAgICAgICAgeDogTWF0aC5jb3ModGgpICogciArIDQwMFxuICAgICAgICAgICAgICAgICx5OiBNYXRoLnNpbih0aCkgKiByICsgMzUwXG4gICAgICAgICAgICAgICAgLHZ4OiAtMS4zICogTWF0aC5zaW4odGgpXG4gICAgICAgICAgICAgICAgLHZ5OiAxLjMgKiBNYXRoLmNvcyh0aClcbiAgICAgICAgICAgICAgICAscmFkaXVzOiAyXG4gICAgICAgICAgICAgICAgLG1hc3M6IE1hdGgucG93KDEwLCBNYXRoLnJhbmRvbSgpICogMikgKiAwLjAwMDAxXG4gICAgICAgICAgICAgICAgLHJlc3RpdHV0aW9uOiAwXG4gICAgICAgICAgICAgICAgLHN0eWxlczoge1xuICAgICAgICAgICAgICAgICAgICBmaWxsU3R5bGU6ICcjZGQyMjIyJyAvL3JlZFxuICAgICAgICAgICAgICAgICAgICAsYW5nbGVJbmRpY2F0b3I6ICcjMTU1NDc5J1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBidXR0b25Db250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoYnV0dG9uQ29udGFpbmVyKTtcbiAgICAgICAgdmFyIHBsYXlQYXVzZSA9IG5ldyBQbGF5UGF1c2Uod29ybGQsIGJ1dHRvbkNvbnRhaW5lcik7XG4gICAgfVxufSk7XG5cbiAgICAgICAgXG4iLCIvKiogQGpzeCBSZWFjdC5ET00gKi9cblxudmFyIFdhbGt0aHJvdWdoID0gcmVxdWlyZSgnLi9pbnRyby93YWxrLXRocm91Z2guanN4JylcbnZhciBTdGVwID0gcmVxdWlyZSgnLi9pbnRyby9zdGVwLmpzeCcpXG5cbm1vZHVsZS5leHBvcnRzID0gQmFjb247XG5cbmZ1bmN0aW9uIEJhY29uKGNvbnRhaW5lciwgb3B0aW9ucykge1xuICAgIHZhciBub2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChub2RlKTtcbiAgICBSZWFjdC5yZW5kZXJDb21wb25lbnQoV2Fsa3Rocm91Z2goe1xuICAgICAgICBzdGVwczogc3RlcHMsXG4gICAgfSksIG5vZGUpO1xufVxuXG5CYWNvbi5wcm90b3R5cGUgPSB7XG4gICAgcnVuOiBmdW5jdGlvbiAoKSB7fSxcbn07XG5cbnZhciBzdGVwcyA9IFtcbiAgICBmdW5jdGlvbiAocHJvcHMpIHtcbiAgICAgICAgcmV0dXJuIFN0ZXAoXy5leHRlbmQocHJvcHMsIHtcbiAgICAgICAgICAgIGlkOiAnY29uZ3JhdHMnLFxuICAgICAgICAgICAgdGl0bGU6IFwiQ29uZ3JhdHVsYXRpb25zIVwiLFxuICAgICAgICAgICAgc2hvd0JhY29uOiB0cnVlLFxuICAgICAgICAgICAgYm9keTogUmVhY3QuRE9NLmRpdihudWxsLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00ucChudWxsLCBcIlRoYXQgd2FzIHNvbWUgYXdlc29tZSBTY2llbmNlIHlvdSBkaWQgdGhlcmUhICBZb3UndmUgZmluaXNoZWQgYWxsIG9mIG15IGV4cGVyaW1lbnRzLiBZb3UgZWFybmVkIHRoZSBcIiwgUmVhY3QuRE9NLnN0cm9uZyhudWxsLCBcIkJhY29uIEJhZGdlXCIpLCBcIiBmb3IgeW91ciB3b3JrLlwiKSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLnAoe2NsYXNzTmFtZTogXCJiYWNvbi1iYWRnZS1jb250YWluZXJcIn0sIFJlYWN0LkRPTS5pbWcoe2NsYXNzTmFtZTogXCJiYWNvbi1iYWRnZVwiLCBzcmM6IFwiL2ltYWdlcy9iYWNvbi5wbmdcIn0pKVxuICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIG5leHQ6IFwiV2hhdCdzIG5leHQ/XCJcbiAgICAgICAgfSkpO1xuICAgIH0sXG5cbiAgICBmdW5jdGlvbiAocHJvcHMpIHtcbiAgICAgICAgcmV0dXJuIFN0ZXAoXy5leHRlbmQocHJvcHMsIHtcbiAgICAgICAgICAgIGlkOiAnbmV4dCcsXG4gICAgICAgICAgICB0aXRsZTogXCJEbyBtb3JlIHNjaWVuY2UhXCIsXG4gICAgICAgICAgICBzaG93QmFjb246IHRydWUsXG4gICAgICAgICAgICBib2R5OiBSZWFjdC5ET00uZGl2KG51bGwsIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5wKG51bGwsIFwiSWYgeW91IHdhbnQgdG8gbGVhcm4gbW9yZSBzY2llbmNlLCBjaGVjayBvdXQgdGhlIFwiLCBSZWFjdC5ET00uYSh7aHJlZjogXCIvL2toYW5hY2FkZW15Lm9yZy9zY2llbmNlL3BoeXNpY3NcIn0sIFwicGh5c2ljc1wiKSwgXCIgc2VjdGlvbiBvbiBLaGFuIEFjYWRlbXkuICBIYXZlIGZ1biFcIilcbiAgICAgICAgICAgICksXG4gICAgICAgIH0pKTtcbiAgICB9LFxuXTtcbiIsIlxubW9kdWxlLmV4cG9ydHMgPSBCYXNlO1xuXG5mdW5jdGlvbiBCYXNlKGNvbnRhaW5lciwgb3B0aW9ucywgYmFja2dyb3VuZCwgZGlzYWJsZUJvdW5kcykge1xuICAgIHRoaXMuY29udGFpbmVyID0gY29udGFpbmVyXG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9uc1xuICAgICQoJy5iYWNrZ3JvdW5kJykuYXR0cignc3JjJywgYmFja2dyb3VuZCk7XG4gICAgdGhpcy5fc2V0dXBXb3JsZChkaXNhYmxlQm91bmRzKVxuICAgIHRoaXMuc2V0dXAoY29udGFpbmVyKVxuICAgIC8vIGluaXQgc3R1ZmZcbn1cblxuQmFzZS5leHRlbmQgPSBmdW5jdGlvbiAoc3ViLCBwcm90bykge1xuICAgIHN1Yi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEJhc2UucHJvdG90eXBlKVxuICAgIHN1Yi5jb25zdHJ1Y3RvciA9IHN1YlxuICAgIGZvciAodmFyIG5hbWUgaW4gcHJvdG8pIHtcbiAgICAgICAgaWYgKHByb3RvLmhhc093blByb3BlcnR5KG5hbWUpKSB7XG4gICAgICAgICAgICBzdWIucHJvdG90eXBlW25hbWVdID0gcHJvdG9bbmFtZV1cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gc3ViXG59XG5cbkJhc2UucHJvdG90eXBlID0ge1xuXG4gICAgX3NldHVwV29ybGQ6IGZ1bmN0aW9uIChkaXNhYmxlQm91bmRzKSB7XG4gICAgICAgIHZhciB3b3JsZCA9IHRoaXMud29ybGQgPSBQaHlzaWNzKClcbiAgICAgICAgLy8gY3JlYXRlIGEgcmVuZGVyZXJcbiAgICAgICAgdGhpcy5yZW5kZXJlciA9IFBoeXNpY3MucmVuZGVyZXIoJ2NhbnZhcycsIHtcbiAgICAgICAgICAgIGVsOiB0aGlzLmNvbnRhaW5lcixcbiAgICAgICAgICAgIHdpZHRoOiB0aGlzLm9wdGlvbnMud2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQ6IHRoaXMub3B0aW9ucy5oZWlnaHRcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMud29ybGQuYWRkKHRoaXMucmVuZGVyZXIpO1xuXG4gICAgICAgIC8vIGFkZCB0aGluZ3MgdG8gdGhlIHdvcmxkXG4gICAgICAgIHRoaXMud29ybGQuYWRkKFtcbiAgICAgICAgICAgIFBoeXNpY3MuYmVoYXZpb3IoJ2ludGVyYWN0aXZlLWZvcmNlJywgeyBlbDogdGhpcy5yZW5kZXJlci5lbCB9KSxcbiAgICAgICAgICAgIFBoeXNpY3MuYmVoYXZpb3IoJ2JvZHktaW1wdWxzZS1yZXNwb25zZScpLFxuICAgICAgICAgICAgUGh5c2ljcy5iZWhhdmlvcignYm9keS1jb2xsaXNpb24tZGV0ZWN0aW9uJyksXG4gICAgICAgICAgICBQaHlzaWNzLmJlaGF2aW9yKCdzd2VlcC1wcnVuZScpLFxuICAgICAgICBdKTtcblxuICAgICAgICBpZiAoIWRpc2FibGVCb3VuZHMpIHtcbiAgICAgICAgICAgIHRoaXMud29ybGQuYWRkKFBoeXNpY3MuYmVoYXZpb3IoJ2VkZ2UtY29sbGlzaW9uLWRldGVjdGlvbicsIHtcbiAgICAgICAgICAgICAgICBhYWJiOiBQaHlzaWNzLmFhYmIoMCwgMCwgdGhpcy5vcHRpb25zLndpZHRoLCB0aGlzLm9wdGlvbnMuaGVpZ2h0KSxcbiAgICAgICAgICAgICAgICByZXN0aXR1dGlvbjogMC4yLFxuICAgICAgICAgICAgICAgIGNvZjogMC44XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH1cblxuXG4gICAgICAgIC8vIHJlbmRlciBvbiBlYWNoIHN0ZXBcbiAgICAgICAgd29ybGQub24oJ3N0ZXAnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB3b3JsZC5yZW5kZXIoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gc3Vic2NyaWJlIHRvIHRpY2tlciB0byBhZHZhbmNlIHRoZSBzaW11bGF0aW9uXG4gICAgICAgIFBoeXNpY3MudXRpbC50aWNrZXIub24oZnVuY3Rpb24oIHRpbWUgKSB7XG4gICAgICAgICAgICB3b3JsZC5zdGVwKCB0aW1lICk7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBydW46IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8gc3RhcnQgdGhlIHRpY2tlclxuICAgICAgICBQaHlzaWNzLnV0aWwudGlja2VyLnN0YXJ0KCk7XG4gICAgfVxufVxuIiwiXG5tb2R1bGUuZXhwb3J0cyA9IENhbkdyYXBoXG5cbmZ1bmN0aW9uIENhbkdyYXBoKG9wdGlvbnMpIHtcbiAgICB0aGlzLm8gPSBfLmV4dGVuZCh7XG4gICAgICAgIG1heDogNTAwLFxuICAgICAgICBtYXJnaW46IDEwLFxuICAgICAgICBtaW5zY2FsZTogMSxcbiAgICAgICAgdGlja3NjYWxlOiA1MFxuICAgIH0sIG9wdGlvbnMpXG4gICAgdGhpcy5wb2ludHMgPSBbXVxuICAgIHRoaXMucHJldnNjYWxlID0gdGhpcy5vLm1pbnNjYWxlXG4gICAgdGhpcy5vZmYgPSAwXG59XG5cbkNhbkdyYXBoLnByb3RvdHlwZSA9IHtcbiAgICBkcmF3OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICghdGhpcy5wb2ludHMubGVuZ3RoKSByZXR1cm5cbiAgICAgICAgdmFyIGN0eCA9IHRoaXMuby5ub2RlLmdldENvbnRleHQoJzJkJylcbiAgICAgICAgdmFyIHdpZHRoID0gdGhpcy5vLndpZHRoIC0gdGhpcy5vLm1hcmdpbioyXG4gICAgICAgIHZhciBoZWlnaHQgPSB0aGlzLm8uaGVpZ2h0IC0gdGhpcy5vLm1hcmdpbioyXG4gICAgICAgIHZhciB0b3AgPSB0aGlzLm8udG9wICsgdGhpcy5vLm1hcmdpblxuICAgICAgICB2YXIgbGVmdCA9IHRoaXMuby5sZWZ0ICsgdGhpcy5vLm1hcmdpblxuXG4gICAgICAgIHZhciBkeCA9IHdpZHRoIC8gdGhpcy5wb2ludHMubGVuZ3RoXG4gICAgICAgIHZhciBtaW4gPSBNYXRoLm1pbi5hcHBseShNYXRoLCB0aGlzLnBvaW50cylcbiAgICAgICAgdmFyIG1heCA9IE1hdGgubWF4LmFwcGx5KE1hdGgsIHRoaXMucG9pbnRzKVxuICAgICAgICB2YXIgc2NhbGUgPSBtYXggLSBtaW5cbiAgICAgICAgaWYgKHNjYWxlIDwgdGhpcy5vLm1pbnNjYWxlKSB7XG4gICAgICAgICAgICBzY2FsZSA9IHRoaXMuby5taW5zY2FsZVxuICAgICAgICB9XG4gICAgICAgIGlmIChzY2FsZSA8IHRoaXMucHJldnNjYWxlKi45OSkge1xuICAgICAgICAgICAgc2NhbGUgPSB0aGlzLnByZXZzY2FsZSouOTlcbiAgICAgICAgfVxuICAgICAgICB2YXIgZHkgPSBoZWlnaHQgLyBzY2FsZVxuICAgICAgICBpZiAobWF4IC0gbWluIDwgc2NhbGUpIHtcbiAgICAgICAgICAgIHZhciBkID0gc2NhbGUgLSAobWF4LW1pbilcbiAgICAgICAgICAgIG1pbiAtPSBkLzJcbiAgICAgICAgICAgIG1heCArPSBkLzJcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMucHJldnNjYWxlID0gc2NhbGVcblxuICAgICAgICAvLyBkcmF3IHggYXhpc1xuICAgICAgICBpZiAobWluIDw9IDAgJiYgbWF4ID49IDApIHtcbiAgICAgICAgICAgIGN0eC5iZWdpblBhdGgoKVxuICAgICAgICAgICAgY3R4Lm1vdmVUbyhsZWZ0LCB0b3AgKyBoZWlnaHQgLSAoLW1pbikqZHkpXG4gICAgICAgICAgICBjdHgubGluZVRvKGxlZnQgKyB3aWR0aCwgdG9wICsgaGVpZ2h0IC0gKC1taW4pKmR5KVxuICAgICAgICAgICAgY3R4LnN0cm9rZVN0eWxlID0gJyNjY2MnXG4gICAgICAgICAgICBjdHguc3Ryb2tlKClcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGRyYXcgdGlja3NcbiAgICAgICAgdmFyIHRpY2t0b3AgPSB0b3AgKyBoZWlnaHQgLSAoLW1pbikqZHkgLSA1XG4gICAgICAgIGlmICh0aWNrdG9wIDwgdG9wKSB7XG4gICAgICAgICAgICB0aWNrdG9wID0gdG9wXG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRpY2t0b3AgKyAxMCA+IHRvcCArIGhlaWdodCkge1xuICAgICAgICAgICAgdGlja3RvcCA9IHRvcCArIGhlaWdodCAtIDEwXG4gICAgICAgIH1cbiAgICAgICAgZm9yICh2YXIgaT10aGlzLm9mZjsgaTx0aGlzLnBvaW50cy5sZW5ndGg7IGkrPXRoaXMuby50aWNrc2NhbGUpIHtcbiAgICAgICAgICAgIGN0eC5iZWdpblBhdGgoKVxuICAgICAgICAgICAgY3R4Lm1vdmVUbyhsZWZ0ICsgaSpkeCwgdGlja3RvcClcbiAgICAgICAgICAgIGN0eC5saW5lVG8obGVmdCArIGkqZHgsIHRpY2t0b3AgKyAxMClcbiAgICAgICAgICAgIGN0eC5zdHJva2VTdHlsZSA9ICcjY2NjJ1xuICAgICAgICAgICAgY3R4LnN0cm9rZSgpXG4gICAgICAgIH1cblxuXG4gICAgICAgIC8vIGRyYXcgbGluZVxuICAgICAgICBjdHguYmVnaW5QYXRoKClcbiAgICAgICAgdGhpcy5wb2ludHMubWFwKGZ1bmN0aW9uIChwLCB4KSB7XG4gICAgICAgICAgICBjdHgubGluZVRvKGxlZnQgKyB4ICogZHgsIHRvcCArIGhlaWdodCAtIChwIC0gbWluKSAqIGR5KVxuICAgICAgICB9KVxuICAgICAgICBjdHguc3Ryb2tlU3R5bGUgPSAnYmx1ZSdcbiAgICAgICAgY3R4LmxpbmVXaWR0aCA9IDFcbiAgICAgICAgY3R4LnN0cm9rZSgpXG5cbiAgICAgICAgLy8gZHJhdyB0aXRsZVxuICAgICAgICB2YXIgdGggPSAxMFxuICAgICAgICBjdHguZm9udCA9IHRoICsgJ3B0IEFyaWFsJ1xuICAgICAgICB2YXIgdHcgPSBjdHgubWVhc3VyZVRleHQodGhpcy5vLnRpdGxlKS53aWR0aFxuICAgICAgICBjdHguZmlsbFN0eWxlID0gJ2JsYWNrJ1xuICAgICAgICBjdHguZ2xvYmFsQWxwaGEgPSAxXG4gICAgICAgIGN0eC5jbGVhclJlY3QobGVmdCwgdG9wLCB0dywgdGggKyA1KVxuICAgICAgICBjdHguZmlsbFRleHQodGhpcy5vLnRpdGxlLCBsZWZ0LCB0b3AgKyB0aClcblxuXG4gICAgICAgIC8vIGRyYXcgcmVjdFxuICAgICAgICBjdHguc3Ryb2tlU3R5bGUgPSAnIzY2NidcbiAgICAgICAgY3R4LnJlY3QodGhpcy5vLmxlZnQgKyB0aGlzLm8ubWFyZ2luLzIsdGhpcy5vLnRvcCArIHRoaXMuby5tYXJnaW4vMix0aGlzLm8ud2lkdGggLSB0aGlzLm8ubWFyZ2luLHRoaXMuby5oZWlnaHQgLSB0aGlzLm8ubWFyZ2luKVxuICAgICAgICBjdHguc3Ryb2tlKClcbiAgICB9LFxuICAgIGFkZFBvaW50OiBmdW5jdGlvbiAocG9pbnQpIHtcbiAgICAgICAgdGhpcy5wb2ludHMucHVzaChwb2ludClcbiAgICAgICAgaWYgKHRoaXMucG9pbnRzLmxlbmd0aCA+IHRoaXMuby5tYXgpIHtcbiAgICAgICAgICAgIHRoaXMub2ZmIC09IHRoaXMucG9pbnRzLmxlbmd0aCAtIHRoaXMuby5tYXhcbiAgICAgICAgICAgIHRoaXMub2ZmICU9IHRoaXMuby50aWNrc2NhbGVcbiAgICAgICAgICAgIHRoaXMucG9pbnRzID0gdGhpcy5wb2ludHMuc2xpY2UoLXRoaXMuby5tYXgpXG4gICAgICAgIH1cbiAgICB9XG59XG5cbiIsIm1vZHVsZS5leHBvcnRzID0gQ2F2ZURyYXc7XG5cbmZ1bmN0aW9uIENhdmVEcmF3KGNvbnRhaW5lciwgd2lkdGgsIGhlaWdodCkge1xuICAgIHRoaXMuY29udGFpbmVyID0gJChjb250YWluZXIpXG4gICAgdGhpcy5jYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKVxuICAgIHRoaXMuY2FudmFzLndpZHRoID0gd2lkdGhcbiAgICB0aGlzLmNhbnZhcy5oZWlnaHQgPSBoZWlnaHRcbiAgICBjb250YWluZXIuYXBwZW5kKHRoaXMuY2FudmFzKVxufVxuXG5DYXZlRHJhdy5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKGZuKSB7XG4gICAgZGVmaW5lUGF0aCh0aGlzLmNhbnZhcywgZm4pXG4gICAgZHJhd1BhdGgodGhpcy5jYW52YXMpXG59XG5cbkNhdmVEcmF3LnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBjb250ZXh0ID0gdGhpcy5jYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICBjb250ZXh0LmNsZWFyUmVjdCgwLCAwLCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KVxufVxuXG5mdW5jdGlvbiBkZWZpbmVQYXRoKGNhbnZhcywgZm4pIHtcbiAgICB2YXIgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgIHZhciB4bWF4ID0gY2FudmFzLndpZHRoXG4gICAgdmFyIHltYXggPSBjYW52YXMuaGVpZ2h0XG5cbiAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgIGNvbnRleHQubW92ZVRvKDAsIGZuKDApKTtcbiAgICBmb3IgKHZhciB4ID0gMDsgeCA8IHhtYXggOyB4KyspIHtcbiAgICAgICAgY29udGV4dC5saW5lVG8oeCwgeW1heCAtIGZuKHgpKVxuICAgIH1cblxuICAgIGNvbnRleHQubGluZVRvKHhtYXgsIHltYXgpXG4gICAgY29udGV4dC5saW5lVG8oMCwgeW1heClcbiAgICBjb250ZXh0LmNsb3NlUGF0aCgpO1xufVxuXG5mdW5jdGlvbiBkcmF3UGF0aChjYW52YXMpIHtcbiAgICB2YXIgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgIGNvbnRleHQubGluZVdpZHRoID0gNTtcbiAgICAvLyBjb250ZXh0LmZpbGxTdHlsZSA9ICcjOEVENkZGJztcbiAgICB2YXIgZ3JkID0gY29udGV4dC5jcmVhdGVMaW5lYXJHcmFkaWVudChjYW52YXMud2lkdGggLyAyLCAwLCBjYW52YXMud2lkdGggLyAyLCBjYW52YXMuaGVpZ2h0KVxuICAgIGdyZC5hZGRDb2xvclN0b3AoMCwgJyMwMDAnKVxuICAgIGdyZC5hZGRDb2xvclN0b3AoMSwgJyM3NzcnKVxuICAgIGNvbnRleHQuZmlsbFN0eWxlID0gZ3JkO1xuICAgIC8vIGNvbnRleHQuZmlsbFN0eWxlID0gJyMzMzMnO1xuICAgIGNvbnRleHQuZmlsbCgpO1xuICAgIC8vIGNvbnRleHQuc3Ryb2tlU3R5bGUgPSAnYmx1ZSc7XG4gICAgLy8gY29udGV4dC5zdHJva2UoKTtcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gY2hlY2tDb2xsaXNpb247XG5cbmZ1bmN0aW9uIGNoZWNrQ29sbGlzaW9uKGJvZHlBLCBib2R5Qikge1xuICAgIHZhciBzdXBwb3J0Rm5TdGFjayA9IFtdO1xuXG4gICAgLypcbiAgICAgKiBnZXRTdXBwb3J0Rm4oIGJvZHlBLCBib2R5QiApIC0+IEZ1bmN0aW9uXG4gICAgICogLSBib2R5QSAoT2JqZWN0KTogRmlyc3QgYm9keVxuICAgICAqIC0gYm9keUIgKE9iamVjdCk6IFNlY29uZCBib2R5XG4gICAgICogKyAoRnVuY3Rpb24pOiBUaGUgc3VwcG9ydCBmdW5jdGlvblxuICAgICAqXG4gICAgICogR2V0IGEgZ2VuZXJhbCBzdXBwb3J0IGZ1bmN0aW9uIGZvciB1c2Ugd2l0aCBHSksgYWxnb3JpdGhtXG4gICAgICovXG4gICAgdmFyIGdldFN1cHBvcnRGbiA9IGZ1bmN0aW9uIGdldFN1cHBvcnRGbiggYm9keUEsIGJvZHlCICl7XG5cbiAgICAgICAgdmFyIGhhc2ggPSBQaHlzaWNzLnV0aWwucGFpckhhc2goIGJvZHlBLnVpZCwgYm9keUIudWlkIClcbiAgICAgICAgdmFyIGZuID0gc3VwcG9ydEZuU3RhY2tbIGhhc2ggXVxuXG4gICAgICAgIGlmICggIWZuICl7XG4gICAgICAgICAgICBmbiA9IHN1cHBvcnRGblN0YWNrWyBoYXNoIF0gPSBmdW5jdGlvbiggc2VhcmNoRGlyICl7XG5cbiAgICAgICAgICAgICAgICB2YXIgc2NyYXRjaCA9IFBoeXNpY3Muc2NyYXRjaHBhZCgpXG4gICAgICAgICAgICAgICAgdmFyIHRBID0gZm4udEFcbiAgICAgICAgICAgICAgICB2YXIgdEIgPSBmbi50QlxuICAgICAgICAgICAgICAgIHZhciB2QSA9IHNjcmF0Y2gudmVjdG9yKClcbiAgICAgICAgICAgICAgICB2YXIgdkIgPSBzY3JhdGNoLnZlY3RvcigpXG4gICAgICAgICAgICAgICAgdmFyIG1hcmdpbkEgPSBmbi5tYXJnaW5BXG4gICAgICAgICAgICAgICAgdmFyIG1hcmdpbkIgPSBmbi5tYXJnaW5CXG4gICAgICAgICAgICAgICAgO1xuXG4gICAgICAgICAgICAgICAgaWYgKCBmbi51c2VDb3JlICl7XG4gICAgICAgICAgICAgICAgICAgIHZBID0gYm9keUEuZ2VvbWV0cnkuZ2V0RmFydGhlc3RDb3JlUG9pbnQoIHNlYXJjaERpci5yb3RhdGVJbnYoIHRBICksIHZBLCBtYXJnaW5BICkudHJhbnNmb3JtKCB0QSApO1xuICAgICAgICAgICAgICAgICAgICB2QiA9IGJvZHlCLmdlb21ldHJ5LmdldEZhcnRoZXN0Q29yZVBvaW50KCBzZWFyY2hEaXIucm90YXRlKCB0QSApLnJvdGF0ZUludiggdEIgKS5uZWdhdGUoKSwgdkIsIG1hcmdpbkIgKS50cmFuc2Zvcm0oIHRCICk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdkEgPSBib2R5QS5nZW9tZXRyeS5nZXRGYXJ0aGVzdEh1bGxQb2ludCggc2VhcmNoRGlyLnJvdGF0ZUludiggdEEgKSwgdkEgKS50cmFuc2Zvcm0oIHRBICk7XG4gICAgICAgICAgICAgICAgICAgIHZCID0gYm9keUIuZ2VvbWV0cnkuZ2V0RmFydGhlc3RIdWxsUG9pbnQoIHNlYXJjaERpci5yb3RhdGUoIHRBICkucm90YXRlSW52KCB0QiApLm5lZ2F0ZSgpLCB2QiApLnRyYW5zZm9ybSggdEIgKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBzZWFyY2hEaXIubmVnYXRlKCkucm90YXRlKCB0QiApO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHNjcmF0Y2guZG9uZSh7XG4gICAgICAgICAgICAgICAgICAgIGE6IHZBLnZhbHVlcygpLFxuICAgICAgICAgICAgICAgICAgICBiOiB2Qi52YWx1ZXMoKSxcbiAgICAgICAgICAgICAgICAgICAgcHQ6IHZBLnZzdWIoIHZCICkudmFsdWVzKClcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGZuLnRBID0gUGh5c2ljcy50cmFuc2Zvcm0oKTtcbiAgICAgICAgICAgIGZuLnRCID0gUGh5c2ljcy50cmFuc2Zvcm0oKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZuLnVzZUNvcmUgPSBmYWxzZTtcbiAgICAgICAgZm4ubWFyZ2luID0gMDtcbiAgICAgICAgZm4udEEuc2V0VHJhbnNsYXRpb24oIGJvZHlBLnN0YXRlLnBvcyApLnNldFJvdGF0aW9uKCBib2R5QS5zdGF0ZS5hbmd1bGFyLnBvcyApO1xuICAgICAgICBmbi50Qi5zZXRUcmFuc2xhdGlvbiggYm9keUIuc3RhdGUucG9zICkuc2V0Um90YXRpb24oIGJvZHlCLnN0YXRlLmFuZ3VsYXIucG9zICk7XG4gICAgICAgIGZuLmJvZHlBID0gYm9keUE7XG4gICAgICAgIGZuLmJvZHlCID0gYm9keUI7XG5cbiAgICAgICAgcmV0dXJuIGZuO1xuICAgIH07XG5cbiAgICAvKlxuICAgICAqIGNoZWNrR0pLKCBib2R5QSwgYm9keUIgKSAtPiBPYmplY3RcbiAgICAgKiAtIGJvZHlBIChPYmplY3QpOiBGaXJzdCBib2R5XG4gICAgICogLSBib2R5QiAoT2JqZWN0KTogU2Vjb25kIGJvZHlcbiAgICAgKiArIChPYmplY3QpOiBDb2xsaXNpb24gcmVzdWx0XG4gICAgICpcbiAgICAgKiBVc2UgR0pLIGFsZ29yaXRobSB0byBjaGVjayBhcmJpdHJhcnkgYm9kaWVzIGZvciBjb2xsaXNpb25zXG4gICAgICovXG4gICAgdmFyIGNoZWNrR0pLID0gZnVuY3Rpb24gY2hlY2tHSksoIGJvZHlBLCBib2R5QiApe1xuXG4gICAgICAgIHZhciBzY3JhdGNoID0gUGh5c2ljcy5zY3JhdGNocGFkKClcbiAgICAgICAgdmFyIGQgPSBzY3JhdGNoLnZlY3RvcigpXG4gICAgICAgIHZhciB0bXAgPSBzY3JhdGNoLnZlY3RvcigpXG4gICAgICAgICAgICAsb3ZlcmxhcFxuICAgICAgICB2YXIgcmVzdWx0XG4gICAgICAgIHZhciBzdXBwb3J0XG4gICAgICAgIHZhciBjb2xsaXNpb24gPSBmYWxzZVxuICAgICAgICB2YXIgYWFiYkEgPSBib2R5QS5hYWJiKClcbiAgICAgICAgICAgICxkaW1BID0gTWF0aC5taW4oIGFhYmJBLmh3LCBhYWJiQS5oaCApXG4gICAgICAgIHZhciBhYWJiQiA9IGJvZHlCLmFhYmIoKVxuICAgICAgICB2YXIgZGltQiA9IE1hdGgubWluKCBhYWJiQi5odywgYWFiYkIuaGggKVxuICAgICAgICA7XG5cbiAgICAgICAgLy8ganVzdCBjaGVjayB0aGUgb3ZlcmxhcCBmaXJzdFxuICAgICAgICBzdXBwb3J0ID0gZ2V0U3VwcG9ydEZuKCBib2R5QSwgYm9keUIgKTtcbiAgICAgICAgZC5jbG9uZSggYm9keUEuc3RhdGUucG9zICkudnN1YiggYm9keUIuc3RhdGUucG9zICk7XG4gICAgICAgIHJlc3VsdCA9IFBoeXNpY3MuZ2prKHN1cHBvcnQsIGQsIHRydWUpO1xuXG4gICAgICAgIGlmICggcmVzdWx0Lm92ZXJsYXAgKXtcblxuICAgICAgICAgICAgLy8gdGhlcmUgaXMgYSBjb2xsaXNpb24uIGxldCdzIGRvIG1vcmUgd29yay5cbiAgICAgICAgICAgIGNvbGxpc2lvbiA9IHtcbiAgICAgICAgICAgICAgICBib2R5QTogYm9keUEsXG4gICAgICAgICAgICAgICAgYm9keUI6IGJvZHlCXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAvLyBmaXJzdCBnZXQgdGhlIG1pbiBkaXN0YW5jZSBvZiBiZXR3ZWVuIGNvcmUgb2JqZWN0c1xuICAgICAgICAgICAgc3VwcG9ydC51c2VDb3JlID0gdHJ1ZTtcbiAgICAgICAgICAgIHN1cHBvcnQubWFyZ2luQSA9IDA7XG4gICAgICAgICAgICBzdXBwb3J0Lm1hcmdpbkIgPSAwO1xuXG4gICAgICAgICAgICB3aGlsZSAoIHJlc3VsdC5vdmVybGFwICYmIChzdXBwb3J0Lm1hcmdpbkEgPCBkaW1BIHx8IHN1cHBvcnQubWFyZ2luQiA8IGRpbUIpICl7XG4gICAgICAgICAgICAgICAgaWYgKCBzdXBwb3J0Lm1hcmdpbkEgPCBkaW1BICl7XG4gICAgICAgICAgICAgICAgICAgIHN1cHBvcnQubWFyZ2luQSArPSAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoIHN1cHBvcnQubWFyZ2luQiA8IGRpbUIgKXtcbiAgICAgICAgICAgICAgICAgICAgc3VwcG9ydC5tYXJnaW5CICs9IDE7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gUGh5c2ljcy5namsoc3VwcG9ydCwgZCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICggcmVzdWx0Lm92ZXJsYXAgfHwgcmVzdWx0Lm1heEl0ZXJhdGlvbnNSZWFjaGVkICl7XG4gICAgICAgICAgICAgICAgLy8gVGhpcyBpbXBsZW1lbnRhdGlvbiBjYW4ndCBkZWFsIHdpdGggYSBjb3JlIG92ZXJsYXAgeWV0XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNjcmF0Y2guZG9uZShmYWxzZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGNhbGMgb3ZlcmxhcFxuICAgICAgICAgICAgb3ZlcmxhcCA9IE1hdGgubWF4KDAsIChzdXBwb3J0Lm1hcmdpbkEgKyBzdXBwb3J0Lm1hcmdpbkIpIC0gcmVzdWx0LmRpc3RhbmNlKTtcbiAgICAgICAgICAgIGNvbGxpc2lvbi5vdmVybGFwID0gb3ZlcmxhcDtcbiAgICAgICAgICAgIC8vIEBUT0RPOiBmb3Igbm93LCBqdXN0IGxldCB0aGUgbm9ybWFsIGJlIHRoZSBtdHZcbiAgICAgICAgICAgIGNvbGxpc2lvbi5ub3JtID0gZC5jbG9uZSggcmVzdWx0LmNsb3Nlc3QuYiApLnZzdWIoIHRtcC5jbG9uZSggcmVzdWx0LmNsb3Nlc3QuYSApICkubm9ybWFsaXplKCkudmFsdWVzKCk7XG4gICAgICAgICAgICBjb2xsaXNpb24ubXR2ID0gZC5tdWx0KCBvdmVybGFwICkudmFsdWVzKCk7XG4gICAgICAgICAgICAvLyBnZXQgYSBjb3JyZXNwb25kaW5nIGh1bGwgcG9pbnQgZm9yIG9uZSBvZiB0aGUgY29yZSBwb2ludHMuLiByZWxhdGl2ZSB0byBib2R5IEFcbiAgICAgICAgICAgIGNvbGxpc2lvbi5wb3MgPSBkLmNsb25lKCBjb2xsaXNpb24ubm9ybSApLm11bHQoIHN1cHBvcnQubWFyZ2luICkudmFkZCggdG1wLmNsb25lKCByZXN1bHQuY2xvc2VzdC5hICkgKS52c3ViKCBib2R5QS5zdGF0ZS5wb3MgKS52YWx1ZXMoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBzY3JhdGNoLmRvbmUoIGNvbGxpc2lvbiApO1xuICAgIH07XG5cbiAgICAvKlxuICAgICAqIGNoZWNrQ2lyY2xlcyggYm9keUEsIGJvZHlCICkgLT4gT2JqZWN0XG4gICAgICogLSBib2R5QSAoT2JqZWN0KTogRmlyc3QgYm9keVxuICAgICAqIC0gYm9keUIgKE9iamVjdCk6IFNlY29uZCBib2R5XG4gICAgICogKyAoT2JqZWN0KTogQ29sbGlzaW9uIHJlc3VsdFxuICAgICAqXG4gICAgICogQ2hlY2sgdHdvIGNpcmNsZXMgZm9yIGNvbGxpc2lvbnMuXG4gICAgICovXG4gICAgdmFyIGNoZWNrQ2lyY2xlcyA9IGZ1bmN0aW9uIGNoZWNrQ2lyY2xlcyggYm9keUEsIGJvZHlCICl7XG5cbiAgICAgICAgdmFyIHNjcmF0Y2ggPSBQaHlzaWNzLnNjcmF0Y2hwYWQoKVxuICAgICAgICB2YXIgZCA9IHNjcmF0Y2gudmVjdG9yKClcbiAgICAgICAgdmFyIHRtcCA9IHNjcmF0Y2gudmVjdG9yKClcbiAgICAgICAgdmFyIG92ZXJsYXBcbiAgICAgICAgdmFyIGNvbGxpc2lvbiA9IGZhbHNlXG5cbiAgICAgICAgZC5jbG9uZSggYm9keUIuc3RhdGUucG9zICkudnN1YiggYm9keUEuc3RhdGUucG9zICk7XG4gICAgICAgIG92ZXJsYXAgPSBkLm5vcm0oKSAtIChib2R5QS5nZW9tZXRyeS5yYWRpdXMgKyBib2R5Qi5nZW9tZXRyeS5yYWRpdXMpO1xuXG4gICAgICAgIC8vIGhtbS4uLiB0aGV5IG92ZXJsYXAgZXhhY3RseS4uLiBjaG9vc2UgYSBkaXJlY3Rpb25cbiAgICAgICAgaWYgKCBkLmVxdWFscyggUGh5c2ljcy52ZWN0b3IuemVybyApICl7XG5cbiAgICAgICAgICAgIGQuc2V0KCAxLCAwICk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBpZiAoIG92ZXJsYXAgPiAwICl7XG4gICAgICAgIC8vICAgICAvLyBjaGVjayB0aGUgZnV0dXJlXG4gICAgICAgIC8vICAgICBkLnZhZGQoIHRtcC5jbG9uZShib2R5Qi5zdGF0ZS52ZWwpLm11bHQoIGR0ICkgKS52c3ViKCB0bXAuY2xvbmUoYm9keUEuc3RhdGUudmVsKS5tdWx0KCBkdCApICk7XG4gICAgICAgIC8vICAgICBvdmVybGFwID0gZC5ub3JtKCkgLSAoYm9keUEuZ2VvbWV0cnkucmFkaXVzICsgYm9keUIuZ2VvbWV0cnkucmFkaXVzKTtcbiAgICAgICAgLy8gfVxuXG4gICAgICAgIGlmICggb3ZlcmxhcCA8PSAwICl7XG5cbiAgICAgICAgICAgIGNvbGxpc2lvbiA9IHtcbiAgICAgICAgICAgICAgICBib2R5QTogYm9keUEsXG4gICAgICAgICAgICAgICAgYm9keUI6IGJvZHlCLFxuICAgICAgICAgICAgICAgIG5vcm06IGQubm9ybWFsaXplKCkudmFsdWVzKCksXG4gICAgICAgICAgICAgICAgbXR2OiBkLm11bHQoIC1vdmVybGFwICkudmFsdWVzKCksXG4gICAgICAgICAgICAgICAgcG9zOiBkLm5vcm1hbGl6ZSgpLm11bHQoIGJvZHlBLmdlb21ldHJ5LnJhZGl1cyApLnZhbHVlcygpLFxuICAgICAgICAgICAgICAgIG92ZXJsYXA6IC1vdmVybGFwXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHNjcmF0Y2guZG9uZSggY29sbGlzaW9uICk7XG4gICAgfTtcblxuICAgIC8qXG4gICAgICogY2hlY2tQYWlyKCBib2R5QSwgYm9keUIgKSAtPiBPYmplY3RcbiAgICAgKiAtIGJvZHlBIChPYmplY3QpOiBGaXJzdCBib2R5XG4gICAgICogLSBib2R5QiAoT2JqZWN0KTogU2Vjb25kIGJvZHlcbiAgICAgKiArIChPYmplY3QpOiBDb2xsaXNpb24gcmVzdWx0XG4gICAgICpcbiAgICAgKiBDaGVjayBhIHBhaXIgZm9yIGNvbGxpc2lvbnNcbiAgICAgKi9cbiAgICB2YXIgY2hlY2tQYWlyID0gZnVuY3Rpb24gY2hlY2tQYWlyKCBib2R5QSwgYm9keUIgKXtcblxuICAgICAgICAvLyBmaWx0ZXIgb3V0IGJvZGllcyB0aGF0IGRvbid0IGNvbGxpZGUgd2l0aCBlYWNoIG90aGVyXG4gICAgICAgIGlmIChcbiAgICAgICAgICAgICggYm9keUEudHJlYXRtZW50ID09PSAnc3RhdGljJyB8fCBib2R5QS50cmVhdG1lbnQgPT09ICdraW5lbWF0aWMnICkgJiZcbiAgICAgICAgICAgICAgICAoIGJvZHlCLnRyZWF0bWVudCA9PT0gJ3N0YXRpYycgfHwgYm9keUIudHJlYXRtZW50ID09PSAna2luZW1hdGljJyApXG4gICAgICAgICl7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIGJvZHlBLmdlb21ldHJ5Lm5hbWUgPT09ICdjaXJjbGUnICYmIGJvZHlCLmdlb21ldHJ5Lm5hbWUgPT09ICdjaXJjbGUnICl7XG5cbiAgICAgICAgICAgIHJldHVybiBjaGVja0NpcmNsZXMoIGJvZHlBLCBib2R5QiApO1xuXG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgIHJldHVybiBjaGVja0dKSyggYm9keUEsIGJvZHlCICk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIGNoZWNrUGFpcihib2R5QSwgYm9keUIpXG59XG5cbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xuXG52YXIgRGF0YUNoZWNrZXIgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdEYXRhQ2hlY2tlcicsXG4gICAgcHJvcFR5cGVzOiB7XG4gICAgICAgIGluaXRpYWxUZXh0OiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gICAgICAgIGluaXRpYWxIeXBvdGhlc2lzOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gICAgICAgIHBvc3NpYmxlSHlwb3RoZXNlczogUmVhY3QuUHJvcFR5cGVzLmFycmF5T2YoUmVhY3QuUHJvcFR5cGVzLnNoYXBlKHtcbiAgICAgICAgICAgIG5hbWU6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgICAgICAgICAgIGJ1dHRvblRleHQ6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCwgLy8gdGhlIHRleHQgb24gdGhlIGJ1dHRvbiB0byBjaGFuZ2UgeW91ciBoeXBvdGhlc2lzXG4gICAgICAgICAgICB0ZXh0OiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsIC8vIFwiWW91ciBoeXBvdGhlc2lzIHdhcyA8dGV4dD4uXCJcbiAgICAgICAgfSkpLmlzUmVxdWlyZWQsXG4gICAgICAgIHJlc3VsdDogUmVhY3QuUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCwgLy8gdGFrZXMgaW4gdGhlIGN1cnJlbnQgc3RhdGUgYW5kIHJldHVybnMgYW4gZXJyb3Igc3RyaW5nIGZvciBmcmFuY2lzIHRvIHNheSwgb3IgbnVsbCBpZiB0aGVyZSBhcmUgbm8gcHJvYmxlbXMgd2l0aCB0aGUgZXhwZXJpbWVudC5cbiAgICAgICAgbmV4dFVSTDogUmVhY3QuUHJvcFR5cGVzLnN0cmluZywgLy8gdGhlIHVybCBvZiB0aGUgbmV4dCB0aGluZy5cbiAgICB9LFxuXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB0aGlzUmVzdWx0OiB0aGlzLnByb3BzLmluaXRpYWxUZXh0LFxuICAgICAgICAgICAgcHJldlJlc3VsdDogJycsXG4gICAgICAgICAgICBoeXBvdGhlc2lzOiB0aGlzLnByb3BzLmluaXRpYWxIeXBvdGhlc2lzLCAvLyBhIGh5cG90aGVzaXMubmFtZVxuICAgICAgICAgICAgZGlzcHJvdmVuOiBmYWxzZSxcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgcmVuZGVySHlwb3RoZXNpczogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgaHlwVGV4dCA9IF8uZmluZFdoZXJlKFxuICAgICAgICAgICAgdGhpcy5wcm9wcy5wb3NzaWJsZUh5cG90aGVzZXMsXG4gICAgICAgICAgICB7bmFtZTogdGhpcy5zdGF0ZS5oeXBvdGhlc2lzfSkudGV4dFxuICAgICAgICByZXR1cm4gUmVhY3QuRE9NLnAoe2NsYXNzTmFtZTogXCJjaGVja2VyX3lvdXItaHlwb1wifSwgXG4gICAgICAgICAgICBSZWFjdC5ET00uZW0obnVsbCwgXCJZb3VyIGh5cG90aGVzaXMgaXMgXCIsIGh5cFRleHQsIFwiLlwiKVxuICAgICAgICApXG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5kaXNwcm92ZW4pIHtcbiAgICAgICAgICAgIHZhciBidXR0b25zID0gXy5tYXAoXG4gICAgICAgICAgICAgICAgXy5maWx0ZXIoXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMucG9zc2libGVIeXBvdGhlc2VzLFxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiAoaHlwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKHRoaXMuc3RhdGUuaHlwb3RoZXNpcyAhPT0gaHlwLm5hbWUpO1xuICAgICAgICAgICAgICAgICAgICB9LmJpbmQodGhpcykpLFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIChoeXApIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFJlYWN0LkRPTS5idXR0b24oe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtleTogaHlwLm5hbWUsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogXCJidG4gYnRuLWRlZmF1bHRcIiwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljazogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNoYW5nZUh5cG90aGVzaXMoaHlwLm5hbWUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpfSwgXG4gICAgICAgICAgICAgICAgICAgICAgICBoeXAuYnV0dG9uVGV4dFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgICAgICAgIHJldHVybiBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwiY2hlY2tlclwifSwgXG4gICAgICAgICAgICAgICAgdGhpcy5yZW5kZXJIeXBvdGhlc2lzKCksIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5pbWcoe3NyYzogXCJpbWFnZXMvc2lyLWZyYW5jaXMuanBlZ1wiLCBjbGFzc05hbWU6IFwiY2hlY2tlcl9mcmFuY2lzXCJ9KSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImNoZWNrZXJfbWFpblwifSwgXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5wKG51bGwsIFwiT2theSwgd2hpY2ggcmVzdWx0IGRvIHRoZXkgc3VwcG9ydD9cIiksIFxuICAgICAgICAgICAgICAgICAgICBidXR0b25zXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnN0YXRlLnRoaXNSZXN1bHQpIHtcbiAgICAgICAgICAgIHJldHVybiBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwiY2hlY2tlclwifSwgXG4gICAgICAgICAgICAgICAgdGhpcy5yZW5kZXJIeXBvdGhlc2lzKCksIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5pbWcoe3NyYzogXCJpbWFnZXMvc2lyLWZyYW5jaXMuanBlZ1wiLCBjbGFzc05hbWU6IFwiY2hlY2tlcl9mcmFuY2lzXCJ9KSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImNoZWNrZXJfbWFpblwifSwgXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5wKG51bGwsIHRoaXMuc3RhdGUudGhpc1Jlc3VsdCksIFxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5ET00uYnV0dG9uKHtjbGFzc05hbWU6IFwiYnRuIGJ0bi1kZWZhdWx0XCIsIG9uQ2xpY2s6IHRoaXMuc3VwcG9ydH0sIFwiVGhlIGRhdGEgc3VwcG9ydCBteSBoeXBvdGhlc2lzLlwiKSwgXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5idXR0b24oe2NsYXNzTmFtZTogXCJidG4gYnRuLWRlZmF1bHRcIiwgb25DbGljazogdGhpcy5kaXNwcm92ZX0sIFwiVGhlIGRhdGEgZGlzcHJvdmUgbXkgaHlwb3RoZXNpcy5cIilcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMubmV4dFVSTCkge1xuICAgICAgICAgICAgICAgIHZhciBjb250aW51ZXIgPSBSZWFjdC5ET00uYSh7Y2xhc3NOYW1lOiBcImJ0biBidG4tZGVmYXVsdFwiLCBocmVmOiB0aGlzLnByb3BzLm5leHRVUkx9LCBcIlRoYW5rcyEgIFdoYXQncyBuZXh0P1wiKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdmFyIGNvbnRpbnVlciA9IFJlYWN0LkRPTS5zcGFuKG51bGwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJjaGVja2VyXCJ9LCBcbiAgICAgICAgICAgICAgICB0aGlzLnJlbmRlckh5cG90aGVzaXMoKSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmltZyh7c3JjOiBcImltYWdlcy9zaXItZnJhbmNpcy5qcGVnXCIsIGNsYXNzTmFtZTogXCJjaGVja2VyX2ZyYW5jaXNcIn0pLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwiY2hlY2tlcl9tYWluXCJ9LCBcbiAgICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLnAobnVsbCwgXCJZb3VyIGV4cGVyaW1lbnQgbG9va3MgZ3JlYXQsIGFuZCBJJ20gY29udmluY2VkLiAgSGVyZSwgaGF2ZSBzb21lIGJhY29uLlwiKSwgXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlciwgXCI7XCJcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIHN1cHBvcnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5hc2tGcmFuY2lzKCk7XG4gICAgfSxcblxuICAgIGRpc3Byb3ZlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgZGlzcHJvdmVuOiB0cnVlLFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgY2hhbmdlSHlwb3RoZXNpczogZnVuY3Rpb24gKGh5cCkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGRpc3Byb3ZlbjogZmFsc2UsXG4gICAgICAgICAgICBoeXBvdGhlc2lzOiBoeXAsXG4gICAgICAgIH0sIHRoaXMuYXNrRnJhbmNpcyk7XG4gICAgfSxcblxuICAgIGFza0ZyYW5jaXM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICB0aGlzUmVzdWx0OiB0aGlzLnByb3BzLnJlc3VsdCh0aGlzLnN0YXRlKSxcbiAgICAgICAgICAgIHByZXZSZXN1bHQ6IHRoaXMuc3RhdGUudGhpc1Jlc3VsdFxuICAgICAgICB9KTtcbiAgICB9XG59KVxuXG5tb2R1bGUuZXhwb3J0cyA9IERhdGFDaGVja2VyO1xuIiwidmFyIEdyYXBoID0gcmVxdWlyZSgnLi9ncmFwaCcpXG52YXIgR2F0ZSA9IHJlcXVpcmUoJy4vZ2F0ZScpO1xudmFyIEJhc2UgPSByZXF1aXJlKCcuL2Jhc2UnKTtcbnZhciBTdG9wd2F0Y2ggPSByZXF1aXJlKCcuL3N0b3B3YXRjaCcpO1xudmFyIFBsYXlQYXVzZSA9IHJlcXVpcmUoJy4vcGxheXBhdXNlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gQmFzZS5leHRlbmQoZnVuY3Rpb24gRGVtbyhjb250YWluZXIsIG9wdGlvbnMpIHtcbiAgICBCYXNlLmNhbGwodGhpcywgY29udGFpbmVyLCBvcHRpb25zLCAnaW1hZ2VzL2xhYl9iYWNrZ3JvdW5kLmpwZycpXG59LCB7XG4gICAgZHJvcEluQm9keTogZnVuY3Rpb24gKHJhZGl1cywgeSwgY29sb3IpIHtcbiAgICAgICAgZnVuY3Rpb24gcmFuZG9tKG1pbiwgbWF4KXtcbiAgICAgICAgICAgIHJldHVybiAoTWF0aC5yYW5kb20oKSAqIChtYXgtbWluKSArIG1pbil8MFxuICAgICAgICB9XG4gICAgICAgIHZhciBib2R5ID0gUGh5c2ljcy5ib2R5KCdjaXJjbGUnLCB7XG4gICAgICAgICAgICB4OiAxMDAsXG4gICAgICAgICAgICB5OiB5LFxuICAgICAgICAgICAgdng6IHJhbmRvbSgtNSwgNSkvMTAwLFxuICAgICAgICAgICAgcmFkaXVzOiByYWRpdXMsXG4gICAgICAgICAgICBtYXNzOiA5MDAsXG4gICAgICAgICAgICByZXN0aXR1dGlvbjogMC45LFxuICAgICAgICAgICAgc3R5bGVzOiB7XG4gICAgICAgICAgICAgICAgaW1hZ2U6IFwiaW1hZ2VzL3Rlbm5pc19iYWxsLnBuZ1wiXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG5cbiAgICAgICAgdGhpcy53b3JsZC5hZGQoYm9keSk7XG4gICAgICAgIHJldHVybiBib2R5O1xuICAgIH0sXG4gICAgc2V0dXA6IGZ1bmN0aW9uIChjb250YWluZXIpIHtcbiAgICAgICAgdmFyIHdvcmxkID0gdGhpcy53b3JsZFxuICAgICAgICB3b3JsZC5hZGQoUGh5c2ljcy5iZWhhdmlvcignY29uc3RhbnQtYWNjZWxlcmF0aW9uJykpO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNTsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgcmFkaXVzID0gMjAgKyAxMCAqIGk7XG4gICAgICAgICAgICB0aGlzLmRyb3BJbkJvZHkocmFkaXVzLCAzMDAgLSBpICogNTApO1xuICAgICAgICB9XG4gICAgICAgIHZhciBjaXJjbGUgPSB0aGlzLmRyb3BJbkJvZHkoNDAsIDMwMCArIDIwLCAncmVkJylcbiAgICAgICAgdmFyIGdyYXBoID0gbmV3IEdyYXBoKHRoaXMuY29udGFpbmVyLCB7XG4gICAgICAgICAgICAnQ2lyY2xlJzoge2JvZHk6IGNpcmNsZSwgYXR0cjogJ3Bvcy55JywgdGl0bGU6J1ZlcnRpY2FsIFBvc2l0aW9uJywgbWluc2NhbGU6IDV9LFxuICAgICAgICAgICAgJ1ZlbFknOiB7Ym9keTogY2lyY2xlLCBhdHRyOiAndmVsLnknLCB0aXRsZTonVmVydGljYWwgVmVsb2NpdHknLCBtaW5zY2FsZTogLjF9LFxuICAgICAgICAgICAgJ0FuZ1AnOiB7Ym9keTogY2lyY2xlLCBhdHRyOiAnYW5ndWxhci5wb3MnLCB0aXRsZTonUm90YXRpb24nLCBtaW5zY2FsZTogLjAwMX0sXG4gICAgICAgICAgICAnQW5nVic6IHtib2R5OiBjaXJjbGUsIGF0dHI6ICdhbmd1bGFyLnZlbCcsIHRpdGxlOidSb3RhdGlvbmFsIFZlbG9jaXR5JywgbWluc2NhbGU6IC4wMDF9LFxuICAgICAgICB9LCB7XG4gICAgICAgICAgICB0b3A6IDEwLFxuICAgICAgICAgICAgbGVmdDogdGhpcy5vcHRpb25zLndpZHRoIC0gNDAwLFxuICAgICAgICAgICAgd2lkdGg6IDQwMCxcbiAgICAgICAgICAgIHdvcmxkSGVpZ2h0OiB0aGlzLm9wdGlvbnMuaGVpZ2h0XG4gICAgICAgIH0pXG4gICAgICAgIHRoaXMuZ3JhcGggPSBncmFwaFxuXG4gICAgICAgIHRoaXMud29ybGQub24oJ3N0ZXAnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBncmFwaC51cGRhdGUod29ybGQudGltZXN0ZXAoKSlcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy53b3JsZC5hZGQoUGh5c2ljcy5ib2R5KCdyZWN0YW5nbGUnLCB7XG4gICAgICAgICAgICB4OiAyNTAsXG4gICAgICAgICAgICB5OiA2MDAsXG4gICAgICAgICAgICB3aWR0aDogNTAsXG4gICAgICAgICAgICBoZWlnaHQ6IDQwMCxcbiAgICAgICAgICAgIHRyZWF0bWVudDogJ3N0YXRpYycsXG4gICAgICAgICAgICBzdHlsZXM6IHtcbiAgICAgICAgICAgICAgICBmaWxsU3R5bGU6ICcjZDMzNjgyJyxcbiAgICAgICAgICAgICAgICBhbmdsZUluZGljYXRvcjogJyM3NTFiNGInXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pKVxuXG4gICAgICAgIHZhciBidXR0b25Db250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoYnV0dG9uQ29udGFpbmVyKTtcbiAgICAgICAgdmFyIHBsYXlQYXVzZSA9IG5ldyBQbGF5UGF1c2Uod29ybGQsIGJ1dHRvbkNvbnRhaW5lcik7XG4gICAgICAgIGdhdGVQb2x5Z29uID0gW3t4OiAwLCB5OiAzMDB9LCB7eDogNzAwLCB5OiAzMDB9LCB7eDogNzAwLCB5OiA0MDB9LCB7eDogMCwgeTogNDAwfV07XG4gICAgICAgIHZhciBnYXRlID0gbmV3IEdhdGUod29ybGQsIGdhdGVQb2x5Z29uLCBbMzUwLCA3MDBdLCBudWxsLCB7ZGVidWc6IHRydWUsIHNob3c6IHRydWV9KTtcbiAgICAgICAgZ2F0ZS5vbignZW50ZXInLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICBnYXRlLnN0b3B3YXRjaGVzID0gZ2F0ZS5zdG9wd2F0Y2hlcyB8fCB7fVxuICAgICAgICAgICAgdmFyIHN0b3B3YXRjaCA9IG5ldyBTdG9wd2F0Y2god29ybGQsIGJ1dHRvbkNvbnRhaW5lciwgMSk7XG4gICAgICAgICAgICBzdG9wd2F0Y2gucmVzZXQoKTtcbiAgICAgICAgICAgIHN0b3B3YXRjaC5zdGFydCgpO1xuICAgICAgICAgICAgZ2F0ZS5zdG9wd2F0Y2hlc1tkYXRhLmJvZHkudWlkXSA9IHN0b3B3YXRjaDtcbiAgICAgICAgfSk7XG4gICAgICAgIGdhdGUub24oJ2V4aXQnLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICBnYXRlLnN0b3B3YXRjaGVzW2RhdGEuYm9keS51aWRdLnN0b3AoKVxuICAgICAgICB9KTtcbiAgICB9XG59KTtcblxuIiwidmFyIEJhc2UgPSByZXF1aXJlKCcuL2Jhc2UnKTtcbnZhciBHYXRlID0gcmVxdWlyZSgnLi9nYXRlJyk7XG52YXIgU3RvcHdhdGNoID0gcmVxdWlyZSgnLi9zdG9wd2F0Y2gnKTtcbnZhciBMb2dCb29rID0gcmVxdWlyZSgnLi9sb2dib29rJyk7XG52YXIgUGxheVBhdXNlID0gcmVxdWlyZSgnLi9wbGF5cGF1c2UnKTtcbnZhciBEcm9wSW50cm8gPSByZXF1aXJlKCcuL2ludHJvL2Ryb3BfaW50cm8uanN4Jyk7XG52YXIgZHJvcERhdGFDaGVja2VyID0gcmVxdWlyZSgnLi9kcm9wZGF0YWNoZWNrZXInKTtcbnZhciB1dGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XG5cbmZ1bmN0aW9uIHJhbmRvbShtaW4sIG1heCl7XG4gICAgcmV0dXJuIChNYXRoLnJhbmRvbSgpICogKG1heC1taW4pICsgbWluKXwwXG59XG5cbm1vZHVsZS5leHBvcnRzID0gQmFzZS5leHRlbmQoZnVuY3Rpb24gRHJvcChjb250YWluZXIsIG9wdGlvbnMpIHtcbiAgICBCYXNlLmNhbGwodGhpcywgY29udGFpbmVyLCBvcHRpb25zLCBcImltYWdlcy9ibHVlX2xhYi5qcGdcIilcbn0sIHtcbiAgICBkcm9wQm93bGluZ0JhbGw6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcmFkaXVzID0gMzA7XG4gICAgICAgIHRoaXMud29ybGQuYWRkKFBoeXNpY3MuYm9keSgnY2lyY2xlJywge1xuICAgICAgICAgICAgeDogNzAwLFxuICAgICAgICAgICAgeTogMjAwLFxuICAgICAgICAgICAgdng6IHJhbmRvbSgtMzAsIDMwKS8xMDAsXG4gICAgICAgICAgICByYWRpdXM6IHJhZGl1cyxcbiAgICAgICAgICAgIG1hc3M6IDkwMCxcbiAgICAgICAgICAgIHJlc3RpdHV0aW9uOiAwLjAxLFxuICAgICAgICAgICAgY29mOiAwLjQsXG4gICAgICAgICAgICBzdHlsZXM6IHtcbiAgICAgICAgICAgICAgICBpbWFnZTogXCJpbWFnZXMvYm93bGluZ19iYWxsLnBuZ1wiXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZGlzcGxheU5hbWU6ICdCb3dsaW5nIEJhbGwnLFxuICAgICAgICB9KSk7XG4gICAgfSxcblxuICAgIGRyb3BUZW5uaXNCYWxsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHJhZGl1cyA9IDE1O1xuICAgICAgICB2YXIgYmFsbCA9IFBoeXNpY3MuYm9keSgnY2lyY2xlJywge1xuICAgICAgICAgICAgeDogNzAwLFxuICAgICAgICAgICAgeTogMjAwLFxuICAgICAgICAgICAgdng6IHJhbmRvbSgtMzAsIDMwKS8xMDAsXG4gICAgICAgICAgICByYWRpdXM6IHJhZGl1cyxcbiAgICAgICAgICAgIG1hc3M6IDcuNSxcbiAgICAgICAgICAgIHJlc3RpdHV0aW9uOiAxLFxuICAgICAgICAgICAgZGlzcGxheU5hbWU6ICdUZW5uaXMgQmFsbCcsXG4gICAgICAgICAgICBzdHlsZXM6IHtcbiAgICAgICAgICAgICAgICBpbWFnZTogXCJpbWFnZXMvdGVubmlzX2JhbGwucG5nXCJcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcblxuICAgICAgICBpZiAoIXRoaXMuZmlyc3RUZW5uaXNCYWxsKSB7XG4gICAgICAgICAgICB0aGlzLmZpcnN0VGVubmlzQmFsbCA9IGJhbGw7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLndvcmxkLmFkZChiYWxsKTtcbiAgICB9LFxuXG4gICAgZGVwbG95QmFsbHM6IGZ1bmN0aW9uKG9uRG9uZSkge1xuICAgICAgICB2YXIgZGVidWcgPSB0aGlzLm9wdGlvbnMuZGVidWcgPT09ICd0cnVlJztcbiAgICAgICAgdmFyIHNwYWNpbmdfbXMgPSBkZWJ1ZyA/IDQwMCA6IDgwMDtcbiAgICAgICAgdmFyIHF1ZXVlID0gW1xuICAgICAgICAgICAgdGhpcy5kcm9wVGVubmlzQmFsbC5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgdGhpcy5kcm9wVGVubmlzQmFsbC5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgdGhpcy5kcm9wQm93bGluZ0JhbGwuYmluZCh0aGlzKSxcbiAgICAgICAgICAgIHRoaXMuZHJvcFRlbm5pc0JhbGwuYmluZCh0aGlzKSxcbiAgICAgICAgICAgIHRoaXMuZHJvcFRlbm5pc0JhbGwuYmluZCh0aGlzKSxcbiAgICAgICAgICAgIHRoaXMuZHJvcEJvd2xpbmdCYWxsLmJpbmQodGhpcyksXG4gICAgICAgICAgICBvbkRvbmVcbiAgICAgICAgXTtcbiAgICAgICAgXy5yZWR1Y2UocXVldWUsIGZ1bmN0aW9uKHQsIGFjdGlvbikge1xuICAgICAgICAgICAgc2V0VGltZW91dChhY3Rpb24sIHQpXG4gICAgICAgICAgICByZXR1cm4gdCArIHNwYWNpbmdfbXNcbiAgICAgICAgfSwgMClcblxuICAgICAgICAvLyBzZXRUaW1lb3V0KHRoaXMuZHJvcFRlbm5pc0JhbGwuYmluZCh0aGlzKSwgMClcbiAgICAgICAgLy8gc2V0VGltZW91dCh0aGlzLmRyb3BUZW5uaXNCYWxsLmJpbmQodGhpcyksIDEwMClcbiAgICAgICAgLy8gc2V0VGltZW91dCh0aGlzLmRyb3BUZW5uaXNCYWxsLmJpbmQodGhpcyksIDIwMClcbiAgICB9LFxuXG4gICAgc3RhcnRXYWxrdGhyb3VnaDogZnVuY3Rpb24gKCkge1xuICAgICAgICBEcm9wSW50cm8odGhpcywgZnVuY3Rpb24gKGh5cG90aGVzaXMpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdHb3QgdGhlIGh5cG90aGVzaXMhIScsIGh5cG90aGVzaXMpO1xuICAgICAgICAgICAgdGhpcy5zZXR1cERhdGFDaGVja2VyKGh5cG90aGVzaXMpO1xuICAgICAgICB9LmJpbmQodGhpcyksIHRoaXMub3B0aW9ucy5kZWJ1ZyA9PT0gJ3RydWUnKVxuICAgIH0sXG5cbiAgICBzZXR1cERhdGFDaGVja2VyOiBmdW5jdGlvbiAoaHlwb3RoZXNpcykge1xuICAgICAgICB2YXIgZGF0YUNoZWNrZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICBkYXRhQ2hlY2tlci5jbGFzc05hbWUgPSBcImRyb3AtZGF0YS1jaGVja2VyXCI7XG4gICAgICAgIHRoaXMuc2lkZUJhci5hcHBlbmRDaGlsZChkYXRhQ2hlY2tlcik7XG4gICAgICAgIGRyb3BEYXRhQ2hlY2tlcihkYXRhQ2hlY2tlciwgdGhpcy5sb2dCb29rLCBoeXBvdGhlc2lzKTtcbiAgICB9LFxuXG4gICAgc2V0dXA6IGZ1bmN0aW9uIChjb250YWluZXIpIHtcbiAgICAgICAgdmFyIHdvcmxkID0gdGhpcy53b3JsZFxuICAgICAgICB2YXIgZ3Jhdml0eSA9IFBoeXNpY3MuYmVoYXZpb3IoJ2NvbnN0YW50LWFjY2VsZXJhdGlvbicpXG4gICAgICAgIGdyYXZpdHkuc2V0QWNjZWxlcmF0aW9uKHt4OiAwLCB5Oi4wMDAzfSk7XG4gICAgICAgIHdvcmxkLmFkZChncmF2aXR5KTtcblxuICAgICAgICAvLyBTaHVudCB0cmlhbmdsZVxuICAgICAgICB0aGlzLndvcmxkLmFkZChQaHlzaWNzLmJvZHkoJ3JlY3RhbmdsZScsIHtcbiAgICAgICAgICAgIHg6IDYwLFxuICAgICAgICAgICAgeTogNjkwLFxuICAgICAgICAgICAgd2lkdGg6IDUwMCxcbiAgICAgICAgICAgIGhlaWdodDogMTAwLFxuICAgICAgICAgICAgYW5nbGU6IE1hdGguUEkgLyA0LFxuICAgICAgICAgICAgdHJlYXRtZW50OiAnc3RhdGljJyxcbiAgICAgICAgICAgIGNvZjogMSxcbiAgICAgICAgICAgIHN0eWxlczoge1xuICAgICAgICAgICAgICAgIGZpbGxTdHlsZTogJyNkMzM2ODInLFxuICAgICAgICAgICAgfVxuICAgICAgICB9KSk7XG5cbiAgICAgICAgdmFyIHNpZGVCYXIgPSB0aGlzLnNpZGVCYXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICBzaWRlQmFyLmNsYXNzTmFtZSA9IFwic2lkZS1iYXJcIjtcbiAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKHNpZGVCYXIpO1xuICAgICAgICB2YXIgdG9wR2F0ZSA9IG5ldyBHYXRlKHdvcmxkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHV0aWwubWFrZVJlY3QoMCwgMCwgMjAwLCAxMCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgWzEyMCwgMjAwXSwgbnVsbCwge2RlYnVnOiB0cnVlLCBzaG93OiB0cnVlLCBjb2xvcjogJ2dyZWVuJ30pO1xuICAgICAgICB2YXIgYm90dG9tR2F0ZSA9IG5ldyBHYXRlKHdvcmxkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHV0aWwubWFrZVJlY3QoMCwgMCwgMjAwLCAxMCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgWzEyMCwgNTUwXSwgbnVsbCwge2RlYnVnOiB0cnVlLCBzaG93OiB0cnVlLCBjb2xvcjogJ3JlZCd9KTtcbiAgICAgICAgdmFyIGxvZ0NvbHVtbnMgPSBbXG4gICAgICAgICAgICB7bmFtZTogXCJCb3dsaW5nIEJhbGxcIiwgZXh0cmFUZXh0OiBcIiAoNyBrZylcIn0sXG4gICAgICAgICAgICB7bmFtZTogXCJUZW5uaXMgQmFsbFwiLCBleHRyYVRleHQ6IFwiICg1OCBnKVwiLCBjb2xvcjogJ3JnYigxNTQsIDI0MSwgMCknfVxuICAgICAgICBdO1xuICAgICAgICB2YXIgbG9nQm9vayA9IHRoaXMubG9nQm9vayA9IG5ldyBMb2dCb29rKHdvcmxkLCBzaWRlQmFyLCA1LCBsb2dDb2x1bW5zKTtcbiAgICAgICAgdG9wR2F0ZS5vbignZW50ZXInLCBmdW5jdGlvbihlbGVtKSB7XG4gICAgICAgICAgICB2YXIgY29sTmFtZSA9IGVsZW0uYm9keS5kaXNwbGF5TmFtZSB8fCBlbGVtLmJvZHkubmFtZSB8fCBcImJvZHlcIjtcbiAgICAgICAgICAgIGxvZ0Jvb2suaGFuZGxlU3RhcnQoY29sTmFtZSwgZWxlbS5ib2R5LnVpZCk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICAgIGJvdHRvbUdhdGUub24oJ2VudGVyJywgZnVuY3Rpb24oZWxlbSkge1xuICAgICAgICAgICAgdmFyIGNvbE5hbWUgPSBlbGVtLmJvZHkuZGlzcGxheU5hbWUgfHwgZWxlbS5ib2R5Lm5hbWUgfHwgXCJib2R5XCI7XG4gICAgICAgICAgICBsb2dCb29rLmhhbmRsZUVuZChjb2xOYW1lLCBlbGVtLmJvZHkudWlkKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdmFyIGJ1dHRvbkNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgIHZhciBwbGF5UGF1c2UgPSBuZXcgUGxheVBhdXNlKHdvcmxkLCBidXR0b25Db250YWluZXIpO1xuICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoYnV0dG9uQ29udGFpbmVyKTtcblxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLndhbGspIHtcbiAgICAgICAgICAgIHRoaXMuc3RhcnRXYWxrdGhyb3VnaCgpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBBZGQgdGhlIGJhbGxzLlxuICAgICAgICAgICAgc2V0VGltZW91dCh0aGlzLmRlcGxveUJhbGxzLmJpbmQodGhpcyksIDUwMClcbiAgICAgICAgICAgIHRoaXMuc2V0dXBEYXRhQ2hlY2tlcignc2FtZScpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFBpY2sgdXAgb25lIG9mIHRoZSB0ZW5uaXMgYmFsbHMgYW5kIGRyb3AgaXQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gY2FsbGJhY2sgR2V0cyBjYWxsZWQgd2hlbiB0aGUgZGVtb25zdHJhdGlvbiBpcyBvdmVyLlxuICAgICAqL1xuICAgIGRlbW9uc3RyYXRlRHJvcDogZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIGJhbGwgPSB0aGlzLmZpcnN0VGVubmlzQmFsbDtcbiAgICAgICAgdmFyIHRhcmdldFggPSAxMjU7XG4gICAgICAgIHZhciB0YXJnZXRZID0gMTcwO1xuXG4gICAgICAgIGJhbGwudHJlYXRtZW50ID0gJ2tpbmVtYXRpYyc7XG4gICAgICAgIGJhbGwuc3RhdGUudmVsLnggPSAodGFyZ2V0WCAtIGJhbGwuc3RhdGUucG9zLngpIC8gMTUwMDtcbiAgICAgICAgYmFsbC5zdGF0ZS52ZWwueSA9ICh0YXJnZXRZIC0gYmFsbC5zdGF0ZS5wb3MueSkgLyAxNTAwO1xuICAgICAgICBiYWxsLnJlY2FsYygpO1xuXG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBiYWxsLnRyZWF0bWVudCA9ICdzdGF0aWMnO1xuICAgICAgICAgICAgYmFsbC5zdGF0ZS5wb3MueCA9IHRhcmdldFg7XG4gICAgICAgICAgICBiYWxsLnN0YXRlLnBvcy55ID0gdGFyZ2V0WTtcbiAgICAgICAgICAgIGJhbGwuc3RhdGUudmVsLnggPSAwO1xuICAgICAgICAgICAgYmFsbC5zdGF0ZS52ZWwueSA9IDA7XG4gICAgICAgICAgICBiYWxsLnJlY2FsYygpO1xuXG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGJhbGwudHJlYXRtZW50ID0gJ2R5bmFtaWMnO1xuICAgICAgICAgICAgICAgIGJhbGwucmVjYWxjKCk7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICAgICAgICB9LCAzMDAwKVxuICAgICAgICAgICAgfSwgMTUwMClcbiAgICAgICAgfSwgMTUwMClcbiAgICB9XG59KTtcbiIsInZhciBEYXRhQ2hlY2tlciA9IHJlcXVpcmUoJy4vZGF0YWNoZWNrZXIuanN4Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZHJvcERhdGFDaGVja2VyO1xuXG52YXIgX2luaXRpYWxUZXh0ID0gXCJEbyBhbiBleHBlcmltZW50IHRvIHNlZSBpZiB5b3UgY2FuIGZpZ3VyZSBvdXQgd2hpY2ggYmFsbCBmYWxscyBmYXN0ZXIsIGFuZCBsZXQgbWUga25vdyB3aGVuIHlvdSdyZSBkb25lIVwiO1xuXG52YXIgX25leHRVUkwgPSBcIj9OZXd0b24xJndhbGs9dHJ1ZVwiO1xuXG52YXIgX2h5cG90aGVzZXMgPSBbXG4gICAge1xuICAgICAgICBuYW1lOiBcImJvd2xpbmdcIixcbiAgICAgICAgYnV0dG9uVGV4dDogXCJUaGUgYm93bGluZyBiYWxsIGZhbGxzIGZhc3Rlci5cIixcbiAgICAgICAgdGV4dDogXCJ0aGF0IHRoZSBib3dsaW5nIGJhbGwgd2lsbCBmYWxsIGZhc3RlclwiLFxuICAgIH0sXG4gICAge1xuICAgICAgICBuYW1lOiBcInRlbm5pc1wiLFxuICAgICAgICBidXR0b25UZXh0OiBcIlRoZSB0ZW5uaXMgYmFsbCBmYWxscyBmYXN0ZXIuXCIsXG4gICAgICAgIHRleHQ6IFwidGhhdCB0aGUgdGVubmlzIGJhbGwgd2lsbCBmYWxsIGZhc3RlclwiLFxuICAgIH0sXG4gICAge1xuICAgICAgICBuYW1lOiBcInNhbWVcIixcbiAgICAgICAgYnV0dG9uVGV4dDogXCJCb3RoIGJhbGxzIGZhbGwgYXQgdGhlIHNhbWUgcmF0ZS5cIixcbiAgICAgICAgdGV4dDogXCJ0aGF0IGJvdGggYmFsbHMgd2lsbCBmYWxsIGF0IHRoZSBzYW1lIHJhdGVcIixcbiAgICB9LFxuXTtcbiAgICBcblxuZnVuY3Rpb24gZHJvcERhdGFDaGVja2VyKGNvbnRhaW5lciwgbG9nQm9vaywgaHlwb3RoZXNpcykge1xuICAgIHJldHVybiBSZWFjdC5yZW5kZXJDb21wb25lbnQoRGF0YUNoZWNrZXIoe1xuICAgICAgICBpbml0aWFsVGV4dDogX2luaXRpYWxUZXh0LFxuICAgICAgICBpbml0aWFsSHlwb3RoZXNpczogaHlwb3RoZXNpcyxcbiAgICAgICAgcG9zc2libGVIeXBvdGhlc2VzOiBfaHlwb3RoZXNlcyxcbiAgICAgICAgcmVzdWx0OiBmdW5jdGlvbiAoc3RhdGUpIHtyZXR1cm4gX3Jlc3VsdChsb2dCb29rLCBzdGF0ZSk7fSxcbiAgICAgICAgbmV4dFVSTDogX25leHRVUkwsXG4gICAgfSksIGNvbnRhaW5lcik7XG59XG5cbmZ1bmN0aW9uIF9yZXN1bHQobG9nQm9vaywgc3RhdGUpIHtcbiAgICAvLyB3ZSByZXR1cm4gdGhlIGVycm9yLCBvciBudWxsIGlmIHRoZXkncmUgY29ycmVjdFxuICAgIHZhciBlbm91Z2hEYXRhID0gXy5hbGwobG9nQm9vay5kYXRhLCBmdW5jdGlvbiAoZCkge3JldHVybiBkLmxlbmd0aCA+PSA1O30pO1xuICAgIGlmIChlbm91Z2hEYXRhKSB7XG4gICAgICAgIHZhciBhdmdzID0ge31cbiAgICAgICAgdmFyIG1heERlbHRhcyA9IHt9XG4gICAgICAgIGZvciAodmFyIG5hbWUgaW4gbG9nQm9vay5kYXRhKSB7XG4gICAgICAgICAgICBhdmdzW25hbWVdID0gXy5yZWR1Y2UobG9nQm9vay5kYXRhW25hbWVdLFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIChhLCBiKSB7cmV0dXJuIGEgKyBiO30pIC8gbG9nQm9vay5kYXRhW25hbWVdLmxlbmd0aDtcbiAgICAgICAgICAgIG1heERlbHRhc1tuYW1lXSA9IF8ubWF4KF8ubWFwKGxvZ0Jvb2suZGF0YVtuYW1lXSxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiAoZGF0dW0pIHtyZXR1cm4gTWF0aC5hYnMoZGF0dW0gLSBhdmdzW25hbWVdKTt9KSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgY29uc29sZS5sb2cobG9nQm9vay5kYXRhLCBlbm91Z2hEYXRhLCBhdmdzLCBtYXhEZWx0YXMpO1xuICAgIGlmICghZW5vdWdoRGF0YSkge1xuICAgICAgICByZXR1cm4gXCJZb3UgaGF2ZW4ndCBmaWxsZWQgdXAgeW91ciBsYWIgbm90ZWJvb2shICBNYWtlIHN1cmUgeW91IGdldCBlbm91Z2ggZGF0YSBzbyB5b3Uga25vdyB5b3VyIHJlc3VsdHMgYXJlIGFjY3VyYXRlLlwiO1xuICAgIH0gZWxzZSBpZiAobWF4RGVsdGFzW1wiQm93bGluZyBCYWxsXCJdID4gMzAwKSB7XG4gICAgICAgIHJldHVybiBcIk9uZSBvZiB5b3VyIHJlc3VsdHMgZm9yIHRoZSBib3dsaW5nIGJhbGwgbG9va3MgcHJldHR5IGZhciBvZmYhICBUcnkgZ2V0dGluZyBzb21lIG1vcmUgZGF0YSB0byBtYWtlIHN1cmUgaXQgd2FzIGEgZmx1a2UuXCI7XG4gICAgfSBlbHNlIGlmIChtYXhEZWx0YXNbXCJUZW5uaXMgQmFsbFwiXSA+IDMwMCkge1xuICAgICAgICByZXR1cm4gXCJPbmUgb2YgeW91ciByZXN1bHRzIGZvciB0aGUgdGVubmlzIGJhbGwgbG9va3MgcHJldHR5IGZhciBvZmYhICBUcnkgZ2V0dGluZyBzb21lIG1vcmUgZGF0YSB0byBtYWtlIHN1cmUgaXQgd2FzIGEgZmx1a2UuXCI7XG4gICAgfSBlbHNlIGlmIChcbiAgICAgICAgICAgIChzdGF0ZS5oeXBvdGhlc2lzID09PSBcInNhbWVcIlxuICAgICAgICAgICAgICAgICYmIE1hdGguYWJzKGF2Z3NbXCJCb3dsaW5nIEJhbGxcIl0gLSBhdmdzW1wiVGVubmlzIEJhbGxcIl0pID4gMTAwKVxuICAgICAgICAgICAgfHwgKHN0YXRlLmh5cG90aGVzaXMgPT09IFwiYm93bGluZ1wiXG4gICAgICAgICAgICAgICAgJiYgYXZnc1tcIkJvd2xpbmcgQmFsbFwiXSA8IGF2Z3NbXCJUZW5uaXMgQmFsbFwiXSArIDEwMClcbiAgICAgICAgICAgIHx8IChzdGF0ZS5oeXBvdGhlc2lzID09PSBcInRlbm5pc1wiXG4gICAgICAgICAgICAgICAgJiYgYXZnc1tcIlRlbm5pcyBCYWxsXCJdIDwgYXZnc1tcIkJvd2xpbmcgQmFsbFwiXSArIDEwMClcbiAgICAgICAgICAgICkge1xuICAgICAgICByZXR1cm4gXCJUaG9zZSByZXN1bHRzIGRvbid0IGxvb2sgdmVyeSBjb25zaXN0ZW50IHdpdGggeW91ciBoeXBvdGhlc2lzLiAgSXQncyBmaW5lIGlmIHlvdXIgaHlwb3RoZXNpcyB3YXMgZGlzcHJvdmVuLCB0aGF0J3MgaG93IHNjaWVuY2Ugd29ya3MhXCI7XG4gICAgfSBlbHNlIGlmIChcbiAgICAgICAgICAgIHN0YXRlLmh5cG90aGVzaXMgIT09IFwic2FtZVwiXG4gICAgICAgICAgICB8fCBhdmdzW1wiQm93bGluZyBCYWxsXCJdIDwgODAwXG4gICAgICAgICAgICB8fCBhdmdzW1wiQm93bGluZyBCYWxsXCJdID4gMTUwMFxuICAgICAgICAgICAgfHwgYXZnc1tcIlRlbm5pcyBCYWxsXCJdIDwgODAwXG4gICAgICAgICAgICB8fCBhdmdzW1wiVGVubmlzIEJhbGxcIl0gPiAxNTAwKSB7XG4gICAgICAgIHJldHVybiBcIlRob3NlIHJlc3VsdHMgYXJlIGNvbnNpc3RlbnQsIGJ1dCB0aGV5IGRvbid0IGxvb2sgcXVpdGUgcmlnaHQgdG8gbWUuICBNYWtlIHN1cmUgeW91J3JlIGRyb3BwaW5nIHRoZSBiYWxscyBnZW50bHkgZnJvbSB0aGUgc2FtZSBoZWlnaHQgYWJvdmUgdGhlIHRvcCBzZW5zb3IuXCI7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxufVxuIiwidmFyIFN0b3B3YXRjaCA9IHJlcXVpcmUoJy4vc3RvcHdhdGNoJyk7XG52YXIgY2hlY2tDb2xsaXNpb24gPSByZXF1aXJlKCcuL2NoZWNrLWNvbGxpc2lvbicpXG5cbm1vZHVsZS5leHBvcnRzID0gR2F0ZTtcblxudmFyIEVOVEVSX0ZBREVPVVRfRFVSQVRJT04gPSAyMFxudmFyIEVYSVRfRkFERU9VVF9EVVJBVElPTiA9IDIwXG5cbi8qKlxuICogT3B0aS10aGluZ3kgZ2F0ZS5cbiAqIERldGVjdHMgd2hlbiBib2RpZXMgZW50ZXIgYW5kIGV4aXQgYSBzcGVjaWZpZWQgYXJlYS5cbiAqXG4gKiBwb2x5Z29uIC0gc2hvdWxkIGJlIGEgbGlzdCBvZiB2ZWN0b3Jpc2gsIHdoaWNoIG11c3QgYmUgY29udmV4LlxuICogYm9keSAtIHNob3VsZCBiZSBhIGJvZHksIG9yIG51bGwgdG8gdHJhY2sgYWxsIGJvZGllc1xuICogb3B0cyAtIHtkZWJ1ZzogZmFsc2V9XG4gKlxuICogVXNhZ2UgRXhhbXBsZTpcbiAqIHZhciBnYXRlID0gbmV3IEdhdGUoYXdlc29tZV93b3JsZCwgY29udGFpbmVyX2RpdiwgW3t4OiAwLCB5OiAzMDB9LCAuLi5dLCB7ZGVidWc6IHRydWV9KVxuICogZ2F0ZS5vbignZXhpdCcsIGZ1bmN0aW9uKGRhdGEpIHtcbiAqICAgY29uc29sZS5sb2coXCJZb3UgZXNjYXBlZCBtZSBhZ2FpbiEgSSB3aWxsIGZpbmQgeW91LCBvaCBcIiwgZGF0YS5ib2R5KTtcbiAqIH0pXG4gKi9cbmZ1bmN0aW9uIEdhdGUod29ybGQsIHBvbHlnb24sIHBvcywgYm9keSwgb3B0cykge1xuICAgIG9wdHMgPSBvcHRzIHx8IHt9O1xuICAgIHRoaXMud29ybGQgPSB3b3JsZFxuICAgIHRoaXMuYm9keSA9IGJvZHk7XG4gICAgLy8gYm9kaWVzIGN1cnJlbnRseSBpbnNpZGUgdGhpcyBnYXRlLlxuICAgIHRoaXMuY29udGFpbnMgPSBbXVxuICAgIHRoaXMuX3N1YnNjcmliZSgpXG4gICAgdGhpcy5wb2x5Z29uID0gcG9seWdvblxuICAgIHRoaXMuY29sbGlzaW9uX2JvZHkgPSBQaHlzaWNzLmJvZHkoJ2NvbnZleC1wb2x5Z29uJywge1xuICAgICAgICB2ZXJ0aWNlczogcG9seWdvbixcbiAgICAgICAgdHJlYXRtZW50OiAnbWFnaWMnLFxuICAgICAgICB4OiBwb3NbMF0sXG4gICAgICAgIHk6IHBvc1sxXSxcbiAgICAgICAgdng6IDAsXG4gICAgICAgIGFuZ2xlOiAwLFxuICAgICAgICByZXN0aXR1dGlvbjogMC45LFxuICAgICAgICBzdHlsZXM6IHtcbiAgICAgICAgICAgIGZpbGxTdHlsZTogJyM4NTk5MDAnLFxuICAgICAgICAgICAgYW5nbGVJbmRpY2F0b3I6ICcjNDE0NzAwJ1xuICAgICAgICB9XG4gICAgfSlcbiAgICB0aGlzLm1vdmVkX3BvaW50cyA9IHBvbHlnb24ubWFwKGZ1bmN0aW9uIChwKSB7XG4gICAgICAgIHJldHVybiB7eDogcC54ICsgcG9zWzBdLCB5OiBwLnkgKyBwb3NbMV19XG4gICAgfSk7XG4gICAgdGhpcy52aWV3ID0gdGhpcy53b3JsZC5yZW5kZXJlcigpLmNyZWF0ZVZpZXcodGhpcy5jb2xsaXNpb25fYm9keS5nZW9tZXRyeSwgeyBzdHJva2VTdHlsZTogJyNhYWEnLCBsaW5lV2lkdGg6IDIsIGZpbGxTdHlsZTogJ3JnYmEoMCwwLDAsMCknIH0pXG4gICAgLy8gdGhpcy53b3JsZC5hZGQodGhpcy5jb2xsaXNpb25fYm9keSlcbiAgICBpZiAob3B0cy5kZWJ1ZykgdGhpcy5zcGVha0xvdWRseSgpO1xuICAgIHRoaXMuX2NvbG9yID0gb3B0cy5jb2xvclxuXG4gICAgdGhpcy5fZW50ZXJfZmFkZW91dCA9IDA7XG4gICAgdGhpcy5fZXhpdF9mYWRlb3V0ID0gMDtcbn1cblxuR2F0ZS5wcm90b3R5cGUuX3N1YnNjcmliZSA9IGZ1bmN0aW9uKCkge1xuICAgIFBoeXNpY3MudXRpbC50aWNrZXIub24oZnVuY3Rpb24odGltZSkge1xuICAgICAgICBpZiAodGhpcy5ib2R5KSB7XG4gICAgICAgICAgICB0aGlzLmhhbmRsZUJvZHkodGhpcy5ib2R5KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMud29ybGQuZ2V0Qm9kaWVzKCkuZm9yRWFjaCh0aGlzLmhhbmRsZUJvZHkuYmluZCh0aGlzKSlcbiAgICAgICAgfVxuICAgIH0uYmluZCh0aGlzKSlcblxuICAgIC8vIFN1YnNjcmliZSB0byByZW5kZXIgZXZlbnRzXG4gICAgdGhpcy53b3JsZC5vbigncmVuZGVyJywgdGhpcy5fcmVuZGVyLmJpbmQodGhpcykpO1xuXG4gICAgLy8gU3Vic2NyaWJlIHRvIHNlbGYuICh3SGFUPylcbiAgICB0aGlzLm9uKCdlbnRlcicsIGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLl9lbnRlcl9mYWRlb3V0ID0gRU5URVJfRkFERU9VVF9EVVJBVElPTlxuICAgIH0uYmluZCh0aGlzKSlcbiAgICB0aGlzLm9uKCdleGl0JywgZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuX2V4aXRfZmFkZW91dCA9IEVYSVRfRkFERU9VVF9EVVJBVElPTlxuICAgIH0uYmluZCh0aGlzKSlcbn1cblxuR2F0ZS5wcm90b3R5cGUuX3JlbmRlciA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciByID0gdGhpcy53b3JsZC5yZW5kZXJlcigpO1xuICAgIHZhciBhbHBoYSA9IHRoaXMuX2VudGVyX2ZhZGVvdXQgLyBFTlRFUl9GQURFT1VUX0RVUkFUSU9OXG4gICAgdmFyIHN0cm9rZVN0eWxlcyA9IHtcbiAgICAgICAgZ3JlZW46ICcjMGEwJyxcbiAgICAgICAgcmVkOiAnI2EwMCcsXG4gICAgICAgIHVuZGVmaW5lZDogJyNhYWEnLFxuICAgIH1cbiAgICB2YXIgZmlsbFN0eWxlID0ge1xuICAgICAgICBncmVlbjogJ3JnYmEoNTAsMTAwLDUwLCcrYWxwaGErJyknLFxuICAgICAgICByZWQ6ICdyZ2JhKDEwMCw1MCw1MCwnK2FscGhhKycpJyxcbiAgICAgICAgdW5kZWZpbmVkOiAncmdiYSgwLDAsMCwnK2FscGhhKycpJyxcbiAgICB9XG4gICAgci5kcmF3UG9seWdvbih0aGlzLm1vdmVkX3BvaW50cywge1xuICAgICAgICBzdHJva2VTdHlsZTogc3Ryb2tlU3R5bGVzW3RoaXMuX2NvbG9yXSxcbiAgICAgICAgbGluZVdpZHRoOiAyLFxuICAgICAgICBmaWxsU3R5bGU6IGZpbGxTdHlsZVt0aGlzLl9jb2xvcl0sXG4gICAgfSk7XG5cbiAgICB0aGlzLl9lbnRlcl9mYWRlb3V0ID0gTWF0aC5tYXgoMCwgdGhpcy5fZW50ZXJfZmFkZW91dCAtIDEpXG4gICAgdGhpcy5fZXhpdF9mYWRlb3V0ID0gTWF0aC5tYXgoMCwgdGhpcy5fZXhpdF9mYWRlb3V0IC0gMSlcbn1cblxuR2F0ZS5wcm90b3R5cGUuaGFuZGxlQm9keSA9IGZ1bmN0aW9uKGJvZHkpIHtcbiAgICAvLyBJZ25vcmUgYm9kaWVzIGJlaW5nIGRyYWdnZWQuXG4gICAgaWYgKGJvZHkuZHJhZ2dpbmcpIHJldHVybjtcblxuICAgIHZhciB3YXNJbiA9IHRoaXMuY29udGFpbnMuaW5kZXhPZihib2R5KSAhPSAtMVxuICAgIHZhciBpc0luID0gdGhpcy50ZXN0Qm9keShib2R5KVxuICAgIGlmICghd2FzSW4gJiYgaXNJbikge1xuICAgICAgICB0aGlzLmNvbnRhaW5zLnB1c2goYm9keSlcbiAgICAgICAgdGhpcy5lbWl0KCdlbnRlcicsIHtib2R5OiBib2R5fSlcbiAgICB9XG4gICAgaWYgKHdhc0luICYmICFpc0luKSB7XG4gICAgICAgIHRoaXMuY29udGFpbnMgPSBfLndpdGhvdXQodGhpcy5jb250YWlucywgYm9keSk7XG4gICAgICAgIHRoaXMuZW1pdCgnZXhpdCcsIHtib2R5OiBib2R5fSlcbiAgICB9XG59XG5cbkdhdGUucHJvdG90eXBlLnRlc3RCb2R5ID0gZnVuY3Rpb24oYm9keSkge1xuICAgIGlmICghd2luZG93LmRlYnVnICYmIGJvZHkudHJlYXRtZW50ICE9PSAnZHluYW1pYycpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gY2hlY2tDb2xsaXNpb24odGhpcy5jb2xsaXNpb25fYm9keSwgYm9keSlcbiAgICAvLy8gdmFyIHBvcyA9IGJvZHkuc3RhdGUucG9zXG4gICAgLy8vIHJldHVybiB0aGlzLnRlc3RQb2ludCh7eDogcG9zLngsIHk6IHBvcy55fSlcbn1cblxuR2F0ZS5wcm90b3R5cGUudGVzdFBvaW50ID0gZnVuY3Rpb24odmVjdG9yaXNoKSB7XG4gICAgcmV0dXJuIFBoeXNpY3MuZ2VvbWV0cnkuaXNQb2ludEluUG9seWdvbihcbiAgICAgICAgdmVjdG9yaXNoLFxuICAgICAgICB0aGlzLnBvbHlnb24pO1xufVxuXG4vLyBHYXRlLnByb3RvdHlwZS5ydW5TdG9wd2F0Y2ggPSBmdW5jdGlvbihzdG9wd2F0Y2gpIHtcbiAgICAvLyB0aGlzLm9uKCdlbnRlcicsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgLy8gc3RvcHdhdGNoLnJlc2V0KCk7XG4gICAgICAgIC8vIHN0b3B3YXRjaC5zdGFydCgpO1xuICAgIC8vIH0pO1xuICAgIC8vIHRoaXMub24oJ2V4aXQnLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIC8vIHN0b3B3YXRjaC5zdG9wKCk7XG4gICAgLy8gfSk7XG4vLyB9XG5cbi8qKlxuICogRGVidWdnaW5nIGZ1bmN0aW9uIHRvIGxpc3RlbiB0byBteSBvd24gZXZlbnRzIGFuZCBjb25zb2xlLmxvZyB0aGVtLlxuICovXG5HYXRlLnByb3RvdHlwZS5zcGVha0xvdWRseSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMub24oJ2VudGVyJywgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICBjb25zb2xlLmxvZygnZW50ZXInLCBkYXRhLmJvZHkpXG4gICAgfSlcbiAgICB0aGlzLm9uKCdleGl0JywgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICBjb25zb2xlLmxvZygnZXhpdCcsIGRhdGEuYm9keSlcbiAgICB9KVxuICAgIHJldHVybiB7YnV0Q2FycnlBQmlnU3RpY2s6ICcnfVxufVxuXG5fLmV4dGVuZChHYXRlLnByb3RvdHlwZSwgUGh5c2ljcy51dGlsLnB1YnN1Yi5wcm90b3R5cGUpXG4iLCJcbnZhciBDYW5HcmFwaCA9IHJlcXVpcmUoJy4vY2FuZ3JhcGgnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEdyYXBoXG5cbmZ1bmN0aW9uIGdldERhdHVtKGl0ZW0pIHtcbiAgICByZXR1cm4gaXRlbS5hdHRyLnNwbGl0KCcuJykucmVkdWNlKGZ1bmN0aW9uIChub2RlLCBhdHRyKSB7XG4gICAgICAgIHJldHVybiBub2RlW2F0dHJdXG4gICAgfSwgaXRlbS5ib2R5LnN0YXRlKVxufVxuXG5mdW5jdGlvbiBHcmFwaChwYXJlbnQsIHRyYWNraW5nLCBvcHRpb25zKSB7XG4gICAgdGhpcy5vID0gXy5leHRlbmQoe1xuICAgICAgICB0b3A6IDEwLFxuICAgICAgICBsZWZ0OiAxMCxcbiAgICAgICAgd2lkdGg6IDYwMCxcbiAgICAgICAgaGVpZ2h0OiA0MDAsXG4gICAgICAgIHdvcmxkSGVpZ2h0OiAyMDBcbiAgICB9LCBvcHRpb25zKVxuICAgIHRoaXMudHJhY2tpbmcgPSB0cmFja2luZ1xuICAgIHRoaXMuZGF0YSA9IFtdXG4gICAgdGhpcy5ub2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJylcbiAgICB0aGlzLm5vZGUuY2xhc3NOYW1lID0gJ2dyYXBoJ1xuICAgIHRoaXMubm9kZS53aWR0aCA9IHRoaXMuby53aWR0aFxuICAgIHRoaXMubm9kZS5oZWlnaHQgPSB0aGlzLm8uaGVpZ2h0XG4gICAgdGhpcy5ub2RlLnN0eWxlLnRvcCA9IHRoaXMuby50b3AgKyAncHgnXG4gICAgdGhpcy5ub2RlLnN0eWxlLmxlZnQgPSB0aGlzLm8ubGVmdCArICdweCdcbiAgICB2YXIgbnVtZ3JhcGhzID0gT2JqZWN0LmtleXModHJhY2tpbmcpLmxlbmd0aFxuICAgIHZhciBncmFwaGhlaWdodCA9IHRoaXMuby5oZWlnaHQgLyBudW1ncmFwaHNcbiAgICBwYXJlbnQuYXBwZW5kQ2hpbGQodGhpcy5ub2RlKVxuXG4gICAgdGhpcy5ncmFwaHMgPSB7fVxuICAgIHZhciBpID0gMFxuICAgIGZvciAodmFyIG5hbWUgaW4gdHJhY2tpbmcpIHtcbiAgICAgICAgdGhpcy5ncmFwaHNbbmFtZV0gPSBuZXcgQ2FuR3JhcGgoe1xuICAgICAgICAgICAgbm9kZTogdGhpcy5ub2RlLFxuICAgICAgICAgICAgbWluc2NhbGU6IHRyYWNraW5nW25hbWVdLm1pbnNjYWxlLFxuICAgICAgICAgICAgdGl0bGU6IHRyYWNraW5nW25hbWVdLnRpdGxlLFxuICAgICAgICAgICAgdG9wOiBncmFwaGhlaWdodCAqIGkrKyxcbiAgICAgICAgICAgIGxlZnQ6IDAsXG4gICAgICAgICAgICB3aWR0aDogdGhpcy5vLndpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0OiBncmFwaGhlaWdodCxcbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICAvKlxuICAgIHRoaXMuZ3JhcGggPSBuZXcgUmlja3NoYXcuR3JhcGgoe1xuICAgICAgICBlbGVtZW50OiB0aGlzLm5vZGUsXG4gICAgICAgIHdpZHRoOiA2MDAsXG4gICAgICAgIGhlaWdodDogNjAwLFxuICAgICAgICByZW5kZXJlcjogJ2xpbmUnLFxuICAgICAgICBzZXJpZXM6IG5ldyBSaWNrc2hhdy5TZXJpZXMoXG4gICAgICAgICAgICB0cmFja2luZy5tYXAoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge25hbWU6IGl0ZW0ubmFtZX1cbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgdW5kZWZpbmVkLCB7XG4gICAgICAgICAgICAgICAgdGltZUludGVydmFsOiAyNTAsXG4gICAgICAgICAgICAgICAgbWF4RGF0YVBvaW50czogMTAwLFxuICAgICAgICAgICAgICAgIHRpbWVCYXNlOiBuZXcgRGF0ZSgpLmdldFRpbWUoKSAvIDEwMDBcbiAgICAgICAgICAgIH1cbiAgICAgICAgKVxuICAgIH0pXG4gICAgKi9cbn1cblxuR3JhcGgucHJvdG90eXBlID0ge1xuICAgIHVwZGF0ZURhdGE6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGRhdGEgPSB7fVxuICAgICAgICB2YXIgaGVpZ2h0ID0gdGhpcy5vLndvcmxkSGVpZ2h0XG4gICAgICAgIHRoaXMubm9kZS5nZXRDb250ZXh0KCcyZCcpLmNsZWFyUmVjdCgwLCAwLCB0aGlzLm5vZGUud2lkdGgsIHRoaXMubm9kZS5oZWlnaHQpXG4gICAgICAgIGZvciAodmFyIG5hbWUgaW4gdGhpcy50cmFja2luZykge1xuICAgICAgICAgICAgdGhpcy5ncmFwaHNbbmFtZV0uYWRkUG9pbnQodGhpcy5nZXREYXR1bShuYW1lKSlcbiAgICAgICAgICAgIHRoaXMuZ3JhcGhzW25hbWVdLmRyYXcoKVxuICAgICAgICB9XG4gICAgfSxcbiAgICBnZXREYXR1bTogZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgICAgdmFyIGl0ZW0gPSB0aGlzLnRyYWNraW5nW25hbWVdXG4gICAgICAgIGlmIChpdGVtLmZuKSB7XG4gICAgICAgICAgICByZXR1cm4gaXRlbS5mbigpO1xuICAgICAgICB9IGVsc2UgaWYgKGl0ZW0uYXR0ciA9PT0gJ3Bvcy55Jykge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuby53b3JsZEhlaWdodCAtIGl0ZW0uYm9keS5zdGF0ZS5wb3MueVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGdldERhdHVtKGl0ZW0pXG4gICAgICAgIH1cbiAgICB9LFxuICAgIHVwZGF0ZTogZnVuY3Rpb24gKHRpbWVzdGVwKSB7XG4gICAgICAgIHRoaXMudXBkYXRlRGF0YSgpXG4gICAgfVxufVxuXG4iLCJ2YXIgQmFzZSA9IHJlcXVpcmUoJy4vYmFzZScpO1xudmFyIEdhdGUgPSByZXF1aXJlKCcuL2dhdGUnKTtcbnZhciBTdG9wd2F0Y2ggPSByZXF1aXJlKCcuL3N0b3B3YXRjaCcpO1xudmFyIExvZ0Jvb2sgPSByZXF1aXJlKCcuL2xvZ2Jvb2snKTtcbnZhciBQbGF5UGF1c2UgPSByZXF1aXJlKCcuL3BsYXlwYXVzZScpO1xudmFyIEhpbGxzSW50cm8gPSByZXF1aXJlKCcuL2ludHJvL2hpbGxzX2ludHJvLmpzeCcpO1xudmFyIGhpbGxzRGF0YUNoZWNrZXIgPSByZXF1aXJlKCcuL2hpbGxzZGF0YWNoZWNrZXInKTtcbnZhciBDYXZlRHJhdyA9IHJlcXVpcmUoJy4vY2F2ZWRyYXcnKTtcbnZhciB1dGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XG52YXIgdGVycmFpbiA9IHJlcXVpcmUoJy4vdGVycmFpbicpO1xuXG5mdW5jdGlvbiByYW5kb20obWluLCBtYXgpe1xuICAgIHJldHVybiAoTWF0aC5yYW5kb20oKSAqIChtYXgtbWluKSArIG1pbil8MFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2UuZXh0ZW5kKGZ1bmN0aW9uIEhpbGxzKGNvbnRhaW5lciwgb3B0aW9ucykge1xuICAgIEJhc2UuY2FsbCh0aGlzLCBjb250YWluZXIsIG9wdGlvbnMsIFwiaW1hZ2VzL2xhYl9iYWNrZ3JvdW5kLmpwZ1wiLFxuICAgICAgICB0cnVlIC8qIGRpc2FibGVCb3VuZHMgKi8pXG59LCB7XG4gICAgZHJvcE9iamVjdHM6IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgICAgIHRoaXMuYmFsbCA9IFBoeXNpY3MuYm9keSgnY2lyY2xlJywge1xuICAgICAgICAgICAgeDogMjUwLFxuICAgICAgICAgICAgeTogNDAwLFxuICAgICAgICAgICAgdng6IC1NYXRoLnJhbmRvbSgpICogMC4xLFxuICAgICAgICAgICAgcmFkaXVzOiAyMCxcbiAgICAgICAgICAgIG1hc3M6IDkwMCxcbiAgICAgICAgICAgIGNvZjogMC4xLFxuICAgICAgICAgICAgcmVzdGl0dXRpb246IDAuMDEsXG4gICAgICAgICAgICBkaXNwbGF5TmFtZTogXCJCb3dsaW5nIEJhbGxcIixcbiAgICAgICAgICAgIHN0eWxlczoge1xuICAgICAgICAgICAgICAgIGltYWdlOiBcImltYWdlcy9ib3dsaW5nX2JhbGwucG5nXCJcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMud29ybGQuYWRkKHRoaXMuYmFsbCk7XG4gICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgc2V0VGltZW91dChjYWxsYmFjaywgNTAwKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgIHN0YXJ0V2Fsa3Rocm91Z2g6IGZ1bmN0aW9uICgpIHtcbiAgICAgICBIaWxsc0ludHJvKHRoaXMsIGZ1bmN0aW9uIChoeXBvdGhlc2lzKSB7XG4gICAgICAgICAgIGNvbnNvbGUubG9nKCdHb3QgdGhlIGh5cG90aGVzaXMhIScsIGh5cG90aGVzaXMpO1xuICAgICAgICAgICB0aGlzLnNldHVwRGF0YUNoZWNrZXIoaHlwb3RoZXNpcyk7XG4gICAgICAgfS5iaW5kKHRoaXMpLCB0aGlzLm9wdGlvbnMuZGVidWcgPT09ICd0cnVlJylcbiAgIH0sXG5cbiAgICBzZXR1cERhdGFDaGVja2VyOiBmdW5jdGlvbiAoaHlwb3RoZXNpcykge1xuICAgICAgICB2YXIgZGF0YUNoZWNrZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICBkYXRhQ2hlY2tlci5jbGFzc05hbWUgPSBcImhpbGxzLWRhdGEtY2hlY2tlclwiO1xuICAgICAgICB0aGlzLnNpZGVCYXIuYXBwZW5kQ2hpbGQoZGF0YUNoZWNrZXIpO1xuICAgICAgICBoaWxsc0RhdGFDaGVja2VyKGRhdGFDaGVja2VyLCB0aGlzLmxvZ0Jvb2ssIGh5cG90aGVzaXMpO1xuICAgIH0sXG5cbiAgICBzZXR1cFNsaWRlcjogZnVuY3Rpb24gKGNvbnRhaW5lcikge1xuICAgICAgICB0aGlzLnNsaWRlciA9ICQoJzxpbnB1dCB0eXBlPVwicmFuZ2VcIiBtaW49XCIwXCIgbWF4PVwiMTQwXCIgc3RlcD1cIjEwXCIgdmFsdWU9XCIxMDBcIi8+Jyk7XG4gICAgICAgIHRoaXMuc2xpZGVyRGlzcGxheSA9ICQoJzxzcGFuPjEwMCBjbTwvc3Bhbj4nKTtcbiAgICAgICAgdmFyIGhhbmRsZVNsaWRlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLnNldHVwVGVycmFpbigyMDAsIHRoaXMuc2xpZGVyLnZhbCgpKTtcbiAgICAgICAgICAgIHRoaXMuc2xpZGVyRGlzcGxheS5odG1sKHRoaXMuc2xpZGVyLnZhbCgpICsgXCIgY21cIik7XG4gICAgICAgIH0uYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5zbGlkZXIuY2hhbmdlKGhhbmRsZVNsaWRlKS5vbignaW5wdXQnLCBoYW5kbGVTbGlkZSk7XG4gICAgICAgIHZhciBkaXYgPSAkKCc8ZGl2IGNsYXNzPVwiaGlsbC1zbGlkZXJcIi8+Jyk7XG4gICAgICAgICQoY29udGFpbmVyKS5hcHBlbmQoZGl2KTtcbiAgICAgICAgZGl2LmFwcGVuZCh0aGlzLnNsaWRlcik7XG4gICAgICAgIGRpdi5hcHBlbmQodGhpcy5zbGlkZXJEaXNwbGF5KTtcbiAgICB9LFxuXG4gICAgc2V0dXBUZXJyYWluOiBmdW5jdGlvbiAocmFtcEhlaWdodCwgaGlsbEhlaWdodCkge1xuICAgICAgICBpZiAodGhpcy50ZXJyYWluQ2FudmFzKSB7XG4gICAgICAgICAgICB0aGlzLnRlcnJhaW5DYW52YXMuY2xlYXIoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy50ZXJyYWluQmVoYXZpb3IpIHtcbiAgICAgICAgICAgIHRoaXMud29ybGQucmVtb3ZlKHRoaXMudGVycmFpbkJlaGF2aW9yKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgdGVycmFpbkhlaWdodCA9IHRoaXMubWtUZXJyYWluSGVpZ2h0RnVuY3Rpb24ocmFtcEhlaWdodCwgaGlsbEhlaWdodCk7XG4gICAgICAgIHRoaXMudGVycmFpbkNhbnZhcy5kcmF3KHRlcnJhaW5IZWlnaHQpXG4gICAgICAgIHRoaXMudGVycmFpbkJlaGF2aW9yID0gUGh5c2ljcy5iZWhhdmlvcigndGVycmFpbi1jb2xsaXNpb24tZGV0ZWN0aW9uJywge1xuICAgICAgICAgICAgYWFiYjogUGh5c2ljcy5hYWJiKDAsIDAsIHRoaXMub3B0aW9ucy53aWR0aCwgdGhpcy5vcHRpb25zLmhlaWdodCksXG4gICAgICAgICAgICB0ZXJyYWluSGVpZ2h0OiB0ZXJyYWluSGVpZ2h0LFxuICAgICAgICAgICAgcmVzdGl0dXRpb246IDAuMixcbiAgICAgICAgICAgIGNvZjogMC4xXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLndvcmxkLmFkZCh0aGlzLnRlcnJhaW5CZWhhdmlvcik7XG4gICAgfSxcblxuICAgIG1rVGVycmFpbkhlaWdodEZ1bmN0aW9uOiBmdW5jdGlvbiAocmFtcEhlaWdodCwgaGlsbEhlaWdodCkge1xuICAgICAgICB2YXIgcmFtcFdpZHRoID0gdGhpcy5vcHRpb25zLndpZHRoIC8gNDtcbiAgICAgICAgdmFyIHJhbXBTY2FsZSA9IHJhbXBIZWlnaHQgLyBNYXRoLnBvdyhyYW1wV2lkdGgsIDIpO1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgICAgIGlmICh4IDwgcmFtcFdpZHRoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIE1hdGgucG93KHJhbXBXaWR0aCAtIHgsIDIpICogcmFtcFNjYWxlO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh4IDwgMyAqIHJhbXBXaWR0aCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBoaWxsSGVpZ2h0IC8gMiArIE1hdGguY29zKE1hdGguUEkgKiB4IC8gcmFtcFdpZHRoKSAqIGhpbGxIZWlnaHQgLyAyO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgIH0sXG5cbiAgICBzZXR1cDogZnVuY3Rpb24gKGNvbnRhaW5lcikge1xuICAgICAgICB2YXIgd29ybGQgPSB0aGlzLndvcmxkXG4gICAgICAgIHZhciBncmF2aXR5ID0gUGh5c2ljcy5iZWhhdmlvcignY29uc3RhbnQtYWNjZWxlcmF0aW9uJylcbiAgICAgICAgZ3Jhdml0eS5zZXRBY2NlbGVyYXRpb24oe3g6IDAsIHk6LjAwMDN9KTtcbiAgICAgICAgd29ybGQuYWRkKGdyYXZpdHkpO1xuICAgICAgICAvLyByZWdpc3RlciwgYnV0IGRvbid0IHNldCB1cCB0aGUgYmVoYXZpb3I7IHRoYXQgaXMgZG9uZSBpbiBzZXR1cFRlcnJhaW4oKVxuICAgICAgICBQaHlzaWNzLmJlaGF2aW9yKCd0ZXJyYWluLWNvbGxpc2lvbi1kZXRlY3Rpb24nLCB0ZXJyYWluKTtcbiAgICAgICAgdGhpcy50ZXJyYWluQ2FudmFzID0gbmV3IENhdmVEcmF3KCQoJyN1bmRlci1jYW52YXMnKSwgOTAwLCA3MDApXG4gICAgICAgIHRoaXMuc2V0dXBUZXJyYWluKDIwMCwgMTAwKTtcblxuICAgICAgICB2YXIgc2lkZUJhciA9IHRoaXMuc2lkZUJhciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgIHNpZGVCYXIuY2xhc3NOYW1lID0gXCJzaWRlLWJhclwiO1xuICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoc2lkZUJhcik7XG4gICAgICAgIHZhciB0b3BHYXRlID0gbmV3IEdhdGUod29ybGQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXRpbC5tYWtlUmVjdCgwLCAwLCAxMCwgMjAwKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbNzUwLCA2MDBdLCBudWxsLCB7ZGVidWc6IHRydWUsIHNob3c6IHRydWUsIGNvbG9yOiAnZ3JlZW4nfSk7XG4gICAgICAgIHZhciBib3R0b21HYXRlID0gbmV3IEdhdGUod29ybGQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXRpbC5tYWtlUmVjdCgwLCAwLCAxMCwgMjAwKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbODAwLCA2MDBdLCBudWxsLCB7ZGVidWc6IHRydWUsIHNob3c6IHRydWUsIGNvbG9yOiAncmVkJ30pO1xuICAgICAgICB2YXIgbG9nQ29sdW1ucyA9IFt7bmFtZTogXCIxMDAgY21cIn1dO1xuICAgICAgICB2YXIgbG9nQm9vayA9IHRoaXMubG9nQm9vayA9IG5ldyBMb2dCb29rKHdvcmxkLCBzaWRlQmFyLCAzLCBsb2dDb2x1bW5zKTtcbiAgICAgICAgdG9wR2F0ZS5vbignZW50ZXInLCBmdW5jdGlvbihlbGVtKSB7XG4gICAgICAgICAgICB2YXIgY29sTmFtZSA9IHRoaXMuc2xpZGVyLnZhbCgpLnRvU3RyaW5nKCkgKyBcIiBjbVwiO1xuICAgICAgICAgICAgbG9nQm9vay5oYW5kbGVTdGFydChjb2xOYW1lLCBlbGVtLmJvZHkudWlkKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgYm90dG9tR2F0ZS5vbignZW50ZXInLCBmdW5jdGlvbihlbGVtKSB7XG4gICAgICAgICAgICB2YXIgY29sTmFtZSA9IHRoaXMuc2xpZGVyLnZhbCgpLnRvU3RyaW5nKCkgKyBcIiBjbVwiO1xuICAgICAgICAgICAgbG9nQm9vay5oYW5kbGVFbmQoY29sTmFtZSwgZWxlbS5ib2R5LnVpZCk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICAgIHZhciBidXR0b25Db250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICB2YXIgcGxheVBhdXNlID0gbmV3IFBsYXlQYXVzZSh3b3JsZCwgYnV0dG9uQ29udGFpbmVyKTtcbiAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGJ1dHRvbkNvbnRhaW5lcik7XG4gICAgICAgIHRoaXMuc2V0dXBTbGlkZXIoYnV0dG9uQ29udGFpbmVyKTtcblxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLndhbGspIHtcbiAgICAgICAgICAgdGhpcy5zdGFydFdhbGt0aHJvdWdoKClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZHJvcE9iamVjdHMoKTtcbiAgICAgICAgICAgIHRoaXMuc2V0dXBEYXRhQ2hlY2tlcignc2FtZScpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFBpY2sgdXAgb25lIHRoZSBiYWxsIGFuZCBkcm9wIGl0LlxuICAgICAqXG4gICAgICogQHBhcmFtIGNhbGxiYWNrIEdldHMgY2FsbGVkIHdoZW4gdGhlIGRlbW9uc3RyYXRpb24gaXMgb3Zlci5cbiAgICAgKi9cbiAgICBkZW1vbnN0cmF0ZURyb3A6IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBiYWxsID0gdGhpcy5iYWxsO1xuICAgICAgICB2YXIgdGFyZ2V0WCA9IDIwO1xuICAgICAgICB2YXIgdGFyZ2V0WSA9IDQ5NTtcblxuICAgICAgICBiYWxsLnRyZWF0bWVudCA9ICdraW5lbWF0aWMnO1xuICAgICAgICBiYWxsLnN0YXRlLnZlbC54ID0gKHRhcmdldFggLSBiYWxsLnN0YXRlLnBvcy54KSAvIDE1MDA7XG4gICAgICAgIGJhbGwuc3RhdGUudmVsLnkgPSAodGFyZ2V0WSAtIGJhbGwuc3RhdGUucG9zLnkpIC8gMTUwMDtcbiAgICAgICAgYmFsbC5yZWNhbGMoKTtcblxuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgYmFsbC50cmVhdG1lbnQgPSAnc3RhdGljJztcbiAgICAgICAgICAgIGJhbGwuc3RhdGUucG9zLnggPSB0YXJnZXRYO1xuICAgICAgICAgICAgYmFsbC5zdGF0ZS5wb3MueSA9IHRhcmdldFk7XG4gICAgICAgICAgICBiYWxsLnN0YXRlLnZlbC54ID0gMDtcbiAgICAgICAgICAgIGJhbGwuc3RhdGUudmVsLnkgPSAwO1xuICAgICAgICAgICAgYmFsbC5yZWNhbGMoKTtcblxuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBiYWxsLnRyZWF0bWVudCA9ICdkeW5hbWljJztcbiAgICAgICAgICAgICAgICBiYWxsLnJlY2FsYygpO1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICAgICAgfSwgMzAwMClcbiAgICAgICAgICAgIH0sIDE1MDApXG4gICAgICAgIH0sIDE1MDApXG4gICAgfVxufSk7XG4iLCJ2YXIgRGF0YUNoZWNrZXIgPSByZXF1aXJlKCcuL2RhdGFjaGVja2VyLmpzeCcpO1xudmFyIHV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBoaWxsc0RhdGFDaGVja2VyO1xuXG52YXIgX2luaXRpYWxUZXh0ID0gXCJEbyBhbiBleHBlcmltZW50IHRvIHNlZSBpZiB5b3UgY2FuIGZpZ3VyZSBvdXQgd2hldGhlciBhIGJhbGwgd2hpY2ggcm9sbHMgb3ZlciBhIGhpbGwgY29tZXMgb3V0IGF0IGEgZGlmZmVyZW50IHNwZWVkLCBhbmQgbGV0IG1lIGtub3cgd2hlbiB5b3UncmUgZG9uZSFcIjtcblxudmFyIF9uZXh0VVJMID0gXCI/QmFjb25cIjtcblxudmFyIF9oeXBvdGhlc2VzID0gW1xuICAgIHtcbiAgICAgICAgbmFtZTogXCJzYW1lXCIsXG4gICAgICAgIGJ1dHRvblRleHQ6IFwiVGhlIHNwZWVkIGRvZXMgbm90IGRlcGVuZCBvbiB0aGUgc2l6ZSBvZiB0aGUgaGlsbC5cIixcbiAgICAgICAgdGV4dDogXCJ0aGF0IHRoZSBzcGVlZCB3aWxsIG5vdCBkZXBlbmQgb24gdGhlIHNpemUgb2YgdGhlIGhpbGxcIixcbiAgICB9LFxuICAgIHtcbiAgICAgICAgbmFtZTogXCJmYXN0ZXJcIixcbiAgICAgICAgYnV0dG9uVGV4dDogXCJUaGUgYmFsbCBjb21lcyBvdXQgZmFzdGVyIGlmIHRoZSBoaWxsIGlzIGxhcmdlci5cIixcbiAgICAgICAgdGV4dDogXCJ0aGF0IHRoZSBiYWxsIHdpbGwgY29tZSBvdXQgZmFzdGVyIGlmIHRoZSBoaWxsIGlzIGxhcmdlclwiLFxuICAgIH0sXG4gICAge1xuICAgICAgICBuYW1lOiBcInNsb3dlclwiLFxuICAgICAgICBidXR0b25UZXh0OiBcIlRoZSBiYWxsIGNvbWVzIG91dCBzbG93ZXIgaWYgdGhlIGhpbGwgaXMgbGFyZ2VyLlwiLFxuICAgICAgICB0ZXh0OiBcInRoYXQgdGhlIGJhbGwgd2lsbCBjb21lIG91dCBzbG93ZXIgaWYgdGhlIGhpbGwgaXMgbGFyZ2VyXCIsXG4gICAgfSxcbl1cblxuZnVuY3Rpb24gaGlsbHNEYXRhQ2hlY2tlcihjb250YWluZXIsIGxvZ0Jvb2ssIGh5cG90aGVzaXMpIHtcbiAgICByZXR1cm4gUmVhY3QucmVuZGVyQ29tcG9uZW50KERhdGFDaGVja2VyKHtcbiAgICAgICAgaW5pdGlhbFRleHQ6IF9pbml0aWFsVGV4dCxcbiAgICAgICAgaW5pdGlhbEh5cG90aGVzaXM6IGh5cG90aGVzaXMsXG4gICAgICAgIHBvc3NpYmxlSHlwb3RoZXNlczogX2h5cG90aGVzZXMsXG4gICAgICAgIHJlc3VsdDogZnVuY3Rpb24gKHN0YXRlKSB7cmV0dXJuIF9yZXN1bHQobG9nQm9vaywgc3RhdGUpO30sXG4gICAgICAgIG5leHRVUkw6IF9uZXh0VVJMLFxuICAgIH0pLCBjb250YWluZXIpO1xufVxuXG5mdW5jdGlvbiBfcmVzdWx0KGxvZ0Jvb2ssIHN0YXRlKSB7XG4gICAgdmFyIGNsZWFuZWREYXRhID0ge31cbiAgICBmb3IgKHZhciBuYW1lIGluIGxvZ0Jvb2suZGF0YSkge1xuICAgICAgICBpZiAobG9nQm9vay5kYXRhW25hbWVdKSB7XG4gICAgICAgICAgICB2YXIgaGVpZ2h0ID0gbmFtZS5zbGljZSgwLCAtMyk7IC8vIHJlbW92ZSBcIiBjbVwiXG4gICAgICAgICAgICBjbGVhbmVkRGF0YVtoZWlnaHRdID0gbG9nQm9vay5kYXRhW25hbWVdO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8vIGNoZWNrIHRoYXQgdGhleSBoYXZlIGVub3VnaCBkYXRhOiBhdCBsZWFzdCAzIHBvaW50cyBlYWNoIGluIGF0IGxlYXN0IDRcbiAgICAvLyBoaWxsIHNpemVzLCBpbmNsdWRpbmcgb25lIGxlc3MgdGhhbiA1MGNtIGFuZCBvbmUgZ3JlYXRlciB0aGFuIDEwMGNtLlxuICAgIGlmIChfLnNpemUoY2xlYW5lZERhdGEpIDwgNCkge1xuICAgICAgICByZXR1cm4gXCJZb3Ugb25seSBoYXZlIGRhdGEgZm9yIGEgZmV3IHBvc3NpYmxlIGhpbGxzISAgTWFrZSBzdXJlIHlvdSBoYXZlIGRhdGEgb24gYSBudW1iZXIgb2YgcG9zc2libGUgaGlsbHMgc28geW91IGtub3cgeW91ciByZXN1bHRzIGFwcGx5IHRvIGFueSBoaWxsIHNpemUuXCI7XG4gICAgfSBlbHNlIGlmIChfLmZpbHRlcihjbGVhbmVkRGF0YSwgZnVuY3Rpb24gKGRhdGEsIGhlaWdodCkge3JldHVybiBkYXRhLmxlbmd0aCA+PSAzO30pLmxlbmd0aCA8IDQpIHtcbiAgICAgICAgcmV0dXJuIFwiWW91IG9ubHkgaGF2ZSBhIGxpdHRsZSBiaXQgb2YgZGF0YSBmb3Igc29tZSBvZiB0aG9zZSBwb3NzaWJsZSBoaWxscy4gIE1ha2Ugc3VyZSB5b3UgaGF2ZSBzZXZlcmFsIGRhdGEgcG9pbnRzIG9uIGEgbnVtYmVyIG9mIHBvc3NpYmxlIGhpbGxzIHNvIHlvdSBrbm93IHlvdXIgcmVzdWx0cyBhcHBseSB0byBhbnkgaGlsbCBzaXplLlwiO1xuICAgIH0gZWxzZSBpZiAoXy5tYXgoXy5tYXAoXy5rZXlzKGNsZWFuZWREYXRhKSwgcGFyc2VJbnQpKSA8PSAxMDApIHtcbiAgICAgICAgcmV0dXJuIFwiWW91IGRvbid0IGhhdmUgYW55IGRhdGEgZm9yIGxhcmdlIGhpbGxzISAgVHJ5IGNvbGxlY3Rpbmcgc29tZSBkYXRhIG9uIGxhcmdlIGhpbGxzIHRvIG1ha2Ugc3VyZSB5b3VyIHJlc3VsdHMgYXBwbHkgdG8gdGhlbS5cIjtcbiAgICB9IGVsc2UgaWYgKF8ubWluKF8ubWFwKF8ua2V5cyhjbGVhbmVkRGF0YSksIHBhcnNlSW50KSkgPj0gNTApIHtcbiAgICAgICAgcmV0dXJuIFwiWW91IGRvbid0IGhhdmUgYW55IGRhdGEgZm9yIHNtYWxsIGhpbGxzISAgVHJ5IGNvbGxlY3Rpbmcgc29tZSBkYXRhIG9uIHNtYWxsIGhpbGxzIHRvIG1ha2Ugc3VyZSB5b3VyIHJlc3VsdHMgYXBwbHkgdG8gdGhlbS5cIjtcbiAgICB9XG5cbiAgICAvLyBjaGVjayB0aGF0IHRoZXkgZG9uJ3QgaGF2ZSBiaWcgb3V0bGllcnMgaW4gYW55IG9mIHRoZWlyIGNvbHVtbnMuXG4gICAgdmFyIGF2Z3MgPSB7fVxuICAgIGZvciAodmFyIGhlaWdodCBpbiBjbGVhbmVkRGF0YSkge1xuICAgICAgICBhdmdzW2hlaWdodF0gPSB1dGlsLmF2ZyhjbGVhbmVkRGF0YVtoZWlnaHRdKTtcbiAgICAgICAgaWYgKF8uYW55KGNsZWFuZWREYXRhW2hlaWdodF0sIGZ1bmN0aW9uIChkYXR1bSkge3JldHVybiBNYXRoLmFicyhhdmdzW2hlaWdodF0gLSBwYXJzZUludChkYXR1bSkpID4gMzAwO30pKSB7XG4gICAgICAgICAgICByZXR1cm4gXCJPbmUgb2YgeW91ciByZXN1bHRzIGZvciBcIitoZWlnaHQrXCIgY20gbG9va3MgYSBiaXQgb2ZmISAgVHJ5IGNvbGxlY3Rpbmcgc29tZSBtb3JlIGRhdGEgdG8gbWFrZSBzdXJlIGl0J3MgYSBmbHVrZS5cIlxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gY2hlY2sgdGhhdCB0aGVpciByZXN1bHRzIGFyZSBjb25zaXN0ZW50IHdpdGggdGhlaXIgaHlwb3RoZXNpcywgYW5kIHRoYXRcbiAgICAvLyB0aGVpciBoeXBvdGhlc2lzIGlzIGNvcnJlY3QuXG4gICAgdmFyIHRyYW5zcG9zZWQgPSBfLnppcC5hcHBseShfLnBhaXJzKGF2Z3MpKTtcbiAgICB2YXIgY29ycmVsYXRpb24gPSB1dGlsLmNvcnJlbGF0aW9uKF8ubWFwKHRyYW5zcG9zZWRbMF0sIHBhcnNlSW50KSwgdHJhbnNwb3NlZFsxXSk7XG4gICAgaWYgKFxuICAgICAgICAgICAgKHN0YXRlLmh5cG90aGVzaXMgPT09IFwic2FtZVwiXG4gICAgICAgICAgICAgICAgJiYgTWF0aC5hYnMoXy5tYXgoXy52YWx1ZXMoYXZncykpIC0gXy5taW4oXy52YWx1ZXMoYXZncykpKSA+IDEwMClcbiAgICAgICAgICAgIHx8IChzdGF0ZS5oeXBvdGhlc2lzID09PSBcImZhc3RlclwiXG4gICAgICAgICAgICAgICAgJiYgY29ycmVsYXRpb24gPiAtMC41KSAvLyBuZWdhdGl2ZSBjb3JyZWxhdGlvbiB3b3VsZCBiZSB0YWxsZXIgPT4gc2hvcnRlciB0aW1lID0+IGZhc3RlclxuICAgICAgICAgICAgfHwgKHN0YXRlLmh5cG90aGVzaXMgPT09IFwic2xvd2VyXCJcbiAgICAgICAgICAgICAgICAmJiBjb3JyZWxhdGlvbiA8IDAuNSkpIHtcbiAgICAgICAgcmV0dXJuIFwiVGhvc2UgcmVzdWx0cyBkb24ndCBsb29rIHZlcnkgY29uc2lzdGVudCB3aXRoIHlvdXIgaHlwb3RoZXNpcy4gIEl0J3MgZmluZSBpZiB5b3VyIGh5cG90aGVzaXMgd2FzIGRpc3Byb3ZlbiwgdGhhdCdzIGhvdyBzY2llbmNlIHdvcmtzIVwiO1xuICAgIH0gZWxzZSBpZiAoXG4gICAgICAgICAgICBzdGF0ZS5oeXBvdGhlc2lzICE9PSBcInNhbWVcIlxuICAgICAgICAgICAgfHwgXy5tYXgoXy52YWx1ZXMoYXZncykpID4gMjAwXG4gICAgICAgICAgICB8fCBfLm1pbihfLnZhbHVlcyhhdmdzKSkgPCAxNDApIHtcbiAgICAgICAgcmV0dXJuIFwiVGhvc2UgcmVzdWx0cyBhcmUgY29uc2lzdGVudCwgYnV0IHRoZXkgZG9uJ3QgbG9vayBxdWl0ZSByaWdodCB0byBtZS4gIE1ha2Ugc3VyZSB5b3UncmUgZHJvcHBpbmcgdGhlIGJhbGxzIGdlbnRseSBmcm9tIHRoZSB0b3Agb2YgdGhlIHJhbXAgZWFjaCB0aW1lLlwiO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbn1cbiIsIlxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgQmFzZTogcmVxdWlyZSgnLi9iYXNlJyksXG4gICAgQmFjb246IHJlcXVpcmUoJy4vYmFjb24uanN4JyksXG4gICAgRGVtbzogcmVxdWlyZSgnLi9kZW1vJyksXG4gICAgTmV3dG9uMTogcmVxdWlyZSgnLi9uZXd0b24xJyksXG4gICAgT3JiaXQ6IHJlcXVpcmUoJy4vb3JiaXQnKSxcbiAgICBNb29uOiByZXF1aXJlKCcuL21vb24nKSxcbiAgICBBc3Rlcm9pZHM6IHJlcXVpcmUoJy4vYXN0ZXJvaWRzJyksXG4gICAgU2xvcGU6IHJlcXVpcmUoJy4vc2xvcGUnKSxcbiAgICBEcm9wOiByZXF1aXJlKCcuL2Ryb3AnKSxcbiAgICBUcnlHcmFwaDogcmVxdWlyZSgnLi90cnktZ3JhcGgnKSxcbiAgICBDYXZlRHJhdzogcmVxdWlyZSgnLi9jYXZlZHJhdycpLFxuICAgIEhpbGxzOiByZXF1aXJlKCcuL2hpbGxzJyksXG59XG4iLCIvKiogQGpzeCBSZWFjdC5ET00gKi9cblxudmFyIFdhbGt0aHJvdWdoID0gcmVxdWlyZSgnLi93YWxrLXRocm91Z2guanN4JylcbnZhciBQVCA9IFJlYWN0LlByb3BUeXBlc1xudmFyIFN0ZXAgPSByZXF1aXJlKCcuL3N0ZXAuanN4JylcblxubW9kdWxlLmV4cG9ydHMgPSBEcm9wSW50cm87XG5cbmZ1bmN0aW9uIERyb3BJbnRybyhFeGVyY2lzZSwgZ290SHlwb3RoZXNpcywgZGVidWcpIHtcbiAgICB2YXIgbm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChub2RlKVxuICAgIFJlYWN0LnJlbmRlckNvbXBvbmVudChXYWxrdGhyb3VnaCh7XG4gICAgICAgIHN0ZXBzOiBzdGVwcyxcbiAgICAgICAgb25IeXBvdGhlc2lzOiBnb3RIeXBvdGhlc2lzLFxuICAgICAgICBvbkRvbmU6IGZ1bmN0aW9uIChoeXBvdGhlc2lzKSB7XG4gICAgICAgICAgICBSZWFjdC51bm1vdW50Q29tcG9uZW50QXROb2RlKG5vZGUpO1xuICAgICAgICAgICAgbm9kZS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKG5vZGUpO1xuICAgICAgICB9LFxuICAgICAgICBkZWJ1ZzogZGVidWcsXG4gICAgICAgIEV4ZXJjaXNlOiBFeGVyY2lzZVxuICAgIH0pLCBub2RlKVxufVxuXG5cbnZhciBCdXR0b25Hcm91cCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ0J1dHRvbkdyb3VwJyxcbiAgICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IHRoaXMucHJvcHMuY2xhc3NOYW1lfSwgXG4gICAgICAgICAgICB0aGlzLnByb3BzLm9wdGlvbnMubWFwKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgICAgICAgICAgdmFyIGNscyA9IFwiYnRuIGJ0bi1kZWZhdWx0XCJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5zZWxlY3RlZCA9PT0gaXRlbVswXSkge1xuICAgICAgICAgICAgICAgICAgICBjbHMgKz0gJyBhY3RpdmUnXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBSZWFjdC5ET00uYnV0dG9uKHtrZXk6IGl0ZW1bMF0sIGNsYXNzTmFtZTogY2xzLCBvbkNsaWNrOiB0aGlzLnByb3BzLm9uU2VsZWN0LmJpbmQobnVsbCwgaXRlbVswXSl9LCBpdGVtWzFdKTtcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSlcbiAgICAgICAgKTtcbiAgICB9XG59KTtcblxudmFyIHN0ZXBzID0gW1xuICAgIGZ1bmN0aW9uIChwcm9wcykge1xuICAgICAgICByZXR1cm4gU3RlcChfLmV4dGVuZChwcm9wcywge1xuICAgICAgICAgICAgaWQ6ICdoZWxsbycsXG4gICAgICAgICAgICB0aXRsZTogXCJIaSEgSSdtIFNpciBGcmFuY2lzIEJhY29uXCIsXG4gICAgICAgICAgICBzaG93QmFjb246IHRydWUsXG4gICAgICAgICAgICBib2R5OiBcIkkgd2FzIG1hZGUgYSBLbmlnaHQgb2YgRW5nbGFuZCBmb3IgZG9pbmcgYXdlc29tZSBTY2llbmNlLiBXZSdyZSBnb2luZyB0byB1c2Ugc2NpZW5jZSB0byBmaWd1cmUgb3V0IGNvb2wgdGhpbmdzIGFib3V0IHRoZSB3b3JsZC5cIixcbiAgICAgICAgICAgIG5leHQ6IFwiTGV0J3MgZG8gc2NpZW5jZSFcIlxuICAgICAgICB9KSlcbiAgICB9LFxuXG4gICAgZnVuY3Rpb24gKHByb3BzKSB7XG4gICAgICAgIHZhciBoeXBvdGhlc2lzID0gcHJvcHMuZGF0YS5oeXBvdGhlc2lzXG4gICAgICAgIHJldHVybiBTdGVwKF8uZXh0ZW5kKHByb3BzLCB7XG4gICAgICAgICAgICBpZDogJ2Rlc2NyaXB0aW9uJyxcbiAgICAgICAgICAgIHRpdGxlOiBcIkV4cGVyaW1lbnQgIzFcIixcbiAgICAgICAgICAgIG9uVXBkYXRlOiBmdW5jdGlvbiAocHJldlByb3BzKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMuZGF0YS5oeXBvdGhlc2lzICYmICFwcmV2UHJvcHMuZGF0YS5oeXBvdGhlc2lzKSB7XG4gICAgICAgICAgICAgICAgICAgIHByb3BzLm9uSHlwb3RoZXNpcyhwcm9wcy5kYXRhLmh5cG90aGVzaXMpO1xuICAgICAgICAgICAgICAgICAgICBwcm9wcy5kZWJ1ZyA/IHByb3BzLm9uTmV4dCgpIDogc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9wcy5vbk5leHQoKVxuICAgICAgICAgICAgICAgICAgICB9LCA1MDApXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGJvZHk6IFJlYWN0LkRPTS5kaXYobnVsbCwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLnAobnVsbCwgXCJXaGF0IGZhbGxzIGZhc3RlcjogYSB0ZW5uaXMgYmFsbCBvciBhIGJvd2xpbmcgYmFsbD9cIiksIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5wKG51bGwsIFwiQSBcIiwgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJ1bGluZVwifSwgXCJIeXBvdGhlc2lzXCIpLCBcIiBpcyB3aGF0IHlvdSB0aGluayB3aWxsIGhhcHBlbi5cIiksIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5ocihudWxsKSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImxhcmdlXCJ9LCBcIkkgdGhpbms6XCIsIFxuICAgICAgICAgICAgICAgICAgICBCdXR0b25Hcm91cCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU6IFwid2Fsa3Rocm91Z2hfaHlwb3RoZXNlc1wiLCBcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkOiBoeXBvdGhlc2lzLCBcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uU2VsZWN0OiBwcm9wcy5zZXREYXRhLmJpbmQobnVsbCwgJ2h5cG90aGVzaXMnKSwgXG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zOiBbW1widGVubmlzXCIsIFwiVGhlIHRlbm5pcyBiYWxsIGZhbGxzIGZhc3RlclwiXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBbXCJib3dsaW5nXCIsIFwiVGhlIGJvd2xpbmcgYmFsbCBmYWxscyBmYXN0ZXJcIl0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgW1wic2FtZVwiLCBcIlRoZXkgZmFsbCB0aGUgc2FtZVwiXV19KVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAvKipoeXBvdGhlc2lzICYmIDxwIGNsYXNzTmFtZT1cIndhbGt0aHJvdWdoX2dyZWF0XCI+R3JlYXQhIE5vdyB3ZSBkbyBzY2llbmNlPC9wPioqL1xuICAgICAgICAgICAgKVxuICAgICAgICB9KSlcbiAgICB9LFxuXG4gICAgZnVuY3Rpb24gKHByb3BzKSB7XG4gICAgICAgIHZhciBmaXJzdEJhbGwgPSAndGVubmlzJ1xuICAgICAgICB2YXIgc2Vjb25kQmFsbCA9ICdib3dsaW5nJ1xuICAgICAgICB2YXIgcHJvdmVyID0gcHJvcHMuZGF0YS5wcm92ZXJcbiAgICAgICAgdmFyIGh5cG90aGVzaXMgPSBwcm9wcy5kYXRhLmh5cG90aGVzaXNcblxuICAgICAgICBpZiAoaHlwb3RoZXNpcyA9PT0gJ2Jvd2xpbmcnKSB7XG4gICAgICAgICAgICBmaXJzdEJhbGwgPSAnYm93bGluZydcbiAgICAgICAgICAgIHNlY29uZEJhbGwgPSAndGVubmlzJ1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHJlc3BvbnNlcyA9IHtcbiAgICAgICAgICAgICd0ZW5uaXMnOiAnTm9wZS4gVGhhdCB3b3VsZCBzaG93IHRoYXQgdGhlIHRlbm5pcyBiYWxsIGZhbGxzIGZhc3RlcicsXG4gICAgICAgICAgICAnYm93bGluZyc6ICdOb3BlLiBUaGF0IHdvdWxkIHNob3cgdGhhdCB0aGUgYm93bGluZyBiYWxsIGZhbGxzIGZhc3RlcicsXG4gICAgICAgICAgICAnc2FtZSc6ICdOb3BlLiBUaGF0IHdvdWxkIHNob3cgdGhhdCB0aGV5IGZhbGwgdGhlIHNhbWUnXG4gICAgICAgIH1cbiAgICAgICAgdmFyIGNvcnJlY3QgPSB7XG4gICAgICAgICAgICAndGVubmlzJzogJ2xlc3MnLFxuICAgICAgICAgICAgJ2Jvd2xpbmcnOiAnbGVzcycsXG4gICAgICAgICAgICAnc2FtZSc6ICdzYW1lJ1xuICAgICAgICB9XG4gICAgICAgIHZhciBwcm92ZXJSZXNwb25zZVxuICAgICAgICB2YXIgaXNDb3JyZWN0ID0gcHJvdmVyID09PSBjb3JyZWN0W2h5cG90aGVzaXNdXG5cbiAgICAgICAgaWYgKHByb3Zlcikge1xuICAgICAgICAgICAgaWYgKGlzQ29ycmVjdCkge1xuICAgICAgICAgICAgICAgIHByb3ZlclJlc3BvbnNlID0gXCJFeGFjdGx5ISBOb3cgbGV0J3MgZG8gdGhlIGV4cGVyaW1lbnQuXCJcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcHJvdmVyUmVzcG9uc2UgPSByZXNwb25zZXNbe1xuICAgICAgICAgICAgICAgICAgICB0ZW5uaXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vcmU6ICdib3dsaW5nJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNhbWU6ICdzYW1lJ1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBib3dsaW5nOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtb3JlOiAndGVubmlzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNhbWU6ICdzYW1lJ1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBzYW1lOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtb3JlOiAnYm93bGluZycsXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXNzOiAndGVubmlzJ1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVtoeXBvdGhlc2lzXVtwcm92ZXJdXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBmdXR1cmVIeXBvdGhlc2lzID0ge1xuICAgICAgICAgICAgdGVubmlzOiAndGhlIHRlbm5pcyBiYWxsIHdpbGwgZmFsbCBmYXN0ZXIgdGhhbiB0aGUgYm93bGluZyBiYWxsJyxcbiAgICAgICAgICAgIGJvd2xpbmc6ICd0aGUgYm93bGluZyBiYWxsIHdpbGwgZmFsbCBmYXN0ZXIgdGhhbiB0aGUgdGVubmlzIGJhbGwnLFxuICAgICAgICAgICAgc2FtZTogJ3RoZSB0ZW5uaXMgYmFsbCBhbmQgdGhlIGJvd2xpbmcgYmFsbCB3aWxsIGZhbGwgdGhlIHNhbWUnXG4gICAgICAgIH1baHlwb3RoZXNpc107XG5cbiAgICAgICAgdmFyIGN1cnJlbnRIeXBvdGhlc2lzID0ge1xuICAgICAgICAgICAgdGVubmlzOiAnYSB0ZW5uaXMgYmFsbCBmYWxscyBmYXN0ZXIgdGhhbiBhIGJvd2xpbmcgYmFsbCcsXG4gICAgICAgICAgICBib3dsaW5nOiAnYSBib3dsaW5nIGJhbGwgZmFsbHMgZmFzdGVyIHRoYW4gYSB0ZW5uaXMgYmFsbCcsXG4gICAgICAgICAgICBzYW1lOiAnYSB0ZW5uaXMgYmFsbCBmYWxscyB0aGUgc2FtZSBhcyBhIGJvd2xpbmcgYmFsbCdcbiAgICAgICAgfVtoeXBvdGhlc2lzXTtcblxuICAgICAgICByZXR1cm4gU3RlcChfLmV4dGVuZChwcm9wcywge1xuICAgICAgICAgICAgaWQ6ICdkZXNpZ24tZXhwZXJpbWVudCcsXG4gICAgICAgICAgICB0aXRsZTogJ0Rlc2lnbmluZyB0aGUgRXhwZXJpbWVudCcsXG4gICAgICAgICAgICBvblVwZGF0ZTogZnVuY3Rpb24gKHByZXZQcm9wcykge1xuICAgICAgICAgICAgICAgIGlmIChwcm92ZXIgJiYgaXNDb3JyZWN0ICYmIHByb3ZlciAhPT0gcHJldlByb3BzLmRhdGEucHJvdmVyKSB7XG4gICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvcHMub25OZXh0KClcbiAgICAgICAgICAgICAgICAgICAgfSwgcHJvcHMuZGVidWcgPyA1MDAgOiAyMDAwKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYm9keTogUmVhY3QuRE9NLmRpdihudWxsLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00ucChudWxsLCBcIk5vdyB3ZSBuZWVkIHRvIGRlc2lnbiBhbiBleHBlcmltZW50IHRvIHRlc3QgeW91clwiICsgJyAnICtcbiAgICAgICAgICAgICAgICBcImh5cG90aGVzaXMhIEl0J3MgaW1wb3J0YW50IHRvIGJlIGNhcmVmdWwgd2hlbiBkZXNpZ25pbmcgYW5cIiArICcgJyArXG4gICAgICAgICAgICAgICAgXCJleHBlcmltZW50LCBiZWNhdXNlIG90aGVyd2lzZSB5b3UgY291bGQgZW5kIHVwIFxcXCJwcm92aW5nXFxcIlwiICsgJyAnICtcbiAgICAgICAgICAgICAgICBcInNvbWV0aGluZyB0aGF0J3MgYWN0dWFsbHkgZmFsc2UuXCIpLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00ucChudWxsLCBcIlRvIHByb3ZlIHRoYXQgXCIsIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwidWxpbmVcIn0sIGN1cnJlbnRIeXBvdGhlc2lzKSwgXCIsIHdlIGNhbiBtZWFzdXJlIHRoZSB0aW1lIHRoYXQgaXRcIiArICcgJyArXG4gICAgICAgICAgICAgICAgXCJ0YWtlcyBmb3IgZWFjaCBiYWxsIHRvIGZhbGwgd2hlbiBkcm9wcGVkIGZyb20gYSBzcGVjaWZpY1wiICsgJyAnICtcbiAgICAgICAgICAgICAgICBcImhlaWdodC5cIiksIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5wKG51bGwsIFwiWW91ciBoeXBvdGhlc2lzIHdpbGwgYmUgcHJvdmVuIGlmIHRoZSBcIiwgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJ1bGluZVwifSwgXCJ0aW1lIGZvciB0aGUgXCIsIGZpcnN0QmFsbCwgXCIgYmFsbFwiKSwgXCIgaXNcIiwgXG4gICAgICAgICAgICAgICAgICAgIEJ1dHRvbkdyb3VwKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogXCJidG4tZ3JvdXBcIiwgXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZDogcHJvdmVyLCBcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uU2VsZWN0OiBwcm9wcy5zZXREYXRhLmJpbmQobnVsbCwgJ3Byb3ZlcicpLCBcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnM6IFtbJ2xlc3MnLCAnbGVzcyB0aGFuJ10sIFsnbW9yZScsICdtb3JlIHRoYW4nXSwgWydzYW1lJywgJ3RoZSBzYW1lIGFzJ11dfSksIFxuICAgICAgICAgICAgICAgICAgICBcInRoZSBcIiwgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJ1bGluZVwifSwgXCJ0aW1lIGZvciB0aGUgXCIsIHNlY29uZEJhbGwsIFwiIGJhbGxcIiksIFwiLlwiXG4gICAgICAgICAgICAgICAgKSwgXG4gICAgICAgICAgICAgICAgcHJvdmVyICYmIFJlYWN0LkRPTS5wKHtjbGFzc05hbWU6IFwiZGVzaWduX3Jlc3BvbnNlXCJ9LCBwcm92ZXJSZXNwb25zZSlcbiAgICAgICAgICAgIClcbiAgICAgICAgfSkpXG4gICAgfSxcblxuICAgIGZ1bmN0aW9uIChwcm9wcykge1xuICAgICAgICByZXR1cm4gU3RlcChfLmV4dGVuZChwcm9wcywge1xuICAgICAgICAgICAgaWQ6ICdleHBlcmltZW50JyxcbiAgICAgICAgICAgIHN0eWxlOiAnYmxhY2snLFxuICAgICAgICAgICAgdGl0bGU6ICdUaGUgZXhwZXJpbWVudCcsXG4gICAgICAgICAgICBwb3M6IHtcbiAgICAgICAgICAgICAgICBsZWZ0OiAzNzUsXG4gICAgICAgICAgICAgICAgdG9wOiAyMDBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBib2R5OiBSZWFjdC5ET00ucChudWxsLCBcIkhlcmUgd2UgaGF2ZSB0b29scyB0byBjb25kdWN0IG91ciBleHBlcmltZW50LiBZb3UgY2FuIHNlZVwiICsgJyAnICtcbiAgICAgICAgICAgIFwic29tZSBib3dsaW5nIGJhbGxzIGFuZCB0ZW5uaXMgYmFsbHMsIGFuZCB0aG9zZSByZWQgYW5kIGdyZWVuXCIgKyAnICcgK1xuICAgICAgICAgICAgXCJzZW5zb3JzIHdpbGwgcmVjb3JkIHRoZSB0aW1lIGl0IHRha2VzIGZvciBhIGJhbGwgdG8gZmFsbC5cIiksXG4gICAgICAgICAgICBvblJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHByb3BzLkV4ZXJjaXNlLmRlcGxveUJhbGxzKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvcHMuZGVidWcgPyBwcm9wcy5vbk5leHQoKSA6IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvcHMub25OZXh0KClcbiAgICAgICAgICAgICAgICAgICAgfSwgMjAwMCk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkpXG4gICAgfSxcblxuICAgIGZ1bmN0aW9uIChwcm9wcykge1xuICAgICAgICByZXR1cm4gU3RlcChfLmV4dGVuZChwcm9wcywge1xuICAgICAgICAgICAgaWQ6ICdkcm9wJyxcbiAgICAgICAgICAgIHN0eWxlOiAnYmxhY2snLFxuICAgICAgICAgICAgcG9zOiB7XG4gICAgICAgICAgICAgICAgdG9wOiAyMDAsXG4gICAgICAgICAgICAgICAgbGVmdDogMjAwXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYm9keTogUmVhY3QuRE9NLnAobnVsbCwgXCJJZiB3ZSBkcm9wIGEgYmFsbCBoZXJlIGFib3ZlIHRoZSBncmVlbiBzZW5zb3IsIHdlIGNhblwiICsgJyAnICtcbiAgICAgICAgICAgICAgICBcInRpbWUgaG93IGxvbmcgaXQgdGFrZXMgZm9yIGl0IHRvIGZhbGwgdG8gdGhlIHJlZCBzZW5zb3IuXCIpLFxuICAgICAgICAgICAgb25SZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBwcm9wcy5FeGVyY2lzZS5kZW1vbnN0cmF0ZURyb3AoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBwcm9wcy5vbk5leHQoKVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pKVxuICAgIH0sXG5cbiAgICBmdW5jdGlvbiAocHJvcHMpIHtcbiAgICAgICAgcmV0dXJuIFN0ZXAoXy5leHRlbmQocHJvcHMsIHtcbiAgICAgICAgICAgIGlkOiAnbG9nYm9vaycsXG4gICAgICAgICAgICBzdHlsZTogJ2JsYWNrJyxcbiAgICAgICAgICAgIHBvczoge1xuICAgICAgICAgICAgICAgIHRvcDogMTAwLFxuICAgICAgICAgICAgICAgIGxlZnQ6IDUwMFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGFycm93OiBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwiYXJyb3ctdG8tbG9nYm9va1wifSksXG4gICAgICAgICAgICBib2R5OiBSZWFjdC5ET00ucChudWxsLCBcIlRoZSB0aW1lIGlzIHRoZW4gcmVjb3JkZWQgb3ZlciBoZXJlIGluIHlvdXIgbG9nIGJvb2suIEZpbGwgdXAgdGhpcyBsb2cgYm9vayB3aXRoIHRpbWVzIGZvciBib3RoIGJhbGxzIGFuZCBjb21wYXJlIHRoZW0uXCIpLFxuICAgICAgICAgICAgb25SZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvcHMub25OZXh0KCk7XG4gICAgICAgICAgICAgICAgfSwgcHJvcHMuZGVidWcgPyAxMDAwIDogNTAwMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pKTtcbiAgICB9LFxuXG4gICAgZnVuY3Rpb24gKHByb3BzKSB7XG4gICAgICAgIHJldHVybiBTdGVwKF8uZXh0ZW5kKHByb3BzLCB7XG4gICAgICAgICAgICBpZDogJ2Fuc3dlcicsXG4gICAgICAgICAgICBzdHlsZTogJ2JsYWNrJyxcbiAgICAgICAgICAgIHBvczoge1xuICAgICAgICAgICAgICAgIHRvcDogMTUwLFxuICAgICAgICAgICAgICAgIGxlZnQ6IDI1MFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGFycm93OiBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwiYXJyb3ctdG8tYW5zd2VyXCJ9KSxcbiAgICAgICAgICAgIHNob3dCYWNvbjogdHJ1ZSxcbiAgICAgICAgICAgIHRpdGxlOiBcIk5vdyBjb25kdWN0IHRoZSBleHBlcmltZW50IHRvIHRlc3QgeW91ciBoeXBvdGhlc2lzIVwiLFxuICAgICAgICAgICAgYm9keTogUmVhY3QuRE9NLnAobnVsbCwgXCJPbmNlIHlvdSd2ZSBjb2xsZWN0ZWQgZW5vdWdoIGRhdGEgaW4geW91ciBsb2cgYm9vayxcIiArICcgJyArXG4gICAgICAgICAgICBcImRlY2lkZSB3aGV0aGVyIHRoZSBkYXRhIFwiLCBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcInVsaW5lXCJ9LCBcInN1cHBvcnRcIiksIFwiIG9yXCIsIFxuICAgICAgICAgICAgJyAnLCBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcInVsaW5lXCJ9LCBcImRpc3Byb3ZlXCIpLCBcIiB5b3VyIGh5cG90aGVzaXMuIFRoZW5cIiArICcgJyArXG4gICAgICAgICAgICBcIkkgd2lsbCBldmFsdWF0ZSB5b3VyIGV4cGVyaW1lbnQgYW5kIGdpdmUgeW91IGZlZWRiYWNrLlwiKSxcbiAgICAgICAgICAgIG5leHQ6IFwiT2ssIEknbSByZWFkeVwiLFxuICAgICAgICB9KSlcbiAgICB9LFxuXVxuIiwiLyoqIEBqc3ggUmVhY3QuRE9NICovXG5cbnZhciBXYWxrdGhyb3VnaCA9IHJlcXVpcmUoJy4vd2Fsay10aHJvdWdoLmpzeCcpXG52YXIgUFQgPSBSZWFjdC5Qcm9wVHlwZXNcbnZhciBTdGVwID0gcmVxdWlyZSgnLi9zdGVwLmpzeCcpXG5cbm1vZHVsZS5leHBvcnRzID0gSGlsbHNJbnRybztcblxuZnVuY3Rpb24gSGlsbHNJbnRybyhFeGVyY2lzZSwgZ290SHlwb3RoZXNpcywgZGVidWcpIHtcbiAgICB2YXIgbm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChub2RlKVxuICAgIFJlYWN0LnJlbmRlckNvbXBvbmVudChXYWxrdGhyb3VnaCh7XG4gICAgICAgIHN0ZXBzOiBzdGVwcyxcbiAgICAgICAgb25IeXBvdGhlc2lzOiBnb3RIeXBvdGhlc2lzLFxuICAgICAgICBvbkRvbmU6IGZ1bmN0aW9uIChoeXBvdGhlc2lzKSB7XG4gICAgICAgICAgICBSZWFjdC51bm1vdW50Q29tcG9uZW50QXROb2RlKG5vZGUpO1xuICAgICAgICAgICAgbm9kZS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKG5vZGUpO1xuICAgICAgICB9LFxuICAgICAgICBkZWJ1ZzogZGVidWcsXG4gICAgICAgIEV4ZXJjaXNlOiBFeGVyY2lzZVxuICAgIH0pLCBub2RlKVxufVxuXG5cbnZhciBCdXR0b25Hcm91cCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ0J1dHRvbkdyb3VwJyxcbiAgICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IHRoaXMucHJvcHMuY2xhc3NOYW1lfSwgXG4gICAgICAgICAgICB0aGlzLnByb3BzLm9wdGlvbnMubWFwKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgICAgICAgICAgdmFyIGNscyA9IFwiYnRuIGJ0bi1kZWZhdWx0XCJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5zZWxlY3RlZCA9PT0gaXRlbVswXSkge1xuICAgICAgICAgICAgICAgICAgICBjbHMgKz0gJyBhY3RpdmUnXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBSZWFjdC5ET00uYnV0dG9uKHtrZXk6IGl0ZW1bMF0sIGNsYXNzTmFtZTogY2xzLCBvbkNsaWNrOiB0aGlzLnByb3BzLm9uU2VsZWN0LmJpbmQobnVsbCwgaXRlbVswXSl9LCBpdGVtWzFdKTtcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSlcbiAgICAgICAgKTtcbiAgICB9XG59KTtcblxudmFyIHN0ZXBzID0gW1xuICAgIGZ1bmN0aW9uIChwcm9wcykge1xuICAgICAgICByZXR1cm4gU3RlcChfLmV4dGVuZChwcm9wcywge1xuICAgICAgICAgICAgaWQ6ICdoZWxsbycsXG4gICAgICAgICAgICB0aXRsZTogXCJSZWFkeSBmb3IgZXZlbiBtb3JlIFNjaWVuY2U/XCIsXG4gICAgICAgICAgICBzaG93QmFjb246IHRydWUsXG4gICAgICAgICAgICBib2R5OiBcIkkgaGF2ZSBvbmUgbW9yZSBleHBlcmltZW50IGZvciB5b3UuXCIsXG4gICAgICAgICAgICBuZXh0OiBcIkxldCdzIGRvIGl0IVwiXG4gICAgICAgIH0pKVxuICAgIH0sXG5cbiAgICBmdW5jdGlvbiAocHJvcHMpIHtcbiAgICAgICAgdmFyIGh5cG90aGVzaXMgPSBwcm9wcy5kYXRhLmh5cG90aGVzaXNcbiAgICAgICAgcmV0dXJuIFN0ZXAoXy5leHRlbmQocHJvcHMsIHtcbiAgICAgICAgICAgIGlkOiAnZGVzY3JpcHRpb24nLFxuICAgICAgICAgICAgdGl0bGU6IFwiRXhwZXJpbWVudCAjM1wiLFxuICAgICAgICAgICAgb25VcGRhdGU6IGZ1bmN0aW9uIChwcmV2UHJvcHMpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5kYXRhLmh5cG90aGVzaXMgJiYgIXByZXZQcm9wcy5kYXRhLmh5cG90aGVzaXMpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvcHMub25IeXBvdGhlc2lzKHByb3BzLmRhdGEuaHlwb3RoZXNpcyk7XG4gICAgICAgICAgICAgICAgICAgIHByb3BzLmRlYnVnID8gcHJvcHMub25OZXh0KCkgOiBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3BzLm9uTmV4dCgpXG4gICAgICAgICAgICAgICAgICAgIH0sIDUwMClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYm9keTogUmVhY3QuRE9NLmRpdihudWxsLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00ucChudWxsLCBcIklmIGEgYmFsbCByb2xscyBvdmVyIGEgaGlsbCwgZG9lcyB0aGUgc3BlZWQgb2YgdGhlIGJhbGwgY2hhbmdlP1wiXG4gICAgICAgICAgICAgICAgKSwgXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5pbWcoe3NyYzogXCJpbWFnZXMvYmFsbHJvbGwtZGlhZ3JhbS5wbmdcIiwgd2lkdGg6IFwiMzAwcHhcIn0pLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uaHIobnVsbCksIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJsYXJnZVwifSwgXCJJIHRoaW5rOlwiLCBcbiAgICAgICAgICAgICAgICAgICAgQnV0dG9uR3JvdXAoe1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiBcIndhbGt0aHJvdWdoX2h5cG90aGVzZXNcIiwgXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZDogaHlwb3RoZXNpcywgXG4gICAgICAgICAgICAgICAgICAgICAgICBvblNlbGVjdDogcHJvcHMuc2V0RGF0YS5iaW5kKG51bGwsICdoeXBvdGhlc2lzJyksIFxuICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uczogW1tcImZhc3RlclwiLCBcIkl0IHdpbGwgY29tZSBvdXQgZ29pbmcgZmFzdGVyXCJdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtcInNsb3dlclwiLCBcIkl0IHdpbGwgY29tZSBvdXQgZ29pbmcgc2xvd2VyXCJdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtcInNhbWVcIiwgXCJJdCB3aWxsIGdvIHRoZSBzYW1lIHNwZWVkXCJdXX0pXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIC8qKmh5cG90aGVzaXMgJiYgPHAgY2xhc3NOYW1lPVwid2Fsa3Rocm91Z2hfZ3JlYXRcIj5HcmVhdCEgTm93IHdlIGRvIHNjaWVuY2U8L3A+KiovXG4gICAgICAgICAgICApXG4gICAgICAgIH0pKVxuICAgIH0sXG5cbiAgICBmdW5jdGlvbiAocHJvcHMpIHtcbiAgICAgICAgdmFyIHByb3ZlciA9IHByb3BzLmRhdGEucHJvdmVyXG4gICAgICAgIHZhciBoeXBvdGhlc2lzID0gcHJvcHMuZGF0YS5oeXBvdGhlc2lzXG5cbiAgICAgICAgdmFyIHJlc3BvbnNlcyA9IHtcbiAgICAgICAgICAgICdtb3JlJzogJ05vcGUuIFRoYXQgd291bGQgc2hvdyB0aGF0IHRoZSBiYWxsIGNvbWVzIG91dCBmYXN0ZXInLFxuICAgICAgICAgICAgJ2xlc3MnOiAnTm9wZS4gVGhhdCB3b3VsZCBzaG93IHRoYXQgdGhlIGJhbGwgY29tZXMgb3V0IHNsb3dlcicsXG4gICAgICAgICAgICAnc2FtZSc6ICdOb3BlLiBUaGF0IHdvdWxkIHNob3cgdGhhdCB0aGUgYmFsbCBjb21lcyBvdXQgYXQgdGhlIHNhbWUgc3BlZWQnLFxuICAgICAgICB9XG4gICAgICAgIHZhciBjb3JyZWN0ID0ge1xuICAgICAgICAgICAgJ2Zhc3Rlcic6ICdsZXNzJyxcbiAgICAgICAgICAgICdzbG93ZXInOiAnbW9yZScsXG4gICAgICAgICAgICAnc2FtZSc6ICdzYW1lJ1xuICAgICAgICB9XG4gICAgICAgIHZhciBwcm92ZXJSZXNwb25zZVxuICAgICAgICB2YXIgaXNDb3JyZWN0ID0gcHJvdmVyID09PSBjb3JyZWN0W2h5cG90aGVzaXNdXG5cbiAgICAgICAgaWYgKHByb3Zlcikge1xuICAgICAgICAgICAgaWYgKGlzQ29ycmVjdCkge1xuICAgICAgICAgICAgICAgIHByb3ZlclJlc3BvbnNlID0gXCJFeGFjdGx5ISBOb3cgbGV0J3MgZG8gdGhlIGV4cGVyaW1lbnQuXCJcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcHJvdmVyUmVzcG9uc2UgPSByZXNwb25zZXNbcHJvdmVyXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHZhciB3b3JkeUh5cG90aGVzaXMgPSB7XG4gICAgICAgICAgICBmYXN0ZXI6ICdmYXN0ZXInLFxuICAgICAgICAgICAgc2xvd2VyOiAnc2xvd2VyJyxcbiAgICAgICAgICAgIHNhbWU6ICd0aGUgc2FtZSBzcGVlZCcsXG4gICAgICAgIH1baHlwb3RoZXNpc107XG5cbiAgICAgICAgcmV0dXJuIFN0ZXAoXy5leHRlbmQocHJvcHMsIHtcbiAgICAgICAgICAgIGlkOiAnZGVzaWduLWV4cGVyaW1lbnQnLFxuICAgICAgICAgICAgdGl0bGU6ICdEZXNpZ25pbmcgdGhlIEV4cGVyaW1lbnQnLFxuICAgICAgICAgICAgb25VcGRhdGU6IGZ1bmN0aW9uIChwcmV2UHJvcHMpIHtcbiAgICAgICAgICAgICAgICBpZiAocHJvdmVyICYmIGlzQ29ycmVjdCAmJiBwcm92ZXIgIT09IHByZXZQcm9wcy5kYXRhLnByb3Zlcikge1xuICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3BzLm9uTmV4dCgpXG4gICAgICAgICAgICAgICAgICAgIH0sIDIwMDApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBib2R5OiBSZWFjdC5ET00uZGl2KG51bGwsIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5wKG51bGwsIFwiVG8gcHJvdmUgdGhhdCB0aGUgYmFsbCBjb21lcyBvdXQgXCIsIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwidWxpbmVcIn0sIHdvcmR5SHlwb3RoZXNpcyksIFwiLCB3ZSBjYW4gbWVhc3VyZSB0aGUgc3BlZWQgYWZ0ZXIgaXQgZ29lcyBkb3duIGEgcmFtcCBhbmQgdGhlbiBvdmVyIGEgaGlsbCBvZiBhIGdpdmVuIGhlaWdodC5cIiksIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5wKG51bGwsIFwiU2luY2Ugd2UgY2FuJ3QgbWVhc3VyZSBzcGVlZCBkaXJlY3RseSwgd2UnbGwgbWVhc3VyZSB0aGUgdGltZSBpdCB0YWtlcyBmb3IgdGhlIGJhbGwgdG8gdHJhdmVsIGEgc2hvcnQgZml4ZWQgZGlzdGFuY2UuXCIpLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00ucChudWxsLCBcIllvdXIgaHlwb3RoZXNpcyB3aWxsIGJlIHByb3ZlbiBpZiB3aGVuIHdlIHJvbGwgYSBiYWxsIGRvd24gYSByYW1wLCB0aGVuIG92ZXIgYSBsYXJnZXIgaGlsbCwgdGhlIFwiLCBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcInVsaW5lXCJ9LCBcInRpbWUgaXQgdGFrZXNcIiksIFwiIGZvciB0aGUgYmFsbCB0byBnbyBhIGZpeGVkIGRpc3RhbmNlIGlzXCIsIFxuICAgICAgICAgICAgICAgICAgICBCdXR0b25Hcm91cCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU6IFwiYnRuLWdyb3VwXCIsIFxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWQ6IHByb3ZlciwgXG4gICAgICAgICAgICAgICAgICAgICAgICBvblNlbGVjdDogcHJvcHMuc2V0RGF0YS5iaW5kKG51bGwsICdwcm92ZXInKSwgXG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zOiBbWydsZXNzJywgJ2xlc3MgdGhhbiddLCBbJ21vcmUnLCAnbW9yZSB0aGFuJ10sIFsnc2FtZScsICd0aGUgc2FtZSBhcyddXX0pLCBcbiAgICAgICAgICAgICAgICAgICAgXCJ0aGUgdGltZSBpdCB0YWtlcyBmb3IgdGhlIGJhbGwgdG8gZ28gdGhlIHNhbWUgZGlzdGFuY2UgaWYgaXQgd2VudCBvdmVyIGEgc21hbGxlciBoaWxsLlwiXG4gICAgICAgICAgICAgICAgKSwgXG4gICAgICAgICAgICAgICAgcHJvdmVyICYmIFJlYWN0LkRPTS5wKHtjbGFzc05hbWU6IFwiZGVzaWduX3Jlc3BvbnNlXCJ9LCBwcm92ZXJSZXNwb25zZSlcbiAgICAgICAgICAgIClcbiAgICAgICAgfSkpXG4gICAgfSxcblxuICAgIGZ1bmN0aW9uIChwcm9wcykge1xuICAgICAgICByZXR1cm4gU3RlcChfLmV4dGVuZChwcm9wcywge1xuICAgICAgICAgICAgaWQ6ICdleHBlcmltZW50JyxcbiAgICAgICAgICAgIHN0eWxlOiAnYmxhY2snLFxuICAgICAgICAgICAgdGl0bGU6ICdUaGUgZXhwZXJpbWVudCcsXG4gICAgICAgICAgICBwb3M6IHtcbiAgICAgICAgICAgICAgICBsZWZ0OiAzNzUsXG4gICAgICAgICAgICAgICAgdG9wOiAyMDBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBib2R5OiBSZWFjdC5ET00ucChudWxsLCBcIkhlcmUgd2UgaGF2ZSB0b29scyB0byBjb25kdWN0IG91ciBleHBlcmltZW50LlwiICsgJyAnICtcbiAgICAgICAgICAgICAgICAgICAgIFwiVGhlIHJlZCBhbmQgZ3JlZW4gc2Vuc29ycyB3aWxsIHJlY29yZCB0aGUgdGltZSBpdCB0YWtlcyBmb3IgdGhlIGJhbGwgdG8gZ28gYSBzaG9ydCBmaXhlZCBkaXN0YW5jZSBhZnRlciBnb2luZyBvdmVyIHRoZSBoaWxsLlwiKSxcbiAgICAgICAgICAgIG9uUmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcHJvcHMuRXhlcmNpc2UuZHJvcE9iamVjdHMoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBwcm9wcy5kZWJ1ZyA/IHByb3BzLm9uTmV4dCgpIDogc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9wcy5vbk5leHQoKVxuICAgICAgICAgICAgICAgICAgICB9LCAyMDAwKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICB9KSlcbiAgICB9LFxuXG4gICAgZnVuY3Rpb24gKHByb3BzKSB7XG4gICAgICAgIHJldHVybiBTdGVwKF8uZXh0ZW5kKHByb3BzLCB7XG4gICAgICAgICAgICBpZDogJ2Ryb3AnLFxuICAgICAgICAgICAgc3R5bGU6ICdibGFjaycsXG4gICAgICAgICAgICBwb3M6IHtcbiAgICAgICAgICAgICAgICB0b3A6IDIwMCxcbiAgICAgICAgICAgICAgICBsZWZ0OiAyMDBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBib2R5OiBSZWFjdC5ET00ucChudWxsLCBcIldlIGNhbiB0ZXN0IG91dCB0aGlzIGh5cG90aGVzaXMgYnkgcm9sbGluZyBhIGJhbGwgc3RhcnRpbmcgYXQgdGhlIHRvcCBvZiB0aGUgcmFtcC5cIiksXG4gICAgICAgICAgICBvblJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHByb3BzLkV4ZXJjaXNlLmRlbW9uc3RyYXRlRHJvcChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHByb3BzLm9uTmV4dCgpXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkpXG4gICAgfSxcblxuICAgIGZ1bmN0aW9uIChwcm9wcykge1xuICAgICAgICByZXR1cm4gU3RlcChfLmV4dGVuZChwcm9wcywge1xuICAgICAgICAgICAgaWQ6ICdsb2dib29rJyxcbiAgICAgICAgICAgIHN0eWxlOiAnYmxhY2snLFxuICAgICAgICAgICAgcG9zOiB7XG4gICAgICAgICAgICAgICAgdG9wOiAxMDAsXG4gICAgICAgICAgICAgICAgbGVmdDogNTAwXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYXJyb3c6IFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJhcnJvdy10by1oaWxsLXNsaWRlclwifSksXG4gICAgICAgICAgICBib2R5OiBSZWFjdC5ET00ucChudWxsLCBcIldlIGNhbiBjaGFuZ2UgdGhlIGhlaWdodCBvZiB0aGUgaGlsbCBoZXJlLlwiKSxcbiAgICAgICAgICAgIG9uUmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHByb3BzLm9uTmV4dCgpO1xuICAgICAgICAgICAgICAgIH0sIHByb3BzLmRlYnVnID8gMTAwIDogNTAwMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pKTtcbiAgICB9LFxuXG4gICAgZnVuY3Rpb24gKHByb3BzKSB7XG4gICAgICAgIHJldHVybiBTdGVwKF8uZXh0ZW5kKHByb3BzLCB7XG4gICAgICAgICAgICBpZDogJ2Fuc3dlcicsXG4gICAgICAgICAgICBzdHlsZTogJ2JsYWNrJyxcbiAgICAgICAgICAgIHBvczoge1xuICAgICAgICAgICAgICAgIHRvcDogMTUwLFxuICAgICAgICAgICAgICAgIGxlZnQ6IDI1MFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGFycm93OiBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwiYXJyb3ctdG8tYW5zd2VyXCJ9KSxcbiAgICAgICAgICAgIHNob3dCYWNvbjogdHJ1ZSxcbiAgICAgICAgICAgIHRpdGxlOiBcIk5vdyBjb25kdWN0IHRoZSBleHBlcmltZW50IHRvIHRlc3QgeW91ciBoeXBvdGhlc2lzIVwiLFxuICAgICAgICAgICAgYm9keTogUmVhY3QuRE9NLnAobnVsbCwgXCJPbmNlIHlvdSd2ZSBjb2xsZWN0ZWQgZW5vdWdoIGRhdGEgaW4geW91ciBsb2cgYm9vayxcIiArICcgJyArXG4gICAgICAgICAgICBcImRlY2lkZSB3aGV0aGVyIHRoZSBkYXRhIFwiLCBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcInVsaW5lXCJ9LCBcInN1cHBvcnRcIiksIFwiIG9yXCIsIFxuICAgICAgICAgICAgJyAnLCBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcInVsaW5lXCJ9LCBcImRpc3Byb3ZlXCIpLCBcIiB5b3VyIGh5cG90aGVzaXMuIFRoZW5cIiArICcgJyArXG4gICAgICAgICAgICBcIkkgd2lsbCBldmFsdWF0ZSB5b3VyIGV4cGVyaW1lbnQgYW5kIGdpdmUgeW91IGZlZWRiYWNrLlwiKSxcbiAgICAgICAgICAgIG5leHQ6IFwiT2ssIEknbSByZWFkeVwiLFxuICAgICAgICB9KSlcbiAgICB9LFxuXVxuIiwiLyoqIEBqc3ggUmVhY3QuRE9NICovXG5cbnZhciBXYWxrdGhyb3VnaCA9IHJlcXVpcmUoJy4vd2Fsay10aHJvdWdoLmpzeCcpXG52YXIgUFQgPSBSZWFjdC5Qcm9wVHlwZXNcbnZhciBTdGVwID0gcmVxdWlyZSgnLi9zdGVwLmpzeCcpXG5cbm1vZHVsZS5leHBvcnRzID0gTmV3dG9uMUludHJvO1xuXG5mdW5jdGlvbiBOZXd0b24xSW50cm8oRXhlcmNpc2UsIGdvdEh5cG90aGVzaXMsIGRlYnVnKSB7XG4gICAgdmFyIG5vZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQobm9kZSlcbiAgICBSZWFjdC5yZW5kZXJDb21wb25lbnQoV2Fsa3Rocm91Z2goe1xuICAgICAgICBzdGVwczogc3RlcHMsXG4gICAgICAgIG9uSHlwb3RoZXNpczogZ290SHlwb3RoZXNpcyxcbiAgICAgICAgb25Eb25lOiBmdW5jdGlvbiAoaHlwb3RoZXNpcykge1xuICAgICAgICAgICAgUmVhY3QudW5tb3VudENvbXBvbmVudEF0Tm9kZShub2RlKTtcbiAgICAgICAgICAgIG5vZGUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChub2RlKTtcbiAgICAgICAgfSxcbiAgICAgICAgZGVidWc6IGRlYnVnLFxuICAgICAgICBFeGVyY2lzZTogRXhlcmNpc2VcbiAgICB9KSwgbm9kZSlcbn1cblxuXG52YXIgQnV0dG9uR3JvdXAgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdCdXR0b25Hcm91cCcsXG4gICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiB0aGlzLnByb3BzLmNsYXNzTmFtZX0sIFxuICAgICAgICAgICAgdGhpcy5wcm9wcy5vcHRpb25zLm1hcChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgICAgICAgIHZhciBjbHMgPSBcImJ0biBidG4tZGVmYXVsdFwiXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMuc2VsZWN0ZWQgPT09IGl0ZW1bMF0pIHtcbiAgICAgICAgICAgICAgICAgICAgY2xzICs9ICcgYWN0aXZlJ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gUmVhY3QuRE9NLmJ1dHRvbih7a2V5OiBpdGVtWzBdLCBjbGFzc05hbWU6IGNscywgb25DbGljazogdGhpcy5wcm9wcy5vblNlbGVjdC5iaW5kKG51bGwsIGl0ZW1bMF0pfSwgaXRlbVsxXSk7XG4gICAgICAgICAgICB9LmJpbmQodGhpcykpXG4gICAgICAgICk7XG4gICAgfVxufSk7XG5cbnZhciBzdGVwcyA9IFtcbiAgICBmdW5jdGlvbiAocHJvcHMpIHtcbiAgICAgICAgcmV0dXJuIFN0ZXAoXy5leHRlbmQocHJvcHMsIHtcbiAgICAgICAgICAgIGlkOiAnaGVsbG8nLFxuICAgICAgICAgICAgdGl0bGU6IFwiUmVhZHkgZm9yIG1vcmUgU2NpZW5jZT9cIixcbiAgICAgICAgICAgIHNob3dCYWNvbjogdHJ1ZSxcbiAgICAgICAgICAgIGJvZHk6IFwiTGV0J3MgZ2V0IG91dCBvZiB0aGUgbGFiLiBGb3IgdGhpcyBuZXh0IGV4cGVyaW1lbnQsIEkga25vdyBqdXN0IHRoZSBwbGFjZSFcIixcbiAgICAgICAgICAgIG5leHQ6IFwiTGV0J3MgZ28hXCJcbiAgICAgICAgfSkpXG4gICAgfSxcblxuICAgIGZ1bmN0aW9uIChwcm9wcykge1xuICAgICAgICByZXR1cm4gU3RlcChfLmV4dGVuZChwcm9wcywge1xuICAgICAgICAgICAgaWQ6ICdzcGFjZScsXG4gICAgICAgICAgICBzdHlsZTogJ2JsYWNrJyxcbiAgICAgICAgICAgIHRpdGxlOiBcIlNwYWNlIVwiLFxuICAgICAgICAgICAgYm9keTogXCJUaGUgcnVsZXMgb2Ygc2NpZW5jZSB3b3JrIGV2ZXJ5d2hlcmUsIHNvIGRpc2NvdmVyaWVzIHdlIG1ha2UgXCIgK1xuICAgICAgICAgICAgICAgIFwiaW4gc3BhY2Ugd2lsbCBhbHNvIGFwcGx5IGhlcmUgb24gRWFydGguIEFuIGltcG9ydGFudCBza2lsbCB3aGVuIFwiICtcbiAgICAgICAgICAgICAgICBcImRlc2lnbmluZyBhbiBleHBlcmltZW50IGlzIGF2b2lkaW5nIHRoaW5ncyB0aGF0IGNvdWxkIFwiICtcbiAgICAgICAgICAgICAgICBcImludGVyZmVyZSB3aXRoIHRoZSByZXN1bHRzLiBJbiBzcGFjZSwgd2UgZG9uJ3QgbmVlZCBcIiArXG4gICAgICAgICAgICAgICAgXCJ0byB3b3JyeSBhYm91dCBncmF2aXR5IG9yIHdpbmQuXCIsXG4gICAgICAgICAgICBuZXh0OiBcIkNvb2whXCJcbiAgICAgICAgfSkpXG4gICAgfSxcblxuICAgIGZ1bmN0aW9uIChwcm9wcykge1xuICAgICAgICB2YXIgaHlwb3RoZXNpcyA9IHByb3BzLmRhdGEuaHlwb3RoZXNpc1xuICAgICAgICByZXR1cm4gU3RlcChfLmV4dGVuZChwcm9wcywge1xuICAgICAgICAgICAgaWQ6ICdkZXNjcmlwdGlvbicsXG4gICAgICAgICAgICBzdHlsZTogJ2JsYWNrJyxcbiAgICAgICAgICAgIHRpdGxlOiBcIkV4cGVyaW1lbnQgIzJcIixcbiAgICAgICAgICAgIG9uVXBkYXRlOiBmdW5jdGlvbiAocHJldlByb3BzKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMuZGF0YS5oeXBvdGhlc2lzICYmICFwcmV2UHJvcHMuZGF0YS5oeXBvdGhlc2lzKSB7XG4gICAgICAgICAgICAgICAgICAgIHByb3BzLm9uSHlwb3RoZXNpcyhwcm9wcy5kYXRhLmh5cG90aGVzaXMpO1xuICAgICAgICAgICAgICAgICAgICBwcm9wcy5kZWJ1ZyA/IHByb3BzLm9uTmV4dCgpIDogc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9wcy5vbk5leHQoKVxuICAgICAgICAgICAgICAgICAgICB9LCA1MDApXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGJvZHk6IFJlYWN0LkRPTS5kaXYobnVsbCwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLnAobnVsbCwgXCJXaGF0IGhhcHBlbnMgdG8gYSBtb3Zpbmcgb2JqZWN0IGlmIHlvdSBsZWF2ZSBpdCBhbG9uZT9cIiksIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5ocihudWxsKSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImxhcmdlXCJ9LCBcIkkgdGhpbms6XCIsIFxuICAgICAgICAgICAgICAgICAgICBCdXR0b25Hcm91cCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU6IFwid2Fsa3Rocm91Z2hfaHlwb3RoZXNlc1wiLCBcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkOiBoeXBvdGhlc2lzLCBcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uU2VsZWN0OiBwcm9wcy5zZXREYXRhLmJpbmQobnVsbCwgJ2h5cG90aGVzaXMnKSwgXG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zOiBbW1wiZmFzdGVyXCIsIFwiSXQgc3BlZWRzIHVwXCJdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtcInNsb3dlclwiLCBcIkl0IHNsb3dzIGRvd25cIl0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgW1wic2FtZVwiLCBcIkl0IHN0YXlzIGF0IHRoZSBzYW1lIHNwZWVkIGZvcmV2ZXJcIl1dfSlcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgLyoqaHlwb3RoZXNpcyAmJiA8cCBjbGFzc05hbWU9XCJ3YWxrdGhyb3VnaF9ncmVhdFwiPkdyZWF0ISBOb3cgd2UgZG8gc2NpZW5jZTwvcD4qKi9cbiAgICAgICAgICAgIClcbiAgICAgICAgfSkpXG4gICAgfSxcblxuICAgIGZ1bmN0aW9uIChwcm9wcykge1xuICAgICAgICB2YXIgcHJvdmVyID0gcHJvcHMuZGF0YS5wcm92ZXJcbiAgICAgICAgdmFyIGh5cG90aGVzaXMgPSBwcm9wcy5kYXRhLmh5cG90aGVzaXNcblxuICAgICAgICB2YXIgcmVzcG9uc2VzID0ge1xuICAgICAgICAgICAgJ21vcmUnOiAnTm9wZS4gVGhhdCB3b3VsZCBzaG93IHRoYXQgdGhlIG9iamVjdCBnZXRzIGZhc3Rlci4nLFxuICAgICAgICAgICAgJ2xlc3MnOiAnTm9wZS4gVGhhdCB3b3VsZCBzaG93IHRoYXQgdGhlIG9iamVjdCBnZXRzIHNsb3dlci4nLFxuICAgICAgICAgICAgJ3NhbWUnOiAnTm9wZS4gVGhhdCB3b3VsZCBzaG93IHRoYXQgdGhlIG9iamVjdCBzdGF5cyB0aGUgc2FtZSBzcGVlZC4nXG4gICAgICAgIH1cbiAgICAgICAgdmFyIGNvcnJlY3QgPSB7XG4gICAgICAgICAgICAnZmFzdGVyJzogJ21vcmUnLFxuICAgICAgICAgICAgJ3Nsb3dlcic6ICdsZXNzJyxcbiAgICAgICAgICAgICdzYW1lJzogJ3NhbWUnXG4gICAgICAgIH1cbiAgICAgICAgdmFyIHByb3ZlclJlc3BvbnNlXG4gICAgICAgIHZhciBpc0NvcnJlY3QgPSBwcm92ZXIgPT09IGNvcnJlY3RbaHlwb3RoZXNpc11cblxuICAgICAgICBpZiAocHJvdmVyKSB7XG4gICAgICAgICAgICBpZiAoaXNDb3JyZWN0KSB7XG4gICAgICAgICAgICAgICAgcHJvdmVyUmVzcG9uc2UgPSBcIkV4YWN0bHkhIE5vdyBsZXQncyBkbyB0aGUgZXhwZXJpbWVudC5cIlxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBwcm92ZXJSZXNwb25zZSA9IHJlc3BvbnNlc1twcm92ZXJdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGN1cnJlbnRIeXBvdGhlc2lzID0ge1xuICAgICAgICAgICAgZmFzdGVyOiAnbW92aW5nIG9iamVjdHMgZ2V0IGZhc3RlciBvdmVyIHRpbWUnLFxuICAgICAgICAgICAgc2xvd2VyOiAnbW92aW5nIG9iamVjdHMgZ2V0IHNsb3dlciBvdmVyIHRpbWUnLFxuICAgICAgICAgICAgc2FtZTogXCJtb3Zpbmcgb2JqZWN0cyBkb24ndCBjaGFuZ2UgaW4gc3BlZWQgb3ZlciB0aW1lXCJcbiAgICAgICAgfVtoeXBvdGhlc2lzXTtcblxuICAgICAgICByZXR1cm4gU3RlcChfLmV4dGVuZChwcm9wcywge1xuICAgICAgICAgICAgaWQ6ICdkZXNpZ24tZXhwZXJpbWVudCcsXG4gICAgICAgICAgICBzdHlsZTogJ2JsYWNrJyxcbiAgICAgICAgICAgIHRpdGxlOiAnRGVzaWduaW5nIHRoZSBFeHBlcmltZW50JyxcbiAgICAgICAgICAgIG9uVXBkYXRlOiBmdW5jdGlvbiAocHJldlByb3BzKSB7XG4gICAgICAgICAgICAgICAgaWYgKHByb3ZlciAmJiBpc0NvcnJlY3QgJiYgcHJvdmVyICE9PSBwcmV2UHJvcHMuZGF0YS5wcm92ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9wcy5vbk5leHQoKVxuICAgICAgICAgICAgICAgICAgICB9LCAyMDAwKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYm9keTogUmVhY3QuRE9NLmRpdihudWxsLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00ucChudWxsLCBcIlRvIHByb3ZlIHRoYXQgXCIsIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwidWxpbmVcIn0sIGN1cnJlbnRIeXBvdGhlc2lzKSwgXCIsXCIgKyAnICcgK1xuICAgICAgICAgICAgICAgIFwid2UgY2FuIG1lYXN1cmUgdGhlIHRpbWUgdGhhdCBpdCB0YWtlcyBmb3IgYW4gYXN0ZXJvaWQgdG8gbW92ZSAxMDAgbWV0ZXJzLFwiICsgJyAnICtcbiAgICAgICAgICAgICAgICBcInRoZW4gbWVhc3VyZSB0aGUgdGltZSB0byBtb3ZlIGFub3RoZXIgMTAwIG1ldGVycy5cIiksIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5wKG51bGwsIFwiWW91ciBoeXBvdGhlc2lzIHdpbGwgYmUgcHJvdmVuIGlmIHRoZSBcIiwgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJ1bGluZVwifSwgXCJ0aW1lIHRvIHRyYXZlbCB0aGUgZmlyc3QgMTAwbVwiKSwgXCIgaXNcIiwgXG4gICAgICAgICAgICAgICAgICAgIEJ1dHRvbkdyb3VwKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogXCJidG4tZ3JvdXBcIiwgXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZDogcHJvdmVyLCBcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uU2VsZWN0OiBwcm9wcy5zZXREYXRhLmJpbmQobnVsbCwgJ3Byb3ZlcicpLCBcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnM6IFtbJ2xlc3MnLCAnbGVzcyB0aGFuJ10sIFsnbW9yZScsICdtb3JlIHRoYW4nXSwgWydzYW1lJywgJ3RoZSBzYW1lIGFzJ11dfSksIFxuICAgICAgICAgICAgICAgICAgICBcInRoZSBcIiwgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJ1bGluZVwifSwgXCJ0aW1lIHRvIHRyYXZlbCB0aGUgbmV4dCAxMDBtXCIpLCBcIi5cIlxuICAgICAgICAgICAgICAgICksIFxuICAgICAgICAgICAgICAgIHByb3ZlciAmJiBSZWFjdC5ET00ucCh7Y2xhc3NOYW1lOiBcImRlc2lnbl9yZXNwb25zZV93aGl0ZVwifSwgcHJvdmVyUmVzcG9uc2UpXG4gICAgICAgICAgICApXG4gICAgICAgIH0pKVxuICAgIH0sXG5cbiAgICBmdW5jdGlvbiAocHJvcHMpIHtcbiAgICAgICAgcmV0dXJuIFN0ZXAoXy5leHRlbmQocHJvcHMsIHtcbiAgICAgICAgICAgIGlkOiAnZHJvcCcsXG4gICAgICAgICAgICBzdHlsZTogJ2JsYWNrJyxcbiAgICAgICAgICAgIHBvczoge1xuICAgICAgICAgICAgICAgIHRvcDogMjAwLFxuICAgICAgICAgICAgICAgIGxlZnQ6IDIwMFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGJvZHk6IFJlYWN0LkRPTS5wKG51bGwsIFwiV2UgY2FuIHRlc3Qgb3V0IHRoaXMgaHlwb3RoZXNpcyBieSB0aHJvd2luZyBhbiBhc3Rlcm9pZFwiICsgJyAnICtcbiAgICAgICAgICAgICAgICAgICAgIFwidGhyb3VnaCB0aGUgZ3JlZW4gc2Vuc29ycywgd2hpY2ggYXJlIGV2ZW5seS1zcGFjZWQuIFRyeVwiICsgJyAnICtcbiAgICAgICAgICAgICAgICAgICAgIFwidGhyb3dpbmcgYXQgZGlmZmVyZW50IHNwZWVkcyFcIiksXG4gICAgICAgICAgICBvblJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHByb3BzLkV4ZXJjaXNlLmRlbW9uc3RyYXRlU2FtcGxlKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvcHMub25OZXh0KClcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICB9KSlcbiAgICB9LFxuXG4gICAgZnVuY3Rpb24gKHByb3BzKSB7XG4gICAgICAgIHJldHVybiBTdGVwKF8uZXh0ZW5kKHByb3BzLCB7XG4gICAgICAgICAgICBpZDogJ2xvZ2Jvb2snLFxuICAgICAgICAgICAgc3R5bGU6ICdibGFjaycsXG4gICAgICAgICAgICBwb3M6IHtcbiAgICAgICAgICAgICAgICB0b3A6IDEwMCxcbiAgICAgICAgICAgICAgICBsZWZ0OiA1MDBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBhcnJvdzogUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImFycm93LXRvLWxvZ2Jvb2stbmV3dG9uMVwifSksXG4gICAgICAgICAgICBib2R5OiBSZWFjdC5ET00ucChudWxsLCBcIk5vdGljZSB0aGF0IGJvdGggdGltZXMgc2hvdyB1cCBpbiB0aGUgbG9nIGJvb2suXCIpLFxuICAgICAgICAgICAgb25SZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvcHMub25OZXh0KCk7XG4gICAgICAgICAgICAgICAgfSwgcHJvcHMuZGVidWcgPyAxMDAgOiA1MDAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkpO1xuICAgIH0sXG5cbiAgICBmdW5jdGlvbiAocHJvcHMpIHtcbiAgICAgICAgcmV0dXJuIFN0ZXAoXy5leHRlbmQocHJvcHMsIHtcbiAgICAgICAgICAgIGlkOiAnYW5zd2VyJyxcbiAgICAgICAgICAgIHN0eWxlOiAnYmxhY2snLFxuICAgICAgICAgICAgcG9zOiB7XG4gICAgICAgICAgICAgICAgdG9wOiAxNTAsXG4gICAgICAgICAgICAgICAgbGVmdDogMjUwXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYXJyb3c6IFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJhcnJvdy10by1hbnN3ZXJcIn0pLFxuICAgICAgICAgICAgc2hvd0JhY29uOiB0cnVlLFxuICAgICAgICAgICAgdGl0bGU6IFwiTm93IGNvbmR1Y3QgdGhlIGV4cGVyaW1lbnQgdG8gdGVzdCB5b3VyIGh5cG90aGVzaXMhXCIsXG4gICAgICAgICAgICBib2R5OiBSZWFjdC5ET00ucChudWxsLCBcIk9uY2UgeW91J3ZlIGNvbGxlY3RlZCBlbm91Z2ggZGF0YSBpbiB5b3VyIGxvZyBib29rLFwiICsgJyAnICtcbiAgICAgICAgICAgIFwiZGVjaWRlIHdoZXRoZXIgdGhlIGRhdGEgXCIsIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwidWxpbmVcIn0sIFwic3VwcG9ydFwiKSwgXCIgb3JcIiwgXG4gICAgICAgICAgICAnICcsIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwidWxpbmVcIn0sIFwiZGlzcHJvdmVcIiksIFwiIHlvdXIgaHlwb3RoZXNpcy4gVGhlblwiICsgJyAnICtcbiAgICAgICAgICAgIFwiSSB3aWxsIGV2YWx1YXRlIHlvdXIgZXhwZXJpbWVudCBhbmQgZ2l2ZSB5b3UgZmVlZGJhY2suXCIpLFxuICAgICAgICAgICAgbmV4dDogXCJPaywgSSdtIHJlYWR5XCIsXG4gICAgICAgIH0pKVxuICAgIH0sXG5dXG4iLCIvKiogQGpzeCBSZWFjdC5ET00gKi9cblxudmFyIFBUID0gUmVhY3QuUHJvcFR5cGVzXG52YXIgY3ggPSBSZWFjdC5hZGRvbnMuY2xhc3NTZXRcblxudmFyIFN0ZXAgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdTdGVwJyxcbiAgICBwcm9wVHlwZXM6IHtcbiAgICAgICAgdGl0bGU6IFBULnN0cmluZyxcbiAgICAgICAgbmV4dDogUFQuc3RyaW5nLFxuICAgICAgICBvblJlbmRlcjogUFQuZnVuYyxcbiAgICAgICAgb25GYWRlZE91dDogUFQuZnVuYyxcbiAgICAgICAgc2hvd0JhY29uOiBQVC5ib29sLFxuICAgICAgICBmYWRlT3V0OiBQVC5ib29sLFxuICAgIH0sXG5cbiAgICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHN0eWxlOiAnd2hpdGUnXG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMub25SZW5kZXIpIHtcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25SZW5kZXIoKVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuZ2V0RE9NTm9kZSgpLmFkZEV2ZW50TGlzdGVuZXIoJ3RyYW5zaXRpb25lbmQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5mYWRlT3V0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkZhZGVkT3V0KClcbiAgICAgICAgICAgIH1cbiAgICAgICAgfS5iaW5kKHRoaXMpKVxuICAgIH0sXG5cbiAgICBjb21wb25lbnREaWRVcGRhdGU6IGZ1bmN0aW9uIChwcmV2UHJvcHMpIHtcbiAgICAgICAgaWYgKHByZXZQcm9wcy5pZCAhPT0gdGhpcy5wcm9wcy5pZCAmJlxuICAgICAgICAgICAgdGhpcy5wcm9wcy5vblJlbmRlcikge1xuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMub25SZW5kZXIoKVxuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnByb3BzLm9uVXBkYXRlKSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uVXBkYXRlLmNhbGwodGhpcywgcHJldlByb3BzKVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgc3R5bGVcbiAgICAgICAgaWYgKHRoaXMucHJvcHMucG9zKSB7XG4gICAgICAgICAgICBzdHlsZSA9IHtcbiAgICAgICAgICAgICAgICBtYXJnaW5Ub3A6IDAsXG4gICAgICAgICAgICAgICAgbWFyZ2luTGVmdDogMCxcbiAgICAgICAgICAgICAgICB0b3A6IHRoaXMucHJvcHMucG9zLnRvcCArICdweCcsXG4gICAgICAgICAgICAgICAgbGVmdDogdGhpcy5wcm9wcy5wb3MubGVmdCArICdweCdcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBjeCh7XG4gICAgICAgICAgICBcIndhbGt0aHJvdWdoXCI6IHRydWUsXG4gICAgICAgICAgICBcIndhbGt0aHJvdWdoLS13aGl0ZVwiOiB0aGlzLnByb3BzLnN0eWxlID09PSAnd2hpdGUnLFxuICAgICAgICAgICAgXCJ3YWxrdGhyb3VnaC0tYmxhY2tcIjogdGhpcy5wcm9wcy5zdHlsZSA9PT0gJ2JsYWNrJ1xuICAgICAgICB9KX0sIFxuICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBjeCh7XG4gICAgICAgICAgICAgICAgXCJ3YWxrdGhyb3VnaF9zdGVwXCI6IHRydWUsXG4gICAgICAgICAgICAgICAgXCJ3YWxrdGhyb3VnaF9zdGVwLS1mYWRlLW91dFwiOiB0aGlzLnByb3BzLmZhZGVPdXRcbiAgICAgICAgICAgIH0pICsgXCIgd2Fsa3Rocm91Z2hfc3RlcC0tXCIgKyB0aGlzLnByb3BzLmlkLCBzdHlsZTogc3R5bGV9LCBcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLnNob3dCYWNvbiAmJiBSZWFjdC5ET00uaW1nKHtjbGFzc05hbWU6IFwid2Fsa3Rocm91Z2hfc2lyLWZyYW5jaXNcIiwgc3JjOiBcImltYWdlcy9zaXItZnJhbmNpcy10cmFuc3BhcmVudDIuZ2lmXCJ9KSwgXG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy50aXRsZSAmJlxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwid2Fsa3Rocm91Z2hfdGl0bGVcIn0sIHRoaXMucHJvcHMudGl0bGUpLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwid2Fsa3Rocm91Z2hfYm9keVwifSwgXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMuYm9keVxuICAgICAgICAgICAgICAgICksIFxuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMuYXJyb3cgfHwgZmFsc2UsIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJ3YWxrdGhyb3VnaF9idXR0b25zXCJ9LCBcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5uZXh0ICYmXG4gICAgICAgICAgICAgICAgICAgICAgICBSZWFjdC5ET00uYnV0dG9uKHtvbkNsaWNrOiB0aGlzLnByb3BzLm9uTmV4dCwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiBcIndhbGt0aHJvdWdoX25leHQgYnRuIGJ0bi1kZWZhdWx0XCJ9LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm5leHRcbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApXG4gICAgICAgIClcbiAgICB9XG59KVxuXG5tb2R1bGUuZXhwb3J0cyA9IFN0ZXBcbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xuXG52YXIgV2Fsa1Rocm91Z2ggPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdXYWxrVGhyb3VnaCcsXG4gICAgcHJvcFR5cGVzOiB7XG4gICAgICAgIHN0ZXBzOiBSZWFjdC5Qcm9wVHlwZXMuYXJyYXkuaXNSZXF1aXJlZCxcbiAgICAgICAgb25Eb25lOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYyxcbiAgICAgICAgZGVidWc6IFJlYWN0LlByb3BUeXBlcy5ib29sXG4gICAgfSxcbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHN0ZXA6IDAsXG4gICAgICAgICAgICBkYXRhOiB7fSxcbiAgICAgICAgICAgIGZhZGluZzogZmFsc2VcbiAgICAgICAgfVxuICAgIH0sXG4gICAgb25GYWRlZE91dDogZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5mYWRpbmcgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICB0aGlzLmdvVG8odGhpcy5zdGF0ZS5mYWRpbmcpXG4gICAgfSxcbiAgICBnb1RvOiBmdW5jdGlvbiAobnVtKSB7XG4gICAgICAgIGlmIChudW0gPj0gdGhpcy5wcm9wcy5zdGVwcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLm9uRG9uZSkge1xuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMub25Eb25lKClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe3N0ZXA6IG51bSwgZmFkaW5nOiBmYWxzZX0pXG4gICAgfSxcbiAgICBzdGFydEdvaW5nOiBmdW5jdGlvbiAobnVtKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2ZhZGluZzogbnVtfSlcbiAgICB9LFxuICAgIHNldERhdGE6IGZ1bmN0aW9uIChhdHRyLCB2YWwpIHtcbiAgICAgICAgdmFyIGRhdGEgPSBfLmV4dGVuZCh7fSwgdGhpcy5zdGF0ZS5kYXRhKVxuICAgICAgICBkYXRhW2F0dHJdID0gdmFsXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2RhdGE6IGRhdGF9KVxuICAgIH0sXG4gICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBTdGVwID0gdGhpcy5wcm9wcy5zdGVwc1t0aGlzLnN0YXRlLnN0ZXBdXG4gICAgICAgIHZhciBwcm9wcyA9IHtcbiAgICAgICAgICAgIG9uTmV4dDogdGhpcy5zdGFydEdvaW5nLmJpbmQobnVsbCwgdGhpcy5zdGF0ZS5zdGVwICsgMSksXG4gICAgICAgICAgICBzZXREYXRhOiB0aGlzLnNldERhdGEsXG4gICAgICAgICAgICBkYXRhOiB0aGlzLnN0YXRlLmRhdGEsXG4gICAgICAgICAgICBmYWRlT3V0OiB0aGlzLnN0YXRlLmZhZGluZyAhPT0gZmFsc2UsXG4gICAgICAgICAgICBvbkZhZGVkT3V0OiB0aGlzLm9uRmFkZWRPdXQsXG4gICAgICAgICAgICBkZWJ1ZzogdGhpcy5wcm9wcy5kZWJ1Z1xuICAgICAgICB9XG4gICAgICAgIGZvciAodmFyIG5hbWUgaW4gdGhpcy5wcm9wcykge1xuICAgICAgICAgICAgcHJvcHNbbmFtZV0gPSB0aGlzLnByb3BzW25hbWVdXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFN0ZXAocHJvcHMpXG4gICAgfVxufSlcblxubW9kdWxlLmV4cG9ydHMgPSBXYWxrVGhyb3VnaFxuXG4iLCJcbnZhciB1dGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gTG9nQm9vaztcblxuZnVuY3Rpb24gTG9nQm9vayh3b3JsZCwgZWxlbSwga2VlcCwgc2VlZGVkQ29sdW1ucywgaGlkZUF2Zykge1xuICAgIHRoaXMuX2F0dGFjaCh3b3JsZCwgZWxlbSwga2VlcCwgc2VlZGVkQ29sdW1ucywgaGlkZUF2Zyk7XG59XG5cbkxvZ0Jvb2sucHJvdG90eXBlLl9hdHRhY2ggPSBmdW5jdGlvbiAod29ybGQsIGVsZW0sIGtlZXAsIHNlZWRlZENvbHVtbnMsIGhpZGVBdmcpIHtcbiAgICBjb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIGNvbnRhaW5lci5jbGFzc05hbWUgPSBcImxvZy1ib29rXCI7XG4gICAgZWxlbS5hcHBlbmRDaGlsZChjb250YWluZXIpO1xuICAgIGhlYWRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpO1xuICAgIGhlYWRlci5jbGFzc05hbWUgPSBcImxvZy1ib29rLWhlYWRlclwiO1xuICAgIGhlYWRlci5pbm5lckhUTUwgPSBcIkxvZyBCb29rXCI7XG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGhlYWRlcik7XG4gICAgYm9keUNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgYm9keUNvbnRhaW5lci5jbGFzc05hbWUgPSBcImxvZy1ib29rLWJvZHlcIjtcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoYm9keUNvbnRhaW5lcik7XG4gICAgdGhpcy5ib2R5Q29udGFpbmVyID0gYm9keUNvbnRhaW5lcjtcbiAgICB0aGlzLmhpZGVBdmcgPSBoaWRlQXZnO1xuXG4gICAgdGhpcy5jb2x1bW5zQnlCb2R5TmFtZSA9IHt9O1xuICAgIHRoaXMubGFzdFVpZHMgPSB7fTtcbiAgICB0aGlzLnN0YXJ0VGltZUJ5Qm9keU5hbWUgPSB7fTtcbiAgICB0aGlzLmRhdGEgPSB7fTtcbiAgICB0aGlzLmtlZXAgPSBrZWVwO1xuICAgIHRoaXMud29ybGQgPSB3b3JsZDtcbiAgICB3b3JsZC5vbignc3RlcCcsIHRoaXMuaGFuZGxlVGljay5iaW5kKHRoaXMpKTtcblxuICAgIGlmIChzZWVkZWRDb2x1bW5zKSB7XG4gICAgICAgIF8uZWFjaChzZWVkZWRDb2x1bW5zLCBmdW5jdGlvbiAoY29sKSB7XG4gICAgICAgICAgICB0aGlzLmFkZENvbHVtbihjb2wubmFtZSwgY29sLmV4dHJhVGV4dCwgY29sLmNvbG9yKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9XG59XG5cbkxvZ0Jvb2sucHJvdG90eXBlLmhhbmRsZVN0YXJ0ID0gZnVuY3Rpb24oY29sTmFtZSwgdWlkKSB7XG4gICAgaWYgKCF0aGlzLnN0YXJ0VGltZUJ5Qm9keU5hbWVbY29sTmFtZV0pIHtcbiAgICAgICAgdGhpcy5uZXdUaW1lcihjb2xOYW1lKTtcbiAgICB9XG4gICAgdGhpcy5sYXN0VWlkc1tjb2xOYW1lXSA9IHVpZDtcbiAgICB0aGlzLnN0YXJ0VGltZUJ5Qm9keU5hbWVbY29sTmFtZV0gPSB0aGlzLndvcmxkLl90aW1lO1xuICAgIHRoaXMucmVuZGVyVGltZXIoY29sTmFtZSwgMCk7XG59XG5cbkxvZ0Jvb2sucHJvdG90eXBlLmhhbmRsZUVuZCA9IGZ1bmN0aW9uKGNvbE5hbWUsIHVpZCkge1xuICAgIGlmIChjb2xOYW1lIGluIHRoaXMuZGF0YSAmJlxuICAgICAgICAgICAgdGhpcy5sYXN0VWlkc1tjb2xOYW1lXSA9PSB1aWQpIHtcbiAgICAgICAgdGhpcy5kYXRhW2NvbE5hbWVdLnB1c2goXG4gICAgICAgICAgICB0aGlzLndvcmxkLl90aW1lIC0gdGhpcy5zdGFydFRpbWVCeUJvZHlOYW1lW2NvbE5hbWVdKTtcbiAgICAgICAgZGVsZXRlIHRoaXMuc3RhcnRUaW1lQnlCb2R5TmFtZVtjb2xOYW1lXTtcbiAgICAgICAgZGVsZXRlIHRoaXMubGFzdFVpZHNbY29sTmFtZV07XG4gICAgICAgIGlmICghdGhpcy5oaWRlQXZnKSB7XG4gICAgICAgICAgICB2YXIgYXZnID0gY2xlYW4odXRpbC5hdmcodGhpcy5kYXRhW2NvbE5hbWVdKSk7XG4gICAgICAgICAgICAkKHRoaXMuY29sdW1uc0J5Qm9keU5hbWVbY29sTmFtZV0pXG4gICAgICAgICAgICAgICAgLmZpbmQoJy5sb2ctYm9vay1hdmcnKS50ZXh0KCdBdmc6ICcgKyBhdmcpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5Mb2dCb29rLnByb3RvdHlwZS5oYW5kbGVUaWNrID0gZnVuY3Rpb24gKCkge1xuICAgIG5ld1RpbWUgPSB0aGlzLndvcmxkLl90aW1lO1xuICAgICQuZWFjaCh0aGlzLnN0YXJ0VGltZUJ5Qm9keU5hbWUsIGZ1bmN0aW9uIChuYW1lLCBzdGFydFRpbWUpIHtcbiAgICAgICAgdGhpcy5yZW5kZXJUaW1lcihuYW1lLCBuZXdUaW1lIC0gc3RhcnRUaW1lKTtcbiAgICB9LmJpbmQodGhpcykpO1xufVxuXG5Mb2dCb29rLnByb3RvdHlwZS5hZGRDb2x1bW4gPSBmdW5jdGlvbiAobmFtZSwgZXh0cmFUZXh0LCBjb2xvcikge1xuICAgIGV4dHJhVGV4dCA9IGV4dHJhVGV4dCB8fCBcIlwiO1xuICAgIHZhciBjb2x1bW4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIGNvbHVtbi5jbGFzc05hbWUgPSBcImxvZy1ib29rLWNvbHVtblwiO1xuICAgIHZhciBoZWFkaW5nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIik7XG4gICAgaGVhZGluZy5jbGFzc05hbWUgPSBcImxvZy1ib29rLWhlYWRpbmdcIjtcbiAgICBoZWFkaW5nLmlubmVySFRNTCA9IG5hbWUgKyBleHRyYVRleHQ7XG4gICAgLyoqIERpc2FibGluZyB1bnRpbCB3ZSBmaW5kIHNvbWV0aGluZyB0aGF0IGxvb2tzIGdyZWF0XG4gICAgaWYgKGNvbG9yKSB7XG4gICAgICAgIGhlYWRpbmcuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gY29sb3I7XG4gICAgfVxuICAgICovXG4gICAgY29sdW1uLmFwcGVuZENoaWxkKGhlYWRpbmcpO1xuICAgIGlmICghdGhpcy5oaWRlQXZnKSB7XG4gICAgICAgIHZhciBhdmVyYWdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgYXZlcmFnZS5jbGFzc05hbWUgPSAnbG9nLWJvb2stYXZnJztcbiAgICAgICAgYXZlcmFnZS5pbm5lckhUTUwgPSAnLS0nO1xuICAgICAgICBjb2x1bW4uYXBwZW5kQ2hpbGQoYXZlcmFnZSk7XG4gICAgfVxuICAgIHRoaXMuaW5zZXJ0Q29sdW1uKG5hbWUsIGNvbHVtbik7IC8vIHdpbGwgaW5zZXJ0IGl0IGF0IHRoZSByaWdodCBwb2ludC5cbiAgICB0aGlzLmNvbHVtbnNCeUJvZHlOYW1lW25hbWVdID0gY29sdW1uO1xuICAgIHRoaXMuZGF0YVtuYW1lXSA9IFtdO1xuICAgIC8vIHNlZWQgdGhlIGNvbHVtbiB3aXRoIGJsYW5rc1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5rZWVwOyBpKyspIHtcbiAgICAgICAgdGhpcy5uZXdUaW1lcihuYW1lKTtcbiAgICB9XG59XG5cbkxvZ0Jvb2sucHJvdG90eXBlLmluc2VydENvbHVtbiA9IGZ1bmN0aW9uIChuYW1lLCBjb2x1bW4pIHtcbiAgICAvLyBpbnNlcnQgdGhlIGNvbHVtbiBpbiBvcmRlci4gIHRoaXMgaXMgYSBiaXQgYXJiaXRyYXJ5IHNpbmNlIHdlIGRvbid0IGtub3dcbiAgICAvLyB3aGF0IHRoZSBzb3J0IG9yZGVyIHNob3VsZCByZWFsbHkgYmUsIHNvIHdlIGp1c3QgcHV0IHN0cmluZ3Mgd2l0aG91dFxuICAgIC8vIG51bWJlcnMsIHRoZW4gc3RyaW5ncyB0aGF0IHN0YXJ0IHdpdGggYSBudW1iZXIuXG4gICAgdmFyIGtleWZuID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgICAgLy8gaWYgdGhlIG5hbWUgc3RhcnRzIHdpdGggYSBudW1iZXIsIHNvcnQgYnkgdGhhdCwgdGhlbiB0aGUgZnVsbCBuYW1lLlxuICAgICAgICAvLyBvdGhlcndpc2UsIHB1dCBpdCBhZnRlciBudW1iZXJzLCBhbmQgc29ydCBieSB0aGUgZnVsbCBuYW1lLlxuICAgICAgICB2YXIgbnVtID0gcGFyc2VJbnQobmFtZSk7XG4gICAgICAgIGlmIChpc05hTihudW0pKSB7XG4gICAgICAgICAgICBudW0gPSBJbmZpbml0eTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gW251bSwgbmFtZV07XG4gICAgfVxuICAgIHZhciBpbnNlcnRlZCA9IGZhbHNlO1xuICAgICQodGhpcy5ib2R5Q29udGFpbmVyKS5maW5kKFwiLmxvZy1ib29rLWhlYWRpbmdcIikuZWFjaChmdW5jdGlvbiAoaSwgc3Bhbikge1xuICAgICAgICB2YXIgazEgPSBrZXlmbihuYW1lKTtcbiAgICAgICAgdmFyIGsyID0ga2V5Zm4oJChzcGFuKS5odG1sKCkpO1xuICAgICAgICBpZiAoazFbMF0gPCBrMlswXSB8fCAoazFbMF0gPT0gazJbMF0gJiYgazFbMV0gPCBrMlsxXSkpIHtcbiAgICAgICAgICAgICQoc3BhbikucGFyZW50KCkuYmVmb3JlKGNvbHVtbik7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhzcGFuKTtcbiAgICAgICAgICAgIGluc2VydGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTsgLy9icmVha1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgaWYgKCFpbnNlcnRlZCkge1xuICAgICAgICAvLyBpZiBpdCdzIHRoZSBiaWdnZXN0LCBwdXQgaXQgYXQgdGhlIGVuZC5cbiAgICAgICAgdGhpcy5ib2R5Q29udGFpbmVyLmFwcGVuZENoaWxkKGNvbHVtbik7XG4gICAgICAgIGNvbnNvbGUubG9nKHRoaXMuYm9keUNvbnRhaW5lcik7XG4gICAgfVxufVxuXG5Mb2dCb29rLnByb3RvdHlwZS5uZXdUaW1lciA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAvLyBqdXN0IGRvZXMgdGhlIERPTSBzZXR1cCwgZG9lc24ndCBhY3R1YWxseSBzdGFydCB0aGUgdGltZXJcbiAgICBpZiAoIXRoaXMuY29sdW1uc0J5Qm9keU5hbWVbbmFtZV0pIHtcbiAgICAgICAgdGhpcy5hZGRDb2x1bW4obmFtZSk7XG4gICAgfVxuICAgIHZhciBjb2wgPSB0aGlzLmNvbHVtbnNCeUJvZHlOYW1lW25hbWVdO1xuICAgIHZhciB0b1JlbW92ZSA9ICQoY29sKS5maW5kKFwiLmxvZy1ib29rLWRhdHVtXCIpLnNsaWNlKDAsLXRoaXMua2VlcCsxKTtcbiAgICB0b1JlbW92ZS5zbGlkZVVwKDUwMCwgZnVuY3Rpb24gKCkge3RvUmVtb3ZlLnJlbW92ZSgpO30pO1xuICAgIHRoaXMuZGF0YVtuYW1lXSA9IHRoaXMuZGF0YVtuYW1lXS5zbGljZSgtdGhpcy5rZWVwKzEpO1xuICAgIHZhciBkYXR1bSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpO1xuICAgIGRhdHVtLmNsYXNzTmFtZSA9IFwibG9nLWJvb2stZGF0dW1cIjtcblxuICAgIGlmICghdGhpcy5oaWRlQXZnKSB7XG4gICAgICAgIHZhciBhdmcgPSBjbGVhbih1dGlsLmF2Zyh0aGlzLmRhdGFbbmFtZV0pKTtcbiAgICAgICAgJChjb2wpLmZpbmQoJy5sb2ctYm9vay1hdmcnKS50ZXh0KCdBdmc6ICcgKyBhdmcpO1xuICAgIH1cblxuICAgIGNvbC5hcHBlbmRDaGlsZChkYXR1bSk7XG4gICAgdGhpcy5yZW5kZXJUaW1lcihuYW1lKTtcbn1cblxuZnVuY3Rpb24gY2xlYW4odGltZSkge1xuICAgIHJldHVybiBwYXJzZUZsb2F0KHRpbWUgLyAxMDAwKS50b0ZpeGVkKDIpICsgJ3MnO1xufVxuXG5Mb2dCb29rLnByb3RvdHlwZS5yZW5kZXJUaW1lciA9IGZ1bmN0aW9uIChuYW1lLCB0aW1lKSB7XG4gICAgdmFyIGRhdHVtID0gdGhpcy5jb2x1bW5zQnlCb2R5TmFtZVtuYW1lXS5sYXN0Q2hpbGQ7XG4gICAgaWYgKHRpbWUpIHtcbiAgICAgICAgZGF0dW0uaW5uZXJIVE1MID0gY2xlYW4odGltZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgZGF0dW0uaW5uZXJIVE1MID0gXCItLVwiO1xuICAgICAgICBkYXR1bS5zdHlsZS50ZXh0QWxpZ24gPSBcImNlbnRlclwiO1xuICAgIH1cbn1cbiIsInZhciBHYXRlID0gcmVxdWlyZSgnLi9nYXRlJyk7XG52YXIgR3JhcGggPSByZXF1aXJlKCcuL2dyYXBoJyk7XG52YXIgQmFzZSA9IHJlcXVpcmUoJy4vYmFzZScpO1xudmFyIFN0b3B3YXRjaCA9IHJlcXVpcmUoJy4vc3RvcHdhdGNoJyk7XG52YXIgUGxheVBhdXNlID0gcmVxdWlyZSgnLi9wbGF5cGF1c2UnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBCYXNlLmV4dGVuZChmdW5jdGlvbiBPcmJpdChjb250YWluZXIsIG9wdGlvbnMpIHtcbiAgICBCYXNlLmNhbGwodGhpcywgY29udGFpbmVyLCBvcHRpb25zLCBcImltYWdlcy9zcGFjZV9iYWNrZ3JvdW5kLmpwZ1wiKVxufSwge1xuICAgIHNldHVwOiBmdW5jdGlvbiAoY29udGFpbmVyKSB7XG4gICAgICAgIHZhciB3b3JsZCA9IHRoaXMud29ybGQ7XG4gICAgICAgIHZhciBkID0gNC4wO1xuICAgICAgICB2YXIgdiA9IDAuMzY7XG4gICAgICAgIHZhciBjaXJjbGUxID0gUGh5c2ljcy5ib2R5KCdjaXJjbGUnLCB7XG4gICAgICAgICAgICB4OiB0aGlzLm9wdGlvbnMud2lkdGggLyAyIC0gZC8yXG4gICAgICAgICAgICAseTogMjAwXG4gICAgICAgICAgICAsdng6IHZcbiAgICAgICAgICAgICxyYWRpdXM6IDJcbiAgICAgICAgICAgICxtYXNzOiAxXG4gICAgICAgICAgICAscmVzdGl0dXRpb246IDBcbiAgICAgICAgICAgICxzdHlsZXM6IHtcbiAgICAgICAgICAgICAgICBmaWxsU3R5bGU6ICcjZWVkZDIyJ1xuICAgICAgICAgICAgICAgICxhbmdsZUluZGljYXRvcjogJyMxNTU0NzknXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICB2YXIgY2lyY2xlMiA9IFBoeXNpY3MuYm9keSgnY2lyY2xlJywge1xuICAgICAgICAgICAgeDogdGhpcy5vcHRpb25zLndpZHRoIC8gMiArIGQvMlxuICAgICAgICAgICAgLHk6IDIwMFxuICAgICAgICAgICAgLHZ4OiB2XG4gICAgICAgICAgICAscmFkaXVzOiAyXG4gICAgICAgICAgICAsbWFzczogMVxuICAgICAgICAgICAgLHJlc3RpdHV0aW9uOiAwXG4gICAgICAgICAgICAsc3R5bGVzOiB7XG4gICAgICAgICAgICAgICAgZmlsbFN0eWxlOiAnI2VlZGQyMidcbiAgICAgICAgICAgICAgICAsYW5nbGVJbmRpY2F0b3I6ICcjMTU1NDc5J1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgYmlnID0gUGh5c2ljcy5ib2R5KCdjaXJjbGUnLCB7XG4gICAgICAgICAgICB4OiB0aGlzLm9wdGlvbnMud2lkdGggLyAyXG4gICAgICAgICAgICAseTogMzAwXG4gICAgICAgICAgICAsdng6IC0yICogdi8yNVxuICAgICAgICAgICAgLHJhZGl1czogMTBcbiAgICAgICAgICAgICxtYXNzOiAyNVxuICAgICAgICAgICAgLHJlc3RpdHV0aW9uOiAwXG4gICAgICAgICAgICAsc3R5bGVzOiB7XG4gICAgICAgICAgICAgICAgZmlsbFN0eWxlOiAnI2VlZGQyMidcbiAgICAgICAgICAgICAgICAsYW5nbGVJbmRpY2F0b3I6ICcjMTU1NDc5J1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdmFyIGNvbnN0cmFpbnRzID0gUGh5c2ljcy5iZWhhdmlvcigndmVybGV0LWNvbnN0cmFpbnRzJyk7XG4gICAgICAgIGNvbnN0cmFpbnRzLmRpc3RhbmNlQ29uc3RyYWludChjaXJjbGUxLCBjaXJjbGUyLCAxKTtcbiAgICAgICAgd29ybGQuYWRkKFtjaXJjbGUxLCBjaXJjbGUyLCBiaWcsIGNvbnN0cmFpbnRzXSk7XG4gICAgICAgIHdvcmxkLmFkZChQaHlzaWNzLmJlaGF2aW9yKCduZXd0b25pYW4nLCB7IHN0cmVuZ3RoOiAuNSB9KSk7XG5cbiAgICAgICAgdmFyIG1vb25Sb3RhdGlvbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBkeCA9IGNpcmNsZTEuc3RhdGUucG9zLnggLSBjaXJjbGUyLnN0YXRlLnBvcy54O1xuICAgICAgICAgICAgdmFyIGR5ID0gY2lyY2xlMi5zdGF0ZS5wb3MueSAtIGNpcmNsZTEuc3RhdGUucG9zLnk7XG4gICAgICAgICAgICByZXR1cm4gTWF0aC5hdGFuMihkeSxkeCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdmFyIG1vb25SZXZvbHV0aW9uID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGR4ID0gKGNpcmNsZTEuc3RhdGUucG9zLnggKyBjaXJjbGUyLnN0YXRlLnBvcy54KS8yIC0gYmlnLnN0YXRlLnBvcy54O1xuICAgICAgICAgICAgdmFyIGR5ID0gYmlnLnN0YXRlLnBvcy55IC0gKGNpcmNsZTIuc3RhdGUucG9zLnkgKyBjaXJjbGUxLnN0YXRlLnBvcy55KS8yO1xuICAgICAgICAgICAgcmV0dXJuIE1hdGguYXRhbjIoZHksZHgpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHZhciBncmFwaCA9IG5ldyBHcmFwaCh0aGlzLmNvbnRhaW5lciwge1xuICAgICAgICAgICAgJ1JvdCc6IHtmbjogbW9vblJvdGF0aW9uLCB0aXRsZTogJ1JvdGF0aW9uJywgbWluc2NhbGU6IDIgKiBNYXRoLlBJfSxcbiAgICAgICAgICAgICdSZXYnOiB7Zm46IG1vb25SZXZvbHV0aW9uLCB0aXRsZTogJ1Jldm9sdXRpb24nLCBtaW5zY2FsZTogMiAqIE1hdGguUEl9LFxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBtYXg6IDIwMDAsXG4gICAgICAgICAgICB0b3A6IDEwLFxuICAgICAgICAgICAgbGVmdDogdGhpcy5vcHRpb25zLndpZHRoLFxuICAgICAgICAgICAgd2lkdGg6IDMwMCxcbiAgICAgICAgICAgIHdvcmxkSGVpZ2h0OiB0aGlzLm9wdGlvbnMuaGVpZ2h0LFxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5ncmFwaCA9IGdyYXBoO1xuXG4gICAgICAgIHRoaXMud29ybGQub24oJ3N0ZXAnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBncmFwaC51cGRhdGUod29ybGQudGltZXN0ZXAoKSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHZhciBidXR0b25Db250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoYnV0dG9uQ29udGFpbmVyKTtcbiAgICAgICAgdmFyIHBsYXlQYXVzZSA9IG5ldyBQbGF5UGF1c2Uod29ybGQsIGJ1dHRvbkNvbnRhaW5lcik7XG4gICAgfVxufSk7XG5cbiAgICAgICAgXG4iLCIvKiogQGpzeCBSZWFjdC5ET00gKi9cblxudmFyIFBUID0gUmVhY3QuUHJvcFR5cGVzXG52YXIgY3ggPSBSZWFjdC5hZGRvbnMuY2xhc3NTZXRcblxudmFyIE5ld0FzdGVyb2lkQnV0dG9uID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnTmV3QXN0ZXJvaWRCdXR0b24nLFxuICAgIHByb3BUeXBlczoge1xuICAgICAgICBvbkNsaWNrOiBQVC5mdW5jLFxuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGNsYXNzTmFtZSA9IGN4KHtcbiAgICAgICAgICAgICdhc3Rlcm9pZC1idXR0b24nOiB0cnVlLFxuICAgICAgICB9KVxuXG4gICAgICAgIHJldHVybiBSZWFjdC5ET00uYnV0dG9uKHtcbiAgICAgICAgICAgIHR5cGU6IFwiYnV0dG9uXCIsIFxuICAgICAgICAgICAgY2xhc3NOYW1lOiBcIm5ldy1hc3Rlcm9pZC1idXR0b25cIiwgXG4gICAgICAgICAgICBvbkNsaWNrOiB0aGlzLnByb3BzLm9uQ2xpY2t9LCBcIk5ldyBBc3Rlcm9pZFwiKVxuICAgIH1cbn0pXG5cbm1vZHVsZS5leHBvcnRzID0gTmV3QXN0ZXJvaWRCdXR0b25cbiIsInZhciBHYXRlID0gcmVxdWlyZSgnLi9nYXRlJyk7XG52YXIgQmFzZSA9IHJlcXVpcmUoJy4vYmFzZScpO1xudmFyIFN0b3B3YXRjaCA9IHJlcXVpcmUoJy4vc3RvcHdhdGNoJyk7XG52YXIgUGxheVBhdXNlID0gcmVxdWlyZSgnLi9wbGF5cGF1c2UnKTtcbnZhciB1dGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XG52YXIgTG9nQm9vayA9IHJlcXVpcmUoJy4vbG9nYm9vaycpXG52YXIgTmV3dG9uMVdhbGt0aHJvdWdoID0gcmVxdWlyZSgnLi9pbnRyby9uZXd0b24xX2ludHJvLmpzeCcpXG52YXIgTmV3QXN0ZXJvaWRCdXR0b24gPSByZXF1aXJlKCcuL25ldy1hc3Rlcm9pZC1idXR0b24uanN4JylcbnZhciBuZXd0b24xRGF0YUNoZWNrZXIgPSByZXF1aXJlKCcuL25ld3RvbjFkYXRhY2hlY2tlcicpXG5cbmZ1bmN0aW9uIHJhbmRvbShtaW4sIG1heCl7XG4gICAgcmV0dXJuIChNYXRoLnJhbmRvbSgpICogKG1heC1taW4pICsgbWluKXwwXG59XG5cbm1vZHVsZS5leHBvcnRzID0gQmFzZS5leHRlbmQoZnVuY3Rpb24gQXN0ZXJvaWRzKGNvbnRhaW5lciwgb3B0aW9ucykge1xuICAgIEJhc2UuY2FsbCh0aGlzLCBjb250YWluZXIsIG9wdGlvbnMsICdpbWFnZXMvc3BhY2VfYmFja2dyb3VuZC5qcGcnLFxuICAgICAgICB0cnVlIC8qIGRpc2FibGVCb3VuZHMgKi8pXG59LCB7XG4gICAgc2V0dXA6IGZ1bmN0aW9uIChjb250YWluZXIpIHtcbiAgICAgICAgdmFyIHdvcmxkID0gdGhpcy53b3JsZDtcbiAgICAgICAgdGhpcy5hY3RpdmVBc3Rlcm9pZCA9IG51bGw7XG4gICAgICAgIHRoaXMuaGFuZGxlTmV3QXN0ZXJvaWQoKTtcbiAgICAgICAgdmFyIHNpZGVCYXIgPSB0aGlzLnNpZGVCYXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICBzaWRlQmFyLmNsYXNzTmFtZSA9IFwic2lkZS1iYXJcIjtcbiAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKHNpZGVCYXIpO1xuXG4gICAgICAgIHZhciBnYXRlMSA9IG5ldyBHYXRlKHdvcmxkLFxuICAgICAgICAgICAgdXRpbC5tYWtlUmVjdCgwLCAwLCAxMCwgNTAwKSxcbiAgICAgICAgICAgIFs0MDAsIDM1MF0sIG51bGwsIHtkZWJ1ZzogdHJ1ZSwgc2hvdzogdHJ1ZSwgY29sb3I6ICdncmVlbid9KTtcbiAgICAgICAgdmFyIGdhdGUyID0gbmV3IEdhdGUod29ybGQsXG4gICAgICAgICAgICB1dGlsLm1ha2VSZWN0KDAsIDAsIDEwLCA1MDApLFxuICAgICAgICAgICAgWzYwMCwgMzUwXSwgbnVsbCwge2RlYnVnOiB0cnVlLCBzaG93OiB0cnVlLCBjb2xvcjogJ2dyZWVuJ30pO1xuICAgICAgICB2YXIgZ2F0ZTMgPSBuZXcgR2F0ZSh3b3JsZCxcbiAgICAgICAgICAgIHV0aWwubWFrZVJlY3QoMCwgMCwgMTAsIDUwMCksXG4gICAgICAgICAgICBbODAwLCAzNTBdLCBudWxsLCB7ZGVidWc6IHRydWUsIHNob3c6IHRydWUsIGNvbG9yOiAnZ3JlZW4nfSk7XG5cbiAgICAgICAgdmFyIGxvZ0NvbHVtbnMgPSBbXG4gICAgICAgICAgICB7bmFtZTogXCJUaW1lIDFcIiwgZXh0cmFUZXh0OiBcIlwifSxcbiAgICAgICAgICAgIHtuYW1lOiBcIlRpbWUgMlwiLCBleHRyYVRleHQ6IFwiXCJ9LFxuICAgICAgICBdO1xuICAgICAgICB2YXIgbG9nQm9vayA9IHRoaXMubG9nQm9vayA9IG5ldyBMb2dCb29rKHdvcmxkLCBzaWRlQmFyLCA1LCBsb2dDb2x1bW5zLFxuICAgICAgICAgICAgdHJ1ZSAvKiBoaWRlQXZnICovKTtcbiAgICAgICAgZ2F0ZTEub24oJ2VudGVyJywgZnVuY3Rpb24oZWxlbSkge1xuICAgICAgICAgICAgdGhpcy5jb25zaWRlckFjdGl2ZUFzdGVyb2lkR0MoKTtcbiAgICAgICAgICAgIHZhciBib2R5ID0gZWxlbS5ib2R5O1xuICAgICAgICAgICAgaWYgKCF0aGlzLmFjdGl2ZUFzdGVyb2lkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hY3RpdmVBc3Rlcm9pZCA9IGJvZHk7XG4gICAgICAgICAgICAgICAgbG9nQm9vay5oYW5kbGVTdGFydChcIlRpbWUgMVwiLCBib2R5LnVpZCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfS5iaW5kKHRoaXMpKVxuICAgICAgICBnYXRlMi5vbignZW50ZXInLCBmdW5jdGlvbihlbGVtKSB7XG4gICAgICAgICAgICB2YXIgYm9keSA9IGVsZW0uYm9keTtcbiAgICAgICAgICAgIGlmICh0aGlzLmFjdGl2ZUFzdGVyb2lkID09IGJvZHkpIHtcbiAgICAgICAgICAgICAgICBsb2dCb29rLmhhbmRsZUVuZChcIlRpbWUgMVwiLCBib2R5LnVpZCk7XG4gICAgICAgICAgICAgICAgbG9nQm9vay5oYW5kbGVTdGFydChcIlRpbWUgMlwiLCBib2R5LnVpZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0uYmluZCh0aGlzKSlcbiAgICAgICAgZ2F0ZTMub24oJ2VudGVyJywgZnVuY3Rpb24oZWxlbSkge1xuICAgICAgICAgICAgdmFyIGJvZHkgPSBlbGVtLmJvZHk7XG4gICAgICAgICAgICBpZiAodGhpcy5hY3RpdmVBc3Rlcm9pZCA9PSBib2R5KSB7XG4gICAgICAgICAgICAgICAgbG9nQm9vay5oYW5kbGVFbmQoXCJUaW1lIDJcIiwgZWxlbS5ib2R5LnVpZCk7XG4gICAgICAgICAgICAgICAgdGhpcy5hY3RpdmVBc3Rlcm9pZCA9IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0uYmluZCh0aGlzKSlcblxuICAgICAgICB2YXIgcGxheVBhdXNlQ29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKHBsYXlQYXVzZUNvbnRhaW5lcik7XG4gICAgICAgIHZhciBwbGF5UGF1c2UgPSBuZXcgUGxheVBhdXNlKHdvcmxkLCBwbGF5UGF1c2VDb250YWluZXIpO1xuICAgICAgICB0aGlzLmNyZWF0ZU5ld0FzdGVyb2lkQnV0dG9uKGNvbnRhaW5lcilcblxuICAgICAgICBjb25zb2xlLmxvZygnb3B0aW9uczogJyArIHRoaXMub3B0aW9ucylcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy53YWxrKSB7XG4gICAgICAgICAgICBOZXd0b24xV2Fsa3Rocm91Z2godGhpcywgZnVuY3Rpb24gKGh5cG90aGVzaXMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldHVwRGF0YUNoZWNrZXIoaHlwb3RoZXNpcyk7XG4gICAgICAgICAgICB9LmJpbmQodGhpcyksIHRoaXMub3B0aW9ucy5kZWJ1ZyA9PT0gJ3RydWUnKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zZXR1cERhdGFDaGVja2VyKCdzYW1lJyk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgc2V0dXBEYXRhQ2hlY2tlcjogZnVuY3Rpb24oaHlwb3RoZXNpcykge1xuICAgICAgICB2YXIgZGF0YUNoZWNrZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICBkYXRhQ2hlY2tlci5jbGFzc05hbWUgPSBcIm5ld3RvbjEtZGF0YS1jaGVja2VyXCI7XG4gICAgICAgIHRoaXMuc2lkZUJhci5hcHBlbmRDaGlsZChkYXRhQ2hlY2tlcik7XG4gICAgICAgIG5ld3RvbjFEYXRhQ2hlY2tlcihkYXRhQ2hlY2tlciwgdGhpcy5sb2dCb29rLCBoeXBvdGhlc2lzKTtcbiAgICB9LFxuXG4gICAgY3JlYXRlTmV3QXN0ZXJvaWRCdXR0b246IGZ1bmN0aW9uKGNvbnRhaW5lcikge1xuICAgICAgICB2YXIgZWxlbWVudCA9ICQoJzxkaXYvPicpXG4gICAgICAgICQoY29udGFpbmVyKS5hcHBlbmQoZWxlbWVudClcbiAgICAgICAgUmVhY3QucmVuZGVyQ29tcG9uZW50KE5ld0FzdGVyb2lkQnV0dG9uKHtcbiAgICAgICAgICAgIG9uQ2xpY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlTmV3QXN0ZXJvaWQoKTtcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgfS5iaW5kKHRoaXMpXG4gICAgICAgIH0pLCBlbGVtZW50WzBdKVxuXG4gICAgICAgIC8vIHZhciBuZXdBc3Rlcm9pZExpbmsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYVwiKTtcbiAgICAgICAgLy8gbmV3QXN0ZXJvaWRMaW5rLmhyZWYgPSBcIiNcIjtcbiAgICAgICAgLy8gbmV3QXN0ZXJvaWRMaW5rLmlubmVySFRNTCA9IFwiTmV3IGFzdGVyb2lkXCI7XG4gICAgICAgIC8vIG5ld0FzdGVyb2lkTGluay5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICAvLyB0aGlzLmhhbmRsZU5ld0FzdGVyb2lkKCk7XG4gICAgICAgICAgICAvLyBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAvLyB9LmJpbmQodGhpcykpO1xuICAgICAgICAvLyByZXR1cm4gbmV3QXN0ZXJvaWRMaW5rO1xuICAgIH0sXG5cbiAgICBjb25zaWRlckFjdGl2ZUFzdGVyb2lkR0M6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5hY3RpdmVBc3Rlcm9pZCkge1xuICAgICAgICAgICAgdmFyIHggPSB0aGlzLmFjdGl2ZUFzdGVyb2lkLnN0YXRlLnBvcy54O1xuICAgICAgICAgICAgdmFyIHkgPSB0aGlzLmFjdGl2ZUFzdGVyb2lkLnN0YXRlLnBvcy55O1xuICAgICAgICAgICAgaWYgKHggPCAxMDAgfHwgeCA+IDEwMDAgfHwgeSA8IDEwMCB8fCB5ID4gODAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hY3RpdmVBc3Rlcm9pZCA9IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgaGFuZGxlTmV3QXN0ZXJvaWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgd29ybGQgPSB0aGlzLndvcmxkO1xuXG4gICAgICAgIHZhciBtaW5YID0gNTA7XG4gICAgICAgIHZhciBtYXhYID0gMzAwO1xuICAgICAgICB2YXIgbWluWSA9IDUwO1xuICAgICAgICB2YXIgbWF4WSA9IDY1MDtcbiAgICAgICAgdmFyIG1pbkFuZ2xlID0gMDtcbiAgICAgICAgdmFyIG1heEFuZ2xlID0gMipNYXRoLlBJO1xuXG4gICAgICAgIHZhciBib2R5ID0gUGh5c2ljcy5ib2R5KCdjaXJjbGUnLCB7XG4gICAgICAgICAgICB4OiByYW5kb20obWluWCwgbWF4WCksXG4gICAgICAgICAgICB5OiByYW5kb20obWluWSwgbWF4WSksXG4gICAgICAgICAgICByYWRpdXM6IDUwLFxuICAgICAgICAgICAgYW5nbGU6IHJhbmRvbShtaW5BbmdsZSwgbWF4QW5nbGUpLFxuICAgICAgICAgICAgbWFzczogMTAwMCxcbiAgICAgICAgICAgIHJlc3RpdHV0aW9uOiAwLFxuICAgICAgICAgICAgc3R5bGVzOiB7XG4gICAgICAgICAgICAgICAgaW1hZ2U6ICdpbWFnZXMvYXN0ZXJvaWQucG5nJyxcbiAgICAgICAgICAgICAgICBmaWxsU3R5bGU6ICcjZmZjYzAwJ1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKCF0aGlzLmZpcnN0QXN0ZXJvaWQpIHtcbiAgICAgICAgICAgIHRoaXMuZmlyc3RBc3Rlcm9pZCA9IGJvZHk7XG4gICAgICAgIH1cbiAgICAgICAgd29ybGQuYWRkKGJvZHkpO1xuICAgIH0sXG5cbiAgICBkZW1vbnN0cmF0ZVNhbXBsZTogZnVuY3Rpb24ob25Eb25lKSB7XG4gICAgICAgIHZhciBhc3Rlcm9pZCA9IHRoaXMuZmlyc3RBc3Rlcm9pZDtcbiAgICAgICAgdmFyIHRhcmdldFggPSAyMDA7XG4gICAgICAgIHZhciB0YXJnZXRZID0gMzUwO1xuXG4gICAgICAgIGFzdGVyb2lkLnRyZWF0bWVudCA9ICdraW5lbWF0aWMnO1xuICAgICAgICBhc3Rlcm9pZC5zdGF0ZS52ZWwueCA9ICh0YXJnZXRYIC0gYXN0ZXJvaWQuc3RhdGUucG9zLngpIC8gMTUwMDtcbiAgICAgICAgYXN0ZXJvaWQuc3RhdGUudmVsLnkgPSAodGFyZ2V0WSAtIGFzdGVyb2lkLnN0YXRlLnBvcy55KSAvIDE1MDA7XG4gICAgICAgIGFzdGVyb2lkLnJlY2FsYygpO1xuXG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBhc3Rlcm9pZC50cmVhdG1lbnQgPSAnZHluYW1pYyc7XG4gICAgICAgICAgICBhc3Rlcm9pZC5zdGF0ZS5wb3MueCA9IHRhcmdldFg7XG4gICAgICAgICAgICBhc3Rlcm9pZC5zdGF0ZS5wb3MueSA9IHRhcmdldFk7XG4gICAgICAgICAgICBhc3Rlcm9pZC5zdGF0ZS52ZWwueCA9IDAuMjtcbiAgICAgICAgICAgIGFzdGVyb2lkLnN0YXRlLnZlbC55ID0gMDtcbiAgICAgICAgICAgIGFzdGVyb2lkLnJlY2FsYygpO1xuXG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGFzdGVyb2lkLnRyZWF0bWVudCA9ICdkeW5hbWljJztcbiAgICAgICAgICAgICAgICBhc3Rlcm9pZC5yZWNhbGMoKTtcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBvbkRvbmUoKTtcbiAgICAgICAgICAgICAgICB9LCAzMDAwKVxuICAgICAgICAgICAgfSwgMTUwMClcbiAgICAgICAgfSwgMTUwMClcbiAgICB9XG59KTtcbiIsInZhciBEYXRhQ2hlY2tlciA9IHJlcXVpcmUoJy4vZGF0YWNoZWNrZXIuanN4Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZHJvcERhdGFDaGVja2VyO1xuXG52YXIgX2luaXRpYWxUZXh0ID0gXCJEbyBhbiBleHBlcmltZW50IHRvIGRldGVybWluZSBob3cgYXN0ZXJvaWRzIGJlaGF2ZSwgYW5kIGxldCBtZSBrbm93IHdoZW4geW91J3JlIGRvbmUuXCI7XG5cbnZhciBfbmV4dFVSTCA9IFwiP0hpbGxzJndhbGs9dHJ1ZVwiXG5cbnZhciBfaHlwb3RoZXNlcyA9IFtcbiAgICB7XG4gICAgICAgIG5hbWU6IFwiZmFzdGVyXCIsXG4gICAgICAgIGJ1dHRvblRleHQ6IFwiVGhlIGFzdGVyb2lkcyBnZXQgZmFzdGVyLlwiLFxuICAgICAgICB0ZXh0OiBcInRoYXQgdGhlIGFzdGVyb2lkcyB3aWxsIGdldCBmYXN0ZXJcIixcbiAgICB9LFxuICAgIHtcbiAgICAgICAgbmFtZTogXCJzbG93ZXJcIixcbiAgICAgICAgYnV0dG9uVGV4dDogXCJUaGUgYXN0ZXJvaWRzIGdldCBzbG93ZXIuXCIsXG4gICAgICAgIHRleHQ6IFwidGhhdCB0aGUgYXN0ZXJvaWRzIHdpbGwgZ2V0IHNsb3dlclwiLFxuICAgIH0sXG4gICAge1xuICAgICAgICBuYW1lOiBcInNhbWVcIixcbiAgICAgICAgYnV0dG9uVGV4dDogXCJUaGUgYXN0ZXJvaWRzIHN0YXkgdGhlIHNhbWUgc3BlZWQuXCIsXG4gICAgICAgIHRleHQ6IFwidGhhdCB0aGUgYXN0ZXJvaWRzIHdpbGwgc3RheSB0aGUgc2FtZSBzcGVlZFwiLFxuICAgIH0sXG5dO1xuXG5mdW5jdGlvbiBkcm9wRGF0YUNoZWNrZXIoY29udGFpbmVyLCBsb2dCb29rLCBoeXBvdGhlc2lzKSB7XG4gICAgcmV0dXJuIFJlYWN0LnJlbmRlckNvbXBvbmVudChEYXRhQ2hlY2tlcih7XG4gICAgICAgIGluaXRpYWxUZXh0OiBfaW5pdGlhbFRleHQsXG4gICAgICAgIGluaXRpYWxIeXBvdGhlc2lzOiBoeXBvdGhlc2lzLFxuICAgICAgICBwb3NzaWJsZUh5cG90aGVzZXM6IF9oeXBvdGhlc2VzLFxuICAgICAgICByZXN1bHQ6IGZ1bmN0aW9uIChzdGF0ZSkge3JldHVybiBfcmVzdWx0KGxvZ0Jvb2ssIHN0YXRlKTt9LFxuICAgICAgICBuZXh0VVJMOiBfbmV4dFVSTCxcbiAgICB9KSwgY29udGFpbmVyKTtcbn1cblxuZnVuY3Rpb24gX3Jlc3VsdChsb2dCb29rLCBzdGF0ZSkge1xuICAgIC8vIHdlIHJldHVybiB0aGUgZXJyb3IsIG9yIG51bGwgaWYgdGhleSdyZSBjb3JyZWN0XG4gICAgdmFyIGVub3VnaERhdGEgPSBfLmFsbChsb2dCb29rLmRhdGEsIGZ1bmN0aW9uIChkKSB7cmV0dXJuIGQubGVuZ3RoID49IDU7fSk7XG4gICAgdmFyIGRhdGFJc0dvb2QgPSB0cnVlO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNTsgaSsrKSB7XG4gICAgICAgIHZhciB2YWwxID0gbG9nQm9vay5kYXRhW1wiVGltZSAxXCJdW2ldO1xuICAgICAgICB2YXIgdmFsMiA9IGxvZ0Jvb2suZGF0YVtcIlRpbWUgMlwiXVtpXTtcbiAgICAgICAgdmFyIG1pblZhbCA9IE1hdGgubWluKHZhbDEsIHZhbDIpO1xuICAgICAgICB2YXIgbWF4VmFsID0gTWF0aC5tYXgodmFsMSwgdmFsMik7XG4gICAgICAgIGlmIChtYXhWYWwgLyBtaW5WYWwgPiAxLjIpIHtcbiAgICAgICAgICAgIGRhdGFJc0dvb2QgPSBmYWxzZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGVub3VnaERhdGEpIHtcbiAgICAgICAgdmFyIGF2Z3MgPSB7fVxuICAgICAgICB2YXIgbWF4RGVsdGFzID0ge31cbiAgICAgICAgZm9yICh2YXIgbmFtZSBpbiBsb2dCb29rLmRhdGEpIHtcbiAgICAgICAgICAgIGF2Z3NbbmFtZV0gPSBfLnJlZHVjZShsb2dCb29rLmRhdGFbbmFtZV0sXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gKGEsIGIpIHtyZXR1cm4gYSArIGI7fSkgLyBsb2dCb29rLmRhdGFbbmFtZV0ubGVuZ3RoO1xuICAgICAgICAgICAgbWF4RGVsdGFzW25hbWVdID0gXy5tYXgoXy5tYXAobG9nQm9vay5kYXRhW25hbWVdLFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIChkYXR1bSkge3JldHVybiBNYXRoLmFicyhkYXR1bSAtIGF2Z3NbbmFtZV0pO30pKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjb25zb2xlLmxvZyhsb2dCb29rLmRhdGEsIGVub3VnaERhdGEsIGF2Z3MsIG1heERlbHRhcyk7XG4gICAgaWYgKCFlbm91Z2hEYXRhKSB7XG4gICAgICAgIHJldHVybiBcIllvdSBoYXZlbid0IGZpbGxlZCB1cCB5b3VyIGxhYiBub3RlYm9vayEgIE1ha2Ugc3VyZSB5b3UgZ2V0IGVub3VnaCBkYXRhIHNvIHlvdSBrbm93IHlvdXIgcmVzdWx0cyBhcmUgYWNjdXJhdGUuXCI7XG4gICAgfSBlbHNlIGlmIChzdGF0ZS5oeXBvdGhlc2lzICE9IFwic2FtZVwiIHx8ICFkYXRhSXNHb29kKSB7XG4gICAgICAgIHJldHVybiBcIlRob3NlIHJlc3VsdHMgZG9uJ3QgbG9vayByaWdodCB0byBtZS4gTWFrZSBzdXJlIHlvdSdyZSBsZXR0aW5nIFwiICtcbiAgICAgICAgICAgIFwidGhlIGFzdGVyb2lkcyBnbGlkZSB0aHJvdWdoIGFsbCB0aHJlZSBnYXRlcyB3aXRob3V0IGludGVyZmVyaW5nIHdpdGggdGhlbS5cIlxuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbn1cbiIsInZhciBHYXRlID0gcmVxdWlyZSgnLi9nYXRlJyk7XG52YXIgQmFzZSA9IHJlcXVpcmUoJy4vYmFzZScpO1xudmFyIFN0b3B3YXRjaCA9IHJlcXVpcmUoJy4vc3RvcHdhdGNoJyk7XG52YXIgUGxheVBhdXNlID0gcmVxdWlyZSgnLi9wbGF5cGF1c2UnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBCYXNlLmV4dGVuZChmdW5jdGlvbiBPcmJpdChjb250YWluZXIsIG9wdGlvbnMpIHtcbiAgICBCYXNlLmNhbGwodGhpcywgY29udGFpbmVyLCBvcHRpb25zLCBcImltYWdlcy9zcGFjZV9iYWNrZ3JvdW5kLmpwZ1wiKVxufSwge1xuICAgIHNldHVwOiBmdW5jdGlvbiAoY29udGFpbmVyKSB7XG4gICAgICAgIHZhciB3b3JsZCA9IHRoaXMud29ybGQ7XG4gICAgICAgIHZhciByZWRCYWxsID0gUGh5c2ljcy5ib2R5KCdjaXJjbGUnLCB7XG4gICAgICAgICAgICB4OiB0aGlzLm9wdGlvbnMud2lkdGggLyAyXG4gICAgICAgICAgICAseTogNDBcbiAgICAgICAgICAgICx2eDogMFxuICAgICAgICAgICAgLHZ5OiAtMS84XG4gICAgICAgICAgICAscmFkaXVzOiA0XG4gICAgICAgICAgICAsbWFzczogNFxuICAgICAgICAgICAgLHJlc3RpdHV0aW9uOiAwXG4gICAgICAgICAgICAsc3R5bGVzOiB7XG4gICAgICAgICAgICAgICAgZmlsbFN0eWxlOiAnI2Q2OGI2MicgLy9yZWRcbiAgICAgICAgICAgICAgICAsYW5nbGVJbmRpY2F0b3I6ICcjMTU1NDc5J1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdmFyIGdyZWVuQmFsbCA9IFBoeXNpY3MuYm9keSgnY2lyY2xlJywge1xuICAgICAgICAgICAgeDogdGhpcy5vcHRpb25zLndpZHRoIC8gMlxuICAgICAgICAgICAgLHk6IDYwXG4gICAgICAgICAgICAsdng6IDMvOFxuICAgICAgICAgICAgLHZ5OiAxLzhcbiAgICAgICAgICAgICxyYWRpdXM6IDRcbiAgICAgICAgICAgICxtYXNzOiA0XG4gICAgICAgICAgICAscmVzdGl0dXRpb246IDBcbiAgICAgICAgICAgICxzdHlsZXM6IHtcbiAgICAgICAgICAgICAgICBmaWxsU3R5bGU6ICcjMjZlYjYyJyAvL2dyZWVuXG4gICAgICAgICAgICAgICAgLGFuZ2xlSW5kaWNhdG9yOiAnIzE1NTQ3OSdcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHZhciBiaWdCYWxsID0gUGh5c2ljcy5ib2R5KCdjaXJjbGUnLCB7XG4gICAgICAgICAgICB4OiB0aGlzLm9wdGlvbnMud2lkdGggLyAyXG4gICAgICAgICAgICAseTogMzAwXG4gICAgICAgICAgICAsdng6IC0zLzUwXG4gICAgICAgICAgICAscmFkaXVzOiAxMFxuICAgICAgICAgICAgLG1hc3M6IDI1XG4gICAgICAgICAgICAscmVzdGl0dXRpb246IDBcbiAgICAgICAgICAgICxzdHlsZXM6IHtcbiAgICAgICAgICAgICAgICBmaWxsU3R5bGU6ICcjMjY4YmQyJ1xuICAgICAgICAgICAgICAgICxhbmdsZUluZGljYXRvcjogJyMxNTU0NzknXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICB3b3JsZC5hZGQoW3JlZEJhbGwsIGdyZWVuQmFsbCwgYmlnQmFsbF0pO1xuICAgICAgICB3b3JsZC5hZGQoUGh5c2ljcy5iZWhhdmlvcignbmV3dG9uaWFuJywgeyBzdHJlbmd0aDogLjUgfSkpO1xuXG4gICAgICAgIHZhciBidXR0b25Db250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoYnV0dG9uQ29udGFpbmVyKTtcbiAgICAgICAgdmFyIHBsYXlQYXVzZSA9IG5ldyBQbGF5UGF1c2Uod29ybGQsIGJ1dHRvbkNvbnRhaW5lcik7XG4gICAgICAgIC8vIHZhciBnYXRlUG9seWdvbiA9IFt7eDogLTcwMCwgeTogLTEwMH0sIHt4OiA3MDAsIHk6IC0xMDB9LCB7eDogNzAwLCB5OiAxMzl9LCB7eDogLTcwMCwgeTogMTM5fV07XG4gICAgICAgIC8vIHZhciBnYXRlUG9seWdvbjIgPSBbe3g6IC03MDAsIHk6IC0yNjF9LCB7eDogNzAwLCB5OiAtMjYxfSwge3g6IDcwMCwgeTogMjAwfSwge3g6IC03MDAsIHk6IDIwMH1dO1xuICAgICAgICAvLyB2YXIgZ2F0ZXMgPSBbXVxuICAgICAgICAvLyBnYXRlcy5wdXNoKG5ldyBHYXRlKHdvcmxkLCBidXR0b25Db250YWluZXIsIGdhdGVQb2x5Z29uLCBbNzAwLCAxMDBdLCByZWRCYWxsLCB7ZGVidWc6IHRydWUsIHNob3c6IHRydWV9KSk7XG4gICAgICAgIC8vIGdhdGVzLnB1c2gobmV3IEdhdGUod29ybGQsIGJ1dHRvbkNvbnRhaW5lciwgZ2F0ZVBvbHlnb24sIFs3MDAsIDEwMF0sIGdyZWVuQmFsbCwge2RlYnVnOiB0cnVlLCBzaG93OiB0cnVlfSkpO1xuICAgICAgICAvLyBnYXRlcy5wdXNoKG5ldyBHYXRlKHdvcmxkLCBidXR0b25Db250YWluZXIsIGdhdGVQb2x5Z29uLCBbNzAwLCAxMDBdLCBiaWdCYWxsLCB7ZGVidWc6IHRydWUsIHNob3c6IHRydWV9KSk7XG4gICAgICAgIC8vIGdhdGVzLnB1c2gobmV3IEdhdGUod29ybGQsIGJ1dHRvbkNvbnRhaW5lciwgZ2F0ZVBvbHlnb24yLCBbNzAwLCA1MDBdLCByZWRCYWxsLCB7ZGVidWc6IHRydWUsIHNob3c6IHRydWV9KSk7XG4gICAgICAgIC8vIGdhdGVzLnB1c2gobmV3IEdhdGUod29ybGQsIGJ1dHRvbkNvbnRhaW5lciwgZ2F0ZVBvbHlnb24yLCBbNzAwLCA1MDBdLCBncmVlbkJhbGwsIHtkZWJ1ZzogdHJ1ZSwgc2hvdzogdHJ1ZX0pKTtcbiAgICAgICAgLy8gZ2F0ZXMucHVzaChuZXcgR2F0ZSh3b3JsZCwgYnV0dG9uQ29udGFpbmVyLCBnYXRlUG9seWdvbjIsIFs3MDAsIDUwMF0sIGJpZ0JhbGwsIHtkZWJ1ZzogdHJ1ZSwgc2hvdzogdHJ1ZX0pKTtcbiAgICAgICAgLy8gZ2F0ZXMuZm9yRWFjaChmdW5jdGlvbihnYXRlKSB7XG4gICAgICAgICAgICAvLyB2YXIgc3RvcHdhdGNoID0gbmV3IFN0b3B3YXRjaCh3b3JsZCwgYnV0dG9uQ29udGFpbmVyLCAxKTtcbiAgICAgICAgICAgIC8vIGdhdGUub24oJ2VudGVyJywgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgICAgIC8vIHN0b3B3YXRjaC5yZXNldCgpO1xuICAgICAgICAgICAgICAgIC8vIHN0b3B3YXRjaC5zdGFydCgpO1xuICAgICAgICAgICAgLy8gfSk7XG4gICAgICAgICAgICAvLyBnYXRlLm9uKCdleGl0JywgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgICAgIC8vIHN0b3B3YXRjaC5zdG9wKClcbiAgICAgICAgICAgIC8vIH0pO1xuICAgICAgICAvLyB9KTtcbiAgICB9XG59KTtcblxuICAgICAgICBcbiIsIm1vZHVsZS5leHBvcnRzID0gUGxheVBhdXNlO1xuXG5mdW5jdGlvbiBQbGF5UGF1c2Uod29ybGQsIGNvbnRhaW5lcikge1xuICAgIHRoaXMuX2F0dGFjaCh3b3JsZCwgY29udGFpbmVyKTtcbn1cblxuUGxheVBhdXNlLnByb3RvdHlwZS5jcmVhdGVCdXR0b24gPSBmdW5jdGlvbihhY3Rpb24sIGhhbmRsZXIpIHtcbiAgICB2YXIgYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJhXCIpO1xuICAgIGEuaHJlZiA9IFwiI1wiICsgYWN0aW9uO1xuICAgIGEuaW5uZXJIVE1MID0gYWN0aW9uO1xuICAgIGEuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICBoYW5kbGVyKCk7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgfS5iaW5kKHRoaXMpKTtcbiAgICByZXR1cm4gYTtcbn1cblxuUGxheVBhdXNlLnByb3RvdHlwZS5fYXR0YWNoID0gZnVuY3Rpb24od29ybGQsIGNvbnRhaW5lcikge1xuICAgIHRoaXMucGF1c2VTeW1ib2wgPSBcIuKWkOKWkFwiO1xuICAgIHRoaXMucGxheVN5bWJvbCA9IFwi4pa6XCI7XG4gICAgdGhpcy5idXR0b24gPSB0aGlzLmNyZWF0ZUJ1dHRvbih0aGlzLnBhdXNlU3ltYm9sLCB0aGlzLnRvZ2dsZS5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLndvcmxkID0gd29ybGQ7XG4gICAgdmFyIHdpZGdldCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgd2lkZ2V0LmNsYXNzTmFtZSA9IFwicGxheXBhdXNlXCI7XG4gICAgd2lkZ2V0LmFwcGVuZENoaWxkKHRoaXMuYnV0dG9uKTtcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQod2lkZ2V0KTtcbn1cblxuUGxheVBhdXNlLnByb3RvdHlwZS50b2dnbGUgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy53b3JsZC5pc1BhdXNlZCgpKSB7XG4gICAgICAgIHRoaXMuYnV0dG9uLmlubmVySFRNTCA9IHRoaXMucGF1c2VTeW1ib2w7XG4gICAgICAgIHRoaXMuYnV0dG9uLmhyZWYgPSAnIycgKyB0aGlzLnBhdXNlU3ltYm9sO1xuICAgICAgICB0aGlzLndvcmxkLnVucGF1c2UoKVxuICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuYnV0dG9uLmlubmVySFRNTCA9IHRoaXMucGxheVN5bWJvbDtcbiAgICAgICAgdGhpcy5idXR0b24uaHJlZiA9ICcjJyArIHRoaXMucGxheVN5bWJvbDtcbiAgICAgICAgdGhpcy53b3JsZC5wYXVzZSgpXG4gICAgfVxufVxuXG5cbiIsInZhciBCYXNlID0gcmVxdWlyZSgnLi9iYXNlJyk7XG52YXIgR2F0ZSA9IHJlcXVpcmUoJy4vZ2F0ZScpO1xudmFyIFN0b3B3YXRjaCA9IHJlcXVpcmUoJy4vc3RvcHdhdGNoJyk7XG52YXIgUGxheVBhdXNlID0gcmVxdWlyZSgnLi9wbGF5cGF1c2UnKTtcbnZhciB1dGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gQmFzZS5leHRlbmQoZnVuY3Rpb24gU2xvcGUoY29udGFpbmVyLCBvcHRpb25zKSB7XG4gICAgQmFzZS5jYWxsKHRoaXMsIGNvbnRhaW5lciwgb3B0aW9ucywgJ2ltYWdlcy9sYWJfYmFja2dyb3VuZC5qcGcnKVxufSwge1xuICAgIGRyb3BJbkJvZHk6IGZ1bmN0aW9uIChyYWRpdXMsIHkpIHtcbiAgICAgICAgZnVuY3Rpb24gcmFuZG9tKG1pbiwgbWF4KXtcbiAgICAgICAgICAgIHJldHVybiAoTWF0aC5yYW5kb20oKSAqIChtYXgtbWluKSArIG1pbil8MFxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy53b3JsZC5hZGQoUGh5c2ljcy5ib2R5KCdjaXJjbGUnLCB7XG4gICAgICAgICAgICB4OiAxMDAsXG4gICAgICAgICAgICB5OiB5LFxuICAgICAgICAgICAgdng6IHJhbmRvbSgtNSwgNSkvMTAwLFxuICAgICAgICAgICAgcmFkaXVzOiByYWRpdXMsXG4gICAgICAgICAgICByZXN0aXR1dGlvbjogMC45LFxuICAgICAgICAgICAgc3R5bGVzOiB7XG4gICAgICAgICAgICAgICAgZmlsbFN0eWxlOiAnIzI2OGJkMicsXG4gICAgICAgICAgICAgICAgYW5nbGVJbmRpY2F0b3I6ICcjMTU1NDc5J1xuICAgICAgICAgICAgfVxuICAgICAgICB9KSk7XG4gICAgfSxcbiAgICBzZXR1cDogZnVuY3Rpb24gKGNvbnRhaW5lcikge1xuICAgICAgICB2YXIgd29ybGQgPSB0aGlzLndvcmxkXG4gICAgICAgIHdvcmxkLmFkZChQaHlzaWNzLmJlaGF2aW9yKCdjb25zdGFudC1hY2NlbGVyYXRpb24nKSk7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCA1OyBpKyspIHtcbiAgICAgICAgICAgIHZhciByYWRpdXMgPSAyMCArIDEwICogaTtcbiAgICAgICAgICAgIHRoaXMuZHJvcEluQm9keShyYWRpdXMsIDMwMCAtIGkgKiA1MCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLndvcmxkLmFkZChQaHlzaWNzLmJvZHkoJ2NvbnZleC1wb2x5Z29uJywge1xuICAgICAgICAgICAgeDogNDUwLFxuICAgICAgICAgICAgeTogNjAwLFxuICAgICAgICAgICAgdmVydGljZXM6IFtcbiAgICAgICAgICAgICAgICB7eDogMCwgeTogMH0sXG4gICAgICAgICAgICAgICAge3g6IDAsIHk6IDMwMH0sXG4gICAgICAgICAgICAgICAge3g6IDgwMCwgeTogMzAwfSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICB0cmVhdG1lbnQ6ICdzdGF0aWMnLFxuICAgICAgICAgICAgY29mOiAxLFxuICAgICAgICAgICAgc3R5bGVzOiB7XG4gICAgICAgICAgICAgICAgZmlsbFN0eWxlOiAnI2QzMzY4MicsXG4gICAgICAgICAgICAgICAgYW5nbGVJbmRpY2F0b3I6ICcjNzUxYjRiJ1xuICAgICAgICAgICAgfVxuICAgICAgICB9KSlcblxuICAgICAgICB2YXIgYnV0dG9uQ29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGJ1dHRvbkNvbnRhaW5lcik7XG4gICAgICAgIHZhciBzdG9wd2F0Y2ggPSBuZXcgU3RvcHdhdGNoKHdvcmxkLCBidXR0b25Db250YWluZXIsIDEpO1xuICAgICAgICB2YXIgcGxheVBhdXNlID0gbmV3IFBsYXlQYXVzZSh3b3JsZCwgYnV0dG9uQ29udGFpbmVyKTtcbiAgICAgICAgdmFyIHRvcEdhdGUgPSBuZXcgR2F0ZSh3b3JsZCxcbiAgICAgICAgICAgIHV0aWwubWFrZVJlY3QoMCwgMCwgNjAsIDEwMCksXG4gICAgICAgICAgICBbMzUwLCA0MDBdLFxuICAgICAgICAgICAgbnVsbCwge2RlYnVnOiB0cnVlLCBzaG93OiB0cnVlLCBjb2xvcjogJ2dyZWVuJ30pO1xuICAgICAgICB2YXIgYm90dG9tR2F0ZSA9IG5ldyBHYXRlKHdvcmxkLFxuICAgICAgICAgICAgdXRpbC5tYWtlUmVjdCgwLCAwLCA2MCwgMTAwKSxcbiAgICAgICAgICAgIFs4MDAsIDU3MF0sXG4gICAgICAgICAgICBudWxsLCB7ZGVidWc6IHRydWUsIHNob3c6IHRydWUsIGNvbG9yOiAncmVkJ30pO1xuXG4gICAgICAgIHRvcEdhdGUub24oJ2VudGVyJywgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgc3RvcHdhdGNoLnJlc2V0KCkuc3RhcnQoKTtcbiAgICAgICAgfSlcbiAgICAgICAgYm90dG9tR2F0ZS5vbignZW50ZXInLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICBzdG9wd2F0Y2guc3RvcCgpXG4gICAgICAgIH0pXG5cbiAgICB9XG59KTtcblxuIiwiXG5tb2R1bGUuZXhwb3J0cyA9IFN0b3B3YXRjaDtcblxuZnVuY3Rpb24gU3RvcHdhdGNoKHdvcmxkLCBlbGVtKSB7XG4gICAgdGhpcy5fYXR0YWNoKHdvcmxkLCBlbGVtKTtcbn1cblxuU3RvcHdhdGNoLnByb3RvdHlwZS5fYXR0YWNoID0gZnVuY3Rpb24od29ybGQsIGVsZW0pIHtcbiAgICB0aGlzLndvcmxkID0gd29ybGQ7XG4gICAgdGhpcy50aW1lciA9IHRoaXMuY3JlYXRlVGltZXIoKSxcbiAgICB0aGlzLnN0YXJ0QnV0dG9uID0gdGhpcy5jcmVhdGVCdXR0b24oXCJzdGFydFwiLCB0aGlzLnN0YXJ0LmJpbmQodGhpcykpLFxuICAgIHRoaXMuc3RvcEJ1dHRvbiA9IHRoaXMuY3JlYXRlQnV0dG9uKFwic3RvcFwiLCB0aGlzLnN0b3AuYmluZCh0aGlzKSksXG4gICAgdGhpcy5yZXNldEJ1dHRvbiA9IHRoaXMuY3JlYXRlQnV0dG9uKFwicmVzZXRcIiwgdGhpcy5yZXNldC5iaW5kKHRoaXMpKSxcbiAgICB0aGlzLmNsb2NrID0gMDtcblxuICAgIC8vIFVwZGF0ZSBvbiBldmVyeSB0aW1lciB0aWNrXG4gICAgdGhpcy53b3JsZC5vbignc3RlcCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnVwZGF0ZSgpO1xuICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICB2YXIgd2lkZ2V0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICB3aWRnZXQuY2xhc3NOYW1lID0gXCJzdG9wd2F0Y2hcIjtcblxuICAgIC8vIGFwcGVuZCBlbGVtZW50c1xuICAgIHdpZGdldC5hcHBlbmRDaGlsZCh0aGlzLnRpbWVyKTtcbiAgICB3aWRnZXQuYXBwZW5kQ2hpbGQodGhpcy5zdGFydEJ1dHRvbik7XG4gICAgd2lkZ2V0LmFwcGVuZENoaWxkKHRoaXMuc3RvcEJ1dHRvbik7XG4gICAgd2lkZ2V0LmFwcGVuZENoaWxkKHRoaXMucmVzZXRCdXR0b24pO1xuXG4gICAgZWxlbS5hcHBlbmRDaGlsZCh3aWRnZXQpO1xufVxuXG5TdG9wd2F0Y2gucHJvdG90eXBlLmNyZWF0ZVRpbWVyID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpO1xufVxuXG5TdG9wd2F0Y2gucHJvdG90eXBlLmNyZWF0ZUJ1dHRvbiA9IGZ1bmN0aW9uKGFjdGlvbiwgaGFuZGxlcikge1xuICAgIHZhciBhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImFcIik7XG4gICAgYS5ocmVmID0gXCIjXCIgKyBhY3Rpb247XG4gICAgYS5pbm5lckhUTUwgPSBhY3Rpb247XG4gICAgYS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIGhhbmRsZXIoKTtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICB9LmJpbmQodGhpcykpO1xuICAgIHJldHVybiBhO1xufVxuXG5TdG9wd2F0Y2gucHJvdG90eXBlLnN0YXJ0ID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5ydW5uaW5nID0gdHJ1ZVxuICAgIHJldHVybiB0aGlzO1xufVxuXG5TdG9wd2F0Y2gucHJvdG90eXBlLnN0b3AgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnJ1bm5pbmcgPSBmYWxzZVxuICAgIHJldHVybiB0aGlzO1xufVxuXG5TdG9wd2F0Y2gucHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5jbG9jayA9IDA7XG4gICAgdGhpcy5yZW5kZXIoKTtcbiAgICByZXR1cm4gdGhpcztcbn1cblxuU3RvcHdhdGNoLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgbmV3VGltZSA9IHRoaXMud29ybGQuX3RpbWU7XG4gICAgaWYgKHRoaXMucnVubmluZyAmJiB0aGlzLmxhc3RUaW1lKSB7XG4gICAgICAgIHRoaXMuY2xvY2sgKz0gbmV3VGltZSAtIHRoaXMubGFzdFRpbWU7XG4gICAgfVxuICAgIHRoaXMubGFzdFRpbWUgPSBuZXdUaW1lO1xuICAgIHRoaXMucmVuZGVyKCk7XG59XG5cblN0b3B3YXRjaC5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy50aW1lci5pbm5lckhUTUwgPSBwYXJzZUZsb2F0KHRoaXMuY2xvY2sgLyAxMDAwKS50b0ZpeGVkKDIpO1xufVxuIiwibW9kdWxlLmV4cG9ydHMgPSB0ZXJyYWluO1xuXG5mdW5jdGlvbiB0ZXJyYWluKCBwYXJlbnQgKXtcbiAgICAvLyBtb3N0bHkgY29waWVkIGZyb20gdGhlIGVkZ2UtY29sbGlzaW9uLWRldGVjdGlvbiBiZWhhdmlvci5cbiAgICAvLyBXQVJOSU5HOiB0aGlzIGN1cnJlbnRseSBvbmx5IHdvcmtzIGNvcnJlY3RseSBmb3IgY2lyY2xlcy5cbiAgICAvLyBnZXRGYXJ0aGVzdEh1bGxQb2ludCBkb2Vzbid0IGFjdHVhbGx5IGRvIHdoYXQgSSB3YW50IGl0IHRvLCBzbyBJIHdpbGxcbiAgICAvLyBuZWVkIHRvIGV4dGVuZCBnZW9tZXRyeSB0byBzdXBwb3J0IHdoYXQgSSB3YW50LlxuXG4gICAgLypcbiAgICAgKiBjaGVja0dlbmVyYWwoIGJvZHksIGJvdW5kcywgZHVtbXkgKSAtPiBBcnJheVxuICAgICAqIC0gYm9keSAoQm9keSk6IFRoZSBib2R5IHRvIGNoZWNrXG4gICAgICogLSBib3VuZHM6IGJvdW5kcy5hYWJiIHNob3VsZCBiZSB0aGUgb3V0ZXIgYm91bmRzLiAgRm9yIHRlcnJhaW4gb24gdGhlXG4gICAgICogICBncm91bmQsIHBhc3MgYSBmdW5jdGlvbiBib3VuZHMudGVycmFpbkhlaWdodCh4KS5cbiAgICAgKiAtIGR1bW15OiAoQm9keSk6IFRoZSBkdW1teSBib2R5IHRvIHB1Ymxpc2ggYXMgdGhlIHN0YXRpYyBvdGhlciBib2R5IGl0IGNvbGxpZGVzIHdpdGhcbiAgICAgKiArIChBcnJheSk6IFRoZSBjb2xsaXNpb24gZGF0YVxuICAgICAqXG4gICAgICogQ2hlY2sgaWYgYSBib2R5IGNvbGxpZGVzIHdpdGggdGhlIGJvdW5kYXJ5XG4gICAgICovXG4gICAgdmFyIGNoZWNrR2VuZXJhbCA9IGZ1bmN0aW9uIGNoZWNrR2VuZXJhbCggYm9keSwgYm91bmRzLCB0ZXJyYWluSGVpZ2h0LCBkdW1teSApe1xuXG4gICAgICAgIHZhciBvdmVybGFwXG4gICAgICAgICAgICAsYWFiYiA9IGJvZHkuYWFiYigpXG4gICAgICAgICAgICAsc2NyYXRjaCA9IFBoeXNpY3Muc2NyYXRjaHBhZCgpXG4gICAgICAgICAgICAsdHJhbnMgPSBzY3JhdGNoLnRyYW5zZm9ybSgpXG4gICAgICAgICAgICAsZGlyID0gc2NyYXRjaC52ZWN0b3IoKVxuICAgICAgICAgICAgLHJlc3VsdCA9IHNjcmF0Y2gudmVjdG9yKClcbiAgICAgICAgICAgICxjb2xsaXNpb24gPSBmYWxzZVxuICAgICAgICAgICAgLGNvbGxpc2lvbnMgPSBbXVxuICAgICAgICAgICAgLHhcbiAgICAgICAgICAgICx5XG4gICAgICAgICAgICAsY29sbGlzaW9uWFxuICAgICAgICAgICAgO1xuXG4gICAgICAgIC8vIHJpZ2h0XG4gICAgICAgIG92ZXJsYXAgPSAoYWFiYi54ICsgYWFiYi5odykgLSBib3VuZHMubWF4Lng7XG5cbiAgICAgICAgaWYgKCBvdmVybGFwID49IDAgKXtcblxuICAgICAgICAgICAgZGlyLnNldCggMSwgMCApLnJvdGF0ZUludiggdHJhbnMuc2V0Um90YXRpb24oIGJvZHkuc3RhdGUuYW5ndWxhci5wb3MgKSApO1xuXG4gICAgICAgICAgICBjb2xsaXNpb24gPSB7XG4gICAgICAgICAgICAgICAgYm9keUE6IGJvZHksXG4gICAgICAgICAgICAgICAgYm9keUI6IGR1bW15LFxuICAgICAgICAgICAgICAgIG92ZXJsYXA6IG92ZXJsYXAsXG4gICAgICAgICAgICAgICAgbm9ybToge1xuICAgICAgICAgICAgICAgICAgICB4OiAxLFxuICAgICAgICAgICAgICAgICAgICB5OiAwXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBtdHY6IHtcbiAgICAgICAgICAgICAgICAgICAgeDogb3ZlcmxhcCxcbiAgICAgICAgICAgICAgICAgICAgeTogMFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgcG9zOiBib2R5Lmdlb21ldHJ5LmdldEZhcnRoZXN0SHVsbFBvaW50KCBkaXIsIHJlc3VsdCApLnJvdGF0ZSggdHJhbnMgKS52YWx1ZXMoKVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgY29sbGlzaW9ucy5wdXNoKGNvbGxpc2lvbik7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBib3R0b21cbiAgICAgICAgb3ZlcmxhcCA9IC0xO1xuICAgICAgICBpZiAoYWFiYi55ID4gYm91bmRzLm1heC55IC0gdGVycmFpbkhlaWdodChhYWJiLngpKSB7XG4gICAgICAgICAgICAvLyBpZiB0aGUgY2VudGVyIHNvbWVob3cgZ2V0cyBiZWxvdyB0aGUgdGVycmFpbiwgYWx3YXlzIHB1c2ggc3RyYWlnaHQgdXAuXG4gICAgICAgICAgICBvdmVybGFwID0gTWF0aC5tYXgoMSwgKGFhYmIueSArIGFhYmIuaGgpIC0gYm91bmRzLm1heC55ICsgdGVycmFpbkhlaWdodChhYWJiLngpKTtcbiAgICAgICAgICAgIGRpci5zZXQoIDAsIDEgKS5yb3RhdGVJbnYoIHRyYW5zLnNldFJvdGF0aW9uKCBib2R5LnN0YXRlLmFuZ3VsYXIucG9zICkgKTtcblxuICAgICAgICAgICAgY29sbGlzaW9uID0ge1xuICAgICAgICAgICAgICAgIGJvZHlBOiBib2R5LFxuICAgICAgICAgICAgICAgIGJvZHlCOiBkdW1teSxcbiAgICAgICAgICAgICAgICBvdmVybGFwOiBvdmVybGFwLFxuICAgICAgICAgICAgICAgIG5vcm06IHtcbiAgICAgICAgICAgICAgICAgICAgeDogMCxcbiAgICAgICAgICAgICAgICAgICAgeTogMVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgbXR2OiB7XG4gICAgICAgICAgICAgICAgICAgIHg6IDAsXG4gICAgICAgICAgICAgICAgICAgIHk6IG92ZXJsYXBcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHBvczogYm9keS5nZW9tZXRyeS5nZXRGYXJ0aGVzdEh1bGxQb2ludCggZGlyLCByZXN1bHQgKS5yb3RhdGUoIHRyYW5zICkudmFsdWVzKClcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGNvbGxpc2lvbnMucHVzaChjb2xsaXNpb24pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gb3RoZXJ3aXNlLCBmaW5kIHRoZSBwb2ludCBvZiBiaWdnZXN0IG92ZXJsYXAsIGFuZCBwdXNoIGFsb25nIHRoZVxuICAgICAgICAgICAgLy8gbm9ybWFsIHRoZXJlLlxuICAgICAgICAgICAgZm9yICh4ID0gYWFiYi54IC0gYWFiYi5odzsgeCA8PSBhYWJiLnggKyBhYWJiLmh3OyB4KyspIHtcbiAgICAgICAgICAgICAgICB5ID0gYm91bmRzLm1heC55IC0gdGVycmFpbkhlaWdodCh4KTtcbiAgICAgICAgICAgICAgICBkaXIuc2V0KCB4IC0gYm9keS5zdGF0ZS5wb3MueCwgeSAtIGJvZHkuc3RhdGUucG9zLnkpLm5lZ2F0ZSgpO1xuICAgICAgICAgICAgICAgIGRpci5yb3RhdGVJbnYoIHRyYW5zLnNldFJvdGF0aW9uKCBib2R5LnN0YXRlLmFuZ3VsYXIucG9zICkgKTtcbiAgICAgICAgICAgICAgICBib2R5Lmdlb21ldHJ5LmdldEZhcnRoZXN0SHVsbFBvaW50KGRpciwgcmVzdWx0KS5yb3RhdGUodHJhbnMpO1xuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQubm9ybSgpID4gZGlyLm5vcm0oKSAmJiBvdmVybGFwIDwgcmVzdWx0Lm5vcm0oKSAtIGRpci5ub3JtKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gdGhlcmUgaXMgYW4gYWN0dWFsIGNvbGxpc2lvbiwgYW5kIHRoaXMgaXMgdGhlIGRlZXBlc3RcbiAgICAgICAgICAgICAgICAgICAgLy8gb3ZlcmxhcCB3ZSd2ZSBzZWVuIHNvIGZhclxuICAgICAgICAgICAgICAgICAgICBjb2xsaXNpb25YID0geDtcbiAgICAgICAgICAgICAgICAgICAgb3ZlcmxhcCA9IHJlc3VsdC5ub3JtKCkgLSBkaXIubm9ybSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCBvdmVybGFwID49IDAgKSB7XG4gICAgICAgICAgICAgICAgLy8gd2hvbyBjb3B5cGFzdGFcbiAgICAgICAgICAgICAgICB4ID0gY29sbGlzaW9uWDtcbiAgICAgICAgICAgICAgICB5ID0gYm91bmRzLm1heC55IC0gdGVycmFpbkhlaWdodCh4KTtcbiAgICAgICAgICAgICAgICBkaXIuc2V0KCB4IC0gYm9keS5zdGF0ZS5wb3MueCwgeSAtIGJvZHkuc3RhdGUucG9zLnkpO1xuICAgICAgICAgICAgICAgIGRpci5yb3RhdGVJbnYoIHRyYW5zLnNldFJvdGF0aW9uKCBib2R5LnN0YXRlLmFuZ3VsYXIucG9zICkgKTtcbiAgICAgICAgICAgICAgICBib2R5Lmdlb21ldHJ5LmdldEZhcnRoZXN0SHVsbFBvaW50KGRpciwgcmVzdWx0KS5yb3RhdGUodHJhbnMpO1xuXG4gICAgICAgICAgICAgICAgY29sbGlzaW9uID0ge1xuICAgICAgICAgICAgICAgICAgICBib2R5QTogYm9keSxcbiAgICAgICAgICAgICAgICAgICAgYm9keUI6IGR1bW15LFxuICAgICAgICAgICAgICAgICAgICBvdmVybGFwOiBvdmVybGFwLFxuICAgICAgICAgICAgICAgICAgICBwb3M6IHJlc3VsdC52YWx1ZXMoKSxcbiAgICAgICAgICAgICAgICAgICAgbm9ybTogZGlyLnJvdGF0ZSh0cmFucykubm9ybWFsaXplKCkudmFsdWVzKCksXG4gICAgICAgICAgICAgICAgICAgIG10djogZGlyLm11bHQob3ZlcmxhcCkudmFsdWVzKCksXG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIGNvbGxpc2lvbnMucHVzaChjb2xsaXNpb24pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gbGVmdFxuICAgICAgICBvdmVybGFwID0gYm91bmRzLm1pbi54IC0gKGFhYmIueCAtIGFhYmIuaHcpO1xuXG4gICAgICAgIGlmICggb3ZlcmxhcCA+PSAwICl7XG5cbiAgICAgICAgICAgIGRpci5zZXQoIC0xLCAwICkucm90YXRlSW52KCB0cmFucy5zZXRSb3RhdGlvbiggYm9keS5zdGF0ZS5hbmd1bGFyLnBvcyApICk7XG5cbiAgICAgICAgICAgIGNvbGxpc2lvbiA9IHtcbiAgICAgICAgICAgICAgICBib2R5QTogYm9keSxcbiAgICAgICAgICAgICAgICBib2R5QjogZHVtbXksXG4gICAgICAgICAgICAgICAgb3ZlcmxhcDogb3ZlcmxhcCxcbiAgICAgICAgICAgICAgICBub3JtOiB7XG4gICAgICAgICAgICAgICAgICAgIHg6IC0xLFxuICAgICAgICAgICAgICAgICAgICB5OiAwXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBtdHY6IHtcbiAgICAgICAgICAgICAgICAgICAgeDogLW92ZXJsYXAsXG4gICAgICAgICAgICAgICAgICAgIHk6IDBcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHBvczogYm9keS5nZW9tZXRyeS5nZXRGYXJ0aGVzdEh1bGxQb2ludCggZGlyLCByZXN1bHQgKS5yb3RhdGUoIHRyYW5zICkudmFsdWVzKClcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGNvbGxpc2lvbnMucHVzaChjb2xsaXNpb24pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gdG9wXG4gICAgICAgIG92ZXJsYXAgPSBib3VuZHMubWluLnkgLSAoYWFiYi55IC0gYWFiYi5oaCk7XG5cbiAgICAgICAgaWYgKCBvdmVybGFwID49IDAgKXtcblxuICAgICAgICAgICAgZGlyLnNldCggMCwgLTEgKS5yb3RhdGVJbnYoIHRyYW5zLnNldFJvdGF0aW9uKCBib2R5LnN0YXRlLmFuZ3VsYXIucG9zICkgKTtcblxuICAgICAgICAgICAgY29sbGlzaW9uID0ge1xuICAgICAgICAgICAgICAgIGJvZHlBOiBib2R5LFxuICAgICAgICAgICAgICAgIGJvZHlCOiBkdW1teSxcbiAgICAgICAgICAgICAgICBvdmVybGFwOiBvdmVybGFwLFxuICAgICAgICAgICAgICAgIG5vcm06IHtcbiAgICAgICAgICAgICAgICAgICAgeDogMCxcbiAgICAgICAgICAgICAgICAgICAgeTogLTFcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG10djoge1xuICAgICAgICAgICAgICAgICAgICB4OiAwLFxuICAgICAgICAgICAgICAgICAgICB5OiAtb3ZlcmxhcFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgcG9zOiBib2R5Lmdlb21ldHJ5LmdldEZhcnRoZXN0SHVsbFBvaW50KCBkaXIsIHJlc3VsdCApLnJvdGF0ZSggdHJhbnMgKS52YWx1ZXMoKVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgY29sbGlzaW9ucy5wdXNoKGNvbGxpc2lvbik7XG4gICAgICAgIH1cblxuICAgICAgICBzY3JhdGNoLmRvbmUoKTtcbiAgICAgICAgcmV0dXJuIGNvbGxpc2lvbnM7XG4gICAgfTtcblxuICAgIC8qXG4gICAgICogY2hlY2tFZGdlQ29sbGlkZSggYm9keSwgYm91bmRzLCBkdW1teSApIC0+IEFycmF5XG4gICAgICogLSBib2R5IChCb2R5KTogVGhlIGJvZHkgdG8gY2hlY2tcbiAgICAgKiAtIGJvdW5kcyAoUGh5c2ljcy5hYWJiKTogVGhlIGJvdW5kYXJ5XG4gICAgICogLSBkdW1teTogKEJvZHkpOiBUaGUgZHVtbXkgYm9keSB0byBwdWJsaXNoIGFzIHRoZSBzdGF0aWMgb3RoZXIgYm9keSBpdCBjb2xsaWRlcyB3aXRoXG4gICAgICogKyAoQXJyYXkpOiBUaGUgY29sbGlzaW9uIGRhdGFcbiAgICAgKlxuICAgICAqIENoZWNrIGlmIGEgYm9keSBjb2xsaWRlcyB3aXRoIHRoZSBib3VuZGFyeVxuICAgICAqL1xuICAgIHZhciBjaGVja0VkZ2VDb2xsaWRlID0gZnVuY3Rpb24gY2hlY2tFZGdlQ29sbGlkZSggYm9keSwgYm91bmRzLCB0ZXJyYWluSGVpZ2h0LCBkdW1teSApe1xuXG4gICAgICAgIHJldHVybiBjaGVja0dlbmVyYWwoIGJvZHksIGJvdW5kcywgdGVycmFpbkhlaWdodCwgZHVtbXkgKTtcbiAgICB9O1xuXG4gICAgdmFyIGRlZmF1bHRzID0ge1xuXG4gICAgICAgIGVkZ2VzOiB7XG4gICAgICAgICAgICBhYWJiOiBudWxsLFxuICAgICAgICAgICAgdGVycmFpbkhlaWdodDogZnVuY3Rpb24gKHgpIHtyZXR1cm4gMDt9LFxuICAgICAgICB9LFxuICAgICAgICByZXN0aXR1dGlvbjogMC45OSxcbiAgICAgICAgY29mOiAxLjAsXG4gICAgICAgIGNoYW5uZWw6ICdjb2xsaXNpb25zOmRldGVjdGVkJ1xuICAgIH07XG5cbiAgICByZXR1cm4ge1xuXG4gICAgICAgIC8vIGV4dGVuZGVkXG4gICAgICAgIGluaXQ6IGZ1bmN0aW9uKCBvcHRpb25zICl7XG5cbiAgICAgICAgICAgIHBhcmVudC5pbml0LmNhbGwoIHRoaXMgKTtcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5kZWZhdWx0cyggZGVmYXVsdHMgKTtcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucyggb3B0aW9ucyApO1xuXG4gICAgICAgICAgICB0aGlzLnNldEFBQkIoIHRoaXMub3B0aW9ucy5hYWJiICk7XG4gICAgICAgICAgICB0aGlzLnJlc3RpdHV0aW9uID0gdGhpcy5vcHRpb25zLnJlc3RpdHV0aW9uO1xuXG4gICAgICAgICAgICB0aGlzLmJvZHkgPSBQaHlzaWNzLmJvZHkoJ3BvaW50Jywge1xuICAgICAgICAgICAgICAgIHRyZWF0bWVudDogJ3N0YXRpYycsXG4gICAgICAgICAgICAgICAgcmVzdGl0dXRpb246IHRoaXMub3B0aW9ucy5yZXN0aXR1dGlvbixcbiAgICAgICAgICAgICAgICBjb2Y6IHRoaXMub3B0aW9ucy5jb2ZcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBFZGdlQ29sbGlzaW9uRGV0ZWN0aW9uQmVoYXZpb3Ijc2V0QUFCQiggYWFiYiApIC0+IHRoaXNcbiAgICAgICAgICogLSBhYWJiIChQaHlzaWNzLmFhYmIpOiBUaGUgYWFiYiB0byB1c2UgYXMgdGhlIGJvdW5kYXJ5XG4gICAgICAgICAqXG4gICAgICAgICAqIFNldCB0aGUgYm91bmRhcmllcyBvZiB0aGUgZWRnZS5cbiAgICAgICAgICoqL1xuICAgICAgICBzZXRBQUJCOiBmdW5jdGlvbiggYWFiYiApe1xuXG4gICAgICAgICAgICBpZiAoIWFhYmIpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyAnRXJyb3I6IGFhYmIgbm90IHNldCc7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuX2VkZ2VzID0ge1xuICAgICAgICAgICAgICAgIG1pbjoge1xuICAgICAgICAgICAgICAgICAgICB4OiAoYWFiYi54IC0gYWFiYi5odyksXG4gICAgICAgICAgICAgICAgICAgIHk6IChhYWJiLnkgLSBhYWJiLmhoKVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgbWF4OiB7XG4gICAgICAgICAgICAgICAgICAgIHg6IChhYWJiLnggKyBhYWJiLmh3KSxcbiAgICAgICAgICAgICAgICAgICAgeTogKGFhYmIueSArIGFhYmIuaGgpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLy8gZXh0ZW5kZWRcbiAgICAgICAgY29ubmVjdDogZnVuY3Rpb24oIHdvcmxkICl7XG5cbiAgICAgICAgICAgIHdvcmxkLm9uKCAnaW50ZWdyYXRlOnZlbG9jaXRpZXMnLCB0aGlzLmNoZWNrQWxsLCB0aGlzICk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLy8gZXh0ZW5kZWRcbiAgICAgICAgZGlzY29ubmVjdDogZnVuY3Rpb24oIHdvcmxkICl7XG5cbiAgICAgICAgICAgIHdvcmxkLm9mZiggJ2ludGVncmF0ZTp2ZWxvY2l0aWVzJywgdGhpcy5jaGVja0FsbCApO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8qKiBpbnRlcm5hbFxuICAgICAgICAgKiBFZGdlQ29sbGlzaW9uRGV0ZWN0aW9uQmVoYXZpb3IjY2hlY2tBbGwoIGRhdGEgKVxuICAgICAgICAgKiAtIGRhdGEgKE9iamVjdCk6IEV2ZW50IGRhdGFcbiAgICAgICAgICpcbiAgICAgICAgICogRXZlbnQgY2FsbGJhY2sgdG8gY2hlY2sgYWxsIGJvZGllcyBmb3IgY29sbGlzaW9ucyB3aXRoIHRoZSBlZGdlXG4gICAgICAgICAqKi9cbiAgICAgICAgY2hlY2tBbGw6IGZ1bmN0aW9uKCBkYXRhICl7XG5cbiAgICAgICAgICAgIHZhciBib2RpZXMgPSB0aGlzLmdldFRhcmdldHMoKVxuICAgICAgICAgICAgICAgICxkdCA9IGRhdGEuZHRcbiAgICAgICAgICAgICAgICAsYm9keVxuICAgICAgICAgICAgICAgICxjb2xsaXNpb25zID0gW11cbiAgICAgICAgICAgICAgICAscmV0XG4gICAgICAgICAgICAgICAgLGJvdW5kcyA9IHRoaXMuX2VkZ2VzXG4gICAgICAgICAgICAgICAgLHRlcnJhaW5IZWlnaHQgPSBfLm1lbW9pemUodGhpcy5vcHRpb25zLnRlcnJhaW5IZWlnaHQpXG4gICAgICAgICAgICAgICAgLGR1bW15ID0gdGhpcy5ib2R5XG4gICAgICAgICAgICAgICAgO1xuXG4gICAgICAgICAgICBmb3IgKCB2YXIgaSA9IDAsIGwgPSBib2RpZXMubGVuZ3RoOyBpIDwgbDsgaSsrICl7XG5cbiAgICAgICAgICAgICAgICBib2R5ID0gYm9kaWVzWyBpIF07XG5cbiAgICAgICAgICAgICAgICAvLyBvbmx5IGRldGVjdCBkeW5hbWljIGJvZGllc1xuICAgICAgICAgICAgICAgIGlmICggYm9keS50cmVhdG1lbnQgPT09ICdkeW5hbWljJyApe1xuXG4gICAgICAgICAgICAgICAgICAgIHJldCA9IGNoZWNrRWRnZUNvbGxpZGUoIGJvZHksIGJvdW5kcywgdGVycmFpbkhlaWdodCwgZHVtbXkgKTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoIHJldCApe1xuICAgICAgICAgICAgICAgICAgICAgICAgY29sbGlzaW9ucy5wdXNoLmFwcGx5KCBjb2xsaXNpb25zLCByZXQgKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCBjb2xsaXNpb25zLmxlbmd0aCApe1xuXG4gICAgICAgICAgICAgICAgdGhpcy5fd29ybGQuZW1pdCggdGhpcy5vcHRpb25zLmNoYW5uZWwsIHtcbiAgICAgICAgICAgICAgICAgICAgY29sbGlzaW9uczogY29sbGlzaW9uc1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxufTtcbiIsIlxudmFyIEJhc2UgPSByZXF1aXJlKCcuL2Jhc2UnKTtcbnZhciBHcmFwaCA9IHJlcXVpcmUoJy4vZ3JhcGgnKTtcblxuZnVuY3Rpb24gcmFuZG9tKCBtaW4sIG1heCApe1xuICAgIHJldHVybiAoTWF0aC5yYW5kb20oKSAqIChtYXgtbWluKSArIG1pbil8MFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2UuZXh0ZW5kKGZ1bmN0aW9uIERlbW8oY29udGFpbmVyLCBvcHRpb25zKSB7XG4gICAgQmFzZS5jYWxsKHRoaXMsIGNvbnRhaW5lciwgb3B0aW9ucywgJ2ltYWdlcy9sYWJfYmFja2dyb3VuZC5qcGcnKVxufSwge1xuICAgIG1ha2VDaXJjbGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIFBoeXNpY3MuYm9keSgnY2lyY2xlJywge1xuICAgICAgICAgICAgeDogdGhpcy5vcHRpb25zLndpZHRoIC8gMixcbiAgICAgICAgICAgIHk6IDUwLFxuICAgICAgICAgICAgdng6IHJhbmRvbSgtNSwgNSkvMTAwLFxuICAgICAgICAgICAgcmFkaXVzOiA0MCxcbiAgICAgICAgICAgIHJlc3RpdHV0aW9uOiAwLjksXG4gICAgICAgICAgICBzdHlsZXM6IHtcbiAgICAgICAgICAgICAgICBmaWxsU3R5bGU6ICcjMjY4YmQyJyxcbiAgICAgICAgICAgICAgICBhbmdsZUluZGljYXRvcjogJyMxNTU0NzknXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgZHJvcEluQm9keTogZnVuY3Rpb24gKCkge1xuXG4gICAgICAgIHZhciBib2R5O1xuXG5cbiAgICAgICAgdmFyIHBlbnQgPSBbXG4gICAgICAgICAgICB7IHg6IDUwLCB5OiAwIH1cbiAgICAgICAgICAgICx7IHg6IDI1LCB5OiAtMjUgfVxuICAgICAgICAgICAgLHsgeDogLTI1LCB5OiAtMjUgfVxuICAgICAgICAgICAgLHsgeDogLTUwLCB5OiAwIH1cbiAgICAgICAgICAgICx7IHg6IDAsIHk6IDUwIH1cbiAgICAgICAgXTtcblxuICAgICAgICAgICAgc3dpdGNoICggcmFuZG9tKCAwLCAzICkgKXtcblxuICAgICAgICAgICAgICAgICAgICAvLyBhZGQgYSBjaXJjbGVcbiAgICAgICAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICAgICAgICAgIGJvZHkgPSBQaHlzaWNzLmJvZHkoJ2NpcmNsZScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHg6IHRoaXMub3B0aW9ucy53aWR0aCAvIDJcbiAgICAgICAgICAgICAgICAgICAgICAgICx5OiA1MFxuICAgICAgICAgICAgICAgICAgICAgICAgLHZ4OiByYW5kb20oLTUsIDUpLzEwMFxuICAgICAgICAgICAgICAgICAgICAgICAgLHJhZGl1czogNDBcbiAgICAgICAgICAgICAgICAgICAgICAgICxyZXN0aXR1dGlvbjogMC45XG4gICAgICAgICAgICAgICAgICAgICAgICAsc3R5bGVzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsbFN0eWxlOiAnIzI2OGJkMidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAsYW5nbGVJbmRpY2F0b3I6ICcjMTU1NDc5J1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gYWRkIGEgc3F1YXJlXG4gICAgICAgICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgICAgICAgICBib2R5ID0gUGh5c2ljcy5ib2R5KCdyZWN0YW5nbGUnLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogNTBcbiAgICAgICAgICAgICAgICAgICAgICAgICxoZWlnaHQ6IDUwXG4gICAgICAgICAgICAgICAgICAgICAgICAseDogdGhpcy5vcHRpb25zLndpZHRoIC8gMlxuICAgICAgICAgICAgICAgICAgICAgICAgLHk6IDUwXG4gICAgICAgICAgICAgICAgICAgICAgICAsdng6IHJhbmRvbSgtNSwgNSkvMTAwXG4gICAgICAgICAgICAgICAgICAgICAgICAscmVzdGl0dXRpb246IDAuOVxuICAgICAgICAgICAgICAgICAgICAgICAgLHN0eWxlczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGxTdHlsZTogJyNkMzM2ODInXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLGFuZ2xlSW5kaWNhdG9yOiAnIzc1MWI0YidcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGFkZCBhIHBvbHlnb25cbiAgICAgICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgICAgIGJvZHkgPSBQaHlzaWNzLmJvZHkoJ2NvbnZleC1wb2x5Z29uJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmVydGljZXM6IHBlbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICx4OiB0aGlzLm9wdGlvbnMud2lkdGggLyAyXG4gICAgICAgICAgICAgICAgICAgICAgICAseTogNTBcbiAgICAgICAgICAgICAgICAgICAgICAgICx2eDogcmFuZG9tKC01LCA1KS8xMDBcbiAgICAgICAgICAgICAgICAgICAgICAgICxhbmdsZTogcmFuZG9tKCAwLCAyICogTWF0aC5QSSApXG4gICAgICAgICAgICAgICAgICAgICAgICAscmVzdGl0dXRpb246IDAuOVxuICAgICAgICAgICAgICAgICAgICAgICAgLHN0eWxlczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGxTdHlsZTogJyM4NTk5MDAnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLGFuZ2xlSW5kaWNhdG9yOiAnIzQxNDcwMCdcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLndvcmxkLmFkZCggYm9keSApO1xuICAgIH0sXG4gICAgc2V0dXA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHdvcmxkID0gdGhpcy53b3JsZFxuICAgICAgICAvLyB3b3JsZC5hZGQoUGh5c2ljcy5iZWhhdmlvcignY29uc3RhbnQtYWNjZWxlcmF0aW9uJykpO1xuXG4gICAgICAgIC8qXG4gICAgICAgIHZhciBpbnQgPSBzZXRJbnRlcnZhbChmdW5jdGlvbigpe1xuICAgICAgICAgICAgaWYgKCB3b3JsZC5fYm9kaWVzLmxlbmd0aCA+IDQgKXtcbiAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKCBpbnQgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuZHJvcEluQm9keSgpO1xuICAgICAgICB9LmJpbmQodGhpcyksIDcwMCk7XG4gICAgICAgKi9cblxuICAgICAgICB2YXIgY2lyY2xlID0gdGhpcy5tYWtlQ2lyY2xlKClcbiAgICAgICAgdGhpcy53b3JsZC5hZGQoY2lyY2xlKVxuXG4gICAgICAgIHZhciBncmFwaCA9IG5ldyBHcmFwaCh0aGlzLmNvbnRhaW5lciwge1xuICAgICAgICAgICAgJ0NpcmNsZSc6IHtib2R5OiBjaXJjbGUsIGF0dHI6ICdwb3MueScsIG5hbWU6J0NpcmNsZScsIG1pbnNjYWxlOiA1fSxcbiAgICAgICAgICAgICdWZWxZJzoge2JvZHk6IGNpcmNsZSwgYXR0cjogJ3ZlbC55JywgbmFtZTonVmVsWScsIG1pbnNjYWxlOiAuMX0sXG4gICAgICAgICAgICAnQW5nUCc6IHtib2R5OiBjaXJjbGUsIGF0dHI6ICdhbmd1bGFyLnBvcycsIG5hbWU6J0FjY1gnLCBtaW5zY2FsZTogLjAwMX0sXG4gICAgICAgICAgICAnQW5nVic6IHtib2R5OiBjaXJjbGUsIGF0dHI6ICdhbmd1bGFyLnZlbCcsIG5hbWU6J0FjY1gnLCBtaW5zY2FsZTogLjAwMX0sXG4gICAgICAgIH0sIHRoaXMub3B0aW9ucy5oZWlnaHQpXG4gICAgICAgIHRoaXMuZ3JhcGggPSBncmFwaFxuXG4gICAgICAgIHRoaXMud29ybGQub24oJ3N0ZXAnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBncmFwaC51cGRhdGUod29ybGQudGltZXN0ZXAoKSlcbiAgICAgICAgfSk7XG5cbiAgICB9XG59KTtcblxuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgbWFrZVJlY3Q6IG1ha2VSZWN0LFxuICAgIG1ha2VSb2NrOiBtYWtlUm9jayxcbiAgICBzdW06IHN1bSxcbiAgICBhdmc6IGF2ZyxcbiAgICBzdGRldjogc3RkZXYsXG4gICAgY29ycmVsYXRpb246IGNvcnJlbGF0aW9uLFxufVxuXG5mdW5jdGlvbiBzdW0obnVtYmVycykge1xuICAgIGlmICghbnVtYmVycy5sZW5ndGgpIHJldHVybiAwO1xuICAgIHJldHVybiBudW1iZXJzLnJlZHVjZShmdW5jdGlvbiAoYSwgYikge3JldHVybiBhICsgYn0pXG59XG5cbmZ1bmN0aW9uIGF2ZyhudW1iZXJzKSB7XG4gICAgaWYgKCFudW1iZXJzLmxlbmd0aCkgcmV0dXJuIDA7XG4gICAgcmV0dXJuIHN1bShudW1iZXJzKSAvIG51bWJlcnMubGVuZ3RoXG59XG5cbmZ1bmN0aW9uIHN0ZGV2KG51bWJlcnMpIHtcbiAgICBpZiAoIW51bWJlcnMubGVuZ3RoKSByZXR1cm4gMDtcbiAgICB2YXIgYSA9IGF2ZyhudW1iZXJzKTtcbiAgICByZXR1cm4gTWF0aC5zcXJ0KGF2ZyhfLm1hcChudW1iZXJzLCBmdW5jdGlvbiAobnVtKSB7cmV0dXJuIE1hdGgucG93KG51bSAtIGEsIDIpO30pKSlcbn1cblxuZnVuY3Rpb24gY29ycmVsYXRpb24oZGF0YTEsIGRhdGEyKSB7XG4gICAgaWYgKCFkYXRhMS5sZW5ndGggfHwgZGF0YTEubGVuZ3RoICE9IGRhdGEyLmxlbmd0aCkgcmV0dXJuIDA7XG4gICAgdmFyIGF2ZzEgPSBhdmcoZGF0YTEpO1xuICAgIHZhciBhdmcyID0gYXZnKGRhdGEyKTtcbiAgICB2YXIgY292YXJpYW5jZSA9IGF2ZyhfLm1hcChcbiAgICAgICAgXy56aXAoZGF0YTEsIGRhdGEyKSwgXG4gICAgICAgIGZ1bmN0aW9uIChkYXRhUGFpcikge3JldHVybiAoZGF0YVBhaXJbMF0gLSBhdmcxKSAqIChkYXRhUGFpclsxXSAtIGF2ZzIpO30pKTtcbiAgICByZXR1cm4gY292YXJpYW5jZSAvIChzdGRldihkYXRhMSkgKiBzdGRldihkYXRhMikpO1xufVxuXG5mdW5jdGlvbiBtYWtlUmVjdCh4LCB5LCB3aWR0aCwgaGVpZ2h0KSB7XG4gICAgcmV0dXJuIFtcbiAgICAgICAge3g6IHggLSB3aWR0aC8yLCB5OiB5IC0gaGVpZ2h0LzJ9LFxuICAgICAgICB7eDogeCArIHdpZHRoLzIsIHk6IHkgLSBoZWlnaHQvMn0sXG4gICAgICAgIHt4OiB4ICsgd2lkdGgvMiwgeTogeSArIGhlaWdodC8yfSxcbiAgICAgICAge3g6IHggLSB3aWR0aC8yLCB5OiB5ICsgaGVpZ2h0LzJ9LFxuICAgIF1cbn1cblxuLy8gTm90IGEgY29udmV4IGh1bGwgOihcbmZ1bmN0aW9uIG1ha2VSb2NrKHJhZGl1cywgZGV2aWF0aW9uLCByZXNvbHV0aW9uKSB7XG4gICAgdmFyIHJlc29sdXRpb24gPSByZXNvbHV0aW9uIHx8IDMyXG4gICAgdmFyIGRldmlhdGlvbiA9IGRldmlhdGlvbiB8fCAxMFxuICAgIHZhciBwb2ludHMgPSBbXVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVzb2x1dGlvbjsgaSsrKSB7XG4gICAgICAgIHZhciBhbmcgPSBpIC8gcmVzb2x1dGlvbiAqIDIgKiBNYXRoLlBJO1xuICAgICAgICB2YXIgcG9pbnQgPSB7IHg6IHJhZGl1cyAqIE1hdGguY29zKGFuZyksIHk6IHJhZGl1cyAqIE1hdGguc2luKGFuZykgfVxuICAgICAgICBwb2ludC54ICs9IChNYXRoLnJhbmRvbSgpKSAqIDIgKiBkZXZpYXRpb25cbiAgICAgICAgcG9pbnQueSArPSAoTWF0aC5yYW5kb20oKSkgKiAyICogZGV2aWF0aW9uXG4gICAgICAgIHBvaW50cy5wdXNoKHBvaW50KVxuICAgIH1cbiAgICByZXR1cm4gcG9pbnRzXG59XG4iLCJcbnZhciBiYWtoYW4gPSByZXF1aXJlKCcuL2xpYicpXG4gICwgbm9kZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYWluLWNhbnZhcycpXG5cbnZhciBvcHRpb25zID0ge1xuICAgIHdpZHRoOiA5MDAsXG4gICAgaGVpZ2h0OiA3MDAsXG59XG5cbnZhciBuYW1lID0gd2luZG93LmxvY2F0aW9uLnNlYXJjaC5yZXBsYWNlKC8mKFxcdyspPShbXiZdKykvZywgZnVuY3Rpb24gKHJlcywga2V5LCB2YWwpIHtcbiAgICBvcHRpb25zW2tleV0gPSB2YWwucmVwbGFjZSgvXFwvLywgJycpXG4gICAgcmV0dXJuICcnXG59KS5yZXBsYWNlKC9bXlxcd10vZywgJycpXG5pZiAoIW5hbWUpIHtcbiAgICBuYW1lID0gJ0Ryb3AnO1xuICAgIG9wdGlvbnMud2FsayA9ICd0cnVlJztcbn1cbmNvbnNvbGUubG9nKG5hbWUsIG9wdGlvbnMpXG5cbndpbmRvdy5CS0EgPSBuZXcgYmFraGFuW25hbWVdKG5vZGUsIG9wdGlvbnMpO1xud2luZG93LkJLQS5ydW4oKTtcbiJdfQ==
