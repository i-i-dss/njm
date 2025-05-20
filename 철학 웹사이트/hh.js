function createQuestionFrame(index, questionText, currentAnswer) {
  const frame = document.createElement("div");
  frame.className = "frame question-frame";
  frame.innerHTML = `
    <p class="question-text">${index + 1}. ${questionText}</p>
    <div class="ellipse-container">
      <div class="ellipse ellipse-big"></div>
      <div class="ellipse ellipse-small"></div>
      <div class="ellipse ellipse-small"></div>
      <div class="ellipse ellipse-big"></div>
    </div>
    <label class="radio-label mt">
      <input type="radio" name="q${index}" value="3" ${currentAnswer === "3" ? "checked" : ""} onchange="answers[${index}] = '3'" class="radio-input">
      매우 그렇다
    </label>
    <label class="radio-label">
      <input type="radio" name="q${index}" value="2" ${currentAnswer === "2" ? "checked" : ""} onchange="answers[${index}] = '2'" class="radio-input">
      다소 그렇다
    </label>
    <label class="radio-label">
      <input type="radio" name="q${index}" value="1" ${currentAnswer === "1" ? "checked" : ""} onchange="answers[${index}] = '1'" class="radio-input">
      다소 아니다
    </label>
    <label class="radio-label">
      <input type="radio" name="q${index}" value="0" ${currentAnswer === "0" ? "checked" : ""} onchange="answers[${index}] = '0'" class="radio-input">
      매우 아니다
    </label>
  `;
  return frame;
}