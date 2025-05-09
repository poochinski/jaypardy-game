import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import './App.css';
import JaypardyBoard from './components/JaypardyBoard';
import PlayerScreen from './components/PlayerScreen';
import HostScreen from './components/HostScreen';

const socket = io('http://192.168.4.168:5000');


function App() {
    const [mode, setMode] = useState(null);
    const [currentGame, setCurrentGame] = useState(null);  // tracks current game

    useEffect(() => {
        console.log('✅ App connected to server! Mode:', mode);

        // Listen if the server tells us to start Jaypardy (useful if needed)
        socket.on('force-start-jaypardy', () => {
            console.log('💥 Server forced start of Jaypardy');
            setCurrentGame('jaypardy');
        });

    }, [mode]);

    const renderContent = () => {
        switch (mode) {
            case 'player':
                return <PlayerScreen socket={socket} />;
            case 'host':
                return (
                    <div className="jaypardy-board-wrapper">
                        {currentGame === 'jaypardy' ? (
                            <JaypardyBoard isHost={true} socket={socket} />
                        ) : (
                            <HostScreen socket={socket} setCurrentGame={setCurrentGame} />
                        )}
                    </div>
                );
            case 'display':
                return (
                    <div className="jaypardy-board-wrapper">
                        <JaypardyBoard isHost={false} socket={socket} />
                    </div>
                );
            default:
                return (
                    <div className="menu">
                        <h1>Select Mode:</h1>
                        <button onClick={() => setMode('player')}>Player</button>
                        <button onClick={() => setMode('host')}>Host</button>
                        <button onClick={() => setMode('display')}>Display</button>
                    </div>
                );
        }
    };

    return (
        <div className="App">
            {mode && (
                <div className="back-btn-wrapper">
                    <button
                        className="back-btn"
                        onClick={() => {
                            setMode(null);
                            setCurrentGame(null); // Reset when going back
                        }}
                    >
                        ⬅ Back to Menu
                    </button>
                </div>
            )}
            {renderContent()}
        </div>
    );
}

export default App;

