/* TresTurn: lógica pura de turnos. No depende del DOM ni de la zona horaria UTC. */
(function (global) {
  "use strict";
  const TEAMS = ["A", "B", "C"];
  const SHIFTS = ["morning", "afternoon", "night"];
  const DEFAULTS = Object.freeze({ anchorDate: "2026-10-26", direction: 1, team: "all" });
  const SHIFT_META = Object.freeze({
    morning: { label: "Mañana", time: "06:00–14:00", days: "Lun a sáb" },
    afternoon: { label: "Tarde", time: "14:00–22:00", days: "Lun a vie" },
    night: { label: "Noche", time: "22:00–06:00", days: "Lun a vie" }
  });
  const mod = (n, m) => ((n % m) + m) % m;
  function parseDate(iso) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(iso || "")) return null;
    const [y, m, d] = iso.split("-").map(Number);
    const date = new Date(y, m - 1, d, 12);
    return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d ? date : null;
  }
  function addDays(date, n) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + n, 12);
  }
  function dateKey(date) {
    const pad = n => String(n).padStart(2, "0");
    return date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate());
  }
  function monday(date) {
    return addDays(date, -((date.getDay() + 6) % 7));
  }
  function utcDay(date) {
    return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000;
  }
  function weekDistance(date, anchorDate) {
    return Math.round((utcDay(monday(date)) - utcDay(monday(anchorDate))) / 7);
  }
  function normalizeSettings(raw) {
    const o = raw && typeof raw === "object" ? raw : {};
    return {
      anchorDate: parseDate(o.anchorDate) ? o.anchorDate : DEFAULTS.anchorDate,
      direction: Number(o.direction) === -1 ? -1 : 1,
      team: ["all", ...TEAMS].includes(o.team) ? o.team : "all"
    };
  }
  function assignments(date, config) {
    const settings = normalizeSettings(config);
    const anchor = parseDate(settings.anchorDate);
    const delta = weekDistance(date, anchor) * settings.direction;
    const result = {};
    TEAMS.forEach((team, index) => {
      result[SHIFTS[mod(index + delta, 3)]] = team;
    });
    return result;
  }
  function schedule(date, config) {
    const day = date.getDay(); // 0 domingo ... 6 sábado
    const current = assignments(date, config);
    const starts = [];
    if (day >= 1 && day <= 6) starts.push({ shift: "morning", team: current.morning, label: "06:00–14:00", detail: "Empieza hoy" });
    if (day >= 1 && day <= 5) {
      starts.push({ shift: "afternoon", team: current.afternoon, label: "14:00–22:00", detail: "Empieza hoy" });
      starts.push({ shift: "night", team: current.night, label: "22:00–06:00", detail: "Termina mañana a las 06:00" });
    }
    // La madrugada de martes a sábado pertenece a la noche iniciada ayer.
    const previousDay = addDays(date, -1);
    const previousWasNightStart = previousDay.getDay() >= 1 && previousDay.getDay() <= 5;
    const overnightEnd = previousWasNightStart
      ? { shift: "endnight", team: assignments(previousDay, config).night, label: "00:00–06:00", detail: "Salida de la noche iniciada ayer" }
      : null;
    return { starts, overnightEnd };
  }
  global.TresTurnCore = { TEAMS, SHIFTS, DEFAULTS, SHIFT_META, parseDate, addDays, dateKey, monday, weekDistance, normalizeSettings, assignments, schedule };
})(typeof window !== "undefined" ? window : globalThis);