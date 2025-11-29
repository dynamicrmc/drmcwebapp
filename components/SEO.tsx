import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
}

const SEO: React.FC<SEOProps> = ({ title, description, image, url }) => {
  const siteTitle = "DRMC Ltd";
  const fullTitle = `${title} | ${siteTitle}`;
  const defaultImage = "https://i.ibb.co/DgSGhMxW/Dynamic-RMC.jpg"; // Using Hero image as default OG image
  const metaImage = image || defaultImage;
  const metaUrl = url || window.location.href;

  return (
    <Helmet>
      {/* Standard Metadata */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:url" content={metaUrl} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={metaImage} />
    </Helmet>
  );
};

export default SEO;