const projectData = require("../data/projectData");
const sectorData = require("../data/sectorData");

let projects = [];

function initialize() {
  return new Promise((resolve, reject) => {
    projectData.forEach(projectElement => {
      let projectWithSector = { ...projectElement, sector: sectorData.find(sectorElement => sectorElement.id == projectElement.sector_id).sector_name }
      projects.push(projectWithSector);
    });
    resolve();
  });
}

function getAllProjects() {
  return new Promise((resolve, reject) => {
    resolve(projects);
  });
}

function getProjectById(projectId) {

  return new Promise((resolve, reject) => {
    let foundProject = projects.find(p => p.id == projectId);

    console.log(foundProject);

    if (foundProject) {
      resolve(foundProject)
    } else {
      reject("Unable to find requested project");
    }

  });

}

function getProjectsBySector(sector) {

  return new Promise((resolve, reject) => {
    let foundProjects = projects.filter(p => p.sector.toUpperCase().includes(sector.toUpperCase()));

    if (foundProjects) {
      resolve(foundProjects)
    } else {
      reject("Unable to find requested projects");
    }
  });

}


module.exports = { initialize, getAllProjects, getProjectById, getProjectsBySector }
