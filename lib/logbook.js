
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

    this.columnsByBody = {};
    this.startTimeByBody = {};
    this.data = {};
    this.keep = keep;
    this.world = world;
    startGate.on('enter', this.handleStart.bind(this));
    endGate.on('enter', this.handleEnd.bind(this));
    world.on('step', this.handleTick.bind(this));
}

LogBook.prototype.handleStart = function (data) {
    if (!this.startTimeByBody[data.body.uid]) this.newTimer(data.body);
    this.startTimeByBody[data.body.uid] = this.world._time;
    this.renderTimer(data.body.uid, 0);
}

LogBook.prototype.handleEnd = function (data) {
    if (data.body.uid in this.data) {
        this.data[data.body.uid].data.push(
            this.world._time - this.startTimeByBody[data.body.uid]);
        delete this.startTimeByBody[data.body.uid];
    }
}

LogBook.prototype.handleTick = function () {
    newTime = this.world._time;
    $.each(this.startTimeByBody, function (uid, startTime) {
        this.renderTimer(uid, newTime - startTime);
    }.bind(this));
}

LogBook.prototype.addColumn = function (body) {
    var column = document.createElement("div");
    column.className = "log-book-column";
    var heading = document.createElement("span");
    heading.className = "log-book-heading";
    var name =  body.displayName || body.name || "body";
    heading.innerHTML = name;
    if (body.styles.fillStyle) {
        heading.style.color = body.styles.fillStyle;
    }
    column.appendChild(heading);
    this.bodyContainer.appendChild(column);
    this.columnsByBody[body.uid] = column;
    this.data[body.uid] = {'body': body, 'name': name, 'data': []};
}

LogBook.prototype.newTimer = function (body) {
    // just does the DOM setup, doesn't actually start the timer
    if (!this.columnsByBody[body.uid]) this.addColumn(body);
    var col = this.columnsByBody[body.uid];
    var toRemove = $(col).find(".log-book-datum").slice(0,-this.keep+1);
    toRemove.slideUp(500, function () {toRemove.remove();});
    this.data[body.uid].data = this.data[body.uid].data.slice(-this.keep+1);
    datum = document.createElement("span");
    datum.className = "log-book-datum";
    col.appendChild(datum);
}

LogBook.prototype.renderTimer = function (uid, time) {
    this.columnsByBody[uid].lastChild.innerHTML = parseFloat(time / 1000).toFixed(2);
}
