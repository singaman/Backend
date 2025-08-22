module.exports = {
  accessTokenSecret: process.env.JWT_SECRET,
  refreshTokenSecret: process.env.JWT_REFRESH_SECRET,
  accessTokenExpiresIn: '15m',
  refreshTokenExpiresIn: '7d'
};
