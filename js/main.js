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

          // And choose another goal
          this.choosingNextGoal = true;
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
      // If there are enough cookies
      if (!hint.revealed && this.cookies >= hint.cost) {
        // Use the cookies to reveal the hint
        this.cookies -= hint.cost;
        Vue.set(hint, 'revealed', true);
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
