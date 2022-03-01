/*jslint browser this */
/*global _, shipFactory, player, utils */
(function (global) {
    "use strict";
    var sheep = {
        dom: {
            parentNode: {
                removeChild: function (element) {
                    element.remove();
                }
            }
        }
    };
    var player = {
        grid: [],
        tries: [],
        fleet: [],
        game: null,
        activeShip: 0,
        shipPosition: [
            {
                x: 0,
                y: 0,
                r: false
            },
            {
                x: 0,
                y: 0,
                r: false
            },
            {
                x: 0,
                y: 0,
                r: false
            },
            {
                x: 0,
                y: 0,
                r: false
            }
        ],
        init: function () {
            // créé la flotte
            this.fleet.push(shipFactory.build(shipFactory.TYPE_BATTLESHIP));
            this.fleet.push(shipFactory.build(shipFactory.TYPE_DESTROYER));
            this.fleet.push(shipFactory.build(shipFactory.TYPE_SUBMARINE));
            this.fleet.push(shipFactory.build(shipFactory.TYPE_SMALL_SHIP));
            // créé les grilles
            this.grid = utils.createGrid(10, 10);
            this.tries = utils.createGrid(10, 10);
        },
        play: function(x, y) {
            // appel la fonction fire du game, et lui passe une calback pour récupérer le résultat du tir
            this.game.fire(this, x, y, _.bind(function (hasSucced) {
                if(this.tries[y][x] !== 0) {
                    this.tries[y][x] = this.tries[y][x];
                    utils.info("Vous avez déjà ciblé cette case.");
                } else {
                    this.tries[y][x] = hasSucced;
                };
            }, this));
        },
        // quand il est attaqué le joueur doit dire si il a un bateaux ou non à l'emplacement choisi par l'adversaire
        receiveAttack: function(x, y, callback) {
            var succeed = false;
            if(this.grid[y][x] !== 0) {
                succeed = true;
                this.fleet.forEach((ship) => { (ship.id == this.grid[y][x]) ? this.shipLife(ship) : null; });
                this.grid[y][x] = 0;
            };
            callback.call(undefined, succeed);
        },
        shipLife: function(ship) {
            ship.life = ship.life - 1;
            (ship.life == 0) ? ship.dom.classList.add("sunk") : null;
            console.log(ship);
        },
        setActiveShipPosition: function (x, y) {
            var ship = this.fleet[this.activeShip];
            var i = 0;
            var newX = 0;
            var newY = 0;
            if(this.checkPosition(ship, x, y)) {
                return false;
            } else {
                if(ship.dom.classList.contains("transform")) {
                    (this.activeShip == 0 || this.activeShip == 1 || this.activeShip == 2) ? newY = y - 2 : (this.activeShip == 3) ? newY = y - 1 : newY = y;
                    while(i < ship.getLife()) {
                        this.grid[newY + i][x] = ship.getId();
                        i++;
                    };
                } else {
                    (this.activeShip == 0 || this.activeShip == 1 || this.activeShip == 2) ? newX = x - 2 : (this.activeShip == 3) ? newX = x - 1 : newX = x;
                    while(i < ship.getLife()) {
                        this.grid[y][newX + i] = ship.getId();
                        i++;
                    };
                };
                this.shipPosition[this.activeShip].x = x;
                this.shipPosition[this.activeShip].y = y;
                this.shipPosition[this.activeShip].r = (ship.dom.classList.contains("transform")) ? true : false;
                return true;
            };
        },
        checkPosition: function(ship, x, y) {
            let check = false;
            // Si bateau rouge ou bleu positionné horizontalement à x <= 1 ou x >= 8
            (this.activeShip <= 1 && !ship.dom.classList.contains("transform") && (x <= 1 || x >= 8)) ? check = true :
            // Si bateau rouge ou bleu positionné verticalement à y <= 1 ou y >= 8
            (this.activeShip <= 1 && ship.dom.classList.contains("transform") && (y <= 1 || y >= 8)) ? check = true :
            // Si bateau vert positionné horizontalement à x <= 1 ou x >= 9
            (this.activeShip == 2 && !ship.dom.classList.contains("transform") && (x <= 1 || x >= 9)) ? check = true :
            // Si bateau vert positionné verticalement à y <= 1 ou y >= 9
            (this.activeShip == 2 && ship.dom.classList.contains("transform") && (y <= 1 || y >= 9)) ? check = true :
            // Si bateau noir positionné horizontalement à x <= 0 ou x >= 9
            (this.activeShip == 3 && !ship.dom.classList.contains("transform") && (x <= 0 || x >= 9)) ? check = true :
            // Si bateau noir positionné verticalement à y <= 0 ou y >= 9
            (this.activeShip == 3 && ship.dom.classList.contains("transform") && (y <= 0 || y >= 9)) ? check = true :
            // Si bateau bleu positionné horizontalement à x >= x - 4 et x <= x + 4 sur le même axe vertical que bateau rouge positionné horizontalement
            (this.activeShip == 1 && !ship.dom.classList.contains("transform") && y == this.shipPosition[this.activeShip - 1].y && (!this.shipPosition[this.activeShip - 1].r && (x >= this.shipPosition[this.activeShip - 1].x - 4 && x <= this.shipPosition[this.activeShip - 1].x + 4))) ? check = true :
            // Si bateau bleu positionné horizontalement à x == x ou x >= x - 2 et x <= x + 2 par rapport à l'axe horizontal du bateau rouge positionné verticalement et que bateau bleu positionné à y == y ou y >= y - 2 et y <= y + 2
            (this.activeShip == 1 && !ship.dom.classList.contains("transform") && (x == this.shipPosition[this.activeShip - 1].x || (x >= this.shipPosition[this.activeShip - 1].x - 2 && x <= this.shipPosition[this.activeShip - 1].x + 2)) && (this.shipPosition[this.activeShip - 1].r && (y >= this.shipPosition[this.activeShip - 1].y - 2 && y <= this.shipPosition[this.activeShip - 1].y + 2))) ? check = true :
            (this.activeShip == 1 && ship.dom.classList.contains("transform") && (y == this.shipPosition[this.activeShip - 1].y || (y >= this.shipPosition[this.activeShip - 1].y - 2 && y <= this.shipPosition[this.activeShip - 1].y + 2)) && (!this.shipPosition[this.activeShip - 1].r && (x >= this.shipPosition[this.activeShip - 1].x - 2 && x <= this.shipPosition[this.activeShip - 1].x + 2))) ? check = true :
            (this.activeShip == 1 && ship.dom.classList.contains("transform") && x == this.shipPosition[this.activeShip - 1].x && (this.shipPosition[this.activeShip - 1].r && (y >= this.shipPosition[this.activeShip - 1].y - 4 && y <= this.shipPosition[this.activeShip - 1].y + 4))) ? check = true :
            (this.activeShip == 2 && !ship.dom.classList.contains("transform") && y == this.shipPosition[this.activeShip - 1].y && (!this.shipPosition[this.activeShip - 1].r && (x >= this.shipPosition[this.activeShip - 1].x - 3 && x <= this.shipPosition[this.activeShip - 1].x + 4))) ? check = true :
            (this.activeShip == 2 && !ship.dom.classList.contains("transform") && (x == this.shipPosition[this.activeShip - 1].x || (x >= this.shipPosition[this.activeShip - 1].x - 1 && x <= this.shipPosition[this.activeShip - 1].x + 2)) && (this.shipPosition[this.activeShip - 1].r && (y >= this.shipPosition[this.activeShip - 1].y - 2 && y <= this.shipPosition[this.activeShip - 1].y + 2))) ? check = true :
            (this.activeShip == 2 && ship.dom.classList.contains("transform") && (y == this.shipPosition[this.activeShip - 1].y || (y >= this.shipPosition[this.activeShip - 1].y - 1 && y <= this.shipPosition[this.activeShip - 1].y + 2)) && (!this.shipPosition[this.activeShip - 1].r && (x >= this.shipPosition[this.activeShip - 1].x - 2 && x <= this.shipPosition[this.activeShip - 1].x + 2))) ? check = true :
            (this.activeShip == 2 && ship.dom.classList.contains("transform") && x == this.shipPosition[this.activeShip - 1].x && (this.shipPosition[this.activeShip - 1].r && (y >= this.shipPosition[this.activeShip - 1].y - 3 && y <= this.shipPosition[this.activeShip - 1].y + 4))) ? check = true :
            (this.activeShip == 2 && !ship.dom.classList.contains("transform") && y == this.shipPosition[this.activeShip - 2].y && (!this.shipPosition[this.activeShip - 2].r && (x >= this.shipPosition[this.activeShip - 2].x - 3 && x <= this.shipPosition[this.activeShip - 2].x + 4))) ? check = true :
            (this.activeShip == 2 && !ship.dom.classList.contains("transform") && (x == this.shipPosition[this.activeShip - 2].x || (x >= this.shipPosition[this.activeShip - 2].x - 1 && x <= this.shipPosition[this.activeShip - 2].x + 2)) && (this.shipPosition[this.activeShip - 2].r && (y >= this.shipPosition[this.activeShip - 2].y - 2 && y <= this.shipPosition[this.activeShip - 2].y + 2))) ? check = true :
            (this.activeShip == 2 && ship.dom.classList.contains("transform") && (y == this.shipPosition[this.activeShip - 2].y || (y >= this.shipPosition[this.activeShip - 2].y - 1 && y <= this.shipPosition[this.activeShip - 2].y + 2)) && (!this.shipPosition[this.activeShip - 2].r && (x >= this.shipPosition[this.activeShip - 2].x - 2 && x <= this.shipPosition[this.activeShip - 2].x + 2))) ? check = true :
            (this.activeShip == 2 && ship.dom.classList.contains("transform") && x == this.shipPosition[this.activeShip - 2].x && (this.shipPosition[this.activeShip - 2].r && (y >= this.shipPosition[this.activeShip - 2].y - 3 && y <= this.shipPosition[this.activeShip - 2].y + 4))) ? check = true :
            (this.activeShip == 3 && !ship.dom.classList.contains("transform") && y == this.shipPosition[this.activeShip - 1].y && (!this.shipPosition[this.activeShip - 1].r && (x >= this.shipPosition[this.activeShip - 1].x - 3 && x <= this.shipPosition[this.activeShip - 1].x + 2))) ? check = true :
            (this.activeShip == 3 && !ship.dom.classList.contains("transform") && (x == this.shipPosition[this.activeShip - 1].x || (x >= this.shipPosition[this.activeShip - 1].x - 1 && x <= this.shipPosition[this.activeShip - 1].x + 1)) && (this.shipPosition[this.activeShip - 1].r && (y >= this.shipPosition[this.activeShip - 1].y - 2 && y <= this.shipPosition[this.activeShip - 1].y + 1))) ? check = true :
            (this.activeShip == 3 && ship.dom.classList.contains("transform") && (y == this.shipPosition[this.activeShip - 1].y || (y >= this.shipPosition[this.activeShip - 1].y - 1 && y <= this.shipPosition[this.activeShip - 1].y + 1)) && (!this.shipPosition[this.activeShip - 1].r && (x >= this.shipPosition[this.activeShip - 1].x - 2 && x <= this.shipPosition[this.activeShip - 1].x + 1))) ? check = true :
            (this.activeShip == 3 && ship.dom.classList.contains("transform") && x == this.shipPosition[this.activeShip - 1].x && (this.shipPosition[this.activeShip - 1].r && (y >= this.shipPosition[this.activeShip - 1].y - 3 && y <= this.shipPosition[this.activeShip - 1].y + 2))) ? check = true :
            (this.activeShip == 3 && !ship.dom.classList.contains("transform") && y == this.shipPosition[this.activeShip - 2].y && (!this.shipPosition[this.activeShip - 2].r && (x >= this.shipPosition[this.activeShip - 2].x - 3 && x <= this.shipPosition[this.activeShip - 2].x + 3))) ? check = true :
            (this.activeShip == 3 && !ship.dom.classList.contains("transform") && (x == this.shipPosition[this.activeShip - 2].x || (x >= this.shipPosition[this.activeShip - 2].x - 1 && x <= this.shipPosition[this.activeShip - 2].x + 1)) && (this.shipPosition[this.activeShip - 2].r && (y >= this.shipPosition[this.activeShip - 2].y - 2 && y <= this.shipPosition[this.activeShip - 2].y + 2))) ? check = true :
            (this.activeShip == 3 && ship.dom.classList.contains("transform") && (y == this.shipPosition[this.activeShip - 2].y || (y >= this.shipPosition[this.activeShip - 2].y - 1 && y <= this.shipPosition[this.activeShip - 2].y + 1)) && (!this.shipPosition[this.activeShip - 2].r && (x >= this.shipPosition[this.activeShip - 2].x - 2 && x <= this.shipPosition[this.activeShip - 2].x + 2))) ? check = true :
            (this.activeShip == 3 && ship.dom.classList.contains("transform") && x == this.shipPosition[this.activeShip - 2].x && (this.shipPosition[this.activeShip - 2].r && (y >= this.shipPosition[this.activeShip - 2].y - 3 && y <= this.shipPosition[this.activeShip - 2].y + 3))) ? check = true :
            (this.activeShip == 3 && !ship.dom.classList.contains("transform") && y == this.shipPosition[this.activeShip - 3].y && (!this.shipPosition[this.activeShip - 3].r && (x >= this.shipPosition[this.activeShip - 3].x - 3 && x <= this.shipPosition[this.activeShip - 3].x + 3))) ? check = true :
            (this.activeShip == 3 && !ship.dom.classList.contains("transform") && (x == this.shipPosition[this.activeShip - 3].x || (x >= this.shipPosition[this.activeShip - 3].x - 1 && x <= this.shipPosition[this.activeShip - 3].x + 1)) && (this.shipPosition[this.activeShip - 3].r && (y >= this.shipPosition[this.activeShip - 3].y - 2 && y <= this.shipPosition[this.activeShip - 3].y + 2))) ? check = true :
            (this.activeShip == 3 && ship.dom.classList.contains("transform") && (y == this.shipPosition[this.activeShip - 3].y || (y >= this.shipPosition[this.activeShip - 3].y - 1 && y <= this.shipPosition[this.activeShip - 3].y + 1)) && (!this.shipPosition[this.activeShip - 3].r && (x >= this.shipPosition[this.activeShip - 3].x - 2 && x <= this.shipPosition[this.activeShip - 3].x + 2))) ? check = true :
            (this.activeShip == 3 && ship.dom.classList.contains("transform") && x == this.shipPosition[this.activeShip - 3].x && (this.shipPosition[this.activeShip - 3].r && (y >= this.shipPosition[this.activeShip - 3].y - 3 && y <= this.shipPosition[this.activeShip - 3].y + 3))) ? check = true : check = false;
            return check;
        },
        clearPreview: function () {
            this.fleet.forEach(function (ship) {
                if(sheep.dom.parentNode) {
                    sheep.dom.parentNode.removeChild(ship.dom);
                };
            });
        },
        resetShipPlacement: function () {
            this.clearPreview();
            this.activeShip = 0;
            this.grid = utils.createGrid(10, 10);
        },
        activateNextShip: function () {
            if(this.activeShip < this.fleet.length - 1) {
                this.activeShip += 1;
                return true;
            } else {
                return false;
            };
        },
        renderTries: function (grid) {
            this.tries.forEach(function (row, rid) {
                row.forEach(function (val, col) {
                    var node = grid.querySelector('.row:nth-child(' + (rid + 1) + ') .cell:nth-child(' + (col + 1) + ')');
                    if(val === true) {
                        node.classList.add("touched");
                    } else if(val === false) {
                        node.classList.add("missed");
                    };
                });
            });
        },
        renderShips: function (grid) {
        },
        setGame: function(object) {
            return this.game = object;
        }
    };
    global.player = player;
}(this));