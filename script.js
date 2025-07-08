const body = document.body;
const voiceSelect = document.getElementById("voiceSelect");
const rateInput = document.getElementById("rate");
const pitchInput = document.getElementById("pitch");
const rateValue = document.getElementById("rateValue");
const pitchValue = document.getElementById("pitchValue");

// Theme toggle and auto-detect
function toggleTheme() {
  const isDark = body.classList.toggle("dark");
  document.getElementById("themeIcon").textContent = isDark ? "🌞" : "🌙";
  localStorage.setItem("theme", isDark ? "dark" : "light");
}

// Populate voices with fallback
function populateVoices() {
  const voices = speechSynthesis.getVoices();
  if (!voices.length) {
    setTimeout(populateVoices, 200);
    return;
  }

  voiceSelect.innerHTML = "";
  voices.forEach((voice, i) => {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = `${voice.name} (${voice.lang})${voice.default ? " [default]" : ""}`;
    voiceSelect.appendChild(option);
  });

  // Try to auto-select a female voice
  const female = voices.find(v => /female|zira|samantha|eva|tessa|karen/i.test(v.name));
  if (female) voiceSelect.value = voices.indexOf(female);
}

speechSynthesis.onvoiceschanged = populateVoices;

function speakText() {
  const text = document.getElementById("text").value.trim();
  if (!text) return;

  const voices = speechSynthesis.getVoices();
  const index = parseInt(voiceSelect.value, 10);
  if (!voices[index]) return alert("Selected voice is not available.");

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = voices[index];
  utterance.rate = Math.min(2, Math.max(0.5, parseFloat(rateInput.value)));
  utterance.pitch = Math.min(2, Math.max(0, parseFloat(pitchInput.value)));
  speechSynthesis.speak(utterance);
}

function stopSpeaking() {
  speechSynthesis.cancel();
}

function clearText() {
  speechSynthesis.cancel();
  document.getElementById("text").value = "";
  updateLines();
}

// Rate & pitch display updates
rateInput.addEventListener("input", () => {
  rateValue.textContent = rateInput.value;
});
pitchInput.addEventListener("input", () => {
  pitchValue.textContent = pitchInput.value;
});

// Line numbering
function updateLines() {
  const textarea = document.getElementById("text");
  const lines = textarea.value.split("\n").length;

  const lineNumbers = Array.from({ length: lines }, (_, i) => `${i + 1}.`).join("\n");
  const gutter = document.getElementById("lineNumbers");
  gutter.textContent = lineNumbers;

  const digits = String(lines).length;
  gutter.style.width = `${Math.max(digits + 3, 4)}ch`;
}

function syncScroll() {
  const ta = document.getElementById("text");
  const ln = document.getElementById("lineNumbers");
  ln.scrollTop = ta.scrollTop;
}

// Auto-theme detection and init
window.onload = () => {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const savedTheme = localStorage.getItem("theme");
  const useDark = savedTheme === "dark" || (!savedTheme && prefersDark);
  body.classList.toggle("dark", useDark);
  document.getElementById("themeIcon").textContent = useDark ? "🌞" : "🌙";

  populateVoices();
  updateLines();
};
