import AdminSectionTitle from "./AdminSectionTitle";

type AdminTeacher = {
  id: string;
  name: string;
  subject: string;
  phone: string;
  email: string;
  rating: string;
  status: string;
};

type AdminTeachersCardsProps = {
  teachers?: AdminTeacher[];
};

function AdminTeachersCards({ teachers = [] }: AdminTeachersCardsProps) {
  return (
    <section className="admin-card-section">
      <AdminSectionTitle
        title="Ustozlar"
        description="Platformadagi ustoz profillari va ularning asosiy ma’lumotlari."
        meta={`${teachers.length} ta ustoz`}
      />

      {teachers.length > 0 ? (
        <div className="admin-teacher-grid">
          {teachers.map((teacher) => (
            <article className="admin-teacher-card" key={teacher.id}>
              <div className="admin-teacher-card__header">
                <span>{teacher.name.slice(0, 2).toUpperCase()}</span>
                <strong>{teacher.status}</strong>
              </div>

              <h3>{teacher.name}</h3>
              <p>{teacher.subject}</p>

              <dl>
                <div>
                  <dt>Telefon</dt>
                  <dd>{teacher.phone}</dd>
                </div>
                <div>
                  <dt>Email</dt>
                  <dd>{teacher.email}</dd>
                </div>
                <div>
                  <dt>Reyting</dt>
                  <dd>{teacher.rating}</dd>
                </div>
              </dl>

              <div className="admin-teacher-card__actions">
                <button type="button">Profilni ko‘rish</button>
                <button type="button">Jadval</button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="admin-info-card">
          <strong>Dasturchi tomonidan hali bu qism tayyor emas</strong>
          <span>Ustozlar ma’lumotlari backendga ulangandan keyin shu yerda ko‘rinadi.</span>
        </div>
      )}
    </section>
  );
}

export default AdminTeachersCards;
