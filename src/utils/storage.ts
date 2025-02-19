const COLUMN_CONFIG_PREFIX = 'table_columns_'

export const getTableColumnsFromStorage = (tableName: string) => {
  try {
    const key = COLUMN_CONFIG_PREFIX + tableName
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : null
  } catch (error) {
    console.error('Failed to get columns from storage:', error)
    return null
  }
}

export const saveTableColumnsToStorage = (tableName: string, columns: any[]) => {
  try {
    const key = COLUMN_CONFIG_PREFIX + tableName
    localStorage.setItem(key, JSON.stringify(columns))
  } catch (error) {
    console.error('Failed to save columns to storage:', error)
  }
}
