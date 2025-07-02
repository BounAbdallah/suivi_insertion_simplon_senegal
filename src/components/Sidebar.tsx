// import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  // Users, 
  Building2, 
  Briefcase, 
  Calendar, 
  FileText,
  BookOpen,
  School,
  Shield,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

const navigation = [
  { name: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'coach', 'apprenant', 'entreprise'] },
  { name: 'Gestion utilisateurs', href: '/admin/users', icon: Shield, roles: ['admin'] },
  { name: 'Statistiques', href: '/admin/stats', icon: TrendingUp, roles: ['admin'] },
  { name: 'Apprenants', href: '/apprenants', icon: School, roles: ['admin', 'coach'] },
  { name: 'Entreprises', href: '/entreprises', icon: Building2, roles: ['admin', 'coach'] },
  { name: 'Offres d\'emploi', href: '/emplois', icon: Briefcase, roles: ['admin', 'coach', 'apprenant', 'entreprise'] },
  { name: 'Événements', href: '/evenements', icon: Calendar, roles: ['admin', 'coach', 'apprenant'] },
  { name: 'Documents', href: '/documents', icon: FileText, roles: ['admin', 'coach', 'apprenant'] },
];

export function Sidebar() {
  const { user } = useAuth();

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(user?.role || '')
  );

  return (
    <motion.div
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      className="w-64 bg-white shadow-lg border-r border-gray-200"
    >
      <div className="flex items-center justify-center h-16 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">Simplon</span>
        </div>
      </div>

      <nav className="mt-8 px-4">
        <ul className="space-y-2">
          {filteredNavigation.map((item, index) => (
            <motion.li
              key={item.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-red-50 text-red-700 border-r-2 border-red-500'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </NavLink>
            </motion.li>
          ))}
        </ul>
      </nav>

      {/* <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-lg p-4 text-white">
          <h4 className="font-semibold text-sm">Plateforme Simplon</h4>
          <p className="text-xs mt-1 opacity-90">Suivi de l'insertion professionnelle</p>
        </div>
      </div> */}
    </motion.div>
  );
}