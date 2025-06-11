let collection = JSON.parse(
  localStorage.getItem("comicvault-collection") || "[]"
);
renderCollection();

function renderCollection() {
  const container = document.getElementById("collectionContainer");
  container.innerHTML = "";

  collection.sort(
    (a, b) => a.title.localeCompare(b.title) || a.issue - b.issue
  );

  let total = 0;
  collection.forEach((comic, index) => {
    total += comic.value;
    const div = document.createElement("div");
    div.className = "comic-item";
    div.innerHTML = `
      <span><strong>${comic.title}</strong> #${comic.issue} - ${
      comic.grade
    } - $${comic.value.toFixed(2)}</span>
      <div class="comic-actions">
        <button onclick="editComic(${index})">Edit</button>
        <button onclick="deleteComic(${index})">Delete</button>
      </div>`;
    container.appendChild(div);
  });

  const totalDiv = document.createElement("div");
  totalDiv.className = "total-value";
  totalDiv.innerText = `Total Collection Value: $${total.toFixed(2)}`;
  container.appendChild(totalDiv);
}

function editComic(index) {
  const comic = collection[index];
  const newTitle = prompt("Edit Title:", comic.title);
  const newIssue = parseInt(prompt("Edit Issue:", comic.issue));
  const newGrade = prompt("Edit Grade:", comic.grade);
  const newValue = parseFloat(prompt("Edit Value:", comic.value));

  if (newTitle && !isNaN(newIssue) && newGrade && !isNaN(newValue)) {
    collection[index] = {
      title: newTitle.trim(),
      issue: newIssue,
      grade: newGrade.trim(),
      value: newValue,
    };
    saveCollection();
    renderCollection();
  }
}

function deleteComic(index) {
  if (confirm("Delete this comic?")) {
    collection.splice(index, 1);
    saveCollection();
    renderCollection();
  }
}

function exportToCSV() {
  if (!collection.length) {
    alert("No comics to export.");
    return;
  }

  const csv = [
    ["Title", "Issue", "Grade", "Value"],
    ...collection.map((c) => [c.title, c.issue, c.grade, c.value.toFixed(2)]),
  ]
    .map((r) => r.join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "comicvault_collection.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function saveCollection() {
  localStorage.setItem("comicvault-collection", JSON.stringify(collection));
}
