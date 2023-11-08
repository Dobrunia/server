import jwt from 'jsonwebtoken';
import {config} from '../config.js';

const privateAccessKey = config.accessKey;
const privateRefreshKey = config.refreshKey;

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
