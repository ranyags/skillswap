import Sidebar from "../components/Sidebar";
import ProfileCard from "../components/ProfileCard";
import Conversations from "../components/Conversations";
import "../styles/ProfilePage.scss";

const ProfilePage = () => {
  return (
    <div className="profile-layout">
      <Sidebar />
      <main className="profile-content">
        <ProfileCard />
        <Conversations />
      </main>
    </div>
  );
};

export default ProfilePage;