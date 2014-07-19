module.exports = {
    makeRect: makeRect,
    makeRock: makeRock,
    sum: sum,
    avg: avg
}

function sum(numbers) {
    if (!numbers.length) return 0;
    return numbers.reduce(function (a, b) {return a + b})
}

function avg(numbers) {
    if (!numbers.length) return 0;
    return sum(numbers) / numbers.length
}

function makeRect(x, y, width, height) {
    return [
        {x: x - width/2, y: y - height/2},
        {x: x + width/2, y: y - height/2},
        {x: x + width/2, y: y + height/2},
        {x: x - width/2, y: y + height/2},
    ]
}

// Not a convex hull :(
function makeRock(radius, deviation, resolution) {
    var resolution = resolution || 32
    var deviation = deviation || 10
    var points = []
    for (var i = 0; i < resolution; i++) {
        var ang = i / resolution * 2 * Math.PI;
        var point = { x: radius * Math.cos(ang), y: radius * Math.sin(ang) }
        point.x += (Math.random()) * 2 * deviation
        point.y += (Math.random()) * 2 * deviation
        points.push(point)
    }
    return points
}
