import { useAuth } from "../Context/AuthContext";

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-blue-900 mb-4">Welcome, {user?.name || user?.email}!</h1>
        <p className="text-gray-600 mb-8">You have successfully logged into the TeamFlux Dashboard.</p>
        
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-8">
          <p className="text-sm text-blue-700 font-medium">Account Details:</p>
          <p className="text-blue-900 font-bold">{user?.email}</p>
        </div>

        <button
          onClick={logout}
          className="w-full py-3 px-6 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition duration-200 transform hover:scale-[1.02]"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
