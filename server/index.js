const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const teams = [];
let nextTeamId = 1;
let firstBuzz = null;

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('✅ A user connected:', socket.id);

    socket.on('player-joined', (data) => {
        console.log('👤 Player joined:', data);

        // Assign to a team (pair into teams of 2)
        let assignedTeam;
        const openTeam = teams.find(t => t.players.length < 2);

        if (openTeam) {
            openTeam.players.push({ id: socket.id, name: data.name, emoji: data.emoji });
            assignedTeam = openTeam;
        } else {
            const color = getRandomColor();
            const newTeam = {
                teamId: nextTeamId++,
                name: `Team #${nextTeamId - 1}`,
                color,
                players: [{ id: socket.id, name: data.name, emoji: data.emoji }],
                score: 0
            };
            teams.push(newTeam);
            assignedTeam = newTeam;
        }

        // Send back team info
        socket.emit('team-assigned', {
            teamId: assignedTeam.teamId,
            name: assignedTeam.name,
            emoji: data.emoji,
            color: assignedTeam.color
        });

        io.emit('update-teams', teams);
    });

    socket.on('buzz-in', (data) => {
        console.log('🛎️ Buzz in:', data);
        if (!firstBuzz) {
            firstBuzz = data;
            io.emit('player-buzzed', data);
        }
    });

    socket.on('mark-completed', ({ categoryIndex, questionIndex }) => {
        console.log('✅ Marked completed:', categoryIndex, questionIndex);
        io.emit('mark-completed', { categoryIndex, questionIndex });
        firstBuzz = null;  // Reset buzzers
        io.emit('reset-buzzer');
    });

    socket.on('show-jaypardy', () => {
        console.log('🚀 Server: Host requested to start Jaypardy');
        io.emit('display-jaypardy');
    });

    socket.on('show-question', (data) => {
        console.log('🟢 Server: Host sent a question:', data);
        io.emit('display-question', data);
    });

    socket.on('disconnect', () => {
        console.log('❌ User disconnected:', socket.id);
    });
});

http.listen(5000, () => {
    console.log('🚀 Server running on port 5000');
});

function getRandomColor() {
    const colors = ['#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4'];
    return colors[Math.floor(Math.random() * colors.length)];
}
