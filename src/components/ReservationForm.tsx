import React, { useState } from 'react';
import Reveal from './Reveal';
import ReservationSuccessModal from './ReservationSuccessModal';
import { createReservation, ReservationData } from '../lib/reservationService';

// Lista de sucursales reales
const sucursales = [
  { id: 1, nombre: 'Ballester', direccion: 'Bv. Ballester 4816, Villa Ballester, Buenos Aires', horarios: 'Lunes a Miércoles 11:00 a 23:00 | Jueves a Domingo 11:00 a 00:00' },
  { id: 2, nombre: 'Balvanera', direccion: 'Av. Callao 474, Balvanera, Buenos Aires', horarios: 'Lunes a Sábado 11:00 a 17:00 y 18:00 a 00:00 | Domingo 18:00 a 00:00' },
  { id: 3, nombre: 'Barrancas de Belgrano', direccion: 'Monroe 1801, Barrancas de Belgrano, Buenos Aires', horarios: 'Lunes a Miércoles 11:00 a 15:30 y 18:00 a 23:00 | Jueves a Sábado 11:00 a 15:30 y 18:00 a 00:00 | Domingo 18:00 a 00:00' },
  { id: 4, nombre: 'Belgrano', direccion: 'Av. Dr. Ricardo Balbín 2395, Belgrano, Buenos Aires', horarios: 'Lunes a Miércoles 11:00 a 15:30 y 18:00 a 23:00 | Jueves a Sábado 11:00 a 15:30 y 18:00 a 00:00 | Domingo 18:00 a 00:00' },
  { id: 5, nombre: 'Bella Vista', direccion: 'Av. Senador Morón 903, San Miguel, Buenos Aires', horarios: 'Lunes a Miércoles 11:00 a 15:00 y 19:00 a 23:00 | Jueves a Domingo 11:00 a 15:00 y 19:00 a 00:00' },
  { id: 6, nombre: 'Campana', direccion: 'Av. Mitre 974, Campana, Buenos Aires', horarios: 'Lunes a Miércoles 11:30 a 14:30 y 19:00 a 23:30 | Jueves a Domingo 11:00 a 15:00 y 18:00 a 00:00' },
  { id: 7, nombre: 'Del Viso', direccion: 'Colectora 12 de Octubre 3252, Del Viso, Buenos Aires', horarios: 'Lunes a Miércoles 11:00 a 15:00 y 19:00 a 23:00 | Jueves a Domingo 11:00 a 15:00 y 19:00 a 00:00' },
  { id: 8, nombre: 'Devoto', direccion: 'Av. Francisco Beiró 4523, Devoto, Buenos Aires', horarios: 'Lunes a Miércoles 11:00 a 15:30 y 18:00 a 23:30 | Jueves a Sábado 11:00 a 15:00 y 18:00 a 00:00 | Domingo 18:00 a 00:00' },
  { id: 9, nombre: 'Don Torcuato', direccion: 'Av. Marcelo Torcuato de Avear 2556, Caseros, Buenos Aires', horarios: 'Lunes a Domingo 11:00 a 16:00 y 18:00 a 00:00' },
  { id: 10, nombre: 'Escobar', direccion: 'Av. 25 de Mayo 501, Belén de Escobar, Buenos Aires', horarios: 'Lunes a Miércoles 11:00 a 15:30 y 18:00 a 23:00 | Jueves a Sábado 11:00 a 15:30 y 18:00 a 00:00 | Domingo 18:00 a 00:00' },
  { id: 11, nombre: 'Floresta', direccion: 'Av. Rivadavia 9025, Floresta, Buenos Aires', horarios: 'Lunes a Miércoles 11:00 a 15:00 y 19:00 a 23:00 | Jueves a Sábado 11:00 a 15:00 y 18:00 a 00:00 | Domingo 18:00 a 00:00' },
  { id: 12, nombre: 'Florida', direccion: 'Av. Gral. José de San Martín 1904, Vicente López, Buenos Aires', horarios: 'Lunes a Miércoles 11:00 a 15:00 y 18:00 a 23:00 | Jueves a Sábado 11:00 a 15:00 y 18:00 a 00:00 | Domingo 18:00 a 00:00' },
  { id: 13, nombre: 'Gral. Pacheco', direccion: 'Av. Constituyentes 167, Gral. Pacheco, Buenos Aires', horarios: 'Lunes a Miércoles 11:30 a 14:30 y 18:00 a 23:00 | Jueves a Domingo 11:30 a 14:30 y 18:00 a 00:00' },
  { id: 14, nombre: 'Hurlingham', direccion: 'Av. Gdor. Vergara 4114, Buenos Aires', horarios: 'Lunes a Domingo 11:00 a 17:00 y 18:00 a 00:00' },
  { id: 15, nombre: 'Ituzaingó', direccion: 'Sta. Rosa 1164, Castelar, Buenos Aires', horarios: 'Lunes a Sábado 11:00 a 15:00 y 18:00 a 00:00 | Domingo 18:00 a 00:00' },
  { id: 16, nombre: 'José C. Paz', direccion: 'Av. Gaspar Campos 6420, Buenos Aires', horarios: 'Lunes a Miércoles 11:00 a 14:30 y 18:00 a 23:30 | Jueves a Sábado 11:00 a 14:30 y 18:00 a 00:00 | Domingo 18:00 a 00:00' },
  { id: 17, nombre: 'Los Polvorines', direccion: 'Av. Pdte, Av. Pres. Juan Domingo Perón 2596, Los Polvorines, Buenos Aires', horarios: 'Lunes a Domingo 11:00 a 17:00 y 18:00 a 00:00' },
  { id: 18, nombre: 'Martínez', direccion: 'Hipólito Yrigoyen 1834, Martínez, Buenos Aires', horarios: 'Lunes a Domingo 11:00 a 15:00 y 19:00 a 23:30' },
  { id: 19, nombre: 'Maschwitz', direccion: 'Av. Villanueva 1782, Ingeniero Maschwitz, Buenos Aires', horarios: 'Lunes a Miércoles 11:00 a 15:30 y 18:30 a 23:00 | Jueves a Sábado 11:00 a 15:30 y 18:00 a 00:00 | Domingo 18:00 a 00:00' },
  { id: 20, nombre: 'Mataderos', direccion: 'Av. Juan Bautista Alberdi 6450, Mataderos, Buenos Aires', horarios: 'Lunes a Miércoles 11:00 a 15:00 y 19:00 a 23:30 | Jueves a Sábado 11:00 a 15:00 y 18:00 a 00:00 | Domingo 18:00 a 00:00' },
  { id: 21, nombre: 'Merlo', direccion: 'Av. Calle Real 223, Merlo, Buenos Aires', horarios: 'Lunes a Miércoles 11:30 a 14:30 y 19:00 a 23:30 | Jueves a Sábado 11:00 a 15:00 y 18:00 a 00.00 | Domingo 19:00 a 00:00' },
  { id: 22, nombre: 'Moreno', direccion: 'Av. del Libertador 899, Moreno, Buenos Aires', horarios: 'Lunes a Miércoles 11:30 a 14:30 y 19:00 a 23:30 | Jueves a Sábado 11:00 a 15:00 y 18:00 a 00:00 | Domingo 18:00 a 00:00' },
  { id: 23, nombre: 'Muñiz', direccion: 'Av. León Gallardo 333, Muñiz, Buenos Aires', horarios: 'Lunes a Miércoles 11:30 a 14:30 y 19:00 a 23:30 | Jueves a Sábado 11:00 a 15:00 y 18:00 a 00:00 | Domingo 18:00 a 00:00' },
  { id: 24, nombre: 'Munro', direccion: 'Av. Bartolomé Mitre 2510, Munro, Buenos Aires', horarios: 'Lunes a Domingo 11:30 a 15:00 y 19:00 a 23:30' },
  { id: 25, nombre: 'Palermo', direccion: 'Av. Cnel. Niceto Vega 5795, Palermo, Buenos Aires', horarios: 'Lunes a Domingo 11:00 a 16:00 y 18:00 a 00:00' },
  { id: 26, nombre: 'Paternal', direccion: 'Av. Juan Bautista Justo 4551, Paternal, Buenos Aires', horarios: 'Lunes a Sábado 11:00 a 15:00 y 18:00 a 00:00 | Domingo 18:00 a 00:00' },
  { id: 27, nombre: 'Pilar Centro', direccion: 'Lorenzo López 523, Pilar Centro, Buenos Aires', horarios: 'Lunes a Jueves 11:30 a 14:30 y 18:00 a 23:00 | Viernes a Sábado 11:00 a 15:00 y 18:00 a 00:00 | Domingo 19:00 a 00:00' },
  { id: 28, nombre: 'Pilar Cruce Derqui', direccion: 'Lorenzo López 523, Pilar Cruce Derqui, Buenos Aires', horarios: 'Lunes a Sábado 11:00 a 14:45 y 18:30 a 23:00 | Domingo 18:30 a 23:00' },
  { id: 29, nombre: 'Puerto Madero', direccion: 'Pierina Dealessi 1176, Puerto Madero, Buenos Aires', horarios: 'Lunes a Miércoles 11:00 a 16:00 y 18:00 a 00:00 | Jueves a Domingo 11:00 a 17:00 y 18:00 a 00:00' },
  { id: 30, nombre: 'San Fernando', direccion: 'Av. Pres. Perón 2240, San Fernando, Buenos Aires', horarios: 'Lunes a Miércoles 11:30 a 15:00 y 19:00 a 23:00 | Jueves a Sábado 11:30 a 15:00 y 19:00 a 00:00 | Domingo 19:00 a 00:00' },
  { id: 31, nombre: 'San Martín', direccion: 'Int. Alberto M. Campos 1876, San Martín, Buenos Aires', horarios: 'Lunes a Jueves 11:00 a 14:30 y 18:30 a 23:30 | Viernes a Sábado 11:00 a 15:00 y 18:30 a 00:00 | Domingo 18:00 a 00:00' },
  { id: 32, nombre: 'San Miguel', direccion: 'Serrano 1665, San Miguel, Buenos Aires', horarios: 'Lunes a Miércoles 11:00 a 14:30 y 19:00 a 23:30 | Jueves a Sábado 11:00 a 15:00 y 18:00 a 00:00 | Domingo 18:00 a 00:00' },
  { id: 33, nombre: 'Tigre', direccion: 'Av. Cazón 699, Tigre, Buenos Aires', horarios: 'Lunes a Miércoles 11:00 a 15:00 y 19:00 a 23.00 | Jueves a Domingo 11:00 a 15:00 y 19:00 a 00:00' },
  { id: 34, nombre: 'Villa Adelina', direccion: 'Av. de Mayo 99, Villa Adelina, Buenos Aires', horarios: 'Domingo a Jueves 11:00 a 15:00 y 19:00 a 23:30 | Viernes a Sábado 11:00 a 16:00 y 19:00 a 00:00' },
  { id: 35, nombre: 'Villa Crespo', direccion: 'Av. Córdoba 4102, Villa Crespo, Buenos Aires', horarios: 'Lunes a Domingo 11:00 a 17:00 y 18:00 a 00:00' },
  { id: 36, nombre: 'Villa Urquiza', direccion: 'Av. de los Constituyentes 4599, Villa Urquiza, Buenos Aires', horarios: 'Lunes a Miércoles 11:00 a 23:30 | Jueves 11:00 a 00:00 | Viernes y Sábado 11:00 a 00:00 | Domingo 17:45 a 00:00' }
];

// Función para generar fechas desde 30/10 al 29/11
const generateDates = () => {
  const dates = [];
  const startDate = new Date(2024, 9, 31); // 31 de Octubre 2024 (mes 9)
  const endDate = new Date(2024, 10, 6);  // 6 de Noviembre 2024 (mes 10)
  
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
};

// Función para formatear el día de la semana en español
const getDayName = (date: Date) => {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return days[date.getDay()];
};

// Función para formatear la fecha
const formatDate = (date: Date) => {
  const day = date.getDate();
  const month = date.getMonth() + 1; // 1-12
  return `${day}/${month}`;
};

const ReservationForm: React.FC = () => {
  const [selectedSucursal, setSelectedSucursal] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    nombreCompleto: '',
    email: '',
    dni: '',
    celular: ''
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [error, setError] = useState('');
  const [modalData, setModalData] = useState({
    sucursalNombre: '',
    fecha: ''
  });
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);
  const dates = generateDates();
  const scrollToStep = (stepId: string) => {
    setTimeout(() => {
      const el = document.getElementById(stepId);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleSucursalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSucursal(Number(e.target.value));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handlePedirClick = async (date: Date) => {
    if (!selectedSucursal) {
      setError('Por favor selecciona una sucursal primero');
      return;
    }

    // Verificar que todos los campos estén completos
    if (!formData.nombreCompleto || !formData.email || !formData.dni || !formData.celular) {
      setError('Por favor completa todos los campos del formulario');
      return;
    }

    setSelectedDate(date);
    await handleSubmit(new Event('submit') as any);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSucursal || !selectedDate) return;

    setIsLoading(true);
    setError('');

    try {
      const sucursal = sucursales.find(s => s.id === selectedSucursal);
      if (!sucursal) {
        setError('Sucursal no encontrada');
        return;
      }

      const reservationData: ReservationData = {
        nombreCompleto: formData.nombreCompleto,
        email: formData.email,
        dni: formData.dni,
        celular: formData.celular,
        sucursalId: selectedSucursal,
        sucursalNombre: sucursal.nombre,
        fecha: selectedDate
      };

      const result = await createReservation(reservationData);

      if (result.success && result.codigo) {
        setGeneratedCode(result.codigo);
        // Guardar datos para el modal antes de limpiar
        setModalData({
          sucursalNombre: sucursal.nombre,
          fecha: `${getDayName(selectedDate)} ${formatDate(selectedDate)}`
        });
        setShowSuccessModal(true);
        // Limpiar formulario después del éxito
        setFormData({
          nombreCompleto: '',
          email: '',
          dni: '',
          celular: ''
        });
        setSelectedSucursal(null);
        setSelectedDate(null);
      } else {
        setError(result.error || 'Error al procesar la reserva');
      }
    } catch (error) {
      console.error('Error submitting reservation:', error);
      setError('Error interno. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-16 relative">
      <div className="max-w-4xl mx-auto px-4">
        <Reveal effect="fade">
          <div className="bg-gradient-to-b from-purple-900/20 via-black/40 to-purple-900/20 backdrop-blur-sm rounded-2xl p-8 border border-fuchsia-500/30 shadow-2xl">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-fuchsia-400 font-['Bebas_Neue'] flame-text-right">
              RESERVÁ TU EMPANADA
            </h2>
            <div className="mb-6 p-4 bg-blue-500/20 border-2 border-blue-500 rounded-lg">
              <p className="text-blue-300 font-semibold text-center">
                ⚠️ IMPORTANTE: Deberás presentar tu DNI físico en la sucursal para recibir tu empanada CRUNCHY gratis
              </p>
            </div>
            {error && (
              <div className="mb-6 p-4 bg-red-500/20 border-2 border-red-500 rounded-lg">
                <p className="text-red-300 font-semibold text-center">{error}</p>
              </div>
            )}

            {/* Paso 1: Sucursal */}
            <div 
              id="paso-sucursal"
              className="mb-6 rounded-xl shadow-sm transition-all border border-fuchsia-300/40 bg-black/30 overflow-hidden"
            >
              <div
                className={`flex items-center justify-between cursor-pointer select-none px-5 py-4 ${activeStep!==1? 'bg-gradient-to-r from-black/70 to-purple-900/20': 'bg-gradient-to-r from-fuchsia-900/50 to-purple-900/30'}`}
                onClick={()=>{setActiveStep(1);scrollToStep('paso-sucursal')}}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-fuchsia-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">1</div>
                  <span className="text-fuchsia-200 font-extrabold tracking-wide">1. Elegí tu sucursal</span>
                </div>
                {activeStep!==1 && selectedSucursal && (
                  <span className="ml-4 text-sm md:text-base text-gray-200 truncate">
                    {sucursales.find(s=>s.id===selectedSucursal)?.nombre} • {sucursales.find(s=>s.id===selectedSucursal)?.direccion}
                  </span>
                )}
              </div>
              {/* Contenido expandido */}
              {activeStep===1 && (
                <div className="py-6 px-2">
                  <select
                    value={selectedSucursal || ''}
                    onChange={e=>{
                      setSelectedSucursal(Number(e.target.value));
                      setTimeout(()=>{
                        setActiveStep(2);
                        scrollToStep('paso-datos');
                      },300);
                    }}
                    className="w-full p-4 bg-black/50 border-2 border-fuchsia-500 rounded-lg text-white text-lg focus:outline-none focus:border-fuchsia-400 focus:bg-black/70 transition-all duration-300"
                  >
                    <option value="">Seleccioná una sucursal</option>
                    {sucursales.map(sucursal => (
                      <option key={sucursal.id} value={sucursal.id}>
                        {sucursal.nombre} • {sucursal.direccion}
                      </option>
                    ))}
                  </select>
                  {selectedSucursal && (
                    <div className="mt-4 p-4 bg-fuchsia-500/20 border-2 border-fuchsia-500 rounded-lg backdrop-blur-sm">
                      <p className="text-white font-semibold">
                        {sucursales.find(s=>s.id===selectedSucursal)?.nombre} • {sucursales.find(s=>s.id===selectedSucursal)?.direccion}
                      </p>
                      <p className="text-fuchsia-200">
                        {sucursales.find(s=>s.id===selectedSucursal)?.horarios}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Paso 2: Datos */}
            <div
              id="paso-datos"
              className="mb-6 rounded-xl shadow-sm transition-all border border-fuchsia-300/40 bg-black/30 overflow-hidden"
            >
              <div
                className={`flex items-center justify-between cursor-pointer select-none px-5 py-4 ${activeStep!==2? 'bg-gradient-to-r from-black/70 to-purple-900/20': 'bg-gradient-to-r from-fuchsia-900/50 to-purple-900/30'}`}
                onClick={()=>selectedSucursal && (setActiveStep(2),scrollToStep('paso-datos'))}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-fuchsia-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">2</div>
                  <span className="text-fuchsia-200 font-extrabold tracking-wide">2. Completá tus datos</span>
                </div>
                {activeStep!==2 && formData.nombreCompleto && formData.email && formData.dni && formData.celular && (
                  <span className="ml-4 text-sm md:text-base text-gray-200 truncate">
                    {formData.nombreCompleto}, DNI: {formData.dni}, Cel: {formData.celular}
                  </span>
                )}
              </div>
              {activeStep===2 && (
                <form className="space-y-4 py-6 px-2" onSubmit={e=>{e.preventDefault();
                  if(formData.nombreCompleto && formData.email && formData.dni && formData.celular){
                    setActiveStep(3); scrollToStep('paso-fecha');
                  } else {
                    setError('Por favor completa tus datos antes de avanzar');
                  }}}>
                  <div>
                    <label className="block text-purple-200 mb-2 font-semibold">Nombre Completo *</label>
                    <input type="text" name="nombreCompleto" value={formData.nombreCompleto} onChange={handleInputChange} required className="w-full p-4 bg-black/50 border-2 border-fuchsia-500 rounded-lg text-white focus:outline-none focus:border-fuchsia-400 focus:bg-black/70 transition-all duration-300 placeholder-gray-400" placeholder="Ingresá tu nombre completo" />
                  </div>
                  <div>
                    <label className="block text-purple-200 mb-2 font-semibold">Correo Electrónico *</label>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} required className="w-full p-4 bg-black/50 border-2 border-fuchsia-500 rounded-lg text-white focus:outline-none focus:border-fuchsia-400 focus:bg-black/70 transition-all duration-300 placeholder-gray-400" placeholder="tu@email.com" />
                  </div>
                  <div>
                    <label className="block text-purple-200 mb-2 font-semibold">DNI *</label>
                    <input type="text" name="dni" value={formData.dni} onChange={handleInputChange} required className="w-full p-4 bg-black/50 border-2 border-fuchsia-500 rounded-lg text-white focus:outline-none focus:border-fuchsia-400 focus:bg-black/70 transition-all duration-300 placeholder-gray-400" placeholder="12345678" />
                  </div>
                  <div>
                    <label className="block text-purple-200 mb-2 font-semibold">Número de celular *</label>
                    <div className="flex gap-2">
                      <input type="text" value="54" readOnly className="w-20 p-4 bg-gray-700 border-2 border-gray-600 rounded-lg text-gray-300 text-center" />
                      <input type="text" value="11" readOnly className="w-20 p-4 bg-gray-700 border-2 border-gray-600 rounded-lg text-gray-300 text-center" />
                      <input type="text" name="celular" value={formData.celular} onChange={handleInputChange} required className="flex-1 p-4 bg-black/50 border-2 border-fuchsia-500 rounded-lg text-white focus:outline-none focus:border-fuchsia-400 focus:bg-black/70 transition-all duration-300 placeholder-gray-400" placeholder="12345678" />
                    </div>
                  </div>
                  <button type="submit" className="mt-4 bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold px-6 py-3 rounded-lg">Continuar</button>
                </form>
              )}
            </div>

            {/* Paso 3: Fechas */}
            <div
              id="paso-fecha"
              className="mb-6 rounded-xl shadow-sm transition-all border border-fuchsia-300/40 bg-black/30 overflow-hidden"
            >
              <div
                className={`flex items-center justify-between cursor-pointer select-none px-5 py-4 ${activeStep!==3? 'bg-gradient-to-r from-black/70 to-purple-900/20': 'bg-gradient-to-r from-fuchsia-900/50 to-purple-900/30'}`}
                onClick={()=>selectedSucursal && formData.nombreCompleto && formData.email && formData.dni && formData.celular && (setActiveStep(3),scrollToStep('paso-fecha'))}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-fuchsia-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">3</div>
                  <span className="text-fuchsia-200 font-extrabold tracking-wide">3. Elegí tu fecha</span>
                </div>
                {activeStep!==3 && selectedDate && (
                  <span className="ml-4 text-sm md:text-base text-gray-200 truncate">
                    {getDayName(selectedDate)} {formatDate(selectedDate)}
                  </span>
                )}
              </div>
              {activeStep===3 && (
                <div className="py-6 px-2">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {dates.map((date, index) => (
                      <div
                        key={index}
                        className={`relative bg-gradient-to-b from-purple-900/30 to-black/50 border-2 rounded-lg p-4 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg ${selectedDate?.getTime() === date.getTime() ? 'border-fuchsia-400 bg-fuchsia-500/20 shadow-fuchsia-500/50' : 'border-fuchsia-500 hover:border-fuchsia-400'}`}
                        onClick={()=>{
                          setSelectedDate(date);
                        }}
                      >
                        {/* Check en esquina cuando está seleccionado */}
                        {selectedDate?.getTime() === date.getTime() && (
                          <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-gradient-to-r from-fuchsia-600 to-purple-600 flex items-center justify-center shadow-md">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                        <div className="text-center">
                          <div className="text-fuchsia-400 font-bold text-lg mb-2">
                            {getDayName(date)} {formatDate(date)}
                          </div>
                          <div className="text-blue-400 font-bold text-sm mb-2 uppercase">EMPANADA CRUNCHY</div>
                          <div className="text-purple-200 text-xs mb-4">Incluye: 1 empanada CRUNCHY gratis añadida a tu pedido</div>
                          <button
                            className={`w-full py-2 px-4 rounded-lg font-bold text-white transition-all duration-300 transform hover:scale-105 ${selectedDate?.getTime() === date.getTime() ? 'bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-700 hover:to-purple-700 shadow-lg' : 'bg-gradient-to-r from-fuchsia-500 to-purple-500 hover:from-fuchsia-600 hover:to-purple-600'}`}
                            disabled={isLoading}
                            onClick={(e)=>{ e.stopPropagation(); setSelectedDate(date); }}
                          >
                            {selectedDate?.getTime() === date.getTime() ? (
                              <span className="inline-flex items-center gap-2">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                                ELEGIDO
                              </span>
                            ) : (
                              'ELEGIR'
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Botón de confirmación final */}
                  <div className="mt-8 text-center">
                    <button
                      type="button"
                      onClick={()=> handleSubmit(new Event('submit') as any)}
                      disabled={isLoading || !selectedSucursal || !formData.nombreCompleto || !formData.email || !formData.dni || !formData.celular || !selectedDate}
                      className={`bg-gradient-to-r from-fuchsia-600 via-purple-600 to-fuchsia-600 hover:from-fuchsia-700 hover:via-purple-700 hover:to-fuchsia-700 text-white font-bold py-4 px-8 rounded-lg text-xl transition-all duration-300 transform hover:scale-105 shadow-lg ${
                        isLoading || !selectedSucursal || !formData.nombreCompleto || !formData.email || !formData.dni || !formData.celular || !selectedDate ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {isLoading ? 'PROCESANDO...' : 'CONFIRMAR PEDIDO'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Reveal>
      </div>
      {/* Modal de éxito */}
      <ReservationSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        codigo={generatedCode}
        sucursalNombre={modalData.sucursalNombre}
        fecha={modalData.fecha}
      />
    </section>
  );
};

export default ReservationForm;
