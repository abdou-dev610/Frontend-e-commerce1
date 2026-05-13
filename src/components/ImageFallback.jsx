import React from "react";
import { Package } from "lucide-react";

/**
 * ImageFallback - Placeholder personnalisé pour images en chargement/erreur
 * Peut être utilisé seul ou via SafeImage
 */
export default function ImageFallback({ 
  message = "Image non disponible",
  isLoading = false,
  type = "product" // 'product', 'profile', 'banner'
}) {
  const sizeClasses = {
    product: "w-64 h-80",
    profile: "w-32 h-32",
    banner: "w-full h-48",
  };

  return (
    <div className={`${sizeClasses[type]} bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center rounded-lg overflow-hidden`}>
      {isLoading ? (
        // Skeleton loader
        <div className="w-full h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
      ) : (
        // Error state
        <div className="text-center px-4">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">{message}</p>
        </div>
      )}
    </div>
  );
}
