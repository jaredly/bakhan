/** @jsx React.DOM */

var Walkthrough = require('./walk-through.jsx')
var PT = React.PropTypes
var Step = require('./step.jsx')

module.exports = HillsIntro;

function HillsIntro(Exercise, gotHypothesis, debug) {
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
            title: "Ready for even more Science?",
            showBacon: true,
            body: "I have one more experiment for you.",
            next: "Let's do it!"
        }))
    },

    function (props) {
        var hypothesis = props.data.hypothesis
        return Step(_.extend(props, {
            id: 'description',
            title: "Experiment #3",
            onUpdate: function (prevProps) {
                if (this.props.data.hypothesis && !prevProps.data.hypothesis) {
                    props.onHypothesis(props.data.hypothesis);
                    props.debug ? props.onNext() : setTimeout(function () {
                        props.onNext()
                    }, 500)
                }
            },
            body: <div>
                <p>If a ball rolls over a hill, does the speed of the ball change?
                </p>
                    <img src="images/ballroll-diagram.png" width="300px"></img>
                <hr/>
                <div className="large">I think:
                    <ButtonGroup
                        className="walkthrough_hypotheses"
                        selected={hypothesis}
                        onSelect={props.setData.bind(null, 'hypothesis')}
                        options={[["faster", "It will come out going faster"],
                            ["slower", "It will come out going slower"],
                            ["same", "It will go the same speed"]]}/>
                </div>
                {/**hypothesis && <p className="walkthrough_great">Great! Now we do science</p>**/}
            </div>
        }))
    },

    function (props) {
        var prover = props.data.prover
        var hypothesis = props.data.hypothesis

        var responses = {
            'more': 'Nope. That would show that the ball comes out faster',
            'less': 'Nope. That would show that the ball comes out slower',
            'same': 'Nope. That would show that the ball comes out at the same speed',
        }
        var correct = {
            'faster': 'less',
            'slower': 'more',
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

        var wordyHypothesis = {
            faster: 'faster',
            slower: 'slower',
            same: 'the same speed',
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
                <p>To prove that the ball comes out <span className="uline">{wordyHypothesis}</span>, we can measure the speed after it goes down a ramp and then over a hill of a given height.</p>
                <p>Since we can't measure speed directly, we'll measure the time it takes for the ball to travel a short fixed distance.</p>
                <p>Your hypothesis will be proven if when we roll a ball down a ramp, then over a larger hill, the <span className="uline">time it takes</span> for the ball to go a fixed distance is
                    <ButtonGroup
                        className="btn-group"
                        selected={prover}
                        onSelect={props.setData.bind(null, 'prover')}
                        options={[['less', 'less than'], ['more', 'more than'], ['same', 'the same as']]}/>
                    the time it takes for the ball to go the same distance if it went over a smaller hill.
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
            body: <p>Here we have tools to conduct our experiment.
                     The red and green sensors will record the time it takes for the ball to go a short fixed distance after going over the hill.</p>,
            onRender: function () {
                props.Exercise.dropObjects(function () {
                    props.debug ? props.onNext() : setTimeout(function () {
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
            body: <p>We can test out this hypothesis by rolling a ball starting at the top of the ramp.</p>,
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
            arrow: <div className="arrow-to-hill-slider"/>,
            body: <p>We can change the height of the hill here.</p>,
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
