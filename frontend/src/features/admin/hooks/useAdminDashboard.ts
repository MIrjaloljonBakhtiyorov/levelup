import { type FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";

import { isUnauthorizedError } from "../../../services/apiClient";
import { clearAdminToken, getAdminToken } from "../../auth/services/adminSession";
import { examSkills } from "../constants/adminNavigation";
import {
  loadStoredExamTests,
  saveStoredExamTests,
} from "../services/adminExamStorage";
import {
  deleteAdminUser,
  getAdminUsers,
  updateAdminUser,
  updateAdminUserStatus,
} from "../services/adminUsersApi";
import type { AdminUser, ExamSkill, ExamTest, UserStatus } from "../types/adminTypes";
import { createId } from "../utils/adminFormatters";

export function useAdminDashboard() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [tests, setTests] = useState<ExamTest[]>(() => loadStoredExamTests());
  const [selectedSkill, setSelectedSkill] = useState<ExamSkill>("Listening");
  const [formKey, setFormKey] = useState(0);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const token = getAdminToken();

  const stats = useMemo(() => {
    const active = users.filter((user) => user.status === "active").length;
    const blocked = users.length - active;
    return { total: users.length, active, inactive: blocked };
  }, [users]);

  const testCountsBySkill = useMemo(
    () =>
      examSkills.reduce(
        (counts, skill) => ({
          ...counts,
          [skill]: tests.filter((test) => test.skill === skill).length,
        }),
        {} as Record<ExamSkill, number>,
      ),
    [tests],
  );

  const selectedSkillTests = useMemo(
    () => tests.filter((test) => test.skill === selectedSkill),
    [selectedSkill, tests],
  );

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    getAdminUsers(token)
      .then((result) => setUsers(result.users || []))
      .catch((error: unknown) => {
        if (isUnauthorizedError(error)) {
          clearAdminToken();
          navigate("/login");
          return;
        }
        setMessage("Foydalanuvchilar ro'yxatini yuklab bo'lmadi");
      });
  }, [navigate, token]);

  useEffect(() => {
    saveStoredExamTests(tests);
  }, [tests]);

  async function updateStatus(userId: string, status: UserStatus, blockedUntil?: string) {
    if (!token) { navigate("/login"); return; }
    try {
      await updateAdminUserStatus(token, userId, status, blockedUntil);
      setUsers((cur) =>
        cur.map((u) => (u.id === userId ? { ...u, blockedUntil, status } : u)),
      );
      setMessage("");
    } catch {
      setMessage("Statusni o'zgartirib bo'lmadi");
    }
  }

  async function editUser(
    userId: string,
    data: { firstName: string; lastName: string; middleName: string; phoneNumber: string; email: string },
  ) {
    if (!token) { navigate("/login"); return; }
    try {
      const result = await updateAdminUser(token, userId, data);
      setUsers((cur) => cur.map((u) => (u.id === userId ? result.user : u)));
      setMessage("");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Ma'lumotlarni saqlashda xatolik";
      setMessage(msg);
      throw new Error(msg);
    }
  }

  async function removeUser(userId: string) {
    if (!token) { navigate("/login"); return; }
    try {
      await deleteAdminUser(token, userId);
      setUsers((cur) => cur.filter((u) => u.id !== userId));
      setMessage("");
    } catch {
      setMessage("Foydalanuvchini o'chirib bo'lmadi");
    }
  }

  function logout() {
    clearAdminToken();
    navigate("/login");
  }

  function selectSkill(skill: ExamSkill) {
    setSelectedSkill(skill);
    setMessage("");
    setFormKey((k) => k + 1);
    window.history.replaceState(null, "", `#Multilevel-${skill}`);
  }

  function addTest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const audioFile = formData.get("audioFile");

    if (!(audioFile instanceof File) || audioFile.size === 0) {
      setMessage("Audio faylni tanlang");
      return;
    }

    const newTest: ExamTest = {
      id: createId(),
      examType: "CEFR",
      skill: selectedSkill,
      testName: String(formData.get("testName") || "").trim(),
      testNumber: String(formData.get("testNumber") || "").trim(),
      level: String(formData.get("level") || "").trim(),
      audioFileName: audioFile.name,
      audioFileSize: audioFile.size,
      createdAt: new Date().toISOString(),
    };

    if (!newTest.testName || !newTest.testNumber || !newTest.level) {
      setMessage("Test nomi, raqami va levelni to'liq kiriting");
      return;
    }

    setTests((cur) => [newTest, ...cur]);
    setMessage("");
    event.currentTarget.reset();
    setFormKey((k) => k + 1);
  }

  return {
    addTest,
    editUser,
    formKey,
    logout,
    message,
    removeUser,
    selectSkill,
    selectedSkill,
    selectedSkillTests,
    stats,
    testCountsBySkill,
    tests,
    updateStatus,
    users,
  };
}
