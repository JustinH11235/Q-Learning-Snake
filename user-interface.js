var UI = (() => {
  var snakeSize = 20;
  var width = 10;
  var height = 10;
  var fps = 500;
  var learningAlgorithm = QLearning;
  var iterations = 50000000;
  var learningRate = .85;
  var discountFactor = .9;
  var epsilon = .5;

  const score = document.getElementById('score');
  const hscore = document.getElementById('highscore');
  const ratio = document.getElementById('ratio');
  const deaths = document.getElementById('deaths');

  const train = document.getElementById('train');
  const test = document.getElementById('test');
  const pauseTest = document.getElementById('pauseTest');
  const newFPS = document.getElementById('newFPS');
  const fpsBtn = document.getElementById('fpsBtn');
  const reset = document.getElementById('reset');

  var testPaused = false;
  var timer;
  var highscore = 0;

  train.addEventListener("click", () => {
    train.innerHTML = 'Training...';
    train.disabled = true;
    Game.init(QLearning, snakeSize, width, height, iterations);
    learningAlgorithm.init(learningRate, discountFactor, epsilon);
    setTimeout(trainLoop, 5)
  });

  test.addEventListener("click", () => {
    test.disabled = true;
    pauseTest.disabled = false;
    highscore = 0;
    Game.init(QLearning, snakeSize, width, height, iterations);
    learningAlgorithm.changeLR(9999);
    learningAlgorithm.changeDF(9999);
    learningAlgorithm.changeEpsilon(9999);
    testLoop();
  });

  pauseTest.addEventListener("click", () => {
    if (testPaused) {
      testPaused = false;
      pauseTest.innerHTML = "Pause Test"
      testLoop();
    } else {
      testPaused = true;
      pauseTest.innerHTML = "Unpause Test"
    }
  });

  fpsBtn.addEventListener("click", () => {
    setFPS(newFPS.value);
  });

  reset.addEventListener("click", () => {
    Game.reset();
  });

  function trainLoop() {
    for (let i = 0; i < iterations; i++) {
      Game.trainLoop();
      QLearning.changeLR(.85 / iterations);
      QLearning.changeDF(.9 / iterations);
      QLearning.changeEpsilon(.5 / iterations);
    }
    train.innerHTML  = 'Trained';
    console.log('Printing QTable...');
    //QLearning.printQTable();
    test.disabled = false;
  }

  function testLoop() {
    if (testPaused)
      return;

    Game.testLoop();

    let newScore = Game.getScore();
    score.innerHTML = 'Score: ' + newScore;
    if (newScore > highscore) {
      highscore = newScore;
      hscore.innerHTML = 'Highscore: ' + highscore;
    }
    if (Game.getDeaths() == 0) {
      ratio.innerHTML = 'Apples/Death: ' + Game.getApplesEaten() + '.000';
    } else {
      ratio.innerHTML = 'Apples/Death: ' + (Game.getApplesEaten() / Game.getDeaths()).toFixed(3);
    }
    deaths.innerHTML = 'Deaths: ' + Game.getDeaths();

    if (!testPaused) {
      timer = setTimeout(testLoop, 1000 / fps);
    }
  }

  function setFPS(f) {
    fps = f;
  }

  // Make public methods accessible to QLearning
  return {

  };






})();
