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
      // Is the image's src nrt nothing?
      return !!cookieClicker.querySelector('img:not([src=""]):not([src=NONE])');
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
      // Was the set heading block used?
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
      var headingUpdated = cookieClicker.querySelector('h1').textContent == window._cookies+'';

      return headingSet && incremented && headingUpdated;
    },
  }],
  prerequisites: [
    'On click',
  ],
  blocks: ['heading_set', 'variables_get'],
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

function updateAchievements(silent) {
  // Keep track of if any new achievements have been completed
  let newCompletions = [];

  achievements.map(function(achievement) {
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
    achievement.completed |= passing;
    // Update cookies with achievement status
    Cookies.set(`achievements[${achievement.id}].completed`, achievement.completed);
  });

  // Update the selected achievement if a previous achievement has been newly completed
  if (newCompletions.length !== 0) {
    if (!silent) {
      alert(`You completed ${newCompletions.length} new goals!`);
    }
    mainVue.selectedAchievement = achievements.find(achievement => !achievement.completed) || achievements[achievements.length-1];
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
  let unlockedBlocks = achievements
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
    achievement.completed = Cookies.get(`achievements[${achievement.id}].completed`) === 'true';
    achievement.seen |= Cookies.get(`achievements[${achievement.id}].seen`) === 'true';
  });
}

let blocklyComponent = Vue.component('blockly-editor', {
  template: '<div id="blockly-div"></div>',
  mounted:function() {
    window.workspace = Blockly.inject(this.$el,
      { media: 'blockly/media/',
        toolbox: document.getElementById('toolbox')
      });

    workspace.addChangeListener(function() {
      runCode();
      save();
    });

    // A nasty hack to wait until Blockly is set up to load blocks
    setTimeout(function() {
      load();
      updateAchievements(true);
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
  <button v-on:click="mark()" id="mark">
    <span class="icon icon-star-full"></span>
    Mark
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
        <span class="tooltip-area hide-open"></span>
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

let achievementMarks = Vue.component('achievement-marks', {
  template: `
<ul id="marks">
  <li v-for="check in achievement.checks" class="result-wrapper">
    <div class="result-indicator">
      <span v-bind:class="completion(check.passing)" title="title(check.passing)" role="img"></span>
    </div>
    <div class="result-text">
      <h3>{{ check.description }}</h3>
      <div v-if="!check.passing" v-html="check.hint"></div>
    </div>
  </li>
</ul>`,
  props: ['achievement'],
  methods: {
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
  },
});

let mainVue = new Vue({
  el: '#main',
  data: {
    achievements: achievements,
    selectedAchievement: achievements.find(achievement => !achievement.completed) || achievements[0] || {checks: []},
    cookies: window.cookies,
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
