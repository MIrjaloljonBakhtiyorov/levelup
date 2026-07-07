type AdminSectionTitleProps = {
  title: string;
  description: string;
  meta: string;
};

function AdminSectionTitle({ title, description, meta }: AdminSectionTitleProps) {
  return (
    <div className="admin-section-title">
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <span>{meta}</span>
    </div>
  );
}

export default AdminSectionTitle;
