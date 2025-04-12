import "./globals.css";
export const metadata = {
  title: "Ticket Booking",
  description: "Ticket Booking Application",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
