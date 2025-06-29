import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import JuegoEstudiante from '../pages/JuegoEstudiante';
import api from '../services/axiosConfig';
import '../styles/JuegoEstudiantePage.css';

const JuegoEstudiantePage = () => {
    const { actividadId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const [actividad, setActividad] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [realActividadId, setRealActividadId] = useState(null);

    const [gameData, setGameData] = useState({
        shuffledSteps: [],
        userAnswers: [],
        correctSteps: [],
        gameCompleted: false,
        showFeedback: false,
        feedback: '',
        message: '',
        score: 0,
        isLoading: false,
        intentoId: null
    });

    useEffect(() => {
        const actividadFromState = location.state?.actividadData;

        setLoading(true); // <-- INICIA LOADING MANUALMENTE

        if (actividadFromState && (actividadFromState._id === actividadId || actividadFromState.id === actividadId)) {
            setActividad(actividadFromState);
            setRealActividadId(actividadFromState._id || actividadFromState.id);
            setLoading(false); // <-- TERMINA LOADING si viene del state
        } else {
            loadActividad(); // Desde API
        }
    }, [actividadId]);



    useEffect(() => {
        if (actividad) {
            const newShuffledSteps = actividad.shuffledSteps || [];
            const newCorrectSteps = actividad.correctSteps || [];

            setGameData(prev => ({
                ...prev,
                shuffledSteps: newShuffledSteps,
                correctSteps: newCorrectSteps,
                userAnswers: Array(newShuffledSteps.length).fill(''),
                gameCompleted: false,
                showFeedback: false,
                feedback: '',
                message: '',
                score: 0,
                isLoading: false,
                intentoId: null,
            }));

            const id = actividad.id || actividad._id;
            if (id) {
                setRealActividadId(id);
                startIntento(id);
            }
        }
    }, [actividad]);

    const loadActividad = async () => {
        try {
            setLoading(true);
            setError(null);

            console.log('🔍 Cargando actividad con ID de params:', actividadId);

            if (!actividadId) {
                setError('No se especificó qué actividad cargar');
                return;
            }

            const actividadFromState = location.state?.actividadData;
            if (actividadFromState) {
                const stateId = actividadFromState._id || actividadFromState.id;
                if (stateId === actividadId) {
                    setActividad(actividadFromState);
                    setRealActividadId(stateId);
                    setLoading(false);
                    return;
                }
            }

            console.log('🌐 Cargando desde API con ID:', actividadId);
            setRealActividadId(actividadId);

            const response = await api.get(`/estudiante/actividades/${actividadId}`);

            if (response.data.success) {
                setActividad(response.data.data);
            } else {
                throw new Error(response.data.message || 'Error al cargar la actividad');
            }

        } catch (err) {
            console.error('🔥 Error en startIntento:', {
                error: err.message,
                response: err.response,
                data: err.response?.data
            });

            if (err.response?.status === 401) {
                // ⚠️ En lugar de redirigir, mostramos un mensaje
                setError('No tienes permiso para jugar esta actividad o tu sesión ha expirado.');
                return;
            }

            if (err.response?.status === 403) {
                setError('Acceso denegado. Puede que no tengas autorización para esta actividad.');
                return;
            }

            setError(err.response?.data?.message || err.message || 'Error al iniciar intento');
        }
    };
    useEffect(() => {
        if (actividad) {
            const newShuffledSteps = actividad.shuffledSteps || [];
            const newCorrectSteps = actividad.correctSteps || [];

            // 🔁 Reiniciar gameData completamente ANTES de startIntento
            setGameData({
                shuffledSteps: newShuffledSteps,
                correctSteps: newCorrectSteps,
                userAnswers: Array(newShuffledSteps.length).fill(''),
                gameCompleted: false,
                showFeedback: false,
                feedback: '',
                message: '',
                score: 0,
                isLoading: false,
                intentoId: null
            });

            const id = actividad.id || actividad._id;
            if (id) {
                setRealActividadId(id);
                startIntento(id); // ya luego vuelve a poner el intentoId
            }
        }
    }, [actividad]);

    const startIntento = async (actividadId) => {
  try {
    const response = await api.post(`/estudiante/actividades/${actividadId}/start`);

    if (response.data.success) {
      const intentoId = response.data.data.intento_id;

      // Ahora obtenemos los datos del juego (shuffledSteps, correctSteps)
      const juegoResp = await api.get(`/juego/actividades/${actividadId}`);

      if (juegoResp.data.success) {
        const juego = juegoResp.data.data;

        setGameData(prev => ({
          ...prev,
          intentoId,
          shuffledSteps: juego.shuffledSteps || [],
          correctSteps: juego.correctSteps || [],
          userAnswers: Array((juego.shuffledSteps || []).length).fill('')
        }));
      } else {
        throw new Error('No se pudo cargar los pasos del juego');
      }
    } else {
      setError(response.data.message || 'No se pudo iniciar intento');
    }

  } catch (err) {
    console.error('🔥 Error en startIntento:', {
      error: err.message,
      response: err.response,
      data: err.response?.data
    });

    if (err.response?.status === 401) {
      setError('No tienes permiso para jugar esta actividad o tu sesión ha expirado.');
      return;
    }

    if (err.response?.status === 403) {
      setError('Acceso denegado. Puede que no tengas autorización para esta actividad.');
      return;
    }

    setError(err.response?.data?.message || err.message || 'Error al iniciar intento');
  }
};



    const handleBackToActivities = () => {
        navigate('/actividades');
    };

    useEffect(() => {
        console.log('🐛 Debug IDs:', {
            actividadIdFromParams: actividadId,
            realActividadId: realActividadId,
            actividadObject: actividad ? {
                _id: actividad._id,
                id: actividad.id,
                nombre: actividad.nombre || actividad.title
            } : null,
            locationState: location.state ? 'SÍ' : 'NO'
        });
    }, [actividadId, realActividadId, actividad, location.state]);

    if (loading) {
        return (
            <div className="juego-estudiante-page">
                <div className="loading-container">
                    <div className="loading-spinner">⏳</div>
                    <h2>Cargando actividad...</h2>
                    <p>Preparando el juego para ti</p>
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
                        ID: {actividadId}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="juego-estudiante-page">
                <div className="error-container">
                    <div className="error-icon">❌</div>
                    <h2>Error al cargar la actividad</h2>
                    <p>{error}</p>
                    <div className="error-actions">
                        <button onClick={loadActividad} className="retry-button">🔄 Intentar de nuevo</button>
                        <button onClick={handleBackToActivities} className="back-button">← Volver a actividades</button>
                    </div>
                </div>
            </div>
        );
    }

    if (!actividad || !realActividadId) {
        return (
            <div className="juego-estudiante-page">
                <div className="not-found-container">
                    <div className="not-found-icon">🔍</div>
                    <h2>Actividad no encontrada</h2>
                    <p>La actividad que buscas no existe o no está disponible.</p>
                    <button onClick={handleBackToActivities} className="back-button">
                        ← Volver a actividades
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="juego-estudiante-page">
            <div className="page-header">
                <button onClick={handleBackToActivities} className="back-nav-button">← Actividades</button>
                <div className="activity-meta">
                    <span className="activity-age">👶 {actividad.ageGroup} años</span>
                    <span className="activity-difficulty">⭐ {actividad.difficulty}</span>
                </div>
            </div>

            <JuegoEstudiante
                title={actividad.nombre || actividad.title}
                description={actividad.descripcion || actividad.description}
                question={actividad.pregunta || actividad.question}
                containerHeight="auto"
                actividadId={realActividadId}
                intentoId={gameData.intentoId}
                isPreviewMode={false}
                shuffledSteps={gameData.shuffledSteps}
                correctSteps={gameData.correctSteps}
                userAnswers={gameData.userAnswers}
                gameCompleted={gameData.gameCompleted}
                showFeedback={gameData.showFeedback}
                feedback={gameData.feedback}
                message={gameData.message}
                score={gameData.score}
                isLoading={gameData.isLoading}
                handleDragStart={null}
                handleDragOver={null}
                handleDrop={null}
                resetPreview={null}
                saveSteps={null}
                resetGame={null}
                setMessage={null}
                formatText={(text) => text}
            />
        </div>
    );
};

export default JuegoEstudiantePage;
