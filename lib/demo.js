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

