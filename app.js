const rowsEl = document.getElementById("rows");
const monthSelect = document.getElementById("month-select");
const countrySelect = document.getElementById("country-select");
const destinationSelect = document.getElementById("destination-select");
const segButtons = document.querySelectorAll(".seg-btn");
const dayAfternoonToggle = document.getElementById("day-afternoon");
const resetBtn = document.getElementById("reset");

const estimatedEl = document.getElementById("estimated-total");
const currentEl = document.getElementById("current-total");
const currentMetaEl = document.getElementById("current-meta");
const varianceEl = document.getElementById("variance-total");
const paceMinuteEl = document.getElementById("pace-minute");
const paceHourEl = document.getElementById("pace-hour");
const goalEl = document.getElementById("goal-total");
const goalMetaEl = document.getElementById("goal-meta");
const filtersChip = document.getElementById("filters-chip");
const projectionAlertEl = document.getElementById("projection-alert");
const projectionTextEl = document.getElementById("projection-text");
const projectionDetailEl = document.getElementById("projection-detail");
const chartSvg = document.getElementById("line-chart");
const chartGrid = document.getElementById("chart-grid");
const estimatedLine = document.getElementById("estimated-line");
const currentLine = document.getElementById("current-line");
const estimatedDots = document.getElementById("estimated-dots");
const currentDots = document.getElementById("current-dots");
const chartAxis = document.getElementById("chart-axis");

const dataset = [
  {
    plant: "Pérez Millan",
    shift: "day",
    country: "ar",
    destination: "br",
    month: "01",
    estimated: 47,
    current: 58,
    shiftTarget: 96,
    status: "ok",
  },
  {
    plant: "Escobar",
    shift: "day",
    country: "ar",
    destination: "uy",
    month: "01",
    estimated: 47,
    current: 58,
    shiftTarget: 104,
    status: "ok",
  },
  {
    plant: "Pérez Millan",
    shift: "afternoon",
    country: "ar",
    destination: "us",
    month: "01",
    estimated: 47,
    current: 47,
    shiftTarget: 120,
    status: "ok",
  },
  {
    plant: "Escobar",
    shift: "afternoon",
    country: "ar",
    destination: "br",
    month: "01",
    estimated: 60,
    current: 55,
    shiftTarget: 125,
    status: "ok",
  },
  {
    plant: "Pérez Millan",
    shift: "day",
    country: "ar",
    destination: "cn",
    month: "07",
    estimated: 52,
    current: 49,
    shiftTarget: 98,
    status: "ok",
  },
];

const shiftRuntime = {
  day: {
    elapsedMinutes: 285,
    durationMinutes: 480,
    updatedAt: "10:45",
  },
  afternoon: {
    elapsedMinutes: 210,
    durationMinutes: 480,
    updatedAt: "17:30",
  },
  night: {
    elapsedMinutes: 180,
    durationMinutes: 480,
    updatedAt: "02:00",
  },
};

let filters = {
  shift: "all",
  month: "all",
  country: "ar",
  destination: "all",
};

const formatNumber = (value) => Math.round(value).toLocaleString("en-US");

const formatDecimal = (value, digits = 1) =>
  value.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });

const chartConfig = {
  width: 600,
  height: 180,
  padding: { x: 36, y: 24 },
  points: 7,
  labels: ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"],
};

const shiftLabels = {
  all: "Todos los turnos",
  day: "Día",
  afternoon: "Tarde",
  night: "Noche",
};

const countryLabels = {
  ar: "Argentina",
};

const destinationLabels = {
  all: "Todos los destinos",
  br: "Brasil",
  uy: "Uruguay",
  us: "Estados Unidos",
  cn: "China",
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

const calculateTurnMetrics = (rows) => {
  const shiftsInScope = rows.reduce((accumulator, row) => {
    if (!accumulator[row.shift]) {
      accumulator[row.shift] = {
        current: 0,
      };
    }

    accumulator[row.shift].current += row.current;
    return accumulator;
  }, {});

  const shiftKeys = Object.keys(shiftsInScope);
  const totalCurrent = rows.reduce((sum, row) => sum + row.current, 0);
  const totalTarget = rows.reduce((sum, row) => sum + (row.shiftTarget || 0), 0);

  const totalElapsedMinutes = shiftKeys.reduce((sum, shiftKey) => {
    return sum + (shiftRuntime[shiftKey]?.elapsedMinutes || 0);
  }, 0);

  const projectedTotal = shiftKeys.reduce((sum, shiftKey) => {
    const runtime = shiftRuntime[shiftKey];
    if (!runtime || !runtime.elapsedMinutes) {
      return sum;
    }

    const shiftProjection =
      (shiftsInScope[shiftKey].current / runtime.elapsedMinutes) * runtime.durationMinutes;
    return sum + shiftProjection;
  }, 0);

  let snapshotLabel = "Sin datos del turno";
  if (shiftKeys.length === 1) {
    snapshotLabel = `Actualizado ${shiftRuntime[shiftKeys[0]]?.updatedAt || "--:--"}`;
  } else if (shiftKeys.length > 1) {
    snapshotLabel = "Actualizado por corte de turno";
  }

  return {
    totalTarget,
    projectedTotal,
    pacePerMinute: totalElapsedMinutes ? totalCurrent / totalElapsedMinutes : 0,
    pacePerHour: totalElapsedMinutes ? (totalCurrent / totalElapsedMinutes) * 60 : 0,
    shiftKeys,
    snapshotLabel,
  };
};

const renderProjection = ({ totalTarget, projectedTotal, shiftKeys }) => {
  projectionAlertEl.classList.remove("green", "yellow", "red", "neutral");

  if (!shiftKeys.length) {
    projectionAlertEl.classList.add("neutral");
    projectionTextEl.textContent = "No hay produccion para los filtros seleccionados.";
    projectionDetailEl.textContent =
      "Ajusta el turno, mes o destino para volver a calcular la proyeccion.";
    goalMetaEl.textContent = "Sin objetivo precargado para el filtro actual";
    return;
  }

  if (!totalTarget) {
    projectionAlertEl.classList.add("neutral");
    projectionTextEl.textContent = "No hay un objetivo del turno precargado para este corte.";
    projectionDetailEl.textContent =
      "Carga el objetivo desde los datos provistos para habilitar la comparacion.";
    goalMetaEl.textContent = "Sin objetivo precargado";
    return;
  }

  const projectionPercent = (projectedTotal / totalTarget) * 100;
  const roundedProjected = formatNumber(projectedTotal);
  const formattedTarget = formatNumber(totalTarget);

  goalMetaEl.textContent =
    shiftKeys.length === 1
      ? `Precargado para turno ${shiftLabels[shiftKeys[0]]}`
      : "Suma de objetivos precargados del filtro";

  if (projectionPercent >= 100) {
    projectionAlertEl.classList.add("green");
  } else if (projectionPercent >= 90) {
    projectionAlertEl.classList.add("yellow");
  } else {
    projectionAlertEl.classList.add("red");
  }

  projectionTextEl.textContent = `Se espera llegar a ${formatDecimal(
    projectionPercent,
    0
  )}% del objetivo del turno.`;
  projectionDetailEl.textContent = `${roundedProjected} cuartos proyectados sobre ${formattedTarget}.`;
};

const renderRows = (rows) => {
  rowsEl.innerHTML = "";

  rows.forEach((row) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row.plant}</td>
      <td>${shiftLabels[row.shift]}</td>
      <td>${destinationLabels[row.destination]}</td>
      <td>${monthLabels[row.month] || row.month}</td>
      <td>${formatNumber(row.estimated)}</td>
      <td>${formatNumber(row.current)}</td>
      <td><span class="status ${row.status}">${row.status === "ok" ? "En objetivo" : "Atención"}</span></td>
    `;
    rowsEl.appendChild(tr);
  });
};

const applyFilters = () => {
  let rows = dataset;

  if (filters.shift !== "all") {
    rows = rows.filter((row) => row.shift === filters.shift);
  }
  if (filters.month !== "all") {
    rows = rows.filter((row) => row.month === filters.month);
  }
  rows = rows.filter((row) => row.country === "ar");
  if (filters.destination !== "all") {
    rows = rows.filter((row) => row.destination === filters.destination);
  }

  const totalEstimated = rows.reduce((sum, row) => sum + row.estimated, 0);
  const totalCurrent = rows.reduce((sum, row) => sum + row.current, 0);
  const variance = totalEstimated ? (totalCurrent / totalEstimated - 1) * 100 : 0;
  const turnMetrics = calculateTurnMetrics(rows);

  estimatedEl.textContent = formatNumber(totalEstimated || 0);
  currentEl.textContent = formatNumber(totalCurrent || 0);
  currentMetaEl.textContent = turnMetrics.snapshotLabel;
  varianceEl.textContent = `${formatDecimal(variance, 1)}%`;
  paceMinuteEl.textContent = formatDecimal(turnMetrics.pacePerMinute, 2);
  paceHourEl.textContent = formatDecimal(turnMetrics.pacePerHour, 1);
  goalEl.textContent = formatNumber(turnMetrics.totalTarget || 0);

  const shiftLabel = shiftLabels[filters.shift] || "Todos los turnos";
  const destinationLabel = destinationLabels[filters.destination] || "Todos los destinos";
  filtersChip.textContent = `${shiftLabel} • ${countryLabels.ar} • ${destinationLabel}`;

  renderProjection(turnMetrics);
  renderRows(rows);
  renderChart(rows);
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

countrySelect.addEventListener("change", () => {
  filters.country = "ar";
  countrySelect.value = "ar";
  applyFilters();
});

destinationSelect.addEventListener("change", (event) => {
  filters.destination = event.target.value;
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
  filters = { shift: "all", month: "all", country: "ar", destination: "all" };
  segButtons.forEach((btn) => btn.classList.toggle("active", btn.dataset.shift === "all"));
  monthSelect.value = "all";
  countrySelect.value = "ar";
  destinationSelect.value = "all";
  dayAfternoonToggle.checked = false;
  applyFilters();
});

countrySelect.value = "ar";
countrySelect.disabled = true;
applyFilters();
