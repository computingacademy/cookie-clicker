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
    // Is this goal currently passing all checks?
    let passing = passes.every(pass => pass);
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
        updateGoals();
        runCode();
        save();
      }
    });

    // A nasty hack to wait until Blockly is set up to load blocks
    setTimeout(function() {
      load();
      updateGoals(true);
      // Select first uncompleted goal or the last one if they are all completed
      mainVue.selectedGoal = goals.find(goal => !goal.completed) || goals[goals.length-1] || {checks: [], hints: []};
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
  watch: {
    cookies: function(newValue, oldValue) {
      let img = this.$el.querySelector('img');
      let delta = newValue - oldValue;

      if (delta) {
        img.classList.remove('animated');
        setTimeout(function() {
          img.style.animationIterationCount = delta;
          img.classList.add('animated');
        }, 1);
      }
    },
  },
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
      updateGoals();
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
        let firstNew = goals.find(goal => goal.unlocked && !goal.seen && !goal.completed);
        mainVue.selectedGoal = firstNew || goals[goals.length-1] || {checks: [], hints: []};
        mainVue.goalRewards = [];
      }
    },
  },
});

Vue.config.ignoredElements = ['bk'];

let mainVue = new Vue({
  el: '#main',
  data: {
    goals: goals,
    selectedGoal: goals.find(goal => !goal.completed) || goals[0] || {checks: [], hints: []},
    cookies: window.cookies,
    goalRewards: [],
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
