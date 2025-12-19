"use client";

import { authClient } from "@/src/lib/auth-client";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { data: session, isPending, error } = authClient.useSession();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (navRef.current) {
      // Animación de entrada del navbar con transform en lugar de y
      gsap.fromTo(
        navRef.current,
        {
          transform: "translateY(-100%)",
          opacity: 0,
        },
        {
          transform: "translateY(0)",
          opacity: 1,
          duration: 0.6,
          ease: "power3.out",
        }
      );
    }
  }, []);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      setLogoutError(null);

      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/login");
            setTimeout(() => {
              window.location.href = "/login";
            }, 100);
          },
          onError: (ctx) => {
            console.error("Error al cerrar sesión:", ctx.error);
            setLogoutError("Error al cerrar sesión. Intenta de nuevo.");
            setIsLoggingOut(false);
          },
        },
      });
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      setLogoutError("Error inesperado al cerrar sesión");
      setIsLoggingOut(false);
    }
  };

  useEffect(() => {
    if (error) {
      console.error("Error de sesión:", error);
    }
  }, [error]);

  return (
    <div
      ref={navRef}
      className="navbar bg-base-100 shadow-lg px-4 sm:px-6 lg:px-15 sticky top-0 z-50 backdrop-blur-sm border-b border-base-300 transition-colors duration-200 pr-17"
    >
      {/* Logo / Brand */}
      <div className="flex-1">
        <Link href="/" className="btn btn-ghost text-xl font-bold">
          <span className="text-primary">🚀🚀🚀</span>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-none gap-2">
        {isPending ? (
          <div className="flex gap-2 items-center">
            <div className="skeleton h-10 w-20"></div>
            <div className="skeleton h-10 w-10 rounded-full"></div>
          </div>
        ) : session?.user ? (
          <>
            {/* User Dropdown */}
            <div className="dropdown dropdown-end">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-circle avatar"
                aria-label="Menú de usuario"
              >
                <div className="w-10 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                  {session.user.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || "Usuario"}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        e.currentTarget.parentElement!.innerHTML = `
                          <div class="bg-primary text-primary-content w-full h-full flex items-center justify-center text-xl font-bold">
                            ${session.user.name?.charAt(0).toUpperCase() || "U"}
                          </div>
                        `;
                      }}
                    />
                  ) : (
                    <div className="bg-primary text-primary-content w-full h-full flex items-center justify-center text-xl font-bold">
                      {session.user.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                  )}
                </div>
              </div>
              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow-lg bg-base-100 rounded-box w-64 border border-base-300"
              >
                {/* User Info */}
                <li className="menu-title">
                  <div className="flex flex-col gap-1 px-2 py-3">
                    <span className="font-bold text-base truncate text-base-content">
                      {session.user.name || "Usuario"}
                    </span>
                    <span className="text-xs text-base-content/60 truncate">
                      {session.user.email}
                    </span>
                  </div>
                </li>
                <li>
                  <div className="divider my-0"></div>
                </li>

                {/* Menu Items */}
                <li>
                  <Link href="/profile" className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                      />
                    </svg>
                    Mi Perfil
                  </Link>
                </li>
                <li>
                  <Link href="/TasksTable" className="flex items-center gap-2">
                    Programar Mes
                  </Link>
                </li>

                <li>
                  <div className="divider my-0"></div>
                </li>

                {/* Logout Error Message */}
                {logoutError && (
                  <li>
                    <div className="alert alert-error py-2 text-xs">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="stroke-current shrink-0 h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>{logoutError}</span>
                    </div>
                  </li>
                )}

                {/* Logout */}
                <li>
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex items-center gap-2 text-error hover:bg-error/10 disabled:opacity-50"
                  >
                    {isLoggingOut ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Cerrando sesión...
                      </>
                    ) : (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                          />
                        </svg>
                        Cerrar Sesión
                      </>
                    )}
                  </button>
                </li>
              </ul>
            </div>
          </>
        ) : (
          <div className="flex gap-2">
            <Link
              href="/login"
              className="btn btn-ghost btn-sm sm:btn-md text-base-content/70"
            >
              Iniciar Sesión
            </Link>
            <Link href="/register" className="btn btn-primary btn-sm sm:btn-md">
              Registrarse
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
