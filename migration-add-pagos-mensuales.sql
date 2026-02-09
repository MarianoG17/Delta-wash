-- ============================================
-- MIGRACIÓN: Sistema de Gestión de Pagos Mensuales
-- Fecha: 2026-02-09
-- Descripción: Crear tabla pagos_mensuales y agregar columnas a empresas
-- ============================================
-- 1. AGREGAR COLUMNAS A EMPRESAS
ALTER TABLE empresas
ADD COLUMN IF NOT EXISTS dias_mora INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS ultimo_pago_fecha DATE,
    ADD COLUMN IF NOT EXISTS suspendido_por_falta_pago BOOLEAN DEFAULT false;
-- 2. CREAR TABLA PAGOS_MENSUALES
CREATE TABLE IF NOT EXISTS pagos_mensuales (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    -- Período del pago
    mes INTEGER NOT NULL CHECK (
        mes >= 1
        AND mes <= 12
    ),
    anio INTEGER NOT NULL CHECK (anio >= 2024),
    fecha_vencimiento DATE NOT NULL,
    -- Montos
    monto_base DECIMAL(10, 2) NOT NULL,
    -- Precio mensual base
    descuento_porcentaje INTEGER DEFAULT 0 CHECK (
        descuento_porcentaje >= 0
        AND descuento_porcentaje <= 100
    ),
    monto_final DECIMAL(10, 2) NOT NULL,
    -- Monto después del descuento
    -- Estado del pago
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (
        estado IN ('pendiente', 'pagado', 'vencido', 'cancelado')
    ),
    fecha_pago TIMESTAMP,
    -- Cuándo se registró el pago
    metodo_pago VARCHAR(50),
    -- Efectivo, transferencia, etc.
    comprobante TEXT,
    -- Número de comprobante o referencia
    -- Auditoría
    notas TEXT,
    registrado_por VARCHAR(100),
    -- Email del super admin que registró
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    -- Constraint: un solo registro por empresa por mes/año
    UNIQUE(empresa_id, mes, anio)
);
-- 3. CREAR ÍNDICES
CREATE INDEX IF NOT EXISTS idx_pagos_empresa ON pagos_mensuales(empresa_id);
CREATE INDEX IF NOT EXISTS idx_pagos_estado ON pagos_mensuales(estado);
CREATE INDEX IF NOT EXISTS idx_pagos_periodo ON pagos_mensuales(anio, mes);
CREATE INDEX IF NOT EXISTS idx_pagos_vencimiento ON pagos_mensuales(fecha_vencimiento);
-- 4. FUNCIÓN PARA ACTUALIZAR updated_at
CREATE OR REPLACE FUNCTION update_pagos_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- 5. TRIGGER PARA ACTUALIZAR updated_at
DROP TRIGGER IF EXISTS trigger_update_pagos_updated_at ON pagos_mensuales;
CREATE TRIGGER trigger_update_pagos_updated_at BEFORE
UPDATE ON pagos_mensuales FOR EACH ROW EXECUTE FUNCTION update_pagos_updated_at();
-- 6. FUNCIÓN PARA MARCAR PAGOS VENCIDOS
CREATE OR REPLACE FUNCTION marcar_pagos_vencidos() RETURNS void AS $$ BEGIN
UPDATE pagos_mensuales
SET estado = 'vencido'
WHERE estado = 'pendiente'
    AND fecha_vencimiento < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;
-- 7. COMENTARIOS PARA DOCUMENTACIÓN
COMMENT ON TABLE pagos_mensuales IS 'Registro de pagos mensuales de empresas';
COMMENT ON COLUMN pagos_mensuales.estado IS 'Estado del pago: pendiente, pagado, vencido, cancelado';
COMMENT ON COLUMN pagos_mensuales.monto_base IS 'Precio mensual base de la empresa';
COMMENT ON COLUMN pagos_mensuales.monto_final IS 'Monto después de aplicar descuento';
COMMENT ON COLUMN empresas.dias_mora IS 'Días de atraso en el pago';
COMMENT ON COLUMN empresas.suspendido_por_falta_pago IS 'Si la empresa fue suspendida por falta de pago';
-- ============================================
-- FIN DE MIGRACIÓN
-- ============================================