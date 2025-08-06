import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Target, 
  CheckSquare, 
  BarChart3,
  Calendar
} from 'lucide-react';

const Sidebar = ({ isOpen, onLinkClick }) => {
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Students', href: '/students', icon: Users },
    { name: 'Parades', href: '/parades', icon: Target },
    { name: 'Attendance', href: '/attendance', icon: CheckSquare },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
  ];

  return (
    <div className={`${isOpen ? 'w-64' : 'w-20'} bg-white shadow-lg border-r border-gray-200 h-[calc(100vh-4rem)] overflow-hidden transition-all duration-300 ease-in-out`}>
      <div className="p-4 h-full overflow-y-auto">
        <nav className="space-y-2">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={onLinkClick}
              className={({ isActive }) =>
                `flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  isActive
                    ? 'bg-blue-100 text-blue-700 border-r-4 border-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                } ${!isOpen ? 'justify-center' : ''}`
              }
              title={!isOpen ? item.name : ''}
            >
              <item.icon className={`h-6 w-6 ${isOpen ? 'mr-3' : ''} flex-shrink-0`} />
              {isOpen && <span className="truncate">{item.name}</span>}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
