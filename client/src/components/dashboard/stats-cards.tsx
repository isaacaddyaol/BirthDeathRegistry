import { Card, CardContent } from "@/components/ui/card";
import { Clock, TrendingUp, Baby, Cross } from "lucide-react";

interface Stats {
  pendingApplications: number;
  thisMonthRegistrations: number;
  totalBirths: number;
  totalDeaths: number;
}

interface StatsCardsProps {
  stats?: Stats;
}

export default function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gov-gray">Pending Applications</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats?.pendingApplications || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-gov-orange bg-opacity-10 rounded-lg flex items-center justify-center">
              <Clock className="text-gov-orange" size={24} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gov-gray">This Month</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats?.thisMonthRegistrations || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-gov-green bg-opacity-10 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-gov-green" size={24} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gov-gray">Total Births</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats?.totalBirths || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-gov-blue bg-opacity-10 rounded-lg flex items-center justify-center">
              <Baby className="text-gov-blue" size={24} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gov-gray">Total Deaths</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats?.totalDeaths || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-gray-600 bg-opacity-10 rounded-lg flex items-center justify-center">
              <Cross className="text-gray-600" size={24} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
