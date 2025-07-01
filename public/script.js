// Hesap grupları
// Hesap grupları
const accountGroups = {
  avm: [
    "Özdilek İzmir",
    "Özdilek Eskişehir",
    "Özdilek Afyon",
    "Özdilek Yalova",
    "Özdilek Kocaeli",
    "Özdilek Bolu",
    "Özdilek Nazım",
    "Özdilek Uşak",
    "Özdilek Bursa",
    "Özdilek Düzce",
    "Özdilek Esenyurt",
    "Özdilek ATM",
    "Özdilek Restaurant",
    "Özdilek Vakfı",
  ],
  park: [
    "Özdilek Park Bursa",
    "Özdilek Park Antalya",
    "Özdilek Park İstanbul",
    "Özdilek Park M Geçit",
  ],
  konsept: ["Özdilek Evtekstil", "Özdilekteyim", "Özdilek Fırsatları"],
  markalar: [
    "Orange İnşaat",
    "River Plaza",
    "Özin Sigorta",
    "Tabiat Tarım",
    "My Auto",
    "Özdilek Lokum",
    "Cotonuak Clouds",
  ],
};

const platforms = ["Instagram", "Facebook", "Twitter", "Youtube"];

// Sadece bu hesapların YouTube'u var
const accountsWithYoutube = ["Özdilek Evtekstil", "Özdilekteyim"];

let selectedAccounts = [];

// Sayfalama değişkenleri
let currentPage = 1;
const postsPerPage = 10;
let totalPages = 1;
let allPosts = [];

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
    "avmAccounts",
    "parkAccounts",
    "konseptAccounts",
    "markalarAccounts",
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

  // Platform checkbox'larını ekle
  platforms.forEach((platform) => {
    // Eğer platform YouTube ise ve bu hesabın YouTube'u yoksa, atla
    if (platform === "Youtube" && !accountsWithYoutube.includes(account)) {
      return;
    }

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

  // O hesabın tüm platform checkbox'larını seç/seçme
  platforms.forEach((platform) => {
    // Eğer platform YouTube ise ve bu hesabın YouTube'u yoksa, atla
    if (platform === "Youtube" && !accountsWithYoutube.includes(account)) {
      return;
    }

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

  // O hesabın mevcut platform checkbox'larının durumunu kontrol et
  const platformCheckboxes = platforms
    .filter((platform) => {
      // Eğer platform YouTube ise ve bu hesabın YouTube'u yoksa, dahil etme
      if (platform === "Youtube" && !accountsWithYoutube.includes(account)) {
        return false;
      }
      return true;
    })
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

  // Seçili platformları yeniden ekle
  platforms.forEach((platform) => {
    // Eğer platform YouTube ise ve bu hesabın YouTube'u yoksa, atla
    if (platform === "Youtube" && !accountsWithYoutube.includes(account)) {
      return;
    }

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

// Tümünü seç
function selectAll() {
  console.log("Tümü seçiliyor...");
  selectedAccounts = [];
  Object.values(accountGroups)
    .flat()
    .forEach((account) => {
      platforms.forEach((platform) => {
        // Eğer platform YouTube ise ve bu hesabın YouTube'u yoksa, atla
        if (platform === "Youtube" && !accountsWithYoutube.includes(account)) {
          return;
        }

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
      platforms.forEach((platform) => {
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
    platforms.forEach((platform) => {
      // Eğer platform YouTube ise ve bu hesabın YouTube'u yoksa, atla
      if (platform === "Youtube" && !accountsWithYoutube.includes(account)) {
        return;
      }

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
    return;
  }

  // Story için link ve başlık kontrolü kaldırıldı - artık opsiyonel

  if (selectedAccounts.length === 0) {
    resetSubmitButton();
    showMessage("En az bir hesap seçin!", "error");
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
          resetSubmitButton();
          resetForm();
          loadPosts();

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

// Toggle row
function toggleRow(postId) {
  const detailRow = document.getElementById(`detail-${postId}`);
  const arrow = document.querySelector(`[onclick="toggleRow(${postId})"]`);

  if (detailRow.style.display === "none" || !detailRow.style.display) {
    detailRow.style.display = "table-row";
    arrow.classList.add("expanded");
  } else {
    detailRow.style.display = "none";
    arrow.classList.remove("expanded");
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
      // Progress güncellemesini tetikle
      updateProgressDisplay(postId);
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

// Progress display güncelle
function updateProgressDisplay(postId) {
  // Sadece progress sayısını güncelle, tüm tabloyu yeniden yükleme
  updateProgressCount(postId);
}

// Sadece progress sayısını güncelle
async function updateProgressCount(postId) {
  try {
    const response = await fetch("/api/posts");
    const posts = await response.json();
    const post = posts.find((p) => p.id === postId);

    if (post) {
      const completedCount = post.completedAccounts
        ? post.completedAccounts.length
        : 0;
      const totalCount = post.selectedAccounts
        ? post.selectedAccounts.length
        : 0;

      // Progress text'i güncelle - daha güvenli yöntem
      const detailRow = document.getElementById(`detail-${postId}`);
      if (detailRow) {
        const mainRow = detailRow.previousElementSibling;
        if (mainRow) {
          const progressCell = mainRow.querySelector(".progress-text");
          if (progressCell) {
            progressCell.textContent = `${completedCount}/${totalCount}`;
          }
        }
      }
    }
  } catch (error) {
    console.error("Progress güncelleme hatası:", error);
  }
}

// Post tablosunu render et
function renderPostsTable(posts) {
  const tbody = document.querySelector("#postsTable tbody");
  if (!tbody) {
    console.error("Tablo tbody bulunamadı");
    return;
  }

  tbody.innerHTML = "";

  // Tüm postları saklayalım
  allPosts = posts;

  // Toplam sayfa sayısını hesaplayalım
  totalPages = Math.ceil(posts.length / postsPerPage);

  // Sayfa kontrolleri güncelleyelim
  updatePaginationControls();

  if (posts.length === 0) {
    const tr = document.createElement("tr");
    tr.innerHTML =
      '<td colspan="11" style="text-align: center; padding: 30px; color: #666;">Henüz paylaşım yok</td>';
    tbody.appendChild(tr);

    // Sayfalama konteynerini gizleyelim
    const paginationContainer = document.getElementById("paginationContainer");
    if (paginationContainer) {
      paginationContainer.style.display = "none";
    }
    return;
  }

  // Sayfalama konteynerini gösterelim
  const paginationContainer = document.getElementById("paginationContainer");
  if (paginationContainer) {
    paginationContainer.style.display = "flex";
  }

  // En son oluşturulan paylaşımları ilk sırada göster
  posts.sort((a, b) => {
    // createdAt alanını doğru şekilde parse et
    const parseCreatedAt = (createdAtStr) => {
      if (!createdAtStr) return null;
      // "29.06.2025 16:30:56" formatını "2025-06-29T16:30:56" formatına çevir
      const parts = createdAtStr.split(" ");
      if (parts.length !== 2) return null;

      const datePart = parts[0]; // "29.06.2025"
      const timePart = parts[1]; // "16:30:56"

      const dateSegments = datePart.split(".");
      if (dateSegments.length !== 3) return null;

      const day = dateSegments[0];
      const month = dateSegments[1];
      const year = dateSegments[2];

      // ISO format: YYYY-MM-DDTHH:mm:ss
      const isoFormat = `${year}-${month.padStart(2, "0")}-${day.padStart(
        2,
        "0"
      )}T${timePart}`;
      return new Date(isoFormat);
    };

    const dateA = parseCreatedAt(a.createdAt) || new Date(a.id);
    const dateB = parseCreatedAt(b.createdAt) || new Date(b.id);

    return dateB - dateA; // Büyükten küçüğe (yeniden eskiye)
  });

  // Mevcut sayfa için postları filtreleyelim
  const startIndex = (currentPage - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const currentPagePosts = posts.slice(startIndex, endIndex);

  currentPagePosts.forEach((post) => {
    // Ana satır
    const tr = document.createElement("tr");

    const completedCount = post.completedAccounts
      ? post.completedAccounts.length
      : 0;
    const totalCount = post.selectedAccounts ? post.selectedAccounts.length : 0;

    // İçerik türüne göre içerik metni
    let contentDisplay = "";
    if (post.contentType === "story") {
      if (post.storyLinkTitle) {
        contentDisplay = `<div class="story-content">
          <div class="story-title clickable-story-title" onclick="copyStoryTitle('${post.storyLinkTitle.replace(
            /'/g,
            "\\'"
          )}', event)" title="Başlığı kopyalamak için tıklayın"><strong>📱 Story:</strong> ${
          post.storyLinkTitle
        }</div>
          ${
            post.storyLink
              ? `<div class="story-link"><small><a href="${
                  post.storyLink
                }" onclick="copyStoryLink('${post.storyLink.replace(
                  /'/g,
                  "\\'"
                )}', event)" title="Linki kopyalamak için tıklayın">${
                  post.storyLink.length > 50
                    ? post.storyLink.substring(0, 50) + "..."
                    : post.storyLink
                }</a></small></div>`
              : ""
          }
        </div>`;
      } else {
        contentDisplay = "<strong>📱 Story</strong>";
      }
    } else {
      contentDisplay = post.content && post.content.trim() ? post.content : "-";
    }

    tr.innerHTML = `
            <td>
                <span class="toggle-arrow" onclick="toggleRow(${
                  post.id
                })">▶</span>
            </td>
            <td>
                <span class="content-type-badge ${
                  post.contentType === "story" ? "story" : "post"
                }">
                    ${post.contentType === "story" ? "📱 Story" : "📝 Post"}
                </span>
            </td>
            <td class="content-cell">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div style="flex: 1;">${contentDisplay}</div>
                    <button class="btn btn-info btn-sm copy-btn" 
                            data-content="${contentDisplay
                              .replace(/"/g, "&quot;")
                              .replace(/'/g, "&#39;")}" 
                            title="İçeriği kopyala" 
                            style="margin-left: 10px; flex-shrink: 0;">
                        📋 Kopyala
                    </button>
                </div>
            </td>
            <td class="content-cell">${
              post.notes && post.notes.trim() ? post.notes : "-"
            }</td>
            <td>${new Date(post.scheduledDate).toLocaleDateString("tr-TR")}</td>
            <td>${post.scheduledTime}</td>
            <td>
                ${(() => {
                  // Yeni format: birden fazla dosya
                  if (
                    post.files &&
                    Array.isArray(post.files) &&
                    post.files.length > 0
                  ) {
                    let filesHtml = '<div class="files-list">';
                    post.files.forEach((file, index) => {
                      const fileType =
                        file.mimetype && file.mimetype.includes("image")
                          ? "🖼️"
                          : "🎬";
                      const fileSize = file.size
                        ? `(${(file.size / 1024 / 1024).toFixed(2)} MB)`
                        : "";
                      // Mobil cihazlar için dosya ismini kısalt
                      const isMobile = window.innerWidth <= 768;
                      const fileName = file.originalName || file.fileName;
                      let displayName = fileName;

                      if (isMobile && fileName.length > 25) {
                        const extension = fileName.split(".").pop();
                        const nameWithoutExt = fileName.replace(
                          `.${extension}`,
                          ""
                        );
                        displayName =
                          nameWithoutExt.substring(0, 20) + "..." + extension;
                      }

                      filesHtml += `
                        <div class="file-item-table">
                          <span class="file-icon">${fileType}</span>
                          <a href="/uploads/${file.fileName}" target="_blank" class="file-link" title="${fileName}">
                            ${displayName}
                          </a>
                          <span class="file-size-table">${fileSize}</span>
                          <a href="/api/download/${file.fileName}" download class="download-btn">⬇️</a>
                        </div>
                      `;
                    });
                    filesHtml += "</div>";
                    if (post.files.length > 1) {
                      filesHtml += `<div class="files-count">${post.files.length} dosya</div>`;
                      filesHtml += `<div class="download-all-section">
                        <a href="/api/download-all/${post.id}" class="download-all-btn" title="Tüm dosyaları ZIP olarak indir">
                          📦 Tümünü İndir
                        </a>
                      </div>`;
                    }
                    return filesHtml;
                  }
                  // Eski format: tek dosya (geriye uyumluluk)
                  else if (post.fileName) {
                    const isMobile = window.innerWidth <= 768;
                    const fileName = post.originalName || post.fileName;
                    let displayName = fileName;

                    if (isMobile && fileName.length > 25) {
                      const extension = fileName.split(".").pop();
                      const nameWithoutExt = fileName.replace(
                        `.${extension}`,
                        ""
                      );
                      displayName =
                        nameWithoutExt.substring(0, 20) + "..." + extension;
                    }

                    return `<div>
                        <a href="/uploads/${post.fileName}" target="_blank" class="file-link" title="${fileName}">📎 ${displayName}</a>
                        <a href="/api/download/${post.fileName}" download class="download-btn">⬇️ İndir</a>
                       </div>`;
                  }
                  // Dosya yok
                  else {
                    return '<span style="color: #999;">-</span>';
                  }
                })()}
            </td>
            <td class="progress-text">${completedCount}/${totalCount}</td>
            <td>
                <select class="status-select status-${
                  post.status
                }" onchange="updateStatus(${post.id}, this.value)">
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
            </td>
            <td>${post.createdAt ? post.createdAt : "-"}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-danger btn-sm" onclick="deletePost(${
                      post.id
                    })">🗑️ Sil</button>
                </div>
            </td>
        `;
    tbody.appendChild(tr);

    // Hesapları platform bazında grupla
    const groupedAccounts = {
      "Instagram/Facebook": [],
      Twitter: [],
      Diğer: [],
    };

    post.selectedAccounts.forEach((accountKey) => {
      const [accountName, platform] = accountKey.split("-");
      if (platform === "Instagram" || platform === "Facebook") {
        groupedAccounts["Instagram/Facebook"].push({
          accountKey,
          accountName,
          platform,
        });
      } else if (platform === "Twitter") {
        groupedAccounts["Twitter"].push({ accountKey, accountName, platform });
      } else {
        groupedAccounts["Diğer"].push({ accountKey, accountName, platform });
      }
    });

    // Gruplu HTML oluştur
    let accountsHtml = "";
    Object.keys(groupedAccounts).forEach((groupName) => {
      if (groupedAccounts[groupName].length > 0) {
        accountsHtml += `
                    <div class="platform-group" onclick="event.stopPropagation();">
                        <h4 class="platform-group-title">${groupName}</h4>
                        <div class="platform-accounts">
                `;

        groupedAccounts[groupName].forEach(
          ({ accountKey, accountName, platform }) => {
            const isCompleted =
              post.completedAccounts &&
              post.completedAccounts.includes(accountKey);
            accountsHtml += `
                        <div class="account-progress-item" onclick="event.stopPropagation();">
                            <input type="checkbox" 
                                   ${isCompleted ? "checked" : ""} 
                                   onclick="event.stopPropagation();"
                                   onchange="toggleAccountComplete(${
                                     post.id
                                   }, '${accountKey}', this, event)">
                            <label onclick="event.stopPropagation();">${accountName} - ${platform}</label>
                        </div>
                    `;
          }
        );

        accountsHtml += `
                        </div>
                    </div>
                `;
      }
    });

    // Detay satırı
    const detailTr = document.createElement("tr");
    detailTr.id = `detail-${post.id}`;
    detailTr.style.display = "none";

    detailTr.innerHTML = `
            <td></td>
            <td colspan="9">
                <div class="accounts-detail show" onclick="event.stopPropagation();">
                    <div class="account-progress">
                        ${accountsHtml}
                    </div>
                </div>
            </td>
        `;
    tbody.appendChild(detailTr);
  });

  // Kopyalama butonlarına event listener ekle
  const copyButtons = document.querySelectorAll(".copy-btn");
  copyButtons.forEach((button) => {
    button.addEventListener("click", function (e) {
      e.stopPropagation();
      const content = this.getAttribute("data-content");
      copyContent(content, this);
    });
  });

  // Uzun metinler için devamını oku işlevselliği ekle
  setTimeout(() => {
    // Story başlıkları için
    tbody.querySelectorAll(".story-title").forEach((element) => {
      addStoryTitleReadMore(element, 80);
    });

    // Normal post içerikleri için (story olmayan)
    tbody.querySelectorAll(".content-cell").forEach((cell) => {
      const contentDiv = cell.querySelector("div[style*='flex: 1']");
      if (contentDiv && !contentDiv.querySelector(".story-content")) {
        const textContent = contentDiv.textContent.trim();
        if (textContent.length > 120 && textContent !== "-") {
          addReadMoreFunctionality(contentDiv, 120);
        }
      }
    });

    // Notlar için (4. sütun)
    tbody.querySelectorAll("tr").forEach((row) => {
      const cells = row.querySelectorAll("td");
      if (cells.length > 3) {
        const notesCell = cells[3]; // 4. sütun (0-bazlı index: 3)
        if (notesCell && notesCell.classList.contains("content-cell")) {
          const textContent = notesCell.textContent.trim();
          if (textContent.length > 100 && textContent !== "-") {
            addReadMoreFunctionality(notesCell, 100);
          }
        }
      }
    });
  }, 0);

  console.log("Tablo güncellendi");
}

// Story başlığını kopyala
// Uzun metinler için devamını oku/daha az göster işlevselliği
function addReadMoreFunctionality(element, maxLength = 150) {
  const fullText = element.textContent.trim();

  if (fullText.length <= maxLength) {
    return; // Kısa metinler için işlem yapma
  }

  const shortText = fullText.substring(0, maxLength);
  let isExpanded = false;

  const toggleButton = document.createElement("button");
  toggleButton.className = "content-text-toggle";
  toggleButton.type = "button";

  function updateDisplay() {
    if (isExpanded) {
      element.textContent = fullText;
      toggleButton.textContent = " Daha az göster";
      element.classList.add("expanded");
    } else {
      element.textContent = shortText + "...";
      toggleButton.textContent = " Devamını oku";
      element.classList.remove("expanded");
    }
  }

  toggleButton.addEventListener("click", function (e) {
    e.stopPropagation();
    isExpanded = !isExpanded;
    updateDisplay();
  });

  // Başlangıç durumu
  updateDisplay();
  element.parentNode.insertBefore(toggleButton, element.nextSibling);
}

// Story başlıkları için özel işlevsellik
function addStoryTitleReadMore(element, maxLength = 100) {
  const fullText = element.innerHTML;
  const textContent = element.textContent.trim();

  if (textContent.length <= maxLength) {
    return;
  }

  // Strong tag'ını koruyarak kısa metni oluştur
  const strongPart = fullText.match(/<strong>.*?<\/strong>/);
  const strongText = strongPart ? strongPart[0] : "";
  const remainingText = fullText.replace(strongText, "").trim();
  const shortRemainingText = remainingText.substring(0, maxLength - 20);

  let isExpanded = false;

  const toggleButton = document.createElement("button");
  toggleButton.className = "content-text-toggle";
  toggleButton.type = "button";
  toggleButton.style.marginLeft = "5px";

  function updateDisplay() {
    if (isExpanded) {
      element.innerHTML = fullText;
      toggleButton.textContent = "Daha az";
      element.classList.add("expanded");
    } else {
      element.innerHTML = strongText + " " + shortRemainingText + "...";
      toggleButton.textContent = "Devamı";
      element.classList.remove("expanded");
    }
  }

  toggleButton.addEventListener("click", function (e) {
    e.stopPropagation();
    isExpanded = !isExpanded;
    updateDisplay();
  });

  updateDisplay();
  element.appendChild(toggleButton);
}

function copyStoryTitle(title, event) {
  event.preventDefault();
  event.stopPropagation();

  console.log("Story başlığı kopyalanıyor:", title);

  // Modern clipboard API desteğini kontrol et
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard
      .writeText(title)
      .then(() => {
        showCopyFeedback(event.target, "Başlık kopyalandı!");
        console.log("Story başlığı kopyalandı:", title);
      })
      .catch((err) => {
        console.error("Modern clipboard API hatası:", err);
        copyWithFallbackMethod(title, () =>
          showCopyFeedback(event.target, "Başlık kopyalandı!")
        );
      });
  } else {
    copyWithFallbackMethod(title, () =>
      showCopyFeedback(event.target, "Başlık kopyalandı!")
    );
  }
}

// Story linkini kopyala
function copyStoryLink(link, event) {
  event.preventDefault();
  event.stopPropagation();

  console.log("Story linki kopyalanıyor:", link);

  // Modern clipboard API desteğini kontrol et
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard
      .writeText(link)
      .then(() => {
        showCopyFeedback(event.target, "Link kopyalandı!");
        console.log("Story linki kopyalandı:", link);
      })
      .catch((err) => {
        console.error("Modern clipboard API hatası:", err);
        copyWithFallbackMethod(link, () =>
          showCopyFeedback(event.target, "Link kopyalandı!")
        );
      });
  } else {
    copyWithFallbackMethod(link, () =>
      showCopyFeedback(event.target, "Link kopyalandı!")
    );
  }
}

// Kopyalama geri bildirimi göster
function showCopyFeedback(element, message) {
  // Geçici tooltip oluştur
  const tooltip = document.createElement("div");
  tooltip.className = "copy-tooltip";
  tooltip.textContent = message;
  tooltip.style.position = "fixed";
  tooltip.style.background = "#27ae60";
  tooltip.style.color = "white";
  tooltip.style.padding = "6px 12px";
  tooltip.style.borderRadius = "4px";
  tooltip.style.fontSize = "12px";
  tooltip.style.zIndex = "10000";
  tooltip.style.pointerEvents = "none";
  tooltip.style.transform = "translateX(-50%)";

  // Mobil cihazlarda dokunma konumunu kullan
  const rect = element.getBoundingClientRect();
  tooltip.style.left = rect.left + rect.width / 2 + "px";
  tooltip.style.top = rect.top - 35 + "px";

  document.body.appendChild(tooltip);

  // Element'e geçici stil ekle
  const originalBackground = element.style.background;
  const originalColor = element.style.color;
  element.style.background = "#27ae60";
  element.style.color = "white";

  setTimeout(() => {
    document.body.removeChild(tooltip);
    element.style.background = originalBackground;
    element.style.color = originalColor;
  }, 2000);
}

// Fallback kopyalama metodu
function copyWithFallbackMethod(text, successCallback) {
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    const successful = document.execCommand("copy");
    document.body.removeChild(textArea);

    if (successful) {
      successCallback();
      console.log("İçerik kopyalandı (fallback):", text);
    } else {
      throw new Error("execCommand copy başarısız");
    }
  } catch (fallbackErr) {
    console.error("Fallback kopyalama da başarısız:", fallbackErr);

    // Son çare: kullanıcıya prompt göster
    const fallbackPrompt = confirm(
      "Otomatik kopyalama başarısız oldu. İçeriği manuel olarak kopyalamak ister misiniz?"
    );

    if (fallbackPrompt) {
      const shortText =
        text.length > 200 ? text.substring(0, 200) + "..." : text;
      prompt("Bu içeriği kopyalayın (Ctrl+C):", shortText);
    }
  }
}

// İçeriği kopyala
function copyContent(text, buttonElement) {
  // Önce HTML özel karakterlerini decode et
  let decodedText = text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  // HTML'i formatı koruyarak temizle
  let cleanText = decodedText
    // <br> ve <br/> etiketlerini satır arası ile değiştir
    .replace(/<br\s*\/?>/gi, "\n")
    // <p> etiketlerini satır arası ile değiştir
    .replace(/<\/p>/gi, "\n")
    .replace(/<p[^>]*>/gi, "")
    // <div> etiketlerini satır arası ile değiştir
    .replace(/<\/div>/gi, "\n")
    .replace(/<div[^>]*>/gi, "")
    // Diğer HTML etiketlerini kaldır
    .replace(/<[^>]*>/g, "")
    // Fazla satır aralarını temizle ama formatı koru
    .replace(/\n\s*\n\s*\n/g, "\n\n")
    .trim();

  const plainText = cleanText;

  // Buton görünümünü değiştiren fonksiyon
  function updateButtonSuccess() {
    const originalText = buttonElement.textContent;
    buttonElement.textContent = "✓ Kopyalandı";
    buttonElement.classList.add("copied");

    setTimeout(() => {
      buttonElement.textContent = originalText;
      buttonElement.classList.remove("copied");
    }, 2000);
  }

  // Modern clipboard API desteğini kontrol et
  if (navigator.clipboard && navigator.clipboard.writeText) {
    // Modern API kullan
    navigator.clipboard
      .writeText(plainText)
      .then(() => {
        updateButtonSuccess();
        console.log("İçerik kopyalandı (modern API):", plainText);
      })
      .catch((err) => {
        console.error("Modern clipboard API hatası:", err);
        // Modern API başarısız olursa fallback'e geç
        copyWithFallback(plainText, updateButtonSuccess);
      });
  } else {
    // Direkt fallback kullan
    console.log("Modern clipboard API desteklenmiyor, fallback kullanılıyor");
    copyWithFallback(plainText, updateButtonSuccess);
  }

  // Fallback kopyalama fonksiyonu
  function copyWithFallback(text, successCallback) {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);

      if (successful) {
        successCallback();
        console.log("İçerik kopyalandı (fallback):", text);
      } else {
        throw new Error("execCommand copy başarısız");
      }
    } catch (fallbackErr) {
      console.error("Fallback kopyalama da başarısız:", fallbackErr);

      // Son çare: kullanıcıya prompt göster
      const fallbackPrompt = confirm(
        "Otomatik kopyalama başarısız oldu. İçeriği manuel olarak kopyalamak ister misiniz?"
      );

      if (fallbackPrompt) {
        // Basit bir prompt ile içeriği göster
        const shortText =
          text.length > 200 ? text.substring(0, 200) + "..." : text;
        prompt("Bu içeriği kopyalayın (Ctrl+C):", shortText);
      }
    }
  }
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
      loadPosts();
    } else {
      showMessage("Hata: " + result.message, "error");
    }
  } catch (error) {
    console.error("Durum güncelleme hatası:", error);
    showMessage("Durum güncellenemedi!", "error");
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
      loadPosts();
    } else {
      showMessage("Hata: " + result.message, "error");
    }
  } catch (error) {
    console.error("Post silme hatası:", error);
    showMessage("Paylaşım silinemedi!", "error");
  }
}

// Verileri dışa aktar
function exportData() {
  console.log("Veriler dışa aktarılıyor...");
  window.open("/api/export", "_blank");
}

// Postları yükle
async function loadPosts() {
  console.log("Postlar yükleniyor...");
  try {
    const response = await fetch("/api/posts");
    const posts = await response.json();
    console.log(`${posts.length} post yüklendi`);

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

function renderCurrentPagePosts() {
  if (allPosts.length === 0) {
    return;
  }

  const tbody = document.querySelector("#postsTable tbody");
  if (!tbody) {
    console.error("Tablo tbody bulunamadı");
    return;
  }

  tbody.innerHTML = "";

  // Mevcut sayfa için postları filtreleyelim
  const startIndex = (currentPage - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const currentPagePosts = allPosts.slice(startIndex, endIndex);

  currentPagePosts.forEach((post) => {
    // Ana satır
    const tr = document.createElement("tr");

    const completedCount = post.completedAccounts
      ? post.completedAccounts.length
      : 0;
    const totalCount = post.selectedAccounts ? post.selectedAccounts.length : 0;

    // İçerik türüne göre içerik metni
    let contentDisplay = "";
    if (post.contentType === "story") {
      if (post.storyLinkTitle) {
        contentDisplay = `<div class="story-content">
          <div class="story-title clickable-story-title" onclick="copyStoryTitle('${post.storyLinkTitle.replace(
            /'/g,
            "\\'"
          )}', event)" title="Başlığı kopyalamak için tıklayın"><strong>📱 Story:</strong> ${
          post.storyLinkTitle
        }</div>
          ${
            post.storyLink
              ? `<div class="story-link"><small><a href="${
                  post.storyLink
                }" onclick="copyStoryLink('${post.storyLink.replace(
                  /'/g,
                  "\\'"
                )}', event)" title="Linki kopyalamak için tıklayın">${
                  post.storyLink.length > 50
                    ? post.storyLink.substring(0, 50) + "..."
                    : post.storyLink
                }</a></small></div>`
              : ""
          }
        </div>`;
      } else {
        contentDisplay = "<strong>📱 Story</strong>";
      }
    } else {
      contentDisplay = post.content && post.content.trim() ? post.content : "-";
    }

    tr.innerHTML = `
            <td>
                <span class="toggle-arrow" onclick="toggleRow(${
                  post.id
                })">▶</span>
            </td>
            <td>
                <span class="content-type-badge ${
                  post.contentType === "story" ? "story" : "post"
                }">
                    ${post.contentType === "story" ? "📱 Story" : "📝 Post"}
                </span>
            </td>
            <td class="content-cell">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div style="flex: 1;">${contentDisplay}</div>
                    <button class="btn btn-info btn-sm copy-btn" 
                            data-content="${contentDisplay
                              .replace(/"/g, "&quot;")
                              .replace(/'/g, "&#39;")}" 
                            title="İçeriği kopyala" 
                            style="margin-left: 10px; flex-shrink: 0;">
                        📋 Kopyala
                    </button>
                </div>
            </td>
            <td class="content-cell">${
              post.notes && post.notes.trim() ? post.notes : "-"
            }</td>
            <td>${new Date(post.scheduledDate).toLocaleDateString("tr-TR")}</td>
            <td>${post.scheduledTime}</td>
            <td>
                ${(() => {
                  // Yeni format: birden fazla dosya
                  if (
                    post.files &&
                    Array.isArray(post.files) &&
                    post.files.length > 0
                  ) {
                    let filesHtml = '<div class="files-list">';
                    post.files.forEach((file, index) => {
                      const fileType =
                        file.mimetype && file.mimetype.includes("image")
                          ? "🖼️"
                          : "🎬";
                      const fileSize = file.size
                        ? `(${(file.size / 1024 / 1024).toFixed(2)} MB)`
                        : "";
                      filesHtml += `
                        <div class="file-item-table">
                          <span class="file-icon">${fileType}</span>
                          <a href="/uploads/${
                            file.fileName
                          }" target="_blank" class="file-link">
                            ${file.originalName || file.fileName}
                          </a>
                          <span class="file-size-table">${fileSize}</span>
                          <a href="/api/download/${
                            file.fileName
                          }" download class="download-btn">⬇️</a>
                        </div>
                      `;
                    });
                    filesHtml += "</div>";
                    if (post.files.length > 1) {
                      filesHtml += `<div class="files-count">${post.files.length} dosya</div>`;
                    }
                    return filesHtml;
                  }
                  // Eski format: tek dosya (geriye uyumluluk)
                  else if (post.fileName) {
                    return `<div>
                        <a href="/uploads/${
                          post.fileName
                        }" target="_blank" class="file-link">📎 ${
                      post.originalName || post.fileName
                    }</a>
                        <a href="/api/download/${
                          post.fileName
                        }" download class="download-btn">⬇️ İndir</a>
                       </div>`;
                  }
                  // Dosya yok
                  else {
                    return '<span style="color: #999;">-</span>';
                  }
                })()}
            </td>
            <td class="progress-text">${completedCount}/${totalCount}</td>
            <td>
                <select class="status-select status-${
                  post.status
                }" onchange="updateStatus(${post.id}, this.value)">
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
            </td>
            <td>${post.createdAt ? post.createdAt : "-"}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-danger btn-sm" onclick="deletePost(${
                      post.id
                    })" title="Sil">
                        🗑️ Sil
                    </button>
                </div>
            </td>
        `;
    tbody.appendChild(tr);

    // Detay satırı
    const detailTr = document.createElement("tr");
    detailTr.id = `detail-${post.id}`;
    detailTr.style.display = "none";

    // Hesapları gruplara ayır
    const accountGroups = {};
    if (post.selectedAccounts) {
      post.selectedAccounts.forEach((account) => {
        const parts = account.split("-");
        const accountName = parts[0];
        const platform = parts[1];

        if (!accountGroups[accountName]) {
          accountGroups[accountName] = [];
        }
        accountGroups[accountName].push(platform);
      });
    }

    let accountsHtml = "";
    Object.keys(accountGroups).forEach((accountName) => {
      const platforms = accountGroups[accountName];
      accountsHtml += `
                <div class="platform-group">
                    <div class="platform-group-title">${accountName}</div>
                    <div class="platform-accounts">
                        ${platforms
                          .map((platform) => {
                            const accountKey = `${accountName}-${platform}`;
                            const isCompleted =
                              post.completedAccounts &&
                              post.completedAccounts.includes(accountKey);
                            return `
                            <div class="account-progress-item">
                                <input type="checkbox" 
                                       id="progress-${post.id}-${accountKey}" 
                                       ${isCompleted ? "checked" : ""} 
                                       onchange="toggleAccountComplete(${
                                         post.id
                                       }, '${accountKey}', this, event)" />
                                <label for="progress-${post.id}-${accountKey}">
                                    ${platform}
                                </label>
                            </div>
                        `;
                          })
                          .join("")}
                    </div>
                </div>
            `;
    });

    detailTr.innerHTML = `
            <td colspan="11">
                <div class="accounts-detail show" onclick="event.stopPropagation();">
                    <div class="account-progress">
                        ${accountsHtml}
                    </div>
                </div>
            </td>
        `;
    tbody.appendChild(detailTr);
  });

  // Kopyalama butonlarına event listener ekle
  const copyButtons = document.querySelectorAll(".copy-btn");
  copyButtons.forEach((button) => {
    button.addEventListener("click", function (e) {
      e.stopPropagation();
      const content = this.getAttribute("data-content");
      copyContent(content, this);
    });
  });

  // Uzun metinler için devamını oku işlevselliği ekle
  setTimeout(() => {
    // Story başlıkları için
    tbody.querySelectorAll(".story-title").forEach((element) => {
      addStoryTitleReadMore(element, 80);
    });

    // Normal post içerikleri için (story olmayan)
    tbody.querySelectorAll(".content-cell").forEach((cell) => {
      const contentDiv = cell.querySelector("div[style*='flex: 1']");
      if (contentDiv && !contentDiv.querySelector(".story-content")) {
        const textContent = contentDiv.textContent.trim();
        if (textContent.length > 120 && textContent !== "-") {
          addReadMoreFunctionality(contentDiv, 120);
        }
      }
    });

    // Notlar için (4. sütun)
    tbody.querySelectorAll("tr").forEach((row) => {
      const cells = row.querySelectorAll("td");
      if (cells.length > 3) {
        const notesCell = cells[3]; // 4. sütun (0-bazlı index: 3)
        if (notesCell && notesCell.classList.contains("content-cell")) {
          const textContent = notesCell.textContent.trim();
          if (textContent.length > 100 && textContent !== "-") {
            addReadMoreFunctionality(notesCell, 100);
          }
        }
      }
    });
  }, 0);

  console.log("Mevcut sayfa postları güncellendi");
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
