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
        <p className="text-xl text-gray-800 mb-10 max-w-2xl mx-auto">
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

      {/* Demo Animado con Celular */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">
              Así de simple es gestionar tu lavadero
            </h3>
            <p className="text-xl text-gray-800">
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

                  {/* Screen Content - animated cycle with 5 steps */}
                  <div className="relative w-full h-full bg-white rounded-[40px] overflow-hidden">
                    {/* Step 1: Complete Form with Auto-fill (0s - 2.5s) */}
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-white overflow-y-auto demo-step demo-step-1">
                      <div className="bg-blue-600 text-white p-3 mb-3">
                        <h5 className="font-bold text-sm">📝 Nuevo Auto</h5>
                      </div>
                      <div className="px-3 pb-3 space-y-2">
                        {/* Patente */}
                        <div>
                          <label className="block text-[10px] font-semibold text-gray-700 mb-1">Patente</label>
                          <input
                            type="text"
                            value="ABC123"
                            readOnly
                            className="w-full px-2 py-1.5 border-2 border-blue-500 rounded-lg bg-blue-50 text-gray-900 font-mono font-bold text-center text-sm"
                          />
                          <p className="text-[9px] text-green-600 mt-1 font-semibold animate-pulse">✓ Cliente encontrado</p>
                        </div>

                        {/* Marca y Modelo */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-semibold text-gray-700 mb-1">Marca</label>
                            <input type="text" value="Toyota" readOnly className="w-full px-2 py-1 border border-gray-300 rounded text-[11px]" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-gray-700 mb-1">Modelo</label>
                            <input type="text" value="Corolla" readOnly className="w-full px-2 py-1 border border-gray-300 rounded text-[11px]" />
                          </div>
                        </div>

                        {/* Tipo de Vehículo */}
                        <div>
                          <label className="block text-[10px] font-semibold text-gray-700 mb-1">Tipo de Vehículo</label>
                          <div className="w-full px-2 py-1 border border-gray-300 rounded text-[11px] bg-white">Auto ▼</div>
                        </div>

                        {/* Tipos de Limpieza */}
                        <div>
                          <label className="block text-[10px] font-semibold text-gray-700 mb-1">Tipos de Limpieza</label>
                          <div className="space-y-1">
                            <label className="flex items-center text-[10px]">
                              <input type="checkbox" checked readOnly className="mr-1.5 w-3 h-3" />
                              <span>Simple Exterior</span>
                            </label>
                            <label className="flex items-center text-[10px]">
                              <input type="checkbox" checked readOnly className="mr-1.5 w-3 h-3" />
                              <span>Simple</span>
                            </label>
                          </div>
                        </div>

                        {/* Nombre */}
                        <div>
                          <label className="block text-[10px] font-semibold text-gray-700 mb-1">Nombre</label>
                          <input type="text" value="Juan Pérez" readOnly className="w-full px-2 py-1 border border-gray-300 rounded text-[11px]" />
                        </div>

                        {/* Celular */}
                        <div>
                          <label className="block text-[10px] font-semibold text-gray-700 mb-1">Celular</label>
                          <input type="text" value="11-1234567" readOnly className="w-full px-2 py-1 border border-gray-300 rounded text-[11px]" />
                        </div>

                        {/* Extras */}
                        <div>
                          <label className="block text-[10px] font-semibold text-gray-700 mb-1">Extras</label>
                          <div className="flex gap-2">
                            <input type="text" value="Lavado de tapiz" readOnly className="flex-1 px-2 py-1 border border-gray-300 rounded text-[10px]" />
                            <input type="text" value="$0" readOnly className="w-16 px-2 py-1 border border-gray-300 rounded text-[10px]" />
                          </div>
                        </div>

                        {/* Button */}
                        <button className="w-full bg-blue-600 text-white px-3 py-2 rounded-lg text-xs font-bold mt-2 pulse-animation">
                          💰 Registrar Auto
                        </button>
                      </div>
                    </div>

                    {/* Step 2: En Proceso (2.5s - 4s) */}
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-white demo-step demo-step-2">
                      <div className="bg-blue-600 text-white p-3 mb-3">
                        <h5 className="font-bold text-sm">🚗 Panel Principal</h5>
                      </div>
                      <div className="px-3 space-y-3">
                        <div className="bg-yellow-50 rounded-lg p-2.5 border-2 border-yellow-200">
                          <div className="flex items-center justify-between mb-2">
                            <h6 className="font-bold text-xs">🔄 En Proceso</h6>
                            <span className="bg-yellow-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold">1</span>
                          </div>
                          <div className="bg-white p-2.5 rounded-lg shadow">
                            <div className="font-bold text-sm text-gray-900">ABC123</div>
                            <div className="text-[10px] text-gray-800">Juan Pérez</div>
                            <div className="text-[10px] text-gray-600">Lavado Completo</div>
                            <button className="mt-2 w-full bg-green-500 text-white px-2 py-1 rounded text-[10px] font-semibold pulse-animation">
                              ✓ Marcar Listo
                            </button>
                          </div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-2.5 border-2 border-green-200 opacity-40">
                          <div className="flex items-center justify-between">
                            <h6 className="font-bold text-xs">✅ Listo</h6>
                            <span className="bg-green-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold">0</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Step 3: Listo (4s - 5.5s) */}
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-white demo-step demo-step-3">
                      <div className="bg-blue-600 text-white p-3 mb-3">
                        <h5 className="font-bold text-sm">🚗 Panel Principal</h5>
                      </div>
                      <div className="px-3 space-y-3">
                        <div className="bg-yellow-50 rounded-lg p-2.5 border-2 border-yellow-200 opacity-40">
                          <div className="flex items-center justify-between">
                            <h6 className="font-bold text-xs">🔄 En Proceso</h6>
                            <span className="bg-yellow-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold">0</span>
                          </div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-2.5 border-2 border-green-200">
                          <div className="flex items-center justify-between mb-2">
                            <h6 className="font-bold text-xs">✅ Listo</h6>
                            <span className="bg-green-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold">1</span>
                          </div>
                          <div className="bg-white p-2.5 rounded-lg shadow">
                            <div className="font-bold text-sm text-gray-900">ABC123</div>
                            <div className="text-[10px] text-gray-800">Juan Pérez</div>
                            <div className="text-[10px] text-gray-600">Lavado Completo</div>
                            <button className="mt-2 w-full bg-green-500 text-white px-2 py-1 rounded text-[10px] font-semibold pulse-animation">
                              💬 Enviar WhatsApp
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Step 4: WhatsApp (5.5s - 7s) */}
                    <div className="absolute inset-0 bg-[#075e54] demo-step demo-step-4">
                      <div className="bg-[#128c7e] text-white p-3 flex items-center mb-3">
                        <div className="text-xl mr-2">💬</div>
                        <div>
                          <h5 className="font-bold text-sm">Juan Pérez</h5>
                          <p className="text-[9px] opacity-80">en línea</p>
                        </div>
                      </div>
                      <div className="px-3">
                        <div className="bg-[#dcf8c6] rounded-lg p-2.5 mb-2 max-w-[85%] ml-auto">
                          <p className="text-[10px] text-gray-900 leading-relaxed">
                            Hola Juan! Tu auto<br />
                            <strong>ABC123 (Toyota Corolla)</strong><br />
                            ya está listo para retirar.<br /><br />
                            Gracias por confiar en LAVAPP!
                          </p>
                          <div className="flex items-center justify-end gap-1 mt-1">
                            <span className="text-[8px] text-gray-600">14:30</span>
                            <span className="text-blue-500 text-[10px]">✓✓</span>
                          </div>
                        </div>
                        <div className="absolute bottom-3 left-3 right-3 bg-white rounded-full p-2 flex items-center shadow-lg">
                          <input
                            type="text"
                            placeholder="Mensaje..."
                            readOnly
                            className="flex-1 text-[10px] outline-none px-2"
                          />
                          <button className="bg-[#128c7e] text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                            ➤
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Step 5: Entregado (7s - 8s) */}
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-white demo-step demo-step-5">
                      <div className="bg-blue-600 text-white p-3 mb-3">
                        <h5 className="font-bold text-sm">🚗 Panel Principal</h5>
                      </div>
                      <div className="px-3 space-y-3">
                        <div className="bg-yellow-50 rounded-lg p-2.5 border-2 border-yellow-200 opacity-40">
                          <div className="flex items-center justify-between">
                            <h6 className="font-bold text-xs">🔄 En Proceso</h6>
                            <span className="bg-yellow-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold">0</span>
                          </div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-2.5 border-2 border-green-200 opacity-40">
                          <div className="flex items-center justify-between">
                            <h6 className="font-bold text-xs">✅ Listo</h6>
                            <span className="bg-green-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold">0</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-center py-8">
                          <div className="text-center scale-in">
                            <div className="text-4xl mb-2">✅</div>
                            <p className="text-xs font-bold text-green-600">Auto entregado exitosamente</p>
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
                    <p className="text-gray-800 text-sm">
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
                    <p className="text-gray-800 text-sm">
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
                    <p className="text-gray-800 text-sm">
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
            <p className="text-xl text-gray-800">
              Dejá de usar papel y calculadora. Modernizá tu lavadero hoy.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow border border-blue-100">
              <div className="flex items-center justify-between mb-4">
                <div className="text-4xl">📋</div>
              </div>
              <h4 className="text-xl font-bold mb-3 text-gray-900">Gestión de Vehículos</h4>
              <p className="text-gray-800 mb-4">
                Registrá patentes, marca, modelo y servicio. Control de estados: En Proceso → Listo → Entregado.
              </p>
              <ul className="space-y-2 text-sm text-gray-800">
                <li>✓ Registro rápido de autos</li>
                <li>✓ Autocompletado de clientes</li>
                <li>✓ Estados visuales claros</li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-green-50 to-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow border border-green-100">
              <div className="flex items-center justify-between mb-4">
                <div className="text-4xl">💰</div>
              </div>
              <h4 className="text-xl font-bold mb-3 text-gray-900">Gestión de Precios</h4>
              <p className="text-gray-800 mb-4">
                Precios automáticos según tipo de vehículo y servicio. Agregá servicios adicionales fácilmente.
              </p>
              <ul className="space-y-2 text-sm text-gray-800">
                <li>✓ 5 tipos de vehículo (Auto, SUV, Camioneta, XL, Moto)</li>
                <li>✓ 6 tipos de lavado</li>
                <li>✓ Cálculo automático de precios</li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-purple-50 to-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow border border-purple-100">
              <div className="flex items-center justify-between mb-4">
                <div className="text-4xl">📱</div>
              </div>
              <h4 className="text-xl font-bold mb-3 text-gray-900">App Móvil (PWA)</h4>
              <p className="text-gray-800 mb-4">
                Usalo desde tu celular sin instalar nada. Funciona como app nativa en iPhone y Android.
              </p>
              <ul className="space-y-2 text-sm text-gray-800">
                <li>✓ Sin instalación de tienda</li>
                <li>✓ Funciona offline</li>
                <li>✓ Acceso instantáneo</li>
              </ul>
            </div>

            {/* Feature 4 */}
            <div className="bg-gradient-to-br from-yellow-50 to-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow border border-yellow-100">
              <div className="flex items-center justify-between mb-4">
                <div className="text-4xl">📲</div>
              </div>
              <h4 className="text-xl font-bold mb-3 text-gray-900">Notificaciones WhatsApp</h4>
              <p className="text-gray-800 mb-4">
                Avisá a tus clientes automáticamente cuando su auto está listo con un solo click.
              </p>
              <ul className="space-y-2 text-sm text-gray-800">
                <li>✓ Mensajes personalizados</li>
                <li>✓ Un click para notificar</li>
                <li>✓ Mejora la experiencia del cliente</li>
              </ul>
            </div>

            {/* Feature 5 */}
            <div className="bg-gradient-to-br from-red-50 to-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow border border-red-100">
              <div className="flex items-center justify-between mb-4">
                <div className="text-4xl">📊</div>
              </div>
              <h4 className="text-xl font-bold mb-3 text-gray-900">Historial Completo</h4>
              <p className="text-gray-800 mb-4">
                Acceso a todos los registros históricos con búsqueda por patente, fecha o cliente.
              </p>
              <ul className="space-y-2 text-sm text-gray-800">
                <li>✓ Búsqueda avanzada</li>
                <li>✓ Filtros por fecha</li>
                <li>✓ Exportar a Excel</li>
              </ul>
            </div>

            {/* Feature 6 */}
            <div className="bg-gradient-to-br from-indigo-50 to-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow border border-indigo-100">
              <div className="flex items-center justify-between mb-4">
                <div className="text-4xl">💳</div>
              </div>
              <h4 className="text-xl font-bold mb-3 text-gray-900">Cuentas Corrientes</h4>
              <p className="text-gray-800 mb-4">
                Clientes frecuentes pueden pagar a fin de mes. Genera anticipos de pago para empresas. Control total de saldos y movimientos.
              </p>
              <ul className="space-y-2 text-sm text-gray-800">
                <li>✓ Saldos actualizados automáticamente</li>
                <li>✓ Historial de movimientos</li>
                <li>✓ Anticipos de pago</li>
              </ul>
            </div>

            {/* Feature 7 */}
            <div className="bg-gradient-to-br from-orange-50 to-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow border border-orange-100">
              <div className="flex items-center justify-between mb-4">
                <div className="text-4xl">📈</div>
              </div>
              <h4 className="text-xl font-bold mb-3 text-gray-900">Reportes y Estadísticas</h4>
              <p className="text-gray-800 mb-4">
                Visualización de cantidad de autos por día y por franja horaria. Reportes de ventas, caja diaria y estadísticas de clientes.
              </p>
              <ul className="space-y-2 text-sm text-gray-800">
                <li>✓ Facturación diaria/semanal/mensual</li>
                <li>✓ Autos por día y franja horaria</li>
                <li>✓ Top clientes y servicios</li>
              </ul>
            </div>

            {/* Feature 8 */}
            <div className="bg-gradient-to-br from-pink-50 to-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow border border-pink-100">
              <div className="flex items-center justify-between mb-4">
                <div className="text-4xl">👥</div>
              </div>
              <h4 className="text-xl font-bold mb-3 text-gray-900">Multi-usuario con Roles</h4>
              <p className="text-gray-800 mb-4">
                Accesos diferenciados: Admin (dueño) y Operadores (lavadores). Usuarios ilimitados y trazabilidad de acciones.
              </p>
              <ul className="space-y-2 text-sm text-gray-800">
                <li>✓ Usuarios ilimitados</li>
                <li>✓ Roles: Admin y Operador</li>
                <li>✓ Trazabilidad de acciones</li>
              </ul>
            </div>

            {/* Feature 9 */}
            <div className="bg-gradient-to-br from-teal-50 to-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow border border-teal-100">
              <div className="flex items-center justify-between mb-4">
                <div className="text-4xl">💵</div>
              </div>
              <h4 className="text-xl font-bold mb-3 text-gray-900">Control de Caja</h4>
              <p className="text-gray-800 mb-4">
                Reporte de caja diaria discriminado por efectivo, transferencia y cancelados.
              </p>
              <ul className="space-y-2 text-sm text-gray-800">
                <li>✓ Efectivo vs Transferencias</li>
                <li>✓ Registros anulados/cancelados</li>
                <li>✓ Cierre de caja diario</li>
              </ul>
            </div>

            {/* Feature 10 */}
            <div className="bg-gradient-to-br from-green-50 to-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow border border-green-100">
              <div className="flex items-center justify-between mb-4">
                <div className="text-4xl">📋</div>
              </div>
              <h4 className="text-xl font-bold mb-3 text-gray-900">Encuestas de Satisfacción</h4>
              <p className="text-gray-800 mb-4">
                Generación de links de encuestas para enviar por WhatsApp. Recibí feedback de tus clientes y mejorá la calidad del servicio.
              </p>
              <ul className="space-y-2 text-sm text-gray-800">
                <li>✓ Link listo para compartir</li>
                <li>✓ Integración con WhatsApp</li>
                <li>✓ Reportes de satisfacción</li>
              </ul>
            </div>

            {/* Feature 11 */}
            <div className="bg-gradient-to-br from-cyan-50 to-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow border border-cyan-100">
              <div className="flex items-center justify-between mb-4">
                <div className="text-4xl">💵</div>
              </div>
              <h4 className="text-xl font-bold mb-3 text-gray-900">Upselling Inteligente</h4>
              <p className="text-gray-800 mb-4">
                Sugerencias automáticas de servicios adicionales según el vehículo. Aumentá tus ventas ofreciendo encerado, aspirado, limpieza de tapizados y más.
              </p>
              <ul className="space-y-2 text-sm text-gray-800">
                <li>✓ Sugerencias personalizadas</li>
                <li>✓ Incremento de ticket promedio</li>
                <li>✓ Configuración por tipo de vehículo</li>
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
            <p className="text-xl text-gray-800">
              Empezá a usar LAVAPP en 3 simples pasos
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h4 className="text-xl font-bold mb-2">Registrate</h4>
              <p className="text-gray-800">
                Creá tu cuenta en 2 minutos. Solo necesitás un email.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h4 className="text-xl font-bold mb-2">Configurá tu lavadero</h4>
              <p className="text-gray-800">
                Agregá tus precios y usuarios. Todo listo para operar.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h4 className="text-xl font-bold mb-2">¡Listo!</h4>
              <p className="text-gray-800">
                Empezá a cargar autos y dejá el papel para siempre.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing - Plan Único */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">Todo lo que necesitás, un solo precio</h3>
            <p className="text-xl text-gray-800">Sin costos ocultos. Sin funcionalidades limitadas. Sin sorpresas.</p>
          </div>

          <div className="max-w-2xl mx-auto">
            {/* Plan Único */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-10 rounded-3xl shadow-2xl border-2 border-blue-400 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-2 rounded-full text-sm font-bold">
                  TODO INCLUIDO
                </span>
              </div>
              <div className="text-center mb-6 mt-2">
                <h4 className="text-3xl font-bold text-gray-900 mb-2">LAVAPP Profesional</h4>
                <p className="text-lg text-gray-800">Todas las funcionalidades para tu lavadero</p>
              </div>
              <div className="text-center mb-10">
                <div className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  $85.000
                </div>
                <div className="text-2xl text-gray-800 font-medium">
                  por mes
                </div>
                <div className="mt-2 text-green-600 font-semibold">
                  ✓ 15 días de prueba gratis
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-8">
                <div>
                  <h5 className="font-bold text-gray-900 mb-3 flex items-center">
                    <span className="text-blue-600 mr-2">📱</span> Gestión Completa
                  </h5>
                  <ul className="space-y-2">
                    <li className="flex items-start text-sm">
                      <span className="text-green-500 mr-2 flex-shrink-0">✓</span>
                      <span>Carga y seguimiento de vehículos</span>
                    </li>
                    <li className="flex items-start text-sm">
                      <span className="text-green-500 mr-2 flex-shrink-0">✓</span>
                      <span>Listas de precios personalizadas</span>
                    </li>
                    <li className="flex items-start text-sm">
                      <span className="text-green-500 mr-2 flex-shrink-0">✓</span>
                      <span>App móvil instalable (PWA)</span>
                    </li>
                    <li className="flex items-start text-sm">
                      <span className="text-green-500 mr-2 flex-shrink-0">✓</span>
                      <span>Notificaciones WhatsApp automáticas</span>
                    </li>
                    <li className="flex items-start text-sm">
                      <span className="text-green-500 mr-2 flex-shrink-0">✓</span>
                      <span>Historial completo y búsqueda</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h5 className="font-bold text-gray-900 mb-3 flex items-center">
                    <span className="text-purple-600 mr-2">⭐</span> Funciones Avanzadas
                  </h5>
                  <ul className="space-y-2">
                    <li className="flex items-start text-sm">
                      <span className="text-green-500 mr-2 flex-shrink-0">✓</span>
                      <span>Cuentas corrientes para clientes</span>
                    </li>
                    <li className="flex items-start text-sm">
                      <span className="text-green-500 mr-2 flex-shrink-0">✓</span>
                      <span>Multi-usuario con roles y permisos</span>
                    </li>
                    <li className="flex items-start text-sm">
                      <span className="text-green-500 mr-2 flex-shrink-0">✓</span>
                      <span>Reportes y estadísticas detalladas</span>
                    </li>
                    <li className="flex items-start text-sm">
                      <span className="text-green-500 mr-2 flex-shrink-0">✓</span>
                      <span>Encuestas de satisfacción y beneficios</span>
                    </li>
                    <li className="flex items-start text-sm">
                      <span className="text-green-500 mr-2 flex-shrink-0">✓</span>
                      <span>Exportar datos a Excel</span>
                    </li>
                  </ul>
                </div>
              </div>

              <Link
                href="/registro"
                className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-5 rounded-xl text-xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all shadow-xl hover:shadow-2xl text-center transform hover:scale-105"
              >
                Empezar gratis por 15 días
              </Link>

              <p className="text-center text-sm text-gray-800 mt-4">
                💳 Sin tarjeta de crédito. Cancelá cuando quieras.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-800 text-lg mb-2">
              <strong>¿Necesitás un descuento especial?</strong>
            </p>
            <p className="text-gray-800">
              Contactanos por WhatsApp y hablamos de tu caso particular.
            </p>
          </div>
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
