import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
     password: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    setError('');
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!formData.email.trim()) {
      errors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Veuillez entrer un email valide';
    }
    
    if (!formData.password) {
      errors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 6) {
      errors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Use the signIn method from AuthContext
      const response = await signIn(formData.email, formData.password);
      
      console.log('Login successful:', response);
      
      // Redirect to dashboard based on role
      const userRole = response.user?.role || response.user?.isAdmin;
      if (userRole === 'admin' || response.user?.isAdmin) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Erreur de connexion. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1f2937 0%, #f97316 50%, #fef3c7 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Animated background blobs */}
      <div style={{
        position: 'absolute',
        top: '-100px',
        left: '-100px',
        width: '400px',
        height: '400px',
        background: 'rgba(249, 115, 22, 0.15)',
        borderRadius: '50%',
        filter: 'blur(80px)',
        animation: 'blob 7s infinite',
        zIndex: 0
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '-150px',
        right: '-150px',
        width: '500px',
        height: '500px',
        background: 'rgba(249, 115, 22, 0.1)',
        borderRadius: '50%',
        filter: 'blur(80px)',
        animation: 'blob 7s infinite 2s',
        zIndex: 0
      }}></div>

      {/* Main Card */}
      <div style={{
        width: '100%',
        maxWidth: '420px',
        position: 'relative',
        zIndex: 10
      }}>
        {/* Card Container */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          overflow: 'hidden',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          {/* Header Section */}
          <div style={{
            background: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)',
            padding: '40px 30px 50px',
            textAlign: 'center',
            position: 'relative'
          }}>
            {/* Decorative elements */}
            <div style={{
              position: 'absolute',
              top: '20px',
              right: '30px',
              width: '60px',
              height: '60px',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '50%'
            }}></div>
            <div style={{
              position: 'absolute',
              bottom: '20px',
              left: '30px',
              width: '40px',
              height: '40px',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '50%'
            }}></div>

            {/* Icon */}
            <div style={{
              width: '70px',
              height: '70px',
              background: 'white',
              borderRadius: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 15px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
              position: 'relative',
              zIndex: 1
            }}>
              <Lock color="#ea580c" size={40} strokeWidth={2.5} />
            </div>

            {/* Title */}
            <h1 style={{
              color: 'white',
              fontSize: '32px',
              fontWeight: 'bold',
              margin: '0 0 8px 0',
              letterSpacing: '0.5px',
              position: 'relative',
              zIndex: 1
            }}>
              Connexion
            </h1>
            <p style={{
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: '13px',
              margin: '0',
              letterSpacing: '0.3px',
              position: 'relative',
              zIndex: 1
            }}>
              Connectez-vous à votre compte
            </p>
          </div>

          {/* Content Section */}
          <div style={{
            padding: '40px 30px'
          }}>
            {/* Error Alert */}
            {error && (
              <div style={{
                marginBottom: '25px',
                padding: '14px 16px',
                background: '#fee2e2',
                border: '1px solid #fecaca',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                animation: 'slideDown 0.3s ease-out'
              }}>
                <span style={{ fontSize: '18px', marginTop: '2px' }}>⚠️</span>
                <p style={{
                  color: '#991b1b',
                  fontSize: '13px',
                  fontWeight: '600',
                  margin: '0',
                  lineHeight: '1.4'
                }}>
                  {error}
                </p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '22px'
            }}>
              {/* Email Field */}
              <div>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '13px',
                  fontWeight: '700',
                  color: '#1f2937',
                  marginBottom: '10px',
                  letterSpacing: '0.3px'
                }}>
                  <Mail size={16} style={{ marginRight: '8px', color: '#ea580c' }} />
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="email@example.com"
                  style={{
                    width: '100%',
                    padding: '13px 15px',
                    border: validationErrors.email ? '2px solid #ef4444' : '2px solid #e5e7eb',
                    borderRadius: '11px',
                    fontSize: '14px',
                    fontWeight: '500',
                    background: validationErrors.email ? '#fef2f2' : '#f9fafb',
                    transition: 'all 0.3s ease',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#ea580c';
                    e.target.style.background = 'white';
                    e.target.style.boxShadow = '0 0 0 3px rgba(234, 88, 12, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = validationErrors.email ? '#ef4444' : '#e5e7eb';
                    e.target.style.background = validationErrors.email ? '#fef2f2' : '#f9fafb';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                {validationErrors.email && (
                  <p style={{
                    marginTop: '8px',
                    fontSize: '12px',
                    color: '#dc2626',
                    fontWeight: '600'
                  }}>
                    ✕ {validationErrors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '13px',
                  fontWeight: '700',
                  color: '#1f2937',
                  marginBottom: '10px',
                  letterSpacing: '0.3px'
                }}>
                  <Lock size={16} style={{ marginRight: '8px', color: '#ea580c' }} />
                  Mot de passe
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••••••"
                    style={{
                      width: '100%',
                      padding: '13px 15px',
                      paddingRight: '45px',
                      border: validationErrors.password ? '2px solid #ef4444' : '2px solid #e5e7eb',
                      borderRadius: '11px',
                      fontSize: '14px',
                      fontWeight: '500',
                      background: validationErrors.password ? '#fef2f2' : '#f9fafb',
                      transition: 'all 0.3s ease',
                      boxSizing: 'border-box',
                      outline: 'none'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#ea580c';
                      e.target.style.background = 'white';
                      e.target.style.boxShadow = '0 0 0 3px rgba(234, 88, 12, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = validationErrors.password ? '#ef4444' : '#e5e7eb';
                      e.target.style.background = validationErrors.password ? '#fef2f2' : '#f9fafb';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#9ca3af',
                      transition: 'color 0.2s',
                      padding: '5px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#ea580c'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {validationErrors.password && (
                  <p style={{
                    marginTop: '8px',
                    fontSize: '12px',
                    color: '#dc2626',
                    fontWeight: '600'
                  }}>
                    ✕ {validationErrors.password}
                  </p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '13px'
              }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  gap: '8px'
                }}>
                  <input
                    type="checkbox"
                    style={{
                      width: '16px',
                      height: '16px',
                      cursor: 'pointer',
                      accentColor: '#ea580c'
                    }}
                  />
                  <span style={{
                    color: '#4b5563',
                    fontWeight: '500',
                    transition: 'color 0.2s'
                  }}>
                    Rester connecté
                  </span>
                </label>
                <span
                  style={{
                    color: '#ea580c',
                    fontWeight: '600',
                    fontSize: '13px'
                  }}
                >
                  Oublié ?
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: loading ? '#fed7aa' : 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: '700',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  marginTop: '10px',
                  boxShadow: loading ? 'none' : '0 10px 25px rgba(234, 88, 12, 0.3)',
                  transform: loading ? 'none' : 'translateY(0)',
                  letterSpacing: '0.3px'
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 15px 35px rgba(234, 88, 12, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 10px 25px rgba(234, 88, 12, 0.3)';
                  }
                }}
              >
                {loading ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid white',
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                      animation: 'spin 0.6s linear infinite'
                    }}></div>
                    <span>Connexion en cours...</span>
                  </>
                ) : (
                  <>
                    <Lock size={18} />
                    <span>Se connecter</span>
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div style={{
              margin: '28px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                flex: 1,
                height: '1px',
                background: 'linear-gradient(to right, #e5e7eb, transparent)'
              }}></div>
              <span style={{
                fontSize: '12px',
                color: '#9ca3af',
                fontWeight: '600'
              }}>
                ou
              </span>
              <div style={{
                flex: 1,
                height: '1px',
                background: 'linear-gradient(to left, #e5e7eb, transparent)'
              }}></div>
            </div>

            {/* Sign Up Link */}
            <Link
              to="/signup"
              style={{
                display: 'block',
                width: '100%',
                padding: '13px 16px',
                textAlign: 'center',
                border: '2px solid #fed7aa',
                borderRadius: '12px',
                color: '#ea580c',
                textDecoration: 'none',
                fontWeight: '700',
                fontSize: '14px',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                letterSpacing: '0.3px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#fffbeb';
                e.currentTarget.style.borderColor = '#f97316';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = '#fed7aa';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Créer un compte
            </Link>

            {/* Footer Text */}
            <p style={{
              textAlign: 'center',
              fontSize: '11px',
              color: '#6b7280',
              margin: '24px 0 0 0',
              lineHeight: '1.6'
            }}>
              En vous connectant, vous acceptez nos{' '}
              <span
                style={{
                  color: '#ea580c',
                  fontWeight: '700'
                }}
              >
                conditions d'utilisation
              </span>
            </p>
          </div>
        </div>

        {/* Security Badge */}
        <div style={{
          marginTop: '24px',
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          fontSize: '12px',
          color: 'rgba(255, 255, 255, 0.9)',
          fontWeight: '600'
        }}>
          <span>🔒</span>
          <span>Connexion sécurisée et cryptée</span>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
}
