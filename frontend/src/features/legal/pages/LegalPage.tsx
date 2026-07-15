import { Link } from "react-router";

import { type HomeLanguage, useHomeI18n } from "../../home/i18n/HomeI18nContext";
import "../styles/legal.css";

type DocumentKind = "terms" | "privacy";

type LegalSection = {
  title: string;
  paragraphs: string[];
  items?: string[];
};

type LegalDocument = {
  eyebrow: string;
  title: string;
  introduction: string;
  updated: string;
  back: string;
  sections: LegalSection[];
};

const legalContent: Record<HomeLanguage, Record<DocumentKind, LegalDocument>> = {
  uz: {
    terms: {
      eyebrow: "HUQUQIY MA'LUMOT",
      title: "Foydalanish shartlari",
      introduction:
        "Ushbu shartlar LevelUp platformasidan foydalanish tartibini belgilaydi. Ro‘yxatdan o‘tish yoki platformadan foydalanish orqali siz ushbu qoidalarga rozilik bildirasiz.",
      updated: "Oxirgi yangilanish: 14-iyul, 2026-yil",
      back: "Ro‘yxatdan o‘tishga qaytish",
      sections: [
        {
          title: "1. Platformadan foydalanish",
          paragraphs: [
            "LevelUp ingliz tili ko‘nikmalarini rivojlantirish uchun darslar, testlar, mentorlik materiallari va o‘quv rejalari bilan ta’minlaydi.",
            "Platformadan faqat qonuniy maqsadlarda va ushbu shartlarga rioya qilgan holda foydalanishingiz mumkin.",
          ],
        },
        {
          title: "2. Hisob qaydnomasi",
          paragraphs: [
            "Ro‘yxatdan o‘tishda to‘g‘ri va dolzarb ma’lumotlarni kiritishingiz kerak. Hisobingizdagi ma’lumotlarni yangilab turish sizning mas’uliyatingizdir.",
          ],
          items: [
            "Kirish ma’lumotlaringizni boshqalar bilan ulashmang.",
            "Hisobingizdan ruxsatsiz foydalanishdan shubhalansangiz, darhol platforma qo‘llab-quvvatlashiga xabar bering.",
            "Bir foydalanuvchi uchun yaratilgan hisobni boshqa shaxsga o‘tkazish mumkin emas.",
          ],
        },
        {
          title: "3. O‘quv materiallari va testlar",
          paragraphs: [
            "Darslar, savollar, videolar, dizaynlar va boshqa materiallar faqat shaxsiy ta’lim maqsadida foydalanish uchun taqdim etiladi.",
            "Materiallarni nusxalash, qayta sotish, ommaviy tarqatish yoki platformaning funksiyalarini chetlab o‘tish taqiqlanadi.",
          ],
        },
        {
          title: "4. Mentorlar va natijalar",
          paragraphs: [
            "Mentor tavsiyalari o‘quv jarayonini qo‘llab-quvvatlash uchun beriladi. Imtihon natijasi o‘quvchining tayyorgarligi, vaqt sarfi va boshqa omillarga bog‘liq.",
            "LevelUp ma’lum ball yoki sertifikatni kafolatlamaydi, biroq maqsadga yo‘naltirilgan o‘quv vositalarini taqdim etadi.",
          ],
        },
        {
          title: "5. To‘lovlar va xizmatlar",
          paragraphs: [
            "Agar pullik xizmat yoki obuna tanlansa, narx, foydalanish muddati va tegishli shartlar to‘lovdan oldin ko‘rsatiladi.",
            "To‘lov bilan bog‘liq savollar bo‘lsa, murojaatni platforma qo‘llab-quvvatlash kanallari orqali yuborishingiz mumkin.",
          ],
        },
        {
          title: "6. Qabul qilinadigan foydalanish",
          paragraphs: ["Platforma xavfsiz va hurmatli o‘quv muhiti bo‘lib qolishi uchun quyidagilar taqiqlanadi:"],
          items: [
            "Boshqalarning hisobiga ruxsatsiz kirish yoki test natijalarini buzishga urinish.",
            "Zararli kod, spam yoki haqoratli material yuborish.",
            "Boshqa foydalanuvchilarning shaxsiy ma’lumotlarini ruxsatsiz yig‘ish yoki tarqatish.",
          ],
        },
        {
          title: "7. Hisobni cheklash",
          paragraphs: [
            "Ushbu shartlar buzilganda yoki platforma xavfsizligiga tahdid tug‘ilganda, LevelUp hisobga kirishni vaqtincha cheklashi yoki to‘xtatishi mumkin.",
          ],
        },
        {
          title: "8. Shartlarning yangilanishi",
          paragraphs: [
            "Platforma ushbu shartlarni takomillashtirishi mumkin. Muhim o‘zgarishlar e’lon qilingandan keyin platformadan foydalanishni davom ettirish yangilangan shartlarni qabul qilishni anglatadi.",
          ],
        },
      ],
    },
    privacy: {
      eyebrow: "HUQUQIY MA'LUMOT",
      title: "Maxfiylik siyosati",
      introduction:
        "LevelUp shaxsiy ma’lumotlaringizni ehtiyotkorlik bilan qayta ishlashga intiladi. Ushbu siyosat qanday ma’lumotlarni yig‘ishimiz, nima uchun foydalanishimiz va ularni qanday himoya qilishimizni tushuntiradi.",
      updated: "Oxirgi yangilanish: 14-iyul, 2026-yil",
      back: "Ro‘yxatdan o‘tishga qaytish",
      sections: [
        {
          title: "1. Yig‘iladigan ma’lumotlar",
          paragraphs: ["Platformadan foydalanganingizda quyidagi ma’lumotlarni qayta ishlashimiz mumkin:"],
          items: [
            "Ism, familiya, telefon raqami va elektron pochta manzili kabi ro‘yxatdan o‘tish ma’lumotlari.",
            "Darslar, test natijalari, maqsadlar va o‘quv faolligingiz kabi ta’lim ma’lumotlari.",
            "Xavfsizlik va texnik ishlash uchun qurilma, brauzer hamda foydalanish statistikasi.",
          ],
        },
        {
          title: "2. Ma’lumotlardan foydalanish",
          paragraphs: ["Ma’lumotlaringizdan quyidagi maqsadlarda foydalanamiz:"],
          items: [
            "Hisobingizni yaratish, o‘quv jarayonini yuritish va so‘ralgan xizmatlarni ko‘rsatish.",
            "Shaxsiy o‘quv rejalari, tavsiyalar va natijalar tahlilini shakllantirish.",
            "Platformani himoyalash, xatolarni aniqlash va xizmat sifatini yaxshilash.",
          ],
        },
        {
          title: "3. Ma’lumotlarni ulashish",
          paragraphs: [
            "Shaxsiy ma’lumotlaringiz sotilmaydi. Ular faqat xizmatni taqdim etish uchun zarur bo‘lgan ishonchli texnik hamkorlar yoki qonun talab qilgan holatlarda ulashilishi mumkin.",
          ],
        },
        {
          title: "4. Saqlash va himoya",
          paragraphs: [
            "Ma’lumotlar xizmatni ko‘rsatish uchun zarur bo‘lgan muddatda yoki qonun talab qilgan davrda saqlanadi. Ruxsatsiz kirish, o‘zgartirish va yo‘qotish xavfini kamaytirish uchun tashkiliy hamda texnik choralar qo‘llanadi.",
          ],
        },
        {
          title: "5. Sizning huquqlaringiz",
          paragraphs: ["Amaldagi qonunchilik doirasida siz quyidagilarni so‘rashingiz mumkin:"],
          items: [
            "Shaxsiy ma’lumotlaringizga kirish yoki ularni yangilash.",
            "Noto‘g‘ri ma’lumotlarni tuzatish yoki hisobingizni o‘chirish.",
            "Maxfiylik masalalari bo‘yicha qo‘llab-quvvatlashga murojaat qilish.",
          ],
        },
        {
          title: "6. Ushbu siyosatdagi o‘zgarishlar",
          paragraphs: [
            "Siyosat vaqti-vaqti bilan yangilanishi mumkin. Yangilangan sana ushbu sahifaning yuqorisida ko‘rsatiladi. O‘zgarishlardan keyin platformadan foydalanishni davom ettirish siyosat bilan tanishganingizni anglatadi.",
          ],
        },
      ],
    },
  },
  ru: {
    terms: {
      eyebrow: "ЮРИДИЧЕСКАЯ ИНФОРМАЦИЯ",
      title: "Условия использования",
      introduction:
        "Эти условия регулируют порядок использования платформы LevelUp. Регистрируясь или продолжая пользоваться платформой, вы принимаете эти правила.",
      updated: "Последнее обновление: 14 июля 2026 г.",
      back: "Вернуться к регистрации",
      sections: [
        { title: "1. Использование платформы", paragraphs: ["LevelUp предоставляет уроки, тесты, материалы от наставников и учебные планы для развития английского языка.", "Платформой можно пользоваться только законно и в соответствии с настоящими условиями."] },
        { title: "2. Учётная запись", paragraphs: ["При регистрации необходимо указывать точные и актуальные данные. Поддержание актуальности данных учётной записи — ваша ответственность."], items: ["Не передавайте данные для входа третьим лицам.", "Если вы подозреваете несанкционированный доступ, сразу сообщите в поддержку.", "Учётную запись нельзя передавать другому человеку."] },
        { title: "3. Учебные материалы и тесты", paragraphs: ["Уроки, вопросы, видео, дизайн и другие материалы предоставляются только для личного обучения.", "Копирование, перепродажа, публичное распространение материалов или обход функций платформы запрещены."] },
        { title: "4. Наставники и результаты", paragraphs: ["Рекомендации наставников поддерживают учебный процесс. Результат экзамена зависит от подготовки, затраченного времени и других факторов.", "LevelUp не гарантирует конкретный балл или сертификат, но предоставляет инструменты для целенаправленной подготовки."] },
        { title: "5. Платежи и услуги", paragraphs: ["При выборе платной услуги или подписки цена, срок доступа и соответствующие условия отображаются до оплаты.", "По вопросам оплаты можно обратиться через каналы поддержки платформы."] },
        { title: "6. Допустимое использование", paragraphs: ["Для сохранения безопасной и уважительной учебной среды запрещается:"], items: ["Получать несанкционированный доступ к чужим аккаунтам или пытаться изменить результаты тестов.", "Отправлять вредоносный код, спам или оскорбительные материалы.", "Собирать или распространять персональные данные других пользователей без разрешения."] },
        { title: "7. Ограничение аккаунта", paragraphs: ["При нарушении этих условий или угрозе безопасности LevelUp может временно ограничить или прекратить доступ к аккаунту."] },
        { title: "8. Изменения условий", paragraphs: ["Мы можем обновлять эти условия. Продолжение использования платформы после публикации существенных изменений означает принятие обновлённых условий."] },
      ],
    },
    privacy: {
      eyebrow: "ЮРИДИЧЕСКАЯ ИНФОРМАЦИЯ",
      title: "Политика конфиденциальности",
      introduction:
        "LevelUp бережно относится к персональным данным. Эта политика объясняет, какие данные мы собираем, для чего используем и как защищаем.",
      updated: "Последнее обновление: 14 июля 2026 г.",
      back: "Вернуться к регистрации",
      sections: [
        { title: "1. Какие данные мы собираем", paragraphs: ["При использовании платформы мы можем обрабатывать:"], items: ["Регистрационные данные: имя, фамилию, телефон и электронную почту.", "Учебные данные: уроки, результаты тестов, цели и активность.", "Технические данные об устройстве, браузере и использовании для безопасности и стабильной работы."] },
        { title: "2. Как мы используем данные", paragraphs: ["Данные используются для следующих целей:"], items: ["Создание аккаунта, ведение учебного процесса и предоставление запрошенных услуг.", "Формирование персональных планов, рекомендаций и анализа результатов.", "Защита платформы, поиск ошибок и улучшение качества сервиса."] },
        { title: "3. Передача данных", paragraphs: ["Мы не продаём персональные данные. Они могут передаваться только надёжным техническим партнёрам, необходимым для работы сервиса, или в случаях, предусмотренных законом."] },
        { title: "4. Хранение и защита", paragraphs: ["Данные хранятся столько, сколько нужно для предоставления сервиса или требуется законом. Мы применяем организационные и технические меры для снижения риска несанкционированного доступа, изменения и утраты данных."] },
        { title: "5. Ваши права", paragraphs: ["В рамках применимого законодательства вы можете:"], items: ["Запросить доступ к своим данным или их обновление.", "Исправить неточные данные или удалить аккаунт.", "Обратиться в поддержку по вопросам конфиденциальности."] },
        { title: "6. Изменения политики", paragraphs: ["Политика может периодически обновляться. Дата обновления указана в начале страницы. Продолжение использования платформы после изменений означает, что вы ознакомились с новой редакцией."] },
      ],
    },
  },
  en: {
    terms: {
      eyebrow: "LEGAL INFORMATION",
      title: "Terms of Use",
      introduction:
        "These terms govern your use of the LevelUp platform. By registering or continuing to use the platform, you agree to these rules.",
      updated: "Last updated: July 14, 2026",
      back: "Back to registration",
      sections: [
        { title: "1. Using the platform", paragraphs: ["LevelUp provides lessons, tests, mentor materials, and study plans to help learners improve their English.", "You may use the platform only for lawful purposes and in accordance with these terms."] },
        { title: "2. Your account", paragraphs: ["You must provide accurate and current information during registration. Keeping your account details up to date is your responsibility."], items: ["Do not share your sign-in details with anyone else.", "Notify platform support promptly if you suspect unauthorized use of your account.", "An account created for one user may not be transferred to another person."] },
        { title: "3. Learning content and tests", paragraphs: ["Lessons, questions, videos, designs, and other materials are provided for personal learning use only.", "Copying, reselling, publicly distributing content, or bypassing platform functionality is not allowed."] },
        { title: "4. Mentors and results", paragraphs: ["Mentor guidance is provided to support the learning process. Exam results depend on preparation, time invested, and other factors.", "LevelUp does not guarantee a particular score or certificate, but provides tools for goal-focused learning."] },
        { title: "5. Payments and services", paragraphs: ["When a paid service or subscription is selected, its price, access period, and relevant terms are shown before payment.", "For payment-related questions, you may contact us through the platform support channels."] },
        { title: "6. Acceptable use", paragraphs: ["To keep the platform safe and respectful, you must not:"], items: ["Access another user's account without authorization or try to alter test results.", "Send malicious code, spam, or abusive material.", "Collect or share another user's personal information without permission."] },
        { title: "7. Account restrictions", paragraphs: ["LevelUp may temporarily restrict or end account access when these terms are violated or platform security is at risk."] },
        { title: "8. Changes to these terms", paragraphs: ["We may update these terms from time to time. Continuing to use the platform after material updates are posted means you accept the updated terms."] },
      ],
    },
    privacy: {
      eyebrow: "LEGAL INFORMATION",
      title: "Privacy Policy",
      introduction:
        "LevelUp aims to handle your personal data with care. This policy explains what information we collect, why we use it, and how we protect it.",
      updated: "Last updated: July 14, 2026",
      back: "Back to registration",
      sections: [
        { title: "1. Information we collect", paragraphs: ["When you use the platform, we may process:"], items: ["Registration details such as your name, phone number, and email address.", "Learning data such as lessons, test results, goals, and study activity.", "Device, browser, and usage information needed for security and reliable operation."] },
        { title: "2. How we use information", paragraphs: ["We use information to:"], items: ["Create your account, provide learning services, and run your study experience.", "Generate personalized study plans, recommendations, and progress insights.", "Protect the platform, diagnose issues, and improve service quality."] },
        { title: "3. Sharing information", paragraphs: ["We do not sell personal information. It may be shared only with trusted technical partners needed to deliver the service or where required by law."] },
        { title: "4. Retention and security", paragraphs: ["Information is kept for as long as needed to provide the service or as required by law. We use organizational and technical measures to reduce the risk of unauthorized access, alteration, and loss."] },
        { title: "5. Your choices and rights", paragraphs: ["Subject to applicable law, you may:"], items: ["Request access to or an update of your personal information.", "Correct inaccurate information or request deletion of your account.", "Contact support with privacy-related questions."] },
        { title: "6. Changes to this policy", paragraphs: ["This policy may be updated from time to time. The update date appears at the top of this page. Continuing to use the platform after an update means you have had the opportunity to review it."] },
      ],
    },
  },
};

function LegalPage({ document }: { document: DocumentKind }) {
  const { language } = useHomeI18n();
  const content = legalContent[language][document];

  return (
    <section className="legal-page">
      <div className="legal-page__container">
        <Link className="legal-page__back" to="/register">← {content.back}</Link>

        <article className="legal-document">
          <header className="legal-document__header">
            <span>{content.eyebrow}</span>
            <h1>{content.title}</h1>
            <p>{content.introduction}</p>
            <small>{content.updated}</small>
          </header>

          <div className="legal-document__body">
            {content.sections.map((section) => (
              <section key={section.title}>
                <h2>{section.title}</h2>
                {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                {section.items && (
                  <ul>
                    {section.items.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                )}
              </section>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}

export function TermsPage() {
  return <LegalPage document="terms" />;
}

export function PrivacyPage() {
  return <LegalPage document="privacy" />;
}
