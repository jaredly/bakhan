var Base = require('./base');
var Gate = require('./gate');
var Stopwatch = require('./stopwatch');
var LogBook = require('./logbook');
var PlayPause = require('./playpause');
var util = require('./util');

function random(min, max){
    return (Math.random() * (max-min) + min)|0
}

module.exports = Base.extend(function Drop(container, options) {
    Base.call(this, container, options)
}, {
    dropBowlingBall: function() {
        var radius = 50;
        this.world.add(Physics.body('circle', {
            x: 700,
            y: 200,
            vx: random(-30, 30)/100,
            radius: radius,
            mass: radius * radius,
            restitution: 0.01,
            styles: {
                fillStyle: '#362E3B',
                angleIndicator: '#155479'
            },
            displayName: 'Bowling Ball',
        }));
    },

    dropTennisBall: function() {
        console.log('dt', this)
        var radius = 20;
        this.world.add(Physics.body('circle', {
            x: 700,
            y: 200,
            vx: random(-30, 30)/100,
            radius: radius,
            mass: radius * radius,
            restitution: 1,
            styles: {
                fillStyle: '#C6ED2C',
                angleIndicator: '#155479'
            },
            displayName: 'Tennis Ball'
        }));
    },

    deployBalls: function() {
        var spacing_ms = 800;
        var queue = [
            this.dropTennisBall.bind(this),
            this.dropTennisBall.bind(this),
            this.dropBowlingBall.bind(this),
            this.dropTennisBall.bind(this),
            this.dropTennisBall.bind(this),
            this.dropBowlingBall.bind(this),
        ];
        _.reduce(queue, function(t, action) {
            setTimeout(action, t)
            return t + spacing_ms
        }, 0)

        // setTimeout(this.dropTennisBall.bind(this), 0)
        // setTimeout(this.dropTennisBall.bind(this), 100)
        // setTimeout(this.dropTennisBall.bind(this), 200)
    },

    setup: function (container) {
        var world = this.world
        world.add(Physics.behavior('constant-acceleration'));

        // Add the balls.
        setTimeout(this.deployBalls.bind(this), 500)

        // Shunt triangle
        this.world.add(Physics.body('convex-polygon', {
            x: 60,
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
            }
        }))

        var topGate = new Gate(world, buttonContainer,
                               util.makeRect(0, 0, 130, 40),
                               [90, 150], null, {debug: true, show: true, color: 'green'});
        var bottomGate = new Gate(world, buttonContainer,
                               util.makeRect(0, 0, 130, 40),
                               [90, 520], null, {debug: true, show: true, color: 'red'});
        new LogBook(world, topGate, bottomGate, container);
        var buttonContainer = document.createElement("div");
        var playPause = new PlayPause(world, buttonContainer);
        container.appendChild(buttonContainer);
    }
});

