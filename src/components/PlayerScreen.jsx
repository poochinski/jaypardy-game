import React, { useState } from 'react';
import './PlayerScreen.css'; // ✅ Make sure this exists for styling

function PlayerScreen({ socket }) {
    const [name, setName] = useState('');
    const [emoji, setEmoji] = useState('');
    const [joined, setJoined] = useState(false);
    const [buzzedIn, setBuzzedIn] = useState(false);
    const [canBuzz, setCanBuzz] = useState(true); // For future: we can disable buzz if needed

    const handleJoinGame = () => {
        if (!name || !emoji) {
            alert('Please enter your name and pick an emoji!');
            return;
        }
        const playerData = { name, emoji };
        console.log('🚀 Sending player data to server:', playerData);
        socket.emit('player-joined', playerData);
        setJoined(true);
    };

    const handleBuzz = () => {
        if (!canBuzz) return;
        console.log('🛎️ Buzzed in!');
        socket.emit('buzz-in', { name, emoji });
        setBuzzedIn(true);
    };

    return (
        <div className="player-screen">
            {!joined ? (
                <div className="join-game-form">
                    <h2>Join the Game</h2>
                    <input
                        type="text"
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Pick an emoji (like 😀)"
                        value={emoji}
                        onChange={(e) => setEmoji(e.target.value)}
                    />
                    <button onClick={handleJoinGame}>Join Game</button>
                </div>
            ) : (
                <div className="buzzer-area">
                    <h2>Welcome, {emoji} {name}!</h2>
                    <button
                        className="buzzer-button"
                        onClick={handleBuzz}
                        disabled={buzzedIn}
                    >
                        {buzzedIn ? '✅ Buzzed!' : '🛎️ Buzz In!'}
                    </button>
                    <p>Wait for the host to ask a question before buzzing.</p>
                </div>
            )}
        </div>
    );
}

export default PlayerScreen;
