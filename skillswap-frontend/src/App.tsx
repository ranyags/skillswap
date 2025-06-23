import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import Skills from "./pages/Skills";
import Chat from "./pages/Chat";
import UserList from "./pages/UserList";
import Discussions from "./pages/Discussions";
import AdminDashboard from "./pages/AdminDashboard";
import Unauthorized from "./pages/Unauthorized";
import Notifications from "./pages/Notifications";
import Avis from "./pages/Avis";
import AddReview from "./pages/AddReview";
import AddPost from "./pages/AddPost";
import AllPosts from "./pages/AllPosts";

import ProfileInformations from "./pages/ProfileInformations";
import ProfileSkills from "./pages/ProfileSkills";
import ProfileAvis from "./pages/ProfileAvis";
import ProfileNotifications from "./pages/ProfileNotifications";
import ProfileMessages from "./pages/ProfileMessages";

import PrivateRoute from "./components/PrivateRoute";
import PrivateRouteAdmin from "./routes/PrivateRouteAdmin";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <>
      <Navbar />

      {/* ✅ Toast container global */}
      <ToastContainer position="bottom-right" autoClose={3000} />

      <main>
        <Routes>

          {/* ✅ Routes Publiques */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/posts" element={<AllPosts />} />
          <Route path="/add-post" element={<AddPost />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/skills/:skillId/avis" element={<Avis />} />

          {/* 🔒 Routes Privées */}
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile/edit"
            element={
              <PrivateRoute>
                <EditProfile />
              </PrivateRoute>
            }
          />
          <Route
            path="/skills"
            element={
              <PrivateRoute>
                <Skills />
              </PrivateRoute>
            }
          />
          <Route
            path="/add-review"
            element={
              <PrivateRoute>
                <AddReview />
              </PrivateRoute>
            }
          />
          
          {/* 💬 Chat & Discussions Routes */}
          <Route
            path="/chat/:receiverId"
            element={
              <PrivateRoute>
                <Chat />
              </PrivateRoute>
            }
          />
          <Route
            path="/users"
            element={
              <PrivateRoute>
                <Discussions />
              </PrivateRoute>
            }
          />

          {/* ✅ Sous-pages du profil */}
          <Route
            path="/profile/informations"
            element={
              <PrivateRoute>
                <ProfileInformations />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile/competences"
            element={
              <PrivateRoute>
                <ProfileSkills />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile/avis"
            element={
              <PrivateRoute>
                <ProfileAvis />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile/notifications"
            element={
              <PrivateRoute>
                <ProfileNotifications />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile/messages"
            element={
              <PrivateRoute>
                <ProfileMessages />
              </PrivateRoute>
            }
          />

          {/* 🛡️ Route Admin */}
          <Route
            path="/admin"
            element={
              <PrivateRouteAdmin>
                <AdminDashboard />
              </PrivateRouteAdmin>
            }
          />

          {/* ❌ Accès Refusé */}
          <Route path="/unauthorized" element={<Unauthorized />} />

        </Routes>
      </main>
    </>
  );
}

export default App;
