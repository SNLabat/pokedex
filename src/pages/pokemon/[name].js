// pages/pokemon/[name].js
import Image from 'next/image';
import Link from 'next/link';
import styles from '../../styles/Pokemon.module.css'; // Ensure this file exists or remove this import if not needed

export default function Pokemon({ pokemon }) {
  const {
    id,
    name,
    order,
    base_experience,
    abilities,
    cries,
    forms,
    game_indices,
    height,
    held_items,
    location_area_encounters,
    moves,
    species,
    sprites,
    stats,
    types,
    weight,
    is_default,
  } = pokemon;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>
          {name.toUpperCase()} (#{id})
        </h1>
        <p>Order: {order} | Base Experience: {base_experience}</p>
        <p>Default: {is_default ? 'Yes' : 'No'}</p>
      </header>

      {/* Sprites Section */}
      <section className={styles.sprites}>
        <h2>Sprites</h2>
        {sprites && (
          <div className={styles.spriteGrid}>
            {sprites.front_default && (
              <div>
                <p>Front</p>
                <Image src={sprites.front_default} alt={`${name} front`} width={96} height={96} />
              </div>
            )}
            {sprites.back_default && (
              <div>
                <p>Back</p>
                <Image src={sprites.back_default} alt={`${name} back`} width={96} height={96} />
              </div>
            )}
            {sprites.front_shiny && (
              <div>
                <p>Front Shiny</p>
                <Image src={sprites.front_shiny} alt={`${name} front shiny`} width={96} height={96} />
              </div>
            )}
            {sprites.back_shiny && (
              <div>
                <p>Back Shiny</p>
                <Image src={sprites.back_shiny} alt={`${name} back shiny`} width={96} height={96} />
              </div>
            )}
            {sprites.other?.['official-artwork']?.front_default && (
              <div>
                <p>Official Artwork</p>
                <Image 
                  src={sprites.other['official-artwork'].front_default} 
                  alt={`${name} official artwork`} 
                  width={250} 
                  height={250} 
                />
              </div>
            )}
          </div>
        )}
      </section>

      {/* Abilities Section */}
      <section className={styles.abilities}>
        <h2>Abilities</h2>
        <ul>
          {abilities.map((item) => (
            <li key={item.ability.name}>
              {item.ability.name} {item.is_hidden && '(Hidden)'} (Slot: {item.slot})
            </li>
          ))}
        </ul>
      </section>

      {/* Cries Section */}
      <section className={styles.cries}>
        <h2>Cries</h2>
        {cries && (
          <div>
            {cries.latest && (
              <div>
                <p>Latest Cry:</p>
                <audio controls src={cries.latest}>
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}
            {cries.legacy && (
              <div>
                <p>Legacy Cry:</p>
                <audio controls src={cries.legacy}>
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Forms Section */}
      <section className={styles.forms}>
        <h2>Forms</h2>
        <ul>
          {forms.map((form) => (
            <li key={form.name}>
              <Link href={form.url}>
                {form.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Game Indices Section */}
      <section className={styles.gameIndices}>
        <h2>Game Indices</h2>
        <ul>
          {game_indices.map((gi, idx) => (
            <li key={idx}>
              Game Index: {gi.game_index} — Version: {gi.version.name}
            </li>
          ))}
        </ul>
      </section>

      {/* Physical Attributes */}
      <section className={styles.physical}>
        <h2>Physical Attributes</h2>
        <p>Height: {height} decimeters</p>
        <p>Weight: {weight} hectograms</p>
      </section>

      {/* Held Items Section */}
      <section className={styles.heldItems}>
        <h2>Held Items</h2>
        {held_items.length > 0 ? (
          held_items.map((item) => (
            <div key={item.item.name} className={styles.heldItem}>
              <h3>{item.item.name}</h3>
              <ul>
                {item.version_details.map((vd, idx) => (
                  <li key={idx}>
                    Version: {vd.version.name} — Rarity: {vd.rarity}
                  </li>
                ))}
              </ul>
            </div>
          ))
        ) : (
          <p>No held items.</p>
        )}
      </section>

      {/* Moves Section */}
      <section className={styles.moves}>
        <h2>Moves</h2>
        {moves.map((moveItem) => (
          <div key={moveItem.move.name} className={styles.move}>
            <h3>{moveItem.move.name}</h3>
            <ul>
              {moveItem.version_group_details.map((detail, idx) => (
                <li key={idx}>
                  Learned at level {detail.level_learned_at} via {detail.move_learn_method.name} in group {detail.version_group.name}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      {/* Stats Section */}
      <section className={styles.stats}>
        <h2>Stats</h2>
        <ul>
          {stats.map((stat) => (
            <li key={stat.stat.name}>
              {stat.stat.name.toUpperCase()}: {stat.base_stat} (Effort: {stat.effort})
            </li>
          ))}
        </ul>
      </section>

      {/* Types Section */}
      <section className={styles.types}>
        <h2>Types</h2>
        <ul>
          {types.map((typeInfo) => (
            <li key={typeInfo.type.name}>{typeInfo.type.name}</li>
          ))}
        </ul>
      </section>

      {/* Species and Encounters */}
      <section className={styles.extra}>
        <h2>Extra Info</h2>
        <p>
          Species:{' '}
          <Link href={species.url}>
            {species.name}
          </Link>
        </p>
        <p>
          Location Encounters:{' '}
          <a href={location_area_encounters} target="_blank" rel="noopener noreferrer">
            {location_area_encounters}
          </a>
        </p>
      </section>
    </div>
  );
}

export async function getStaticPaths() {
  // Pre-render only generation 1 Pokémon (first 151)
  const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=151');
  const data = await res.json();

  const paths = data.results.map((pokemon) => ({
    params: { name: pokemon.name },
  }));

  return {
    paths,
    fallback: 'blocking',
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
