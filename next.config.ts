import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.imgchest.com',
        port: '',
        pathname: '/**',
      },
    ],
    // Permitir "data:" URLs para o QR Code em base64
    unoptimized: false,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
        {
          protocol: 'https',
          hostname: 'placehold.co',
        },
        {
          protocol: 'https',
          hostname: 'cdn.imgchest.com',
        }
    ],
    // A configuração a seguir é necessária para exibir imagens de QR Code em base64.
    // O Next.js por padrão não otimiza "data:" URLs.
    // Esta configuração deve ser usada com cuidado, pois desabilita a otimização para todos os domínios,
    // mas é a abordagem recomendada quando se lida com imagens geradas dinamicamente como data URLs.
    // Para um ambiente de produção mais robusto, seria melhor salvar a imagem e servi-la de um endpoint.
    // No entanto, para este caso, é uma solução eficaz.
    domains: [],
    path: '/_next/image',
    loader: 'default',
    dangerouslyAllowSVG: true,
    unoptimized: true,
  },
};

export default nextConfig;
