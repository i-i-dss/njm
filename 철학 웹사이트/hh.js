function createQuestionFrame(index, questionText, currentAnswer) {
  const frame = document.createElement("div");
  frame.className = "frame question-frame";

  frame.innerHTML = `
    <p class="question-text">${index + 1}. ${questionText}</p>
    <div class="ellipse-wrapper">
      <div class="ellipse ellipse-big" data-value="3"></div>
      <div class="ellipse ellipse-small" data-value="2"></div>
      <div class="ellipse ellipse-small" data-value="1"></div>
      <div class="ellipse ellipse-big" data-value="0"></div>
    </div>
  `;

  const ellipses = frame.querySelectorAll(".ellipse");
  ellipses.forEach(el => {
    if (currentAnswer !== undefined && parseInt(el.dataset.value) === parseInt(currentAnswer)) {
      el.classList.add("selected");
    }
    el.addEventListener("click", () => {
      ellipses.forEach(e => e.classList.remove("selected"));
      el.classList.add("selected");
      answers[index] = el.dataset.value;
    });
  });

  return frame;
}