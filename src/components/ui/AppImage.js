"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

/**
 * A wrapper around Next.js Image component that handles:
 * 1. Automatic unoptimization for localhost/private IP images
 * 2. Fallback to default image on error
 * 3. Consistent styling
 */
export default function AppImage({ src, alt, ...props }) {
    const [imgSrc, setImgSrc] = useState(src);

    useEffect(() => {
        setImgSrc(src);
    }, [src]);

    // Check if the image source requires unoptimized loading (localhost/private IP)
    const isLocal = typeof src === 'string' && (
        src.includes('localhost') ||
        src.includes('127.0.0.1') ||
        src.startsWith('blob:')
    );

    return (
        <Image
            {...props}
            src={imgSrc || "/images/default.jpg"}
            alt={alt || "Image"}
            unoptimized={isLocal}
            onError={() => setImgSrc("/images/default.jpg")}
        />
    );
}
