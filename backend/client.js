/* 
const io = require("socket.io-client");

// Connexion au serveur backend
const socket = io("http://localhost:5000", {
    reconnection: true, // Permet de garder la connexion active
    reconnectionAttempts: 10, // Essaye de se reconnecter 10 fois en cas de coupure
    reconnectionDelay: 2000 // Attente de 2 secondes entre chaque essai
});

socket.on("connect", () => {
    console.log("🟢 Connecté au serveur avec ID :", socket.id);

    // Simuler la connexion d'un utilisateur (ID = 1)
    socket.emit("userOnline", 1);
});

socket.on("updateUserStatus", (data) => {
    console.log("🔄 Mise à jour du statut utilisateur :", data);
});

socket.on("disconnect", () => {
    console.log("❌ Déconnecté du serveur");
});

*/

const io = require('socket.io-client');

// Connexion au serveur
const socket = io('http://localhost:5000');

socket.on('connect', () => {
    console.log('🟢 Connecté au serveur avec ID :', socket.id);
});

// ⚠️ Remplace "2" par l'ID de l'utilisateur qui doit recevoir la notification
const userId = 2; // ID de l'utilisateur qui écoute les notifications
socket.on(`notification-${userId}`, (data) => {
    console.log('🔔 Nouvelle notification reçue :', data.message);
});

socket.on('disconnect', () => {
    console.log('🔴 Déconnecté du serveur');
});

