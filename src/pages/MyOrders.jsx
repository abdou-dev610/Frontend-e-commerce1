import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getToken } from '@/integrations/api/client';
import { ShoppingBag, Calendar, MapPin, DollarSign, ChevronDown, X, ChevronLeft, ChevronRight } from 'lucide-react';

const ORDERS_PER_PAGE = 5;

export default function MyOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchOrders(page);
  }, [page]);

  const fetchOrders = useCallback(async (currentPage = 1) => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) { setOrders([]); setLoading(false); return; }

      const apiUrl = `${import.meta.env.VITE_API_URL || '/api'}/orders?page=${currentPage}&limit=${ORDERS_PER_PAGE}`;
      const response = await fetch(apiUrl, { headers: { 'Authorization': `Bearer ${token}` } });

      if (!response.ok) throw new Error('Erreur lors de la récupération des commandes');

      const data = await response.json();
      if (Array.isArray(data)) {
        setOrders(data);
        setTotalPages(1);
        setTotal(data.length);
      } else {
        setOrders(data.orders || []);
        setTotalPages(data.pagination?.pages || 1);
        setTotal(data.pagination?.total || 0);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
      case 'en attente':
        return { bg: '#fef3c7', text: '#92400e' };
      case 'processing':
      case 'traitement':
        return { bg: '#dbeafe', text: '#1e40af' };
      case 'completed':
      case 'livré':
      case 'completed':
        return { bg: '#dcfce7', text: '#166534' };
      case 'cancelled':
      case 'annulé':
        return { bg: '#fee2e2', text: '#991b1b' };
      default:
        return { bg: '#f3f4f6', text: '#4b5563' };
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      'pending': 'En attente',
      'en attente': 'En attente',
      'processing': 'Traitement',
      'traitement': 'Traitement',
      'completed': 'Livré',
      'livré': 'Livré',
      'cancelled': 'Annulé',
      'annulé': 'Annulé'
    };
    return labels[status?.toLowerCase()] || status || 'En attente';
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f9fafb',
      padding: '40px 20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        maxWidth: '900px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          marginBottom: '40px'
        }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#1f2937',
            margin: '0 0 8px 0'
          }}>
            Mes Commandes
          </h1>
          <p style={{
            color: '#6b7280',
            fontSize: '16px',
            margin: 0
          }}>
            Consultez l'historique et le statut de vos commandes
          </p>
        </div>

        {/* Orders Container */}
        {loading ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px'
          }}>
            <div style={{
              display: 'inline-block',
              width: '40px',
              height: '40px',
              border: '4px solid #e5e7eb',
              borderTopColor: '#ea580c',
              borderRadius: '50%',
              animation: 'spin 0.6s linear infinite'
            }}></div>
            <p style={{
              marginTop: '20px',
              color: '#6b7280',
              fontSize: '16px'
            }}>
              Chargement de vos commandes...
            </p>
          </div>
        ) : orders.length === 0 ? (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '60px 20px',
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.07)'
          }}>
            <ShoppingBag size={48} style={{
              color: '#d1d5db',
              margin: '0 auto 20px'
            }} />
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#4b5563',
              margin: '0 0 8px 0'
            }}>
              Aucune commande
            </h2>
            <p style={{
              color: '#9ca3af',
              fontSize: '14px',
              margin: '0 0 24px 0'
            }}>
              Vous n'avez pas encore passé de commande. Commencez vos achats dès maintenant!
            </p>
            <Link to="/produits" style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '700',
              transition: 'all 0.3s'
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(234, 88, 12, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Voir les produits
            </Link>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            {orders.map((order) => {
              const statusColor = getStatusColor(order.status);
              const isExpanded = expandedOrder === order._id;

              return (
                <div key={order._id} style={{
                  background: 'white',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.07)',
                  transition: 'all 0.3s'
                }}>
                  {/* Order Header */}
                  <div
                    onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
                    style={{
                      padding: '20px',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                      gap: '20px',
                      alignItems: 'center',
                      cursor: 'pointer',
                      background: isExpanded ? '#f9fafb' : 'white',
                      borderBottom: isExpanded ? '1px solid #e5e7eb' : 'none',
                      transition: 'all 0.3s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f9fafb';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = isExpanded ? '#f9fafb' : 'white';
                    }}
                  >
                    {/* Order Number */}
                    <div>
                      <p style={{
                        fontSize: '12px',
                        color: '#9ca3af',
                        margin: '0 0 5px 0',
                        fontWeight: '600',
                        textTransform: 'uppercase'
                      }}>
                        Commande
                      </p>
                      <p style={{
                        fontSize: '16px',
                        fontWeight: 'bold',
                        color: '#1f2937',
                        margin: 0
                      }}>
                        #{order._id?.slice(-8).toUpperCase() || 'N/A'}
                      </p>
                    </div>

                    {/* Date */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <Calendar size={18} style={{ color: '#ea580c' }} />
                      <div>
                        <p style={{
                          fontSize: '12px',
                          color: '#9ca3af',
                          margin: '0 0 5px 0',
                          fontWeight: '600',
                          textTransform: 'uppercase'
                        }}>
                          Date
                        </p>
                        <p style={{
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#1f2937',
                          margin: 0
                        }}>
                          {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Total */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <DollarSign size={18} style={{ color: '#ea580c' }} />
                      <div>
                        <p style={{
                          fontSize: '12px',
                          color: '#9ca3af',
                          margin: '0 0 5px 0',
                          fontWeight: '600',
                          textTransform: 'uppercase'
                        }}>
                          Total
                        </p>
                        <p style={{
                          fontSize: '16px',
                          fontWeight: 'bold',
                          color: '#1f2937',
                          margin: 0
                        }}>
                          {order.total?.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' }) || 'N/A'}
                        </p>
                      </div>
                    </div>

                    {/* Status */}
                    <div style={{
                      background: statusColor.bg,
                      color: statusColor.text,
                      padding: '10px 16px',
                      borderRadius: '8px',
                      textAlign: 'center',
                      fontWeight: '600',
                      fontSize: '13px'
                    }}>
                      {getStatusLabel(order.status)}
                    </div>

                    {/* Expand Button */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'flex-end'
                    }}>
                      <ChevronDown size={24} style={{
                        color: '#9ca3af',
                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s'
                      }} />
                    </div>
                  </div>

                  {/* Order Details */}
                  {isExpanded && (
                    <div style={{
                      padding: '20px',
                      background: '#f9fafb',
                      borderTop: '1px solid #e5e7eb'
                    }}>
                      {/* Items */}
                      <div style={{
                        marginBottom: '20px'
                      }}>
                        <h3 style={{
                          fontSize: '14px',
                          fontWeight: '700',
                          color: '#1f2937',
                          margin: '0 0 12px 0',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          Articles
                        </h3>
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px'
                        }}>
                          {order.items?.map((item, idx) => (
                            <div key={idx} style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              padding: '10px',
                              background: 'white',
                              borderRadius: '8px',
                              borderLeft: '4px solid #ea580c'
                            }}>
                              <div>
                                <p style={{
                                  color: '#1f2937',
                                  fontSize: '14px',
                                  fontWeight: '500',
                                  margin: 0
                                }}>
                                  {item.name || item.productName || 'Article'}
                                </p>
                                <p style={{
                                  color: '#9ca3af',
                                  fontSize: '12px',
                                  margin: '4px 0 0 0'
                                }}>
                                  Quantité: {item.quantity}
                                </p>
                              </div>
                              <p style={{
                                color: '#1f2937',
                                fontSize: '14px',
                                fontWeight: '700',
                                margin: 0
                              }}>
                                {(item.price * item.quantity).toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Shipping Address */}
                      {order.shippingAddress && (
                        <div style={{
                          marginBottom: '20px'
                        }}>
                          <h3 style={{
                            fontSize: '14px',
                            fontWeight: '700',
                            color: '#1f2937',
                            margin: '0 0 12px 0',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            Adresse de livraison
                          </h3>
                          <div style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '10px',
                            padding: '12px',
                            background: 'white',
                            borderRadius: '8px'
                          }}>
                            <MapPin size={18} style={{ color: '#ea580c', marginTop: '2px', flexShrink: 0 }} />
                            <p style={{
                              color: '#4b5563',
                              fontSize: '14px',
                              margin: 0,
                              lineHeight: '1.6'
                            }}>
                              {order.shippingAddress.address}<br />
                              {order.shippingAddress.city} {order.shippingAddress.postalCode}<br />
                              {order.shippingAddress.country || 'Sénégal'}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div style={{
                        display: 'flex',
                        gap: '12px'
                      }}>
                        <button
                          onClick={() => {
                            const msg = `Bonjour, je souhaite télécharger la facture pour ma commande #${order._id?.slice(-8).toUpperCase() || 'N/A'}.`;
                            window.open(`https://wa.me/221706242361?text=${encodeURIComponent(msg)}`, '_blank');
                          }}
                          style={{
                          flex: 1,
                          background: '#f3f4f6',
                          color: '#4b5563',
                          border: 'none',
                          padding: '10px 16px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '14px',
                          transition: 'all 0.3s'
                        }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#e5e7eb';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#f3f4f6';
                          }}
                        >
                          Télécharger la facture
                        </button>
                        <button
                          onClick={() => {
                            const msg = `Bonjour, j'ai besoin d'aide pour ma commande #${order._id?.slice(-8).toUpperCase() || 'N/A'}.`;
                            window.open(`https://wa.me/221706242361?text=${encodeURIComponent(msg)}`, '_blank');
                          }}
                          style={{
                          flex: 1,
                          background: '#ea580c',
                          color: 'white',
                          border: 'none',
                          padding: '10px 16px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '14px',
                          transition: 'all 0.3s'
                        }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#c2410c';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#ea580c';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          Contacter le support
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', padding: '24px 0 8px' }}>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              padding: '8px 16px', borderRadius: '8px', border: '1px solid #e5e7eb',
              background: page === 1 ? '#f3f4f6' : 'white', color: page === 1 ? '#9ca3af' : '#374151',
              cursor: page === 1 ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '14px'
            }}
          >
            <ChevronLeft size={16} /> Précédent
          </button>

          <div style={{ display: 'flex', gap: '6px' }}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                style={{
                  width: '36px', height: '36px', borderRadius: '8px', border: 'none',
                  background: page === p ? '#ea580c' : '#f3f4f6',
                  color: page === p ? 'white' : '#374151',
                  cursor: 'pointer', fontWeight: '700', fontSize: '14px'
                }}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              padding: '8px 16px', borderRadius: '8px', border: '1px solid #e5e7eb',
              background: page === totalPages ? '#f3f4f6' : 'white',
              color: page === totalPages ? '#9ca3af' : '#374151',
              cursor: page === totalPages ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '14px'
            }}
          >
            Suivant <ChevronRight size={16} />
          </button>
        </div>
      )}

      {total > 0 && (
        <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '13px', paddingBottom: '16px' }}>
          {total} commande{total > 1 ? 's' : ''} au total
        </p>
      )}

      {/* Animations */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
