var workspace = Blockly.inject('blockly-div',
  { media: 'blockly/media/',
    toolbox: document.getElementById('toolbox4')
  });

function runCode() {
  Blockly.JavaScript.addReservedWords('code');
  var code = 'var cookies = 0;\n'
    + 'document.querySelector("#cookie-clicker h1").textContent = "";\n'
    + 'var image = document.querySelector("#cookie-clicker img");\n'
    + 'var clone = image.cloneNode(true);\n'
    + 'clone.src = "";\n'
    + 'image.parentNode.replaceChild(clone, image);\n'
    + Blockly.JavaScript.workspaceToCode(workspace);
  try {
    eval(code);
    document.querySelector('code').textContent = code;
  } catch (e) {
    document.querySelector('code').textContent = e + '\n\n' + code;
  }
}

function step(n) {
  workspace.updateToolbox(document.getElementById('toolbox'+n));
}

workspace.addChangeListener(runCode);
