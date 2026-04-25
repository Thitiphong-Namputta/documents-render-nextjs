export type Province = { id: number; name_th: string }
export type District = { id: number; name_th: string; province_id: number }
export type SubDistrict = { id: number; name_th: string; district_id: number }

let provincesCache: Province[] | null = null
let districtsCache: District[] | null = null
let subDistrictsCache: SubDistrict[] | null = null

export async function loadProvinces(): Promise<Province[]> {
  if (provincesCache) return provincesCache
  provincesCache = await fetch("/provinces.json").then(r => r.json())
  return provincesCache!
}

export async function loadDistricts(): Promise<District[]> {
  if (districtsCache) return districtsCache
  districtsCache = await fetch("/districts.json").then(r => r.json())
  return districtsCache!
}

export async function loadSubDistricts(): Promise<SubDistrict[]> {
  if (subDistrictsCache) return subDistrictsCache
  subDistrictsCache = await fetch("/sub-districts.json").then(r => r.json())
  return subDistrictsCache!
}
