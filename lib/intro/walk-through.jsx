/** @jsx React.DOM */

var WalkThrough = React.createClass({
    propTypes: {
        steps: React.PropTypes.array.isRequired
    },
    getInitialState: function () {
        return {
            step: 0,
            data: {}
        }
    },
    goTo: function (num) {
        this.setState({step: num})
    },
    setData: function (attr, val) {
        var data = this.state.data
        data[attr] = val
        this.setState({data: data})
    },
    render: function () {
        var Step = this.props.steps[this.state.step]
        return this.transferPropsTo(Step({
            onNext: this.goTo.bind(null, this.state.step + 1),
            setData: this.setData,
            data: this.state.data,
        }))
    }
})

module.exports = WalkThrough

