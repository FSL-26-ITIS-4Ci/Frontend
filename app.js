const searchArea = document.getElementById("searchArea");
const tagSelect = document.getElementById("tagSelect");
const platformSelect = document.getElementById("platformSelect");

const hostname = window.location.hostname;

const WS_URL =
  hostname === "localhost" || hostname === "127.0.0.1"
    ? "ws://localhost:8080"
    : hostname === "frontend-production-fc994.up.railway.app"
      ? "wss://shinkansen.proxy.rlwy.net:13395"
      : "wss://backend-js-vubt.onrender.com";

const ws = new WebSocket(WS_URL);

let currentFilters = {
  searchTerm: "",
  tags: [],
  platforms: [],
  crossPlay: "",
};

function waitForConnection() {
  return new Promise((resolve) => {
    ws.onopen = () => {
      console.log("SERVER: Connesso");
      resolve();
    };
  });
}

async function init() {
  await waitForConnection();
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    switch (data.type) {
      case "gamesList":
      case "search":
        renderGames(data.value);
        break;
      case "initialFilters":
        data.tags.forEach((tag) => {
          tagSelect.innerHTML += `<label for="${tag}"><input type="checkbox" id="${tag}" name="tag" value="${tag}">${tag}</label>`;
        });
        data.piattaforme.forEach((piattaforma) => {
          platformSelect.innerHTML += `<label for="${piattaforma}"><input type="checkbox" id="${piattaforma}" name="piat" value="${piattaforma}">${piattaforma}</label>`;
        });
        break;

      default:
        console.log("ERROR: Invalid request");
    }
  };
}

init();

ws.onerror = (error) => {
  console.log("Error: " + error.message);
};

ws.onclose = () => {
  console.log("Disconnected from server");
};

async function cerca() {
  currentFilters.searchTerm = searchArea.value;

  const form = document.getElementById("form");

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const tagCheckboxes = form.querySelectorAll('input[name="tag"]:checked');
  currentFilters.tags = Array.from(tagCheckboxes).map((cb) => cb.value);

  const piatCheckboxes = form.querySelectorAll('input[name="piat"]:checked');
  currentFilters.platforms = Array.from(piatCheckboxes).map((cb) => cb.value);

  const formData = new FormData(form);

  currentFilters.crossPlay = formData.get("crossPlay");

  ws.send(
    JSON.stringify({
      type: "search",
      value: searchArea.value,
      platforms: currentFilters.platforms,
      tags: currentFilters.tags,
      crossPlay: currentFilters.crossPlay,
    }),
  );
}

function createGameCard(game) {
  return (
    `
    <div class="game-card">
      <h2>${game.nome}</h2>
      <p>${game.studio}</p>
      <p>Tags: ${game.tag.join(", ")}</p>
      <p>Price: €${game.prezzo}</p>
      <p>Platforms: ${game.piattaforme.join(", ")}</p>
      <p>PEGI: ${game.pegi}</p>
      <p>Cross-Play: ${game.crossPlay ? "Yes" : "No"}</p>
  ` +
    (game.common
      ? game.common.length
        ? `<p>Tag/Piattaforme Comuni: ${game.common.join(", ")}</p></div>`
        : "</div>"
      : "</div>")
  );
}

function renderGames(gamesList) {
  const gamesGrid = document.getElementById("gamesGrid");
  gamesGrid.innerHTML = gamesList.map((game) => createGameCard(game)).join("");
}
