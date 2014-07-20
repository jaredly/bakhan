/** @jsx React.DOM */

var Walkthrough = require('./intro/walk-through.jsx')
var Step = require('./intro/step.jsx')

module.exports = Bacon;

function Bacon(container, options) {
    var node = document.createElement('div');
    document.body.appendChild(node);
    React.renderComponent(Walkthrough({
        steps: steps,
    }), node);
}

Bacon.prototype = {
    run: function () {},
};

var steps = [
    function (props) {
        return Step(_.extend(props, {
            id: 'congrats',
            title: "Congratulations!",
            showBacon: true,
            body: <div>
                <p>That was some awesome Science you did there!  You've finished all of my experiments. You earned the <strong>Bacon Badge</strong> for your work.</p>
                <p className="bacon-badge-container"><img className="bacon-badge" src="/images/bacon.png"/></p>
            </div>,
            next: "What's next?"
        }));
    },

    function (props) {
        return Step(_.extend(props, {
            id: 'next',
            title: "Do more science!",
            showBacon: true,
            body: <div>
                <p>If you want to learn more science, check out the <a href="//khanacademy.org/science/physics">physics</a> section on Khan Academy.  Have fun!</p>
            </div>,
        }));
    },
];
