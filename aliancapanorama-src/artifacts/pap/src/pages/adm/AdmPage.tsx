import { useState } from "react";
import { AdmEventos } from "./AdmEventos";
import { AdmRelacoes } from "./AdmRelacoes";
import { AdmTipos } from "./AdmTipos";
import { AdmCatalogos } from "./AdmCatalogos";
import { IsaChat } from "./IsaChat";

type AdmTab = "eventos" | "relacoes" | "tipos" | "catalogos";

const TABS: { id: AdmTab; label: string; emoji: string }[] = [
  { id: "eventos", label: "Eventos", emoji: "⚡" },
  { id: "relacoes", label: "Relações", emoji: "🔗" },
  { id: "tipos", label: "Tipos de Evento", emoji: "🏷️" },
  { id: "catalogos", label: "Catálogos", emoji: "📚" },
];

export function AdmPage() {
  const [activeTab, setActiveTab] = useState<AdmTab>("eventos");
  const [isaOpen, setIsaOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-gray-900 font-sans">
      {/* Header */}
      <div className="bg-white border-b border-[#E5E7EB] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🦉</span>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">PAP — Administração</h1>
            <p className="text-xs text-gray-500">Projeto Aliança Panorama · Sociedade Tucci</p>
          </div>
        </div>
        <button
          onClick={() => setIsaOpen(!isaOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-[#F97316] text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
        >
          <span>🦉</span>
          <span>Falar com ISA</span>
          {isaOpen && <span className="w-2 h-2 bg-green-400 rounded-full" />}
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-[#E5E7EB] px-6">
        <div className="flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-[#F97316] text-[#F97316]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <span>{tab.emoji}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex h-[calc(100vh-120px)]">
        <div className={`flex-1 overflow-auto transition-all ${isaOpen ? "pr-0" : ""}`}>
          {activeTab === "eventos" && <AdmEventos />}
          {activeTab === "relacoes" && <AdmRelacoes />}
          {activeTab === "tipos" && <AdmTipos />}
          {activeTab === "catalogos" && <AdmCatalogos />}
        </div>
        {isaOpen && (
          <div className="w-96 border-l border-[#E5E7EB] bg-white flex-shrink-0">
            <IsaChat onClose={() => setIsaOpen(false)} />
          </div>
        )}
      </div>
    </div>
  );
}
