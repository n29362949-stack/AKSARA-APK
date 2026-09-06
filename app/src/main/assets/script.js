// ================================
// AKSARA-BOT DASHBOARD
// Interactive Features
// ================================

document.addEventListener("DOMContentLoaded", () => {
  console.log("🤖 AKSARA-BOT Dashboard aktif");

  // Animasi tombol
  document.querySelectorAll("button").forEach(button => {
    button.addEventListener("click", () => {
      button.style.transform = "scale(0.97)";

      setTimeout(() => {
        button.style.transform = "";
      }, 100);
    });
  });

  // Cek koneksi browser
  function updateConnection() {
    if (navigator.onLine) {
      console.log("🌐 Internet: ONLINE");
    } else {
      console.log("⚠️ Internet: OFFLINE");
    }
  }

  window.addEventListener("online", updateConnection);
  window.addEventListener("offline", updateConnection);

  updateConnection();
});

// TIMER PAIRING CODE 1 MENIT
let pairingCountdown;

function startPairingTimer() {
  clearInterval(pairingCountdown);

  let seconds = 60;
  const timer = document.getElementById("pairingTimer");

  if (!timer) return;

  timer.innerHTML = `⏱️ Kode berlaku: <b>01:00</b>`;

  pairingCountdown = setInterval(() => {
    seconds--;

    const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");

    timer.innerHTML = `⏱️ Kode berlaku: <b>${minutes}:${secs}</b>`;

    if (seconds <= 0) {
      clearInterval(pairingCountdown);
      timer.innerHTML = `⏰ <b>Kode kedaluwarsa</b> — buat kode baru.`;
    }
  }, 1000);
}
