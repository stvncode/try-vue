// Type effectiveness chart
export const typeEffectiveness = {
  normal: { rock: 0.5, ghost: 0, steel: 0.5 },
  fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  grass: {
    fire: 0.5,
    water: 2,
    grass: 0.5,
    poison: 0.5,
    ground: 2,
    flying: 0.5,
    bug: 0.5,
    rock: 2,
    dragon: 0.5,
    steel: 0.5,
  },
  ice: { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  fighting: {
    normal: 2,
    ice: 2,
    poison: 0.5,
    flying: 0.5,
    psychic: 0.5,
    bug: 0.5,
    rock: 2,
    ghost: 0,
    steel: 2,
    fairy: 0.5,
  },
  poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  ground: { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
  flying: { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug: {
    fire: 0.5,
    grass: 2,
    fighting: 0.5,
    poison: 0.5,
    flying: 0.5,
    psychic: 2,
    ghost: 0.5,
    dark: 2,
    steel: 0.5,
    fairy: 0.5,
  },
  rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon: { dragon: 2, steel: 0.5, fairy: 0 },
  dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
  fairy: { fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 },
}

// Calculate type effectiveness
export const calculateTypeEffectiveness = (attackerType: string, defenderTypes: string[]) => {
  let effectiveness = 1

  defenderTypes.forEach((defenderType) => {
    const typeChart = typeEffectiveness[attackerType as keyof typeof typeEffectiveness]
    if (typeChart && typeChart[defenderType as keyof typeof typeChart]) {
      effectiveness *= typeChart[defenderType as keyof typeof typeChart]
    }
  })

  return effectiveness
}

// Get effectiveness text
export const getEffectivenessText = (effectiveness: number) => {
  if (effectiveness >= 2) return "Super effective!"
  if (effectiveness === 1) return "Normal effectiveness"
  if (effectiveness === 0) return "No effect!"
  return "Not very effective..."
}

// Get effectiveness color
export const getEffectivenessColor = (effectiveness: number) => {
  if (effectiveness >= 2) return "text-green-600"
  if (effectiveness === 1) return "text-gray-600"
  if (effectiveness === 0) return "text-red-600"
  return "text-orange-600"
}

// Calculate damage
export const calculateDamage = (
  attacker: any,
  defender: any,
  attackerStats: any,
  defenderStats: any
) => {
  const baseDamage = (((2 * 50) / 5 + 2) * attackerStats.attack) / defenderStats.defense / 50 + 2
  const randomFactor = 0.85 + Math.random() * 0.15 // 85-100% random factor

  // Calculate type effectiveness
  const attackerType = attacker.types[0].type.name
  const defenderTypes = defender.types.map((t: any) => t.type.name)
  const effectiveness = calculateTypeEffectiveness(attackerType, defenderTypes)

  const finalDamage = Math.floor(baseDamage * randomFactor * effectiveness)

  return {
    damage: finalDamage,
    effectiveness,
    effectivenessText: getEffectivenessText(effectiveness),
    effectivenessColor: getEffectivenessColor(effectiveness),
  }
}
