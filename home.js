import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.2.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

document.addEventListener("DOMContentLoaded", () => {
  onAuthStateChanged(auth, (user) => {
    const userInfo = document.getElementById("user-info");
    if (user && userInfo) {
      userInfo.textContent = `Logged in as: ${user.displayName} (${user.email})`;
    } else if (userInfo) {
      userInfo.textContent = "Browsing as Guest";
    }
  });
  
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      signOut(auth).then(() => {
        window.location.href = "Singup.html";
      });
    });
  }
  
  const hero = document.getElementById("hero-mangas");
  const heroTitle = document.getElementById("heroTitle");
  const heroSynopsis = document.getElementById("heroSynopsis");
  const heroContent = document.getElementById("heroContent");
  const mangaGrid = document.getElementById("mangaGrid");
  
  let topMangaList = [];
  
  function getMangaTitle(manga) {
    const titles = manga.attributes?.title;
    if (!titles) return "No Title";
    if (titles.en) return titles.en;
    const firstLang = Object.keys(titles)[0];
    return titles[firstLang] || "No Title";
  }
  
  function seededShuffle(array) {
    const today = new Date().toISOString().slice(0, 10);
    let seed = 0;
    for (let i = 0; i < today.length; i++) seed += today.charCodeAt(i);
    return [...array].sort((a, b) => {
      return (a.id.charCodeAt(0) + seed) - (b.id.charCodeAt(0) + seed);
    });
  }
  
  async function fetchTopManga() {
    try {
      const response = await fetch("https://api.mangadex.org/manga?limit=50&order[followedCount]=desc&includes[]=cover_art");
      const data = await response.json();
      topMangaList = seededShuffle(data.data || []).slice(0, 20);
      updateHero();
      populateGrid();
    } catch (err) {
      console.error(err);
      heroTitle.textContent = "Failed to load manga";
      heroSynopsis.textContent = "Please try again later.";
      hero.style.backgroundImage = "url('https://via.placeholder.com/800x600?text=Error')";
      heroContent.classList.add("show");
      mangaGrid.innerHTML = "Failed to load top manga.";
    }
  }
  
  function updateHero() {
    if (topMangaList.length === 0) return;
    const manga = topMangaList[Math.floor(Math.random() * topMangaList.length)];
    const title = getMangaTitle(manga);
    heroTitle.textContent = title;
    heroSynopsis.textContent = manga.attributes?.description?.en ?
      manga.attributes.description.en.replace(/\[.*?\]\(.*?\)/g, "").substring(0, 200) + "..." :
      "No synopsis available";
    const cover = manga.relationships?.find(rel => rel.type === "cover_art");
    if (cover && cover.attributes?.fileName) {
      hero.style.backgroundImage = `url(https://uploads.mangadex.org/covers/${manga.id}/${cover.attributes.fileName})`;
    } else {
      hero.style.backgroundImage = "url('https://via.placeholder.com/800x600?text=No+Cover')";
    }
    heroContent.classList.add("show");
  }
  
  function populateGrid() {
    mangaGrid.innerHTML = "";
    topMangaList.forEach(manga => {
      const title = getMangaTitle(manga);
      const cover = manga.relationships?.find(rel => rel.type === "cover_art");
      const coverUrl = cover ?
        `https://uploads.mangadex.org/covers/${manga.id}/${cover.attributes.fileName}` :
        "https://via.placeholder.com/150x220?text=No+Cover";
      
      const card = document.createElement("div");
      card.classList.add("manga-card");
      card.innerHTML = `
        <img src="${coverUrl}" alt="${title}">
        <div class="info">
          <h3>${title}</h3>
          <button id="readbtn-${manga.id}" class="readbtn">Read</button>
        </div>
      `;
      mangaGrid.appendChild(card);
      
      const readBtn = card.querySelector(`#readbtn-${manga.id}`);
      readBtn.addEventListener("click", () => {
        window.location.href = `detail.html?id=${manga.id}`;
      });
    });
  }
  
  const links = document.querySelectorAll(".icon-list a");
links.forEach(link => {
  link.addEventListener("click", e => {
    // Check if the link has href="#" (handled in-page)
    if (link.getAttribute("href") === "#") {
      e.preventDefault();
      links.forEach(l => l.classList.remove("active"));
      link.classList.add("active");
    }
  });
});
  
  fetchTopManga();
  setInterval(updateHero, 10000);
});
