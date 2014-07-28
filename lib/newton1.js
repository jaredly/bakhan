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
            }.bind(this), this.options.debug === 'true')
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
