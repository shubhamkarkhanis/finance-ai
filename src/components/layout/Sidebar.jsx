import { NavLink } from 'react-router-dom';
import { LuLayoutDashboard, LuBot } from 'react-icons/lu';
import { FiBarChart2, FiList } from "react-icons/fi";
import { FaRegNewspaper, FaBitcoin } from "react-icons/fa6"; // Import FaBitcoin

const Sidebar = () => {
  return (
    <aside className="w-64 bg-[#161B22] p-5 border-r border-gray-800 flex flex-col">
      <div className="flex items-center gap-2 mb-10">
        {/* ... (header is the same) */}
      </div>

      <nav className="flex flex-col justify-between flex-1">
        <div>
          <h2 className="text-xs text-gray-500 font-semibold tracking-wider uppercase mb-3">Analytics</h2>
          <ul className="space-y-2">
            <NavItem icon={<LuLayoutDashboard size={20} />} label="Dashboard" to="/" />
            <NavItem icon={<FiBarChart2 size={20} />} label="Sentiment Analysis" to="/sentiment-analysis" />
            <NavItem icon={<LuBot size={20} />} label="AI Assistant" to="/ai-assistant" />
          </ul>

          <h2 className="text-xs text-gray-500 font-semibold tracking-wider uppercase my-4 pt-4 border-t border-gray-800">Market Data</h2>
          <ul className="space-y-2">
            <NavItem icon={<FiList size={20} />} label="Watchlist" to="/watchlist" />
            <NavItem icon={<FaRegNewspaper size={20} />} label="Market News" to="/market-news" />
            <NavItem icon={<FaBitcoin size={20} />} label="Crypto" to="/crypto" />
          </ul>
        </div>
      </nav>
    </aside>
  );
};


// Helper component for navigation items
const NavItem = ({ icon, label, to }) => {
  return (
    <li>
      <NavLink
        to={to}
        end
        className={({ isActive }) =>
          `flex items-center gap-3 p-2 rounded-md transition-colors duration-200 text-sm font-medium ${
            isActive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
          }`
        }
      >
        {icon}
        <span>{label}</span>
      </NavLink>
    </li>
  );
};

export default Sidebar;