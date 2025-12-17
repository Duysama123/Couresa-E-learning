import { useEffect } from 'react';

const MetaTags = ({
    title = 'Couresa - Modern E-learning Platform',
    description = 'Master Cloud Computing and Digital Transformation with interactive courses on AWS, Azure, and Google Cloud',
    image = '/og-image.jpg',
    url = 'https://couresa-e-learning.vercel.app'
}) => {
    useEffect(() => {
        // Update document title
        document.title = title;

        // Update or create meta tags
        const updateMetaTag = (name, content, useProperty = false) => {
            const attr = useProperty ? 'property' : 'name';
            let element = document.querySelector(`meta[${attr}="${name}"]`);

            if (!element) {
                element = document.createElement('meta');
                element.setAttribute(attr, name);
                document.head.appendChild(element);
            }
            element.setAttribute('content', content);
        };

        // Standard meta tags
        updateMetaTag('description', description);

        // Open Graph (Facebook, LinkedIn, Zalo) - use property attribute
        updateMetaTag('og:title', title, true);
        updateMetaTag('og:description', description, true);
        updateMetaTag('og:image', image, true);
        updateMetaTag('og:url', url, true);
        updateMetaTag('og:type', 'website', true);

        // Twitter Card - use name attribute
        updateMetaTag('twitter:card', 'summary_large_image');
        updateMetaTag('twitter:title', title);
        updateMetaTag('twitter:description', description);
        updateMetaTag('twitter:image', image);

    }, [title, description, image, url]);

    return null; // This component doesn't render anything
};

export default MetaTags;
