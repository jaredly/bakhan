
module.exports = LogBook;

function LogBook(world, startGate, endGate, elem, keep) {
    this._attach(world, startGate, endGate, elem, keep);
}

LogBook.prototype._attach = function (world, startGate, endGate, elem, keep) {
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
}

LogBook.prototype.handleStart = function (data) {
    if (!this.startTimeByBodyName[getName(data.body)]) this.newTimer(data.body);
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

LogBook.prototype.addColumn = function (body) {
    var column = document.createElement("div");
    column.className = "log-book-column";
    var heading = document.createElement("span");
    heading.className = "log-book-heading";
    heading.innerHTML = getName(body);
    if (body.styles.fillStyle) {
        heading.style.color = body.styles.fillStyle;
    }
    column.appendChild(heading);
    this.bodyContainer.appendChild(column);
    this.columnsByBodyName[getName(body)] = column;
    this.data[getName(body)] = {'body': body, 'name': getName(body), 'data': []};
}

LogBook.prototype.newTimer = function (body) {
    // just does the DOM setup, doesn't actually start the timer
    if (!this.columnsByBodyName[getName(body)]) this.addColumn(body);
    var col = this.columnsByBodyName[getName(body)];
    var toRemove = $(col).find(".log-book-datum").slice(0,-this.keep+1);
    toRemove.slideUp(500, function () {toRemove.remove();});
    this.data[getName(body)].data = this.data[getName(body)].data.slice(-this.keep+1);
    datum = document.createElement("span");
    datum.className = "log-book-datum";
    col.appendChild(datum);
}

LogBook.prototype.renderTimer = function (name, time) {
    this.columnsByBodyName[name].lastChild.innerHTML = parseFloat(time / 1000).toFixed(2);
}

function getName(body) {
    return body.displayName || body.name || "body";
}
