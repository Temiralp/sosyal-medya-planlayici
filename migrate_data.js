const fs = require('fs');
const path = require('path');

// Yollar
const LIVE_DATA_PATH = './data/posts_live.json';
const TARGET_DATA_PATH = './data/posts.json';

// JSON Tamir Fonksiyonu (Yarım kalan dosyaları düzeltmek için)
function getValidJsonContent(filePath) {
    if (!fs.existsSync(filePath)) return null;

    const data = fs.readFileSync(filePath, 'utf8');
    try {
        // Önce normal şekilde dene
        JSON.parse(data);
        return data;
    } catch (e) {
        console.log(`⚠️ '${filePath}' bozuk veya yarım kalmış (Truncated) görünüyor. Tamir ediliyor...`);

        // Yarım kalmış JSON'ı tamir etmeye çalış (Son geçerli '},' dizisinden kesip ']' ekle)
        const size = fs.statSync(filePath).size;
        const fd = fs.openSync(filePath, 'r');
        const CHUNK_SIZE = Math.min(size, 1024 * 500); // Son 500KB'a bak
        const buffer = Buffer.alloc(CHUNK_SIZE);
        const startPos = Math.max(0, size - CHUNK_SIZE);

        fs.readSync(fd, buffer, 0, CHUNK_SIZE, startPos);
        fs.closeSync(fd);

        const contentStr = buffer.toString('utf8');
        const lastCommaObj = contentStr.lastIndexOf('},');

        if (lastCommaObj !== -1) {
            // Tamamlanmış son nesneyi bulduk
            const truncatedContent = data.substring(0, startPos + lastCommaObj + 1) + ']';
            try {
                JSON.parse(truncatedContent);
                console.log(`✅ JSON başarıyla tamir edildi. Son geçerli nesneden kesildi.`);
                return truncatedContent;
            } catch (innerError) {
                console.error(`❌ Tamir denemesi başarısız oldu:`, innerError.message);
                return null;
            }
        } else {
            console.error(`❌ JSON tamir edilemedi: Geçerli bir nesne bitişi ('},') bulunamadı.`);
            return null;
        }
    }
}

// Migration fonksiyonu
function migrateData() {
    try {
        console.log(`🚀 Veri migrasyonu başlatılıyor...`);

        const rawData = getValidJsonContent(LIVE_DATA_PATH);
        if (!rawData) {
            console.error(`❌ Hata: Kaynak veri dosyası '${LIVE_DATA_PATH}' okunamadı veya tamir edilemedi.`);
            return;
        }

        let posts = JSON.parse(rawData);
        console.log(`📊 Toplam ${posts.length} adet gönderi işleniyor...`);

        // Yedek al
        if (fs.existsSync(TARGET_DATA_PATH)) {
            const backupPath = `${TARGET_DATA_PATH}.backup.${Date.now()}`;
            fs.copyFileSync(TARGET_DATA_PATH, backupPath);
            console.log(`📦 Mevcut hedef veri yedeklendi: ${backupPath}`);
        }

        const migratedPosts = posts.map(post => {
            // 1. ID kontrolü
            if (!post.id) post.id = Date.now() + Math.floor(Math.random() * 1000);

            // 2. Dosya yapısını düzelt
            let files = post.files || [];
            if (files.length === 0 && post.fileName) {
                files.push({
                    fileName: post.fileName,
                    originalName: post.originalName || post.fileName,
                    mimetype: post.mimetype || 'application/octet-stream',
                    size: post.size || 0
                });
            }

            // 3. Normalizasyon
            return {
                ...post,
                files: files,
                // Eski alanları temizle (isteğe bağlı, tutadabiliriz ama temizlik iyidir)
                fileName: undefined,
                originalName: undefined,
                mimetype: undefined,
                size: undefined,

                // Eksik alanları varsayılanlarla doldur
                plannerMode: post.plannerMode || 'single',
                planBatchId: post.planBatchId || null,
                planSequence: post.planSequence || null,
                planTotal: post.planTotal || null,
                planGeneratedAt: post.planGeneratedAt || null,
                status: post.status || 'planlandı',
                selectedAccounts: post.selectedAccounts || [],
                completedAccounts: post.completedAccounts || [],
                createdAt: post.createdAt || new Date().toLocaleString('tr-TR'),
                manualOrder: post.manualOrder !== undefined ? post.manualOrder : 0
            };
        });

        // Veriyi kaydet
        const finalJson = JSON.stringify(migratedPosts, null, 2);
        fs.writeFileSync(TARGET_DATA_PATH, finalJson, 'utf8');

        // Kaydedilen veriyi doğrula
        const savedSize = fs.statSync(TARGET_DATA_PATH).size;
        console.log(`✅ İşlem tamamlandı!`);
        console.log(`📝 Dosya: ${TARGET_DATA_PATH}`);
        console.log(`📉 Boyut: ${(savedSize / (1024 * 1024)).toFixed(2)} MB`);
        console.log(`✨ Gönderi Sayısı: ${migratedPosts.length}`);

    } catch (error) {
        console.error('❌ Beklenmedik bir hata oluştu:', error);
    }
}

migrateData();

