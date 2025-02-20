// pages/pokemon/[name].js
import Image from 'next/image';
import Link from 'next/link';

export default function PokemonDetail({ pokemon, species }) {
  const {
    id,
    name,
    base_experience,
    abilities,
    sprites,
    stats,
    types,
    height,
    weight,
    moves,
    cries,
  } = pokemon;

  const {
    catch_rate,
    base_happiness,
    egg_groups,
    gender_rate,
    hatch_counter,
    flavor_text_entries,
    growth_rate,
    genera,
  } = species;

  const officialArtwork = sprites.other?.['official-artwork']?.front_default || sprites.front_default;
  const heightMeters = (height / 10).toFixed(1);
  const weightKg = (weight / 10).toFixed(1);
  const englishGenus = genera?.find((g) => g.language.name === 'en')?.genus;
  const englishEntry = flavor_text_entries?.find((entry) => entry.language.name === 'en')?.flavor_text.replace(/\f/g, ' ');
  const totalEVYield = stats.reduce((sum, s) => sum + s.effort, 0);

  // Gender calculation
  let genderInfo;
  if (gender_rate === -1) {
    genderInfo = "Genderless";
  } else {
    const femaleChance = (gender_rate / 8) * 100;
    const maleChance = 100 - femaleChance;
    genderInfo = `♂ ${maleChance}% / ♀ ${femaleChance}%`;
  }

  // Type colors mapping
  const typeColors = {
    normal: 'bg-gray-400',
    fire: 'bg-red-500',
    water: 'bg-blue-500',
    electric: 'bg-yellow-400',
    grass: 'bg-green-500',
    ice: 'bg-blue-200',
    fighting: 'bg-red-700',
    poison: 'bg-purple-500',
    ground: 'bg-yellow-600',
    flying: 'bg-blue-300',
    psychic: 'bg-pink-500',
    bug: 'bg-green-400',
    rock: 'bg-yellow-700',
    ghost: 'bg-purple-700',
    dragon: 'bg-purple-600',
    dark: 'bg-gray-700',
    steel: 'bg-gray-500',
    fairy: 'bg-pink-300',
  };

  // Get level-up moves
  const levelUpMoves = moves
    .filter(move => 
      move.version_group_details.some(
        d => d.move_learn_method.name === 'level-up' && d.level_learned_at > 0
      )
    )
    .sort((a, b) => {
      const levelA = Math.min(...a.version_group_details.map(d => d.level_learned_at));
      const levelB = Math.min(...b.version_group_details.map(d => d.level_learned_at));
      return levelA - levelB;
    })
    .slice(0, 10);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto p-4">
        {/* Top Navigation */}
        <Link href="/">
          <a className="inline-flex items-center text-red-400 hover:text-red-300 mb-6">
            ← Back to National Pokédex
          </a>
        </Link>

        {/* Main Content Card */}
        <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
          {/* Header with Pokemon Image and Basic Info */}
          <div className="bg-red-600 p-6">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="md:w-1/3">
                {officialArtwork && (
                  <div className="relative w-64 h-64">
                    <Image
                      src={officialArtwork}
                      alt={`${name} artwork`}
                      layout="fill"
                      objectFit="contain"
                      className="drop-shadow-2xl"
                    />
                  </div>
                )}
              </div>
              
              <div className="md:w-2/3 text-center md:text-left">
                <p className="text-gray-300 mb-2">#{id.toString().padStart(3, '0')}</p>
                <h1 className="text-4xl font-bold capitalize mb-2">{name}</h1>
                {englishGenus && <p className="text-xl text-gray-200 mb-4">{englishGenus}</p>}
                
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  {types.map((type) => (
                    <span
                      key={type.type.name}
                      className={`${typeColors[type.type.name]} px-4 py-1 rounded-full text-white capitalize`}
                    >
                      {type.type.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Content Sections */}
          <div className="p-6">
            {/* Pokédex Entry */}
            {englishEntry && (
              <div className="bg-gray-700 rounded-lg p-6 mb-6">
                <p className="text-gray-200 italic">{englishEntry}</p>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-700 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Base Stats</h2>
                {stats.map((stat) => (
                  <div key={stat.stat.name} className="mb-4">
                    <div className="flex justify-between mb-1">
                      <span className="capitalize text-gray-300">{stat.stat.name}</span>
                      <span className="text-white">{stat.base_stat}</span>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <div
                        className="bg-red-500 rounded-full h-2"
                        style={{ width: `${(stat.base_stat / 255) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Training Info */}
              <div className="bg-gray-700 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Training</h2>
                <div className="space-y-2">
                  <p><span className="text-gray-300">Base EXP:</span> {base_experience}</p>
                  <p><span className="text-gray-300">Catch Rate:</span> {catch_rate} ({(catch_rate / 255 * 100).toFixed(1)}%)</p>
                  <p><span className="text-gray-300">Base Happiness:</span> {base_happiness}</p>
                  <p><span className="text-gray-300">Growth Rate:</span> {growth_rate.name}</p>
                  <p><span className="text-gray-300">EV Yield:</span> {totalEVYield}</p>
                </div>
              </div>
            </div>

            {/* Physical Characteristics & Breeding */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-700 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Shield className="mr-2" />
                  Physical Characteristics
                </h2>
                <div className="space-y-2">
                  <p><span className="text-gray-300">Height:</span> {heightMeters} m</p>
                  <p><span className="text-gray-300">Weight:</span> {weightKg} kg</p>
                  <p><span className="text-gray-300">Abilities:</span></p>
                  <ul className="list-disc ml-5">
                    {abilities.map((ability) => (
                      <li key={ability.ability.name} className="capitalize">
                        {ability.ability.name} {ability.is_hidden && <span className="text-gray-400">(Hidden)</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-gray-700 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Heart className="mr-2" />
                  Breeding
                </h2>
                <div className="space-y-2">
                  <p>
                    <span className="text-gray-300">Gender Ratio:</span> {genderInfo}
                  </p>
                  <p>
                    <span className="text-gray-300">Egg Groups:</span>{" "}
                    {egg_groups.map(group => group.name).join(', ')}
                  </p>
                  <p>
                    <span className="text-gray-300">Hatch Steps:</span>{" "}
                    {hatch_counter * 255}
                  </p>
                </div>
              </div>
            </div>

            {/* Moves */}
            <div className="bg-gray-700 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Level-up Moves</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {levelUpMoves.map(move => {
                  const detail = move.version_group_details.find(
                    d => d.move_learn_method.name === 'level-up' && d.level_learned_at > 0
                  );
                  return (
                    <div key={move.move.name} className="bg-gray-600 rounded p-3">
                      <p className="text-sm text-gray-300">Level {detail?.level_learned_at}</p>
                      <p className="capitalize">{move.move.name.replace('-', ' ')}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sprites Gallery */}
            <div className="bg-gray-700 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Sprites</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {sprites.front_default && (
                  <div className="flex flex-col items-center bg-gray-600 rounded p-4">
                    <img src={sprites.front_default} alt={`${name} front`} className="w-20 h-20 object-contain" />
                    <p className="text-sm mt-2">Front Default</p>
                  </div>
                )}
                {sprites.back_default && (
                  <div className="flex flex-col items-center bg-gray-600 rounded p-4">
                    <img src={sprites.back_default} alt={`${name} back`} className="w-20 h-20 object-contain" />
                    <p className="text-sm mt-2">Back Default</p>
                  </div>
                )}
                {sprites.front_shiny && (
                  <div className="flex flex-col items-center bg-gray-600 rounded p-4">
                    <img src={sprites.front_shiny} alt={`${name} front shiny`} className="w-20 h-20 object-contain" />
                    <p className="text-sm mt-2">Front Shiny</p>
                  </div>
                )}
                {sprites.back_shiny && (
                  <div className="flex flex-col items-center bg-gray-600 rounded p-4">
                    <img src={sprites.back_shiny} alt={`${name} back shiny`} className="w-20 h-20 object-contain" />
                    <p className="text-sm mt-2">Back Shiny</p>
                  </div>
                )}
              </div>
            </div>

            {/* Cries */}
            {cries && (cries.latest || cries.legacy) && (
              <div className="bg-gray-700 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Volume2 className="mr-2" />
                  Pokémon Cries
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {cries.latest && (
                    <div className="bg-gray-600 rounded p-4">
                      <p className="mb-2">Latest Cry</p>
                      <audio controls src={cries.latest} className="w-full">
                        Your browser does not support audio.
                      </audio>
                    </div>
                  )}
                  {cries.legacy && (
                    <div className="bg-gray-600 rounded p-4">
                      <p className="mb-2">Classic Cry</p>
                      <audio controls src={cries.legacy} className="w-full">
                        Your browser does not support audio.
                      </audio>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export async function getStaticPaths() {
  const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=151');
  const data = await res.json();
  const paths = data.results.map(p => ({
    params: { name: p.name },
  }));
  return { paths, fallback: 'blocking' };
}

export async function getStaticProps({ params }) {
  try {
    const [resPokemon, resSpecies] = await Promise.all([
      fetch(`https://pokeapi.co/api/v2/pokemon/${params.name}`),
      fetch(`https://pokeapi.co/api/v2/pokemon-species/${params.name}`)
    ]);

    if (!resPokemon.ok || !resSpecies.ok) {
      return { notFound: true };
    }

    const [pokemon, species] = await Promise.all([
      resPokemon.json(), resSpecies.json()
    ]);

    return {
      props: {
        pokemon,
        species,
      },
      // Revalidate once per hour
      revalidate: 3600,
    };
  } catch (error) {
    console.error('Error fetching Pokemon data:', error);
    return { notFound: true };
  }
}