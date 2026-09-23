(() => {
  const clips = {
    landscape: { gsc: "assets/videos/landscape-gsc-denoising-fff26010fe.mp4", maxcd: "assets/videos/landscape-maxcd-denoising-a4f45ce251.mp4" },
    corgis: { gsc: "assets/videos/corgis-gsc-denoising-baf46cd55c.mp4", maxcd: "assets/videos/corgis-maxcd-denoising-fb22590d1b.mp4" },
  };
  const methods = ["gsc", "maxcd"];
  const videos = methods.map(method => document.getElementById("denoise-" + method));
  const [clock, follower] = videos;
  const play = document.getElementById("denoise-play");
  const replay = document.getElementById("denoise-replay");
  const seek = document.getElementById("denoise-seek");
  const time = document.getElementById("denoise-time");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const tolerance = 0.04;
  let wantsPlayback = !reducedMotion.matches;
  let generation = 0;
  let starting = false;
  let loading = false;

  function duration() {
    return videos.every(video => Number.isFinite(video.duration))
      ? Math.min(...videos.map(video => video.duration)) : 0;
  }

  function updateControls() {
    const total = duration();
    play.textContent = wantsPlayback ? "Pause" : "Play";
    play.setAttribute("aria-label", wantsPlayback ? "Pause both panorama videos" : "Play both panorama videos");
    seek.disabled = total === 0;
    seek.max = total || 1;
    seek.value = clock.currentTime;
    time.textContent = clock.currentTime.toFixed(1) + " / " + total.toFixed(1) + " s";
  }

  function pauseBoth() {
    videos.forEach(video => video.pause());
  }

  function resumeBoth() {
    if (!wantsPlayback || loading || starting || document.hidden ||
        !videos.every(video => video.readyState >= 3 && !video.seeking)) return;
    if (videos.every(video => !video.paused)) return;
    pauseBoth();
    if (Math.abs(clock.currentTime - follower.currentTime) > tolerance) {
      follower.currentTime = clock.currentTime;
      return;
    }
    starting = true;
    const token = generation;
    Promise.all(videos.map(video => video.play())).catch(error => {
      if (token !== generation) return;
      pauseBoth();
      if (error.name !== "AbortError") wantsPlayback = false;
    }).finally(() => {
      if (token !== generation) return;
      starting = false;
      updateControls();
    });
  }

  function seekBoth(position) {
    pauseBoth();
    const target = Math.max(0, Math.min(position, Math.max(0, duration() - 0.001)));
    videos.forEach(video => { if (video.readyState >= 1) video.currentTime = target; });
    updateControls();
    resumeBoth();
  }

  function loadPrompt(key) {
    generation += 1;
    loading = true;
    starting = false;
    pauseBoth();
    videos.forEach((video, index) => {
      document.getElementById("denoise-" + methods[index] + "-src").src = clips[key][methods[index]];
      video.load();
    });
    loading = false;
    updateControls();
  }

  play.addEventListener("click", () => {
    wantsPlayback = !wantsPlayback;
    if (wantsPlayback) resumeBoth();
    else pauseBoth();
    updateControls();
  });
  replay.addEventListener("click", () => {
    wantsPlayback = true;
    seekBoth(0);
  });
  seek.addEventListener("input", () => seekBoth(Number(seek.value)));

  videos.forEach(video => {
    ["loadedmetadata", "canplay", "seeked"].forEach(event => {
      video.addEventListener(event, () => { updateControls(); resumeBoth(); });
    });
    video.addEventListener("waiting", () => {
      pauseBoth();
    });
    video.addEventListener("ended", () => {
      if (wantsPlayback) seekBoth(0);
    });
    video.addEventListener("error", () => {
      wantsPlayback = false;
      pauseBoth();
      updateControls();
    });
  });

  document.querySelectorAll("#denoise_seg button").forEach(button => {
    button.addEventListener("click", () => {
      document.querySelectorAll("#denoise_seg button").forEach(other => other.classList.toggle("active", other === button));
      loadPrompt(button.dataset.key);
    });
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) pauseBoth();
    else resumeBoth();
  });
  reducedMotion.addEventListener("change", () => {
    if (reducedMotion.matches) {
      wantsPlayback = false;
      pauseBoth();
      updateControls();
    }
  });

  function tick() {
    if (wantsPlayback && !loading && !document.hidden) {
      if (videos.some(video => video.readyState < 3 || video.seeking)) {
        pauseBoth();
      } else if (Math.abs(clock.currentTime - follower.currentTime) > tolerance) {
        pauseBoth();
        follower.currentTime = clock.currentTime;
      } else {
        resumeBoth();
      }
    }
    updateControls();
    requestAnimationFrame(tick);
  }

  loadPrompt("landscape");
  requestAnimationFrame(tick);
})();
