const state = {
  resources: {
    clay: 10,
    lumber: 10,
    wool: 10, 
    stone: 10,
    wheat: 10,
  },
  resource_rates: {
    clay: 0,
    lumber: 0,
    wool: 0, 
    stone: 0,
    wheat: 0,
  },
  hasInitialSettlement: false,
};

const activeBuildLocations = [];
let trades = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // Create UI container for resources
  let resourceContainer = document.createElement("div");
  resourceContainer.id = "resource-info";
  resourceContainer.style.position = "absolute";
  resourceContainer.style.top = "20px";
  resourceContainer.style.right = "20px";
  resourceContainer.style.padding = "10px";
  resourceContainer.style.background = "rgba(255,255,255,0.9)";
  resourceContainer.style.border = "1px solid black";
  resourceContainer.style.fontFamily = "Arial, sans-serif";
  document.body.appendChild(resourceContainer);

  // Create UI container for trades
  let tradeContainer = document.createElement("div");
  tradeContainer.id = "trade-info";
  tradeContainer.style.position = "absolute";
  tradeContainer.style.top = "300px";
  tradeContainer.style.right = "20px";
  tradeContainer.style.padding = "10px";
  tradeContainer.style.background = "rgba(255,255,255,0.9)";
  tradeContainer.style.border = "1px solid black";
  tradeContainer.style.fontFamily = "Arial, sans-serif";
  document.body.appendChild(tradeContainer);

  cells = [];
  terrain = new Terrain();
  terrain.draw();
  trades = [];
  trades.push(new Trade());
  trades.push(new Trade());

  displayResources(); // Initial UI setup for resources
  displayTrades(); // Initial UI setup for trades
}

function displayResources() {
  let container = document.getElementById("resource-info");
  container.innerHTML = `<h3>Resources</h3>`;

  for (let key in state.resources) {
    let rate = state.resource_rates[key];
    let rateColor = rate > 0 ? "green" : rate < 0 ? "red" : "gray";
    let rateDisplay = rate !== 0 ? `<span style="color:${rateColor}">(${rate > 0 ? "+" : ""}${Math.floor(rate)})</span>` : "<span style='color:gray'>(-)</span>";
    
    container.innerHTML += `<p>${key}: ${Math.floor(state.resources[key])} ${rateDisplay}</p>`;
  }
}

function displayTrades() {
  let container = document.getElementById("trade-info");
  container.innerHTML = `<h3>Trades</h3>`;

  let tradesContainer = document.createElement("div");
  tradesContainer.id = "trades-container";
  container.appendChild(tradesContainer);

  trades.forEach((trade, index) => {
    let tradeDiv = document.createElement("div");
    tradeDiv.style.marginBottom = "10px";

    let tradeButton = document.createElement("button");
    tradeButton.innerText = `Trade ${trade.have} (${trade.rate}) → ${trade.need} (1)`;
    tradeButton.onclick = () => {
      if (state.resources[trade.have] >= trade.rate) {
        state.resources[trade.have] -= trade.rate;
        state.resources[trade.need] += 1;
        displayResources(); // Update UI after trade
      }
    };

    tradeDiv.appendChild(tradeButton);
    tradesContainer.appendChild(tradeDiv);
  });

  // Add "New Trade" button
  let newTradeButton = document.createElement("button");
  newTradeButton.innerText = "New Trade";
  newTradeButton.style.marginTop = "10px";
  newTradeButton.onclick = () => {
    addNewTrade();
    displayTrades(); // Refresh UI after adding a new trade
  };

  container.appendChild(newTradeButton);
}

function addNewTrade() {
  let resources = Object.keys(state.resources);
  let have = resources[Math.floor(Math.random() * resources.length)];
  let need;
  do {
    need = resources[Math.floor(Math.random() * resources.length)];
  } while (need === have);

  let rate = Math.floor(Math.random() * 5) + 1; // Trade rate between 1-5

  trades.push(new Trade(have, need, rate));
}

function redrawUI() {
  clear();
  terrain.draw();
}

function draw() {
  if (frameCount % 10 === 0) {
    mouseMoved();
    state.resource_rates = {
      clay: 0,
      lumber: 0,
      wool: 0, 
      stone: 0,
      wheat: 0,
    };

    activeBuildLocations.forEach((node) => {
      if (node.type === 'vertex') {
        Object.values(node.adjacentHexes).forEach((hex) => {
          if (hex.tileType.land) {
            let rate = node.level * hex.richness;
            state.resource_rates[hex.tileType.name] += rate;
            state.resources[hex.tileType.name] += rate / 100;
          }
        });
      }
    });

    displayResources(); // Update only resources UI
  }
}

function mousePressed() {
  const node = terrain.getNearestVertex(mouseX, mouseY);
  if (node.upgrade()) {
    node.color = 'red';
    node.upgrade(true);
    state.hasInitialSettlement = true;
    activeBuildLocations.push(node);
    displayResources(); // Update resources UI
  }
}

function mouseMoved() {
  redrawUI();
  const node = terrain.getNearestVertex(mouseX, mouseY);

  fill(node.upgrade() ? 'lightgreen' : 'grey');
  circle(node.x, node.y, 9);
  Object.values(node.adjacentHexes).forEach((hex) => {
    if (hex.tileType.land) {
      fill([255, 255, 255, 25]);
      circle(hex.x, hex.y, 86);
    }
  });
}

