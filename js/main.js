Cookies.set(`goals[${mainVue.selectedGoal.id}].hintsSeen`, true);

// Connect the cookies variable in the cookie clicker game to the overall cookie counter
Object.defineProperty(window, 'cookies', {
  get: function() {
    // Get the number of cookies
    if (window._test)
      return this._testCookies;
    else
      return this._cookies;
  },
  set: function(val) {
    // Update cookies value
    if (window._test)
      this._testCookies = val;
    else {
      mainVue.cookies = (mainVue.cookies + val-this._cookies) || val;
      this._cookies = val;
    }
  }
});
