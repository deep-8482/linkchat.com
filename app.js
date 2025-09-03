// Firebase v10
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

// 🔑 Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyA4fCMmVb3BbWkEgI-iJ4DUKVX22X8swxA",
  authDomain: "linkchat-be6ba.firebaseapp.com",
  projectId: "linkchat-be6ba",
  storageBucket: "linkchat-be6ba.firebasestorage.app",
  messagingSenderId: "271704954765",
  appId: "1:271704954765:web:9889fc683b8fad875c4fc4",
  measurementId: "G-P8267VB7EF"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Elements
const loginCard = document.getElementById('login');
const chatCard = document.getElementById('chat');
const email = document.getElementById('email');
const pass = document.getElementById('pass');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const msg = document.getElementById('msg');
const link = document.getElementById('link');
const sendBtn = document.getElementById('send-btn');
const list = document.getElementById('list');
const me = document.getElementById('me');

// Auth listener
onAuthStateChanged(auth, (user) => {
  if (user) {
    loginCard.style.display = "none";
    chatCard.style.display = "block";
    me.textContent = user.email.split('@')[0]; // show short username
    startStream();
  } else {
    loginCard.style.display = "block";
    chatCard.style.display = "none";
    list.innerHTML = "";
  }
});

// Login / Logout
loginBtn.onclick = async () => {
  try {
    await signInWithEmailAndPassword(auth, email.value, pass.value);
  } catch (e) { alert(e.message); }
};
logoutBtn.onclick = () => signOut(auth);

// Firestore live messages
function startStream() {
  const q = query(collection(db, "rooms", "general", "messages"), orderBy("ts", "desc"));
  onSnapshot(q, (snap) => {
    list.innerHTML = "";
    snap.forEach(doc => {
      const m = doc.data();
      const isMine = m.author === auth.currentUser.email;
      const sender = m.author.split('@')[0];
      const time = m.ts?.toDate ? m.ts.toDate().toLocaleTimeString() : "";

      const div = document.createElement("div");
      div.className = "msg " + (isMine ? "mine" : "other");
      div.innerHTML = `
        <div>${m.text ? escapeHtml(m.text) : ""} ${m.link ? `<a href="${m.link}" target="_blank">${m.link}</a>` : ""}</div>
        <div class="meta">${sender} • ${time}</div>
      `;
      list.appendChild(div);
    });
  });
}

// Send
sendBtn.onclick = async () => {
  const user = auth.currentUser;
  if (!user) return;

  const text = msg.value.trim();
  const linkVal = link.value.trim();

  if (!text && !linkVal) {
    alert("Please type a message or add a link before sending.");
    return;
  }

  await addDoc(collection(db, "rooms", "general", "messages"), {
    ts: serverTimestamp(),
    author: user.email,
    text: text || null,
    link: linkVal || null
  });

  msg.value = "";
  link.value = "";
};

// Escape HTML
function escapeHtml(str) {
  return str.replace(/[&<>"]/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"
  }[c]));
}
