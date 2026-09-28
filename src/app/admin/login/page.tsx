import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { LoginForm } from "@/features/admin/login-form";
import "./admin-login.css";

export default function AdminLogin() {
  return (
    <main className="admin-login-page">
      <section className="admin-login-layout" aria-labelledby="admin-welcome-title">
        <header className="admin-login-hero">
          <div className="admin-login-brand"><BrandLogo /><span>ПАНЕЛЬ УПРАВЛЕНИЯ</span></div>
          <div className="admin-login-welcome">
            <span className="admin-login-eyebrow"><span aria-hidden="true" /> ДОБРО ПОЖАЛОВАТЬ</span>
            <h1 id="admin-welcome-title">С возвращением!</h1>
            <p>Управляйте меню, комбо, ценами и доставкой DIYOR BURGER в одном месте.</p>
          </div>
          <div className="admin-login-hero-detail" aria-hidden="true"><span>DB</span></div>
        </header>

        <section className="admin-login-panel" aria-labelledby="admin-login-form-title">
          <div className="admin-login-intro">
            <div className="admin-login-lock" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="5" y="10" width="14" height="11" rx="2" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
              </svg>
            </div>
            <span>ДОСТУП ДЛЯ СОТРУДНИКОВ</span>
            <h2 id="admin-login-form-title">Вход в админ-панель</h2>
            <p>Введите данные своей учётной записи, чтобы продолжить работу.</p>
          </div>

          <LoginForm />

          <div className="admin-login-help">
            <p>Нет доступа или забыли пароль? Обратитесь к владельцу ресторана.</p>
            <Link href="/">← Вернуться на сайт DIYOR BURGER</Link>
          </div>
        </section>
        <p className="admin-login-footer">DIYOR BURGER · Управление рестораном</p>
      </section>
    </main>
  );
}
