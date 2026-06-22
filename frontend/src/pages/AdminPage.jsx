import { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api";
import FaqManager, {
  ContactManager,
  DateManager,
  CategoryManager,
} from "./admin/Managers";
import ErrorBoundary from "../components/ErrorBoundary";

const TABS = [
  { id: "faqs", label: "FAQs" },
  { id: "categories", label: "Categories" },
  { id: "contacts", label: "Contacts" },
  { id: "dates", label: "Dates" },
  { id: "stats", label: "Stats" },
];

export default function AdminPage() {
  const { admin, loading, logout, isAuthenticated } = useAuth();

  const [tab, setTab] = useState("faqs");
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    api
      .getCategories()
      .then(setCategories)
      .catch((err) => {
        console.error("Failed to load categories:", err);
      });

    if (tab === "stats") {
      api
        .getStats()
        .then(setStats)
        .catch((err) => {
          console.error("Failed to load stats:", err);
        });
    }
  }, [isAuthenticated, tab]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              BIET Bot Admin
            </h1>
            <p className="text-sm text-slate-500">
              Logged in as {admin?.email}
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              to="/"
              className="px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50"
            >
              View Chat
            </Link>

            <button
              onClick={logout}
              className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                tab === t.id
                  ? "bg-blue-600 text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-slate-50 rounded-xl p-4">
          {tab === "faqs" && (
            <ErrorBoundary>
              <FaqManager categories={categories} />
            </ErrorBoundary>
          )}

          {tab === "categories" && (
            <ErrorBoundary>
              <CategoryManager />
            </ErrorBoundary>
          )}

          {tab === "contacts" && (
            <ErrorBoundary>
              <ContactManager />
            </ErrorBoundary>
          )}

          {tab === "dates" && (
            <ErrorBoundary>
              <DateManager />
            </ErrorBoundary>
          )}

          {tab === "stats" && (
            <ErrorBoundary>
              <div>
                <h2 className="text-lg font-semibold mb-4">
                  Chat Analytics
                </h2>

                {stats ? (
                  <>
                    <div className="grid sm:grid-cols-3 gap-4 mb-6">
                      <div className="bg-white rounded-lg p-4 border">
                        <p className="text-2xl font-bold text-blue-600">
                          {stats.totalChats ?? 0}
                        </p>
                        <p className="text-sm text-slate-500">
                          Total Messages
                        </p>
                      </div>

                      <div className="bg-white rounded-lg p-4 border">
                        <p className="text-2xl font-bold text-green-600">
                          {stats.matchedChats ?? 0}
                        </p>
                        <p className="text-sm text-slate-500">
                          FAQ Matches
                        </p>
                      </div>

                      <div className="bg-white rounded-lg p-4 border">
                        <p className="text-2xl font-bold text-indigo-600">
                          {stats.matchRate ?? 0}%
                        </p>
                        <p className="text-sm text-slate-500">
                          Match Rate
                        </p>
                      </div>
                    </div>

                    {stats.recentLogs?.length > 0 && (
                      <div className="space-y-2">
                        <h3 className="font-medium text-slate-700">
                          Recent Questions
                        </h3>

                        {stats.recentLogs.map((log) => (
                          <div
                            key={log.id}
                            className="bg-white border rounded-lg p-3 text-sm"
                          >
                            <p className="font-medium text-slate-800">
                              {log.userMessage}
                            </p>

                            <p className="text-slate-500 text-xs mt-1 truncate">
                              {log.botResponse?.slice?.(0, 100) ||
                                "No response"}
                              ...
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-slate-500">Loading stats...</p>
                )}
              </div>
            </ErrorBoundary>
          )}
        </div>
      </div>
    </div>
  );
}