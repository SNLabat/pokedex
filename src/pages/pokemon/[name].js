// pages/pokemon/[name].js
import Image from 'next/image';
import Link from 'next/link';

export default function PokemonDetail({ pokemon, species }) {
  // Data from /pokemon endpoint
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

  // Data from /pokemon-species endpoint
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

  // Official artwork (falling back to front_default)
  const officialArtwork =
    sprites.other?.['official-artwork']?.front_default || sprites.front_default;

  // Convert height (decimeters) to meters and weight (hectograms) to kg.
  const heightMeters = (height / 10).toFixed(1);
  const weightKg = (weight / 10).toFixed(1);

  // Get the English genus (e.g. "Paradox Pokémon")
  const englishGenus = genera?.find((g) => g.language.name === 'en')?.genus;

  // Get one English Pokédex entry
  const englishEntry =
    flavor_text_entries?.find((entry) => entry.language.name === 'en')?.flavor_text.replace(/\f/g, ' ');

  // Sum of EV yield from stats (each stat's "effort")
  const totalEVYield = stats.reduce((sum, s) => sum + s.effort, 0);

  // Gender info calculation
  let genderInfo;
  if (gender_rate === -1) {
    genderInfo = "Genderless";
  } else {
    const femaleChance = (gender_rate / 8) * 100;
    const maleChance = 100 - femaleChance;
    genderInfo = `Male: ${maleChance.toFixed(0)}%, Female: ${femaleChance.toFixed(0)}%`;
  }

  // Sample Level-Up Moves:
  // Filter moves with level-up method and a level greater than 0; take first 10 for brevity.
  const levelUpMoves = moves.filter(move => 
    move.version_group_details.some(
      d => d.move_learn_method.name === 'level-up' && d.level_learned_at > 0
    )
  ).slice(0, 10);

  return (
    <div className="max-w-5xl mx-auto p-4">
      {/* Header: Artwork and Basic Info */}
      <div className="flex flex-col md:flex-row items-center border-b pb-4 mb-4">
        <div className="md:w-1/3 flex justify-center">
          {officialArtwork && (
            <Image
              src={officialArtwork}
              alt={`${name} artwork`}
              width={300}
              height={300}
              className="object-contain"
            />
          )}
        </div>
        <div className="md:w-2/3 md:pl-8">
          <h1 className="text-4xl font-bold capitalize">
            {name} <span className="text-gray-500">#{id}</span>
          </h1>
          {englishGenus && <p className="italic text-gray-600">{englishGenus}</p>}
          <p className="mt-2">
            <span className="font-semibold">Type:</span> {types.map(t => t.type.name).join(' / ')}
          </p>
          <p>
            <span className="font-semibold">Height:</span> {heightMeters} m
          </p>
          <p>
            <span className="font-semibold">Weight:</span> {weightKg} kg
          </p>
          <p>
            <span className="font-semibold">Abilities:</span>{" "}
            {abilities.map(a => a.ability.name + (a.is_hidden ? " (Hidden)" : "")).join(', ')}
          </p>
        </div>
      </div>

      {/* Training and Breeding Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Training */}
        <div className="border p-4 rounded">
          <h2 className="text-2xl font-semibold mb-2">Training</h2>
          <p>
            <span className="font-semibold">Base Exp:</span> {base_experience}
          </p>
          <p>
            <span className="font-semibold">Catch Rate:</span> {catch_rate} (≈ {(catch_rate / 255 * 100).toFixed(1)}%)
          </p>
          <p>
            <span className="font-semibold">Base Friendship:</span> {base_happiness}
          </p>
          <p>
            <span className="font-semibold">Growth Rate:</span> {growth_rate.name}
          </p>
          <p>
            <span className="font-semibold">Total EV Yield:</span> {totalEVYield}
          </p>
        </div>
        {/* Breeding */}
        <div className="border p-4 rounded">
          <h2 className="text-2xl font-semibold mb-2">Breeding</h2>
          <p>
            <span className="font-semibold">Egg Groups:</span>{" "}
            {egg_groups.map(group => group.name).join(', ')}
          </p>
          <p>
            <span className="font-semibold">Gender:</span> {genderInfo}
          </p>
          <p>
            <span className="font-semibold">Egg Cycles:</span> {hatch_counter} (hatch counter)
          </p>
        </div>
      </div>

      {/* Base Stats */}
      <div className="mb-4">
        <h2 className="text-2xl font-semibold mb-2">Base Stats</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {stats.map(stat => (
            <div key={stat.stat.name} className="flex justify-between bg-gray-100 p-2 rounded">
              <span className="capitalize">{stat.stat.name}</span>
              <span>{stat.base_stat} (EV: {stat.effort})</span>
            </div>
          ))}
        </div>
      </div>

      {/* Pokédex Entry */}
      {englishEntry && (
        <div className="mb-4 border p-4 rounded bg-gray-50">
          <h2 className="text-2xl font-semibold mb-2">Pokédex Entry</h2>
          <p>{englishEntry}</p>
        </div>
      )}

      {/* Sample Level-Up Moves */}
      <div className="mb-4">
        <h2 className="text-2xl font-semibold mb-2">Level-Up Moves (Sample)</h2>
        <ul className="list-disc ml-5">
          {levelUpMoves.map(move => {
            const detail = move.version_group_details.find(
              d => d.move_learn_method.name === 'level-up' && d.level_learned_at > 0
            );
            return (
              <li key={move.move.name} className="capitalize">
                Lv. {detail ? detail.level_learned_at : '?'} – {move.move.name}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Cries */}
      {cries && (cries.latest || cries.legacy) && (
        <div className="mb-4">
          <h2 className="text-2xl font-semibold mb-2">Cry</h2>
          {cries.latest && (
            <div>
              <p>Latest Cry:</p>
              <audio controls src={cries.latest}>
                Your browser does not support audio.
              </audio>
            </div>
          )}
          {cries.legacy && (
            <div>
              <p>Legacy Cry:</p>
              <audio controls src={cries.legacy}>
                Your browser does not support audio.
              </audio>
            </div>
          )}
        </div>
      )}

      {/* Sprites Gallery */}
      <div className="mb-4">
        <h2 className="text-2xl font-semibold mb-2">Sprites</h2>
        <div className="flex flex-wrap gap-4">
          {sprites.front_default && (
            <div className="flex flex-col items-center">
              <img src={sprites.front_default} alt={`${name} front`} className="w-20 h-20 object-contain" />
              <p className="text-sm">Front</p>
            </div>
          )}
          {sprites.back_default && (
            <div className="flex flex-col items-center">
              <img src={sprites.back_default} alt={`${name} back`} className="w-20 h-20 object-contain" />
              <p className="text-sm">Back</p>
            </div>
          )}
          {sprites.front_shiny && (
            <div className="flex flex-col items-center">
              <img src={sprites.front_shiny} alt={`${name} front shiny`} className="w-20 h-20 object-contain" />
              <p className="text-sm">Front Shiny</p>
            </div>
          )}
          {sprites.back_shiny && (
            <div className="flex flex-col items-center">
              <img src={sprites.back_shiny} alt={`${name} back shiny`} className="w-20 h-20 object-contain" />
              <p className="text-sm">Back Shiny</p>
            </div>
          )}
        </div>
      </div>

      <Link href="/">
        <a className="text-blue-500 hover:underline">← Back to National Pokédex</a>
      </Link>
    </div>
  );
}

export async function getStaticPaths() {
  // Pre-render only Pokémon from generation 1 (first 151) for now.
  const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=151');
  const data = await res.json();
  const paths = data.results.map(p => ({
    params: { name: p.name },
  }));
  return { paths, fallback: 'blocking' };
}

export async function getStaticProps({ params }) {
  // Fetch /pokemon data
  const resPokemon = await fetch(`https://pokeapi.co/api/v2/pokemon/${params.name}`);
  if (!resPokemon.ok) {
    return { notFound: true };
  }
  const pokemon = await resPokemon.json();
  
  // Fetch /pokemon-species data for additional details
  const resSpecies = await fetch(pokemon.species.url);
  const species = await resSpecies.json();

  return {
    props: { pokemon, species },
    revalidate: 60,
  };
}