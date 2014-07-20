module.exports = {
    makeRect: makeRect,
    makeRock: makeRock,
    sum: sum,
    avg: avg,
    stdev: stdev,
    correlation: correlation,
}

function sum(numbers) {
    if (!numbers.length) return 0;
    return numbers.reduce(function (a, b) {return a + b})
}

function avg(numbers) {
    if (!numbers.length) return 0;
    return sum(numbers) / numbers.length
}

function stdev(numbers) {
    if (!numbers.length) return 0;
    var a = avg(numbers);
    return Math.sqrt(avg(_.map(numbers, function (num) {return Math.pow(num - a, 2);})))
}

function correlation(data1, data2) {
    if (!data1.length || data1.length != data2.length) return 0;
    var avg1 = avg(data1);
    var avg2 = avg(data2);
    var covariance = avg(_.map(
        _.zip(data1, data2), 
        function (dataPair) {return (dataPair[0] - avg1) * (dataPair[1] - avg2);}));
    return covariance / (stdev(data1) * stdev(data2));
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
