(function() {
  requirejs.config({
    baseUrl: 'js'
  });

  requirejs([
    'controller',
    'game',
    'view'
  ], function(Controller, Game, View) {
    var game = new Game();
    game.init();
    var view = new View();
    view.game = game;
    var controller = new Controller();
    controller.game = game;
    controller.view = view;

    function resizeBoard() {
      var canvas = document.querySelector('.board');
      var difficulty = document.querySelector('.difficulty');
      var barHeight = difficulty ? difficulty.offsetHeight : 0;
      var size = Math.min(window.innerWidth, window.innerHeight - barHeight);
      canvas.width = size;
      canvas.height = size;
      canvas.style.width = size + 'px';
      canvas.style.height = size + 'px';
    }

    resizeBoard();
    view.render();
    window.addEventListener('resize', function() {
      resizeBoard();
      view.render();
    });
  });
})();
