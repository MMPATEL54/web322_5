require('dotenv').config();
const Sequelize = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 8080,
      dialect: 'mysql'
  }
);

// Define the Sector model
const Sector = sequelize.define('Sector', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  sector_name: {
    type: Sequelize.STRING,
  },
}, {
  timestamps: false,
});

// Define the Project model
const Project = sequelize.define('Project', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: Sequelize.STRING,
  },
  feature_img_url: {
    type: Sequelize.STRING,
  },
  summary_short: {
    type: Sequelize.TEXT,
  },
  intro_short: {
    type: Sequelize.TEXT,
  },
  impact: {
    type: Sequelize.TEXT,
  },
  original_source_url: {
    type: Sequelize.STRING,
  },
  sector_id: {
    type: Sequelize.INTEGER,
    references: {
      model: Sector,
      key: 'id',
    },
  },
}, {
  timestamps: false,
});

// Define the association
Project.belongsTo(Sector, { foreignKey: 'sector_id' });

async function initialize() {
  try {
    await sequelize.sync();
    console.log("Database synchronized successfully.");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}

function getAllProjects() {
  return Project.findAll({
    include: [Sector],
  });
}

function getProjectById(projectId) {
  return Project.findOne({
    where: { id: projectId },
    include: [Sector],
  }).then(project => {
    if (!project) {
      throw new Error("Unable to find requested project");
    }
    return project;
  });
}

function getProjectsBySector(sector) {
  return Project.findAll({
    include: [{
      model: Sector,
      where: {
        sector_name: {
          [Sequelize.Op.iLike]: `%${sector}%`,
        },
      },
    }],
  }).then(projects => {
    if (projects.length === 0) {
      throw new Error("Unable to find requested projects");
    }
    return projects;
  });
}
// Test the connection
sequelize.authenticate()
    .then(() => console.log('Database connected.'))
    .catch((err) => console.error('Unable to connect to the database:', err));


module.exports = { initialize, getAllProjects, getProjectById, getProjectsBySector };