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
  // Full-screen chat, starts after the vehicle has arrived.
  arrival: [
    "{hi}, Zia here, your driver. We have arrived, no cap.",
    "ok so the destination you picked? that is literally my heart. lowkey an iconic choice.",
    "you have been living in my head rent free since the pick-up point, fr fr.",
    "I do not hand out 5 stars to passengers but you? it is giving main character energy.",
    "highkey thought about taking the long way so we had more time. green flag behavior, I know.",
    "not to be dramatic but you might be my favorite side quest.",
    "ok I will stop yapping. say something, I am getting a little nervous lol."
  ],
  quickReplies: [
    { q: "Not you flirting with me", a: "Delulu is the solulu, so yes I am. Is it working?" },
    { q: "Lowkey it is working", a: "Yesss. Locked in. Do not leave yet, I am not done." },
    { q: "Ok that was actually smooth", a: "I practiced the route AND the rizz." }
  ],
  // Floating text bubbles during the incoming call (no audio).
  callLines: [
    "Hello? Can you hear me? Ok good. I just needed to say this out loud.",
    "I know we met on a ride, but my brain said bet and my heart said send it.",
    "Be honest, are you a green flag or a green flag? Because I only see green.",
    "I have been smiling at my phone since you rated me. Down bad? Maybe. Regretting it? Never.",
    "So let us skip the situationship arc and go straight to the good part.",
    "Dinner. You, me, and food we both pretend to share.",
    "Anyway, I am hanging up before I say something even more unhinged. The answer is on your screen."
  ]
};
