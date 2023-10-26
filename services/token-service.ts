import jwt from 'jsonwebtoken';

const privateAccessKey = 'Dobrunia';
const privateRefreshKey = 'Kostrigin';

export function generateJwtTokens(payload) {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
}

export function generateAccessToken(payload) {
  const accessToken = jwt.sign(payload, privateAccessKey, { expiresIn: '1m' });
  return accessToken;
}
export function generateRefreshToken(payload) {
  const refreshToken = jwt.sign(payload, privateRefreshKey, {
    expiresIn: '30d',
  });
  return refreshToken;
}

export function validateAccessToken(token) {
  return jwt.verify(token, privateAccessKey);
}

export function validateRefreshToken(token) {
  return jwt.verify(token, privateRefreshKey);
}
