// Global
var questionsData = [];
var currentQuestionIndex = 0;
var userAnswers = [];
var quizFinished = false;

// Shuffle utility
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Prepare question => shuffle its options
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

// Start quiz
async function startQuiz() {
  // Hide welcome, show quiz
  document.getElementById("welcomeSection").style.display = "none";
  document.getElementById("quizContainer").style.display = "block";

  // Fetch
  try {
    const response = await fetch("https://raw.githubusercontent.com/quizesame/quizesame.github.io/main/domande.json");
    const data = await response.json();
    questionsData = data.questions;
  } catch (err) {
    console.error("Errore nel caricamento delle domande:", err);
    return;
  }

  // Shuffle entire question list
  shuffleArray(questionsData);

  // Now limit to 15 questions
  if (questionsData.length > 15) {
    questionsData = questionsData.slice(0, 15);
  }

  // For each question, shuffle its options
  questionsData.forEach(q => prepareQuestionData(q));

  // Show first Q
  currentQuestionIndex = 0;
  showQuestion();

  // Start timer
  startTimer();
}

// Render question
function showQuestion() {
  if (currentQuestionIndex >= questionsData.length) return;

  const qObj = questionsData[currentQuestionIndex];

  document.getElementById("questionCount").textContent = 
    "Domanda " + (currentQuestionIndex + 1);

  document.getElementById("questionText").textContent = qObj.question;

  const optionsContainer = document.getElementById("optionsContainer");
  optionsContainer.innerHTML = "";

  const nextBtn = document.getElementById("nextButton");
  nextBtn.disabled = true;

  // Build radio list
  for (let i = 0; i < qObj.options.length; i++) {
    const opt = qObj.options[i];

    const formCheckDiv = document.createElement("div");
    formCheckDiv.className = "form-check";

    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "quizOption";
    radio.id = "option" + i;
    radio.value = i;
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

// Move to next question
function goToNextQuestion() {
  saveAnswer();
  if (currentQuestionIndex < questionsData.length - 1) {
    currentQuestionIndex++;
    showQuestion();
  }
}

// Save chosen answer
function saveAnswer() {
  const radios = document.getElementsByName("quizOption");
  let chosenIdx;
  for (let i = 0; i < radios.length; i++) {
    if (radios[i].checked) {
      chosenIdx = parseInt(radios[i].value);
      break;
    }
  }
  userAnswers[currentQuestionIndex] = chosenIdx;
}

// Finish quiz => show results, hide timer, etc.
function finishQuiz() {
  if (quizFinished) return;
  quizFinished = true;

  clearInterval(countdown); // stop timer
  document.getElementById("timer").style.display = "none"; // hide timer
  saveAnswer();

  let correctCount = 0;
  let wrongDetails = [];

  for (let i = 0; i < questionsData.length; i++) {
    const q = questionsData[i];
    const chosen = userAnswers[i];
    if (chosen === undefined) {
      // user didn't pick
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
        // wrong
        const correctOpt = q.options.find(o => o.isCorrect);
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

  // Show wrong answers
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

  document.getElementById("nextButton").style.display = "none";
  document.getElementById("finishButton").style.display = "none";
}
