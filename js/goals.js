let goals = [{
  id: 'Set image',
  title: 'Set the image',
  reward: 10,
  completed: false,
  seen: true,
  description: '<p>To make a Cookie Clicker first we need a picture to click!<p>',
  shortDescription: 'Set the image',
  checks: [{
    description: 'Add the set image block',
    hint: '<p>Drag the <bk class="io">set image</bk> block into the workspace.</p>',
    test: function(cookieClicker, blockly, cookies) {
      // Is there an image with a src?
      return !!cookieClicker.querySelector('img:not([src=""])')
    },
  }],
  hints: [{
    condition: function(blocks) {
      return !blocks.find(block => block.type === 'image_set');
    },
    hint: '<p>Drag the <bk class="io">set image</bk> block into the workspace.</p>',
    revealed: true,
    pointer: {
      from: {
        flyout: true,
        location: function(block) {
          return block.type === 'image_set';
        },
      },
      to: 'workspace',
    },
    location: 'workspace',
    cost: 5,
  }],
  interaction: {
    afterHint: 0,
    message: '<p>You did it!</p><p>Click the crumbs!</p>',
    clicks: 1,
  },
  prerequisites: [],
  blocks: ['image_set'],
}, {
  id: 'Choose image',
  title: 'Choose a cookie',
  reward: 10,
  completed: false,
  seen: false,
  description: '<p>Hmmm... looks like the image isn\'t a cookie yet.<p>',
  shortDescription: 'Set the image to a cookie',
  checks: [{
    description: 'Set the image to a cookie',
    hint: '<p>Click the dropdown arrow on the <bk class="io">set image</bk> block in your workspace. Then choose your cookie!</p>',
    test: function(cookieClicker, blockly, cookies) {
      // Is the image's src not crumbs?
      return !!cookieClicker.querySelector('img:not([src=""]):not([src="images/crumbs.jpg"])');
    },
  }],
  hints: [{
    condition: function(blocks) {
      return !blocks.find(block => block.type === 'image_set');
    },
    hint: '<p>Drag the <bk class="io">set image</bk> block into the workspace.</p>',
    revealed: true,
    location: 'workspace',
    cost: 5,
  }, {
    condition: function(blocks) {
      return !!blocks.find(block => block.type === 'image_set' && block.inputs['PICTURE'] === 'images/crumbs.jpg');
    },
    hint: '<p>Click the dropdown arrow on the <bk class="io">set image</bk> block. Then choose your cookie!</p>',
    buyHintDelay: 0,
    location: function(block) {
      return block.type === 'image_set';
    },
    cost: 5,
  }],
  interaction: {
    afterHint: 1,
    message: '<p>Awesome cookie!</p><p>Click it!</p>',
    clicks: 1,
  },
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
  shortDescription: 'Add a cookie on click',
  checks: [{
    description: 'Add the on click block',
    hint: '<p>Drag the <bk class="control">on click</bk> block into the workspace.</p>',
    test: function(cookieClicker, blockly, cookies) {
      // Was the on click block used?
      return blockly.workspace.getAllBlocks().some(block => block.type === 'on_click');
    },
  }, {
    description: 'Change the cookies variable',
    hint: '<p>Use the <bk class="var">add to <bk class="inner">cookies</bk></bk> block to change the cookie variable.</p>',
    test: function(cookieClicker, blockly, cookies) {
      // Click cookie
      cookieClicker.querySelector('img').dispatchEvent(new MouseEvent('click'));
      // Was the cookie value changed?
      let changed = cookieClicker.querySelector('img').cookies !== 0;

      return changed;
    },
  }, {
    description: 'Add to the cookies variable when the cookie is clicked',
    hint: '<p>Make sure the <bk class="var">add to <bk class="inner">cookies</bk></bk> block is inside of the <bk class="control">on click</bk> block.</p>',
    test: function(cookieClicker, blockly, cookies) {
      // Get original heading text
      let originalText = cookieClicker.querySelector('h1').textContent;
      // Click cookie
      cookieClicker.querySelector('img').dispatchEvent(new MouseEvent('click'));
      // Was the cookie value incremented?
      let incremented = cookieClicker.querySelector('img').cookies > cookies;

      return incremented;
    },
  }, {
    description: 'Add just one cookie',
    hint: '<p>You should only use one <bk class="var">add to <bk class="inner">cookies</bk></bk> block!</p>',
    test: function(cookieClicker, blockly, cookies) {
      // Get original heading text
      let originalText = cookieClicker.querySelector('h1').textContent;
      // Click cookie
      cookieClicker.querySelector('img').dispatchEvent(new MouseEvent('click'));
      // Was the cookie value incremented?
      let incremented = cookieClicker.querySelector('img').cookies == cookies+1;

      return incremented;
    },
  }],
  hints: [{
    condition: function(blocks) {
      return !blocks.find(block => block.type === 'on_click');
    },
    hint: '<p>Drag the <bk class="control">on click</bk> block into the workspace.</p>',
    pointer: {
      from: {
        flyout: true,
        location: function(block) {
          return block.type === 'on_click';
        },
      },
      to: 'workspace',
    },
    location: 'workspace',
    cost: 5,
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
    cost: 5,
  }, {
    condition: function(blocks) {
      return !!blocks.find(block => block.type === 'variables_add');
    },
    hint: '<p>If you don\'t  use the <bk class="var">add to <bk class="inner">cookies</bk></bk> block in the <bk class="control">on click</bk> block it will only add a cookie when you click the reset button!</p>',
    location: function(block) {
      return block.type === 'variables_add';
    },
    cost: 5,
  }],
  interaction: {
    afterHint: 1,
    message: '<p>Can you click the cookie 5 times?</p>',
    clicks: 5,
  },
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
  shortDescription: 'On click set the heading to the number of cookies',
  checks: [{
    description: 'Show \'No cookies\' at the start',
    hint: '<p>Make sure you don\'t use the <bk class="io">set heading</bk> block outside of the <bk class="control">on click</bk> block!</p>',
    test: function(cookieClicker, blockly, cookies) {
      // Get original heading text
      let originalText = cookieClicker.querySelector('h1').textContent;

      return originalText == 'No cookies';
    },
  }, {
    description: 'Add a cookie on click',
    hint: '<p>Make sure you are adding a cookie when you click the cookie image!</p>',
    test: function(cookieClicker, blockly, cookies) {
      return goals.find(goal => goal.id === 'On click').passing;
    },
  }, {
    description: 'Set the heading on click',
    hint: '<p>Add the <bk class="io">set heading</bk> block to the <bk class="control">on click</bk> block.</p>'
    + '<p>Make sure you set the heading <em>after</em> after you add to the cookies variable!</p>',
    test: function(cookieClicker, blockly, cookies) {
      // Get original heading text
      let originalText = cookieClicker.querySelector('h1').textContent;
      // Click cookie
      cookieClicker.querySelector('img').dispatchEvent(new MouseEvent('click'));
      // Was the heading set?
      let headingSet = cookieClicker.querySelector('h1').textContent !== originalText;

      return headingSet;
    },
  }, {
    description: 'Set the heading to the number of cookies on click',
    hint: '<p>Connect the <bk class="var">cookies</bk> <em>variable</em> to the <bk class="io">set heading</bk> block.</p>'
    + '<p>Make sure it\'s all inside of the <bk class="control">on click</bk> block.</p>',
    test: function(cookieClicker, blockly, cookies) {
      // Get original heading text
      let originalText = cookieClicker.querySelector('h1').textContent;
      // Click cookie
      cookieClicker.querySelector('img').dispatchEvent(new MouseEvent('click'));
      // Was the heading set?
      let headingSet = cookieClicker.querySelector('h1').textContent !== originalText;
      // Was the cookie value incremented?
      let incremented = cookieClicker.querySelector('img').cookies == cookies+1;
      // Was the heading updated as the number of cookies changed?
      let headingUpdated = parseInt(cookieClicker.querySelector('h1').textContent.replace(/[^\d]*/g, '')) == cookieClicker.querySelector('img').cookies;

      return headingSet && incremented && headingUpdated;
    },
  }],
  hints: [{
    condition: function(blockList) {
      return !blockList.find(block => block.type === 'on_click');
    },
    hint: '<p>Drag the <bk class="control">on click</bk> block into the workspace.</p>',
    location: 'workspace',
    cost: 5,
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
    cost: 5,
  }, {
    condition: function(blockList) {
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
    cost: 5,
  }],
  interaction: {
    afterHint: 1,
    message: '<p>Click the cookie to see the heading change.</p>',
    clicks: 5,
  },
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
  shortDescription: 'Set the heading to "X cookies"',
  checks: [{
    description: 'Count the number of cookies clicked',
    hint: '<p>Set the heading to the number of cookies on click. You can do this by finishing the \'How many cookies?\' goal.</p>',
    test: function(cookieClicker, blockly, cookies) {
      // Check if 'How many cookies' was complete
      return goals.find(goal => goal.id === 'Set heading on click').passing;
    },
  }, {
    description: 'Join cookies and "cookies" together',
    hint: '<p>Use <bk class="str">join text</bk> to join together the <bk class="var">cookies</bk> variable and the <bk class="str lit">Cookies</bk> string.</p>',
    test: function(cookieClicker, blockly, cookies) {
      // Was the join text block used with cookies and "a string"?
      return blockly.workspace.getAllBlocks().some(function(block) {
        let joinText = block.type == 'text_join';
        if (joinText) {
          // Check for cookies variable
          let cookiesVar = block.inputList.some(input => input.connection.targetConnection && input.connection.targetConnection.sourceBlock_.type == 'variables_get');
          // Check for cookies string
          let cookiesString = block.inputList.some(input => input.connection.targetConnection && input.connection.targetConnection.sourceBlock_.type == 'text');

          return cookiesVar && cookiesString;
        }
      });
    },
  }, {
    description: 'Set the heading to the joined text',
    hint: '<p>Once you have joined <bk class="var">cookies</bk> variable and the <bk class="str lit">Cookies</bk> string then connect them to the <bk class="io">set heading</bk> block.</p>',
    test: function(cookieClicker, blockly, cookies) {
      return blockly.workspace.getAllBlocks().some(function(block) {
        let setHeading = block.type == 'heading_set';
        if (setHeading) {
          let joinedText = block.inputList.some(input => input.connection.targetConnection && input.connection.targetConnection.sourceBlock_.type == 'text_join');
          return joinedText;
        }
      });
    },
  }, {
    description: 'Set the heading to the joined text on click',
    hint: '<p>Make sure you use the <bk class="io">set heading</bk> block inside of the <bk class="control">on click</bk> block!</p>',
    test: function(cookieClicker, blockly, cookies) {
      // Get original heading text
      let originalText = cookieClicker.querySelector('h1').textContent;
      let noCookies = originalText == 'No cookies';
      // Click cookie
      cookieClicker.querySelector('img').dispatchEvent(new MouseEvent('click'));
      // Does the heading have the correct number?
      let headingNumber = parseInt(cookieClicker.querySelector('h1').textContent.replace(/[^\d]*/g, '')) == cookieClicker.querySelector('img').cookies;
      // Does the heading have some text?
      let headingText = cookieClicker.querySelector('h1').textContent !== cookieClicker.querySelector('img').cookies+'';

      return noCookies && headingNumber && headingText;
    },
  }],
  hints: [{
    condition: function(blockList) {
      return !blockList.find(block => block.type === 'on_click');
    },
    hint: '<p>Drag the <bk class="control">on click</bk> block into the workspace.</p>',
    location: 'workspace',
    cost: 5,
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
    cost: 5,
  }, {
    condition: function(blockList) {
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
    cost: 5,
  }, {
    condition: function(blockList) {
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
    cost: 5,
  }],
  interaction: {
    afterHint: 1,
    message: '<p>Click the cookie to see the heading change.</p>',
    clicks: 5,
  },
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
  shortDescription: 'Upgrade the cookie after 10 clicks',
  checks: [{
    description: 'Count the number of cookies clicked',
    hint: '<p>Add a cookie every time the cookie image is clicked. You can do this by finishing the \'Click that cookie!\' goal.</p>',
    test: function(cookieClicker, blockly, cookies) {
      // Check if 'Click that cookie!' was complete
      return goals.find(goal => goal.id === 'On click').passing;
    },
  }, {
    description: 'Compare cookies with a number',
    hint: '<p>Use the <bk class="var">cookies</bk> variable inside of the <bk class="logic">≥ <bk class="math">10</bk></bk> block to check if at least 10 cookies have been clicked.</p>'
    + '<p>Connect <bk class="logic"><bk class="var">cookies</bk> ≥ <bk class="math">10</bk></bk> to the <bk class="control">if</bk> block.</p>',
    test: function(cookieClicker, blockly, cookies) {
      // Was the comparison block used with cookies, >=, and 10?
      return blockly.workspace.getAllBlocks().some(function(block) {
        let logicCompare = block.type == 'logic_compare';
        if (logicCompare) {
          // Check for cookies variable
          let cookiesVar = block.inputList.some(input => input.connection.targetConnection && input.connection.targetConnection.sourceBlock_.type == 'variables_get');
          // Check for a number
          let cookiesNumber = block.inputList.some(input => input.connection.targetConnection && input.connection.targetConnection.sourceBlock_.type == 'math_number');

          return cookiesVar && cookiesNumber;
        }
      });
    },
  }, {
    description: 'Set a new picture on click to upgrade the cookie',
    hint: '<p>Inside of the <bk class="control">on click</bk> and <bk class="control">if</bk> blocks use the <bk class="io">set image</bk> block to upgrade the picture of the cookie to a more awesome cookie.</p>'
    + '<p>Make sure that you don\'t change the picture to crumbs!</p>',
    test: function(cookieClicker, blockly, cookies) {
      // Get original picture
      let originalPicture = cookieClicker.querySelector('img').src;
      // Click cookie
      for (let i=0; i<1000; i++) {
        cookieClicker.querySelector('img').dispatchEvent(new MouseEvent('click'));
      }
      // Get new picture
      let newPicture = cookieClicker.querySelector('img').src;

      // Did the picture change?
      return newPicture !== originalPicture && !!cookieClicker.querySelector('img:not([src=""]):not([src="images/crumbs.jpg"])');
    },
  }, {
    description: 'Upgrade the cookie only once it has been clicked 10 times',
    hint: '<p>Connect <bk class="logic"><bk class="var">cookies</bk> ≥ <bk class="math">10</bk></bk> to the <bk class="control">if</bk> block.</p>'
    + '<p>Use <bk class="io">set image</bk> inside of the <bk class="control">if</bk> block.</p>'
    + '<p>Make sure the <bk class="control">if</bk> block is inside of the <bk class="control">on click</bk> block.</p>',
    test: function(cookieClicker, blockly, cookies) {
      // Keep track of whether the cookie changes before 10 clicks
      let earlyChange = false;
      // Get original picture
      let originalPicture = cookieClicker.querySelector('img').src;
      // Click cookie
      for (let i=0; i<10; i++) {
        // Has it changed?
        let newPicture = cookieClicker.querySelector('img').src;
        earlyChange = earlyChange || newPicture !== originalPicture;
        // Click!
        cookieClicker.querySelector('img').dispatchEvent(new MouseEvent('click'));
      }
      // Get new picture
      let newPicture = cookieClicker.querySelector('img').src;

      // Did the picture change at 10 clicks and not any clicks before?
      return !earlyChange && newPicture !== originalPicture;
    },
  }],
  hints: [{
    condition: function(blockList) {
      return !blockList.find(block => block.type === 'on_click');
    },
    hint: '<p>Drag the <bk class="control">on click</bk> block into the workspace.</p>',
    location: 'workspace',
    cost: 5,
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
    cost: 5,
  }, {
    condition: function(blockList) {
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
    cost: 5,
  }, {
    condition: function(blockList) {
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
    cost: 5,
  }, {
    condition: function(blockList) {
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
    cost: 5,
  }, {
    condition: function(blockList) {
      return blockList.some(block => block.type === 'image_set' && block.inputs['PICTURE'] === 'images/crumbs.jpg');
    },
    hint: '<p>Click the dropdown arrow on the <bk class="io">set image</bk> block. Then choose your cookie!</p>',
    location: function(block) {
      return block.type === 'image_set' && block.inputs['PICTURE'] === 'images/crumbs.jpg';
    },
    cost: 5,
  }, {
    condition: function(blockList) {
      let ifIndex = blockList.findIndex(block => block.type === 'controls_if');
      let addIndex = blockList.findIndex(block => block.type === 'variables_add');
      return (ifIndex > 1) && ifIndex < addIndex;
    },
    hint: '<p>Make sure the <bk class="control">if</bk> check happens after you <bk class="var">add to cookies</bk>.</p>',
    location: function(block) {
      return block.type === 'controls_if';
    },
    cost: 5,
  }],
  interaction: {
    afterHint: 0,
    message: '<p>Click the cookie to check if the cookie changes after 10 clicks.</p>',
    clicks: 10,
  },
  prerequisites: [
    'On click',
  ],
  blocks: ['controls_if', 'logic_compare', 'image_set'],
}];
