"use client"

import * as React from "react"
import {
  Controller,
  FormProvider,
  useFormContext,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form"
import { Label as LabelPrimitive, Slot } from "radix-ui"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

const Form = FormProvider

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = { name: TName }

const FormFieldContext = React.createContext<FormFieldContextValue>({} as FormFieldContextValue)

function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({ ...props }: ControllerProps<TFieldValues, TName>) {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}

function useFormField() {
  const fieldContext = React.useContext(FormFieldContext)
  const { getFieldState, formState } = useFormContext()
  const fieldState = getFieldState(fieldContext.name, formState)
  return { name: fieldContext.name, ...fieldState }
}

const FormItemContext = React.createContext<{ id: string }>({} as { id: string })

function FormItem({ className, ...props }: React.ComponentProps<"div">) {
  const id = React.useId()
  return (
    <FormItemContext.Provider value={{ id }}>
      <div data-slot="form-item" className={cn("grid gap-1.5", className)} {...props} />
    </FormItemContext.Provider>
  )
}

function FormLabel({ className, ...props }: React.ComponentProps<typeof LabelPrimitive.Root>) {
  const { error } = useFormField()
  const { id } = React.useContext(FormItemContext)
  return (
    <Label
      data-slot="form-label"
      htmlFor={id}
      className={cn(error && "text-destructive", className)}
      {...props}
    />
  )
}

function FormControl({ ...props }: React.ComponentPropsWithoutRef<typeof Slot.Root>) {
  const { error } = useFormField()
  const { id } = React.useContext(FormItemContext)
  return (
    <Slot.Root
      id={id}
      aria-invalid={!!error || undefined}
      {...props}
    />
  )
}

function FormMessage({ className, children, ...props }: React.ComponentProps<"p">) {
  const { error } = useFormField()
  const body = error ? String(error.message ?? error) : children
  if (!body) return null
  return (
    <p
      data-slot="form-message"
      className={cn("text-xs text-destructive", className)}
      {...props}
    >
      {body}
    </p>
  )
}

export { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, useFormField }
