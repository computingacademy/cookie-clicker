'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function code(workspace) {
  Blockly.JavaScript.addReservedWords('code');
  var code = '\n' + 'let heading = document.querySelector("#cookie-clicker h1");\n' + 'heading.textContent = "No cookies";\n' + 'let image = document.querySelector("#cookie-clicker img");\n' + 'let clone = image.cloneNode(true);\n' + 'clone.src = "";\n' + 'clone.addEventListener("click", function() { cookieClickerEnvironment.clicks++; cookieClickerEnvironment.cookies++; });\n' + 'image.parentNode.replaceChild(clone, image);\n' + 'image = clone;\n' + 'let cookies = 0;\n' + Blockly.JavaScript.workspaceToCode(workspace).replace(/var cookies;\n/, '') + 'cookies;\n';
  return code;
}

function testCode(workspace) {
  Blockly.JavaScript.addReservedWords('code');
  var code = '\n' + 'let cookieClicker = document.createElement("div");\n' + 'let heading = document.createElement("h1");\n' + 'heading.textContent = "No cookies";\n' + 'let image = document.createElement("img-fake");\n' + 'image.className = "cookie";\n' + 'image.src = "images/crumbs.jpg";\n' + 'image.cookies = 0;\n' + 'cookieClicker.appendChild(heading);\n' + 'cookieClicker.appendChild(image);\n' + 'let cookies = 0;\n' + Blockly.JavaScript.workspaceToCode(workspace).replace(/var cookies;\n/, '') + 'image.addEventListener("click", function() { image.cookies = cookies; });\n' + 'let result = test(cookieClicker, blockly, cookies);\n' + 'result;\n';
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

function unlockBlocks(blockly) {
  // Unlock blocks that are needed
  var unlockedBlocks = goals
  // Only use unlocked goals
  .filter(function (goal) {
    return goal.unlocked;
  })
  // Get the blocks
  .map(function (goal) {
    return goal.hints.map(function (hint) {
      return hint.block;
    }).filter(function (block) {
      return !!block;
    });
  })
  // Stick them all in one list (may contain duplicates
  .reduce(function (a, b) {
    return a.concat(b);
  }, []);

  // Disable blocks not yet unlocked
  document.querySelectorAll('#toolbox > block').forEach(function (block) {
    var type = block.getAttribute('type');
    block.setAttribute('disabled', !unlockedBlocks.includes(type));
  });

  var toolbox = document.querySelector('#toolbox');
  blockly.workspace.updateToolbox(toolbox);
}

function checksPass(blockly, goal) {
  // Determine if all of the goal's checks pass
  return goal.checks.every(function (check) {
    return doCheck(blockly, check);
  });
}

function doCheck(blockly, check) {
  // Run the code in the test environment
  if (blockly && blockly.workspace) {
    return runCode(testCode(blockly.workspace), check.test, blockly);
  } else {
    return undefined;
  }
}

function workspaceToBlocks(workspace, list) {
  var xml = Blockly.Xml.workspaceToDom(workspace);
  var topBlocks = xml.querySelectorAll('xml > block');

  var blocks = [].concat(_toConsumableArray(topBlocks)).map(function (block) {
    return xmlToBlocks(workspace, block, list);
  }).reduce(function (a, b) {
    return a.concat(b);
  }, []);

  return blocks;
}

// Turn workspace XML into block JSON
function xmlToBlocks(workspace, xml, list, parent) {
  var blockSvg = workspace.getBlockById(xml.id);
  var blocks = [];
  var block = {
    id: xml.id,
    parent: parent,
    type: xml.getAttribute('type'),
    bounds: blockSvg ? blockSvg.getBoundingRectangle() : { topLeft: { x: 0, y: 0 }, bottomRight: { x: 0, y: 0 } }
  };
  blocks.push(block);

  var inputsSelector = ['value', 'field', 'statement'].map(function (tag) {
    return '[id="' + xml.id + '"] > ' + tag;
  }).join(',');
  var nextSelector = '[id="' + xml.id + '"] > next > block';

  var inputs = xml.querySelectorAll(inputsSelector);
  var nexts = xml.querySelectorAll(nextSelector);

  var inputsMap = {};
  if (!!inputs) {
    [].concat(_toConsumableArray(inputs)).forEach(function (input) {
      var key = input.getAttribute('name');

      input.id = !!input.id ? input.id : input.parentElement.id + input.getAttribute('name');
      var blockSelector = '[id="' + input.id + '"] > block';
      var subBlocks = input.querySelectorAll(blockSelector);

      var value = void 0;
      if (input.nodeName === 'FIELD') {
        value = input.textContent;
      } else if (input.nodeName === 'STATEMENT') {
        value = [].concat(_toConsumableArray(subBlocks)).map(function (subBlock) {
          return xmlToBlocks(workspace, subBlock, list, block.id);
        }).reduce(function (a, b) {
          return a.concat(b);
        }, []);
      } else if (input.nodeName === 'VALUE') {
        value = [].concat(_toConsumableArray(subBlocks)).map(function (subBlock) {
          return xmlToBlocks(workspace, subBlock, list, block.id);
        }).reduce(function (a, b) {
          return a.concat(b);
        }, [])[0];
      }

      if (list && input.nodeName !== 'FIELD') blocks = blocks.concat(value);

      inputsMap[key] = value;
    });
  }
  block.inputs = inputsMap;

  if (!!nexts) {
    var nextBlocks = [].concat(_toConsumableArray(nexts)).map(function (nextBlock) {
      return xmlToBlocks(workspace, nextBlock, list, parent);
    }).reduce(function (a, b) {
      return a.concat(b);
    }, []);

    return blocks.concat(nextBlocks);
  } else {
    return blocks;
  }
}

function locationToCoords(blockly, location) {
  // Put the hint next to a block
  if (location.block) {
    // Get the blockly workspace location
    var offset = location.toolbox ? blockly.workspace.getFlyout_().getWorkspace().getOriginOffsetInPixels() : blockly.workspace.getOriginOffsetInPixels();
    var offsetX = blockly.offset.x + offset.x;
    var offsetY = blockly.offset.y + offset.y;

    // Put the hint after a block
    var blocks = location.toolbox ? blockly.toolbox : blockly.blocks;
    var block = blocks.find(function (block) {
      return block.type == location.block;
    });

    if (!!block) {
      if (location.dragBlock || location.modifyBlock) {
        return {
          // The left side of the block (or a custom offset)
          left: offsetX + block.bounds.topLeft.x + (location.offset ? location.offset.left : 10),
          // In the middle of the block (or a custom offset)
          top: offsetY + (location.offset ? block.bounds.topLeft.y + location.offset.top : (block.bounds.topLeft.y + block.bounds.bottomRight.y) / 2)
        };
      } else if (location.dragIntoBlock) {
        return {
          // A bit in from the left side of the block
          left: offsetX + block.bounds.topLeft.x + 40,
          // A bit up from the bottom of the block
          top: offsetY + block.bounds.bottomRight.y - 10
        };
      } else {
        return {
          // To the right of the block
          left: offsetX + block.bounds.bottomRight.x,
          // At the top of the block
          top: offsetY + block.bounds.topLeft.y
        };
      }
    } else {
      return undefined;
    }
  }
  // Put the hint after the last block
  else {
      // Get the blockly workspace location
      var _offset = location.toolbox ? blockly.workspace.getFlyout_().getWorkspace().getOriginOffsetInPixels() : blockly.workspace.getOriginOffsetInPixels();
      var _offsetX = blockly.offset.x + _offset.x;
      var _offsetY = blockly.offset.y + _offset.y;

      // Get the last block
      var _blocks = location.toolbox ? blockly.toolbox : blockly.blocks;
      var topLevelBlocks = _blocks.filter(function (block) {
        return !block.parent;
      });
      var lastBlock = topLevelBlocks[topLevelBlocks.length - 1];

      if (!!lastBlock) {
        return {
          // On left side of the block
          left: _offsetX + lastBlock.bounds.topLeft.x,
          // At the bottom of the block
          top: _offsetY + lastBlock.bounds.bottomRight.y
        };
      } else {
        return {
          // On the left side of the workspace 
          left: _offsetX + (location.dragBlock ? 0 : 50),
          // At the top of the workspace
          top: _offsetY + 50
        };
      }
    }
}

// Turn a block type into a CSS class
function blockClass(blockType) {
  // Get the category part of the block type
  var category = blockType.split('_')[0];

  // Get the class
  var theClass = void 0;
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
  } else if (blockType == 'math_number') {
    return '<bk class="math">10</bk>';
  } else {
    return blockType;
  }
}

// Turn a block type into inline html
function inlineBlock(blockType) {
  return '<bk class="' + blockClass(blockType) + '">\n  ' + blockLabel(blockType) + '\n</bk>';
}

function usefulHint(hint, blockTree) {
  // Hints for dragging the block to the right place
  if (hint.type == 'drag block') {
    // If the block needs to be dragged into another block
    if (hint.into) {
      // Get the block that the block needs to be dragged into
      var outerBlock = blockTree.find(function (block) {
        return block.type == hint.into.block;
      });

      if (outerBlock) {
        var contained = void 0;
        if (key) {
          // Is the block in the outer block's key?
          contained = blockContains(outerBlock, hint.into.key, hint.block);
        } else {
          // Is the block in the outer block anywhere?
          contained = false;
          for (var key in outerBlock.inputs) {
            contained = contained || blockContains(outerBlock, key, hint.block);
          }
        }

        if (contained && hint.into.after) {
          // Is the block after the other block already?
          var inner = outerBlock.inputs[hint.into.key];
          var blockIndex = inner.findIndex(function (block) {
            return block.type == hint.block;
          });
          var afterIndex = inner.findIndex(function (block) {
            return block.type == hint.into.after;
          });
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
      return !blockTree.find(function (block) {
        return block.type == hint.block;
      });
    }
  }
  // Hints for setting a block value
  else if (hint.type == 'set block value') {
      var block = blockTree.find(function (block) {
        return block.type == hint.block;
      });
      var value = block ? block.inputs[hint.key] : undefined;
      // The hint is useful if the value isn't the correct one yet or it is the incorrect one
      return hint.value && value != hint.value || hint.notValue && value == hint.notValue;
    }
}

function blockContains(outerBlock, key, innerBlockType) {
  // Get the block(s) for the given key
  var inner = outerBlock.inputs[key];

  if (inner) {
    // Does the outer block contain the inner block (either as a single block or one of multiple)?
    return inner.type == innerBlockType || inner.find && !!inner.find(function (block) {
      return block.type == innerBlockType;
    });
  } else {
    return false;
  }
}

function hintMessage(hint) {
  if (hint.type == 'drag block') {
    return '<p>Drag the <bk class="' + blockClass(hint.block) + '">' + blockLabel(hint.block) + '</bk> block into the ' + (hint.into ? inlineBlock(hint.into.block) + ' block' : 'workspace') + '.</p>';
  } else if (hint.type == 'set block value') {
    return hint.message;
  }
}

function hintLocation(hint) {
  // Put the hint where it's being dragged to
  if (hint.type == 'drag block') {
    if (hint.into) {
      return {
        block: hint.into.block
      };
    } else {
      return {
        place: 'workspace'
      };
    }
  }
  // Put the hint where the block being modified is
  else if (hint.type == 'set block value') {
      return {
        block: hint.block
      };
    }
}

function pointerStartLocation(hint) {
  // Start at the block in the toolbox
  if (hint.type == 'drag block') {
    return {
      block: hint.block,
      toolbox: true,
      dragBlock: true
    };
  }
  // Start at the block being modified
  else if (hint.type == 'set block value') {
      return {
        block: hint.block,
        modifyBlock: true,
        offset: hint.offset
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
        dragIntoBlock: true
      };
    }
    // Or just the workspace
    else {
        return {
          place: 'workspace',
          dragBlock: true
        };
      }
  }
  // End at the block being modified
  else if (hint.type == 'set block value') {
      return {
        block: hint.block,
        modifyBlock: true,
        offset: hint.offset
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

  // Save the goal completions
  vm.goals.map(function (goal) {
    Cookies.set('goals[' + goal.id + '].completed', goal.completed);
    Cookies.set('goals[' + goal.id + '].seen', goal.seen);
  });
}

function load(vm) {
  // Get blockly blocks
  var xml_text = Cookies.get('blocks');
  if (xml_text) {
    // Get blockly XML
    var xml = Blockly.Xml.textToDom(xml_text);
    // Insert blocks into workspace
    Blockly.Xml.domToWorkspace(xml, vm.blockly.workspace);
  }

  // Set the number of cookies
  vm.cookies = parseInt(Cookies.get('cookies')) || 0;

  // Load goal completion and seen statuses
  vm.goals.map(function (goal) {
    goal.completed = goal.completed || Cookies.get('goals[' + goal.id + '].completed') === 'true';
    goal.seen = goal.seen || Cookies.get('goals[' + goal.id + '].seen') === 'true';
    goal.unlocked = goal.completed || goal.seen;
  });

  // Set the selected goal to the first incomplete goal
  vm.selectedGoal = goals.find(function (goal) {
    return goal.completed !== true;
  });

  // Make sure the selected goal is unlocked!
  if (vm.selectedGoal) {
    vm.selectedGoal.unlocked = true;
  }
}