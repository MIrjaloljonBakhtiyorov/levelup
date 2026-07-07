import { useEffect, useRef, useState, type ChangeEvent } from "react";

import { Badge, Button, ProgressBar } from "../components/UserUI";

const personalInfo = [
  { label: "Ism", value: "Mirjalol" },
  { label: "Familiya", value: "Bakhtiyorov" },
  { label: "Otchestvo", value: "Bakhtiyor o‘g‘li" },
  { label: "Tug‘ilgan sana", value: "14.03.2002" },
  { label: "Telefon", value: "+998 90 123 45 67" },
  { label: "Email", value: "mirjalol.bakhtiyorov@example.com" },
  { label: "Shahar", value: "Toshkent" },
  { label: "Timezone", value: "Asia/Tashkent" },
];

const learningInfo = [
  { label: "Hozirgi daraja", value: "B2 Intermediate+" },
  { label: "Maqsad", value: "IELTS 7.5" },
  { label: "Imtihon sanasi", value: "15.09.2026" },
  { label: "Kunlik vaqt", value: "1 soat 30 daqiqa" },
  { label: "Zaif skill", value: "Writing" },
  { label: "Mentor", value: "Madina Usmonova" },
];

const securityItems = [
  { label: "Parol", value: "Oxirgi yangilanish: 18 kun oldin", status: "Yaxshi" },
  { label: "Email tasdiqlash", value: "mirjalol.bakhtiyorov@example.com", status: "Tasdiqlangan" },
  { label: "Telefon tasdiqlash", value: "+998 90 123 45 67", status: "Tasdiqlangan" },
];

const preferences = [
  { label: "Platforma tili", value: "O‘zbek" },
  { label: "Bildirishnoma", value: "Dars, test va to‘lov eslatmalari yoqilgan" },
  { label: "Mavzu", value: "Light mode" },
  { label: "Haftalik hisobot", value: "Har yakshanba 20:00" },
];

function ProfilePage() {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [uploadMessage, setUploadMessage] = useState("PNG yoki JPG rasm tanlang.");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      if (profileImage) {
        URL.revokeObjectURL(profileImage);
      }
    };
  }, [profileImage]);

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setUploadMessage("Faqat rasm formatidagi fayl yuklang.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadMessage("Rasm hajmi 5MB dan oshmasligi kerak.");
      return;
    }

    if (profileImage) {
      URL.revokeObjectURL(profileImage);
    }

    setProfileImage(URL.createObjectURL(file));
    setUploadMessage(`${file.name} tanlandi.`);
  }

  function handleRemoveImage() {
    if (profileImage) {
      URL.revokeObjectURL(profileImage);
    }

    setProfileImage(null);
    setUploadMessage("Profile rasmi olib tashlandi.");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <section className="user-page profile-page">
      <div className="user-page-header profile-hero">
        <div>
          <span>Profil</span>
          <h1>Account va o‘quv profilingiz</h1>
          <p>Shaxsiy ma’lumotlar, avatar, imtihon maqsadi, xavfsizlik va platforma sozlamalarini bitta joyda boshqaring.</p>
        </div>

        <div className="profile-hero__completion">
          <span>Profile completion</span>
          <strong>86%</strong>
          <ProgressBar value={86} tone="blue" />
          <small>Exam date va otchestvo kiritilgan. Faqat profile rasmi yangilanishi kerak.</small>
        </div>
      </div>

      <div className="profile-layout profile-layout--premium">
        <aside className="user-card profile-card profile-card--premium">
          <div className="profile-card__cover" />
          <div className={`profile-card__avatar profile-card__avatar--large ${profileImage ? "profile-card__avatar--image" : ""}`}>
            {profileImage ? <img src={profileImage} alt="Profile rasmi" /> : "MB"}
          </div>
          <h2>Mirjalol Bakhtiyorov</h2>
          <p>Premium learner · IELTS 7.5 goal</p>

          <div className="profile-card__badges">
            <Badge tone="blue">Premium</Badge>
            <Badge tone="green">Active</Badge>
            <Badge tone="purple">B2</Badge>
          </div>

          <div className="profile-photo-upload">
            <span>Profile rasmi</span>
            <strong>{uploadMessage}</strong>
            <input
              ref={fileInputRef}
              accept="image/png,image/jpeg,image/jpg,image/webp"
              className="profile-photo-upload__input"
              type="file"
              onChange={handleImageChange}
            />
            <div className="profile-photo-upload__actions">
              <button className="user-btn user-btn--primary" type="button" onClick={() => fileInputRef.current?.click()}>
                Rasm yuklash
              </button>
              {profileImage ? (
                <button className="user-btn user-btn--ghost" type="button" onClick={handleRemoveImage}>
                  Olib tashlash
                </button>
              ) : null}
            </div>
          </div>

          <div className="profile-mini-stats">
            <div>
              <span>Streak</span>
              <strong>12 kun</strong>
            </div>
            <div>
              <span>Plan</span>
              <strong>Premium</strong>
            </div>
            <div>
              <span>Login</span>
              <strong>Bugun</strong>
            </div>
          </div>
        </aside>

        <div className="profile-main">
          <article className="user-card profile-section-card">
            <div className="profile-section-card__header">
              <div>
                <span>Shaxsiy ma’lumotlar</span>
                <h2>Account egasi</h2>
              </div>
              <Badge tone="green">Tasdiqlangan</Badge>
            </div>

            <div className="profile-form-grid">
              {personalInfo.map((item) => (
                <label className="profile-field" key={item.label}>
                  <span>{item.label}</span>
                  <input defaultValue={item.value} />
                </label>
              ))}
            </div>
          </article>

          <article className="user-card profile-section-card">
            <div className="profile-section-card__header">
              <div>
                <span>O‘quv profili</span>
                <h2>Maqsad va reja</h2>
              </div>
              <Badge tone="blue">AI reja aktiv</Badge>
            </div>

            <div className="profile-info-grid">
              {learningInfo.map((item) => (
                <div key={item.label}>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>

            <div className="profile-ai-note">
              <span>AI tavsiya</span>
              <p>Writing zaif skill bo‘lgani uchun haftasiga 2 marta essay feedback va 1 marta live clinic qo‘shilgan.</p>
            </div>
          </article>
        </div>
      </div>

      <div className="profile-grid-two">
        <article className="user-card profile-section-card">
          <div className="profile-section-card__header">
            <div>
              <span>Xavfsizlik</span>
              <h2>Login va tasdiqlash</h2>
            </div>
            <Button variant="secondary">Parolni o‘zgartirish</Button>
          </div>

          <div className="profile-settings-list">
            {securityItems.map((item) => (
              <div key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
                <small>{item.status}</small>
              </div>
            ))}
          </div>
        </article>

        <article className="user-card profile-section-card">
          <div className="profile-section-card__header">
            <div>
              <span>Sozlamalar</span>
              <h2>Platforma tajribasi</h2>
            </div>
            <Button variant="ghost">Chiqish</Button>
          </div>

          <div className="profile-settings-list">
            {preferences.map((item) => (
              <div key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
                <small>Faol</small>
              </div>
            ))}
          </div>
        </article>
      </div>

      <div className="profile-actions profile-actions--premium">
        <Button>O‘zgarishlarni saqlash</Button>
        <Button variant="secondary">Profilni ko‘rib chiqish</Button>
        <Button variant="ghost">Accountni boshqarish</Button>
      </div>
    </section>
  );
}

export default ProfilePage;
