-- Fix para encuestas públicas: agregar datos del vehículo
-- Esto permite que la API pública muestre info sin hacer JOIN a registros_lavado
ALTER TABLE surveys
ADD COLUMN IF NOT EXISTS vehicle_marca VARCHAR(200);
ALTER TABLE surveys
ADD COLUMN IF NOT EXISTS vehicle_patente VARCHAR(20);
ALTER TABLE surveys
ADD COLUMN IF NOT EXISTS vehicle_servicio VARCHAR(300);
-- Actualizar encuestas existentes con datos de registros_lavado
UPDATE surveys s
SET vehicle_marca = r.marca_modelo,
    vehicle_patente = r.patente,
    vehicle_servicio = r.tipo_limpieza
FROM registros_lavado r
WHERE s.visit_id = r.id
    AND s.vehicle_marca IS NULL;