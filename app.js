const rowsEl = document.getElementById("rows");
const monthSelect = document.getElementById("month-select");
const countrySelect = document.getElementById("country-select");
const segButtons = document.querySelectorAll(".seg-btn");
const dayAfternoonToggle = document.getElementById("day-afternoon");
const resetBtn = document.getElementById("reset");

const estimatedEl = document.getElementById("estimated-total");
const currentEl = document.getElementById("current-total");
const varianceEl = document.getElementById("variance-total");
const filtersChip = document.getElementById("filters-chip");
const chartSvg = document.getElementById("line-chart");
const chartGrid = document.getElementById("chart-grid");
const estimatedLine = document.getElementById("estimated-line");
const currentLine = document.getElementById("current-line");
const estimatedDots = document.getElementById("estimated-dots");
const currentDots = document.getElementById("current-dots");
const chartAxis = document.getElementById("chart-axis");

const dataset = [
   {
    plant: " Pérez Millan",
    shift: "day",
    country: "ar",
    month: "01",
    estimated: 47,
    current: 58,
    status: "ok",
  },
  {
    plant: " Escobar",
    shift: "day",
    country: "ar",
    month: "01",
    estimated: 47,
    current: 58,
    status: "ok",
  },   {
    plant: " Pérez Millan",
    shift: "afternoon",
    country: "ar",
    month: "01",
    estimated: 47,
    current: 47,
    status: "ok",
  },
  {
    plant: " Escobar",
    shift: "afternoon",
    country: "ar",
    month: "01",
    estimated: 60,
    current: 55,
    status: "ok",
  }
];

let filters = {
  shift: "all",
  month: "all",
  country: "all",
};

const formatNumber = (value) => value.toLocaleString("en-US");

const chartConfig = {
  width: 600,
  height: 180,
  padding: { x: 36, y: 24 },
  points: 7,
  labels: ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"],
};

const generateSeries = (total, points, wobble) => {
  if (total === 0) {
    return Array.from({ length: points }, () => 0);
  }

  const base = total / points;
  return Array.from({ length: points }, (_, index) => {
    const wave = Math.sin((index / (points - 1)) * Math.PI) * wobble;
    const variance = 1 + wave - wobble / 2;
    return Math.max(0, Math.round(base * variance));
  });
};

const buildPath = (series, minValue, maxValue) => {
  const { width, height, padding, points } = chartConfig;
  const plotWidth = width - padding.x * 2;
  const plotHeight = height - padding.y * 2;
  const step = plotWidth / (points - 1);

  return series
    .map((value, index) => {
      const x = padding.x + step * index;
      const range = maxValue - minValue || 1;
      const yRatio = (value - minValue) / range;
      const y = height - padding.y - yRatio * plotHeight;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
};

const renderDots = (series, container, minValue, maxValue) => {
  const { width, height, padding, points } = chartConfig;
  const plotWidth = width - padding.x * 2;
  const plotHeight = height - padding.y * 2;
  const step = plotWidth / (points - 1);

  container.innerHTML = "";
  series.forEach((value, index) => {
    const x = padding.x + step * index;
    const range = maxValue - minValue || 1;
    const yRatio = (value - minValue) / range;
    const y = height - padding.y - yRatio * plotHeight;
    const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    dot.setAttribute("cx", x.toFixed(1));
    dot.setAttribute("cy", y.toFixed(1));
    dot.setAttribute("r", "4.2");
    container.appendChild(dot);
  });
};

const renderGrid = () => {
  const { width, height, padding } = chartConfig;
  const rows = 4;
  chartGrid.innerHTML = "";

  for (let i = 0; i <= rows; i += 1) {
    const y = padding.y + ((height - padding.y * 2) / rows) * i;
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", padding.x);
    line.setAttribute("x2", width - padding.x);
    line.setAttribute("y1", y.toFixed(1));
    line.setAttribute("y2", y.toFixed(1));
    chartGrid.appendChild(line);
  }
};

const renderAxis = () => {
  chartAxis.innerHTML = "";
  chartConfig.labels.forEach((label) => {
    const span = document.createElement("span");
    span.textContent = label;
    chartAxis.appendChild(span);
  });
};

const renderChart = (rows) => {
  if (!chartSvg) {
    return;
  }

  const totalEstimated = rows.reduce((sum, row) => sum + row.estimated, 0);
  const totalCurrent = rows.reduce((sum, row) => sum + row.current, 0);
  const estimatedSeries = generateSeries(totalEstimated, chartConfig.points, 0.22);
  const currentSeries = generateSeries(totalCurrent, chartConfig.points, 0.18);
  const minValue = Math.min(...estimatedSeries, ...currentSeries);
  const maxValue = Math.max(...estimatedSeries, ...currentSeries);

  renderGrid();
  renderAxis();

  estimatedLine.setAttribute("d", buildPath(estimatedSeries, minValue, maxValue));
  currentLine.setAttribute("d", buildPath(currentSeries, minValue, maxValue));
  renderDots(estimatedSeries, estimatedDots, minValue, maxValue);
  renderDots(currentSeries, currentDots, minValue, maxValue);
};

const shiftLabels = {
  all: "Todos los turnos",
  day: "Día",
  afternoon: "Tarde",
  night: "Noche",
};

const countryLabels = {
  all: "Todos los países",
  ar: "Argentina",
  br: "Brasil",
  uy: "Uruguay",
  us: "Estados Unidos",
};

const monthLabels = {
  "01": "Enero",
  "02": "Febrero",
  "03": "Marzo",
  "04": "Abril",
  "05": "Mayo",
  "06": "Junio",
  "07": "Julio",
  "08": "Agosto",
  "09": "Septiembre",
  "10": "Octubre",
  "11": "Noviembre",
  "12": "Diciembre",
};

const applyFilters = () => {
  let rows = dataset;

  if (filters.shift !== "all") {
    rows = rows.filter((row) => row.shift === filters.shift);
  }
  if (filters.month !== "all") {
    rows = rows.filter((row) => row.month === filters.month);
  }
  if (filters.country !== "all") {
    rows = rows.filter((row) => row.country === filters.country);
  }

  const totalEstimated = rows.reduce((sum, row) => sum + row.estimated, 0);
  const totalCurrent = rows.reduce((sum, row) => sum + row.current, 0);

  estimatedEl.textContent = formatNumber(totalEstimated || 0);
  currentEl.textContent = formatNumber(totalCurrent || 0);

  const variance = totalEstimated
    ? ((totalCurrent / totalEstimated - 1) * 100).toFixed(1)
    : "0.0";
  varianceEl.textContent = `${variance}%`;

  const shiftLabel = shiftLabels[filters.shift] || "Todos los turnos";
  const countryLabel = countryLabels[filters.country] || "Todos los países";
  filtersChip.textContent = `${shiftLabel} • ${countryLabel}`;

  renderRows(rows);
  renderChart(rows);
};

const renderRows = (rows) => {
  rowsEl.innerHTML = "";

  rows.forEach((row) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row.plant}</td>
      <td>${shiftLabels[row.shift]}</td>
      <td>${countryLabels[row.country]}</td>
      <td>${monthLabels[row.month] || row.month}</td>
      <td>${formatNumber(row.estimated)}</td>
      <td>${formatNumber(row.current)}</td>
      <td><span class="status ${row.status}">${row.status === "ok" ? "En objetivo" : "Atención"}</span></td>
    `;
    rowsEl.appendChild(tr);
  });
};

segButtons.forEach((button) => {
  button.addEventListener("click", () => {
    segButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
    filters.shift = button.dataset.shift;
    applyFilters();
  });
});

monthSelect.addEventListener("change", (event) => {
  filters.month = event.target.value;
  applyFilters();
});

countrySelect.addEventListener("change", (event) => {
  filters.country = event.target.value;
  applyFilters();
});

dayAfternoonToggle.addEventListener("change", (event) => {
  const forcedShift = event.target.checked ? "afternoon" : "day";
  filters.shift = forcedShift;
  segButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.shift === forcedShift);
  });
  applyFilters();
});

resetBtn.addEventListener("click", () => {
  filters = { shift: "all", month: "all", country: "all" };
  segButtons.forEach((btn) => btn.classList.toggle("active", btn.dataset.shift === "all"));
  monthSelect.value = "all";
  countrySelect.value = "all";
  dayAfternoonToggle.checked = false;
  applyFilters();
});

applyFilters();
