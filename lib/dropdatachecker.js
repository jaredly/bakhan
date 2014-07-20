/** @jsx React.DOM */

var DataChecker = require('./datachecker.jsx');

module.exports = dropDataChecker;

var _initialText = "Do an experiment to see if you can figure out which ball falls faster, and let me know when you're done!";

var _hypotheses = [
    {
        name: "bowling",
        buttonText: "The bowling ball falls faster.",
        text: "that the bowling ball will fall faster",
    },
    {
        name: "tennis",
        buttonText: "The tennis ball falls faster.",
        text: "that the tennis ball will fall faster",
    },
    {
        name: "same",
        buttonText: "Both balls fall at the same rate.",
        text: "that both balls will fall at the same rate",
    },
];
    

function dropDataChecker(container, logBook, hypothesis) {
    return React.renderComponent(DropDataChecker({
        initialText: _initialText,
        initialHypothesis: hypothesis,
        possibleHypotheses: _hypotheses,
        result: function (state) {return _result(logBook, state);},
    }), container);
}

function _result(logBook, state) {
    // we return the error, or null if they're correct
    var enoughData = _.all(logBook.data, function (d) {return d.length >= 5;});
    if (enoughData) {
        var avgs = {}
        var maxDeltas = {}
        for (var name in logBook.data) {
            avgs[name] = _.reduce(logBook.data[name],
                function (a, b) {return a + b;}) / logBook.data[name].length;
            maxDeltas[name] = _.max(_.map(logBook.data[name],
                function (datum) {return Math.abs(datum - avgs[name]);}));
        }
    }
    console.log(logBook.data, enoughData, avgs, maxDeltas);
    if (!enoughData) {
        return "You haven't filled up your lab notebook!  Make sure you get enough data so you know your results are accurate.";
    } else if (maxDeltas["Bowling Ball"] > 300) {
        return "One of your results for the bowling ball looks pretty far off!  Try getting some more data to make sure it was a fluke.";
    } else if (maxDeltas["Tennis Ball"] > 300) {
        return "One of your results for the tennis ball looks pretty far off!  Try getting some more data to make sure it was a fluke.";
    } else if (
            (state.hypothesis === "same"
                && Math.abs(avgs["Bowling Ball"] - avgs["Tennis Ball"]) > 100)
            || (state.hypothesis === "bowling"
                && avgs["Bowling Ball"] < avgs["Tennis Ball"] + 100)
            || (state.hypothesis === "tennis"
                && avgs["Tennis Ball"] < avgs["Bowling Ball"] + 100)
            ) {
        return "Those results don't look very consistent with your hypothesis.  It's fine if your hypothesis was disproven, that's how science works!";
    } else if (
            state.hypothesis !== "same"
            || avgs["Bowling Ball"] < 800
            || avgs["Bowling Ball"] > 1500
            || avgs["Tennis Ball"] < 800
            || avgs["Tennis Ball"] > 1500) {
        return "Those results are consistent, but they don't look quite right to me.  Make sure you're dropping the balls gently from the same height above the top sensor.";
    } else {
        return null;
    }
}
