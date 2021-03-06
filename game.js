var Game = (() => {
  var learningAlgorithm;

  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  const SNAKE_COLOR = '#00FF00';
  const OTHER_SNAKE_COLOR = '#0000FF';
  const APPLE_COLOR = '#FF0000';
  var snakeSize;
  var width;
  var height;
  var canvasWidth;
  var canvasHeight;

  var snake;
  var otherSnakes;
  var numOtherSnakes;
  var apples;
  var numApples;
  var score;
  var highscore;
  var applesEaten;
  var deaths;

  var iterations;
  var reward1;
  var reward2;
  var reward3;
  var reward4;

  var numPartsMain;
  var numPartsOther;
  var includeRelativeApplePos;
  var includeForwardDistToWall;
  var includeRightDistToWall;
  var includeLeftDistToWall;
  var includeDirection;

  var reset = () => {
    snake = newSnake();
    otherSnakes = [];
    renewOtherSnakes();
    apples = [];
    renewApples();
    score = 0;
    deaths++;
  };

  var resetTest = () => {
    reset();
    highscore = 0;
    applesEaten = 0;
    deaths = 0;
  };

  // Clears canvas
  function clear() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  }

  function randInt(start, end) {
    return start + Math.floor(Math.random() * (end - start));
  }

  function posIndexOf(arr, pos) {
    for (let i = 0; i < arr.length; ++i) {
      if (pos.x == arr[i].x && pos.y == arr[i].y) {
        return i;
      }
    }
    return -1;
  }

  function snakeIndexOf(arr, asnake) {
    for (let i = 0; i < arr.length; i++) {
      if (asnake.dir == arr[i].dir && asnake.body.length == arr[i].body.length) {
        let foundit = true;
        for (let j = 0; j < asnake.body.length; ++j) {
          if (!(asnake.body[j].x == arr[i].body[j].x && asnake.body[j].y == arr[i].body[j].y)) {
            foundit = false;
            break;
          }
        }
        if (foundit) {
          return i;
        }
      }
    }
    return -1;
  }

  function snakeEquals(s1, s2) {
    if (s1.dir == s2.dir && s1.body.length == s2.body.length) {
      for (let i = 0; i < s1.body.length; ++i) {
        if (s1.body[i] != s2.body[i]) {
          return false;
        }
      }
    } else {
      return false;
    }

    return true;
  }

  function renewOtherSnakes() {
    if (otherSnakes.length < numOtherSnakes) {
      for (let i = 0; i < numOtherSnakes - otherSnakes.length; ++i) {
        otherSnakes.push(newSnake());
      }
    }
  }

  function renewApples() {
    if (apples.length < numApples) {
      for (let i = 0; i < numApples - apples.length;) {
        apples.push(emptyPos())
      }
    }
  }

  function pos(x, y) {
    if (x == undefined || y == undefined) {
      return {x:randInt(0, width),y:randInt(0, height)};
    }
    return {x: x, y: y};
  }

  function emptySpot(x1, y1) {
    if (snake != undefined) {
      for (let i = 0; i < snake.body.length; ++i) {
        if (snake.body[i].x == x1 && snake.body[i].y == y1) {
          return false;
        }
      }
    }

    if (otherSnakes != undefined) {
      for (let i = 0; i < otherSnakes.length; ++i) {
        for (let j = 0; j < otherSnakes[i].body.length; ++j) {
          if (otherSnakes[i].body[j].x == x1 && otherSnakes[i].body[j].y == y1) {
            return false;
          }
        }
      }
    }

    if (apples != undefined) {
      for (let i = 0; i < apples.length; ++i) {
        if (apples[i].x == x1 && apples[i].y == y1) {
          return false;
        }
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
      body: [emptyPos()],
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
    // Check if hit other snakes
    for (let i = 0; i < otherSnakes.length; ++i) {
      for (let j = 0; j < otherSnakes[i].body.length; ++j) {
        if (headX == otherSnakes[i].body[j].x && headY == otherSnakes[i].body[j].y) {
          reset();
          return reward2;
        }
      }
    }

    // Snake is legal

    // Check if apple
    for (let i = 0; i < apples.length; ++i) {
      if (apples[i].x == headX && apples[i].y == headY) {
        if (++score > highscore) {
          highscore = score;
        }
        apples.splice(posIndexOf(apples, snake.body[snake.body.length - 1]), 1);
        applesEaten++;
        renewApples();
        return reward3;
      }
    }
    snake.body.shift();
    return reward4;

  }

  function moveOtherSnake(thisSnake) {
    switch (thisSnake.dir) {
      case 'right':
        thisSnake.body.push(pos(thisSnake.body[thisSnake.body.length - 1].x + 1, thisSnake.body[thisSnake.body.length - 1].y));
        break;
      case 'left':
        thisSnake.body.push(pos(thisSnake.body[thisSnake.body.length - 1].x - 1, thisSnake.body[thisSnake.body.length - 1].y));
        break;
      case 'down':
        thisSnake.body.push(pos(thisSnake.body[thisSnake.body.length - 1].x, thisSnake.body[thisSnake.body.length - 1].y + 1));
        break;
      case 'up':
        thisSnake.body.push(pos(thisSnake.body[thisSnake.body.length - 1].x, thisSnake.body[thisSnake.body.length - 1].y - 1));
        break;
      default:
        break;
    }
    let headX = thisSnake.body[thisSnake.body.length - 1].x;
    let headY = thisSnake.body[thisSnake.body.length - 1].y;
    // Check if hit wall
    if (headX < 0 || headX >= width || headY < 0 || headY >= height) {
      otherSnakes.splice(snakeIndexOf(otherSnakes, thisSnake), 1);
      return 'rem';
    }
    // Check if hit itself
    for (let i = 0; i < thisSnake.body.length - 1; ++i) {
      if (headX == thisSnake.body[i].x && headY == thisSnake.body[i].y) {
        otherSnakes.splice(snakeIndexOf(otherSnakes, thisSnake), 1);
        return 'rem';
      }
    }

    // Check if hit other snakes
    for (let i = 0; i < otherSnakes.length; ++i) {
      for (let j = 0; j < otherSnakes[i].body.length; ++j) {
        if (otherSnakes[i] != thisSnake && headX == otherSnakes[i].body[j].x && headY == otherSnakes[i].body[j].y) {
          otherSnakes.splice(snakeIndexOf(otherSnakes, thisSnake), 1);
          return 'rem';
        }
      }
    }

    // Check if hit main snake
    for (let i = 0; i < snake.body.length; ++i) {
      if (headX == snake.body[i].x && headY == snake.body[i].y) {
        otherSnakes.splice(snakeIndexOf(otherSnakes, thisSnake), 1);
        return 'rem';
      }
    }

    // Snake is legal

    // Check if apple
    for (let i = 0; i < apples.length; ++i) {
      if (apples[i].x == headX && apples[i].y == headY) {
        apples.splice(posIndexOf(apples, thisSnake.body[thisSnake.body.length - 1]), 1);
        renewApples();
        return;
      }
    }
    thisSnake.body.shift();
    return;

  }

  // Renders snake bodies and apples
  function render() {
    clear();
    ctx.fillStyle = SNAKE_COLOR;
    for (let i = 0; i < snake.body.length; ++i) {
      ctx.fillRect(snakeSize * snake.body[i].x, snakeSize * snake.body[i].y, snakeSize, snakeSize);
    }
    ctx.fillStyle = OTHER_SNAKE_COLOR;
    for (let i = 0; i < otherSnakes.length; ++i) {
      for (let j = 0; j < otherSnakes[i].body.length; ++j) {
        ctx.fillRect(snakeSize * otherSnakes[i].body[j].x, snakeSize * otherSnakes[i].body[j].y, snakeSize, snakeSize);
      }
    }
    ctx.fillStyle = APPLE_COLOR;
    for (let i = 0; i < apples.length; ++i) {
      ctx.fillRect(snakeSize * apples[i].x, snakeSize * apples[i].y, snakeSize, snakeSize);
    }
  };

  function curState(snakey) {
    let state = '';
    let newHeadPos = getHeadPos(snakey.body);

    if (includeRelativeApplePos) {
      let tempApple = relPos(newHeadPos, getNearestApplePos(newHeadPos));
      state += tempApple.x + ',' + tempApple.y;
    }

    let mainBodyPartsConsidered = numPartsMain == 2 ? snakey.body.length : numPartsMain;
    for (let i = 0; i < mainBodyPartsConsidered; ++i) {
      let newRelPos = relPos(newHeadPos, snakey.body[i]);
      state += ',' + newRelPos.x + ',' + newRelPos.y;
    }
    if (!snakeEquals(snakey, snake)) {
      let otherBodyPartsConsidered = numPartsOther == 2 ? snake.body.length : numPartsMain;
      for (let i = 0; i < otherBodyPartsConsidered; ++i) {
        let newRelPos = relPos(newHeadPos, snake.body[i]);
        state += ',' + newRelPos.x + ',' + newRelPos.y;
      }
    }
    for (let i = 0; i < otherSnakes.length; ++i) {
      if (!snakeEquals(otherSnakes[i], snakey)) {
        let otherBodyPartsConsidered = numPartsOther == 2 ? otherSnakes[i].body.length : numPartsMain;
        for (let j = 0; j < otherBodyPartsConsidered; ++j) {
          let newRelPos = relPos(newHeadPos, otherSnakes[i].body[j]);
          state += ',' + newRelPos.x + ',' + newRelPos.y;
        }
      }
    }

    if (includeForwardDistToWall) {
      state += ',' + getDistForward(snakey);
    }
    if (includeRightDistToWall) {
      state += ',' + getDistRight(snakey);
    }
    if (includeLeftDistToWall) {
      state += ',' + getDistLeft(snakey);
    }
    if (includeDirection) {
      state += ',' + snakey.dir;
    }

    return state;
  }

  var getHeadPos = (snakeBody) => {
    let x = snakeBody[snakeBody.length - 1].x;
    let y = snakeBody[snakeBody.length - 1].y;
    return pos(x, y);
  };

  var getNearestApplePos = (snakeHeadPos) => {
    let headX = snakeHeadPos.x;
    let headY = snakeHeadPos.y;
    let x = apples[0].x;
    let y = apples[0].y;
    let closestDist = Math.abs(x - headX) + Math.abs(y - headY);
    for (let i = 0; i < apples.length; ++i) {
      let x2 = apples[i].x;
      let y2 = apples[i].y;
      if (Math.abs(x2 - headX) + Math.abs(y2 - headY) < closestDist) {
        x = x2;
        y = y2;
        closestDist = Math.abs(x2 - headX) + Math.abs(y2 - headY);
      }
    }
    return pos(x, y);
  };

  var getDistForward = (snakey) => {
    let headx = snakey.body[snakey.body.length - 1].x;
    let heady = snakey.body[snakey.body.length - 1].y;
    switch (snakey.dir) {
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

  var getDistRight = (snakey) => {
    let headx = snakey.body[snakey.body.length - 1].x;
    let heady = snakey.body[snakey.body.length - 1].y;
    switch (snakey.dir) {
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

  var getDistLeft = (snakey) => {
    let headx = snakey.body[snakey.body.length - 1].x;
    let heady = snakey.body[snakey.body.length - 1].y;
    switch (snakey.dir) {
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

  var getDir = (snakey) => {
    return snakey.dir;
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
        }, 'Game': {
          'Width': width,
          'Height': height,
          'Other Snakes': numOtherSnakes,
          'Apples': numApples
        }, 'State Options': {
          'Main Snake Body': UI.getIncludeMainSnakeBody(),
          'Other Snakes Body': UI.getIncludeOtherSnakesBody(),
          'Relative Apple Position': UI.getIncludeRelApplePos(),
          'Forward Distance to Wall': UI.getIncludeDistForward(),
          'Rightward Distance to Wall': UI.getIncludeDistRight(),
          'Leftward Distance to Wall': UI.getIncludeDistLeft(),
          'Direction': UI.getIncludeDirection()
        }
      },
      'REPORT': {
        'Highscore': getHighscore(),
        'Apples per Death': (getDeaths() == 0 ? getApplesEaten() : getApplesEaten() / getDeaths()).toFixed(3),
        'Deaths': getDeaths(),
        'Unsticks': UI.getNumUnsticks()
      }
    };
  };

  var init = (learningAlgorithmp, snakeSizep, widthp, heightp, snakssp, applssp, iterationsp, r1p, r2p, r3p, r4p, npmp, npop, rapp, fdtwp, rdtwp, ldtwp, drctnp) => {
    console.log('Game init');
    learningAlgorithm = learningAlgorithmp;
    snakeSize = snakeSizep;
    width = widthp;
    height = heightp;
    snake = newSnake();
    numOtherSnakes = snakssp;
    otherSnakes = [];
    renewOtherSnakes();
    numApples = applssp;
    apples = [];
    renewApples();
    canvasWidth = width * snakeSize;
    canvasHeight = height * snakeSize;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    score = 0;
    highscore = 0;
    applesEaten = 0;
    deaths = 0;
    iterations = iterationsp;
    reward1 = r1p;
    reward2 = r2p;
    reward3 = r3p;
    reward4 = r4p;
    numPartsMain = npmp;
    numPartsOther = npop;
    includeRelativeApplePos = rapp;
    includeForwardDistToWall = fdtwp;
    includeRightDistToWall = rdtwp;
    includeLeftDistToWall = ldtwp;
    includeDirection = drctnp;
  };

  var trainLoop = () => {
    let oldState = curState(snake);

    let newDir = learningAlgorithm.updateDirection(oldState, snake.dir, snake.body.length);
    snake.dir = newDir;
    let reward = moveSnake();

    for (let i = 0; i < otherSnakes.length; ++i) {
      let otherSnakeState = curState(otherSnakes[i]);
      otherSnakes[i].dir = learningAlgorithm.updateDirection(otherSnakeState, otherSnakes[i].dir, otherSnakes[i].body.length);
      if (moveOtherSnake(otherSnakes[i]) == 'rem') {
        i--;
      }
    }

    let newState = curState(snake);
    learningAlgorithm.updateQTable(oldState, newDir, reward, newState, snake.body.length);

    renewOtherSnakes();
  };

  var testLoop = () => {
    let oldState = curState(snake);
    snake.dir = learningAlgorithm.updateDirection(oldState, snake.dir, snake.body.length);
    moveSnake();

    for (let i = 0; i < otherSnakes.length; ++i) {
      let otherSnakeState = curState(otherSnakes[i]);
      otherSnakes[i].dir = learningAlgorithm.updateDirection(otherSnakeState, otherSnakes[i].dir, otherSnakes[i].body.length);
      if (moveOtherSnake(otherSnakes[i]) == 'rem') {
        i--;
      }
    }

    render();

    renewOtherSnakes();
  };

  // Make public methods accessible to QLearning
  return {
    init: init,
    reset: reset,
    trainLoop: trainLoop,
    testLoop: testLoop,
    resetTest: resetTest,

    getHeadPos: getHeadPos,
    getNearestApplePos: getNearestApplePos,

    getScore: getScore,
    getHighscore: getHighscore,
    getApplesEaten: getApplesEaten,
    getDeaths: getDeaths,

    getReport: getReport
  };

})();
