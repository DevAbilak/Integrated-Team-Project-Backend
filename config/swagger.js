const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Tour Ethiopia API",
      version: "1.0.0",
      description: "API documentation for Tour Ethiopia Backend",
    },
    servers: [
      {
        url: "https://api-tour-ethiopia.onrender.com",
        description: "deployed backend server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            _id: { type: "string", example: "60d5f9f8b8e5a72d4c8e4e3a" },
            name: { type: "string", example: "John Doe" },
            email: { type: "string", example: "john@example.com" },
            role: { type: "string", enum: ["traveler", "operator", "admin"] },
            pointsBalance: { type: "number", example: 0 },
            verified: { type: "boolean", example: false },
            operatorDetails: {
              type: "object",
              properties: {
                businessName: { type: "string" },
                licenseNumber: { type: "string" },
                verified: { type: "boolean" },
              },
            },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        UserResponse: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            message: { type: "string" },
            data: { $ref: "#/components/schemas/User" },
          },
        },
        UsersListResponse: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            message: { type: "string" },
            data: {
              type: "object",
              properties: {
                users: {
                  type: "array",
                  items: { $ref: "#/components/schemas/User" },
                },
                total: { type: "number" },
                page: { type: "number" },
                limit: { type: "number" },
                totalPages: { type: "number" },
              },
            },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string" },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./routes/*.js"], // Path to files with Swagger annotations
};

module.exports = swaggerJsdoc(options);
