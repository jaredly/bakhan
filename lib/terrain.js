module.exports = terrain;

function terrain( parent ){
    // mostly copied from the edge-collision-detection behavior.

    /*
     * checkGeneral( body, bounds, dummy ) -> Array
     * - body (Body): The body to check
     * - bounds: bounds.aabb should be the outer bounds.  For terrain on the
     *   ground, pass a function bounds.terrainHeight(x).
     * - dummy: (Body): The dummy body to publish as the static other body it collides with
     * + (Array): The collision data
     *
     * Check if a body collides with the boundary
     */
    var checkGeneral = function checkGeneral( body, bounds, terrainHeight, dummy ){

        var overlap
            ,aabb = body.aabb()
            ,scratch = Physics.scratchpad()
            ,trans = scratch.transform()
            ,dir = scratch.vector()
            ,result = scratch.vector()
            ,collision = false
            ,collisions = []
            ,x
            ,y
            ,collisionX
            ;

        // right
        overlap = (aabb.x + aabb.hw) - bounds.max.x;

        if ( overlap >= 0 ){

            dir.set( 1, 0 ).rotateInv( trans.setRotation( body.state.angular.pos ) );

            collision = {
                bodyA: body,
                bodyB: dummy,
                overlap: overlap,
                norm: {
                    x: 1,
                    y: 0
                },
                mtv: {
                    x: overlap,
                    y: 0
                },
                pos: body.geometry.getFarthestHullPoint( dir, result ).rotate( trans ).values()
            };

            collisions.push(collision);
        }

        // bottom
        overlap = -1;
        for (x = aabb.x - aabb.hw; x <= aabb.x + aabb.hw; x++) {
            y = bounds.max.y - terrainHeight(x);
            dir.set( x - body.state.pos.x, y - body.state.pos.y).negate();
            dir.rotateInv( trans.setRotation( body.state.angular.pos ) );
            body.geometry.getFarthestHullPoint(dir, result).rotate(trans);
            if (result.norm() > dir.norm() && overlap < result.norm() - dir.norm()) {
                // there is an actual collision, and this is the deepest
                // overlap we've seen so far
                collisionX = x;
                overlap = result.norm() - dir.norm();
            }
        }

        if ( overlap >= 0 ) {
            // whoo copypasta
            x = collisionX;
            y = bounds.max.y - terrainHeight(x);
            dir.set( x - body.state.pos.x, y - body.state.pos.y);
            dir.rotateInv( trans.setRotation( body.state.angular.pos ) );
            body.geometry.getFarthestHullPoint(dir, result).rotate(trans);

            collision = {
                bodyA: body,
                bodyB: dummy,
                overlap: overlap,
                pos: result.values(),
                norm: dir.rotate(trans).normalize().values(),
                mtv: dir.mult(overlap).values(),
            };

            collisions.push(collision);
        }

        // left
        overlap = bounds.min.x - (aabb.x - aabb.hw);

        if ( overlap >= 0 ){

            dir.set( -1, 0 ).rotateInv( trans.setRotation( body.state.angular.pos ) );

            collision = {
                bodyA: body,
                bodyB: dummy,
                overlap: overlap,
                norm: {
                    x: -1,
                    y: 0
                },
                mtv: {
                    x: -overlap,
                    y: 0
                },
                pos: body.geometry.getFarthestHullPoint( dir, result ).rotate( trans ).values()
            };

            collisions.push(collision);
        }

        // top
        overlap = bounds.min.y - (aabb.y - aabb.hh);

        if ( overlap >= 0 ){

            dir.set( 0, -1 ).rotateInv( trans.setRotation( body.state.angular.pos ) );

            collision = {
                bodyA: body,
                bodyB: dummy,
                overlap: overlap,
                norm: {
                    x: 0,
                    y: -1
                },
                mtv: {
                    x: 0,
                    y: -overlap
                },
                pos: body.geometry.getFarthestHullPoint( dir, result ).rotate( trans ).values()
            };

            collisions.push(collision);
        }

        scratch.done();
        return collisions;
    };

    /*
     * checkEdgeCollide( body, bounds, dummy ) -> Array
     * - body (Body): The body to check
     * - bounds (Physics.aabb): The boundary
     * - dummy: (Body): The dummy body to publish as the static other body it collides with
     * + (Array): The collision data
     *
     * Check if a body collides with the boundary
     */
    var checkEdgeCollide = function checkEdgeCollide( body, bounds, terrainHeight, dummy ){

        return checkGeneral( body, bounds, terrainHeight, dummy );
    };

    var defaults = {

        edges: {
            aabb: null,
            terrainHeight: function (x) {return 0;},
        },
        restitution: 0.99,
        cof: 1.0,
        channel: 'collisions:detected'
    };

    return {

        // extended
        init: function( options ){

            parent.init.call( this );
            this.options.defaults( defaults );
            this.options( options );

            this.setAABB( this.options.aabb );
            this.restitution = this.options.restitution;

            this.body = Physics.body('point', {
                treatment: 'static',
                restitution: this.options.restitution,
                cof: this.options.cof
            });
        },

        /**
         * EdgeCollisionDetectionBehavior#setAABB( aabb ) -> this
         * - aabb (Physics.aabb): The aabb to use as the boundary
         *
         * Set the boundaries of the edge.
         **/
        setAABB: function( aabb ){

            if (!aabb) {
                throw 'Error: aabb not set';
            }

            this._edges = {
                min: {
                    x: (aabb.x - aabb.hw),
                    y: (aabb.y - aabb.hh)
                },
                max: {
                    x: (aabb.x + aabb.hw),
                    y: (aabb.y + aabb.hh)
                }
            };

            return this;
        },

        // extended
        connect: function( world ){

            world.on( 'integrate:velocities', this.checkAll, this );
        },

        // extended
        disconnect: function( world ){

            world.off( 'integrate:velocities', this.checkAll );
        },

        /** internal
         * EdgeCollisionDetectionBehavior#checkAll( data )
         * - data (Object): Event data
         *
         * Event callback to check all bodies for collisions with the edge
         **/
        checkAll: function( data ){

            var bodies = this.getTargets()
                ,dt = data.dt
                ,body
                ,collisions = []
                ,ret
                ,bounds = this._edges
                ,terrainHeight = _.memoize(this.options.terrainHeight)
                ,dummy = this.body
                ;

            for ( var i = 0, l = bodies.length; i < l; i++ ){

                body = bodies[ i ];

                // only detect dynamic bodies
                if ( body.treatment === 'dynamic' ){

                    ret = checkEdgeCollide( body, bounds, terrainHeight, dummy );

                    if ( ret ){
                        collisions.push.apply( collisions, ret );
                    }
                }
            }

            if ( collisions.length ){

                this._world.emit( this.options.channel, {
                    collisions: collisions
                });
            }
        }
    };

};
