/********************************************************************************
* WEB322 – Assignment 04
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
*
* https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
*
* Name: Manan Manojkumar Patel Student ID: 141782227 Date:11/4/2024
*
* Published URL: 
*
********************************************************************************/
const projectData = require("./modules/projects");
const path = require("path");
const express = require('express');
const app = express();
const HTTP_PORT = process.env.PORT || 8080;

app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render("home", { page: '/' });
});

app.get('/about', (req, res) => {
  res.render("about", { page: '/about' });
});

app.get("/solutions/projects", async (req, res) => {
  try {
    if (req.query.sector) {
      let projects = await projectData.getProjectsBySector(req.query.sector);
      if (projects.length === 0) {
        res.status(404).render("404", { message: `No projects found for the sector: ${req.query.sector}` });
      } else {
        res.render("projects", { projects: projects });
      }
    } else {
      let projects = await projectData.getAllProjects();
      res.render("projects", { projects: projects });
    }
  } catch (err) {
    res.status(404).render("404", { message: "An error occurred." });
  }
});

app.get("/solutions/projects/:id", async (req, res) => {
  try {
    let project = await projectData.getProjectById(req.params.id);
    if (!project) {
      res.status(404).render("404", { message: `No project found with ID: ${req.params.id}` });
    } else {
      res.render("project", { project: project });
    }
  } catch (err) {
    res.status(404).render("404", { message: "An error occurred." });
  }
});

app.use((req, res) => {
  res.status(404).render("404", { message: "I'm sorry, we're unable to find what you're looking for" });
});


projectData.initialize().then(() => {
  app.listen(HTTP_PORT, () => { console.log(`Server listening on: ${HTTP_PORT}`); });
});
