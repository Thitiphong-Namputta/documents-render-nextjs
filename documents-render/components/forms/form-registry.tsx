import type { ComponentType } from "react"
import InvoiceForm from "./invoice-form"
import PowerOfAttorneyForm from "./power-of-attorney-form"
import PowerOfAttorneyMultiForm from "./power-of-attorney-multi-form"

export const formRegistry: Record<string, ComponentType> = {
  "invoice": InvoiceForm,
  "power-of-attorney": PowerOfAttorneyForm,
  "power-of-attorney-multi": PowerOfAttorneyMultiForm,
}
