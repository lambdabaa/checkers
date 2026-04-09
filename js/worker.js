importScripts('require.js');

(function(global) {
  global.console = {
    log: function(msg) {
      self.postMessage({ type: 'debug', msg: msg });
    }
  };
})(this);

require(['game', 'search', 'clone'], function(Game, Search, clone) {
  var search = new Search();
  self.addEventListener('message', function(event) {
    console.log('Worker received message...');
    var game = new Game();
    game.board = clone(event.data.board);
    game._playerToPieces = event.data._playerToPieces;
    game.player = -1;
    var move = search.search(game, event.data.depth);

    // Possible WebWorker bug DataCloneError: The object could not be cloned.
    move.start = {
      player: -1,
      king: move.start.king,
      row: move.start.row,
      col: move.start.col
    };

    console.log('Worker will send message...');
    self.postMessage({ type: 'move', move: move });
  });
});
