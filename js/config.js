/* Edit this file to personalize the experience. */
window.LG = {
  config: {
    driverName: "Zia",         // the driver (you)
    passengerName: "",         // his name (optional), used in the greeting
    start: [-6.1747753, 106.8440218],   // pick-up point ("You")
    end: [-6.2425338, 106.7987015],     // destination ("Zia's heart")
    fromLabel: "Your location, Monas area, Central Jakarta",
    toLabel: "Zia's heart, Senayan area, South Jakarta",
    tripMs: 100000,            // trip duration in ms (higher = slower vehicle)
    startDelay: 1800,          // pause on the pick-up point before moving
    followZoom: 16
  },
  services: [
    { icon: "i-bike", name: "LoveRide", desc: "Fastest way to my heart", price: "Free" },
    { icon: "i-car", name: "LoveCar", desc: "More comfort, more conversation", price: "Free" },
    { icon: "i-inf", name: "LoveForever", desc: "One-way trip, no return", price: "Priceless" }
  ],
  // Chat starts only after the vehicle has arrived.
  arrival: [
    "{hi}, it is Zia, your driver tonight. We have arrived at your destination.",
    "That destination was my heart. I hope you do not mind the extra stop.",
    "I took the fastest route, but honestly I would have taken the long way for more time with you.",
    "I have had a lot of passengers. You are the first one I do not want to drop off.",
    "So before you leave the car, I have one question for you."
  ],
  quickReplies: [
    { q: "Okay, that was smooth.", a: "I practiced the whole route." },
    { q: "Is this a pick-up line?", a: "Maybe. Is it working?" },
    { q: "I like where this is going.", a: "Good. Stay for dinner." }
  ]
};
