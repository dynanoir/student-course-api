const express = require('express');
const swaggerUi = require('swagger-ui-express');

const studentRoutes = require('./routes/students');
const courseRoutes = require('./routes/courses');

const swaggerFile = require('../swagger.json');
const app = express();
app.use(express.json());

const swaggerJSDoc = require('swagger-jsdoc');
const swaggerDefinition = require('../swaggerDef');

const options = {
  swaggerDefinition,
  apis: ['./src/controllers/*.js'],
};

// ⚠️ On garde swaggerSpec pour référence future mais on désactive le warning
// eslint-disable-next-line no-unused-vars
const swaggerSpec = swaggerJSDoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));

const storage = require('./services/storage');
storage.seed();

app.use('/students', studentRoutes);
app.use('/courses', courseRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

module.exports = app;
