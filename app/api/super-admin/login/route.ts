import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        // Verificar credenciales contra variables de entorno
        const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL;
        const SUPER_ADMIN_PASSWORD_HASH = process.env.SUPER_ADMIN_PASSWORD_HASH;

        if (!SUPER_ADMIN_EMAIL || !SUPER_ADMIN_PASSWORD_HASH) {
            console.error('⚠️ Super admin credentials not configured in environment variables');
            return NextResponse.json(
                { error: 'Super admin not configured' },
                { status: 500 }
            );
        }

        // Verificar email y comparar password con hash
        if (email === SUPER_ADMIN_EMAIL && await bcrypt.compare(password, SUPER_ADMIN_PASSWORD_HASH)) {
            return NextResponse.json({ success: true });
        }

        return NextResponse.json(
            { error: 'Invalid credentials' },
            { status: 401 }
        );
    } catch (error) {
        console.error('Error in super-admin login:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
