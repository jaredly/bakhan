/** @jsx React.DOM */

var DataChecker = React.createClass({
    propTypes: {
        initialText: React.PropTypes.string.isRequired,
        initialHypothesis: React.PropTypes.string.isRequired,
        possibleHypotheses: React.PropTypes.arrayOf(React.PropTypes.shape({
            name: React.PropTypes.string.isRequired,
            buttonText: React.PropTypes.string.isRequired, // the text on the button to change your hypothesis
            text: React.PropTypes.string.isRequired, // "Your hypothesis was <text>."
        })).isRequired,
        result: React.PropTypes.func.isRequired, // takes in the current state and returns an error string for francis to say, or null if there are no problems with the experiment.
        nextURL: React.PropTypes.string, // the url of the next thing.
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
        var hypText = _.findWhere(
            this.props.possibleHypotheses,
            {name: this.state.hypothesis}).text
        return <p className="checker_your-hypo">
            <em>Your hypothesis is {hypText}.</em>
        </p>
    },

    render: function () {
        if (this.state.disproven) {
            var buttons = _.map(
                _.filter(
                    this.props.possibleHypotheses,
                    function (hyp) {
                        return (this.state.hypothesis !== hyp.name);
                    }.bind(this)),
                function (hyp) {
                    return <button
                            key={hyp.name}
                            className="btn btn-default"
                            onClick={function () {
                                this.changeHypothesis(hyp.name)
                            }.bind(this)}>
                        {hyp.buttonText}
                    </button>;
                }.bind(this));

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
            if (this.props.nextURL) {
                var continuer = <a className="btn btn-default" href={this.props.nextURL}>Thanks!  What's next?</a>;
            } else {
                var continuer = <span/>;
            }
            return <div className="checker">
                {this.renderHypothesis()}
                <img src="images/sir-francis.jpeg" className="checker_francis"/>
                <div className="checker_main">
                    <p>Your experiment looks great, and I'm convinced.  Here, have some bacon.</p>
                    {continuer};
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
            hypothesis: hyp,
        }, this.askFrancis);
    },

    askFrancis: function () {
        this.setState({
            thisResult: this.props.result(this.state),
            prevResult: this.state.thisResult
        });
    }
})

module.exports = DataChecker;
