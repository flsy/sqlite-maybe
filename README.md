# sqlite-maybe

```typescript
import { verbose } from 'sqlite3';
import { isLeft } from 'fputils';
import { getDatabase, all } from 'sqlite-maybe';

const database = await getDatabase(verbose(), 'users.db');
if (isLeft(database)) {
    return `Cannot connect to database: ${database.value.message}`;
}

const users = await all<IUser[]>(database.value, 'SELECT * FROM users');
if (isLeft(users)) {
    return `Got some database error: ${users.value.message}`;
}

console.log(users.value); // [...]

```
