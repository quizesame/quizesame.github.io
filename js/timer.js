var countdown;
var totalTime = 1800; // 30 minutes

function startTimer() {
  var display = document.getElementById("timer");
  display.style.display = "block"; // show it when quiz starts
  var start = Date.now();

  countdown = setInterval(function () {
    var elapsed = Math.floor((Date.now() - start) / 1000);
    var remaining = totalTime - elapsed;

    if (remaining <= 0) {
      clearInterval(countdown);
      finishQuiz(); // auto-finish if time expires
      display.textContent = "00 : 00";
      return;
    }

    var minutes = Math.floor(remaining / 60);
    var seconds = remaining % 60;
    if (minutes < 10) minutes = "0" + minutes;
    if (seconds < 10) seconds = "0" + seconds;
    display.textContent = minutes + " : " + seconds;
  }, 1000);
}
