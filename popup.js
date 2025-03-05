document.addEventListener('DOMContentLoaded', function() {
  // Array of motivational messages
  const messages = [
    "Level-up time.",
    "Brain gains activated.",
    "Skill-building mode: on.",
    "Knowledge awaits.",
    "Growth time.",
    "Study grind starts now.",
    "Future you is watching.",
    "Skill o'clock.",
    "Mind fuel time.",
    "Power hour begins."
  ];

  // Array of gradient backgrounds
  const gradients = [
    "linear-gradient(45deg, #FF416C, #FF4B2B)",
    "linear-gradient(45deg, #4776E6, #8E54E9)",
    "linear-gradient(45deg, #11998e, #38ef7d)",
    "linear-gradient(45deg, #f2994a, #f2c94c)",
    "linear-gradient(45deg, #ee0979, #ff6a00)",
    "linear-gradient(45deg, #2980B9, #6DD5FA)",
    "linear-gradient(45deg, #8E2DE2, #4A00E0)",
    "linear-gradient(45deg, #00B4DB, #0083B0)",
    "linear-gradient(45deg, #834d9b, #d04ed6)",
    "linear-gradient(45deg, #1D976C, #93F9B9)"
  ];

  // Get random message and gradient
  const randomMessage = messages[Math.floor(Math.random() * messages.length)];
  const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];

  // Update the message and background
  document.getElementById('message').textContent = randomMessage;
  document.getElementById('container').style.background = randomGradient;

  // Adjust text color for lighter gradients
  if (randomGradient.includes('#f2c94c') || randomGradient.includes('#93F9B9')) {
    document.getElementById('container').style.color = '#333';
  }
});