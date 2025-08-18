import './App.css';
import Logins from './Components/Student/Logins';
import LoginT from './Components/Teacher/LoginT';
import { Routes, Route } from 'react-router-dom';
import TeacherDashboard from './Components/Teacher/Teacherdash';
import Auth from './Components/Auth';
import AuthDisplay from './Components/AuthDisplay';
import Studentdash from './Components/Student/Studentdash';
import View from './Components/Teacher/View';
import Profile from './Components/Teacher/Profile';
import TeacherScheduleManager from './Components/Admin/TeacherScheduleManager';
import StudentScheduleManager from './Components/Admin/StudentScheduleManager';
import ClassScheduleManager from './Components/Admin/ClassScheduleManager';
import PeopleManager from './Components/Admin/PeopleManager';

function App() {
  return (
    <div className="App">
      <Auth>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Logins />} />
          <Route path="/teacher" element={<LoginT />} />

          {/* Admin Routes */}
          <Route path="/admin/people" element={<PeopleManager />} />
          <Route path="/admin/teacher-schedules" element={<TeacherScheduleManager />} />
          <Route path="/admin/class-schedules" element={<ClassScheduleManager />} />

          {/* Protected Routes */}
          <Route
            path="/teacherdash"
            element={
              <AuthDisplay>
                <TeacherDashboard />
              </AuthDisplay>
            }
          />
          <Route
            path="/studentdash"
            element={
              <AuthDisplay>
                <Studentdash />
              </AuthDisplay>
            }
          />
          <Route
            path="/view"
            element={
              <AuthDisplay>
                <View />
              </AuthDisplay>
            }
          />
          <Route
            path="/profile"
            element={
              <AuthDisplay>
                <Profile />
              </AuthDisplay>
            }
          />
        </Routes>
      </Auth>
    </div>
  );
}

export default App;
