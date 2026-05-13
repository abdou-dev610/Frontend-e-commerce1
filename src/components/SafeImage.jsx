import React, { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";

/**
 * SafeImage Component - Gestion robuste des images e-commerce
 * - object-fit: cover (pas de déformation)
 * - overflow: hidden (pas de débordement)
 * - Lazy loading + skeleton loader
 * - Fallback en cas d'erreur
 */

const SafeImage = ({
  src,
  alt = "Produit",
  className = "w-full h-full",
  fallbackSrc = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 500'%3E%3Crect fill='%23f3f4f6' width='400' height='500'/%3E%3C/svg%3E",
  showErrorUI = false,
  width,
  height,
  loading = "lazy",
  decoding = "async"
}) => {
  const [imageSrc, setImageSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!src) {
      setHasError(true);
      setImageSrc(fallbackSrc);
      setIsLoading(false);
      return;
    }

    if (typeof src === "string" && src.startsWith("http")) {
      try {
        new URL(src);
        setImageSrc(src);
        setHasError(false);
      } catch (e) {
        console.warn(`URL invalide: ${src}`);
        setHasError(true);
        setImageSrc(fallbackSrc);
      }
    } else {
      setImageSrc(src);
      setHasError(false);
    }
    setIsLoading(true);
  }, [src, fallbackSrc]);

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleImageError = () => {
    console.warn(`Erreur image: ${src}`);
    setIsLoading(false);
    setHasError(true);
    if (imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc);
    }
  };

  const dimensionStyle = {};
  if (width) dimensionStyle.width = `${width}px`;
  if (height) dimensionStyle.height = `${height}px`;

  return (
    <div 
      className={`relative bg-gray-100 overflow-hidden ${className}`}
      style={dimensionStyle}
    >
      {/* Skeleton Loader */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
      )}

      {/* Image - Optimisée avec object-cover */}
      <img
        src={imageSrc}
        alt={alt}
        loading={loading}
        decoding={decoding}
        onLoad={handleImageLoad}
        onError={handleImageError}
        className={`w-full h-full object-cover transition-transform duration-500 ${
          isLoading ? "opacity-0" : "opacity-100"
        }`}
        style={{ 
          ...dimensionStyle,
          objectFit: "cover"
        }}
      />

      {/* Erreur UI */}
      {hasError && showErrorUI && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50">
          <div className="text-center px-4">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-xs text-red-600">Image non disponible</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SafeImage;
