function DashboardCard({ title, value, color }) {
  return (
    <div
      className={`rounded-xl p-6 shadow-md text-white ${color}`}
    >
      <h3 className="text-lg font-semibold">{title}</h3>

      <p className="text-3xl font-bold mt-4">
        {value}
      </p>
    </div>
  );
}

export default DashboardCard;