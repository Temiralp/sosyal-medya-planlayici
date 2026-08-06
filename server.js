// Process-level unhandled exception shields to prevent Puppeteer frame detachment crashes
process.on("unhandledRejection", (reason, promise) => {
  console.log("[Process] Yakalanamayan unhandledRejection yoksayıldı:", reason.message || reason);
});

process.on("uncaughtException", (error) => {
  console.log("[Process] Yakalanamayan uncaughtException yoksayıldı:", error.message || error);
});

const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const archiver = require("archiver");
const http = require("http");
const { Server } = require("socket.io");
const cookieParser = require("cookie-parser");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "10gb" }));
app.use(express.urlencoded({ limit: "10gb", extended: true }));
app.use(cookieParser());

// Authentication Middleware
const isAuthenticated = (req, res, next) => {
  const token = req.cookies.auth_token;
  if (token === "admin" || token === "kut" || token === "admin_logged_in") {
    res.cookie("auth_token", token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
    next();
  } else {
    if (req.path.startsWith("/api")) {
      res.status(401).json({ success: false, message: "Unauthorized" });
    } else {
      res.redirect("/login.html");
    }
  }
};

// Public Routes
app.use(express.static("public"));

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if ((username === "admin" || username === "kut") && password === "ozdilek123!") {
    res.cookie("auth_token", username, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }); // 1 day
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: "Hatalı kullanıcı adı veya şifre" });
  }
});

app.get("/logout", (req, res) => {
  res.clearCookie("auth_token");
  res.redirect("/login.html");
});

// Protected File Routes
app.get("/", isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "private", "dashboard.html"));
});

// Protect all API routes
app.use("/api", isAuthenticated);

// Klasörleri oluştur
const createDirectories = () => {
  const dirs = ["uploads", "data"];
  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// Dosya yükleme ayarları
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 1024 * 10, // 10GB dosya boyutu limiti
    files: 500, // Maksimum 500 dosya
    fields: 1000, // Maksimum 1000 form alanı
    fieldSize: 100 * 1024 * 1024, // Her bir form alanı için 100MB limit
    fieldNameSize: 200, // Form alanı adı için maksimum karakter sayısı
  },
});

// Veri dosyası yolu
const DATA_FILE = "./data/posts.json";

// Son güncelleme zamanını takip et
let lastDataUpdate = Date.now();

// Aktif düzenlenen paylaşımları takip et (postId -> { clientId, lastActive })
const activeEdits = new Map();
const EDIT_TIMEOUT = 10000; // 10 saniye hareketsizlikte lock düşer

// Aktif görüntülenen paylaşımları takip et (postId -> { clientId, lastActive })
const activeViews = new Map();
const VIEW_TIMEOUT = 10000; // 10 saniye hareketsizlikte lock düşer

const cleanExpiredLocks = () => {
  const now = Date.now();
  // Düzenleme kilitlerini temizle
  for (const [postId, editInfo] of activeEdits.entries()) {
    if (now - editInfo.lastActive > EDIT_TIMEOUT) {
      activeEdits.delete(postId);
      console.log(`Edit lock expired for post ${postId}`);
    }
  }
  // Görüntüleme kilitlerini temizle
  for (const [postId, viewInfo] of activeViews.entries()) {
    if (now - viewInfo.lastActive > VIEW_TIMEOUT) {
      activeViews.delete(postId);
      console.log(`View lock expired for post ${postId}`);
    }
  }
};

// Veri okuma fonksiyonu
const readPosts = () => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      console.log("Veri dosyası bulundu:", DATA_FILE);
      const fileStats = fs.statSync(DATA_FILE);
      console.log("Dosya boyutu:", fileStats.size, "bytes");

      const data = fs.readFileSync(DATA_FILE, "utf8");
      console.log("Dosya okundu, veri uzunluğu:", data.length, "karakter");

      if (data.trim() === "") {
        console.log("Dosya boş, boş dizi döndürülüyor");
        return [];
      }

      const parsedData = JSON.parse(data);
      console.log("JSON parse edildi, post sayısı:", parsedData.length);
      return parsedData;
    } else {
      console.log("Veri dosyası bulunamadı, boş dizi döndürülüyor");
      return [];
    }
  } catch (error) {
    console.error("Veri okuma hatası detayı:", error);
    console.error("Error code:", error.code);
    console.error("Error path:", error.path);

    // Eğer dosya bozuksa yedek al ve sıfırla
    if (error instanceof SyntaxError) {
      console.error("JSON parse hatası, dosya bozuk olabilir");
      try {
        const backupFile = DATA_FILE + ".backup." + Date.now();
        fs.copyFileSync(DATA_FILE, backupFile);
        console.log("Bozuk dosya yedeklendi:", backupFile);
      } catch (backupError) {
        console.error("Yedekleme hatası:", backupError);
      }
    }

    return [];
  }
};

// Veri yazma fonksiyonu
const writePosts = (posts) => {
  try {
    // Veri dizininin var olduğundan emin ol
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log("Data klasörü oluşturuldu:", dir);
    }

    // Manuel sıralama varsa ona göre, değilse oluşturma tarihine göre sırala (en yeni en başta)
    const sortedPosts = posts.sort((a, b) => {
      // Öncelikle manuel sıralama var mı kontrol et
      if (a.manualOrder !== undefined && b.manualOrder !== undefined) {
        // Her ikisinde de manuel sıralama varsa, ona göre sırala
        return a.manualOrder - b.manualOrder;
      }

      // Kullanıcı sürükle bırak yaptıysa manualOrder'a göre sırala
      if (a.manualOrder !== undefined) return -1;
      if (b.manualOrder !== undefined) return 1;

      // Hiçbirinde manuel sıralama yoksa, ID'ye göre sırala (en yeni en üstte)
      // ID'ler timestamp bazlı olduğu için doğru sıralama yapacak
      return b.id - a.id;
    });

    // JSON'u string'e çevir
    const jsonData = JSON.stringify(sortedPosts, null, 2);
    console.log("JSON veri boyutu:", jsonData.length, "karakter");

    // Dosyaya yaz
    fs.writeFileSync(DATA_FILE, jsonData, "utf8");
    console.log("Veri başarıyla yazıldı:", DATA_FILE);

    // Güncelleme zamanını güncelle
    lastDataUpdate = Date.now();

    // Yazılan veriyi doğrula
    if (fs.existsSync(DATA_FILE)) {
      const fileSize = fs.statSync(DATA_FILE).size;
      console.log("Dosya boyutu:", fileSize, "bytes");

      // Çok küçük sunucularda dosya yazma gecikmesi olabilir, kısa bir bekleme ekle
      if (process.env.NODE_ENV === "production") {
        // Üretim ortamında dosya yazma işleminin tamamlanması için kısa bekleme
        const start = Date.now();
        while (Date.now() - start < 50) { } // 50ms bekleme
      }

      return true;
    } else {
      console.error("Dosya yazıldıktan sonra bulunamadı");
      return false;
    }
  } catch (error) {
    console.error("Veri yazma hatası detayı:", error);
    console.error("Error code:", error.code);
    console.error("Error path:", error.path);
    return false;
  }
};

// Başlangıçta klasörleri oluştur
createDirectories();

// Gerçek zamanlı güncelleme kaldırıldı - HTTP istekleri ile çalışıyor
const notifyPostUpdate = () => {
  // Socket.IO kaldırıldı - bu fonksiyon artık boş
  // Ancak güncelleme zamanını güncelleyelim
  lastDataUpdate = Date.now();
};

// Ana sayfa
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// ============================================================================
// WHATSAPP BOT ENTEGRASYONU (whatsapp-web.js)
// ============================================================================
const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const qrcode = require("qrcode");

let whatsappState = {
  status: "disconnected", // disconnected, connecting, connected
  qr: "",
  userInfo: null
};

let whatsappConfig = {
  targetGroupId: ""
};

const configPath = path.join(__dirname, "data", "whatsapp_config.json");

function loadWhatsappConfig() {
  try {
    if (fs.existsSync(configPath)) {
      whatsappConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    }
  } catch (err) {
    console.error("WhatsApp config okuma hatası:", err);
  }
}
loadWhatsappConfig();

function saveWhatsappConfig() {
  try {
    const dir = path.dirname(configPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(configPath, JSON.stringify(whatsappConfig, null, 2), "utf-8");
  } catch (err) {
    console.error("WhatsApp config yazma hatası:", err);
  }
}

// WhatsApp Client oluştur
// WhatsApp Client oluştur
let client = new Client({
  authStrategy: new LocalAuth({
    dataPath: path.join(__dirname, ".wwebjs_auth")
  }),
  puppeteer: {
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox"
    ]
  }
});

function registerClientEvents(c) {
  c.on("qr", (qr) => {
    console.log("WhatsApp QR kodu üretildi");
    qrcode.toDataURL(qr, (err, url) => {
      if (err) {
        console.error("QR kod oluşturma hatası:", err);
        return;
      }
      whatsappState.status = "connecting";
      whatsappState.qr = url;
      whatsappState.userInfo = null;
      io.emit("whatsappStatus", whatsappState);
    });
  });

  c.on("ready", () => {
    console.log("WhatsApp Bot hazır!");
    whatsappState.status = "connected";
    whatsappState.qr = "";
    whatsappState.userInfo = c.info.pushname || c.info.wid.user;
    io.emit("whatsappStatus", whatsappState);
  });

  c.on("authenticated", () => {
    console.log("WhatsApp oturumu doğrulandı");
  });

  c.on("auth_failure", (msg) => {
    console.error("WhatsApp doğrulama hatası:", msg);
    whatsappState.status = "disconnected";
    whatsappState.qr = "";
    whatsappState.userInfo = null;
    io.emit("whatsappStatus", whatsappState);
  });

  c.on("disconnected", (reason) => {
    console.log("WhatsApp bağlantısı koptu:", reason);
    whatsappState.status = "disconnected";
    whatsappState.qr = "";
    whatsappState.userInfo = null;
    io.emit("whatsappStatus", whatsappState);
  });

  c.on("message_create", async (msg) => {
    if (msg.body === "!grup" || msg.body === "!group" || msg.body.includes("!grup")) {
      try {
        const chatJid = msg.fromMe ? msg.to : msg.from;
        latestDetectedGroupId = chatJid;
        console.log("=========================================");
        console.log("WHATSAPP HEDEF SOHBET/GRUP ID TESPİT EDİLDİ:", chatJid);
        console.log("=========================================");
        
        try {
          await c.sendMessage(chatJid, `Bu grubun ID'si: ${chatJid}\n\nBu ID'yi kopyalayıp paneldeki ilgili alana yapıştırabilir veya panelden "Gruptan ID'yi Çek" butonuna basabilirsiniz.`);
        } catch (sendErr) {
          console.log("Bot yanıt gönderemedi (mesaj iletilemedi):", sendErr.message || sendErr);
        }
      } catch (err) {
        console.error("!grup komutu işlenirken hata:", err);
      }
    }
  });
}

registerClientEvents(client);

let latestDetectedGroupId = "";

async function recreateWhatsappClient(clearSession = false) {
  console.log(`[WhatsApp] Yeniden başlatma tetiklendi. Oturum temizleme: ${clearSession}`);
  
  whatsappState.status = "connecting";
  whatsappState.qr = "";
  whatsappState.userInfo = null;
  io.emit("whatsappStatus", whatsappState);

  try {
    if (client) {
      console.log("[WhatsApp] Eski istemci yok ediliyor...");
      await client.destroy();
      console.log("[WhatsApp] Eski istemci başarıyla yok edildi. 3 saniye bekleniyor...");
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  } catch (err) {
    console.log("[WhatsApp] Eski istemci yok edilirken hata (yoksayılıyor):", err.message || err);
  }

  // Arka plan Chrome süreçlerini temizle (dosya kilitlerini önlemek için) - Senkron bekleyelim
  await new Promise((resolve) => {
    try {
      const { exec } = require("child_process");
      exec('powershell "Get-CimInstance Win32_Process -Filter \\"Name = \'chrome.exe\'\\" | Where-Object { $_.CommandLine -like \'*wwebjs_auth*\' } | ForEach-Object { Stop-Process $_.ProcessId -Force }"', (err) => {
        if (err) console.log("[WhatsApp] Arka plan Chrome temizleme hatası:", err.message);
        resolve();
      });
    } catch (killErr) {
      console.log("[WhatsApp] Arka plan Chrome temizleme hatası:", killErr.message);
      resolve();
    }
  });

  if (clearSession) {
    try {
      const fsExtra = require("fs");
      const authPath = path.join(__dirname, ".wwebjs_auth");
      const cachePath = path.join(__dirname, ".wwebjs_cache");
      if (fsExtra.existsSync(authPath)) {
        fsExtra.rmSync(authPath, { recursive: true, force: true });
      }
      if (fsExtra.existsSync(cachePath)) {
        fsExtra.rmSync(cachePath, { recursive: true, force: true });
      }
      console.log("[WhatsApp] Oturum ve önbellek klasörleri silindi.");
    } catch (fsErr) {
      console.log("[WhatsApp] Oturum klasörleri silinirken hata:", fsErr.message);
    }
  }

  client = new Client({
    authStrategy: new LocalAuth({
      dataPath: path.join(__dirname, ".wwebjs_auth")
    }),
    puppeteer: {
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox"
      ]
    }
  });

  registerClientEvents(client);

  try {
    client.initialize();
  } catch (error) {
    console.error("WhatsApp bot başlatma hatası:", error);
  }
}

try {
  client.initialize();
} catch (error) {
  console.error("WhatsApp bot başlatma hatası:", error);
}

// Socket bağlantılarını dinle
io.on("connection", (socket) => {
  console.log("Soket bağlantısı kuruldu:", socket.id);
  // Bağlanan kullanıcıya güncel durum bilgisini hemen gönder
  socket.emit("whatsappStatus", whatsappState);
});

// Helper function to send post via WhatsApp Web Bot
async function sendPostToWhatsappBot(post) {
  console.log(`[WhatsApp Bot] Gönderim başlatıldı. Hedef: ${whatsappConfig.targetGroupId}, Post ID: ${post.id}`);
  if (whatsappState.status !== "connected") {
    throw new Error("WhatsApp botu bağlı değil.");
  }
  if (!whatsappConfig.targetGroupId) {
    throw new Error("Hedef WhatsApp grubu seçilmemiş.");
  }

  let text = `📢 *SOSYAL MEDYA PAYLAŞIM DETAYI*\n\n`;
  text += `*Başlık:* ${post.title || "-"}\n`;
  const typeStr = post.contentType === "story" ? "Story" : post.contentType === "combined" ? "Post ve Story" : "Post";
  text += `*Tür:* ${typeStr}\n`;
  text += `*Tarih:* ${post.scheduledDate} • ${post.scheduledTime}\n`;
  if (post.content) {
    text += `\n*Açıklama/İçerik:*\n${post.content}\n`;
  }
  if (post.notes) {
    text += `\n*Notlar:*\n${post.notes}\n`;
  }
  if (post.storyLink) {
    text += `\n*Story Link:* ${post.storyLink}\n`;
    if (post.storyLinkTitle) {
      text += `*Link Başlığı:* ${post.storyLinkTitle}\n`;
    }
  }
  if (post.selectedAccounts && post.selectedAccounts.length > 0) {
    text += `\n*Hesaplar:* ${post.selectedAccounts.join(", ")}\n`;
  }

  // Önce metin detayını gönder
  await client.sendMessage(whatsappConfig.targetGroupId, text);
  console.log("[WhatsApp Bot] Metin detayı gönderildi.");

  // Files
  let filesToSend = [];
  if (post.files && post.files.length > 0) {
    filesToSend = post.files;
  } else if (post.fileName) {
    filesToSend = [{ fileName: post.fileName }];
  }

  if (filesToSend.length > 0) {
    let sentMediaCount = 0;
    for (let i = 0; i < filesToSend.length; i++) {
      const fileInfo = filesToSend[i];
      const filePath = path.join(__dirname, "uploads", fileInfo.fileName);
      if (fs.existsSync(filePath)) {
        console.log(`[WhatsApp Bot] Medya dosyası gönderiliyor: ${fileInfo.fileName}`);
        const media = MessageMedia.fromFilePath(filePath);
        await client.sendMessage(whatsappConfig.targetGroupId, media, { sendMediaAsDocument: true });
        sentMediaCount++;
      } else {
        console.log(`[WhatsApp Bot] Dosya uploads klasöründe bulunamadı: ${filePath}`);
      }
    }
    if (sentMediaCount > 0) {
      console.log(`[WhatsApp Bot] Toplam ${sentMediaCount} adet dosya peşinden gönderildi.`);
    }
  }
}

// Moment.js'i dahil et
const moment = require("moment");

// Bildirim gönderilen postları takip etmek için bir Map (post_id -> gönderilen bildirim türleri)
const notifiedPosts = new Map();

const parseNullableInt = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

// Her dakika çalışacak bildirim kontrol fonksiyonu
setInterval(() => {
  const posts = readPosts();
  const now = moment();
  const nowIstanbul = moment().utcOffset(180);
  const latePostsToNotify = [];

  posts.forEach((post) => {
    if (post.status === "yapıldı") {
      return;
    }

    const scheduledDateTime = moment(
      `${post.scheduledDate} ${post.scheduledTime}`,
      "YYYY-MM-DD HH:mm"
    );
    const diffMinutes = scheduledDateTime.diff(now, "minutes");
    const sentNotifications = notifiedPosts.get(post.id) || new Set();

    let notificationMessage = "";
    let notificationType = "";

    if (
      diffMinutes > 0 &&
      diffMinutes <= 65 &&
      diffMinutes > 55 &&
      !sentNotifications.has("1hour")
    ) {
      notificationMessage = `DİKKAT: '${post.title}' başlıklı paylaşımınızın planlanan zamanına 1 saat kaldı!`;
      notificationType = "1hour";
    }
    else if (
      diffMinutes > 0 &&
      diffMinutes <= 35 &&
      diffMinutes > 25 &&
      !sentNotifications.has("30min")
    ) {
      notificationMessage = `UYARI: '${post.title}' başlıklı paylaşımınızın planlanan zamanına 30 dakika kaldı!`;
      notificationType = "30min";
    }
    else if (
      diffMinutes > 0 &&
      diffMinutes <= 20 &&
      diffMinutes > 10 &&
      !sentNotifications.has("15min")
    ) {
      notificationMessage = `ACİL: '${post.title}' başlıklı paylaşımınızın planlanan zamanına 15 dakika kaldı!`;
      notificationType = "15min";
    }

    if (notificationMessage && notificationType) {
      io.emit("notification", {
        id: post.id,
        title: post.title,
        message: notificationMessage,
        timeRemaining: diffMinutes,
        type: notificationType,
      });
      console.log(`Bildirim gönderildi: ${notificationMessage}`);

      sentNotifications.add(notificationType);
      notifiedPosts.set(post.id, sentNotifications);
    }

    const diffMinutesIstanbul = scheduledDateTime.clone().utcOffset(180, true).diff(nowIstanbul, "minutes");
    if (
      post.status === "planlandı" &&
      post.scheduledDate === nowIstanbul.format("YYYY-MM-DD") &&
      diffMinutesIstanbul < 0 &&
      (!post.planBatchId || parseInt(post.planSequence, 10) === 1) &&
      !sentNotifications.has("whatsappAlarm")
    ) {
      latePostsToNotify.push({ post, sentNotifications });
    }
  });

  if (latePostsToNotify.length > 0) {
    if (whatsappState.status === "connected" && whatsappConfig.targetGroupId) {
      const text = `🚨 *GECİKEN PAYLAŞIM UYARISI!*\n\nSistemde yayınlanması geciken *${latePostsToNotify.length}* adet paylaşım bulunmaktadır. Lütfen panelden kontrol ederek yayınlayınız.`;
      client.sendMessage(whatsappConfig.targetGroupId, text)
        .then(() => {
          console.log(`WhatsApp toplu gecikme uyarısı gönderildi. Adet: ${latePostsToNotify.length}`);
          latePostsToNotify.forEach(({ post, sentNotifications }) => {
            sentNotifications.add("whatsappAlarm");
            notifiedPosts.set(post.id, sentNotifications);
          });
        })
        .catch((err) => {
          console.error("WhatsApp toplu gecikme uyarısı gönderilemedi:", err);
        });
    }
  }
}, 60 * 1000); // Her 1 dakikada bir çalıştır (60 saniye * 1000 ms)

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/api/me", isAuthenticated, (req, res) => {
  res.json({ success: true, username: req.cookies.auth_token });
});

// Son güncelleme zamanını ve aktif durumları getir (polling için)
app.get("/api/last-update", (req, res) => {
  cleanExpiredLocks();
  const edits = {};
  for (const [postId, editInfo] of activeEdits.entries()) {
    edits[postId] = editInfo.clientId;
  }
  const views = {};
  for (const [postId, viewInfo] of activeViews.entries()) {
    views[postId] = viewInfo.clientId;
  }
  res.json({ 
    lastUpdate: lastDataUpdate,
    activeEdits: edits,
    activeViews: views,
    whatsapp: {
      status: whatsappState.status,
      userInfo: whatsappState.userInfo,
      qr: whatsappState.qr,
      targetGroupId: whatsappConfig.targetGroupId
    }
  });
});

// ============================================================================
// WHATSAPP BOT API YÖNETİMİ
// ============================================================================

app.get("/api/whatsapp/status", isAuthenticated, (req, res) => {
  res.json({
    success: true,
    status: whatsappState.status,
    userInfo: whatsappState.userInfo,
    targetGroupId: whatsappConfig.targetGroupId
  });
});

app.get("/api/whatsapp/groups", isAuthenticated, async (req, res) => {
  if (whatsappState.status !== "connected") {
    return res.status(400).json({ success: false, message: "WhatsApp botu bağlı değil." });
  }
  try {
    const chats = await client.getChats();
    const groups = chats
      .filter(chat => chat.isGroup)
      .map(chat => ({
        id: chat.id._serialized,
        name: chat.name || chat.id._serialized
      }));
    res.json({ success: true, groups });
  } catch (err) {
    console.log("WhatsApp grupları otomatik listelenemedi (tarayıcı senkronizasyonu bekleniyor veya uyumsuzluk var):", err.message || err);
    res.status(500).json({ success: false, message: "Gruplar listelenirken hata oluştu." });
  }
});

app.get("/api/whatsapp/latest-detected-group", isAuthenticated, (req, res) => {
  res.json({ success: true, groupId: latestDetectedGroupId });
});

app.post("/api/whatsapp/disconnect", isAuthenticated, async (req, res) => {
  if (req.cookies.auth_token !== "kut") {
    return res.status(403).json({ success: false, message: "Yetkisiz işlem." });
  }
  res.json({ success: true, message: "Bağlantı kesiliyor ve oturum sıfırlanıyor..." });
  recreateWhatsappClient(true).catch(err => console.error("Disconnect hatası:", err));
});

app.post("/api/whatsapp/reconnect", isAuthenticated, async (req, res) => {
  if (req.cookies.auth_token !== "kut") {
    return res.status(403).json({ success: false, message: "Yetkisiz işlem." });
  }
  res.json({ success: true, message: "WhatsApp botu yeniden başlatılıyor..." });
  recreateWhatsappClient(false).catch(err => console.error("Reconnect hatası:", err));
});

app.post("/api/whatsapp/config", isAuthenticated, (req, res) => {
  const { targetGroupId } = req.body;
  whatsappConfig.targetGroupId = targetGroupId || "";
  saveWhatsappConfig();
  res.json({ success: true, message: "Hedef grup kaydedildi." });
});

app.post("/api/posts/:id/whatsapp-share", isAuthenticated, async (req, res) => {
  console.log(`[HTTP POST] /api/posts/${req.params.id}/whatsapp-share çağrıldı`);
  try {
    const posts = readPosts();
    const post = posts.find(p => p.id == req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: "Paylaşım bulunamadı." });
    }
    await sendPostToWhatsappBot(post);
    res.json({ success: true, message: "Paylaşım WhatsApp grubuna başarıyla gönderildi!" });
  } catch (err) {
    console.error("WhatsApp paylaşım hatası:", err);
    res.status(500).json({ success: false, message: err.message || "WhatsApp ile paylaşılamadı." });
  }
});

app.post("/api/whatsapp/share-late", isAuthenticated, async (req, res) => {
  try {
    const { latePostIds } = req.body;
    if (!latePostIds || latePostIds.length === 0) {
      return res.status(400).json({ success: false, message: "Geciken paylaşım listesi boş." });
    }
    if (whatsappState.status !== "connected") {
      return res.status(400).json({ success: false, message: "WhatsApp botu bağlı değil." });
    }
    if (!whatsappConfig.targetGroupId) {
      return res.status(400).json({ success: false, message: "Hedef WhatsApp grubu seçilmemiş." });
    }

    const posts = readPosts();
    const latePosts = posts.filter(p => latePostIds.includes(p.id));

    let text = `🚨 *GECİKEN SOSYAL MEDYA PAYLAŞIMLARI*\n\n`;
    text += `Bugün planlanan ve saati geçen *${latePosts.length}* adet paylaşım henüz yayınlanmadı:\n\n`;

    latePosts.forEach((post, index) => {
      text += `${index + 1}) *${post.title || "Başlıksız"}*\n`;
      text += `⏰ *Saat:* ${post.scheduledTime}\n`;
      const accounts = post.selectedAccounts && post.selectedAccounts.length > 0 
        ? post.selectedAccounts.join(", ") 
        : "-";
      text += `👤 *Mecralar:* ${accounts}\n`;
      text += `\n`;
    });

    text += `Lütfen kontrol edip paylaşımları tamamlayınız.`;

    await client.sendMessage(whatsappConfig.targetGroupId, text);
    res.json({ success: true, message: "Gecikme uyarısı WhatsApp grubuna başarıyla gönderildi!" });
  } catch (err) {
    console.error("WhatsApp toplu gecikme paylaşım hatası:", err);
    res.status(500).json({ success: false, message: err.message || "WhatsApp ile paylaşılamadı." });
  }
});

// Post düzenleme durumunu güncelle
app.post("/api/posts/:id/editing", (req, res) => {
  try {
    const { id } = req.params;
    const { clientId, isEditing } = req.body;

    if (!clientId) {
      return res.status(400).json({ success: false, message: "clientId gerekli" });
    }

    cleanExpiredLocks();

    if (isEditing) {
      // Başka biri düzenliyor mu kontrol et
      const currentEdit = activeEdits.get(id);
      if (currentEdit && currentEdit.clientId !== clientId && (Date.now() - currentEdit.lastActive <= EDIT_TIMEOUT)) {
        return res.json({ 
          success: false, 
          isEditing: true, 
          message: "Bu paylaşım şu anda başka bir kullanıcı tarafından düzenleniyor." 
        });
      }
      
      // Kilidi güncelle
      activeEdits.set(id, { clientId, lastActive: Date.now() });
      res.json({ success: true, isEditing: false });
    } else {
      // Kilidi kaldır
      const currentEdit = activeEdits.get(id);
      if (currentEdit && currentEdit.clientId === clientId) {
        activeEdits.delete(id);
      }
      res.json({ success: true, isEditing: false });
    }
  } catch (error) {
    console.error("Editing status error:", error);
    res.status(500).json({ success: false, message: "Sunucu hatası" });
  }
});

// Post görüntüleme durumunu güncelle (heartbeat)
app.post("/api/posts/:id/viewing", (req, res) => {
  try {
    const { id } = req.params;
    const { clientId, isViewing } = req.body;

    if (!clientId) {
      return res.status(400).json({ success: false, message: "clientId gerekli" });
    }

    cleanExpiredLocks();

    if (isViewing) {
      activeViews.set(id, { clientId, lastActive: Date.now() });
      res.json({ success: true, isViewing: true });
    } else {
      const currentView = activeViews.get(id);
      if (currentView && currentView.clientId === clientId) {
        activeViews.delete(id);
      }
      res.json({ success: true, isViewing: false });
    }
  } catch (error) {
    console.error("Viewing status error:", error);
    res.status(500).json({ success: false, message: "Sunucu hatası" });
  }
});

// Tüm postları getir (filtreleme ve arama ile)
app.get("/api/posts", (req, res) => {
  try {
    let posts = readPosts();
    const { search, filter, contentType, status, plannerMode } = req.query;

    // Arama (Search)
    if (search) {
      const searchTerm = search.toLowerCase();
      posts = posts.filter(
        (p) =>
          (p.title && p.title.toLowerCase().includes(searchTerm)) ||
          (p.content && p.content.toLowerCase().includes(searchTerm)) ||
          (p.notes && p.notes.toLowerCase().includes(searchTerm))
      );
    }

    // Filtreleme (Filter)
    if (filter) {
      const today = new Date().toISOString().slice(0, 10);
      if (filter === "today") {
        posts = posts.filter((p) => p.scheduledDate === today);
      }
      // Gelecekte başka filtreler eklenebilir
    }

    // contentType filtreleme (çoklu seçim desteği)
    if (contentType) {
      const allowedTypes = contentType.split(",");
      posts = posts.filter((p) => allowedTypes.includes(p.contentType));
    }

    // plannerMode filtreleme (çoklu seçim desteği)
    if (plannerMode) {
      const allowedModes = plannerMode.split(",");
      posts = posts.filter((p) => {
        const mode = p.plannerMode || p.planMode || (p.planBatchId ? "daily" : "single");
        return allowedModes.includes(mode);
      });
    }

    // Status filtreleme (çoklu seçim desteği)
    if (status) {
      const allowedStatuses = status.split(",");
      if (allowedStatuses.includes("planlandı") && !allowedStatuses.includes("yapılıyor")) {
        allowedStatuses.push("yapılıyor");
      }
      posts = posts.filter((p) => allowedStatuses.includes(p.status));
    }

    // Sıralama
    const sortedPosts = posts.sort((a, b) => {
      // Eğer 'today' filtresi varsa, saate göre artan sıralama yap (Erken saat önce)
      if (filter === "today") {
        return a.scheduledTime.localeCompare(b.scheduledTime);
      }

      // Diğer durumlarda manuel sıralama veya ID'ye göre (en yeni en üstte)
      if (a.manualOrder !== undefined && b.manualOrder !== undefined) {
        return a.manualOrder - b.manualOrder;
      }
      if (a.manualOrder !== undefined) return -1;
      if (b.manualOrder !== undefined) return 1;
      return b.id - a.id;
    });

    res.json(sortedPosts);
  } catch (error) {
    console.error("Postları getirirken hata:", error);
    res.status(500).json({ success: false, message: "Sunucu hatası" });
  }
});

// Post sıralamasını güncelle (DİKKAT: Parametreli rotalardan önce gelmeli)
app.put("/api/posts/reorder", (req, res) => {
  const { postIds } = req.body;

  if (!postIds || !Array.isArray(postIds)) {
    return res
      .status(400)
      .json({ success: false, message: "Geçersiz ID dizisi" });
  }

  try {
    let posts = readPosts();

    // Postları yeni sıraya göre sırala
    const orderedPosts = postIds
      .map((id) => posts.find((p) => p.id == id))
      .filter(Boolean); // Eşleşmeyen ID'leri (null) kaldır

    // Eğer sıralama sonrası post sayısı değiştiyse (eski/silinmiş id'ler varsa),
    // sıralanmamış olanları sona ekle
    if (orderedPosts.length !== posts.length) {
      const remainingPosts = posts.filter(
        (p) => !postIds.includes(p.id) // toString() kaldırıldı
      );
      orderedPosts.push(...remainingPosts);
    }

    // Manuel sıralama yapıldığını belirtmek için bir özel işaret ekle
    const finalPosts = orderedPosts.map((post, index) => ({
      ...post,
      manualOrder: index, // Manuel sıralama indeksi
    }));

    if (writePosts(finalPosts)) {
      // Gerçek zamanlı güncelleme bildirimi gönder
      notifyPostUpdate();
      res.json({ success: true, message: "Sıralama güncellendi", lastUpdate: lastDataUpdate });
    } else {
      res
        .status(500)
        .json({ success: false, message: "Sıralama kaydedilemedi" });
    }
  } catch (error) {
    console.error("Sıralama hatası:", error);
    res.status(500).json({ success: false, message: "Sunucu hatası" });
  }
});

// Yeni post ekle
app.post(
  "/api/posts",
  upload.fields([{ name: "files", maxCount: 500 }]),
  (req, res) => {
    try {
      console.log("POST /api/posts isteği alındı");
      console.log("Request body:", req.body);
      console.log("Request files:", req.files);

      const {
        contentType,
        title,
        content,
        notes,
        storyLink,
        storyLinkTitle,
        scheduledDate,
        scheduledTime,
        selectedAccounts,
        plannerMode,
        planBatchId,
        planSequence,
        planTotal,
        planGeneratedAt,
      } = req.body;

      // Veriyi temizle (boşluk karakterlerini kaldır)
      const cleanTitle = (title || "").trim();
      const cleanContent = (content || "").trim();
      const cleanNotes = (notes || "").trim();
      const cleanStoryLink = (storyLink || "").trim();
      const cleanStoryLinkTitle = (storyLinkTitle || "").trim();
      const cleanPlannerMode = (plannerMode || "").trim() || "single";
      const cleanPlanBatchId = (planBatchId || "").trim();
      const planSequenceNumber = parseNullableInt(planSequence);
      const planTotalNumber = parseNullableInt(planTotal);
      const cleanPlanGeneratedAt = (planGeneratedAt || "").trim();
      const hasPlanBatch = !!cleanPlanBatchId;

      // Validasyon kontrolleri
      if (!cleanTitle) {
        console.error("Başlık alanı boş");
        return res.status(400).json({
          success: false,
          message: "Paylaşım başlığı zorunludur",
        });
      }

      if (!scheduledDate || !scheduledTime) {
        console.error("Eksik tarih/saat bilgisi");
        return res.status(400).json({
          success: false,
          message: "Tarih ve saat alanları zorunludur",
        });
      }

      // Tarih ve saat en az 10 dakika sonrası olmalı kontrolü (İstanbul UTC+3, 1 dk pay bıraktık)
      const scheduledDateTime = moment(`${scheduledDate} ${scheduledTime}`, "YYYY-MM-DD HH:mm").utcOffset(180, true);
      const nowIstanbul = moment().utcOffset(180);
      const diffMinutes = scheduledDateTime.diff(nowIstanbul, "minutes");

      if (diffMinutes < 9) {
        console.error("Planlama tarihi en az 10 dakika sonrası olmalıdır");
        return res.status(400).json({
          success: false,
          message: "Planlama tarihi en az 10 dakika sonrası olmalıdır!",
        });
      }

      // İçerik türüne göre validasyon
      if (contentType === "post" && !cleanContent) {
        console.error("Post içeriği boş");
        return res.status(400).json({
          success: false,
          message: "Post içeriği gereklidir",
        });
      } else if (
        contentType === "combined" &&
        !cleanContent &&
        !cleanStoryLink
      ) {
        console.error("Post veya Story içeriği boş");
        return res.status(400).json({
          success: false,
          message: "Post içeriği veya Story linki gereklidir",
        });
      }

      // Story için link ve başlık kontrolü kaldırıldı - artık opsiyonel

      // selectedAccounts parse etmeyi dene
      let parsedAccounts = [];
      try {
        parsedAccounts = JSON.parse(selectedAccounts || "[]");
        console.log("Parsed accounts:", parsedAccounts);
      } catch (parseError) {
        console.error("selectedAccounts parse hatası:", parseError);
        console.error("selectedAccounts değeri:", selectedAccounts);
        return res.status(400).json({
          success: false,
          message: "Hesap seçimi format hatası",
        });
      }

      // Dosya bilgilerini birden fazla dosya için hazırla
      const uploadedFiles = req.files && req.files.files ? req.files.files : [];
      const files = uploadedFiles.map((file) => ({
        fileName: file.filename,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
      }));

      console.log("Yüklenen dosya sayısı:", uploadedFiles.length);
      console.log("Dosya bilgileri:", files);

      // Mevcut postları oku ve en büyük ID'yi bul
      const posts = readPosts();
      console.log("Mevcut post sayısı:", posts.length);

      // Yeni post ID'si her zaman en büyük olacak şekilde hesapla
      const maxId = posts.length > 0 ? Math.max(...posts.map((p) => p.id)) : 0;
      const newId = Math.max(Date.now(), maxId + 1);

      const newPost = {
        id: newId,
        contentType: contentType || "post",
        title: cleanTitle,
        content: cleanContent,
        notes: cleanNotes,
        storyLink: cleanStoryLink,
        storyLinkTitle: cleanStoryLinkTitle,
        scheduledDate,
        scheduledTime,
        selectedAccounts: parsedAccounts,
        completedAccounts: [], // Yeni alan
        files: files, // Birden fazla dosya desteği
        // Geriye uyumluluk için eski alanları koru (tek dosya varsa)
        fileName: files.length > 0 ? files[0].fileName : null,
        originalName: files.length > 0 ? files[0].originalName : null,
        status: "planlandı",
        createdAt: new Date().toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" }),
        plannerMode: hasPlanBatch ? cleanPlannerMode : "single",
        planBatchId: hasPlanBatch ? cleanPlanBatchId : null,
        planSequence: hasPlanBatch ? planSequenceNumber : null,
        planTotal: hasPlanBatch ? planTotalNumber : null,
        planGeneratedAt: hasPlanBatch
          ? cleanPlanGeneratedAt || new Date().toISOString()
          : null,
      };

      console.log("Yeni post objesi oluşturuldu:", newPost);

      // Yeni post'un oluşturma zamanını doğru şekilde ayarla
      const now = new Date();
      newPost.createdAt = now.toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" });

      // Eğer sürükle bırak yapılmışsa manuel sıralama kullanılacak,
      // yoksa createdAt zamanı ile otomatik sıralanacak

      // Yeni postu listenin başına ekle
      posts.unshift(newPost);

      const writeResult = writePosts(posts);
      console.log("Veri yazma sonucu:", writeResult);

      if (writeResult) {
        // Gerçek zamanlı güncelleme bildirimi gönder
        notifyPostUpdate();
        console.log("Post başarıyla kaydedildi");
        res.json({ success: true, post: newPost, lastUpdate: lastDataUpdate });
      } else {
        console.error("Veri yazma hatası");
        res.status(500).json({ success: false, message: "Veri kaydedilemedi" });
      }
    } catch (error) {
      console.error("Post ekleme hatası - Detay:", error);
      console.error("Hata yığını:", error.stack);
      res.status(500).json({
        success: false,
        message: "Sunucu hatası: " + error.message,
      });
    }
  }
);

//Tamamlandı.

// Post durumunu güncelle
app.put("/api/posts/:id/status", (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const posts = readPosts();
    const postIndex = posts.findIndex((post) => post.id == id);

    if (postIndex === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Post bulunamadı" });
    }

    posts[postIndex].status = status;

    if (writePosts(posts)) {
      // Gerçek zamanlı güncelleme bildirimi gönder
      notifyPostUpdate();
      res.json({ success: true, post: posts[postIndex], lastUpdate: lastDataUpdate });
    } else {
      res.status(500).json({ success: false, message: "Veri güncellenemedi" });
    }
  } catch (error) {
    console.error("Durum güncelleme hatası:", error);
    res.status(500).json({ success: false, message: "Sunucu hatası" });
  }
});

// Post güncelle (Edit)
app.put(
  "/api/posts/:id",
  upload.fields([{ name: "files", maxCount: 500 }]),
  (req, res) => {
    try {
      console.log("PUT /api/posts/:id isteği alındı");
      console.log("Request body:", req.body);
      console.log("Request files:", req.files);

      const { id } = req.params;
      const {
        contentType,
        title,
        content,
        notes,
        storyLink,
        storyLinkTitle,
        scheduledDate,
        scheduledTime,
        selectedAccounts,
        keepExistingFiles,
        plannerMode,
        planBatchId,
        planSequence,
        planTotal,
        planGeneratedAt,
      } = req.body;

      const posts = readPosts();
      const postIndex = posts.findIndex((post) => post.id == id);

      if (postIndex === -1) {
        return res.status(404).json({
          success: false,
          message: "Post bulunamadı",
        });
      }

      // Veriyi temizle (boşluk karakterlerini kaldır)
      const cleanTitle = (title || "").trim();
      const cleanContent = (content || "").trim();
      const cleanNotes = (notes || "").trim();
      const cleanStoryLink = (storyLink || "").trim();
      const cleanStoryLinkTitle = (storyLinkTitle || "").trim();

      // Validasyon kontrolleri
      if (!cleanTitle) {
        console.error("Başlık alanı boş");
        return res.status(400).json({
          success: false,
          message: "Paylaşım başlığı zorunludur",
        });
      }

      if (!scheduledDate || !scheduledTime) {
        console.error("Eksik tarih/saat bilgisi");
        return res.status(400).json({
          success: false,
          message: "Tarih ve saat alanları zorunludur",
        });
      }



      // İçerik türüne göre validasyon
      if (contentType === "post" && !cleanContent) {
        console.error("Post içeriği boş");
        return res.status(400).json({
          success: false,
          message: "Post içeriği gereklidir",
        });
      } else if (
        contentType === "combined" &&
        !cleanContent &&
        !cleanStoryLink
      ) {
        console.error("Post veya Story içeriği boş");
        return res.status(400).json({
          success: false,
          message: "Post içeriği veya Story linki gereklidir",
        });
      }
      if (contentType === "combined") {
        if (!cleanContent && !cleanStoryLink && !cleanStoryLinkTitle) {
          console.error(
            "Combined paylaşım için post içeriği veya story bilgileri eksik"
          );
          return res.status(400).json({
            success: false,
            message:
              "Combined paylaşım için post içeriği veya story bilgileri gereklidir",
          });
        }
      }

      // selectedAccounts parse etmeyi dene
      let parsedSelectedAccounts;
      try {
        parsedSelectedAccounts = selectedAccounts
          ? JSON.parse(selectedAccounts)
          : [];
      } catch (parseError) {
        console.error("selectedAccounts parse hatası:", parseError);
        return res.status(400).json({
          success: false,
          message: "Seçili hesaplar formatı hatalı",
        });
      }

      // Mevcut post'u al
      const existingPost = posts[postIndex];

      // Dosya işlemleri
      let updatedFiles = [];

      // Eğer yeni dosyalar yüklendiyse
      if (req.files && req.files.files && req.files.files.length > 0) {
        console.log(`${req.files.files.length} yeni dosya yüklendi`);

        // Eğer mevcut dosyalar korunmayacaksa, eski dosyaları sil
        if (keepExistingFiles !== "true") {
          if (existingPost.files && Array.isArray(existingPost.files)) {
            existingPost.files.forEach((file) => {
              if (file.fileName && fs.existsSync(`uploads/${file.fileName}`)) {
                fs.unlinkSync(`uploads/${file.fileName}`);
                console.log(`Eski dosya silindi: ${file.fileName}`);
              }
            });
          }
          // Eski format için geriye uyumluluk
          if (
            existingPost.fileName &&
            fs.existsSync(`uploads/${existingPost.fileName}`)
          ) {
            fs.unlinkSync(`uploads/${existingPost.fileName}`);
            console.log(`Eski dosya silindi: ${existingPost.fileName}`);
          }
        } else {
          // Mevcut dosyaları koru
          if (existingPost.files && Array.isArray(existingPost.files)) {
            updatedFiles = [...existingPost.files];
          }
        }

        // Yeni dosyaları ekle
        const newFiles = req.files.files.map((file) => ({
          fileName: file.filename,
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
        }));

        updatedFiles = [...updatedFiles, ...newFiles];
        console.log(`Toplam dosya sayısı: ${updatedFiles.length}`);
      } else {
        // Yeni dosya yüklenmediyse mevcut dosyaları koru
        if (existingPost.files && Array.isArray(existingPost.files)) {
          updatedFiles = existingPost.files;
        } else if (existingPost.fileName) {
          // Eski format için geriye uyumluluk
          updatedFiles = [
            {
              fileName: existingPost.fileName,
              originalName: existingPost.originalName,
              mimetype: existingPost.mimetype || "application/octet-stream",
              size: 0,
            },
          ];
        }
      }

      // Post'u güncelle
      const updatedPost = {
        ...existingPost,
        contentType: contentType || existingPost.contentType,
        title: cleanTitle,
        content: cleanContent,
        notes: cleanNotes,
        storyLink: cleanStoryLink,
        storyLinkTitle: cleanStoryLinkTitle,
        scheduledDate, // Bu sadece mevcut post için değişir
        scheduledTime,
        selectedAccounts: parsedSelectedAccounts,
        plannerMode:
          plannerMode !== undefined
            ? plannerMode || "single"
            : existingPost.plannerMode || "single",
        planBatchId:
          planBatchId !== undefined
            ? planBatchId || null
            : existingPost.planBatchId || null,
        planSequence:
          planSequence !== undefined
            ? parseNullableInt(planSequence)
            : existingPost.planSequence || null,
        planTotal:
          planTotal !== undefined
            ? parseNullableInt(planTotal)
            : existingPost.planTotal || null,
        planGeneratedAt:
          planGeneratedAt !== undefined
            ? planGeneratedAt || existingPost.planGeneratedAt || null
            : existingPost.planGeneratedAt || null,
        files: updatedFiles.length > 0 ? updatedFiles : undefined,
        // Eski alanları temizle
        fileName: undefined,
        originalName: undefined,
        // Updated timestamp ekle
        updatedAt: new Date().toLocaleString("tr-TR", {
          timeZone: "Europe/Istanbul",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      };

      // Güncellenen post'u kaydet
      posts[postIndex] = updatedPost;

      // EĞER BU BİR BATCH PAYLAŞIM İSE, DİĞERLERİNİ DE GÜNCELLE
      if (updatedPost.planBatchId) {
        console.log(
          `Batch güncelleme başlatıldı. Batch ID: ${updatedPost.planBatchId}`
        );
        let batchUpdateCount = 0;

        posts.forEach((p, index) => {
          // Kendi post'umuz değilse ve aynı batch ID'ye sahipse
          if (p.id !== updatedPost.id && p.planBatchId === updatedPost.planBatchId) {
            // Sadece ortak alanları güncelle, tarihi ve ID'yi koru
            posts[index] = {
              ...p,
              contentType: updatedPost.contentType,
              title: updatedPost.title,
              content: updatedPost.content,
              notes: updatedPost.notes,
              storyLink: updatedPost.storyLink,
              storyLinkTitle: updatedPost.storyLinkTitle,
              // scheduledDate: p.scheduledDate, // Tarihi KORU!
              scheduledTime: updatedPost.scheduledTime, // Saati güncelle (isteğe bağlı, genellikle aynı olur)
              selectedAccounts: updatedPost.selectedAccounts,
              files: updatedPost.files, // Dosyaları da eşitle
              updatedAt: updatedPost.updatedAt,
            };
            batchUpdateCount++;
          }
        });
        console.log(
          `${batchUpdateCount} adet bağlı paylaşım güncellendi (Tarihler korundu).`
        );
      }

      if (writePosts(posts)) {
        // Gerçek zamanlı güncelleme bildirimi gönder
        notifyPostUpdate();
        console.log("Post başarıyla güncellendi:", updatedPost.id);
        res.json({
          success: true,
          message: "Post başarıyla güncellendi",
          post: updatedPost,
          lastUpdate: lastDataUpdate,
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Veri kaydedilemedi",
        });
      }
    } catch (error) {
      console.error("Post güncelleme hatası detayı:", error);
      res.status(500).json({
        success: false,
        message: "Sunucu hatası",
      });
    }
  }
);

// Hesap tamamlama durumunu güncelle
app.put("/api/posts/:id/complete", (req, res) => {
  try {
    const { id } = req.params;
    const { accountKey, completed } = req.body;

    const posts = readPosts();
    const postIndex = posts.findIndex((post) => post.id == id);

    if (postIndex === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Post bulunamadı" });
    }

    // completedAccounts alanı yoksa oluştur
    if (!posts[postIndex].completedAccounts) {
      posts[postIndex].completedAccounts = [];
    }

    if (completed) {
      // Ekle (eğer yoksa)
      if (!posts[postIndex].completedAccounts.includes(accountKey)) {
        posts[postIndex].completedAccounts.push(accountKey);
      }
    } else {
      // Çıkar
      posts[postIndex].completedAccounts = posts[
        postIndex
      ].completedAccounts.filter((acc) => acc !== accountKey);
    }

    if (writePosts(posts)) {
      // Gerçek zamanlı güncelleme bildirimi gönder
      notifyPostUpdate();
      res.json({ success: true, post: posts[postIndex], lastUpdate: lastDataUpdate });
    } else {
      res.status(500).json({ success: false, message: "Veri güncellenemedi" });
    }
  } catch (error) {
    console.error("Tamamlama güncelleme hatası:", error);
    res.status(500).json({ success: false, message: "Sunucu hatası" });
  }
});

// Post sil
app.delete("/api/posts/:id", (req, res) => {
  try {
    const { id } = req.params;

    const posts = readPosts();
    const postIndex = posts.findIndex((post) => post.id == id);

    if (postIndex === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Post bulunamadı" });
    }

    // Dosyaları sil
    const post = posts[postIndex];

    // Yeni format: birden fazla dosya
    if (post.files && Array.isArray(post.files)) {
      post.files.forEach((file) => {
        if (file.fileName && fs.existsSync(`uploads/${file.fileName}`)) {
          fs.unlinkSync(`uploads/${file.fileName}`);
        }
      });
    }

    // Eski format: tek dosya (geriye uyumluluk)
    if (post.fileName && fs.existsSync(`uploads/${post.fileName}`)) {
      fs.unlinkSync(`uploads/${post.fileName}`);
    }

    posts.splice(postIndex, 1);

    if (writePosts(posts)) {
      // Gerçek zamanlı güncelleme bildirimi gönder
      notifyPostUpdate();
      res.json({ success: true, lastUpdate: lastDataUpdate });
    } else {
      res.status(500).json({ success: false, message: "Veri silinemedi" });
    }
  } catch (error) {
    console.error("Post silme hatası:", error);
    res.status(500).json({ success: false, message: "Sunucu hatası" });
  }
});

// Yüklenen dosyaları serve et
app.use("/uploads", express.static("uploads"));

// Dosyaları orijinal isimleriyle indirme endpoint'i
app.get("/api/download/:fileName", (req, res) => {
  try {
    const { fileName } = req.params;
    const posts = readPosts();

    // Dosyanın hangi post'a ait olduğunu bul
    let fileInfo = null;
    let originalName = null;

    for (const post of posts) {
      // Yeni format: birden fazla dosya
      if (post.files && Array.isArray(post.files)) {
        const file = post.files.find((f) => f.fileName === fileName);
        if (file) {
          fileInfo = file;
          originalName = file.originalName;
          break;
        }
      }

      // Eski format: tek dosya (geriye uyumluluk)
      if (post.fileName === fileName) {
        originalName = post.originalName;
        break;
      }
    }

    if (!originalName) {
      return res.status(404).json({
        success: false,
        message: "Dosya bulunamadı",
      });
    }

    const filePath = path.join(__dirname, "uploads", fileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "Dosya fiziksel olarak bulunamadı",
      });
    }

    // Dosyayı orijinal ismiyle indirme için header'ları ayarla
    const encodedOriginalName = encodeURIComponent(originalName);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename*=UTF-8''${encodedOriginalName}`
    );
    res.setHeader("Content-Type", "application/octet-stream");

    // Dosyayı gönder
    res.sendFile(filePath);
  } catch (error) {
    console.error("Dosya indirme hatası:", error);
    res.status(500).json({
      success: false,
      message: "Sunucu hatası",
    });
  }
});

// Tüm dosyaları ZIP olarak indirme endpoint'i
app.get("/api/download-all/:postId", (req, res) => {
  try {
    const { postId } = req.params;
    const posts = readPosts();

    // Post'u bul
    const post = posts.find((p) => p.id == postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post bulunamadı",
      });
    }

    // Dosyaları topla
    let filesToZip = [];

    // Yeni format: birden fazla dosya
    if (post.files && Array.isArray(post.files) && post.files.length > 0) {
      filesToZip = post.files;
    }
    // Eski format: tek dosya (geriye uyumluluk)
    else if (post.fileName) {
      filesToZip = [
        {
          fileName: post.fileName,
          originalName: post.originalName || post.fileName,
        },
      ];
    }

    if (filesToZip.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Bu gönderi için dosya bulunamadı",
      });
    }

    // ZIP dosyası adını oluştur
    const zipFileName = `${post.title.replace(
      /[^a-zA-Z0-9ğüşıöçĞÜŞIÖÇ\s]/g,
      ""
    )}-dosyalar.zip`;

    // ZIP arşivi oluştur
    const archive = archiver("zip", {
      zlib: { level: 9 }, // Maksimum sıkıştırma
    });

    // Response header'larını ayarla
    res.setHeader("Content-Type", "application/zip");
    const encodedZipName = encodeURIComponent(zipFileName);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename*=UTF-8''${encodedZipName}`
    );

    // Hata yakalama
    archive.on("error", (err) => {
      console.error("ZIP oluşturma hatası:", err);
      res.status(500).json({
        success: false,
        message: "ZIP dosyası oluşturulamadı",
      });
    });

    // ZIP'i response'a pipe et
    archive.pipe(res);

    // Dosyaları ZIP'e ekle
    let addedFiles = 0;
    for (const file of filesToZip) {
      const filePath = path.join(__dirname, "uploads", file.fileName);

      if (fs.existsSync(filePath)) {
        archive.file(filePath, { name: file.originalName || file.fileName });
        addedFiles++;
      } else {
        console.warn(`Dosya bulunamadı: ${filePath}`);
      }
    }

    if (addedFiles === 0) {
      return res.status(404).json({
        success: false,
        message: "Hiç dosya bulunamadı",
      });
    }

    console.log(`${addedFiles} dosya ZIP'e eklendi: ${zipFileName}`);

    // ZIP'i sonlandır
    archive.finalize();
  } catch (error) {
    console.error("Toplu indirme hatası:", error);
    res.status(500).json({
      success: false,
      message: "Sunucu hatası",
    });
  }
});

// Verileri JSON olarak dışa aktar
app.get("/api/export", (req, res) => {
  const posts = readPosts();
  res.setHeader("Content-Type", "application/json");
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=sosyal-medya-posts.json"
  );
  res.send(JSON.stringify(posts, null, 2));
});

app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    console.error("Multer Error:", error);

    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        success: false,
        message: `Dosya çok büyük! Maksimum 10GB yükleyebilirsiniz.`,
      });
    }

    if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        message: "Çok fazla dosya! Maksimum 500 dosya yükleyebilirsiniz.",
      });
    }

    if (error.code === "LIMIT_FIELD_COUNT") {
      return res.status(400).json({
        success: false,
        message: "Çok fazla form alanı! Maksimum 1000 form alanı gönderebilirsiniz.",
      });
    }

    if (error.code === "LIMIT_FIELD_SIZE") {
      return res.status(413).json({
        success: false,
        message: "Form alanı çok büyük! Her bir form alanı için maksimum 100MB gönderebilirsiniz.",
      });
    }

    if (error.code === "LIMIT_FIELD_NAME_SIZE") {
      return res.status(400).json({
        success: false,
        message: "Form alanı adı çok uzun!",
      });
    }

    return res.status(400).json({
      success: false,
      message: "Dosya yükleme hatası: " + error.message,
    });
  }

  // Express body parser limit hatası için özel kontrol
  if (error.type === "entity.too.large") {
    return res.status(413).json({
      success: false,
      message: "İstek çok büyük! Maksimum 10GB veri gönderebilirsiniz.",
    });
  }

  console.error("Server Error:", error);
  res.status(500).json({
    success: false,
    message: "Sunucu hatası: " + error.message,
  });
});

// Sunucuyu başlat
server.listen(PORT, () => {
  console.log(`Sunucu çalışıyor: http://localhost:${PORT}`);
  console.log("Kullanım:");
  console.log("1. npm install");
  console.log("2. npm start");
});

module.exports = app;
