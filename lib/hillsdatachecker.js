var DataChecker = require('./datachecker.jsx');
var util = require('./util');

module.exports = hillsDataChecker;

var _initialText = "Do an experiment to see if you can figure out whether a ball rolling over the hill ends up going more slowly, and let me know when you're done!";

var _hypotheses = [
    {
        name: "same",
        buttonText: "The speed does not depend on the size of the hill.",
        text: "that the speed will not depend on the size of the hill",
    },
    {
        name: "faster",
        buttonText: "The ball comes out faster if the hill is larger.",
        text: "that the ball will come out faster if the hill is larger",
    },
    {
        name: "slower",
        buttonText: "The ball comes out slower if the hill is larger.",
        text: "that the ball will come out slower if the hill is larger",
    },
    {
        name: "complicated",
        buttonText: "There is a more complicated relationship between the ball speed and the hill size.",
        text: "that there will be a more complicated relationship between the ball speed and the hill size",
    },
]

function hillsDataChecker(container, logBook, hypothesis) {
    return React.renderComponent(DataChecker({
        initialText: _initialText,
        initialHypothesis: hypothesis,
        possibleHypotheses: _hypotheses,
        result: function (state) {return _result(logBook, state);},
    }), container);
}

function _result(logBook, state) {
    var cleanedData = {}
    for (var name in logBook.data) {
        if (logBook.data[name]) {
            var height = name.slice(0, -3); // remove " cm"
            cleanedData[height] = logBook.data[name];
        }
    }
    // check that they have enough data: at least 3 points each in at least 4
    // hill sizes, including one less than 50cm and one greater than 100cm.
    if (_.size(cleanedData) < 4) {
        return "You only have data for a few possible hills!  Make sure you have data on a number of possible hills so you know your results apply to any hill size.";
    } else if (_.filter(cleanedData, function (data, height) {return data.length >= 3;}).length < 4) {
        return "You only have a little bit of data for some of those possible hills.  Make sure you have several data points on a number of possible hills so you know your results apply to any hill size.";
    } else if (_.max(_.map(_.keys(cleanedData), parseInt)) <= 100) {
        return "You don't have any data for large hills!  Try collecting some data on large hills to make sure your results apply to them.";
    } else if (_.min(_.map(_.keys(cleanedData), parseInt)) >= 50) {
        return "You don't have any data for small hills!  Try collecting some data on small hills to make sure your results apply to them.";
    }

    // check that they don't have big outliers in any of their columns.
    var avgs = {}
    for (var height in cleanedData) {
        avgs[height] = util.avg(cleanedData[height]);
        if (_.any(cleanedData[height], function (datum) {return Math.abs(avgs[height] - parseInt(datum)) > 300;})) {
            return "One of your results for "+height+" cm looks a bit off!  Try collecting some more data to make sure it's a fluke."
        }
    }

    // check that their results are consistent with their hypothesis, and that
    // their hypothesis is correct.
    var transposed = _.zip.apply(_.pairs(avgs));
    var correlation = util.correlation(_.map(transposed[0], parseInt), transposed[1]);
    if (
            (state.hypothesis === "same"
                && Math.abs(_.max(_.values(avgs)) - _.min(_.values(avgs))) > 100)
            || (state.hypothesis === "faster"
                && correlation > -0.5) // negative correlation would be taller => shorter time => faster
            || (state.hypothesis === "slower"
                && correlation < 0.5)) {
        return "Those results don't look very consistent with your hypothesis.  It's fine if your hypothesis was disproven, that's how science works!";
    } else if (state.hypothesis === "complicated") {
        return "If you can't find a relationship between the height of the hill and the speed of the ball coming out, try collecting more data to see if you can find a pattern!  Make sure you're dropping the ball from a consistent height so that doesn't affect your results.";
    } else if (
            state.hypothesis !== "same"
            || _.max(_.values(avgs)) > 200
            || _.min(_.values(avgs)) < 140) {
        return "Those results are consistent, but they don't look quite right to me.  Make sure you're dropping the balls gently from the top of the ramp each time.";
    } else {
        return null;
    }
}
