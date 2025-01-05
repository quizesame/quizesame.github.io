
// Global
var questionsData = [];
var currentQuestionIndex = 0;
var userAnswers = [];
var quizFinished = false;

// Utility to shuffle arrays (Fisher-Yates)
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

/**
 * Prepare question => convert "options" to an array of { text, isCorrect }, shuffle that array
 * so we randomize the 4 choices, always.
 */
function prepareQuestionData(question) {
  const correctIndex = parseInt(question.correctAnswer, 10) - 1;
  // Build array of { text, isCorrect }
  let newOptions = question.options.map((optText, idx) => {
    return {
      text: optText,
      isCorrect: (idx === correctIndex)
    };
  });
  // Always shuffle the multiple-choice options
  shuffleArray(newOptions);
  question.options = newOptions;
}

/**
 * main startQuiz function
 * @param {string} jsonUrl - e.g. "legislazione.json"
 * @param {number} timeLimitMinutes - e.g. 30 or 60
 * @param {number} maxQuestions - e.g. 15 or 0 (0 means no limit)
 * @param {boolean} shuffleQuestions - whether to shuffle the question order
 */
async function startQuiz(jsonUrl, timeLimitMinutes, maxQuestions, shuffleQuestions) {
  // Hide welcome, show quiz
  document.getElementById("welcomeSection").style.display = "none";
  document.getElementById("quizContainer").style.display = "block";

  // Load JSON
  try {
    const response = await fetch(jsonUrl);
    const data = await response.json();
    questionsData = data.questions;
  } catch (error) {
    console.error("Errore nel caricamento delle domande:", error);
    return;
  }

  // Possibly shuffle the question order
  if (shuffleQuestions) {
    shuffleArray(questionsData);
  }

  // If maxQuestions > 0, slice the array
  if (maxQuestions > 0 && questionsData.length > maxQuestions) {
    questionsData = questionsData.slice(0, maxQuestions);
  }

  // For each question, shuffle options
  questionsData.forEach(q => prepareQuestionData(q));

  // Start at first question
  currentQuestionIndex = 0;
  userAnswers = [];
  quizFinished = false;

  // Show the question
  showQuestion();

  // Set up the timer for timeLimitMinutes
  setTimerDuration(timeLimitMinutes);
  startTimer();
}

/**
 * Render the current question
 */
function showQuestion() {
  if (currentQuestionIndex >= questionsData.length) return;

  const questionObj = questionsData[currentQuestionIndex];

  // "Domanda X"
  document.getElementById("questionCount").textContent = 
    "Domanda " + (currentQuestionIndex + 1);

  // question text
  document.getElementById("questionText").textContent = questionObj.question;

  // Clear old options
  const optionsContainer = document.getElementById("optionsContainer");
  optionsContainer.innerHTML = "";

  // Next disabled until user picks
  const nextBtn = document.getElementById("nextButton");
  nextBtn.disabled = true;

  // Build radio list from questionObj.options
  for (let i = 0; i < questionObj.options.length; i++) {
    const opt = questionObj.options[i]; // { text, isCorrect }

    const formCheckDiv = document.createElement("div");
    formCheckDiv.className = "form-check";

    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "quizOption";
    radio.id = "option" + i;
    radio.value = i; // index
    radio.className = "form-check-input";

    // If user previously answered
    if (userAnswers[currentQuestionIndex] === i) {
      radio.checked = true;
      nextBtn.disabled = false;
    }

    // On change => enable Next
    radio.addEventListener("change", () => {
      nextBtn.disabled = false;
    });

    const label = document.createElement("label");
    label.className = "form-check-label";
    label.htmlFor = "option" + i;
    label.textContent = opt.text;

    formCheckDiv.appendChild(radio);
    formCheckDiv.appendChild(label);
    optionsContainer.appendChild(formCheckDiv);
  }

  // If last question => show Finish
  if (currentQuestionIndex === questionsData.length - 1) {
    nextBtn.style.display = "none";
    document.getElementById("finishButton").style.display = "inline-block";
  } else {
    nextBtn.style.display = "inline-block";
    document.getElementById("finishButton").style.display = "none";
  }
}

/**
 * Save user answer, go to next question
 */
function goToNextQuestion() {
  saveAnswer();
  if (currentQuestionIndex < questionsData.length - 1) {
    currentQuestionIndex++;
    showQuestion();
  }
}

/**
 * Grab the chosen radio index
 */
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

/**
 * End quiz: stop timer, show results, list wrong answers
 */
function finishQuiz() {
  if (quizFinished) return;
  quizFinished = true;

  // Stop timer
  clearInterval(countdown);
  document.getElementById("timer").style.display = "none";

  // Save answer for last question
  saveAnswer();

  let correctCount = 0;
  let wrongDetails = [];

  for (let i = 0; i < questionsData.length; i++) {
    const q = questionsData[i];
    const chosen = userAnswers[i];
    if (chosen === undefined) {
      // No pick
      const correctOpt = q.options.find(o => o.isCorrect === true);
      wrongDetails.push({
        question: q.question,
        userChoice: "Nessuna risposta",
        correctChoice: correctOpt ? correctOpt.text : "(N/A)"
      });
    } else {
      if (q.options[chosen].isCorrect) {
        correctCount++;
      } else {
        const correctOpt = q.options.find(o => o.isCorrect === true);
        wrongDetails.push({
          question: q.question,
          userChoice: q.options[chosen].text,
          correctChoice: correctOpt ? correctOpt.text : "(N/A)"
        });
      }
    }
  }

  document.getElementById("questionCount").textContent = "Quiz Terminato!";
  document.getElementById("questionText").textContent =
    "Hai risposto correttamente a " + correctCount + " su " + questionsData.length + " domande.";

  const optionsContainer = document.getElementById("optionsContainer");
  optionsContainer.innerHTML = "";

  // If there are wrong answers, list them
  if (wrongDetails.length > 0) {
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

  // Hide nav buttons
  document.getElementById("nextButton").style.display = "none";
  document.getElementById("finishButton").style.display = "none";
}
