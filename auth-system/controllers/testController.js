// Simple test controller for smoke testing the API
module.exports = {
  // GET /api/test/ - basic ping
  health(req, res) {
    res.json({ ok: true, message: 'Test endpoint is working' });
  },

  // POST /api/test/echo - echoes back received JSON
  echo(req, res) {
    res.json({ ok: true, received: req.body });
  },

  // GET /api/test/env - safe environment info (no secrets)
  env(req, res) {
    res.json({
      ok: true,
      environment: process.env.NODE_ENV || 'development',
      dbName: process.env.DB_NAME || null
    });
  }
};
