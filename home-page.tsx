// Updated DATABASE_URL logic to detect database.xlsx
const DATABASE_URL = import.meta.glob('/assets/database.xlsx') || import.meta.glob('/src/**/database.xlsx') || '';