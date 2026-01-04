import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET() {
  try {
    // Crear tabla de usuarios
    await sql`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        nombre VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Crear tabla de registros de lavado
    await sql`
      CREATE TABLE IF NOT EXISTS registros_lavado (
        id SERIAL PRIMARY KEY,
        marca_modelo VARCHAR(100) NOT NULL,
        patente VARCHAR(20) NOT NULL,
        tipo_limpieza VARCHAR(50) NOT NULL,
        nombre_cliente VARCHAR(100) NOT NULL,
        celular VARCHAR(20) NOT NULL,
        fecha_ingreso TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_listo TIMESTAMP,
        fecha_entregado TIMESTAMP,
        estado VARCHAR(20) DEFAULT 'en_proceso',
        mensaje_enviado BOOLEAN DEFAULT FALSE,
        usuario_id INTEGER REFERENCES usuarios(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Crear índices
    await sql`CREATE INDEX IF NOT EXISTS idx_patente ON registros_lavado(patente)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_celular ON registros_lavado(celular)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_fecha_ingreso ON registros_lavado(fecha_ingreso)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_estado ON registros_lavado(estado)`;

    // Insertar usuario por defecto
    await sql`
      INSERT INTO usuarios (username, password, nombre) 
      VALUES ('admin', 'admin123', 'Administrador')
      ON CONFLICT (username) DO NOTHING
    `;

    return NextResponse.json({
      success: true,
      message: 'Base de datos inicializada correctamente',
    });
  } catch (error) {
    console.error('Error inicializando base de datos:', error);
    return NextResponse.json(
      { success: false, message: 'Error al inicializar la base de datos', error: String(error) },
      { status: 500 }
    );
  }
}
