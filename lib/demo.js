var Gate = require('./gate');
var Base = require('./base');
var Stopwatch = require('./stopwatch');

module.exports = Base.extend(function Demo(container, options) {
    Base.call(this, container, options)
}, {
    dropInBody: function () {
        var body;

        var pent = [
            { x: 50, y: 0 }
            ,{ x: 25, y: -25 }
            ,{ x: -25, y: -25 }
            ,{ x: -50, y: 0 }
            ,{ x: 0, y: 50 }
        ];

        function random( min, max ){
            return (Math.random() * (max-min) + min)|0
        }
            switch ( random( 0, 3 ) ){

                    // add a circle
                case 0:
                    body = Physics.body('circle', {
                        x: this.options.width / 2
                        ,y: 50
                        ,vx: random(-5, 5)/100
                        ,radius: 40
                        ,restitution: 0.9
                        ,styles: {
                            fillStyle: '#268bd2'
                            ,angleIndicator: '#155479'
                        }
                    });
                    break;

                    // add a square
                case 1:
                    body = Physics.body('rectangle', {
                        width: 50
                        ,height: 50
                        ,x: this.options.width / 2
                        ,y: 50
                        ,vx: random(-5, 5)/100
                        ,restitution: 0.9
                        ,styles: {
                            fillStyle: '#d33682'
                            ,angleIndicator: '#751b4b'
                        }
                    });
                    break;

                    // add a polygon
                case 2:
                    body = Physics.body('convex-polygon', {
                        vertices: pent
                        ,x: this.options.width / 2
                        ,y: 50
                        ,vx: random(-5, 5)/100
                        ,angle: random( 0, 2 * Math.PI )
                        ,restitution: 0.9
                        ,styles: {
                            fillStyle: '#859900'
                            ,angleIndicator: '#414700'
                        }
                    });
                    break;
            }

            this.world.add( body );
    },
    setup: function (container) {
        var world = this.world
        world.add(Physics.behavior('constant-acceleration'));

        // add some fun interaction
        var attractor = Physics.behavior('attractor');
        world.on({
            'interact:poke': function( pos ){
                attractor.position( pos );
                world.add( attractor );
            }
            ,'interact:move': function( pos ){
                attractor.position( pos );
            }
            ,'interact:release': function(){
                world.remove( attractor );
            }
        });

        var int = setInterval(function(){
            if ( world._bodies.length > 4 ){
                clearInterval( int );
            }
            this.dropInBody();
        }.bind(this), 700);

        var gate = new Gate(world, container, {debug: true});
        var stopwatch = new Stopwatch(container, 1);
    }
});

