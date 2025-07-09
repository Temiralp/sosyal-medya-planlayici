const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const archiver = require("archiver");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "5000mb" }));
app.use(express.urlencoded({ limit: "5000mb", extended: true }));
app.use(express.static("public"));

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
    fileSize: 1024 * 1024 * 1024,
    files: 100,
    fields: 500,
  },
});

// Veri dosyası yolu
const DATA_FILE = "./data/posts.json";

// Son güncelleme zamanını takip et
let lastDataUpdate = Date.now();

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
        while (Date.now() - start < 50) {} // 50ms bekleme
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
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Son güncelleme zamanını getir (polling için)
app.get("/api/last-update", (req, res) => {
  res.json({ lastUpdate: lastDataUpdate });
});

// Tüm postları getir
app.get("/api/posts", (req, res) => {
  const posts = readPosts();
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
  res.json(sortedPosts);
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
      res.json({ success: true, message: "Sıralama güncellendi" });
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
      } = req.body;

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
        createdAt: new Date().toLocaleString("tr-TR"),
      };

      console.log("Yeni post objesi oluşturuldu:", newPost);

      // Yeni post'un oluşturma zamanını doğru şekilde ayarla
      const now = new Date();
      newPost.createdAt = now.toLocaleString("tr-TR");

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
        res.json({ success: true, post: newPost });
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
      res.json({ success: true, post: posts[postIndex] });
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
        scheduledDate,
        scheduledTime,
        selectedAccounts: parsedSelectedAccounts,
        files: updatedFiles.length > 0 ? updatedFiles : undefined,
        // Eski alanları temizle
        fileName: undefined,
        originalName: undefined,
        // Updated timestamp ekle
        updatedAt: new Date().toLocaleString("tr-TR", {
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

      if (writePosts(posts)) {
        // Gerçek zamanlı güncelleme bildirimi gönder
        notifyPostUpdate();
        console.log("Post başarıyla güncellendi:", updatedPost.id);
        res.json({
          success: true,
          message: "Post başarıyla güncellendi",
          post: updatedPost,
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
      res.json({ success: true, post: posts[postIndex] });
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
      res.json({ success: true });
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
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${originalName}"`
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
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${zipFileName}"`
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
        message: `Dosya çok büyük! Maksimum 1GB yükleyebilirsiniz.`,
      });
    }

    if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        message: "Çok fazla dosya! Maksimum 10 dosya yükleyebilirsiniz.",
      });
    }

    if (error.code === "LIMIT_FIELD_COUNT") {
      return res.status(400).json({
        success: false,
        message: "Çok fazla form alanı!",
      });
    }

    return res.status(400).json({
      success: false,
      message: "Dosya yükleme hatası: " + error.message,
    });
  }

  console.error("Server Error:", error);
  res.status(500).json({
    success: false,
    message: "Sunucu hatası: " + error.message,
  });
});

// Sunucuyu başlat
app.listen(PORT, () => {
  console.log(`Sunucu çalışıyor: http://localhost:${PORT}`);
  console.log("Kullanım:");
  console.log("1. npm install");
  console.log("2. npm start");
});

module.exports = app;
