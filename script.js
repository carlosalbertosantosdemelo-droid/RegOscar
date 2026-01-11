if (lessonForm) {
  lessonForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const selectedClass = document.getElementById("classSelect").value;
    const selectedYear = document.getElementById("lessonYear").value;
    if (!selectedClass || !selectedYear) {
      alert("Selecione a turma e o ano!");
      return;
    }
    const newLesson = {
      year: selectedYear,
      date: document.getElementById("lessonDate").value,
      content: document.getElementById("lessonContent").value,
      notes: document.getElementById("lessonNotes").value
    };
    data.classes[selectedClass].push(newLesson);
    saveData();
    lessonForm.reset();
    renderLessons();
  });
}

function renderLessons() {
  if (lessonList) {
    lessonList.innerHTML = "";
    const selectedClass = document.getElementById("classSelect").value;
    if (!selectedClass) return;
    data.classes[selectedClass].forEach((lesson, index) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${lesson.date} - ${lesson.year}</strong><br>
        <em>Conteúdo:</em> ${lesson.content}<br>
        <em>Observações:</em> ${lesson.notes || "—"}
        <br><button onclick="deleteLesson('${selectedClass}', ${index})">Excluir</button>
      `;
      lessonList.appendChild(li);
    });
  }
}
