const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static(__dirname));

// Veri kaydetme endpoint'i
app.post('/saveData', async (req, res) => {
    try {
        await fs.writeFile(
            path.join(__dirname, 'data.json'),
            JSON.stringify(req.body, null, 2)
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server http://localhost:${port} adresinde çalışıyor`);
});
