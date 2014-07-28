/** @jsx React.DOM */

var Walkthrough = require('./walk-through.jsx')
var PT = React.PropTypes
var Step = require('./step.jsx')

module.exports = Newton1Intro;

function Newton1Intro(Exercise, gotHypothesis, debug) {
    var node = document.createElement('div')
    document.body.appendChild(node)
    React.renderComponent(Walkthrough({
        steps: steps,
        onHypothesis: gotHypothesis,
        onDone: function (hypothesis) {
            React.unmountComponentAtNode(node);
            node.parentNode.removeChild(node);
        },
        debug: debug,
        Exercise: Exercise
    }), node)
}


var ButtonGroup = React.createClass({
    render: function () {
        return <span className={this.props.className}>
            {this.props.options.map(function (item) {
                var cls = "btn btn-default"
                if (this.props.selected === item[0]) {
                    cls += ' active'
                }
                return <button key={item[0]} className={cls} onClick={this.props.onSelect.bind(null, item[0])}>{item[1]}</button>;
            }.bind(this))}
        </span>;
    }
});

var steps = [
    function (props) {
        return Step(_.extend(props, {
            id: 'hello',
            title: "Ready for more Science?",
            showBacon: true,
            body: "Let's get out of the lab. For this next experiment, I know just the place!",
            next: "Let's go!"
        }))
    },

    function (props) {
        return Step(_.extend(props, {
            id: 'space',
            style: 'black',
            title: "Space!",
            body: "The rules of science work everywhere, so discoveries we make " +
                "in space will also apply here on Earth. An important skill when " +
                "designing an experiment is avoiding things that could " +
                "interfere with the results. In space, we don't need " +
                "to worry about gravity or wind.",
            next: "Cool!"
        }))
    },

    function (props) {
        var hypothesis = props.data.hypothesis
        return Step(_.extend(props, {
            id: 'description',
            style: 'black',
            title: "Experiment #2",
            onUpdate: function (prevProps) {
                if (this.props.data.hypothesis && !prevProps.data.hypothesis) {
                    props.onHypothesis(props.data.hypothesis);
                    props.debug ? props.onNext() : setTimeout(function () {
                        props.onNext()
                    }, 500)
                }
            },
            body: <div>
                <p>What happens to a moving object if you leave it alone?</p>
                <hr/>
                <div className="large">I think:
                    <ButtonGroup
                        className="walkthrough_hypotheses"
                        selected={hypothesis}
                        onSelect={props.setData.bind(null, 'hypothesis')}
                        options={[["faster", "It speeds up"],
                            ["slower", "It slows down"],
                            ["same", "It stays at the same speed forever"]]}/>
                </div>
                {/**hypothesis && <p className="walkthrough_great">Great! Now we do science</p>**/}
            </div>
        }))
    },

    function (props) {
        var prover = props.data.prover
        var hypothesis = props.data.hypothesis

        var responses = {
            'more': 'Nope. That would show that the object gets faster.',
            'less': 'Nope. That would show that the object gets slower.',
            'same': 'Nope. That would show that the object stays the same speed.'
        }
        var correct = {
            'faster': 'more',
            'slower': 'less',
            'same': 'same'
        }
        var proverResponse
        var isCorrect = prover === correct[hypothesis]

        if (prover) {
            if (isCorrect) {
                proverResponse = "Exactly! Now let's do the experiment."
            } else {
                proverResponse = responses[prover];
            }
        }

        var currentHypothesis = {
            faster: 'moving objects get faster over time',
            slower: 'moving objects get slower over time',
            same: "moving objects don't change in speed over time"
        }[hypothesis];

        return Step(_.extend(props, {
            id: 'design-experiment',
            style: 'black',
            title: 'Designing the Experiment',
            onUpdate: function (prevProps) {
                if (prover && isCorrect && prover !== prevProps.data.prover) {
                    setTimeout(function () {
                        props.onNext()
                    }, 2000);
                }
            },
            body: <div>
                <p>To prove that <span className="uline">{currentHypothesis}</span>,
                we can measure the time that it takes for an asteroid to move 100 meters,
                then measure the time to move another 100 meters.</p>
                <p>Your hypothesis will be proven if the <span className="uline">time to travel the first 100m</span> is
                    <ButtonGroup
                        className="btn-group"
                        selected={prover}
                        onSelect={props.setData.bind(null, 'prover')}
                        options={[['less', 'less than'], ['more', 'more than'], ['same', 'the same as']]}/>
                    the <span className="uline">time to travel the next 100m</span>.
                </p>
                {prover && <p className="design_response_white">{proverResponse}</p>}
            </div>
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
            body: <p>We can test out this hypothesis by throwing an asteroid
                     through the green sensors, which are evenly-spaced. Try
                     throwing at different speeds!</p>,
            onRender: function () {
                props.Exercise.demonstrateSample(function () {
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
            arrow: <div className="arrow-to-logbook-newton1"/>,
            body: <p>Notice that both times show up in the log book.</p>,
            onRender: function () {
                setTimeout(function () {
                    props.onNext();
                }, props.debug ? 100 : 5000);
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
            next: "Ok, I'm ready",
        }))
    },
]
