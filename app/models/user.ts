import type { BlueprintCollection } from './blueprintCollection'

export type User = {
	id: string
	username: string
	email: string
	email_verified_at: string | null
	locale: string
	created_at: string
	updated_at: string
	collections: BlueprintCollection[]
}
