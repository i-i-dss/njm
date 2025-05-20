// Web Share API 로딩
const html2canvasScript = document.createElement('script');
html2canvasScript.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/0.4.1/html2canvas.min.js";
document.head.appendChild(html2canvasScript);

let currentPage = 0;
const questionsPerPage = 8;

function renderQuestions() {
  const container = document.getElementById("question-container");
  container.innerHTML = "";

  const start = currentPage * questionsPerPage;
  const end = Math.min(start + questionsPerPage, questions.length);

  for (let i = start; i < end; i++) {
    const q = questions[i];
    const el = createQuestionFrame(i, q.text, answers[i]);
    container.appendChild(el);
  }
}

function handleNextButton() {
  const start = currentPage * questionsPerPage;
  const end = Math.min(start + questionsPerPage, questions.length);

  for (let i = start; i < end; i++) {
    if (answers[i] === undefined) {
      alert(`${i + 1}번 질문에 응답해주세요.`);
      document.querySelector(`.frame:nth-child(${i - start + 1})`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
  }

  if (end >= questions.length) {
    calculateResult();
  } else {
    currentPage++;
    renderQuestions();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function shareToOS() {
  const shareUrl = window.location.href;
  const shareText = "내 철학 테스트 결과! 확인해보세요: " + shareUrl;
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  if (isMobile && navigator.share) {
    navigator.share({
      title: '철학 테스트 결과',
      text: shareText,
      url: shareUrl
    }).catch((error) => alert('공유에 실패했습니다: ' + error));
  } else {
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert('링크가 복사되었습니다!');
    }).catch((error) => {
      alert('복사 실패: ' + error);
    });
  }
}

function calculateResult() {
  const scores = { R: 0, E: 0, I: 0, A: 0, O: 0, U: 0, T: 0, P: 0 };
  const weightCounts = { R: 0, E: 0, I: 0, A: 0, O: 0, U: 0, T: 0, P: 0 };
  const oppositeAxis = { R: "E", E: "R", I: "A", A: "I", O: "U", U: "O", T: "P", P: "T" };

  for (let i = 0; i < questions.length; i++) {
    const value = answers[i];
    if (value === undefined) {
      alert(`${i + 1}번 질문에 응답해주세요.`);
      document.querySelector(`.frame:nth-child(${i + 1})`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const axis = questions[i].axis;
    if (value === "3") {
      scores[axis] += 2;
      weightCounts[axis]++;
    } else if (value === "2") {
      scores[axis] += 1;
    } else if (value === "1") {
      scores[oppositeAxis[axis]] += 1;
    } else if (value === "0") {
      scores[oppositeAxis[axis]] += 2;
      weightCounts[oppositeAxis[axis]]++;
    }
  }

  const resultCode = ["R", "I", "O", "T"].map(axis => {
    const opp = oppositeAxis[axis];
    if (scores[axis] > scores[opp]) return axis;
    if (scores[axis] < scores[opp]) return opp;
    if (weightCounts[axis] > weightCounts[opp]) return axis;
    if (weightCounts[axis] < weightCounts[opp]) return opp;
    return axis;
  }).join("");

  document.body.innerHTML = `
    <div id="resultContainer" class="result-container">
      <div id="captureArea">
        <div id="result"></div>
        <div id="resultProfile"></div>
      </div>
      <div class="button-group">
        <button id="retryBtn" class="button-secondary">다시 하기</button>
        <button id="saveResultBtn" class="button-primary">결과 저장</button>
        <button id="shareBtn" class="button-green">링크 공유/복사</button>
      </div>
    </div>
  `;

  renderResult(resultCode, scores);
}

function renderResult(code, rawScores) {
  const result = philosophers[code];
  if (!result) {
    document.getElementById("result").textContent = "결과를 찾을 수 없습니다.";
    return;
  }

  let html = `
    <div style="text-align: center;">
      <img src="${result.image}" alt="${result.name}" style="width: 160px; height: 160px; object-fit: cover; border-radius: 50%; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" />
      <h2 style="font-size: 2rem; margin-top: 1rem;">${code}</h2>
      <h3 style="font-size: 1.25rem; color: #333;">${result.name}</h3>
      <p style="margin-top: 1rem; color: #555;">${result.description}</p>
    </div>
    <div style="margin-top: 2rem;">
  `;

  const axisPairs = [
    ["R", "E", "이성적 사고 vs 감정적 직관"],
    ["I", "A", "이상 추구 vs 현실 지향"],
    ["O", "U", "객관적 진리 vs 주관적 해석"],
    ["T", "P", "논리 체계 vs 창의 역설"]
  ];

  axisPairs.forEach(([a, b, label]) => {
    const total = (rawScores[a] || 0) + (rawScores[b] || 0);
    if (total === 0) return;
    const percentA = Math.round((rawScores[a] || 0) / total * 100);
    const percentB = 100 - percentA;

    html += `
      <div style="margin-bottom: 1rem;">
        <div style="display: flex; justify-content: space-between; font-size: 0.9rem;">
          <span style="color: #3a36d1;">${a}: ${percentA}%</span>
          <span style="color: #e57474;">${b}: ${percentB}%</span>
        </div>
        <div style="height: 10px; background: #eee; border-radius: 5px; overflow: hidden;">
          <div style="width: ${percentA}%; background: #3a36d1; height: 100%; float: left;"></div>
          <div style="width: ${percentB}%; background: #e57474; height: 100%; float: right;"></div>
        </div>
      </div>
    `;
  });

  html += "</div>";
  document.getElementById("result").innerHTML = html;

  if (result.profile) {
    document.getElementById("resultProfile").innerHTML = `
      <div style="margin-top: 2rem; font-size: 0.95rem; line-height: 1.6; text-align: left;">
        ${result.profile}
      </div>
    `;
  }

  document.getElementById("retryBtn").onclick = () => window.location.reload();
  document.getElementById("saveResultBtn").onclick = () => {
    const target = document.getElementById("captureArea");
    if (!target) return alert('저장할 결과가 없습니다.');
    html2canvas(target, { scale: 2 }).then(canvas => {
      const link = document.createElement('a');
      link.href = canvas.toDataURL("image/png");
      link.download = "philosophy_result.png";
      link.click();
    }).catch(err => {
      alert('이미지 저장 실패: ' + err);
    });
  };
  document.getElementById("shareBtn").onclick = shareToOS;
}