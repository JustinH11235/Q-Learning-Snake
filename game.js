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
  var applesEaten;
  var deaths;

  var iterations;
  var reward1;
  var reward2;
  var reward3;
  var reward4;

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
      score++;
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

  var getApplesEaten = () => {
    return parseInt(applesEaten);
  };

  var getDeaths = () => {
    return parseInt(deaths);
  };

  var init = (learningAlgorithmp, snakeSizep, widthp, heightp, iterationsp, r1p, r2p, r3p, r4p) => {
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
    apple = emptyPos();
    applesEaten = 0;
    deaths = 0;
    iterations = iterationsp;
    reward1 = r1p;
    reward2 = r2p;
    reward3 = r3p;
    reward4 = r4p;
  };

  var trainLoop = () => {
    let tempApple = relPos(getHeadPos(), getApplePos());
    let tempTail = relPos(getHeadPos(), getTailPos());
    let oldState = tempApple.x + ',' + tempApple.y + ',' + tempTail.x + ',' + tempTail.y + ',' + getDistForward() + ',' + getDir();
    //let oldState = {apple: relPos({x:headX,y:headY}, apple), tail: relPos({x:headX,y:headY}, getTailPos()), dToWall: getDistForward()};

    let newDir = learningAlgorithm.updateDirection(oldState, snake.dir, snake.body.length);
    snake.dir = newDir;
    let reward = moveSnake();

    let tempApple2 = relPos(getHeadPos(), getApplePos());
    let tempTail2 = relPos(getHeadPos(), getTailPos());
    let newState = tempApple2.x + ',' + tempApple2.y + ',' + tempTail2.x + ',' + tempTail2.y + ',' + getDistForward() + ',' + getDir();
    learningAlgorithm.updateQTable(oldState, newDir, reward, newState, snake.body.length);
    //learningAlgorithm.updateQTable(oldState, snake.dir, reward, {apple: relPos({x:headX,y:headY}, apple), tail: relPos({x:headX,y:headY}, getTailPos()), dToWall: getDistForward()});
  };

  var testLoop = () => {
    let tempApple = relPos(getHeadPos(), getApplePos());
    let tempTail = relPos(getHeadPos(), getTailPos());
    let oldState = tempApple.x + ',' + tempApple.y + ',' + tempTail.x + ',' + tempTail.y + ',' + getDistForward() + ',' + getDir();
    snake.dir = learningAlgorithm.updateDirection(oldState, snake.dir, snake.body.length);
    QLearning.printActions(oldState);

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
    getApplesEaten: getApplesEaten,
    getDeaths: getDeaths
  };

})();
