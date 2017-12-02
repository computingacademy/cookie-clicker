var achievements = [{
  title: 'Set the image',
  reward: 10,
  description: '<p>To make a Cookie Clicker first we need a cookie!<p>'
    + '<p>Drag the <span class=".block .image_set">set image block</span> into the workspace.</p>',
  checks: [{
    description: 'Add the set image block',
    test: function(cookieClicker, cookies) {
      // Is there an image with a src?
      return !!cookieClicker.querySelector('img:not([src=""])');
    },
  }],
}, {
  title: 'Choose a cookie',
  reward: 10,
  description: '<p>Hmmm... looks like the image isn\'t a cookie yet.<p>'
    + '<p>Click the dropdown arrow on the set image block in your workspace. Then choose your cookie!</p>',
  checks: [{
    description: 'Set the image to a cookie',
    test: function(cookieClicker, cookies) {
      // Is the image's src not nothing?
      return !!cookieClicker.querySelector('img:not([src=NONE])');
    },
  }],
}, {
  title: 'Count your cookies',
  reward: 20,
  description: '<p>Now we need to show how many cookies we have.</p>'
    + '<p>Drag the <span class=".block .heading_set">set heading block</span> into the workspace.</p>'
    + '<p>Then connect the <span class=".block .heading_set">cookies block</span> (which represents the cookies <em>variable</em>) to the <span class=".block .heading_set">set heading block</span>.</p>',
  checks: [{
    description: 'Set the heading to cookies variable',
    test: function(cookieClicker, cookies) {
      // Was the heading set to the number of cookies (as a string)?
      return cookieClicker.querySelector('h1').textContent == cookies+'';
    },
  }],
}, {
  title: 'Click that cookie!',
  reward: 50,
  description: '<p>Now that we have the cookie we need to add the most fun part of the Cookie Clicker. Adding cookies when we click!</p>'
    + '<p>Drag the <span class=".block .on_click">on click block</span> into the workspace.</p>'
    + '<p>Drag the <span class=".block .variable_change">change cookies block</span> into the <span class=".block .on_click">on click block</span> to change the cookie variable.</p>',
  checks: [{
    description: 'Add one to the cookies variable when the cookie is clicked',
    test: function(cookieClicker, cookies) {
      // If we can click the cookie
      if (cookieClicker.querySelector('img').onclick) {
        // Get original heading text
        var originalText = cookieClicker.querySelector('h1').textContent;
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
}, {
  title: 'Keep counting cookies',
  reward: 40,
  description: '<p>Why doesn\'t our cookie heading update? We only set the heading once! We need to set the heading when we click too!</p>'
    + '<p>Use another <span class=".block .heading">set heading block</span> in the <span class=".block .on_click">on click block</span>.</p>'
    + '<p>You can right click on the <span class=".block .heading">set heading block</span> in your workspace and click <em>duplicate</em> to save time creating blocks.</p>',
  checks: [{
    description: 'Display the cookies variable as it changes on click',
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
}];

var workspace = Blockly.inject('blockly-div',
  { media: 'blockly/media/',
    toolbox: document.getElementById('toolbox4')
  });

function update(event) {
  runCode();
  updateAchievement();
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

function updateAchievement() {
  var achievement = achievements.find(achievement => !achievement.checks.every(check => doCheck(check)));
  if (achievement) {
    mainVue.selectedAchievement = achievement;
  } else {
    mainVue.selectedAchievement = {checks: []};
  }
}

function doCheck(check) {
  var cookieClicker = document.querySelector('#cookie-clicker');
  return check.test(cookieClicker, window.cookies);
}

function save() {
  var xml = Blockly.Xml.workspaceToDom(workspace);
  var xml_text = Blockly.Xml.domToText(xml);
  Cookies.set('blocks', xml_text);
  Cookies.set('cookies', window.cookies);
}

function load() {
  var xml_text = Cookies.get('blocks');
  var xml = Blockly.Xml.textToDom(xml_text);
  Blockly.Xml.domToWorkspace(xml, workspace);
  window.cookies = parseInt(Cookies.get('cookies'));
}

// Make updates to cookies variable update the cookie counter
Object.defineProperty(window, 'cookies', {
  get: function() {
    // Update counter
    document.querySelector('#cookie-count').textContent = this._cookies;
    return this._cookies;
  },
  set: function(val) {
    // Update cookies value
    this._cookies = val;
    // Save cookies to cookies
    Cookies.set('cookies', this._cookies);
  }
});

let achievementsComponent = Vue.component('achievement-list', {
  template: `
<div id="achievements">
  <ul>
    <li v-for="achievement in achievements"
        v-bind:class="{completed: achievement.checks.every(check => doCheck(check))}"
        v-on:click="select(achievement)">
      {{ achievement.title }}
    </li>
  </ul>
</div>`,
  props: ['selected'],
  data: function() {
    return {
      doCheck: doCheck,
      achievements: achievements,
    };
  },
  methods: {
    select: function(achievement) {
      this.$emit('select', achievement);
    }
  },
});

let achievementComponent = Vue.component('achievement-display', {
  template: `
<div id="achievement" >
  <h2>{{ achievement.title }}</h2>
  <ol id="marks">
    <li v-for="check in achievement.checks">
      <i class="fa" v-bind:class="{'fa-check': doCheck(check), 'fa-times': !doCheck(check)}"></i>
      {{ check.description }}
    </li>
  </ol>
  <div id="description" v-html="achievement.description">
  </div>
</div>`,
  props: ['achievement'],
  data: function() {
    return {
      doCheck: doCheck,
    };
  },
});

let mainVue = new Vue({
  el: 'aside',
  data: {
    achievements: achievements,
    selectedAchievement: {checks: []},
  },
  methods: {
    selectAchievement: function(achievement) {
      this.selectedAchievement = achievement;
    },
  },
});

load();
updateAchievement();

workspace.addChangeListener(update);
