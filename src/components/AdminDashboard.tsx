import { useState, useEffect } from 'react';

interface Order {
  id: string;
  created_at: string;
  customer_email: string;
  customer_name: string;
  customer_phone: string;
  product_id: string;
  size: string;
  excluded_teams: string[];
  status: string;
  payment_method: string;
  payment_id: string;
  total_clp: number;
  tracking_number?: string;
  admin_notes?: string;
}

const PRODUCT_NAMES: Record<string, string> = {
  'box-basica': 'Caja Básica',
  'box-estandar': 'Caja Estándar',
  'box-chilena': 'Caja Chilena',
  'box-premium': 'Caja Premium',
  'box-elite': 'Caja Élite',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  paid: 'Pagado',
  processing: 'Procesando',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-500 border-yellow-500',
  paid: 'bg-green-500/20 text-green-500 border-green-500',
  processing: 'bg-blue-500/20 text-blue-500 border-blue-500',
  shipped: 'bg-purple-500/20 text-purple-500 border-purple-500',
  delivered: 'bg-green-600/20 text-green-600 border-green-600',
  cancelled: 'bg-red-500/20 text-red-500 border-red-500',
};

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    paid: 0,
    processing: 0,
    shipped: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    loadOrders();
  }, [filter]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const url = filter === 'all'
        ? '/api/orders'
        : `/api/orders?status=${filter}`;

      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        setOrders(data.orders);
        calculateStats(data.orders);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (ordersList: Order[]) => {
    const stats = {
      total: ordersList.length,
      paid: ordersList.filter(o => o.status === 'paid').length,
      processing: ordersList.filter(o => o.status === 'processing').length,
      shipped: ordersList.filter(o => o.status === 'shipped').length,
      totalRevenue: ordersList
        .filter(o => ['paid', 'processing', 'shipped', 'delivered'].includes(o.status))
        .reduce((sum, o) => sum + o.total_clp, 0),
    };
    setStats(stats);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus }),
      });

      if (response.ok) {
        loadOrders();
        if (selectedOrder?.id === orderId) {
          const data = await response.json();
          setSelectedOrder(data.order);
        }
      }
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const updateTracking = async (orderId: string, tracking: string) => {
    try {
      const response = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, tracking_number: tracking }),
      });

      if (response.ok) {
        loadOrders();
        const data = await response.json();
        setSelectedOrder(data.order);
      }
    } catch (error) {
      console.error('Error updating tracking:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">
              <span className="text-accent">Camiseta</span>Box Admin
            </h1>
            <a href="/" className="text-sm text-gray-400 hover:text-accent">
              Ver sitio →
            </a>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-primary rounded-lg p-4 border border-gray-700">
            <div className="text-sm text-gray-400 mb-1">Total Órdenes</div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </div>
          <div className="bg-primary rounded-lg p-4 border border-gray-700">
            <div className="text-sm text-gray-400 mb-1">Pagadas</div>
            <div className="text-2xl font-bold text-green-500">{stats.paid}</div>
          </div>
          <div className="bg-primary rounded-lg p-4 border border-gray-700">
            <div className="text-sm text-gray-400 mb-1">Procesando</div>
            <div className="text-2xl font-bold text-blue-500">{stats.processing}</div>
          </div>
          <div className="bg-primary rounded-lg p-4 border border-gray-700">
            <div className="text-sm text-gray-400 mb-1">Enviadas</div>
            <div className="text-2xl font-bold text-purple-500">{stats.shipped}</div>
          </div>
          <div className="bg-primary rounded-lg p-4 border border-gray-700">
            <div className="text-sm text-gray-400 mb-1">Ingresos</div>
            <div className="text-2xl font-bold text-accent">
              ${(stats.totalRevenue).toLocaleString('es-CL')}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['all', 'paid', 'processing', 'shipped', 'delivered'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg border transition-colors whitespace-nowrap ${
                filter === status
                  ? 'bg-accent border-accent text-white'
                  : 'bg-primary border-gray-700 hover:border-accent'
              }`}
            >
              {status === 'all' ? 'Todas' : STATUS_LABELS[status]}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-400">Cargando órdenes...</div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400">No hay órdenes</div>
          </div>
        ) : (
          <div className="bg-primary rounded-lg border border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800 border-b border-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Fecha</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Cliente</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Producto</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Total</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Estado</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-800/50">
                      <td className="px-4 py-3 text-sm">
                        {new Date(order.created_at).toLocaleDateString('es-CL', {
                          day: '2-digit',
                          month: '2-digit',
                          year: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium">{order.customer_name}</div>
                        <div className="text-xs text-gray-400">{order.customer_email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm">{PRODUCT_NAMES[order.product_id]}</div>
                        <div className="text-xs text-gray-400">Talla: {order.size}</div>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold">
                        ${order.total_clp.toLocaleString('es-CL')}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-1 rounded text-xs border ${STATUS_COLORS[order.status]}`}>
                          {STATUS_LABELS[order.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="text-accent hover:underline text-sm"
                        >
                          Ver detalles
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Order Detail Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-primary rounded-lg border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-primary border-b border-gray-700 px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-bold">Detalles de la orden</h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Customer Info */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Cliente</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-gray-400">Nombre:</span> {selectedOrder.customer_name}</div>
                    <div><span className="text-gray-400">Email:</span> {selectedOrder.customer_email}</div>
                    {selectedOrder.customer_phone && (
                      <div><span className="text-gray-400">Teléfono:</span> {selectedOrder.customer_phone}</div>
                    )}
                  </div>
                </div>

                {/* Order Info */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Pedido</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-gray-400">Producto:</span> {PRODUCT_NAMES[selectedOrder.product_id]}</div>
                    <div><span className="text-gray-400">Talla:</span> {selectedOrder.size}</div>
                    <div><span className="text-gray-400">Total:</span> ${selectedOrder.total_clp.toLocaleString('es-CL')}</div>
                    <div><span className="text-gray-400">Método de pago:</span> {selectedOrder.payment_method.toUpperCase()}</div>
                    <div><span className="text-gray-400">ID de pago:</span> <code className="text-xs">{selectedOrder.payment_id}</code></div>
                    {selectedOrder.excluded_teams.length > 0 && (
                      <div>
                        <span className="text-gray-400">Equipos excluidos:</span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {selectedOrder.excluded_teams.map((team) => (
                            <span key={team} className="px-2 py-1 bg-gray-800 rounded text-xs">
                              {team}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Update */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Estado</h3>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-accent outline-none"
                  >
                    <option value="paid">Pagado</option>
                    <option value="processing">Procesando</option>
                    <option value="shipped">Enviado</option>
                    <option value="delivered">Entregado</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </div>

                {/* Tracking Number */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Número de seguimiento</h3>
                  <input
                    type="text"
                    value={selectedOrder.tracking_number || ''}
                    onChange={(e) => updateTracking(selectedOrder.id, e.target.value)}
                    placeholder="Ingresa el número de tracking"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-accent outline-none"
                  />
                </div>

                {/* Order ID */}
                <div className="text-xs text-gray-500">
                  <div>ID: {selectedOrder.id}</div>
                  <div>Creado: {new Date(selectedOrder.created_at).toLocaleString('es-CL')}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
