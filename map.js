/* Map, OSRM routing and driver animation. */
(function () {
  const C = LG.config;
  let map, routeLine, doneLine, driver, following = true, route = null;

  function icon(html, size, anchor) {
    return L.divIcon({ className: "", html, iconSize: size, iconAnchor: anchor });
  }

  function padding() {
    const s = document.getElementById("sheet");
    if (window.innerWidth >= 768) return { paddingTopLeft: [s.offsetWidth + 70, 90], paddingBottomRight: [50, 50] };
    return { paddingTopLeft: [30, 90], paddingBottomRight: [30, s.offsetHeight + 30] };
  }

  function init() {
    const state = document.getElementById("mapState");
    map = L.map("map", { zoomControl: false, attributionControl: false, zoomSnap: 0.5 });
    L.control.attribution({ position: "topright", prefix: false }).addTo(map);
    const tiles = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>'
    }).addTo(map);
    tiles.on("load", () => state.classList.add("hide"));
    tiles.on("tileerror", () => { state.textContent = "Map tiles could not be loaded. Check your connection."; });
    L.marker(C.start, { icon: icon('<div class="o-dot"></div>', [20, 20], [10, 10]), interactive: false }).addTo(map);
    L.marker(C.end, { icon: icon('<div class="d-pin"><span>You</span><svg class="i"><use href="#i-pin"/></svg></div>', [60, 64], [30, 62]), interactive: false }).addTo(map);
    map.fitBounds([C.start, C.end], padding());
    map.on("dragstart", () => { following = false; });
    window.addEventListener("resize", () => map.invalidateSize());
  }

  async function getRoute() {
    const [a, b] = [C.start, C.end];
    const url = `https://router.project-osrm.org/route/v1/driving/${a[1]},${a[0]};${b[1]},${b[0]}?overview=full&geometries=geojson`;
    try {
      const ctl = new AbortController();
      const timer = setTimeout(() => ctl.abort(), 9000);
      const res = await fetch(url, { signal: ctl.signal });
      clearTimeout(timer);
      const json = await res.json();
      const r = json.routes[0];
      route = { pts: r.geometry.coordinates.map(c => [c[1], c[0]]), dur: r.duration, dist: r.distance, fallback: false };
    } catch (e) {
      const d = map.distance(a, b);
      route = { pts: [a, b], dur: d / 7, dist: d, fallback: true };
    }
    return route;
  }

  function drawRoute() {
    [routeLine, doneLine].forEach(l => l && map.removeLayer(l));
    L.polyline(route.pts, { color: "#fff", weight: 11, opacity: 0.95, lineCap: "round", lineJoin: "round" }).addTo(map);
    routeLine = L.polyline(route.pts, { color: "#00AA13", weight: 6, lineCap: "round", lineJoin: "round" }).addTo(map);
    doneLine = L.polyline([], { color: "#9CA3AF", weight: 6, lineCap: "round", lineJoin: "round" }).addTo(map);
  }

  function bearing(a, b) {
    const r = x => x * Math.PI / 180;
    const y = Math.sin(r(b[1] - a[1])) * Math.cos(r(b[0]));
    const x = Math.cos(r(a[0])) * Math.sin(r(b[0])) - Math.sin(r(a[0])) * Math.cos(r(b[0])) * Math.cos(r(b[1] - a[1]));
    return Math.atan2(y, x) * 180 / Math.PI;
  }

  function animate(onTick, onDone) {
    drawRoute();
    const pts = route.pts, cum = [0];
    for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + map.distance(pts[i - 1], pts[i]));
    const total = cum[cum.length - 1] || 1;
    driver = L.marker(pts[0], {
      icon: icon('<div class="veh"><i></i><svg class="i"><use href="#i-nav"/></svg></div>', [52, 52], [26, 26]),
      zIndexOffset: 1000, interactive: false
    }).addTo(map);
    following = true;
    map.setView(pts[0], C.followZoom, { animate: false });
    let idx = 0, angle = 0, raf = 0, stopped = false;
    const t0 = performance.now();

    function frame(now) {
      if (stopped) return;
      const p = Math.min(1, (now - t0) / C.tripMs), target = p * total;
      while (idx < pts.length - 2 && cum[idx + 1] < target) idx++;
      const seg = (cum[idx + 1] - cum[idx]) || 1;
      const f = Math.min(1, Math.max(0, (target - cum[idx]) / seg));
      const a = pts[idx], b = pts[Math.min(idx + 1, pts.length - 1)];
      const pos = [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
      driver.setLatLng(pos);
      const look = pts[Math.min(idx + 4, pts.length - 1)];
      if (map.distance(pos, look) > 8) {
        const want = bearing(pos, look);
        let d = ((want - angle + 540) % 360) - 180;
        angle += d * 0.15;
      }
      const v = driver.getElement() && driver.getElement().querySelector("svg");
      if (v) v.style.transform = `rotate(${angle}deg)`;
      doneLine.setLatLngs(pts.slice(0, idx + 1).concat([pos]));
      if (following) map.setView(pos, map.getZoom(), { animate: false });
      onTick(p, total * (1 - p));
      if (p < 1) raf = requestAnimationFrame(frame); else onDone();
    }
    raf = requestAnimationFrame(frame);
    return () => { stopped = true; cancelAnimationFrame(raf); };
  }

  function fitRoute() { following = false; map.fitBounds(routeLine ? routeLine.getBounds() : [C.start, C.end], { ...padding(), animate: true }); }
  function recenter() {
    if (driver && document.getElementById("v-trip").classList.contains("active")) { following = true; map.setView(driver.getLatLng(), C.followZoom, { animate: true }); }
    else fitRoute();
  }
  function reset() {
    [routeLine, doneLine, driver].forEach(l => l && map.removeLayer(l));
    routeLine = doneLine = driver = null;
    map.fitBounds([C.start, C.end], padding());
  }

  LG.map = { init, getRoute, animate, fitRoute, recenter, reset };
})();
