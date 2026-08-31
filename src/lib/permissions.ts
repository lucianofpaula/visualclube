import { createContext, useContext } from "react"

export interface PermissionsContextType {
  allowedFeatureCodes: string[]
  isLocked: boolean
  hasFeature: (featureCode: string) => boolean
  hasAnyFeature: (featureCodes: string[]) => boolean
  openUpgradeModal: (featureName?: string) => void
}

export const PermissionsContext = createContext<PermissionsContextType>({
  allowedFeatureCodes: [],
  isLocked: true,
  hasFeature: () => false,
  hasAnyFeature: () => false,
  openUpgradeModal: () => {},
})

export const usePermissions = () => useContext(PermissionsContext)
