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
}, {
  id: 'Set heading',
  title: 'Count your cookies',
  reward: 20,
  completed: false,
  seen: false,
  description: '<p>Now we need to show how many cookies we have using the cookies <em>variable</em>.</p>',
  checks: [{
    description: 'Set the heading',
    hint: '<p>Drag the <bk class="io">set heading</bk> block into the workspace.</p>',
    test: function(cookieClicker, cookies) {
      // Was the set heading block used?
      return workspace.getAllBlocks().some(block => block.type === 'heading_set');
    },
  }, {
    description: 'Set the heading to cookies variable',
    hint: '<p>Then connect the <bk class="var">cookies</bk> block (which represents the cookies <em>variable</em>) to the <bk class="io">set heading</bk> block.</p>',
    test: function(cookieClicker, cookies) {
      // Was the heading set to the number of cookies (as a string)?
      return cookieClicker.querySelector('h1').textContent == cookies+'';
    },
  }],
  prerequisites: [
    'Set image',
    'Choose image',
  ],
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
      // Can we click the cookie?
      return !!cookieClicker.querySelector('img').onclick;
    },
  }, {
    description: 'Change the cookies variable',
    hint: '<p>Use the <bk class="var">change <bk class="inner">cookies</bk></bk> block to change the cookie variable.</p>',
    test: function(cookieClicker, cookies) {
      // If we can click the cookie
      if (cookieClicker.querySelector('img').onclick) {
        // Get original heading text
        var originalText = cookieClicker.querySelector('h1').textContent;
        // Run the code to see if the change cookies variable was added at the start of the program
        runCode();
        // Click cookie
        cookieClicker.querySelector('img').onclick();
        // Was the cookie value incremented?
        var incremented = window.cookies !== cookies;
        // Reset cookie value
        window.cookies = cookies;
        cookieClicker.querySelector('h1').textContent = originalText;

        return incremented;
      } else {
        // We can't click the cookie
        return false;
      }
    },
  }, {
    description: 'Add to the cookies variable when the cookie is clicked',
    hint: '<p>Make sure the <bk class="var">change <bk class="inner">cookies</bk></bk> block is inside of the <bk class="control">on click</bk> block.</p>',
    test: function(cookieClicker, cookies) {
      // If we can click the cookie
      if (cookieClicker.querySelector('img').onclick) {
        // Get original heading text
        var originalText = cookieClicker.querySelector('h1').textContent;
        // Click cookie
        cookieClicker.querySelector('img').onclick();
        // Was the cookie value incremented?
        var incremented = window.cookies > cookies;
        // Reset cookie value
        window.cookies = cookies;
        cookieClicker.querySelector('h1').textContent = originalText;

        return incremented;
      } else {
        // We can't click the cookie
        return false;
      }
    },
  }, {
    description: 'Add just one cookie',
    hint: '<p>You should only use one <bk class="var">change <bk class="inner">cookies</bk></bk> block!</p>',
    test: function(cookieClicker, cookies) {
      // If we can click the cookie
      if (cookieClicker.querySelector('img').onclick) {
        // Get original heading text
        var originalText = cookieClicker.querySelector('h1').textContent;
        // Run the code to see if the change cookies variable was added at the start of the program
        runCode();
        // Click cookie
        cookieClicker.querySelector('img').onclick();
        // Was the cookie value incremented?
        var incremented = window.cookies == cookies+1;
        // Reset cookie value
        window.cookies = cookies;
        cookieClicker.querySelector('h1').textContent = originalText;

        return incremented;
      } else {
        // We can't click the cookie
        return false;
      }
    },
  }],
  prerequisites: [
    'Set image',
    'Choose image',
  ],
}, {
  id: 'Set heading on click',
  title: 'Keep counting cookies',
  reward: 40,
  completed: false,
  seen: false,
  description: '<p>Why doesn\'t our cookie heading update when we click? Because we only set the heading once! We need to set the heading when we click too!</p>',
  checks: [{
    description: 'Set the heading',
    hint: '<p>Pass \'Count your cookies\' before attempting this.</p>',
    test: function(cookieClicker, cookies) {
      return achievements.find(achievement => achievement.id === 'Set heading').passing;
    },
  }, {
    description: 'Add a cookie on click',
    hint: '<p>Pass \'Click that cookie!\' before attempting this.</p>',
    test: function(cookieClicker, cookies) {
      return achievements.find(achievement => achievement.id === 'On click').passing;
    },
  }, {
    description: 'Display the cookies variable on click',
    hint: '<p>Use another <bk class="io">set heading</bk> block in the <bk class="control">on click</bk> block.</p>'
    + '<p>You can right click on the <bk class="io">set heading</bk> block in your workspace and click <em>duplicate</em> to save time creating blocks.</p>'
    + '<p>Make sure you set the heading <em>after</em> after you change the cookies variable</p>',
    test: function(cookieClicker, cookies) {
      // Was the heading set to the number of cookies?
      var headingSet = cookieClicker.querySelector('h1').textContent == cookies+'';
      // If we can click the cookie
      if (cookieClicker.querySelector('img').onclick) {
        // Get original heading text
        var originalText = cookieClicker.querySelector('h1').textContent;
        // Click cookie
        cookieClicker.querySelector('img').onclick();
        // Was the cookie value incremented?
        var incremented = window.cookies == cookies+1;
        // Was the heading updated as the number of cookies changed?
        var headingUpdated = cookieClicker.querySelector('h1').textContent == window.cookies+'';
        // Reset cookie value
        window.cookies = cookies;
        cookieClicker.querySelector('h1').textContent = originalText;

        return headingSet && incremented && headingUpdated;
      } else {
        // We can't click the cookie
        return false;
      }
    },
  }],
  prerequisites: [
    'Set heading',
    'On click',
  ],
}];

let prevCode;
function update(event) {
  if (prevCode !== Blockly.JavaScript.workspaceToCode(workspace)) {
    runCode();
    updateAchievements();

    prevCode = Blockly.JavaScript.workspaceToCode(workspace);
  }
  save();
}

function runCode() {
  Blockly.JavaScript.addReservedWords('code');
  var code = 'window.cookies = window.cookies ? window.cookies : 0\n'
    + 'document.querySelector("#cookie-clicker h1").textContent = "";\n'
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

function updateAchievements() {
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
    // Has this achievement ever been completed?
    achievement.completed |= passing;
    // Update cookies with achievement status
    Cookies.set(`achievements[${achievement.id}].completed`, achievement.completed);
  });

  // Unlock achievement which have completed prerequisites
  achievements.forEach(function(achievement) {
    // Get the achievement's prereqs
    let prereqs = achievements.filter(prereq => achievement.prerequisites.includes(prereq.id));
    // See if they've been completed
    let unlocked = prereqs.every(prereq => prereq.completed)
    // Update unlocked status
    Vue.set(achievement, 'unlocked', unlocked);
  });
}

function doCheck(check) {
  var cookieClicker = document.querySelector('#cookie-clicker');
  return check.test(cookieClicker, window.cookies);
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
  window.cookies = parseInt(Cookies.get('cookies')) || 0;
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

    // A nasty hack to wait until Blockly is set up to load blocks
    setTimeout(function() {
      load();
      updateAchievements();
    }, 10);

    workspace.addChangeListener(update);

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
        'icon-checkmark': passing,
        'passed-indicator': passing,
        'icon-cross': !passing,
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
    return mainVue.cookies;
  },
  set: function(val) {
    // Update cookies value
    mainVue.cookies = val;
  }
});
