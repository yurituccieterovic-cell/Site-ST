const LAST_UPDATE = "2026-08-29";
const CONTACT = "contato@sociedadetucci.com.br";

export function AgeTermosPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#080c10", color: "#e2e8f0", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "3rem 1.5rem" }}>
        <a href="javascript:history.back()" style={{ color: "#2dd4bf", fontSize: 13, textDecoration: "none", display: "inline-block", marginBottom: 32 }}>
          ← Voltar
        </a>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <span style={{ fontSize: 32 }}>📋</span>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#2dd4bf" }}>Termos de Uso</h1>
            <div style={{ color: "#64748b", fontSize: 12 }}>Age · Sociedade Tucci · Atualizado em {LAST_UPDATE}</div>
          </div>
        </div>

        {[
          {
            title: "1. Aceitação",
            text: "Ao usar o Age, você concorda com estes Termos. Se não concordar, não utilize o serviço. Profissionais de saúde assumem responsabilidade pelo cumprimento das regulamentações de seus conselhos profissionais (CRM, CFP, CRN, etc.).",
          },
          {
            title: "2. Descrição do serviço",
            text: "O Age é um sistema de agenda e gestão de pacientes para profissionais de saúde. Oferece: agenda com horários configuráveis, cadastro de pacientes com aprovação manual, assistente SABIÁ para suporte operacional, e notificações por email. O Age NÃO é prontuário eletrônico, NÃO realiza diagnósticos e NÃO substitui avaliação clínica.",
          },
          {
            title: "3. SABIÁ — limitações obrigatórias",
            text: "A SABIÁ é assistente de agenda exclusivamente. Conforme Resolução CFP nº 11/2018 e regulamentações equivalentes de outros conselhos, é vedado ao profissional usar a SABIÁ para: emissão de laudos, triagem clínica de pacientes, tomada de decisões sobre tratamentos, ou qualquer função que substitua avaliação profissional. O profissional é o único responsável pelas decisões clínicas.",
          },
          {
            title: "4. Planos e preços",
            text: "O Age oferece plano gratuito com funcionalidades básicas e planos pagos com funcionalidades adicionais. Os preços vigentes estão disponíveis na página do produto. A Sociedade Tucci reserva-se o direito de alterar os preços com aviso prévio de 30 dias.",
          },
          {
            title: "5. Responsabilidades do profissional",
            text: "O profissional é responsável por: (a) manter seus dados de acesso seguros; (b) informar pacientes sobre o uso do sistema; (c) cumprir o sigilo profissional; (d) não inserir dados de saúde desnecessários; (e) manter contato de emergência alternativo ao Age para situações críticas.",
          },
          {
            title: "6. Limitação de responsabilidade",
            text: "A Sociedade Tucci não se responsabiliza por: falhas de conectividade ou indisponibilidade temporária do serviço; uso indevido das ferramentas pelo profissional; decisões clínicas tomadas com base em informações do sistema. Para emergências de saúde mental, mantenha sempre um canal de comunicação direto com o paciente fora do Age.",
          },
          {
            title: "7. Disponibilidade (SLA)",
            text: "O Age é fornecido em infraestrutura gratuita com SLA de melhor esforço. Não garantimos disponibilidade contínua. Recomendamos que profissionais mantenham método alternativo de contato com pacientes. Notificações de manutenção serão enviadas com antecedência quando possível.",
          },
          {
            title: "8. Privacidade e dados",
            text: "O tratamento de dados é regido pela nossa Política de Privacidade. A Sociedade Tucci e cada profissional firmam um DPA (Data Processing Agreement) que define as responsabilidades de cada parte no tratamento de dados pessoais e de saúde.",
          },
          {
            title: "9. Rescisão",
            text: "Qualquer parte pode encerrar o uso do Age a qualquer momento. Após o encerramento, os dados são mantidos por 90 dias para possibilidade de exportação, após o que são removidos definitivamente. A solicitação de exportação deve ser feita pelo email de contato.",
          },
          {
            title: "10. Contato e foro",
            text: `Dúvidas e suporte: ${CONTACT}. Foro eleito: comarca de São Paulo/SP. Lei aplicável: direito brasileiro.`,
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
