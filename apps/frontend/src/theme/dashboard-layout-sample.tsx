import { Card } from "../../components/ui";

type Metric = {
  label: string;
  value: string;
};

export function DashboardLayoutSample({ metrics }: { metrics: Metric[] }) {
  return (
    <div className="container px-6 py-8">
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label} className="p-6">
            <p className="text-sm text-text-secondary">{metric.label}</p>
            <p className="mt-2 text-2xl font-semibold text-text-primary">{metric.value}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
