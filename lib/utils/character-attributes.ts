import type { GameAttribute, GameItem } from "@/lib/schemas/game-entity-schema"
import type { PlayerCharacter } from "@/lib/schemas/game-schema"
import { calculateDerivedAttributes, getEquipmentBonuses, getTotalDistributableAttributes } from "./formula-parser"

/**
 * Recalculates all character attributes based on current state
 * Should be called when:
 * - Equipment changes
 * - Base attributes change (consuming items)
 * - Level up
 */
export function recalculateCharacterAttributes(
  character: PlayerCharacter,
  universeAttributes: GameAttribute[],
  universeItems: GameItem[],
): {
  totalDistributable: Record<string, number>
  derived: Record<string, number>
} {
  // Get equipment bonuses
  const equipmentBonuses = getEquipmentBonuses(character.equipment, universeItems)

  // Calculate total distributable (base + equipment)
  const totalDistributable = getTotalDistributableAttributes(character.baseAttributes, equipmentBonuses)

  // Calculate derived attributes
  const derived = calculateDerivedAttributes(universeAttributes, character.baseAttributes, equipmentBonuses)

  return { totalDistributable, derived }
}

/**
 * Applies a consumable item's effects to a character
 * Returns the updated character with modified base attributes
 */
export function applyConsumableItem(character: PlayerCharacter, item: GameItem): PlayerCharacter {
  if (item.type !== "consumable") {
    console.error("[v0] Item is not consumable:", item.id)
    return character
  }

  // Apply modifiers to base attributes
  const newBaseAttributes = { ...character.baseAttributes }
  for (const mod of item.attributeModifiers) {
    newBaseAttributes[mod.attributeId] = (newBaseAttributes[mod.attributeId] || 0) + mod.modifier
  }

  // Remove item from inventory
  const newInventory = character.inventory
    .map((slot) => {
      if (slot.itemId === item.id) {
        return { ...slot, quantity: slot.quantity - 1 }
      }
      return slot
    })
    .filter((slot) => slot.quantity > 0)

  return {
    ...character,
    baseAttributes: newBaseAttributes,
    inventory: newInventory,
  }
}

/**
 * Equips an item to a character
 * Returns the updated character
 */
export function equipItem(character: PlayerCharacter, item: GameItem): PlayerCharacter {
  if (item.type !== "equipment" || !item.slot) {
    console.error("[v0] Item is not equipment or has no slot:", item.id)
    return character
  }

  // Unequip current item in slot if any
  const currentEquipped = character.equipment[item.slot]

  // Update equipment
  const newEquipment = {
    ...character.equipment,
    [item.slot]: item.id,
  }

  // Update inventory - remove equipped item, add unequipped item if any
  let newInventory = character.inventory.filter((slot) => {
    if (slot.itemId === item.id) {
      return slot.quantity > 1 // Keep if more than 1
    }
    return true
  })

  // Reduce quantity if keeping
  newInventory = newInventory.map((slot) => {
    if (slot.itemId === item.id) {
      return { ...slot, quantity: slot.quantity - 1 }
    }
    return slot
  })

  // Add unequipped item back to inventory
  if (currentEquipped) {
    const existingSlot = newInventory.find((s) => s.itemId === currentEquipped)
    if (existingSlot) {
      newInventory = newInventory.map((s) => (s.itemId === currentEquipped ? { ...s, quantity: s.quantity + 1 } : s))
    } else {
      newInventory.push({ itemId: currentEquipped, quantity: 1 })
    }
  }

  return {
    ...character,
    equipment: newEquipment,
    inventory: newInventory,
  }
}

/**
 * Unequips an item from a character
 * Returns the updated character
 */
export function unequipItem(character: PlayerCharacter, slot: string): PlayerCharacter {
  const itemId = character.equipment[slot]
  if (!itemId) return character

  // Remove from equipment
  const newEquipment = { ...character.equipment }
  delete newEquipment[slot]

  // Add to inventory
  const existingSlot = character.inventory.find((s) => s.itemId === itemId)
  let newInventory: { itemId: string; quantity: number }[]
  if (existingSlot) {
    newInventory = character.inventory.map((s) => (s.itemId === itemId ? { ...s, quantity: s.quantity + 1 } : s))
  } else {
    newInventory = [...character.inventory, { itemId, quantity: 1 }]
  }

  return {
    ...character,
    equipment: newEquipment,
    inventory: newInventory,
  }
}

/**
 * Adds an item to character inventory
 */
export function addItemToInventory(
  character: PlayerCharacter,
  itemId: string,
  quantity = 1,
  item?: GameItem,
): PlayerCharacter {
  const existingSlot = character.inventory.find((s) => s.itemId === itemId)

  let newInventory: { itemId: string; quantity: number }[]
  if (existingSlot) {
    // Check max stack if item provided
    const maxStack = item?.stackable ? item.maxStack || 99 : 1
    const newQuantity = Math.min(existingSlot.quantity + quantity, maxStack)
    newInventory = character.inventory.map((s) => (s.itemId === itemId ? { ...s, quantity: newQuantity } : s))
  } else {
    newInventory = [...character.inventory, { itemId, quantity }]
  }

  return {
    ...character,
    inventory: newInventory,
  }
}

/**
 * Applies level up to a character
 * Returns character with updated level and available points
 */
export function levelUpCharacter(character: PlayerCharacter, pointsPerLevel: number): PlayerCharacter {
  return {
    ...character,
    level: character.level + 1,
    totalPoints: character.totalPoints + pointsPerLevel,
  }
}
