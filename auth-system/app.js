require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
const mysql = require('mysql2/promise');

// Import configurations
const { sequelize } = require('./models');
const redisClient = require('./config/redis');
const routes = require('./routes');
const { errorHandler, notFound } = require('./utils/errorHandler');

// Initialize Express app
const app = express();

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api', routes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Test database connection
      // Ensure database exists (create if missing) before Sequelize connects
      const dbName = process.env.DB_NAME || 'auth_db';
      const dbUser = process.env.DB_USER || 'root';
      const dbPass = process.env.DB_PASS || '';
      const dbHost = process.env.DB_HOST || 'localhost';
      const dbPort = process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306;

      try {
        const adminConn = await mysql.createConnection({
          host: dbHost,
          port: dbPort,
          user: dbUser,
          password: dbPass,
          // do not specify database here so we can create it if missing
        });
        await adminConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
        await adminConn.end();
        console.log(`✅ Ensured database '${dbName}' exists`);
      } catch (dbCreateErr) {
        console.warn('⚠️ Could not create/ensure database exists. Proceeding; Sequelize may still fail:', dbCreateErr.message || dbCreateErr);
      }

      // Test database connection
      await sequelize.authenticate();
      console.log('✅ Database connected successfully');

    // Sync database models
    await sequelize.sync({ alter: true });
    console.log('✅ Database models synchronized');

    // Test Redis connection
    await redisClient.ping();
    console.log('✅ Redis connected successfully');

    // Start server with error handling for port in use
    const PORT = process.env.PORT || 3000;
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV}`);
    });

    server.on('error', (err) => {
      if (err && err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use. Kill the process using the port or set a different PORT in your .env and restart.`);
      } else {
        console.error('❌ Server error:', err);
      }
      process.exit(1);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
