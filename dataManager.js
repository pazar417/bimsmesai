class DataManager {
    static async loadData() {
        try {
            const response = await fetch('data.json');
            if (!response.ok) {
                throw new Error('Veri yüklenemedi');
            }
            const data = await response.json();
            return {
                personelListesi: data.personelListesi || [],
                mesaiKayitlari: data.mesaiKayitlari || [],
                adminKullanicilar: data.adminKullanicilar || []
            };
        } catch (error) {
            console.error('Veri yükleme hatası:', error);
            alert('Veri yükleme hatası oluştu. Lütfen sayfayı yenileyin.');
            throw error;
        }
    }

    static async saveData(data) {
        try {
            const response = await fetch('/saveData', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data, null, 2)
            });

            if (!response.ok) {
                throw new Error('Veri kaydedilemedi');
            }

            const result = await response.json();
            if (!result.success) {
                throw new Error('Kayıt işlemi başarısız');
            }

            return result;
        } catch (error) {
            console.error('Veri kaydetme hatası:', error);
            alert('Veri kaydetme hatası oluştu. Lütfen tekrar deneyin.');
            throw error;
        }
    }
}
