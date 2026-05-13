import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getToken } from '@/integrations/api/client';
import { User, Mail, Phone, MapPin, Edit2, Save, X } from 'lucide-react';

export default function MyAccount() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    postalCode: user?.postalCode || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      const token = getToken();
      if (!token) {
        alert('Session expirée. Veuillez vous reconnecter.');
        return;
      }

      // Use centralized API client endpoint
      const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du profil');
      }

      setIsEditing(false);
      // Optionally show success message
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Erreur lors de la mise à jour du profil');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f9fafb',
      padding: '40px 20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        maxWidth: '800px',
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
            Mon Compte
          </h1>
          <p style={{
            color: '#6b7280',
            fontSize: '16px',
            margin: 0
          }}>
            Gérez vos informations personnelles
          </p>
        </div>

        {/* Profile Card */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
          overflow: 'hidden',
          marginBottom: '30px'
        }}>
          {/* Header Section */}
          <div style={{
            background: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)',
            padding: '40px 30px',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <User size={40} color="white" />
              </div>
              <div>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  margin: '0 0 5px 0'
                }}>
                  {user?.fullName || user?.name || 'Utilisateur'}
                </h2>
                <p style={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '14px',
                  margin: 0
                }}>
                  Compte créé le {new Date(user?.createdAt || Date.now()).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: '2px solid white',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: '600',
                transition: 'all 0.3s',
                fontSize: '14px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <Edit2 size={16} />
              {isEditing ? 'Annuler' : 'Modifier'}
            </button>
          </div>

          {/* Content Section */}
          <div style={{
            padding: '40px 30px'
          }}>
            {/* Information Grid */}
            <div style={{
              display: isEditing ? 'block' : 'grid',
              gridTemplateColumns: isEditing ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: isEditing ? '20px' : '30px'
            }}>
              {/* Email */}
              <div>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '12px',
                  fontWeight: '700',
                  color: '#ea580c',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  <Mail size={14} style={{ marginRight: '6px' }} />
                  Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '500',
                      boxSizing: 'border-box',
                      outline: 'none',
                      transition: 'all 0.3s'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#ea580c';
                      e.target.style.boxShadow = '0 0 0 3px rgba(234, 88, 12, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e5e7eb';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                ) : (
                  <p style={{
                    color: '#1f2937',
                    fontSize: '16px',
                    fontWeight: '500',
                    margin: 0
                  }}>
                    {formData.email}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '12px',
                  fontWeight: '700',
                  color: '#ea580c',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  <Phone size={14} style={{ marginRight: '6px' }} />
                  Téléphone
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '500',
                      boxSizing: 'border-box',
                      outline: 'none',
                      transition: 'all 0.3s'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#ea580c';
                      e.target.style.boxShadow = '0 0 0 3px rgba(234, 88, 12, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e5e7eb';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                ) : (
                  <p style={{
                    color: '#1f2937',
                    fontSize: '16px',
                    fontWeight: '500',
                    margin: 0
                  }}>
                    {formData.phone}
                  </p>
                )}
              </div>

              {/* Full Name */}
              <div>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '12px',
                  fontWeight: '700',
                  color: '#ea580c',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  <User size={14} style={{ marginRight: '6px' }} />
                  Nom Complet
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '500',
                      boxSizing: 'border-box',
                      outline: 'none',
                      transition: 'all 0.3s'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#ea580c';
                      e.target.style.boxShadow = '0 0 0 3px rgba(234, 88, 12, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e5e7eb';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                ) : (
                  <p style={{
                    color: '#1f2937',
                    fontSize: '16px',
                    fontWeight: '500',
                    margin: 0
                  }}>
                    {formData.fullName}
                  </p>
                )}
              </div>

              {/* Address */}
              <div>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '12px',
                  fontWeight: '700',
                  color: '#ea580c',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  <MapPin size={14} style={{ marginRight: '6px' }} />
                  Adresse
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Votre adresse"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '500',
                      boxSizing: 'border-box',
                      outline: 'none',
                      transition: 'all 0.3s'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#ea580c';
                      e.target.style.boxShadow = '0 0 0 3px rgba(234, 88, 12, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e5e7eb';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                ) : (
                  <p style={{
                    color: formData.address ? '#1f2937' : '#9ca3af',
                    fontSize: '16px',
                    fontWeight: '500',
                    margin: 0
                  }}>
                    {formData.address || 'Non renseigné'}
                  </p>
                )}
              </div>

              {/* City */}
              <div>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '12px',
                  fontWeight: '700',
                  color: '#ea580c',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  🏘️ Ville
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Dakar"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '500',
                      boxSizing: 'border-box',
                      outline: 'none',
                      transition: 'all 0.3s'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#ea580c';
                      e.target.style.boxShadow = '0 0 0 3px rgba(234, 88, 12, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e5e7eb';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                ) : (
                  <p style={{
                    color: formData.city ? '#1f2937' : '#9ca3af',
                    fontSize: '16px',
                    fontWeight: '500',
                    margin: 0
                  }}>
                    {formData.city || 'Non renseigné'}
                  </p>
                )}
              </div>

              {/* Postal Code */}
              <div>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '12px',
                  fontWeight: '700',
                  color: '#ea580c',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  📍 Code Postal
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    placeholder="12345"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '500',
                      boxSizing: 'border-box',
                      outline: 'none',
                      transition: 'all 0.3s'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#ea580c';
                      e.target.style.boxShadow = '0 0 0 3px rgba(234, 88, 12, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e5e7eb';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                ) : (
                  <p style={{
                    color: formData.postalCode ? '#1f2937' : '#9ca3af',
                    fontSize: '16px',
                    fontWeight: '500',
                    margin: 0
                  }}>
                    {formData.postalCode || 'Non renseigné'}
                  </p>
                )}
              </div>
            </div>

            {/* Save Button */}
            {isEditing && (
              <div style={{
                marginTop: '30px',
                display: 'flex',
                gap: '12px'
              }}>
                <button
                  onClick={handleSave}
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.3s',
                    boxShadow: '0 4px 6px rgba(234, 88, 12, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 12px rgba(234, 88, 12, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(234, 88, 12, 0.3)';
                  }}
                >
                  <Save size={18} />
                  Enregistrer
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  style={{
                    flex: 1,
                    background: '#f3f4f6',
                    color: '#6b7280',
                    border: '2px solid #e5e7eb',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#e5e7eb';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#f3f4f6';
                  }}
                >
                  <X size={18} />
                  Annuler
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
