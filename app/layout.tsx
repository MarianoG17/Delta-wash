import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "DeltaWash - Lavadero App",
    description: "Sistema de gestión para lavadero de autos",
    manifest: "/manifest.json",
    themeColor: "#0ea5e9",
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: "DeltaWash",
    },
    viewport: {
        width: "device-width",
        initialScale: 1,
        maximumScale: 1,
        userScalable: false,
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es">
            <head>
                <link rel="icon" href="/icon.svg" type="image/svg+xml" />
                <link rel="apple-touch-icon" href="/icon.svg" />
            </head>
            <body>
                {children}
            </body>
        </html>
    );
}
