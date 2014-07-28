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
                React.DOM.p({className: "bacon-badge-container"}, React.DOM.img({className: "bacon-badge", src: "images/bacon.png"}))
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi91c3IvbG9jYWwvbGliL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvYWxhbi9oYWNrYXRob24vYmFraGFuL2xpYi9hc3Rlcm9pZHMuanMiLCIvVXNlcnMvYWxhbi9oYWNrYXRob24vYmFraGFuL2xpYi9iYWNvbi5qc3giLCIvVXNlcnMvYWxhbi9oYWNrYXRob24vYmFraGFuL2xpYi9iYXNlLmpzIiwiL1VzZXJzL2FsYW4vaGFja2F0aG9uL2Jha2hhbi9saWIvY2FuZ3JhcGguanMiLCIvVXNlcnMvYWxhbi9oYWNrYXRob24vYmFraGFuL2xpYi9jYXZlZHJhdy5qcyIsIi9Vc2Vycy9hbGFuL2hhY2thdGhvbi9iYWtoYW4vbGliL2NoZWNrLWNvbGxpc2lvbi5qcyIsIi9Vc2Vycy9hbGFuL2hhY2thdGhvbi9iYWtoYW4vbGliL2RhdGFjaGVja2VyLmpzeCIsIi9Vc2Vycy9hbGFuL2hhY2thdGhvbi9iYWtoYW4vbGliL2RlbW8uanMiLCIvVXNlcnMvYWxhbi9oYWNrYXRob24vYmFraGFuL2xpYi9kcm9wLmpzIiwiL1VzZXJzL2FsYW4vaGFja2F0aG9uL2Jha2hhbi9saWIvZHJvcGRhdGFjaGVja2VyLmpzIiwiL1VzZXJzL2FsYW4vaGFja2F0aG9uL2Jha2hhbi9saWIvZ2F0ZS5qcyIsIi9Vc2Vycy9hbGFuL2hhY2thdGhvbi9iYWtoYW4vbGliL2dyYXBoLmpzIiwiL1VzZXJzL2FsYW4vaGFja2F0aG9uL2Jha2hhbi9saWIvaGlsbHMuanMiLCIvVXNlcnMvYWxhbi9oYWNrYXRob24vYmFraGFuL2xpYi9oaWxsc2RhdGFjaGVja2VyLmpzIiwiL1VzZXJzL2FsYW4vaGFja2F0aG9uL2Jha2hhbi9saWIvaW5kZXguanMiLCIvVXNlcnMvYWxhbi9oYWNrYXRob24vYmFraGFuL2xpYi9pbnRyby9kcm9wX2ludHJvLmpzeCIsIi9Vc2Vycy9hbGFuL2hhY2thdGhvbi9iYWtoYW4vbGliL2ludHJvL2hpbGxzX2ludHJvLmpzeCIsIi9Vc2Vycy9hbGFuL2hhY2thdGhvbi9iYWtoYW4vbGliL2ludHJvL25ld3RvbjFfaW50cm8uanN4IiwiL1VzZXJzL2FsYW4vaGFja2F0aG9uL2Jha2hhbi9saWIvaW50cm8vc3RlcC5qc3giLCIvVXNlcnMvYWxhbi9oYWNrYXRob24vYmFraGFuL2xpYi9pbnRyby93YWxrLXRocm91Z2guanN4IiwiL1VzZXJzL2FsYW4vaGFja2F0aG9uL2Jha2hhbi9saWIvbG9nYm9vay5qcyIsIi9Vc2Vycy9hbGFuL2hhY2thdGhvbi9iYWtoYW4vbGliL21vb24uanMiLCIvVXNlcnMvYWxhbi9oYWNrYXRob24vYmFraGFuL2xpYi9uZXctYXN0ZXJvaWQtYnV0dG9uLmpzeCIsIi9Vc2Vycy9hbGFuL2hhY2thdGhvbi9iYWtoYW4vbGliL25ld3RvbjEuanMiLCIvVXNlcnMvYWxhbi9oYWNrYXRob24vYmFraGFuL2xpYi9uZXd0b24xZGF0YWNoZWNrZXIuanMiLCIvVXNlcnMvYWxhbi9oYWNrYXRob24vYmFraGFuL2xpYi9vcmJpdC5qcyIsIi9Vc2Vycy9hbGFuL2hhY2thdGhvbi9iYWtoYW4vbGliL3BsYXlwYXVzZS5qcyIsIi9Vc2Vycy9hbGFuL2hhY2thdGhvbi9iYWtoYW4vbGliL3Nsb3BlLmpzIiwiL1VzZXJzL2FsYW4vaGFja2F0aG9uL2Jha2hhbi9saWIvc3RvcHdhdGNoLmpzIiwiL1VzZXJzL2FsYW4vaGFja2F0aG9uL2Jha2hhbi9saWIvdGVycmFpbi5qcyIsIi9Vc2Vycy9hbGFuL2hhY2thdGhvbi9iYWtoYW4vbGliL3RyeS1ncmFwaC5qcyIsIi9Vc2Vycy9hbGFuL2hhY2thdGhvbi9iYWtoYW4vbGliL3V0aWwuanMiLCIvVXNlcnMvYWxhbi9oYWNrYXRob24vYmFraGFuL3J1bi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDck5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDelNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgR2F0ZSA9IHJlcXVpcmUoJy4vZ2F0ZScpO1xudmFyIEJhc2UgPSByZXF1aXJlKCcuL2Jhc2UnKTtcbnZhciBTdG9wd2F0Y2ggPSByZXF1aXJlKCcuL3N0b3B3YXRjaCcpO1xudmFyIFBsYXlQYXVzZSA9IHJlcXVpcmUoJy4vcGxheXBhdXNlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gQmFzZS5leHRlbmQoZnVuY3Rpb24gQXN0ZXJvaWRzKGNvbnRhaW5lciwgb3B0aW9ucykge1xuICAgIEJhc2UuY2FsbCh0aGlzLCBjb250YWluZXIsIG9wdGlvbnMsICdpbWFnZXMvc3BhY2VfYmFja2dyb3VuZC5qcGcnLFxuICAgICAgICB0cnVlKVxufSwge1xuICAgIHNldHVwOiBmdW5jdGlvbiAoY29udGFpbmVyKSB7XG4gICAgICAgIHZhciB3b3JsZCA9IHRoaXMud29ybGQ7XG4gICAgICAgIHdvcmxkLmFkZChQaHlzaWNzLmJvZHkoJ2NpcmNsZScsIHtcbiAgICAgICAgICAgIHg6IDQwMFxuICAgICAgICAgICAgLHk6IDM1MFxuICAgICAgICAgICAgLHZ4OiAtMS4zLzUwXG4gICAgICAgICAgICAscmFkaXVzOiAxMFxuICAgICAgICAgICAgLG1hc3M6IDEwMDBcbiAgICAgICAgICAgICxyZXN0aXR1dGlvbjogMFxuICAgICAgICAgICAgLHN0eWxlczoge1xuICAgICAgICAgICAgICAgIGZpbGxTdHlsZTogJyNmZmNjMDAnXG4gICAgICAgICAgICAgICAgLGFuZ2xlSW5kaWNhdG9yOiAnIzE1NTQ3OSdcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkpO1xuICAgICAgICB3b3JsZC5hZGQoUGh5c2ljcy5ib2R5KCdjaXJjbGUnLCB7XG4gICAgICAgICAgICB4OiA0MDBcbiAgICAgICAgICAgICx5OiA1MFxuICAgICAgICAgICAgLHZ4OiAxLjNcbiAgICAgICAgICAgICxyYWRpdXM6IDVcbiAgICAgICAgICAgICxtYXNzOiAyMFxuICAgICAgICAgICAgLHJlc3RpdHV0aW9uOiAwXG4gICAgICAgICAgICAsc3R5bGVzOiB7XG4gICAgICAgICAgICAgICAgZmlsbFN0eWxlOiAnIzI2ZWI2MicgLy9ncmVlblxuICAgICAgICAgICAgICAgICxhbmdsZUluZGljYXRvcjogJyMxNTU0NzknXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pKTtcbiAgICAgICAgd29ybGQuYWRkKFBoeXNpY3MuYmVoYXZpb3IoJ25ld3RvbmlhbicsIHsgc3RyZW5ndGg6IC41IH0pKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCAxMDA7IGkrKykge1xuICAgICAgICAgICAgdmFyIHIgPSBNYXRoLnJhbmRvbSgpICogMTAgKyAyOTU7XG4gICAgICAgICAgICB2YXIgdGggPSAoLTEvNiAtIDAuMDA1ICsgTWF0aC5yYW5kb20oKSAqIDAuMDEpICogTWF0aC5QSTtcbiAgICAgICAgICAgIHdvcmxkLmFkZChQaHlzaWNzLmJvZHkoJ2NpcmNsZScsIHtcbiAgICAgICAgICAgICAgICB4OiBNYXRoLmNvcyh0aCkgKiByICsgNDAwXG4gICAgICAgICAgICAgICAgLHk6IE1hdGguc2luKHRoKSAqIHIgKyAzNTBcbiAgICAgICAgICAgICAgICAsdng6IC0xLjMgKiBNYXRoLnNpbih0aClcbiAgICAgICAgICAgICAgICAsdnk6IDEuMyAqIE1hdGguY29zKHRoKVxuICAgICAgICAgICAgICAgICxyYWRpdXM6IDJcbiAgICAgICAgICAgICAgICAsbWFzczogTWF0aC5wb3coMTAsIE1hdGgucmFuZG9tKCkgKiAyKSAqIDAuMDAwMDFcbiAgICAgICAgICAgICAgICAscmVzdGl0dXRpb246IDBcbiAgICAgICAgICAgICAgICAsc3R5bGVzOiB7XG4gICAgICAgICAgICAgICAgICAgIGZpbGxTdHlsZTogJyNkZDIyMjInIC8vcmVkXG4gICAgICAgICAgICAgICAgICAgICxhbmdsZUluZGljYXRvcjogJyMxNTU0NzknXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGJ1dHRvbkNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChidXR0b25Db250YWluZXIpO1xuICAgICAgICB2YXIgcGxheVBhdXNlID0gbmV3IFBsYXlQYXVzZSh3b3JsZCwgYnV0dG9uQ29udGFpbmVyKTtcbiAgICB9XG59KTtcblxuICAgICAgICBcbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xuXG52YXIgV2Fsa3Rocm91Z2ggPSByZXF1aXJlKCcuL2ludHJvL3dhbGstdGhyb3VnaC5qc3gnKVxudmFyIFN0ZXAgPSByZXF1aXJlKCcuL2ludHJvL3N0ZXAuanN4JylcblxubW9kdWxlLmV4cG9ydHMgPSBCYWNvbjtcblxuZnVuY3Rpb24gQmFjb24oY29udGFpbmVyLCBvcHRpb25zKSB7XG4gICAgdmFyIG5vZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKG5vZGUpO1xuICAgIFJlYWN0LnJlbmRlckNvbXBvbmVudChXYWxrdGhyb3VnaCh7XG4gICAgICAgIHN0ZXBzOiBzdGVwcyxcbiAgICB9KSwgbm9kZSk7XG59XG5cbkJhY29uLnByb3RvdHlwZSA9IHtcbiAgICBydW46IGZ1bmN0aW9uICgpIHt9LFxufTtcblxudmFyIHN0ZXBzID0gW1xuICAgIGZ1bmN0aW9uIChwcm9wcykge1xuICAgICAgICByZXR1cm4gU3RlcChfLmV4dGVuZChwcm9wcywge1xuICAgICAgICAgICAgaWQ6ICdjb25ncmF0cycsXG4gICAgICAgICAgICB0aXRsZTogXCJDb25ncmF0dWxhdGlvbnMhXCIsXG4gICAgICAgICAgICBzaG93QmFjb246IHRydWUsXG4gICAgICAgICAgICBib2R5OiBSZWFjdC5ET00uZGl2KG51bGwsIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5wKG51bGwsIFwiVGhhdCB3YXMgc29tZSBhd2Vzb21lIFNjaWVuY2UgeW91IGRpZCB0aGVyZSEgIFlvdSd2ZSBmaW5pc2hlZCBhbGwgb2YgbXkgZXhwZXJpbWVudHMuIFlvdSBlYXJuZWQgdGhlIFwiLCBSZWFjdC5ET00uc3Ryb25nKG51bGwsIFwiQmFjb24gQmFkZ2VcIiksIFwiIGZvciB5b3VyIHdvcmsuXCIpLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00ucCh7Y2xhc3NOYW1lOiBcImJhY29uLWJhZGdlLWNvbnRhaW5lclwifSwgUmVhY3QuRE9NLmltZyh7Y2xhc3NOYW1lOiBcImJhY29uLWJhZGdlXCIsIHNyYzogXCJpbWFnZXMvYmFjb24ucG5nXCJ9KSlcbiAgICAgICAgICAgICksXG4gICAgICAgICAgICBuZXh0OiBcIldoYXQncyBuZXh0P1wiXG4gICAgICAgIH0pKTtcbiAgICB9LFxuXG4gICAgZnVuY3Rpb24gKHByb3BzKSB7XG4gICAgICAgIHJldHVybiBTdGVwKF8uZXh0ZW5kKHByb3BzLCB7XG4gICAgICAgICAgICBpZDogJ25leHQnLFxuICAgICAgICAgICAgdGl0bGU6IFwiRG8gbW9yZSBzY2llbmNlIVwiLFxuICAgICAgICAgICAgc2hvd0JhY29uOiB0cnVlLFxuICAgICAgICAgICAgYm9keTogUmVhY3QuRE9NLmRpdihudWxsLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00ucChudWxsLCBcIklmIHlvdSB3YW50IHRvIGxlYXJuIG1vcmUgc2NpZW5jZSwgY2hlY2sgb3V0IHRoZSBcIiwgUmVhY3QuRE9NLmEoe2hyZWY6IFwiLy9raGFuYWNhZGVteS5vcmcvc2NpZW5jZS9waHlzaWNzXCJ9LCBcInBoeXNpY3NcIiksIFwiIHNlY3Rpb24gb24gS2hhbiBBY2FkZW15LiAgSGF2ZSBmdW4hXCIpXG4gICAgICAgICAgICApLFxuICAgICAgICB9KSk7XG4gICAgfSxcbl07XG4iLCJcbm1vZHVsZS5leHBvcnRzID0gQmFzZTtcblxuZnVuY3Rpb24gQmFzZShjb250YWluZXIsIG9wdGlvbnMsIGJhY2tncm91bmQsIGRpc2FibGVCb3VuZHMpIHtcbiAgICB0aGlzLmNvbnRhaW5lciA9IGNvbnRhaW5lclxuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnNcbiAgICAkKCcuYmFja2dyb3VuZCcpLmF0dHIoJ3NyYycsIGJhY2tncm91bmQpO1xuICAgIHRoaXMuX3NldHVwV29ybGQoZGlzYWJsZUJvdW5kcylcbiAgICB0aGlzLnNldHVwKGNvbnRhaW5lcilcbiAgICAvLyBpbml0IHN0dWZmXG59XG5cbkJhc2UuZXh0ZW5kID0gZnVuY3Rpb24gKHN1YiwgcHJvdG8pIHtcbiAgICBzdWIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShCYXNlLnByb3RvdHlwZSlcbiAgICBzdWIuY29uc3RydWN0b3IgPSBzdWJcbiAgICBmb3IgKHZhciBuYW1lIGluIHByb3RvKSB7XG4gICAgICAgIGlmIChwcm90by5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xuICAgICAgICAgICAgc3ViLnByb3RvdHlwZVtuYW1lXSA9IHByb3RvW25hbWVdXG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHN1YlxufVxuXG5CYXNlLnByb3RvdHlwZSA9IHtcblxuICAgIF9zZXR1cFdvcmxkOiBmdW5jdGlvbiAoZGlzYWJsZUJvdW5kcykge1xuICAgICAgICB2YXIgd29ybGQgPSB0aGlzLndvcmxkID0gUGh5c2ljcygpXG4gICAgICAgIC8vIGNyZWF0ZSBhIHJlbmRlcmVyXG4gICAgICAgIHRoaXMucmVuZGVyZXIgPSBQaHlzaWNzLnJlbmRlcmVyKCdjYW52YXMnLCB7XG4gICAgICAgICAgICBlbDogdGhpcy5jb250YWluZXIsXG4gICAgICAgICAgICB3aWR0aDogdGhpcy5vcHRpb25zLndpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0OiB0aGlzLm9wdGlvbnMuaGVpZ2h0XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLndvcmxkLmFkZCh0aGlzLnJlbmRlcmVyKTtcblxuICAgICAgICAvLyBhZGQgdGhpbmdzIHRvIHRoZSB3b3JsZFxuICAgICAgICB0aGlzLndvcmxkLmFkZChbXG4gICAgICAgICAgICBQaHlzaWNzLmJlaGF2aW9yKCdpbnRlcmFjdGl2ZS1mb3JjZScsIHsgZWw6IHRoaXMucmVuZGVyZXIuZWwgfSksXG4gICAgICAgICAgICBQaHlzaWNzLmJlaGF2aW9yKCdib2R5LWltcHVsc2UtcmVzcG9uc2UnKSxcbiAgICAgICAgICAgIFBoeXNpY3MuYmVoYXZpb3IoJ2JvZHktY29sbGlzaW9uLWRldGVjdGlvbicpLFxuICAgICAgICAgICAgUGh5c2ljcy5iZWhhdmlvcignc3dlZXAtcHJ1bmUnKSxcbiAgICAgICAgXSk7XG5cbiAgICAgICAgaWYgKCFkaXNhYmxlQm91bmRzKSB7XG4gICAgICAgICAgICB0aGlzLndvcmxkLmFkZChQaHlzaWNzLmJlaGF2aW9yKCdlZGdlLWNvbGxpc2lvbi1kZXRlY3Rpb24nLCB7XG4gICAgICAgICAgICAgICAgYWFiYjogUGh5c2ljcy5hYWJiKDAsIDAsIHRoaXMub3B0aW9ucy53aWR0aCwgdGhpcy5vcHRpb25zLmhlaWdodCksXG4gICAgICAgICAgICAgICAgcmVzdGl0dXRpb246IDAuMixcbiAgICAgICAgICAgICAgICBjb2Y6IDAuOFxuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG5cblxuICAgICAgICAvLyByZW5kZXIgb24gZWFjaCBzdGVwXG4gICAgICAgIHdvcmxkLm9uKCdzdGVwJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgd29ybGQucmVuZGVyKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIHN1YnNjcmliZSB0byB0aWNrZXIgdG8gYWR2YW5jZSB0aGUgc2ltdWxhdGlvblxuICAgICAgICBQaHlzaWNzLnV0aWwudGlja2VyLm9uKGZ1bmN0aW9uKCB0aW1lICkge1xuICAgICAgICAgICAgd29ybGQuc3RlcCggdGltZSApO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgcnVuOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIHN0YXJ0IHRoZSB0aWNrZXJcbiAgICAgICAgUGh5c2ljcy51dGlsLnRpY2tlci5zdGFydCgpO1xuICAgIH1cbn1cbiIsIlxubW9kdWxlLmV4cG9ydHMgPSBDYW5HcmFwaFxuXG5mdW5jdGlvbiBDYW5HcmFwaChvcHRpb25zKSB7XG4gICAgdGhpcy5vID0gXy5leHRlbmQoe1xuICAgICAgICBtYXg6IDUwMCxcbiAgICAgICAgbWFyZ2luOiAxMCxcbiAgICAgICAgbWluc2NhbGU6IDEsXG4gICAgICAgIHRpY2tzY2FsZTogNTBcbiAgICB9LCBvcHRpb25zKVxuICAgIHRoaXMucG9pbnRzID0gW11cbiAgICB0aGlzLnByZXZzY2FsZSA9IHRoaXMuby5taW5zY2FsZVxuICAgIHRoaXMub2ZmID0gMFxufVxuXG5DYW5HcmFwaC5wcm90b3R5cGUgPSB7XG4gICAgZHJhdzogZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoIXRoaXMucG9pbnRzLmxlbmd0aCkgcmV0dXJuXG4gICAgICAgIHZhciBjdHggPSB0aGlzLm8ubm9kZS5nZXRDb250ZXh0KCcyZCcpXG4gICAgICAgIHZhciB3aWR0aCA9IHRoaXMuby53aWR0aCAtIHRoaXMuby5tYXJnaW4qMlxuICAgICAgICB2YXIgaGVpZ2h0ID0gdGhpcy5vLmhlaWdodCAtIHRoaXMuby5tYXJnaW4qMlxuICAgICAgICB2YXIgdG9wID0gdGhpcy5vLnRvcCArIHRoaXMuby5tYXJnaW5cbiAgICAgICAgdmFyIGxlZnQgPSB0aGlzLm8ubGVmdCArIHRoaXMuby5tYXJnaW5cblxuICAgICAgICB2YXIgZHggPSB3aWR0aCAvIHRoaXMucG9pbnRzLmxlbmd0aFxuICAgICAgICB2YXIgbWluID0gTWF0aC5taW4uYXBwbHkoTWF0aCwgdGhpcy5wb2ludHMpXG4gICAgICAgIHZhciBtYXggPSBNYXRoLm1heC5hcHBseShNYXRoLCB0aGlzLnBvaW50cylcbiAgICAgICAgdmFyIHNjYWxlID0gbWF4IC0gbWluXG4gICAgICAgIGlmIChzY2FsZSA8IHRoaXMuby5taW5zY2FsZSkge1xuICAgICAgICAgICAgc2NhbGUgPSB0aGlzLm8ubWluc2NhbGVcbiAgICAgICAgfVxuICAgICAgICBpZiAoc2NhbGUgPCB0aGlzLnByZXZzY2FsZSouOTkpIHtcbiAgICAgICAgICAgIHNjYWxlID0gdGhpcy5wcmV2c2NhbGUqLjk5XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGR5ID0gaGVpZ2h0IC8gc2NhbGVcbiAgICAgICAgaWYgKG1heCAtIG1pbiA8IHNjYWxlKSB7XG4gICAgICAgICAgICB2YXIgZCA9IHNjYWxlIC0gKG1heC1taW4pXG4gICAgICAgICAgICBtaW4gLT0gZC8yXG4gICAgICAgICAgICBtYXggKz0gZC8yXG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnByZXZzY2FsZSA9IHNjYWxlXG5cbiAgICAgICAgLy8gZHJhdyB4IGF4aXNcbiAgICAgICAgaWYgKG1pbiA8PSAwICYmIG1heCA+PSAwKSB7XG4gICAgICAgICAgICBjdHguYmVnaW5QYXRoKClcbiAgICAgICAgICAgIGN0eC5tb3ZlVG8obGVmdCwgdG9wICsgaGVpZ2h0IC0gKC1taW4pKmR5KVxuICAgICAgICAgICAgY3R4LmxpbmVUbyhsZWZ0ICsgd2lkdGgsIHRvcCArIGhlaWdodCAtICgtbWluKSpkeSlcbiAgICAgICAgICAgIGN0eC5zdHJva2VTdHlsZSA9ICcjY2NjJ1xuICAgICAgICAgICAgY3R4LnN0cm9rZSgpXG4gICAgICAgIH1cblxuICAgICAgICAvLyBkcmF3IHRpY2tzXG4gICAgICAgIHZhciB0aWNrdG9wID0gdG9wICsgaGVpZ2h0IC0gKC1taW4pKmR5IC0gNVxuICAgICAgICBpZiAodGlja3RvcCA8IHRvcCkge1xuICAgICAgICAgICAgdGlja3RvcCA9IHRvcFxuICAgICAgICB9XG4gICAgICAgIGlmICh0aWNrdG9wICsgMTAgPiB0b3AgKyBoZWlnaHQpIHtcbiAgICAgICAgICAgIHRpY2t0b3AgPSB0b3AgKyBoZWlnaHQgLSAxMFxuICAgICAgICB9XG4gICAgICAgIGZvciAodmFyIGk9dGhpcy5vZmY7IGk8dGhpcy5wb2ludHMubGVuZ3RoOyBpKz10aGlzLm8udGlja3NjYWxlKSB7XG4gICAgICAgICAgICBjdHguYmVnaW5QYXRoKClcbiAgICAgICAgICAgIGN0eC5tb3ZlVG8obGVmdCArIGkqZHgsIHRpY2t0b3ApXG4gICAgICAgICAgICBjdHgubGluZVRvKGxlZnQgKyBpKmR4LCB0aWNrdG9wICsgMTApXG4gICAgICAgICAgICBjdHguc3Ryb2tlU3R5bGUgPSAnI2NjYydcbiAgICAgICAgICAgIGN0eC5zdHJva2UoKVxuICAgICAgICB9XG5cblxuICAgICAgICAvLyBkcmF3IGxpbmVcbiAgICAgICAgY3R4LmJlZ2luUGF0aCgpXG4gICAgICAgIHRoaXMucG9pbnRzLm1hcChmdW5jdGlvbiAocCwgeCkge1xuICAgICAgICAgICAgY3R4LmxpbmVUbyhsZWZ0ICsgeCAqIGR4LCB0b3AgKyBoZWlnaHQgLSAocCAtIG1pbikgKiBkeSlcbiAgICAgICAgfSlcbiAgICAgICAgY3R4LnN0cm9rZVN0eWxlID0gJ2JsdWUnXG4gICAgICAgIGN0eC5saW5lV2lkdGggPSAxXG4gICAgICAgIGN0eC5zdHJva2UoKVxuXG4gICAgICAgIC8vIGRyYXcgdGl0bGVcbiAgICAgICAgdmFyIHRoID0gMTBcbiAgICAgICAgY3R4LmZvbnQgPSB0aCArICdwdCBBcmlhbCdcbiAgICAgICAgdmFyIHR3ID0gY3R4Lm1lYXN1cmVUZXh0KHRoaXMuby50aXRsZSkud2lkdGhcbiAgICAgICAgY3R4LmZpbGxTdHlsZSA9ICdibGFjaydcbiAgICAgICAgY3R4Lmdsb2JhbEFscGhhID0gMVxuICAgICAgICBjdHguY2xlYXJSZWN0KGxlZnQsIHRvcCwgdHcsIHRoICsgNSlcbiAgICAgICAgY3R4LmZpbGxUZXh0KHRoaXMuby50aXRsZSwgbGVmdCwgdG9wICsgdGgpXG5cblxuICAgICAgICAvLyBkcmF3IHJlY3RcbiAgICAgICAgY3R4LnN0cm9rZVN0eWxlID0gJyM2NjYnXG4gICAgICAgIGN0eC5yZWN0KHRoaXMuby5sZWZ0ICsgdGhpcy5vLm1hcmdpbi8yLHRoaXMuby50b3AgKyB0aGlzLm8ubWFyZ2luLzIsdGhpcy5vLndpZHRoIC0gdGhpcy5vLm1hcmdpbix0aGlzLm8uaGVpZ2h0IC0gdGhpcy5vLm1hcmdpbilcbiAgICAgICAgY3R4LnN0cm9rZSgpXG4gICAgfSxcbiAgICBhZGRQb2ludDogZnVuY3Rpb24gKHBvaW50KSB7XG4gICAgICAgIHRoaXMucG9pbnRzLnB1c2gocG9pbnQpXG4gICAgICAgIGlmICh0aGlzLnBvaW50cy5sZW5ndGggPiB0aGlzLm8ubWF4KSB7XG4gICAgICAgICAgICB0aGlzLm9mZiAtPSB0aGlzLnBvaW50cy5sZW5ndGggLSB0aGlzLm8ubWF4XG4gICAgICAgICAgICB0aGlzLm9mZiAlPSB0aGlzLm8udGlja3NjYWxlXG4gICAgICAgICAgICB0aGlzLnBvaW50cyA9IHRoaXMucG9pbnRzLnNsaWNlKC10aGlzLm8ubWF4KVxuICAgICAgICB9XG4gICAgfVxufVxuXG4iLCJtb2R1bGUuZXhwb3J0cyA9IENhdmVEcmF3O1xuXG5mdW5jdGlvbiBDYXZlRHJhdyhjb250YWluZXIsIHdpZHRoLCBoZWlnaHQpIHtcbiAgICB0aGlzLmNvbnRhaW5lciA9ICQoY29udGFpbmVyKVxuICAgIHRoaXMuY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJylcbiAgICB0aGlzLmNhbnZhcy53aWR0aCA9IHdpZHRoXG4gICAgdGhpcy5jYW52YXMuaGVpZ2h0ID0gaGVpZ2h0XG4gICAgY29udGFpbmVyLmFwcGVuZCh0aGlzLmNhbnZhcylcbn1cblxuQ2F2ZURyYXcucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbihmbikge1xuICAgIGRlZmluZVBhdGgodGhpcy5jYW52YXMsIGZuKVxuICAgIGRyYXdQYXRoKHRoaXMuY2FudmFzKVxufVxuXG5DYXZlRHJhdy5wcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgY29udGV4dCA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gICAgY29udGV4dC5jbGVhclJlY3QoMCwgMCwgdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodClcbn1cblxuZnVuY3Rpb24gZGVmaW5lUGF0aChjYW52YXMsIGZuKSB7XG4gICAgdmFyIGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICB2YXIgeG1heCA9IGNhbnZhcy53aWR0aFxuICAgIHZhciB5bWF4ID0gY2FudmFzLmhlaWdodFxuXG4gICAgY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICBjb250ZXh0Lm1vdmVUbygwLCBmbigwKSk7XG4gICAgZm9yICh2YXIgeCA9IDA7IHggPCB4bWF4IDsgeCsrKSB7XG4gICAgICAgIGNvbnRleHQubGluZVRvKHgsIHltYXggLSBmbih4KSlcbiAgICB9XG5cbiAgICBjb250ZXh0LmxpbmVUbyh4bWF4LCB5bWF4KVxuICAgIGNvbnRleHQubGluZVRvKDAsIHltYXgpXG4gICAgY29udGV4dC5jbG9zZVBhdGgoKTtcbn1cblxuZnVuY3Rpb24gZHJhd1BhdGgoY2FudmFzKSB7XG4gICAgdmFyIGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICBjb250ZXh0LmxpbmVXaWR0aCA9IDU7XG4gICAgLy8gY29udGV4dC5maWxsU3R5bGUgPSAnIzhFRDZGRic7XG4gICAgdmFyIGdyZCA9IGNvbnRleHQuY3JlYXRlTGluZWFyR3JhZGllbnQoY2FudmFzLndpZHRoIC8gMiwgMCwgY2FudmFzLndpZHRoIC8gMiwgY2FudmFzLmhlaWdodClcbiAgICBncmQuYWRkQ29sb3JTdG9wKDAsICcjMDAwJylcbiAgICBncmQuYWRkQ29sb3JTdG9wKDEsICcjNzc3JylcbiAgICBjb250ZXh0LmZpbGxTdHlsZSA9IGdyZDtcbiAgICAvLyBjb250ZXh0LmZpbGxTdHlsZSA9ICcjMzMzJztcbiAgICBjb250ZXh0LmZpbGwoKTtcbiAgICAvLyBjb250ZXh0LnN0cm9rZVN0eWxlID0gJ2JsdWUnO1xuICAgIC8vIGNvbnRleHQuc3Ryb2tlKCk7XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGNoZWNrQ29sbGlzaW9uO1xuXG5mdW5jdGlvbiBjaGVja0NvbGxpc2lvbihib2R5QSwgYm9keUIpIHtcbiAgICB2YXIgc3VwcG9ydEZuU3RhY2sgPSBbXTtcblxuICAgIC8qXG4gICAgICogZ2V0U3VwcG9ydEZuKCBib2R5QSwgYm9keUIgKSAtPiBGdW5jdGlvblxuICAgICAqIC0gYm9keUEgKE9iamVjdCk6IEZpcnN0IGJvZHlcbiAgICAgKiAtIGJvZHlCIChPYmplY3QpOiBTZWNvbmQgYm9keVxuICAgICAqICsgKEZ1bmN0aW9uKTogVGhlIHN1cHBvcnQgZnVuY3Rpb25cbiAgICAgKlxuICAgICAqIEdldCBhIGdlbmVyYWwgc3VwcG9ydCBmdW5jdGlvbiBmb3IgdXNlIHdpdGggR0pLIGFsZ29yaXRobVxuICAgICAqL1xuICAgIHZhciBnZXRTdXBwb3J0Rm4gPSBmdW5jdGlvbiBnZXRTdXBwb3J0Rm4oIGJvZHlBLCBib2R5QiApe1xuXG4gICAgICAgIHZhciBoYXNoID0gUGh5c2ljcy51dGlsLnBhaXJIYXNoKCBib2R5QS51aWQsIGJvZHlCLnVpZCApXG4gICAgICAgIHZhciBmbiA9IHN1cHBvcnRGblN0YWNrWyBoYXNoIF1cblxuICAgICAgICBpZiAoICFmbiApe1xuICAgICAgICAgICAgZm4gPSBzdXBwb3J0Rm5TdGFja1sgaGFzaCBdID0gZnVuY3Rpb24oIHNlYXJjaERpciApe1xuXG4gICAgICAgICAgICAgICAgdmFyIHNjcmF0Y2ggPSBQaHlzaWNzLnNjcmF0Y2hwYWQoKVxuICAgICAgICAgICAgICAgIHZhciB0QSA9IGZuLnRBXG4gICAgICAgICAgICAgICAgdmFyIHRCID0gZm4udEJcbiAgICAgICAgICAgICAgICB2YXIgdkEgPSBzY3JhdGNoLnZlY3RvcigpXG4gICAgICAgICAgICAgICAgdmFyIHZCID0gc2NyYXRjaC52ZWN0b3IoKVxuICAgICAgICAgICAgICAgIHZhciBtYXJnaW5BID0gZm4ubWFyZ2luQVxuICAgICAgICAgICAgICAgIHZhciBtYXJnaW5CID0gZm4ubWFyZ2luQlxuICAgICAgICAgICAgICAgIDtcblxuICAgICAgICAgICAgICAgIGlmICggZm4udXNlQ29yZSApe1xuICAgICAgICAgICAgICAgICAgICB2QSA9IGJvZHlBLmdlb21ldHJ5LmdldEZhcnRoZXN0Q29yZVBvaW50KCBzZWFyY2hEaXIucm90YXRlSW52KCB0QSApLCB2QSwgbWFyZ2luQSApLnRyYW5zZm9ybSggdEEgKTtcbiAgICAgICAgICAgICAgICAgICAgdkIgPSBib2R5Qi5nZW9tZXRyeS5nZXRGYXJ0aGVzdENvcmVQb2ludCggc2VhcmNoRGlyLnJvdGF0ZSggdEEgKS5yb3RhdGVJbnYoIHRCICkubmVnYXRlKCksIHZCLCBtYXJnaW5CICkudHJhbnNmb3JtKCB0QiApO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHZBID0gYm9keUEuZ2VvbWV0cnkuZ2V0RmFydGhlc3RIdWxsUG9pbnQoIHNlYXJjaERpci5yb3RhdGVJbnYoIHRBICksIHZBICkudHJhbnNmb3JtKCB0QSApO1xuICAgICAgICAgICAgICAgICAgICB2QiA9IGJvZHlCLmdlb21ldHJ5LmdldEZhcnRoZXN0SHVsbFBvaW50KCBzZWFyY2hEaXIucm90YXRlKCB0QSApLnJvdGF0ZUludiggdEIgKS5uZWdhdGUoKSwgdkIgKS50cmFuc2Zvcm0oIHRCICk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgc2VhcmNoRGlyLm5lZ2F0ZSgpLnJvdGF0ZSggdEIgKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiBzY3JhdGNoLmRvbmUoe1xuICAgICAgICAgICAgICAgICAgICBhOiB2QS52YWx1ZXMoKSxcbiAgICAgICAgICAgICAgICAgICAgYjogdkIudmFsdWVzKCksXG4gICAgICAgICAgICAgICAgICAgIHB0OiB2QS52c3ViKCB2QiApLnZhbHVlcygpXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBmbi50QSA9IFBoeXNpY3MudHJhbnNmb3JtKCk7XG4gICAgICAgICAgICBmbi50QiA9IFBoeXNpY3MudHJhbnNmb3JtKCk7XG4gICAgICAgIH1cblxuICAgICAgICBmbi51c2VDb3JlID0gZmFsc2U7XG4gICAgICAgIGZuLm1hcmdpbiA9IDA7XG4gICAgICAgIGZuLnRBLnNldFRyYW5zbGF0aW9uKCBib2R5QS5zdGF0ZS5wb3MgKS5zZXRSb3RhdGlvbiggYm9keUEuc3RhdGUuYW5ndWxhci5wb3MgKTtcbiAgICAgICAgZm4udEIuc2V0VHJhbnNsYXRpb24oIGJvZHlCLnN0YXRlLnBvcyApLnNldFJvdGF0aW9uKCBib2R5Qi5zdGF0ZS5hbmd1bGFyLnBvcyApO1xuICAgICAgICBmbi5ib2R5QSA9IGJvZHlBO1xuICAgICAgICBmbi5ib2R5QiA9IGJvZHlCO1xuXG4gICAgICAgIHJldHVybiBmbjtcbiAgICB9O1xuXG4gICAgLypcbiAgICAgKiBjaGVja0dKSyggYm9keUEsIGJvZHlCICkgLT4gT2JqZWN0XG4gICAgICogLSBib2R5QSAoT2JqZWN0KTogRmlyc3QgYm9keVxuICAgICAqIC0gYm9keUIgKE9iamVjdCk6IFNlY29uZCBib2R5XG4gICAgICogKyAoT2JqZWN0KTogQ29sbGlzaW9uIHJlc3VsdFxuICAgICAqXG4gICAgICogVXNlIEdKSyBhbGdvcml0aG0gdG8gY2hlY2sgYXJiaXRyYXJ5IGJvZGllcyBmb3IgY29sbGlzaW9uc1xuICAgICAqL1xuICAgIHZhciBjaGVja0dKSyA9IGZ1bmN0aW9uIGNoZWNrR0pLKCBib2R5QSwgYm9keUIgKXtcblxuICAgICAgICB2YXIgc2NyYXRjaCA9IFBoeXNpY3Muc2NyYXRjaHBhZCgpXG4gICAgICAgIHZhciBkID0gc2NyYXRjaC52ZWN0b3IoKVxuICAgICAgICB2YXIgdG1wID0gc2NyYXRjaC52ZWN0b3IoKVxuICAgICAgICAgICAgLG92ZXJsYXBcbiAgICAgICAgdmFyIHJlc3VsdFxuICAgICAgICB2YXIgc3VwcG9ydFxuICAgICAgICB2YXIgY29sbGlzaW9uID0gZmFsc2VcbiAgICAgICAgdmFyIGFhYmJBID0gYm9keUEuYWFiYigpXG4gICAgICAgICAgICAsZGltQSA9IE1hdGgubWluKCBhYWJiQS5odywgYWFiYkEuaGggKVxuICAgICAgICB2YXIgYWFiYkIgPSBib2R5Qi5hYWJiKClcbiAgICAgICAgdmFyIGRpbUIgPSBNYXRoLm1pbiggYWFiYkIuaHcsIGFhYmJCLmhoIClcbiAgICAgICAgO1xuXG4gICAgICAgIC8vIGp1c3QgY2hlY2sgdGhlIG92ZXJsYXAgZmlyc3RcbiAgICAgICAgc3VwcG9ydCA9IGdldFN1cHBvcnRGbiggYm9keUEsIGJvZHlCICk7XG4gICAgICAgIGQuY2xvbmUoIGJvZHlBLnN0YXRlLnBvcyApLnZzdWIoIGJvZHlCLnN0YXRlLnBvcyApO1xuICAgICAgICByZXN1bHQgPSBQaHlzaWNzLmdqayhzdXBwb3J0LCBkLCB0cnVlKTtcblxuICAgICAgICBpZiAoIHJlc3VsdC5vdmVybGFwICl7XG5cbiAgICAgICAgICAgIC8vIHRoZXJlIGlzIGEgY29sbGlzaW9uLiBsZXQncyBkbyBtb3JlIHdvcmsuXG4gICAgICAgICAgICBjb2xsaXNpb24gPSB7XG4gICAgICAgICAgICAgICAgYm9keUE6IGJvZHlBLFxuICAgICAgICAgICAgICAgIGJvZHlCOiBib2R5QlxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgLy8gZmlyc3QgZ2V0IHRoZSBtaW4gZGlzdGFuY2Ugb2YgYmV0d2VlbiBjb3JlIG9iamVjdHNcbiAgICAgICAgICAgIHN1cHBvcnQudXNlQ29yZSA9IHRydWU7XG4gICAgICAgICAgICBzdXBwb3J0Lm1hcmdpbkEgPSAwO1xuICAgICAgICAgICAgc3VwcG9ydC5tYXJnaW5CID0gMDtcblxuICAgICAgICAgICAgd2hpbGUgKCByZXN1bHQub3ZlcmxhcCAmJiAoc3VwcG9ydC5tYXJnaW5BIDwgZGltQSB8fCBzdXBwb3J0Lm1hcmdpbkIgPCBkaW1CKSApe1xuICAgICAgICAgICAgICAgIGlmICggc3VwcG9ydC5tYXJnaW5BIDwgZGltQSApe1xuICAgICAgICAgICAgICAgICAgICBzdXBwb3J0Lm1hcmdpbkEgKz0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKCBzdXBwb3J0Lm1hcmdpbkIgPCBkaW1CICl7XG4gICAgICAgICAgICAgICAgICAgIHN1cHBvcnQubWFyZ2luQiArPSAxO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IFBoeXNpY3MuZ2prKHN1cHBvcnQsIGQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIHJlc3VsdC5vdmVybGFwIHx8IHJlc3VsdC5tYXhJdGVyYXRpb25zUmVhY2hlZCApe1xuICAgICAgICAgICAgICAgIC8vIFRoaXMgaW1wbGVtZW50YXRpb24gY2FuJ3QgZGVhbCB3aXRoIGEgY29yZSBvdmVybGFwIHlldFxuICAgICAgICAgICAgICAgIHJldHVybiBzY3JhdGNoLmRvbmUoZmFsc2UpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBjYWxjIG92ZXJsYXBcbiAgICAgICAgICAgIG92ZXJsYXAgPSBNYXRoLm1heCgwLCAoc3VwcG9ydC5tYXJnaW5BICsgc3VwcG9ydC5tYXJnaW5CKSAtIHJlc3VsdC5kaXN0YW5jZSk7XG4gICAgICAgICAgICBjb2xsaXNpb24ub3ZlcmxhcCA9IG92ZXJsYXA7XG4gICAgICAgICAgICAvLyBAVE9ETzogZm9yIG5vdywganVzdCBsZXQgdGhlIG5vcm1hbCBiZSB0aGUgbXR2XG4gICAgICAgICAgICBjb2xsaXNpb24ubm9ybSA9IGQuY2xvbmUoIHJlc3VsdC5jbG9zZXN0LmIgKS52c3ViKCB0bXAuY2xvbmUoIHJlc3VsdC5jbG9zZXN0LmEgKSApLm5vcm1hbGl6ZSgpLnZhbHVlcygpO1xuICAgICAgICAgICAgY29sbGlzaW9uLm10diA9IGQubXVsdCggb3ZlcmxhcCApLnZhbHVlcygpO1xuICAgICAgICAgICAgLy8gZ2V0IGEgY29ycmVzcG9uZGluZyBodWxsIHBvaW50IGZvciBvbmUgb2YgdGhlIGNvcmUgcG9pbnRzLi4gcmVsYXRpdmUgdG8gYm9keSBBXG4gICAgICAgICAgICBjb2xsaXNpb24ucG9zID0gZC5jbG9uZSggY29sbGlzaW9uLm5vcm0gKS5tdWx0KCBzdXBwb3J0Lm1hcmdpbiApLnZhZGQoIHRtcC5jbG9uZSggcmVzdWx0LmNsb3Nlc3QuYSApICkudnN1YiggYm9keUEuc3RhdGUucG9zICkudmFsdWVzKCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gc2NyYXRjaC5kb25lKCBjb2xsaXNpb24gKTtcbiAgICB9O1xuXG4gICAgLypcbiAgICAgKiBjaGVja0NpcmNsZXMoIGJvZHlBLCBib2R5QiApIC0+IE9iamVjdFxuICAgICAqIC0gYm9keUEgKE9iamVjdCk6IEZpcnN0IGJvZHlcbiAgICAgKiAtIGJvZHlCIChPYmplY3QpOiBTZWNvbmQgYm9keVxuICAgICAqICsgKE9iamVjdCk6IENvbGxpc2lvbiByZXN1bHRcbiAgICAgKlxuICAgICAqIENoZWNrIHR3byBjaXJjbGVzIGZvciBjb2xsaXNpb25zLlxuICAgICAqL1xuICAgIHZhciBjaGVja0NpcmNsZXMgPSBmdW5jdGlvbiBjaGVja0NpcmNsZXMoIGJvZHlBLCBib2R5QiApe1xuXG4gICAgICAgIHZhciBzY3JhdGNoID0gUGh5c2ljcy5zY3JhdGNocGFkKClcbiAgICAgICAgdmFyIGQgPSBzY3JhdGNoLnZlY3RvcigpXG4gICAgICAgIHZhciB0bXAgPSBzY3JhdGNoLnZlY3RvcigpXG4gICAgICAgIHZhciBvdmVybGFwXG4gICAgICAgIHZhciBjb2xsaXNpb24gPSBmYWxzZVxuXG4gICAgICAgIGQuY2xvbmUoIGJvZHlCLnN0YXRlLnBvcyApLnZzdWIoIGJvZHlBLnN0YXRlLnBvcyApO1xuICAgICAgICBvdmVybGFwID0gZC5ub3JtKCkgLSAoYm9keUEuZ2VvbWV0cnkucmFkaXVzICsgYm9keUIuZ2VvbWV0cnkucmFkaXVzKTtcblxuICAgICAgICAvLyBobW0uLi4gdGhleSBvdmVybGFwIGV4YWN0bHkuLi4gY2hvb3NlIGEgZGlyZWN0aW9uXG4gICAgICAgIGlmICggZC5lcXVhbHMoIFBoeXNpY3MudmVjdG9yLnplcm8gKSApe1xuXG4gICAgICAgICAgICBkLnNldCggMSwgMCApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gaWYgKCBvdmVybGFwID4gMCApe1xuICAgICAgICAvLyAgICAgLy8gY2hlY2sgdGhlIGZ1dHVyZVxuICAgICAgICAvLyAgICAgZC52YWRkKCB0bXAuY2xvbmUoYm9keUIuc3RhdGUudmVsKS5tdWx0KCBkdCApICkudnN1YiggdG1wLmNsb25lKGJvZHlBLnN0YXRlLnZlbCkubXVsdCggZHQgKSApO1xuICAgICAgICAvLyAgICAgb3ZlcmxhcCA9IGQubm9ybSgpIC0gKGJvZHlBLmdlb21ldHJ5LnJhZGl1cyArIGJvZHlCLmdlb21ldHJ5LnJhZGl1cyk7XG4gICAgICAgIC8vIH1cblxuICAgICAgICBpZiAoIG92ZXJsYXAgPD0gMCApe1xuXG4gICAgICAgICAgICBjb2xsaXNpb24gPSB7XG4gICAgICAgICAgICAgICAgYm9keUE6IGJvZHlBLFxuICAgICAgICAgICAgICAgIGJvZHlCOiBib2R5QixcbiAgICAgICAgICAgICAgICBub3JtOiBkLm5vcm1hbGl6ZSgpLnZhbHVlcygpLFxuICAgICAgICAgICAgICAgIG10djogZC5tdWx0KCAtb3ZlcmxhcCApLnZhbHVlcygpLFxuICAgICAgICAgICAgICAgIHBvczogZC5ub3JtYWxpemUoKS5tdWx0KCBib2R5QS5nZW9tZXRyeS5yYWRpdXMgKS52YWx1ZXMoKSxcbiAgICAgICAgICAgICAgICBvdmVybGFwOiAtb3ZlcmxhcFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBzY3JhdGNoLmRvbmUoIGNvbGxpc2lvbiApO1xuICAgIH07XG5cbiAgICAvKlxuICAgICAqIGNoZWNrUGFpciggYm9keUEsIGJvZHlCICkgLT4gT2JqZWN0XG4gICAgICogLSBib2R5QSAoT2JqZWN0KTogRmlyc3QgYm9keVxuICAgICAqIC0gYm9keUIgKE9iamVjdCk6IFNlY29uZCBib2R5XG4gICAgICogKyAoT2JqZWN0KTogQ29sbGlzaW9uIHJlc3VsdFxuICAgICAqXG4gICAgICogQ2hlY2sgYSBwYWlyIGZvciBjb2xsaXNpb25zXG4gICAgICovXG4gICAgdmFyIGNoZWNrUGFpciA9IGZ1bmN0aW9uIGNoZWNrUGFpciggYm9keUEsIGJvZHlCICl7XG5cbiAgICAgICAgLy8gZmlsdGVyIG91dCBib2RpZXMgdGhhdCBkb24ndCBjb2xsaWRlIHdpdGggZWFjaCBvdGhlclxuICAgICAgICBpZiAoXG4gICAgICAgICAgICAoIGJvZHlBLnRyZWF0bWVudCA9PT0gJ3N0YXRpYycgfHwgYm9keUEudHJlYXRtZW50ID09PSAna2luZW1hdGljJyApICYmXG4gICAgICAgICAgICAgICAgKCBib2R5Qi50cmVhdG1lbnQgPT09ICdzdGF0aWMnIHx8IGJvZHlCLnRyZWF0bWVudCA9PT0gJ2tpbmVtYXRpYycgKVxuICAgICAgICApe1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCBib2R5QS5nZW9tZXRyeS5uYW1lID09PSAnY2lyY2xlJyAmJiBib2R5Qi5nZW9tZXRyeS5uYW1lID09PSAnY2lyY2xlJyApe1xuXG4gICAgICAgICAgICByZXR1cm4gY2hlY2tDaXJjbGVzKCBib2R5QSwgYm9keUIgKTtcblxuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICByZXR1cm4gY2hlY2tHSksoIGJvZHlBLCBib2R5QiApO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBjaGVja1BhaXIoYm9keUEsIGJvZHlCKVxufVxuXG4iLCIvKiogQGpzeCBSZWFjdC5ET00gKi9cblxudmFyIERhdGFDaGVja2VyID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnRGF0YUNoZWNrZXInLFxuICAgIHByb3BUeXBlczoge1xuICAgICAgICBpbml0aWFsVGV4dDogUmVhY3QuUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICAgICAgICBpbml0aWFsSHlwb3RoZXNpczogUmVhY3QuUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICAgICAgICBwb3NzaWJsZUh5cG90aGVzZXM6IFJlYWN0LlByb3BUeXBlcy5hcnJheU9mKFJlYWN0LlByb3BUeXBlcy5zaGFwZSh7XG4gICAgICAgICAgICBuYW1lOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gICAgICAgICAgICBidXR0b25UZXh0OiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsIC8vIHRoZSB0ZXh0IG9uIHRoZSBidXR0b24gdG8gY2hhbmdlIHlvdXIgaHlwb3RoZXNpc1xuICAgICAgICAgICAgdGV4dDogUmVhY3QuUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLCAvLyBcIllvdXIgaHlwb3RoZXNpcyB3YXMgPHRleHQ+LlwiXG4gICAgICAgIH0pKS5pc1JlcXVpcmVkLFxuICAgICAgICByZXN1bHQ6IFJlYWN0LlByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsIC8vIHRha2VzIGluIHRoZSBjdXJyZW50IHN0YXRlIGFuZCByZXR1cm5zIGFuIGVycm9yIHN0cmluZyBmb3IgZnJhbmNpcyB0byBzYXksIG9yIG51bGwgaWYgdGhlcmUgYXJlIG5vIHByb2JsZW1zIHdpdGggdGhlIGV4cGVyaW1lbnQuXG4gICAgICAgIG5leHRVUkw6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsIC8vIHRoZSB1cmwgb2YgdGhlIG5leHQgdGhpbmcuXG4gICAgfSxcblxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdGhpc1Jlc3VsdDogdGhpcy5wcm9wcy5pbml0aWFsVGV4dCxcbiAgICAgICAgICAgIHByZXZSZXN1bHQ6ICcnLFxuICAgICAgICAgICAgaHlwb3RoZXNpczogdGhpcy5wcm9wcy5pbml0aWFsSHlwb3RoZXNpcywgLy8gYSBoeXBvdGhlc2lzLm5hbWVcbiAgICAgICAgICAgIGRpc3Byb3ZlbjogZmFsc2UsXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIHJlbmRlckh5cG90aGVzaXM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGh5cFRleHQgPSBfLmZpbmRXaGVyZShcbiAgICAgICAgICAgIHRoaXMucHJvcHMucG9zc2libGVIeXBvdGhlc2VzLFxuICAgICAgICAgICAge25hbWU6IHRoaXMuc3RhdGUuaHlwb3RoZXNpc30pLnRleHRcbiAgICAgICAgcmV0dXJuIFJlYWN0LkRPTS5wKHtjbGFzc05hbWU6IFwiY2hlY2tlcl95b3VyLWh5cG9cIn0sIFxuICAgICAgICAgICAgUmVhY3QuRE9NLmVtKG51bGwsIFwiWW91ciBoeXBvdGhlc2lzIGlzIFwiLCBoeXBUZXh0LCBcIi5cIilcbiAgICAgICAgKVxuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuZGlzcHJvdmVuKSB7XG4gICAgICAgICAgICB2YXIgYnV0dG9ucyA9IF8ubWFwKFxuICAgICAgICAgICAgICAgIF8uZmlsdGVyKFxuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLnBvc3NpYmxlSHlwb3RoZXNlcyxcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKGh5cCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICh0aGlzLnN0YXRlLmh5cG90aGVzaXMgIT09IGh5cC5uYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpKSxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiAoaHlwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBSZWFjdC5ET00uYnV0dG9uKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBrZXk6IGh5cC5uYW1lLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU6IFwiYnRuIGJ0bi1kZWZhdWx0XCIsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jaGFuZ2VIeXBvdGhlc2lzKGh5cC5uYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKX0sIFxuICAgICAgICAgICAgICAgICAgICAgICAgaHlwLmJ1dHRvblRleHRcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgICAgICAgICByZXR1cm4gUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImNoZWNrZXJcIn0sIFxuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVySHlwb3RoZXNpcygpLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uaW1nKHtzcmM6IFwiaW1hZ2VzL3Npci1mcmFuY2lzLmpwZWdcIiwgY2xhc3NOYW1lOiBcImNoZWNrZXJfZnJhbmNpc1wifSksIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJjaGVja2VyX21haW5cIn0sIFxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5ET00ucChudWxsLCBcIk9rYXksIHdoaWNoIHJlc3VsdCBkbyB0aGV5IHN1cHBvcnQ/XCIpLCBcbiAgICAgICAgICAgICAgICAgICAgYnV0dG9uc1xuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS50aGlzUmVzdWx0KSB7XG4gICAgICAgICAgICByZXR1cm4gUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImNoZWNrZXJcIn0sIFxuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVySHlwb3RoZXNpcygpLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uaW1nKHtzcmM6IFwiaW1hZ2VzL3Npci1mcmFuY2lzLmpwZWdcIiwgY2xhc3NOYW1lOiBcImNoZWNrZXJfZnJhbmNpc1wifSksIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJjaGVja2VyX21haW5cIn0sIFxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5ET00ucChudWxsLCB0aGlzLnN0YXRlLnRoaXNSZXN1bHQpLCBcbiAgICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLmJ1dHRvbih7Y2xhc3NOYW1lOiBcImJ0biBidG4tZGVmYXVsdFwiLCBvbkNsaWNrOiB0aGlzLnN1cHBvcnR9LCBcIlRoZSBkYXRhIHN1cHBvcnQgbXkgaHlwb3RoZXNpcy5cIiksIFxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5ET00uYnV0dG9uKHtjbGFzc05hbWU6IFwiYnRuIGJ0bi1kZWZhdWx0XCIsIG9uQ2xpY2s6IHRoaXMuZGlzcHJvdmV9LCBcIlRoZSBkYXRhIGRpc3Byb3ZlIG15IGh5cG90aGVzaXMuXCIpXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLm5leHRVUkwpIHtcbiAgICAgICAgICAgICAgICB2YXIgY29udGludWVyID0gUmVhY3QuRE9NLmEoe2NsYXNzTmFtZTogXCJidG4gYnRuLWRlZmF1bHRcIiwgaHJlZjogdGhpcy5wcm9wcy5uZXh0VVJMfSwgXCJUaGFua3MhICBXaGF0J3MgbmV4dD9cIik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHZhciBjb250aW51ZXIgPSBSZWFjdC5ET00uc3BhbihudWxsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwiY2hlY2tlclwifSwgXG4gICAgICAgICAgICAgICAgdGhpcy5yZW5kZXJIeXBvdGhlc2lzKCksIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5pbWcoe3NyYzogXCJpbWFnZXMvc2lyLWZyYW5jaXMuanBlZ1wiLCBjbGFzc05hbWU6IFwiY2hlY2tlcl9mcmFuY2lzXCJ9KSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImNoZWNrZXJfbWFpblwifSwgXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5wKG51bGwsIFwiWW91ciBleHBlcmltZW50IGxvb2tzIGdyZWF0LCBhbmQgSSdtIGNvbnZpbmNlZC4gIEhlcmUsIGhhdmUgc29tZSBiYWNvbi5cIiksIFxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZXIsIFwiO1wiXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBzdXBwb3J0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuYXNrRnJhbmNpcygpO1xuICAgIH0sXG5cbiAgICBkaXNwcm92ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGRpc3Byb3ZlbjogdHJ1ZSxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGNoYW5nZUh5cG90aGVzaXM6IGZ1bmN0aW9uIChoeXApIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBkaXNwcm92ZW46IGZhbHNlLFxuICAgICAgICAgICAgaHlwb3RoZXNpczogaHlwLFxuICAgICAgICB9LCB0aGlzLmFza0ZyYW5jaXMpO1xuICAgIH0sXG5cbiAgICBhc2tGcmFuY2lzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgdGhpc1Jlc3VsdDogdGhpcy5wcm9wcy5yZXN1bHQodGhpcy5zdGF0ZSksXG4gICAgICAgICAgICBwcmV2UmVzdWx0OiB0aGlzLnN0YXRlLnRoaXNSZXN1bHRcbiAgICAgICAgfSk7XG4gICAgfVxufSlcblxubW9kdWxlLmV4cG9ydHMgPSBEYXRhQ2hlY2tlcjtcbiIsInZhciBHcmFwaCA9IHJlcXVpcmUoJy4vZ3JhcGgnKVxudmFyIEdhdGUgPSByZXF1aXJlKCcuL2dhdGUnKTtcbnZhciBCYXNlID0gcmVxdWlyZSgnLi9iYXNlJyk7XG52YXIgU3RvcHdhdGNoID0gcmVxdWlyZSgnLi9zdG9wd2F0Y2gnKTtcbnZhciBQbGF5UGF1c2UgPSByZXF1aXJlKCcuL3BsYXlwYXVzZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2UuZXh0ZW5kKGZ1bmN0aW9uIERlbW8oY29udGFpbmVyLCBvcHRpb25zKSB7XG4gICAgQmFzZS5jYWxsKHRoaXMsIGNvbnRhaW5lciwgb3B0aW9ucywgJ2ltYWdlcy9sYWJfYmFja2dyb3VuZC5qcGcnKVxufSwge1xuICAgIGRyb3BJbkJvZHk6IGZ1bmN0aW9uIChyYWRpdXMsIHksIGNvbG9yKSB7XG4gICAgICAgIGZ1bmN0aW9uIHJhbmRvbShtaW4sIG1heCl7XG4gICAgICAgICAgICByZXR1cm4gKE1hdGgucmFuZG9tKCkgKiAobWF4LW1pbikgKyBtaW4pfDBcbiAgICAgICAgfVxuICAgICAgICB2YXIgYm9keSA9IFBoeXNpY3MuYm9keSgnY2lyY2xlJywge1xuICAgICAgICAgICAgeDogMTAwLFxuICAgICAgICAgICAgeTogeSxcbiAgICAgICAgICAgIHZ4OiByYW5kb20oLTUsIDUpLzEwMCxcbiAgICAgICAgICAgIHJhZGl1czogcmFkaXVzLFxuICAgICAgICAgICAgbWFzczogOTAwLFxuICAgICAgICAgICAgcmVzdGl0dXRpb246IDAuOSxcbiAgICAgICAgICAgIHN0eWxlczoge1xuICAgICAgICAgICAgICAgIGltYWdlOiBcImltYWdlcy90ZW5uaXNfYmFsbC5wbmdcIlxuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuXG4gICAgICAgIHRoaXMud29ybGQuYWRkKGJvZHkpO1xuICAgICAgICByZXR1cm4gYm9keTtcbiAgICB9LFxuICAgIHNldHVwOiBmdW5jdGlvbiAoY29udGFpbmVyKSB7XG4gICAgICAgIHZhciB3b3JsZCA9IHRoaXMud29ybGRcbiAgICAgICAgd29ybGQuYWRkKFBoeXNpY3MuYmVoYXZpb3IoJ2NvbnN0YW50LWFjY2VsZXJhdGlvbicpKTtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDU7IGkrKykge1xuICAgICAgICAgICAgdmFyIHJhZGl1cyA9IDIwICsgMTAgKiBpO1xuICAgICAgICAgICAgdGhpcy5kcm9wSW5Cb2R5KHJhZGl1cywgMzAwIC0gaSAqIDUwKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgY2lyY2xlID0gdGhpcy5kcm9wSW5Cb2R5KDQwLCAzMDAgKyAyMCwgJ3JlZCcpXG4gICAgICAgIHZhciBncmFwaCA9IG5ldyBHcmFwaCh0aGlzLmNvbnRhaW5lciwge1xuICAgICAgICAgICAgJ0NpcmNsZSc6IHtib2R5OiBjaXJjbGUsIGF0dHI6ICdwb3MueScsIHRpdGxlOidWZXJ0aWNhbCBQb3NpdGlvbicsIG1pbnNjYWxlOiA1fSxcbiAgICAgICAgICAgICdWZWxZJzoge2JvZHk6IGNpcmNsZSwgYXR0cjogJ3ZlbC55JywgdGl0bGU6J1ZlcnRpY2FsIFZlbG9jaXR5JywgbWluc2NhbGU6IC4xfSxcbiAgICAgICAgICAgICdBbmdQJzoge2JvZHk6IGNpcmNsZSwgYXR0cjogJ2FuZ3VsYXIucG9zJywgdGl0bGU6J1JvdGF0aW9uJywgbWluc2NhbGU6IC4wMDF9LFxuICAgICAgICAgICAgJ0FuZ1YnOiB7Ym9keTogY2lyY2xlLCBhdHRyOiAnYW5ndWxhci52ZWwnLCB0aXRsZTonUm90YXRpb25hbCBWZWxvY2l0eScsIG1pbnNjYWxlOiAuMDAxfSxcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgdG9wOiAxMCxcbiAgICAgICAgICAgIGxlZnQ6IHRoaXMub3B0aW9ucy53aWR0aCAtIDQwMCxcbiAgICAgICAgICAgIHdpZHRoOiA0MDAsXG4gICAgICAgICAgICB3b3JsZEhlaWdodDogdGhpcy5vcHRpb25zLmhlaWdodFxuICAgICAgICB9KVxuICAgICAgICB0aGlzLmdyYXBoID0gZ3JhcGhcblxuICAgICAgICB0aGlzLndvcmxkLm9uKCdzdGVwJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZ3JhcGgudXBkYXRlKHdvcmxkLnRpbWVzdGVwKCkpXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMud29ybGQuYWRkKFBoeXNpY3MuYm9keSgncmVjdGFuZ2xlJywge1xuICAgICAgICAgICAgeDogMjUwLFxuICAgICAgICAgICAgeTogNjAwLFxuICAgICAgICAgICAgd2lkdGg6IDUwLFxuICAgICAgICAgICAgaGVpZ2h0OiA0MDAsXG4gICAgICAgICAgICB0cmVhdG1lbnQ6ICdzdGF0aWMnLFxuICAgICAgICAgICAgc3R5bGVzOiB7XG4gICAgICAgICAgICAgICAgZmlsbFN0eWxlOiAnI2QzMzY4MicsXG4gICAgICAgICAgICAgICAgYW5nbGVJbmRpY2F0b3I6ICcjNzUxYjRiJ1xuICAgICAgICAgICAgfVxuICAgICAgICB9KSlcblxuICAgICAgICB2YXIgYnV0dG9uQ29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGJ1dHRvbkNvbnRhaW5lcik7XG4gICAgICAgIHZhciBwbGF5UGF1c2UgPSBuZXcgUGxheVBhdXNlKHdvcmxkLCBidXR0b25Db250YWluZXIpO1xuICAgICAgICBnYXRlUG9seWdvbiA9IFt7eDogMCwgeTogMzAwfSwge3g6IDcwMCwgeTogMzAwfSwge3g6IDcwMCwgeTogNDAwfSwge3g6IDAsIHk6IDQwMH1dO1xuICAgICAgICB2YXIgZ2F0ZSA9IG5ldyBHYXRlKHdvcmxkLCBnYXRlUG9seWdvbiwgWzM1MCwgNzAwXSwgbnVsbCwge2RlYnVnOiB0cnVlLCBzaG93OiB0cnVlfSk7XG4gICAgICAgIGdhdGUub24oJ2VudGVyJywgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgZ2F0ZS5zdG9wd2F0Y2hlcyA9IGdhdGUuc3RvcHdhdGNoZXMgfHwge31cbiAgICAgICAgICAgIHZhciBzdG9wd2F0Y2ggPSBuZXcgU3RvcHdhdGNoKHdvcmxkLCBidXR0b25Db250YWluZXIsIDEpO1xuICAgICAgICAgICAgc3RvcHdhdGNoLnJlc2V0KCk7XG4gICAgICAgICAgICBzdG9wd2F0Y2guc3RhcnQoKTtcbiAgICAgICAgICAgIGdhdGUuc3RvcHdhdGNoZXNbZGF0YS5ib2R5LnVpZF0gPSBzdG9wd2F0Y2g7XG4gICAgICAgIH0pO1xuICAgICAgICBnYXRlLm9uKCdleGl0JywgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgZ2F0ZS5zdG9wd2F0Y2hlc1tkYXRhLmJvZHkudWlkXS5zdG9wKClcbiAgICAgICAgfSk7XG4gICAgfVxufSk7XG5cbiIsInZhciBCYXNlID0gcmVxdWlyZSgnLi9iYXNlJyk7XG52YXIgR2F0ZSA9IHJlcXVpcmUoJy4vZ2F0ZScpO1xudmFyIFN0b3B3YXRjaCA9IHJlcXVpcmUoJy4vc3RvcHdhdGNoJyk7XG52YXIgTG9nQm9vayA9IHJlcXVpcmUoJy4vbG9nYm9vaycpO1xudmFyIFBsYXlQYXVzZSA9IHJlcXVpcmUoJy4vcGxheXBhdXNlJyk7XG52YXIgRHJvcEludHJvID0gcmVxdWlyZSgnLi9pbnRyby9kcm9wX2ludHJvLmpzeCcpO1xudmFyIGRyb3BEYXRhQ2hlY2tlciA9IHJlcXVpcmUoJy4vZHJvcGRhdGFjaGVja2VyJyk7XG52YXIgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xuXG5mdW5jdGlvbiByYW5kb20obWluLCBtYXgpe1xuICAgIHJldHVybiAoTWF0aC5yYW5kb20oKSAqIChtYXgtbWluKSArIG1pbil8MFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2UuZXh0ZW5kKGZ1bmN0aW9uIERyb3AoY29udGFpbmVyLCBvcHRpb25zKSB7XG4gICAgQmFzZS5jYWxsKHRoaXMsIGNvbnRhaW5lciwgb3B0aW9ucywgXCJpbWFnZXMvYmx1ZV9sYWIuanBnXCIpXG59LCB7XG4gICAgZHJvcEJvd2xpbmdCYWxsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHJhZGl1cyA9IDMwO1xuICAgICAgICB0aGlzLndvcmxkLmFkZChQaHlzaWNzLmJvZHkoJ2NpcmNsZScsIHtcbiAgICAgICAgICAgIHg6IDcwMCxcbiAgICAgICAgICAgIHk6IDIwMCxcbiAgICAgICAgICAgIHZ4OiByYW5kb20oLTMwLCAzMCkvMTAwLFxuICAgICAgICAgICAgcmFkaXVzOiByYWRpdXMsXG4gICAgICAgICAgICBtYXNzOiA5MDAsXG4gICAgICAgICAgICByZXN0aXR1dGlvbjogMC4wMSxcbiAgICAgICAgICAgIGNvZjogMC40LFxuICAgICAgICAgICAgc3R5bGVzOiB7XG4gICAgICAgICAgICAgICAgaW1hZ2U6IFwiaW1hZ2VzL2Jvd2xpbmdfYmFsbC5wbmdcIlxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGRpc3BsYXlOYW1lOiAnQm93bGluZyBCYWxsJyxcbiAgICAgICAgfSkpO1xuICAgIH0sXG5cbiAgICBkcm9wVGVubmlzQmFsbDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciByYWRpdXMgPSAxNTtcbiAgICAgICAgdmFyIGJhbGwgPSBQaHlzaWNzLmJvZHkoJ2NpcmNsZScsIHtcbiAgICAgICAgICAgIHg6IDcwMCxcbiAgICAgICAgICAgIHk6IDIwMCxcbiAgICAgICAgICAgIHZ4OiByYW5kb20oLTMwLCAzMCkvMTAwLFxuICAgICAgICAgICAgcmFkaXVzOiByYWRpdXMsXG4gICAgICAgICAgICBtYXNzOiA3LjUsXG4gICAgICAgICAgICByZXN0aXR1dGlvbjogMSxcbiAgICAgICAgICAgIGRpc3BsYXlOYW1lOiAnVGVubmlzIEJhbGwnLFxuICAgICAgICAgICAgc3R5bGVzOiB7XG4gICAgICAgICAgICAgICAgaW1hZ2U6IFwiaW1hZ2VzL3Rlbm5pc19iYWxsLnBuZ1wiXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG5cbiAgICAgICAgaWYgKCF0aGlzLmZpcnN0VGVubmlzQmFsbCkge1xuICAgICAgICAgICAgdGhpcy5maXJzdFRlbm5pc0JhbGwgPSBiYWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy53b3JsZC5hZGQoYmFsbCk7XG4gICAgfSxcblxuICAgIGRlcGxveUJhbGxzOiBmdW5jdGlvbihvbkRvbmUpIHtcbiAgICAgICAgdmFyIGRlYnVnID0gdGhpcy5vcHRpb25zLmRlYnVnID09PSAndHJ1ZSc7XG4gICAgICAgIHZhciBzcGFjaW5nX21zID0gZGVidWcgPyA0MDAgOiA4MDA7XG4gICAgICAgIHZhciBxdWV1ZSA9IFtcbiAgICAgICAgICAgIHRoaXMuZHJvcFRlbm5pc0JhbGwuYmluZCh0aGlzKSxcbiAgICAgICAgICAgIHRoaXMuZHJvcFRlbm5pc0JhbGwuYmluZCh0aGlzKSxcbiAgICAgICAgICAgIHRoaXMuZHJvcEJvd2xpbmdCYWxsLmJpbmQodGhpcyksXG4gICAgICAgICAgICB0aGlzLmRyb3BUZW5uaXNCYWxsLmJpbmQodGhpcyksXG4gICAgICAgICAgICB0aGlzLmRyb3BUZW5uaXNCYWxsLmJpbmQodGhpcyksXG4gICAgICAgICAgICB0aGlzLmRyb3BCb3dsaW5nQmFsbC5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgb25Eb25lXG4gICAgICAgIF07XG4gICAgICAgIF8ucmVkdWNlKHF1ZXVlLCBmdW5jdGlvbih0LCBhY3Rpb24pIHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoYWN0aW9uLCB0KVxuICAgICAgICAgICAgcmV0dXJuIHQgKyBzcGFjaW5nX21zXG4gICAgICAgIH0sIDApXG5cbiAgICAgICAgLy8gc2V0VGltZW91dCh0aGlzLmRyb3BUZW5uaXNCYWxsLmJpbmQodGhpcyksIDApXG4gICAgICAgIC8vIHNldFRpbWVvdXQodGhpcy5kcm9wVGVubmlzQmFsbC5iaW5kKHRoaXMpLCAxMDApXG4gICAgICAgIC8vIHNldFRpbWVvdXQodGhpcy5kcm9wVGVubmlzQmFsbC5iaW5kKHRoaXMpLCAyMDApXG4gICAgfSxcblxuICAgIHN0YXJ0V2Fsa3Rocm91Z2g6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgRHJvcEludHJvKHRoaXMsIGZ1bmN0aW9uIChoeXBvdGhlc2lzKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnR290IHRoZSBoeXBvdGhlc2lzISEnLCBoeXBvdGhlc2lzKTtcbiAgICAgICAgICAgIHRoaXMuc2V0dXBEYXRhQ2hlY2tlcihoeXBvdGhlc2lzKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpLCB0aGlzLm9wdGlvbnMuZGVidWcgPT09ICd0cnVlJylcbiAgICB9LFxuXG4gICAgc2V0dXBEYXRhQ2hlY2tlcjogZnVuY3Rpb24gKGh5cG90aGVzaXMpIHtcbiAgICAgICAgdmFyIGRhdGFDaGVja2VyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgZGF0YUNoZWNrZXIuY2xhc3NOYW1lID0gXCJkcm9wLWRhdGEtY2hlY2tlclwiO1xuICAgICAgICB0aGlzLnNpZGVCYXIuYXBwZW5kQ2hpbGQoZGF0YUNoZWNrZXIpO1xuICAgICAgICBkcm9wRGF0YUNoZWNrZXIoZGF0YUNoZWNrZXIsIHRoaXMubG9nQm9vaywgaHlwb3RoZXNpcyk7XG4gICAgfSxcblxuICAgIHNldHVwOiBmdW5jdGlvbiAoY29udGFpbmVyKSB7XG4gICAgICAgIHZhciB3b3JsZCA9IHRoaXMud29ybGRcbiAgICAgICAgdmFyIGdyYXZpdHkgPSBQaHlzaWNzLmJlaGF2aW9yKCdjb25zdGFudC1hY2NlbGVyYXRpb24nKVxuICAgICAgICBncmF2aXR5LnNldEFjY2VsZXJhdGlvbih7eDogMCwgeTouMDAwM30pO1xuICAgICAgICB3b3JsZC5hZGQoZ3Jhdml0eSk7XG5cbiAgICAgICAgLy8gU2h1bnQgdHJpYW5nbGVcbiAgICAgICAgdGhpcy53b3JsZC5hZGQoUGh5c2ljcy5ib2R5KCdyZWN0YW5nbGUnLCB7XG4gICAgICAgICAgICB4OiA2MCxcbiAgICAgICAgICAgIHk6IDY5MCxcbiAgICAgICAgICAgIHdpZHRoOiA1MDAsXG4gICAgICAgICAgICBoZWlnaHQ6IDEwMCxcbiAgICAgICAgICAgIGFuZ2xlOiBNYXRoLlBJIC8gNCxcbiAgICAgICAgICAgIHRyZWF0bWVudDogJ3N0YXRpYycsXG4gICAgICAgICAgICBjb2Y6IDEsXG4gICAgICAgICAgICBzdHlsZXM6IHtcbiAgICAgICAgICAgICAgICBmaWxsU3R5bGU6ICcjZDMzNjgyJyxcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkpO1xuXG4gICAgICAgIHZhciBzaWRlQmFyID0gdGhpcy5zaWRlQmFyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgc2lkZUJhci5jbGFzc05hbWUgPSBcInNpZGUtYmFyXCI7XG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChzaWRlQmFyKTtcbiAgICAgICAgdmFyIHRvcEdhdGUgPSBuZXcgR2F0ZSh3b3JsZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1dGlsLm1ha2VSZWN0KDAsIDAsIDIwMCwgMTApLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFsxMjAsIDIwMF0sIG51bGwsIHtkZWJ1ZzogdHJ1ZSwgc2hvdzogdHJ1ZSwgY29sb3I6ICdncmVlbid9KTtcbiAgICAgICAgdmFyIGJvdHRvbUdhdGUgPSBuZXcgR2F0ZSh3b3JsZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1dGlsLm1ha2VSZWN0KDAsIDAsIDIwMCwgMTApLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFsxMjAsIDU1MF0sIG51bGwsIHtkZWJ1ZzogdHJ1ZSwgc2hvdzogdHJ1ZSwgY29sb3I6ICdyZWQnfSk7XG4gICAgICAgIHZhciBsb2dDb2x1bW5zID0gW1xuICAgICAgICAgICAge25hbWU6IFwiQm93bGluZyBCYWxsXCIsIGV4dHJhVGV4dDogXCIgKDcga2cpXCJ9LFxuICAgICAgICAgICAge25hbWU6IFwiVGVubmlzIEJhbGxcIiwgZXh0cmFUZXh0OiBcIiAoNTggZylcIiwgY29sb3I6ICdyZ2IoMTU0LCAyNDEsIDApJ31cbiAgICAgICAgXTtcbiAgICAgICAgdmFyIGxvZ0Jvb2sgPSB0aGlzLmxvZ0Jvb2sgPSBuZXcgTG9nQm9vayh3b3JsZCwgc2lkZUJhciwgNSwgbG9nQ29sdW1ucyk7XG4gICAgICAgIHRvcEdhdGUub24oJ2VudGVyJywgZnVuY3Rpb24oZWxlbSkge1xuICAgICAgICAgICAgdmFyIGNvbE5hbWUgPSBlbGVtLmJvZHkuZGlzcGxheU5hbWUgfHwgZWxlbS5ib2R5Lm5hbWUgfHwgXCJib2R5XCI7XG4gICAgICAgICAgICBsb2dCb29rLmhhbmRsZVN0YXJ0KGNvbE5hbWUsIGVsZW0uYm9keS51aWQpO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICBib3R0b21HYXRlLm9uKCdlbnRlcicsIGZ1bmN0aW9uKGVsZW0pIHtcbiAgICAgICAgICAgIHZhciBjb2xOYW1lID0gZWxlbS5ib2R5LmRpc3BsYXlOYW1lIHx8IGVsZW0uYm9keS5uYW1lIHx8IFwiYm9keVwiO1xuICAgICAgICAgICAgbG9nQm9vay5oYW5kbGVFbmQoY29sTmFtZSwgZWxlbS5ib2R5LnVpZCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHZhciBidXR0b25Db250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICB2YXIgcGxheVBhdXNlID0gbmV3IFBsYXlQYXVzZSh3b3JsZCwgYnV0dG9uQ29udGFpbmVyKTtcbiAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGJ1dHRvbkNvbnRhaW5lcik7XG5cbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy53YWxrKSB7XG4gICAgICAgICAgICB0aGlzLnN0YXJ0V2Fsa3Rocm91Z2goKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gQWRkIHRoZSBiYWxscy5cbiAgICAgICAgICAgIHNldFRpbWVvdXQodGhpcy5kZXBsb3lCYWxscy5iaW5kKHRoaXMpLCA1MDApXG4gICAgICAgICAgICB0aGlzLnNldHVwRGF0YUNoZWNrZXIoJ3NhbWUnKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBQaWNrIHVwIG9uZSBvZiB0aGUgdGVubmlzIGJhbGxzIGFuZCBkcm9wIGl0LlxuICAgICAqXG4gICAgICogQHBhcmFtIGNhbGxiYWNrIEdldHMgY2FsbGVkIHdoZW4gdGhlIGRlbW9uc3RyYXRpb24gaXMgb3Zlci5cbiAgICAgKi9cbiAgICBkZW1vbnN0cmF0ZURyb3A6IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBiYWxsID0gdGhpcy5maXJzdFRlbm5pc0JhbGw7XG4gICAgICAgIHZhciB0YXJnZXRYID0gMTI1O1xuICAgICAgICB2YXIgdGFyZ2V0WSA9IDE3MDtcblxuICAgICAgICBiYWxsLnRyZWF0bWVudCA9ICdraW5lbWF0aWMnO1xuICAgICAgICBiYWxsLnN0YXRlLnZlbC54ID0gKHRhcmdldFggLSBiYWxsLnN0YXRlLnBvcy54KSAvIDE1MDA7XG4gICAgICAgIGJhbGwuc3RhdGUudmVsLnkgPSAodGFyZ2V0WSAtIGJhbGwuc3RhdGUucG9zLnkpIC8gMTUwMDtcbiAgICAgICAgYmFsbC5yZWNhbGMoKTtcblxuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgYmFsbC50cmVhdG1lbnQgPSAnc3RhdGljJztcbiAgICAgICAgICAgIGJhbGwuc3RhdGUucG9zLnggPSB0YXJnZXRYO1xuICAgICAgICAgICAgYmFsbC5zdGF0ZS5wb3MueSA9IHRhcmdldFk7XG4gICAgICAgICAgICBiYWxsLnN0YXRlLnZlbC54ID0gMDtcbiAgICAgICAgICAgIGJhbGwuc3RhdGUudmVsLnkgPSAwO1xuICAgICAgICAgICAgYmFsbC5yZWNhbGMoKTtcblxuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBiYWxsLnRyZWF0bWVudCA9ICdkeW5hbWljJztcbiAgICAgICAgICAgICAgICBiYWxsLnJlY2FsYygpO1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICAgICAgfSwgMzAwMClcbiAgICAgICAgICAgIH0sIDE1MDApXG4gICAgICAgIH0sIDE1MDApXG4gICAgfVxufSk7XG4iLCJ2YXIgRGF0YUNoZWNrZXIgPSByZXF1aXJlKCcuL2RhdGFjaGVja2VyLmpzeCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRyb3BEYXRhQ2hlY2tlcjtcblxudmFyIF9pbml0aWFsVGV4dCA9IFwiRG8gYW4gZXhwZXJpbWVudCB0byBzZWUgaWYgeW91IGNhbiBmaWd1cmUgb3V0IHdoaWNoIGJhbGwgZmFsbHMgZmFzdGVyLCBhbmQgbGV0IG1lIGtub3cgd2hlbiB5b3UncmUgZG9uZSFcIjtcblxudmFyIF9uZXh0VVJMID0gXCI/TmV3dG9uMSZ3YWxrPXRydWVcIjtcblxudmFyIF9oeXBvdGhlc2VzID0gW1xuICAgIHtcbiAgICAgICAgbmFtZTogXCJib3dsaW5nXCIsXG4gICAgICAgIGJ1dHRvblRleHQ6IFwiVGhlIGJvd2xpbmcgYmFsbCBmYWxscyBmYXN0ZXIuXCIsXG4gICAgICAgIHRleHQ6IFwidGhhdCB0aGUgYm93bGluZyBiYWxsIHdpbGwgZmFsbCBmYXN0ZXJcIixcbiAgICB9LFxuICAgIHtcbiAgICAgICAgbmFtZTogXCJ0ZW5uaXNcIixcbiAgICAgICAgYnV0dG9uVGV4dDogXCJUaGUgdGVubmlzIGJhbGwgZmFsbHMgZmFzdGVyLlwiLFxuICAgICAgICB0ZXh0OiBcInRoYXQgdGhlIHRlbm5pcyBiYWxsIHdpbGwgZmFsbCBmYXN0ZXJcIixcbiAgICB9LFxuICAgIHtcbiAgICAgICAgbmFtZTogXCJzYW1lXCIsXG4gICAgICAgIGJ1dHRvblRleHQ6IFwiQm90aCBiYWxscyBmYWxsIGF0IHRoZSBzYW1lIHJhdGUuXCIsXG4gICAgICAgIHRleHQ6IFwidGhhdCBib3RoIGJhbGxzIHdpbGwgZmFsbCBhdCB0aGUgc2FtZSByYXRlXCIsXG4gICAgfSxcbl07XG4gICAgXG5cbmZ1bmN0aW9uIGRyb3BEYXRhQ2hlY2tlcihjb250YWluZXIsIGxvZ0Jvb2ssIGh5cG90aGVzaXMpIHtcbiAgICByZXR1cm4gUmVhY3QucmVuZGVyQ29tcG9uZW50KERhdGFDaGVja2VyKHtcbiAgICAgICAgaW5pdGlhbFRleHQ6IF9pbml0aWFsVGV4dCxcbiAgICAgICAgaW5pdGlhbEh5cG90aGVzaXM6IGh5cG90aGVzaXMsXG4gICAgICAgIHBvc3NpYmxlSHlwb3RoZXNlczogX2h5cG90aGVzZXMsXG4gICAgICAgIHJlc3VsdDogZnVuY3Rpb24gKHN0YXRlKSB7cmV0dXJuIF9yZXN1bHQobG9nQm9vaywgc3RhdGUpO30sXG4gICAgICAgIG5leHRVUkw6IF9uZXh0VVJMLFxuICAgIH0pLCBjb250YWluZXIpO1xufVxuXG5mdW5jdGlvbiBfcmVzdWx0KGxvZ0Jvb2ssIHN0YXRlKSB7XG4gICAgLy8gd2UgcmV0dXJuIHRoZSBlcnJvciwgb3IgbnVsbCBpZiB0aGV5J3JlIGNvcnJlY3RcbiAgICB2YXIgZW5vdWdoRGF0YSA9IF8uYWxsKGxvZ0Jvb2suZGF0YSwgZnVuY3Rpb24gKGQpIHtyZXR1cm4gZC5sZW5ndGggPj0gNTt9KTtcbiAgICBpZiAoZW5vdWdoRGF0YSkge1xuICAgICAgICB2YXIgYXZncyA9IHt9XG4gICAgICAgIHZhciBtYXhEZWx0YXMgPSB7fVxuICAgICAgICBmb3IgKHZhciBuYW1lIGluIGxvZ0Jvb2suZGF0YSkge1xuICAgICAgICAgICAgYXZnc1tuYW1lXSA9IF8ucmVkdWNlKGxvZ0Jvb2suZGF0YVtuYW1lXSxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiAoYSwgYikge3JldHVybiBhICsgYjt9KSAvIGxvZ0Jvb2suZGF0YVtuYW1lXS5sZW5ndGg7XG4gICAgICAgICAgICBtYXhEZWx0YXNbbmFtZV0gPSBfLm1heChfLm1hcChsb2dCb29rLmRhdGFbbmFtZV0sXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gKGRhdHVtKSB7cmV0dXJuIE1hdGguYWJzKGRhdHVtIC0gYXZnc1tuYW1lXSk7fSkpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNvbnNvbGUubG9nKGxvZ0Jvb2suZGF0YSwgZW5vdWdoRGF0YSwgYXZncywgbWF4RGVsdGFzKTtcbiAgICBpZiAoIWVub3VnaERhdGEpIHtcbiAgICAgICAgcmV0dXJuIFwiWW91IGhhdmVuJ3QgZmlsbGVkIHVwIHlvdXIgbGFiIG5vdGVib29rISAgTWFrZSBzdXJlIHlvdSBnZXQgZW5vdWdoIGRhdGEgc28geW91IGtub3cgeW91ciByZXN1bHRzIGFyZSBhY2N1cmF0ZS5cIjtcbiAgICB9IGVsc2UgaWYgKG1heERlbHRhc1tcIkJvd2xpbmcgQmFsbFwiXSA+IDMwMCkge1xuICAgICAgICByZXR1cm4gXCJPbmUgb2YgeW91ciByZXN1bHRzIGZvciB0aGUgYm93bGluZyBiYWxsIGxvb2tzIHByZXR0eSBmYXIgb2ZmISAgVHJ5IGdldHRpbmcgc29tZSBtb3JlIGRhdGEgdG8gbWFrZSBzdXJlIGl0IHdhcyBhIGZsdWtlLlwiO1xuICAgIH0gZWxzZSBpZiAobWF4RGVsdGFzW1wiVGVubmlzIEJhbGxcIl0gPiAzMDApIHtcbiAgICAgICAgcmV0dXJuIFwiT25lIG9mIHlvdXIgcmVzdWx0cyBmb3IgdGhlIHRlbm5pcyBiYWxsIGxvb2tzIHByZXR0eSBmYXIgb2ZmISAgVHJ5IGdldHRpbmcgc29tZSBtb3JlIGRhdGEgdG8gbWFrZSBzdXJlIGl0IHdhcyBhIGZsdWtlLlwiO1xuICAgIH0gZWxzZSBpZiAoXG4gICAgICAgICAgICAoc3RhdGUuaHlwb3RoZXNpcyA9PT0gXCJzYW1lXCJcbiAgICAgICAgICAgICAgICAmJiBNYXRoLmFicyhhdmdzW1wiQm93bGluZyBCYWxsXCJdIC0gYXZnc1tcIlRlbm5pcyBCYWxsXCJdKSA+IDEwMClcbiAgICAgICAgICAgIHx8IChzdGF0ZS5oeXBvdGhlc2lzID09PSBcImJvd2xpbmdcIlxuICAgICAgICAgICAgICAgICYmIGF2Z3NbXCJCb3dsaW5nIEJhbGxcIl0gPCBhdmdzW1wiVGVubmlzIEJhbGxcIl0gKyAxMDApXG4gICAgICAgICAgICB8fCAoc3RhdGUuaHlwb3RoZXNpcyA9PT0gXCJ0ZW5uaXNcIlxuICAgICAgICAgICAgICAgICYmIGF2Z3NbXCJUZW5uaXMgQmFsbFwiXSA8IGF2Z3NbXCJCb3dsaW5nIEJhbGxcIl0gKyAxMDApXG4gICAgICAgICAgICApIHtcbiAgICAgICAgcmV0dXJuIFwiVGhvc2UgcmVzdWx0cyBkb24ndCBsb29rIHZlcnkgY29uc2lzdGVudCB3aXRoIHlvdXIgaHlwb3RoZXNpcy4gIEl0J3MgZmluZSBpZiB5b3VyIGh5cG90aGVzaXMgd2FzIGRpc3Byb3ZlbiwgdGhhdCdzIGhvdyBzY2llbmNlIHdvcmtzIVwiO1xuICAgIH0gZWxzZSBpZiAoXG4gICAgICAgICAgICBzdGF0ZS5oeXBvdGhlc2lzICE9PSBcInNhbWVcIlxuICAgICAgICAgICAgfHwgYXZnc1tcIkJvd2xpbmcgQmFsbFwiXSA8IDgwMFxuICAgICAgICAgICAgfHwgYXZnc1tcIkJvd2xpbmcgQmFsbFwiXSA+IDE1MDBcbiAgICAgICAgICAgIHx8IGF2Z3NbXCJUZW5uaXMgQmFsbFwiXSA8IDgwMFxuICAgICAgICAgICAgfHwgYXZnc1tcIlRlbm5pcyBCYWxsXCJdID4gMTUwMCkge1xuICAgICAgICByZXR1cm4gXCJUaG9zZSByZXN1bHRzIGFyZSBjb25zaXN0ZW50LCBidXQgdGhleSBkb24ndCBsb29rIHF1aXRlIHJpZ2h0IHRvIG1lLiAgTWFrZSBzdXJlIHlvdSdyZSBkcm9wcGluZyB0aGUgYmFsbHMgZ2VudGx5IGZyb20gdGhlIHNhbWUgaGVpZ2h0IGFib3ZlIHRoZSB0b3Agc2Vuc29yLlwiO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbn1cbiIsInZhciBTdG9wd2F0Y2ggPSByZXF1aXJlKCcuL3N0b3B3YXRjaCcpO1xudmFyIGNoZWNrQ29sbGlzaW9uID0gcmVxdWlyZSgnLi9jaGVjay1jb2xsaXNpb24nKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEdhdGU7XG5cbnZhciBFTlRFUl9GQURFT1VUX0RVUkFUSU9OID0gMjBcbnZhciBFWElUX0ZBREVPVVRfRFVSQVRJT04gPSAyMFxuXG4vKipcbiAqIE9wdGktdGhpbmd5IGdhdGUuXG4gKiBEZXRlY3RzIHdoZW4gYm9kaWVzIGVudGVyIGFuZCBleGl0IGEgc3BlY2lmaWVkIGFyZWEuXG4gKlxuICogcG9seWdvbiAtIHNob3VsZCBiZSBhIGxpc3Qgb2YgdmVjdG9yaXNoLCB3aGljaCBtdXN0IGJlIGNvbnZleC5cbiAqIGJvZHkgLSBzaG91bGQgYmUgYSBib2R5LCBvciBudWxsIHRvIHRyYWNrIGFsbCBib2RpZXNcbiAqIG9wdHMgLSB7ZGVidWc6IGZhbHNlfVxuICpcbiAqIFVzYWdlIEV4YW1wbGU6XG4gKiB2YXIgZ2F0ZSA9IG5ldyBHYXRlKGF3ZXNvbWVfd29ybGQsIGNvbnRhaW5lcl9kaXYsIFt7eDogMCwgeTogMzAwfSwgLi4uXSwge2RlYnVnOiB0cnVlfSlcbiAqIGdhdGUub24oJ2V4aXQnLCBmdW5jdGlvbihkYXRhKSB7XG4gKiAgIGNvbnNvbGUubG9nKFwiWW91IGVzY2FwZWQgbWUgYWdhaW4hIEkgd2lsbCBmaW5kIHlvdSwgb2ggXCIsIGRhdGEuYm9keSk7XG4gKiB9KVxuICovXG5mdW5jdGlvbiBHYXRlKHdvcmxkLCBwb2x5Z29uLCBwb3MsIGJvZHksIG9wdHMpIHtcbiAgICBvcHRzID0gb3B0cyB8fCB7fTtcbiAgICB0aGlzLndvcmxkID0gd29ybGRcbiAgICB0aGlzLmJvZHkgPSBib2R5O1xuICAgIC8vIGJvZGllcyBjdXJyZW50bHkgaW5zaWRlIHRoaXMgZ2F0ZS5cbiAgICB0aGlzLmNvbnRhaW5zID0gW11cbiAgICB0aGlzLl9zdWJzY3JpYmUoKVxuICAgIHRoaXMucG9seWdvbiA9IHBvbHlnb25cbiAgICB0aGlzLmNvbGxpc2lvbl9ib2R5ID0gUGh5c2ljcy5ib2R5KCdjb252ZXgtcG9seWdvbicsIHtcbiAgICAgICAgdmVydGljZXM6IHBvbHlnb24sXG4gICAgICAgIHRyZWF0bWVudDogJ21hZ2ljJyxcbiAgICAgICAgeDogcG9zWzBdLFxuICAgICAgICB5OiBwb3NbMV0sXG4gICAgICAgIHZ4OiAwLFxuICAgICAgICBhbmdsZTogMCxcbiAgICAgICAgcmVzdGl0dXRpb246IDAuOSxcbiAgICAgICAgc3R5bGVzOiB7XG4gICAgICAgICAgICBmaWxsU3R5bGU6ICcjODU5OTAwJyxcbiAgICAgICAgICAgIGFuZ2xlSW5kaWNhdG9yOiAnIzQxNDcwMCdcbiAgICAgICAgfVxuICAgIH0pXG4gICAgdGhpcy5tb3ZlZF9wb2ludHMgPSBwb2x5Z29uLm1hcChmdW5jdGlvbiAocCkge1xuICAgICAgICByZXR1cm4ge3g6IHAueCArIHBvc1swXSwgeTogcC55ICsgcG9zWzFdfVxuICAgIH0pO1xuICAgIHRoaXMudmlldyA9IHRoaXMud29ybGQucmVuZGVyZXIoKS5jcmVhdGVWaWV3KHRoaXMuY29sbGlzaW9uX2JvZHkuZ2VvbWV0cnksIHsgc3Ryb2tlU3R5bGU6ICcjYWFhJywgbGluZVdpZHRoOiAyLCBmaWxsU3R5bGU6ICdyZ2JhKDAsMCwwLDApJyB9KVxuICAgIC8vIHRoaXMud29ybGQuYWRkKHRoaXMuY29sbGlzaW9uX2JvZHkpXG4gICAgaWYgKG9wdHMuZGVidWcpIHRoaXMuc3BlYWtMb3VkbHkoKTtcbiAgICB0aGlzLl9jb2xvciA9IG9wdHMuY29sb3JcblxuICAgIHRoaXMuX2VudGVyX2ZhZGVvdXQgPSAwO1xuICAgIHRoaXMuX2V4aXRfZmFkZW91dCA9IDA7XG59XG5cbkdhdGUucHJvdG90eXBlLl9zdWJzY3JpYmUgPSBmdW5jdGlvbigpIHtcbiAgICBQaHlzaWNzLnV0aWwudGlja2VyLm9uKGZ1bmN0aW9uKHRpbWUpIHtcbiAgICAgICAgaWYgKHRoaXMuYm9keSkge1xuICAgICAgICAgICAgdGhpcy5oYW5kbGVCb2R5KHRoaXMuYm9keSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLndvcmxkLmdldEJvZGllcygpLmZvckVhY2godGhpcy5oYW5kbGVCb2R5LmJpbmQodGhpcykpXG4gICAgICAgIH1cbiAgICB9LmJpbmQodGhpcykpXG5cbiAgICAvLyBTdWJzY3JpYmUgdG8gcmVuZGVyIGV2ZW50c1xuICAgIHRoaXMud29ybGQub24oJ3JlbmRlcicsIHRoaXMuX3JlbmRlci5iaW5kKHRoaXMpKTtcblxuICAgIC8vIFN1YnNjcmliZSB0byBzZWxmLiAod0hhVD8pXG4gICAgdGhpcy5vbignZW50ZXInLCBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5fZW50ZXJfZmFkZW91dCA9IEVOVEVSX0ZBREVPVVRfRFVSQVRJT05cbiAgICB9LmJpbmQodGhpcykpXG4gICAgdGhpcy5vbignZXhpdCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLl9leGl0X2ZhZGVvdXQgPSBFWElUX0ZBREVPVVRfRFVSQVRJT05cbiAgICB9LmJpbmQodGhpcykpXG59XG5cbkdhdGUucHJvdG90eXBlLl9yZW5kZXIgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgciA9IHRoaXMud29ybGQucmVuZGVyZXIoKTtcbiAgICB2YXIgYWxwaGEgPSB0aGlzLl9lbnRlcl9mYWRlb3V0IC8gRU5URVJfRkFERU9VVF9EVVJBVElPTlxuICAgIHZhciBzdHJva2VTdHlsZXMgPSB7XG4gICAgICAgIGdyZWVuOiAnIzBhMCcsXG4gICAgICAgIHJlZDogJyNhMDAnLFxuICAgICAgICB1bmRlZmluZWQ6ICcjYWFhJyxcbiAgICB9XG4gICAgdmFyIGZpbGxTdHlsZSA9IHtcbiAgICAgICAgZ3JlZW46ICdyZ2JhKDUwLDEwMCw1MCwnK2FscGhhKycpJyxcbiAgICAgICAgcmVkOiAncmdiYSgxMDAsNTAsNTAsJythbHBoYSsnKScsXG4gICAgICAgIHVuZGVmaW5lZDogJ3JnYmEoMCwwLDAsJythbHBoYSsnKScsXG4gICAgfVxuICAgIHIuZHJhd1BvbHlnb24odGhpcy5tb3ZlZF9wb2ludHMsIHtcbiAgICAgICAgc3Ryb2tlU3R5bGU6IHN0cm9rZVN0eWxlc1t0aGlzLl9jb2xvcl0sXG4gICAgICAgIGxpbmVXaWR0aDogMixcbiAgICAgICAgZmlsbFN0eWxlOiBmaWxsU3R5bGVbdGhpcy5fY29sb3JdLFxuICAgIH0pO1xuXG4gICAgdGhpcy5fZW50ZXJfZmFkZW91dCA9IE1hdGgubWF4KDAsIHRoaXMuX2VudGVyX2ZhZGVvdXQgLSAxKVxuICAgIHRoaXMuX2V4aXRfZmFkZW91dCA9IE1hdGgubWF4KDAsIHRoaXMuX2V4aXRfZmFkZW91dCAtIDEpXG59XG5cbkdhdGUucHJvdG90eXBlLmhhbmRsZUJvZHkgPSBmdW5jdGlvbihib2R5KSB7XG4gICAgLy8gSWdub3JlIGJvZGllcyBiZWluZyBkcmFnZ2VkLlxuICAgIGlmIChib2R5LmRyYWdnaW5nKSByZXR1cm47XG5cbiAgICB2YXIgd2FzSW4gPSB0aGlzLmNvbnRhaW5zLmluZGV4T2YoYm9keSkgIT0gLTFcbiAgICB2YXIgaXNJbiA9IHRoaXMudGVzdEJvZHkoYm9keSlcbiAgICBpZiAoIXdhc0luICYmIGlzSW4pIHtcbiAgICAgICAgdGhpcy5jb250YWlucy5wdXNoKGJvZHkpXG4gICAgICAgIHRoaXMuZW1pdCgnZW50ZXInLCB7Ym9keTogYm9keX0pXG4gICAgfVxuICAgIGlmICh3YXNJbiAmJiAhaXNJbikge1xuICAgICAgICB0aGlzLmNvbnRhaW5zID0gXy53aXRob3V0KHRoaXMuY29udGFpbnMsIGJvZHkpO1xuICAgICAgICB0aGlzLmVtaXQoJ2V4aXQnLCB7Ym9keTogYm9keX0pXG4gICAgfVxufVxuXG5HYXRlLnByb3RvdHlwZS50ZXN0Qm9keSA9IGZ1bmN0aW9uKGJvZHkpIHtcbiAgICBpZiAoIXdpbmRvdy5kZWJ1ZyAmJiBib2R5LnRyZWF0bWVudCAhPT0gJ2R5bmFtaWMnKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIGNoZWNrQ29sbGlzaW9uKHRoaXMuY29sbGlzaW9uX2JvZHksIGJvZHkpXG4gICAgLy8vIHZhciBwb3MgPSBib2R5LnN0YXRlLnBvc1xuICAgIC8vLyByZXR1cm4gdGhpcy50ZXN0UG9pbnQoe3g6IHBvcy54LCB5OiBwb3MueX0pXG59XG5cbkdhdGUucHJvdG90eXBlLnRlc3RQb2ludCA9IGZ1bmN0aW9uKHZlY3RvcmlzaCkge1xuICAgIHJldHVybiBQaHlzaWNzLmdlb21ldHJ5LmlzUG9pbnRJblBvbHlnb24oXG4gICAgICAgIHZlY3RvcmlzaCxcbiAgICAgICAgdGhpcy5wb2x5Z29uKTtcbn1cblxuLy8gR2F0ZS5wcm90b3R5cGUucnVuU3RvcHdhdGNoID0gZnVuY3Rpb24oc3RvcHdhdGNoKSB7XG4gICAgLy8gdGhpcy5vbignZW50ZXInLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIC8vIHN0b3B3YXRjaC5yZXNldCgpO1xuICAgICAgICAvLyBzdG9wd2F0Y2guc3RhcnQoKTtcbiAgICAvLyB9KTtcbiAgICAvLyB0aGlzLm9uKCdleGl0JywgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAvLyBzdG9wd2F0Y2guc3RvcCgpO1xuICAgIC8vIH0pO1xuLy8gfVxuXG4vKipcbiAqIERlYnVnZ2luZyBmdW5jdGlvbiB0byBsaXN0ZW4gdG8gbXkgb3duIGV2ZW50cyBhbmQgY29uc29sZS5sb2cgdGhlbS5cbiAqL1xuR2F0ZS5wcm90b3R5cGUuc3BlYWtMb3VkbHkgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLm9uKCdlbnRlcicsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ2VudGVyJywgZGF0YS5ib2R5KVxuICAgIH0pXG4gICAgdGhpcy5vbignZXhpdCcsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ2V4aXQnLCBkYXRhLmJvZHkpXG4gICAgfSlcbiAgICByZXR1cm4ge2J1dENhcnJ5QUJpZ1N0aWNrOiAnJ31cbn1cblxuXy5leHRlbmQoR2F0ZS5wcm90b3R5cGUsIFBoeXNpY3MudXRpbC5wdWJzdWIucHJvdG90eXBlKVxuIiwiXG52YXIgQ2FuR3JhcGggPSByZXF1aXJlKCcuL2NhbmdyYXBoJylcblxubW9kdWxlLmV4cG9ydHMgPSBHcmFwaFxuXG5mdW5jdGlvbiBnZXREYXR1bShpdGVtKSB7XG4gICAgcmV0dXJuIGl0ZW0uYXR0ci5zcGxpdCgnLicpLnJlZHVjZShmdW5jdGlvbiAobm9kZSwgYXR0cikge1xuICAgICAgICByZXR1cm4gbm9kZVthdHRyXVxuICAgIH0sIGl0ZW0uYm9keS5zdGF0ZSlcbn1cblxuZnVuY3Rpb24gR3JhcGgocGFyZW50LCB0cmFja2luZywgb3B0aW9ucykge1xuICAgIHRoaXMubyA9IF8uZXh0ZW5kKHtcbiAgICAgICAgdG9wOiAxMCxcbiAgICAgICAgbGVmdDogMTAsXG4gICAgICAgIHdpZHRoOiA2MDAsXG4gICAgICAgIGhlaWdodDogNDAwLFxuICAgICAgICB3b3JsZEhlaWdodDogMjAwXG4gICAgfSwgb3B0aW9ucylcbiAgICB0aGlzLnRyYWNraW5nID0gdHJhY2tpbmdcbiAgICB0aGlzLmRhdGEgPSBbXVxuICAgIHRoaXMubm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpXG4gICAgdGhpcy5ub2RlLmNsYXNzTmFtZSA9ICdncmFwaCdcbiAgICB0aGlzLm5vZGUud2lkdGggPSB0aGlzLm8ud2lkdGhcbiAgICB0aGlzLm5vZGUuaGVpZ2h0ID0gdGhpcy5vLmhlaWdodFxuICAgIHRoaXMubm9kZS5zdHlsZS50b3AgPSB0aGlzLm8udG9wICsgJ3B4J1xuICAgIHRoaXMubm9kZS5zdHlsZS5sZWZ0ID0gdGhpcy5vLmxlZnQgKyAncHgnXG4gICAgdmFyIG51bWdyYXBocyA9IE9iamVjdC5rZXlzKHRyYWNraW5nKS5sZW5ndGhcbiAgICB2YXIgZ3JhcGhoZWlnaHQgPSB0aGlzLm8uaGVpZ2h0IC8gbnVtZ3JhcGhzXG4gICAgcGFyZW50LmFwcGVuZENoaWxkKHRoaXMubm9kZSlcblxuICAgIHRoaXMuZ3JhcGhzID0ge31cbiAgICB2YXIgaSA9IDBcbiAgICBmb3IgKHZhciBuYW1lIGluIHRyYWNraW5nKSB7XG4gICAgICAgIHRoaXMuZ3JhcGhzW25hbWVdID0gbmV3IENhbkdyYXBoKHtcbiAgICAgICAgICAgIG5vZGU6IHRoaXMubm9kZSxcbiAgICAgICAgICAgIG1pbnNjYWxlOiB0cmFja2luZ1tuYW1lXS5taW5zY2FsZSxcbiAgICAgICAgICAgIHRpdGxlOiB0cmFja2luZ1tuYW1lXS50aXRsZSxcbiAgICAgICAgICAgIHRvcDogZ3JhcGhoZWlnaHQgKiBpKyssXG4gICAgICAgICAgICBsZWZ0OiAwLFxuICAgICAgICAgICAgd2lkdGg6IHRoaXMuby53aWR0aCxcbiAgICAgICAgICAgIGhlaWdodDogZ3JhcGhoZWlnaHQsXG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgLypcbiAgICB0aGlzLmdyYXBoID0gbmV3IFJpY2tzaGF3LkdyYXBoKHtcbiAgICAgICAgZWxlbWVudDogdGhpcy5ub2RlLFxuICAgICAgICB3aWR0aDogNjAwLFxuICAgICAgICBoZWlnaHQ6IDYwMCxcbiAgICAgICAgcmVuZGVyZXI6ICdsaW5lJyxcbiAgICAgICAgc2VyaWVzOiBuZXcgUmlja3NoYXcuU2VyaWVzKFxuICAgICAgICAgICAgdHJhY2tpbmcubWFwKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtuYW1lOiBpdGVtLm5hbWV9XG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIHVuZGVmaW5lZCwge1xuICAgICAgICAgICAgICAgIHRpbWVJbnRlcnZhbDogMjUwLFxuICAgICAgICAgICAgICAgIG1heERhdGFQb2ludHM6IDEwMCxcbiAgICAgICAgICAgICAgICB0aW1lQmFzZTogbmV3IERhdGUoKS5nZXRUaW1lKCkgLyAxMDAwXG4gICAgICAgICAgICB9XG4gICAgICAgIClcbiAgICB9KVxuICAgICovXG59XG5cbkdyYXBoLnByb3RvdHlwZSA9IHtcbiAgICB1cGRhdGVEYXRhOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBkYXRhID0ge31cbiAgICAgICAgdmFyIGhlaWdodCA9IHRoaXMuby53b3JsZEhlaWdodFxuICAgICAgICB0aGlzLm5vZGUuZ2V0Q29udGV4dCgnMmQnKS5jbGVhclJlY3QoMCwgMCwgdGhpcy5ub2RlLndpZHRoLCB0aGlzLm5vZGUuaGVpZ2h0KVxuICAgICAgICBmb3IgKHZhciBuYW1lIGluIHRoaXMudHJhY2tpbmcpIHtcbiAgICAgICAgICAgIHRoaXMuZ3JhcGhzW25hbWVdLmFkZFBvaW50KHRoaXMuZ2V0RGF0dW0obmFtZSkpXG4gICAgICAgICAgICB0aGlzLmdyYXBoc1tuYW1lXS5kcmF3KClcbiAgICAgICAgfVxuICAgIH0sXG4gICAgZ2V0RGF0dW06IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgIHZhciBpdGVtID0gdGhpcy50cmFja2luZ1tuYW1lXVxuICAgICAgICBpZiAoaXRlbS5mbikge1xuICAgICAgICAgICAgcmV0dXJuIGl0ZW0uZm4oKTtcbiAgICAgICAgfSBlbHNlIGlmIChpdGVtLmF0dHIgPT09ICdwb3MueScpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm8ud29ybGRIZWlnaHQgLSBpdGVtLmJvZHkuc3RhdGUucG9zLnlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBnZXREYXR1bShpdGVtKVxuICAgICAgICB9XG4gICAgfSxcbiAgICB1cGRhdGU6IGZ1bmN0aW9uICh0aW1lc3RlcCkge1xuICAgICAgICB0aGlzLnVwZGF0ZURhdGEoKVxuICAgIH1cbn1cblxuIiwidmFyIEJhc2UgPSByZXF1aXJlKCcuL2Jhc2UnKTtcbnZhciBHYXRlID0gcmVxdWlyZSgnLi9nYXRlJyk7XG52YXIgU3RvcHdhdGNoID0gcmVxdWlyZSgnLi9zdG9wd2F0Y2gnKTtcbnZhciBMb2dCb29rID0gcmVxdWlyZSgnLi9sb2dib29rJyk7XG52YXIgUGxheVBhdXNlID0gcmVxdWlyZSgnLi9wbGF5cGF1c2UnKTtcbnZhciBIaWxsc0ludHJvID0gcmVxdWlyZSgnLi9pbnRyby9oaWxsc19pbnRyby5qc3gnKTtcbnZhciBoaWxsc0RhdGFDaGVja2VyID0gcmVxdWlyZSgnLi9oaWxsc2RhdGFjaGVja2VyJyk7XG52YXIgQ2F2ZURyYXcgPSByZXF1aXJlKCcuL2NhdmVkcmF3Jyk7XG52YXIgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xudmFyIHRlcnJhaW4gPSByZXF1aXJlKCcuL3RlcnJhaW4nKTtcblxuZnVuY3Rpb24gcmFuZG9tKG1pbiwgbWF4KXtcbiAgICByZXR1cm4gKE1hdGgucmFuZG9tKCkgKiAobWF4LW1pbikgKyBtaW4pfDBcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBCYXNlLmV4dGVuZChmdW5jdGlvbiBIaWxscyhjb250YWluZXIsIG9wdGlvbnMpIHtcbiAgICBCYXNlLmNhbGwodGhpcywgY29udGFpbmVyLCBvcHRpb25zLCBcImltYWdlcy9sYWJfYmFja2dyb3VuZC5qcGdcIixcbiAgICAgICAgdHJ1ZSAvKiBkaXNhYmxlQm91bmRzICovKVxufSwge1xuICAgIGRyb3BPYmplY3RzOiBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgICAgICB0aGlzLmJhbGwgPSBQaHlzaWNzLmJvZHkoJ2NpcmNsZScsIHtcbiAgICAgICAgICAgIHg6IDI1MCxcbiAgICAgICAgICAgIHk6IDQwMCxcbiAgICAgICAgICAgIHZ4OiAtTWF0aC5yYW5kb20oKSAqIDAuMSxcbiAgICAgICAgICAgIHJhZGl1czogMjAsXG4gICAgICAgICAgICBtYXNzOiA5MDAsXG4gICAgICAgICAgICBjb2Y6IDAuMSxcbiAgICAgICAgICAgIHJlc3RpdHV0aW9uOiAwLjAxLFxuICAgICAgICAgICAgZGlzcGxheU5hbWU6IFwiQm93bGluZyBCYWxsXCIsXG4gICAgICAgICAgICBzdHlsZXM6IHtcbiAgICAgICAgICAgICAgICBpbWFnZTogXCJpbWFnZXMvYm93bGluZ19iYWxsLnBuZ1wiXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLndvcmxkLmFkZCh0aGlzLmJhbGwpO1xuICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoY2FsbGJhY2ssIDUwMCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICBzdGFydFdhbGt0aHJvdWdoOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgSGlsbHNJbnRybyh0aGlzLCBmdW5jdGlvbiAoaHlwb3RoZXNpcykge1xuICAgICAgICAgICBjb25zb2xlLmxvZygnR290IHRoZSBoeXBvdGhlc2lzISEnLCBoeXBvdGhlc2lzKTtcbiAgICAgICAgICAgdGhpcy5zZXR1cERhdGFDaGVja2VyKGh5cG90aGVzaXMpO1xuICAgICAgIH0uYmluZCh0aGlzKSwgdGhpcy5vcHRpb25zLmRlYnVnID09PSAndHJ1ZScpXG4gICB9LFxuXG4gICAgc2V0dXBEYXRhQ2hlY2tlcjogZnVuY3Rpb24gKGh5cG90aGVzaXMpIHtcbiAgICAgICAgdmFyIGRhdGFDaGVja2VyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgZGF0YUNoZWNrZXIuY2xhc3NOYW1lID0gXCJoaWxscy1kYXRhLWNoZWNrZXJcIjtcbiAgICAgICAgdGhpcy5zaWRlQmFyLmFwcGVuZENoaWxkKGRhdGFDaGVja2VyKTtcbiAgICAgICAgaGlsbHNEYXRhQ2hlY2tlcihkYXRhQ2hlY2tlciwgdGhpcy5sb2dCb29rLCBoeXBvdGhlc2lzKTtcbiAgICB9LFxuXG4gICAgc2V0dXBTbGlkZXI6IGZ1bmN0aW9uIChjb250YWluZXIpIHtcbiAgICAgICAgdGhpcy5zbGlkZXIgPSAkKCc8aW5wdXQgdHlwZT1cInJhbmdlXCIgbWluPVwiMFwiIG1heD1cIjE0MFwiIHN0ZXA9XCIxMFwiIHZhbHVlPVwiMTAwXCIvPicpO1xuICAgICAgICB0aGlzLnNsaWRlckRpc3BsYXkgPSAkKCc8c3Bhbj4xMDAgY208L3NwYW4+Jyk7XG4gICAgICAgIHZhciBoYW5kbGVTbGlkZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5zZXR1cFRlcnJhaW4oMjAwLCB0aGlzLnNsaWRlci52YWwoKSk7XG4gICAgICAgICAgICB0aGlzLnNsaWRlckRpc3BsYXkuaHRtbCh0aGlzLnNsaWRlci52YWwoKSArIFwiIGNtXCIpO1xuICAgICAgICB9LmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuc2xpZGVyLmNoYW5nZShoYW5kbGVTbGlkZSkub24oJ2lucHV0JywgaGFuZGxlU2xpZGUpO1xuICAgICAgICB2YXIgZGl2ID0gJCgnPGRpdiBjbGFzcz1cImhpbGwtc2xpZGVyXCIvPicpO1xuICAgICAgICAkKGNvbnRhaW5lcikuYXBwZW5kKGRpdik7XG4gICAgICAgIGRpdi5hcHBlbmQodGhpcy5zbGlkZXIpO1xuICAgICAgICBkaXYuYXBwZW5kKHRoaXMuc2xpZGVyRGlzcGxheSk7XG4gICAgfSxcblxuICAgIHNldHVwVGVycmFpbjogZnVuY3Rpb24gKHJhbXBIZWlnaHQsIGhpbGxIZWlnaHQpIHtcbiAgICAgICAgaWYgKHRoaXMudGVycmFpbkNhbnZhcykge1xuICAgICAgICAgICAgdGhpcy50ZXJyYWluQ2FudmFzLmNsZWFyKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMudGVycmFpbkJlaGF2aW9yKSB7XG4gICAgICAgICAgICB0aGlzLndvcmxkLnJlbW92ZSh0aGlzLnRlcnJhaW5CZWhhdmlvcik7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHRlcnJhaW5IZWlnaHQgPSB0aGlzLm1rVGVycmFpbkhlaWdodEZ1bmN0aW9uKHJhbXBIZWlnaHQsIGhpbGxIZWlnaHQpO1xuICAgICAgICB0aGlzLnRlcnJhaW5DYW52YXMuZHJhdyh0ZXJyYWluSGVpZ2h0KVxuICAgICAgICB0aGlzLnRlcnJhaW5CZWhhdmlvciA9IFBoeXNpY3MuYmVoYXZpb3IoJ3RlcnJhaW4tY29sbGlzaW9uLWRldGVjdGlvbicsIHtcbiAgICAgICAgICAgIGFhYmI6IFBoeXNpY3MuYWFiYigwLCAwLCB0aGlzLm9wdGlvbnMud2lkdGgsIHRoaXMub3B0aW9ucy5oZWlnaHQpLFxuICAgICAgICAgICAgdGVycmFpbkhlaWdodDogdGVycmFpbkhlaWdodCxcbiAgICAgICAgICAgIHJlc3RpdHV0aW9uOiAwLjIsXG4gICAgICAgICAgICBjb2Y6IDAuMVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy53b3JsZC5hZGQodGhpcy50ZXJyYWluQmVoYXZpb3IpO1xuICAgIH0sXG5cbiAgICBta1RlcnJhaW5IZWlnaHRGdW5jdGlvbjogZnVuY3Rpb24gKHJhbXBIZWlnaHQsIGhpbGxIZWlnaHQpIHtcbiAgICAgICAgdmFyIHJhbXBXaWR0aCA9IHRoaXMub3B0aW9ucy53aWR0aCAvIDQ7XG4gICAgICAgIHZhciByYW1wU2NhbGUgPSByYW1wSGVpZ2h0IC8gTWF0aC5wb3cocmFtcFdpZHRoLCAyKTtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICh4KSB7XG4gICAgICAgICAgICBpZiAoeCA8IHJhbXBXaWR0aCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBNYXRoLnBvdyhyYW1wV2lkdGggLSB4LCAyKSAqIHJhbXBTY2FsZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoeCA8IDMgKiByYW1wV2lkdGgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaGlsbEhlaWdodCAvIDIgKyBNYXRoLmNvcyhNYXRoLlBJICogeCAvIHJhbXBXaWR0aCkgKiBoaWxsSGVpZ2h0IC8gMjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICB9LFxuXG4gICAgc2V0dXA6IGZ1bmN0aW9uIChjb250YWluZXIpIHtcbiAgICAgICAgdmFyIHdvcmxkID0gdGhpcy53b3JsZFxuICAgICAgICB2YXIgZ3Jhdml0eSA9IFBoeXNpY3MuYmVoYXZpb3IoJ2NvbnN0YW50LWFjY2VsZXJhdGlvbicpXG4gICAgICAgIGdyYXZpdHkuc2V0QWNjZWxlcmF0aW9uKHt4OiAwLCB5Oi4wMDAzfSk7XG4gICAgICAgIHdvcmxkLmFkZChncmF2aXR5KTtcbiAgICAgICAgLy8gcmVnaXN0ZXIsIGJ1dCBkb24ndCBzZXQgdXAgdGhlIGJlaGF2aW9yOyB0aGF0IGlzIGRvbmUgaW4gc2V0dXBUZXJyYWluKClcbiAgICAgICAgUGh5c2ljcy5iZWhhdmlvcigndGVycmFpbi1jb2xsaXNpb24tZGV0ZWN0aW9uJywgdGVycmFpbik7XG4gICAgICAgIHRoaXMudGVycmFpbkNhbnZhcyA9IG5ldyBDYXZlRHJhdygkKCcjdW5kZXItY2FudmFzJyksIDkwMCwgNzAwKVxuICAgICAgICB0aGlzLnNldHVwVGVycmFpbigyMDAsIDEwMCk7XG5cbiAgICAgICAgdmFyIHNpZGVCYXIgPSB0aGlzLnNpZGVCYXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICBzaWRlQmFyLmNsYXNzTmFtZSA9IFwic2lkZS1iYXJcIjtcbiAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKHNpZGVCYXIpO1xuICAgICAgICB2YXIgdG9wR2F0ZSA9IG5ldyBHYXRlKHdvcmxkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHV0aWwubWFrZVJlY3QoMCwgMCwgMTAsIDIwMCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgWzc1MCwgNjAwXSwgbnVsbCwge2RlYnVnOiB0cnVlLCBzaG93OiB0cnVlLCBjb2xvcjogJ2dyZWVuJ30pO1xuICAgICAgICB2YXIgYm90dG9tR2F0ZSA9IG5ldyBHYXRlKHdvcmxkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHV0aWwubWFrZVJlY3QoMCwgMCwgMTAsIDIwMCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgWzgwMCwgNjAwXSwgbnVsbCwge2RlYnVnOiB0cnVlLCBzaG93OiB0cnVlLCBjb2xvcjogJ3JlZCd9KTtcbiAgICAgICAgdmFyIGxvZ0NvbHVtbnMgPSBbe25hbWU6IFwiMTAwIGNtXCJ9XTtcbiAgICAgICAgdmFyIGxvZ0Jvb2sgPSB0aGlzLmxvZ0Jvb2sgPSBuZXcgTG9nQm9vayh3b3JsZCwgc2lkZUJhciwgMywgbG9nQ29sdW1ucyk7XG4gICAgICAgIHRvcEdhdGUub24oJ2VudGVyJywgZnVuY3Rpb24oZWxlbSkge1xuICAgICAgICAgICAgdmFyIGNvbE5hbWUgPSB0aGlzLnNsaWRlci52YWwoKS50b1N0cmluZygpICsgXCIgY21cIjtcbiAgICAgICAgICAgIGxvZ0Jvb2suaGFuZGxlU3RhcnQoY29sTmFtZSwgZWxlbS5ib2R5LnVpZCk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICAgIGJvdHRvbUdhdGUub24oJ2VudGVyJywgZnVuY3Rpb24oZWxlbSkge1xuICAgICAgICAgICAgdmFyIGNvbE5hbWUgPSB0aGlzLnNsaWRlci52YWwoKS50b1N0cmluZygpICsgXCIgY21cIjtcbiAgICAgICAgICAgIGxvZ0Jvb2suaGFuZGxlRW5kKGNvbE5hbWUsIGVsZW0uYm9keS51aWQpO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICB2YXIgYnV0dG9uQ29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgdmFyIHBsYXlQYXVzZSA9IG5ldyBQbGF5UGF1c2Uod29ybGQsIGJ1dHRvbkNvbnRhaW5lcik7XG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChidXR0b25Db250YWluZXIpO1xuICAgICAgICB0aGlzLnNldHVwU2xpZGVyKGJ1dHRvbkNvbnRhaW5lcik7XG5cbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy53YWxrKSB7XG4gICAgICAgICAgIHRoaXMuc3RhcnRXYWxrdGhyb3VnaCgpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmRyb3BPYmplY3RzKCk7XG4gICAgICAgICAgICB0aGlzLnNldHVwRGF0YUNoZWNrZXIoJ3NhbWUnKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBQaWNrIHVwIG9uZSB0aGUgYmFsbCBhbmQgZHJvcCBpdC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBjYWxsYmFjayBHZXRzIGNhbGxlZCB3aGVuIHRoZSBkZW1vbnN0cmF0aW9uIGlzIG92ZXIuXG4gICAgICovXG4gICAgZGVtb25zdHJhdGVEcm9wOiBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgICAgICB2YXIgYmFsbCA9IHRoaXMuYmFsbDtcbiAgICAgICAgdmFyIHRhcmdldFggPSAyMDtcbiAgICAgICAgdmFyIHRhcmdldFkgPSA0OTU7XG5cbiAgICAgICAgYmFsbC50cmVhdG1lbnQgPSAna2luZW1hdGljJztcbiAgICAgICAgYmFsbC5zdGF0ZS52ZWwueCA9ICh0YXJnZXRYIC0gYmFsbC5zdGF0ZS5wb3MueCkgLyAxNTAwO1xuICAgICAgICBiYWxsLnN0YXRlLnZlbC55ID0gKHRhcmdldFkgLSBiYWxsLnN0YXRlLnBvcy55KSAvIDE1MDA7XG4gICAgICAgIGJhbGwucmVjYWxjKCk7XG5cbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGJhbGwudHJlYXRtZW50ID0gJ3N0YXRpYyc7XG4gICAgICAgICAgICBiYWxsLnN0YXRlLnBvcy54ID0gdGFyZ2V0WDtcbiAgICAgICAgICAgIGJhbGwuc3RhdGUucG9zLnkgPSB0YXJnZXRZO1xuICAgICAgICAgICAgYmFsbC5zdGF0ZS52ZWwueCA9IDA7XG4gICAgICAgICAgICBiYWxsLnN0YXRlLnZlbC55ID0gMDtcbiAgICAgICAgICAgIGJhbGwucmVjYWxjKCk7XG5cbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgYmFsbC50cmVhdG1lbnQgPSAnZHluYW1pYyc7XG4gICAgICAgICAgICAgICAgYmFsbC5yZWNhbGMoKTtcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgICAgIH0sIDMwMDApXG4gICAgICAgICAgICB9LCAxNTAwKVxuICAgICAgICB9LCAxNTAwKVxuICAgIH1cbn0pO1xuIiwidmFyIERhdGFDaGVja2VyID0gcmVxdWlyZSgnLi9kYXRhY2hlY2tlci5qc3gnKTtcbnZhciB1dGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gaGlsbHNEYXRhQ2hlY2tlcjtcblxudmFyIF9pbml0aWFsVGV4dCA9IFwiRG8gYW4gZXhwZXJpbWVudCB0byBzZWUgaWYgeW91IGNhbiBmaWd1cmUgb3V0IHdoZXRoZXIgYSBiYWxsIHdoaWNoIHJvbGxzIG92ZXIgYSBoaWxsIGNvbWVzIG91dCBhdCBhIGRpZmZlcmVudCBzcGVlZCwgYW5kIGxldCBtZSBrbm93IHdoZW4geW91J3JlIGRvbmUhXCI7XG5cbnZhciBfbmV4dFVSTCA9IFwiP0JhY29uXCI7XG5cbnZhciBfaHlwb3RoZXNlcyA9IFtcbiAgICB7XG4gICAgICAgIG5hbWU6IFwic2FtZVwiLFxuICAgICAgICBidXR0b25UZXh0OiBcIlRoZSBzcGVlZCBkb2VzIG5vdCBkZXBlbmQgb24gdGhlIHNpemUgb2YgdGhlIGhpbGwuXCIsXG4gICAgICAgIHRleHQ6IFwidGhhdCB0aGUgc3BlZWQgd2lsbCBub3QgZGVwZW5kIG9uIHRoZSBzaXplIG9mIHRoZSBoaWxsXCIsXG4gICAgfSxcbiAgICB7XG4gICAgICAgIG5hbWU6IFwiZmFzdGVyXCIsXG4gICAgICAgIGJ1dHRvblRleHQ6IFwiVGhlIGJhbGwgY29tZXMgb3V0IGZhc3RlciBpZiB0aGUgaGlsbCBpcyBsYXJnZXIuXCIsXG4gICAgICAgIHRleHQ6IFwidGhhdCB0aGUgYmFsbCB3aWxsIGNvbWUgb3V0IGZhc3RlciBpZiB0aGUgaGlsbCBpcyBsYXJnZXJcIixcbiAgICB9LFxuICAgIHtcbiAgICAgICAgbmFtZTogXCJzbG93ZXJcIixcbiAgICAgICAgYnV0dG9uVGV4dDogXCJUaGUgYmFsbCBjb21lcyBvdXQgc2xvd2VyIGlmIHRoZSBoaWxsIGlzIGxhcmdlci5cIixcbiAgICAgICAgdGV4dDogXCJ0aGF0IHRoZSBiYWxsIHdpbGwgY29tZSBvdXQgc2xvd2VyIGlmIHRoZSBoaWxsIGlzIGxhcmdlclwiLFxuICAgIH0sXG5dXG5cbmZ1bmN0aW9uIGhpbGxzRGF0YUNoZWNrZXIoY29udGFpbmVyLCBsb2dCb29rLCBoeXBvdGhlc2lzKSB7XG4gICAgcmV0dXJuIFJlYWN0LnJlbmRlckNvbXBvbmVudChEYXRhQ2hlY2tlcih7XG4gICAgICAgIGluaXRpYWxUZXh0OiBfaW5pdGlhbFRleHQsXG4gICAgICAgIGluaXRpYWxIeXBvdGhlc2lzOiBoeXBvdGhlc2lzLFxuICAgICAgICBwb3NzaWJsZUh5cG90aGVzZXM6IF9oeXBvdGhlc2VzLFxuICAgICAgICByZXN1bHQ6IGZ1bmN0aW9uIChzdGF0ZSkge3JldHVybiBfcmVzdWx0KGxvZ0Jvb2ssIHN0YXRlKTt9LFxuICAgICAgICBuZXh0VVJMOiBfbmV4dFVSTCxcbiAgICB9KSwgY29udGFpbmVyKTtcbn1cblxuZnVuY3Rpb24gX3Jlc3VsdChsb2dCb29rLCBzdGF0ZSkge1xuICAgIHZhciBjbGVhbmVkRGF0YSA9IHt9XG4gICAgZm9yICh2YXIgbmFtZSBpbiBsb2dCb29rLmRhdGEpIHtcbiAgICAgICAgaWYgKGxvZ0Jvb2suZGF0YVtuYW1lXSkge1xuICAgICAgICAgICAgdmFyIGhlaWdodCA9IG5hbWUuc2xpY2UoMCwgLTMpOyAvLyByZW1vdmUgXCIgY21cIlxuICAgICAgICAgICAgY2xlYW5lZERhdGFbaGVpZ2h0XSA9IGxvZ0Jvb2suZGF0YVtuYW1lXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyBjaGVjayB0aGF0IHRoZXkgaGF2ZSBlbm91Z2ggZGF0YTogYXQgbGVhc3QgMyBwb2ludHMgZWFjaCBpbiBhdCBsZWFzdCA0XG4gICAgLy8gaGlsbCBzaXplcywgaW5jbHVkaW5nIG9uZSBsZXNzIHRoYW4gNTBjbSBhbmQgb25lIGdyZWF0ZXIgdGhhbiAxMDBjbS5cbiAgICBpZiAoXy5zaXplKGNsZWFuZWREYXRhKSA8IDQpIHtcbiAgICAgICAgcmV0dXJuIFwiWW91IG9ubHkgaGF2ZSBkYXRhIGZvciBhIGZldyBwb3NzaWJsZSBoaWxscyEgIE1ha2Ugc3VyZSB5b3UgaGF2ZSBkYXRhIG9uIGEgbnVtYmVyIG9mIHBvc3NpYmxlIGhpbGxzIHNvIHlvdSBrbm93IHlvdXIgcmVzdWx0cyBhcHBseSB0byBhbnkgaGlsbCBzaXplLlwiO1xuICAgIH0gZWxzZSBpZiAoXy5maWx0ZXIoY2xlYW5lZERhdGEsIGZ1bmN0aW9uIChkYXRhLCBoZWlnaHQpIHtyZXR1cm4gZGF0YS5sZW5ndGggPj0gMzt9KS5sZW5ndGggPCA0KSB7XG4gICAgICAgIHJldHVybiBcIllvdSBvbmx5IGhhdmUgYSBsaXR0bGUgYml0IG9mIGRhdGEgZm9yIHNvbWUgb2YgdGhvc2UgcG9zc2libGUgaGlsbHMuICBNYWtlIHN1cmUgeW91IGhhdmUgc2V2ZXJhbCBkYXRhIHBvaW50cyBvbiBhIG51bWJlciBvZiBwb3NzaWJsZSBoaWxscyBzbyB5b3Uga25vdyB5b3VyIHJlc3VsdHMgYXBwbHkgdG8gYW55IGhpbGwgc2l6ZS5cIjtcbiAgICB9IGVsc2UgaWYgKF8ubWF4KF8ubWFwKF8ua2V5cyhjbGVhbmVkRGF0YSksIHBhcnNlSW50KSkgPD0gMTAwKSB7XG4gICAgICAgIHJldHVybiBcIllvdSBkb24ndCBoYXZlIGFueSBkYXRhIGZvciBsYXJnZSBoaWxscyEgIFRyeSBjb2xsZWN0aW5nIHNvbWUgZGF0YSBvbiBsYXJnZSBoaWxscyB0byBtYWtlIHN1cmUgeW91ciByZXN1bHRzIGFwcGx5IHRvIHRoZW0uXCI7XG4gICAgfSBlbHNlIGlmIChfLm1pbihfLm1hcChfLmtleXMoY2xlYW5lZERhdGEpLCBwYXJzZUludCkpID49IDUwKSB7XG4gICAgICAgIHJldHVybiBcIllvdSBkb24ndCBoYXZlIGFueSBkYXRhIGZvciBzbWFsbCBoaWxscyEgIFRyeSBjb2xsZWN0aW5nIHNvbWUgZGF0YSBvbiBzbWFsbCBoaWxscyB0byBtYWtlIHN1cmUgeW91ciByZXN1bHRzIGFwcGx5IHRvIHRoZW0uXCI7XG4gICAgfVxuXG4gICAgLy8gY2hlY2sgdGhhdCB0aGV5IGRvbid0IGhhdmUgYmlnIG91dGxpZXJzIGluIGFueSBvZiB0aGVpciBjb2x1bW5zLlxuICAgIHZhciBhdmdzID0ge31cbiAgICBmb3IgKHZhciBoZWlnaHQgaW4gY2xlYW5lZERhdGEpIHtcbiAgICAgICAgYXZnc1toZWlnaHRdID0gdXRpbC5hdmcoY2xlYW5lZERhdGFbaGVpZ2h0XSk7XG4gICAgICAgIGlmIChfLmFueShjbGVhbmVkRGF0YVtoZWlnaHRdLCBmdW5jdGlvbiAoZGF0dW0pIHtyZXR1cm4gTWF0aC5hYnMoYXZnc1toZWlnaHRdIC0gcGFyc2VJbnQoZGF0dW0pKSA+IDMwMDt9KSkge1xuICAgICAgICAgICAgcmV0dXJuIFwiT25lIG9mIHlvdXIgcmVzdWx0cyBmb3IgXCIraGVpZ2h0K1wiIGNtIGxvb2tzIGEgYml0IG9mZiEgIFRyeSBjb2xsZWN0aW5nIHNvbWUgbW9yZSBkYXRhIHRvIG1ha2Ugc3VyZSBpdCdzIGEgZmx1a2UuXCJcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIGNoZWNrIHRoYXQgdGhlaXIgcmVzdWx0cyBhcmUgY29uc2lzdGVudCB3aXRoIHRoZWlyIGh5cG90aGVzaXMsIGFuZCB0aGF0XG4gICAgLy8gdGhlaXIgaHlwb3RoZXNpcyBpcyBjb3JyZWN0LlxuICAgIHZhciB0cmFuc3Bvc2VkID0gXy56aXAuYXBwbHkoXy5wYWlycyhhdmdzKSk7XG4gICAgdmFyIGNvcnJlbGF0aW9uID0gdXRpbC5jb3JyZWxhdGlvbihfLm1hcCh0cmFuc3Bvc2VkWzBdLCBwYXJzZUludCksIHRyYW5zcG9zZWRbMV0pO1xuICAgIGlmIChcbiAgICAgICAgICAgIChzdGF0ZS5oeXBvdGhlc2lzID09PSBcInNhbWVcIlxuICAgICAgICAgICAgICAgICYmIE1hdGguYWJzKF8ubWF4KF8udmFsdWVzKGF2Z3MpKSAtIF8ubWluKF8udmFsdWVzKGF2Z3MpKSkgPiAxMDApXG4gICAgICAgICAgICB8fCAoc3RhdGUuaHlwb3RoZXNpcyA9PT0gXCJmYXN0ZXJcIlxuICAgICAgICAgICAgICAgICYmIGNvcnJlbGF0aW9uID4gLTAuNSkgLy8gbmVnYXRpdmUgY29ycmVsYXRpb24gd291bGQgYmUgdGFsbGVyID0+IHNob3J0ZXIgdGltZSA9PiBmYXN0ZXJcbiAgICAgICAgICAgIHx8IChzdGF0ZS5oeXBvdGhlc2lzID09PSBcInNsb3dlclwiXG4gICAgICAgICAgICAgICAgJiYgY29ycmVsYXRpb24gPCAwLjUpKSB7XG4gICAgICAgIHJldHVybiBcIlRob3NlIHJlc3VsdHMgZG9uJ3QgbG9vayB2ZXJ5IGNvbnNpc3RlbnQgd2l0aCB5b3VyIGh5cG90aGVzaXMuICBJdCdzIGZpbmUgaWYgeW91ciBoeXBvdGhlc2lzIHdhcyBkaXNwcm92ZW4sIHRoYXQncyBob3cgc2NpZW5jZSB3b3JrcyFcIjtcbiAgICB9IGVsc2UgaWYgKFxuICAgICAgICAgICAgc3RhdGUuaHlwb3RoZXNpcyAhPT0gXCJzYW1lXCJcbiAgICAgICAgICAgIHx8IF8ubWF4KF8udmFsdWVzKGF2Z3MpKSA+IDIwMFxuICAgICAgICAgICAgfHwgXy5taW4oXy52YWx1ZXMoYXZncykpIDwgMTQwKSB7XG4gICAgICAgIHJldHVybiBcIlRob3NlIHJlc3VsdHMgYXJlIGNvbnNpc3RlbnQsIGJ1dCB0aGV5IGRvbid0IGxvb2sgcXVpdGUgcmlnaHQgdG8gbWUuICBNYWtlIHN1cmUgeW91J3JlIGRyb3BwaW5nIHRoZSBiYWxscyBnZW50bHkgZnJvbSB0aGUgdG9wIG9mIHRoZSByYW1wIGVhY2ggdGltZS5cIjtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG59XG4iLCJcbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIEJhc2U6IHJlcXVpcmUoJy4vYmFzZScpLFxuICAgIEJhY29uOiByZXF1aXJlKCcuL2JhY29uLmpzeCcpLFxuICAgIERlbW86IHJlcXVpcmUoJy4vZGVtbycpLFxuICAgIE5ld3RvbjE6IHJlcXVpcmUoJy4vbmV3dG9uMScpLFxuICAgIE9yYml0OiByZXF1aXJlKCcuL29yYml0JyksXG4gICAgTW9vbjogcmVxdWlyZSgnLi9tb29uJyksXG4gICAgQXN0ZXJvaWRzOiByZXF1aXJlKCcuL2FzdGVyb2lkcycpLFxuICAgIFNsb3BlOiByZXF1aXJlKCcuL3Nsb3BlJyksXG4gICAgRHJvcDogcmVxdWlyZSgnLi9kcm9wJyksXG4gICAgVHJ5R3JhcGg6IHJlcXVpcmUoJy4vdHJ5LWdyYXBoJyksXG4gICAgQ2F2ZURyYXc6IHJlcXVpcmUoJy4vY2F2ZWRyYXcnKSxcbiAgICBIaWxsczogcmVxdWlyZSgnLi9oaWxscycpLFxufVxuIiwiLyoqIEBqc3ggUmVhY3QuRE9NICovXG5cbnZhciBXYWxrdGhyb3VnaCA9IHJlcXVpcmUoJy4vd2Fsay10aHJvdWdoLmpzeCcpXG52YXIgUFQgPSBSZWFjdC5Qcm9wVHlwZXNcbnZhciBTdGVwID0gcmVxdWlyZSgnLi9zdGVwLmpzeCcpXG5cbm1vZHVsZS5leHBvcnRzID0gRHJvcEludHJvO1xuXG5mdW5jdGlvbiBEcm9wSW50cm8oRXhlcmNpc2UsIGdvdEh5cG90aGVzaXMsIGRlYnVnKSB7XG4gICAgdmFyIG5vZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQobm9kZSlcbiAgICBSZWFjdC5yZW5kZXJDb21wb25lbnQoV2Fsa3Rocm91Z2goe1xuICAgICAgICBzdGVwczogc3RlcHMsXG4gICAgICAgIG9uSHlwb3RoZXNpczogZ290SHlwb3RoZXNpcyxcbiAgICAgICAgb25Eb25lOiBmdW5jdGlvbiAoaHlwb3RoZXNpcykge1xuICAgICAgICAgICAgUmVhY3QudW5tb3VudENvbXBvbmVudEF0Tm9kZShub2RlKTtcbiAgICAgICAgICAgIG5vZGUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChub2RlKTtcbiAgICAgICAgfSxcbiAgICAgICAgZGVidWc6IGRlYnVnLFxuICAgICAgICBFeGVyY2lzZTogRXhlcmNpc2VcbiAgICB9KSwgbm9kZSlcbn1cblxuXG52YXIgQnV0dG9uR3JvdXAgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdCdXR0b25Hcm91cCcsXG4gICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiB0aGlzLnByb3BzLmNsYXNzTmFtZX0sIFxuICAgICAgICAgICAgdGhpcy5wcm9wcy5vcHRpb25zLm1hcChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgICAgICAgIHZhciBjbHMgPSBcImJ0biBidG4tZGVmYXVsdFwiXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMuc2VsZWN0ZWQgPT09IGl0ZW1bMF0pIHtcbiAgICAgICAgICAgICAgICAgICAgY2xzICs9ICcgYWN0aXZlJ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gUmVhY3QuRE9NLmJ1dHRvbih7a2V5OiBpdGVtWzBdLCBjbGFzc05hbWU6IGNscywgb25DbGljazogdGhpcy5wcm9wcy5vblNlbGVjdC5iaW5kKG51bGwsIGl0ZW1bMF0pfSwgaXRlbVsxXSk7XG4gICAgICAgICAgICB9LmJpbmQodGhpcykpXG4gICAgICAgICk7XG4gICAgfVxufSk7XG5cbnZhciBzdGVwcyA9IFtcbiAgICBmdW5jdGlvbiAocHJvcHMpIHtcbiAgICAgICAgcmV0dXJuIFN0ZXAoXy5leHRlbmQocHJvcHMsIHtcbiAgICAgICAgICAgIGlkOiAnaGVsbG8nLFxuICAgICAgICAgICAgdGl0bGU6IFwiSGkhIEknbSBTaXIgRnJhbmNpcyBCYWNvblwiLFxuICAgICAgICAgICAgc2hvd0JhY29uOiB0cnVlLFxuICAgICAgICAgICAgYm9keTogXCJJIHdhcyBtYWRlIGEgS25pZ2h0IG9mIEVuZ2xhbmQgZm9yIGRvaW5nIGF3ZXNvbWUgU2NpZW5jZS4gV2UncmUgZ29pbmcgdG8gdXNlIHNjaWVuY2UgdG8gZmlndXJlIG91dCBjb29sIHRoaW5ncyBhYm91dCB0aGUgd29ybGQuXCIsXG4gICAgICAgICAgICBuZXh0OiBcIkxldCdzIGRvIHNjaWVuY2UhXCJcbiAgICAgICAgfSkpXG4gICAgfSxcblxuICAgIGZ1bmN0aW9uIChwcm9wcykge1xuICAgICAgICB2YXIgaHlwb3RoZXNpcyA9IHByb3BzLmRhdGEuaHlwb3RoZXNpc1xuICAgICAgICByZXR1cm4gU3RlcChfLmV4dGVuZChwcm9wcywge1xuICAgICAgICAgICAgaWQ6ICdkZXNjcmlwdGlvbicsXG4gICAgICAgICAgICB0aXRsZTogXCJFeHBlcmltZW50ICMxXCIsXG4gICAgICAgICAgICBvblVwZGF0ZTogZnVuY3Rpb24gKHByZXZQcm9wcykge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLmRhdGEuaHlwb3RoZXNpcyAmJiAhcHJldlByb3BzLmRhdGEuaHlwb3RoZXNpcykge1xuICAgICAgICAgICAgICAgICAgICBwcm9wcy5vbkh5cG90aGVzaXMocHJvcHMuZGF0YS5oeXBvdGhlc2lzKTtcbiAgICAgICAgICAgICAgICAgICAgcHJvcHMuZGVidWcgPyBwcm9wcy5vbk5leHQoKSA6IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvcHMub25OZXh0KClcbiAgICAgICAgICAgICAgICAgICAgfSwgNTAwKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBib2R5OiBSZWFjdC5ET00uZGl2KG51bGwsIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5wKG51bGwsIFwiV2hhdCBmYWxscyBmYXN0ZXI6IGEgdGVubmlzIGJhbGwgb3IgYSBib3dsaW5nIGJhbGw/XCIpLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00ucChudWxsLCBcIkEgXCIsIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwidWxpbmVcIn0sIFwiSHlwb3RoZXNpc1wiKSwgXCIgaXMgd2hhdCB5b3UgdGhpbmsgd2lsbCBoYXBwZW4uXCIpLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uaHIobnVsbCksIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJsYXJnZVwifSwgXCJJIHRoaW5rOlwiLCBcbiAgICAgICAgICAgICAgICAgICAgQnV0dG9uR3JvdXAoe1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiBcIndhbGt0aHJvdWdoX2h5cG90aGVzZXNcIiwgXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZDogaHlwb3RoZXNpcywgXG4gICAgICAgICAgICAgICAgICAgICAgICBvblNlbGVjdDogcHJvcHMuc2V0RGF0YS5iaW5kKG51bGwsICdoeXBvdGhlc2lzJyksIFxuICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uczogW1tcInRlbm5pc1wiLCBcIlRoZSB0ZW5uaXMgYmFsbCBmYWxscyBmYXN0ZXJcIl0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgW1wiYm93bGluZ1wiLCBcIlRoZSBib3dsaW5nIGJhbGwgZmFsbHMgZmFzdGVyXCJdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtcInNhbWVcIiwgXCJUaGV5IGZhbGwgdGhlIHNhbWVcIl1dfSlcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgLyoqaHlwb3RoZXNpcyAmJiA8cCBjbGFzc05hbWU9XCJ3YWxrdGhyb3VnaF9ncmVhdFwiPkdyZWF0ISBOb3cgd2UgZG8gc2NpZW5jZTwvcD4qKi9cbiAgICAgICAgICAgIClcbiAgICAgICAgfSkpXG4gICAgfSxcblxuICAgIGZ1bmN0aW9uIChwcm9wcykge1xuICAgICAgICB2YXIgZmlyc3RCYWxsID0gJ3Rlbm5pcydcbiAgICAgICAgdmFyIHNlY29uZEJhbGwgPSAnYm93bGluZydcbiAgICAgICAgdmFyIHByb3ZlciA9IHByb3BzLmRhdGEucHJvdmVyXG4gICAgICAgIHZhciBoeXBvdGhlc2lzID0gcHJvcHMuZGF0YS5oeXBvdGhlc2lzXG5cbiAgICAgICAgaWYgKGh5cG90aGVzaXMgPT09ICdib3dsaW5nJykge1xuICAgICAgICAgICAgZmlyc3RCYWxsID0gJ2Jvd2xpbmcnXG4gICAgICAgICAgICBzZWNvbmRCYWxsID0gJ3Rlbm5pcydcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciByZXNwb25zZXMgPSB7XG4gICAgICAgICAgICAndGVubmlzJzogJ05vcGUuIFRoYXQgd291bGQgc2hvdyB0aGF0IHRoZSB0ZW5uaXMgYmFsbCBmYWxscyBmYXN0ZXInLFxuICAgICAgICAgICAgJ2Jvd2xpbmcnOiAnTm9wZS4gVGhhdCB3b3VsZCBzaG93IHRoYXQgdGhlIGJvd2xpbmcgYmFsbCBmYWxscyBmYXN0ZXInLFxuICAgICAgICAgICAgJ3NhbWUnOiAnTm9wZS4gVGhhdCB3b3VsZCBzaG93IHRoYXQgdGhleSBmYWxsIHRoZSBzYW1lJ1xuICAgICAgICB9XG4gICAgICAgIHZhciBjb3JyZWN0ID0ge1xuICAgICAgICAgICAgJ3Rlbm5pcyc6ICdsZXNzJyxcbiAgICAgICAgICAgICdib3dsaW5nJzogJ2xlc3MnLFxuICAgICAgICAgICAgJ3NhbWUnOiAnc2FtZSdcbiAgICAgICAgfVxuICAgICAgICB2YXIgcHJvdmVyUmVzcG9uc2VcbiAgICAgICAgdmFyIGlzQ29ycmVjdCA9IHByb3ZlciA9PT0gY29ycmVjdFtoeXBvdGhlc2lzXVxuXG4gICAgICAgIGlmIChwcm92ZXIpIHtcbiAgICAgICAgICAgIGlmIChpc0NvcnJlY3QpIHtcbiAgICAgICAgICAgICAgICBwcm92ZXJSZXNwb25zZSA9IFwiRXhhY3RseSEgTm93IGxldCdzIGRvIHRoZSBleHBlcmltZW50LlwiXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHByb3ZlclJlc3BvbnNlID0gcmVzcG9uc2VzW3tcbiAgICAgICAgICAgICAgICAgICAgdGVubmlzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtb3JlOiAnYm93bGluZycsXG4gICAgICAgICAgICAgICAgICAgICAgICBzYW1lOiAnc2FtZSdcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgYm93bGluZzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgbW9yZTogJ3Rlbm5pcycsXG4gICAgICAgICAgICAgICAgICAgICAgICBzYW1lOiAnc2FtZSdcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgc2FtZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgbW9yZTogJ2Jvd2xpbmcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGVzczogJ3Rlbm5pcydcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1baHlwb3RoZXNpc11bcHJvdmVyXV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgZnV0dXJlSHlwb3RoZXNpcyA9IHtcbiAgICAgICAgICAgIHRlbm5pczogJ3RoZSB0ZW5uaXMgYmFsbCB3aWxsIGZhbGwgZmFzdGVyIHRoYW4gdGhlIGJvd2xpbmcgYmFsbCcsXG4gICAgICAgICAgICBib3dsaW5nOiAndGhlIGJvd2xpbmcgYmFsbCB3aWxsIGZhbGwgZmFzdGVyIHRoYW4gdGhlIHRlbm5pcyBiYWxsJyxcbiAgICAgICAgICAgIHNhbWU6ICd0aGUgdGVubmlzIGJhbGwgYW5kIHRoZSBib3dsaW5nIGJhbGwgd2lsbCBmYWxsIHRoZSBzYW1lJ1xuICAgICAgICB9W2h5cG90aGVzaXNdO1xuXG4gICAgICAgIHZhciBjdXJyZW50SHlwb3RoZXNpcyA9IHtcbiAgICAgICAgICAgIHRlbm5pczogJ2EgdGVubmlzIGJhbGwgZmFsbHMgZmFzdGVyIHRoYW4gYSBib3dsaW5nIGJhbGwnLFxuICAgICAgICAgICAgYm93bGluZzogJ2EgYm93bGluZyBiYWxsIGZhbGxzIGZhc3RlciB0aGFuIGEgdGVubmlzIGJhbGwnLFxuICAgICAgICAgICAgc2FtZTogJ2EgdGVubmlzIGJhbGwgZmFsbHMgdGhlIHNhbWUgYXMgYSBib3dsaW5nIGJhbGwnXG4gICAgICAgIH1baHlwb3RoZXNpc107XG5cbiAgICAgICAgcmV0dXJuIFN0ZXAoXy5leHRlbmQocHJvcHMsIHtcbiAgICAgICAgICAgIGlkOiAnZGVzaWduLWV4cGVyaW1lbnQnLFxuICAgICAgICAgICAgdGl0bGU6ICdEZXNpZ25pbmcgdGhlIEV4cGVyaW1lbnQnLFxuICAgICAgICAgICAgb25VcGRhdGU6IGZ1bmN0aW9uIChwcmV2UHJvcHMpIHtcbiAgICAgICAgICAgICAgICBpZiAocHJvdmVyICYmIGlzQ29ycmVjdCAmJiBwcm92ZXIgIT09IHByZXZQcm9wcy5kYXRhLnByb3Zlcikge1xuICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3BzLm9uTmV4dCgpXG4gICAgICAgICAgICAgICAgICAgIH0sIHByb3BzLmRlYnVnID8gNTAwIDogMjAwMCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGJvZHk6IFJlYWN0LkRPTS5kaXYobnVsbCwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLnAobnVsbCwgXCJOb3cgd2UgbmVlZCB0byBkZXNpZ24gYW4gZXhwZXJpbWVudCB0byB0ZXN0IHlvdXJcIiArICcgJyArXG4gICAgICAgICAgICAgICAgXCJoeXBvdGhlc2lzISBJdCdzIGltcG9ydGFudCB0byBiZSBjYXJlZnVsIHdoZW4gZGVzaWduaW5nIGFuXCIgKyAnICcgK1xuICAgICAgICAgICAgICAgIFwiZXhwZXJpbWVudCwgYmVjYXVzZSBvdGhlcndpc2UgeW91IGNvdWxkIGVuZCB1cCBcXFwicHJvdmluZ1xcXCJcIiArICcgJyArXG4gICAgICAgICAgICAgICAgXCJzb21ldGhpbmcgdGhhdCdzIGFjdHVhbGx5IGZhbHNlLlwiKSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLnAobnVsbCwgXCJUbyBwcm92ZSB0aGF0IFwiLCBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcInVsaW5lXCJ9LCBjdXJyZW50SHlwb3RoZXNpcyksIFwiLCB3ZSBjYW4gbWVhc3VyZSB0aGUgdGltZSB0aGF0IGl0XCIgKyAnICcgK1xuICAgICAgICAgICAgICAgIFwidGFrZXMgZm9yIGVhY2ggYmFsbCB0byBmYWxsIHdoZW4gZHJvcHBlZCBmcm9tIGEgc3BlY2lmaWNcIiArICcgJyArXG4gICAgICAgICAgICAgICAgXCJoZWlnaHQuXCIpLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00ucChudWxsLCBcIllvdXIgaHlwb3RoZXNpcyB3aWxsIGJlIHByb3ZlbiBpZiB0aGUgXCIsIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwidWxpbmVcIn0sIFwidGltZSBmb3IgdGhlIFwiLCBmaXJzdEJhbGwsIFwiIGJhbGxcIiksIFwiIGlzXCIsIFxuICAgICAgICAgICAgICAgICAgICBCdXR0b25Hcm91cCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU6IFwiYnRuLWdyb3VwXCIsIFxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWQ6IHByb3ZlciwgXG4gICAgICAgICAgICAgICAgICAgICAgICBvblNlbGVjdDogcHJvcHMuc2V0RGF0YS5iaW5kKG51bGwsICdwcm92ZXInKSwgXG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zOiBbWydsZXNzJywgJ2xlc3MgdGhhbiddLCBbJ21vcmUnLCAnbW9yZSB0aGFuJ10sIFsnc2FtZScsICd0aGUgc2FtZSBhcyddXX0pLCBcbiAgICAgICAgICAgICAgICAgICAgXCJ0aGUgXCIsIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwidWxpbmVcIn0sIFwidGltZSBmb3IgdGhlIFwiLCBzZWNvbmRCYWxsLCBcIiBiYWxsXCIpLCBcIi5cIlxuICAgICAgICAgICAgICAgICksIFxuICAgICAgICAgICAgICAgIHByb3ZlciAmJiBSZWFjdC5ET00ucCh7Y2xhc3NOYW1lOiBcImRlc2lnbl9yZXNwb25zZVwifSwgcHJvdmVyUmVzcG9uc2UpXG4gICAgICAgICAgICApXG4gICAgICAgIH0pKVxuICAgIH0sXG5cbiAgICBmdW5jdGlvbiAocHJvcHMpIHtcbiAgICAgICAgcmV0dXJuIFN0ZXAoXy5leHRlbmQocHJvcHMsIHtcbiAgICAgICAgICAgIGlkOiAnZXhwZXJpbWVudCcsXG4gICAgICAgICAgICBzdHlsZTogJ2JsYWNrJyxcbiAgICAgICAgICAgIHRpdGxlOiAnVGhlIGV4cGVyaW1lbnQnLFxuICAgICAgICAgICAgcG9zOiB7XG4gICAgICAgICAgICAgICAgbGVmdDogMzc1LFxuICAgICAgICAgICAgICAgIHRvcDogMjAwXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYm9keTogUmVhY3QuRE9NLnAobnVsbCwgXCJIZXJlIHdlIGhhdmUgdG9vbHMgdG8gY29uZHVjdCBvdXIgZXhwZXJpbWVudC4gWW91IGNhbiBzZWVcIiArICcgJyArXG4gICAgICAgICAgICBcInNvbWUgYm93bGluZyBiYWxscyBhbmQgdGVubmlzIGJhbGxzLCBhbmQgdGhvc2UgcmVkIGFuZCBncmVlblwiICsgJyAnICtcbiAgICAgICAgICAgIFwic2Vuc29ycyB3aWxsIHJlY29yZCB0aGUgdGltZSBpdCB0YWtlcyBmb3IgYSBiYWxsIHRvIGZhbGwuXCIpLFxuICAgICAgICAgICAgb25SZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBwcm9wcy5FeGVyY2lzZS5kZXBsb3lCYWxscyhmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHByb3BzLmRlYnVnID8gcHJvcHMub25OZXh0KCkgOiBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3BzLm9uTmV4dCgpXG4gICAgICAgICAgICAgICAgICAgIH0sIDIwMDApO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pKVxuICAgIH0sXG5cbiAgICBmdW5jdGlvbiAocHJvcHMpIHtcbiAgICAgICAgcmV0dXJuIFN0ZXAoXy5leHRlbmQocHJvcHMsIHtcbiAgICAgICAgICAgIGlkOiAnZHJvcCcsXG4gICAgICAgICAgICBzdHlsZTogJ2JsYWNrJyxcbiAgICAgICAgICAgIHBvczoge1xuICAgICAgICAgICAgICAgIHRvcDogMjAwLFxuICAgICAgICAgICAgICAgIGxlZnQ6IDIwMFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGJvZHk6IFJlYWN0LkRPTS5wKG51bGwsIFwiSWYgd2UgZHJvcCBhIGJhbGwgaGVyZSBhYm92ZSB0aGUgZ3JlZW4gc2Vuc29yLCB3ZSBjYW5cIiArICcgJyArXG4gICAgICAgICAgICAgICAgXCJ0aW1lIGhvdyBsb25nIGl0IHRha2VzIGZvciBpdCB0byBmYWxsIHRvIHRoZSByZWQgc2Vuc29yLlwiKSxcbiAgICAgICAgICAgIG9uUmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcHJvcHMuRXhlcmNpc2UuZGVtb25zdHJhdGVEcm9wKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvcHMub25OZXh0KClcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICB9KSlcbiAgICB9LFxuXG4gICAgZnVuY3Rpb24gKHByb3BzKSB7XG4gICAgICAgIHJldHVybiBTdGVwKF8uZXh0ZW5kKHByb3BzLCB7XG4gICAgICAgICAgICBpZDogJ2xvZ2Jvb2snLFxuICAgICAgICAgICAgc3R5bGU6ICdibGFjaycsXG4gICAgICAgICAgICBwb3M6IHtcbiAgICAgICAgICAgICAgICB0b3A6IDEwMCxcbiAgICAgICAgICAgICAgICBsZWZ0OiA1MDBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBhcnJvdzogUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImFycm93LXRvLWxvZ2Jvb2tcIn0pLFxuICAgICAgICAgICAgYm9keTogUmVhY3QuRE9NLnAobnVsbCwgXCJUaGUgdGltZSBpcyB0aGVuIHJlY29yZGVkIG92ZXIgaGVyZSBpbiB5b3VyIGxvZyBib29rLiBGaWxsIHVwIHRoaXMgbG9nIGJvb2sgd2l0aCB0aW1lcyBmb3IgYm90aCBiYWxscyBhbmQgY29tcGFyZSB0aGVtLlwiKSxcbiAgICAgICAgICAgIG9uUmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHByb3BzLm9uTmV4dCgpO1xuICAgICAgICAgICAgICAgIH0sIHByb3BzLmRlYnVnID8gMTAwMCA6IDUwMDApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KSk7XG4gICAgfSxcblxuICAgIGZ1bmN0aW9uIChwcm9wcykge1xuICAgICAgICByZXR1cm4gU3RlcChfLmV4dGVuZChwcm9wcywge1xuICAgICAgICAgICAgaWQ6ICdhbnN3ZXInLFxuICAgICAgICAgICAgc3R5bGU6ICdibGFjaycsXG4gICAgICAgICAgICBwb3M6IHtcbiAgICAgICAgICAgICAgICB0b3A6IDE1MCxcbiAgICAgICAgICAgICAgICBsZWZ0OiAyNTBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBhcnJvdzogUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImFycm93LXRvLWFuc3dlclwifSksXG4gICAgICAgICAgICBzaG93QmFjb246IHRydWUsXG4gICAgICAgICAgICB0aXRsZTogXCJOb3cgY29uZHVjdCB0aGUgZXhwZXJpbWVudCB0byB0ZXN0IHlvdXIgaHlwb3RoZXNpcyFcIixcbiAgICAgICAgICAgIGJvZHk6IFJlYWN0LkRPTS5wKG51bGwsIFwiT25jZSB5b3UndmUgY29sbGVjdGVkIGVub3VnaCBkYXRhIGluIHlvdXIgbG9nIGJvb2ssXCIgKyAnICcgK1xuICAgICAgICAgICAgXCJkZWNpZGUgd2hldGhlciB0aGUgZGF0YSBcIiwgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJ1bGluZVwifSwgXCJzdXBwb3J0XCIpLCBcIiBvclwiLCBcbiAgICAgICAgICAgICcgJywgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJ1bGluZVwifSwgXCJkaXNwcm92ZVwiKSwgXCIgeW91ciBoeXBvdGhlc2lzLiBUaGVuXCIgKyAnICcgK1xuICAgICAgICAgICAgXCJJIHdpbGwgZXZhbHVhdGUgeW91ciBleHBlcmltZW50IGFuZCBnaXZlIHlvdSBmZWVkYmFjay5cIiksXG4gICAgICAgICAgICBuZXh0OiBcIk9rLCBJJ20gcmVhZHlcIixcbiAgICAgICAgfSkpXG4gICAgfSxcbl1cbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xuXG52YXIgV2Fsa3Rocm91Z2ggPSByZXF1aXJlKCcuL3dhbGstdGhyb3VnaC5qc3gnKVxudmFyIFBUID0gUmVhY3QuUHJvcFR5cGVzXG52YXIgU3RlcCA9IHJlcXVpcmUoJy4vc3RlcC5qc3gnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEhpbGxzSW50cm87XG5cbmZ1bmN0aW9uIEhpbGxzSW50cm8oRXhlcmNpc2UsIGdvdEh5cG90aGVzaXMsIGRlYnVnKSB7XG4gICAgdmFyIG5vZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQobm9kZSlcbiAgICBSZWFjdC5yZW5kZXJDb21wb25lbnQoV2Fsa3Rocm91Z2goe1xuICAgICAgICBzdGVwczogc3RlcHMsXG4gICAgICAgIG9uSHlwb3RoZXNpczogZ290SHlwb3RoZXNpcyxcbiAgICAgICAgb25Eb25lOiBmdW5jdGlvbiAoaHlwb3RoZXNpcykge1xuICAgICAgICAgICAgUmVhY3QudW5tb3VudENvbXBvbmVudEF0Tm9kZShub2RlKTtcbiAgICAgICAgICAgIG5vZGUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChub2RlKTtcbiAgICAgICAgfSxcbiAgICAgICAgZGVidWc6IGRlYnVnLFxuICAgICAgICBFeGVyY2lzZTogRXhlcmNpc2VcbiAgICB9KSwgbm9kZSlcbn1cblxuXG52YXIgQnV0dG9uR3JvdXAgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdCdXR0b25Hcm91cCcsXG4gICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiB0aGlzLnByb3BzLmNsYXNzTmFtZX0sIFxuICAgICAgICAgICAgdGhpcy5wcm9wcy5vcHRpb25zLm1hcChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgICAgICAgIHZhciBjbHMgPSBcImJ0biBidG4tZGVmYXVsdFwiXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMuc2VsZWN0ZWQgPT09IGl0ZW1bMF0pIHtcbiAgICAgICAgICAgICAgICAgICAgY2xzICs9ICcgYWN0aXZlJ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gUmVhY3QuRE9NLmJ1dHRvbih7a2V5OiBpdGVtWzBdLCBjbGFzc05hbWU6IGNscywgb25DbGljazogdGhpcy5wcm9wcy5vblNlbGVjdC5iaW5kKG51bGwsIGl0ZW1bMF0pfSwgaXRlbVsxXSk7XG4gICAgICAgICAgICB9LmJpbmQodGhpcykpXG4gICAgICAgICk7XG4gICAgfVxufSk7XG5cbnZhciBzdGVwcyA9IFtcbiAgICBmdW5jdGlvbiAocHJvcHMpIHtcbiAgICAgICAgcmV0dXJuIFN0ZXAoXy5leHRlbmQocHJvcHMsIHtcbiAgICAgICAgICAgIGlkOiAnaGVsbG8nLFxuICAgICAgICAgICAgdGl0bGU6IFwiUmVhZHkgZm9yIGV2ZW4gbW9yZSBTY2llbmNlP1wiLFxuICAgICAgICAgICAgc2hvd0JhY29uOiB0cnVlLFxuICAgICAgICAgICAgYm9keTogXCJJIGhhdmUgb25lIG1vcmUgZXhwZXJpbWVudCBmb3IgeW91LlwiLFxuICAgICAgICAgICAgbmV4dDogXCJMZXQncyBkbyBpdCFcIlxuICAgICAgICB9KSlcbiAgICB9LFxuXG4gICAgZnVuY3Rpb24gKHByb3BzKSB7XG4gICAgICAgIHZhciBoeXBvdGhlc2lzID0gcHJvcHMuZGF0YS5oeXBvdGhlc2lzXG4gICAgICAgIHJldHVybiBTdGVwKF8uZXh0ZW5kKHByb3BzLCB7XG4gICAgICAgICAgICBpZDogJ2Rlc2NyaXB0aW9uJyxcbiAgICAgICAgICAgIHRpdGxlOiBcIkV4cGVyaW1lbnQgIzNcIixcbiAgICAgICAgICAgIG9uVXBkYXRlOiBmdW5jdGlvbiAocHJldlByb3BzKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMuZGF0YS5oeXBvdGhlc2lzICYmICFwcmV2UHJvcHMuZGF0YS5oeXBvdGhlc2lzKSB7XG4gICAgICAgICAgICAgICAgICAgIHByb3BzLm9uSHlwb3RoZXNpcyhwcm9wcy5kYXRhLmh5cG90aGVzaXMpO1xuICAgICAgICAgICAgICAgICAgICBwcm9wcy5kZWJ1ZyA/IHByb3BzLm9uTmV4dCgpIDogc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9wcy5vbk5leHQoKVxuICAgICAgICAgICAgICAgICAgICB9LCA1MDApXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGJvZHk6IFJlYWN0LkRPTS5kaXYobnVsbCwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLnAobnVsbCwgXCJJZiBhIGJhbGwgcm9sbHMgb3ZlciBhIGhpbGwsIGRvZXMgdGhlIHNwZWVkIG9mIHRoZSBiYWxsIGNoYW5nZT9cIlxuICAgICAgICAgICAgICAgICksIFxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5ET00uaW1nKHtzcmM6IFwiaW1hZ2VzL2JhbGxyb2xsLWRpYWdyYW0ucG5nXCIsIHdpZHRoOiBcIjMwMHB4XCJ9KSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmhyKG51bGwpLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwibGFyZ2VcIn0sIFwiSSB0aGluazpcIiwgXG4gICAgICAgICAgICAgICAgICAgIEJ1dHRvbkdyb3VwKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogXCJ3YWxrdGhyb3VnaF9oeXBvdGhlc2VzXCIsIFxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWQ6IGh5cG90aGVzaXMsIFxuICAgICAgICAgICAgICAgICAgICAgICAgb25TZWxlY3Q6IHByb3BzLnNldERhdGEuYmluZChudWxsLCAnaHlwb3RoZXNpcycpLCBcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnM6IFtbXCJmYXN0ZXJcIiwgXCJJdCB3aWxsIGNvbWUgb3V0IGdvaW5nIGZhc3RlclwiXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBbXCJzbG93ZXJcIiwgXCJJdCB3aWxsIGNvbWUgb3V0IGdvaW5nIHNsb3dlclwiXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBbXCJzYW1lXCIsIFwiSXQgd2lsbCBnbyB0aGUgc2FtZSBzcGVlZFwiXV19KVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAvKipoeXBvdGhlc2lzICYmIDxwIGNsYXNzTmFtZT1cIndhbGt0aHJvdWdoX2dyZWF0XCI+R3JlYXQhIE5vdyB3ZSBkbyBzY2llbmNlPC9wPioqL1xuICAgICAgICAgICAgKVxuICAgICAgICB9KSlcbiAgICB9LFxuXG4gICAgZnVuY3Rpb24gKHByb3BzKSB7XG4gICAgICAgIHZhciBwcm92ZXIgPSBwcm9wcy5kYXRhLnByb3ZlclxuICAgICAgICB2YXIgaHlwb3RoZXNpcyA9IHByb3BzLmRhdGEuaHlwb3RoZXNpc1xuXG4gICAgICAgIHZhciByZXNwb25zZXMgPSB7XG4gICAgICAgICAgICAnbW9yZSc6ICdOb3BlLiBUaGF0IHdvdWxkIHNob3cgdGhhdCB0aGUgYmFsbCBjb21lcyBvdXQgZmFzdGVyJyxcbiAgICAgICAgICAgICdsZXNzJzogJ05vcGUuIFRoYXQgd291bGQgc2hvdyB0aGF0IHRoZSBiYWxsIGNvbWVzIG91dCBzbG93ZXInLFxuICAgICAgICAgICAgJ3NhbWUnOiAnTm9wZS4gVGhhdCB3b3VsZCBzaG93IHRoYXQgdGhlIGJhbGwgY29tZXMgb3V0IGF0IHRoZSBzYW1lIHNwZWVkJyxcbiAgICAgICAgfVxuICAgICAgICB2YXIgY29ycmVjdCA9IHtcbiAgICAgICAgICAgICdmYXN0ZXInOiAnbGVzcycsXG4gICAgICAgICAgICAnc2xvd2VyJzogJ21vcmUnLFxuICAgICAgICAgICAgJ3NhbWUnOiAnc2FtZSdcbiAgICAgICAgfVxuICAgICAgICB2YXIgcHJvdmVyUmVzcG9uc2VcbiAgICAgICAgdmFyIGlzQ29ycmVjdCA9IHByb3ZlciA9PT0gY29ycmVjdFtoeXBvdGhlc2lzXVxuXG4gICAgICAgIGlmIChwcm92ZXIpIHtcbiAgICAgICAgICAgIGlmIChpc0NvcnJlY3QpIHtcbiAgICAgICAgICAgICAgICBwcm92ZXJSZXNwb25zZSA9IFwiRXhhY3RseSEgTm93IGxldCdzIGRvIHRoZSBleHBlcmltZW50LlwiXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHByb3ZlclJlc3BvbnNlID0gcmVzcG9uc2VzW3Byb3Zlcl07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgd29yZHlIeXBvdGhlc2lzID0ge1xuICAgICAgICAgICAgZmFzdGVyOiAnZmFzdGVyJyxcbiAgICAgICAgICAgIHNsb3dlcjogJ3Nsb3dlcicsXG4gICAgICAgICAgICBzYW1lOiAndGhlIHNhbWUgc3BlZWQnLFxuICAgICAgICB9W2h5cG90aGVzaXNdO1xuXG4gICAgICAgIHJldHVybiBTdGVwKF8uZXh0ZW5kKHByb3BzLCB7XG4gICAgICAgICAgICBpZDogJ2Rlc2lnbi1leHBlcmltZW50JyxcbiAgICAgICAgICAgIHRpdGxlOiAnRGVzaWduaW5nIHRoZSBFeHBlcmltZW50JyxcbiAgICAgICAgICAgIG9uVXBkYXRlOiBmdW5jdGlvbiAocHJldlByb3BzKSB7XG4gICAgICAgICAgICAgICAgaWYgKHByb3ZlciAmJiBpc0NvcnJlY3QgJiYgcHJvdmVyICE9PSBwcmV2UHJvcHMuZGF0YS5wcm92ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9wcy5vbk5leHQoKVxuICAgICAgICAgICAgICAgICAgICB9LCAyMDAwKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYm9keTogUmVhY3QuRE9NLmRpdihudWxsLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00ucChudWxsLCBcIlRvIHByb3ZlIHRoYXQgdGhlIGJhbGwgY29tZXMgb3V0IFwiLCBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcInVsaW5lXCJ9LCB3b3JkeUh5cG90aGVzaXMpLCBcIiwgd2UgY2FuIG1lYXN1cmUgdGhlIHNwZWVkIGFmdGVyIGl0IGdvZXMgZG93biBhIHJhbXAgYW5kIHRoZW4gb3ZlciBhIGhpbGwgb2YgYSBnaXZlbiBoZWlnaHQuXCIpLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00ucChudWxsLCBcIlNpbmNlIHdlIGNhbid0IG1lYXN1cmUgc3BlZWQgZGlyZWN0bHksIHdlJ2xsIG1lYXN1cmUgdGhlIHRpbWUgaXQgdGFrZXMgZm9yIHRoZSBiYWxsIHRvIHRyYXZlbCBhIHNob3J0IGZpeGVkIGRpc3RhbmNlLlwiKSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLnAobnVsbCwgXCJZb3VyIGh5cG90aGVzaXMgd2lsbCBiZSBwcm92ZW4gaWYgd2hlbiB3ZSByb2xsIGEgYmFsbCBkb3duIGEgcmFtcCwgdGhlbiBvdmVyIGEgbGFyZ2VyIGhpbGwsIHRoZSBcIiwgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJ1bGluZVwifSwgXCJ0aW1lIGl0IHRha2VzXCIpLCBcIiBmb3IgdGhlIGJhbGwgdG8gZ28gYSBmaXhlZCBkaXN0YW5jZSBpc1wiLCBcbiAgICAgICAgICAgICAgICAgICAgQnV0dG9uR3JvdXAoe1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiBcImJ0bi1ncm91cFwiLCBcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkOiBwcm92ZXIsIFxuICAgICAgICAgICAgICAgICAgICAgICAgb25TZWxlY3Q6IHByb3BzLnNldERhdGEuYmluZChudWxsLCAncHJvdmVyJyksIFxuICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uczogW1snbGVzcycsICdsZXNzIHRoYW4nXSwgWydtb3JlJywgJ21vcmUgdGhhbiddLCBbJ3NhbWUnLCAndGhlIHNhbWUgYXMnXV19KSwgXG4gICAgICAgICAgICAgICAgICAgIFwidGhlIHRpbWUgaXQgdGFrZXMgZm9yIHRoZSBiYWxsIHRvIGdvIHRoZSBzYW1lIGRpc3RhbmNlIGlmIGl0IHdlbnQgb3ZlciBhIHNtYWxsZXIgaGlsbC5cIlxuICAgICAgICAgICAgICAgICksIFxuICAgICAgICAgICAgICAgIHByb3ZlciAmJiBSZWFjdC5ET00ucCh7Y2xhc3NOYW1lOiBcImRlc2lnbl9yZXNwb25zZVwifSwgcHJvdmVyUmVzcG9uc2UpXG4gICAgICAgICAgICApXG4gICAgICAgIH0pKVxuICAgIH0sXG5cbiAgICBmdW5jdGlvbiAocHJvcHMpIHtcbiAgICAgICAgcmV0dXJuIFN0ZXAoXy5leHRlbmQocHJvcHMsIHtcbiAgICAgICAgICAgIGlkOiAnZXhwZXJpbWVudCcsXG4gICAgICAgICAgICBzdHlsZTogJ2JsYWNrJyxcbiAgICAgICAgICAgIHRpdGxlOiAnVGhlIGV4cGVyaW1lbnQnLFxuICAgICAgICAgICAgcG9zOiB7XG4gICAgICAgICAgICAgICAgbGVmdDogMzc1LFxuICAgICAgICAgICAgICAgIHRvcDogMjAwXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYm9keTogUmVhY3QuRE9NLnAobnVsbCwgXCJIZXJlIHdlIGhhdmUgdG9vbHMgdG8gY29uZHVjdCBvdXIgZXhwZXJpbWVudC5cIiArICcgJyArXG4gICAgICAgICAgICAgICAgICAgICBcIlRoZSByZWQgYW5kIGdyZWVuIHNlbnNvcnMgd2lsbCByZWNvcmQgdGhlIHRpbWUgaXQgdGFrZXMgZm9yIHRoZSBiYWxsIHRvIGdvIGEgc2hvcnQgZml4ZWQgZGlzdGFuY2UgYWZ0ZXIgZ29pbmcgb3ZlciB0aGUgaGlsbC5cIiksXG4gICAgICAgICAgICBvblJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHByb3BzLkV4ZXJjaXNlLmRyb3BPYmplY3RzKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvcHMuZGVidWcgPyBwcm9wcy5vbk5leHQoKSA6IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvcHMub25OZXh0KClcbiAgICAgICAgICAgICAgICAgICAgfSwgMjAwMCk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkpXG4gICAgfSxcblxuICAgIGZ1bmN0aW9uIChwcm9wcykge1xuICAgICAgICByZXR1cm4gU3RlcChfLmV4dGVuZChwcm9wcywge1xuICAgICAgICAgICAgaWQ6ICdkcm9wJyxcbiAgICAgICAgICAgIHN0eWxlOiAnYmxhY2snLFxuICAgICAgICAgICAgcG9zOiB7XG4gICAgICAgICAgICAgICAgdG9wOiAyMDAsXG4gICAgICAgICAgICAgICAgbGVmdDogMjAwXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYm9keTogUmVhY3QuRE9NLnAobnVsbCwgXCJXZSBjYW4gdGVzdCBvdXQgdGhpcyBoeXBvdGhlc2lzIGJ5IHJvbGxpbmcgYSBiYWxsIHN0YXJ0aW5nIGF0IHRoZSB0b3Agb2YgdGhlIHJhbXAuXCIpLFxuICAgICAgICAgICAgb25SZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBwcm9wcy5FeGVyY2lzZS5kZW1vbnN0cmF0ZURyb3AoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBwcm9wcy5vbk5leHQoKVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pKVxuICAgIH0sXG5cbiAgICBmdW5jdGlvbiAocHJvcHMpIHtcbiAgICAgICAgcmV0dXJuIFN0ZXAoXy5leHRlbmQocHJvcHMsIHtcbiAgICAgICAgICAgIGlkOiAnbG9nYm9vaycsXG4gICAgICAgICAgICBzdHlsZTogJ2JsYWNrJyxcbiAgICAgICAgICAgIHBvczoge1xuICAgICAgICAgICAgICAgIHRvcDogMTAwLFxuICAgICAgICAgICAgICAgIGxlZnQ6IDUwMFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGFycm93OiBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwiYXJyb3ctdG8taGlsbC1zbGlkZXJcIn0pLFxuICAgICAgICAgICAgYm9keTogUmVhY3QuRE9NLnAobnVsbCwgXCJXZSBjYW4gY2hhbmdlIHRoZSBoZWlnaHQgb2YgdGhlIGhpbGwgaGVyZS5cIiksXG4gICAgICAgICAgICBvblJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBwcm9wcy5vbk5leHQoKTtcbiAgICAgICAgICAgICAgICB9LCBwcm9wcy5kZWJ1ZyA/IDEwMCA6IDUwMDApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KSk7XG4gICAgfSxcblxuICAgIGZ1bmN0aW9uIChwcm9wcykge1xuICAgICAgICByZXR1cm4gU3RlcChfLmV4dGVuZChwcm9wcywge1xuICAgICAgICAgICAgaWQ6ICdhbnN3ZXInLFxuICAgICAgICAgICAgc3R5bGU6ICdibGFjaycsXG4gICAgICAgICAgICBwb3M6IHtcbiAgICAgICAgICAgICAgICB0b3A6IDE1MCxcbiAgICAgICAgICAgICAgICBsZWZ0OiAyNTBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBhcnJvdzogUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImFycm93LXRvLWFuc3dlclwifSksXG4gICAgICAgICAgICBzaG93QmFjb246IHRydWUsXG4gICAgICAgICAgICB0aXRsZTogXCJOb3cgY29uZHVjdCB0aGUgZXhwZXJpbWVudCB0byB0ZXN0IHlvdXIgaHlwb3RoZXNpcyFcIixcbiAgICAgICAgICAgIGJvZHk6IFJlYWN0LkRPTS5wKG51bGwsIFwiT25jZSB5b3UndmUgY29sbGVjdGVkIGVub3VnaCBkYXRhIGluIHlvdXIgbG9nIGJvb2ssXCIgKyAnICcgK1xuICAgICAgICAgICAgXCJkZWNpZGUgd2hldGhlciB0aGUgZGF0YSBcIiwgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJ1bGluZVwifSwgXCJzdXBwb3J0XCIpLCBcIiBvclwiLCBcbiAgICAgICAgICAgICcgJywgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJ1bGluZVwifSwgXCJkaXNwcm92ZVwiKSwgXCIgeW91ciBoeXBvdGhlc2lzLiBUaGVuXCIgKyAnICcgK1xuICAgICAgICAgICAgXCJJIHdpbGwgZXZhbHVhdGUgeW91ciBleHBlcmltZW50IGFuZCBnaXZlIHlvdSBmZWVkYmFjay5cIiksXG4gICAgICAgICAgICBuZXh0OiBcIk9rLCBJJ20gcmVhZHlcIixcbiAgICAgICAgfSkpXG4gICAgfSxcbl1cbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xuXG52YXIgV2Fsa3Rocm91Z2ggPSByZXF1aXJlKCcuL3dhbGstdGhyb3VnaC5qc3gnKVxudmFyIFBUID0gUmVhY3QuUHJvcFR5cGVzXG52YXIgU3RlcCA9IHJlcXVpcmUoJy4vc3RlcC5qc3gnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IE5ld3RvbjFJbnRybztcblxuZnVuY3Rpb24gTmV3dG9uMUludHJvKEV4ZXJjaXNlLCBnb3RIeXBvdGhlc2lzLCBkZWJ1Zykge1xuICAgIHZhciBub2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKG5vZGUpXG4gICAgUmVhY3QucmVuZGVyQ29tcG9uZW50KFdhbGt0aHJvdWdoKHtcbiAgICAgICAgc3RlcHM6IHN0ZXBzLFxuICAgICAgICBvbkh5cG90aGVzaXM6IGdvdEh5cG90aGVzaXMsXG4gICAgICAgIG9uRG9uZTogZnVuY3Rpb24gKGh5cG90aGVzaXMpIHtcbiAgICAgICAgICAgIFJlYWN0LnVubW91bnRDb21wb25lbnRBdE5vZGUobm9kZSk7XG4gICAgICAgICAgICBub2RlLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQobm9kZSk7XG4gICAgICAgIH0sXG4gICAgICAgIGRlYnVnOiBkZWJ1ZyxcbiAgICAgICAgRXhlcmNpc2U6IEV4ZXJjaXNlXG4gICAgfSksIG5vZGUpXG59XG5cblxudmFyIEJ1dHRvbkdyb3VwID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnQnV0dG9uR3JvdXAnLFxuICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogdGhpcy5wcm9wcy5jbGFzc05hbWV9LCBcbiAgICAgICAgICAgIHRoaXMucHJvcHMub3B0aW9ucy5tYXAoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICB2YXIgY2xzID0gXCJidG4gYnRuLWRlZmF1bHRcIlxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLnNlbGVjdGVkID09PSBpdGVtWzBdKSB7XG4gICAgICAgICAgICAgICAgICAgIGNscyArPSAnIGFjdGl2ZSdcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIFJlYWN0LkRPTS5idXR0b24oe2tleTogaXRlbVswXSwgY2xhc3NOYW1lOiBjbHMsIG9uQ2xpY2s6IHRoaXMucHJvcHMub25TZWxlY3QuYmluZChudWxsLCBpdGVtWzBdKX0sIGl0ZW1bMV0pO1xuICAgICAgICAgICAgfS5iaW5kKHRoaXMpKVxuICAgICAgICApO1xuICAgIH1cbn0pO1xuXG52YXIgc3RlcHMgPSBbXG4gICAgZnVuY3Rpb24gKHByb3BzKSB7XG4gICAgICAgIHJldHVybiBTdGVwKF8uZXh0ZW5kKHByb3BzLCB7XG4gICAgICAgICAgICBpZDogJ2hlbGxvJyxcbiAgICAgICAgICAgIHRpdGxlOiBcIlJlYWR5IGZvciBtb3JlIFNjaWVuY2U/XCIsXG4gICAgICAgICAgICBzaG93QmFjb246IHRydWUsXG4gICAgICAgICAgICBib2R5OiBcIkxldCdzIGdldCBvdXQgb2YgdGhlIGxhYi4gRm9yIHRoaXMgbmV4dCBleHBlcmltZW50LCBJIGtub3cganVzdCB0aGUgcGxhY2UhXCIsXG4gICAgICAgICAgICBuZXh0OiBcIkxldCdzIGdvIVwiXG4gICAgICAgIH0pKVxuICAgIH0sXG5cbiAgICBmdW5jdGlvbiAocHJvcHMpIHtcbiAgICAgICAgcmV0dXJuIFN0ZXAoXy5leHRlbmQocHJvcHMsIHtcbiAgICAgICAgICAgIGlkOiAnc3BhY2UnLFxuICAgICAgICAgICAgc3R5bGU6ICdibGFjaycsXG4gICAgICAgICAgICB0aXRsZTogXCJTcGFjZSFcIixcbiAgICAgICAgICAgIGJvZHk6IFwiVGhlIHJ1bGVzIG9mIHNjaWVuY2Ugd29yayBldmVyeXdoZXJlLCBzbyBkaXNjb3ZlcmllcyB3ZSBtYWtlIFwiICtcbiAgICAgICAgICAgICAgICBcImluIHNwYWNlIHdpbGwgYWxzbyBhcHBseSBoZXJlIG9uIEVhcnRoLiBBbiBpbXBvcnRhbnQgc2tpbGwgd2hlbiBcIiArXG4gICAgICAgICAgICAgICAgXCJkZXNpZ25pbmcgYW4gZXhwZXJpbWVudCBpcyBhdm9pZGluZyB0aGluZ3MgdGhhdCBjb3VsZCBcIiArXG4gICAgICAgICAgICAgICAgXCJpbnRlcmZlcmUgd2l0aCB0aGUgcmVzdWx0cy4gSW4gc3BhY2UsIHdlIGRvbid0IG5lZWQgXCIgK1xuICAgICAgICAgICAgICAgIFwidG8gd29ycnkgYWJvdXQgZ3Jhdml0eSBvciB3aW5kLlwiLFxuICAgICAgICAgICAgbmV4dDogXCJDb29sIVwiXG4gICAgICAgIH0pKVxuICAgIH0sXG5cbiAgICBmdW5jdGlvbiAocHJvcHMpIHtcbiAgICAgICAgdmFyIGh5cG90aGVzaXMgPSBwcm9wcy5kYXRhLmh5cG90aGVzaXNcbiAgICAgICAgcmV0dXJuIFN0ZXAoXy5leHRlbmQocHJvcHMsIHtcbiAgICAgICAgICAgIGlkOiAnZGVzY3JpcHRpb24nLFxuICAgICAgICAgICAgc3R5bGU6ICdibGFjaycsXG4gICAgICAgICAgICB0aXRsZTogXCJFeHBlcmltZW50ICMyXCIsXG4gICAgICAgICAgICBvblVwZGF0ZTogZnVuY3Rpb24gKHByZXZQcm9wcykge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLmRhdGEuaHlwb3RoZXNpcyAmJiAhcHJldlByb3BzLmRhdGEuaHlwb3RoZXNpcykge1xuICAgICAgICAgICAgICAgICAgICBwcm9wcy5vbkh5cG90aGVzaXMocHJvcHMuZGF0YS5oeXBvdGhlc2lzKTtcbiAgICAgICAgICAgICAgICAgICAgcHJvcHMuZGVidWcgPyBwcm9wcy5vbk5leHQoKSA6IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvcHMub25OZXh0KClcbiAgICAgICAgICAgICAgICAgICAgfSwgNTAwKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBib2R5OiBSZWFjdC5ET00uZGl2KG51bGwsIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5wKG51bGwsIFwiV2hhdCBoYXBwZW5zIHRvIGEgbW92aW5nIG9iamVjdCBpZiB5b3UgbGVhdmUgaXQgYWxvbmU/XCIpLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uaHIobnVsbCksIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJsYXJnZVwifSwgXCJJIHRoaW5rOlwiLCBcbiAgICAgICAgICAgICAgICAgICAgQnV0dG9uR3JvdXAoe1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiBcIndhbGt0aHJvdWdoX2h5cG90aGVzZXNcIiwgXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZDogaHlwb3RoZXNpcywgXG4gICAgICAgICAgICAgICAgICAgICAgICBvblNlbGVjdDogcHJvcHMuc2V0RGF0YS5iaW5kKG51bGwsICdoeXBvdGhlc2lzJyksIFxuICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uczogW1tcImZhc3RlclwiLCBcIkl0IHNwZWVkcyB1cFwiXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBbXCJzbG93ZXJcIiwgXCJJdCBzbG93cyBkb3duXCJdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtcInNhbWVcIiwgXCJJdCBzdGF5cyBhdCB0aGUgc2FtZSBzcGVlZCBmb3JldmVyXCJdXX0pXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIC8qKmh5cG90aGVzaXMgJiYgPHAgY2xhc3NOYW1lPVwid2Fsa3Rocm91Z2hfZ3JlYXRcIj5HcmVhdCEgTm93IHdlIGRvIHNjaWVuY2U8L3A+KiovXG4gICAgICAgICAgICApXG4gICAgICAgIH0pKVxuICAgIH0sXG5cbiAgICBmdW5jdGlvbiAocHJvcHMpIHtcbiAgICAgICAgdmFyIHByb3ZlciA9IHByb3BzLmRhdGEucHJvdmVyXG4gICAgICAgIHZhciBoeXBvdGhlc2lzID0gcHJvcHMuZGF0YS5oeXBvdGhlc2lzXG5cbiAgICAgICAgdmFyIHJlc3BvbnNlcyA9IHtcbiAgICAgICAgICAgICdtb3JlJzogJ05vcGUuIFRoYXQgd291bGQgc2hvdyB0aGF0IHRoZSBvYmplY3QgZ2V0cyBmYXN0ZXIuJyxcbiAgICAgICAgICAgICdsZXNzJzogJ05vcGUuIFRoYXQgd291bGQgc2hvdyB0aGF0IHRoZSBvYmplY3QgZ2V0cyBzbG93ZXIuJyxcbiAgICAgICAgICAgICdzYW1lJzogJ05vcGUuIFRoYXQgd291bGQgc2hvdyB0aGF0IHRoZSBvYmplY3Qgc3RheXMgdGhlIHNhbWUgc3BlZWQuJ1xuICAgICAgICB9XG4gICAgICAgIHZhciBjb3JyZWN0ID0ge1xuICAgICAgICAgICAgJ2Zhc3Rlcic6ICdtb3JlJyxcbiAgICAgICAgICAgICdzbG93ZXInOiAnbGVzcycsXG4gICAgICAgICAgICAnc2FtZSc6ICdzYW1lJ1xuICAgICAgICB9XG4gICAgICAgIHZhciBwcm92ZXJSZXNwb25zZVxuICAgICAgICB2YXIgaXNDb3JyZWN0ID0gcHJvdmVyID09PSBjb3JyZWN0W2h5cG90aGVzaXNdXG5cbiAgICAgICAgaWYgKHByb3Zlcikge1xuICAgICAgICAgICAgaWYgKGlzQ29ycmVjdCkge1xuICAgICAgICAgICAgICAgIHByb3ZlclJlc3BvbnNlID0gXCJFeGFjdGx5ISBOb3cgbGV0J3MgZG8gdGhlIGV4cGVyaW1lbnQuXCJcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcHJvdmVyUmVzcG9uc2UgPSByZXNwb25zZXNbcHJvdmVyXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBjdXJyZW50SHlwb3RoZXNpcyA9IHtcbiAgICAgICAgICAgIGZhc3RlcjogJ21vdmluZyBvYmplY3RzIGdldCBmYXN0ZXIgb3ZlciB0aW1lJyxcbiAgICAgICAgICAgIHNsb3dlcjogJ21vdmluZyBvYmplY3RzIGdldCBzbG93ZXIgb3ZlciB0aW1lJyxcbiAgICAgICAgICAgIHNhbWU6IFwibW92aW5nIG9iamVjdHMgZG9uJ3QgY2hhbmdlIGluIHNwZWVkIG92ZXIgdGltZVwiXG4gICAgICAgIH1baHlwb3RoZXNpc107XG5cbiAgICAgICAgcmV0dXJuIFN0ZXAoXy5leHRlbmQocHJvcHMsIHtcbiAgICAgICAgICAgIGlkOiAnZGVzaWduLWV4cGVyaW1lbnQnLFxuICAgICAgICAgICAgc3R5bGU6ICdibGFjaycsXG4gICAgICAgICAgICB0aXRsZTogJ0Rlc2lnbmluZyB0aGUgRXhwZXJpbWVudCcsXG4gICAgICAgICAgICBvblVwZGF0ZTogZnVuY3Rpb24gKHByZXZQcm9wcykge1xuICAgICAgICAgICAgICAgIGlmIChwcm92ZXIgJiYgaXNDb3JyZWN0ICYmIHByb3ZlciAhPT0gcHJldlByb3BzLmRhdGEucHJvdmVyKSB7XG4gICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvcHMub25OZXh0KClcbiAgICAgICAgICAgICAgICAgICAgfSwgMjAwMCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGJvZHk6IFJlYWN0LkRPTS5kaXYobnVsbCwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLnAobnVsbCwgXCJUbyBwcm92ZSB0aGF0IFwiLCBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcInVsaW5lXCJ9LCBjdXJyZW50SHlwb3RoZXNpcyksIFwiLFwiICsgJyAnICtcbiAgICAgICAgICAgICAgICBcIndlIGNhbiBtZWFzdXJlIHRoZSB0aW1lIHRoYXQgaXQgdGFrZXMgZm9yIGFuIGFzdGVyb2lkIHRvIG1vdmUgMTAwIG1ldGVycyxcIiArICcgJyArXG4gICAgICAgICAgICAgICAgXCJ0aGVuIG1lYXN1cmUgdGhlIHRpbWUgdG8gbW92ZSBhbm90aGVyIDEwMCBtZXRlcnMuXCIpLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00ucChudWxsLCBcIllvdXIgaHlwb3RoZXNpcyB3aWxsIGJlIHByb3ZlbiBpZiB0aGUgXCIsIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwidWxpbmVcIn0sIFwidGltZSB0byB0cmF2ZWwgdGhlIGZpcnN0IDEwMG1cIiksIFwiIGlzXCIsIFxuICAgICAgICAgICAgICAgICAgICBCdXR0b25Hcm91cCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU6IFwiYnRuLWdyb3VwXCIsIFxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWQ6IHByb3ZlciwgXG4gICAgICAgICAgICAgICAgICAgICAgICBvblNlbGVjdDogcHJvcHMuc2V0RGF0YS5iaW5kKG51bGwsICdwcm92ZXInKSwgXG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zOiBbWydsZXNzJywgJ2xlc3MgdGhhbiddLCBbJ21vcmUnLCAnbW9yZSB0aGFuJ10sIFsnc2FtZScsICd0aGUgc2FtZSBhcyddXX0pLCBcbiAgICAgICAgICAgICAgICAgICAgXCJ0aGUgXCIsIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwidWxpbmVcIn0sIFwidGltZSB0byB0cmF2ZWwgdGhlIG5leHQgMTAwbVwiKSwgXCIuXCJcbiAgICAgICAgICAgICAgICApLCBcbiAgICAgICAgICAgICAgICBwcm92ZXIgJiYgUmVhY3QuRE9NLnAoe2NsYXNzTmFtZTogXCJkZXNpZ25fcmVzcG9uc2Vfd2hpdGVcIn0sIHByb3ZlclJlc3BvbnNlKVxuICAgICAgICAgICAgKVxuICAgICAgICB9KSlcbiAgICB9LFxuXG4gICAgZnVuY3Rpb24gKHByb3BzKSB7XG4gICAgICAgIHJldHVybiBTdGVwKF8uZXh0ZW5kKHByb3BzLCB7XG4gICAgICAgICAgICBpZDogJ2Ryb3AnLFxuICAgICAgICAgICAgc3R5bGU6ICdibGFjaycsXG4gICAgICAgICAgICBwb3M6IHtcbiAgICAgICAgICAgICAgICB0b3A6IDIwMCxcbiAgICAgICAgICAgICAgICBsZWZ0OiAyMDBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBib2R5OiBSZWFjdC5ET00ucChudWxsLCBcIldlIGNhbiB0ZXN0IG91dCB0aGlzIGh5cG90aGVzaXMgYnkgdGhyb3dpbmcgYW4gYXN0ZXJvaWRcIiArICcgJyArXG4gICAgICAgICAgICAgICAgICAgICBcInRocm91Z2ggdGhlIGdyZWVuIHNlbnNvcnMsIHdoaWNoIGFyZSBldmVubHktc3BhY2VkLiBUcnlcIiArICcgJyArXG4gICAgICAgICAgICAgICAgICAgICBcInRocm93aW5nIGF0IGRpZmZlcmVudCBzcGVlZHMhXCIpLFxuICAgICAgICAgICAgb25SZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBwcm9wcy5FeGVyY2lzZS5kZW1vbnN0cmF0ZVNhbXBsZShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHByb3BzLm9uTmV4dCgpXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkpXG4gICAgfSxcblxuICAgIGZ1bmN0aW9uIChwcm9wcykge1xuICAgICAgICByZXR1cm4gU3RlcChfLmV4dGVuZChwcm9wcywge1xuICAgICAgICAgICAgaWQ6ICdsb2dib29rJyxcbiAgICAgICAgICAgIHN0eWxlOiAnYmxhY2snLFxuICAgICAgICAgICAgcG9zOiB7XG4gICAgICAgICAgICAgICAgdG9wOiAxMDAsXG4gICAgICAgICAgICAgICAgbGVmdDogNTAwXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYXJyb3c6IFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJhcnJvdy10by1sb2dib29rLW5ld3RvbjFcIn0pLFxuICAgICAgICAgICAgYm9keTogUmVhY3QuRE9NLnAobnVsbCwgXCJOb3RpY2UgdGhhdCBib3RoIHRpbWVzIHNob3cgdXAgaW4gdGhlIGxvZyBib29rLlwiKSxcbiAgICAgICAgICAgIG9uUmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHByb3BzLm9uTmV4dCgpO1xuICAgICAgICAgICAgICAgIH0sIHByb3BzLmRlYnVnID8gMTAwIDogNTAwMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pKTtcbiAgICB9LFxuXG4gICAgZnVuY3Rpb24gKHByb3BzKSB7XG4gICAgICAgIHJldHVybiBTdGVwKF8uZXh0ZW5kKHByb3BzLCB7XG4gICAgICAgICAgICBpZDogJ2Fuc3dlcicsXG4gICAgICAgICAgICBzdHlsZTogJ2JsYWNrJyxcbiAgICAgICAgICAgIHBvczoge1xuICAgICAgICAgICAgICAgIHRvcDogMTUwLFxuICAgICAgICAgICAgICAgIGxlZnQ6IDI1MFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGFycm93OiBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwiYXJyb3ctdG8tYW5zd2VyXCJ9KSxcbiAgICAgICAgICAgIHNob3dCYWNvbjogdHJ1ZSxcbiAgICAgICAgICAgIHRpdGxlOiBcIk5vdyBjb25kdWN0IHRoZSBleHBlcmltZW50IHRvIHRlc3QgeW91ciBoeXBvdGhlc2lzIVwiLFxuICAgICAgICAgICAgYm9keTogUmVhY3QuRE9NLnAobnVsbCwgXCJPbmNlIHlvdSd2ZSBjb2xsZWN0ZWQgZW5vdWdoIGRhdGEgaW4geW91ciBsb2cgYm9vayxcIiArICcgJyArXG4gICAgICAgICAgICBcImRlY2lkZSB3aGV0aGVyIHRoZSBkYXRhIFwiLCBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcInVsaW5lXCJ9LCBcInN1cHBvcnRcIiksIFwiIG9yXCIsIFxuICAgICAgICAgICAgJyAnLCBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcInVsaW5lXCJ9LCBcImRpc3Byb3ZlXCIpLCBcIiB5b3VyIGh5cG90aGVzaXMuIFRoZW5cIiArICcgJyArXG4gICAgICAgICAgICBcIkkgd2lsbCBldmFsdWF0ZSB5b3VyIGV4cGVyaW1lbnQgYW5kIGdpdmUgeW91IGZlZWRiYWNrLlwiKSxcbiAgICAgICAgICAgIG5leHQ6IFwiT2ssIEknbSByZWFkeVwiLFxuICAgICAgICB9KSlcbiAgICB9LFxuXVxuIiwiLyoqIEBqc3ggUmVhY3QuRE9NICovXG5cbnZhciBQVCA9IFJlYWN0LlByb3BUeXBlc1xudmFyIGN4ID0gUmVhY3QuYWRkb25zLmNsYXNzU2V0XG5cbnZhciBTdGVwID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnU3RlcCcsXG4gICAgcHJvcFR5cGVzOiB7XG4gICAgICAgIHRpdGxlOiBQVC5zdHJpbmcsXG4gICAgICAgIG5leHQ6IFBULnN0cmluZyxcbiAgICAgICAgb25SZW5kZXI6IFBULmZ1bmMsXG4gICAgICAgIG9uRmFkZWRPdXQ6IFBULmZ1bmMsXG4gICAgICAgIHNob3dCYWNvbjogUFQuYm9vbCxcbiAgICAgICAgZmFkZU91dDogUFQuYm9vbCxcbiAgICB9LFxuXG4gICAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzdHlsZTogJ3doaXRlJ1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLm9uUmVuZGVyKSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uUmVuZGVyKClcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmdldERPTU5vZGUoKS5hZGRFdmVudExpc3RlbmVyKCd0cmFuc2l0aW9uZW5kJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMuZmFkZU91dCkge1xuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMub25GYWRlZE91dCgpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0uYmluZCh0aGlzKSlcbiAgICB9LFxuXG4gICAgY29tcG9uZW50RGlkVXBkYXRlOiBmdW5jdGlvbiAocHJldlByb3BzKSB7XG4gICAgICAgIGlmIChwcmV2UHJvcHMuaWQgIT09IHRoaXMucHJvcHMuaWQgJiZcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25SZW5kZXIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm9uUmVuZGVyKClcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5wcm9wcy5vblVwZGF0ZSkge1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5vblVwZGF0ZS5jYWxsKHRoaXMsIHByZXZQcm9wcylcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHN0eWxlXG4gICAgICAgIGlmICh0aGlzLnByb3BzLnBvcykge1xuICAgICAgICAgICAgc3R5bGUgPSB7XG4gICAgICAgICAgICAgICAgbWFyZ2luVG9wOiAwLFxuICAgICAgICAgICAgICAgIG1hcmdpbkxlZnQ6IDAsXG4gICAgICAgICAgICAgICAgdG9wOiB0aGlzLnByb3BzLnBvcy50b3AgKyAncHgnLFxuICAgICAgICAgICAgICAgIGxlZnQ6IHRoaXMucHJvcHMucG9zLmxlZnQgKyAncHgnXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogY3goe1xuICAgICAgICAgICAgXCJ3YWxrdGhyb3VnaFwiOiB0cnVlLFxuICAgICAgICAgICAgXCJ3YWxrdGhyb3VnaC0td2hpdGVcIjogdGhpcy5wcm9wcy5zdHlsZSA9PT0gJ3doaXRlJyxcbiAgICAgICAgICAgIFwid2Fsa3Rocm91Z2gtLWJsYWNrXCI6IHRoaXMucHJvcHMuc3R5bGUgPT09ICdibGFjaydcbiAgICAgICAgfSl9LCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogY3goe1xuICAgICAgICAgICAgICAgIFwid2Fsa3Rocm91Z2hfc3RlcFwiOiB0cnVlLFxuICAgICAgICAgICAgICAgIFwid2Fsa3Rocm91Z2hfc3RlcC0tZmFkZS1vdXRcIjogdGhpcy5wcm9wcy5mYWRlT3V0XG4gICAgICAgICAgICB9KSArIFwiIHdhbGt0aHJvdWdoX3N0ZXAtLVwiICsgdGhpcy5wcm9wcy5pZCwgc3R5bGU6IHN0eWxlfSwgXG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5zaG93QmFjb24gJiYgUmVhY3QuRE9NLmltZyh7Y2xhc3NOYW1lOiBcIndhbGt0aHJvdWdoX3Npci1mcmFuY2lzXCIsIHNyYzogXCJpbWFnZXMvc2lyLWZyYW5jaXMtdHJhbnNwYXJlbnQyLmdpZlwifSksIFxuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMudGl0bGUgJiZcbiAgICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcIndhbGt0aHJvdWdoX3RpdGxlXCJ9LCB0aGlzLnByb3BzLnRpdGxlKSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcIndhbGt0aHJvdWdoX2JvZHlcIn0sIFxuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLmJvZHlcbiAgICAgICAgICAgICAgICApLCBcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLmFycm93IHx8IGZhbHNlLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwid2Fsa3Rocm91Z2hfYnV0dG9uc1wifSwgXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMubmV4dCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLmJ1dHRvbih7b25DbGljazogdGhpcy5wcm9wcy5vbk5leHQsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogXCJ3YWxrdGhyb3VnaF9uZXh0IGJ0biBidG4tZGVmYXVsdFwifSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5uZXh0XG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKVxuICAgICAgICApXG4gICAgfVxufSlcblxubW9kdWxlLmV4cG9ydHMgPSBTdGVwXG4iLCIvKiogQGpzeCBSZWFjdC5ET00gKi9cblxudmFyIFdhbGtUaHJvdWdoID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnV2Fsa1Rocm91Z2gnLFxuICAgIHByb3BUeXBlczoge1xuICAgICAgICBzdGVwczogUmVhY3QuUHJvcFR5cGVzLmFycmF5LmlzUmVxdWlyZWQsXG4gICAgICAgIG9uRG9uZTogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsXG4gICAgICAgIGRlYnVnOiBSZWFjdC5Qcm9wVHlwZXMuYm9vbFxuICAgIH0sXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzdGVwOiAwLFxuICAgICAgICAgICAgZGF0YToge30sXG4gICAgICAgICAgICBmYWRpbmc6IGZhbHNlXG4gICAgICAgIH1cbiAgICB9LFxuICAgIG9uRmFkZWRPdXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuZmFkaW5nID09PSBmYWxzZSkge1xuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5nb1RvKHRoaXMuc3RhdGUuZmFkaW5nKVxuICAgIH0sXG4gICAgZ29UbzogZnVuY3Rpb24gKG51bSkge1xuICAgICAgICBpZiAobnVtID49IHRoaXMucHJvcHMuc3RlcHMubGVuZ3RoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5vbkRvbmUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm9uRG9uZSgpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldFN0YXRlKHtzdGVwOiBudW0sIGZhZGluZzogZmFsc2V9KVxuICAgIH0sXG4gICAgc3RhcnRHb2luZzogZnVuY3Rpb24gKG51bSkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtmYWRpbmc6IG51bX0pXG4gICAgfSxcbiAgICBzZXREYXRhOiBmdW5jdGlvbiAoYXR0ciwgdmFsKSB7XG4gICAgICAgIHZhciBkYXRhID0gXy5leHRlbmQoe30sIHRoaXMuc3RhdGUuZGF0YSlcbiAgICAgICAgZGF0YVthdHRyXSA9IHZhbFxuICAgICAgICB0aGlzLnNldFN0YXRlKHtkYXRhOiBkYXRhfSlcbiAgICB9LFxuICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgU3RlcCA9IHRoaXMucHJvcHMuc3RlcHNbdGhpcy5zdGF0ZS5zdGVwXVxuICAgICAgICB2YXIgcHJvcHMgPSB7XG4gICAgICAgICAgICBvbk5leHQ6IHRoaXMuc3RhcnRHb2luZy5iaW5kKG51bGwsIHRoaXMuc3RhdGUuc3RlcCArIDEpLFxuICAgICAgICAgICAgc2V0RGF0YTogdGhpcy5zZXREYXRhLFxuICAgICAgICAgICAgZGF0YTogdGhpcy5zdGF0ZS5kYXRhLFxuICAgICAgICAgICAgZmFkZU91dDogdGhpcy5zdGF0ZS5mYWRpbmcgIT09IGZhbHNlLFxuICAgICAgICAgICAgb25GYWRlZE91dDogdGhpcy5vbkZhZGVkT3V0LFxuICAgICAgICAgICAgZGVidWc6IHRoaXMucHJvcHMuZGVidWdcbiAgICAgICAgfVxuICAgICAgICBmb3IgKHZhciBuYW1lIGluIHRoaXMucHJvcHMpIHtcbiAgICAgICAgICAgIHByb3BzW25hbWVdID0gdGhpcy5wcm9wc1tuYW1lXVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBTdGVwKHByb3BzKVxuICAgIH1cbn0pXG5cbm1vZHVsZS5leHBvcnRzID0gV2Fsa1Rocm91Z2hcblxuIiwiXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IExvZ0Jvb2s7XG5cbmZ1bmN0aW9uIExvZ0Jvb2sod29ybGQsIGVsZW0sIGtlZXAsIHNlZWRlZENvbHVtbnMsIGhpZGVBdmcpIHtcbiAgICB0aGlzLl9hdHRhY2god29ybGQsIGVsZW0sIGtlZXAsIHNlZWRlZENvbHVtbnMsIGhpZGVBdmcpO1xufVxuXG5Mb2dCb29rLnByb3RvdHlwZS5fYXR0YWNoID0gZnVuY3Rpb24gKHdvcmxkLCBlbGVtLCBrZWVwLCBzZWVkZWRDb2x1bW5zLCBoaWRlQXZnKSB7XG4gICAgY29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBjb250YWluZXIuY2xhc3NOYW1lID0gXCJsb2ctYm9va1wiO1xuICAgIGVsZW0uYXBwZW5kQ2hpbGQoY29udGFpbmVyKTtcbiAgICBoZWFkZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKTtcbiAgICBoZWFkZXIuY2xhc3NOYW1lID0gXCJsb2ctYm9vay1oZWFkZXJcIjtcbiAgICBoZWFkZXIuaW5uZXJIVE1MID0gXCJMb2cgQm9va1wiO1xuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChoZWFkZXIpO1xuICAgIGJvZHlDb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIGJvZHlDb250YWluZXIuY2xhc3NOYW1lID0gXCJsb2ctYm9vay1ib2R5XCI7XG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGJvZHlDb250YWluZXIpO1xuICAgIHRoaXMuYm9keUNvbnRhaW5lciA9IGJvZHlDb250YWluZXI7XG4gICAgdGhpcy5oaWRlQXZnID0gaGlkZUF2ZztcblxuICAgIHRoaXMuY29sdW1uc0J5Qm9keU5hbWUgPSB7fTtcbiAgICB0aGlzLmxhc3RVaWRzID0ge307XG4gICAgdGhpcy5zdGFydFRpbWVCeUJvZHlOYW1lID0ge307XG4gICAgdGhpcy5kYXRhID0ge307XG4gICAgdGhpcy5rZWVwID0ga2VlcDtcbiAgICB0aGlzLndvcmxkID0gd29ybGQ7XG4gICAgd29ybGQub24oJ3N0ZXAnLCB0aGlzLmhhbmRsZVRpY2suYmluZCh0aGlzKSk7XG5cbiAgICBpZiAoc2VlZGVkQ29sdW1ucykge1xuICAgICAgICBfLmVhY2goc2VlZGVkQ29sdW1ucywgZnVuY3Rpb24gKGNvbCkge1xuICAgICAgICAgICAgdGhpcy5hZGRDb2x1bW4oY29sLm5hbWUsIGNvbC5leHRyYVRleHQsIGNvbC5jb2xvcik7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfVxufVxuXG5Mb2dCb29rLnByb3RvdHlwZS5oYW5kbGVTdGFydCA9IGZ1bmN0aW9uKGNvbE5hbWUsIHVpZCkge1xuICAgIGlmICghdGhpcy5zdGFydFRpbWVCeUJvZHlOYW1lW2NvbE5hbWVdKSB7XG4gICAgICAgIHRoaXMubmV3VGltZXIoY29sTmFtZSk7XG4gICAgfVxuICAgIHRoaXMubGFzdFVpZHNbY29sTmFtZV0gPSB1aWQ7XG4gICAgdGhpcy5zdGFydFRpbWVCeUJvZHlOYW1lW2NvbE5hbWVdID0gdGhpcy53b3JsZC5fdGltZTtcbiAgICB0aGlzLnJlbmRlclRpbWVyKGNvbE5hbWUsIDApO1xufVxuXG5Mb2dCb29rLnByb3RvdHlwZS5oYW5kbGVFbmQgPSBmdW5jdGlvbihjb2xOYW1lLCB1aWQpIHtcbiAgICBpZiAoY29sTmFtZSBpbiB0aGlzLmRhdGEgJiZcbiAgICAgICAgICAgIHRoaXMubGFzdFVpZHNbY29sTmFtZV0gPT0gdWlkKSB7XG4gICAgICAgIHRoaXMuZGF0YVtjb2xOYW1lXS5wdXNoKFxuICAgICAgICAgICAgdGhpcy53b3JsZC5fdGltZSAtIHRoaXMuc3RhcnRUaW1lQnlCb2R5TmFtZVtjb2xOYW1lXSk7XG4gICAgICAgIGRlbGV0ZSB0aGlzLnN0YXJ0VGltZUJ5Qm9keU5hbWVbY29sTmFtZV07XG4gICAgICAgIGRlbGV0ZSB0aGlzLmxhc3RVaWRzW2NvbE5hbWVdO1xuICAgICAgICBpZiAoIXRoaXMuaGlkZUF2Zykge1xuICAgICAgICAgICAgdmFyIGF2ZyA9IGNsZWFuKHV0aWwuYXZnKHRoaXMuZGF0YVtjb2xOYW1lXSkpO1xuICAgICAgICAgICAgJCh0aGlzLmNvbHVtbnNCeUJvZHlOYW1lW2NvbE5hbWVdKVxuICAgICAgICAgICAgICAgIC5maW5kKCcubG9nLWJvb2stYXZnJykudGV4dCgnQXZnOiAnICsgYXZnKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuTG9nQm9vay5wcm90b3R5cGUuaGFuZGxlVGljayA9IGZ1bmN0aW9uICgpIHtcbiAgICBuZXdUaW1lID0gdGhpcy53b3JsZC5fdGltZTtcbiAgICAkLmVhY2godGhpcy5zdGFydFRpbWVCeUJvZHlOYW1lLCBmdW5jdGlvbiAobmFtZSwgc3RhcnRUaW1lKSB7XG4gICAgICAgIHRoaXMucmVuZGVyVGltZXIobmFtZSwgbmV3VGltZSAtIHN0YXJ0VGltZSk7XG4gICAgfS5iaW5kKHRoaXMpKTtcbn1cblxuTG9nQm9vay5wcm90b3R5cGUuYWRkQ29sdW1uID0gZnVuY3Rpb24gKG5hbWUsIGV4dHJhVGV4dCwgY29sb3IpIHtcbiAgICBleHRyYVRleHQgPSBleHRyYVRleHQgfHwgXCJcIjtcbiAgICB2YXIgY29sdW1uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBjb2x1bW4uY2xhc3NOYW1lID0gXCJsb2ctYm9vay1jb2x1bW5cIjtcbiAgICB2YXIgaGVhZGluZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpO1xuICAgIGhlYWRpbmcuY2xhc3NOYW1lID0gXCJsb2ctYm9vay1oZWFkaW5nXCI7XG4gICAgaGVhZGluZy5pbm5lckhUTUwgPSBuYW1lICsgZXh0cmFUZXh0O1xuICAgIC8qKiBEaXNhYmxpbmcgdW50aWwgd2UgZmluZCBzb21ldGhpbmcgdGhhdCBsb29rcyBncmVhdFxuICAgIGlmIChjb2xvcikge1xuICAgICAgICBoZWFkaW5nLnN0eWxlLmJhY2tncm91bmRDb2xvciA9IGNvbG9yO1xuICAgIH1cbiAgICAqL1xuICAgIGNvbHVtbi5hcHBlbmRDaGlsZChoZWFkaW5nKTtcbiAgICBpZiAoIXRoaXMuaGlkZUF2Zykge1xuICAgICAgICB2YXIgYXZlcmFnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgIGF2ZXJhZ2UuY2xhc3NOYW1lID0gJ2xvZy1ib29rLWF2Zyc7XG4gICAgICAgIGF2ZXJhZ2UuaW5uZXJIVE1MID0gJy0tJztcbiAgICAgICAgY29sdW1uLmFwcGVuZENoaWxkKGF2ZXJhZ2UpO1xuICAgIH1cbiAgICB0aGlzLmluc2VydENvbHVtbihuYW1lLCBjb2x1bW4pOyAvLyB3aWxsIGluc2VydCBpdCBhdCB0aGUgcmlnaHQgcG9pbnQuXG4gICAgdGhpcy5jb2x1bW5zQnlCb2R5TmFtZVtuYW1lXSA9IGNvbHVtbjtcbiAgICB0aGlzLmRhdGFbbmFtZV0gPSBbXTtcbiAgICAvLyBzZWVkIHRoZSBjb2x1bW4gd2l0aCBibGFua3NcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMua2VlcDsgaSsrKSB7XG4gICAgICAgIHRoaXMubmV3VGltZXIobmFtZSk7XG4gICAgfVxufVxuXG5Mb2dCb29rLnByb3RvdHlwZS5pbnNlcnRDb2x1bW4gPSBmdW5jdGlvbiAobmFtZSwgY29sdW1uKSB7XG4gICAgLy8gaW5zZXJ0IHRoZSBjb2x1bW4gaW4gb3JkZXIuICB0aGlzIGlzIGEgYml0IGFyYml0cmFyeSBzaW5jZSB3ZSBkb24ndCBrbm93XG4gICAgLy8gd2hhdCB0aGUgc29ydCBvcmRlciBzaG91bGQgcmVhbGx5IGJlLCBzbyB3ZSBqdXN0IHB1dCBzdHJpbmdzIHdpdGhvdXRcbiAgICAvLyBudW1iZXJzLCB0aGVuIHN0cmluZ3MgdGhhdCBzdGFydCB3aXRoIGEgbnVtYmVyLlxuICAgIHZhciBrZXlmbiA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgIC8vIGlmIHRoZSBuYW1lIHN0YXJ0cyB3aXRoIGEgbnVtYmVyLCBzb3J0IGJ5IHRoYXQsIHRoZW4gdGhlIGZ1bGwgbmFtZS5cbiAgICAgICAgLy8gb3RoZXJ3aXNlLCBwdXQgaXQgYWZ0ZXIgbnVtYmVycywgYW5kIHNvcnQgYnkgdGhlIGZ1bGwgbmFtZS5cbiAgICAgICAgdmFyIG51bSA9IHBhcnNlSW50KG5hbWUpO1xuICAgICAgICBpZiAoaXNOYU4obnVtKSkge1xuICAgICAgICAgICAgbnVtID0gSW5maW5pdHk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFtudW0sIG5hbWVdO1xuICAgIH1cbiAgICB2YXIgaW5zZXJ0ZWQgPSBmYWxzZTtcbiAgICAkKHRoaXMuYm9keUNvbnRhaW5lcikuZmluZChcIi5sb2ctYm9vay1oZWFkaW5nXCIpLmVhY2goZnVuY3Rpb24gKGksIHNwYW4pIHtcbiAgICAgICAgdmFyIGsxID0ga2V5Zm4obmFtZSk7XG4gICAgICAgIHZhciBrMiA9IGtleWZuKCQoc3BhbikuaHRtbCgpKTtcbiAgICAgICAgaWYgKGsxWzBdIDwgazJbMF0gfHwgKGsxWzBdID09IGsyWzBdICYmIGsxWzFdIDwgazJbMV0pKSB7XG4gICAgICAgICAgICAkKHNwYW4pLnBhcmVudCgpLmJlZm9yZShjb2x1bW4pO1xuICAgICAgICAgICAgY29uc29sZS5sb2coc3Bhbik7XG4gICAgICAgICAgICBpbnNlcnRlZCA9IHRydWU7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7IC8vYnJlYWtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIGlmICghaW5zZXJ0ZWQpIHtcbiAgICAgICAgLy8gaWYgaXQncyB0aGUgYmlnZ2VzdCwgcHV0IGl0IGF0IHRoZSBlbmQuXG4gICAgICAgIHRoaXMuYm9keUNvbnRhaW5lci5hcHBlbmRDaGlsZChjb2x1bW4pO1xuICAgICAgICBjb25zb2xlLmxvZyh0aGlzLmJvZHlDb250YWluZXIpO1xuICAgIH1cbn1cblxuTG9nQm9vay5wcm90b3R5cGUubmV3VGltZXIgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgLy8ganVzdCBkb2VzIHRoZSBET00gc2V0dXAsIGRvZXNuJ3QgYWN0dWFsbHkgc3RhcnQgdGhlIHRpbWVyXG4gICAgaWYgKCF0aGlzLmNvbHVtbnNCeUJvZHlOYW1lW25hbWVdKSB7XG4gICAgICAgIHRoaXMuYWRkQ29sdW1uKG5hbWUpO1xuICAgIH1cbiAgICB2YXIgY29sID0gdGhpcy5jb2x1bW5zQnlCb2R5TmFtZVtuYW1lXTtcbiAgICB2YXIgdG9SZW1vdmUgPSAkKGNvbCkuZmluZChcIi5sb2ctYm9vay1kYXR1bVwiKS5zbGljZSgwLC10aGlzLmtlZXArMSk7XG4gICAgdG9SZW1vdmUuc2xpZGVVcCg1MDAsIGZ1bmN0aW9uICgpIHt0b1JlbW92ZS5yZW1vdmUoKTt9KTtcbiAgICB0aGlzLmRhdGFbbmFtZV0gPSB0aGlzLmRhdGFbbmFtZV0uc2xpY2UoLXRoaXMua2VlcCsxKTtcbiAgICB2YXIgZGF0dW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKTtcbiAgICBkYXR1bS5jbGFzc05hbWUgPSBcImxvZy1ib29rLWRhdHVtXCI7XG5cbiAgICBpZiAoIXRoaXMuaGlkZUF2Zykge1xuICAgICAgICB2YXIgYXZnID0gY2xlYW4odXRpbC5hdmcodGhpcy5kYXRhW25hbWVdKSk7XG4gICAgICAgICQoY29sKS5maW5kKCcubG9nLWJvb2stYXZnJykudGV4dCgnQXZnOiAnICsgYXZnKTtcbiAgICB9XG5cbiAgICBjb2wuYXBwZW5kQ2hpbGQoZGF0dW0pO1xuICAgIHRoaXMucmVuZGVyVGltZXIobmFtZSk7XG59XG5cbmZ1bmN0aW9uIGNsZWFuKHRpbWUpIHtcbiAgICByZXR1cm4gcGFyc2VGbG9hdCh0aW1lIC8gMTAwMCkudG9GaXhlZCgyKSArICdzJztcbn1cblxuTG9nQm9vay5wcm90b3R5cGUucmVuZGVyVGltZXIgPSBmdW5jdGlvbiAobmFtZSwgdGltZSkge1xuICAgIHZhciBkYXR1bSA9IHRoaXMuY29sdW1uc0J5Qm9keU5hbWVbbmFtZV0ubGFzdENoaWxkO1xuICAgIGlmICh0aW1lKSB7XG4gICAgICAgIGRhdHVtLmlubmVySFRNTCA9IGNsZWFuKHRpbWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGRhdHVtLmlubmVySFRNTCA9IFwiLS1cIjtcbiAgICAgICAgZGF0dW0uc3R5bGUudGV4dEFsaWduID0gXCJjZW50ZXJcIjtcbiAgICB9XG59XG4iLCJ2YXIgR2F0ZSA9IHJlcXVpcmUoJy4vZ2F0ZScpO1xudmFyIEdyYXBoID0gcmVxdWlyZSgnLi9ncmFwaCcpO1xudmFyIEJhc2UgPSByZXF1aXJlKCcuL2Jhc2UnKTtcbnZhciBTdG9wd2F0Y2ggPSByZXF1aXJlKCcuL3N0b3B3YXRjaCcpO1xudmFyIFBsYXlQYXVzZSA9IHJlcXVpcmUoJy4vcGxheXBhdXNlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gQmFzZS5leHRlbmQoZnVuY3Rpb24gT3JiaXQoY29udGFpbmVyLCBvcHRpb25zKSB7XG4gICAgQmFzZS5jYWxsKHRoaXMsIGNvbnRhaW5lciwgb3B0aW9ucywgXCJpbWFnZXMvc3BhY2VfYmFja2dyb3VuZC5qcGdcIilcbn0sIHtcbiAgICBzZXR1cDogZnVuY3Rpb24gKGNvbnRhaW5lcikge1xuICAgICAgICB2YXIgd29ybGQgPSB0aGlzLndvcmxkO1xuICAgICAgICB2YXIgZCA9IDQuMDtcbiAgICAgICAgdmFyIHYgPSAwLjM2O1xuICAgICAgICB2YXIgY2lyY2xlMSA9IFBoeXNpY3MuYm9keSgnY2lyY2xlJywge1xuICAgICAgICAgICAgeDogdGhpcy5vcHRpb25zLndpZHRoIC8gMiAtIGQvMlxuICAgICAgICAgICAgLHk6IDIwMFxuICAgICAgICAgICAgLHZ4OiB2XG4gICAgICAgICAgICAscmFkaXVzOiAyXG4gICAgICAgICAgICAsbWFzczogMVxuICAgICAgICAgICAgLHJlc3RpdHV0aW9uOiAwXG4gICAgICAgICAgICAsc3R5bGVzOiB7XG4gICAgICAgICAgICAgICAgZmlsbFN0eWxlOiAnI2VlZGQyMidcbiAgICAgICAgICAgICAgICAsYW5nbGVJbmRpY2F0b3I6ICcjMTU1NDc5J1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdmFyIGNpcmNsZTIgPSBQaHlzaWNzLmJvZHkoJ2NpcmNsZScsIHtcbiAgICAgICAgICAgIHg6IHRoaXMub3B0aW9ucy53aWR0aCAvIDIgKyBkLzJcbiAgICAgICAgICAgICx5OiAyMDBcbiAgICAgICAgICAgICx2eDogdlxuICAgICAgICAgICAgLHJhZGl1czogMlxuICAgICAgICAgICAgLG1hc3M6IDFcbiAgICAgICAgICAgICxyZXN0aXR1dGlvbjogMFxuICAgICAgICAgICAgLHN0eWxlczoge1xuICAgICAgICAgICAgICAgIGZpbGxTdHlsZTogJyNlZWRkMjInXG4gICAgICAgICAgICAgICAgLGFuZ2xlSW5kaWNhdG9yOiAnIzE1NTQ3OSdcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGJpZyA9IFBoeXNpY3MuYm9keSgnY2lyY2xlJywge1xuICAgICAgICAgICAgeDogdGhpcy5vcHRpb25zLndpZHRoIC8gMlxuICAgICAgICAgICAgLHk6IDMwMFxuICAgICAgICAgICAgLHZ4OiAtMiAqIHYvMjVcbiAgICAgICAgICAgICxyYWRpdXM6IDEwXG4gICAgICAgICAgICAsbWFzczogMjVcbiAgICAgICAgICAgICxyZXN0aXR1dGlvbjogMFxuICAgICAgICAgICAgLHN0eWxlczoge1xuICAgICAgICAgICAgICAgIGZpbGxTdHlsZTogJyNlZWRkMjInXG4gICAgICAgICAgICAgICAgLGFuZ2xlSW5kaWNhdG9yOiAnIzE1NTQ3OSdcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHZhciBjb25zdHJhaW50cyA9IFBoeXNpY3MuYmVoYXZpb3IoJ3ZlcmxldC1jb25zdHJhaW50cycpO1xuICAgICAgICBjb25zdHJhaW50cy5kaXN0YW5jZUNvbnN0cmFpbnQoY2lyY2xlMSwgY2lyY2xlMiwgMSk7XG4gICAgICAgIHdvcmxkLmFkZChbY2lyY2xlMSwgY2lyY2xlMiwgYmlnLCBjb25zdHJhaW50c10pO1xuICAgICAgICB3b3JsZC5hZGQoUGh5c2ljcy5iZWhhdmlvcignbmV3dG9uaWFuJywgeyBzdHJlbmd0aDogLjUgfSkpO1xuXG4gICAgICAgIHZhciBtb29uUm90YXRpb24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgZHggPSBjaXJjbGUxLnN0YXRlLnBvcy54IC0gY2lyY2xlMi5zdGF0ZS5wb3MueDtcbiAgICAgICAgICAgIHZhciBkeSA9IGNpcmNsZTIuc3RhdGUucG9zLnkgLSBjaXJjbGUxLnN0YXRlLnBvcy55O1xuICAgICAgICAgICAgcmV0dXJuIE1hdGguYXRhbjIoZHksZHgpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHZhciBtb29uUmV2b2x1dGlvbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBkeCA9IChjaXJjbGUxLnN0YXRlLnBvcy54ICsgY2lyY2xlMi5zdGF0ZS5wb3MueCkvMiAtIGJpZy5zdGF0ZS5wb3MueDtcbiAgICAgICAgICAgIHZhciBkeSA9IGJpZy5zdGF0ZS5wb3MueSAtIChjaXJjbGUyLnN0YXRlLnBvcy55ICsgY2lyY2xlMS5zdGF0ZS5wb3MueSkvMjtcbiAgICAgICAgICAgIHJldHVybiBNYXRoLmF0YW4yKGR5LGR4KTtcbiAgICAgICAgfTtcblxuICAgICAgICB2YXIgZ3JhcGggPSBuZXcgR3JhcGgodGhpcy5jb250YWluZXIsIHtcbiAgICAgICAgICAgICdSb3QnOiB7Zm46IG1vb25Sb3RhdGlvbiwgdGl0bGU6ICdSb3RhdGlvbicsIG1pbnNjYWxlOiAyICogTWF0aC5QSX0sXG4gICAgICAgICAgICAnUmV2Jzoge2ZuOiBtb29uUmV2b2x1dGlvbiwgdGl0bGU6ICdSZXZvbHV0aW9uJywgbWluc2NhbGU6IDIgKiBNYXRoLlBJfSxcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgbWF4OiAyMDAwLFxuICAgICAgICAgICAgdG9wOiAxMCxcbiAgICAgICAgICAgIGxlZnQ6IHRoaXMub3B0aW9ucy53aWR0aCxcbiAgICAgICAgICAgIHdpZHRoOiAzMDAsXG4gICAgICAgICAgICB3b3JsZEhlaWdodDogdGhpcy5vcHRpb25zLmhlaWdodCxcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuZ3JhcGggPSBncmFwaDtcblxuICAgICAgICB0aGlzLndvcmxkLm9uKCdzdGVwJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZ3JhcGgudXBkYXRlKHdvcmxkLnRpbWVzdGVwKCkpO1xuICAgICAgICB9KTtcblxuICAgICAgICB2YXIgYnV0dG9uQ29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGJ1dHRvbkNvbnRhaW5lcik7XG4gICAgICAgIHZhciBwbGF5UGF1c2UgPSBuZXcgUGxheVBhdXNlKHdvcmxkLCBidXR0b25Db250YWluZXIpO1xuICAgIH1cbn0pO1xuXG4gICAgICAgIFxuIiwiLyoqIEBqc3ggUmVhY3QuRE9NICovXG5cbnZhciBQVCA9IFJlYWN0LlByb3BUeXBlc1xudmFyIGN4ID0gUmVhY3QuYWRkb25zLmNsYXNzU2V0XG5cbnZhciBOZXdBc3Rlcm9pZEJ1dHRvbiA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ05ld0FzdGVyb2lkQnV0dG9uJyxcbiAgICBwcm9wVHlwZXM6IHtcbiAgICAgICAgb25DbGljazogUFQuZnVuYyxcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBjbGFzc05hbWUgPSBjeCh7XG4gICAgICAgICAgICAnYXN0ZXJvaWQtYnV0dG9uJzogdHJ1ZSxcbiAgICAgICAgfSlcblxuICAgICAgICByZXR1cm4gUmVhY3QuRE9NLmJ1dHRvbih7XG4gICAgICAgICAgICB0eXBlOiBcImJ1dHRvblwiLCBcbiAgICAgICAgICAgIGNsYXNzTmFtZTogXCJuZXctYXN0ZXJvaWQtYnV0dG9uXCIsIFxuICAgICAgICAgICAgb25DbGljazogdGhpcy5wcm9wcy5vbkNsaWNrfSwgXCJOZXcgQXN0ZXJvaWRcIilcbiAgICB9XG59KVxuXG5tb2R1bGUuZXhwb3J0cyA9IE5ld0FzdGVyb2lkQnV0dG9uXG4iLCJ2YXIgR2F0ZSA9IHJlcXVpcmUoJy4vZ2F0ZScpO1xudmFyIEJhc2UgPSByZXF1aXJlKCcuL2Jhc2UnKTtcbnZhciBTdG9wd2F0Y2ggPSByZXF1aXJlKCcuL3N0b3B3YXRjaCcpO1xudmFyIFBsYXlQYXVzZSA9IHJlcXVpcmUoJy4vcGxheXBhdXNlJyk7XG52YXIgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xudmFyIExvZ0Jvb2sgPSByZXF1aXJlKCcuL2xvZ2Jvb2snKVxudmFyIE5ld3RvbjFXYWxrdGhyb3VnaCA9IHJlcXVpcmUoJy4vaW50cm8vbmV3dG9uMV9pbnRyby5qc3gnKVxudmFyIE5ld0FzdGVyb2lkQnV0dG9uID0gcmVxdWlyZSgnLi9uZXctYXN0ZXJvaWQtYnV0dG9uLmpzeCcpXG52YXIgbmV3dG9uMURhdGFDaGVja2VyID0gcmVxdWlyZSgnLi9uZXd0b24xZGF0YWNoZWNrZXInKVxuXG5mdW5jdGlvbiByYW5kb20obWluLCBtYXgpe1xuICAgIHJldHVybiAoTWF0aC5yYW5kb20oKSAqIChtYXgtbWluKSArIG1pbil8MFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2UuZXh0ZW5kKGZ1bmN0aW9uIEFzdGVyb2lkcyhjb250YWluZXIsIG9wdGlvbnMpIHtcbiAgICBCYXNlLmNhbGwodGhpcywgY29udGFpbmVyLCBvcHRpb25zLCAnaW1hZ2VzL3NwYWNlX2JhY2tncm91bmQuanBnJyxcbiAgICAgICAgdHJ1ZSAvKiBkaXNhYmxlQm91bmRzICovKVxufSwge1xuICAgIHNldHVwOiBmdW5jdGlvbiAoY29udGFpbmVyKSB7XG4gICAgICAgIHZhciB3b3JsZCA9IHRoaXMud29ybGQ7XG4gICAgICAgIHRoaXMuYWN0aXZlQXN0ZXJvaWQgPSBudWxsO1xuICAgICAgICB0aGlzLmhhbmRsZU5ld0FzdGVyb2lkKCk7XG4gICAgICAgIHZhciBzaWRlQmFyID0gdGhpcy5zaWRlQmFyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgc2lkZUJhci5jbGFzc05hbWUgPSBcInNpZGUtYmFyXCI7XG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChzaWRlQmFyKTtcblxuICAgICAgICB2YXIgZ2F0ZTEgPSBuZXcgR2F0ZSh3b3JsZCxcbiAgICAgICAgICAgIHV0aWwubWFrZVJlY3QoMCwgMCwgMTAsIDUwMCksXG4gICAgICAgICAgICBbNDAwLCAzNTBdLCBudWxsLCB7ZGVidWc6IHRydWUsIHNob3c6IHRydWUsIGNvbG9yOiAnZ3JlZW4nfSk7XG4gICAgICAgIHZhciBnYXRlMiA9IG5ldyBHYXRlKHdvcmxkLFxuICAgICAgICAgICAgdXRpbC5tYWtlUmVjdCgwLCAwLCAxMCwgNTAwKSxcbiAgICAgICAgICAgIFs2MDAsIDM1MF0sIG51bGwsIHtkZWJ1ZzogdHJ1ZSwgc2hvdzogdHJ1ZSwgY29sb3I6ICdncmVlbid9KTtcbiAgICAgICAgdmFyIGdhdGUzID0gbmV3IEdhdGUod29ybGQsXG4gICAgICAgICAgICB1dGlsLm1ha2VSZWN0KDAsIDAsIDEwLCA1MDApLFxuICAgICAgICAgICAgWzgwMCwgMzUwXSwgbnVsbCwge2RlYnVnOiB0cnVlLCBzaG93OiB0cnVlLCBjb2xvcjogJ2dyZWVuJ30pO1xuXG4gICAgICAgIHZhciBsb2dDb2x1bW5zID0gW1xuICAgICAgICAgICAge25hbWU6IFwiVGltZSAxXCIsIGV4dHJhVGV4dDogXCJcIn0sXG4gICAgICAgICAgICB7bmFtZTogXCJUaW1lIDJcIiwgZXh0cmFUZXh0OiBcIlwifSxcbiAgICAgICAgXTtcbiAgICAgICAgdmFyIGxvZ0Jvb2sgPSB0aGlzLmxvZ0Jvb2sgPSBuZXcgTG9nQm9vayh3b3JsZCwgc2lkZUJhciwgNSwgbG9nQ29sdW1ucyxcbiAgICAgICAgICAgIHRydWUgLyogaGlkZUF2ZyAqLyk7XG4gICAgICAgIGdhdGUxLm9uKCdlbnRlcicsIGZ1bmN0aW9uKGVsZW0pIHtcbiAgICAgICAgICAgIHRoaXMuY29uc2lkZXJBY3RpdmVBc3Rlcm9pZEdDKCk7XG4gICAgICAgICAgICB2YXIgYm9keSA9IGVsZW0uYm9keTtcbiAgICAgICAgICAgIGlmICghdGhpcy5hY3RpdmVBc3Rlcm9pZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuYWN0aXZlQXN0ZXJvaWQgPSBib2R5O1xuICAgICAgICAgICAgICAgIGxvZ0Jvb2suaGFuZGxlU3RhcnQoXCJUaW1lIDFcIiwgYm9keS51aWQpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0uYmluZCh0aGlzKSlcbiAgICAgICAgZ2F0ZTIub24oJ2VudGVyJywgZnVuY3Rpb24oZWxlbSkge1xuICAgICAgICAgICAgdmFyIGJvZHkgPSBlbGVtLmJvZHk7XG4gICAgICAgICAgICBpZiAodGhpcy5hY3RpdmVBc3Rlcm9pZCA9PSBib2R5KSB7XG4gICAgICAgICAgICAgICAgbG9nQm9vay5oYW5kbGVFbmQoXCJUaW1lIDFcIiwgYm9keS51aWQpO1xuICAgICAgICAgICAgICAgIGxvZ0Jvb2suaGFuZGxlU3RhcnQoXCJUaW1lIDJcIiwgYm9keS51aWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LmJpbmQodGhpcykpXG4gICAgICAgIGdhdGUzLm9uKCdlbnRlcicsIGZ1bmN0aW9uKGVsZW0pIHtcbiAgICAgICAgICAgIHZhciBib2R5ID0gZWxlbS5ib2R5O1xuICAgICAgICAgICAgaWYgKHRoaXMuYWN0aXZlQXN0ZXJvaWQgPT0gYm9keSkge1xuICAgICAgICAgICAgICAgIGxvZ0Jvb2suaGFuZGxlRW5kKFwiVGltZSAyXCIsIGVsZW0uYm9keS51aWQpO1xuICAgICAgICAgICAgICAgIHRoaXMuYWN0aXZlQXN0ZXJvaWQgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LmJpbmQodGhpcykpXG5cbiAgICAgICAgdmFyIHBsYXlQYXVzZUNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChwbGF5UGF1c2VDb250YWluZXIpO1xuICAgICAgICB2YXIgcGxheVBhdXNlID0gbmV3IFBsYXlQYXVzZSh3b3JsZCwgcGxheVBhdXNlQ29udGFpbmVyKTtcbiAgICAgICAgdGhpcy5jcmVhdGVOZXdBc3Rlcm9pZEJ1dHRvbihjb250YWluZXIpXG5cbiAgICAgICAgY29uc29sZS5sb2coJ29wdGlvbnM6ICcgKyB0aGlzLm9wdGlvbnMpXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMud2Fsaykge1xuICAgICAgICAgICAgTmV3dG9uMVdhbGt0aHJvdWdoKHRoaXMsIGZ1bmN0aW9uIChoeXBvdGhlc2lzKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXR1cERhdGFDaGVja2VyKGh5cG90aGVzaXMpO1xuICAgICAgICAgICAgfS5iaW5kKHRoaXMpLCB0aGlzLm9wdGlvbnMuZGVidWcgPT09ICd0cnVlJylcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc2V0dXBEYXRhQ2hlY2tlcignc2FtZScpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIHNldHVwRGF0YUNoZWNrZXI6IGZ1bmN0aW9uKGh5cG90aGVzaXMpIHtcbiAgICAgICAgdmFyIGRhdGFDaGVja2VyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgZGF0YUNoZWNrZXIuY2xhc3NOYW1lID0gXCJuZXd0b24xLWRhdGEtY2hlY2tlclwiO1xuICAgICAgICB0aGlzLnNpZGVCYXIuYXBwZW5kQ2hpbGQoZGF0YUNoZWNrZXIpO1xuICAgICAgICBuZXd0b24xRGF0YUNoZWNrZXIoZGF0YUNoZWNrZXIsIHRoaXMubG9nQm9vaywgaHlwb3RoZXNpcyk7XG4gICAgfSxcblxuICAgIGNyZWF0ZU5ld0FzdGVyb2lkQnV0dG9uOiBmdW5jdGlvbihjb250YWluZXIpIHtcbiAgICAgICAgdmFyIGVsZW1lbnQgPSAkKCc8ZGl2Lz4nKVxuICAgICAgICAkKGNvbnRhaW5lcikuYXBwZW5kKGVsZW1lbnQpXG4gICAgICAgIFJlYWN0LnJlbmRlckNvbXBvbmVudChOZXdBc3Rlcm9pZEJ1dHRvbih7XG4gICAgICAgICAgICBvbkNsaWNrOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZU5ld0FzdGVyb2lkKCk7XG4gICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKVxuICAgICAgICB9KSwgZWxlbWVudFswXSlcblxuICAgICAgICAvLyB2YXIgbmV3QXN0ZXJvaWRMaW5rID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImFcIik7XG4gICAgICAgIC8vIG5ld0FzdGVyb2lkTGluay5ocmVmID0gXCIjXCI7XG4gICAgICAgIC8vIG5ld0FzdGVyb2lkTGluay5pbm5lckhUTUwgPSBcIk5ldyBhc3Rlcm9pZFwiO1xuICAgICAgICAvLyBuZXdBc3Rlcm9pZExpbmsuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgLy8gdGhpcy5oYW5kbGVOZXdBc3Rlcm9pZCgpO1xuICAgICAgICAgICAgLy8gZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgLy8gfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgLy8gcmV0dXJuIG5ld0FzdGVyb2lkTGluaztcbiAgICB9LFxuXG4gICAgY29uc2lkZXJBY3RpdmVBc3Rlcm9pZEdDOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMuYWN0aXZlQXN0ZXJvaWQpIHtcbiAgICAgICAgICAgIHZhciB4ID0gdGhpcy5hY3RpdmVBc3Rlcm9pZC5zdGF0ZS5wb3MueDtcbiAgICAgICAgICAgIHZhciB5ID0gdGhpcy5hY3RpdmVBc3Rlcm9pZC5zdGF0ZS5wb3MueTtcbiAgICAgICAgICAgIGlmICh4IDwgMTAwIHx8IHggPiAxMDAwIHx8IHkgPCAxMDAgfHwgeSA+IDgwMCkge1xuICAgICAgICAgICAgICAgIHRoaXMuYWN0aXZlQXN0ZXJvaWQgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIGhhbmRsZU5ld0FzdGVyb2lkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHdvcmxkID0gdGhpcy53b3JsZDtcblxuICAgICAgICB2YXIgbWluWCA9IDUwO1xuICAgICAgICB2YXIgbWF4WCA9IDMwMDtcbiAgICAgICAgdmFyIG1pblkgPSA1MDtcbiAgICAgICAgdmFyIG1heFkgPSA2NTA7XG4gICAgICAgIHZhciBtaW5BbmdsZSA9IDA7XG4gICAgICAgIHZhciBtYXhBbmdsZSA9IDIqTWF0aC5QSTtcblxuICAgICAgICB2YXIgYm9keSA9IFBoeXNpY3MuYm9keSgnY2lyY2xlJywge1xuICAgICAgICAgICAgeDogcmFuZG9tKG1pblgsIG1heFgpLFxuICAgICAgICAgICAgeTogcmFuZG9tKG1pblksIG1heFkpLFxuICAgICAgICAgICAgcmFkaXVzOiA1MCxcbiAgICAgICAgICAgIGFuZ2xlOiByYW5kb20obWluQW5nbGUsIG1heEFuZ2xlKSxcbiAgICAgICAgICAgIG1hc3M6IDEwMDAsXG4gICAgICAgICAgICByZXN0aXR1dGlvbjogMCxcbiAgICAgICAgICAgIHN0eWxlczoge1xuICAgICAgICAgICAgICAgIGltYWdlOiAnaW1hZ2VzL2FzdGVyb2lkLnBuZycsXG4gICAgICAgICAgICAgICAgZmlsbFN0eWxlOiAnI2ZmY2MwMCdcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGlmICghdGhpcy5maXJzdEFzdGVyb2lkKSB7XG4gICAgICAgICAgICB0aGlzLmZpcnN0QXN0ZXJvaWQgPSBib2R5O1xuICAgICAgICB9XG4gICAgICAgIHdvcmxkLmFkZChib2R5KTtcbiAgICB9LFxuXG4gICAgZGVtb25zdHJhdGVTYW1wbGU6IGZ1bmN0aW9uKG9uRG9uZSkge1xuICAgICAgICB2YXIgYXN0ZXJvaWQgPSB0aGlzLmZpcnN0QXN0ZXJvaWQ7XG4gICAgICAgIHZhciB0YXJnZXRYID0gMjAwO1xuICAgICAgICB2YXIgdGFyZ2V0WSA9IDM1MDtcblxuICAgICAgICBhc3Rlcm9pZC50cmVhdG1lbnQgPSAna2luZW1hdGljJztcbiAgICAgICAgYXN0ZXJvaWQuc3RhdGUudmVsLnggPSAodGFyZ2V0WCAtIGFzdGVyb2lkLnN0YXRlLnBvcy54KSAvIDE1MDA7XG4gICAgICAgIGFzdGVyb2lkLnN0YXRlLnZlbC55ID0gKHRhcmdldFkgLSBhc3Rlcm9pZC5zdGF0ZS5wb3MueSkgLyAxNTAwO1xuICAgICAgICBhc3Rlcm9pZC5yZWNhbGMoKTtcblxuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgYXN0ZXJvaWQudHJlYXRtZW50ID0gJ2R5bmFtaWMnO1xuICAgICAgICAgICAgYXN0ZXJvaWQuc3RhdGUucG9zLnggPSB0YXJnZXRYO1xuICAgICAgICAgICAgYXN0ZXJvaWQuc3RhdGUucG9zLnkgPSB0YXJnZXRZO1xuICAgICAgICAgICAgYXN0ZXJvaWQuc3RhdGUudmVsLnggPSAwLjI7XG4gICAgICAgICAgICBhc3Rlcm9pZC5zdGF0ZS52ZWwueSA9IDA7XG4gICAgICAgICAgICBhc3Rlcm9pZC5yZWNhbGMoKTtcblxuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBhc3Rlcm9pZC50cmVhdG1lbnQgPSAnZHluYW1pYyc7XG4gICAgICAgICAgICAgICAgYXN0ZXJvaWQucmVjYWxjKCk7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgb25Eb25lKCk7XG4gICAgICAgICAgICAgICAgfSwgMzAwMClcbiAgICAgICAgICAgIH0sIDE1MDApXG4gICAgICAgIH0sIDE1MDApXG4gICAgfVxufSk7XG4iLCJ2YXIgRGF0YUNoZWNrZXIgPSByZXF1aXJlKCcuL2RhdGFjaGVja2VyLmpzeCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRyb3BEYXRhQ2hlY2tlcjtcblxudmFyIF9pbml0aWFsVGV4dCA9IFwiRG8gYW4gZXhwZXJpbWVudCB0byBkZXRlcm1pbmUgaG93IGFzdGVyb2lkcyBiZWhhdmUsIGFuZCBsZXQgbWUga25vdyB3aGVuIHlvdSdyZSBkb25lLlwiO1xuXG52YXIgX25leHRVUkwgPSBcIj9IaWxscyZ3YWxrPXRydWVcIlxuXG52YXIgX2h5cG90aGVzZXMgPSBbXG4gICAge1xuICAgICAgICBuYW1lOiBcImZhc3RlclwiLFxuICAgICAgICBidXR0b25UZXh0OiBcIlRoZSBhc3Rlcm9pZHMgZ2V0IGZhc3Rlci5cIixcbiAgICAgICAgdGV4dDogXCJ0aGF0IHRoZSBhc3Rlcm9pZHMgd2lsbCBnZXQgZmFzdGVyXCIsXG4gICAgfSxcbiAgICB7XG4gICAgICAgIG5hbWU6IFwic2xvd2VyXCIsXG4gICAgICAgIGJ1dHRvblRleHQ6IFwiVGhlIGFzdGVyb2lkcyBnZXQgc2xvd2VyLlwiLFxuICAgICAgICB0ZXh0OiBcInRoYXQgdGhlIGFzdGVyb2lkcyB3aWxsIGdldCBzbG93ZXJcIixcbiAgICB9LFxuICAgIHtcbiAgICAgICAgbmFtZTogXCJzYW1lXCIsXG4gICAgICAgIGJ1dHRvblRleHQ6IFwiVGhlIGFzdGVyb2lkcyBzdGF5IHRoZSBzYW1lIHNwZWVkLlwiLFxuICAgICAgICB0ZXh0OiBcInRoYXQgdGhlIGFzdGVyb2lkcyB3aWxsIHN0YXkgdGhlIHNhbWUgc3BlZWRcIixcbiAgICB9LFxuXTtcblxuZnVuY3Rpb24gZHJvcERhdGFDaGVja2VyKGNvbnRhaW5lciwgbG9nQm9vaywgaHlwb3RoZXNpcykge1xuICAgIHJldHVybiBSZWFjdC5yZW5kZXJDb21wb25lbnQoRGF0YUNoZWNrZXIoe1xuICAgICAgICBpbml0aWFsVGV4dDogX2luaXRpYWxUZXh0LFxuICAgICAgICBpbml0aWFsSHlwb3RoZXNpczogaHlwb3RoZXNpcyxcbiAgICAgICAgcG9zc2libGVIeXBvdGhlc2VzOiBfaHlwb3RoZXNlcyxcbiAgICAgICAgcmVzdWx0OiBmdW5jdGlvbiAoc3RhdGUpIHtyZXR1cm4gX3Jlc3VsdChsb2dCb29rLCBzdGF0ZSk7fSxcbiAgICAgICAgbmV4dFVSTDogX25leHRVUkwsXG4gICAgfSksIGNvbnRhaW5lcik7XG59XG5cbmZ1bmN0aW9uIF9yZXN1bHQobG9nQm9vaywgc3RhdGUpIHtcbiAgICAvLyB3ZSByZXR1cm4gdGhlIGVycm9yLCBvciBudWxsIGlmIHRoZXkncmUgY29ycmVjdFxuICAgIHZhciBlbm91Z2hEYXRhID0gXy5hbGwobG9nQm9vay5kYXRhLCBmdW5jdGlvbiAoZCkge3JldHVybiBkLmxlbmd0aCA+PSA1O30pO1xuICAgIHZhciBkYXRhSXNHb29kID0gdHJ1ZTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDU7IGkrKykge1xuICAgICAgICB2YXIgdmFsMSA9IGxvZ0Jvb2suZGF0YVtcIlRpbWUgMVwiXVtpXTtcbiAgICAgICAgdmFyIHZhbDIgPSBsb2dCb29rLmRhdGFbXCJUaW1lIDJcIl1baV07XG4gICAgICAgIHZhciBtaW5WYWwgPSBNYXRoLm1pbih2YWwxLCB2YWwyKTtcbiAgICAgICAgdmFyIG1heFZhbCA9IE1hdGgubWF4KHZhbDEsIHZhbDIpO1xuICAgICAgICBpZiAobWF4VmFsIC8gbWluVmFsID4gMS4yKSB7XG4gICAgICAgICAgICBkYXRhSXNHb29kID0gZmFsc2U7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmIChlbm91Z2hEYXRhKSB7XG4gICAgICAgIHZhciBhdmdzID0ge31cbiAgICAgICAgdmFyIG1heERlbHRhcyA9IHt9XG4gICAgICAgIGZvciAodmFyIG5hbWUgaW4gbG9nQm9vay5kYXRhKSB7XG4gICAgICAgICAgICBhdmdzW25hbWVdID0gXy5yZWR1Y2UobG9nQm9vay5kYXRhW25hbWVdLFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIChhLCBiKSB7cmV0dXJuIGEgKyBiO30pIC8gbG9nQm9vay5kYXRhW25hbWVdLmxlbmd0aDtcbiAgICAgICAgICAgIG1heERlbHRhc1tuYW1lXSA9IF8ubWF4KF8ubWFwKGxvZ0Jvb2suZGF0YVtuYW1lXSxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiAoZGF0dW0pIHtyZXR1cm4gTWF0aC5hYnMoZGF0dW0gLSBhdmdzW25hbWVdKTt9KSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgY29uc29sZS5sb2cobG9nQm9vay5kYXRhLCBlbm91Z2hEYXRhLCBhdmdzLCBtYXhEZWx0YXMpO1xuICAgIGlmICghZW5vdWdoRGF0YSkge1xuICAgICAgICByZXR1cm4gXCJZb3UgaGF2ZW4ndCBmaWxsZWQgdXAgeW91ciBsYWIgbm90ZWJvb2shICBNYWtlIHN1cmUgeW91IGdldCBlbm91Z2ggZGF0YSBzbyB5b3Uga25vdyB5b3VyIHJlc3VsdHMgYXJlIGFjY3VyYXRlLlwiO1xuICAgIH0gZWxzZSBpZiAoc3RhdGUuaHlwb3RoZXNpcyAhPSBcInNhbWVcIiB8fCAhZGF0YUlzR29vZCkge1xuICAgICAgICByZXR1cm4gXCJUaG9zZSByZXN1bHRzIGRvbid0IGxvb2sgcmlnaHQgdG8gbWUuIE1ha2Ugc3VyZSB5b3UncmUgbGV0dGluZyBcIiArXG4gICAgICAgICAgICBcInRoZSBhc3Rlcm9pZHMgZ2xpZGUgdGhyb3VnaCBhbGwgdGhyZWUgZ2F0ZXMgd2l0aG91dCBpbnRlcmZlcmluZyB3aXRoIHRoZW0uXCJcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG59XG4iLCJ2YXIgR2F0ZSA9IHJlcXVpcmUoJy4vZ2F0ZScpO1xudmFyIEJhc2UgPSByZXF1aXJlKCcuL2Jhc2UnKTtcbnZhciBTdG9wd2F0Y2ggPSByZXF1aXJlKCcuL3N0b3B3YXRjaCcpO1xudmFyIFBsYXlQYXVzZSA9IHJlcXVpcmUoJy4vcGxheXBhdXNlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gQmFzZS5leHRlbmQoZnVuY3Rpb24gT3JiaXQoY29udGFpbmVyLCBvcHRpb25zKSB7XG4gICAgQmFzZS5jYWxsKHRoaXMsIGNvbnRhaW5lciwgb3B0aW9ucywgXCJpbWFnZXMvc3BhY2VfYmFja2dyb3VuZC5qcGdcIilcbn0sIHtcbiAgICBzZXR1cDogZnVuY3Rpb24gKGNvbnRhaW5lcikge1xuICAgICAgICB2YXIgd29ybGQgPSB0aGlzLndvcmxkO1xuICAgICAgICB2YXIgcmVkQmFsbCA9IFBoeXNpY3MuYm9keSgnY2lyY2xlJywge1xuICAgICAgICAgICAgeDogdGhpcy5vcHRpb25zLndpZHRoIC8gMlxuICAgICAgICAgICAgLHk6IDQwXG4gICAgICAgICAgICAsdng6IDBcbiAgICAgICAgICAgICx2eTogLTEvOFxuICAgICAgICAgICAgLHJhZGl1czogNFxuICAgICAgICAgICAgLG1hc3M6IDRcbiAgICAgICAgICAgICxyZXN0aXR1dGlvbjogMFxuICAgICAgICAgICAgLHN0eWxlczoge1xuICAgICAgICAgICAgICAgIGZpbGxTdHlsZTogJyNkNjhiNjInIC8vcmVkXG4gICAgICAgICAgICAgICAgLGFuZ2xlSW5kaWNhdG9yOiAnIzE1NTQ3OSdcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHZhciBncmVlbkJhbGwgPSBQaHlzaWNzLmJvZHkoJ2NpcmNsZScsIHtcbiAgICAgICAgICAgIHg6IHRoaXMub3B0aW9ucy53aWR0aCAvIDJcbiAgICAgICAgICAgICx5OiA2MFxuICAgICAgICAgICAgLHZ4OiAzLzhcbiAgICAgICAgICAgICx2eTogMS84XG4gICAgICAgICAgICAscmFkaXVzOiA0XG4gICAgICAgICAgICAsbWFzczogNFxuICAgICAgICAgICAgLHJlc3RpdHV0aW9uOiAwXG4gICAgICAgICAgICAsc3R5bGVzOiB7XG4gICAgICAgICAgICAgICAgZmlsbFN0eWxlOiAnIzI2ZWI2MicgLy9ncmVlblxuICAgICAgICAgICAgICAgICxhbmdsZUluZGljYXRvcjogJyMxNTU0NzknXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICB2YXIgYmlnQmFsbCA9IFBoeXNpY3MuYm9keSgnY2lyY2xlJywge1xuICAgICAgICAgICAgeDogdGhpcy5vcHRpb25zLndpZHRoIC8gMlxuICAgICAgICAgICAgLHk6IDMwMFxuICAgICAgICAgICAgLHZ4OiAtMy81MFxuICAgICAgICAgICAgLHJhZGl1czogMTBcbiAgICAgICAgICAgICxtYXNzOiAyNVxuICAgICAgICAgICAgLHJlc3RpdHV0aW9uOiAwXG4gICAgICAgICAgICAsc3R5bGVzOiB7XG4gICAgICAgICAgICAgICAgZmlsbFN0eWxlOiAnIzI2OGJkMidcbiAgICAgICAgICAgICAgICAsYW5nbGVJbmRpY2F0b3I6ICcjMTU1NDc5J1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgd29ybGQuYWRkKFtyZWRCYWxsLCBncmVlbkJhbGwsIGJpZ0JhbGxdKTtcbiAgICAgICAgd29ybGQuYWRkKFBoeXNpY3MuYmVoYXZpb3IoJ25ld3RvbmlhbicsIHsgc3RyZW5ndGg6IC41IH0pKTtcblxuICAgICAgICB2YXIgYnV0dG9uQ29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGJ1dHRvbkNvbnRhaW5lcik7XG4gICAgICAgIHZhciBwbGF5UGF1c2UgPSBuZXcgUGxheVBhdXNlKHdvcmxkLCBidXR0b25Db250YWluZXIpO1xuICAgICAgICAvLyB2YXIgZ2F0ZVBvbHlnb24gPSBbe3g6IC03MDAsIHk6IC0xMDB9LCB7eDogNzAwLCB5OiAtMTAwfSwge3g6IDcwMCwgeTogMTM5fSwge3g6IC03MDAsIHk6IDEzOX1dO1xuICAgICAgICAvLyB2YXIgZ2F0ZVBvbHlnb24yID0gW3t4OiAtNzAwLCB5OiAtMjYxfSwge3g6IDcwMCwgeTogLTI2MX0sIHt4OiA3MDAsIHk6IDIwMH0sIHt4OiAtNzAwLCB5OiAyMDB9XTtcbiAgICAgICAgLy8gdmFyIGdhdGVzID0gW11cbiAgICAgICAgLy8gZ2F0ZXMucHVzaChuZXcgR2F0ZSh3b3JsZCwgYnV0dG9uQ29udGFpbmVyLCBnYXRlUG9seWdvbiwgWzcwMCwgMTAwXSwgcmVkQmFsbCwge2RlYnVnOiB0cnVlLCBzaG93OiB0cnVlfSkpO1xuICAgICAgICAvLyBnYXRlcy5wdXNoKG5ldyBHYXRlKHdvcmxkLCBidXR0b25Db250YWluZXIsIGdhdGVQb2x5Z29uLCBbNzAwLCAxMDBdLCBncmVlbkJhbGwsIHtkZWJ1ZzogdHJ1ZSwgc2hvdzogdHJ1ZX0pKTtcbiAgICAgICAgLy8gZ2F0ZXMucHVzaChuZXcgR2F0ZSh3b3JsZCwgYnV0dG9uQ29udGFpbmVyLCBnYXRlUG9seWdvbiwgWzcwMCwgMTAwXSwgYmlnQmFsbCwge2RlYnVnOiB0cnVlLCBzaG93OiB0cnVlfSkpO1xuICAgICAgICAvLyBnYXRlcy5wdXNoKG5ldyBHYXRlKHdvcmxkLCBidXR0b25Db250YWluZXIsIGdhdGVQb2x5Z29uMiwgWzcwMCwgNTAwXSwgcmVkQmFsbCwge2RlYnVnOiB0cnVlLCBzaG93OiB0cnVlfSkpO1xuICAgICAgICAvLyBnYXRlcy5wdXNoKG5ldyBHYXRlKHdvcmxkLCBidXR0b25Db250YWluZXIsIGdhdGVQb2x5Z29uMiwgWzcwMCwgNTAwXSwgZ3JlZW5CYWxsLCB7ZGVidWc6IHRydWUsIHNob3c6IHRydWV9KSk7XG4gICAgICAgIC8vIGdhdGVzLnB1c2gobmV3IEdhdGUod29ybGQsIGJ1dHRvbkNvbnRhaW5lciwgZ2F0ZVBvbHlnb24yLCBbNzAwLCA1MDBdLCBiaWdCYWxsLCB7ZGVidWc6IHRydWUsIHNob3c6IHRydWV9KSk7XG4gICAgICAgIC8vIGdhdGVzLmZvckVhY2goZnVuY3Rpb24oZ2F0ZSkge1xuICAgICAgICAgICAgLy8gdmFyIHN0b3B3YXRjaCA9IG5ldyBTdG9wd2F0Y2god29ybGQsIGJ1dHRvbkNvbnRhaW5lciwgMSk7XG4gICAgICAgICAgICAvLyBnYXRlLm9uKCdlbnRlcicsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAvLyBzdG9wd2F0Y2gucmVzZXQoKTtcbiAgICAgICAgICAgICAgICAvLyBzdG9wd2F0Y2guc3RhcnQoKTtcbiAgICAgICAgICAgIC8vIH0pO1xuICAgICAgICAgICAgLy8gZ2F0ZS5vbignZXhpdCcsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAvLyBzdG9wd2F0Y2guc3RvcCgpXG4gICAgICAgICAgICAvLyB9KTtcbiAgICAgICAgLy8gfSk7XG4gICAgfVxufSk7XG5cbiAgICAgICAgXG4iLCJtb2R1bGUuZXhwb3J0cyA9IFBsYXlQYXVzZTtcblxuZnVuY3Rpb24gUGxheVBhdXNlKHdvcmxkLCBjb250YWluZXIpIHtcbiAgICB0aGlzLl9hdHRhY2god29ybGQsIGNvbnRhaW5lcik7XG59XG5cblBsYXlQYXVzZS5wcm90b3R5cGUuY3JlYXRlQnV0dG9uID0gZnVuY3Rpb24oYWN0aW9uLCBoYW5kbGVyKSB7XG4gICAgdmFyIGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYVwiKTtcbiAgICBhLmhyZWYgPSBcIiNcIiArIGFjdGlvbjtcbiAgICBhLmlubmVySFRNTCA9IGFjdGlvbjtcbiAgICBhLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgaGFuZGxlcigpO1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH0uYmluZCh0aGlzKSk7XG4gICAgcmV0dXJuIGE7XG59XG5cblBsYXlQYXVzZS5wcm90b3R5cGUuX2F0dGFjaCA9IGZ1bmN0aW9uKHdvcmxkLCBjb250YWluZXIpIHtcbiAgICB0aGlzLnBhdXNlU3ltYm9sID0gXCLilpDilpBcIjtcbiAgICB0aGlzLnBsYXlTeW1ib2wgPSBcIuKWulwiO1xuICAgIHRoaXMuYnV0dG9uID0gdGhpcy5jcmVhdGVCdXR0b24odGhpcy5wYXVzZVN5bWJvbCwgdGhpcy50b2dnbGUuYmluZCh0aGlzKSk7XG4gICAgdGhpcy53b3JsZCA9IHdvcmxkO1xuICAgIHZhciB3aWRnZXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIHdpZGdldC5jbGFzc05hbWUgPSBcInBsYXlwYXVzZVwiO1xuICAgIHdpZGdldC5hcHBlbmRDaGlsZCh0aGlzLmJ1dHRvbik7XG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKHdpZGdldCk7XG59XG5cblBsYXlQYXVzZS5wcm90b3R5cGUudG9nZ2xlID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMud29ybGQuaXNQYXVzZWQoKSkge1xuICAgICAgICB0aGlzLmJ1dHRvbi5pbm5lckhUTUwgPSB0aGlzLnBhdXNlU3ltYm9sO1xuICAgICAgICB0aGlzLmJ1dHRvbi5ocmVmID0gJyMnICsgdGhpcy5wYXVzZVN5bWJvbDtcbiAgICAgICAgdGhpcy53b3JsZC51bnBhdXNlKClcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmJ1dHRvbi5pbm5lckhUTUwgPSB0aGlzLnBsYXlTeW1ib2w7XG4gICAgICAgIHRoaXMuYnV0dG9uLmhyZWYgPSAnIycgKyB0aGlzLnBsYXlTeW1ib2w7XG4gICAgICAgIHRoaXMud29ybGQucGF1c2UoKVxuICAgIH1cbn1cblxuXG4iLCJ2YXIgQmFzZSA9IHJlcXVpcmUoJy4vYmFzZScpO1xudmFyIEdhdGUgPSByZXF1aXJlKCcuL2dhdGUnKTtcbnZhciBTdG9wd2F0Y2ggPSByZXF1aXJlKCcuL3N0b3B3YXRjaCcpO1xudmFyIFBsYXlQYXVzZSA9IHJlcXVpcmUoJy4vcGxheXBhdXNlJyk7XG52YXIgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2UuZXh0ZW5kKGZ1bmN0aW9uIFNsb3BlKGNvbnRhaW5lciwgb3B0aW9ucykge1xuICAgIEJhc2UuY2FsbCh0aGlzLCBjb250YWluZXIsIG9wdGlvbnMsICdpbWFnZXMvbGFiX2JhY2tncm91bmQuanBnJylcbn0sIHtcbiAgICBkcm9wSW5Cb2R5OiBmdW5jdGlvbiAocmFkaXVzLCB5KSB7XG4gICAgICAgIGZ1bmN0aW9uIHJhbmRvbShtaW4sIG1heCl7XG4gICAgICAgICAgICByZXR1cm4gKE1hdGgucmFuZG9tKCkgKiAobWF4LW1pbikgKyBtaW4pfDBcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMud29ybGQuYWRkKFBoeXNpY3MuYm9keSgnY2lyY2xlJywge1xuICAgICAgICAgICAgeDogMTAwLFxuICAgICAgICAgICAgeTogeSxcbiAgICAgICAgICAgIHZ4OiByYW5kb20oLTUsIDUpLzEwMCxcbiAgICAgICAgICAgIHJhZGl1czogcmFkaXVzLFxuICAgICAgICAgICAgcmVzdGl0dXRpb246IDAuOSxcbiAgICAgICAgICAgIHN0eWxlczoge1xuICAgICAgICAgICAgICAgIGZpbGxTdHlsZTogJyMyNjhiZDInLFxuICAgICAgICAgICAgICAgIGFuZ2xlSW5kaWNhdG9yOiAnIzE1NTQ3OSdcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkpO1xuICAgIH0sXG4gICAgc2V0dXA6IGZ1bmN0aW9uIChjb250YWluZXIpIHtcbiAgICAgICAgdmFyIHdvcmxkID0gdGhpcy53b3JsZFxuICAgICAgICB3b3JsZC5hZGQoUGh5c2ljcy5iZWhhdmlvcignY29uc3RhbnQtYWNjZWxlcmF0aW9uJykpO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNTsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgcmFkaXVzID0gMjAgKyAxMCAqIGk7XG4gICAgICAgICAgICB0aGlzLmRyb3BJbkJvZHkocmFkaXVzLCAzMDAgLSBpICogNTApO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy53b3JsZC5hZGQoUGh5c2ljcy5ib2R5KCdjb252ZXgtcG9seWdvbicsIHtcbiAgICAgICAgICAgIHg6IDQ1MCxcbiAgICAgICAgICAgIHk6IDYwMCxcbiAgICAgICAgICAgIHZlcnRpY2VzOiBbXG4gICAgICAgICAgICAgICAge3g6IDAsIHk6IDB9LFxuICAgICAgICAgICAgICAgIHt4OiAwLCB5OiAzMDB9LFxuICAgICAgICAgICAgICAgIHt4OiA4MDAsIHk6IDMwMH0sXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgdHJlYXRtZW50OiAnc3RhdGljJyxcbiAgICAgICAgICAgIGNvZjogMSxcbiAgICAgICAgICAgIHN0eWxlczoge1xuICAgICAgICAgICAgICAgIGZpbGxTdHlsZTogJyNkMzM2ODInLFxuICAgICAgICAgICAgICAgIGFuZ2xlSW5kaWNhdG9yOiAnIzc1MWI0YidcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkpXG5cbiAgICAgICAgdmFyIGJ1dHRvbkNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChidXR0b25Db250YWluZXIpO1xuICAgICAgICB2YXIgc3RvcHdhdGNoID0gbmV3IFN0b3B3YXRjaCh3b3JsZCwgYnV0dG9uQ29udGFpbmVyLCAxKTtcbiAgICAgICAgdmFyIHBsYXlQYXVzZSA9IG5ldyBQbGF5UGF1c2Uod29ybGQsIGJ1dHRvbkNvbnRhaW5lcik7XG4gICAgICAgIHZhciB0b3BHYXRlID0gbmV3IEdhdGUod29ybGQsXG4gICAgICAgICAgICB1dGlsLm1ha2VSZWN0KDAsIDAsIDYwLCAxMDApLFxuICAgICAgICAgICAgWzM1MCwgNDAwXSxcbiAgICAgICAgICAgIG51bGwsIHtkZWJ1ZzogdHJ1ZSwgc2hvdzogdHJ1ZSwgY29sb3I6ICdncmVlbid9KTtcbiAgICAgICAgdmFyIGJvdHRvbUdhdGUgPSBuZXcgR2F0ZSh3b3JsZCxcbiAgICAgICAgICAgIHV0aWwubWFrZVJlY3QoMCwgMCwgNjAsIDEwMCksXG4gICAgICAgICAgICBbODAwLCA1NzBdLFxuICAgICAgICAgICAgbnVsbCwge2RlYnVnOiB0cnVlLCBzaG93OiB0cnVlLCBjb2xvcjogJ3JlZCd9KTtcblxuICAgICAgICB0b3BHYXRlLm9uKCdlbnRlcicsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgIHN0b3B3YXRjaC5yZXNldCgpLnN0YXJ0KCk7XG4gICAgICAgIH0pXG4gICAgICAgIGJvdHRvbUdhdGUub24oJ2VudGVyJywgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgc3RvcHdhdGNoLnN0b3AoKVxuICAgICAgICB9KVxuXG4gICAgfVxufSk7XG5cbiIsIlxubW9kdWxlLmV4cG9ydHMgPSBTdG9wd2F0Y2g7XG5cbmZ1bmN0aW9uIFN0b3B3YXRjaCh3b3JsZCwgZWxlbSkge1xuICAgIHRoaXMuX2F0dGFjaCh3b3JsZCwgZWxlbSk7XG59XG5cblN0b3B3YXRjaC5wcm90b3R5cGUuX2F0dGFjaCA9IGZ1bmN0aW9uKHdvcmxkLCBlbGVtKSB7XG4gICAgdGhpcy53b3JsZCA9IHdvcmxkO1xuICAgIHRoaXMudGltZXIgPSB0aGlzLmNyZWF0ZVRpbWVyKCksXG4gICAgdGhpcy5zdGFydEJ1dHRvbiA9IHRoaXMuY3JlYXRlQnV0dG9uKFwic3RhcnRcIiwgdGhpcy5zdGFydC5iaW5kKHRoaXMpKSxcbiAgICB0aGlzLnN0b3BCdXR0b24gPSB0aGlzLmNyZWF0ZUJ1dHRvbihcInN0b3BcIiwgdGhpcy5zdG9wLmJpbmQodGhpcykpLFxuICAgIHRoaXMucmVzZXRCdXR0b24gPSB0aGlzLmNyZWF0ZUJ1dHRvbihcInJlc2V0XCIsIHRoaXMucmVzZXQuYmluZCh0aGlzKSksXG4gICAgdGhpcy5jbG9jayA9IDA7XG5cbiAgICAvLyBVcGRhdGUgb24gZXZlcnkgdGltZXIgdGlja1xuICAgIHRoaXMud29ybGQub24oJ3N0ZXAnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy51cGRhdGUoKTtcbiAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgdmFyIHdpZGdldCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgd2lkZ2V0LmNsYXNzTmFtZSA9IFwic3RvcHdhdGNoXCI7XG5cbiAgICAvLyBhcHBlbmQgZWxlbWVudHNcbiAgICB3aWRnZXQuYXBwZW5kQ2hpbGQodGhpcy50aW1lcik7XG4gICAgd2lkZ2V0LmFwcGVuZENoaWxkKHRoaXMuc3RhcnRCdXR0b24pO1xuICAgIHdpZGdldC5hcHBlbmRDaGlsZCh0aGlzLnN0b3BCdXR0b24pO1xuICAgIHdpZGdldC5hcHBlbmRDaGlsZCh0aGlzLnJlc2V0QnV0dG9uKTtcblxuICAgIGVsZW0uYXBwZW5kQ2hpbGQod2lkZ2V0KTtcbn1cblxuU3RvcHdhdGNoLnByb3RvdHlwZS5jcmVhdGVUaW1lciA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKTtcbn1cblxuU3RvcHdhdGNoLnByb3RvdHlwZS5jcmVhdGVCdXR0b24gPSBmdW5jdGlvbihhY3Rpb24sIGhhbmRsZXIpIHtcbiAgICB2YXIgYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJhXCIpO1xuICAgIGEuaHJlZiA9IFwiI1wiICsgYWN0aW9uO1xuICAgIGEuaW5uZXJIVE1MID0gYWN0aW9uO1xuICAgIGEuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICBoYW5kbGVyKCk7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgfS5iaW5kKHRoaXMpKTtcbiAgICByZXR1cm4gYTtcbn1cblxuU3RvcHdhdGNoLnByb3RvdHlwZS5zdGFydCA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucnVubmluZyA9IHRydWVcbiAgICByZXR1cm4gdGhpcztcbn1cblxuU3RvcHdhdGNoLnByb3RvdHlwZS5zdG9wID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5ydW5uaW5nID0gZmFsc2VcbiAgICByZXR1cm4gdGhpcztcbn1cblxuU3RvcHdhdGNoLnByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuY2xvY2sgPSAwO1xuICAgIHRoaXMucmVuZGVyKCk7XG4gICAgcmV0dXJuIHRoaXM7XG59XG5cblN0b3B3YXRjaC5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIG5ld1RpbWUgPSB0aGlzLndvcmxkLl90aW1lO1xuICAgIGlmICh0aGlzLnJ1bm5pbmcgJiYgdGhpcy5sYXN0VGltZSkge1xuICAgICAgICB0aGlzLmNsb2NrICs9IG5ld1RpbWUgLSB0aGlzLmxhc3RUaW1lO1xuICAgIH1cbiAgICB0aGlzLmxhc3RUaW1lID0gbmV3VGltZTtcbiAgICB0aGlzLnJlbmRlcigpO1xufVxuXG5TdG9wd2F0Y2gucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMudGltZXIuaW5uZXJIVE1MID0gcGFyc2VGbG9hdCh0aGlzLmNsb2NrIC8gMTAwMCkudG9GaXhlZCgyKTtcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gdGVycmFpbjtcblxuZnVuY3Rpb24gdGVycmFpbiggcGFyZW50ICl7XG4gICAgLy8gbW9zdGx5IGNvcGllZCBmcm9tIHRoZSBlZGdlLWNvbGxpc2lvbi1kZXRlY3Rpb24gYmVoYXZpb3IuXG4gICAgLy8gV0FSTklORzogdGhpcyBjdXJyZW50bHkgb25seSB3b3JrcyBjb3JyZWN0bHkgZm9yIGNpcmNsZXMuXG4gICAgLy8gZ2V0RmFydGhlc3RIdWxsUG9pbnQgZG9lc24ndCBhY3R1YWxseSBkbyB3aGF0IEkgd2FudCBpdCB0bywgc28gSSB3aWxsXG4gICAgLy8gbmVlZCB0byBleHRlbmQgZ2VvbWV0cnkgdG8gc3VwcG9ydCB3aGF0IEkgd2FudC5cblxuICAgIC8qXG4gICAgICogY2hlY2tHZW5lcmFsKCBib2R5LCBib3VuZHMsIGR1bW15ICkgLT4gQXJyYXlcbiAgICAgKiAtIGJvZHkgKEJvZHkpOiBUaGUgYm9keSB0byBjaGVja1xuICAgICAqIC0gYm91bmRzOiBib3VuZHMuYWFiYiBzaG91bGQgYmUgdGhlIG91dGVyIGJvdW5kcy4gIEZvciB0ZXJyYWluIG9uIHRoZVxuICAgICAqICAgZ3JvdW5kLCBwYXNzIGEgZnVuY3Rpb24gYm91bmRzLnRlcnJhaW5IZWlnaHQoeCkuXG4gICAgICogLSBkdW1teTogKEJvZHkpOiBUaGUgZHVtbXkgYm9keSB0byBwdWJsaXNoIGFzIHRoZSBzdGF0aWMgb3RoZXIgYm9keSBpdCBjb2xsaWRlcyB3aXRoXG4gICAgICogKyAoQXJyYXkpOiBUaGUgY29sbGlzaW9uIGRhdGFcbiAgICAgKlxuICAgICAqIENoZWNrIGlmIGEgYm9keSBjb2xsaWRlcyB3aXRoIHRoZSBib3VuZGFyeVxuICAgICAqL1xuICAgIHZhciBjaGVja0dlbmVyYWwgPSBmdW5jdGlvbiBjaGVja0dlbmVyYWwoIGJvZHksIGJvdW5kcywgdGVycmFpbkhlaWdodCwgZHVtbXkgKXtcblxuICAgICAgICB2YXIgb3ZlcmxhcFxuICAgICAgICAgICAgLGFhYmIgPSBib2R5LmFhYmIoKVxuICAgICAgICAgICAgLHNjcmF0Y2ggPSBQaHlzaWNzLnNjcmF0Y2hwYWQoKVxuICAgICAgICAgICAgLHRyYW5zID0gc2NyYXRjaC50cmFuc2Zvcm0oKVxuICAgICAgICAgICAgLGRpciA9IHNjcmF0Y2gudmVjdG9yKClcbiAgICAgICAgICAgICxyZXN1bHQgPSBzY3JhdGNoLnZlY3RvcigpXG4gICAgICAgICAgICAsY29sbGlzaW9uID0gZmFsc2VcbiAgICAgICAgICAgICxjb2xsaXNpb25zID0gW11cbiAgICAgICAgICAgICx4XG4gICAgICAgICAgICAseVxuICAgICAgICAgICAgLGNvbGxpc2lvblhcbiAgICAgICAgICAgIDtcblxuICAgICAgICAvLyByaWdodFxuICAgICAgICBvdmVybGFwID0gKGFhYmIueCArIGFhYmIuaHcpIC0gYm91bmRzLm1heC54O1xuXG4gICAgICAgIGlmICggb3ZlcmxhcCA+PSAwICl7XG5cbiAgICAgICAgICAgIGRpci5zZXQoIDEsIDAgKS5yb3RhdGVJbnYoIHRyYW5zLnNldFJvdGF0aW9uKCBib2R5LnN0YXRlLmFuZ3VsYXIucG9zICkgKTtcblxuICAgICAgICAgICAgY29sbGlzaW9uID0ge1xuICAgICAgICAgICAgICAgIGJvZHlBOiBib2R5LFxuICAgICAgICAgICAgICAgIGJvZHlCOiBkdW1teSxcbiAgICAgICAgICAgICAgICBvdmVybGFwOiBvdmVybGFwLFxuICAgICAgICAgICAgICAgIG5vcm06IHtcbiAgICAgICAgICAgICAgICAgICAgeDogMSxcbiAgICAgICAgICAgICAgICAgICAgeTogMFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgbXR2OiB7XG4gICAgICAgICAgICAgICAgICAgIHg6IG92ZXJsYXAsXG4gICAgICAgICAgICAgICAgICAgIHk6IDBcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHBvczogYm9keS5nZW9tZXRyeS5nZXRGYXJ0aGVzdEh1bGxQb2ludCggZGlyLCByZXN1bHQgKS5yb3RhdGUoIHRyYW5zICkudmFsdWVzKClcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGNvbGxpc2lvbnMucHVzaChjb2xsaXNpb24pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gYm90dG9tXG4gICAgICAgIG92ZXJsYXAgPSAtMTtcbiAgICAgICAgaWYgKGFhYmIueSA+IGJvdW5kcy5tYXgueSAtIHRlcnJhaW5IZWlnaHQoYWFiYi54KSkge1xuICAgICAgICAgICAgLy8gaWYgdGhlIGNlbnRlciBzb21laG93IGdldHMgYmVsb3cgdGhlIHRlcnJhaW4sIGFsd2F5cyBwdXNoIHN0cmFpZ2h0IHVwLlxuICAgICAgICAgICAgb3ZlcmxhcCA9IE1hdGgubWF4KDEsIChhYWJiLnkgKyBhYWJiLmhoKSAtIGJvdW5kcy5tYXgueSArIHRlcnJhaW5IZWlnaHQoYWFiYi54KSk7XG4gICAgICAgICAgICBkaXIuc2V0KCAwLCAxICkucm90YXRlSW52KCB0cmFucy5zZXRSb3RhdGlvbiggYm9keS5zdGF0ZS5hbmd1bGFyLnBvcyApICk7XG5cbiAgICAgICAgICAgIGNvbGxpc2lvbiA9IHtcbiAgICAgICAgICAgICAgICBib2R5QTogYm9keSxcbiAgICAgICAgICAgICAgICBib2R5QjogZHVtbXksXG4gICAgICAgICAgICAgICAgb3ZlcmxhcDogb3ZlcmxhcCxcbiAgICAgICAgICAgICAgICBub3JtOiB7XG4gICAgICAgICAgICAgICAgICAgIHg6IDAsXG4gICAgICAgICAgICAgICAgICAgIHk6IDFcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG10djoge1xuICAgICAgICAgICAgICAgICAgICB4OiAwLFxuICAgICAgICAgICAgICAgICAgICB5OiBvdmVybGFwXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBwb3M6IGJvZHkuZ2VvbWV0cnkuZ2V0RmFydGhlc3RIdWxsUG9pbnQoIGRpciwgcmVzdWx0ICkucm90YXRlKCB0cmFucyApLnZhbHVlcygpXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBjb2xsaXNpb25zLnB1c2goY29sbGlzaW9uKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIG90aGVyd2lzZSwgZmluZCB0aGUgcG9pbnQgb2YgYmlnZ2VzdCBvdmVybGFwLCBhbmQgcHVzaCBhbG9uZyB0aGVcbiAgICAgICAgICAgIC8vIG5vcm1hbCB0aGVyZS5cbiAgICAgICAgICAgIGZvciAoeCA9IGFhYmIueCAtIGFhYmIuaHc7IHggPD0gYWFiYi54ICsgYWFiYi5odzsgeCsrKSB7XG4gICAgICAgICAgICAgICAgeSA9IGJvdW5kcy5tYXgueSAtIHRlcnJhaW5IZWlnaHQoeCk7XG4gICAgICAgICAgICAgICAgZGlyLnNldCggeCAtIGJvZHkuc3RhdGUucG9zLngsIHkgLSBib2R5LnN0YXRlLnBvcy55KS5uZWdhdGUoKTtcbiAgICAgICAgICAgICAgICBkaXIucm90YXRlSW52KCB0cmFucy5zZXRSb3RhdGlvbiggYm9keS5zdGF0ZS5hbmd1bGFyLnBvcyApICk7XG4gICAgICAgICAgICAgICAgYm9keS5nZW9tZXRyeS5nZXRGYXJ0aGVzdEh1bGxQb2ludChkaXIsIHJlc3VsdCkucm90YXRlKHRyYW5zKTtcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0Lm5vcm0oKSA+IGRpci5ub3JtKCkgJiYgb3ZlcmxhcCA8IHJlc3VsdC5ub3JtKCkgLSBkaXIubm9ybSgpKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHRoZXJlIGlzIGFuIGFjdHVhbCBjb2xsaXNpb24sIGFuZCB0aGlzIGlzIHRoZSBkZWVwZXN0XG4gICAgICAgICAgICAgICAgICAgIC8vIG92ZXJsYXAgd2UndmUgc2VlbiBzbyBmYXJcbiAgICAgICAgICAgICAgICAgICAgY29sbGlzaW9uWCA9IHg7XG4gICAgICAgICAgICAgICAgICAgIG92ZXJsYXAgPSByZXN1bHQubm9ybSgpIC0gZGlyLm5vcm0oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICggb3ZlcmxhcCA+PSAwICkge1xuICAgICAgICAgICAgICAgIC8vIHdob28gY29weXBhc3RhXG4gICAgICAgICAgICAgICAgeCA9IGNvbGxpc2lvblg7XG4gICAgICAgICAgICAgICAgeSA9IGJvdW5kcy5tYXgueSAtIHRlcnJhaW5IZWlnaHQoeCk7XG4gICAgICAgICAgICAgICAgZGlyLnNldCggeCAtIGJvZHkuc3RhdGUucG9zLngsIHkgLSBib2R5LnN0YXRlLnBvcy55KTtcbiAgICAgICAgICAgICAgICBkaXIucm90YXRlSW52KCB0cmFucy5zZXRSb3RhdGlvbiggYm9keS5zdGF0ZS5hbmd1bGFyLnBvcyApICk7XG4gICAgICAgICAgICAgICAgYm9keS5nZW9tZXRyeS5nZXRGYXJ0aGVzdEh1bGxQb2ludChkaXIsIHJlc3VsdCkucm90YXRlKHRyYW5zKTtcblxuICAgICAgICAgICAgICAgIGNvbGxpc2lvbiA9IHtcbiAgICAgICAgICAgICAgICAgICAgYm9keUE6IGJvZHksXG4gICAgICAgICAgICAgICAgICAgIGJvZHlCOiBkdW1teSxcbiAgICAgICAgICAgICAgICAgICAgb3ZlcmxhcDogb3ZlcmxhcCxcbiAgICAgICAgICAgICAgICAgICAgcG9zOiByZXN1bHQudmFsdWVzKCksXG4gICAgICAgICAgICAgICAgICAgIG5vcm06IGRpci5yb3RhdGUodHJhbnMpLm5vcm1hbGl6ZSgpLnZhbHVlcygpLFxuICAgICAgICAgICAgICAgICAgICBtdHY6IGRpci5tdWx0KG92ZXJsYXApLnZhbHVlcygpLFxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICBjb2xsaXNpb25zLnB1c2goY29sbGlzaW9uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGxlZnRcbiAgICAgICAgb3ZlcmxhcCA9IGJvdW5kcy5taW4ueCAtIChhYWJiLnggLSBhYWJiLmh3KTtcblxuICAgICAgICBpZiAoIG92ZXJsYXAgPj0gMCApe1xuXG4gICAgICAgICAgICBkaXIuc2V0KCAtMSwgMCApLnJvdGF0ZUludiggdHJhbnMuc2V0Um90YXRpb24oIGJvZHkuc3RhdGUuYW5ndWxhci5wb3MgKSApO1xuXG4gICAgICAgICAgICBjb2xsaXNpb24gPSB7XG4gICAgICAgICAgICAgICAgYm9keUE6IGJvZHksXG4gICAgICAgICAgICAgICAgYm9keUI6IGR1bW15LFxuICAgICAgICAgICAgICAgIG92ZXJsYXA6IG92ZXJsYXAsXG4gICAgICAgICAgICAgICAgbm9ybToge1xuICAgICAgICAgICAgICAgICAgICB4OiAtMSxcbiAgICAgICAgICAgICAgICAgICAgeTogMFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgbXR2OiB7XG4gICAgICAgICAgICAgICAgICAgIHg6IC1vdmVybGFwLFxuICAgICAgICAgICAgICAgICAgICB5OiAwXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBwb3M6IGJvZHkuZ2VvbWV0cnkuZ2V0RmFydGhlc3RIdWxsUG9pbnQoIGRpciwgcmVzdWx0ICkucm90YXRlKCB0cmFucyApLnZhbHVlcygpXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBjb2xsaXNpb25zLnB1c2goY29sbGlzaW9uKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHRvcFxuICAgICAgICBvdmVybGFwID0gYm91bmRzLm1pbi55IC0gKGFhYmIueSAtIGFhYmIuaGgpO1xuXG4gICAgICAgIGlmICggb3ZlcmxhcCA+PSAwICl7XG5cbiAgICAgICAgICAgIGRpci5zZXQoIDAsIC0xICkucm90YXRlSW52KCB0cmFucy5zZXRSb3RhdGlvbiggYm9keS5zdGF0ZS5hbmd1bGFyLnBvcyApICk7XG5cbiAgICAgICAgICAgIGNvbGxpc2lvbiA9IHtcbiAgICAgICAgICAgICAgICBib2R5QTogYm9keSxcbiAgICAgICAgICAgICAgICBib2R5QjogZHVtbXksXG4gICAgICAgICAgICAgICAgb3ZlcmxhcDogb3ZlcmxhcCxcbiAgICAgICAgICAgICAgICBub3JtOiB7XG4gICAgICAgICAgICAgICAgICAgIHg6IDAsXG4gICAgICAgICAgICAgICAgICAgIHk6IC0xXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBtdHY6IHtcbiAgICAgICAgICAgICAgICAgICAgeDogMCxcbiAgICAgICAgICAgICAgICAgICAgeTogLW92ZXJsYXBcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHBvczogYm9keS5nZW9tZXRyeS5nZXRGYXJ0aGVzdEh1bGxQb2ludCggZGlyLCByZXN1bHQgKS5yb3RhdGUoIHRyYW5zICkudmFsdWVzKClcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGNvbGxpc2lvbnMucHVzaChjb2xsaXNpb24pO1xuICAgICAgICB9XG5cbiAgICAgICAgc2NyYXRjaC5kb25lKCk7XG4gICAgICAgIHJldHVybiBjb2xsaXNpb25zO1xuICAgIH07XG5cbiAgICAvKlxuICAgICAqIGNoZWNrRWRnZUNvbGxpZGUoIGJvZHksIGJvdW5kcywgZHVtbXkgKSAtPiBBcnJheVxuICAgICAqIC0gYm9keSAoQm9keSk6IFRoZSBib2R5IHRvIGNoZWNrXG4gICAgICogLSBib3VuZHMgKFBoeXNpY3MuYWFiYik6IFRoZSBib3VuZGFyeVxuICAgICAqIC0gZHVtbXk6IChCb2R5KTogVGhlIGR1bW15IGJvZHkgdG8gcHVibGlzaCBhcyB0aGUgc3RhdGljIG90aGVyIGJvZHkgaXQgY29sbGlkZXMgd2l0aFxuICAgICAqICsgKEFycmF5KTogVGhlIGNvbGxpc2lvbiBkYXRhXG4gICAgICpcbiAgICAgKiBDaGVjayBpZiBhIGJvZHkgY29sbGlkZXMgd2l0aCB0aGUgYm91bmRhcnlcbiAgICAgKi9cbiAgICB2YXIgY2hlY2tFZGdlQ29sbGlkZSA9IGZ1bmN0aW9uIGNoZWNrRWRnZUNvbGxpZGUoIGJvZHksIGJvdW5kcywgdGVycmFpbkhlaWdodCwgZHVtbXkgKXtcblxuICAgICAgICByZXR1cm4gY2hlY2tHZW5lcmFsKCBib2R5LCBib3VuZHMsIHRlcnJhaW5IZWlnaHQsIGR1bW15ICk7XG4gICAgfTtcblxuICAgIHZhciBkZWZhdWx0cyA9IHtcblxuICAgICAgICBlZGdlczoge1xuICAgICAgICAgICAgYWFiYjogbnVsbCxcbiAgICAgICAgICAgIHRlcnJhaW5IZWlnaHQ6IGZ1bmN0aW9uICh4KSB7cmV0dXJuIDA7fSxcbiAgICAgICAgfSxcbiAgICAgICAgcmVzdGl0dXRpb246IDAuOTksXG4gICAgICAgIGNvZjogMS4wLFxuICAgICAgICBjaGFubmVsOiAnY29sbGlzaW9uczpkZXRlY3RlZCdcbiAgICB9O1xuXG4gICAgcmV0dXJuIHtcblxuICAgICAgICAvLyBleHRlbmRlZFxuICAgICAgICBpbml0OiBmdW5jdGlvbiggb3B0aW9ucyApe1xuXG4gICAgICAgICAgICBwYXJlbnQuaW5pdC5jYWxsKCB0aGlzICk7XG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMuZGVmYXVsdHMoIGRlZmF1bHRzICk7XG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMoIG9wdGlvbnMgKTtcblxuICAgICAgICAgICAgdGhpcy5zZXRBQUJCKCB0aGlzLm9wdGlvbnMuYWFiYiApO1xuICAgICAgICAgICAgdGhpcy5yZXN0aXR1dGlvbiA9IHRoaXMub3B0aW9ucy5yZXN0aXR1dGlvbjtcblxuICAgICAgICAgICAgdGhpcy5ib2R5ID0gUGh5c2ljcy5ib2R5KCdwb2ludCcsIHtcbiAgICAgICAgICAgICAgICB0cmVhdG1lbnQ6ICdzdGF0aWMnLFxuICAgICAgICAgICAgICAgIHJlc3RpdHV0aW9uOiB0aGlzLm9wdGlvbnMucmVzdGl0dXRpb24sXG4gICAgICAgICAgICAgICAgY29mOiB0aGlzLm9wdGlvbnMuY29mXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogRWRnZUNvbGxpc2lvbkRldGVjdGlvbkJlaGF2aW9yI3NldEFBQkIoIGFhYmIgKSAtPiB0aGlzXG4gICAgICAgICAqIC0gYWFiYiAoUGh5c2ljcy5hYWJiKTogVGhlIGFhYmIgdG8gdXNlIGFzIHRoZSBib3VuZGFyeVxuICAgICAgICAgKlxuICAgICAgICAgKiBTZXQgdGhlIGJvdW5kYXJpZXMgb2YgdGhlIGVkZ2UuXG4gICAgICAgICAqKi9cbiAgICAgICAgc2V0QUFCQjogZnVuY3Rpb24oIGFhYmIgKXtcblxuICAgICAgICAgICAgaWYgKCFhYWJiKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgJ0Vycm9yOiBhYWJiIG5vdCBzZXQnO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLl9lZGdlcyA9IHtcbiAgICAgICAgICAgICAgICBtaW46IHtcbiAgICAgICAgICAgICAgICAgICAgeDogKGFhYmIueCAtIGFhYmIuaHcpLFxuICAgICAgICAgICAgICAgICAgICB5OiAoYWFiYi55IC0gYWFiYi5oaClcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG1heDoge1xuICAgICAgICAgICAgICAgICAgICB4OiAoYWFiYi54ICsgYWFiYi5odyksXG4gICAgICAgICAgICAgICAgICAgIHk6IChhYWJiLnkgKyBhYWJiLmhoKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8vIGV4dGVuZGVkXG4gICAgICAgIGNvbm5lY3Q6IGZ1bmN0aW9uKCB3b3JsZCApe1xuXG4gICAgICAgICAgICB3b3JsZC5vbiggJ2ludGVncmF0ZTp2ZWxvY2l0aWVzJywgdGhpcy5jaGVja0FsbCwgdGhpcyApO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8vIGV4dGVuZGVkXG4gICAgICAgIGRpc2Nvbm5lY3Q6IGZ1bmN0aW9uKCB3b3JsZCApe1xuXG4gICAgICAgICAgICB3b3JsZC5vZmYoICdpbnRlZ3JhdGU6dmVsb2NpdGllcycsIHRoaXMuY2hlY2tBbGwgKTtcbiAgICAgICAgfSxcblxuICAgICAgICAvKiogaW50ZXJuYWxcbiAgICAgICAgICogRWRnZUNvbGxpc2lvbkRldGVjdGlvbkJlaGF2aW9yI2NoZWNrQWxsKCBkYXRhIClcbiAgICAgICAgICogLSBkYXRhIChPYmplY3QpOiBFdmVudCBkYXRhXG4gICAgICAgICAqXG4gICAgICAgICAqIEV2ZW50IGNhbGxiYWNrIHRvIGNoZWNrIGFsbCBib2RpZXMgZm9yIGNvbGxpc2lvbnMgd2l0aCB0aGUgZWRnZVxuICAgICAgICAgKiovXG4gICAgICAgIGNoZWNrQWxsOiBmdW5jdGlvbiggZGF0YSApe1xuXG4gICAgICAgICAgICB2YXIgYm9kaWVzID0gdGhpcy5nZXRUYXJnZXRzKClcbiAgICAgICAgICAgICAgICAsZHQgPSBkYXRhLmR0XG4gICAgICAgICAgICAgICAgLGJvZHlcbiAgICAgICAgICAgICAgICAsY29sbGlzaW9ucyA9IFtdXG4gICAgICAgICAgICAgICAgLHJldFxuICAgICAgICAgICAgICAgICxib3VuZHMgPSB0aGlzLl9lZGdlc1xuICAgICAgICAgICAgICAgICx0ZXJyYWluSGVpZ2h0ID0gXy5tZW1vaXplKHRoaXMub3B0aW9ucy50ZXJyYWluSGVpZ2h0KVxuICAgICAgICAgICAgICAgICxkdW1teSA9IHRoaXMuYm9keVxuICAgICAgICAgICAgICAgIDtcblxuICAgICAgICAgICAgZm9yICggdmFyIGkgPSAwLCBsID0gYm9kaWVzLmxlbmd0aDsgaSA8IGw7IGkrKyApe1xuXG4gICAgICAgICAgICAgICAgYm9keSA9IGJvZGllc1sgaSBdO1xuXG4gICAgICAgICAgICAgICAgLy8gb25seSBkZXRlY3QgZHluYW1pYyBib2RpZXNcbiAgICAgICAgICAgICAgICBpZiAoIGJvZHkudHJlYXRtZW50ID09PSAnZHluYW1pYycgKXtcblxuICAgICAgICAgICAgICAgICAgICByZXQgPSBjaGVja0VkZ2VDb2xsaWRlKCBib2R5LCBib3VuZHMsIHRlcnJhaW5IZWlnaHQsIGR1bW15ICk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCByZXQgKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbGxpc2lvbnMucHVzaC5hcHBseSggY29sbGlzaW9ucywgcmV0ICk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICggY29sbGlzaW9ucy5sZW5ndGggKXtcblxuICAgICAgICAgICAgICAgIHRoaXMuX3dvcmxkLmVtaXQoIHRoaXMub3B0aW9ucy5jaGFubmVsLCB7XG4gICAgICAgICAgICAgICAgICAgIGNvbGxpc2lvbnM6IGNvbGxpc2lvbnNcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbn07XG4iLCJcbnZhciBCYXNlID0gcmVxdWlyZSgnLi9iYXNlJyk7XG52YXIgR3JhcGggPSByZXF1aXJlKCcuL2dyYXBoJyk7XG5cbmZ1bmN0aW9uIHJhbmRvbSggbWluLCBtYXggKXtcbiAgICByZXR1cm4gKE1hdGgucmFuZG9tKCkgKiAobWF4LW1pbikgKyBtaW4pfDBcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBCYXNlLmV4dGVuZChmdW5jdGlvbiBEZW1vKGNvbnRhaW5lciwgb3B0aW9ucykge1xuICAgIEJhc2UuY2FsbCh0aGlzLCBjb250YWluZXIsIG9wdGlvbnMsICdpbWFnZXMvbGFiX2JhY2tncm91bmQuanBnJylcbn0sIHtcbiAgICBtYWtlQ2lyY2xlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBQaHlzaWNzLmJvZHkoJ2NpcmNsZScsIHtcbiAgICAgICAgICAgIHg6IHRoaXMub3B0aW9ucy53aWR0aCAvIDIsXG4gICAgICAgICAgICB5OiA1MCxcbiAgICAgICAgICAgIHZ4OiByYW5kb20oLTUsIDUpLzEwMCxcbiAgICAgICAgICAgIHJhZGl1czogNDAsXG4gICAgICAgICAgICByZXN0aXR1dGlvbjogMC45LFxuICAgICAgICAgICAgc3R5bGVzOiB7XG4gICAgICAgICAgICAgICAgZmlsbFN0eWxlOiAnIzI2OGJkMicsXG4gICAgICAgICAgICAgICAgYW5nbGVJbmRpY2F0b3I6ICcjMTU1NDc5J1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9LFxuICAgIGRyb3BJbkJvZHk6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICB2YXIgYm9keTtcblxuXG4gICAgICAgIHZhciBwZW50ID0gW1xuICAgICAgICAgICAgeyB4OiA1MCwgeTogMCB9XG4gICAgICAgICAgICAseyB4OiAyNSwgeTogLTI1IH1cbiAgICAgICAgICAgICx7IHg6IC0yNSwgeTogLTI1IH1cbiAgICAgICAgICAgICx7IHg6IC01MCwgeTogMCB9XG4gICAgICAgICAgICAseyB4OiAwLCB5OiA1MCB9XG4gICAgICAgIF07XG5cbiAgICAgICAgICAgIHN3aXRjaCAoIHJhbmRvbSggMCwgMyApICl7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gYWRkIGEgY2lyY2xlXG4gICAgICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgICAgICAgICBib2R5ID0gUGh5c2ljcy5ib2R5KCdjaXJjbGUnLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB4OiB0aGlzLm9wdGlvbnMud2lkdGggLyAyXG4gICAgICAgICAgICAgICAgICAgICAgICAseTogNTBcbiAgICAgICAgICAgICAgICAgICAgICAgICx2eDogcmFuZG9tKC01LCA1KS8xMDBcbiAgICAgICAgICAgICAgICAgICAgICAgICxyYWRpdXM6IDQwXG4gICAgICAgICAgICAgICAgICAgICAgICAscmVzdGl0dXRpb246IDAuOVxuICAgICAgICAgICAgICAgICAgICAgICAgLHN0eWxlczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGxTdHlsZTogJyMyNjhiZDInXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLGFuZ2xlSW5kaWNhdG9yOiAnIzE1NTQ3OSdcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGFkZCBhIHNxdWFyZVxuICAgICAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgICAgICAgICAgYm9keSA9IFBoeXNpY3MuYm9keSgncmVjdGFuZ2xlJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6IDUwXG4gICAgICAgICAgICAgICAgICAgICAgICAsaGVpZ2h0OiA1MFxuICAgICAgICAgICAgICAgICAgICAgICAgLHg6IHRoaXMub3B0aW9ucy53aWR0aCAvIDJcbiAgICAgICAgICAgICAgICAgICAgICAgICx5OiA1MFxuICAgICAgICAgICAgICAgICAgICAgICAgLHZ4OiByYW5kb20oLTUsIDUpLzEwMFxuICAgICAgICAgICAgICAgICAgICAgICAgLHJlc3RpdHV0aW9uOiAwLjlcbiAgICAgICAgICAgICAgICAgICAgICAgICxzdHlsZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxsU3R5bGU6ICcjZDMzNjgyJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICxhbmdsZUluZGljYXRvcjogJyM3NTFiNGInXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgICAgICAvLyBhZGQgYSBwb2x5Z29uXG4gICAgICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgICAgICBib2R5ID0gUGh5c2ljcy5ib2R5KCdjb252ZXgtcG9seWdvbicsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZlcnRpY2VzOiBwZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAseDogdGhpcy5vcHRpb25zLndpZHRoIC8gMlxuICAgICAgICAgICAgICAgICAgICAgICAgLHk6IDUwXG4gICAgICAgICAgICAgICAgICAgICAgICAsdng6IHJhbmRvbSgtNSwgNSkvMTAwXG4gICAgICAgICAgICAgICAgICAgICAgICAsYW5nbGU6IHJhbmRvbSggMCwgMiAqIE1hdGguUEkgKVxuICAgICAgICAgICAgICAgICAgICAgICAgLHJlc3RpdHV0aW9uOiAwLjlcbiAgICAgICAgICAgICAgICAgICAgICAgICxzdHlsZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxsU3R5bGU6ICcjODU5OTAwJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICxhbmdsZUluZGljYXRvcjogJyM0MTQ3MDAnXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy53b3JsZC5hZGQoIGJvZHkgKTtcbiAgICB9LFxuICAgIHNldHVwOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciB3b3JsZCA9IHRoaXMud29ybGRcbiAgICAgICAgLy8gd29ybGQuYWRkKFBoeXNpY3MuYmVoYXZpb3IoJ2NvbnN0YW50LWFjY2VsZXJhdGlvbicpKTtcblxuICAgICAgICAvKlxuICAgICAgICB2YXIgaW50ID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIGlmICggd29ybGQuX2JvZGllcy5sZW5ndGggPiA0ICl7XG4gICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbCggaW50ICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmRyb3BJbkJvZHkoKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpLCA3MDApO1xuICAgICAgICovXG5cbiAgICAgICAgdmFyIGNpcmNsZSA9IHRoaXMubWFrZUNpcmNsZSgpXG4gICAgICAgIHRoaXMud29ybGQuYWRkKGNpcmNsZSlcblxuICAgICAgICB2YXIgZ3JhcGggPSBuZXcgR3JhcGgodGhpcy5jb250YWluZXIsIHtcbiAgICAgICAgICAgICdDaXJjbGUnOiB7Ym9keTogY2lyY2xlLCBhdHRyOiAncG9zLnknLCBuYW1lOidDaXJjbGUnLCBtaW5zY2FsZTogNX0sXG4gICAgICAgICAgICAnVmVsWSc6IHtib2R5OiBjaXJjbGUsIGF0dHI6ICd2ZWwueScsIG5hbWU6J1ZlbFknLCBtaW5zY2FsZTogLjF9LFxuICAgICAgICAgICAgJ0FuZ1AnOiB7Ym9keTogY2lyY2xlLCBhdHRyOiAnYW5ndWxhci5wb3MnLCBuYW1lOidBY2NYJywgbWluc2NhbGU6IC4wMDF9LFxuICAgICAgICAgICAgJ0FuZ1YnOiB7Ym9keTogY2lyY2xlLCBhdHRyOiAnYW5ndWxhci52ZWwnLCBuYW1lOidBY2NYJywgbWluc2NhbGU6IC4wMDF9LFxuICAgICAgICB9LCB0aGlzLm9wdGlvbnMuaGVpZ2h0KVxuICAgICAgICB0aGlzLmdyYXBoID0gZ3JhcGhcblxuICAgICAgICB0aGlzLndvcmxkLm9uKCdzdGVwJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZ3JhcGgudXBkYXRlKHdvcmxkLnRpbWVzdGVwKCkpXG4gICAgICAgIH0pO1xuXG4gICAgfVxufSk7XG5cbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICAgIG1ha2VSZWN0OiBtYWtlUmVjdCxcbiAgICBtYWtlUm9jazogbWFrZVJvY2ssXG4gICAgc3VtOiBzdW0sXG4gICAgYXZnOiBhdmcsXG4gICAgc3RkZXY6IHN0ZGV2LFxuICAgIGNvcnJlbGF0aW9uOiBjb3JyZWxhdGlvbixcbn1cblxuZnVuY3Rpb24gc3VtKG51bWJlcnMpIHtcbiAgICBpZiAoIW51bWJlcnMubGVuZ3RoKSByZXR1cm4gMDtcbiAgICByZXR1cm4gbnVtYmVycy5yZWR1Y2UoZnVuY3Rpb24gKGEsIGIpIHtyZXR1cm4gYSArIGJ9KVxufVxuXG5mdW5jdGlvbiBhdmcobnVtYmVycykge1xuICAgIGlmICghbnVtYmVycy5sZW5ndGgpIHJldHVybiAwO1xuICAgIHJldHVybiBzdW0obnVtYmVycykgLyBudW1iZXJzLmxlbmd0aFxufVxuXG5mdW5jdGlvbiBzdGRldihudW1iZXJzKSB7XG4gICAgaWYgKCFudW1iZXJzLmxlbmd0aCkgcmV0dXJuIDA7XG4gICAgdmFyIGEgPSBhdmcobnVtYmVycyk7XG4gICAgcmV0dXJuIE1hdGguc3FydChhdmcoXy5tYXAobnVtYmVycywgZnVuY3Rpb24gKG51bSkge3JldHVybiBNYXRoLnBvdyhudW0gLSBhLCAyKTt9KSkpXG59XG5cbmZ1bmN0aW9uIGNvcnJlbGF0aW9uKGRhdGExLCBkYXRhMikge1xuICAgIGlmICghZGF0YTEubGVuZ3RoIHx8IGRhdGExLmxlbmd0aCAhPSBkYXRhMi5sZW5ndGgpIHJldHVybiAwO1xuICAgIHZhciBhdmcxID0gYXZnKGRhdGExKTtcbiAgICB2YXIgYXZnMiA9IGF2ZyhkYXRhMik7XG4gICAgdmFyIGNvdmFyaWFuY2UgPSBhdmcoXy5tYXAoXG4gICAgICAgIF8uemlwKGRhdGExLCBkYXRhMiksIFxuICAgICAgICBmdW5jdGlvbiAoZGF0YVBhaXIpIHtyZXR1cm4gKGRhdGFQYWlyWzBdIC0gYXZnMSkgKiAoZGF0YVBhaXJbMV0gLSBhdmcyKTt9KSk7XG4gICAgcmV0dXJuIGNvdmFyaWFuY2UgLyAoc3RkZXYoZGF0YTEpICogc3RkZXYoZGF0YTIpKTtcbn1cblxuZnVuY3Rpb24gbWFrZVJlY3QoeCwgeSwgd2lkdGgsIGhlaWdodCkge1xuICAgIHJldHVybiBbXG4gICAgICAgIHt4OiB4IC0gd2lkdGgvMiwgeTogeSAtIGhlaWdodC8yfSxcbiAgICAgICAge3g6IHggKyB3aWR0aC8yLCB5OiB5IC0gaGVpZ2h0LzJ9LFxuICAgICAgICB7eDogeCArIHdpZHRoLzIsIHk6IHkgKyBoZWlnaHQvMn0sXG4gICAgICAgIHt4OiB4IC0gd2lkdGgvMiwgeTogeSArIGhlaWdodC8yfSxcbiAgICBdXG59XG5cbi8vIE5vdCBhIGNvbnZleCBodWxsIDooXG5mdW5jdGlvbiBtYWtlUm9jayhyYWRpdXMsIGRldmlhdGlvbiwgcmVzb2x1dGlvbikge1xuICAgIHZhciByZXNvbHV0aW9uID0gcmVzb2x1dGlvbiB8fCAzMlxuICAgIHZhciBkZXZpYXRpb24gPSBkZXZpYXRpb24gfHwgMTBcbiAgICB2YXIgcG9pbnRzID0gW11cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlc29sdXRpb247IGkrKykge1xuICAgICAgICB2YXIgYW5nID0gaSAvIHJlc29sdXRpb24gKiAyICogTWF0aC5QSTtcbiAgICAgICAgdmFyIHBvaW50ID0geyB4OiByYWRpdXMgKiBNYXRoLmNvcyhhbmcpLCB5OiByYWRpdXMgKiBNYXRoLnNpbihhbmcpIH1cbiAgICAgICAgcG9pbnQueCArPSAoTWF0aC5yYW5kb20oKSkgKiAyICogZGV2aWF0aW9uXG4gICAgICAgIHBvaW50LnkgKz0gKE1hdGgucmFuZG9tKCkpICogMiAqIGRldmlhdGlvblxuICAgICAgICBwb2ludHMucHVzaChwb2ludClcbiAgICB9XG4gICAgcmV0dXJuIHBvaW50c1xufVxuIiwiXG52YXIgYmFraGFuID0gcmVxdWlyZSgnLi9saWInKVxuICAsIG5vZGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWFpbi1jYW52YXMnKVxuXG52YXIgb3B0aW9ucyA9IHtcbiAgICB3aWR0aDogOTAwLFxuICAgIGhlaWdodDogNzAwLFxufVxuXG52YXIgbmFtZSA9IHdpbmRvdy5sb2NhdGlvbi5zZWFyY2gucmVwbGFjZSgvJihcXHcrKT0oW14mXSspL2csIGZ1bmN0aW9uIChyZXMsIGtleSwgdmFsKSB7XG4gICAgb3B0aW9uc1trZXldID0gdmFsLnJlcGxhY2UoL1xcLy8sICcnKVxuICAgIHJldHVybiAnJ1xufSkucmVwbGFjZSgvW15cXHddL2csICcnKVxuaWYgKCFuYW1lKSB7XG4gICAgbmFtZSA9ICdEcm9wJztcbiAgICBvcHRpb25zLndhbGsgPSAndHJ1ZSc7XG59XG5jb25zb2xlLmxvZyhuYW1lLCBvcHRpb25zKVxuXG53aW5kb3cuQktBID0gbmV3IGJha2hhbltuYW1lXShub2RlLCBvcHRpb25zKTtcbndpbmRvdy5CS0EucnVuKCk7XG4iXX0=
