var DataChecker = require('./datachecker.jsx');

module.exports = dropDataChecker;

var _initialText = "Do an experiment to determine how asteroids behave, and let me know when you're done.";

var _hypotheses = [
    {
        name: "faster",
        buttonText: "The asteroids get faster.",
        text: "that the asteroids will get faster",
    },
    {
        name: "slower",
        buttonText: "The asteroids get slower.",
        text: "that the asteroids will get slower",
    },
    {
        name: "same",
        buttonText: "The asteroids stay the same speed.",
        text: "that the asteroids will stay the same speed",
    },
];

function dropDataChecker(container, logBook, hypothesis) {
    return React.renderComponent(DataChecker({
        initialText: _initialText,
        initialHypothesis: hypothesis,
        possibleHypotheses: _hypotheses,
        result: function (state) {return _result(logBook, state);},
    }), container);
}

function _result(logBook, state) {
    // we return the error, or null if they're correct
    var enoughData = _.all(logBook.data, function (d) {return d.length >= 5;});
    var dataIsGood = true;
    for (var i = 0; i < 5; i++) {
        var val1 = logBook.data["Time 1"][i];
        var val2 = logBook.data["Time 2"][i];
        var minVal = Math.min(val1, val2);
        var maxVal = Math.max(val1, val2);
        if (maxVal / minVal > 1.2) {
            dataIsGood = false;
            break;
        }
    }

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
    } else if (state.hypothesis != "same" || !dataIsGood) {
        return "Those results don't look right to me. Make sure you're letting " +
            "the asteroids glide through all three gates without interfering with them."
    } else {
        return null;
    }
}
