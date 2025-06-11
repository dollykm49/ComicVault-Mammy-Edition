console.log("scanner.js loaded");

const scanButton = document.getElementById("scanButton");
const manualSaveButton = document.getElementById("manualSaveButton");
const photoInput = document.getElementById("photo");
const preview = document.getElementById("preview");
const spinner = document.getElementById("spinner");
const results = document.getElementById("results");

photoInput.addEventListener("change", () => {
  const file = photoInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = e => {
      preview.src = e.target.result;
      preview.style.display = "block"
    };
    reader.readAsDataURL(file);
  }
});


scanButton.addEventListener("click", async () => {
  
  const file = photoInput.files[0];
  if (!file) {
    alert("Please upload a comic image.");
    return;
  }
  const imageData = file
    ? await toBase64(file)
    : null;

  spinner.style.display = "block";

  let grade = "detecting";
  let flaws = [];
  let pricing = { highest: 0, sources: {} };

  if (imageData) {
    const response = await fetch("http://localhost:5000/api/grade", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, issue, image: imageData })
    });

    const result = await response.json();
    grade = result.grade;
    flaws = result.flaws;
    pricing = result.pricing;
  }

  const comic = {
    title,
    issue,
    grade,
    flaws,
    value: pricing.highest,
    image: imageData
  };

  displayResults(comic);
  spinner.style.display = "none";
});

manualSaveButton.addEventListener("click", () => {
  let title = document.getElementById("title").value.trim();
  let issue = document.getElementById("issue").value.trim();

  if (!title) title = "fetch title";
  if (!issue) issue = "fetch issue";  
  

  const comic = {
    title,"title,"
    issue: "" + issue,
    grade: "N/A",
    flaws: [],
    value: 0,
    image: null
  };

  displayResults(comic);
});

function displayResults(comic) {
  results.innerHTML = `
    <div class="card">
      <h2>${comic.title} #${comic.issue}</h2>
      <p><strong>Grade:</strong> ${comic.grade}</p>
      ${comic.flaws.length ? `<p><strong>Flaws:</strong> ${comic.flaws.join(", ")}</p>` : ""}
      <p><strong>Estimated Value:</strong> $${comic.value}</p>
      <button onclick='saveComicToCollection(${JSON.stringify(JSON.stringify(comic))})'>Save to Collection</button>
    </div>
  `;
}

function saveComicToCollection(dataString) {
  const comic = JSON.parse(dataString);
  const collection = JSON.parse(localStorage.getItem("comicVault") || "[]");
  collection.push(comic);
  localStorage.setItem("comicVault", JSON.stringify(collection));
  alert("Comic saved to collection!");
}

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
async function scanAndGrade() {
  const title = document.getElementById('title').value.trim();
  const issue = parseInt(document.getElementById('issue').value);
  const fileInput = document.getElementById('photo');
  const file = fileInput.files[0];
  const spinner = document.getElementById('spinner');
  const results = document.getElementById('results');

  if (!title || isNaN(issue) || !file) {
    alert("Please enter the title, issue number, and upload a comic photo.");
    return;
  }

  const reader = new FileReader();
  reader.onload = async function (e) {
    const base64Image = e.target.result;

    // Show spinner while grading
    spinner.style.display = 'block';
    results.innerHTML = '';

    try {
      const response = await fetch("https://comicvault-backend.onrender.com", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title,
          issue: issue,
          image: base64Image
        })
      });

      if (!response.ok) throw new Error("Server error");

      const data = await response.json();

      results.innerHTML = `
        <h3>🧠 Comic Scanned</h3>
        <p><strong>${data.title} #${data.issue}</strong></p>
        <p>📊 Grade: ${data.grade}</p>
        <p>📉 Flaws: ${data.flaws.join(", ")}</p>
        <p>💰 Estimated Value: $${data.pricing.avg.toFixed(2)}</p>
      `;
    } catch (err) {
      console.error(err);
      results.innerHTML = `<p style="color:red;">❌ Could not contact grading server.</p>`;
    } finally {
      spinner.style.display = 'none';
    }
  };

  reader.readAsDataURL(file);
}

// 🔗 Button binding
document.getElementById('scanButton').onclick = async function() {
  const fileInput = document.getElementById('photo');
  const titleInput = document.getElementById('title');
  const issueInput = document.getElementById('issue');
  const file = fileInput.files[0];
  if (!file) {
    alert('Please select an image.');
    return;
  }

  // Show spinner
  document.getElementById('spinner').style.display = 'block';

  // Read image as data URL
  const reader = new FileReader();
  reader.onload = async function(e) {
    const imageData = e.target.result;

    // Run Tesseract OCR
    const { data: { text } } = await Tesseract.recognize(
      imageData,
      'eng'
    );

    // Example: Simple parsing (customize as needed)
    // Assume title is first line, issue is a number in the text
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    titleInput.value = lines[0] || '';
    const issueMatch = text.match(/issue\s*#?\s*(\d+)/i);
    issueInput.value = issueMatch ? issueMatch[1] : '';

    // Hide spinner
    document.getElementById('spinner').style.display = 'none';
  };
  reader.readAsDataURL(file);
};
