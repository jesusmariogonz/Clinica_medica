// Tipos manuales alineados a supabase/migrations/0001_init.sql y 0002_auth_storage.sql.
// Reemplazar por `supabase gen types typescript` una vez exista un proyecto
// Supabase real vinculado, para mantenerlos sincronizados automáticamente.

export type UserRole = "medico" | "asistente" | "paciente";
export type CitaEstado = "pendiente" | "confirmada" | "cancelada" | "completada" | "no_asistio";
export type PagoEstado = "pendiente" | "aprobado" | "rechazado" | "reembolsado";
export type PagoMetodo = "stripe" | "mercadopago" | "efectivo";
export type DocumentoTipo = "identificacion" | "estudio" | "consentimiento_firmado" | "receta" | "otro";
export type ConsentimientoTipo = "tratamiento_general" | "aviso_privacidad" | "procedimiento_especifico";

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          role: UserRole;
          email: string;
          nombre: string;
          telefono: string | null;
          mfa_enabled: boolean;
          creado_en: string;
        };
        Insert: Partial<Database["public"]["Tables"]["users"]["Row"]> & {
          id: string;
          email: string;
          nombre: string;
        };
        Update: Partial<Database["public"]["Tables"]["users"]["Row"]>;
        Relationships: [];
      };
      pacientes: {
        Row: {
          id: string;
          user_id: string | null;
          nombre: string;
          apellido_paterno: string;
          apellido_materno: string | null;
          fecha_nacimiento: string;
          sexo: string | null;
          curp: string | null;
          telefono: string | null;
          email: string | null;
          direccion: string | null;
          contacto_emergencia_nombre: string | null;
          contacto_emergencia_telefono: string | null;
          creado_en: string;
          creado_por: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["pacientes"]["Row"]> & {
          nombre: string;
          apellido_paterno: string;
          fecha_nacimiento: string;
        };
        Update: Partial<Database["public"]["Tables"]["pacientes"]["Row"]>;
        Relationships: [];
      };
      expedientes_clinicos: {
        Row: {
          id: string;
          paciente_id: string;
          antecedentes_heredofamiliares: string | null;
          antecedentes_patologicos: string | null;
          antecedentes_no_patologicos: string | null;
          creado_en: string;
          actualizado_en: string;
        };
        Insert: Partial<Database["public"]["Tables"]["expedientes_clinicos"]["Row"]> & {
          paciente_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["expedientes_clinicos"]["Row"]>;
        Relationships: [];
      };
      notas_clinicas: {
        Row: {
          id: string;
          expediente_id: string;
          autor_id: string;
          padre_id: string | null;
          version: number;
          padecimiento_actual: string | null;
          exploracion_fisica: string | null;
          contenido: string;
          fecha: string;
          firmada: boolean;
          firmada_en: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["notas_clinicas"]["Row"]> & {
          expediente_id: string;
          autor_id: string;
          contenido: string;
        };
        Update: Partial<Database["public"]["Tables"]["notas_clinicas"]["Row"]>;
        Relationships: [];
      };
      documentos: {
        Row: {
          id: string;
          paciente_id: string;
          tipo: DocumentoTipo;
          storage_path: string;
          subido_por: string;
          subido_en: string;
          descripcion: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["documentos"]["Row"]> & {
          paciente_id: string;
          tipo: DocumentoTipo;
          storage_path: string;
          subido_por: string;
        };
        Update: Partial<Database["public"]["Tables"]["documentos"]["Row"]>;
        Relationships: [];
      };
      consentimientos: {
        Row: {
          id: string;
          paciente_id: string;
          tipo: ConsentimientoTipo;
          texto_version: string;
          firmado_en: string | null;
          firma_digital_hash: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["consentimientos"]["Row"]> & {
          paciente_id: string;
          tipo: ConsentimientoTipo;
          texto_version: string;
        };
        Update: Partial<Database["public"]["Tables"]["consentimientos"]["Row"]>;
        Relationships: [];
      };
      servicios: {
        Row: {
          id: string;
          nombre: string;
          descripcion: string | null;
          precio: number;
          anticipo_requerido: number;
          duracion_minutos: number;
          activo: boolean;
          creado_en: string;
        };
        Insert: Partial<Database["public"]["Tables"]["servicios"]["Row"]> & {
          nombre: string;
          precio: number;
          duracion_minutos: number;
        };
        Update: Partial<Database["public"]["Tables"]["servicios"]["Row"]>;
        Relationships: [];
      };
      citas: {
        Row: {
          id: string;
          paciente_id: string;
          servicio_id: string;
          fecha_hora: string;
          estado: CitaEstado;
          requiere_anticipo: boolean;
          anticipo_pagado: boolean;
          creado_en: string;
          creado_por: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["citas"]["Row"]> & {
          paciente_id: string;
          servicio_id: string;
          fecha_hora: string;
        };
        Update: Partial<Database["public"]["Tables"]["citas"]["Row"]>;
        Relationships: [];
      };
      pagos: {
        Row: {
          id: string;
          cita_id: string;
          monto: number;
          metodo: PagoMetodo;
          stripe_payment_id: string | null;
          mp_payment_id: string | null;
          estado: PagoEstado;
          creado_en: string;
        };
        Insert: Partial<Database["public"]["Tables"]["pagos"]["Row"]> & {
          cita_id: string;
          monto: number;
          metodo: PagoMetodo;
        };
        Update: Partial<Database["public"]["Tables"]["pagos"]["Row"]>;
        Relationships: [];
      };
      bitacora_auditoria: {
        Row: {
          id: string;
          usuario_id: string | null;
          accion: string;
          entidad_afectada: string;
          entidad_id: string | null;
          timestamp: string;
          ip: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["bitacora_auditoria"]["Row"]> & {
          accion: string;
          entidad_afectada: string;
        };
        Update: Partial<Database["public"]["Tables"]["bitacora_auditoria"]["Row"]>;
        Relationships: [];
      };
    };
    Functions: {
      set_user_role: {
        Args: { p_user_id: string; p_role: UserRole };
        Returns: void;
      };
      set_mfa_enabled: {
        Args: { p_enabled: boolean };
        Returns: void;
      };
      log_auditoria: {
        Args: {
          p_accion: string;
          p_entidad_afectada: string;
          p_entidad_id: string | null;
          p_ip?: string | null;
        };
        Returns: void;
      };
    };
    Views: Record<string, never>;
    Enums: {
      user_role: UserRole;
      cita_estado: CitaEstado;
      pago_estado: PagoEstado;
      pago_metodo: PagoMetodo;
      documento_tipo: DocumentoTipo;
      consentimiento_tipo: ConsentimientoTipo;
    };
    CompositeTypes: Record<string, unknown>;
  };
}
