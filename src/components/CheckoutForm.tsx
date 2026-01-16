import { useState } from 'react';

interface CheckoutFormProps {
  productId: string;
  productName: string;
  productPrice: number;
}

const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

const POPULAR_TEAMS = [
  'Colo Colo', 'Universidad de Chile', 'Universidad Católica',
  'Real Madrid', 'Barcelona', 'Manchester United', 'Liverpool',
  'Bayern Munich', 'PSG', 'Juventus', 'Inter', 'Milan'
];

export default function CheckoutForm({ productId, productName, productPrice }: CheckoutFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    size: '',
    excludedTeams: [] as string[],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'mercadopago'>('mercadopago');

  const handleTeamToggle = (team: string) => {
    if (formData.excludedTeams.includes(team)) {
      setFormData({
        ...formData,
        excludedTeams: formData.excludedTeams.filter(t => t !== team)
      });
    } else {
      if (formData.excludedTeams.length < 3) {
        setFormData({
          ...formData,
          excludedTeams: [...formData.excludedTeams, team]
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (!formData.name || !formData.email || !formData.size) {
      setError('Por favor completa todos los campos requeridos');
      return;
    }

    setLoading(true);

    try {
      // Seleccionar endpoint según método de pago
      const endpoint = paymentMethod === 'mercadopago'
        ? '/api/create-mercadopago-preference'
        : '/api/create-paypal-order';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          size: formData.size,
          excludedTeams: formData.excludedTeams,
          customerEmail: formData.email,
          customerName: formData.name,
          customerPhone: formData.phone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear sesión de pago');
      }

      // Redirigir según el método de pago
      if (paymentMethod === 'mercadopago' && data.init_point) {
        window.location.href = data.init_point;
      } else if (paymentMethod === 'paypal' && data.approvalUrl) {
        window.location.href = data.approvalUrl;
      } else {
        throw new Error('No se recibió URL de pago');
      }
    } catch (err: any) {
      setError(err.message || 'Error al procesar el pago');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Datos personales */}
      <div>
        <label htmlFor="name" className="block text-sm font-semibold mb-2">
          Nombre completo *
        </label>
        <input
          type="text"
          id="name"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
          placeholder="Juan Pérez"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-semibold mb-2">
          Email *
        </label>
        <input
          type="email"
          id="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
          placeholder="tu@email.com"
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-semibold mb-2">
          Teléfono (opcional)
        </label>
        <input
          type="tel"
          id="phone"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
          placeholder="+56 9 1234 5678"
        />
      </div>

      {/* Talla */}
      <div>
        <label className="block text-sm font-semibold mb-2">
          Talla *
        </label>
        <div className="grid grid-cols-5 gap-2">
          {SIZES.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => setFormData({ ...formData, size })}
              className={`py-2 rounded-lg border transition-colors ${
                formData.size === size
                  ? 'bg-accent border-accent text-white'
                  : 'bg-gray-800 border-gray-700 hover:border-accent'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Equipos a excluir */}
      <div>
        <label className="block text-sm font-semibold mb-2">
          Equipos a excluir (máx. 3) - Opcional
        </label>
        <p className="text-xs text-gray-400 mb-3">
          Selecciona hasta 3 equipos que prefieres no recibir
        </p>
        <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
          {POPULAR_TEAMS.map((team) => {
            const isSelected = formData.excludedTeams.includes(team);
            const isDisabled = !isSelected && formData.excludedTeams.length >= 3;

            return (
              <button
                key={team}
                type="button"
                onClick={() => handleTeamToggle(team)}
                disabled={isDisabled}
                className={`py-2 px-3 rounded-lg border text-sm transition-colors ${
                  isSelected
                    ? 'bg-accent border-accent text-white'
                    : isDisabled
                    ? 'bg-gray-900 border-gray-800 text-gray-600 cursor-not-allowed'
                    : 'bg-gray-800 border-gray-700 hover:border-accent'
                }`}
              >
                {team}
              </button>
            );
          })}
        </div>
      </div>

      {/* Payment Method Selection */}
      <div>
        <label className="block text-sm font-semibold mb-3">
          Método de pago *
        </label>
        <div className="grid grid-cols-2 gap-4">
          {/* Mercado Pago - Chile */}
          <button
            type="button"
            onClick={() => setPaymentMethod('mercadopago')}
            className={`p-5 rounded-lg border-2 transition-all ${
              paymentMethod === 'mercadopago'
                ? 'border-[#009ee3] bg-[#009ee3]/10'
                : 'border-gray-700 hover:border-[#009ee3]/50'
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <svg className="w-20 h-6" viewBox="0 0 100 30" fill="currentColor">
                <path fill="#009ee3" d="M72.4 8.8c-2.3 0-4.2 1.5-4.9 3.5V9.2h-4.6v18.3h4.8v-9.8c0-2.4 1.2-3.7 3.3-3.7 1.9 0 3 1.2 3 3.4v10.1h4.8V16.3c0-4.5-2.7-7.5-6.4-7.5zm-17.8 0c-2.3 0-4.2 1.5-4.9 3.5V9.2h-4.6v18.3h4.8v-9.8c0-2.4 1.2-3.7 3.3-3.7 1.9 0 3 1.2 3 3.4v10.1h4.8V16.3c0-4.5-2.7-7.5-6.4-7.5zM38.9 9.2h-4.8v18.3h4.8V9.2zm-2.4-7.7c-1.7 0-3 1.3-3 3s1.3 3 3 3 3-1.3 3-3-1.3-3-3-3zm47.2 25.7c2.8 0 5.1-2.3 5.1-5.1s-2.3-5.1-5.1-5.1-5.1 2.3-5.1 5.1 2.3 5.1 5.1 5.1zm0-14.5c5.2 0 9.4 4.2 9.4 9.4s-4.2 9.4-9.4 9.4-9.4-4.2-9.4-9.4 4.2-9.4 9.4-9.4zm-64.5 0c5.2 0 9.4 4.2 9.4 9.4s-4.2 9.4-9.4 9.4S9.8 27.3 9.8 22.1s4.2-9.4 9.4-9.4zm0 14.5c2.8 0 5.1-2.3 5.1-5.1s-2.3-5.1-5.1-5.1-5.1 2.3-5.1 5.1 2.3 5.1 5.1 5.1z"/>
              </svg>
              <div className="text-center">
                <div className="text-xs font-semibold text-white">Mercado Pago</div>
                <div className="text-[10px] text-gray-400">Chile y Latam</div>
              </div>
            </div>
          </button>

          {/* PayPal - Internacional */}
          <button
            type="button"
            onClick={() => setPaymentMethod('paypal')}
            className={`p-5 rounded-lg border-2 transition-all ${
              paymentMethod === 'paypal'
                ? 'border-[#0070ba] bg-[#0070ba]/10'
                : 'border-gray-700 hover:border-[#0070ba]/50'
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <svg className="w-20 h-6" viewBox="0 0 124 33" fill="currentColor">
                <path d="M46.211 6.749h-6.839a.95.95 0 0 0-.939.802l-2.766 17.537a.57.57 0 0 0 .564.658h3.265a.95.95 0 0 0 .939-.803l.746-4.73a.95.95 0 0 1 .938-.803h2.165c4.505 0 7.105-2.18 7.784-6.5.306-1.89.013-3.375-.872-4.415-.972-1.142-2.696-1.746-4.985-1.746zM47 13.154c-.374 2.454-2.249 2.454-4.062 2.454h-1.032l.724-4.583a.57.57 0 0 1 .563-.481h.473c1.235 0 2.4 0 3.002.704.359.42.469 1.044.332 1.906zM66.654 13.075h-3.275a.57.57 0 0 0-.563.481l-.145.916-.229-.332c-.709-1.029-2.29-1.373-3.868-1.373-3.619 0-6.71 2.741-7.312 6.586-.313 1.918.132 3.752 1.22 5.03.998 1.176 2.426 1.666 4.125 1.666 2.916 0 4.533-1.875 4.533-1.875l-.146.91a.57.57 0 0 0 .562.66h2.95a.95.95 0 0 0 .939-.803l1.77-11.209a.568.568 0 0 0-.561-.657zm-4.565 6.374c-.316 1.871-1.801 3.127-3.695 3.127-.951 0-1.711-.305-2.199-.883-.484-.574-.668-1.391-.514-2.301.295-1.855 1.805-3.152 3.67-3.152.93 0 1.686.309 2.184.892.499.589.697 1.411.554 2.317zM84.096 13.075h-3.291a.954.954 0 0 0-.787.417l-4.539 6.686-1.924-6.425a.953.953 0 0 0-.912-.678h-3.234a.57.57 0 0 0-.541.754l3.625 10.638-3.408 4.811a.57.57 0 0 0 .465.9h3.287a.949.949 0 0 0 .781-.408l10.946-15.8a.57.57 0 0 0-.468-.895z"/>
                <path d="M94.992 6.749h-6.84a.95.95 0 0 0-.938.802l-2.766 17.537a.569.569 0 0 0 .562.658h3.51a.665.665 0 0 0 .656-.562l.785-4.971a.95.95 0 0 1 .938-.803h2.164c4.506 0 7.105-2.18 7.785-6.5.307-1.89.012-3.375-.873-4.415-.971-1.142-2.694-1.746-4.983-1.746zm.789 6.405c-.373 2.454-2.248 2.454-4.062 2.454h-1.031l.725-4.583a.568.568 0 0 1 .562-.481h.473c1.234 0 2.4 0 3.002.704.359.42.468 1.044.331 1.906zM115.434 13.075h-3.273a.567.567 0 0 0-.562.481l-.145.916-.23-.332c-.709-1.029-2.289-1.373-3.867-1.373-3.619 0-6.709 2.741-7.311 6.586-.312 1.918.131 3.752 1.219 5.03 1 1.176 2.426 1.666 4.125 1.666 2.916 0 4.533-1.875 4.533-1.875l-.146.91a.57.57 0 0 0 .564.66h2.949a.95.95 0 0 0 .938-.803l1.771-11.209a.571.571 0 0 0-.565-.657zm-4.565 6.374c-.314 1.871-1.801 3.127-3.695 3.127-.949 0-1.711-.305-2.199-.883-.484-.574-.666-1.391-.514-2.301.297-1.855 1.805-3.152 3.67-3.152.93 0 1.686.309 2.184.892.501.589.699 1.411.554 2.317zM119.295 7.23l-2.807 17.858a.569.569 0 0 0 .562.658h2.822c.469 0 .867-.34.939-.803l2.768-17.536a.57.57 0 0 0-.562-.659h-3.16a.571.571 0 0 0-.562.482z"/>
                <path d="M7.266 29.154l.523-3.322-1.165-.027H1.061L4.927 1.292a.316.316 0 0 1 .314-.268h9.38c3.114 0 5.263.648 6.385 1.927.526.6.861 1.227 1.023 1.917.17.724.173 1.589.007 2.644l-.012.077v.676l.526.298a3.69 3.69 0 0 1 1.065.812c.45.513.741 1.165.864 1.938.127.795.085 1.741-.123 2.812-.24 1.232-.628 2.305-1.152 3.183a6.547 6.547 0 0 1-1.825 2c-.696.494-1.523.869-2.458 1.109-.906.236-1.939.355-3.072.355h-.73c-.522 0-1.029.188-1.427.525a2.21 2.21 0 0 0-.744 1.328l-.055.299-.924 5.855-.042.215c-.011.068-.03.102-.058.125a.155.155 0 0 1-.096.035H7.266z"/>
                <path fill="#253b80" d="M23.048 7.667c-.028.179-.06.362-.096.55-1.237 6.351-5.469 8.545-10.874 8.545H9.326c-.661 0-1.218.48-1.321 1.132L6.596 26.83l-.399 2.533a.704.704 0 0 0 .695.814h4.881c.578 0 1.069-.42 1.16-.99l.048-.248.919-5.832.059-.32c.09-.572.582-.992 1.16-.992h.73c4.729 0 8.431-1.92 9.513-7.476.452-2.321.218-4.259-.978-5.622a4.667 4.667 0 0 0-1.336-1.03z"/>
                <path fill="#179bd7" d="M21.754 7.151a9.757 9.757 0 0 0-1.203-.267 15.284 15.284 0 0 0-2.426-.177h-7.352a1.172 1.172 0 0 0-1.159.992L8.05 17.605l-.045.289a1.336 1.336 0 0 1 1.321-1.132h2.752c5.405 0 9.637-2.195 10.874-8.545.037-.188.068-.371.096-.55a6.594 6.594 0 0 0-1.017-.429 9.045 9.045 0 0 0-.277-.087z"/>
                <path fill="#222d65" d="M9.614 7.699a1.169 1.169 0 0 1 1.159-.991h7.352c.871 0 1.684.057 2.426.177a9.757 9.757 0 0 1 1.481.353c.365.121.704.264 1.017.429.368-2.347-.003-3.945-1.272-5.392C20.378.682 17.853 0 14.622 0h-9.38c-.66 0-1.223.48-1.325 1.133L.01 25.898a.806.806 0 0 0 .795.932h5.791l1.454-9.225 1.564-9.906z"/>
              </svg>
              <div className="text-center">
                <div className="text-xs font-semibold text-white">PayPal</div>
                <div className="text-[10px] text-gray-400">Internacional</div>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-3 text-red-500 text-sm">
          {error}
        </div>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-accent hover:bg-red-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-colors"
      >
        {loading ? 'Procesando...' : `Pagar $${productPrice.toLocaleString('es-CL')}`}
      </button>

      <p className="text-xs text-gray-500 text-center">
        Al continuar, aceptas nuestros{' '}
        <a href="/terminos" className="text-accent hover:underline">
          términos y condiciones
        </a>
      </p>
    </form>
  );
}
