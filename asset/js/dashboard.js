// ============================
// Dashboard.js
// ============================
// Handles admin dashboard CRUD operations for portfolio works
// Requires Firebase Auth + Firestore to be configured
// ============================

// --- Firebase Imports ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

// --- Firebase Config ---
// 🔧 Replace this with your actual Firebase project config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MSG_ID",
  appId: "YOUR_APP_ID"
};

// --- Initialize Firebase ---
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// --- DOM References ---
const addBtn = document.getElementById("addWork");
const msg = document.getElementById("msg");
const worksTableBody = document.getElementById("worksTableBody");
const logoutBtn = document.getElementById("logoutBtn");
const adminEmailDisplay = document.getElementById("adminEmail");

// --- Auth Guard ---
onAuthStateChanged(auth, (user) => {
  if (user) {
    adminEmailDisplay.textContent = user.email;
    loadWorks();
  } else {
    window.location = "admin.html"; // redirect if not logged in
  }
});

// --- Logout Functionality ---
logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  window.location = "admin.html";
});

// ============================
// CRUD FUNCTIONS
// ============================

// --- Load All Works ---
async function loadWorks() {
  worksTableBody.innerHTML = "";
  const querySnapshot = await getDocs(collection(db, "works"));
  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const row = document.createElement("tr");

    row.innerHTML = `
      <td><input type="text" value="${data.title || ""}" data-field="title" /></td>
      <td><input type="text" value="${data.category || ""}" data-field="category" /></td>
      <td><textarea data-field="description">${data.description || ""}</textarea></td>
      <td><input type="url" value="${data.link || ""}" data-field="link" /></td>
      <td class="actions">
        <button class="save-btn" data-id="${docSnap.id}">Save</button>
        <button class="delete-btn" data-id="${docSnap.id}">Delete</button>
      </td>
    `;

    worksTableBody.appendChild(row);
  });

  attachRowEventListeners();
}

// --- Add New Work ---
addBtn.addEventListener("click", async () => {
  const title = document.getElementById("title").value.trim();
  const category = document.getElementById("category").value.trim();
  const description = document.getElementById("description").value.trim();
  const link = document.getElementById("link").value.trim();
  const date = new Date().toISOString().split("T")[0];

  if (!title || !category || !link) {
    msg.textContent = "⚠️ Please fill in required fields (Title, Category, Link)";
    msg.style.color = "#facc15"; // yellow warning
    return;
  }

  try {
    await addDoc(collection(db, "works"), { title, category, description, link, date });
    msg.textContent = "✅ Work added successfully!";
    msg.style.color = "#22c55e"; // green success
    document.getElementById("title").value = "";
    document.getElementById("category").value = "";
    document.getElementById("description").value = "";
    document.getElementById("link").value = "";
    loadWorks();
  } catch (err) {
    msg.textContent = "❌ " + err.message;
    msg.style.color = "#ef4444"; // red error
  }
});

// --- Attach Edit/Delete Buttons ---
function attachRowEventListeners() {
  // Edit/Save
  document.querySelectorAll(".save-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = e.target.dataset.id;
      const row = e.target.closest("tr");
      const updatedData = {};
      row.querySelectorAll("[data-field]").forEach((input) => {
        updatedData[input.dataset.field] = input.value.trim();
      });

      try {
        await updateDoc(doc(db, "works", id), updatedData);
        msg.textContent = "✅ Work updated successfully!";
        msg.style.color = "#22c55e";
      } catch (err) {
        msg.textContent = "❌ " + err.message;
        msg.style.color = "#ef4444";
      }
    });
  });

  // Delete
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = e.target.dataset.id;
      if (confirm("Are you sure you want to delete this work?")) {
        try {
          await deleteDoc(doc(db, "works", id));
          msg.textContent = "🗑️ Work deleted.";
          msg.style.color = "#f97316"; // orange
          loadWorks();
        } catch (err) {
          msg.textContent = "❌ " + err.message;
          msg.style.color = "#ef4444";
        }
      }
    });
  });
}
