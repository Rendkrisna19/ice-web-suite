import { SoundProvider } from "@/context/SoundContext";

export default function DriverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SoundProvider>
      {children}
    </SoundProvider>
  );
}
