/** @jsx React.DOM */

var DataChecker = React.createClass({
    propTypes: {
        logBook: React.PropTypes.object.isRequired,
        initialText: React.PropTypes.string.isRequired,
        initialHypothesis: React.PropTypes.string.isRequired,
        possibleHypotheses: React.PropTypes.arrayOf(React.PropTypes.shape({
            name: React.PropTypes.string.isRequired,
            buttonText: React.PropTypes.string.isRequired, // the text on the button to change your hypothesis
            text: React.PropTypes.string.isRequired, // "Your hypothesis was <text>."
        })).isRequired,
        result: React.PropTypes.func.isRequired, // takes in a logbook, and returns an error string for francis to say, or null if there are no problems with the experiment.
    },

    getInitialState: function () {
        return {
            thisResult: this.props.initialText,
            prevResult: '',
            hypothesis: this.props.initialHypothesis, // a hypothesis.name
            disproven: false,
        };
    },

    renderHypothesis: function () {
        var hypText = _.findWhere(this.props.possibleHypotheses, {name: this.state.hypothesis}).text
        return <p className="checker_your-hypo">
            <em>Your hypothesis was {hypText}.</em>
        </p>
    }

    render: function () {
        if (this.state.disproven) {
            var buttons = _.map(
                _.filter(
                    this.props.possibleHypotheses,
                    function (hyp) {
                        return (this.state.hypothesis !== hyp.name);
                    }),
                function (hyp) {
                    return <button key={hyp.name} className="btn btn-default" onClick={function () {this.changeHypothesis(hyp.name)}}>{hyp.buttonText}</button>;
                });

            return <div className="checker">
                {this.renderHypothesis()}
                <img src="images/sir-francis.jpeg" className="checker_francis"/>
                <div className="checker_main">
                    <p>Okay, which result do they support?</p>
                    {buttons}
                </div>
            </div>;
        } else if (this.state.thisResult) {
            return <div className="checker">
                {this.renderHypothesis()}
                <img src="images/sir-francis.jpeg" className="checker_francis"/>
                <div className="checker_main">
                    <p>{this.state.thisResult}</p>
                    <button className="btn btn-default" onClick={this.support}>The data support my hypothesis.</button>
                    <button className="btn btn-default" onClick={this.disprove}>The data disprove my hypothesis.</button>
                </div>
            </div>;
        } else {
            return <div className="checker">
                {this.renderHypothesis()}
                <img src="images/sir-francis.jpeg" className="checker_francis"/>
                <div className="checker_main">
                    <p>Your experiment looks great, and I'm convinced.  Here, have some bacon.</p>
                </div>
            </div>;
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

    changeHypothesis: function (hyp) {
        this.setState({
            disproven: false,
            hypothesis: hyp.name,
        }, this.askFrancis);
    },

    askFrancis: function () {
        this.setState({
            thisResult: this.result(),
            prevResult: this.state.thisResult
        });
    }
})

module.exports = DataChecker;
