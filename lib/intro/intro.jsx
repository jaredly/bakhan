/** @jsx React.DOM */

var PT = React.PropTypes
var Step = require('./step.jsx')

var DEBUG = false

var ButtonGroup = React.createClass({
    render: function () {
        return <div className="walkthrough_hypotheses">
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
            id: 'hello',
            title: "Hi! I'm Sir Francis Bacon",
            showBacon: true,
            body: "I was made a Knight of England for doing awesome Science. We're going to use science to figure out cool things about the world.",
            next: "Awesome"
        }))
    },

    function (props) {
        var hypothesis = props.data.hypothesis
        return Step(_.extend(props, {
            id: 'description',
            title: "Experiment #1",
            onUpdate: function (prevProps) {
                if (this.props.data.hypothesis && !prevProps.data.hypothesis) {
                    props.onHypothesis(props.data.hypothesis);
                    DEBUG ? props.onNext() : setTimeout(function () {
                        props.onNext()
                    }, 2000)
                }
            },
            body: <div>
                <p>What falls faster: a tennis ball or a bowling ball?</p>
                <p><strong>Hypothesis:</strong> What you think will happen.</p>
                <hr/>
                <div className="large">I think:
                    <ButtonGroup
                        selected={hypothesis}
                        onSelect={props.setData.bind(null, 'hypothesis')}
                        options={[["tennis", "The tennis ball falls faster"],
                            ["bowling", "The bowling ball falls faster"],
                            ["same", "They fall the same"]]}/>
                </div>
                {hypothesis && <p>Great! Now we do science</p>}
            </div>
        }))
    },

    function (props) {
        return Step(_.extend(props, {
            id: 'experiment',
            style: 'black',
            title: 'The experiment',
            body: <p>Here we have tools to conduct our experiment. You can see
            some bowling balls and tennis balls, and those red and green
            sensors will record the time it takes for a ball to fall.</p>,
            onRender: function () {
                props.Exercise.deployBalls(function () {
                    DEBUG ? props.onNext() : setTimeout(function () {
                        props.onNext()
                    }, 2000);
                })
            }
        }))
    },

    function (props) {
        return Step(_.extend(props, {
            id: 'drop',
            style: 'black',
            pos: {
                top: 200,
                left: 200
            },
            body: <p>If we drop a ball here above the green sensor, we can
                time how long it takes for it to fall to the red sensor.</p>,
            onRender: function () {
                props.Exercise.demonstrateDrop(function () {
                    props.onNext()
                })
            }
        }))
    },

    function (props) {
        return Step(_.extend(props, {
            id: 'logbook',
            style: 'black',
            pos: {
                top: 100,
                left: 500
            },
            arrow: <div className="arrow-to-logbook"/>,
            body: <p>The time is then recorded over here in your log book. Fill up this log book with times for both balls and compare them.</p>,
            onRender: function () {
                setTimeout(function () {
                    props.onNext();
                }, DEBUG ? 100 : 5000);
            }
        }));
    },

    function (props) {
        return Step(_.extend(props, {
            id: 'answer',
            style: 'black',
            pos: {
                top: 150,
                left: 250
            },
            arrow: <div className="arrow-to-answer"/>,
            showBacon: true,
            title: "Now conduct the experiment to test your hypothesis!",
            body: <p>Once you've collected enough data in your log book,
            decide whether the data <span className="uline">support</span> or
            {' '}<span className="uline">disprove</span> your hypothesis. Then
            I will evaluate your experiment and give you feedback.</p>,
            onRender: function () {
                setTimeout(function () {
                    props.onNext();
                }, 7000)
            }
        }))
    },
]

