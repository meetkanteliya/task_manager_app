import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950">
      <Sidebar />

      <div className="min-h-screen md:pl-72">
        <Navbar />

        <main className="px-4 pb-28 pt-6 sm:px-6 md:pb-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
