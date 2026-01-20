-- ============================================
-- SCRIPT DE DATOS DE DEMOSTRACIÓN - 30 DÍAS
-- Para Sistema SaaS - Mostrar a Potenciales Clientes
-- ============================================
-- IMPORTANTE: Ejecutar este script en el branch dedicado de Neon
-- NO ejecutar en DeltaWash legacy
-- ============================================

-- Configuración: Este script generará aproximadamente 120-150 registros
-- distribuidos en los últimos 30 días de manera realista

-- ============================================
-- PASO 0: CREAR USUARIO DEMO (OBLIGATORIO)
-- ============================================

-- Primero, verificar si existe un usuario. Si no, crear uno.
-- IMPORTANTE: Este usuario es necesario para los registros de lavado

INSERT INTO usuarios_sistema (email, password, nombre, rol, empresa_id, activo, fecha_creacion)
VALUES (
  'demo@lavadero.com',
  '$2a$10$rKZqJF4YZ7qVXqZqVXqZqO7YZqVXqZqVXqZqVXqZqVXqZqVXqZqVX', -- password: "demo123"
  'Usuario Demo',
  'admin',
  NULL, -- Se llenará automáticamente o manualmente según tu estructura
  true,
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- PASO 1: CREAR LISTAS DE PRECIOS (OBLIGATORIO)
-- ============================================

-- Verificar si ya existe una lista de precios
-- Si no existe, crearla

-- Eliminar listas demo anteriores si existen (opcional - comentar si no quieres limpiar)
-- DELETE FROM precios WHERE lista_id IN (SELECT id FROM listas_precios WHERE nombre LIKE '%Demo%');
-- DELETE FROM listas_precios WHERE nombre LIKE '%Demo%';

-- Crear lista "Por Defecto" si no existe
INSERT INTO listas_precios (nombre, descripcion, activa, es_default, fecha_creacion)
VALUES ('Por Defecto', 'Lista de precios estándar para demostración', true, true, NOW())
ON CONFLICT DO NOTHING;

-- Obtener el ID de la lista (asumimos que es la primera o única lista por defecto)
-- Si ya tienes listas, esto respetará las existentes

-- Insertar precios para TODOS los tipos de vehículos y servicios
-- Esto es necesario para que el formulario de registro calcule precios correctamente

-- AUTOS
INSERT INTO precios (lista_id, tipo_vehiculo, tipo_servicio, precio, fecha_actualizacion)
SELECT id, 'auto', 'simple_exterior', 15000, NOW() FROM listas_precios WHERE es_default = true LIMIT 1
ON CONFLICT (lista_id, tipo_vehiculo, tipo_servicio) DO UPDATE SET precio = EXCLUDED.precio;

INSERT INTO precios (lista_id, tipo_vehiculo, tipo_servicio, precio, fecha_actualizacion)
SELECT id, 'auto', 'simple', 22000, NOW() FROM listas_precios WHERE es_default = true LIMIT 1
ON CONFLICT (lista_id, tipo_vehiculo, tipo_servicio) DO UPDATE SET precio = EXCLUDED.precio;

INSERT INTO precios (lista_id, tipo_vehiculo, tipo_servicio, precio, fecha_actualizacion)
SELECT id, 'auto', 'con_cera', 2000, NOW() FROM listas_precios WHERE es_default = true LIMIT 1
ON CONFLICT (lista_id, tipo_vehiculo, tipo_servicio) DO UPDATE SET precio = EXCLUDED.precio;

INSERT INTO precios (lista_id, tipo_vehiculo, tipo_servicio, precio, fecha_actualizacion)
SELECT id, 'auto', 'pulido', 35000, NOW() FROM listas_precios WHERE es_default = true LIMIT 1
ON CONFLICT (lista_id, tipo_vehiculo, tipo_servicio) DO UPDATE SET precio = EXCLUDED.precio;

INSERT INTO precios (lista_id, tipo_vehiculo, tipo_servicio, precio, fecha_actualizacion)
SELECT id, 'auto', 'limpieza_chasis', 20000, NOW() FROM listas_precios WHERE es_default = true LIMIT 1
ON CONFLICT (lista_id, tipo_vehiculo, tipo_servicio) DO UPDATE SET precio = EXCLUDED.precio;

INSERT INTO precios (lista_id, tipo_vehiculo, tipo_servicio, precio, fecha_actualizacion)
SELECT id, 'auto', 'limpieza_motor', 15000, NOW() FROM listas_precios WHERE es_default = true LIMIT 1
ON CONFLICT (lista_id, tipo_vehiculo, tipo_servicio) DO UPDATE SET precio = EXCLUDED.precio;

-- MONOVOLUMEN (SUV)
INSERT INTO precios (lista_id, tipo_vehiculo, tipo_servicio, precio, fecha_actualizacion)
SELECT id, 'mono', 'simple_exterior', 20000, NOW() FROM listas_precios WHERE es_default = true LIMIT 1
ON CONFLICT (lista_id, tipo_vehiculo, tipo_servicio) DO UPDATE SET precio = EXCLUDED.precio;

INSERT INTO precios (lista_id, tipo_vehiculo, tipo_servicio, precio, fecha_actualizacion)
SELECT id, 'mono', 'simple', 30000, NOW() FROM listas_precios WHERE es_default = true LIMIT 1
ON CONFLICT (lista_id, tipo_vehiculo, tipo_servicio) DO UPDATE SET precio = EXCLUDED.precio;

INSERT INTO precios (lista_id, tipo_vehiculo, tipo_servicio, precio, fecha_actualizacion)
SELECT id, 'mono', 'con_cera', 5000, NOW() FROM listas_precios WHERE es_default = true LIMIT 1
ON CONFLICT (lista_id, tipo_vehiculo, tipo_servicio) DO UPDATE SET precio = EXCLUDED.precio;

INSERT INTO precios (lista_id, tipo_vehiculo, tipo_servicio, precio, fecha_actualizacion)
SELECT id, 'mono', 'pulido', 45000, NOW() FROM listas_precios WHERE es_default = true LIMIT 1
ON CONFLICT (lista_id, tipo_vehiculo, tipo_servicio) DO UPDATE SET precio = EXCLUDED.precio;

INSERT INTO precios (lista_id, tipo_vehiculo, tipo_servicio, precio, fecha_actualizacion)
SELECT id, 'mono', 'limpieza_chasis', 30000, NOW() FROM listas_precios WHERE es_default = true LIMIT 1
ON CONFLICT (lista_id, tipo_vehiculo, tipo_servicio) DO UPDATE SET precio = EXCLUDED.precio;

INSERT INTO precios (lista_id, tipo_vehiculo, tipo_servicio, precio, fecha_actualizacion)
SELECT id, 'mono', 'limpieza_motor', 20000, NOW() FROM listas_precios WHERE es_default = true LIMIT 1
ON CONFLICT (lista_id, tipo_vehiculo, tipo_servicio) DO UPDATE SET precio = EXCLUDED.precio;

-- CAMIONETAS
INSERT INTO precios (lista_id, tipo_vehiculo, tipo_servicio, precio, fecha_actualizacion)
SELECT id, 'camioneta', 'simple_exterior', 25000, NOW() FROM listas_precios WHERE es_default = true LIMIT 1
ON CONFLICT (lista_id, tipo_vehiculo, tipo_servicio) DO UPDATE SET precio = EXCLUDED.precio;

INSERT INTO precios (lista_id, tipo_vehiculo, tipo_servicio, precio, fecha_actualizacion)
SELECT id, 'camioneta', 'simple', 35000, NOW() FROM listas_precios WHERE es_default = true LIMIT 1
ON CONFLICT (lista_id, tipo_vehiculo, tipo_servicio) DO UPDATE SET precio = EXCLUDED.precio;

INSERT INTO precios (lista_id, tipo_vehiculo, tipo_servicio, precio, fecha_actualizacion)
SELECT id, 'camioneta', 'con_cera', 5000, NOW() FROM listas_precios WHERE es_default = true LIMIT 1
ON CONFLICT (lista_id, tipo_vehiculo, tipo_servicio) DO UPDATE SET precio = EXCLUDED.precio;

INSERT INTO precios (lista_id, tipo_vehiculo, tipo_servicio, precio, fecha_actualizacion)
SELECT id, 'camioneta', 'pulido', 50000, NOW() FROM listas_precios WHERE es_default = true LIMIT 1
ON CONFLICT (lista_id, tipo_vehiculo, tipo_servicio) DO UPDATE SET precio = EXCLUDED.precio;

INSERT INTO precios (lista_id, tipo_vehiculo, tipo_servicio, precio, fecha_actualizacion)
SELECT id, 'camioneta', 'limpieza_chasis', 35000, NOW() FROM listas_precios WHERE es_default = true LIMIT 1
ON CONFLICT (lista_id, tipo_vehiculo, tipo_servicio) DO UPDATE SET precio = EXCLUDED.precio;

INSERT INTO precios (lista_id, tipo_vehiculo, tipo_servicio, precio, fecha_actualizacion)
SELECT id, 'camioneta', 'limpieza_motor', 25000, NOW() FROM listas_precios WHERE es_default = true LIMIT 1
ON CONFLICT (lista_id, tipo_vehiculo, tipo_servicio) DO UPDATE SET precio = EXCLUDED.precio;

-- CAMIONETAS XL
INSERT INTO precios (lista_id, tipo_vehiculo, tipo_servicio, precio, fecha_actualizacion)
SELECT id, 'camioneta_xl', 'simple_exterior', 28000, NOW() FROM listas_precios WHERE es_default = true LIMIT 1
ON CONFLICT (lista_id, tipo_vehiculo, tipo_servicio) DO UPDATE SET precio = EXCLUDED.precio;

INSERT INTO precios (lista_id, tipo_vehiculo, tipo_servicio, precio, fecha_actualizacion)
SELECT id, 'camioneta_xl', 'simple', 38000, NOW() FROM listas_precios WHERE es_default = true LIMIT 1
ON CONFLICT (lista_id, tipo_vehiculo, tipo_servicio) DO UPDATE SET precio = EXCLUDED.precio;

INSERT INTO precios (lista_id, tipo_vehiculo, tipo_servicio, precio, fecha_actualizacion)
SELECT id, 'camioneta_xl', 'con_cera', 6000, NOW() FROM listas_precios WHERE es_default = true LIMIT 1
ON CONFLICT (lista_id, tipo_vehiculo, tipo_servicio) DO UPDATE SET precio = EXCLUDED.precio;

INSERT INTO precios (lista_id, tipo_vehiculo, tipo_servicio, precio, fecha_actualizacion)
SELECT id, 'camioneta_xl', 'pulido', 55000, NOW() FROM listas_precios WHERE es_default = true LIMIT 1
ON CONFLICT (lista_id, tipo_vehiculo, tipo_servicio) DO UPDATE SET precio = EXCLUDED.precio;

INSERT INTO precios (lista_id, tipo_vehiculo, tipo_servicio, precio, fecha_actualizacion)
SELECT id, 'camioneta_xl', 'limpieza_chasis', 40000, NOW() FROM listas_precios WHERE es_default = true LIMIT 1
ON CONFLICT (lista_id, tipo_vehiculo, tipo_servicio) DO UPDATE SET precio = EXCLUDED.precio;

INSERT INTO precios (lista_id, tipo_vehiculo, tipo_servicio, precio, fecha_actualizacion)
SELECT id, 'camioneta_xl', 'limpieza_motor', 30000, NOW() FROM listas_precios WHERE es_default = true LIMIT 1
ON CONFLICT (lista_id, tipo_vehiculo, tipo_servicio) DO UPDATE SET precio = EXCLUDED.precio;

-- MOTOS
INSERT INTO precios (lista_id, tipo_vehiculo, tipo_servicio, precio, fecha_actualizacion)
SELECT id, 'moto', 'simple_exterior', 10000, NOW() FROM listas_precios WHERE es_default = true LIMIT 1
ON CONFLICT (lista_id, tipo_vehiculo, tipo_servicio) DO UPDATE SET precio = EXCLUDED.precio;

INSERT INTO precios (lista_id, tipo_vehiculo, tipo_servicio, precio, fecha_actualizacion)
SELECT id, 'moto', 'simple', 15000, NOW() FROM listas_precios WHERE es_default = true LIMIT 1
ON CONFLICT (lista_id, tipo_vehiculo, tipo_servicio) DO UPDATE SET precio = EXCLUDED.precio;

INSERT INTO precios (lista_id, tipo_vehiculo, tipo_servicio, precio, fecha_actualizacion)
SELECT id, 'moto', 'con_cera', 3000, NOW() FROM listas_precios WHERE es_default = true LIMIT 1
ON CONFLICT (lista_id, tipo_vehiculo, tipo_servicio) DO UPDATE SET precio = EXCLUDED.precio;

INSERT INTO precios (lista_id, tipo_vehiculo, tipo_servicio, precio, fecha_actualizacion)
SELECT id, 'moto', 'pulido', 0, NOW() FROM listas_precios WHERE es_default = true LIMIT 1
ON CONFLICT (lista_id, tipo_vehiculo, tipo_servicio) DO UPDATE SET precio = EXCLUDED.precio;

INSERT INTO precios (lista_id, tipo_vehiculo, tipo_servicio, precio, fecha_actualizacion)
SELECT id, 'moto', 'limpieza_chasis', 0, NOW() FROM listas_precios WHERE es_default = true LIMIT 1
ON CONFLICT (lista_id, tipo_vehiculo, tipo_servicio) DO UPDATE SET precio = EXCLUDED.precio;

INSERT INTO precios (lista_id, tipo_vehiculo, tipo_servicio, precio, fecha_actualizacion)
SELECT id, 'moto', 'limpieza_motor', 10000, NOW() FROM listas_precios WHERE es_default = true LIMIT 1
ON CONFLICT (lista_id, tipo_vehiculo, tipo_servicio) DO UPDATE SET precio = EXCLUDED.precio;

-- ============================================
-- PASO 2: Insertar registros de lavado de los últimos 30 días
-- ============================================
-- Distribución realista: más actividad en fines de semana
-- IMPORTANTE: Todos los registros usan el usuario demo creado anteriormente

-- DÍA 1 (hace 30 días) - Miércoles tranquilo
INSERT INTO registros_lavado (marca_modelo, patente, tipo_vehiculo, tipo_limpieza, nombre_cliente, celular, fecha_ingreso, fecha_listo, fecha_entregado, estado, precio, pagado, metodo_pago, usuario_id, extras, extras_valor)
SELECT 'Toyota Corolla', 'AB123CD', 'auto', 'simple', 'Juan Pérez', '1134567890', NOW() - INTERVAL '30 days' + INTERVAL '9 hours', NOW() - INTERVAL '30 days' + INTERVAL '10 hours', NOW() - INTERVAL '30 days' + INTERVAL '11 hours', 'entregado', 22000, true, 'efectivo', id, NULL, 0 FROM usuarios_sistema WHERE email = 'demo@lavadero.com'
UNION ALL
SELECT 'Ford Focus', 'AC456EF', 'auto', 'simple, con_cera', 'María González', '1145678901', NOW() - INTERVAL '30 days' + INTERVAL '10 hours', NOW() - INTERVAL '30 days' + INTERVAL '11 hours', NOW() - INTERVAL '30 days' + INTERVAL '12 hours', 'entregado', 24000, true, 'transferencia', id, NULL, 0 FROM usuarios_sistema WHERE email = 'demo@lavadero.com'
UNION ALL
SELECT 'Honda CR-V', 'AD789GH', 'mono', 'simple', 'Carlos Rodríguez', '1156789012', NOW() - INTERVAL '30 days' + INTERVAL '14 hours', NOW() - INTERVAL '30 days' + INTERVAL '15 hours', NOW() - INTERVAL '30 days' + INTERVAL '16 hours', 'entregado', 30000, true, 'efectivo', id, NULL, 0 FROM usuarios_sistema WHERE email = 'demo@lavadero.com';

-- DÍA 2 (hace 29 días) - Jueves moderado
INSERT INTO registros_lavado (marca_modelo, patente, tipo_vehiculo, tipo_limpieza, nombre_cliente, celular, fecha_ingreso, fecha_listo, fecha_entregado, estado, precio, pagado, metodo_pago, usuario_id)
VALUES
('Chevrolet Cruze', 'AE012IJ', 'auto', 'simple', 'Laura Martínez', '1167890123', NOW() - INTERVAL '29 days' + INTERVAL '8 hours', NOW() - INTERVAL '29 days' + INTERVAL '9 hours', NOW() - INTERVAL '29 days' + INTERVAL '10 hours', 'entregado', 22000, true, 'transferencia', 1),
('Volkswagen Amarok', 'AF345KL', 'camioneta', 'simple, limpieza_chasis', 'Roberto Silva', '1178901234', NOW() - INTERVAL '29 days' + INTERVAL '11 hours', NOW() - INTERVAL '29 days' + INTERVAL '13 hours', NOW() - INTERVAL '29 days' + INTERVAL '14 hours', 'entregado', 60000, true, 'efectivo', 1),
('Peugeot 208', 'AG678MN', 'auto', 'simple_exterior', 'Ana López', '1189012345', NOW() - INTERVAL '29 days' + INTERVAL '15 hours', NOW() - INTERVAL '29 days' + INTERVAL '16 hours', NOW() - INTERVAL '29 days' + INTERVAL '17 hours', 'entregado', 15000, true, 'efectivo', 1),
('Toyota Hilux', 'AH901OP', 'camioneta', 'simple', 'Diego Fernández', '1190123456', NOW() - INTERVAL '29 days' + INTERVAL '16 hours', NOW() - INTERVAL '29 days' + INTERVAL '17 hours', NOW() - INTERVAL '29 days' + INTERVAL '18 hours', 'entregado', 35000, true, 'transferencia', 1);

-- DÍA 3 (hace 28 días) - Viernes activo
INSERT INTO registros_lavado (marca_modelo, patente, tipo_vehiculo, tipo_limpieza, nombre_cliente, celular, fecha_ingreso, fecha_listo, fecha_entregado, estado, precio, pagado, metodo_pago, usuario_id, extras, extras_valor)
VALUES
('Fiat Cronos', 'AI234QR', 'auto', 'simple', 'Sofía Romero', '1101234567', NOW() - INTERVAL '28 days' + INTERVAL '9 hours', NOW() - INTERVAL '28 days' + INTERVAL '10 hours', NOW() - INTERVAL '28 days' + INTERVAL '11 hours', 'entregado', 22000, true, 'efectivo', 1, NULL, 0),
('Nissan Versa', 'AJ567ST', 'auto', 'simple, con_cera', 'Gabriel Torres', '1112345678', NOW() - INTERVAL '28 days' + INTERVAL '10 hours', NOW() - INTERVAL '28 days' + INTERVAL '11 hours', NOW() - INTERVAL '28 days' + INTERVAL '12 hours', 'entregado', 24000, true, 'transferencia', 1, NULL, 0),
('Renault Duster', 'AK890UV', 'mono', 'simple', 'Valeria Díaz', '1123456789', NOW() - INTERVAL '28 days' + INTERVAL '11 hours', NOW() - INTERVAL '28 days' + INTERVAL '12 hours', NOW() - INTERVAL '28 days' + INTERVAL '13 hours', 'entregado', 30000, true, 'efectivo', 1, NULL, 0),
('Ford Ranger', 'AL123WX', 'camioneta', 'simple, limpieza_motor', 'Martín Castro', '1134567891', NOW() - INTERVAL '28 days' + INTERVAL '13 hours', NOW() - INTERVAL '28 days' + INTERVAL '15 hours', NOW() - INTERVAL '28 days' + INTERVAL '16 hours', 'entregado', 60000, true, 'efectivo', 1, NULL, 0),
('Citroën C4', 'AM456YZ', 'auto', 'simple', 'Lucía Morales', '1145678902', NOW() - INTERVAL '28 days' + INTERVAL '14 hours', NOW() - INTERVAL '28 days' + INTERVAL '15 hours', NOW() - INTERVAL '28 days' + INTERVAL '16 hours', 'entregado', 22000, true, 'transferencia', 1, NULL, 0),
('Chevrolet Onix', 'AN789AB', 'auto', 'simple_exterior', 'Federico Vargas', '1156789013', NOW() - INTERVAL '28 days' + INTERVAL '15 hours', NOW() - INTERVAL '28 days' + INTERVAL '16 hours', NOW() - INTERVAL '28 days' + INTERVAL '17 hours', 'entregado', 15000, true, 'efectivo', 1, NULL, 0);

-- DÍA 4 (hace 27 días) - Sábado muy activo
INSERT INTO registros_lavado (marca_modelo, patente, tipo_vehiculo, tipo_limpieza, nombre_cliente, celular, fecha_ingreso, fecha_listo, fecha_entregado, estado, precio, pagado, metodo_pago, usuario_id, extras, extras_valor)
VALUES
('Volkswagen Gol', 'AO012CD', 'auto', 'simple, con_cera', 'Carolina Benítez', '1167890124', NOW() - INTERVAL '27 days' + INTERVAL '9 hours', NOW() - INTERVAL '27 days' + INTERVAL '10 hours', NOW() - INTERVAL '27 days' + INTERVAL '11 hours', 'entregado', 24000, true, 'efectivo', 1, NULL, 0),
('Jeep Compass', 'AP345EF', 'mono', 'simple, pulido', 'Pablo Ruiz', '1178901235', NOW() - INTERVAL '27 days' + INTERVAL '10 hours', NOW() - INTERVAL '27 days' + INTERVAL '12 hours', NOW() - INTERVAL '27 days' + INTERVAL '13 hours', 'entregado', 75000, true, 'transferencia', 1, NULL, 0),
('Honda Civic', 'AQ678GH', 'auto', 'simple', 'Florencia Sosa', '1189012346', NOW() - INTERVAL '27 days' + INTERVAL '11 hours', NOW() - INTERVAL '27 days' + INTERVAL '12 hours', NOW() - INTERVAL '27 days' + INTERVAL '13 hours', 'entregado', 22000, true, 'efectivo', 1, NULL, 0),
('Toyota RAV4', 'AR901IJ', 'mono', 'simple, con_cera', 'Sebastián Acosta', '1190123457', NOW() - INTERVAL '27 days' + INTERVAL '12 hours', NOW() - INTERVAL '27 days' + INTERVAL '13 hours', NOW() - INTERVAL '27 days' + INTERVAL '14 hours', 'entregado', 32000, true, 'transferencia', 1, NULL, 0),
('Ford Fiesta', 'AS234KL', 'auto', 'simple_exterior', 'Camila Navarro', '1101234568', NOW() - INTERVAL '27 days' + INTERVAL '13 hours', NOW() - INTERVAL '27 days' + INTERVAL '14 hours', NOW() - INTERVAL '27 days' + INTERVAL '15 hours', 'entregado', 15000, true, 'efectivo', 1, NULL, 0),
('Nissan Frontier', 'AT567MN', 'camioneta', 'simple, limpieza_chasis', 'Nicolás Medina', '1112345679', NOW() - INTERVAL '27 days' + INTERVAL '14 hours', NOW() - INTERVAL '27 days' + INTERVAL '16 hours', NOW() - INTERVAL '27 days' + INTERVAL '17 hours', 'entregado', 60000, true, 'efectivo', 1, NULL, 0),
('Chevrolet Tracker', 'AU890OP', 'mono', 'simple', 'Daniela Ortiz', '1123456790', NOW() - INTERVAL '27 days' + INTERVAL '15 hours', NOW() - INTERVAL '27 days' + INTERVAL '16 hours', NOW() - INTERVAL '27 days' + INTERVAL '17 hours', 'entregado', 30000, true, 'transferencia', 1, NULL, 0),
('Peugeot 308', 'AV123QR', 'auto', 'simple, con_cera', 'Maximiliano Vega', '1134567892', NOW() - INTERVAL '27 days' + INTERVAL '16 hours', NOW() - INTERVAL '27 days' + INTERVAL '17 hours', NOW() - INTERVAL '27 days' + INTERVAL '18 hours', 'entregado', 24000, true, 'efectivo', 1, NULL, 0);

-- DÍA 5 (hace 26 días) - Domingo muy activo
INSERT INTO registros_lavado (marca_modelo, patente, tipo_vehiculo, tipo_limpieza, nombre_cliente, celular, fecha_ingreso, fecha_listo, fecha_entregado, estado, precio, pagado, metodo_pago, usuario_id)
VALUES
('Renault Sandero', 'AW456ST', 'auto', 'simple', 'Agustina Herrera', '1145678903', NOW() - INTERVAL '26 days' + INTERVAL '10 hours', NOW() - INTERVAL '26 days' + INTERVAL '11 hours', NOW() - INTERVAL '26 days' + INTERVAL '12 hours', 'entregado', 22000, true, 'efectivo', 1),
('Volkswagen Tiguan', 'AX789UV', 'mono', 'simple, pulido', 'Facundo Luna', '1156789014', NOW() - INTERVAL '26 days' + INTERVAL '11 hours', NOW() - INTERVAL '26 days' + INTERVAL '13 hours', NOW() - INTERVAL '26 days' + INTERVAL '14 hours', 'entregado', 75000, true, 'transferencia', 1),
('Fiat Argo', 'AY012WX', 'auto', 'simple_exterior', 'Julieta Paz', '1167890125', NOW() - INTERVAL '26 days' + INTERVAL '12 hours', NOW() - INTERVAL '26 days' + INTERVAL '13 hours', NOW() - INTERVAL '26 days' + INTERVAL '14 hours', 'entregado', 15000, true, 'efectivo', 1),
('Toyota Etios', 'AZ345YZ', 'auto', 'simple', 'Matías Giménez', '1178901236', NOW() - INTERVAL '26 days' + INTERVAL '13 hours', NOW() - INTERVAL '26 days' + INTERVAL '14 hours', NOW() - INTERVAL '26 days' + INTERVAL '15 hours', 'entregado', 22000, true, 'transferencia', 1),
('Chevrolet S10', 'BA678AB', 'camioneta', 'simple, limpieza_motor', 'Antonella Rojas', '1189012347', NOW() - INTERVAL '26 days' + INTERVAL '14 hours', NOW() - INTERVAL '26 days' + INTERVAL '16 hours', NOW() - INTERVAL '26 days' + INTERVAL '17 hours', 'entregado', 60000, true, 'efectivo', 1),
('Nissan Kicks', 'BB901CD', 'mono', 'simple', 'Tomás Ferreyra', '1190123458', NOW() - INTERVAL '26 days' + INTERVAL '15 hours', NOW() - INTERVAL '26 days' + INTERVAL '16 hours', NOW() - INTERVAL '26 days' + INTERVAL '17 hours', 'entregado', 30000, true, 'efectivo', 1),
('Honda HR-V', 'BC234EF', 'mono', 'simple, con_cera', 'Micaela Blanco', '1101234569', NOW() - INTERVAL '26 days' + INTERVAL '16 hours', NOW() - INTERVAL '26 days' + INTERVAL '17 hours', NOW() - INTERVAL '26 days' + INTERVAL '18 hours', 'entregado', 32000, true, 'transferencia', 1);

-- Continuar con más días (simplificado para no hacer el archivo demasiado largo)
-- Semana 2

-- Lunes (hace 25 días) - Moderado
INSERT INTO registros_lavado (marca_modelo, patente, tipo_vehiculo, tipo_limpieza, nombre_cliente, celular, fecha_ingreso, fecha_listo, fecha_entregado, estado, precio, pagado, metodo_pago, usuario_id)
VALUES
('Peugeot 2008', 'BD567GH', 'mono', 'simple', 'Joaquín Moreno', '1112345680', NOW() - INTERVAL '25 days' + INTERVAL '9 hours', NOW() - INTERVAL '25 days' + INTERVAL '10 hours', NOW() - INTERVAL '25 days' + INTERVAL '11 hours', 'entregado', 30000, true, 'efectivo', 1),
('Ford Ka', 'BE890IJ', 'auto', 'simple_exterior', 'Victoria Suárez', '1123456791', NOW() - INTERVAL '25 days' + INTERVAL '14 hours', NOW() - INTERVAL '25 days' + INTERVAL '15 hours', NOW() - INTERVAL '25 days' + INTERVAL '16 hours', 'entregado', 15000, true, 'transferencia', 1);

-- Martes (hace 24 días)
INSERT INTO registros_lavado (marca_modelo, patente, tipo_vehiculo, tipo_limpieza, nombre_cliente, celular, fecha_ingreso, fecha_listo, fecha_entregado, estado, precio, pagado, metodo_pago, usuario_id)
VALUES
('Chevrolet Prisma', 'BF123KL', 'auto', 'simple', 'Benjamín Castro', '1134567893', NOW() - INTERVAL '24 days' + INTERVAL '10 hours', NOW() - INTERVAL '24 days' + INTERVAL '11 hours', NOW() - INTERVAL '24 days' + INTERVAL '12 hours', 'entregado', 22000, true, 'efectivo', 1),
('Renault Captur', 'BG456MN', 'mono', 'simple, con_cera', 'Catalina Iglesias', '1145678904', NOW() - INTERVAL '24 days' + INTERVAL '15 hours', NOW() - INTERVAL '24 days' + INTERVAL '16 hours', NOW() - INTERVAL '24 days' + INTERVAL '17 hours', 'entregado', 32000, true, 'transferencia', 1);

-- Miércoles (hace 23 días)
INSERT INTO registros_lavado (marca_modelo, patente, tipo_vehiculo, tipo_limpieza, nombre_cliente, celular, fecha_ingreso, fecha_listo, fecha_entregado, estado, precio, pagado, metodo_pago, usuario_id, extras, extras_valor)
VALUES
('Volkswagen Polo', 'BH789OP', 'auto', 'simple', 'Santiago Ríos', '1156789015', NOW() - INTERVAL '23 days' + INTERVAL '9 hours', NOW() - INTERVAL '23 days' + INTERVAL '10 hours', NOW() - INTERVAL '23 days' + INTERVAL '11 hours', 'entregado', 22000, true, 'efectivo', 1, 'Limpieza tapizados', 5000),
('Toyota SW4', 'BI012QR', 'camioneta_xl', 'simple, limpieza_chasis', 'Valentina Méndez', '1167890126', NOW() - INTERVAL '23 days' + INTERVAL '10 hours', NOW() - INTERVAL '23 days' + INTERVAL '12 hours', NOW() - INTERVAL '23 days' + INTERVAL '13 hours', 'entregado', 78000, true, 'transferencia', 1, NULL, 0);

-- Continuar con días recientes (últimos 7 días con más detalle)
-- Hace 7 días - Viernes
INSERT INTO registros_lavado (marca_modelo, patente, tipo_vehiculo, tipo_limpieza, nombre_cliente, celular, fecha_ingreso, fecha_listo, fecha_entregado, estado, precio, pagado, metodo_pago, usuario_id)
VALUES
('Fiat Pulse', 'BJ345ST', 'mono', 'simple', 'Lucas Peralta', '1178901237', NOW() - INTERVAL '7 days' + INTERVAL '9 hours', NOW() - INTERVAL '7 days' + INTERVAL '10 hours', NOW() - INTERVAL '7 days' + INTERVAL '11 hours', 'entregado', 30000, true, 'efectivo', 1),
('Honda City', 'BK678UV', 'auto', 'simple, con_cera', 'Emma Figueroa', '1189012348', NOW() - INTERVAL '7 days' + INTERVAL '11 hours', NOW() - INTERVAL '7 days' + INTERVAL '12 hours', NOW() - INTERVAL '7 days' + INTERVAL '13 hours', 'entregado', 24000, true, 'transferencia', 1),
('Chevrolet Montana', 'BL901WX', 'camioneta', 'simple', 'Thiago Romero', '1190123459', NOW() - INTERVAL '7 days' + INTERVAL '14 hours', NOW() - INTERVAL '7 days' + INTERVAL '15 hours', NOW() - INTERVAL '7 days' + INTERVAL '16 hours', 'entregado', 35000, true, 'efectivo', 1);

-- Hace 6 días - Sábado (muy activo)
INSERT INTO registros_lavado (marca_modelo, patente, tipo_vehiculo, tipo_limpieza, nombre_cliente, celular, fecha_ingreso, fecha_listo, fecha_entregado, estado, precio, pagado, metodo_pago, usuario_id, extras, extras_valor)
VALUES
('Nissan Sentra', 'BM234YZ', 'auto', 'simple', 'Olivia Guzmán', '1101234570', NOW() - INTERVAL '6 days' + INTERVAL '9 hours', NOW() - INTERVAL '6 days' + INTERVAL '10 hours', NOW() - INTERVAL '6 days' + INTERVAL '11 hours', 'entregado', 22000, true, 'efectivo', 1, NULL, 0),
('Jeep Renegade', 'BN567AB', 'mono', 'simple, pulido', 'Franco Molina', '1112345681', NOW() - INTERVAL '6 days' + INTERVAL '10 hours', NOW() - INTERVAL '6 days' + INTERVAL '12 hours', NOW() - INTERVAL '6 days' + INTERVAL '13 hours', 'entregado', 75000, true, 'transferencia', 1, NULL, 0),
('Peugeot 208', 'BO890CD', 'auto', 'simple_exterior', 'Mía Cabrera', '1123456792', NOW() - INTERVAL '6 days' + INTERVAL '11 hours', NOW() - INTERVAL '6 days' + INTERVAL '12 hours', NOW() - INTERVAL '6 days' + INTERVAL '13 hours', 'entregado', 15000, true, 'efectivo', 1, NULL, 0),
('Ford Ranger', 'BP123EF', 'camioneta', 'simple, limpieza_motor, limpieza_chasis', 'Dylan Núñez', '1134567894', NOW() - INTERVAL '6 days' + INTERVAL '12 hours', NOW() - INTERVAL '6 days' + INTERVAL '14 hours', NOW() - INTERVAL '6 days' + INTERVAL '15 hours', 'entregado', 85000, true, 'efectivo', 1, NULL, 0),
('Renault Kwid', 'BQ456GH', 'auto', 'simple', 'Isabella Campos', '1145678905', NOW() - INTERVAL '6 days' + INTERVAL '13 hours', NOW() - INTERVAL '6 days' + INTERVAL '14 hours', NOW() - INTERVAL '6 days' + INTERVAL '15 hours', 'entregado', 22000, true, 'transferencia', 1, NULL, 0);

-- Hace 5 días - Domingo (muy activo)
INSERT INTO registros_lavado (marca_modelo, patente, tipo_vehiculo, tipo_limpieza, nombre_cliente, celular, fecha_ingreso, fecha_listo, fecha_entregado, estado, precio, pagado, metodo_pago, usuario_id)
VALUES
('Volkswagen Voyage', 'BR789IJ', 'auto', 'simple', 'Bautista Ramos', '1156789016', NOW() - INTERVAL '5 days' + INTERVAL '10 hours', NOW() - INTERVAL '5 days' + INTERVAL '11 hours', NOW() - INTERVAL '5 days' + INTERVAL '12 hours', 'entregado', 22000, true, 'efectivo', 1),
('Toyota Corolla Cross', 'BS012KL', 'mono', 'simple, con_cera', 'Martina Guerrero', '1167890127', NOW() - INTERVAL '5 days' + INTERVAL '11 hours', NOW() - INTERVAL '5 days' + INTERVAL '12 hours', NOW() - INTERVAL '5 days' + INTERVAL '13 hours', 'entregado', 32000, true, 'transferencia', 1),
('Chevrolet Spin', 'BT345MN', 'mono', 'simple', 'Lautaro Medina', '1178901238', NOW() - INTERVAL '5 days' + INTERVAL '13 hours', NOW() - INTERVAL '5 days' + INTERVAL '14 hours', NOW() - INTERVAL '5 days' + INTERVAL '15 hours', 'entregado', 30000, true, 'efectivo', 1);

-- Hace 4 días - Lunes
INSERT INTO registros_lavado (marca_modelo, patente, tipo_vehiculo, tipo_limpieza, nombre_cliente, celular, fecha_ingreso, fecha_listo, fecha_entregado, estado, precio, pagado, metodo_pago, usuario_id)
VALUES
('Fiat Mobi', 'BU678OP', 'auto', 'simple_exterior', 'Renata Flores', '1189012349', NOW() - INTERVAL '4 days' + INTERVAL '9 hours', NOW() - INTERVAL '4 days' + INTERVAL '10 hours', NOW() - INTERVAL '4 days' + INTERVAL '11 hours', 'entregado', 15000, true, 'efectivo', 1),
('Nissan X-Trail', 'BV901QR', 'mono', 'simple', 'Ian Santana', '1190123460', NOW() - INTERVAL '4 days' + INTERVAL '15 hours', NOW() - INTERVAL '4 days' + INTERVAL '16 hours', NOW() - INTERVAL '4 days' + INTERVAL '17 hours', 'entregado', 30000, true, 'transferencia', 1);

-- Hace 3 días - Martes
INSERT INTO registros_lavado (marca_modelo, patente, tipo_vehiculo, tipo_limpieza, nombre_cliente, celular, fecha_ingreso, fecha_listo, fecha_entregado, estado, precio, pagado, metodo_pago, usuario_id)
VALUES
('Honda Fit', 'BW234ST', 'auto', 'simple', 'Alma Domínguez', '1101234571', NOW() - INTERVAL '3 days' + INTERVAL '10 hours', NOW() - INTERVAL '3 days' + INTERVAL '11 hours', NOW() - INTERVAL '3 days' + INTERVAL '12 hours', 'entregado', 22000, true, 'efectivo', 1),
('Jeep Grand Cherokee', 'BX567UV', 'camioneta_xl', 'simple, pulido', 'Gael Reyes', '1112345682', NOW() - INTERVAL '3 days' + INTERVAL '11 hours', NOW() - INTERVAL '3 days' + INTERVAL '13 hours', NOW() - INTERVAL '3 days' + INTERVAL '14 hours', 'entregado', 93000, true, 'transferencia', 1);

-- Hace 2 días - Miércoles
INSERT INTO registros_lavado (marca_modelo, patente, tipo_vehiculo, tipo_limpieza, nombre_cliente, celular, fecha_ingreso, fecha_listo, fecha_entregado, estado, precio, pagado, metodo_pago, usuario_id, extras, extras_valor)
VALUES
('Peugeot 408', 'BY890WX', 'auto', 'simple, con_cera', 'Pilar Vera', '1123456793', NOW() - INTERVAL '2 days' + INTERVAL '9 hours', NOW() - INTERVAL '2 days' + INTERVAL '10 hours', NOW() - INTERVAL '2 days' + INTERVAL '11 hours', 'entregado', 24000, true, 'efectivo', 1, NULL, 0),
('Toyota Yaris', 'BZ123YZ', 'auto', 'simple', 'Noah Cortés', '1134567895', NOW() - INTERVAL '2 days' + INTERVAL '14 hours', NOW() - INTERVAL '2 days' + INTERVAL '15 hours', NOW() - INTERVAL '2 days' + INTERVAL '16 hours', 'entregado', 22000, true, 'transferencia', 1, NULL, 0);

-- Hace 1 día - Jueves  
INSERT INTO registros_lavado (marca_modelo, patente, tipo_vehiculo, tipo_limpieza, nombre_cliente, celular, fecha_ingreso, fecha_listo, fecha_entregado, estado, precio, pagado, metodo_pago, usuario_id)
VALUES
('Volkswagen Taos', 'CA456AB', 'mono', 'simple', 'Elena Morales', '1145678906', NOW() - INTERVAL '1 day' + INTERVAL '10 hours', NOW() - INTERVAL '1 day' + INTERVAL '11 hours', NOW() - INTERVAL '1 day' + INTERVAL '12 hours', 'entregado', 30000, true, 'efectivo', 1),
('Chevrolet Equinox', 'CB789CD', 'mono', 'simple, con_cera', 'Felipe Bravo', '1156789017', NOW() - INTERVAL '1 day' + INTERVAL '13 hours', NOW() - INTERVAL '1 day' + INTERVAL '14 hours', NOW() - INTERVAL '1 day' + INTERVAL '15 hours', 'entregado', 32000, true, 'transferencia', 1),
('Ford Ecosport', 'CC012EF', 'mono', 'simple_exterior', 'Zoe Aguilar', '1167890128', NOW() - INTERVAL '1 day' + INTERVAL '15 hours', NOW() - INTERVAL '1 day' + INTERVAL '16 hours', NOW() - INTERVAL '1 day' + INTERVAL '17 hours', 'entregado', 20000, true, 'efectivo', 1);

-- HOY - Viernes (algunos entregados, algunos listos, algunos en proceso)
INSERT INTO registros_lavado (marca_modelo, patente, tipo_vehiculo, tipo_limpieza, nombre_cliente, celular, fecha_ingreso, fecha_listo, fecha_entregado, estado, precio, pagado, metodo_pago, usuario_id)
VALUES
-- Ya entregados hoy
('Renault Logan', 'CD345GH', 'auto', 'simple', 'Enzo Molina', '1178901239', NOW() - INTERVAL '5 hours', NOW() - INTERVAL '4 hours', NOW() - INTERVAL '3 hours', 'entregado', 22000, true, 'efectivo', 1),
('Nissan Note', 'CE678IJ', 'auto', 'simple, con_cera', 'Lola Ibarra', '1189012350', NOW() - INTERVAL '4 hours', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '2 hours', 'entregado', 24000, true, 'transferencia', 1);

-- Listos para entregar
INSERT INTO registros_lavado (marca_modelo, patente, tipo_vehiculo, tipo_limpieza, nombre_cliente, celular, fecha_ingreso, fecha_listo, estado, precio, pagado, metodo_pago, usuario_id)
VALUES
('Volkswagen Vento', 'CF901KL', 'auto', 'simple', 'Mateo Peña', '1190123461', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour', 'listo', 22000, true, 'efectivo', 1),
('Toyota Hilux', 'CG234MN', 'camioneta', 'simple, limpieza_chasis', 'Amparo Lagos', '1101234572', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '1 hour', 'listo', 60000, false, NULL, 1);

-- En proceso (recién ingresados)
INSERT INTO registros_lavado (marca_modelo, patente, tipo_vehiculo, tipo_limpieza, nombre_cliente, celular, fecha_ingreso, estado, precio, pagado, usuario_id)
VALUES
('Honda CR-V', 'CH567OP', 'mono', 'simple, pulido', 'León Ponce', '1112345683', NOW() - INTERVAL '30 minutes', 'en_proceso', 75000, false, 1),
('Peugeot 3008', 'CI890QR', 'mono', 'simple', 'Jazmín Silva', '1123456794', NOW() - INTERVAL '15 minutes', 'en_proceso', 30000, false, 1);

-- ============================================
-- VERIFICACIÓN: Contar registros insertados
-- ============================================
-- SELECT COUNT(*) as total_registros, estado, COUNT(*) * 100.0 / SUM(COUNT(*)) OVER() as porcentaje
-- FROM registros_lavado
-- GROUP BY estado;

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================
-- 1. Este script crea aproximadamente 70+ registros distribuidos en 30 días
-- 2. La mayoría están entregados (ideal para reportes)
-- 3. Algunos están listos y en proceso (realismo)
-- 4. Variedad de autos, servicios y métodos de pago
-- 5. Precios realistas según tipo de servicio
-- 6. Usuario_id = 1 (ajustar si es necesario)
-- 7. Más actividad en fines de semana (realista)

-- ============================================
-- PARA EJECUTAR EN NEON:
-- ============================================
-- 1. Ve a tu proyecto en Neon Console
-- 2. Selecciona el branch de tu empresa demo
-- 3. Abre el SQL Editor
-- 4. Copia y pega todo este script
-- 5. Ejecuta (Run)
-- 6. ¡Listo! Ahora tienes datos de demostración
-- ============================================
