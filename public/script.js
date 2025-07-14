// Hesap grupları ve platform bilgileri
const accountGroups = {
  ana: ["Özdilek Holding", "Özdilek AVM"],
  avm: [
    "Özdilek AVM",
    "ÖzdilekPark M Geçit (Özdilek Geçit AVM)",
    "Özdilek İzmir",
    "Özdilek Eskişehir",
    "Özdilek Afyonkarahisar (Özdilek Afyon AVM)",
    "Özdilek Yalova",
    "Özdilek Kocaeli",
    "Özdilek Bolu",
    "Özdilek Manisa Turgutlu",
    "Özdilek Uşak",
    "Özdilek Bursa",
    "Özdilek Düzce",
  ],
  park: [
    "ÖzdilekPark Bursa Nilüfer",
    "ÖzdilekPark Antalya",
    "ÖzdilekPark İstanbul",
    "Wyndham Grand İstanbul Levent Hotel & Conference Center",
    "Wyndham Grand İzmir Özdilek Thermal & Spa",
  ],
  konsept: [
    "Cinetime",
    "Safahat Lokantası",
    "Kafe Safahat",
    "Game Factory",
    "Game Machine Bowling (Game Machine)",
    "We You They",
    "Sütfest (Sütfest Dondurma)",
    "First Company",
    "Carême Restaurant İzmir",
    "Carême Restaurant İstanbul",
    "Qualitasspa Levent İstanbul",
    "Qualitasspa İzmir",
    "Qualitasspa Eskişehir",
    "AFunfair (Funfair)",
    "Özdilekteyim",
  ],
  markalar: [
    "Cottons& Clouds",
    "Özdilekevtekstili (Özdilek Ev Tekstili)",
    "Özdilek Fırsatları",
    "Sadem",
    "Finesuits",
    "Shefame",
    "Lavandi",
    "Özdilek Vakfı",
    "Orange İnşaat",
    "Orange City Balat",
    "River Plaza (River Plaza İstanbul)",
    "Özlü Sigorta",
    "Tabiat Tarım",
    "My Auto",
    "Özdilek Lokum",
  ],
  test: ["testhesap_ozoz", "test_ozd_01", "test_ozd_02", "testhesapyeni"],
};

// Her hesabın sahip olduğu platformlar
const accountPlatforms = {
  // Ana Hesaplar
  "Özdilek Holding": ["Facebook", "Instagram", "Twitter", "LinkedIn"],
  "Özdilek AVM": ["Facebook", "Instagram", "Twitter"],

  // AVM Grubu
  "ÖzdilekPark Bursa Nilüfer": ["Facebook", "Instagram", "Twitter"],
  "ÖzdilekPark Antalya": ["Facebook", "Instagram", "Twitter"],
  "ÖzdilekPark İstanbul": ["Facebook", "Instagram", "Twitter"],
  "ÖzdilekPark M Geçit (Özdilek Geçit AVM)": [
    "Facebook",
    "Instagram",
    "Twitter",
  ],
  "Özdilek İzmir": ["Facebook", "Instagram", "Twitter"],
  "Özdilek Eskişehir": ["Facebook", "Instagram", "Twitter"],
  "Özdilek Afyonkarahisar (Özdilek Afyon AVM)": [
    "Facebook",
    "Instagram",
    "Twitter",
  ],
  "Özdilek Yalova": ["Facebook", "Instagram", "Twitter"],
  "Özdilek Kocaeli": ["Facebook", "Instagram", "Twitter"],
  "Özdilek Bolu": ["Facebook", "Instagram", "Twitter"],
  "Özdilek Manisa Turgutlu": ["Facebook", "Instagram", "Twitter"],
  "Özdilek Uşak": ["Facebook", "Instagram", "Twitter"],
  "Özdilek Bursa": ["Facebook", "Instagram", "Twitter"],
  "Özdilek Düzce": ["Facebook", "Instagram", "Twitter"],

  // Park/Otel Grubu
  "Wyndham Grand İstanbul Levent Hotel & Conference Center": [
    "Facebook",
    "Instagram",
    "LinkedIn",
    "Twitter",
  ],
  "Wyndham Grand İzmir Özdilek Thermal & Spa": [
    "Facebook",
    "Instagram",
    "LinkedIn",
    "Twitter",
  ],

  // Konsept Grubu
  Cinetime: ["Facebook", "Instagram", "Twitter"],
  "Safahat Lokantası": ["Facebook", "Instagram", "Twitter"],
  "Kafe Safahat": ["Facebook", "Instagram", "Twitter"],
  "Game Factory": ["Facebook", "Instagram"],
  "Game Machine Bowling (Game Machine)": ["Facebook", "Instagram"],
  "We You They": ["Facebook", "Instagram", "Twitter"],
  "Sütfest (Sütfest Dondurma)": ["Facebook", "Instagram", "Twitter"],
  "First Company": ["Facebook", "Instagram"],
  "Carême Restaurant İzmir": ["Instagram", "Facebook", "Twitter"],
  "Carême Restaurant İstanbul": ["Facebook", "Instagram", "Twitter"],
  "Qualitasspa Levent İstanbul": ["Facebook", "Instagram", "Twitter"],
  "Qualitasspa İzmir": ["Facebook", "Instagram", "Twitter"],
  "Qualitasspa Eskişehir": ["Facebook", "Instagram", "Twitter"],
  "AFunfair (Funfair)": ["Facebook", "Instagram"],
  Özdilekteyim: ["Facebook", "Instagram", "Twitter"],

  // Markalar Grubu
  "Cottons& Clouds": ["Facebook", "Instagram", "Twitter", "LinkedIn"],
  "Özdilekevtekstili (Özdilek Ev Tekstili)": [
    "Facebook",
    "Instagram",
    "Twitter",
  ],
  "Özdilek Fırsatları": ["Facebook", "Instagram"],
  Sadem: ["Facebook", "Instagram", "Twitter"],
  Finesuits: ["Facebook", "Instagram"],
  Shefame: ["Facebook", "Instagram"],
  Lavandi: ["Facebook", "Instagram"],
  "Özdilek Vakfı": ["Facebook", "Instagram", "Twitter"],
  "Orange İnşaat": ["Facebook", "Instagram", "Twitter"],
  "Orange City Balat": ["Facebook", "Instagram", "Twitter"],
  "River Plaza (River Plaza İstanbul)": ["Facebook"],
  "Özlü Sigorta": ["Facebook", "Instagram", "Twitter"],
  "Tabiat Tarım": ["Facebook", "Instagram", "Twitter"],
  "My Auto": ["Facebook", "Instagram"],
  "Özdilek Lokum": ["Facebook", "Instagram"],

  // Test Hesapları
  testhesap_ozoz: ["Facebook", "Instagram", "Twitter"],
  test_ozd_01: ["Facebook", "Instagram", "Twitter"],
  test_ozd_02: ["Facebook", "Instagram", "Twitter"],
  testhesapyeni: ["Facebook", "Instagram", "Twitter"],
};

const platforms = ["Instagram", "Facebook", "Twitter", "LinkedIn"];

// Sadece bu hesapların YouTube'u var (şu an için boş, gerektiğinde eklenebilir)
const accountsWithYoutube = [];

// Hesapları gruba göre getir
function getAccountsByGroup(groupKey) {
  return accountGroups[groupKey] || [];
}

let selectedAccounts = [];

// Sayfalama değişkenleri
let currentPage = 1;
const postsPerPage = 10;
let totalPages = 1;
let allPosts = [];

// Yeni: Aktif düzenlemede olan gönderiyi takip eden değişken
let currentEditPostId = null;
// Yeni: Açık (expanded) durumda kalan kartları tutan Set
const expandedPostIds = new Set();

// Varsayılan tarihi ayarla
function setDefaultDate() {
  const scheduledDate = document.getElementById("scheduledDate");
  if (scheduledDate) {
    // Bugünün tarihini YYYY-MM-DD formatında al
    const today = new Date().toISOString().split("T")[0];
    scheduledDate.value = today;
    console.log(`Varsayılan tarih ayarlandı: ${today}`);
  }
}

// Sayfa yüklendiğinde
document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM yüklendi, başlatılıyor...");

  // Elementlerin varlığını kontrol et
  const requiredElements = [
    "anaAccounts",
    "avmAccounts",
    "parkAccounts",
    "konseptAccounts",
    "markalarAccounts",
    "testAccounts",
  ];
  let allElementsExist = true;

  requiredElements.forEach((id) => {
    const element = document.getElementById(id);
    if (!element) {
      console.error(`Element bulunamadı: ${id}`);
      allElementsExist = false;
    } else {
      console.log(`Element bulundu: ${id}`);
    }
  });

  if (allElementsExist) {
    setDefaultDate(); // Varsayılan tarihi ayarla
    initializeAccountSelection();
    loadPosts();
    setupEventListeners();

    // Gerçek zamanlı güncelleme kaldırıldı - HTTP istekleri ile çalışıyor

    console.log("Başlatma tamamlandı");
  } else {
    console.error("Gerekli HTML elementleri bulunamadı!");
    showMessage("Sayfa yüklenirken hata oluştu!", "error");
  }
});

// Event listeners
function setupEventListeners() {
  console.log("Event listener'lar kuruluyor...");

  // Form submit
  const form = document.getElementById("postForm");
  if (form) {
    form.addEventListener("submit", handleFormSubmit);
    console.log("Form submit listener eklendi");
  }

  // Dosya seçimi
  const fileInput = document.getElementById("fileInput");
  if (fileInput) {
    fileInput.addEventListener("change", handleFileSelect);
    console.log("File input listener eklendi");
  }

  // Export butonu
  const exportBtn = document.getElementById("exportBtn");
  if (exportBtn) {
    exportBtn.addEventListener("click", exportData);
    console.log("Export button listener eklendi");
  }

  // Content type radio buttons
  const contentTypeRadios = document.querySelectorAll(
    'input[name="contentType"]'
  );
  contentTypeRadios.forEach((radio) => {
    radio.addEventListener("change", handleContentTypeChange);
  });
  console.log("Content type listeners eklendi");

  // Window resize için event listener
  window.addEventListener("resize", function () {
    clearTimeout(window.resizeTimeout);
    window.resizeTimeout = setTimeout(function () {
      // Sayfa yeniden render et
      if (allPosts.length > 0) {
        renderCurrentPagePosts();
      }
    }, 250);
  });
  console.log("Window resize listener eklendi");

  // Arama ve filtreleme
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("keyup", () => loadPosts());
  }

  const todayFilterBtn = document.getElementById("todayFilterBtn");
  if (todayFilterBtn) {
    todayFilterBtn.addEventListener("click", () => {
      const searchInput = document.getElementById("searchInput");
      if (searchInput.dataset.filter === "today") {
        searchInput.dataset.filter = "";
        todayFilterBtn.classList.remove("active");
      } else {
        searchInput.dataset.filter = "today";
        todayFilterBtn.classList.add("active");
      }
      loadPosts();
    });
  }
}

// İçerik türü değiştiğinde
function handleContentTypeChange(event) {
  const contentType = event.target.value;
  const postContent = document.getElementById("postContent");
  const storyContent = document.getElementById("storyContent");
  const contentTextarea = document.getElementById("content");
  const storyLink = document.getElementById("storyLink");
  const storyLinkTitle = document.getElementById("storyLinkTitle");

  if (contentType === "post") {
    postContent.style.display = "block";
    storyContent.style.display = "none";
    contentTextarea.required = true;
    storyLink.required = false;
    storyLinkTitle.required = false;
  } else if (contentType === "story") {
    postContent.style.display = "none";
    storyContent.style.display = "block";
    contentTextarea.required = false;
    storyLink.required = false;
    storyLinkTitle.required = false;
  } else if (contentType === "combined") {
    postContent.style.display = "block";
    storyContent.style.display = "block";
    contentTextarea.required = false; // Hem post hem story olduğu için ayrı ayrı zorunlu kılmıyoruz
    storyLink.required = false;
    storyLinkTitle.required = false;
  }

  console.log(`İçerik türü değişti: ${contentType}`);
}

// Hesap seçimi UI'ı oluştur
function initializeAccountSelection() {
  console.log("Hesap seçimi başlatılıyor...");

  Object.keys(accountGroups).forEach((groupKey) => {
    const containerId = groupKey + "Accounts";
    const container = document.getElementById(containerId);

    if (!container) {
      console.error(`Container bulunamadı: ${containerId}`);
      return;
    }

    console.log(`${groupKey} grubu oluşturuluyor...`);
    const accounts = accountGroups[groupKey];

    accounts.forEach((account) => {
      const accountDiv = createAccountItem(account);
      container.appendChild(accountDiv);
    });

    console.log(`${accounts.length} hesap eklendi: ${groupKey}`);
  });

  updateSelectedCount();
}

// Hesap item'ı oluştur
function createAccountItem(account) {
  const div = document.createElement("div");
  div.className = "account-item";

  const nameDiv = document.createElement("div");
  nameDiv.className = "account-name";
  nameDiv.textContent = account;

  const platformsDiv = document.createElement("div");
  platformsDiv.className = "platforms";

  // Tümü checkbox'ı ekle
  const selectAllDiv = document.createElement("div");
  selectAllDiv.className = "platform-checkbox select-all-checkbox";

  const selectAllCheckbox = document.createElement("input");
  selectAllCheckbox.type = "checkbox";
  selectAllCheckbox.id = `${account}-selectAll`;
  selectAllCheckbox.addEventListener("change", (e) =>
    handleSelectAllForAccount(e, account)
  );

  const selectAllLabel = document.createElement("label");
  selectAllLabel.htmlFor = `${account}-selectAll`;
  selectAllLabel.textContent = "Tümü";
  selectAllLabel.className = "select-all-label";

  selectAllDiv.appendChild(selectAllCheckbox);
  selectAllDiv.appendChild(selectAllLabel);
  platformsDiv.appendChild(selectAllDiv);

  // Platform checkbox'larını ekle - sadece bu hesabın sahip olduğu platformlar
  const accountAvailablePlatforms = accountPlatforms[account] || [];

  accountAvailablePlatforms.forEach((platform) => {
    const checkboxDiv = document.createElement("div");
    checkboxDiv.className = "platform-checkbox";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = `${account}-${platform}`;
    checkbox.addEventListener("change", (e) =>
      handleAccountSelection(e, account)
    );

    const label = document.createElement("label");
    label.htmlFor = `${account}-${platform}`;
    label.textContent = platform;

    checkboxDiv.appendChild(checkbox);
    checkboxDiv.appendChild(label);
    platformsDiv.appendChild(checkboxDiv);
  });

  div.appendChild(nameDiv);
  div.appendChild(platformsDiv);

  return div;
}

// Her hesap için "Tümü" checkbox'ı tıklandığında
function handleSelectAllForAccount(event, account) {
  const isChecked = event.target.checked;

  // O hesabın sahip olduğu platformları al
  const accountAvailablePlatforms = accountPlatforms[account] || [];

  // O hesabın tüm platform checkbox'larını seç/seçme
  accountAvailablePlatforms.forEach((platform) => {
    const platformCheckbox = document.getElementById(`${account}-${platform}`);
    if (platformCheckbox) {
      platformCheckbox.checked = isChecked;
    }
  });

  // Seçili hesapları güncelle
  updateSelectedAccountsForAccount(account);
  updateSelectedCount();
}

// Tek platform checkbox'ı değiştiğinde "Tümü" checkbox'ını güncelle
function updateSelectAllCheckbox(account) {
  const selectAllCheckbox = document.getElementById(`${account}-selectAll`);
  if (!selectAllCheckbox) return;

  // O hesabın sahip olduğu platformları al
  const accountAvailablePlatforms = accountPlatforms[account] || [];

  // O hesabın mevcut platform checkbox'larının durumunu kontrol et
  const platformCheckboxes = accountAvailablePlatforms
    .map((platform) => document.getElementById(`${account}-${platform}`))
    .filter((cb) => cb !== null);

  const checkedCount = platformCheckboxes.filter((cb) => cb.checked).length;
  const totalCount = platformCheckboxes.length;

  if (checkedCount === 0) {
    // Hiçbiri seçili değil
    selectAllCheckbox.checked = false;
    selectAllCheckbox.indeterminate = false;
  } else if (checkedCount === totalCount) {
    // Hepsi seçili
    selectAllCheckbox.checked = true;
    selectAllCheckbox.indeterminate = false;
  } else {
    // Bazıları seçili
    selectAllCheckbox.checked = false;
    selectAllCheckbox.indeterminate = true;
  }
}

// Bir hesabın seçili platform sayısını güncelle
function updateSelectedAccountsForAccount(account) {
  // O hesaba ait olan mevcut seçimleri temizle
  selectedAccounts = selectedAccounts.filter(
    (accountKey) => !accountKey.startsWith(`${account}-`)
  );

  // O hesabın sahip olduğu platformları al
  const accountAvailablePlatforms = accountPlatforms[account] || [];

  // Seçili platformları yeniden ekle
  accountAvailablePlatforms.forEach((platform) => {
    const checkbox = document.getElementById(`${account}-${platform}`);
    if (checkbox && checkbox.checked) {
      selectedAccounts.push(`${account}-${platform}`);
    }
  });
}

// Hesap seçimi değiştiğinde
function handleAccountSelection(event, account) {
  const accountKey = event.target.id;

  if (event.target.checked) {
    if (!selectedAccounts.includes(accountKey)) {
      selectedAccounts.push(accountKey);
    }
  } else {
    selectedAccounts = selectedAccounts.filter((acc) => acc !== accountKey);
  }

  // "Tümü" checkbox'ını güncelle
  updateSelectAllCheckbox(account);
  updateSelectedCount();
  console.log(`Seçili hesaplar: ${selectedAccounts.length}`);
}

// Seçili hesap sayısını güncelle
function updateSelectedCount() {
  const countElement = document.getElementById("selectedCount");
  if (countElement) {
    countElement.textContent = `${selectedAccounts.length} hesap seçili`;
  }
}

// Tümü seç
function selectAll() {
  console.log("Tümü seçiliyor...");
  selectedAccounts = [];
  Object.values(accountGroups)
    .flat()
    .forEach((account) => {
      // O hesabın sahip olduğu platformları al
      const accountAvailablePlatforms = accountPlatforms[account] || [];

      accountAvailablePlatforms.forEach((platform) => {
        const accountKey = `${account}-${platform}`;
        selectedAccounts.push(accountKey);
        const checkbox = document.getElementById(accountKey);
        if (checkbox) checkbox.checked = true;
      });
      // "Tümü" checkbox'larını da seç
      const selectAllCheckbox = document.getElementById(`${account}-selectAll`);
      if (selectAllCheckbox) {
        selectAllCheckbox.checked = true;
        selectAllCheckbox.indeterminate = false;
      }
    });
  updateSelectedCount();
}

// Temizle
function clearAll() {
  console.log("Seçimler temizleniyor...");
  selectedAccounts = [];
  Object.values(accountGroups)
    .flat()
    .forEach((account) => {
      // O hesabın sahip olduğu platformları al
      const accountAvailablePlatforms = accountPlatforms[account] || [];

      accountAvailablePlatforms.forEach((platform) => {
        const checkbox = document.getElementById(`${account}-${platform}`);
        if (checkbox) checkbox.checked = false;
      });
      // "Tümü" checkbox'larını da temizle
      const selectAllCheckbox = document.getElementById(`${account}-selectAll`);
      if (selectAllCheckbox) {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = false;
      }
    });
  updateSelectedCount();
}

// Grup seç
function selectGroup(groupKey) {
  console.log(`${groupKey} grubu seçiliyor...`);
  if (!accountGroups[groupKey]) return;

  accountGroups[groupKey].forEach((account) => {
    // O hesabın sahip olduğu platformları al
    const accountAvailablePlatforms = accountPlatforms[account] || [];

    accountAvailablePlatforms.forEach((platform) => {
      const accountKey = `${account}-${platform}`;
      if (!selectedAccounts.includes(accountKey)) {
        selectedAccounts.push(accountKey);
      }
      const checkbox = document.getElementById(accountKey);
      if (checkbox) checkbox.checked = true;
    });
    // "Tümü" checkbox'larını da güncelle
    const selectAllCheckbox = document.getElementById(`${account}-selectAll`);
    if (selectAllCheckbox) {
      selectAllCheckbox.checked = true;
      selectAllCheckbox.indeterminate = false;
    }
  });
  updateSelectedCount();
}

// Dosya seçimi
function handleFileSelect(event) {
  console.log("Dosya(lar) seçildi");
  const files = event.target.files;
  const preview = document.getElementById("filePreview");

  if (files && files.length > 0) {
    // Birden fazla dosya için önizleme oluştur
    let previewHTML = '<div class="file-list">';

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileSize = (file.size / 1024 / 1024).toFixed(2); // MB cinsinden
      const fileType = file.type.includes("image") ? "🖼️" : "🎬";

      previewHTML += `
        <div class="file-item">
          <span class="file-icon">${fileType}</span>
          <span class="file-name">${file.name}</span>
          <span class="file-size">(${fileSize} MB)</span>
        </div>
      `;
    }

    previewHTML += "</div>";
    previewHTML += `<div class="file-count">📎 Toplam ${files.length} dosya seçildi</div>`;

    preview.innerHTML = previewHTML;
    preview.style.display = "block";

    console.log(
      `${files.length} dosya seçildi:`,
      Array.from(files).map((f) => f.name)
    );
  } else {
    preview.style.display = "none";
  }
}

// Form submit
async function handleFormSubmit(event) {
  event.preventDefault();
  console.log("Form gönderiliyor...");

  // Submit butonunu bul ve loading durumuna geçir
  const submitButton = document.querySelector('button[type="submit"]');
  const originalButtonText = submitButton.innerHTML;

  // Butonu devre dışı bırak ve loading mesajı göster
  submitButton.disabled = true;
  submitButton.innerHTML = "⏳ Biraz bekleyin...";
  submitButton.style.opacity = "0.7";

  const contentType = document.querySelector(
    'input[name="contentType"]:checked'
  ).value;
  const title = document.getElementById("title").value;
  const content = document.getElementById("content").value;
  const notes = document.getElementById("notes").value;
  const storyLink = document.getElementById("storyLink").value;
  const storyLinkTitle = document.getElementById("storyLinkTitle").value;
  const scheduledDate = document.getElementById("scheduledDate").value;
  const scheduledTime = document.getElementById("scheduledTime").value;
  const fileInput = document.getElementById("fileInput");

  console.log("Form verileri:", {
    contentType,
    title,
    content,
    notes,
    storyLink,
    storyLinkTitle,
    scheduledDate,
    scheduledTime,
    selectedAccounts: selectedAccounts.length,
  });

  // Butonu eski haline döndüren fonksiyon
  const resetSubmitButton = () => {
    submitButton.disabled = false;
    submitButton.innerHTML = originalButtonText;
    submitButton.style.opacity = "1";
  };

  // Validation
  if (!title.trim()) {
    resetSubmitButton();
    showMessage("Lütfen paylaşım başlığını yazın!", "error");
    return;
  }

  if (!scheduledDate || !scheduledTime) {
    resetSubmitButton();
    showMessage("Lütfen tarih ve saat alanlarını doldurun!", "error");
    return;
  }

  if (contentType === "post" && !content.trim()) {
    resetSubmitButton();
    showMessage("Lütfen post içeriğini yazın!", "error");
    showToast("❌ Lütfen post içeriğini yazın!", "error", 4000);
    return;
  } else if (
    contentType === "post-story" &&
    !content.trim() &&
    !storyLink.trim()
  ) {
    resetSubmitButton();
    showMessage("Lütfen post içeriğini veya story linkini yazın!", "error");
    showToast(
      "❌ Lütfen post içeriğini veya story linkini yazın!",
      "error",
      4000
    );
    return;
  }

  // Story için link ve başlık kontrolü kaldırıldı - artık opsiyonel

  if (selectedAccounts.length === 0) {
    resetSubmitButton();
    showMessage("En az bir hesap seçin!", "error");
    showToast("❌ Lütfen en az bir hesap seçin!", "error", 4000);
    return;
  }

  const formData = new FormData();
  formData.append("contentType", contentType);
  formData.append("title", title.trim());
  formData.append("content", content.trim());
  formData.append("notes", notes.trim());
  formData.append("storyLink", storyLink.trim());
  formData.append("storyLinkTitle", storyLinkTitle.trim());
  formData.append("scheduledDate", scheduledDate);
  formData.append("scheduledTime", scheduledTime);
  formData.append("selectedAccounts", JSON.stringify(selectedAccounts));

  // Birden fazla dosya ekleme
  if (fileInput.files && fileInput.files.length > 0) {
    for (let i = 0; i < fileInput.files.length; i++) {
      formData.append("files", fileInput.files[i]);
    }
    console.log(`${fileInput.files.length} dosya eklendi`);
  }

  try {
    console.log("API'ye gönderiliyor...");

    // Progress bar'ı göster
    const progressContainer = document.getElementById("uploadProgress");
    const progressFill = document.getElementById("progressFill");
    const progressText = document.getElementById("progressText");
    const progressPercent = document.getElementById("progressPercent");
    const uploadSpeed = document.getElementById("uploadSpeed");

    // Dosya varsa progress bar'ı göster
    if (fileInput.files && fileInput.files.length > 0) {
      progressContainer.style.display = "block";
      progressFill.style.width = "0%";
      progressPercent.textContent = "0%";
      progressText.textContent = "Dosyalar yükleniyor...";
      uploadSpeed.textContent = "";
    }

    // XMLHttpRequest ile progress tracking
    const xhr = new XMLHttpRequest();
    let startTime = Date.now();
    let lastLoaded = 0;

    // Progress event listener
    xhr.upload.addEventListener("progress", function (e) {
      if (e.lengthComputable) {
        const percentComplete = Math.round((e.loaded / e.total) * 100);
        const currentTime = Date.now();
        const timeElapsed = (currentTime - startTime) / 1000; // saniye
        const bytesPerSecond = e.loaded / timeElapsed;
        const mbPerSecond = (bytesPerSecond / (1024 * 1024)).toFixed(2);

        // Progress bar'ı güncelle
        progressFill.style.width = percentComplete + "%";
        progressPercent.textContent = percentComplete + "%";

        if (percentComplete < 100) {
          progressText.textContent = `Dosyalar yükleniyor... (${formatFileSize(
            e.loaded
          )} / ${formatFileSize(e.total)})`;
          uploadSpeed.textContent = `Yükleme hızı: ${mbPerSecond} MB/s`;
        } else {
          progressText.textContent = "Yükleme tamamlandı, işleniyor...";
          uploadSpeed.textContent = "";
        }
      }
    });

    // Response handler
    xhr.onload = function () {
      try {
        // HTTP status kontrolü önce yap
        if (xhr.status !== 200) {
          progressContainer.style.display = "none";
          resetSubmitButton();
          console.error("HTTP Hatası:", xhr.status, xhr.statusText);
          console.error("Sunucu yanıtı:", xhr.responseText);
          showMessage(
            `Sunucu hatası (${xhr.status}): ${xhr.statusText}`,
            "error"
          );
          return;
        }

        // JSON parse etmeyi dene
        let result;
        try {
          result = JSON.parse(xhr.responseText);
        } catch (parseError) {
          progressContainer.style.display = "none";
          resetSubmitButton();
          console.error("JSON parse hatası:", parseError);
          console.error("Sunucu yanıtı:", xhr.responseText);
          showMessage("Sunucu yanıt formatı hatalı!", "error");
          return;
        }

        console.log("API sonucu:", result);

        if (result.success) {
          progressText.textContent = "Paylaşım başarıyla planlandı!";
          showMessage("Paylaşım başarıyla planlandı!", "success");
          showToast("🎉 Yeni paylaşım başarıyla oluşturuldu!", "success", 5000);
          resetSubmitButton();
          resetForm();

          // Yeni post'u dinamik olarak listeye ekle
          addNewPostToList(result.post);

          // Güvenlik için post listesini yeniden yükle
          setTimeout(() => {
            loadPosts();
          }, 1000);

          // Progress bar'ı 2 saniye sonra gizle
          setTimeout(() => {
            progressContainer.style.display = "none";
          }, 2000);
        } else {
          progressContainer.style.display = "none";
          resetSubmitButton();
          showMessage(
            "Hata: " + (result.message || "Bilinmeyen hata"),
            "error"
          );
        }
      } catch (error) {
        progressContainer.style.display = "none";
        resetSubmitButton();
        console.error("Response handler hatası:", error);
        showMessage("İstek işleme hatası!", "error");
      }
    };

    // Error handler
    xhr.onerror = function () {
      progressContainer.style.display = "none";
      resetSubmitButton(); // Butonu eski haline döndür
      console.error("Upload hatası");
      showMessage("Yükleme hatası!", "error");
    };

    // Abort handler
    xhr.onabort = function () {
      progressContainer.style.display = "none";
      resetSubmitButton(); // Butonu eski haline döndür
      showMessage("Yükleme iptal edildi!", "error");
    };

    // Send request
    xhr.open("POST", "/api/posts");

    xhr.timeout = 1800000;
    xhr.ontimeout = function () {
      progressContainer.style.display = "none";
      resetSubmitButton();
      console.error("Upload timeout");
    };

    xhr.send(formData);
  } catch (error) {
    document.getElementById("uploadProgress").style.display = "none";
    resetSubmitButton(); // Butonu eski haline döndür
    console.error("API Hatası:", error);
    showMessage("Sunucu hatası!", "error");
  }
}

// Form sıfırla
function resetForm() {
  console.log("Form sıfırlanıyor...");

  // Submit butonunu eski haline döndür (güvenlik için)
  const submitButton = document.querySelector('button[type="submit"]');
  if (submitButton) {
    submitButton.disabled = false;
    submitButton.innerHTML = "📤 Paylaşımı Planla";
    submitButton.style.opacity = "1";
  }

  document.getElementById("postForm").reset();
  selectedAccounts = [];
  clearAll();

  // Post/Story alanlarını sıfırla
  const postContent = document.getElementById("postContent");
  const storyContent = document.getElementById("storyContent");
  postContent.style.display = "block";
  storyContent.style.display = "none";

  // Radyo butonunu "post" olarak işaretle
  const postRadio = document.querySelector(
    'input[name="contentType"][value="post"]'
  );
  if (postRadio) {
    postRadio.checked = true;
  }

  // Required alanlarını sıfırla
  const contentTextarea = document.getElementById("content");
  const storyLink = document.getElementById("storyLink");
  const storyLinkTitle = document.getElementById("storyLinkTitle");
  contentTextarea.required = true;
  storyLink.required = false;
  storyLinkTitle.required = false;

  // File preview ve progress bar'ı gizle
  const preview = document.getElementById("filePreview");
  if (preview) preview.style.display = "none";

  const progressContainer = document.getElementById("uploadProgress");
  if (progressContainer) progressContainer.style.display = "none";
}

// Dosya boyutunu formatla
function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// Mesaj göster
function showMessage(message, type) {
  console.log(`Mesaj: ${type} - ${message}`);

  // Eski mesajları temizle
  const oldMessages = document.querySelectorAll(".message");
  oldMessages.forEach((msg) => msg.remove());

  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${type}`;
  messageDiv.textContent = message;

  // Mesaj container'ına ekle
  let container = document.getElementById("messageContainer");
  if (!container) {
    container = document.querySelector(".container");
    container.insertBefore(messageDiv, container.firstChild);
  } else {
    container.appendChild(messageDiv);
  }

  setTimeout(() => {
    messageDiv.remove();
  }, 5000);
}

// Toast bildirimi göster (daha görünür)
function showToast(message, type, duration = 4000) {
  console.log(`Toast: ${type} - ${message}`);

  // Eski toast'ları temizle
  const oldToasts = document.querySelectorAll(".toast-notification");
  oldToasts.forEach((toast) => toast.remove());

  // Toast container'ı oluştur (yoksa)
  let toastContainer = document.getElementById("toastContainer");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "toastContainer";
    toastContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      pointer-events: none;
    `;
    document.body.appendChild(toastContainer);
  }

  // Toast element'i oluştur
  const toast = document.createElement("div");
  toast.className = `toast-notification toast-${type}`;

  // Icon belirleme
  let icon = "ℹ️";
  if (type === "success") icon = "✅";
  if (type === "error") icon = "❌";
  if (type === "warning") icon = "⚠️";

  toast.innerHTML = `
    <div style="display: flex; align-items: center; gap: 10px;">
      <span style="font-size: 18px;">${icon}</span>
      <span style="font-weight: 500;">${message}</span>
    </div>
  `;

  // Toast stil
  toast.style.cssText = `
    background: ${
      type === "success" ? "#27ae60" : type === "error" ? "#e74c3c" : "#3498db"
    };
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    margin-bottom: 10px;
    transform: translateX(100%);
    opacity: 0;
    transition: all 0.3s ease;
    pointer-events: auto;
    cursor: pointer;
    max-width: 350px;
    word-wrap: break-word;
  `;

  // Toast'ı container'a ekle
  toastContainer.appendChild(toast);

  // Animasyon
  setTimeout(() => {
    toast.style.transform = "translateX(0)";
    toast.style.opacity = "1";
  }, 100);

  // Tıklayınca kapat
  toast.addEventListener("click", () => {
    toast.style.transform = "translateX(100%)";
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 300);
  });

  // Otomatik kapat
  setTimeout(() => {
    if (toast.parentNode) {
      toast.style.transform = "translateX(100%)";
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 300);
    }
  }, duration);
}

// Hesap seçim durumunu güncelle
function updateSelectedAccountsDisplay() {
  const selectedCount = selectedAccounts.length;
  const countElement = document.getElementById("selectedCount");
  if (countElement) {
    countElement.textContent = `${selectedCount} hesap seçili`;
  }
}

// Hesap tamamlama (menü kapanmasını engelle)
async function toggleAccountComplete(postId, accountKey, checkbox, event) {
  // Event propagation'ı durdur (menü kapanmasın)
  if (event) {
    event.stopPropagation();
    event.preventDefault();
  }

  try {
    const response = await fetch(`/api/posts/${postId}/complete`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        accountKey: accountKey,
        completed: checkbox.checked,
      }),
    });

    const result = await response.json();

    if (result.success) {
      // Post'u dinamik olarak güncelle
      updatePostInList(result.post);

      // Hesap durumuna göre toast mesajı
      const accountName = accountKey.split("-")[0];
      const message = checkbox.checked
        ? `✅ ${accountName} hesabı tamamlandı olarak işaretlendi!`
        : `⏳ ${accountName} hesabı beklemede olarak işaretlendi!`;
      showToast(message, "success", 2000);
    } else {
      checkbox.checked = !checkbox.checked; // Geri al
      showMessage("Hata: " + result.message, "error");
    }
  } catch (error) {
    checkbox.checked = !checkbox.checked; // Geri al
    console.error("Error:", error);
    showMessage("Güncelleme hatası!", "error");
  }
}

// Bu fonksiyonlar artık kullanılmıyor - updatePostInList ile değiştirildi
// Progress display güncelle (DEPRECATED - updatePostInList kullanın)
function updateProgressDisplay(postId) {
  console.warn(
    "updateProgressDisplay kullanımdan kaldırıldı, updatePostInList kullanın"
  );
}

// Sadece progress sayısını güncelle (DEPRECATED - updatePostInList kullanın)
async function updateProgressCount(postId) {
  console.warn(
    "updateProgressCount kullanımdan kaldırıldı, updatePostInList kullanın"
  );
}

// Post tablosunu render et (yeni modern card-based tasarım)
function renderPostsTable(posts) {
  const postsContainer = document.getElementById("postsContainer");
  const noPostsMessage = document.getElementById("noPostsMessage");

  if (!postsContainer) {
    console.error("Posts container bulunamadı");
    return;
  }

  // Temizle
  postsContainer.innerHTML = "";

  // Tüm postları saklayalım (server'dan gelen sıralama korunur)
  allPosts = posts;

  // Toplam sayfa sayısını hesaplayalım
  totalPages = Math.ceil(posts.length / postsPerPage);

  // Sayfa kontrolleri güncelleyelim
  updatePaginationControls();

  if (posts.length === 0) {
    // No posts message'ı göster
    postsContainer.innerHTML = `
      <div class="no-posts-message">
        <div class="no-posts-icon">📝</div>
        <h3>Henüz paylaşım yok</h3>
        <p>İlk paylaşımınızı oluşturmak için yukarıdaki formu kullanın.</p>
      </div>
    `;

    // Sayfalama konteynerini gizleyelim
    const paginationContainer = document.getElementById("paginationContainer");
    if (paginationContainer) {
      paginationContainer.style.display = "none";
    }
    return;
  }

  // Sayfalama kontenerini gösterelim
  const paginationContainer = document.getElementById("paginationContainer");
  if (paginationContainer) {
    paginationContainer.style.display = "flex";
  }

  // Server'dan gelen sıralamayı koruyoruz (artık yeniden sıralamıyoruz)
  // Kullanıcı drag & drop ile özel sıralama yapmış olabilir

  // Mevcut sayfa için postları filtreleyelim
  const startIndex = (currentPage - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const currentPagePosts = posts.slice(startIndex, endIndex);

  // Modern card-based render
  currentPagePosts.forEach((post) => {
    const postCard = createModernPostCard(post);
    postsContainer.appendChild(postCard);
  });

  console.log("Modern post kartları güncellendi");
}

// Modern post kartı oluştur (Accordion Version)
function createModernPostCard(post) {
  const card = document.createElement("div");
  card.className = "post-card";
  card.id = `post-card-${post.id}`;

  // Drag and Drop özellikleri ekle
  card.draggable = true;
  card.addEventListener("dragstart", handleDragStart);
  card.addEventListener("dragover", handleDragOver);
  card.addEventListener("drop", handleDrop);
  card.addEventListener("dragend", handleDragEnd);
  card.addEventListener("dragenter", handleDragEnter);
  card.addEventListener("dragleave", handleDragLeave);

  // Mobil scroll koruması
  let scrollTimeout;
  card.addEventListener("touchstart", (e) => {
    card.removeAttribute("data-is-scrolling");
  });

  card.addEventListener("touchmove", (e) => {
    card.setAttribute("data-is-scrolling", "true");
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      card.removeAttribute("data-is-scrolling");
    }, 150);
  });

  card.addEventListener("touchend", (e) => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      card.removeAttribute("data-is-scrolling");
    }, 100);
  });

  const completedCount = post.completedAccounts
    ? post.completedAccounts.length
    : 0;
  const totalCount = post.selectedAccounts ? post.selectedAccounts.length : 0;

  // İçerik türüne göre içerik metni
  let contentDisplay = "";
  let contentPreview = "";
  if (post.contentType === "story") {
    if (post.storyLinkTitle) {
      contentDisplay = post.storyLinkTitle;
      contentPreview =
        post.storyLinkTitle.length > 80
          ? post.storyLinkTitle.substring(0, 80) + "..."
          : post.storyLinkTitle;
    } else {
      contentDisplay = "Story içeriği";
      contentPreview = "Story içeriği";
    }
  } else if (post.contentType === "combined") {
    const postPart = post.content && post.content.trim() ? post.content : "";
    const storyPart =
      post.storyLinkTitle && post.storyLinkTitle.trim()
        ? post.storyLinkTitle
        : "";
    contentDisplay = `Post: ${postPart}\nStory: ${storyPart}`;
    contentPreview = `Post: ${postPart.substring(
      0,
      40
    )}... Story: ${storyPart.substring(0, 40)}...`;
  } else {
    contentDisplay = post.content && post.content.trim() ? post.content : "";
    contentPreview =
      contentDisplay.length > 120
        ? contentDisplay.substring(0, 120) + "..."
        : contentDisplay;
  }

  // Dosyalar HTML
  let filesHtml = "";
  let fileCount = 0;
  if (post.files && Array.isArray(post.files) && post.files.length > 0) {
    fileCount = post.files.length;
    filesHtml = `
      <div class="post-files-section">
        <span class="post-content-label">📎 Dosyalar (${
          post.files.length
        })</span>
        <div class="post-files-list">
          ${post.files
            .map((file) => {
              const fileType =
                file.mimetype && file.mimetype.includes("image") ? "🖼️" : "🎬";
              const fileSize = file.size
                ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
                : "";
              const fileName = file.originalName || file.fileName;

              return `
              <div class="post-file-item">
                <span class="post-file-icon">${fileType}</span>
                <div class="post-file-info">
                  <div class="post-file-name" title="${fileName}">${fileName}</div>
                  <div class="post-file-size">${fileSize}</div>
                </div>
                <div class="post-file-actions">
                  <a href="/uploads/${file.fileName}" target="_blank" class="file-action-btn view">👁️ Görüntüle</a>
                  <a href="/api/download/${file.fileName}" download class="file-action-btn download">⬇️ İndir</a>
                </div>
              </div>
            `;
            })
            .join("")}
        </div>
        ${
          post.files.length > 1
            ? `
          <div style="margin-top: 12px;">
            <a href="/api/download-all/${post.id}" class="file-action-btn download">📦 Tümünü İndir (ZIP)</a>
          </div>
        `
            : ""
        }
      </div>
    `;
  } else if (post.fileName) {
    // Eski format için geriye uyumluluk
    fileCount = 1;
    const fileName = post.originalName || post.fileName;
    filesHtml = `
      <div class="post-files-section">
        <span class="post-content-label">📎 Dosya</span>
        <div class="post-files-list">
          <div class="post-file-item">
            <span class="post-file-icon">📎</span>
            <div class="post-file-info">
              <div class="post-file-name" title="${fileName}">${fileName}</div>
            </div>
            <div class="post-file-actions">
              <a href="/uploads/${post.fileName}" target="_blank" class="file-action-btn view">👁️ Görüntüle</a>
              <a href="/api/download/${post.fileName}" download class="file-action-btn download">⬇️ İndir</a>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Progress section
  let progressHtml = "";
  if (post.selectedAccounts && post.selectedAccounts.length > 0) {
    // Hesapları platform bazında grupla
    const groupedAccounts = {};
    post.selectedAccounts.forEach((accountKey) => {
      const [accountName, platform] = accountKey.split("-");
      const groupKey =
        platform === "Instagram" || platform === "Facebook"
          ? "Instagram/Facebook"
          : platform;
      if (!groupedAccounts[groupKey]) {
        groupedAccounts[groupKey] = [];
      }
      groupedAccounts[groupKey].push({ accountKey, accountName, platform });
    });

    const groupsHtml = Object.keys(groupedAccounts)
      .map((groupName) => {
        const accounts = groupedAccounts[groupName];
        const accountsHtml = accounts
          .map(({ accountKey, accountName, platform }) => {
            const isCompleted =
              post.completedAccounts &&
              post.completedAccounts.includes(accountKey);
            return `
          <div class="progress-account-item ${isCompleted ? "completed" : ""}">
            <input type="checkbox" 
                   class="progress-account-checkbox"
                   ${isCompleted ? "checked" : ""} 
                   onclick="event.stopPropagation();"
                   onchange="toggleAccountComplete(${
                     post.id
                   }, '${accountKey}', this, event)">
            <label class="progress-account-label" onclick="event.stopPropagation();">${accountName} - ${platform}</label>
          </div>
        `;
          })
          .join("");

        return `
        <div class="progress-platform-group">
          <div class="progress-platform-title">${groupName}</div>
          <div class="progress-accounts">
            ${accountsHtml}
          </div>
        </div>
      `;
      })
      .join("");

    progressHtml = `
      <div class="post-progress-section">
        <div class="progress-summary" onclick="toggleProgressDetails(${post.id})">
          <div class="progress-summary-text">
            <span>📊 Progress</span>
            <span class="progress-count">${completedCount}/${totalCount}</span>
          </div>
          <span class="progress-toggle" id="progress-toggle-${post.id}">▶</span>
        </div>
        <div class="progress-details" id="progress-details-${post.id}">
          ${groupsHtml}
        </div>
      </div>
    `;
  }

  // Story link HTML
  let storyLinkHtml = "";
  if (post.contentType === "story" && post.storyLink) {
    storyLinkHtml = `
      <div class="post-content-section">
        <span class="post-content-label">🔗 Story Link</span>
        <div class="post-content-value">
          <a href="${
            post.storyLink
          }" target="_blank" style="color: #3498db; text-decoration: none;">${
      post.storyLink
    }</a>
          <button class="copy-content-btn" onclick="copyToClipboard('${post.storyLink.replace(
            /'/g,
            "\\'"
          )}', this)">📋</button>
        </div>
      </div>
    `;
  }

  // Status class belirleme
  const statusInfo = {
    planlandı: { icon: "📅", text: "Planlandı" },
    yapıldı: { icon: "✅", text: "Yapıldı" },
    beklemede: { icon: "⏳", text: "Beklemede" },
    iptal: { icon: "❌", text: "İptal" },
  };
  const currentStatus = statusInfo[post.status] || statusInfo["planlandı"];

  card.innerHTML = `
    <!-- Edit Mode Indicator -->
    <div class="edit-mode-indicator" id="edit-indicator-${
      post.id
    }" style="display: none;"></div>

    <!-- Düzenlendi Banner -->
    <div class="edited-banner" id="edited-banner-${
      post.id
    }" style="display: none; background: #f39c12; color: white; padding: 8px 15px; font-size: 0.9rem; font-weight: 500; text-align: center; border-radius: 5px 5px 0 0;">
      ✏️ Bu paylaşım düzenlendi
    </div>

    <!-- Status Header - En üst kısım -->
    <div class="post-status-header">
      <span class="status-label">DURUM</span>
      <div class="post-title-header">
        <strong>${escapeHtml(
          post.contentType === "story" && post.storyLinkTitle
            ? post.storyLinkTitle
            : post.title
        )}</strong>
      </div>
      <div class="status-dropdown-container">
        <select class="status-dropdown-header status-${
          post.status
        }" onchange="updateStatus(${
    post.id
  }, this.value)" onclick="event.stopPropagation();">
          <option value="planlandı" ${
            post.status === "planlandı" ? "selected" : ""
          }>📅 Planlandı</option>
          <option value="yapıldı" ${
            post.status === "yapıldı" ? "selected" : ""
          }>✅ Yapıldı</option>
          <option value="beklemede" ${
            post.status === "beklemede" ? "selected" : ""
          }>⏳ Beklemede</option>
          <option value="iptal" ${
            post.status === "iptal" ? "selected" : ""
          }>❌ İptal</option>
        </select>
      </div>
    </div>

    <!-- Accordion Header - Always Visible -->
    <div class="post-card-accordion-header">
      <div class="post-card-header">
        <div class="post-card-title">
          <span class="content-type-badge-modern ${post.contentType}">
            ${
              post.contentType === "story"
                ? "📱 Story"
                : post.contentType === "combined"
                ? "📝📱 Post ve Story"
                : "📝 Post"
            }
          </span>
          <span class="post-card-id">#${post.id}</span>
        </div>
        <div class="post-card-actions">
          <button class="btn btn-warning btn-icon" onclick="event.stopPropagation(); startEditMode(${
            post.id
          })" title="Düzenle">✏️</button>
          <button class="btn btn-danger btn-icon" onclick="event.stopPropagation(); deletePost(${
            post.id
          })" title="Sil">🗑️</button>
        </div>
      </div>

      <div class="post-card-summary">
        <div class="post-summary-content ${!contentPreview ? "empty" : ""}">
          ${escapeHtml(contentPreview) || "İçerik bulunmuyor"}
        </div>
        
        <div class="post-summary-meta">
          <div class="post-summary-meta-item">
            📅 ${new Date(post.scheduledDate).toLocaleDateString("tr-TR")} • ${
    post.scheduledTime
  }
          </div>
          
          <div class="post-summary-meta-item">
            ${currentStatus.icon} ${currentStatus.text}
          </div>
          
          ${
            fileCount > 0
              ? `
            <div class="post-summary-meta-item has-files">
              📎 ${fileCount} dosya
            </div>
          `
              : ""
          }
          
          ${
            totalCount > 0
              ? `
            <div class="post-summary-meta-item has-progress">
              📊 ${completedCount}/${totalCount}
            </div>
          `
              : ""
          }
        </div>
        
        <!-- Accordion açıkken butonu göstermeyeceğiz, altta olacak -->
        <button class="accordion-toggle-btn" onclick="toggleAccordion(${
          post.id
        }, event)" type="button" id="accordion-toggle-top-${post.id}">
          <span class="accordion-toggle-text" id="accordion-text-${
            post.id
          }">Detayları göster</span>
          <span class="accordion-toggle-icon" id="accordion-icon-${
            post.id
          }">▶</span>
        </button>
      </div>
    </div>

    <!-- Edit Form (Hidden by default) -->
    <div class="edit-form-container" id="edit-form-${
      post.id
    }" style="display: none;">
      ${createEditForm(post)}
    </div>

    <!-- Accordion Content - Collapsible -->
    <div class="post-card-accordion-content" id="accordion-content-${post.id}">
      <div class="post-card-content">
        ${
          contentDisplay
            ? `
          <div class="post-content-section">
            <span class="post-content-label">${
              post.contentType === "story" ? "📱 Story Başlığı" : "📝 İçerik"
            }</span>
            <div class="post-content-value">
              ${escapeHtml(contentDisplay)}
              <button class="copy-content-btn" onclick="copyToClipboard(\`${contentDisplay
                .replace(/`/g, "\\`")
                .replace(/\\/g, "\\\\")}\`, this)">📋</button>
            </div>
          </div>
        `
            : ""
        }

        ${storyLinkHtml}

        ${
          post.notes && post.notes.trim()
            ? `
          <div class="post-content-section">
            <span class="post-content-label">📝 Notlar</span>
            <div class="post-content-value">
              ${escapeHtml(post.notes)}
              <button class="copy-content-btn" onclick="copyToClipboard(\`${post.notes
                .replace(/`/g, "\\`")
                .replace(/\\/g, "\\\\")}\`, this)">📋</button>
            </div>
          </div>
        `
            : ""
        }

        <div class="post-card-grid">
          <div class="post-card-grid-item">
            <span class="post-content-label">📅 Tarih</span>
            <div class="post-content-value">${new Date(
              post.scheduledDate
            ).toLocaleDateString("tr-TR")}</div>
          </div>
          <div class="post-card-grid-item">
            <span class="post-content-label">🕐 Saat</span>
            <div class="post-content-value">${post.scheduledTime}</div>
          </div>
          <div class="post-card-grid-item">
            <span class="post-content-label">📆 Oluşturulma</span>
            <div class="post-content-value">${post.createdAt || "-"}</div>
          </div>
        </div>

        ${filesHtml}
        ${progressHtml}
        
        <!-- Accordion content'in sonunda detayları gizle butonu -->
        <button class="accordion-toggle-btn" onclick="toggleAccordion(${
          post.id
        }, event)" type="button" id="accordion-toggle-bottom-${
    post.id
  }" style="display: none;">
          <span class="accordion-toggle-text">Detayları gizle</span>
          <span class="accordion-toggle-icon">▼</span>
        </button>
      </div>
    </div>
  `;

  return card;
}

// Drag and Drop değişkenleri
let draggedElement = null;
let draggedPostId = null;

// Drag Start - Sürükleme başladığında
function handleDragStart(e) {
  // Edit mode'dayken drag and drop'u engelle
  if (this.classList.contains("edit-mode")) {
    e.preventDefault();
    return false;
  }

  draggedElement = this;
  draggedPostId = this.id.replace("post-card-", "");
  this.style.opacity = "0.5";
  this.classList.add("dragging");

  // Drag data ayarla
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/html", this.outerHTML);

  console.log("Drag başladı:", draggedPostId);
}

// Drag Over - Sürükleme alanı üzerindeyken
function handleDragOver(e) {
  if (e.preventDefault) {
    e.preventDefault();
  }

  e.dataTransfer.dropEffect = "move";
  return false;
}

// Drag Enter - Sürükleme alanına girerken
function handleDragEnter(e) {
  if (this !== draggedElement) {
    this.classList.add("drag-over");
  }
}

// Drag Leave - Sürükleme alanından çıkarken
function handleDragLeave(e) {
  this.classList.remove("drag-over");
}

// Drop - Bırakma işlemi
function handleDrop(e) {
  if (e.stopPropagation) {
    e.stopPropagation();
  }

  if (draggedElement !== this) {
    const draggedPostId = draggedElement.id.replace("post-card-", "");
    const targetPostId = this.id.replace("post-card-", "");

    // Post'ları yeniden sırala
    reorderPosts(draggedPostId, targetPostId);

    console.log(`Post ${draggedPostId} -> ${targetPostId} konumuna taşındı`);

    // Toast mesajı göster
    showToast("📋 Paylaşım sıralaması güncellendi!", "success", 2000);
  }

  this.classList.remove("drag-over");
  return false;
}

// Drag End - Sürükleme bittiğinde
function handleDragEnd(e) {
  this.style.opacity = "";
  this.classList.remove("dragging");

  // Tüm drag-over sınıflarını temizle
  const allCards = document.querySelectorAll(".post-card");
  allCards.forEach((card) => {
    card.classList.remove("drag-over");
  });

  draggedElement = null;
  draggedPostId = null;
}

// Post'ları yeniden sırala
function reorderPosts(draggedId, targetId) {
  // Sürüklenen ve hedef post'ları bul
  const draggedIndex = allPosts.findIndex((post) => post.id == draggedId);
  const targetIndex = allPosts.findIndex((post) => post.id == targetId);

  if (draggedIndex === -1 || targetIndex === -1) {
    console.error("Post bulunamadı:", { draggedId, targetId });
    return;
  }

  // Array'den sürüklenen elementi kaldır
  const draggedPost = allPosts.splice(draggedIndex, 1)[0];

  // Hedef konuma ekle
  allPosts.splice(targetIndex, 0, draggedPost);

  // Sayfayı yeniden render et
  renderCurrentPagePosts();

  // Yeni sıralamayı server'a kaydet
  savePostsOrder();

  console.log("Post sıralaması güncellendi");
}

// Post sıralamasını server'a kaydet
async function savePostsOrder() {
  try {
    const postIds = allPosts.map((post) => post.id);

    console.log("🔄 Sıralama kaydediliyor...");
    console.log("📝 Post ID'leri:", postIds);

    const response = await fetch("/api/posts/reorder", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ postIds }),
    });

    console.log("🌐 Server response status:", response.status);
    const result = await response.json();
    console.log("📤 Server response:", result);

    if (!result.success) {
      console.error("❌ Sıralama kaydedilemedi:", result.message);
      showToast("❌ Sıralama kaydedilemedi!", "error", 3000);
    } else {
      console.log("✅ Sıralama başarıyla kaydedildi");
      showToast("💾 Sıralama kaydedildi!", "success", 2000);
    }
  } catch (error) {
    console.error("❌ Sıralama kaydetme hatası:", error);
    showToast("❌ Sıralama kaydedilemedi!", "error", 3000);
  }
}

// Edit formu oluştur
function createEditForm(post) {
  const existingFiles =
    post.files && Array.isArray(post.files)
      ? post.files
      : post.fileName
      ? [{ fileName: post.fileName, originalName: post.originalName }]
      : [];

  return `
    <div class="edit-form-section">
      <form id="edit-form-data-${post.id}">
        <!-- Content Type Selection -->
        <div class="edit-form-group">
          <label class="edit-form-label">İçerik Türü</label>
          <div class="edit-content-type-options">
            <label class="edit-radio-option">
              <input type="radio" name="contentType" value="post" ${
                post.contentType === "post" ? "checked" : ""
              } onchange="toggleEditContentType(${post.id})">
              <span>📝 Post</span>
            </label>
            <label class="edit-radio-option">
              <input type="radio" name="contentType" value="story" ${
                post.contentType === "story" ? "checked" : ""
              } onchange="toggleEditContentType(${post.id})">
              <span>📱 Story</span>              </label>
              <label class="edit-radio-option">
                <input type="radio" name="contentType" value="combined" ${
                  post.contentType === "combined" ? "checked" : ""
                } onchange="toggleEditContentType(${post.id})">
                <span>📝📱 Post ve Story</span>
              </label>
          </div>
        </div>

        <!-- Title -->
        <div class="edit-form-group">
          <label class="edit-form-label">📝 Paylaşım Başlığı</label>
          <input type="text" name="title" class="edit-form-input" value="${
            post.title || ""
          }" required>
        </div>

        <!-- Content Fields -->
        <div id="edit-content-fields-${post.id}">
          <!-- Post Content -->
          <div class="edit-form-group" id="edit-post-content-${post.id}" ${
    post.contentType === "story" ? 'style="display:none"' : ""
  }>
            <label class="edit-form-label">📝 Post İçeriği</label>
            <textarea name="content" class="edit-form-textarea" rows="4">${
              post.content || ""
            }</textarea>
          </div>

          <!-- Story Fields -->
          <div id="edit-story-content-${post.id}" ${
    post.contentType === "post" ? 'style="display:none"' : ""
  }>
            <div class="edit-form-group">
              <label class="edit-form-label">📱 Story Başlığı</label>
              <input type="text" name="storyLinkTitle" class="edit-form-input" value="${
                post.storyLinkTitle || ""
              }">
            </div>
            <div class="edit-form-group">
              <label class="edit-form-label">🔗 Story Link URL'si</label>
              <input type="url" name="storyLink" class="edit-form-input" value="${
                post.storyLink || ""
              }">
            </div>
          </div>
        </div>

        <!-- Notes -->
        <div class="edit-form-group">
          <label class="edit-form-label">📝 Notlar</label>
          <textarea name="notes" class="edit-form-textarea" rows="3">${
            post.notes || ""
          }</textarea>
        </div>

        <!-- Date and Time -->
        <div class="edit-form-grid">
          <div class="edit-form-group">
            <label class="edit-form-label">📅 Tarih</label>
            <input type="date" name="scheduledDate" class="edit-form-input" value="${
              post.scheduledDate
            }" required>
          </div>
          <div class="edit-form-group">
            <label class="edit-form-label">🕐 Saat</label>
            <input type="time" name="scheduledTime" class="edit-form-input" value="${
              post.scheduledTime
            }" required>
          </div>
        </div>

        <!-- File Upload -->
        <div class="edit-form-group">
          <label class="edit-form-label">📎 Dosyalar</label>
          <div class="edit-file-upload-section">
            <input type="file" name="files" class="edit-file-input" multiple accept="image/*,video/*">
            <p style="margin: 8px 0; font-size: 0.85rem; color: #6c757d;">Yeni dosyalar seçin (mevcut dosyalar korunacak)</p>
          </div>
          
          ${
            existingFiles.length > 0
              ? `
            <div class="edit-existing-files">
              <div class="edit-existing-files-title">Mevcut Dosyalar:</div>
              ${existingFiles
                .map(
                  (file) => `
                <div class="edit-existing-file-item">
                  <span>📎</span>
                  <span>${file.originalName || file.fileName}</span>
                </div>
              `
                )
                .join("")}
            </div>
          `
              : ""
          }
        </div>

        <!-- Account Selection -->
        <div class="edit-form-group">
          <label class="edit-form-label">👥 Hesap Seçimi</label>
          <div class="edit-accounts-section">
            <div class="edit-accounts-grid">
              ${createEditAccountGroups(post.selectedAccounts || [])}
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="edit-actions">
          <button type="button" class="edit-btn cancel" onclick="cancelEditMode(${
            post.id
          })">
            ❌ İptal
          </button>
          <button type="button" class="edit-btn save" onclick="savePost(${
            post.id
          })">
            💾 Kaydet
          </button>
        </div>
      </form>
    </div>
  `;
}

// Edit hesap grupları oluştur
function createEditAccountGroups(selectedAccounts) {
  const accountGroups = {
    avm: "🏢 AVM Hesapları",
    park: "🌳 Park Hesapları",
    konsept: "🍴 Konsept Hesapları",
    markalar: "🏷️ Marka Hesapları",
  };

  return Object.keys(accountGroups)
    .map((groupKey) => {
      const groupTitle = accountGroups[groupKey];
      const accounts = getAccountsByGroup(groupKey);

      return `
      <div class="edit-account-group">
        <div class="edit-account-group-title">${groupTitle}</div>
        ${accounts
          .map((account) => {
            const platforms = accountPlatforms[account] || [];
            return platforms
              .map((platform) => {
                const accountKey = `${account}-${platform}`;
                const isSelected = selectedAccounts.includes(accountKey);
                return `
              <div class="edit-account-item">
                <input type="checkbox" name="selectedAccounts" value="${accountKey}" ${
                  isSelected ? "checked" : ""
                }>
                <label>${account} - ${platform}</label>
              </div>
            `;
              })
              .join("");
          })
          .join("")}
      </div>
    `;
    })
    .join("");
}

// Edit mode başlat
function startEditMode(postId) {
  // Kart zaten edit-modundaysa tekrar işlem yapma
  const existingCard = document.getElementById(`post-card-${postId}`);
  if (existingCard && existingCard.classList.contains("edit-mode")) {
    return; // Zaten edit modunda
  }

  // Aktif düzenlenen post'u kaydet (mobilde yeniden render durumunda korunur)
  currentEditPostId = postId;

  const card = document.getElementById(`post-card-${postId}`);
  const editForm = document.getElementById(`edit-form-${postId}`);
  const accordionContent = document.getElementById(
    `accordion-content-${postId}`
  );
  const editIndicator = document.getElementById(`edit-indicator-${postId}`);

  if (card && editForm) {
    // Edit mode'u aktive et
    card.classList.add("edit-mode", "expanded");
    editForm.style.display = "block";

    // Accordion içeriğini gizle
    if (accordionContent) accordionContent.style.display = "none";
    if (editIndicator) editIndicator.style.display = "block";

    // Accordion toggle ikonunu güncelle
    const icon = document.getElementById(`accordion-icon-${postId}`);
    const toggleText = document.getElementById(`accordion-text-${postId}`);
    if (icon) icon.textContent = "▼";
    if (toggleText) toggleText.textContent = "Düzenleme modunda";

    // Edit mode'dayken accordion toggle butonlarını devre dışı bırak
    const toggleButtons = card.querySelectorAll(".accordion-toggle-btn");
    toggleButtons.forEach((btn) => {
      btn.disabled = true;
      btn.style.opacity = "0.5";
      btn.style.cursor = "not-allowed";
      btn.style.pointerEvents = "none"; // Mobil dokunmatik olayları da engelle
      btn.style.display = "none"; // Butonları tamamen gizle
    });

    // Kart başlığına tıklama olayını da engelle
    const cardHeader = card.querySelector(".post-card-accordion-header");
    if (cardHeader) {
      cardHeader.style.pointerEvents = "none";
      cardHeader.style.cursor = "default";
    }

    // Kartın tümüne click event'lerini engelle
    card.style.pointerEvents = "auto"; // Kart içeriğini aktif bırak
    card.addEventListener("click", preventAccordionToggle, true);

    // Edit mode indicator'ını göster
    card.setAttribute("data-edit-mode", "true");

    console.log(`Post ${postId} edit mode'a geçti`);
  }
}

// Accordion toggle'ı engelleyen fonksiyon
function preventAccordionToggle(event) {
  const card = event.currentTarget;
  if (card.classList.contains("edit-mode")) {
    // Edit form içindeki elementlere tıklamaya izin ver
    const editForm = card.querySelector('[id^="edit-form-"]');
    if (editForm && editForm.contains(event.target)) {
      return; // Edit form içindeki elementlere dokunma
    }

    // Accordion toggle butonlarına tıklamayı engelle
    const isToggleButton = event.target.closest(".accordion-toggle-btn");
    if (isToggleButton) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      console.log("Edit mode'da accordion toggle engellendi");
      return false;
    }
  }
}

// Edit mode iptal et
function cancelEditMode(postId) {
  // ... existing code ...

  // Düzenleme modu kapatıldığında takip değişkenini sıfırla
  if (currentEditPostId === postId) {
    currentEditPostId = null;
  }

  // ... existing code ...

  const card = document.getElementById(`post-card-${postId}`);
  const editForm = document.getElementById(`edit-form-${postId}`);
  const accordionContent = document.getElementById(
    `accordion-content-${postId}`
  );
  const editIndicator = document.getElementById(`edit-indicator-${postId}`);

  if (card && editForm) {
    // Edit mode'u deaktive et
    card.classList.remove("edit-mode");
    editForm.style.display = "none";

    // Accordion içeriğini tekrar göster
    if (accordionContent) accordionContent.style.display = "";
    if (editIndicator) editIndicator.style.display = "none";

    // Accordion toggle butonlarını yeniden aktive et
    const toggleButtons = card.querySelectorAll(".accordion-toggle-btn");
    toggleButtons.forEach((btn) => {
      btn.disabled = false;
      btn.style.opacity = "";
      btn.style.cursor = "";
      btn.style.pointerEvents = ""; // Mobil dokunmatik olayları tekrar aktive et
      btn.style.display = ""; // Butonları tekrar göster
    });

    // Kart başlığına tıklama olayını da tekrar aktive et
    const cardHeader = card.querySelector(".post-card-accordion-header");
    if (cardHeader) {
      cardHeader.style.pointerEvents = "";
      cardHeader.style.cursor = "";
    }

    // Click event listener'ı kaldır
    card.removeEventListener("click", preventAccordionToggle, true);
    card.removeAttribute("data-edit-mode");

    // Accordion toggle ikonunu ve metnini resetle
    const icon = document.getElementById(`accordion-icon-${postId}`);
    const toggleText = document.getElementById(`accordion-text-${postId}`);
    if (card.classList.contains("expanded")) {
      if (icon) icon.textContent = "▼";
      if (toggleText) toggleText.textContent = "Detayları gizle";
    } else {
      if (icon) icon.textContent = "▶";
      if (toggleText) toggleText.textContent = "Detayları göster";
    }

    console.log(`Post ${postId} edit mode'dan çıktı`);
  }
}

// Content type toggle (edit mode)
function toggleEditContentType(postId) {
  const form = document.getElementById(`edit-form-data-${postId}`);
  const contentType = form.querySelector(
    'input[name="contentType"]:checked'
  ).value;
  const postContentDiv = form.querySelector(`#edit-post-content-${postId}`);
  const storyContentDiv = form.querySelector(`#edit-story-content-${postId}`);

  if (contentType === "post") {
    postContentDiv.style.display = "block";
    storyContentDiv.style.display = "none";
  } else if (contentType === "story") {
    postContentDiv.style.display = "none";
    storyContentDiv.style.display = "block";
  } else if (contentType === "combined") {
    postContentDiv.style.display = "block";
    storyContentDiv.style.display = "block";
  }
}

// Post kaydet (edit)
async function savePost(postId) {
  const form = document.getElementById(`edit-form-data-${postId}`);
  const saveButton = document.querySelector(
    `#edit-form-${postId} .edit-btn.save`
  );

  if (!form) {
    console.error("Edit form bulunamadı");
    return;
  }

  // Button'u deaktive et
  if (saveButton) {
    saveButton.disabled = true;
    saveButton.innerHTML = "⏳ Kaydediliyor...";
  }

  try {
    const formData = new FormData();

    // Form verilerini topla
    const formElements = form.elements;
    for (let element of formElements) {
      if (element.name) {
        if (
          element.type === "checkbox" &&
          element.name === "selectedAccounts"
        ) {
          // Checkbox'ları ayrı işle
          continue;
        } else if (element.type === "file") {
          // Dosyaları ayrı işle
          if (element.files && element.files.length > 0) {
            for (let file of element.files) {
              formData.append("files", file);
            }
          }
        } else if (element.type === "radio") {
          if (element.checked) {
            formData.append(element.name, element.value);
          }
        } else {
          formData.append(element.name, element.value);
        }
      }
    }

    // Selected accounts'ları topla
    const selectedAccounts = [];
    const accountCheckboxes = form.querySelectorAll(
      'input[name="selectedAccounts"]:checked'
    );
    accountCheckboxes.forEach((checkbox) => {
      selectedAccounts.push(checkbox.value);
    });
    formData.append("selectedAccounts", JSON.stringify(selectedAccounts));

    // Mevcut dosyaları koru flag'i
    formData.append("keepExistingFiles", "true");

    console.log("Edit formu gönderiliyor:", postId);

    const response = await fetch(`/api/posts/${postId}`, {
      method: "PUT",
      body: formData,
    });

    const result = await response.json();

    if (result.success) {
      showMessage("Paylaşım başarıyla güncellendi!", "success");
      showToast("🟠 Paylaşım başarıyla düzenlendi!", "warning", 5000);

      // Edit mode'dan çık
      cancelEditMode(postId);

      // Post'u dinamik olarak güncelle
      updatePostInList(result.post);

      // Düzenlendi banner'ını göster
      const editedBanner = document.getElementById(`edited-banner-${postId}`);
      if (editedBanner) {
        editedBanner.style.display = "block";

        // 5 saniye sonra banner'ı gizle
        setTimeout(() => {
          editedBanner.style.display = "none";
        }, 5000);
      }
    } else {
      console.error("Güncelleme hatası:", result.message);
      showMessage("Hata: " + result.message, "error");
    }
  } catch (error) {
    console.error("Edit kaydetme hatası:", error);
    showMessage("Güncelleme sırasında hata oluştu!", "error");
  } finally {
    // Button'u yeniden aktive et
    if (saveButton) {
      saveButton.disabled = false;
      saveButton.innerHTML = "💾 Kaydet";
    }
  }
}

// Accordion açma/kapama fonksiyonu
function toggleAccordion(postId, event) {
  const card = document.getElementById(`post-card-${postId}`);

  // Edit mode'dayken accordion kapatılmasın - MUTLAK ENGEL
  if (
    card &&
    (card.classList.contains("edit-mode") ||
      card.hasAttribute("data-edit-mode"))
  ) {
    console.log(
      `Post ${postId} edit mode'da, accordion işlemi MUTLAK OLARAK iptal edildi`
    );
    if (event) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    }
    return false;
  }

  // Event'i kontrol et - mobil scroll event'lerini engelle
  if (event && event.type === "touchmove") {
    console.log(
      `Post ${postId} scroll event'i tespit edildi, accordion işlemi iptal edildi`
    );
    return;
  }

  const content = document.getElementById(`accordion-content-${postId}`);
  const topButton = document.getElementById(`accordion-toggle-top-${postId}`);
  const bottomButton = document.getElementById(
    `accordion-toggle-bottom-${postId}`
  );

  // Buton devre dışıysa işlem yapma
  if (topButton && topButton.disabled) {
    console.log(`Post ${postId} accordion butonu devre dışı`);
    return;
  }

  // Mobil scroll koruması - kart üzerinde scroll event'i aktifse accordion'u tetikleme
  if (card && card.hasAttribute("data-is-scrolling")) {
    console.log(
      `Post ${postId} şu anda scroll yapılıyor, accordion işlemi iptal edildi`
    );
    return;
  }

  if (card && content && topButton && bottomButton) {
    if (card.classList.contains("expanded")) {
      // Kapat
      card.classList.remove("expanded");
      topButton.style.display = "flex";
      bottomButton.style.display = "none";

      // Üstteki buton text'ini güncelle
      const topText = topButton.querySelector(".accordion-toggle-text");
      const topIcon = topButton.querySelector(".accordion-toggle-icon");
      if (topText && topIcon) {
        topText.textContent = "Detayları göster";
        topIcon.textContent = "▶";
      }
    } else {
      // Aç
      card.classList.add("expanded");
      topButton.style.display = "none";
      bottomButton.style.display = "flex";
    }
  }

  // Accordion durumuna göre Set'i güncelle
  if (card) {
    if (card.classList.contains("expanded")) {
      expandedPostIds.add(postId);
    } else {
      expandedPostIds.delete(postId);
    }
  }
}

// Progress detaylarını aç/kapat
function toggleProgressDetails(postId) {
  const details = document.getElementById(`progress-details-${postId}`);
  const toggle = document.getElementById(`progress-toggle-${postId}`);

  if (details && toggle) {
    if (details.classList.contains("show")) {
      details.classList.remove("show");
      toggle.classList.remove("expanded");
    } else {
      details.classList.add("show");
      toggle.classList.add("expanded");

      // Scroll indicator'ları güncelle
      setTimeout(() => {
        updateScrollIndicators(details);

        // Scroll event listener ekle
        details.addEventListener("scroll", () => {
          updateScrollIndicators(details);
        });
      }, 100);
    }
  }
}

// Scroll indicator'ları güncelle
function updateScrollIndicators(element) {
  if (!element) return;

  const canScrollUp = element.scrollTop > 5;
  const canScrollDown =
    element.scrollTop < element.scrollHeight - element.clientHeight - 5;

  if (canScrollUp) {
    element.classList.add("can-scroll-up");
  } else {
    element.classList.remove("can-scroll-up");
  }

  if (canScrollDown) {
    element.classList.add("can-scroll-down");
  } else {
    element.classList.remove("can-scroll-down");
  }
}

// Sayfa render fonksiyonu (modern kartlar için)
function renderCurrentPagePosts() {
  if (allPosts.length === 0) {
    return;
  }

  const postsContainer = document.getElementById("postsContainer");
  if (!postsContainer) {
    console.error("Posts container bulunamadı");
    return;
  }

  postsContainer.innerHTML = "";

  // Mevcut sayfa için postları filtreleyelim
  const startIndex = (currentPage - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const currentPagePosts = allPosts.slice(startIndex, endIndex);

  currentPagePosts.forEach((post) => {
    const postCard = createModernPostCard(post);
    postsContainer.appendChild(postCard);

    // Kart daha önce açık bırakıldıysa tekrar genişlet
    if (expandedPostIds.has(post.id)) {
      postCard.classList.add("expanded");
      const topButton = document.getElementById(
        `accordion-toggle-top-${post.id}`
      );
      const bottomButton = document.getElementById(
        `accordion-toggle-bottom-${post.id}`
      );
      if (topButton && bottomButton) {
        topButton.style.display = "none";
        bottomButton.style.display = "flex";
      }
    }
  });

  // Eğer bir gönderi düzenleniyorsa yeniden göster
  if (currentEditPostId) {
    const editCard = document.getElementById(`post-card-${currentEditPostId}`);
    if (editCard && !editCard.classList.contains("edit-mode")) {
      startEditMode(currentEditPostId);
    }
  }

  console.log("Mevcut sayfa modern kartları güncellendi");
}

// HTML escape fonksiyonu - metinlerdeki özel karakterleri güvenli hale getirir
function escapeHtml(text) {
  if (!text) return "";
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Kopyalama fonksiyonu
function copyToClipboard(text, button) {
  // Modern tarayıcılarda clipboard API'sini dene
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        showSuccessState(button);
      })
      .catch(() => {
        fallbackCopyToClipboard(text, button);
      });
  } else {
    // Clipboard API kullanılamazsa fallback kullan
    fallbackCopyToClipboard(text, button);
  }
}

// Fallback kopyalama fonksiyonu
function fallbackCopyToClipboard(text, button) {
  try {
    // Textarea oluştur
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);

    // Metni seç ve kopyala
    textArea.focus();
    textArea.select();

    const successful = document.execCommand("copy");
    document.body.removeChild(textArea);

    if (successful) {
      showSuccessState(button);
    } else {
      showErrorState(button);
    }
  } catch (err) {
    console.error("Kopyalama hatası:", err);
    showErrorState(button);
  }
}

// Başarılı durum göster
function showSuccessState(button) {
  const originalText = button.textContent;
  const originalBackground = button.style.background;

  button.textContent = "✅";
  button.style.background = "#27ae60";

  setTimeout(() => {
    button.textContent = originalText;
    button.style.background = originalBackground || "#3498db";
  }, 1500);
}

// Hata durumu göster
function showErrorState(button) {
  const originalText = button.textContent;
  const originalBackground = button.style.background;

  button.textContent = "❌";
  button.style.background = "#e74c3c";

  setTimeout(() => {
    button.textContent = originalText;
    button.style.background = originalBackground || "#3498db";
  }, 1500);
}

// Durum güncelle
async function updateStatus(postId, newStatus) {
  console.log(`Post ${postId} durumu güncelleniyor: ${newStatus}`);
  try {
    const response = await fetch(`/api/posts/${postId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: newStatus }),
    });

    const result = await response.json();

    if (result.success) {
      showMessage("Durum güncellendi!", "success");
      showToast("📝 Paylaşım durumu güncellendi!", "success", 3000);

      // Post'u dinamik olarak güncelle (accordion durumunu koruyarak)
      updatePostInList(result.post);
    } else {
      showMessage("Hata: " + result.message, "error");
      // Status dropdown'ını eski haline döndür
      const statusDropdown = document.querySelector(
        `#post-card-${postId} .status-dropdown-header`
      );
      if (statusDropdown) {
        const originalPost = allPosts.find((post) => post.id == postId);
        if (originalPost) {
          statusDropdown.value = originalPost.status;
        }
      }
    }
  } catch (error) {
    console.error("Durum güncelleme hatası:", error);
    showMessage("Durum güncellenemedi!", "error");
    // Status dropdown'ını eski haline döndür
    const statusDropdown = document.querySelector(
      `#post-card-${postId} .status-dropdown-header`
    );
    if (statusDropdown) {
      const originalPost = allPosts.find((post) => post.id == postId);
      if (originalPost) {
        statusDropdown.value = originalPost.status;
      }
    }
  }
}

// Post sil
async function deletePost(postId) {
  if (!confirm("Bu paylaşımı silmek istediğinizden emin misiniz?")) {
    return;
  }

  console.log(`Post siliniyor: ${postId}`);
  try {
    const response = await fetch(`/api/posts/${postId}`, {
      method: "DELETE",
    });

    const result = await response.json();

    if (result.success) {
      showMessage("Paylaşım silindi!", "success");
      showToast("🗑️ Paylaşım başarıyla silindi!", "error", 3000);

      // Post'u dinamik olarak listeden kaldır
      removePostFromList(postId);
    } else {
      showMessage("Hata: " + result.message, "error");
    }
  } catch (error) {
    console.error("Post silme hatası:", error);
    showMessage("Paylaşım silinemedi!", "error");
  }
}

// Yeni post'u dinamik olarak listeye ekle
function addNewPostToList(newPost) {
  console.log("Yeni post eklendi, ilk sayfaya gidiliyor:", newPost.id);

  // İlk sayfaya git
  currentPage = 1;

  // Post listesini yeniden yükle
  loadPosts();

  console.log(`Yeni post eklendi. Post ID: ${newPost.id}`);
}

// Post'u dinamik olarak listeden kaldır
function removePostFromList(postId) {
  console.log("Post listeden kaldırılıyor:", postId);

  // Post'u listeden kaldır
  const originalLength = allPosts.length;
  allPosts = allPosts.filter((post) => post.id != postId);

  if (allPosts.length < originalLength) {
    // Post sayısını güncelle
    const countElement = document.getElementById("postCount");
    if (countElement) {
      countElement.textContent = allPosts.length;
    }

    // Sayfalama bilgilerini güncelle
    totalPages = Math.ceil(allPosts.length / postsPerPage);

    // Eğer mevcut sayfa artık mevcut değilse son sayfaya git
    if (currentPage > totalPages && totalPages > 0) {
      currentPage = totalPages;
    }

    // Eğer hiç post kalmadıysa ilk sayfaya git
    if (allPosts.length === 0) {
      currentPage = 1;
    }

    // Sayfa görünümünü güncelle
    renderCurrentPagePosts();
    updatePaginationControls();

    console.log(`Post silindi. Kalan: ${allPosts.length}`);
  } else {
    console.warn("Post listede bulunamadı:", postId);
  }
}

// Post'u dinamik olarak listede güncelle
function updatePostInList(updatedPost) {
  console.log("Post listede güncelleniyor:", updatedPost.id);

  // Post'u listede bul ve güncelle
  const postIndex = allPosts.findIndex((post) => post.id == updatedPost.id);

  if (postIndex !== -1) {
    allPosts[postIndex] = updatedPost;

    // Mevcut accordion durumunu kaydet
    const postCard = document.getElementById(`post-card-${updatedPost.id}`);
    const isExpanded = postCard && postCard.classList.contains("expanded");
    const isEditMode = postCard && postCard.classList.contains("edit-mode");
    const progressDetailsOpen =
      document.getElementById(`progress-details-${updatedPost.id}`) &&
      document
        .getElementById(`progress-details-${updatedPost.id}`)
        .classList.contains("show");

    // Sadece ilgili post kartını güncelle
    updateSinglePostCard(
      updatedPost,
      isExpanded,
      isEditMode,
      progressDetailsOpen
    );

    console.log(`Post güncellendi: ${updatedPost.id}`);
  } else {
    console.warn("Güncellenecek post listede bulunamadı:", updatedPost.id);
    // Fallback olarak tam listeyi yeniden yükle
    loadPosts();
  }
}

// Tek bir post kartını güncelle (accordion durumunu korur)
function updateSinglePostCard(
  post,
  wasExpanded = false,
  wasEditMode = false,
  progressWasOpen = false
) {
  const existingCard = document.getElementById(`post-card-${post.id}`);
  if (!existingCard) {
    console.warn("Güncellenecek post kartı bulunamadı:", post.id);
    return;
  }

  // Yeni kartı oluştur
  const newCard = createModernPostCard(post);

  // Eski durumları geri yükle
  if (wasExpanded) {
    newCard.classList.add("expanded");
    const toggleText = newCard.querySelector(
      ".accordion-toggle span:first-child"
    );
    if (toggleText) toggleText.textContent = "Detayları gizle";
  }

  if (wasEditMode) {
    newCard.classList.add("edit-mode");
    const editForm = newCard.querySelector(`#edit-form-${post.id}`);
    const accordionContent = newCard.querySelector(
      `#accordion-content-${post.id}`
    );
    const editIndicator = newCard.querySelector(`#edit-indicator-${post.id}`);

    if (editForm) editForm.style.display = "block";
    if (accordionContent) accordionContent.style.display = "none";
    if (editIndicator) editIndicator.style.display = "block";
  }

  if (progressWasOpen) {
    setTimeout(() => {
      const progressDetails = newCard.querySelector(
        `#progress-details-${post.id}`
      );
      const progressToggle = newCard.querySelector(
        `#progress-toggle-${post.id}`
      );
      if (progressDetails) progressDetails.classList.add("show");
      if (progressToggle) progressToggle.classList.add("expanded");
    }, 50);
  }

  // Eski kartı yeni kartla değiştir
  existingCard.parentNode.replaceChild(newCard, existingCard);

  console.log(`Post kartı güncellendi ve durum korundu: ${post.id}`);

  // Accordion Set senkronizasyonu
  if (wasExpanded) {
    expandedPostIds.add(post.id);
  } else {
    expandedPostIds.delete(post.id);
  }
}

// Verileri dışa aktar
function exportData() {
  console.log("Veriler dışa aktarılıyor...");
  window.open("/api/export", "_blank");
}

async function loadPosts() {
  const searchInput = document.getElementById("searchInput");
  const searchTerm = searchInput ? searchInput.value : "";
  const filter = searchInput ? searchInput.dataset.filter : "";

  console.log("Postlar yükleniyor...");
  try {
    let url = "/api/posts?";
    if (searchTerm) {
      url += `search=${encodeURIComponent(searchTerm)}&`;
    }
    if (filter) {
      url += `filter=${encodeURIComponent(filter)}&`;
    }

    const response = await fetch(url);
    const posts = await response.json();
    console.log(`${posts.length} post yüklendi`);

    // Server'dan gelen sıralama zaten doğru (manuel sıralama varsa korunur, yoksa ID'ye göre sıralı)
    // Client tarafında tekrar sıralamaya gerek yok

    renderPostsTable(posts);
    const countElement = document.getElementById("postCount");
    if (countElement) {
      countElement.textContent = posts.length;
    }
  } catch (error) {
    console.error("Post yükleme hatası:", error);
    showMessage("Postlar yüklenemedi!", "error");
  }
}

// Sayfalama fonksiyonları
function goToPage(page) {
  if (page < 1 || page > totalPages) {
    return;
  }

  currentPage = page;

  // Sadece tabloyu yeniden render et (tüm postları yeniden yüklemeden)
  renderCurrentPagePosts();
  updatePaginationControls();

  console.log(`Sayfa ${currentPage}'e geçildi`);
}

function updatePaginationControls() {
  // Sayfa bilgilerini güncelle
  const pageInfo = document.getElementById("pageInfo");
  if (pageInfo) {
    pageInfo.textContent = `Sayfa ${currentPage} / ${totalPages}`;
  }

  const showingInfo = document.getElementById("showingInfo");
  if (showingInfo) {
    const startItem = (currentPage - 1) * postsPerPage + 1;
    const endItem = Math.min(currentPage * postsPerPage, allPosts.length);
    showingInfo.textContent = `${startItem}-${endItem} arası gösteriliyor, toplam ${allPosts.length} paylaşım`;
  }

  // Buton durumlarını güncelle
  const firstPageBtn = document.getElementById("firstPageBtn");
  const prevPageBtn = document.getElementById("prevPageBtn");
  const nextPageBtn = document.getElementById("nextPageBtn");
  const lastPageBtn = document.getElementById("lastPageBtn");

  if (firstPageBtn) firstPageBtn.disabled = currentPage === 1;
  if (prevPageBtn) prevPageBtn.disabled = currentPage === 1;
  if (nextPageBtn) nextPageBtn.disabled = currentPage === totalPages;
  if (lastPageBtn) lastPageBtn.disabled = currentPage === totalPages;

  // Sayfa numaralarını oluştur
  updatePageNumbers();
}

function updatePageNumbers() {
  const pageNumbers = document.getElementById("pageNumbers");
  if (!pageNumbers) return;

  pageNumbers.innerHTML = "";

  // Sayfa numarası göstermek için mantık
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, currentPage + 2);

  // İlk sayfalar
  if (startPage > 1) {
    pageNumbers.appendChild(createPageButton(1));
    if (startPage > 2) {
      const dots = document.createElement("span");
      dots.textContent = "...";
      dots.className = "page-dots";
      pageNumbers.appendChild(dots);
    }
  }

  // Orta sayfalar
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.appendChild(createPageButton(i));
  }

  // Son sayfalar
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      const dots = document.createElement("span");
      dots.textContent = "...";
      dots.className = "page-dots";
      pageNumbers.appendChild(dots);
    }
    pageNumbers.appendChild(createPageButton(totalPages));
  }
}

function createPageButton(pageNum) {
  const button = document.createElement("button");
  button.textContent = pageNum;
  button.className = `page-number ${pageNum === currentPage ? "active" : ""}`;
  button.onclick = () => goToPage(pageNum);
  return button;
}

// ============================================================================
// POLLING MEKANİZMASI - Çoklu sekme desteği için
// ============================================================================

// Polling değişkenleri
let lastKnownUpdate = Date.now();
let pollingInterval = null;
let isPageActive = true;

// Son güncelleme zamanını kontrol et
async function checkForUpdates() {
  try {
    const response = await fetch("/api/last-update");
    const result = await response.json();

    if (result.lastUpdate > lastKnownUpdate) {
      console.log(
        "Veri değişikliği tespit edildi, postlar yeniden yükleniyor..."
      );
      lastKnownUpdate = result.lastUpdate;
      await loadPosts();
      showToast("📄 Veriler güncellendi!", "info", 2000);
    }
  } catch (error) {
    console.error("Güncelleme kontrol hatası:", error);
  }
}

// Polling'i başlat
function startPolling() {
  // Önceki interval'i temizle
  if (pollingInterval) {
    clearInterval(pollingInterval);
  }

  // Sayfa aktifse daha sık kontrol et (5 saniye), pasifse daha seyrek (30 saniye)
  const interval = isPageActive ? 5000 : 30000;

  pollingInterval = setInterval(() => {
    checkForUpdates();
  }, interval);

  console.log(`Polling başlatıldı: ${interval / 1000} saniye aralık`);
}

// Polling'i durdur
function stopPolling() {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
    console.log("Polling durduruldu");
  }
}

// Sayfa görünürlük durumu değişikliklerini dinle
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    // Sayfa gizlendi (başka sekmeye geçildi)
    isPageActive = false;
    console.log("Sayfa pasif duruma geçti");
    startPolling(); // Daha seyrek polling başlat
  } else {
    // Sayfa aktif hale geldi
    isPageActive = true;
    console.log("Sayfa aktif duruma geçti");
    // Hemen bir kontrol yap
    checkForUpdates();
    // Daha sık polling başlat
    startPolling();
  }
});

// Window focus/blur eventi dinle (ek güvenlik)
window.addEventListener("focus", () => {
  isPageActive = true;
  console.log("Window focus alındı");
  checkForUpdates();
  startPolling();
});

window.addEventListener("blur", () => {
  isPageActive = false;
  console.log("Window focus kaybedildi");
  startPolling();
});

// Sayfa yüklendiğinde polling'i başlat
document.addEventListener("DOMContentLoaded", () => {
  // Mevcut DOMContentLoaded event'ine ek olarak çalışacak
  setTimeout(() => {
    console.log("Polling mekanizması başlatılıyor...");
    startPolling();
  }, 2000); // 2 saniye bekle ki sayfa tamamen yüklensin
});

// Sayfa kapatılırken polling'i temizle
window.addEventListener("beforeunload", () => {
  stopPolling();
});
