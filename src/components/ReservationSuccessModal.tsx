import React from 'react';

interface ReservationSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  codigo: string;
  sucursalNombre: string;
  fecha: string;
}

const ReservationSuccessModal: React.FC<ReservationSuccessModalProps> = ({
  isOpen,
  onClose,
  codigo,
  sucursalNombre,
  fecha
}) => {
  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codigo);
    // Aquí podrías agregar una notificación de que se copió
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative bg-gradient-to-b from-purple-900/90 to-black/90 rounded-2xl p-8 max-w-md mx-4 border border-fuchsia-500/50 shadow-2xl">
        {/* Botón de cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-fuchsia-400 hover:text-fuchsia-300 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Contenido del modal */}
        <div className="text-center">
          {/* Icono de éxito */}
          <div className="mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-fuchsia-500 to-purple-500 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          {/* Título */}
          <h2 className="text-2xl font-bold text-fuchsia-400 mb-4 font-['Bebas_Neue']">
            ¡PEDIDO CONFIRMADO!
          </h2>

          {/* Mensaje principal */}
          <div className="mb-6 space-y-3">
            <p className="text-purple-200 text-lg">
              Tu pedido de empanada CRUNCHY ha sido confirmado
            </p>
            <p className="text-purple-200">
              <strong>Sucursal:</strong> {sucursalNombre}
            </p>
            <p className="text-purple-200">
              <strong>Fecha:</strong> {fecha}
            </p>
          </div>

          {/* Código */}
          <div className="mb-6">
            <p className="text-fuchsia-300 font-semibold mb-3">
              Tu código de descuento:
            </p>
            <div className="bg-black/50 border-2 border-fuchsia-500 rounded-lg p-4 mb-3">
              <p className="text-3xl font-bold text-fuchsia-400 font-mono tracking-wider">
                {codigo}
              </p>
            </div>
            <button
              onClick={handleCopyCode}
              className="bg-gradient-to-r from-fuchsia-500 to-purple-500 hover:from-fuchsia-600 hover:to-purple-600 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105"
            >
              Copiar Código
            </button>
          </div>

          {/* Instrucciones */}
          <div className="bg-fuchsia-500/20 border border-fuchsia-500/50 rounded-lg p-4 mb-6">
            <h3 className="text-fuchsia-300 font-bold mb-2">
              ¿Cómo usar tu código?
            </h3>
            <ul className="text-purple-200 text-sm space-y-1 text-left">
              <li>• Presenta este código al hacer tu pedido</li>
              <li>• <strong>DEBES presentar tu DNI físico</strong> en la sucursal</li>
              <li>• Se añadirá <strong>1 empanada CRUNCHY gratis</strong> a tu pedido</li>
              <li>• Válido solo en la sucursal seleccionada</li>
              <li>• Válido solo en la fecha elegida</li>
              <li>• Un código por persona</li>
            </ul>
          </div>

          {/* Botón de cerrar */}
          <button
            onClick={onClose}
            className="bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReservationSuccessModal;
