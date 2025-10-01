import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
    return (
        <div style={{ textAlign: 'center', padding: '50px' }}>
            <h1>404 - Página No Encontrada</h1>
            <p>La página que buscas no existe o fue movida.</p>
            <Link to="/">Volver al Inicio</Link>
        </div>
    );
};

export default NotFoundPage;