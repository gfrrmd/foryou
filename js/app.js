/* UI flow: order, matching, trip, arrival chat, rating. */
(function () {
  const C = LG.config, $ = id => document.getElementById(id);
  let selected = 0, timers = [], stopAnim = null, route = null;
  const later = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(t); return t; };
  const clearTimers = () => { timers.forEach(clearTimeout); timers = []; };
  const fill = s => s.replace("{hi}", C.passengerName ? "Hi " + C.passengerName : "Hi there");

  function go(id) {
    document.querySelectorAll(".view").forEach(v => v.classList.toggle("active", v.id === id));
    $("sheet").scrollTop = 0;
    LG.map.refresh();
  }

  /* Order */
  $("fromName").textContent = C.fromLabel;
  $("toName").textContent = C.toLabel;
  $("services").innerHTML = LG.services.map((s, i) =>
    `<button class="svc${i === 0 ? " sel" : ""}" data-i="${i}"><span class="ic"><svg class="i"><use href="#${s.icon}"/></svg></span>` +
    `<span class="tx"><b>${s.name}</b><small>${s.desc}</small></span><span class="pr"><b>${s.price}</b><s>Rp 25.000</s></span></button>`).join("");
  $("services").addEventListener("click", e => {
    const b = e.target.closest(".svc"); if (!b) return;
    selected = +b.dataset.i;
    document.querySelectorAll(".svc").forEach(x => x.classList.toggle("sel", x === b));
    $("orderBtn").textContent = "Order " + LG.services[selected].name;
  });

  /* Matching */
  $("orderBtn").addEventListener("click", async () => {
    go("v-find");
    $("findText").textContent = "Looking for drivers nearby";
    const routing = LG.map.getRoute();
    later(() => { $("findText").textContent = "Driver found. Confirming your ride"; }, 2800);
    const [r] = await Promise.all([routing, new Promise(res => later(res, 4200))]);
    route = r; startTrip();
  });
  $("cancelBtn").addEventListener("click", () => { clearTimers(); go("v-order"); });

  /* Trip (no chat while driving) */
  function startTrip() {
    $("driverName").textContent = C.driverName;
    $("avatar").textContent = C.driverName.charAt(0).toUpperCase();
    go("v-trip");
    const mins = Math.max(2, route.dur / 60);
    stopAnim = LG.map.animate((p, left) => {
      $("bar").style.width = (p * 100) + "%";
      $("eta").textContent = p >= 1 ? "Arrived" : Math.max(1, Math.ceil(mins * (1 - p))) + " min";
      $("dist").textContent = (left / 1000).toFixed(1) + " km away";
      $("status").textContent = p === 0 ? "Driver accepted your order" : p < 0.92 ? (route.fallback ? "On the way (approximate route)" : "On the way to the destination") : "Arriving at the destination";
    }, () => { $("status").textContent = "You have arrived"; later(arrive, 1800); });
  }

  /* Arrival chat */
  const chat = $("chat");
  function bubble(text, who) {
    const d = document.createElement("div"), n = new Date();
    d.className = "msg " + who;
    d.innerHTML = `${text}<small>${String(n.getHours()).padStart(2, "0")}:${String(n.getMinutes()).padStart(2, "0")}</small>`;
    chat.appendChild(d); chat.scrollTop = chat.scrollHeight;
  }
  function typing(on) {
    let t = chat.querySelector(".typing");
    if (on && !t) { t = document.createElement("div"); t.className = "typing"; t.innerHTML = "<i></i><i></i><i></i>"; chat.appendChild(t); }
    if (!on && t) t.remove();
    chat.scrollTop = chat.scrollHeight;
  }
  function say(text, delay, cb) { typing(true); later(() => { typing(false); bubble(text, "d"); cb && cb(); }, delay); }
  let finaleShown = false;
  function finale() {
    if (finaleShown) return; finaleShown = true;
    $("chips").classList.remove("show");
    $("finale").classList.add("show");
    later(() => { $("sheet").scrollTo({ top: $("sheet").scrollHeight, behavior: "smooth" }); }, 100);
  }
  function arrive() {
    go("v-done"); chat.innerHTML = ""; finaleShown = false;
    $("finale").classList.remove("show"); $("chips").classList.remove("show");
    let t = 600;
    LG.arrival.forEach(m => { const at = t; later(() => say(fill(m), 1500), at); t += 1500 + 1100; });
    later(() => {
      $("chips").innerHTML = LG.quickReplies.map((r, i) => `<button data-i="${i}">${r.q}</button>`).join("");
      $("chips").classList.add("show");
      later(finale, 12000);
    }, t);
  }
  $("chips").addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    const r = LG.quickReplies[+b.dataset.i];
    $("chips").classList.remove("show");
    bubble(r.q, "u"); say(r.a, 1500, () => later(() => { finale(); hearts(10); }, 1200));
  });

  /* Rating and proposal */
  $("stars").innerHTML = Array.from({ length: 5 }, () => '<button aria-label="Rate"><svg class="i"><use href="#i-star"/></svg></button>').join("");
  $("stars").addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    const all = [...$("stars").children], n = all.indexOf(b);
    all.forEach((x, i) => x.classList.toggle("on", i <= n));
  });
  const labels = ["Let me think", "Are you sure?", "Okay, yes"];
  let tries = 0;
  $("later").addEventListener("click", () => {
    if (tries >= 2) { $("yes").click(); return; }
    $("later").textContent = labels[tries++];
    $("later").classList.add("shake"); setTimeout(() => $("later").classList.remove("shake"), 400);
  });
  $("yes").addEventListener("click", () => { go("v-end"); hearts(34); });
  $("againBtn").addEventListener("click", () => {
    clearTimers(); stopAnim && stopAnim(); tries = 0;
    $("later").textContent = "Maybe later";
    document.querySelectorAll("#stars button").forEach(x => x.classList.remove("on"));
    go("v-order"); LG.map.reset();
  });

  function hearts(n) {
    const box = $("hearts");
    for (let i = 0; i < n; i++) {
      const s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      s.setAttribute("class", "h"); s.innerHTML = '<use href="#i-heart"/>';
      s.style.left = Math.random() * 100 + "%";
      s.style.width = s.style.height = 14 + Math.random() * 18 + "px";
      s.style.animationDuration = 2.6 + Math.random() * 2.4 + "s";
      s.style.animationDelay = Math.random() * 0.8 + "s";
      box.appendChild(s); setTimeout(() => s.remove(), 6200);
    }
  }

  $("recenter").addEventListener("click", () => LG.map.recenter());
  LG.map.init();
})();
