const BASE_URL = "https://pokeapi.co/api/v2"

export interface Pokemon {
  id: number
  name: string
  height: number
  weight: number
  base_experience: number
  sprites: {
    front_default: string
    front_shiny: string
    other: {
      "official-artwork": {
        front_default: string
      }
    }
  }
  types: Array<{
    slot: number
    type: {
      name: string
      url: string
    }
  }>
  stats: Array<{
    base_stat: number
    effort: number
    stat: {
      name: string
      url: string
    }
  }>
  abilities: Array<{
    ability: {
      name: string
      url: string
    }
    is_hidden: boolean
    slot: number
  }>
  moves: Array<{
    move: {
      name: string
      url: string
    }
    version_group_details: Array<{
      level_learned_at: number
      move_learn_method: {
        name: string
        url: string
      }
      version_group: {
        name: string
        url: string
      }
    }>
  }>
}

export interface PokemonListResponse {
  count: number
  next: string | null
  previous: string | null
  results: Array<{
    name: string
    url: string
  }>
}

export interface Type {
  id: number
  name: string
  damage_relations: {
    double_damage_from: Array<{ name: string; url: string }>
    double_damage_to: Array<{ name: string; url: string }>
    half_damage_from: Array<{ name: string; url: string }>
    half_damage_to: Array<{ name: string; url: string }>
    no_damage_from: Array<{ name: string; url: string }>
    no_damage_to: Array<{ name: string; url: string }>
  }
  pokemon: Array<{
    slot: number
    pokemon: {
      name: string
      url: string
    }
  }>
}

export interface EvolutionChain {
  id: number
  baby_trigger_item: any
  chain: {
    evolution_details: Array<{
      gender: number | null
      held_item: { name: string; url: string } | null
      item: { name: string; url: string } | null
      known_move: { name: string; url: string } | null
      known_move_type: { name: string; url: string } | null
      location: { name: string; url: string } | null
      min_affection: number | null
      min_beauty: number | null
      min_happiness: number | null
      min_level: number | null
      needs_overworld_rain: boolean
      party_species: { name: string; url: string } | null
      party_type: { name: string; url: string } | null
      relative_physical_stats: number | null
      time_of_day: string
      trade_species: { name: string; url: string } | null
      trigger: { name: string; url: string }
      turn_upside_down: boolean
    }>
    evolves_to: Array<{
      evolution_details: Array<{
        gender: number | null
        held_item: { name: string; url: string } | null
        item: { name: string; url: string } | null
        known_move: { name: string; url: string } | null
        known_move_type: { name: string; url: string } | null
        location: { name: string; url: string } | null
        min_affection: number | null
        min_beauty: number | null
        min_happiness: number | null
        min_level: number | null
        needs_overworld_rain: boolean
        party_species: { name: string; url: string } | null
        party_type: { name: string; url: string } | null
        relative_physical_stats: number | null
        time_of_day: string
        trade_species: { name: string; url: string } | null
        trigger: { name: string; url: string }
        turn_upside_down: boolean
      }>
      evolves_to: Array<any>
      is_baby: boolean
      species: { name: string; url: string }
    }>
    is_baby: boolean
    species: { name: string; url: string }
  }
}

export const pokemonApi = {
  // Get Pokemon list with pagination
  async getPokemonList(limit = 20, offset = 0): Promise<PokemonListResponse> {
    const response = await fetch(`${BASE_URL}/pokemon?limit=${limit}&offset=${offset}`)
    if (!response.ok) throw new Error("Failed to fetch Pokemon list")
    return response.json()
  },

  // Get individual Pokemon by name or ID
  async getPokemon(nameOrId: string | number): Promise<Pokemon> {
    const response = await fetch(`${BASE_URL}/pokemon/${nameOrId}`)
    if (!response.ok) throw new Error(`Failed to fetch Pokemon: ${nameOrId}`)
    return response.json()
  },

  // Get type information
  async getType(nameOrId: string | number): Promise<Type> {
    const response = await fetch(`${BASE_URL}/type/${nameOrId}`)
    if (!response.ok) throw new Error(`Failed to fetch type: ${nameOrId}`)
    return response.json()
  },

  // Search Pokemon by name
  async searchPokemon(query: string): Promise<PokemonListResponse> {
    const response = await fetch(`${BASE_URL}/pokemon?limit=1000`)
    if (!response.ok) throw new Error("Failed to fetch Pokemon for search")
    const data = await response.json()

    const filtered = data.results.filter((pokemon: any) =>
      pokemon.name.toLowerCase().includes(query.toLowerCase())
    )

    return {
      count: filtered.length,
      next: null,
      previous: null,
      results: filtered,
    }
  },

  // Get Pokemon species for evolution chain
  async getPokemonSpecies(nameOrId: string | number): Promise<any> {
    const response = await fetch(`${BASE_URL}/pokemon-species/${nameOrId}`)
    if (!response.ok) throw new Error(`Failed to fetch Pokemon species: ${nameOrId}`)
    return response.json()
  },

  // Get evolution chain
  async getEvolutionChain(id: number): Promise<EvolutionChain> {
    const response = await fetch(`${BASE_URL}/evolution-chain/${id}`)
    if (!response.ok) throw new Error(`Failed to fetch evolution chain: ${id}`)
    return response.json()
  },
}
