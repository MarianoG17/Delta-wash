import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        // Verificar credenciales contra variables de entorno
        const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL;
        const SUPER_ADMIN_PASSWORD_HASH = process.env.SUPER_ADMIN_PASSWORD_HASH;

        // 🔍 DEBUG: Logs para diagnosticar
        console.log('🔐 Super Admin Login Attempt:');
        console.log('   - Email provided:', email);
        console.log('   - Expected email:', SUPER_ADMIN_EMAIL);
        console.log('   - Email match:', email === SUPER_ADMIN_EMAIL);
        console.log('   - Hash configured:', !!SUPER_ADMIN_PASSWORD_HASH);
        console.log('   - Hash length:', SUPER_ADMIN_PASSWORD_HASH?.length || 0);
        console.log('   - Hash starts with:', SUPER_ADMIN_PASSWORD_HASH?.substring(0, 4));
        console.log('   - Password length:', password?.length || 0);

        if (!SUPER_ADMIN_EMAIL || !SUPER_ADMIN_PASSWORD_HASH) {
            console.error('⚠️ Super admin credentials not configured in environment variables');
            return NextResponse.json(
                { error: 'Super admin not configured' },
                { status: 500 }
            );
        }

        // Verificar email
        const emailMatch = email === SUPER_ADMIN_EMAIL;
        console.log('   - Email verification:', emailMatch ? '✅ PASS' : '❌ FAIL');

        // Verificar password
        const passwordMatch = await bcrypt.compare(password, SUPER_ADMIN_PASSWORD_HASH);
        console.log('   - Password verification:', passwordMatch ? '✅ PASS' : '❌ FAIL');

        if (emailMatch && passwordMatch) {
            console.log('✅ Login successful');
            return NextResponse.json({ success: true });
        }

        console.log('❌ Login failed');
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
