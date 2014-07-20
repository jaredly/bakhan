/** @jsx React.DOM */

var PT = React.PropTypes
var cx = React.addons.classSet

var NewAsteroidButton = React.createClass({
    propTypes: {
        onClick: PT.func,
    },

    render: function () {
        var className = cx({
            'asteroid-button': true,
        })

        return <button
            type="button"
            className='new-asteroid-button'
            onClick={this.props.onClick}>New Asteroid</button>
    }
})

module.exports = NewAsteroidButton
