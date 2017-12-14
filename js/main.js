window._cookies = 0;
window._testCookies = 0;

function code(workspace) {
  Blockly.JavaScript.addReservedWords('code');
  var code = 'window._cookies = 0;\n'
    + 'let heading = document.querySelector("#cookie-clicker h1");\n'
    + 'heading.textContent = "No cookies";\n'
    + 'let image = document.querySelector("#cookie-clicker img");\n'
    + 'let clone = image.cloneNode(true);\n'
    + 'clone.src = "";\n'
    + 'clone.addEventListener("click", function() { mainVue.clicks++; });\n'
    + 'image.parentNode.replaceChild(clone, image);\n'
    + 'image = clone;\n'
    + Blockly.JavaScript.workspaceToCode(workspace).replace(/var cookies;\n/, '');
  return code;
}

function testCode(workspace) {
  Blockly.JavaScript.addReservedWords('code');
  var code = 'window._test = true;\n'
    + 'window._testCookies = 0;\n'
    + 'let cookieClicker = document.createElement("div");\n'
    + 'let heading = document.createElement("h1");\n'
    + 'heading.textContent = "No cookies";\n'
    + 'let image = document.createElement("img");\n'
    + 'image.src = "";\n'
    + 'cookieClicker.appendChild(heading);\n' 
    + 'cookieClicker.appendChild(image);\n' 
    + Blockly.JavaScript.workspaceToCode(workspace).replace(/var cookies;\n/, '')
    + 'let result = test(cookieClicker, cookies);\n'
    + 'window._test = false;\n'
    + 'result;\n';
  return code;
}

function viewCode(workspace) {
  let url = window.location.pathname.split('/').slice(0, -1).join('/');
  Blockly.JavaScript.addReservedWords('code');
  var code = 'let heading = document.querySelector(\'h1\');\n'
    + 'let image = document.querySelector(\'img\');\n'
    + Blockly.JavaScript.workspaceToCode(workspace)
        .replace(/var cookies;\n/, 'let cookies = 0;\n')
        .replace(/"(images\/[^"]*)"/g, (match, image) => `"${location.origin}${url}/${image}"`);
  return code;
}

function runCode(code, test) {
  try {
    return eval(code);
  } catch (e) {
    console.error(e);
  }
}

let unlockedBlocks = ['image_set'];
function updateGoals(silent) {
  // Get blocks from workspace
  let blockTree = workspaceToBlocks(workspace);
  let blockList = workspaceToBlocks(workspace, true);
  // Keep track of if any new goals have been completed
  let newCompletions = [];

  goals.map(function(goal) {
    // Check hint conditions
    goal.hints.forEach(function(hint) {
      Vue.set(hint, 'useful', hint.condition(blockTree, blockList));
    });

    // Perform each check
    let passes = goal.checks.map(function(check) {
      let passed = doCheck(check);
      Vue.set(check, 'passing', passed);
      return passed;
    });

    // Has the interaction for this goal been completed?
    goal.interacted = mainVue.selectedGoal === goal? mainVue.clicks >= goal.interaction.clicks : (goal.interacted || goal.completed);

    // Is this goal currently passing all checks?
    let passing = passes.every(pass => pass) && goal.interacted;
    Vue.set(goal, 'passing', passing);
    // Is this a new goal completion?
    if (!goal.completed && passing) {
      newCompletions.push(goal)
    }
    // Has this goal ever been completed?
    goal.completed = goal.completed || passing;
    // Update cookies with goal status
    Cookies.set(`goals[${goal.id}].completed`, goal.completed);
  });

  // Update the selected goal if a previous goal has been newly completed
  if (newCompletions.length !== 0) {
    let rewards = newCompletions
      .map(goal => goalRewards(goal))
      .reduce((a, b) => a.concat(b));
    if (!silent) {
      mainVue.goalRewards = rewards
        .filter(reward => !(reward.type === 'block' && unlockedBlocks.includes(reward.block)) && !(reward.type === 'goal' && goals.find(goal => goal.id === reward.goal)));
    }
  }

  // Unlock goal which have completed prerequisites or have been completed
  goals.forEach(function(goal) {
    // Get the goal's prereqs
    let prereqs = goals.filter(prereq => goal.prerequisites.includes(prereq.id));
    // See if they've been completed
    let unlocked = goal.completed || prereqs.every(prereq => prereq.completed);
    // Update unlocked status
    Vue.set(goal, 'unlocked', unlocked);
  });

  // Unlock blocks that are needed
  unlockedBlocks = goals
    // Only use unlocked goals
    .filter(goal => goal.unlocked)
    // Get the blocks
    .map(goal => goal.blocks)
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
  return runCode(testCode(workspace), check.test);
}

function goalRewards(goal) {
  let rewards = [];
  
  // Cookie rewards
  rewards.push({
    type: 'cookies',
    amount: goal.reward,
  });

  // Goal rewards
  let newGoals = goals
    .filter(newGoal => newGoal.prerequisites.includes(goal.id))
    .filter(newGoal => newGoal.prerequisites.every(prereq => goals.find(goal => goal.id == prereq).completed));
  newGoals.forEach(function(newGoal) {
    rewards.push({
      type: 'goal',
      goal: newGoal.title,
    });
  });

  // Block rewards
  newGoals
    .map(goal => goal.blocks)
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
  // Load goal completion and seen statuses
  goals.map(function(goal) {
    goal.completed = goal.completed || Cookies.get(`goals[${goal.id}].completed`) === 'true';
    goal.seen = goal.seen || Cookies.get(`goals[${goal.id}].seen`) === 'true';
  });
}

let blocklyComponent = Vue.component('blockly-editor', {
  template: '<div id="blockly-div" class="noselect"></div>',
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
        mainVue.clicks = 0;
        updateGoals();
        runCode(code(workspace));
        save();
      }
    });

    // A nasty hack to wait until Blockly is set up to load blocks
    setTimeout(function() {
      load();
      updateGoals(true);
      // Select first uncompleted goal or the last one if they are all completed
      mainVue.selectedGoal = goals.find(goal => !goal.completed) || goals[goals.length-1] || {checks: [], hints: []};
      Cookies.set(`goals[${mainVue.selectedGoal.id}].hintsSeen`, true);
    }, 10);

    this.__instance = workspace;
  },
});

let cookieCounter = Vue.component('cookie-counter', {
  template: `
<div id="cookie-counter" class="noselect">
  <img src="images/choc-chip.png">
  <span id="cookie-count">{{count}}</span>
</div>`,
  props: ['cookies'],
  data: function() {
    return {
      count: this.cookies,
    };
  },
  mounted: function() {
    let img = this.$el.querySelector('img');
    let vm = this;
    let addEvent = img.addEventListener("animationiteration", function() {
      if (vm.count < vm.cookies) {
        vm.count += 1;
      } else {
        img.classList.remove('animated');
      }
    }, false);
  },
  watch: {
    cookies: function(newValue, oldValue) {
      let img = this.$el.querySelector('img');
      let delta = newValue - oldValue;

      if (delta > 0) {
        this.count = oldValue;
        img.classList.add('animated');
      }
    },
  },
});

let cookieClickerControls =  Vue.component('cookie-clicker-controls', {
  template: `
<div id="cookie-clicker-controls" class="noselect">
  <button v-on:click="reset()" id="reset">
    <span class="icon icon-spinner11"></span>
    Reset
  </button>
  <button v-on:click="hintsToggle()" id="hints" v-bind:class="{on: hintson, off: !hintson}">
    <span v-bind:class="hintIcon(hintson)"></span>
    <span v-if="hintson">Hints on</span>
    <span v-if="!hintson">Hints off</span>
  </button>
  <view-code></view-code>
</div>`,
  props: ['hintson'],
  methods: {
    reset: function() {
      mainVue.clicks = 0;
      runCode(code(workspace));
      save();
    },
    mark: function() {
      updateGoals();
    },
    hintsToggle: function() {
      mainVue.hints = !this.hintson;
      if (mainVue.hints)
        Cookies.set(`goals[${mainVue.selectedGoal.id}].hintsSeen`, true);
    },
    hintIcon: function(hintson) {
      return {
        'icon': true,
        'icon-eye': hintson,
        'icon-eye-blocked': !hintson,
      };
    },
  },
});

let interactionCheck =  Vue.component('interaction-check', {
  template: `
<div id="interaction-check" v-if="hintsCompleted(goal)">
  <div v-html="goal.interaction.message"></div>
</div>`,
  props: ['goal', 'clicks'],
  watch: {
    clicks: function(clicks) {
      updateGoals();
    }
  },
  methods: {
    hintsCompleted: function(goal) {
      let firstUsefulHint = goal.hints.findIndex(hint => hint.useful);
      let completed = firstUsefulHint < 0 || firstUsefulHint > goal.interaction.afterHint;
      return completed;
    },
  },
});

let goalsComponent = Vue.component('goal-list', {
  template: `
<div id="course-nav-tray">
<div id="course-nav-tray-container" class="">
  <ol v-for="goal in goals" v-if="goal.unlocked" class="slide-group">
    <li
        class="slide"
        v-on:click="select(goal)">
      <a href="#"
          class="js-slide-link problem" v-bind:class="classes(goal)">
        <h3 class="slide-title">
          {{ goal.title }}
        </h3>
        <span class="tooltip-area hide-open" data-toggle="tooltip" data-placement="right" data-container="body" title="" v-bind:data-original-title="goal.title"></span>
        <span class="slide-jump-pip"></span>
      </a>
    </li>
  </ol>
</div>
</div>`,
  props: ['goals', 'selected'],
  methods: {
    select: function(goal) {
      // Update whether the goal has been seen or not
      clearTimeout(this.seenTimeout);
      this.seenTimeout = setTimeout(function() {
        Vue.set(goal, 'seen', true);
        Cookies.set(`goals[${goal.id}].seen`, goal.seen);
      }, 2500);

      // Update selection
      this.$emit('select', goal);
    },
    classes: function(goal) {
      return {
        current: goal == this.selected,
        solved: goal.completed,
        passed: goal.passing,
      };
    },
  },
});

let goalDescription = Vue.component('goal-description', {
  template: `
<div id="goal">
  <h2>{{ goal.title }}</h2>
  <div id="description" v-html="goal.description"></div>
</div>`,
  props: ['goal'],
});

let blocklyHints = Vue.component('blockly-hints', {
  template: `
<div id="blockly-hints" v-if="hintson" v-bind:style="workspacePosition(top, left, width, height)">
  <div v-for="hint in hints" v-if="hint.useful" v-html="hint.hint" class="blockly-hint" v-bind:style="position(hint.location, moved)">
  </div>
</div>`,
  props: ['hints', 'hintson'],
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

let goalMarks = Vue.component('goal-marks', {
  template: `
<ul id="marks">
  <li v-for="check in goal.checks" class="result-wrapper">
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
  props: ['goal'],
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
<div v-if="rewards.length !== 0" id="cookie-rewards" class="noselect">
  <h1 v-if="state == 'cookie' || state == 'rewards'">You unlocked...</h1>
  <div v-if="state == 'cookie'" v-bind:style="position()" class="reward-cookie" v-on:click="unlock()"></div>
  <ul v-if="state == 'rewards'" v-bind:style="position()">
    <li v-for="reward in rewards">
      <span v-if="reward.type == 'cookies'" class="cookies">
        {{ reward.amount }} cookies
        <span v-if="cookieBonus()">x 2</span>
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
  <button v-if="state == 'rewards'" v-on:click="unlock()" class="highlighted">
    <span class="icon icon-arrow-right"></span>
    Next
  </button>
  <div v-if="state == 'next' || state == 'nextContinue'">
    <h1>Next goal...</h1>
    <h3 v-html="goal.shortDescription"></h3>
  </div>
  <p>
    <button v-if="state == 'nextContinue'" v-on:click="unlock({hintsOn: true})" v-bind:class="{highlighted: hintson}">
      <span class="icon icon-arrow-right"></span>
      Hints on
    </button>
  </p>
  <p>
    <button v-if="state == 'nextContinue'" v-on:click="unlock({hintsOn: false})" v-bind:class="{highlighted: !hintson}">
      <span class="icon icon-arrow-right"></span>
      Hints off <img src="images/choc-chip.png">×2
    </button>
  </p>
</div>`,
  props: ['rewards', 'goal', 'hintson'],
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
    unlock: function(config) {
      if (this.state == 'cookie') {
        this.state = 'rewards';
        let bbox = document.querySelector('.reward-cookie').getBoundingClientRect();
        let x = bbox.left + bbox.width/2;
        let y = bbox.top + bbox.width/2;
        screenCookieFirework(document.querySelector('#firework-overlay'), x, y);

        let cookies = this.rewards
          .filter(reward => reward.type == 'cookies')
          .reduce((total, reward) => total + reward.amount, 0);
        if (this.cookieBonus())
          cookies *= 2;
        mainVue.cookies += cookies;
      } else if (this.state == 'rewards') {
        this.state = 'next';
        let firstNew = goals.find(goal => goal.unlocked && !goal.seen && !goal.completed);
        mainVue.selectedGoal = firstNew || goals[goals.length-1] || {checks: [], hints: []};

        let vm = this;
        setTimeout(function() {
          vm.state = 'nextContinue';
        }, 2000);
      } else if (this.state == 'next') {
      } else if (this.state == 'nextContinue') {
        mainVue.goalRewards = [];
        mainVue.hints = config.hintsOn;
        if (config.hintsOn)
          Cookies.set(`goals[${this.goal.id}].hintsSeen`, true);
      }
    },
    cookieBonus: function() {
      let bonus = !(Cookies.get(`goals[${this.goal.id}].hintsSeen`) === 'true');
      return bonus;
    },
  },
});

let viewCodeButton = Vue.component('view-code', {
  template: `
<span>
  <form action="https://codepen.io/pen/define" method="POST" target="_blank" style="display: none;">
    <input type="hidden" name="data">
  </form>
  <button v-on:click="submit()">
    <span class="icon icon-terminal"></span>
    View code
  </button>
</span>`,
  data: function() {
    return {
      codepen: '',
    };
  },
  methods: {
    submit: function() {
      let css =
`body {
  text-align: center;
}`;
      let code = viewCode(workspace);
      let codepenJSON = {
        title: 'Cookie Clicker',
        html: '<h1>No cookies</h1>\n<img src="">',
        js: code,
        css: css,
      };

      let form = this.$el.querySelector('form');
      form.data.value = JSON.stringify(codepenJSON);
      form.submit();
    },
  },
});

Vue.config.ignoredElements = ['bk'];

let mainVue = new Vue({
  el: '#main',
  data: {
    goals: goals,
    selectedGoal: goals.find(goal => !goal.completed) || goals[0] || {checks: [], hints: []},
    cookies: window._cookies,
    goalRewards: [],
    clicks: 0,
    hints: true,
  },
  methods: {
    selectGoal: function(goal) {
      this.selectedGoal = goal;
    },
  },
  watch: {
    cookies: function() {
      // Save cookies to web page's cookie
      Cookies.set('cookies', this.cookies);
    }
  },
});

Cookies.set(`goals[${mainVue.selectedGoal.id}].hintsSeen`, true);

// Connect the cookies variable in the cookie clicker game to the overall cookie counter
Object.defineProperty(window, 'cookies', {
  get: function() {
    // Get the number of cookies
    if (window._test)
      return this._testCookies;
    else
      return this._cookies;
  },
  set: function(val) {
    // Update cookies value
    if (window._test)
      this._testCookies = val;
    else {
      mainVue.cookies = (mainVue.cookies + val-this._cookies) || val;
      this._cookies = val;
    }
  }
});
