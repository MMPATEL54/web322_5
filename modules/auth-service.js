const mongoose = require('mongoose');
require('dotenv').config();

let User;

const userSchema = new mongoose.Schema({
    userName: { type: String, unique: true },
    password: String,
    email: String,
    loginHistory: [{ dateTime: Date, userAgent: String }]
});

module.exports.initialize = () => {
    return new Promise((resolve, reject) => {
        const db = mongoose.createConnection(process.env.MONGODB);
        db.on('error', (err) => reject(err));
        db.once('open', () => {
            User = db.model('users', userSchema);
            resolve();
        });
    });
};

module.exports.registerUser = (userData) => {
    return new Promise((resolve, reject) => {
        if (userData.password !== userData.password2) {
            reject('Passwords do not match');
        } else {
            const newUser = new User(userData);
            newUser.save()
                .then(() => resolve())
                .catch((err) => {
                    if (err.code === 11000) {
                        reject('User Name already taken');
                    } else {
                        reject(`There was an error creating the user: ${err}`);
                    }
                });
        }
    });
};

module.exports.checkUser = (userData) => {
    return new Promise((resolve, reject) => {
        User.findOne({ userName: userData.userName })
            .then((user) => {
                if (!user) {
                    reject(`Unable to find user: ${userData.userName}`);
                } else if (user.password !== userData.password) {
                    reject('Incorrect Password');
                } else {
                    user.loginHistory.push({
                        dateTime: new Date().toString(),
                        userAgent: userData.userAgent
                    });
                    user.save()
                        .then(() => resolve(user))
                        .catch((err) => reject(`There was an error verifying the user: ${err}`));
                }
            })
            .catch((err) => reject(`Unable to find user: ${err}`));
    });
};
