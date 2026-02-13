const searchArea = document.getElementById("searchArea");
const tagSelect = document.getElementById("tagSelect");
const platformSelect = document.getElementById("platformSelect");

const hostname = window.location.hostname;

const WS_URL =
  hostname === "localhost" || hostname === "127.0.0.1"
    ? "ws://localhost:8080"
    : hostname === "frontend-production-fc994.up.railway.app"
      ? "wss://backend-js-production-7ed9.up.railway.app"
      : "wss://backend-js-vubt.onrender.com";

const ws = new WebSocket(WS_URL);

let currentFilters = {
  searchTerm: "",
  tags: [],
  platforms: [],
  crossPlay: "",
  pegi: null,
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
        getCheckbox();
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
  currentFilters.pegi = formData.get("pegi");

  ws.send(
    JSON.stringify({
      type: "search",
      value: searchArea.value,
      platforms: currentFilters.platforms,
      tags: currentFilters.tags,
      crossPlay: currentFilters.crossPlay,
      pegi: currentFilters.pegi,
    }),
  );
}

function createGameCard(game) {
  return (
    `
    <div class="game-card">
      <img src=${game.imgPath}>
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
        ? `<p>Tag/Piattaforme Comuni: <strong>${game.common.join(", ")}</strong></p></div>`
        : "</div>"
      : "</div>")
  );
}

function renderGames(gamesList) {
  const gamesGrid = document.getElementById("gamesGrid");
  gamesGrid.innerHTML = gamesList.map((game) => createGameCard(game)).join("");
}

searchArea.addEventListener("input", () => {
  if (searchArea.value === "") {
    cerca();
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    cerca();
  }
});

async function handleType() {
  let timerObj;
  searchArea.addEventListener("keyup", () => {
    clearTimeout(timerObj);

    timerObj = setTimeout(() => {
      cerca();
    }, 1000);
  });
}

async function getCheckbox() {
  const allCheck = document.querySelectorAll('[type="checkbox"]');
  Array.from(allCheck).forEach((checkbox) => {
    checkbox.addEventListener("click", () => {
      if (checkbox.parentNode.style.fontWeight === "bold") {
        checkbox.parentNode.style.fontWeight = "normal";
      } else {
        checkbox.parentNode.style.fontWeight = "bold";
      }

      let timerObj;

      clearTimeout(timerObj);

      timerObj = setTimeout(() => {
        cerca();
      }, 1000);
    });
  });
}

function reset() {
  searchArea.value = "";
  currentFilters.searchTerm = "";
  currentFilters.tags = [];
  currentFilters.platforms = [];
  currentFilters.pegi = null;

  cerca();
}

handleType();
