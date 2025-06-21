const ProfileCard = () => {
    return (
      <section className="profile-card">
        <div className="top-section">
          <img
            src="https://i.pravatar.cc/100"
            alt="Avatar"
            className="avatar"
          />
          <div className="info">
            <h3>Rania M.</h3>
            <p>Développeuse FullStack</p>
          </div>
        </div>
  
        
  
        <div className="details">
          <h4>Informations</h4>
          <p><strong>Nom complet:</strong> Rania Mtiri</p>
          <p><strong>Email:</strong> rania@example.com</p>
          <p><strong>Localisation:</strong> Tunisie</p>
        </div>
      </section>
    );
  };
  
  export default ProfileCard;
  