import { AdminNav } from "@/components/AdminNav";

export default function LayoutPanelAdmin({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-museo-crema">
      <AdminNav />
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
