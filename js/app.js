/* UI flow: order, matching, trip, full-screen chat, rating, text-only call. */
(function () {
  const C = LG.config, $ = id => document.getElementById(id);
  let selected = 0, timers = [], callTimers = [], stopAnim = null, route = null, rated = false, ratePending = false, tick = null, side = 0, inCall = false;
  const later = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(t); return t; };
  const callLater = (fn, ms) => { const t = setTimeout(fn, ms); callTimers.push(t); return t; };
  const clearCall = () => { callTimers.forEach(clearTimeout); callTimers = []; clearInterval(tick); tick = null; };
  const clearTimers = () => { timers.forEach(clearTimeout); timers = []; clearCall(); };
  const fill = s => s.replace("{hi}", C.passengerName ? "Hi " + C.passengerName : "Hi there");
  const initial = C.driverName.charAt(0).toUpperCase();

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
    [$("avatar"), $("chatAvatar"), $("callAvatar")].forEach(a => a.textContent = initial);
    $("chatName").textContent = $("callName").textContent = C.driverName;
    go("v-trip");
    const mins = Math.max(2, route.dur / 60);
    stopAnim = LG.map.animate((p, left) => {
      $("bar").style.width = (p * 100) + "%";
      $("eta").textContent = p >= 1 ? "Arrived" : Math.max(1, Math.ceil(mins * (1 - p))) + " min";
      $("dist").textContent = (left / 1000).toFixed(1) + " km away";
      $("status").textContent = p === 0 ? "Driver accepted your order" : p < 0.92 ? (route.fallback ? "On the way (approximate route)" : "On the way to the destination") : "Arriving at the destination";
    }, () => { $("status").textContent = "You have arrived"; later(arrive, 1800); });
  }

  /* Full-screen chat (after arrival, slow pacing) */
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
  const typeTime = s => 1400 + s.length * 30;
  function say(text, cb) { typing(true); later(() => { typing(false); bubble(text, "d"); cb && cb(); }, typeTime(text)); }

  function arrive() {
    $("chatScreen").classList.add("show");
    chat.innerHTML = ""; rated = ratePending = false;
    $("chips").classList.remove("show"); $("rate").classList.remove("show");
    let t = 1000;
    LG.arrival.forEach(m => { const text = fill(m), at = t; later(() => say(text), at); t += typeTime(text) + 1600; });
    later(() => {
      $("chips").innerHTML = LG.quickReplies.map((r, i) => `<button data-i="${i}">${r.q}</button>`).join("");
      $("chips").classList.add("show");
      later(showRate, 16000);
    }, t);
  }
  function showRate() {
    if (ratePending) return; ratePending = true;
    $("chips").classList.remove("show"); $("rate").classList.add("show"); hearts(8);
  }
  $("chips").addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    const r = LG.quickReplies[+b.dataset.i];
    $("chips").classList.remove("show");
    bubble(r.q, "u"); later(() => say(r.a, () => later(showRate, 1800)), 900);
  });

  /* Rating, then incoming call */
  $("stars").innerHTML = Array.from({ length: 5 }, () => '<button aria-label="Rate"><svg class="i"><use href="#i-star"/></svg></button>').join("");
  $("stars").addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    const all = [...$("stars").children], n = all.indexOf(b);
    all.forEach((x, i) => x.classList.toggle("on", i <= n));
    if (!rated) { rated = true; later(ring, 1400); }
  });

  const call = $("call"), floats = $("floats");
  function ring() {
    if (inCall) return; inCall = true; ending = false; side = 0; clearCall();
    floats.innerHTML = ""; $("callTimer").textContent = "";
    $("callState").textContent = "Incoming LoveGo call";
    call.className = "call show ringing";
  }
  $("decline").addEventListener("click", () => {
    $("callState").textContent = "Declined? " + C.driverName + " is calling again...";
    call.classList.remove("ringing"); void call.offsetWidth; call.classList.add("ringing");
  });
  $("accept").addEventListener("click", () => {
    if (call.classList.contains("connected")) return;   // cegah double-tap menjalankan timer ganda
    call.className = "call show connected"; $("callState").textContent = "Connected";
    let sec = 0; $("callTimer").textContent = "00:00";
    clearInterval(tick); tick = setInterval(() => { sec++; $("callTimer").textContent = String(Math.floor(sec / 60)).padStart(2, "0") + ":" + String(sec % 60).padStart(2, "0"); }, 1000);
    let t = 1200;
    LG.callLines.forEach(line => {
      const talk = 1500 + line.length * 22, read = 1800 + line.length * 32;
      callLater(() => addTalking(true), t); t += talk;
      callLater(() => { addTalking(false); floatBubble(line); }, t); t += read;
    });
    callLater(endCall, t + 1500);
  });
  $("hang").addEventListener("click", endCall);

  function addTalking(on) {
    let t = floats.querySelector(".typing");
    if (on && !t) { t = document.createElement("div"); t.className = "typing"; t.innerHTML = "<i></i><i></i><i></i>"; floats.appendChild(t); }
    if (!on && t) t.remove();
  }
  function floatBubble(text) {
    const d = document.createElement("div"); d.className = "fb " + (side++ % 2 ? "r" : "l"); d.textContent = text; floats.appendChild(d);
    const kids = [...floats.querySelectorAll(".fb")];
    kids.forEach((k, i) => { const age = kids.length - 1 - i; k.style.opacity = Math.max(0, 1 - age * 0.3); if (age > 4) k.remove(); });
  }
  let ending = false;
  function endCall() {
    if (ending || !inCall) return; ending = true; clearCall();
    $("callState").textContent = "Call ended"; addTalking(false);
    callLater(() => {
      call.className = "call"; $("chatScreen").classList.remove("show");
      ending = false; inCall = false; go("v-ask");
    }, 1200);
  }

  /* Proposal */
  const labels = ["Let me think", "Are you sure?", "Okay, yes"];
  let tries = 0;
  $("later").addEventListener("click", () => {
    if (tries >= 2) { $("yes").click(); return; }
    $("later").textContent = labels[tries++];
    $("later").classList.add("shake"); setTimeout(() => $("later").classList.remove("shake"), 400);
  });
  $("yes").addEventListener("click", () => { go("v-end"); hearts(34); });
  $("againBtn").addEventListener("click", () => {
    clearTimers(); stopAnim && stopAnim(); tries = 0; ending = false; inCall = false;
    $("later").textContent = "Maybe later";
    document.querySelectorAll("#stars button").forEach(x => x.classList.remove("on"));
    call.className = "call"; $("chatScreen").classList.remove("show");
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
