var quest_n = 1;
var map = {};

function setup() {
    $.getJSON("https://raw.githubusercontent.com/quizanatomia/quizanatomia.github.io/main/domande.json", function(data) {
        document.getElementById("quest_n").innerHTML = "Domanda " + quest_n;
        document.getElementById("quest").innerHTML = data[0]["question"];

        document.getElementById("quest_n2").innerHTML = "Domanda " + (quest_n+1);
        document.getElementById("quest2").innerHTML = data[1]["question"];
    });
}

function answerTrue() {
    document.getElementById("false").classList.remove("active");
    document.getElementById("true").classList.add("active");
    map[quest_n.toString()] = "T";
}

function answerFalse() {
    document.getElementById("true").classList.remove("active");
    document.getElementById("false").classList.add("active");
    map[quest_n.toString()] = "F";
}

function answerTrue2() {
    document.getElementById("false2").classList.remove("active");
    document.getElementById("true2").classList.add("active");
    map[(quest_n+1).toString()] = "T";
}

function answerFalse2() {
    document.getElementById("true2").classList.remove("active");
    document.getElementById("false2").classList.add("active");
    map[(quest_n+1).toString()] = "F";
}