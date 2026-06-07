// Chainsaw Man Fansite — Script
document.addEventListener("DOMContentLoaded", () => {
  setupNavigation();
  setupVisitorCounter();
  setupMusicPlayer();
  setupCharacterTabs();
  setupGuestbook();
  setupLightbox();
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

    let posts = localStorage.getItem("csm_gb_posts");
    if (!posts) {
      posts = defaultPosts;
      localStorage.setItem("csm_gb_posts", JSON.stringify(posts));
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

      let posts = JSON.parse(localStorage.getItem("csm_gb_posts") || "[]");
      posts.push({ name, avatar: selectedAvatar, message, date });
      localStorage.setItem("csm_gb_posts", JSON.stringify(posts));

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
