Blockly.Blocks['image_set'] = {
  init: function() {
    this.setColour('#900090');
    this.setPreviousStatement(true);
    this.setNextStatement(true);

    var options = [
      {url: 'plate.png', name: 'none'},
      {url: 'anzac.png', name: 'Anzac biscuit'},
      {url: 'biscotti.png', name: 'biscotti'},
      {url: 'butter-cookie-choc.png', name: 'butter choc cookie'},
      {url: 'butter-cookie.png', name: 'butter vookie'},
      {url: 'chinese-almond.png', name: 'chinese almond cookie'},
      {url: 'choc-chip.png', name: 'choc chip cookie'},
      {url: 'choc-digestive.png', name: 'choc digestive'},
      {url: 'choc-pretzel.png', name: 'choc pretzel'},
      {url: 'fortune.png', name: 'fortune cookie'},
      {url: 'gingerbread.png', name: 'gingerbread cookie'},
      {url: 'macaron.png', name: 'macaron'},
      {url: 'raspberry-ice.png', name: 'rasperry ice biscuit'},
      {url: 'scotch-finger.png', name: 'Scotch finger'},
      {url: 'strawberry-sugar.png', name: 'strawberry sugar biscuit'},
      {url: 'stroopwafel.png', name: 'stroopwafel'},
      {url: 'taiyaki.png', name: 'taiyaki'},
    ].map(function(img) {
      return [{'src': 'images/'+img.url, 'width': 25, 'height': 25, 'alt': img.name}, 'images/'+img.url];
    });

    this.appendDummyInput()
        .appendField('Set image to')
        .appendField(new Blockly.FieldDropdown(options), 'PICTURE');
  },
};

Blockly.JavaScript['image_set'] = function(block) {
  var picture = block.getFieldValue('PICTURE');
  var code = 'image.src = "' + picture + '";\n';
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
  var code = 'heading.textContent = ' + text + ';\n';
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
  var code = 'image.addEventListener("click", function() {\n' + doCode + '});\n';
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

Blockly.Msg.TEXT_JOIN_TITLE_CREATEWITH = 'Join text'

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

// Remove mutators from existing blocks
function removeMutator(block) {
  let prev_init = Blockly.Blocks[block].init;
  Blockly.Blocks[block] = {
    init: function() {
      prev_init.call(this, arguments);
      this.setMutator(undefined);
    },
  }
}

removeMutator('controls_if');
removeMutator('text_join');
