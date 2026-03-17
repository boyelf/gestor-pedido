import type { NextConfig } from "next";

const nextConfig: NextConfig = {
 images:{ 
  remotePatterns: [

  {
      hostname: 'rglyxumcszexpwnewxvr.supabase.co',
      protocol: 'https',
      pathname: '**',

  }]

  }
};

export default nextConfig;
