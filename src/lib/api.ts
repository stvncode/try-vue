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
}
