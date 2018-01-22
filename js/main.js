let mainVue = new Vue({
  el: '#main',
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
    hintson: false,
    goals: goals,
    goalRewards: [],
    selectedGoal: undefined,
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
      // Update goal statuses
      updateGoals(this);

      // Save progress every time blocks are changed
      save(this);
    },
    clicks: function() {
      // Update goal statuses
      updateGoals(this);
    },
    goals: function() {
      // Save updated goal progress
      save(this);
    },
    hintson: function() {
      // Have the hints been seen?
      if (this.hintson && this.selectedGoal)
        // Save the 'hint seen' status
        Cookies.set(`goals[${this.selectedGoal.id}].hintsSeen`, true);
    },
  }
});
