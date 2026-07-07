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
