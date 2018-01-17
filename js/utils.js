function code(workspace) {
  Blockly.JavaScript.addReservedWords('code');
  var code = 'window._cookies = 0;\n'
    + 'let heading = document.querySelector("#cookie-clicker h1");\n'
    + 'heading.textContent = "No cookies";\n'
    + 'let image = document.querySelector("#cookie-clicker img");\n'
    + 'let clone = image.cloneNode(true);\n'
    + 'clone.src = "";\n'
    + 'clone.addEventListener("click", function() { mainVue.clicks++; });\n'
    + 'image.parentNode.replaceChild(clone, image);\n'
    + 'image = clone;\n'
    + Blockly.JavaScript.workspaceToCode(workspace).replace(/var cookies;\n/, '');
  return code;
}

function testCode(workspace) {
  Blockly.JavaScript.addReservedWords('code');
  var code = 'window._test = true;\n'
    + 'window._testCookies = 0;\n'
    + 'let cookieClicker = document.createElement("div");\n'
    + 'let heading = document.createElement("h1");\n'
    + 'heading.textContent = "No cookies";\n'
    + 'let image = document.createElement("img");\n'
    + 'image.src = "";\n'
    + 'cookieClicker.appendChild(heading);\n' 
    + 'cookieClicker.appendChild(image);\n' 
    + Blockly.JavaScript.workspaceToCode(workspace).replace(/var cookies;\n/, '')
    + 'let result = test(cookieClicker, cookies);\n'
    + 'window._test = false;\n'
    + 'result;\n';
  return code;
}

function runCode(code, test) {
  try {
    return eval(code);
  } catch (e) {
    console.error(e);
  }
}

let unlockedBlocks = ['image_set'];
function updateGoals(silent) {
  // Get blocks from workspace
  let blockTree = workspaceToBlocks(workspace);
  let blockList = workspaceToBlocks(workspace, true);
  // Keep track of if any new goals have been completed
  let newCompletions = [];

  goals.map(function(goal) {
    // Check hint conditions
    goal.hints.forEach(function(hint) {
      Vue.set(hint, 'useful', hint.condition(blockTree, blockList));
    });

    // Perform each check
    let passes = goal.checks.map(function(check) {
      let passed = doCheck(check);
      Vue.set(check, 'passing', passed);
      return passed;
    });

    // Has the interaction for this goal been completed?
    goal.interacted = mainVue.selectedGoal === goal? mainVue.clicks >= goal.interaction.clicks : (goal.interacted || goal.completed);

    // Is this goal currently passing all checks?
    let passing = passes.every(pass => pass) && goal.interacted;
    Vue.set(goal, 'passing', passing);
    // Is this a new goal completion?
    if (!goal.completed && passing) {
      newCompletions.push(goal)
    }
    // Has this goal ever been completed?
    goal.completed = goal.completed || passing;
    // Update cookies with goal status
    Cookies.set(`goals[${goal.id}].completed`, goal.completed);
  });

  // Update the selected goal if a previous goal has been newly completed
  if (newCompletions.length !== 0) {
    let rewards = newCompletions
      .map(goal => goalRewards(goal))
      .reduce((a, b) => a.concat(b));
    if (!silent) {
      mainVue.goalRewards = rewards
        .filter(reward => !(reward.type === 'block' && unlockedBlocks.includes(reward.block)) && !(reward.type === 'goal' && goals.find(goal => goal.id === reward.goal)));
    }
  }

  // Unlock goal which have completed prerequisites or have been completed
  goals.forEach(function(goal) {
    // Get the goal's prereqs
    let prereqs = goals.filter(prereq => goal.prerequisites.includes(prereq.id));
    // See if they've been completed
    let unlocked = goal.completed || prereqs.every(prereq => prereq.completed);
    // Update unlocked status
    Vue.set(goal, 'unlocked', unlocked);
  });

  // Unlock blocks that are needed
  unlockedBlocks = goals
    // Only use unlocked goals
    .filter(goal => goal.unlocked)
    // Get the blocks
    .map(goal => goal.blocks)
    // Stick them all in one list (may contain duplicates
    .reduce((a, b) => a.concat(b));

  // Disable blocks not yet unlocked
  document.querySelectorAll('#toolbox > block').forEach(function(block) {
    let type = block.getAttribute('type');
    block.setAttribute('disabled', !unlockedBlocks.includes(type));
  });

  let toolbox = document.querySelector('#toolbox');
  workspace.updateToolbox(toolbox);
}

function doCheck(check) {
  return runCode(testCode(workspace), check.test);
}

function goalRewards(goal) {
  let rewards = [];
  
  // Cookie rewards
  rewards.push({
    type: 'cookies',
    amount: goal.reward,
  });

  // Goal rewards
  let newGoals = goals
    .filter(newGoal => newGoal.prerequisites.includes(goal.id))
    .filter(newGoal => newGoal.prerequisites.every(prereq => goals.find(goal => goal.id == prereq).completed));
  newGoals.forEach(function(newGoal) {
    rewards.push({
      type: 'goal',
      goal: newGoal.title,
    });
  });

  // Block rewards
  newGoals
    .map(goal => goal.blocks)
    .reduce((a,b) => a.concat(b), [])
  .forEach(function(block) {
    rewards.push({
      type: 'block',
      block: block,
    });
  });

  return rewards;
}

function workspaceToBlocks(workspace, list) {
  let xml = Blockly.Xml.workspaceToDom(workspace);
  let topBlocks = xml.querySelectorAll('xml > block');

  let blocks = [...topBlocks]
    .map(block => xmlToBlocks(workspace, block, list))
    .reduce((a,b) => a.concat(b), []);

  return blocks;
}

// Turn workspace XML into block JSON
function xmlToBlocks(workspace, xml, list) {
  let blockSvg = workspace.getBlockById(xml.id);
  let blocks = [];
  let block = {
    id: xml.id,
    type: xml.getAttribute('type'),
    bounds: blockSvg? blockSvg.getBoundingRectangle() : {topLeft: {x: 0, y: 0}, bottomRight: {x: 0, y: 0}},
  };
  blocks.push(block);

  let inputsSelector = ['value', 'field', 'statement'].map(tag => `[id="${xml.id}"] > ${tag}`).join(',');
  let nextSelector = `[id="${xml.id}"] > next > block`;

  let inputs = xml.querySelectorAll(inputsSelector);
  let nexts = xml.querySelectorAll(nextSelector);

  let inputsMap = {};
  if (!!inputs) {
    [...inputs]
      .forEach(function(input) {
        let key = input.getAttribute('name');

        input.id = !!input.id? input.id : input.parentElement.id + input.getAttribute('name');
        let blockSelector = `[id="${input.id}"] > block`;
        let subBlocks = input.querySelectorAll(blockSelector);

        let value;
        if (input.nodeName === 'FIELD') {
          value = input.textContent;
        } else if (input.nodeName === 'STATEMENT') {
          value = [...subBlocks]
            .map(subBlock => xmlToBlocks(workspace, subBlock, list))
            .reduce((a,b) => a.concat(b), []);
        } else if (input.nodeName === 'VALUE') {
          value = [...subBlocks]
            .map(subBlock => xmlToBlocks(workspace, subBlock, list))
            .reduce((a,b) => a.concat(b), [])[0];
        }

        if (list && input.nodeName !== 'FIELD')
          blocks = blocks.concat(value);

        inputsMap[key] = value;
      });
  }
  block.inputs = inputsMap;

  if (!!nexts) {
    let nextBlocks = [...nexts]
      .map(nextBlock => xmlToBlocks(workspace, nextBlock, list))
      .reduce((a,b) => a.concat(b), []);

    return blocks.concat(nextBlocks);
  } else {
    return blocks;
  }
}

function locationToCoords(workspace, location) {
  let offset = workspace.getOriginOffsetInPixels();
  if (location === 'workspace') {
    return {
      left: offset.x + 10,
      top: offset.y + 10,
    };
  } else if (location) {
    if (location.flyout) {
      workspace = workspace.getFlyout_().getWorkspace();
      location = location.location;
      let blockTree = workspaceToBlocks(workspace);
      let blockList = workspaceToBlocks(workspace, true);
      let block = blockList.find(location);

      if (!!block)
        return {
          left: (block.bounds.topLeft.x+block.bounds.bottomRight.x)/2,
          top: (block.bounds.topLeft.y+block.bounds.bottomRight.y)/2,
        }
      else
        return {};
    } else {
      let blockTree = workspaceToBlocks(workspace);
      let blockList = workspaceToBlocks(workspace, true);
      let block = blockList.find(location);

      if (!!block)
        return {
          left: (block.bounds.bottomRight.x+offset.x),
          top: (block.bounds.topLeft.y+offset.y),
        };
      else
        return {};
    }
  } else {
    return {};
  }
}

function save() {
  var xml = Blockly.Xml.workspaceToDom(workspace);
  var xml_text = Blockly.Xml.domToText(xml);
  Cookies.set('blocks', xml_text);
  Cookies.set('cookies', mainVue.cookies);
}

function load() {
  var xml_text = Cookies.get('blocks');
  var xml = Blockly.Xml.textToDom(xml_text);
  Blockly.Xml.domToWorkspace(xml, workspace);
  mainVue.cookies = parseInt(Cookies.get('cookies')) || 0;
  // Load goal completion and seen statuses
  goals.map(function(goal) {
    goal.completed = goal.completed || Cookies.get(`goals[${goal.id}].completed`) === 'true';
    goal.seen = goal.seen || Cookies.get(`goals[${goal.id}].seen`) === 'true';
  });
}
