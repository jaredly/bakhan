
module.exports = Graph

function getDatum(item) {
    return item.attr.split('.').reduce(function (node, attr) {
        return node[attr]
    }, item.body.state)
}

function Graph(parent, tracking, height) {
    this.tracking = tracking
    this.height = height
    this.data = []
    this.node = document.createElement('canvas')
    this.node.className = 'graph'
    parent.appendChild(this.node)
    var initialData = this.getData()

    this.graphs = {}
    var i = 0
    for (var name in tracking) {
        this.graphs[name] = new CanGraph({
            node: this.node,
            top: 200 * i++,
            left: 0,
            width: 600,
            height: 200,
        })
    }

    /*
    this.graph = new Rickshaw.Graph({
        element: this.node,
        width: 600,
        height: 600,
        renderer: 'line',
        series: new Rickshaw.Series(
            tracking.map(function (item) {
                return {name: item.name}
            }),
            undefined, {
                timeInterval: 250,
                maxDataPoints: 100,
                timeBase: new Date().getTime() / 1000
            }
        )
    })
    */
}

Graph.prototype = {
    updateData: function () {
        var data = {}
        var height = this.height
        for (var name in this.tracking) {
            this.graphs[name].addPoint(this.getDatum(name))
            this.graphs[name].draw()
        }
    },
    getDatum: function (name) {
        var item = this.tracking[name]
        if (item.attr === 'pos.y') {
            return height - item.body.state.pos.y
        } else {
            return getDatum(item)
        }
    },
    update: function (timestep) {
        this.updateData()
    }
}

