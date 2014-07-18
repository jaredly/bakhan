var Gate = require('./gate');
var Base = require('./base');
var Stopwatch = require('./stopwatch');
var PlayPause = require('./playpause');

module.exports = Base.extend(function Orbit(container, options) {
    Base.call(this, container, options)
}, {
    setup: function (container) {
        var world = this.world;
        world.add(Physics.body('circle', {
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
        }));
        world.add(Physics.body('circle', {
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
        }));
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
        world.add(bigBall);
        world.add(Physics.behavior('newtonian', { strength: .5 }));

        var buttonContainer = document.createElement("div");
        container.appendChild(buttonContainer);
        var stopwatch = new Stopwatch(buttonContainer, 1);
        var playPause = new PlayPause(buttonContainer);
        gatePolygon = [{x: 0, y: 280}, {x: 1400, y: 280}, {x: 1400, y: 300}, {x: 0, y: 300}];
        var gate = new Gate(world, buttonContainer, gatePolygon, bigBall, {debug: true, show: true});
    }
});

        
