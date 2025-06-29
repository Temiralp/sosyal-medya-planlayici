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
let selectedAccounts = [];

// Sayfa yüklendiğinde
document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM yüklendi, başlatılıyor...");

  // Elementlerin varlığını kontrol et
  const requiredElements = [
    "avmAccounts",
    "parkAccounts",
    "konceptAccounts",
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

  platforms.forEach((platform) => {
    const checkboxDiv = document.createElement("div");
    checkboxDiv.className = "platform-checkbox";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = `${account}-${platform}`;
    checkbox.addEventListener("change", handleAccountSelection);

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

// Hesap seçimi değiştiğinde
function handleAccountSelection(event) {
  const accountKey = event.target.id;

  if (event.target.checked) {
    if (!selectedAccounts.includes(accountKey)) {
      selectedAccounts.push(accountKey);
    }
  } else {
    selectedAccounts = selectedAccounts.filter((acc) => acc !== accountKey);
  }

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
        const accountKey = `${account}-${platform}`;
        selectedAccounts.push(accountKey);
        const checkbox = document.getElementById(accountKey);
        if (checkbox) checkbox.checked = true;
      });
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
    });
  updateSelectedCount();
}

// Grup seç
function selectGroup(groupKey) {
  console.log(`${groupKey} grubu seçiliyor...`);
  if (!accountGroups[groupKey]) return;

  accountGroups[groupKey].forEach((account) => {
    platforms.forEach((platform) => {
      const accountKey = `${account}-${platform}`;
      if (!selectedAccounts.includes(accountKey)) {
        selectedAccounts.push(accountKey);
      }
      const checkbox = document.getElementById(accountKey);
      if (checkbox) checkbox.checked = true;
    });
  });
  updateSelectedCount();
}

// Dosya seçimi
function handleFileSelect(event) {
  console.log("Dosya seçildi");
  const file = event.target.files[0];
  const preview = document.getElementById("filePreview");

  if (file) {
    preview.textContent = `📎 Seçilen dosya: ${file.name}`;
    preview.style.display = "block";
    console.log(`Dosya: ${file.name}`);
  } else {
    preview.style.display = "none";
  }
}

// Form submit
async function handleFormSubmit(event) {
  event.preventDefault();
  console.log("Form gönderiliyor...");

  const content = document.getElementById("content").value;
  const scheduledDate = document.getElementById("scheduledDate").value;
  const scheduledTime = document.getElementById("scheduledTime").value;
  const fileInput = document.getElementById("fileInput");

  console.log("Form verileri:", {
    content,
    scheduledDate,
    scheduledTime,
    selectedAccounts: selectedAccounts.length,
  });

  if (!content || !scheduledDate || !scheduledTime) {
    showMessage("Lütfen tüm alanları doldurun!", "error");
    return;
  }

  if (selectedAccounts.length === 0) {
    showMessage("En az bir hesap seçin!", "error");
    return;
  }

  const formData = new FormData();
  formData.append("content", content);
  formData.append("scheduledDate", scheduledDate);
  formData.append("scheduledTime", scheduledTime);
  formData.append("selectedAccounts", JSON.stringify(selectedAccounts));

  if (fileInput.files[0]) {
    formData.append("file", fileInput.files[0]);
    console.log("Dosya eklendi");
  }

  try {
    console.log("API'ye gönderiliyor...");
    const response = await fetch("/api/posts", {
      method: "POST",
      body: formData,
    });

    console.log("API yanıtı alındı:", response.status);
    const result = await response.json();
    console.log("API sonucu:", result);

    if (result.success) {
      showMessage("Paylaşım başarıyla planlandı!", "success");
      resetForm();
      loadPosts();
    } else {
      showMessage("Hata: " + result.message, "error");
    }
  } catch (error) {
    console.error("API Hatası:", error);
    showMessage("Sunucu hatası!", "error");
  }
}

// Form sıfırla
function resetForm() {
  console.log("Form sıfırlanıyor...");
  document.getElementById("postForm").reset();
  selectedAccounts = [];
  clearAll();
  const preview = document.getElementById("filePreview");
  if (preview) preview.style.display = "none";
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

  if (posts.length === 0) {
    const tr = document.createElement("tr");
    tr.innerHTML =
      '<td colspan="8" style="text-align: center; padding: 30px; color: #666;">Henüz paylaşım yok</td>';
    tbody.appendChild(tr);
    return;
  }

  posts.sort(
    (a, b) =>
      new Date(`${a.scheduledDate} ${a.scheduledTime}`) -
      new Date(`${b.scheduledDate} ${b.scheduledTime}`)
  );

  posts.forEach((post) => {
    // Ana satır
    const tr = document.createElement("tr");

    const completedCount = post.completedAccounts
      ? post.completedAccounts.length
      : 0;
    const totalCount = post.selectedAccounts ? post.selectedAccounts.length : 0;

    tr.innerHTML = `
            <td>
                <span class="toggle-arrow" onclick="toggleRow(${
                  post.id
                })">▶</span>
            </td>
            <td class="content-cell">${post.content}</td>
            <td>${new Date(post.scheduledDate).toLocaleDateString("tr-TR")}</td>
            <td>${post.scheduledTime}</td>
            <td>
                ${
                  post.fileName
                    ? `<a href="/uploads/${
                        post.fileName
                      }" target="_blank" class="file-link">📎 ${
                        post.originalName || post.fileName
                      }</a>`
                    : '<span style="color: #999;">-</span>'
                }
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
                <button class="btn btn-danger btn-sm" onclick="deletePost(${
                  post.id
                })">🗑️ Sil</button>
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
            <td colspan="7">
                <div class="accounts-detail show" onclick="event.stopPropagation();">
                    <div class="account-progress">
                        ${accountsHtml}
                    </div>
                </div>
            </td>
        `;
    tbody.appendChild(detailTr);
  });

  console.log("Tablo güncellendi");
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
