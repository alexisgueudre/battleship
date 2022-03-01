/*jslint browser this */
/*global _, player, computer, utils */
(function () {
    "use strict";
    var game = {
        PHASE_INIT_PLAYER: "PHASE_INIT_PLAYER",
        PHASE_INIT_OPPONENT: "PHASE_INIT_OPPONENT",
        PHASE_PLAY_PLAYER: "PHASE_PLAY_PLAYER",
        PHASE_PLAY_OPPONENT: "PHASE_PLAY_OPPONENT",
        PHASE_GAME_OVER: "PHASE_GAME_OVER",
        PHASE_WAITING: "waiting",
        currentPhase: "",
        phaseOrder: [],
        // garde une référence vers l'indice du tableau phaseOrder qui correspond à la phase de jeu pour le joueur humain
        playerTurnPhaseIndex: 2,
        // l'interface utilisateur doit-elle être bloquée ?
        waiting: false,
        // garde une référence vers les noeuds correspondant du dom
        grid: null,
        miniGrid: null,
        // liste des joueurs
        players: [],
        // vainqueur
        winner: null,
        // lancement du jeu
        init: function () {
            // initialisation
            this.grid = document.querySelector('.board .main-grid');
            this.miniGrid = document.querySelector('.left .mini-grid');
            // défini l'ordre des phase de jeu
            this.phaseOrder = [
                this.PHASE_INIT_PLAYER,
                this.PHASE_INIT_OPPONENT,
                this.PHASE_PLAY_PLAYER,
                this.PHASE_PLAY_OPPONENT,
                this.PHASE_GAME_OVER
            ];
            this.playerTurnPhaseIndex = 0;
            // initialise les joueurs
            this.setupPlayers();
            // ajoute les écouteur d'événement sur la grille
            this.addListeners();
            // c'est parti !
            this.goNextPhase();
        },
        setupPlayers: function () {
            // donne aux objets player et computer une réference vers l'objet game
            player.setGame(this);
            computer.setGame(this);
            // todo : implémenter le jeu en réseaux
            this.players = [player, computer];
            this.players[0].init();
            this.players[1].init();
        },
        goNextPhase: function () {
            // récupération du numéro d'index de la phase courante
            var ci = this.phaseOrder.indexOf(this.currentPhase);
            var self = this;
            if(ci !== this.phaseOrder.length - 1) {
                this.currentPhase = this.phaseOrder[ci + 1];
            } else {
                this.currentPhase = this.phaseOrder[0];
            };
            switch(this.currentPhase) {
                case this.PHASE_GAME_OVER:
                    // detection de la fin de partie
                    if(!this.gameIsOver()) {
                        // le jeu n'est pas terminé on recommence un tour de jeu
                        this.playerTurnPhaseIndex = 2;
                        this.currentPhase = this.phaseOrder[this.playerTurnPhaseIndex];
                        self.renderMap();
                        utils.info("À vous de jouer, choisissez une case.");
                    } else {
                        let winner = (this.winner == this.players[0]) ? "Vous avez" : (this.winner == this.players[1]) ? "L'IA a" : null;
                        utils.info("Fin de la partie. " + winner + " remporté la bataille.");
                        setTimeout(() => { window.location.reload(); }, 1500)                        
                    };
                    break;
                case this.PHASE_INIT_PLAYER:
                    utils.info("Placez vos bateaux.");
                    break;
                case this.PHASE_INIT_OPPONENT:
                    this.wait();
                    utils.info("En attente de votre adversaire.");
                    this.players[1].areShipsOk(function () {
                        self.stopWaiting();
                        self.goNextPhase();
                    });
                    break;
                case this.PHASE_PLAY_PLAYER:
                    utils.info("À vous de jouer, choisissez une case.");
                    console.log(this.players[0].fleet);
                    console.log(this.players[0].grid);
                    console.log(this.players[1].fleet);
                    console.log(this.players[1].grid);
                    break;
                case this.PHASE_PLAY_OPPONENT:
                    utils.info("À votre adversaire de jouer.");
                    this.players[1].play();
                    break;
            };
        },
        gameIsOver: function () {
            let computerFleet = 0;
            let playerFleet = 0;
            this.players[0].fleet.forEach((ship) => {
                (ship.life == 0) ? playerFleet++ : null;
                if(ship.life == 0) {
                    let getShip = document.querySelector("." + ship.name.toLowerCase());
                    getShip.classList.add("sunk");
                };
            });
            this.players[1].fleet.forEach((ship) => { (ship.life == 0) ? computerFleet++ : null; });
            (computerFleet == 4) ? this.winner = this.players[0] : (playerFleet == 4) ? this.winner = this.players[1] : null;
            return (computerFleet == 4 || playerFleet == 4) ? true : false;
        },
        getPhase: function () {
            if(this.waiting) {
                return this.PHASE_WAITING;
            };
            return this.currentPhase;
        },
        // met le jeu en mode "attente" (les actions joueurs ne doivent pas être pris en compte si le jeu est dans ce mode)
        wait: function () {
            this.waiting = true;
        },
        // met fin au mode mode "attente"
        stopWaiting: function () {
            this.waiting = false;
        },
        addListeners: function () {
            // on ajoute des acouteur uniquement sur la grid (délégation d'événement)
            this.grid.addEventListener('contextmenu',_.bind(this.handleClick, this));
            this.grid.addEventListener('mousemove', _.bind(this.handleMouseMove, this));
            this.grid.addEventListener('click', _.bind(this.handleClick, this));
        },
        handleMouseMove: function (e) {
            // on est dans la phase de placement des bateau
            if (this.getPhase() === this.PHASE_INIT_PLAYER && e.target.classList.contains('cell')) {
                var ship = this.players[0].fleet[this.players[0].activeShip];
                // si on a pas encore affiché (ajouté aux DOM) ce bateau
                if (!ship.dom.parentNode) {
                    this.grid.appendChild(ship.dom);
                    // passage en arrière plan pour ne pas empêcher la capture des événements sur les cellules de la grille
                    ship.dom.style.zIndex = -1;
                };
                // décalage visuelle, le point d'ancrage du curseur est au milieu du bateau
                ship.dom.style.top = "" + (utils.eq(e.target.parentNode)) * utils.CELL_SIZE - (600 + this.players[0].activeShip * 60) - ((this.players[0].activeShip == 2 && ship.dom.classList.contains("transform")) ? 30 : "") + "px";
                ship.dom.style.left = "" + utils.eq(e.target) * utils.CELL_SIZE - Math.floor(ship.getLife() / 2) * utils.CELL_SIZE + ((this.players[0].activeShip == 2 && ship.dom.classList.contains("transform")) ? 30 : "") + "px";
            };
        },
        handleClick: function (e) {
            // self garde une référence vers "this" en cas de changement de scope
            var self = this;
            if(e.button == 2) {
                e.preventDefault();
                let getConfirm = document.querySelector("#confirm");
                var ship = this.players[0].fleet[this.players[0].activeShip];
                if(getConfirm.style.display != "block") {
                    ship.dom.classList.toggle("transform");
                };
            };
            if(e.button == 0) {
                // si on a cliqué sur une cellule (délégation d'événement)
                if(e.target.classList.contains('cell')) {
                    // si on est dans la phase de placement des bateau
                    if(this.getPhase() === this.PHASE_INIT_PLAYER) {
                        // on enregistre la position du bateau, si cela se passe bien (la fonction renvoie true) on continue
                        if(this.players[0].setActiveShipPosition(utils.eq(e.target), utils.eq(e.target.parentNode))) {
                            // et on passe au bateau suivant (si il n'y en plus la fonction retournera false)
                            if(!this.players[0].activateNextShip()) {
                                this.wait();
                                utils.confirm("Confirmez le placement ?", function () {
                                    // si le placement est confirmé
                                    self.stopWaiting();
                                    self.renderMiniMap();
                                    self.players[0].clearPreview();
                                    self.goNextPhase();
                                }, function () {
                                    self.stopWaiting();
                                    // sinon, on efface les bateaux (les positions enregistrées), et on recommence
                                    self.players[0].resetShipPlacement();
                                });
                            };
                        };
                    // si on est dans la phase de jeu (du joueur humain)
                    } else if(this.getPhase() === this.PHASE_PLAY_PLAYER) {
                        this.players[0].play(utils.eq(e.target), utils.eq(e.target.parentNode));
                        let shoot = new Audio("assets/sounds/shoot.mp3");
                        shoot.play();
                    };
                };
            };
        },
        // fonction utlisée par les objets représentant les joueurs (ordinateur ou non)
        // pour placer un tir et obtenir de l'adversaire l'information de réusssite ou non du tir
        fire: function (from, x, y, callback) {
            this.wait();
            var self = this;
            var msg = "";
            // determine qui est l'attaquant et qui est attaqué
            var target = this.players.indexOf(from) === 0 ? this.players[1] : this.players[0];
            if(this.currentPhase === this.PHASE_PLAY_OPPONENT) {
                msg += "Votre adversaire vous a... ";
            };
            // on demande à l'attaqué si il a un bateaux à la position visée
            // le résultat devra être passé en paramètre à la fonction de callback (3e paramètre)
            target.receiveAttack(x, y, function(hasSucceed) {
                if(hasSucceed) {
                    msg += "Touché !";
                    let touched = new Audio("assets/sounds/touched.mp3");
                    if(self.currentPhase === self.PHASE_PLAY_OPPONENT) {
                        var node = self.miniGrid.querySelector('.row:nth-child(' + ( y + 1 ) + ') .cell:nth-child(' + ( x + 1 ) + ')');
                        setTimeout(() => {
                            touched.play();
                            self.renderAnimation(node, "touched");
                        }, 2000);
                    } else {
                        var node = self.grid.querySelector('.row:nth-child(' + ( y + 1 ) + ') .cell:nth-child(' + ( x + 1 ) + ')');
                        setTimeout(() => {
                            touched.play();
                            self.renderAnimation(node, "touched");
                        }, 1000);
                    };
                } else {
                    msg += "Manqué...";
                    let missed = new Audio("assets/sounds/missed.mp3");
                    if(self.currentPhase === self.PHASE_PLAY_OPPONENT) {
                        var node = self.miniGrid.querySelector('.row:nth-child(' + ( y + 1 ) + ') .cell:nth-child(' + ( x + 1 ) + ')');
                        setTimeout(() => {
                            missed.play();
                            self.renderAnimation(node, "missed");
                        }, 2000);
                    } else {
                        var node = self.grid.querySelector('.row:nth-child(' + ( y + 1 ) + ') .cell:nth-child(' + ( x + 1 ) + ')');
                        setTimeout(() => {
                            missed.play();
                            self.renderAnimation(node, "missed");
                        }, 1000);
                    };
                };
                utils.info(msg);
                // on invoque la fonction callback (4e paramètre passé à la méthode fire)
                // pour transmettre à l'attaquant le résultat de l'attaque
                callback(hasSucceed);
                // on fait une petite pause avant de continuer...
                // histoire de laisser le temps au joueur de lire les message affiché
                setTimeout(function () {
                    self.stopWaiting();
                    self.goNextPhase();
                }, 1000);
            });
        },
        renderMap: function () {
            this.players[0].renderTries(this.grid);
            this.players[1].renderTries(this.miniGrid);
        },
        renderMiniMap: function () {
            this.players[0].fleet.forEach((ship) => {
                this.miniGrid.innerHTML += ship.dom.outerHTML;
            });
        },
        renderAnimation: function(node, action) {
            let animation = document.createElement("img");
            if(action == "touched") {
                animation.setAttribute("src", "assets/pictures/fire.gif");
                setTimeout(() => { animation.setAttribute("src", "assets/pictures/fire_after.gif"); }, 1000);
            } else {
                animation.setAttribute("src", "assets/pictures/water.gif");
                setTimeout(() => { animation.remove(); }, 800);
            };
            node.appendChild(animation);
        }
    };
    // point d'entrée
    document.addEventListener('DOMContentLoaded', function () {
        game.init();
    });
}());