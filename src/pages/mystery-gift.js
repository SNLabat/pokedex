import { useState } from 'react';
import Head from 'next/head';
import Navigation from '../components/Navigation';
import { parseWCBuffer } from '../utils/wcparse';
import ErrorBoundary from '../components/ErrorBoundary';
import PlaceholderImage from '../components/PlaceholderImage';

export default function MysteryGiftPage() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fileInfo, setFileInfo] = useState(null);
  const [showFilename, setShowFilename] = useState(false);
  
  // UI states
  const [cardColor, setCardColor] = useState("#e53935");
  const [pokemonImage, setPokemonImage] = useState("/img/large/pokemon/regular/0.png");
  const [isPokemon, setIsPokemon] = useState(false);
  const [isItem, setIsItem] = useState(false);
  
  // File handling
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    setLoading(true);
    setError(null);
    setResult(null);
    setFileInfo({
      name: file.name,
      size: file.size,
    });
    
    try {
      const buffer = await readFileAsArrayBuffer(file);
      const parsedData = parseWCBuffer(new Uint8Array(buffer));
      setResult(parsedData);
      
      // Update UI based on card type
      updateUIFromResult(parsedData);
    } catch (err) {
      console.error('Error parsing wondercard:', err);
      setError(err.message || 'Failed to parse wondercard file');
    } finally {
      setLoading(false);
    }
  };
  
  // Convert file to ArrayBuffer
  const readFileAsArrayBuffer = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };
  
  // Update UI based on parsed result
  const updateUIFromResult = (data) => {
    if (data.cardType === 'Pokemon') {
      setIsPokemon(true);
      setIsItem(false);
      
      // Set Pokemon image
      let imagePath = `/img/large/pokemon/regular/0.png`;
      try {
        const dexNo = data.dexNo || 0;
        const formId = data.formId ? `-${data.formId}` : '';
        const isShiny = data.shiny === 'Yes' || data.shiny === 'Always';
        const isEgg = data.isEgg === 'Is egg';
        
        if (isEgg) {
          imagePath = `/img/large/pokemon/${isShiny ? 'shiny' : 'regular'}/egg.png`;
        } else {
          imagePath = `/img/large/pokemon/${isShiny ? 'shiny' : 'regular'}/${dexNo}${formId}.png`;
        }
      } catch (e) {
        console.error('Error setting Pokémon image:', e);
      }
      
      setPokemonImage(imagePath);
    } 
    else if (data.cardType === 'Item') {
      setIsPokemon(false);
      setIsItem(true);
      setPokemonImage(`/img/large/pokemon/regular/0.png`);
    }
    
    // Set card color
    if (data.cardColor === 'Blue') {
      setCardColor("#00A9A9");
    } else if (data.cardColor === 'Purple') {
      setCardColor("#7F49BB");
    } else if (data.cardColor === 'Pink') {
      setCardColor("#F87888");
    } else if (data.cardColor === 'Yellow') {
      setCardColor("#f6fa29");
    } else if (data.cardColor === 'Green') {
      setCardColor("#0759A5");
    } else {
      setCardColor("#e53935"); // Default red
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Head>
        <title>Mystery Gift Unboxer | Pokédex Live</title>
        <meta name="description" content="Upload and parse Mystery Gift files from Pokémon games" />
      </Head>
      
      <Navigation />
      
      <div 
        className="w-full transition-colors duration-300" 
        style={{ backgroundColor: cardColor, height: '300px' }}
      >
        {showFilename && fileInfo && (
          <div className="container mx-auto px-4 py-2 text-right">
            <span className="inline-block bg-black bg-opacity-30 px-3 py-1 rounded text-white">
              {fileInfo.name}
            </span>
          </div>
        )}
      </div>
      
      <main className="container mx-auto px-4 py-8">
        <ErrorBoundary>
          <div className="relative -mt-40 z-10">
            <div className="bg-white text-gray-900 rounded-lg shadow-xl p-6 mb-8 max-w-2xl mx-auto">
              <div className="flex items-center mb-4">
                {pokemonImage ? (
                  <div className="mr-4">
                    <img 
                      src={pokemonImage} 
                      alt="Pokémon" 
                      className="w-24 h-24 object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <div style={{ display: 'none' }}>
                      <PlaceholderImage width={96} height={96} text={result?.pokemonName || "Pokémon"} />
                    </div>
                  </div>
                ) : (
                  <div className="mr-4">
                    <PlaceholderImage width={96} height={96} text="Pokémon" />
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-bold">
                    {result?.wcTitle || "Mystery Gift Unboxer"}
                  </h1>
                  <p className="text-gray-600">
                    {result?.cardText || "Upload a Mystery Gift file to view its contents"}
                  </p>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Wondercard File
                </label>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  accept=".wc6,.wc7,.wc6full,.wc7full,.wc5,.pgf,.wc4,.pcd,.pgt"
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-700"
                />
                <div className="flex items-center mt-2">
                  <input
                    type="checkbox"
                    id="showFilename"
                    checked={showFilename}
                    onChange={(e) => setShowFilename(e.target.checked)}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label htmlFor="showFilename" className="ml-2 block text-sm text-gray-700">
                    Display filename at the top
                  </label>
                </div>
              </div>
              
              {loading && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Parsing wondercard file...</p>
                </div>
              )}
              
              {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">
                  <p className="font-medium">Error parsing wondercard</p>
                  <p className="text-sm">{error}</p>
                </div>
              )}
            </div>
            
            {result && isPokemon && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white text-gray-900 rounded-lg shadow-xl p-6">
                  <h2 className="text-xl font-bold mb-4">Pokémon Details</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="font-bold">Pokémon</p>
                      <p className="capitalize mb-2">{result.pokemonName || "Unknown"}</p>
                      
                      <p className="font-bold">Form</p>
                      <p className="mb-2">{result.formName || "None"}</p>
                      
                      <p className="font-bold">Nickname</p>
                      <p className="mb-2">{result.nickname || "None"}</p>
                      
                      <p className="font-bold">Nature</p>
                      <p className="mb-2">{result.natureLock || result.nature || "Random"}</p>
                      
                      <p className="font-bold">Ability</p>
                      <p className="mb-2">{result.abilityType || "Unknown"}</p>
                      
                      <p className="font-bold">IVs</p>
                      <p className="mb-2">{result.ivInfo || "Random"}</p>
                      
                      <p className="font-bold">Moves</p>
                      <ul className="list-disc list-inside mb-2">
                        {result.move1Name && <li>{result.move1Name}</li>}
                        {result.move2Name && <li>{result.move2Name}</li>}
                        {result.move3Name && <li>{result.move3Name}</li>}
                        {result.move4Name && <li>{result.move4Name}</li>}
                      </ul>
                    </div>
                    
                    <div>
                      <p className="font-bold">OT</p>
                      <p className="mb-2">{result.ot || "Yours"}</p>
                      
                      <p className="font-bold">ID No.</p>
                      <p className="mb-2">{result.idNo || "Unknown"}</p>
                      
                      <p className="font-bold">Gender</p>
                      <p className="mb-2">{result.gender || "Unknown"}</p>
                      
                      <p className="font-bold">Level</p>
                      <p className="mb-2">{result.Level || "Unknown"}</p>
                      
                      <p className="font-bold">Location</p>
                      <p className="mb-2">{result.metLocation || result.eggLocation || "Unknown"}</p>
                      
                      <p className="font-bold">Ball</p>
                      <p className="mb-2">{result.ball || "Unknown"}</p>
                      
                      <p className="font-bold">Item</p>
                      <p className="mb-2">{result.heldItem || "None"}</p>
                      
                      <p className="font-bold">Language</p>
                      <p className="mb-2">{result.language || "Unknown"}</p>
                      
                      <p className="font-bold">Shiny?</p>
                      <p className="mb-2" style={{
                        color: result.shiny === 'Can be shiny' ? '#D0AF00' : 'inherit',
                        fontWeight: result.shiny === 'Can be shiny' ? 'bold' : 'normal'
                      }}>
                        {result.shiny || "No"}
                      </p>
                      
                      <p className="font-bold">Obtainable</p>
                      <p className="mb-2" style={{
                        color: result.giftRedeemable === 'May be infinite' ? '#009688' : 
                              result.giftRedeemable === 'Infinite' ? '#009688' : 
                              result.giftRedeemable === 'Once per day' ? '#673AB7' : 'inherit',
                        fontWeight: ['May be infinite', 'Infinite', 'Once per day'].includes(result.giftRedeemable) ? 'bold' : 'normal'
                      }}>
                        {result.giftRedeemable || "Unknown"}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white text-gray-900 rounded-lg shadow-xl p-6">
                  <h2 className="text-xl font-bold mb-4">Card Information</h2>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <p className="font-bold">Wonder Card ID</p>
                      <p className="mb-2">{result.wcId || "Unknown"}</p>
                      
                      <p className="font-bold">Card Type</p>
                      <p className="mb-2">{result.cardType || "Unknown"}</p>
                      
                      {result.gamesAvailable && (
                        <>
                          <p className="font-bold">Available in</p>
                          <p className="mb-2">{result.gamesAvailable}</p>
                        </>
                      )}
                      
                      {result.dateReceived && (
                        <>
                          <p className="font-bold">Date Received</p>
                          <p className="mb-2">{result.dateReceived}</p>
                        </>
                      )}
                      
                      {result.redemptionText && (
                        <>
                          <p className="font-bold">Redemption Text</p>
                          <div className="bg-gray-100 p-3 rounded-md whitespace-pre-wrap text-sm mt-2">
                            {result.redemptionText}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {result && isItem && (
              <div className="bg-white text-gray-900 rounded-lg shadow-xl p-6 mb-8 max-w-2xl mx-auto">
                <h2 className="text-xl font-bold mb-4">Item Details</h2>
                <div className="grid grid-cols-1 gap-2">
                  {result.item1 && <p>{result.item1}</p>}
                  {result.item2 && <p>{result.item2}</p>}
                  {result.item3 && <p>{result.item3}</p>}
                  {result.item4 && <p>{result.item4}</p>}
                  {result.item5 && <p>{result.item5}</p>}
                  {result.item6 && <p>{result.item6}</p>}
                </div>
              </div>
            )}
            
            {result && (
              <div className="bg-white text-gray-900 rounded-lg shadow-xl p-6 mb-8 max-w-2xl mx-auto">
                <h2 className="text-xl font-bold mb-4">Full Output</h2>
                <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto whitespace-pre-wrap text-sm">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </ErrorBoundary>
      </main>
    </div>
  );
} 