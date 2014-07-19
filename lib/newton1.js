var Gate = require('./gate');
var Base = require('./base');
var Stopwatch = require('./stopwatch');
var PlayPause = require('./playpause');

module.exports = Base.extend(function Asteroids(container, options) {
    Base.call(this, container, options, 'images/space_background.jpg',
        true /* disableBounds */)
}, {
    setup: function (container) {
        var world = this.world;
        world.add(Physics.body('circle', {
            x: 400
            ,y: 350
            ,radius: 50
            ,mass: 1000
            ,restitution: 0
            ,styles: {
                image: 'images/asteroid.png',
                fillStyle: '#ffcc00'
            }
        }));
        world.add(Physics.body('circle', {
            x: 400
            ,y: 50
            ,radius: 25
            ,mass: 500
            ,restitution: 0
            ,styles: {
                image: 'images/asteroid.png',
                fillStyle: '#26eb62' //green
            }
        }));

        var buttonContainer = document.createElement("div");
        container.appendChild(buttonContainer);
        var playPause = new PlayPause(world, buttonContainer);
    }
});

        
