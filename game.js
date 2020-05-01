var Game = (() => {
  var learningAlgorithm;

  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  const SNAKE_COLOR = '#00FF00';
  const APPLE_COLOR = '#FF0000';
  var snakeSize;
  var width;
  var height;
  var canvasWidth;
  var canvasHeight;

  var snake;
  var apple;
  var score;
  var highscore;
  var applesEaten;
  var deaths;

  var iterations;
  var reward1;
  var reward2;
  var reward3;
  var reward4;

  var allParts;

  var reset = () => {
    snake = newSnake();
    apple = emptyPos();
    score = 0;
    deaths++;
    // QLearning.changeLR(.85 / iterations);
    // QLearning.changeDF(.9 / iterations);
    // QLearning.changeEpsilon(.5 / iterations);
  };

  // Clears canvas
  function clear() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  }

  function randInt(start, end) {
    return start + Math.floor(Math.random() * (end - start));
  }

  function pos(x, y) {
    if (x == undefined || y == undefined) {
      return {x:randInt(0, width),y:randInt(0, height)};
    }
    return {x: x, y: y};
  }

  function emptySpot(x1, y1) {
    for (let i = 0; i < snake.body.length; ++i) {
      if (snake.body[i].x == x1 && snake.body[i].y == y1) {
        return false;
      }
    }
    if (apple != undefined) {
      if (apple.x == x1 && apple.y == y1) {
        return false;
      }
    }
    return true;
  }

  function emptyPos() {
    var curX;
    var curY;
    do {
      curX = randInt(0, width);
      curY = randInt(0, height);
    } while (!emptySpot(curX, curY));
    return {x:curX,y:curY};
  }

  function relPos(pos1, pos2) {
    return JSON.parse(JSON.stringify({x:pos2.x-pos1.x,y:pos2.y-pos1.y}));
  }

  function newSnake() {
    return {
      body: [pos()],
      dir: 'right'
    }
  }

  function moveSnake() {
    switch (snake.dir) {
      case 'right':
        snake.body.push(pos(snake.body[snake.body.length - 1].x + 1, snake.body[snake.body.length - 1].y));
        break;
      case 'left':
        snake.body.push(pos(snake.body[snake.body.length - 1].x - 1, snake.body[snake.body.length - 1].y));
        break;
      case 'down':
        snake.body.push(pos(snake.body[snake.body.length - 1].x, snake.body[snake.body.length - 1].y + 1));
        break;
      case 'up':
        snake.body.push(pos(snake.body[snake.body.length - 1].x, snake.body[snake.body.length - 1].y - 1));
        break;
      default:
        break;
    }
    let headX = snake.body[snake.body.length - 1].x;
    let headY = snake.body[snake.body.length - 1].y;
    // Check if hit wall
    if (headX < 0 || headX >= width || headY < 0 || headY >= height) {
      reset();
      return reward1;
    }
    // Check if hit itself
    for (let i = 0; i < snake.body.length - 1; ++i) {
      if (headX == snake.body[i].x && headY == snake.body[i].y) {
        reset();
        return reward2;
      }
    }

    // Snake is legal

    // Check if apple
    if (apple.x == headX && apple.y == headY) {
      if (++score > highscore) {
        highscore = score;
      }
      renewApple();
      return reward3;
    } else {
      snake.body.shift();
      return reward4;
    }

  }

  function renewApple() {
    apple = emptyPos();
    applesEaten++;
  }

  // Renders snake bodies and apples
  function render() {
    clear();
    ctx.fillStyle = SNAKE_COLOR;
    for (let i = 0; i < snake.body.length; ++i) {
      ctx.fillRect(snakeSize * snake.body[i].x, snakeSize * snake.body[i].y, snakeSize, snakeSize);
    }
    ctx.fillStyle = APPLE_COLOR;
    ctx.fillRect(snakeSize * apple.x, snakeSize * apple.y, snakeSize, snakeSize);
  };

  function curState() {
    let newHeadPos = getHeadPos();
    let tempApple = relPos(newHeadPos, getApplePos());
    let state = tempApple.x + ',' + tempApple.y;
    let bodyPartsConsidered = allParts ? snake.body.length : 1;
    for (let i = 0; i < bodyPartsConsidered; ++i) {
      let newRelPos = relPos(newHeadPos, snake.body[i]);
      state += ',' + newRelPos.x + ',' + newRelPos.y;
    }
    state += ',' + getDistForward() + ',' + getDir();
    return state;
  }

  var getHeadPos = () => {
    let x = snake.body[snake.body.length - 1].x;
    let y = snake.body[snake.body.length - 1].y;
    return pos(x, y);
  };

  var getApplePos = () => {
    let x = apple.x;
    let y = apple.y;
    return pos(x, y);
  };

  var getTailPos = () => {
    let x = snake.body[0].x;
    let y = snake.body[0].y;
    return pos(x, y);
  }

  var getDistForward = () => {
    let headx = snake.body[snake.body.length - 1].x;
    let heady = snake.body[snake.body.length - 1].y;
    switch (snake.dir) {
      case 'right':
        return width - headx;
      case 'left':
        return headx;
      case 'down':
        return height - heady;
      case 'up':
        return heady;
      default:
        return;
    }
  }

  var getDistRight = () => {
    let headx = snake.body[snake.body.length - 1].x;
    let heady = snake.body[snake.body.length - 1].y;
    switch (snake.dir) {
      case 'right':
        return height - heady;
      case 'left':
        return heady;
      case 'down':
        return headx;
      case 'up':
        return width - headx;
      default:
        return;
    }
  }

  var getDistLeft = () => {
    let headx = snake.body[snake.body.length - 1].x;
    let heady = snake.body[snake.body.length - 1].y;
    switch (snake.dir) {
      case 'right':
        return heady;
      case 'left':
        return height - heady;
      case 'down':
        return width - headx;
      case 'up':
        return headx;
      default:
        return;
    }
  }

  var getDir = () => {
    return snake.dir;
  }

  var getScore = () => {
    return score;
  };

  var getHighscore = () => {
    return highscore;
  };

  var getApplesEaten = () => {
    return parseInt(applesEaten);
  };

  var getDeaths = () => {
    return parseInt(deaths);
  };

  // let newScore = Game.getScore();
  // score.innerHTML = 'Score: ' + newScore;
  // if (newScore > highscore) {
  //   highscore = newScore;
  //   hscore.innerHTML = 'Highscore: ' + highscore;
  // }
  // if (Game.getDeaths() == 0) {
  //   ratio.innerHTML = 'Apples/Death: ' + Game.getApplesEaten() + '.000';
  // } else {
  //   ratio.innerHTML = 'Apples/Death: ' + (Game.getApplesEaten() / Game.getDeaths()).toFixed(3);
  // }
  // deaths.innerHTML = 'Deaths: ' + Game.getDeaths();
  //
  // if (!testPaused) {
  //   timer = setTimeout(testLoop, 1000 / fps);
  // }

  var getReport = () => {
    return {
      'SETTINGS': {
        'Iterations': iterations, 'Rewards': {
          'Wall Hit': reward1,
          'Body Hit': reward2,
          'Eat Apple': reward3,
          'Otherwise': reward4
        }, 'Initial Modifiers': {
          'Learning Rate': UI.getInitialLearningRate(),
          'Discount Factor': UI.getInitialDiscountFactor(),
          'Epsilon': UI.getInitialEpsilon()
        }, 'Board': {
          'Width': width,
          'Height': height
        }, 'All Body Parts': allParts
      },
      'REPORT': {
        'Score': getScore(),
        'Highscore': getHighscore(),
        'Apples per Death': (getDeaths() == 0 ? getApplesEaten() : getApplesEaten() / getDeaths()).toFixed(3),
        'Deaths': getDeaths(),
        'Resets': UI.getNumResets()
      }
    };
  };

  var init = (learningAlgorithmp, snakeSizep, widthp, heightp, iterationsp, r1p, r2p, r3p, r4p, allp) => {
    console.log('Game init');
    learningAlgorithm = learningAlgorithmp;
    snakeSize = snakeSizep;
    width = widthp;
    height = heightp;
    canvasWidth = width * snakeSize;
    canvasHeight = height * snakeSize;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    snake = newSnake();
    score = 0;
    highscore = 0;
    apple = emptyPos();
    applesEaten = 0;
    deaths = 0;
    iterations = iterationsp;
    reward1 = r1p;
    reward2 = r2p;
    reward3 = r3p;
    reward4 = r4p;
    allParts = allp;
  };

  var trainLoop = () => {
    let oldState = curState();

    let newDir = learningAlgorithm.updateDirection(oldState, snake.dir, snake.body.length);
    snake.dir = newDir;
    let reward = moveSnake();

    let newState = curState();
    learningAlgorithm.updateQTable(oldState, newDir, reward, newState, snake.body.length);
  };

  var testLoop = () => {
    let oldState = curState();
    snake.dir = learningAlgorithm.updateDirection(oldState, snake.dir, snake.body.length);
    //QLearning.printActions(oldState);

    moveSnake();

    render();
  };

  // Make public methods accessible to QLearning
  return {
    init: init,
    reset: reset,
    trainLoop: trainLoop,
    testLoop: testLoop,

    getHeadPos: getHeadPos,
    getApplePos: getApplePos,
    getTailPos: getTailPos,
    // getTailDir: getTailDir,
    getDistForward: getDistForward,
    getDistRight: getDistForward,
    getDistLeft: getDistLeft,
    getDir: getDir,

    getScore: getScore,
    getHighscore: getHighscore,
    getApplesEaten: getApplesEaten,
    getDeaths: getDeaths,

    getReport: getReport
  };

})();
