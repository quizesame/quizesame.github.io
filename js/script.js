var quest_curr;
var quest_next;
var randData = 0;
var map = new Map();
var questions = new Map();

var ansFirst = false;
var ansSecond = false;

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
    console.log(questions)

    document.getElementById("true").classList.remove("active");
    document.getElementById("false").classList.remove("active");
    document.getElementById("true2").classList.remove("active");
    document.getElementById("false2").classList.remove("active");

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
    if (map[quest_curr.toString()] == "T" || map[quest_curr.toString()] == "F") {
        document.getElementById(map[quest_curr.toString()] == "T" ? "true" : "false").classList.add("active");
        ansFirst = true;
    }
    if (map[quest_next.toString()] == "T" || map[quest_next.toString()] == "F") {
        document.getElementById(map[quest_next.toString()] == "T" ? "true2" : "false2").classList.add("active");
        ansSecond = true;
    }

    document.getElementById("quest_n").innerHTML = "Domanda " + quest_curr;
    document.getElementById("quest").innerHTML = questions.get(quest_curr.toString())["question"]

    document.getElementById("quest_n2").innerHTML = "Domanda " + (quest_next);
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
        map.set(quest_curr.toString(), "T");
        // map[quest_curr.toString()] = "T";
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
        map.set(quest_next.toString(), "T");
        // map[quest_next.toString()] = "T";
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
function checkResults() {
    document.getElementById("timer").innerHTML = "Risultato";
    for (const [key, value] of map.entries()) {
        console.log(key, value);
    }
}