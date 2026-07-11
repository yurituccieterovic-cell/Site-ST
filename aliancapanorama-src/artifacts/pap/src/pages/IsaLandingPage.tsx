/**
 * ISA PAP — Landing Page pública
 * "Login para salvar seus estudos?" / "Download app pra eu te ajudar nos seus estudos"
 * SEO básico incluído inline.
 */
export function IsaLandingPage() {
  return (
    <div className="min-h-screen bg-[#080c18] text-gray-100 font-sans flex flex-col">
      {/* SEO */}
      <title>ISA PAP | Plataforma inteligente para estudos com IA</title>
      <meta name="description" content="Estude com inteligência artificial, salve seu progresso, organize por disciplina e continue aprendendo de onde parou. ISA PAP — sua tutora IA."/>
      <meta name="keywords" content="ISA PAP, estudos com IA, aprendizagem inteligente, educação, resumos automáticos, revisão espaçada, salvar estudo, FUVEST, vestibular IA"/>
      <meta property="og:title" content="ISA PAP | Estude com uma IA que lembra junto com você"/>
      <meta property="og:description" content="Login para salvar seus estudos? Baixe o app ISA PAP e continue de onde parou a qualquer momento."/>

      {/* Hero */}
      <div className="flex flex-col items-center justify-center flex-1 px-6 pt-16 pb-8 text-center">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-600 to-cyan-600 flex items-center justify-center mb-6 shadow-xl border-2 border-violet-500/40">
          <span className="text-4xl">📚</span>
        </div>
        <div className="text-violet-400 font-bold text-xs tracking-widest uppercase mb-2">ISA · PAP · Sociedade Tucci</div>
        <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-3">
          Login para salvar<br/>seus estudos?
        </h1>
        <p className="text-gray-400 text-sm md:text-base max-w-md mb-8">
          Continue exatamente do ponto onde parou. A ISA lembra de tudo — suas dificuldades, seu progresso, sua próxima revisão.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4 w-full max-w-sm">
          <a href="/portal"
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-lg text-sm transition-colors shadow-lg">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
            Entrar e estudar
          </a>
          <a href="https://sociedadetucci.com.br" target="_blank" rel="noreferrer"
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg text-sm transition-colors shadow-lg">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Download App ISA PAP →
          </a>
        </div>
        <p className="text-gray-600 text-xs">App ISA PAP · para te ajudar nos seus estudos</p>
      </div>

      {/* Como funciona */}
      <div className="border-t border-gray-800 px-6 py-10">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-center text-gray-300 font-semibold text-base mb-6">Como funciona</h2>
          <div className="grid grid-cols-3 gap-4 text-center mb-8">
            {[
              { n:"1", t:"Login", d:"Crie sua conta e personalize seu perfil de estudos" },
              { n:"2", t:"Estude", d:"A ISA te guia, explica, questiona e reforça" },
              { n:"3", t:"Progride", d:"Revisão espaçada automática · histórico completo" },
            ].map(s => (
              <div key={s.n} className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-violet-900/60 border border-violet-700/50 text-violet-400 flex items-center justify-center text-sm font-bold">{s.n}</div>
                <div className="text-white text-xs font-semibold">{s.t}</div>
                <div className="text-gray-500 text-xs">{s.d}</div>
              </div>
            ))}
          </div>

          {/* Features */}
          <h2 className="text-center text-gray-300 font-semibold text-base mb-4">O que você ganha</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-8">
            {[
              "📖 Histórico por disciplina",
              "🔁 Continue de onde parou",
              "🧩 Flashcards automáticos",
              "📝 Resumos gerados pela IA",
              "🗓️ Cronograma de estudos",
              "📊 Simulados e exercícios",
              "📈 Histórico de aprendizagem",
              "🧠 IA tutora personalizada",
              "🔄 Revisão espaçada",
              "📚 Bibliografia curada",
              "⭐ Favoritos e anotações",
              "📤 Exportar PDF/Markdown",
            ].map(f => (
              <div key={f} className="flex items-center gap-2 bg-gray-900/50 border border-gray-800 rounded-lg px-3 py-2 text-xs text-gray-300">{f}</div>
            ))}
          </div>

          {/* FAQ */}
          <h2 className="text-center text-gray-300 font-semibold text-base mb-4">Perguntas frequentes</h2>
          <div className="space-y-3 mb-8">
            {[
              { q:"Como a ISA me ajuda nos estudos?", a:"A ISA usa seu histórico de conversas para criar resumos automáticos, sugerir revisões e adaptar as explicações ao seu nível." },
              { q:"Posso continuar depois?", a:"Sim. Seu progresso é salvo automaticamente e você continua de onde parou em qualquer dispositivo." },
              { q:"É gratuito?", a:"Sim. Acesso básico gratuito. Planos avançados disponíveis para quem quer ir mais fundo." },
              { q:"Funciona para qualquer matéria?", a:"Sim. A ISA cobre todas as áreas — de matemática a filosofia, de física a literatura." },
            ].map(faq => (
              <div key={faq.q} className="bg-gray-900/40 border border-gray-800 rounded-lg px-4 py-3">
                <div className="text-white text-xs font-semibold mb-1">{faq.q}</div>
                <div className="text-gray-400 text-xs">{faq.a}</div>
              </div>
            ))}
          </div>

          {/* CTA final */}
          <div className="text-center">
            <a href="/portal"
              className="inline-flex items-center gap-2 px-8 py-3 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-lg text-sm transition-colors shadow-lg">
              Começar a estudar agora
            </a>
            <p className="text-gray-600 text-xs mt-3">ISA PAP · IA tutora · Sociedade Tucci</p>
          </div>
        </div>
      </div>
    </div>
  );
}
