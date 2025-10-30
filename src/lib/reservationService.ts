import { supabase } from './supabaseClient';

export interface ReservationData {
  nombreCompleto: string;
  email: string;
  dni: string;
  celular: string;
  sucursalId: number;
  sucursalNombre: string;
  fecha: Date;
  codigo?: string;
}

export interface CodeData {
  id: string;
  codigo: string;
  usado: boolean;
  fecha_creacion: string;
  fecha_uso?: string;
  usuario_dni?: string;
}

// Función para generar código único
const generateUniqueCode = (): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// Función para verificar si un DNI ya existe
export const checkDNIExists = async (dni: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('reservas')
      .select('dni')
      .eq('dni', dni)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error checking DNI:', error);
      return false;
    }

    return !!data; // Si data existe, el DNI ya está registrado
  } catch (error) {
    console.error('Error checking DNI:', error);
    return false;
  }
};

// Función para obtener un código disponible
export const getAvailableCode = async (): Promise<string | null> => {
  try {
    // Buscar un código no usado
    const { data, error } = await supabase
      .from('codigos')
      .select('id, codigo')
      .eq('usado', false)
      .limit(1)
      .single();

    if (error) {
      console.error('Error getting available code:', error);
      return null;
    }

    if (!data) {
      console.log('No hay códigos disponibles');
      return null;
    }

    return data.codigo;
  } catch (error) {
    console.error('Error getting available code:', error);
    return null;
  }
};

// Función para marcar un código como usado
export const markCodeAsUsed = async (codigo: string, dni: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('codigos')
      .update({ 
        usado: true, 
        fecha_uso: new Date().toISOString(),
        usuario_dni: dni
      })
      .eq('codigo', codigo);

    if (error) {
      console.error('Error marking code as used:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error marking code as used:', error);
    return false;
  }
};

// Función para crear una reserva
export const createReservation = async (reservationData: ReservationData): Promise<{ success: boolean; codigo?: string; error?: string }> => {
  try {
    // 1. Verificar si el DNI ya existe
    const dniExists = await checkDNIExists(reservationData.dni);
    if (dniExists) {
      return {
        success: false,
        error: 'Este DNI ya ha sido registrado. Solo se permite una reserva por persona.'
      };
    }

    // 2. Obtener un código disponible
    const codigo = await getAvailableCode();
    if (!codigo) {
      return {
        success: false,
        error: 'Lo sentimos, no hay códigos disponibles en este momento. Intenta más tarde.'
      };
    }

    // 3. Crear la reserva
    const { error: reservationError } = await supabase
      .from('reservas')
      .insert({
        nombre_completo: reservationData.nombreCompleto,
        email: reservationData.email,
        dni: reservationData.dni,
        celular: reservationData.celular,
        sucursal_id: reservationData.sucursalId,
        sucursal_nombre: reservationData.sucursalNombre,
        fecha_reserva: reservationData.fecha.toISOString(),
        codigo: codigo,
        fecha_creacion: new Date().toISOString()
      });

    if (reservationError) {
      console.error('Error creating reservation:', reservationError);
      return {
        success: false,
        error: 'Error al crear la reserva. Intenta nuevamente.'
      };
    }

    // 4. Marcar el código como usado
    const codeMarked = await markCodeAsUsed(codigo, reservationData.dni);
    if (!codeMarked) {
      console.error('Error marking code as used');
      // Aquí podrías implementar una lógica de rollback si es necesario
    }

    return {
      success: true,
      codigo: codigo
    };

  } catch (error) {
    console.error('Error in createReservation:', error);
    return {
      success: false,
      error: 'Error interno del servidor. Intenta nuevamente.'
    };
  }
};

// Función para inicializar códigos (solo para administración)
export const initializeCodes = async (): Promise<boolean> => {
  try {
    const codes = [];
    for (let i = 0; i < 300; i++) {
      codes.push({
        codigo: generateUniqueCode(),
        usado: false,
        fecha_creacion: new Date().toISOString()
      });
    }

    const { error } = await supabase
      .from('codigos')
      .insert(codes);

    if (error) {
      console.error('Error initializing codes:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error initializing codes:', error);
    return false;
  }
};

// Función para obtener estadísticas (solo para administración)
export const getReservationStats = async () => {
  try {
    const { data: totalReservas, error: reservasError } = await supabase
      .from('reservas')
      .select('id', { count: 'exact' });

    const { data: codigosUsados, error: codigosError } = await supabase
      .from('codigos')
      .select('id', { count: 'exact' })
      .eq('usado', true);

    if (reservasError || codigosError) {
      console.error('Error getting stats:', reservasError || codigosError);
      return null;
    }

    return {
      totalReservas: totalReservas?.length || 0,
      codigosUsados: codigosUsados?.length || 0,
      codigosDisponibles: 300 - (codigosUsados?.length || 0)
    };
  } catch (error) {
    console.error('Error getting stats:', error);
    return null;
  }
};
