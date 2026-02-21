import localFont from "next/font/local";
import { Bebas_Neue, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import NavbarWrapper from "@/components/NavbarWrapper";
import Footer from "@/components/Footer";
const bebas = Bebas_Neue({
    weight: "400",
    subsets: ["latin"],
    variable: "--font-bebas",
});
const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
});
const geistSans = localFont({
    src: "./fonts/GeistVF.woff",
    variable: "--font-geist-sans",
});
const geistMono = localFont({
    src: "./fonts/GeistMonoVF.woff",
    variable: "--font-geist-mono",
});
export const metadata = {
    title: "ePRX UV1 | Beyond the Mile",
    description: "High-performance lifestyle brand.",
};
export default function RootLayout({ children, }) {
    return (<html lang="en">
      <body className={`${bebas.variable} ${inter.variable} ${geistSans.variable} ${geistMono.variable}`} style={{
            fontFamily: "var(--font-inter), sans-serif",
            margin: 0,
            backgroundColor: "#0f0f0f",
        }}>
        <AuthProvider>
          <NavbarWrapper /> {/* <--- Moved outside the body tag attributes */}
          <main>{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>);
}
