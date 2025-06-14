console.log("scanner.js loaded");

const scanButton = document.getElementById("scanButton");
const manualSaveButton = document.getElementById("manualSaveButton");
const photoInput = document.getElementById("photo");
const preview = document.getElementById("preview");
const spinner = document.getElementById("spinner");
const results = document.getElementById("results");

const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

photoInput.addEventListener("change", () => {
  const file = photoInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = e => {
      preview.src = e.target.result;
      preview.style.display = "block";
    };
    reader.readAsDataURL(file);
  }
});

scanButton.addEventListener("click", async () => {
  const titleInput = document.getElementById("title").value.trim();
  const issueInput = document.getElementById("issue").value.trim();
  const file = photoInput.files[0];

  if (!file) {
    alert("Please upload a comic image.");
    return;
  }

  const imageData = await toBase64(file);

  spinner.style.display = "block";

  const response = await fetch("http://localhost:5000/api/grade", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: titleInput, issue: issueInput, image: imageData })
  });

  const result = await response.json();
  const comic = {
    title: result.title,
    issue: result.issue,
    grade: result.grade,
    flaws: result.flaws,
    value: result.pricing.highest || 0,
    image: imageData
  };

  displayResults(comic);
  await saveComicToFirestore(comic, file);

  spinner.style.display = "none";
});

manualSaveButton.addEventListener("click", async () => {
  const title = document.getElementById("title").value.trim();
  const issue = document.getElementById("issue").value.trim();
  if (!title || !issue) {
    alert("Please enter a title and issue number.");
    return;
  }

  const comic = {
    title,
    issue,
    grade: "Manual Entry",
    flaws: [],
    value: 0,
    image: null
  };

  displayResults(comic);
  await saveComicToFirestore(comic, null);
});

function displayResults(comic) {
  results.innerHTML = `
    <div class="card">
      <h2>${comic.title} #${comic.issue}</h2>
      <p><strong>Grade:</strong> ${comic.grade}</p>
      ${comic.flaws?.length ? `<p><strong>Flaws:</strong> ${comic.flaws.join(", ")}</p>` : ""}
      <p><strong>Estimated Value:</strong> $${comic.value}</p>
    </div>
  `;
}

async function saveComicToFirestore(comic, imageFile) {
  const user = auth.currentUser;
  if (!user) {
    alert("Login required to save your comic.");
    return;
  }

  let imageUrl = null;

  if (imageFile) {
    const storageRef = storage.ref(`users/${user.uid}/${Date.now()}-${imageFile.name}`);
    await storageRef.put(imageFile);
    imageUrl = await storageRef.getDownloadURL();
  }

  await db.collection("users").doc(user.uid).collection("comics").add({
    title: comic.title,
    issue: comic.issue,
    grade: comic.grade,
    flaws: comic.flaws,
    value: comic.value,
    imageUrl,
    created: new Date()
  });

  alert("✅ Comic saved to your collection!");
}

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
