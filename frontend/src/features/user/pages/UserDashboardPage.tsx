import { Button, ProgressCard, StatCard } from "../components/UserUI";

const todayTasks = [
  { title: "Writing Task 2 reja yozish", time: "25 daqiqa", status: "Muhim" },
  { title: "Listening Section 3 mashqi", time: "30 daqiqa", status: "Bugun" },
  { title: "Vocabulary: academic verbs", time: "15 daqiqa", status: "Yengil" },
];

const chartValues = [42, 55, 61, 58, 72, 78, 84];
const chartPoints = "16,156 118,124 220,104 322,114 424,78 526,58 628,42";
const chartArea = `${chartPoints} 628,188 16,188`;
const chartLabels = ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"];

function UserDashboardPage() {
  return (
    <section className="user-page">
      <div className="user-hero-card">
        <div>
          <span>Dashboard</span>
          <h1>Xush kelibsiz, Mirjalol!</h1>
          <p>Bugungi reja Writing zaif skillini kuchaytirish va IELTS 7.5 maqsadingizga yaqinlashish uchun tuzildi.</p>
          <div className="user-hero-card__actions">
            <Button>Bugungi rejani boshlash</Button>
            <Button variant="secondary">Diagnostik testdan o‘tish</Button>
          </div>
        </div>
        <div className="user-hero-card__score">
          <span>Maqsad</span>
          <strong>IELTS 7.5</strong>
          <small>42 kunlik personal sprint</small>
        </div>
      </div>

      <div className="user-stats-grid">
        <StatCard label="Hozirgi daraja" value="Intermediate" caption="Band 5.5 atrofida" tone="blue" />
        <StatCard label="Zaif skill" value="Writing" caption="AI fokus reja aktiv" tone="purple" />
        <StatCard label="Kunlik vaqt" value="1 soat" caption="Realistik ritm" tone="green" />
        <StatCard label="Daily streak" value="12 kun" caption="Ketma-ket o‘qish" tone="orange" />
      </div>

      <div className="user-dashboard-grid">
        <article className="user-card user-card--wide">
          <div className="user-section-title">
            <span>Bugungi vazifalar</span>
            <h2>Rejangiz aniq va bajarishga qulay</h2>
          </div>
          <div className="task-list">
            {todayTasks.map((task) => (
              <div className="task-item" key={task.title}>
                <span>{task.status}</span>
                <div>
                  <strong>{task.title}</strong>
                  <small>{task.time}</small>
                </div>
                <Button variant="ghost">Boshlash</Button>
              </div>
            ))}
          </div>
        </article>

        <article className="user-card ai-card">
          <span>AI tavsiya</span>
          <h2>Bugun essay intro va body paragraph strukturasini mustahkamlang.</h2>
          <p>Oxirgi diagnostikada coherence va lexical range sekin o‘sgan. 3 ta model answer tahlili foyda beradi.</p>
        </article>

        <article className="user-card user-card--wide">
          <div className="user-section-title user-section-title--split">
            <div>
              <span>Progress chart</span>
              <h2>So‘nggi 7 kun o‘sishi</h2>
            </div>
            <strong>+18%</strong>
          </div>

          <div className="progress-chart progress-chart--premium">
            <svg className="progress-chart__canvas" viewBox="0 0 644 220" role="img" aria-label="So‘nggi 7 kun progress grafigi">
              <defs>
                <linearGradient id="dashboardAreaGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.34" />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity="0.02" />
                </linearGradient>
                <linearGradient id="dashboardLineGradient" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0%" stopColor="#2563EB" />
                  <stop offset="48%" stopColor="#0EA5E9" />
                  <stop offset="100%" stopColor="#22D3EE" />
                </linearGradient>
                <filter id="dashboardLineShadow" x="-10%" y="-30%" width="120%" height="170%">
                  <feDropShadow dx="0" dy="10" floodColor="#2563EB" floodOpacity="0.22" stdDeviation="10" />
                </filter>
              </defs>

              <g className="progress-chart__grid">
                <line x1="16" x2="628" y1="42" y2="42" />
                <line x1="16" x2="628" y1="86" y2="86" />
                <line x1="16" x2="628" y1="132" y2="132" />
                <line x1="16" x2="628" y1="188" y2="188" />
              </g>

              <polygon points={chartArea} fill="url(#dashboardAreaGradient)" />
              <polyline
                points={chartPoints}
                fill="none"
                filter="url(#dashboardLineShadow)"
                stroke="url(#dashboardLineGradient)"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="8"
              />

              {chartPoints.split(" ").map((point, index) => {
                const [cx, cy] = point.split(",");

                return (
                  <g className="progress-chart__point" key={point}>
                    <circle cx={cx} cy={cy} r="9" />
                    <circle cx={cx} cy={cy} r="4" />
                    <text x={cx} y="212">{chartLabels[index]}</text>
                  </g>
                );
              })}
            </svg>

            <div className="progress-chart__metrics">
              {chartValues.map((value, index) => (
                <div key={`${value}-${chartLabels[index]}`}>
                  <span>{chartLabels[index]}</span>
                  <strong>{value}%</strong>
                </div>
              ))}
            </div>
          </div>
        </article>

        <ProgressCard title="Oxirgi test natijasi" value={68} caption="IELTS Reading mock test: 27/40" tone="green" />
      </div>
    </section>
  );
}

export default UserDashboardPage;
