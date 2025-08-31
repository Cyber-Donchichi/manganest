const urlParams = new URLSearchParams(window.location.search);
const mangaId = urlParams.get("id");

const chapterSelect = document.getElementById("chapter-select");
const pagesDiv = document.getElementById("pages");
const titleEl = document.getElementById("chapter-title");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const scrollTopBtn = document.getElementById("scroll-top-btn");

let chapters = [];
let currentIndex = 0;

// Key for localStorage
const STORAGE_KEY = `manga-${mangaId}-progress`;

async function loadChapters(mangaId) {
  try {
    const res = await fetch(`https://api.mangadex.org/chapter?manga=${mangaId}&translatedLanguage[]=en&order[chapter]=asc&limit=100`);
    const data = await res.json();
    
    if (data.data.length === 0) {
      titleEl.textContent = "No chapters available";
      return;
    }
    
    chapters = data.data;
    
    // Fill dropdown
    chapterSelect.innerHTML = "";
    chapters.forEach((chap, i) => {
      const option = document.createElement("option");
      option.value = chap.id;
      option.textContent = `Chapter ${chap.attributes.chapter || "?"}`;
      chapterSelect.appendChild(option);
    });
    
    // Load saved progress from localStorage
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || { chapterIndex: 0, scroll: 0 };
    currentIndex = saved.chapterIndex < chapters.length ? saved.chapterIndex : 0;
    
    loadChapterPages(chapters[currentIndex], saved.scroll);
    
    // Dropdown change
    chapterSelect.addEventListener("change", () => {
      currentIndex = chapterSelect.selectedIndex;
      loadChapterPages(chapters[currentIndex], 0);
    });
    
    // Prev button
    prevBtn.addEventListener("click", () => {
      if (currentIndex > 0) {
        currentIndex--;
        chapterSelect.selectedIndex = currentIndex;
        loadChapterPages(chapters[currentIndex], 0);
      }
    });
    
    // Next button
    nextBtn.addEventListener("click", () => {
      if (currentIndex < chapters.length - 1) {
        currentIndex++;
        chapterSelect.selectedIndex = currentIndex;
        loadChapterPages(chapters[currentIndex], 0);
      }
    });
    
    // Scroll to top button
    scrollTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    
    // Show scroll-top button only after scrolling down
    window.addEventListener("scroll", () => {
      scrollTopBtn.style.display = window.scrollY > 300 ? "inline-block" : "none";
      
      // Save progress to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        chapterIndex: currentIndex,
        scroll: window.scrollY
      }));
    });
    
  } catch (err) {
    console.error("Error loading chapters:", err);
  }
}

async function loadChapterPages(chap, scrollPos = 0) {
  try {
    const chapNum = chap.attributes.chapter || "?";
    titleEl.textContent = `Chapter ${chapNum}`;
    pagesDiv.innerHTML = "Loading...";
    
    const atRes = await fetch(`https://api.mangadex.org/at-home/server/${chap.id}`);
    const atData = await atRes.json();
    
    const baseUrl = atData.baseUrl;
    const hash = atData.chapter.hash;
    const dataSaver = atData.chapter.data;
    
    pagesDiv.innerHTML = "";
    dataSaver.forEach(filename => {
      const img = document.createElement("img");
      img.src = `${baseUrl}/data/${hash}/${filename}`;
      img.alt = "Manga Page";
      pagesDiv.appendChild(img);
    });
    
    // Auto-scroll to saved position
    window.scrollTo({ top: scrollPos, behavior: "smooth" });
    
    // Enable/disable nav buttons
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === chapters.length - 1;
    
  } catch (err) {
    console.error("Error loading chapter pages:", err);
  }
}

if (mangaId) {
  loadChapters(mangaId);
}