'use strict';

var blocklyEditor = Vue.component('blockly-editor', {
  template: '<div id="blockly-div" class="noselect"></div>',
  data: function data() {
    return {
      workspace: undefined
    };
  },
  mounted: function mounted() {
    // Load blockly
    this.workspace = Blockly.inject(this.$el, { media: 'blockly/media/',
      toolbox: document.getElementById('toolbox'),
      trashcan: true
    });

    // Update the model when events happen
    var vm = this;
    this.workspace.addChangeListener(function (event) {
      vm.$emit('input', vm.value());
    });

    // Update the model when the page is resized
    window.addEventListener('resize', function () {
      vm.$emit('input', vm.value());
    }, false);

    // Initial model update
    vm.$emit('input', vm.value());

    // Update once the blockly DOM has loaded
    setTimeout(function () {
      vm.$emit('input', vm.value());
    }, 10);

    // Use blockly element as this component's element
    this.__instance = this.workspace;
  },
  methods: {
    value: function value() {
      // Get offset
      var offset = this.$el.getBoundingClientRect();
      offset.x = offset.left;
      offset.y = offset.top;
      // Get the blockly model
      return {
        workspace: this.workspace,
        code: code(this.workspace),
        blocks: workspaceToBlocks(this.workspace, true),
        toolbox: workspaceToBlocks(this.workspace.getFlyout_().getWorkspace(), true),
        offset: offset
      };
    }
  }
});

var animatedCounter = Vue.component('animated-counter', {
  template: '\n<div id="animated-counter" class="noselect">\n  <img src="images/mini-cookie-full.png" v-bind:style="jump()">\n  <small>total cookies</small>\n  <span>{{ animatedCount }}</span>\n</div>',
  props: ['count'],
  data: function data() {
    return {
      jumpHeight: 0,
      animatedCount: 0
    };
  },
  watch: {
    count: function count(newValue, oldValue) {
      // Update the animation each frame
      var vm = this;
      function animate() {
        if (TWEEN.update()) {
          requestAnimationFrame(animate);
        }
      }

      // Define the animation for the jumping cookie
      var maxHeight = 20;
      var down = new TWEEN.Tween({ jump: newValue > oldValue ? maxHeight : 0 }).easing(TWEEN.Easing.Quadratic.In).to({ jump: 0 }, 300).onUpdate(function () {
        vm.jumpHeight = this.jump;
      });

      var up = new TWEEN.Tween({ jump: 0 }).easing(TWEEN.Easing.Quadratic.Out).to({ jump: newValue > oldValue ? maxHeight : 0 }, 100).onUpdate(function () {
        vm.jumpHeight = this.jump;
      }).chain(down).start();

      // Define the animation from oldValue to newValue
      new TWEEN.Tween({ tweeningCount: oldValue }).easing(TWEEN.Easing.Quadratic.Out).to({ tweeningCount: newValue }, 500).onUpdate(function () {
        vm.animatedCount = parseInt(this.tweeningCount);
      }).start();

      animate();
    }
  },
  methods: {
    jump: function jump() {
      // Turn jump height into an element style
      return {
        transform: 'translateY(' + -this.jumpHeight + 'px)'
      };
    }
  }
});

var buyHint = Vue.component('buy-hint', {
  template: '\n<div id="buy-hint">\n  <click-pointer v-if="nextHint && attention && !nextHint.direct" v-bind:coords="coords"></click-pointer>\n  <button v-if="nextHint && !nextHint.revealed" v-on:click="buyHint()" id="hints" v-bind:class="{on: cookies >= nextHint.cost}">\n    Buy hint\n    <img src="images/mini-cookie-full.png">\xD7{{ nextHint.cost }}\n  </button>\n  <button v-if="nextHint && nextHint.revealed && !nextHint.direct" v-on:click="buyHint()" id="hints" v-bind:class="{on: cookies >= nextHint.cost *10}">\n    Another hint!\n    <img src="images/mini-cookie-full.png">\xD7{{ nextHint.cost * 10 }}\n  </button>\n  <button v-if="nextHint && nextHint.revealed && nextHint.direct" id="hints">\n    Follow the hint\n  </button>\n  <button v-if="!nextHint">\n    Click the cookie!\n  </button>\n</div>',
  props: ['nextHint', 'cookies'],
  data: function data() {
    return {
      coords: undefined,
      attention: false
    };
  },
  mounted: function mounted() {
    var vm = this;
    // Get button coords
    var bbox = this.$el.querySelector('button').getBoundingClientRect();
    this.coords = {
      // A bit to the left of the middle of the button
      left: bbox.left + bbox.width / 3,
      // Bottom quarter of the button
      top: bbox.bottom - bbox.height / 4
    };
  },
  methods: {
    buyHint: function buyHint() {
      // Reveal the hint
      this.$emit('buy-hint', this.nextHint);
    }
  },
  watch: {
    nextHint: function nextHint() {
      // Stop drawing attention to the buy hint button
      this.attention = false;

      // Draw attention to the button after a while
      if (this.nextHint) {
        var attentionDelay = this.nextHint.buyHintDelay !== undefined ? this.nextHint.buyHintDelay : 35 * 1000;
        var vm = this;
        setTimeout(function () {
          vm.attention = true;
        }, attentionDelay);
      }
    }
  }
});

var cookieClicker = Vue.component('cookie-clicker', {
  template: '\n<div id="cookie-clicker" class="noselect" v-on:click="click">\n  <h1>No cookies</h1>\n  <img src>\n</div>',
  props: ['code'],
  data: function data() {
    return {
      cookies: 0,
      clicks: 0
    };
  },
  watch: {
    code: function (_code) {
      function code(_x) {
        return _code.apply(this, arguments);
      }

      code.toString = function () {
        return _code.toString();
      };

      return code;
    }(function (code) {
      // Update cookie clicker with new code
      // Pass in the component so cookie count can be updated
      runCookieClicker(code, this);
    }),
    cookies: function cookies(_cookies, oldCookies) {
      // Update the model
      this.$emit('cookies', Math.max(_cookies - oldCookies, 0));
    },
    clicks: function clicks(_clicks) {
      // Update the model
      this.$emit('clicks', _clicks);
    }
  },
  methods: {
    click: function click(event) {
      this.$emit('click', event);
    }
  }
});

var cookieClickerControls = Vue.component('cookie-clicker-controls', {
  template: '\n<div id="cookie-clicker-controls" class="noselect">\n  <button v-on:click="reset()" id="reset">\n    <span class="icon icon-spinner11"></span>\n    Reset\n  </button>\n</div>',
  props: ['code'],
  methods: {
    reset: function reset() {
      // Rerun the code
      runCookieClicker(this.code);
    }
  }
});

var interactionCheck = Vue.component('interaction-check', {
  template: '\n<div id="interaction-check" v-if="show">\n  <div v-html="goal.interaction.message"></div>\n  <click-pointer v-bind:coords="cookieCoords()"></click-pointer>\n </div>',
  props: ['show', 'goal', 'clicks'],
  methods: {
    cookieCoords: function cookieCoords() {
      // Get coordinates of the cookie-clicker cookie
      var bbox = document.querySelector('#cookie-clicker img').getBoundingClientRect();
      return {
        // Middle of the cookie
        left: bbox.left + bbox.width / 2 - 25,
        top: bbox.top + bbox.height / 2
      };
    }
  }
});

var goalsList = Vue.component('goal-list', {
  template: '\n<div id="course-nav-tray">\n<div id="course-nav-tray-container" class="">\n  <ol v-for="goal in goals" v-if="goal.unlocked" class="slide-group">\n    <li\n        class="slide"\n        v-on:click="select(goal)">\n      <span href="#"\n          class="js-slide-link problem" v-bind:class="classes(goal)">\n        <h3 class="slide-title">\n          {{ goal.title }}\n        </h3>\n        <span class="tooltip-area hide-open" data-toggle="tooltip" data-placement="right" data-container="body" title="" v-bind:data-original-title="goal.title"></span>\n        <span class="slide-jump-pip"></span>\n      </span>\n    </li>\n  </ol>\n</div>\n</div>',
  props: ['goals', 'selected', 'blockly'],
  methods: {
    select: function select(goal) {
      // Update whether the goal has been seen or not
      clearTimeout(this.seenTimeout);
      this.seenTimeout = setTimeout(function () {
        Vue.set(goal, 'seen', true);
        Cookies.set('goals[' + goal.id + '].seen', goal.seen);
      }, 2500);

      // Update selection
      this.$emit('select', goal);
    },
    classes: function classes(goal) {
      // Turn goal status into CSS class
      return {
        current: goal == this.selected,
        solved: goal.completed,
        passed: checksPass(this.blockly, goal)
      };
    }
  }
});

var goalDescription = Vue.component('goal-description', {
  template: '\n<div id="goal">\n  <h2 v-if="goal">{{ goal.title }}</h2>\n  <div id="description" v-if="goal" v-html="goal.description"></div>\n  <h2 v-if="!goal">Cookie Clicker Experiments</h2>\n  <div id="description" v-if="!goal">\n    You\'ve completed all the goals! Can you make your cookie clicker even better?\n  </div>\n</div>',
  props: ['goal']
});

var hintDisplay = Vue.component('hint-display', {
  template: '\n<div v-if="hint && hint.revealed" class="blockly-hint" v-bind:style="position(hint, blockly)">\n    <div v-html="hint.hint" ></div>\n    <div v-if="hint.direct" v-html="message(hint)" ></div>\n</div>',
  props: ['hint', 'blockly'],
  methods: {
    position: function position(hint, blockly) {
      // Get location coordinates
      var coords = locationToCoords(blockly, hintLocation(hint));
      // Output as element style
      if (coords) {
        return {
          left: coords.left + 'px',
          top: coords.top + 'px'
        };
      } else {
        return {
          display: 'none'
        };
      }
    },
    message: function message(hint) {
      return hintMessage(hint);
    }
  }
});

var animatedPointer = Vue.component('animated-pointer', {
  template: '\n<div class="pointer" v-on:enter="animate" v-bind:style="position(coords)"></div>',
  props: ['start', 'end'],
  data: function data() {
    return {
      coords: undefined,
      tween: undefined
    };
  },
  mounted: function mounted() {
    // Begin animation
    this.animation();
  },
  watch: {
    start: function start() {
      this.animation();
    },
    end: function end() {
      this.animation();
    }
  },
  methods: {
    animate: function animate() {
      // Update the animation each frame
      function animate() {
        if (TWEEN.update()) {
          requestAnimationFrame(animate);
        }
      }
      animate();
    },
    animation: function animation() {
      // Stop previous animation
      if (this.tween) {
        this.tween.stop();
      }

      // Animate the pointer from start/end
      if (this.start && this.end) {
        var vm = this;
        this.tween = new TWEEN.Tween(this.start).to(this.end, 600).repeat(Infinity).delay(1000).onUpdate(function () {
          vm.coords = this;
        }).start();
        this.animate();
      }
    },
    position: function position(coords) {
      // Turn coordinates into an element style
      if (coords) {
        return {
          position: 'absolute',
          left: coords.left.toFixed(0) + 'px',
          top: coords.top.toFixed(0) + 'px'
        };
      } else {
        return {
          display: 'none'
        };
      }
    }
  }
});

var clickPointer = Vue.component('click-pointer', {
  template: '<animated-pointer v-bind:start="start" v-bind:end="end"></animated-pointer>',
  props: ['coords'],
  data: function data() {
    return this.coordsStartEnd();
  },
  methods: {
    coordsStartEnd: function coordsStartEnd() {
      // Animate a clicking motion
      if (this.coords) {
        return {
          start: { left: this.coords.left, top: this.coords.top + 10 },
          end: this.coords
        };
      }
      // No coords no animation
      else {
          return {
            start: undefined,
            end: undefined
          };
        }
    }
  },
  watch: {
    coords: function coords() {
      // Set the start and end of the animation
      var startEnd = this.coordsStartEnd();
      this.start = startEnd.start;
      this.end = startEnd.end;
    }
  }
});

var nextGoal = Vue.component('next-goal', {
  template: '\n<div id="next-goal" v-if="choosing">\n  <h1>Choose your next goal</h1>\n    <ol id="next-goals">\n      <li v-for="goal in goals" v-if="!goal.completed && unlocked(goal)" class="noselect" v-on:click="select(goal)">\n        <h2>\n          {{ goal.title }}\n          <span class="reward">\n            <img src="images/mini-cookie-full.png"> \xD7 {{ goal.reward }}\n          </span>\n        </h2>\n        <p v-html="goal.shortDescription"></p>\n        <ul id="goal-blocks">\n          <li v-for="block in blocks(goal)" v-html="block"></li>\n        </ul>\n      </li>\n    </ol>\n</div>',
  props: ['choosing', 'goal', 'goals'],
  watch: {
    rewards: function rewards(_rewards) {
      this.state = 'cookie';
    }
  },
  methods: {
    unlocked: function unlocked(goal) {
      var _this = this;

      // Have all of the goal's prerequisites been completed?
      var prereqs = goal.prerequisites.map(function (prereq) {
        return _this.goals.find(function (goal) {
          return goal.id == prereq;
        });
      });
      return prereqs.every(function (goal) {
        return goal.completed;
      });
    },
    select: function select(goal) {
      // Unlock the goal
      goal.unlocked = true;
      this.$emit('select', goal);
    },
    blocks: function blocks(goal) {
      // Get set of blocks found in this goal
      var blocks = goal.hints.map(function (hint) {
        return hint.block;
      }).filter(function (block) {
        return !!block;
      }).filter(function (x, i, a) {
        return a.indexOf(x) == i;
      });
      // return HTML for blocks found in this goal
      return blocks.map(inlineBlock);
    }
  }
});

var completionCelebration = Vue.component('completionCelebration', {
  template: '\n<div>\n    <div class="fade-background noselect" v-on:click="click"></div>\n    <div id="firework-overlay"></div>\n    <div id="completion-message">\n      <h1>You made a cookie clicker!</h1>\n      <h2>Click anywhere to continue experimenting with your cookie clicker</h2>\n    </div>\n</div>',
  mounted: function mounted() {
    var fireworkOverlay = this.$el.querySelector('#firework-overlay');
    var repeat = setInterval(function () {
      cookieFirework(fireworkOverlay, screen.availWidth * Math.random(), screen.availHeight * Math.random(), 0.8 + Math.random() * 2);
    }, 1000);
  },
  methods: {
    click: function click() {
      this.$emit('click');
    }
  }
});

Vue.config.ignoredElements = ['bk'];