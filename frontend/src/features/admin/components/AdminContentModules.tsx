import AdminSectionTitle from "./AdminSectionTitle";

function AdminContentModules() {
  return (
    <section className="admin-content-modules" id="content-modules">
      <AdminSectionTitle
        title="Kontent bo‘limlari"
        description="Kontent boshqaruvi backendga ulangandan keyin shu yerda ko‘rinadi."
        meta="Kontent"
      />

      <div className="admin-info-card">
        <strong>Dasturchi tomonidan hali bu qism tayyor emas</strong>
        <span>Kontent ma’lumotlari mavjud bo‘lganda shu bo‘limda ko‘rsatiladi.</span>
      </div>
    </section>
  );
}

export default AdminContentModules;
