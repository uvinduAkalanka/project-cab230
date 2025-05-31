const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const path = require('path');

let swaggerDocument;

try {
    const swaggerFile = fs.readFileSync(path.join(__dirname, '../openapi.json'), 'utf8');
    swaggerDocument = JSON.parse(swaggerFile);
} catch (error) {
    console.error('Error reading openapi.json:', error.message);
    // Fallback basic swagger document
    swaggerDocument = {
        openapi: '3.0.0',
        info: {
            title: 'Movie API',
            version: '1.0.0',
            description: 'CAB230 Assignment 3 - Movie API'
        },
        paths: {}
    };
}

const swaggerOptions = {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Movie API Documentation'
};

module.exports = {
    swaggerUi,
    swaggerDocument,
    swaggerOptions
};