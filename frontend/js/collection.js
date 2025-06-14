<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Collection</title>
  <script src="https://www.gstatic.com/firebasejs/10.11.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.11.0/firebase-auth-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore-compat.js"></script>
  <style>
    body {
      font-family: "Segoe UI", sans-serif;
      background: linear-gradient(135deg, #1e1e2f, #3a3a5f);
      color: white;
      padding: 2rem;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .app-container {
      max-width: 700px;
      width: 100%;
      background: rgba(255, 255, 255, 0.05);
      padding: 2rem;
      border-radius: 20px;
      backdrop-filter: blur(10px);
    }
    .comic-entry {
      border: 1px solid #4fc3f7;
      border-radius: 10px;
      padding: 1rem;
      margin-bottom: 1rem;
    }
    .comic-entry img {
      max-width: 100%;
      border-radius: 10px;
      margin-top: 0.5rem;
    }
    .header {
      font-size: 1.3rem;
      font-weight: bold;
      margin-bottom: 1rem;
      text-align: center;
    }
    button {
      margin-top: 0.5rem;
      background: #4fc3f7;
      color: black;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <h1>Your Comic Collection</h1>
  <div class="app-container">
    <div id="totalValue" class="header"></div>
    <div id="comicList"></div>
    <button onclick="location.href='index.html'">🔙 Back to Scanner</button>
  </div>

  <script>
    const firebaseConfig = {
      apiKey: "AIzaSyBj5KoygE8YRW8gflBEFh7Tqu5kwegqt9U",
      authDomain: "comicvault-2854f.firebaseapp.com",
      projectId: "comicvault-2854f",
      storageBucket: "comicvault-2854f.appspot.com",
      messagingSenderId: "701353312079",
      appId: "1:701353312079:web:0f2a1d78824fa7f2888f3a",
      measurementId: "G-SBE1446V9L",
    };

    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const db = firebase.firestore();

    auth.onAuthStateChanged(async (user) => {
      if (!user) {
        window.location.href = "login.html";
        return;
      }

      const comicList = document.getElementById("comicList");
      const totalValueDiv = document.getElementById("totalValue");
      const collectionRef = db.collection("users").doc(user.uid).collection("comics");
      const snapshot = await collectionRef.get();

      if (snapshot.empty) {
        comicList.innerHTML = "<p>No comics in your vault yet!</p>";
        totalValueDiv.textContent = "";
        return;
      }

      let comics = [];
      snapshot.forEach(doc => comics.push({ id: doc.id, ...doc.data() }));

      // Sort by title then issue number
      comics.sort((a, b) => {
        const titleA = (a.title || "").toLowerCase();
        const titleB = (b.title || "").toLowerCase();
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        const issueA = parseInt(a.issue) || 0;
        const issueB = parseInt(b.issue) || 0;
        return issueA - issueB;
      });

      // Display comics
      let total = 0;
      comics.forEach(comic => {
        total += parseFloat(comic.value) || 0;
        const div = document.createElement("div");
        div.className = "comic-entry";
        div.innerHTML = `
          <strong>${comic.title}</strong> #${comic.issue}<br/>
          Grade: ${comic.grade} | Value: $${comic.value}<br/>
          ${comic.imageUrl ? `<img src="${comic.imageUrl}" alt="Comic cover" />` : ""}
          <button onclick="deleteComic('${comic.id}')">🗑 Delete</button>
        `;
        comicList.appendChild(div);
      });

      totalValueDiv.textContent = `💰 Total Collection Value: $${total.toFixed(2)}`;
    });

    function deleteComic(docId) {
      const user = firebase.auth().currentUser;
      if (!user) return;
      db.collection("users").doc(user.uid).collection("comics").doc(docId).delete()
        .then(() => location.reload())
        .catch(err => alert("Failed to delete: " + err.message));
    }
  </script>
</body>
</html>
