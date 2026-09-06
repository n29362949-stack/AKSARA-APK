// ======================================================
// AKSARA-BOT DASHBOARD
// FULL INTERACTIVE SCRIPT
// ======================================================

const API_BASE = "http://127.0.0.1:3000";

let pairingCountdown = null;
let pairingSeconds = 60;


// ======================================================
// START
// ======================================================

document.addEventListener("DOMContentLoaded", () => {
  console.log("🤖 AKSARA-BOT Dashboard aktif");

  setupButtons();
  setupConnection();
  setupSettings();
  setupMenuNavigation();
  loadSavedSettings();

  console.log("✅ Semua fungsi dashboard siap");
});


// ======================================================
// ANIMASI TOMBOL
// ======================================================

function setupButtons() {
  document.querySelectorAll("button").forEach(button => {

    button.addEventListener("click", () => {
      button.style.transform = "scale(0.97)";

      setTimeout(() => {
        button.style.transform = "";
      }, 100);
    });

  });
}


// ======================================================
// NOTIFIKASI
// ======================================================

function notify(message) {

  let notification = document.getElementById("aksaraNotification");

  if (!notification) {

    notification = document.createElement("div");

    notification.id = "aksaraNotification";

    notification.style.position = "fixed";
    notification.style.left = "20px";
    notification.style.right = "20px";
    notification.style.bottom = "25px";
    notification.style.padding = "15px 18px";
    notification.style.borderRadius = "15px";
    notification.style.background = "#171722";
    notification.style.color = "white";
    notification.style.border = "1px solid #6d45ff";
    notification.style.boxShadow = "0 10px 30px rgba(0,0,0,.4)";
    notification.style.zIndex = "99999";
    notification.style.fontSize = "15px";
    notification.style.textAlign = "center";

    document.body.appendChild(notification);
  }

  notification.textContent = message;
  notification.style.display = "block";

  clearTimeout(notification._timer);

  notification._timer = setTimeout(() => {
    notification.style.display = "none";
  }, 3000);
}


// ======================================================
// CEK INTERNET
// ======================================================

function setupConnection() {

  function updateConnection() {

    if (navigator.onLine) {
      console.log("🌐 Internet: ONLINE");
    } else {
      console.log("⚠️ Internet: OFFLINE");
      notify("⚠️ Tidak ada koneksi internet");
    }

  }

  window.addEventListener("online", updateConnection);
  window.addEventListener("offline", updateConnection);

  updateConnection();
}


// ======================================================
// PAIRING CODE
// ======================================================

async function requestPairing() {

  const phoneInput =
    document.getElementById("phoneNumber");

  if (!phoneInput) {
    notify("❌ Kolom nomor WhatsApp tidak ditemukan");
    return;
  }

  let phone = phoneInput.value.trim();

  phone = phone.replace(/\D/g, "");

  if (!phone) {
    notify("⚠️ Masukkan nomor WhatsApp");
    return;
  }

  if (phone.length < 10) {
    notify("⚠️ Nomor WhatsApp tidak valid");
    return;
  }

  try {

    notify("🔗 Meminta Pairing Code...");

    const response = await fetch(
      `${API_BASE}/api/pairing`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          phone: phone
        })
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data.message || "Gagal mendapatkan Pairing Code"
      );
    }

    const codeElement =
      document.getElementById("pairCode");

    const pairingBox =
      document.getElementById("pairingBox");

    if (codeElement) {
      codeElement.textContent =
        data.code || data.pairingCode || "--------";
    }

    if (pairingBox) {
      pairingBox.classList.remove("hidden");
      pairingBox.style.display = "";
    }

    startPairingTimer();

    notify("✅ Pairing Code berhasil diterima");

  } catch (error) {

    console.error("Pairing error:", error);

    notify(
      "❌ Gagal mendapatkan kode: " +
      error.message
    );
  }
}


// ======================================================
// COPY PAIRING CODE
// ======================================================

async function copyPairing() {

  const element =
    document.getElementById("pairCode");

  if (!element) {
    notify("❌ Pairing Code tidak ditemukan");
    return;
  }

  const code =
    element.textContent.trim();

  if (!code || code === "--------") {
    notify("⚠️ Belum ada Pairing Code");
    return;
  }

  try {

    await navigator.clipboard.writeText(code);

    notify("📋 Pairing Code berhasil disalin");

  } catch {

    notify("❌ Gagal menyalin kode");

  }
}


// ======================================================
// COUNTDOWN PAIRING
// ======================================================

function startPairingTimer() {

  clearInterval(pairingCountdown);

  pairingSeconds = 60;

  const timer =
    document.getElementById("pairingTimer");

  if (!timer) return;

  updatePairingTimer(timer);

  pairingCountdown =
    setInterval(() => {

      pairingSeconds--;

      updatePairingTimer(timer);

      if (pairingSeconds <= 0) {

        clearInterval(pairingCountdown);

        timer.innerHTML =
          "⏰ <b>Kode kedaluwarsa</b> — buat kode baru.";

      }

    }, 1000);
}


function updatePairingTimer(timer) {

  const minutes =
    String(
      Math.floor(pairingSeconds / 60)
    ).padStart(2, "0");

  const seconds =
    String(
      pairingSeconds % 60
    ).padStart(2, "0");

  timer.innerHTML =
    `⏱️ Kode berlaku: <b>${minutes}:${seconds}</b>`;
}


// ======================================================
// CEK STATUS BOT
// ======================================================

async function checkBotStatus() {

  try {

    const response =
      await fetch(`${API_BASE}/api/status`);

    const data =
      await response.json();

    console.log("📊 Status bot:", data);

    updateStatusDisplay(data);

    return data;

  } catch (error) {

    console.error("Status error:", error);

    updateStatusDisplay({
      connected: false,
      status: "offline"
    });

    return null;
  }
}


// ======================================================
// TAMPILKAN STATUS
// ======================================================

function updateStatusDisplay(data) {

  const statusElements =
    document.querySelectorAll(
      "[data-bot-status], .bot-status"
    );

  let online =
    data?.connected === true ||
    data?.online === true ||
    data?.status === "online" ||
    data?.status === "connected";

  statusElements.forEach(element => {

    element.textContent =
      online ? "Online" : "Offline";

    element.dataset.status =
      online ? "online" : "offline";

  });
}


// ======================================================
// MONITORING / AKTIVITAS
// ======================================================

async function loadActivity() {

  try {

    const response =
      await fetch(`${API_BASE}/api/activity`);

    const data =
      await response.json();

    console.log("📡 Activity:", data);

    return data;

  } catch (error) {

    console.error(
      "Activity error:",
      error
    );

    return null;
  }
}


// ======================================================
// PENGATURAN BOT
// ======================================================

function setupSettings() {

  const prefixInput =
    document.getElementById("prefix");

  if (prefixInput) {

    prefixInput.addEventListener(
      "input",
      () => {

        localStorage.setItem(
          "aksara_prefix",
          prefixInput.value
        );

      }
    );

  }


  document
    .querySelectorAll(
      'input[type="checkbox"]'
    )
    .forEach(checkbox => {

      checkbox.addEventListener(
        "change",
        () => {

          const key =
            checkbox.id ||
            checkbox.name;

          if (!key) return;

          localStorage.setItem(
            "aksara_" + key,
            checkbox.checked
          );

        }
      );

    });
}


// ======================================================
// LOAD PENGATURAN
// ======================================================

function loadSavedSettings() {

  const prefixInput =
    document.getElementById("prefix");

  if (prefixInput) {

    const savedPrefix =
      localStorage.getItem(
        "aksara_prefix"
      );

    if (savedPrefix !== null) {
      prefixInput.value =
        savedPrefix;
    }

  }


  document
    .querySelectorAll(
      'input[type="checkbox"]'
    )
    .forEach(checkbox => {

      const key =
        checkbox.id ||
        checkbox.name;

      if (!key) return;

      const saved =
        localStorage.getItem(
          "aksara_" + key
        );

      if (saved !== null) {

        checkbox.checked =
          saved === "true";

      }

    });
}


// ======================================================
// SIMPAN PENGATURAN
// ======================================================

function saveSettings() {

  const prefixInput =
    document.getElementById("prefix");

  if (prefixInput) {

    localStorage.setItem(
      "aksara_prefix",
      prefixInput.value
    );

  }


  document
    .querySelectorAll(
      'input[type="checkbox"]'
    )
    .forEach(checkbox => {

      const key =
        checkbox.id ||
        checkbox.name;

      if (!key) return;

      localStorage.setItem(
        "aksara_" + key,
        checkbox.checked
      );

    });

  notify("💾 Pengaturan berhasil disimpan");
}


// ======================================================
// MENU NAVIGASI
// ======================================================

function setupMenuNavigation() {

  document
    .querySelectorAll(
      "[data-page], [data-menu]"
    )
    .forEach(element => {

      element.addEventListener(
        "click",
        () => {

          const page =
            element.dataset.page ||
            element.dataset.menu;

          if (page) {
            showPage(page);
          }

        }
      );

    });
}


// ======================================================
// TAMPILKAN HALAMAN
// ======================================================

function showPage(page) {

  console.log(
    "📄 Membuka halaman:",
    page
  );

  const sections =
    document.querySelectorAll(
      "[data-section]"
    );

  sections.forEach(section => {

    section.style.display =
      "none";

  });

  const target =
    document.querySelector(
      `[data-section="${page}"]`
    );

  if (target) {

    target.style.display =
      "block";

  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


// ======================================================
// GROUP SETTINGS
// ======================================================

function setupGroupSettings() {

  document
    .querySelectorAll(
      '.group-setting input[type="checkbox"]'
    )
    .forEach(checkbox => {

      checkbox.addEventListener(
        "change",
        () => {

          const feature =
            checkbox.dataset.feature ||
            checkbox.id;

          console.log(
            "👥 Group setting:",
            feature,
            checkbox.checked
          );

          localStorage.setItem(
            "group_" + feature,
            checkbox.checked
          );

        }
      );

    });
}


// ======================================================
// PREMIUM
// ======================================================

function buyPremium(packageName = "") {

  if (!packageName) {
    packageName = "Premium";
  }

  notify(
    `👑 Paket ${packageName} dipilih`
  );

  console.log(
    "Premium package:",
    packageName
  );
}


// ======================================================
// EDIT PROFIL
// ======================================================

function editProfile() {

  const name =
    prompt(
      "Masukkan nama pemilik bot:",
      "Icaa"
    );

  if (name === null) return;

  const cleanName =
    name.trim();

  if (!cleanName) {
    notify("⚠️ Nama tidak boleh kosong");
    return;
  }

  localStorage.setItem(
    "aksara_owner_name",
    cleanName
  );

  document
    .querySelectorAll(
      "[data-owner-name]"
    )
    .forEach(element => {

      element.textContent =
        cleanName;

    });

  notify(
    "✅ Profil berhasil diperbarui"
  );
}


// ======================================================
// NOTIFIKASI
// ======================================================

function toggleNotifications() {

  const enabled =
    localStorage.getItem(
      "aksara_notifications"
    ) !== "false";

  localStorage.setItem(
    "aksara_notifications",
    !enabled
  );

  notify(
    !enabled
      ? "🔔 Notifikasi diaktifkan"
      : "🔕 Notifikasi dimatikan"
  );
}


// ======================================================
// REFRESH DASHBOARD
// ======================================================

async function refreshDashboard() {

  notify(
    "🔄 Memperbarui data..."
  );

  await checkBotStatus();
  await loadActivity();

  notify(
    "✅ Dashboard diperbarui"
  );
}


// ======================================================
// AUTO STATUS CHECK
// ======================================================

setInterval(() => {

  if (navigator.onLine) {
    checkBotStatus();
  }

}, 30000);


// ======================================================
// EXPORT GLOBAL
// Supaya tombol onclick="" di HTML
// tetap bisa memanggil fungsi.
// ======================================================

window.requestPairing =
  requestPairing;

window.copyPairing =
  copyPairing;

window.startPairingTimer =
  startPairingTimer;

window.checkBotStatus =
  checkBotStatus;

window.loadActivity =
  loadActivity;

window.saveSettings =
  saveSettings;

window.showPage =
  showPage;

window.editProfile =
  editProfile;

window.buyPremium =
  buyPremium;

window.toggleNotifications =
  toggleNotifications;

window.refreshDashboard =
  refreshDashboard;


// ======================================================
// SELESAI
// ======================================================

console.log(
  "💜 AKSARA-BOT Dashboard siap digunakan"
);
