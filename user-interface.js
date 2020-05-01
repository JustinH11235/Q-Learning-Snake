var UI = (() => {
  var snakeSize = 20;
  var width = 10;
  var height = 10;
  var fps = 1000;
  var learningAlgorithm = QLearning;

  var iterations;
  var r1;
  var r2;
  var r3;
  var r4;

  var learningRate;
  var discountFactor;
  var epsilon;

  var allPs;

  const score = document.getElementById('score');
  const hscore = document.getElementById('highscore');
  const ratio = document.getElementById('ratio');
  const deaths = document.getElementById('deaths');

  const qTableDownload = document.getElementById('qTableDownload');
  const qTableExt = document.getElementById('qTableExt');
  const qTableDownloadBtn = document.getElementById('qTableDownloadBtn');
  const testReportDownload = document.getElementById('testReportDownload');
  const testReportExt = document.getElementById('testReportExt');
  const testReportDownloadBtn = document.getElementById('testReportDownloadBtn');

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
  const widt = document.getElementById('widt');
  const heigh = document.getElementById('heigh');

  const aptrue = document.getElementById('true');

  var testPaused = false;
  var timer;
  var numResets = 0;

  qTableDownloadBtn.addEventListener("click", () => {
    var downloadName = qTableDownload.value ? qTableDownload.value : 'snakeQTable';
    downloadObject(QLearning.getQTable(), downloadName + qTableExt.value);
  });

  testReportDownloadBtn.addEventListener("click", () => {
    var downloadName = testReportDownload.value ? testReportDownload.value : 'snakeTestReport';
    downloadObject(Game.getReport(), downloadName + testReportExt.value);
  });

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
    width = parseInt(widt.value);
    height = parseInt(heigh.value);
    allPs = aptrue.checked;
    Game.init(QLearning, snakeSize, width, height, iterations, r1, r2, r3, r4, allPs);
    learningAlgorithm.init(learningRate, discountFactor, epsilon);
    setTimeout(trainLoop, 5)
  });

  test.addEventListener("click", () => {
    test.disabled = true;
    pauseTest.disabled = false;
    highscore = 0;
    score.style.visibility = 'visible';
    hscore.style.visibility = 'visible';
    ratio.style.visibility = 'visible';
    deaths.style.visibility = 'visible';
    Game.init(QLearning, snakeSize, width, height, iterations, r1, r2, r3, r4, allPs);
    learningAlgorithm.changeLR(9999);
    learningAlgorithm.changeDF(9999);
    learningAlgorithm.changeEpsilon(9999);
    testLoop();
  });

  pauseTest.addEventListener("click", () => {
    if (testPaused) {
      testPaused = false;
      pauseTest.innerHTML = "Pause Test"
      testReportDownloadBtn.disabled = true;
      testLoop();
    } else {
      testPaused = true;
      pauseTest.innerHTML = "Unpause Test"
      testReportDownloadBtn.disabled = false;
    }
  });

  fpsBtn.addEventListener("click", () => {
    setFPS(newFPS.value);
  });

  reset.addEventListener("click", () => {
    Game.reset();
    numResets++;
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
    test.disabled = false;
    fpsBtn.disabled = false;
    reset.disabled = false;
    qTableDownloadBtn.disabled = false;
  }

  function testLoop() {
    if (testPaused)
      return;

    Game.testLoop();

    score.innerHTML = 'Score: ' + Game.getScore();
    hscore.innerHTML = 'Highscore: ' + Game.getHighscore();
    // if (Game.getDeaths() == 0) {
    //   ratio.innerHTML = 'Apples/Death: ' + Game.getApplesEaten() + '.000';
    // } else {
    //   ratio.innerHTML = 'Apples/Death: ' + (Game.getApplesEaten() / Game.getDeaths()).toFixed(3);
    // }
    ratio.innerHTML = 'Apples/Death: ' + (Game.getDeaths() == 0 ? Game.getApplesEaten() + '.000' : (Game.getApplesEaten() / Game.getDeaths()).toFixed(3));
    deaths.innerHTML = 'Deaths: ' + Game.getDeaths() + '&nbsp&nbsp&nbsp&nbspResets: ' + getNumResets();

    if (!testPaused) {
      timer = setTimeout(testLoop, 1000 / fps);
    }
  }

  function setFPS(f) {
    fps = f;
  }

  var getInitialLearningRate = () => {
    return learningRate;
  };

  var getInitialDiscountFactor = () => {
    return discountFactor;
  };

  var getInitialEpsilon = () => {
    return epsilon;
  };

  var getNumResets = () => {
    return numResets;
  };

  // Make public methods accessible to QLearning
  return {
    getInitialLearningRate: getInitialLearningRate,
    getInitialDiscountFactor: getInitialDiscountFactor,
    getInitialEpsilon: getInitialEpsilon,
    getNumResets: getNumResets
  };






})();
