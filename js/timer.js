var countdown;
var totalTime = 1800; // default 30 min if we want

function setTimerDuration(minutes) {
  totalTime = minutes * 60; // store in seconds
}

function startTimer() {
  var display = document.getElementById("timer");
  display.style.display = "block"; // show it
  var start = Date.now();

  countdown = setInterval(function () {
    const elapsed = Math.floor((Date.now() - start) / 1000);
    const remaining = totalTime - elapsed;

    if (remaining <= 0) {
      clearInterval(countdown);
      finishQuiz(); // time’s up
      display.textContent = "00 : 00";
      return;
    }

    let minutes = Math.floor(remaining / 60);
    let seconds = remaining % 60;
    if (minutes < 10) minutes = "0" + minutes;
    if (seconds < 10) seconds = "0" + seconds;
    display.textContent = minutes + " : " + seconds;
  }, 1000);
}
