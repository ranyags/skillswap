const Conversations = () => {
    const messages = [
      { name: "Fedi M.", text: "Salut ! Tu es dispo ?" },
      { name: "Nour B.", text: "Très bon échange, merci !" },
      { name: "Wassim K.", text: "On peut s'appeler ?" },
    ];
  
    return (
      <section className="conversations">
        <h4>Conversations</h4>
        <ul>
          {messages.map((msg, index) => (
            <li key={index}>
              <div>
                <strong>{msg.name}</strong>
                <p>{msg.text}</p>
              </div>
              <button>Répondre</button>
            </li>
          ))}
        </ul>
      </section>
    );
  };
  
  export default Conversations;