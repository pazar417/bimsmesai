const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const app = express();
const port = 80;

app.use(express.json());
app.use(express.static(__dirname));

// Yedekleme fonksiyonu
async function createBackup() {
    try {
        const data = await fs.readFile(path.join(__dirname, 'data.json'));
        const timestamp = new Date().toISOString().replace(/[:]/g, '-');
        const backupDir = path.join(__dirname, 'backups');
        
        await fs.mkdir(backupDir, { recursive: true });
        await fs.writeFile(
            path.join(backupDir, `data-${timestamp}.json`),
            data
        );
    } catch (error) {
        console.error('Yedekleme hatası:', error);
    }
}

// Veri kaydetme endpoint'i
app.post('/saveData', async (req, res) => {
    try {
        // Önce yedek al
        await createBackup();

        // Sonra yeni veriyi kaydet
        await fs.writeFile(
            path.join(__dirname, 'data.json'),
            JSON.stringify(req.body, null, 2)
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Veri kaydetme hatası:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

app.listen(port, () => {
    console.log(`Server http://localhost:${port} adresinde çalışıyor`);
});

// Beklenmeyen hataları yakala
process.on('unhandledRejection', (error) => {
    console.error('Beklenmeyen hata:', error);
});
