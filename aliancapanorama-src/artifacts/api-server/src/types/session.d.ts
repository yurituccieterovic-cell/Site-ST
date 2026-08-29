import "express-session";

declare module "express-session" {
  interface SessionData {
    userId?: number;
    userLogin?: string;
    userTier?: number;
    admVerified?: boolean;
    admPin?: string;
    admPinExpiry?: number;
    admPinUserId?: number;
    rapaduraUserId?: number;
    rapaduraRole?: string;
    rapaduraNome?: string;
    // Age — profissional
    ageProfessionalId?: number;
    ageProfessionalSlug?: string;
    ageProfessionalNome?: string;
    // Age — paciente
    agePatientId?: number;
    agePatientSlug?: string;
    agePatientNome?: string;
  }
}
