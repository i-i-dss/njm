document.addEventListener("DOMContentLoaded", () => {
  const allEllipses = document.querySelectorAll(".ellipse");

  allEllipses.forEach(ellipse => {
    ellipse.addEventListener("click", () => {
      const label = ellipse.closest("label");
      const input = label.querySelector("input[type='radio']");
      const questionIndex = input.name.replace("q", "");
      const value = input.value;

      input.checked = true;
      answers[questionIndex] = value;

      const siblings = label.parentElement.querySelectorAll(".ellipse");
      siblings.forEach(el => el.classList.remove("selected"));

      ellipse.classList.add("selected");
    });
  });
});