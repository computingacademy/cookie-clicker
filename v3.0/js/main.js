'use strict';

var mainVue = new Vue({
  el: '.main',
  data: {
    blockly: {
      workspace: undefined,
      code: '',
      blocks: [],
      toolbox: [],
      offset: {}
    },
    cookies: 0,
    clicks: 0,
    goals: goals,
    goalRewards: [],
    selectedGoal: undefined,
    choosingNextGoal: false,
    nextHint: {},
    cookieClickerCoords: undefined,
    party: false
  },
  mounted: function mounted() {
    // Load previous progress
    load(this);

    // Turn on hints
    this.hintson = true;

    // Update the blocks
    unlockBlocks(this.blockly);
  },
  watch: {
    'blockly.blocks': function blocklyBlocks() {
      // Reset the number of clicks
      this.clicks = 0;

      // Save progress every time blocks are changed
      save(this);

      // Update hint
      if (this.selectedGoal) this.nextHint = this.getNextHint(this.selectedGoal.hints);
    },
    clicks: function clicks() {
      // Has the interaction for the selected goal been completed?
      var interacted = this.clicks >= this.selectedGoal.interaction.clicks;
      Vue.set(this.selectedGoal, 'interacted', interacted);
    },
    'selectedGoal.interacted': function selectedGoalInteracted(interacted) {
      // We tested the cookie clicker by clicking it 
      if (interacted) {
        // If the interaction has been completed and all the checks are passing then the goal is complete!
        var completed = checksPass(this.blockly, this.selectedGoal);

        // If the goal is completed
        if (completed) {
          // Update goal status
          this.selectedGoal.completed = true;

          // Get a reward
          this.cookies += this.selectedGoal.reward;

          // Save progress
          save(this);

          // If there are any goals left to complete
          if (this.goals.some(function (goal) {
            return !goal.completed;
          })) {
            // Choose another goal
            var vm = this;
            setTimeout(function () {
              vm.choosingNextGoal = true;
            }, 1500);
          }
          // Otherwise, party!
          else {
              this.selectedGoal = undefined;
              this.party = true;
            }
        }
      }
    },
    'selectedGoal.hints': function selectedGoalHints(hints) {
      // Update hint
      this.nextHint = this.getNextHint(this.selectedGoal.hints);
    }
  },
  methods: {
    buyHint: function buyHint(hint) {
      // First time, reveal the hint
      if (!hint.revealed) {
        if (this.cookies >= hint.cost) {
          Vue.set(hint, 'revealed', true);
          // Use the cookies to reveal the hint
          this.cookies -= hint.cost;
        }
      }
      // Then give direct instructions
      else {
          if (this.cookies >= hint.cost * 10) {
            Vue.set(hint, 'direct', true);
            // Use the cookies to reveal the hint
            this.cookies -= hint.cost * 10;
          }
        }
    },
    getNextHint: function getNextHint(hints) {
      var _this = this;

      return hints.find(function (hint) {
        return usefulHint(hint, _this.blockly.blocks);
      });
    },
    pointerStart: function pointerStart(blockly, hint) {
      if (hint && blockly.workspace) {
        return locationToCoords(blockly, pointerStartLocation(hint));
      }
    },
    pointerEnd: function pointerEnd(blockly, hint) {
      if (hint && blockly.workspace) {
        return locationToCoords(blockly, pointerEndLocation(hint));
      }
    },
    selectGoal: function selectGoal(goal) {
      // Select the goal 
      this.selectedGoal = goal;
      this.choosingNextGoal = false;

      // When changing goals, reset the cookie clicker 
      runCode(this.blockly.code);

      // Update the blocks
      unlockBlocks(this.blockly);
    },
    fireworksClick: function fireworksClick(event) {
      if (this.clicks == this.selectedGoal.interaction.clicks && this.selectedGoal.completed) {
        // Celebrate
        var fireworkOverlay = document.querySelector('#firework-overlay');
        cookieFirework(fireworkOverlay, event.clientX, event.clientY);
      }
    }
  }
});