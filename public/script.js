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
    storyLink.required = true;
    storyLinkTitle.required = true;
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

  // O hesabın tüm platform checkbox'larının durumunu kontrol et
  const platformCheckboxes = platforms
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

  const contentType = document.querySelector(
    'input[name="contentType"]:checked'
  ).value;
  const content = document.getElementById("content").value;
  const notes = document.getElementById("notes").value;
  const storyLink = document.getElementById("storyLink").value;
  const storyLinkTitle = document.getElementById("storyLinkTitle").value;
  const scheduledDate = document.getElementById("scheduledDate").value;
  const scheduledTime = document.getElementById("scheduledTime").value;
  const fileInput = document.getElementById("fileInput");

  console.log("Form verileri:", {
    contentType,
    content,
    notes,
    storyLink,
    storyLinkTitle,
    scheduledDate,
    scheduledTime,
    selectedAccounts: selectedAccounts.length,
  });

  // Validation
  if (!scheduledDate || !scheduledTime) {
    showMessage("Lütfen tarih ve saat alanlarını doldurun!", "error");
    return;
  }

  if (contentType === "post" && !content) {
    showMessage("Lütfen post içeriğini yazın!", "error");
    return;
  }

  if (contentType === "story" && (!storyLink || !storyLinkTitle)) {
    showMessage(
      "Lütfen story için link ve başlık alanlarını doldurun!",
      "error"
    );
    return;
  }

  if (selectedAccounts.length === 0) {
    showMessage("En az bir hesap seçin!", "error");
    return;
  }

  const formData = new FormData();
  formData.append("contentType", contentType);
  formData.append("content", content);
  formData.append("notes", notes);
  formData.append("storyLink", storyLink);
  formData.append("storyLinkTitle", storyLinkTitle);
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
      '<td colspan="10" style="text-align: center; padding: 30px; color: #666;">Henüz paylaşım yok</td>';
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

    // İçerik türüne göre içerik metni
    let contentDisplay = "";
    if (post.contentType === "story") {
      contentDisplay = post.storyLinkTitle
        ? `<strong>📱 Story:</strong> ${post.storyLinkTitle}${
            post.storyLink
              ? `<br><small><a href="${post.storyLink}" target="_blank">${post.storyLink}</a></small>`
              : ""
          }`
        : "<strong>📱 Story</strong>";
    } else {
      contentDisplay = post.content || "-";
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
            <td class="content-cell">${contentDisplay}</td>
            <td class="content-cell">${post.notes || "-"}</td>
            <td>${new Date(post.scheduledDate).toLocaleDateString("tr-TR")}</td>
            <td>${post.scheduledTime}</td>
            <td>
                ${
                  post.fileName
                    ? `<div>
                        <a href="/uploads/${
                          post.fileName
                        }" target="_blank" class="file-link">📎 ${
                        post.originalName || post.fileName
                      }</a>
                        <a href="/uploads/${
                          post.fileName
                        }" download class="download-btn">⬇️ İndir</a>
                       </div>`
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
                <div class="action-buttons">
                    <button class="btn btn-info btn-sm copy-btn" onclick="copyContent('${contentDisplay
                      .replace(/'/g, "\\'")
                      .replace(
                        /"/g,
                        "&quot;"
                      )}', this)" title="İçeriği kopyala">
                        📋 Kopyala
                    </button>
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

  console.log("Tablo güncellendi");
}

// İçeriği kopyala
function copyContent(text, buttonElement) {
  // HTML'i formatı koruyarak temizle
  let cleanText = text
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
    // HTML özel karakterlerini çöz
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    // Fazla satır aralarını temizle ama formatı koru
    .replace(/\n\s*\n\s*\n/g, "\n\n")
    .trim();

  const plainText = cleanText;

  // Kopyalama işlemi
  navigator.clipboard
    .writeText(plainText)
    .then(() => {
      // Buton görünümünü değiştir
      const originalText = buttonElement.textContent;
      buttonElement.textContent = "✓ Kopyalandı";
      buttonElement.classList.add("copied");

      // 2 saniye sonra orijinal haline dön
      setTimeout(() => {
        buttonElement.textContent = originalText;
        buttonElement.classList.remove("copied");
      }, 2000);

      console.log("İçerik kopyalandı:", plainText);
    })
    .catch((err) => {
      console.error("Kopyalama hatası:", err);

      // Fallback: eski yöntem
      try {
        const textArea = document.createElement("textarea");
        textArea.value = plainText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);

        // Buton görünümünü değiştir
        const originalText = buttonElement.textContent;
        buttonElement.textContent = "✓ Kopyalandı";
        buttonElement.classList.add("copied");

        setTimeout(() => {
          buttonElement.textContent = originalText;
          buttonElement.classList.remove("copied");
        }, 2000);

        console.log("İçerik kopyalandı (fallback):", plainText);
      } catch (fallbackErr) {
        console.error("Fallback kopyalama da başarısız:", fallbackErr);
        alert(
          "Kopyalama işlemi başarısız oldu. Lütfen manuel olarak kopyalayın."
        );
      }
    });
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
