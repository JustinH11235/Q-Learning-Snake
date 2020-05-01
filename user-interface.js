var UI = (() => {
  var snakeSize = 20;
  var width = 10;
  var height = 10;
  var fps = 500;
  var learningAlgorithm = QLearning;

  var iterations;
  var r1;
  var r2;
  var r3;
  var r4;

  var learningRate;
  var discountFactor;
  var epsilon;

  const score = document.getElementById('score');
  const hscore = document.getElementById('highscore');
  const ratio = document.getElementById('ratio');
  const deaths = document.getElementById('deaths');

  const download = document.getElementById('download');

  const train = document.getElementById('train');
  const test = document.getElementById('test');
  const pauseTest = document.getElementById('pauseTest');
  const newFPS = document.getElementById('newFPS');
  const fpsBtn = document.getElementById('fpsBtn');
  const reset = document.getElementById('reset');

  const iters = document.getElementById('iters');
  const rewardWall = document.getElementById('rewardWall');
  const rewardBody = document.getElementById('rewardBody');
  const rewardApple = document.getElementById('rewardApple');
  const rewardNothing = document.getElementById('rewardNothing');
  const lr = document.getElementById('lr');
  const df = document.getElementById('df');
  const ep = document.getElementById('ep');

  var testPaused = false;
  var timer;
  var highscore = 0;

  train.addEventListener("click", () => {
    train.innerHTML = 'Training...';
    train.disabled = true;
    iterations = parseInt(iters.value.split(',').join(''));
    r1 = parseFloat(rewardWall.value);
    r2 = parseFloat(rewardBody.value);
    r3 = parseFloat(rewardApple.value);
    r4 = parseFloat(rewardNothing.value);
    learningRate = parseFloat(lr.value);
    discountFactor = parseFloat(df.value);
    epsilon = parseFloat(ep.value);
    Game.init(QLearning, snakeSize, width, height, iterations, r1, r2, r3, r4);
    learningAlgorithm.init(learningRate, discountFactor, epsilon);
    setTimeout(trainLoop, 5)
  });

  test.addEventListener("click", () => {
    test.disabled = true;
    pauseTest.disabled = false;
    highscore = 0;
    Game.init(QLearning, snakeSize, width, height, iterations, r1, r2, r3, r4);
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

  function downloadObject(obj, filename) {
    var blob = new Blob([JSON.stringify(obj, null, 2)], {type: "application/json;charset=utf-8"}).slice(2,-1);
    var url = URL.createObjectURL(blob);
    var elem = document.createElement("a");
    elem.href = url;
    elem.download = filename;
    document.body.appendChild(elem);
    elem.click();
    document.body.removeChild(elem);
  }

  function trainLoop() {
    for (let i = 0; i < iterations; ++i) {
      Game.trainLoop();
      QLearning.changeLR(.85 / iterations);
      QLearning.changeDF(.9 / iterations);
      QLearning.changeEpsilon(.5 / iterations);
    }
    train.innerHTML  = 'Trained';
    //QLearning.printQTable();
    test.disabled = false;

    downloadObject(QLearning.getQTable(), download.value + '.json');
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
