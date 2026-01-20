-- ============================================================
-- MIGRACIÓN: Sistema de Upselling Inteligente
-- Descripción: Detecta top 20% clientes frecuentes que nunca 
--              pidieron servicios premium y muestra ofertas
-- ============================================================

-- Tabla de promociones configurables por el admin
CREATE TABLE IF NOT EXISTS promociones_upselling (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT NOT NULL,
    servicios_objetivo VARCHAR(500) NOT NULL, -- JSON array de servicios premium: ["chasis", "motor", "pulido"]
    descuento_porcentaje INTEGER DEFAULT 0,
    descuento_fijo DECIMAL(10,2) DEFAULT 0,
    activa BOOLEAN DEFAULT true,
    fecha_inicio DATE,
    fecha_fin DATE,
    empresa_id INTEGER, -- NULL para DeltaWash, ID para empresas SaaS
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de interacciones del banner de upselling
CREATE TABLE IF NOT EXISTS upselling_interacciones (
    id SERIAL PRIMARY KEY,
    cliente_nombre VARCHAR(100) NOT NULL,
    cliente_celular VARCHAR(20) NOT NULL,
    promocion_id INTEGER REFERENCES promociones_upselling(id),
    accion VARCHAR(50) NOT NULL, -- 'aceptado', 'rechazado', 'interes_futuro'
    descuento_aplicado DECIMAL(10,2),
    registro_id INTEGER REFERENCES registros_lavado(id), -- Si aceptó, ID del registro creado
    empresa_id INTEGER, -- NULL para DeltaWash, ID para empresas SaaS
    fecha_interaccion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notas TEXT
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_promociones_empresa ON promociones_upselling(empresa_id);
CREATE INDEX IF NOT EXISTS idx_promociones_activa ON promociones_upselling(activa);
CREATE INDEX IF NOT EXISTS idx_upselling_cliente ON upselling_interacciones(cliente_celular);
CREATE INDEX IF NOT EXISTS idx_upselling_empresa ON upselling_interacciones(empresa_id);

-- Insertar promoción por defecto (ejemplo)
INSERT INTO promociones_upselling (
    nombre,
    descripcion,
    servicios_objetivo,
    descuento_porcentaje,
    activa,
    empresa_id
) VALUES (
    '¡Upgrade Premium!',
    '🌟 ¡Cliente VIP! Te ofrecemos un 15% de descuento en nuestros servicios premium: Limpieza de Chasis, Motor o Pulido de Ópticas. ¡Dale a tu auto el cuidado que merece!',
    '["chasis", "motor", "pulido"]',
    15,
    true,
    NULL
) ON CONFLICT DO NOTHING;

-- Comentarios para documentación
COMMENT ON TABLE promociones_upselling IS 'Almacena las promociones configurables para el sistema de upselling';
COMMENT ON TABLE upselling_interacciones IS 'Registra las interacciones de los clientes con el banner de upselling';
COMMENT ON COLUMN promociones_upselling.servicios_objetivo IS 'Array JSON de palabras clave que identifican servicios premium (chasis, motor, pulido)';
COMMENT ON COLUMN upselling_interacciones.accion IS 'Tipo de interacción: aceptado, rechazado, interes_futuro';
