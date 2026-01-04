import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return NextResponse.json(
                { success: false, message: 'Usuario y contraseña requeridos' },
                { status: 400 }
            );
        }

        // Buscar usuario en la base de datos
        const result = await sql`
      SELECT id, username, nombre, rol, password
      FROM usuarios
      WHERE username = ${username}
    `;

        if (result.rows.length === 0) {
            return NextResponse.json(
                { success: false, message: 'Usuario o contraseña incorrectos' },
                { status: 401 }
            );
        }

        const user = result.rows[0];

        // Verificar contraseña
        // Si la contraseña en DB no está hasheada (texto plano), compararla directamente
        // Si está hasheada, usar bcrypt
        let passwordMatch = false;

        if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
            // Contraseña hasheada con bcrypt
            passwordMatch = await bcrypt.compare(password, user.password);
        } else {
            // Contraseña en texto plano (compatibilidad con usuarios existentes)
            passwordMatch = password === user.password;
        }

        if (!passwordMatch) {
            return NextResponse.json(
                { success: false, message: 'Usuario o contraseña incorrectos' },
                { status: 401 }
            );
        }

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                nombre: user.nombre,
                rol: user.rol || 'operador',
            },
        });
    } catch (error) {
        console.error('Error en login:', error);
        return NextResponse.json(
            { success: false, message: 'Error del servidor' },
            { status: 500 }
        );
    }
}
