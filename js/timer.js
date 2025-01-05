var countdown;
var totalTime = 1800; // default 30 min if we want
var isPaused = false;
var timeRemaining = 0;


function setTimerDuration(minutes) {
  totalTime = minutes * 60; // store in seconds
}

function togglePause() {
  if (!isPaused) {
    isPaused = true;
    document.getElementById("pauseButton").textContent = "Resume";
  } else {
    isPaused = false;
    document.getElementById("pauseButton").textContent = "Pause";
  }
}


function startTimer() {
  var display = document.getElementById("timer");
  display.style.display = "block";
  
  timeRemaining = totalTime;

  document.getElementById("pauseButton").style.display = "inline-block";
  document.getElementById("pauseButton").textContent = "Pause";

  countdown = setInterval(function () {
    if (!isPaused) {
      timeRemaining--;
      if (timeRemaining <= 0) {
        clearInterval(countdown);
        finishQuiz();
        display.textContent = "00 : 00";
        return;
      }

      let minutes = Math.floor(timeRemaining / 60);
      let seconds = timeRemaining % 60;
      if (minutes < 10) minutes = "0" + minutes;
      if (seconds < 10) seconds = "0" + seconds;
      display.textContent = minutes + " : " + seconds;
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(countdown);
  document.getElementById("timer").style.display = "none";
}
