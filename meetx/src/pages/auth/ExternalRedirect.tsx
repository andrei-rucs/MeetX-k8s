import { useEffect } from 'react';

interface ExternalRedirectProps {
    url: string;
}

const ExternalRedirect = ({ url }: ExternalRedirectProps) => {
    useEffect(() => {
        window.location.replace(url);
    }, [url]);

    return <div>Redirecting...</div>;
};

export default ExternalRedirect;
