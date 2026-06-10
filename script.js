// Chainsaw Man Fansite — Script
document.addEventListener("DOMContentLoaded", () => {
  setupNavigation();
  setupVisitorCounter();
  setupMusicPlayer();
  setupCharacterTabs();
  setupGuestbook();
  setupLightbox();
  setupTrackHoverPopups();
  setupMangaReader();
});

// ==========================================
// 1. NAVIGATION
// ==========================================
function setupNavigation() {
  const links = document.querySelectorAll(".nav-link");
  const pages = document.querySelectorAll(".page");

  links.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const pageId = link.getAttribute("data-page");

      // Active link
      links.forEach(l => l.classList.remove("active"));
      link.classList.add("active");

      // Active page
      pages.forEach(p => {
        if (p.id === `page-${pageId}`) {
          p.classList.add("active");
        } else {
          p.classList.remove("active");
        }
      });

      // Scroll to top of main content
      document.querySelector(".main-content").scrollTo(0, 0);
      window.scrollTo(0, 0);
    });
  });
}

// ==========================================
// 2. VISITOR COUNTER
// ==========================================
function setupVisitorCounter() {
  let visits = localStorage.getItem("csm_visits");
  if (!visits) {
    visits = Math.floor(Math.random() * 5000) + 12053;
  } else {
    visits = parseInt(visits) + 1;
  }
  localStorage.setItem("csm_visits", visits);

  const el = document.getElementById("visitor-counter");
  if (el) {
    el.textContent = String(visits).padStart(6, "0");
  }
}

// ==========================================
// 3. MUSIC PLAYER (real MP3 files)
// ==========================================
const tracks = [
  { title: "Kenshi Yonezu — IRIS OUT", file: "csm/irisout.mp3" },
  { title: "Kenshi Yonezu — JANE DOE", file: "csm/janedoe.mp3" },
  { title: "kensuke ushio — in the pool", file: "csm/inthepool.mp3" },
  { title: "kensuke ushio — Typhoon Devil", file: "csm/typhoondevil.mp3" },
  { title: "kensuke ushio — the city mouse and the country mouse", file: "csm/the city mouse and the country mouse.mp3" }
];

let currentTrack = 0;

function setupMusicPlayer() {
  const audio = document.getElementById("audio-player");
  const playBtn = document.getElementById("mp-play");
  const prevBtn = document.getElementById("mp-prev");
  const nextBtn = document.getElementById("mp-next");
  const progress = document.getElementById("mp-progress");
  const volume = document.getElementById("mp-volume");
  const nowPlaying = document.getElementById("mp-now-playing");
  const currentTimeEl = document.getElementById("mp-current-time");
  const durationEl = document.getElementById("mp-duration");

  if (!audio || !playBtn) return;

  audio.volume = 0.7;

  function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  // Atualiza todos os botões da tracklist
  function updateTracklistButtons() {
    document.querySelectorAll(".play-btn").forEach(btn => {
      const idx = parseInt(btn.getAttribute("data-track"));
      const row = document.getElementById(`track-row-${idx}`);
      if (idx === currentTrack) {
        if (!audio.paused) {
          btn.textContent = "⏸ pausar";
          btn.classList.add("playing");
        } else {
          btn.textContent = "▶ ouvir";
          btn.classList.remove("playing");
        }
        if (row) row.classList.add("track-row--active");
      } else {
        btn.textContent = "▶ ouvir";
        btn.classList.remove("playing");
        if (row) row.classList.remove("track-row--active");
      }
    });
  }

  function loadTrack(index) {
    currentTrack = index;
    audio.src = tracks[index].file;
    nowPlaying.textContent = tracks[index].title;
    durationEl.textContent = "0:00";
    progress.value = 0;
  }

  // Play/Pause (botão sidebar)
  playBtn.addEventListener("click", () => {
    if (audio.paused) {
      if (!audio.src || audio.src === window.location.href) {
        loadTrack(0);
      }
      audio.play();
      playBtn.textContent = "⏸";
    } else {
      audio.pause();
      playBtn.textContent = "▶";
    }
    updateTracklistButtons();
  });

  nextBtn.addEventListener("click", () => {
    currentTrack = (currentTrack + 1) % tracks.length;
    loadTrack(currentTrack);
    audio.play();
    playBtn.textContent = "⏸";
    updateTracklistButtons();
  });

  prevBtn.addEventListener("click", () => {
    currentTrack = (currentTrack - 1 + tracks.length) % tracks.length;
    loadTrack(currentTrack);
    audio.play();
    playBtn.textContent = "⏸";
    updateTracklistButtons();
  });

  // Progress
  audio.addEventListener("timeupdate", () => {
    if (audio.duration) {
      progress.value = (audio.currentTime / audio.duration) * 100;
      currentTimeEl.textContent = formatTime(audio.currentTime);
    }
  });

  audio.addEventListener("loadedmetadata", () => {
    durationEl.textContent = formatTime(audio.duration);
  });

  // Seek
  progress.addEventListener("input", () => {
    if (audio.duration) {
      audio.currentTime = (progress.value / 100) * audio.duration;
    }
  });

  // Volume
  volume.addEventListener("input", () => {
    audio.volume = volume.value / 100;
  });

  // Auto-next
  audio.addEventListener("ended", () => {
    currentTrack = (currentTrack + 1) % tracks.length;
    loadTrack(currentTrack);
    audio.play();
    updateTracklistButtons();
  });

  // Sincroniza botões ao pausar/retomar de qualquer forma
  audio.addEventListener("play", () => {
    playBtn.textContent = "⏸";
    updateTracklistButtons();
  });
  audio.addEventListener("pause", () => {
    playBtn.textContent = "▶";
    updateTracklistButtons();
  });

  // Botões da tracklist
  document.querySelectorAll(".play-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const index = parseInt(btn.getAttribute("data-track"));
      if (index === currentTrack && !audio.paused) {
        // Pausar a faixa atual
        audio.pause();
      } else if (index === currentTrack && audio.paused) {
        // Retomar a faixa atual
        if (!audio.src || audio.src === window.location.href) {
          loadTrack(index);
        }
        audio.play();
      } else {
        // Trocar de faixa
        loadTrack(index);
        audio.play();
      }
      // O estado dos botões será atualizado pelos eventos play/pause
    });
  });

  nowPlaying.textContent = tracks[0].title;
}

// ==========================================
// 4. CHARACTER TABS
// ==========================================
function setupCharacterTabs() {
  const tabs = document.querySelectorAll(".char-tab");
  const cards = document.querySelectorAll(".char-card");

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const target = tab.getAttribute("data-char");

      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");

      cards.forEach(card => {
        if (card.id === `char-${target}`) {
          card.classList.add("active");
        } else {
          card.classList.remove("active");
        }
      });
    });
  });
}

// ==========================================
// 5. GUESTBOOK
// ==========================================
const defaultPosts = [
  { name: "DenjiFan_2003", avatar: "csm/pochita.png", message: "Pochita é o melhor personagem! Chorei demais quando ele se fundiu com o Denji. 😭", date: "06/05/2026 12:45" },
  { name: "RezeSimp", avatar: "csm/reze.png", message: "O filme da Reze é simplesmente perfeito. A cena na piscina destruiu meu coração. MAPPA nunca decepciona!", date: "05/30/2026 18:33" },
  { name: "PowerPresidente", avatar: "csm/power.png", message: "AJOELHEM-SE PERANTE POWER! Humanos são lixo! Votem em Power para presidente do universo!", date: "05/15/2026 09:30" },
  { name: "Aki_Sigma", avatar: "csm/aki.png", message: "A espada do Aki é literalmente amaldiçoada. É muito foda mas trágico ao mesmo tempo. Trilha sonora absurda.", date: "05/10/2026 18:02" }
];

function setupGuestbook() {
  const form = document.getElementById("gb-form");
  const nameInput = document.getElementById("gb-name");
  const msgInput = document.getElementById("gb-msg");
  const postsContainer = document.getElementById("gb-posts");
  const avatarOptions = document.querySelectorAll(".avatar-opt");
  let selectedAvatar = "csm/pochita.png";

  // Avatar selection
  avatarOptions.forEach(opt => {
    opt.addEventListener("click", () => {
      avatarOptions.forEach(o => o.classList.remove("selected"));
      opt.classList.add("selected");
      selectedAvatar = opt.getAttribute("data-avatar");
    });
  });

  function renderPosts() {
    if (!postsContainer) return;

    let posts = localStorage.getItem("csm_gb_posts_pt_br");
    if (!posts) {
      posts = defaultPosts;
      localStorage.setItem("csm_gb_posts_pt_br", JSON.stringify(posts));
    } else {
      posts = JSON.parse(posts);
    }

    postsContainer.innerHTML = "";

    posts.slice().reverse().forEach(post => {
      const el = document.createElement("div");
      el.classList.add("gb-post");
      el.innerHTML = `
        <div class="gb-avatar" style="background-image:url('${post.avatar || 'csm/pochita.png'}')"></div>
        <div>
          <div class="gb-meta">
            <span class="gb-author">${escapeHTML(post.name)}</span>
            <span class="gb-date">${post.date}</span>
          </div>
          <div class="gb-msg">${escapeHTML(post.message)}</div>
        </div>
      `;
      postsContainer.appendChild(el);
    });
  }

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = nameInput.value.trim();
      const message = msgInput.value.trim();
      if (!name || !message) return;

      const now = new Date();
      const date = `${String(now.getMonth() + 1).padStart(2, "0")}/${String(now.getDate()).padStart(2, "0")}/${now.getFullYear()} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

      let posts = JSON.parse(localStorage.getItem("csm_gb_posts_pt_br") || "[]");
      posts.push({ name, avatar: selectedAvatar, message, date });
      localStorage.setItem("csm_gb_posts_pt_br", JSON.stringify(posts));

      nameInput.value = "";
      msgInput.value = "";
      renderPosts();
    });
  }

  renderPosts();
}

// ==========================================
// 6. LIGHTBOX
// ==========================================
function setupLightbox() {
  const overlay = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxDesc = document.getElementById("lightbox-desc");
  const closeBtn = document.getElementById("lightbox-close");

  if (!overlay || !lightboxImg) return;

  function open(src, alt, desc) {
    lightboxImg.src = src;
    lightboxImg.alt = alt || "";
    if (lightboxDesc) {
      lightboxDesc.textContent = desc || "";
    }
    overlay.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function close() {
    overlay.classList.remove("active");
    lightboxImg.src = "";
    if (lightboxDesc) lightboxDesc.textContent = "";
    document.body.style.overflow = "";
  }

  // Todas as imagens expandíveis
  document.querySelectorAll(".expandable").forEach(img => {
    img.addEventListener("click", () => {
      const desc = img.getAttribute("data-desc") || "";
      open(img.src, img.alt, desc);
    });
  });

  // Fechar
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay || e.target === closeBtn) close();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
}

// ==========================================
// HELPERS
// ==========================================
function escapeHTML(str) {
  return str.replace(/[&<>'"]/g,
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

// ==========================================
// 7. TRACK HOVER ALBUM POPUPS
// ==========================================
function setupTrackHoverPopups() {
  const rows = document.querySelectorAll(".tracklist tbody tr");
  
  let popup = document.querySelector(".track-popup");
  if (!popup) {
    popup = document.createElement("div");
    popup.className = "track-popup";
    const img = document.createElement("img");
    popup.appendChild(img);
    document.body.appendChild(popup);
  }
  
  const popupImg = popup.querySelector("img");
  
  const coverImages = {
    0: "csm/irisout.png",
    1: "csm/janedoe.png",
    2: "csm/kensuke.png",
    3: "csm/kensuke.png",
    4: "csm/kensuke.png"
  };
  
  rows.forEach((row, idx) => {
    row.addEventListener("mouseenter", () => {
      const imgSrc = coverImages[idx] || "csm/kensuke.png";
      popupImg.src = imgSrc;
      
      // Calculate row position relative to document
      const rect = row.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
      
      // Position at left center of the row (transform in CSS will shift it left outside)
      popup.style.top = `${rect.top + scrollTop + rect.height / 2}px`;
      popup.style.left = `${rect.left + scrollLeft}px`;
      
      popup.classList.add("active");
    });
    
    row.addEventListener("mouseleave", () => {
      popup.classList.remove("active");
    });
  });
}

// ==========================================
// 8. MANGA READER
// ==========================================
function setupMangaReader() {
  const modal = document.getElementById("manga-modal");
  if (!modal) return;

  const closeBtn      = document.getElementById("manga-close");
  const startBtn      = document.getElementById("start-comic-btn");
  const pageThumbs    = document.querySelectorAll(".comic-page-thumb");
  const btnModePage   = document.getElementById("btn-mode-page");
  const btnModeCascade= document.getElementById("btn-mode-cascade");
  const btnZoomOut    = document.getElementById("btn-zoom-out");
  const btnZoomIn     = document.getElementById("btn-zoom-in");
  const btnZoomReset  = document.getElementById("btn-zoom-reset");
  const zoomIndicator = document.getElementById("zoom-indicator");
  const currentIndicator = document.getElementById("manga-current-indicator");
  const totalIndicator   = document.getElementById("manga-total-indicator");
  const viewport  = document.getElementById("manga-viewport");
  const canvas    = document.getElementById("manga-canvas");
  const prevBtn   = document.getElementById("manga-nav-prev");
  const nextBtn   = document.getElementById("manga-nav-next");

  const mangaPages = ["csm/1.png","csm/2.png","csm/3.png","csm/4.png","csm/5.png"];
  const ZOOM_STEP  = 0.25;
  const ZOOM_MIN   = 1.0;
  const ZOOM_MAX   = 3.0;

  let currentPageIndex = 0;
  let readingMode = "page"; // default: páginas

  // --- Zoom state (transform-based, like real manga sites) ---
  let zoomLevel = 1.0;
  // Pan origin in canvas coordinates
  let panX = 0;
  let panY = 0;

  // Mouse drag state
  let isDragging = false;
  let dragMoved  = false;
  let dragStartMouseX = 0;
  let dragStartMouseY = 0;
  let dragStartPanX   = 0;
  let dragStartPanY   = 0;

  // Touch swipe state
  let touchstartX = 0;
  let touchstartY = 0;
  let touchendX   = 0;
  let touchendY   = 0;

  // ── Zoom helpers ──────────────────────────────────────────────
  function clampZoom(z) {
    return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z));
  }

  /**
   * Apply zoom + pan via CSS transform on the canvas.
   * We translate BEFORE scaling so the origin works correctly.
   *   transform: translate(panX, panY) scale(zoom)
   * The viewport uses overflow:hidden; panning is encoded in panX/panY.
   */
  function applyTransform() {
    canvas.style.transform = `translate(${panX}px, ${panY}px) scale(${zoomLevel})`;
    zoomIndicator.textContent = `${Math.round(zoomLevel * 100)}%`;

    // Cursor feedback
    if (zoomLevel > 1.0) {
      canvas.style.cursor = isDragging ? "grabbing" : "grab";
    } else {
      canvas.style.cursor = "zoom-in";
    }

    // Show/hide nav arrows & reset pan when zoom is 1
    if (zoomLevel <= 1.0) {
      panX = 0; panY = 0;
      canvas.style.transform = `translate(0px, 0px) scale(1)`;
    }
  }

  /**
   * Zoom centred on a point (viewportX, viewportY) in viewport pixels.
   * Algorithm used by MangaDex / ComicK:
   *   1. Find where that point sits in "canvas space" before the zoom.
   *   2. After zoom, adjust pan so that canvas point stays under the mouse.
   */
  function zoomAt(newZoom, vpX, vpY) {
    newZoom = clampZoom(newZoom);
    if (newZoom === zoomLevel) return;

    // Current canvas bounding rect relative to viewport
    const vRect  = viewport.getBoundingClientRect();
    const cRect  = canvas.getBoundingClientRect();

    // Mouse position relative to the canvas top-left (in screen px)
    const mouseOnCanvasX = vpX - cRect.left;
    const mouseOnCanvasY = vpY - cRect.top;

    // Those same coords in the unscaled canvas space
    const canvasSpaceX = mouseOnCanvasX / zoomLevel;
    const canvasSpaceY = mouseOnCanvasY / zoomLevel;

    // New pan so the point stays fixed under the cursor
    const scaleDiff = newZoom - zoomLevel;
    panX -= canvasSpaceX * scaleDiff;
    panY -= canvasSpaceY * scaleDiff;

    zoomLevel = newZoom;
    clampPan();
    applyTransform();
  }

  function clampPan() {
    if (zoomLevel <= 1.0) { panX = 0; panY = 0; return; }
    // Allow panning up to the canvas overflow in each direction
    const vRect = viewport.getBoundingClientRect();
    const scaledW = canvas.scrollWidth * zoomLevel;
    const scaledH = canvas.scrollHeight * zoomLevel;
    
    // Horizontal boundary (always symmetric, since origin is horizontally centered in both modes)
    const maxX = Math.max(0, (scaledW - vRect.width) / 2);
    panX = Math.min(maxX, Math.max(-maxX, panX));

    // Vertical boundary depends on the transform origin (page: center center; cascade: top center)
    if (readingMode === "page") {
      const maxY = Math.max(0, (scaledH - vRect.height) / 2);
      panY = Math.min(maxY, Math.max(-maxY, panY));
    } else {
      // Cascade mode: top center origin, meaning top starts at 0 and extends downwards to scaledH.
      // Maximum scroll-up (negative panY) brings the bottom of the canvas into view.
      const minY = -Math.max(0, scaledH - vRect.height);
      panY = Math.min(0, Math.max(minY, panY));
    }
  }

  function resetZoom() {
    zoomLevel = 1.0; panX = 0; panY = 0;
    applyTransform();
  }

  // ── Canvas rendering ──────────────────────────────────────────
  function updateCanvas() {
    canvas.innerHTML = "";
    resetZoom();

    if (readingMode === "page") {
      totalIndicator.textContent   = mangaPages.length;
      currentIndicator.textContent = currentPageIndex + 1;

      const img = document.createElement("img");
      img.src       = mangaPages[currentPageIndex];
      img.alt       = `Página ${currentPageIndex + 1}`;
      img.className = "manga-page";
      canvas.appendChild(img);

      prevBtn.disabled = currentPageIndex === 0;
      nextBtn.disabled = currentPageIndex === mangaPages.length - 1;

    } else {
      // CASCADE: all pages stacked
      totalIndicator.textContent   = mangaPages.length;
      currentIndicator.textContent = currentPageIndex + 1;

      mangaPages.forEach((src, idx) => {
        const img = document.createElement("img");
        img.className = "manga-page";
        img.alt       = `Página ${idx + 1}`;
        
        // Scroll target image into view as soon as it loads to guarantee its height is resolved
        if (idx === currentPageIndex) {
          img.onload = () => {
            img.scrollIntoView({ block: "start", behavior: "instant" });
          };
        }
        
        img.src = src;
        canvas.appendChild(img);
      });

      // Fallback scroll in case of cache or immediate rendering
      setTimeout(() => {
        const pages = canvas.querySelectorAll(".manga-page");
        if (pages[currentPageIndex]) {
          pages[currentPageIndex].scrollIntoView({ block: "start", behavior: "instant" });
        }
      }, 50);
    }
  }

  function openManga(index) {
    const parsed = parseInt(index, 10);
    currentPageIndex = isNaN(parsed) ? 0 : parsed;
    modal.className  = `manga-modal active mode-${readingMode}`;
    document.body.style.overflow = "hidden";
    syncModeButtons();
    updateCanvas();
    viewport.scrollLeft = 0;
    viewport.scrollTop  = 0;
  }

  function closeManga() {
    modal.classList.remove("active");
    document.body.style.overflow = "";
    canvas.innerHTML = "";
    resetZoom();
  }

  function syncModeButtons() {
    if (readingMode === "cascade") {
      btnModeCascade.classList.add("active");
      btnModePage.classList.remove("active");
    } else {
      btnModePage.classList.add("active");
      btnModeCascade.classList.remove("active");
    }
  }

  function prevPage() {
    if (readingMode === "page" && currentPageIndex > 0) {
      currentPageIndex--;
      updateCanvas();
    }
  }

  function nextPage() {
    if (readingMode === "page" && currentPageIndex < mangaPages.length - 1) {
      currentPageIndex++;
      updateCanvas();
    }
  }

  // ── Event listeners ────────────────────────────────────────────

  // Open
  if (startBtn) startBtn.addEventListener("click", () => openManga(0));
  pageThumbs.forEach(thumb => {
    thumb.addEventListener("click", () => openManga(thumb.getAttribute("data-page-index")));
  });

  // Close
  if (closeBtn) closeBtn.addEventListener("click", closeManga);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeManga();
  });

  // Mode switch
  if (btnModePage) {
    btnModePage.addEventListener("click", () => {
      if (readingMode !== "page") {
        readingMode = "page";
        modal.classList.replace("mode-cascade", "mode-page");
        syncModeButtons();
        updateCanvas();
      }
    });
  }
  if (btnModeCascade) {
    btnModeCascade.addEventListener("click", () => {
      if (readingMode !== "cascade") {
        readingMode = "cascade";
        modal.classList.replace("mode-page", "mode-cascade");
        syncModeButtons();
        updateCanvas();
      }
    });
  }

  // Nav arrows
  if (prevBtn) prevBtn.addEventListener("click", prevPage);
  if (nextBtn) nextBtn.addEventListener("click", nextPage);

  // Toolbar zoom buttons
  if (btnZoomIn)    btnZoomIn.addEventListener("click",    () => zoomAt(clampZoom(zoomLevel + ZOOM_STEP), viewport.getBoundingClientRect().left + viewport.clientWidth / 2, viewport.getBoundingClientRect().top + viewport.clientHeight / 2));
  if (btnZoomOut)   btnZoomOut.addEventListener("click",   () => zoomAt(clampZoom(zoomLevel - ZOOM_STEP), viewport.getBoundingClientRect().left + viewport.clientWidth / 2, viewport.getBoundingClientRect().top + viewport.clientHeight / 2));
  if (btnZoomReset) btnZoomReset.addEventListener("click", () => resetZoom());

  // Mouse-wheel: zoom em modo Página; em Cascata o scroll é livre
  viewport.addEventListener("wheel", (e) => {
    if (!modal.classList.contains("active")) return;
    if (readingMode === "cascade") return; // let cascade scroll normally
    e.preventDefault();
    const delta = e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP;
    zoomAt(clampZoom(zoomLevel + delta), e.clientX, e.clientY);
  }, { passive: false });

  // ── Click on canvas to toggle zoom (only if no drag happened) ──
  canvas.addEventListener("click", (e) => {
    if (dragMoved) { dragMoved = false; return; }
    if (zoomLevel > 1.0) {
      resetZoom();
    } else {
      // Zoom-in centred on click point
      zoomAt(1.5, e.clientX, e.clientY);
    }
  });

  // ── Mouse drag to pan ──────────────────────────────────────────
  canvas.addEventListener("mousedown", (e) => {
    if (zoomLevel <= 1.0) return;
    if (e.button !== 0) return;
    e.preventDefault();
    isDragging    = true;
    dragMoved     = false;
    dragStartMouseX = e.clientX;
    dragStartMouseY = e.clientY;
    dragStartPanX   = panX;
    dragStartPanY   = panY;
    canvas.style.cursor = "grabbing";
  });

  window.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartMouseX;
    const dy = e.clientY - dragStartMouseY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) dragMoved = true;
    panX = dragStartPanX + dx;
    panY = dragStartPanY + dy;
    clampPan();
    applyTransform();
  });

  window.addEventListener("mouseup", () => {
    if (!isDragging) return;
    isDragging = false;
    applyTransform(); // restores grab cursor
    // Keep dragMoved true briefly so the click handler can see it
    setTimeout(() => { dragMoved = false; }, 50);
  });

  // ── Keyboard ──────────────────────────────────────────────────
  document.addEventListener("keydown", (e) => {
    if (!modal.classList.contains("active")) return;
    if (e.key === "Escape") {
      closeManga();
    } else if (e.key === "ArrowLeft") {
      if (readingMode === "page") prevPage();
      else viewport.scrollBy({ top: -viewport.clientHeight * 0.8, behavior: "smooth" });
    } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      if (readingMode === "page") nextPage();
      else viewport.scrollBy({ top: viewport.clientHeight * 0.8, behavior: "smooth" });
    } else if (e.key === "ArrowUp") {
      if (readingMode === "cascade") viewport.scrollBy({ top: -viewport.clientHeight * 0.8, behavior: "smooth" });
    } else if (e.key === "+" || e.key === "=") {
      const cx = viewport.getBoundingClientRect().left + viewport.clientWidth  / 2;
      const cy = viewport.getBoundingClientRect().top  + viewport.clientHeight / 2;
      zoomAt(clampZoom(zoomLevel + ZOOM_STEP), cx, cy);
    } else if (e.key === "-") {
      const cx = viewport.getBoundingClientRect().left + viewport.clientWidth  / 2;
      const cy = viewport.getBoundingClientRect().top  + viewport.clientHeight / 2;
      zoomAt(clampZoom(zoomLevel - ZOOM_STEP), cx, cy);
    }
  });

  // ── Scroll page indicator update (cascade mode) ──────────────
  viewport.addEventListener("scroll", () => {
    if (readingMode !== "cascade") return;
    const pages = canvas.querySelectorAll(".manga-page");
    if (!pages.length) return;
    const vCenter = viewport.scrollTop + viewport.clientHeight / 2;
    let best = 0, bestDist = Infinity;
    pages.forEach((pg, idx) => {
      const dist = Math.abs((pg.offsetTop + pg.offsetHeight / 2) - vCenter);
      if (dist < bestDist) { bestDist = dist; best = idx; }
    });
    currentPageIndex = best;
    currentIndicator.textContent = best + 1;
  });

  // ── Touch swipe (page mode) ──────────────────────────────────
  viewport.addEventListener("touchstart", (e) => {
    if (zoomLevel > 1.0) return;
    touchstartX = e.changedTouches[0].screenX;
    touchstartY = e.changedTouches[0].screenY;
  }, { passive: true });

  viewport.addEventListener("touchend", (e) => {
    if (zoomLevel > 1.0) return;
    touchendX = e.changedTouches[0].screenX;
    touchendY = e.changedTouches[0].screenY;
    const dx = touchendX - touchstartX;
    const dy = touchendY - touchstartY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 60) {
      if (dx > 0) prevPage(); else nextPage();
    }
  }, { passive: true });
}
