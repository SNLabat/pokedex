export default function WondercardDisplay({ wcData }) {
  if (!wcData) return null;

  // Helper function to get sprite path
  const getPokemonSpritePath = () => {
    const baseUrl = '/img/large/pokemon';
    const shinyPath = wcData.canBeShiny === 'Always' ? '/shiny/' : '/regular/';
    const formSuffix = wcData.formName !== 'None' ? `-${wcData.formId}` : '';
    return `${baseUrl}${shinyPath}${wcData.dexNo || wcData.pokemon?.species || '0'}${formSuffix}.png`;
  };

  // Safely get values with fallbacks
  const getBallSpritePath = () => {
    if (!wcData.ball) return null;
    return `/img/balls/ball-${wcData.ball.toLowerCase().replace(' ', '-')}.png`;
  };

  const getRibbonSpritePath = () => {
    if (!wcData.Ribbon || wcData.Ribbon === 'None') return null;
    return `/img/ribbons/ribbon-${wcData.Ribbon.toLowerCase().replace(' ', '-')}.png`;
  };

  const getItemSpritePath = () => {
    if (!wcData.heldItem || wcData.heldItem === 'None') return null;
    return `/img/items/item-${wcData.heldItem.toLowerCase().replace(' ', '-')}.png`;
  };

  // Handle both WC6 and WC6 Full formats
  const pokemonName = wcData.pokemonName || `Pokemon #${wcData.pokemon?.species}`;
  const formName = wcData.formName || 'None';
  const nature = wcData.nature || 'Unknown';
  const ability = wcData.abilityType || 'Unknown';
  const ivs = wcData.ivType || 'Unknown';
  const gender = wcData.gender || 'Unknown';
  const moves = [
    wcData.move1Name || wcData.pokemon?.moves?.[0],
    wcData.move2Name || wcData.pokemon?.moves?.[1],
    wcData.move3Name || wcData.pokemon?.moves?.[2],
    wcData.move4Name || wcData.pokemon?.moves?.[3]
  ].filter(Boolean);

  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-6">
      {/* File name header */}
      <h2 className="text-xl font-mono text-gray-400 mb-6">{wcData.fileName}</h2>

      {/* Title and Description */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-red-400 mb-4">{wcData.wcTitle || wcData.cardTitle}</h1>
        <p className="text-lg text-gray-300">{wcData.cardText || wcData.redemptionText}</p>
      </div>

      {/* Pokemon Image and Basic Info */}
      <div className="flex flex-col md:flex-row gap-8 mb-8">
        <div className="flex-shrink-0 w-64 h-64 relative">
          <img
            src={getPokemonSpritePath()}
            alt={pokemonName}
            className="w-full h-full object-contain"
          />
        </div>
        
        <div className="flex flex-col justify-center space-y-4">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold">{pokemonName}</h2>
            {formName !== 'None' && (
              <span className="text-gray-400">({formName})</span>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            {/* Ball Sprite */}
            {getBallSpritePath() && (
              <div className="w-8 h-8">
                <img
                  src={getBallSpritePath()}
                  alt={wcData.ball}
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            
            {/* Ribbon Display */}
            {getRibbonSpritePath() && (
              <div className="w-8 h-8">
                <img
                  src={getRibbonSpritePath()}
                  alt={wcData.Ribbon}
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            
            {/* Held Item */}
            {getItemSpritePath() && (
              <div className="w-8 h-8">
                <img
                  src={getItemSpritePath()}
                  alt={wcData.heldItem}
                  className="w-full h-full object-contain"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column - Pokemon Info */}
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-400">Pokémon Details</h3>
            <p><span className="text-gray-400">Nature:</span> {nature}</p>
            <p><span className="text-gray-400">Ability:</span> {ability}</p>
            <p><span className="text-gray-400">IVs:</span> {ivs}</p>
            <p>
              <span className="text-gray-400">Gender:</span>{' '}
              <span className={gender === 'Male' ? 'text-blue-400' : gender === 'Female' ? 'text-pink-400' : 'text-gray-300'}>
                {gender}
              </span>
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-lg font-semibold text-gray-400">Moves:</h4>
            <ul className="list-disc list-inside pl-4">
              {moves.map((move, index) => (
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
            <p><span className="text-gray-400">Level:</span> {wcData.Level}</p>
            <p><span className="text-gray-400">Location:</span> {wcData.metLocation}</p>
            <p><span className="text-gray-400">Language:</span> {wcData.language}</p>
            <p>
              <span className="text-gray-400">Shiny:</span>{' '}
              <span className={wcData.canBeShiny === 'Always' ? 'text-yellow-400 font-bold' : ''}>
                {wcData.canBeShiny}
              </span>
            </p>
            <p>
              <span className="text-gray-400">Obtainable:</span>{' '}
              <span className={wcData.giftRedeemable === 'Infinite' ? 'text-green-400 font-bold' : ''}>
                {wcData.giftRedeemable}
              </span>
            </p>
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