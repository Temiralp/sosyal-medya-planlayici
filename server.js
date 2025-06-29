const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
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

const upload = multer({ storage: storage });

// Veri dosyası yolu
const DATA_FILE = "./data/posts.json";

// Veri okuma fonksiyonu
const readPosts = () => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, "utf8");
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error("Veri okuma hatası:", error);
    return [];
  }
};

// Veri yazma fonksiyonu
const writePosts = (posts) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(posts, null, 2));
    return true;
  } catch (error) {
    console.error("Veri yazma hatası:", error);
    return false;
  }
};

// Başlangıçta klasörleri oluştur
createDirectories();

// Ana sayfa
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Tüm postları getir
app.get("/api/posts", (req, res) => {
  const posts = readPosts();
  res.json(posts);
});

// Yeni post ekle
app.post("/api/posts", upload.single("file"), (req, res) => {
  try {
    const {
      contentType,
      content,
      notes,
      storyLink,
      storyLinkTitle,
      scheduledDate,
      scheduledTime,
      selectedAccounts,
    } = req.body;

    const newPost = {
      id: Date.now(),
      contentType: contentType || "post",
      content: content || "",
      notes: notes || "",
      storyLink: storyLink || "",
      storyLinkTitle: storyLinkTitle || "",
      scheduledDate,
      scheduledTime,
      selectedAccounts: JSON.parse(selectedAccounts || "[]"),
      completedAccounts: [], // Yeni alan
      fileName: req.file ? req.file.filename : null,
      originalName: req.file ? req.file.originalname : null,
      status: "planlandı",
      createdAt: new Date().toLocaleString("tr-TR"),
    };

    const posts = readPosts();
    posts.push(newPost);

    if (writePosts(posts)) {
      res.json({ success: true, post: newPost });
    } else {
      res.status(500).json({ success: false, message: "Veri kaydedilemedi" });
    }
  } catch (error) {
    console.error("Post ekleme hatası:", error);
    res.status(500).json({ success: false, message: "Sunucu hatası" });
  }
});

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
      res.json({ success: true, post: posts[postIndex] });
    } else {
      res.status(500).json({ success: false, message: "Veri güncellenemedi" });
    }
  } catch (error) {
    console.error("Durum güncelleme hatası:", error);
    res.status(500).json({ success: false, message: "Sunucu hatası" });
  }
});

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

    // Dosyayı sil
    const post = posts[postIndex];
    if (post.fileName && fs.existsSync(`uploads/${post.fileName}`)) {
      fs.unlinkSync(`uploads/${post.fileName}`);
    }

    posts.splice(postIndex, 1);

    if (writePosts(posts)) {
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

// Sunucuyu başlat
app.listen(PORT, () => {
  console.log(`Sunucu çalışıyor: http://localhost:${PORT}`);
  console.log("Kullanım:");
  console.log("1. npm install");
  console.log("2. npm start");
});

module.exports = app;
