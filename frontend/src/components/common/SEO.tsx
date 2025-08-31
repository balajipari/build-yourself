import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  type?: 'website' | 'article' | 'product';
  schema?: Record<string, any>;
}

const SEO: React.FC<SEOProps> = ({
  title = 'Build it Yourself - AI-Powered Custom Motorcycle Designer',
  description = 'Design your dream motorcycle with AI assistance. Create custom bikes with professional guidance and real-time visualization.',
  keywords = ['custom motorcycle design', 'AI bike builder', 'motorcycle customization'],
  image = '/assets/og-image.jpg',
  type = 'website',
  schema
}) => {
  const baseUrl = 'https://buildityourself.com';
  const imageUrl = image.startsWith('http') ? image : `${baseUrl}${image}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={window.location.href} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />

      {/* Schema.org */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
