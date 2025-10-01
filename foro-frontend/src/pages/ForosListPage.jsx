import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getForos, deleteForo } from '../services/apiService';
import { useAuth } from '../context/AuthContext';

const ForosListPage = () => {
    const [foros, setForos] = useState([]);
    const { user } = useAuth(); // Aqui se obtiene la info del usuario logueado
    const userId = user?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];

    useEffect(() => {
        fetchForos();
    }, []);

    const fetchForos = async () => {
        try {
            const response = await getForos();
            setForos(response.data);
        } catch (error) {
            console.error("Error al obtener los foros:", error);
        }
    };

    const handleDelete = async (foroId) => {
        if (window.confirm("¿Estás seguro de que quieres eliminar este foro?")) {
            try {
                await deleteForo(foroId);
                fetchForos();
            } catch (error) {
                console.error("Error al eliminar el foro:", error);
                alert("No tienes permiso para eliminar este foro.");
            }
        }
    };

    return (
        <div>
            <h1>Comunidades</h1>
            <Link to="/crear-foro">
                <button>+ Crear Nuevo Foro</button>
            </Link>
            <hr />
            <div>
                {foros.map(foro => (
                    <div key={foro.id} style={{ border: '1px solid gray', padding: '10px', margin: '10px' }}>
                        <h2>{foro.nombreForo}</h2>
                        <p>{foro.descripcion}</p>
                        <small>Creado por: {foro.usuario?.nombreUsuario || 'Desconocido'}</small>

                        {}
                        {foro.usuarioId && Number(userId) === foro.usuarioId && (
                            <button onClick={() => handleDelete(foro.id)} style={{ marginLeft: '20px', color: 'red' }}>
                                Eliminar
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ForosListPage;