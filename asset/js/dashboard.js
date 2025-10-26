import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { 
  getFirestore, collection, getDocs, addDoc, deleteDoc, doc, updateDoc 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { 
  getAuth, onAuthStateChanged, signOut 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

// 🔥 Firebase Config (replace with your own safely!)
const firebaseConfig = {
  apiKey: "AIzaSyDHXzA7eeRT_1kmdlY66-XAPoZTMJh79aU",
  authDomain: "cosettenovaportfolio.firebaseapp.com",
  projectId: "cosettenovaportfolio",
  storageBucket: "cosettenovaportfolio.firebasestorage.app",
  messagingSenderId: "1030073219161",
  appId: "1:1030073219161:web:101ac918a326f159a29948"
};

// Initialize
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const logoutBtn = document.getElementById("logoutBtn");
const msg = document.getElementById("msg");
const worksTable = document.getElementById("worksTable");
const addForm = document.getElementById("addForm");

// 🔒 Auth Guard
onAuthStateChanged(auth, user => {
  if (!user) window.location = "admin.html";
  else loadWorks();
});

// 🚪 Logout
logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  window.location = "admin.html";
});

// ➕ Add Work
addForm.addEventListener("submit", async e => {
  e.preventDefault();
  const title = document.getElementById("title").value.trim();
  const category = document.getElementById("category").value.trim();
  const description = document.getElementById("description").value.trim();
  const link = document.getElementById("link").value.trim();

  if (!title || !category) {
    msg.textContent = "⚠️ Title and Category required.";
    return;
  }

  try {
    await addDoc(collection(db, "works"), {
      title, category, description, link,
      date: new Date().toISOString().split("T")[0]
    });
    msg.textContent = "✅ Work added!";
    addForm.reset();
    loadWorks();
  } catch (err) {
    msg.textContent = "❌ " + err.message;
  }
});

// 📋 Load Works
async function loadWorks() {
  worksTable.innerHTML = "";
  const querySnapshot = await getDocs(collection(db, "works"));
  querySnapshot.forEach(docSnap => {
    const work = docSnap.data();
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td contenteditable="true" data-field="title">${work.title}</td>
      <td contenteditable="true" data-field="category">${work.category}</td>
      <td contenteditable="true" data-field="description">${work.description}</td>
      <td contenteditable="true" data-field="link">${work.link || ""}</td>
      <td>
        <button class="edit-btn" data-id="${docSnap.id}">💾</button>
        <button class="delete-btn" data-id="${docSnap.id}">🗑️</button>
      </td>
    `;
    worksTable.appendChild(tr);
  });

  // Delete
  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", async e => {
      const id = e.target.dataset.id;
      await deleteDoc(doc(db, "works", id));
      loadWorks();
    });
  });

  // Edit
  document.querySelectorAll(".edit-btn").forEach(btn => {
    btn.addEventListener("click", async e => {
      const id = e.target.dataset.id;
      const row = e.target.closest("tr");
      const updatedData = {};
      row.querySelectorAll("[contenteditable=true]").forEach(cell => {
        updatedData[cell.dataset.field] = cell.textContent.trim();
      });
      await updateDoc(doc(db, "works", id), updatedData);
      msg.textContent = "✅ Updated successfully!";
    });
  });
}
