// Global değişkenleri güncelle
let mesaiKayitlari = [];
let personelListesi = [];

// Veri yükleme fonksiyonu
async function verileriYukle() {
    const data = await DataManager.loadData();
    personelListesi = data.personelListesi;
    mesaiKayitlari = data.mesaiKayitlari;
    personelListesiniGuncelle();
    listeyiGuncelle();
}

// Veri kaydetme fonksiyonu
async function verileriKaydet() {
    await DataManager.saveData({
        personelListesi,
        mesaiKayitlari
    });
}

// Modal işlemleri
const modal = document.getElementById('personelModal');
const btn = document.getElementById('yeniPersonelBtn');
const span = document.getElementsByClassName('close')[0];

btn.onclick = function() {
    modal.style.display = "block";
}

span.onclick = function() {
    modal.style.display = "none";
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

// Personel Liste Modal işlemleri
const personelListeModal = document.getElementById('personelListeModal');
const personelListeBtn = document.getElementById('personelListeBtn');
const personelDuzenleModal = document.getElementById('personelDuzenleModal');

personelListeBtn.onclick = function() {
    personelListeModal.style.display = "block";
    personelTablosunuGuncelle();
}

function personelTablosunuGuncelle() {
    const liste = document.getElementById('personelListesi');
    liste.innerHTML = '';
    
    personelListesi.forEach(personel => {
        const satir = document.createElement('tr');
        satir.innerHTML = `
            <td>${personel.ad} ${personel.soyad}</td>
            <td>${personel.tcNo}</td>
            <td>${personel.telefon}</td>
            <td>${personel.gorev}</td>
            <td class="islem-butonlari">
                <button onclick="personelDuzenle(${personel.id})" class="duzenle-btn">Düzenle</button>
                <button onclick="personelSil(${personel.id})" class="sil-btn">Sil</button>
            </td>
        `;
        liste.appendChild(satir);
    });
}

function personelDuzenle(id) {
    const personel = personelListesi.find(p => p.id === id);
    if (!personel) return;

    document.getElementById('duzenlePersonelId').value = personel.id;
    document.getElementById('duzenleAd').value = personel.ad;
    document.getElementById('duzenleSoyad').value = personel.soyad;
    document.getElementById('duzenleTc').value = personel.tcNo;
    document.getElementById('duzenleTelefon').value = personel.telefon;
    document.getElementById('duzenleIseGirisTarihi').value = personel.iseGirisTarihi;
    document.getElementById('duzenleGorev').value = personel.gorev;

    personelListeModal.style.display = "none";
    personelDuzenleModal.style.display = "block";
}

document.getElementById('personelDuzenleForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const id = parseInt(document.getElementById('duzenlePersonelId').value);
    const personelIndex = personelListesi.findIndex(p => p.id === id);
    
    if (personelIndex === -1) return;

    personelListesi[personelIndex] = {
        id: id,
        ad: document.getElementById('duzenleAd').value,
        soyad: document.getElementById('duzenleSoyad').value,
        tcNo: document.getElementById('duzenleTc').value,
        telefon: document.getElementById('duzenleTelefon').value,
        iseGirisTarihi: document.getElementById('duzenleIseGirisTarihi').value,
        gorev: document.getElementById('duzenleGorev').value
    };

    localStorage.setItem('personelListesi', JSON.stringify(personelListesi));
    
    personelDuzenleModal.style.display = "none";
    personelTablosunuGuncelle();
    personelListesiniGuncelle();
});

async function personelSil(id) {
    if (!confirm('Bu personeli silmek istediğinizden emin misiniz?')) return;

    personelListesi = personelListesi.filter(p => p.id !== id);
    mesaiKayitlari = mesaiKayitlari.filter(m => m.personelId !== id);
    
    await verileriKaydet();
    
    personelTablosunuGuncelle();
    personelListesiniGuncelle();
    listeyiGuncelle();
}

// Modal kapatma işlevlerini güncelle
const allModals = document.getElementsByClassName('modal');
const allCloseButtons = document.getElementsByClassName('close');

Array.from(allCloseButtons).forEach((button, index) => {
    button.onclick = function() {
        allModals[index].style.display = "none";
    }
});

window.onclick = function(event) {
    Array.from(allModals).forEach(modal => {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    });
}

// Personel kayıt formu işlemleri
document.getElementById('personelForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const yeniPersonel = {
        id: Date.now(),
        ad: document.getElementById('personelAd').value,
        soyad: document.getElementById('personelSoyad').value,
        tcNo: document.getElementById('personelTc').value,
        telefon: document.getElementById('personelTelefon').value,
        iseGirisTarihi: document.getElementById('iseGirisTarihi').value,
        gorev: document.getElementById('personelGorev').value
    };

    personelListesi.push(yeniPersonel);
    await verileriKaydet();
    
    this.reset();
    modal.style.display = "none";
    personelListesiniGuncelle();
});

function personelListesiniGuncelle() {
    const container = document.getElementById('personelCheckboxList');
    container.innerHTML = '';
    
    personelListesi.forEach(personel => {
        const div = document.createElement('div');
        div.className = 'personel-checkbox-item';
        
        div.innerHTML = `
            <input type="checkbox" id="personel_${personel.id}" value="${personel.id}">
            <label for="personel_${personel.id}">${personel.ad} ${personel.soyad} - ${personel.gorev}</label>
        `;
        
        container.appendChild(div);
    });

    // Checkbox'ları dinlemeye başla
    checkboxlariDinle();
}

// TC Kimlik Numarası kontrolü
document.getElementById('personelTc').addEventListener('input', function(e) {
    this.value = this.value.replace(/[^0-9]/g, '').slice(0, 11);
});

// Telefon numarası formatı
document.getElementById('personelTelefon').addEventListener('input', function(e) {
    let number = this.value.replace(/[^\d]/g, '');
    if (number.length > 10) number = number.slice(0, 10);
    if (number.length >= 6) {
        this.value = `${number.slice(0,3)}-${number.slice(3,6)}-${number.slice(6)}`;
    } else if (number.length >= 3) {
        this.value = `${number.slice(0,3)}-${number.slice(3)}`;
    } else {
        this.value = number;
    }
});

// Yeni checkbox değişiklik takibi
function checkboxlariDinle() {
    const checkboxlar = document.querySelectorAll('#personelCheckboxList input[type="checkbox"]');
    checkboxlar.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const seciliPersoneller = Array.from(
                document.querySelectorAll('#personelCheckboxList input[type="checkbox"]:checked')
            ).map(cb => {
                const personel = personelListesi.find(p => p.id === parseInt(cb.value));
                return {
                    id: personel.id,
                    ad: `${personel.ad} ${personel.soyad}`
                };
            });
            
            gosterSeciliPersoneller(seciliPersoneller);
        });
    });
}

function gosterSeciliPersoneller(personeller) {
    const container = document.getElementById('seciliPersoneller');
    if (!container) return; // Container yoksa işlemi atla
    
    container.innerHTML = personeller.map(p => 
        `<span>${p.ad}</span>`
    ).join('');
}

// Mesai kayıt kontrolü için yeni fonksiyon
function kayitVarMi(personelId, tarih) {
    return mesaiKayitlari.some(kayit => 
        kayit.personelId === personelId && 
        kayit.tarih === tarih
    );
}

// Mesai formu güncelleme - çoklu kayıt için
document.getElementById('mesaiForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const seciliPersoneller = Array.from(
        document.querySelectorAll('#personelCheckboxList input[type="checkbox"]:checked')
    ).map(checkbox => 
        personelListesi.find(p => p.id === parseInt(checkbox.value))
    );

    if (seciliPersoneller.length === 0) {
        alert('Lütfen en az bir personel seçiniz');
        return;
    }
    
    const tarih = document.getElementById('tarih').value;
    const baslangic = document.getElementById('baslangicSaati').value;
    const bitis = document.getElementById('bitisSaati').value;
    
    // Seçili personellerin kayıt kontrolü
    const tekrarEdenPersoneller = seciliPersoneller.filter(personel => 
        kayitVarMi(personel.id, tarih)
    );

    if (tekrarEdenPersoneller.length > 0) {
        const personelListesi = tekrarEdenPersoneller
            .map(p => `${p.ad} ${p.soyad}`)
            .join(', ');
        alert(`${tarih} tarihinde şu personeller için zaten kayıt mevcut:\n${personelListesi}`);
        return;
    }

    const toplamSaat = hesaplaMesaiSaati(baslangic, bitis);

    // Her seçili personel için mesai kaydı oluştur
    seciliPersoneller.forEach(personel => {
        const yeniKayit = {
            id: Date.now() + Math.random(),
            personelId: personel.id,
            personel: `${personel.ad} ${personel.soyad}`,
            gorev: personel.gorev,
            tarih: tarih,
            baslangic: baslangic,
            bitis: bitis,
            toplamSaat: toplamSaat
        };

        mesaiKayitlari.push(yeniKayit);
    });

    await verileriKaydet();
    
    // Tüm checkboxları temizle
    document.querySelectorAll('#personelCheckboxList input[type="checkbox"]')
        .forEach(checkbox => checkbox.checked = false);
    
    this.reset();
    // Varsayılan saatleri tekrar ayarla
    document.getElementById('baslangicSaati').value = "08:00";
    document.getElementById('bitisSaati').value = "18:00";
    bugunTarihAyarla();
    
    listeyiGuncelle();
    
    // Mobil için başarılı mesajı
    alert(`${seciliPersoneller.length} personel için mesai kaydı oluşturuldu`);
});

function hesaplaMesaiSaati(baslangic, bitis) {
    const bas = new Date(`2000-01-01T${baslangic}`);
    const bit = new Date(`2000-01-01T${bitis}`);
    
    // Normal mesai saatleri
    const mesaiBaslangic = new Date(`2000-01-01T08:00`);
    const mesaiBitis = new Date(`2000-01-01T18:00`);
    
    let toplamSaat = 0;
    
    // Eğer bitiş saati 18:00'den sonra ise
    if (bit > mesaiBitis) {
        // 18:00'den sonraki süreyi mesai olarak hesapla
        toplamSaat = (bit - mesaiBitis) / (1000 * 60 * 60);
    }
    
    return toplamSaat.toFixed(2);
}

// Bugünün tarihini ayarlama fonksiyonu
function bugunTarihAyarla() {
    const bugun = new Date().toISOString().split('T')[0];
    document.getElementById('tarih').value = bugun;
}

function listeyiGuncelle() {
    const liste = document.getElementById('mesaiListesi');
    liste.innerHTML = '';
    
    // Mesai kayıtlarını personele göre grupla
    const grupluKayitlar = {};
    mesaiKayitlari.forEach(kayit => {
        if (!grupluKayitlar[kayit.personelId]) {
            grupluKayitlar[kayit.personelId] = [];
        }
        grupluKayitlar[kayit.personelId].push(kayit);
    });

    // Her personel için grup başlığı ve kayıtları oluştur
    Object.values(grupluKayitlar).forEach(personelKayitlari => {
        if (personelKayitlari.length === 0) return;

        const personel = personelKayitlari[0];
        
        // Personel başlık satırı
        const baslikSatir = document.createElement('tr');
        baslikSatir.className = 'personel-baslik';
        baslikSatir.innerHTML = `
            <td colspan="6" style="background-color: #f2f2f2; font-weight: bold; padding: 15px;">
                ${personel.personel} - ${personel.gorev}
            </td>
        `;
        liste.appendChild(baslikSatir);

        // Personelin mesai kayıtları - Tarihe göre küçükten büyüğe sırala
        personelKayitlari
            .sort((a, b) => new Date(a.tarih) - new Date(b.tarih))
            .forEach(kayit => {
                const satir = document.createElement('tr');
                const mesaiDurumu = kayit.toplamSaat > 0 ? 
                    `<span style="color: #e74c3c;">${kayit.toplamSaat} saat mesai</span>` : 
                    '<span style="color: #2ecc71;">Normal mesai</span>';
                
                satir.innerHTML = `
                    <td style="padding-left: 30px;">⤷</td>
                    <td>${kayit.tarih}</td>
                    <td>${kayit.baslangic}</td>
                    <td>${kayit.bitis}</td>
                    <td>${mesaiDurumu}</td>
                    <td>
                        <button onclick="kayitSil(${kayit.id})">Sil</button>
                    </td>
                `;
                liste.appendChild(satir);
            });

        // Personel kayıtları arasına ayraç
        const ayracSatir = document.createElement('tr');
        ayracSatir.innerHTML = '<td colspan="6" style="border-bottom: 2px solid #ddd;"></td>';
        liste.appendChild(ayracSatir);
    });
}

async function kayitSil(id) {
    mesaiKayitlari = mesaiKayitlari.filter(kayit => kayit.id !== id);
    await verileriKaydet();
    listeyiGuncelle();
}

// Sayfa yüklendiğinde mevcut kayıtları ve personel listesini göster
document.addEventListener('DOMContentLoaded', async function() {
    await verileriYukle();
    document.getElementById('baslangicSaati').value = "08:00";
    document.getElementById('bitisSaati').value = "18:00";
    bugunTarihAyarla();
    personelListesiniGuncelle();
    listeyiGuncelle();
    
    // Varsayılan ay değerini ayarla
    const bugun = new Date();
    const varsayilanAy = `${bugun.getFullYear()}-${String(bugun.getMonth() + 1).padStart(2, '0')}`;
    document.getElementById('aySecim').value = varsayilanAy;
});

// Görünüm değiştirme işlemleri
document.getElementById('gunlukGoruntule').addEventListener('click', function() {
    document.getElementById('gunlukListe').style.display = 'block';
    document.getElementById('aylikOzet').style.display = 'none';
    this.classList.add('active');
    document.getElementById('aylikGoruntule').classList.remove('active');
});

document.getElementById('aylikGoruntule').addEventListener('click', function() {
    document.getElementById('gunlukListe').style.display = 'none';
    document.getElementById('aylikOzet').style.display = 'block';
    this.classList.add('active');
    document.getElementById('gunlukGoruntule').classList.remove('active');
    aylikOzetiGuncelle();
});

// Ay seçimi değiştiğinde özeti güncelle
document.getElementById('aySecim').addEventListener('change', aylikOzetiGuncelle);

function aylikOzetiGuncelle() {
    const secilenAy = document.getElementById('aySecim').value; // "2024-01" formatında
    const liste = document.getElementById('aylikMesaiListesi');
    liste.innerHTML = '';

    // Personel bazında mesaileri grupla
    const personelMesaileri = {};

    mesaiKayitlari
        .filter(kayit => kayit.tarih.substring(0, 7) === secilenAy)
        .sort((a, b) => new Date(a.tarih) - new Date(b.tarih)) // Tarihe göre küçükten büyüğe sırala
        .forEach(kayit => {
            if (!personelMesaileri[kayit.personelId]) {
                personelMesaileri[kayit.personelId] = {
                    personel: kayit.personel,
                    gorev: kayit.gorev,
                    toplamSaat: 0,
                    kayitlar: []
                };
            }
            personelMesaileri[kayit.personelId].toplamSaat += parseFloat(kayit.toplamSaat);
            personelMesaileri[kayit.personelId].kayitlar.push(kayit);
        });

    // Her personel için özet satır oluştur
    Object.values(personelMesaileri).forEach(ozet => {
        const satir = document.createElement('tr');
        const kayitDetaylari = ozet.kayitlar
            .map(k => `${k.tarih}: ${k.toplamSaat} saat`)
            .join('<br>');

        satir.innerHTML = `
            <td>${ozet.personel} - ${ozet.gorev}</td>
            <td>${ozet.toplamSaat.toFixed(2)} saat</td>
            <td>
                <button onclick="detayGoster(this)" class="detay-btn">
                    Detayları Göster
                </button>
                <div class="mesai-detay" style="display: none;">
                    ${kayitDetaylari}
                </div>
            </td>
        `;
        liste.appendChild(satir);
    });
}

function detayGoster(btn) {
    const detayDiv = btn.nextElementSibling;
    if (detayDiv.style.display === 'none') {
        detayDiv.style.display = 'block';
        btn.textContent = 'Detayları Gizle';
    } else {
        detayDiv.style.display = 'none';
        btn.textContent = 'Detayları Göster';
    }
}
