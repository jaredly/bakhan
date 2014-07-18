module.exports = PlayPause;

function PlayPause(container) {
    this._attach(container);
}

PlayPause.prototype.createButton = function(action, handler) {
    var a = document.createElement("a");
    a.href = "#" + action;
    a.innerHTML = action;
    a.addEventListener("click", function (event) {
        handler();
        event.preventDefault();
    }.bind(this));
    return a;
}

PlayPause.prototype._attach = function(container) {
    this.pauseSymbol = "▐▐";
    this.playSymbol = "▶";
    this.button = this.createButton(this.pauseSymbol, this.toggle.bind(this));
    this.running = true;
    var widget = document.createElement("div");
    widget.className = "playpause";
    widget.appendChild(this.button);
    container.appendChild(widget);
}

PlayPause.prototype.toggle = function() {
    if (this.running) {
        this.button.innerHTML = this.playSymbol;
        this.button.href = '#' + this.playSymbol;
        this.running = false;
        Physics.util.ticker.stop();
    } else {
        this.button.innerHTML = this.pauseSymbol;
        this.button.href = '#' + this.pauseSymbol;
        this.running = true;
        Physics.util.ticker.start();
    }
}


