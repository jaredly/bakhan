/** @jsx React.DOM */

var DropDataChecker = React.createClass({
    // props: logBook, world
    getInitialState: function () {
        return {
            thisResult: '',
            prevResult: '',
        };
    },

    render: function () {
        return <div>{this.state.thisResult}<a onClick={this.update}>force update</a></div>;
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
        } else if (Math.abs(avgs["Bowling Ball"] - avgs["Tennis Ball"]) > 100) {
            return "Those results don't look very close together!  Make sure you're dropping both balls from the same height.";
        } else if (maxDeltas["Bowling Ball"] > 300) {
            return "One of your results for the bowling ball looks pretty far off!  Try getting some more data to make sure it was a fluke.";
        } else if (maxDeltas["Tennis Ball"] > 300) {
            return "One of your results for the tennis ball looks pretty far off!  Try getting some more data to make sure it was a fluke.";
        } else if (
                avgs["Bowling Ball"] < 700
                || avgs["Bowling Ball"] > 1500
                || avgs["Bowling Ball"] < 700
                || avgs["Bowling Ball"] > 1500) {
            return "Those results are consistent, but they don't look quite right.  Make sure you're dropping the balls gently from above the top sensor.";
        } else {
            return null;
        }
    },

    update: function () {
        this.setState({
            thisResult: this.result(),
            prevResult: this.state.thisResult
        });
    }
})

module.exports = DropDataChecker;
