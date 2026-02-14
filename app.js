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

let gamesData = [];

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
        gamesData = data.value;
        renderGames(data.value);
        handleModal();
        break;
      case "search":
        gamesData = data.value;
        renderGames(data.value);
        handleModal();
        break;
      case "initialFilters":
        data.tags.forEach((tag) => {
          tagSelect.innerHTML += `<label for="${tag}"><input type="checkbox" id="${tag}" name="tag" value="${tag}">${tag}</label>`;
        });
        data.piattaforme.forEach((piattaforma) => {
          platformSelect.innerHTML += `<label for="${piattaforma}"><input type="checkbox" id="${piattaforma}" name="piat" value="${piattaforma}">${piattaforma}</label>`;
        });
        handleFilterChange();
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

function createGameCard(game, index) {
  return (
    `
    <div class="game-card" data-game-index="${index}">
      <img src=${game.imgPath}>
      <h2>${game.nome}</h2>
      <p>Price: €${game.prezzo}</p>
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
  gamesGrid.innerHTML = gamesList
    .map((game, index) => createGameCard(game, index))
    .join("");
}

function populateModal(game) {
  const modalContent = document.querySelector("#myModal .modal-content");

  const detailsHTML = `
    <span class="close">&times;</span>
    <div class="modal-game-details">
      <img src="${game.imgPath}" alt="${game.nome}" style="max-width: 100%; height: auto; margin-bottom: 20px;">
      <h2>${game.nome}</h2>
      <p><strong>Studio:</strong> ${game.studio}</p>
      <p><strong>Prezzo:</strong> €${game.prezzo}</p>
      <p><strong>Tags:</strong> ${game.tag.join(", ")}</p>
      <p><strong>Piattaforme:</strong> ${game.piattaforme.join(", ")}</p>
      <p><strong>PEGI:</strong> ${game.pegi}</p>
      <p><strong>Cross-Play:</strong> ${game.crossPlay ? "Si" : "No"}</p>
      ${game.common && game.common.length ? `<p><strong>Tag/Piattaforme Comuni:</strong> ${game.common.join(", ")}</p>` : ""}
    </div>
  `;

  modalContent.innerHTML = detailsHTML;
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

async function handleFilterChange() {
  const allCheck = document.querySelectorAll('[type="checkbox"]');
  const pegiRadio = document.querySelectorAll('[name="pegi"]');
  const crossRadio = document.querySelectorAll('[name="crossPlay"]');

  Array.from(allCheck).forEach((checkbox) => {
    checkbox.addEventListener("click", () => {
      if (checkbox.parentNode.style.fontWeight === "bold") {
        checkbox.parentNode.style.fontWeight = "normal";
      } else {
        checkbox.parentNode.style.fontWeight = "bold";
      }

      cercaTimeout();
    });
  });

  Array.from(pegiRadio).forEach((radio) => {
    radio.addEventListener("click", () => {
      cercaTimeout();
    });
  });

  Array.from(crossRadio).forEach((radio) => {
    radio.addEventListener("click", () => {
      cercaTimeout();
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

async function handleModal() {
  const modal = document.getElementById("myModal");
  const allGames = document.querySelectorAll(".game-card");

  Array.from(allGames).forEach((item) => {
    item.onclick = function () {
      const gameIndex = parseInt(this.getAttribute("data-game-index"));
      const game = gamesData[gameIndex];

      populateModal(game);
      modal.style.display = "block";

      const span = document.getElementsByClassName("close")[0];
      span.onclick = function () {
        modal.style.display = "none";
      };
    };
  });

  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };
}

handleType();

function cercaTimeout() {
  let timerObj;

  clearTimeout(timerObj);

  timerObj = setTimeout(() => {
    cerca();
  }, 1000);
}
