import React from 'react';
import './Sidebar.css'; 

const Sidebar = () => {
    return (
        <aside className="sidebar">
            <div className="sidebar-widget">
                <h4>Acerca del Foro</h4>
                <p>Un espacio para discutir sobre las últimas tendencias. ¡Comparte tu conocimiento!</p>
                <div className="stats">
                    <div><strong>1.2M</strong><p>Miembros</p></div>
                    <div><strong>5.8k</strong><p>En línea</p></div>
                </div>
                <button className="btn btn-primary full-width">Unirse</button>
            </div>
            <div className="sidebar-widget">
                <h4>Reglas del Foro</h4>
                <ol>
                    <li>Respetar a los demás.</li>
                    <li>No hacer spam ni autopromoción.</li>
                    <li>Mantener las discusiones en el tema.</li>
                    <li>No compartir información ilegal.</li>
                </ol>
            </div>
        </aside>
    );
};

export default Sidebar;