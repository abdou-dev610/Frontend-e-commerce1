import { formatPrice, getWhatsAppLink } from "@/data/products";

const ProductCard = ({ product }) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition">
      {/* IMAGE */}
      <div className="w-full aspect-square bg-gray-100 flex items-center justify-center">
        <img
          src={product.image}
          alt={product.name}
          className="max-h-full max-w-full object-contain p-3 transition-transform duration-300 hover:scale-105"
        />
      </div>

      {/* INFOS */}
      <div className="p-4">
        <h2 className="text-sm font-semibold text-gray-900 line-clamp-2">{product.name}</h2>

        <p className="text-green-600 font-bold mt-2">
          {formatPrice(product.price)}
        </p>

        <a
          href={getWhatsAppLink(product.name)}
          target="_blank"
          rel="noopener noreferrer"
          className="block mt-3 bg-green-500 text-white text-center py-2 rounded-lg hover:bg-green-600 transition text-sm font-semibold"
        >
          Commander
        </a>
      </div>
    </div>
  );
};

export default ProductCard;
