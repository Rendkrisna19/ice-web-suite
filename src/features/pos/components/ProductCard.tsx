import { Plus } from "lucide-react";

interface ProductCardProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  product: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onAdd: (product: any) => void;
}

export function ProductCard({ product, onAdd }: ProductCardProps) {
  // Pindahkan logika ke dalam komponen menggunakan helper yang sama
  const getImageUrl = (path?: string | null) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://linen-deer-529188.hostingersite.com";
    const base = apiUrl.split('/api')[0].replace(/\/$/, ""); 
    const cleanPath = path.startsWith("/") ? path : `/${path}`;

    return `${base}${cleanPath}`;
  };

  const imageUrl = getImageUrl(product?.image_url);

  return (
    <div 
      onClick={() => onAdd(product)}
      className="bg-white p-3 rounded-xl border border-surface-200 shadow-sm hover:border-[#15423C] cursor-pointer group transition-all"
    >
      <div className="relative aspect-square bg-surface-100 rounded-lg mb-2 overflow-hidden">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={product.name} 
            className="object-cover w-full h-full" 
            // Fallback jika gambar error/404
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-300 font-bold text-xl">
            {product.name?.charAt(0) || "?"}
          </div>
        )}

        {/* Fallback Container (Akan muncul jika gambar di atas error) */}
        <div className="hidden absolute inset-0 w-full h-full flex items-center justify-center text-neutral-300 bg-surface-100 font-bold text-xl">
          {product.name?.charAt(0) || "?"}
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center">
          <div className="bg-[#15423C] text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <Plus size={16} />
          </div>
        </div>
      </div>
      
      <h3 className="text-xs font-bold text-neutral-800 line-clamp-2 h-8">{product.name}</h3>
      <p className="text-[#15423C] font-black text-sm mt-1">
        Rp {Number(product.price).toLocaleString('id-ID')}
      </p>
    </div>
  );
}
