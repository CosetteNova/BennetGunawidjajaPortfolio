// --- Firebase setup ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// You only need Firestore here for now — auth can stay for later in your admin dashboard
// (We can re-add auth imports later once you build your login page)

const firebaseConfig = {
  apiKey: "AIzaSyDHXzA7eeRT_1kmdlY66-XAPoZTMJh79aU",
  authDomain: "cosettenovaportfolio.firebaseapp.com",
  projectId: "cosettenovaportfolio",
  storageBucket: "cosettenovaportfolio.firebasestorage.app",
  messagingSenderId: "1030073219161",
  appId: "1:1030073219161:web:101ac918a326f159a29948"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- Load works from Firestore instead of local JSON ---
async function loadWorks() {
  try {
    const snapshot = await getDocs(collection(db, "works"));
    const works = snapshot.docs.map(doc => doc.data());
    window.allWorks = works;
    renderWorks(works);
  } catch (error) {
    console.error("Error loading works:", error);
  }
}

loadWorks();

// --- Rendering stays exactly the same ---
function renderWorks(works) {
  const container = document.getElementById("portfolio-container");
  if (!container) return;
  container.innerHTML = "";

  works.forEach(work => {
    const card = document.createElement("div");
    card.classList.add("work-card");
    card.innerHTML = `
      <h2>${work.title}</h2>
      <p class="category">${work.category} • ${new Date(work.date).toLocaleDateString()}</p>
      <p>${work.description}</p>
      <a href="${work.link}" target="_blank" class="btn">View</a>
    `;
    container.appendChild(card);
  });
}

// --- Filter buttons (no changes needed) ---
document.addEventListener("click", (e) => {
  if (!e.target.matches("#filters button")) return;
  const category = e.target.getAttribute("data-filter");
  if (category === "all") {
    renderWorks(window.allWorks);
  } else {
    renderWorks(window.allWorks.filter(w => w.category === category));
  }
});
