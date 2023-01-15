var quest_curr;
var quest_next;
var randData = 0;
var map = new Map();
var questions = new Map();

var ansFirst = false;
var ansSecond = false;

var expired = 0;

async function getJSON() {
    return fetch("https://raw.githubusercontent.com/quizanatomia/quizanatomia.github.io/main/domande.json")
        .then((response)=>response.json())
        .then((responseJson)=>{return responseJson});
}

async function shuffle() {
    var json = await this.getJSON();
    var data = new Map();

    let keys, randKey;
    var genKeys = new Array();
    keys = Object.keys(json)
    for (let i = 0; i < 70; i++) {
        do {
            randKey = keys[Math.floor(Math.random() * keys.length)];
        } while (genKeys.includes(randKey));
        genKeys.push(randKey);
        data.set((i+1).toString(), {
            "question": json[randKey]["question"],
            "answer": json[randKey]["answer"],
            "class": json[randKey]["class"]
        })
        delete json[randKey];
    }

    randData = 1;
    return data;
}

async function setup(val) {
    if (!randData) {
        questions = await this.shuffle();
    }

    document.getElementById("true").classList.remove("active");
    document.getElementById("false").classList.remove("active");
    document.getElementById("true2").classList.remove("active");
    document.getElementById("false2").classList.remove("active");


    document.getElementById("true").classList.add("btn-outline-success");
    document.getElementById("true").classList.remove("btn-warning");
    document.getElementById("false").classList.add("btn-outline-danger");
    document.getElementById("false").classList.remove("btn-warning");
    document.getElementById("true2").classList.add("btn-outline-success");
    document.getElementById("true2").classList.remove("btn-warning");
    document.getElementById("false2").classList.add("btn-outline-danger");
    document.getElementById("false2").classList.remove("btn-warning");

    ansFirst = false;
    ansSecond = false;

    quest_curr = val;
    quest_next = quest_curr + 1;

    // disable prev or next buttons
    if (quest_curr == 1) {
        document.getElementById("prev").setAttribute("disabled", "");
    }
    else if (quest_next == 70) {
        document.getElementById("next").setAttribute("disabled", "");
    }
    else {
        document.getElementById("prev").removeAttribute("disabled", "");
        document.getElementById("next").removeAttribute("disabled", "");
    }

    // check if the answer has already been given 
    if (map.get(quest_curr.toString()) == "V" || map.get(quest_curr.toString()) == "F") {
        document.getElementById(map.get(quest_curr.toString()) == "V" ? "true" : "false").classList.add("active");
        ansFirst = true;
    }
    if (map.get(quest_next.toString()) == "V" || map.get(quest_next.toString()) == "F") {
        document.getElementById(map.get(quest_next.toString()) == "V" ? "true2" : "false2").classList.add("active");
        ansSecond = true;
    }


    document.getElementById("quest_n").innerHTML = "Domanda " + quest_curr;
    document.getElementById("quest").innerHTML = questions.get(quest_curr.toString())["question"]

    document.getElementById("quest_n2").innerHTML = "Domanda " + (quest_next);

    // final check after the quiz has finished
    if (expired) {
        checkResults();
    }
    document.getElementById("quest2").innerHTML = questions.get((quest_curr+1).toString())["question"]
/*
    $.getJSON("https://raw.githubusercontent.com/quizanatomia/quizanatomia.github.io/main/domande.json", function(data) {
        document.getElementById("quest_n").innerHTML = "Domanda " + quest_curr;
        document.getElementById("quest").innerHTML = data[quest_curr-1]["question"];

        document.getElementById("quest_n2").innerHTML = "Domanda " + (quest_next);
        document.getElementById("quest2").innerHTML = data[quest_curr]["question"];
    });
*/
}

function hasClass(element, className) {
    return (' ' + element.className + ' ').indexOf(' ' + className+ ' ') > -1;
}

function highlightMatrixButtons() {
    var btn = document.getElementById("btn" + (quest_curr >= 10 ? quest_curr : "0" + quest_curr));
    if (ansFirst && ansSecond) {
        btn.classList.add("active");

    }
    else {
        if (hasClass(btn, "active")) {
            btn.classList.remove("active");
        }
    }
}

function answerTrue() {
    var tbtn = document.getElementById("true");
    var fbtn = document.getElementById("false");

    if (hasClass(tbtn, "active")) {
        tbtn.classList.remove("active");
        map.set(quest_curr.toString(), "");
        // map[quest_curr.toString()] = "";
        ansFirst = false;
    }
    else {
        fbtn.classList.remove("active");
        tbtn.classList.add("active");
        map.set(quest_curr.toString(), "V");
        // map[quest_curr.toString()] = "V";
        ansFirst = true;
    }

    highlightMatrixButtons();
}

function answerFalse() {
    var tbtn = document.getElementById("true");
    var fbtn = document.getElementById("false");

    if (hasClass(fbtn, "active")) {
        fbtn.classList.remove("active");
        map.set(quest_curr.toString(), "");
        // map[quest_curr.toString()] = "";
        ansFirst = false;
    }
    else {
        tbtn.classList.remove("active");
        fbtn.classList.add("active");
        map.set(quest_curr.toString(), "F");
        // map[quest_curr.toString()] = "F";
        ansFirst = true;
    }

    highlightMatrixButtons();
}

function answerTrue2() {
    var tbtn = document.getElementById("true2");
    var fbtn = document.getElementById("false2");

    if (hasClass(tbtn, "active")) {
        tbtn.classList.remove("active");
        map.set(quest_next.toString(), "");
        // map[quest_next.toString()] = "";
        ansSecond = false;
    }
    else {
        fbtn.classList.remove("active");
        tbtn.classList.add("active");
        map.set(quest_next.toString(), "V");
        // map[quest_next.toString()] = "V";
        ansSecond = true;
    }

    highlightMatrixButtons();
}

function answerFalse2() {
    var tbtn = document.getElementById("true2");
    var fbtn = document.getElementById("false2");

    if (hasClass(fbtn, "active")) {
        fbtn.classList.remove("active");
        map.set(quest_next.toString(), "");
        // map[quest_next.toString()] = "";
        ansSecond = false;
    }
    else {
        tbtn.classList.remove("active");
        fbtn.classList.add("active");
        map.set(quest_next.toString(), "F");
        // map[quest_next.toString()] = "F";
        ansSecond = true;
    }

    highlightMatrixButtons();
}

function nextQuestion() {
    setup(quest_curr+2);
}

function prevQuestion() {
    setup(quest_curr-2);
}

function selectQuestion(id) {
    setup(Number(id.slice(-2)));
}

// set the correct answers
function setPoints() {
    document.getElementById("timer").innerHTML = "Sto calcolando il risultato...";

    var btn, correct = 0;
    var quesN = 0;
    for (let i = 0; i < 70; i++) {
        quesN = i+1;

        if (quesN % 2 != 0) {
            btn = document.getElementById("btn" + (quesN >= 10 ? quesN : "0" + quesN));
        }
        else {
            btn = document.getElementById("btn" + ((quesN-1) >= 10 ? (quesN-1) : "0" + (quesN-1)));
        }
        
        if (map.get(quesN.toString()) == questions.get(quesN.toString())["answer"]) {
            correct += 1;
            console.log("La domanda " + quesN + " e' corretta.");
            if (!hasClass(btn, "btn-success")) {
                if (hasClass(btn, "btn-danger")) {
                    continue;
                }
                else {
                    btn.classList.remove("btn-outline-primary");
                }
                btn.classList.add("btn-success");
            }
        }
        else {
                btn.classList.remove("btn-outline-primary");
                btn.classList.remove("btn-success");
                btn.classList.add("btn-danger");
        }
    }

    if (correct == 70) {
        document.getElementById("timer").innerHTML = correct + " / 70, complimenti amore mio!";
    }
    else {
        document.getElementById("timer").innerHTML = correct + " / 70";
    }
    setup(quest_curr);
}

function checkResults() {
    var btn;
    var correctAns1 = questions.get(quest_curr.toString())["answer"];
    var correctAns2 = questions.get(quest_next.toString())["answer"];

    if (map.get(quest_curr.toString()) == correctAns1) {

        btn = document.getElementById("true");
        if (hasClass(btn, "active")) {
            btn.classList.add("btn-success");
            btn.classList.remove("active");
            btn.classList.remove("btn-outline-success");
        }
        else {
            btn = document.getElementById("false");
            btn.classList.add("btn-danger");
            btn.classList.remove("active");
            btn.classList.remove("btn-outline-danger");
        }

    }
    else {

        if (correctAns1 == "V") {
            btn = document.getElementById("true");
            btn.classList.add("btn-warning");
            btn.classList.remove("active");
            btn.classList.remove("btn-outline-success");

            document.getElementById("false").classList.remove("active");
        }
        else {
            btn = document.getElementById("false");
            btn.classList.add("btn-warning");
            btn.classList.remove("active");
            btn.classList.remove("btn-outline-danger");

            document.getElementById("true").classList.remove("active");
        }
        
    }


    if (map.get(quest_next.toString()) == correctAns2) {

        btn = document.getElementById("true2");
        if (hasClass(btn, "active")) {
            btn.classList.add("btn-success");
            btn.classList.remove("active");
            btn.classList.remove("btn-outline-success");
        }
        else {
            btn = document.getElementById("false2");
            btn.classList.add("btn-danger");
            btn.classList.remove("active");
            btn.classList.remove("btn-outline-danger");
        }
    }
    else {

        if (correctAns2 == "V") {
            btn = document.getElementById("true2");
            btn.classList.add("btn-warning");
            btn.classList.remove("active");
            btn.classList.remove("btn-outline-success");

            document.getElementById("false2").classList.remove("active");
        }
        else {
            btn = document.getElementById("false2");
            btn.classList.add("btn-warning");
            btn.classList.remove("active");
            btn.classList.remove("btn-outline-danger");

            document.getElementById("true2").classList.remove("active");
        }
        
    }

    document.getElementById("true").setAttribute("disabled", "");
    document.getElementById("false").setAttribute("disabled", "");
    document.getElementById("true2").setAttribute("disabled", "");
    document.getElementById("false2").setAttribute("disabled", "");
}