// app/dashboard/layout.tsx

import Header from "@/lib/Header";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header></Header>
      <main>{children}</main>
    </>
  );
}
