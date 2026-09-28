"use client";

import { useActionState, useState } from "react";
import { loginAdmin, type LoginState } from "./actions";

const initial: LoginState = {};

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAdmin, initial);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={action} className="admin-login-form" aria-busy={pending}>
      <div className="admin-login-field">
        <label htmlFor="admin-login-email">Email администратора</label>
        <div className="admin-login-input-wrap">
          <span className="admin-login-input-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="5" width="18" height="14" rx="3" />
              <path d="m4 7 8 6 8-6" />
            </svg>
          </span>
          <input
            id="admin-login-email"
            name="email"
            type="email"
            autoComplete="username"
            inputMode="email"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="Например, admin@restaurant.tj"
            required
            disabled={pending}
            aria-invalid={Boolean(state.error)}
            aria-describedby={state.error ? "admin-login-error" : "admin-email-hint"}
          />
        </div>
        <small id="admin-email-hint">Укажите email, на который зарегистрирован доступ администратора.</small>
      </div>

      <div className="admin-login-field">
        <label htmlFor="admin-login-password">Пароль</label>
        <div className="admin-login-input-wrap">
          <span className="admin-login-input-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="10" width="14" height="11" rx="2" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            </svg>
          </span>
          <input
            id="admin-login-password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Введите пароль"
            required
            disabled={pending}
            aria-invalid={Boolean(state.error)}
            aria-describedby={state.error ? "admin-login-error" : undefined}
          />
          <button
            type="button"
            className="admin-login-password-toggle"
            onClick={() => setShowPassword(value => !value)}
            aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
            aria-pressed={showPassword}
            disabled={pending}
          >{showPassword ? "Скрыть" : "Показать"}</button>
        </div>
      </div>

      {state.error && <div id="admin-login-error" className="admin-login-error" role="alert">
        <span aria-hidden="true">!</span><p>{state.error}</p>
      </div>}

      <button className="admin-login-submit" type="submit" disabled={pending}>
        <span>{pending ? "Проверяем данные…" : "Войти в админ-панель"}</span>
        {pending ? <span className="admin-login-spinner" aria-hidden="true" /> :
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14m-6-6 6 6-6 6" />
          </svg>}
      </button>
      <p className="admin-login-secure"><span aria-hidden="true">◆</span> Защищённый вход для персонала ресторана</p>
    </form>
  );
}
