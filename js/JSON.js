Blockly.JSON = new Blockly.Generator('JSON');
Blockly.JSON.init = function(workspace) { return; }
Blockly.JSON.finish = function(code) { return JSON.stringify(code); }

Blockly.JSON.workspaceToCode = function(workspace) {
  if (!workspace) {
    // Backwards compatibility from before there could be multiple workspaces.
    console.warn('No workspace specified in workspaceToCode call.  Guessing.');
    workspace = Blockly.getMainWorkspace();
  }
  var code = [];
  // Pre processing
  this.init(workspace);
  // Get all disconnected blocks
  var blocks = workspace.getTopBlocks(true);
  // For each block...
  for (var x = 0, block; block = blocks[x]; x++) {
    // Convert the block (and sub blocks) to code
    var line = this.blockToCode(block);
    // Add non-empty blocks
    if (line) {
      code.push(line);
    }
  }
  // Post processing
  code = this.finish(code);
  return code;
};

Blockly.JSON.blockToCode = function(block) {
  // Empty blocks have no code
  if (!block)
    return;

  // Skip disabled blocks
  if (block.disabled)
    return Blockly.JSON.blockToCode(block.getNextBlock());
  
  var code;
  // Has the default JSON generation been overriden?
  var func = Blockly.JSON[block.type];
  if (func) {
    // Use the code from the definition
    code = func.call(block, block); 
  }
  // Use default JSON generation
  else {
    code = {
      block: block.type
    };
    // For each input
    if (block.inputList) {
      block.inputList.forEach(function(input) {
        // Get a value/statement input
        if (input.name) {
          code[input.name] = Blockly.JSON.blockToCode(input.connection.targetBlock());
        }
        // For each field value in the input
        input.fieldRow.forEach(function(field) {
          // If the field is named, get its value
          if (field.name) {
            code[field.name] = block.getFieldValue(field.name);
          }
        });
      });
    }
  }

  // Combine this block and the next block
  return this.withNextBlocks(block, code);
};

Blockly.JSON.withNextBlocks = function(block, code) {
  var nextBlock = block.nextConnection && block.nextConnection.targetBlock();
  var nextCode = Blockly.JSON.blockToCode(nextBlock);
  // Combine lists of statments
  if (nextCode)
    return [code].concat(nextCode);
  // Singular value inputs aren't lists
  else if (block.outputConnection && block.outputConnection.type == Blockly.OUTPUT_VALUE)
    return code;
  // Singular statements are lists
  else
    return [code];
};

Blockly.JSON.statementToCode = function(block, name) {
  // Get the block and turn it into code
  var targetBlock = block.getInputTargetBlock(name);
  var code = this.blockToCode(targetBlock);
  return code;
};


Blockly.JSON['on_click'] = function(block) {
  var doCode = Blockly.JSON.statementToCode(block, 'DO');
  return [{'block': 'ask', 'VALUE': 'XXX'}, { 'block': 'for', 'do': doCode }];
}
