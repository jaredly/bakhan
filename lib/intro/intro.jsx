/** @jsx React.DOM */

var PT = React.PropTypes
var Step = require('./step.jsx')

var ButtonGroup = React.createClass({
    render: function () {
        return <div>
            {this.props.options.map(function (item) {
                var cls = "btn btn-default"
                if (this.props.selected === item[0]) {
                    cls += ' active'
                }
                return <button key={item[0]} className={cls} onClick={this.props.onSelect.bind(null, item[0])}>{item[1]}</button>;
            }.bind(this))}
        </div>;
    }
});

module.exports = [
    function (props) {
        return Step(_.extend(props, {
            title: "Hi! I'm Sir Frances Bacon",
            body: "I was made a Knight of England for doing awesome Science. We're going to use science to figure out cool things about the world.",
            next: "Awesome"
        }))
    },

    function (props) {
        var hypothesis = props.data.hypothesis
        if (hypothesis) {
            setTimeout(function () {
                props.onNext()
            }, 500)
        }
        return Step(_.extend(props, {
            title: "Experiment #1",
            body: <div>
                <p>What falls faster: a tennis ball or a bowling ball?</p>
                <p><strong>Hypothesis:</strong> What you think will happen.</p>
                <p>I think:
                    <ButtonGroup
                        selected={hypothesis}
                        onSelect={props.setData.bind(null, 'hypothesis')}
                        options={[["tennis", "The tennis ball falls faster"],
                            ["bowling", "The bowling ball falls faster"],
                            ["same", "They fall the same"]]}/>
                </p>
                {hypothesis && <p>Great! Now we do science</p>}
            </div>
        }))
    },

    function (props) {
        return Step(_.extend(props, {
            style: 'black',
            title: 'Now we experiment',
            body: <p>Here we have tools to conduct our experiment. You can see
            some bowling balls and tennis balls, and those red and green
            sensors will record the time it takes for a ball to fall.</p>,
            onRender: function () {
                setTimeout(function () {
                    props.Exercise.demonstrateDrop(function () {
                        props.onNext()
                    })
                }, 2000)
            }
        }))
    },
]

