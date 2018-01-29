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
        toolbox: workspaceToBlocks(this.workspace.getFlyout_().getWorkspace()),
        offset: this.workspace.getOriginOffsetInPixels(),
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

let cookieClickerControls =  Vue.component('cookie-clicker-controls', {
  template: `
<div id="cookie-clicker-controls" class="noselect">
  <button v-on:click="reset()" id="reset">
    <span class="icon icon-spinner11"></span>
    Reset
  </button>
  <animated-pointer v-if="nextHint.buyHintDelay == 0 && !nextHint.revealed"></animated-pointer>
  <button v-on:click="buyHint()" id="hints" v-bind:class="{on: cookies >= nextHint.cost && !nextHint.revealed}">
    Buy hint
  </button>
</div>`,
  props: ['nextHint', 'cookies', 'code'],
  methods: {
    reset: function() {
      // Rerun the code
      runCookieClicker(this.code);
    },
    buyHint: function() {
      // Reveal the hint
      this.$emit('buy-hint', this.nextHint);
    },
  },
});

let interactionCheck =  Vue.component('interaction-check', {
  template: `
<div id="interaction-check" v-if="hintsCompleted(goal)">
  <div v-html="goal.interaction.message"></div>
</div>`,
  props: ['goal', 'clicks'],
  methods: {
    hintsCompleted: function(goal) {
      if (goal) {
        // Find the first hint yet to be completed
        let firstUncompletedHint = goal.hints.findIndex(hint => hint.useful);
        // Check that all the hints before this interaction check have
        let completed = firstUncompletedHint < 0 || firstUncompletedHint > goal.interaction.afterHint;
        return completed;
      } else {
        return false;
      }
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
      // Turn goal status into CSS class
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
<div id="goal" v-if="goal">
  <h2>{{ goal.title }}</h2>
  <div id="description" v-html="goal.description"></div>
</div>`,
  props: ['goal'],
});

let blocklyHints = Vue.component('blockly-hints', {
  template: `
<div id="hints">
  <div id="blockly-hints">
    <div v-if="hint.revealed" v-html="hint.hint" class="blockly-hint" v-bind:style="position(hint.location, blockly)">
    </div>
  </div>
  <div id="pointer-hints">
    <pointer-hint v-if="hint.pointer && hint.revealed" v-bind:hint="hint" v-bind:blockly="blockly"></pointer-hint>
  </div>
</div>`,
  props: ['hint', 'blockly'],
  methods: {
    position: function(location, blockly) {
      // Get location coordinates
      let coords = locationToCoords(blockly, location);
      // Output as element style
      return {
        left: `${coords.left}px`,
        top: `${coords.top}px`,
      };
    },
  },
});

let animatedPointer = Vue.component('animated-pointer', {
  template: `
<div class="pointer-hint" v-bind:style="position(left, top)"></div>`,
  data: function() {
    // Get the coordinates to animate the pointer from
    let pos = document.querySelector('button#hints').getBoundingClientRect();
    let coords = {
        top: pos.top-60,
        left: pos.left,
      };

    // Create the animation
    this.tween = new TWEEN.Tween(coords);
    this.animation();

    // Set the initial coordinates
    return coords;
  },
  methods: {
    animation: function() {
      // Update the animation each frame
      function animate () {
        if (TWEEN.update()) {
          requestAnimationFrame(animate);
        }
      }

      // Get the start/end position of the pointer
      let pos = document.querySelector('button#hints').getBoundingClientRect();
      let coords = {left: (pos.left+pos.right)/2, top: pos.top-60};
      let to = {top: pos.top-40};
      // Animate the pointer from start/end
      this.top = coords.top;
      this.left = coords.left;
      this.tween
        .to(to, 400)
        .repeat(Infinity)
        .delay(1000)
        .start();

      animate();
    },
    position: function(left, top) {
      // Turn coordinates into an element style
      return {
        position: 'absolute',
        left: `${left.toFixed(0)}px`,
        top: `${top.toFixed(0)}px`,
        transform: 'rotate(180deg)',
      };
    },
  },
});

let pointerHint = Vue.component('pointer-hint', {
  template: `
<div class="pointer-hint" v-bind:style="position(left, top)"></div>`,
  props: ['hint', 'blockly'],
  data: function() {
    // Get the coordinates to animate the pointer from
    let coords = locationToCoords(this.blockly, this.hint.pointer.from)
      || {
        left: 0,
        top: 0,
      };

    // Create the animation
    this.tween = new TWEEN.Tween(coords);
    this.animation();

    // Set the initial coordinates
    return coords;
  },
  watch: {
    hint: function(hint) {
      // Restart animation if hint changes
      this.tween.stop();
      this.animation();
    },
    blockly: function() {
      // Restart animation if the blockly model changes 
      this.tween.stop();
      this.animation();
    },
  },
  methods: {
    animation: function() {
      // Update the animation each frame
      function animate () {
        if (TWEEN.update()) {
          requestAnimationFrame(animate);
        }
      }

      // Get the start/end position of the pointer
      let coords = locationToCoords(this.blockly, this.hint.pointer.from);
      let to = locationToCoords(this.blockly, this.hint.pointer.to);
      // Animate the pointer from start/end
      if (coords) {
        this.left = coords.left;
        this.top = coords.top;
      }
      this.tween
        .to(to, 2000)
        .repeat(Infinity)
        .delay(1000)
        .start();

      animate();
    },
    position: function(left, top) {
      // Turn coordinates into an element style
      return {
        position: 'absolute',
        left: `${left.toFixed(0)}px`,
        top: `${top.toFixed(0)}px`,
      };
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
  <div v-if="state == 'next' || state == 'nextContinue'">
    <h1>Next goal...</h1>
    <h3 v-html="goal.shortDescription"></h3>
  </div>
  <button v-if="state == 'rewards' || state == 'finished' || state == 'nextContinue'" v-on:click="unlock()" class="highlighted">
    <span class="icon icon-arrow-right"></span>
    Next
  </button>
</div>`,
  props: ['rewards', 'goal'],
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
      // Center the cookie clicker over the whole screen
      let width = 400;
      let height = 600;
      let bbox = document.body.getBoundingClientRect();
      return {
        left: (bbox.width - width)/2 + 'px',
        top: (bbox.height - height)/2 + 'px',
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
      } else if (this.state == 'finished') {
        mainVue.goalRewards = [];
      }
    },
  },
});

Vue.config.ignoredElements = ['bk'];
