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
      }

      if (vm.count === vm.cookies) {
        img.classList.remove('animated');
      }
    }, false);
  },
  watch: {
    cookies: function(newValue, oldValue) {
      let img = this.$el.querySelector('img');
      let delta = newValue - oldValue;

      if (delta > 0) {
        img.style.animationDuration = (0.2/Math.max((this.cookies-this.count)/3, 1))+'s';
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
  <h1 v-if="state == 'finished'">You finished the cookie clicker!</h1>
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
  <button v-if="state == 'rewards' || state == 'finished'" v-on:click="unlock()" class="highlighted">
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
        let firstNew = goals.find(goal => goal.unlocked && !goal.seen && !goal.completed);

          let vm = this;
        if (firstNew) {
          this.state = 'next';
          mainVue.selectedGoal = firstNew;

          setTimeout(function() {
            vm.state = 'nextContinue';
          }, 2000);
        } else {
          this.state = 'finished';
          let fireworkOverlay = document.querySelector('#firework-overlay');
          let repeat = setInterval(function() {
            cookieFirework(fireworkOverlay, screen.availWidth*Math.random(), screen.availHeight*Math.random(), 0.8 + Math.random()*2);
            if (vm.state != 'finished')
              clearInterval(repeat);
          }, 500);
        }
      } else if (this.state == 'next') {
      } else if (this.state == 'nextContinue') {
        mainVue.goalRewards = [];
        mainVue.hints = config.hintsOn;
        if (config.hintsOn)
          Cookies.set(`goals[${this.goal.id}].hintsSeen`, true);
      } else if (this.state == 'finished') {
        mainVue.goalRewards = [];
      }
    },
    cookieBonus: function() {
      let bonus = !(Cookies.get(`goals[${this.goal.id}].hintsSeen`) === 'true');
      return bonus;
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


