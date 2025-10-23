const rows = 10, cols = 10;
const grid = [];
let start = [0, 0];
let goal = [9, 9];

const gridContainer = document.getElementById("grid");
const stepCounter = document.getElementById("steps");
const timeCounter = document.getElementById("time");
const compareBody = document.getElementById("compare-body");

const results = { GBFS: { steps: "-", time: "-" }, Dijkstra: { steps: "-", time: "-" } };

for (let r = 0; r < rows; r++) {
  grid[r] = [];
  for (let c = 0; c < cols; c++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.dataset.row = r;
    cell.dataset.col = c;
    cell.addEventListener("click", toggleWall);
    gridContainer.appendChild(cell);
    grid[r][c] = { wall: false, el: cell, row: r, col: c };
  }
}

grid[0][0].el.classList.add("start");
grid[9][9].el.classList.add("goal");

function toggleWall(e) {
  const cell = e.target;
  if (cell.classList.contains("start") || cell.classList.contains("goal")) return;
  cell.classList.toggle("wall");
  const r = cell.dataset.row, c = cell.dataset.col;
  grid[r][c].wall = cell.classList.contains("wall");
}

function heuristic(a, b) {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

async function runGBFS() {
  await searchAlgorithm("GBFS");
}

async function runDijkstra() {
  await searchAlgorithm("Dijkstra");
}

async function searchAlgorithm(type) {
  resetVisited();
  const open = [grid[start[0]][start[1]]];
  const cameFrom = new Map();
  const cost = new Map();
  cost.set(grid[start[0]][start[1]], 0);
  
  let steps = 0;
  const startTime = performance.now();

  while (open.length > 0) {
    open.sort((a, b) => {
      if (type === "GBFS") return heuristic(a, grid[goal[0]][goal[1]]) - heuristic(b, grid[goal[0]][goal[1]]);
      if (type === "Dijkstra") return cost.get(a) - cost.get(b);
    });

    const current = open.shift();
    const el = current.el;

    if (!el.classList.contains("start") && !el.classList.contains("goal")) {
      el.classList.add("visited");
      steps++;
    }

    stepCounter.textContent = steps;

    if (current.row === goal[0] && current.col === goal[1]) {
      const endTime = performance.now();
      const totalTime = (endTime - startTime).toFixed(2);
      timeCounter.textContent = totalTime;
      drawPath(cameFrom, current);
      saveResult(type, steps, totalTime);
      return;
    }

    for (let [dr, dc] of [[1,0],[-1,0],[0,1],[0,-1]]) {
      const nr = current.row + dr, nc = current.col + dc;
      if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;
      const next = grid[nr][nc];
      if (next.wall) continue;

      const newCost = cost.get(current) + 1;
      if (!cost.has(next) || newCost < cost.get(next)) {
        cost.set(next, newCost);
        cameFrom.set(next, current);
        open.push(next);
      }
    }

    await new Promise(r => setTimeout(r, 40)); // animasi
  }

  const endTime = performance.now();
  const totalTime = (endTime - startTime).toFixed(2);
  timeCounter.textContent = totalTime;
  saveResult(type, steps, totalTime);
}

function drawPath(cameFrom, current) {
  while (cameFrom.has(current)) {
    current = cameFrom.get(current);
    if (!current.el.classList.contains("start"))
      current.el.classList.add("path");
  }
}

function saveResult(type, steps, time) {
  results[type].steps = steps;
  results[type].time = time;
  updateComparisonTable();
}

function updateComparisonTable() {
  const rowsHTML = `
    <tr><td>GBFS</td><td>${results.GBFS.steps}</td><td>${results.GBFS.time}</td></tr>
    <tr><td>Dijkstra</td><td>${results.Dijkstra.steps}</td><td>${results.Dijkstra.time}</td></tr>
  `;
  compareBody.innerHTML = rowsHTML;
}

function resetVisited() {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const el = grid[r][c].el;
      el.classList.remove("visited", "path");
    }
  }
  stepCounter.textContent = 0;
  timeCounter.textContent = 0;
}

function resetGrid() {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const el = grid[r][c].el;
      el.className = "cell";
      grid[r][c].wall = false;
    }
  }
  grid[0][0].el.classList.add("start");
  grid[9][9].el.classList.add("goal");
  stepCounter.textContent = 0;
  timeCounter.textContent = 0;
}
