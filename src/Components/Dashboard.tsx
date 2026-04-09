import { useAuth } from "../Context/AuthContext";

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, {user?.name || user?.email?.split('@')[0]}!</p>
        </div>
        <div className="hidden sm:block">
          <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-medium text-sm">
            Primary Role: Admin
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stats Card 1 */}
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-gray-500 text-sm font-medium">Total Projects</h3>
          <p className="text-4xl font-bold text-gray-900 mt-3">12</p>
          <div className="mt-5">
            <span className="text-green-500 text-sm font-semibold">+2 this week</span>
          </div>
        </div>

        {/* Stats Card 2 */}
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-gray-500 text-sm font-medium">Active Teams</h3>
          <p className="text-4xl font-bold text-gray-900 mt-3">4</p>
          <div className="mt-5">
            <span className="text-gray-400 text-sm font-semibold">No change</span>
          </div>
        </div>

        {/* Stats Card 3 */}
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-gray-500 text-sm font-medium">Tech Debt Score</h3>
          <p className="text-4xl font-bold text-gray-900 mt-3">84/100</p>
          <div className="mt-5">
            <span className="text-green-500 text-sm font-semibold">Improving</span>
          </div>
        </div>
      </div>
      
      {/* Activity List */}
      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Recent Activity</h2>
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs mr-4">
                  P{i}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-[15px]">Project Update {i}</p>
                  <p className="text-sm text-gray-500">Updated 2 hours ago</p>
                </div>
              </div>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-bold">View</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
