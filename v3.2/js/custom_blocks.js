'use strict';

Blockly.Blocks['image_set'] = {
  init: function init() {
    this.setColour('#900090');
    this.setPreviousStatement(true);
    this.setNextStatement(true);

    var options = [{ url: 'plate.png', name: 'none' }, { url: 'anzac.png', name: 'Anzac biscuit' }, { url: 'biscotti.png', name: 'biscotti' }, { url: 'butter-cookie-choc.png', name: 'butter choc cookie' }, { url: 'butter-cookie.png', name: 'butter vookie' }, { url: 'chinese-almond.png', name: 'chinese almond cookie' }, { url: 'choc-chip.png', name: 'choc chip cookie' }, { url: 'choc-digestive.png', name: 'choc digestive' }, { url: 'choc-pretzel.png', name: 'choc pretzel' }, { url: 'fortune.png', name: 'fortune cookie' }, { url: 'gingerbread.png', name: 'gingerbread cookie' }, { url: 'macaron.png', name: 'macaron' }, { url: 'raspberry-ice.png', name: 'rasperry ice biscuit' }, { url: 'scotch-finger.png', name: 'Scotch finger' }, { url: 'strawberry-sugar.png', name: 'strawberry sugar biscuit' }, { url: 'stroopwafel.png', name: 'stroopwafel' }, { url: 'taiyaki.png', name: 'taiyaki' }].map(function (img) {
      return [{ 'src': 'images/' + img.url, 'width': 25, 'height': 25, 'alt': img.name }, 'images/' + img.url];
    });

    this.appendDummyInput().appendField('set image to').appendField(new Blockly.FieldDropdown(options), 'PICTURE');
  }
};

Blockly.JavaScript['image_set'] = function (block) {
  var picture = block.getFieldValue('PICTURE');
  var code = 'image.src = "' + picture + '";\n';
  return code;
};

Blockly.Blocks['heading_set'] = {
  init: function init() {
    this.setColour('#900090');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.appendValueInput('VALUE').setCheck(['String', 'Label']).appendField('set heading to');
  }
};

Blockly.JavaScript['heading_set'] = function (block) {
  var text = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_FUNCTION_CALL) || '\'\'';;
  var code = 'heading.textContent = ' + text + ';\n';
  return code;
};

Blockly.Blocks['on_click'] = {
  init: function init() {
    this.setColour('#ff7700');
    this.setPreviousStatement(true);
    this.setNextStatement(true);

    this.appendDummyInput().appendField('on click');

    this.appendStatementInput('DO').appendField('do');
  }
};

Blockly.JavaScript['on_click'] = function (block) {
  var doCode = Blockly.JavaScript.statementToCode(block, 'DO');
  var code = 'image.addEventListener("click", function() {\n' + doCode + '});\n';
  return code;
};

Blockly.Blocks['variables_label'] = {
  init: function init() {
    this.setColour('#cccccc');
    this.appendDummyInput().appendField(new Blockly.FieldLabel('cookies'), 'LABEL');
    this.setOutput(true);
    this.setHelpUrl(Blockly.Msg.VARIABLES_GET_HELPURL);
    this.setTooltip(Blockly.Msg.VARIABLES_GET_TOOLTIP);
  }
};

Blockly.JavaScript['variables_label'] = function (block) {
  var variableLabel = block.getFieldValue('LABEL');
  var variableName = Blockly.JavaScript.variableDB_.getName(variableLabel);
  return [variableName, '\n'];
};

Blockly.Blocks['variables_add_one'] = {
  init: function init() {
    this.setColour('#909090');
    this.setPreviousStatement(true);
    this.setNextStatement(true);

    this.appendValueInput('VAR').appendField('add 1 to');
  }
};

Blockly.JavaScript['variables_add_one'] = function (block) {
  var variableCode = Blockly.JavaScript.valueToCode(block, 'VAR', Blockly.JavaScript.ORDER_NONE) || 'variable';
  var code = variableCode + ' += 1;\n';
  return code;
};

Blockly.Msg.TEXT_JOIN_TITLE_CREATEWITH = 'join text';

// Set colours of existing blocks
function setColour(block, color) {
  var prev_init = Blockly.Blocks[block].init;
  Blockly.Blocks[block] = {
    init: function init() {
      prev_init.call(this, arguments);
      this.setColour(color);
    }
  };
}

setColour('variables_get', '#909090');
setColour('text_join', '#00aa00');
setColour('text', '#00aa00');
setColour('controls_if', '#ff7700');
setColour('logic_compare', '#fed651');
setColour('math_number', '#0080e4');

// Remove mutators from existing blocks
function removeMutator(block) {
  var prev_init = Blockly.Blocks[block].init;
  Blockly.Blocks[block] = {
    init: function init() {
      prev_init.call(this, arguments);
      this.setMutator(undefined);
    }
  };
}

removeMutator('controls_if');
removeMutator('text_join');