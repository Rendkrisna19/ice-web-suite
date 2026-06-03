import { SoundProvider } from "@/context/SoundContext"; // Import Provider

export default function MerchantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SoundProvider> {/* Bungkus Layout dengan SoundProvider */}
      {children}
    </SoundProvider>
  );
}