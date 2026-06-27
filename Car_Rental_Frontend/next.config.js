const withPWA =
  process.env.ENABLE_PWA === 'true'
    ? require('next-pwa')({
        dest: 'public',
      })
    : (config) => config;

/** @type {import('next').NextConfig} */
const nextConfig = {
  // ── Environment Variable Validation ─────────────────────
  // Next.js will throw at build time if any of these are missing.
  env: (() => {
    const required = ['NEXT_PUBLIC_API_URL', 'NEXTAUTH_URL', 'NEXTAUTH_SECRET'];
    const missing = required.filter((key) => !process.env[key]);
    if (missing.length > 0) {
      console.error('');
      console.error('┌─────────────────────────────────────────────┐');
      console.error('│  FATAL: Missing required environment vars   │');
      console.error('└─────────────────────────────────────────────┘');
      missing.forEach((key) => console.error(`  ✖ ${key}`));
      console.error('');
      console.error('Copy .env.example to .env.local and fill in the required values.');
      console.error('');
      if (process.env.NODE_ENV === 'production') {
        throw new Error(`Missing required env vars: ${missing.join(', ')}`);
      }
    }

    // Warn about optional vars
    const optional = [
      { key: 'GOOGLE_CLIENT_ID', desc: 'Google OAuth will be disabled' },
      { key: 'GOOGLE_CLIENT_SECRET', desc: 'Google OAuth will be disabled' },
      { key: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', desc: 'Stripe payments will be disabled' },
    ];
    const missingOptional = optional.filter((v) => !process.env[v.key]);
    if (missingOptional.length > 0) {
      missingOptional.forEach((v) =>
        console.warn(`  ⚠ ${v.key} not set — ${v.desc}`)
      );
    }

    return {};
  })(),

  turbopack: {
    resolveAlias: {
      '@/*': ['./src/*'],
    }
  },

  experimental: {
    cpus: 1,
    workerThreads: false,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    remotePatterns: [
      { 
        protocol: 'http', 
        hostname: 'localhost', 
        port: '4000', 
        pathname: '/uploads/**' 
      },
      { 
        protocol: 'http', 
        hostname: '127.0.0.1', 
        port: '4000', 
        pathname: '/uploads/**' 
      },
      { 
        protocol: 'https', 
        hostname: 'res.cloudinary.com', 
        pathname: '/**' 
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**'
      }
    ]
  }
};

module.exports = withPWA({
   reactStrictMode: true,
   ...nextConfig
  });
