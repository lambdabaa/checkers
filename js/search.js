define('search', ['game', 'node', 'clone'], function(Game, Node, clone) {
  function Search() {
  }

  Search.prototype = {
    search: function(game) {
      console.log('Do search...');
      var tree = buildTree(game);
      console.log('Searching tree with ' + tree.size() + ' nodes...');
      var move = minimax(tree);
      return move;
    }
  };

  function buildTree(game) {
    var node = new Node({
      children: [],
      depth: 0,
      game: game
    });

    var stack = [node];
    while (stack.length > 0) {
      var next = stack.pop();
      if (next.depth > 3) {
        continue;
      }

      // List all of the possible moves.
      var pieces = next.game.playerToPieces(next.game.player);
      var moves = [];
      pieces.forEach(function(piece) {
        next.game.expandMoves(piece).forEach(function(move) {
          move.start = clone(piece);
          moves.push(move);
        });
      });

      // Apply each of the moves.
      var childDepth = next.depth + 1;
      var children = moves.map(function(move) {
        return new Node({
          children: [],
          depth: childDepth,
          game: applyMove(move, next.game),
          move: move
        });
      });

      stack = stack.concat(children);
      next.children = children;
    }

    return node;
  }

  function minimax(node) {
    alphabeta(node, -9007199254740992, 9007199254740992, true);
    var max = -9007199254740992;
    var best = null;
    node.children.forEach(function(childNode) {
      if (childNode.value > max) {
        max = childNode.value;
        best = childNode.move;
      }
    });

    return best;
  }

  function alphabeta(node, alpha, beta, max) {
    if (!node.children || node.children.length === 0) {
      return heuristic(node);
    }

    var value;
    if (max) {
      for (var i = 0; i < node.children.length; i++) {
        var childNode = node.children[i];
        alpha = Math.max(alpha, alphabeta(childNode, alpha, beta, false));
        if (beta <= alpha) {
          break;
        }
      }

      value = alpha;
    } else {
      for (var i = 0; i < node.children.length; i++) {
        var childNode = node.children[i];
        beta = Math.min(beta, alphabeta(childNode, alpha, beta, true));
        if (beta <= alpha) {
          break;
        }
      }

      value = beta;
    }

    node.value = value;
    return value;
  }

  function heuristic(node) {
    /**
     * Number of kings.
     */
    function kingCount(pieces) {
      var count = 0;
      pieces.forEach(function(piece) {
        if (piece.king) {
          count++;
        }
      });

      return count;
    }

    /**
     * Sum of depth of non-king pieces.
     */
    function depthSum(pieces) {
      var sum = 0;
      pieces.forEach(function(piece) {
        if (piece.king) {
          return;
        }

        var row = piece.player === 1 ? piece.row : 7 - piece.row;
        sum += row;
      });

      return sum;
    }

    // Number of pieces we have.
    var ours = node.game.playerToPieces(-1);
    var theirs = node.game.playerToPieces(1);
    var ourKingCount = kingCount(ours);
    var theirKingCount = kingCount(theirs);
    var ourPawnCount = ours.length - ourKingCount;
    var theirPawnCount = theirs.length - theirKingCount;
    var ourDepthSum = depthSum(ours);
    var theirDepthSum = depthSum(theirs);
    if (theirKingCount === 0 && theirPawnCount === 0) {
      return 10000;
    }
    return 10 * (5 * (ourKingCount - theirKingCount) +
                 3 * (ourPawnCount - theirPawnCount)) +
      ourDepthSum - theirDepthSum;
  }

  function applyMove(move, game) {
    var copy = new Game();
    copy.board = clone(game.board);
    copy._cache = clone(game._cache);
    copy._playerToPieces = game._playerToPieces;
    copy.player = game.player;
    copy.select(move.start.row, move.start.col, true);
    copy.move(move);
    return copy;
  }

  return Search;
});
