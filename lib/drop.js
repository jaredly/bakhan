var Base = require('./base');
var Gate = require('./gate');
var Stopwatch = require('./stopwatch');
var PlayPause = require('./playpause');
var util = require('./util');

module.exports = Base.extend(function Drop(container, options) {
    Base.call(this, container, options)
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

        // Shunt triangle
        this.world.add(Physics.body('convex-polygon', {
            x: 500,
            y: 690,
            vertices: [
                {x: 0, y: 0},
                {x: 0, y: 200},
                {x: 200, y: 200},
            ],
            treatment: 'static',
            cof: 1,
            styles: {
                fillStyle: '#d33682',
                angleIndicator: '#751b4b'
            }
        }))

        var buttonContainer = document.createElement("div");
        var playPause = new PlayPause(world, buttonContainer);
        dataLogContainer = document.createElement("div");
        dataLogContainer.className = "data-log";
        container.appendChild(dataLogContainer);
        container.appendChild(buttonContainer);
        var topGate = new Gate(world, buttonContainer,
                               util.makeRect(0, 0, 100, 60),
                               [500, 150], null, {debug: true, show: true});
        var bottomGate = new Gate(world, buttonContainer,
                               util.makeRect(0, 0, 100, 60),
                               [500, 520], null, {debug: true, show: true});

        var stopwatches = {}
        topGate.on('enter', function(data) {
            var stopwatch = stopwatches[data.body.uid];
            if (!stopwatch || !stopwatch.running) {
                // if there's not already a stopwatch, or there is one, but it
                // was already stopped, make a new one.  otherwise, just reset
                // the existing one.
                stopwatch = new Stopwatch(world, dataLogContainer, 1);
            }
            stopwatch.reset().start();
            stopwatches[data.body.uid] = stopwatch;
        })
        bottomGate.on('enter', function(data) {
            stopwatch = stopwatches[data.body.uid];
            if (stopwatch) stopwatch.stop();
        })
    }
});

