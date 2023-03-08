const SpeechRecognition =
    window.webkitSpeechRecognition || window.SpeechRecognition;

const recognition = new SpeechRecognition();

const recordBtn = document.getElementById("recordBtn");

const resetBtn = document.getElementById("resetBtn");

const textarea = document.getElementById("textarea");

recognition.continuous = true;

let recognizing;

const reset = () => {
    recognizing = false;
    //recordBtn.innerHTML = `<i class="bi bi-play-fill"></i> Start Recording`;
};

reset();

recognition.onend = reset;

recordBtn.addEventListener("click", () => {
    if (recognizing) {
        recognition.stop();
        reset();
    } else {
        recognition.start();
        recognizing = true;
        //recordBtn.innerHTML = `<i class="bi bi-stop-fill"></i> Stop Recording`;
    }
});

resetBtn.addEventListener("click", () => {
    textarea.value = "";
});

recognition.onresult = function (event) {
    for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
            textarea.value += `${event.results[i][0].transcript} `;
        }
    }
};
