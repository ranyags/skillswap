const Sidebar = () => {
    return (
      <aside className="sidebar">
        <h2>SkillSwap</h2>
        <ul>
          <li>Dashboard</li>
          <li className="active">Profile</li>
          <li>Messages</li>
          <li>Notifications</li>
          <li>Logout</li>
        </ul>
      </aside>
    );
  };
  
  export default Sidebar;
  