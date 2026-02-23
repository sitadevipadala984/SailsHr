import { Card } from "../components/ui/card";

type Metric = {
  label: string;
  value: string;
};

export function DashboardLayoutSample({ metrics }: { metrics: Metric[] }) {
  return (
    <div className="container px-6 py-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label} className="p-4">
            <p className="text-sm font-medium text-gray-600">{metric.label}</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900">{metric.value}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
