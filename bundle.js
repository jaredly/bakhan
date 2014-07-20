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
       }.bind(this))
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

},{"./step.jsx":19,"./walk-through.jsx":20}],17:[function(require,module,exports){
/** @jsx React.DOM */

var Walkthrough = require('./walk-through.jsx')
var PT = React.PropTypes
var Step = require('./step.jsx')

var DEBUG = false

module.exports = HillsIntro;

function HillsIntro(Exercise, gotHypothesis) {
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
                    DEBUG ? props.onNext() : setTimeout(function () {
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

},{"./step.jsx":19,"./walk-through.jsx":20}],18:[function(require,module,exports){
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
                    DEBUG ? props.onNext() : setTimeout(function () {
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
            }.bind(this))
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
    options = {walk: 'true'};
}
console.log(name, options)

window.BKA = new bakhan[name](node, options);
window.BKA.run();

},{"./lib":15}]},{},[33])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi91c3IvbG9jYWwvbGliL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMva2hhbmFjYWRlbXkvaGFja2F0aG9uL2Jha2hhbi9saWIvYXN0ZXJvaWRzLmpzIiwiL1VzZXJzL2toYW5hY2FkZW15L2hhY2thdGhvbi9iYWtoYW4vbGliL2JhY29uLmpzeCIsIi9Vc2Vycy9raGFuYWNhZGVteS9oYWNrYXRob24vYmFraGFuL2xpYi9iYXNlLmpzIiwiL1VzZXJzL2toYW5hY2FkZW15L2hhY2thdGhvbi9iYWtoYW4vbGliL2NhbmdyYXBoLmpzIiwiL1VzZXJzL2toYW5hY2FkZW15L2hhY2thdGhvbi9iYWtoYW4vbGliL2NhdmVkcmF3LmpzIiwiL1VzZXJzL2toYW5hY2FkZW15L2hhY2thdGhvbi9iYWtoYW4vbGliL2NoZWNrLWNvbGxpc2lvbi5qcyIsIi9Vc2Vycy9raGFuYWNhZGVteS9oYWNrYXRob24vYmFraGFuL2xpYi9kYXRhY2hlY2tlci5qc3giLCIvVXNlcnMva2hhbmFjYWRlbXkvaGFja2F0aG9uL2Jha2hhbi9saWIvZGVtby5qcyIsIi9Vc2Vycy9raGFuYWNhZGVteS9oYWNrYXRob24vYmFraGFuL2xpYi9kcm9wLmpzIiwiL1VzZXJzL2toYW5hY2FkZW15L2hhY2thdGhvbi9iYWtoYW4vbGliL2Ryb3BkYXRhY2hlY2tlci5qcyIsIi9Vc2Vycy9raGFuYWNhZGVteS9oYWNrYXRob24vYmFraGFuL2xpYi9nYXRlLmpzIiwiL1VzZXJzL2toYW5hY2FkZW15L2hhY2thdGhvbi9iYWtoYW4vbGliL2dyYXBoLmpzIiwiL1VzZXJzL2toYW5hY2FkZW15L2hhY2thdGhvbi9iYWtoYW4vbGliL2hpbGxzLmpzIiwiL1VzZXJzL2toYW5hY2FkZW15L2hhY2thdGhvbi9iYWtoYW4vbGliL2hpbGxzZGF0YWNoZWNrZXIuanMiLCIvVXNlcnMva2hhbmFjYWRlbXkvaGFja2F0aG9uL2Jha2hhbi9saWIvaW5kZXguanMiLCIvVXNlcnMva2hhbmFjYWRlbXkvaGFja2F0aG9uL2Jha2hhbi9saWIvaW50cm8vZHJvcF9pbnRyby5qc3giLCIvVXNlcnMva2hhbmFjYWRlbXkvaGFja2F0aG9uL2Jha2hhbi9saWIvaW50cm8vaGlsbHNfaW50cm8uanN4IiwiL1VzZXJzL2toYW5hY2FkZW15L2hhY2thdGhvbi9iYWtoYW4vbGliL2ludHJvL25ld3RvbjFfaW50cm8uanN4IiwiL1VzZXJzL2toYW5hY2FkZW15L2hhY2thdGhvbi9iYWtoYW4vbGliL2ludHJvL3N0ZXAuanN4IiwiL1VzZXJzL2toYW5hY2FkZW15L2hhY2thdGhvbi9iYWtoYW4vbGliL2ludHJvL3dhbGstdGhyb3VnaC5qc3giLCIvVXNlcnMva2hhbmFjYWRlbXkvaGFja2F0aG9uL2Jha2hhbi9saWIvbG9nYm9vay5qcyIsIi9Vc2Vycy9raGFuYWNhZGVteS9oYWNrYXRob24vYmFraGFuL2xpYi9tb29uLmpzIiwiL1VzZXJzL2toYW5hY2FkZW15L2hhY2thdGhvbi9iYWtoYW4vbGliL25ldy1hc3Rlcm9pZC1idXR0b24uanN4IiwiL1VzZXJzL2toYW5hY2FkZW15L2hhY2thdGhvbi9iYWtoYW4vbGliL25ld3RvbjEuanMiLCIvVXNlcnMva2hhbmFjYWRlbXkvaGFja2F0aG9uL2Jha2hhbi9saWIvbmV3dG9uMWRhdGFjaGVja2VyLmpzIiwiL1VzZXJzL2toYW5hY2FkZW15L2hhY2thdGhvbi9iYWtoYW4vbGliL29yYml0LmpzIiwiL1VzZXJzL2toYW5hY2FkZW15L2hhY2thdGhvbi9iYWtoYW4vbGliL3BsYXlwYXVzZS5qcyIsIi9Vc2Vycy9raGFuYWNhZGVteS9oYWNrYXRob24vYmFraGFuL2xpYi9zbG9wZS5qcyIsIi9Vc2Vycy9raGFuYWNhZGVteS9oYWNrYXRob24vYmFraGFuL2xpYi9zdG9wd2F0Y2guanMiLCIvVXNlcnMva2hhbmFjYWRlbXkvaGFja2F0aG9uL2Jha2hhbi9saWIvdGVycmFpbi5qcyIsIi9Vc2Vycy9raGFuYWNhZGVteS9oYWNrYXRob24vYmFraGFuL2xpYi90cnktZ3JhcGguanMiLCIvVXNlcnMva2hhbmFjYWRlbXkvaGFja2F0aG9uL2Jha2hhbi9saWIvdXRpbC5qcyIsIi9Vc2Vycy9raGFuYWNhZGVteS9oYWNrYXRob24vYmFraGFuL3J1bi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0tBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0UEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0TkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbE5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDelNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgR2F0ZSA9IHJlcXVpcmUoJy4vZ2F0ZScpO1xudmFyIEJhc2UgPSByZXF1aXJlKCcuL2Jhc2UnKTtcbnZhciBTdG9wd2F0Y2ggPSByZXF1aXJlKCcuL3N0b3B3YXRjaCcpO1xudmFyIFBsYXlQYXVzZSA9IHJlcXVpcmUoJy4vcGxheXBhdXNlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gQmFzZS5leHRlbmQoZnVuY3Rpb24gQXN0ZXJvaWRzKGNvbnRhaW5lciwgb3B0aW9ucykge1xuICAgIEJhc2UuY2FsbCh0aGlzLCBjb250YWluZXIsIG9wdGlvbnMsICdpbWFnZXMvc3BhY2VfYmFja2dyb3VuZC5qcGcnLFxuICAgICAgICB0cnVlKVxufSwge1xuICAgIHNldHVwOiBmdW5jdGlvbiAoY29udGFpbmVyKSB7XG4gICAgICAgIHZhciB3b3JsZCA9IHRoaXMud29ybGQ7XG4gICAgICAgIHdvcmxkLmFkZChQaHlzaWNzLmJvZHkoJ2NpcmNsZScsIHtcbiAgICAgICAgICAgIHg6IDQwMFxuICAgICAgICAgICAgLHk6IDM1MFxuICAgICAgICAgICAgLHZ4OiAtMS4zLzUwXG4gICAgICAgICAgICAscmFkaXVzOiAxMFxuICAgICAgICAgICAgLG1hc3M6IDEwMDBcbiAgICAgICAgICAgICxyZXN0aXR1dGlvbjogMFxuICAgICAgICAgICAgLHN0eWxlczoge1xuICAgICAgICAgICAgICAgIGZpbGxTdHlsZTogJyNmZmNjMDAnXG4gICAgICAgICAgICAgICAgLGFuZ2xlSW5kaWNhdG9yOiAnIzE1NTQ3OSdcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkpO1xuICAgICAgICB3b3JsZC5hZGQoUGh5c2ljcy5ib2R5KCdjaXJjbGUnLCB7XG4gICAgICAgICAgICB4OiA0MDBcbiAgICAgICAgICAgICx5OiA1MFxuICAgICAgICAgICAgLHZ4OiAxLjNcbiAgICAgICAgICAgICxyYWRpdXM6IDVcbiAgICAgICAgICAgICxtYXNzOiAyMFxuICAgICAgICAgICAgLHJlc3RpdHV0aW9uOiAwXG4gICAgICAgICAgICAsc3R5bGVzOiB7XG4gICAgICAgICAgICAgICAgZmlsbFN0eWxlOiAnIzI2ZWI2MicgLy9ncmVlblxuICAgICAgICAgICAgICAgICxhbmdsZUluZGljYXRvcjogJyMxNTU0NzknXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pKTtcbiAgICAgICAgd29ybGQuYWRkKFBoeXNpY3MuYmVoYXZpb3IoJ25ld3RvbmlhbicsIHsgc3RyZW5ndGg6IC41IH0pKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCAxMDA7IGkrKykge1xuICAgICAgICAgICAgdmFyIHIgPSBNYXRoLnJhbmRvbSgpICogMTAgKyAyOTU7XG4gICAgICAgICAgICB2YXIgdGggPSAoLTEvNiAtIDAuMDA1ICsgTWF0aC5yYW5kb20oKSAqIDAuMDEpICogTWF0aC5QSTtcbiAgICAgICAgICAgIHdvcmxkLmFkZChQaHlzaWNzLmJvZHkoJ2NpcmNsZScsIHtcbiAgICAgICAgICAgICAgICB4OiBNYXRoLmNvcyh0aCkgKiByICsgNDAwXG4gICAgICAgICAgICAgICAgLHk6IE1hdGguc2luKHRoKSAqIHIgKyAzNTBcbiAgICAgICAgICAgICAgICAsdng6IC0xLjMgKiBNYXRoLnNpbih0aClcbiAgICAgICAgICAgICAgICAsdnk6IDEuMyAqIE1hdGguY29zKHRoKVxuICAgICAgICAgICAgICAgICxyYWRpdXM6IDJcbiAgICAgICAgICAgICAgICAsbWFzczogTWF0aC5wb3coMTAsIE1hdGgucmFuZG9tKCkgKiAyKSAqIDAuMDAwMDFcbiAgICAgICAgICAgICAgICAscmVzdGl0dXRpb246IDBcbiAgICAgICAgICAgICAgICAsc3R5bGVzOiB7XG4gICAgICAgICAgICAgICAgICAgIGZpbGxTdHlsZTogJyNkZDIyMjInIC8vcmVkXG4gICAgICAgICAgICAgICAgICAgICxhbmdsZUluZGljYXRvcjogJyMxNTU0NzknXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGJ1dHRvbkNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChidXR0b25Db250YWluZXIpO1xuICAgICAgICB2YXIgcGxheVBhdXNlID0gbmV3IFBsYXlQYXVzZSh3b3JsZCwgYnV0dG9uQ29udGFpbmVyKTtcbiAgICB9XG59KTtcblxuICAgICAgICBcbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xuXG52YXIgV2Fsa3Rocm91Z2ggPSByZXF1aXJlKCcuL2ludHJvL3dhbGstdGhyb3VnaC5qc3gnKVxudmFyIFN0ZXAgPSByZXF1aXJlKCcuL2ludHJvL3N0ZXAuanN4JylcblxubW9kdWxlLmV4cG9ydHMgPSBCYWNvbjtcblxuZnVuY3Rpb24gQmFjb24oY29udGFpbmVyLCBvcHRpb25zKSB7XG4gICAgdmFyIG5vZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKG5vZGUpO1xuICAgIFJlYWN0LnJlbmRlckNvbXBvbmVudChXYWxrdGhyb3VnaCh7XG4gICAgICAgIHN0ZXBzOiBzdGVwcyxcbiAgICB9KSwgbm9kZSk7XG59XG5cbkJhY29uLnByb3RvdHlwZSA9IHtcbiAgICBydW46IGZ1bmN0aW9uICgpIHt9LFxufTtcblxudmFyIHN0ZXBzID0gW1xuICAgIGZ1bmN0aW9uIChwcm9wcykge1xuICAgICAgICByZXR1cm4gU3RlcChfLmV4dGVuZChwcm9wcywge1xuICAgICAgICAgICAgaWQ6ICdjb25ncmF0cycsXG4gICAgICAgICAgICB0aXRsZTogXCJDb25ncmF0dWxhdGlvbnMhXCIsXG4gICAgICAgICAgICBzaG93QmFjb246IHRydWUsXG4gICAgICAgICAgICBib2R5OiBSZWFjdC5ET00uZGl2KG51bGwsIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5wKG51bGwsIFwiVGhhdCB3YXMgc29tZSBhd2Vzb21lIFNjaWVuY2UgeW91IGRpZCB0aGVyZSEgIFlvdSd2ZSBmaW5pc2hlZCBhbGwgb2YgbXkgZXhwZXJpbWVudHMuIFlvdSBlYXJuZWQgdGhlIFwiLCBSZWFjdC5ET00uc3Ryb25nKG51bGwsIFwiQmFjb24gQmFkZ2VcIiksIFwiIGZvciB5b3VyIHdvcmsuXCIpLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00ucCh7Y2xhc3NOYW1lOiBcImJhY29uLWJhZGdlLWNvbnRhaW5lclwifSwgUmVhY3QuRE9NLmltZyh7Y2xhc3NOYW1lOiBcImJhY29uLWJhZGdlXCIsIHNyYzogXCIvaW1hZ2VzL2JhY29uLnBuZ1wifSkpXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgbmV4dDogXCJXaGF0J3MgbmV4dD9cIlxuICAgICAgICB9KSk7XG4gICAgfSxcblxuICAgIGZ1bmN0aW9uIChwcm9wcykge1xuICAgICAgICByZXR1cm4gU3RlcChfLmV4dGVuZChwcm9wcywge1xuICAgICAgICAgICAgaWQ6ICduZXh0JyxcbiAgICAgICAgICAgIHRpdGxlOiBcIkRvIG1vcmUgc2NpZW5jZSFcIixcbiAgICAgICAgICAgIHNob3dCYWNvbjogdHJ1ZSxcbiAgICAgICAgICAgIGJvZHk6IFJlYWN0LkRPTS5kaXYobnVsbCwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLnAobnVsbCwgXCJJZiB5b3Ugd2FudCB0byBsZWFybiBtb3JlIHNjaWVuY2UsIGNoZWNrIG91dCB0aGUgXCIsIFJlYWN0LkRPTS5hKHtocmVmOiBcIi8va2hhbmFjYWRlbXkub3JnL3NjaWVuY2UvcGh5c2ljc1wifSwgXCJwaHlzaWNzXCIpLCBcIiBzZWN0aW9uIG9uIEtoYW4gQWNhZGVteS4gIEhhdmUgZnVuIVwiKVxuICAgICAgICAgICAgKSxcbiAgICAgICAgfSkpO1xuICAgIH0sXG5dO1xuIiwiXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2U7XG5cbmZ1bmN0aW9uIEJhc2UoY29udGFpbmVyLCBvcHRpb25zLCBiYWNrZ3JvdW5kLCBkaXNhYmxlQm91bmRzKSB7XG4gICAgdGhpcy5jb250YWluZXIgPSBjb250YWluZXJcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zXG4gICAgJCgnLmJhY2tncm91bmQnKS5hdHRyKCdzcmMnLCBiYWNrZ3JvdW5kKTtcbiAgICB0aGlzLl9zZXR1cFdvcmxkKGRpc2FibGVCb3VuZHMpXG4gICAgdGhpcy5zZXR1cChjb250YWluZXIpXG4gICAgLy8gaW5pdCBzdHVmZlxufVxuXG5CYXNlLmV4dGVuZCA9IGZ1bmN0aW9uIChzdWIsIHByb3RvKSB7XG4gICAgc3ViLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoQmFzZS5wcm90b3R5cGUpXG4gICAgc3ViLmNvbnN0cnVjdG9yID0gc3ViXG4gICAgZm9yICh2YXIgbmFtZSBpbiBwcm90bykge1xuICAgICAgICBpZiAocHJvdG8uaGFzT3duUHJvcGVydHkobmFtZSkpIHtcbiAgICAgICAgICAgIHN1Yi5wcm90b3R5cGVbbmFtZV0gPSBwcm90b1tuYW1lXVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBzdWJcbn1cblxuQmFzZS5wcm90b3R5cGUgPSB7XG5cbiAgICBfc2V0dXBXb3JsZDogZnVuY3Rpb24gKGRpc2FibGVCb3VuZHMpIHtcbiAgICAgICAgdmFyIHdvcmxkID0gdGhpcy53b3JsZCA9IFBoeXNpY3MoKVxuICAgICAgICAvLyBjcmVhdGUgYSByZW5kZXJlclxuICAgICAgICB0aGlzLnJlbmRlcmVyID0gUGh5c2ljcy5yZW5kZXJlcignY2FudmFzJywge1xuICAgICAgICAgICAgZWw6IHRoaXMuY29udGFpbmVyLFxuICAgICAgICAgICAgd2lkdGg6IHRoaXMub3B0aW9ucy53aWR0aCxcbiAgICAgICAgICAgIGhlaWdodDogdGhpcy5vcHRpb25zLmhlaWdodFxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy53b3JsZC5hZGQodGhpcy5yZW5kZXJlcik7XG5cbiAgICAgICAgLy8gYWRkIHRoaW5ncyB0byB0aGUgd29ybGRcbiAgICAgICAgdGhpcy53b3JsZC5hZGQoW1xuICAgICAgICAgICAgUGh5c2ljcy5iZWhhdmlvcignaW50ZXJhY3RpdmUtZm9yY2UnLCB7IGVsOiB0aGlzLnJlbmRlcmVyLmVsIH0pLFxuICAgICAgICAgICAgUGh5c2ljcy5iZWhhdmlvcignYm9keS1pbXB1bHNlLXJlc3BvbnNlJyksXG4gICAgICAgICAgICBQaHlzaWNzLmJlaGF2aW9yKCdib2R5LWNvbGxpc2lvbi1kZXRlY3Rpb24nKSxcbiAgICAgICAgICAgIFBoeXNpY3MuYmVoYXZpb3IoJ3N3ZWVwLXBydW5lJyksXG4gICAgICAgIF0pO1xuXG4gICAgICAgIGlmICghZGlzYWJsZUJvdW5kcykge1xuICAgICAgICAgICAgdGhpcy53b3JsZC5hZGQoUGh5c2ljcy5iZWhhdmlvcignZWRnZS1jb2xsaXNpb24tZGV0ZWN0aW9uJywge1xuICAgICAgICAgICAgICAgIGFhYmI6IFBoeXNpY3MuYWFiYigwLCAwLCB0aGlzLm9wdGlvbnMud2lkdGgsIHRoaXMub3B0aW9ucy5oZWlnaHQpLFxuICAgICAgICAgICAgICAgIHJlc3RpdHV0aW9uOiAwLjIsXG4gICAgICAgICAgICAgICAgY29mOiAwLjhcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfVxuXG5cbiAgICAgICAgLy8gcmVuZGVyIG9uIGVhY2ggc3RlcFxuICAgICAgICB3b3JsZC5vbignc3RlcCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHdvcmxkLnJlbmRlcigpO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBzdWJzY3JpYmUgdG8gdGlja2VyIHRvIGFkdmFuY2UgdGhlIHNpbXVsYXRpb25cbiAgICAgICAgUGh5c2ljcy51dGlsLnRpY2tlci5vbihmdW5jdGlvbiggdGltZSApIHtcbiAgICAgICAgICAgIHdvcmxkLnN0ZXAoIHRpbWUgKTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIHJ1bjogZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyBzdGFydCB0aGUgdGlja2VyXG4gICAgICAgIFBoeXNpY3MudXRpbC50aWNrZXIuc3RhcnQoKTtcbiAgICB9XG59XG4iLCJcbm1vZHVsZS5leHBvcnRzID0gQ2FuR3JhcGhcblxuZnVuY3Rpb24gQ2FuR3JhcGgob3B0aW9ucykge1xuICAgIHRoaXMubyA9IF8uZXh0ZW5kKHtcbiAgICAgICAgbWF4OiA1MDAsXG4gICAgICAgIG1hcmdpbjogMTAsXG4gICAgICAgIG1pbnNjYWxlOiAxLFxuICAgICAgICB0aWNrc2NhbGU6IDUwXG4gICAgfSwgb3B0aW9ucylcbiAgICB0aGlzLnBvaW50cyA9IFtdXG4gICAgdGhpcy5wcmV2c2NhbGUgPSB0aGlzLm8ubWluc2NhbGVcbiAgICB0aGlzLm9mZiA9IDBcbn1cblxuQ2FuR3JhcGgucHJvdG90eXBlID0ge1xuICAgIGRyYXc6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKCF0aGlzLnBvaW50cy5sZW5ndGgpIHJldHVyblxuICAgICAgICB2YXIgY3R4ID0gdGhpcy5vLm5vZGUuZ2V0Q29udGV4dCgnMmQnKVxuICAgICAgICB2YXIgd2lkdGggPSB0aGlzLm8ud2lkdGggLSB0aGlzLm8ubWFyZ2luKjJcbiAgICAgICAgdmFyIGhlaWdodCA9IHRoaXMuby5oZWlnaHQgLSB0aGlzLm8ubWFyZ2luKjJcbiAgICAgICAgdmFyIHRvcCA9IHRoaXMuby50b3AgKyB0aGlzLm8ubWFyZ2luXG4gICAgICAgIHZhciBsZWZ0ID0gdGhpcy5vLmxlZnQgKyB0aGlzLm8ubWFyZ2luXG5cbiAgICAgICAgdmFyIGR4ID0gd2lkdGggLyB0aGlzLnBvaW50cy5sZW5ndGhcbiAgICAgICAgdmFyIG1pbiA9IE1hdGgubWluLmFwcGx5KE1hdGgsIHRoaXMucG9pbnRzKVxuICAgICAgICB2YXIgbWF4ID0gTWF0aC5tYXguYXBwbHkoTWF0aCwgdGhpcy5wb2ludHMpXG4gICAgICAgIHZhciBzY2FsZSA9IG1heCAtIG1pblxuICAgICAgICBpZiAoc2NhbGUgPCB0aGlzLm8ubWluc2NhbGUpIHtcbiAgICAgICAgICAgIHNjYWxlID0gdGhpcy5vLm1pbnNjYWxlXG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNjYWxlIDwgdGhpcy5wcmV2c2NhbGUqLjk5KSB7XG4gICAgICAgICAgICBzY2FsZSA9IHRoaXMucHJldnNjYWxlKi45OVxuICAgICAgICB9XG4gICAgICAgIHZhciBkeSA9IGhlaWdodCAvIHNjYWxlXG4gICAgICAgIGlmIChtYXggLSBtaW4gPCBzY2FsZSkge1xuICAgICAgICAgICAgdmFyIGQgPSBzY2FsZSAtIChtYXgtbWluKVxuICAgICAgICAgICAgbWluIC09IGQvMlxuICAgICAgICAgICAgbWF4ICs9IGQvMlxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5wcmV2c2NhbGUgPSBzY2FsZVxuXG4gICAgICAgIC8vIGRyYXcgeCBheGlzXG4gICAgICAgIGlmIChtaW4gPD0gMCAmJiBtYXggPj0gMCkge1xuICAgICAgICAgICAgY3R4LmJlZ2luUGF0aCgpXG4gICAgICAgICAgICBjdHgubW92ZVRvKGxlZnQsIHRvcCArIGhlaWdodCAtICgtbWluKSpkeSlcbiAgICAgICAgICAgIGN0eC5saW5lVG8obGVmdCArIHdpZHRoLCB0b3AgKyBoZWlnaHQgLSAoLW1pbikqZHkpXG4gICAgICAgICAgICBjdHguc3Ryb2tlU3R5bGUgPSAnI2NjYydcbiAgICAgICAgICAgIGN0eC5zdHJva2UoKVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gZHJhdyB0aWNrc1xuICAgICAgICB2YXIgdGlja3RvcCA9IHRvcCArIGhlaWdodCAtICgtbWluKSpkeSAtIDVcbiAgICAgICAgaWYgKHRpY2t0b3AgPCB0b3ApIHtcbiAgICAgICAgICAgIHRpY2t0b3AgPSB0b3BcbiAgICAgICAgfVxuICAgICAgICBpZiAodGlja3RvcCArIDEwID4gdG9wICsgaGVpZ2h0KSB7XG4gICAgICAgICAgICB0aWNrdG9wID0gdG9wICsgaGVpZ2h0IC0gMTBcbiAgICAgICAgfVxuICAgICAgICBmb3IgKHZhciBpPXRoaXMub2ZmOyBpPHRoaXMucG9pbnRzLmxlbmd0aDsgaSs9dGhpcy5vLnRpY2tzY2FsZSkge1xuICAgICAgICAgICAgY3R4LmJlZ2luUGF0aCgpXG4gICAgICAgICAgICBjdHgubW92ZVRvKGxlZnQgKyBpKmR4LCB0aWNrdG9wKVxuICAgICAgICAgICAgY3R4LmxpbmVUbyhsZWZ0ICsgaSpkeCwgdGlja3RvcCArIDEwKVxuICAgICAgICAgICAgY3R4LnN0cm9rZVN0eWxlID0gJyNjY2MnXG4gICAgICAgICAgICBjdHguc3Ryb2tlKClcbiAgICAgICAgfVxuXG5cbiAgICAgICAgLy8gZHJhdyBsaW5lXG4gICAgICAgIGN0eC5iZWdpblBhdGgoKVxuICAgICAgICB0aGlzLnBvaW50cy5tYXAoZnVuY3Rpb24gKHAsIHgpIHtcbiAgICAgICAgICAgIGN0eC5saW5lVG8obGVmdCArIHggKiBkeCwgdG9wICsgaGVpZ2h0IC0gKHAgLSBtaW4pICogZHkpXG4gICAgICAgIH0pXG4gICAgICAgIGN0eC5zdHJva2VTdHlsZSA9ICdibHVlJ1xuICAgICAgICBjdHgubGluZVdpZHRoID0gMVxuICAgICAgICBjdHguc3Ryb2tlKClcblxuICAgICAgICAvLyBkcmF3IHRpdGxlXG4gICAgICAgIHZhciB0aCA9IDEwXG4gICAgICAgIGN0eC5mb250ID0gdGggKyAncHQgQXJpYWwnXG4gICAgICAgIHZhciB0dyA9IGN0eC5tZWFzdXJlVGV4dCh0aGlzLm8udGl0bGUpLndpZHRoXG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSAnYmxhY2snXG4gICAgICAgIGN0eC5nbG9iYWxBbHBoYSA9IDFcbiAgICAgICAgY3R4LmNsZWFyUmVjdChsZWZ0LCB0b3AsIHR3LCB0aCArIDUpXG4gICAgICAgIGN0eC5maWxsVGV4dCh0aGlzLm8udGl0bGUsIGxlZnQsIHRvcCArIHRoKVxuXG5cbiAgICAgICAgLy8gZHJhdyByZWN0XG4gICAgICAgIGN0eC5zdHJva2VTdHlsZSA9ICcjNjY2J1xuICAgICAgICBjdHgucmVjdCh0aGlzLm8ubGVmdCArIHRoaXMuby5tYXJnaW4vMix0aGlzLm8udG9wICsgdGhpcy5vLm1hcmdpbi8yLHRoaXMuby53aWR0aCAtIHRoaXMuby5tYXJnaW4sdGhpcy5vLmhlaWdodCAtIHRoaXMuby5tYXJnaW4pXG4gICAgICAgIGN0eC5zdHJva2UoKVxuICAgIH0sXG4gICAgYWRkUG9pbnQ6IGZ1bmN0aW9uIChwb2ludCkge1xuICAgICAgICB0aGlzLnBvaW50cy5wdXNoKHBvaW50KVxuICAgICAgICBpZiAodGhpcy5wb2ludHMubGVuZ3RoID4gdGhpcy5vLm1heCkge1xuICAgICAgICAgICAgdGhpcy5vZmYgLT0gdGhpcy5wb2ludHMubGVuZ3RoIC0gdGhpcy5vLm1heFxuICAgICAgICAgICAgdGhpcy5vZmYgJT0gdGhpcy5vLnRpY2tzY2FsZVxuICAgICAgICAgICAgdGhpcy5wb2ludHMgPSB0aGlzLnBvaW50cy5zbGljZSgtdGhpcy5vLm1heClcbiAgICAgICAgfVxuICAgIH1cbn1cblxuIiwibW9kdWxlLmV4cG9ydHMgPSBDYXZlRHJhdztcblxuZnVuY3Rpb24gQ2F2ZURyYXcoY29udGFpbmVyLCB3aWR0aCwgaGVpZ2h0KSB7XG4gICAgdGhpcy5jb250YWluZXIgPSAkKGNvbnRhaW5lcilcbiAgICB0aGlzLmNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpXG4gICAgdGhpcy5jYW52YXMud2lkdGggPSB3aWR0aFxuICAgIHRoaXMuY2FudmFzLmhlaWdodCA9IGhlaWdodFxuICAgIGNvbnRhaW5lci5hcHBlbmQodGhpcy5jYW52YXMpXG59XG5cbkNhdmVEcmF3LnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oZm4pIHtcbiAgICBkZWZpbmVQYXRoKHRoaXMuY2FudmFzLCBmbilcbiAgICBkcmF3UGF0aCh0aGlzLmNhbnZhcylcbn1cblxuQ2F2ZURyYXcucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGNvbnRleHQgPSB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgIGNvbnRleHQuY2xlYXJSZWN0KDAsIDAsIHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQpXG59XG5cbmZ1bmN0aW9uIGRlZmluZVBhdGgoY2FudmFzLCBmbikge1xuICAgIHZhciBjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gICAgdmFyIHhtYXggPSBjYW52YXMud2lkdGhcbiAgICB2YXIgeW1heCA9IGNhbnZhcy5oZWlnaHRcblxuICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XG4gICAgY29udGV4dC5tb3ZlVG8oMCwgZm4oMCkpO1xuICAgIGZvciAodmFyIHggPSAwOyB4IDwgeG1heCA7IHgrKykge1xuICAgICAgICBjb250ZXh0LmxpbmVUbyh4LCB5bWF4IC0gZm4oeCkpXG4gICAgfVxuXG4gICAgY29udGV4dC5saW5lVG8oeG1heCwgeW1heClcbiAgICBjb250ZXh0LmxpbmVUbygwLCB5bWF4KVxuICAgIGNvbnRleHQuY2xvc2VQYXRoKCk7XG59XG5cbmZ1bmN0aW9uIGRyYXdQYXRoKGNhbnZhcykge1xuICAgIHZhciBjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gICAgY29udGV4dC5saW5lV2lkdGggPSA1O1xuICAgIC8vIGNvbnRleHQuZmlsbFN0eWxlID0gJyM4RUQ2RkYnO1xuICAgIHZhciBncmQgPSBjb250ZXh0LmNyZWF0ZUxpbmVhckdyYWRpZW50KGNhbnZhcy53aWR0aCAvIDIsIDAsIGNhbnZhcy53aWR0aCAvIDIsIGNhbnZhcy5oZWlnaHQpXG4gICAgZ3JkLmFkZENvbG9yU3RvcCgwLCAnIzAwMCcpXG4gICAgZ3JkLmFkZENvbG9yU3RvcCgxLCAnIzc3NycpXG4gICAgY29udGV4dC5maWxsU3R5bGUgPSBncmQ7XG4gICAgLy8gY29udGV4dC5maWxsU3R5bGUgPSAnIzMzMyc7XG4gICAgY29udGV4dC5maWxsKCk7XG4gICAgLy8gY29udGV4dC5zdHJva2VTdHlsZSA9ICdibHVlJztcbiAgICAvLyBjb250ZXh0LnN0cm9rZSgpO1xufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBjaGVja0NvbGxpc2lvbjtcblxuZnVuY3Rpb24gY2hlY2tDb2xsaXNpb24oYm9keUEsIGJvZHlCKSB7XG4gICAgdmFyIHN1cHBvcnRGblN0YWNrID0gW107XG5cbiAgICAvKlxuICAgICAqIGdldFN1cHBvcnRGbiggYm9keUEsIGJvZHlCICkgLT4gRnVuY3Rpb25cbiAgICAgKiAtIGJvZHlBIChPYmplY3QpOiBGaXJzdCBib2R5XG4gICAgICogLSBib2R5QiAoT2JqZWN0KTogU2Vjb25kIGJvZHlcbiAgICAgKiArIChGdW5jdGlvbik6IFRoZSBzdXBwb3J0IGZ1bmN0aW9uXG4gICAgICpcbiAgICAgKiBHZXQgYSBnZW5lcmFsIHN1cHBvcnQgZnVuY3Rpb24gZm9yIHVzZSB3aXRoIEdKSyBhbGdvcml0aG1cbiAgICAgKi9cbiAgICB2YXIgZ2V0U3VwcG9ydEZuID0gZnVuY3Rpb24gZ2V0U3VwcG9ydEZuKCBib2R5QSwgYm9keUIgKXtcblxuICAgICAgICB2YXIgaGFzaCA9IFBoeXNpY3MudXRpbC5wYWlySGFzaCggYm9keUEudWlkLCBib2R5Qi51aWQgKVxuICAgICAgICB2YXIgZm4gPSBzdXBwb3J0Rm5TdGFja1sgaGFzaCBdXG5cbiAgICAgICAgaWYgKCAhZm4gKXtcbiAgICAgICAgICAgIGZuID0gc3VwcG9ydEZuU3RhY2tbIGhhc2ggXSA9IGZ1bmN0aW9uKCBzZWFyY2hEaXIgKXtcblxuICAgICAgICAgICAgICAgIHZhciBzY3JhdGNoID0gUGh5c2ljcy5zY3JhdGNocGFkKClcbiAgICAgICAgICAgICAgICB2YXIgdEEgPSBmbi50QVxuICAgICAgICAgICAgICAgIHZhciB0QiA9IGZuLnRCXG4gICAgICAgICAgICAgICAgdmFyIHZBID0gc2NyYXRjaC52ZWN0b3IoKVxuICAgICAgICAgICAgICAgIHZhciB2QiA9IHNjcmF0Y2gudmVjdG9yKClcbiAgICAgICAgICAgICAgICB2YXIgbWFyZ2luQSA9IGZuLm1hcmdpbkFcbiAgICAgICAgICAgICAgICB2YXIgbWFyZ2luQiA9IGZuLm1hcmdpbkJcbiAgICAgICAgICAgICAgICA7XG5cbiAgICAgICAgICAgICAgICBpZiAoIGZuLnVzZUNvcmUgKXtcbiAgICAgICAgICAgICAgICAgICAgdkEgPSBib2R5QS5nZW9tZXRyeS5nZXRGYXJ0aGVzdENvcmVQb2ludCggc2VhcmNoRGlyLnJvdGF0ZUludiggdEEgKSwgdkEsIG1hcmdpbkEgKS50cmFuc2Zvcm0oIHRBICk7XG4gICAgICAgICAgICAgICAgICAgIHZCID0gYm9keUIuZ2VvbWV0cnkuZ2V0RmFydGhlc3RDb3JlUG9pbnQoIHNlYXJjaERpci5yb3RhdGUoIHRBICkucm90YXRlSW52KCB0QiApLm5lZ2F0ZSgpLCB2QiwgbWFyZ2luQiApLnRyYW5zZm9ybSggdEIgKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB2QSA9IGJvZHlBLmdlb21ldHJ5LmdldEZhcnRoZXN0SHVsbFBvaW50KCBzZWFyY2hEaXIucm90YXRlSW52KCB0QSApLCB2QSApLnRyYW5zZm9ybSggdEEgKTtcbiAgICAgICAgICAgICAgICAgICAgdkIgPSBib2R5Qi5nZW9tZXRyeS5nZXRGYXJ0aGVzdEh1bGxQb2ludCggc2VhcmNoRGlyLnJvdGF0ZSggdEEgKS5yb3RhdGVJbnYoIHRCICkubmVnYXRlKCksIHZCICkudHJhbnNmb3JtKCB0QiApO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHNlYXJjaERpci5uZWdhdGUoKS5yb3RhdGUoIHRCICk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gc2NyYXRjaC5kb25lKHtcbiAgICAgICAgICAgICAgICAgICAgYTogdkEudmFsdWVzKCksXG4gICAgICAgICAgICAgICAgICAgIGI6IHZCLnZhbHVlcygpLFxuICAgICAgICAgICAgICAgICAgICBwdDogdkEudnN1YiggdkIgKS52YWx1ZXMoKVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgZm4udEEgPSBQaHlzaWNzLnRyYW5zZm9ybSgpO1xuICAgICAgICAgICAgZm4udEIgPSBQaHlzaWNzLnRyYW5zZm9ybSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgZm4udXNlQ29yZSA9IGZhbHNlO1xuICAgICAgICBmbi5tYXJnaW4gPSAwO1xuICAgICAgICBmbi50QS5zZXRUcmFuc2xhdGlvbiggYm9keUEuc3RhdGUucG9zICkuc2V0Um90YXRpb24oIGJvZHlBLnN0YXRlLmFuZ3VsYXIucG9zICk7XG4gICAgICAgIGZuLnRCLnNldFRyYW5zbGF0aW9uKCBib2R5Qi5zdGF0ZS5wb3MgKS5zZXRSb3RhdGlvbiggYm9keUIuc3RhdGUuYW5ndWxhci5wb3MgKTtcbiAgICAgICAgZm4uYm9keUEgPSBib2R5QTtcbiAgICAgICAgZm4uYm9keUIgPSBib2R5QjtcblxuICAgICAgICByZXR1cm4gZm47XG4gICAgfTtcblxuICAgIC8qXG4gICAgICogY2hlY2tHSksoIGJvZHlBLCBib2R5QiApIC0+IE9iamVjdFxuICAgICAqIC0gYm9keUEgKE9iamVjdCk6IEZpcnN0IGJvZHlcbiAgICAgKiAtIGJvZHlCIChPYmplY3QpOiBTZWNvbmQgYm9keVxuICAgICAqICsgKE9iamVjdCk6IENvbGxpc2lvbiByZXN1bHRcbiAgICAgKlxuICAgICAqIFVzZSBHSksgYWxnb3JpdGhtIHRvIGNoZWNrIGFyYml0cmFyeSBib2RpZXMgZm9yIGNvbGxpc2lvbnNcbiAgICAgKi9cbiAgICB2YXIgY2hlY2tHSksgPSBmdW5jdGlvbiBjaGVja0dKSyggYm9keUEsIGJvZHlCICl7XG5cbiAgICAgICAgdmFyIHNjcmF0Y2ggPSBQaHlzaWNzLnNjcmF0Y2hwYWQoKVxuICAgICAgICB2YXIgZCA9IHNjcmF0Y2gudmVjdG9yKClcbiAgICAgICAgdmFyIHRtcCA9IHNjcmF0Y2gudmVjdG9yKClcbiAgICAgICAgICAgICxvdmVybGFwXG4gICAgICAgIHZhciByZXN1bHRcbiAgICAgICAgdmFyIHN1cHBvcnRcbiAgICAgICAgdmFyIGNvbGxpc2lvbiA9IGZhbHNlXG4gICAgICAgIHZhciBhYWJiQSA9IGJvZHlBLmFhYmIoKVxuICAgICAgICAgICAgLGRpbUEgPSBNYXRoLm1pbiggYWFiYkEuaHcsIGFhYmJBLmhoIClcbiAgICAgICAgdmFyIGFhYmJCID0gYm9keUIuYWFiYigpXG4gICAgICAgIHZhciBkaW1CID0gTWF0aC5taW4oIGFhYmJCLmh3LCBhYWJiQi5oaCApXG4gICAgICAgIDtcblxuICAgICAgICAvLyBqdXN0IGNoZWNrIHRoZSBvdmVybGFwIGZpcnN0XG4gICAgICAgIHN1cHBvcnQgPSBnZXRTdXBwb3J0Rm4oIGJvZHlBLCBib2R5QiApO1xuICAgICAgICBkLmNsb25lKCBib2R5QS5zdGF0ZS5wb3MgKS52c3ViKCBib2R5Qi5zdGF0ZS5wb3MgKTtcbiAgICAgICAgcmVzdWx0ID0gUGh5c2ljcy5namsoc3VwcG9ydCwgZCwgdHJ1ZSk7XG5cbiAgICAgICAgaWYgKCByZXN1bHQub3ZlcmxhcCApe1xuXG4gICAgICAgICAgICAvLyB0aGVyZSBpcyBhIGNvbGxpc2lvbi4gbGV0J3MgZG8gbW9yZSB3b3JrLlxuICAgICAgICAgICAgY29sbGlzaW9uID0ge1xuICAgICAgICAgICAgICAgIGJvZHlBOiBib2R5QSxcbiAgICAgICAgICAgICAgICBib2R5QjogYm9keUJcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIC8vIGZpcnN0IGdldCB0aGUgbWluIGRpc3RhbmNlIG9mIGJldHdlZW4gY29yZSBvYmplY3RzXG4gICAgICAgICAgICBzdXBwb3J0LnVzZUNvcmUgPSB0cnVlO1xuICAgICAgICAgICAgc3VwcG9ydC5tYXJnaW5BID0gMDtcbiAgICAgICAgICAgIHN1cHBvcnQubWFyZ2luQiA9IDA7XG5cbiAgICAgICAgICAgIHdoaWxlICggcmVzdWx0Lm92ZXJsYXAgJiYgKHN1cHBvcnQubWFyZ2luQSA8IGRpbUEgfHwgc3VwcG9ydC5tYXJnaW5CIDwgZGltQikgKXtcbiAgICAgICAgICAgICAgICBpZiAoIHN1cHBvcnQubWFyZ2luQSA8IGRpbUEgKXtcbiAgICAgICAgICAgICAgICAgICAgc3VwcG9ydC5tYXJnaW5BICs9IDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICggc3VwcG9ydC5tYXJnaW5CIDwgZGltQiApe1xuICAgICAgICAgICAgICAgICAgICBzdXBwb3J0Lm1hcmdpbkIgKz0gMTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXN1bHQgPSBQaHlzaWNzLmdqayhzdXBwb3J0LCBkKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCByZXN1bHQub3ZlcmxhcCB8fCByZXN1bHQubWF4SXRlcmF0aW9uc1JlYWNoZWQgKXtcbiAgICAgICAgICAgICAgICAvLyBUaGlzIGltcGxlbWVudGF0aW9uIGNhbid0IGRlYWwgd2l0aCBhIGNvcmUgb3ZlcmxhcCB5ZXRcbiAgICAgICAgICAgICAgICByZXR1cm4gc2NyYXRjaC5kb25lKGZhbHNlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gY2FsYyBvdmVybGFwXG4gICAgICAgICAgICBvdmVybGFwID0gTWF0aC5tYXgoMCwgKHN1cHBvcnQubWFyZ2luQSArIHN1cHBvcnQubWFyZ2luQikgLSByZXN1bHQuZGlzdGFuY2UpO1xuICAgICAgICAgICAgY29sbGlzaW9uLm92ZXJsYXAgPSBvdmVybGFwO1xuICAgICAgICAgICAgLy8gQFRPRE86IGZvciBub3csIGp1c3QgbGV0IHRoZSBub3JtYWwgYmUgdGhlIG10dlxuICAgICAgICAgICAgY29sbGlzaW9uLm5vcm0gPSBkLmNsb25lKCByZXN1bHQuY2xvc2VzdC5iICkudnN1YiggdG1wLmNsb25lKCByZXN1bHQuY2xvc2VzdC5hICkgKS5ub3JtYWxpemUoKS52YWx1ZXMoKTtcbiAgICAgICAgICAgIGNvbGxpc2lvbi5tdHYgPSBkLm11bHQoIG92ZXJsYXAgKS52YWx1ZXMoKTtcbiAgICAgICAgICAgIC8vIGdldCBhIGNvcnJlc3BvbmRpbmcgaHVsbCBwb2ludCBmb3Igb25lIG9mIHRoZSBjb3JlIHBvaW50cy4uIHJlbGF0aXZlIHRvIGJvZHkgQVxuICAgICAgICAgICAgY29sbGlzaW9uLnBvcyA9IGQuY2xvbmUoIGNvbGxpc2lvbi5ub3JtICkubXVsdCggc3VwcG9ydC5tYXJnaW4gKS52YWRkKCB0bXAuY2xvbmUoIHJlc3VsdC5jbG9zZXN0LmEgKSApLnZzdWIoIGJvZHlBLnN0YXRlLnBvcyApLnZhbHVlcygpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHNjcmF0Y2guZG9uZSggY29sbGlzaW9uICk7XG4gICAgfTtcblxuICAgIC8qXG4gICAgICogY2hlY2tDaXJjbGVzKCBib2R5QSwgYm9keUIgKSAtPiBPYmplY3RcbiAgICAgKiAtIGJvZHlBIChPYmplY3QpOiBGaXJzdCBib2R5XG4gICAgICogLSBib2R5QiAoT2JqZWN0KTogU2Vjb25kIGJvZHlcbiAgICAgKiArIChPYmplY3QpOiBDb2xsaXNpb24gcmVzdWx0XG4gICAgICpcbiAgICAgKiBDaGVjayB0d28gY2lyY2xlcyBmb3IgY29sbGlzaW9ucy5cbiAgICAgKi9cbiAgICB2YXIgY2hlY2tDaXJjbGVzID0gZnVuY3Rpb24gY2hlY2tDaXJjbGVzKCBib2R5QSwgYm9keUIgKXtcblxuICAgICAgICB2YXIgc2NyYXRjaCA9IFBoeXNpY3Muc2NyYXRjaHBhZCgpXG4gICAgICAgIHZhciBkID0gc2NyYXRjaC52ZWN0b3IoKVxuICAgICAgICB2YXIgdG1wID0gc2NyYXRjaC52ZWN0b3IoKVxuICAgICAgICB2YXIgb3ZlcmxhcFxuICAgICAgICB2YXIgY29sbGlzaW9uID0gZmFsc2VcblxuICAgICAgICBkLmNsb25lKCBib2R5Qi5zdGF0ZS5wb3MgKS52c3ViKCBib2R5QS5zdGF0ZS5wb3MgKTtcbiAgICAgICAgb3ZlcmxhcCA9IGQubm9ybSgpIC0gKGJvZHlBLmdlb21ldHJ5LnJhZGl1cyArIGJvZHlCLmdlb21ldHJ5LnJhZGl1cyk7XG5cbiAgICAgICAgLy8gaG1tLi4uIHRoZXkgb3ZlcmxhcCBleGFjdGx5Li4uIGNob29zZSBhIGRpcmVjdGlvblxuICAgICAgICBpZiAoIGQuZXF1YWxzKCBQaHlzaWNzLnZlY3Rvci56ZXJvICkgKXtcblxuICAgICAgICAgICAgZC5zZXQoIDEsIDAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGlmICggb3ZlcmxhcCA+IDAgKXtcbiAgICAgICAgLy8gICAgIC8vIGNoZWNrIHRoZSBmdXR1cmVcbiAgICAgICAgLy8gICAgIGQudmFkZCggdG1wLmNsb25lKGJvZHlCLnN0YXRlLnZlbCkubXVsdCggZHQgKSApLnZzdWIoIHRtcC5jbG9uZShib2R5QS5zdGF0ZS52ZWwpLm11bHQoIGR0ICkgKTtcbiAgICAgICAgLy8gICAgIG92ZXJsYXAgPSBkLm5vcm0oKSAtIChib2R5QS5nZW9tZXRyeS5yYWRpdXMgKyBib2R5Qi5nZW9tZXRyeS5yYWRpdXMpO1xuICAgICAgICAvLyB9XG5cbiAgICAgICAgaWYgKCBvdmVybGFwIDw9IDAgKXtcblxuICAgICAgICAgICAgY29sbGlzaW9uID0ge1xuICAgICAgICAgICAgICAgIGJvZHlBOiBib2R5QSxcbiAgICAgICAgICAgICAgICBib2R5QjogYm9keUIsXG4gICAgICAgICAgICAgICAgbm9ybTogZC5ub3JtYWxpemUoKS52YWx1ZXMoKSxcbiAgICAgICAgICAgICAgICBtdHY6IGQubXVsdCggLW92ZXJsYXAgKS52YWx1ZXMoKSxcbiAgICAgICAgICAgICAgICBwb3M6IGQubm9ybWFsaXplKCkubXVsdCggYm9keUEuZ2VvbWV0cnkucmFkaXVzICkudmFsdWVzKCksXG4gICAgICAgICAgICAgICAgb3ZlcmxhcDogLW92ZXJsYXBcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gc2NyYXRjaC5kb25lKCBjb2xsaXNpb24gKTtcbiAgICB9O1xuXG4gICAgLypcbiAgICAgKiBjaGVja1BhaXIoIGJvZHlBLCBib2R5QiApIC0+IE9iamVjdFxuICAgICAqIC0gYm9keUEgKE9iamVjdCk6IEZpcnN0IGJvZHlcbiAgICAgKiAtIGJvZHlCIChPYmplY3QpOiBTZWNvbmQgYm9keVxuICAgICAqICsgKE9iamVjdCk6IENvbGxpc2lvbiByZXN1bHRcbiAgICAgKlxuICAgICAqIENoZWNrIGEgcGFpciBmb3IgY29sbGlzaW9uc1xuICAgICAqL1xuICAgIHZhciBjaGVja1BhaXIgPSBmdW5jdGlvbiBjaGVja1BhaXIoIGJvZHlBLCBib2R5QiApe1xuXG4gICAgICAgIC8vIGZpbHRlciBvdXQgYm9kaWVzIHRoYXQgZG9uJ3QgY29sbGlkZSB3aXRoIGVhY2ggb3RoZXJcbiAgICAgICAgaWYgKFxuICAgICAgICAgICAgKCBib2R5QS50cmVhdG1lbnQgPT09ICdzdGF0aWMnIHx8IGJvZHlBLnRyZWF0bWVudCA9PT0gJ2tpbmVtYXRpYycgKSAmJlxuICAgICAgICAgICAgICAgICggYm9keUIudHJlYXRtZW50ID09PSAnc3RhdGljJyB8fCBib2R5Qi50cmVhdG1lbnQgPT09ICdraW5lbWF0aWMnIClcbiAgICAgICAgKXtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICggYm9keUEuZ2VvbWV0cnkubmFtZSA9PT0gJ2NpcmNsZScgJiYgYm9keUIuZ2VvbWV0cnkubmFtZSA9PT0gJ2NpcmNsZScgKXtcblxuICAgICAgICAgICAgcmV0dXJuIGNoZWNrQ2lyY2xlcyggYm9keUEsIGJvZHlCICk7XG5cbiAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgcmV0dXJuIGNoZWNrR0pLKCBib2R5QSwgYm9keUIgKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gY2hlY2tQYWlyKGJvZHlBLCBib2R5Qilcbn1cblxuIiwiLyoqIEBqc3ggUmVhY3QuRE9NICovXG5cbnZhciBEYXRhQ2hlY2tlciA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ0RhdGFDaGVja2VyJyxcbiAgICBwcm9wVHlwZXM6IHtcbiAgICAgICAgaW5pdGlhbFRleHQ6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgICAgICAgaW5pdGlhbEh5cG90aGVzaXM6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgICAgICAgcG9zc2libGVIeXBvdGhlc2VzOiBSZWFjdC5Qcm9wVHlwZXMuYXJyYXlPZihSZWFjdC5Qcm9wVHlwZXMuc2hhcGUoe1xuICAgICAgICAgICAgbmFtZTogUmVhY3QuUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICAgICAgICAgICAgYnV0dG9uVGV4dDogUmVhY3QuUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLCAvLyB0aGUgdGV4dCBvbiB0aGUgYnV0dG9uIHRvIGNoYW5nZSB5b3VyIGh5cG90aGVzaXNcbiAgICAgICAgICAgIHRleHQ6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCwgLy8gXCJZb3VyIGh5cG90aGVzaXMgd2FzIDx0ZXh0Pi5cIlxuICAgICAgICB9KSkuaXNSZXF1aXJlZCxcbiAgICAgICAgcmVzdWx0OiBSZWFjdC5Qcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLCAvLyB0YWtlcyBpbiB0aGUgY3VycmVudCBzdGF0ZSBhbmQgcmV0dXJucyBhbiBlcnJvciBzdHJpbmcgZm9yIGZyYW5jaXMgdG8gc2F5LCBvciBudWxsIGlmIHRoZXJlIGFyZSBubyBwcm9ibGVtcyB3aXRoIHRoZSBleHBlcmltZW50LlxuICAgICAgICBuZXh0VVJMOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLCAvLyB0aGUgdXJsIG9mIHRoZSBuZXh0IHRoaW5nLlxuICAgIH0sXG5cbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHRoaXNSZXN1bHQ6IHRoaXMucHJvcHMuaW5pdGlhbFRleHQsXG4gICAgICAgICAgICBwcmV2UmVzdWx0OiAnJyxcbiAgICAgICAgICAgIGh5cG90aGVzaXM6IHRoaXMucHJvcHMuaW5pdGlhbEh5cG90aGVzaXMsIC8vIGEgaHlwb3RoZXNpcy5uYW1lXG4gICAgICAgICAgICBkaXNwcm92ZW46IGZhbHNlLFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICByZW5kZXJIeXBvdGhlc2lzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBoeXBUZXh0ID0gXy5maW5kV2hlcmUoXG4gICAgICAgICAgICB0aGlzLnByb3BzLnBvc3NpYmxlSHlwb3RoZXNlcyxcbiAgICAgICAgICAgIHtuYW1lOiB0aGlzLnN0YXRlLmh5cG90aGVzaXN9KS50ZXh0XG4gICAgICAgIHJldHVybiBSZWFjdC5ET00ucCh7Y2xhc3NOYW1lOiBcImNoZWNrZXJfeW91ci1oeXBvXCJ9LCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5lbShudWxsLCBcIllvdXIgaHlwb3RoZXNpcyBpcyBcIiwgaHlwVGV4dCwgXCIuXCIpXG4gICAgICAgIClcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmRpc3Byb3Zlbikge1xuICAgICAgICAgICAgdmFyIGJ1dHRvbnMgPSBfLm1hcChcbiAgICAgICAgICAgICAgICBfLmZpbHRlcihcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5wb3NzaWJsZUh5cG90aGVzZXMsXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIChoeXApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAodGhpcy5zdGF0ZS5oeXBvdGhlc2lzICE9PSBoeXAubmFtZSk7XG4gICAgICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKSksXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gKGh5cCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gUmVhY3QuRE9NLmJ1dHRvbih7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAga2V5OiBoeXAubmFtZSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiBcImJ0biBidG4tZGVmYXVsdFwiLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY2hhbmdlSHlwb3RoZXNpcyhoeXAubmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LmJpbmQodGhpcyl9LCBcbiAgICAgICAgICAgICAgICAgICAgICAgIGh5cC5idXR0b25UZXh0XG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcblxuICAgICAgICAgICAgcmV0dXJuIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJjaGVja2VyXCJ9LCBcbiAgICAgICAgICAgICAgICB0aGlzLnJlbmRlckh5cG90aGVzaXMoKSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmltZyh7c3JjOiBcImltYWdlcy9zaXItZnJhbmNpcy5qcGVnXCIsIGNsYXNzTmFtZTogXCJjaGVja2VyX2ZyYW5jaXNcIn0pLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwiY2hlY2tlcl9tYWluXCJ9LCBcbiAgICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLnAobnVsbCwgXCJPa2F5LCB3aGljaCByZXN1bHQgZG8gdGhleSBzdXBwb3J0P1wiKSwgXG4gICAgICAgICAgICAgICAgICAgIGJ1dHRvbnNcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc3RhdGUudGhpc1Jlc3VsdCkge1xuICAgICAgICAgICAgcmV0dXJuIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJjaGVja2VyXCJ9LCBcbiAgICAgICAgICAgICAgICB0aGlzLnJlbmRlckh5cG90aGVzaXMoKSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmltZyh7c3JjOiBcImltYWdlcy9zaXItZnJhbmNpcy5qcGVnXCIsIGNsYXNzTmFtZTogXCJjaGVja2VyX2ZyYW5jaXNcIn0pLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwiY2hlY2tlcl9tYWluXCJ9LCBcbiAgICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLnAobnVsbCwgdGhpcy5zdGF0ZS50aGlzUmVzdWx0KSwgXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5idXR0b24oe2NsYXNzTmFtZTogXCJidG4gYnRuLWRlZmF1bHRcIiwgb25DbGljazogdGhpcy5zdXBwb3J0fSwgXCJUaGUgZGF0YSBzdXBwb3J0IG15IGh5cG90aGVzaXMuXCIpLCBcbiAgICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLmJ1dHRvbih7Y2xhc3NOYW1lOiBcImJ0biBidG4tZGVmYXVsdFwiLCBvbkNsaWNrOiB0aGlzLmRpc3Byb3ZlfSwgXCJUaGUgZGF0YSBkaXNwcm92ZSBteSBoeXBvdGhlc2lzLlwiKVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5uZXh0VVJMKSB7XG4gICAgICAgICAgICAgICAgdmFyIGNvbnRpbnVlciA9IFJlYWN0LkRPTS5hKHtjbGFzc05hbWU6IFwiYnRuIGJ0bi1kZWZhdWx0XCIsIGhyZWY6IHRoaXMucHJvcHMubmV4dFVSTH0sIFwiVGhhbmtzISAgV2hhdCdzIG5leHQ/XCIpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB2YXIgY29udGludWVyID0gUmVhY3QuRE9NLnNwYW4obnVsbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImNoZWNrZXJcIn0sIFxuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVySHlwb3RoZXNpcygpLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uaW1nKHtzcmM6IFwiaW1hZ2VzL3Npci1mcmFuY2lzLmpwZWdcIiwgY2xhc3NOYW1lOiBcImNoZWNrZXJfZnJhbmNpc1wifSksIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJjaGVja2VyX21haW5cIn0sIFxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5ET00ucChudWxsLCBcIllvdXIgZXhwZXJpbWVudCBsb29rcyBncmVhdCwgYW5kIEknbSBjb252aW5jZWQuICBIZXJlLCBoYXZlIHNvbWUgYmFjb24uXCIpLCBcbiAgICAgICAgICAgICAgICAgICAgY29udGludWVyLCBcIjtcIlxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgc3VwcG9ydDogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmFza0ZyYW5jaXMoKTtcbiAgICB9LFxuXG4gICAgZGlzcHJvdmU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBkaXNwcm92ZW46IHRydWUsXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBjaGFuZ2VIeXBvdGhlc2lzOiBmdW5jdGlvbiAoaHlwKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgZGlzcHJvdmVuOiBmYWxzZSxcbiAgICAgICAgICAgIGh5cG90aGVzaXM6IGh5cCxcbiAgICAgICAgfSwgdGhpcy5hc2tGcmFuY2lzKTtcbiAgICB9LFxuXG4gICAgYXNrRnJhbmNpczogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHRoaXNSZXN1bHQ6IHRoaXMucHJvcHMucmVzdWx0KHRoaXMuc3RhdGUpLFxuICAgICAgICAgICAgcHJldlJlc3VsdDogdGhpcy5zdGF0ZS50aGlzUmVzdWx0XG4gICAgICAgIH0pO1xuICAgIH1cbn0pXG5cbm1vZHVsZS5leHBvcnRzID0gRGF0YUNoZWNrZXI7XG4iLCJ2YXIgR3JhcGggPSByZXF1aXJlKCcuL2dyYXBoJylcbnZhciBHYXRlID0gcmVxdWlyZSgnLi9nYXRlJyk7XG52YXIgQmFzZSA9IHJlcXVpcmUoJy4vYmFzZScpO1xudmFyIFN0b3B3YXRjaCA9IHJlcXVpcmUoJy4vc3RvcHdhdGNoJyk7XG52YXIgUGxheVBhdXNlID0gcmVxdWlyZSgnLi9wbGF5cGF1c2UnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBCYXNlLmV4dGVuZChmdW5jdGlvbiBEZW1vKGNvbnRhaW5lciwgb3B0aW9ucykge1xuICAgIEJhc2UuY2FsbCh0aGlzLCBjb250YWluZXIsIG9wdGlvbnMsICdpbWFnZXMvbGFiX2JhY2tncm91bmQuanBnJylcbn0sIHtcbiAgICBkcm9wSW5Cb2R5OiBmdW5jdGlvbiAocmFkaXVzLCB5LCBjb2xvcikge1xuICAgICAgICBmdW5jdGlvbiByYW5kb20obWluLCBtYXgpe1xuICAgICAgICAgICAgcmV0dXJuIChNYXRoLnJhbmRvbSgpICogKG1heC1taW4pICsgbWluKXwwXG4gICAgICAgIH1cbiAgICAgICAgdmFyIGJvZHkgPSBQaHlzaWNzLmJvZHkoJ2NpcmNsZScsIHtcbiAgICAgICAgICAgIHg6IDEwMCxcbiAgICAgICAgICAgIHk6IHksXG4gICAgICAgICAgICB2eDogcmFuZG9tKC01LCA1KS8xMDAsXG4gICAgICAgICAgICByYWRpdXM6IHJhZGl1cyxcbiAgICAgICAgICAgIG1hc3M6IDkwMCxcbiAgICAgICAgICAgIHJlc3RpdHV0aW9uOiAwLjksXG4gICAgICAgICAgICBzdHlsZXM6IHtcbiAgICAgICAgICAgICAgICBpbWFnZTogXCJpbWFnZXMvdGVubmlzX2JhbGwucG5nXCJcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcblxuICAgICAgICB0aGlzLndvcmxkLmFkZChib2R5KTtcbiAgICAgICAgcmV0dXJuIGJvZHk7XG4gICAgfSxcbiAgICBzZXR1cDogZnVuY3Rpb24gKGNvbnRhaW5lcikge1xuICAgICAgICB2YXIgd29ybGQgPSB0aGlzLndvcmxkXG4gICAgICAgIHdvcmxkLmFkZChQaHlzaWNzLmJlaGF2aW9yKCdjb25zdGFudC1hY2NlbGVyYXRpb24nKSk7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCA1OyBpKyspIHtcbiAgICAgICAgICAgIHZhciByYWRpdXMgPSAyMCArIDEwICogaTtcbiAgICAgICAgICAgIHRoaXMuZHJvcEluQm9keShyYWRpdXMsIDMwMCAtIGkgKiA1MCk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGNpcmNsZSA9IHRoaXMuZHJvcEluQm9keSg0MCwgMzAwICsgMjAsICdyZWQnKVxuICAgICAgICB2YXIgZ3JhcGggPSBuZXcgR3JhcGgodGhpcy5jb250YWluZXIsIHtcbiAgICAgICAgICAgICdDaXJjbGUnOiB7Ym9keTogY2lyY2xlLCBhdHRyOiAncG9zLnknLCB0aXRsZTonVmVydGljYWwgUG9zaXRpb24nLCBtaW5zY2FsZTogNX0sXG4gICAgICAgICAgICAnVmVsWSc6IHtib2R5OiBjaXJjbGUsIGF0dHI6ICd2ZWwueScsIHRpdGxlOidWZXJ0aWNhbCBWZWxvY2l0eScsIG1pbnNjYWxlOiAuMX0sXG4gICAgICAgICAgICAnQW5nUCc6IHtib2R5OiBjaXJjbGUsIGF0dHI6ICdhbmd1bGFyLnBvcycsIHRpdGxlOidSb3RhdGlvbicsIG1pbnNjYWxlOiAuMDAxfSxcbiAgICAgICAgICAgICdBbmdWJzoge2JvZHk6IGNpcmNsZSwgYXR0cjogJ2FuZ3VsYXIudmVsJywgdGl0bGU6J1JvdGF0aW9uYWwgVmVsb2NpdHknLCBtaW5zY2FsZTogLjAwMX0sXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIHRvcDogMTAsXG4gICAgICAgICAgICBsZWZ0OiB0aGlzLm9wdGlvbnMud2lkdGggLSA0MDAsXG4gICAgICAgICAgICB3aWR0aDogNDAwLFxuICAgICAgICAgICAgd29ybGRIZWlnaHQ6IHRoaXMub3B0aW9ucy5oZWlnaHRcbiAgICAgICAgfSlcbiAgICAgICAgdGhpcy5ncmFwaCA9IGdyYXBoXG5cbiAgICAgICAgdGhpcy53b3JsZC5vbignc3RlcCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGdyYXBoLnVwZGF0ZSh3b3JsZC50aW1lc3RlcCgpKVxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLndvcmxkLmFkZChQaHlzaWNzLmJvZHkoJ3JlY3RhbmdsZScsIHtcbiAgICAgICAgICAgIHg6IDI1MCxcbiAgICAgICAgICAgIHk6IDYwMCxcbiAgICAgICAgICAgIHdpZHRoOiA1MCxcbiAgICAgICAgICAgIGhlaWdodDogNDAwLFxuICAgICAgICAgICAgdHJlYXRtZW50OiAnc3RhdGljJyxcbiAgICAgICAgICAgIHN0eWxlczoge1xuICAgICAgICAgICAgICAgIGZpbGxTdHlsZTogJyNkMzM2ODInLFxuICAgICAgICAgICAgICAgIGFuZ2xlSW5kaWNhdG9yOiAnIzc1MWI0YidcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkpXG5cbiAgICAgICAgdmFyIGJ1dHRvbkNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChidXR0b25Db250YWluZXIpO1xuICAgICAgICB2YXIgcGxheVBhdXNlID0gbmV3IFBsYXlQYXVzZSh3b3JsZCwgYnV0dG9uQ29udGFpbmVyKTtcbiAgICAgICAgZ2F0ZVBvbHlnb24gPSBbe3g6IDAsIHk6IDMwMH0sIHt4OiA3MDAsIHk6IDMwMH0sIHt4OiA3MDAsIHk6IDQwMH0sIHt4OiAwLCB5OiA0MDB9XTtcbiAgICAgICAgdmFyIGdhdGUgPSBuZXcgR2F0ZSh3b3JsZCwgZ2F0ZVBvbHlnb24sIFszNTAsIDcwMF0sIG51bGwsIHtkZWJ1ZzogdHJ1ZSwgc2hvdzogdHJ1ZX0pO1xuICAgICAgICBnYXRlLm9uKCdlbnRlcicsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgIGdhdGUuc3RvcHdhdGNoZXMgPSBnYXRlLnN0b3B3YXRjaGVzIHx8IHt9XG4gICAgICAgICAgICB2YXIgc3RvcHdhdGNoID0gbmV3IFN0b3B3YXRjaCh3b3JsZCwgYnV0dG9uQ29udGFpbmVyLCAxKTtcbiAgICAgICAgICAgIHN0b3B3YXRjaC5yZXNldCgpO1xuICAgICAgICAgICAgc3RvcHdhdGNoLnN0YXJ0KCk7XG4gICAgICAgICAgICBnYXRlLnN0b3B3YXRjaGVzW2RhdGEuYm9keS51aWRdID0gc3RvcHdhdGNoO1xuICAgICAgICB9KTtcbiAgICAgICAgZ2F0ZS5vbignZXhpdCcsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgIGdhdGUuc3RvcHdhdGNoZXNbZGF0YS5ib2R5LnVpZF0uc3RvcCgpXG4gICAgICAgIH0pO1xuICAgIH1cbn0pO1xuXG4iLCJ2YXIgQmFzZSA9IHJlcXVpcmUoJy4vYmFzZScpO1xudmFyIEdhdGUgPSByZXF1aXJlKCcuL2dhdGUnKTtcbnZhciBTdG9wd2F0Y2ggPSByZXF1aXJlKCcuL3N0b3B3YXRjaCcpO1xudmFyIExvZ0Jvb2sgPSByZXF1aXJlKCcuL2xvZ2Jvb2snKTtcbnZhciBQbGF5UGF1c2UgPSByZXF1aXJlKCcuL3BsYXlwYXVzZScpO1xudmFyIERyb3BJbnRybyA9IHJlcXVpcmUoJy4vaW50cm8vZHJvcF9pbnRyby5qc3gnKTtcbnZhciBkcm9wRGF0YUNoZWNrZXIgPSByZXF1aXJlKCcuL2Ryb3BkYXRhY2hlY2tlcicpO1xudmFyIHV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcblxuZnVuY3Rpb24gcmFuZG9tKG1pbiwgbWF4KXtcbiAgICByZXR1cm4gKE1hdGgucmFuZG9tKCkgKiAobWF4LW1pbikgKyBtaW4pfDBcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBCYXNlLmV4dGVuZChmdW5jdGlvbiBEcm9wKGNvbnRhaW5lciwgb3B0aW9ucykge1xuICAgIEJhc2UuY2FsbCh0aGlzLCBjb250YWluZXIsIG9wdGlvbnMsIFwiaW1hZ2VzL2JsdWVfbGFiLmpwZ1wiKVxufSwge1xuICAgIGRyb3BCb3dsaW5nQmFsbDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciByYWRpdXMgPSAzMDtcbiAgICAgICAgdGhpcy53b3JsZC5hZGQoUGh5c2ljcy5ib2R5KCdjaXJjbGUnLCB7XG4gICAgICAgICAgICB4OiA3MDAsXG4gICAgICAgICAgICB5OiAyMDAsXG4gICAgICAgICAgICB2eDogcmFuZG9tKC0zMCwgMzApLzEwMCxcbiAgICAgICAgICAgIHJhZGl1czogcmFkaXVzLFxuICAgICAgICAgICAgbWFzczogOTAwLFxuICAgICAgICAgICAgcmVzdGl0dXRpb246IDAuMDEsXG4gICAgICAgICAgICBjb2Y6IDAuNCxcbiAgICAgICAgICAgIHN0eWxlczoge1xuICAgICAgICAgICAgICAgIGltYWdlOiBcImltYWdlcy9ib3dsaW5nX2JhbGwucG5nXCJcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBkaXNwbGF5TmFtZTogJ0Jvd2xpbmcgQmFsbCcsXG4gICAgICAgIH0pKTtcbiAgICB9LFxuXG4gICAgZHJvcFRlbm5pc0JhbGw6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcmFkaXVzID0gMTU7XG4gICAgICAgIHZhciBiYWxsID0gUGh5c2ljcy5ib2R5KCdjaXJjbGUnLCB7XG4gICAgICAgICAgICB4OiA3MDAsXG4gICAgICAgICAgICB5OiAyMDAsXG4gICAgICAgICAgICB2eDogcmFuZG9tKC0zMCwgMzApLzEwMCxcbiAgICAgICAgICAgIHJhZGl1czogcmFkaXVzLFxuICAgICAgICAgICAgbWFzczogNy41LFxuICAgICAgICAgICAgcmVzdGl0dXRpb246IDEsXG4gICAgICAgICAgICBkaXNwbGF5TmFtZTogJ1Rlbm5pcyBCYWxsJyxcbiAgICAgICAgICAgIHN0eWxlczoge1xuICAgICAgICAgICAgICAgIGltYWdlOiBcImltYWdlcy90ZW5uaXNfYmFsbC5wbmdcIlxuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuXG4gICAgICAgIGlmICghdGhpcy5maXJzdFRlbm5pc0JhbGwpIHtcbiAgICAgICAgICAgIHRoaXMuZmlyc3RUZW5uaXNCYWxsID0gYmFsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMud29ybGQuYWRkKGJhbGwpO1xuICAgIH0sXG5cbiAgICBkZXBsb3lCYWxsczogZnVuY3Rpb24ob25Eb25lKSB7XG4gICAgICAgIHZhciBzcGFjaW5nX21zID0gODAwO1xuICAgICAgICB2YXIgcXVldWUgPSBbXG4gICAgICAgICAgICB0aGlzLmRyb3BUZW5uaXNCYWxsLmJpbmQodGhpcyksXG4gICAgICAgICAgICB0aGlzLmRyb3BUZW5uaXNCYWxsLmJpbmQodGhpcyksXG4gICAgICAgICAgICB0aGlzLmRyb3BCb3dsaW5nQmFsbC5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgdGhpcy5kcm9wVGVubmlzQmFsbC5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgdGhpcy5kcm9wVGVubmlzQmFsbC5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgdGhpcy5kcm9wQm93bGluZ0JhbGwuYmluZCh0aGlzKSxcbiAgICAgICAgICAgIG9uRG9uZVxuICAgICAgICBdO1xuICAgICAgICBfLnJlZHVjZShxdWV1ZSwgZnVuY3Rpb24odCwgYWN0aW9uKSB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KGFjdGlvbiwgdClcbiAgICAgICAgICAgIHJldHVybiB0ICsgc3BhY2luZ19tc1xuICAgICAgICB9LCAwKVxuXG4gICAgICAgIC8vIHNldFRpbWVvdXQodGhpcy5kcm9wVGVubmlzQmFsbC5iaW5kKHRoaXMpLCAwKVxuICAgICAgICAvLyBzZXRUaW1lb3V0KHRoaXMuZHJvcFRlbm5pc0JhbGwuYmluZCh0aGlzKSwgMTAwKVxuICAgICAgICAvLyBzZXRUaW1lb3V0KHRoaXMuZHJvcFRlbm5pc0JhbGwuYmluZCh0aGlzKSwgMjAwKVxuICAgIH0sXG5cbiAgICBzdGFydFdhbGt0aHJvdWdoOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIERyb3BJbnRybyh0aGlzLCBmdW5jdGlvbiAoaHlwb3RoZXNpcykge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ0dvdCB0aGUgaHlwb3RoZXNpcyEhJywgaHlwb3RoZXNpcyk7XG4gICAgICAgICAgICB0aGlzLnNldHVwRGF0YUNoZWNrZXIoaHlwb3RoZXNpcyk7XG4gICAgICAgIH0uYmluZCh0aGlzKSlcbiAgICB9LFxuXG4gICAgc2V0dXBEYXRhQ2hlY2tlcjogZnVuY3Rpb24gKGh5cG90aGVzaXMpIHtcbiAgICAgICAgdmFyIGRhdGFDaGVja2VyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgZGF0YUNoZWNrZXIuY2xhc3NOYW1lID0gXCJkcm9wLWRhdGEtY2hlY2tlclwiO1xuICAgICAgICB0aGlzLnNpZGVCYXIuYXBwZW5kQ2hpbGQoZGF0YUNoZWNrZXIpO1xuICAgICAgICBkcm9wRGF0YUNoZWNrZXIoZGF0YUNoZWNrZXIsIHRoaXMubG9nQm9vaywgaHlwb3RoZXNpcyk7XG4gICAgfSxcblxuICAgIHNldHVwOiBmdW5jdGlvbiAoY29udGFpbmVyKSB7XG4gICAgICAgIHZhciB3b3JsZCA9IHRoaXMud29ybGRcbiAgICAgICAgdmFyIGdyYXZpdHkgPSBQaHlzaWNzLmJlaGF2aW9yKCdjb25zdGFudC1hY2NlbGVyYXRpb24nKVxuICAgICAgICBncmF2aXR5LnNldEFjY2VsZXJhdGlvbih7eDogMCwgeTouMDAwM30pO1xuICAgICAgICB3b3JsZC5hZGQoZ3Jhdml0eSk7XG5cbiAgICAgICAgLy8gU2h1bnQgdHJpYW5nbGVcbiAgICAgICAgdGhpcy53b3JsZC5hZGQoUGh5c2ljcy5ib2R5KCdyZWN0YW5nbGUnLCB7XG4gICAgICAgICAgICB4OiA2MCxcbiAgICAgICAgICAgIHk6IDY5MCxcbiAgICAgICAgICAgIHdpZHRoOiA1MDAsXG4gICAgICAgICAgICBoZWlnaHQ6IDEwMCxcbiAgICAgICAgICAgIGFuZ2xlOiBNYXRoLlBJIC8gNCxcbiAgICAgICAgICAgIHRyZWF0bWVudDogJ3N0YXRpYycsXG4gICAgICAgICAgICBjb2Y6IDEsXG4gICAgICAgICAgICBzdHlsZXM6IHtcbiAgICAgICAgICAgICAgICBmaWxsU3R5bGU6ICcjZDMzNjgyJyxcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkpO1xuXG4gICAgICAgIHZhciBzaWRlQmFyID0gdGhpcy5zaWRlQmFyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgc2lkZUJhci5jbGFzc05hbWUgPSBcInNpZGUtYmFyXCI7XG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChzaWRlQmFyKTtcbiAgICAgICAgdmFyIHRvcEdhdGUgPSBuZXcgR2F0ZSh3b3JsZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1dGlsLm1ha2VSZWN0KDAsIDAsIDIwMCwgMTApLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFsxMjAsIDIwMF0sIG51bGwsIHtkZWJ1ZzogdHJ1ZSwgc2hvdzogdHJ1ZSwgY29sb3I6ICdncmVlbid9KTtcbiAgICAgICAgdmFyIGJvdHRvbUdhdGUgPSBuZXcgR2F0ZSh3b3JsZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1dGlsLm1ha2VSZWN0KDAsIDAsIDIwMCwgMTApLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFsxMjAsIDU1MF0sIG51bGwsIHtkZWJ1ZzogdHJ1ZSwgc2hvdzogdHJ1ZSwgY29sb3I6ICdyZWQnfSk7XG4gICAgICAgIHZhciBsb2dDb2x1bW5zID0gW1xuICAgICAgICAgICAge25hbWU6IFwiQm93bGluZyBCYWxsXCIsIGV4dHJhVGV4dDogXCIgKDcga2cpXCJ9LFxuICAgICAgICAgICAge25hbWU6IFwiVGVubmlzIEJhbGxcIiwgZXh0cmFUZXh0OiBcIiAoNTggZylcIiwgY29sb3I6ICdyZ2IoMTU0LCAyNDEsIDApJ31cbiAgICAgICAgXTtcbiAgICAgICAgdmFyIGxvZ0Jvb2sgPSB0aGlzLmxvZ0Jvb2sgPSBuZXcgTG9nQm9vayh3b3JsZCwgc2lkZUJhciwgNSwgbG9nQ29sdW1ucyk7XG4gICAgICAgIHRvcEdhdGUub24oJ2VudGVyJywgZnVuY3Rpb24oZWxlbSkge1xuICAgICAgICAgICAgdmFyIGNvbE5hbWUgPSBlbGVtLmJvZHkuZGlzcGxheU5hbWUgfHwgZWxlbS5ib2R5Lm5hbWUgfHwgXCJib2R5XCI7XG4gICAgICAgICAgICBsb2dCb29rLmhhbmRsZVN0YXJ0KGNvbE5hbWUsIGVsZW0uYm9keS51aWQpO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICBib3R0b21HYXRlLm9uKCdlbnRlcicsIGZ1bmN0aW9uKGVsZW0pIHtcbiAgICAgICAgICAgIHZhciBjb2xOYW1lID0gZWxlbS5ib2R5LmRpc3BsYXlOYW1lIHx8IGVsZW0uYm9keS5uYW1lIHx8IFwiYm9keVwiO1xuICAgICAgICAgICAgbG9nQm9vay5oYW5kbGVFbmQoY29sTmFtZSwgZWxlbS5ib2R5LnVpZCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHZhciBidXR0b25Db250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICB2YXIgcGxheVBhdXNlID0gbmV3IFBsYXlQYXVzZSh3b3JsZCwgYnV0dG9uQ29udGFpbmVyKTtcbiAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGJ1dHRvbkNvbnRhaW5lcik7XG5cbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy53YWxrKSB7XG4gICAgICAgICAgICB0aGlzLnN0YXJ0V2Fsa3Rocm91Z2goKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gQWRkIHRoZSBiYWxscy5cbiAgICAgICAgICAgIHNldFRpbWVvdXQodGhpcy5kZXBsb3lCYWxscy5iaW5kKHRoaXMpLCA1MDApXG4gICAgICAgICAgICB0aGlzLnNldHVwRGF0YUNoZWNrZXIoJ3NhbWUnKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBQaWNrIHVwIG9uZSBvZiB0aGUgdGVubmlzIGJhbGxzIGFuZCBkcm9wIGl0LlxuICAgICAqXG4gICAgICogQHBhcmFtIGNhbGxiYWNrIEdldHMgY2FsbGVkIHdoZW4gdGhlIGRlbW9uc3RyYXRpb24gaXMgb3Zlci5cbiAgICAgKi9cbiAgICBkZW1vbnN0cmF0ZURyb3A6IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBiYWxsID0gdGhpcy5maXJzdFRlbm5pc0JhbGw7XG4gICAgICAgIHZhciB0YXJnZXRYID0gMTI1O1xuICAgICAgICB2YXIgdGFyZ2V0WSA9IDE3MDtcblxuICAgICAgICBiYWxsLnRyZWF0bWVudCA9ICdraW5lbWF0aWMnO1xuICAgICAgICBiYWxsLnN0YXRlLnZlbC54ID0gKHRhcmdldFggLSBiYWxsLnN0YXRlLnBvcy54KSAvIDE1MDA7XG4gICAgICAgIGJhbGwuc3RhdGUudmVsLnkgPSAodGFyZ2V0WSAtIGJhbGwuc3RhdGUucG9zLnkpIC8gMTUwMDtcbiAgICAgICAgYmFsbC5yZWNhbGMoKTtcblxuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgYmFsbC50cmVhdG1lbnQgPSAnc3RhdGljJztcbiAgICAgICAgICAgIGJhbGwuc3RhdGUucG9zLnggPSB0YXJnZXRYO1xuICAgICAgICAgICAgYmFsbC5zdGF0ZS5wb3MueSA9IHRhcmdldFk7XG4gICAgICAgICAgICBiYWxsLnN0YXRlLnZlbC54ID0gMDtcbiAgICAgICAgICAgIGJhbGwuc3RhdGUudmVsLnkgPSAwO1xuICAgICAgICAgICAgYmFsbC5yZWNhbGMoKTtcblxuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBiYWxsLnRyZWF0bWVudCA9ICdkeW5hbWljJztcbiAgICAgICAgICAgICAgICBiYWxsLnJlY2FsYygpO1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICAgICAgfSwgMzAwMClcbiAgICAgICAgICAgIH0sIDE1MDApXG4gICAgICAgIH0sIDE1MDApXG4gICAgfVxufSk7XG4iLCJ2YXIgRGF0YUNoZWNrZXIgPSByZXF1aXJlKCcuL2RhdGFjaGVja2VyLmpzeCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRyb3BEYXRhQ2hlY2tlcjtcblxudmFyIF9pbml0aWFsVGV4dCA9IFwiRG8gYW4gZXhwZXJpbWVudCB0byBzZWUgaWYgeW91IGNhbiBmaWd1cmUgb3V0IHdoaWNoIGJhbGwgZmFsbHMgZmFzdGVyLCBhbmQgbGV0IG1lIGtub3cgd2hlbiB5b3UncmUgZG9uZSFcIjtcblxudmFyIF9uZXh0VVJMID0gXCI/TmV3dG9uMSZ3YWxrPXRydWVcIjtcblxudmFyIF9oeXBvdGhlc2VzID0gW1xuICAgIHtcbiAgICAgICAgbmFtZTogXCJib3dsaW5nXCIsXG4gICAgICAgIGJ1dHRvblRleHQ6IFwiVGhlIGJvd2xpbmcgYmFsbCBmYWxscyBmYXN0ZXIuXCIsXG4gICAgICAgIHRleHQ6IFwidGhhdCB0aGUgYm93bGluZyBiYWxsIHdpbGwgZmFsbCBmYXN0ZXJcIixcbiAgICB9LFxuICAgIHtcbiAgICAgICAgbmFtZTogXCJ0ZW5uaXNcIixcbiAgICAgICAgYnV0dG9uVGV4dDogXCJUaGUgdGVubmlzIGJhbGwgZmFsbHMgZmFzdGVyLlwiLFxuICAgICAgICB0ZXh0OiBcInRoYXQgdGhlIHRlbm5pcyBiYWxsIHdpbGwgZmFsbCBmYXN0ZXJcIixcbiAgICB9LFxuICAgIHtcbiAgICAgICAgbmFtZTogXCJzYW1lXCIsXG4gICAgICAgIGJ1dHRvblRleHQ6IFwiQm90aCBiYWxscyBmYWxsIGF0IHRoZSBzYW1lIHJhdGUuXCIsXG4gICAgICAgIHRleHQ6IFwidGhhdCBib3RoIGJhbGxzIHdpbGwgZmFsbCBhdCB0aGUgc2FtZSByYXRlXCIsXG4gICAgfSxcbl07XG4gICAgXG5cbmZ1bmN0aW9uIGRyb3BEYXRhQ2hlY2tlcihjb250YWluZXIsIGxvZ0Jvb2ssIGh5cG90aGVzaXMpIHtcbiAgICByZXR1cm4gUmVhY3QucmVuZGVyQ29tcG9uZW50KERhdGFDaGVja2VyKHtcbiAgICAgICAgaW5pdGlhbFRleHQ6IF9pbml0aWFsVGV4dCxcbiAgICAgICAgaW5pdGlhbEh5cG90aGVzaXM6IGh5cG90aGVzaXMsXG4gICAgICAgIHBvc3NpYmxlSHlwb3RoZXNlczogX2h5cG90aGVzZXMsXG4gICAgICAgIHJlc3VsdDogZnVuY3Rpb24gKHN0YXRlKSB7cmV0dXJuIF9yZXN1bHQobG9nQm9vaywgc3RhdGUpO30sXG4gICAgICAgIG5leHRVUkw6IF9uZXh0VVJMLFxuICAgIH0pLCBjb250YWluZXIpO1xufVxuXG5mdW5jdGlvbiBfcmVzdWx0KGxvZ0Jvb2ssIHN0YXRlKSB7XG4gICAgLy8gd2UgcmV0dXJuIHRoZSBlcnJvciwgb3IgbnVsbCBpZiB0aGV5J3JlIGNvcnJlY3RcbiAgICB2YXIgZW5vdWdoRGF0YSA9IF8uYWxsKGxvZ0Jvb2suZGF0YSwgZnVuY3Rpb24gKGQpIHtyZXR1cm4gZC5sZW5ndGggPj0gNTt9KTtcbiAgICBpZiAoZW5vdWdoRGF0YSkge1xuICAgICAgICB2YXIgYXZncyA9IHt9XG4gICAgICAgIHZhciBtYXhEZWx0YXMgPSB7fVxuICAgICAgICBmb3IgKHZhciBuYW1lIGluIGxvZ0Jvb2suZGF0YSkge1xuICAgICAgICAgICAgYXZnc1tuYW1lXSA9IF8ucmVkdWNlKGxvZ0Jvb2suZGF0YVtuYW1lXSxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiAoYSwgYikge3JldHVybiBhICsgYjt9KSAvIGxvZ0Jvb2suZGF0YVtuYW1lXS5sZW5ndGg7XG4gICAgICAgICAgICBtYXhEZWx0YXNbbmFtZV0gPSBfLm1heChfLm1hcChsb2dCb29rLmRhdGFbbmFtZV0sXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gKGRhdHVtKSB7cmV0dXJuIE1hdGguYWJzKGRhdHVtIC0gYXZnc1tuYW1lXSk7fSkpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNvbnNvbGUubG9nKGxvZ0Jvb2suZGF0YSwgZW5vdWdoRGF0YSwgYXZncywgbWF4RGVsdGFzKTtcbiAgICBpZiAoIWVub3VnaERhdGEpIHtcbiAgICAgICAgcmV0dXJuIFwiWW91IGhhdmVuJ3QgZmlsbGVkIHVwIHlvdXIgbGFiIG5vdGVib29rISAgTWFrZSBzdXJlIHlvdSBnZXQgZW5vdWdoIGRhdGEgc28geW91IGtub3cgeW91ciByZXN1bHRzIGFyZSBhY2N1cmF0ZS5cIjtcbiAgICB9IGVsc2UgaWYgKG1heERlbHRhc1tcIkJvd2xpbmcgQmFsbFwiXSA+IDMwMCkge1xuICAgICAgICByZXR1cm4gXCJPbmUgb2YgeW91ciByZXN1bHRzIGZvciB0aGUgYm93bGluZyBiYWxsIGxvb2tzIHByZXR0eSBmYXIgb2ZmISAgVHJ5IGdldHRpbmcgc29tZSBtb3JlIGRhdGEgdG8gbWFrZSBzdXJlIGl0IHdhcyBhIGZsdWtlLlwiO1xuICAgIH0gZWxzZSBpZiAobWF4RGVsdGFzW1wiVGVubmlzIEJhbGxcIl0gPiAzMDApIHtcbiAgICAgICAgcmV0dXJuIFwiT25lIG9mIHlvdXIgcmVzdWx0cyBmb3IgdGhlIHRlbm5pcyBiYWxsIGxvb2tzIHByZXR0eSBmYXIgb2ZmISAgVHJ5IGdldHRpbmcgc29tZSBtb3JlIGRhdGEgdG8gbWFrZSBzdXJlIGl0IHdhcyBhIGZsdWtlLlwiO1xuICAgIH0gZWxzZSBpZiAoXG4gICAgICAgICAgICAoc3RhdGUuaHlwb3RoZXNpcyA9PT0gXCJzYW1lXCJcbiAgICAgICAgICAgICAgICAmJiBNYXRoLmFicyhhdmdzW1wiQm93bGluZyBCYWxsXCJdIC0gYXZnc1tcIlRlbm5pcyBCYWxsXCJdKSA+IDEwMClcbiAgICAgICAgICAgIHx8IChzdGF0ZS5oeXBvdGhlc2lzID09PSBcImJvd2xpbmdcIlxuICAgICAgICAgICAgICAgICYmIGF2Z3NbXCJCb3dsaW5nIEJhbGxcIl0gPCBhdmdzW1wiVGVubmlzIEJhbGxcIl0gKyAxMDApXG4gICAgICAgICAgICB8fCAoc3RhdGUuaHlwb3RoZXNpcyA9PT0gXCJ0ZW5uaXNcIlxuICAgICAgICAgICAgICAgICYmIGF2Z3NbXCJUZW5uaXMgQmFsbFwiXSA8IGF2Z3NbXCJCb3dsaW5nIEJhbGxcIl0gKyAxMDApXG4gICAgICAgICAgICApIHtcbiAgICAgICAgcmV0dXJuIFwiVGhvc2UgcmVzdWx0cyBkb24ndCBsb29rIHZlcnkgY29uc2lzdGVudCB3aXRoIHlvdXIgaHlwb3RoZXNpcy4gIEl0J3MgZmluZSBpZiB5b3VyIGh5cG90aGVzaXMgd2FzIGRpc3Byb3ZlbiwgdGhhdCdzIGhvdyBzY2llbmNlIHdvcmtzIVwiO1xuICAgIH0gZWxzZSBpZiAoXG4gICAgICAgICAgICBzdGF0ZS5oeXBvdGhlc2lzICE9PSBcInNhbWVcIlxuICAgICAgICAgICAgfHwgYXZnc1tcIkJvd2xpbmcgQmFsbFwiXSA8IDgwMFxuICAgICAgICAgICAgfHwgYXZnc1tcIkJvd2xpbmcgQmFsbFwiXSA+IDE1MDBcbiAgICAgICAgICAgIHx8IGF2Z3NbXCJUZW5uaXMgQmFsbFwiXSA8IDgwMFxuICAgICAgICAgICAgfHwgYXZnc1tcIlRlbm5pcyBCYWxsXCJdID4gMTUwMCkge1xuICAgICAgICByZXR1cm4gXCJUaG9zZSByZXN1bHRzIGFyZSBjb25zaXN0ZW50LCBidXQgdGhleSBkb24ndCBsb29rIHF1aXRlIHJpZ2h0IHRvIG1lLiAgTWFrZSBzdXJlIHlvdSdyZSBkcm9wcGluZyB0aGUgYmFsbHMgZ2VudGx5IGZyb20gdGhlIHNhbWUgaGVpZ2h0IGFib3ZlIHRoZSB0b3Agc2Vuc29yLlwiO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbn1cbiIsInZhciBTdG9wd2F0Y2ggPSByZXF1aXJlKCcuL3N0b3B3YXRjaCcpO1xudmFyIGNoZWNrQ29sbGlzaW9uID0gcmVxdWlyZSgnLi9jaGVjay1jb2xsaXNpb24nKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEdhdGU7XG5cbnZhciBFTlRFUl9GQURFT1VUX0RVUkFUSU9OID0gMjBcbnZhciBFWElUX0ZBREVPVVRfRFVSQVRJT04gPSAyMFxuXG4vKipcbiAqIE9wdGktdGhpbmd5IGdhdGUuXG4gKiBEZXRlY3RzIHdoZW4gYm9kaWVzIGVudGVyIGFuZCBleGl0IGEgc3BlY2lmaWVkIGFyZWEuXG4gKlxuICogcG9seWdvbiAtIHNob3VsZCBiZSBhIGxpc3Qgb2YgdmVjdG9yaXNoLCB3aGljaCBtdXN0IGJlIGNvbnZleC5cbiAqIGJvZHkgLSBzaG91bGQgYmUgYSBib2R5LCBvciBudWxsIHRvIHRyYWNrIGFsbCBib2RpZXNcbiAqIG9wdHMgLSB7ZGVidWc6IGZhbHNlfVxuICpcbiAqIFVzYWdlIEV4YW1wbGU6XG4gKiB2YXIgZ2F0ZSA9IG5ldyBHYXRlKGF3ZXNvbWVfd29ybGQsIGNvbnRhaW5lcl9kaXYsIFt7eDogMCwgeTogMzAwfSwgLi4uXSwge2RlYnVnOiB0cnVlfSlcbiAqIGdhdGUub24oJ2V4aXQnLCBmdW5jdGlvbihkYXRhKSB7XG4gKiAgIGNvbnNvbGUubG9nKFwiWW91IGVzY2FwZWQgbWUgYWdhaW4hIEkgd2lsbCBmaW5kIHlvdSwgb2ggXCIsIGRhdGEuYm9keSk7XG4gKiB9KVxuICovXG5mdW5jdGlvbiBHYXRlKHdvcmxkLCBwb2x5Z29uLCBwb3MsIGJvZHksIG9wdHMpIHtcbiAgICBvcHRzID0gb3B0cyB8fCB7fTtcbiAgICB0aGlzLndvcmxkID0gd29ybGRcbiAgICB0aGlzLmJvZHkgPSBib2R5O1xuICAgIC8vIGJvZGllcyBjdXJyZW50bHkgaW5zaWRlIHRoaXMgZ2F0ZS5cbiAgICB0aGlzLmNvbnRhaW5zID0gW11cbiAgICB0aGlzLl9zdWJzY3JpYmUoKVxuICAgIHRoaXMucG9seWdvbiA9IHBvbHlnb25cbiAgICB0aGlzLmNvbGxpc2lvbl9ib2R5ID0gUGh5c2ljcy5ib2R5KCdjb252ZXgtcG9seWdvbicsIHtcbiAgICAgICAgdmVydGljZXM6IHBvbHlnb24sXG4gICAgICAgIHRyZWF0bWVudDogJ21hZ2ljJyxcbiAgICAgICAgeDogcG9zWzBdLFxuICAgICAgICB5OiBwb3NbMV0sXG4gICAgICAgIHZ4OiAwLFxuICAgICAgICBhbmdsZTogMCxcbiAgICAgICAgcmVzdGl0dXRpb246IDAuOSxcbiAgICAgICAgc3R5bGVzOiB7XG4gICAgICAgICAgICBmaWxsU3R5bGU6ICcjODU5OTAwJyxcbiAgICAgICAgICAgIGFuZ2xlSW5kaWNhdG9yOiAnIzQxNDcwMCdcbiAgICAgICAgfVxuICAgIH0pXG4gICAgdGhpcy5tb3ZlZF9wb2ludHMgPSBwb2x5Z29uLm1hcChmdW5jdGlvbiAocCkge1xuICAgICAgICByZXR1cm4ge3g6IHAueCArIHBvc1swXSwgeTogcC55ICsgcG9zWzFdfVxuICAgIH0pO1xuICAgIHRoaXMudmlldyA9IHRoaXMud29ybGQucmVuZGVyZXIoKS5jcmVhdGVWaWV3KHRoaXMuY29sbGlzaW9uX2JvZHkuZ2VvbWV0cnksIHsgc3Ryb2tlU3R5bGU6ICcjYWFhJywgbGluZVdpZHRoOiAyLCBmaWxsU3R5bGU6ICdyZ2JhKDAsMCwwLDApJyB9KVxuICAgIC8vIHRoaXMud29ybGQuYWRkKHRoaXMuY29sbGlzaW9uX2JvZHkpXG4gICAgaWYgKG9wdHMuZGVidWcpIHRoaXMuc3BlYWtMb3VkbHkoKTtcbiAgICB0aGlzLl9jb2xvciA9IG9wdHMuY29sb3JcblxuICAgIHRoaXMuX2VudGVyX2ZhZGVvdXQgPSAwO1xuICAgIHRoaXMuX2V4aXRfZmFkZW91dCA9IDA7XG59XG5cbkdhdGUucHJvdG90eXBlLl9zdWJzY3JpYmUgPSBmdW5jdGlvbigpIHtcbiAgICBQaHlzaWNzLnV0aWwudGlja2VyLm9uKGZ1bmN0aW9uKHRpbWUpIHtcbiAgICAgICAgaWYgKHRoaXMuYm9keSkge1xuICAgICAgICAgICAgdGhpcy5oYW5kbGVCb2R5KHRoaXMuYm9keSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLndvcmxkLmdldEJvZGllcygpLmZvckVhY2godGhpcy5oYW5kbGVCb2R5LmJpbmQodGhpcykpXG4gICAgICAgIH1cbiAgICB9LmJpbmQodGhpcykpXG5cbiAgICAvLyBTdWJzY3JpYmUgdG8gcmVuZGVyIGV2ZW50c1xuICAgIHRoaXMud29ybGQub24oJ3JlbmRlcicsIHRoaXMuX3JlbmRlci5iaW5kKHRoaXMpKTtcblxuICAgIC8vIFN1YnNjcmliZSB0byBzZWxmLiAod0hhVD8pXG4gICAgdGhpcy5vbignZW50ZXInLCBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5fZW50ZXJfZmFkZW91dCA9IEVOVEVSX0ZBREVPVVRfRFVSQVRJT05cbiAgICB9LmJpbmQodGhpcykpXG4gICAgdGhpcy5vbignZXhpdCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLl9leGl0X2ZhZGVvdXQgPSBFWElUX0ZBREVPVVRfRFVSQVRJT05cbiAgICB9LmJpbmQodGhpcykpXG59XG5cbkdhdGUucHJvdG90eXBlLl9yZW5kZXIgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgciA9IHRoaXMud29ybGQucmVuZGVyZXIoKTtcbiAgICB2YXIgYWxwaGEgPSB0aGlzLl9lbnRlcl9mYWRlb3V0IC8gRU5URVJfRkFERU9VVF9EVVJBVElPTlxuICAgIHZhciBzdHJva2VTdHlsZXMgPSB7XG4gICAgICAgIGdyZWVuOiAnIzBhMCcsXG4gICAgICAgIHJlZDogJyNhMDAnLFxuICAgICAgICB1bmRlZmluZWQ6ICcjYWFhJyxcbiAgICB9XG4gICAgdmFyIGZpbGxTdHlsZSA9IHtcbiAgICAgICAgZ3JlZW46ICdyZ2JhKDUwLDEwMCw1MCwnK2FscGhhKycpJyxcbiAgICAgICAgcmVkOiAncmdiYSgxMDAsNTAsNTAsJythbHBoYSsnKScsXG4gICAgICAgIHVuZGVmaW5lZDogJ3JnYmEoMCwwLDAsJythbHBoYSsnKScsXG4gICAgfVxuICAgIHIuZHJhd1BvbHlnb24odGhpcy5tb3ZlZF9wb2ludHMsIHtcbiAgICAgICAgc3Ryb2tlU3R5bGU6IHN0cm9rZVN0eWxlc1t0aGlzLl9jb2xvcl0sXG4gICAgICAgIGxpbmVXaWR0aDogMixcbiAgICAgICAgZmlsbFN0eWxlOiBmaWxsU3R5bGVbdGhpcy5fY29sb3JdLFxuICAgIH0pO1xuXG4gICAgdGhpcy5fZW50ZXJfZmFkZW91dCA9IE1hdGgubWF4KDAsIHRoaXMuX2VudGVyX2ZhZGVvdXQgLSAxKVxuICAgIHRoaXMuX2V4aXRfZmFkZW91dCA9IE1hdGgubWF4KDAsIHRoaXMuX2V4aXRfZmFkZW91dCAtIDEpXG59XG5cbkdhdGUucHJvdG90eXBlLmhhbmRsZUJvZHkgPSBmdW5jdGlvbihib2R5KSB7XG4gICAgLy8gSWdub3JlIGJvZGllcyBiZWluZyBkcmFnZ2VkLlxuICAgIGlmIChib2R5LmRyYWdnaW5nKSByZXR1cm47XG5cbiAgICB2YXIgd2FzSW4gPSB0aGlzLmNvbnRhaW5zLmluZGV4T2YoYm9keSkgIT0gLTFcbiAgICB2YXIgaXNJbiA9IHRoaXMudGVzdEJvZHkoYm9keSlcbiAgICBpZiAoIXdhc0luICYmIGlzSW4pIHtcbiAgICAgICAgdGhpcy5jb250YWlucy5wdXNoKGJvZHkpXG4gICAgICAgIHRoaXMuZW1pdCgnZW50ZXInLCB7Ym9keTogYm9keX0pXG4gICAgfVxuICAgIGlmICh3YXNJbiAmJiAhaXNJbikge1xuICAgICAgICB0aGlzLmNvbnRhaW5zID0gXy53aXRob3V0KHRoaXMuY29udGFpbnMsIGJvZHkpO1xuICAgICAgICB0aGlzLmVtaXQoJ2V4aXQnLCB7Ym9keTogYm9keX0pXG4gICAgfVxufVxuXG5HYXRlLnByb3RvdHlwZS50ZXN0Qm9keSA9IGZ1bmN0aW9uKGJvZHkpIHtcbiAgICBpZiAoIXdpbmRvdy5kZWJ1ZyAmJiBib2R5LnRyZWF0bWVudCAhPT0gJ2R5bmFtaWMnKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIGNoZWNrQ29sbGlzaW9uKHRoaXMuY29sbGlzaW9uX2JvZHksIGJvZHkpXG4gICAgLy8vIHZhciBwb3MgPSBib2R5LnN0YXRlLnBvc1xuICAgIC8vLyByZXR1cm4gdGhpcy50ZXN0UG9pbnQoe3g6IHBvcy54LCB5OiBwb3MueX0pXG59XG5cbkdhdGUucHJvdG90eXBlLnRlc3RQb2ludCA9IGZ1bmN0aW9uKHZlY3RvcmlzaCkge1xuICAgIHJldHVybiBQaHlzaWNzLmdlb21ldHJ5LmlzUG9pbnRJblBvbHlnb24oXG4gICAgICAgIHZlY3RvcmlzaCxcbiAgICAgICAgdGhpcy5wb2x5Z29uKTtcbn1cblxuLy8gR2F0ZS5wcm90b3R5cGUucnVuU3RvcHdhdGNoID0gZnVuY3Rpb24oc3RvcHdhdGNoKSB7XG4gICAgLy8gdGhpcy5vbignZW50ZXInLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIC8vIHN0b3B3YXRjaC5yZXNldCgpO1xuICAgICAgICAvLyBzdG9wd2F0Y2guc3RhcnQoKTtcbiAgICAvLyB9KTtcbiAgICAvLyB0aGlzLm9uKCdleGl0JywgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAvLyBzdG9wd2F0Y2guc3RvcCgpO1xuICAgIC8vIH0pO1xuLy8gfVxuXG4vKipcbiAqIERlYnVnZ2luZyBmdW5jdGlvbiB0byBsaXN0ZW4gdG8gbXkgb3duIGV2ZW50cyBhbmQgY29uc29sZS5sb2cgdGhlbS5cbiAqL1xuR2F0ZS5wcm90b3R5cGUuc3BlYWtMb3VkbHkgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLm9uKCdlbnRlcicsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ2VudGVyJywgZGF0YS5ib2R5KVxuICAgIH0pXG4gICAgdGhpcy5vbignZXhpdCcsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ2V4aXQnLCBkYXRhLmJvZHkpXG4gICAgfSlcbiAgICByZXR1cm4ge2J1dENhcnJ5QUJpZ1N0aWNrOiAnJ31cbn1cblxuXy5leHRlbmQoR2F0ZS5wcm90b3R5cGUsIFBoeXNpY3MudXRpbC5wdWJzdWIucHJvdG90eXBlKVxuIiwiXG52YXIgQ2FuR3JhcGggPSByZXF1aXJlKCcuL2NhbmdyYXBoJylcblxubW9kdWxlLmV4cG9ydHMgPSBHcmFwaFxuXG5mdW5jdGlvbiBnZXREYXR1bShpdGVtKSB7XG4gICAgcmV0dXJuIGl0ZW0uYXR0ci5zcGxpdCgnLicpLnJlZHVjZShmdW5jdGlvbiAobm9kZSwgYXR0cikge1xuICAgICAgICByZXR1cm4gbm9kZVthdHRyXVxuICAgIH0sIGl0ZW0uYm9keS5zdGF0ZSlcbn1cblxuZnVuY3Rpb24gR3JhcGgocGFyZW50LCB0cmFja2luZywgb3B0aW9ucykge1xuICAgIHRoaXMubyA9IF8uZXh0ZW5kKHtcbiAgICAgICAgdG9wOiAxMCxcbiAgICAgICAgbGVmdDogMTAsXG4gICAgICAgIHdpZHRoOiA2MDAsXG4gICAgICAgIGhlaWdodDogNDAwLFxuICAgICAgICB3b3JsZEhlaWdodDogMjAwXG4gICAgfSwgb3B0aW9ucylcbiAgICB0aGlzLnRyYWNraW5nID0gdHJhY2tpbmdcbiAgICB0aGlzLmRhdGEgPSBbXVxuICAgIHRoaXMubm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpXG4gICAgdGhpcy5ub2RlLmNsYXNzTmFtZSA9ICdncmFwaCdcbiAgICB0aGlzLm5vZGUud2lkdGggPSB0aGlzLm8ud2lkdGhcbiAgICB0aGlzLm5vZGUuaGVpZ2h0ID0gdGhpcy5vLmhlaWdodFxuICAgIHRoaXMubm9kZS5zdHlsZS50b3AgPSB0aGlzLm8udG9wICsgJ3B4J1xuICAgIHRoaXMubm9kZS5zdHlsZS5sZWZ0ID0gdGhpcy5vLmxlZnQgKyAncHgnXG4gICAgdmFyIG51bWdyYXBocyA9IE9iamVjdC5rZXlzKHRyYWNraW5nKS5sZW5ndGhcbiAgICB2YXIgZ3JhcGhoZWlnaHQgPSB0aGlzLm8uaGVpZ2h0IC8gbnVtZ3JhcGhzXG4gICAgcGFyZW50LmFwcGVuZENoaWxkKHRoaXMubm9kZSlcblxuICAgIHRoaXMuZ3JhcGhzID0ge31cbiAgICB2YXIgaSA9IDBcbiAgICBmb3IgKHZhciBuYW1lIGluIHRyYWNraW5nKSB7XG4gICAgICAgIHRoaXMuZ3JhcGhzW25hbWVdID0gbmV3IENhbkdyYXBoKHtcbiAgICAgICAgICAgIG5vZGU6IHRoaXMubm9kZSxcbiAgICAgICAgICAgIG1pbnNjYWxlOiB0cmFja2luZ1tuYW1lXS5taW5zY2FsZSxcbiAgICAgICAgICAgIHRpdGxlOiB0cmFja2luZ1tuYW1lXS50aXRsZSxcbiAgICAgICAgICAgIHRvcDogZ3JhcGhoZWlnaHQgKiBpKyssXG4gICAgICAgICAgICBsZWZ0OiAwLFxuICAgICAgICAgICAgd2lkdGg6IHRoaXMuby53aWR0aCxcbiAgICAgICAgICAgIGhlaWdodDogZ3JhcGhoZWlnaHQsXG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgLypcbiAgICB0aGlzLmdyYXBoID0gbmV3IFJpY2tzaGF3LkdyYXBoKHtcbiAgICAgICAgZWxlbWVudDogdGhpcy5ub2RlLFxuICAgICAgICB3aWR0aDogNjAwLFxuICAgICAgICBoZWlnaHQ6IDYwMCxcbiAgICAgICAgcmVuZGVyZXI6ICdsaW5lJyxcbiAgICAgICAgc2VyaWVzOiBuZXcgUmlja3NoYXcuU2VyaWVzKFxuICAgICAgICAgICAgdHJhY2tpbmcubWFwKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtuYW1lOiBpdGVtLm5hbWV9XG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIHVuZGVmaW5lZCwge1xuICAgICAgICAgICAgICAgIHRpbWVJbnRlcnZhbDogMjUwLFxuICAgICAgICAgICAgICAgIG1heERhdGFQb2ludHM6IDEwMCxcbiAgICAgICAgICAgICAgICB0aW1lQmFzZTogbmV3IERhdGUoKS5nZXRUaW1lKCkgLyAxMDAwXG4gICAgICAgICAgICB9XG4gICAgICAgIClcbiAgICB9KVxuICAgICovXG59XG5cbkdyYXBoLnByb3RvdHlwZSA9IHtcbiAgICB1cGRhdGVEYXRhOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBkYXRhID0ge31cbiAgICAgICAgdmFyIGhlaWdodCA9IHRoaXMuby53b3JsZEhlaWdodFxuICAgICAgICB0aGlzLm5vZGUuZ2V0Q29udGV4dCgnMmQnKS5jbGVhclJlY3QoMCwgMCwgdGhpcy5ub2RlLndpZHRoLCB0aGlzLm5vZGUuaGVpZ2h0KVxuICAgICAgICBmb3IgKHZhciBuYW1lIGluIHRoaXMudHJhY2tpbmcpIHtcbiAgICAgICAgICAgIHRoaXMuZ3JhcGhzW25hbWVdLmFkZFBvaW50KHRoaXMuZ2V0RGF0dW0obmFtZSkpXG4gICAgICAgICAgICB0aGlzLmdyYXBoc1tuYW1lXS5kcmF3KClcbiAgICAgICAgfVxuICAgIH0sXG4gICAgZ2V0RGF0dW06IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgIHZhciBpdGVtID0gdGhpcy50cmFja2luZ1tuYW1lXVxuICAgICAgICBpZiAoaXRlbS5mbikge1xuICAgICAgICAgICAgcmV0dXJuIGl0ZW0uZm4oKTtcbiAgICAgICAgfSBlbHNlIGlmIChpdGVtLmF0dHIgPT09ICdwb3MueScpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm8ud29ybGRIZWlnaHQgLSBpdGVtLmJvZHkuc3RhdGUucG9zLnlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBnZXREYXR1bShpdGVtKVxuICAgICAgICB9XG4gICAgfSxcbiAgICB1cGRhdGU6IGZ1bmN0aW9uICh0aW1lc3RlcCkge1xuICAgICAgICB0aGlzLnVwZGF0ZURhdGEoKVxuICAgIH1cbn1cblxuIiwidmFyIEJhc2UgPSByZXF1aXJlKCcuL2Jhc2UnKTtcbnZhciBHYXRlID0gcmVxdWlyZSgnLi9nYXRlJyk7XG52YXIgU3RvcHdhdGNoID0gcmVxdWlyZSgnLi9zdG9wd2F0Y2gnKTtcbnZhciBMb2dCb29rID0gcmVxdWlyZSgnLi9sb2dib29rJyk7XG52YXIgUGxheVBhdXNlID0gcmVxdWlyZSgnLi9wbGF5cGF1c2UnKTtcbnZhciBIaWxsc0ludHJvID0gcmVxdWlyZSgnLi9pbnRyby9oaWxsc19pbnRyby5qc3gnKTtcbnZhciBoaWxsc0RhdGFDaGVja2VyID0gcmVxdWlyZSgnLi9oaWxsc2RhdGFjaGVja2VyJyk7XG52YXIgQ2F2ZURyYXcgPSByZXF1aXJlKCcuL2NhdmVkcmF3Jyk7XG52YXIgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xudmFyIHRlcnJhaW4gPSByZXF1aXJlKCcuL3RlcnJhaW4nKTtcblxuZnVuY3Rpb24gcmFuZG9tKG1pbiwgbWF4KXtcbiAgICByZXR1cm4gKE1hdGgucmFuZG9tKCkgKiAobWF4LW1pbikgKyBtaW4pfDBcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBCYXNlLmV4dGVuZChmdW5jdGlvbiBIaWxscyhjb250YWluZXIsIG9wdGlvbnMpIHtcbiAgICBCYXNlLmNhbGwodGhpcywgY29udGFpbmVyLCBvcHRpb25zLCBcImltYWdlcy9sYWJfYmFja2dyb3VuZC5qcGdcIixcbiAgICAgICAgdHJ1ZSAvKiBkaXNhYmxlQm91bmRzICovKVxufSwge1xuICAgIGRyb3BPYmplY3RzOiBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgICAgICB0aGlzLmJhbGwgPSBQaHlzaWNzLmJvZHkoJ2NpcmNsZScsIHtcbiAgICAgICAgICAgIHg6IDI1MCxcbiAgICAgICAgICAgIHk6IDQwMCxcbiAgICAgICAgICAgIHZ4OiAtTWF0aC5yYW5kb20oKSAqIDAuMSxcbiAgICAgICAgICAgIHJhZGl1czogMjAsXG4gICAgICAgICAgICBtYXNzOiA5MDAsXG4gICAgICAgICAgICBjb2Y6IDAuMSxcbiAgICAgICAgICAgIHJlc3RpdHV0aW9uOiAwLjAxLFxuICAgICAgICAgICAgZGlzcGxheU5hbWU6IFwiQm93bGluZyBCYWxsXCIsXG4gICAgICAgICAgICBzdHlsZXM6IHtcbiAgICAgICAgICAgICAgICBpbWFnZTogXCJpbWFnZXMvYm93bGluZ19iYWxsLnBuZ1wiXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLndvcmxkLmFkZCh0aGlzLmJhbGwpO1xuICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoY2FsbGJhY2ssIDUwMCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICBzdGFydFdhbGt0aHJvdWdoOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgSGlsbHNJbnRybyh0aGlzLCBmdW5jdGlvbiAoaHlwb3RoZXNpcykge1xuICAgICAgICAgICBjb25zb2xlLmxvZygnR290IHRoZSBoeXBvdGhlc2lzISEnLCBoeXBvdGhlc2lzKTtcbiAgICAgICAgICAgdGhpcy5zZXR1cERhdGFDaGVja2VyKGh5cG90aGVzaXMpO1xuICAgICAgIH0uYmluZCh0aGlzKSlcbiAgIH0sXG5cbiAgICBzZXR1cERhdGFDaGVja2VyOiBmdW5jdGlvbiAoaHlwb3RoZXNpcykge1xuICAgICAgICB2YXIgZGF0YUNoZWNrZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICBkYXRhQ2hlY2tlci5jbGFzc05hbWUgPSBcImhpbGxzLWRhdGEtY2hlY2tlclwiO1xuICAgICAgICB0aGlzLnNpZGVCYXIuYXBwZW5kQ2hpbGQoZGF0YUNoZWNrZXIpO1xuICAgICAgICBoaWxsc0RhdGFDaGVja2VyKGRhdGFDaGVja2VyLCB0aGlzLmxvZ0Jvb2ssIGh5cG90aGVzaXMpO1xuICAgIH0sXG5cbiAgICBzZXR1cFNsaWRlcjogZnVuY3Rpb24gKGNvbnRhaW5lcikge1xuICAgICAgICB0aGlzLnNsaWRlciA9ICQoJzxpbnB1dCB0eXBlPVwicmFuZ2VcIiBtaW49XCIwXCIgbWF4PVwiMTQwXCIgc3RlcD1cIjEwXCIgdmFsdWU9XCIxMDBcIi8+Jyk7XG4gICAgICAgIHRoaXMuc2xpZGVyRGlzcGxheSA9ICQoJzxzcGFuPjEwMCBjbTwvc3Bhbj4nKTtcbiAgICAgICAgdmFyIGhhbmRsZVNsaWRlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLnNldHVwVGVycmFpbigyMDAsIHRoaXMuc2xpZGVyLnZhbCgpKTtcbiAgICAgICAgICAgIHRoaXMuc2xpZGVyRGlzcGxheS5odG1sKHRoaXMuc2xpZGVyLnZhbCgpICsgXCIgY21cIik7XG4gICAgICAgIH0uYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5zbGlkZXIuY2hhbmdlKGhhbmRsZVNsaWRlKS5vbignaW5wdXQnLCBoYW5kbGVTbGlkZSk7XG4gICAgICAgIHZhciBkaXYgPSAkKCc8ZGl2IGNsYXNzPVwiaGlsbC1zbGlkZXJcIi8+Jyk7XG4gICAgICAgICQoY29udGFpbmVyKS5hcHBlbmQoZGl2KTtcbiAgICAgICAgZGl2LmFwcGVuZCh0aGlzLnNsaWRlcik7XG4gICAgICAgIGRpdi5hcHBlbmQodGhpcy5zbGlkZXJEaXNwbGF5KTtcbiAgICB9LFxuXG4gICAgc2V0dXBUZXJyYWluOiBmdW5jdGlvbiAocmFtcEhlaWdodCwgaGlsbEhlaWdodCkge1xuICAgICAgICBpZiAodGhpcy50ZXJyYWluQ2FudmFzKSB7XG4gICAgICAgICAgICB0aGlzLnRlcnJhaW5DYW52YXMuY2xlYXIoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy50ZXJyYWluQmVoYXZpb3IpIHtcbiAgICAgICAgICAgIHRoaXMud29ybGQucmVtb3ZlKHRoaXMudGVycmFpbkJlaGF2aW9yKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgdGVycmFpbkhlaWdodCA9IHRoaXMubWtUZXJyYWluSGVpZ2h0RnVuY3Rpb24ocmFtcEhlaWdodCwgaGlsbEhlaWdodCk7XG4gICAgICAgIHRoaXMudGVycmFpbkNhbnZhcy5kcmF3KHRlcnJhaW5IZWlnaHQpXG4gICAgICAgIHRoaXMudGVycmFpbkJlaGF2aW9yID0gUGh5c2ljcy5iZWhhdmlvcigndGVycmFpbi1jb2xsaXNpb24tZGV0ZWN0aW9uJywge1xuICAgICAgICAgICAgYWFiYjogUGh5c2ljcy5hYWJiKDAsIDAsIHRoaXMub3B0aW9ucy53aWR0aCwgdGhpcy5vcHRpb25zLmhlaWdodCksXG4gICAgICAgICAgICB0ZXJyYWluSGVpZ2h0OiB0ZXJyYWluSGVpZ2h0LFxuICAgICAgICAgICAgcmVzdGl0dXRpb246IDAuMixcbiAgICAgICAgICAgIGNvZjogMC4xXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLndvcmxkLmFkZCh0aGlzLnRlcnJhaW5CZWhhdmlvcik7XG4gICAgfSxcblxuICAgIG1rVGVycmFpbkhlaWdodEZ1bmN0aW9uOiBmdW5jdGlvbiAocmFtcEhlaWdodCwgaGlsbEhlaWdodCkge1xuICAgICAgICB2YXIgcmFtcFdpZHRoID0gdGhpcy5vcHRpb25zLndpZHRoIC8gNDtcbiAgICAgICAgdmFyIHJhbXBTY2FsZSA9IHJhbXBIZWlnaHQgLyBNYXRoLnBvdyhyYW1wV2lkdGgsIDIpO1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgICAgIGlmICh4IDwgcmFtcFdpZHRoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIE1hdGgucG93KHJhbXBXaWR0aCAtIHgsIDIpICogcmFtcFNjYWxlO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh4IDwgMyAqIHJhbXBXaWR0aCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBoaWxsSGVpZ2h0IC8gMiArIE1hdGguY29zKE1hdGguUEkgKiB4IC8gcmFtcFdpZHRoKSAqIGhpbGxIZWlnaHQgLyAyO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgIH0sXG5cbiAgICBzZXR1cDogZnVuY3Rpb24gKGNvbnRhaW5lcikge1xuICAgICAgICB2YXIgd29ybGQgPSB0aGlzLndvcmxkXG4gICAgICAgIHZhciBncmF2aXR5ID0gUGh5c2ljcy5iZWhhdmlvcignY29uc3RhbnQtYWNjZWxlcmF0aW9uJylcbiAgICAgICAgZ3Jhdml0eS5zZXRBY2NlbGVyYXRpb24oe3g6IDAsIHk6LjAwMDN9KTtcbiAgICAgICAgd29ybGQuYWRkKGdyYXZpdHkpO1xuICAgICAgICAvLyByZWdpc3RlciwgYnV0IGRvbid0IHNldCB1cCB0aGUgYmVoYXZpb3I7IHRoYXQgaXMgZG9uZSBpbiBzZXR1cFRlcnJhaW4oKVxuICAgICAgICBQaHlzaWNzLmJlaGF2aW9yKCd0ZXJyYWluLWNvbGxpc2lvbi1kZXRlY3Rpb24nLCB0ZXJyYWluKTtcbiAgICAgICAgdGhpcy50ZXJyYWluQ2FudmFzID0gbmV3IENhdmVEcmF3KCQoJyN1bmRlci1jYW52YXMnKSwgOTAwLCA3MDApXG4gICAgICAgIHRoaXMuc2V0dXBUZXJyYWluKDIwMCwgMTAwKTtcblxuICAgICAgICB2YXIgc2lkZUJhciA9IHRoaXMuc2lkZUJhciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgIHNpZGVCYXIuY2xhc3NOYW1lID0gXCJzaWRlLWJhclwiO1xuICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoc2lkZUJhcik7XG4gICAgICAgIHZhciB0b3BHYXRlID0gbmV3IEdhdGUod29ybGQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXRpbC5tYWtlUmVjdCgwLCAwLCAxMCwgMjAwKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbNzUwLCA2MDBdLCBudWxsLCB7ZGVidWc6IHRydWUsIHNob3c6IHRydWUsIGNvbG9yOiAnZ3JlZW4nfSk7XG4gICAgICAgIHZhciBib3R0b21HYXRlID0gbmV3IEdhdGUod29ybGQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXRpbC5tYWtlUmVjdCgwLCAwLCAxMCwgMjAwKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbODAwLCA2MDBdLCBudWxsLCB7ZGVidWc6IHRydWUsIHNob3c6IHRydWUsIGNvbG9yOiAncmVkJ30pO1xuICAgICAgICB2YXIgbG9nQ29sdW1ucyA9IFt7bmFtZTogXCIxMDAgY21cIn1dO1xuICAgICAgICB2YXIgbG9nQm9vayA9IHRoaXMubG9nQm9vayA9IG5ldyBMb2dCb29rKHdvcmxkLCBzaWRlQmFyLCAzLCBsb2dDb2x1bW5zKTtcbiAgICAgICAgdG9wR2F0ZS5vbignZW50ZXInLCBmdW5jdGlvbihlbGVtKSB7XG4gICAgICAgICAgICB2YXIgY29sTmFtZSA9IHRoaXMuc2xpZGVyLnZhbCgpLnRvU3RyaW5nKCkgKyBcIiBjbVwiO1xuICAgICAgICAgICAgbG9nQm9vay5oYW5kbGVTdGFydChjb2xOYW1lLCBlbGVtLmJvZHkudWlkKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgYm90dG9tR2F0ZS5vbignZW50ZXInLCBmdW5jdGlvbihlbGVtKSB7XG4gICAgICAgICAgICB2YXIgY29sTmFtZSA9IHRoaXMuc2xpZGVyLnZhbCgpLnRvU3RyaW5nKCkgKyBcIiBjbVwiO1xuICAgICAgICAgICAgbG9nQm9vay5oYW5kbGVFbmQoY29sTmFtZSwgZWxlbS5ib2R5LnVpZCk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICAgIHZhciBidXR0b25Db250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICB2YXIgcGxheVBhdXNlID0gbmV3IFBsYXlQYXVzZSh3b3JsZCwgYnV0dG9uQ29udGFpbmVyKTtcbiAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGJ1dHRvbkNvbnRhaW5lcik7XG4gICAgICAgIHRoaXMuc2V0dXBTbGlkZXIoYnV0dG9uQ29udGFpbmVyKTtcblxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLndhbGspIHtcbiAgICAgICAgICAgdGhpcy5zdGFydFdhbGt0aHJvdWdoKClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZHJvcE9iamVjdHMoKTtcbiAgICAgICAgICAgIHRoaXMuc2V0dXBEYXRhQ2hlY2tlcignc2FtZScpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFBpY2sgdXAgb25lIHRoZSBiYWxsIGFuZCBkcm9wIGl0LlxuICAgICAqXG4gICAgICogQHBhcmFtIGNhbGxiYWNrIEdldHMgY2FsbGVkIHdoZW4gdGhlIGRlbW9uc3RyYXRpb24gaXMgb3Zlci5cbiAgICAgKi9cbiAgICBkZW1vbnN0cmF0ZURyb3A6IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBiYWxsID0gdGhpcy5iYWxsO1xuICAgICAgICB2YXIgdGFyZ2V0WCA9IDIwO1xuICAgICAgICB2YXIgdGFyZ2V0WSA9IDQ5NTtcblxuICAgICAgICBiYWxsLnRyZWF0bWVudCA9ICdraW5lbWF0aWMnO1xuICAgICAgICBiYWxsLnN0YXRlLnZlbC54ID0gKHRhcmdldFggLSBiYWxsLnN0YXRlLnBvcy54KSAvIDE1MDA7XG4gICAgICAgIGJhbGwuc3RhdGUudmVsLnkgPSAodGFyZ2V0WSAtIGJhbGwuc3RhdGUucG9zLnkpIC8gMTUwMDtcbiAgICAgICAgYmFsbC5yZWNhbGMoKTtcblxuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgYmFsbC50cmVhdG1lbnQgPSAnc3RhdGljJztcbiAgICAgICAgICAgIGJhbGwuc3RhdGUucG9zLnggPSB0YXJnZXRYO1xuICAgICAgICAgICAgYmFsbC5zdGF0ZS5wb3MueSA9IHRhcmdldFk7XG4gICAgICAgICAgICBiYWxsLnN0YXRlLnZlbC54ID0gMDtcbiAgICAgICAgICAgIGJhbGwuc3RhdGUudmVsLnkgPSAwO1xuICAgICAgICAgICAgYmFsbC5yZWNhbGMoKTtcblxuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBiYWxsLnRyZWF0bWVudCA9ICdkeW5hbWljJztcbiAgICAgICAgICAgICAgICBiYWxsLnJlY2FsYygpO1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICAgICAgfSwgMzAwMClcbiAgICAgICAgICAgIH0sIDE1MDApXG4gICAgICAgIH0sIDE1MDApXG4gICAgfVxufSk7XG4iLCJ2YXIgRGF0YUNoZWNrZXIgPSByZXF1aXJlKCcuL2RhdGFjaGVja2VyLmpzeCcpO1xudmFyIHV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBoaWxsc0RhdGFDaGVja2VyO1xuXG52YXIgX2luaXRpYWxUZXh0ID0gXCJEbyBhbiBleHBlcmltZW50IHRvIHNlZSBpZiB5b3UgY2FuIGZpZ3VyZSBvdXQgd2hldGhlciBhIGJhbGwgd2hpY2ggcm9sbHMgb3ZlciBhIGhpbGwgY29tZXMgb3V0IGF0IGEgZGlmZmVyZW50IHNwZWVkLCBhbmQgbGV0IG1lIGtub3cgd2hlbiB5b3UncmUgZG9uZSFcIjtcblxudmFyIF9uZXh0VVJMID0gXCI/QmFjb25cIjtcblxudmFyIF9oeXBvdGhlc2VzID0gW1xuICAgIHtcbiAgICAgICAgbmFtZTogXCJzYW1lXCIsXG4gICAgICAgIGJ1dHRvblRleHQ6IFwiVGhlIHNwZWVkIGRvZXMgbm90IGRlcGVuZCBvbiB0aGUgc2l6ZSBvZiB0aGUgaGlsbC5cIixcbiAgICAgICAgdGV4dDogXCJ0aGF0IHRoZSBzcGVlZCB3aWxsIG5vdCBkZXBlbmQgb24gdGhlIHNpemUgb2YgdGhlIGhpbGxcIixcbiAgICB9LFxuICAgIHtcbiAgICAgICAgbmFtZTogXCJmYXN0ZXJcIixcbiAgICAgICAgYnV0dG9uVGV4dDogXCJUaGUgYmFsbCBjb21lcyBvdXQgZmFzdGVyIGlmIHRoZSBoaWxsIGlzIGxhcmdlci5cIixcbiAgICAgICAgdGV4dDogXCJ0aGF0IHRoZSBiYWxsIHdpbGwgY29tZSBvdXQgZmFzdGVyIGlmIHRoZSBoaWxsIGlzIGxhcmdlclwiLFxuICAgIH0sXG4gICAge1xuICAgICAgICBuYW1lOiBcInNsb3dlclwiLFxuICAgICAgICBidXR0b25UZXh0OiBcIlRoZSBiYWxsIGNvbWVzIG91dCBzbG93ZXIgaWYgdGhlIGhpbGwgaXMgbGFyZ2VyLlwiLFxuICAgICAgICB0ZXh0OiBcInRoYXQgdGhlIGJhbGwgd2lsbCBjb21lIG91dCBzbG93ZXIgaWYgdGhlIGhpbGwgaXMgbGFyZ2VyXCIsXG4gICAgfSxcbl1cblxuZnVuY3Rpb24gaGlsbHNEYXRhQ2hlY2tlcihjb250YWluZXIsIGxvZ0Jvb2ssIGh5cG90aGVzaXMpIHtcbiAgICByZXR1cm4gUmVhY3QucmVuZGVyQ29tcG9uZW50KERhdGFDaGVja2VyKHtcbiAgICAgICAgaW5pdGlhbFRleHQ6IF9pbml0aWFsVGV4dCxcbiAgICAgICAgaW5pdGlhbEh5cG90aGVzaXM6IGh5cG90aGVzaXMsXG4gICAgICAgIHBvc3NpYmxlSHlwb3RoZXNlczogX2h5cG90aGVzZXMsXG4gICAgICAgIHJlc3VsdDogZnVuY3Rpb24gKHN0YXRlKSB7cmV0dXJuIF9yZXN1bHQobG9nQm9vaywgc3RhdGUpO30sXG4gICAgICAgIG5leHRVUkw6IF9uZXh0VVJMLFxuICAgIH0pLCBjb250YWluZXIpO1xufVxuXG5mdW5jdGlvbiBfcmVzdWx0KGxvZ0Jvb2ssIHN0YXRlKSB7XG4gICAgdmFyIGNsZWFuZWREYXRhID0ge31cbiAgICBmb3IgKHZhciBuYW1lIGluIGxvZ0Jvb2suZGF0YSkge1xuICAgICAgICBpZiAobG9nQm9vay5kYXRhW25hbWVdKSB7XG4gICAgICAgICAgICB2YXIgaGVpZ2h0ID0gbmFtZS5zbGljZSgwLCAtMyk7IC8vIHJlbW92ZSBcIiBjbVwiXG4gICAgICAgICAgICBjbGVhbmVkRGF0YVtoZWlnaHRdID0gbG9nQm9vay5kYXRhW25hbWVdO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8vIGNoZWNrIHRoYXQgdGhleSBoYXZlIGVub3VnaCBkYXRhOiBhdCBsZWFzdCAzIHBvaW50cyBlYWNoIGluIGF0IGxlYXN0IDRcbiAgICAvLyBoaWxsIHNpemVzLCBpbmNsdWRpbmcgb25lIGxlc3MgdGhhbiA1MGNtIGFuZCBvbmUgZ3JlYXRlciB0aGFuIDEwMGNtLlxuICAgIGlmIChfLnNpemUoY2xlYW5lZERhdGEpIDwgNCkge1xuICAgICAgICByZXR1cm4gXCJZb3Ugb25seSBoYXZlIGRhdGEgZm9yIGEgZmV3IHBvc3NpYmxlIGhpbGxzISAgTWFrZSBzdXJlIHlvdSBoYXZlIGRhdGEgb24gYSBudW1iZXIgb2YgcG9zc2libGUgaGlsbHMgc28geW91IGtub3cgeW91ciByZXN1bHRzIGFwcGx5IHRvIGFueSBoaWxsIHNpemUuXCI7XG4gICAgfSBlbHNlIGlmIChfLmZpbHRlcihjbGVhbmVkRGF0YSwgZnVuY3Rpb24gKGRhdGEsIGhlaWdodCkge3JldHVybiBkYXRhLmxlbmd0aCA+PSAzO30pLmxlbmd0aCA8IDQpIHtcbiAgICAgICAgcmV0dXJuIFwiWW91IG9ubHkgaGF2ZSBhIGxpdHRsZSBiaXQgb2YgZGF0YSBmb3Igc29tZSBvZiB0aG9zZSBwb3NzaWJsZSBoaWxscy4gIE1ha2Ugc3VyZSB5b3UgaGF2ZSBzZXZlcmFsIGRhdGEgcG9pbnRzIG9uIGEgbnVtYmVyIG9mIHBvc3NpYmxlIGhpbGxzIHNvIHlvdSBrbm93IHlvdXIgcmVzdWx0cyBhcHBseSB0byBhbnkgaGlsbCBzaXplLlwiO1xuICAgIH0gZWxzZSBpZiAoXy5tYXgoXy5tYXAoXy5rZXlzKGNsZWFuZWREYXRhKSwgcGFyc2VJbnQpKSA8PSAxMDApIHtcbiAgICAgICAgcmV0dXJuIFwiWW91IGRvbid0IGhhdmUgYW55IGRhdGEgZm9yIGxhcmdlIGhpbGxzISAgVHJ5IGNvbGxlY3Rpbmcgc29tZSBkYXRhIG9uIGxhcmdlIGhpbGxzIHRvIG1ha2Ugc3VyZSB5b3VyIHJlc3VsdHMgYXBwbHkgdG8gdGhlbS5cIjtcbiAgICB9IGVsc2UgaWYgKF8ubWluKF8ubWFwKF8ua2V5cyhjbGVhbmVkRGF0YSksIHBhcnNlSW50KSkgPj0gNTApIHtcbiAgICAgICAgcmV0dXJuIFwiWW91IGRvbid0IGhhdmUgYW55IGRhdGEgZm9yIHNtYWxsIGhpbGxzISAgVHJ5IGNvbGxlY3Rpbmcgc29tZSBkYXRhIG9uIHNtYWxsIGhpbGxzIHRvIG1ha2Ugc3VyZSB5b3VyIHJlc3VsdHMgYXBwbHkgdG8gdGhlbS5cIjtcbiAgICB9XG5cbiAgICAvLyBjaGVjayB0aGF0IHRoZXkgZG9uJ3QgaGF2ZSBiaWcgb3V0bGllcnMgaW4gYW55IG9mIHRoZWlyIGNvbHVtbnMuXG4gICAgdmFyIGF2Z3MgPSB7fVxuICAgIGZvciAodmFyIGhlaWdodCBpbiBjbGVhbmVkRGF0YSkge1xuICAgICAgICBhdmdzW2hlaWdodF0gPSB1dGlsLmF2ZyhjbGVhbmVkRGF0YVtoZWlnaHRdKTtcbiAgICAgICAgaWYgKF8uYW55KGNsZWFuZWREYXRhW2hlaWdodF0sIGZ1bmN0aW9uIChkYXR1bSkge3JldHVybiBNYXRoLmFicyhhdmdzW2hlaWdodF0gLSBwYXJzZUludChkYXR1bSkpID4gMzAwO30pKSB7XG4gICAgICAgICAgICByZXR1cm4gXCJPbmUgb2YgeW91ciByZXN1bHRzIGZvciBcIitoZWlnaHQrXCIgY20gbG9va3MgYSBiaXQgb2ZmISAgVHJ5IGNvbGxlY3Rpbmcgc29tZSBtb3JlIGRhdGEgdG8gbWFrZSBzdXJlIGl0J3MgYSBmbHVrZS5cIlxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gY2hlY2sgdGhhdCB0aGVpciByZXN1bHRzIGFyZSBjb25zaXN0ZW50IHdpdGggdGhlaXIgaHlwb3RoZXNpcywgYW5kIHRoYXRcbiAgICAvLyB0aGVpciBoeXBvdGhlc2lzIGlzIGNvcnJlY3QuXG4gICAgdmFyIHRyYW5zcG9zZWQgPSBfLnppcC5hcHBseShfLnBhaXJzKGF2Z3MpKTtcbiAgICB2YXIgY29ycmVsYXRpb24gPSB1dGlsLmNvcnJlbGF0aW9uKF8ubWFwKHRyYW5zcG9zZWRbMF0sIHBhcnNlSW50KSwgdHJhbnNwb3NlZFsxXSk7XG4gICAgaWYgKFxuICAgICAgICAgICAgKHN0YXRlLmh5cG90aGVzaXMgPT09IFwic2FtZVwiXG4gICAgICAgICAgICAgICAgJiYgTWF0aC5hYnMoXy5tYXgoXy52YWx1ZXMoYXZncykpIC0gXy5taW4oXy52YWx1ZXMoYXZncykpKSA+IDEwMClcbiAgICAgICAgICAgIHx8IChzdGF0ZS5oeXBvdGhlc2lzID09PSBcImZhc3RlclwiXG4gICAgICAgICAgICAgICAgJiYgY29ycmVsYXRpb24gPiAtMC41KSAvLyBuZWdhdGl2ZSBjb3JyZWxhdGlvbiB3b3VsZCBiZSB0YWxsZXIgPT4gc2hvcnRlciB0aW1lID0+IGZhc3RlclxuICAgICAgICAgICAgfHwgKHN0YXRlLmh5cG90aGVzaXMgPT09IFwic2xvd2VyXCJcbiAgICAgICAgICAgICAgICAmJiBjb3JyZWxhdGlvbiA8IDAuNSkpIHtcbiAgICAgICAgcmV0dXJuIFwiVGhvc2UgcmVzdWx0cyBkb24ndCBsb29rIHZlcnkgY29uc2lzdGVudCB3aXRoIHlvdXIgaHlwb3RoZXNpcy4gIEl0J3MgZmluZSBpZiB5b3VyIGh5cG90aGVzaXMgd2FzIGRpc3Byb3ZlbiwgdGhhdCdzIGhvdyBzY2llbmNlIHdvcmtzIVwiO1xuICAgIH0gZWxzZSBpZiAoXG4gICAgICAgICAgICBzdGF0ZS5oeXBvdGhlc2lzICE9PSBcInNhbWVcIlxuICAgICAgICAgICAgfHwgXy5tYXgoXy52YWx1ZXMoYXZncykpID4gMjAwXG4gICAgICAgICAgICB8fCBfLm1pbihfLnZhbHVlcyhhdmdzKSkgPCAxNDApIHtcbiAgICAgICAgcmV0dXJuIFwiVGhvc2UgcmVzdWx0cyBhcmUgY29uc2lzdGVudCwgYnV0IHRoZXkgZG9uJ3QgbG9vayBxdWl0ZSByaWdodCB0byBtZS4gIE1ha2Ugc3VyZSB5b3UncmUgZHJvcHBpbmcgdGhlIGJhbGxzIGdlbnRseSBmcm9tIHRoZSB0b3Agb2YgdGhlIHJhbXAgZWFjaCB0aW1lLlwiO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbn1cbiIsIlxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgQmFzZTogcmVxdWlyZSgnLi9iYXNlJyksXG4gICAgQmFjb246IHJlcXVpcmUoJy4vYmFjb24uanN4JyksXG4gICAgRGVtbzogcmVxdWlyZSgnLi9kZW1vJyksXG4gICAgTmV3dG9uMTogcmVxdWlyZSgnLi9uZXd0b24xJyksXG4gICAgT3JiaXQ6IHJlcXVpcmUoJy4vb3JiaXQnKSxcbiAgICBNb29uOiByZXF1aXJlKCcuL21vb24nKSxcbiAgICBBc3Rlcm9pZHM6IHJlcXVpcmUoJy4vYXN0ZXJvaWRzJyksXG4gICAgU2xvcGU6IHJlcXVpcmUoJy4vc2xvcGUnKSxcbiAgICBEcm9wOiByZXF1aXJlKCcuL2Ryb3AnKSxcbiAgICBUcnlHcmFwaDogcmVxdWlyZSgnLi90cnktZ3JhcGgnKSxcbiAgICBDYXZlRHJhdzogcmVxdWlyZSgnLi9jYXZlZHJhdycpLFxuICAgIEhpbGxzOiByZXF1aXJlKCcuL2hpbGxzJyksXG59XG4iLCIvKiogQGpzeCBSZWFjdC5ET00gKi9cblxudmFyIFdhbGt0aHJvdWdoID0gcmVxdWlyZSgnLi93YWxrLXRocm91Z2guanN4JylcbnZhciBQVCA9IFJlYWN0LlByb3BUeXBlc1xudmFyIFN0ZXAgPSByZXF1aXJlKCcuL3N0ZXAuanN4JylcblxudmFyIERFQlVHID0gZmFsc2VcblxubW9kdWxlLmV4cG9ydHMgPSBEcm9wSW50cm87XG5cbmZ1bmN0aW9uIERyb3BJbnRybyhFeGVyY2lzZSwgZ290SHlwb3RoZXNpcykge1xuICAgIHZhciBub2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKG5vZGUpXG4gICAgUmVhY3QucmVuZGVyQ29tcG9uZW50KFdhbGt0aHJvdWdoKHtcbiAgICAgICAgc3RlcHM6IHN0ZXBzLFxuICAgICAgICBvbkh5cG90aGVzaXM6IGdvdEh5cG90aGVzaXMsXG4gICAgICAgIG9uRG9uZTogZnVuY3Rpb24gKGh5cG90aGVzaXMpIHtcbiAgICAgICAgICAgIFJlYWN0LnVubW91bnRDb21wb25lbnRBdE5vZGUobm9kZSk7XG4gICAgICAgICAgICBub2RlLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQobm9kZSk7XG4gICAgICAgIH0sXG4gICAgICAgIEV4ZXJjaXNlOiBFeGVyY2lzZVxuICAgIH0pLCBub2RlKVxufVxuXG5cbnZhciBCdXR0b25Hcm91cCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ0J1dHRvbkdyb3VwJyxcbiAgICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IHRoaXMucHJvcHMuY2xhc3NOYW1lfSwgXG4gICAgICAgICAgICB0aGlzLnByb3BzLm9wdGlvbnMubWFwKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgICAgICAgICAgdmFyIGNscyA9IFwiYnRuIGJ0bi1kZWZhdWx0XCJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5zZWxlY3RlZCA9PT0gaXRlbVswXSkge1xuICAgICAgICAgICAgICAgICAgICBjbHMgKz0gJyBhY3RpdmUnXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBSZWFjdC5ET00uYnV0dG9uKHtrZXk6IGl0ZW1bMF0sIGNsYXNzTmFtZTogY2xzLCBvbkNsaWNrOiB0aGlzLnByb3BzLm9uU2VsZWN0LmJpbmQobnVsbCwgaXRlbVswXSl9LCBpdGVtWzFdKTtcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSlcbiAgICAgICAgKTtcbiAgICB9XG59KTtcblxudmFyIHN0ZXBzID0gW1xuICAgIGZ1bmN0aW9uIChwcm9wcykge1xuICAgICAgICByZXR1cm4gU3RlcChfLmV4dGVuZChwcm9wcywge1xuICAgICAgICAgICAgaWQ6ICdoZWxsbycsXG4gICAgICAgICAgICB0aXRsZTogXCJIaSEgSSdtIFNpciBGcmFuY2lzIEJhY29uXCIsXG4gICAgICAgICAgICBzaG93QmFjb246IHRydWUsXG4gICAgICAgICAgICBib2R5OiBcIkkgd2FzIG1hZGUgYSBLbmlnaHQgb2YgRW5nbGFuZCBmb3IgZG9pbmcgYXdlc29tZSBTY2llbmNlLiBXZSdyZSBnb2luZyB0byB1c2Ugc2NpZW5jZSB0byBmaWd1cmUgb3V0IGNvb2wgdGhpbmdzIGFib3V0IHRoZSB3b3JsZC5cIixcbiAgICAgICAgICAgIG5leHQ6IFwiTGV0J3MgZG8gc2NpZW5jZSFcIlxuICAgICAgICB9KSlcbiAgICB9LFxuXG4gICAgZnVuY3Rpb24gKHByb3BzKSB7XG4gICAgICAgIHZhciBoeXBvdGhlc2lzID0gcHJvcHMuZGF0YS5oeXBvdGhlc2lzXG4gICAgICAgIHJldHVybiBTdGVwKF8uZXh0ZW5kKHByb3BzLCB7XG4gICAgICAgICAgICBpZDogJ2Rlc2NyaXB0aW9uJyxcbiAgICAgICAgICAgIHRpdGxlOiBcIkV4cGVyaW1lbnQgIzFcIixcbiAgICAgICAgICAgIG9uVXBkYXRlOiBmdW5jdGlvbiAocHJldlByb3BzKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMuZGF0YS5oeXBvdGhlc2lzICYmICFwcmV2UHJvcHMuZGF0YS5oeXBvdGhlc2lzKSB7XG4gICAgICAgICAgICAgICAgICAgIHByb3BzLm9uSHlwb3RoZXNpcyhwcm9wcy5kYXRhLmh5cG90aGVzaXMpO1xuICAgICAgICAgICAgICAgICAgICBERUJVRyA/IHByb3BzLm9uTmV4dCgpIDogc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9wcy5vbk5leHQoKVxuICAgICAgICAgICAgICAgICAgICB9LCA1MDApXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGJvZHk6IFJlYWN0LkRPTS5kaXYobnVsbCwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLnAobnVsbCwgXCJXaGF0IGZhbGxzIGZhc3RlcjogYSB0ZW5uaXMgYmFsbCBvciBhIGJvd2xpbmcgYmFsbD9cIiksIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5wKG51bGwsIFwiQSBcIiwgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJ1bGluZVwifSwgXCJIeXBvdGhlc2lzXCIpLCBcIiBpcyB3aGF0IHlvdSB0aGluayB3aWxsIGhhcHBlbi5cIiksIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5ocihudWxsKSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImxhcmdlXCJ9LCBcIkkgdGhpbms6XCIsIFxuICAgICAgICAgICAgICAgICAgICBCdXR0b25Hcm91cCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU6IFwid2Fsa3Rocm91Z2hfaHlwb3RoZXNlc1wiLCBcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkOiBoeXBvdGhlc2lzLCBcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uU2VsZWN0OiBwcm9wcy5zZXREYXRhLmJpbmQobnVsbCwgJ2h5cG90aGVzaXMnKSwgXG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zOiBbW1widGVubmlzXCIsIFwiVGhlIHRlbm5pcyBiYWxsIGZhbGxzIGZhc3RlclwiXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBbXCJib3dsaW5nXCIsIFwiVGhlIGJvd2xpbmcgYmFsbCBmYWxscyBmYXN0ZXJcIl0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgW1wic2FtZVwiLCBcIlRoZXkgZmFsbCB0aGUgc2FtZVwiXV19KVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAvKipoeXBvdGhlc2lzICYmIDxwIGNsYXNzTmFtZT1cIndhbGt0aHJvdWdoX2dyZWF0XCI+R3JlYXQhIE5vdyB3ZSBkbyBzY2llbmNlPC9wPioqL1xuICAgICAgICAgICAgKVxuICAgICAgICB9KSlcbiAgICB9LFxuXG4gICAgZnVuY3Rpb24gKHByb3BzKSB7XG4gICAgICAgIHZhciBmaXJzdEJhbGwgPSAndGVubmlzJ1xuICAgICAgICB2YXIgc2Vjb25kQmFsbCA9ICdib3dsaW5nJ1xuICAgICAgICB2YXIgcHJvdmVyID0gcHJvcHMuZGF0YS5wcm92ZXJcbiAgICAgICAgdmFyIGh5cG90aGVzaXMgPSBwcm9wcy5kYXRhLmh5cG90aGVzaXNcblxuICAgICAgICBpZiAoaHlwb3RoZXNpcyA9PT0gJ2Jvd2xpbmcnKSB7XG4gICAgICAgICAgICBmaXJzdEJhbGwgPSAnYm93bGluZydcbiAgICAgICAgICAgIHNlY29uZEJhbGwgPSAndGVubmlzJ1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHJlc3BvbnNlcyA9IHtcbiAgICAgICAgICAgICd0ZW5uaXMnOiAnTm9wZS4gVGhhdCB3b3VsZCBzaG93IHRoYXQgdGhlIHRlbm5pcyBiYWxsIGZhbGxzIGZhc3RlcicsXG4gICAgICAgICAgICAnYm93bGluZyc6ICdOb3BlLiBUaGF0IHdvdWxkIHNob3cgdGhhdCB0aGUgYm93bGluZyBiYWxsIGZhbGxzIGZhc3RlcicsXG4gICAgICAgICAgICAnc2FtZSc6ICdOb3BlLiBUaGF0IHdvdWxkIHNob3cgdGhhdCB0aGV5IGZhbGwgdGhlIHNhbWUnXG4gICAgICAgIH1cbiAgICAgICAgdmFyIGNvcnJlY3QgPSB7XG4gICAgICAgICAgICAndGVubmlzJzogJ2xlc3MnLFxuICAgICAgICAgICAgJ2Jvd2xpbmcnOiAnbGVzcycsXG4gICAgICAgICAgICAnc2FtZSc6ICdzYW1lJ1xuICAgICAgICB9XG4gICAgICAgIHZhciBwcm92ZXJSZXNwb25zZVxuICAgICAgICB2YXIgaXNDb3JyZWN0ID0gcHJvdmVyID09PSBjb3JyZWN0W2h5cG90aGVzaXNdXG5cbiAgICAgICAgaWYgKHByb3Zlcikge1xuICAgICAgICAgICAgaWYgKGlzQ29ycmVjdCkge1xuICAgICAgICAgICAgICAgIHByb3ZlclJlc3BvbnNlID0gXCJFeGFjdGx5ISBOb3cgbGV0J3MgZG8gdGhlIGV4cGVyaW1lbnQuXCJcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcHJvdmVyUmVzcG9uc2UgPSByZXNwb25zZXNbe1xuICAgICAgICAgICAgICAgICAgICB0ZW5uaXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vcmU6ICdib3dsaW5nJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNhbWU6ICdzYW1lJ1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBib3dsaW5nOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtb3JlOiAndGVubmlzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNhbWU6ICdzYW1lJ1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBzYW1lOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtb3JlOiAnYm93bGluZycsXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXNzOiAndGVubmlzJ1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVtoeXBvdGhlc2lzXVtwcm92ZXJdXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBmdXR1cmVIeXBvdGhlc2lzID0ge1xuICAgICAgICAgICAgdGVubmlzOiAndGhlIHRlbm5pcyBiYWxsIHdpbGwgZmFsbCBmYXN0ZXIgdGhhbiB0aGUgYm93bGluZyBiYWxsJyxcbiAgICAgICAgICAgIGJvd2xpbmc6ICd0aGUgYm93bGluZyBiYWxsIHdpbGwgZmFsbCBmYXN0ZXIgdGhhbiB0aGUgdGVubmlzIGJhbGwnLFxuICAgICAgICAgICAgc2FtZTogJ3RoZSB0ZW5uaXMgYmFsbCBhbmQgdGhlIGJvd2xpbmcgYmFsbCB3aWxsIGZhbGwgdGhlIHNhbWUnXG4gICAgICAgIH1baHlwb3RoZXNpc107XG5cbiAgICAgICAgdmFyIGN1cnJlbnRIeXBvdGhlc2lzID0ge1xuICAgICAgICAgICAgdGVubmlzOiAnYSB0ZW5uaXMgYmFsbCBmYWxscyBmYXN0ZXIgdGhhbiBhIGJvd2xpbmcgYmFsbCcsXG4gICAgICAgICAgICBib3dsaW5nOiAnYSBib3dsaW5nIGJhbGwgZmFsbHMgZmFzdGVyIHRoYW4gYSB0ZW5uaXMgYmFsbCcsXG4gICAgICAgICAgICBzYW1lOiAnYSB0ZW5uaXMgYmFsbCBmYWxscyB0aGUgc2FtZSBhcyBhIGJvd2xpbmcgYmFsbCdcbiAgICAgICAgfVtoeXBvdGhlc2lzXTtcblxuICAgICAgICByZXR1cm4gU3RlcChfLmV4dGVuZChwcm9wcywge1xuICAgICAgICAgICAgaWQ6ICdkZXNpZ24tZXhwZXJpbWVudCcsXG4gICAgICAgICAgICB0aXRsZTogJ0Rlc2lnbmluZyB0aGUgRXhwZXJpbWVudCcsXG4gICAgICAgICAgICBvblVwZGF0ZTogZnVuY3Rpb24gKHByZXZQcm9wcykge1xuICAgICAgICAgICAgICAgIGlmIChwcm92ZXIgJiYgaXNDb3JyZWN0ICYmIHByb3ZlciAhPT0gcHJldlByb3BzLmRhdGEucHJvdmVyKSB7XG4gICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvcHMub25OZXh0KClcbiAgICAgICAgICAgICAgICAgICAgfSwgMjAwMCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGJvZHk6IFJlYWN0LkRPTS5kaXYobnVsbCwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLnAobnVsbCwgXCJOb3cgd2UgbmVlZCB0byBkZXNpZ24gYW4gZXhwZXJpbWVudCB0byB0ZXN0IHlvdXJcIiArICcgJyArXG4gICAgICAgICAgICAgICAgXCJoeXBvdGhlc2lzISBJdCdzIGltcG9ydGFudCB0byBiZSBjYXJlZnVsIHdoZW4gZGVzaWduaW5nIGFuXCIgKyAnICcgK1xuICAgICAgICAgICAgICAgIFwiZXhwZXJpbWVudCwgYmVjYXVzZSBvdGhlcndpc2UgeW91IGNvdWxkIGVuZCB1cCBcXFwicHJvdmluZ1xcXCJcIiArICcgJyArXG4gICAgICAgICAgICAgICAgXCJzb21ldGhpbmcgdGhhdCdzIGFjdHVhbGx5IGZhbHNlLlwiKSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLnAobnVsbCwgXCJUbyBwcm92ZSB0aGF0IFwiLCBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcInVsaW5lXCJ9LCBjdXJyZW50SHlwb3RoZXNpcyksIFwiLCB3ZSBjYW4gbWVhc3VyZSB0aGUgdGltZSB0aGF0IGl0XCIgKyAnICcgK1xuICAgICAgICAgICAgICAgIFwidGFrZXMgZm9yIGVhY2ggYmFsbCB0byBmYWxsIHdoZW4gZHJvcHBlZCBmcm9tIGEgc3BlY2lmaWNcIiArICcgJyArXG4gICAgICAgICAgICAgICAgXCJoZWlnaHQuXCIpLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00ucChudWxsLCBcIllvdXIgaHlwb3RoZXNpcyB3aWxsIGJlIHByb3ZlbiBpZiB0aGUgXCIsIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwidWxpbmVcIn0sIFwidGltZSBmb3IgdGhlIFwiLCBmaXJzdEJhbGwsIFwiIGJhbGxcIiksIFwiIGlzXCIsIFxuICAgICAgICAgICAgICAgICAgICBCdXR0b25Hcm91cCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU6IFwiYnRuLWdyb3VwXCIsIFxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWQ6IHByb3ZlciwgXG4gICAgICAgICAgICAgICAgICAgICAgICBvblNlbGVjdDogcHJvcHMuc2V0RGF0YS5iaW5kKG51bGwsICdwcm92ZXInKSwgXG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zOiBbWydsZXNzJywgJ2xlc3MgdGhhbiddLCBbJ21vcmUnLCAnbW9yZSB0aGFuJ10sIFsnc2FtZScsICd0aGUgc2FtZSBhcyddXX0pLCBcbiAgICAgICAgICAgICAgICAgICAgXCJ0aGUgXCIsIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwidWxpbmVcIn0sIFwidGltZSBmb3IgdGhlIFwiLCBzZWNvbmRCYWxsLCBcIiBiYWxsXCIpLCBcIi5cIlxuICAgICAgICAgICAgICAgICksIFxuICAgICAgICAgICAgICAgIHByb3ZlciAmJiBSZWFjdC5ET00ucCh7Y2xhc3NOYW1lOiBcImRlc2lnbl9yZXNwb25zZVwifSwgcHJvdmVyUmVzcG9uc2UpXG4gICAgICAgICAgICApXG4gICAgICAgIH0pKVxuICAgIH0sXG5cbiAgICBmdW5jdGlvbiAocHJvcHMpIHtcbiAgICAgICAgcmV0dXJuIFN0ZXAoXy5leHRlbmQocHJvcHMsIHtcbiAgICAgICAgICAgIGlkOiAnZXhwZXJpbWVudCcsXG4gICAgICAgICAgICBzdHlsZTogJ2JsYWNrJyxcbiAgICAgICAgICAgIHRpdGxlOiAnVGhlIGV4cGVyaW1lbnQnLFxuICAgICAgICAgICAgcG9zOiB7XG4gICAgICAgICAgICAgICAgbGVmdDogMzc1LFxuICAgICAgICAgICAgICAgIHRvcDogMjAwXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYm9keTogUmVhY3QuRE9NLnAobnVsbCwgXCJIZXJlIHdlIGhhdmUgdG9vbHMgdG8gY29uZHVjdCBvdXIgZXhwZXJpbWVudC4gWW91IGNhbiBzZWVcIiArICcgJyArXG4gICAgICAgICAgICBcInNvbWUgYm93bGluZyBiYWxscyBhbmQgdGVubmlzIGJhbGxzLCBhbmQgdGhvc2UgcmVkIGFuZCBncmVlblwiICsgJyAnICtcbiAgICAgICAgICAgIFwic2Vuc29ycyB3aWxsIHJlY29yZCB0aGUgdGltZSBpdCB0YWtlcyBmb3IgYSBiYWxsIHRvIGZhbGwuXCIpLFxuICAgICAgICAgICAgb25SZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBwcm9wcy5FeGVyY2lzZS5kZXBsb3lCYWxscyhmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIERFQlVHID8gcHJvcHMub25OZXh0KCkgOiBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3BzLm9uTmV4dCgpXG4gICAgICAgICAgICAgICAgICAgIH0sIDIwMDApO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pKVxuICAgIH0sXG5cbiAgICBmdW5jdGlvbiAocHJvcHMpIHtcbiAgICAgICAgcmV0dXJuIFN0ZXAoXy5leHRlbmQocHJvcHMsIHtcbiAgICAgICAgICAgIGlkOiAnZHJvcCcsXG4gICAgICAgICAgICBzdHlsZTogJ2JsYWNrJyxcbiAgICAgICAgICAgIHBvczoge1xuICAgICAgICAgICAgICAgIHRvcDogMjAwLFxuICAgICAgICAgICAgICAgIGxlZnQ6IDIwMFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGJvZHk6IFJlYWN0LkRPTS5wKG51bGwsIFwiSWYgd2UgZHJvcCBhIGJhbGwgaGVyZSBhYm92ZSB0aGUgZ3JlZW4gc2Vuc29yLCB3ZSBjYW5cIiArICcgJyArXG4gICAgICAgICAgICAgICAgXCJ0aW1lIGhvdyBsb25nIGl0IHRha2VzIGZvciBpdCB0byBmYWxsIHRvIHRoZSByZWQgc2Vuc29yLlwiKSxcbiAgICAgICAgICAgIG9uUmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcHJvcHMuRXhlcmNpc2UuZGVtb25zdHJhdGVEcm9wKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvcHMub25OZXh0KClcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICB9KSlcbiAgICB9LFxuXG4gICAgZnVuY3Rpb24gKHByb3BzKSB7XG4gICAgICAgIHJldHVybiBTdGVwKF8uZXh0ZW5kKHByb3BzLCB7XG4gICAgICAgICAgICBpZDogJ2xvZ2Jvb2snLFxuICAgICAgICAgICAgc3R5bGU6ICdibGFjaycsXG4gICAgICAgICAgICBwb3M6IHtcbiAgICAgICAgICAgICAgICB0b3A6IDEwMCxcbiAgICAgICAgICAgICAgICBsZWZ0OiA1MDBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBhcnJvdzogUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImFycm93LXRvLWxvZ2Jvb2tcIn0pLFxuICAgICAgICAgICAgYm9keTogUmVhY3QuRE9NLnAobnVsbCwgXCJUaGUgdGltZSBpcyB0aGVuIHJlY29yZGVkIG92ZXIgaGVyZSBpbiB5b3VyIGxvZyBib29rLiBGaWxsIHVwIHRoaXMgbG9nIGJvb2sgd2l0aCB0aW1lcyBmb3IgYm90aCBiYWxscyBhbmQgY29tcGFyZSB0aGVtLlwiKSxcbiAgICAgICAgICAgIG9uUmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHByb3BzLm9uTmV4dCgpO1xuICAgICAgICAgICAgICAgIH0sIERFQlVHID8gMTAwIDogNTAwMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pKTtcbiAgICB9LFxuXG4gICAgZnVuY3Rpb24gKHByb3BzKSB7XG4gICAgICAgIHJldHVybiBTdGVwKF8uZXh0ZW5kKHByb3BzLCB7XG4gICAgICAgICAgICBpZDogJ2Fuc3dlcicsXG4gICAgICAgICAgICBzdHlsZTogJ2JsYWNrJyxcbiAgICAgICAgICAgIHBvczoge1xuICAgICAgICAgICAgICAgIHRvcDogMTUwLFxuICAgICAgICAgICAgICAgIGxlZnQ6IDI1MFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGFycm93OiBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwiYXJyb3ctdG8tYW5zd2VyXCJ9KSxcbiAgICAgICAgICAgIHNob3dCYWNvbjogdHJ1ZSxcbiAgICAgICAgICAgIHRpdGxlOiBcIk5vdyBjb25kdWN0IHRoZSBleHBlcmltZW50IHRvIHRlc3QgeW91ciBoeXBvdGhlc2lzIVwiLFxuICAgICAgICAgICAgYm9keTogUmVhY3QuRE9NLnAobnVsbCwgXCJPbmNlIHlvdSd2ZSBjb2xsZWN0ZWQgZW5vdWdoIGRhdGEgaW4geW91ciBsb2cgYm9vayxcIiArICcgJyArXG4gICAgICAgICAgICBcImRlY2lkZSB3aGV0aGVyIHRoZSBkYXRhIFwiLCBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcInVsaW5lXCJ9LCBcInN1cHBvcnRcIiksIFwiIG9yXCIsIFxuICAgICAgICAgICAgJyAnLCBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcInVsaW5lXCJ9LCBcImRpc3Byb3ZlXCIpLCBcIiB5b3VyIGh5cG90aGVzaXMuIFRoZW5cIiArICcgJyArXG4gICAgICAgICAgICBcIkkgd2lsbCBldmFsdWF0ZSB5b3VyIGV4cGVyaW1lbnQgYW5kIGdpdmUgeW91IGZlZWRiYWNrLlwiKSxcbiAgICAgICAgICAgIG5leHQ6IFwiT2ssIEknbSByZWFkeVwiLFxuICAgICAgICB9KSlcbiAgICB9LFxuXVxuIiwiLyoqIEBqc3ggUmVhY3QuRE9NICovXG5cbnZhciBXYWxrdGhyb3VnaCA9IHJlcXVpcmUoJy4vd2Fsay10aHJvdWdoLmpzeCcpXG52YXIgUFQgPSBSZWFjdC5Qcm9wVHlwZXNcbnZhciBTdGVwID0gcmVxdWlyZSgnLi9zdGVwLmpzeCcpXG5cbnZhciBERUJVRyA9IGZhbHNlXG5cbm1vZHVsZS5leHBvcnRzID0gSGlsbHNJbnRybztcblxuZnVuY3Rpb24gSGlsbHNJbnRybyhFeGVyY2lzZSwgZ290SHlwb3RoZXNpcykge1xuICAgIHZhciBub2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKG5vZGUpXG4gICAgUmVhY3QucmVuZGVyQ29tcG9uZW50KFdhbGt0aHJvdWdoKHtcbiAgICAgICAgc3RlcHM6IHN0ZXBzLFxuICAgICAgICBvbkh5cG90aGVzaXM6IGdvdEh5cG90aGVzaXMsXG4gICAgICAgIG9uRG9uZTogZnVuY3Rpb24gKGh5cG90aGVzaXMpIHtcbiAgICAgICAgICAgIFJlYWN0LnVubW91bnRDb21wb25lbnRBdE5vZGUobm9kZSk7XG4gICAgICAgICAgICBub2RlLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQobm9kZSk7XG4gICAgICAgIH0sXG4gICAgICAgIEV4ZXJjaXNlOiBFeGVyY2lzZVxuICAgIH0pLCBub2RlKVxufVxuXG5cbnZhciBCdXR0b25Hcm91cCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ0J1dHRvbkdyb3VwJyxcbiAgICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IHRoaXMucHJvcHMuY2xhc3NOYW1lfSwgXG4gICAgICAgICAgICB0aGlzLnByb3BzLm9wdGlvbnMubWFwKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgICAgICAgICAgdmFyIGNscyA9IFwiYnRuIGJ0bi1kZWZhdWx0XCJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5zZWxlY3RlZCA9PT0gaXRlbVswXSkge1xuICAgICAgICAgICAgICAgICAgICBjbHMgKz0gJyBhY3RpdmUnXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBSZWFjdC5ET00uYnV0dG9uKHtrZXk6IGl0ZW1bMF0sIGNsYXNzTmFtZTogY2xzLCBvbkNsaWNrOiB0aGlzLnByb3BzLm9uU2VsZWN0LmJpbmQobnVsbCwgaXRlbVswXSl9LCBpdGVtWzFdKTtcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSlcbiAgICAgICAgKTtcbiAgICB9XG59KTtcblxudmFyIHN0ZXBzID0gW1xuICAgIGZ1bmN0aW9uIChwcm9wcykge1xuICAgICAgICByZXR1cm4gU3RlcChfLmV4dGVuZChwcm9wcywge1xuICAgICAgICAgICAgaWQ6ICdoZWxsbycsXG4gICAgICAgICAgICB0aXRsZTogXCJSZWFkeSBmb3IgZXZlbiBtb3JlIFNjaWVuY2U/XCIsXG4gICAgICAgICAgICBzaG93QmFjb246IHRydWUsXG4gICAgICAgICAgICBib2R5OiBcIkkgaGF2ZSBvbmUgbW9yZSBleHBlcmltZW50IGZvciB5b3UuXCIsXG4gICAgICAgICAgICBuZXh0OiBcIkxldCdzIGRvIGl0IVwiXG4gICAgICAgIH0pKVxuICAgIH0sXG5cbiAgICBmdW5jdGlvbiAocHJvcHMpIHtcbiAgICAgICAgdmFyIGh5cG90aGVzaXMgPSBwcm9wcy5kYXRhLmh5cG90aGVzaXNcbiAgICAgICAgcmV0dXJuIFN0ZXAoXy5leHRlbmQocHJvcHMsIHtcbiAgICAgICAgICAgIGlkOiAnZGVzY3JpcHRpb24nLFxuICAgICAgICAgICAgdGl0bGU6IFwiRXhwZXJpbWVudCAjM1wiLFxuICAgICAgICAgICAgb25VcGRhdGU6IGZ1bmN0aW9uIChwcmV2UHJvcHMpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5kYXRhLmh5cG90aGVzaXMgJiYgIXByZXZQcm9wcy5kYXRhLmh5cG90aGVzaXMpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvcHMub25IeXBvdGhlc2lzKHByb3BzLmRhdGEuaHlwb3RoZXNpcyk7XG4gICAgICAgICAgICAgICAgICAgIERFQlVHID8gcHJvcHMub25OZXh0KCkgOiBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3BzLm9uTmV4dCgpXG4gICAgICAgICAgICAgICAgICAgIH0sIDUwMClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYm9keTogUmVhY3QuRE9NLmRpdihudWxsLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00ucChudWxsLCBcIklmIGEgYmFsbCByb2xscyBvdmVyIGEgaGlsbCwgZG9lcyB0aGUgc3BlZWQgb2YgdGhlIGJhbGwgY2hhbmdlP1wiXG4gICAgICAgICAgICAgICAgKSwgXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5pbWcoe3NyYzogXCJpbWFnZXMvYmFsbHJvbGwtZGlhZ3JhbS5wbmdcIiwgd2lkdGg6IFwiMzAwcHhcIn0pLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uaHIobnVsbCksIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJsYXJnZVwifSwgXCJJIHRoaW5rOlwiLCBcbiAgICAgICAgICAgICAgICAgICAgQnV0dG9uR3JvdXAoe1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiBcIndhbGt0aHJvdWdoX2h5cG90aGVzZXNcIiwgXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZDogaHlwb3RoZXNpcywgXG4gICAgICAgICAgICAgICAgICAgICAgICBvblNlbGVjdDogcHJvcHMuc2V0RGF0YS5iaW5kKG51bGwsICdoeXBvdGhlc2lzJyksIFxuICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uczogW1tcImZhc3RlclwiLCBcIkl0IHdpbGwgY29tZSBvdXQgZ29pbmcgZmFzdGVyXCJdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtcInNsb3dlclwiLCBcIkl0IHdpbGwgY29tZSBvdXQgZ29pbmcgc2xvd2VyXCJdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtcInNhbWVcIiwgXCJJdCB3aWxsIGdvIHRoZSBzYW1lIHNwZWVkXCJdXX0pXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIC8qKmh5cG90aGVzaXMgJiYgPHAgY2xhc3NOYW1lPVwid2Fsa3Rocm91Z2hfZ3JlYXRcIj5HcmVhdCEgTm93IHdlIGRvIHNjaWVuY2U8L3A+KiovXG4gICAgICAgICAgICApXG4gICAgICAgIH0pKVxuICAgIH0sXG5cbiAgICBmdW5jdGlvbiAocHJvcHMpIHtcbiAgICAgICAgdmFyIHByb3ZlciA9IHByb3BzLmRhdGEucHJvdmVyXG4gICAgICAgIHZhciBoeXBvdGhlc2lzID0gcHJvcHMuZGF0YS5oeXBvdGhlc2lzXG5cbiAgICAgICAgdmFyIHJlc3BvbnNlcyA9IHtcbiAgICAgICAgICAgICdtb3JlJzogJ05vcGUuIFRoYXQgd291bGQgc2hvdyB0aGF0IHRoZSBiYWxsIGNvbWVzIG91dCBmYXN0ZXInLFxuICAgICAgICAgICAgJ2xlc3MnOiAnTm9wZS4gVGhhdCB3b3VsZCBzaG93IHRoYXQgdGhlIGJhbGwgY29tZXMgb3V0IHNsb3dlcicsXG4gICAgICAgICAgICAnc2FtZSc6ICdOb3BlLiBUaGF0IHdvdWxkIHNob3cgdGhhdCB0aGUgYmFsbCBjb21lcyBvdXQgYXQgdGhlIHNhbWUgc3BlZWQnLFxuICAgICAgICB9XG4gICAgICAgIHZhciBjb3JyZWN0ID0ge1xuICAgICAgICAgICAgJ2Zhc3Rlcic6ICdsZXNzJyxcbiAgICAgICAgICAgICdzbG93ZXInOiAnbW9yZScsXG4gICAgICAgICAgICAnc2FtZSc6ICdzYW1lJ1xuICAgICAgICB9XG4gICAgICAgIHZhciBwcm92ZXJSZXNwb25zZVxuICAgICAgICB2YXIgaXNDb3JyZWN0ID0gcHJvdmVyID09PSBjb3JyZWN0W2h5cG90aGVzaXNdXG5cbiAgICAgICAgaWYgKHByb3Zlcikge1xuICAgICAgICAgICAgaWYgKGlzQ29ycmVjdCkge1xuICAgICAgICAgICAgICAgIHByb3ZlclJlc3BvbnNlID0gXCJFeGFjdGx5ISBOb3cgbGV0J3MgZG8gdGhlIGV4cGVyaW1lbnQuXCJcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcHJvdmVyUmVzcG9uc2UgPSByZXNwb25zZXNbcHJvdmVyXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHZhciB3b3JkeUh5cG90aGVzaXMgPSB7XG4gICAgICAgICAgICBmYXN0ZXI6ICdmYXN0ZXInLFxuICAgICAgICAgICAgc2xvd2VyOiAnc2xvd2VyJyxcbiAgICAgICAgICAgIHNhbWU6ICd0aGUgc2FtZSBzcGVlZCcsXG4gICAgICAgIH1baHlwb3RoZXNpc107XG5cbiAgICAgICAgcmV0dXJuIFN0ZXAoXy5leHRlbmQocHJvcHMsIHtcbiAgICAgICAgICAgIGlkOiAnZGVzaWduLWV4cGVyaW1lbnQnLFxuICAgICAgICAgICAgdGl0bGU6ICdEZXNpZ25pbmcgdGhlIEV4cGVyaW1lbnQnLFxuICAgICAgICAgICAgb25VcGRhdGU6IGZ1bmN0aW9uIChwcmV2UHJvcHMpIHtcbiAgICAgICAgICAgICAgICBpZiAocHJvdmVyICYmIGlzQ29ycmVjdCAmJiBwcm92ZXIgIT09IHByZXZQcm9wcy5kYXRhLnByb3Zlcikge1xuICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3BzLm9uTmV4dCgpXG4gICAgICAgICAgICAgICAgICAgIH0sIDIwMDApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBib2R5OiBSZWFjdC5ET00uZGl2KG51bGwsIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5wKG51bGwsIFwiVG8gcHJvdmUgdGhhdCB0aGUgYmFsbCBjb21lcyBvdXQgXCIsIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwidWxpbmVcIn0sIHdvcmR5SHlwb3RoZXNpcyksIFwiLCB3ZSBjYW4gbWVhc3VyZSB0aGUgc3BlZWQgYWZ0ZXIgaXQgZ29lcyBkb3duIGEgcmFtcCBhbmQgdGhlbiBvdmVyIGEgaGlsbCBvZiBhIGdpdmVuIGhlaWdodC5cIiksIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5wKG51bGwsIFwiU2luY2Ugd2UgY2FuJ3QgbWVhc3VyZSBzcGVlZCBkaXJlY3RseSwgd2UnbGwgbWVhc3VyZSB0aGUgdGltZSBpdCB0YWtlcyBmb3IgdGhlIGJhbGwgdG8gdHJhdmVsIGEgc2hvcnQgZml4ZWQgZGlzdGFuY2UuXCIpLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00ucChudWxsLCBcIllvdXIgaHlwb3RoZXNpcyB3aWxsIGJlIHByb3ZlbiBpZiB3aGVuIHdlIHJvbGwgYSBiYWxsIGRvd24gYSByYW1wLCB0aGVuIG92ZXIgYSBsYXJnZXIgaGlsbCwgdGhlIFwiLCBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcInVsaW5lXCJ9LCBcInRpbWUgaXQgdGFrZXNcIiksIFwiIGZvciB0aGUgYmFsbCB0byBnbyBhIGZpeGVkIGRpc3RhbmNlIGlzXCIsIFxuICAgICAgICAgICAgICAgICAgICBCdXR0b25Hcm91cCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU6IFwiYnRuLWdyb3VwXCIsIFxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWQ6IHByb3ZlciwgXG4gICAgICAgICAgICAgICAgICAgICAgICBvblNlbGVjdDogcHJvcHMuc2V0RGF0YS5iaW5kKG51bGwsICdwcm92ZXInKSwgXG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zOiBbWydsZXNzJywgJ2xlc3MgdGhhbiddLCBbJ21vcmUnLCAnbW9yZSB0aGFuJ10sIFsnc2FtZScsICd0aGUgc2FtZSBhcyddXX0pLCBcbiAgICAgICAgICAgICAgICAgICAgXCJ0aGUgdGltZSBpdCB0YWtlcyBmb3IgdGhlIGJhbGwgdG8gZ28gdGhlIHNhbWUgZGlzdGFuY2UgaWYgaXQgd2VudCBvdmVyIGEgc21hbGxlciBoaWxsLlwiXG4gICAgICAgICAgICAgICAgKSwgXG4gICAgICAgICAgICAgICAgcHJvdmVyICYmIFJlYWN0LkRPTS5wKHtjbGFzc05hbWU6IFwiZGVzaWduX3Jlc3BvbnNlXCJ9LCBwcm92ZXJSZXNwb25zZSlcbiAgICAgICAgICAgIClcbiAgICAgICAgfSkpXG4gICAgfSxcblxuICAgIGZ1bmN0aW9uIChwcm9wcykge1xuICAgICAgICByZXR1cm4gU3RlcChfLmV4dGVuZChwcm9wcywge1xuICAgICAgICAgICAgaWQ6ICdleHBlcmltZW50JyxcbiAgICAgICAgICAgIHN0eWxlOiAnYmxhY2snLFxuICAgICAgICAgICAgdGl0bGU6ICdUaGUgZXhwZXJpbWVudCcsXG4gICAgICAgICAgICBwb3M6IHtcbiAgICAgICAgICAgICAgICBsZWZ0OiAzNzUsXG4gICAgICAgICAgICAgICAgdG9wOiAyMDBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBib2R5OiBSZWFjdC5ET00ucChudWxsLCBcIkhlcmUgd2UgaGF2ZSB0b29scyB0byBjb25kdWN0IG91ciBleHBlcmltZW50LlwiICsgJyAnICtcbiAgICAgICAgICAgICAgICAgICAgIFwiVGhlIHJlZCBhbmQgZ3JlZW4gc2Vuc29ycyB3aWxsIHJlY29yZCB0aGUgdGltZSBpdCB0YWtlcyBmb3IgdGhlIGJhbGwgdG8gZ28gYSBzaG9ydCBmaXhlZCBkaXN0YW5jZSBhZnRlciBnb2luZyBvdmVyIHRoZSBoaWxsLlwiKSxcbiAgICAgICAgICAgIG9uUmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcHJvcHMuRXhlcmNpc2UuZHJvcE9iamVjdHMoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBERUJVRyA/IHByb3BzLm9uTmV4dCgpIDogc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9wcy5vbk5leHQoKVxuICAgICAgICAgICAgICAgICAgICB9LCAyMDAwKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICB9KSlcbiAgICB9LFxuXG4gICAgZnVuY3Rpb24gKHByb3BzKSB7XG4gICAgICAgIHJldHVybiBTdGVwKF8uZXh0ZW5kKHByb3BzLCB7XG4gICAgICAgICAgICBpZDogJ2Ryb3AnLFxuICAgICAgICAgICAgc3R5bGU6ICdibGFjaycsXG4gICAgICAgICAgICBwb3M6IHtcbiAgICAgICAgICAgICAgICB0b3A6IDIwMCxcbiAgICAgICAgICAgICAgICBsZWZ0OiAyMDBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBib2R5OiBSZWFjdC5ET00ucChudWxsLCBcIldlIGNhbiB0ZXN0IG91dCB0aGlzIGh5cG90aGVzaXMgYnkgcm9sbGluZyBhIGJhbGwgc3RhcnRpbmcgYXQgdGhlIHRvcCBvZiB0aGUgcmFtcC5cIiksXG4gICAgICAgICAgICBvblJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHByb3BzLkV4ZXJjaXNlLmRlbW9uc3RyYXRlRHJvcChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHByb3BzLm9uTmV4dCgpXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkpXG4gICAgfSxcblxuICAgIGZ1bmN0aW9uIChwcm9wcykge1xuICAgICAgICByZXR1cm4gU3RlcChfLmV4dGVuZChwcm9wcywge1xuICAgICAgICAgICAgaWQ6ICdsb2dib29rJyxcbiAgICAgICAgICAgIHN0eWxlOiAnYmxhY2snLFxuICAgICAgICAgICAgcG9zOiB7XG4gICAgICAgICAgICAgICAgdG9wOiAxMDAsXG4gICAgICAgICAgICAgICAgbGVmdDogNTAwXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYXJyb3c6IFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJhcnJvdy10by1oaWxsLXNsaWRlclwifSksXG4gICAgICAgICAgICBib2R5OiBSZWFjdC5ET00ucChudWxsLCBcIldlIGNhbiBjaGFuZ2UgdGhlIGhlaWdodCBvZiB0aGUgaGlsbCBoZXJlLlwiKSxcbiAgICAgICAgICAgIG9uUmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHByb3BzLm9uTmV4dCgpO1xuICAgICAgICAgICAgICAgIH0sIERFQlVHID8gMTAwIDogNTAwMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pKTtcbiAgICB9LFxuXG4gICAgZnVuY3Rpb24gKHByb3BzKSB7XG4gICAgICAgIHJldHVybiBTdGVwKF8uZXh0ZW5kKHByb3BzLCB7XG4gICAgICAgICAgICBpZDogJ2Fuc3dlcicsXG4gICAgICAgICAgICBzdHlsZTogJ2JsYWNrJyxcbiAgICAgICAgICAgIHBvczoge1xuICAgICAgICAgICAgICAgIHRvcDogMTUwLFxuICAgICAgICAgICAgICAgIGxlZnQ6IDI1MFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGFycm93OiBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwiYXJyb3ctdG8tYW5zd2VyXCJ9KSxcbiAgICAgICAgICAgIHNob3dCYWNvbjogdHJ1ZSxcbiAgICAgICAgICAgIHRpdGxlOiBcIk5vdyBjb25kdWN0IHRoZSBleHBlcmltZW50IHRvIHRlc3QgeW91ciBoeXBvdGhlc2lzIVwiLFxuICAgICAgICAgICAgYm9keTogUmVhY3QuRE9NLnAobnVsbCwgXCJPbmNlIHlvdSd2ZSBjb2xsZWN0ZWQgZW5vdWdoIGRhdGEgaW4geW91ciBsb2cgYm9vayxcIiArICcgJyArXG4gICAgICAgICAgICBcImRlY2lkZSB3aGV0aGVyIHRoZSBkYXRhIFwiLCBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcInVsaW5lXCJ9LCBcInN1cHBvcnRcIiksIFwiIG9yXCIsIFxuICAgICAgICAgICAgJyAnLCBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcInVsaW5lXCJ9LCBcImRpc3Byb3ZlXCIpLCBcIiB5b3VyIGh5cG90aGVzaXMuIFRoZW5cIiArICcgJyArXG4gICAgICAgICAgICBcIkkgd2lsbCBldmFsdWF0ZSB5b3VyIGV4cGVyaW1lbnQgYW5kIGdpdmUgeW91IGZlZWRiYWNrLlwiKSxcbiAgICAgICAgICAgIG5leHQ6IFwiT2ssIEknbSByZWFkeVwiLFxuICAgICAgICB9KSlcbiAgICB9LFxuXVxuIiwiLyoqIEBqc3ggUmVhY3QuRE9NICovXG5cbnZhciBXYWxrdGhyb3VnaCA9IHJlcXVpcmUoJy4vd2Fsay10aHJvdWdoLmpzeCcpXG52YXIgUFQgPSBSZWFjdC5Qcm9wVHlwZXNcbnZhciBTdGVwID0gcmVxdWlyZSgnLi9zdGVwLmpzeCcpXG5cbnZhciBERUJVRyA9IGZhbHNlXG5cbm1vZHVsZS5leHBvcnRzID0gTmV3dG9uMUludHJvO1xuXG5mdW5jdGlvbiBOZXd0b24xSW50cm8oRXhlcmNpc2UsIGdvdEh5cG90aGVzaXMpIHtcbiAgICB2YXIgbm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChub2RlKVxuICAgIFJlYWN0LnJlbmRlckNvbXBvbmVudChXYWxrdGhyb3VnaCh7XG4gICAgICAgIHN0ZXBzOiBzdGVwcyxcbiAgICAgICAgb25IeXBvdGhlc2lzOiBnb3RIeXBvdGhlc2lzLFxuICAgICAgICBvbkRvbmU6IGZ1bmN0aW9uIChoeXBvdGhlc2lzKSB7XG4gICAgICAgICAgICBSZWFjdC51bm1vdW50Q29tcG9uZW50QXROb2RlKG5vZGUpO1xuICAgICAgICAgICAgbm9kZS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKG5vZGUpO1xuICAgICAgICB9LFxuICAgICAgICBFeGVyY2lzZTogRXhlcmNpc2VcbiAgICB9KSwgbm9kZSlcbn1cblxuXG52YXIgQnV0dG9uR3JvdXAgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdCdXR0b25Hcm91cCcsXG4gICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiB0aGlzLnByb3BzLmNsYXNzTmFtZX0sIFxuICAgICAgICAgICAgdGhpcy5wcm9wcy5vcHRpb25zLm1hcChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgICAgICAgIHZhciBjbHMgPSBcImJ0biBidG4tZGVmYXVsdFwiXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMuc2VsZWN0ZWQgPT09IGl0ZW1bMF0pIHtcbiAgICAgICAgICAgICAgICAgICAgY2xzICs9ICcgYWN0aXZlJ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gUmVhY3QuRE9NLmJ1dHRvbih7a2V5OiBpdGVtWzBdLCBjbGFzc05hbWU6IGNscywgb25DbGljazogdGhpcy5wcm9wcy5vblNlbGVjdC5iaW5kKG51bGwsIGl0ZW1bMF0pfSwgaXRlbVsxXSk7XG4gICAgICAgICAgICB9LmJpbmQodGhpcykpXG4gICAgICAgICk7XG4gICAgfVxufSk7XG5cbnZhciBzdGVwcyA9IFtcbiAgICBmdW5jdGlvbiAocHJvcHMpIHtcbiAgICAgICAgcmV0dXJuIFN0ZXAoXy5leHRlbmQocHJvcHMsIHtcbiAgICAgICAgICAgIGlkOiAnaGVsbG8nLFxuICAgICAgICAgICAgdGl0bGU6IFwiUmVhZHkgZm9yIG1vcmUgU2NpZW5jZT9cIixcbiAgICAgICAgICAgIHNob3dCYWNvbjogdHJ1ZSxcbiAgICAgICAgICAgIGJvZHk6IFwiTGV0J3MgZ2V0IG91dCBvZiB0aGUgbGFiLiBGb3IgdGhpcyBuZXh0IGV4cGVyaW1lbnQsIEkga25vdyBqdXN0IHRoZSBwbGFjZSFcIixcbiAgICAgICAgICAgIG5leHQ6IFwiTGV0J3MgZ28hXCJcbiAgICAgICAgfSkpXG4gICAgfSxcblxuICAgIGZ1bmN0aW9uIChwcm9wcykge1xuICAgICAgICByZXR1cm4gU3RlcChfLmV4dGVuZChwcm9wcywge1xuICAgICAgICAgICAgaWQ6ICdzcGFjZScsXG4gICAgICAgICAgICBzdHlsZTogJ2JsYWNrJyxcbiAgICAgICAgICAgIHRpdGxlOiBcIlNwYWNlIVwiLFxuICAgICAgICAgICAgYm9keTogXCJUaGUgcnVsZXMgb2Ygc2NpZW5jZSB3b3JrIGV2ZXJ5d2hlcmUsIHNvIGRpc2NvdmVyaWVzIHdlIG1ha2UgXCIgK1xuICAgICAgICAgICAgICAgIFwiaW4gc3BhY2Ugd2lsbCBhbHNvIGFwcGx5IGhlcmUgb24gRWFydGguIEFuIGltcG9ydGFudCBza2lsbCB3aGVuIFwiICtcbiAgICAgICAgICAgICAgICBcImRlc2lnbmluZyBhbiBleHBlcmltZW50IGlzIGF2b2lkaW5nIHRoaW5ncyB0aGF0IGNvdWxkIFwiICtcbiAgICAgICAgICAgICAgICBcImludGVyZmVyZSB3aXRoIHRoZSByZXN1bHRzLiBJbiBzcGFjZSwgd2UgZG9uJ3QgbmVlZCBcIiArXG4gICAgICAgICAgICAgICAgXCJ0byB3b3JyeSBhYm91dCBncmF2aXR5IG9yIHdpbmQuXCIsXG4gICAgICAgICAgICBuZXh0OiBcIkNvb2whXCJcbiAgICAgICAgfSkpXG4gICAgfSxcblxuICAgIGZ1bmN0aW9uIChwcm9wcykge1xuICAgICAgICB2YXIgaHlwb3RoZXNpcyA9IHByb3BzLmRhdGEuaHlwb3RoZXNpc1xuICAgICAgICByZXR1cm4gU3RlcChfLmV4dGVuZChwcm9wcywge1xuICAgICAgICAgICAgaWQ6ICdkZXNjcmlwdGlvbicsXG4gICAgICAgICAgICBzdHlsZTogJ2JsYWNrJyxcbiAgICAgICAgICAgIHRpdGxlOiBcIkV4cGVyaW1lbnQgIzJcIixcbiAgICAgICAgICAgIG9uVXBkYXRlOiBmdW5jdGlvbiAocHJldlByb3BzKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMuZGF0YS5oeXBvdGhlc2lzICYmICFwcmV2UHJvcHMuZGF0YS5oeXBvdGhlc2lzKSB7XG4gICAgICAgICAgICAgICAgICAgIHByb3BzLm9uSHlwb3RoZXNpcyhwcm9wcy5kYXRhLmh5cG90aGVzaXMpO1xuICAgICAgICAgICAgICAgICAgICBERUJVRyA/IHByb3BzLm9uTmV4dCgpIDogc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9wcy5vbk5leHQoKVxuICAgICAgICAgICAgICAgICAgICB9LCA1MDApXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGJvZHk6IFJlYWN0LkRPTS5kaXYobnVsbCwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLnAobnVsbCwgXCJXaGF0IGhhcHBlbnMgdG8gYSBtb3Zpbmcgb2JqZWN0IGlmIHlvdSBsZWF2ZSBpdCBhbG9uZT9cIiksIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5ocihudWxsKSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImxhcmdlXCJ9LCBcIkkgdGhpbms6XCIsIFxuICAgICAgICAgICAgICAgICAgICBCdXR0b25Hcm91cCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU6IFwid2Fsa3Rocm91Z2hfaHlwb3RoZXNlc1wiLCBcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkOiBoeXBvdGhlc2lzLCBcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uU2VsZWN0OiBwcm9wcy5zZXREYXRhLmJpbmQobnVsbCwgJ2h5cG90aGVzaXMnKSwgXG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zOiBbW1wiZmFzdGVyXCIsIFwiSXQgc3BlZWRzIHVwXCJdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtcInNsb3dlclwiLCBcIkl0IHNsb3dzIGRvd25cIl0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgW1wic2FtZVwiLCBcIkl0IHN0YXlzIGF0IHRoZSBzYW1lIHNwZWVkIGZvcmV2ZXJcIl1dfSlcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgLyoqaHlwb3RoZXNpcyAmJiA8cCBjbGFzc05hbWU9XCJ3YWxrdGhyb3VnaF9ncmVhdFwiPkdyZWF0ISBOb3cgd2UgZG8gc2NpZW5jZTwvcD4qKi9cbiAgICAgICAgICAgIClcbiAgICAgICAgfSkpXG4gICAgfSxcblxuICAgIGZ1bmN0aW9uIChwcm9wcykge1xuICAgICAgICB2YXIgcHJvdmVyID0gcHJvcHMuZGF0YS5wcm92ZXJcbiAgICAgICAgdmFyIGh5cG90aGVzaXMgPSBwcm9wcy5kYXRhLmh5cG90aGVzaXNcblxuICAgICAgICB2YXIgcmVzcG9uc2VzID0ge1xuICAgICAgICAgICAgJ21vcmUnOiAnTm9wZS4gVGhhdCB3b3VsZCBzaG93IHRoYXQgdGhlIG9iamVjdCBnZXRzIGZhc3Rlci4nLFxuICAgICAgICAgICAgJ2xlc3MnOiAnTm9wZS4gVGhhdCB3b3VsZCBzaG93IHRoYXQgdGhlIG9iamVjdCBnZXRzIHNsb3dlci4nLFxuICAgICAgICAgICAgJ3NhbWUnOiAnTm9wZS4gVGhhdCB3b3VsZCBzaG93IHRoYXQgdGhlIG9iamVjdCBzdGF5cyB0aGUgc2FtZSBzcGVlZC4nXG4gICAgICAgIH1cbiAgICAgICAgdmFyIGNvcnJlY3QgPSB7XG4gICAgICAgICAgICAnZmFzdGVyJzogJ21vcmUnLFxuICAgICAgICAgICAgJ3Nsb3dlcic6ICdsZXNzJyxcbiAgICAgICAgICAgICdzYW1lJzogJ3NhbWUnXG4gICAgICAgIH1cbiAgICAgICAgdmFyIHByb3ZlclJlc3BvbnNlXG4gICAgICAgIHZhciBpc0NvcnJlY3QgPSBwcm92ZXIgPT09IGNvcnJlY3RbaHlwb3RoZXNpc11cblxuICAgICAgICBpZiAocHJvdmVyKSB7XG4gICAgICAgICAgICBpZiAoaXNDb3JyZWN0KSB7XG4gICAgICAgICAgICAgICAgcHJvdmVyUmVzcG9uc2UgPSBcIkV4YWN0bHkhIE5vdyBsZXQncyBkbyB0aGUgZXhwZXJpbWVudC5cIlxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBwcm92ZXJSZXNwb25zZSA9IHJlc3BvbnNlc1twcm92ZXJdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGN1cnJlbnRIeXBvdGhlc2lzID0ge1xuICAgICAgICAgICAgZmFzdGVyOiAnbW92aW5nIG9iamVjdHMgZ2V0IGZhc3RlciBvdmVyIHRpbWUnLFxuICAgICAgICAgICAgc2xvd2VyOiAnbW92aW5nIG9iamVjdHMgZ2V0IHNsb3dlciBvdmVyIHRpbWUnLFxuICAgICAgICAgICAgc2FtZTogXCJtb3Zpbmcgb2JqZWN0cyBkb24ndCBjaGFuZ2UgaW4gc3BlZWQgb3ZlciB0aW1lXCJcbiAgICAgICAgfVtoeXBvdGhlc2lzXTtcblxuICAgICAgICByZXR1cm4gU3RlcChfLmV4dGVuZChwcm9wcywge1xuICAgICAgICAgICAgaWQ6ICdkZXNpZ24tZXhwZXJpbWVudCcsXG4gICAgICAgICAgICBzdHlsZTogJ2JsYWNrJyxcbiAgICAgICAgICAgIHRpdGxlOiAnRGVzaWduaW5nIHRoZSBFeHBlcmltZW50JyxcbiAgICAgICAgICAgIG9uVXBkYXRlOiBmdW5jdGlvbiAocHJldlByb3BzKSB7XG4gICAgICAgICAgICAgICAgaWYgKHByb3ZlciAmJiBpc0NvcnJlY3QgJiYgcHJvdmVyICE9PSBwcmV2UHJvcHMuZGF0YS5wcm92ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9wcy5vbk5leHQoKVxuICAgICAgICAgICAgICAgICAgICB9LCAyMDAwKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYm9keTogUmVhY3QuRE9NLmRpdihudWxsLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00ucChudWxsLCBcIlRvIHByb3ZlIHRoYXQgXCIsIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwidWxpbmVcIn0sIGN1cnJlbnRIeXBvdGhlc2lzKSwgXCIsXCIgKyAnICcgK1xuICAgICAgICAgICAgICAgIFwid2UgY2FuIG1lYXN1cmUgdGhlIHRpbWUgdGhhdCBpdCB0YWtlcyBmb3IgYW4gYXN0ZXJvaWQgdG8gbW92ZSAxMDAgbWV0ZXJzLFwiICsgJyAnICtcbiAgICAgICAgICAgICAgICBcInRoZW4gbWVhc3VyZSB0aGUgdGltZSB0byBtb3ZlIGFub3RoZXIgMTAwIG1ldGVycy5cIiksIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5wKG51bGwsIFwiWW91ciBoeXBvdGhlc2lzIHdpbGwgYmUgcHJvdmVuIGlmIHRoZSBcIiwgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJ1bGluZVwifSwgXCJ0aW1lIHRvIHRyYXZlbCB0aGUgZmlyc3QgMTAwbVwiKSwgXCIgaXNcIiwgXG4gICAgICAgICAgICAgICAgICAgIEJ1dHRvbkdyb3VwKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogXCJidG4tZ3JvdXBcIiwgXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZDogcHJvdmVyLCBcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uU2VsZWN0OiBwcm9wcy5zZXREYXRhLmJpbmQobnVsbCwgJ3Byb3ZlcicpLCBcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnM6IFtbJ2xlc3MnLCAnbGVzcyB0aGFuJ10sIFsnbW9yZScsICdtb3JlIHRoYW4nXSwgWydzYW1lJywgJ3RoZSBzYW1lIGFzJ11dfSksIFxuICAgICAgICAgICAgICAgICAgICBcInRoZSBcIiwgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJ1bGluZVwifSwgXCJ0aW1lIHRvIHRyYXZlbCB0aGUgbmV4dCAxMDBtXCIpLCBcIi5cIlxuICAgICAgICAgICAgICAgICksIFxuICAgICAgICAgICAgICAgIHByb3ZlciAmJiBSZWFjdC5ET00ucCh7Y2xhc3NOYW1lOiBcImRlc2lnbl9yZXNwb25zZV93aGl0ZVwifSwgcHJvdmVyUmVzcG9uc2UpXG4gICAgICAgICAgICApXG4gICAgICAgIH0pKVxuICAgIH0sXG5cbiAgICBmdW5jdGlvbiAocHJvcHMpIHtcbiAgICAgICAgcmV0dXJuIFN0ZXAoXy5leHRlbmQocHJvcHMsIHtcbiAgICAgICAgICAgIGlkOiAnZHJvcCcsXG4gICAgICAgICAgICBzdHlsZTogJ2JsYWNrJyxcbiAgICAgICAgICAgIHBvczoge1xuICAgICAgICAgICAgICAgIHRvcDogMjAwLFxuICAgICAgICAgICAgICAgIGxlZnQ6IDIwMFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGJvZHk6IFJlYWN0LkRPTS5wKG51bGwsIFwiV2UgY2FuIHRlc3Qgb3V0IHRoaXMgaHlwb3RoZXNpcyBieSB0aHJvd2luZyBhbiBhc3Rlcm9pZFwiICsgJyAnICtcbiAgICAgICAgICAgICAgICAgICAgIFwidGhyb3VnaCB0aGUgZ3JlZW4gc2Vuc29ycywgd2hpY2ggYXJlIGV2ZW5seS1zcGFjZWQuIFRyeVwiICsgJyAnICtcbiAgICAgICAgICAgICAgICAgICAgIFwidGhyb3dpbmcgYXQgZGlmZmVyZW50IHNwZWVkcyFcIiksXG4gICAgICAgICAgICBvblJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHByb3BzLkV4ZXJjaXNlLmRlbW9uc3RyYXRlU2FtcGxlKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvcHMub25OZXh0KClcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICB9KSlcbiAgICB9LFxuXG4gICAgZnVuY3Rpb24gKHByb3BzKSB7XG4gICAgICAgIHJldHVybiBTdGVwKF8uZXh0ZW5kKHByb3BzLCB7XG4gICAgICAgICAgICBpZDogJ2xvZ2Jvb2snLFxuICAgICAgICAgICAgc3R5bGU6ICdibGFjaycsXG4gICAgICAgICAgICBwb3M6IHtcbiAgICAgICAgICAgICAgICB0b3A6IDEwMCxcbiAgICAgICAgICAgICAgICBsZWZ0OiA1MDBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBhcnJvdzogUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImFycm93LXRvLWxvZ2Jvb2stbmV3dG9uMVwifSksXG4gICAgICAgICAgICBib2R5OiBSZWFjdC5ET00ucChudWxsLCBcIk5vdGljZSB0aGF0IGJvdGggdGltZXMgc2hvdyB1cCBpbiB0aGUgbG9nIGJvb2suXCIpLFxuICAgICAgICAgICAgb25SZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvcHMub25OZXh0KCk7XG4gICAgICAgICAgICAgICAgfSwgREVCVUcgPyAxMDAgOiA1MDAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkpO1xuICAgIH0sXG5cbiAgICBmdW5jdGlvbiAocHJvcHMpIHtcbiAgICAgICAgcmV0dXJuIFN0ZXAoXy5leHRlbmQocHJvcHMsIHtcbiAgICAgICAgICAgIGlkOiAnYW5zd2VyJyxcbiAgICAgICAgICAgIHN0eWxlOiAnYmxhY2snLFxuICAgICAgICAgICAgcG9zOiB7XG4gICAgICAgICAgICAgICAgdG9wOiAxNTAsXG4gICAgICAgICAgICAgICAgbGVmdDogMjUwXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYXJyb3c6IFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJhcnJvdy10by1hbnN3ZXJcIn0pLFxuICAgICAgICAgICAgc2hvd0JhY29uOiB0cnVlLFxuICAgICAgICAgICAgdGl0bGU6IFwiTm93IGNvbmR1Y3QgdGhlIGV4cGVyaW1lbnQgdG8gdGVzdCB5b3VyIGh5cG90aGVzaXMhXCIsXG4gICAgICAgICAgICBib2R5OiBSZWFjdC5ET00ucChudWxsLCBcIk9uY2UgeW91J3ZlIGNvbGxlY3RlZCBlbm91Z2ggZGF0YSBpbiB5b3VyIGxvZyBib29rLFwiICsgJyAnICtcbiAgICAgICAgICAgIFwiZGVjaWRlIHdoZXRoZXIgdGhlIGRhdGEgXCIsIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwidWxpbmVcIn0sIFwic3VwcG9ydFwiKSwgXCIgb3JcIiwgXG4gICAgICAgICAgICAnICcsIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwidWxpbmVcIn0sIFwiZGlzcHJvdmVcIiksIFwiIHlvdXIgaHlwb3RoZXNpcy4gVGhlblwiICsgJyAnICtcbiAgICAgICAgICAgIFwiSSB3aWxsIGV2YWx1YXRlIHlvdXIgZXhwZXJpbWVudCBhbmQgZ2l2ZSB5b3UgZmVlZGJhY2suXCIpLFxuICAgICAgICAgICAgbmV4dDogXCJPaywgSSdtIHJlYWR5XCIsXG4gICAgICAgIH0pKVxuICAgIH0sXG5dXG4iLCIvKiogQGpzeCBSZWFjdC5ET00gKi9cblxudmFyIFBUID0gUmVhY3QuUHJvcFR5cGVzXG52YXIgY3ggPSBSZWFjdC5hZGRvbnMuY2xhc3NTZXRcblxudmFyIFN0ZXAgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdTdGVwJyxcbiAgICBwcm9wVHlwZXM6IHtcbiAgICAgICAgdGl0bGU6IFBULnN0cmluZyxcbiAgICAgICAgbmV4dDogUFQuc3RyaW5nLFxuICAgICAgICBvblJlbmRlcjogUFQuZnVuYyxcbiAgICAgICAgb25GYWRlZE91dDogUFQuZnVuYyxcbiAgICAgICAgc2hvd0JhY29uOiBQVC5ib29sLFxuICAgICAgICBmYWRlT3V0OiBQVC5ib29sLFxuICAgIH0sXG5cbiAgICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHN0eWxlOiAnd2hpdGUnXG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMub25SZW5kZXIpIHtcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25SZW5kZXIoKVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuZ2V0RE9NTm9kZSgpLmFkZEV2ZW50TGlzdGVuZXIoJ3RyYW5zaXRpb25lbmQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5mYWRlT3V0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkZhZGVkT3V0KClcbiAgICAgICAgICAgIH1cbiAgICAgICAgfS5iaW5kKHRoaXMpKVxuICAgIH0sXG5cbiAgICBjb21wb25lbnREaWRVcGRhdGU6IGZ1bmN0aW9uIChwcmV2UHJvcHMpIHtcbiAgICAgICAgaWYgKHByZXZQcm9wcy5pZCAhPT0gdGhpcy5wcm9wcy5pZCAmJlxuICAgICAgICAgICAgdGhpcy5wcm9wcy5vblJlbmRlcikge1xuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMub25SZW5kZXIoKVxuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnByb3BzLm9uVXBkYXRlKSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uVXBkYXRlLmNhbGwodGhpcywgcHJldlByb3BzKVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgc3R5bGVcbiAgICAgICAgaWYgKHRoaXMucHJvcHMucG9zKSB7XG4gICAgICAgICAgICBzdHlsZSA9IHtcbiAgICAgICAgICAgICAgICBtYXJnaW5Ub3A6IDAsXG4gICAgICAgICAgICAgICAgbWFyZ2luTGVmdDogMCxcbiAgICAgICAgICAgICAgICB0b3A6IHRoaXMucHJvcHMucG9zLnRvcCArICdweCcsXG4gICAgICAgICAgICAgICAgbGVmdDogdGhpcy5wcm9wcy5wb3MubGVmdCArICdweCdcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBjeCh7XG4gICAgICAgICAgICBcIndhbGt0aHJvdWdoXCI6IHRydWUsXG4gICAgICAgICAgICBcIndhbGt0aHJvdWdoLS13aGl0ZVwiOiB0aGlzLnByb3BzLnN0eWxlID09PSAnd2hpdGUnLFxuICAgICAgICAgICAgXCJ3YWxrdGhyb3VnaC0tYmxhY2tcIjogdGhpcy5wcm9wcy5zdHlsZSA9PT0gJ2JsYWNrJ1xuICAgICAgICB9KX0sIFxuICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBjeCh7XG4gICAgICAgICAgICAgICAgXCJ3YWxrdGhyb3VnaF9zdGVwXCI6IHRydWUsXG4gICAgICAgICAgICAgICAgXCJ3YWxrdGhyb3VnaF9zdGVwLS1mYWRlLW91dFwiOiB0aGlzLnByb3BzLmZhZGVPdXRcbiAgICAgICAgICAgIH0pICsgXCIgd2Fsa3Rocm91Z2hfc3RlcC0tXCIgKyB0aGlzLnByb3BzLmlkLCBzdHlsZTogc3R5bGV9LCBcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLnNob3dCYWNvbiAmJiBSZWFjdC5ET00uaW1nKHtjbGFzc05hbWU6IFwid2Fsa3Rocm91Z2hfc2lyLWZyYW5jaXNcIiwgc3JjOiBcImltYWdlcy9zaXItZnJhbmNpcy10cmFuc3BhcmVudDIuZ2lmXCJ9KSwgXG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy50aXRsZSAmJlxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwid2Fsa3Rocm91Z2hfdGl0bGVcIn0sIHRoaXMucHJvcHMudGl0bGUpLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwid2Fsa3Rocm91Z2hfYm9keVwifSwgXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMuYm9keVxuICAgICAgICAgICAgICAgICksIFxuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMuYXJyb3cgfHwgZmFsc2UsIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJ3YWxrdGhyb3VnaF9idXR0b25zXCJ9LCBcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5uZXh0ICYmXG4gICAgICAgICAgICAgICAgICAgICAgICBSZWFjdC5ET00uYnV0dG9uKHtvbkNsaWNrOiB0aGlzLnByb3BzLm9uTmV4dCwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiBcIndhbGt0aHJvdWdoX25leHQgYnRuIGJ0bi1kZWZhdWx0XCJ9LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm5leHRcbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApXG4gICAgICAgIClcbiAgICB9XG59KVxuXG5tb2R1bGUuZXhwb3J0cyA9IFN0ZXBcbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xuXG52YXIgV2Fsa1Rocm91Z2ggPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdXYWxrVGhyb3VnaCcsXG4gICAgcHJvcFR5cGVzOiB7XG4gICAgICAgIHN0ZXBzOiBSZWFjdC5Qcm9wVHlwZXMuYXJyYXkuaXNSZXF1aXJlZCxcbiAgICAgICAgb25Eb25lOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYyxcbiAgICB9LFxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc3RlcDogMCxcbiAgICAgICAgICAgIGRhdGE6IHt9LFxuICAgICAgICAgICAgZmFkaW5nOiBmYWxzZVxuICAgICAgICB9XG4gICAgfSxcbiAgICBvbkZhZGVkT3V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmZhZGluZyA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIHRoaXMuZ29Ubyh0aGlzLnN0YXRlLmZhZGluZylcbiAgICB9LFxuICAgIGdvVG86IGZ1bmN0aW9uIChudW0pIHtcbiAgICAgICAgaWYgKG51bSA+PSB0aGlzLnByb3BzLnN0ZXBzLmxlbmd0aCkge1xuICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMub25Eb25lKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkRvbmUoKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7c3RlcDogbnVtLCBmYWRpbmc6IGZhbHNlfSlcbiAgICB9LFxuICAgIHN0YXJ0R29pbmc6IGZ1bmN0aW9uIChudW0pIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7ZmFkaW5nOiBudW19KVxuICAgIH0sXG4gICAgc2V0RGF0YTogZnVuY3Rpb24gKGF0dHIsIHZhbCkge1xuICAgICAgICB2YXIgZGF0YSA9IF8uZXh0ZW5kKHt9LCB0aGlzLnN0YXRlLmRhdGEpXG4gICAgICAgIGRhdGFbYXR0cl0gPSB2YWxcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7ZGF0YTogZGF0YX0pXG4gICAgfSxcbiAgICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIFN0ZXAgPSB0aGlzLnByb3BzLnN0ZXBzW3RoaXMuc3RhdGUuc3RlcF1cbiAgICAgICAgdmFyIHByb3BzID0ge1xuICAgICAgICAgICAgb25OZXh0OiB0aGlzLnN0YXJ0R29pbmcuYmluZChudWxsLCB0aGlzLnN0YXRlLnN0ZXAgKyAxKSxcbiAgICAgICAgICAgIHNldERhdGE6IHRoaXMuc2V0RGF0YSxcbiAgICAgICAgICAgIGRhdGE6IHRoaXMuc3RhdGUuZGF0YSxcbiAgICAgICAgICAgIGZhZGVPdXQ6IHRoaXMuc3RhdGUuZmFkaW5nICE9PSBmYWxzZSxcbiAgICAgICAgICAgIG9uRmFkZWRPdXQ6IHRoaXMub25GYWRlZE91dFxuICAgICAgICB9XG4gICAgICAgIGZvciAodmFyIG5hbWUgaW4gdGhpcy5wcm9wcykge1xuICAgICAgICAgICAgcHJvcHNbbmFtZV0gPSB0aGlzLnByb3BzW25hbWVdXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFN0ZXAocHJvcHMpXG4gICAgfVxufSlcblxubW9kdWxlLmV4cG9ydHMgPSBXYWxrVGhyb3VnaFxuXG4iLCJcbnZhciB1dGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gTG9nQm9vaztcblxuZnVuY3Rpb24gTG9nQm9vayh3b3JsZCwgZWxlbSwga2VlcCwgc2VlZGVkQ29sdW1ucywgaGlkZUF2Zykge1xuICAgIHRoaXMuX2F0dGFjaCh3b3JsZCwgZWxlbSwga2VlcCwgc2VlZGVkQ29sdW1ucywgaGlkZUF2Zyk7XG59XG5cbkxvZ0Jvb2sucHJvdG90eXBlLl9hdHRhY2ggPSBmdW5jdGlvbiAod29ybGQsIGVsZW0sIGtlZXAsIHNlZWRlZENvbHVtbnMsIGhpZGVBdmcpIHtcbiAgICBjb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIGNvbnRhaW5lci5jbGFzc05hbWUgPSBcImxvZy1ib29rXCI7XG4gICAgZWxlbS5hcHBlbmRDaGlsZChjb250YWluZXIpO1xuICAgIGhlYWRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpO1xuICAgIGhlYWRlci5jbGFzc05hbWUgPSBcImxvZy1ib29rLWhlYWRlclwiO1xuICAgIGhlYWRlci5pbm5lckhUTUwgPSBcIkxvZyBCb29rXCI7XG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGhlYWRlcik7XG4gICAgYm9keUNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgYm9keUNvbnRhaW5lci5jbGFzc05hbWUgPSBcImxvZy1ib29rLWJvZHlcIjtcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoYm9keUNvbnRhaW5lcik7XG4gICAgdGhpcy5ib2R5Q29udGFpbmVyID0gYm9keUNvbnRhaW5lcjtcbiAgICB0aGlzLmhpZGVBdmcgPSBoaWRlQXZnO1xuXG4gICAgdGhpcy5jb2x1bW5zQnlCb2R5TmFtZSA9IHt9O1xuICAgIHRoaXMubGFzdFVpZHMgPSB7fTtcbiAgICB0aGlzLnN0YXJ0VGltZUJ5Qm9keU5hbWUgPSB7fTtcbiAgICB0aGlzLmRhdGEgPSB7fTtcbiAgICB0aGlzLmtlZXAgPSBrZWVwO1xuICAgIHRoaXMud29ybGQgPSB3b3JsZDtcbiAgICB3b3JsZC5vbignc3RlcCcsIHRoaXMuaGFuZGxlVGljay5iaW5kKHRoaXMpKTtcblxuICAgIGlmIChzZWVkZWRDb2x1bW5zKSB7XG4gICAgICAgIF8uZWFjaChzZWVkZWRDb2x1bW5zLCBmdW5jdGlvbiAoY29sKSB7XG4gICAgICAgICAgICB0aGlzLmFkZENvbHVtbihjb2wubmFtZSwgY29sLmV4dHJhVGV4dCwgY29sLmNvbG9yKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9XG59XG5cbkxvZ0Jvb2sucHJvdG90eXBlLmhhbmRsZVN0YXJ0ID0gZnVuY3Rpb24oY29sTmFtZSwgdWlkKSB7XG4gICAgaWYgKCF0aGlzLnN0YXJ0VGltZUJ5Qm9keU5hbWVbY29sTmFtZV0pIHtcbiAgICAgICAgdGhpcy5uZXdUaW1lcihjb2xOYW1lKTtcbiAgICB9XG4gICAgdGhpcy5sYXN0VWlkc1tjb2xOYW1lXSA9IHVpZDtcbiAgICB0aGlzLnN0YXJ0VGltZUJ5Qm9keU5hbWVbY29sTmFtZV0gPSB0aGlzLndvcmxkLl90aW1lO1xuICAgIHRoaXMucmVuZGVyVGltZXIoY29sTmFtZSwgMCk7XG59XG5cbkxvZ0Jvb2sucHJvdG90eXBlLmhhbmRsZUVuZCA9IGZ1bmN0aW9uKGNvbE5hbWUsIHVpZCkge1xuICAgIGlmIChjb2xOYW1lIGluIHRoaXMuZGF0YSAmJlxuICAgICAgICAgICAgdGhpcy5sYXN0VWlkc1tjb2xOYW1lXSA9PSB1aWQpIHtcbiAgICAgICAgdGhpcy5kYXRhW2NvbE5hbWVdLnB1c2goXG4gICAgICAgICAgICB0aGlzLndvcmxkLl90aW1lIC0gdGhpcy5zdGFydFRpbWVCeUJvZHlOYW1lW2NvbE5hbWVdKTtcbiAgICAgICAgZGVsZXRlIHRoaXMuc3RhcnRUaW1lQnlCb2R5TmFtZVtjb2xOYW1lXTtcbiAgICAgICAgZGVsZXRlIHRoaXMubGFzdFVpZHNbY29sTmFtZV07XG4gICAgICAgIGlmICghdGhpcy5oaWRlQXZnKSB7XG4gICAgICAgICAgICB2YXIgYXZnID0gY2xlYW4odXRpbC5hdmcodGhpcy5kYXRhW2NvbE5hbWVdKSk7XG4gICAgICAgICAgICAkKHRoaXMuY29sdW1uc0J5Qm9keU5hbWVbY29sTmFtZV0pXG4gICAgICAgICAgICAgICAgLmZpbmQoJy5sb2ctYm9vay1hdmcnKS50ZXh0KCdBdmc6ICcgKyBhdmcpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5Mb2dCb29rLnByb3RvdHlwZS5oYW5kbGVUaWNrID0gZnVuY3Rpb24gKCkge1xuICAgIG5ld1RpbWUgPSB0aGlzLndvcmxkLl90aW1lO1xuICAgICQuZWFjaCh0aGlzLnN0YXJ0VGltZUJ5Qm9keU5hbWUsIGZ1bmN0aW9uIChuYW1lLCBzdGFydFRpbWUpIHtcbiAgICAgICAgdGhpcy5yZW5kZXJUaW1lcihuYW1lLCBuZXdUaW1lIC0gc3RhcnRUaW1lKTtcbiAgICB9LmJpbmQodGhpcykpO1xufVxuXG5Mb2dCb29rLnByb3RvdHlwZS5hZGRDb2x1bW4gPSBmdW5jdGlvbiAobmFtZSwgZXh0cmFUZXh0LCBjb2xvcikge1xuICAgIGV4dHJhVGV4dCA9IGV4dHJhVGV4dCB8fCBcIlwiO1xuICAgIHZhciBjb2x1bW4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIGNvbHVtbi5jbGFzc05hbWUgPSBcImxvZy1ib29rLWNvbHVtblwiO1xuICAgIHZhciBoZWFkaW5nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIik7XG4gICAgaGVhZGluZy5jbGFzc05hbWUgPSBcImxvZy1ib29rLWhlYWRpbmdcIjtcbiAgICBoZWFkaW5nLmlubmVySFRNTCA9IG5hbWUgKyBleHRyYVRleHQ7XG4gICAgLyoqIERpc2FibGluZyB1bnRpbCB3ZSBmaW5kIHNvbWV0aGluZyB0aGF0IGxvb2tzIGdyZWF0XG4gICAgaWYgKGNvbG9yKSB7XG4gICAgICAgIGhlYWRpbmcuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gY29sb3I7XG4gICAgfVxuICAgICovXG4gICAgY29sdW1uLmFwcGVuZENoaWxkKGhlYWRpbmcpO1xuICAgIGlmICghdGhpcy5oaWRlQXZnKSB7XG4gICAgICAgIHZhciBhdmVyYWdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgYXZlcmFnZS5jbGFzc05hbWUgPSAnbG9nLWJvb2stYXZnJztcbiAgICAgICAgYXZlcmFnZS5pbm5lckhUTUwgPSAnLS0nO1xuICAgICAgICBjb2x1bW4uYXBwZW5kQ2hpbGQoYXZlcmFnZSk7XG4gICAgfVxuICAgIHRoaXMuaW5zZXJ0Q29sdW1uKG5hbWUsIGNvbHVtbik7IC8vIHdpbGwgaW5zZXJ0IGl0IGF0IHRoZSByaWdodCBwb2ludC5cbiAgICB0aGlzLmNvbHVtbnNCeUJvZHlOYW1lW25hbWVdID0gY29sdW1uO1xuICAgIHRoaXMuZGF0YVtuYW1lXSA9IFtdO1xuICAgIC8vIHNlZWQgdGhlIGNvbHVtbiB3aXRoIGJsYW5rc1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5rZWVwOyBpKyspIHtcbiAgICAgICAgdGhpcy5uZXdUaW1lcihuYW1lKTtcbiAgICB9XG59XG5cbkxvZ0Jvb2sucHJvdG90eXBlLmluc2VydENvbHVtbiA9IGZ1bmN0aW9uIChuYW1lLCBjb2x1bW4pIHtcbiAgICAvLyBpbnNlcnQgdGhlIGNvbHVtbiBpbiBvcmRlci4gIHRoaXMgaXMgYSBiaXQgYXJiaXRyYXJ5IHNpbmNlIHdlIGRvbid0IGtub3dcbiAgICAvLyB3aGF0IHRoZSBzb3J0IG9yZGVyIHNob3VsZCByZWFsbHkgYmUsIHNvIHdlIGp1c3QgcHV0IHN0cmluZ3Mgd2l0aG91dFxuICAgIC8vIG51bWJlcnMsIHRoZW4gc3RyaW5ncyB0aGF0IHN0YXJ0IHdpdGggYSBudW1iZXIuXG4gICAgdmFyIGtleWZuID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgICAgLy8gaWYgdGhlIG5hbWUgc3RhcnRzIHdpdGggYSBudW1iZXIsIHNvcnQgYnkgdGhhdCwgdGhlbiB0aGUgZnVsbCBuYW1lLlxuICAgICAgICAvLyBvdGhlcndpc2UsIHB1dCBpdCBhZnRlciBudW1iZXJzLCBhbmQgc29ydCBieSB0aGUgZnVsbCBuYW1lLlxuICAgICAgICB2YXIgbnVtID0gcGFyc2VJbnQobmFtZSk7XG4gICAgICAgIGlmIChpc05hTihudW0pKSB7XG4gICAgICAgICAgICBudW0gPSBJbmZpbml0eTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gW251bSwgbmFtZV07XG4gICAgfVxuICAgIHZhciBpbnNlcnRlZCA9IGZhbHNlO1xuICAgICQodGhpcy5ib2R5Q29udGFpbmVyKS5maW5kKFwiLmxvZy1ib29rLWhlYWRpbmdcIikuZWFjaChmdW5jdGlvbiAoaSwgc3Bhbikge1xuICAgICAgICB2YXIgazEgPSBrZXlmbihuYW1lKTtcbiAgICAgICAgdmFyIGsyID0ga2V5Zm4oJChzcGFuKS5odG1sKCkpO1xuICAgICAgICBpZiAoazFbMF0gPCBrMlswXSB8fCAoazFbMF0gPT0gazJbMF0gJiYgazFbMV0gPCBrMlsxXSkpIHtcbiAgICAgICAgICAgICQoc3BhbikucGFyZW50KCkuYmVmb3JlKGNvbHVtbik7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhzcGFuKTtcbiAgICAgICAgICAgIGluc2VydGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTsgLy9icmVha1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgaWYgKCFpbnNlcnRlZCkge1xuICAgICAgICAvLyBpZiBpdCdzIHRoZSBiaWdnZXN0LCBwdXQgaXQgYXQgdGhlIGVuZC5cbiAgICAgICAgdGhpcy5ib2R5Q29udGFpbmVyLmFwcGVuZENoaWxkKGNvbHVtbik7XG4gICAgICAgIGNvbnNvbGUubG9nKHRoaXMuYm9keUNvbnRhaW5lcik7XG4gICAgfVxufVxuXG5Mb2dCb29rLnByb3RvdHlwZS5uZXdUaW1lciA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAvLyBqdXN0IGRvZXMgdGhlIERPTSBzZXR1cCwgZG9lc24ndCBhY3R1YWxseSBzdGFydCB0aGUgdGltZXJcbiAgICBpZiAoIXRoaXMuY29sdW1uc0J5Qm9keU5hbWVbbmFtZV0pIHtcbiAgICAgICAgdGhpcy5hZGRDb2x1bW4obmFtZSk7XG4gICAgfVxuICAgIHZhciBjb2wgPSB0aGlzLmNvbHVtbnNCeUJvZHlOYW1lW25hbWVdO1xuICAgIHZhciB0b1JlbW92ZSA9ICQoY29sKS5maW5kKFwiLmxvZy1ib29rLWRhdHVtXCIpLnNsaWNlKDAsLXRoaXMua2VlcCsxKTtcbiAgICB0b1JlbW92ZS5zbGlkZVVwKDUwMCwgZnVuY3Rpb24gKCkge3RvUmVtb3ZlLnJlbW92ZSgpO30pO1xuICAgIHRoaXMuZGF0YVtuYW1lXSA9IHRoaXMuZGF0YVtuYW1lXS5zbGljZSgtdGhpcy5rZWVwKzEpO1xuICAgIHZhciBkYXR1bSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpO1xuICAgIGRhdHVtLmNsYXNzTmFtZSA9IFwibG9nLWJvb2stZGF0dW1cIjtcblxuICAgIGlmICghdGhpcy5oaWRlQXZnKSB7XG4gICAgICAgIHZhciBhdmcgPSBjbGVhbih1dGlsLmF2Zyh0aGlzLmRhdGFbbmFtZV0pKTtcbiAgICAgICAgJChjb2wpLmZpbmQoJy5sb2ctYm9vay1hdmcnKS50ZXh0KCdBdmc6ICcgKyBhdmcpO1xuICAgIH1cblxuICAgIGNvbC5hcHBlbmRDaGlsZChkYXR1bSk7XG4gICAgdGhpcy5yZW5kZXJUaW1lcihuYW1lKTtcbn1cblxuZnVuY3Rpb24gY2xlYW4odGltZSkge1xuICAgIHJldHVybiBwYXJzZUZsb2F0KHRpbWUgLyAxMDAwKS50b0ZpeGVkKDIpICsgJ3MnO1xufVxuXG5Mb2dCb29rLnByb3RvdHlwZS5yZW5kZXJUaW1lciA9IGZ1bmN0aW9uIChuYW1lLCB0aW1lKSB7XG4gICAgdmFyIGRhdHVtID0gdGhpcy5jb2x1bW5zQnlCb2R5TmFtZVtuYW1lXS5sYXN0Q2hpbGQ7XG4gICAgaWYgKHRpbWUpIHtcbiAgICAgICAgZGF0dW0uaW5uZXJIVE1MID0gY2xlYW4odGltZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgZGF0dW0uaW5uZXJIVE1MID0gXCItLVwiO1xuICAgICAgICBkYXR1bS5zdHlsZS50ZXh0QWxpZ24gPSBcImNlbnRlclwiO1xuICAgIH1cbn1cbiIsInZhciBHYXRlID0gcmVxdWlyZSgnLi9nYXRlJyk7XG52YXIgR3JhcGggPSByZXF1aXJlKCcuL2dyYXBoJyk7XG52YXIgQmFzZSA9IHJlcXVpcmUoJy4vYmFzZScpO1xudmFyIFN0b3B3YXRjaCA9IHJlcXVpcmUoJy4vc3RvcHdhdGNoJyk7XG52YXIgUGxheVBhdXNlID0gcmVxdWlyZSgnLi9wbGF5cGF1c2UnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBCYXNlLmV4dGVuZChmdW5jdGlvbiBPcmJpdChjb250YWluZXIsIG9wdGlvbnMpIHtcbiAgICBCYXNlLmNhbGwodGhpcywgY29udGFpbmVyLCBvcHRpb25zLCBcImltYWdlcy9zcGFjZV9iYWNrZ3JvdW5kLmpwZ1wiKVxufSwge1xuICAgIHNldHVwOiBmdW5jdGlvbiAoY29udGFpbmVyKSB7XG4gICAgICAgIHZhciB3b3JsZCA9IHRoaXMud29ybGQ7XG4gICAgICAgIHZhciBkID0gNC4wO1xuICAgICAgICB2YXIgdiA9IDAuMzY7XG4gICAgICAgIHZhciBjaXJjbGUxID0gUGh5c2ljcy5ib2R5KCdjaXJjbGUnLCB7XG4gICAgICAgICAgICB4OiB0aGlzLm9wdGlvbnMud2lkdGggLyAyIC0gZC8yXG4gICAgICAgICAgICAseTogMjAwXG4gICAgICAgICAgICAsdng6IHZcbiAgICAgICAgICAgICxyYWRpdXM6IDJcbiAgICAgICAgICAgICxtYXNzOiAxXG4gICAgICAgICAgICAscmVzdGl0dXRpb246IDBcbiAgICAgICAgICAgICxzdHlsZXM6IHtcbiAgICAgICAgICAgICAgICBmaWxsU3R5bGU6ICcjZWVkZDIyJ1xuICAgICAgICAgICAgICAgICxhbmdsZUluZGljYXRvcjogJyMxNTU0NzknXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICB2YXIgY2lyY2xlMiA9IFBoeXNpY3MuYm9keSgnY2lyY2xlJywge1xuICAgICAgICAgICAgeDogdGhpcy5vcHRpb25zLndpZHRoIC8gMiArIGQvMlxuICAgICAgICAgICAgLHk6IDIwMFxuICAgICAgICAgICAgLHZ4OiB2XG4gICAgICAgICAgICAscmFkaXVzOiAyXG4gICAgICAgICAgICAsbWFzczogMVxuICAgICAgICAgICAgLHJlc3RpdHV0aW9uOiAwXG4gICAgICAgICAgICAsc3R5bGVzOiB7XG4gICAgICAgICAgICAgICAgZmlsbFN0eWxlOiAnI2VlZGQyMidcbiAgICAgICAgICAgICAgICAsYW5nbGVJbmRpY2F0b3I6ICcjMTU1NDc5J1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgYmlnID0gUGh5c2ljcy5ib2R5KCdjaXJjbGUnLCB7XG4gICAgICAgICAgICB4OiB0aGlzLm9wdGlvbnMud2lkdGggLyAyXG4gICAgICAgICAgICAseTogMzAwXG4gICAgICAgICAgICAsdng6IC0yICogdi8yNVxuICAgICAgICAgICAgLHJhZGl1czogMTBcbiAgICAgICAgICAgICxtYXNzOiAyNVxuICAgICAgICAgICAgLHJlc3RpdHV0aW9uOiAwXG4gICAgICAgICAgICAsc3R5bGVzOiB7XG4gICAgICAgICAgICAgICAgZmlsbFN0eWxlOiAnI2VlZGQyMidcbiAgICAgICAgICAgICAgICAsYW5nbGVJbmRpY2F0b3I6ICcjMTU1NDc5J1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdmFyIGNvbnN0cmFpbnRzID0gUGh5c2ljcy5iZWhhdmlvcigndmVybGV0LWNvbnN0cmFpbnRzJyk7XG4gICAgICAgIGNvbnN0cmFpbnRzLmRpc3RhbmNlQ29uc3RyYWludChjaXJjbGUxLCBjaXJjbGUyLCAxKTtcbiAgICAgICAgd29ybGQuYWRkKFtjaXJjbGUxLCBjaXJjbGUyLCBiaWcsIGNvbnN0cmFpbnRzXSk7XG4gICAgICAgIHdvcmxkLmFkZChQaHlzaWNzLmJlaGF2aW9yKCduZXd0b25pYW4nLCB7IHN0cmVuZ3RoOiAuNSB9KSk7XG5cbiAgICAgICAgdmFyIG1vb25Sb3RhdGlvbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBkeCA9IGNpcmNsZTEuc3RhdGUucG9zLnggLSBjaXJjbGUyLnN0YXRlLnBvcy54O1xuICAgICAgICAgICAgdmFyIGR5ID0gY2lyY2xlMi5zdGF0ZS5wb3MueSAtIGNpcmNsZTEuc3RhdGUucG9zLnk7XG4gICAgICAgICAgICByZXR1cm4gTWF0aC5hdGFuMihkeSxkeCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdmFyIG1vb25SZXZvbHV0aW9uID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGR4ID0gKGNpcmNsZTEuc3RhdGUucG9zLnggKyBjaXJjbGUyLnN0YXRlLnBvcy54KS8yIC0gYmlnLnN0YXRlLnBvcy54O1xuICAgICAgICAgICAgdmFyIGR5ID0gYmlnLnN0YXRlLnBvcy55IC0gKGNpcmNsZTIuc3RhdGUucG9zLnkgKyBjaXJjbGUxLnN0YXRlLnBvcy55KS8yO1xuICAgICAgICAgICAgcmV0dXJuIE1hdGguYXRhbjIoZHksZHgpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHZhciBncmFwaCA9IG5ldyBHcmFwaCh0aGlzLmNvbnRhaW5lciwge1xuICAgICAgICAgICAgJ1JvdCc6IHtmbjogbW9vblJvdGF0aW9uLCB0aXRsZTogJ1JvdGF0aW9uJywgbWluc2NhbGU6IDIgKiBNYXRoLlBJfSxcbiAgICAgICAgICAgICdSZXYnOiB7Zm46IG1vb25SZXZvbHV0aW9uLCB0aXRsZTogJ1Jldm9sdXRpb24nLCBtaW5zY2FsZTogMiAqIE1hdGguUEl9LFxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBtYXg6IDIwMDAsXG4gICAgICAgICAgICB0b3A6IDEwLFxuICAgICAgICAgICAgbGVmdDogdGhpcy5vcHRpb25zLndpZHRoLFxuICAgICAgICAgICAgd2lkdGg6IDMwMCxcbiAgICAgICAgICAgIHdvcmxkSGVpZ2h0OiB0aGlzLm9wdGlvbnMuaGVpZ2h0LFxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5ncmFwaCA9IGdyYXBoO1xuXG4gICAgICAgIHRoaXMud29ybGQub24oJ3N0ZXAnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBncmFwaC51cGRhdGUod29ybGQudGltZXN0ZXAoKSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHZhciBidXR0b25Db250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoYnV0dG9uQ29udGFpbmVyKTtcbiAgICAgICAgdmFyIHBsYXlQYXVzZSA9IG5ldyBQbGF5UGF1c2Uod29ybGQsIGJ1dHRvbkNvbnRhaW5lcik7XG4gICAgfVxufSk7XG5cbiAgICAgICAgXG4iLCIvKiogQGpzeCBSZWFjdC5ET00gKi9cblxudmFyIFBUID0gUmVhY3QuUHJvcFR5cGVzXG52YXIgY3ggPSBSZWFjdC5hZGRvbnMuY2xhc3NTZXRcblxudmFyIE5ld0FzdGVyb2lkQnV0dG9uID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnTmV3QXN0ZXJvaWRCdXR0b24nLFxuICAgIHByb3BUeXBlczoge1xuICAgICAgICBvbkNsaWNrOiBQVC5mdW5jLFxuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGNsYXNzTmFtZSA9IGN4KHtcbiAgICAgICAgICAgICdhc3Rlcm9pZC1idXR0b24nOiB0cnVlLFxuICAgICAgICB9KVxuXG4gICAgICAgIHJldHVybiBSZWFjdC5ET00uYnV0dG9uKHtcbiAgICAgICAgICAgIHR5cGU6IFwiYnV0dG9uXCIsIFxuICAgICAgICAgICAgY2xhc3NOYW1lOiBcIm5ldy1hc3Rlcm9pZC1idXR0b25cIiwgXG4gICAgICAgICAgICBvbkNsaWNrOiB0aGlzLnByb3BzLm9uQ2xpY2t9LCBcIk5ldyBBc3Rlcm9pZFwiKVxuICAgIH1cbn0pXG5cbm1vZHVsZS5leHBvcnRzID0gTmV3QXN0ZXJvaWRCdXR0b25cbiIsInZhciBHYXRlID0gcmVxdWlyZSgnLi9nYXRlJyk7XG52YXIgQmFzZSA9IHJlcXVpcmUoJy4vYmFzZScpO1xudmFyIFN0b3B3YXRjaCA9IHJlcXVpcmUoJy4vc3RvcHdhdGNoJyk7XG52YXIgUGxheVBhdXNlID0gcmVxdWlyZSgnLi9wbGF5cGF1c2UnKTtcbnZhciB1dGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XG52YXIgTG9nQm9vayA9IHJlcXVpcmUoJy4vbG9nYm9vaycpXG52YXIgTmV3dG9uMVdhbGt0aHJvdWdoID0gcmVxdWlyZSgnLi9pbnRyby9uZXd0b24xX2ludHJvLmpzeCcpXG52YXIgTmV3QXN0ZXJvaWRCdXR0b24gPSByZXF1aXJlKCcuL25ldy1hc3Rlcm9pZC1idXR0b24uanN4JylcbnZhciBuZXd0b24xRGF0YUNoZWNrZXIgPSByZXF1aXJlKCcuL25ld3RvbjFkYXRhY2hlY2tlcicpXG5cbmZ1bmN0aW9uIHJhbmRvbShtaW4sIG1heCl7XG4gICAgcmV0dXJuIChNYXRoLnJhbmRvbSgpICogKG1heC1taW4pICsgbWluKXwwXG59XG5cbm1vZHVsZS5leHBvcnRzID0gQmFzZS5leHRlbmQoZnVuY3Rpb24gQXN0ZXJvaWRzKGNvbnRhaW5lciwgb3B0aW9ucykge1xuICAgIEJhc2UuY2FsbCh0aGlzLCBjb250YWluZXIsIG9wdGlvbnMsICdpbWFnZXMvc3BhY2VfYmFja2dyb3VuZC5qcGcnLFxuICAgICAgICB0cnVlIC8qIGRpc2FibGVCb3VuZHMgKi8pXG59LCB7XG4gICAgc2V0dXA6IGZ1bmN0aW9uIChjb250YWluZXIpIHtcbiAgICAgICAgdmFyIHdvcmxkID0gdGhpcy53b3JsZDtcbiAgICAgICAgdGhpcy5hY3RpdmVBc3Rlcm9pZCA9IG51bGw7XG4gICAgICAgIHRoaXMuaGFuZGxlTmV3QXN0ZXJvaWQoKTtcbiAgICAgICAgdmFyIHNpZGVCYXIgPSB0aGlzLnNpZGVCYXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICBzaWRlQmFyLmNsYXNzTmFtZSA9IFwic2lkZS1iYXJcIjtcbiAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKHNpZGVCYXIpO1xuXG4gICAgICAgIHZhciBnYXRlMSA9IG5ldyBHYXRlKHdvcmxkLFxuICAgICAgICAgICAgdXRpbC5tYWtlUmVjdCgwLCAwLCAxMCwgNTAwKSxcbiAgICAgICAgICAgIFs0MDAsIDM1MF0sIG51bGwsIHtkZWJ1ZzogdHJ1ZSwgc2hvdzogdHJ1ZSwgY29sb3I6ICdncmVlbid9KTtcbiAgICAgICAgdmFyIGdhdGUyID0gbmV3IEdhdGUod29ybGQsXG4gICAgICAgICAgICB1dGlsLm1ha2VSZWN0KDAsIDAsIDEwLCA1MDApLFxuICAgICAgICAgICAgWzYwMCwgMzUwXSwgbnVsbCwge2RlYnVnOiB0cnVlLCBzaG93OiB0cnVlLCBjb2xvcjogJ2dyZWVuJ30pO1xuICAgICAgICB2YXIgZ2F0ZTMgPSBuZXcgR2F0ZSh3b3JsZCxcbiAgICAgICAgICAgIHV0aWwubWFrZVJlY3QoMCwgMCwgMTAsIDUwMCksXG4gICAgICAgICAgICBbODAwLCAzNTBdLCBudWxsLCB7ZGVidWc6IHRydWUsIHNob3c6IHRydWUsIGNvbG9yOiAnZ3JlZW4nfSk7XG5cbiAgICAgICAgdmFyIGxvZ0NvbHVtbnMgPSBbXG4gICAgICAgICAgICB7bmFtZTogXCJUaW1lIDFcIiwgZXh0cmFUZXh0OiBcIlwifSxcbiAgICAgICAgICAgIHtuYW1lOiBcIlRpbWUgMlwiLCBleHRyYVRleHQ6IFwiXCJ9LFxuICAgICAgICBdO1xuICAgICAgICB2YXIgbG9nQm9vayA9IHRoaXMubG9nQm9vayA9IG5ldyBMb2dCb29rKHdvcmxkLCBzaWRlQmFyLCA1LCBsb2dDb2x1bW5zLFxuICAgICAgICAgICAgdHJ1ZSAvKiBoaWRlQXZnICovKTtcbiAgICAgICAgZ2F0ZTEub24oJ2VudGVyJywgZnVuY3Rpb24oZWxlbSkge1xuICAgICAgICAgICAgdGhpcy5jb25zaWRlckFjdGl2ZUFzdGVyb2lkR0MoKTtcbiAgICAgICAgICAgIHZhciBib2R5ID0gZWxlbS5ib2R5O1xuICAgICAgICAgICAgaWYgKCF0aGlzLmFjdGl2ZUFzdGVyb2lkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hY3RpdmVBc3Rlcm9pZCA9IGJvZHk7XG4gICAgICAgICAgICAgICAgbG9nQm9vay5oYW5kbGVTdGFydChcIlRpbWUgMVwiLCBib2R5LnVpZCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfS5iaW5kKHRoaXMpKVxuICAgICAgICBnYXRlMi5vbignZW50ZXInLCBmdW5jdGlvbihlbGVtKSB7XG4gICAgICAgICAgICB2YXIgYm9keSA9IGVsZW0uYm9keTtcbiAgICAgICAgICAgIGlmICh0aGlzLmFjdGl2ZUFzdGVyb2lkID09IGJvZHkpIHtcbiAgICAgICAgICAgICAgICBsb2dCb29rLmhhbmRsZUVuZChcIlRpbWUgMVwiLCBib2R5LnVpZCk7XG4gICAgICAgICAgICAgICAgbG9nQm9vay5oYW5kbGVTdGFydChcIlRpbWUgMlwiLCBib2R5LnVpZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0uYmluZCh0aGlzKSlcbiAgICAgICAgZ2F0ZTMub24oJ2VudGVyJywgZnVuY3Rpb24oZWxlbSkge1xuICAgICAgICAgICAgdmFyIGJvZHkgPSBlbGVtLmJvZHk7XG4gICAgICAgICAgICBpZiAodGhpcy5hY3RpdmVBc3Rlcm9pZCA9PSBib2R5KSB7XG4gICAgICAgICAgICAgICAgbG9nQm9vay5oYW5kbGVFbmQoXCJUaW1lIDJcIiwgZWxlbS5ib2R5LnVpZCk7XG4gICAgICAgICAgICAgICAgdGhpcy5hY3RpdmVBc3Rlcm9pZCA9IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0uYmluZCh0aGlzKSlcblxuICAgICAgICB2YXIgcGxheVBhdXNlQ29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKHBsYXlQYXVzZUNvbnRhaW5lcik7XG4gICAgICAgIHZhciBwbGF5UGF1c2UgPSBuZXcgUGxheVBhdXNlKHdvcmxkLCBwbGF5UGF1c2VDb250YWluZXIpO1xuICAgICAgICB0aGlzLmNyZWF0ZU5ld0FzdGVyb2lkQnV0dG9uKGNvbnRhaW5lcilcblxuICAgICAgICBjb25zb2xlLmxvZygnb3B0aW9uczogJyArIHRoaXMub3B0aW9ucylcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy53YWxrKSB7XG4gICAgICAgICAgICBOZXd0b24xV2Fsa3Rocm91Z2godGhpcywgZnVuY3Rpb24gKGh5cG90aGVzaXMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldHVwRGF0YUNoZWNrZXIoaHlwb3RoZXNpcyk7XG4gICAgICAgICAgICB9LmJpbmQodGhpcykpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnNldHVwRGF0YUNoZWNrZXIoJ3NhbWUnKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBzZXR1cERhdGFDaGVja2VyOiBmdW5jdGlvbihoeXBvdGhlc2lzKSB7XG4gICAgICAgIHZhciBkYXRhQ2hlY2tlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgIGRhdGFDaGVja2VyLmNsYXNzTmFtZSA9IFwibmV3dG9uMS1kYXRhLWNoZWNrZXJcIjtcbiAgICAgICAgdGhpcy5zaWRlQmFyLmFwcGVuZENoaWxkKGRhdGFDaGVja2VyKTtcbiAgICAgICAgbmV3dG9uMURhdGFDaGVja2VyKGRhdGFDaGVja2VyLCB0aGlzLmxvZ0Jvb2ssIGh5cG90aGVzaXMpO1xuICAgIH0sXG5cbiAgICBjcmVhdGVOZXdBc3Rlcm9pZEJ1dHRvbjogZnVuY3Rpb24oY29udGFpbmVyKSB7XG4gICAgICAgIHZhciBlbGVtZW50ID0gJCgnPGRpdi8+JylcbiAgICAgICAgJChjb250YWluZXIpLmFwcGVuZChlbGVtZW50KVxuICAgICAgICBSZWFjdC5yZW5kZXJDb21wb25lbnQoTmV3QXN0ZXJvaWRCdXR0b24oe1xuICAgICAgICAgICAgb25DbGljazogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5oYW5kbGVOZXdBc3Rlcm9pZCgpO1xuICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICB9LmJpbmQodGhpcylcbiAgICAgICAgfSksIGVsZW1lbnRbMF0pXG5cbiAgICAgICAgLy8gdmFyIG5ld0FzdGVyb2lkTGluayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJhXCIpO1xuICAgICAgICAvLyBuZXdBc3Rlcm9pZExpbmsuaHJlZiA9IFwiI1wiO1xuICAgICAgICAvLyBuZXdBc3Rlcm9pZExpbmsuaW5uZXJIVE1MID0gXCJOZXcgYXN0ZXJvaWRcIjtcbiAgICAgICAgLy8gbmV3QXN0ZXJvaWRMaW5rLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgIC8vIHRoaXMuaGFuZGxlTmV3QXN0ZXJvaWQoKTtcbiAgICAgICAgICAgIC8vIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIC8vIH0uYmluZCh0aGlzKSk7XG4gICAgICAgIC8vIHJldHVybiBuZXdBc3Rlcm9pZExpbms7XG4gICAgfSxcblxuICAgIGNvbnNpZGVyQWN0aXZlQXN0ZXJvaWRHQzogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLmFjdGl2ZUFzdGVyb2lkKSB7XG4gICAgICAgICAgICB2YXIgeCA9IHRoaXMuYWN0aXZlQXN0ZXJvaWQuc3RhdGUucG9zLng7XG4gICAgICAgICAgICB2YXIgeSA9IHRoaXMuYWN0aXZlQXN0ZXJvaWQuc3RhdGUucG9zLnk7XG4gICAgICAgICAgICBpZiAoeCA8IDEwMCB8fCB4ID4gMTAwMCB8fCB5IDwgMTAwIHx8IHkgPiA4MDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFjdGl2ZUFzdGVyb2lkID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBoYW5kbGVOZXdBc3Rlcm9pZDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB3b3JsZCA9IHRoaXMud29ybGQ7XG5cbiAgICAgICAgdmFyIG1pblggPSA1MDtcbiAgICAgICAgdmFyIG1heFggPSAzMDA7XG4gICAgICAgIHZhciBtaW5ZID0gNTA7XG4gICAgICAgIHZhciBtYXhZID0gNjUwO1xuICAgICAgICB2YXIgbWluQW5nbGUgPSAwO1xuICAgICAgICB2YXIgbWF4QW5nbGUgPSAyKk1hdGguUEk7XG5cbiAgICAgICAgdmFyIGJvZHkgPSBQaHlzaWNzLmJvZHkoJ2NpcmNsZScsIHtcbiAgICAgICAgICAgIHg6IHJhbmRvbShtaW5YLCBtYXhYKSxcbiAgICAgICAgICAgIHk6IHJhbmRvbShtaW5ZLCBtYXhZKSxcbiAgICAgICAgICAgIHJhZGl1czogNTAsXG4gICAgICAgICAgICBhbmdsZTogcmFuZG9tKG1pbkFuZ2xlLCBtYXhBbmdsZSksXG4gICAgICAgICAgICBtYXNzOiAxMDAwLFxuICAgICAgICAgICAgcmVzdGl0dXRpb246IDAsXG4gICAgICAgICAgICBzdHlsZXM6IHtcbiAgICAgICAgICAgICAgICBpbWFnZTogJ2ltYWdlcy9hc3Rlcm9pZC5wbmcnLFxuICAgICAgICAgICAgICAgIGZpbGxTdHlsZTogJyNmZmNjMDAnXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoIXRoaXMuZmlyc3RBc3Rlcm9pZCkge1xuICAgICAgICAgICAgdGhpcy5maXJzdEFzdGVyb2lkID0gYm9keTtcbiAgICAgICAgfVxuICAgICAgICB3b3JsZC5hZGQoYm9keSk7XG4gICAgfSxcblxuICAgIGRlbW9uc3RyYXRlU2FtcGxlOiBmdW5jdGlvbihvbkRvbmUpIHtcbiAgICAgICAgdmFyIGFzdGVyb2lkID0gdGhpcy5maXJzdEFzdGVyb2lkO1xuICAgICAgICB2YXIgdGFyZ2V0WCA9IDIwMDtcbiAgICAgICAgdmFyIHRhcmdldFkgPSAzNTA7XG5cbiAgICAgICAgYXN0ZXJvaWQudHJlYXRtZW50ID0gJ2tpbmVtYXRpYyc7XG4gICAgICAgIGFzdGVyb2lkLnN0YXRlLnZlbC54ID0gKHRhcmdldFggLSBhc3Rlcm9pZC5zdGF0ZS5wb3MueCkgLyAxNTAwO1xuICAgICAgICBhc3Rlcm9pZC5zdGF0ZS52ZWwueSA9ICh0YXJnZXRZIC0gYXN0ZXJvaWQuc3RhdGUucG9zLnkpIC8gMTUwMDtcbiAgICAgICAgYXN0ZXJvaWQucmVjYWxjKCk7XG5cbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGFzdGVyb2lkLnRyZWF0bWVudCA9ICdkeW5hbWljJztcbiAgICAgICAgICAgIGFzdGVyb2lkLnN0YXRlLnBvcy54ID0gdGFyZ2V0WDtcbiAgICAgICAgICAgIGFzdGVyb2lkLnN0YXRlLnBvcy55ID0gdGFyZ2V0WTtcbiAgICAgICAgICAgIGFzdGVyb2lkLnN0YXRlLnZlbC54ID0gMC4yO1xuICAgICAgICAgICAgYXN0ZXJvaWQuc3RhdGUudmVsLnkgPSAwO1xuICAgICAgICAgICAgYXN0ZXJvaWQucmVjYWxjKCk7XG5cbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgYXN0ZXJvaWQudHJlYXRtZW50ID0gJ2R5bmFtaWMnO1xuICAgICAgICAgICAgICAgIGFzdGVyb2lkLnJlY2FsYygpO1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIG9uRG9uZSgpO1xuICAgICAgICAgICAgICAgIH0sIDMwMDApXG4gICAgICAgICAgICB9LCAxNTAwKVxuICAgICAgICB9LCAxNTAwKVxuICAgIH1cbn0pO1xuIiwidmFyIERhdGFDaGVja2VyID0gcmVxdWlyZSgnLi9kYXRhY2hlY2tlci5qc3gnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBkcm9wRGF0YUNoZWNrZXI7XG5cbnZhciBfaW5pdGlhbFRleHQgPSBcIkRvIGFuIGV4cGVyaW1lbnQgdG8gZGV0ZXJtaW5lIGhvdyBhc3Rlcm9pZHMgYmVoYXZlLCBhbmQgbGV0IG1lIGtub3cgd2hlbiB5b3UncmUgZG9uZS5cIjtcblxudmFyIF9uZXh0VVJMID0gXCI/SGlsbHMmd2Fsaz10cnVlXCJcblxudmFyIF9oeXBvdGhlc2VzID0gW1xuICAgIHtcbiAgICAgICAgbmFtZTogXCJmYXN0ZXJcIixcbiAgICAgICAgYnV0dG9uVGV4dDogXCJUaGUgYXN0ZXJvaWRzIGdldCBmYXN0ZXIuXCIsXG4gICAgICAgIHRleHQ6IFwidGhhdCB0aGUgYXN0ZXJvaWRzIHdpbGwgZ2V0IGZhc3RlclwiLFxuICAgIH0sXG4gICAge1xuICAgICAgICBuYW1lOiBcInNsb3dlclwiLFxuICAgICAgICBidXR0b25UZXh0OiBcIlRoZSBhc3Rlcm9pZHMgZ2V0IHNsb3dlci5cIixcbiAgICAgICAgdGV4dDogXCJ0aGF0IHRoZSBhc3Rlcm9pZHMgd2lsbCBnZXQgc2xvd2VyXCIsXG4gICAgfSxcbiAgICB7XG4gICAgICAgIG5hbWU6IFwic2FtZVwiLFxuICAgICAgICBidXR0b25UZXh0OiBcIlRoZSBhc3Rlcm9pZHMgc3RheSB0aGUgc2FtZSBzcGVlZC5cIixcbiAgICAgICAgdGV4dDogXCJ0aGF0IHRoZSBhc3Rlcm9pZHMgd2lsbCBzdGF5IHRoZSBzYW1lIHNwZWVkXCIsXG4gICAgfSxcbl07XG5cbmZ1bmN0aW9uIGRyb3BEYXRhQ2hlY2tlcihjb250YWluZXIsIGxvZ0Jvb2ssIGh5cG90aGVzaXMpIHtcbiAgICByZXR1cm4gUmVhY3QucmVuZGVyQ29tcG9uZW50KERhdGFDaGVja2VyKHtcbiAgICAgICAgaW5pdGlhbFRleHQ6IF9pbml0aWFsVGV4dCxcbiAgICAgICAgaW5pdGlhbEh5cG90aGVzaXM6IGh5cG90aGVzaXMsXG4gICAgICAgIHBvc3NpYmxlSHlwb3RoZXNlczogX2h5cG90aGVzZXMsXG4gICAgICAgIHJlc3VsdDogZnVuY3Rpb24gKHN0YXRlKSB7cmV0dXJuIF9yZXN1bHQobG9nQm9vaywgc3RhdGUpO30sXG4gICAgICAgIG5leHRVUkw6IF9uZXh0VVJMLFxuICAgIH0pLCBjb250YWluZXIpO1xufVxuXG5mdW5jdGlvbiBfcmVzdWx0KGxvZ0Jvb2ssIHN0YXRlKSB7XG4gICAgLy8gd2UgcmV0dXJuIHRoZSBlcnJvciwgb3IgbnVsbCBpZiB0aGV5J3JlIGNvcnJlY3RcbiAgICB2YXIgZW5vdWdoRGF0YSA9IF8uYWxsKGxvZ0Jvb2suZGF0YSwgZnVuY3Rpb24gKGQpIHtyZXR1cm4gZC5sZW5ndGggPj0gNTt9KTtcbiAgICB2YXIgZGF0YUlzR29vZCA9IHRydWU7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCA1OyBpKyspIHtcbiAgICAgICAgdmFyIHZhbDEgPSBsb2dCb29rLmRhdGFbXCJUaW1lIDFcIl1baV07XG4gICAgICAgIHZhciB2YWwyID0gbG9nQm9vay5kYXRhW1wiVGltZSAyXCJdW2ldO1xuICAgICAgICB2YXIgbWluVmFsID0gTWF0aC5taW4odmFsMSwgdmFsMik7XG4gICAgICAgIHZhciBtYXhWYWwgPSBNYXRoLm1heCh2YWwxLCB2YWwyKTtcbiAgICAgICAgaWYgKG1heFZhbCAvIG1pblZhbCA+IDEuMikge1xuICAgICAgICAgICAgZGF0YUlzR29vZCA9IGZhbHNlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoZW5vdWdoRGF0YSkge1xuICAgICAgICB2YXIgYXZncyA9IHt9XG4gICAgICAgIHZhciBtYXhEZWx0YXMgPSB7fVxuICAgICAgICBmb3IgKHZhciBuYW1lIGluIGxvZ0Jvb2suZGF0YSkge1xuICAgICAgICAgICAgYXZnc1tuYW1lXSA9IF8ucmVkdWNlKGxvZ0Jvb2suZGF0YVtuYW1lXSxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiAoYSwgYikge3JldHVybiBhICsgYjt9KSAvIGxvZ0Jvb2suZGF0YVtuYW1lXS5sZW5ndGg7XG4gICAgICAgICAgICBtYXhEZWx0YXNbbmFtZV0gPSBfLm1heChfLm1hcChsb2dCb29rLmRhdGFbbmFtZV0sXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gKGRhdHVtKSB7cmV0dXJuIE1hdGguYWJzKGRhdHVtIC0gYXZnc1tuYW1lXSk7fSkpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNvbnNvbGUubG9nKGxvZ0Jvb2suZGF0YSwgZW5vdWdoRGF0YSwgYXZncywgbWF4RGVsdGFzKTtcbiAgICBpZiAoIWVub3VnaERhdGEpIHtcbiAgICAgICAgcmV0dXJuIFwiWW91IGhhdmVuJ3QgZmlsbGVkIHVwIHlvdXIgbGFiIG5vdGVib29rISAgTWFrZSBzdXJlIHlvdSBnZXQgZW5vdWdoIGRhdGEgc28geW91IGtub3cgeW91ciByZXN1bHRzIGFyZSBhY2N1cmF0ZS5cIjtcbiAgICB9IGVsc2UgaWYgKHN0YXRlLmh5cG90aGVzaXMgIT0gXCJzYW1lXCIgfHwgIWRhdGFJc0dvb2QpIHtcbiAgICAgICAgcmV0dXJuIFwiVGhvc2UgcmVzdWx0cyBkb24ndCBsb29rIHJpZ2h0IHRvIG1lLiBNYWtlIHN1cmUgeW91J3JlIGxldHRpbmcgXCIgK1xuICAgICAgICAgICAgXCJ0aGUgYXN0ZXJvaWRzIGdsaWRlIHRocm91Z2ggYWxsIHRocmVlIGdhdGVzIHdpdGhvdXQgaW50ZXJmZXJpbmcgd2l0aCB0aGVtLlwiXG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxufVxuIiwidmFyIEdhdGUgPSByZXF1aXJlKCcuL2dhdGUnKTtcbnZhciBCYXNlID0gcmVxdWlyZSgnLi9iYXNlJyk7XG52YXIgU3RvcHdhdGNoID0gcmVxdWlyZSgnLi9zdG9wd2F0Y2gnKTtcbnZhciBQbGF5UGF1c2UgPSByZXF1aXJlKCcuL3BsYXlwYXVzZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2UuZXh0ZW5kKGZ1bmN0aW9uIE9yYml0KGNvbnRhaW5lciwgb3B0aW9ucykge1xuICAgIEJhc2UuY2FsbCh0aGlzLCBjb250YWluZXIsIG9wdGlvbnMsIFwiaW1hZ2VzL3NwYWNlX2JhY2tncm91bmQuanBnXCIpXG59LCB7XG4gICAgc2V0dXA6IGZ1bmN0aW9uIChjb250YWluZXIpIHtcbiAgICAgICAgdmFyIHdvcmxkID0gdGhpcy53b3JsZDtcbiAgICAgICAgdmFyIHJlZEJhbGwgPSBQaHlzaWNzLmJvZHkoJ2NpcmNsZScsIHtcbiAgICAgICAgICAgIHg6IHRoaXMub3B0aW9ucy53aWR0aCAvIDJcbiAgICAgICAgICAgICx5OiA0MFxuICAgICAgICAgICAgLHZ4OiAwXG4gICAgICAgICAgICAsdnk6IC0xLzhcbiAgICAgICAgICAgICxyYWRpdXM6IDRcbiAgICAgICAgICAgICxtYXNzOiA0XG4gICAgICAgICAgICAscmVzdGl0dXRpb246IDBcbiAgICAgICAgICAgICxzdHlsZXM6IHtcbiAgICAgICAgICAgICAgICBmaWxsU3R5bGU6ICcjZDY4YjYyJyAvL3JlZFxuICAgICAgICAgICAgICAgICxhbmdsZUluZGljYXRvcjogJyMxNTU0NzknXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICB2YXIgZ3JlZW5CYWxsID0gUGh5c2ljcy5ib2R5KCdjaXJjbGUnLCB7XG4gICAgICAgICAgICB4OiB0aGlzLm9wdGlvbnMud2lkdGggLyAyXG4gICAgICAgICAgICAseTogNjBcbiAgICAgICAgICAgICx2eDogMy84XG4gICAgICAgICAgICAsdnk6IDEvOFxuICAgICAgICAgICAgLHJhZGl1czogNFxuICAgICAgICAgICAgLG1hc3M6IDRcbiAgICAgICAgICAgICxyZXN0aXR1dGlvbjogMFxuICAgICAgICAgICAgLHN0eWxlczoge1xuICAgICAgICAgICAgICAgIGZpbGxTdHlsZTogJyMyNmViNjInIC8vZ3JlZW5cbiAgICAgICAgICAgICAgICAsYW5nbGVJbmRpY2F0b3I6ICcjMTU1NDc5J1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdmFyIGJpZ0JhbGwgPSBQaHlzaWNzLmJvZHkoJ2NpcmNsZScsIHtcbiAgICAgICAgICAgIHg6IHRoaXMub3B0aW9ucy53aWR0aCAvIDJcbiAgICAgICAgICAgICx5OiAzMDBcbiAgICAgICAgICAgICx2eDogLTMvNTBcbiAgICAgICAgICAgICxyYWRpdXM6IDEwXG4gICAgICAgICAgICAsbWFzczogMjVcbiAgICAgICAgICAgICxyZXN0aXR1dGlvbjogMFxuICAgICAgICAgICAgLHN0eWxlczoge1xuICAgICAgICAgICAgICAgIGZpbGxTdHlsZTogJyMyNjhiZDInXG4gICAgICAgICAgICAgICAgLGFuZ2xlSW5kaWNhdG9yOiAnIzE1NTQ3OSdcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHdvcmxkLmFkZChbcmVkQmFsbCwgZ3JlZW5CYWxsLCBiaWdCYWxsXSk7XG4gICAgICAgIHdvcmxkLmFkZChQaHlzaWNzLmJlaGF2aW9yKCduZXd0b25pYW4nLCB7IHN0cmVuZ3RoOiAuNSB9KSk7XG5cbiAgICAgICAgdmFyIGJ1dHRvbkNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChidXR0b25Db250YWluZXIpO1xuICAgICAgICB2YXIgcGxheVBhdXNlID0gbmV3IFBsYXlQYXVzZSh3b3JsZCwgYnV0dG9uQ29udGFpbmVyKTtcbiAgICAgICAgLy8gdmFyIGdhdGVQb2x5Z29uID0gW3t4OiAtNzAwLCB5OiAtMTAwfSwge3g6IDcwMCwgeTogLTEwMH0sIHt4OiA3MDAsIHk6IDEzOX0sIHt4OiAtNzAwLCB5OiAxMzl9XTtcbiAgICAgICAgLy8gdmFyIGdhdGVQb2x5Z29uMiA9IFt7eDogLTcwMCwgeTogLTI2MX0sIHt4OiA3MDAsIHk6IC0yNjF9LCB7eDogNzAwLCB5OiAyMDB9LCB7eDogLTcwMCwgeTogMjAwfV07XG4gICAgICAgIC8vIHZhciBnYXRlcyA9IFtdXG4gICAgICAgIC8vIGdhdGVzLnB1c2gobmV3IEdhdGUod29ybGQsIGJ1dHRvbkNvbnRhaW5lciwgZ2F0ZVBvbHlnb24sIFs3MDAsIDEwMF0sIHJlZEJhbGwsIHtkZWJ1ZzogdHJ1ZSwgc2hvdzogdHJ1ZX0pKTtcbiAgICAgICAgLy8gZ2F0ZXMucHVzaChuZXcgR2F0ZSh3b3JsZCwgYnV0dG9uQ29udGFpbmVyLCBnYXRlUG9seWdvbiwgWzcwMCwgMTAwXSwgZ3JlZW5CYWxsLCB7ZGVidWc6IHRydWUsIHNob3c6IHRydWV9KSk7XG4gICAgICAgIC8vIGdhdGVzLnB1c2gobmV3IEdhdGUod29ybGQsIGJ1dHRvbkNvbnRhaW5lciwgZ2F0ZVBvbHlnb24sIFs3MDAsIDEwMF0sIGJpZ0JhbGwsIHtkZWJ1ZzogdHJ1ZSwgc2hvdzogdHJ1ZX0pKTtcbiAgICAgICAgLy8gZ2F0ZXMucHVzaChuZXcgR2F0ZSh3b3JsZCwgYnV0dG9uQ29udGFpbmVyLCBnYXRlUG9seWdvbjIsIFs3MDAsIDUwMF0sIHJlZEJhbGwsIHtkZWJ1ZzogdHJ1ZSwgc2hvdzogdHJ1ZX0pKTtcbiAgICAgICAgLy8gZ2F0ZXMucHVzaChuZXcgR2F0ZSh3b3JsZCwgYnV0dG9uQ29udGFpbmVyLCBnYXRlUG9seWdvbjIsIFs3MDAsIDUwMF0sIGdyZWVuQmFsbCwge2RlYnVnOiB0cnVlLCBzaG93OiB0cnVlfSkpO1xuICAgICAgICAvLyBnYXRlcy5wdXNoKG5ldyBHYXRlKHdvcmxkLCBidXR0b25Db250YWluZXIsIGdhdGVQb2x5Z29uMiwgWzcwMCwgNTAwXSwgYmlnQmFsbCwge2RlYnVnOiB0cnVlLCBzaG93OiB0cnVlfSkpO1xuICAgICAgICAvLyBnYXRlcy5mb3JFYWNoKGZ1bmN0aW9uKGdhdGUpIHtcbiAgICAgICAgICAgIC8vIHZhciBzdG9wd2F0Y2ggPSBuZXcgU3RvcHdhdGNoKHdvcmxkLCBidXR0b25Db250YWluZXIsIDEpO1xuICAgICAgICAgICAgLy8gZ2F0ZS5vbignZW50ZXInLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICAgICAgLy8gc3RvcHdhdGNoLnJlc2V0KCk7XG4gICAgICAgICAgICAgICAgLy8gc3RvcHdhdGNoLnN0YXJ0KCk7XG4gICAgICAgICAgICAvLyB9KTtcbiAgICAgICAgICAgIC8vIGdhdGUub24oJ2V4aXQnLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICAgICAgLy8gc3RvcHdhdGNoLnN0b3AoKVxuICAgICAgICAgICAgLy8gfSk7XG4gICAgICAgIC8vIH0pO1xuICAgIH1cbn0pO1xuXG4gICAgICAgIFxuIiwibW9kdWxlLmV4cG9ydHMgPSBQbGF5UGF1c2U7XG5cbmZ1bmN0aW9uIFBsYXlQYXVzZSh3b3JsZCwgY29udGFpbmVyKSB7XG4gICAgdGhpcy5fYXR0YWNoKHdvcmxkLCBjb250YWluZXIpO1xufVxuXG5QbGF5UGF1c2UucHJvdG90eXBlLmNyZWF0ZUJ1dHRvbiA9IGZ1bmN0aW9uKGFjdGlvbiwgaGFuZGxlcikge1xuICAgIHZhciBhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImFcIik7XG4gICAgYS5ocmVmID0gXCIjXCIgKyBhY3Rpb247XG4gICAgYS5pbm5lckhUTUwgPSBhY3Rpb247XG4gICAgYS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIGhhbmRsZXIoKTtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICB9LmJpbmQodGhpcykpO1xuICAgIHJldHVybiBhO1xufVxuXG5QbGF5UGF1c2UucHJvdG90eXBlLl9hdHRhY2ggPSBmdW5jdGlvbih3b3JsZCwgY29udGFpbmVyKSB7XG4gICAgdGhpcy5wYXVzZVN5bWJvbCA9IFwi4paQ4paQXCI7XG4gICAgdGhpcy5wbGF5U3ltYm9sID0gXCLilrpcIjtcbiAgICB0aGlzLmJ1dHRvbiA9IHRoaXMuY3JlYXRlQnV0dG9uKHRoaXMucGF1c2VTeW1ib2wsIHRoaXMudG9nZ2xlLmJpbmQodGhpcykpO1xuICAgIHRoaXMud29ybGQgPSB3b3JsZDtcbiAgICB2YXIgd2lkZ2V0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICB3aWRnZXQuY2xhc3NOYW1lID0gXCJwbGF5cGF1c2VcIjtcbiAgICB3aWRnZXQuYXBwZW5kQ2hpbGQodGhpcy5idXR0b24pO1xuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZCh3aWRnZXQpO1xufVxuXG5QbGF5UGF1c2UucHJvdG90eXBlLnRvZ2dsZSA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLndvcmxkLmlzUGF1c2VkKCkpIHtcbiAgICAgICAgdGhpcy5idXR0b24uaW5uZXJIVE1MID0gdGhpcy5wYXVzZVN5bWJvbDtcbiAgICAgICAgdGhpcy5idXR0b24uaHJlZiA9ICcjJyArIHRoaXMucGF1c2VTeW1ib2w7XG4gICAgICAgIHRoaXMud29ybGQudW5wYXVzZSgpXG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5idXR0b24uaW5uZXJIVE1MID0gdGhpcy5wbGF5U3ltYm9sO1xuICAgICAgICB0aGlzLmJ1dHRvbi5ocmVmID0gJyMnICsgdGhpcy5wbGF5U3ltYm9sO1xuICAgICAgICB0aGlzLndvcmxkLnBhdXNlKClcbiAgICB9XG59XG5cblxuIiwidmFyIEJhc2UgPSByZXF1aXJlKCcuL2Jhc2UnKTtcbnZhciBHYXRlID0gcmVxdWlyZSgnLi9nYXRlJyk7XG52YXIgU3RvcHdhdGNoID0gcmVxdWlyZSgnLi9zdG9wd2F0Y2gnKTtcbnZhciBQbGF5UGF1c2UgPSByZXF1aXJlKCcuL3BsYXlwYXVzZScpO1xudmFyIHV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBCYXNlLmV4dGVuZChmdW5jdGlvbiBTbG9wZShjb250YWluZXIsIG9wdGlvbnMpIHtcbiAgICBCYXNlLmNhbGwodGhpcywgY29udGFpbmVyLCBvcHRpb25zLCAnaW1hZ2VzL2xhYl9iYWNrZ3JvdW5kLmpwZycpXG59LCB7XG4gICAgZHJvcEluQm9keTogZnVuY3Rpb24gKHJhZGl1cywgeSkge1xuICAgICAgICBmdW5jdGlvbiByYW5kb20obWluLCBtYXgpe1xuICAgICAgICAgICAgcmV0dXJuIChNYXRoLnJhbmRvbSgpICogKG1heC1taW4pICsgbWluKXwwXG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLndvcmxkLmFkZChQaHlzaWNzLmJvZHkoJ2NpcmNsZScsIHtcbiAgICAgICAgICAgIHg6IDEwMCxcbiAgICAgICAgICAgIHk6IHksXG4gICAgICAgICAgICB2eDogcmFuZG9tKC01LCA1KS8xMDAsXG4gICAgICAgICAgICByYWRpdXM6IHJhZGl1cyxcbiAgICAgICAgICAgIHJlc3RpdHV0aW9uOiAwLjksXG4gICAgICAgICAgICBzdHlsZXM6IHtcbiAgICAgICAgICAgICAgICBmaWxsU3R5bGU6ICcjMjY4YmQyJyxcbiAgICAgICAgICAgICAgICBhbmdsZUluZGljYXRvcjogJyMxNTU0NzknXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pKTtcbiAgICB9LFxuICAgIHNldHVwOiBmdW5jdGlvbiAoY29udGFpbmVyKSB7XG4gICAgICAgIHZhciB3b3JsZCA9IHRoaXMud29ybGRcbiAgICAgICAgd29ybGQuYWRkKFBoeXNpY3MuYmVoYXZpb3IoJ2NvbnN0YW50LWFjY2VsZXJhdGlvbicpKTtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDU7IGkrKykge1xuICAgICAgICAgICAgdmFyIHJhZGl1cyA9IDIwICsgMTAgKiBpO1xuICAgICAgICAgICAgdGhpcy5kcm9wSW5Cb2R5KHJhZGl1cywgMzAwIC0gaSAqIDUwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMud29ybGQuYWRkKFBoeXNpY3MuYm9keSgnY29udmV4LXBvbHlnb24nLCB7XG4gICAgICAgICAgICB4OiA0NTAsXG4gICAgICAgICAgICB5OiA2MDAsXG4gICAgICAgICAgICB2ZXJ0aWNlczogW1xuICAgICAgICAgICAgICAgIHt4OiAwLCB5OiAwfSxcbiAgICAgICAgICAgICAgICB7eDogMCwgeTogMzAwfSxcbiAgICAgICAgICAgICAgICB7eDogODAwLCB5OiAzMDB9LFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIHRyZWF0bWVudDogJ3N0YXRpYycsXG4gICAgICAgICAgICBjb2Y6IDEsXG4gICAgICAgICAgICBzdHlsZXM6IHtcbiAgICAgICAgICAgICAgICBmaWxsU3R5bGU6ICcjZDMzNjgyJyxcbiAgICAgICAgICAgICAgICBhbmdsZUluZGljYXRvcjogJyM3NTFiNGInXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pKVxuXG4gICAgICAgIHZhciBidXR0b25Db250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoYnV0dG9uQ29udGFpbmVyKTtcbiAgICAgICAgdmFyIHN0b3B3YXRjaCA9IG5ldyBTdG9wd2F0Y2god29ybGQsIGJ1dHRvbkNvbnRhaW5lciwgMSk7XG4gICAgICAgIHZhciBwbGF5UGF1c2UgPSBuZXcgUGxheVBhdXNlKHdvcmxkLCBidXR0b25Db250YWluZXIpO1xuICAgICAgICB2YXIgdG9wR2F0ZSA9IG5ldyBHYXRlKHdvcmxkLFxuICAgICAgICAgICAgdXRpbC5tYWtlUmVjdCgwLCAwLCA2MCwgMTAwKSxcbiAgICAgICAgICAgIFszNTAsIDQwMF0sXG4gICAgICAgICAgICBudWxsLCB7ZGVidWc6IHRydWUsIHNob3c6IHRydWUsIGNvbG9yOiAnZ3JlZW4nfSk7XG4gICAgICAgIHZhciBib3R0b21HYXRlID0gbmV3IEdhdGUod29ybGQsXG4gICAgICAgICAgICB1dGlsLm1ha2VSZWN0KDAsIDAsIDYwLCAxMDApLFxuICAgICAgICAgICAgWzgwMCwgNTcwXSxcbiAgICAgICAgICAgIG51bGwsIHtkZWJ1ZzogdHJ1ZSwgc2hvdzogdHJ1ZSwgY29sb3I6ICdyZWQnfSk7XG5cbiAgICAgICAgdG9wR2F0ZS5vbignZW50ZXInLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICBzdG9wd2F0Y2gucmVzZXQoKS5zdGFydCgpO1xuICAgICAgICB9KVxuICAgICAgICBib3R0b21HYXRlLm9uKCdlbnRlcicsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgIHN0b3B3YXRjaC5zdG9wKClcbiAgICAgICAgfSlcblxuICAgIH1cbn0pO1xuXG4iLCJcbm1vZHVsZS5leHBvcnRzID0gU3RvcHdhdGNoO1xuXG5mdW5jdGlvbiBTdG9wd2F0Y2god29ybGQsIGVsZW0pIHtcbiAgICB0aGlzLl9hdHRhY2god29ybGQsIGVsZW0pO1xufVxuXG5TdG9wd2F0Y2gucHJvdG90eXBlLl9hdHRhY2ggPSBmdW5jdGlvbih3b3JsZCwgZWxlbSkge1xuICAgIHRoaXMud29ybGQgPSB3b3JsZDtcbiAgICB0aGlzLnRpbWVyID0gdGhpcy5jcmVhdGVUaW1lcigpLFxuICAgIHRoaXMuc3RhcnRCdXR0b24gPSB0aGlzLmNyZWF0ZUJ1dHRvbihcInN0YXJ0XCIsIHRoaXMuc3RhcnQuYmluZCh0aGlzKSksXG4gICAgdGhpcy5zdG9wQnV0dG9uID0gdGhpcy5jcmVhdGVCdXR0b24oXCJzdG9wXCIsIHRoaXMuc3RvcC5iaW5kKHRoaXMpKSxcbiAgICB0aGlzLnJlc2V0QnV0dG9uID0gdGhpcy5jcmVhdGVCdXR0b24oXCJyZXNldFwiLCB0aGlzLnJlc2V0LmJpbmQodGhpcykpLFxuICAgIHRoaXMuY2xvY2sgPSAwO1xuXG4gICAgLy8gVXBkYXRlIG9uIGV2ZXJ5IHRpbWVyIHRpY2tcbiAgICB0aGlzLndvcmxkLm9uKCdzdGVwJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMudXBkYXRlKCk7XG4gICAgfS5iaW5kKHRoaXMpKTtcblxuICAgIHZhciB3aWRnZXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIHdpZGdldC5jbGFzc05hbWUgPSBcInN0b3B3YXRjaFwiO1xuXG4gICAgLy8gYXBwZW5kIGVsZW1lbnRzXG4gICAgd2lkZ2V0LmFwcGVuZENoaWxkKHRoaXMudGltZXIpO1xuICAgIHdpZGdldC5hcHBlbmRDaGlsZCh0aGlzLnN0YXJ0QnV0dG9uKTtcbiAgICB3aWRnZXQuYXBwZW5kQ2hpbGQodGhpcy5zdG9wQnV0dG9uKTtcbiAgICB3aWRnZXQuYXBwZW5kQ2hpbGQodGhpcy5yZXNldEJ1dHRvbik7XG5cbiAgICBlbGVtLmFwcGVuZENoaWxkKHdpZGdldCk7XG59XG5cblN0b3B3YXRjaC5wcm90b3R5cGUuY3JlYXRlVGltZXIgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIik7XG59XG5cblN0b3B3YXRjaC5wcm90b3R5cGUuY3JlYXRlQnV0dG9uID0gZnVuY3Rpb24oYWN0aW9uLCBoYW5kbGVyKSB7XG4gICAgdmFyIGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYVwiKTtcbiAgICBhLmhyZWYgPSBcIiNcIiArIGFjdGlvbjtcbiAgICBhLmlubmVySFRNTCA9IGFjdGlvbjtcbiAgICBhLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgaGFuZGxlcigpO1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH0uYmluZCh0aGlzKSk7XG4gICAgcmV0dXJuIGE7XG59XG5cblN0b3B3YXRjaC5wcm90b3R5cGUuc3RhcnQgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnJ1bm5pbmcgPSB0cnVlXG4gICAgcmV0dXJuIHRoaXM7XG59XG5cblN0b3B3YXRjaC5wcm90b3R5cGUuc3RvcCA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucnVubmluZyA9IGZhbHNlXG4gICAgcmV0dXJuIHRoaXM7XG59XG5cblN0b3B3YXRjaC5wcm90b3R5cGUucmVzZXQgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmNsb2NrID0gMDtcbiAgICB0aGlzLnJlbmRlcigpO1xuICAgIHJldHVybiB0aGlzO1xufVxuXG5TdG9wd2F0Y2gucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBuZXdUaW1lID0gdGhpcy53b3JsZC5fdGltZTtcbiAgICBpZiAodGhpcy5ydW5uaW5nICYmIHRoaXMubGFzdFRpbWUpIHtcbiAgICAgICAgdGhpcy5jbG9jayArPSBuZXdUaW1lIC0gdGhpcy5sYXN0VGltZTtcbiAgICB9XG4gICAgdGhpcy5sYXN0VGltZSA9IG5ld1RpbWU7XG4gICAgdGhpcy5yZW5kZXIoKTtcbn1cblxuU3RvcHdhdGNoLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnRpbWVyLmlubmVySFRNTCA9IHBhcnNlRmxvYXQodGhpcy5jbG9jayAvIDEwMDApLnRvRml4ZWQoMik7XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHRlcnJhaW47XG5cbmZ1bmN0aW9uIHRlcnJhaW4oIHBhcmVudCApe1xuICAgIC8vIG1vc3RseSBjb3BpZWQgZnJvbSB0aGUgZWRnZS1jb2xsaXNpb24tZGV0ZWN0aW9uIGJlaGF2aW9yLlxuICAgIC8vIFdBUk5JTkc6IHRoaXMgY3VycmVudGx5IG9ubHkgd29ya3MgY29ycmVjdGx5IGZvciBjaXJjbGVzLlxuICAgIC8vIGdldEZhcnRoZXN0SHVsbFBvaW50IGRvZXNuJ3QgYWN0dWFsbHkgZG8gd2hhdCBJIHdhbnQgaXQgdG8sIHNvIEkgd2lsbFxuICAgIC8vIG5lZWQgdG8gZXh0ZW5kIGdlb21ldHJ5IHRvIHN1cHBvcnQgd2hhdCBJIHdhbnQuXG5cbiAgICAvKlxuICAgICAqIGNoZWNrR2VuZXJhbCggYm9keSwgYm91bmRzLCBkdW1teSApIC0+IEFycmF5XG4gICAgICogLSBib2R5IChCb2R5KTogVGhlIGJvZHkgdG8gY2hlY2tcbiAgICAgKiAtIGJvdW5kczogYm91bmRzLmFhYmIgc2hvdWxkIGJlIHRoZSBvdXRlciBib3VuZHMuICBGb3IgdGVycmFpbiBvbiB0aGVcbiAgICAgKiAgIGdyb3VuZCwgcGFzcyBhIGZ1bmN0aW9uIGJvdW5kcy50ZXJyYWluSGVpZ2h0KHgpLlxuICAgICAqIC0gZHVtbXk6IChCb2R5KTogVGhlIGR1bW15IGJvZHkgdG8gcHVibGlzaCBhcyB0aGUgc3RhdGljIG90aGVyIGJvZHkgaXQgY29sbGlkZXMgd2l0aFxuICAgICAqICsgKEFycmF5KTogVGhlIGNvbGxpc2lvbiBkYXRhXG4gICAgICpcbiAgICAgKiBDaGVjayBpZiBhIGJvZHkgY29sbGlkZXMgd2l0aCB0aGUgYm91bmRhcnlcbiAgICAgKi9cbiAgICB2YXIgY2hlY2tHZW5lcmFsID0gZnVuY3Rpb24gY2hlY2tHZW5lcmFsKCBib2R5LCBib3VuZHMsIHRlcnJhaW5IZWlnaHQsIGR1bW15ICl7XG5cbiAgICAgICAgdmFyIG92ZXJsYXBcbiAgICAgICAgICAgICxhYWJiID0gYm9keS5hYWJiKClcbiAgICAgICAgICAgICxzY3JhdGNoID0gUGh5c2ljcy5zY3JhdGNocGFkKClcbiAgICAgICAgICAgICx0cmFucyA9IHNjcmF0Y2gudHJhbnNmb3JtKClcbiAgICAgICAgICAgICxkaXIgPSBzY3JhdGNoLnZlY3RvcigpXG4gICAgICAgICAgICAscmVzdWx0ID0gc2NyYXRjaC52ZWN0b3IoKVxuICAgICAgICAgICAgLGNvbGxpc2lvbiA9IGZhbHNlXG4gICAgICAgICAgICAsY29sbGlzaW9ucyA9IFtdXG4gICAgICAgICAgICAseFxuICAgICAgICAgICAgLHlcbiAgICAgICAgICAgICxjb2xsaXNpb25YXG4gICAgICAgICAgICA7XG5cbiAgICAgICAgLy8gcmlnaHRcbiAgICAgICAgb3ZlcmxhcCA9IChhYWJiLnggKyBhYWJiLmh3KSAtIGJvdW5kcy5tYXgueDtcblxuICAgICAgICBpZiAoIG92ZXJsYXAgPj0gMCApe1xuXG4gICAgICAgICAgICBkaXIuc2V0KCAxLCAwICkucm90YXRlSW52KCB0cmFucy5zZXRSb3RhdGlvbiggYm9keS5zdGF0ZS5hbmd1bGFyLnBvcyApICk7XG5cbiAgICAgICAgICAgIGNvbGxpc2lvbiA9IHtcbiAgICAgICAgICAgICAgICBib2R5QTogYm9keSxcbiAgICAgICAgICAgICAgICBib2R5QjogZHVtbXksXG4gICAgICAgICAgICAgICAgb3ZlcmxhcDogb3ZlcmxhcCxcbiAgICAgICAgICAgICAgICBub3JtOiB7XG4gICAgICAgICAgICAgICAgICAgIHg6IDEsXG4gICAgICAgICAgICAgICAgICAgIHk6IDBcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG10djoge1xuICAgICAgICAgICAgICAgICAgICB4OiBvdmVybGFwLFxuICAgICAgICAgICAgICAgICAgICB5OiAwXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBwb3M6IGJvZHkuZ2VvbWV0cnkuZ2V0RmFydGhlc3RIdWxsUG9pbnQoIGRpciwgcmVzdWx0ICkucm90YXRlKCB0cmFucyApLnZhbHVlcygpXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBjb2xsaXNpb25zLnB1c2goY29sbGlzaW9uKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGJvdHRvbVxuICAgICAgICBvdmVybGFwID0gLTE7XG4gICAgICAgIGlmIChhYWJiLnkgPiBib3VuZHMubWF4LnkgLSB0ZXJyYWluSGVpZ2h0KGFhYmIueCkpIHtcbiAgICAgICAgICAgIC8vIGlmIHRoZSBjZW50ZXIgc29tZWhvdyBnZXRzIGJlbG93IHRoZSB0ZXJyYWluLCBhbHdheXMgcHVzaCBzdHJhaWdodCB1cC5cbiAgICAgICAgICAgIG92ZXJsYXAgPSBNYXRoLm1heCgxLCAoYWFiYi55ICsgYWFiYi5oaCkgLSBib3VuZHMubWF4LnkgKyB0ZXJyYWluSGVpZ2h0KGFhYmIueCkpO1xuICAgICAgICAgICAgZGlyLnNldCggMCwgMSApLnJvdGF0ZUludiggdHJhbnMuc2V0Um90YXRpb24oIGJvZHkuc3RhdGUuYW5ndWxhci5wb3MgKSApO1xuXG4gICAgICAgICAgICBjb2xsaXNpb24gPSB7XG4gICAgICAgICAgICAgICAgYm9keUE6IGJvZHksXG4gICAgICAgICAgICAgICAgYm9keUI6IGR1bW15LFxuICAgICAgICAgICAgICAgIG92ZXJsYXA6IG92ZXJsYXAsXG4gICAgICAgICAgICAgICAgbm9ybToge1xuICAgICAgICAgICAgICAgICAgICB4OiAwLFxuICAgICAgICAgICAgICAgICAgICB5OiAxXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBtdHY6IHtcbiAgICAgICAgICAgICAgICAgICAgeDogMCxcbiAgICAgICAgICAgICAgICAgICAgeTogb3ZlcmxhcFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgcG9zOiBib2R5Lmdlb21ldHJ5LmdldEZhcnRoZXN0SHVsbFBvaW50KCBkaXIsIHJlc3VsdCApLnJvdGF0ZSggdHJhbnMgKS52YWx1ZXMoKVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgY29sbGlzaW9ucy5wdXNoKGNvbGxpc2lvbik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBvdGhlcndpc2UsIGZpbmQgdGhlIHBvaW50IG9mIGJpZ2dlc3Qgb3ZlcmxhcCwgYW5kIHB1c2ggYWxvbmcgdGhlXG4gICAgICAgICAgICAvLyBub3JtYWwgdGhlcmUuXG4gICAgICAgICAgICBmb3IgKHggPSBhYWJiLnggLSBhYWJiLmh3OyB4IDw9IGFhYmIueCArIGFhYmIuaHc7IHgrKykge1xuICAgICAgICAgICAgICAgIHkgPSBib3VuZHMubWF4LnkgLSB0ZXJyYWluSGVpZ2h0KHgpO1xuICAgICAgICAgICAgICAgIGRpci5zZXQoIHggLSBib2R5LnN0YXRlLnBvcy54LCB5IC0gYm9keS5zdGF0ZS5wb3MueSkubmVnYXRlKCk7XG4gICAgICAgICAgICAgICAgZGlyLnJvdGF0ZUludiggdHJhbnMuc2V0Um90YXRpb24oIGJvZHkuc3RhdGUuYW5ndWxhci5wb3MgKSApO1xuICAgICAgICAgICAgICAgIGJvZHkuZ2VvbWV0cnkuZ2V0RmFydGhlc3RIdWxsUG9pbnQoZGlyLCByZXN1bHQpLnJvdGF0ZSh0cmFucyk7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5ub3JtKCkgPiBkaXIubm9ybSgpICYmIG92ZXJsYXAgPCByZXN1bHQubm9ybSgpIC0gZGlyLm5vcm0oKSkge1xuICAgICAgICAgICAgICAgICAgICAvLyB0aGVyZSBpcyBhbiBhY3R1YWwgY29sbGlzaW9uLCBhbmQgdGhpcyBpcyB0aGUgZGVlcGVzdFxuICAgICAgICAgICAgICAgICAgICAvLyBvdmVybGFwIHdlJ3ZlIHNlZW4gc28gZmFyXG4gICAgICAgICAgICAgICAgICAgIGNvbGxpc2lvblggPSB4O1xuICAgICAgICAgICAgICAgICAgICBvdmVybGFwID0gcmVzdWx0Lm5vcm0oKSAtIGRpci5ub3JtKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIG92ZXJsYXAgPj0gMCApIHtcbiAgICAgICAgICAgICAgICAvLyB3aG9vIGNvcHlwYXN0YVxuICAgICAgICAgICAgICAgIHggPSBjb2xsaXNpb25YO1xuICAgICAgICAgICAgICAgIHkgPSBib3VuZHMubWF4LnkgLSB0ZXJyYWluSGVpZ2h0KHgpO1xuICAgICAgICAgICAgICAgIGRpci5zZXQoIHggLSBib2R5LnN0YXRlLnBvcy54LCB5IC0gYm9keS5zdGF0ZS5wb3MueSk7XG4gICAgICAgICAgICAgICAgZGlyLnJvdGF0ZUludiggdHJhbnMuc2V0Um90YXRpb24oIGJvZHkuc3RhdGUuYW5ndWxhci5wb3MgKSApO1xuICAgICAgICAgICAgICAgIGJvZHkuZ2VvbWV0cnkuZ2V0RmFydGhlc3RIdWxsUG9pbnQoZGlyLCByZXN1bHQpLnJvdGF0ZSh0cmFucyk7XG5cbiAgICAgICAgICAgICAgICBjb2xsaXNpb24gPSB7XG4gICAgICAgICAgICAgICAgICAgIGJvZHlBOiBib2R5LFxuICAgICAgICAgICAgICAgICAgICBib2R5QjogZHVtbXksXG4gICAgICAgICAgICAgICAgICAgIG92ZXJsYXA6IG92ZXJsYXAsXG4gICAgICAgICAgICAgICAgICAgIHBvczogcmVzdWx0LnZhbHVlcygpLFxuICAgICAgICAgICAgICAgICAgICBub3JtOiBkaXIucm90YXRlKHRyYW5zKS5ub3JtYWxpemUoKS52YWx1ZXMoKSxcbiAgICAgICAgICAgICAgICAgICAgbXR2OiBkaXIubXVsdChvdmVybGFwKS52YWx1ZXMoKSxcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgY29sbGlzaW9ucy5wdXNoKGNvbGxpc2lvbik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBsZWZ0XG4gICAgICAgIG92ZXJsYXAgPSBib3VuZHMubWluLnggLSAoYWFiYi54IC0gYWFiYi5odyk7XG5cbiAgICAgICAgaWYgKCBvdmVybGFwID49IDAgKXtcblxuICAgICAgICAgICAgZGlyLnNldCggLTEsIDAgKS5yb3RhdGVJbnYoIHRyYW5zLnNldFJvdGF0aW9uKCBib2R5LnN0YXRlLmFuZ3VsYXIucG9zICkgKTtcblxuICAgICAgICAgICAgY29sbGlzaW9uID0ge1xuICAgICAgICAgICAgICAgIGJvZHlBOiBib2R5LFxuICAgICAgICAgICAgICAgIGJvZHlCOiBkdW1teSxcbiAgICAgICAgICAgICAgICBvdmVybGFwOiBvdmVybGFwLFxuICAgICAgICAgICAgICAgIG5vcm06IHtcbiAgICAgICAgICAgICAgICAgICAgeDogLTEsXG4gICAgICAgICAgICAgICAgICAgIHk6IDBcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG10djoge1xuICAgICAgICAgICAgICAgICAgICB4OiAtb3ZlcmxhcCxcbiAgICAgICAgICAgICAgICAgICAgeTogMFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgcG9zOiBib2R5Lmdlb21ldHJ5LmdldEZhcnRoZXN0SHVsbFBvaW50KCBkaXIsIHJlc3VsdCApLnJvdGF0ZSggdHJhbnMgKS52YWx1ZXMoKVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgY29sbGlzaW9ucy5wdXNoKGNvbGxpc2lvbik7XG4gICAgICAgIH1cblxuICAgICAgICAvLyB0b3BcbiAgICAgICAgb3ZlcmxhcCA9IGJvdW5kcy5taW4ueSAtIChhYWJiLnkgLSBhYWJiLmhoKTtcblxuICAgICAgICBpZiAoIG92ZXJsYXAgPj0gMCApe1xuXG4gICAgICAgICAgICBkaXIuc2V0KCAwLCAtMSApLnJvdGF0ZUludiggdHJhbnMuc2V0Um90YXRpb24oIGJvZHkuc3RhdGUuYW5ndWxhci5wb3MgKSApO1xuXG4gICAgICAgICAgICBjb2xsaXNpb24gPSB7XG4gICAgICAgICAgICAgICAgYm9keUE6IGJvZHksXG4gICAgICAgICAgICAgICAgYm9keUI6IGR1bW15LFxuICAgICAgICAgICAgICAgIG92ZXJsYXA6IG92ZXJsYXAsXG4gICAgICAgICAgICAgICAgbm9ybToge1xuICAgICAgICAgICAgICAgICAgICB4OiAwLFxuICAgICAgICAgICAgICAgICAgICB5OiAtMVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgbXR2OiB7XG4gICAgICAgICAgICAgICAgICAgIHg6IDAsXG4gICAgICAgICAgICAgICAgICAgIHk6IC1vdmVybGFwXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBwb3M6IGJvZHkuZ2VvbWV0cnkuZ2V0RmFydGhlc3RIdWxsUG9pbnQoIGRpciwgcmVzdWx0ICkucm90YXRlKCB0cmFucyApLnZhbHVlcygpXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBjb2xsaXNpb25zLnB1c2goY29sbGlzaW9uKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHNjcmF0Y2guZG9uZSgpO1xuICAgICAgICByZXR1cm4gY29sbGlzaW9ucztcbiAgICB9O1xuXG4gICAgLypcbiAgICAgKiBjaGVja0VkZ2VDb2xsaWRlKCBib2R5LCBib3VuZHMsIGR1bW15ICkgLT4gQXJyYXlcbiAgICAgKiAtIGJvZHkgKEJvZHkpOiBUaGUgYm9keSB0byBjaGVja1xuICAgICAqIC0gYm91bmRzIChQaHlzaWNzLmFhYmIpOiBUaGUgYm91bmRhcnlcbiAgICAgKiAtIGR1bW15OiAoQm9keSk6IFRoZSBkdW1teSBib2R5IHRvIHB1Ymxpc2ggYXMgdGhlIHN0YXRpYyBvdGhlciBib2R5IGl0IGNvbGxpZGVzIHdpdGhcbiAgICAgKiArIChBcnJheSk6IFRoZSBjb2xsaXNpb24gZGF0YVxuICAgICAqXG4gICAgICogQ2hlY2sgaWYgYSBib2R5IGNvbGxpZGVzIHdpdGggdGhlIGJvdW5kYXJ5XG4gICAgICovXG4gICAgdmFyIGNoZWNrRWRnZUNvbGxpZGUgPSBmdW5jdGlvbiBjaGVja0VkZ2VDb2xsaWRlKCBib2R5LCBib3VuZHMsIHRlcnJhaW5IZWlnaHQsIGR1bW15ICl7XG5cbiAgICAgICAgcmV0dXJuIGNoZWNrR2VuZXJhbCggYm9keSwgYm91bmRzLCB0ZXJyYWluSGVpZ2h0LCBkdW1teSApO1xuICAgIH07XG5cbiAgICB2YXIgZGVmYXVsdHMgPSB7XG5cbiAgICAgICAgZWRnZXM6IHtcbiAgICAgICAgICAgIGFhYmI6IG51bGwsXG4gICAgICAgICAgICB0ZXJyYWluSGVpZ2h0OiBmdW5jdGlvbiAoeCkge3JldHVybiAwO30sXG4gICAgICAgIH0sXG4gICAgICAgIHJlc3RpdHV0aW9uOiAwLjk5LFxuICAgICAgICBjb2Y6IDEuMCxcbiAgICAgICAgY2hhbm5lbDogJ2NvbGxpc2lvbnM6ZGV0ZWN0ZWQnXG4gICAgfTtcblxuICAgIHJldHVybiB7XG5cbiAgICAgICAgLy8gZXh0ZW5kZWRcbiAgICAgICAgaW5pdDogZnVuY3Rpb24oIG9wdGlvbnMgKXtcblxuICAgICAgICAgICAgcGFyZW50LmluaXQuY2FsbCggdGhpcyApO1xuICAgICAgICAgICAgdGhpcy5vcHRpb25zLmRlZmF1bHRzKCBkZWZhdWx0cyApO1xuICAgICAgICAgICAgdGhpcy5vcHRpb25zKCBvcHRpb25zICk7XG5cbiAgICAgICAgICAgIHRoaXMuc2V0QUFCQiggdGhpcy5vcHRpb25zLmFhYmIgKTtcbiAgICAgICAgICAgIHRoaXMucmVzdGl0dXRpb24gPSB0aGlzLm9wdGlvbnMucmVzdGl0dXRpb247XG5cbiAgICAgICAgICAgIHRoaXMuYm9keSA9IFBoeXNpY3MuYm9keSgncG9pbnQnLCB7XG4gICAgICAgICAgICAgICAgdHJlYXRtZW50OiAnc3RhdGljJyxcbiAgICAgICAgICAgICAgICByZXN0aXR1dGlvbjogdGhpcy5vcHRpb25zLnJlc3RpdHV0aW9uLFxuICAgICAgICAgICAgICAgIGNvZjogdGhpcy5vcHRpb25zLmNvZlxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEVkZ2VDb2xsaXNpb25EZXRlY3Rpb25CZWhhdmlvciNzZXRBQUJCKCBhYWJiICkgLT4gdGhpc1xuICAgICAgICAgKiAtIGFhYmIgKFBoeXNpY3MuYWFiYik6IFRoZSBhYWJiIHRvIHVzZSBhcyB0aGUgYm91bmRhcnlcbiAgICAgICAgICpcbiAgICAgICAgICogU2V0IHRoZSBib3VuZGFyaWVzIG9mIHRoZSBlZGdlLlxuICAgICAgICAgKiovXG4gICAgICAgIHNldEFBQkI6IGZ1bmN0aW9uKCBhYWJiICl7XG5cbiAgICAgICAgICAgIGlmICghYWFiYikge1xuICAgICAgICAgICAgICAgIHRocm93ICdFcnJvcjogYWFiYiBub3Qgc2V0JztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5fZWRnZXMgPSB7XG4gICAgICAgICAgICAgICAgbWluOiB7XG4gICAgICAgICAgICAgICAgICAgIHg6IChhYWJiLnggLSBhYWJiLmh3KSxcbiAgICAgICAgICAgICAgICAgICAgeTogKGFhYmIueSAtIGFhYmIuaGgpXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBtYXg6IHtcbiAgICAgICAgICAgICAgICAgICAgeDogKGFhYmIueCArIGFhYmIuaHcpLFxuICAgICAgICAgICAgICAgICAgICB5OiAoYWFiYi55ICsgYWFiYi5oaClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSxcblxuICAgICAgICAvLyBleHRlbmRlZFxuICAgICAgICBjb25uZWN0OiBmdW5jdGlvbiggd29ybGQgKXtcblxuICAgICAgICAgICAgd29ybGQub24oICdpbnRlZ3JhdGU6dmVsb2NpdGllcycsIHRoaXMuY2hlY2tBbGwsIHRoaXMgKTtcbiAgICAgICAgfSxcblxuICAgICAgICAvLyBleHRlbmRlZFxuICAgICAgICBkaXNjb25uZWN0OiBmdW5jdGlvbiggd29ybGQgKXtcblxuICAgICAgICAgICAgd29ybGQub2ZmKCAnaW50ZWdyYXRlOnZlbG9jaXRpZXMnLCB0aGlzLmNoZWNrQWxsICk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqIGludGVybmFsXG4gICAgICAgICAqIEVkZ2VDb2xsaXNpb25EZXRlY3Rpb25CZWhhdmlvciNjaGVja0FsbCggZGF0YSApXG4gICAgICAgICAqIC0gZGF0YSAoT2JqZWN0KTogRXZlbnQgZGF0YVxuICAgICAgICAgKlxuICAgICAgICAgKiBFdmVudCBjYWxsYmFjayB0byBjaGVjayBhbGwgYm9kaWVzIGZvciBjb2xsaXNpb25zIHdpdGggdGhlIGVkZ2VcbiAgICAgICAgICoqL1xuICAgICAgICBjaGVja0FsbDogZnVuY3Rpb24oIGRhdGEgKXtcblxuICAgICAgICAgICAgdmFyIGJvZGllcyA9IHRoaXMuZ2V0VGFyZ2V0cygpXG4gICAgICAgICAgICAgICAgLGR0ID0gZGF0YS5kdFxuICAgICAgICAgICAgICAgICxib2R5XG4gICAgICAgICAgICAgICAgLGNvbGxpc2lvbnMgPSBbXVxuICAgICAgICAgICAgICAgICxyZXRcbiAgICAgICAgICAgICAgICAsYm91bmRzID0gdGhpcy5fZWRnZXNcbiAgICAgICAgICAgICAgICAsdGVycmFpbkhlaWdodCA9IF8ubWVtb2l6ZSh0aGlzLm9wdGlvbnMudGVycmFpbkhlaWdodClcbiAgICAgICAgICAgICAgICAsZHVtbXkgPSB0aGlzLmJvZHlcbiAgICAgICAgICAgICAgICA7XG5cbiAgICAgICAgICAgIGZvciAoIHZhciBpID0gMCwgbCA9IGJvZGllcy5sZW5ndGg7IGkgPCBsOyBpKysgKXtcblxuICAgICAgICAgICAgICAgIGJvZHkgPSBib2RpZXNbIGkgXTtcblxuICAgICAgICAgICAgICAgIC8vIG9ubHkgZGV0ZWN0IGR5bmFtaWMgYm9kaWVzXG4gICAgICAgICAgICAgICAgaWYgKCBib2R5LnRyZWF0bWVudCA9PT0gJ2R5bmFtaWMnICl7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0ID0gY2hlY2tFZGdlQ29sbGlkZSggYm9keSwgYm91bmRzLCB0ZXJyYWluSGVpZ2h0LCBkdW1teSApO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICggcmV0ICl7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2xsaXNpb25zLnB1c2guYXBwbHkoIGNvbGxpc2lvbnMsIHJldCApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIGNvbGxpc2lvbnMubGVuZ3RoICl7XG5cbiAgICAgICAgICAgICAgICB0aGlzLl93b3JsZC5lbWl0KCB0aGlzLm9wdGlvbnMuY2hhbm5lbCwge1xuICAgICAgICAgICAgICAgICAgICBjb2xsaXNpb25zOiBjb2xsaXNpb25zXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG59O1xuIiwiXG52YXIgQmFzZSA9IHJlcXVpcmUoJy4vYmFzZScpO1xudmFyIEdyYXBoID0gcmVxdWlyZSgnLi9ncmFwaCcpO1xuXG5mdW5jdGlvbiByYW5kb20oIG1pbiwgbWF4ICl7XG4gICAgcmV0dXJuIChNYXRoLnJhbmRvbSgpICogKG1heC1taW4pICsgbWluKXwwXG59XG5cbm1vZHVsZS5leHBvcnRzID0gQmFzZS5leHRlbmQoZnVuY3Rpb24gRGVtbyhjb250YWluZXIsIG9wdGlvbnMpIHtcbiAgICBCYXNlLmNhbGwodGhpcywgY29udGFpbmVyLCBvcHRpb25zLCAnaW1hZ2VzL2xhYl9iYWNrZ3JvdW5kLmpwZycpXG59LCB7XG4gICAgbWFrZUNpcmNsZTogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gUGh5c2ljcy5ib2R5KCdjaXJjbGUnLCB7XG4gICAgICAgICAgICB4OiB0aGlzLm9wdGlvbnMud2lkdGggLyAyLFxuICAgICAgICAgICAgeTogNTAsXG4gICAgICAgICAgICB2eDogcmFuZG9tKC01LCA1KS8xMDAsXG4gICAgICAgICAgICByYWRpdXM6IDQwLFxuICAgICAgICAgICAgcmVzdGl0dXRpb246IDAuOSxcbiAgICAgICAgICAgIHN0eWxlczoge1xuICAgICAgICAgICAgICAgIGZpbGxTdHlsZTogJyMyNjhiZDInLFxuICAgICAgICAgICAgICAgIGFuZ2xlSW5kaWNhdG9yOiAnIzE1NTQ3OSdcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICBkcm9wSW5Cb2R5OiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgdmFyIGJvZHk7XG5cblxuICAgICAgICB2YXIgcGVudCA9IFtcbiAgICAgICAgICAgIHsgeDogNTAsIHk6IDAgfVxuICAgICAgICAgICAgLHsgeDogMjUsIHk6IC0yNSB9XG4gICAgICAgICAgICAseyB4OiAtMjUsIHk6IC0yNSB9XG4gICAgICAgICAgICAseyB4OiAtNTAsIHk6IDAgfVxuICAgICAgICAgICAgLHsgeDogMCwgeTogNTAgfVxuICAgICAgICBdO1xuXG4gICAgICAgICAgICBzd2l0Y2ggKCByYW5kb20oIDAsIDMgKSApe1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGFkZCBhIGNpcmNsZVxuICAgICAgICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgICAgICAgICAgYm9keSA9IFBoeXNpY3MuYm9keSgnY2lyY2xlJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgeDogdGhpcy5vcHRpb25zLndpZHRoIC8gMlxuICAgICAgICAgICAgICAgICAgICAgICAgLHk6IDUwXG4gICAgICAgICAgICAgICAgICAgICAgICAsdng6IHJhbmRvbSgtNSwgNSkvMTAwXG4gICAgICAgICAgICAgICAgICAgICAgICAscmFkaXVzOiA0MFxuICAgICAgICAgICAgICAgICAgICAgICAgLHJlc3RpdHV0aW9uOiAwLjlcbiAgICAgICAgICAgICAgICAgICAgICAgICxzdHlsZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxsU3R5bGU6ICcjMjY4YmQyJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICxhbmdsZUluZGljYXRvcjogJyMxNTU0NzknXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgICAgICAvLyBhZGQgYSBzcXVhcmVcbiAgICAgICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAgICAgICAgIGJvZHkgPSBQaHlzaWNzLmJvZHkoJ3JlY3RhbmdsZScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiA1MFxuICAgICAgICAgICAgICAgICAgICAgICAgLGhlaWdodDogNTBcbiAgICAgICAgICAgICAgICAgICAgICAgICx4OiB0aGlzLm9wdGlvbnMud2lkdGggLyAyXG4gICAgICAgICAgICAgICAgICAgICAgICAseTogNTBcbiAgICAgICAgICAgICAgICAgICAgICAgICx2eDogcmFuZG9tKC01LCA1KS8xMDBcbiAgICAgICAgICAgICAgICAgICAgICAgICxyZXN0aXR1dGlvbjogMC45XG4gICAgICAgICAgICAgICAgICAgICAgICAsc3R5bGVzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsbFN0eWxlOiAnI2QzMzY4MidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAsYW5nbGVJbmRpY2F0b3I6ICcjNzUxYjRiJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gYWRkIGEgcG9seWdvblxuICAgICAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICAgICAgYm9keSA9IFBoeXNpY3MuYm9keSgnY29udmV4LXBvbHlnb24nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2ZXJ0aWNlczogcGVudFxuICAgICAgICAgICAgICAgICAgICAgICAgLHg6IHRoaXMub3B0aW9ucy53aWR0aCAvIDJcbiAgICAgICAgICAgICAgICAgICAgICAgICx5OiA1MFxuICAgICAgICAgICAgICAgICAgICAgICAgLHZ4OiByYW5kb20oLTUsIDUpLzEwMFxuICAgICAgICAgICAgICAgICAgICAgICAgLGFuZ2xlOiByYW5kb20oIDAsIDIgKiBNYXRoLlBJIClcbiAgICAgICAgICAgICAgICAgICAgICAgICxyZXN0aXR1dGlvbjogMC45XG4gICAgICAgICAgICAgICAgICAgICAgICAsc3R5bGVzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsbFN0eWxlOiAnIzg1OTkwMCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAsYW5nbGVJbmRpY2F0b3I6ICcjNDE0NzAwJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMud29ybGQuYWRkKCBib2R5ICk7XG4gICAgfSxcbiAgICBzZXR1cDogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgd29ybGQgPSB0aGlzLndvcmxkXG4gICAgICAgIC8vIHdvcmxkLmFkZChQaHlzaWNzLmJlaGF2aW9yKCdjb25zdGFudC1hY2NlbGVyYXRpb24nKSk7XG5cbiAgICAgICAgLypcbiAgICAgICAgdmFyIGludCA9IHNldEludGVydmFsKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBpZiAoIHdvcmxkLl9ib2RpZXMubGVuZ3RoID4gNCApe1xuICAgICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoIGludCApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5kcm9wSW5Cb2R5KCk7XG4gICAgICAgIH0uYmluZCh0aGlzKSwgNzAwKTtcbiAgICAgICAqL1xuXG4gICAgICAgIHZhciBjaXJjbGUgPSB0aGlzLm1ha2VDaXJjbGUoKVxuICAgICAgICB0aGlzLndvcmxkLmFkZChjaXJjbGUpXG5cbiAgICAgICAgdmFyIGdyYXBoID0gbmV3IEdyYXBoKHRoaXMuY29udGFpbmVyLCB7XG4gICAgICAgICAgICAnQ2lyY2xlJzoge2JvZHk6IGNpcmNsZSwgYXR0cjogJ3Bvcy55JywgbmFtZTonQ2lyY2xlJywgbWluc2NhbGU6IDV9LFxuICAgICAgICAgICAgJ1ZlbFknOiB7Ym9keTogY2lyY2xlLCBhdHRyOiAndmVsLnknLCBuYW1lOidWZWxZJywgbWluc2NhbGU6IC4xfSxcbiAgICAgICAgICAgICdBbmdQJzoge2JvZHk6IGNpcmNsZSwgYXR0cjogJ2FuZ3VsYXIucG9zJywgbmFtZTonQWNjWCcsIG1pbnNjYWxlOiAuMDAxfSxcbiAgICAgICAgICAgICdBbmdWJzoge2JvZHk6IGNpcmNsZSwgYXR0cjogJ2FuZ3VsYXIudmVsJywgbmFtZTonQWNjWCcsIG1pbnNjYWxlOiAuMDAxfSxcbiAgICAgICAgfSwgdGhpcy5vcHRpb25zLmhlaWdodClcbiAgICAgICAgdGhpcy5ncmFwaCA9IGdyYXBoXG5cbiAgICAgICAgdGhpcy53b3JsZC5vbignc3RlcCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGdyYXBoLnVwZGF0ZSh3b3JsZC50aW1lc3RlcCgpKVxuICAgICAgICB9KTtcblxuICAgIH1cbn0pO1xuXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBtYWtlUmVjdDogbWFrZVJlY3QsXG4gICAgbWFrZVJvY2s6IG1ha2VSb2NrLFxuICAgIHN1bTogc3VtLFxuICAgIGF2ZzogYXZnLFxuICAgIHN0ZGV2OiBzdGRldixcbiAgICBjb3JyZWxhdGlvbjogY29ycmVsYXRpb24sXG59XG5cbmZ1bmN0aW9uIHN1bShudW1iZXJzKSB7XG4gICAgaWYgKCFudW1iZXJzLmxlbmd0aCkgcmV0dXJuIDA7XG4gICAgcmV0dXJuIG51bWJlcnMucmVkdWNlKGZ1bmN0aW9uIChhLCBiKSB7cmV0dXJuIGEgKyBifSlcbn1cblxuZnVuY3Rpb24gYXZnKG51bWJlcnMpIHtcbiAgICBpZiAoIW51bWJlcnMubGVuZ3RoKSByZXR1cm4gMDtcbiAgICByZXR1cm4gc3VtKG51bWJlcnMpIC8gbnVtYmVycy5sZW5ndGhcbn1cblxuZnVuY3Rpb24gc3RkZXYobnVtYmVycykge1xuICAgIGlmICghbnVtYmVycy5sZW5ndGgpIHJldHVybiAwO1xuICAgIHZhciBhID0gYXZnKG51bWJlcnMpO1xuICAgIHJldHVybiBNYXRoLnNxcnQoYXZnKF8ubWFwKG51bWJlcnMsIGZ1bmN0aW9uIChudW0pIHtyZXR1cm4gTWF0aC5wb3cobnVtIC0gYSwgMik7fSkpKVxufVxuXG5mdW5jdGlvbiBjb3JyZWxhdGlvbihkYXRhMSwgZGF0YTIpIHtcbiAgICBpZiAoIWRhdGExLmxlbmd0aCB8fCBkYXRhMS5sZW5ndGggIT0gZGF0YTIubGVuZ3RoKSByZXR1cm4gMDtcbiAgICB2YXIgYXZnMSA9IGF2ZyhkYXRhMSk7XG4gICAgdmFyIGF2ZzIgPSBhdmcoZGF0YTIpO1xuICAgIHZhciBjb3ZhcmlhbmNlID0gYXZnKF8ubWFwKFxuICAgICAgICBfLnppcChkYXRhMSwgZGF0YTIpLCBcbiAgICAgICAgZnVuY3Rpb24gKGRhdGFQYWlyKSB7cmV0dXJuIChkYXRhUGFpclswXSAtIGF2ZzEpICogKGRhdGFQYWlyWzFdIC0gYXZnMik7fSkpO1xuICAgIHJldHVybiBjb3ZhcmlhbmNlIC8gKHN0ZGV2KGRhdGExKSAqIHN0ZGV2KGRhdGEyKSk7XG59XG5cbmZ1bmN0aW9uIG1ha2VSZWN0KHgsIHksIHdpZHRoLCBoZWlnaHQpIHtcbiAgICByZXR1cm4gW1xuICAgICAgICB7eDogeCAtIHdpZHRoLzIsIHk6IHkgLSBoZWlnaHQvMn0sXG4gICAgICAgIHt4OiB4ICsgd2lkdGgvMiwgeTogeSAtIGhlaWdodC8yfSxcbiAgICAgICAge3g6IHggKyB3aWR0aC8yLCB5OiB5ICsgaGVpZ2h0LzJ9LFxuICAgICAgICB7eDogeCAtIHdpZHRoLzIsIHk6IHkgKyBoZWlnaHQvMn0sXG4gICAgXVxufVxuXG4vLyBOb3QgYSBjb252ZXggaHVsbCA6KFxuZnVuY3Rpb24gbWFrZVJvY2socmFkaXVzLCBkZXZpYXRpb24sIHJlc29sdXRpb24pIHtcbiAgICB2YXIgcmVzb2x1dGlvbiA9IHJlc29sdXRpb24gfHwgMzJcbiAgICB2YXIgZGV2aWF0aW9uID0gZGV2aWF0aW9uIHx8IDEwXG4gICAgdmFyIHBvaW50cyA9IFtdXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZXNvbHV0aW9uOyBpKyspIHtcbiAgICAgICAgdmFyIGFuZyA9IGkgLyByZXNvbHV0aW9uICogMiAqIE1hdGguUEk7XG4gICAgICAgIHZhciBwb2ludCA9IHsgeDogcmFkaXVzICogTWF0aC5jb3MoYW5nKSwgeTogcmFkaXVzICogTWF0aC5zaW4oYW5nKSB9XG4gICAgICAgIHBvaW50LnggKz0gKE1hdGgucmFuZG9tKCkpICogMiAqIGRldmlhdGlvblxuICAgICAgICBwb2ludC55ICs9IChNYXRoLnJhbmRvbSgpKSAqIDIgKiBkZXZpYXRpb25cbiAgICAgICAgcG9pbnRzLnB1c2gocG9pbnQpXG4gICAgfVxuICAgIHJldHVybiBwb2ludHNcbn1cbiIsIlxudmFyIGJha2hhbiA9IHJlcXVpcmUoJy4vbGliJylcbiAgLCBub2RlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21haW4tY2FudmFzJylcblxudmFyIG9wdGlvbnMgPSB7XG4gICAgd2lkdGg6IDkwMCxcbiAgICBoZWlnaHQ6IDcwMCxcbn1cblxudmFyIG5hbWUgPSB3aW5kb3cubG9jYXRpb24uc2VhcmNoLnJlcGxhY2UoLyYoXFx3Kyk9KFteJl0rKS9nLCBmdW5jdGlvbiAocmVzLCBrZXksIHZhbCkge1xuICAgIG9wdGlvbnNba2V5XSA9IHZhbC5yZXBsYWNlKC9cXC8vLCAnJylcbiAgICByZXR1cm4gJydcbn0pLnJlcGxhY2UoL1teXFx3XS9nLCAnJylcbmlmICghbmFtZSkge1xuICAgIG5hbWUgPSAnRHJvcCc7XG4gICAgb3B0aW9ucyA9IHt3YWxrOiAndHJ1ZSd9O1xufVxuY29uc29sZS5sb2cobmFtZSwgb3B0aW9ucylcblxud2luZG93LkJLQSA9IG5ldyBiYWtoYW5bbmFtZV0obm9kZSwgb3B0aW9ucyk7XG53aW5kb3cuQktBLnJ1bigpO1xuIl19
