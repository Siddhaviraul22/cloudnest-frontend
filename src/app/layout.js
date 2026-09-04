import "./globals.css";
import { AuthProvider } from "../context/AuthContext";

export const metadata = {
  title: "CloudNest",
  description: "Cloud-based media files storage service"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}