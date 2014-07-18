
module.exports = CanGraph

function CanGraph(options) {
    this.o = options
    this.points = []
}

CanGraph.prototype = {
    draw: function () {
        if (!this.points.length) return
        var ctx = this.o.node.getContext('2d')
        var dy = this.points
        ctx.

    },
    addPoint: function (point) {
        this.points.push(point)
    }
}

