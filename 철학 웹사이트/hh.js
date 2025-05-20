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
      <label class="block mt-4">
        <input type="radio" name="q${index}" value="3" ${currentAnswer === "3" ? "checked" : ""} onchange="answers[${index}] = '3'" class="mr-2">
        매우 그렇다
      </label>
      <label class="block">
        <input type="radio" name="q${index}" value="2" ${currentAnswer === "2" ? "checked" : ""} onchange="answers[${index}] = '2'" class="mr-2">
        다소 그렇다
      </label>
      <label class="block">
        <input type="radio" name="q${index}" value="1" ${currentAnswer === "1" ? "checked" : ""} onchange="answers[${index}] = '1'" class="mr-2">
        다소 아니다
      </label>
      <label class="block">
        <input type="radio" name="q${index}" value="0" ${currentAnswer === "0" ? "checked" : ""} onchange="answers[${index}] = '0'" class="mr-2">
        매우 아니다
      </label>
    `;
    return frame;
  }