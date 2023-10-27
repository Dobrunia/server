import jwt from 'jsonwebtoken';
import 'dotenv/config';

const privateAccessKey = process.env.TOKEN_PRIVATE_ACCESS_KEY;
const privateRefreshKey = process.env.TOKEN_PRIVATE_REFRESH_KEY;

export function generateJwtTokens(payload) {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
}

export function generateAccessToken(payload) {
  const accessToken = jwt.sign(payload, privateAccessKey, { expiresIn: '3h' });
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
