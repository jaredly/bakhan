
var Walkthrough = require('./walk-through.jsx')

module.exports = function (Exercise) {
    var node = document.createElement('div')
    document.body.appendChild(node)
    React.renderComponent(Walkthrough({
        steps: require('./intro.jsx'),
        Exercise: Exercise
    }), node)
}

