// Global değişkenleri güncelle - localStorage referanslarını kaldır
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

// Modal işlemleri - gereksiz referansları kaldır
const modal = document.getElementById('personelModal');
const span = document.getElementsByClassName('close')[0];

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
const personelDuzenleModal = document.getElementById('personelDuzenleModal');

function personelTablosunuGuncelle() {
    const liste = document.getElementById('personelListesi');
    liste.innerHTML = '';
    const session = SessionManager.getUserSession();
    
    // Personel listesini filtrele
    const filtrelenmisListe = personelListesi.filter(personel => {
        // Varsayılan admin ve gizli personelleri gösterme
        if (personel.isDefaultAdmin || personel.isHidden) return false;
        return true;
    });

    filtrelenmisListe.forEach(personel => {
        const satir = document.createElement('tr');
        satir.className = personel.isAdmin ? 'admin-row' : '';
        
        // Silme butonu görünürlüğü kontrolü
        const silButonuGoster = 
            !personel.isAdmin || 
            (session.adminKullanici === 'admin' && !personel.isDefaultAdmin);
        
        satir.innerHTML = `
            <td>${personel.ad} ${personel.soyad} ${personel.isAdmin ? '(Admin)' : ''}</td>
            <td>${personel.tcNo}</td>
            <td>${personel.telefon}</td>
            <td>${personel.gorev}</td>
            <td class="islem-butonlari">
                <button onclick="personelDuzenle(${personel.id})" class="duzenle-btn">Düzenle</button>
                ${silButonuGoster ? `<button onclick="personelSil(${personel.id})" class="sil-btn">Sil</button>` : ''}
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

// Personel düzenleme formunu güncelle
document.getElementById('personelDuzenleForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const id = parseInt(document.getElementById('duzenlePersonelId').value);
    const personelIndex = personelListesi.findIndex(p => p.id === id);
    
    if (personelIndex === -1) return;

    const mevcutPersonel = personelListesi[personelIndex];
    
    // Admin ve normal personel için ortak güncellenebilir alanlar
    const guncelBilgiler = {
        ...mevcutPersonel,
        ad: document.getElementById('duzenleAd').value,
        soyad: document.getElementById('duzenleSoyad').value,
        tcNo: document.getElementById('duzenleTc').value,
        telefon: document.getElementById('duzenleTelefon').value,
        iseGirisTarihi: document.getElementById('duzenleIseGirisTarihi').value,
        gorev: document.getElementById('duzenleGorev').value
    };

    personelListesi[personelIndex] = guncelBilgiler;

    try {
        await verileriKaydet();
        personelDuzenleModal.style.display = "none";
        personelTablosunuGuncelle();
        personelListesiniGuncelle();
        alert('Personel bilgileri başarıyla güncellendi!');
    } catch (error) {
        alert('Personel güncelleme başarısız oldu!');
        console.error(error);
    }
});

async function personelSil(id) {
    const session = SessionManager.getUserSession();
    const silinecekPersonel = personelListesi.find(p => p.id === id);
    const varsayilanAdmin = session && session.adminKullanici === 'admin';
    
    // Admin silme kontrolü
    if (silinecekPersonel.isAdmin) {
        if (!varsayilanAdmin) {
            alert('Admin kullanıcılarını sadece varsayılan admin silebilir!');
            return;
        }
        if (silinecekPersonel.kullaniciAdi === 'admin') {
            alert('Varsayılan admin kullanıcısı silinemez!');
            return;
        }
    }

    if (!confirm(`${silinecekPersonel.ad} ${silinecekPersonel.soyad} isimli ${silinecekPersonel.isAdmin ? 'admin' : 'personel'}i silmek istediğinizden emin misiniz?`)) {
        return;
    }

    personelListesi = personelListesi.filter(p => p.id !== id);
    mesaiKayitlari = mesaiKayitlari.filter(m => m.personelId !== id);
    
    try {
        await verileriKaydet();
        personelTablosunuGuncelle();
        personelListesiniGuncelle();
        listeyiGuncelle();
        alert('Silme işlemi başarılı!');
    } catch (error) {
        alert('Silme işlemi başarısız!');
        console.error('Silme hatası:', error);
    }
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
    
    // Varsayılan admin hariç personelleri filtrele
    const filtrelenmisListe = personelListesi.filter(personel => {
        // isDefaultAdmin veya isHidden özelliği olan personeli gösterme
        return !personel.isDefaultAdmin && !personel.isHidden;
    });
    
    filtrelenmisListe.forEach(personel => {
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
    
    // Seçili personeller listesini temizle
    document.getElementById('seciliPersoneller').innerHTML = '';
    
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
    const tarih = document.getElementById('tarih').value;
    const gun = new Date(tarih).getDay(); // 0 = Pazar, 6 = Cumartesi
    
    const bas = new Date(`2000-01-01T${baslangic}`);
    const bit = new Date(`2000-01-01T${bitis}`);
    
    let toplamSaat = 0;
    
    if (gun === 0) { // Pazar günü
        // Tüm saatler mesai sayılır
        toplamSaat = (bit - bas) / (1000 * 60 * 60);
    } 
    else if (gun === 6) { // Cumartesi günü
        const mesaiBaslangic = new Date(`2000-01-01T13:00`);
        
        if (bit > mesaiBaslangic) {
            // 13:00'den sonraki süreyi mesai olarak hesapla
            const mesaiBaslangicZamani = Math.max(bas, mesaiBaslangic);
            toplamSaat = (bit - mesaiBaslangicZamani) / (1000 * 60 * 60);
        }
    } 
    else { // Hafta içi günler
        const mesaiBitis = new Date(`2000-01-01T18:00`);
        
        if (bit > mesaiBitis) {
            // 18:00'den sonraki süreyi mesai olarak hesapla
            toplamSaat = (bit - mesaiBitis) / (1000 * 60 * 60);
        }
    }
    
    return toplamSaat.toFixed(2);
}

// Bugünün tarihini ayarlama fonksiyonu
function bugunTarihAyarla() {
    const bugun = new Date();
    // Tarih formatını YYYY-MM-DD şeklinde ayarla
    const formatliTarih = bugun.toISOString().split('T')[0];
    document.getElementById('tarih').value = formatliTarih;
}

// Tarih formatı için yardımcı fonksiyon
function formatTarih(tarih) {
    const [yil, ay, gun] = tarih.split('-');
    const aylar = [
        'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
        'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];
    
    const gunler = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    const tarihObj = new Date(yil, ay - 1, gun);
    const gunAdi = gunler[tarihObj.getDay()];
    
    return `${gun} ${aylar[parseInt(ay) - 1]} ${yil} ${gunAdi}`;
}

// Saat formatı için yardımcı fonksiyon
function formatSaat(saat) {
    const saatNumara = parseFloat(saat);
    if (saatNumara === 0) return "Normal Çalışma Saati";
    
    // Ondalık kısmı kontrol et
    const tamSayi = Math.floor(saatNumara);
    const ondalik = saatNumara - tamSayi;
    
    // Eğer ondalık kısım 0 ise sadece tam sayıyı göster
    if (ondalik === 0) {
        return `${tamSayi} saat`;
    }
    
    // Ondalıklı sayıyı formatla (.00 kısmını temizle)
    const formatliSayi = saatNumara.toString().replace(/\.?0+$/, '');
    return `${formatliSayi} saat`;
}

function hesaplaFazlaMesai(saat, gun) {
    const saatNumara = parseFloat(saat);
    if (saatNumara === 0) return 0;
    
    // Pazar günü ise 2 ile çarp, diğer günler 1.5 ile çarp
    const carpan = gun === 0 ? 2 : 1.5;
    // Math.round kaldırıldı, ondalıklı sayılar korunuyor
    return saatNumara * carpan;
}

function formatFazlaMesai(saat) {
    if (saat === 0) return "Fazla Mesai Yok";
    
    // Saat formatını düzenle
    const saatNumara = parseFloat(saat);
    const tamSayi = Math.floor(saatNumara);
    const ondalik = saatNumara - tamSayi;
    
    if (ondalik === 0) {
        return `${tamSayi} saat`;
    }
    
    // Ondalıklı sayıyı formatla (.00 kısmını temizle)
    const formatliSayi = saatNumara.toString().replace(/\.?0+$/, '');
    return `${formatliSayi} saat`;
}

function listeyiGuncelle() {
    const liste = document.getElementById('mesaiListesi');
    liste.innerHTML = '';
    const isAdmin = SessionManager.isAdmin(); // localStorage yerine SessionManager kullan
    
    const grupluKayitlar = {};
    mesaiKayitlari.forEach(kayit => {
        if (!grupluKayitlar[kayit.personelId]) {
            grupluKayitlar[kayit.personelId] = [];
        }
        grupluKayitlar[kayit.personelId].push(kayit);
    });

    Object.values(grupluKayitlar).forEach(personelKayitlari => {
        if (personelKayitlari.length === 0) return;

        const personel = personelKayitlari[0];
        
        const baslikSatir = document.createElement('tr');
        baslikSatir.className = 'personel-baslik';
        baslikSatir.innerHTML = `
            <td colspan="5">
                ${personel.personel} - ${personel.gorev}
            </td>
        `;
        liste.appendChild(baslikSatir);

        personelKayitlari
            .sort((a, b) => new Date(a.tarih) - new Date(b.tarih))
            .forEach(kayit => {
                const satir = document.createElement('tr');
                const mesaiSaati = parseFloat(kayit.toplamSaat);
                const tarihObj = new Date(kayit.tarih);
                const gun = tarihObj.getDay();
                const fazlaMesai = hesaplaFazlaMesai(mesaiSaati, gun);
                
                const mesaiDurumu = mesaiSaati > 0 ? 
                    `<span style="color: #e74c3c;">${formatSaat(mesaiSaati)}</span>` : 
                    '<span style="color: #2ecc71;">Normal Çalışma</span>';
                
                const fazlaMesaiDurumu = fazlaMesai > 0 ?
                    `<span style="color: #e74c3c;">${formatFazlaMesai(fazlaMesai)}</span>` :
                    '<span style="color: #2ecc71;">Fazla Mesai Yok</span>';
                
                const silButonuHTML = isAdmin ? 
                    `<button onclick="kayitSil(${kayit.id}, '${kayit.tarih}')" class="sil-btn">Sil</button>` : 
                    '';
                    
                satir.innerHTML = `
                    <td>${formatTarih(kayit.tarih)}</td>
                    <td>${kayit.baslangic} - ${kayit.bitis}</td>
                    <td>${mesaiDurumu}</td>
                    <td>${fazlaMesaiDurumu}</td>
                    <td>${silButonuHTML}</td>
                `;
                liste.appendChild(satir);
            });
    });
}

// Sayfa başında giriş kontrolü
document.addEventListener('DOMContentLoaded', async function() {
    // SessionManager kontrolü
    if (!window.SessionManager) {
        console.error('SessionManager yüklenemedi!');
        alert('Oturum yönetimi başlatılamadı. Lütfen sayfayı yenileyin.');
        return;
    }

    const session = SessionManager.getUserSession();
    if (!session) {
        window.location.href = 'login.html';
        return;
    }

    const isAdmin = SessionManager.isAdmin();
    const personelId = SessionManager.getPersonelId();

    await verileriYukle();

    // Admin ve personel görünümü kontrollerini ayarla
    if (isAdmin) {
        document.getElementById('adminControls').style.display = 'flex';
        document.getElementById('mesaiGirisPanel').style.display = 'block';
    } else {
        document.getElementById('adminControls').style.display = 'none';
        document.getElementById('mesaiGirisPanel').style.display = 'none';
        
        // Personel görünümü için kayıtları filtrele
        mesaiKayitlari = mesaiKayitlari.filter(kayit => 
            kayit.personelId === parseInt(personelId)
        );
    }

    // Kullanıcı bilgisi güncelleme
    const data = await DataManager.loadData();
    let userInfo = '';
    
    if (isAdmin) {
        const admin = data.personelListesi.find(p => 
            p.kullaniciAdi === localStorage.getItem('adminKullanici')
        );
        userInfo = `Admin: ${admin.ad} ${admin.soyad}`;
    } else {
        const personel = data.personelListesi.find(p => 
            p.id === parseInt(personelId)
        );
        if (personel) {
            userInfo = `Personel: ${personel.ad} ${personel.soyad}`;
        }
    }
    
    document.getElementById('userInfo').textContent = userInfo;

    // Tarih alanlarını varsayılan değerlere ayarla
    document.getElementById('baslangicSaati').value = "08:00";
    document.getElementById('bitisSaati').value = "18:00";
    bugunTarihAyarla(); // Bugünün tarihini ayarla

    // Başlangıç ve bitiş tarihlerini ayarla
    const bugun = new Date();
    const ayBaslangic = new Date(bugun.getFullYear(), bugun.getMonth(), 1);
    const aySonu = new Date(bugun.getFullYear(), bugun.getMonth() + 1, 0);
    
    document.getElementById('baslangicTarihi').value = ayBaslangic.toISOString().split('T')[0];
    document.getElementById('bitisTarihi').value = aySonu.toISOString().split('T')[0];

    // Varsayılan ay değerini ayarla
    const varsayilanAy = `${bugun.getFullYear()}-${String(bugun.getMonth() + 1).padStart(2, '0')}`;
    document.getElementById('aySecim').value = varsayilanAy;

    // Listeyi güncelle
    listeyiGuncelle();
    
    // Admin değilse sil butonlarını gizle
    if (!isAdmin) {
        document.querySelectorAll('.sil-btn').forEach(btn => btn.style.display = 'none');
    }
});

// Çıkış yapma fonksiyonunu güncelle ve tek bir yerde tanımla
function cikisYap() {
    try {
        SessionManager.clearSession();
        window.location.replace('login.html');
    } catch (error) {
        console.error('Çıkış yapma hatası:', error);
        alert('Çıkış yapılırken bir hata oluştu. Sayfayı yenileyin.');
    }
}

// Görünüm değiştirme işlemleri
document.getElementById('gunlukGoruntule').addEventListener('click', function() {
    document.getElementById('gunlukListe').style.display = 'block';
    document.getElementById('aylikOzet').style.display = 'none';
    this.classList.add('active');
    document.getElementById('aylikGoruntule').classList.remove('active');
    tarihFiltrele(); // Günlük görünüme geçerken filtreyi uygula
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
        .forEach(kayit => {
            if (!personelMesaileri[kayit.personelId]) {
                personelMesaileri[kayit.personelId] = {
                    personel: kayit.personel,
                    gorev: kayit.gorev,
                    toplamSaat: 0,
                    toplamZamliSaat: 0,
                    kayitlar: []
                };
            }
            const mesaiSaat = parseFloat(kayit.toplamSaat);
            const tarihObj = new Date(kayit.tarih);
            const gun = tarihObj.getDay();
            const zamliSaat = hesaplaFazlaMesai(mesaiSaat, gun);
            
            personelMesaileri[kayit.personelId].toplamSaat += mesaiSaat;
            personelMesaileri[kayit.personelId].toplamZamliSaat += zamliSaat;
            personelMesaileri[kayit.personelId].kayitlar.push({
                ...kayit,
                zamliSaat
            });
        });

    // Her personel için özet satır oluştur
    Object.values(personelMesaileri).forEach(ozet => {
        const satir = document.createElement('tr');
        const kayitDetaylari = `
            <div class="personel-ozet-baslik">
                <div class="personel-ozet-bilgi">
                    <div class="personel-ozet-sol">
                        <div class="personel-isim">${ozet.personel}</div>
                        <div class="personel-gorev">${ozet.gorev}</div>
                    </div>
                    <div class="personel-ozet-sag">
                        <div>Toplam Normal Mesai: ${formatSaat(ozet.toplamSaat)}</div>
                        <div>Toplam Zamlı Mesai: ${formatFazlaMesai(ozet.toplamZamliSaat)}</div>
                    </div>
                </div>
            </div>
            <div class="mesai-detay" style="display: none;">
                ${ozet.kayitlar
                    .sort((a, b) => new Date(a.tarih) - new Date(b.tarih))
                    .map(k => `
                        <div class="mesai-detay-item">
                            <div class="mesai-detay-tarih">
                                ${formatTarih(k.tarih)} (${k.baslangic} - ${k.bitis})
                            </div>
                            <div class="mesai-detay-saat">
                                <span>Normal: ${formatSaat(k.toplamSaat)}</span>
                                <span>Zamlı: ${formatFazlaMesai(k.zamliSaat)}</span>
                            </div>
                        </div>
                    `).join('')}
            </div>
        `;

        satir.innerHTML = `
            <td colspan="4">
                <div class="personel-ozet-container">
                    ${kayitDetaylari}
                    <button onclick="detayGoster(this)" class="detay-btn">
                        Detayları Göster
                    </button>
                </div>
            </td>
        `;
        liste.appendChild(satir);
    });
}

function detayGoster(btn) {
    // En yakın personel-ozet-container'ı bul
    const container = btn.closest('.personel-ozet-container');
    // Container içindeki mesai-detay elementini bul
    const detayDiv = container.querySelector('.mesai-detay');
    
    if (detayDiv.style.display === 'none') {
        detayDiv.style.display = 'block';
        btn.textContent = 'Detayları Gizle';
    } else {
        detayDiv.style.display = 'none';
        btn.textContent = 'Detayları Göster';
    }
}

// Admin Yönetim Modal İşlemleri
function adminYonetimModal() {
    const adminModal = document.getElementById('adminYonetimModal');
    adminModal.style.display = "block";
    
    // Tüm tab içeriklerini gizle
    document.querySelectorAll('.admin-tab-content').forEach(content => {
        content.style.display = 'none';
    });

    // Tüm tab butonlarından active sınıfını kaldır
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Personel Yönetimi tabını ve içeriğini aktif yap
    document.querySelector('[onclick="adminTabDegistir(\'personelYonetim\')"]').classList.add('active');
    document.getElementById('personelYonetimForm').style.display = 'block';
}

function adminTabDegistir(tab) {
    document.querySelectorAll('.admin-tab-content').forEach(content => {
        content.style.display = 'none';
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.getElementById(tab + 'Form').style.display = 'block';
    event.currentTarget.classList.add('active');
}

// Yeni Admin Ekleme
document.getElementById('yeniAdminKayit').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const yeniAdmin = {
        id: Date.now(),
        ad: document.getElementById('adminAd').value,
        soyad: document.getElementById('adminSoyad').value,
        tcNo: "Admin",
        telefon: "Admin",
        iseGirisTarihi: new Date().toISOString().split('T')[0],
        gorev: "Admin",
        kullaniciAdi: document.getElementById('adminKullaniciAdi').value,
        sifre: document.getElementById('adminSifre').value,
        isAdmin: true
    };

    try {
        // Admin kullanıcı adı kontrolü
        const mevcutKullanici = personelListesi.find(p => 
            p.isAdmin && p.kullaniciAdi === yeniAdmin.kullaniciAdi
        );

        if (mevcutKullanici) {
            alert('Bu kullanıcı adı zaten kullanılıyor!');
            return;
        }

        // Yeni admini personel listesine ekle
        personelListesi.push(yeniAdmin);
        await verileriKaydet();

        alert(`Admin kullanıcı başarıyla oluşturuldu!\nKullanıcı Adı: ${yeniAdmin.kullaniciAdi}`);
        this.reset();
        document.getElementById('adminYonetimModal').style.display = "none";
        personelTablosunuGuncelle();
    } catch (error) {
        alert('Admin oluşturma hatası!');
        console.error(error);
    }
});

// Şifre Değiştirme
document.getElementById('sifreDegistir').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const mevcutSifre = document.getElementById('mevcutSifre').value;
    const yeniSifre = document.getElementById('yeniSifre').value;
    const yeniSifreTekrar = document.getElementById('yeniSifreTekrar').value;

    if (yeniSifre !== yeniSifreTekrar) {
        alert('Yeni şifreler eşleşmiyor!');
        return;
    }

    const adminKullanici = personelListesi.find(p => 
        p.isAdmin && 
        p.kullaniciAdi === localStorage.getItem('adminKullanici')
    );

    if (!adminKullanici || adminKullanici.sifre !== mevcutSifre) {
        alert('Mevcut şifre hatalı!');
        return;
    }

    // Şifreyi güncelle
    adminKullanici.sifre = yeniSifre;
    
    try {
        await verileriKaydet();
        alert('Şifreniz başarıyla değiştirildi!');
        this.reset();
        document.getElementById('adminYonetimModal').style.display = "none";
    } catch (error) {
        alert('Şifre değiştirme işlemi başarısız oldu!');
        console.error(error);
    }
});

// Kullanıcı Adı Değiştirme
document.getElementById('kullaniciAdiDegistir').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const sifre = document.getElementById('kullaniciAdiIcinSifre').value;
    const yeniKullaniciAdi = document.getElementById('yeniKullaniciAdi').value;
    
    try {
        const session = SessionManager.getUserSession();
        const mevcutPersonel = personelListesi.find(p => 
            p.isAdmin && p.kullaniciAdi === session.adminKullanici
        );

        // Şifre kontrolü
        if (!mevcutPersonel || mevcutPersonel.sifre !== sifre) {
            alert('Mevcut şifre hatalı!');
            return;
        }

        // Yeni kullanıcı adı kontrolü
        const kullaniciAdiKullanimda = personelListesi.find(p => 
            p.id !== mevcutPersonel.id && 
            p.kullaniciAdi === yeniKullaniciAdi
        );

        if (kullaniciAdiKullanimda) {
            alert('Bu kullanıcı adı başka bir admin tarafından kullanılıyor!');
            return;
        }

        // Kullanıcı adını güncelle
        mevcutPersonel.kullaniciAdi = yeniKullaniciAdi;
        
        // Session'ı güncelle
        SessionManager.setUserSession({
            ...session,
            adminKullanici: yeniKullaniciAdi
        });

        await verileriKaydet();
        alert('Kullanıcı adınız başarıyla değiştirildi!');
        this.reset();
        document.getElementById('adminYonetimModal').style.display = "none";
        
    } catch (error) {
        alert('Kullanıcı adı değiştirme işlemi başarısız oldu!');
        console.error(error);
    }
});

// Login işlemini güncelle
async function adminGiris(kullaniciAdi, sifre) {
    const data = await DataManager.loadData();
    const admin = data.adminKullanicilar.find(
        a => a.kullaniciAdi === kullaniciAdi && a.sifre === sifre
    );

    if (admin) {
        localStorage.setItem('isAdmin', 'true');
        localStorage.setItem('adminKullanici', admin.kullaniciAdi);
        return true;
    }
    return false;
}

async function kayitSil(id, tarih) {
    if (!confirm(`${tarih} tarihli mesai kaydını silmek istediğinizden emin misiniz?`)) {
        return;
    }

    // Mesai kaydını listeden kaldır
    mesaiKayitlari = mesaiKayitlari.filter(kayit => kayit.id !== id);

    try {
        await verileriKaydet();
        listeyiGuncelle(); // Listeyi güncelle
    } catch (error) {
        alert('Mesai kaydı silinemedi!');
        console.error('Silme hatası:', error);
    }
}

// Tarih filtreleme fonksiyonu
function tarihFiltrele() {
    const baslangic = new Date(document.getElementById('baslangicTarihi').value);
    const bitis = new Date(document.getElementById('bitisTarihi').value);
    const isAdmin = localStorage.getItem('isAdmin') === 'true'; // isAdmin değerini burada tanımla
    
    // Tarih kontrolü
    if (baslangic > bitis) {
        alert('Başlangıç tarihi bitiş tarihinden sonra olamaz!');
        return;
    }

    const liste = document.getElementById('mesaiListesi');
    liste.innerHTML = '';
    
    const grupluKayitlar = {};
    
    // Tarihe göre filtrele
    mesaiKayitlari
        .filter(kayit => {
            const kayitTarihi = new Date(kayit.tarih);
            return kayitTarihi >= baslangic && kayitTarihi <= bitis;
        })
        .forEach(kayit => {
            if (!grupluKayitlar[kayit.personelId]) {
                grupluKayitlar[kayit.personelId] = [];
            }
            grupluKayitlar[kayit.personelId].push(kayit);
        });

    // Personel gruplarını listele
    Object.values(grupluKayitlar).forEach(personelKayitlari => {
        if (personelKayitlari.length === 0) return;

        const personel = personelKayitlari[0];
        
        const baslikSatir = document.createElement('tr');
        baslikSatir.className = 'personel-baslik';
        baslikSatir.innerHTML = `
            <td colspan="5">
                ${personel.personel} - ${personel.gorev}
            </td>
        `;
        liste.appendChild(baslikSatir);

        personelKayitlari
            .sort((a, b) => new Date(a.tarih) - new Date(b.tarih))
            .forEach(kayit => {
                const satir = document.createElement('tr');
                const mesaiSaati = parseFloat(kayit.toplamSaat);
                const tarihObj = new Date(kayit.tarih);
                const gun = tarihObj.getDay();
                const fazlaMesai = hesaplaFazlaMesai(mesaiSaati, gun);
                
                const mesaiDurumu = mesaiSaati > 0 ? 
                    `<span style="color: #e74c3c;">${formatSaat(mesaiSaati)}</span>` : 
                    '<span style="color: #2ecc71;">Normal Çalışma</span>';
                
                const fazlaMesaiDurumu = fazlaMesai > 0 ?
                    `<span style="color: #e74c3c;">${formatFazlaMesai(fazlaMesai)}</span>` :
                    '<span style="color: #2ecc71;">Fazla Mesai Yok</span>';
                
                const silButonuHTML = isAdmin ? 
                    `<button onclick="kayitSil(${kayit.id}, '${kayit.tarih}')" class="sil-btn">Sil</button>` : 
                    '';
                    
                satir.innerHTML = `
                    <td>${formatTarih(kayit.tarih)}</td>
                    <td>${kayit.baslangic} - ${kayit.bitis}</td>
                    <td>${mesaiDurumu}</td>
                    <td>${fazlaMesaiDurumu}</td>
                    <td>${silButonuHTML}</td>
                `;
                liste.appendChild(satir);
            });
    });
}

// Görünüm değiştirme işlemlerini güncelle
document.getElementById('gunlukGoruntule').addEventListener('click', function() {
    document.getElementById('gunlukListe').style.display = 'block';
    document.getElementById('aylikOzet').style.display = 'none';
    this.classList.add('active');
    document.getElementById('aylikGoruntule').classList.remove('active');
    tarihFiltrele(); // Görünüm değiştiğinde filtreyi uygula
});

// Tarih inputları değiştiğinde otomatik filtrele
document.getElementById('baslangicTarihi').addEventListener('change', tarihFiltrele);
document.getElementById('bitisTarihi').addEventListener('change', tarihFiltrele);

// Yönetim paneli fonksiyonları
function yeniPersonelModalAc() {
    document.getElementById('adminYonetimModal').style.display = 'none';
    document.getElementById('personelModal').style.display = 'block';
}

function personelListesiGoster() {
    document.getElementById('adminYonetimModal').style.display = 'none';
    document.getElementById('personelListeModal').style.display = 'block';
    personelTablosunuGuncelle();
}

function yeniAdminEkleFormGoster() {
    document.getElementById('yeniAdminForm').style.display = 'block';
    document.getElementById('adminListesiTablo').style.display = 'none';
}

function adminListesiGoster() {
    document.getElementById('yeniAdminForm').style.display = 'none';
    document.getElementById('adminListesiTablo').style.display = 'block';
    adminTablosunuGuncelle();
}

function adminTablosunuGuncelle() {
    const liste = document.getElementById('adminListesi');
    liste.innerHTML = '';
    const session = SessionManager.getUserSession();
    
    // Admin listesini filtrele
    const adminler = personelListesi.filter(p => {
        if (p.isHidden) return false;
        if (session.adminKullanici !== 'admin' && p.isDefaultAdmin) return false;
        return p.isAdmin;
    });
    
    adminler.forEach(admin => {
        const satir = document.createElement('tr');
        const silButonuGoster = session.adminKullanici === 'admin' && !admin.isDefaultAdmin;
        
        satir.innerHTML = `
            <td>${admin.ad} ${admin.soyad}</td>
            <td>${admin.kullaniciAdi}</td>
            <td>
                ${silButonuGoster ? 
                    `<button onclick="adminSil(${admin.id})" class="sil-btn">Sil</button>` : 
                    ''}
            </td>
        `;
        liste.appendChild(satir);
    });
}

async function adminSil(id) {
    const admin = personelListesi.find(p => p.id === id);
    
    if (!confirm(`${admin.ad} ${admin.soyad} isimli admin kullanıcısını silmek istediğinizden emin misiniz?`)) {
        return;
    }

    personelListesi = personelListesi.filter(p => p.id !== id);
    
    try {
        await verileriKaydet();
        adminTablosunuGuncelle();
        alert('Admin kullanıcısı başarıyla silindi!');
    } catch (error) {
        alert('Silme işlemi başarısız!');
        console.error('Silme hatası:', error);
    }
}

// Personel modalından Admin paneline geri dönüş fonksiyonu
function geriDonPersonelModal() {
    document.getElementById('personelModal').style.display = 'none';
    document.getElementById('adminYonetimModal').style.display = 'block';
    
    // Form içeriğini temizle
    document.getElementById('personelForm').reset();
}

// Geri dönüş fonksiyonlarını ekle
function geriDonPersonelListe() {
    document.getElementById('personelListeModal').style.display = 'none';
    document.getElementById('adminYonetimModal').style.display = 'block';
}

function geriDonPersonelDuzenle() {
    document.getElementById('personelDuzenleModal').style.display = 'none';
    document.getElementById('personelListeModal').style.display = 'block';
    document.getElementById('personelDuzenleForm').reset();
}
