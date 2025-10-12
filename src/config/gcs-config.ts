// Google Cloud Storage Configuration
import path from 'path';
import { app } from 'electron';

// Get the correct path to credentials file
// In development: from project root
// In production: from app resources
const getCredentialsPath = () => {
  // Check if we have a custom path in environment
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return process.env.GOOGLE_APPLICATION_CREDENTIALS;
  }

  if (process.env.NODE_ENV === 'development') {
    // Development: use path relative to project root
    return path.join(process.cwd(), 'credentials', 'gcs.json');
  } else {
    // Production: use path relative to app resources
    return path.join(app.getAppPath(), 'credentials', 'gcs.json');
  }
};

// Embedded credentials for packaged app
const getEmbeddedCredentials = () => {
  return {
    type: 'service_account',
    project_id: 'plabs-444812',
    private_key_id: '257e14560460ba793c5791d6825c17eeae849cc1',
    private_key: '-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCjndMWbthSSxPA\novK/9YfXCehBJyK97KVuEWvUr6v1ksd6cqQzb2JYdtmMwQFl70EQx0XYLwlhFeAi\nnG+b+oDmoaWNUYmNzC09DP/11HlDe+nsRuaVSuZ6suXd8LF30bqTHDUAwMFYWvYh\nzD88d1Dm0PNVm5wAtHWllmfkbQCmlIzUFK1u9gTDXR/IbYgUuDZgBHhQWqpUQC92\nbKEoQYtfsh8ck14G4U5ygYd0kHSv7d23bm6Wi/gNxarZe71Y64StU4Q7u4Ao6N+k\nnl3y2CUr2XFOhdE0sjyQ1A4OIJl53p+s3QGqEFAbGR87GmimRBp5UtNeNE+YZJcK\n3UVzFBa/AgMBAAECggEAUXKPUet74/tbqdlz3frr1DAqXcSNlt3mvBQQCaApieW3\nR00qUDByVHdVdKvfdk7TpPaN3kAL+zhYiuI07QCWijiNoPul7eBl5K5D/Kv4cY+N\nswDYaBkRAqNrqj/XGD5fEjxIZkeN993QCKMUF5WNwFjjyQndbrxmlDd7IEriuAkO\nIxbPmgtOkFWHGcNm5vd9HR7NVvKlwXlRrZnMaCALlDeDl5wTw4DkrtkMmdQ2DWrw\nR8c+Guu3Tf3dvLCVytmiXBUR4O9Yy51wb5q1l02etpAqfZcr5cQy9i1iCaK+FcpV\nAi8QK8bfZ4K7ED3FSESULL0YxqqznRIm8msr5iPgAQKBgQDhElKWe/8LRixLI+zq\nhcZgXm5BIXp4cIh61Azb1iJTXaSw3k5seJ41p2mxvzuTggsfYuRPJccng7i3fcf2\nbtZeD1FB8WbSYGMK4ckvGEN6HXUGerJmQLtZt2vAp5ozwW5RS5X+aMKvbAUj1C9O\nhXba07kNJnaCESLu1b/HdxylvwKBgQC6GZsFncFL4pq86zsuHNStCkgqdQ8tVlqF\nf4GXWo/PQ7EWvZTUrp4u5HjsCLEJF4ecaPIIkrdc9Jp7H1M1T2hJuhL5LBAtQgII\nYtLh3/RKmYMrUNzCfJBeD0Q0XFFamt40awnZvOqa69QOVka2JD1k7OdykhyDhHL3\npVeCno7PAQKBgGYY6q/q5aIWngcj79ffAUM78uXGqwixe6fEQ2UB+SY6B3hYD9ky\nygnqvI5uAjeCuUrukES7DWGGZieOfkPyuXmHl0PDnvH12VfZXmrnpcxiSnC6/exW\nluY2x0FohhHOQB3OnOcAXLg41wgOu7rx3h2cB4jIlt+fqGoROmLgTHV/AoGAOExa\nu144Ba7txM0cwBx0skxz/HQhPUPsaopiN9lru/XscsazaYvRyrnPYwhWFjwKCGUv\nIyzPT82nliupzmzRTcx+xOZxll9rogHTbgWEL7U1GzuBLUzll67ioTx0WAaVxiHD\nfx1Jk8hYBGZRSfS4pfmNIvnUqmy9IvHgAWHaLgECgYBPfzPPKjNdPqKJsF2C/lAJ\nEBAHgq+XUkG1KY9Jt6QsXPKlWot+m9zqrk0LfpzFrAZcJRzLw1lPwr2c6QcriCbT\nhFNiTnlmOiCPhkrSj87xTBUJT79AEbYBOBaoeDmpP9GG5kIPtChXdq0SdDvykanT\nZ1loiTfgM+OMxq0Q860e5A==\n-----END PRIVATE KEY-----\n',
    client_email: 'bucket@plabs-444812.iam.gserviceaccount.com',
    client_id: '107479741431624751976',
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: 'https://www.googleapis.com/robot/v1/metadata/x509/bucket%40plabs-444812.iam.gserviceaccount.com',
    universe_domain: 'googleapis.com'
  };
};

export const GCS_CONFIG = {
  projectId: 'plabs-444812',
  bucketName: 'general-plabs',
  keyFilename: getCredentialsPath(),
  credentials: getEmbeddedCredentials(), // Use embedded credentials for packaged app

  // Upload settings
  uploadOptions: {
    resumable: false,
    validation: 'crc32c',
    metadata: {
      cacheControl: 'public, max-age=31536000', // Cache for 1 year
    },
  },

  // Generate public URL
  getPublicUrl: (filename: string) =>
    `https://storage.googleapis.com/${GCS_CONFIG.bucketName}/${filename}`,
};
