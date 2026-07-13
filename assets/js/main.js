const projects = [
  {
    name: "Weather Prediction",
    url: "https://wetter.juhermes.de",
    status: "Live",
    accent: "#5bd5ca",
    scene: "weather",
    description: "A fine-tuned weather model for L&uuml;neburg that outperforms professional weather models for local forecasts.",
  },
  {
    name: "OnPoint.",
    url: "https://bahn.juhermes.de/",
    status: "Live",
    accent: "#77dce8",
    scene: "rail",
    description: "A route planner that tracks real train delays and ranks connections by expected journey time and transfer risk.",
  },
  {
    name: "Football Forecast",
    url: "",
    status: "Upcoming",
    accent: "#f0b35a",
    scene: "football",
    description: "A probabilistic model for predicting football games, built as a practical machine learning and uncertainty project.",
  },
  {
    name: "Automation Lab",
    url: "",
    status: "In progress",
    accent: "#e46f6f",
    description: "A reserved spot for agentic AI, workflow automation, and data-tool experiments as they become shareable.",
  },
];

const grid = document.querySelector("#project-grid");

function createProjectCard(project) {
  const card = document.createElement("article");
  card.className = `project-card${project.url ? "" : " is-muted"}`;
  card.style.setProperty("--accent", project.accent);

  const action = project.url
    ? `<a class="project-link" href="${project.url}">
        Open project
        <span aria-hidden="true">&rarr;</span>
      </a>`
    : `<div class="project-link" aria-label="Coming soon">
        Coming soon
        <span aria-hidden="true">&rarr;</span>
      </div>`;
  const scene =
    project.scene === "weather"
      ? `<div class="weather-scene" aria-hidden="true">
          <span class="weather-horizon"></span>
          <span class="weather-sun"></span>
          <span class="weather-cloud weather-cloud-one"></span>
          <span class="weather-cloud weather-cloud-two"></span>
        </div>`
      : project.scene === "football"
        ? `<div class="football-scene" aria-hidden="true">
            <span class="football-pitch-line"></span>
            <span class="football-goal"></span>
            <span class="football-arc"></span>
            <span class="football-ball"></span>
          </div>`
        : project.scene === "rail"
          ? `<div class="rail-scene" aria-hidden="true">
              <span class="rail-glow"></span>
              <span class="rail-route"></span>
              <span class="rail-station rail-station-one"></span>
              <span class="rail-station rail-station-two"></span>
              <span class="rail-station rail-station-three"></span>
              <span class="rail-train">
                <span class="rail-train-window"></span>
              </span>
              <span class="rail-delay">+8 min</span>
            </div>`
      : "";

  card.innerHTML = `
    ${scene}
    <div class="project-topline">
      <span>${project.status}</span>
      <span class="project-dot" aria-hidden="true"></span>
    </div>
    <h3>${project.name}</h3>
    <p>${project.description}</p>
    ${action}
  `;

  return card;
}

if (grid) {
  grid.replaceChildren(...projects.map(createProjectCard));
}

const year = document.querySelector("#year");

if (year) {
  year.textContent = new Date().getFullYear();
}

const typingWord = document.querySelector(".typing-word");

function initTypingWord(word) {
  const text = word.querySelector(".typing-word-text");
  const typo = word.dataset.typo || "";
  const finalWord = word.dataset.final || "";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (!text || !typo || !finalWord) {
    return;
  }

  text.textContent = reduceMotion.matches ? finalWord : typo;

  if (reduceMotion.matches) {
    word.classList.add("is-complete");
    return;
  }

  const sleep = (duration) => new Promise((resolve) => window.setTimeout(resolve, duration));
  let hasPlayed = false;

  async function playCorrection() {
    if (hasPlayed) {
      return;
    }

    hasPlayed = true;
    word.classList.add("is-typing");
    await sleep(690);

    for (let index = typo.length; index >= 0; index -= 1) {
      text.textContent = typo.slice(0, index);
      await sleep(96);
    }

    await sleep(225);

    for (let index = 1; index <= finalWord.length; index += 1) {
      text.textContent = finalWord.slice(0, index);
      await sleep(index === finalWord.length ? 160 : 115);
    }

    word.classList.remove("is-typing");
    word.classList.add("is-complete");
  }

  if (!("IntersectionObserver" in window)) {
    playCorrection();
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      const isMainView = entries.some((entry) => entry.isIntersecting);

      if (isMainView) {
        observer.disconnect();
        playCorrection();
      }
    },
    {
      root: null,
      rootMargin: "-34% 0px -34% 0px",
      threshold: 0,
    },
  );

  observer.observe(word);
}

if (typingWord) {
  initTypingWord(typingWord);
}

const contactSection = document.querySelector(".contact-section");

function initContactFlight(section) {
  const scene = section.querySelector(".contact-flight-scene");
  const trail = section.querySelector(".flight-trail");
  const path = section.querySelector(".flight-trail-path");
  const mask = section.querySelector(".flight-trail-mask");
  const plane = section.querySelector(".paper-plane");
  const letterbox = section.querySelector(".letterbox");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const mobileFlight = window.matchMedia("(max-width: 880px)");
  const playClass = "is-flight-playing";
  const flightPaths = {
    desktop:
      "M -56 172 C 118 132 230 142 330 164 C 455 190 500 106 590 82 C 705 50 812 106 780 170 C 748 232 632 206 640 148 C 648 98 748 124 898 184",
    mobile:
      "M -70 190 C 80 148 198 158 298 184 C 382 206 408 128 486 104 C 590 72 700 116 672 174 C 646 228 548 214 554 160 C 560 112 704 132 912 188",
  };
  let hasPlayed = false;
  let resetTimer = 0;
  let animationFrame = 0;
  let currentProgress = 0;
  let activePath = "";

  function applyResponsivePath() {
    const nextPath = mobileFlight.matches ? flightPaths.mobile : flightPaths.desktop;

    if (activePath === nextPath) {
      return;
    }

    activePath = nextPath;
    path.setAttribute("d", nextPath);
    mask.setAttribute("d", nextPath);
  }

  function mapSvgPoint(point) {
    const sceneRect = scene.getBoundingClientRect();
    const trailRect = trail.getBoundingClientRect();
    const viewBox = trail.viewBox.baseVal;

    return {
      x: trailRect.left - sceneRect.left + ((point.x - viewBox.x) / viewBox.width) * trailRect.width,
      y: trailRect.top - sceneRect.top + ((point.y - viewBox.y) / viewBox.height) * trailRect.height,
    };
  }

  function easeFlight(progress) {
    return 0.5 - Math.cos(progress * Math.PI) / 2;
  }

  function positionPlane(progress) {
    const totalLength = path.getTotalLength();
    const length = totalLength * progress;
    const point = mapSvgPoint(path.getPointAtLength(length));
    const nextPoint = mapSvgPoint(path.getPointAtLength(Math.min(totalLength, length + totalLength * 0.006)));
    const angle = Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x) * (180 / Math.PI);

    currentProgress = progress;
    plane.style.setProperty("--plane-x", `${point.x}px`);
    plane.style.setProperty("--plane-y", `${point.y}px`);
    plane.style.setProperty("--plane-angle", `${angle}deg`);
    mask.style.strokeDasharray = `${Math.max(progress, 0.001)} 1`;
  }

  function positionLetterbox() {
    const totalLength = path.getTotalLength();
    const endPoint = mapSvgPoint(path.getPointAtLength(totalLength));
    const slotOffsetY = 19;

    letterbox.style.setProperty("--letterbox-left", `${endPoint.x - letterbox.offsetWidth / 2}px`);
    letterbox.style.setProperty("--letterbox-top", `${endPoint.y - slotOffsetY}px`);
  }

  function syncFlightScene() {
    if (!scene || !trail || !path || !mask || !plane || !letterbox) {
      return;
    }

    applyResponsivePath();
    positionLetterbox();
    positionPlane(currentProgress);
  }

  function playFlight() {
    if (hasPlayed) {
      return;
    }

    hasPlayed = true;
    currentProgress = 0;
    syncFlightScene();
    section.classList.add(playClass);
    window.clearTimeout(resetTimer);
    window.cancelAnimationFrame(animationFrame);
    const flightDuration = parseFloat(window.getComputedStyle(scene).getPropertyValue("--contact-flight-duration")) || 6200;

    if (!reduceMotion.matches) {
      const startedAt = window.performance.now();

      function animateFlight(time) {
        const rawProgress = Math.min((time - startedAt) / flightDuration, 1);
        const easedProgress = easeFlight(rawProgress);

        positionPlane(easedProgress);

        if (rawProgress < 1) {
          animationFrame = window.requestAnimationFrame(animateFlight);
        }
      }

      animationFrame = window.requestAnimationFrame(animateFlight);
    } else {
      positionPlane(1);
    }

    resetTimer = window.setTimeout(() => {
      section.classList.remove(playClass);
      window.cancelAnimationFrame(animationFrame);
      currentProgress = 0;
      positionPlane(0);
    }, reduceMotion.matches ? 1200 : flightDuration + 260);
  }

  if (!scene || !trail || !path || !mask || !plane || !letterbox) {
    return;
  }

  syncFlightScene();
  window.addEventListener("resize", syncFlightScene);

  if (typeof mobileFlight.addEventListener === "function") {
    mobileFlight.addEventListener("change", syncFlightScene);
  } else if (typeof mobileFlight.addListener === "function") {
    mobileFlight.addListener(syncFlightScene);
  }

  if (!("IntersectionObserver" in window)) {
    playFlight();
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      const isMainView = entries.some((entry) => entry.isIntersecting);

      if (isMainView) {
        observer.disconnect();
        playFlight();
      }
    },
    {
      root: null,
      rootMargin: "-32% 0px -32% 0px",
      threshold: 0,
    },
  );

  observer.observe(section);
}

if (contactSection) {
  initContactFlight(contactSection);
}

const heroNetworkCanvas = document.querySelector(".hero-network");

function initHeroNetwork(canvas) {
  const hero = canvas.closest(".hero");
  const context = canvas.getContext("2d");

  if (!hero || !context) {
    return;
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const pointer = {
    active: false,
    x: 0.74,
    y: 0.42,
  };

  let width = 0;
  let height = 0;
  let pixelRatio = 1;
  let nodes = [];
  let links = [];
  let signals = [];
  let animationId = 0;

  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  function buildNetwork() {
    const nodeCount = Math.round(Math.min(92, Math.max(42, (width * height) / 26000)));
    const connectDistance = Math.min(210, Math.max(132, width / 7));

    nodes = Array.from({ length: nodeCount }, (_, index) => {
      const isWideNode = width > 700 && index % 5 !== 0;
      const xStart = isWideNode ? 0.34 : 0.05;
      const xRange = isWideNode ? 0.63 : 0.78;

      return {
        baseX: width * (xStart + Math.random() * xRange),
        baseY: height * randomBetween(0.08, 0.9),
        drift: randomBetween(5, 18),
        phase: randomBetween(0, Math.PI * 2),
        radius: randomBetween(1.2, 2.6),
        speed: randomBetween(0.12, 0.32),
        tone: index % 7 === 0 ? "warm" : "cool",
        x: 0,
        y: 0,
      };
    });

    links = [];

    nodes.forEach((node, index) => {
      const candidates = nodes
        .map((other, otherIndex) => ({
          distance: Math.hypot(node.baseX - other.baseX, node.baseY - other.baseY),
          otherIndex,
        }))
        .filter((candidate) => candidate.otherIndex > index && candidate.distance < connectDistance)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 3);

      candidates.forEach((candidate) => {
        links.push({
          from: index,
          to: candidate.otherIndex,
          distance: candidate.distance,
          phase: randomBetween(0, Math.PI * 2),
          warm: nodes[candidate.otherIndex].tone === "warm" || node.tone === "warm",
        });
      });
    });

    signals = Array.from({ length: Math.min(18, Math.max(8, Math.floor(links.length / 8))) }, () => ({
      linkIndex: Math.floor(Math.random() * Math.max(links.length, 1)),
      offset: Math.random(),
      speed: randomBetween(0.045, 0.12),
    }));
  }

  function resizeCanvas() {
    const rect = hero.getBoundingClientRect();

    width = Math.max(320, rect.width);
    height = Math.max(420, rect.height);
    pixelRatio = Math.min(2, window.devicePixelRatio || 1);

    canvas.width = Math.floor(width * pixelRatio);
    canvas.height = Math.floor(height * pixelRatio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    buildNetwork();
  }

  function positionNodes(time) {
    const targetX = pointer.x * width;
    const targetY = pointer.y * height;
    const motionScale = reduceMotion.matches ? 0 : 1;

    nodes.forEach((node) => {
      const distanceToTarget = Math.hypot(targetX - node.baseX, targetY - node.baseY);
      const pull = Math.max(0, 1 - distanceToTarget / 420) * (pointer.active ? 16 : 5);
      const angle = Math.atan2(targetY - node.baseY, targetX - node.baseX);
      const driftX = Math.cos(time * node.speed + node.phase) * node.drift * motionScale;
      const driftY = Math.sin(time * node.speed * 0.88 + node.phase) * node.drift * 0.64 * motionScale;

      node.x = node.baseX + driftX + Math.cos(angle) * pull;
      node.y = node.baseY + driftY + Math.sin(angle) * pull;
    });
  }

  function draw(timeStamp = 0) {
    const time = timeStamp / 1000;

    positionNodes(time);
    context.clearRect(0, 0, width, height);

    links.forEach((link) => {
      const from = nodes[link.from];
      const to = nodes[link.to];
      const distance = Math.hypot(from.x - to.x, from.y - to.y);
      const activity = reduceMotion.matches ? 0.45 : 0.35 + Math.sin(time * 0.72 + link.phase) * 0.18;
      const alpha = Math.max(0, 1 - distance / 230) * activity;

      context.beginPath();
      context.moveTo(from.x, from.y);
      context.lineTo(to.x, to.y);
      context.strokeStyle = link.warm
        ? `rgba(240, 179, 90, ${alpha * 0.24})`
        : `rgba(91, 213, 202, ${alpha * 0.3})`;
      context.lineWidth = 1;
      context.stroke();
    });

    if (!reduceMotion.matches) {
      signals.forEach((signal) => {
        const link = links[signal.linkIndex % Math.max(links.length, 1)];

        if (!link) {
          return;
        }

        const from = nodes[link.from];
        const to = nodes[link.to];
        const progress = (time * signal.speed + signal.offset) % 1;
        const pulse = Math.sin(progress * Math.PI);
        const x = from.x + (to.x - from.x) * progress;
        const y = from.y + (to.y - from.y) * progress;

        context.beginPath();
        context.arc(x, y, 2.1 + pulse * 1.4, 0, Math.PI * 2);
        context.fillStyle = link.warm
          ? `rgba(240, 179, 90, ${pulse * 0.34})`
          : `rgba(244, 241, 234, ${pulse * 0.28})`;
        context.fill();
      });
    }

    nodes.forEach((node) => {
      const shimmer = reduceMotion.matches ? 0.58 : 0.5 + Math.sin(time * 0.9 + node.phase) * 0.16;

      context.beginPath();
      context.arc(node.x, node.y, node.radius * 3.2, 0, Math.PI * 2);
      context.fillStyle =
        node.tone === "warm"
          ? `rgba(240, 179, 90, ${shimmer * 0.045})`
          : `rgba(91, 213, 202, ${shimmer * 0.06})`;
      context.fill();

      context.beginPath();
      context.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      context.fillStyle =
        node.tone === "warm"
          ? `rgba(244, 241, 234, ${shimmer * 0.34})`
          : `rgba(244, 241, 234, ${shimmer * 0.42})`;
      context.fill();
    });
  }

  function animate(timeStamp) {
    draw(timeStamp);
    animationId = window.requestAnimationFrame(animate);
  }

  function updateMotionMode() {
    window.cancelAnimationFrame(animationId);

    if (reduceMotion.matches) {
      draw(0);
      return;
    }

    animationId = window.requestAnimationFrame(animate);
  }

  hero.addEventListener("pointermove", (event) => {
    const rect = hero.getBoundingClientRect();

    pointer.active = true;
    pointer.x = (event.clientX - rect.left) / rect.width;
    pointer.y = (event.clientY - rect.top) / rect.height;
  });

  hero.addEventListener("pointerleave", () => {
    pointer.active = false;
  });

  window.addEventListener("resize", () => {
    resizeCanvas();
    updateMotionMode();
  });

  if (typeof reduceMotion.addEventListener === "function") {
    reduceMotion.addEventListener("change", updateMotionMode);
  } else if (typeof reduceMotion.addListener === "function") {
    reduceMotion.addListener(updateMotionMode);
  }

  hero.classList.add("hero-network-mode");
  resizeCanvas();
  updateMotionMode();
}

if (heroNetworkCanvas) {
  initHeroNetwork(heroNetworkCanvas);
}
