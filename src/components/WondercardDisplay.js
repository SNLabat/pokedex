export default function WondercardDisplay({ wcData }) {
  if (!wcData) return null;

  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4 text-red-400">Wondercard Details</h2>
      {/* Add wondercard specific display logic here */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Display wondercard data in a similar format to Pokemon details */}
      </div>
    </div>
  );
} 