const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const archiver = require("archiver");

const app = express();
const PORT = 3000;

// ================================
// ULTRA DETAILED LOGGING SYSTEM
// ================================

let requestCounter = 0;
let uploadTracker = new Map(); // Request ID -> upload details

// Memory tracking helper
const getMemoryUsage = () => {
  const usage = process.memoryUsage();
  return {
    rss: Math.round(usage.rss / 1024 / 1024),
    heapTotal: Math.round(usage.heapTotal / 1024 / 1024),
    heapUsed: Math.round(usage.heapUsed / 1024 / 1024),
    external: Math.round(usage.external / 1024 / 1024),
    arrayBuffers: Math.round(usage.arrayBuffers / 1024 / 1024)
  };
};

// System stats helper
const getSystemStats = () => {
  try {
    const uptime = process.uptime();
    const cpuUsage = process.cpuUsage();
    return {
      uptime: `${Math.round(uptime)}s`,
      cpu: {
        user: Math.round(cpuUsage.user / 1000),
        system: Math.round(cpuUsage.system / 1000)
      },
      pid: process.pid
    };
  } catch (err) {
    return { error: err.message };
  }
};

// Timestamp helper
const timestamp = () => new Date().toISOString();

// Log with memory and timing
const logWithStats = (reqId, message, data = {}) => {
  const memory = getMemoryUsage();
  const system = getSystemStats();
  console.log(`[${timestamp()}] [REQ-${reqId}] ${message}`, {
    ...data,
    memory: `${memory.heapUsed}MB/${memory.rss}MB`,
    system: system
  });
};

// Disk space checker
const getDiskSpace = () => {
  try {
    const stats = fs.statSync('.');
    return {
      available: 'checking...',
      uploadsSize: fs.existsSync('./uploads') ? 
        fs.readdirSync('./uploads').length + ' files' : '0 files'
    };
  } catch (err) {
    return { error: err.message };
  }
};

// ================================
// MIDDLEWARE & SETUP
// ================================

app.use(cors());

// Ultra detailed request tracking
app.use((req, res, next) => {
  const requestId = ++requestCounter;
  req.requestId = requestId;
  req.startTime = Date.now();
  
  console.log(`\n${'='.repeat(80)}`);
  console.log(`🚀 REQUEST ${requestId} STARTED`);
  console.log(`${'='.repeat(80)}`);
  
  logWithStats(requestId, "📋 REQUEST DETAILS", {
    method: req.method,
    url: req.url,
    contentLength: req.headers['content-length'] || 'unknown',
    contentType: req.headers['content-type'] || 'unknown',
    userAgent: req.headers['user-agent']?.substring(0, 50) || 'unknown',
    ip: req.ip || req.connection.remoteAddress,
    disk: getDiskSpace()
  });
  
  // Track upload progress if this is a POST to /api/posts
  if (req.method === 'POST' && req.url === '/api/posts') {
    const expectedSize = parseInt(req.headers['content-length']) || 0;
    uploadTracker.set(requestId, {
      startTime: Date.now(),
      contentLength: expectedSize,
      stages: {
        requestReceived: Date.now(),
        dataReceptionStarted: null,
        dataReceptionCompleted: null,
        multerStarted: null,
        multerCompleted: null,
        processingStarted: null,
        processingCompleted: null
      },
      files: [],
      errors: [],
      dataChunks: {
        received: 0,
        count: 0,
        lastUpdate: Date.now()
      }
    });
    
    logWithStats(requestId, "📤 UPLOAD REQUEST DETECTED", {
      expectedSize: `${Math.round(expectedSize / 1024 / 1024)}MB`,
      expectedSizeBytes: expectedSize
    });
  }
  
  // Override res.send to log response
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - req.startTime;
    
    logWithStats(requestId, "✅ RESPONSE SENT", {
      status: res.statusCode,
      duration: `${duration}ms`,
      responseSize: data ? `${data.length} chars` : '0 chars'
    });
    
    if (uploadTracker.has(requestId)) {
      const tracker = uploadTracker.get(requestId);
      tracker.stages.processingCompleted = Date.now();
      
      console.log(`\n📊 UPLOAD SUMMARY FOR REQUEST ${requestId}:`);
      console.log(`   Total Duration: ${duration}ms`);
      
      if (tracker.stages.multerStarted && tracker.stages.multerCompleted) {
        console.log(`   Multer Time: ${tracker.stages.multerCompleted - tracker.stages.multerStarted}ms`);
      }
      
      if (tracker.stages.processingStarted && tracker.stages.processingCompleted) {
        console.log(`   Processing Time: ${tracker.stages.processingCompleted - tracker.stages.processingStarted}ms`);
      }
      
      if (tracker.stages.dataReceptionStarted && tracker.stages.dataReceptionCompleted) {
        console.log(`   Data Reception Time: ${tracker.stages.dataReceptionCompleted - tracker.stages.dataReceptionStarted}ms`);
      }
      
      console.log(`   Files Processed: ${tracker.files.length}`);
      console.log(`   Data Chunks Received: ${tracker.dataChunks.count}`);
      console.log(`   Total Data Received: ${Math.round(tracker.dataChunks.received / 1024 / 1024)}MB`);
      console.log(`   Errors: ${tracker.errors.length}`);
      
      uploadTracker.delete(requestId);
    }
    
    console.log(`${'='.repeat(80)}`);
    console.log(`🏁 REQUEST ${requestId} COMPLETED (${duration}ms)`);
    console.log(`${'='.repeat(80)}\n`);
    
    return originalSend.call(this, data);
  };
  
  // Track request data reception with detailed progress
  let receivedBytes = 0;
  let lastLogTime = Date.now();
  const originalOn = req.on;
  
  req.on = function(event, listener) {
    if (event === 'data') {
      return originalOn.call(this, event, (chunk) => {
        receivedBytes += chunk.length;
        const now = Date.now();
        
        if (uploadTracker.has(requestId)) {
          const tracker = uploadTracker.get(requestId);
          
          // Mark data reception start
          if (!tracker.stages.dataReceptionStarted) {
            tracker.stages.dataReceptionStarted = now;
            logWithStats(requestId, "📥 DATA RECEPTION STARTED");
          }
          
          tracker.dataChunks.received = receivedBytes;
          tracker.dataChunks.count++;
          tracker.dataChunks.lastUpdate = now;
          
          // Log progress every MB or every 2 seconds
          const timeSinceLastLog = now - lastLogTime;
          const progress = req.headers['content-length'] ? 
            Math.round((receivedBytes / parseInt(req.headers['content-length'])) * 100) : 0;
          
          if (receivedBytes % (1024 * 1024) < chunk.length || timeSinceLastLog > 2000) {
            const speed = timeSinceLastLog > 0 ? 
              Math.round((chunk.length / timeSinceLastLog) * 1000 / 1024) : 0;
            
            logWithStats(requestId, "📥 DATA CHUNK RECEIVED", {
              chunkSize: `${Math.round(chunk.length / 1024)}KB`,
              totalReceived: `${Math.round(receivedBytes / 1024 / 1024)}MB`,
              progress: `${progress}%`,
              speed: `${speed}KB/s`,
              chunksCount: tracker.dataChunks.count
            });
            
            lastLogTime = now;
          }
        }
        
        listener(chunk);
      });
    } else if (event === 'end') {
      return originalOn.call(this, event, () => {
        if (uploadTracker.has(requestId)) {
          uploadTracker.get(requestId).stages.dataReceptionCompleted = Date.now();
          logWithStats(requestId, "📥 DATA RECEPTION COMPLETED", {
            totalReceived: `${Math.round(receivedBytes / 1024 / 1024)}MB`,
            totalChunks: uploadTracker.get(requestId).dataChunks.count
          });
        }
        listener();
      });
    } else if (event === 'error') {
      return originalOn.call(this, event, (error) => {
        logWithStats(requestId, "❌ REQUEST ERROR", {
          error: error.message,
          code: error.code
        });
        
        if (uploadTracker.has(requestId)) {
          uploadTracker.get(requestId).errors.push({
            type: 'REQUEST_ERROR',
            error: error.message,
            code: error.code,
            time: Date.now()
          });
        }
        
        listener(error);
      });
    }
    
    return originalOn.call(this, event, listener);
  };
  
  next();
});

app.use(express.json({
  limit: '100mb'
}));
app.use(express.static("public"));

// ================================
// MULTER CONFIGURATION WITH ULTRA LOGGING
// ================================

// Klasörleri oluştur
const createDirectories = () => {
  const dirs = ["uploads", "data"];
  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 [${timestamp()}] Directory created: ${dir}`);
    }
  });
};

// Dosya yükleme ayarları with ultra logging
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const reqId = req.requestId;
    logWithStats(reqId, "📂 MULTER DESTINATION CALLED", {
      fileName: file.originalname,
      fieldName: file.fieldname,
      mimeType: file.mimetype
    });
    cb(null, "uploads/");
  },
  
  filename: (req, file, cb) => {
    const reqId = req.requestId;
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const filename = uniqueSuffix + path.extname(file.originalname);
    
    logWithStats(reqId, "📝 FILENAME GENERATED", {
      original: file.originalname,
      generated: filename,
      extension: path.extname(file.originalname)
    });
    
    if (uploadTracker.has(reqId)) {
      uploadTracker.get(reqId).files.push({
        originalName: file.originalname,
        generatedName: filename,
        mimeType: file.mimetype,
        startTime: Date.now()
      });
    }
    
    cb(null, filename);
  },
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 2000 * 1024 * 1024, // 2GB per file
    files: 50,
    fields: 1000,
    fieldNameSize: 1000,
    fieldSize: 100 * 1024 * 1024,
    headerPairs: 2000
  },
  
  fileFilter: (req, file, cb) => {
    const reqId = req.requestId;
    
    logWithStats(reqId, "🔍 FILE FILTER CALLED", {
      fieldName: file.fieldname,
      originalName: file.originalname,
      mimeType: file.mimetype,
      encoding: file.encoding
    });
    
    if (file.mimetype.startsWith('image/') || 
        file.mimetype.startsWith('video/') ||
        file.mimetype.startsWith('audio/')) {
      
      logWithStats(reqId, "✅ FILE ACCEPTED", {
        fileName: file.originalname,
        type: file.mimetype
      });
      cb(null, true);
    } else {
      logWithStats(reqId, "❌ FILE REJECTED", {
        fileName: file.originalname,
        type: file.mimetype,
        reason: 'Unsupported file type'
      });
      
      if (uploadTracker.has(reqId)) {
        uploadTracker.get(reqId).errors.push({
          type: 'FILE_REJECTED',
          fileName: file.originalname,
          mimeType: file.mimetype,
          time: Date.now()
        });
      }
      
      cb(new Error(`Desteklenmeyen dosya türü: ${file.mimetype}`), false);
    }
  }
});

// ================================
// DATA OPERATIONS WITH LOGGING
// ================================

// Veri dosyası yolu
const DATA_FILE = "./data/posts.json";

// Veri okuma fonksiyonu
const readPosts = () => {
  const startTime = Date.now();
  console.log(`📖 [${timestamp()}] Reading posts file...`);
  
  try {
    if (fs.existsSync(DATA_FILE)) {
      const fileStats = fs.statSync(DATA_FILE);
      console.log(`📊 File exists: ${DATA_FILE} (${fileStats.size} bytes)`);

      const data = fs.readFileSync(DATA_FILE, "utf8");
      console.log(`📝 File read: ${data.length} characters`);

      if (data.trim() === "") {
        console.log(`⚠️ File is empty, returning empty array`);
        return [];
      }

      const parsedData = JSON.parse(data);
      const duration = Date.now() - startTime;
      console.log(`✅ JSON parsed: ${parsedData.length} posts (${duration}ms)`);
      return parsedData;
    } else {
      console.log(`⚠️ File not found: ${DATA_FILE}, returning empty array`);
      return [];
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ Read error after ${duration}ms:`, {
      message: error.message,
      code: error.code,
      path: error.path
    });

    if (error instanceof SyntaxError) {
      console.error(`🔧 JSON parse error, creating backup...`);
      try {
        const backupFile = DATA_FILE + ".backup." + Date.now();
        fs.copyFileSync(DATA_FILE, backupFile);
        console.log(`💾 Backup created: ${backupFile}`);
      } catch (backupError) {
        console.error(`❌ Backup failed:`, backupError.message);
      }
    }

    return [];
  }
};

// Veri yazma fonksiyonu
const writePosts = (posts) => {
  const startTime = Date.now();
  console.log(`💾 [${timestamp()}] Writing posts file...`);
  
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Directory created: ${dir}`);
    }

    const jsonData = JSON.stringify(posts, null, 2);
    console.log(`📊 JSON stringified: ${jsonData.length} characters`);

    fs.writeFileSync(DATA_FILE, jsonData, "utf8");
    
    const fileStats = fs.statSync(DATA_FILE);
    const duration = Date.now() - startTime;
    console.log(`✅ File written: ${DATA_FILE} (${fileStats.size} bytes, ${duration}ms)`);
    
    return true;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ Write error after ${duration}ms:`, {
      message: error.message,
      code: error.code,
      path: error.path
    });
    return false;
  }
};

// ================================
// API ENDPOINTS
// ================================

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

// ULTRA DETAILED UPLOAD ENDPOINT
app.post("/api/posts", (req, res, next) => {
  const reqId = req.requestId;
  
  if (uploadTracker.has(reqId)) {
    uploadTracker.get(reqId).stages.multerStarted = Date.now();
  }
  
  logWithStats(reqId, "🔄 MULTER PROCESSING STARTED");
  
  // Wrap multer to track every event
  const multerMiddleware = upload.fields([{ name: "files", maxCount: 50 }]);
  
  multerMiddleware(req, res, function (err) {
    const multerDuration = Date.now() - (uploadTracker.has(reqId) ? uploadTracker.get(reqId).stages.multerStarted : req.startTime);
    
    if (uploadTracker.has(reqId)) {
      uploadTracker.get(reqId).stages.multerCompleted = Date.now();
    }
    
    if (err) {
      logWithStats(reqId, "❌ MULTER ERROR", {
        errorType: err.constructor.name,
        errorCode: err.code,
        errorMessage: err.message,
        multerDuration: `${multerDuration}ms`
      });
      
      if (uploadTracker.has(reqId)) {
        uploadTracker.get(reqId).errors.push({
          type: 'MULTER_ERROR',
          error: err.message,
          code: err.code,
          time: Date.now()
        });
      }
      
      if (err instanceof multer.MulterError) {
        let errorMessage = `Multer error: ${err.message}`;
        let statusCode = 400;
        
        switch (err.code) {
          case 'LIMIT_FILE_SIZE':
            errorMessage = 'Dosya boyutu çok büyük! Maksimum 2GB dosya yükleyebilirsiniz.';
            break;
          case 'LIMIT_FILE_COUNT':
            errorMessage = 'Çok fazla dosya! Maksimum 50 dosya yükleyebilirsiniz.';
            break;
          case 'LIMIT_UNEXPECTED_FILE':
            errorMessage = 'Beklenmeyen dosya alanı! Field name "files" olmalı.';
            break;
          case 'LIMIT_PART_COUNT':
            errorMessage = 'Çok fazla form parçası!';
            break;
          case 'LIMIT_FIELD_KEY':
            errorMessage = 'Alan ismi çok uzun!';
            break;
          case 'LIMIT_FIELD_VALUE':
            errorMessage = 'Alan değeri çok büyük!';
            break;
          case 'LIMIT_FIELD_COUNT':
            errorMessage = 'Çok fazla alan!';
            break;
        }
        
        return res.status(statusCode).json({
          success: false,
          message: errorMessage,
          debug: {
            code: err.code,
            originalMessage: err.message
          }
        });
      } else {
        return res.status(500).json({
          success: false,
          message: `Upload hatası: ${err.message}`,
          debug: {
            type: err.constructor.name
          }
        });
      }
    }

    logWithStats(reqId, "✅ MULTER SUCCESS", {
      multerDuration: `${multerDuration}ms`
    });
    
    // Log detailed file information
    if (req.files && req.files.files) {
      let totalSize = 0;
      
      req.files.files.forEach((file, index) => {
        totalSize += file.size;
        
        logWithStats(reqId, `📄 FILE ${index + 1} PROCESSED`, {
          originalName: file.originalname,
          fileName: file.filename,
          size: `${Math.round(file.size / 1024 / 1024)}MB`,
          mimeType: file.mimetype,
          path: file.path,
          destination: file.destination
        });
        
        // Update tracker
        if (uploadTracker.has(reqId)) {
          const tracker = uploadTracker.get(reqId);
          const fileInfo = tracker.files.find(f => f.generatedName === file.filename);
          if (fileInfo) {
            fileInfo.size = file.size;
            fileInfo.completedTime = Date.now();
            fileInfo.processingDuration = Date.now() - fileInfo.startTime;
          }
        }
      });
      
      logWithStats(reqId, "📊 UPLOAD STATISTICS", {
        fileCount: req.files.files.length,
        totalSize: `${Math.round(totalSize / 1024 / 1024)}MB`,
        averageFileSize: `${Math.round((totalSize / req.files.files.length) / 1024 / 1024)}MB`
      });
    } else {
      logWithStats(reqId, "ℹ️ NO FILES UPLOADED");
    }
    
    next();
  });
}, (req, res) => {
  const reqId = req.requestId;
  
  if (uploadTracker.has(reqId)) {
    uploadTracker.get(reqId).stages.processingStarted = Date.now();
  }
  
  logWithStats(reqId, "⚙️ POST PROCESSING STARTED");
  
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

    logWithStats(reqId, "📋 PARSING REQUEST DATA", {
      bodyKeys: Object.keys(req.body),
      contentType: contentType || 'missing',
      titleLength: (title || '').length,
      contentLength: (content || '').length
    });

    // Veriyi temizle (boşluk karakterlerini kaldır)
    const cleanTitle = (title || "").trim();
    const cleanContent = (content || "").trim();
    const cleanNotes = (notes || "").trim();
    const cleanStoryLink = (storyLink || "").trim();
    const cleanStoryLinkTitle = (storyLinkTitle || "").trim();

    logWithStats(reqId, "✅ DATA CLEANED", {
      title: cleanTitle ? `${cleanTitle.length} chars` : 'empty',
      content: cleanContent ? `${cleanContent.length} chars` : 'empty',
      notes: cleanNotes ? `${cleanNotes.length} chars` : 'empty'
    });

    // Validasyon kontrolleri
    if (!cleanTitle) {
      console.error("Başlık alanı boş");
      logWithStats(reqId, "❌ VALIDATION FAILED: No title");
      return res.status(400).json({
        success: false,
        message: "Paylaşım başlığı zorunludur",
      });
    }

    if (!scheduledDate || !scheduledTime) {
      console.error("Eksik tarih/saat bilgisi");
      logWithStats(reqId, "❌ VALIDATION FAILED: No date/time");
      return res.status(400).json({
        success: false,
        message: "Tarih ve saat alanları zorunludur",
      });
    }

    // İçerik türüne göre validasyon
    if (contentType === "post" && !cleanContent) {
      console.error("Post içeriği boş");
      logWithStats(reqId, "❌ VALIDATION FAILED: No post content");
      return res.status(400).json({
        success: false,
        message: "Post içeriği gereklidir",
      });
    }

    // selectedAccounts parse etmeyi dene
    let parsedAccounts = [];
    try {
      parsedAccounts = JSON.parse(selectedAccounts || "[]");
      console.log("Parsed accounts:", parsedAccounts);
      logWithStats(reqId, "✅ ACCOUNTS PARSED", {
        accountCount: parsedAccounts.length
      });
    } catch (parseError) {
      console.error("selectedAccounts parse hatası:", parseError);
      console.error("selectedAccounts değeri:", selectedAccounts);
      logWithStats(reqId, "❌ ACCOUNTS PARSE ERROR", {
        error: parseError.message,
        rawData: selectedAccounts?.substring(0, 100) + '...'
      });
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
    
    logWithStats(reqId, "📁 FILES PROCESSED", {
      fileCount: files.length,
      totalSize: `${Math.round(files.reduce((sum, f) => sum + f.size, 0) / 1024 / 1024)}MB`
    });

    const newPost = {
      id: Date.now(),
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
    logWithStats(reqId, "🏗️ POST OBJECT CREATED", {
      postId: newPost.id,
      fileCount: files.length
    });

    logWithStats(reqId, "📖 READING EXISTING POSTS");
    const posts = readPosts();
    console.log("Mevcut post sayısı:", posts.length);
    logWithStats(reqId, "📊 CURRENT POSTS", {
      count: posts.length
    });

    posts.push(newPost);

    logWithStats(reqId, "💾 WRITING POSTS");
    const writeResult = writePosts(posts);
    console.log("Veri yazma sonucu:", writeResult);

    if (writeResult) {
      console.log("Post başarıyla kaydedildi");
      logWithStats(reqId, "✅ POST SAVED SUCCESSFULLY", {
        totalPosts: posts.length,
        newPostId: newPost.id
      });
      res.json({ success: true, post: newPost });
    } else {
      console.error("Veri yazma hatası");
      logWithStats(reqId, "❌ POST SAVE FAILED");
      res.status(500).json({ success: false, message: "Veri kaydedilemedi" });
    }
  } catch (error) {
    console.error("Post ekleme hatası - Detay:", error);
    console.error("Hata yığını:", error.stack);
    logWithStats(reqId, "💥 PROCESSING ERROR", {
      errorMessage: error.message,
      errorStack: error.stack.split('\n')[0]
    });
    res.status(500).json({
      success: false,
      message: "Sunucu hatası: " + error.message,
    });
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

// Global error handler
app.use((error, req, res, next) => {
  const reqId = req.requestId || 'unknown';
  
  logWithStats(reqId, "💥 GLOBAL ERROR HANDLER", {
    errorType: error.constructor.name,
    errorMessage: error.message,
    errorStack: error.stack?.split('\n')[0]
  });
  
  if (error.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      message: 'İstek çok büyük! Dosya boyutunu azaltın.',
      debug: { type: error.type }
    });
  }
  
  res.status(500).json({
    success: false,
    message: 'Sunucu hatası: ' + error.message,
    debug: { type: error.constructor.name }
  });
});

// Sunucuyu başlat
app.listen(PORT, () => {
  console.log(`\n${'🚀'.repeat(20)}`);
  console.log(`🎯 ULTRA DEBUG SERVER STARTED`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`📊 Memory tracking: ENABLED`);
  console.log(`⏱️  Performance tracking: ENABLED`);
  console.log(`🔍 Detailed logging: MAXIMUM`);
  console.log(`📁 File upload limit: 2GB per file, 50 files max`);
  console.log(`📈 Request tracking: ENABLED`);
  console.log(`📦 ZIP download: ENABLED`);
  console.log(`${'🚀'.repeat(20)}\n`);
  console.log("Kullanım:");
  console.log("1. npm install");
  console.log("2. npm start");
});

module.exports = app;