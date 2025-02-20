// pages/pokemon/[name].js
import Image from 'next/image';
import Link from 'next/link';

export default function Pokemon({ pokemon }) {
  const {
    id,
    name,
    base_experience,
    abilities,
    species,
    sprites,
    stats,
    types,
  } = pokemon;

  // Use official artwork if available, falling back to front_default.
  const officialArtwork =
    sprites.other?.['official-artwork']?.front_default || sprites.front_default;

  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="flex flex-col md:flex-row items-center">
        {/* Left Column: Artwork */}
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
        {/* Right Column: Details */}
        <div className="md:w-2/3 mt-4 md:mt-0 md:pl-8">
          <h1 className="text-4xl font-bold mb-2 capitalize">
            {name} <span className="text-gray-500">#{id}</span>
          </h1>
          <p className="mb-2">Base Experience: {base_experience}</p>
          <p className="mb-2">
            Types: {types.map((t) => t.type.name).join(', ')}
          </p>
          <div className="mb-2">
            <h2 className="text-2xl font-semibold">Abilities</h2>
            <ul className="list-disc ml-5">
              {abilities.map((a) => (
                <li key={a.ability.name} className="capitalize">
                  {a.ability.name} {a.is_hidden && '(Hidden)'}
                </li>
              ))}
            </ul>
          </div>
          <Link href="/">
            <a className="text-blue-500 hover:underline">← Back to Pokédex</a>
          </Link>
        </div>
      </div>
      {/* Stats Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Stats</h2>
        <div className="grid grid-cols-2 gap-4">
          {stats.map((s) => (
            <div key={s.stat.name} className="bg-gray-100 p-4 rounded shadow">
              <p className="font-semibold capitalize">{s.stat.name}</p>
              <p>{s.base_stat}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export async function getStaticPaths() {
  // Pre-render Pokémon from generation 1 (first 151). For others, fallback to on-demand generation.
  const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=151');
  const data = await res.json();

  const paths = data.results.map((pokemon) => ({
    params: { name: pokemon.name },
  }));

  return {
    paths,
    fallback: 'blocking', // Pages not generated at build time will be rendered on-demand.
  };
}

export async function getStaticProps({ params }) {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${params.name}`);
  if (!res.ok) {
    return { notFound: true };
  }
  const pokemon = await res.json();

  return {
    props: { pokemon },
    revalidate: 60,
  };
}
