// Script para inicializar los códigos en Supabase
// Ejecutar con: npm run init-codes

import { supabase } from '../lib/supabaseClient';

const initializeCodes = async () => {
  try {
    console.log('🚀 Inicializando códigos en Supabase...');
    
    // Llamar a la función de Supabase para inicializar códigos
    const { data, error } = await supabase.rpc('initialize_codes');
    
    if (error) {
      console.error('❌ Error inicializando códigos:', error);
      return;
    }
    
    console.log('✅ Códigos inicializados correctamente');
    
    // Verificar que se crearon los códigos
    const { data: codes, error: codesError } = await supabase
      .from('codigos')
      .select('id', { count: 'exact' });
    
    if (codesError) {
      console.error('❌ Error verificando códigos:', codesError);
      return;
    }
    
    console.log(`📊 Total de códigos creados: ${codes?.length || 0}`);
    
    // Obtener estadísticas
    const { data: stats, error: statsError } = await supabase.rpc('get_reservation_stats');
    
    if (statsError) {
      console.error('❌ Error obteniendo estadísticas:', statsError);
      return;
    }
    
    console.log('📈 Estadísticas:');
    console.log(`   - Total reservas: ${stats?.[0]?.total_reservas || 0}`);
    console.log(`   - Códigos usados: ${stats?.[0]?.codigos_usados || 0}`);
    console.log(`   - Códigos disponibles: ${stats?.[0]?.codigos_disponibles || 0}`);
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
};

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeCodes();
}

export default initializeCodes;
