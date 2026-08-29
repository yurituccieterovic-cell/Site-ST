const LAST_UPDATE = "2026-08-29";
const CONTACT = "contato@sociedadetucci.com.br";

export function AgePrivacidadePage() {
  return (
    <div style={{ minHeight: "100vh", background: "#080c10", color: "#e2e8f0", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "3rem 1.5rem" }}>
        <a href="javascript:history.back()" style={{ color: "#2dd4bf", fontSize: 13, textDecoration: "none", display: "inline-block", marginBottom: 32 }}>
          ← Voltar
        </a>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <span style={{ fontSize: 32 }}>🐦</span>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#2dd4bf" }}>Política de Privacidade</h1>
            <div style={{ color: "#64748b", fontSize: 12 }}>Age · Sociedade Tucci · Atualizado em {LAST_UPDATE}</div>
          </div>
        </div>

        <div style={{ background: "#0c1a12", border: "1px solid #4ade8033", borderRadius: 8, padding: "12px 16px", marginBottom: 32, fontSize: 12, color: "#6b8f6b" }}>
          O Age atua como <strong>processador de dados</strong> a serviço do profissional de saúde (controlador). O tratamento de dados de saúde segue a LGPD art. 11 (categoria especial) e a Resolução CFP nº 11/2018.
        </div>

        {[
          {
            title: "1. Quem somos",
            text: "O Age é um sistema de agenda e gestão de pacientes desenvolvido pela Sociedade Tucci. O profissional de saúde que utiliza o Age é o controlador dos dados dos seus pacientes; a Sociedade Tucci atua como operadora/processadora, conforme LGPD (Lei 13.709/2018).",
          },
          {
            title: "2. Dados coletados",
            text: "Do paciente: nome completo, endereço de email, telefone (opcional), data e horário de consulta, canal (presencial ou online), observações fornecidas voluntariamente. Do profissional: email e senha (armazenada com hash bcrypt), IP de acesso, horários de trabalho definidos pelo próprio profissional.",
          },
          {
            title: "3. Finalidade e base legal",
            text: "Os dados são usados exclusivamente para: (a) gestão da agenda do profissional; (b) comunicação de confirmações e lembretes de consulta; (c) vínculo clínico entre paciente e profissional. Base legal: consentimento do titular (art. 7º, I e art. 11, I) e execução de contrato (art. 7º, V).",
          },
          {
            title: "4. Dados de saúde — categoria especial",
            text: "O sistema registra o vínculo clínico (paciente de um profissional de saúde), o que pode configurar dado de saúde (LGPD art. 11). Não há prontuário eletrônico nem registro de diagnósticos. O consentimento é coletado explicitamente no cadastro. O profissional é responsável pelo cumprimento do sigilo clínico em seu âmbito.",
          },
          {
            title: "5. SABIÁ — assistente de agenda",
            text: "A SABIÁ é uma IA de suporte administrativo. Ela NÃO emite laudos, NÃO realiza triagem clínica e NÃO toma decisões sobre pacientes. A memória da SABIÁ registra apenas preferências operacionais do profissional (ex: duração padrão de consultas), nunca informações clínicas dos pacientes. Conforme Resolução CFP nº 11/2018.",
          },
          {
            title: "6. Compartilhamento",
            text: "Os dados NÃO são compartilhados com terceiros para fins comerciais. Podemos usar provedores de infraestrutura (hospedagem em nuvem, email transacional) sob obrigação contratual de confidencialidade. Não vendemos dados.",
          },
          {
            title: "7. Retenção e exclusão",
            text: "Dados de pacientes são mantidos enquanto o vínculo clínico estiver ativo. O profissional pode solicitar a exclusão de qualquer dado pelo painel. Adotamos soft delete (dados não são destruídos imediatamente, preservando integridade de registros históricos por até 90 dias após solicitação).",
          },
          {
            title: "8. Segurança",
            text: "Senhas armazenadas com bcrypt (custo 12). Comunicação via HTTPS/TLS. Autenticação por sessão segura com expiração. Acesso ao banco restrito por credenciais de ambiente. O acesso técnico da Sociedade Tucci aos dados é regido por DPA (Data Processing Agreement) firmado com cada profissional cliente.",
          },
          {
            title: "9. Seus direitos (LGPD art. 18)",
            text: "Você tem direito a: confirmação de tratamento, acesso aos dados, correção, anonimização/bloqueio/eliminação, portabilidade, revogação de consentimento e oposição. Para exercer seus direitos, entre em contato pelo email abaixo.",
          },
          {
            title: "10. Contato",
            text: `Dúvidas, solicitações de exclusão ou exercício de direitos: ${CONTACT}. Respondemos em até 15 dias úteis.`,
          },
        ].map(s => (
          <section key={s.title} style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#2dd4bf", marginBottom: 8 }}>{s.title}</h2>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: "#94a3b8", margin: 0 }}>{s.text}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
