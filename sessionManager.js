window.SessionManager = {
    setUserSession(data) {
        try {
            localStorage.setItem('userSession', JSON.stringify(data));
        } catch (error) {
            console.error('Session kaydetme hatası:', error);
        }
    },

    getUserSession() {
        try {
            const session = localStorage.getItem('userSession');
            return session ? JSON.parse(session) : null;
        } catch (error) {
            console.error('Session okuma hatası:', error);
            return null;
        }
    },

    clearSession() {
        try {
            localStorage.removeItem('userSession');
        } catch (error) {
            console.error('Session silme hatası:', error);
        }
    },

    isAdmin() {
        const session = this.getUserSession();
        return session && session.isAdmin === true;
    },

    getPersonelId() {
        const session = this.getUserSession();
        return session ? session.personelId : null;
    }
};
