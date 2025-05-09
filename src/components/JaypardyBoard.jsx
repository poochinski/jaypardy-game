import React, { useState, useEffect } from 'react';
import questionsData from '../questions';
import './JaypardyBoard.css';

function JaypardyBoard({ isHost, socket }) {
    const [selectedQA, setSelectedQA] = useState(null);
    const [showBoard, setShowBoard] = useState(isHost);
    const [completedQuestions, setCompletedQuestions] = useState([]);
    const [teams, setTeams] = useState([]);
    const [buzzInfo, setBuzzInfo] = useState(null);

    useEffect(() => {
        if (!isHost && socket) {
            socket.on('display-jaypardy', () => {
                console.log('🖥️ Display received: show Jaypardy');
                setShowBoard(true);
                setSelectedQA(null);
            });

            socket.on('display-question', (data) => {
                console.log('🖥️ Display received question:', data);
                setSelectedQA({
                    ...data,
                    categoryIndex: data.categoryIndex,
                    questionIndex: data.questionIndex,
                });
            });

            socket.on('mark-completed', ({ categoryIndex, questionIndex }) => {
                console.log(`🖥️ Marking completed: C${categoryIndex} Q${questionIndex}`);
                setCompletedQuestions((prev) => [
                    ...prev,
                    { categoryIndex, questionIndex },
                ]);
                setSelectedQA(null); // close popup
                setBuzzInfo(null); // reset buzz display
            });
        }

        // Listen for team updates
        socket.on('update-teams', (data) => {
            console.log('🆙 Updated teams:', data);
            setTeams(data);
        });

        // Listen when someone buzzes in
        socket.on('player-buzzed', (data) => {
            console.log('🚨 Buzzed in:', data);
            setBuzzInfo(data);
        });

        // Reset buzzer
        socket.on('reset-buzzer', () => {
            setBuzzInfo(null);
        });
    }, [isHost, socket]);

    const handleHostClick = (qa, categoryIndex, questionIndex) => {
        if (!isHost) return;
        setSelectedQA({ ...qa, categoryIndex, questionIndex });
        socket.emit('show-question', { ...qa, categoryIndex, questionIndex });
    };

    const handleCorrect = () => {
        if (selectedQA) {
            const { categoryIndex, questionIndex } = selectedQA;
            setCompletedQuestions((prev) => [
                ...prev,
                { categoryIndex, questionIndex },
            ]);
            socket.emit('mark-completed', { categoryIndex, questionIndex });
            setSelectedQA(null);
        }
    };

    const handleWrong = () => {
        setSelectedQA(null);
    };

    const isQuestionCompleted = (catIdx, qIdx) => {
        return completedQuestions.some(
            (item) =>
                item.categoryIndex === catIdx &&
                item.questionIndex === qIdx
        );
    };

    if (!showBoard) {
        return (
            <div className="menu">
                <h2>Waiting for Host to start Jaypardy...</h2>
            </div>
        );
    }

    return (
        <div className={isHost ? 'host-layout' : 'jaypardy-board'}>
            {/* Board */}
            {!selectedQA ? (
                <div className="categories">
                    {questionsData.map((category, catIndex) => (
                        <div key={catIndex} className="category-column">
                            <div className="category-header">{category.category}</div>
                            {category.questions.map((qa, qIndex) => {
                                const completed = isQuestionCompleted(catIndex, qIndex);
                                return (
                                    <button
                                        key={qIndex}
                                        className={`question-cell ${completed ? 'completed' : ''}`}
                                        onClick={() => handleHostClick(qa, catIndex, qIndex)}
                                        disabled={completed || !isHost}
                                    >
                                        {completed ? '' : qa.value}
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="popup">
                    <div className="popup-content">
                        <p>{selectedQA.question}</p>
                        {isHost && selectedQA.answer && (
                            <>
                                <p><strong>Answer:</strong> {selectedQA.answer}</p>
                                <div className="answer-buttons">
                                    <button onClick={handleCorrect}>✅ Correct</button>
                                    <button onClick={handleWrong}>❌ Wrong</button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Buzz info */}
            {buzzInfo && (
                <div className="buzz-banner" style={{ backgroundColor: buzzInfo.color }}>
                    🚨 {buzzInfo.name} buzzed in! 🚨
                </div>
            )}

            {/* Team scoreboard */}
            <div className="team-scoreboard">
                {teams.map((team) => (
                    <div key={team.teamId} className="team-box" style={{ borderColor: team.color }}>
                        <div className="score">{team.score ?? 0}</div>
                        <div className="team-name">{team.name}</div>
                        <div className="team-players">
                            {team.players.map((p, idx) => (
                                <span key={idx}>{p.emoji} {p.name}</span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {isHost && (
                <div className="host-buttons-wrapper">
                    <button className="host-btn">B1</button>
                    <button className="host-btn">B2</button>
                    <button className="host-btn">B3</button>
                    <button className="host-btn">B4</button>
                </div>
            )}
        </div>
    );
}

export default JaypardyBoard;
