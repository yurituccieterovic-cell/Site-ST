import { useState, useEffect, useCallback } from "react";
import { Loader2, RefreshCw, ChevronDown, ChevronRight, CheckCircle2, XCircle } from "lucide-react";

const API = import.meta.env.VITE_API_URL ?? "";

interface TestResult {
  name: string;
  ok: boolean;
  durationMs: number;
  detail?: string;
  error?: string;
}

interface LeucocitoReport {
  runAt: string;
  totalMs: number;
  passed: number;
  failed: number;
  results: TestResult[];
  summary: string;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function StatusBadge({ ok }: { ok: boolean }) {
  return ok
    ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium"><CheckCircle2 size={12} /> OK</span>
    : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-medium"><XCircle size={12} /> FALHA</span>;
}

function ReportRow({ report }: { report: LeucocitoReport }) {
  const [expanded, setExpanded] = useState(false);
  const allOk = report.failed === 0;

  return (
    <div className="border border-gray-200 rounded-lg mb-2 overflow-hidden">
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
      >
        {expanded ? <ChevronDown size={16} className="text-gray-400 flex-shrink-0" /> : <ChevronRight size={16} className="text-gray-400 flex-shrink-0" />}
        <span className="text-sm text-gray-500 w-36 flex-shrink-0">{formatDate(report.runAt)}</span>
        <StatusBadge ok={allOk} />
        <span className="text-sm text-gray-600 ml-2">
          {report.passed}/{report.passed + report.failed} testes OK
        </span>
        <span className="text-xs text-gray-400 ml-auto">{report.totalMs}ms</span>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
          {report.summary && (
            <p className="text-xs text-gray-500 mb-3 italic">{report.summary}</p>
          )}
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-500 text-left">
                <th className="pb-1 pr-4 font-medium">Teste</th>
                <th className="pb-1 pr-4 font-medium">Status</th>
                <th className="pb-1 pr-4 font-medium">Tempo</th>
                <th className="pb-1 font-medium">Detalhe</th>
              </tr>
            </thead>
            <tbody>
              {report.results.map((r, i) => (
                <tr key={i} className="border-t border-gray-100">
                  <td className="py-1 pr-4 text-gray-700">{r.name}</td>
                  <td className="py-1 pr-4"><StatusBadge ok={r.ok} /></td>
                  <td className="py-1 pr-4 text-gray-500">{r.durationMs}ms</td>
                  <td className="py-1 text-gray-500 max-w-xs truncate" title={r.detail ?? r.error ?? ""}>
                    {r.detail ?? r.error ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function AdmSaude() {
  const [history, setHistory] = useState<LeucocitoReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [runMsg, setRunMsg] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(`${API}/api/leucocito/history?limit=14`, { credentials: "include" });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json() as LeucocitoReport[];
      setHistory(data);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  async function runNow() {
    setRunning(true);
    setRunMsg(null);
    try {
      const r = await fetch(`${API}/api/leucocito/run`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sendEmail: false, force: true }),
      });
      if (r.status === 429) { setRunMsg("⏳ Rate limit — aguarde 30 min entre execuções"); return; }
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const report = await r.json() as LeucocitoReport;
      setRunMsg(`✅ Diagnóstico completo: ${report.passed}/${report.passed + report.failed} OK em ${report.totalMs}ms`);
      await loadHistory();
    } catch (e) {
      setRunMsg(`❌ Erro: ${String(e)}`);
    } finally {
      setRunning(false);
    }
  }

  const lastReport = history[0];
  const allOk = lastReport ? lastReport.failed === 0 : null;

  return (
    <div className="p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            🩺 Leucócito — Saúde do Sistema
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">Diagnóstico automático diário às 6h45 · Últimos 14 relatórios</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadHistory}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Atualizar
          </button>
          <button
            onClick={runNow}
            disabled={running}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-[#F97316] text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
          >
            {running ? <Loader2 size={14} className="animate-spin" /> : "▶"}
            Rodar agora
          </button>
        </div>
      </div>

      {/* Status atual */}
      {lastReport && (
        <div className={`rounded-lg p-4 mb-6 border ${allOk ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{allOk ? "✅" : "⚠️"}</span>
            <div>
              <p className="font-medium text-gray-800">
                {allOk ? "Sistema saudável" : `${lastReport.failed} teste(s) falhando`}
              </p>
              <p className="text-sm text-gray-500">
                Último diagnóstico: {formatDate(lastReport.runAt)} · {lastReport.passed}/{lastReport.passed + lastReport.failed} testes OK
              </p>
            </div>
          </div>
        </div>
      )}

      {runMsg && (
        <div className="rounded-lg p-3 mb-4 bg-blue-50 border border-blue-200 text-sm text-blue-700">
          {runMsg}
        </div>
      )}

      {/* Lista de relatórios */}
      {loading && (
        <div className="flex items-center gap-2 text-gray-500 py-8 justify-center">
          <Loader2 size={18} className="animate-spin" />
          <span>Carregando histórico...</span>
        </div>
      )}

      {error && (
        <div className="rounded-lg p-4 bg-red-50 border border-red-200 text-sm text-red-700">
          Erro ao carregar histórico: {error}
        </div>
      )}

      {!loading && !error && history.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-3">🩺</p>
          <p>Nenhum diagnóstico executado ainda.</p>
          <p className="text-sm mt-1">O cron roda às 6h45 ou clique em "Rodar agora".</p>
        </div>
      )}

      {!loading && history.map((r, i) => (
        <ReportRow key={i} report={r} />
      ))}
    </div>
  );
}
