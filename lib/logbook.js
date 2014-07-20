
var util = require('./util');

module.exports = LogBook;

function LogBook(world, elem, keep, seededColumns, hideAvg) {
    this._attach(world, elem, keep, seededColumns, hideAvg);
}

LogBook.prototype._attach = function (world, elem, keep, seededColumns, hideAvg) {
    container = document.createElement("div");
    container.className = "log-book";
    elem.appendChild(container);
    header = document.createElement("span");
    header.className = "log-book-header";
    header.innerHTML = "Log Book";
    container.appendChild(header);
    bodyContainer = document.createElement("div");
    bodyContainer.className = "log-book-body";
    container.appendChild(bodyContainer);
    this.bodyContainer = bodyContainer;
    this.hideAvg = hideAvg;

    this.columnsByBodyName = {};
    this.lastUids = {};
    this.startTimeByBodyName = {};
    this.data = {};
    this.keep = keep;
    this.world = world;
    world.on('step', this.handleTick.bind(this));

    if (seededColumns) {
        _.each(seededColumns, function (col) {
            this.addColumn(col.name, col.extraText, col.color);
        }.bind(this));
    }
}

LogBook.prototype.handleStart = function(colName, uid) {
    if (!this.startTimeByBodyName[colName]) {
        this.newTimer(colName);
    }
    this.lastUids[colName] = uid;
    this.startTimeByBodyName[colName] = this.world._time;
    this.renderTimer(colName, 0);
}

LogBook.prototype.handleEnd = function(colName, uid) {
    if (colName in this.data &&
            this.lastUids[colName] == uid) {
        this.data[colName].push(
            this.world._time - this.startTimeByBodyName[colName]);
        delete this.startTimeByBodyName[colName];
        delete this.lastUids[colName];
        if (!this.hideAvg) {
            var avg = clean(util.avg(this.data[colName]));
            $(this.columnsByBodyName[colName])
                .find('.log-book-avg').text('Avg: ' + avg);
        }
    }
}

LogBook.prototype.handleTick = function () {
    newTime = this.world._time;
    $.each(this.startTimeByBodyName, function (name, startTime) {
        this.renderTimer(name, newTime - startTime);
    }.bind(this));
}

LogBook.prototype.addColumn = function (name, extraText, color) {
    extraText = extraText || "";
    var column = document.createElement("div");
    column.className = "log-book-column";
    var heading = document.createElement("span");
    heading.className = "log-book-heading";
    heading.innerHTML = name + extraText;
    /** Disabling until we find something that looks great
    if (color) {
        heading.style.backgroundColor = color;
    }
    */
    column.appendChild(heading);
    if (!this.hideAvg) {
        var average = document.createElement("div");
        average.className = 'log-book-avg';
        average.innerHTML = '--';
        column.appendChild(average);
    }
    this.insertColumn(name, column); // will insert it at the right point.
    this.columnsByBodyName[name] = column;
    this.data[name] = [];
    // seed the column with blanks
    for (var i = 0; i < this.keep; i++) {
        this.newTimer(name);
    }
}

LogBook.prototype.insertColumn = function (name, column) {
    // insert the column in order.  this is a bit arbitrary since we don't know
    // what the sort order should really be, so we just put strings without
    // numbers, then strings that start with a number.
    var keyfn = function (name) {
        // if the name starts with a number, sort by that, then the full name.
        // otherwise, put it after numbers, and sort by the full name.
        var num = parseInt(name);
        if (isNaN(num)) {
            num = Infinity;
        }
        return [num, name];
    }
    var inserted = false;
    $(this.bodyContainer).find(".log-book-heading").each(function (i, span) {
        var k1 = keyfn(name);
        var k2 = keyfn($(span).html());
        if (k1[0] < k2[0] || (k1[0] == k2[0] && k1[1] < k2[1])) {
            $(span).parent().before(column);
            console.log(span);
            inserted = true;
            return false; //break
        }
    });
    if (!inserted) {
        // if it's the biggest, put it at the end.
        this.bodyContainer.appendChild(column);
        console.log(this.bodyContainer);
    }
}

LogBook.prototype.newTimer = function(name) {
    // just does the DOM setup, doesn't actually start the timer
    if (!this.columnsByBodyName[name]) {
        this.addColumn(name);
    }
    var col = this.columnsByBodyName[name];
    var toRemove = $(col).find(".log-book-datum").slice(0,-this.keep+1);
    toRemove.slideUp(500, function () {toRemove.remove();});
    this.data[name] = this.data[name].slice(-this.keep+1);
    var datum = document.createElement("span");
    datum.className = "log-book-datum";

    if (!this.hideAvg) {
        var avg = clean(util.avg(this.data[name]));
        $(col).find('.log-book-avg').text('Avg: ' + avg);
    }

    col.appendChild(datum);
    this.renderTimer(name);
}

function clean(time) {
    return parseFloat(time / 1000).toFixed(2) + 's';
}

LogBook.prototype.renderTimer = function (name, time) {
    var datum = this.columnsByBodyName[name].lastChild;
    if (time) {
        datum.innerHTML = clean(time);
    } else {
        datum.innerHTML = "--";
        datum.style.textAlign = "center";
    }
}
