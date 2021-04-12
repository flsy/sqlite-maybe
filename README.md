# sqlite-maybe

```typescript
import { all } from 'sqlite-maybe';

const users = await all<IUser[]>(db, 'SELECT * FROM users');
if (isLeft(users)) {
  console.log(`Got some database error: ${users.value.message}`);
}


```
