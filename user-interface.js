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

  var npm;
  var npo;
  var irap;
  var ifdtw;
  var idrctn;

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

  const trainType = document.getElementById('trainType');
  const train = document.getElementById('train');
  const test = document.getElementById('test');
  const pauseTest = document.getElementById('pauseTest');
  const newFPS = document.getElementById('newFPS');
  const fpsBtn = document.getElementById('fpsBtn');
  const unstick = document.getElementById('unstick');
  const resetTest = document.getElementById('resetTest');

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

  const nbpMain = document.getElementById('nbpMain');
  const ortpMain = document.getElementById('ortpMain');
  const arbpMain = document.getElementById('arbpMain');

  const nbpOther = document.getElementById('nbpOther');
  const ortpOther = document.getElementById('ortpOther');
  const arbpOther = document.getElementById('arbpOther');

  const rap = document.getElementById('rap');
  const fdtw = document.getElementById('fdtw');
  const rdtw = document.getElementById('rdtw');
  const ldtw = document.getElementById('ldtw');
  const drctn = document.getElementById('drctn');

  var testPaused = false;
  var timer;
  var numUnsticks = 0;

  qTableDownloadBtn.addEventListener("click", () => {
    var downloadName = qTableDownload.value ? qTableDownload.value : 'snakeQTable';
    downloadObject(QLearning.getQTable(), 'QTable ' + downloadName + qTableExt.value);
  });

  testReportDownloadBtn.addEventListener("click", () => {
    var downloadName = testReportDownload.value ? testReportDownload.value : 'snakeTestReport';
    downloadObject(Game.getReport(), 'Report ' + downloadName + testReportExt.value);
  });

  train.addEventListener("click", () => {
    if (trainType.value == 'custom') {
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
      othersnaks = parseInt(othersnaks.value);
      appls = parseInt(appls.value);
      npm = nbpMain.checked ? 0 : (ortpMain.checked ? 1 : 2);
      npo = nbpOther.checked ? 0 : (ortpOther.checked ? 1 : 2);
      irap = rap.checked;
      ifdtw = fdtw.checked;
      irdtw = rdtw.checked;
      ildtw = ldtw.checked;
      idrctn = drctn.checked;
      Game.init(QLearning, snakeSize, width, height, othersnaks, appls, iterations, r1, r2, r3, r4, npm, npo, irap, ifdtw, irdtw, ildtw, idrctn);
      learningAlgorithm.init({}, learningRate, discountFactor, epsilon);
      setTimeout(trainLoop, 5)
    } else {
      train.innerHTML = 'Training...';
      train.disabled = true;
      iters.value = '50,000,000';
      iterations = parseInt(iters.value.split(',').join(''));
      rewardWall.value = -1;
      rewardBody.value = -1;
      rewardApple.value = 1;
      rewardNothing.value = -.075;
      r1 = parseFloat(rewardWall.value);
      r2 = parseFloat(rewardBody.value);
      r3 = parseFloat(rewardApple.value);
      r4 = parseFloat(rewardNothing.value);
      lr.value = .85;
      df.value = .9;
      ep.value = .5;
      learningRate = lr.value;
      discountFactor = df.value;
      epsilon = ep.value;
      widt.value = 10;
      heigh.value = 10;
      othersnaks.value = 0;
      appls.value = 1;
      width = widt.value;
      height = heigh.value;
      othersnaks = parseInt(othersnaks.value);
      appls = parseInt(appls.value);
      ortpMain.checked = true;
      nbpOther.checked = true;
      rap.checked = true;
      fdtw.checked = true;
      rdtw.checked = false;
      ldtw.checked = false;
      drctn.checked = true;
      npm = nbpMain.checked ? 0 : (ortpMain.checked ? 1 : 2);
      npo = nbpOther.checked ? 0 : (ortpOther.checked ? 1 : 2);
      irap = rap.checked;
      ifdtw = fdtw.checked;
      irdtw = rdtw.checked;
      ildtw = ldtw.checked;
      idrctn = drctn.checked;
      Game.init(QLearning, snakeSize, width, height, othersnaks, appls, iterations, r1, r2, r3, r4, npm, npo, irap, ifdtw, irdtw, ildtw, idrctn);
      addScript('./preloaded-q-table.json', () => {
        learningAlgorithm.init(preloadedQTable, learningRate, discountFactor, epsilon);
        train.innerHTML  = 'Trained';
        test.disabled = false;
        fpsBtn.disabled = false;
        unstick.disabled = false;
        resetTest.disabled = false;
        qTableDownloadBtn.disabled = false;
      });
    }
  });

  test.addEventListener("click", () => {
    test.disabled = true;
    pauseTest.disabled = false;
    highscore = 0;
    score.style.visibility = 'visible';
    hscore.style.visibility = 'visible';
    ratio.style.visibility = 'visible';
    deaths.style.visibility = 'visible';
    Game.init(QLearning, snakeSize, width, height, othersnaks, appls, iterations, r1, r2, r3, r4, npm, npo, irap, ifdtw, irdtw, ildtw, idrctn);
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

  unstick.addEventListener("click", () => {
    Game.reset();
    numUnsticks++;
  });

  resetTest.addEventListener("click", () => {
    Game.resetTest();
    numUnsticks = 0;
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

  // Include script file
  function addScript(filename, callback) {
    var head = document.getElementsByTagName('head')[0];

    var script = document.createElement('script');
    script.src = filename;
    script.type = 'text/javascript';

    function scriptCallback() {
      callback();
      script.removeEventListener("load", scriptCallback);
    }

    head.append(script);
    script.addEventListener('load', scriptCallback);
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
    unstick.disabled = false;
    resetTest.disabled = false;
    qTableDownloadBtn.disabled = false;
  }

  function testLoop() {
    if (testPaused)
      return;

    Game.testLoop();

    score.innerHTML = 'Score: ' + Game.getScore();
    hscore.innerHTML = 'Highscore: ' + Game.getHighscore();
    ratio.innerHTML = 'Apples/Death: ' + (Game.getDeaths() == 0 ? Game.getApplesEaten() + '.000' : (Game.getApplesEaten() / Game.getDeaths()).toFixed(3));
    deaths.innerHTML = 'Deaths: ' + Game.getDeaths() + '&nbsp&nbsp&nbsp&nbspUnsticks: ' + getNumUnsticks();

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

  var getNumUnsticks = () => {
    return numUnsticks;
  };

  var getIncludeMainSnakeBody = () => {
    return nbpMain.checked ? nbpMain.value : (ortpMain.checked ? ortpMain.value : arbpMain.value);
  };

  var getIncludeOtherSnakesBody = () => {
    return nbpOther.checked ? nbpOther.value : (ortpOther.checked ? ortpOther.value : arbpOther.value);
  };

  var getIncludeRelApplePos = () => {
    return rap.checked;
  };

  var getIncludeDistForward = () => {
    return fdtw.checked;
  };

  var getIncludeDistRight = () => {
    return rdtw.checked;
  };

  var getIncludeDistLeft = () => {
    return ldtw.checked;
  };

  var getIncludeDirection = () => {
    return drctn.checked;
  };

  // Make public methods accessible to QLearning
  return {
    getInitialLearningRate: getInitialLearningRate,
    getInitialDiscountFactor: getInitialDiscountFactor,
    getInitialEpsilon: getInitialEpsilon,
    getNumUnsticks: getNumUnsticks,
    getIncludeMainSnakeBody: getIncludeMainSnakeBody,
    getIncludeOtherSnakesBody: getIncludeOtherSnakesBody,
    getIncludeRelApplePos: getIncludeRelApplePos,
    getIncludeDistForward: getIncludeDistForward,
    getIncludeDistRight: getIncludeDistRight,
    getIncludeDistLeft: getIncludeDistLeft,
    getIncludeDirection: getIncludeDirection
  };






})();
