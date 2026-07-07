import { ProgressBar, StatCard } from "../components/UserUI";

const growthPoints = [
  { day: "1-hafta", value: 48 },
  { day: "2-hafta", value: 54 },
  { day: "3-hafta", value: 62 },
  { day: "4-hafta", value: 71 },
  { day: "Bugun", value: 76 },
];

const dailyTime = [
  { day: "Du", hours: 1.4 },
  { day: "Se", hours: 1.1 },
  { day: "Ch", hours: 1.8 },
  { day: "Pa", hours: 1.6 },
  { day: "Ju", hours: 2.2 },
  { day: "Sh", hours: 2.8 },
  { day: "Ya", hours: 1.3 },
];

const skillStats = [
  { name: "Listening", value: 78, hours: 11.4, tone: "blue", note: "Eng ko‘p vaqt ajratilgan" },
  { name: "Reading", value: 72, hours: 8.8, tone: "green", note: "Barqaror o‘sish" },
  { name: "Writing", value: 54, hours: 9.6, tone: "orange", note: "Eng ko‘p xato shu skillda" },
  { name: "Speaking", value: 67, hours: 5.2, tone: "purple", note: "Eng kam vaqt ajratilgan" },
];

const mistakePages = [
  { page: "Writing Task 2 - Coherence", skill: "Writing", mistakes: 18, accuracy: "46%" },
  { page: "Reading - True/False/NG", skill: "Reading", mistakes: 14, accuracy: "58%" },
  { page: "Listening - Map labeling", skill: "Listening", mistakes: 12, accuracy: "63%" },
  { page: "Speaking - Pronunciation", skill: "Speaking", mistakes: 9, accuracy: "69%" },
];

const totalHours = skillStats.reduce((sum, skill) => sum + skill.hours, 0);
const averageDailyTime = totalHours / 30;
const maxDailyHours = Math.max(...dailyTime.map((item) => item.hours));
const mostTimeSkill = skillStats.reduce((max, skill) => (skill.hours > max.hours ? skill : max), skillStats[0]);
const leastTimeSkill = skillStats.reduce((min, skill) => (skill.hours < min.hours ? skill : min), skillStats[0]);
const growthPath = growthPoints
  .map((point, index) => {
    const x = 40 + index * 130;
    const y = 210 - point.value * 1.85;
    return `${index === 0 ? "M" : "L"} ${x} ${y}`;
  })
  .join(" ");
const growthAreaPath = `${growthPath} L 560 220 L 40 220 Z`;
const skillPie = `conic-gradient(
  #1444ac 0deg 117deg,
  #07724e 117deg 207deg,
  #a14f14 207deg 305deg,
  #6036c2 305deg 360deg
)`;

function MonthlyResultsPage() {
  return (
    <section className="user-page monthly-analytics-page">
      <div className="user-page-header monthly-analytics-hero">
        <div>
          <span>30 kunlik natijalarim</span>
          <h1>Premium analytics dashboard</h1>
          <p>
            Testlar soni, sarflangan vaqt, skill taqsimoti, o‘sish-pasayish
            grafigi va eng ko‘p xato qilingan sahifalar bir joyda.
          </p>
        </div>

        <div className="analytics-hero__meta" aria-label="Analytics summary">
          <span>Learning score</span>
          <strong>76%</strong>
          <small>Oxirgi 30 kun</small>
        </div>
      </div>

      <div className="user-stats-grid">
        <StatCard label="Jami hal qilingan testlar" value="86" caption="30 kun ichida" tone="blue" />
        <StatCard label="Kunlik o‘rtacha vaqt" value={`${averageDailyTime.toFixed(1)} soat`} caption="Har kuni o‘rtacha" tone="green" />
        <StatCard label="Umumiy vaqt" value={`${Math.round(totalHours)} soat`} caption="Bir oyda sarflangan" tone="orange" />
        <StatCard label="Trend" value="+12%" caption="O‘sish kuzatilmoqda" tone="purple" />
      </div>

      <div className="analytics-grid">
        <article className="user-card analytics-card analytics-card--wide">
          <div className="user-section-title user-section-title--split">
            <div>
              <span>O‘sish va pasayish grafigi</span>
              <h2>30 kunlik progress dinamikasi</h2>
            </div>
            <strong>+28 ball</strong>
          </div>

          <div className="analytics-line-chart">
            <svg viewBox="0 0 600 240" role="img" aria-label="30 kunlik o‘sish grafigi">
              <defs>
                <linearGradient id="analyticsGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#277e8b" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#0f3b99" stopOpacity="0.02" />
                </linearGradient>
              </defs>
              <path className="analytics-line-chart__area" d={growthAreaPath} />
              <path className="analytics-line-chart__line" d={growthPath} />
              {growthPoints.map((point, index) => {
                const x = 40 + index * 130;
                const y = 210 - point.value * 1.85;

                return (
                  <g key={point.day}>
                    <circle cx={x} cy={y} r="7" />
                    <text x={x} y="232">{point.day}</text>
                    <text className="analytics-line-chart__value" x={x} y={y - 16}>{point.value}%</text>
                  </g>
                );
              })}
            </svg>
          </div>
        </article>

        <article className="user-card analytics-card analytics-card--time">
          <div className="user-section-title">
            <span>Vaqt taqsimoti</span>
            <h2>Har kuni sarflangan vaqt</h2>
          </div>

          <div className="analytics-bar-chart">
            {dailyTime.map((item) => (
              <div key={item.day}>
                <span>{item.hours}h</span>
                <i style={{ height: `${Math.round((item.hours / maxDailyHours) * 100)}%` }} />
                <strong>{item.day}</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="user-card analytics-card analytics-card--pie">
          <div className="user-section-title">
            <span>Skill ulushi</span>
            <h2>Qaysi skillga vaqt ketdi</h2>
          </div>

          <div className="analytics-pie">
            <div className="analytics-pie__chart" style={{ background: skillPie }}>
              <strong>{Math.round(totalHours)}h</strong>
              <span>jami</span>
            </div>
            <div className="analytics-pie__legend">
              {skillStats.map((skill) => (
                <span className={`analytics-pie__legend-item analytics-pie__legend-item--${skill.tone}`} key={skill.name}>
                  {skill.name} <strong>{skill.hours}h</strong>
                </span>
              ))}
            </div>
          </div>
        </article>

        <article className="user-card analytics-card analytics-card--skills">
          <div className="user-section-title user-section-title--split">
            <div>
              <span>Skill progress</span>
              <h2>Ko‘p va kam vaqt ajratilgan yo‘nalishlar</h2>
            </div>
            <strong>{mostTimeSkill.name} ↑</strong>
          </div>

          <div className="analytics-skill-list">
            {skillStats.map((skill) => (
              <div className="analytics-skill-row" key={skill.name}>
                <div>
                  <strong>{skill.name}</strong>
                  <span>{skill.note}</span>
                </div>
                <small>{skill.hours} soat</small>
                <b>{skill.value}%</b>
                <ProgressBar value={skill.value} tone={skill.tone as "blue" | "green" | "orange" | "purple"} />
              </div>
            ))}
          </div>
        </article>

        <article className="user-card analytics-card analytics-card--mistakes">
          <div className="user-section-title">
            <span>Eng ko‘p xato qilingan page lar</span>
            <h2>Xato hotspotlari</h2>
          </div>

          <div className="analytics-mistake-list">
            {mistakePages.map((item, index) => (
              <div className="analytics-mistake-row" key={item.page}>
                <span>{index + 1}</span>
                <div>
                  <strong>{item.page}</strong>
                  <small>{item.skill}</small>
                </div>
                <b>{item.mistakes} xato</b>
                <em>{item.accuracy}</em>
              </div>
            ))}
          </div>
        </article>

        <article className="user-card analytics-card analytics-ai-card">
          <span>AI tavsiyalar</span>
          <h2>Keyingi 7 kunda Writing va Speakingga 60% vaqt ajrating.</h2>
          <p>
            {mostTimeSkill.name}ga eng ko‘p vaqt ketgan, {leastTimeSkill.name}ga
            esa eng kam vaqt ajratilgan. Xato hotspotlari asosida Writing Task 2
            va pronunciation mashqlarini ustuvor qiling.
          </p>
        </article>
      </div>
    </section>
  );
}

export default MonthlyResultsPage;
