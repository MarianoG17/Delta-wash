-- ============================================
-- MIGRACIÓN: Sistema de Registro de Pagos
-- ============================================
-- Agrega campos para registrar pagos y método
-- ============================================

-- Agregar columnas de pago a registros_lavado
ALTER TABLE registros_lavado 
ADD COLUMN IF NOT EXISTS pagado BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS metodo_pago VARCHAR(20), -- 'efectivo', 'transferencia', 'cuenta_corriente'
ADD COLUMN IF NOT EXISTS fecha_pago TIMESTAMP,
ADD COLUMN IF NOT EXISTS monto_pagado DECIMAL(10,2);

-- Comentarios
COMMENT ON COLUMN registros_lavado.pagado IS 'Indica si el servicio fue pagado';
COMMENT ON COLUMN registros_lavado.metodo_pago IS 'Método de pago: efectivo, transferencia, cuenta_corriente';
COMMENT ON COLUMN registros_lavado.fecha_pago IS 'Fecha y hora en que se registró el pago';
COMMENT ON COLUMN registros_lavado.monto_pagado IS 'Monto pagado (puede diferir del precio si hay descuentos)';

-- Actualizar registros existentes que usaron cuenta corriente
-- Solo si la tabla movimientos_cuenta_corriente existe
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'movimientos_cuenta_corriente'
    ) THEN
        UPDATE registros_lavado
        SET pagado = TRUE,
            metodo_pago = 'cuenta_corriente',
            fecha_pago = fecha_ingreso,
            monto_pagado = precio
        WHERE id IN (
            SELECT DISTINCT registro_id
            FROM movimientos_cuenta_corriente
            WHERE tipo_movimiento = 'uso_servicio'
        );
        
        RAISE NOTICE 'Registros con cuenta corriente actualizados';
    ELSE
        RAISE NOTICE 'Tabla movimientos_cuenta_corriente no existe, saltando actualización';
    END IF;
END $$;

-- Actualizar registros que tienen usa_cuenta_corriente = TRUE
UPDATE registros_lavado
SET pagado = TRUE,
    metodo_pago = 'cuenta_corriente',
    fecha_pago = fecha_ingreso,
    monto_pagado = precio
WHERE usa_cuenta_corriente = TRUE
  AND (pagado IS NULL OR pagado = FALSE);

-- Verificar
SELECT 'Sistema de pagos agregado exitosamente' as resultado;

SELECT 
    COUNT(*) as total_registros,
    COUNT(CASE WHEN pagado = TRUE THEN 1 END) as registros_pagados,
    COUNT(CASE WHEN pagado = FALSE OR pagado IS NULL THEN 1 END) as registros_pendientes
FROM registros_lavado
WHERE (anulado IS NULL OR anulado = FALSE);
