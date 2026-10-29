document.addEventListener("DOMContentLoaded", () => {
  "use strict";
  const C = window.TresTurnCore;
  const KEY = "tresturn.settings.v1";
  const $ = id => document.getElementById(id);
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  let viewMonth = new Date(today.getFullYear(), today.getMonth(), 1, 12);
  let settings;
  try { settings = C.normalizeSettings(JSON.parse(localStorage.getItem(KEY) || "null")); }
  catch { settings = C.normalizeSettings(null); }

  const format = (date, options) => new Intl.DateTimeFormat("es-AR", options).format(date);
  const safeSave = () => { try { localStorage.setItem(KEY, JSON.stringify(settings)); } catch {} };
  const shiftNames = { morning: "Mañana", afternoon: "Tarde", night: "Noche", endnight: "Salida nocturna" };
  let toastTimer;
  function toast(message) {
    const el = $("toast");
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 4200);
  }
  function selectedTeamForShift(shift) {
    return C.assignments(today, settings)[shift];
  }
  function renderWeek() {
    const start = C.monday(today);
    const end = C.addDays(start, 6);
    $("weekRange").textContent = format(start, {day:"numeric",month:"short"}) + " — " + format(end, {day:"numeric",month:"short",year:"numeric"});
    const assignments = C.assignments(today, settings);
    $("shiftOverview").replaceChildren(...C.SHIFTS.map(shift => {
      const team = assignments[shift];
      const meta = C.SHIFT_META[shift];
      const card = document.createElement("article");
      card.className = "shift-card " + shift + (settings.team === team ? " is-focus" : "");
      card.innerHTML = '<div class="shift-top"><span>Equipo</span><span class="team-badge"></span></div><h3></h3><div class="shift-time"></div><p class="shift-days"></p>';
      card.querySelector(".team-badge").textContent = team;
      card.querySelector("h3").textContent = meta.label;
      card.querySelector(".shift-time").textContent = meta.time;
      card.querySelector(".shift-days").textContent = meta.days;
      return card;
    }));
  }
  function createChip(shift, team, endNight = false) {
    const span = document.createElement("span");
    span.className = "slot " + shift + (settings.team !== "all" && settings.team !== team ? " dimmed" : "");
    span.textContent = endNight ? "↳ Noche " + team + " sale 06" : ({morning:"M",afternoon:"T",night:"N"}[shift] + " · Equipo " + team);
    return span;
  }
  function renderCalendar() {
    const first = viewMonth;
    $("monthTitle").textContent = format(first, {month:"long",year:"numeric"});
    const start = C.monday(first);
    const last = new Date(first.getFullYear(), first.getMonth() + 1, 0, 12);
    const weeks = Math.ceil((C.weekDistance(last, first) * 7 + (last.getDay() + 6) % 7 + 1) / 7);
    // Número exacto de semanas de cuadrícula (habitualmente 4, 5 o 6).
    const offset = (first.getDay() + 6) % 7;
    const cells = Math.ceil((offset + last.getDate()) / 7) * 7;
    const grid = document.createDocumentFragment();
    for (let n = 0; n < cells; n++) {
      const date = C.addDays(start, n);
      const schedule = C.schedule(date, settings);
      const cell = document.createElement("button");
      const inMonth = date.getMonth() === first.getMonth();
      const isToday = C.dateKey(date) === C.dateKey(today);
      cell.type = "button";
      cell.className = "day-cell" + (inMonth ? "" : " outside") + (isToday ? " today" : "");
      cell.dataset.date = C.dateKey(date);
      const number = document.createElement("span");
      number.className = "day-number";
      number.textContent = String(date.getDate());
      cell.append(number);
      for (const shift of C.SHIFTS) {
        const started = schedule.starts.find(item => item.shift === shift);
        if (started) cell.append(createChip(shift, started.team));
      }
      if (date.getDay() === 6 && schedule.overnightEnd) {
        cell.append(createChip("endnight", schedule.overnightEnd.team, true));
      }
      if (!schedule.starts.length) {
        const empty = document.createElement("span");
        empty.className = "no-shift";
        empty.textContent = "Franco";
        cell.append(empty);
      }
      const assignment = C.assignments(date, settings);
      cell.setAttribute("aria-label", format(date,{weekday:"long",day:"numeric",month:"long"}) + "; " +
        (date.getDay() === 0 ? "franco" : schedule.starts.map(s => shiftNames[s.shift] + ": equipo " + s.team).join("; ")) +
        (date.getDay() === 6 && schedule.overnightEnd ? "; sale noche equipo " + schedule.overnightEnd.team : ""));
      grid.append(cell);
    }
    $("calendarGrid").replaceChildren(grid);
  }
  function showDay(date) {
    const s = C.schedule(date, settings);
    $("dialogDate").textContent = format(date, {weekday:"long",day:"numeric",month:"long",year:"numeric"});
    const lines = [...(s.overnightEnd ? [s.overnightEnd] : []), ...s.starts];
    const body = $("dialogBody");
    body.replaceChildren();
    if (!lines.length) {
      const p = document.createElement("p");
      p.className = "dialog-empty";
      p.textContent = "Domingo franco para los tres equipos.";
      body.append(p);
    } else {
      const list = document.createElement("div");
      list.className = "dialog-list";
      for (const line of lines) {
        const row = document.createElement("div");
        row.className = "dialog-row " + line.shift;
        row.innerHTML = '<span class="dialog-color"></span><div class="dialog-main"><strong></strong><small></small></div><span class="dialog-team"></span>';
        row.querySelector("strong").textContent = shiftNames[line.shift] + " · " + line.label;
        row.querySelector("small").textContent = line.detail;
        row.querySelector(".dialog-team").textContent = "Equipo " + line.team;
        list.append(row);
      }
      body.append(list);
    }
    const dialog = $("dayDialog");
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  }
  function render() {
    $("anchorDate").value = settings.anchorDate;
    $("rotationDirection").value = String(settings.direction);
    $("teamFilter").value = settings.team;
    renderWeek();
    renderCalendar();
  }
  $("calendarGrid").addEventListener("click", e => {
    const cell = e.target.closest("button[data-date]");
    if (cell) {
      const date = C.parseDate(cell.dataset.date);
      if (date) showDay(date);
    }
  });
  $("prevMonth").addEventListener("click", () => { viewMonth = new Date(viewMonth.getFullYear(),viewMonth.getMonth()-1,1,12);renderCalendar(); });
  $("nextMonth").addEventListener("click", () => { viewMonth = new Date(viewMonth.getFullYear(),viewMonth.getMonth()+1,1,12);renderCalendar(); });
  const goToday = () => { viewMonth = new Date(today.getFullYear(),today.getMonth(),1,12);renderCalendar(); };
  $("todayTop").addEventListener("click", goToday);
  $("todayMonth").addEventListener("click", goToday);
  $("teamFilter").addEventListener("change", e => { settings.team = e.target.value; settings = C.normalizeSettings(settings);safeSave();render(); });
  $("anchorDate").addEventListener("change", e => {
    if (!C.parseDate(e.target.value)) { toast("Ingresá una fecha válida.");render();return; }
    settings.anchorDate = e.target.value;
    safeSave();render();
  });
  $("rotationDirection").addEventListener("change", e => { settings.direction = Number(e.target.value) === -1 ? -1 : 1;safeSave();render(); });
  $("resetSettings").addEventListener("click", () => { settings = C.normalizeSettings(null);safeSave();render();toast("Configuración restaurada."); });
  const closeDialog = () => { const d = $("dayDialog");if (typeof d.close === "function") d.close();else d.removeAttribute("open"); };
  $("closeDialog").addEventListener("click", closeDialog);
  $("closeDialogBottom").addEventListener("click", closeDialog);
  $("dayDialog").addEventListener("click", e => { if (e.target === $("dayDialog")) closeDialog(); });

  let installPrompt = null;
  window.addEventListener("beforeinstallprompt", e => { e.preventDefault();installPrompt = e; });
  $("installBtn").addEventListener("click", async () => {
    if (installPrompt) {
      const p = installPrompt;installPrompt = null;
      await p.prompt();
      return;
    }
    toast(/iphone|ipad|ipod/i.test(navigator.userAgent)
      ? "En Safari, tocá Compartir y luego «Agregar a inicio»."
      : "Abrí el menú del navegador y elegí «Instalar aplicación» o «Agregar a pantalla de inicio».");
  });
  window.addEventListener("appinstalled", () => toast("¡TresTurn instalada!"));
  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
    window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js", {scope:"./"}).catch(() => {
      console.warn("No se pudo registrar el servicio para modo offline.");
    }));
  }
  render();
});