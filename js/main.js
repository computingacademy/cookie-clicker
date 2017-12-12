var achievements = [{
  id: 'Set image',
  title: 'Set the image',
  reward: 10,
  completed: false,
  seen: true,
  description: '<p>To make a Cookie Clicker first we need a picture to click!<p>',
  checks: [{
    description: 'Add the set image block',
    hint: '<p>Drag the <bk class="io">set image</bk> block into the workspace.</p>',
    test: function(cookieClicker, cookies) {
      // Is there an image with a src?
      return !!cookieClicker.querySelector('img:not([src=""])')
    },
  }],
  hints: [{
    condition: function(blocks) {
      return !blocks.find(block => block.type === 'image_set');
    },
    hint: '<p>Drag the <bk class="io">set image</bk> block into the workspace.</p>',
    location: 'workspace',
  }],
  prerequisites: [],
  blocks: ['image_set'],
}, {
  id: 'Choose image',
  title: 'Choose a cookie',
  reward: 10,
  completed: false,
  seen: false,
  description: '<p>Hmmm... looks like the image isn\'t a cookie yet.<p>',
  checks: [{
    description: 'Set the image to a cookie',
    hint: '<p>Click the dropdown arrow on the <bk class="io">set image</bk> block in your workspace. Then choose your cookie!</p>',
    test: function(cookieClicker, cookies) {
      // Is the image's src not crumbs?
      return !!cookieClicker.querySelector('img:not([src=""]):not([src="images/crumbs.jpg"])');
    },
  }],
  hints: [{
    condition: function(blocks) {
      return !blocks.find(block => block.type === 'image_set');
    },
    hint: '<p>Drag the <bk class="io">set image</bk> block into the workspace.</p>',
    location: 'workspace',
  }, {
    condition: function(blocks) {
      return !!blocks.find(block => block.type === 'image_set' && block.inputs['PICTURE'] === 'images/crumbs.jpg');
    },
    hint: '<p>Click the dropdown arrow on the <bk class="io">set image</bk> block. Then choose your cookie!</p>',
    location: function(block) {
      return block.type === 'image_set';
    },
  }],
  prerequisites: [
    'Set image',
  ],
  blocks: ['image_set'],
}, {
  id: 'On click',
  title: 'Click that cookie!',
  reward: 50,
  completed: false,
  seen: false,
  description: '<p>Now that we have the cookie we need to add the most fun part of the Cookie Clicker. Adding cookies when we click!</p>',
  checks: [{
    description: 'Add the on click block',
    hint: '<p>Drag the <bk class="control">on click</bk> block into the workspace.</p>',
    test: function(cookieClicker, cookies) {
      // Was the on click block used?
      return workspace.getAllBlocks().some(block => block.type === 'on_click');
    },
  }, {
    description: 'Change the cookies variable',
    hint: '<p>Use the <bk class="var">add to <bk class="inner">cookies</bk></bk> block to change the cookie variable.</p>',
    test: function(cookieClicker, cookies) {
      // Click cookie
      cookieClicker.querySelector('img').dispatchEvent(new MouseEvent('click'));
      // Was the cookie value changed?
      var changed = window._cookies !== 0;

      return changed;
    },
  }, {
    description: 'Add to the cookies variable when the cookie is clicked',
    hint: '<p>Make sure the <bk class="var">add to <bk class="inner">cookies</bk></bk> block is inside of the <bk class="control">on click</bk> block.</p>',
    test: function(cookieClicker, cookies) {
      // Get original heading text
      var originalText = cookieClicker.querySelector('h1').textContent;
      // Click cookie
      cookieClicker.querySelector('img').dispatchEvent(new MouseEvent('click'));
      // Was the cookie value incremented?
      var incremented = window._cookies > cookies;

      return incremented;
    },
  }, {
    description: 'Add just one cookie',
    hint: '<p>You should only use one <bk class="var">add to <bk class="inner">cookies</bk></bk> block!</p>',
    test: function(cookieClicker, cookies) {
      // Get original heading text
      var originalText = cookieClicker.querySelector('h1').textContent;
      // Run the code to see if the change cookies variable was added at the start of the program
      runCode();
      // Click cookie
      cookieClicker.querySelector('img').dispatchEvent(new MouseEvent('click'));
      // Was the cookie value incremented?
      var incremented = window._cookies == cookies+1;
      // Reset cookie value
      window._cookies = cookies;
      cookieClicker.querySelector('h1').textContent = originalText;

      return incremented;
    },
  }],
  hints: [{
    condition: function(blocks) {
      return !blocks.find(block => block.type === 'on_click');
    },
    hint: '<p>Drag the <bk class="control">on click</bk> block into the workspace.</p>',
    location: 'workspace',
  }, {
    condition: function(blocks) {
      // Do no on_click blocks have a variables_add block?
      let clickBlocks = blocks.filter(block => block.type === 'on_click');
      return clickBlocks.length !== 0 &&
        !clickBlocks
        .filter(block => block.inputs['DO'] !== undefined)
        .some(block => !!block.inputs['DO'].find(block => block.type === 'variables_add'));
    },
    hint: '<p>Drag the <bk class="var">add to <bk class="inner">cookies</bk></bk> block into the <bk class="control">on click</bk> block.</p>',
    location: function(block) {
      return block.type === 'on_click';
    },
  }, {
    condition: function(blocks) {
      return !!blocks.find(block => block.type === 'variables_add');
    },
    hint: '<p>If you don\'t  use the <bk class="var">add to <bk class="inner">cookies</bk></bk> block in the <bk class="control">on click</bk> block it will only add a cookie when you click the reset button!</p>',
    location: function(block) {
      return block.type === 'variables_add';
    },
  }],
  prerequisites: [
    'Set image',
    'Choose image',
  ],
  blocks: ['on_click', 'variables_add'],
}, {
  id: 'Set heading on click',
  title: 'How many cookies?',
  reward: 40,
  completed: false,
  seen: false,
  description: '<p>How many cookies have we clicked this game? Set the heading to the number of cookies so we can see!</p>',
  checks: [{
    description: 'Show \'No cookies\' at the start',
    hint: '<p>Make sure you don\'t use the <bk class="io">set heading</bk> block outside of the <bk class="control">on click</bk> block!</p>',
    test: function(cookieClicker, cookies) {
      // Get original heading text
      var originalText = cookieClicker.querySelector('h1').textContent;

      return originalText == 'No cookies';
    },
  }, {
    description: 'Add a cookie on click',
    hint: '<p>Make sure you are adding a cookie when you click the cookie image!</p>',
    test: function(cookieClicker, cookies) {
      return achievements.find(achievement => achievement.id === 'On click').passing;
    },
  }, {
    description: 'Set the heading on click',
    hint: '<p>Add the <bk class="io">set heading</bk> block to the <bk class="control">on click</bk> block.</p>'
    + '<p>Make sure you set the heading <em>after</em> after you add to the cookies variable!</p>',
    test: function(cookieClicker, cookies) {
      // Get original heading text
      var originalText = cookieClicker.querySelector('h1').textContent;
      // Click cookie
      cookieClicker.querySelector('img').dispatchEvent(new MouseEvent('click'));
      // Was the heading set?
      var headingSet = cookieClicker.querySelector('h1').textContent !== originalText;

      return headingSet;
    },
  }, {
    description: 'Set the heading to the number of cookies on click',
    hint: '<p>Connect the <bk class="var">cookies</bk> <em>variable</em> to the <bk class="io">set heading</bk> block.</p>'
    + '<p>Make sure it\'s all inside of the <bk class="control">on click</bk> block.</p>',
    test: function(cookieClicker, cookies) {
      // Get original heading text
      var originalText = cookieClicker.querySelector('h1').textContent;
      // Click cookie
      cookieClicker.querySelector('img').dispatchEvent(new MouseEvent('click'));
      // Was the heading set?
      var headingSet = cookieClicker.querySelector('h1').textContent !== originalText;
      // Was the cookie value incremented?
      var incremented = window._cookies == cookies+1;
      // Was the heading updated as the number of cookies changed?
      var headingUpdated = parseInt(cookieClicker.querySelector('h1').textContent.replace(/[^\d]*/g, '')) == window._cookies;

      return headingSet && incremented && headingUpdated;
    },
  }],
  hints: [{
    condition: function(blockTree, blockList) {
      return !blockList.find(block => block.type === 'on_click');
    },
    hint: '<p>Drag the <bk class="control">on click</bk> block into the workspace.</p>',
    location: 'workspace',
  }, {
    condition: function(blocks) {
      // Do no on_click blocks have a heading_set block?
      let clickBlocks = blocks.filter(block => block.type === 'on_click');
      return clickBlocks.length !== 0 &&
        !clickBlocks
        .filter(block => block.inputs['DO'] !== undefined)
        .some(block => !!block.inputs['DO'].find(block => block.type === 'heading_set'));
    },
    hint: '<p>Drag the <bk class="io">set heading</bk> block into the <bk class="control">on click</bk> block.</p>',
    location: function(block) {
      return block.type === 'on_click';
    },
  }, {
    condition: function(blockTree, blockList) {
      // Are there any heading set blocks?
      // Do none of them have a variables_get block?
      let headingSets = blockList.filter(block => block.type === 'heading_set');
      return headingSets.length !== 0 &&
        !headingSets
        .filter(block => block.inputs['VALUE'] !== undefined)
        .find(block => block.inputs['VALUE'].type === 'variables_get');
    },
    hint: '<p>Connect <bk class="var">cookies</bk> to <bk class="io">set heading</bk> to change the heading to the number of cookies.</p>',
    location: function(block) {
      return block.type === 'heading_set';
    },
  }],
  prerequisites: [
    'On click',
  ],
  blocks: ['heading_set', 'variables_get'],
}, {
  id: 'Join text',
  title: 'Show me the cookies!',
  reward: 60,
  completed: false,
  seen: false,
  description: '<p>Once you\'re counting the number of cookies add the word "cookies" to the heading so a person playing knows what the number means!</p>',
  checks: [{
    description: 'Count the number of cookies clicked',
    hint: '<p>Set the heading to the number of cookies on click. You can do this by finishing the \'How many cookies?\' goal.</p>',
    test: function(cookieClicker, cookies) {
      // Check if 'How many cookies' was complete
      return achievements.find(achievement => achievement.id === 'Set heading on click').passing;
    },
  }, {
    description: 'Join cookies and "cookies" together',
    hint: '<p>Use <bk class="str">join text</bk> to join together the <bk class="var">cookies</bk> variable and the <bk class="str lit">Cookies</bk> string.</p>',
    test: function(cookieClicker, cookies) {
      // Was the join text block used with cookies and "a string"?
      return workspace.getAllBlocks().some(function(block) {
        var joinText = block.type == 'text_join';
        if (joinText) {
          // Check for cookies variable
          var cookiesVar = block.inputList.some(input => input.connection.targetConnection && input.connection.targetConnection.sourceBlock_.type == 'variables_get');
          // Check for cookies string
          var cookiesString = block.inputList.some(input => input.connection.targetConnection && input.connection.targetConnection.sourceBlock_.type == 'text');

          return cookiesVar && cookiesString;
        }
      });
    },
  }, {
    description: 'Set the heading to the joined text',
    hint: '<p>Once you have joined <bk class="var">cookies</bk> variable and the <bk class="str lit">Cookies</bk> string then connect them to the <bk class="io">set heading</bk> block.</p>',
    test: function(cookieClicker, cookies) {
      return workspace.getAllBlocks().some(function(block) {
        var setHeading = block.type == 'heading_set';
        if (setHeading) {
          var joinedText = block.inputList.some(input => input.connection.targetConnection && input.connection.targetConnection.sourceBlock_.type == 'text_join');
          return joinedText;
        }
      });
    },
  }, {
    description: 'Set the heading to the joined text on click',
    hint: '<p>Make sure you use the <bk class="io">set heading</bk> block inside of the <bk class="control">on click</bk> block!</p>',
    test: function(cookieClicker, cookies) {
      // Get original heading text
      var originalText = cookieClicker.querySelector('h1').textContent;
      var noCookies = originalText == 'No cookies';
      // Click cookie
      cookieClicker.querySelector('img').dispatchEvent(new MouseEvent('click'));
      // Does the heading have the correct number?
      var headingNumber = parseInt(cookieClicker.querySelector('h1').textContent.replace(/[^\d]*/g, '')) == window._cookies;
      // Does the heading have some text?
      var headingText = cookieClicker.querySelector('h1').textContent !== window._cookies+'';

      return noCookies && headingNumber && headingText;
    },
  }],
  hints: [{
    condition: function(blockTree, blockList) {
      return !blockList.find(block => block.type === 'on_click');
    },
    hint: '<p>Drag the <bk class="control">on click</bk> block into the workspace.</p>',
    location: 'workspace',
  }, {
    condition: function(blocks) {
      // Do no on_click blocks have a heading_set block?
      let clickBlocks = blocks.filter(block => block.type === 'on_click');
      return clickBlocks.length !== 0 &&
        !clickBlocks
        .filter(block => block.inputs['DO'] !== undefined)
        .some(block => !!block.inputs['DO'].find(block => block.type === 'heading_set'));
    },
    hint: '<p>Drag the <bk class="io">set heading</bk> block into the <bk class="control">on click</bk> block.</p>',
    location: function(block) {
      return block.type === 'on_click';
    },
  }, {
    condition: function(blockTree, blockList) {
      // Are there any set_heading blocks?
      // Do none of them have a text_join block?
      let headingSets = blockList.filter(block => block.type === 'heading_set');
      return headingSets.length !== 0 &&
        !headingSets
        .filter(block => block.inputs['VALUE'] !== undefined)
        .find(block => block.inputs['VALUE'].type === 'text_join');
    },
    hint: '<p>Connect <bk class="str">join text</bk> to <bk class="io">set heading</bk> to set the heading to the joined text.</p>',
    location: function(block) {
      return block.type === 'heading_set';
    },
  }, {
    condition: function(blockTree, blockList) {
      // Are there any text_join blocks?
      // Do none of them have a variables_get and text block?
      let textJoins = blockList.filter(block => block.type === 'text_join');
      return textJoins.length !== 0 &&
        !(
        textJoins
        .filter(block => block.inputs['ADD0'] !== undefined)
        .find(block => block.inputs['ADD0'].type === 'variables_get')
        &&
        textJoins
        .filter(block => block.inputs['ADD1'] !== undefined)
        .find(block => block.inputs['ADD1'].type === 'text')
        );
    },
    hint: '<p>Connect <bk class="var">cookies</bk> and <bk class="str lit">cookies</bk> to <bk class="str">join text</bk> to join them.</p>',
    location: function(block) {
      return block.type === 'text_join';
    },
  }],
  prerequisites: [
    'Set heading on click',
  ],
  blocks: ['text_join', 'text', 'variables_get'],
}, {
  id: 'If statement',
  title: 'Cookie upgrade',
  reward: 70,
  completed: false,
  seen: false,
  description: '<p>We need some cool rewards for people playing our cookie clicker so they keep clicking that cookie! Let\'s change the cookie picture to a cooler cookie once 10 cookies have been clicked.</p>',
  checks: [{
    description: 'Count the number of cookies clicked',
    hint: '<p>Add a cookie every time the cookie image is clicked. You can do this by finishing the \'Click that cookie!\' goal.</p>',
    test: function(cookieClicker, cookies) {
      // Check if 'Click that cookie!' was complete
      return achievements.find(achievement => achievement.id === 'On click').passing;
    },
  }, {
    description: 'Compare cookies with a number',
    hint: '<p>Use the <bk class="var">cookies</bk> variable inside of the <bk class="logic">≥ <bk class="math">10</bk></bk> block to check if at least 10 cookies have been clicked.</p>'
    + '<p>Connect <bk class="logic"><bk class="var">cookies</bk> ≥ <bk class="math">10</bk></bk> to the <bk class="control">if</bk> block.</p>',
    test: function(cookieClicker, cookies) {
      // Was the comparison block used with cookies, >=, and 10?
      return workspace.getAllBlocks().some(function(block) {
        var logicCompare = block.type == 'logic_compare';
        if (logicCompare) {
          // Check for cookies variable
          var cookiesVar = block.inputList.some(input => input.connection.targetConnection && input.connection.targetConnection.sourceBlock_.type == 'variables_get');
          // Check for a number
          var cookiesNumber = block.inputList.some(input => input.connection.targetConnection && input.connection.targetConnection.sourceBlock_.type == 'math_number');

          return cookiesVar && cookiesNumber;
        }
      });
    },
  }, {
    description: 'Set a new picture on click to upgrade the cookie',
    hint: '<p>Inside of the <bk class="control">on click</bk> and <bk class="control">if</bk> blocks use the <bk class="io">set image</bk> block to upgrade the picture of the cookie to a more awesome cookie.</p>'
    + '<p>Make sure that you don\'t change the picture to crumbs!</p>',
    test: function(cookieClicker, cookies) {
      // Get original picture
      var originalPicture = cookieClicker.querySelector('img').src;
      // Click cookie
      for (var i=0; i<1000; i++) {
        cookieClicker.querySelector('img').dispatchEvent(new MouseEvent('click'));
      }
      // Get new picture
      var newPicture = cookieClicker.querySelector('img').src;

      // Did the picture change?
      return newPicture !== originalPicture && !!cookieClicker.querySelector('img:not([src=""]):not([src="images/crumbs.jpg"])');
    },
  }, {
    description: 'Upgrade the cookie only once it has been clicked 10 times',
    hint: '<p>Connect <bk class="logic"><bk class="var">cookies</bk> ≥ <bk class="math">10</bk></bk> to the <bk class="control">if</bk> block.</p>'
    + '<p>Use <bk class="io">set image</bk> inside of the <bk class="control">if</bk> block.</p>'
    + '<p>Make sure the <bk class="control">if</bk> block is inside of the <bk class="control">on click</bk> block.</p>',
    test: function(cookieClicker, cookies) {
      // Keep track of whether the cookie changes before 10 clicks
      var earlyChange = false;
      // Get original picture
      var originalPicture = cookieClicker.querySelector('img').src;
      // Click cookie
      for (let i=0; i<10; i++) {
        // Has it changed?
        var newPicture = cookieClicker.querySelector('img').src;
        earlyChange = earlyChange || newPicture !== originalPicture;
        // Click!
        cookieClicker.querySelector('img').dispatchEvent(new MouseEvent('click'));
      }
      // Get new picture
      var newPicture = cookieClicker.querySelector('img').src;

      // Did the picture change at 10 clicks and not any clicks before?
      return !earlyChange && newPicture !== originalPicture;
    },
  }],
  hints: [{
    condition: function(blockTree, blockList) {
      return !blockList.find(block => block.type === 'on_click');
    },
    hint: '<p>Drag the <bk class="control">on click</bk> block into the workspace.</p>',
    location: 'workspace',
  }, {
    condition: function(blocks) {
      // Do no on_click blocks have an if block?
      let clickBlocks = blocks.filter(block => block.type === 'on_click');
      return clickBlocks.length !== 0 &&
        !clickBlocks
        .filter(block => block.inputs['DO'] !== undefined)
        .some(block => !!block.inputs['DO'].find(block => block.type === 'controls_if'));
    },
    hint: '<p>Drag the <bk class="control">if</bk> block into the <bk class="control">on click</bk> block.</p>',
    location: function(block) {
      return block.type === 'on_click';
    },
  }, {
    condition: function(blockTree, blockList) {
      // Are there any controls_if blocks?
      // Do none of them have a logic_compare block?
      let controlsIf = blockList.filter(block => block.type === 'controls_if');
      return controlsIf.length !== 0 &&
        !controlsIf
        .filter(block => block.inputs['IF0'] !== undefined)
        .find(block => block.inputs['IF0'].type === 'logic_compare');
    },
    hint: '<p>Connect <bk class="logic"> ≥ <bk class="math">10</bk></bk> to <bk class="control">if</bk> to check if a value is 10 or more.</p>',
    location: function(block) {
      return block.type === 'controls_if';
    },
  }, {
    condition: function(blockTree, blockList) {
      // Are there any logic_compare blocks?
      // Do none of them have a variables_get and math_number block and GTE operator?
      let logicCompares = blockList.filter(block => block.type === 'logic_compare');
      return logicCompares.length !== 0 &&
        !(
        logicCompares
        .filter(block => block.inputs['A'] !== undefined)
        .find(block => block.inputs['A'].type === 'variables_get')
        &&
        logicCompares
        .filter(block => block.inputs['OP'] !== undefined)
        .find(block => block.inputs['OP'] === 'GTE')
        &&
        logicCompares
        .filter(block => block.inputs['B'] !== undefined)
        .find(block => block.inputs['B'].type === 'math_number')
        );
    },
    hint: '<p>Add <bk class="var">cookies</bk> inside of <bk class="logic"> ≥ <bk class="math">10</bk></bk> to check if there are 10 or more cookies.</p>',
    location: function(block) {
      return block.type === 'controls_if';
    },
  }, {
    condition: function(blockTree, blockList) {
      // Are there any controls_if blocks?
      // Do none of them have a image_set block?
      let controlsIf = blockList.filter(block => block.type === 'controls_if');
      return controlsIf.length !== 0 &&
        !controlsIf
        .filter(block => block.inputs['DO0'] !== undefined)
        .find(block => block.inputs['DO0'].find(block => block.type === 'image_set'));
    },
    hint: '<p>Add the <bk class="io">set image</bk> block to the <em>do</em> section of <bk class="control">if</bk> so it will happen when the condition is <em>true</em>.</p>',
    location: function(block) {
      return block.type === 'controls_if';
    },
  }, {
    condition: function(blockTree, blockList) {
      return blockList.some(block => block.type === 'image_set' && block.inputs['PICTURE'] === 'images/crumbs.jpg');
    },
    hint: '<p>Click the dropdown arrow on the <bk class="io">set image</bk> block. Then choose your cookie!</p>',
    location: function(block) {
      return block.type === 'image_set' && block.inputs['PICTURE'] === 'images/crumbs.jpg';
    },
  }, {
    condition: function(blockTree, blockList) {
      let ifIndex = blockList.findIndex(block => block.type === 'controls_if');
      let addIndex = blockList.findIndex(block => block.type === 'variables_add');
      return (ifIndex > 1) && ifIndex < addIndex;
    },
    hint: '<p>Make sure the <bk class="control">if</bk> check happens after you <bk class="var">add to cookies</bk>.</p>',
    location: function(block) {
      return block.type === 'controls_if';
    },
  }],
  prerequisites: [
    'On click',
  ],
  blocks: ['controls_if', 'logic_compare', 'image_set'],
}];

window._cookies = 0;

function runCode() {
  Blockly.JavaScript.addReservedWords('code');
  var code = 'window._cookies = 0;\n'
    + 'document.querySelector("#cookie-clicker h1").textContent = "No cookies";\n'
    + 'var image = document.querySelector("#cookie-clicker img");\n'
    + 'var clone = image.cloneNode(true);\n'
    + 'clone.src = "";\n'
    + 'image.parentNode.replaceChild(clone, image);\n'
    + Blockly.JavaScript.workspaceToCode(workspace).replace(/var cookies;\n/, '');
  try {
    eval(code);
  } catch (e) {
  }
}

let unlockedBlocks = ['image_set'];
function updateAchievements(silent) {
  // Get blocks from workspace
  let blockTree = workspaceToBlocks(workspace);
  let blockList = workspaceToBlocks(workspace, true);
  // Keep track of if any new achievements have been completed
  let newCompletions = [];

  achievements.map(function(achievement) {
    // Check hint conditions
    achievement.hints.forEach(function(hint) {
      Vue.set(hint, 'useful', hint.condition(blockTree, blockList));
    });

    // Perform each check
    let passes = achievement.checks.map(function(check) {
      let passed = doCheck(check);
      Vue.set(check, 'passing', passed);
      return passed;
    });
    // Is this achievement currently passing all checks?
    let passing = passes.every(pass => pass);
    Vue.set(achievement, 'passing', passing);
    // Is this a new achievement completion?
    if (!achievement.completed && passing) {
      newCompletions.push(achievement)
    }
    // Has this achievement ever been completed?
    achievement.completed = achievement.completed || passing;
    // Update cookies with achievement status
    Cookies.set(`achievements[${achievement.id}].completed`, achievement.completed);
  });

  // Update the selected achievement if a previous achievement has been newly completed
  if (newCompletions.length !== 0) {
    let rewards = newCompletions
      .map(achievement => achievementRewards(achievement))
      .reduce((a, b) => a.concat(b));
    if (!silent) {
      mainVue.goalRewards = rewards
        .filter(reward => !(reward.type === 'block' && unlockedBlocks.includes(reward.block)) && !(reward.type === 'goal' && achievements.find(achievement => achievement.id === reward.goal)));
    }
  }

  // Unlock achievement which have completed prerequisites or have been completed
  achievements.forEach(function(achievement) {
    // Get the achievement's prereqs
    let prereqs = achievements.filter(prereq => achievement.prerequisites.includes(prereq.id));
    // See if they've been completed
    let unlocked = achievement.completed || prereqs.every(prereq => prereq.completed);
    // Update unlocked status
    Vue.set(achievement, 'unlocked', unlocked);
  });

  // Unlock blocks that are needed
  unlockedBlocks = achievements
    // Only use unlocked achievements
    .filter(achievement => achievement.unlocked)
    // Get the blocks
    .map(achievement => achievement.blocks)
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
  var cookieClicker = document.querySelector('#cookie-clicker');
  var cookiesFreeze = window._cookiesFreeze;
  window._cookiesFreeze = true;
  var originalCookies = window._cookies;
  var originalHeading = cookieClicker.querySelector('h1').textContent;
  runCode();
  var result = check.test(cookieClicker, window.cookies);
  window._cookies = originalCookies;
  cookieClicker.querySelector('h1').textContent = originalHeading;
  window._cookiesFreeze = cookiesFreeze;
  return result;
}

function achievementRewards(achievement) {
  let rewards = [];
  
  // Cookie rewards
  rewards.push({
    type: 'cookies',
    amount: achievement.reward,
  });

  // Goal rewards
  let newAchievements = achievements
    .filter(newAchievement => newAchievement.prerequisites.includes(achievement.id))
    .filter(newAchievement => newAchievement.prerequisites.every(prereq => achievements.find(achievement => achievement.id == prereq).completed));
  newAchievements.forEach(function(newAchievement) {
    rewards.push({
      type: 'goal',
      goal: newAchievement.title,
    });
  });

  // Block rewards
  newAchievements
    .map(achievement => achievement.blocks)
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
    .map(block => xmlToBlocks(block, list))
    .reduce((a,b) => a.concat(b), []);

  return blocks;
}

// Turn workspace XML into block JSON
function xmlToBlocks(xml, list) {
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
            .map(subBlock => xmlToBlocks(subBlock, list))
            .reduce((a,b) => a.concat(b), []);
        } else if (input.nodeName === 'VALUE') {
          value = [...subBlocks]
            .map(subBlock => xmlToBlocks(subBlock, list))
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
      .map(nextBlock => xmlToBlocks(nextBlock, list))
      .reduce((a,b) => a.concat(b), []);

    return blocks.concat(nextBlocks);
  } else {
    return blocks;
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
  // Load achievement completion and seen statuses
  achievements.map(function(achievement) {
    achievement.completed = achievement.completed || Cookies.get(`achievements[${achievement.id}].completed`) === 'true';
    achievement.seen = achievement.seen || Cookies.get(`achievements[${achievement.id}].seen`) === 'true';
  });
}

let blocklyComponent = Vue.component('blockly-editor', {
  template: '<div id="blockly-div"></div>',
  mounted:function() {
    window.workspace = Blockly.inject(this.$el,
      { media: 'blockly/media/',
        toolbox: document.getElementById('toolbox')
      });

    workspace.addChangeListener(function(event) {
      // This is a little bit hacky
      // We are checking to see if the block is still in the process of being dragged in from the toolbox
      let dragCreation = event.xml && event.xml.getAttribute('x') < 0;
      // Check if the event is just selecting a block
      let selection = event.type == Blockly.Events.UI && event.element == 'selected';

      if (!dragCreation && !selection) {
        updateAchievements();
        runCode();
        save();
      }
    });

    // A nasty hack to wait until Blockly is set up to load blocks
    setTimeout(function() {
      load();
      updateAchievements(true);
      // Select first uncompleted achievement or the last one if they are all completed
      mainVue.selectedAchievement = achievements.find(achievement => !achievement.completed) || achievements[achievements.length-1] || {checks: [], hints: []};
    }, 10);

    this.__instance = workspace;
  },
});

let cookieCounter = Vue.component('cookie-counter', {
  template: `
<div id="cookie-counter">
  <img src="images/choc-chip.png">
  <span id="cookie-count">{{cookies}}</span>
</div>`,
  props: ['cookies'],
});

let cookieClickerControls =  Vue.component('cookie-clicker-controls', {
  template: `
<div id="cookie-clicker-controls">
  <button v-on:click="reset()" id="reset">
    <span class="icon icon-spinner11"></span>
    Reset
  </button>
</div>`,
  methods: {
    reset: function() {
      runCode();
      save();
    },
    mark: function() {
      updateAchievements();
    },
  },
});

let achievementsComponent = Vue.component('achievement-list', {
  template: `
<div id="course-nav-tray">
<div id="course-nav-tray-container" class="">
  <ol v-for="achievement in achievements" v-if="achievement.unlocked" class="slide-group">
    <li
        class="slide"
        v-on:click="select(achievement)">
      <a href="#"
          class="js-slide-link problem" v-bind:class="classes(achievement)">
        <h3 class="slide-title">
          {{ achievement.title }}
        </h3>
        <span class="tooltip-area hide-open" data-toggle="tooltip" data-placement="right" data-container="body" title="" v-bind:data-original-title="achievement.title"></span>
        <span class="slide-jump-pip"></span>
      </a>
    </li>
  </ol>
</div>
</div>`,
  props: ['achievements', 'selected'],
  methods: {
    select: function(achievement) {
      // Update whether the achievement has been seen or not
      clearTimeout(this.seenTimeout);
      this.seenTimeout = setTimeout(function() {
        Vue.set(achievement, 'seen', true);
        Cookies.set(`achievements[${achievement.id}].seen`, achievement.seen);
      }, 2500);

      // Update selection
      this.$emit('select', achievement);
    },
    classes: function(achievement) {
      return {
        current: achievement == this.selected,
        solved: achievement.completed,
        passed: achievement.passing,
      };
    },
  },
});

let achievementDescription = Vue.component('achievement-description', {
  template: `
<div id="achievement">
  <h2>{{ achievement.title }}</h2>
  <div id="description" v-html="achievement.description"></div>
</div>`,
  props: ['achievement'],
});

let blocklyHints = Vue.component('blockly-hints', {
  template: `
<div id="blockly-hints" v-bind:style="workspacePosition(top, left, width, height)">
  <div v-for="hint in hints" v-if="hint.useful" v-html="hint.hint" class="blockly-hint" v-bind:style="position(hint.location, moved)">
  </div>
</div>`,
  props: ['hints'],
  data: function(hints) {
    return {
      top: 0,
      left: 0,
      width: 0,
      height: 0,
      moved: 0,
    };
  },
  mounted: function() {
    let vue = this;
    let resize = function(event) {
      let blocklyDiv = document.querySelector('#blockly-div');
      let bbox = blocklyDiv.getBoundingClientRect();
      vue.top = bbox.top;
      vue.left = bbox.left;
      vue.width = bbox.width;
      vue.height = bbox.height;
    };

    resize();
    window.addEventListener('resize', resize);

    // Hack!
    setTimeout(function() {
      window.workspace.addChangeListener(function(event) {
        if (event.type === Blockly.Events.BLOCK_MOVE)
          vue.moved++;
      });
    }, 100);
  },
  computed: {
  },
  methods: {
    workspacePosition(top, left, width, height) {
      return {
        top: top+'px',
        left: left+'px',
        width: width+'px',
        height: height+'px',
      };
    },
    position: function(location, moved) {
      let offset = workspace.getOriginOffsetInPixels();
      if (location === 'workspace') {
        return {
          left: offset.x+'px',
          top: offset.y+'px',
        };
      } else if (location) {
        let blockTree = workspaceToBlocks(workspace);
        let blockList = workspaceToBlocks(workspace, true);
        let block = blockList.find(location);

        if (!!block)
          return {
            left: (block.bounds.bottomRight.x+offset.x)+'px',
            top: (block.bounds.topLeft.y+offset.y)+'px',
          };
        else
          return {};
      } else {
        return {};
      }
    },
  },
});

let achievementMarks = Vue.component('achievement-marks', {
  template: `
<ul id="marks">
  <li v-for="check in achievement.checks" class="result-wrapper">
    <div class="result-indicator" v-bind:class="passed(check.passing)">
      <span v-bind:class="completion(check.passing)" title="title(check.passing)" role="img"></span>
    </div>
    <div class="result-text">
      <button v-if="!check.showHint" v-on:click="show(check)">
        <span class="icon icon-eye"></span>
        Show hint
      </button>
      <button v-if="check.showHint" v-on:click="hide(check)">
        <span class="icon icon-eye-blocked"></span>
        Hide hint
      </button>
      <h3>{{ check.description }}</h3>
      <div v-if="check.showHint" v-html="check.hint"></div>
    </div>
  </li>
</ul>`,
  props: ['achievement'],
  methods: {
    passed: function(passing) {
      return {
        'passed': passing,
        'failed': !passing,
      };
    },
    completion: function(passing) {
      return {
        'icon-checkbox-checked': passing,
        'passed-indicator': passing,
        'icon-checkbox-unchecked': !passing,
        'failed-indicator': !passing,
      };
    },
    title: function(passed) {
      if (passed) {
        return 'Passed';
      } else {
        return 'Failed';
      }
    },
    show: function(check) {
      Vue.set(check, 'showHint', true);
    },
    hide: function(check) {
      Vue.set(check, 'showHint', false);
    },
  },
});

let cookieRewards = Vue.component('cookie-rewards', {
  template: `
<div v-if="rewards.length !== 0" id="cookie-rewards">
  <h1>You unlocked...</h1>
  <div v-if="state == 'cookie'" v-bind:style="position()" class="reward-cookie"></div>
  <ul v-if="state == 'rewards'" v-bind:style="position()">
    <li v-for="reward in rewards">
      <span v-if="reward.type == 'cookies'" class="cookies">
        {{ reward.amount }} cookies
      </span>
      <span v-if="reward.type == 'block'" class="block">
        The
        <bk v-if="reward.block == 'image_set'" class="io">set image</bk>
        <bk v-if="reward.block == 'heading_set'" class="io">set heading</bk>
        <bk v-if="reward.block == 'on_click'" class="control">on click</bk>
        <bk v-if="reward.block == 'variables_add'" class="var">Add to cookies</bk>
        <bk v-if="reward.block == 'variables_get'" class="var">cookies</bk>
        <bk v-if="reward.block == 'text_join'" class="str">Join text</bk>
        <bk v-if="reward.block == 'text'" class="str lit">Cookies</bk>
        <bk v-if="reward.block == 'controls_if'" class="control">if</bk>
        <bk v-if="reward.block == 'logic_compare'" class="logic"> ≥ <bk class="math">10</bk></bk>
        block
      </span>
    </li>
  </ul>
<div id="fullscreen" v-on:click="unlock()"></div>
</div>`,
  props: ['rewards'],
  data: function() {
    return {
      state: 'cookie',
    };
  },
  watch: {
    rewards: function(rewards) {
      this.state = 'cookie';
    }
  },
  methods: {
    position: function() {
      let width = 400;
      let height = 600;
      return {
        left: (screen.availWidth - width)/2 + 'px',
        top: (screen.availHeight - height)/2 + 'px',
        width: width+'px',
        height: height+'px',
      };
    },
    unlock: function() {
      if (this.state == 'cookie') {
        this.state = 'rewards';
        let bbox = document.querySelector('.reward-cookie').getBoundingClientRect();
        let x = bbox.left + bbox.width/2;
        let y = bbox.top + bbox.width/2;
        screenCookieFirework(document.querySelector('#firework-overlay'), x, y);

        let cookies = this.rewards
          .filter(reward => reward.type == 'cookies')
          .reduce((total, reward) => total + reward.amount, 0);
        window.cookies += cookies;
      } else if (this.state == 'rewards') {
        let firstNew = achievements.find(achievement => achievement.unlocked && !achievement.seen && !achievement.completed);
        mainVue.selectedAchievement = firstNew || achievements[achievements.length-1] || {checks: [], hints: []};
        mainVue.goalRewards = [];
      }
    },
  },
});

Vue.config.ignoredElements = ['bk'];

let mainVue = new Vue({
  el: '#main',
  data: {
    achievements: achievements,
    selectedAchievement: achievements.find(achievement => !achievement.completed) || achievements[0] || {checks: [], hints: []},
    cookies: window.cookies,
    goalRewards: [],
  },
  methods: {
    selectAchievement: function(achievement) {
      this.selectedAchievement = achievement;
    },
  },
  watch: {
    cookies: function() {
      // Save cookies to web page's cookie
      Cookies.set('cookies', this.cookies);
    }
  },
});

// Connect the cookies variable in the cookie clicker game to the overall cookie counter
Object.defineProperty(window, 'cookies', {
  get: function() {
    // Get the number of cookies
    return this._cookies;
  },
  set: function(val) {
    // Update cookies value
    if (!window._cookiesFreeze) {
      mainVue.cookies = (mainVue.cookies + val-this._cookies) || val;
    }
    this._cookies = val;
  }
});
