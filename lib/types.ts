export interface Book {
  id: string
  title: string
  author: string
  authorLink: string
  twProgress: string
  twDate: string
  preOrderDate: string
  jpProgress: string
  jpDate: string
  cnStatus: string
  readProgress: string
  yearGroup: string
}

export interface Publisher {
  name: string
  color: string
  books: Book[]
  yearGroups: string[]
}
