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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvdXNyL2xvY2FsL2xpYi9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2toYW5pbnRlcm4xL2Nsb25lL2Jha2hhbi9saWIvYXN0ZXJvaWRzLmpzIiwiL1VzZXJzL2toYW5pbnRlcm4xL2Nsb25lL2Jha2hhbi9saWIvYmFjb24uanN4IiwiL1VzZXJzL2toYW5pbnRlcm4xL2Nsb25lL2Jha2hhbi9saWIvYmFzZS5qcyIsIi9Vc2Vycy9raGFuaW50ZXJuMS9jbG9uZS9iYWtoYW4vbGliL2NhbmdyYXBoLmpzIiwiL1VzZXJzL2toYW5pbnRlcm4xL2Nsb25lL2Jha2hhbi9saWIvY2F2ZWRyYXcuanMiLCIvVXNlcnMva2hhbmludGVybjEvY2xvbmUvYmFraGFuL2xpYi9jaGVjay1jb2xsaXNpb24uanMiLCIvVXNlcnMva2hhbmludGVybjEvY2xvbmUvYmFraGFuL2xpYi9kYXRhY2hlY2tlci5qc3giLCIvVXNlcnMva2hhbmludGVybjEvY2xvbmUvYmFraGFuL2xpYi9kZW1vLmpzIiwiL1VzZXJzL2toYW5pbnRlcm4xL2Nsb25lL2Jha2hhbi9saWIvZHJvcC5qcyIsIi9Vc2Vycy9raGFuaW50ZXJuMS9jbG9uZS9iYWtoYW4vbGliL2Ryb3BkYXRhY2hlY2tlci5qcyIsIi9Vc2Vycy9raGFuaW50ZXJuMS9jbG9uZS9iYWtoYW4vbGliL2dhdGUuanMiLCIvVXNlcnMva2hhbmludGVybjEvY2xvbmUvYmFraGFuL2xpYi9ncmFwaC5qcyIsIi9Vc2Vycy9raGFuaW50ZXJuMS9jbG9uZS9iYWtoYW4vbGliL2hpbGxzLmpzIiwiL1VzZXJzL2toYW5pbnRlcm4xL2Nsb25lL2Jha2hhbi9saWIvaGlsbHNkYXRhY2hlY2tlci5qcyIsIi9Vc2Vycy9raGFuaW50ZXJuMS9jbG9uZS9iYWtoYW4vbGliL2luZGV4LmpzIiwiL1VzZXJzL2toYW5pbnRlcm4xL2Nsb25lL2Jha2hhbi9saWIvaW50cm8vZHJvcF9pbnRyby5qc3giLCIvVXNlcnMva2hhbmludGVybjEvY2xvbmUvYmFraGFuL2xpYi9pbnRyby9oaWxsc19pbnRyby5qc3giLCIvVXNlcnMva2hhbmludGVybjEvY2xvbmUvYmFraGFuL2xpYi9pbnRyby9uZXd0b24xX2ludHJvLmpzeCIsIi9Vc2Vycy9raGFuaW50ZXJuMS9jbG9uZS9iYWtoYW4vbGliL2ludHJvL3N0ZXAuanN4IiwiL1VzZXJzL2toYW5pbnRlcm4xL2Nsb25lL2Jha2hhbi9saWIvaW50cm8vd2Fsay10aHJvdWdoLmpzeCIsIi9Vc2Vycy9raGFuaW50ZXJuMS9jbG9uZS9iYWtoYW4vbGliL2xvZ2Jvb2suanMiLCIvVXNlcnMva2hhbmludGVybjEvY2xvbmUvYmFraGFuL2xpYi9tb29uLmpzIiwiL1VzZXJzL2toYW5pbnRlcm4xL2Nsb25lL2Jha2hhbi9saWIvbmV3LWFzdGVyb2lkLWJ1dHRvbi5qc3giLCIvVXNlcnMva2hhbmludGVybjEvY2xvbmUvYmFraGFuL2xpYi9uZXd0b24xLmpzIiwiL1VzZXJzL2toYW5pbnRlcm4xL2Nsb25lL2Jha2hhbi9saWIvbmV3dG9uMWRhdGFjaGVja2VyLmpzIiwiL1VzZXJzL2toYW5pbnRlcm4xL2Nsb25lL2Jha2hhbi9saWIvb3JiaXQuanMiLCIvVXNlcnMva2hhbmludGVybjEvY2xvbmUvYmFraGFuL2xpYi9wbGF5cGF1c2UuanMiLCIvVXNlcnMva2hhbmludGVybjEvY2xvbmUvYmFraGFuL2xpYi9zbG9wZS5qcyIsIi9Vc2Vycy9raGFuaW50ZXJuMS9jbG9uZS9iYWtoYW4vbGliL3N0b3B3YXRjaC5qcyIsIi9Vc2Vycy9raGFuaW50ZXJuMS9jbG9uZS9iYWtoYW4vbGliL3RlcnJhaW4uanMiLCIvVXNlcnMva2hhbmludGVybjEvY2xvbmUvYmFraGFuL2xpYi90cnktZ3JhcGguanMiLCIvVXNlcnMva2hhbmludGVybjEvY2xvbmUvYmFraGFuL2xpYi91dGlsLmpzIiwiL1VzZXJzL2toYW5pbnRlcm4xL2Nsb25lL2Jha2hhbi9ydW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25MQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9LQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdFBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdE5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBHYXRlID0gcmVxdWlyZSgnLi9nYXRlJyk7XG52YXIgQmFzZSA9IHJlcXVpcmUoJy4vYmFzZScpO1xudmFyIFN0b3B3YXRjaCA9IHJlcXVpcmUoJy4vc3RvcHdhdGNoJyk7XG52YXIgUGxheVBhdXNlID0gcmVxdWlyZSgnLi9wbGF5cGF1c2UnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBCYXNlLmV4dGVuZChmdW5jdGlvbiBBc3Rlcm9pZHMoY29udGFpbmVyLCBvcHRpb25zKSB7XG4gICAgQmFzZS5jYWxsKHRoaXMsIGNvbnRhaW5lciwgb3B0aW9ucywgJ2ltYWdlcy9zcGFjZV9iYWNrZ3JvdW5kLmpwZycsXG4gICAgICAgIHRydWUpXG59LCB7XG4gICAgc2V0dXA6IGZ1bmN0aW9uIChjb250YWluZXIpIHtcbiAgICAgICAgdmFyIHdvcmxkID0gdGhpcy53b3JsZDtcbiAgICAgICAgd29ybGQuYWRkKFBoeXNpY3MuYm9keSgnY2lyY2xlJywge1xuICAgICAgICAgICAgeDogNDAwXG4gICAgICAgICAgICAseTogMzUwXG4gICAgICAgICAgICAsdng6IC0xLjMvNTBcbiAgICAgICAgICAgICxyYWRpdXM6IDEwXG4gICAgICAgICAgICAsbWFzczogMTAwMFxuICAgICAgICAgICAgLHJlc3RpdHV0aW9uOiAwXG4gICAgICAgICAgICAsc3R5bGVzOiB7XG4gICAgICAgICAgICAgICAgZmlsbFN0eWxlOiAnI2ZmY2MwMCdcbiAgICAgICAgICAgICAgICAsYW5nbGVJbmRpY2F0b3I6ICcjMTU1NDc5J1xuICAgICAgICAgICAgfVxuICAgICAgICB9KSk7XG4gICAgICAgIHdvcmxkLmFkZChQaHlzaWNzLmJvZHkoJ2NpcmNsZScsIHtcbiAgICAgICAgICAgIHg6IDQwMFxuICAgICAgICAgICAgLHk6IDUwXG4gICAgICAgICAgICAsdng6IDEuM1xuICAgICAgICAgICAgLHJhZGl1czogNVxuICAgICAgICAgICAgLG1hc3M6IDIwXG4gICAgICAgICAgICAscmVzdGl0dXRpb246IDBcbiAgICAgICAgICAgICxzdHlsZXM6IHtcbiAgICAgICAgICAgICAgICBmaWxsU3R5bGU6ICcjMjZlYjYyJyAvL2dyZWVuXG4gICAgICAgICAgICAgICAgLGFuZ2xlSW5kaWNhdG9yOiAnIzE1NTQ3OSdcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkpO1xuICAgICAgICB3b3JsZC5hZGQoUGh5c2ljcy5iZWhhdmlvcignbmV3dG9uaWFuJywgeyBzdHJlbmd0aDogLjUgfSkpO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDEwMDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgciA9IE1hdGgucmFuZG9tKCkgKiAxMCArIDI5NTtcbiAgICAgICAgICAgIHZhciB0aCA9ICgtMS82IC0gMC4wMDUgKyBNYXRoLnJhbmRvbSgpICogMC4wMSkgKiBNYXRoLlBJO1xuICAgICAgICAgICAgd29ybGQuYWRkKFBoeXNpY3MuYm9keSgnY2lyY2xlJywge1xuICAgICAgICAgICAgICAgIHg6IE1hdGguY29zKHRoKSAqIHIgKyA0MDBcbiAgICAgICAgICAgICAgICAseTogTWF0aC5zaW4odGgpICogciArIDM1MFxuICAgICAgICAgICAgICAgICx2eDogLTEuMyAqIE1hdGguc2luKHRoKVxuICAgICAgICAgICAgICAgICx2eTogMS4zICogTWF0aC5jb3ModGgpXG4gICAgICAgICAgICAgICAgLHJhZGl1czogMlxuICAgICAgICAgICAgICAgICxtYXNzOiBNYXRoLnBvdygxMCwgTWF0aC5yYW5kb20oKSAqIDIpICogMC4wMDAwMVxuICAgICAgICAgICAgICAgICxyZXN0aXR1dGlvbjogMFxuICAgICAgICAgICAgICAgICxzdHlsZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgZmlsbFN0eWxlOiAnI2RkMjIyMicgLy9yZWRcbiAgICAgICAgICAgICAgICAgICAgLGFuZ2xlSW5kaWNhdG9yOiAnIzE1NTQ3OSdcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgYnV0dG9uQ29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGJ1dHRvbkNvbnRhaW5lcik7XG4gICAgICAgIHZhciBwbGF5UGF1c2UgPSBuZXcgUGxheVBhdXNlKHdvcmxkLCBidXR0b25Db250YWluZXIpO1xuICAgIH1cbn0pO1xuXG4gICAgICAgIFxuIiwiLyoqIEBqc3ggUmVhY3QuRE9NICovXG5cbnZhciBXYWxrdGhyb3VnaCA9IHJlcXVpcmUoJy4vaW50cm8vd2Fsay10aHJvdWdoLmpzeCcpXG52YXIgU3RlcCA9IHJlcXVpcmUoJy4vaW50cm8vc3RlcC5qc3gnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEJhY29uO1xuXG5mdW5jdGlvbiBCYWNvbihjb250YWluZXIsIG9wdGlvbnMpIHtcbiAgICB2YXIgbm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQobm9kZSk7XG4gICAgUmVhY3QucmVuZGVyQ29tcG9uZW50KFdhbGt0aHJvdWdoKHtcbiAgICAgICAgc3RlcHM6IHN0ZXBzLFxuICAgIH0pLCBub2RlKTtcbn1cblxuQmFjb24ucHJvdG90eXBlID0ge1xuICAgIHJ1bjogZnVuY3Rpb24gKCkge30sXG59O1xuXG52YXIgc3RlcHMgPSBbXG4gICAgZnVuY3Rpb24gKHByb3BzKSB7XG4gICAgICAgIHJldHVybiBTdGVwKF8uZXh0ZW5kKHByb3BzLCB7XG4gICAgICAgICAgICBpZDogJ2NvbmdyYXRzJyxcbiAgICAgICAgICAgIHRpdGxlOiBcIkNvbmdyYXR1bGF0aW9ucyFcIixcbiAgICAgICAgICAgIHNob3dCYWNvbjogdHJ1ZSxcbiAgICAgICAgICAgIGJvZHk6IFJlYWN0LkRPTS5kaXYobnVsbCwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLnAobnVsbCwgXCJUaGF0IHdhcyBzb21lIGF3ZXNvbWUgU2NpZW5jZSB5b3UgZGlkIHRoZXJlISAgWW91J3ZlIGZpbmlzaGVkIGFsbCBvZiBteSBleHBlcmltZW50cy4gWW91IGVhcm5lZCB0aGUgXCIsIFJlYWN0LkRPTS5zdHJvbmcobnVsbCwgXCJCYWNvbiBCYWRnZVwiKSwgXCIgZm9yIHlvdXIgd29yay5cIiksIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5wKHtjbGFzc05hbWU6IFwiYmFjb24tYmFkZ2UtY29udGFpbmVyXCJ9LCBSZWFjdC5ET00uaW1nKHtjbGFzc05hbWU6IFwiYmFjb24tYmFkZ2VcIiwgc3JjOiBcIi9pbWFnZXMvYmFjb24ucG5nXCJ9KSlcbiAgICAgICAgICAgICksXG4gICAgICAgICAgICBuZXh0OiBcIldoYXQncyBuZXh0P1wiXG4gICAgICAgIH0pKTtcbiAgICB9LFxuXG4gICAgZnVuY3Rpb24gKHByb3BzKSB7XG4gICAgICAgIHJldHVybiBTdGVwKF8uZXh0ZW5kKHByb3BzLCB7XG4gICAgICAgICAgICBpZDogJ25leHQnLFxuICAgICAgICAgICAgdGl0bGU6IFwiRG8gbW9yZSBzY2llbmNlIVwiLFxuICAgICAgICAgICAgc2hvd0JhY29uOiB0cnVlLFxuICAgICAgICAgICAgYm9keTogUmVhY3QuRE9NLmRpdihudWxsLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00ucChudWxsLCBcIklmIHlvdSB3YW50IHRvIGxlYXJuIG1vcmUgc2NpZW5jZSwgY2hlY2sgb3V0IHRoZSBcIiwgUmVhY3QuRE9NLmEoe2hyZWY6IFwiLy9raGFuYWNhZGVteS5vcmcvc2NpZW5jZS9waHlzaWNzXCJ9LCBcInBoeXNpY3NcIiksIFwiIHNlY3Rpb24gb24gS2hhbiBBY2FkZW15LiAgSGF2ZSBmdW4hXCIpXG4gICAgICAgICAgICApLFxuICAgICAgICB9KSk7XG4gICAgfSxcbl07XG4iLCJcbm1vZHVsZS5leHBvcnRzID0gQmFzZTtcblxuZnVuY3Rpb24gQmFzZShjb250YWluZXIsIG9wdGlvbnMsIGJhY2tncm91bmQsIGRpc2FibGVCb3VuZHMpIHtcbiAgICB0aGlzLmNvbnRhaW5lciA9IGNvbnRhaW5lclxuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnNcbiAgICAkKCcuYmFja2dyb3VuZCcpLmF0dHIoJ3NyYycsIGJhY2tncm91bmQpO1xuICAgIHRoaXMuX3NldHVwV29ybGQoZGlzYWJsZUJvdW5kcylcbiAgICB0aGlzLnNldHVwKGNvbnRhaW5lcilcbiAgICAvLyBpbml0IHN0dWZmXG59XG5cbkJhc2UuZXh0ZW5kID0gZnVuY3Rpb24gKHN1YiwgcHJvdG8pIHtcbiAgICBzdWIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShCYXNlLnByb3RvdHlwZSlcbiAgICBzdWIuY29uc3RydWN0b3IgPSBzdWJcbiAgICBmb3IgKHZhciBuYW1lIGluIHByb3RvKSB7XG4gICAgICAgIGlmIChwcm90by5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xuICAgICAgICAgICAgc3ViLnByb3RvdHlwZVtuYW1lXSA9IHByb3RvW25hbWVdXG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHN1YlxufVxuXG5CYXNlLnByb3RvdHlwZSA9IHtcblxuICAgIF9zZXR1cFdvcmxkOiBmdW5jdGlvbiAoZGlzYWJsZUJvdW5kcykge1xuICAgICAgICB2YXIgd29ybGQgPSB0aGlzLndvcmxkID0gUGh5c2ljcygpXG4gICAgICAgIC8vIGNyZWF0ZSBhIHJlbmRlcmVyXG4gICAgICAgIHRoaXMucmVuZGVyZXIgPSBQaHlzaWNzLnJlbmRlcmVyKCdjYW52YXMnLCB7XG4gICAgICAgICAgICBlbDogdGhpcy5jb250YWluZXIsXG4gICAgICAgICAgICB3aWR0aDogdGhpcy5vcHRpb25zLndpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0OiB0aGlzLm9wdGlvbnMuaGVpZ2h0XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLndvcmxkLmFkZCh0aGlzLnJlbmRlcmVyKTtcblxuICAgICAgICAvLyBhZGQgdGhpbmdzIHRvIHRoZSB3b3JsZFxuICAgICAgICB0aGlzLndvcmxkLmFkZChbXG4gICAgICAgICAgICBQaHlzaWNzLmJlaGF2aW9yKCdpbnRlcmFjdGl2ZS1mb3JjZScsIHsgZWw6IHRoaXMucmVuZGVyZXIuZWwgfSksXG4gICAgICAgICAgICBQaHlzaWNzLmJlaGF2aW9yKCdib2R5LWltcHVsc2UtcmVzcG9uc2UnKSxcbiAgICAgICAgICAgIFBoeXNpY3MuYmVoYXZpb3IoJ2JvZHktY29sbGlzaW9uLWRldGVjdGlvbicpLFxuICAgICAgICAgICAgUGh5c2ljcy5iZWhhdmlvcignc3dlZXAtcHJ1bmUnKSxcbiAgICAgICAgXSk7XG5cbiAgICAgICAgaWYgKCFkaXNhYmxlQm91bmRzKSB7XG4gICAgICAgICAgICB0aGlzLndvcmxkLmFkZChQaHlzaWNzLmJlaGF2aW9yKCdlZGdlLWNvbGxpc2lvbi1kZXRlY3Rpb24nLCB7XG4gICAgICAgICAgICAgICAgYWFiYjogUGh5c2ljcy5hYWJiKDAsIDAsIHRoaXMub3B0aW9ucy53aWR0aCwgdGhpcy5vcHRpb25zLmhlaWdodCksXG4gICAgICAgICAgICAgICAgcmVzdGl0dXRpb246IDAuMixcbiAgICAgICAgICAgICAgICBjb2Y6IDAuOFxuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG5cblxuICAgICAgICAvLyByZW5kZXIgb24gZWFjaCBzdGVwXG4gICAgICAgIHdvcmxkLm9uKCdzdGVwJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgd29ybGQucmVuZGVyKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIHN1YnNjcmliZSB0byB0aWNrZXIgdG8gYWR2YW5jZSB0aGUgc2ltdWxhdGlvblxuICAgICAgICBQaHlzaWNzLnV0aWwudGlja2VyLm9uKGZ1bmN0aW9uKCB0aW1lICkge1xuICAgICAgICAgICAgd29ybGQuc3RlcCggdGltZSApO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgcnVuOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIHN0YXJ0IHRoZSB0aWNrZXJcbiAgICAgICAgUGh5c2ljcy51dGlsLnRpY2tlci5zdGFydCgpO1xuICAgIH1cbn1cbiIsIlxubW9kdWxlLmV4cG9ydHMgPSBDYW5HcmFwaFxuXG5mdW5jdGlvbiBDYW5HcmFwaChvcHRpb25zKSB7XG4gICAgdGhpcy5vID0gXy5leHRlbmQoe1xuICAgICAgICBtYXg6IDUwMCxcbiAgICAgICAgbWFyZ2luOiAxMCxcbiAgICAgICAgbWluc2NhbGU6IDEsXG4gICAgICAgIHRpY2tzY2FsZTogNTBcbiAgICB9LCBvcHRpb25zKVxuICAgIHRoaXMucG9pbnRzID0gW11cbiAgICB0aGlzLnByZXZzY2FsZSA9IHRoaXMuby5taW5zY2FsZVxuICAgIHRoaXMub2ZmID0gMFxufVxuXG5DYW5HcmFwaC5wcm90b3R5cGUgPSB7XG4gICAgZHJhdzogZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoIXRoaXMucG9pbnRzLmxlbmd0aCkgcmV0dXJuXG4gICAgICAgIHZhciBjdHggPSB0aGlzLm8ubm9kZS5nZXRDb250ZXh0KCcyZCcpXG4gICAgICAgIHZhciB3aWR0aCA9IHRoaXMuby53aWR0aCAtIHRoaXMuby5tYXJnaW4qMlxuICAgICAgICB2YXIgaGVpZ2h0ID0gdGhpcy5vLmhlaWdodCAtIHRoaXMuby5tYXJnaW4qMlxuICAgICAgICB2YXIgdG9wID0gdGhpcy5vLnRvcCArIHRoaXMuby5tYXJnaW5cbiAgICAgICAgdmFyIGxlZnQgPSB0aGlzLm8ubGVmdCArIHRoaXMuby5tYXJnaW5cblxuICAgICAgICB2YXIgZHggPSB3aWR0aCAvIHRoaXMucG9pbnRzLmxlbmd0aFxuICAgICAgICB2YXIgbWluID0gTWF0aC5taW4uYXBwbHkoTWF0aCwgdGhpcy5wb2ludHMpXG4gICAgICAgIHZhciBtYXggPSBNYXRoLm1heC5hcHBseShNYXRoLCB0aGlzLnBvaW50cylcbiAgICAgICAgdmFyIHNjYWxlID0gbWF4IC0gbWluXG4gICAgICAgIGlmIChzY2FsZSA8IHRoaXMuby5taW5zY2FsZSkge1xuICAgICAgICAgICAgc2NhbGUgPSB0aGlzLm8ubWluc2NhbGVcbiAgICAgICAgfVxuICAgICAgICBpZiAoc2NhbGUgPCB0aGlzLnByZXZzY2FsZSouOTkpIHtcbiAgICAgICAgICAgIHNjYWxlID0gdGhpcy5wcmV2c2NhbGUqLjk5XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGR5ID0gaGVpZ2h0IC8gc2NhbGVcbiAgICAgICAgaWYgKG1heCAtIG1pbiA8IHNjYWxlKSB7XG4gICAgICAgICAgICB2YXIgZCA9IHNjYWxlIC0gKG1heC1taW4pXG4gICAgICAgICAgICBtaW4gLT0gZC8yXG4gICAgICAgICAgICBtYXggKz0gZC8yXG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnByZXZzY2FsZSA9IHNjYWxlXG5cbiAgICAgICAgLy8gZHJhdyB4IGF4aXNcbiAgICAgICAgaWYgKG1pbiA8PSAwICYmIG1heCA+PSAwKSB7XG4gICAgICAgICAgICBjdHguYmVnaW5QYXRoKClcbiAgICAgICAgICAgIGN0eC5tb3ZlVG8obGVmdCwgdG9wICsgaGVpZ2h0IC0gKC1taW4pKmR5KVxuICAgICAgICAgICAgY3R4LmxpbmVUbyhsZWZ0ICsgd2lkdGgsIHRvcCArIGhlaWdodCAtICgtbWluKSpkeSlcbiAgICAgICAgICAgIGN0eC5zdHJva2VTdHlsZSA9ICcjY2NjJ1xuICAgICAgICAgICAgY3R4LnN0cm9rZSgpXG4gICAgICAgIH1cblxuICAgICAgICAvLyBkcmF3IHRpY2tzXG4gICAgICAgIHZhciB0aWNrdG9wID0gdG9wICsgaGVpZ2h0IC0gKC1taW4pKmR5IC0gNVxuICAgICAgICBpZiAodGlja3RvcCA8IHRvcCkge1xuICAgICAgICAgICAgdGlja3RvcCA9IHRvcFxuICAgICAgICB9XG4gICAgICAgIGlmICh0aWNrdG9wICsgMTAgPiB0b3AgKyBoZWlnaHQpIHtcbiAgICAgICAgICAgIHRpY2t0b3AgPSB0b3AgKyBoZWlnaHQgLSAxMFxuICAgICAgICB9XG4gICAgICAgIGZvciAodmFyIGk9dGhpcy5vZmY7IGk8dGhpcy5wb2ludHMubGVuZ3RoOyBpKz10aGlzLm8udGlja3NjYWxlKSB7XG4gICAgICAgICAgICBjdHguYmVnaW5QYXRoKClcbiAgICAgICAgICAgIGN0eC5tb3ZlVG8obGVmdCArIGkqZHgsIHRpY2t0b3ApXG4gICAgICAgICAgICBjdHgubGluZVRvKGxlZnQgKyBpKmR4LCB0aWNrdG9wICsgMTApXG4gICAgICAgICAgICBjdHguc3Ryb2tlU3R5bGUgPSAnI2NjYydcbiAgICAgICAgICAgIGN0eC5zdHJva2UoKVxuICAgICAgICB9XG5cblxuICAgICAgICAvLyBkcmF3IGxpbmVcbiAgICAgICAgY3R4LmJlZ2luUGF0aCgpXG4gICAgICAgIHRoaXMucG9pbnRzLm1hcChmdW5jdGlvbiAocCwgeCkge1xuICAgICAgICAgICAgY3R4LmxpbmVUbyhsZWZ0ICsgeCAqIGR4LCB0b3AgKyBoZWlnaHQgLSAocCAtIG1pbikgKiBkeSlcbiAgICAgICAgfSlcbiAgICAgICAgY3R4LnN0cm9rZVN0eWxlID0gJ2JsdWUnXG4gICAgICAgIGN0eC5saW5lV2lkdGggPSAxXG4gICAgICAgIGN0eC5zdHJva2UoKVxuXG4gICAgICAgIC8vIGRyYXcgdGl0bGVcbiAgICAgICAgdmFyIHRoID0gMTBcbiAgICAgICAgY3R4LmZvbnQgPSB0aCArICdwdCBBcmlhbCdcbiAgICAgICAgdmFyIHR3ID0gY3R4Lm1lYXN1cmVUZXh0KHRoaXMuby50aXRsZSkud2lkdGhcbiAgICAgICAgY3R4LmZpbGxTdHlsZSA9ICdibGFjaydcbiAgICAgICAgY3R4Lmdsb2JhbEFscGhhID0gMVxuICAgICAgICBjdHguY2xlYXJSZWN0KGxlZnQsIHRvcCwgdHcsIHRoICsgNSlcbiAgICAgICAgY3R4LmZpbGxUZXh0KHRoaXMuby50aXRsZSwgbGVmdCwgdG9wICsgdGgpXG5cblxuICAgICAgICAvLyBkcmF3IHJlY3RcbiAgICAgICAgY3R4LnN0cm9rZVN0eWxlID0gJyM2NjYnXG4gICAgICAgIGN0eC5yZWN0KHRoaXMuby5sZWZ0ICsgdGhpcy5vLm1hcmdpbi8yLHRoaXMuby50b3AgKyB0aGlzLm8ubWFyZ2luLzIsdGhpcy5vLndpZHRoIC0gdGhpcy5vLm1hcmdpbix0aGlzLm8uaGVpZ2h0IC0gdGhpcy5vLm1hcmdpbilcbiAgICAgICAgY3R4LnN0cm9rZSgpXG4gICAgfSxcbiAgICBhZGRQb2ludDogZnVuY3Rpb24gKHBvaW50KSB7XG4gICAgICAgIHRoaXMucG9pbnRzLnB1c2gocG9pbnQpXG4gICAgICAgIGlmICh0aGlzLnBvaW50cy5sZW5ndGggPiB0aGlzLm8ubWF4KSB7XG4gICAgICAgICAgICB0aGlzLm9mZiAtPSB0aGlzLnBvaW50cy5sZW5ndGggLSB0aGlzLm8ubWF4XG4gICAgICAgICAgICB0aGlzLm9mZiAlPSB0aGlzLm8udGlja3NjYWxlXG4gICAgICAgICAgICB0aGlzLnBvaW50cyA9IHRoaXMucG9pbnRzLnNsaWNlKC10aGlzLm8ubWF4KVxuICAgICAgICB9XG4gICAgfVxufVxuXG4iLCJtb2R1bGUuZXhwb3J0cyA9IENhdmVEcmF3O1xuXG5mdW5jdGlvbiBDYXZlRHJhdyhjb250YWluZXIsIHdpZHRoLCBoZWlnaHQpIHtcbiAgICB0aGlzLmNvbnRhaW5lciA9ICQoY29udGFpbmVyKVxuICAgIHRoaXMuY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJylcbiAgICB0aGlzLmNhbnZhcy53aWR0aCA9IHdpZHRoXG4gICAgdGhpcy5jYW52YXMuaGVpZ2h0ID0gaGVpZ2h0XG4gICAgY29udGFpbmVyLmFwcGVuZCh0aGlzLmNhbnZhcylcbn1cblxuQ2F2ZURyYXcucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbihmbikge1xuICAgIGRlZmluZVBhdGgodGhpcy5jYW52YXMsIGZuKVxuICAgIGRyYXdQYXRoKHRoaXMuY2FudmFzKVxufVxuXG5DYXZlRHJhdy5wcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgY29udGV4dCA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gICAgY29udGV4dC5jbGVhclJlY3QoMCwgMCwgdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodClcbn1cblxuZnVuY3Rpb24gZGVmaW5lUGF0aChjYW52YXMsIGZuKSB7XG4gICAgdmFyIGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICB2YXIgeG1heCA9IGNhbnZhcy53aWR0aFxuICAgIHZhciB5bWF4ID0gY2FudmFzLmhlaWdodFxuXG4gICAgY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICBjb250ZXh0Lm1vdmVUbygwLCBmbigwKSk7XG4gICAgZm9yICh2YXIgeCA9IDA7IHggPCB4bWF4IDsgeCsrKSB7XG4gICAgICAgIGNvbnRleHQubGluZVRvKHgsIHltYXggLSBmbih4KSlcbiAgICB9XG5cbiAgICBjb250ZXh0LmxpbmVUbyh4bWF4LCB5bWF4KVxuICAgIGNvbnRleHQubGluZVRvKDAsIHltYXgpXG4gICAgY29udGV4dC5jbG9zZVBhdGgoKTtcbn1cblxuZnVuY3Rpb24gZHJhd1BhdGgoY2FudmFzKSB7XG4gICAgdmFyIGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICBjb250ZXh0LmxpbmVXaWR0aCA9IDU7XG4gICAgLy8gY29udGV4dC5maWxsU3R5bGUgPSAnIzhFRDZGRic7XG4gICAgdmFyIGdyZCA9IGNvbnRleHQuY3JlYXRlTGluZWFyR3JhZGllbnQoY2FudmFzLndpZHRoIC8gMiwgMCwgY2FudmFzLndpZHRoIC8gMiwgY2FudmFzLmhlaWdodClcbiAgICBncmQuYWRkQ29sb3JTdG9wKDAsICcjMDAwJylcbiAgICBncmQuYWRkQ29sb3JTdG9wKDEsICcjNzc3JylcbiAgICBjb250ZXh0LmZpbGxTdHlsZSA9IGdyZDtcbiAgICAvLyBjb250ZXh0LmZpbGxTdHlsZSA9ICcjMzMzJztcbiAgICBjb250ZXh0LmZpbGwoKTtcbiAgICAvLyBjb250ZXh0LnN0cm9rZVN0eWxlID0gJ2JsdWUnO1xuICAgIC8vIGNvbnRleHQuc3Ryb2tlKCk7XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGNoZWNrQ29sbGlzaW9uO1xuXG5mdW5jdGlvbiBjaGVja0NvbGxpc2lvbihib2R5QSwgYm9keUIpIHtcbiAgICB2YXIgc3VwcG9ydEZuU3RhY2sgPSBbXTtcblxuICAgIC8qXG4gICAgICogZ2V0U3VwcG9ydEZuKCBib2R5QSwgYm9keUIgKSAtPiBGdW5jdGlvblxuICAgICAqIC0gYm9keUEgKE9iamVjdCk6IEZpcnN0IGJvZHlcbiAgICAgKiAtIGJvZHlCIChPYmplY3QpOiBTZWNvbmQgYm9keVxuICAgICAqICsgKEZ1bmN0aW9uKTogVGhlIHN1cHBvcnQgZnVuY3Rpb25cbiAgICAgKlxuICAgICAqIEdldCBhIGdlbmVyYWwgc3VwcG9ydCBmdW5jdGlvbiBmb3IgdXNlIHdpdGggR0pLIGFsZ29yaXRobVxuICAgICAqL1xuICAgIHZhciBnZXRTdXBwb3J0Rm4gPSBmdW5jdGlvbiBnZXRTdXBwb3J0Rm4oIGJvZHlBLCBib2R5QiApe1xuXG4gICAgICAgIHZhciBoYXNoID0gUGh5c2ljcy51dGlsLnBhaXJIYXNoKCBib2R5QS51aWQsIGJvZHlCLnVpZCApXG4gICAgICAgIHZhciBmbiA9IHN1cHBvcnRGblN0YWNrWyBoYXNoIF1cblxuICAgICAgICBpZiAoICFmbiApe1xuICAgICAgICAgICAgZm4gPSBzdXBwb3J0Rm5TdGFja1sgaGFzaCBdID0gZnVuY3Rpb24oIHNlYXJjaERpciApe1xuXG4gICAgICAgICAgICAgICAgdmFyIHNjcmF0Y2ggPSBQaHlzaWNzLnNjcmF0Y2hwYWQoKVxuICAgICAgICAgICAgICAgIHZhciB0QSA9IGZuLnRBXG4gICAgICAgICAgICAgICAgdmFyIHRCID0gZm4udEJcbiAgICAgICAgICAgICAgICB2YXIgdkEgPSBzY3JhdGNoLnZlY3RvcigpXG4gICAgICAgICAgICAgICAgdmFyIHZCID0gc2NyYXRjaC52ZWN0b3IoKVxuICAgICAgICAgICAgICAgIHZhciBtYXJnaW5BID0gZm4ubWFyZ2luQVxuICAgICAgICAgICAgICAgIHZhciBtYXJnaW5CID0gZm4ubWFyZ2luQlxuICAgICAgICAgICAgICAgIDtcblxuICAgICAgICAgICAgICAgIGlmICggZm4udXNlQ29yZSApe1xuICAgICAgICAgICAgICAgICAgICB2QSA9IGJvZHlBLmdlb21ldHJ5LmdldEZhcnRoZXN0Q29yZVBvaW50KCBzZWFyY2hEaXIucm90YXRlSW52KCB0QSApLCB2QSwgbWFyZ2luQSApLnRyYW5zZm9ybSggdEEgKTtcbiAgICAgICAgICAgICAgICAgICAgdkIgPSBib2R5Qi5nZW9tZXRyeS5nZXRGYXJ0aGVzdENvcmVQb2ludCggc2VhcmNoRGlyLnJvdGF0ZSggdEEgKS5yb3RhdGVJbnYoIHRCICkubmVnYXRlKCksIHZCLCBtYXJnaW5CICkudHJhbnNmb3JtKCB0QiApO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHZBID0gYm9keUEuZ2VvbWV0cnkuZ2V0RmFydGhlc3RIdWxsUG9pbnQoIHNlYXJjaERpci5yb3RhdGVJbnYoIHRBICksIHZBICkudHJhbnNmb3JtKCB0QSApO1xuICAgICAgICAgICAgICAgICAgICB2QiA9IGJvZHlCLmdlb21ldHJ5LmdldEZhcnRoZXN0SHVsbFBvaW50KCBzZWFyY2hEaXIucm90YXRlKCB0QSApLnJvdGF0ZUludiggdEIgKS5uZWdhdGUoKSwgdkIgKS50cmFuc2Zvcm0oIHRCICk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgc2VhcmNoRGlyLm5lZ2F0ZSgpLnJvdGF0ZSggdEIgKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiBzY3JhdGNoLmRvbmUoe1xuICAgICAgICAgICAgICAgICAgICBhOiB2QS52YWx1ZXMoKSxcbiAgICAgICAgICAgICAgICAgICAgYjogdkIudmFsdWVzKCksXG4gICAgICAgICAgICAgICAgICAgIHB0OiB2QS52c3ViKCB2QiApLnZhbHVlcygpXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBmbi50QSA9IFBoeXNpY3MudHJhbnNmb3JtKCk7XG4gICAgICAgICAgICBmbi50QiA9IFBoeXNpY3MudHJhbnNmb3JtKCk7XG4gICAgICAgIH1cblxuICAgICAgICBmbi51c2VDb3JlID0gZmFsc2U7XG4gICAgICAgIGZuLm1hcmdpbiA9IDA7XG4gICAgICAgIGZuLnRBLnNldFRyYW5zbGF0aW9uKCBib2R5QS5zdGF0ZS5wb3MgKS5zZXRSb3RhdGlvbiggYm9keUEuc3RhdGUuYW5ndWxhci5wb3MgKTtcbiAgICAgICAgZm4udEIuc2V0VHJhbnNsYXRpb24oIGJvZHlCLnN0YXRlLnBvcyApLnNldFJvdGF0aW9uKCBib2R5Qi5zdGF0ZS5hbmd1bGFyLnBvcyApO1xuICAgICAgICBmbi5ib2R5QSA9IGJvZHlBO1xuICAgICAgICBmbi5ib2R5QiA9IGJvZHlCO1xuXG4gICAgICAgIHJldHVybiBmbjtcbiAgICB9O1xuXG4gICAgLypcbiAgICAgKiBjaGVja0dKSyggYm9keUEsIGJvZHlCICkgLT4gT2JqZWN0XG4gICAgICogLSBib2R5QSAoT2JqZWN0KTogRmlyc3QgYm9keVxuICAgICAqIC0gYm9keUIgKE9iamVjdCk6IFNlY29uZCBib2R5XG4gICAgICogKyAoT2JqZWN0KTogQ29sbGlzaW9uIHJlc3VsdFxuICAgICAqXG4gICAgICogVXNlIEdKSyBhbGdvcml0aG0gdG8gY2hlY2sgYXJiaXRyYXJ5IGJvZGllcyBmb3IgY29sbGlzaW9uc1xuICAgICAqL1xuICAgIHZhciBjaGVja0dKSyA9IGZ1bmN0aW9uIGNoZWNrR0pLKCBib2R5QSwgYm9keUIgKXtcblxuICAgICAgICB2YXIgc2NyYXRjaCA9IFBoeXNpY3Muc2NyYXRjaHBhZCgpXG4gICAgICAgIHZhciBkID0gc2NyYXRjaC52ZWN0b3IoKVxuICAgICAgICB2YXIgdG1wID0gc2NyYXRjaC52ZWN0b3IoKVxuICAgICAgICAgICAgLG92ZXJsYXBcbiAgICAgICAgdmFyIHJlc3VsdFxuICAgICAgICB2YXIgc3VwcG9ydFxuICAgICAgICB2YXIgY29sbGlzaW9uID0gZmFsc2VcbiAgICAgICAgdmFyIGFhYmJBID0gYm9keUEuYWFiYigpXG4gICAgICAgICAgICAsZGltQSA9IE1hdGgubWluKCBhYWJiQS5odywgYWFiYkEuaGggKVxuICAgICAgICB2YXIgYWFiYkIgPSBib2R5Qi5hYWJiKClcbiAgICAgICAgdmFyIGRpbUIgPSBNYXRoLm1pbiggYWFiYkIuaHcsIGFhYmJCLmhoIClcbiAgICAgICAgO1xuXG4gICAgICAgIC8vIGp1c3QgY2hlY2sgdGhlIG92ZXJsYXAgZmlyc3RcbiAgICAgICAgc3VwcG9ydCA9IGdldFN1cHBvcnRGbiggYm9keUEsIGJvZHlCICk7XG4gICAgICAgIGQuY2xvbmUoIGJvZHlBLnN0YXRlLnBvcyApLnZzdWIoIGJvZHlCLnN0YXRlLnBvcyApO1xuICAgICAgICByZXN1bHQgPSBQaHlzaWNzLmdqayhzdXBwb3J0LCBkLCB0cnVlKTtcblxuICAgICAgICBpZiAoIHJlc3VsdC5vdmVybGFwICl7XG5cbiAgICAgICAgICAgIC8vIHRoZXJlIGlzIGEgY29sbGlzaW9uLiBsZXQncyBkbyBtb3JlIHdvcmsuXG4gICAgICAgICAgICBjb2xsaXNpb24gPSB7XG4gICAgICAgICAgICAgICAgYm9keUE6IGJvZHlBLFxuICAgICAgICAgICAgICAgIGJvZHlCOiBib2R5QlxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgLy8gZmlyc3QgZ2V0IHRoZSBtaW4gZGlzdGFuY2Ugb2YgYmV0d2VlbiBjb3JlIG9iamVjdHNcbiAgICAgICAgICAgIHN1cHBvcnQudXNlQ29yZSA9IHRydWU7XG4gICAgICAgICAgICBzdXBwb3J0Lm1hcmdpbkEgPSAwO1xuICAgICAgICAgICAgc3VwcG9ydC5tYXJnaW5CID0gMDtcblxuICAgICAgICAgICAgd2hpbGUgKCByZXN1bHQub3ZlcmxhcCAmJiAoc3VwcG9ydC5tYXJnaW5BIDwgZGltQSB8fCBzdXBwb3J0Lm1hcmdpbkIgPCBkaW1CKSApe1xuICAgICAgICAgICAgICAgIGlmICggc3VwcG9ydC5tYXJnaW5BIDwgZGltQSApe1xuICAgICAgICAgICAgICAgICAgICBzdXBwb3J0Lm1hcmdpbkEgKz0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKCBzdXBwb3J0Lm1hcmdpbkIgPCBkaW1CICl7XG4gICAgICAgICAgICAgICAgICAgIHN1cHBvcnQubWFyZ2luQiArPSAxO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IFBoeXNpY3MuZ2prKHN1cHBvcnQsIGQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIHJlc3VsdC5vdmVybGFwIHx8IHJlc3VsdC5tYXhJdGVyYXRpb25zUmVhY2hlZCApe1xuICAgICAgICAgICAgICAgIC8vIFRoaXMgaW1wbGVtZW50YXRpb24gY2FuJ3QgZGVhbCB3aXRoIGEgY29yZSBvdmVybGFwIHlldFxuICAgICAgICAgICAgICAgIHJldHVybiBzY3JhdGNoLmRvbmUoZmFsc2UpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBjYWxjIG92ZXJsYXBcbiAgICAgICAgICAgIG92ZXJsYXAgPSBNYXRoLm1heCgwLCAoc3VwcG9ydC5tYXJnaW5BICsgc3VwcG9ydC5tYXJnaW5CKSAtIHJlc3VsdC5kaXN0YW5jZSk7XG4gICAgICAgICAgICBjb2xsaXNpb24ub3ZlcmxhcCA9IG92ZXJsYXA7XG4gICAgICAgICAgICAvLyBAVE9ETzogZm9yIG5vdywganVzdCBsZXQgdGhlIG5vcm1hbCBiZSB0aGUgbXR2XG4gICAgICAgICAgICBjb2xsaXNpb24ubm9ybSA9IGQuY2xvbmUoIHJlc3VsdC5jbG9zZXN0LmIgKS52c3ViKCB0bXAuY2xvbmUoIHJlc3VsdC5jbG9zZXN0LmEgKSApLm5vcm1hbGl6ZSgpLnZhbHVlcygpO1xuICAgICAgICAgICAgY29sbGlzaW9uLm10diA9IGQubXVsdCggb3ZlcmxhcCApLnZhbHVlcygpO1xuICAgICAgICAgICAgLy8gZ2V0IGEgY29ycmVzcG9uZGluZyBodWxsIHBvaW50IGZvciBvbmUgb2YgdGhlIGNvcmUgcG9pbnRzLi4gcmVsYXRpdmUgdG8gYm9keSBBXG4gICAgICAgICAgICBjb2xsaXNpb24ucG9zID0gZC5jbG9uZSggY29sbGlzaW9uLm5vcm0gKS5tdWx0KCBzdXBwb3J0Lm1hcmdpbiApLnZhZGQoIHRtcC5jbG9uZSggcmVzdWx0LmNsb3Nlc3QuYSApICkudnN1YiggYm9keUEuc3RhdGUucG9zICkudmFsdWVzKCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gc2NyYXRjaC5kb25lKCBjb2xsaXNpb24gKTtcbiAgICB9O1xuXG4gICAgLypcbiAgICAgKiBjaGVja0NpcmNsZXMoIGJvZHlBLCBib2R5QiApIC0+IE9iamVjdFxuICAgICAqIC0gYm9keUEgKE9iamVjdCk6IEZpcnN0IGJvZHlcbiAgICAgKiAtIGJvZHlCIChPYmplY3QpOiBTZWNvbmQgYm9keVxuICAgICAqICsgKE9iamVjdCk6IENvbGxpc2lvbiByZXN1bHRcbiAgICAgKlxuICAgICAqIENoZWNrIHR3byBjaXJjbGVzIGZvciBjb2xsaXNpb25zLlxuICAgICAqL1xuICAgIHZhciBjaGVja0NpcmNsZXMgPSBmdW5jdGlvbiBjaGVja0NpcmNsZXMoIGJvZHlBLCBib2R5QiApe1xuXG4gICAgICAgIHZhciBzY3JhdGNoID0gUGh5c2ljcy5zY3JhdGNocGFkKClcbiAgICAgICAgdmFyIGQgPSBzY3JhdGNoLnZlY3RvcigpXG4gICAgICAgIHZhciB0bXAgPSBzY3JhdGNoLnZlY3RvcigpXG4gICAgICAgIHZhciBvdmVybGFwXG4gICAgICAgIHZhciBjb2xsaXNpb24gPSBmYWxzZVxuXG4gICAgICAgIGQuY2xvbmUoIGJvZHlCLnN0YXRlLnBvcyApLnZzdWIoIGJvZHlBLnN0YXRlLnBvcyApO1xuICAgICAgICBvdmVybGFwID0gZC5ub3JtKCkgLSAoYm9keUEuZ2VvbWV0cnkucmFkaXVzICsgYm9keUIuZ2VvbWV0cnkucmFkaXVzKTtcblxuICAgICAgICAvLyBobW0uLi4gdGhleSBvdmVybGFwIGV4YWN0bHkuLi4gY2hvb3NlIGEgZGlyZWN0aW9uXG4gICAgICAgIGlmICggZC5lcXVhbHMoIFBoeXNpY3MudmVjdG9yLnplcm8gKSApe1xuXG4gICAgICAgICAgICBkLnNldCggMSwgMCApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gaWYgKCBvdmVybGFwID4gMCApe1xuICAgICAgICAvLyAgICAgLy8gY2hlY2sgdGhlIGZ1dHVyZVxuICAgICAgICAvLyAgICAgZC52YWRkKCB0bXAuY2xvbmUoYm9keUIuc3RhdGUudmVsKS5tdWx0KCBkdCApICkudnN1YiggdG1wLmNsb25lKGJvZHlBLnN0YXRlLnZlbCkubXVsdCggZHQgKSApO1xuICAgICAgICAvLyAgICAgb3ZlcmxhcCA9IGQubm9ybSgpIC0gKGJvZHlBLmdlb21ldHJ5LnJhZGl1cyArIGJvZHlCLmdlb21ldHJ5LnJhZGl1cyk7XG4gICAgICAgIC8vIH1cblxuICAgICAgICBpZiAoIG92ZXJsYXAgPD0gMCApe1xuXG4gICAgICAgICAgICBjb2xsaXNpb24gPSB7XG4gICAgICAgICAgICAgICAgYm9keUE6IGJvZHlBLFxuICAgICAgICAgICAgICAgIGJvZHlCOiBib2R5QixcbiAgICAgICAgICAgICAgICBub3JtOiBkLm5vcm1hbGl6ZSgpLnZhbHVlcygpLFxuICAgICAgICAgICAgICAgIG10djogZC5tdWx0KCAtb3ZlcmxhcCApLnZhbHVlcygpLFxuICAgICAgICAgICAgICAgIHBvczogZC5ub3JtYWxpemUoKS5tdWx0KCBib2R5QS5nZW9tZXRyeS5yYWRpdXMgKS52YWx1ZXMoKSxcbiAgICAgICAgICAgICAgICBvdmVybGFwOiAtb3ZlcmxhcFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBzY3JhdGNoLmRvbmUoIGNvbGxpc2lvbiApO1xuICAgIH07XG5cbiAgICAvKlxuICAgICAqIGNoZWNrUGFpciggYm9keUEsIGJvZHlCICkgLT4gT2JqZWN0XG4gICAgICogLSBib2R5QSAoT2JqZWN0KTogRmlyc3QgYm9keVxuICAgICAqIC0gYm9keUIgKE9iamVjdCk6IFNlY29uZCBib2R5XG4gICAgICogKyAoT2JqZWN0KTogQ29sbGlzaW9uIHJlc3VsdFxuICAgICAqXG4gICAgICogQ2hlY2sgYSBwYWlyIGZvciBjb2xsaXNpb25zXG4gICAgICovXG4gICAgdmFyIGNoZWNrUGFpciA9IGZ1bmN0aW9uIGNoZWNrUGFpciggYm9keUEsIGJvZHlCICl7XG5cbiAgICAgICAgLy8gZmlsdGVyIG91dCBib2RpZXMgdGhhdCBkb24ndCBjb2xsaWRlIHdpdGggZWFjaCBvdGhlclxuICAgICAgICBpZiAoXG4gICAgICAgICAgICAoIGJvZHlBLnRyZWF0bWVudCA9PT0gJ3N0YXRpYycgfHwgYm9keUEudHJlYXRtZW50ID09PSAna2luZW1hdGljJyApICYmXG4gICAgICAgICAgICAgICAgKCBib2R5Qi50cmVhdG1lbnQgPT09ICdzdGF0aWMnIHx8IGJvZHlCLnRyZWF0bWVudCA9PT0gJ2tpbmVtYXRpYycgKVxuICAgICAgICApe1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCBib2R5QS5nZW9tZXRyeS5uYW1lID09PSAnY2lyY2xlJyAmJiBib2R5Qi5nZW9tZXRyeS5uYW1lID09PSAnY2lyY2xlJyApe1xuXG4gICAgICAgICAgICByZXR1cm4gY2hlY2tDaXJjbGVzKCBib2R5QSwgYm9keUIgKTtcblxuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICByZXR1cm4gY2hlY2tHSksoIGJvZHlBLCBib2R5QiApO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBjaGVja1BhaXIoYm9keUEsIGJvZHlCKVxufVxuXG4iLCIvKiogQGpzeCBSZWFjdC5ET00gKi9cblxudmFyIERhdGFDaGVja2VyID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnRGF0YUNoZWNrZXInLFxuICAgIHByb3BUeXBlczoge1xuICAgICAgICBpbml0aWFsVGV4dDogUmVhY3QuUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICAgICAgICBpbml0aWFsSHlwb3RoZXNpczogUmVhY3QuUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICAgICAgICBwb3NzaWJsZUh5cG90aGVzZXM6IFJlYWN0LlByb3BUeXBlcy5hcnJheU9mKFJlYWN0LlByb3BUeXBlcy5zaGFwZSh7XG4gICAgICAgICAgICBuYW1lOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gICAgICAgICAgICBidXR0b25UZXh0OiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsIC8vIHRoZSB0ZXh0IG9uIHRoZSBidXR0b24gdG8gY2hhbmdlIHlvdXIgaHlwb3RoZXNpc1xuICAgICAgICAgICAgdGV4dDogUmVhY3QuUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLCAvLyBcIllvdXIgaHlwb3RoZXNpcyB3YXMgPHRleHQ+LlwiXG4gICAgICAgIH0pKS5pc1JlcXVpcmVkLFxuICAgICAgICByZXN1bHQ6IFJlYWN0LlByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsIC8vIHRha2VzIGluIHRoZSBjdXJyZW50IHN0YXRlIGFuZCByZXR1cm5zIGFuIGVycm9yIHN0cmluZyBmb3IgZnJhbmNpcyB0byBzYXksIG9yIG51bGwgaWYgdGhlcmUgYXJlIG5vIHByb2JsZW1zIHdpdGggdGhlIGV4cGVyaW1lbnQuXG4gICAgICAgIG5leHRVUkw6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsIC8vIHRoZSB1cmwgb2YgdGhlIG5leHQgdGhpbmcuXG4gICAgfSxcblxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdGhpc1Jlc3VsdDogdGhpcy5wcm9wcy5pbml0aWFsVGV4dCxcbiAgICAgICAgICAgIHByZXZSZXN1bHQ6ICcnLFxuICAgICAgICAgICAgaHlwb3RoZXNpczogdGhpcy5wcm9wcy5pbml0aWFsSHlwb3RoZXNpcywgLy8gYSBoeXBvdGhlc2lzLm5hbWVcbiAgICAgICAgICAgIGRpc3Byb3ZlbjogZmFsc2UsXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIHJlbmRlckh5cG90aGVzaXM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGh5cFRleHQgPSBfLmZpbmRXaGVyZShcbiAgICAgICAgICAgIHRoaXMucHJvcHMucG9zc2libGVIeXBvdGhlc2VzLFxuICAgICAgICAgICAge25hbWU6IHRoaXMuc3RhdGUuaHlwb3RoZXNpc30pLnRleHRcbiAgICAgICAgcmV0dXJuIFJlYWN0LkRPTS5wKHtjbGFzc05hbWU6IFwiY2hlY2tlcl95b3VyLWh5cG9cIn0sIFxuICAgICAgICAgICAgUmVhY3QuRE9NLmVtKG51bGwsIFwiWW91ciBoeXBvdGhlc2lzIGlzIFwiLCBoeXBUZXh0LCBcIi5cIilcbiAgICAgICAgKVxuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuZGlzcHJvdmVuKSB7XG4gICAgICAgICAgICB2YXIgYnV0dG9ucyA9IF8ubWFwKFxuICAgICAgICAgICAgICAgIF8uZmlsdGVyKFxuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLnBvc3NpYmxlSHlwb3RoZXNlcyxcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKGh5cCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICh0aGlzLnN0YXRlLmh5cG90aGVzaXMgIT09IGh5cC5uYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpKSxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiAoaHlwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBSZWFjdC5ET00uYnV0dG9uKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBrZXk6IGh5cC5uYW1lLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU6IFwiYnRuIGJ0bi1kZWZhdWx0XCIsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jaGFuZ2VIeXBvdGhlc2lzKGh5cC5uYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKX0sIFxuICAgICAgICAgICAgICAgICAgICAgICAgaHlwLmJ1dHRvblRleHRcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgICAgICAgICByZXR1cm4gUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImNoZWNrZXJcIn0sIFxuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVySHlwb3RoZXNpcygpLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uaW1nKHtzcmM6IFwiaW1hZ2VzL3Npci1mcmFuY2lzLmpwZWdcIiwgY2xhc3NOYW1lOiBcImNoZWNrZXJfZnJhbmNpc1wifSksIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJjaGVja2VyX21haW5cIn0sIFxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5ET00ucChudWxsLCBcIk9rYXksIHdoaWNoIHJlc3VsdCBkbyB0aGV5IHN1cHBvcnQ/XCIpLCBcbiAgICAgICAgICAgICAgICAgICAgYnV0dG9uc1xuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS50aGlzUmVzdWx0KSB7XG4gICAgICAgICAgICByZXR1cm4gUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImNoZWNrZXJcIn0sIFxuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVySHlwb3RoZXNpcygpLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uaW1nKHtzcmM6IFwiaW1hZ2VzL3Npci1mcmFuY2lzLmpwZWdcIiwgY2xhc3NOYW1lOiBcImNoZWNrZXJfZnJhbmNpc1wifSksIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJjaGVja2VyX21haW5cIn0sIFxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5ET00ucChudWxsLCB0aGlzLnN0YXRlLnRoaXNSZXN1bHQpLCBcbiAgICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLmJ1dHRvbih7Y2xhc3NOYW1lOiBcImJ0biBidG4tZGVmYXVsdFwiLCBvbkNsaWNrOiB0aGlzLnN1cHBvcnR9LCBcIlRoZSBkYXRhIHN1cHBvcnQgbXkgaHlwb3RoZXNpcy5cIiksIFxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5ET00uYnV0dG9uKHtjbGFzc05hbWU6IFwiYnRuIGJ0bi1kZWZhdWx0XCIsIG9uQ2xpY2s6IHRoaXMuZGlzcHJvdmV9LCBcIlRoZSBkYXRhIGRpc3Byb3ZlIG15IGh5cG90aGVzaXMuXCIpXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLm5leHRVUkwpIHtcbiAgICAgICAgICAgICAgICB2YXIgY29udGludWVyID0gUmVhY3QuRE9NLmEoe2NsYXNzTmFtZTogXCJidG4gYnRuLWRlZmF1bHRcIiwgaHJlZjogdGhpcy5wcm9wcy5uZXh0VVJMfSwgXCJUaGFua3MhICBXaGF0J3MgbmV4dD9cIik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHZhciBjb250aW51ZXIgPSBSZWFjdC5ET00uc3BhbihudWxsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwiY2hlY2tlclwifSwgXG4gICAgICAgICAgICAgICAgdGhpcy5yZW5kZXJIeXBvdGhlc2lzKCksIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5pbWcoe3NyYzogXCJpbWFnZXMvc2lyLWZyYW5jaXMuanBlZ1wiLCBjbGFzc05hbWU6IFwiY2hlY2tlcl9mcmFuY2lzXCJ9KSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImNoZWNrZXJfbWFpblwifSwgXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5wKG51bGwsIFwiWW91ciBleHBlcmltZW50IGxvb2tzIGdyZWF0LCBhbmQgSSdtIGNvbnZpbmNlZC4gIEhlcmUsIGhhdmUgc29tZSBiYWNvbi5cIiksIFxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZXIsIFwiO1wiXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBzdXBwb3J0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuYXNrRnJhbmNpcygpO1xuICAgIH0sXG5cbiAgICBkaXNwcm92ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGRpc3Byb3ZlbjogdHJ1ZSxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGNoYW5nZUh5cG90aGVzaXM6IGZ1bmN0aW9uIChoeXApIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBkaXNwcm92ZW46IGZhbHNlLFxuICAgICAgICAgICAgaHlwb3RoZXNpczogaHlwLFxuICAgICAgICB9LCB0aGlzLmFza0ZyYW5jaXMpO1xuICAgIH0sXG5cbiAgICBhc2tGcmFuY2lzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgdGhpc1Jlc3VsdDogdGhpcy5wcm9wcy5yZXN1bHQodGhpcy5zdGF0ZSksXG4gICAgICAgICAgICBwcmV2UmVzdWx0OiB0aGlzLnN0YXRlLnRoaXNSZXN1bHRcbiAgICAgICAgfSk7XG4gICAgfVxufSlcblxubW9kdWxlLmV4cG9ydHMgPSBEYXRhQ2hlY2tlcjtcbiIsInZhciBHcmFwaCA9IHJlcXVpcmUoJy4vZ3JhcGgnKVxudmFyIEdhdGUgPSByZXF1aXJlKCcuL2dhdGUnKTtcbnZhciBCYXNlID0gcmVxdWlyZSgnLi9iYXNlJyk7XG52YXIgU3RvcHdhdGNoID0gcmVxdWlyZSgnLi9zdG9wd2F0Y2gnKTtcbnZhciBQbGF5UGF1c2UgPSByZXF1aXJlKCcuL3BsYXlwYXVzZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2UuZXh0ZW5kKGZ1bmN0aW9uIERlbW8oY29udGFpbmVyLCBvcHRpb25zKSB7XG4gICAgQmFzZS5jYWxsKHRoaXMsIGNvbnRhaW5lciwgb3B0aW9ucywgJ2ltYWdlcy9sYWJfYmFja2dyb3VuZC5qcGcnKVxufSwge1xuICAgIGRyb3BJbkJvZHk6IGZ1bmN0aW9uIChyYWRpdXMsIHksIGNvbG9yKSB7XG4gICAgICAgIGZ1bmN0aW9uIHJhbmRvbShtaW4sIG1heCl7XG4gICAgICAgICAgICByZXR1cm4gKE1hdGgucmFuZG9tKCkgKiAobWF4LW1pbikgKyBtaW4pfDBcbiAgICAgICAgfVxuICAgICAgICB2YXIgYm9keSA9IFBoeXNpY3MuYm9keSgnY2lyY2xlJywge1xuICAgICAgICAgICAgeDogMTAwLFxuICAgICAgICAgICAgeTogeSxcbiAgICAgICAgICAgIHZ4OiByYW5kb20oLTUsIDUpLzEwMCxcbiAgICAgICAgICAgIHJhZGl1czogcmFkaXVzLFxuICAgICAgICAgICAgbWFzczogOTAwLFxuICAgICAgICAgICAgcmVzdGl0dXRpb246IDAuOSxcbiAgICAgICAgICAgIHN0eWxlczoge1xuICAgICAgICAgICAgICAgIGltYWdlOiBcImltYWdlcy90ZW5uaXNfYmFsbC5wbmdcIlxuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuXG4gICAgICAgIHRoaXMud29ybGQuYWRkKGJvZHkpO1xuICAgICAgICByZXR1cm4gYm9keTtcbiAgICB9LFxuICAgIHNldHVwOiBmdW5jdGlvbiAoY29udGFpbmVyKSB7XG4gICAgICAgIHZhciB3b3JsZCA9IHRoaXMud29ybGRcbiAgICAgICAgd29ybGQuYWRkKFBoeXNpY3MuYmVoYXZpb3IoJ2NvbnN0YW50LWFjY2VsZXJhdGlvbicpKTtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDU7IGkrKykge1xuICAgICAgICAgICAgdmFyIHJhZGl1cyA9IDIwICsgMTAgKiBpO1xuICAgICAgICAgICAgdGhpcy5kcm9wSW5Cb2R5KHJhZGl1cywgMzAwIC0gaSAqIDUwKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgY2lyY2xlID0gdGhpcy5kcm9wSW5Cb2R5KDQwLCAzMDAgKyAyMCwgJ3JlZCcpXG4gICAgICAgIHZhciBncmFwaCA9IG5ldyBHcmFwaCh0aGlzLmNvbnRhaW5lciwge1xuICAgICAgICAgICAgJ0NpcmNsZSc6IHtib2R5OiBjaXJjbGUsIGF0dHI6ICdwb3MueScsIHRpdGxlOidWZXJ0aWNhbCBQb3NpdGlvbicsIG1pbnNjYWxlOiA1fSxcbiAgICAgICAgICAgICdWZWxZJzoge2JvZHk6IGNpcmNsZSwgYXR0cjogJ3ZlbC55JywgdGl0bGU6J1ZlcnRpY2FsIFZlbG9jaXR5JywgbWluc2NhbGU6IC4xfSxcbiAgICAgICAgICAgICdBbmdQJzoge2JvZHk6IGNpcmNsZSwgYXR0cjogJ2FuZ3VsYXIucG9zJywgdGl0bGU6J1JvdGF0aW9uJywgbWluc2NhbGU6IC4wMDF9LFxuICAgICAgICAgICAgJ0FuZ1YnOiB7Ym9keTogY2lyY2xlLCBhdHRyOiAnYW5ndWxhci52ZWwnLCB0aXRsZTonUm90YXRpb25hbCBWZWxvY2l0eScsIG1pbnNjYWxlOiAuMDAxfSxcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgdG9wOiAxMCxcbiAgICAgICAgICAgIGxlZnQ6IHRoaXMub3B0aW9ucy53aWR0aCAtIDQwMCxcbiAgICAgICAgICAgIHdpZHRoOiA0MDAsXG4gICAgICAgICAgICB3b3JsZEhlaWdodDogdGhpcy5vcHRpb25zLmhlaWdodFxuICAgICAgICB9KVxuICAgICAgICB0aGlzLmdyYXBoID0gZ3JhcGhcblxuICAgICAgICB0aGlzLndvcmxkLm9uKCdzdGVwJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZ3JhcGgudXBkYXRlKHdvcmxkLnRpbWVzdGVwKCkpXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMud29ybGQuYWRkKFBoeXNpY3MuYm9keSgncmVjdGFuZ2xlJywge1xuICAgICAgICAgICAgeDogMjUwLFxuICAgICAgICAgICAgeTogNjAwLFxuICAgICAgICAgICAgd2lkdGg6IDUwLFxuICAgICAgICAgICAgaGVpZ2h0OiA0MDAsXG4gICAgICAgICAgICB0cmVhdG1lbnQ6ICdzdGF0aWMnLFxuICAgICAgICAgICAgc3R5bGVzOiB7XG4gICAgICAgICAgICAgICAgZmlsbFN0eWxlOiAnI2QzMzY4MicsXG4gICAgICAgICAgICAgICAgYW5nbGVJbmRpY2F0b3I6ICcjNzUxYjRiJ1xuICAgICAgICAgICAgfVxuICAgICAgICB9KSlcblxuICAgICAgICB2YXIgYnV0dG9uQ29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGJ1dHRvbkNvbnRhaW5lcik7XG4gICAgICAgIHZhciBwbGF5UGF1c2UgPSBuZXcgUGxheVBhdXNlKHdvcmxkLCBidXR0b25Db250YWluZXIpO1xuICAgICAgICBnYXRlUG9seWdvbiA9IFt7eDogMCwgeTogMzAwfSwge3g6IDcwMCwgeTogMzAwfSwge3g6IDcwMCwgeTogNDAwfSwge3g6IDAsIHk6IDQwMH1dO1xuICAgICAgICB2YXIgZ2F0ZSA9IG5ldyBHYXRlKHdvcmxkLCBnYXRlUG9seWdvbiwgWzM1MCwgNzAwXSwgbnVsbCwge2RlYnVnOiB0cnVlLCBzaG93OiB0cnVlfSk7XG4gICAgICAgIGdhdGUub24oJ2VudGVyJywgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgZ2F0ZS5zdG9wd2F0Y2hlcyA9IGdhdGUuc3RvcHdhdGNoZXMgfHwge31cbiAgICAgICAgICAgIHZhciBzdG9wd2F0Y2ggPSBuZXcgU3RvcHdhdGNoKHdvcmxkLCBidXR0b25Db250YWluZXIsIDEpO1xuICAgICAgICAgICAgc3RvcHdhdGNoLnJlc2V0KCk7XG4gICAgICAgICAgICBzdG9wd2F0Y2guc3RhcnQoKTtcbiAgICAgICAgICAgIGdhdGUuc3RvcHdhdGNoZXNbZGF0YS5ib2R5LnVpZF0gPSBzdG9wd2F0Y2g7XG4gICAgICAgIH0pO1xuICAgICAgICBnYXRlLm9uKCdleGl0JywgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgZ2F0ZS5zdG9wd2F0Y2hlc1tkYXRhLmJvZHkudWlkXS5zdG9wKClcbiAgICAgICAgfSk7XG4gICAgfVxufSk7XG5cbiIsInZhciBCYXNlID0gcmVxdWlyZSgnLi9iYXNlJyk7XG52YXIgR2F0ZSA9IHJlcXVpcmUoJy4vZ2F0ZScpO1xudmFyIFN0b3B3YXRjaCA9IHJlcXVpcmUoJy4vc3RvcHdhdGNoJyk7XG52YXIgTG9nQm9vayA9IHJlcXVpcmUoJy4vbG9nYm9vaycpO1xudmFyIFBsYXlQYXVzZSA9IHJlcXVpcmUoJy4vcGxheXBhdXNlJyk7XG52YXIgRHJvcEludHJvID0gcmVxdWlyZSgnLi9pbnRyby9kcm9wX2ludHJvLmpzeCcpO1xudmFyIGRyb3BEYXRhQ2hlY2tlciA9IHJlcXVpcmUoJy4vZHJvcGRhdGFjaGVja2VyJyk7XG52YXIgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xuXG5mdW5jdGlvbiByYW5kb20obWluLCBtYXgpe1xuICAgIHJldHVybiAoTWF0aC5yYW5kb20oKSAqIChtYXgtbWluKSArIG1pbil8MFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2UuZXh0ZW5kKGZ1bmN0aW9uIERyb3AoY29udGFpbmVyLCBvcHRpb25zKSB7XG4gICAgQmFzZS5jYWxsKHRoaXMsIGNvbnRhaW5lciwgb3B0aW9ucywgXCJpbWFnZXMvYmx1ZV9sYWIuanBnXCIpXG59LCB7XG4gICAgZHJvcEJvd2xpbmdCYWxsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHJhZGl1cyA9IDMwO1xuICAgICAgICB0aGlzLndvcmxkLmFkZChQaHlzaWNzLmJvZHkoJ2NpcmNsZScsIHtcbiAgICAgICAgICAgIHg6IDcwMCxcbiAgICAgICAgICAgIHk6IDIwMCxcbiAgICAgICAgICAgIHZ4OiByYW5kb20oLTMwLCAzMCkvMTAwLFxuICAgICAgICAgICAgcmFkaXVzOiByYWRpdXMsXG4gICAgICAgICAgICBtYXNzOiA5MDAsXG4gICAgICAgICAgICByZXN0aXR1dGlvbjogMC4wMSxcbiAgICAgICAgICAgIGNvZjogMC40LFxuICAgICAgICAgICAgc3R5bGVzOiB7XG4gICAgICAgICAgICAgICAgaW1hZ2U6IFwiaW1hZ2VzL2Jvd2xpbmdfYmFsbC5wbmdcIlxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGRpc3BsYXlOYW1lOiAnQm93bGluZyBCYWxsJyxcbiAgICAgICAgfSkpO1xuICAgIH0sXG5cbiAgICBkcm9wVGVubmlzQmFsbDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciByYWRpdXMgPSAxNTtcbiAgICAgICAgdmFyIGJhbGwgPSBQaHlzaWNzLmJvZHkoJ2NpcmNsZScsIHtcbiAgICAgICAgICAgIHg6IDcwMCxcbiAgICAgICAgICAgIHk6IDIwMCxcbiAgICAgICAgICAgIHZ4OiByYW5kb20oLTMwLCAzMCkvMTAwLFxuICAgICAgICAgICAgcmFkaXVzOiByYWRpdXMsXG4gICAgICAgICAgICBtYXNzOiA3LjUsXG4gICAgICAgICAgICByZXN0aXR1dGlvbjogMSxcbiAgICAgICAgICAgIGRpc3BsYXlOYW1lOiAnVGVubmlzIEJhbGwnLFxuICAgICAgICAgICAgc3R5bGVzOiB7XG4gICAgICAgICAgICAgICAgaW1hZ2U6IFwiaW1hZ2VzL3Rlbm5pc19iYWxsLnBuZ1wiXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG5cbiAgICAgICAgaWYgKCF0aGlzLmZpcnN0VGVubmlzQmFsbCkge1xuICAgICAgICAgICAgdGhpcy5maXJzdFRlbm5pc0JhbGwgPSBiYWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy53b3JsZC5hZGQoYmFsbCk7XG4gICAgfSxcblxuICAgIGRlcGxveUJhbGxzOiBmdW5jdGlvbihvbkRvbmUpIHtcbiAgICAgICAgdmFyIHNwYWNpbmdfbXMgPSA4MDA7XG4gICAgICAgIHZhciBxdWV1ZSA9IFtcbiAgICAgICAgICAgIHRoaXMuZHJvcFRlbm5pc0JhbGwuYmluZCh0aGlzKSxcbiAgICAgICAgICAgIHRoaXMuZHJvcFRlbm5pc0JhbGwuYmluZCh0aGlzKSxcbiAgICAgICAgICAgIHRoaXMuZHJvcEJvd2xpbmdCYWxsLmJpbmQodGhpcyksXG4gICAgICAgICAgICB0aGlzLmRyb3BUZW5uaXNCYWxsLmJpbmQodGhpcyksXG4gICAgICAgICAgICB0aGlzLmRyb3BUZW5uaXNCYWxsLmJpbmQodGhpcyksXG4gICAgICAgICAgICB0aGlzLmRyb3BCb3dsaW5nQmFsbC5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgb25Eb25lXG4gICAgICAgIF07XG4gICAgICAgIF8ucmVkdWNlKHF1ZXVlLCBmdW5jdGlvbih0LCBhY3Rpb24pIHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoYWN0aW9uLCB0KVxuICAgICAgICAgICAgcmV0dXJuIHQgKyBzcGFjaW5nX21zXG4gICAgICAgIH0sIDApXG5cbiAgICAgICAgLy8gc2V0VGltZW91dCh0aGlzLmRyb3BUZW5uaXNCYWxsLmJpbmQodGhpcyksIDApXG4gICAgICAgIC8vIHNldFRpbWVvdXQodGhpcy5kcm9wVGVubmlzQmFsbC5iaW5kKHRoaXMpLCAxMDApXG4gICAgICAgIC8vIHNldFRpbWVvdXQodGhpcy5kcm9wVGVubmlzQmFsbC5iaW5kKHRoaXMpLCAyMDApXG4gICAgfSxcblxuICAgIHN0YXJ0V2Fsa3Rocm91Z2g6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgRHJvcEludHJvKHRoaXMsIGZ1bmN0aW9uIChoeXBvdGhlc2lzKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnR290IHRoZSBoeXBvdGhlc2lzISEnLCBoeXBvdGhlc2lzKTtcbiAgICAgICAgICAgIHRoaXMuc2V0dXBEYXRhQ2hlY2tlcihoeXBvdGhlc2lzKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKVxuICAgIH0sXG5cbiAgICBzZXR1cERhdGFDaGVja2VyOiBmdW5jdGlvbiAoaHlwb3RoZXNpcykge1xuICAgICAgICB2YXIgZGF0YUNoZWNrZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICBkYXRhQ2hlY2tlci5jbGFzc05hbWUgPSBcImRyb3AtZGF0YS1jaGVja2VyXCI7XG4gICAgICAgIHRoaXMuc2lkZUJhci5hcHBlbmRDaGlsZChkYXRhQ2hlY2tlcik7XG4gICAgICAgIGRyb3BEYXRhQ2hlY2tlcihkYXRhQ2hlY2tlciwgdGhpcy5sb2dCb29rLCBoeXBvdGhlc2lzKTtcbiAgICB9LFxuXG4gICAgc2V0dXA6IGZ1bmN0aW9uIChjb250YWluZXIpIHtcbiAgICAgICAgdmFyIHdvcmxkID0gdGhpcy53b3JsZFxuICAgICAgICB2YXIgZ3Jhdml0eSA9IFBoeXNpY3MuYmVoYXZpb3IoJ2NvbnN0YW50LWFjY2VsZXJhdGlvbicpXG4gICAgICAgIGdyYXZpdHkuc2V0QWNjZWxlcmF0aW9uKHt4OiAwLCB5Oi4wMDAzfSk7XG4gICAgICAgIHdvcmxkLmFkZChncmF2aXR5KTtcblxuICAgICAgICAvLyBTaHVudCB0cmlhbmdsZVxuICAgICAgICB0aGlzLndvcmxkLmFkZChQaHlzaWNzLmJvZHkoJ3JlY3RhbmdsZScsIHtcbiAgICAgICAgICAgIHg6IDYwLFxuICAgICAgICAgICAgeTogNjkwLFxuICAgICAgICAgICAgd2lkdGg6IDUwMCxcbiAgICAgICAgICAgIGhlaWdodDogMTAwLFxuICAgICAgICAgICAgYW5nbGU6IE1hdGguUEkgLyA0LFxuICAgICAgICAgICAgdHJlYXRtZW50OiAnc3RhdGljJyxcbiAgICAgICAgICAgIGNvZjogMSxcbiAgICAgICAgICAgIHN0eWxlczoge1xuICAgICAgICAgICAgICAgIGZpbGxTdHlsZTogJyNkMzM2ODInLFxuICAgICAgICAgICAgfVxuICAgICAgICB9KSk7XG5cbiAgICAgICAgdmFyIHNpZGVCYXIgPSB0aGlzLnNpZGVCYXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICBzaWRlQmFyLmNsYXNzTmFtZSA9IFwic2lkZS1iYXJcIjtcbiAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKHNpZGVCYXIpO1xuICAgICAgICB2YXIgdG9wR2F0ZSA9IG5ldyBHYXRlKHdvcmxkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHV0aWwubWFrZVJlY3QoMCwgMCwgMjAwLCAxMCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgWzEyMCwgMjAwXSwgbnVsbCwge2RlYnVnOiB0cnVlLCBzaG93OiB0cnVlLCBjb2xvcjogJ2dyZWVuJ30pO1xuICAgICAgICB2YXIgYm90dG9tR2F0ZSA9IG5ldyBHYXRlKHdvcmxkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHV0aWwubWFrZVJlY3QoMCwgMCwgMjAwLCAxMCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgWzEyMCwgNTUwXSwgbnVsbCwge2RlYnVnOiB0cnVlLCBzaG93OiB0cnVlLCBjb2xvcjogJ3JlZCd9KTtcbiAgICAgICAgdmFyIGxvZ0NvbHVtbnMgPSBbXG4gICAgICAgICAgICB7bmFtZTogXCJCb3dsaW5nIEJhbGxcIiwgZXh0cmFUZXh0OiBcIiAoNyBrZylcIn0sXG4gICAgICAgICAgICB7bmFtZTogXCJUZW5uaXMgQmFsbFwiLCBleHRyYVRleHQ6IFwiICg1OCBnKVwiLCBjb2xvcjogJ3JnYigxNTQsIDI0MSwgMCknfVxuICAgICAgICBdO1xuICAgICAgICB2YXIgbG9nQm9vayA9IHRoaXMubG9nQm9vayA9IG5ldyBMb2dCb29rKHdvcmxkLCBzaWRlQmFyLCA1LCBsb2dDb2x1bW5zKTtcbiAgICAgICAgdG9wR2F0ZS5vbignZW50ZXInLCBmdW5jdGlvbihlbGVtKSB7XG4gICAgICAgICAgICB2YXIgY29sTmFtZSA9IGVsZW0uYm9keS5kaXNwbGF5TmFtZSB8fCBlbGVtLmJvZHkubmFtZSB8fCBcImJvZHlcIjtcbiAgICAgICAgICAgIGxvZ0Jvb2suaGFuZGxlU3RhcnQoY29sTmFtZSwgZWxlbS5ib2R5LnVpZCk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICAgIGJvdHRvbUdhdGUub24oJ2VudGVyJywgZnVuY3Rpb24oZWxlbSkge1xuICAgICAgICAgICAgdmFyIGNvbE5hbWUgPSBlbGVtLmJvZHkuZGlzcGxheU5hbWUgfHwgZWxlbS5ib2R5Lm5hbWUgfHwgXCJib2R5XCI7XG4gICAgICAgICAgICBsb2dCb29rLmhhbmRsZUVuZChjb2xOYW1lLCBlbGVtLmJvZHkudWlkKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdmFyIGJ1dHRvbkNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgIHZhciBwbGF5UGF1c2UgPSBuZXcgUGxheVBhdXNlKHdvcmxkLCBidXR0b25Db250YWluZXIpO1xuICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoYnV0dG9uQ29udGFpbmVyKTtcblxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLndhbGspIHtcbiAgICAgICAgICAgIHRoaXMuc3RhcnRXYWxrdGhyb3VnaCgpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBBZGQgdGhlIGJhbGxzLlxuICAgICAgICAgICAgc2V0VGltZW91dCh0aGlzLmRlcGxveUJhbGxzLmJpbmQodGhpcyksIDUwMClcbiAgICAgICAgICAgIHRoaXMuc2V0dXBEYXRhQ2hlY2tlcignc2FtZScpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFBpY2sgdXAgb25lIG9mIHRoZSB0ZW5uaXMgYmFsbHMgYW5kIGRyb3AgaXQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gY2FsbGJhY2sgR2V0cyBjYWxsZWQgd2hlbiB0aGUgZGVtb25zdHJhdGlvbiBpcyBvdmVyLlxuICAgICAqL1xuICAgIGRlbW9uc3RyYXRlRHJvcDogZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIGJhbGwgPSB0aGlzLmZpcnN0VGVubmlzQmFsbDtcbiAgICAgICAgdmFyIHRhcmdldFggPSAxMjU7XG4gICAgICAgIHZhciB0YXJnZXRZID0gMTcwO1xuXG4gICAgICAgIGJhbGwudHJlYXRtZW50ID0gJ2tpbmVtYXRpYyc7XG4gICAgICAgIGJhbGwuc3RhdGUudmVsLnggPSAodGFyZ2V0WCAtIGJhbGwuc3RhdGUucG9zLngpIC8gMTUwMDtcbiAgICAgICAgYmFsbC5zdGF0ZS52ZWwueSA9ICh0YXJnZXRZIC0gYmFsbC5zdGF0ZS5wb3MueSkgLyAxNTAwO1xuICAgICAgICBiYWxsLnJlY2FsYygpO1xuXG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBiYWxsLnRyZWF0bWVudCA9ICdzdGF0aWMnO1xuICAgICAgICAgICAgYmFsbC5zdGF0ZS5wb3MueCA9IHRhcmdldFg7XG4gICAgICAgICAgICBiYWxsLnN0YXRlLnBvcy55ID0gdGFyZ2V0WTtcbiAgICAgICAgICAgIGJhbGwuc3RhdGUudmVsLnggPSAwO1xuICAgICAgICAgICAgYmFsbC5zdGF0ZS52ZWwueSA9IDA7XG4gICAgICAgICAgICBiYWxsLnJlY2FsYygpO1xuXG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGJhbGwudHJlYXRtZW50ID0gJ2R5bmFtaWMnO1xuICAgICAgICAgICAgICAgIGJhbGwucmVjYWxjKCk7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICAgICAgICB9LCAzMDAwKVxuICAgICAgICAgICAgfSwgMTUwMClcbiAgICAgICAgfSwgMTUwMClcbiAgICB9XG59KTtcbiIsInZhciBEYXRhQ2hlY2tlciA9IHJlcXVpcmUoJy4vZGF0YWNoZWNrZXIuanN4Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZHJvcERhdGFDaGVja2VyO1xuXG52YXIgX2luaXRpYWxUZXh0ID0gXCJEbyBhbiBleHBlcmltZW50IHRvIHNlZSBpZiB5b3UgY2FuIGZpZ3VyZSBvdXQgd2hpY2ggYmFsbCBmYWxscyBmYXN0ZXIsIGFuZCBsZXQgbWUga25vdyB3aGVuIHlvdSdyZSBkb25lIVwiO1xuXG52YXIgX25leHRVUkwgPSBcIj9OZXd0b24xJndhbGs9dHJ1ZVwiO1xuXG52YXIgX2h5cG90aGVzZXMgPSBbXG4gICAge1xuICAgICAgICBuYW1lOiBcImJvd2xpbmdcIixcbiAgICAgICAgYnV0dG9uVGV4dDogXCJUaGUgYm93bGluZyBiYWxsIGZhbGxzIGZhc3Rlci5cIixcbiAgICAgICAgdGV4dDogXCJ0aGF0IHRoZSBib3dsaW5nIGJhbGwgd2lsbCBmYWxsIGZhc3RlclwiLFxuICAgIH0sXG4gICAge1xuICAgICAgICBuYW1lOiBcInRlbm5pc1wiLFxuICAgICAgICBidXR0b25UZXh0OiBcIlRoZSB0ZW5uaXMgYmFsbCBmYWxscyBmYXN0ZXIuXCIsXG4gICAgICAgIHRleHQ6IFwidGhhdCB0aGUgdGVubmlzIGJhbGwgd2lsbCBmYWxsIGZhc3RlclwiLFxuICAgIH0sXG4gICAge1xuICAgICAgICBuYW1lOiBcInNhbWVcIixcbiAgICAgICAgYnV0dG9uVGV4dDogXCJCb3RoIGJhbGxzIGZhbGwgYXQgdGhlIHNhbWUgcmF0ZS5cIixcbiAgICAgICAgdGV4dDogXCJ0aGF0IGJvdGggYmFsbHMgd2lsbCBmYWxsIGF0IHRoZSBzYW1lIHJhdGVcIixcbiAgICB9LFxuXTtcbiAgICBcblxuZnVuY3Rpb24gZHJvcERhdGFDaGVja2VyKGNvbnRhaW5lciwgbG9nQm9vaywgaHlwb3RoZXNpcykge1xuICAgIHJldHVybiBSZWFjdC5yZW5kZXJDb21wb25lbnQoRGF0YUNoZWNrZXIoe1xuICAgICAgICBpbml0aWFsVGV4dDogX2luaXRpYWxUZXh0LFxuICAgICAgICBpbml0aWFsSHlwb3RoZXNpczogaHlwb3RoZXNpcyxcbiAgICAgICAgcG9zc2libGVIeXBvdGhlc2VzOiBfaHlwb3RoZXNlcyxcbiAgICAgICAgcmVzdWx0OiBmdW5jdGlvbiAoc3RhdGUpIHtyZXR1cm4gX3Jlc3VsdChsb2dCb29rLCBzdGF0ZSk7fSxcbiAgICAgICAgbmV4dFVSTDogX25leHRVUkwsXG4gICAgfSksIGNvbnRhaW5lcik7XG59XG5cbmZ1bmN0aW9uIF9yZXN1bHQobG9nQm9vaywgc3RhdGUpIHtcbiAgICAvLyB3ZSByZXR1cm4gdGhlIGVycm9yLCBvciBudWxsIGlmIHRoZXkncmUgY29ycmVjdFxuICAgIHZhciBlbm91Z2hEYXRhID0gXy5hbGwobG9nQm9vay5kYXRhLCBmdW5jdGlvbiAoZCkge3JldHVybiBkLmxlbmd0aCA+PSA1O30pO1xuICAgIGlmIChlbm91Z2hEYXRhKSB7XG4gICAgICAgIHZhciBhdmdzID0ge31cbiAgICAgICAgdmFyIG1heERlbHRhcyA9IHt9XG4gICAgICAgIGZvciAodmFyIG5hbWUgaW4gbG9nQm9vay5kYXRhKSB7XG4gICAgICAgICAgICBhdmdzW25hbWVdID0gXy5yZWR1Y2UobG9nQm9vay5kYXRhW25hbWVdLFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIChhLCBiKSB7cmV0dXJuIGEgKyBiO30pIC8gbG9nQm9vay5kYXRhW25hbWVdLmxlbmd0aDtcbiAgICAgICAgICAgIG1heERlbHRhc1tuYW1lXSA9IF8ubWF4KF8ubWFwKGxvZ0Jvb2suZGF0YVtuYW1lXSxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiAoZGF0dW0pIHtyZXR1cm4gTWF0aC5hYnMoZGF0dW0gLSBhdmdzW25hbWVdKTt9KSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgY29uc29sZS5sb2cobG9nQm9vay5kYXRhLCBlbm91Z2hEYXRhLCBhdmdzLCBtYXhEZWx0YXMpO1xuICAgIGlmICghZW5vdWdoRGF0YSkge1xuICAgICAgICByZXR1cm4gXCJZb3UgaGF2ZW4ndCBmaWxsZWQgdXAgeW91ciBsYWIgbm90ZWJvb2shICBNYWtlIHN1cmUgeW91IGdldCBlbm91Z2ggZGF0YSBzbyB5b3Uga25vdyB5b3VyIHJlc3VsdHMgYXJlIGFjY3VyYXRlLlwiO1xuICAgIH0gZWxzZSBpZiAobWF4RGVsdGFzW1wiQm93bGluZyBCYWxsXCJdID4gMzAwKSB7XG4gICAgICAgIHJldHVybiBcIk9uZSBvZiB5b3VyIHJlc3VsdHMgZm9yIHRoZSBib3dsaW5nIGJhbGwgbG9va3MgcHJldHR5IGZhciBvZmYhICBUcnkgZ2V0dGluZyBzb21lIG1vcmUgZGF0YSB0byBtYWtlIHN1cmUgaXQgd2FzIGEgZmx1a2UuXCI7XG4gICAgfSBlbHNlIGlmIChtYXhEZWx0YXNbXCJUZW5uaXMgQmFsbFwiXSA+IDMwMCkge1xuICAgICAgICByZXR1cm4gXCJPbmUgb2YgeW91ciByZXN1bHRzIGZvciB0aGUgdGVubmlzIGJhbGwgbG9va3MgcHJldHR5IGZhciBvZmYhICBUcnkgZ2V0dGluZyBzb21lIG1vcmUgZGF0YSB0byBtYWtlIHN1cmUgaXQgd2FzIGEgZmx1a2UuXCI7XG4gICAgfSBlbHNlIGlmIChcbiAgICAgICAgICAgIChzdGF0ZS5oeXBvdGhlc2lzID09PSBcInNhbWVcIlxuICAgICAgICAgICAgICAgICYmIE1hdGguYWJzKGF2Z3NbXCJCb3dsaW5nIEJhbGxcIl0gLSBhdmdzW1wiVGVubmlzIEJhbGxcIl0pID4gMTAwKVxuICAgICAgICAgICAgfHwgKHN0YXRlLmh5cG90aGVzaXMgPT09IFwiYm93bGluZ1wiXG4gICAgICAgICAgICAgICAgJiYgYXZnc1tcIkJvd2xpbmcgQmFsbFwiXSA8IGF2Z3NbXCJUZW5uaXMgQmFsbFwiXSArIDEwMClcbiAgICAgICAgICAgIHx8IChzdGF0ZS5oeXBvdGhlc2lzID09PSBcInRlbm5pc1wiXG4gICAgICAgICAgICAgICAgJiYgYXZnc1tcIlRlbm5pcyBCYWxsXCJdIDwgYXZnc1tcIkJvd2xpbmcgQmFsbFwiXSArIDEwMClcbiAgICAgICAgICAgICkge1xuICAgICAgICByZXR1cm4gXCJUaG9zZSByZXN1bHRzIGRvbid0IGxvb2sgdmVyeSBjb25zaXN0ZW50IHdpdGggeW91ciBoeXBvdGhlc2lzLiAgSXQncyBmaW5lIGlmIHlvdXIgaHlwb3RoZXNpcyB3YXMgZGlzcHJvdmVuLCB0aGF0J3MgaG93IHNjaWVuY2Ugd29ya3MhXCI7XG4gICAgfSBlbHNlIGlmIChcbiAgICAgICAgICAgIHN0YXRlLmh5cG90aGVzaXMgIT09IFwic2FtZVwiXG4gICAgICAgICAgICB8fCBhdmdzW1wiQm93bGluZyBCYWxsXCJdIDwgODAwXG4gICAgICAgICAgICB8fCBhdmdzW1wiQm93bGluZyBCYWxsXCJdID4gMTUwMFxuICAgICAgICAgICAgfHwgYXZnc1tcIlRlbm5pcyBCYWxsXCJdIDwgODAwXG4gICAgICAgICAgICB8fCBhdmdzW1wiVGVubmlzIEJhbGxcIl0gPiAxNTAwKSB7XG4gICAgICAgIHJldHVybiBcIlRob3NlIHJlc3VsdHMgYXJlIGNvbnNpc3RlbnQsIGJ1dCB0aGV5IGRvbid0IGxvb2sgcXVpdGUgcmlnaHQgdG8gbWUuICBNYWtlIHN1cmUgeW91J3JlIGRyb3BwaW5nIHRoZSBiYWxscyBnZW50bHkgZnJvbSB0aGUgc2FtZSBoZWlnaHQgYWJvdmUgdGhlIHRvcCBzZW5zb3IuXCI7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxufVxuIiwidmFyIFN0b3B3YXRjaCA9IHJlcXVpcmUoJy4vc3RvcHdhdGNoJyk7XG52YXIgY2hlY2tDb2xsaXNpb24gPSByZXF1aXJlKCcuL2NoZWNrLWNvbGxpc2lvbicpXG5cbm1vZHVsZS5leHBvcnRzID0gR2F0ZTtcblxudmFyIEVOVEVSX0ZBREVPVVRfRFVSQVRJT04gPSAyMFxudmFyIEVYSVRfRkFERU9VVF9EVVJBVElPTiA9IDIwXG5cbi8qKlxuICogT3B0aS10aGluZ3kgZ2F0ZS5cbiAqIERldGVjdHMgd2hlbiBib2RpZXMgZW50ZXIgYW5kIGV4aXQgYSBzcGVjaWZpZWQgYXJlYS5cbiAqXG4gKiBwb2x5Z29uIC0gc2hvdWxkIGJlIGEgbGlzdCBvZiB2ZWN0b3Jpc2gsIHdoaWNoIG11c3QgYmUgY29udmV4LlxuICogYm9keSAtIHNob3VsZCBiZSBhIGJvZHksIG9yIG51bGwgdG8gdHJhY2sgYWxsIGJvZGllc1xuICogb3B0cyAtIHtkZWJ1ZzogZmFsc2V9XG4gKlxuICogVXNhZ2UgRXhhbXBsZTpcbiAqIHZhciBnYXRlID0gbmV3IEdhdGUoYXdlc29tZV93b3JsZCwgY29udGFpbmVyX2RpdiwgW3t4OiAwLCB5OiAzMDB9LCAuLi5dLCB7ZGVidWc6IHRydWV9KVxuICogZ2F0ZS5vbignZXhpdCcsIGZ1bmN0aW9uKGRhdGEpIHtcbiAqICAgY29uc29sZS5sb2coXCJZb3UgZXNjYXBlZCBtZSBhZ2FpbiEgSSB3aWxsIGZpbmQgeW91LCBvaCBcIiwgZGF0YS5ib2R5KTtcbiAqIH0pXG4gKi9cbmZ1bmN0aW9uIEdhdGUod29ybGQsIHBvbHlnb24sIHBvcywgYm9keSwgb3B0cykge1xuICAgIG9wdHMgPSBvcHRzIHx8IHt9O1xuICAgIHRoaXMud29ybGQgPSB3b3JsZFxuICAgIHRoaXMuYm9keSA9IGJvZHk7XG4gICAgLy8gYm9kaWVzIGN1cnJlbnRseSBpbnNpZGUgdGhpcyBnYXRlLlxuICAgIHRoaXMuY29udGFpbnMgPSBbXVxuICAgIHRoaXMuX3N1YnNjcmliZSgpXG4gICAgdGhpcy5wb2x5Z29uID0gcG9seWdvblxuICAgIHRoaXMuY29sbGlzaW9uX2JvZHkgPSBQaHlzaWNzLmJvZHkoJ2NvbnZleC1wb2x5Z29uJywge1xuICAgICAgICB2ZXJ0aWNlczogcG9seWdvbixcbiAgICAgICAgdHJlYXRtZW50OiAnbWFnaWMnLFxuICAgICAgICB4OiBwb3NbMF0sXG4gICAgICAgIHk6IHBvc1sxXSxcbiAgICAgICAgdng6IDAsXG4gICAgICAgIGFuZ2xlOiAwLFxuICAgICAgICByZXN0aXR1dGlvbjogMC45LFxuICAgICAgICBzdHlsZXM6IHtcbiAgICAgICAgICAgIGZpbGxTdHlsZTogJyM4NTk5MDAnLFxuICAgICAgICAgICAgYW5nbGVJbmRpY2F0b3I6ICcjNDE0NzAwJ1xuICAgICAgICB9XG4gICAgfSlcbiAgICB0aGlzLm1vdmVkX3BvaW50cyA9IHBvbHlnb24ubWFwKGZ1bmN0aW9uIChwKSB7XG4gICAgICAgIHJldHVybiB7eDogcC54ICsgcG9zWzBdLCB5OiBwLnkgKyBwb3NbMV19XG4gICAgfSk7XG4gICAgdGhpcy52aWV3ID0gdGhpcy53b3JsZC5yZW5kZXJlcigpLmNyZWF0ZVZpZXcodGhpcy5jb2xsaXNpb25fYm9keS5nZW9tZXRyeSwgeyBzdHJva2VTdHlsZTogJyNhYWEnLCBsaW5lV2lkdGg6IDIsIGZpbGxTdHlsZTogJ3JnYmEoMCwwLDAsMCknIH0pXG4gICAgLy8gdGhpcy53b3JsZC5hZGQodGhpcy5jb2xsaXNpb25fYm9keSlcbiAgICBpZiAob3B0cy5kZWJ1ZykgdGhpcy5zcGVha0xvdWRseSgpO1xuICAgIHRoaXMuX2NvbG9yID0gb3B0cy5jb2xvclxuXG4gICAgdGhpcy5fZW50ZXJfZmFkZW91dCA9IDA7XG4gICAgdGhpcy5fZXhpdF9mYWRlb3V0ID0gMDtcbn1cblxuR2F0ZS5wcm90b3R5cGUuX3N1YnNjcmliZSA9IGZ1bmN0aW9uKCkge1xuICAgIFBoeXNpY3MudXRpbC50aWNrZXIub24oZnVuY3Rpb24odGltZSkge1xuICAgICAgICBpZiAodGhpcy5ib2R5KSB7XG4gICAgICAgICAgICB0aGlzLmhhbmRsZUJvZHkodGhpcy5ib2R5KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMud29ybGQuZ2V0Qm9kaWVzKCkuZm9yRWFjaCh0aGlzLmhhbmRsZUJvZHkuYmluZCh0aGlzKSlcbiAgICAgICAgfVxuICAgIH0uYmluZCh0aGlzKSlcblxuICAgIC8vIFN1YnNjcmliZSB0byByZW5kZXIgZXZlbnRzXG4gICAgdGhpcy53b3JsZC5vbigncmVuZGVyJywgdGhpcy5fcmVuZGVyLmJpbmQodGhpcykpO1xuXG4gICAgLy8gU3Vic2NyaWJlIHRvIHNlbGYuICh3SGFUPylcbiAgICB0aGlzLm9uKCdlbnRlcicsIGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLl9lbnRlcl9mYWRlb3V0ID0gRU5URVJfRkFERU9VVF9EVVJBVElPTlxuICAgIH0uYmluZCh0aGlzKSlcbiAgICB0aGlzLm9uKCdleGl0JywgZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuX2V4aXRfZmFkZW91dCA9IEVYSVRfRkFERU9VVF9EVVJBVElPTlxuICAgIH0uYmluZCh0aGlzKSlcbn1cblxuR2F0ZS5wcm90b3R5cGUuX3JlbmRlciA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciByID0gdGhpcy53b3JsZC5yZW5kZXJlcigpO1xuICAgIHZhciBhbHBoYSA9IHRoaXMuX2VudGVyX2ZhZGVvdXQgLyBFTlRFUl9GQURFT1VUX0RVUkFUSU9OXG4gICAgdmFyIHN0cm9rZVN0eWxlcyA9IHtcbiAgICAgICAgZ3JlZW46ICcjMGEwJyxcbiAgICAgICAgcmVkOiAnI2EwMCcsXG4gICAgICAgIHVuZGVmaW5lZDogJyNhYWEnLFxuICAgIH1cbiAgICB2YXIgZmlsbFN0eWxlID0ge1xuICAgICAgICBncmVlbjogJ3JnYmEoNTAsMTAwLDUwLCcrYWxwaGErJyknLFxuICAgICAgICByZWQ6ICdyZ2JhKDEwMCw1MCw1MCwnK2FscGhhKycpJyxcbiAgICAgICAgdW5kZWZpbmVkOiAncmdiYSgwLDAsMCwnK2FscGhhKycpJyxcbiAgICB9XG4gICAgci5kcmF3UG9seWdvbih0aGlzLm1vdmVkX3BvaW50cywge1xuICAgICAgICBzdHJva2VTdHlsZTogc3Ryb2tlU3R5bGVzW3RoaXMuX2NvbG9yXSxcbiAgICAgICAgbGluZVdpZHRoOiAyLFxuICAgICAgICBmaWxsU3R5bGU6IGZpbGxTdHlsZVt0aGlzLl9jb2xvcl0sXG4gICAgfSk7XG5cbiAgICB0aGlzLl9lbnRlcl9mYWRlb3V0ID0gTWF0aC5tYXgoMCwgdGhpcy5fZW50ZXJfZmFkZW91dCAtIDEpXG4gICAgdGhpcy5fZXhpdF9mYWRlb3V0ID0gTWF0aC5tYXgoMCwgdGhpcy5fZXhpdF9mYWRlb3V0IC0gMSlcbn1cblxuR2F0ZS5wcm90b3R5cGUuaGFuZGxlQm9keSA9IGZ1bmN0aW9uKGJvZHkpIHtcbiAgICAvLyBJZ25vcmUgYm9kaWVzIGJlaW5nIGRyYWdnZWQuXG4gICAgaWYgKGJvZHkuZHJhZ2dpbmcpIHJldHVybjtcblxuICAgIHZhciB3YXNJbiA9IHRoaXMuY29udGFpbnMuaW5kZXhPZihib2R5KSAhPSAtMVxuICAgIHZhciBpc0luID0gdGhpcy50ZXN0Qm9keShib2R5KVxuICAgIGlmICghd2FzSW4gJiYgaXNJbikge1xuICAgICAgICB0aGlzLmNvbnRhaW5zLnB1c2goYm9keSlcbiAgICAgICAgdGhpcy5lbWl0KCdlbnRlcicsIHtib2R5OiBib2R5fSlcbiAgICB9XG4gICAgaWYgKHdhc0luICYmICFpc0luKSB7XG4gICAgICAgIHRoaXMuY29udGFpbnMgPSBfLndpdGhvdXQodGhpcy5jb250YWlucywgYm9keSk7XG4gICAgICAgIHRoaXMuZW1pdCgnZXhpdCcsIHtib2R5OiBib2R5fSlcbiAgICB9XG59XG5cbkdhdGUucHJvdG90eXBlLnRlc3RCb2R5ID0gZnVuY3Rpb24oYm9keSkge1xuICAgIGlmICghd2luZG93LmRlYnVnICYmIGJvZHkudHJlYXRtZW50ICE9PSAnZHluYW1pYycpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gY2hlY2tDb2xsaXNpb24odGhpcy5jb2xsaXNpb25fYm9keSwgYm9keSlcbiAgICAvLy8gdmFyIHBvcyA9IGJvZHkuc3RhdGUucG9zXG4gICAgLy8vIHJldHVybiB0aGlzLnRlc3RQb2ludCh7eDogcG9zLngsIHk6IHBvcy55fSlcbn1cblxuR2F0ZS5wcm90b3R5cGUudGVzdFBvaW50ID0gZnVuY3Rpb24odmVjdG9yaXNoKSB7XG4gICAgcmV0dXJuIFBoeXNpY3MuZ2VvbWV0cnkuaXNQb2ludEluUG9seWdvbihcbiAgICAgICAgdmVjdG9yaXNoLFxuICAgICAgICB0aGlzLnBvbHlnb24pO1xufVxuXG4vLyBHYXRlLnByb3RvdHlwZS5ydW5TdG9wd2F0Y2ggPSBmdW5jdGlvbihzdG9wd2F0Y2gpIHtcbiAgICAvLyB0aGlzLm9uKCdlbnRlcicsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgLy8gc3RvcHdhdGNoLnJlc2V0KCk7XG4gICAgICAgIC8vIHN0b3B3YXRjaC5zdGFydCgpO1xuICAgIC8vIH0pO1xuICAgIC8vIHRoaXMub24oJ2V4aXQnLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIC8vIHN0b3B3YXRjaC5zdG9wKCk7XG4gICAgLy8gfSk7XG4vLyB9XG5cbi8qKlxuICogRGVidWdnaW5nIGZ1bmN0aW9uIHRvIGxpc3RlbiB0byBteSBvd24gZXZlbnRzIGFuZCBjb25zb2xlLmxvZyB0aGVtLlxuICovXG5HYXRlLnByb3RvdHlwZS5zcGVha0xvdWRseSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMub24oJ2VudGVyJywgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICBjb25zb2xlLmxvZygnZW50ZXInLCBkYXRhLmJvZHkpXG4gICAgfSlcbiAgICB0aGlzLm9uKCdleGl0JywgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICBjb25zb2xlLmxvZygnZXhpdCcsIGRhdGEuYm9keSlcbiAgICB9KVxuICAgIHJldHVybiB7YnV0Q2FycnlBQmlnU3RpY2s6ICcnfVxufVxuXG5fLmV4dGVuZChHYXRlLnByb3RvdHlwZSwgUGh5c2ljcy51dGlsLnB1YnN1Yi5wcm90b3R5cGUpXG4iLCJcbnZhciBDYW5HcmFwaCA9IHJlcXVpcmUoJy4vY2FuZ3JhcGgnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEdyYXBoXG5cbmZ1bmN0aW9uIGdldERhdHVtKGl0ZW0pIHtcbiAgICByZXR1cm4gaXRlbS5hdHRyLnNwbGl0KCcuJykucmVkdWNlKGZ1bmN0aW9uIChub2RlLCBhdHRyKSB7XG4gICAgICAgIHJldHVybiBub2RlW2F0dHJdXG4gICAgfSwgaXRlbS5ib2R5LnN0YXRlKVxufVxuXG5mdW5jdGlvbiBHcmFwaChwYXJlbnQsIHRyYWNraW5nLCBvcHRpb25zKSB7XG4gICAgdGhpcy5vID0gXy5leHRlbmQoe1xuICAgICAgICB0b3A6IDEwLFxuICAgICAgICBsZWZ0OiAxMCxcbiAgICAgICAgd2lkdGg6IDYwMCxcbiAgICAgICAgaGVpZ2h0OiA0MDAsXG4gICAgICAgIHdvcmxkSGVpZ2h0OiAyMDBcbiAgICB9LCBvcHRpb25zKVxuICAgIHRoaXMudHJhY2tpbmcgPSB0cmFja2luZ1xuICAgIHRoaXMuZGF0YSA9IFtdXG4gICAgdGhpcy5ub2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJylcbiAgICB0aGlzLm5vZGUuY2xhc3NOYW1lID0gJ2dyYXBoJ1xuICAgIHRoaXMubm9kZS53aWR0aCA9IHRoaXMuby53aWR0aFxuICAgIHRoaXMubm9kZS5oZWlnaHQgPSB0aGlzLm8uaGVpZ2h0XG4gICAgdGhpcy5ub2RlLnN0eWxlLnRvcCA9IHRoaXMuby50b3AgKyAncHgnXG4gICAgdGhpcy5ub2RlLnN0eWxlLmxlZnQgPSB0aGlzLm8ubGVmdCArICdweCdcbiAgICB2YXIgbnVtZ3JhcGhzID0gT2JqZWN0LmtleXModHJhY2tpbmcpLmxlbmd0aFxuICAgIHZhciBncmFwaGhlaWdodCA9IHRoaXMuby5oZWlnaHQgLyBudW1ncmFwaHNcbiAgICBwYXJlbnQuYXBwZW5kQ2hpbGQodGhpcy5ub2RlKVxuXG4gICAgdGhpcy5ncmFwaHMgPSB7fVxuICAgIHZhciBpID0gMFxuICAgIGZvciAodmFyIG5hbWUgaW4gdHJhY2tpbmcpIHtcbiAgICAgICAgdGhpcy5ncmFwaHNbbmFtZV0gPSBuZXcgQ2FuR3JhcGgoe1xuICAgICAgICAgICAgbm9kZTogdGhpcy5ub2RlLFxuICAgICAgICAgICAgbWluc2NhbGU6IHRyYWNraW5nW25hbWVdLm1pbnNjYWxlLFxuICAgICAgICAgICAgdGl0bGU6IHRyYWNraW5nW25hbWVdLnRpdGxlLFxuICAgICAgICAgICAgdG9wOiBncmFwaGhlaWdodCAqIGkrKyxcbiAgICAgICAgICAgIGxlZnQ6IDAsXG4gICAgICAgICAgICB3aWR0aDogdGhpcy5vLndpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0OiBncmFwaGhlaWdodCxcbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICAvKlxuICAgIHRoaXMuZ3JhcGggPSBuZXcgUmlja3NoYXcuR3JhcGgoe1xuICAgICAgICBlbGVtZW50OiB0aGlzLm5vZGUsXG4gICAgICAgIHdpZHRoOiA2MDAsXG4gICAgICAgIGhlaWdodDogNjAwLFxuICAgICAgICByZW5kZXJlcjogJ2xpbmUnLFxuICAgICAgICBzZXJpZXM6IG5ldyBSaWNrc2hhdy5TZXJpZXMoXG4gICAgICAgICAgICB0cmFja2luZy5tYXAoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge25hbWU6IGl0ZW0ubmFtZX1cbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgdW5kZWZpbmVkLCB7XG4gICAgICAgICAgICAgICAgdGltZUludGVydmFsOiAyNTAsXG4gICAgICAgICAgICAgICAgbWF4RGF0YVBvaW50czogMTAwLFxuICAgICAgICAgICAgICAgIHRpbWVCYXNlOiBuZXcgRGF0ZSgpLmdldFRpbWUoKSAvIDEwMDBcbiAgICAgICAgICAgIH1cbiAgICAgICAgKVxuICAgIH0pXG4gICAgKi9cbn1cblxuR3JhcGgucHJvdG90eXBlID0ge1xuICAgIHVwZGF0ZURhdGE6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGRhdGEgPSB7fVxuICAgICAgICB2YXIgaGVpZ2h0ID0gdGhpcy5vLndvcmxkSGVpZ2h0XG4gICAgICAgIHRoaXMubm9kZS5nZXRDb250ZXh0KCcyZCcpLmNsZWFyUmVjdCgwLCAwLCB0aGlzLm5vZGUud2lkdGgsIHRoaXMubm9kZS5oZWlnaHQpXG4gICAgICAgIGZvciAodmFyIG5hbWUgaW4gdGhpcy50cmFja2luZykge1xuICAgICAgICAgICAgdGhpcy5ncmFwaHNbbmFtZV0uYWRkUG9pbnQodGhpcy5nZXREYXR1bShuYW1lKSlcbiAgICAgICAgICAgIHRoaXMuZ3JhcGhzW25hbWVdLmRyYXcoKVxuICAgICAgICB9XG4gICAgfSxcbiAgICBnZXREYXR1bTogZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgICAgdmFyIGl0ZW0gPSB0aGlzLnRyYWNraW5nW25hbWVdXG4gICAgICAgIGlmIChpdGVtLmZuKSB7XG4gICAgICAgICAgICByZXR1cm4gaXRlbS5mbigpO1xuICAgICAgICB9IGVsc2UgaWYgKGl0ZW0uYXR0ciA9PT0gJ3Bvcy55Jykge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuby53b3JsZEhlaWdodCAtIGl0ZW0uYm9keS5zdGF0ZS5wb3MueVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGdldERhdHVtKGl0ZW0pXG4gICAgICAgIH1cbiAgICB9LFxuICAgIHVwZGF0ZTogZnVuY3Rpb24gKHRpbWVzdGVwKSB7XG4gICAgICAgIHRoaXMudXBkYXRlRGF0YSgpXG4gICAgfVxufVxuXG4iLCJ2YXIgQmFzZSA9IHJlcXVpcmUoJy4vYmFzZScpO1xudmFyIEdhdGUgPSByZXF1aXJlKCcuL2dhdGUnKTtcbnZhciBTdG9wd2F0Y2ggPSByZXF1aXJlKCcuL3N0b3B3YXRjaCcpO1xudmFyIExvZ0Jvb2sgPSByZXF1aXJlKCcuL2xvZ2Jvb2snKTtcbnZhciBQbGF5UGF1c2UgPSByZXF1aXJlKCcuL3BsYXlwYXVzZScpO1xudmFyIEhpbGxzSW50cm8gPSByZXF1aXJlKCcuL2ludHJvL2hpbGxzX2ludHJvLmpzeCcpO1xudmFyIGhpbGxzRGF0YUNoZWNrZXIgPSByZXF1aXJlKCcuL2hpbGxzZGF0YWNoZWNrZXInKTtcbnZhciBDYXZlRHJhdyA9IHJlcXVpcmUoJy4vY2F2ZWRyYXcnKTtcbnZhciB1dGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XG52YXIgdGVycmFpbiA9IHJlcXVpcmUoJy4vdGVycmFpbicpO1xuXG5mdW5jdGlvbiByYW5kb20obWluLCBtYXgpe1xuICAgIHJldHVybiAoTWF0aC5yYW5kb20oKSAqIChtYXgtbWluKSArIG1pbil8MFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2UuZXh0ZW5kKGZ1bmN0aW9uIEhpbGxzKGNvbnRhaW5lciwgb3B0aW9ucykge1xuICAgIEJhc2UuY2FsbCh0aGlzLCBjb250YWluZXIsIG9wdGlvbnMsIFwiaW1hZ2VzL2xhYl9iYWNrZ3JvdW5kLmpwZ1wiLFxuICAgICAgICB0cnVlIC8qIGRpc2FibGVCb3VuZHMgKi8pXG59LCB7XG4gICAgZHJvcE9iamVjdHM6IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgICAgIHRoaXMuYmFsbCA9IFBoeXNpY3MuYm9keSgnY2lyY2xlJywge1xuICAgICAgICAgICAgeDogMjUwLFxuICAgICAgICAgICAgeTogNDAwLFxuICAgICAgICAgICAgdng6IC1NYXRoLnJhbmRvbSgpICogMC4xLFxuICAgICAgICAgICAgcmFkaXVzOiAyMCxcbiAgICAgICAgICAgIG1hc3M6IDkwMCxcbiAgICAgICAgICAgIGNvZjogMC4xLFxuICAgICAgICAgICAgcmVzdGl0dXRpb246IDAuMDEsXG4gICAgICAgICAgICBkaXNwbGF5TmFtZTogXCJCb3dsaW5nIEJhbGxcIixcbiAgICAgICAgICAgIHN0eWxlczoge1xuICAgICAgICAgICAgICAgIGltYWdlOiBcImltYWdlcy9ib3dsaW5nX2JhbGwucG5nXCJcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMud29ybGQuYWRkKHRoaXMuYmFsbCk7XG4gICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgc2V0VGltZW91dChjYWxsYmFjaywgNTAwKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgIHN0YXJ0V2Fsa3Rocm91Z2g6IGZ1bmN0aW9uICgpIHtcbiAgICAgICBIaWxsc0ludHJvKHRoaXMsIGZ1bmN0aW9uIChoeXBvdGhlc2lzKSB7XG4gICAgICAgICAgIGNvbnNvbGUubG9nKCdHb3QgdGhlIGh5cG90aGVzaXMhIScsIGh5cG90aGVzaXMpO1xuICAgICAgICAgICB0aGlzLnNldHVwRGF0YUNoZWNrZXIoaHlwb3RoZXNpcyk7XG4gICAgICAgfS5iaW5kKHRoaXMpKVxuICAgfSxcblxuICAgIHNldHVwRGF0YUNoZWNrZXI6IGZ1bmN0aW9uIChoeXBvdGhlc2lzKSB7XG4gICAgICAgIHZhciBkYXRhQ2hlY2tlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgIGRhdGFDaGVja2VyLmNsYXNzTmFtZSA9IFwiaGlsbHMtZGF0YS1jaGVja2VyXCI7XG4gICAgICAgIHRoaXMuc2lkZUJhci5hcHBlbmRDaGlsZChkYXRhQ2hlY2tlcik7XG4gICAgICAgIGhpbGxzRGF0YUNoZWNrZXIoZGF0YUNoZWNrZXIsIHRoaXMubG9nQm9vaywgaHlwb3RoZXNpcyk7XG4gICAgfSxcblxuICAgIHNldHVwU2xpZGVyOiBmdW5jdGlvbiAoY29udGFpbmVyKSB7XG4gICAgICAgIHRoaXMuc2xpZGVyID0gJCgnPGlucHV0IHR5cGU9XCJyYW5nZVwiIG1pbj1cIjBcIiBtYXg9XCIxNDBcIiBzdGVwPVwiMTBcIiB2YWx1ZT1cIjEwMFwiLz4nKTtcbiAgICAgICAgdGhpcy5zbGlkZXJEaXNwbGF5ID0gJCgnPHNwYW4+MTAwIGNtPC9zcGFuPicpO1xuICAgICAgICB2YXIgaGFuZGxlU2xpZGUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0dXBUZXJyYWluKDIwMCwgdGhpcy5zbGlkZXIudmFsKCkpO1xuICAgICAgICAgICAgdGhpcy5zbGlkZXJEaXNwbGF5Lmh0bWwodGhpcy5zbGlkZXIudmFsKCkgKyBcIiBjbVwiKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLnNsaWRlci5jaGFuZ2UoaGFuZGxlU2xpZGUpLm9uKCdpbnB1dCcsIGhhbmRsZVNsaWRlKTtcbiAgICAgICAgdmFyIGRpdiA9ICQoJzxkaXYgY2xhc3M9XCJoaWxsLXNsaWRlclwiLz4nKTtcbiAgICAgICAgJChjb250YWluZXIpLmFwcGVuZChkaXYpO1xuICAgICAgICBkaXYuYXBwZW5kKHRoaXMuc2xpZGVyKTtcbiAgICAgICAgZGl2LmFwcGVuZCh0aGlzLnNsaWRlckRpc3BsYXkpO1xuICAgIH0sXG5cbiAgICBzZXR1cFRlcnJhaW46IGZ1bmN0aW9uIChyYW1wSGVpZ2h0LCBoaWxsSGVpZ2h0KSB7XG4gICAgICAgIGlmICh0aGlzLnRlcnJhaW5DYW52YXMpIHtcbiAgICAgICAgICAgIHRoaXMudGVycmFpbkNhbnZhcy5jbGVhcigpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnRlcnJhaW5CZWhhdmlvcikge1xuICAgICAgICAgICAgdGhpcy53b3JsZC5yZW1vdmUodGhpcy50ZXJyYWluQmVoYXZpb3IpO1xuICAgICAgICB9XG4gICAgICAgIHZhciB0ZXJyYWluSGVpZ2h0ID0gdGhpcy5ta1RlcnJhaW5IZWlnaHRGdW5jdGlvbihyYW1wSGVpZ2h0LCBoaWxsSGVpZ2h0KTtcbiAgICAgICAgdGhpcy50ZXJyYWluQ2FudmFzLmRyYXcodGVycmFpbkhlaWdodClcbiAgICAgICAgdGhpcy50ZXJyYWluQmVoYXZpb3IgPSBQaHlzaWNzLmJlaGF2aW9yKCd0ZXJyYWluLWNvbGxpc2lvbi1kZXRlY3Rpb24nLCB7XG4gICAgICAgICAgICBhYWJiOiBQaHlzaWNzLmFhYmIoMCwgMCwgdGhpcy5vcHRpb25zLndpZHRoLCB0aGlzLm9wdGlvbnMuaGVpZ2h0KSxcbiAgICAgICAgICAgIHRlcnJhaW5IZWlnaHQ6IHRlcnJhaW5IZWlnaHQsXG4gICAgICAgICAgICByZXN0aXR1dGlvbjogMC4yLFxuICAgICAgICAgICAgY29mOiAwLjFcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMud29ybGQuYWRkKHRoaXMudGVycmFpbkJlaGF2aW9yKTtcbiAgICB9LFxuXG4gICAgbWtUZXJyYWluSGVpZ2h0RnVuY3Rpb246IGZ1bmN0aW9uIChyYW1wSGVpZ2h0LCBoaWxsSGVpZ2h0KSB7XG4gICAgICAgIHZhciByYW1wV2lkdGggPSB0aGlzLm9wdGlvbnMud2lkdGggLyA0O1xuICAgICAgICB2YXIgcmFtcFNjYWxlID0gcmFtcEhlaWdodCAvIE1hdGgucG93KHJhbXBXaWR0aCwgMik7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoeCkge1xuICAgICAgICAgICAgaWYgKHggPCByYW1wV2lkdGgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gTWF0aC5wb3cocmFtcFdpZHRoIC0geCwgMikgKiByYW1wU2NhbGU7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHggPCAzICogcmFtcFdpZHRoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGhpbGxIZWlnaHQgLyAyICsgTWF0aC5jb3MoTWF0aC5QSSAqIHggLyByYW1wV2lkdGgpICogaGlsbEhlaWdodCAvIDI7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgfSxcblxuICAgIHNldHVwOiBmdW5jdGlvbiAoY29udGFpbmVyKSB7XG4gICAgICAgIHZhciB3b3JsZCA9IHRoaXMud29ybGRcbiAgICAgICAgdmFyIGdyYXZpdHkgPSBQaHlzaWNzLmJlaGF2aW9yKCdjb25zdGFudC1hY2NlbGVyYXRpb24nKVxuICAgICAgICBncmF2aXR5LnNldEFjY2VsZXJhdGlvbih7eDogMCwgeTouMDAwM30pO1xuICAgICAgICB3b3JsZC5hZGQoZ3Jhdml0eSk7XG4gICAgICAgIC8vIHJlZ2lzdGVyLCBidXQgZG9uJ3Qgc2V0IHVwIHRoZSBiZWhhdmlvcjsgdGhhdCBpcyBkb25lIGluIHNldHVwVGVycmFpbigpXG4gICAgICAgIFBoeXNpY3MuYmVoYXZpb3IoJ3RlcnJhaW4tY29sbGlzaW9uLWRldGVjdGlvbicsIHRlcnJhaW4pO1xuICAgICAgICB0aGlzLnRlcnJhaW5DYW52YXMgPSBuZXcgQ2F2ZURyYXcoJCgnI3VuZGVyLWNhbnZhcycpLCA5MDAsIDcwMClcbiAgICAgICAgdGhpcy5zZXR1cFRlcnJhaW4oMjAwLCAxMDApO1xuXG4gICAgICAgIHZhciBzaWRlQmFyID0gdGhpcy5zaWRlQmFyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgc2lkZUJhci5jbGFzc05hbWUgPSBcInNpZGUtYmFyXCI7XG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChzaWRlQmFyKTtcbiAgICAgICAgdmFyIHRvcEdhdGUgPSBuZXcgR2F0ZSh3b3JsZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1dGlsLm1ha2VSZWN0KDAsIDAsIDEwLCAyMDApLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFs3NTAsIDYwMF0sIG51bGwsIHtkZWJ1ZzogdHJ1ZSwgc2hvdzogdHJ1ZSwgY29sb3I6ICdncmVlbid9KTtcbiAgICAgICAgdmFyIGJvdHRvbUdhdGUgPSBuZXcgR2F0ZSh3b3JsZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1dGlsLm1ha2VSZWN0KDAsIDAsIDEwLCAyMDApLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFs4MDAsIDYwMF0sIG51bGwsIHtkZWJ1ZzogdHJ1ZSwgc2hvdzogdHJ1ZSwgY29sb3I6ICdyZWQnfSk7XG4gICAgICAgIHZhciBsb2dDb2x1bW5zID0gW3tuYW1lOiBcIjEwMCBjbVwifV07XG4gICAgICAgIHZhciBsb2dCb29rID0gdGhpcy5sb2dCb29rID0gbmV3IExvZ0Jvb2sod29ybGQsIHNpZGVCYXIsIDMsIGxvZ0NvbHVtbnMpO1xuICAgICAgICB0b3BHYXRlLm9uKCdlbnRlcicsIGZ1bmN0aW9uKGVsZW0pIHtcbiAgICAgICAgICAgIHZhciBjb2xOYW1lID0gdGhpcy5zbGlkZXIudmFsKCkudG9TdHJpbmcoKSArIFwiIGNtXCI7XG4gICAgICAgICAgICBsb2dCb29rLmhhbmRsZVN0YXJ0KGNvbE5hbWUsIGVsZW0uYm9keS51aWQpO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICBib3R0b21HYXRlLm9uKCdlbnRlcicsIGZ1bmN0aW9uKGVsZW0pIHtcbiAgICAgICAgICAgIHZhciBjb2xOYW1lID0gdGhpcy5zbGlkZXIudmFsKCkudG9TdHJpbmcoKSArIFwiIGNtXCI7XG4gICAgICAgICAgICBsb2dCb29rLmhhbmRsZUVuZChjb2xOYW1lLCBlbGVtLmJvZHkudWlkKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgdmFyIGJ1dHRvbkNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgIHZhciBwbGF5UGF1c2UgPSBuZXcgUGxheVBhdXNlKHdvcmxkLCBidXR0b25Db250YWluZXIpO1xuICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoYnV0dG9uQ29udGFpbmVyKTtcbiAgICAgICAgdGhpcy5zZXR1cFNsaWRlcihidXR0b25Db250YWluZXIpO1xuXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMud2Fsaykge1xuICAgICAgICAgICB0aGlzLnN0YXJ0V2Fsa3Rocm91Z2goKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5kcm9wT2JqZWN0cygpO1xuICAgICAgICAgICAgdGhpcy5zZXR1cERhdGFDaGVja2VyKCdzYW1lJyk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUGljayB1cCBvbmUgdGhlIGJhbGwgYW5kIGRyb3AgaXQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gY2FsbGJhY2sgR2V0cyBjYWxsZWQgd2hlbiB0aGUgZGVtb25zdHJhdGlvbiBpcyBvdmVyLlxuICAgICAqL1xuICAgIGRlbW9uc3RyYXRlRHJvcDogZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIGJhbGwgPSB0aGlzLmJhbGw7XG4gICAgICAgIHZhciB0YXJnZXRYID0gMjA7XG4gICAgICAgIHZhciB0YXJnZXRZID0gNDk1O1xuXG4gICAgICAgIGJhbGwudHJlYXRtZW50ID0gJ2tpbmVtYXRpYyc7XG4gICAgICAgIGJhbGwuc3RhdGUudmVsLnggPSAodGFyZ2V0WCAtIGJhbGwuc3RhdGUucG9zLngpIC8gMTUwMDtcbiAgICAgICAgYmFsbC5zdGF0ZS52ZWwueSA9ICh0YXJnZXRZIC0gYmFsbC5zdGF0ZS5wb3MueSkgLyAxNTAwO1xuICAgICAgICBiYWxsLnJlY2FsYygpO1xuXG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBiYWxsLnRyZWF0bWVudCA9ICdzdGF0aWMnO1xuICAgICAgICAgICAgYmFsbC5zdGF0ZS5wb3MueCA9IHRhcmdldFg7XG4gICAgICAgICAgICBiYWxsLnN0YXRlLnBvcy55ID0gdGFyZ2V0WTtcbiAgICAgICAgICAgIGJhbGwuc3RhdGUudmVsLnggPSAwO1xuICAgICAgICAgICAgYmFsbC5zdGF0ZS52ZWwueSA9IDA7XG4gICAgICAgICAgICBiYWxsLnJlY2FsYygpO1xuXG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGJhbGwudHJlYXRtZW50ID0gJ2R5bmFtaWMnO1xuICAgICAgICAgICAgICAgIGJhbGwucmVjYWxjKCk7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICAgICAgICB9LCAzMDAwKVxuICAgICAgICAgICAgfSwgMTUwMClcbiAgICAgICAgfSwgMTUwMClcbiAgICB9XG59KTtcbiIsInZhciBEYXRhQ2hlY2tlciA9IHJlcXVpcmUoJy4vZGF0YWNoZWNrZXIuanN4Jyk7XG52YXIgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGhpbGxzRGF0YUNoZWNrZXI7XG5cbnZhciBfaW5pdGlhbFRleHQgPSBcIkRvIGFuIGV4cGVyaW1lbnQgdG8gc2VlIGlmIHlvdSBjYW4gZmlndXJlIG91dCB3aGV0aGVyIGEgYmFsbCB3aGljaCByb2xscyBvdmVyIGEgaGlsbCBjb21lcyBvdXQgYXQgYSBkaWZmZXJlbnQgc3BlZWQsIGFuZCBsZXQgbWUga25vdyB3aGVuIHlvdSdyZSBkb25lIVwiO1xuXG52YXIgX25leHRVUkwgPSBcIj9CYWNvblwiO1xuXG52YXIgX2h5cG90aGVzZXMgPSBbXG4gICAge1xuICAgICAgICBuYW1lOiBcInNhbWVcIixcbiAgICAgICAgYnV0dG9uVGV4dDogXCJUaGUgc3BlZWQgZG9lcyBub3QgZGVwZW5kIG9uIHRoZSBzaXplIG9mIHRoZSBoaWxsLlwiLFxuICAgICAgICB0ZXh0OiBcInRoYXQgdGhlIHNwZWVkIHdpbGwgbm90IGRlcGVuZCBvbiB0aGUgc2l6ZSBvZiB0aGUgaGlsbFwiLFxuICAgIH0sXG4gICAge1xuICAgICAgICBuYW1lOiBcImZhc3RlclwiLFxuICAgICAgICBidXR0b25UZXh0OiBcIlRoZSBiYWxsIGNvbWVzIG91dCBmYXN0ZXIgaWYgdGhlIGhpbGwgaXMgbGFyZ2VyLlwiLFxuICAgICAgICB0ZXh0OiBcInRoYXQgdGhlIGJhbGwgd2lsbCBjb21lIG91dCBmYXN0ZXIgaWYgdGhlIGhpbGwgaXMgbGFyZ2VyXCIsXG4gICAgfSxcbiAgICB7XG4gICAgICAgIG5hbWU6IFwic2xvd2VyXCIsXG4gICAgICAgIGJ1dHRvblRleHQ6IFwiVGhlIGJhbGwgY29tZXMgb3V0IHNsb3dlciBpZiB0aGUgaGlsbCBpcyBsYXJnZXIuXCIsXG4gICAgICAgIHRleHQ6IFwidGhhdCB0aGUgYmFsbCB3aWxsIGNvbWUgb3V0IHNsb3dlciBpZiB0aGUgaGlsbCBpcyBsYXJnZXJcIixcbiAgICB9LFxuXVxuXG5mdW5jdGlvbiBoaWxsc0RhdGFDaGVja2VyKGNvbnRhaW5lciwgbG9nQm9vaywgaHlwb3RoZXNpcykge1xuICAgIHJldHVybiBSZWFjdC5yZW5kZXJDb21wb25lbnQoRGF0YUNoZWNrZXIoe1xuICAgICAgICBpbml0aWFsVGV4dDogX2luaXRpYWxUZXh0LFxuICAgICAgICBpbml0aWFsSHlwb3RoZXNpczogaHlwb3RoZXNpcyxcbiAgICAgICAgcG9zc2libGVIeXBvdGhlc2VzOiBfaHlwb3RoZXNlcyxcbiAgICAgICAgcmVzdWx0OiBmdW5jdGlvbiAoc3RhdGUpIHtyZXR1cm4gX3Jlc3VsdChsb2dCb29rLCBzdGF0ZSk7fSxcbiAgICAgICAgbmV4dFVSTDogX25leHRVUkwsXG4gICAgfSksIGNvbnRhaW5lcik7XG59XG5cbmZ1bmN0aW9uIF9yZXN1bHQobG9nQm9vaywgc3RhdGUpIHtcbiAgICB2YXIgY2xlYW5lZERhdGEgPSB7fVxuICAgIGZvciAodmFyIG5hbWUgaW4gbG9nQm9vay5kYXRhKSB7XG4gICAgICAgIGlmIChsb2dCb29rLmRhdGFbbmFtZV0pIHtcbiAgICAgICAgICAgIHZhciBoZWlnaHQgPSBuYW1lLnNsaWNlKDAsIC0zKTsgLy8gcmVtb3ZlIFwiIGNtXCJcbiAgICAgICAgICAgIGNsZWFuZWREYXRhW2hlaWdodF0gPSBsb2dCb29rLmRhdGFbbmFtZV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gY2hlY2sgdGhhdCB0aGV5IGhhdmUgZW5vdWdoIGRhdGE6IGF0IGxlYXN0IDMgcG9pbnRzIGVhY2ggaW4gYXQgbGVhc3QgNFxuICAgIC8vIGhpbGwgc2l6ZXMsIGluY2x1ZGluZyBvbmUgbGVzcyB0aGFuIDUwY20gYW5kIG9uZSBncmVhdGVyIHRoYW4gMTAwY20uXG4gICAgaWYgKF8uc2l6ZShjbGVhbmVkRGF0YSkgPCA0KSB7XG4gICAgICAgIHJldHVybiBcIllvdSBvbmx5IGhhdmUgZGF0YSBmb3IgYSBmZXcgcG9zc2libGUgaGlsbHMhICBNYWtlIHN1cmUgeW91IGhhdmUgZGF0YSBvbiBhIG51bWJlciBvZiBwb3NzaWJsZSBoaWxscyBzbyB5b3Uga25vdyB5b3VyIHJlc3VsdHMgYXBwbHkgdG8gYW55IGhpbGwgc2l6ZS5cIjtcbiAgICB9IGVsc2UgaWYgKF8uZmlsdGVyKGNsZWFuZWREYXRhLCBmdW5jdGlvbiAoZGF0YSwgaGVpZ2h0KSB7cmV0dXJuIGRhdGEubGVuZ3RoID49IDM7fSkubGVuZ3RoIDwgNCkge1xuICAgICAgICByZXR1cm4gXCJZb3Ugb25seSBoYXZlIGEgbGl0dGxlIGJpdCBvZiBkYXRhIGZvciBzb21lIG9mIHRob3NlIHBvc3NpYmxlIGhpbGxzLiAgTWFrZSBzdXJlIHlvdSBoYXZlIHNldmVyYWwgZGF0YSBwb2ludHMgb24gYSBudW1iZXIgb2YgcG9zc2libGUgaGlsbHMgc28geW91IGtub3cgeW91ciByZXN1bHRzIGFwcGx5IHRvIGFueSBoaWxsIHNpemUuXCI7XG4gICAgfSBlbHNlIGlmIChfLm1heChfLm1hcChfLmtleXMoY2xlYW5lZERhdGEpLCBwYXJzZUludCkpIDw9IDEwMCkge1xuICAgICAgICByZXR1cm4gXCJZb3UgZG9uJ3QgaGF2ZSBhbnkgZGF0YSBmb3IgbGFyZ2UgaGlsbHMhICBUcnkgY29sbGVjdGluZyBzb21lIGRhdGEgb24gbGFyZ2UgaGlsbHMgdG8gbWFrZSBzdXJlIHlvdXIgcmVzdWx0cyBhcHBseSB0byB0aGVtLlwiO1xuICAgIH0gZWxzZSBpZiAoXy5taW4oXy5tYXAoXy5rZXlzKGNsZWFuZWREYXRhKSwgcGFyc2VJbnQpKSA+PSA1MCkge1xuICAgICAgICByZXR1cm4gXCJZb3UgZG9uJ3QgaGF2ZSBhbnkgZGF0YSBmb3Igc21hbGwgaGlsbHMhICBUcnkgY29sbGVjdGluZyBzb21lIGRhdGEgb24gc21hbGwgaGlsbHMgdG8gbWFrZSBzdXJlIHlvdXIgcmVzdWx0cyBhcHBseSB0byB0aGVtLlwiO1xuICAgIH1cblxuICAgIC8vIGNoZWNrIHRoYXQgdGhleSBkb24ndCBoYXZlIGJpZyBvdXRsaWVycyBpbiBhbnkgb2YgdGhlaXIgY29sdW1ucy5cbiAgICB2YXIgYXZncyA9IHt9XG4gICAgZm9yICh2YXIgaGVpZ2h0IGluIGNsZWFuZWREYXRhKSB7XG4gICAgICAgIGF2Z3NbaGVpZ2h0XSA9IHV0aWwuYXZnKGNsZWFuZWREYXRhW2hlaWdodF0pO1xuICAgICAgICBpZiAoXy5hbnkoY2xlYW5lZERhdGFbaGVpZ2h0XSwgZnVuY3Rpb24gKGRhdHVtKSB7cmV0dXJuIE1hdGguYWJzKGF2Z3NbaGVpZ2h0XSAtIHBhcnNlSW50KGRhdHVtKSkgPiAzMDA7fSkpIHtcbiAgICAgICAgICAgIHJldHVybiBcIk9uZSBvZiB5b3VyIHJlc3VsdHMgZm9yIFwiK2hlaWdodCtcIiBjbSBsb29rcyBhIGJpdCBvZmYhICBUcnkgY29sbGVjdGluZyBzb21lIG1vcmUgZGF0YSB0byBtYWtlIHN1cmUgaXQncyBhIGZsdWtlLlwiXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBjaGVjayB0aGF0IHRoZWlyIHJlc3VsdHMgYXJlIGNvbnNpc3RlbnQgd2l0aCB0aGVpciBoeXBvdGhlc2lzLCBhbmQgdGhhdFxuICAgIC8vIHRoZWlyIGh5cG90aGVzaXMgaXMgY29ycmVjdC5cbiAgICB2YXIgdHJhbnNwb3NlZCA9IF8uemlwLmFwcGx5KF8ucGFpcnMoYXZncykpO1xuICAgIHZhciBjb3JyZWxhdGlvbiA9IHV0aWwuY29ycmVsYXRpb24oXy5tYXAodHJhbnNwb3NlZFswXSwgcGFyc2VJbnQpLCB0cmFuc3Bvc2VkWzFdKTtcbiAgICBpZiAoXG4gICAgICAgICAgICAoc3RhdGUuaHlwb3RoZXNpcyA9PT0gXCJzYW1lXCJcbiAgICAgICAgICAgICAgICAmJiBNYXRoLmFicyhfLm1heChfLnZhbHVlcyhhdmdzKSkgLSBfLm1pbihfLnZhbHVlcyhhdmdzKSkpID4gMTAwKVxuICAgICAgICAgICAgfHwgKHN0YXRlLmh5cG90aGVzaXMgPT09IFwiZmFzdGVyXCJcbiAgICAgICAgICAgICAgICAmJiBjb3JyZWxhdGlvbiA+IC0wLjUpIC8vIG5lZ2F0aXZlIGNvcnJlbGF0aW9uIHdvdWxkIGJlIHRhbGxlciA9PiBzaG9ydGVyIHRpbWUgPT4gZmFzdGVyXG4gICAgICAgICAgICB8fCAoc3RhdGUuaHlwb3RoZXNpcyA9PT0gXCJzbG93ZXJcIlxuICAgICAgICAgICAgICAgICYmIGNvcnJlbGF0aW9uIDwgMC41KSkge1xuICAgICAgICByZXR1cm4gXCJUaG9zZSByZXN1bHRzIGRvbid0IGxvb2sgdmVyeSBjb25zaXN0ZW50IHdpdGggeW91ciBoeXBvdGhlc2lzLiAgSXQncyBmaW5lIGlmIHlvdXIgaHlwb3RoZXNpcyB3YXMgZGlzcHJvdmVuLCB0aGF0J3MgaG93IHNjaWVuY2Ugd29ya3MhXCI7XG4gICAgfSBlbHNlIGlmIChcbiAgICAgICAgICAgIHN0YXRlLmh5cG90aGVzaXMgIT09IFwic2FtZVwiXG4gICAgICAgICAgICB8fCBfLm1heChfLnZhbHVlcyhhdmdzKSkgPiAyMDBcbiAgICAgICAgICAgIHx8IF8ubWluKF8udmFsdWVzKGF2Z3MpKSA8IDE0MCkge1xuICAgICAgICByZXR1cm4gXCJUaG9zZSByZXN1bHRzIGFyZSBjb25zaXN0ZW50LCBidXQgdGhleSBkb24ndCBsb29rIHF1aXRlIHJpZ2h0IHRvIG1lLiAgTWFrZSBzdXJlIHlvdSdyZSBkcm9wcGluZyB0aGUgYmFsbHMgZ2VudGx5IGZyb20gdGhlIHRvcCBvZiB0aGUgcmFtcCBlYWNoIHRpbWUuXCI7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxufVxuIiwiXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBCYXNlOiByZXF1aXJlKCcuL2Jhc2UnKSxcbiAgICBCYWNvbjogcmVxdWlyZSgnLi9iYWNvbi5qc3gnKSxcbiAgICBEZW1vOiByZXF1aXJlKCcuL2RlbW8nKSxcbiAgICBOZXd0b24xOiByZXF1aXJlKCcuL25ld3RvbjEnKSxcbiAgICBPcmJpdDogcmVxdWlyZSgnLi9vcmJpdCcpLFxuICAgIE1vb246IHJlcXVpcmUoJy4vbW9vbicpLFxuICAgIEFzdGVyb2lkczogcmVxdWlyZSgnLi9hc3Rlcm9pZHMnKSxcbiAgICBTbG9wZTogcmVxdWlyZSgnLi9zbG9wZScpLFxuICAgIERyb3A6IHJlcXVpcmUoJy4vZHJvcCcpLFxuICAgIFRyeUdyYXBoOiByZXF1aXJlKCcuL3RyeS1ncmFwaCcpLFxuICAgIENhdmVEcmF3OiByZXF1aXJlKCcuL2NhdmVkcmF3JyksXG4gICAgSGlsbHM6IHJlcXVpcmUoJy4vaGlsbHMnKSxcbn1cbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xuXG52YXIgV2Fsa3Rocm91Z2ggPSByZXF1aXJlKCcuL3dhbGstdGhyb3VnaC5qc3gnKVxudmFyIFBUID0gUmVhY3QuUHJvcFR5cGVzXG52YXIgU3RlcCA9IHJlcXVpcmUoJy4vc3RlcC5qc3gnKVxuXG52YXIgREVCVUcgPSBmYWxzZVxuXG5tb2R1bGUuZXhwb3J0cyA9IERyb3BJbnRybztcblxuZnVuY3Rpb24gRHJvcEludHJvKEV4ZXJjaXNlLCBnb3RIeXBvdGhlc2lzKSB7XG4gICAgdmFyIG5vZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQobm9kZSlcbiAgICBSZWFjdC5yZW5kZXJDb21wb25lbnQoV2Fsa3Rocm91Z2goe1xuICAgICAgICBzdGVwczogc3RlcHMsXG4gICAgICAgIG9uSHlwb3RoZXNpczogZ290SHlwb3RoZXNpcyxcbiAgICAgICAgb25Eb25lOiBmdW5jdGlvbiAoaHlwb3RoZXNpcykge1xuICAgICAgICAgICAgUmVhY3QudW5tb3VudENvbXBvbmVudEF0Tm9kZShub2RlKTtcbiAgICAgICAgICAgIG5vZGUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChub2RlKTtcbiAgICAgICAgfSxcbiAgICAgICAgRXhlcmNpc2U6IEV4ZXJjaXNlXG4gICAgfSksIG5vZGUpXG59XG5cblxudmFyIEJ1dHRvbkdyb3VwID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnQnV0dG9uR3JvdXAnLFxuICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogdGhpcy5wcm9wcy5jbGFzc05hbWV9LCBcbiAgICAgICAgICAgIHRoaXMucHJvcHMub3B0aW9ucy5tYXAoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICB2YXIgY2xzID0gXCJidG4gYnRuLWRlZmF1bHRcIlxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLnNlbGVjdGVkID09PSBpdGVtWzBdKSB7XG4gICAgICAgICAgICAgICAgICAgIGNscyArPSAnIGFjdGl2ZSdcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIFJlYWN0LkRPTS5idXR0b24oe2tleTogaXRlbVswXSwgY2xhc3NOYW1lOiBjbHMsIG9uQ2xpY2s6IHRoaXMucHJvcHMub25TZWxlY3QuYmluZChudWxsLCBpdGVtWzBdKX0sIGl0ZW1bMV0pO1xuICAgICAgICAgICAgfS5iaW5kKHRoaXMpKVxuICAgICAgICApO1xuICAgIH1cbn0pO1xuXG52YXIgc3RlcHMgPSBbXG4gICAgZnVuY3Rpb24gKHByb3BzKSB7XG4gICAgICAgIHJldHVybiBTdGVwKF8uZXh0ZW5kKHByb3BzLCB7XG4gICAgICAgICAgICBpZDogJ2hlbGxvJyxcbiAgICAgICAgICAgIHRpdGxlOiBcIkhpISBJJ20gU2lyIEZyYW5jaXMgQmFjb25cIixcbiAgICAgICAgICAgIHNob3dCYWNvbjogdHJ1ZSxcbiAgICAgICAgICAgIGJvZHk6IFwiSSB3YXMgbWFkZSBhIEtuaWdodCBvZiBFbmdsYW5kIGZvciBkb2luZyBhd2Vzb21lIFNjaWVuY2UuIFdlJ3JlIGdvaW5nIHRvIHVzZSBzY2llbmNlIHRvIGZpZ3VyZSBvdXQgY29vbCB0aGluZ3MgYWJvdXQgdGhlIHdvcmxkLlwiLFxuICAgICAgICAgICAgbmV4dDogXCJMZXQncyBkbyBzY2llbmNlIVwiXG4gICAgICAgIH0pKVxuICAgIH0sXG5cbiAgICBmdW5jdGlvbiAocHJvcHMpIHtcbiAgICAgICAgdmFyIGh5cG90aGVzaXMgPSBwcm9wcy5kYXRhLmh5cG90aGVzaXNcbiAgICAgICAgcmV0dXJuIFN0ZXAoXy5leHRlbmQocHJvcHMsIHtcbiAgICAgICAgICAgIGlkOiAnZGVzY3JpcHRpb24nLFxuICAgICAgICAgICAgdGl0bGU6IFwiRXhwZXJpbWVudCAjMVwiLFxuICAgICAgICAgICAgb25VcGRhdGU6IGZ1bmN0aW9uIChwcmV2UHJvcHMpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5kYXRhLmh5cG90aGVzaXMgJiYgIXByZXZQcm9wcy5kYXRhLmh5cG90aGVzaXMpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvcHMub25IeXBvdGhlc2lzKHByb3BzLmRhdGEuaHlwb3RoZXNpcyk7XG4gICAgICAgICAgICAgICAgICAgIERFQlVHID8gcHJvcHMub25OZXh0KCkgOiBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3BzLm9uTmV4dCgpXG4gICAgICAgICAgICAgICAgICAgIH0sIDUwMClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYm9keTogUmVhY3QuRE9NLmRpdihudWxsLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00ucChudWxsLCBcIldoYXQgZmFsbHMgZmFzdGVyOiBhIHRlbm5pcyBiYWxsIG9yIGEgYm93bGluZyBiYWxsP1wiKSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLnAobnVsbCwgXCJBIFwiLCBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcInVsaW5lXCJ9LCBcIkh5cG90aGVzaXNcIiksIFwiIGlzIHdoYXQgeW91IHRoaW5rIHdpbGwgaGFwcGVuLlwiKSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmhyKG51bGwpLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwibGFyZ2VcIn0sIFwiSSB0aGluazpcIiwgXG4gICAgICAgICAgICAgICAgICAgIEJ1dHRvbkdyb3VwKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogXCJ3YWxrdGhyb3VnaF9oeXBvdGhlc2VzXCIsIFxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWQ6IGh5cG90aGVzaXMsIFxuICAgICAgICAgICAgICAgICAgICAgICAgb25TZWxlY3Q6IHByb3BzLnNldERhdGEuYmluZChudWxsLCAnaHlwb3RoZXNpcycpLCBcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnM6IFtbXCJ0ZW5uaXNcIiwgXCJUaGUgdGVubmlzIGJhbGwgZmFsbHMgZmFzdGVyXCJdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtcImJvd2xpbmdcIiwgXCJUaGUgYm93bGluZyBiYWxsIGZhbGxzIGZhc3RlclwiXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBbXCJzYW1lXCIsIFwiVGhleSBmYWxsIHRoZSBzYW1lXCJdXX0pXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIC8qKmh5cG90aGVzaXMgJiYgPHAgY2xhc3NOYW1lPVwid2Fsa3Rocm91Z2hfZ3JlYXRcIj5HcmVhdCEgTm93IHdlIGRvIHNjaWVuY2U8L3A+KiovXG4gICAgICAgICAgICApXG4gICAgICAgIH0pKVxuICAgIH0sXG5cbiAgICBmdW5jdGlvbiAocHJvcHMpIHtcbiAgICAgICAgdmFyIGZpcnN0QmFsbCA9ICd0ZW5uaXMnXG4gICAgICAgIHZhciBzZWNvbmRCYWxsID0gJ2Jvd2xpbmcnXG4gICAgICAgIHZhciBwcm92ZXIgPSBwcm9wcy5kYXRhLnByb3ZlclxuICAgICAgICB2YXIgaHlwb3RoZXNpcyA9IHByb3BzLmRhdGEuaHlwb3RoZXNpc1xuXG4gICAgICAgIGlmIChoeXBvdGhlc2lzID09PSAnYm93bGluZycpIHtcbiAgICAgICAgICAgIGZpcnN0QmFsbCA9ICdib3dsaW5nJ1xuICAgICAgICAgICAgc2Vjb25kQmFsbCA9ICd0ZW5uaXMnXG4gICAgICAgIH1cblxuICAgICAgICB2YXIgcmVzcG9uc2VzID0ge1xuICAgICAgICAgICAgJ3Rlbm5pcyc6ICdOb3BlLiBUaGF0IHdvdWxkIHNob3cgdGhhdCB0aGUgdGVubmlzIGJhbGwgZmFsbHMgZmFzdGVyJyxcbiAgICAgICAgICAgICdib3dsaW5nJzogJ05vcGUuIFRoYXQgd291bGQgc2hvdyB0aGF0IHRoZSBib3dsaW5nIGJhbGwgZmFsbHMgZmFzdGVyJyxcbiAgICAgICAgICAgICdzYW1lJzogJ05vcGUuIFRoYXQgd291bGQgc2hvdyB0aGF0IHRoZXkgZmFsbCB0aGUgc2FtZSdcbiAgICAgICAgfVxuICAgICAgICB2YXIgY29ycmVjdCA9IHtcbiAgICAgICAgICAgICd0ZW5uaXMnOiAnbGVzcycsXG4gICAgICAgICAgICAnYm93bGluZyc6ICdsZXNzJyxcbiAgICAgICAgICAgICdzYW1lJzogJ3NhbWUnXG4gICAgICAgIH1cbiAgICAgICAgdmFyIHByb3ZlclJlc3BvbnNlXG4gICAgICAgIHZhciBpc0NvcnJlY3QgPSBwcm92ZXIgPT09IGNvcnJlY3RbaHlwb3RoZXNpc11cblxuICAgICAgICBpZiAocHJvdmVyKSB7XG4gICAgICAgICAgICBpZiAoaXNDb3JyZWN0KSB7XG4gICAgICAgICAgICAgICAgcHJvdmVyUmVzcG9uc2UgPSBcIkV4YWN0bHkhIE5vdyBsZXQncyBkbyB0aGUgZXhwZXJpbWVudC5cIlxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBwcm92ZXJSZXNwb25zZSA9IHJlc3BvbnNlc1t7XG4gICAgICAgICAgICAgICAgICAgIHRlbm5pczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgbW9yZTogJ2Jvd2xpbmcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2FtZTogJ3NhbWUnXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGJvd2xpbmc6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vcmU6ICd0ZW5uaXMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2FtZTogJ3NhbWUnXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHNhbWU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vcmU6ICdib3dsaW5nJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxlc3M6ICd0ZW5uaXMnXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9W2h5cG90aGVzaXNdW3Byb3Zlcl1dO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGZ1dHVyZUh5cG90aGVzaXMgPSB7XG4gICAgICAgICAgICB0ZW5uaXM6ICd0aGUgdGVubmlzIGJhbGwgd2lsbCBmYWxsIGZhc3RlciB0aGFuIHRoZSBib3dsaW5nIGJhbGwnLFxuICAgICAgICAgICAgYm93bGluZzogJ3RoZSBib3dsaW5nIGJhbGwgd2lsbCBmYWxsIGZhc3RlciB0aGFuIHRoZSB0ZW5uaXMgYmFsbCcsXG4gICAgICAgICAgICBzYW1lOiAndGhlIHRlbm5pcyBiYWxsIGFuZCB0aGUgYm93bGluZyBiYWxsIHdpbGwgZmFsbCB0aGUgc2FtZSdcbiAgICAgICAgfVtoeXBvdGhlc2lzXTtcblxuICAgICAgICB2YXIgY3VycmVudEh5cG90aGVzaXMgPSB7XG4gICAgICAgICAgICB0ZW5uaXM6ICdhIHRlbm5pcyBiYWxsIGZhbGxzIGZhc3RlciB0aGFuIGEgYm93bGluZyBiYWxsJyxcbiAgICAgICAgICAgIGJvd2xpbmc6ICdhIGJvd2xpbmcgYmFsbCBmYWxscyBmYXN0ZXIgdGhhbiBhIHRlbm5pcyBiYWxsJyxcbiAgICAgICAgICAgIHNhbWU6ICdhIHRlbm5pcyBiYWxsIGZhbGxzIHRoZSBzYW1lIGFzIGEgYm93bGluZyBiYWxsJ1xuICAgICAgICB9W2h5cG90aGVzaXNdO1xuXG4gICAgICAgIHJldHVybiBTdGVwKF8uZXh0ZW5kKHByb3BzLCB7XG4gICAgICAgICAgICBpZDogJ2Rlc2lnbi1leHBlcmltZW50JyxcbiAgICAgICAgICAgIHRpdGxlOiAnRGVzaWduaW5nIHRoZSBFeHBlcmltZW50JyxcbiAgICAgICAgICAgIG9uVXBkYXRlOiBmdW5jdGlvbiAocHJldlByb3BzKSB7XG4gICAgICAgICAgICAgICAgaWYgKHByb3ZlciAmJiBpc0NvcnJlY3QgJiYgcHJvdmVyICE9PSBwcmV2UHJvcHMuZGF0YS5wcm92ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9wcy5vbk5leHQoKVxuICAgICAgICAgICAgICAgICAgICB9LCAyMDAwKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYm9keTogUmVhY3QuRE9NLmRpdihudWxsLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00ucChudWxsLCBcIk5vdyB3ZSBuZWVkIHRvIGRlc2lnbiBhbiBleHBlcmltZW50IHRvIHRlc3QgeW91clwiICsgJyAnICtcbiAgICAgICAgICAgICAgICBcImh5cG90aGVzaXMhIEl0J3MgaW1wb3J0YW50IHRvIGJlIGNhcmVmdWwgd2hlbiBkZXNpZ25pbmcgYW5cIiArICcgJyArXG4gICAgICAgICAgICAgICAgXCJleHBlcmltZW50LCBiZWNhdXNlIG90aGVyd2lzZSB5b3UgY291bGQgZW5kIHVwIFxcXCJwcm92aW5nXFxcIlwiICsgJyAnICtcbiAgICAgICAgICAgICAgICBcInNvbWV0aGluZyB0aGF0J3MgYWN0dWFsbHkgZmFsc2UuXCIpLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00ucChudWxsLCBcIlRvIHByb3ZlIHRoYXQgXCIsIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwidWxpbmVcIn0sIGN1cnJlbnRIeXBvdGhlc2lzKSwgXCIsIHdlIGNhbiBtZWFzdXJlIHRoZSB0aW1lIHRoYXQgaXRcIiArICcgJyArXG4gICAgICAgICAgICAgICAgXCJ0YWtlcyBmb3IgZWFjaCBiYWxsIHRvIGZhbGwgd2hlbiBkcm9wcGVkIGZyb20gYSBzcGVjaWZpY1wiICsgJyAnICtcbiAgICAgICAgICAgICAgICBcImhlaWdodC5cIiksIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5wKG51bGwsIFwiWW91ciBoeXBvdGhlc2lzIHdpbGwgYmUgcHJvdmVuIGlmIHRoZSBcIiwgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJ1bGluZVwifSwgXCJ0aW1lIGZvciB0aGUgXCIsIGZpcnN0QmFsbCwgXCIgYmFsbFwiKSwgXCIgaXNcIiwgXG4gICAgICAgICAgICAgICAgICAgIEJ1dHRvbkdyb3VwKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogXCJidG4tZ3JvdXBcIiwgXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZDogcHJvdmVyLCBcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uU2VsZWN0OiBwcm9wcy5zZXREYXRhLmJpbmQobnVsbCwgJ3Byb3ZlcicpLCBcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnM6IFtbJ2xlc3MnLCAnbGVzcyB0aGFuJ10sIFsnbW9yZScsICdtb3JlIHRoYW4nXSwgWydzYW1lJywgJ3RoZSBzYW1lIGFzJ11dfSksIFxuICAgICAgICAgICAgICAgICAgICBcInRoZSBcIiwgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJ1bGluZVwifSwgXCJ0aW1lIGZvciB0aGUgXCIsIHNlY29uZEJhbGwsIFwiIGJhbGxcIiksIFwiLlwiXG4gICAgICAgICAgICAgICAgKSwgXG4gICAgICAgICAgICAgICAgcHJvdmVyICYmIFJlYWN0LkRPTS5wKHtjbGFzc05hbWU6IFwiZGVzaWduX3Jlc3BvbnNlXCJ9LCBwcm92ZXJSZXNwb25zZSlcbiAgICAgICAgICAgIClcbiAgICAgICAgfSkpXG4gICAgfSxcblxuICAgIGZ1bmN0aW9uIChwcm9wcykge1xuICAgICAgICByZXR1cm4gU3RlcChfLmV4dGVuZChwcm9wcywge1xuICAgICAgICAgICAgaWQ6ICdleHBlcmltZW50JyxcbiAgICAgICAgICAgIHN0eWxlOiAnYmxhY2snLFxuICAgICAgICAgICAgdGl0bGU6ICdUaGUgZXhwZXJpbWVudCcsXG4gICAgICAgICAgICBwb3M6IHtcbiAgICAgICAgICAgICAgICBsZWZ0OiAzNzUsXG4gICAgICAgICAgICAgICAgdG9wOiAyMDBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBib2R5OiBSZWFjdC5ET00ucChudWxsLCBcIkhlcmUgd2UgaGF2ZSB0b29scyB0byBjb25kdWN0IG91ciBleHBlcmltZW50LiBZb3UgY2FuIHNlZVwiICsgJyAnICtcbiAgICAgICAgICAgIFwic29tZSBib3dsaW5nIGJhbGxzIGFuZCB0ZW5uaXMgYmFsbHMsIGFuZCB0aG9zZSByZWQgYW5kIGdyZWVuXCIgKyAnICcgK1xuICAgICAgICAgICAgXCJzZW5zb3JzIHdpbGwgcmVjb3JkIHRoZSB0aW1lIGl0IHRha2VzIGZvciBhIGJhbGwgdG8gZmFsbC5cIiksXG4gICAgICAgICAgICBvblJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHByb3BzLkV4ZXJjaXNlLmRlcGxveUJhbGxzKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgREVCVUcgPyBwcm9wcy5vbk5leHQoKSA6IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvcHMub25OZXh0KClcbiAgICAgICAgICAgICAgICAgICAgfSwgMjAwMCk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkpXG4gICAgfSxcblxuICAgIGZ1bmN0aW9uIChwcm9wcykge1xuICAgICAgICByZXR1cm4gU3RlcChfLmV4dGVuZChwcm9wcywge1xuICAgICAgICAgICAgaWQ6ICdkcm9wJyxcbiAgICAgICAgICAgIHN0eWxlOiAnYmxhY2snLFxuICAgICAgICAgICAgcG9zOiB7XG4gICAgICAgICAgICAgICAgdG9wOiAyMDAsXG4gICAgICAgICAgICAgICAgbGVmdDogMjAwXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYm9keTogUmVhY3QuRE9NLnAobnVsbCwgXCJJZiB3ZSBkcm9wIGEgYmFsbCBoZXJlIGFib3ZlIHRoZSBncmVlbiBzZW5zb3IsIHdlIGNhblwiICsgJyAnICtcbiAgICAgICAgICAgICAgICBcInRpbWUgaG93IGxvbmcgaXQgdGFrZXMgZm9yIGl0IHRvIGZhbGwgdG8gdGhlIHJlZCBzZW5zb3IuXCIpLFxuICAgICAgICAgICAgb25SZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBwcm9wcy5FeGVyY2lzZS5kZW1vbnN0cmF0ZURyb3AoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBwcm9wcy5vbk5leHQoKVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pKVxuICAgIH0sXG5cbiAgICBmdW5jdGlvbiAocHJvcHMpIHtcbiAgICAgICAgcmV0dXJuIFN0ZXAoXy5leHRlbmQocHJvcHMsIHtcbiAgICAgICAgICAgIGlkOiAnbG9nYm9vaycsXG4gICAgICAgICAgICBzdHlsZTogJ2JsYWNrJyxcbiAgICAgICAgICAgIHBvczoge1xuICAgICAgICAgICAgICAgIHRvcDogMTAwLFxuICAgICAgICAgICAgICAgIGxlZnQ6IDUwMFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGFycm93OiBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwiYXJyb3ctdG8tbG9nYm9va1wifSksXG4gICAgICAgICAgICBib2R5OiBSZWFjdC5ET00ucChudWxsLCBcIlRoZSB0aW1lIGlzIHRoZW4gcmVjb3JkZWQgb3ZlciBoZXJlIGluIHlvdXIgbG9nIGJvb2suIEZpbGwgdXAgdGhpcyBsb2cgYm9vayB3aXRoIHRpbWVzIGZvciBib3RoIGJhbGxzIGFuZCBjb21wYXJlIHRoZW0uXCIpLFxuICAgICAgICAgICAgb25SZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvcHMub25OZXh0KCk7XG4gICAgICAgICAgICAgICAgfSwgREVCVUcgPyAxMDAgOiA1MDAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkpO1xuICAgIH0sXG5cbiAgICBmdW5jdGlvbiAocHJvcHMpIHtcbiAgICAgICAgcmV0dXJuIFN0ZXAoXy5leHRlbmQocHJvcHMsIHtcbiAgICAgICAgICAgIGlkOiAnYW5zd2VyJyxcbiAgICAgICAgICAgIHN0eWxlOiAnYmxhY2snLFxuICAgICAgICAgICAgcG9zOiB7XG4gICAgICAgICAgICAgICAgdG9wOiAxNTAsXG4gICAgICAgICAgICAgICAgbGVmdDogMjUwXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYXJyb3c6IFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJhcnJvdy10by1hbnN3ZXJcIn0pLFxuICAgICAgICAgICAgc2hvd0JhY29uOiB0cnVlLFxuICAgICAgICAgICAgdGl0bGU6IFwiTm93IGNvbmR1Y3QgdGhlIGV4cGVyaW1lbnQgdG8gdGVzdCB5b3VyIGh5cG90aGVzaXMhXCIsXG4gICAgICAgICAgICBib2R5OiBSZWFjdC5ET00ucChudWxsLCBcIk9uY2UgeW91J3ZlIGNvbGxlY3RlZCBlbm91Z2ggZGF0YSBpbiB5b3VyIGxvZyBib29rLFwiICsgJyAnICtcbiAgICAgICAgICAgIFwiZGVjaWRlIHdoZXRoZXIgdGhlIGRhdGEgXCIsIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwidWxpbmVcIn0sIFwic3VwcG9ydFwiKSwgXCIgb3JcIiwgXG4gICAgICAgICAgICAnICcsIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwidWxpbmVcIn0sIFwiZGlzcHJvdmVcIiksIFwiIHlvdXIgaHlwb3RoZXNpcy4gVGhlblwiICsgJyAnICtcbiAgICAgICAgICAgIFwiSSB3aWxsIGV2YWx1YXRlIHlvdXIgZXhwZXJpbWVudCBhbmQgZ2l2ZSB5b3UgZmVlZGJhY2suXCIpLFxuICAgICAgICAgICAgbmV4dDogXCJPaywgSSdtIHJlYWR5XCIsXG4gICAgICAgIH0pKVxuICAgIH0sXG5dXG4iLCIvKiogQGpzeCBSZWFjdC5ET00gKi9cblxudmFyIFdhbGt0aHJvdWdoID0gcmVxdWlyZSgnLi93YWxrLXRocm91Z2guanN4JylcbnZhciBQVCA9IFJlYWN0LlByb3BUeXBlc1xudmFyIFN0ZXAgPSByZXF1aXJlKCcuL3N0ZXAuanN4JylcblxudmFyIERFQlVHID0gZmFsc2VcblxubW9kdWxlLmV4cG9ydHMgPSBIaWxsc0ludHJvO1xuXG5mdW5jdGlvbiBIaWxsc0ludHJvKEV4ZXJjaXNlLCBnb3RIeXBvdGhlc2lzKSB7XG4gICAgdmFyIG5vZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQobm9kZSlcbiAgICBSZWFjdC5yZW5kZXJDb21wb25lbnQoV2Fsa3Rocm91Z2goe1xuICAgICAgICBzdGVwczogc3RlcHMsXG4gICAgICAgIG9uSHlwb3RoZXNpczogZ290SHlwb3RoZXNpcyxcbiAgICAgICAgb25Eb25lOiBmdW5jdGlvbiAoaHlwb3RoZXNpcykge1xuICAgICAgICAgICAgUmVhY3QudW5tb3VudENvbXBvbmVudEF0Tm9kZShub2RlKTtcbiAgICAgICAgICAgIG5vZGUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChub2RlKTtcbiAgICAgICAgfSxcbiAgICAgICAgRXhlcmNpc2U6IEV4ZXJjaXNlXG4gICAgfSksIG5vZGUpXG59XG5cblxudmFyIEJ1dHRvbkdyb3VwID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnQnV0dG9uR3JvdXAnLFxuICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogdGhpcy5wcm9wcy5jbGFzc05hbWV9LCBcbiAgICAgICAgICAgIHRoaXMucHJvcHMub3B0aW9ucy5tYXAoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICB2YXIgY2xzID0gXCJidG4gYnRuLWRlZmF1bHRcIlxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLnNlbGVjdGVkID09PSBpdGVtWzBdKSB7XG4gICAgICAgICAgICAgICAgICAgIGNscyArPSAnIGFjdGl2ZSdcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIFJlYWN0LkRPTS5idXR0b24oe2tleTogaXRlbVswXSwgY2xhc3NOYW1lOiBjbHMsIG9uQ2xpY2s6IHRoaXMucHJvcHMub25TZWxlY3QuYmluZChudWxsLCBpdGVtWzBdKX0sIGl0ZW1bMV0pO1xuICAgICAgICAgICAgfS5iaW5kKHRoaXMpKVxuICAgICAgICApO1xuICAgIH1cbn0pO1xuXG52YXIgc3RlcHMgPSBbXG4gICAgZnVuY3Rpb24gKHByb3BzKSB7XG4gICAgICAgIHJldHVybiBTdGVwKF8uZXh0ZW5kKHByb3BzLCB7XG4gICAgICAgICAgICBpZDogJ2hlbGxvJyxcbiAgICAgICAgICAgIHRpdGxlOiBcIlJlYWR5IGZvciBldmVuIG1vcmUgU2NpZW5jZT9cIixcbiAgICAgICAgICAgIHNob3dCYWNvbjogdHJ1ZSxcbiAgICAgICAgICAgIGJvZHk6IFwiSSBoYXZlIG9uZSBtb3JlIGV4cGVyaW1lbnQgZm9yIHlvdS5cIixcbiAgICAgICAgICAgIG5leHQ6IFwiTGV0J3MgZG8gaXQhXCJcbiAgICAgICAgfSkpXG4gICAgfSxcblxuICAgIGZ1bmN0aW9uIChwcm9wcykge1xuICAgICAgICB2YXIgaHlwb3RoZXNpcyA9IHByb3BzLmRhdGEuaHlwb3RoZXNpc1xuICAgICAgICByZXR1cm4gU3RlcChfLmV4dGVuZChwcm9wcywge1xuICAgICAgICAgICAgaWQ6ICdkZXNjcmlwdGlvbicsXG4gICAgICAgICAgICB0aXRsZTogXCJFeHBlcmltZW50ICMzXCIsXG4gICAgICAgICAgICBvblVwZGF0ZTogZnVuY3Rpb24gKHByZXZQcm9wcykge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLmRhdGEuaHlwb3RoZXNpcyAmJiAhcHJldlByb3BzLmRhdGEuaHlwb3RoZXNpcykge1xuICAgICAgICAgICAgICAgICAgICBwcm9wcy5vbkh5cG90aGVzaXMocHJvcHMuZGF0YS5oeXBvdGhlc2lzKTtcbiAgICAgICAgICAgICAgICAgICAgREVCVUcgPyBwcm9wcy5vbk5leHQoKSA6IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvcHMub25OZXh0KClcbiAgICAgICAgICAgICAgICAgICAgfSwgNTAwKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBib2R5OiBSZWFjdC5ET00uZGl2KG51bGwsIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5wKG51bGwsIFwiSWYgYSBiYWxsIHJvbGxzIG92ZXIgYSBoaWxsLCBkb2VzIHRoZSBzcGVlZCBvZiB0aGUgYmFsbCBjaGFuZ2U/XCJcbiAgICAgICAgICAgICAgICApLCBcbiAgICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLmltZyh7c3JjOiBcImltYWdlcy9iYWxscm9sbC1kaWFncmFtLnBuZ1wiLCB3aWR0aDogXCIzMDBweFwifSksIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5ocihudWxsKSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImxhcmdlXCJ9LCBcIkkgdGhpbms6XCIsIFxuICAgICAgICAgICAgICAgICAgICBCdXR0b25Hcm91cCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU6IFwid2Fsa3Rocm91Z2hfaHlwb3RoZXNlc1wiLCBcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkOiBoeXBvdGhlc2lzLCBcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uU2VsZWN0OiBwcm9wcy5zZXREYXRhLmJpbmQobnVsbCwgJ2h5cG90aGVzaXMnKSwgXG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zOiBbW1wiZmFzdGVyXCIsIFwiSXQgd2lsbCBjb21lIG91dCBnb2luZyBmYXN0ZXJcIl0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgW1wic2xvd2VyXCIsIFwiSXQgd2lsbCBjb21lIG91dCBnb2luZyBzbG93ZXJcIl0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgW1wic2FtZVwiLCBcIkl0IHdpbGwgZ28gdGhlIHNhbWUgc3BlZWRcIl1dfSlcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgLyoqaHlwb3RoZXNpcyAmJiA8cCBjbGFzc05hbWU9XCJ3YWxrdGhyb3VnaF9ncmVhdFwiPkdyZWF0ISBOb3cgd2UgZG8gc2NpZW5jZTwvcD4qKi9cbiAgICAgICAgICAgIClcbiAgICAgICAgfSkpXG4gICAgfSxcblxuICAgIGZ1bmN0aW9uIChwcm9wcykge1xuICAgICAgICB2YXIgcHJvdmVyID0gcHJvcHMuZGF0YS5wcm92ZXJcbiAgICAgICAgdmFyIGh5cG90aGVzaXMgPSBwcm9wcy5kYXRhLmh5cG90aGVzaXNcblxuICAgICAgICB2YXIgcmVzcG9uc2VzID0ge1xuICAgICAgICAgICAgJ21vcmUnOiAnTm9wZS4gVGhhdCB3b3VsZCBzaG93IHRoYXQgdGhlIGJhbGwgY29tZXMgb3V0IGZhc3RlcicsXG4gICAgICAgICAgICAnbGVzcyc6ICdOb3BlLiBUaGF0IHdvdWxkIHNob3cgdGhhdCB0aGUgYmFsbCBjb21lcyBvdXQgc2xvd2VyJyxcbiAgICAgICAgICAgICdzYW1lJzogJ05vcGUuIFRoYXQgd291bGQgc2hvdyB0aGF0IHRoZSBiYWxsIGNvbWVzIG91dCBhdCB0aGUgc2FtZSBzcGVlZCcsXG4gICAgICAgIH1cbiAgICAgICAgdmFyIGNvcnJlY3QgPSB7XG4gICAgICAgICAgICAnZmFzdGVyJzogJ2xlc3MnLFxuICAgICAgICAgICAgJ3Nsb3dlcic6ICdtb3JlJyxcbiAgICAgICAgICAgICdzYW1lJzogJ3NhbWUnXG4gICAgICAgIH1cbiAgICAgICAgdmFyIHByb3ZlclJlc3BvbnNlXG4gICAgICAgIHZhciBpc0NvcnJlY3QgPSBwcm92ZXIgPT09IGNvcnJlY3RbaHlwb3RoZXNpc11cblxuICAgICAgICBpZiAocHJvdmVyKSB7XG4gICAgICAgICAgICBpZiAoaXNDb3JyZWN0KSB7XG4gICAgICAgICAgICAgICAgcHJvdmVyUmVzcG9uc2UgPSBcIkV4YWN0bHkhIE5vdyBsZXQncyBkbyB0aGUgZXhwZXJpbWVudC5cIlxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBwcm92ZXJSZXNwb25zZSA9IHJlc3BvbnNlc1twcm92ZXJdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHdvcmR5SHlwb3RoZXNpcyA9IHtcbiAgICAgICAgICAgIGZhc3RlcjogJ2Zhc3RlcicsXG4gICAgICAgICAgICBzbG93ZXI6ICdzbG93ZXInLFxuICAgICAgICAgICAgc2FtZTogJ3RoZSBzYW1lIHNwZWVkJyxcbiAgICAgICAgfVtoeXBvdGhlc2lzXTtcblxuICAgICAgICByZXR1cm4gU3RlcChfLmV4dGVuZChwcm9wcywge1xuICAgICAgICAgICAgaWQ6ICdkZXNpZ24tZXhwZXJpbWVudCcsXG4gICAgICAgICAgICB0aXRsZTogJ0Rlc2lnbmluZyB0aGUgRXhwZXJpbWVudCcsXG4gICAgICAgICAgICBvblVwZGF0ZTogZnVuY3Rpb24gKHByZXZQcm9wcykge1xuICAgICAgICAgICAgICAgIGlmIChwcm92ZXIgJiYgaXNDb3JyZWN0ICYmIHByb3ZlciAhPT0gcHJldlByb3BzLmRhdGEucHJvdmVyKSB7XG4gICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvcHMub25OZXh0KClcbiAgICAgICAgICAgICAgICAgICAgfSwgMjAwMCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGJvZHk6IFJlYWN0LkRPTS5kaXYobnVsbCwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLnAobnVsbCwgXCJUbyBwcm92ZSB0aGF0IHRoZSBiYWxsIGNvbWVzIG91dCBcIiwgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJ1bGluZVwifSwgd29yZHlIeXBvdGhlc2lzKSwgXCIsIHdlIGNhbiBtZWFzdXJlIHRoZSBzcGVlZCBhZnRlciBpdCBnb2VzIGRvd24gYSByYW1wIGFuZCB0aGVuIG92ZXIgYSBoaWxsIG9mIGEgZ2l2ZW4gaGVpZ2h0LlwiKSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLnAobnVsbCwgXCJTaW5jZSB3ZSBjYW4ndCBtZWFzdXJlIHNwZWVkIGRpcmVjdGx5LCB3ZSdsbCBtZWFzdXJlIHRoZSB0aW1lIGl0IHRha2VzIGZvciB0aGUgYmFsbCB0byB0cmF2ZWwgYSBzaG9ydCBmaXhlZCBkaXN0YW5jZS5cIiksIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5wKG51bGwsIFwiWW91ciBoeXBvdGhlc2lzIHdpbGwgYmUgcHJvdmVuIGlmIHdoZW4gd2Ugcm9sbCBhIGJhbGwgZG93biBhIHJhbXAsIHRoZW4gb3ZlciBhIGxhcmdlciBoaWxsLCB0aGUgXCIsIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwidWxpbmVcIn0sIFwidGltZSBpdCB0YWtlc1wiKSwgXCIgZm9yIHRoZSBiYWxsIHRvIGdvIGEgZml4ZWQgZGlzdGFuY2UgaXNcIiwgXG4gICAgICAgICAgICAgICAgICAgIEJ1dHRvbkdyb3VwKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogXCJidG4tZ3JvdXBcIiwgXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZDogcHJvdmVyLCBcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uU2VsZWN0OiBwcm9wcy5zZXREYXRhLmJpbmQobnVsbCwgJ3Byb3ZlcicpLCBcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnM6IFtbJ2xlc3MnLCAnbGVzcyB0aGFuJ10sIFsnbW9yZScsICdtb3JlIHRoYW4nXSwgWydzYW1lJywgJ3RoZSBzYW1lIGFzJ11dfSksIFxuICAgICAgICAgICAgICAgICAgICBcInRoZSB0aW1lIGl0IHRha2VzIGZvciB0aGUgYmFsbCB0byBnbyB0aGUgc2FtZSBkaXN0YW5jZSBpZiBpdCB3ZW50IG92ZXIgYSBzbWFsbGVyIGhpbGwuXCJcbiAgICAgICAgICAgICAgICApLCBcbiAgICAgICAgICAgICAgICBwcm92ZXIgJiYgUmVhY3QuRE9NLnAoe2NsYXNzTmFtZTogXCJkZXNpZ25fcmVzcG9uc2VcIn0sIHByb3ZlclJlc3BvbnNlKVxuICAgICAgICAgICAgKVxuICAgICAgICB9KSlcbiAgICB9LFxuXG4gICAgZnVuY3Rpb24gKHByb3BzKSB7XG4gICAgICAgIHJldHVybiBTdGVwKF8uZXh0ZW5kKHByb3BzLCB7XG4gICAgICAgICAgICBpZDogJ2V4cGVyaW1lbnQnLFxuICAgICAgICAgICAgc3R5bGU6ICdibGFjaycsXG4gICAgICAgICAgICB0aXRsZTogJ1RoZSBleHBlcmltZW50JyxcbiAgICAgICAgICAgIHBvczoge1xuICAgICAgICAgICAgICAgIGxlZnQ6IDM3NSxcbiAgICAgICAgICAgICAgICB0b3A6IDIwMFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGJvZHk6IFJlYWN0LkRPTS5wKG51bGwsIFwiSGVyZSB3ZSBoYXZlIHRvb2xzIHRvIGNvbmR1Y3Qgb3VyIGV4cGVyaW1lbnQuXCIgKyAnICcgK1xuICAgICAgICAgICAgICAgICAgICAgXCJUaGUgcmVkIGFuZCBncmVlbiBzZW5zb3JzIHdpbGwgcmVjb3JkIHRoZSB0aW1lIGl0IHRha2VzIGZvciB0aGUgYmFsbCB0byBnbyBhIHNob3J0IGZpeGVkIGRpc3RhbmNlIGFmdGVyIGdvaW5nIG92ZXIgdGhlIGhpbGwuXCIpLFxuICAgICAgICAgICAgb25SZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBwcm9wcy5FeGVyY2lzZS5kcm9wT2JqZWN0cyhmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIERFQlVHID8gcHJvcHMub25OZXh0KCkgOiBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3BzLm9uTmV4dCgpXG4gICAgICAgICAgICAgICAgICAgIH0sIDIwMDApO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pKVxuICAgIH0sXG5cbiAgICBmdW5jdGlvbiAocHJvcHMpIHtcbiAgICAgICAgcmV0dXJuIFN0ZXAoXy5leHRlbmQocHJvcHMsIHtcbiAgICAgICAgICAgIGlkOiAnZHJvcCcsXG4gICAgICAgICAgICBzdHlsZTogJ2JsYWNrJyxcbiAgICAgICAgICAgIHBvczoge1xuICAgICAgICAgICAgICAgIHRvcDogMjAwLFxuICAgICAgICAgICAgICAgIGxlZnQ6IDIwMFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGJvZHk6IFJlYWN0LkRPTS5wKG51bGwsIFwiV2UgY2FuIHRlc3Qgb3V0IHRoaXMgaHlwb3RoZXNpcyBieSByb2xsaW5nIGEgYmFsbCBzdGFydGluZyBhdCB0aGUgdG9wIG9mIHRoZSByYW1wLlwiKSxcbiAgICAgICAgICAgIG9uUmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcHJvcHMuRXhlcmNpc2UuZGVtb25zdHJhdGVEcm9wKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvcHMub25OZXh0KClcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICB9KSlcbiAgICB9LFxuXG4gICAgZnVuY3Rpb24gKHByb3BzKSB7XG4gICAgICAgIHJldHVybiBTdGVwKF8uZXh0ZW5kKHByb3BzLCB7XG4gICAgICAgICAgICBpZDogJ2xvZ2Jvb2snLFxuICAgICAgICAgICAgc3R5bGU6ICdibGFjaycsXG4gICAgICAgICAgICBwb3M6IHtcbiAgICAgICAgICAgICAgICB0b3A6IDEwMCxcbiAgICAgICAgICAgICAgICBsZWZ0OiA1MDBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBhcnJvdzogUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImFycm93LXRvLWhpbGwtc2xpZGVyXCJ9KSxcbiAgICAgICAgICAgIGJvZHk6IFJlYWN0LkRPTS5wKG51bGwsIFwiV2UgY2FuIGNoYW5nZSB0aGUgaGVpZ2h0IG9mIHRoZSBoaWxsIGhlcmUuXCIpLFxuICAgICAgICAgICAgb25SZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvcHMub25OZXh0KCk7XG4gICAgICAgICAgICAgICAgfSwgREVCVUcgPyAxMDAgOiA1MDAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkpO1xuICAgIH0sXG5cbiAgICBmdW5jdGlvbiAocHJvcHMpIHtcbiAgICAgICAgcmV0dXJuIFN0ZXAoXy5leHRlbmQocHJvcHMsIHtcbiAgICAgICAgICAgIGlkOiAnYW5zd2VyJyxcbiAgICAgICAgICAgIHN0eWxlOiAnYmxhY2snLFxuICAgICAgICAgICAgcG9zOiB7XG4gICAgICAgICAgICAgICAgdG9wOiAxNTAsXG4gICAgICAgICAgICAgICAgbGVmdDogMjUwXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYXJyb3c6IFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJhcnJvdy10by1hbnN3ZXJcIn0pLFxuICAgICAgICAgICAgc2hvd0JhY29uOiB0cnVlLFxuICAgICAgICAgICAgdGl0bGU6IFwiTm93IGNvbmR1Y3QgdGhlIGV4cGVyaW1lbnQgdG8gdGVzdCB5b3VyIGh5cG90aGVzaXMhXCIsXG4gICAgICAgICAgICBib2R5OiBSZWFjdC5ET00ucChudWxsLCBcIk9uY2UgeW91J3ZlIGNvbGxlY3RlZCBlbm91Z2ggZGF0YSBpbiB5b3VyIGxvZyBib29rLFwiICsgJyAnICtcbiAgICAgICAgICAgIFwiZGVjaWRlIHdoZXRoZXIgdGhlIGRhdGEgXCIsIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwidWxpbmVcIn0sIFwic3VwcG9ydFwiKSwgXCIgb3JcIiwgXG4gICAgICAgICAgICAnICcsIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwidWxpbmVcIn0sIFwiZGlzcHJvdmVcIiksIFwiIHlvdXIgaHlwb3RoZXNpcy4gVGhlblwiICsgJyAnICtcbiAgICAgICAgICAgIFwiSSB3aWxsIGV2YWx1YXRlIHlvdXIgZXhwZXJpbWVudCBhbmQgZ2l2ZSB5b3UgZmVlZGJhY2suXCIpLFxuICAgICAgICAgICAgbmV4dDogXCJPaywgSSdtIHJlYWR5XCIsXG4gICAgICAgIH0pKVxuICAgIH0sXG5dXG4iLCIvKiogQGpzeCBSZWFjdC5ET00gKi9cblxudmFyIFdhbGt0aHJvdWdoID0gcmVxdWlyZSgnLi93YWxrLXRocm91Z2guanN4JylcbnZhciBQVCA9IFJlYWN0LlByb3BUeXBlc1xudmFyIFN0ZXAgPSByZXF1aXJlKCcuL3N0ZXAuanN4JylcblxudmFyIERFQlVHID0gZmFsc2VcblxubW9kdWxlLmV4cG9ydHMgPSBOZXd0b24xSW50cm87XG5cbmZ1bmN0aW9uIE5ld3RvbjFJbnRybyhFeGVyY2lzZSwgZ290SHlwb3RoZXNpcykge1xuICAgIHZhciBub2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKG5vZGUpXG4gICAgUmVhY3QucmVuZGVyQ29tcG9uZW50KFdhbGt0aHJvdWdoKHtcbiAgICAgICAgc3RlcHM6IHN0ZXBzLFxuICAgICAgICBvbkh5cG90aGVzaXM6IGdvdEh5cG90aGVzaXMsXG4gICAgICAgIG9uRG9uZTogZnVuY3Rpb24gKGh5cG90aGVzaXMpIHtcbiAgICAgICAgICAgIFJlYWN0LnVubW91bnRDb21wb25lbnRBdE5vZGUobm9kZSk7XG4gICAgICAgICAgICBub2RlLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQobm9kZSk7XG4gICAgICAgIH0sXG4gICAgICAgIEV4ZXJjaXNlOiBFeGVyY2lzZVxuICAgIH0pLCBub2RlKVxufVxuXG5cbnZhciBCdXR0b25Hcm91cCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ0J1dHRvbkdyb3VwJyxcbiAgICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IHRoaXMucHJvcHMuY2xhc3NOYW1lfSwgXG4gICAgICAgICAgICB0aGlzLnByb3BzLm9wdGlvbnMubWFwKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgICAgICAgICAgdmFyIGNscyA9IFwiYnRuIGJ0bi1kZWZhdWx0XCJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5zZWxlY3RlZCA9PT0gaXRlbVswXSkge1xuICAgICAgICAgICAgICAgICAgICBjbHMgKz0gJyBhY3RpdmUnXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBSZWFjdC5ET00uYnV0dG9uKHtrZXk6IGl0ZW1bMF0sIGNsYXNzTmFtZTogY2xzLCBvbkNsaWNrOiB0aGlzLnByb3BzLm9uU2VsZWN0LmJpbmQobnVsbCwgaXRlbVswXSl9LCBpdGVtWzFdKTtcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSlcbiAgICAgICAgKTtcbiAgICB9XG59KTtcblxudmFyIHN0ZXBzID0gW1xuICAgIGZ1bmN0aW9uIChwcm9wcykge1xuICAgICAgICByZXR1cm4gU3RlcChfLmV4dGVuZChwcm9wcywge1xuICAgICAgICAgICAgaWQ6ICdoZWxsbycsXG4gICAgICAgICAgICB0aXRsZTogXCJSZWFkeSBmb3IgbW9yZSBTY2llbmNlP1wiLFxuICAgICAgICAgICAgc2hvd0JhY29uOiB0cnVlLFxuICAgICAgICAgICAgYm9keTogXCJMZXQncyBnZXQgb3V0IG9mIHRoZSBsYWIuIEZvciB0aGlzIG5leHQgZXhwZXJpbWVudCwgSSBrbm93IGp1c3QgdGhlIHBsYWNlIVwiLFxuICAgICAgICAgICAgbmV4dDogXCJMZXQncyBnbyFcIlxuICAgICAgICB9KSlcbiAgICB9LFxuXG4gICAgZnVuY3Rpb24gKHByb3BzKSB7XG4gICAgICAgIHJldHVybiBTdGVwKF8uZXh0ZW5kKHByb3BzLCB7XG4gICAgICAgICAgICBpZDogJ3NwYWNlJyxcbiAgICAgICAgICAgIHN0eWxlOiAnYmxhY2snLFxuICAgICAgICAgICAgdGl0bGU6IFwiU3BhY2UhXCIsXG4gICAgICAgICAgICBib2R5OiBcIlRoZSBydWxlcyBvZiBzY2llbmNlIHdvcmsgZXZlcnl3aGVyZSwgc28gZGlzY292ZXJpZXMgd2UgbWFrZSBcIiArXG4gICAgICAgICAgICAgICAgXCJpbiBzcGFjZSB3aWxsIGFsc28gYXBwbHkgaGVyZSBvbiBFYXJ0aC4gQW4gaW1wb3J0YW50IHNraWxsIHdoZW4gXCIgK1xuICAgICAgICAgICAgICAgIFwiZGVzaWduaW5nIGFuIGV4cGVyaW1lbnQgaXMgYXZvaWRpbmcgdGhpbmdzIHRoYXQgY291bGQgXCIgK1xuICAgICAgICAgICAgICAgIFwiaW50ZXJmZXJlIHdpdGggdGhlIHJlc3VsdHMuIEluIHNwYWNlLCB3ZSBkb24ndCBuZWVkIFwiICtcbiAgICAgICAgICAgICAgICBcInRvIHdvcnJ5IGFib3V0IGdyYXZpdHkgb3Igd2luZC5cIixcbiAgICAgICAgICAgIG5leHQ6IFwiQ29vbCFcIlxuICAgICAgICB9KSlcbiAgICB9LFxuXG4gICAgZnVuY3Rpb24gKHByb3BzKSB7XG4gICAgICAgIHZhciBoeXBvdGhlc2lzID0gcHJvcHMuZGF0YS5oeXBvdGhlc2lzXG4gICAgICAgIHJldHVybiBTdGVwKF8uZXh0ZW5kKHByb3BzLCB7XG4gICAgICAgICAgICBpZDogJ2Rlc2NyaXB0aW9uJyxcbiAgICAgICAgICAgIHN0eWxlOiAnYmxhY2snLFxuICAgICAgICAgICAgdGl0bGU6IFwiRXhwZXJpbWVudCAjMlwiLFxuICAgICAgICAgICAgb25VcGRhdGU6IGZ1bmN0aW9uIChwcmV2UHJvcHMpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5kYXRhLmh5cG90aGVzaXMgJiYgIXByZXZQcm9wcy5kYXRhLmh5cG90aGVzaXMpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvcHMub25IeXBvdGhlc2lzKHByb3BzLmRhdGEuaHlwb3RoZXNpcyk7XG4gICAgICAgICAgICAgICAgICAgIERFQlVHID8gcHJvcHMub25OZXh0KCkgOiBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3BzLm9uTmV4dCgpXG4gICAgICAgICAgICAgICAgICAgIH0sIDUwMClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYm9keTogUmVhY3QuRE9NLmRpdihudWxsLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00ucChudWxsLCBcIldoYXQgaGFwcGVucyB0byBhIG1vdmluZyBvYmplY3QgaWYgeW91IGxlYXZlIGl0IGFsb25lP1wiKSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmhyKG51bGwpLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwibGFyZ2VcIn0sIFwiSSB0aGluazpcIiwgXG4gICAgICAgICAgICAgICAgICAgIEJ1dHRvbkdyb3VwKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogXCJ3YWxrdGhyb3VnaF9oeXBvdGhlc2VzXCIsIFxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWQ6IGh5cG90aGVzaXMsIFxuICAgICAgICAgICAgICAgICAgICAgICAgb25TZWxlY3Q6IHByb3BzLnNldERhdGEuYmluZChudWxsLCAnaHlwb3RoZXNpcycpLCBcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnM6IFtbXCJmYXN0ZXJcIiwgXCJJdCBzcGVlZHMgdXBcIl0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgW1wic2xvd2VyXCIsIFwiSXQgc2xvd3MgZG93blwiXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBbXCJzYW1lXCIsIFwiSXQgc3RheXMgYXQgdGhlIHNhbWUgc3BlZWQgZm9yZXZlclwiXV19KVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAvKipoeXBvdGhlc2lzICYmIDxwIGNsYXNzTmFtZT1cIndhbGt0aHJvdWdoX2dyZWF0XCI+R3JlYXQhIE5vdyB3ZSBkbyBzY2llbmNlPC9wPioqL1xuICAgICAgICAgICAgKVxuICAgICAgICB9KSlcbiAgICB9LFxuXG4gICAgZnVuY3Rpb24gKHByb3BzKSB7XG4gICAgICAgIHZhciBwcm92ZXIgPSBwcm9wcy5kYXRhLnByb3ZlclxuICAgICAgICB2YXIgaHlwb3RoZXNpcyA9IHByb3BzLmRhdGEuaHlwb3RoZXNpc1xuXG4gICAgICAgIHZhciByZXNwb25zZXMgPSB7XG4gICAgICAgICAgICAnbW9yZSc6ICdOb3BlLiBUaGF0IHdvdWxkIHNob3cgdGhhdCB0aGUgb2JqZWN0IGdldHMgZmFzdGVyLicsXG4gICAgICAgICAgICAnbGVzcyc6ICdOb3BlLiBUaGF0IHdvdWxkIHNob3cgdGhhdCB0aGUgb2JqZWN0IGdldHMgc2xvd2VyLicsXG4gICAgICAgICAgICAnc2FtZSc6ICdOb3BlLiBUaGF0IHdvdWxkIHNob3cgdGhhdCB0aGUgb2JqZWN0IHN0YXlzIHRoZSBzYW1lIHNwZWVkLidcbiAgICAgICAgfVxuICAgICAgICB2YXIgY29ycmVjdCA9IHtcbiAgICAgICAgICAgICdmYXN0ZXInOiAnbW9yZScsXG4gICAgICAgICAgICAnc2xvd2VyJzogJ2xlc3MnLFxuICAgICAgICAgICAgJ3NhbWUnOiAnc2FtZSdcbiAgICAgICAgfVxuICAgICAgICB2YXIgcHJvdmVyUmVzcG9uc2VcbiAgICAgICAgdmFyIGlzQ29ycmVjdCA9IHByb3ZlciA9PT0gY29ycmVjdFtoeXBvdGhlc2lzXVxuXG4gICAgICAgIGlmIChwcm92ZXIpIHtcbiAgICAgICAgICAgIGlmIChpc0NvcnJlY3QpIHtcbiAgICAgICAgICAgICAgICBwcm92ZXJSZXNwb25zZSA9IFwiRXhhY3RseSEgTm93IGxldCdzIGRvIHRoZSBleHBlcmltZW50LlwiXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHByb3ZlclJlc3BvbnNlID0gcmVzcG9uc2VzW3Byb3Zlcl07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgY3VycmVudEh5cG90aGVzaXMgPSB7XG4gICAgICAgICAgICBmYXN0ZXI6ICdtb3Zpbmcgb2JqZWN0cyBnZXQgZmFzdGVyIG92ZXIgdGltZScsXG4gICAgICAgICAgICBzbG93ZXI6ICdtb3Zpbmcgb2JqZWN0cyBnZXQgc2xvd2VyIG92ZXIgdGltZScsXG4gICAgICAgICAgICBzYW1lOiBcIm1vdmluZyBvYmplY3RzIGRvbid0IGNoYW5nZSBpbiBzcGVlZCBvdmVyIHRpbWVcIlxuICAgICAgICB9W2h5cG90aGVzaXNdO1xuXG4gICAgICAgIHJldHVybiBTdGVwKF8uZXh0ZW5kKHByb3BzLCB7XG4gICAgICAgICAgICBpZDogJ2Rlc2lnbi1leHBlcmltZW50JyxcbiAgICAgICAgICAgIHN0eWxlOiAnYmxhY2snLFxuICAgICAgICAgICAgdGl0bGU6ICdEZXNpZ25pbmcgdGhlIEV4cGVyaW1lbnQnLFxuICAgICAgICAgICAgb25VcGRhdGU6IGZ1bmN0aW9uIChwcmV2UHJvcHMpIHtcbiAgICAgICAgICAgICAgICBpZiAocHJvdmVyICYmIGlzQ29ycmVjdCAmJiBwcm92ZXIgIT09IHByZXZQcm9wcy5kYXRhLnByb3Zlcikge1xuICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3BzLm9uTmV4dCgpXG4gICAgICAgICAgICAgICAgICAgIH0sIDIwMDApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBib2R5OiBSZWFjdC5ET00uZGl2KG51bGwsIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5wKG51bGwsIFwiVG8gcHJvdmUgdGhhdCBcIiwgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJ1bGluZVwifSwgY3VycmVudEh5cG90aGVzaXMpLCBcIixcIiArICcgJyArXG4gICAgICAgICAgICAgICAgXCJ3ZSBjYW4gbWVhc3VyZSB0aGUgdGltZSB0aGF0IGl0IHRha2VzIGZvciBhbiBhc3Rlcm9pZCB0byBtb3ZlIDEwMCBtZXRlcnMsXCIgKyAnICcgK1xuICAgICAgICAgICAgICAgIFwidGhlbiBtZWFzdXJlIHRoZSB0aW1lIHRvIG1vdmUgYW5vdGhlciAxMDAgbWV0ZXJzLlwiKSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLnAobnVsbCwgXCJZb3VyIGh5cG90aGVzaXMgd2lsbCBiZSBwcm92ZW4gaWYgdGhlIFwiLCBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcInVsaW5lXCJ9LCBcInRpbWUgdG8gdHJhdmVsIHRoZSBmaXJzdCAxMDBtXCIpLCBcIiBpc1wiLCBcbiAgICAgICAgICAgICAgICAgICAgQnV0dG9uR3JvdXAoe1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiBcImJ0bi1ncm91cFwiLCBcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkOiBwcm92ZXIsIFxuICAgICAgICAgICAgICAgICAgICAgICAgb25TZWxlY3Q6IHByb3BzLnNldERhdGEuYmluZChudWxsLCAncHJvdmVyJyksIFxuICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uczogW1snbGVzcycsICdsZXNzIHRoYW4nXSwgWydtb3JlJywgJ21vcmUgdGhhbiddLCBbJ3NhbWUnLCAndGhlIHNhbWUgYXMnXV19KSwgXG4gICAgICAgICAgICAgICAgICAgIFwidGhlIFwiLCBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcInVsaW5lXCJ9LCBcInRpbWUgdG8gdHJhdmVsIHRoZSBuZXh0IDEwMG1cIiksIFwiLlwiXG4gICAgICAgICAgICAgICAgKSwgXG4gICAgICAgICAgICAgICAgcHJvdmVyICYmIFJlYWN0LkRPTS5wKHtjbGFzc05hbWU6IFwiZGVzaWduX3Jlc3BvbnNlX3doaXRlXCJ9LCBwcm92ZXJSZXNwb25zZSlcbiAgICAgICAgICAgIClcbiAgICAgICAgfSkpXG4gICAgfSxcblxuICAgIGZ1bmN0aW9uIChwcm9wcykge1xuICAgICAgICByZXR1cm4gU3RlcChfLmV4dGVuZChwcm9wcywge1xuICAgICAgICAgICAgaWQ6ICdkcm9wJyxcbiAgICAgICAgICAgIHN0eWxlOiAnYmxhY2snLFxuICAgICAgICAgICAgcG9zOiB7XG4gICAgICAgICAgICAgICAgdG9wOiAyMDAsXG4gICAgICAgICAgICAgICAgbGVmdDogMjAwXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYm9keTogUmVhY3QuRE9NLnAobnVsbCwgXCJXZSBjYW4gdGVzdCBvdXQgdGhpcyBoeXBvdGhlc2lzIGJ5IHRocm93aW5nIGFuIGFzdGVyb2lkXCIgKyAnICcgK1xuICAgICAgICAgICAgICAgICAgICAgXCJ0aHJvdWdoIHRoZSBncmVlbiBzZW5zb3JzLCB3aGljaCBhcmUgZXZlbmx5LXNwYWNlZC4gVHJ5XCIgKyAnICcgK1xuICAgICAgICAgICAgICAgICAgICAgXCJ0aHJvd2luZyBhdCBkaWZmZXJlbnQgc3BlZWRzIVwiKSxcbiAgICAgICAgICAgIG9uUmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcHJvcHMuRXhlcmNpc2UuZGVtb25zdHJhdGVTYW1wbGUoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBwcm9wcy5vbk5leHQoKVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pKVxuICAgIH0sXG5cbiAgICBmdW5jdGlvbiAocHJvcHMpIHtcbiAgICAgICAgcmV0dXJuIFN0ZXAoXy5leHRlbmQocHJvcHMsIHtcbiAgICAgICAgICAgIGlkOiAnbG9nYm9vaycsXG4gICAgICAgICAgICBzdHlsZTogJ2JsYWNrJyxcbiAgICAgICAgICAgIHBvczoge1xuICAgICAgICAgICAgICAgIHRvcDogMTAwLFxuICAgICAgICAgICAgICAgIGxlZnQ6IDUwMFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGFycm93OiBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwiYXJyb3ctdG8tbG9nYm9vay1uZXd0b24xXCJ9KSxcbiAgICAgICAgICAgIGJvZHk6IFJlYWN0LkRPTS5wKG51bGwsIFwiTm90aWNlIHRoYXQgYm90aCB0aW1lcyBzaG93IHVwIGluIHRoZSBsb2cgYm9vay5cIiksXG4gICAgICAgICAgICBvblJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBwcm9wcy5vbk5leHQoKTtcbiAgICAgICAgICAgICAgICB9LCBERUJVRyA/IDEwMCA6IDUwMDApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KSk7XG4gICAgfSxcblxuICAgIGZ1bmN0aW9uIChwcm9wcykge1xuICAgICAgICByZXR1cm4gU3RlcChfLmV4dGVuZChwcm9wcywge1xuICAgICAgICAgICAgaWQ6ICdhbnN3ZXInLFxuICAgICAgICAgICAgc3R5bGU6ICdibGFjaycsXG4gICAgICAgICAgICBwb3M6IHtcbiAgICAgICAgICAgICAgICB0b3A6IDE1MCxcbiAgICAgICAgICAgICAgICBsZWZ0OiAyNTBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBhcnJvdzogUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImFycm93LXRvLWFuc3dlclwifSksXG4gICAgICAgICAgICBzaG93QmFjb246IHRydWUsXG4gICAgICAgICAgICB0aXRsZTogXCJOb3cgY29uZHVjdCB0aGUgZXhwZXJpbWVudCB0byB0ZXN0IHlvdXIgaHlwb3RoZXNpcyFcIixcbiAgICAgICAgICAgIGJvZHk6IFJlYWN0LkRPTS5wKG51bGwsIFwiT25jZSB5b3UndmUgY29sbGVjdGVkIGVub3VnaCBkYXRhIGluIHlvdXIgbG9nIGJvb2ssXCIgKyAnICcgK1xuICAgICAgICAgICAgXCJkZWNpZGUgd2hldGhlciB0aGUgZGF0YSBcIiwgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJ1bGluZVwifSwgXCJzdXBwb3J0XCIpLCBcIiBvclwiLCBcbiAgICAgICAgICAgICcgJywgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJ1bGluZVwifSwgXCJkaXNwcm92ZVwiKSwgXCIgeW91ciBoeXBvdGhlc2lzLiBUaGVuXCIgKyAnICcgK1xuICAgICAgICAgICAgXCJJIHdpbGwgZXZhbHVhdGUgeW91ciBleHBlcmltZW50IGFuZCBnaXZlIHlvdSBmZWVkYmFjay5cIiksXG4gICAgICAgICAgICBuZXh0OiBcIk9rLCBJJ20gcmVhZHlcIixcbiAgICAgICAgfSkpXG4gICAgfSxcbl1cbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xuXG52YXIgUFQgPSBSZWFjdC5Qcm9wVHlwZXNcbnZhciBjeCA9IFJlYWN0LmFkZG9ucy5jbGFzc1NldFxuXG52YXIgU3RlcCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ1N0ZXAnLFxuICAgIHByb3BUeXBlczoge1xuICAgICAgICB0aXRsZTogUFQuc3RyaW5nLFxuICAgICAgICBuZXh0OiBQVC5zdHJpbmcsXG4gICAgICAgIG9uUmVuZGVyOiBQVC5mdW5jLFxuICAgICAgICBvbkZhZGVkT3V0OiBQVC5mdW5jLFxuICAgICAgICBzaG93QmFjb246IFBULmJvb2wsXG4gICAgICAgIGZhZGVPdXQ6IFBULmJvb2wsXG4gICAgfSxcblxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc3R5bGU6ICd3aGl0ZSdcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5vblJlbmRlcikge1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5vblJlbmRlcigpXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5nZXRET01Ob2RlKCkuYWRkRXZlbnRMaXN0ZW5lcigndHJhbnNpdGlvbmVuZCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLmZhZGVPdXQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm9uRmFkZWRPdXQoKVxuICAgICAgICAgICAgfVxuICAgICAgICB9LmJpbmQodGhpcykpXG4gICAgfSxcblxuICAgIGNvbXBvbmVudERpZFVwZGF0ZTogZnVuY3Rpb24gKHByZXZQcm9wcykge1xuICAgICAgICBpZiAocHJldlByb3BzLmlkICE9PSB0aGlzLnByb3BzLmlkICYmXG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uUmVuZGVyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5vblJlbmRlcigpXG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMucHJvcHMub25VcGRhdGUpIHtcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25VcGRhdGUuY2FsbCh0aGlzLCBwcmV2UHJvcHMpXG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBzdHlsZVxuICAgICAgICBpZiAodGhpcy5wcm9wcy5wb3MpIHtcbiAgICAgICAgICAgIHN0eWxlID0ge1xuICAgICAgICAgICAgICAgIG1hcmdpblRvcDogMCxcbiAgICAgICAgICAgICAgICBtYXJnaW5MZWZ0OiAwLFxuICAgICAgICAgICAgICAgIHRvcDogdGhpcy5wcm9wcy5wb3MudG9wICsgJ3B4JyxcbiAgICAgICAgICAgICAgICBsZWZ0OiB0aGlzLnByb3BzLnBvcy5sZWZ0ICsgJ3B4J1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IGN4KHtcbiAgICAgICAgICAgIFwid2Fsa3Rocm91Z2hcIjogdHJ1ZSxcbiAgICAgICAgICAgIFwid2Fsa3Rocm91Z2gtLXdoaXRlXCI6IHRoaXMucHJvcHMuc3R5bGUgPT09ICd3aGl0ZScsXG4gICAgICAgICAgICBcIndhbGt0aHJvdWdoLS1ibGFja1wiOiB0aGlzLnByb3BzLnN0eWxlID09PSAnYmxhY2snXG4gICAgICAgIH0pfSwgXG4gICAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IGN4KHtcbiAgICAgICAgICAgICAgICBcIndhbGt0aHJvdWdoX3N0ZXBcIjogdHJ1ZSxcbiAgICAgICAgICAgICAgICBcIndhbGt0aHJvdWdoX3N0ZXAtLWZhZGUtb3V0XCI6IHRoaXMucHJvcHMuZmFkZU91dFxuICAgICAgICAgICAgfSkgKyBcIiB3YWxrdGhyb3VnaF9zdGVwLS1cIiArIHRoaXMucHJvcHMuaWQsIHN0eWxlOiBzdHlsZX0sIFxuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMuc2hvd0JhY29uICYmIFJlYWN0LkRPTS5pbWcoe2NsYXNzTmFtZTogXCJ3YWxrdGhyb3VnaF9zaXItZnJhbmNpc1wiLCBzcmM6IFwiaW1hZ2VzL3Npci1mcmFuY2lzLXRyYW5zcGFyZW50Mi5naWZcIn0pLCBcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLnRpdGxlICYmXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJ3YWxrdGhyb3VnaF90aXRsZVwifSwgdGhpcy5wcm9wcy50aXRsZSksIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJ3YWxrdGhyb3VnaF9ib2R5XCJ9LCBcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5ib2R5XG4gICAgICAgICAgICAgICAgKSwgXG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5hcnJvdyB8fCBmYWxzZSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcIndhbGt0aHJvdWdoX2J1dHRvbnNcIn0sIFxuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm5leHQgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5idXR0b24oe29uQ2xpY2s6IHRoaXMucHJvcHMub25OZXh0LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU6IFwid2Fsa3Rocm91Z2hfbmV4dCBidG4gYnRuLWRlZmF1bHRcIn0sIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMubmV4dFxuICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgIClcbiAgICAgICAgKVxuICAgIH1cbn0pXG5cbm1vZHVsZS5leHBvcnRzID0gU3RlcFxuIiwiLyoqIEBqc3ggUmVhY3QuRE9NICovXG5cbnZhciBXYWxrVGhyb3VnaCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ1dhbGtUaHJvdWdoJyxcbiAgICBwcm9wVHlwZXM6IHtcbiAgICAgICAgc3RlcHM6IFJlYWN0LlByb3BUeXBlcy5hcnJheS5pc1JlcXVpcmVkLFxuICAgICAgICBvbkRvbmU6IFJlYWN0LlByb3BUeXBlcy5mdW5jLFxuICAgIH0sXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzdGVwOiAwLFxuICAgICAgICAgICAgZGF0YToge30sXG4gICAgICAgICAgICBmYWRpbmc6IGZhbHNlXG4gICAgICAgIH1cbiAgICB9LFxuICAgIG9uRmFkZWRPdXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuZmFkaW5nID09PSBmYWxzZSkge1xuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5nb1RvKHRoaXMuc3RhdGUuZmFkaW5nKVxuICAgIH0sXG4gICAgZ29UbzogZnVuY3Rpb24gKG51bSkge1xuICAgICAgICBpZiAobnVtID49IHRoaXMucHJvcHMuc3RlcHMubGVuZ3RoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5vbkRvbmUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm9uRG9uZSgpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldFN0YXRlKHtzdGVwOiBudW0sIGZhZGluZzogZmFsc2V9KVxuICAgIH0sXG4gICAgc3RhcnRHb2luZzogZnVuY3Rpb24gKG51bSkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtmYWRpbmc6IG51bX0pXG4gICAgfSxcbiAgICBzZXREYXRhOiBmdW5jdGlvbiAoYXR0ciwgdmFsKSB7XG4gICAgICAgIHZhciBkYXRhID0gXy5leHRlbmQoe30sIHRoaXMuc3RhdGUuZGF0YSlcbiAgICAgICAgZGF0YVthdHRyXSA9IHZhbFxuICAgICAgICB0aGlzLnNldFN0YXRlKHtkYXRhOiBkYXRhfSlcbiAgICB9LFxuICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgU3RlcCA9IHRoaXMucHJvcHMuc3RlcHNbdGhpcy5zdGF0ZS5zdGVwXVxuICAgICAgICB2YXIgcHJvcHMgPSB7XG4gICAgICAgICAgICBvbk5leHQ6IHRoaXMuc3RhcnRHb2luZy5iaW5kKG51bGwsIHRoaXMuc3RhdGUuc3RlcCArIDEpLFxuICAgICAgICAgICAgc2V0RGF0YTogdGhpcy5zZXREYXRhLFxuICAgICAgICAgICAgZGF0YTogdGhpcy5zdGF0ZS5kYXRhLFxuICAgICAgICAgICAgZmFkZU91dDogdGhpcy5zdGF0ZS5mYWRpbmcgIT09IGZhbHNlLFxuICAgICAgICAgICAgb25GYWRlZE91dDogdGhpcy5vbkZhZGVkT3V0XG4gICAgICAgIH1cbiAgICAgICAgZm9yICh2YXIgbmFtZSBpbiB0aGlzLnByb3BzKSB7XG4gICAgICAgICAgICBwcm9wc1tuYW1lXSA9IHRoaXMucHJvcHNbbmFtZV1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gU3RlcChwcm9wcylcbiAgICB9XG59KVxuXG5tb2R1bGUuZXhwb3J0cyA9IFdhbGtUaHJvdWdoXG5cbiIsIlxudmFyIHV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBMb2dCb29rO1xuXG5mdW5jdGlvbiBMb2dCb29rKHdvcmxkLCBlbGVtLCBrZWVwLCBzZWVkZWRDb2x1bW5zLCBoaWRlQXZnKSB7XG4gICAgdGhpcy5fYXR0YWNoKHdvcmxkLCBlbGVtLCBrZWVwLCBzZWVkZWRDb2x1bW5zLCBoaWRlQXZnKTtcbn1cblxuTG9nQm9vay5wcm90b3R5cGUuX2F0dGFjaCA9IGZ1bmN0aW9uICh3b3JsZCwgZWxlbSwga2VlcCwgc2VlZGVkQ29sdW1ucywgaGlkZUF2Zykge1xuICAgIGNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgY29udGFpbmVyLmNsYXNzTmFtZSA9IFwibG9nLWJvb2tcIjtcbiAgICBlbGVtLmFwcGVuZENoaWxkKGNvbnRhaW5lcik7XG4gICAgaGVhZGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIik7XG4gICAgaGVhZGVyLmNsYXNzTmFtZSA9IFwibG9nLWJvb2staGVhZGVyXCI7XG4gICAgaGVhZGVyLmlubmVySFRNTCA9IFwiTG9nIEJvb2tcIjtcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoaGVhZGVyKTtcbiAgICBib2R5Q29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBib2R5Q29udGFpbmVyLmNsYXNzTmFtZSA9IFwibG9nLWJvb2stYm9keVwiO1xuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChib2R5Q29udGFpbmVyKTtcbiAgICB0aGlzLmJvZHlDb250YWluZXIgPSBib2R5Q29udGFpbmVyO1xuICAgIHRoaXMuaGlkZUF2ZyA9IGhpZGVBdmc7XG5cbiAgICB0aGlzLmNvbHVtbnNCeUJvZHlOYW1lID0ge307XG4gICAgdGhpcy5sYXN0VWlkcyA9IHt9O1xuICAgIHRoaXMuc3RhcnRUaW1lQnlCb2R5TmFtZSA9IHt9O1xuICAgIHRoaXMuZGF0YSA9IHt9O1xuICAgIHRoaXMua2VlcCA9IGtlZXA7XG4gICAgdGhpcy53b3JsZCA9IHdvcmxkO1xuICAgIHdvcmxkLm9uKCdzdGVwJywgdGhpcy5oYW5kbGVUaWNrLmJpbmQodGhpcykpO1xuXG4gICAgaWYgKHNlZWRlZENvbHVtbnMpIHtcbiAgICAgICAgXy5lYWNoKHNlZWRlZENvbHVtbnMsIGZ1bmN0aW9uIChjb2wpIHtcbiAgICAgICAgICAgIHRoaXMuYWRkQ29sdW1uKGNvbC5uYW1lLCBjb2wuZXh0cmFUZXh0LCBjb2wuY29sb3IpO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgIH1cbn1cblxuTG9nQm9vay5wcm90b3R5cGUuaGFuZGxlU3RhcnQgPSBmdW5jdGlvbihjb2xOYW1lLCB1aWQpIHtcbiAgICBpZiAoIXRoaXMuc3RhcnRUaW1lQnlCb2R5TmFtZVtjb2xOYW1lXSkge1xuICAgICAgICB0aGlzLm5ld1RpbWVyKGNvbE5hbWUpO1xuICAgIH1cbiAgICB0aGlzLmxhc3RVaWRzW2NvbE5hbWVdID0gdWlkO1xuICAgIHRoaXMuc3RhcnRUaW1lQnlCb2R5TmFtZVtjb2xOYW1lXSA9IHRoaXMud29ybGQuX3RpbWU7XG4gICAgdGhpcy5yZW5kZXJUaW1lcihjb2xOYW1lLCAwKTtcbn1cblxuTG9nQm9vay5wcm90b3R5cGUuaGFuZGxlRW5kID0gZnVuY3Rpb24oY29sTmFtZSwgdWlkKSB7XG4gICAgaWYgKGNvbE5hbWUgaW4gdGhpcy5kYXRhICYmXG4gICAgICAgICAgICB0aGlzLmxhc3RVaWRzW2NvbE5hbWVdID09IHVpZCkge1xuICAgICAgICB0aGlzLmRhdGFbY29sTmFtZV0ucHVzaChcbiAgICAgICAgICAgIHRoaXMud29ybGQuX3RpbWUgLSB0aGlzLnN0YXJ0VGltZUJ5Qm9keU5hbWVbY29sTmFtZV0pO1xuICAgICAgICBkZWxldGUgdGhpcy5zdGFydFRpbWVCeUJvZHlOYW1lW2NvbE5hbWVdO1xuICAgICAgICBkZWxldGUgdGhpcy5sYXN0VWlkc1tjb2xOYW1lXTtcbiAgICAgICAgaWYgKCF0aGlzLmhpZGVBdmcpIHtcbiAgICAgICAgICAgIHZhciBhdmcgPSBjbGVhbih1dGlsLmF2Zyh0aGlzLmRhdGFbY29sTmFtZV0pKTtcbiAgICAgICAgICAgICQodGhpcy5jb2x1bW5zQnlCb2R5TmFtZVtjb2xOYW1lXSlcbiAgICAgICAgICAgICAgICAuZmluZCgnLmxvZy1ib29rLWF2ZycpLnRleHQoJ0F2ZzogJyArIGF2Zyk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbkxvZ0Jvb2sucHJvdG90eXBlLmhhbmRsZVRpY2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgbmV3VGltZSA9IHRoaXMud29ybGQuX3RpbWU7XG4gICAgJC5lYWNoKHRoaXMuc3RhcnRUaW1lQnlCb2R5TmFtZSwgZnVuY3Rpb24gKG5hbWUsIHN0YXJ0VGltZSkge1xuICAgICAgICB0aGlzLnJlbmRlclRpbWVyKG5hbWUsIG5ld1RpbWUgLSBzdGFydFRpbWUpO1xuICAgIH0uYmluZCh0aGlzKSk7XG59XG5cbkxvZ0Jvb2sucHJvdG90eXBlLmFkZENvbHVtbiA9IGZ1bmN0aW9uIChuYW1lLCBleHRyYVRleHQsIGNvbG9yKSB7XG4gICAgZXh0cmFUZXh0ID0gZXh0cmFUZXh0IHx8IFwiXCI7XG4gICAgdmFyIGNvbHVtbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgY29sdW1uLmNsYXNzTmFtZSA9IFwibG9nLWJvb2stY29sdW1uXCI7XG4gICAgdmFyIGhlYWRpbmcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKTtcbiAgICBoZWFkaW5nLmNsYXNzTmFtZSA9IFwibG9nLWJvb2staGVhZGluZ1wiO1xuICAgIGhlYWRpbmcuaW5uZXJIVE1MID0gbmFtZSArIGV4dHJhVGV4dDtcbiAgICAvKiogRGlzYWJsaW5nIHVudGlsIHdlIGZpbmQgc29tZXRoaW5nIHRoYXQgbG9va3MgZ3JlYXRcbiAgICBpZiAoY29sb3IpIHtcbiAgICAgICAgaGVhZGluZy5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBjb2xvcjtcbiAgICB9XG4gICAgKi9cbiAgICBjb2x1bW4uYXBwZW5kQ2hpbGQoaGVhZGluZyk7XG4gICAgaWYgKCF0aGlzLmhpZGVBdmcpIHtcbiAgICAgICAgdmFyIGF2ZXJhZ2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICBhdmVyYWdlLmNsYXNzTmFtZSA9ICdsb2ctYm9vay1hdmcnO1xuICAgICAgICBhdmVyYWdlLmlubmVySFRNTCA9ICctLSc7XG4gICAgICAgIGNvbHVtbi5hcHBlbmRDaGlsZChhdmVyYWdlKTtcbiAgICB9XG4gICAgdGhpcy5pbnNlcnRDb2x1bW4obmFtZSwgY29sdW1uKTsgLy8gd2lsbCBpbnNlcnQgaXQgYXQgdGhlIHJpZ2h0IHBvaW50LlxuICAgIHRoaXMuY29sdW1uc0J5Qm9keU5hbWVbbmFtZV0gPSBjb2x1bW47XG4gICAgdGhpcy5kYXRhW25hbWVdID0gW107XG4gICAgLy8gc2VlZCB0aGUgY29sdW1uIHdpdGggYmxhbmtzXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmtlZXA7IGkrKykge1xuICAgICAgICB0aGlzLm5ld1RpbWVyKG5hbWUpO1xuICAgIH1cbn1cblxuTG9nQm9vay5wcm90b3R5cGUuaW5zZXJ0Q29sdW1uID0gZnVuY3Rpb24gKG5hbWUsIGNvbHVtbikge1xuICAgIC8vIGluc2VydCB0aGUgY29sdW1uIGluIG9yZGVyLiAgdGhpcyBpcyBhIGJpdCBhcmJpdHJhcnkgc2luY2Ugd2UgZG9uJ3Qga25vd1xuICAgIC8vIHdoYXQgdGhlIHNvcnQgb3JkZXIgc2hvdWxkIHJlYWxseSBiZSwgc28gd2UganVzdCBwdXQgc3RyaW5ncyB3aXRob3V0XG4gICAgLy8gbnVtYmVycywgdGhlbiBzdHJpbmdzIHRoYXQgc3RhcnQgd2l0aCBhIG51bWJlci5cbiAgICB2YXIga2V5Zm4gPSBmdW5jdGlvbiAobmFtZSkge1xuICAgICAgICAvLyBpZiB0aGUgbmFtZSBzdGFydHMgd2l0aCBhIG51bWJlciwgc29ydCBieSB0aGF0LCB0aGVuIHRoZSBmdWxsIG5hbWUuXG4gICAgICAgIC8vIG90aGVyd2lzZSwgcHV0IGl0IGFmdGVyIG51bWJlcnMsIGFuZCBzb3J0IGJ5IHRoZSBmdWxsIG5hbWUuXG4gICAgICAgIHZhciBudW0gPSBwYXJzZUludChuYW1lKTtcbiAgICAgICAgaWYgKGlzTmFOKG51bSkpIHtcbiAgICAgICAgICAgIG51bSA9IEluZmluaXR5O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBbbnVtLCBuYW1lXTtcbiAgICB9XG4gICAgdmFyIGluc2VydGVkID0gZmFsc2U7XG4gICAgJCh0aGlzLmJvZHlDb250YWluZXIpLmZpbmQoXCIubG9nLWJvb2staGVhZGluZ1wiKS5lYWNoKGZ1bmN0aW9uIChpLCBzcGFuKSB7XG4gICAgICAgIHZhciBrMSA9IGtleWZuKG5hbWUpO1xuICAgICAgICB2YXIgazIgPSBrZXlmbigkKHNwYW4pLmh0bWwoKSk7XG4gICAgICAgIGlmIChrMVswXSA8IGsyWzBdIHx8IChrMVswXSA9PSBrMlswXSAmJiBrMVsxXSA8IGsyWzFdKSkge1xuICAgICAgICAgICAgJChzcGFuKS5wYXJlbnQoKS5iZWZvcmUoY29sdW1uKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHNwYW4pO1xuICAgICAgICAgICAgaW5zZXJ0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlOyAvL2JyZWFrXG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBpZiAoIWluc2VydGVkKSB7XG4gICAgICAgIC8vIGlmIGl0J3MgdGhlIGJpZ2dlc3QsIHB1dCBpdCBhdCB0aGUgZW5kLlxuICAgICAgICB0aGlzLmJvZHlDb250YWluZXIuYXBwZW5kQ2hpbGQoY29sdW1uKTtcbiAgICAgICAgY29uc29sZS5sb2codGhpcy5ib2R5Q29udGFpbmVyKTtcbiAgICB9XG59XG5cbkxvZ0Jvb2sucHJvdG90eXBlLm5ld1RpbWVyID0gZnVuY3Rpb24obmFtZSkge1xuICAgIC8vIGp1c3QgZG9lcyB0aGUgRE9NIHNldHVwLCBkb2Vzbid0IGFjdHVhbGx5IHN0YXJ0IHRoZSB0aW1lclxuICAgIGlmICghdGhpcy5jb2x1bW5zQnlCb2R5TmFtZVtuYW1lXSkge1xuICAgICAgICB0aGlzLmFkZENvbHVtbihuYW1lKTtcbiAgICB9XG4gICAgdmFyIGNvbCA9IHRoaXMuY29sdW1uc0J5Qm9keU5hbWVbbmFtZV07XG4gICAgdmFyIHRvUmVtb3ZlID0gJChjb2wpLmZpbmQoXCIubG9nLWJvb2stZGF0dW1cIikuc2xpY2UoMCwtdGhpcy5rZWVwKzEpO1xuICAgIHRvUmVtb3ZlLnNsaWRlVXAoNTAwLCBmdW5jdGlvbiAoKSB7dG9SZW1vdmUucmVtb3ZlKCk7fSk7XG4gICAgdGhpcy5kYXRhW25hbWVdID0gdGhpcy5kYXRhW25hbWVdLnNsaWNlKC10aGlzLmtlZXArMSk7XG4gICAgdmFyIGRhdHVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIik7XG4gICAgZGF0dW0uY2xhc3NOYW1lID0gXCJsb2ctYm9vay1kYXR1bVwiO1xuXG4gICAgaWYgKCF0aGlzLmhpZGVBdmcpIHtcbiAgICAgICAgdmFyIGF2ZyA9IGNsZWFuKHV0aWwuYXZnKHRoaXMuZGF0YVtuYW1lXSkpO1xuICAgICAgICAkKGNvbCkuZmluZCgnLmxvZy1ib29rLWF2ZycpLnRleHQoJ0F2ZzogJyArIGF2Zyk7XG4gICAgfVxuXG4gICAgY29sLmFwcGVuZENoaWxkKGRhdHVtKTtcbiAgICB0aGlzLnJlbmRlclRpbWVyKG5hbWUpO1xufVxuXG5mdW5jdGlvbiBjbGVhbih0aW1lKSB7XG4gICAgcmV0dXJuIHBhcnNlRmxvYXQodGltZSAvIDEwMDApLnRvRml4ZWQoMikgKyAncyc7XG59XG5cbkxvZ0Jvb2sucHJvdG90eXBlLnJlbmRlclRpbWVyID0gZnVuY3Rpb24gKG5hbWUsIHRpbWUpIHtcbiAgICB2YXIgZGF0dW0gPSB0aGlzLmNvbHVtbnNCeUJvZHlOYW1lW25hbWVdLmxhc3RDaGlsZDtcbiAgICBpZiAodGltZSkge1xuICAgICAgICBkYXR1bS5pbm5lckhUTUwgPSBjbGVhbih0aW1lKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBkYXR1bS5pbm5lckhUTUwgPSBcIi0tXCI7XG4gICAgICAgIGRhdHVtLnN0eWxlLnRleHRBbGlnbiA9IFwiY2VudGVyXCI7XG4gICAgfVxufVxuIiwidmFyIEdhdGUgPSByZXF1aXJlKCcuL2dhdGUnKTtcbnZhciBHcmFwaCA9IHJlcXVpcmUoJy4vZ3JhcGgnKTtcbnZhciBCYXNlID0gcmVxdWlyZSgnLi9iYXNlJyk7XG52YXIgU3RvcHdhdGNoID0gcmVxdWlyZSgnLi9zdG9wd2F0Y2gnKTtcbnZhciBQbGF5UGF1c2UgPSByZXF1aXJlKCcuL3BsYXlwYXVzZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2UuZXh0ZW5kKGZ1bmN0aW9uIE9yYml0KGNvbnRhaW5lciwgb3B0aW9ucykge1xuICAgIEJhc2UuY2FsbCh0aGlzLCBjb250YWluZXIsIG9wdGlvbnMsIFwiaW1hZ2VzL3NwYWNlX2JhY2tncm91bmQuanBnXCIpXG59LCB7XG4gICAgc2V0dXA6IGZ1bmN0aW9uIChjb250YWluZXIpIHtcbiAgICAgICAgdmFyIHdvcmxkID0gdGhpcy53b3JsZDtcbiAgICAgICAgdmFyIGQgPSA0LjA7XG4gICAgICAgIHZhciB2ID0gMC4zNjtcbiAgICAgICAgdmFyIGNpcmNsZTEgPSBQaHlzaWNzLmJvZHkoJ2NpcmNsZScsIHtcbiAgICAgICAgICAgIHg6IHRoaXMub3B0aW9ucy53aWR0aCAvIDIgLSBkLzJcbiAgICAgICAgICAgICx5OiAyMDBcbiAgICAgICAgICAgICx2eDogdlxuICAgICAgICAgICAgLHJhZGl1czogMlxuICAgICAgICAgICAgLG1hc3M6IDFcbiAgICAgICAgICAgICxyZXN0aXR1dGlvbjogMFxuICAgICAgICAgICAgLHN0eWxlczoge1xuICAgICAgICAgICAgICAgIGZpbGxTdHlsZTogJyNlZWRkMjInXG4gICAgICAgICAgICAgICAgLGFuZ2xlSW5kaWNhdG9yOiAnIzE1NTQ3OSdcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHZhciBjaXJjbGUyID0gUGh5c2ljcy5ib2R5KCdjaXJjbGUnLCB7XG4gICAgICAgICAgICB4OiB0aGlzLm9wdGlvbnMud2lkdGggLyAyICsgZC8yXG4gICAgICAgICAgICAseTogMjAwXG4gICAgICAgICAgICAsdng6IHZcbiAgICAgICAgICAgICxyYWRpdXM6IDJcbiAgICAgICAgICAgICxtYXNzOiAxXG4gICAgICAgICAgICAscmVzdGl0dXRpb246IDBcbiAgICAgICAgICAgICxzdHlsZXM6IHtcbiAgICAgICAgICAgICAgICBmaWxsU3R5bGU6ICcjZWVkZDIyJ1xuICAgICAgICAgICAgICAgICxhbmdsZUluZGljYXRvcjogJyMxNTU0NzknXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBiaWcgPSBQaHlzaWNzLmJvZHkoJ2NpcmNsZScsIHtcbiAgICAgICAgICAgIHg6IHRoaXMub3B0aW9ucy53aWR0aCAvIDJcbiAgICAgICAgICAgICx5OiAzMDBcbiAgICAgICAgICAgICx2eDogLTIgKiB2LzI1XG4gICAgICAgICAgICAscmFkaXVzOiAxMFxuICAgICAgICAgICAgLG1hc3M6IDI1XG4gICAgICAgICAgICAscmVzdGl0dXRpb246IDBcbiAgICAgICAgICAgICxzdHlsZXM6IHtcbiAgICAgICAgICAgICAgICBmaWxsU3R5bGU6ICcjZWVkZDIyJ1xuICAgICAgICAgICAgICAgICxhbmdsZUluZGljYXRvcjogJyMxNTU0NzknXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICB2YXIgY29uc3RyYWludHMgPSBQaHlzaWNzLmJlaGF2aW9yKCd2ZXJsZXQtY29uc3RyYWludHMnKTtcbiAgICAgICAgY29uc3RyYWludHMuZGlzdGFuY2VDb25zdHJhaW50KGNpcmNsZTEsIGNpcmNsZTIsIDEpO1xuICAgICAgICB3b3JsZC5hZGQoW2NpcmNsZTEsIGNpcmNsZTIsIGJpZywgY29uc3RyYWludHNdKTtcbiAgICAgICAgd29ybGQuYWRkKFBoeXNpY3MuYmVoYXZpb3IoJ25ld3RvbmlhbicsIHsgc3RyZW5ndGg6IC41IH0pKTtcblxuICAgICAgICB2YXIgbW9vblJvdGF0aW9uID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGR4ID0gY2lyY2xlMS5zdGF0ZS5wb3MueCAtIGNpcmNsZTIuc3RhdGUucG9zLng7XG4gICAgICAgICAgICB2YXIgZHkgPSBjaXJjbGUyLnN0YXRlLnBvcy55IC0gY2lyY2xlMS5zdGF0ZS5wb3MueTtcbiAgICAgICAgICAgIHJldHVybiBNYXRoLmF0YW4yKGR5LGR4KTtcbiAgICAgICAgfTtcblxuICAgICAgICB2YXIgbW9vblJldm9sdXRpb24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgZHggPSAoY2lyY2xlMS5zdGF0ZS5wb3MueCArIGNpcmNsZTIuc3RhdGUucG9zLngpLzIgLSBiaWcuc3RhdGUucG9zLng7XG4gICAgICAgICAgICB2YXIgZHkgPSBiaWcuc3RhdGUucG9zLnkgLSAoY2lyY2xlMi5zdGF0ZS5wb3MueSArIGNpcmNsZTEuc3RhdGUucG9zLnkpLzI7XG4gICAgICAgICAgICByZXR1cm4gTWF0aC5hdGFuMihkeSxkeCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdmFyIGdyYXBoID0gbmV3IEdyYXBoKHRoaXMuY29udGFpbmVyLCB7XG4gICAgICAgICAgICAnUm90Jzoge2ZuOiBtb29uUm90YXRpb24sIHRpdGxlOiAnUm90YXRpb24nLCBtaW5zY2FsZTogMiAqIE1hdGguUEl9LFxuICAgICAgICAgICAgJ1Jldic6IHtmbjogbW9vblJldm9sdXRpb24sIHRpdGxlOiAnUmV2b2x1dGlvbicsIG1pbnNjYWxlOiAyICogTWF0aC5QSX0sXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIG1heDogMjAwMCxcbiAgICAgICAgICAgIHRvcDogMTAsXG4gICAgICAgICAgICBsZWZ0OiB0aGlzLm9wdGlvbnMud2lkdGgsXG4gICAgICAgICAgICB3aWR0aDogMzAwLFxuICAgICAgICAgICAgd29ybGRIZWlnaHQ6IHRoaXMub3B0aW9ucy5oZWlnaHQsXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmdyYXBoID0gZ3JhcGg7XG5cbiAgICAgICAgdGhpcy53b3JsZC5vbignc3RlcCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGdyYXBoLnVwZGF0ZSh3b3JsZC50aW1lc3RlcCgpKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdmFyIGJ1dHRvbkNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChidXR0b25Db250YWluZXIpO1xuICAgICAgICB2YXIgcGxheVBhdXNlID0gbmV3IFBsYXlQYXVzZSh3b3JsZCwgYnV0dG9uQ29udGFpbmVyKTtcbiAgICB9XG59KTtcblxuICAgICAgICBcbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xuXG52YXIgUFQgPSBSZWFjdC5Qcm9wVHlwZXNcbnZhciBjeCA9IFJlYWN0LmFkZG9ucy5jbGFzc1NldFxuXG52YXIgTmV3QXN0ZXJvaWRCdXR0b24gPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdOZXdBc3Rlcm9pZEJ1dHRvbicsXG4gICAgcHJvcFR5cGVzOiB7XG4gICAgICAgIG9uQ2xpY2s6IFBULmZ1bmMsXG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgY2xhc3NOYW1lID0gY3goe1xuICAgICAgICAgICAgJ2FzdGVyb2lkLWJ1dHRvbic6IHRydWUsXG4gICAgICAgIH0pXG5cbiAgICAgICAgcmV0dXJuIFJlYWN0LkRPTS5idXR0b24oe1xuICAgICAgICAgICAgdHlwZTogXCJidXR0b25cIiwgXG4gICAgICAgICAgICBjbGFzc05hbWU6IFwibmV3LWFzdGVyb2lkLWJ1dHRvblwiLCBcbiAgICAgICAgICAgIG9uQ2xpY2s6IHRoaXMucHJvcHMub25DbGlja30sIFwiTmV3IEFzdGVyb2lkXCIpXG4gICAgfVxufSlcblxubW9kdWxlLmV4cG9ydHMgPSBOZXdBc3Rlcm9pZEJ1dHRvblxuIiwidmFyIEdhdGUgPSByZXF1aXJlKCcuL2dhdGUnKTtcbnZhciBCYXNlID0gcmVxdWlyZSgnLi9iYXNlJyk7XG52YXIgU3RvcHdhdGNoID0gcmVxdWlyZSgnLi9zdG9wd2F0Y2gnKTtcbnZhciBQbGF5UGF1c2UgPSByZXF1aXJlKCcuL3BsYXlwYXVzZScpO1xudmFyIHV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcbnZhciBMb2dCb29rID0gcmVxdWlyZSgnLi9sb2dib29rJylcbnZhciBOZXd0b24xV2Fsa3Rocm91Z2ggPSByZXF1aXJlKCcuL2ludHJvL25ld3RvbjFfaW50cm8uanN4JylcbnZhciBOZXdBc3Rlcm9pZEJ1dHRvbiA9IHJlcXVpcmUoJy4vbmV3LWFzdGVyb2lkLWJ1dHRvbi5qc3gnKVxudmFyIG5ld3RvbjFEYXRhQ2hlY2tlciA9IHJlcXVpcmUoJy4vbmV3dG9uMWRhdGFjaGVja2VyJylcblxuZnVuY3Rpb24gcmFuZG9tKG1pbiwgbWF4KXtcbiAgICByZXR1cm4gKE1hdGgucmFuZG9tKCkgKiAobWF4LW1pbikgKyBtaW4pfDBcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBCYXNlLmV4dGVuZChmdW5jdGlvbiBBc3Rlcm9pZHMoY29udGFpbmVyLCBvcHRpb25zKSB7XG4gICAgQmFzZS5jYWxsKHRoaXMsIGNvbnRhaW5lciwgb3B0aW9ucywgJ2ltYWdlcy9zcGFjZV9iYWNrZ3JvdW5kLmpwZycsXG4gICAgICAgIHRydWUgLyogZGlzYWJsZUJvdW5kcyAqLylcbn0sIHtcbiAgICBzZXR1cDogZnVuY3Rpb24gKGNvbnRhaW5lcikge1xuICAgICAgICB2YXIgd29ybGQgPSB0aGlzLndvcmxkO1xuICAgICAgICB0aGlzLmFjdGl2ZUFzdGVyb2lkID0gbnVsbDtcbiAgICAgICAgdGhpcy5oYW5kbGVOZXdBc3Rlcm9pZCgpO1xuICAgICAgICB2YXIgc2lkZUJhciA9IHRoaXMuc2lkZUJhciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgIHNpZGVCYXIuY2xhc3NOYW1lID0gXCJzaWRlLWJhclwiO1xuICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoc2lkZUJhcik7XG5cbiAgICAgICAgdmFyIGdhdGUxID0gbmV3IEdhdGUod29ybGQsXG4gICAgICAgICAgICB1dGlsLm1ha2VSZWN0KDAsIDAsIDEwLCA1MDApLFxuICAgICAgICAgICAgWzQwMCwgMzUwXSwgbnVsbCwge2RlYnVnOiB0cnVlLCBzaG93OiB0cnVlLCBjb2xvcjogJ2dyZWVuJ30pO1xuICAgICAgICB2YXIgZ2F0ZTIgPSBuZXcgR2F0ZSh3b3JsZCxcbiAgICAgICAgICAgIHV0aWwubWFrZVJlY3QoMCwgMCwgMTAsIDUwMCksXG4gICAgICAgICAgICBbNjAwLCAzNTBdLCBudWxsLCB7ZGVidWc6IHRydWUsIHNob3c6IHRydWUsIGNvbG9yOiAnZ3JlZW4nfSk7XG4gICAgICAgIHZhciBnYXRlMyA9IG5ldyBHYXRlKHdvcmxkLFxuICAgICAgICAgICAgdXRpbC5tYWtlUmVjdCgwLCAwLCAxMCwgNTAwKSxcbiAgICAgICAgICAgIFs4MDAsIDM1MF0sIG51bGwsIHtkZWJ1ZzogdHJ1ZSwgc2hvdzogdHJ1ZSwgY29sb3I6ICdncmVlbid9KTtcblxuICAgICAgICB2YXIgbG9nQ29sdW1ucyA9IFtcbiAgICAgICAgICAgIHtuYW1lOiBcIlRpbWUgMVwiLCBleHRyYVRleHQ6IFwiXCJ9LFxuICAgICAgICAgICAge25hbWU6IFwiVGltZSAyXCIsIGV4dHJhVGV4dDogXCJcIn0sXG4gICAgICAgIF07XG4gICAgICAgIHZhciBsb2dCb29rID0gdGhpcy5sb2dCb29rID0gbmV3IExvZ0Jvb2sod29ybGQsIHNpZGVCYXIsIDUsIGxvZ0NvbHVtbnMsXG4gICAgICAgICAgICB0cnVlIC8qIGhpZGVBdmcgKi8pO1xuICAgICAgICBnYXRlMS5vbignZW50ZXInLCBmdW5jdGlvbihlbGVtKSB7XG4gICAgICAgICAgICB0aGlzLmNvbnNpZGVyQWN0aXZlQXN0ZXJvaWRHQygpO1xuICAgICAgICAgICAgdmFyIGJvZHkgPSBlbGVtLmJvZHk7XG4gICAgICAgICAgICBpZiAoIXRoaXMuYWN0aXZlQXN0ZXJvaWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFjdGl2ZUFzdGVyb2lkID0gYm9keTtcbiAgICAgICAgICAgICAgICBsb2dCb29rLmhhbmRsZVN0YXJ0KFwiVGltZSAxXCIsIGJvZHkudWlkKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LmJpbmQodGhpcykpXG4gICAgICAgIGdhdGUyLm9uKCdlbnRlcicsIGZ1bmN0aW9uKGVsZW0pIHtcbiAgICAgICAgICAgIHZhciBib2R5ID0gZWxlbS5ib2R5O1xuICAgICAgICAgICAgaWYgKHRoaXMuYWN0aXZlQXN0ZXJvaWQgPT0gYm9keSkge1xuICAgICAgICAgICAgICAgIGxvZ0Jvb2suaGFuZGxlRW5kKFwiVGltZSAxXCIsIGJvZHkudWlkKTtcbiAgICAgICAgICAgICAgICBsb2dCb29rLmhhbmRsZVN0YXJ0KFwiVGltZSAyXCIsIGJvZHkudWlkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfS5iaW5kKHRoaXMpKVxuICAgICAgICBnYXRlMy5vbignZW50ZXInLCBmdW5jdGlvbihlbGVtKSB7XG4gICAgICAgICAgICB2YXIgYm9keSA9IGVsZW0uYm9keTtcbiAgICAgICAgICAgIGlmICh0aGlzLmFjdGl2ZUFzdGVyb2lkID09IGJvZHkpIHtcbiAgICAgICAgICAgICAgICBsb2dCb29rLmhhbmRsZUVuZChcIlRpbWUgMlwiLCBlbGVtLmJvZHkudWlkKTtcbiAgICAgICAgICAgICAgICB0aGlzLmFjdGl2ZUFzdGVyb2lkID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfS5iaW5kKHRoaXMpKVxuXG4gICAgICAgIHZhciBwbGF5UGF1c2VDb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQocGxheVBhdXNlQ29udGFpbmVyKTtcbiAgICAgICAgdmFyIHBsYXlQYXVzZSA9IG5ldyBQbGF5UGF1c2Uod29ybGQsIHBsYXlQYXVzZUNvbnRhaW5lcik7XG4gICAgICAgIHRoaXMuY3JlYXRlTmV3QXN0ZXJvaWRCdXR0b24oY29udGFpbmVyKVxuXG4gICAgICAgIGNvbnNvbGUubG9nKCdvcHRpb25zOiAnICsgdGhpcy5vcHRpb25zKVxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLndhbGspIHtcbiAgICAgICAgICAgIE5ld3RvbjFXYWxrdGhyb3VnaCh0aGlzLCBmdW5jdGlvbiAoaHlwb3RoZXNpcykge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0dXBEYXRhQ2hlY2tlcihoeXBvdGhlc2lzKTtcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc2V0dXBEYXRhQ2hlY2tlcignc2FtZScpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIHNldHVwRGF0YUNoZWNrZXI6IGZ1bmN0aW9uKGh5cG90aGVzaXMpIHtcbiAgICAgICAgdmFyIGRhdGFDaGVja2VyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgZGF0YUNoZWNrZXIuY2xhc3NOYW1lID0gXCJuZXd0b24xLWRhdGEtY2hlY2tlclwiO1xuICAgICAgICB0aGlzLnNpZGVCYXIuYXBwZW5kQ2hpbGQoZGF0YUNoZWNrZXIpO1xuICAgICAgICBuZXd0b24xRGF0YUNoZWNrZXIoZGF0YUNoZWNrZXIsIHRoaXMubG9nQm9vaywgaHlwb3RoZXNpcyk7XG4gICAgfSxcblxuICAgIGNyZWF0ZU5ld0FzdGVyb2lkQnV0dG9uOiBmdW5jdGlvbihjb250YWluZXIpIHtcbiAgICAgICAgdmFyIGVsZW1lbnQgPSAkKCc8ZGl2Lz4nKVxuICAgICAgICAkKGNvbnRhaW5lcikuYXBwZW5kKGVsZW1lbnQpXG4gICAgICAgIFJlYWN0LnJlbmRlckNvbXBvbmVudChOZXdBc3Rlcm9pZEJ1dHRvbih7XG4gICAgICAgICAgICBvbkNsaWNrOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZU5ld0FzdGVyb2lkKCk7XG4gICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKVxuICAgICAgICB9KSwgZWxlbWVudFswXSlcblxuICAgICAgICAvLyB2YXIgbmV3QXN0ZXJvaWRMaW5rID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImFcIik7XG4gICAgICAgIC8vIG5ld0FzdGVyb2lkTGluay5ocmVmID0gXCIjXCI7XG4gICAgICAgIC8vIG5ld0FzdGVyb2lkTGluay5pbm5lckhUTUwgPSBcIk5ldyBhc3Rlcm9pZFwiO1xuICAgICAgICAvLyBuZXdBc3Rlcm9pZExpbmsuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgLy8gdGhpcy5oYW5kbGVOZXdBc3Rlcm9pZCgpO1xuICAgICAgICAgICAgLy8gZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgLy8gfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgLy8gcmV0dXJuIG5ld0FzdGVyb2lkTGluaztcbiAgICB9LFxuXG4gICAgY29uc2lkZXJBY3RpdmVBc3Rlcm9pZEdDOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMuYWN0aXZlQXN0ZXJvaWQpIHtcbiAgICAgICAgICAgIHZhciB4ID0gdGhpcy5hY3RpdmVBc3Rlcm9pZC5zdGF0ZS5wb3MueDtcbiAgICAgICAgICAgIHZhciB5ID0gdGhpcy5hY3RpdmVBc3Rlcm9pZC5zdGF0ZS5wb3MueTtcbiAgICAgICAgICAgIGlmICh4IDwgMTAwIHx8IHggPiAxMDAwIHx8IHkgPCAxMDAgfHwgeSA+IDgwMCkge1xuICAgICAgICAgICAgICAgIHRoaXMuYWN0aXZlQXN0ZXJvaWQgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIGhhbmRsZU5ld0FzdGVyb2lkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHdvcmxkID0gdGhpcy53b3JsZDtcblxuICAgICAgICB2YXIgbWluWCA9IDUwO1xuICAgICAgICB2YXIgbWF4WCA9IDMwMDtcbiAgICAgICAgdmFyIG1pblkgPSA1MDtcbiAgICAgICAgdmFyIG1heFkgPSA2NTA7XG4gICAgICAgIHZhciBtaW5BbmdsZSA9IDA7XG4gICAgICAgIHZhciBtYXhBbmdsZSA9IDIqTWF0aC5QSTtcblxuICAgICAgICB2YXIgYm9keSA9IFBoeXNpY3MuYm9keSgnY2lyY2xlJywge1xuICAgICAgICAgICAgeDogcmFuZG9tKG1pblgsIG1heFgpLFxuICAgICAgICAgICAgeTogcmFuZG9tKG1pblksIG1heFkpLFxuICAgICAgICAgICAgcmFkaXVzOiA1MCxcbiAgICAgICAgICAgIGFuZ2xlOiByYW5kb20obWluQW5nbGUsIG1heEFuZ2xlKSxcbiAgICAgICAgICAgIG1hc3M6IDEwMDAsXG4gICAgICAgICAgICByZXN0aXR1dGlvbjogMCxcbiAgICAgICAgICAgIHN0eWxlczoge1xuICAgICAgICAgICAgICAgIGltYWdlOiAnaW1hZ2VzL2FzdGVyb2lkLnBuZycsXG4gICAgICAgICAgICAgICAgZmlsbFN0eWxlOiAnI2ZmY2MwMCdcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGlmICghdGhpcy5maXJzdEFzdGVyb2lkKSB7XG4gICAgICAgICAgICB0aGlzLmZpcnN0QXN0ZXJvaWQgPSBib2R5O1xuICAgICAgICB9XG4gICAgICAgIHdvcmxkLmFkZChib2R5KTtcbiAgICB9LFxuXG4gICAgZGVtb25zdHJhdGVTYW1wbGU6IGZ1bmN0aW9uKG9uRG9uZSkge1xuICAgICAgICB2YXIgYXN0ZXJvaWQgPSB0aGlzLmZpcnN0QXN0ZXJvaWQ7XG4gICAgICAgIHZhciB0YXJnZXRYID0gMjAwO1xuICAgICAgICB2YXIgdGFyZ2V0WSA9IDM1MDtcblxuICAgICAgICBhc3Rlcm9pZC50cmVhdG1lbnQgPSAna2luZW1hdGljJztcbiAgICAgICAgYXN0ZXJvaWQuc3RhdGUudmVsLnggPSAodGFyZ2V0WCAtIGFzdGVyb2lkLnN0YXRlLnBvcy54KSAvIDE1MDA7XG4gICAgICAgIGFzdGVyb2lkLnN0YXRlLnZlbC55ID0gKHRhcmdldFkgLSBhc3Rlcm9pZC5zdGF0ZS5wb3MueSkgLyAxNTAwO1xuICAgICAgICBhc3Rlcm9pZC5yZWNhbGMoKTtcblxuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgYXN0ZXJvaWQudHJlYXRtZW50ID0gJ2R5bmFtaWMnO1xuICAgICAgICAgICAgYXN0ZXJvaWQuc3RhdGUucG9zLnggPSB0YXJnZXRYO1xuICAgICAgICAgICAgYXN0ZXJvaWQuc3RhdGUucG9zLnkgPSB0YXJnZXRZO1xuICAgICAgICAgICAgYXN0ZXJvaWQuc3RhdGUudmVsLnggPSAwLjI7XG4gICAgICAgICAgICBhc3Rlcm9pZC5zdGF0ZS52ZWwueSA9IDA7XG4gICAgICAgICAgICBhc3Rlcm9pZC5yZWNhbGMoKTtcblxuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBhc3Rlcm9pZC50cmVhdG1lbnQgPSAnZHluYW1pYyc7XG4gICAgICAgICAgICAgICAgYXN0ZXJvaWQucmVjYWxjKCk7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgb25Eb25lKCk7XG4gICAgICAgICAgICAgICAgfSwgMzAwMClcbiAgICAgICAgICAgIH0sIDE1MDApXG4gICAgICAgIH0sIDE1MDApXG4gICAgfVxufSk7XG4iLCJ2YXIgRGF0YUNoZWNrZXIgPSByZXF1aXJlKCcuL2RhdGFjaGVja2VyLmpzeCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRyb3BEYXRhQ2hlY2tlcjtcblxudmFyIF9pbml0aWFsVGV4dCA9IFwiRG8gYW4gZXhwZXJpbWVudCB0byBkZXRlcm1pbmUgaG93IGFzdGVyb2lkcyBiZWhhdmUsIGFuZCBsZXQgbWUga25vdyB3aGVuIHlvdSdyZSBkb25lLlwiO1xuXG52YXIgX25leHRVUkwgPSBcIj9IaWxscyZ3YWxrPXRydWVcIlxuXG52YXIgX2h5cG90aGVzZXMgPSBbXG4gICAge1xuICAgICAgICBuYW1lOiBcImZhc3RlclwiLFxuICAgICAgICBidXR0b25UZXh0OiBcIlRoZSBhc3Rlcm9pZHMgZ2V0IGZhc3Rlci5cIixcbiAgICAgICAgdGV4dDogXCJ0aGF0IHRoZSBhc3Rlcm9pZHMgd2lsbCBnZXQgZmFzdGVyXCIsXG4gICAgfSxcbiAgICB7XG4gICAgICAgIG5hbWU6IFwic2xvd2VyXCIsXG4gICAgICAgIGJ1dHRvblRleHQ6IFwiVGhlIGFzdGVyb2lkcyBnZXQgc2xvd2VyLlwiLFxuICAgICAgICB0ZXh0OiBcInRoYXQgdGhlIGFzdGVyb2lkcyB3aWxsIGdldCBzbG93ZXJcIixcbiAgICB9LFxuICAgIHtcbiAgICAgICAgbmFtZTogXCJzYW1lXCIsXG4gICAgICAgIGJ1dHRvblRleHQ6IFwiVGhlIGFzdGVyb2lkcyBzdGF5IHRoZSBzYW1lIHNwZWVkLlwiLFxuICAgICAgICB0ZXh0OiBcInRoYXQgdGhlIGFzdGVyb2lkcyB3aWxsIHN0YXkgdGhlIHNhbWUgc3BlZWRcIixcbiAgICB9LFxuXTtcblxuZnVuY3Rpb24gZHJvcERhdGFDaGVja2VyKGNvbnRhaW5lciwgbG9nQm9vaywgaHlwb3RoZXNpcykge1xuICAgIHJldHVybiBSZWFjdC5yZW5kZXJDb21wb25lbnQoRGF0YUNoZWNrZXIoe1xuICAgICAgICBpbml0aWFsVGV4dDogX2luaXRpYWxUZXh0LFxuICAgICAgICBpbml0aWFsSHlwb3RoZXNpczogaHlwb3RoZXNpcyxcbiAgICAgICAgcG9zc2libGVIeXBvdGhlc2VzOiBfaHlwb3RoZXNlcyxcbiAgICAgICAgcmVzdWx0OiBmdW5jdGlvbiAoc3RhdGUpIHtyZXR1cm4gX3Jlc3VsdChsb2dCb29rLCBzdGF0ZSk7fSxcbiAgICAgICAgbmV4dFVSTDogX25leHRVUkwsXG4gICAgfSksIGNvbnRhaW5lcik7XG59XG5cbmZ1bmN0aW9uIF9yZXN1bHQobG9nQm9vaywgc3RhdGUpIHtcbiAgICAvLyB3ZSByZXR1cm4gdGhlIGVycm9yLCBvciBudWxsIGlmIHRoZXkncmUgY29ycmVjdFxuICAgIHZhciBlbm91Z2hEYXRhID0gXy5hbGwobG9nQm9vay5kYXRhLCBmdW5jdGlvbiAoZCkge3JldHVybiBkLmxlbmd0aCA+PSA1O30pO1xuICAgIHZhciBkYXRhSXNHb29kID0gdHJ1ZTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDU7IGkrKykge1xuICAgICAgICB2YXIgdmFsMSA9IGxvZ0Jvb2suZGF0YVtcIlRpbWUgMVwiXVtpXTtcbiAgICAgICAgdmFyIHZhbDIgPSBsb2dCb29rLmRhdGFbXCJUaW1lIDJcIl1baV07XG4gICAgICAgIHZhciBtaW5WYWwgPSBNYXRoLm1pbih2YWwxLCB2YWwyKTtcbiAgICAgICAgdmFyIG1heFZhbCA9IE1hdGgubWF4KHZhbDEsIHZhbDIpO1xuICAgICAgICBpZiAobWF4VmFsIC8gbWluVmFsID4gMS4yKSB7XG4gICAgICAgICAgICBkYXRhSXNHb29kID0gZmFsc2U7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmIChlbm91Z2hEYXRhKSB7XG4gICAgICAgIHZhciBhdmdzID0ge31cbiAgICAgICAgdmFyIG1heERlbHRhcyA9IHt9XG4gICAgICAgIGZvciAodmFyIG5hbWUgaW4gbG9nQm9vay5kYXRhKSB7XG4gICAgICAgICAgICBhdmdzW25hbWVdID0gXy5yZWR1Y2UobG9nQm9vay5kYXRhW25hbWVdLFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIChhLCBiKSB7cmV0dXJuIGEgKyBiO30pIC8gbG9nQm9vay5kYXRhW25hbWVdLmxlbmd0aDtcbiAgICAgICAgICAgIG1heERlbHRhc1tuYW1lXSA9IF8ubWF4KF8ubWFwKGxvZ0Jvb2suZGF0YVtuYW1lXSxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiAoZGF0dW0pIHtyZXR1cm4gTWF0aC5hYnMoZGF0dW0gLSBhdmdzW25hbWVdKTt9KSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgY29uc29sZS5sb2cobG9nQm9vay5kYXRhLCBlbm91Z2hEYXRhLCBhdmdzLCBtYXhEZWx0YXMpO1xuICAgIGlmICghZW5vdWdoRGF0YSkge1xuICAgICAgICByZXR1cm4gXCJZb3UgaGF2ZW4ndCBmaWxsZWQgdXAgeW91ciBsYWIgbm90ZWJvb2shICBNYWtlIHN1cmUgeW91IGdldCBlbm91Z2ggZGF0YSBzbyB5b3Uga25vdyB5b3VyIHJlc3VsdHMgYXJlIGFjY3VyYXRlLlwiO1xuICAgIH0gZWxzZSBpZiAoc3RhdGUuaHlwb3RoZXNpcyAhPSBcInNhbWVcIiB8fCAhZGF0YUlzR29vZCkge1xuICAgICAgICByZXR1cm4gXCJUaG9zZSByZXN1bHRzIGRvbid0IGxvb2sgcmlnaHQgdG8gbWUuIE1ha2Ugc3VyZSB5b3UncmUgbGV0dGluZyBcIiArXG4gICAgICAgICAgICBcInRoZSBhc3Rlcm9pZHMgZ2xpZGUgdGhyb3VnaCBhbGwgdGhyZWUgZ2F0ZXMgd2l0aG91dCBpbnRlcmZlcmluZyB3aXRoIHRoZW0uXCJcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG59XG4iLCJ2YXIgR2F0ZSA9IHJlcXVpcmUoJy4vZ2F0ZScpO1xudmFyIEJhc2UgPSByZXF1aXJlKCcuL2Jhc2UnKTtcbnZhciBTdG9wd2F0Y2ggPSByZXF1aXJlKCcuL3N0b3B3YXRjaCcpO1xudmFyIFBsYXlQYXVzZSA9IHJlcXVpcmUoJy4vcGxheXBhdXNlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gQmFzZS5leHRlbmQoZnVuY3Rpb24gT3JiaXQoY29udGFpbmVyLCBvcHRpb25zKSB7XG4gICAgQmFzZS5jYWxsKHRoaXMsIGNvbnRhaW5lciwgb3B0aW9ucywgXCJpbWFnZXMvc3BhY2VfYmFja2dyb3VuZC5qcGdcIilcbn0sIHtcbiAgICBzZXR1cDogZnVuY3Rpb24gKGNvbnRhaW5lcikge1xuICAgICAgICB2YXIgd29ybGQgPSB0aGlzLndvcmxkO1xuICAgICAgICB2YXIgcmVkQmFsbCA9IFBoeXNpY3MuYm9keSgnY2lyY2xlJywge1xuICAgICAgICAgICAgeDogdGhpcy5vcHRpb25zLndpZHRoIC8gMlxuICAgICAgICAgICAgLHk6IDQwXG4gICAgICAgICAgICAsdng6IDBcbiAgICAgICAgICAgICx2eTogLTEvOFxuICAgICAgICAgICAgLHJhZGl1czogNFxuICAgICAgICAgICAgLG1hc3M6IDRcbiAgICAgICAgICAgICxyZXN0aXR1dGlvbjogMFxuICAgICAgICAgICAgLHN0eWxlczoge1xuICAgICAgICAgICAgICAgIGZpbGxTdHlsZTogJyNkNjhiNjInIC8vcmVkXG4gICAgICAgICAgICAgICAgLGFuZ2xlSW5kaWNhdG9yOiAnIzE1NTQ3OSdcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHZhciBncmVlbkJhbGwgPSBQaHlzaWNzLmJvZHkoJ2NpcmNsZScsIHtcbiAgICAgICAgICAgIHg6IHRoaXMub3B0aW9ucy53aWR0aCAvIDJcbiAgICAgICAgICAgICx5OiA2MFxuICAgICAgICAgICAgLHZ4OiAzLzhcbiAgICAgICAgICAgICx2eTogMS84XG4gICAgICAgICAgICAscmFkaXVzOiA0XG4gICAgICAgICAgICAsbWFzczogNFxuICAgICAgICAgICAgLHJlc3RpdHV0aW9uOiAwXG4gICAgICAgICAgICAsc3R5bGVzOiB7XG4gICAgICAgICAgICAgICAgZmlsbFN0eWxlOiAnIzI2ZWI2MicgLy9ncmVlblxuICAgICAgICAgICAgICAgICxhbmdsZUluZGljYXRvcjogJyMxNTU0NzknXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICB2YXIgYmlnQmFsbCA9IFBoeXNpY3MuYm9keSgnY2lyY2xlJywge1xuICAgICAgICAgICAgeDogdGhpcy5vcHRpb25zLndpZHRoIC8gMlxuICAgICAgICAgICAgLHk6IDMwMFxuICAgICAgICAgICAgLHZ4OiAtMy81MFxuICAgICAgICAgICAgLHJhZGl1czogMTBcbiAgICAgICAgICAgICxtYXNzOiAyNVxuICAgICAgICAgICAgLHJlc3RpdHV0aW9uOiAwXG4gICAgICAgICAgICAsc3R5bGVzOiB7XG4gICAgICAgICAgICAgICAgZmlsbFN0eWxlOiAnIzI2OGJkMidcbiAgICAgICAgICAgICAgICAsYW5nbGVJbmRpY2F0b3I6ICcjMTU1NDc5J1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgd29ybGQuYWRkKFtyZWRCYWxsLCBncmVlbkJhbGwsIGJpZ0JhbGxdKTtcbiAgICAgICAgd29ybGQuYWRkKFBoeXNpY3MuYmVoYXZpb3IoJ25ld3RvbmlhbicsIHsgc3RyZW5ndGg6IC41IH0pKTtcblxuICAgICAgICB2YXIgYnV0dG9uQ29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGJ1dHRvbkNvbnRhaW5lcik7XG4gICAgICAgIHZhciBwbGF5UGF1c2UgPSBuZXcgUGxheVBhdXNlKHdvcmxkLCBidXR0b25Db250YWluZXIpO1xuICAgICAgICAvLyB2YXIgZ2F0ZVBvbHlnb24gPSBbe3g6IC03MDAsIHk6IC0xMDB9LCB7eDogNzAwLCB5OiAtMTAwfSwge3g6IDcwMCwgeTogMTM5fSwge3g6IC03MDAsIHk6IDEzOX1dO1xuICAgICAgICAvLyB2YXIgZ2F0ZVBvbHlnb24yID0gW3t4OiAtNzAwLCB5OiAtMjYxfSwge3g6IDcwMCwgeTogLTI2MX0sIHt4OiA3MDAsIHk6IDIwMH0sIHt4OiAtNzAwLCB5OiAyMDB9XTtcbiAgICAgICAgLy8gdmFyIGdhdGVzID0gW11cbiAgICAgICAgLy8gZ2F0ZXMucHVzaChuZXcgR2F0ZSh3b3JsZCwgYnV0dG9uQ29udGFpbmVyLCBnYXRlUG9seWdvbiwgWzcwMCwgMTAwXSwgcmVkQmFsbCwge2RlYnVnOiB0cnVlLCBzaG93OiB0cnVlfSkpO1xuICAgICAgICAvLyBnYXRlcy5wdXNoKG5ldyBHYXRlKHdvcmxkLCBidXR0b25Db250YWluZXIsIGdhdGVQb2x5Z29uLCBbNzAwLCAxMDBdLCBncmVlbkJhbGwsIHtkZWJ1ZzogdHJ1ZSwgc2hvdzogdHJ1ZX0pKTtcbiAgICAgICAgLy8gZ2F0ZXMucHVzaChuZXcgR2F0ZSh3b3JsZCwgYnV0dG9uQ29udGFpbmVyLCBnYXRlUG9seWdvbiwgWzcwMCwgMTAwXSwgYmlnQmFsbCwge2RlYnVnOiB0cnVlLCBzaG93OiB0cnVlfSkpO1xuICAgICAgICAvLyBnYXRlcy5wdXNoKG5ldyBHYXRlKHdvcmxkLCBidXR0b25Db250YWluZXIsIGdhdGVQb2x5Z29uMiwgWzcwMCwgNTAwXSwgcmVkQmFsbCwge2RlYnVnOiB0cnVlLCBzaG93OiB0cnVlfSkpO1xuICAgICAgICAvLyBnYXRlcy5wdXNoKG5ldyBHYXRlKHdvcmxkLCBidXR0b25Db250YWluZXIsIGdhdGVQb2x5Z29uMiwgWzcwMCwgNTAwXSwgZ3JlZW5CYWxsLCB7ZGVidWc6IHRydWUsIHNob3c6IHRydWV9KSk7XG4gICAgICAgIC8vIGdhdGVzLnB1c2gobmV3IEdhdGUod29ybGQsIGJ1dHRvbkNvbnRhaW5lciwgZ2F0ZVBvbHlnb24yLCBbNzAwLCA1MDBdLCBiaWdCYWxsLCB7ZGVidWc6IHRydWUsIHNob3c6IHRydWV9KSk7XG4gICAgICAgIC8vIGdhdGVzLmZvckVhY2goZnVuY3Rpb24oZ2F0ZSkge1xuICAgICAgICAgICAgLy8gdmFyIHN0b3B3YXRjaCA9IG5ldyBTdG9wd2F0Y2god29ybGQsIGJ1dHRvbkNvbnRhaW5lciwgMSk7XG4gICAgICAgICAgICAvLyBnYXRlLm9uKCdlbnRlcicsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAvLyBzdG9wd2F0Y2gucmVzZXQoKTtcbiAgICAgICAgICAgICAgICAvLyBzdG9wd2F0Y2guc3RhcnQoKTtcbiAgICAgICAgICAgIC8vIH0pO1xuICAgICAgICAgICAgLy8gZ2F0ZS5vbignZXhpdCcsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAvLyBzdG9wd2F0Y2guc3RvcCgpXG4gICAgICAgICAgICAvLyB9KTtcbiAgICAgICAgLy8gfSk7XG4gICAgfVxufSk7XG5cbiAgICAgICAgXG4iLCJtb2R1bGUuZXhwb3J0cyA9IFBsYXlQYXVzZTtcblxuZnVuY3Rpb24gUGxheVBhdXNlKHdvcmxkLCBjb250YWluZXIpIHtcbiAgICB0aGlzLl9hdHRhY2god29ybGQsIGNvbnRhaW5lcik7XG59XG5cblBsYXlQYXVzZS5wcm90b3R5cGUuY3JlYXRlQnV0dG9uID0gZnVuY3Rpb24oYWN0aW9uLCBoYW5kbGVyKSB7XG4gICAgdmFyIGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYVwiKTtcbiAgICBhLmhyZWYgPSBcIiNcIiArIGFjdGlvbjtcbiAgICBhLmlubmVySFRNTCA9IGFjdGlvbjtcbiAgICBhLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgaGFuZGxlcigpO1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH0uYmluZCh0aGlzKSk7XG4gICAgcmV0dXJuIGE7XG59XG5cblBsYXlQYXVzZS5wcm90b3R5cGUuX2F0dGFjaCA9IGZ1bmN0aW9uKHdvcmxkLCBjb250YWluZXIpIHtcbiAgICB0aGlzLnBhdXNlU3ltYm9sID0gXCLilpDilpBcIjtcbiAgICB0aGlzLnBsYXlTeW1ib2wgPSBcIuKWulwiO1xuICAgIHRoaXMuYnV0dG9uID0gdGhpcy5jcmVhdGVCdXR0b24odGhpcy5wYXVzZVN5bWJvbCwgdGhpcy50b2dnbGUuYmluZCh0aGlzKSk7XG4gICAgdGhpcy53b3JsZCA9IHdvcmxkO1xuICAgIHZhciB3aWRnZXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIHdpZGdldC5jbGFzc05hbWUgPSBcInBsYXlwYXVzZVwiO1xuICAgIHdpZGdldC5hcHBlbmRDaGlsZCh0aGlzLmJ1dHRvbik7XG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKHdpZGdldCk7XG59XG5cblBsYXlQYXVzZS5wcm90b3R5cGUudG9nZ2xlID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMud29ybGQuaXNQYXVzZWQoKSkge1xuICAgICAgICB0aGlzLmJ1dHRvbi5pbm5lckhUTUwgPSB0aGlzLnBhdXNlU3ltYm9sO1xuICAgICAgICB0aGlzLmJ1dHRvbi5ocmVmID0gJyMnICsgdGhpcy5wYXVzZVN5bWJvbDtcbiAgICAgICAgdGhpcy53b3JsZC51bnBhdXNlKClcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmJ1dHRvbi5pbm5lckhUTUwgPSB0aGlzLnBsYXlTeW1ib2w7XG4gICAgICAgIHRoaXMuYnV0dG9uLmhyZWYgPSAnIycgKyB0aGlzLnBsYXlTeW1ib2w7XG4gICAgICAgIHRoaXMud29ybGQucGF1c2UoKVxuICAgIH1cbn1cblxuXG4iLCJ2YXIgQmFzZSA9IHJlcXVpcmUoJy4vYmFzZScpO1xudmFyIEdhdGUgPSByZXF1aXJlKCcuL2dhdGUnKTtcbnZhciBTdG9wd2F0Y2ggPSByZXF1aXJlKCcuL3N0b3B3YXRjaCcpO1xudmFyIFBsYXlQYXVzZSA9IHJlcXVpcmUoJy4vcGxheXBhdXNlJyk7XG52YXIgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2UuZXh0ZW5kKGZ1bmN0aW9uIFNsb3BlKGNvbnRhaW5lciwgb3B0aW9ucykge1xuICAgIEJhc2UuY2FsbCh0aGlzLCBjb250YWluZXIsIG9wdGlvbnMsICdpbWFnZXMvbGFiX2JhY2tncm91bmQuanBnJylcbn0sIHtcbiAgICBkcm9wSW5Cb2R5OiBmdW5jdGlvbiAocmFkaXVzLCB5KSB7XG4gICAgICAgIGZ1bmN0aW9uIHJhbmRvbShtaW4sIG1heCl7XG4gICAgICAgICAgICByZXR1cm4gKE1hdGgucmFuZG9tKCkgKiAobWF4LW1pbikgKyBtaW4pfDBcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMud29ybGQuYWRkKFBoeXNpY3MuYm9keSgnY2lyY2xlJywge1xuICAgICAgICAgICAgeDogMTAwLFxuICAgICAgICAgICAgeTogeSxcbiAgICAgICAgICAgIHZ4OiByYW5kb20oLTUsIDUpLzEwMCxcbiAgICAgICAgICAgIHJhZGl1czogcmFkaXVzLFxuICAgICAgICAgICAgcmVzdGl0dXRpb246IDAuOSxcbiAgICAgICAgICAgIHN0eWxlczoge1xuICAgICAgICAgICAgICAgIGZpbGxTdHlsZTogJyMyNjhiZDInLFxuICAgICAgICAgICAgICAgIGFuZ2xlSW5kaWNhdG9yOiAnIzE1NTQ3OSdcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkpO1xuICAgIH0sXG4gICAgc2V0dXA6IGZ1bmN0aW9uIChjb250YWluZXIpIHtcbiAgICAgICAgdmFyIHdvcmxkID0gdGhpcy53b3JsZFxuICAgICAgICB3b3JsZC5hZGQoUGh5c2ljcy5iZWhhdmlvcignY29uc3RhbnQtYWNjZWxlcmF0aW9uJykpO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNTsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgcmFkaXVzID0gMjAgKyAxMCAqIGk7XG4gICAgICAgICAgICB0aGlzLmRyb3BJbkJvZHkocmFkaXVzLCAzMDAgLSBpICogNTApO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy53b3JsZC5hZGQoUGh5c2ljcy5ib2R5KCdjb252ZXgtcG9seWdvbicsIHtcbiAgICAgICAgICAgIHg6IDQ1MCxcbiAgICAgICAgICAgIHk6IDYwMCxcbiAgICAgICAgICAgIHZlcnRpY2VzOiBbXG4gICAgICAgICAgICAgICAge3g6IDAsIHk6IDB9LFxuICAgICAgICAgICAgICAgIHt4OiAwLCB5OiAzMDB9LFxuICAgICAgICAgICAgICAgIHt4OiA4MDAsIHk6IDMwMH0sXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgdHJlYXRtZW50OiAnc3RhdGljJyxcbiAgICAgICAgICAgIGNvZjogMSxcbiAgICAgICAgICAgIHN0eWxlczoge1xuICAgICAgICAgICAgICAgIGZpbGxTdHlsZTogJyNkMzM2ODInLFxuICAgICAgICAgICAgICAgIGFuZ2xlSW5kaWNhdG9yOiAnIzc1MWI0YidcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkpXG5cbiAgICAgICAgdmFyIGJ1dHRvbkNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChidXR0b25Db250YWluZXIpO1xuICAgICAgICB2YXIgc3RvcHdhdGNoID0gbmV3IFN0b3B3YXRjaCh3b3JsZCwgYnV0dG9uQ29udGFpbmVyLCAxKTtcbiAgICAgICAgdmFyIHBsYXlQYXVzZSA9IG5ldyBQbGF5UGF1c2Uod29ybGQsIGJ1dHRvbkNvbnRhaW5lcik7XG4gICAgICAgIHZhciB0b3BHYXRlID0gbmV3IEdhdGUod29ybGQsXG4gICAgICAgICAgICB1dGlsLm1ha2VSZWN0KDAsIDAsIDYwLCAxMDApLFxuICAgICAgICAgICAgWzM1MCwgNDAwXSxcbiAgICAgICAgICAgIG51bGwsIHtkZWJ1ZzogdHJ1ZSwgc2hvdzogdHJ1ZSwgY29sb3I6ICdncmVlbid9KTtcbiAgICAgICAgdmFyIGJvdHRvbUdhdGUgPSBuZXcgR2F0ZSh3b3JsZCxcbiAgICAgICAgICAgIHV0aWwubWFrZVJlY3QoMCwgMCwgNjAsIDEwMCksXG4gICAgICAgICAgICBbODAwLCA1NzBdLFxuICAgICAgICAgICAgbnVsbCwge2RlYnVnOiB0cnVlLCBzaG93OiB0cnVlLCBjb2xvcjogJ3JlZCd9KTtcblxuICAgICAgICB0b3BHYXRlLm9uKCdlbnRlcicsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgIHN0b3B3YXRjaC5yZXNldCgpLnN0YXJ0KCk7XG4gICAgICAgIH0pXG4gICAgICAgIGJvdHRvbUdhdGUub24oJ2VudGVyJywgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgc3RvcHdhdGNoLnN0b3AoKVxuICAgICAgICB9KVxuXG4gICAgfVxufSk7XG5cbiIsIlxubW9kdWxlLmV4cG9ydHMgPSBTdG9wd2F0Y2g7XG5cbmZ1bmN0aW9uIFN0b3B3YXRjaCh3b3JsZCwgZWxlbSkge1xuICAgIHRoaXMuX2F0dGFjaCh3b3JsZCwgZWxlbSk7XG59XG5cblN0b3B3YXRjaC5wcm90b3R5cGUuX2F0dGFjaCA9IGZ1bmN0aW9uKHdvcmxkLCBlbGVtKSB7XG4gICAgdGhpcy53b3JsZCA9IHdvcmxkO1xuICAgIHRoaXMudGltZXIgPSB0aGlzLmNyZWF0ZVRpbWVyKCksXG4gICAgdGhpcy5zdGFydEJ1dHRvbiA9IHRoaXMuY3JlYXRlQnV0dG9uKFwic3RhcnRcIiwgdGhpcy5zdGFydC5iaW5kKHRoaXMpKSxcbiAgICB0aGlzLnN0b3BCdXR0b24gPSB0aGlzLmNyZWF0ZUJ1dHRvbihcInN0b3BcIiwgdGhpcy5zdG9wLmJpbmQodGhpcykpLFxuICAgIHRoaXMucmVzZXRCdXR0b24gPSB0aGlzLmNyZWF0ZUJ1dHRvbihcInJlc2V0XCIsIHRoaXMucmVzZXQuYmluZCh0aGlzKSksXG4gICAgdGhpcy5jbG9jayA9IDA7XG5cbiAgICAvLyBVcGRhdGUgb24gZXZlcnkgdGltZXIgdGlja1xuICAgIHRoaXMud29ybGQub24oJ3N0ZXAnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy51cGRhdGUoKTtcbiAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgdmFyIHdpZGdldCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgd2lkZ2V0LmNsYXNzTmFtZSA9IFwic3RvcHdhdGNoXCI7XG5cbiAgICAvLyBhcHBlbmQgZWxlbWVudHNcbiAgICB3aWRnZXQuYXBwZW5kQ2hpbGQodGhpcy50aW1lcik7XG4gICAgd2lkZ2V0LmFwcGVuZENoaWxkKHRoaXMuc3RhcnRCdXR0b24pO1xuICAgIHdpZGdldC5hcHBlbmRDaGlsZCh0aGlzLnN0b3BCdXR0b24pO1xuICAgIHdpZGdldC5hcHBlbmRDaGlsZCh0aGlzLnJlc2V0QnV0dG9uKTtcblxuICAgIGVsZW0uYXBwZW5kQ2hpbGQod2lkZ2V0KTtcbn1cblxuU3RvcHdhdGNoLnByb3RvdHlwZS5jcmVhdGVUaW1lciA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKTtcbn1cblxuU3RvcHdhdGNoLnByb3RvdHlwZS5jcmVhdGVCdXR0b24gPSBmdW5jdGlvbihhY3Rpb24sIGhhbmRsZXIpIHtcbiAgICB2YXIgYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJhXCIpO1xuICAgIGEuaHJlZiA9IFwiI1wiICsgYWN0aW9uO1xuICAgIGEuaW5uZXJIVE1MID0gYWN0aW9uO1xuICAgIGEuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICBoYW5kbGVyKCk7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgfS5iaW5kKHRoaXMpKTtcbiAgICByZXR1cm4gYTtcbn1cblxuU3RvcHdhdGNoLnByb3RvdHlwZS5zdGFydCA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucnVubmluZyA9IHRydWVcbiAgICByZXR1cm4gdGhpcztcbn1cblxuU3RvcHdhdGNoLnByb3RvdHlwZS5zdG9wID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5ydW5uaW5nID0gZmFsc2VcbiAgICByZXR1cm4gdGhpcztcbn1cblxuU3RvcHdhdGNoLnByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuY2xvY2sgPSAwO1xuICAgIHRoaXMucmVuZGVyKCk7XG4gICAgcmV0dXJuIHRoaXM7XG59XG5cblN0b3B3YXRjaC5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIG5ld1RpbWUgPSB0aGlzLndvcmxkLl90aW1lO1xuICAgIGlmICh0aGlzLnJ1bm5pbmcgJiYgdGhpcy5sYXN0VGltZSkge1xuICAgICAgICB0aGlzLmNsb2NrICs9IG5ld1RpbWUgLSB0aGlzLmxhc3RUaW1lO1xuICAgIH1cbiAgICB0aGlzLmxhc3RUaW1lID0gbmV3VGltZTtcbiAgICB0aGlzLnJlbmRlcigpO1xufVxuXG5TdG9wd2F0Y2gucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMudGltZXIuaW5uZXJIVE1MID0gcGFyc2VGbG9hdCh0aGlzLmNsb2NrIC8gMTAwMCkudG9GaXhlZCgyKTtcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gdGVycmFpbjtcblxuZnVuY3Rpb24gdGVycmFpbiggcGFyZW50ICl7XG4gICAgLy8gbW9zdGx5IGNvcGllZCBmcm9tIHRoZSBlZGdlLWNvbGxpc2lvbi1kZXRlY3Rpb24gYmVoYXZpb3IuXG4gICAgLy8gV0FSTklORzogdGhpcyBjdXJyZW50bHkgb25seSB3b3JrcyBjb3JyZWN0bHkgZm9yIGNpcmNsZXMuXG4gICAgLy8gZ2V0RmFydGhlc3RIdWxsUG9pbnQgZG9lc24ndCBhY3R1YWxseSBkbyB3aGF0IEkgd2FudCBpdCB0bywgc28gSSB3aWxsXG4gICAgLy8gbmVlZCB0byBleHRlbmQgZ2VvbWV0cnkgdG8gc3VwcG9ydCB3aGF0IEkgd2FudC5cblxuICAgIC8qXG4gICAgICogY2hlY2tHZW5lcmFsKCBib2R5LCBib3VuZHMsIGR1bW15ICkgLT4gQXJyYXlcbiAgICAgKiAtIGJvZHkgKEJvZHkpOiBUaGUgYm9keSB0byBjaGVja1xuICAgICAqIC0gYm91bmRzOiBib3VuZHMuYWFiYiBzaG91bGQgYmUgdGhlIG91dGVyIGJvdW5kcy4gIEZvciB0ZXJyYWluIG9uIHRoZVxuICAgICAqICAgZ3JvdW5kLCBwYXNzIGEgZnVuY3Rpb24gYm91bmRzLnRlcnJhaW5IZWlnaHQoeCkuXG4gICAgICogLSBkdW1teTogKEJvZHkpOiBUaGUgZHVtbXkgYm9keSB0byBwdWJsaXNoIGFzIHRoZSBzdGF0aWMgb3RoZXIgYm9keSBpdCBjb2xsaWRlcyB3aXRoXG4gICAgICogKyAoQXJyYXkpOiBUaGUgY29sbGlzaW9uIGRhdGFcbiAgICAgKlxuICAgICAqIENoZWNrIGlmIGEgYm9keSBjb2xsaWRlcyB3aXRoIHRoZSBib3VuZGFyeVxuICAgICAqL1xuICAgIHZhciBjaGVja0dlbmVyYWwgPSBmdW5jdGlvbiBjaGVja0dlbmVyYWwoIGJvZHksIGJvdW5kcywgdGVycmFpbkhlaWdodCwgZHVtbXkgKXtcblxuICAgICAgICB2YXIgb3ZlcmxhcFxuICAgICAgICAgICAgLGFhYmIgPSBib2R5LmFhYmIoKVxuICAgICAgICAgICAgLHNjcmF0Y2ggPSBQaHlzaWNzLnNjcmF0Y2hwYWQoKVxuICAgICAgICAgICAgLHRyYW5zID0gc2NyYXRjaC50cmFuc2Zvcm0oKVxuICAgICAgICAgICAgLGRpciA9IHNjcmF0Y2gudmVjdG9yKClcbiAgICAgICAgICAgICxyZXN1bHQgPSBzY3JhdGNoLnZlY3RvcigpXG4gICAgICAgICAgICAsY29sbGlzaW9uID0gZmFsc2VcbiAgICAgICAgICAgICxjb2xsaXNpb25zID0gW11cbiAgICAgICAgICAgICx4XG4gICAgICAgICAgICAseVxuICAgICAgICAgICAgLGNvbGxpc2lvblhcbiAgICAgICAgICAgIDtcblxuICAgICAgICAvLyByaWdodFxuICAgICAgICBvdmVybGFwID0gKGFhYmIueCArIGFhYmIuaHcpIC0gYm91bmRzLm1heC54O1xuXG4gICAgICAgIGlmICggb3ZlcmxhcCA+PSAwICl7XG5cbiAgICAgICAgICAgIGRpci5zZXQoIDEsIDAgKS5yb3RhdGVJbnYoIHRyYW5zLnNldFJvdGF0aW9uKCBib2R5LnN0YXRlLmFuZ3VsYXIucG9zICkgKTtcblxuICAgICAgICAgICAgY29sbGlzaW9uID0ge1xuICAgICAgICAgICAgICAgIGJvZHlBOiBib2R5LFxuICAgICAgICAgICAgICAgIGJvZHlCOiBkdW1teSxcbiAgICAgICAgICAgICAgICBvdmVybGFwOiBvdmVybGFwLFxuICAgICAgICAgICAgICAgIG5vcm06IHtcbiAgICAgICAgICAgICAgICAgICAgeDogMSxcbiAgICAgICAgICAgICAgICAgICAgeTogMFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgbXR2OiB7XG4gICAgICAgICAgICAgICAgICAgIHg6IG92ZXJsYXAsXG4gICAgICAgICAgICAgICAgICAgIHk6IDBcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHBvczogYm9keS5nZW9tZXRyeS5nZXRGYXJ0aGVzdEh1bGxQb2ludCggZGlyLCByZXN1bHQgKS5yb3RhdGUoIHRyYW5zICkudmFsdWVzKClcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGNvbGxpc2lvbnMucHVzaChjb2xsaXNpb24pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gYm90dG9tXG4gICAgICAgIG92ZXJsYXAgPSAtMTtcbiAgICAgICAgaWYgKGFhYmIueSA+IGJvdW5kcy5tYXgueSAtIHRlcnJhaW5IZWlnaHQoYWFiYi54KSkge1xuICAgICAgICAgICAgLy8gaWYgdGhlIGNlbnRlciBzb21laG93IGdldHMgYmVsb3cgdGhlIHRlcnJhaW4sIGFsd2F5cyBwdXNoIHN0cmFpZ2h0IHVwLlxuICAgICAgICAgICAgb3ZlcmxhcCA9IE1hdGgubWF4KDEsIChhYWJiLnkgKyBhYWJiLmhoKSAtIGJvdW5kcy5tYXgueSArIHRlcnJhaW5IZWlnaHQoYWFiYi54KSk7XG4gICAgICAgICAgICBkaXIuc2V0KCAwLCAxICkucm90YXRlSW52KCB0cmFucy5zZXRSb3RhdGlvbiggYm9keS5zdGF0ZS5hbmd1bGFyLnBvcyApICk7XG5cbiAgICAgICAgICAgIGNvbGxpc2lvbiA9IHtcbiAgICAgICAgICAgICAgICBib2R5QTogYm9keSxcbiAgICAgICAgICAgICAgICBib2R5QjogZHVtbXksXG4gICAgICAgICAgICAgICAgb3ZlcmxhcDogb3ZlcmxhcCxcbiAgICAgICAgICAgICAgICBub3JtOiB7XG4gICAgICAgICAgICAgICAgICAgIHg6IDAsXG4gICAgICAgICAgICAgICAgICAgIHk6IDFcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG10djoge1xuICAgICAgICAgICAgICAgICAgICB4OiAwLFxuICAgICAgICAgICAgICAgICAgICB5OiBvdmVybGFwXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBwb3M6IGJvZHkuZ2VvbWV0cnkuZ2V0RmFydGhlc3RIdWxsUG9pbnQoIGRpciwgcmVzdWx0ICkucm90YXRlKCB0cmFucyApLnZhbHVlcygpXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBjb2xsaXNpb25zLnB1c2goY29sbGlzaW9uKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIG90aGVyd2lzZSwgZmluZCB0aGUgcG9pbnQgb2YgYmlnZ2VzdCBvdmVybGFwLCBhbmQgcHVzaCBhbG9uZyB0aGVcbiAgICAgICAgICAgIC8vIG5vcm1hbCB0aGVyZS5cbiAgICAgICAgICAgIGZvciAoeCA9IGFhYmIueCAtIGFhYmIuaHc7IHggPD0gYWFiYi54ICsgYWFiYi5odzsgeCsrKSB7XG4gICAgICAgICAgICAgICAgeSA9IGJvdW5kcy5tYXgueSAtIHRlcnJhaW5IZWlnaHQoeCk7XG4gICAgICAgICAgICAgICAgZGlyLnNldCggeCAtIGJvZHkuc3RhdGUucG9zLngsIHkgLSBib2R5LnN0YXRlLnBvcy55KS5uZWdhdGUoKTtcbiAgICAgICAgICAgICAgICBkaXIucm90YXRlSW52KCB0cmFucy5zZXRSb3RhdGlvbiggYm9keS5zdGF0ZS5hbmd1bGFyLnBvcyApICk7XG4gICAgICAgICAgICAgICAgYm9keS5nZW9tZXRyeS5nZXRGYXJ0aGVzdEh1bGxQb2ludChkaXIsIHJlc3VsdCkucm90YXRlKHRyYW5zKTtcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0Lm5vcm0oKSA+IGRpci5ub3JtKCkgJiYgb3ZlcmxhcCA8IHJlc3VsdC5ub3JtKCkgLSBkaXIubm9ybSgpKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHRoZXJlIGlzIGFuIGFjdHVhbCBjb2xsaXNpb24sIGFuZCB0aGlzIGlzIHRoZSBkZWVwZXN0XG4gICAgICAgICAgICAgICAgICAgIC8vIG92ZXJsYXAgd2UndmUgc2VlbiBzbyBmYXJcbiAgICAgICAgICAgICAgICAgICAgY29sbGlzaW9uWCA9IHg7XG4gICAgICAgICAgICAgICAgICAgIG92ZXJsYXAgPSByZXN1bHQubm9ybSgpIC0gZGlyLm5vcm0oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICggb3ZlcmxhcCA+PSAwICkge1xuICAgICAgICAgICAgICAgIC8vIHdob28gY29weXBhc3RhXG4gICAgICAgICAgICAgICAgeCA9IGNvbGxpc2lvblg7XG4gICAgICAgICAgICAgICAgeSA9IGJvdW5kcy5tYXgueSAtIHRlcnJhaW5IZWlnaHQoeCk7XG4gICAgICAgICAgICAgICAgZGlyLnNldCggeCAtIGJvZHkuc3RhdGUucG9zLngsIHkgLSBib2R5LnN0YXRlLnBvcy55KTtcbiAgICAgICAgICAgICAgICBkaXIucm90YXRlSW52KCB0cmFucy5zZXRSb3RhdGlvbiggYm9keS5zdGF0ZS5hbmd1bGFyLnBvcyApICk7XG4gICAgICAgICAgICAgICAgYm9keS5nZW9tZXRyeS5nZXRGYXJ0aGVzdEh1bGxQb2ludChkaXIsIHJlc3VsdCkucm90YXRlKHRyYW5zKTtcblxuICAgICAgICAgICAgICAgIGNvbGxpc2lvbiA9IHtcbiAgICAgICAgICAgICAgICAgICAgYm9keUE6IGJvZHksXG4gICAgICAgICAgICAgICAgICAgIGJvZHlCOiBkdW1teSxcbiAgICAgICAgICAgICAgICAgICAgb3ZlcmxhcDogb3ZlcmxhcCxcbiAgICAgICAgICAgICAgICAgICAgcG9zOiByZXN1bHQudmFsdWVzKCksXG4gICAgICAgICAgICAgICAgICAgIG5vcm06IGRpci5yb3RhdGUodHJhbnMpLm5vcm1hbGl6ZSgpLnZhbHVlcygpLFxuICAgICAgICAgICAgICAgICAgICBtdHY6IGRpci5tdWx0KG92ZXJsYXApLnZhbHVlcygpLFxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICBjb2xsaXNpb25zLnB1c2goY29sbGlzaW9uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGxlZnRcbiAgICAgICAgb3ZlcmxhcCA9IGJvdW5kcy5taW4ueCAtIChhYWJiLnggLSBhYWJiLmh3KTtcblxuICAgICAgICBpZiAoIG92ZXJsYXAgPj0gMCApe1xuXG4gICAgICAgICAgICBkaXIuc2V0KCAtMSwgMCApLnJvdGF0ZUludiggdHJhbnMuc2V0Um90YXRpb24oIGJvZHkuc3RhdGUuYW5ndWxhci5wb3MgKSApO1xuXG4gICAgICAgICAgICBjb2xsaXNpb24gPSB7XG4gICAgICAgICAgICAgICAgYm9keUE6IGJvZHksXG4gICAgICAgICAgICAgICAgYm9keUI6IGR1bW15LFxuICAgICAgICAgICAgICAgIG92ZXJsYXA6IG92ZXJsYXAsXG4gICAgICAgICAgICAgICAgbm9ybToge1xuICAgICAgICAgICAgICAgICAgICB4OiAtMSxcbiAgICAgICAgICAgICAgICAgICAgeTogMFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgbXR2OiB7XG4gICAgICAgICAgICAgICAgICAgIHg6IC1vdmVybGFwLFxuICAgICAgICAgICAgICAgICAgICB5OiAwXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBwb3M6IGJvZHkuZ2VvbWV0cnkuZ2V0RmFydGhlc3RIdWxsUG9pbnQoIGRpciwgcmVzdWx0ICkucm90YXRlKCB0cmFucyApLnZhbHVlcygpXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBjb2xsaXNpb25zLnB1c2goY29sbGlzaW9uKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHRvcFxuICAgICAgICBvdmVybGFwID0gYm91bmRzLm1pbi55IC0gKGFhYmIueSAtIGFhYmIuaGgpO1xuXG4gICAgICAgIGlmICggb3ZlcmxhcCA+PSAwICl7XG5cbiAgICAgICAgICAgIGRpci5zZXQoIDAsIC0xICkucm90YXRlSW52KCB0cmFucy5zZXRSb3RhdGlvbiggYm9keS5zdGF0ZS5hbmd1bGFyLnBvcyApICk7XG5cbiAgICAgICAgICAgIGNvbGxpc2lvbiA9IHtcbiAgICAgICAgICAgICAgICBib2R5QTogYm9keSxcbiAgICAgICAgICAgICAgICBib2R5QjogZHVtbXksXG4gICAgICAgICAgICAgICAgb3ZlcmxhcDogb3ZlcmxhcCxcbiAgICAgICAgICAgICAgICBub3JtOiB7XG4gICAgICAgICAgICAgICAgICAgIHg6IDAsXG4gICAgICAgICAgICAgICAgICAgIHk6IC0xXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBtdHY6IHtcbiAgICAgICAgICAgICAgICAgICAgeDogMCxcbiAgICAgICAgICAgICAgICAgICAgeTogLW92ZXJsYXBcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHBvczogYm9keS5nZW9tZXRyeS5nZXRGYXJ0aGVzdEh1bGxQb2ludCggZGlyLCByZXN1bHQgKS5yb3RhdGUoIHRyYW5zICkudmFsdWVzKClcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGNvbGxpc2lvbnMucHVzaChjb2xsaXNpb24pO1xuICAgICAgICB9XG5cbiAgICAgICAgc2NyYXRjaC5kb25lKCk7XG4gICAgICAgIHJldHVybiBjb2xsaXNpb25zO1xuICAgIH07XG5cbiAgICAvKlxuICAgICAqIGNoZWNrRWRnZUNvbGxpZGUoIGJvZHksIGJvdW5kcywgZHVtbXkgKSAtPiBBcnJheVxuICAgICAqIC0gYm9keSAoQm9keSk6IFRoZSBib2R5IHRvIGNoZWNrXG4gICAgICogLSBib3VuZHMgKFBoeXNpY3MuYWFiYik6IFRoZSBib3VuZGFyeVxuICAgICAqIC0gZHVtbXk6IChCb2R5KTogVGhlIGR1bW15IGJvZHkgdG8gcHVibGlzaCBhcyB0aGUgc3RhdGljIG90aGVyIGJvZHkgaXQgY29sbGlkZXMgd2l0aFxuICAgICAqICsgKEFycmF5KTogVGhlIGNvbGxpc2lvbiBkYXRhXG4gICAgICpcbiAgICAgKiBDaGVjayBpZiBhIGJvZHkgY29sbGlkZXMgd2l0aCB0aGUgYm91bmRhcnlcbiAgICAgKi9cbiAgICB2YXIgY2hlY2tFZGdlQ29sbGlkZSA9IGZ1bmN0aW9uIGNoZWNrRWRnZUNvbGxpZGUoIGJvZHksIGJvdW5kcywgdGVycmFpbkhlaWdodCwgZHVtbXkgKXtcblxuICAgICAgICByZXR1cm4gY2hlY2tHZW5lcmFsKCBib2R5LCBib3VuZHMsIHRlcnJhaW5IZWlnaHQsIGR1bW15ICk7XG4gICAgfTtcblxuICAgIHZhciBkZWZhdWx0cyA9IHtcblxuICAgICAgICBlZGdlczoge1xuICAgICAgICAgICAgYWFiYjogbnVsbCxcbiAgICAgICAgICAgIHRlcnJhaW5IZWlnaHQ6IGZ1bmN0aW9uICh4KSB7cmV0dXJuIDA7fSxcbiAgICAgICAgfSxcbiAgICAgICAgcmVzdGl0dXRpb246IDAuOTksXG4gICAgICAgIGNvZjogMS4wLFxuICAgICAgICBjaGFubmVsOiAnY29sbGlzaW9uczpkZXRlY3RlZCdcbiAgICB9O1xuXG4gICAgcmV0dXJuIHtcblxuICAgICAgICAvLyBleHRlbmRlZFxuICAgICAgICBpbml0OiBmdW5jdGlvbiggb3B0aW9ucyApe1xuXG4gICAgICAgICAgICBwYXJlbnQuaW5pdC5jYWxsKCB0aGlzICk7XG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMuZGVmYXVsdHMoIGRlZmF1bHRzICk7XG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMoIG9wdGlvbnMgKTtcblxuICAgICAgICAgICAgdGhpcy5zZXRBQUJCKCB0aGlzLm9wdGlvbnMuYWFiYiApO1xuICAgICAgICAgICAgdGhpcy5yZXN0aXR1dGlvbiA9IHRoaXMub3B0aW9ucy5yZXN0aXR1dGlvbjtcblxuICAgICAgICAgICAgdGhpcy5ib2R5ID0gUGh5c2ljcy5ib2R5KCdwb2ludCcsIHtcbiAgICAgICAgICAgICAgICB0cmVhdG1lbnQ6ICdzdGF0aWMnLFxuICAgICAgICAgICAgICAgIHJlc3RpdHV0aW9uOiB0aGlzLm9wdGlvbnMucmVzdGl0dXRpb24sXG4gICAgICAgICAgICAgICAgY29mOiB0aGlzLm9wdGlvbnMuY29mXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogRWRnZUNvbGxpc2lvbkRldGVjdGlvbkJlaGF2aW9yI3NldEFBQkIoIGFhYmIgKSAtPiB0aGlzXG4gICAgICAgICAqIC0gYWFiYiAoUGh5c2ljcy5hYWJiKTogVGhlIGFhYmIgdG8gdXNlIGFzIHRoZSBib3VuZGFyeVxuICAgICAgICAgKlxuICAgICAgICAgKiBTZXQgdGhlIGJvdW5kYXJpZXMgb2YgdGhlIGVkZ2UuXG4gICAgICAgICAqKi9cbiAgICAgICAgc2V0QUFCQjogZnVuY3Rpb24oIGFhYmIgKXtcblxuICAgICAgICAgICAgaWYgKCFhYWJiKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgJ0Vycm9yOiBhYWJiIG5vdCBzZXQnO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLl9lZGdlcyA9IHtcbiAgICAgICAgICAgICAgICBtaW46IHtcbiAgICAgICAgICAgICAgICAgICAgeDogKGFhYmIueCAtIGFhYmIuaHcpLFxuICAgICAgICAgICAgICAgICAgICB5OiAoYWFiYi55IC0gYWFiYi5oaClcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG1heDoge1xuICAgICAgICAgICAgICAgICAgICB4OiAoYWFiYi54ICsgYWFiYi5odyksXG4gICAgICAgICAgICAgICAgICAgIHk6IChhYWJiLnkgKyBhYWJiLmhoKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8vIGV4dGVuZGVkXG4gICAgICAgIGNvbm5lY3Q6IGZ1bmN0aW9uKCB3b3JsZCApe1xuXG4gICAgICAgICAgICB3b3JsZC5vbiggJ2ludGVncmF0ZTp2ZWxvY2l0aWVzJywgdGhpcy5jaGVja0FsbCwgdGhpcyApO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8vIGV4dGVuZGVkXG4gICAgICAgIGRpc2Nvbm5lY3Q6IGZ1bmN0aW9uKCB3b3JsZCApe1xuXG4gICAgICAgICAgICB3b3JsZC5vZmYoICdpbnRlZ3JhdGU6dmVsb2NpdGllcycsIHRoaXMuY2hlY2tBbGwgKTtcbiAgICAgICAgfSxcblxuICAgICAgICAvKiogaW50ZXJuYWxcbiAgICAgICAgICogRWRnZUNvbGxpc2lvbkRldGVjdGlvbkJlaGF2aW9yI2NoZWNrQWxsKCBkYXRhIClcbiAgICAgICAgICogLSBkYXRhIChPYmplY3QpOiBFdmVudCBkYXRhXG4gICAgICAgICAqXG4gICAgICAgICAqIEV2ZW50IGNhbGxiYWNrIHRvIGNoZWNrIGFsbCBib2RpZXMgZm9yIGNvbGxpc2lvbnMgd2l0aCB0aGUgZWRnZVxuICAgICAgICAgKiovXG4gICAgICAgIGNoZWNrQWxsOiBmdW5jdGlvbiggZGF0YSApe1xuXG4gICAgICAgICAgICB2YXIgYm9kaWVzID0gdGhpcy5nZXRUYXJnZXRzKClcbiAgICAgICAgICAgICAgICAsZHQgPSBkYXRhLmR0XG4gICAgICAgICAgICAgICAgLGJvZHlcbiAgICAgICAgICAgICAgICAsY29sbGlzaW9ucyA9IFtdXG4gICAgICAgICAgICAgICAgLHJldFxuICAgICAgICAgICAgICAgICxib3VuZHMgPSB0aGlzLl9lZGdlc1xuICAgICAgICAgICAgICAgICx0ZXJyYWluSGVpZ2h0ID0gXy5tZW1vaXplKHRoaXMub3B0aW9ucy50ZXJyYWluSGVpZ2h0KVxuICAgICAgICAgICAgICAgICxkdW1teSA9IHRoaXMuYm9keVxuICAgICAgICAgICAgICAgIDtcblxuICAgICAgICAgICAgZm9yICggdmFyIGkgPSAwLCBsID0gYm9kaWVzLmxlbmd0aDsgaSA8IGw7IGkrKyApe1xuXG4gICAgICAgICAgICAgICAgYm9keSA9IGJvZGllc1sgaSBdO1xuXG4gICAgICAgICAgICAgICAgLy8gb25seSBkZXRlY3QgZHluYW1pYyBib2RpZXNcbiAgICAgICAgICAgICAgICBpZiAoIGJvZHkudHJlYXRtZW50ID09PSAnZHluYW1pYycgKXtcblxuICAgICAgICAgICAgICAgICAgICByZXQgPSBjaGVja0VkZ2VDb2xsaWRlKCBib2R5LCBib3VuZHMsIHRlcnJhaW5IZWlnaHQsIGR1bW15ICk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCByZXQgKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbGxpc2lvbnMucHVzaC5hcHBseSggY29sbGlzaW9ucywgcmV0ICk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICggY29sbGlzaW9ucy5sZW5ndGggKXtcblxuICAgICAgICAgICAgICAgIHRoaXMuX3dvcmxkLmVtaXQoIHRoaXMub3B0aW9ucy5jaGFubmVsLCB7XG4gICAgICAgICAgICAgICAgICAgIGNvbGxpc2lvbnM6IGNvbGxpc2lvbnNcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbn07XG4iLCJcbnZhciBCYXNlID0gcmVxdWlyZSgnLi9iYXNlJyk7XG52YXIgR3JhcGggPSByZXF1aXJlKCcuL2dyYXBoJyk7XG5cbmZ1bmN0aW9uIHJhbmRvbSggbWluLCBtYXggKXtcbiAgICByZXR1cm4gKE1hdGgucmFuZG9tKCkgKiAobWF4LW1pbikgKyBtaW4pfDBcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBCYXNlLmV4dGVuZChmdW5jdGlvbiBEZW1vKGNvbnRhaW5lciwgb3B0aW9ucykge1xuICAgIEJhc2UuY2FsbCh0aGlzLCBjb250YWluZXIsIG9wdGlvbnMsICdpbWFnZXMvbGFiX2JhY2tncm91bmQuanBnJylcbn0sIHtcbiAgICBtYWtlQ2lyY2xlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBQaHlzaWNzLmJvZHkoJ2NpcmNsZScsIHtcbiAgICAgICAgICAgIHg6IHRoaXMub3B0aW9ucy53aWR0aCAvIDIsXG4gICAgICAgICAgICB5OiA1MCxcbiAgICAgICAgICAgIHZ4OiByYW5kb20oLTUsIDUpLzEwMCxcbiAgICAgICAgICAgIHJhZGl1czogNDAsXG4gICAgICAgICAgICByZXN0aXR1dGlvbjogMC45LFxuICAgICAgICAgICAgc3R5bGVzOiB7XG4gICAgICAgICAgICAgICAgZmlsbFN0eWxlOiAnIzI2OGJkMicsXG4gICAgICAgICAgICAgICAgYW5nbGVJbmRpY2F0b3I6ICcjMTU1NDc5J1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9LFxuICAgIGRyb3BJbkJvZHk6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICB2YXIgYm9keTtcblxuXG4gICAgICAgIHZhciBwZW50ID0gW1xuICAgICAgICAgICAgeyB4OiA1MCwgeTogMCB9XG4gICAgICAgICAgICAseyB4OiAyNSwgeTogLTI1IH1cbiAgICAgICAgICAgICx7IHg6IC0yNSwgeTogLTI1IH1cbiAgICAgICAgICAgICx7IHg6IC01MCwgeTogMCB9XG4gICAgICAgICAgICAseyB4OiAwLCB5OiA1MCB9XG4gICAgICAgIF07XG5cbiAgICAgICAgICAgIHN3aXRjaCAoIHJhbmRvbSggMCwgMyApICl7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gYWRkIGEgY2lyY2xlXG4gICAgICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgICAgICAgICBib2R5ID0gUGh5c2ljcy5ib2R5KCdjaXJjbGUnLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB4OiB0aGlzLm9wdGlvbnMud2lkdGggLyAyXG4gICAgICAgICAgICAgICAgICAgICAgICAseTogNTBcbiAgICAgICAgICAgICAgICAgICAgICAgICx2eDogcmFuZG9tKC01LCA1KS8xMDBcbiAgICAgICAgICAgICAgICAgICAgICAgICxyYWRpdXM6IDQwXG4gICAgICAgICAgICAgICAgICAgICAgICAscmVzdGl0dXRpb246IDAuOVxuICAgICAgICAgICAgICAgICAgICAgICAgLHN0eWxlczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGxTdHlsZTogJyMyNjhiZDInXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLGFuZ2xlSW5kaWNhdG9yOiAnIzE1NTQ3OSdcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGFkZCBhIHNxdWFyZVxuICAgICAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgICAgICAgICAgYm9keSA9IFBoeXNpY3MuYm9keSgncmVjdGFuZ2xlJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6IDUwXG4gICAgICAgICAgICAgICAgICAgICAgICAsaGVpZ2h0OiA1MFxuICAgICAgICAgICAgICAgICAgICAgICAgLHg6IHRoaXMub3B0aW9ucy53aWR0aCAvIDJcbiAgICAgICAgICAgICAgICAgICAgICAgICx5OiA1MFxuICAgICAgICAgICAgICAgICAgICAgICAgLHZ4OiByYW5kb20oLTUsIDUpLzEwMFxuICAgICAgICAgICAgICAgICAgICAgICAgLHJlc3RpdHV0aW9uOiAwLjlcbiAgICAgICAgICAgICAgICAgICAgICAgICxzdHlsZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxsU3R5bGU6ICcjZDMzNjgyJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICxhbmdsZUluZGljYXRvcjogJyM3NTFiNGInXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgICAgICAvLyBhZGQgYSBwb2x5Z29uXG4gICAgICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgICAgICBib2R5ID0gUGh5c2ljcy5ib2R5KCdjb252ZXgtcG9seWdvbicsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZlcnRpY2VzOiBwZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAseDogdGhpcy5vcHRpb25zLndpZHRoIC8gMlxuICAgICAgICAgICAgICAgICAgICAgICAgLHk6IDUwXG4gICAgICAgICAgICAgICAgICAgICAgICAsdng6IHJhbmRvbSgtNSwgNSkvMTAwXG4gICAgICAgICAgICAgICAgICAgICAgICAsYW5nbGU6IHJhbmRvbSggMCwgMiAqIE1hdGguUEkgKVxuICAgICAgICAgICAgICAgICAgICAgICAgLHJlc3RpdHV0aW9uOiAwLjlcbiAgICAgICAgICAgICAgICAgICAgICAgICxzdHlsZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxsU3R5bGU6ICcjODU5OTAwJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICxhbmdsZUluZGljYXRvcjogJyM0MTQ3MDAnXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy53b3JsZC5hZGQoIGJvZHkgKTtcbiAgICB9LFxuICAgIHNldHVwOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciB3b3JsZCA9IHRoaXMud29ybGRcbiAgICAgICAgLy8gd29ybGQuYWRkKFBoeXNpY3MuYmVoYXZpb3IoJ2NvbnN0YW50LWFjY2VsZXJhdGlvbicpKTtcblxuICAgICAgICAvKlxuICAgICAgICB2YXIgaW50ID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIGlmICggd29ybGQuX2JvZGllcy5sZW5ndGggPiA0ICl7XG4gICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbCggaW50ICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmRyb3BJbkJvZHkoKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpLCA3MDApO1xuICAgICAgICovXG5cbiAgICAgICAgdmFyIGNpcmNsZSA9IHRoaXMubWFrZUNpcmNsZSgpXG4gICAgICAgIHRoaXMud29ybGQuYWRkKGNpcmNsZSlcblxuICAgICAgICB2YXIgZ3JhcGggPSBuZXcgR3JhcGgodGhpcy5jb250YWluZXIsIHtcbiAgICAgICAgICAgICdDaXJjbGUnOiB7Ym9keTogY2lyY2xlLCBhdHRyOiAncG9zLnknLCBuYW1lOidDaXJjbGUnLCBtaW5zY2FsZTogNX0sXG4gICAgICAgICAgICAnVmVsWSc6IHtib2R5OiBjaXJjbGUsIGF0dHI6ICd2ZWwueScsIG5hbWU6J1ZlbFknLCBtaW5zY2FsZTogLjF9LFxuICAgICAgICAgICAgJ0FuZ1AnOiB7Ym9keTogY2lyY2xlLCBhdHRyOiAnYW5ndWxhci5wb3MnLCBuYW1lOidBY2NYJywgbWluc2NhbGU6IC4wMDF9LFxuICAgICAgICAgICAgJ0FuZ1YnOiB7Ym9keTogY2lyY2xlLCBhdHRyOiAnYW5ndWxhci52ZWwnLCBuYW1lOidBY2NYJywgbWluc2NhbGU6IC4wMDF9LFxuICAgICAgICB9LCB0aGlzLm9wdGlvbnMuaGVpZ2h0KVxuICAgICAgICB0aGlzLmdyYXBoID0gZ3JhcGhcblxuICAgICAgICB0aGlzLndvcmxkLm9uKCdzdGVwJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZ3JhcGgudXBkYXRlKHdvcmxkLnRpbWVzdGVwKCkpXG4gICAgICAgIH0pO1xuXG4gICAgfVxufSk7XG5cbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICAgIG1ha2VSZWN0OiBtYWtlUmVjdCxcbiAgICBtYWtlUm9jazogbWFrZVJvY2ssXG4gICAgc3VtOiBzdW0sXG4gICAgYXZnOiBhdmcsXG4gICAgc3RkZXY6IHN0ZGV2LFxuICAgIGNvcnJlbGF0aW9uOiBjb3JyZWxhdGlvbixcbn1cblxuZnVuY3Rpb24gc3VtKG51bWJlcnMpIHtcbiAgICBpZiAoIW51bWJlcnMubGVuZ3RoKSByZXR1cm4gMDtcbiAgICByZXR1cm4gbnVtYmVycy5yZWR1Y2UoZnVuY3Rpb24gKGEsIGIpIHtyZXR1cm4gYSArIGJ9KVxufVxuXG5mdW5jdGlvbiBhdmcobnVtYmVycykge1xuICAgIGlmICghbnVtYmVycy5sZW5ndGgpIHJldHVybiAwO1xuICAgIHJldHVybiBzdW0obnVtYmVycykgLyBudW1iZXJzLmxlbmd0aFxufVxuXG5mdW5jdGlvbiBzdGRldihudW1iZXJzKSB7XG4gICAgaWYgKCFudW1iZXJzLmxlbmd0aCkgcmV0dXJuIDA7XG4gICAgdmFyIGEgPSBhdmcobnVtYmVycyk7XG4gICAgcmV0dXJuIE1hdGguc3FydChhdmcoXy5tYXAobnVtYmVycywgZnVuY3Rpb24gKG51bSkge3JldHVybiBNYXRoLnBvdyhudW0gLSBhLCAyKTt9KSkpXG59XG5cbmZ1bmN0aW9uIGNvcnJlbGF0aW9uKGRhdGExLCBkYXRhMikge1xuICAgIGlmICghZGF0YTEubGVuZ3RoIHx8IGRhdGExLmxlbmd0aCAhPSBkYXRhMi5sZW5ndGgpIHJldHVybiAwO1xuICAgIHZhciBhdmcxID0gYXZnKGRhdGExKTtcbiAgICB2YXIgYXZnMiA9IGF2ZyhkYXRhMik7XG4gICAgdmFyIGNvdmFyaWFuY2UgPSBhdmcoXy5tYXAoXG4gICAgICAgIF8uemlwKGRhdGExLCBkYXRhMiksIFxuICAgICAgICBmdW5jdGlvbiAoZGF0YVBhaXIpIHtyZXR1cm4gKGRhdGFQYWlyWzBdIC0gYXZnMSkgKiAoZGF0YVBhaXJbMV0gLSBhdmcyKTt9KSk7XG4gICAgcmV0dXJuIGNvdmFyaWFuY2UgLyAoc3RkZXYoZGF0YTEpICogc3RkZXYoZGF0YTIpKTtcbn1cblxuZnVuY3Rpb24gbWFrZVJlY3QoeCwgeSwgd2lkdGgsIGhlaWdodCkge1xuICAgIHJldHVybiBbXG4gICAgICAgIHt4OiB4IC0gd2lkdGgvMiwgeTogeSAtIGhlaWdodC8yfSxcbiAgICAgICAge3g6IHggKyB3aWR0aC8yLCB5OiB5IC0gaGVpZ2h0LzJ9LFxuICAgICAgICB7eDogeCArIHdpZHRoLzIsIHk6IHkgKyBoZWlnaHQvMn0sXG4gICAgICAgIHt4OiB4IC0gd2lkdGgvMiwgeTogeSArIGhlaWdodC8yfSxcbiAgICBdXG59XG5cbi8vIE5vdCBhIGNvbnZleCBodWxsIDooXG5mdW5jdGlvbiBtYWtlUm9jayhyYWRpdXMsIGRldmlhdGlvbiwgcmVzb2x1dGlvbikge1xuICAgIHZhciByZXNvbHV0aW9uID0gcmVzb2x1dGlvbiB8fCAzMlxuICAgIHZhciBkZXZpYXRpb24gPSBkZXZpYXRpb24gfHwgMTBcbiAgICB2YXIgcG9pbnRzID0gW11cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlc29sdXRpb247IGkrKykge1xuICAgICAgICB2YXIgYW5nID0gaSAvIHJlc29sdXRpb24gKiAyICogTWF0aC5QSTtcbiAgICAgICAgdmFyIHBvaW50ID0geyB4OiByYWRpdXMgKiBNYXRoLmNvcyhhbmcpLCB5OiByYWRpdXMgKiBNYXRoLnNpbihhbmcpIH1cbiAgICAgICAgcG9pbnQueCArPSAoTWF0aC5yYW5kb20oKSkgKiAyICogZGV2aWF0aW9uXG4gICAgICAgIHBvaW50LnkgKz0gKE1hdGgucmFuZG9tKCkpICogMiAqIGRldmlhdGlvblxuICAgICAgICBwb2ludHMucHVzaChwb2ludClcbiAgICB9XG4gICAgcmV0dXJuIHBvaW50c1xufVxuIiwiXG52YXIgYmFraGFuID0gcmVxdWlyZSgnLi9saWInKVxuICAsIG5vZGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWFpbi1jYW52YXMnKVxuXG52YXIgb3B0aW9ucyA9IHtcbiAgICB3aWR0aDogOTAwLFxuICAgIGhlaWdodDogNzAwLFxufVxuXG52YXIgbmFtZSA9IHdpbmRvdy5sb2NhdGlvbi5zZWFyY2gucmVwbGFjZSgvJihcXHcrKT0oW14mXSspL2csIGZ1bmN0aW9uIChyZXMsIGtleSwgdmFsKSB7XG4gICAgb3B0aW9uc1trZXldID0gdmFsLnJlcGxhY2UoL1xcLy8sICcnKVxuICAgIHJldHVybiAnJ1xufSkucmVwbGFjZSgvW15cXHddL2csICcnKVxuaWYgKCFuYW1lKSB7XG4gICAgbmFtZSA9ICdEcm9wJztcbiAgICBvcHRpb25zID0ge3dhbGs6ICd0cnVlJ307XG59XG5jb25zb2xlLmxvZyhuYW1lLCBvcHRpb25zKVxuXG53aW5kb3cuQktBID0gbmV3IGJha2hhbltuYW1lXShub2RlLCBvcHRpb25zKTtcbndpbmRvdy5CS0EucnVuKCk7XG4iXX0=
