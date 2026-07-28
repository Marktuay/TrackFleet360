import './globals.css';

export const metadata = {
  title: 'TrackFleet360 - Control y Validación de Recorridos',
  description: 'Sistema de control, monitoreo y auditoría de recorridos vehiculares',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="bg-slate-950 text-slate-100 font-sans antialiased min-h-screen" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
