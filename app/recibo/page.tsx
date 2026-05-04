'use client'

import React, { useMemo, useRef } from 'react'
import type { PedidoDetalle } from '@/actions/pedido/get-pedido-detalle'
import html2canvas from 'html2canvas-pro'

interface ReciboProps {
    pedido?: PedidoDetalle | null
    onPrintWhatsApp?: () => void
}

const Recibo: React.FC<ReciboProps> = ({ pedido = null, onPrintWhatsApp }) => {
    const total = useMemo(() => {
        if (!pedido) return 0
        return pedido.articulo.reduce((sum, articulo) => sum + articulo.cantidad * articulo.precio, 0)
    }, [pedido])

    // const repartidor = pedido?.repartidor
    //     ? [repartidor?.nombre, repartidor?.apellido].filter(Boolean).join(' ')
    //     : 'Sin repartidor'

    const repartidor = {}

    const reciboRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        if (onPrintWhatsApp) {
            onPrintWhatsApp()
        } else {
            window.alert('Imprimir para WhatsApp')
        }
    }


    const shareToWhatsApp = async () => {
        if (!reciboRef.current) return;

        const canvas = await html2canvas(reciboRef.current, {
            backgroundColor: "#ffffff",
            useCORS: true,
            scale: window.devicePixelRatio, // mejor calidad en móvil
        });

        const blob = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob((b) => {
                if (!b) {
                    reject(new Error("Error creando imagen"));
                    return;
                }
                resolve(b);
            }, "image/png");
        });

        const file = new File([blob], "recibo.png", {
            type: "image/png",
        });

        if (navigator.canShare?.({ files: [file] })) {
            await navigator.share({
                files: [file],
                title: "Recibo",
                text: "Mira este recibo",
            });
        } else {
            alert("Tu navegador no soporta compartir archivos");
        }
    };

    return (
        <section ref={reciboRef}
            style={{
                backgroundColor: 'rgb(248, 250, 252)',
                color: 'rgb(15, 23, 42)',
                minHeight: '100vh',
                padding: '24px',
                fontFamily: 'Inter, system-ui, sans-serif',
            }}
        >
            <div
                style={{
                    maxWidth: '840px',
                    margin: '0 auto',
                    borderRadius: '16px',
                    backgroundColor: 'rgb(255, 255, 255)',
                    boxShadow: '0 16px 40px rgba(15, 23, 42, 0.08)',
                    overflow: 'hidden',
                    border: '1px solid rgb(226, 232, 240)',
                }}
            >
                <header
                    style={{
                        backgroundColor: 'rgb(15, 23, 42)',
                        color: 'rgb(255, 255, 255)',
                        padding: '28px 32px',
                    }}
                >
                    <p style={{ margin: 0, fontSize: '0.9rem', letterSpacing: '0.12em' }}>
                        RECIBO DE PEDIDO
                    </p>
                    <h1 style={{ margin: '10px 0 0', fontSize: '2rem', lineHeight: 1.1 }}>
                        {pedido ? `Pedido #${pedido.id_pedido}` : 'Pedido sin datos'}
                    </h1>
                </header>

                <main style={{ padding: '32px' }}>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr',
                            gap: '20px',
                            marginBottom: '28px',
                        }}
                    >
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div>
                                <p style={{ margin: 0, color: 'rgb(107, 114, 128)', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                                    Estado
                                </p>
                                <p style={{ margin: '8px 0 0', fontSize: '1rem' }}>{pedido?.estado ?? 'pendiente'}</p>
                            </div>
                            <div>
                                <p style={{ margin: 0, color: 'rgb(107, 114, 128)', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                                    Repartidor
                                </p>
                                <p style={{ margin: '8px 0 0', fontSize: '1rem' }}>repartidor</p>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div>
                                <p style={{ margin: 0, color: 'rgb(107, 114, 128)', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                                    Direccion
                                </p>
                                <p style={{ margin: '8px 0 0', fontSize: '1rem' }}>{pedido?.direccion ?? 'Sin direccion'}</p>
                            </div>
                            <div>
                                <p style={{ margin: 0, color: 'rgb(107, 114, 128)', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                                    Descripcion
                                </p>
                                <p style={{ margin: '8px 0 0', fontSize: '1rem' }}>{pedido?.descripcion ?? 'Sin descripcion'}</p>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginBottom: '28px' }}>
                        <p style={{ margin: 0, color: 'rgb(107, 114, 128)', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                            Artículos
                        </p>
                        <div style={{ marginTop: '14px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgb(226, 232, 240)' }}>
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '2fr 1fr 1fr',
                                    backgroundColor: 'rgb(248, 250, 252)',
                                    padding: '12px 16px',
                                    fontSize: '0.85rem',
                                    color: 'rgb(55, 65, 81)',
                                    fontWeight: 600,
                                }}
                            >
                                <span>Descripción</span>
                                <span>Cantidad</span>
                                <span>Precio</span>
                            </div>

                            {(pedido?.articulo?.length ?? 0) === 0 ? (
                                <div style={{ padding: '18px 16px', color: 'rgb(75, 85, 99)' }}>
                                    No hay artículos registrados en este pedido.
                                </div>
                            ) : (
                                pedido?.articulo.map((articulo) => (
                                    <div
                                        key={articulo.id}
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: '2fr 1fr 1fr',
                                            padding: '14px 16px',
                                            borderTop: '1px solid rgb(226, 232, 240)',
                                            color: 'rgb(51, 65, 85)',
                                        }}
                                    >
                                        <span>{articulo.descripcion}</span>
                                        <span>{articulo.cantidad}</span>
                                        <span>{`$${articulo.precio.toFixed(2)}`}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '18px 24px',
                            backgroundColor: 'rgb(247, 250, 255)',
                            borderRadius: '14px',
                            border: '1px solid rgb(226, 232, 240)',
                        }}
                    >
                        <div>
                            <p style={{ margin: 0, color: 'rgb(107, 114, 128)' }}>Total de artículos</p>
                            <p style={{ margin: '6px 0 0', fontSize: '1rem', fontWeight: 600 }}>{pedido?.articulo.length ?? 0}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ margin: 0, color: 'rgb(107, 114, 128)' }}>Total</p>
                            <p style={{ margin: '6px 0 0', fontSize: '1.35rem', fontWeight: 700, color: 'rgb(16, 185, 129)' }}>
                                ${total.toFixed(2)}
                            </p>
                        </div>
                    </div>

                    <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                            type='button'
                            onClick={shareToWhatsApp}
                            style={{
                                border: 'none',
                                borderRadius: '9999px',
                                padding: '12px 22px',
                                backgroundColor: 'rgb(16, 185, 129)',
                                color: 'rgb(255, 255, 255)',
                                cursor: 'pointer',
                                fontWeight: 600,
                                fontSize: '0.95rem',
                            }}
                        >
                            Compartir en WhatsApp
                        </button>
                    </div>
                </main>
            </div>
        </section>
    )
}

export default Recibo
