let currentLang = localStorage.getItem("lang") || "ru";
let translations = {};

async function loadLanguage(lang) {
  try {
    const res = await fetch(`lang/${lang}.json`);
    if (!res.ok) throw new Error("Language file not found");
    translations = await res.json();
    currentLang = lang;
    localStorage.setItem("lang", lang);
    applyTranslations();
  } catch (e) {
    console.error(e);
  }
}

function t(key) {
  if (translations[key]) return translations[key];
  return key;
}

function applyTranslations() {
  document.title = t("title");
  document.querySelector("h1")?.setAttribute("data-i18n", "title");
  document.querySelector("h1").textContent = t("title");

  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    if (key && translations[key]) {
      el.textContent = translations[key];
    }
  });

  // For status line update
  updateStatus();

  // If rules page present
  if (document.getElementById("rules-list")) {
    const container = document.getElementById("rules-list");
    container.innerHTML = "";
    (translations.rulesContent || []).forEach(p => {
      const para = document.createElement("p");
      para.textContent = p;
      container.appendChild(para);
    });
  }
}

function toggleLanguage() {
  const newLang = currentLang === "ru" ? "en" : "ru";
  loadLanguage(newLang);
}
