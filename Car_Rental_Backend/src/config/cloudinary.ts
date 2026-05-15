import { v2 as cloudinary } from 'cloudinary';
import { env } from './env';
import logger from './logger';

let cloudName  = env.cloudinaryCloudName;
let apiKey     = env.cloudinaryApiKey;
let apiSecret  = env.cloudinaryApiSecret;

if (env.cloudinaryUrl) {
  const m = env.cloudinaryUrl.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
  if (m) {
    apiKey    = m[1];
    apiSecret = m[2];
    cloudName = m[3];
  } else {
    logger.warn('Cloudinary: CLOUDINARY_URL is set but could not be parsed — falling back to individual vars');
  }
}

if (cloudName && apiKey && apiSecret) {
  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
  logger.info('Cloudinary: configured', { cloudName });
} else {
  logger.warn('Cloudinary: credentials missing — image uploads will be disabled');
}

export const isCloudinaryConfigured = (): boolean =>
  !!(cloudName && apiKey && apiSecret);


export const getCloudinaryPublicConfig = () => ({
  cloudName,
  apiKey,
});

/**
 * Signs an upload request server-side.
 * apiSecret stays in this file — never sent to the client.
 *
 * @param params - e.g. { timestamp: 1234567890, folder: 'cars' }
 * @returns HMAC-SHA256 hex signature string
 */
export const signUploadRequest = (params: Record<string, string | number>): string => {
  return cloudinary.utils.api_sign_request(params, apiSecret);
};

export default cloudinary;
