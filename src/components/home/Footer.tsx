/* components/Footer.tsx */
"use client";
import React from "react";
import { FiTwitter, FiGithub, FiLinkedin, FiMail } from "react-icons/fi";

export default function Footer() {
  return (
    <footer className="bg-base-200 mt-20">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg shadow-lg flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-primary-content"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
              </div>
              <span className="text-xl font-bold text-base-content">
                TaskFlow
              </span>
            </div>
            <p className="text-sm text-base-content/70 leading-relaxed">
              Organiza tu día con simplicidad y enfoque. La herramienta perfecta
              para lograr más.
            </p>
            <div className="flex gap-3">
              <a
                href="https://twitter.com"
                className="btn btn-circle btn-ghost btn-sm hover:btn-primary transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <FiTwitter size={18} />
              </a>
              <a
                href="https://github.com"
                className="btn btn-circle btn-ghost btn-sm hover:btn-primary transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <FiGithub size={18} />
              </a>
              <a
                href="https://linkedin.com"
                className="btn btn-circle btn-ghost btn-sm hover:btn-primary transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <FiLinkedin size={18} />
              </a>
              <a
                href="mailto:contact@taskflow.com"
                className="btn btn-circle btn-ghost btn-sm hover:btn-primary transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <FiMail size={18} />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold text-base-content mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-primary rounded-full"></div>
              Producto
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="/features"
                  className="link link-hover text-base-content/70 hover:text-primary transition-colors text-sm"
                >
                  Características
                </a>
              </li>
              <li>
                <a
                  href="/pricing"
                  className="link link-hover text-base-content/70 hover:text-primary transition-colors text-sm"
                >
                  Precios
                </a>
              </li>
              <li>
                <a
                  href="/integrations"
                  className="link link-hover text-base-content/70 hover:text-primary transition-colors text-sm"
                >
                  Integraciones
                </a>
              </li>
              <li>
                <a
                  href="/changelog"
                  className="link link-hover text-base-content/70 hover:text-primary transition-colors text-sm"
                >
                  Novedades
                </a>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold text-base-content mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-secondary rounded-full"></div>
              Compañía
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="/about"
                  className="link link-hover text-base-content/70 hover:text-secondary transition-colors text-sm"
                >
                  Acerca de
                </a>
              </li>
              <li>
                <a
                  href="/blog"
                  className="link link-hover text-base-content/70 hover:text-secondary transition-colors text-sm"
                >
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="/careers"
                  className="link link-hover text-base-content/70 hover:text-secondary transition-colors text-sm"
                >
                  Carreras
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  className="link link-hover text-base-content/70 hover:text-secondary transition-colors text-sm"
                >
                  Contacto
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-semibold text-base-content mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-accent rounded-full"></div>
              Newsletter
            </h3>
            <p className="text-sm text-base-content/70 mb-4">
              Recibe tips de productividad y novedades.
            </p>
            <div className="join w-full shadow-md">
              <input
                type="email"
                placeholder="tu@email.com"
                className="input input-bordered input-sm join-item w-full"
              />
              <button className="btn btn-primary btn-sm join-item">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </button>
            </div>
            <div className="form-control mt-2">
              <label className="label cursor-pointer justify-start gap-2">
                <input
                  type="checkbox"
                  className="checkbox checkbox-xs checkbox-primary"
                />
                <span className="label-text text-xs text-base-content/60">
                  Acepto recibir emails
                </span>
              </label>
            </div>
          </div>
        </div>

        <div className="divider my-0"></div>

        {/* Bottom Bar */}
        <div className="py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-base-content/70">
            <span>© {new Date().getFullYear()} TaskFlow.</span>
            <span className="hidden md:inline">•</span>
            <span>Todos los derechos reservados.</span>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="/terms"
              className="link link-hover text-sm text-base-content/70 hover:text-primary transition-colors"
            >
              Términos
            </a>
            <a
              href="/privacy"
              className="link link-hover text-sm text-base-content/70 hover:text-primary transition-colors"
            >
              Privacidad
            </a>
            <a
              href="/cookies"
              className="link link-hover text-sm text-base-content/70 hover:text-primary transition-colors"
            >
              Cookies
            </a>
            <div className="dropdown dropdown-top dropdown-end">
              <label tabIndex={0} className="btn btn-ghost btn-xs gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                  />
                </svg>
                ES
              </label>
              <ul
                tabIndex={0}
                className="dropdown-content menu p-2 shadow-xl bg-base-100 rounded-box w-32 border border-base-300"
              >
                <li>
                  <a className="text-sm">🇪🇸 Español</a>
                </li>
                <li>
                  <a className="text-sm">🇺🇸 English</a>
                </li>
                <li>
                  <a className="text-sm">🇫🇷 Français</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
