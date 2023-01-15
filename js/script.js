var quest_curr;
var quest_next;
var data;
var map = new Object();

function setup(val) {
    document.getElementById("true").classList.remove("active");
    document.getElementById("false").classList.remove("active");
    document.getElementById("true2").classList.remove("active");
    document.getElementById("false2").classList.remove("active");

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
    }
    if (map[quest_next.toString()] == "T" || map[quest_next.toString()] == "F") {
        document.getElementById(map[quest_next.toString()] == "T" ? "true2" : "false2").classList.add("active");
    }

    $.getJSON("https://raw.githubusercontent.com/quizanatomia/quizanatomia.github.io/main/domande.json", function(data) {
        document.getElementById("quest_n").innerHTML = "Domanda " + quest_curr;
        document.getElementById("quest").innerHTML = data[quest_curr-1]["question"];

        document.getElementById("quest_n2").innerHTML = "Domanda " + (quest_next);
        document.getElementById("quest2").innerHTML = data[quest_curr]["question"];
    });
}

function answerTrue() {
    document.getElementById("false").classList.remove("active");
    document.getElementById("true").classList.add("active");
    map[quest_curr.toString()] = "T";
}

function answerFalse() {
    document.getElementById("true").classList.remove("active");
    document.getElementById("false").classList.add("active");
    map[quest_curr.toString()] = "F";
}

function answerTrue2() {
    document.getElementById("false2").classList.remove("active");
    document.getElementById("true2").classList.add("active");
    map[quest_next.toString()] = "T";
}

function answerFalse2() {
    document.getElementById("true2").classList.remove("active");
    document.getElementById("false2").classList.add("active");
    map[quest_next.toString()] = "F";
}

function nextQuestion() {
    setup(quest_curr+2);
}

function prevQuestion() {
    setup(quest_curr-2);
}