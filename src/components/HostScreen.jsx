import React from 'react';
import './HostScreen.css';  // ✅ New: we’ll style it too

function HostScreen({ socket, setCurrentGame }) {
    const handleStartJaypardy = () => {
        console.log('✅ Host: Start Jaypardy button clicked!');
        socket.emit('show-jaypardy');
        setCurrentGame('jaypardy');
    };

    return (
        <div className="menu host-menu">
            <h1>🎮 Host Game Controls</h1>
            <button className="menu-btn" onClick={handleStartJaypardy}>
                ▶️ Start Jaypardy
            </button>
            <p className="note">More games coming soon...</p>
        </div>
    );
}

export default HostScreen;
