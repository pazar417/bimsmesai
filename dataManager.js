class DataManager {
    static async loadData() {
        try {
            const response = await fetch('data.json');
            const data = await response.json();
            return {
                personelListesi: data.personelListesi || [],
                mesaiKayitlari: data.mesaiKayitlari || []
            };
        } catch (error) {
            console.error('Veri yükleme hatası:', error);
            return {
                personelListesi: [],
                mesaiKayitlari: []
            };
        }
    }

    static async saveData(data) {
        try {
            const response = await fetch('/saveData', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            console.error('Veri kaydetme hatası:', error);
            // Yedek olarak localStorage'a kaydet
            localStorage.setItem('personelListesi', JSON.stringify(data.personelListesi));
            localStorage.setItem('mesaiKayitlari', JSON.stringify(data.mesaiKayitlari));
        }
    }
}
