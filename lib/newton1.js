var Gate = require('./gate');
var Base = require('./base');
var Stopwatch = require('./stopwatch');
var PlayPause = require('./playpause');

function random(min, max){
    return (Math.random() * (max-min) + min)|0
}

module.exports = Base.extend(function Asteroids(container, options) {
    Base.call(this, container, options, 'images/space_background.jpg',
        true /* disableBounds */)
}, {
    setup: function (container) {
        var world = this.world;
        this.handleNewAsteroid();
        var playPauseContainer = document.createElement("div");
        container.appendChild(playPauseContainer);
        var playPause = new PlayPause(world, playPauseContainer);
        container.appendChild(this.createNewAsteroidLink())
    },

    createNewAsteroidLink: function() {
        var newAsteroidLink = document.createElement("a");
        newAsteroidLink.href = "#";
        newAsteroidLink.innerHTML = "New asteroid";
        newAsteroidLink.addEventListener("click", function (event) {
            this.handleNewAsteroid();
            event.preventDefault();
        }.bind(this));
        return newAsteroidLink;
    },

    handleNewAsteroid: function() {
        var world = this.world;

        var minX = 100;
        var maxX = 400;
        var minY = 100;
        var maxY = 400;
        var minAngle = 0;
        var maxAngle = 2*Math.PI;

        world.add(Physics.body('circle', {
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
        }));
    }
});

        
