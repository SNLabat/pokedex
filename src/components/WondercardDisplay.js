export default function WondercardDisplay({ wcData }) {
  if (!wcData) return null;

  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-6">
      {/* File name header */}
      <h2 className="text-xl font-mono text-gray-400 mb-6">{wcData.fileName}</h2>

      {/* Title and Description */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-red-400 mb-4">{wcData.wcTitle}</h1>
        <p className="text-lg text-gray-300">{wcData.cardText}</p>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column - Pokemon Info */}
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-400">Pokémon Details</h3>
            <p><span className="text-gray-400">Pokémon:</span> {wcData.pokemonName}</p>
            <p><span className="text-gray-400">Form:</span> {wcData.formName}</p>
            <p><span className="text-gray-400">Nickname:</span> {wcData.nickname || 'None'}</p>
            <p><span className="text-gray-400">Nature:</span> {wcData.nature}</p>
            <p><span className="text-gray-400">Ability:</span> {wcData.abilityType}</p>
            <p><span className="text-gray-400">IVs:</span> {wcData.ivType}</p>
          </div>

          <div className="space-y-2">
            <h4 className="text-lg font-semibold text-gray-400">Moves:</h4>
            <ul className="list-disc list-inside pl-4">
              {[wcData.move1Name, wcData.move2Name, wcData.move3Name, wcData.move4Name]
                .filter(move => move)
                .map((move, index) => (
                  <li key={index} className="text-gray-300">{move}</li>
                ))}
            </ul>
          </div>
        </div>

        {/* Right Column - Additional Details */}
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-400">Card Information</h3>
            <p><span className="text-gray-400">OT:</span> {wcData.ot}</p>
            <p><span className="text-gray-400">ID No:</span> {wcData.idNo}</p>
            <p><span className="text-gray-400">Gender:</span> {wcData.gender}</p>
            <p><span className="text-gray-400">Level:</span> {wcData.Level}</p>
            <p><span className="text-gray-400">Location:</span> {wcData.metLocation}</p>
            <p><span className="text-gray-400">Ball:</span> {wcData.ball}</p>
            <p><span className="text-gray-400">Item:</span> {wcData.heldItem}</p>
            <p><span className="text-gray-400">Ribbon:</span> {wcData.Ribbon}</p>
            <p><span className="text-gray-400">Language:</span> {wcData.language}</p>
            <p><span className="text-gray-400">Shiny:</span> {wcData.canBeShiny}</p>
            <p><span className="text-gray-400">Obtainable:</span> {wcData.giftRedeemable}</p>
          </div>
        </div>
      </div>

      {/* Debug Section */}
      <div className="mt-8 pt-8 border-t border-gray-700">
        <h3 className="text-xl font-semibold text-gray-400 mb-4">Full Output</h3>
        <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm text-gray-300">
          {JSON.stringify(wcData, null, 2)}
        </pre>
      </div>
    </div>
  );
} 