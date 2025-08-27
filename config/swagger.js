const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Xposed API',
      version: '1.0.0',
      description: 'API documentation for the Xposed project',
    },
    servers: [
      {
        url: 'http://localhost:5400',
      },
    ],
  },
  apis: ['./routes/*.js'], // files containing annotations as above
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
