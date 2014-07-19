
module.exports = LogBook;

function LogBook(world, startGate, endGate, elem, keep, seededColumns) {
    this._attach(world, startGate, endGate, elem, keep, seededColumns);
}

LogBook.prototype._attach = function (world, startGate, endGate, elem, keep, seededColumns) {
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

    this.columnsByBodyName = {};
    this.lastUids = {};
    this.startTimeByBodyName = {};
    this.data = {};
    this.keep = keep;
    this.world = world;
    startGate.on('enter', this.handleStart.bind(this));
    endGate.on('enter', this.handleEnd.bind(this));
    world.on('step', this.handleTick.bind(this));

    if (seededColumns) {
        _.each(seededColumns, function (col) {
            this.addColumn(col.name, col.color);
            for (var i = 0; i < this.keep; i++) {
                this.newTimer(col.name);
            }
        }.bind(this));
    }
}

LogBook.prototype.handleStart = function (data) {
    if (!this.startTimeByBodyName[getName(data.body)]) this.newTimer(getName(data.body));
    this.lastUids[getName(data.body)] = data.body.uid;
    this.startTimeByBodyName[getName(data.body)] = this.world._time;
    this.renderTimer(getName(data.body), 0);
}

LogBook.prototype.handleEnd = function (data) {
    if (getName(data.body) in this.data && this.lastUids[getName(data.body)] == data.body.uid) {
        this.data[getName(data.body)].data.push(
            this.world._time - this.startTimeByBodyName[getName(data.body)]);
        delete this.startTimeByBodyName[getName(data.body)];
    }
}

LogBook.prototype.handleTick = function () {
    newTime = this.world._time;
    $.each(this.startTimeByBodyName, function (name, startTime) {
        this.renderTimer(name, newTime - startTime);
    }.bind(this));
}

LogBook.prototype.addColumn = function (name, color) {
    var column = document.createElement("div");
    column.className = "log-book-column";
    var heading = document.createElement("span");
    heading.className = "log-book-heading";
    heading.innerHTML = name;
    if (color) {
        heading.style.color = color;
    }
    column.appendChild(heading);
    this.bodyContainer.appendChild(column);
    this.columnsByBodyName[name] = column;
    this.data[name] = {'name': name, 'data': []};
}

LogBook.prototype.newTimer = function (name) {
    // just does the DOM setup, doesn't actually start the timer
    if (!this.columnsByBodyName[name]) this.addColumn(name);
    var col = this.columnsByBodyName[name];
    var toRemove = $(col).find(".log-book-datum").slice(0,-this.keep+1);
    toRemove.slideUp(500, function () {toRemove.remove();});
    this.data[name].data = this.data[name].data.slice(-this.keep+1);
    datum = document.createElement("span");
    datum.className = "log-book-datum";
    col.appendChild(datum);
    this.renderTimer(name);
}

LogBook.prototype.renderTimer = function (name, time) {
    var datum = this.columnsByBodyName[name].lastChild;
    if (time) {
        datum.innerHTML = parseFloat(time / 1000).toFixed(2);
    } else {
        datum.innerHTML = "--";
        datum.style.textAlign = "center";
    }
}

function getName(body) {
    return body.displayName || body.name || "body";
}
