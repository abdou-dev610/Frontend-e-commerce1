import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

// Redirige vers /produits?cat=slug pour ne pas dupliquer la logique de filtrage
const CategoryPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    navigate(`/produits?cat=${encodeURIComponent(slug)}`, { replace: true });
  }, [slug, navigate]);

  return null;
};

export default CategoryPage;
