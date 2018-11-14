var localStorage = require('localStorage');
module.exports = {
    getFromStorage: function (key) {
        if (!key) {
            return null;
        }

        try {
            const valueStr = localStorage.getItem(key);
            if (valueStr) {
                return JSON.parse(valueStr);
            }
            return null;
        } catch (err) {
            return null;
        }
    },

    setInStorage: function (key, obj) {
        if (!key) {
            console.error('Error: Key is missing');
        }

        try {
            localStorage.setItem(key, JSON.stringify(obj));
        } catch (err) {
            console.error(err);
        }
    },

    removeStorage: function (key) {
        if (!key) {
            console.error('Error: Key is missing');
        }

        try {
            localStorage.removeItem(key);
        } catch (err) {
            console.error(err);
        }
    }
}