
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js';
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

interface DashboardChartsProps {
  stats: any;
}

export function DashboardCharts({ stats }: DashboardChartsProps) {
  if (!stats) return null;

  // Données pour le graphique en secteurs des statuts d'insertion
  const insertionData = {
    labels: stats.insertion.map((item: any) => 
      item.statut_insertion.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
    ),
    datasets: [
      {
        data: stats.insertion.map((item: any) => item.count),
        backgroundColor: [
          '#EF4444', // Rouge
          '#F97316', // Orange
          '#10B981', // Vert
          '#3B82F6', // Bleu
          '#8B5CF6', // Violet
          '#F59E0B', // Jaune
        ],
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  // Données pour le graphique en barres de l'évolution mensuelle
  const monthlyData = {
    labels: stats.monthly_insertions.map((item: any) => item.month),
    datasets: [
      {
        label: 'Insertions',
        data: stats.monthly_insertions.map((item: any) => item.count),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 2,
        borderRadius: 4,
      },
    ],
  };

  // Données pour le graphique en anneau des rôles utilisateurs
  const userRolesData = {
    labels: ['Administrateurs', 'Coachs', 'Apprenants', 'Entreprises'],
    datasets: [
      {
        data: [
          stats.users.find((u: any) => u.role === 'admin')?.count || 0,
          stats.users.find((u: any) => u.role === 'coach')?.count || 0,
          stats.users.find((u: any) => u.role === 'apprenant')?.count || 0,
          stats.users.find((u: any) => u.role === 'entreprise')?.count || 0,
        ],
        backgroundColor: [
          '#EF4444', // Rouge pour admin
          '#3B82F6', // Bleu pour coach
          '#10B981', // Vert pour apprenant
          '#8B5CF6', // Violet pour entreprise
        ],
        borderWidth: 3,
        borderColor: '#fff',
        cutout: '60%',
      },
    ],
  };

  // Données pour le graphique linéaire des offres d'emploi
  const jobsData = {
    labels: ['CDI', 'CDD', 'Stage', 'Freelance', 'Apprentissage'],
    datasets: [
      {
        label: 'Offres d\'emploi',
        data: [
          stats.jobs.find((j: any) => j.statut === 'cdi')?.count || 0,
          stats.jobs.find((j: any) => j.statut === 'cdd')?.count || 0,
          stats.jobs.find((j: any) => j.statut === 'stage')?.count || 0,
          stats.jobs.find((j: any) => j.statut === 'freelance')?.count || 0,
          stats.jobs.find((j: any) => j.statut === 'apprentissage')?.count || 0,
        ],
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#fff',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
      },
    },
  };

  const pieOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      legend: {
        ...chartOptions.plugins.legend,
        position: 'right' as const,
      },
    },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Graphique en secteurs - Statuts d'insertion */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Statuts d'insertion des apprenants
        </h3>
        <div className="h-80">
          <Pie data={insertionData} options={pieOptions} />
        </div>
      </div>

      {/* Graphique en barres - Évolution mensuelle */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Évolution des insertions
        </h3>
        <div className="h-80">
          <Bar data={monthlyData} options={chartOptions} />
        </div>
      </div>

      {/* Graphique en anneau - Répartition des rôles */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Répartition des utilisateurs par rôle
        </h3>
        <div className="h-80">
          <Doughnut data={userRolesData} options={pieOptions} />
        </div>
      </div>

      {/* Graphique linéaire - Types de contrats */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Répartition des types de contrats
        </h3>
        <div className="h-80">
          <Line data={jobsData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
} 