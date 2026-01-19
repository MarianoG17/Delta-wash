import { NextResponse } from 'next/server';
import { getDBConnection } from '@/lib/db-saas';
import { getEmpresaIdFromToken } from '@/lib/auth-middleware';

interface ClienteInactivo {
    nombre: string;
    celular: string;
    ultimaVisita: Date;
    marca_modelo: string;
    patente: string;
    diasSinVisitar: number;
}

export async function GET(request: Request) {
    try {
        // 1. AUTENTICACIÓN Y CONEXIÓN (SaaS + Legacy)
        const empresaId = await getEmpresaIdFromToken(request);
        const db = await getDBConnection(empresaId);

        // 2. OBTENER REGISTROS (excluyendo anulados)
        const result = await db`
            SELECT
                id,
                marca_modelo,
                patente,
                nombre_cliente,
                celular,
                fecha_ingreso
            FROM registros_lavado
            WHERE (anulado IS NULL OR anulado = FALSE)
            ORDER BY fecha_ingreso DESC
        `;

        // Compatibilidad drivers: normalizar resultado
        const registros = Array.isArray(result) ? result : (result.rows || []);

        // 3. ANÁLISIS DE CLIENTES INACTIVOS
        const hoy = new Date();
        const hace15Dias = new Date(hoy.getTime() - 15 * 24 * 60 * 60 * 1000);

        // Agrupar por celular (cliente único)
        const clientesMap = new Map<string, ClienteInactivo>();

        registros.forEach((registro: any) => {
            const fechaIngreso = new Date(registro.fecha_ingreso);
            const celular = registro.celular;

            if (!clientesMap.has(celular)) {
                clientesMap.set(celular, {
                    nombre: registro.nombre_cliente,
                    celular: celular,
                    ultimaVisita: fechaIngreso,
                    marca_modelo: registro.marca_modelo,
                    patente: registro.patente,
                    diasSinVisitar: 0
                });
            } else {
                const cliente = clientesMap.get(celular)!;
                if (fechaIngreso > cliente.ultimaVisita) {
                    cliente.ultimaVisita = fechaIngreso;
                    cliente.marca_modelo = registro.marca_modelo;
                    cliente.patente = registro.patente;
                }
            }
        });

        // 4. FILTRAR CLIENTES QUE NO VISITARON EN +15 DÍAS
        const clientesInactivos = Array.from(clientesMap.values())
            .filter((cliente) => cliente.ultimaVisita < hace15Dias)
            .map((cliente) => {
                // Calcular días exactos sin visitar
                const diffTime = hoy.getTime() - cliente.ultimaVisita.getTime();
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                return {
                    ...cliente,
                    diasSinVisitar: diffDays
                };
            })
            .sort((a, b) => a.ultimaVisita.getTime() - b.ultimaVisita.getTime()); // Más antiguos primero

        // 5. RESPUESTA
        return NextResponse.json({
            success: true,
            clientes: clientesInactivos,
            total: clientesInactivos.length,
            debug: {
                total_registros: registros.length,
                fecha_analisis: hoy.toISOString(),
                limite_dias: 15
            }
        });

    } catch (error: any) {
        console.error('Error en /api/reportes/clientes-inactivos:', error);
        return NextResponse.json(
            {
                success: false,
                message: error.message || 'Error al obtener clientes inactivos',
                error: String(error)
            },
            { status: 500 }
        );
    }
}
