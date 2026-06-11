// app/dashboard/layout.tsx

import Header from "@/components/Header";

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
