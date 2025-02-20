export default function WondercardDisplay({ wcData }) {
  if (!wcData) return null;

  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4 text-red-400">Wondercard Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-400 mb-4">Card Information</h3>
          <div className="space-y-2">
            <p><span className="text-gray-400">Type:</span> {wcData.type}</p>
            <p><span className="text-gray-400">Card ID:</span> {wcData.cardID}</p>
            {wcData.cardTitle && (
              <p><span className="text-gray-400">Title:</span> {wcData.cardTitle}</p>
            )}
            {wcData.gamesSupported && (
              <p><span className="text-gray-400">Games:</span> {wcData.gamesSupported.join(', ')}</p>
            )}
          </div>
        </div>

        {wcData.pokemon && (
          <div>
            <h3 className="text-xl font-semibold text-gray-400 mb-4">Pokémon Details</h3>
            <div className="space-y-2">
              <p><span className="text-gray-400">Species ID:</span> {wcData.pokemon.species}</p>
              <p><span className="text-gray-400">Level:</span> {wcData.pokemon.level}</p>
              <p><span className="text-gray-400">Form:</span> {wcData.pokemon.form}</p>
              <p><span className="text-gray-400">Shiny:</span> {wcData.pokemon.shiny ? 'Yes' : 'No'}</p>
              <p><span className="text-gray-400">Moves:</span></p>
              <ul className="list-disc list-inside pl-4">
                {wcData.pokemon.moves.map((move, index) => (
                  <li key={index}>{move}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {wcData.metadata && (
          <div className="md:col-span-2">
            <h3 className="text-xl font-semibold text-gray-400 mb-4">Distribution Details</h3>
            <div className="space-y-2">
              <p><span className="text-gray-400">Start Date:</span> {wcData.metadata.distributionStart.toLocaleDateString()}</p>
              <p><span className="text-gray-400">End Date:</span> {wcData.metadata.distributionEnd.toLocaleDateString()}</p>
            </div>
          </div>
        )}

        {wcData.redemptionText && (
          <div className="md:col-span-2">
            <h3 className="text-xl font-semibold text-gray-400 mb-4">Redemption Text</h3>
            <p className="whitespace-pre-wrap">{wcData.redemptionText}</p>
          </div>
        )}
      </div>
    </div>
  );
} 