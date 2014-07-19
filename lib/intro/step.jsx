/** @jsx React.DOM */

var PT = React.PropTypes
var cx = React.addons.classSet

var Step = React.createClass({
    propTypes: {
        title: PT.string,
        body: PT.string,
        next: PT.string,
        onRender: PT.func,
        onFadedOut: PT.func,
        fadeOut: PT.bool,
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
        this.getDOMNode().addEventListener('transitionend', function () {
            if (this.props.fadeOut) {
                this.props.onFadedOut()
            }
        }.bind(this))
    },

    componentDidUpdate: function (prevProps) {
        if (prevProps.id !== this.props.id &&
            this.props.onRender) {
                this.props.onRender()
        }
        if (this.props.onUpdate) {
            this.props.onUpdate.call(this, prevProps)
        }
    },

    render: function () {
        var style
        if (this.props.pos) {
            style = {
                marginTop: 0,
                marginLeft: 0,
                top: this.props.pos.top + 'px',
                left: this.props.pos.left + 'px'
            }
        }
        return <div className={cx({
            "walkthrough": true,
            "walkthrough--white": this.props.style === 'white',
            "walkthrough--black": this.props.style === 'black'
        })}>
            <div className={cx({
                "walkthrough_step": true,
                "walkthrough_step--fade-out": this.props.fadeOut
            })} style={style}>
                {this.props.title &&
                    <div className="walkthrough_title">{this.props.title}</div>}
                <div className="walkthrough_body">
                    {this.props.body}
                </div>
                <div className="walkthrough_buttons">
                    {this.props.next &&
                        <button onClick={this.props.onNext}
                            className="walkthrough_next btn btn-default">
                            {this.props.next}
                        </button>}
                </div>
            </div>
        </div>
    }
})

module.exports = Step
