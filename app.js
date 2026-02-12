const stato = document.getElementById("status");
const searchArea = document.getElementById("searchArea");
const tagSelect = document.getElementById("tagSelect");
const platformSelect = document.getElementById("platformSelect");
const ws = new WebSocket("ws://localhost:8080");

let currentFilters = {
  searchTerm: "",
  tags: [],
  platforms: [],
};

function waitForConnection() {
  return new Promise((resolve) => {
    ws.onopen = () => {
      stato.textContent = "Connected to server";
      stato.style.color = "green";
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
          tagSelect.innerHTML += `<input type="checkbox" id="${tag}" name="tag" value="${tag}">
        <label for="${tag}">${tag}</label><br>`;
        });
        data.piattaforme.forEach((piattaforma) => {
          platformSelect.innerHTML += `<input type="checkbox" id="${piattaforma}" name="piat" value="${piattaforma}">
        <label for="${piattaforma}">${piattaforma}</label><br>`;
        });
        break;

      default:
        console.log("ERROR: Invalid request");
    }
  };
}

init();

ws.onerror = (error) => {
  stato.textContent = "Error: " + error.message;
  stato.style.color = "red";
};

ws.onclose = () => {
  stato.textContent = "Disconnected from server";
  stato.style.color = "red";
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

  ws.send(
    JSON.stringify({
      type: "search",
      value: searchArea.value,
      platforms: currentFilters.platforms,
      tags: currentFilters.tags,
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
