let blocklyEditor = Vue.component('blockly-editor', {
  template: '<div id="blockly-div" class="noselect"></div>',
  data: function() {
    return {
      workspace: undefined,
    };
  },
  mounted:function() {
    // Load blockly
    this.workspace = Blockly.inject(this.$el,
      { media: 'blockly/media/',
        toolbox: document.getElementById('toolbox')
      });

    // Update the model when events happen
    let vm = this;
    this.workspace.addChangeListener(function(event) {
      vm.$emit('input', vm.value());
    });

    // Update the model when the page is resized
    window.addEventListener('resize', function() {
      vm.$emit('input', vm.value());
    }, false);

    // Initial model update
    vm.$emit('input', vm.value());

    // Update once the blockly DOM has loaded
    setTimeout(function() {
      vm.$emit('input', vm.value());
    }, 10);

    // Use blockly element as this component's element
    this.__instance = this.workspace;
  },
  methods: {
    value: function() {
      // Get the blockly model
      return {
        workspace: this.workspace,
        code: code(this.workspace),
        blocks: workspaceToBlocks(this.workspace, true),
        toolbox: workspaceToBlocks(this.workspace.getFlyout_().getWorkspace(), true),
        offset: this.$el.getBoundingClientRect(),
      };
    },
  },
});

let animatedCounter = Vue.component('animated-counter', {
  template: `
<div id="animated-counter" class="noselect">
  <img src="images/choc-chip.png" v-bind:style="jump()">
  <span>{{ animatedCount }}</span>
</div>`,
  props: ['count'],
  data: function() {
    return {
      jumpHeight: 0,
      animatedCount: 0,
    };
  },
  watch: {
    count: function(newValue, oldValue) {
      // Update the animation each frame
      var vm = this
      function animate () {
        if (TWEEN.update()) {
          requestAnimationFrame(animate)
        }
      }

      // Define the animation for the jumping cookie
      let maxHeight = 20;
      let down = new TWEEN.Tween({ jump: newValue > oldValue ? maxHeight : 0 })
        .easing(TWEEN.Easing.Quadratic.In)
        .to({ jump: 0 }, 300)
        .onUpdate(function () {
          vm.jumpHeight = this.jump;
        });

      let up = new TWEEN.Tween({ jump: 0 })
        .easing(TWEEN.Easing.Quadratic.Out)
        .to({ jump: newValue > oldValue ? maxHeight : 0 }, 100)
        .onUpdate(function () {
          vm.jumpHeight = this.jump;
        })
        .chain(down)
        .start();

      // Define the animation from oldValue to newValue
      new TWEEN.Tween({ tweeningCount: oldValue })
        .easing(TWEEN.Easing.Quadratic.Out)
        .to({ tweeningCount: newValue }, 500)
        .onUpdate(function () {
          vm.animatedCount = parseInt(this.tweeningCount);
        })
        .start()

      animate()
    },
  },
  methods: {
    jump: function() {
      // Turn jump height into an element style
      return {
        transform: `translateY(${-this.jumpHeight}px)`,
      };
    },
  },
});

let buyHint = Vue.component('buy-hint', {
  template: `
<div id="buy-hint">
  <click-pointer v-if="nextHint && attention && !nextHint.direct" v-bind:coords="coords"></click-pointer>
  <button v-if="nextHint && !nextHint.revealed" v-on:click="buyHint()" id="hints" v-bind:class="{on: cookies >= nextHint.cost}">
    Buy hint
    <img src="images/choc-chip.png">×{{ nextHint.cost }}
  </button>
  <button v-if="nextHint && nextHint.revealed && !nextHint.direct" v-on:click="buyHint()" id="hints" v-bind:class="{on: cookies >= nextHint.cost *10}">
    Another hint!
    <img src="images/choc-chip.png">×{{ nextHint.cost * 10 }}
  </button>
  <button v-if="nextHint && nextHint.revealed && nextHint.direct" id="hints">
    Follow the hint
  </button>
  <button v-if="!nextHint">
    Click the cookie!
  </button>
</div>`,
  props: ['nextHint', 'cookies'],
  data: function() {
    return {
      coords: undefined,
      attention: false,
    };
  },
  mounted: function() {
    let vm = this;
    // Get button coords
    let bbox = this.$el.querySelector('button').getBoundingClientRect();
    this.coords = {
      // A bit to the left of the middle of the button
      left: bbox.left + bbox.width/3,
      // Bottom quarter of the button
      top: bbox.bottom - bbox.height/4,
    };
  },
  methods: {
    buyHint: function() {
      // Reveal the hint
      this.$emit('buy-hint', this.nextHint);
    },
  },
  watch: {
    nextHint: function() {
      // Stop drawing attention to the buy hint button
      this.attention = false;

      // Draw attention to the button after a while
      if (this.nextHint) {
        let attentionDelay = this.nextHint.buyHintDelay !== undefined ? this.nextHint.buyHintDelay : 35*1000;
        let vm = this;
        setTimeout(function() {
          vm.attention = true;
        }, attentionDelay);
      }
    }
  },
});

let cookieClicker = Vue.component('cookie-clicker', {
  template: `
<div id="cookie-clicker" class="noselect">
  <h1>No cookies</h1>
  <img src>
</div>`,
  props: ['code'],
  data: function() {
    return {
      cookies: 0,
      clicks: 0,
    };
  },
  watch: {
    code: function(code) {
      // Update cookie clicker with new code
      // Pass in the component so cookie count can be updated
      runCookieClicker(code, this);
    },
    cookies: function(cookies, oldCookies) {
      // Update the model
      this.$emit('cookies', Math.max(cookies - oldCookies, 0));
    },
    clicks: function(clicks) {
      // Update the model
      this.$emit('clicks', clicks);
    },
  },
});

let cookieClickerControls = Vue.component('cookie-clicker-controls', {
  template: `
<div id="cookie-clicker-controls" class="noselect">
  <button v-on:click="reset()" id="reset">
    <span class="icon icon-spinner11"></span>
    Reset
  </button>
</div>`,
  props: ['code'],
  methods: {
    reset: function() {
      // Rerun the code
      runCookieClicker(this.code);
    },
  },
});

let interactionCheck = Vue.component('interaction-check', {
  template: `
<div id="interaction-check" v-if="show">
  <div v-html="goal.interaction.message"></div>
  <click-pointer v-bind:coords="cookieCoords()"></click-pointer>
 </div>`,
   props: ['show', 'goal', 'clicks'],
   methods: {
    cookieCoords: function() {
      // Get coordinates of the cookie-clicker cookie
      let bbox = document.querySelector('#cookie-clicker img').getBoundingClientRect();
      return {
        // Middle of the cookie
        left: bbox.left + bbox.width/2 - 25,
        top: bbox.top + bbox.height/2,
      };
    },
  },
});

let goalsList = Vue.component('goal-list', {
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
  props: ['goals', 'selected', 'blockly'],
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
      // Turn goal status into CSS class
      return {
        current: goal == this.selected,
        solved: goal.completed,
        passed: checksPass(this.blockly, goal),
      };
    },
  },
});

let goalDescription = Vue.component('goal-description', {
  template: `
<div id="goal" v-if="goal">
  <h2>{{ goal.title }}</h2>
  <div id="description" v-html="goal.description"></div>
</div>`,
  props: ['goal'],
});

let hintDisplay = Vue.component('hint-display', {
  template: `
<div v-if="hint && hint.revealed" class="blockly-hint" v-bind:style="position(hint, blockly)">
    <div v-html="hint.hint" ></div>
    <div v-if="hint.direct" v-html="message(hint)" ></div>
</div>`,
  props: ['hint', 'blockly'],
  methods: {
    position: function(hint, blockly) {
      // Get location coordinates
      let coords = locationToCoords(blockly, hintLocation(hint));
      // Output as element style
      if (coords) {
        return {
          left: `${coords.left}px`,
          top: `${coords.top}px`,
        };
      } else {
        return {
          display: 'none',
        };
      }
    },
    message: function(hint) {
      return hintMessage(hint);
    },
  },
});

let animatedPointer = Vue.component('animated-pointer', {
  template: `
<div class="pointer" v-on:enter="animate" v-bind:style="position(coords)"></div>`,
  props: ['start', 'end'],
  data: function() {
    return {
      coords: undefined,
      tween: undefined,
    };
  },
  mounted: function() {
    // Begin animation
    this.animation();
  },
  watch: {
    start: function() {
      this.animation();
    },
    end: function() {
      this.animation();
    },
  },
  methods: {
    animate: function() {
      // Update the animation each frame
      function animate() {
        if (TWEEN.update()) {
          requestAnimationFrame(animate);
        }
      }
      animate();
    },
    animation: function() {
      // Stop previous animation
      if (this.tween) {
        this.tween.stop();
      }

      // Animate the pointer from start/end
      if (this.start && this.end) {
        let vm = this;
        this.tween = new TWEEN.Tween(this.start)
          .to(this.end, 600)
          .repeat(Infinity)
          .delay(1000)
          .onUpdate(function() {
            vm.coords = this;
          })
          .start();
        this.animate();
      }
    },
    position: function(coords) {
      // Turn coordinates into an element style
      if (coords) {
        return {
          position: 'absolute',
          left: `${coords.left.toFixed(0)}px`,
          top: `${coords.top.toFixed(0)}px`,
        };
      } else {
        return {
          display: 'none',
        };
      }
    },
  },
});

let clickPointer = Vue.component('click-pointer', {
  template: `<animated-pointer v-bind:start="start" v-bind:end="end"></animated-pointer>`,
  props: ['coords'],
  data: function() {
    return this.coordsStartEnd();
  },
  methods: {
    coordsStartEnd: function() {
      // Animate a clicking motion
      if (this.coords) {
        return {
          start: {left: this.coords.left, top: this.coords.top + 10},
          end: this.coords,
        };
      }
      // No coords no animation
      else {
        return {
          start: undefined,
          end: undefined,
        };
      }
    }
  },
  watch: {
    coords: function() {
      // Set the start and end of the animation
      let startEnd = this.coordsStartEnd();
      this.start = startEnd.start;
      this.end = startEnd.end;
    },
  },
});

let nextGoal = Vue.component('next-goal', {
  template: `
<div id="next-goal" v-if="choosing">
  <h1>Choose your next goal</h1>
    <ol id="next-goals">
      <li v-for="goal in goals" v-if="!goal.completed && unlocked(goal)" class="noselect" v-on:click="select(goal)">
        <h2 v-html="goal.title"></h2>
        <p v-html="goal.shortDescription"></p>
        <ul id="goal-blocks">
          <li v-for="block in blocks(goal)" v-html="block"></li>
        </ul>
      </li>
    </ol>
</div>`,
  props: ['choosing', 'goal', 'goals'],
  watch: {
    rewards: function(rewards) {
      this.state = 'cookie';
    }
  },
  methods: {
    unlocked: function(goal) {
      // Have all of the goal's prerequisites been completed?
      let prereqs = goal.prerequisites.map(prereq => this.goals.find(goal => goal.id == prereq));
      return prereqs.every(goal => goal.completed);
    },
    select: function(goal) {
      // Unlock the goal
      goal.unlocked = true;
      this.$emit('select', goal);
    },
    blocks: function(goal) {
      // Get set of blocks found in this goal
      let blocks = goal.hints
        .map(hint => hint.block)
        .filter(block => !!block)
        .filter((x, i, a) => a.indexOf(x) == i);
      // return HTML for blocks found in this goal
      return blocks.map(inlineBlock);
    },
  },
});

Vue.config.ignoredElements = ['bk'];
