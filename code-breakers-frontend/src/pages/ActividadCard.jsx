import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ActividadCard.css';
import api from '../services/axiosConfig';

const ActividadCard = () => {
    const [actividades, setActividades] = useState([]);
    const [filters, setFilters] = useState({
        ageGroup: '',
        difficulty: ''
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const fetchActividades = async () => {
        try {
            setLoading(true);
            const response = await api.get('/estudiante/actividades', {
                params: {
                    ...(filters.ageGroup && { ageGroup: filters.ageGroup }),
                    ...(filters.difficulty && { difficulty: filters.difficulty }),
                },
            });

            if (response.data.success) {
                console.log("Datos recibidos del backend:", response.data.data);
                setActividades(response.data.data);
            }
        } catch (err) {
            console.error('Error al obtener actividades:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActividades();
    }, [filters]);

    const handleChange = (e) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value
        });
    };

    const handleActivityClick = (actividad) => {
        // Debug: verificar el ID antes de navegar
        const activityId = actividad._id || actividad.id;
        console.log('🎮 Navegando al juego con:', {
            activityId,
            title: actividad.nombre || actividad.title,
            ruta: `/juego-estudiante/${activityId}` // Debug de la ruta
        });

        if (!activityId) {
            console.error('❌ Error: No se encontró ID en la actividad:', actividad);
            alert('Error: No se puede acceder a esta actividad');
            return;
        }

        // 🔥 CORRECCIÓN: Usar la ruta correcta con el parámetro correcto
        navigate(`/juego-estudiante/${activityId}`, {
            state: {
                actividadData: actividad
            }
        });
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'facil': return '#4CAF50';
            case 'intermedio': return '#FF9800';
            case 'dificil': return '#F44336';
            default: return '#757575';
        }
    };

    const getAgeGroupIcon = (ageGroup) => {
        switch (ageGroup) {
            case '3-6': return '🧸';
            case '7-10': return '🎮';
            case '11-15': return '🎯';
            default: return '📚';
        }
    };

    return (
        <div className="actividades-container">
            <div className="header-section">
                <h2>🎯 Actividades Disponibles</h2>
                <p>Selecciona una actividad para comenzar a jugar</p>
            </div>

            <div className="filters-section">
                <div className="filters">
                    <div className="filter-group">
                        <label htmlFor="ageGroup">👶 Grupo de Edad:</label>
                        <select
                            id="ageGroup"
                            name="ageGroup"
                            onChange={handleChange}
                            value={filters.ageGroup}
                            className="filter-select"
                        >
                            <option value="">Todas las edades</option>
                            <option value="3-6">3-6 años</option>
                            <option value="7-10">7-10 años</option>
                            <option value="11-15">11-15 años</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label htmlFor="difficulty">⭐ Dificultad:</label>
                        <select
                            id="difficulty"
                            name="difficulty"
                            onChange={handleChange}
                            value={filters.difficulty}
                            className="filter-select"
                        >
                            <option value="">Todas las dificultades</option>
                            <option value="facil">Fácil</option>
                            <option value="intermedio">Intermedio</option>
                            <option value="dificil">Difícil</option>
                        </select>
                    </div>
                </div>

                {(filters.ageGroup || filters.difficulty) && (
                    <div className="active-filters">
                        <span className="filter-label">Filtros activos:</span>
                        {filters.ageGroup && (
                            <span className="filter-tag">
                                {getAgeGroupIcon(filters.ageGroup)} {filters.ageGroup} años
                            </span>
                        )}
                        {filters.difficulty && (
                            <span
                                className="filter-tag"
                                style={{ backgroundColor: getDifficultyColor(filters.difficulty) }}
                            >
                                ⭐ {filters.difficulty}
                            </span>
                        )}
                    </div>
                )}
            </div>

            <div className="activities-grid">
                {loading ? (
                    <div className="loading-container">
                        <div className="loading-spinner">⏳</div>
                        <p>Cargando actividades...</p>
                    </div>
                ) : actividades.length > 0 ? (
                    actividades.map((actividad) => {
                        // Extraer el ID correcto
                        const activityId = actividad._id || actividad.id;

                        return (
                            <div
                                key={activityId || `actividad-${actividad.title}-${Math.random()}`}
                                className="activity-card"
                                onClick={() => handleActivityClick(actividad)}
                            >
                                <div className="card-header">
                                    <div className="activity-info">
                                        <span className="age-badge">
                                            {getAgeGroupIcon(actividad.ageGroup)} {actividad.ageGroup}
                                        </span>
                                        <span
                                            className="difficulty-badge"
                                            style={{ backgroundColor: getDifficultyColor(actividad.difficulty) }}
                                        >
                                            ⭐ {actividad.difficulty}
                                        </span>
                                    </div>
                                </div>

                                <div className="card-content">
                                    <h3 className="activity-title">
                                        {actividad.nombre || actividad.title}
                                    </h3>

                                    {(actividad.descripcion || actividad.description) && (
                                        <p className="activity-description">
                                            {(() => {
                                                const desc = actividad.descripcion || actividad.description;
                                                // Remover HTML tags para el preview
                                                const cleanDesc = desc.replace(/<[^>]*>/g, '');
                                                return cleanDesc.length > 100
                                                    ? `${cleanDesc.substring(0, 100)}...`
                                                    : cleanDesc;
                                            })()}
                                        </p>
                                    )}

                                    <div className="card-stats">
                                        <span className="stat-item">
                                            📝 {actividad.pasos?.length || actividad.totalSteps || 0} pasos
                                        </span>
                                        {actividad.docente && (
                                            <span className="stat-item">
                                                👨‍🏫 {actividad.docente.nombre || 'Docente'}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="card-footer">
                                    <button className="play-button">
                                        <span className="play-icon">▶️</span>
                                        Jugar Ahora
                                    </button>
                                </div>

                                {/* Debug info - remover en producción */}
                                <div style={{ fontSize: '10px', color: '#666', padding: '5px' }}>
                                    ID: {activityId}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="no-activities">
                        <div className="no-activities-icon">🔍</div>
                        <h3>No se encontraron actividades</h3>
                        <p>
                            {filters.ageGroup || filters.difficulty
                                ? 'Prueba cambiando los filtros para ver más actividades.'
                                : 'No hay actividades disponibles en este momento.'
                            }
                        </p>
                        {(filters.ageGroup || filters.difficulty) && (
                            <button
                                className="clear-filters-btn"
                                onClick={() => setFilters({ ageGroup: '', difficulty: '' })}
                            >
                                Limpiar filtros
                            </button>
                        )}
                    </div>
                )}
            </div>

            {actividades.length > 0 && (
                <div className="results-summary">
                    <p>
                        📊 Se encontraron <strong>{actividades.length}</strong> actividades
                        {filters.ageGroup || filters.difficulty ? ' con los filtros seleccionados' : ''}
                    </p>
                </div>
            )}
        </div>
    );
};

export default ActividadCard;