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

