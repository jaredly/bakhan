/** @jsx React.DOM */

var PT = React.PropTypes
var cx = React.addons.classSet

var Step = React.createClass({
    propTypes: {
        title: PT.string,
        body: PT.string,
        next: PT.string,
        onRender: PT.func,
    },

    getDefaultProps: function () {
        return {
            style: 'white'
        }
    },

    componentDidMount: function () {
        if (this.props.onRender) {
            this.props.onRender()
        }
    },

    componentDidUpdate: function (prevProps) {
        if (prevProps.onRender !== this.props.onRender &&
            this.props.onRender) {
                this.props.onRender()
        }
    },

    render: function () {
        return <div className={cx({
            "walkthrough": true,
            "walkthrough--white": this.props.style === 'white',
            "walkthrough--black": this.props.style === 'black'
        })}>
            <div className="walkthrough_step">
                <div className="walkthrough_title">{this.props.title}</div>
                <div className="walkthrough_body">
                    {this.props.body}
                </div>
                {this.props.next &&
                    <button onClick={this.props.onNext}
                        className="walkthrough_next">
                        {this.props.next}
                    </button>}
            </div>
        </div>
    }
})

module.exports = Step
