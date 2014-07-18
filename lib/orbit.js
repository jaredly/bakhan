var Gate = require('./gate');
var Base = require('./base');
var Stopwatch = require('./stopwatch');
var PlayPause = require('./playpause');

module.exports = Base.extend(function Orbit(container, options) {
    Base.call(this, container, options)
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

        
