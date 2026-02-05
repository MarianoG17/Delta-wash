import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="text-3xl">🚗</div>
            <h1 className="text-2xl font-bold text-blue-600">Chasis</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/login-saas"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Ingresar
            </Link>
            <Link
              href="/registro"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-md"
            >
              Probar gratis
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="mb-6">
          <span className="bg-blue-100 text-blue-600 px-4 py-2 rounded-full text-sm font-medium">
            🎉 15 días de prueba gratis
          </span>
        </div>
        <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          Gestión digital<br />
          <span className="text-blue-600">para tu lavadero</span>
        </h2>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
          Dejá el papel atrás. Controlá autos, turnos y estadísticas desde tu celular.
          Simple, rápido y profesional. 📱
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          <Link
            href="/registro"
            className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Empezar gratis 15 días →
          </Link>
          <Link
            href="#features"
            className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold border-2 border-blue-600 hover:bg-blue-50 transition-all"
          >
            Ver funciones
          </Link>
        </div>
        <p className="text-sm text-gray-500 mt-4">
          ✓ Sin tarjeta de crédito   ✓ Configuración en 2 minutos   ✓ Sin permanencia
        </p>
      </section>

      {/* Demo Visual - Cómo se ve la app */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-3xl font-bold text-white text-center mb-12">
            Visualizá todos los autos en tiempo real
          </h3>
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            {/* Ejemplo de interface */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Columna En Proceso */}
              <div className="bg-yellow-50 rounded-lg p-6 border-2 border-yellow-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-lg text-gray-900">🔄 En Proceso</h4>
                  <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-semibold">3</span>
                </div>
                <div className="space-y-3">
                  <div className="bg-white p-4 rounded-lg shadow">
                    <div className="font-semibold text-gray-900">AA 123 BC</div>
                    <div className="text-sm text-gray-600">Lavado Completo</div>
                    <div className="text-xs text-gray-500 mt-1">10:30 AM</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow">
                    <div className="font-semibold text-gray-900">AB 456 CD</div>
                    <div className="text-sm text-gray-600">Lavado + Encerado</div>
                    <div className="text-xs text-gray-500 mt-1">11:15 AM</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow">
                    <div className="font-semibold text-gray-900">AC 789 EF</div>
                    <div className="text-sm text-gray-600">Solo Lavado</div>
                    <div className="text-xs text-gray-500 mt-1">12:00 PM</div>
                  </div>
                </div>
              </div>

              {/* Columna Listo */}
              <div className="bg-green-50 rounded-lg p-6 border-2 border-green-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-lg text-gray-900">✅ Listo</h4>
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">2</span>
                </div>
                <div className="space-y-3">
                  <div className="bg-white p-4 rounded-lg shadow">
                    <div className="font-semibold text-gray-900">AD 111 GH</div>
                    <div className="text-sm text-gray-600">Lavado Express</div>
                    <div className="text-xs text-green-600 font-semibold mt-1">Completado 12:45 PM</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow">
                    <div className="font-semibold text-gray-900">AE 222 IJ</div>
                    <div className="text-sm text-gray-600">Lavado + Aspirado</div>
                    <div className="text-xs text-green-600 font-semibold mt-1">Completado 1:10 PM</div>
                  </div>
                </div>
              </div>

              {/* Columna Entregado */}
              <div className="bg-gray-50 rounded-lg p-6 border-2 border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-lg text-gray-900">📦 Entregado</h4>
                  <span className="bg-gray-500 text-white px-3 py-1 rounded-full text-sm font-semibold">5</span>
                </div>
                <div className="space-y-3">
                  <div className="bg-white p-4 rounded-lg shadow opacity-75">
                    <div className="font-semibold text-gray-900">AF 333 KL</div>
                    <div className="text-sm text-gray-600">Lavado Completo</div>
                    <div className="text-xs text-gray-500 mt-1">Entregado</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow opacity-75">
                    <div className="font-semibold text-gray-900">AG 444 MN</div>
                    <div className="text-sm text-gray-600">Solo Aspirado</div>
                    <div className="text-xs text-gray-500 mt-1">Entregado</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 text-center text-gray-600 text-sm">
              👆 Control total del flujo de trabajo • Actualizaciones en tiempo real
            </div>
          </div>
        </div>
      </section>

      {/* Paso a Paso con Screenshots */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">
              Mirá cómo funciona en 3 pasos
            </h3>
            <p className="text-xl text-gray-600">
              Desde que ingresa el auto hasta el reporte final
            </p>
          </div>

          {/* Paso 1: Carga de Auto */}
          <div className="mb-20">
            <div className="text-center mb-8">
              <div className="inline-block bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mb-4">
                1
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-2">Carga rápida de autos</h4>
              <p className="text-gray-600">Registrá un auto en menos de 30 segundos</p>
            </div>
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-4xl mx-auto border-2 border-gray-200">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-4 rounded-t-xl -mt-6 -mx-6 mb-6">
                <h5 className="text-white font-bold text-lg">📋 Nuevo Registro</h5>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Patente</label>
                  <input type="text" value="AA 123 BC" readOnly className="w-full px-4 py-2 border-2 border-blue-300 rounded-lg bg-blue-50 text-gray-900 font-mono font-bold" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Cliente</label>
                  <input type="text" value="Juan Pérez" readOnly className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg bg-gray-50 text-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Marca</label>
                  <input type="text" value="Toyota" readOnly className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg bg-gray-50 text-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Modelo</label>
                  <input type="text" value="Corolla" readOnly className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg bg-gray-50 text-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de Vehículo</label>
                  <select className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg bg-gray-50 text-gray-900" disabled>
                    <option>🚗 Auto</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Servicio</label>
                  <div className="bg-gray-50 border-2 border-gray-300 rounded-lg px-4 py-2 text-gray-900">
                    ✓ Simple + Con Cera
                  </div>
                </div>
              </div>
              <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-semibold">Precio Total:</span>
                  <span className="text-3xl font-bold text-blue-600">$24.000</span>
                </div>
              </div>
              <button className="w-full mt-6 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg text-lg shadow-lg">
                ✓ Registrar Auto
              </button>
            </div>
          </div>

          {/* Paso 2: WhatsApp */}
          <div className="mb-20">
            <div className="text-center mb-8">
              <div className="inline-block bg-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mb-4">
                2
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-2">Notificación automática</h4>
              <p className="text-gray-600">Un click para avisar que el auto está listo</p>
            </div>
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-4xl mx-auto border-2 border-gray-200">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-4 rounded-t-xl -mt-6 -mx-6 mb-6">
                <h5 className="text-white font-bold text-lg">✅ Autos Listos</h5>
              </div>
              <div className="space-y-4">
                <div className="border-2 border-orange-200 bg-orange-50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h6 className="font-bold text-lg text-gray-900">Toyota Corolla</h6>
                      <p className="text-sm text-gray-600">Patente: <span className="font-mono font-bold">AA 123 BC</span></p>
                      <p className="text-sm text-gray-600">Cliente: Juan Pérez</p>
                    </div>
                    <div className="text-right">
                      <span className="bg-orange-200 text-orange-800 px-3 py-1 rounded-full text-sm font-bold block mb-2">
                        LISTO
                      </span>
                      <span className="text-lg font-bold text-blue-600">$24.000</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg shadow-lg flex items-center justify-center gap-2">
                      <span className="text-xl">📲</span>
                      Enviar WhatsApp
                    </button>
                    <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg shadow-lg">
                      ✓ Entregado
                    </button>
                  </div>
                </div>
              </div>
              <div className="mt-6 bg-green-50 border-2 border-green-200 rounded-lg p-4">
                <p className="text-green-800 text-sm font-semibold mb-2">💬 Mensaje que recibirá el cliente:</p>
                <div className="bg-white rounded-lg p-3 border border-green-300">
                  <p className="text-gray-800 text-sm">
                    Hola Juan! Tu <strong>Toyota Corolla (AA 123 BC)</strong> ya está listo. Podés pasar a retirarlo cuando quieras. ¡Gracias! 🚗✨
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Paso 3: Reportes */}
          <div>
            <div className="text-center mb-8">
              <div className="inline-block bg-purple-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mb-4">
                3
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-2">Reportes automáticos</h4>
              <p className="text-gray-600">Estadísticas completas en tiempo real</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {/* Reporte de Ventas */}
              <div className="bg-white rounded-xl shadow-xl p-6 border-2 border-gray-200">
                <h5 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-2xl">📊</span>
                  Ventas del Día
                </h5>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600">Autos lavados:</span>
                    <span className="font-bold text-xl text-blue-600">12</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600">Total efectivo:</span>
                    <span className="font-bold text-lg text-green-600">$180.000</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600">Transferencias:</span>
                    <span className="font-bold text-lg text-blue-600">$96.000</span>
                  </div>
                  <div className="flex justify-between items-center py-2 bg-green-50 rounded-lg px-3 mt-3">
                    <span className="text-gray-900 font-semibold">Total:</span>
                    <span className="font-bold text-2xl text-green-600">$276.000</span>
                  </div>
                </div>
              </div>

              {/* Reporte por Horario */}
              <div className="bg-white rounded-xl shadow-xl p-6 border-2 border-gray-200">
                <h5 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-2xl">⏰</span>
                  Horarios Pico
                </h5>
                <div className="space-y-2">
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-medium">9:00 - 11:00</span>
                      <span className="font-bold text-blue-600">5 autos</span>
                    </div>
                    <div className="mt-1 bg-blue-200 rounded-full h-2">
                      <div className="bg-blue-600 rounded-full h-2 w-5/6"></div>
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-medium">14:00 - 16:00</span>
                      <span className="font-bold text-green-600">4 autos</span>
                    </div>
                    <div className="mt-1 bg-green-200 rounded-full h-2">
                      <div className="bg-green-600 rounded-full h-2 w-4/6"></div>
                    </div>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-medium">17:00 - 19:00</span>
                      <span className="font-bold text-yellow-600">3 autos</span>
                    </div>
                    <div className="mt-1 bg-yellow-200 rounded-full h-2">
                      <div className="bg-yellow-600 rounded-full h-2 w-3/6"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Clientes */}
              <div className="bg-white rounded-xl shadow-xl p-6 border-2 border-gray-200">
                <h5 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-2xl">👥</span>
                  Top Clientes
                </h5>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-2 bg-yellow-50 rounded-lg border border-yellow-300">
                    <span className="text-2xl">🥇</span>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">Juan Pérez</p>
                      <p className="text-xs text-gray-600">8 lavados este mes</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg border border-gray-300">
                    <span className="text-2xl">🥈</span>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">María García</p>
                      <p className="text-xs text-gray-600">6 lavados este mes</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-orange-50 rounded-lg border border-orange-300">
                    <span className="text-2xl">🥉</span>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">Carlos Rodríguez</p>
                      <p className="text-xs text-gray-600">5 lavados este mes</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">
              Todo lo que necesita tu lavadero
            </h3>
            <p className="text-xl text-gray-600">
              Dejá de usar papel y calculadora. Modernizá tu lavadero hoy.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 - BÁSICO */}
            <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow border border-blue-100">
              <div className="flex items-center justify-between mb-4">
                <div className="text-4xl">📋</div>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">BÁSICO</span>
              </div>
              <h4 className="text-xl font-bold mb-3 text-gray-900">Gestión de Vehículos</h4>
              <p className="text-gray-600 mb-4">
                Registrá patentes, marca, modelo y servicio. Control de estados: En Proceso → Listo → Entregado.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ Registro rápido de autos</li>
                <li>✓ Autocompletado de clientes</li>
                <li>✓ Estados visuales claros</li>
              </ul>
            </div>

            {/* Feature 2 - BÁSICO */}
            <div className="bg-gradient-to-br from-green-50 to-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow border border-green-100">
              <div className="flex items-center justify-between mb-4">
                <div className="text-4xl">💰</div>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">BÁSICO</span>
              </div>
              <h4 className="text-xl font-bold mb-3 text-gray-900">Gestión de Precios</h4>
              <p className="text-gray-600 mb-4">
                Precios automáticos según tipo de vehículo y servicio. Calculadora integrada con extras.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ 5 tipos de vehículo (Auto, SUV, Camioneta, XL, Moto)</li>
                <li>✓ 6 tipos de lavado</li>
                <li>✓ Cálculo automático de precios</li>
              </ul>
            </div>

            {/* Feature 3 - BÁSICO */}
            <div className="bg-gradient-to-br from-purple-50 to-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow border border-purple-100">
              <div className="flex items-center justify-between mb-4">
                <div className="text-4xl">📱</div>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">BÁSICO</span>
              </div>
              <h4 className="text-xl font-bold mb-3 text-gray-900">App Móvil (PWA)</h4>
              <p className="text-gray-600 mb-4">
                Usalo desde tu celular sin instalar nada. Funciona como app nativa en iPhone y Android.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ Sin instalación de tienda</li>
                <li>✓ Funciona offline</li>
                <li>✓ Acceso instantáneo</li>
              </ul>
            </div>

            {/* Feature 4 - BÁSICO */}
            <div className="bg-gradient-to-br from-yellow-50 to-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow border border-yellow-100">
              <div className="flex items-center justify-between mb-4">
                <div className="text-4xl">📲</div>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">BÁSICO</span>
              </div>
              <h4 className="text-xl font-bold mb-3 text-gray-900">Notificaciones WhatsApp</h4>
              <p className="text-gray-600 mb-4">
                Avisá a tus clientes automáticamente cuando su auto está listo con un solo click.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ Mensajes personalizados</li>
                <li>✓ Un click para notificar</li>
                <li>✓ Mejora la experiencia del cliente</li>
              </ul>
            </div>

            {/* Feature 5 - BÁSICO */}
            <div className="bg-gradient-to-br from-red-50 to-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow border border-red-100">
              <div className="flex items-center justify-between mb-4">
                <div className="text-4xl">📊</div>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">BÁSICO</span>
              </div>
              <h4 className="text-xl font-bold mb-3 text-gray-900">Historial Completo</h4>
              <p className="text-gray-600 mb-4">
                Acceso a todos los registros históricos con búsqueda por patente, fecha o cliente.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ Búsqueda avanzada</li>
                <li>✓ Filtros por fecha</li>
                <li>✓ Exportar a Excel</li>
              </ul>
            </div>

            {/* Feature 6 - PRO */}
            <div className="bg-gradient-to-br from-indigo-50 to-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow border-2 border-indigo-300">
              <div className="flex items-center justify-between mb-4">
                <div className="text-4xl">💳</div>
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-semibold">PRO</span>
              </div>
              <h4 className="text-xl font-bold mb-3 text-gray-900">Cuentas Corrientes</h4>
              <p className="text-gray-600 mb-4">
                Clientes frecuentes pueden pagar a fin de mes. Control total de saldos y movimientos.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ Saldos actualizados automáticamente</li>
                <li>✓ Historial de movimientos</li>
                <li>✓ Cargas y descargas de saldo</li>
              </ul>
            </div>

            {/* Feature 7 - PRO */}
            <div className="bg-gradient-to-br from-orange-50 to-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow border-2 border-orange-300">
              <div className="flex items-center justify-between mb-4">
                <div className="text-4xl">📈</div>
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-semibold">PRO</span>
              </div>
              <h4 className="text-xl font-bold mb-3 text-gray-900">Reportes y Estadísticas</h4>
              <p className="text-gray-600 mb-4">
                Reportes de ventas, caja diaria, horarios pico y estadísticas de clientes.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ Facturación diaria/semanal/mensual</li>
                <li>✓ Análisis de horarios pico</li>
                <li>✓ Top clientes</li>
              </ul>
            </div>

            {/* Feature 8 - PRO */}
            <div className="bg-gradient-to-br from-pink-50 to-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow border-2 border-pink-300">
              <div className="flex items-center justify-between mb-4">
                <div className="text-4xl">👥</div>
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-semibold">PRO</span>
              </div>
              <h4 className="text-xl font-bold mb-3 text-gray-900">Multi-usuario con Roles</h4>
              <p className="text-gray-600 mb-4">
                Accesos diferenciados: Admin (dueño) y Operadores (lavadores). Control de permisos.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ Usuarios ilimitados</li>
                <li>✓ Permisos personalizados</li>
                <li>✓ Trazabilidad de acciones</li>
              </ul>
            </div>

            {/* Feature 9 - PRO */}
            <div className="bg-gradient-to-br from-teal-50 to-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow border-2 border-teal-300">
              <div className="flex items-center justify-between mb-4">
                <div className="text-4xl">💵</div>
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-semibold">PRO</span>
              </div>
              <h4 className="text-xl font-bold mb-3 text-gray-900">Control de Caja</h4>
              <p className="text-gray-600 mb-4">
                Reporte de caja diaria discriminado por efectivo, transferencia y cancelados.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ Efectivo vs Transferencias</li>
                <li>✓ Registros anulados/cancelados</li>
                <li>✓ Cierre de caja diario</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits vs Paper */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">
              ¿Por qué es mejor que el papel?
            </h3>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Con Papel */}
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8">
              <h4 className="text-2xl font-bold text-red-700 mb-6">❌ Con Papel</h4>
              <ul className="space-y-4 text-gray-700">
                <li className="flex items-start">
                  <span className="text-red-500 mr-3 text-xl">✗</span>
                  <span>Se pierde o se moja</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-3 text-xl">✗</span>
                  <span>No sabés cuánto facturaste realmente</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-3 text-xl">✗</span>
                  <span>Imposible tener estadísticas</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-3 text-xl">✗</span>
                  <span>No sabés quién hizo qué</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-3 text-xl">✗</span>
                  <span>Desorden y confusión</span>
                </li>
              </ul>
            </div>

            {/* Con Chasis */}
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-8">
              <h4 className="text-2xl font-bold text-green-700 mb-6">✅ Con Chasis</h4>
              <ul className="space-y-4 text-gray-700">
                <li className="flex items-start">
                  <span className="text-green-500 mr-3 text-xl">✓</span>
                  <span>Todo guardado en la nube</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-3 text-xl">✓</span>
                  <span>Facturación exacta al centavo</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-3 text-xl">✓</span>
                  <span>Estadísticas automáticas</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-3 text-xl">✓</span>
                  <span>Trazabilidad total por usuario</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-3 text-xl">✓</span>
                  <span>Profesional y organizado</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">
              ¿Cómo funciona?
            </h3>
            <p className="text-xl text-gray-600">
              Empezá a usar Chasis en 3 simples pasos
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h4 className="text-xl font-bold mb-2">Registrate</h4>
              <p className="text-gray-600">
                Creá tu cuenta en 2 minutos. Solo necesitás un email.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h4 className="text-xl font-bold mb-2">Configurá tu lavadero</h4>
              <p className="text-gray-600">
                Agregá tus precios y usuarios. Todo listo para operar.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h4 className="text-xl font-bold mb-2">¡Listo!</h4>
              <p className="text-gray-600">
                Empezá a cargar autos y dejá el papel para siempre.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">Elegí el plan para tu lavadero</h3>
            <p className="text-xl text-gray-600">Sin costos ocultos. Cancelá cuando quieras.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Plan Básico */}
            <div className="bg-white p-8 rounded-2xl shadow-xl border-2 border-blue-200 hover:shadow-2xl transition-shadow">
              <div className="text-center mb-6">
                <h4 className="text-2xl font-bold text-gray-900 mb-2">Plan Básico</h4>
                <p className="text-gray-600">Ideal para lavaderos pequeños</p>
              </div>
              <div className="text-center mb-8">
                <div className="text-5xl font-bold text-blue-600 mb-2">
                  $40.000
                </div>
                <div className="text-xl text-gray-600">
                  por mes
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <span className="text-green-500 mr-3 text-xl flex-shrink-0">✓</span>
                  <span><strong>15 días</strong> de prueba gratis</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-3 text-xl flex-shrink-0">✓</span>
                  <span>Gestión de vehículos completa</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-3 text-xl flex-shrink-0">✓</span>
                  <span>Precios automáticos por tipo</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-3 text-xl flex-shrink-0">✓</span>
                  <span>App móvil (PWA)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-3 text-xl flex-shrink-0">✓</span>
                  <span>Notificaciones por WhatsApp</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-3 text-xl flex-shrink-0">✓</span>
                  <span>Historial y búsqueda</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-3 text-xl flex-shrink-0">✓</span>
                  <span>Exportar a Excel</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-3 text-xl flex-shrink-0">✓</span>
                  <span>Soporte por WhatsApp</span>
                </li>
              </ul>
              <Link
                href="/registro"
                className="block w-full bg-blue-600 text-white px-6 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl text-center"
              >
                Empezar gratis
              </Link>
            </div>

            {/* Plan Pro */}
            <div className="bg-gradient-to-br from-purple-50 to-white p-8 rounded-2xl shadow-xl border-2 border-purple-400 hover:shadow-2xl transition-shadow relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-purple-600 text-white px-6 py-2 rounded-full text-sm font-bold">
                  MÁS POPULAR
                </span>
              </div>
              <div className="text-center mb-6 mt-4">
                <h4 className="text-2xl font-bold text-gray-900 mb-2">Plan Pro</h4>
                <p className="text-gray-600">Para lavaderos profesionales</p>
              </div>
              <div className="text-center mb-8">
                <div className="text-5xl font-bold text-purple-600 mb-2">
                  $65.000
                </div>
                <div className="text-xl text-gray-600">
                  por mes
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <span className="text-green-500 mr-3 text-xl flex-shrink-0">✓</span>
                  <span><strong>Todo lo del Plan Básico</strong></span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-3 text-xl flex-shrink-0">★</span>
                  <span><strong>Cuentas Corrientes</strong> para clientes</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-3 text-xl flex-shrink-0">★</span>
                  <span><strong>Reportes y Estadísticas</strong> avanzadas</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-3 text-xl flex-shrink-0">★</span>
                  <span><strong>Multi-usuario</strong> con roles</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-3 text-xl flex-shrink-0">★</span>
                  <span><strong>Control de Caja</strong> diario</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-3 text-xl flex-shrink-0">★</span>
                  <span><strong>Análisis de horarios</strong> pico</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-3 text-xl flex-shrink-0">★</span>
                  <span><strong>Top clientes</strong> y frecuentes</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-3 text-xl flex-shrink-0">✓</span>
                  <span>Soporte prioritario</span>
                </li>
              </ul>
              <Link
                href="/registro"
                className="block w-full bg-purple-600 text-white px-6 py-4 rounded-lg text-lg font-semibold hover:bg-purple-700 transition-all shadow-lg hover:shadow-xl text-center"
              >
                Empezar gratis
              </Link>
            </div>
          </div>

          <p className="text-center text-gray-600 mt-8">
            💳 Ambos planes incluyen 15 días de prueba gratis. Sin tarjeta de crédito.
          </p>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-4xl font-bold mb-4">
            ¿Listo para modernizar tu lavadero?
          </h3>
          <p className="text-xl mb-8 opacity-90">
            Unite a lavaderos que ya dejaron el papel atrás
          </p>
          <Link
            href="/registro"
            className="inline-block bg-white text-blue-600 px-10 py-4 rounded-lg text-xl font-semibold hover:bg-gray-100 transition-all shadow-xl"
          >
            Probar gratis 15 días →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="text-3xl">🚗</div>
                <h4 className="text-xl font-bold">Chasis</h4>
              </div>
              <p className="text-gray-400">
                Sistema de gestión digital para lavaderos de autos
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4">Producto</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white">Funciones</a></li>
                <li><a href="#" className="hover:text-white">Precios</a></li>
                <li><Link href="/login-saas" className="hover:text-white">Ingresar</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Contacto</h4>
              <ul className="space-y-2 text-gray-400">
                <li>📧 Soporte por email</li>
                <li>📱 Soporte por WhatsApp</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>© 2026 Chasis - Sistema de gestión para lavaderos de autos</p>
            <p className="mt-2 text-sm">
              Desarrollado en Argentina 🇦🇷 con ❤️
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
