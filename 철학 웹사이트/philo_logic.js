const html2canvasScript = document.createElement('script');
html2canvasScript.src = "https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js";
document.head.appendChild(html2canvasScript);

let currentPage = 0;
const questionsPerPage = 10;

// OS 기본 공유 기능 (Web Share API)과 데스크탑 링크 복사 기능
function shareToOS() {
  const shareUrl = window.location.href;  // 현재 페이지 URL
  const shareText = "내 철학 테스트 결과! 확인해보세요: " + shareUrl;

  // 모바일에서만 Web Share API 동작 (모바일 기기인지 확인)
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  if (isMobile) {
    // 모바일 기기에서 Web Share API 사용
    if (navigator.share) {
      navigator.share({
        title: '철학 테스트 결과',
        text: shareText,
        url: shareUrl
      }).then(() => {
        // 공유 성공
      }).catch((error) => {
        alert('공유에 실패했습니다: ' + error);
      });
    } else {
      alert('이 브라우저는 공유 기능을 지원하지 않습니다.');
    }
  } else {
    // 데스크탑에서는 링크 복사
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        alert('링크가 복사되었습니다! 다른 사람에게 공유하세요.');
      }).catch((error) => {
        alert('링크 복사 실패: ' + error);
      });
    } else {
      // Clipboard API를 지원하지 않는 경우 대체 방법-document.execCommand('copy')
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        const successful = document.execCommand('copy');
        if (successful) {
          alert('링크가 복사되었습니다! 다른 사람에게 공유하세요.');
        } else {
          alert('링크 복사에 실패했습니다. 수동으로 복사해주세요.');
        }
      } catch (err) {
        alert('링크 복사에 실패했습니다. 수동으로 복사해주세요.');
      }
      document.body.removeChild(textArea);
    }
  }
}

// 점수부여
function calculateResult() {
  const scores = { R: 0, E: 0, I: 0, A: 0, O: 0, U: 0, T: 0, P: 0 };
  const weightCounts = { R: 0, E: 0, I: 0, A: 0, O: 0, U: 0, T: 0, P: 0 };
  const oppositeAxis = { R: "E", E: "R", I: "A", A: "I", O: "U", U: "O", T: "P", P: "T" };

  for (let i = 0; i < questions.length; i++) {
    const value = answers[i];
    if (value === undefined) {
      alert(`${i + 1}번 질문에 응답해주세요.`);
      setTimeout(() => {
        document.querySelector(`input[name='q${i}']`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 0);
      return;
    }

    const axis = questions[i].axis;
    if (value === "3") {
      scores[axis] += 2;
      weightCounts[axis] += 1;
    } else if (value === "2") {
      scores[axis] += 1;
    } else if (value === "1") {
      scores[oppositeAxis[axis]] += 1;
    } else if (value === "0") {
      scores[oppositeAxis[axis]] += 2;
    }
  }

  const resultCode = ["R", "I", "O", "T"]
    .map(axis => {
      const opp = oppositeAxis[axis];
      const axisScore = scores[axis];
      const oppScore = scores[opp];

      if (axisScore > oppScore) return axis;
      if (axisScore < oppScore) return opp;

      if (weightCounts[axis] > weightCounts[opp]) return axis;
      if (weightCounts[axis] < weightCounts[opp]) return opp;

      scores[axis] += 0.01; // 동점일 경우 우선순위 보정
      return scores[axis] >= scores[opp] ? axis : opp;
    })
    .join("");

  document.body.innerHTML = `
    <div id="resultContainer" class="text-center p-6 max-w-2xl mx-auto bg-white rounded shadow">
      <div id="captureArea">
        <div id="result" class="mb-8"></div>
        <div id="resultProfile"></div>
      </div>
    </div>
  `;
  renderResult(resultCode, scores);
}

// 질문 렌더링
function renderQuestions() {
  const container = document.getElementById("question-container");
  container.innerHTML = "";

  const start = currentPage * questionsPerPage;
  const end = Math.min(start + questionsPerPage, questions.length);

  for (let i = start; i < end; i++) {
    const q = questions[i];
    const el = document.createElement("div");
    el.className = "mb-4 p-4 bg-white rounded shadow";
    el.innerHTML = `
      <p class="font-semibold mb-2">${i + 1}. ${q.text}</p>
      <label class="block">
        <input type="radio" name="q${i}" value="3" ${answers[i] === "3" ? "checked" : ""} onchange="answers[${i}] = '3'" class="mr-2">
        매우 그렇다
      </label>
      <label class="block">
        <input type="radio" name="q${i}" value="2" ${answers[i] === "2" ? "checked" : ""} onchange="answers[${i}] = '2'" class="mr-2">
        다소 그렇다
      </label>
      <label class="block">
        <input type="radio" name="q${i}" value="1" ${answers[i] === "1" ? "checked" : ""} onchange="answers[${i}] = '1'" class="mr-2">
        다소 아니다
      </label>
      <label class="block">
        <input type="radio" name="q${i}" value="0" ${answers[i] === "0" ? "checked" : ""} onchange="answers[${i}] = '0'" class="mr-2">
        매우 아니다
      </label>
    `;
    // Always keep background white (remove gray background logic)
    el.style.backgroundColor = "#ffffff";
    container.appendChild(el);
  }

  const buttonContainer = document.createElement("div");
  buttonContainer.className = "mt-6";

  if (end >= questions.length) {
    const resultButton = document.createElement("button");
    resultButton.textContent = "결과 보기";
    resultButton.onclick = calculateResult;
    resultButton.className = "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded";
    buttonContainer.appendChild(resultButton);
  } else {
    const nextButton = document.createElement("button");
    nextButton.textContent = "다음 →";
    nextButton.onclick = () => {
      let hasUnanswered = false;
      for (let i = start; i < end; i++) {
        if (answers[i] === undefined) {
          // Apply gray background to unanswered question
          const el = document.querySelector(`#question-container > div:nth-child(${i - start + 1})`);
          if (el) {
            el.style.backgroundColor = "#d3d3d3";
          }
          if (!hasUnanswered) {
            alert(`${i + 1}번 질문에 응답해주세요.`);
            document.querySelector(`input[name='q${i}']`)?.scrollIntoView({ behavior: "smooth", block: "center" });
            hasUnanswered = true;
          }
        }
      }
      if (hasUnanswered) {
        return;
      }
      currentPage++;
      renderQuestions();
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    nextButton.className = "bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded";
    buttonContainer.appendChild(nextButton);
  }

  container.appendChild(buttonContainer);
}

// 결과화면
function renderResult(code, rawScores) {
  const result = philosophers[code];
  if (!result) {
    document.getElementById("result").textContent = "결과를 찾을 수 없습니다.";
    return;
  }

  const axisPairs = [
    { pair: ["R", "E"], desc: "이성적 사고 vs 감정적 직관" },
    { pair: ["I", "A"], desc: "내면 중심 vs 외부 반응" },
    { pair: ["O", "U"], desc: "객관적 사실 vs 주관적 해석" },
    { pair: ["T", "P"], desc: "체계적 구조 vs 역설적 탐색" }
  ];

  let resultHTML = `
    <div class="flex flex-col items-center mb-6">
      <img src="${result.image}" alt="${result.name} 이미지" class="w-40 h-40 object-cover rounded-full shadow mb-4" />
      <p class="text-3xl font-bold text-blue-700 mb-2">${code}</p>
      <h2 class="text-xl font-bold">${result.name}</h2>
    </div>
    <p class="text-gray-700 mt-2">${result.description}</p>
    <div class="mt-6">
      <h3 class="text-lg font-semibold mb-4 text-center">검사 항목별 비율</h3>
      <div class="space-y-4">
  `;

  axisPairs.forEach(({ pair, desc }) => {
    const a = Math.max(0, rawScores[pair[0]] || 0);
    const b = Math.max(0, rawScores[pair[1]] || 0);
    const total = a + b;

    if (total > 0) {
      const percentA = Math.round((a / total) * 100);
      const percentB = 100 - percentA;
      resultHTML += `
        <div class="mb-6">
          <div class="flex justify-between text-sm font-semibold mb-1">
            <span class="text-blue-600">${pair[0]} ${desc.split(" vs ")[0]}: ${percentA}%</span>
            <span class="text-red-500">${pair[1]} ${desc.split(" vs ")[1]}: ${percentB}%</span>
          </div>
          <div class="w-full h-3 bg-gray-200 rounded overflow-hidden flex">
            <div class="bg-blue-400" style="width: ${percentA}%"></div>
            <div class="bg-red-300" style="width: ${percentB}%"></div>
          </div>
        </div>`;
    } else {
      resultHTML += `<p>${pair[0]} vs ${pair[1]}: 데이터 없음</p>`;
    }
  });

  resultHTML += "</div></div>";

  document.getElementById("result").innerHTML = resultHTML;

  if (result.profile) {
    document.getElementById("resultProfile").innerHTML = `
      <div class="mt-8 border-t pt-6 text-left space-y-4 text-sm leading-relaxed">
        ${result.profile}
      </div>
    `;
  }

  // 결과 화면에 버튼 추가
  const buttonsHTML = `
    <div class="mt-6">
      <button id="retryBtn" class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded">다시 하기</button>
      <button id="saveResultBtn" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded ml-4">결과 저장</button>
    </div>
    <div class="share-buttons mt-6">
      <button onclick="shareToOS()" class="share-button bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded ml-4">링크 공유/복사</button>
    </div>
  `;

  document.getElementById("resultContainer").insertAdjacentHTML('beforeend', buttonsHTML);

  // "다시 하기" 버튼 클릭 시
  document.getElementById('retryBtn').addEventListener('click', function () {
    // 테스트를 처음부터 다시 시작 (페이지 새로고침)
    window.location.reload();
  });

  // "결과 저장" 버튼 클릭 시
  document.getElementById('saveResultBtn').addEventListener('click', function () {
    const target = document.getElementById('captureArea');
    if (!target) return alert('저장할 결과가 없습니다.');

    html2canvas(target, { scale: 2 }).then(canvas => {
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = 'philosophy_result.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }).catch(err => {
      alert('이미지 저장 실패: ' + err);
    });
  });
}