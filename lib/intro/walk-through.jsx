/** @jsx React.DOM */

var WalkThrough = React.createClass({
    propTypes: {
        steps: React.PropTypes.array.isRequired,
        onDone: React.PropTypes.func,
        debug: React.PropTypes.bool
    },
    getInitialState: function () {
        return {
            step: 0,
            data: {},
            fading: false
        }
    },
    onFadedOut: function () {
        if (this.state.fading === false) {
            return
        }
        this.goTo(this.state.fading)
    },
    goTo: function (num) {
        if (num >= this.props.steps.length) {
            if (this.props.onDone) {
                this.props.onDone()
            }
            return
        }
        this.setState({step: num, fading: false})
    },
    startGoing: function (num) {
        this.setState({fading: num})
    },
    setData: function (attr, val) {
        var data = _.extend({}, this.state.data)
        data[attr] = val
        this.setState({data: data})
    },
    render: function () {
        var Step = this.props.steps[this.state.step]
        var props = {
            onNext: this.startGoing.bind(null, this.state.step + 1),
            setData: this.setData,
            data: this.state.data,
            fadeOut: this.state.fading !== false,
            onFadedOut: this.onFadedOut,
            debug: this.props.debug
        }
        for (var name in this.props) {
            props[name] = this.props[name]
        }
        return Step(props)
    }
})

module.exports = WalkThrough

