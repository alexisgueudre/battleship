/*jslint browser this */
/*global _, player */
(function (global) {
    "use strict";
    var computer = _.assign({}, player, {
        grid: [],
        tries: [],
        fleet: [],
        game: null,
        play: function() {
            var self = this;
            setTimeout(function () {
                var x = Math.floor(Math.random() * 10);
                var y = Math.floor(Math.random() * 10);
                self.game.fire(this, x, y, function(hasSucced) {
                    self.tries[y][x] = (self.tries[y][x] !== false && self.tries[y][x] !== true) ? hasSucced : self.tries[y][x];
                });
            }, 1000);
        },
        areShipsOk: function(callback) {
            this.fleet.forEach(function (ship, index) {
                this.activeShip = index;
                var y = Math.floor(Math.random() * 10);
                var x = Math.floor(Math.random() * 10);
                var rotate = Math.floor(Math.random() * 2);
                (rotate == 1) ? ship.dom.setAttribute("class", "transform") : null;
                this.setComputerShipsPositions(ship, index, x, y);
            }, this);
            setTimeout(function() {
                callback();
            }, 500);
        },
        setComputerShipsPositions: function(ship, index, x, y) {
            var i = 0;
            var newX = 0;
            var newY = 0;
            if(this.checkPosition(ship, x, y)) {
                this.setComputerShipsPositions(ship, index, Math.floor(Math.random() * 10), Math.floor(Math.random() * 10));
            } else {
                if(ship.dom.classList.contains("transform")) {
                    (index == 0 || index == 1 || index == 2) ? newY = y - 2 : (index == 3) ? newY = y - 1 : newY = y;
                    while(i < ship.life) {
                        this.grid[newY + i][x] = ship.getId();
                        i++;
                    };
                } else {
                    (index == 0 || index == 1 || index == 2) ? newX = x - 2 : (index == 3) ? newX = x - 1 : newX = x;
                    while(i < ship.life) {
                        this.grid[y][newX + i] = ship.getId();
                        i++;
                    };
                };
                this.shipPosition[this.activeShip].x = x;
                this.shipPosition[this.activeShip].y = y;
                this.shipPosition[this.activeShip].r = (ship.dom.classList.contains("transform")) ? true : false;
            };
            return true
        }
    });
    global.computer = computer;
}(this));