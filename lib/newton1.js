var Gate = require('./gate');
var Base = require('./base');
var Stopwatch = require('./stopwatch');
var PlayPause = require('./playpause');
var util = require('./util');

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

        var gate1 = new Gate(world,
            util.makeRect(0, 0, 10, 500),
            [400, 350], null, {debug: true, show: true, color: 'green'});
        var gate2 = new Gate(world,
            util.makeRect(0, 0, 10, 500),
            [600, 350], null, {debug: true, show: true, color: 'green'});
        var gate3 = new Gate(world,
            util.makeRect(0, 0, 10, 500),
            [800, 350], null, {debug: true, show: true, color: 'green'});
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

        var minX = 50;
        var maxX = 300;
        var minY = 50;
        var maxY = 650;
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

        
