/** @jsx React.DOM */

var Walkthrough = require('./walk-through.jsx')
var PT = React.PropTypes
var Step = require('./step.jsx')

var DEBUG = false

module.exports = Newton1Intro;

function Newton1Intro(Exercise, gotHypothesis) {
    var node = document.createElement('div')
    document.body.appendChild(node)
    React.renderComponent(Walkthrough({
        steps: steps,
        onHypothesis: gotHypothesis,
        onDone: function (hypothesis) {
            React.unmountComponentAtNode(node);
            node.parentNode.removeChild(node);
        },
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
            title: "Space!!!",
            showBacon: true,
            body: "I was made a Knight of England for doing awesome Science. We're going to use science to figure out cool things about the world.",
            next: "Let's do science!"
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
                    }, 500)
                }
            },
            body: <div>
                <p>What falls faster: a tennis ball or a bowling ball?</p>
                <p>A <span className="uline">Hypothesis</span> is what you think will happen.</p>
                <hr/>
                <div className="large">I think:
                    <ButtonGroup
                        className="walkthrough_hypotheses"
                        selected={hypothesis}
                        onSelect={props.setData.bind(null, 'hypothesis')}
                        options={[["tennis", "The tennis ball falls faster"],
                            ["bowling", "The bowling ball falls faster"],
                            ["same", "They fall the same"]]}/>
                </div>
                {/**hypothesis && <p className="walkthrough_great">Great! Now we do science</p>**/}
            </div>
        }))
    },

    function (props) {
        var firstBall = 'tennis'
        var secondBall = 'bowling'
        var prover = props.data.prover
        var hypothesis = props.data.hypothesis

        if (hypothesis === 'bowling') {
            firstBall = 'bowling'
            secondBall = 'tennis'
        }

        var responses = {
            'tennis': 'Nope. That would show that the tennis ball falls faster',
            'bowling': 'Nope. That would show that the bowling ball falls faster',
            'same': 'Nope. That would show that they fall the same'
        }
        var correct = {
            'tennis': 'less',
            'bowling': 'less',
            'same': 'same'
        }
        var proverResponse
        var isCorrect = prover === correct[hypothesis]

        if (prover) {
            if (isCorrect) {
                proverResponse = "Exactly! Now let's do the experiment."
            } else {
                proverResponse = responses[{
                    tennis: {
                        more: 'bowling',
                        same: 'same'
                    },
                    bowling: {
                        more: 'tennis',
                        same: 'same'
                    },
                    same: {
                        more: 'bowling',
                        less: 'tennis'
                    }
                }[hypothesis][prover]];
            }
        }

        var futureHypothesis = {
            tennis: 'the tennis ball will fall faster than the bowling ball',
            bowling: 'the bowling ball will fall faster than the tennis ball',
            same: 'the tennis ball and the bowling ball will fall the same'
        }[hypothesis];

        var currentHypothesis = {
            tennis: 'a tennis ball falls faster than a bowling ball',
            bowling: 'a bowling ball falls faster than a tennis ball',
            same: 'a tennis ball falls the same as a bowling ball'
        }[hypothesis];

        return Step(_.extend(props, {
            id: 'design-experiment',
            title: 'Designing the Experiment',
            onUpdate: function (prevProps) {
                if (prover && isCorrect && prover !== prevProps.data.prover) {
                    setTimeout(function () {
                        props.onNext()
                    }, 2000);
                }
            },
            body: <div>
                <p>Now we need to design an experiment to test your
                hypothesis! It's important to be careful when designing an
                experiment, because otherwise you could end up "proving"
                something that's actually false.</p>
                <p>To prove that <span className="uline">{currentHypothesis}</span>, we can measure the time that it
                takes for each ball to fall when dropped from a specific
                height.</p>
                <p>Your hypothesis will be proven if the <span className="uline">time for the {firstBall} ball</span> is
                    <ButtonGroup
                        className="btn-group"
                        selected={prover}
                        onSelect={props.setData.bind(null, 'prover')}
                        options={[['less', 'less than'], ['more', 'more than'], ['same', 'the same as']]}/>
                    the <span className="uline">time for the {secondBall} ball</span>.
                </p>
                {prover && <p className="design_response">{proverResponse}</p>}
            </div>
        }))
    },

    function (props) {
        return Step(_.extend(props, {
            id: 'experiment',
            style: 'black',
            title: 'The experiment',
            pos: {
                left: 375,
                top: 200
            },
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
            next: "Ok, I'm ready",
        }))
    },
]
