Blockly.Blocks['image_set'] = {
  init: function() {
    this.setColour(20);
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
    this.setColour(200);
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
    this.setColour(20);
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
  var code = 'document.querySelector("#cookie-clicker img").onclick = function() {\n' + doCode + '};\n';
  return code;
};

Blockly.Blocks['variables_change'] = {
  init: function() {
    this.setColour(270);
	this.setPreviousStatement(true);
	this.setNextStatement(true);

    this.appendDummyInput()
        .appendField('Change')
        .appendField(new Blockly.FieldVariable('cookies'), 'VARIABLE')
        .appendField("by")
        .appendField(new Blockly.FieldNumber('1'), 'NUMBER');
  },
};

Blockly.JavaScript['variables_change'] = function(block) {
  var variable = Blockly.JavaScript.variableDB_.getName(block.getFieldValue('VARIABLE'), Blockly.Variables.NAME_TYPE);
  var number = block.getFieldValue('NUMBER');
  var code = variable + ' += ' + number + ';\n';
  return code;
};


