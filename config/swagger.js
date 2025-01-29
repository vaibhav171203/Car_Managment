const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Your API Documentation',
      version: '1.0.0',
      description: 'Documentation for your API endpoints',
    },
    servers: [
      {
        url: 'http://localhost:3000', // Replace with your server URL
        description: 'Local server',
      },
    ],
  },
  apis: ['./routes/*.js'], // Adjust this path to point to your route files
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = swaggerDocs;
