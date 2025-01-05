var questionsData = [];
var currentQuestionIndex = 0;
var userAnswers = [];
var quizFinished = false;
var groupSize = 50; // e.g. 50 questions per group

// Shuffle array
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Convert question => array of { text, isCorrect }, shuffle those 4
function prepareQuestionData(question) {
  const correctIndex = parseInt(question.correctAnswer, 10) - 1;
  let newOptions = question.options.map((optText, idx) => {
    return {
      text: optText,
      isCorrect: (idx === correctIndex)
    };
  });
  shuffleArray(newOptions);
  question.options = newOptions;
}

/**
 * startQuiz(jsonUrl, timeLimitMinutes, maxQuestions, shuffleQuestions)
 * If (shuffleQuestions==false && maxQuestions==0) => int. mode => group nav, show answer, skip Qs, Prev/Next, etc.
 */
async function startQuiz(jsonUrl, timeLimitMinutes, maxQuestions, shuffleQuestions) {
  // Hide welcome
  document.getElementById("welcomeSection").style.display = "none";
  document.getElementById("quizContainer").style.display = "block";

  // Reset
  questionsData = [];
  userAnswers = [];
  quizFinished = false;
  currentQuestionIndex = 0;

  // Check if big test
  const isBigTest = (!shuffleQuestions && maxQuestions === 0);

  // Show/hide big-test UI
  document.getElementById("groupsContainer").style.display = isBigTest ? "block" : "none";
  document.getElementById("showAnswerBtn").style.display = isBigTest ? "inline-block" : "none";
  document.getElementById("terminateButton").style.display = isBigTest ? "inline-block" : "none";
  // Also show/hide prevButton
  document.getElementById("prevButton").style.display = isBigTest ? "inline-block" : "none";

  try {
    const response = await fetch(jsonUrl);
    const data = await response.json();
    questionsData = data.questions;
  } catch (error) {
    console.error("Errore nel caricamento delle domande:", error);
    return;
  }

  // If NOT big test => shuffle question order & limit
  if (!isBigTest && shuffleQuestions) {
    shuffleArray(questionsData);
  }
  if (!isBigTest && maxQuestions > 0 && questionsData.length > maxQuestions) {
    questionsData = questionsData.slice(0, maxQuestions);
  }

  // For each Q => shuffle the 4 options
  questionsData.forEach(q => prepareQuestionData(q));

  // If big test => create group nav
  if (isBigTest) {
    createGroupNavigation();
  }

  // Show first question
  showQuestion();

  // Start timer
  setTimerDuration(timeLimitMinutes);
  startTimer();
}

function createGroupNavigation() {
  const container = document.getElementById("groupsContainer");
  container.innerHTML = "";

  let total = questionsData.length;
  let startIndex = 0;

  while (startIndex < total) {
    let endIndex = startIndex + groupSize - 1;
    if (endIndex >= total - 1) {
      endIndex = total - 1;
    }

    if (startIndex >= total) {
      break;
    }

    const label = (startIndex + 1) + "-" + (endIndex + 1);
    // Cattura il valore di startIndex in una costante separata
    const sIndex = startIndex;

    let btn = document.createElement("button");
    btn.className = "btn btn-outline-secondary btn-sm";
    btn.textContent = label;

    // Ora nella callback uso sIndex anziché startIndex
    btn.addEventListener("click", () => {
      currentQuestionIndex = sIndex;
      showQuestion();
    });

    container.appendChild(btn);

    startIndex += groupSize;
  }
}

/** Render the current question. */
function showQuestion() {
  if (currentQuestionIndex < 0) {
    currentQuestionIndex = 0;
  } else if (currentQuestionIndex >= questionsData.length) {
    currentQuestionIndex = questionsData.length - 1;
  }
  
//if (currentQuestionIndex >= questionsData.length) return;

  // Hide old answer
  document.getElementById("answerContainer").style.display = "none";
  document.getElementById("answerContainer").textContent = "";

  const questionObj = questionsData[currentQuestionIndex];
  document.getElementById("questionCount").textContent =
    "Domanda " + (currentQuestionIndex + 1) + " di " + questionsData.length;

  document.getElementById("questionText").textContent = questionObj.question;

  const optionsContainer = document.getElementById("optionsContainer");
  optionsContainer.innerHTML = "";

  const nextBtn = document.getElementById("nextButton");
  const prevBtn = document.getElementById("prevButton");

  // Check big test
  const isBigTest = 
    (document.getElementById("groupsContainer").style.display === "block" &&
     !quizFinished);

  if (isBigTest) {
    // Big test => skip allowed => "Next" always enabled
    nextBtn.disabled = false;
    // "Previous" is enabled unless we are on question #1
    if (currentQuestionIndex > 0) {
      prevBtn.disabled = false;
    } else {
      prevBtn.disabled = true;
    }
  } else {
    // Normal mode => "Next" is disabled until user picks
    nextBtn.disabled = true;
    // Hide or disable prev
    prevBtn.style.display = "none";
  }

  // Build the radio list
  for (let i = 0; i < questionObj.options.length; i++) {
    const opt = questionObj.options[i];
    const div = document.createElement("div");
    div.className = "form-check";

    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "quizOption";
    radio.id = "option" + i;
    radio.value = i;
    radio.className = "form-check-input";

    // If previously chosen
    if (userAnswers[currentQuestionIndex] === i) {
      radio.checked = true;
      // If not big test, that means "Next" is now enabled
      if (!isBigTest) nextBtn.disabled = false;
    }

    // If not big test => picking an option => enable next
    if (!isBigTest) {
      radio.addEventListener("change", () => {
        nextBtn.disabled = false;
      });
    }

    const label = document.createElement("label");
    label.className = "form-check-label";
    label.htmlFor = "option" + i;
    label.textContent = opt.text;

    div.appendChild(radio);
    div.appendChild(label);
    optionsContainer.appendChild(div);
  }

  // If last => show finish
  if (currentQuestionIndex === questionsData.length - 1) {
    nextBtn.style.display = "none";
    document.getElementById("finishButton").style.display = "inline-block";
  } else {
    nextBtn.style.display = "inline-block";
    document.getElementById("finishButton").style.display = "none";
  }
}

/** Move to next question. */
function goToNextQuestion() {
  saveAnswer();
  if (currentQuestionIndex < questionsData.length - 1) {
    currentQuestionIndex++;
    showQuestion();
  }
}

/** Move to previous question (big test only). */
function goToPrevQuestion() {
  saveAnswer();
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    showQuestion();
  }
}

/** Save chosen radio index. */
function saveAnswer() {
  const radios = document.getElementsByName("quizOption");
  let chosenIdx = undefined;
  for (let i = 0; i < radios.length; i++) {
    if (radios[i].checked) {
      chosenIdx = parseInt(radios[i].value);
      break;
    }
  }
  userAnswers[currentQuestionIndex] = chosenIdx;
}

/** Show correct answer for the current question. */
function showAnswer() {
  if (currentQuestionIndex >= questionsData.length) return;
  const q = questionsData[currentQuestionIndex];
  const correct = q.options.find(o => o.isCorrect);
  if (!correct) return;

  const ansContainer = document.getElementById("answerContainer");
  ansContainer.textContent = "Risposta corretta: " + correct.text;
  ansContainer.style.display = "block";
}

/** Finish or Terminate quiz early. */
function finishQuiz() {
  if (quizFinished) return;
  quizFinished = true;

  stopTimer();
  saveAnswer();

  let correctCount = 0;
  let wrongDetails = [];

  for (let i = 0; i < questionsData.length; i++) {
    const q = questionsData[i];
    const chosen = userAnswers[i];
    if (chosen === undefined) {
      const cOpt = q.options.find(o => o.isCorrect);
      wrongDetails.push({
        question: q.question,
        userChoice: "Nessuna risposta",
        correctChoice: cOpt ? cOpt.text : "(N/A)"
      });
    } else {
      if (q.options[chosen].isCorrect) {
        correctCount++;
      } else {
        const cOpt = q.options.find(o => o.isCorrect);
        wrongDetails.push({
          question: q.question,
          userChoice: q.options[chosen].text,
          correctChoice: cOpt ? cOpt.text : "(N/A)"
        });
      }
    }
  }

  document.getElementById("questionCount").textContent = "Quiz Terminato!";
  document.getElementById("questionText").textContent =
    "Hai risposto correttamente a " + correctCount + " su " + questionsData.length + " domande.";

  document.getElementById("optionsContainer").innerHTML = "";
  document.getElementById("showAnswerBtn").style.display = "none";
  document.getElementById("answerContainer").style.display = "none";
  document.getElementById("answerContainer").textContent = "";

  // Hide Nav buttons
  document.getElementById("nextButton").style.display = "none";
  document.getElementById("finishButton").style.display = "none";
  document.getElementById("terminateButton").style.display = "none";
  document.getElementById("prevButton").style.display = "none";

  document.getElementById("pauseButton").style.display = "none";
  document.getElementById("groupsContainer").style.display = "none";

  // Show wrong answers
  if (wrongDetails.length > 0) {
    const optionsContainer = document.getElementById("optionsContainer");
    const wrongBox = document.createElement("div");
    wrongBox.className = "wrong-answer-box";

    const title = document.createElement("h4");
    title.textContent = "Risposte Errate:";
    wrongBox.appendChild(title);

    wrongDetails.forEach(item => {
      const div = document.createElement("div");
      div.className = "wrong-answer-item";

      const qText = document.createElement("p");
      qText.innerHTML = "<strong>Domanda:</strong> " + item.question;

      const uChoice = document.createElement("p");
      uChoice.innerHTML = "<strong>Tua risposta:</strong> " + item.userChoice;

      const cChoice = document.createElement("p");
      cChoice.innerHTML = "<strong>Risposta corretta:</strong> " + item.correctChoice;

      div.appendChild(qText);
      div.appendChild(uChoice);
      div.appendChild(cChoice);
      wrongBox.appendChild(div);
    });

    optionsContainer.appendChild(wrongBox);
  }
}
