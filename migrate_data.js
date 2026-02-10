const fs = require('fs');
const path = require('path');

// Yollar
const LIVE_DATA_PATH = './data/posts_live.json'; // Kullanıcının canlı veriyi buraya koyacağını varsayalım
const TARGET_DATA_PATH = './data/posts.json';

// Migration fonksiyonu
function migrateData() {
    try {
        if (!fs.existsSync(LIVE_DATA_PATH)) {
            console.error(`❌ Hata: Canlı veri dosyası bulunamadı: ${LIVE_DATA_PATH}`);
            console.log(`ℹ️ Lütfen canlı sistemden aldığınız 'posts.json' dosyasını 'data/posts_live.json' olarak kaydedin.`);
            return;
        }

        // Yedek al
        if (fs.existsSync(TARGET_DATA_PATH)) {
            const backupPath = `${TARGET_DATA_PATH}.backup.${Date.now()}`;
            fs.copyFileSync(TARGET_DATA_PATH, backupPath);
            console.log(`✅ Mevcut yerel veri yedeklendi: ${backupPath}`);
        }

        const rawData = fs.readFileSync(LIVE_DATA_PATH, 'utf8');
        let posts = JSON.parse(rawData);

        console.log(`📊 Toplam ${posts.length} adet gönderi işleniyor...`);

        const migratedPosts = posts.map(post => {
            // 1. Dosya yapısını düzelt (files array'i yoksa oluştur)
            let files = post.files || [];

            // Eski tek dosya formatından (fileName) yeni formata (files array) geçiş
            if (files.length === 0 && post.fileName) {
                files.push({
                    fileName: post.fileName,
                    originalName: post.originalName || post.fileName,
                    mimetype: post.mimetype || 'application/octet-stream',
                    size: 0 // Bilinmiyor
                });
            }

            // 2. Yeni alanları ekle (eğer yoksa)
            return {
                ...post,
                files: files,
                // Eski alanları temizle (isteğe bağlı, tutadabiliriz ama temizlik iyidir)
                fileName: undefined,
                originalName: undefined,

                // Yeni Planlama Modu Alanları
                plannerMode: post.plannerMode || 'single',
                planBatchId: post.planBatchId || null,
                planSequence: post.planSequence || null,
                planTotal: post.planTotal || null,
                planGeneratedAt: post.planGeneratedAt || null,

                // Status kontrolü (eski verilerde farklı olabilir mi?)
                status: post.status || 'planlandı',

                // Hesaplar
                selectedAccounts: post.selectedAccounts || [],
                completedAccounts: post.completedAccounts || []
            };
        });

        // Veriyi kaydet
        fs.writeFileSync(TARGET_DATA_PATH, JSON.stringify(migratedPosts, null, 2), 'utf8');

        console.log(`✅ İşlem tamamlandı! ${migratedPosts.length} gönderi başarıyla yeni formata dönüştürüldü ve 'data/posts.json' dosyasına kaydedildi.`);

    } catch (error) {
        console.error('❌ Bir hata oluştu:', error);
    }
}

migrateData();
