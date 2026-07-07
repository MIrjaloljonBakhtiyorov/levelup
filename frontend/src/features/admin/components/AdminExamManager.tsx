import type { FormEvent } from "react";

import { examSkills, levelOptions } from "../constants/adminNavigation";
import type { ExamSkill, ExamTest } from "../types/adminTypes";
import { formatDate, formatFileSize } from "../utils/adminFormatters";
import AdminSectionTitle from "./AdminSectionTitle";

type AdminExamManagerProps = {
  formKey: number;
  selectedSkill: ExamSkill;
  selectedSkillTests: ExamTest[];
  testCountsBySkill: Record<ExamSkill, number>;
  totalTests: number;
  onAddTest: (event: FormEvent<HTMLFormElement>) => void;
  onSelectSkill: (skill: ExamSkill) => void;
};

function AdminExamManager({
  formKey,
  selectedSkill,
  selectedSkillTests,
  testCountsBySkill,
  totalTests,
  onAddTest,
  onSelectSkill,
}: AdminExamManagerProps) {
  return (
    <section className="admin-exams" id="exams">
      <AdminSectionTitle
        title="Imtihon testlari"
        description={`${selectedSkill} bo‘limi uchun test qo‘shish oynasi ochiq.`}
        meta={`${totalTests} ta test`}
      />

      <div className="admin-exam-layout">
        <div className="admin-exam-tabs" role="tablist" aria-label="Test bo‘limlari">
          {examSkills.map((skill) => (
            <button
              className={skill === selectedSkill ? "is-active" : ""}
              key={skill}
              type="button"
              onClick={() => onSelectSkill(skill)}
            >
              <span>{skill}</span>
              <strong>{testCountsBySkill[skill]}</strong>
            </button>
          ))}
        </div>

        <form className="admin-test-form" onSubmit={onAddTest}>
          <div className="admin-form-header">
            <span>Test qo‘shish</span>
            <h3>{selectedSkill}</h3>
          </div>

          <label>
            Test nomi
            <input
              name="testName"
              placeholder="Masalan: Multilevel Listening"
              type="text"
            />
          </label>

          <div className="admin-form-grid">
            <label>
              Test raqami
              <input name="testNumber" placeholder="01" type="number" min="1" />
            </label>

            <label>
              Level
              <select name="level" defaultValue="">
                <option value="" disabled>
                  Tanlang
                </option>
                {levelOptions.map((level) => (
                  <option value={level} key={level}>
                    {level}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="admin-file-upload">
            Test audiosi
            <input accept="audio/*" key={formKey} name="audioFile" type="file" />
            <span>MP3, WAV yoki boshqa audio fayl tanlang</span>
          </label>

          <button type="submit">Test qo‘shish</button>
        </form>

        <div className="admin-test-list">
          <div className="admin-test-list__header">
            <h3>{selectedSkill} testlari</h3>
            <span>{selectedSkillTests.length} ta</span>
          </div>

          {selectedSkillTests.map((test) => (
            <article className="admin-test-card" key={test.id}>
              <div>
                <span>Test #{test.testNumber}</span>
                <h4>{test.testName}</h4>
              </div>
              <strong>{test.level}</strong>
              <p>
                {test.audioFileName} · {formatFileSize(test.audioFileSize)}
              </p>
              <small>{formatDate(test.createdAt)}</small>
            </article>
          ))}

          {selectedSkillTests.length === 0 && (
            <div className="admin-test-empty">
              <strong>{selectedSkill} uchun test yo‘q</strong>
              <span>Test qo‘shish formasi orqali birinchi testni yuklang.</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default AdminExamManager;
