import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="text-3xl">🚗</div>
            <h1 className="text-2xl font-bold text-blue-600">LAVAPP</h1>
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

      {/* Demo Animado con Celular */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">
              Así de simple es gestionar tu lavadero
            </h3>
            <p className="text-xl text-gray-600">
              Desde que ingresa un auto hasta que se entrega: todo en segundos
            </p>
          </div>

          <div className="flex flex-col lg:flex-row items-start justify-center gap-12">
            {/* Phone Mockup with Animation */}
            <div className="relative flex-shrink-0">
              {/* Hand holding phone (decorative SVG at bottom) */}
              <div className="relative inline-block">
                {/* Phone Frame */}
                <div className="relative w-[320px] h-[640px] bg-gray-900 rounded-[50px] shadow-2xl p-3 border-8 border-gray-800">
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-3xl z-10"></div>

                  {/* Screen Content - animated cycle */}
                  <div className="relative w-full h-full bg-white rounded-[40px] overflow-hidden">
                    {/* Step 1: Entering License Plate with Auto-fill */}
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-white p-4 demo-step demo-step-1">
                      <div className="bg-blue-600 text-white p-3 rounded-t-2xl -mx-4 -mt-4 mb-4">
                        <h5 className="font-bold text-sm">📝 Nuevo Auto</h5>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">Patente</label>
                          <input
                            type="text"
                            value="AA 123 BC"
                            readOnly
                            className="w-full px-3 py-2 border-2 border-blue-500 rounded-lg bg-blue-50 text-gray-900 font-mono font-bold text-center text-lg"
                          />
                          <p className="text-xs text-green-600 mt-2 font-semibold animate-pulse">✓ Cliente encontrado - datos cargados automáticamente</p>
                        </div>
                        <div className="bg-green-50 border-2 border-green-300 rounded-lg p-3 space-y-1">
                          <p className="text-xs text-gray-600 font-semibold mb-2">Datos del cliente:</p>
                          <p className="text-sm font-semibold text-gray-900">Juan Pérez</p>
                          <p className="text-xs text-gray-600">Toyota Corolla</p>
                          <p className="text-xs text-gray-600">11 2345-6789</p>
                        </div>
                      </div>
                    </div>

                    {/* Step 2: Car in "En Proceso" */}
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-white p-4 demo-step demo-step-2">
                      <div className="bg-blue-600 text-white p-3 rounded-t-2xl -mx-4 -mt-4 mb-4">
                        <h5 className="font-bold text-sm">🚗 Panel Principal</h5>
                      </div>
                      <div className="space-y-3">
                        <div className="bg-yellow-50 rounded-lg p-3 border-2 border-yellow-200">
                          <div className="flex items-center justify-between mb-2">
                            <h6 className="font-bold text-sm">🔄 En Proceso</h6>
                            <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold">1</span>
                          </div>
                          <div className="bg-white p-3 rounded-lg shadow">
                            <div className="font-bold text-sm text-gray-900">AA 123 BC</div>
                            <div className="text-xs text-gray-600">Juan Pérez</div>
                            <div className="text-xs text-gray-500">Lavado Completo</div>
                            <div className="text-xs text-blue-600 font-semibold mt-1">$18.000</div>
                          </div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-3 border-2 border-green-200 opacity-40">
                          <div className="flex items-center justify-between">
                            <h6 className="font-bold text-sm">✅ Listo</h6>
                            <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">0</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Step 3: Moving to "Listo" */}
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-white p-4 demo-step demo-step-3">
                      <div className="bg-blue-600 text-white p-3 rounded-t-2xl -mx-4 -mt-4 mb-4">
                        <h5 className="font-bold text-sm">🚗 Panel Principal</h5>
                      </div>
                      <div className="space-y-3">
                        <div className="bg-yellow-50 rounded-lg p-3 border-2 border-yellow-200 opacity-40">
                          <div className="flex items-center justify-between">
                            <h6 className="font-bold text-sm">🔄 En Proceso</h6>
                            <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold">0</span>
                          </div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-3 border-2 border-green-200">
                          <div className="flex items-center justify-between mb-2">
                            <h6 className="font-bold text-sm">✅ Listo</h6>
                            <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">1</span>
                          </div>
                          <div className="bg-white p-3 rounded-lg shadow">
                            <div className="font-bold text-sm text-gray-900">AA 123 BC</div>
                            <div className="text-xs text-gray-600">Juan Pérez</div>
                            <div className="text-xs text-gray-500">Lavado Completo</div>
                            <div className="text-xs text-blue-600 font-semibold mt-1">$18.000</div>
                            <button className="mt-2 w-full bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">
                              💬 Avisar por WhatsApp
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>

            {/* Explanation Cards */}
            <div className="flex-1 max-w-md space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-200">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">1</div>
                  <div>
                    <h4 className="font-bold text-lg text-gray-900 mb-2">Ingreso ultrarrápido</h4>
                    <p className="text-gray-600 text-sm">
                      Escribís la patente y si el cliente ya vino antes, <strong>todos sus datos se cargan automáticamente</strong>:
                      nombre, teléfono, marca y modelo. Elegís el servicio y listo.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-yellow-200">
                <div className="flex items-start gap-4">
                  <div className="bg-yellow-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">2</div>
                  <div>
                    <h4 className="font-bold text-lg text-gray-900 mb-2">Seguimiento en tiempo real</h4>
                    <p className="text-gray-600 text-sm">
                      El auto aparece en <strong>"En Proceso"</strong>. Con un toque lo movés a <strong>"Listo"</strong> cuando terminaste.
                      Todo visual, sin papel.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-200">
                <div className="flex items-start gap-4">
                  <div className="bg-green-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">3</div>
                  <div>
                    <h4 className="font-bold text-lg text-gray-900 mb-2">Aviso por WhatsApp</h4>
                    <p className="text-gray-600 text-sm">
                      Cuando está listo, <strong>un botón te arma el mensaje completo</strong> con todos los datos del cliente.
                      Lo avisás en 2 segundos. Los autos entregados se guardan automáticamente en el Historial.
                    </p>
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
                Clientes frecuentes pueden pagar a fin de mes. Genera anticipos de pago para empresas. Control total de saldos y movimientos.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ Saldos actualizados automáticamente</li>
                <li>✓ Historial de movimientos</li>
                <li>✓ Anticipos de pago</li>
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
                Visualización de cantidad de autos por día y por franja horaria. Reportes de ventas, caja diaria y estadísticas de clientes.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ Facturación diaria/semanal/mensual</li>
                <li>✓ Autos por día y franja horaria</li>
                <li>✓ Top clientes y servicios</li>
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
                Accesos diferenciados: Admin (dueño) y Operadores (lavadores). Usuarios ilimitados y trazabilidad de acciones.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ Usuarios ilimitados</li>
                <li>✓ Roles: Admin y Operador</li>
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

            {/* Feature 10 - PRO */}
            <div className="bg-gradient-to-br from-green-50 to-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow border-2 border-green-300">
              <div className="flex items-center justify-between mb-4">
                <div className="text-4xl">📋</div>
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-semibold">PRO</span>
              </div>
              <h4 className="text-xl font-bold mb-3 text-gray-900">Encuestas de Satisfacción</h4>
              <p className="text-gray-600 mb-4">
                Generación de links de encuestas para enviar por WhatsApp. Recibí feedback de tus clientes y mejorá la calidad del servicio.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ Link listo para compartir</li>
                <li>✓ Integración con WhatsApp</li>
                <li>✓ Reportes de satisfacción</li>
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

            {/* Con LAVAPP */}
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-8">
              <h4 className="text-2xl font-bold text-green-700 mb-6">✅ Con LAVAPP</h4>
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
              Empezá a usar LAVAPP en 3 simples pasos
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
                  <span><strong>Autos por día</strong> y franja horaria</span>
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
                <h4 className="text-xl font-bold">LAVAPP</h4>
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
            <p>© 2026 LAVAPP - Sistema de gestión para lavaderos de autos</p>
            <p className="mt-2 text-sm">
              Desarrollado en Argentina 🇦🇷 con ❤️
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
