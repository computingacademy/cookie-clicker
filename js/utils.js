function code(workspace) {
  Blockly.JavaScript.addReservedWords('code');
  var code = '\n'
    + 'let heading = document.querySelector("#cookie-clicker h1");\n'
    + 'heading.textContent = "No cookies";\n'
    + 'let image = document.querySelector("#cookie-clicker img");\n'
    + 'let clone = image.cloneNode(true);\n'
    + 'clone.src = "";\n'
    + 'clone.addEventListener("click", function() { cookieClickerEnvironment.clicks++; cookieClickerEnvironment.cookies++; });\n'
    + 'image.parentNode.replaceChild(clone, image);\n'
    + 'image = clone;\n'
    + 'let cookies = 0;\n'
    + Blockly.JavaScript.workspaceToCode(workspace).replace(/var cookies;\n/, '')
    + 'cookies;\n';
  return code;
}

function testCode(workspace) {
  Blockly.JavaScript.addReservedWords('code');
  var code = '\n'
    + 'let cookieClicker = document.createElement("div");\n'
    + 'let heading = document.createElement("h1");\n'
    + 'heading.textContent = "No cookies";\n'
    + 'let image = document.createElement("img");\n'
    + 'image.src = "";\n'
    + 'image.cookies = 0;\n'
    + 'image.addEventListener("click", function() { image.cookies++; });\n'
    + 'cookieClicker.appendChild(heading);\n' 
    + 'cookieClicker.appendChild(image);\n' 
    + 'let cookies = 0;\n'
    + Blockly.JavaScript.workspaceToCode(workspace).replace(/var cookies;\n/, '')
    + 'let result = test(cookieClicker, blockly, cookies);\n'
    + 'result;\n';
  return code;
}

function runCode(code, test, blockly) {
  try {
    return eval(code);
  } catch (e) {
    console.error(e);
  }
}

function runCookieClicker(code, environment) {
  // Set up cookie clicker environment
  window.cookieClickerEnvironment = environment || window.cookieClickerEnvironment || {};
  window.cookieClickerEnvironment.cookies = 0;
  window.cookieClickerEnvironment.clicks = 0;
  // Run code and get cookies
  window.cookieClickerEnvironment.cookies = runCode(code);
}

let unlockedBlocks = ['image_set'];
function updateGoals(env, silent) {
  // Get blocks from workspace
  let blockTree = workspaceToBlocks(env.blockly.workspace);
  let blockList = workspaceToBlocks(env.blockly.workspace, true);
  // Keep track of if any new goals have been completed
  let newCompletions = [];

  goals.map(function(goal) {
    // Check hint conditions
    goal.hints.forEach(function(hint) {
      Vue.set(hint, 'useful', usefulHint(hint, blockTree, blockList));
      Vue.set(hint, 'revealed', hint.revealed);
    });

    // Perform each check
    let passes = goal.checks.map(function(check) {
      if (env.blockly.workspace) {
        let passed = doCheck(env, check);
        Vue.set(check, 'passing', passed);
        return passed;
      } else {
        return false;
      }
    });

    // Has the interaction for this goal been completed?
    goal.interacted = env.selectedGoal === goal? env.clicks >= goal.interaction.clicks : (goal.interacted || goal.completed);

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
    .map(goal => goal.hints.map(hint => hint.block).filter(block => !!block))
    // Stick them all in one list (may contain duplicates
    .reduce((a, b) => a.concat(b));

  // Disable blocks not yet unlocked
  document.querySelectorAll('#toolbox > block').forEach(function(block) {
    let type = block.getAttribute('type');
    block.setAttribute('disabled', !unlockedBlocks.includes(type));
  });

  let toolbox = document.querySelector('#toolbox');
  env.blockly.workspace.updateToolbox(toolbox);
}

function doCheck(env, check) {
  // Run the code in the test environment
  return runCode(testCode(env.blockly.workspace), check.test, env.blockly);
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

function locationToCoords(blockly, location) {
  // Put the hint next to a block
  if (location.block) {
    // Get the blockly workspace location
    let offset = location.toolbox ? blockly.workspace.getFlyout_().getWorkspace().getOriginOffsetInPixels() : blockly.workspace.getOriginOffsetInPixels();
    let offsetX = blockly.offset.x + offset.x;
    let offsetY = blockly.offset.y + offset.y;

    // Put the hint after a block
    let blocks = location.toolbox ? blockly.toolbox : blockly.blocks;
    let block = blocks.find(block => block.type == location.block);

    if (!!block) {
      if (location.dragBlock || location.modifyBlock) {
        return {
          // The left side of the block
          left: offsetX + block.bounds.topLeft.x + 10,
          // In the middle of the block
          top: offsetY + (block.bounds.topLeft.y + block.bounds.bottomRight.y)/2,
        };
      } else if (location.dragIntoBlock) { 
        return {
          // A bit in from the left side of the block
          left: offsetX + block.bounds.topLeft.x + 40,
          // A bit up from the bottom of the block
          top: offsetY + block.bounds.bottomRight.y - 40,
        };
      } else {
        return {
          // To the right of the block
          left: offsetX + block.bounds.bottomRight.x,
          // At the top of the block
          top: offsetY + block.bounds.topLeft.y,
        };
      }
    } else {
      return undefined;
    }
  }
  // Put the hint after the last block
  else {
    // Get the blockly workspace location
    let offset = location.toolbox ? blockly.workspace.getFlyout_().getWorkspace().getOriginOffsetInPixels() : blockly.workspace.getOriginOffsetInPixels();
    let offsetX = blockly.offset.x + offset.x;
    let offsetY = blockly.offset.y + offset.y;

    // Get the last block
    let blocks = location.toolbox ? blockly.toolbox : blockly.blocks;
    let lastBlock = blocks[blocks.length - 1];

    if (!!lastBlock) {
      return {
        // On left side of the block
        left: offsetX + lastBlock.bounds.topLeft.x,
        // At the bottom of the block
        top: offsetY + lastBlock.bounds.bottomRight.y,
      };
    } else {
      return {
        // On the left side of the workspace 
        left: offsetX + 50,
        // At the top of the workspace
        top: offsetY + 50,
      };
    }
  }
}

// Turn a block type into a CSS class
function blockClass(blockType) {
  // Get the category part of the block type
  let category = blockType.split('_')[0];

  // Get the class
  let theClass;
  if (category == 'image' || category == 'heading') {
    theClass = 'io';
  } else if (category == 'controls' || category == 'on') {
    theClass = 'control';
  } else if (category == 'variables') {
    theClass = 'var';
  } else if (category == 'text') {
    theClass = 'str';
  } else {
    theClass = category;
  }

  return theClass;
}

// Turn a block type into a label
function blockLabel(blockType) {
  if (blockType == 'image_set') {
    return 'set image';
  } else if (blockType == 'on_click') {
    return 'on click';
  } else if (blockType == 'variables_add') {
    return 'add to <bk class="inner">cookies</bk>';
  } else if (blockType == 'variables_get') {
    return '<bk class="inner">cookies</bk>';
  } else if (blockType == 'heading_set') {
    return 'set heading';
  } else if (blockType == 'text_join') {
    return 'join text';
  } else if (blockType == 'text') {
    return '“ <bk class="inner"> Cookies</bk> ”';
  } else if (blockType == 'controls_if') {
    return 'if';
  } else if (blockType == 'logic_compare') {
    return '≥ <bk class="math">10</bk>';
  } else {
    return blockType;
  }
}

// Turn a block type into inline html
function inlineBlock(blockType) {
  return `<bk class="${blockClass(blockType)}">
  ${blockLabel(blockType)}
</bk>`
}

function usefulHint(hint, blockTree) {
  // Hints for dragging the block to the right place
  if (hint.type == 'drag block') {
    // If the block needs to be dragged into another block
    if (hint.into) {
      // Get the block that the block needs to be dragged into
      let outerBlock = blockTree.find(block => block.type == hint.into.block);

      if (outerBlock) {
        let contained;
        if (key) {
          // Is the block in the outer block's key?
          contained = blockContains(outerBlock, hint.into.key, hint.block);
        } else {
          // Is the block in the outer block anywhere?
          contained = false;
          for (var key in outerBlock.inputs)
            contained = contained || blockContains(outerBlock, key, hint.block);
        }

        if (contained && hint.into.after) {
          // Is the block after the other block already?
          let inner = outerBlock.inputs[hint.into.key];
          let blockIndex = inner.findIndex(block => block.type == hint.block);
          let afterIndex = inner.findIndex(block => block.type == hint.into.after);
          // The hint is useful if the block is before the one it's meant to be after
          return blockIndex < afterIndex;
        } else {
          // The hint is useful if the block isn't inside the block it's meant to be inside
          return !contained;
        }
      } else {
      // If the block to be dragged into doesn't exist yet this hint isn't useful yet
        return false;
      }
    // If the block just needs to be dragged into the workspace
    } else {
      // Does the block already exist in the workspace?
      return !blockTree.find(block => block.type == hint.block);
    }
  }
  // Hints for setting a block value
  else if (hint.type == 'set block value') {
    let block = blockTree.find(block => block.type == hint.block);
    let value = block ? block.inputs[hint.key] : undefined;
    // The hint is useful if the value isn't the correct one yet or it is the incorrect one
    return (hint.value && value != hint.value) || (hint.notValue && value == hint.notValue);
  }
}

function blockContains(outerBlock, key, innerBlockType) {
  // Get the block(s) for the given key
  let inner = outerBlock.inputs[key];

  if (inner) {
    // Does the outer block contain the inner block (either as a single block or one of multiple)?
    return inner.type == innerBlockType || (inner.find && !!inner.find(block => block.type == innerBlockType));
  } else {
    return false;
  }
}

function hintMessage(hint) {
  if (hint.type == 'drag block') {
    return `<p>Drag the <bk class="${blockClass(hint.block)}">${blockLabel(hint.block)}</bk> block into the ${hint.into ? inlineBlock(hint.into.block)+' block' : 'workspace'}.</p>`;
  } else if (hint.type == 'set block value') {
    return hint.message;
  }
}

function hintLocation(hint) {
  // Put the hint where it's being dragged to
  if (hint.type == 'drag block') {
    if (hint.into) {
      return {
        block: hint.into.block,
      };
    } else {
      return {
        place: 'workspace',
      };
    }
  }
  // Put the hint where the block being modified is
  else if (hint.type == 'set block value') {
    return {
      block: hint.block,
    };
  }
}

function pointerStartLocation(hint) {
  // Start at the block in the toolbox
  if (hint.type == 'drag block') {
    return {
      block: hint.block,
      toolbox: true,
      dragBlock: true,
    };
  }
  // Start at the block being modified
  else if (hint.type == 'set block value') {
    return {
      block: hint.block,
      modifyBlock: true,
    };
  }
}

function pointerEndLocation(hint) {
  // End at the location to drag to
  if (hint.type == 'drag block') {
    // Either into a block
    if (hint.into) {
      return {
        block: hint.into.block,
        dragIntoBlock: true,
      };
    }
    // Or just the workspace
    else {
      return {
        place: 'workspace',
      };
    }
  }
  // End at the block being modified
  else if (hint.type == 'set block value') {
    return {
      block: hint.block,
      modifyBlock: true,
    };
  }
}

function save(vm) {
  // Genereate blockly XML
  var xml = Blockly.Xml.workspaceToDom(vm.blockly.workspace);
  var xml_text = Blockly.Xml.domToText(xml);
  // Save blockly blocks and number of cookies
  Cookies.set('blocks', xml_text);
  Cookies.set('cookies', vm.cookies);
}

function load(vm) {
  // Get blockly XML
  var xml_text = Cookies.get('blocks');
  var xml = Blockly.Xml.textToDom(xml_text);
  // Insert blocks into workspace
  Blockly.Xml.domToWorkspace(xml, vm.blockly.workspace);

  // Set the number of cookies
  vm.cookies = parseInt(Cookies.get('cookies')) || 0;

  // Load goal completion and seen statuses
  vm.goals.map(function(goal) {
    goal.completed = goal.completed || Cookies.get(`goals[${goal.id}].completed`) === 'true';
    goal.seen = goal.seen || Cookies.get(`goals[${goal.id}].seen`) === 'true';
  });

  // Set the selected goal to the first incomplete goal
  vm.selectedGoal = goals.find(function(goal) {
    return goal.completed !== true;
  });
}
