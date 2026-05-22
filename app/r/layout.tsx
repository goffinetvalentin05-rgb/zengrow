export default function PublicRestaurantLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div
      className="zg-public-r-root min-h-[100dvh] min-h-dvh w-full antialiased"
      style={{
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
        backgroundColor: "#06040f",
        color: "#9b8fb8",
      }}
    >
      {children}
    </div>
  );
}
