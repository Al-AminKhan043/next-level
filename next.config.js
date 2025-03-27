/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
      serverActions: {
        bodySizeLimit: '15mb', 
      },
    },
    images: {
      domains: ['res.cloudinary.com'], // Allow Cloudinary image domain
    },
  };
  
  module.exports = nextConfig;
  