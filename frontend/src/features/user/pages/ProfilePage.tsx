import { Badge, Button } from "../components/UserUI";

const profileRows = [
  ["Email", "ilhom.saidov@example.com"],
  ["Telefon", "+998 90 123 45 67"],
  ["Country", "Uzbekistan"],
  ["Language", "O‘zbek / English"],
  ["Timezone", "Asia/Tashkent"],
  ["Maqsad imtihon", "IELTS"],
  ["Hozirgi daraja", "Intermediate"],
  ["Maqsad ball", "7.5"],
];

function ProfilePage() {
  return (
    <section className="user-page">
      <div className="user-page-header">
        <span>Profil</span>
        <h1>Account settings</h1>
        <p>Shaxsiy ma’lumotlar, imtihon maqsadi, til sozlamalari, parol va xavfsizlik.</p>
      </div>

      <div className="profile-layout">
        <article className="user-card profile-card">
          <div className="profile-card__avatar">IS</div>
          <h2>Mirjaloljon Bakhtiyorov</h2>
          <p>Premium learner · IELTS overall 9 main purpose</p>
          <div className="profile-card__badges">
            <Badge tone="blue">Premium</Badge>
            <Badge tone="green">Active</Badge>
          </div>
          <Button>Avatar upload</Button>
        </article>

        <article className="user-card profile-details">
          <h2>Shaxsiy ma’lumotlar</h2>
          <dl>
            {profileRows.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <div className="profile-actions">
            <Button>Saqlash</Button>
            <Button variant="secondary">Parolni o‘zgartirish</Button>
            <Button variant="ghost">Chiqish</Button>
          </div>
        </article>
      </div>
    </section>
  );
}

export default ProfilePage;
