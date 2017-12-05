Blockly.Blocks['image_set'] = {
  init: function() {
    this.setColour('#900090');
    this.setPreviousStatement(true);
    this.setNextStatement(true);

    var options = [
      ['none', 'NONE'],
      [{'src': 'images/choc-chip.png', 'width': 25, 'height': 25, 'alt': 'Choc Chip Cookie'}, 'images/choc-chip.png'],
      [{'src': 'images/christmas.png', 'width': 25, 'height': 25, 'alt': 'Christmas Cookie'}, 'images/christmas.png'],
      [{'src': 'images/fortune.png', 'width': 25, 'height': 25, 'alt': 'Fortune Cookie'}, 'images/fortune.png'],
    ]
    this.appendDummyInput()
        .appendField('Set image to')
        .appendField(new Blockly.FieldDropdown(options), 'PICTURE');
  },
};

Blockly.JavaScript['image_set'] = function(block) {
  var picture = block.getFieldValue('PICTURE');
  var code = 'document.querySelector("#cookie-clicker img").src = "' + picture + '";\n';
  return code;
}

Blockly.Blocks['heading_set'] = {
  init: function() {
    this.setColour('#900090');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.appendValueInput('VALUE')
        .setCheck('String')
        .appendField('Set heading to');
  },
};

Blockly.JavaScript['heading_set'] = function(block) {
  var text = Blockly.JavaScript.valueToCode(block, 'VALUE',
      Blockly.JavaScript.ORDER_FUNCTION_CALL) || '\'\'';;
  var code = 'document.querySelector("#cookie-clicker h1").textContent = ' + text + ';\n';
  return code;
};

Blockly.Blocks['on_click'] = {
  init: function() {
    this.setColour('#ff7700');
	this.setPreviousStatement(true);
	this.setNextStatement(true);

    this.appendDummyInput()
        .appendField('On click');

	this.appendStatementInput('DO')
		.appendField('do');
  },
};


Blockly.JavaScript['on_click'] = function(block) {
  var doCode = Blockly.JavaScript.statementToCode(block, 'DO');
  var code = 'document.querySelector("#cookie-clicker img").addEventListener("click", function() {\n' + doCode + '});\n';
  return code;
};

Blockly.Blocks['variables_add'] = {
  init: function() {
    this.setColour('#909090');
	this.setPreviousStatement(true);
	this.setNextStatement(true);

    this.appendDummyInput()
        .appendField('Add')
        .appendField(new Blockly.FieldNumber('1'), 'NUMBER')
        .appendField("to")
        .appendField(new Blockly.FieldVariable('cookies'), 'VARIABLE');
  },
};

Blockly.JavaScript['variables_add'] = function(block) {
  var variable = Blockly.JavaScript.variableDB_.getName(block.getFieldValue('VARIABLE'), Blockly.Variables.NAME_TYPE);
  var number = block.getFieldValue('NUMBER');
  var code = variable + ' += ' + number + ';\n';
  return code;
};

// Set colours of existing blocks
function setColour(block, color) {
  let prev_init = Blockly.Blocks[block].init;
  Blockly.Blocks[block] = {
    init: function() {
      prev_init.call(this, arguments);
      this.setColour(color);
    }
  }
}

setColour('variables_get', '#909090');
setColour('text_join', '#00aa00');
setColour('text', '#00aa00');
setColour('controls_if', '#ff7700');
setColour('logic_compare', '#fed651');
setColour('math_number', '#0080e4');
