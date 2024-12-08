/********************************************************************************
* WEB322 – Assignment 04
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
*
* https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
*
********************************************************************************/

const express = require('express');
const bodyParser = require('body-parser');
const clientSessions = require('client-sessions');
const projectData = require("./modules/projects");
const authData = require('./modules/auth-service');
const path = require("path");
require('dotenv').config();

console.log("Environment Variables:");
console.log("DB_NAME:", process.env.DB_NAME);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PASS:", process.env.DB_PASS);
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_PORT:", process.env.DB_PORT);
console.log("Current Directory:", __dirname);

const app = express();
const HTTP_PORT = process.env.PORT || 8080;

// Middleware setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(clientSessions({
    cookieName: 'session',
    secret: 'assignment6-secret',
    duration: 24 * 60 * 60 * 1000,
    activeDuration: 1000 * 60 * 5
}));

app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
});

app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// Routes
app.get('/', (req, res) => res.render("home", { page: '/' }));
app.get('/about', (req, res) => res.render("about", { page: '/about' }));

// Register routes
app.get('/register', (req, res) => {
    res.render('register', { errorMessage: "", successMessage: "", userName: "" });
});

app.post('/register', (req, res) => {
    authData.registerUser(req.body)
        .then(() => res.render('register', { errorMessage: "", successMessage: "User created", userName: "" }))
        .catch((err) => res.render('register', { errorMessage: err, successMessage: "", userName: req.body.userName }));
});

// Login routes
app.get('/login', (req, res) => {
    res.render('login', { errorMessage: "", userName: "" });
});

app.post('/login', (req, res) => {
    req.body.userAgent = req.get('User-Agent');
    authData.checkUser(req.body)
        .then((user) => {
            req.session.user = {
                userName: user.userName,
                email: user.email,
                loginHistory: user.loginHistory
            };
            res.redirect('/solutions/projects');
        })
        .catch((err) => res.render('login', { errorMessage: err, userName: req.body.userName }));
});

// Logout route
app.get('/logout', (req, res) => {
    req.session.reset();
    res.redirect('/');
});

// User History route
app.get('/userHistory', ensureLogin, (req, res) => {
    res.render('userHistory');
});

function ensureLogin(req, res, next) {
    if (!req.session.user) {
        res.redirect('/login');
    } else {
        next();
    }
}

// Projects routes
app.get("/solutions/projects", async (req, res) => {
    try {
        let projects = req.query.sector ? 
            await projectData.getProjectsBySector(req.query.sector) : 
            await projectData.getAllProjects();
        res.render("projects", { projects });
    } catch (err) {
        res.status(404).render("404", { message: "An error occurred." });
    }
});

// Server initialization with database connection
projectData.initialize()
    .then(authData.initialize)
    .then(() => {
        app.listen(HTTP_PORT, () => {
            console.log(`Server running on port ${HTTP_PORT}`);
        });
    })
    .catch((err) => console.error(`Unable to start the server: ${err}`));