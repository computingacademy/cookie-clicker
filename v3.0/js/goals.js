'use strict';

var goals = [{
  id: 'Set image',
  title: 'Set the image',
  reward: 10,
  unlocked: true,
  completed: false,
  seen: true,
  description: '<p>To make a Cookie Clicker we need a picture to click!</p>',
  shortDescription: 'Change the cookie\'s picture',
  checks: [{
    description: 'Add the set image block',
    test: function test(cookieClicker, blockly, cookies) {
      // Is there an image with a src?
      var cookie = cookieClicker.querySelector('.cookie');
      return cookie.src != '';
    }
  }],
  hints: [{
    revealed: true,
    direct: true,
    cost: 5,
    hint: '<p>We need to <em>set the image</em> so we can see it!</p>',
    type: 'drag block',
    block: 'image_set'
  }],
  interaction: {
    clicks: 1,
    message: '<p>You did it!</p><p>Click the crumbs!</p>'
  },
  prerequisites: []
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
    test: function test(cookieClicker, blockly, cookies) {
      // Is the image's src not crumbs?
      var cookie = cookieClicker.querySelector('.cookie');
      return cookie.src != '' && cookie.src != 'images/crumbs.jpg';
    }
  }],
  hints: [{
    revealed: true,
    cost: 5,
    hint: '<p>We need to set the image so we can see it!</p>',
    type: 'drag block',
    block: 'image_set'
  }, {
    cost: 5,
    hint: '<p>Change the image from <bk class="io"><bk class="inner">none</bk></bk> to a picture of a cookie.</p>',
    type: 'set block value',
    block: 'image_set',
    key: 'PICTURE',
    notValue: 'images/crumbs.jpg',
    message: '<p>Click the dropdown arrow on the <bk class="io">set image</bk> block. Then choose your cookie!</p>',
    offset: {
      left: 132,
      top: 15
    },
    buyHintDelay: 0
  }],
  interaction: {
    clicks: 1,
    message: '<p>Awesome cookie!</p><p>Click it!</p>'
  },
  prerequisites: ['Set image']
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
    test: function test(cookieClicker, blockly, cookies) {
      // Was the on click block used?
      return blockly.workspace.getAllBlocks().some(function (block) {
        return block.type === 'on_click';
      });
    }
  }, {
    description: 'Change the cookies variable',
    test: function test(cookieClicker, blockly, cookies) {
      // Click cookie
      cookieClicker.querySelector('.cookie').dispatchEvent(new MouseEvent('click'));
      // Was the cookie value changed?
      var changed = cookieClicker.querySelector('.cookie').cookies !== 0;

      return changed;
    }
  }, {
    description: 'Add to the cookies variable when the cookie is clicked',
    test: function test(cookieClicker, blockly, cookies) {
      // Get original heading text
      var originalText = cookieClicker.querySelector('h1').textContent;
      // Click cookie
      cookieClicker.querySelector('.cookie').dispatchEvent(new MouseEvent('click'));
      // Was the cookie value incremented?
      var incremented = cookieClicker.querySelector('.cookie').cookies > cookies;

      return incremented;
    }
  }, {
    description: 'Add just one cookie',
    test: function test(cookieClicker, blockly, cookies) {
      // Get original heading text
      var originalText = cookieClicker.querySelector('h1').textContent;
      // Click cookie
      cookieClicker.querySelector('.cookie').dispatchEvent(new MouseEvent('click'));
      // Was the cookie value incremented?
      var incremented = cookieClicker.querySelector('.cookie').cookies == cookies + 1;

      return incremented;
    }
  }],
  hints: [{
    cost: 5,
    hint: '<p>We need to use a block that detects when a click happens.</p>',
    type: 'drag block',
    block: 'on_click'
  }, {
    cost: 5,
    hint: '<p>Every time we click we need to add a cookie.</p><p>You can drag a block <em>into</em> <bk class="control">on click</bk> to make that block happen when the cookie is clicked.</p>',
    type: 'drag block',
    block: 'variables_add',
    into: {
      block: 'on_click',
      key: 'DO'
    }
  }],
  interaction: {
    clicks: 5,
    message: '<p>Can you click the cookie 5 times?</p>'
  },
  prerequisites: ['Set image', 'Choose image']
}, {
  id: 'Set heading on click',
  title: 'How many cookies?',
  reward: 40,
  completed: false,
  seen: false,
  description: '<p>How many cookies have we clicked this game? Set the heading to the number of cookies so we can see!</p>',
  shortDescription: 'On click, set the heading to the number of cookies',
  checks: [{
    description: 'Show \'No cookies\' at the start',
    hint: '<p>Make sure you don\'t use the <bk class="io">set heading</bk> block outside of the <bk class="control">on click</bk> block!</p>',
    test: function test(cookieClicker, blockly, cookies) {
      // Get original heading text
      var originalText = cookieClicker.querySelector('h1').textContent;

      return originalText == 'No cookies';
    }
  }, {
    description: 'Add a cookie on click',
    test: function test(cookieClicker, blockly, cookies) {
      // Check if 'Click that cookie!' was complete
      return checksPass(blockly, goals.find(function (goal) {
        return goal.id === 'On click';
      }));
    }
  }, {
    description: 'Set the heading on click',
    hint: '<p>Add the <bk class="io">set heading</bk> block to the <bk class="control">on click</bk> block.</p>' + '<p>Make sure you set the heading <em>after</em> after you add to the cookies variable!</p>',
    test: function test(cookieClicker, blockly, cookies) {
      // Get original heading text
      var originalText = cookieClicker.querySelector('h1').textContent;
      // Click cookie
      cookieClicker.querySelector('.cookie').dispatchEvent(new MouseEvent('click'));
      // Was the heading set?
      var headingSet = cookieClicker.querySelector('h1').textContent !== originalText;

      return headingSet;
    }
  }, {
    description: 'Set the heading to the number of cookies on click',
    test: function test(cookieClicker, blockly, cookies) {
      // Get original heading text
      var originalText = cookieClicker.querySelector('h1').textContent;
      // Click cookie
      cookieClicker.querySelector('.cookie').dispatchEvent(new MouseEvent('click'));
      // Was the heading set?
      var headingSet = cookieClicker.querySelector('h1').textContent !== originalText;
      // Was the cookie value incremented?
      var incremented = cookieClicker.querySelector('.cookie').cookies == cookies + 1;
      // Was the heading updated as the number of cookies changed?
      var headingUpdated = parseInt(cookieClicker.querySelector('h1').textContent.replace(/[^\d]*/g, '')) == cookieClicker.querySelector('.cookie').cookies;

      return headingSet && incremented && headingUpdated;
    }
  }],
  hints: [{
    cost: 5,
    hint: '<p>You need to change the heading <em>on click</em>.<p>',
    type: 'drag block',
    block: 'on_click'
  }, {
    cost: 5,
    hint: '<p>Make sure you add a cookie on every click!<p>',
    type: 'drag block',
    block: 'variables_add',
    into: {
      block: 'on_click',
      key: 'DO'
    }
  }, {
    cost: 5,
    hint: '<p>You need to <em>set the heading</em> after each time you change the number of cookies.<p>',
    type: 'drag block',
    block: 'heading_set',
    into: {
      block: 'on_click',
      key: 'DO',
      after: 'variables_add'
    }
  }, {
    cost: 5,
    hint: '<p>Set the heading to the number of <bk class="var"><bk class="inner">cookies</bk></bk>.<p>',
    type: 'drag block',
    block: 'variables_get',
    into: {
      block: 'heading_set',
      key: 'VALUE'
    }
  }],
  interaction: {
    clicks: 5,
    message: '<p>Click the cookie to see the heading change.</p><p>Click 5 times to complete the goal!</p>'
  },
  prerequisites: ['On click']
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
    test: function test(cookieClicker, blockly, cookies) {
      // Check if 'Click that cookie!' was complete
      return checksPass(blockly, goals.find(function (goal) {
        return goal.id === 'On click';
      }));
    }
  }, {
    description: 'Join cookies and "cookies" together',
    test: function test(cookieClicker, blockly, cookies) {
      // Was the join text block used with cookies and "a string"?
      return blockly.workspace.getAllBlocks().some(function (block) {
        var joinText = block.type == 'text_join';
        if (joinText) {
          // Check for cookies variable
          var cookiesVar = block.inputList.some(function (input) {
            return input.connection.targetConnection && input.connection.targetConnection.sourceBlock_.type == 'variables_get';
          });
          // Check for cookies string
          var cookiesString = block.inputList.some(function (input) {
            return input.connection.targetConnection && input.connection.targetConnection.sourceBlock_.type == 'text';
          });

          return cookiesVar && cookiesString;
        }
      });
    }
  }, {
    description: 'Set the heading to the joined text',
    test: function test(cookieClicker, blockly, cookies) {
      return blockly.workspace.getAllBlocks().some(function (block) {
        var setHeading = block.type == 'heading_set';
        if (setHeading) {
          var joinedText = block.inputList.some(function (input) {
            return input.connection.targetConnection && input.connection.targetConnection.sourceBlock_.type == 'text_join';
          });
          return joinedText;
        }
      });
    }
  }, {
    description: 'Set the heading to the joined text on click',
    test: function test(cookieClicker, blockly, cookies) {
      // Get original heading text
      var originalText = cookieClicker.querySelector('h1').textContent;
      var noCookies = originalText == 'No cookies';
      // Click cookie
      cookieClicker.querySelector('.cookie').dispatchEvent(new MouseEvent('click'));
      // Does the heading have the correct number?
      var headingNumber = parseInt(cookieClicker.querySelector('h1').textContent.replace(/[^\d]*/g, '')) == cookieClicker.querySelector('.cookie').cookies;
      // Does the heading have some text?
      var headingText = cookieClicker.querySelector('h1').textContent !== cookieClicker.querySelector('.cookie').cookies + '';

      return noCookies && headingNumber && headingText;
    }
  }],
  hints: [{
    cost: 5,
    hint: '<p>We need to make sure that we can detect when a click happens!</p>',
    type: 'drag block',
    block: 'on_click'
  }, {
    cost: 5,
    hint: '<p>Set the heading after you add cookies on click.</p>',
    type: 'drag block',
    block: 'heading_set',
    into: {
      block: 'on_click',
      key: 'DO',
      after: 'variables_add'
    }
  }, {
    cost: 5,
    hint: '<p>You need to <em>join</em> together two blocks when you set this heading.</p>',
    type: 'drag block',
    block: 'text_join',
    into: {
      block: 'heading_set',
      key: 'VALUE'
    }
  }, {
    cost: 5,
    hint: '<p>We need to have the number of <bk class="var"><bk class="inner">cookies</bk></bk> in our joined text.</p>',
    type: 'drag block',
    block: 'variables_get',
    into: {
      block: 'text_join'
    }
  }, {
    cost: 5,
    hint: '<p>We need to have the text <bk class="str">“ <bk class="inner"> Cookies</bk> ”</bk> in our joined text.</p>',
    type: 'drag block',
    block: 'text',
    into: {
      block: 'text_join'
    }
  }],
  interaction: {
    clicks: 5,
    message: '<p>Click the cookie 5 times and watch the heading change.</p>'
  },
  prerequisites: ['Set heading on click']
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
    test: function test(cookieClicker, blockly, cookies) {
      // Check if 'Click that cookie!' was complete
      return checksPass(blockly, goals.find(function (goal) {
        return goal.id === 'On click';
      }));
    }
  }, {
    description: 'Compare cookies with a number',
    test: function test(cookieClicker, blockly, cookies) {
      // Was the comparison block used with cookies, >=, and 10?
      return blockly.workspace.getAllBlocks().some(function (block) {
        var logicCompare = block.type == 'logic_compare';
        if (logicCompare) {
          // Check for cookies variable
          var cookiesVar = block.inputList.some(function (input) {
            return input.connection.targetConnection && input.connection.targetConnection.sourceBlock_.type == 'variables_get';
          });
          // Check for a number
          var cookiesNumber = block.inputList.some(function (input) {
            return input.connection.targetConnection && input.connection.targetConnection.sourceBlock_.type == 'math_number';
          });

          return cookiesVar && cookiesNumber;
        }
      });
    }
  }, {
    description: 'Set a new picture on click to upgrade the cookie',
    test: function test(cookieClicker, blockly, cookies) {
      // Get original picture
      var originalPicture = cookieClicker.querySelector('.cookie').src;
      // Click cookie
      for (var i = 0; i < 1000; i++) {
        cookieClicker.querySelector('.cookie').dispatchEvent(new MouseEvent('click'));
      }
      // Get new picture
      var newPicture = cookieClicker.querySelector('.cookie').src;

      // Did the picture change?
      return newPicture !== originalPicture && !!cookieClicker.querySelector('.cookie:not([src=""]):not([src="images/crumbs.jpg"])');
    }
  }, {
    description: 'Upgrade the cookie only once it has been clicked 10 times',
    test: function test(cookieClicker, blockly, cookies) {
      // Keep track of whether the cookie changes before 10 clicks
      var earlyChange = false;
      // Get original picture
      var originalPicture = cookieClicker.querySelector('.cookie').src;
      // Click cookie
      for (var i = 0; i < 10; i++) {
        // Has it changed?
        var _newPicture = cookieClicker.querySelector('.cookie').src;
        earlyChange = earlyChange || _newPicture !== originalPicture;
        // Click!
        cookieClicker.querySelector('.cookie').dispatchEvent(new MouseEvent('click'));
      }
      // Get new picture
      var newPicture = cookieClicker.querySelector('.cookie').src;

      // Did the picture change at 10 clicks and not any clicks before?
      return !earlyChange && newPicture !== originalPicture;
    }
  }],
  hints: [{
    cost: 5,
    hint: '<p>Which block can detect if a click has happened? Make sure you include that block!</p>',
    type: 'drag block',
    block: 'on_click'
  }, {
    cost: 5,
    hint: '<p>Which block can detect <em>if</em> something is true?</p>',
    type: 'drag block',
    block: 'controls_if',
    into: {
      block: 'on_click',
      key: 'DO'
    }
  }, {
    cost: 5,
    hint: '<p>We need to tell the <bk class="control">if</bk> block that we need something to be <em>greater than or equal to 10</em>.</p>',
    type: 'drag block',
    block: 'logic_compare',
    into: {
      block: 'controls_if',
      key: 'IF0'
    }
  }, {
    cost: 5,
    hint: '<p>What value do we need to make sure is more than 10?</p>',
    type: 'drag block',
    block: 'variables_get',
    into: {
      block: 'logic_compare',
      key: 'A'
    }
  }, {
    cost: 5,
    hint: 'You need to check that the number of cookies is <em>greater than or equal to</em> 10.</p>',
    type: 'set block value',
    block: 'logic_compare',
    key: 'OP',
    value: 'GTE',
    message: '<p>Click the dropdown arrow and select the ≥ symbol</p>'
  }, {
    cost: 5,
    hint: '<p>Make sure you\'re comparing the cookies to the correct number!</p>',
    type: 'drag block',
    block: 'math_number',
    into: {
      block: 'logic_compare',
      key: 'B'
    }
  }, {
    cost: 5,
    hint: '<p>Now we know <em>if</em> there are greater than or equal to 10 cookies.</p><p>We need the image of the cookie to change <em>if</em> there are greater than or equal to 10 cookies.</p><p>You can put a block <em>inside</em> of an <bk class="control">if</bk> to make that block happen when the <bk class="control">if</bk> is true.</p>',
    type: 'drag block',
    block: 'image_set',
    into: {
      block: 'controls_if',
      key: 'DO0'
    }
  }],
  interaction: {
    clicks: 10,
    message: '<p>Click the cookie to check if the cookie changes after 10 clicks.</p>'
  },
  prerequisites: ['On click']
}];