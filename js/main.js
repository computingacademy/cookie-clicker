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
    nextHint: {},
  },
  mounted: function() {
    // Load previous progress
    load(this);

    // Update goal statuses
    updateGoals(this, true);
    // Turn on hints
    this.hintson = true;
  },
  watch: {
    'blockly.blocks': function() {
      // Reset the number of clicks
      this.clicks = 0

      // Update goal statuses
      updateGoals(this);

      // Save progress every time blocks are changed
      save(this);

      // Update hint
      if (this.selectedGoal)
        this.nextHint = this.getNextHint(this.selectedGoal.hints);
    },
    clicks: function() {
      // Update goal statuses
      updateGoals(this);
    },
    goals: function() {
      // Save updated goal progress
      save(this);
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
        hint.revealed = true;
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
  },
});
