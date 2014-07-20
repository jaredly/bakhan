var Base = require('./base');
var Gate = require('./gate');
var Stopwatch = require('./stopwatch');
var LogBook = require('./logbook');
var PlayPause = require('./playpause');
//var WalkThrough = require('./intro/hills_walkthrough.jsx');
var DropDataChecker = require('./dropdatachecker.jsx');
var CaveDraw = require('./cavedraw');
var util = require('./util');
var terrain = require('./terrain');

function random(min, max){
    return (Math.random() * (max-min) + min)|0
}

module.exports = Base.extend(function Hills(container, options) {
    Base.call(this, container, options, "images/lab_background.jpg",
        true /* disableBounds */)
}, {
    dropObjects: function() {
        this.world.add(Physics.body('circle', {
            x: 700,
            y: 200,
            radius: 20,
            mass: 900,
            cof: 0.1,
            restitution: 0.01,
            displayName: "Bowling Ball",
            styles: {
                image: "images/bowling_ball.png"
            }
        }))
    },

    // TODO: hook up walkthrough
//    startWalkthrough: function () {
//        WalkThrough(this, function (hypothesis) {
//            console.log('Got the hypothesis!!', hypothesis);
//            this.setupDataChecker(hypothesis);
//        }.bind(this))
//    },

    setupDataChecker: function (hypothesis) {
        var dataChecker = document.createElement("div");
        dataChecker.className = "drop-data-checker";
        this.sideBar.appendChild(dataChecker);
        React.renderComponent(DropDataChecker({
            initialHypothesis: hypothesis,
            logBook: this.logBook,
            world: this.world
        }), dataChecker);
    },

    setupSlider: function (container) {
        this.slider = $('<input type="range" min="0" max="140" step="10" value="100"/>');
        this.slider.change(function () {
            this.setupTerrain(200, this.slider.val());
        }.bind(this));
        var div = $('<div class="hill-slider"/>');
        $(container).append(div);
        div.append(this.slider);
    },

    setupTerrain: function (rampHeight, hillHeight) {
        if (this.terrainCanvas) {
            this.terrainCanvas.clear();
        }
        if (this.terrainBehavior) {
            this.world.remove(this.terrainBehavior);
        }
        var terrainHeight = this.mkTerrainHeightFunction(rampHeight, hillHeight);
        this.terrainCanvas.draw(terrainHeight)
        this.terrainBehavior = Physics.behavior('terrain-collision-detection', {
            aabb: Physics.aabb(0, 0, this.options.width, this.options.height),
            terrainHeight: terrainHeight,
            restitution: 0.2,
            cof: 0.1
        });
        this.world.add(this.terrainBehavior);
    },

    mkTerrainHeightFunction: function (rampHeight, hillHeight) {
        var rampWidth = this.options.width / 4;
        var rampScale = rampHeight / Math.pow(rampWidth, 2);
        return function (x) {
            if (x < rampWidth) {
                return Math.pow(rampWidth - x, 2) * rampScale;
            } else if (x < 3 * rampWidth) {
                return hillHeight / 2 + Math.cos(Math.PI * x / rampWidth) * hillHeight / 2;
            } else {
                return 0;
            }
        };

    },

    setup: function (container) {
        var world = this.world
        var gravity = Physics.behavior('constant-acceleration')
        gravity.setAcceleration({x: 0, y:.0003});
        world.add(gravity);
        // register, but don't set up the behavior; that is done in setupTerrain()
        Physics.behavior('terrain-collision-detection', terrain);
        this.terrainCanvas = new CaveDraw($('#under-canvas'), 900, 700)
        this.setupTerrain(200, 100);

        var sideBar = this.sideBar = document.createElement("div");
        sideBar.className = "side-bar";
        container.appendChild(sideBar);
        var topGate = new Gate(world,
                               util.makeRect(0, 0, 10, 200),
                               [750, 600], null, {debug: true, show: true, color: 'green'});
        var bottomGate = new Gate(world,
                               util.makeRect(0, 0, 10, 200),
                               [800, 600], null, {debug: true, show: true, color: 'red'});
        var logColumns = [{name: "100 cm"}];
        var logBook = this.logBook = new LogBook(world, sideBar, 3, logColumns);
        topGate.on('enter', function(elem) {
            var colName = this.slider.val().toString() + " cm";
            logBook.handleStart(colName, elem.body.uid);
        }.bind(this));
        bottomGate.on('enter', function(elem) {
            var colName = this.slider.val().toString() + " cm";
            logBook.handleEnd(colName, elem.body.uid);
        }.bind(this));
        var buttonContainer = document.createElement("div");
        var playPause = new PlayPause(world, buttonContainer);
        container.appendChild(buttonContainer);
        this.setupSlider(buttonContainer);

        if (this.options.walk) {
            // TODO: hook up walkthrough
//            this.startWalkthrough()
        } else {
            this.dropObjects();
            this.setupDataChecker('same');
        }
    },
});
