
module.exports = CanGraph

function CanGraph(options) {
    this.o = options
    this.o.max = this.o.max || 500
    this.points = []
}

CanGraph.prototype = {
    draw: function () {
        if (!this.points.length) return
        var ctx = this.o.node.getContext('2d')
        var dx = this.o.width / this.points.length
        var min = Math.min.apply(Math, this.points)
        var max = Math.max.apply(Math, this.points)
        var scale = max - min
        if (scale < 1) {
            scale = 1
        }
        var dy = this.o.height / scale
        var top = this.o.top
        var left = this.o.left
        var height = this.o.height
        // ctx.clearRect(top, left, this.o.width, this.o.height + 5)
        ctx.beginPath()
        this.points.map(function (p, x) {
            ctx.lineTo(left + x * dx, top + height - (p - min) * dy)
        })
        ctx.strokeStyle = 'blue'
        ctx.lineWidth = 1
        ctx.stroke()
    },
    addPoint: function (point) {
        this.points.push(point)
        if (this.points.length > this.o.max) {
            this.points = this.points.slice(-this.o.max)
        }
    }
}

