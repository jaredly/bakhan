/** @jsx React.DOM */

var WalkThrough = React.createClass({
    propTypes: {
        steps: React.PropTypes.array.isRequired,
        onDone: React.PropTypes.func,
    },
    getInitialState: function () {
        return {
            step: 0,
            data: {}
        }
    },
    goTo: function (num) {
        if (num >= this.props.steps.length) {
            if (this.props.onDone) {
                this.props.onDone()
            }
            return
        }
        this.setState({step: num})
    },
    setData: function (attr, val) {
        var data = this.state.data
        data[attr] = val
        this.setState({data: data})
    },
    render: function () {
        var Step = this.props.steps[this.state.step]
        var props = {
            onNext: this.goTo.bind(null, this.state.step + 1),
            setData: this.setData,
            data: this.state.data,
        }
        for (var name in this.props) {
            props[name] = this.props[name]
        }
        return Step(props)
    }
})

module.exports = WalkThrough

