export default function PublicRestaurantLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div
      className="zg-public-r-root min-h-[100dvh] min-h-dvh w-full antialiased"
      style={{
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
        backgroundColor: "#0A0A0B",
        color: "#A8A29E",
      }}
    >
      {children}
    </div>
  );
}
