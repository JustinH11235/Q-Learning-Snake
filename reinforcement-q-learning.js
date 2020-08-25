var QLearning = (() => {
  var QTable;
  var learningRate;
  var discountFactor;
  var epsilon;

  function randInt(start, end) {
    return start + Math.floor(Math.random() * (end - start));
  }

  function relPos(pos1, pos2) {
    return JSON.parse(JSON.stringify({x:pos2.x-pos1.x,y:pos2.y-pos1.y}));
  }

  function newActions(right, left, down, up) {
    if (right == -10) {
      return JSON.parse(JSON.stringify({'left': left, 'down': down, 'up': up}));
    } else if (left == -10) {
      return JSON.parse(JSON.stringify({'right': right, 'down': down, 'up': up}));
    } else if (down == -10) {
      return JSON.parse(JSON.stringify({'right': right, 'left': left, 'up': up}));
    } else if (up == -10) {
      return JSON.parse(JSON.stringify({'right': right, 'left': left, 'down': down}));
    } else {
      return JSON.parse(JSON.stringify({'right': right, 'left': left, 'down': down, 'up': up}));
    }
  }

  function bestAction(state) {
    var actions = Object.entries(QTable[state]);
    var bestActions = [actions[0][0]];
    var bestRewards = [actions[0][1]];
    for (let [action, reward] of actions) {
      if (reward > bestRewards[0]) {
        bestRewards = [reward];
        bestActions = [action];
      } else if (reward == bestRewards[0]) {
        bestRewards.push(reward);
        bestActions.push(action);
      }
    }
    var rando = randInt(0, bestRewards.length);
    var bestAction = bestActions[rando];
    var bestReward = bestRewards[rando];
    return JSON.parse(JSON.stringify({action: bestAction, reward: bestReward}));
  }

  var init = (qtab, lR, dF, e) => {
    QTable = qtab;
    learningRate = lR;
    discountFactor = dF;
    epsilon = e;
  }

  var changeLR = (change) => {
    learningRate -= change;
    if (learningRate < 0) {
      learningRate = 0;
    }
  }

  var changeDF = (change) => {
    discountFactor -= change;
    if (discountFactor < 0) {
      discountFactor = 0;
    }
  }

  var changeEpsilon = (change) => {
    epsilon -= change;
    if (epsilon < 0) {
      epsilon = 0;
    }
  }

  var updateQTable = (oldState, action, reward, newState, sizeee) => {
    if (QTable[newState] == undefined) {
      if (sizeee > 1) {
        switch (action) {
          case 'right':
            QTable[newState] = JSON.parse(JSON.stringify(newActions(0, -10, 0, 0)));
            break;
          case 'left':
            QTable[newState] = JSON.parse(JSON.stringify(newActions(-10, 0, 0, 0)));
            break;
          case 'down':
            QTable[newState] = JSON.parse(JSON.stringify(newActions(0, 0, 0, -10)));
            break;
          case 'up':
            QTable[newState] = JSON.parse(JSON.stringify(newActions(0, 0, -10, 0)));
            break;
          default:
            break;
        }
      } else {
        QTable[newState] = JSON.parse(JSON.stringify(newActions(0, 0, 0, 0)));
      }
    }

    var q1 = QTable[newState];
    QTable[oldState][action] = QTable[oldState][action] + learningRate * (reward + discountFactor * bestAction(newState).reward  - QTable[oldState][action]);
  };

  var updateDirection = (statep, oldDir, sizee) => {
    if (QTable[statep] == undefined) {
      if (sizee > 1) {
        switch (oldDir) {
          case 'right':
            QTable[statep] = JSON.parse(JSON.stringify(newActions(0, -10, 0, 0)));
            break;
          case 'left':
            QTable[statep] = JSON.parse(JSON.stringify(newActions(-10, 0, 0, 0)));
            break;
          case 'down':
            QTable[statep] = JSON.parse(JSON.stringify(newActions(0, 0, 0, -10)));
            break;
          case 'up':
            QTable[statep] = JSON.parse(JSON.stringify(newActions(0, 0, -10, 0)));
            break;
          default:
            break;
        }
      } else {
        QTable[statep] = JSON.parse(JSON.stringify(newActions(0, 0, 0, 0)));
      }
    }

    if (Math.random() < epsilon) {
      let posActions;
      if (sizee > 1) {
        switch (oldDir) {
          case 'right':
            posActions = ['right', 'down', 'up'];
            break;
          case 'left':
            posActions = ['left', 'down', 'up'];
            break;
          case 'down':
            posActions = ['right', 'left', 'down'];
            break;
          case 'up':
            posActions = ['right', 'left', 'up'];
            break;
          default:
            break;
        }
      } else {
        posActions = ['right', 'left', 'down', 'up'];
      }
      return posActions[randInt(0, posActions.length)];
    } else {
      return bestAction(statep).action;
    }
  };

  var printQTable = () => {
    for (let prop in QTable) {
      console.log(prop);
      for (let prop2 in QTable[prop]) {
        console.log(prop2 + ' ' + QTable[prop][prop2]);
      }
    }
    console.log();
  };

  var printQTableRaw = () => {
    console.log(QTable);
  };

  var getQTable = () => {
    return QTable;
  };

  var getQTableSmallDecimals = () => {
    let qtab = {};

    for (let stat in QTable) {
      let newAct = {};

      for (let dirr in QTable[stat]) {
        newAct[dirr] = parseFloat(QTable[stat][dirr].toFixed(5));
      }

      qtab[stat] = newAct;
    }

    return qtab;
  };

  var printActions = (statep) => {
    console.log(statep);
    console.log(QTable[statep]);
  };

  return {
    init: init,
    changeLR: changeLR,
    changeDF: changeDF,
    changeEpsilon: changeEpsilon,
    updateDirection: updateDirection,
    updateQTable: updateQTable,

    printQTable: printQTable,
    getQTable: getQTable,
    getQTableSmallDecimals: getQTableSmallDecimals,

    printActions: printActions
  }
})();
