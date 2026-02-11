class DatabaseManager {
    constructor() {
        this.apiBaseUrl = 'http://localhost:3000/api';
        this.adatok = [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadAdatok();
    }

    bindEvents() {
        document.getElementById('mentesBtn').addEventListener('click', () => this.mentes());
        document.getElementById('frissitesBtn').addEventListener('click', () => this.frissites());
        document.getElementById('teljesAdatBtn').addEventListener('click', () => this.teljesAdat());
        document.getElementById('mintaAdatokBtn').addEventListener('click', () => this.mintaAdatokBetoltese());
    }

    async loadAdatok() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/adatok`);
            if (response.ok) {
                this.adatok = await response.json();
                this.renderAdatok();
            } else {
                console.error('Hiba az adatok betöltésekor');
                this.uzenet('Hiba az adatok betöltésekor!', 'error');
            }
        } catch (error) {
            console.error('Hálózati hiba:', error);
            this.uzenet('Nem sikerült csatlakozni a szerverhez!', 'error');
        }
    }

    async mentes() {
        const nev = document.getElementById('nev').value.trim();
        const email = document.getElementById('email').value.trim();
        const kor = document.getElementById('kor').value.trim();
        const szak = document.getElementById('szak').value.trim();

        if (!nev || !email || !kor || !szak) {
            this.uzenet('Kérjük, töltse ki az összes mezőt!', 'warning');
            return;
        }

        if (!this.validateEmail(email)) {
            this.uzenet('Kérjük, érvényes email címet adjon meg!', 'warning');
            return;
        }

        if (isNaN(kor) || kor < 1 || kor > 120) {
            this.uzenet('Kérjük, érvényes kort adjon meg (1-120)!', 'warning');
            return;
        }

        try {
            const response = await fetch(`${this.apiBaseUrl}/adatok`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ nev, email, kor, szak })
            });

            const result = await response.json();

            if (response.ok) {
                this.clearForm();
                this.loadAdatok();
                this.uzenet(result.message || 'Adat sikeresen mentve!', 'success');
            } else {
                this.uzenet(result.error || 'Hiba a mentéskor!', 'error');
            }
        } catch (error) {
            console.error('Hálózati hiba:', error);
            this.uzenet('Nem sikerült csatlakozni a szerverhez!', 'error');
        }
    }

    frissites() {
        this.loadAdatok();
        this.uzenet('Adatok frissítve!', 'info');
    }

    teljesAdat() {
        if (this.adatok.length === 0) {
            this.uzenet('Nincsenek mentett adatok!', 'warning');
            return;
        }

        let teljesAdatSzoveg = '=== MENTETT ADATOK (MySQL-ből) ===\n\n';
        this.adatok.forEach((adat, index) => {
            teljesAdatSzoveg += `${index + 1}. ID: ${adat.id}\n`;
            teljesAdatSzoveg += `   Név: ${adat.nev}\n`;
            teljesAdatSzoveg += `   Email: ${adat.email}\n`;
            teljesAdatSzoveg += `   Kor: ${adat.kor}\n`;
            teljesAdatSzoveg += `   Szak: ${adat.szak}\n`;
            teljesAdatSzoveg += `   Létrehozva: ${new Date(adat.letrehozva).toLocaleString('hu-HU')}\n\n`;
        });

        console.log(teljesAdatSzoveg);
        this.uzenet('Teljes adat kiírva a konzolra!', 'info');
    }

    async mintaAdatokBetoltese() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/minta-adatok`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const result = await response.json();

            if (response.ok) {
                this.loadAdatok();
                this.uzenet(result.message || 'Minta adatok betöltve!', 'success');
            } else {
                this.uzenet(result.error || 'Hiba a minta adatok betöltésekor!', 'error');
            }
        } catch (error) {
            console.error('Hálózati hiba:', error);
            this.uzenet('Nem sikerült csatlakozni a szerverhez!', 'error');
        }
    }

    async torles(id) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/adatok/${id}`, {
                method: 'DELETE'
            });

            const result = await response.json();

            if (response.ok) {
                this.loadAdatok();
                this.uzenet(result.message || 'Adat törölve!', 'success');
            } else {
                this.uzenet(result.error || 'Hiba a törléskor!', 'error');
            }
        } catch (error) {
            console.error('Hálózati hiba:', error);
            this.uzenet('Nem sikerült csatlakozni a szerverhez!', 'error');
        }
    }

    renderAdatok() {
        const adatokLista = document.getElementById('adatokLista');
        
        if (this.adatok.length === 0) {
            adatokLista.innerHTML = '<div class="empty-state">Nincsenek mentett adatok. Kérjük, adjon hozzá új adatokat!</div>';
            return;
        }

        adatokLista.innerHTML = this.adatok.map(adat => `
            <div class="data-item">
                <div class="data-info">
                    <h3>${adat.nev}</h3>
                    <p><strong>Email:</strong> ${adat.email}</p>
                    <p><strong>Kor:</strong> ${adat.kor} éves</p>
                    <p><strong>Szak:</strong> ${adat.szak}</p>
                    <p><strong>ID:</strong> ${adat.id}</p>
                </div>
                <button class="btn-delete" onclick="dbManager.torles(${adat.id})">Törlés</button>
            </div>
        `).join('');
    }

    clearForm() {
        document.getElementById('nev').value = '';
        document.getElementById('email').value = '';
        document.getElementById('kor').value = '';
        document.getElementById('szak').value = '';
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    uzenet(uzenet, tipus) {
        const uzenetDiv = document.createElement('div');
        uzenetDiv.className = `uzenet uzenet-${tipus}`;
        uzenetDiv.textContent = uzenet;
        uzenetDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: bold;
            z-index: 1000;
            max-width: 300px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            transition: opacity 0.3s;
        `;

        const szinek = {
            success: '#28a745',
            warning: '#ffc107',
            info: '#17a2b8',
            error: '#dc3545'
        };

        uzenetDiv.style.backgroundColor = szinek[tipus] || szinek.info;
        document.body.appendChild(uzenetDiv);

        setTimeout(() => {
            uzenetDiv.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(uzenetDiv);
            }, 300);
        }, 3000);
    }

    saveToLocalStorage() {
        // már nem használjuk localStorage-t, helyette MySQL adatbázis
    }

    loadFromLocalStorage() {
        // már nem használjuk localStorage-t, helyette MySQL adatbázis
    }
}

const dbManager = new DatabaseManager();

document.addEventListener('DOMContentLoaded', function() {
    console.log('Adatbázis kezelő alkalmazás betöltve!');
    console.log('Elérhető funkciók:');
    console.log('- Adatok mentése');
    console.log('- Adatok frissítése');
    console.log('- Teljes adat megjelenítése (konzolon)');
    console.log('- Minta adatok betöltése');
    console.log('- Adatok törlése');
});
