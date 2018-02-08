let mainVue = new Vue({
  el: 'main',
  data: {
    blockly: {
      workspace: undefined,
      code: '',
      blocks: [],
      toolbox: [],
      offset: {},
    },
    cookies: 0,
    clicks: 0,
    goals: goals,
    goalRewards: [],
    selectedGoal: undefined,
    choosingNextGoal: false,
    nextHint: {},
    cookieClickerCoords: undefined,
  },
  mounted: function() {
    // Load previous progress
    load(this);

    // Turn on hints
    this.hintson = true;

    // Update the blocks
    unlockBlocks(this.blockly);
  },
  watch: {
    'blockly.blocks': function() {
      // Reset the number of clicks
      this.clicks = 0

      // Save progress every time blocks are changed
      save(this);

      // Update hint
      if (this.selectedGoal)
        this.nextHint = this.getNextHint(this.selectedGoal.hints);
    },
    clicks: function() {
      // Has the interaction for the selected goal been completed?
      let interacted = this.clicks >= this.selectedGoal.interaction.clicks;
      Vue.set(this.selectedGoal, 'interacted', interacted);
    },
    'selectedGoal.interacted': function(interacted) {
      // We tested the cookie clicker by clicking it 
      if (interacted) {
        // If the interaction has been completed and all the checks are passing then the goal is complete!
        let completed = checksPass(this.blockly, this.selectedGoal);

        // If the goal is completed
        if (completed) {
          // Update goal status
          this.selectedGoal.completed = true;

          // Get a reward
          this.cookies += this.selectedGoal.reward;

          // Reset cookie clicker
          runCode(this.blockly.code);

          // Save progress
          save(this);

          // If there are any goals left to complete
          if (this.goals.some(goal => !goal.completed)) {
            // And choose another goal
            this.choosingNextGoal = true;
          }
          // Otherwise, party!
          else {
            let fireworkOverlay = document.querySelector('#firework-overlay');
            let repeat = setInterval(function() {
              cookieFirework(fireworkOverlay, screen.availWidth*Math.random(), screen.availHeight*Math.random(), 0.8 + Math.random()*2);
            }, 500);
          }
        }
      }
    },
    'selectedGoal.hints': function(hints) {
      // Update hint
      this.nextHint = this.getNextHint(this.selectedGoal.hints);
    },
  },
  methods: {
    buyHint: function(hint) {
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
    getNextHint: function(hints) {
      return hints.find(hint => usefulHint(hint, this.blockly.blocks));
    },
    pointerStart: function(blockly, hint) {
      if (hint && blockly.workspace) {
        return locationToCoords(blockly, pointerStartLocation(hint));
      }
    },
    pointerEnd: function(blockly, hint) {
      if (hint && blockly.workspace) {
        return locationToCoords(blockly, pointerEndLocation(hint));
      }
    },
    selectGoal: function(goal) {
      // Select the goal 
      this.selectedGoal = goal;
      this.choosingNextGoal = false;

      // When changing goals, reset the cookie clicker 
      runCode(this.blockly.code);

      // Update the blocks
      unlockBlocks(this.blockly);
    },
  },
});
