define('controller', ['move', 'piece'], function(Move, Piece) {
  function Controller() {
    this.onSpace = this.onSpace.bind(this);
    this.onMessage = this.onMessage.bind(this);

    window.addEventListener('space', this.onSpace);
    this.worker = new Worker('js/worker.js');
    this.worker.onmessage = this.onMessage;
  }

  Controller.prototype = {
    game: null,
    view: null,
    search: null,
    worker: null,

    onSpace: function(event) {
      var board = this.game.board;
      var row = event.detail.row;
      var col = event.detail.col;
      var piece = board[row][col];

      if (piece) {
        this.select(piece);
      } else {
        this.move(row, col);
      }
    },

    move: function(row, col) {
      var game = this.game;
      if (!game.selected) {
        return;
      }

      // Check to see if the move is available.
      var moves = game.moves;
      for (var i = 0; i < moves.length; i++) {
        var move = moves[i];
        if (move.row !== row || move.col !== col) {
          continue;
        }

        game.move(move);
        break;
      }

      this.view.render();

      if (game.player === -1) {
        console.log('Issue computer move...');
        setTimeout(this.computerMove.bind(this), 0);
      }
    },

    select: function(piece) {
      this._select(piece.row, piece.col);
    },

    _select: function(row, col) {
      var game = this.game;
      var piece = game.board[row][col];
      if (piece.player !== game.player) {
        return;
      }

      var selected = game.selected;
      if (selected && selected.equals(piece)) {
        game.select(null);
      } else {
        game.select(row, col);
      }

      return this.view.render();
    },

    computerMove: function() {
      console.log('postMessage to worker...');
      var depthSelect = document.querySelector('.depth-select');
      var depth = depthSelect ? parseInt(depthSelect.value, 10) : 3;
      this.worker.postMessage({ board: this.game.board, _playerToPieces: this.game._playerToPieces, depth: depth });
    },

    onMessage: function(event) {
      var msg = event.data;
      switch (msg.type) {
        case 'debug':
          console.log(msg.msg);
          break;
        case 'move':
          var move = new Move({
            captures: msg.move.captures,
            col: msg.move.col,
            jump: msg.move.jump,
            row: msg.move.row,
            start: new Piece({
              player: msg.move.start.player,
              king: msg.move.start.king,
              row: msg.move.start.row,
              col: msg.move.start.col,
              dead: false
            })
          });

          console.log('Received worker move ' + JSON.stringify(move));

          this.select(move.start);
          setTimeout(this.move.bind(this, move.row, move.col), 1000);
          break;
      }
    }
  };

  return Controller;
});
