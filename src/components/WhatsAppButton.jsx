import { MessageCircle } from "lucide-react";
import { getWhatsAppLink } from "@/data/products";

const WhatsAppButton = () => (
  <a
    href={getWhatsAppLink()}
    target="_blank"
    rel="noopener noreferrer"
    className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe5b] text-[#fff] px-5 py-3 rounded-full shadow-lg transition-all hover:scale-105"
    aria-label="Contacter via WhatsApp"
  >
    <MessageCircle className="h-5 w-5" />
    <span className="hidden sm:inline font-medium text-sm">WhatsApp</span>
  </a>
);

export default WhatsAppButton;
