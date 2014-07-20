/** @jsx React.DOM */

var DropDataChecker = React.createClass({
    // props: logBook, world
    getInitialState: function () {
        return {
            thisResult: "Do an experiment to see if you can figure out which ball falls faster, and let me know when you're done!",
            prevResult: '',
            hypothesis: this.props.initialHypothesis, // will eventually be set when they finish the walkthrough.  it can be "bowling", "tennis", or "same"
            disproven: false,
        };
    },

    render: function () {
        var prettyHypothesis = <p className="checker_your-hypo"><em>Your hypothesis was {this.prettyHypothesis()}.</em></p>;
        if (this.state.disproven) {
            var bowlingButton = <button className="btn btn-default" onClick={this.bowling}>The bowling ball falls faster.</button>
            var tennisButton = <button className="btn btn-default" onClick={this.tennis}>The tennis ball falls faster.</button>
            var sameButton = <button className="btn btn-default" onClick={this.same}>Both balls fall at the same rate.</button>
            if (this.state.hypothesis === 'bowling') {
                bowlingButton = <div/>
            } else if (this.state.hypothesis === 'tennis') {
                tennisButton = <div/>
            } else if (this.state.hypothesis === 'same') {
                sameButton = <div/>
            }
            return <div className="checker">
                {prettyHypothesis}
                <img src="images/sir-francis.jpeg" className="checker_francis"/>
                <div className="checker_main">
                    <p>Okay, which result do they support?</p>
                    {bowlingButton}{tennisButton}{sameButton}
                </div>
            </div>;
        } else if (this.state.thisResult) {
            return <div className="checker">
                {prettyHypothesis}
                <img src="images/sir-francis.jpeg" className="checker_francis"/>
                <div className="checker_main">
                    <p>{this.state.thisResult}</p>
                    <button className="btn btn-default" onClick={this.support}>The data support my hypothesis.</button>
                    <button className="btn btn-default" onClick={this.disprove}>The data disprove my hypothesis.</button>
                </div>
            </div>;
        } else {
            return <div className="checker">
                {prettyHypothesis}
                <img src="images/sir-francis.jpeg" className="checker_francis"/>
                <div className="checker_main">
                    <p>Your experiment looks great, and I'm convinced.  Here, have some bacon.</p>
                </div>
            </div>;
        }
    },

    prettyHypothesis: function () {
        if (this.state.hypothesis === "same") {
            return "that both balls will fall at the same rate";
        } else {
            return "that the "+this.state.hypothesis+" ball will fall faster";
        }
    },

    result: function () {
        // we return the error, or null if they're correct
        var enoughData = _.all(this.props.logBook.data, function (d) {return d.length >= 5;});
        if (enoughData) {
            var avgs = {}
            var maxDeltas = {}
            for (var name in this.props.logBook.data) {
                avgs[name] = _.reduce(this.props.logBook.data[name],
                    function (a, b) {return a + b;}) / this.props.logBook.data[name].length;
                maxDeltas[name] = _.max(_.map(this.props.logBook.data[name],
                    function (datum) {return Math.abs(datum - avgs[name]);}));
            }
        }
        console.log(this.props.logBook.data, enoughData, avgs, maxDeltas);
        if (!enoughData) {
            return "You haven't filled up your lab notebook!  Make sure you get enough data so you know your results are accurate.";
        } else if (maxDeltas["Bowling Ball"] > 300) {
            return "One of your results for the bowling ball looks pretty far off!  Try getting some more data to make sure it was a fluke.";
        } else if (maxDeltas["Tennis Ball"] > 300) {
            return "One of your results for the tennis ball looks pretty far off!  Try getting some more data to make sure it was a fluke.";
        } else if (
                (this.state.hypothesis === "same"
                    && Math.abs(avgs["Bowling Ball"] - avgs["Tennis Ball"]) > 100)
                || (this.state.hypothesis === "bowling"
                    && avgs["Bowling Ball"] < avgs["Tennis Ball"] + 100)
                || (this.state.hypothesis === "tennis"
                    && avgs["Tennis Ball"] < avgs["Bowling Ball"] + 100)
                ) {
            return "Those results don't look very consistent with your hypothesis.  It's fine if your hypothesis was disproven, that's how science works!";
        } else if (
                this.state.hypothesis !== "same"
                || avgs["Bowling Ball"] < 800
                || avgs["Bowling Ball"] > 1500
                || avgs["Tennis Ball"] < 800
                || avgs["Tennis Ball"] > 1500) {
            return "Those results are consistent, but they don't look quite right to me.  Make sure you're dropping the balls gently from the same height above the top sensor.";
        } else {
            return null;
        }
    },

    support: function () {
        this.askFrancis();
    },

    disprove: function () {
        this.setState({
            disproven: true,
        });
    },

    bowling: function () {
        this.setState({
            disproven: false,
            hypothesis: "bowling",
        }, this.askFrancis);
    },

    tennis: function () {
        this.setState({
            disproven: false,
            hypothesis: "tennis",
        }, this.askFrancis);
    },

    same: function () {
        this.setState({
            disproven: false,
            hypothesis: "same",
        }, this.askFrancis);
    },

    askFrancis: function () {
        this.setState({
            thisResult: this.result(),
            prevResult: this.state.thisResult
        });
    }
})

module.exports = DropDataChecker;
