-- Migración: Normalizar nombres de clientes existentes
-- Este script capitaliza todos los nombres en la base de datos
-- Ejecutar en Neon Console SQL Editor

-- Función para capitalizar nombres (primera letra de cada palabra en mayúscula)
-- PostgreSQL tiene INITCAP que hace exactamente esto

UPDATE registros_lavado
SET nombre_cliente = INITCAP(LOWER(nombre_cliente));

-- Verificar los cambios
SELECT DISTINCT nombre_cliente, celular
FROM registros_lavado
ORDER BY nombre_cliente;

-- Esto convertirá:
-- "mariano" -> "Mariano"
-- "MARIANO" -> "Mariano"  
-- "MaRiAnO" -> "Mariano"
-- "juan perez" -> "Juan Perez"
