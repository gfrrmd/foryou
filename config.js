/* Edit this file to personalize the experience. */
window.LG = {
  config: {
    driverName: "Rafi",        // your name
    passengerName: "",         // her/his name (optional)
    start: [-6.1747753, 106.8440218],
    end: [-6.2425338, 106.7987015],
    fromLabel: "Monas area, Central Jakarta",
    toLabel: "Senayan area, South Jakarta",
    tripMs: 36000,             // trip animation length in ms
    followZoom: 15
  },
  services: [
    { icon: "i-bike", name: "LoveRide", desc: "Fastest way to my heart", price: "Free" },
    { icon: "i-car", name: "LoveCar", desc: "More comfort, more conversation", price: "Free" },
    { icon: "i-inf", name: "LoveForever", desc: "One-way trip, no return", price: "Priceless" }
  ],
  // p = trip progress (0 to 1) when the driver sends the message
  messages: [
    { p: 0.00, t: "{hi}, this is {driver}. I have accepted your order." },
    { p: 0.12, t: "I am on my way. Taking the fastest route to you." },
    { p: 0.35, t: "Traffic is heavy, but nothing slows me down when it is about you." },
    { p: 0.58, t: "Quick question: is it normal that my heart rate went up after accepting this trip?" },
    { p: 0.78, t: "Almost there. I would take this route again every single time." },
    { p: 0.93, t: "I am right outside. Look up, I will be smiling." }
  ],
  quickReplies: [
    { q: "Take your time, I will wait.", a: "Thank you. Waiting for you is the best part of my day." },
    { q: "Drive safely!", a: "Always. I am carrying the most important passenger." },
    { q: "Are you always this charming?", a: "Only on trips to you." }
  ]
};
